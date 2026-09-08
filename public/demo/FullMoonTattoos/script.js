(function () {
  var KEY = "full-moon-tattoos-accent";
  var HEX_KEY = "full-moon-tattoos-accent-hex";
  var CUSTOM_VARS = ["--accent", "--accent-2", "--accent-3", "--accent-deep", "--accent-rgb", "--on-accent", "--gold", "--gold-hot"];
  var ORIGINAL = "#c9b27a";

  function hexToRgb(hex) {
    var h = String(hex || "").replace("#", "");
    if (h.length === 3) h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2];
    var n = parseInt(h, 16);
    if (isNaN(n)) return { r: 201, g: 178, b: 122 };
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
    root.style.setProperty("--gold", hex);
    root.style.setProperty("--gold-hot", hex);
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
        setThemeColor(ORIGINAL);
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
        setThemeColor(map[value] || ORIGINAL);
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

  var alts = {
    "images/artist.jpg": "Stacie Cervera, owner and artist at Full Moon Tattoos in Floresville",
    "images/lilies.jpg": "Color realism lilies and orange flowers on an upper arm",
    "images/elk-forest.jpg": "Black and gray elk and pine forest tattoo down a thigh",
    "images/butterfly-back.jpg": "Black and gray butterfly and florals across a back",
    "images/wolf-moon.jpg": "Black and gray wolf howling at a red moon on an upper arm",
    "images/medusa.jpg": "Black and gray Medusa portrait on a thigh",
    "images/cherubs.jpg": "Black and gray cherub portraits down an upper arm",
    "images/hummingbirds.jpg": "Black and gray magnolias and hummingbirds across a back",
    "images/phoenix.jpg": "Black and gray phoenix with flowers on a thigh",
    "images/tea-butterflies.jpg": "Color watercolor tea cup and butterflies on a forearm",
    "images/bird-blueberries.jpg": "Color bird on a blueberry branch on an arm",
    "images/moose.jpg": "Color moose with mountains and flowers on a thigh",
    "images/liberty-rose.jpg": "Black and gray Statue of Liberty, flame, and money rose on a forearm",
    "images/memorial.jpg": "Fine-line memorial tattoo with a cross, dandelion, and butterflies",
    "images/jason.jpg": "Black and gray hockey-mask horror portrait on a forearm",
    "images/in-utero.jpg": "Color realism Nirvana In Utero tribute tattoo on a thigh",
    "../images/artist.jpg": "Stacie Cervera, dueña y artista de Full Moon Tattoos en Floresville",
    "../images/lilies.jpg": "Lirios y flores naranjas en realismo a color en un brazo",
    "../images/elk-forest.jpg": "Alce y bosque de pinos en negro y gris en un muslo",
    "../images/butterfly-back.jpg": "Mariposa y flores en negro y gris en la espalda",
    "../images/wolf-moon.jpg": "Lobo aullando a una luna roja en negro y gris",
    "../images/medusa.jpg": "Retrato de Medusa en negro y gris en un muslo",
    "../images/cherubs.jpg": "Querubines en negro y gris en un brazo",
    "../images/hummingbirds.jpg": "Magnolias y colibríes en negro y gris en la espalda",
    "../images/phoenix.jpg": "Fénix con flores en negro y gris en un muslo",
    "../images/tea-butterflies.jpg": "Taza de té y mariposas en acuarela a color en un antebrazo",
    "../images/bird-blueberries.jpg": "Pájaro en una rama de arándanos a color",
    "../images/moose.jpg": "Alce con montañas y flores a color en un muslo",
    "../images/liberty-rose.jpg": "Estatua de la Libertad, llama y rosa de billete en negro y gris",
    "../images/memorial.jpg": "Tatuaje memorial de línea fina con cruz, diente de león y mariposas",
    "../images/jason.jpg": "Retrato de máscara de hockey en negro y gris en un antebrazo",
    "../images/in-utero.jpg": "Homenaje a color de la portada In Utero de Nirvana en un muslo"
  };

  function initArtistCards() {
    document.querySelectorAll(".artist").forEach(function (card) {
      var raw = card.getAttribute("data-images");
      if (!raw) return;
      var images;
      try { images = JSON.parse(raw); } catch (err) { return; }
      if (!images.length) return;

      var img = card.querySelector(".artist__img");
      var prev = card.querySelector(".artist__arrow--prev");
      var next = card.querySelector(".artist__arrow--next");
      var i = 0;

      function show(n) {
        i = (n + images.length) % images.length;
        img.src = images[i];
        img.alt = alts[images[i]] || img.alt;
      }

      if (prev) {
        prev.addEventListener("click", function (e) {
          e.preventDefault();
          show(i - 1);
        });
      }
      if (next) {
        next.addEventListener("click", function (e) {
          e.preventDefault();
          show(i + 1);
        });
      }
    });
  }

  function initLightbox() {
    var links = Array.prototype.slice.call(document.querySelectorAll("[data-lightbox]"));
    if (!links.length) return;

    var box = document.createElement("div");
    box.className = "lightbox";
    box.hidden = true;
    box.setAttribute("role", "dialog");
    box.setAttribute("aria-modal", "true");
    box.setAttribute("aria-label", document.documentElement.lang === "es" ? "Foto del tatuaje" : "Tattoo photo");
    box.innerHTML =
      '<div class="lightbox__bar"><span id="lbCaption"></span><button type="button" class="lightbox__close" aria-label="Close">&times;</button></div>' +
      '<div class="lightbox__stage">' +
        '<button type="button" class="lightbox__prev" aria-label="Previous">&#8249;</button>' +
        '<img id="lbImg" alt="" />' +
        '<button type="button" class="lightbox__next" aria-label="Next">&#8250;</button>' +
      "</div>";
    document.body.appendChild(box);

    var img = box.querySelector("#lbImg");
    var cap = box.querySelector("#lbCaption");
    var i = 0;

    function open(n) {
      i = (n + links.length) % links.length;
      var a = links[i];
      img.src = a.getAttribute("href");
      img.alt = a.querySelector("img") ? a.querySelector("img").alt : "";
      cap.textContent = img.alt;
      box.hidden = false;
    }
    function close() {
      box.hidden = true;
      img.removeAttribute("src");
    }

    links.forEach(function (a, idx) {
      a.addEventListener("click", function (e) {
        e.preventDefault();
        open(idx);
      });
    });
    var es = document.documentElement.lang === "es";
    box.querySelector(".lightbox__close").setAttribute("aria-label", es ? "Cerrar" : "Close");
    box.querySelector(".lightbox__prev").setAttribute("aria-label", es ? "Anterior" : "Previous");
    box.querySelector(".lightbox__next").setAttribute("aria-label", es ? "Siguiente" : "Next");
    box.querySelector(".lightbox__close").addEventListener("click", close);
    box.querySelector(".lightbox__prev").addEventListener("click", function () { open(i - 1); });
    box.querySelector(".lightbox__next").addEventListener("click", function () { open(i + 1); });
    box.addEventListener("click", function (e) {
      if (e.target === box) close();
    });
    document.addEventListener("keydown", function (e) {
      if (box.hidden) return;
      if (e.key === "Escape") close();
      if (e.key === "ArrowLeft") open(i - 1);
      if (e.key === "ArrowRight") open(i + 1);
    });
  }

  initNav();
  initThemeMenu();
  initArtistCards();
  initLightbox();
})();
