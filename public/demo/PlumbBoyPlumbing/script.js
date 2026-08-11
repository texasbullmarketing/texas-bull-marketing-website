(function () {
  "use strict";
  var META = {
    en: {
      lang: "en",
      title: "Plumb Boy Plumbing | Call or Text 210-317-4039",
      description:
        "Plumb Boy Plumbing — leaky faucets, drains, water heaters, toilets, sewer lines & more. Fast, honest, reliable. Call or text 210-317-4039.",
    },
    es: {
      lang: "es",
      title: "Plumb Boy Plumbing | Llame o envíe mensaje al 210-317-4039",
      description:
        "Plumb Boy Plumbing — llaves, drenajes, calentadores, inodoros, alcantarillado y más. Rápido, honesto y confiable. 210-317-4039.",
    },
  };
  function detectLang() {
    var p = (location.pathname || "").toLowerCase();
    return p.indexOf("/es") !== -1 ? "es" : "en";
  }
  function setDoc(lang) {
    var m = META[lang] || META.en;
    document.documentElement.lang = m.lang;
    document.body.setAttribute("data-lang", m.lang);
    document.title = m.title;
    var d = document.querySelector('meta[name="description"]');
    if (d) d.setAttribute("content", m.description);
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
        window.scrollTo({ top: t.getBoundingClientRect().top + window.scrollY - 90, behavior: "smooth" });
      });
    });
    var form = document.getElementById("quoteForm");
    if (form) {
      form.addEventListener("submit", function (e) {
        e.preventDefault();
        form.hidden = true;
        var box = document.getElementById("formThanks");
        if (box) box.hidden = false;
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
