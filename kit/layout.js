/* dat-2k2 UI kit — layout runtime: collapsible shell sidebar + overlay layers (modal, drawer).
 * Include after the markup:  <script src="https://dat-2k2.github.io/kit/layout.js" defer></script>
 *
 * Shell:   <div class="shell" data-shell> … <button data-shell-toggle aria-controls="side"> …
 *          desktop (>900px): toggles [data-collapsed] (remembered in localStorage "kit:sidebar")
 *          narrow (≤900px):  toggles [data-side-open] (off-canvas panel; Esc / outside click closes)
 *
 * Layers:  Kit.layer.open(el, { modal, returnFocus, onClose, initialFocus })
 *          Kit.layer.close(el)          Kit.layer.top()          Kit.layer.isOpen(el)
 *   modal:true  → role=dialog aria-modal, Tab is trapped, background (Kit.inertRoots) is inert,
 *                 page scroll locked. Use for modals, and for drawers on phones (Kit.isNarrow()).
 *   modal:false → non-blocking (desktop drawer): no trap, page stays usable.
 *   Esc closes the top layer (calls onClose — the app decides, e.g. to confirm a dirty form).
 *   returnFocus: element, CSS selector or function → focus goes back there on close
 *                (selectors/functions survive re-rendering of the trigger).
 */
(function () {
  "use strict";
  var Kit = window.Kit = window.Kit || {};
  var FOCUSABLE = 'a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])';
  Kit.isNarrow = function () { return window.matchMedia("(max-width: 640px)").matches; };
  Kit.inertRoots = function () { return Array.prototype.slice.call(document.querySelectorAll("[data-shell]")); };

  /* ---------- shell sidebar ---------- */
  function store(k, v) { try { if (v === undefined) return localStorage.getItem(k); localStorage.setItem(k, v); } catch (e) { return null; } }
  function wireShell(shell) {
    var wide = window.matchMedia("(min-width: 901px)");
    if (store("kit:sidebar") === "collapsed") shell.setAttribute("data-collapsed", "");
    function sync() {
      var expanded = wide.matches ? !shell.hasAttribute("data-collapsed") : shell.hasAttribute("data-side-open");
      shell.querySelectorAll("[data-shell-toggle]").forEach(function (b) { b.setAttribute("aria-expanded", String(expanded)); });
    }
    shell.addEventListener("click", function (e) {
      var t = e.target.closest("[data-shell-toggle]");
      if (t) {
        if (wide.matches) {
          shell.toggleAttribute("data-collapsed");
          store("kit:sidebar", shell.hasAttribute("data-collapsed") ? "collapsed" : "expanded");
        } else shell.toggleAttribute("data-side-open");
        sync(); return;
      }
      if (!wide.matches && shell.hasAttribute("data-side-open") && !e.target.closest(".shell-side")) { shell.removeAttribute("data-side-open"); sync(); }
      else if (!wide.matches && e.target.closest(".shell-side .side-item")) { shell.removeAttribute("data-side-open"); sync(); }
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && shell.hasAttribute("data-side-open") && !Kit.layer.top()) { shell.removeAttribute("data-side-open"); sync(); }
    });
    wide.addEventListener("change", sync);
    sync();
    Kit.shellSync = sync;
  }

  /* ---------- overlay layers ---------- */
  var stack = [];
  function resolve(x) { if (!x) return null; if (typeof x === "function") return x(); if (typeof x === "string") return document.querySelector(x); return x; }
  function focusables(el) { return Array.prototype.filter.call(el.querySelectorAll(FOCUSABLE), function (n) { return n.offsetParent !== null || n === document.activeElement; }); }
  function applyInert() {
    var anyModal = stack.some(function (l) { return l.modal; });
    Kit.inertRoots().forEach(function (r) {
      var covered = stack.some(function (l) { return l.modal && !r.contains(l.el); });
      if (anyModal && covered) r.setAttribute("inert", ""); else r.removeAttribute("inert");
    });
    // a non-modal layer under a modal one becomes inert too
    stack.forEach(function (l, i) { var above = stack.slice(i + 1).some(function (u) { return u.modal; }); if (above) l.el.setAttribute("inert", ""); else l.el.removeAttribute("inert"); });
    document.documentElement.style.overflow = anyModal ? "hidden" : "";
  }
  Kit.layer = {
    open: function (el, opts) {
      opts = opts || {};
      var existing = stack.find(function (l) { return l.el === el; });
      if (existing) { existing.modal = !!opts.modal; existing.onClose = opts.onClose || existing.onClose; applyInert(); return; }
      var layer = { el: el, modal: !!opts.modal, onClose: opts.onClose, returnFocus: opts.returnFocus || document.activeElement };
      stack.push(layer);
      el.setAttribute("role", el.getAttribute("role") || "dialog");
      el.setAttribute("aria-modal", String(layer.modal));
      applyInert();
      var first = resolve(opts.initialFocus) || el.querySelector("[autofocus]") || focusables(el)[0] || el;
      if (first === el && !el.hasAttribute("tabindex")) el.setAttribute("tabindex", "-1");
      try { first.focus({ preventScroll: true }); } catch (e) { first.focus(); }
    },
    close: function (el) {
      var i = stack.findIndex(function (l) { return l.el === el; });
      if (i < 0) return;
      var layer = stack.splice(i, 1)[0];
      el.removeAttribute("inert");
      applyInert();
      var back = resolve(layer.returnFocus);
      if (back && back.isConnected) { try { back.focus({ preventScroll: true }); } catch (e) { back.focus(); } }
    },
    top: function () { return stack.length ? stack[stack.length - 1].el : null; },
    isOpen: function (el) { return stack.some(function (l) { return l.el === el; }); },
    setModal: function (el, modal) { var l = stack.find(function (x) { return x.el === el; }); if (l) { l.modal = !!modal; el.setAttribute("aria-modal", String(l.modal)); applyInert(); } },
    refresh: applyInert
  };
  document.addEventListener("keydown", function (e) {
    var top = stack[stack.length - 1];
    if (!top) return;
    if (e.key === "Escape") { e.preventDefault(); if (top.onClose) top.onClose("escape"); else Kit.layer.close(top.el); return; }
    if (e.key === "Tab" && top.modal) {
      var f = focusables(top.el); if (!f.length) { e.preventDefault(); return; }
      var first = f[0], last = f[f.length - 1];
      if (!top.el.contains(document.activeElement)) { e.preventDefault(); first.focus(); }
      else if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });

  function boot() { document.querySelectorAll("[data-shell]").forEach(wireShell); }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot); else boot();
})();
