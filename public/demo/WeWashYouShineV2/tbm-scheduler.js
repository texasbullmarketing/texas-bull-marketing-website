/* TBM in-house scheduler. Drop #tbm-scheduler + this file + tbm-scheduler.css. */
(function (root) {
  "use strict";

  var MONTHS_EN = ["January","February","March","April","May","June","July","August","September","October","November","December"];
  var MONTHS_ES = ["enero","febrero","marzo","abril","mayo","junio","julio","agosto","septiembre","octubre","noviembre","diciembre"];
  var DOW_EN = ["SU","MO","TU","WE","TH","FR","SA"];
  var DOW_ES = ["DO","LU","MA","MI","JU","VI","SÁ"];
  var DAYS_EN = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
  var DAYS_ES = ["domingo","lunes","martes","miércoles","jueves","viernes","sábado"];
  var STATES = ["AL","AK","AZ","AR","CA","CO","CT","DE","FL","GA","HI","ID","IL","IN","IA","KS","KY","LA","ME","MD","MA","MI","MN","MS","MO","MT","NE","NV","NH","NJ","NM","NY","NC","ND","OH","OK","OR","PA","RI","SC","SD","TN","TX","UT","VT","VA","WA","WV","WI","WY"];

  var I18N = {
    en: {
      select: "Select date and time",
      required: "All fields are required",
      name: "Name",
      phone: "Phone number",
      email: "Email",
      street: "Street address",
      city: "City",
      state: "State",
      country: "Country",
      zip: "Zip code",
      help: "How can we help?",
      submit: "Submit",
      thanks: "Thank you",
      thanksLead: "You've requested an appointment for",
      thanksBody: "We've received your request and will contact you shortly to confirm. If you need help now, call us.",
      call: "Call",
      again: "Request another time",
      slots: "Available windows",
      needWhen: "Pick a date and time",
      needField: "This field is required",
      needPhone: "Enter a 10-digit phone",
      needEmail: "Enter a valid email",
      needZip: "Enter a 5-digit ZIP",
      demoNote: "This is a demo request. We will not dispatch a tech from this page.",
      sending: "Sending…"
    },
    es: {
      select: "Seleccione fecha y hora",
      required: "Todos los campos son obligatorios",
      name: "Nombre",
      phone: "Teléfono",
      email: "Correo",
      street: "Dirección",
      city: "Ciudad",
      state: "Estado",
      country: "País",
      zip: "Código postal",
      help: "¿En qué le podemos ayudar?",
      submit: "Enviar",
      thanks: "Gracias",
      thanksLead: "Pidió una cita para",
      thanksBody: "Recibimos su solicitud y le confirmamos en breve. Si lo necesita ahora, llámenos.",
      call: "Llamar",
      again: "Pedir otro horario",
      slots: "Horarios disponibles",
      needWhen: "Elija fecha y hora",
      needField: "Este campo es obligatorio",
      needPhone: "Escriba un teléfono de 10 dígitos",
      needEmail: "Escriba un correo válido",
      needZip: "Escriba un C.P. de 5 dígitos",
      demoNote: "Esta es una solicitud de demostración. No se despacha un técnico desde esta página.",
      sending: "Enviando…"
    }
  };

  var DEFAULTS = {
    business: "Your Business",
    phone: "",
    tel: "",
    email: "",
    lang: "en",
    daysOut: 14,
    closedDays: [0],
    windows: [
      { id: "8", labelEn: "8:00 AM", labelEs: "8:00 a. m.", startHour: 8 },
      { id: "10", labelEn: "10:00 AM", labelEs: "10:00 a. m.", startHour: 10 },
      { id: "12", labelEn: "12:00 PM", labelEs: "12:00 p. m.", startHour: 12 },
      { id: "14", labelEn: "2:00 PM", labelEs: "2:00 p. m.", startHour: 14 },
      { id: "16", labelEn: "4:00 PM", labelEs: "4:00 p. m.", startHour: 16 }
    ],
    mode: "demo",
    endpoint: "",
    formsubmit: "",
    state: "TX",
    city: "",
    showDemoNote: false
  };

  function $(sel, rootEl) { return (rootEl || document).querySelector(sel); }
  function pad(n) { return n < 10 ? "0" + n : String(n); }
  function ymd(d) { return d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate()); }
  function startOfDay(d) { return new Date(d.getFullYear(), d.getMonth(), d.getDate()); }
  function digits(s) { return String(s || "").replace(/\D/g, ""); }
  function emailOk(s) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(s || "").trim()); }
  function escapeHtml(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }
  function merge(a, b) {
    var out = {};
    var k;
    for (k in a) out[k] = a[k];
    for (k in b) if (b[k] !== undefined && b[k] !== "") out[k] = b[k];
    return out;
  }
  function dataOpts(el) {
    var d = el.dataset || {};
    var closed = d.closedDays;
    return {
      business: d.business,
      phone: d.phone,
      tel: d.tel,
      email: d.email,
      lang: d.lang,
      daysOut: d.daysOut ? Number(d.daysOut) : undefined,
      closedDays: closed ? closed.split(",").map(Number) : undefined,
      mode: d.mode,
      endpoint: d.endpoint,
      formsubmit: d.formsubmit,
      state: d.state,
      city: d.city,
      showDemoNote: d.showDemoNote === "0" ? false : undefined
    };
  }

  function windowLabel(w, lang) {
    return lang === "es" ? (w.labelEs || w.labelEn) : (w.labelEn || w.label);
  }

  function buildMarkup(t, cfg) {
    var stateOpts = STATES.map(function (st) {
      return "<option value=\"" + st + "\"" + (st === cfg.state ? " selected" : "") + ">" + st + "</option>";
    }).join("");
    var call = cfg.tel || ("tel:" + digits(cfg.phone));
    return "" +
      "<form class=\"tbm-sked__form\" novalidate>" +
        "<div class=\"tbm-sked__row\">" +
          "<div class=\"tbm-sked__step\" aria-hidden=\"true\">1</div>" +
          "<button type=\"button\" class=\"tbm-sked__when\" id=\"skedWhen\" aria-expanded=\"false\" aria-controls=\"skedCal\">" +
            "<span data-when-label>" + escapeHtml(t.select) + "</span>" +
            "<span class=\"tbm-sked__chev\" aria-hidden=\"true\">▾</span>" +
          "</button>" +
          "<p class=\"tbm-sked__req\">" + escapeHtml(t.required) + "<span>*</span></p>" +
          "<div class=\"tbm-sked__cal\" id=\"skedCal\" hidden>" +
            "<div class=\"tbm-sked__cal-head\">" +
              "<button type=\"button\" class=\"tbm-sked__nav\" data-nav=\"-1\" aria-label=\"Previous month\">‹</button>" +
              "<strong data-month></strong>" +
              "<button type=\"button\" class=\"tbm-sked__nav\" data-nav=\"1\" aria-label=\"Next month\">›</button>" +
            "</div>" +
            "<div class=\"tbm-sked__dow\"></div>" +
            "<div class=\"tbm-sked__grid\" data-grid></div>" +
            "<div class=\"tbm-sked__slots\" data-slots>" +
              "<p>" + escapeHtml(t.slots) + "</p>" +
              "<div data-slot-btns></div>" +
            "</div>" +
          "</div>" +
        "</div>" +
        "<div class=\"tbm-sked__row\" style=\"margin-top:1rem\">" +
          "<div class=\"tbm-sked__step\" aria-hidden=\"true\">2</div>" +
          "<div class=\"tbm-sked__fields\">" +
            field("name", t.name, "text", "name") +
            field("phone", t.phone, "tel", "tel") +
            field("email", t.email, "email", "email") +
            field("street", t.street, "text", "street-address") +
            field("city", t.city, "text", "address-level2") +
            "<div class=\"tbm-sked__geo tbm-sked__field--full\">" +
              "<div class=\"tbm-sked__field\"><label for=\"skedState\">" + escapeHtml(t.state) + "</label>" +
                "<select id=\"skedState\" name=\"state\" autocomplete=\"address-level1\">" + stateOpts + "</select></div>" +
              "<div class=\"tbm-sked__field\"><label for=\"skedCountry\">" + escapeHtml(t.country) + "</label>" +
                "<select id=\"skedCountry\" name=\"country\" autocomplete=\"country-name\">" +
                  "<option value=\"USA\" selected>USA</option>" +
                  "<option value=\"Canada\">Canada</option>" +
                "</select></div>" +
              field("zip", t.zip, "text", "postal-code") +
            "</div>" +
            "<div class=\"tbm-sked__field tbm-sked__field--full\"><label for=\"skedHelp\">" + escapeHtml(t.help) + "</label>" +
              "<textarea id=\"skedHelp\" name=\"help\" required></textarea>" +
              "<span class=\"tbm-sked__err\" data-err=\"help\"></span></div>" +
            "<p class=\"tbm-sked__hp\" aria-hidden=\"true\"><input type=\"text\" name=\"website\" tabindex=\"-1\" autocomplete=\"off\"></p>" +
            (cfg.showDemoNote && cfg.mode === "demo" ? "<p class=\"tbm-sked__note\">" + escapeHtml(t.demoNote) + "</p>" : "") +
            "<button type=\"submit\" class=\"tbm-sked__submit\">" + escapeHtml(t.submit) + "</button>" +
          "</div>" +
        "</div>" +
      "</form>" +
      "<div class=\"tbm-sked__thanks\" role=\"status\">" +
        "<h2>" + escapeHtml(t.thanks) + "</h2>" +
        "<p>" + escapeHtml(t.thanksLead) + " <strong data-summary></strong></p>" +
        "<p>" + escapeHtml(t.thanksBody) + "</p>" +
        (cfg.phone ? "<a class=\"tbm-sked__call\" href=\"" + escapeHtml(call) + "\">" + escapeHtml(t.call) + " " + escapeHtml(cfg.phone) + "</a><br>" : "") +
        "<button type=\"button\" class=\"tbm-sked__again\">" + escapeHtml(t.again) + "</button>" +
      "</div>";
  }

  function field(name, label, type, auto) {
    return "<div class=\"tbm-sked__field\"><label for=\"sked-" + name + "\">" + escapeHtml(label) + "</label>" +
      "<input id=\"sked-" + name + "\" name=\"" + name + "\" type=\"" + type + "\" autocomplete=\"" + auto + "\" required>" +
      "<span class=\"tbm-sked__err\" data-err=\"" + name + "\"></span></div>";
  }

  function mount(el, options) {
    if (!el) return;
    var cfg = merge(DEFAULTS, merge(dataOpts(el), options || (root.TBM_SCHEDULER || {})));
    if (cfg.lang !== "es") cfg.lang = "en";
    var t = I18N[cfg.lang];
    var today = startOfDay(new Date());
    var last = startOfDay(new Date());
    last.setDate(last.getDate() + Number(cfg.daysOut || 14));
    var view = new Date(today.getFullYear(), today.getMonth(), 1);
    var selectedDay = null;
    var selectedWin = null;
    var calOpen = false;

    el.classList.add("tbm-sked");
    el.innerHTML = buildMarkup(t, cfg);
    if (cfg.city) el.querySelector("[name=city]").value = cfg.city;

    var whenBtn = $("#skedWhen", el);
    var whenLabel = $("[data-when-label]", el);
    var cal = $("#skedCal", el);
    var grid = $("[data-grid]", el);
    var dow = $(".tbm-sked__dow", el);
    var monthLabel = $("[data-month]", el);
    var slotsWrap = $("[data-slots]", el);
    var slotBtns = $("[data-slot-btns]", el);
    var form = $("form", el);

    dow.innerHTML = (cfg.lang === "es" ? DOW_ES : DOW_EN).map(function (d) {
      return "<span>" + d + "</span>";
    }).join("");

    function closed(date) {
      return (cfg.closedDays || []).indexOf(date.getDay()) !== -1;
    }
    function inRange(date) {
      var s = startOfDay(date);
      return s >= today && s <= last && !closed(s);
    }
    function formatWhen() {
      if (!selectedDay || !selectedWin) return t.select;
      var d = selectedDay;
      var dayNames = cfg.lang === "es" ? DAYS_ES : DAYS_EN;
      var months = cfg.lang === "es" ? MONTHS_ES : MONTHS_EN;
      var label = windowLabel(selectedWin, cfg.lang);
      if (cfg.lang === "es") {
        return label + " el " + dayNames[d.getDay()] + ", " + d.getDate() + " de " + months[d.getMonth()];
      }
      return label + " on " + dayNames[d.getDay()] + ", " + months[d.getMonth()] + " " + d.getDate();
    }
    function syncWhen() {
      var set = !!(selectedDay && selectedWin);
      whenLabel.textContent = formatWhen();
      whenBtn.classList.toggle("is-set", set);
    }
    function slotOpen(date, win) {
      if (!inRange(date)) return false;
      var now = new Date();
      if (ymd(date) !== ymd(now)) return true;
      return now.getHours() < Number(win.startHour);
    }
    function renderSlots() {
      slotBtns.innerHTML = "";
      if (!selectedDay) {
        slotsWrap.classList.remove("is-on");
        return;
      }
      slotsWrap.classList.add("is-on");
      (cfg.windows || []).forEach(function (win) {
        var b = document.createElement("button");
        b.type = "button";
        b.className = "tbm-sked__slot";
        b.textContent = windowLabel(win, cfg.lang);
        b.disabled = !slotOpen(selectedDay, win);
        if (selectedWin && selectedWin.id === win.id) b.classList.add("is-on");
        b.addEventListener("click", function () {
          selectedWin = win;
          syncWhen();
          renderSlots();
          setCal(false);
        });
        slotBtns.appendChild(b);
      });
    }
    function renderGrid() {
      var months = cfg.lang === "es" ? MONTHS_ES : MONTHS_EN;
      monthLabel.textContent = months[view.getMonth()] + " " + view.getFullYear();
      var first = new Date(view.getFullYear(), view.getMonth(), 1);
      var startPad = first.getDay();
      var daysIn = new Date(view.getFullYear(), view.getMonth() + 1, 0).getDate();
      var html = "";
      var i;
      for (i = 0; i < startPad; i++) html += "<button type=\"button\" class=\"tbm-sked__day is-empty\" disabled></button>";
      for (i = 1; i <= daysIn; i++) {
        var d = new Date(view.getFullYear(), view.getMonth(), i);
        var ok = inRange(d);
        var on = selectedDay && ymd(selectedDay) === ymd(d);
        var cls = "tbm-sked__day";
        if (ymd(d) === ymd(today)) cls += " is-today";
        if (on) cls += " is-on";
        html += "<button type=\"button\" class=\"" + cls + "\" data-day=\"" + ymd(d) + "\"" + (ok ? "" : " disabled") + ">" + i + "</button>";
      }
      grid.innerHTML = html;
      var prev = $("[data-nav='-1']", el);
      var next = $("[data-nav='1']", el);
      var prevMonth = new Date(view.getFullYear(), view.getMonth(), 1);
      var nextMonth = new Date(view.getFullYear(), view.getMonth() + 1, 1);
      prev.disabled = prevMonth <= new Date(today.getFullYear(), today.getMonth(), 1);
      next.disabled = nextMonth > last;
    }
    function setCal(open) {
      calOpen = open;
      cal.hidden = !open;
      cal.classList.toggle("is-open", open);
      whenBtn.setAttribute("aria-expanded", open ? "true" : "false");
    }

    whenBtn.addEventListener("click", function () {
      setCal(!calOpen);
      if (calOpen) renderGrid();
    });
    el.querySelectorAll("[data-nav]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        view.setMonth(view.getMonth() + Number(btn.getAttribute("data-nav")));
        renderGrid();
      });
    });
    grid.addEventListener("click", function (e) {
      var btn = e.target.closest("[data-day]");
      if (!btn || btn.disabled) return;
      var parts = btn.getAttribute("data-day").split("-");
      selectedDay = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
      selectedWin = null;
      syncWhen();
      renderGrid();
      renderSlots();
    });

    function showErr(name, msg) {
      var input = el.querySelector("[name=\"" + name + "\"]");
      var err = el.querySelector("[data-err=\"" + name + "\"]");
      if (input) input.classList.toggle("is-bad", !!msg);
      if (err) {
        err.textContent = msg || "";
        err.classList.toggle("is-on", !!msg);
      }
    }
    function val(name) {
      var node = el.querySelector("[name=\"" + name + "\"]");
      return node ? String(node.value || "").trim() : "";
    }

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var ok = true;
      ["name","phone","email","street","city","zip","help"].forEach(function (n) { showErr(n, ""); });
      whenBtn.classList.remove("is-error");
      if (!selectedDay || !selectedWin) {
        whenBtn.classList.add("is-error");
        setCal(true);
        renderGrid();
        ok = false;
      }
      function need(n, pred, msg) {
        if (!pred(val(n))) { showErr(n, msg); ok = false; }
      }
      need("name", function (v) { return v.length > 1; }, t.needField);
      need("phone", function (v) { return digits(v).length >= 10; }, t.needPhone);
      need("email", emailOk, t.needEmail);
      need("street", function (v) { return v.length > 3; }, t.needField);
      need("city", function (v) { return v.length > 1; }, t.needField);
      need("zip", function (v) { return /^\d{5}(-\d{4})?$/.test(v); }, t.needZip);
      need("help", function (v) { return v.length > 2; }, t.needField);
      if (val("website")) return;
      if (!ok) return;

      var payload = {
        business: cfg.business,
        name: val("name"),
        phone: val("phone"),
        email: val("email"),
        street: val("street"),
        city: val("city"),
        state: val("state"),
        country: val("country") || "USA",
        zip: val("zip"),
        notes: val("help"),
        date: ymd(selectedDay),
        window: windowLabel(selectedWin, cfg.lang),
        when: formatWhen(),
        lang: cfg.lang,
        source: "tbm-scheduler",
        mode: cfg.mode
      };

      var submitBtn = $(".tbm-sked__submit", el);
      function done() {
        $("[data-summary]", el).textContent = payload.when;
        el.classList.add("is-done");
        submitBtn.disabled = false;
        submitBtn.textContent = t.submit;
      }

      if (cfg.mode === "demo") {
        done();
        return;
      }

      submitBtn.disabled = true;
      submitBtn.textContent = t.sending;

      if (cfg.mode === "mailto" && cfg.email) {
        var body = [
          "Appointment request for " + cfg.business,
          "When: " + payload.when,
          "Name: " + payload.name,
          "Phone: " + payload.phone,
          "Email: " + payload.email,
          "Address: " + payload.street + ", " + payload.city + ", " + payload.state + " " + payload.zip,
          "Job: " + payload.notes
        ].join("\n");
        root.location.href = "mailto:" + encodeURIComponent(cfg.email) +
          "?subject=" + encodeURIComponent("Appointment: " + payload.when) +
          "&body=" + encodeURIComponent(body);
        done();
        return;
      }

      var url = cfg.endpoint;
      if (cfg.mode === "formsubmit" && (cfg.formsubmit || cfg.email)) {
        url = "https://formsubmit.co/ajax/" + encodeURIComponent(cfg.formsubmit || cfg.email);
      }
      if (!url) { done(); return; }
      fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(payload)
      }).catch(function () {}).then(done);
    });

    $(".tbm-sked__again", el).addEventListener("click", function () {
      el.classList.remove("is-done");
      form.reset();
      if (cfg.city) el.querySelector("[name=city]").value = cfg.city;
      selectedDay = null;
      selectedWin = null;
      syncWhen();
      renderSlots();
    });

    renderGrid();
    el._tbmSked = { cfg: cfg };
  }

  function boot() {
    var node = document.getElementById("tbm-scheduler");
    if (node) mount(node, root.TBM_SCHEDULER || {});
  }

  root.TbmScheduler = { mount: mount, boot: boot };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})(window);
