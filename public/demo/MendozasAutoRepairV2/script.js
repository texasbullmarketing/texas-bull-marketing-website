/* Mendoza's Auto Repair demo — EN/ES + HTMX */
(function () {
  "use strict";

  function syncHeadFromResponse(html) {
    if (!html) return;
    var doc;
    try {
      doc = new DOMParser().parseFromString(html, "text/html");
    } catch (e) {
      return;
    }
    if (doc.title) document.title = doc.title;
    var lang = doc.documentElement.getAttribute("lang");
    if (lang) document.documentElement.setAttribute("lang", lang);

    var desc = doc.querySelector('meta[name="description"]');
    var descLive = document.querySelector('meta[name="description"]');
    if (desc && descLive) descLive.setAttribute("content", desc.getAttribute("content") || "");

    var canon = doc.querySelector('link[rel="canonical"]');
    var canonLive = document.querySelector('link[rel="canonical"]');
    if (canon && canonLive) canonLive.setAttribute("href", canon.getAttribute("href") || "");

    document.querySelectorAll('link[rel="alternate"][hreflang]').forEach(function (n) {
      n.remove();
    });
    doc.querySelectorAll('link[rel="alternate"][hreflang]').forEach(function (n) {
      document.head.appendChild(n.cloneNode(true));
    });

    ["og:locale", "og:title", "og:description", "og:url"].forEach(function (prop) {
      var src = doc.querySelector('meta[property="' + prop + '"]');
      var live = document.querySelector('meta[property="' + prop + '"]');
      if (src && live) live.setAttribute("content", src.getAttribute("content") || "");
    });

    document.querySelectorAll('script[type="application/ld+json"]').forEach(function (s) {
      s.remove();
    });
    doc.querySelectorAll('script[type="application/ld+json"]').forEach(function (s) {
      var el = document.createElement("script");
      el.type = "application/ld+json";
      el.textContent = s.textContent;
      document.head.appendChild(el);
    });
  }

  function init() {
    var y = document.getElementById("year");
    if (y) y.textContent = String(new Date().getFullYear());

    var nav = document.getElementById("nav");
    var toggle = document.getElementById("navToggle");
    var links = document.getElementById("navLinks");

    function onScroll() {
      if (nav) nav.classList.toggle("is-scrolled", window.scrollY > 24);
    }
    if (window.__marOnScroll) window.removeEventListener("scroll", window.__marOnScroll);
    window.__marOnScroll = onScroll;
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    if (toggle && links) {
      toggle.onclick = function () {
        var open = toggle.classList.toggle("is-open");
        links.classList.toggle("is-open", open);
        toggle.setAttribute("aria-expanded", open ? "true" : "false");
        document.body.style.overflow = open ? "hidden" : "";
      };
      links.querySelectorAll("a").forEach(function (a) {
        a.addEventListener("click", function () {
          toggle.classList.remove("is-open");
          links.classList.remove("is-open");
          toggle.setAttribute("aria-expanded", "false");
          document.body.style.overflow = "";
        });
      });
    }

    document.querySelectorAll('a[href^="#"]').forEach(function (a) {
      a.addEventListener("click", function (e) {
        var id = a.getAttribute("href");
        if (!id || id === "#") return;
        var t = document.querySelector(id);
        if (!t) return;
        e.preventDefault();
        window.scrollTo({
          top: t.getBoundingClientRect().top + window.scrollY - 95,
          behavior: "smooth",
        });
      });
    });

    var bodyLang = document.body && document.body.getAttribute("data-lang");
    if (bodyLang) document.documentElement.setAttribute("lang", bodyLang);

    var els = document.querySelectorAll(
      ".svc-grid, .svc-featured, .gallery__grid, .about__grid, .contact__grid, .sec"
    );
    els.forEach(function (el) {
      el.classList.add("reveal");
      el.classList.remove("is-in");
    });
    if ("IntersectionObserver" in window) {
      var io = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (en) {
            if (en.isIntersecting) {
              en.target.classList.add("is-in");
              io.unobserve(en.target);
            }
          });
        },
        { threshold: 0.1 }
      );
      els.forEach(function (el) {
        io.observe(el);
      });
    } else {
      els.forEach(function (el) {
        el.classList.add("is-in");
      });
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }

  document.addEventListener("htmx:afterOnLoad", function (evt) {
    var xhr = evt.detail && evt.detail.xhr;
    if (xhr && xhr.responseText) syncHeadFromResponse(xhr.responseText);
  });

  document.addEventListener("htmx:afterSettle", function (evt) {
    init();
    var root = document.getElementById("page-root");
    if (root && window.htmx) window.htmx.process(root);
    document.querySelectorAll(".reveal").forEach(function (el) {
      if (el.getBoundingClientRect().top < window.innerHeight + 40) {
        el.classList.add("is-in");
      }
    });
    if (!window.location.hash) window.scrollTo(0, 0);
  });
})();

