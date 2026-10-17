/* Live-site review for https://dat-2k2.github.io
 *
 *   cd tests && npm install && npm run check            # against the live URL
 *   BASE_URL=http://127.0.0.1:8765 npm run check        # against a local server
 *   CHROMIUM_PATH=/path/to/chrome npm run check         # use a specific browser binary
 *
 * What it does: screenshots at 1440 / 390 in light and dark into ../review/,
 * fails on console errors, horizontal scroll at 390, broken links, a theme
 * toggle that doesn't change the theme, and serious/critical axe-core issues.
 */
const fs = require("fs");
const path = require("path");
const { chromium } = require("playwright");
const axeSource = fs.readFileSync(require.resolve("axe-core/axe.min.js"), "utf8");

const BASE_URL = process.env.BASE_URL || "https://dat-2k2.github.io";
const OUT = path.resolve(__dirname, "..", "review");
fs.mkdirSync(OUT, { recursive: true });

const PAGES = [["", "home"], ["projects/", "projects"]];
const VIEWPORTS = [
  { name: "desktop-1440", width: 1440, height: 900 },
  { name: "mobile-390", width: 390, height: 844 },
];
const SCHEMES = ["light", "dark"];

const results = [];
const problems = [];
const log = (ok, msg) => {
  results.push({ ok, msg });
  console.log(`${ok ? "PASS" : "FAIL"}  ${msg}`);
  if (!ok) problems.push(msg);
};

async function scrollThrough(page) {
  const h = await page.evaluate(() => document.documentElement.scrollHeight);
  for (let y = 0; y < h; y += 600) { await page.evaluate((v) => window.scrollTo(0, v), y); await page.waitForTimeout(60); }
  await page.evaluate(() => window.scrollTo(0, 0));
  // wait for every (lazy) image to finish loading
  // (hidden images never load; give up after 4 s so a display:none thumbnail can't hang the run)
  await page.evaluate(() => Promise.race([
    Promise.all([...document.images].filter((i) => i.offsetParent !== null).map((i) => (i.complete ? null : new Promise((r) => { i.onload = i.onerror = r; })))),
    new Promise((r) => setTimeout(r, 4000)),
  ]));
  await page.waitForTimeout(400);
}

async function checkLink(href, ctx) {
  if (href.startsWith("mailto:")) {
    const addr = href.slice(7).split("?")[0];
    return /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(addr) ? { ok: true, note: "mailto well-formed" } : { ok: false, note: "bad mailto" };
  }
  if (href.startsWith("#")) {
    return { ok: true, note: "fragment" };
  }
  try {
    let res = await ctx.request.get(href, { maxRedirects: 5, timeout: 20000, failOnStatusCode: false });
    let status = res.status();
    // LinkedIn answers automated requests with 999; the URL itself is valid.
    if (status === 999 && /linkedin\.com/.test(href)) return { ok: true, note: "HTTP 999 (LinkedIn bot wall; URL valid)" };
    if (status === 403 || status === 405) {
      res = await ctx.request.get(href, { maxRedirects: 5, timeout: 20000, failOnStatusCode: false, headers: { "User-Agent": "Mozilla/5.0 (X11; Linux x86_64) Chrome/130 Safari/537.36" } });
      status = res.status();
    }
    return { ok: status >= 200 && status < 400, note: `HTTP ${status}` };
  } catch (e) {
    return { ok: false, note: String(e.message || e).split("\n")[0] };
  }
}

