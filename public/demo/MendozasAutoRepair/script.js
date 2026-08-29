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
  var STORAGE_KEY = 'mendoza-accent';
  var STORAGE_HEX = 'mendoza-accent' + "-hex";
  var CUSTOM_VARS = ["--accent", "--accent-2", "--accent-3", "--accent-deep", "--accent-rgb", "--on-accent"];
  var ACCENTS = { original: '#7b3fb8', red: "#e10600", green: "#12b85a", cobalt: "#0047ab", yellow: "#e6b800", orange: "#ff5c00", custom: '#7b3fb8' };
  var ACCENT_KEYS = { original: 1, red: 1, green: 1, cobalt: 1, yellow: 1, orange: 1, custom: 1 };
  function currentAccent() { return document.documentElement.getAttribute("data-accent") || "original"; }
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
  function applyCustomHex(hex) {
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
      btn.onclick = function (e) { e.stopPropagation(); applyAccent(btn.getAttribute("data-accent")); };
    });
    var picker = document.getElementById("themeColor");
    if (picker) {
      picker.onclick = function (e) { e.stopPropagation(); };
      picker.oninput = function (e) { e.stopPropagation(); applyCustomHex(picker.value); };
    }
    if (!window.__tbmThemeBound) {
      window.__tbmThemeBound = true;
      document.addEventListener("click", function (e) {
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
