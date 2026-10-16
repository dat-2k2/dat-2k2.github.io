(function () {
  "use strict";
  var root = document.documentElement;
  root.classList.add("js");
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // --- Theme toggle -------------------------------------------------
  // The inline <head> script already applied the saved choice before paint.
  var media = window.matchMedia("(prefers-color-scheme: dark)");
  var toggle = document.getElementById("theme-toggle");

  function currentTheme() {
    var set = root.getAttribute("data-theme");
    return set || (media.matches ? "dark" : "light");
  }
  function syncLabel() {
    if (!toggle) return;
    var next = currentTheme() === "dark" ? "light" : "dark";
    toggle.setAttribute("aria-label", "Switch to " + next + " theme");
    toggle.setAttribute("title", "Switch to " + next + " theme");
  }
  if (toggle) {
    toggle.addEventListener("click", function () {
      var next = currentTheme() === "dark" ? "light" : "dark";
      if (!reduce) {
        root.classList.add("theme-switching");
        setTimeout(function () { root.classList.remove("theme-switching"); }, 380);
      }
      root.setAttribute("data-theme", next);
      try { localStorage.setItem("theme", next); } catch (e) { /* private mode */ }
      syncLabel();
    });
    media.addEventListener("change", syncLabel);
    syncLabel();
  }

  // --- Scroll reveal ----------------------------------------------------
  // Items inside each section fade/rise in with a small stagger per parent.
  var REVEAL = [
    ".section-head", ".section-body > .lead", ".about-grid > div",
    ".job", ".card", ".repos > .label", ".repo", ".skill-group",
    ".edu", ".award", ".contact > *", ".site-footer > *"
  ];
  var items = document.querySelectorAll(REVEAL.join(","));
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
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("in");
          io.unobserve(entry.target);
        }
      });
    }, { rootMargin: "0px 0px -6% 0px", threshold: 0.05 });
    items.forEach(function (el) { io.observe(el); });
  }

  // --- Metric count-up ("<30s", "2×", "1.3×", "10×") -------------------
  var metrics = document.querySelectorAll(".metric");
  if (!reduce && "IntersectionObserver" in window && metrics.length) {
    var ease = function (t) { return 1 - Math.pow(1 - t, 3); };
    var run = function (el) {
      var m = el.textContent.match(/^([^\d]*)(\d+(?:\.\d+)?)(.*)$/);
      if (!m) return;
      var prefix = m[1], target = parseFloat(m[2]), suffix = m[3];
      var decimals = (m[2].split(".")[1] || "").length;
      var start = null, dur = 900;
      el.setAttribute("aria-label", el.textContent);
      var frame = function (ts) {
        if (start === null) start = ts;
        var p = Math.min(1, (ts - start) / dur);
        el.textContent = prefix + (target * ease(p)).toFixed(decimals) + suffix;
        if (p < 1) requestAnimationFrame(frame);
      };
      requestAnimationFrame(frame);
    };
    var mo = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) { run(entry.target); mo.unobserve(entry.target); }
      });
    }, { threshold: 0.6 });
    metrics.forEach(function (el) { mo.observe(el); });
  }

  // --- Footer year ----------------------------------------------------
  var year = document.getElementById("year");
  if (year) year.textContent = String(new Date().getFullYear());
})();
