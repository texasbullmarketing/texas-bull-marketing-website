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
    { id: "s3", slug: "samsung-front-load-washer", title: "Samsung front-load washer", titleEs: "Lavadora Samsung de carga frontal", category: "Washers and Dryers", laundry: "washer", fuel: "", brand: "Samsung", model: "WF45A6400AV", condition: "New - Scratch & Dent", price: 649, was: 999, photos: ["assets/images/washer-samsung.jpg"], description: "Front-load washer, dark finish. Scratch on the top panel. Samsung badge is on the front.", descriptionEs: "Lavadora de carga frontal, acabado oscuro. Rayón en la tapa. La placa Samsung está al frente.", sample: true, sold: false, floor: true, created: "2026-10-24T17:00:00" },
    { id: "s5", slug: "white-electric-dryer", title: "White electric dryer", titleEs: "Secadora eléctrica blanca", category: "Washers and Dryers", laundry: "dryer", fuel: "electric", brand: "", model: "WED8127LC", condition: "New - Scratch & Dent", price: 549, was: 849, photos: ["assets/images/dryer-electric.jpg"], description: "Electric dryer, white. Small dent on the top left corner.", descriptionEs: "Secadora eléctrica, blanca. Golpe pequeño en la esquina superior izquierda.", sample: true, sold: false, floor: true, created: "2026-10-24T16:00:00" },
    { id: "s6", slug: "gas-dryer", title: "Gas dryer", titleEs: "Secadora de gas", category: "Washers and Dryers", laundry: "dryer", fuel: "gas", brand: "", model: "MGD5030MW", condition: "New - Open Box", price: 499, was: 799, photos: ["assets/images/dryer-gas.jpg"], description: "Gas dryer. Scuff along the door edge.", descriptionEs: "Secadora de gas. Raspón en el borde de la puerta.", sample: true, sold: false, floor: true, created: "2026-10-24T15:30:00" },
    { id: "s1", slug: "stainless-french-door-refrigerator", title: "Stainless French-door refrigerator", titleEs: "Refrigerador de acero, puertas francesas", category: "Refrigerators", brand: "", model: "WRF535SWHZ", condition: "New - Scratch & Dent", price: 1099, was: 1599, photos: ["assets/images/fridge-french-door.jpg"], description: "French-door refrigerator, stainless. Dent on the left door.", descriptionEs: "Refrigerador de puertas francesas, acero. Golpe en la puerta izquierda.", sample: true, sold: false, floor: true, created: "2026-10-24T18:00:00" },
    { id: "s7", slug: "stainless-gas-range", title: "Stainless gas range", titleEs: "Estufa de gas de acero", category: "Gas Stoves", brand: "", model: "JGBS66REKSS", condition: "New - Scratch & Dent", price: 699, was: 1099, photos: ["assets/images/gas-range-stainless.jpg"], description: "Gas range, stainless. Scratch across the backguard.", descriptionEs: "Estufa de gas, acero. Rayón en el respaldo.", sample: true, sold: false, floor: true, created: "2026-10-24T15:00:00" },
    { id: "s11", slug: "countertop-microwave", title: "Countertop microwave", titleEs: "Microondas de mostrador", category: "Microwaves", brand: "", model: "JES1095SMSS", condition: "New - Cosmetic Blemish", price: 129, was: 199, photos: ["assets/images/microwave-counter.jpg"], description: "Countertop microwave. Rub mark on the handle.", descriptionEs: "Microondas de mostrador. Marca en la agarradera.", sample: true, sold: false, floor: true, created: "2026-10-24T13:00:00" },
    { id: "s16", slug: "white-dishwasher", title: "White dishwasher", titleEs: "Lavavajillas blanco", category: "Dishwashers", brand: "", model: "WDF520PADM", condition: "New - Cosmetic Blemish", price: 329, was: 499, photos: ["assets/images/dishwasher-white.jpg"], description: "White dishwasher. Mark on the top edge of the door.", descriptionEs: "Lavavajillas blanco. Marca en el borde superior de la puerta.", sample: true, sold: true, floor: false, created: "2026-10-16T11:00:00" }
  ];

  var COPY = {
    en: {
      sold: "SOLD", call: "Call", text: "Text", directions: "Get directions",
      results: "{n} on this list", none: "Nothing matches. Clear the filters or call the store.",
      warranty: "New but blemished, with a factory warranty. Call for the terms on a specific unit.",
      close: "Close", filters: "Filters", loginTitle: "Shop login", user: "Username", pass: "Password",
      enter: "Log in", bad: "That username or password is not right.",
      adminTitle: "Floor list", demoNote: "This login stays in this browser only. It is not real security.",
      add: "Add to the list", save: "Save changes", cancel: "Cancel", remove: "Remove", edit: "Edit",
      hold: "Hold", release: "Take off hold", holdFor: "On hold for {name}", onHold: "On hold",
      holdName: "Name", holdSave: "Put on hold", holdNeed: "Add the name it is held for.",
      logout: "Log out", needTitle: "Add a title and a price.", photos: "Photos",
      tabList: "Inventory", tabEdit: "Add or edit", addItem: "Add an item",
      photoHint: "The front photo is the one on the product card. Move photos left or right.",
      front: "Front", moveLeft: "Left", moveRight: "Right",
      washer: "Washer", dryer: "Dryer", gasDryer: "Gas dryer", electricDryer: "Electric dryer",
      optWashers: "Washers", optDryers: "Dryers", optGasDryers: "Gas dryers", optElectricDryers: "Electric dryers",
      gas: "Gas", electric: "Electric",
      laundryType: "Washer or dryer", laundryPick: "Choose washer or dryer",
      dryerFuel: "Gas or electric", fuelPick: "Choose gas or electric",
      needLaundry: "Choose washer or dryer.", needFuel: "Choose gas or electric.",
      showSold: "Show sold", brandAll: "All brands", catAll: "All categories",
      sortNew: "Newest", sortLow: "Price low to high", sortHigh: "Price high to low", sortBrand: "Brand A–Z",
      open: "Open now · Closes at 5 PM",
      closedToday: "Closed · Opens today at 9 AM",
      closedSun: "Closed · Opens Monday at 9 AM",
      closedEve: "Closed · Opens tomorrow at 9 AM",
      sms: "Hi, I am asking about {title}.",
      was: "Was", model: "Ask for model", askModel: "Ask for model", clear: "Clear filters",
      titleEn: "Title in English", titleEs: "Title in Spanish",
      descEn: "Description in English", descEs: "Description in Spanish",
      needTitle: "Add the English title.", needTitleEs: "Add the Spanish title.",
      needDesc: "Add the English description.", needDescEs: "Add the Spanish description.",
      modelHint: "Leave this blank only if the card should say Ask for model.",
      removeHint: "Permanently deletes this item.",
      holdHint: "Keeps it off the public site for now. Does not delete it.",
      soldHint: "Marks it sold and hides it from the public site.",
      removeConfirm: "Permanently delete {title}? This cannot be undone.",
      backInventory: "Back to inventory", gone: "This appliance is not on the public list.",
      brandLabel: "Brand", modelLabel: "Model", categoryLabel: "Category", typeLabel: "Type",
      conditionLabel: "Condition", priceLabel: "Price", listLabel: "List price",
      noneBrand: "Not listed",
      sent: "Thanks. Call 210-655-5442 and the store will help."
    },
    es: {
      sold: "VENDIDO", call: "Llamar", text: "Texto", directions: "Cómo llegar",
      results: "{n} en esta lista", none: "Nada coincide. Quite los filtros o llame a la tienda.",
      warranty: "Nuevo, con detalles de apariencia, y con garantía de fábrica. Llame para saber los términos de una pieza.",
      close: "Cerrar", filters: "Filtros", loginTitle: "Entrada de la tienda", user: "Usuario", pass: "Contraseña",
      enter: "Entrar", bad: "Ese usuario o contraseña no es correcto.",
      adminTitle: "Lista del piso", demoNote: "Esta entrada se guarda solo en este navegador. No es seguridad real.",
      add: "Agregar a la lista", save: "Guardar cambios", cancel: "Cancelar", remove: "Quitar", edit: "Editar",
      hold: "Apartar", release: "Quitar el apartado", holdFor: "Apartado para {name}", onHold: "Apartado",
      holdName: "Nombre", holdSave: "Apartar", holdNeed: "Ponga el nombre de la persona.",
      logout: "Salir", needTitle: "Ponga un título y un precio.", photos: "Fotos",
      tabList: "Inventario", tabEdit: "Agregar o editar", addItem: "Agregar uno",
      photoHint: "La foto de enfrente es la que sale en la tarjeta. Muévalas a la izquierda o a la derecha.",
      front: "Frente", moveLeft: "Izquierda", moveRight: "Derecha",
      washer: "Lavadora", dryer: "Secadora", gasDryer: "Secadora de gas", electricDryer: "Secadora eléctrica",
      optWashers: "Lavadoras", optDryers: "Secadoras", optGasDryers: "Secadoras de gas", optElectricDryers: "Secadoras eléctricas",
      gas: "Gas", electric: "Eléctrica",
      laundryType: "Lavadora o secadora", laundryPick: "Elija lavadora o secadora",
      dryerFuel: "Gas o eléctrica", fuelPick: "Elija gas o eléctrica",
      needLaundry: "Elija lavadora o secadora.", needFuel: "Elija gas o eléctrica.",
      showSold: "Ver vendidos", brandAll: "Todas las marcas", catAll: "Todas las categorías",
      sortNew: "Más nuevos", sortLow: "Precio menor a mayor", sortHigh: "Precio mayor a menor", sortBrand: "Marca A–Z",
      open: "Abierto ahora · Cierra a las 5 PM",
      closedToday: "Cerrado · Abre hoy a las 9 AM",
      closedSun: "Cerrado · Abre el lunes a las 9 AM",
      closedEve: "Cerrado · Abre mañana a las 9 AM",
      sms: "Hola, pregunto por {title}.",
      was: "Antes", model: "Pregunte el modelo", askModel: "Pregunte el modelo", clear: "Quitar filtros",
      titleEn: "Título en inglés", titleEs: "Título en español",
      descEn: "Descripción en inglés", descEs: "Descripción en español",
      needTitle: "Ponga el título en inglés.", needTitleEs: "Ponga el título en español.",
      needDesc: "Ponga la descripción en inglés.", needDescEs: "Ponga la descripción en español.",
      modelHint: "Déjelo en blanco solo si la tarjeta debe decir Pregunte el modelo.",
      removeHint: "Borra esta pieza para siempre.",
      holdHint: "La quita del sitio público por ahora. No la borra.",
      soldHint: "La marca vendida y la oculta del sitio público.",
      removeConfirm: "¿Borrar {title} para siempre? No se puede deshacer.",
      backInventory: "Volver al inventario", gone: "Este aparato no está en la lista pública.",
      brandLabel: "Marca", modelLabel: "Modelo", categoryLabel: "Categoría", typeLabel: "Tipo",
      conditionLabel: "Condición", priceLabel: "Precio", listLabel: "Precio de lista",
      noneBrand: "Sin marca",
      sent: "Gracias. Llame al 210-655-5442 y la tienda le ayuda."
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
  function cloneSeed() {
    return SEED.map(function (item) { return Object.assign({}, item, { photos: (item.photos || []).slice() }); });
  }
  function isSeedId(id) { return /^s\d+$/.test(String(id || "")); }
  function seedNeedsSwap(parsed) {
    var known = {};
    SEED.forEach(function (item) { known[item.id] = 1; });
    return parsed.some(function (item) {
      if (!item || !isSeedId(item.id)) return false;
      if (!known[item.id]) return true;
      if (!String(item.titleEs || "").trim()) return true;
      var desc = String(item.description || "") + " " + String(item.descriptionEs || "");
      return /sample model|modelo de muestra/i.test(desc);
    });
  }
  function loadItems() {
    try {
      var raw = localStorage.getItem(STORE_KEY);
      if (raw) {
        var parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          if (seedNeedsSwap(parsed)) {
            var shop = parsed.filter(function (item) { return item && !isSeedId(item.id); });
            var items = cloneSeed().concat(shop);
            saveItems(items);
            return items;
          }
          return parsed;
        }
      }
    } catch (e) {}
    var fresh = cloneSeed();
    localStorage.setItem(STORE_KEY, JSON.stringify(fresh));
    return fresh;
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

  var filterDraft = null;
  function fieldNode(id) {
    var root = document.getElementById("page-root");
    return root ? root.querySelector("#" + id) : null;
  }
  function fieldVal(id) {
    var n = fieldNode(id);
    return n ? n.value : "";
  }
  function sheetOpen(id) {
    var n = document.getElementById(id);
    return !!(n && !n.hidden);
  }
  function sortLabel(sort) {
    if (sort === "low") return t("sortLow");
    if (sort === "high") return t("sortHigh");
    if (sort === "brand") return t("sortBrand");
    return t("sortNew");
  }
  function syncSheetBack() {
    var back = document.getElementById("filterBack");
    if (!back) return;
    var narrow = window.matchMedia("(max-width: 900px)").matches;
    back.hidden = !narrow || !(sheetOpen("filters") || sheetOpen("sortMenu"));
  }
  function hideSort() {
    var menu = document.getElementById("sortMenu");
    var btn = document.getElementById("sortBtn");
    if (menu) menu.hidden = true;
    if (btn) btn.setAttribute("aria-expanded", "false");
    syncSheetBack();
  }
  function hideFilters(restore) {
    if (restore && filterDraft) {
      ["fCat", "fBrand", "fCond", "fMin", "fMax"].forEach(function (id) {
        var n = fieldNode(id);
        var key = { fCat: "cat", fBrand: "brand", fCond: "cond", fMin: "min", fMax: "max" }[id];
        if (n) n.value = filterDraft[key];
      });
    }
    filterDraft = null;
    var sheet = document.getElementById("filters");
    var btn = document.querySelector("[data-filters]");
    if (sheet) sheet.hidden = true;
    if (btn) btn.setAttribute("aria-expanded", "false");
    syncSheetBack();
  }
  function toggleFilters() {
    var sheet = document.getElementById("filters");
    if (!sheet) return;
    if (!sheet.hidden) { hideFilters(true); return; }
    hideSort();
    filterDraft = {
      cat: fieldVal("fCat"),
      brand: fieldVal("fBrand"),
      cond: fieldVal("fCond"),
      min: fieldVal("fMin"),
      max: fieldVal("fMax")
    };
    sheet.hidden = false;
    var btn = document.querySelector("[data-filters]");
    if (btn) btn.setAttribute("aria-expanded", "true");
    syncSheetBack();
    var first = sheet.querySelector("select");
    if (first) first.focus();
  }
  function toggleSort() {
    var menu = document.getElementById("sortMenu");
    if (!menu) return;
    if (!menu.hidden) { hideSort(); return; }
    if (sheetOpen("filters")) hideFilters(true);
    menu.hidden = false;
    var btn = document.getElementById("sortBtn");
    if (btn) btn.setAttribute("aria-expanded", "true");
    syncSheetBack();
  }
  function filters() {
    var drafting = filterDraft && sheetOpen("filters");
    return {
      q: fieldVal("q").trim().toLowerCase(),
      cat: drafting ? filterDraft.cat : fieldVal("fCat"),
      brand: drafting ? filterDraft.brand : fieldVal("fBrand"),
      cond: drafting ? filterDraft.cond : fieldVal("fCond"),
      min: drafting ? filterDraft.min : fieldVal("fMin"),
      max: drafting ? filterDraft.max : fieldVal("fMax"),
      sold: false,
      sort: fieldVal("fSort") || "new"
    };
  }
  function filtersDirty(f) {
    return !!(f.q || f.cat || f.brand || f.cond || f.min !== "" || f.max !== "" || f.sort !== "new");
  }
  function paintToolbar() {
    var f = filters();
    var sortBtn = document.getElementById("sortBtn");
    if (sortBtn) sortBtn.textContent = sortLabel(f.sort);
    document.querySelectorAll("[data-sort-pick]").forEach(function (btn) {
      var key = btn.getAttribute("data-sort-pick");
      btn.textContent = sortLabel(key);
      btn.setAttribute("aria-pressed", key === f.sort ? "true" : "false");
    });
    var clearBtn = document.querySelector("[data-clear]");
    if (clearBtn) clearBtn.hidden = !filtersDirty(f);
  }
  function match(item, f) {
    if (!f.sold && item.sold) return false;
    if (f.cat.indexOf("laundry:") === 0) {
      if (item.category !== "Washers and Dryers") return false;
      var pick = f.cat.slice(8);
      if (pick === "washer" && laundryKind(item) !== "washer") return false;
      if (pick === "dryer" && laundryKind(item) !== "dryer") return false;
      if (pick === "gas" && dryerFuel(item) !== "gas") return false;
      if (pick === "electric" && dryerFuel(item) !== "electric") return false;
    } else if (f.cat && item.category !== f.cat) return false;
    if (f.brand && item.brand !== f.brand) return false;
    if (f.cond && item.condition !== f.cond) return false;
    var price = Number(item.price) || 0;
    if (f.min !== "" && price < Number(f.min)) return false;
    if (f.max !== "" && price > Number(f.max)) return false;
    if (f.q) {
      var blob = [item.title, titleOf(item), item.brand, item.model, item.category, catLabel(item.category), laundrySearch(item)].join(" ").toLowerCase();
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
    var cat = document.getElementById("fCat");
    var brand = document.getElementById("fBrand");
    if (cat) {
      var cur = cat.value;
      cat.innerHTML = '<option value="">' + esc(t("catAll")) + "</option>" + Object.keys(cats).map(function (c) {
        var row = '<option value="' + esc(c) + '">' + esc(catLabel(c)) + "</option>";
        if (c === "Washers and Dryers") {
          row += '<option value="laundry:washer">' + esc(t("optWashers")) + "</option>" +
            '<option value="laundry:dryer">' + esc(t("optDryers")) + "</option>" +
            '<option value="laundry:gas">' + esc(t("optGasDryers")) + "</option>" +
            '<option value="laundry:electric">' + esc(t("optElectricDryers")) + "</option>";
        }
        return row;
      }).join("");
      if (window.__sndPendingCat) {
        cat.value = window.__sndPendingCat;
        window.__sndPendingCat = "";
      } else {
        cat.value = cur;
      }
    }
    if (brand) {
      var curB = brand.value;
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
      if (!isPublic(item)) return false;
      if (scope === "floor" && !item.floor) return false;
      return match(item, f);
    });
    items.sort(function (a, b) {
      if (f.sort === "low") return (Number(a.price) || 0) - (Number(b.price) || 0);
      if (f.sort === "high") return (Number(b.price) || 0) - (Number(a.price) || 0);
      if (f.sort === "brand") {
        var ba = String(a.brand || "").toLowerCase();
        var bb = String(b.brand || "").toLowerCase();
        if (!ba && bb) return 1;
        if (ba && !bb) return -1;
        var byBrand = ba.localeCompare(bb);
        if (byBrand) return byBrand;
        return titleOf(a).localeCompare(titleOf(b));
      }
      return String(b.created || "").localeCompare(String(a.created || ""));
    });
    paintToolbar();
    if (count) count.textContent = t("results").replace("{n}", String(items.length));
    if (!items.length) {
      box.innerHTML = '<p class="note">' + esc(t("none")) + "</p>";
      return;
    }
    box.innerHTML = items.map(function (item) {
      var photo = (item.photos && item.photos[0]) || "assets/images/storefront.jpg";
      var kindLine = laundryLabel(item);
      var modelText = item.model ? item.model : t("askModel");
      var meta = [item.brand, modelText].filter(Boolean).join(" · ");
      return '<a class="card" href="' + esc(detailHref(item)) + '">' +
        '<img src="' + esc(src(photo)) + '" alt="' + esc(titleOf(item)) + '" loading="lazy">' +
        '<span class="card__body"><span class="cond">' + esc(condLabel(item.condition || "")) + "</span>" +
        '<span class="card__title">' + esc(titleOf(item)) + "</span>" +
        (kindLine ? '<span class="cond">' + esc(kindLine) + "</span>" : "") +
        '<span class="card__meta">' + esc(meta) + "</span>" +
        '<span class="price">' + esc(money(item.price)) + (item.was ? " <s>" + esc(money(item.was)) + "</s>" : "") + "</span>" +
        "</span></a>";
    }).join("");
  }
  function slugify(value) {
    return String(value || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
  }
  function slugOf(item) {
    if (!item) return "";
    if (item.slug) return item.slug;
    return slugify(item.title) || item.id;
  }
  function uniqueSlug(title, id, items) {
    var base = slugify(title) || id;
    var slug = base;
    var n = 2;
    while (items.some(function (item) { return item.slug === slug && item.id !== id; })) {
      slug = base + "-" + n;
      n += 1;
    }
    return slug;
  }
  function detailHref(item) {
    var slug = encodeURIComponent(slugOf(item));
    if (currentLang() === "es") return "inventario/" + slug + "/";
    return "en/inventory/" + slug + "/";
  }
  function hasSpanish(item) {
    return !!(item && String(item.titleEs || "").trim() && String(item.descriptionEs || "").trim());
  }
  function isPublic(item) {
    if (!item || item.sold || item.holdFor) return false;
    if (currentLang() === "es" && !hasSpanish(item)) return false;
    return true;
  }
  function titleOf(item) {
    if (currentLang() === "es" && String(item.titleEs || "").trim()) return item.titleEs;
    return item.title || "";
  }
  function blurb(item) {
    if (currentLang() === "es" && String(item.descriptionEs || "").trim()) return item.descriptionEs;
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
      '<label class="field">' + esc(t("titleEn")) + '<input name="title" value="' + esc(item.title || "") + '"><span class="field-error" id="errTitle" hidden></span></label>' +
      '<label class="field">' + esc(t("titleEs")) + '<input name="titleEs" value="' + esc(item.titleEs || "") + '"><span class="field-error" id="errTitleEs" hidden></span></label>' +
      '<label class="field">' + esc(L.category) + '<select name="category">' + cats.map(function (c) {
        return '<option value="' + esc(c) + '"' + (c === catNow ? " selected" : "") + ">" + esc(catLabel(c)) + "</option>";
      }).join("") + "</select></label>" +
      '<div class="laundry-fields" id="laundryFields"' + (catNow === "Washers and Dryers" ? "" : " hidden") + ">" +
      '<label class="field">' + esc(t("laundryType")) + '<select name="laundry" id="laundrySelect">' +
      '<option value="">' + esc(t("laundryPick")) + "</option>" +
      '<option value="washer"' + (kind === "washer" ? " selected" : "") + ">" + esc(t("washer")) + "</option>" +
      '<option value="dryer"' + (kind === "dryer" ? " selected" : "") + ">" + esc(t("dryer")) + "</option>" +
      '</select><span class="field-error" id="errLaundry" hidden></span></label>' +
      '<label class="field" id="fuelField"' + (kind === "dryer" ? "" : " hidden") + ">" + esc(t("dryerFuel")) + '<select name="fuel">' +
      '<option value="">' + esc(t("fuelPick")) + "</option>" +
      '<option value="electric"' + (fuel === "electric" ? " selected" : "") + ">" + esc(t("electric")) + "</option>" +
      '<option value="gas"' + (fuel === "gas" ? " selected" : "") + ">" + esc(t("gas")) + "</option>" +
      '</select><span class="field-error" id="errFuel" hidden></span></label></div>' +
      '<label class="field">' + esc(L.brand) + '<input name="brand" value="' + esc(item.brand || "") + '"></label>' +
      '<label class="field">' + esc(L.model) + '<input name="model" value="' + esc(item.model || "") + '"><span class="tiny">' + esc(t("modelHint")) + "</span></label>" +
      '<label class="field">' + esc(L.condition) + '<select name="condition">' + CONDITIONS.map(function (c) {
        return '<option value="' + esc(c) + '"' + (c === item.condition ? " selected" : "") + ">" + esc(condLabel(c)) + "</option>";
      }).join("") + "</select></label>" +
      '<div class="field field--row"><label class="field">' + esc(L.price) + '<input name="price" type="number" min="0" step="1" required value="' + esc(item.price || "") + '"></label>' +
      '<label class="field">' + esc(L.was) + '<input name="was" type="number" min="0" step="1" value="' + esc(item.was || "") + '"></label></div>' +
      '<label class="field">' + esc(t("photos")) + '<input name="photos" type="file" accept="image/*" multiple>' +
      '<span class="tiny">' + esc(t("photoHint")) + '</span><div id="photoStrip"></div></label>' +
      '<label class="field">' + esc(t("descEn")) + '<textarea name="description" rows="3">' + esc(item.description || "") + '</textarea><span class="field-error" id="errDesc" hidden></span></label>' +
      '<label class="field">' + esc(t("descEs")) + '<textarea name="descriptionEs" rows="3">' + esc(item.descriptionEs || "") + '</textarea><span class="field-error" id="errDescEs" hidden></span></label>' +
      '<label class="check"><input type="checkbox" name="sold"' + (item.sold ? " checked" : "") + "> " + esc(L.sold) + "</label>" +
      '<p class="tiny">' + esc(t("soldHint")) + "</p>" +
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
          '<span class="admin-row__main"><span class="admin-row__name">' + esc(item.title || titleOf(item)) + (item.titleEs ? " · " + esc(item.titleEs) : "") + (kindLine ? " · " + esc(kindLine) : "") + (item.sold ? " · " + esc(t("sold")) : "") + "</span>" +
          '<button type="button" class="linkish" data-edit="' + esc(item.id) + '">' + esc(t("edit")) + "</button>" +
          held + holdForm + "</span>" +
          '<div class="admin-actions">' +
          '<div class="admin-action"><button type="button" class="linkish" data-remove="' + esc(item.id) + '">' + esc(t("remove")) + '</button><p class="tiny">' + esc(t("removeHint")) + "</p></div>" +
          '<div class="admin-action"><div>' + holdBtn + '</div><p class="tiny">' + esc(t("holdHint")) + "</p></div>" +
          '<div class="admin-action"><button type="button" class="linkish" data-mark-sold="' + esc(item.id) + '" aria-pressed="' + (item.sold ? "true" : "false") + '">' + esc(t("sold")) + '</button><p class="tiny">' + esc(t("soldHint")) + "</p></div>" +
          "</div></div>";
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
      hideFilters(true);
      hideSort();
      var sel = document.getElementById("fCat");
      if (sel) sel.value = catBtn.getAttribute("data-cat");
      render();
      var inv = document.getElementById("inventory");
      if (inv) inv.scrollIntoView({ behavior: "smooth" });
      return;
    }
    if (e.target.closest("[data-filter-apply]")) {
      filterDraft = null;
      hideFilters(false);
      render();
      return;
    }
    if (e.target.closest("[data-filter-reset]")) {
      ["fCat", "fBrand", "fCond", "fMin", "fMax"].forEach(function (id) {
        var n = document.getElementById(id);
        if (n) n.value = "";
      });
      return;
    }
    var sortPick = e.target.closest("[data-sort-pick]");
    if (sortPick) {
      var sortInput = document.getElementById("fSort");
      if (sortInput) sortInput.value = sortPick.getAttribute("data-sort-pick") || "new";
      hideSort();
      render();
      return;
    }
    if (e.target.closest("[data-filters]")) {
      toggleFilters();
      return;
    }
    if (e.target.closest("#sortBtn")) {
      toggleSort();
      return;
    }
    if (e.target.id === "filterBack") {
      if (sheetOpen("filters")) hideFilters(true);
      hideSort();
      return;
    }
    var openId = e.target.closest("[data-open]");
    if (openId) openDetail(openId.getAttribute("data-open"));
    if (e.target.closest("[data-close='detail']") || e.target.id === "detailBack") {
      document.getElementById("detail").hidden = true;
      document.getElementById("detailBack").hidden = true;
    }
    var photoBtn = e.target.closest("[data-swap-photo]");
    if (photoBtn) {
      var img = document.querySelector("#detailPhoto") || document.querySelector("#detail .modal__photo");
      if (img) img.src = src(photoBtn.getAttribute("data-swap-photo"));
    }
    if (e.target.closest("[data-clear]")) {
      filterDraft = null;
      hideFilters(false);
      hideSort();
      ["q", "fCat", "fBrand", "fCond", "fMin", "fMax"].forEach(function (id) {
        var n = document.getElementById(id);
        if (n) n.value = "";
      });
      var sort = document.getElementById("fSort");
      if (sort) sort.value = "new";
      render();
      return;
    }
    if (sheetOpen("filters") && !e.target.closest("#filters") && !e.target.closest("[data-filters]")) hideFilters(true);
    if (sheetOpen("sortMenu") && !e.target.closest("#sortMenu") && !e.target.closest("#sortBtn")) hideSort();
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
      var doomed = findItem(id);
      var label = doomed ? (doomed.title || titleOf(doomed)) : "";
      if (!window.confirm(t("removeConfirm").replace("{title}", label))) return;
      saveItems(loadItems().filter(function (item) { return item.id !== id; }));
      if (editing === id) { editing = ""; editPhotos = []; shopTab = "list"; }
      render();
      paintShop();
      return;
    }
    var markSold = e.target.closest("[data-mark-sold]");
    if (markSold) {
      var soldId = markSold.getAttribute("data-mark-sold");
      saveItems(loadItems().map(function (item) {
        return item.id === soldId ? Object.assign({}, item, { sold: !item.sold }) : item;
      }));
      render();
      paintShop();
      return;
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
    if (target.id === "q") render();
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
      var titleEs = String(data.get("titleEs") || "").trim();
      var description = String(data.get("description") || "").trim();
      var descriptionEs = String(data.get("descriptionEs") || "").trim();
      var price = Number(data.get("price"));
      var category = String(data.get("category") || CATS[0]);
      var laundry = "";
      var fuel = "";
      function setErr(id, msg) {
        var node = document.getElementById(id);
        if (!node) return;
        node.hidden = !msg;
        node.textContent = msg || "";
      }
      setErr("errTitle", title ? "" : t("needTitle"));
      setErr("errTitleEs", titleEs ? "" : t("needTitleEs"));
      setErr("errDesc", description ? "" : t("needDesc"));
      setErr("errDescEs", descriptionEs ? "" : t("needDescEs"));
      setErr("errLaundry", "");
      setErr("errFuel", "");
      var itemMsg = document.getElementById("itemMsg");
      if (itemMsg) itemMsg.textContent = "";
      if (category === "Washers and Dryers") {
        laundry = String(data.get("laundry") || "");
        if (laundry !== "washer" && laundry !== "dryer") {
          setErr("errLaundry", t("needLaundry"));
          var laundryPick = document.getElementById("laundrySelect");
          if (laundryPick) laundryPick.focus();
          return;
        }
        if (laundry === "dryer") {
          fuel = String(data.get("fuel") || "");
          if (fuel !== "gas" && fuel !== "electric") {
            setErr("errFuel", t("needFuel"));
            var fuelPick = itemForm.querySelector('[name="fuel"]');
            if (fuelPick) fuelPick.focus();
            return;
          }
        }
      }
      if (!title || !titleEs || !description || !descriptionEs || !price) {
        var firstBad = document.querySelector("#itemForm .field-error:not([hidden])");
        var field = firstBad && firstBad.closest(".field");
        var input = field && field.querySelector("input, textarea, select");
        if (input) input.focus();
        return;
      }
      readFiles(itemForm.querySelector('input[name="photos"]')).then(function (photos) {
        var items = loadItems();
        var id = String(data.get("id") || "") || ("i" + Date.now());
        var prev = findItem(id);
        var next = {
          id: id,
          slug: (prev && prev.slug) || uniqueSlug(title, id, items),
          title: title,
          titleEs: titleEs,
          category: category,
          laundry: laundry,
          fuel: fuel,
          brand: String(data.get("brand") || "").trim(),
          model: String(data.get("model") || "").trim(),
          condition: String(data.get("condition") || CONDITIONS[0]),
          price: price,
          was: Number(data.get("was")) || 0,
          photos: editPhotos.concat(photos.filter(function (p) { return editPhotos.indexOf(p) === -1; })),
          description: description,
          descriptionEs: descriptionEs,
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

  var SITE = "https://texasbullmarketing.com/demo/ScratchNDentSuperstore/";
  function pathSlug() {
    var parts = location.pathname.split("/").filter(Boolean);
    if (!parts.length) return "";
    var last = parts[parts.length - 1];
    if (/\.html$/i.test(last)) last = parts[parts.length - 2] || "";
    if (last === "inventory" || last === "inventario" || last === "en" || last === "es") return "";
    try { return decodeURIComponent(last); } catch (err) { return last; }
  }
  function detailSlug() {
    var root = document.getElementById("page-root");
    var set = root && root.getAttribute("data-detail");
    if (set) return set;
    if (!document.getElementById("detailPage")) return "";
    return pathSlug();
  }
  function findBySlug(slug) {
    if (!slug) return null;
    var found = null;
    loadItems().forEach(function (item) { if (slugOf(item) === slug) found = item; });
    return found;
  }
  function absPhoto(path) {
    if (!path || /^data:/.test(path)) return SITE + "assets/images/storefront.jpg";
    if (/^https?:/.test(path)) return path;
    return SITE + String(path).replace(/^\//, "");
  }
  function absDetail(item, lang) {
    var slug = encodeURIComponent(slugOf(item));
    if (lang === "es") return SITE + "es/inventario/" + slug + "/";
    return SITE + "en/inventory/" + slug + "/";
  }
  function setMeta(name, content) {
    var node = document.querySelector('meta[name="' + name + '"]');
    if (node) node.setAttribute("content", content);
  }
  function setProp(prop, content) {
    var node = document.querySelector('meta[property="' + prop + '"]');
    if (node) node.setAttribute("content", content);
  }
  function setLink(rel, lang, href) {
    var node = lang
      ? document.querySelector('link[rel="' + rel + '"][hreflang="' + lang + '"]')
      : document.querySelector('link[rel="' + rel + '"]');
    if (node && href) node.setAttribute("href", href);
  }
  function factRow(label, value) {
    return "<div><dt>" + esc(label) + "</dt><dd>" + esc(value) + "</dd></div>";
  }
  function detailMarkup(item) {
    var photos = item.photos && item.photos.length ? item.photos : ["assets/images/storefront.jpg"];
    var kind = laundryLabel(item);
    var modelText = item.model ? item.model : t("askModel");
    var thumbs = photos.length > 1 ? '<div class="detail-thumbs">' + photos.map(function (p) {
      return '<button type="button" data-swap-photo="' + esc(p) + '"><img src="' + esc(src(p)) + '" alt=""></button>';
    }).join("") + "</div>" : "";
    return '<div class="detail-photo-wrap">' +
      '<img id="detailPhoto" class="detail-photo" src="' + esc(src(photos[0])) + '" alt="' + esc(titleOf(item)) + '">' +
      thumbs + "</div>" +
      '<div class="detail-copy"><h1>' + esc(titleOf(item)) + "</h1>" +
      "<dl class=\"detail-facts\">" +
      factRow(t("brandLabel"), item.brand || t("noneBrand")) +
      factRow(t("modelLabel"), modelText) +
      factRow(t("categoryLabel"), catLabel(item.category || "")) +
      (kind ? factRow(t("typeLabel"), kind) : "") +
      factRow(t("conditionLabel"), condLabel(item.condition || "")) +
      factRow(t("priceLabel"), money(item.price) || "—") +
      (item.was ? factRow(t("listLabel"), money(item.was)) : "") +
      "</dl><p class=\"detail-desc\">" + esc(blurb(item)) + "</p>" +
      '<div class="actions"><a class="btn" href="tel:' + PHONE + '">' + esc(t("call")) + "</a>" +
      '<a class="btn btn--ink" href="' + sms(item) + '">' + esc(t("text")) + "</a></div></div>";
  }
  function productSchema(item) {
    var lang = currentLang();
    var photos = (item.photos && item.photos.length ? item.photos : ["assets/images/storefront.jpg"]).map(absPhoto);
    var data = {
      "@context": "https://schema.org",
      "@type": "Product",
      "name": titleOf(item),
      "description": blurb(item),
      "image": photos,
      "sku": item.model || item.id,
      "category": catLabel(item.category || ""),
      "itemCondition": "https://schema.org/NewCondition",
      "url": absDetail(item, lang),
      "offers": {
        "@type": "Offer",
        "priceCurrency": "USD",
        "price": Number(item.price) || 0,
        "url": absDetail(item, lang),
        "availability": "https://schema.org/InStock",
        "seller": { "@type": "ApplianceStore", "name": "Scratch-N-Dent Superstore", "telephone": PHONE }
      }
    };
    if (item.brand) data.brand = { "@type": "Brand", "name": item.brand };
    return data;
  }
  function syncDetailHead(item, ok) {
    var lang = currentLang();
    var other = lang === "es" ? "en" : "es";
    if (!ok || !item) {
      document.title = t("gone") + " | Scratch-N-Dent Superstore";
      setMeta("description", t("gone"));
      var block = document.getElementById("product-ld");
      if (block) block.textContent = "";
      return;
    }
    var pageTitle = titleOf(item) + " | Scratch-N-Dent Superstore";
    var desc = blurb(item);
    var url = absDetail(item, lang);
    var otherUrl = hasSpanish(item) || lang === "en" ? absDetail(item, other) : (lang === "es" ? SITE + "es/inventory.html" : SITE + "inventory.html");
    if (lang === "es" && !hasSpanish(item)) otherUrl = SITE + "inventory.html";
    document.title = pageTitle;
    setMeta("description", desc);
    setProp("og:title", pageTitle);
    setProp("og:description", desc);
    setProp("og:url", url);
    setProp("og:image", absPhoto(item.photos && item.photos[0]));
    setLink("canonical", "", url);
    setLink("alternate", "en", absDetail(item, "en"));
    setLink("alternate", "es", hasSpanish(item) ? absDetail(item, "es") : SITE + "es/inventory.html");
    setLink("alternate", "x-default", absDetail(item, "en"));
    var block = document.getElementById("product-ld");
    if (block) block.textContent = JSON.stringify(productSchema(item));
    var esLink = document.querySelector('.lang-seg a[hreflang="es"]');
    var enLink = document.querySelector('.lang-seg a[hreflang="en"]');
    if (lang === "en" && esLink) {
      var esHref = hasSpanish(item) ? "es/inventario/" + encodeURIComponent(slugOf(item)) + "/" : "es/inventory.html";
      esLink.setAttribute("href", esHref);
      esLink.setAttribute("hx-get", esHref);
    }
    if (lang === "es" && enLink) {
      var enHref = "en/inventory/" + encodeURIComponent(slugOf(item)) + "/";
      enLink.setAttribute("href", enHref);
      enLink.setAttribute("hx-get", enHref);
    }
  }
  function paintDetail() {
    var page = document.getElementById("detailPage");
    if (!page) return;
    var slug = detailSlug();
    var item = findBySlug(slug);
    var back = currentLang() === "es" ? "es/inventory.html" : "inventory.html";
    var backHtml = '<p class="detail-back"><a href="' + back + '">' + esc(t("backInventory")) + "</a></p>";
    if (!item || !isPublic(item)) {
      page.innerHTML = backHtml + '<p class="lede">' + esc(t("gone")) + "</p>";
      syncDetailHead(item, false);
      return;
    }
    page.innerHTML = backHtml + '<div class="detail-layout">' + detailMarkup(item) + "</div>";
    syncDetailHead(item, true);
  }
  function boot() {
    filterDraft = null;
    bindPage();
    paintHours();
    paintYears();
    render();
    paintShop();
    paintDetail();
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
        if (tg && mn && !mn.hidden) { mn.hidden = true; tg.setAttribute("aria-expanded", "false"); return; }
        if (sheetOpen("filters") || sheetOpen("sortMenu")) {
          if (sheetOpen("filters")) hideFilters(true);
          hideSort();
          return;
        }
        ["detail", "shop"].forEach(function (id) {
          var node = document.getElementById(id);
          var back = document.getElementById(id + "Back");
          if (node) node.hidden = true;
          if (back) back.hidden = true;
        });
      });
    }
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", initThemeMenu);
  else initThemeMenu();
  document.addEventListener("htmx:afterSwap", function () { initThemeMenu(); });
})();
