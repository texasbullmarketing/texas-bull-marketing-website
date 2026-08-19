(function () {
  var toggle = document.getElementById("navToggle");
  var links = document.getElementById("navLinks");
  if (toggle && links) {
    function setOpen(open) {
      links.classList.toggle("is-open", open);
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    }
    toggle.addEventListener("click", function () {
      setOpen(!links.classList.contains("is-open"));
    });
    links.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", function () {
        setOpen(false);
      });
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") setOpen(false);
    });
  }

  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var hero = document.querySelector(".hero");
  var suds = hero && hero.querySelector(".suds");
  if (reduce || !hero || !suds) return;

  var nodes = suds.querySelectorAll("span");
  if (!nodes.length) return;
  suds.classList.add("suds--live");

  var items = [];
  nodes.forEach(function (el, i) {
    items.push({
      el: el,
      ox: 0,
      oy: 0,
      vx: 0,
      vy: 0,
      phase: i * 0.65,
      amp: 10 + (i % 6) * 3
    });
  });

  var px = null;
  var py = null;

  function setPoint(e) {
    var t = e.touches ? e.touches[0] : e;
    if (!t) return;
    var r = hero.getBoundingClientRect();
    px = t.clientX - r.left;
    py = t.clientY - r.top;
  }
  function clearPoint() {
    px = null;
    py = null;
  }

  hero.addEventListener("pointermove", setPoint, { passive: true });
  hero.addEventListener("pointerdown", setPoint, { passive: true });
  hero.addEventListener("pointerleave", clearPoint);
  hero.addEventListener("pointercancel", clearPoint);
  hero.addEventListener("touchmove", setPoint, { passive: true });
  hero.addEventListener("touchend", clearPoint);

  var start = performance.now();
  function tick(now) {
    var t = (now - start) / 1000;
    items.forEach(function (b) {
      var cx = b.el.offsetLeft + b.el.offsetWidth / 2 + b.ox;
      var cy = b.el.offsetTop + b.el.offsetHeight / 2 + b.oy;
      if (px != null) {
        var dx = cx - px;
        var dy = cy - py;
        var d = Math.hypot(dx, dy) || 1;
        var reach = 130 + b.el.offsetWidth * 0.5;
        if (d < reach) {
          var f = (reach - d) / reach;
          b.vx += (dx / d) * f * 4.4;
          b.vy += (dy / d) * f * 4.4;
        }
      }
      var fx = Math.sin(t * 1.15 + b.phase) * b.amp;
      var fy = Math.cos(t * 0.85 + b.phase) * (b.amp + 6);
      b.vx += (fx - b.ox) * 0.025;
      b.vy += (fy - b.oy) * 0.025;
      b.vx *= 0.84;
      b.vy *= 0.84;
      b.ox += b.vx;
      b.oy += b.vy;
      b.el.style.transform = "translate(" + b.ox.toFixed(1) + "px," + b.oy.toFixed(1) + "px)";
    });
    requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
})();
