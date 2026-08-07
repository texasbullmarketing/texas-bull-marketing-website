/* Mendoza's Auto Repair demo — EN/ES + HTMX */
(function () {
  "use strict";

  function syncHeadFromResponse(html) {
    if (!html) return;
    var doc;
    try {
      doc = new DOMParser().parseFromString(html, "text/html");
    } catch (e) {
      return;
    }
    if (doc.title) document.title = doc.title;
    var lang = doc.documentElement.getAttribute("lang");
    if (lang) document.documentElement.setAttribute("lang", lang);

    var desc = doc.querySelector('meta[name="description"]');
    var descLive = document.querySelector('meta[name="description"]');
    if (desc && descLive) descLive.setAttribute("content", desc.getAttribute("content") || "");

    var canon = doc.querySelector('link[rel="canonical"]');
    var canonLive = document.querySelector('link[rel="canonical"]');
    if (canon && canonLive) canonLive.setAttribute("href", canon.getAttribute("href") || "");

    document.querySelectorAll('link[rel="alternate"][hreflang]').forEach(function (n) {
      n.remove();
    });
    doc.querySelectorAll('link[rel="alternate"][hreflang]').forEach(function (n) {
      document.head.appendChild(n.cloneNode(true));
    });

    ["og:locale", "og:title", "og:description", "og:url"].forEach(function (prop) {
      var src = doc.querySelector('meta[property="' + prop + '"]');
      var live = document.querySelector('meta[property="' + prop + '"]');
      if (src && live) live.setAttribute("content", src.getAttribute("content") || "");
    });

    document.querySelectorAll('script[type="application/ld+json"]').forEach(function (s) {
      s.remove();
    });
    doc.querySelectorAll('script[type="application/ld+json"]').forEach(function (s) {
      var el = document.createElement("script");
      el.type = "application/ld+json";
      el.textContent = s.textContent;
      document.head.appendChild(el);
    });
  }

  function init() {
    var y = document.getElementById("year");
    if (y) y.textContent = String(new Date().getFullYear());

    var nav = document.getElementById("nav");
    var toggle = document.getElementById("navToggle");
    var links = document.getElementById("navLinks");

    function onScroll() {
      if (nav) nav.classList.toggle("is-scrolled", window.scrollY > 24);
    }
    if (window.__marOnScroll) window.removeEventListener("scroll", window.__marOnScroll);
    window.__marOnScroll = onScroll;
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

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

    document.querySelectorAll('a[href^="#"]').forEach(function (a) {
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

    var bodyLang = document.body && document.body.getAttribute("data-lang");
    if (bodyLang) document.documentElement.setAttribute("lang", bodyLang);

    var els = document.querySelectorAll(
      ".svc-grid, .svc-featured, .gallery__grid, .about__grid, .contact__grid, .sec, .strip__grid"
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

  document.addEventListener("htmx:afterOnLoad", function (evt) {
    var xhr = evt.detail && evt.detail.xhr;
    if (xhr && xhr.responseText) syncHeadFromResponse(xhr.responseText);
  });

  document.addEventListener("htmx:afterSettle", function () {
    init();
    if (!window.location.hash) window.scrollTo(0, 0);
  });
})();
