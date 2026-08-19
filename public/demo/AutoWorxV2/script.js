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
