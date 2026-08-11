/* Wageners Well Service demo — EN/ES + HTMX lang switch */
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

    // Theme color
    var theme = doc.querySelector('meta[name="theme-color"]');
    var themeLive = document.querySelector('meta[name="theme-color"]');
    if (theme && themeLive) themeLive.setAttribute("content", theme.getAttribute("content") || "");

    // Description
    var desc = doc.querySelector('meta[name="description"]');
    var descLive = document.querySelector('meta[name="description"]');
    if (desc && descLive) descLive.setAttribute("content", desc.getAttribute("content") || "");

    // Canonical
    var canon = doc.querySelector('link[rel="canonical"]');
    var canonLive = document.querySelector('link[rel="canonical"]');
    if (canon && canonLive) canonLive.setAttribute("href", canon.getAttribute("href") || "");

    // hreflang alternates
    document.querySelectorAll('link[rel="alternate"][hreflang]').forEach(function (n) {
      n.remove();
    });
    doc.querySelectorAll('link[rel="alternate"][hreflang]').forEach(function (n) {
      document.head.appendChild(n.cloneNode(true));
    });

    // Open Graph
    ["og:locale", "og:title", "og:description", "og:url"].forEach(function (prop) {
      var src = doc.querySelector('meta[property="' + prop + '"]');
      var live = document.querySelector('meta[property="' + prop + '"]');
      if (src && live) live.setAttribute("content", src.getAttribute("content") || "");
    });

    // JSON-LD schema (replace all)
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
    if (window.__wwsOnScroll) {
      window.removeEventListener("scroll", window.__wwsOnScroll);
    }
    window.__wwsOnScroll = onScroll;
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
        var offset = 68 + 34;
        window.scrollTo({
          top: t.getBoundingClientRect().top + window.scrollY - offset,
          behavior: "smooth",
        });
      });
    });

    var form = document.getElementById("estimateForm");
    var success = document.getElementById("formSuccess");
    if (form) {
      form.onsubmit = function (e) {
        e.preventDefault();
        if (!form.checkValidity()) {
          form.reportValidity();
          return;
        }
        if (success) {
          success.hidden = false;
          success.scrollIntoView({ behavior: "smooth", block: "nearest" });
        }
        form.reset();
      };
    }

    var els = document.querySelectorAll(
      ".cards, .why__grid, .contact__grid, .sec, .process__steps, .service-bullets, .trust-grid"
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

    var bodyLang = document.body && document.body.getAttribute("data-lang");
    if (bodyLang) {
      document.documentElement.setAttribute("lang", bodyLang);
    }
  }

  function boot() {
    init();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }

  // HTMX: sync head (title, lang, schema) + re-init UI after language swap
  document.addEventListener("htmx:afterOnLoad", function (evt) {
    var xhr = evt.detail && evt.detail.xhr;
    if (xhr && xhr.responseText) {
      syncHeadFromResponse(xhr.responseText);
    }
  });

  document.addEventListener("htmx:afterSettle", function () {
    init();
    if (!window.location.hash) {
      window.scrollTo(0, 0);
    }
  });

  // Fallback: if HTMX fails, normal navigation still works via href
  document.addEventListener("htmx:sendError", function () {
    /* browser will not auto-navigate; href still available on refresh */
  });
})();
