/* The Blackdoor Steakhouse demo */
(function () {
  "use strict";

  const year = document.getElementById("year");
  if (year) year.textContent = String(new Date().getFullYear());

  const nav = document.getElementById("nav");
  const navToggle = document.getElementById("navToggle");
  const navLinks = document.getElementById("navLinks");

  const onScroll = () => {
    if (nav) nav.classList.toggle("is-scrolled", window.scrollY > 36);
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  function closeMobileNav() {
    if (!navToggle || !navLinks) return;
    navToggle.classList.remove("is-open");
    navLinks.classList.remove("is-open");
    navToggle.setAttribute("aria-expanded", "false");
  }

  if (navToggle && navLinks) {
    navToggle.addEventListener("click", () => {
      const open = navToggle.classList.toggle("is-open");
      navLinks.classList.toggle("is-open", open);
      navToggle.setAttribute("aria-expanded", open ? "true" : "false");
      if (!document.getElementById("menuModal")?.classList.contains("is-open")) {
        document.body.style.overflow = open ? "hidden" : "";
      }
    });
    navLinks.querySelectorAll("a").forEach((a) => {
      a.addEventListener("click", () => {
        closeMobileNav();
        if (!document.body.classList.contains("menu-open")) {
          document.body.style.overflow = "";
        }
      });
    });
  }

  /* Full menu modal */
  const modal = document.getElementById("menuModal");
  const openBtns = document.querySelectorAll("[data-open-menu]");
  const closeEls = document.querySelectorAll("[data-close-menu]");
  const menuTabs = document.querySelectorAll(".menu-modal__tab");
  const menuPanels = document.querySelectorAll("[data-menu-panel]");

  function setMenuTab(key) {
    menuTabs.forEach((tab) => {
      const on = tab.dataset.menu === key;
      tab.classList.toggle("is-active", on);
      tab.setAttribute("aria-selected", on ? "true" : "false");
    });
    menuPanels.forEach((panel) => {
      const on = panel.dataset.menuPanel === key;
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
    setMenuTab("starters");
    const closeBtn = modal.querySelector(".menu-modal__close");
    if (closeBtn) closeBtn.focus();
  }

  function closeMenu() {
    if (!modal) return;
    modal.hidden = true;
    modal.setAttribute("aria-hidden", "true");
    document.body.classList.remove("menu-open");
    document.body.style.overflow = "";
  }

  openBtns.forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      openMenu();
    });
  });
  closeEls.forEach((el) => {
    el.addEventListener("click", closeMenu);
  });
  menuTabs.forEach((tab) => {
    tab.addEventListener("click", () => setMenuTab(tab.dataset.menu));
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && modal && !modal.hidden) closeMenu();
  });

  /* Smooth anchors */
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", (e) => {
      const id = anchor.getAttribute("href");
      if (!id || id === "#") return;
      const target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      const top = target.getBoundingClientRect().top + window.scrollY - 72;
      window.scrollTo({ top, behavior: "smooth" });
    });
  });

  const revealEls = document.querySelectorAll(
    ".intro__grid, .sec, .room__grid, .strip__row, .dining__teaser, .reserve__box, .visit__grid"
  );
  revealEls.forEach((el) => el.classList.add("reveal"));

  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-in");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -30px 0px" }
    );
    revealEls.forEach((el) => io.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add("is-in"));
  }
})();
