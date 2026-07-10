/* Electric Pro V29 — Проект квартиры: расчёт и смета (Слой 5).
   Мост в EP.PoolEngine: точки по комнатам -> блоки -> штробы/подрозетники/
   распайки/коннекторы (draftItems). Кабель — по построенным трассам.
   Цены подтягиваются из EP.Database по совпадению названия. Кнопка «В смету». */
(() => {
  "use strict";
  window.EP = window.EP || {};

  const T = {
    title: "Расчёт", close: "Закрыть", toEstimate: "📋 В смету",
    noRooms: "Нет комнат — нарисуй план.", noElems: "Нет точек — добавь в режиме 🔌.",
    cable: "Кабель по трассам", noRoutes: "трассы не построены (🧵)",
    room: "Комната", added: (n) => `В смету добавлено позиций: ${n}`,
    engineMissing: "Движок расчёта недоступен.",
    workHead: "Работы и материалы (по движку пула)"
  };
  const COLS = [["sockets", "Р"], ["sw", "В"], ["light", "С"], ["tv", "ТВ"], ["internet", "И"], ["warm", "ТП"]];

  const esc = (s) => String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const core = () => EP.Plan.Core;
  const G = () => EP.Plan.Geometry;
  const rooms = () => EP.Plan.Rooms;

  // ---------- сбор блоков по комнатам ----------
  function roomStats(p, room) {
    const els = G().elementsInRoom(p, room.id);
    const cnt = (t) => els.filter((e) => e.type === t && e.status !== "existing").length;
    const sockets = els.filter((e) => e.type === "socket" && e.status !== "existing");
    const medianH = sockets.length
      ? sockets.map((e) => e.height).sort((a, b) => a - b)[Math.floor(sockets.length / 2)]
      : (p.settings.heightPresets.socket || 30);
    return {
      room, sockets: sockets.length, sw: cnt("switch"), light: cnt("light"),
      tv: cnt("tv"), internet: cnt("internet"), warm: cnt("warmfloor"),
      ac: cnt("ac"), height: medianH
    };
  }
  function buildBlocks(p) {
    return (p.rooms || []).map((room) => roomStats(p, room)).filter((s) =>
      s.sockets + s.sw + s.light + s.tv + s.internet + s.warm + s.ac > 0
    );
  }

  function runEngine(p, stats) {
    if (!window.EP.PoolEngine) return null;
    const blocks = stats.map((s) => ({
      material: p.settings.wallMaterial || "Бетон",
      route: p.settings.routeType === "floor" ? "floor" : "ceiling",
      height: s.height,
      sockets: s.sockets, sw1: s.sw, sw2: 0, sw3: 0, pass: 0, cross: 0,
      tv: s.tv, internet: s.internet, warmFloor: s.warm
    }));
    try {
      return EP.PoolEngine.calc({ blocks, ceilingHeight: p.settings.ceilingHeight, mode: "junction" });
    } catch (e) { return null; }
  }

  // ---------- цены из БД ----------
  function priceFor(name, type) {
    try {
      const items = (EP.Database && EP.Database.getItemsByType && EP.Database.getItemsByType(type)) || [];
      const low = String(name).toLowerCase();
      const exact = items.find((x) => String(x.name).toLowerCase() === low);
      if (exact) return Number(exact.price) || 0;
      const part = items.find((x) => low.indexOf(String(x.name).toLowerCase()) >= 0 || String(x.name).toLowerCase().indexOf(low) >= 0);
      return part ? Number(part.price) || 0 : 0;
    } catch (e) { return 0; }
  }

  // ---------- шторка ----------
  function sheet() {
    const p = core().project;
    if (!(p.rooms || []).length) { rooms().toast(T.noRooms); return; }
    const stats = buildBlocks(p);
    if (!stats.length) { rooms().toast(T.noElems); return; }
    const res = runEngine(p, stats);
    const rl = EP.Plan.Routes ? EP.Plan.Routes.lengths(p) : { byLayer: {}, total: 0 };
    const layerName = (id) => ((p.layers || []).find((l) => l.id === id) || { name: id }).name;

    const table = `<table class="ep-plan-table"><tr><th>${T.room}</th>${COLS.map(([, l]) => `<th>${l}</th>`).join("")}</tr>
      ${stats.map((s) => `<tr><td>${esc(s.room.name)}</td>${COLS.map(([k]) => `<td>${s[k] || ""}</td>`).join("")}</tr>`).join("")}</table>`;

    const cable = rl.total > 0
      ? `<div class="ep-plan-srow ep-plan-rlens">${Object.keys(rl.byLayer).map((id) => `<span>${layerName(id)}: <b>${G().fmtLen(rl.byLayer[id])}</b></span>`).join("")}
         <span><b>${G().fmtLen(rl.total)}</b> всего</span></div>`
      : `<div class="ep-plan-srow">${T.cable}: ${T.noRoutes}</div>`;

    const items = res && res.draftItems ? res.draftItems : null;
    const itemsHtml = items
      ? `<div class="ep-plan-srow"><b>${T.workHead}</b></div>
         <div class="ep-plan-items">${items.map((it) => `<div class="ep-plan-irow"><span>${esc(it.name)}</span><b>${it.qty} ${esc(it.unit)}</b></div>`).join("")}</div>`
      : `<div class="ep-plan-srow">${T.engineMissing}</div>`;

    rooms().openSheet(`<div class="ep-plan-srow"><b>🧮 ${T.title}</b>
        <span class="ep-plan-flex"></span><button type="button" class="ep-plan-mini ep-clickable" data-pc-close>✕</button></div>
      ${table}
      <div class="ep-plan-srow"><b>${T.cable}</b></div>${cable}
      ${itemsHtml}
      ${items ? `<div class="ep-plan-srow ep-plan-sbtns"><button type="button" class="btn btn-primary ep-clickable" data-pc-estimate>${T.toEstimate}</button></div>` : ""}`);
    S.lastItems = items;
  }
  const S = { lastItems: null };

  function toEstimate() {
    if (!S.lastItems || !window.EP.Estimate) return;
    let n = 0;
    S.lastItems.forEach((it) => {
      EP.Estimate.addItem({ name: it.name, qty: it.qty, unit: it.unit, type: it.type, price: priceFor(it.name, it.type) });
      n++;
    });
    rooms().toast(T.added(n));
  }

  document.addEventListener("click", (e) => {
    if (!rooms() || !rooms().isActive()) return;
    const t = e.target;
    if (t.closest("[data-plan-calc]")) return sheet();
    if (t.closest("[data-pc-close]")) { rooms().closeSheet(); return; }
    if (t.closest("[data-pc-estimate]")) return toEstimate();
  });

  EP.Plan = EP.Plan || {};
  EP.Plan.Calc = { sheet, buildBlocks, runEngine, priceFor };
})();
