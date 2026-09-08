(function () {
  var KEY = "villasenor-tire-v2-accent";
  var HEX_KEY = "villasenor-tire-v2-accent-hex";
  var CUSTOM_VARS = ["--accent", "--accent-2", "--accent-3", "--accent-deep", "--accent-rgb", "--on-accent", "--blue", "--blue-hot", "--char"];

  function hexToRgb(hex) {
    var h = String(hex || "").replace("#", "");
    if (h.length === 3) h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2];
    var n = parseInt(h, 16);
    if (isNaN(n)) return { r: 30, g: 79, b: 154 };
    return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
  }

  function setThemeColor(hex) {
    var meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute("content", hex);
  }

  function clearCustomVars() {
    var root = document.documentElement;
    CUSTOM_VARS.forEach(function (v) { root.style.removeProperty(v); });
  }

  function applyCustomHex(hex) {
    var rgb = hexToRgb(hex);
    var lum = (0.2126 * rgb.r + 0.7152 * rgb.g + 0.0722 * rgb.b) / 255;
    var root = document.documentElement;
    root.style.setProperty("--accent", hex);
    root.style.setProperty("--accent-2", hex);
    root.style.setProperty("--accent-3", hex);
    root.style.setProperty("--accent-deep", hex);
    root.style.setProperty("--accent-rgb", rgb.r + ", " + rgb.g + ", " + rgb.b);
    root.style.setProperty("--on-accent", lum > 0.62 ? "#1a1400" : "#ffffff");
    root.style.setProperty("--blue", hex);
    root.style.setProperty("--blue-hot", hex);
    root.style.setProperty("--char", hex);
    setThemeColor(hex);
  }

  function markRadios(value) {
    document.querySelectorAll("#themeMenu [data-accent]").forEach(function (btn) {
      btn.setAttribute("aria-checked", btn.getAttribute("data-accent") === value ? "true" : "false");
    });
    var custom = document.querySelector(".theme-custom");
    if (custom) custom.classList.toggle("is-active", value === "custom");
  }

  function setAccent(value, hex) {
    var root = document.documentElement;
    try {
      if (!value) {
        root.removeAttribute("data-accent");
        localStorage.removeItem(KEY);
        localStorage.removeItem(HEX_KEY);
        clearCustomVars();
        setThemeColor("#1e4f9a");
        markRadios("");
        return;
      }
      root.setAttribute("data-accent", value);
      localStorage.setItem(KEY, value);
      if (value === "custom" && hex) {
        localStorage.setItem(HEX_KEY, hex);
        applyCustomHex(hex);
        var code = document.getElementById("customHex");
        var swatch = document.getElementById("customSwatch");
        if (code) code.textContent = hex;
        if (swatch) swatch.style.background = hex;
      } else {
        localStorage.removeItem(HEX_KEY);
        clearCustomVars();
        var map = { red: "#e10600", green: "#12b85a", cobalt: "#0047ab", yellow: "#e6b800", orange: "#ff5c00" };
        setThemeColor(map[value] || "#1e4f9a");
      }
      markRadios(value === "custom" ? "custom" : value);
    } catch (e) {}
  }

  function initThemeMenu() {
    var toggle = document.getElementById("themeToggle");
    var menu = document.getElementById("themeMenu");
    var color = document.getElementById("themeColor");
    if (!toggle || !menu) return;

    function openMenu(open) {
      menu.hidden = !open;
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    }

    toggle.addEventListener("click", function (e) {
      e.stopPropagation();
      openMenu(menu.hidden);
    });
    document.addEventListener("click", function (e) {
      if (!menu.hidden && !menu.contains(e.target) && e.target !== toggle && !toggle.contains(e.target)) {
        openMenu(false);
      }
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") openMenu(false);
    });

    menu.querySelectorAll("[data-accent]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        setAccent(btn.getAttribute("data-accent") || "");
        openMenu(false);
      });
    });

    if (color) {
      color.addEventListener("input", function () {
        setAccent("custom", color.value);
      });
    }

    try {
      var saved = localStorage.getItem(KEY);
      var hex = localStorage.getItem(HEX_KEY);
      if (saved === "custom" && hex) {
        if (color) color.value = hex;
        setAccent("custom", hex);
      } else if (saved) {
        setAccent(saved);
      } else {
        markRadios("");
      }
    } catch (e) {}
  }

  function initNav() {
    var toggle = document.getElementById("navToggle");
    var links = document.getElementById("navLinks");
    if (!toggle || !links) return;
    function setOpen(open) {
      links.classList.toggle("is-open", open);
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
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

  initNav();
  initThemeMenu();
})();
