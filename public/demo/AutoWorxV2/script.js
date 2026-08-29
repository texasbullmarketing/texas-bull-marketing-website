(function () {
  "use strict";

  var META = {
    en: {
      lang: "en",
      title: "Auto Worx | Collision, Body & Paint · Seguin, TX",
      description:
        "Auto Worx — collision repair, body & paint, paintless dent repair, auto glass in Seguin, TX. Family owned since 2000. Insurance claims welcome. Call 830-303-7775.",
    },
    es: {
      lang: "es-MX",
      title: "Auto Worx | Hojalatería, pintura y choques · Seguin, TX",
      description:
        "Auto Worx — choques, hojalatería y pintura, PDR y cristales en Seguin, TX. Taller familiar desde el 2000. Aceptamos seguros. Llama al 830-303-7775.",
    },
  };

  function detectLang() {
    return (location.pathname || "").toLowerCase().indexOf("/es") !== -1 ? "es" : "en";
  }

  function setDoc(lang) {
    var m = META[lang] || META.en;
    document.documentElement.lang = m.lang;
    document.body.setAttribute("data-lang", m.lang);
    document.title = m.title;
    var d = document.querySelector('meta[name="description"]');
    if (d) d.setAttribute("content", m.description);
  }

  var STORAGE_KEY = "autoworx-v2-accent";
  var STORAGE_HEX = "autoworx-v2-accent-hex";
  var CUSTOM_VARS = ["--accent", "--accent-2", "--accent-3", "--accent-deep", "--accent-rgb", "--on-accent"];
  var ACCENTS = {
    original: "#d01018",
    red: "#e10600",
    green: "#12b85a",
    cobalt: "#0047ab",
    yellow: "#e6b800",
    orange: "#ff5c00",
    custom: "#d01018",
  };
  var ACCENT_KEYS = { original: 1, red: 1, green: 1, cobalt: 1, yellow: 1, orange: 1, custom: 1 };

  function currentAccent() {
    return document.documentElement.getAttribute("data-accent") || "original";
  }

  function clearCustomVars() {
    CUSTOM_VARS.forEach(function (p) {
      document.documentElement.style.removeProperty(p);
    });
  }

  function hexToRgb(hex) {
    var n = String(hex || "").replace("#", "");
    if (n.length === 3) n = n[0] + n[0] + n[1] + n[1] + n[2] + n[2];
    return {
      r: parseInt(n.slice(0, 2), 16) || 0,
      g: parseInt(n.slice(2, 4), 16) || 0,
      b: parseInt(n.slice(4, 6), 16) || 0,
    };
  }

  function toHex(n) {
    var s = Math.max(0, Math.min(255, Math.round(n))).toString(16);
    return s.length === 1 ? "0" + s : s;
  }

  function mixHex(hex, toward, t) {
    var a = hexToRgb(hex);
    var b = hexToRgb(toward);
    return "#" + toHex(a.r + (b.r - a.r) * t) + toHex(a.g + (b.g - a.g) * t) + toHex(a.b + (b.b - a.b) * t);
  }

  function syncCustomUi(hex, on) {
    var sw = document.getElementById("customSwatch");
    var inp = document.getElementById("themeColor");
    var lab = document.querySelector(".theme-custom");
    var code = document.getElementById("customHex");
    if (sw) sw.style.background = hex || "#d01018";
    if (inp && hex) inp.value = hex;
    if (lab) lab.classList.toggle("is-active", !!on);
    if (code) code.textContent = on && hex ? String(hex).toUpperCase() : "";
  }

  function applyCustomHex(hex) {
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
    try {
      localStorage.setItem(STORAGE_KEY, "custom");
      localStorage.setItem(STORAGE_HEX, hex);
    } catch (e) {}
    var meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute("content", hex);
    document.querySelectorAll("#themeMenu [data-accent]").forEach(function (btn) {
      btn.classList.remove("is-active");
      btn.setAttribute("aria-checked", "false");
    });
    syncCustomUi(hex, true);
  }

  function applyAccent(name) {
    var key = ACCENT_KEYS[name] ? name : "original";
    if (key === "custom") {
      var hex = "";
      try { hex = localStorage.getItem(STORAGE_HEX) || ""; } catch (e) {}
      if (hex) {
        applyCustomHex(hex);
        return;
      }
      key = "original";
    }
    clearCustomVars();
    if (key === "original") document.documentElement.removeAttribute("data-accent");
    else document.documentElement.setAttribute("data-accent", key);
    try {
      if (key === "original") {
        localStorage.removeItem(STORAGE_KEY);
        localStorage.removeItem(STORAGE_HEX);
      } else {
        localStorage.setItem(STORAGE_KEY, key);
        localStorage.removeItem(STORAGE_HEX);
      }
    } catch (e) {}
    var meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute("content", ACCENTS[key] || "#d01018");
    document.querySelectorAll("#themeMenu [data-accent]").forEach(function (btn) {
      var on = btn.getAttribute("data-accent") === key;
      btn.classList.toggle("is-active", on);
      btn.setAttribute("aria-checked", on ? "true" : "false");
    });
    syncCustomUi("#d01018", false);
  }

  function initThemeMenu() {
    var toggle = document.getElementById("themeToggle");
    var menu = document.getElementById("themeMenu");
    if (!toggle || !menu) return;

    applyAccent(currentAccent());

    toggle.onclick = function (e) {
      e.stopPropagation();
      var open = toggle.getAttribute("aria-expanded") === "true";
      toggle.setAttribute("aria-expanded", open ? "false" : "true");
      menu.hidden = open;
    };

    menu.querySelectorAll("[data-accent]").forEach(function (btn) {
      btn.onclick = function (e) {
        e.stopPropagation();
        applyAccent(btn.getAttribute("data-accent"));
      };
    });

    var picker = document.getElementById("themeColor");
    if (picker) {
      picker.onclick = function (e) { e.stopPropagation(); };
      picker.oninput = function (e) {
        e.stopPropagation();
        applyCustomHex(picker.value);
      };
    }

    if (!window.__aw2ThemeDocBound) {
      window.__aw2ThemeDocBound = true;
      document.addEventListener("click", function (e) {
        var t = document.getElementById("themeToggle");
        var m = document.getElementById("themeMenu");
        if (!t || !m || m.hidden) return;
        if (!m.contains(e.target) && !t.contains(e.target)) {
          m.hidden = true;
          t.setAttribute("aria-expanded", "false");
        }
      });
      document.addEventListener("keydown", function (e) {
        if (e.key !== "Escape") return;
        var t = document.getElementById("themeToggle");
        var m = document.getElementById("themeMenu");
        if (!t || !m || m.hidden) return;
        m.hidden = true;
        t.setAttribute("aria-expanded", "false");
        t.focus();
      });
    }
  }

  function initBa(root) {
    var scope = root || document;
    scope.querySelectorAll("[data-ba]").forEach(function (wrap) {
      var range = wrap.querySelector(".ba__range");
      if (!range || range._baBound) return;
      range._baBound = true;
      function apply() {
        wrap.style.setProperty("--pos", range.value + "%");
      }
      range.addEventListener("input", apply);
      range.addEventListener("change", apply);
      apply();
    });
  }

  function initNav() {
    var toggle = document.getElementById("navToggle");
    var links = document.getElementById("navLinks");
    if (!toggle || !links) return;
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

  function initAnchors() {
    document.querySelectorAll('#page-root a[href^="#"]').forEach(function (a) {
      a.addEventListener("click", function (e) {
        var id = a.getAttribute("href");
        var t = id && id !== "#" ? document.querySelector(id) : null;
        if (!t) return;
        e.preventDefault();
        window.scrollTo({
          top: t.getBoundingClientRect().top + window.scrollY - 96,
          behavior: "smooth",
        });
      });
    });
  }

  function initReveal() {
    var nodes = document.querySelectorAll(".reveal");
    if (!nodes.length) return;
    if (!("IntersectionObserver" in window)) {
      nodes.forEach(function (n) { n.classList.add("is-in"); });
      return;
    }
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-in");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
    );
    nodes.forEach(function (n) { io.observe(n); });
  }

  function init() {
    setDoc(detectLang());
    initThemeMenu();
    var y = document.getElementById("year");
    if (y) y.textContent = String(new Date().getFullYear());
    initNav();
    initAnchors();
    initBa(document);
    initReveal();
  }

  init();

  document.body.addEventListener("htmx:afterSwap", function (evt) {
    if (!evt.detail || !evt.detail.target) return;
    var root =
      evt.detail.target.id === "page-root"
        ? evt.detail.target
        : document.getElementById("page-root");
    if (!root) return;
    init();
    if (window.htmx) window.htmx.process(root);
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
})();
