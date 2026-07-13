/* Iron Roots Services — Demo landing interactions */

(function () {
  "use strict";

  // Year in footer
  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  // Mobile nav
  const toggle = document.querySelector(".nav-toggle");
  const mobileNav = document.getElementById("mobile-nav");
  if (toggle && mobileNav) {
    toggle.addEventListener("click", () => {
      const open = toggle.getAttribute("aria-expanded") === "true";
      toggle.setAttribute("aria-expanded", String(!open));
      mobileNav.hidden = open;
    });
    mobileNav.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => {
        toggle.setAttribute("aria-expanded", "false");
        mobileNav.hidden = true;
      });
    });
  }

  // Sticky header shadow on scroll
  const header = document.querySelector(".site-header");
  if (header) {
    const onScroll = () => {
      header.style.boxShadow =
        window.scrollY > 12 ? "0 8px 24px rgba(0,0,0,0.35)" : "none";
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  // Testimonials carousel
  const cards = Array.from(document.querySelectorAll(".testimonial-card"));
  const dotsWrap = document.getElementById("carousel-dots");
  const prevBtn = document.getElementById("carousel-prev");
  const nextBtn = document.getElementById("carousel-next");
  let index = 0;
  let autoTimer;

  function showSlide(i) {
    if (!cards.length) return;
    index = (i + cards.length) % cards.length;
    cards.forEach((card, n) => {
      card.classList.toggle("is-active", n === index);
    });
    if (dotsWrap) {
      dotsWrap.querySelectorAll(".carousel-dot").forEach((dot, n) => {
        dot.classList.toggle("is-active", n === index);
        dot.setAttribute("aria-selected", String(n === index));
      });
    }
  }

  if (dotsWrap && cards.length) {
    cards.forEach((_, n) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "carousel-dot" + (n === 0 ? " is-active" : "");
      btn.setAttribute("role", "tab");
      btn.setAttribute("aria-label", "Show testimonial " + (n + 1));
      btn.setAttribute("aria-selected", String(n === 0));
      btn.addEventListener("click", () => {
        showSlide(n);
        restartAuto();
      });
      dotsWrap.appendChild(btn);
    });
  }

  if (prevBtn) {
    prevBtn.addEventListener("click", () => {
      showSlide(index - 1);
      restartAuto();
    });
  }
  if (nextBtn) {
    nextBtn.addEventListener("click", () => {
      showSlide(index + 1);
      restartAuto();
    });
  }

  function restartAuto() {
    clearInterval(autoTimer);
    if (cards.length > 1) {
      autoTimer = setInterval(() => showSlide(index + 1), 6500);
    }
  }
  restartAuto();

  // Before/after slider
  const slider = document.getElementById("ba-slider");
  const range = document.getElementById("ba-range");
  const beforePanel = document.getElementById("ba-before-panel");
  const handle = document.getElementById("ba-handle");
  const beforeImg = beforePanel ? beforePanel.querySelector("img") : null;

  function syncSliderWidth() {
    if (!slider || !beforeImg) return;
    const w = slider.offsetWidth;
    beforeImg.style.width = w + "px";
    slider.style.setProperty("--slider-w", w + "px");
  }

  function setSliderPos(pct) {
    const p = Math.max(0, Math.min(100, Number(pct)));
    if (beforePanel) beforePanel.style.width = p + "%";
    if (handle) handle.style.left = p + "%";
    if (range && String(range.value) !== String(p)) range.value = String(p);
  }

  if (slider && range) {
    syncSliderWidth();
    window.addEventListener("resize", syncSliderWidth);
    range.addEventListener("input", () => setSliderPos(range.value));
    setSliderPos(50);

    // Pointer drag on container (extra reliability on touch)
    let dragging = false;
    const moveTo = (clientX) => {
      const rect = slider.getBoundingClientRect();
      const pct = ((clientX - rect.left) / rect.width) * 100;
      setSliderPos(pct);
    };
    slider.addEventListener("pointerdown", (e) => {
      if (e.target === range) return;
      dragging = true;
      slider.setPointerCapture(e.pointerId);
      moveTo(e.clientX);
    });
    slider.addEventListener("pointermove", (e) => {
      if (!dragging) return;
      moveTo(e.clientX);
    });
    slider.addEventListener("pointerup", () => {
      dragging = false;
    });
    slider.addEventListener("pointercancel", () => {
      dragging = false;
    });
  }

  // Service area map — Stockdale, TX + 35-mile radius (Leaflet / OpenStreetMap, free)
  const mapEl = document.getElementById("service-map");
  if (mapEl && typeof L !== "undefined") {
    // Stockdale, Texas
    const stockdale = [29.2374, -97.9442];
    const radiusMiles = 35;
    const radiusMeters = radiusMiles * 1609.344;

    const map = L.map(mapEl, {
      scrollWheelZoom: false,
      attributionControl: true,
    }).setView(stockdale, 9);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 18,
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(map);

    const circle = L.circle(stockdale, {
      radius: radiusMeters,
      color: "#c8102e",
      weight: 3,
      fillColor: "#c8102e",
      fillOpacity: 0.18,
    }).addTo(map);

    L.marker(stockdale)
      .addTo(map)
      .bindPopup(
        "<strong>Iron Roots Services</strong><br>Stockdale, TX<br>~35-mile service area"
      )
      .openPopup();

    map.fitBounds(circle.getBounds(), { padding: [24, 24] });

    // Fix tile sizing if section was hidden/lazy
    setTimeout(() => map.invalidateSize(), 200);
    window.addEventListener("resize", () => map.invalidateSize());
  }
})();
