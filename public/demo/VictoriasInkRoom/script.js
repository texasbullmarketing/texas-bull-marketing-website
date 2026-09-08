(function () {
  var KEY = "victorias-ink-room-accent";
  var HEX_KEY = "victorias-ink-room-accent-hex";
  var CUSTOM_VARS = ["--accent", "--accent-2", "--accent-3", "--accent-deep", "--accent-rgb", "--on-accent", "--gold", "--gold-hot"];
  var ORIGINAL = "#e07a9e";
  var PRESETS = { oxblood: "#8b1e3f", violet: "#5c2e91", teal: "#1a7a72", gold: "#c9a227", olive: "#4a5d2a" };

  function hexToRgb(hex) {
    var h = String(hex || "").replace("#", "");
    if (h.length === 3) h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2];
    var n = parseInt(h, 16);
    if (isNaN(n)) return { r: 224, g: 122, b: 158 };
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
        setThemeColor(PRESETS[value] || ORIGINAL);
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
      } else if (saved && PRESETS[saved]) {
        setAccent(saved);
      } else {
        if (saved) {
          localStorage.removeItem(KEY);
          localStorage.removeItem(HEX_KEY);
        }
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
    "images/nicki.jpg": "Nicki, artist at Victoria’s Ink Room in Seguin",
    "images/peony.jpg": "Black and gray peony tattoo on a calf, by Nicki",
    "images/cowboy.jpg": "Black and gray cowboy, desert, moon, and sunflower forearm tattoo by Nicki",
    "images/mice.jpg": "Fine-line Cinderella mice tattoo on an upper arm, by Nicki",
    "images/moon-wrist.jpg": "Ornamental crescent moon and star tattoo on a hand, by Nicki",
    "images/godspeed.jpg": "Floral hand tattoo with Godspeed script, by Nicki",
    "images/lilies-hip.jpg": "Fine-line lilies along a hip, by Nicki",
    "images/jesus.jpg": "Black and gray Jesus portrait with a crown of thorns, by Nicki",
    "images/petra.jpg": "Petra Pokes, artist at Victoria’s Ink Room in Seguin",
    "images/petra-shoulder.jpg": "Fine-line flowers on a shoulder, by Petra",
    "images/petra-chest.jpg": "Chrysanthemum tattoo on the chest, by Petra",
    "images/petra-fear.jpg": "Script Never let your fear decide your fate with florals, by Petra",
    "images/petra-butterfly.jpg": "Butterfly and flowers on a forearm, by Petra",
    "images/petra-dates.jpg": "Script names and dates on a forearm, by Petra",
    "images/petra-moth.jpg": "Luna moth tattoo on the chest, by Petra",
    "images/petra-door.jpg": "Color storybook door tattoo, by Petra",
    "images/petra-ghosts.jpg": "Polaroid ghosts and florals, by Petra",
    "../images/nicki.jpg": "Nicki, artista de Victoria’s Ink Room en Seguin",
    "../images/peony.jpg": "Peonía en negro y gris en una pantorrilla, de Nicki",
    "../images/cowboy.jpg": "Vaquero, desierto, luna y girasol en negro y gris, de Nicki",
    "../images/mice.jpg": "Ratones de Cenicienta en línea fina, de Nicki",
    "../images/moon-wrist.jpg": "Luna creciente ornamental en una mano, de Nicki",
    "../images/godspeed.jpg": "Flores en la mano con letra Godspeed, de Nicki",
    "../images/lilies-hip.jpg": "Lirios en línea fina en la cadera, de Nicki",
    "../images/jesus.jpg": "Retrato de Jesús con corona de espinas, de Nicki",
    "../images/petra.jpg": "Petra Pokes, artista de Victoria’s Ink Room en Seguin",
    "../images/petra-shoulder.jpg": "Flores en línea fina en un hombro, de Petra",
    "../images/petra-chest.jpg": "Crisantemo en el pecho, de Petra",
    "../images/petra-fear.jpg": "Letra Never let your fear decide your fate con flores, de Petra",
    "../images/petra-butterfly.jpg": "Mariposa y flores en un antebrazo, de Petra",
    "../images/petra-dates.jpg": "Nombres y fechas en un antebrazo, de Petra",
    "../images/petra-moth.jpg": "Polilla luna en el pecho, de Petra",
    "../images/petra-door.jpg": "Puerta de cuento a color, de Petra",
    "../images/petra-ghosts.jpg": "Fantasmas en polaroid con flores, de Petra"
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

  function initBeforeAfter() {
    document.querySelectorAll("[data-ba]").forEach(function (el) {
      var grip = el.querySelector(".ba__grip");
      if (!grip) return;

      function setPos(pct) {
        pct = Math.max(4, Math.min(96, pct));
        el.style.setProperty("--pos", pct + "%");
        grip.setAttribute("aria-valuenow", String(Math.round(pct)));
      }

      function fromEvent(e) {
        var rect = el.getBoundingClientRect();
        var x = (e.clientX || (e.touches && e.touches[0].clientX) || 0) - rect.left;
        setPos((x / rect.width) * 100);
      }

      var dragging = false;
      function start(e) {
        dragging = true;
        el.setPointerCapture && e.pointerId != null && el.setPointerCapture(e.pointerId);
        fromEvent(e);
        e.preventDefault();
      }
      function move(e) {
        if (!dragging) return;
        fromEvent(e);
      }
      function end() { dragging = false; }

      el.addEventListener("pointerdown", start);
      window.addEventListener("pointermove", move);
      window.addEventListener("pointerup", end);
      window.addEventListener("pointercancel", end);

      grip.addEventListener("keydown", function (e) {
        var now = parseFloat(el.style.getPropertyValue("--pos")) || 50;
        if (e.key === "ArrowLeft") { setPos(now - 5); e.preventDefault(); }
        if (e.key === "ArrowRight") { setPos(now + 5); e.preventDefault(); }
      });
    });
  }

  initNav();
  initThemeMenu();
  initArtistCards();
  initLightbox();
  initBeforeAfter();
})();
