(function () {
  "use strict";

  var META = {
    en: {
      lang: "en",
      title: "Texas Bistro | New American Dining · New Braunfels, TX",
      description:
        "Texas Bistro — New American restaurant in New Braunfels. Fresh ingredients, seasonal menu, happy hour & brunch. 1932 S Seguin Ave. Call (830) 302-7538.",
    },
    es: {
      lang: "es-MX",
      title: "Texas Bistro | Cocina New American · New Braunfels, TX",
      description:
        "Texas Bistro — restaurante New American en New Braunfels. Menú de temporada, happy hour y brunch. 1932 S Seguin Ave. Llama al (830) 302-7538.",
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

  function initTabs(root) {
    var scope = root || document;
    var tabs = scope.querySelectorAll(".menu-tab");
    var panels = scope.querySelectorAll(".menu-panel");
    if (!tabs.length) return;
    tabs.forEach(function (tab) {
      if (tab._bound) return;
      tab._bound = true;
      tab.addEventListener("click", function () {
        var id = tab.getAttribute("data-panel");
        tabs.forEach(function (t) {
          t.classList.toggle("is-active", t === tab);
          t.setAttribute("aria-selected", t === tab ? "true" : "false");
        });
        panels.forEach(function (p) {
          p.classList.toggle("is-active", p.id === id);
        });
      });
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
          top: t.getBoundingClientRect().top + window.scrollY - 90,
          behavior: "smooth",
        });
      });
    });

    initTabs(document);
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
