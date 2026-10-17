// Page script: Hanoi clock in the hero tile. Everything else lives in kit/kit.js.
(function () {
  var el = document.getElementById("clock");
  if (!el) return;
  var fmt = new Intl.DateTimeFormat("en-GB", { hour: "2-digit", minute: "2-digit", hour12: false, timeZone: "Asia/Ho_Chi_Minh" });
  function tick() { el.textContent = fmt.format(new Date()); }
  tick();
  setInterval(tick, 15000);
})();
