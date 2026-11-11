(function () {
  "use strict";
  var META = {
    en: {
      lang: "en",
      title: "We Wash You Shine | Driveways from $85 · Katy",
      description: "Pressure washing in Katy for driveways, sidewalks, and patios. From $85. Free estimates. Call or text (713) 887-3036."
    },
    es: {
      lang: "es",
      title: "We Wash You Shine | Lavado a presión · Katy",
      description: "Lavado a presión en Katy para entradas, banquetas y patios. Desde $85. Estimado gratis. Llame o envíe mensaje al (713) 887-3036."
    }
  };

  function detectLang() {
    var body = document.body && document.body.getAttribute("data-lang");
    if (body === "es" || body === "en") return body;
    var p = (location.pathname || "").toLowerCase();
    return p.indexOf("es.html") !== -1 || p.indexOf("/es/") !== -1 ? "es" : "en";
  }

  function setDocLang(lang) {
    var m = META[lang] || META.en;
    document.documentElement.lang = m.lang;
    if (document.body) document.body.setAttribute("data-lang", m.lang);
    var pageTitle = document.body && document.body.getAttribute("data-title");
    document.title = pageTitle || m.title;
    var d = document.querySelector('meta[name="description"]');
    if (d && !pageTitle) d.setAttribute("content", m.description);
  }

  function initNav() {
    var toggle = document.getElementById("navToggle");
    var links = document.getElementById("navLinks");
    if (!toggle || !links) return;
    toggle.onclick = function () {
      var open = toggle.classList.toggle("is-open");
      links.classList.toggle("is-open", open);
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    };
    links.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", function () {
        toggle.classList.remove("is-open");
        links.classList.remove("is-open");
        toggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  function initForm() {
    var form = document.getElementById("quoteForm");
    var thanks = document.getElementById("formThanks");
    if (!form || form.dataset.bound === "1") return;
    form.dataset.bound = "1";
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var trap = form.querySelector("[name=website]");
      if (trap && trap.value) return;
      form.hidden = true;
      if (thanks) thanks.hidden = false;
    });
  }

  function boot() {
    setDocLang(detectLang());
    var y = document.getElementById("year");
    if (y) y.textContent = String(new Date().getFullYear());
    initNav();
    initForm();
    initCompare();
  }

  function initCompare() {
    document.querySelectorAll("[data-cmp]").forEach(function (root) {
      if (root.dataset.bound === "1") return;
      root.dataset.bound = "1";
      var range = root.querySelector(".cmp__range");
      var clip = root.querySelector(".cmp__clip");
      if (!range || !clip) return;
      function set(v) {
        clip.style.width = v + "%";
        root.style.setProperty("--pos", v + "%");
      }
      range.addEventListener("input", function () { set(range.value); });
      set(range.value);
    });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();

  document.body.addEventListener("htmx:afterSwap", function (evt) {
    if (!evt.detail || !evt.detail.target) return;
    var root = document.getElementById("page-root");
    if (!root) return;
    var lang = root.getAttribute("data-lang") || detectLang();
    if (document.body) document.body.setAttribute("data-lang", lang);
    boot();
    if (window.htmx) window.htmx.process(root);
  });
})();
