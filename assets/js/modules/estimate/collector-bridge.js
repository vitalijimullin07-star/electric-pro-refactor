/* Electric Pro V29 — Этап 1. Мост: щит и пул → общий сборник EP.EstimateDraft (кнопка «В смету»).
   Щит даёт цены из БД сам; у пула цена — из его подбора, иначе дозаполняем из каталога по имени.
   Повторное «В смету» из модуля заменяет его прежний вклад (setSourceItems), без дублей. */
(() => {
  "use strict";
  function D() { return (window.EP && window.EP.EstimateDraft) || null; }
  function DB() { return (window.EP && window.EP.Database) || null; }
  function norm(s) { return String(s == null ? "" : s).toLowerCase().replace(/ё/g, "е").replace(/[^0-9a-zа-я]+/gi, " ").trim(); }

  /* ---------- цена из каталога по имени (best-effort) ---------- */
  let _cat = null, _catKey = "";
  function catalog() {
    const db = DB(); if (!db || !db.getItems) return [];
    try {
      const all = (db.getItems("my") || []).concat(db.getItems("server") || []);
      const key = all.length + ":" + ((all[0] && all[0].name) || "");
      if (key !== _catKey) { _cat = all; _catKey = key; }
      return _cat || [];
    } catch (e) { return []; }
  }
  function priceByName(name) {
    const n = norm(name); if (!n) return 0;
    let best = 0, bestScore = 0;
    catalog().forEach((it) => {
      const inm = norm(it.name); if (!inm || !(Number(it.price) > 0)) return;
      let score = 0;
      if (inm === n) score = 100;
      else if (inm.indexOf(n) >= 0 || n.indexOf(inm) >= 0) score = 60;
      if (score > bestScore) { bestScore = score; best = Number(it.price); }
    });
    return best;
  }

  /* ---------- агрегация одинаковых позиций ---------- */
  function aggregate(arr) {
    const m = new Map();
    (arr || []).forEach((x) => {
      const name = (x.name || "").trim(); if (!name) return;
      const type = x.type === "work" ? "work" : "material";
      const unit = x.unit || "";
      const key = type + "|" + norm(name) + "|" + unit;
      const price = Number(x.price) || 0;
      const e = m.get(key);
      if (e) { e.qty += Number(x.qty) || 0; if (!e.price && price) e.price = price; }
      else m.set(key, { type, name, unit, price, qty: Number(x.qty) || 0, sourceId: norm(name) });
    });
    const out = [...m.values()];
    out.forEach((it) => { if (!it.price) it.price = priceByName(it.name); });
    return out.filter((x) => x.qty > 0);
  }

  /* ---------- ЩИТ → позиции ---------- */
  function shieldItems() {
    const S = window.ShieldConfiguratorV28;
    if (!S || !S.getConfig) return null;
    const cfg = S.getConfig();
    const d = cfg && cfg.draft;
    if (!d) return null;
    const mats = [], works = [];
    (d.groups || []).forEach((g) => {
      if (g.prot && g.prot.found && g.prot.name) mats.push({ type: "material", name: g.prot.name, price: g.prot.price, qty: 1, unit: "шт" });
      (g.lines || []).forEach((l) => { if (l.dbFound && l.dbName) mats.push({ type: "material", name: l.dbName, price: l.dbPrice, qty: 1, unit: "шт" }); });
    });
    (d.apparatus || []).forEach((a) => { if (a.found && a.name) mats.push({ type: "material", name: a.name, price: a.price, qty: 1, unit: "шт" }); });
    ((d.cons && d.cons.items) || []).forEach((it) => { if (it.found && it.name) mats.push({ type: "material", name: it.name, price: it.price, qty: it.qty, unit: it.unit || "шт" }); });
    ((d.work && d.work.items) || []).forEach((it) => { if (it.found && it.name) works.push({ type: "work", name: it.name, price: it.price, qty: it.qty, unit: it.unit || "" }); });
    return aggregate(mats).concat(aggregate(works));
  }

  /* ---------- ПУЛ → позиции ---------- */
  function poolItems() {
    const P = window.PoolV22CleanMonolith;
    if (!P || !P.draft) return null;
    let rows;
    try { rows = P.draft() || []; } catch (e) { return null; }
    const items = rows.filter((r) => r && r.name).map((r) => ({
      type: r.type === "work" ? "work" : "material",
      name: r.name, price: Number(r.price) || 0, qty: Number(r.qty) || 0, unit: r.unit || ""
    }));
    return aggregate(items);
  }

  /* ---------- тост ---------- */
  function flash(msg) {
    try {
      let el = document.getElementById("ep-collector-flash");
      if (!el) { el = document.createElement("div"); el.id = "ep-collector-flash"; el.className = "ep-pick-flash"; document.body.appendChild(el); }
      el.textContent = msg; el.classList.add("show");
      clearTimeout(flash._t); flash._t = setTimeout(() => el && el.classList.remove("show"), 1800);
    } catch (e) {}
  }

  /* ---------- действия «В смету» ---------- */
  function pushShield() {
    const d = D(); if (!d) return;
    const items = shieldItems();
    if (items === null) { flash("Сначала собери щит"); return; }
    if (!items.length) { flash("В щите нет позиций"); return; }
    d.setSourceItems("shield", items);
    flash("Щит в смете: " + items.length + " позиц.");
  }
  function pushPool() {
    const d = D(); if (!d) return;
    const items = poolItems();
    if (items === null || !items.length) { flash("Пул пуст — добавь точки"); return; }
    d.setSourceItems("pool", items);
    flash("Пул в смете: " + items.length + " позиц.");
  }
  // экспорт на случай прямого вызова
  function fillPrices(items) { (items || []).forEach((it) => { if (!(Number(it.price) > 0)) it.price = priceByName(it.name); }); return items; }
  window.EP = window.EP || {};
  window.EP.Collector = { pushShield, pushPool, shieldItems, poolItems, priceByName, fillPrices };

  /* ---------- кнопки ---------- */
  document.addEventListener("click", (e) => {
    const t = e.target;
    if (t.closest && t.closest("[data-shield-to-estimate]")) { e.preventDefault(); pushShield(); return; }
    if (t.closest && t.closest("[data-pool-to-estimate]")) { e.preventDefault(); pushPool(); return; }
  });

  // Кнопку в пул-оверлей вставляем динамически (оверлей перекрывает экран)
  function injectPoolButton() {
    const screen = document.getElementById("ep-pool-v22-screen");
    if (!screen || screen.querySelector("[data-pool-to-estimate]")) return;
    const b = document.createElement("button");
    b.type = "button";
    b.setAttribute("data-pool-to-estimate", "");
    b.className = "ep-pool-to-est";
    b.textContent = "+ В смету";
    screen.appendChild(b);
  }
  window.addEventListener("ep:route-loaded", (e) => {
    const route = e && e.detail && e.detail.route;
    if (route === "pool") setTimeout(injectPoolButton, 60);
  });
})();