(async () => {
  const browser = await chromium.launch(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {});
  const t0 = Date.now();

  // --- 1. Screenshots + console + horizontal scroll, per viewport/scheme ---
  for (const [pagePath, pageName] of PAGES) for (const vp of VIEWPORTS) {
    for (const scheme of SCHEMES) {
      const ctx = await browser.newContext({ viewport: { width: vp.width, height: vp.height }, colorScheme: scheme, deviceScaleFactor: 1 });
      const page = await ctx.newPage();
      const errors = [];
      page.on("console", (m) => { if (m.type() === "error") errors.push(m.text()); });
      page.on("pageerror", (e) => errors.push(String(e)));
      page.on("requestfailed", (r) => errors.push(`request failed: ${r.url()} (${r.failure() && r.failure().errorText})`));
      const resp = await page.goto(BASE_URL + "/" + pagePath, { waitUntil: "networkidle", timeout: 60000 });
      log(resp && resp.ok(), `${pageName} ${vp.name} ${scheme}: GET /${pagePath} → HTTP ${resp && resp.status()}`);
      await page.evaluate(() => document.fonts.ready);
      // scroll through once so lazy images load, then reveal everything so the screenshot isn't half-faded
      await scrollThrough(page);
      await page.evaluate(() => document.querySelectorAll(".reveal").forEach((el) => el.classList.add("in")));
      await page.waitForTimeout(1200);
      if (process.env.DEBUG_IMAGES) console.log("      images:", JSON.stringify(await page.$$eval("img", (els) => els.map((i) => [i.getAttribute("src").split("/").pop(), i.complete, i.naturalWidth, i.clientWidth, getComputedStyle(i).visibility, getComputedStyle(i.parentElement).opacity]))));
      // force image decode, and warm the raster with a throwaway capture (async-decoded images can
      // otherwise come out blank in a full-page screenshot)
      await page.evaluate(() => Promise.race([
        Promise.all([...document.images].filter((i) => i.offsetParent !== null).map((i) => i.decode().catch(() => {}))),
        new Promise((r) => setTimeout(r, 3000)),
      ]));
      await page.screenshot({ fullPage: true });
      await page.waitForTimeout(300);
      const file = path.join(OUT, `${pageName === "home" ? "" : pageName + "-"}${vp.name}-${scheme}.png`);
      await page.screenshot({ path: file, fullPage: true });
      console.log(`      screenshot → ${path.relative(process.cwd(), file)}`);
      log(errors.length === 0, `${pageName} ${vp.name} ${scheme}: no console errors${errors.length ? " — " + errors.join(" | ") : ""}`);
      const [sw, iw] = await page.evaluate(() => [document.documentElement.scrollWidth, window.innerWidth]);
      log(sw <= iw, `${pageName} ${vp.name} ${scheme}: no horizontal scroll (scrollWidth ${sw} ≤ innerWidth ${iw})`);
      const applied = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);
      const expectDark = scheme === "dark";
      const isDark = /rgb\(11, 14, 20\)/.test(applied);
      log(isDark === expectDark, `${pageName} ${vp.name} ${scheme}: prefers-color-scheme honoured (body bg ${applied})`);
      await ctx.close();
    }
  }

  // --- 2. Links, theme toggle, axe (desktop light) ------------------------
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, colorScheme: "light" });
  const page = await ctx.newPage();
  const checked = new Set();
  for (const [pagePath, pageName] of PAGES) {
    await page.goto(BASE_URL + "/" + pagePath, { waitUntil: "networkidle", timeout: 60000 });
    await scrollThrough(page);
    const hrefs = await page.$$eval("a[href]", (as) => [...new Set(as.map((a) => a.getAttribute("href")))]);
    for (const href of hrefs) {
      if (href.startsWith("#")) {
        const id = href.slice(1);
        const exists = await page.evaluate((i) => !!document.getElementById(i), id);
        log(exists, `${pageName}: link ${href}: target element exists`);
        continue;
      }
      const abs = new URL(href, BASE_URL + "/" + pagePath).href;
      if (checked.has(abs)) continue;
      checked.add(abs);
      const r = await checkLink(abs, ctx);
      log(r.ok, `${pageName}: link ${href}: ${r.note}`);
    }
    // Images: every visible <img> must have loaded with real dimensions and have alt text.
    const imgs = await page.$$eval("img", (els) => els.filter((i) => i.offsetParent !== null).map((i) => ({ src: i.getAttribute("src"), ok: i.complete && i.naturalWidth > 0, alt: i.getAttribute("alt") })));
    for (const im of imgs) log(im.ok && typeof im.alt === "string" && im.alt.length > 0, `${pageName}: image ${im.src}: ${im.ok ? "loaded" : "FAILED to load"}${im.alt ? "" : ", missing alt"}`);
  }
  await page.goto(BASE_URL + "/", { waitUntil: "networkidle", timeout: 60000 });

  // Theme toggle: click → data-theme set, bg changes, persisted, click back.
  const before = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);
  await page.click("#theme-toggle");
  await page.waitForTimeout(250);
  const after = await page.evaluate(() => [document.documentElement.getAttribute("data-theme"), getComputedStyle(document.body).backgroundColor, localStorage.getItem("theme")]);
  log(after[0] === "dark" && after[1] !== before && after[2] === "dark", `theme toggle: light → dark (data-theme=${after[0]}, bg ${before} → ${after[1]}, saved=${after[2]})`);
  await page.reload({ waitUntil: "networkidle" });
  const persisted = await page.evaluate(() => document.documentElement.getAttribute("data-theme"));
  log(persisted === "dark", `theme toggle: choice persists across reload (data-theme=${persisted})`);
  await page.click("#theme-toggle");
  const back = await page.evaluate(() => document.documentElement.getAttribute("data-theme"));
  log(back === "light", `theme toggle: dark → light (data-theme=${back})`);
  const label = await page.getAttribute("#theme-toggle", "aria-label");
  log(/Switch to dark theme/.test(label || ""), `theme toggle: aria-label updates ("${label}")`);

  // Reduced motion: reveal elements must be visible without animation.
  const rm = await browser.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: "reduce" });
  const rmPage = await rm.newPage();
  await rmPage.goto(BASE_URL + "/", { waitUntil: "networkidle" });
  const hidden = await rmPage.$$eval(".reveal", (els) => els.filter((e) => getComputedStyle(e).opacity !== "1").length);
  log(hidden === 0, `prefers-reduced-motion: all ${await rmPage.$$eval(".reveal", (e) => e.length)} reveal sections fully visible without scrolling (${hidden} hidden)`);
  await rm.close();

  // axe-core
  for (const [pagePath, pageName] of PAGES) for (const scheme of SCHEMES) {
    const actx = await browser.newContext({ viewport: { width: 1440, height: 900 }, colorScheme: scheme });
    const apage = await actx.newPage();
    await apage.goto(BASE_URL + "/" + pagePath, { waitUntil: "networkidle" });
    await apage.evaluate(() => document.querySelectorAll(".reveal").forEach((el) => el.classList.add("in")));
    await apage.waitForTimeout(1200); // let the staggered reveal finish so axe samples final colours
    await apage.addScriptTag({ content: axeSource });
    const axe = await apage.evaluate(async () => await window.axe.run(document, { runOnly: { type: "tag", values: ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "best-practice"] } }));
    const serious = axe.violations.filter((v) => v.impact === "serious" || v.impact === "critical");
    log(serious.length === 0, `axe-core ${pageName} (${scheme}): ${axe.violations.length} violation rule(s), ${serious.length} serious/critical, ${axe.passes.length} rules passed`);
    for (const v of axe.violations) console.log(`      [${v.impact}] ${v.id}: ${v.help} — ${v.nodes.length} node(s): ${v.nodes.slice(0, 3).map((n) => n.target.join(" ")).join("; ")}`);
    fs.writeFileSync(path.join(OUT, `axe-${pageName === "home" ? "" : pageName + "-"}${scheme}.json`), JSON.stringify(axe.violations, null, 2));
    await actx.close();
  }

  await ctx.close();
  await browser.close();

  const summary = {
    url: BASE_URL,
    ranAt: new Date().toISOString(),
    durationMs: Date.now() - t0,
    passed: results.filter((r) => r.ok).length,
    failed: problems.length,
    results,
  };
  fs.writeFileSync(path.join(OUT, "results.json"), JSON.stringify(summary, null, 2));
  console.log(`\n${summary.passed} passed, ${summary.failed} failed (${Math.round(summary.durationMs / 1000)}s)`);
  process.exit(problems.length ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(2); });