(function () {
  var STORAGE_KEY = 'mendoza-v2-accent';
  var STORAGE_HEX = 'mendoza-v2-accent' + "-hex";
  var CUSTOM_VARS = ["--accent", "--accent-2", "--accent-3", "--accent-deep", "--accent-rgb", "--on-accent"];
  var ACCENTS = { original: '#7b3fb8', red: "#e10600", green: "#12b85a", cobalt: "#0047ab", yellow: "#e6b800", orange: "#ff5c00", custom: '#7b3fb8' };
  var ACCENT_KEYS = { original: 1, red: 1, green: 1, cobalt: 1, yellow: 1, orange: 1, custom: 1 };
  var STORAGE_HEADER = "mendoza-v2-header";
  var STORAGE_OMBRE = STORAGE_KEY + "-ombre";
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
    if (n.length === 3) n = n[0]+n[0]+n[1]+n[1]+n[2]+n[2];
    return { r: parseInt(n.slice(0,2),16)||0, g: parseInt(n.slice(2,4),16)||0, b: parseInt(n.slice(4,6),16)||0 };
  }
  function toHex(n) { var s = Math.max(0, Math.min(255, Math.round(n))).toString(16); return s.length===1?"0"+s:s; }
  function mixHex(hex, toward, t) {
    var a = hexToRgb(hex), b = hexToRgb(toward);
    return "#"+toHex(a.r+(b.r-a.r)*t)+toHex(a.g+(b.g-a.g)*t)+toHex(a.b+(b.b-a.b)*t);
  }
  function syncCustomUi(hex, on) {
    var sw = document.getElementById("customSwatch");
    var inp = document.getElementById("themeColor");
    var lab = document.querySelector(".theme-custom");
    var code = document.getElementById("customHex");
    if (sw) sw.style.background = hex || '#7b3fb8';
    if (inp && hex) inp.value = hex;
    if (lab) lab.classList.toggle("is-active", !!on);
    if (code) code.textContent = on && hex ? String(hex).toUpperCase() : "";
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
    try { localStorage.setItem(STORAGE_HEADER, mode === "dark" ? "black" : mode); } catch (e) {}
    document.querySelectorAll("[data-header-mode]").forEach(function (btn) {
      var on = btn.getAttribute("data-header-mode") === mode;
      btn.setAttribute("aria-pressed", on ? "true" : "false");
      btn.classList.toggle("is-active", on);
    });
  }
  function applyCustomHex(hex, fromWheel) {
    if (!hex) return;
    var rgb = hexToRgb(hex);
    var lum = (0.2126*rgb.r + 0.7152*rgb.g + 0.0722*rgb.b)/255;
    var root = document.documentElement;
    root.setAttribute("data-accent", "custom");
    root.style.setProperty("--accent", hex);
    root.style.setProperty("--accent-2", mixHex(hex, "#ffffff", 0.22));
    root.style.setProperty("--accent-3", mixHex(hex, "#ffffff", 0.45));
    root.style.setProperty("--accent-deep", mixHex(hex, "#000000", 0.35));
    root.style.setProperty("--accent-rgb", rgb.r+", "+rgb.g+", "+rgb.b);
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
    var meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute("content", ACCENTS[key] || '#7b3fb8');
    document.querySelectorAll("#themeMenu [data-accent]").forEach(function (btn) {
      var on = btn.getAttribute("data-accent") === key;
      btn.classList.toggle("is-active", on);
      btn.setAttribute("aria-checked", on ? "true" : "false");
    });
    syncCustomUi('#7b3fb8', false);
    syncWheel(ACCENTS[key] || ACCENTS.original);
  }
  function applyOmbre(on) {
    document.documentElement.setAttribute("data-ombre", on ? "1" : "0");
    try { localStorage.setItem(STORAGE_OMBRE, on ? "1" : "0"); } catch (e) {}
    var btn = document.getElementById("ombreToggle");
    if (btn) {
      btn.setAttribute("aria-pressed", on ? "true" : "false");
      btn.classList.toggle("is-active", !!on);
    }
  }
  function initThemeMenu() {
    var toggle = document.getElementById("themeToggle");
    var menu = document.getElementById("themeMenu");
    if (!toggle || !menu) return;
    applyAccent(currentAccent());
    var ombreOn = true;
    try { if (localStorage.getItem(STORAGE_OMBRE) === "0") ombreOn = false; } catch (e) {}
    applyOmbre(ombreOn);
    var ombreBtn = document.getElementById("ombreToggle");
    if (ombreBtn) {
      ombreBtn.onclick = function (e) {
        e.stopPropagation();
        applyOmbre(document.documentElement.getAttribute("data-ombre") !== "1");
      };
    }
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
    var wheel = document.getElementById("themeWheel");
    var slider = document.getElementById("themeWheelValue");
    if (wheel) {
      function pick(e) {
        var r = wheel.getBoundingClientRect();
        var dx = e.clientX - (r.left + r.width / 2);
        var dy = e.clientY - (r.top + r.height / 2);
        var sat = Math.min(1, Math.sqrt(dx * dx + dy * dy) / (r.width / 2 - 6));
        var hue = Math.atan2(dx, -dy) * 180 / Math.PI;
        if (hue < 0) hue += 360;
        var val = slider ? parseFloat(slider.value) / 100 : 1;
        var hex = hsvToHex(hue, sat, val);
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
      wheel.onpointerup = wheel.onpointercancel = function () { draggingWheel = false; };
    }
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
  document.body && document.body.addEventListener("htmx:afterSwap", function () { initThemeMenu(); });
})();
