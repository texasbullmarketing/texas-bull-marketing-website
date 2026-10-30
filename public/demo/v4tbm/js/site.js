(function () {
  var year = document.getElementById("year");
  if (year) year.textContent = String(new Date().getFullYear());

  var menuBtn = document.querySelector(".menu-btn");
  var menu = document.getElementById("mobileMenu");

  function setMenu(open) {
    if (!menu || !menuBtn) return;
    menu.hidden = !open;
    menuBtn.setAttribute("aria-expanded", open ? "true" : "false");
    menuBtn.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    document.body.classList.toggle("menu-open", open);
  }

  if (menuBtn && menu) {
    menuBtn.addEventListener("click", function () {
      setMenu(menu.hidden);
    });
    menu.querySelectorAll("a, button").forEach(function (el) {
      el.addEventListener("click", function () { setMenu(false); });
    });
  }

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") setMenu(false);
  });

  document.querySelectorAll("[data-plan]").forEach(function (el) {
    el.addEventListener("click", function () {
      var plan = el.getAttribute("data-plan");
      var select = document.getElementById("leadPlan");
      if (select && plan) select.value = plan;
    });
  });

  document.querySelectorAll("[data-buy]").forEach(function (card) {
    var toggle = card.querySelector("[data-premium-toggle]");
    var amount = card.querySelector("[data-buy-price]");
    var name = card.querySelector("[data-buy-name]");
    var detail = card.querySelector("[data-buy-detail]");
    var cta = card.querySelector("[data-buy-cta]");
    if (!toggle || !amount || !cta) return;

    function apply(syncForm) {
      var on = toggle.checked;
      card.classList.toggle("is-premium", on);
      amount.textContent = on ? "$900" : "$700";
      if (name) name.textContent = on ? "Premium" : "Standard";
      if (detail) {
        detail.textContent = on
          ? "Standard, plus a second-language edition and a language switch. You own the site."
          : "Domain, 1 year of hosting, and 4 Lite Updates. You own the site.";
      }
      cta.textContent = on ? "Request Premium" : "Request Standard";
      cta.setAttribute("data-plan", on ? "premium-site" : "standard-site");
      if (syncForm) {
        var select = document.getElementById("leadPlan");
        if (select) select.value = on ? "premium-site" : "standard-site";
      }
    }

    toggle.addEventListener("change", function () { apply(true); });
    apply(false);
  });

  function digits(value) {
    return String(value || "").replace(/\D/g, "");
  }

  var form = document.getElementById("leadForm");
  if (form) {
    var phone = form.querySelector('input[name="phone"]');
    if (phone) {
      phone.addEventListener("input", function () {
        phone.setCustomValidity(digits(phone.value).length >= 7 ? "" : "Enter a phone number we can call.");
      });
    }

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var error = document.getElementById("formError");
      var button = form.querySelector('button[type="submit"]');
      if (phone && digits(phone.value).length < 7) {
        phone.setCustomValidity("Enter a phone number we can call.");
        phone.reportValidity();
        return;
      }
      if (phone) phone.setCustomValidity("");
      if (!form.reportValidity()) return;

      var data = new FormData(form);
      var payload = {
        name: String(data.get("name") || "").trim(),
        business: String(data.get("business") || "").trim(),
        phone: String(data.get("phone") || "").trim(),
        email: String(data.get("email") || "").trim(),
        city: String(data.get("city") || "").trim(),
        plan: String(data.get("plan") || "demo").trim(),
        notes: String(data.get("notes") || "").trim(),
        website: String(data.get("website") || "").trim(),
        lang: document.documentElement.lang || "en",
        source: location.pathname
      };

      if (payload.website) return;

      button.disabled = true;
      var label = button.textContent;
      button.textContent = "Sending…";
      if (error) error.classList.remove("show");

      fetch("/api/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      }).then(function (res) {
        if (!res.ok) throw new Error("bad status");
        return res.json();
      }).then(function (json) {
        if (!json || !json.ok) throw new Error("not ok");
        form.hidden = true;
        var done = document.getElementById("leadSuccess");
        if (done) {
          done.hidden = false;
          done.scrollIntoView({ block: "center" });
        }
      }).catch(function () {
        button.disabled = false;
        button.textContent = label;
        if (error) error.classList.add("show");
      });
    });
  }

  document.addEventListener("focusin", function (e) {
    if (e.target.matches("input, textarea, select")) document.body.classList.add("typing");
  });
  document.addEventListener("focusout", function () {
    setTimeout(function () {
      var active = document.activeElement;
      if (!active || !active.matches || !active.matches("input, textarea, select")) {
        document.body.classList.remove("typing");
      }
    }, 20);
  });

  if (document.body.dataset.langSync === "home") {
    var ids = ["process", "services", "proof", "pricing", "compare", "faq", "contact"];
    function syncLang() {
      var hash = "";
      if (location.hash && ids.indexOf(location.hash.slice(1)) !== -1) hash = location.hash;
      document.querySelectorAll("[data-lang-base]").forEach(function (a) {
        a.setAttribute("href", a.getAttribute("data-lang-base") + hash);
      });
    }
    window.addEventListener("hashchange", syncLang);
    syncLang();
  }

  var canvas = document.getElementById("bullCanvas");
  if (!canvas) return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  var ctx = canvas.getContext("2d");
  if (!ctx) return;
  var width = 0;
  var height = 0;
  var parts = [];
  var running = true;
  var palettes = [
    ["rgba(255,70,90,0.9)", "rgba(200,16,46,0.28)"],
    ["rgba(130,165,230,0.85)", "rgba(30,58,122,0.28)"],
    ["rgba(255,255,255,0.7)", "rgba(200,16,46,0.08)"]
  ];

  function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
    var count = Math.min(28, Math.max(12, Math.floor(width / 48)));
    parts = Array.from({ length: count }, function () {
      var pal = palettes[Math.floor(Math.random() * palettes.length)];
      return {
        x: Math.random() * width,
        y: Math.random() * height,
        r: Math.random() * 1.8 + 0.7,
        vx: (Math.random() - 0.5) * 0.25,
        vy: (Math.random() - 0.5) * 0.25,
        core: pal[0],
        glow: pal[1]
      };
    });
  }

  function draw() {
    if (!running) return;
    ctx.clearRect(0, 0, width, height);
    parts.forEach(function (p) {
      p.x += p.vx;
      p.y += p.vy;
      if (p.x < 0 || p.x > width) p.vx *= -1;
      if (p.y < 0 || p.y > height) p.vy *= -1;
      var g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 8);
      g.addColorStop(0, p.glow);
      g.addColorStop(1, "rgba(0,0,0,0)");
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r * 8, 0, Math.PI * 2);
      ctx.fillStyle = g;
      ctx.fill();
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = p.core;
      ctx.fill();
    });
    requestAnimationFrame(draw);
  }

  document.addEventListener("visibilitychange", function () {
    var hidden = document.hidden;
    if (hidden) {
      running = false;
      return;
    }
    if (!running) {
      running = true;
      draw();
    }
  });

  resize();
  draw();
  window.addEventListener("resize", resize);
})();
