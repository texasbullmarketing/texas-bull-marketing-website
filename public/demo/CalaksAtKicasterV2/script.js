(function () {
  var toggle = document.getElementById("navToggle");
  var links = document.getElementById("navLinks");
  if (toggle && links) {
    function setOpen(open) {
      links.classList.toggle("is-open", open);
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
      document.body.style.overflow = open ? "hidden" : "";
    }
    toggle.addEventListener("click", function () {
      setOpen(!links.classList.contains("is-open"));
    });
    links.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", function () { setOpen(false); });
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") setOpen(false);
    });
  }
})();

(function () {
  var modal = document.getElementById("menuModal");
  var openBtns = document.querySelectorAll("[data-open-menu]");
  var closeEls = document.querySelectorAll("[data-close-menu]");
  var tabs = document.querySelectorAll(".menu-modal__tab");
  var panels = document.querySelectorAll("[data-card-panel]");
  var navToggle = document.getElementById("navToggle");
  var navLinks = document.getElementById("navLinks");

  function closeMobileNav() {
    if (!navToggle || !navLinks) return;
    navLinks.classList.remove("is-open");
    navToggle.setAttribute("aria-expanded", "false");
  }

  function setCard(key) {
    tabs.forEach(function (tab) {
      var on = tab.getAttribute("data-card") === key;
      tab.classList.toggle("is-active", on);
      tab.setAttribute("aria-selected", on ? "true" : "false");
    });
    panels.forEach(function (panel) {
      var on = panel.getAttribute("data-card-panel") === key;
      panel.classList.toggle("is-active", on);
      panel.hidden = !on;
    });
  }

  function openMenu() {
    if (!modal) return;
    closeMobileNav();
    modal.hidden = false;
    modal.setAttribute("aria-hidden", "false");
    document.body.classList.add("menu-open");
    document.body.style.overflow = "hidden";
    setCard("kitchen");
    var closeBtn = modal.querySelector(".menu-modal__close");
    if (closeBtn) closeBtn.focus();
  }

  function closeMenu() {
    if (!modal) return;
    modal.hidden = true;
    modal.setAttribute("aria-hidden", "true");
    document.body.classList.remove("menu-open");
    document.body.style.overflow = "";
  }

  openBtns.forEach(function (btn) {
    btn.addEventListener("click", function (e) {
      e.preventDefault();
      openMenu();
    });
  });
  closeEls.forEach(function (el) {
    el.addEventListener("click", closeMenu);
  });
  tabs.forEach(function (tab) {
    tab.addEventListener("click", function () {
      setCard(tab.getAttribute("data-card"));
    });
  });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && modal && !modal.hidden) closeMenu();
  });
})();

(function () {
  var frames = document.querySelectorAll(".hero__frame");
  if (frames.length < 2) return;
  var i = 0;
  setInterval(function () {
    frames[i].classList.remove("is-active");
    i = (i + 1) % frames.length;
    frames[i].classList.add("is-active");
  }, 7000);
})();

(function () {
  var menuTabs = document.querySelectorAll(".menu__tab");
  var menuPanels = document.querySelectorAll("[data-menu-panel]");
  function setMenu(key) {
    menuTabs.forEach(function (tab) {
      var on = tab.getAttribute("data-menu") === key;
      tab.classList.toggle("is-active", on);
      tab.setAttribute("aria-selected", on ? "true" : "false");
    });
    menuPanels.forEach(function (panel) {
      var on = panel.getAttribute("data-menu-panel") === key;
      panel.classList.toggle("is-active", on);
      panel.hidden = !on;
    });
  }
  menuTabs.forEach(function (tab) {
    tab.addEventListener("click", function () { setMenu(tab.getAttribute("data-menu")); });
  });
})();

