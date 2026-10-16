/* dat-2k2 UI kit — tiny runtime shared by the sites.
 * Theme toggle (prefers-color-scheme + localStorage), staggered reveal,
 * metric count-up. Include with:  <script src="https://dat-2k2.github.io/kit/kit.js" defer></script>
 * and put this inline in <head> to avoid a flash:
 *   <script>try{var t=localStorage.getItem("theme");if(t==="light"||t==="dark")document.documentElement.setAttribute("data-theme",t)}catch(e){}</script>
 */
(function () {
  "use strict";
  var root = document.documentElement;
  root.classList.add("js");
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var media = window.matchMedia("(prefers-color-scheme: dark)");

  function currentTheme() { return root.getAttribute("data-theme") || (media.matches ? "dark" : "light"); }
  function wireToggle(btn) {
    function syncLabel() {
      var next = currentTheme() === "dark" ? "light" : "dark";
      btn.setAttribute("aria-label", "Switch to " + next + " theme");
      btn.setAttribute("title", "Switch to " + next + " theme");
    }
    btn.addEventListener("click", function () {
      var next = currentTheme() === "dark" ? "light" : "dark";
      if (!reduce) { root.classList.add("theme-switching"); setTimeout(function () { root.classList.remove("theme-switching"); }, 380); }
      root.setAttribute("data-theme", next);
      try { localStorage.setItem("theme", next); } catch (e) {}
      syncLabel();
      root.dispatchEvent(new CustomEvent("themechange", { detail: next }));
    });
    media.addEventListener("change", syncLabel);
    syncLabel();
  }
  document.querySelectorAll(".theme-toggle").forEach(wireToggle);

  // Staggered reveal: add data-reveal to a container, or .reveal to items.
  var items = document.querySelectorAll("[data-reveal] > *, .reveal");
  var lastParent = null, i = 0;
  items.forEach(function (el) {
    if (el.parentNode !== lastParent) { lastParent = el.parentNode; i = 0; }
    el.classList.add("reveal");
    el.style.setProperty("--d", Math.min(i * 70, 420) + "ms");
    i++;
  });
  if (reduce || !("IntersectionObserver" in window)) {
    items.forEach(function (el) { el.classList.add("in"); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } });
    }, { rootMargin: "0px 0px -6% 0px", threshold: 0.05 });
    items.forEach(function (el) { io.observe(el); });
  }

  // Count-up for .metric text like "<30s", "2×", "1.3×", "~21k".
  var metrics = document.querySelectorAll(".metric[data-count]");
  if (!reduce && "IntersectionObserver" in window && metrics.length) {
    var ease = function (t) { return 1 - Math.pow(1 - t, 3); };
    var run = function (el) {
      var m = el.textContent.match(/^([^\d]*)(\d+(?:\.\d+)?)(.*)$/);
      if (!m) return;
      var prefix = m[1], target = parseFloat(m[2]), suffix = m[3], decimals = (m[2].split(".")[1] || "").length, start = null;
      el.setAttribute("aria-label", el.textContent);
      var frame = function (ts) {
        if (start === null) start = ts;
        var p = Math.min(1, (ts - start) / 900);
        el.textContent = prefix + (target * ease(p)).toFixed(decimals) + suffix;
        if (p < 1) requestAnimationFrame(frame);
      };
      requestAnimationFrame(frame);
    };
    var mo = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { if (e.isIntersecting) { run(e.target); mo.unobserve(e.target); } });
    }, { threshold: 0.6 });
    metrics.forEach(function (el) { mo.observe(el); });
  }

  var year = document.getElementById("year");
  if (year) year.textContent = String(new Date().getFullYear());
})();
