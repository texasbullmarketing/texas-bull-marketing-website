/* The 1908 demo - interactions */
(function () {
  "use strict";

  const year = document.getElementById("year");
  if (year) year.textContent = String(new Date().getFullYear());

  /* Nav */
  const nav = document.getElementById("nav");
  const navToggle = document.getElementById("navToggle");
  const navLinks = document.getElementById("navLinks");

  const onScroll = () => {
    if (nav) nav.classList.toggle("is-scrolled", window.scrollY > 36);
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  if (navToggle && navLinks) {
    navToggle.addEventListener("click", () => {
      const open = navToggle.classList.toggle("is-open");
      navLinks.classList.toggle("is-open", open);
      navToggle.setAttribute("aria-expanded", open ? "true" : "false");
      document.body.style.overflow = open ? "hidden" : "";
    });
    navLinks.querySelectorAll("a").forEach((a) => {
      a.addEventListener("click", () => {
        navToggle.classList.remove("is-open");
        navLinks.classList.remove("is-open");
        navToggle.setAttribute("aria-expanded", "false");
        document.body.style.overflow = "";
      });
    });
  }

  /* Soft cursor glow */
  const glow = document.getElementById("cursorGlow");
  if (glow && window.matchMedia("(pointer: fine)").matches) {
    window.addEventListener(
      "pointermove",
      (e) => {
        glow.style.left = e.clientX + "px";
        glow.style.top = e.clientY + "px";
      },
      { passive: true }
    );
  }

  /* Hero vibe switch + auto rotate real photos */
  const heroMain = document.getElementById("heroMain");
  const heroLounge = document.getElementById("heroLounge");
  const heroBtns = document.querySelectorAll("[data-hero]");

  const mainPhotos = [
    "assets/images/window-seat.jpg",
    "assets/images/drinks-bar.jpg",
    "assets/images/social.jpg",
    "assets/images/cocktail-logo.jpg",
  ];
  const loungePhotos = [
    "assets/images/lounge-wide.jpg",
    "assets/images/lounge-fireplace.jpg",
    "assets/images/lounge-sofa.jpg",
  ];

  let heroMode = "main";
  let mainIdx = 0;
  let loungeIdx = 0;
  let heroTimer = null;

  function setHero(mode, { user = false } = {}) {
    heroMode = mode;
    heroBtns.forEach((btn) => {
      btn.classList.toggle("is-active", btn.dataset.hero === mode);
    });
    if (heroMain && heroLounge) {
      heroMain.classList.toggle("is-active", mode === "main");
      heroLounge.classList.toggle("is-active", mode === "lounge");
    }
    if (user) restartHeroTimer();
  }

  function cycleHeroPhoto() {
    if (heroMode === "main" && heroMain) {
      mainIdx = (mainIdx + 1) % mainPhotos.length;
      const img = heroMain.querySelector("img");
      if (img) img.src = mainPhotos[mainIdx];
    } else if (heroLounge) {
      loungeIdx = (loungeIdx + 1) % loungePhotos.length;
      const img = heroLounge.querySelector("img");
      if (img) img.src = loungePhotos[loungeIdx];
    }
  }

  function restartHeroTimer() {
    if (heroTimer) clearInterval(heroTimer);
    heroTimer = setInterval(() => {
      cycleHeroPhoto();
      setHero(heroMode === "main" ? "lounge" : "main");
    }, 7500);
  }

  heroBtns.forEach((btn) => {
    btn.addEventListener("click", () => setHero(btn.dataset.hero, { user: true }));
  });
  restartHeroTimer();

  /* Spaces toggle */
  const spaceTabs = document.querySelectorAll(".spaces__tab");
  const spacePill = document.getElementById("spacePill");
  const spaceMain = document.getElementById("spaceMain");
  const spaceLounge = document.getElementById("spaceLounge");

  function setSpace(space) {
    spaceTabs.forEach((tab) => {
      const on = tab.dataset.space === space;
      tab.classList.toggle("is-active", on);
      tab.setAttribute("aria-selected", on ? "true" : "false");
    });
    if (spacePill) spacePill.classList.toggle("is-right", space === "lounge");
    if (spaceMain && spaceLounge) {
      const showMain = space === "main";
      spaceMain.classList.toggle("is-active", showMain);
      spaceLounge.classList.toggle("is-active", !showMain);
      spaceMain.hidden = !showMain;
      spaceLounge.hidden = showMain;
    }
    // Keep hero loosely in sync when user explores spaces
    setHero(space === "main" ? "main" : "lounge", { user: true });
  }

  spaceTabs.forEach((tab) => {
    tab.addEventListener("click", () => setSpace(tab.dataset.space));
  });

  /* Menu tabs */
  const menuTabs = document.querySelectorAll(".menu__tab");
  const menuPanels = document.querySelectorAll("[data-menu-panel]");

  function setMenu(key) {
    menuTabs.forEach((tab) => {
      const on = tab.dataset.menu === key;
      tab.classList.toggle("is-active", on);
    });
    menuPanels.forEach((panel) => {
      const on = panel.dataset.menuPanel === key;
      panel.classList.toggle("is-active", on);
      panel.hidden = !on;
    });
  }

  menuTabs.forEach((tab) => {
    tab.addEventListener("click", () => setMenu(tab.dataset.menu));
  });

  /* Smooth anchors with nav offset */
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", (e) => {
      const id = anchor.getAttribute("href");
      if (!id || id === "#") return;
      const target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      const top = target.getBoundingClientRect().top + window.scrollY - 72;
      window.scrollTo({ top, behavior: "smooth" });
    });
  });

  /* Scroll reveal */
  const revealEls = document.querySelectorAll(
    ".sec-head, .spaces__toggle, .spaces__panels, .menu__tabs, .menu__panel, .story__grid, .nights__grid, .reviews__grid, .visit__grid"
  );
  revealEls.forEach((el) => el.classList.add("reveal"));

  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-in");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -30px 0px" }
    );
    revealEls.forEach((el) => io.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add("is-in"));
  }
})();

(function () {
  var STORAGE_KEY = 'the1908-accent';
  var STORAGE_HEX = 'the1908-accent' + "-hex";
  var CUSTOM_VARS = ["--accent", "--accent-2", "--accent-3", "--accent-deep", "--accent-rgb", "--on-accent"];
  var ACCENTS = { original: '#c9a227', red: "#e10600", green: "#12b85a", cobalt: "#0047ab", yellow: "#e6b800", orange: "#ff5c00", custom: '#c9a227' };
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
    if (sw) sw.style.background = hex || '#c9a227';
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
    if (meta) meta.setAttribute("content", ACCENTS[key] || '#c9a227');
    document.querySelectorAll("#themeMenu [data-accent]").forEach(function (btn) {
      var on = btn.getAttribute("data-accent") === key;
      btn.classList.toggle("is-active", on);
      btn.setAttribute("aria-checked", on ? "true" : "false");
    });
    syncCustomUi('#c9a227', false);
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