(function () {
  var overlay = document.getElementById("reserveOverlay");
  var form = document.getElementById("reserveForm");
  var ok = document.getElementById("reserveOk");
  if (!overlay) return;
  function open() {
    overlay.hidden = false;
    document.body.style.overflow = "hidden";
    var first = overlay.querySelector("input, select, textarea, button");
    if (first) first.focus();
  }
  function close() {
    overlay.hidden = true;
    document.body.style.overflow = "";
  }
  document.querySelectorAll("[data-open-reserve]").forEach(function (btn) {
    btn.addEventListener("click", open);
  });
  document.querySelectorAll("[data-close-reserve]").forEach(function (btn) {
    btn.addEventListener("click", close);
  });
  overlay.addEventListener("click", function (e) {
    if (e.target === overlay) close();
  });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && !overlay.hidden) close();
  });
  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      form.querySelectorAll("label, .form-row, .btn, .overlay__or").forEach(function (el) {
        el.hidden = true;
      });
      if (ok) ok.hidden = false;
    });
  }
})();

(function () {
  var STORAGE_KEY = "calaks2-accent";
  var STORAGE_HEX = "calaks2-accent-hex";
  var STORAGE_HEADER = "calaks2-header";
  var CUSTOM_VARS = ["--accent", "--accent-2", "--accent-3", "--accent-deep", "--accent-rgb", "--on-accent"];
  var ACCENTS = { original: "#c9a227", red: "#e10600", green: "#12b85a", cobalt: "#0047ab", yellow: "#e6b800", orange: "#ff5c00", custom: "#c9a227" };
  var ACCENT_KEYS = { original: 1, red: 1, green: 1, cobalt: 1, yellow: 1, orange: 1, custom: 1 };
  var draggingWheel = false;
  function currentAccent() { return document.documentElement.getAttribute("data-accent") || "original"; }
  function currentHex() {
    if (currentAccent() === "custom") {
      try { return localStorage.getItem(STORAGE_HEX) || ACCENTS.original; } catch (e) { return ACCENTS.original; }
    }
    return ACCENTS[currentAccent()] || ACCENTS.original;
  }
  function clearCustomVars() { CUSTOM_VARS.forEach(function (p) { document.documentElement.style.removeProperty(p); }); }
  function hexToRgb(hex) {
    var n = String(hex || "").replace("#", "");
    if (n.length === 3) n = n[0] + n[0] + n[1] + n[1] + n[2] + n[2];
    return { r: parseInt(n.slice(0, 2), 16) || 0, g: parseInt(n.slice(2, 4), 16) || 0, b: parseInt(n.slice(4, 6), 16) || 0 };
  }
  function toHex(n) { var s = Math.max(0, Math.min(255, Math.round(n))).toString(16); return s.length === 1 ? "0" + s : s; }
  function mixHex(hex, toward, t) {
    var a = hexToRgb(hex), b = hexToRgb(toward);
    return "#" + toHex(a.r + (b.r - a.r) * t) + toHex(a.g + (b.g - a.g) * t) + toHex(a.b + (b.b - a.b) * t);
  }
  function hexToHsv(hex) {
    var rgb = hexToRgb(hex);
    var r = rgb.r / 255, g = rgb.g / 255, b = rgb.b / 255;
    var max = Math.max(r, g, b), min = Math.min(r, g, b), d = max - min;
    var h = 0, s = max === 0 ? 0 : d / max, v = max;
    if (d) {
      if (max === r) h = (g - b) / d + (g < b ? 6 : 0);
      else if (max === g) h = (b - r) / d + 2;
      else h = (r - g) / d + 4;
      h *= 60;
    }
    return { h: h, s: s, v: v };
  }
  function hsvToHex(h, s, v) {
    h = ((h % 360) + 360) % 360;
    var c = v * s, x = c * (1 - Math.abs((h / 60) % 2 - 1)), m = v - c;
    var r = 0, g = 0, b = 0;
    if (h < 60) { r = c; g = x; }
    else if (h < 120) { r = x; g = c; }
    else if (h < 180) { g = c; b = x; }
    else if (h < 240) { g = x; b = c; }
    else if (h < 300) { r = x; b = c; }
    else { r = c; b = x; }
    return "#" + toHex((r + m) * 255) + toHex((g + m) * 255) + toHex((b + m) * 255);
  }
  function syncCustomUi(hex, on) {
    var sw = document.getElementById("customSwatch");
    var inp = document.getElementById("themeColor");
    var lab = document.querySelector(".theme-custom");
    var code = document.getElementById("customHex");
    if (sw) sw.style.background = hex || ACCENTS.original;
    if (inp && hex) inp.value = hex;
    if (lab) lab.classList.toggle("is-active", !!on);
    if (code) code.textContent = on && hex ? String(hex).toUpperCase() : "";
  }
  function syncWheel(hex) {
    var hsv = hexToHsv(hex || ACCENTS.original);
    var disc = document.querySelector(".theme-wheel__disc");
    var knob = document.getElementById("themeWheelKnob");
    var wheel = document.getElementById("themeWheel");
    var slider = document.getElementById("themeWheelValue");
    if (wheel) wheel.style.setProperty("--wheel-v", String(hsv.v));
    if (slider && document.activeElement !== slider) slider.value = String(Math.round(hsv.v * 100));
    if (!disc || !knob) return;
    var R = disc.offsetWidth / 2 - 7;
    var rad = hsv.h * Math.PI / 180;
    knob.style.transform = "translate(" + (Math.sin(rad) * hsv.s * R) + "px," + (-Math.cos(rad) * hsv.s * R) + "px)";
  }
  function normalizeHeader(v, fromStorage) {
    if (v === "light" || v === "0") return "light";
    if (v === "black") return "dark";
    if (v === "dark" && !fromStorage) return "dark";
    return "flex";
  }
  function applyHeader(mode, fromStorage) {
    mode = normalizeHeader(mode, fromStorage);
    document.documentElement.setAttribute("data-header", mode);
    try {
      localStorage.setItem(STORAGE_HEADER, mode === "dark" ? "black" : mode);
    } catch (e) {}
    document.querySelectorAll("[data-header-mode]").forEach(function (btn) {
      var on = btn.getAttribute("data-header-mode") === mode;
      btn.setAttribute("aria-pressed", on ? "true" : "false");
      btn.classList.toggle("is-active", on);
    });
  }
  function applyCustomHex(hex, fromWheel) {
    if (!hex) return;
    var rgb = hexToRgb(hex);
    var lum = (0.2126 * rgb.r + 0.7152 * rgb.g + 0.0722 * rgb.b) / 255;
    var root = document.documentElement;
    root.setAttribute("data-accent", "custom");
    root.style.setProperty("--accent", hex);
    root.style.setProperty("--accent-2", mixHex(hex, "#ffffff", 0.22));
    root.style.setProperty("--accent-3", mixHex(hex, "#ffffff", 0.45));
    root.style.setProperty("--accent-deep", mixHex(hex, "#000000", 0.35));
    root.style.setProperty("--accent-rgb", rgb.r + ", " + rgb.g + ", " + rgb.b);
    root.style.setProperty("--on-accent", lum > 0.62 ? "#1a1400" : "#ffffff");
    try { localStorage.setItem(STORAGE_KEY, "custom"); localStorage.setItem(STORAGE_HEX, hex); } catch (e) {}
    var meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute("content", hex);
    document.querySelectorAll("#themeMenu [data-accent]").forEach(function (btn) {
      btn.classList.remove("is-active"); btn.setAttribute("aria-checked", "false");
    });
    syncCustomUi(hex, true);
    if (!fromWheel) syncWheel(hex);
  }
  function applyAccent(name) {
    var key = ACCENT_KEYS[name] ? name : "original";
    if (key === "custom") {
      var hex = "";
      try { hex = localStorage.getItem(STORAGE_HEX) || ""; } catch (e) {}
      if (hex) { applyCustomHex(hex); return; }
      key = "original";
    }
    clearCustomVars();
    if (key === "original") document.documentElement.removeAttribute("data-accent");
    else document.documentElement.setAttribute("data-accent", key);
    try {
      if (key === "original") { localStorage.removeItem(STORAGE_KEY); localStorage.removeItem(STORAGE_HEX); }
      else { localStorage.setItem(STORAGE_KEY, key); localStorage.removeItem(STORAGE_HEX); }
    } catch (e) {}
    var hex = ACCENTS[key] || ACCENTS.original;
    var meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute("content", hex);
    document.querySelectorAll("#themeMenu [data-accent]").forEach(function (btn) {
      var on = btn.getAttribute("data-accent") === key;
      btn.classList.toggle("is-active", on);
      btn.setAttribute("aria-checked", on ? "true" : "false");
    });
    syncCustomUi(ACCENTS.original, false);
    syncWheel(hex);
  }
  function hexFromPointer(e, el) {
    var r = el.getBoundingClientRect();
    var dx = e.clientX - (r.left + r.width / 2);
    var dy = e.clientY - (r.top + r.height / 2);
    var maxR = r.width / 2 - 6;
    var sat = Math.min(1, Math.sqrt(dx * dx + dy * dy) / maxR);
    var hue = Math.atan2(dx, -dy) * 180 / Math.PI;
    if (hue < 0) hue += 360;
    var slider = document.getElementById("themeWheelValue");
    var val = slider ? parseFloat(slider.value) / 100 : 1;
    return hsvToHex(hue, sat, val);
  }
  function bindWheel() {
    var wheel = document.getElementById("themeWheel");
    var slider = document.getElementById("themeWheelValue");
    if (!wheel) return;
    function pick(e) {
      var hex = hexFromPointer(e, wheel);
      applyCustomHex(hex, true);
      syncWheel(hex);
    }
    wheel.onpointerdown = function (e) {
      e.preventDefault();
      e.stopPropagation();
      draggingWheel = true;
      try { wheel.setPointerCapture(e.pointerId); } catch (err) {}
      pick(e);
    };
    wheel.onpointermove = function (e) {
      if (!draggingWheel) return;
      e.preventDefault();
      pick(e);
    };
    wheel.onpointerup = wheel.onpointercancel = function () {
      draggingWheel = false;
    };
    if (slider) {
      slider.onclick = function (e) { e.stopPropagation(); };
      slider.oninput = function (e) {
        e.stopPropagation();
        var hsv = hexToHsv(currentHex());
        var hex = hsvToHex(hsv.h, hsv.s, parseFloat(slider.value) / 100);
        applyCustomHex(hex, true);
        syncWheel(hex);
      };
    }
  }
  function initThemeMenu() {
    var toggle = document.getElementById("themeToggle");
    var menu = document.getElementById("themeMenu");
    if (!toggle || !menu) return;
    applyAccent(currentAccent());
    try { applyHeader(localStorage.getItem(STORAGE_HEADER), true); } catch (e) { applyHeader("flex"); }
    toggle.onclick = function (e) {
      e.stopPropagation();
      var open = toggle.getAttribute("aria-expanded") === "true";
      toggle.setAttribute("aria-expanded", open ? "false" : "true");
      menu.hidden = open;
      if (!open) requestAnimationFrame(function () { syncWheel(currentHex()); });
    };
    menu.querySelectorAll("[data-accent]").forEach(function (btn) {
      btn.onclick = function (e) { e.stopPropagation(); applyAccent(btn.getAttribute("data-accent")); };
    });
    var picker = document.getElementById("themeColor");
    if (picker) {
      picker.onclick = function (e) { e.stopPropagation(); };
      picker.oninput = function (e) { e.stopPropagation(); applyCustomHex(picker.value); };
    }
    document.querySelectorAll("[data-header-mode]").forEach(function (btn) {
      btn.onclick = function (e) {
        e.stopPropagation();
        applyHeader(btn.getAttribute("data-header-mode"));
      };
    });
    bindWheel();
    if (!window.__tbmThemeBound) {
      window.__tbmThemeBound = true;
      document.addEventListener("click", function (e) {
        if (draggingWheel) return;
        var t = document.getElementById("themeToggle");
        var m = document.getElementById("themeMenu");
        if (!t || !m || m.hidden) return;
        if (!m.contains(e.target) && !t.contains(e.target)) {
          m.hidden = true; t.setAttribute("aria-expanded", "false");
        }
      });
      document.addEventListener("keydown", function (e) {
        if (e.key !== "Escape") return;
        var t = document.getElementById("themeToggle");
        var m = document.getElementById("themeMenu");
        if (!t || !m || m.hidden) return;
        m.hidden = true; t.setAttribute("aria-expanded", "false");
      });
    }
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", initThemeMenu);
  else initThemeMenu();
})();
