/* Scratch-N-Dent Superstore demo.
   Shop login is a demo client-side check only. It is not real security. */
(function () {
  "use strict";

  var PHONE = "+12106555442";
  var MAP = "https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent("11803 Perrin Beitel Road, San Antonio, TX 78217");
  var STORE_KEY = "snd-inventory-v2";
  var AUTH_KEY = "snd-shop-auth";
  var CATS = ["Washers and Dryers", "Gas Stoves", "Electric Ranges", "Microwaves", "Refrigerators", "Dishwashers", "Freezers"];
  var CAT_ES = {
    "Washers and Dryers": "Lavadoras y secadoras",
    "Gas Stoves": "Estufas de gas",
    "Electric Ranges": "Estufas eléctricas",
    "Microwaves": "Microondas",
    "Refrigerators": "Refrigeradores",
    "Dishwashers": "Lavavajillas",
    "Freezers": "Congeladores"
  };
  var CONDITIONS = ["New - Scratch & Dent", "New - Open Box", "New - Cosmetic Blemish"];
  var COND_ES = {
    "New - Scratch & Dent": "Nuevo, rayón y golpe",
    "New - Open Box": "Nuevo, caja abierta",
    "New - Cosmetic Blemish": "Nuevo, detalle de apariencia"
  };
  function catLabel(name) { return currentLang() === "es" && CAT_ES[name] ? CAT_ES[name] : name; }
  function condLabel(name) { return currentLang() === "es" && COND_ES[name] ? COND_ES[name] : name; }
  var SEED_LAUNDRY = {
    s3: { laundry: "washer", fuel: "" },
    s4: { laundry: "washer", fuel: "" },
    s5: { laundry: "dryer", fuel: "electric" },
    s6: { laundry: "dryer", fuel: "gas" }
  };
  function laundryKind(item) {
    return item && (item.laundry === "washer" || item.laundry === "dryer") ? item.laundry : "";
  }
  function dryerFuel(item) {
    if (laundryKind(item) !== "dryer") return "";
    return item.fuel === "gas" || item.fuel === "electric" ? item.fuel : "";
  }
  function laundryLabel(item) {
    var kind = laundryKind(item);
    if (kind === "washer") return t("washer");
    if (kind !== "dryer") return "";
    var fuel = dryerFuel(item);
    if (fuel === "gas") return t("gasDryer");
    if (fuel === "electric") return t("electricDryer");
    return t("dryer");
  }
  function laundrySearch(item) {
    var kind = laundryKind(item);
    var fuel = dryerFuel(item);
    if (kind === "washer") return "washer washers lavadora lavadoras";
    if (kind === "dryer" && fuel === "gas") return "dryer dryers gas secadora secadoras";
    if (kind === "dryer" && fuel === "electric") return "dryer dryers electric secadora secadoras electrica eléctrica";
    if (kind === "dryer") return "dryer dryers secadora secadoras";
    return "";
  }

  var SEED = [
    { id: "s1", title: "Stainless French-door refrigerator", category: "Refrigerators", brand: "", model: "", condition: "New - Scratch & Dent", price: 1099, was: 1599, photos: ["assets/images/fridge-french-door.jpg"], description: "Sample listing. The photo is a sample picture of a French-door refrigerator. It is not a unit on the floor, and the price is not real.", sample: true, sold: false, floor: true, created: "2026-10-24T18:00:00" },
    { id: "s2", title: "White top-freezer refrigerator", category: "Refrigerators", brand: "", model: "", condition: "New - Open Box", price: 749, was: 1099, photos: ["assets/images/fridge-topfreezer.jpg"], description: "Sample listing. The photo is a sample picture of a top-freezer refrigerator. Not current stock and not a real price.", sample: true, sold: false, floor: false, created: "2026-10-23T18:00:00" },
    { id: "s3", title: "Samsung front-load washer", category: "Washers and Dryers", laundry: "washer", fuel: "", brand: "Samsung", model: "", condition: "New - Scratch & Dent", price: 649, was: 999, photos: ["assets/images/washer-samsung.jpg"], description: "Sample listing. Samsung is on the machine in this sales-floor photo. The model and price are not a live offer.", sample: true, sold: false, floor: true, created: "2026-10-24T17:00:00" },
    { id: "s4", title: "Top-load washer", category: "Washers and Dryers", laundry: "washer", fuel: "", brand: "", model: "", condition: "New - Cosmetic Blemish", price: 429, was: 699, photos: ["assets/images/washer-topload.jpg"], description: "Sample listing. The photo is a sample picture of a top-load washer. Not current stock and not a real price.", sample: true, sold: false, floor: false, created: "2026-10-22T17:00:00" },
    { id: "s5", title: "White electric dryer", category: "Washers and Dryers", laundry: "dryer", fuel: "electric", brand: "", model: "", condition: "New - Scratch & Dent", price: 549, was: 849, photos: ["assets/images/dryer-electric.jpg"], description: "Sample listing. The photo is a sample picture of an electric dryer. Not current stock and not a real price.", sample: true, sold: false, floor: true, created: "2026-10-24T16:00:00" },
    { id: "s6", title: "Gas dryer", category: "Washers and Dryers", laundry: "dryer", fuel: "gas", brand: "", model: "", condition: "New - Open Box", price: 499, was: 799, photos: ["assets/images/dryer-gas.jpg"], description: "Sample listing. The photo is a sample picture of a gas dryer. Not current stock and not a real price.", sample: true, sold: false, floor: false, created: "2026-10-21T16:00:00" },
    { id: "s7", title: "Stainless gas range", category: "Gas Stoves", brand: "", model: "", condition: "New - Scratch & Dent", price: 699, was: 1099, photos: ["assets/images/gas-range-stainless.jpg"], description: "Sample listing. The photo is a sample picture of a gas range. Not current stock and not a real price.", sample: true, sold: false, floor: true, created: "2026-10-24T15:00:00" },
    { id: "s8", title: "White gas range", category: "Gas Stoves", brand: "", model: "", condition: "New - Cosmetic Blemish", price: 579, was: 899, photos: ["assets/images/gas-range-white.jpg"], description: "Sample listing. The photo is a sample picture of a white gas range. Not current stock and not a real price.", sample: true, sold: false, floor: false, created: "2026-10-20T15:00:00" },
    { id: "s9", title: "Stainless electric range", category: "Electric Ranges", brand: "", model: "", condition: "New - Scratch & Dent", price: 529, was: 829, photos: ["assets/images/electric-range-stainless.jpg"], description: "Sample listing. The photo is a sample picture of a smooth-top electric range. Not current stock and not a real price.", sample: true, sold: false, floor: true, created: "2026-10-24T14:00:00" },
    { id: "s10", title: "Black electric range", category: "Electric Ranges", brand: "", model: "", condition: "New - Open Box", price: 459, was: 749, photos: ["assets/images/electric-range-black.jpg"], description: "Sample listing. The photo is a sample picture of a black electric range. Not current stock and not a real price.", sample: true, sold: false, floor: false, created: "2026-10-19T14:00:00" },
    { id: "s11", title: "Countertop microwave", category: "Microwaves", brand: "", model: "", condition: "New - Cosmetic Blemish", price: 129, was: 199, photos: ["assets/images/microwave-counter.jpg"], description: "Sample listing. The photo is a sample picture of a countertop microwave. Not current stock and not a real price.", sample: true, sold: false, floor: true, created: "2026-10-24T13:00:00" },
    { id: "s12", title: "Over-the-range microwave", category: "Microwaves", brand: "", model: "", condition: "New - Scratch & Dent", price: 189, was: 299, photos: ["assets/images/microwave-otr.jpg"], description: "Sample listing. The photo is a sample picture of an over-the-range microwave. Not current stock and not a real price.", sample: true, sold: false, floor: false, created: "2026-10-18T13:00:00" },
    { id: "s13", title: "Compact upright freezer", category: "Freezers", brand: "", model: "", condition: "New - Scratch & Dent", price: 449, was: 699, photos: ["assets/images/freezer-upright.jpg"], description: "Sample listing. The photo is a sample picture of an upright freezer. Not current stock and not a real price.", sample: true, sold: false, floor: true, created: "2026-10-24T12:00:00" },
    { id: "s14", title: "Chest freezer", category: "Freezers", brand: "", model: "", condition: "New - Open Box", price: 399, was: 599, photos: ["assets/images/freezer-chest.jpg"], description: "Sample listing. The photo is a sample picture of a chest freezer. Not current stock and not a real price.", sample: true, sold: false, floor: false, created: "2026-10-17T12:00:00" },
    { id: "s15", title: "Stainless dishwasher", category: "Dishwashers", brand: "", model: "", condition: "New - Scratch & Dent", price: 379, was: 599, photos: ["assets/images/dishwasher-stainless.jpg"], description: "Sample listing. The photo is a sample picture of a dishwasher. Not current stock and not a real price.", sample: true, sold: false, floor: true, created: "2026-10-24T11:00:00" },
    { id: "s16", title: "White dishwasher", category: "Dishwashers", brand: "", model: "", condition: "New - Cosmetic Blemish", price: 329, was: 499, photos: ["assets/images/dishwasher-white.jpg"], description: "Sample listing marked sold so the sold ribbon can be previewed. Not a live dishwasher.", sample: true, sold: true, floor: false, created: "2026-10-16T11:00:00" }
  ];

  var COPY = {
    en: {
      sample: "SAMPLE", sold: "SOLD", call: "Call", text: "Text", directions: "Get directions",
      samplePrice: "Sample price", results: "{n} on this list", none: "Nothing matches. Clear the filters or call the store.",
      warranty: "New but blemished, with a factory warranty. Call for the terms on a specific unit.",
      sampleNote: "Sample listing. Not current stock and not a real price.",
      close: "Close", filters: "Filters", loginTitle: "Shop login", user: "Username", pass: "Password",
      enter: "Log in", bad: "That username or password is not right.",
      adminTitle: "Floor list", demoNote: "Demo login saved in this browser only. Not real security.",
      add: "Add to the list", save: "Save changes", cancel: "Cancel", remove: "Remove", edit: "Edit",
      hold: "Hold", release: "Take off hold", holdFor: "On hold for {name}", onHold: "On hold",
      holdName: "Name", holdSave: "Put on hold", holdNeed: "Add the name it is held for.",
      logout: "Log out", needTitle: "Add a title and a price.", photos: "Photos",
      tabList: "Inventory", tabEdit: "Add or edit", addItem: "Add an item",
      photoHint: "The front photo is the one on the product card. Move photos left or right.",
      front: "Front", moveLeft: "Left", moveRight: "Right",
      washer: "Washer", dryer: "Dryer", gasDryer: "Gas dryer", electricDryer: "Electric dryer",
      gas: "Gas", electric: "Electric",
      laundryType: "Washer or dryer", laundryPick: "Choose washer or dryer",
      dryerFuel: "Gas or electric", fuelPick: "Choose gas or electric",
      needLaundry: "Choose washer or dryer.", needFuel: "Choose gas or electric.",
      showSold: "Show sold", brandAll: "All brands", catAll: "All categories",
      sortNew: "Newest", sortLow: "Price: low to high", sortHigh: "Price: high to low",
      open: "Open now · Closes at 5 PM",
      closedToday: "Closed · Opens today at 9 AM",
      closedSun: "Closed · Opens Monday at 9 AM",
      closedEve: "Closed · Opens tomorrow at 9 AM",
      sms: "Hi, I am asking about {title}.",
      was: "Was", model: "Model on request", clear: "Clear filters",
      sent: "Thanks. This preview does not send the form. Call 210-655-5442 and the store will help."
    },
    es: {
      sample: "MUESTRA", sold: "VENDIDO", call: "Llamar", text: "Texto", directions: "Cómo llegar",
      samplePrice: "Precio de muestra", results: "{n} en esta lista", none: "Nada coincide. Quite los filtros o llame a la tienda.",
      warranty: "Nuevo, con detalles de apariencia, y con garantía de fábrica. Llame para saber los términos de una pieza.",
      sampleNote: "Anuncio de muestra. No es inventario actual y el precio no es real.",
      close: "Cerrar", filters: "Filtros", loginTitle: "Entrada de la tienda", user: "Usuario", pass: "Contraseña",
      enter: "Entrar", bad: "Ese usuario o contraseña no es correcto.",
      adminTitle: "Lista del piso", demoNote: "Entrada de demostración guardada solo en este navegador. No es seguridad real.",
      add: "Agregar a la lista", save: "Guardar cambios", cancel: "Cancelar", remove: "Quitar", edit: "Editar",
      hold: "Apartar", release: "Quitar el apartado", holdFor: "Apartado para {name}", onHold: "Apartado",
      holdName: "Nombre", holdSave: "Apartar", holdNeed: "Ponga el nombre de la persona.",
      logout: "Salir", needTitle: "Ponga un título y un precio.", photos: "Fotos",
      tabList: "Inventario", tabEdit: "Agregar o editar", addItem: "Agregar uno",
      photoHint: "La foto de enfrente es la que sale en la tarjeta. Muévalas a la izquierda o a la derecha.",
      front: "Frente", moveLeft: "Izquierda", moveRight: "Derecha",
      washer: "Lavadora", dryer: "Secadora", gasDryer: "Secadora de gas", electricDryer: "Secadora eléctrica",
      gas: "Gas", electric: "Eléctrica",
      laundryType: "Lavadora o secadora", laundryPick: "Elija lavadora o secadora",
      dryerFuel: "Gas o eléctrica", fuelPick: "Elija gas o eléctrica",
      needLaundry: "Elija lavadora o secadora.", needFuel: "Elija gas o eléctrica.",
      showSold: "Ver vendidos", brandAll: "Todas las marcas", catAll: "Todas las categorías",
      sortNew: "Más nuevos", sortLow: "Precio: menor a mayor", sortHigh: "Precio: mayor a menor",
      open: "Abierto ahora · Cierra a las 5 PM",
      closedToday: "Cerrado · Abre hoy a las 9 AM",
      closedSun: "Cerrado · Abre el lunes a las 9 AM",
      closedEve: "Cerrado · Abre mañana a las 9 AM",
      sms: "Hola, pregunto por {title}.",
      was: "Antes", model: "Modelo a preguntar", clear: "Quitar filtros",
      sent: "Gracias. Esta vista previa no envía el formulario. Llame al 210-655-5442 y la tienda le ayuda."
    }
  };

  function t(key) {
    var lang = currentLang();
    return (COPY[lang] && COPY[lang][key]) || COPY.en[key] || key;
  }
  function currentLang() {
    var root = document.getElementById("page-root");
    return (root && root.getAttribute("data-lang")) || "en";
  }
  function assetBase() {
    var root = document.getElementById("page-root");
    return (root && root.getAttribute("data-base")) || "";
  }
  function src(path) {
    if (!path) return "";
    if (/^(data:|https?:|blob:)/.test(path)) return path;
    return assetBase() + path;
  }
  function money(n) {
    var v = Number(n);
    if (!v) return "";
    return "$" + v.toLocaleString("en-US");
  }
  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  function loadItems() {
    try {
      var raw = localStorage.getItem(STORE_KEY);
      if (raw) {
        var parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          var changed = false;
          parsed.forEach(function (item) {
            var patch = SEED_LAUNDRY[item.id];
            if (!patch || item.category !== "Washers and Dryers" || item.laundry) return;
            item.laundry = patch.laundry;
            item.fuel = patch.fuel;
            changed = true;
          });
          if (changed) saveItems(parsed);
          return parsed;
        }
      }
    } catch (e) {}
    localStorage.setItem(STORE_KEY, JSON.stringify(SEED));
    return SEED.map(function (item) { return Object.assign({}, item); });
  }
  function saveItems(items) {
    localStorage.setItem(STORE_KEY, JSON.stringify(items));
  }
  function authed() {
    try { return sessionStorage.getItem(AUTH_KEY) === "1"; } catch (e) { return false; }
  }

  function chicagoParts() {
    var parts = new Intl.DateTimeFormat("en-US", {
      timeZone: "America/Chicago", weekday: "short", hour: "2-digit", minute: "2-digit", hourCycle: "h23"
    }).formatToParts(new Date());
    var out = {};
    parts.forEach(function (p) { if (p.type !== "literal") out[p.type] = p.value; });
    return out;
  }
  function paintHours() {
    var el = document.getElementById("openStatus");
    if (!el) return;
    var p = chicagoParts();
    var day = p.weekday;
    var mins = (parseInt(p.hour, 10) || 0) * 60 + (parseInt(p.minute, 10) || 0);
    var open = mins >= 9 * 60 && mins < 17 * 60 && day !== "Sun";
    el.classList.toggle("is-open", open);
    el.classList.toggle("is-closed", !open);
    if (open) el.textContent = t("open");
    else if (day === "Sun" || (day === "Sat" && mins >= 17 * 60)) el.textContent = t("closedSun");
    else if (mins >= 17 * 60) el.textContent = t("closedEve");
    else el.textContent = t("closedToday");
  }
  function paintYears() {
    var year = parseInt(new Intl.DateTimeFormat("en-US", { timeZone: "America/Chicago", year: "numeric" }).format(new Date()), 10);
    document.querySelectorAll("[data-years]").forEach(function (el) { el.textContent = String(year - 1990); });
    document.querySelectorAll("[data-year]").forEach(function (el) { el.textContent = String(year); });
  }

  function filters() {
    var root = document.getElementById("page-root");
    function val(id) { var n = root.querySelector("#" + id); return n ? n.value : ""; }
    function on(id) { var n = root.querySelector("#" + id); return !!(n && n.checked); }
    return {
      q: val("q").trim().toLowerCase(),
      cat: val("fCat"),
      laundry: val("fLaundry"),
      brand: val("fBrand"),
      cond: val("fCond"),
      min: val("fMin"),
      max: val("fMax"),
      sold: on("fSold"),
      sort: val("fSort") || "new"
    };
  }
  function match(item, f) {
    if (!f.sold && item.sold) return false;
    if (f.cat && item.category !== f.cat) return false;
    if (f.laundry === "washer" && laundryKind(item) !== "washer") return false;
    if (f.laundry === "dryer" && laundryKind(item) !== "dryer") return false;
    if (f.laundry === "gas" && dryerFuel(item) !== "gas") return false;
    if (f.laundry === "electric" && dryerFuel(item) !== "electric") return false;
    if (f.brand && item.brand !== f.brand) return false;
    if (f.cond && item.condition !== f.cond) return false;
    var price = Number(item.price) || 0;
    if (f.min !== "" && price < Number(f.min)) return false;
    if (f.max !== "" && price > Number(f.max)) return false;
    if (f.q) {
      var blob = [item.title, titleOf(item), catLabel(item.category), laundrySearch(item), item.brand, item.model, item.description, item.category, item.condition].join(" ").toLowerCase();
      if (blob.indexOf(f.q) === -1) return false;
    }
    return true;
  }
  function fillSelects() {
    var items = loadItems();
    var brands = {};
    var cats = {};
    CATS.forEach(function (c) { cats[c] = 1; });
    items.forEach(function (item) {
      if (item.brand) brands[item.brand] = 1;
      if (item.category) cats[item.category] = 1;
    });
    var f = filters();
    var cat = document.getElementById("fCat");
    var brand = document.getElementById("fBrand");
    if (cat) {
      var cur = f.cat;
      cat.innerHTML = '<option value="">' + esc(t("catAll")) + "</option>" + Object.keys(cats).map(function (c) {
        return '<option value="' + esc(c) + '">' + esc(catLabel(c)) + "</option>";
      }).join("");
      if (window.__sndPendingCat) {
        cat.value = window.__sndPendingCat;
        window.__sndPendingCat = "";
      } else {
        cat.value = cur;
      }
    }
    if (brand) {
      var curB = f.brand;
      brand.innerHTML = '<option value="">' + esc(t("brandAll")) + "</option>" + Object.keys(brands).sort().map(function (b) {
        return '<option value="' + esc(b) + '">' + esc(b) + "</option>";
      }).join("");
      brand.value = curB;
    }
  }
  function render() {
    var box = document.getElementById("grid");
    var count = document.getElementById("resultCount");
    if (!box) return;
    if (!window.__sndCatChecked) {
      window.__sndCatChecked = true;
      try {
        var qcat = new URLSearchParams(window.location.search).get("cat") || "";
        if (qcat) window.__sndPendingCat = qcat;
      } catch (err) {}
    }
    fillSelects();
    var f = filters();
    var scope = box.getAttribute("data-scope") || "all";
    var items = loadItems().filter(function (item) {
      if (scope === "floor" && !item.floor) return false;
      return match(item, f);
    });
    items.sort(function (a, b) {
      if (f.sort === "low") return (Number(a.price) || 0) - (Number(b.price) || 0);
      if (f.sort === "high") return (Number(b.price) || 0) - (Number(a.price) || 0);
      return String(b.created || "").localeCompare(String(a.created || ""));
    });
    if (count) count.textContent = t("results").replace("{n}", String(items.length));
    if (!items.length) {
      box.innerHTML = '<p class="note">' + esc(t("none")) + "</p>";
      return;
    }
    box.innerHTML = items.map(function (item) {
      var photo = (item.photos && item.photos[0]) || "assets/images/storefront.jpg";
      var meta = [item.brand, item.model].filter(Boolean).join(" · ");
      var kindLine = laundryLabel(item);
      return '<button type="button" class="card" data-open="' + esc(item.id) + '">' +
        (item.sample ? '<span class="flag">' + esc(t("sample")) + "</span>" : "") +
        (item.sold ? '<span class="sold">' + esc(t("sold")) + "</span>" : "") +
        '<img src="' + esc(src(photo)) + '" alt="' + esc(titleOf(item)) + '" loading="lazy">' +
        '<span class="card__body"><span class="cond">' + esc(condLabel(item.condition || "")) + "</span>" +
        '<span class="card__title">' + esc(titleOf(item)) + "</span>" +
        (kindLine ? '<span class="cond">' + esc(kindLine) + "</span>" : "") +
        (meta ? '<span class="card__meta">' + esc(meta) + "</span>" : '<span class="card__meta">' + esc(t("model")) + "</span>") +
        '<span class="price">' + esc(money(item.price)) + (item.was ? " <s>" + esc(money(item.was)) + "</s>" : "") + "</span>" +
        (item.sample ? '<span class="card__meta">' + esc(t("samplePrice")) + "</span>" : "") +
        (item.holdFor ? '<span class="card__meta">' + esc(t("onHold")) + "</span>" : "") +
        "</span></button>";
    }).join("");
  }
  var TITLE_ES = {
    s1: "Refrigerador de acero, puertas francesas",
    s2: "Refrigerador blanco con congelador arriba",
    s3: "Lavadora de carga frontal Samsung",
    s4: "Lavadora de carga superior",
    s5: "Secadora eléctrica blanca",
    s6: "Secadora de gas",
    s7: "Estufa de gas de acero",
    s8: "Estufa de gas blanca",
    s9: "Estufa eléctrica de acero",
    s10: "Estufa eléctrica negra",
    s11: "Microondas de mostrador",
    s12: "Microondas sobre la estufa",
    s13: "Congelador vertical compacto",
    s14: "Congelador horizontal",
    s15: "Lavavajillas de acero",
    s16: "Lavavajillas blanco"
  };
  function titleOf(item) {
    if (currentLang() === "es" && item.sample && TITLE_ES[item.id]) return TITLE_ES[item.id];
    return item.title;
  }
  function blurb(item) {
    if (currentLang() === "es" && item.sample) return "Anuncio de muestra. La foto es del piso de ventas. No es inventario actual y el precio no es real.";
    return item.description || "";
  }
  function findItem(id) {
    return loadItems().filter(function (item) { return item.id === id; })[0];
  }
  function sms(item) {
    return "sms:" + PHONE + "?body=" + encodeURIComponent(t("sms").replace("{title}", titleOf(item)));
  }
  function openDetail(id) {
    var item = findItem(id);
    var modal = document.getElementById("detail");
    if (!item || !modal) return;
    var photos = item.photos && item.photos.length ? item.photos : [];
    modal.innerHTML =
      '<button type="button" class="linkish" data-close="detail">' + esc(t("close")) + "</button>" +
      (photos[0] ? '<img class="modal__photo" src="' + esc(src(photos[0])) + '" alt="' + esc(titleOf(item)) + '">' : "") +
      (item.sample ? '<p class="flag" style="position:static;display:inline-block;margin-top:.6rem">' + esc(t("sample")) + "</p>" : "") +
      (item.sold ? '<p class="cond">' + esc(t("sold")) + "</p>" : "") +
      (item.holdFor ? '<p class="cond">' + esc(t("onHold")) + "</p>" : "") +
      "<h3>" + esc(titleOf(item)) + "</h3>" +
      (laundryLabel(item) ? "<p class='cond'>" + esc(laundryLabel(item)) + "</p>" : "") +
      "<p>" + esc([item.brand, item.model].filter(Boolean).join(" · ") || t("model")) + "</p>" +
      "<p class='cond'>" + esc(condLabel(item.condition || "")) + "</p>" +
      "<p class='price'>" + esc(money(item.price)) + (item.was ? " <s>" + esc(t("was")) + " " + esc(money(item.was)) + "</s>" : "") + "</p>" +
      "<p style='margin-top:.6rem'>" + esc(blurb(item)) + "</p>" +
      "<p class='tiny' style='margin-top:.5rem'>" + esc(t("warranty")) + "</p>" +
      (photos.length > 1 ? "<div class='chips'>" + photos.map(function (p) {
        return '<button type="button" data-swap-photo="' + esc(p) + '"><img src="' + esc(src(p)) + '" alt="" style="width:72px;height:54px;object-fit:cover;border-radius:8px"></button>';
      }).join("") + "</div>" : "") +
      '<div class="actions"><a class="btn" href="tel:' + PHONE + '">' + esc(t("call")) + '</a>' +
      '<a class="btn btn--ink" href="' + sms(item) + '">' + esc(t("text")) + '</a>' +
      '<a class="btn btn--line" href="' + MAP + '" target="_blank" rel="noopener">' + esc(t("directions")) + "</a></div>";
    modal.hidden = false;
    document.getElementById("detailBack").hidden = false;
  }

  var editing = "";
  var holding = "";
  var shopTab = "list";
  var editPhotos = [];
  function shopForm(item) {
    item = item || {};
    var cats = CATS.slice();
    if (item.category && cats.indexOf(item.category) === -1) cats.push(item.category);
    var catNow = item.category || CATS[0];
    var kind = item.laundry === "dryer" ? "dryer" : (item.laundry === "washer" ? "washer" : "");
    var fuel = item.fuel === "gas" ? "gas" : (item.fuel === "electric" ? "electric" : "");
    var L = currentLang() === "es"
      ? { title: "Título", category: "Categoría", brand: "Marca", model: "Modelo", condition: "Condición", price: "Precio", was: "Precio de lista", sold: "Vendido", description: "Descripción" }
      : { title: "Title", category: "Category", brand: "Brand", model: "Model", condition: "Condition", price: "Price", was: "List price", sold: "Sold", description: "Description" };
    return '<form id="itemForm" class="form">' +
      '<input type="hidden" name="id" value="' + esc(item.id || "") + '">' +
      '<label class="field">' + esc(L.title) + '<input name="title" required value="' + esc(item.title || "") + '"></label>' +
      '<label class="field">' + esc(L.category) + '<select name="category">' + cats.map(function (c) {
        return '<option value="' + esc(c) + '"' + (c === catNow ? " selected" : "") + ">" + esc(catLabel(c)) + "</option>";
      }).join("") + "</select></label>" +
      '<div class="laundry-fields" id="laundryFields"' + (catNow === "Washers and Dryers" ? "" : " hidden") + ">" +
      '<label class="field">' + esc(t("laundryType")) + '<select name="laundry">' +
      '<option value="">' + esc(t("laundryPick")) + "</option>" +
      '<option value="washer"' + (kind === "washer" ? " selected" : "") + ">" + esc(t("washer")) + "</option>" +
      '<option value="dryer"' + (kind === "dryer" ? " selected" : "") + ">" + esc(t("dryer")) + "</option>" +
      "</select></label>" +
      '<label class="field" id="fuelField"' + (kind === "dryer" ? "" : " hidden") + ">" + esc(t("dryerFuel")) + '<select name="fuel">' +
      '<option value="">' + esc(t("fuelPick")) + "</option>" +
      '<option value="electric"' + (fuel === "electric" ? " selected" : "") + ">" + esc(t("electric")) + "</option>" +
      '<option value="gas"' + (fuel === "gas" ? " selected" : "") + ">" + esc(t("gas")) + "</option>" +
      "</select></label></div>" +
      '<label class="field">' + esc(L.brand) + '<input name="brand" value="' + esc(item.brand || "") + '"></label>' +
      '<label class="field">' + esc(L.model) + '<input name="model" value="' + esc(item.model || "") + '"></label>' +
      '<label class="field">' + esc(L.condition) + '<select name="condition">' + CONDITIONS.map(function (c) {
        return '<option value="' + esc(c) + '"' + (c === item.condition ? " selected" : "") + ">" + esc(condLabel(c)) + "</option>";
      }).join("") + "</select></label>" +
      '<div class="field field--row"><label class="field">' + esc(L.price) + '<input name="price" type="number" min="0" step="1" required value="' + esc(item.price || "") + '"></label>' +
      '<label class="field">' + esc(L.was) + '<input name="was" type="number" min="0" step="1" value="' + esc(item.was || "") + '"></label></div>' +
      '<label class="field">' + esc(t("photos")) + '<input name="photos" type="file" accept="image/*" multiple>' +
      '<span class="tiny">' + esc(t("photoHint")) + '</span><div id="photoStrip"></div></label>' +
      '<label class="field">' + esc(L.description) + '<textarea name="description" rows="3">' + esc(item.description || "") + "</textarea></label>" +
      '<label class="check"><input type="checkbox" name="sold"' + (item.sold ? " checked" : "") + "> " + esc(L.sold) + "</label>" +
      '<p class="tiny" id="itemMsg"></p>' +
      '<button class="btn" type="submit">' + esc(item.id ? t("save") : t("add")) + "</button>" +
      (item.id ? '<button class="btn btn--line" type="button" data-cancel-edit>' + esc(t("cancel")) + "</button>" : "") +
      "</form>";
  }
  function paintPhotoStrip() {
    var strip = document.getElementById("photoStrip");
    if (!strip) return;
    if (!editPhotos.length) { strip.innerHTML = ""; return; }
    strip.innerHTML = editPhotos.map(function (photo, i) {
      return '<div class="photo-card' + (i === 0 ? " is-front" : "") + '">' +
        '<img src="' + esc(src(photo)) + '" alt="">' +
        (i === 0 ? '<span class="photo-card__front">' + esc(t("front")) + "</span>" : "<span></span>") +
        '<span class="photo-card__moves">' +
        '<button type="button" data-photo-move="-1" data-photo-index="' + i + '"' + (i === 0 ? " disabled" : "") + ">" + esc(t("moveLeft")) + "</button>" +
        '<button type="button" data-photo-move="1" data-photo-index="' + i + '"' + (i === editPhotos.length - 1 ? " disabled" : "") + ">" + esc(t("moveRight")) + "</button>" +
        "</span></div>";
    }).join("");
  }
  function openEditor(id) {
    var item = id ? findItem(id) : null;
    editing = id || "";
    editPhotos = item && item.photos ? item.photos.slice() : [];
    shopTab = "edit";
    holding = "";
    paintShop();
  }
  function paintShop() {
    var box = document.getElementById("shopPage");
    if (!box) return;
    var heading = document.getElementById("shopHeading");
    if (!authed()) {
      if (heading) heading.textContent = t("loginTitle");
      box.innerHTML = '<p class="tiny">' + esc(t("demoNote")) + "</p>" +
        '<form id="loginForm" class="form"><label class="field">' + esc(t("user")) + '<input name="user" autocomplete="username"></label>' +
        '<label class="field">' + esc(t("pass")) + '<input name="pass" type="password" autocomplete="current-password"></label>' +
        '<p class="tiny" id="loginMsg"></p><button class="btn" type="submit">' + esc(t("enter")) + "</button></form>";
      return;
    }
    if (heading) heading.textContent = t("adminTitle");
    var items = loadItems();
    var tab = shopTab === "edit" ? "edit" : "list";
    var list = '<p><button type="button" class="btn btn--line" data-add-item>' + esc(t("addItem")) + "</button></p>" +
      '<div class="admin-list">' + items.map(function (item) {
        var photo = (item.photos && item.photos[0]) || "assets/images/storefront.jpg";
        var kindLine = laundryLabel(item);
        var held = item.holdFor ? '<span class="admin-row__hold">' + esc(t("holdFor").replace("{name}", item.holdFor)) + "</span>" : "";
        var holdForm = holding === item.id
          ? '<form id="holdForm" class="hold-form"><input type="hidden" name="id" value="' + esc(item.id) + '">' +
            '<input name="holdFor" required placeholder="' + esc(t("holdName")) + '" aria-label="' + esc(t("holdName")) + '" value="' + esc(item.holdFor || "") + '">' +
            '<button class="btn btn--sm" type="submit">' + esc(t("holdSave")) + "</button>" +
            '<button class="btn btn--line btn--sm" type="button" data-cancel-hold>' + esc(t("cancel")) + "</button>" +
            '<p class="tiny" id="holdMsg"></p></form>'
          : "";
        var holdBtn = holding === item.id ? "" : (item.holdFor
          ? '<button type="button" class="linkish" data-release="' + esc(item.id) + '">' + esc(t("release")) + "</button>"
          : '<button type="button" class="linkish" data-hold="' + esc(item.id) + '">' + esc(t("hold")) + "</button>");
        return '<div class="admin-row"><img class="admin-thumb" src="' + esc(src(photo)) + '" alt="' + esc(titleOf(item)) + '">' +
          '<span class="admin-row__main"><span class="admin-row__name">' + esc(titleOf(item)) + (kindLine ? " · " + esc(kindLine) : "") + (item.sold ? " · " + esc(t("sold")) : "") + "</span>" +
          held + holdForm + "</span>" +
          '<span class="admin-row__actions"><button type="button" class="linkish" data-edit="' + esc(item.id) + '">' + esc(t("edit")) + "</button>" +
          '<button type="button" class="linkish" data-remove="' + esc(item.id) + '">' + esc(t("remove")) + "</button>" +
          holdBtn + "</span></div>";
      }).join("") + "</div>";
    box.innerHTML = '<p class="tiny">' + esc(t("demoNote")) + "</p>" +
      '<div class="shop-tabs" role="tablist">' +
      '<button type="button" role="tab" data-shop-tab="list" aria-selected="' + (tab === "list" ? "true" : "false") + '">' + esc(t("tabList")) + "</button>" +
      '<button type="button" role="tab" data-shop-tab="edit" aria-selected="' + (tab === "edit" ? "true" : "false") + '">' + esc(t("tabEdit")) + "</button>" +
      "</div>" +
      (tab === "edit" ? shopForm(editing ? findItem(editing) : null) : list) +
      '<p style="margin-top:.8rem"><button type="button" class="linkish" data-logout>' + esc(t("logout")) + "</button></p>";
    if (tab === "edit") paintPhotoStrip();
  }

  function readFiles(input) {
    var files = input && input.files ? Array.prototype.slice.call(input.files) : [];
    return Promise.all(files.map(function (file) {
      return new Promise(function (resolve) {
        var reader = new FileReader();
        reader.onload = function () { resolve(String(reader.result || "")); };
        reader.onerror = function () { resolve(""); };
        reader.readAsDataURL(file);
      });
    })).then(function (list) { return list.filter(Boolean); });
  }

  function onClick(e) {
    var burger = e.target.closest("#navToggle");
    if (burger) {
      var links = document.getElementById("navLinks");
      var open = links.classList.toggle("is-open");
      burger.setAttribute("aria-expanded", open ? "true" : "false");
      return;
    }
    if (e.target.closest(".nav__links a")) {
      var nav = document.getElementById("navLinks");
      if (nav) nav.classList.remove("is-open");
    }
    var catBtn = e.target.closest("[data-cat]");
    if (catBtn) {
      var sel = document.getElementById("fCat");
      if (sel) sel.value = catBtn.getAttribute("data-cat");
      var laundrySel = document.getElementById("fLaundry");
      if (laundrySel) laundrySel.value = "";
      render();
      var inv = document.getElementById("inventory");
      if (inv) inv.scrollIntoView({ behavior: "smooth" });
    }
    if (e.target.closest("[data-filters]")) {
      document.getElementById("filters").classList.add("is-open");
    }
    if (e.target.closest("[data-close-filters]")) {
      document.getElementById("filters").classList.remove("is-open");
    }
    var openId = e.target.closest("[data-open]");
    if (openId) openDetail(openId.getAttribute("data-open"));
    if (e.target.closest("[data-close='detail']") || e.target.id === "detailBack") {
      document.getElementById("detail").hidden = true;
      document.getElementById("detailBack").hidden = true;
    }
    var photoBtn = e.target.closest("[data-swap-photo]");
    if (photoBtn) {
      var img = document.querySelector("#detail .modal__photo");
      if (img) img.src = src(photoBtn.getAttribute("data-swap-photo"));
    }
    if (e.target.closest("[data-clear]")) {
      ["q", "fCat", "fLaundry", "fBrand", "fCond", "fMin", "fMax"].forEach(function (id) {
        var n = document.getElementById(id);
        if (n) n.value = "";
      });
      var sold = document.getElementById("fSold");
      if (sold) sold.checked = false;
      var sort = document.getElementById("fSort");
      if (sort) sort.value = "new";
      render();
    }
    var tabBtn = e.target.closest("[data-shop-tab]");
    if (tabBtn) {
      shopTab = tabBtn.getAttribute("data-shop-tab") === "edit" ? "edit" : "list";
      paintShop();
      return;
    }
    if (e.target.closest("[data-add-item]")) { openEditor(""); return; }
    var photoMove = e.target.closest("[data-photo-move]");
    if (photoMove && !photoMove.disabled) {
      var index = Number(photoMove.getAttribute("data-photo-index"));
      var dest = index + Number(photoMove.getAttribute("data-photo-move"));
      if (dest >= 0 && dest < editPhotos.length) {
        var moved = editPhotos[index];
        editPhotos[index] = editPhotos[dest];
        editPhotos[dest] = moved;
        paintPhotoStrip();
      }
      return;
    }
    var edit = e.target.closest("[data-edit]");
    if (edit) { openEditor(edit.getAttribute("data-edit")); return; }
    if (e.target.closest("[data-cancel-edit]")) { editing = ""; editPhotos = []; shopTab = "list"; paintShop(); }
    var remove = e.target.closest("[data-remove]");
    if (remove) {
      var id = remove.getAttribute("data-remove");
      saveItems(loadItems().filter(function (item) { return item.id !== id; }));
      if (editing === id) { editing = ""; editPhotos = []; shopTab = "list"; }
      render();
      paintShop();
    }
    var holdBtn = e.target.closest("[data-hold]");
    if (holdBtn) { holding = holdBtn.getAttribute("data-hold"); paintShop(); }
    if (e.target.closest("[data-cancel-hold]")) { holding = ""; paintShop(); }
    var release = e.target.closest("[data-release]");
    if (release) {
      var rid = release.getAttribute("data-release");
      saveItems(loadItems().map(function (item) {
        return item.id === rid ? Object.assign({}, item, { holdFor: "" }) : item;
      }));
      holding = "";
      render();
      paintShop();
    }
    if (e.target.closest("[data-logout]")) {
      try { sessionStorage.removeItem(AUTH_KEY); } catch (err) {}
      editing = "";
      holding = "";
      editPhotos = [];
      shopTab = "list";
      paintShop();
    }
  }
  function onInput(e) {
    var target = e.target;
    if (!target || !target.closest) return;
    if (target.closest("#itemForm")) {
      if (e.type === "change" && target.name === "photos") {
        readFiles(target).then(function (added) {
          editPhotos = editPhotos.concat(added);
          target.value = "";
          paintPhotoStrip();
        });
      } else if (target.name === "category") {
        var laundryBox = document.getElementById("laundryFields");
        if (laundryBox) laundryBox.hidden = target.value !== "Washers and Dryers";
      } else if (target.name === "laundry") {
        var fuelBox = document.getElementById("fuelField");
        if (fuelBox) fuelBox.hidden = target.value !== "dryer";
      }
      return;
    }
    if (target.id === "fLaundry") {
      var cat = document.getElementById("fCat");
      if (cat && target.value && cat.value && cat.value !== "Washers and Dryers") cat.value = "Washers and Dryers";
    }
    if (target.id === "fCat") {
      var pickedLaundry = document.getElementById("fLaundry");
      if (pickedLaundry && target.value && target.value !== "Washers and Dryers") pickedLaundry.value = "";
    }
    if (target.closest("#filters, #q, #fSort, #fSold")) render();
  }
  function onSubmit(e) {
    var login = e.target.closest("#loginForm");
    if (login) {
      e.preventDefault();
      var user = String(new FormData(login).get("user") || "").trim().toLowerCase();
      var pass = String(new FormData(login).get("pass") || "");
      if (user === "s&d" && pass === "1234") {
        try { sessionStorage.setItem(AUTH_KEY, "1"); } catch (err) {}
        shopTab = "list";
        paintShop();
      } else {
        var msg = document.getElementById("loginMsg");
        if (msg) msg.textContent = t("bad");
      }
      return;
    }
    var holdForm = e.target.closest("#holdForm");
    if (holdForm) {
      e.preventDefault();
      var holdData = new FormData(holdForm);
      var holdName = String(holdData.get("holdFor") || "").trim();
      var holdId = String(holdData.get("id") || "");
      if (!holdName) {
        var holdMsg = document.getElementById("holdMsg");
        if (holdMsg) holdMsg.textContent = t("holdNeed");
        return;
      }
      saveItems(loadItems().map(function (item) {
        return item.id === holdId ? Object.assign({}, item, { holdFor: holdName }) : item;
      }));
      holding = "";
      render();
      paintShop();
      return;
    }
    var itemForm = e.target.closest("#itemForm");
    if (itemForm) {
      e.preventDefault();
      var data = new FormData(itemForm);
      var title = String(data.get("title") || "").trim();
      var price = Number(data.get("price"));
      if (!title || !price) return;
      var category = String(data.get("category") || CATS[0]);
      var laundry = "";
      var fuel = "";
      var itemMsg = document.getElementById("itemMsg");
      if (category === "Washers and Dryers") {
        laundry = String(data.get("laundry") || "");
        if (laundry !== "washer" && laundry !== "dryer") {
          if (itemMsg) itemMsg.textContent = t("needLaundry");
          return;
        }
        if (laundry === "dryer") {
          fuel = String(data.get("fuel") || "");
          if (fuel !== "gas" && fuel !== "electric") {
            if (itemMsg) itemMsg.textContent = t("needFuel");
            return;
          }
        }
      }
      readFiles(itemForm.querySelector('input[name="photos"]')).then(function (photos) {
        var items = loadItems();
        var id = String(data.get("id") || "");
        var prev = id ? findItem(id) : null;
        var next = {
          id: id || ("i" + Date.now()),
          title: title,
          category: category,
          laundry: laundry,
          fuel: fuel,
          brand: String(data.get("brand") || "").trim(),
          model: String(data.get("model") || "").trim(),
          condition: String(data.get("condition") || CONDITIONS[0]),
          price: price,
          was: Number(data.get("was")) || 0,
          photos: editPhotos.concat(photos.filter(function (p) { return editPhotos.indexOf(p) === -1; })),
          description: String(data.get("description") || "").trim(),
          sample: prev ? !!prev.sample : false,
          floor: prev ? !!prev.floor : false,
          sold: !!itemForm.querySelector('[name="sold"]').checked,
          holdFor: prev && prev.holdFor ? prev.holdFor : "",
          created: (prev && prev.created) || new Date().toISOString()
        };
        if (prev) items = items.map(function (item) { return item.id === id ? next : item; });
        else items.unshift(next);
        saveItems(items);
        editing = "";
        holding = "";
        editPhotos = [];
        shopTab = "list";
        render();
        paintShop();
      });
      return;
    }
    var contact = e.target.closest("#contactForm");
    if (contact) {
      e.preventDefault();
      contact.hidden = true;
      var ok = document.getElementById("contactOk");
      if (ok) { ok.hidden = false; ok.textContent = t("sent"); }
    }
  }

  function bindPage() {
    var root = document.getElementById("page-root");
    if (!root || root.dataset.bound === "1") return;
    root.dataset.bound = "1";
    root.addEventListener("click", onClick);
    root.addEventListener("input", onInput);
    root.addEventListener("change", onInput);
    root.addEventListener("submit", onSubmit);
  }

  function syncHeadFromResponse(html) {
    if (!html) return;
    var doc = new DOMParser().parseFromString(html, "text/html");
    if (doc.title) document.title = doc.title;
    var lang = doc.documentElement.getAttribute("lang");
    if (lang) document.documentElement.setAttribute("lang", lang);
    ["description"].forEach(function (name) {
      var srcN = doc.querySelector('meta[name="' + name + '"]');
      var live = document.querySelector('meta[name="' + name + '"]');
      if (srcN && live) live.setAttribute("content", srcN.getAttribute("content") || "");
    });
    var canon = doc.querySelector('link[rel="canonical"]');
    var canonLive = document.querySelector('link[rel="canonical"]');
    if (canon && canonLive) canonLive.setAttribute("href", canon.getAttribute("href") || "");
    document.querySelectorAll('link[rel="alternate"][hreflang]').forEach(function (n) { n.remove(); });
    doc.querySelectorAll('link[rel="alternate"][hreflang]').forEach(function (n) { document.head.appendChild(n.cloneNode(true)); });
    ["og:title", "og:description", "og:url", "og:locale"].forEach(function (prop) {
      var srcM = doc.querySelector('meta[property="' + prop + '"]');
      var liveM = document.querySelector('meta[property="' + prop + '"]');
      if (srcM && liveM) liveM.setAttribute("content", srcM.getAttribute("content") || "");
    });
  }

  function boot() {
    bindPage();
    paintHours();
    paintYears();
    render();
    paintShop();
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
  document.addEventListener("htmx:afterOnLoad", function (evt) {
    var xhr = evt.detail && evt.detail.xhr;
    if (xhr && xhr.responseText) syncHeadFromResponse(xhr.responseText);
  });
  document.addEventListener("htmx:afterSettle", function () {
    boot();
    if (window.htmx) {
      var root = document.getElementById("page-root");
      if (root) window.htmx.process(root);
    }
    if (!window.location.hash) window.scrollTo(0, 0);
  });

  var STORAGE_KEY = "snd-accent";
  var STORAGE_HEX = "snd-accent-hex";
  var STORAGE_HEADER = "snd-header";
  var STORAGE_OMBRE = "snd-ombre";
  var CUSTOM_VARS = ["--accent", "--accent-2", "--accent-3", "--accent-deep", "--accent-rgb", "--on-accent"];
  var ACCENTS = { original: "#ff6347", red: "#e10600", green: "#12b85a", cobalt: "#0047ab", yellow: "#e6b800", orange: "#ff5c00" };
  var draggingWheel = false;
  function currentAccent() { return document.documentElement.getAttribute("data-accent") || "original"; }
  function currentHex() {
    if (currentAccent() === "custom") {
      try { return localStorage.getItem(STORAGE_HEX) || ACCENTS.original; } catch (e) { return ACCENTS.original; }
    }
    return ACCENTS[currentAccent()] || ACCENTS.original;
  }
  function clearCustomVars() { CUSTOM_VARS.forEach(function (p) { document.documentElement.style.removeProperty(p); }); }
  function hexToRgb(hex) {
    var n = String(hex || "").replace("#", "");
    if (n.length === 3) n = n[0] + n[0] + n[1] + n[1] + n[2] + n[2];
    return { r: parseInt(n.slice(0, 2), 16) || 0, g: parseInt(n.slice(2, 4), 16) || 0, b: parseInt(n.slice(4, 6), 16) || 0 };
  }
  function toHex(n) { var s = Math.max(0, Math.min(255, Math.round(n))).toString(16); return s.length === 1 ? "0" + s : s; }
  function mixHex(hex, toward, amt) {
    var a = hexToRgb(hex), b = hexToRgb(toward);
    return "#" + toHex(a.r + (b.r - a.r) * amt) + toHex(a.g + (b.g - a.g) * amt) + toHex(a.b + (b.b - a.b) * amt);
  }
  function syncCustomUi(hex, on) {
    var sw = document.getElementById("customSwatch");
    var inp = document.getElementById("themeColor");
    var lab = document.querySelector(".theme-custom");
    var code = document.getElementById("customHex");
    if (sw) sw.style.background = hex || ACCENTS.original;
    if (inp && hex) inp.value = hex;
    if (lab) lab.classList.toggle("is-active", !!on);
    if (code) code.textContent = on && hex ? String(hex).toUpperCase() : "";
  }
  function hexToHsv(hex) {
    var rgb = hexToRgb(hex);
    var r = rgb.r / 255, g = rgb.g / 255, b = rgb.b / 255;
    var max = Math.max(r, g, b), min = Math.min(r, g, b), d = max - min;
    var h = 0, s = max === 0 ? 0 : d / max, v = max;
    if (d) {
      if (max === r) h = (g - b) / d + (g < b ? 6 : 0);
      else if (max === g) h = (b - r) / d + 2;
      else h = (r - g) / d + 4;
      h *= 60;
    }
    return { h: h, s: s, v: v };
  }
  function hsvToHex(h, s, v) {
    h = ((h % 360) + 360) % 360;
    var c = v * s, x = c * (1 - Math.abs((h / 60) % 2 - 1)), m = v - c, r = 0, g = 0, b = 0;
    if (h < 60) { r = c; g = x; }
    else if (h < 120) { r = x; g = c; }
    else if (h < 180) { g = c; b = x; }
    else if (h < 240) { g = x; b = c; }
    else if (h < 300) { r = x; b = c; }
    else { r = c; b = x; }
    return "#" + toHex((r + m) * 255) + toHex((g + m) * 255) + toHex((b + m) * 255);
  }
  function syncWheel(hex) {
    var hsv = hexToHsv(hex || ACCENTS.original);
    var disc = document.querySelector(".theme-wheel__disc");
    var knob = document.getElementById("themeWheelKnob");
    var wheel = document.getElementById("themeWheel");
    var slider = document.getElementById("themeWheelValue");
    if (wheel) wheel.style.setProperty("--wheel-v", String(hsv.v));
    if (slider && document.activeElement !== slider) slider.value = String(Math.round(hsv.v * 100));
    if (!disc || !knob) return;
    var R = disc.offsetWidth / 2 - 7;
    var rad = hsv.h * Math.PI / 180;
    knob.style.transform = "translate(" + (Math.sin(rad) * hsv.s * R) + "px," + (-Math.cos(rad) * hsv.s * R) + "px)";
  }
  function applyHeader(mode) {
    if (mode !== "light" && mode !== "dark") mode = "flex";
    document.documentElement.setAttribute("data-header", mode);
    try { localStorage.setItem(STORAGE_HEADER, mode === "dark" ? "black" : mode); } catch (e) {}
    document.querySelectorAll("[data-header-mode]").forEach(function (btn) {
      var on = btn.getAttribute("data-header-mode") === mode;
      btn.setAttribute("aria-pressed", on ? "true" : "false");
      btn.classList.toggle("is-active", on);
    });
  }
  function applyCustomHex(hex, fromWheel) {
    if (!hex) return;
    var rgb = hexToRgb(hex);
    var lum = (0.2126 * rgb.r + 0.7152 * rgb.g + 0.0722 * rgb.b) / 255;
    var root = document.documentElement;
    root.setAttribute("data-accent", "custom");
    root.style.setProperty("--accent", hex);
    root.style.setProperty("--accent-2", mixHex(hex, "#ffffff", 0.22));
    root.style.setProperty("--accent-3", mixHex(hex, "#ffffff", 0.45));
    root.style.setProperty("--accent-deep", mixHex(hex, "#000000", 0.35));
    root.style.setProperty("--accent-rgb", rgb.r + ", " + rgb.g + ", " + rgb.b);
    root.style.setProperty("--on-accent", lum > 0.62 ? "#1a1400" : "#ffffff");
    try { localStorage.setItem(STORAGE_KEY, "custom"); localStorage.setItem(STORAGE_HEX, hex); } catch (e) {}
    document.querySelectorAll("#themeMenu [data-accent]").forEach(function (btn) {
      btn.classList.remove("is-active"); btn.setAttribute("aria-checked", "false");
    });
    syncCustomUi(hex, true);
    if (!fromWheel) syncWheel(hex);
  }
  function applyAccent(name) {
    if (name === "custom") {
      var hex = "";
      try { hex = localStorage.getItem(STORAGE_HEX) || ""; } catch (e) {}
      if (hex) { applyCustomHex(hex); return; }
      name = "original";
    }
    if (!ACCENTS[name]) name = "original";
    clearCustomVars();
    if (name === "original") document.documentElement.removeAttribute("data-accent");
    else document.documentElement.setAttribute("data-accent", name);
    try {
      if (name === "original") { localStorage.removeItem(STORAGE_KEY); localStorage.removeItem(STORAGE_HEX); }
      else { localStorage.setItem(STORAGE_KEY, name); localStorage.removeItem(STORAGE_HEX); }
    } catch (e) {}
    document.querySelectorAll("#themeMenu [data-accent]").forEach(function (btn) {
      var on = btn.getAttribute("data-accent") === name;
      btn.classList.toggle("is-active", on);
      btn.setAttribute("aria-checked", on ? "true" : "false");
    });
    syncCustomUi(ACCENTS.original, false);
    syncWheel(ACCENTS[name]);
  }
  function applyOmbre(on) {
    document.documentElement.setAttribute("data-ombre", on ? "1" : "0");
    try { localStorage.setItem(STORAGE_OMBRE, on ? "1" : "0"); } catch (e) {}
    var btn = document.getElementById("ombreToggle");
    if (btn) {
      btn.setAttribute("aria-pressed", on ? "true" : "false");
      btn.classList.toggle("is-active", !!on);
    }
  }
  function initThemeMenu() {
    var toggle = document.getElementById("themeToggle");
    var menu = document.getElementById("themeMenu");
    if (!toggle || !menu) return;
    var stored = "original";
    try { stored = localStorage.getItem(STORAGE_KEY) || "original"; } catch (e) {}
    applyAccent(stored);
    var header = "flex";
    try { header = localStorage.getItem(STORAGE_HEADER) || "flex"; } catch (e) {}
    if (header === "0" || header === "light") header = "light";
    else if (header === "black" || header === "dark") header = "dark";
    else header = "flex";
    applyHeader(header);
    var ombreOn = true;
    try { if (localStorage.getItem(STORAGE_OMBRE) === "0") ombreOn = false; } catch (e) {}
    applyOmbre(ombreOn);
    var ombreBtn = document.getElementById("ombreToggle");
    if (ombreBtn) ombreBtn.onclick = function (ev) { ev.stopPropagation(); applyOmbre(document.documentElement.getAttribute("data-ombre") !== "1"); };
    toggle.onclick = function (ev) {
      ev.stopPropagation();
      var open = toggle.getAttribute("aria-expanded") === "true";
      toggle.setAttribute("aria-expanded", open ? "false" : "true");
      menu.hidden = open;
      if (!open) requestAnimationFrame(function () { syncWheel(currentHex()); });
    };
    menu.querySelectorAll("[data-accent]").forEach(function (btn) {
      btn.onclick = function (ev) { ev.stopPropagation(); applyAccent(btn.getAttribute("data-accent")); };
    });
    var picker = document.getElementById("themeColor");
    if (picker) {
      picker.onclick = function (ev) { ev.stopPropagation(); };
      picker.oninput = function (ev) { ev.stopPropagation(); applyCustomHex(picker.value); };
    }
    document.querySelectorAll("[data-header-mode]").forEach(function (btn) {
      btn.onclick = function (ev) { ev.stopPropagation(); applyHeader(btn.getAttribute("data-header-mode")); };
    });
    var wheel = document.getElementById("themeWheel");
    var slider = document.getElementById("themeWheelValue");
    if (wheel) {
      function pick(ev) {
        var r = wheel.getBoundingClientRect();
        var dx = ev.clientX - (r.left + r.width / 2);
        var dy = ev.clientY - (r.top + r.height / 2);
        var sat = Math.min(1, Math.sqrt(dx * dx + dy * dy) / (r.width / 2 - 6));
        var hue = Math.atan2(dx, -dy) * 180 / Math.PI;
        if (hue < 0) hue += 360;
        var val = slider ? parseFloat(slider.value) / 100 : 1;
        var hex = hsvToHex(hue, sat, val);
        applyCustomHex(hex, true);
        syncWheel(hex);
      }
      wheel.onpointerdown = function (ev) {
        ev.preventDefault(); ev.stopPropagation(); draggingWheel = true;
        try { wheel.setPointerCapture(ev.pointerId); } catch (err) {}
        pick(ev);
      };
      wheel.onpointermove = function (ev) { if (!draggingWheel) return; ev.preventDefault(); pick(ev); };
      wheel.onpointerup = wheel.onpointercancel = function () { draggingWheel = false; };
    }
    if (slider) {
      slider.onclick = function (ev) { ev.stopPropagation(); };
      slider.oninput = function (ev) {
        ev.stopPropagation();
        var hsv = hexToHsv(currentHex());
        var hex = hsvToHex(hsv.h, hsv.s, parseFloat(slider.value) / 100);
        applyCustomHex(hex, true);
        syncWheel(hex);
      };
    }
    if (!window.__sndThemeBound) {
      window.__sndThemeBound = true;
      document.addEventListener("click", function (ev) {
        if (draggingWheel) return;
        var tg = document.getElementById("themeToggle");
        var mn = document.getElementById("themeMenu");
        if (!tg || !mn || mn.hidden) return;
        if (!mn.contains(ev.target) && !tg.contains(ev.target)) {
          mn.hidden = true; tg.setAttribute("aria-expanded", "false");
        }
      });
      document.addEventListener("keydown", function (ev) {
        if (ev.key !== "Escape") return;
        var tg = document.getElementById("themeToggle");
        var mn = document.getElementById("themeMenu");
        if (tg && mn && !mn.hidden) { mn.hidden = true; tg.setAttribute("aria-expanded", "false"); }
        ["detail", "shop"].forEach(function (id) {
          var node = document.getElementById(id);
          var back = document.getElementById(id + "Back");
          if (node) node.hidden = true;
          if (back) back.hidden = true;
        });
        var filtersEl = document.getElementById("filters");
        if (filtersEl) filtersEl.classList.remove("is-open");
      });
    }
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", initThemeMenu);
  else initThemeMenu();
  document.addEventListener("htmx:afterSwap", function () { initThemeMenu(); });
})();
