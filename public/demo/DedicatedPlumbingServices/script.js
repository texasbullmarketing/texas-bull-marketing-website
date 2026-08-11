(function () {
  "use strict";
  var META = {
    en: {
      lang: "en",
      title: "Dedicated Plumbing Services | San Antonio & Saint Hedwig, TX",
      description:
        "Family-owned plumbing in San Antonio & surrounding areas. Water heaters, drains, leaks, remodels & more. Call or text 210-417-4941.",
    },
    es: {
      lang: "es",
      title: "Dedicated Plumbing Services | Plomería en San Antonio y Saint Hedwig, TX",
      description:
        "Plomería familiar en San Antonio y alrededores. Calentadores, drenajes, fugas, remodelaciones y más. Llame o envíe mensaje al 210-417-4941.",
    },
  };

  function detectLang() {
    var p = (location.pathname || "").toLowerCase();
    return p.indexOf("/es") !== -1 || p.indexOf("es.html") !== -1 ? "es" : "en";
  }

  function setDocLang(lang) {
    var m = META[lang] || META.en;
    document.documentElement.lang = m.lang;
    document.body.setAttribute("data-lang", m.lang);
    document.title = m.title;
    var d = document.querySelector('meta[name="description"]');
    if (d) d.setAttribute("content", m.description);
  }

  function init() {
    setDocLang(detectLang());
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
        window.scrollTo({ top: t.getBoundingClientRect().top + window.scrollY - 90, behavior: "smooth" });
      });
    });

    var form = document.getElementById("quoteForm");
    if (form) {
      form.addEventListener("submit", function (e) {
        e.preventDefault();
        var box = document.getElementById("formThanks");
        if (box) {
          form.hidden = true;
          box.hidden = false;
        }
      });
    }
  }

  init();
  document.body.addEventListener("htmx:afterSwap", function (evt) {
    if (!evt.detail || !evt.detail.target) return;
    var root = evt.detail.target.id === "page-root" ? evt.detail.target : document.getElementById("page-root");
    if (!root) return;
    init();
    if (window.htmx) window.htmx.process(root);
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
})();
