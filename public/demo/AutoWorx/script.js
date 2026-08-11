(function () {
  "use strict";

  var META = {
    en: {
      lang: "en",
      title: "Auto Worx | Collision, Body & Paint · 830-303-7775",
      description:
        "Auto Worx — collision repair, body & paint, paintless dent repair, auto glass. Family owned since 2000. Call 830-303-7775.",
    },
    es: {
      lang: "es-MX",
      title: "Auto Worx | Hojalatería, pintura y choques · 830-303-7775",
      description:
        "Auto Worx — choques, hojalatería y pintura, enderezado sin pintura (PDR) y cristales. Taller familiar desde el 2000. Llama al 830-303-7775.",
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

  function initBaSliders(root) {
    var scope = root || document;
    scope.querySelectorAll("[data-ba]").forEach(function (wrap) {
      var range = wrap.querySelector(".ba-slider__range");
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

  function init() {
    setDoc(detectLang());
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
        var t = id && id !== "#" ? document.querySelector(id) : null;
        if (!t) return;
        e.preventDefault();
        window.scrollTo({
          top: t.getBoundingClientRect().top + window.scrollY - 92,
          behavior: "smooth",
        });
      });
    });

    var form = document.getElementById("quoteForm");
    if (form && !form._bound) {
      form._bound = true;
      form.addEventListener("submit", function (e) {
        e.preventDefault();
        form.hidden = true;
        var box = document.getElementById("formThanks");
        if (box) box.hidden = false;
      });
    }

    initBaSliders(document);
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
