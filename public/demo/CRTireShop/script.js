/* CR Tire Shop demo — EN/ES + HTMX */
(function () {
  "use strict";

  var META = {
    en: {
      lang: "en",
      title: "CR Tire Shop | Tire Repair & Mechanic · Nixon, TX",
      description:
        "CR Tire Shop on Hwy 87 in Nixon, TX — tires, road service, and mechanic work for cars, trucks, 18-wheelers, and tractors. Call or text (830) 742-5353.",
    },
    es: {
      lang: "es",
      title: "CR Tire Shop | Llantas y mecánica · Nixon, TX",
      description:
        "CR Tire Shop en Hwy 87, Nixon, TX — llantas, servicio en el camino y mecánica para carros, trocas, tráileres y tractores. Llame o mande mensaje al (830) 742-5353.",
    },
  };

  function detectLang() {
    var p = (location.pathname || "").toLowerCase();
    return p.indexOf("/es") !== -1 ? "es" : "en";
  }

  function setDocLang(lang) {
    var m = META[lang] || META.en;
    document.documentElement.lang = m.lang;
    if (document.body) document.body.setAttribute("data-lang", m.lang);
    document.title = m.title;
    var d = document.querySelector('meta[name="description"]');
    if (d) d.setAttribute("content", m.description);
  }

  var ACCENTS = {
    original: "#05070d",
    red: "#1a0505",
    green: "#05140a",
    cobalt: "#05081a",
    yellow: "#1a1605",
    orange: "#1a0c05",
  };
  var ACCENT_KEYS = { original: 1, red: 1, green: 1, cobalt: 1, yellow: 1, orange: 1 };

  function currentAccent() {
    return document.documentElement.getAttribute("data-accent") || "original";
  }

  function applyAccent(name) {
    var key = ACCENT_KEYS[name] ? name : "original";
    if (key === "original") document.documentElement.removeAttribute("data-accent");
    else document.documentElement.setAttribute("data-accent", key);
    try {
      localStorage.setItem("cr-tire-accent", key === "original" ? "" : key);
      if (key === "original") localStorage.removeItem("cr-tire-accent");
    } catch (e) {}
    var meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute("content", ACCENTS[key] || "#05070d");
    document.querySelectorAll("#themeMenu [data-accent]").forEach(function (btn) {
      var on = btn.getAttribute("data-accent") === key;
      btn.classList.toggle("is-active", on);
      btn.setAttribute("aria-checked", on ? "true" : "false");
    });
  }

  function initThemeMenu() {
    var toggle = document.getElementById("themeToggle");
    var menu = document.getElementById("themeMenu");
    if (!toggle || !menu) return;

    applyAccent(currentAccent());

    toggle.onclick = function (e) {
      e.stopPropagation();
      var open = toggle.getAttribute("aria-expanded") === "true";
      toggle.setAttribute("aria-expanded", open ? "false" : "true");
      menu.hidden = open;
    };

    menu.querySelectorAll("[data-accent]").forEach(function (btn) {
      btn.onclick = function (e) {
        e.stopPropagation();
        applyAccent(btn.getAttribute("data-accent"));
      };
    });

    if (!window.__crThemeDocBound) {
      window.__crThemeDocBound = true;
      document.addEventListener("click", function (e) {
        var t = document.getElementById("themeToggle");
        var m = document.getElementById("themeMenu");
        if (!t || !m || m.hidden) return;
        if (!m.contains(e.target) && !t.contains(e.target)) {
          m.hidden = true;
          t.setAttribute("aria-expanded", "false");
        }
      });
      document.addEventListener("keydown", function (e) {
        if (e.key !== "Escape") return;
        var t = document.getElementById("themeToggle");
        var m = document.getElementById("themeMenu");
        if (!t || !m || m.hidden) return;
        m.hidden = true;
        t.setAttribute("aria-expanded", "false");
        t.focus();
      });
    }
  }

  function init() {
    setDocLang(detectLang());
    initThemeMenu();

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
        window.scrollTo({
          top: t.getBoundingClientRect().top + window.scrollY - 84,
          behavior: "smooth",
        });
      });
    });

    var els = document.querySelectorAll(
      ".svc-grid, .offer-grid, .road__grid, .veh-grid, .gal-grid, .reviews__grid, .loc-grid, .strip__grid, .sec"
    );
    els.forEach(function (el) {
      el.classList.add("reveal");
      el.classList.remove("is-in");
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
        { threshold: 0.1 }
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

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }

  document.body.addEventListener("htmx:afterSwap", function (evt) {
    if (!evt.detail || !evt.detail.target) return;
    var root =
      evt.detail.target.id === "page-root"
        ? evt.detail.target
        : document.getElementById("page-root");
    if (!root) return;
    init();
    if (window.htmx) window.htmx.process(root);
    if (!window.location.hash) window.scrollTo({ top: 0, behavior: "smooth" });
  });
})();
