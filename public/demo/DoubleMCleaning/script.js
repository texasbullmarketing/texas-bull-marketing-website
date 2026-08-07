/* Double M Cleaning demo — nav, reveals, HTMX language swap */
(function () {
  "use strict";

  var META = {
    en: {
      lang: "en",
      title: "Double M Cleaning | Clean Spaces, Better Places. · Seguin, TX",
      description:
        "Double M Cleaning — residential, office, move-in/move-out, and deep cleaning in Seguin, TX and surrounding areas. Reliable, detailed, trustworthy. Call or text 830-318-3026.",
    },
    es: {
      lang: "es",
      title: "Double M Cleaning | Espacios limpios, mejores lugares. · Seguin, TX",
      description:
        "Double M Cleaning — limpieza residencial, de oficinas, mudanzas y limpieza profunda en Seguin, TX y alrededores. Confiable, detallado y profesional. Llame o envíe un mensaje al 830-318-3026.",
    },
  };

  function detectLangFromUrl() {
    var path = (location.pathname || "").toLowerCase();
    return path.indexOf("es.html") !== -1 ? "es" : "en";
  }

  function setDocumentLang(lang) {
    var meta = META[lang] || META.en;
    document.documentElement.lang = meta.lang;
    document.body.setAttribute("data-lang", meta.lang);
    document.title = meta.title;
    var desc = document.querySelector('meta[name="description"]');
    if (desc) desc.setAttribute("content", meta.description);
  }

  function initYear() {
    var y = document.getElementById("year");
    if (y) y.textContent = String(new Date().getFullYear());
  }

  function initNav() {
    var nav = document.getElementById("nav");
    var toggle = document.getElementById("navToggle");
    var links = document.getElementById("navLinks");

    if (nav) nav.classList.add("is-scrolled");

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
  }

  function initSmoothAnchors() {
    document.querySelectorAll('#page-root a[href^="#"]').forEach(function (a) {
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
  }

  function initReveals() {
    var els = document.querySelectorAll(
      "#page-root .svc-grid, #page-root .showcase__grid, #page-root .why__grid, #page-root .contact__grid, #page-root .sec, #page-root .strip__grid, #page-root .areas__inner, #page-root .svc-feature"
    );
    els.forEach(function (el) {
      el.classList.add("reveal");
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
        { threshold: 0.12 }
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

  function initPage() {
    setDocumentLang(detectLangFromUrl());
    initYear();
    initNav();
    initSmoothAnchors();
    initReveals();
  }

  initPage();

  /* HTMX language swap: re-bind UI + update <html lang> / title after swap */
  document.body.addEventListener("htmx:afterSwap", function (evt) {
    if (!evt.detail || !evt.detail.target) return;
    var root =
      evt.detail.target.id === "page-root"
        ? evt.detail.target
        : document.getElementById("page-root");
    if (!root) return;
    var lang = detectLangFromUrl();
    setDocumentLang(lang);
    initYear();
    initNav();
    initSmoothAnchors();
    initReveals();
    if (window.htmx) window.htmx.process(root);
    window.scrollTo({ top: 0, behavior: "smooth" });
  });

  document.body.addEventListener("htmx:historyRestore", function () {
    initPage();
  });

  /* Fallback: if HTMX fails to load, lang links still navigate normally */
  document.body.addEventListener("htmx:sendError", function () {
    /* native href navigation will still work on next click without hx */
  });
})();
