/* MJL Tire & Service demo — EN/ES + HTMX */
(function () {
  "use strict";

  var META = {
    en: {
      lang: "en",
      title: "MJL Tire & Service | Tires & Mechanic · Stockdale, TX",
      description:
        "MJL Tire & Service on W Main St in Stockdale, TX — flats, new and used tires, oil changes, brakes, A/C, diesel and transmission, plus 24/7 roadside. Call (830) 406-9325.",
    },
    es: {
      lang: "es",
      title: "MJL Tire & Service | Llantas y mecánica · Stockdale, TX",
      description:
        "MJL Tire & Service en W Main St, Stockdale, TX — llantas, ponchaduras, aceite, frenos, A/C y servicio en el camino 24/7. Llame al (830) 406-9325.",
    },
  };

  function detectLang() {
    var p = (location.pathname || "").toLowerCase();
    return p.indexOf("/es") !== -1 ? "es" : "en";
  }

  function setDocLang(lang) {
    var m = META[lang] || META.en;
    document.documentElement.lang = m.lang;
    if (document.body) document.body.setAttribute("data-lang", m.lang);
    document.title = m.title;
    var d = document.querySelector('meta[name="description"]');
    if (d) d.setAttribute("content", m.description);
  }

  var STORAGE_KEY = "mjl-tire-accent";
  var STORAGE_HEX = "mjl-tire-accent-hex";
  var THEME_KEY = "mjl-tire-theme";
  var CUSTOM_VARS = ["--accent", "--accent-2", "--accent-3", "--accent-deep", "--accent-rgb", "--on-accent"];
  var ACCENTS = {
    original: "#05070d",
    red: "#1a0505",
    green: "#05140a",
    cobalt: "#05081a",
    yellow: "#1a1605",
    orange: "#1a0c05",
    custom: "#05070d",
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
    if (sw) sw.style.background = hex || "#E31C23";
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
    if (meta) {
      var bar = ACCENTS[key] || "#05070d";
      if (key === "original" && currentMode() === "light") bar = "#f3f5f8";
      meta.setAttribute("content", bar);
    }
    document.querySelectorAll("#themeMenu [data-accent]").forEach(function (btn) {
      var on = btn.getAttribute("data-accent") === key;
      btn.classList.toggle("is-active", on);
      btn.setAttribute("aria-checked", on ? "true" : "false");
    });
    syncCustomUi("#E31C23", false);
  }

  function currentMode() {
    return document.documentElement.getAttribute("data-theme") === "light" ? "light" : "dark";
  }

  function applyMode(mode) {
    var light = mode === "light";
    if (light) document.documentElement.setAttribute("data-theme", "light");
    else document.documentElement.removeAttribute("data-theme");
    try {
      localStorage.setItem(THEME_KEY, light ? "light" : "dark");
    } catch (e) {}
    document.querySelectorAll("[data-theme-mode]").forEach(function (btn) {
      var on = btn.getAttribute("data-theme-mode") === (light ? "light" : "dark");
      btn.classList.toggle("is-active", on);
      btn.setAttribute("aria-pressed", on ? "true" : "false");
    });
    var meta = document.querySelector('meta[name="theme-color"]');
    if (meta && currentAccent() === "original") {
      meta.setAttribute("content", light ? "#f3f5f8" : "#05070d");
    }
  }

  function initThemeMenu() {
    var toggle = document.getElementById("themeToggle");
    var menu = document.getElementById("themeMenu");
    if (!toggle || !menu) return;

    applyAccent(currentAccent());
    applyMode(currentMode());

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

    menu.querySelectorAll("[data-theme-mode]").forEach(function (btn) {
      btn.onclick = function (e) {
        e.stopPropagation();
        applyMode(btn.getAttribute("data-theme-mode"));
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

    if (!window.__mjlThemeDocBound) {
      window.__mjlThemeDocBound = true;
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

  function init() {
    setDocLang(detectLang());
    initThemeMenu();

    var y = document.getElementById("year");
    if (y) y.textContent = String(new Date().getFullYear());

    var toggle = document.getElementById("navToggle");
    var links = document.getElementById("navLinks");
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

    document.querySelectorAll('#page-root a[href^="#"]').forEach(function (a) {
      a.addEventListener("click", function (e) {
        var id = a.getAttribute("href");
        if (!id || id === "#") return;
        var t = document.querySelector(id);
        if (!t) return;
        e.preventDefault();
        window.scrollTo({
          top: t.getBoundingClientRect().top + window.scrollY - 84,
          behavior: "smooth",
        });
      });
    });

    var els = document.querySelectorAll(
      ".svc-grid, .offer-grid, .road__grid, .veh-grid, .gal-grid, .reviews__grid, .loc-grid, .strip__grid, .sec, .ph-grid"
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

  document.body.addEventListener("htmx:afterSwap", function (evt) {
    if (!evt.detail || !evt.detail.target) return;
    var root =
      evt.detail.target.id === "page-root"
        ? evt.detail.target
        : document.getElementById("page-root");
    if (!root) return;
    init();
    if (window.htmx) window.htmx.process(root);
    if (!window.location.hash) window.scrollTo({ top: 0, behavior: "smooth" });
  });
})();
