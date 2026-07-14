// Michoacana Premium — small interactive bits

document.getElementById("year").textContent = new Date().getFullYear();

const toggle = document.getElementById("navToggle");
const nav = document.getElementById("nav");

if (toggle && nav) {
  toggle.addEventListener("click", () => {
    const open = nav.classList.toggle("open");
    toggle.setAttribute("aria-expanded", open ? "true" : "false");
    toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
  });

  nav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      nav.classList.remove("open");
      toggle.setAttribute("aria-expanded", "false");
    });
  });
}

// Soft reveal on scroll
const revealEls = document.querySelectorAll(
  ".menu-card, .visit-card, .about-card, .gal-item, .hero-copy, .hero-visual"
);

if ("IntersectionObserver" in window) {
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          io.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
  );

  revealEls.forEach((el) => {
    el.classList.add("will-reveal");
    io.observe(el);
  });
}

// Inject reveal styles
const style = document.createElement("style");
style.textContent = `
  .will-reveal {
    opacity: 0;
    transform: translateY(18px);
    transition: opacity 0.55s ease, transform 0.55s ease;
  }
  .will-reveal.is-visible {
    opacity: 1;
    transform: none;
  }
`;
document.head.appendChild(style);
