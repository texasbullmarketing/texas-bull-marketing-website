/* The 1908 demo — interactions */
(function () {
  "use strict";

  const year = document.getElementById("year");
  if (year) year.textContent = String(new Date().getFullYear());

  /* Nav */
  const nav = document.getElementById("nav");
  const navToggle = document.getElementById("navToggle");
  const navLinks = document.getElementById("navLinks");

  const onScroll = () => {
    if (nav) nav.classList.toggle("is-scrolled", window.scrollY > 36);
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  if (navToggle && navLinks) {
    navToggle.addEventListener("click", () => {
      const open = navToggle.classList.toggle("is-open");
      navLinks.classList.toggle("is-open", open);
      navToggle.setAttribute("aria-expanded", open ? "true" : "false");
      document.body.style.overflow = open ? "hidden" : "";
    });
    navLinks.querySelectorAll("a").forEach((a) => {
      a.addEventListener("click", () => {
        navToggle.classList.remove("is-open");
        navLinks.classList.remove("is-open");
        navToggle.setAttribute("aria-expanded", "false");
        document.body.style.overflow = "";
      });
    });
  }

  /* Soft cursor glow */
  const glow = document.getElementById("cursorGlow");
  if (glow && window.matchMedia("(pointer: fine)").matches) {
    window.addEventListener(
      "pointermove",
      (e) => {
        glow.style.left = e.clientX + "px";
        glow.style.top = e.clientY + "px";
      },
      { passive: true }
    );
  }

  /* Hero vibe switch + auto rotate real photos */
  const heroMain = document.getElementById("heroMain");
  const heroLounge = document.getElementById("heroLounge");
  const heroBtns = document.querySelectorAll("[data-hero]");

  const mainPhotos = [
    "assets/images/window-seat.jpg",
    "assets/images/drinks-bar.jpg",
    "assets/images/social.jpg",
    "assets/images/cocktail-logo.jpg",
  ];
  const loungePhotos = [
    "assets/images/lounge-wide.jpg",
    "assets/images/lounge-fireplace.jpg",
    "assets/images/lounge-sofa.jpg",
  ];

  let heroMode = "main";
  let mainIdx = 0;
  let loungeIdx = 0;
  let heroTimer = null;

  function setHero(mode, { user = false } = {}) {
    heroMode = mode;
    heroBtns.forEach((btn) => {
      btn.classList.toggle("is-active", btn.dataset.hero === mode);
    });
    if (heroMain && heroLounge) {
      heroMain.classList.toggle("is-active", mode === "main");
      heroLounge.classList.toggle("is-active", mode === "lounge");
    }
    if (user) restartHeroTimer();
  }

  function cycleHeroPhoto() {
    if (heroMode === "main" && heroMain) {
      mainIdx = (mainIdx + 1) % mainPhotos.length;
      const img = heroMain.querySelector("img");
      if (img) img.src = mainPhotos[mainIdx];
    } else if (heroLounge) {
      loungeIdx = (loungeIdx + 1) % loungePhotos.length;
      const img = heroLounge.querySelector("img");
      if (img) img.src = loungePhotos[loungeIdx];
    }
  }

  function restartHeroTimer() {
    if (heroTimer) clearInterval(heroTimer);
    heroTimer = setInterval(() => {
      cycleHeroPhoto();
      setHero(heroMode === "main" ? "lounge" : "main");
    }, 7500);
  }

  heroBtns.forEach((btn) => {
    btn.addEventListener("click", () => setHero(btn.dataset.hero, { user: true }));
  });
  restartHeroTimer();

  /* Spaces toggle */
  const spaceTabs = document.querySelectorAll(".spaces__tab");
  const spacePill = document.getElementById("spacePill");
  const spaceMain = document.getElementById("spaceMain");
  const spaceLounge = document.getElementById("spaceLounge");

  function setSpace(space) {
    spaceTabs.forEach((tab) => {
      const on = tab.dataset.space === space;
      tab.classList.toggle("is-active", on);
      tab.setAttribute("aria-selected", on ? "true" : "false");
    });
    if (spacePill) spacePill.classList.toggle("is-right", space === "lounge");
    if (spaceMain && spaceLounge) {
      const showMain = space === "main";
      spaceMain.classList.toggle("is-active", showMain);
      spaceLounge.classList.toggle("is-active", !showMain);
      spaceMain.hidden = !showMain;
      spaceLounge.hidden = showMain;
    }
    // Keep hero loosely in sync when user explores spaces
    setHero(space === "main" ? "main" : "lounge", { user: true });
  }

  spaceTabs.forEach((tab) => {
    tab.addEventListener("click", () => setSpace(tab.dataset.space));
  });

  /* Menu tabs */
  const menuTabs = document.querySelectorAll(".menu__tab");
  const menuPanels = document.querySelectorAll("[data-menu-panel]");

  function setMenu(key) {
    menuTabs.forEach((tab) => {
      const on = tab.dataset.menu === key;
      tab.classList.toggle("is-active", on);
    });
    menuPanels.forEach((panel) => {
      const on = panel.dataset.menuPanel === key;
      panel.classList.toggle("is-active", on);
      panel.hidden = !on;
    });
  }

  menuTabs.forEach((tab) => {
    tab.addEventListener("click", () => setMenu(tab.dataset.menu));
  });

  /* Smooth anchors with nav offset */
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

  /* Scroll reveal */
  const revealEls = document.querySelectorAll(
    ".sec-head, .spaces__toggle, .spaces__panels, .menu__tabs, .menu__panel, .story__grid, .nights__grid, .reviews__grid, .visit__grid"
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
      { threshold: 0.1, rootMargin: "0px 0px -30px 0px" }
    );
    revealEls.forEach((el) => io.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add("is-in"));
  }
})();
