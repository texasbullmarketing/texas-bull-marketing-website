/* Taqueria Atotonilco demo */
(function () {
  "use strict";

  var year = document.getElementById("year");
  if (year) year.textContent = String(new Date().getFullYear());

  var nav = document.getElementById("nav");
  var navToggle = document.getElementById("navToggle");
  var navLinks = document.getElementById("navLinks");
  var modal = document.getElementById("menuModal");
  var menuTabs = document.querySelectorAll(".menu-modal__tab");
  var menuPanels = document.querySelectorAll("[data-menu-panel]");

  function onScroll() {
    if (nav) nav.classList.toggle("is-scrolled", window.scrollY > 30);
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  function closeMobileNav() {
    if (!navToggle || !navLinks) return;
    navToggle.classList.remove("is-open");
    navLinks.classList.remove("is-open");
    navToggle.setAttribute("aria-expanded", "false");
  }

  if (navToggle && navLinks) {
    navToggle.addEventListener("click", function () {
      var open = navToggle.classList.toggle("is-open");
      navLinks.classList.toggle("is-open", open);
      navToggle.setAttribute("aria-expanded", open ? "true" : "false");
      if (!document.body.classList.contains("menu-open")) {
        document.body.style.overflow = open ? "hidden" : "";
      }
    });
    navLinks.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", function () {
        closeMobileNav();
        if (!document.body.classList.contains("menu-open")) {
          document.body.style.overflow = "";
        }
      });
    });
  }

  function setMenuTab(key) {
    menuTabs.forEach(function (tab) {
      var on = tab.getAttribute("data-menu") === key;
      tab.classList.toggle("is-active", on);
      tab.setAttribute("aria-selected", on ? "true" : "false");
    });
    menuPanels.forEach(function (panel) {
      var on = panel.getAttribute("data-menu-panel") === key;
      panel.classList.toggle("is-active", on);
      panel.hidden = !on;
    });
  }

  function openMenu() {
    if (!modal) return;
    closeMobileNav();
    modal.hidden = false;
    modal.setAttribute("aria-hidden", "false");
    document.body.classList.add("menu-open");
    document.body.style.overflow = "hidden";
    setMenuTab("combos");
  }

  function closeMenu() {
    if (!modal) return;
    modal.hidden = true;
    modal.setAttribute("aria-hidden", "true");
    document.body.classList.remove("menu-open");
    document.body.style.overflow = "";
  }

  document.querySelectorAll("[data-open-menu]").forEach(function (btn) {
    btn.addEventListener("click", function (e) {
      e.preventDefault();
      openMenu();
    });
  });
  document.querySelectorAll("[data-close-menu]").forEach(function (el) {
    el.addEventListener("click", closeMenu);
  });
  menuTabs.forEach(function (tab) {
    tab.addEventListener("click", function () {
      setMenuTab(tab.getAttribute("data-menu"));
    });
  });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && modal && !modal.hidden) closeMenu();
  });

  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener("click", function (e) {
      var id = anchor.getAttribute("href");
      if (!id || id === "#") return;
      var target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      var top = target.getBoundingClientRect().top + window.scrollY - 70;
      window.scrollTo({ top: top, behavior: "smooth" });
    });
  });

  var revealEls = document.querySelectorAll(
    ".about__grid, .sec, .plates__grid, .menu-teaser__box, .reviews__grid, .visit__grid"
  );
  revealEls.forEach(function (el) {
    el.classList.add("reveal");
  });

  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-in");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -20px 0px" }
    );
    revealEls.forEach(function (el) {
      io.observe(el);
    });
  } else {
    revealEls.forEach(function (el) {
      el.classList.add("is-in");
    });
  }
})();
