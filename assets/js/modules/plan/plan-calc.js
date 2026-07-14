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
    workHead: "Работы и материалы (по движку пула)",
    exactHead: "Работы и материалы — ПО ТРАССАМ (точный счёт)",
    exactHint: "Штробы, подрозетники и кабель посчитаны по фактическому чертежу: длина спуска × материал стены, ёмкость штробы — из движка пула.",
    approxHint: "⚠ Приближённый счёт по комнатам. Построй трассы (🧵) — расчёт станет точным по чертежу.",
    reserve: "Запас кабеля, %"
  };
  const COLS = [["sockets", "Р"], ["sw", "В"], ["light", "С"], ["tv", "ТВ"], ["internet", "И"], ["warm", "ТП"]];

  const esc = (s) => String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const core = () => EP.Plan.Core;
  const G = () => EP.Plan.Geometry;
  const rooms = () => EP.Plan.Rooms;

  // ---------- сбор блоков по комнатам ----------
  function roomStats(p, room) {
    const els = G().elementsInRoom(p, room.id).filter((e) => e.status !== "existing");
    // блоки (рамки) раскрываются на посты
    const n = { socket: 0, switch: 0, light: 0, tv: 0, internet: 0, warmfloor: 0, ac: 0 };
    const socketHeights = [];
    els.forEach((e) => {
      if (e.type === "block") {
        ((e.params && e.params.items) || []).forEach((it) => {
          if (n[it] != null) n[it]++;
          if (it === "socket") socketHeights.push(e.height);
        });
      } else {
        if (n[e.type] != null) n[e.type]++;
        if (e.type === "socket") socketHeights.push(e.height);
      }
    });
    const medianH = socketHeights.length
      ? socketHeights.sort((a, b) => a - b)[Math.floor(socketHeights.length / 2)]
      : (p.settings.heightPresets.socket || 30);
    return {
      room, sockets: n.socket, sw: n.switch, light: n.light,
      tv: n.tv, internet: n.internet, warm: n.warmfloor,
      ac: n.ac, height: medianH, material: room.material || p.settings.wallMaterial || "Бетон"
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
      material: s.material,
      route: p.settings.routeType === "floor" ? "floor" : "ceiling",
      height: s.height,
      sockets: s.sockets, sw1: s.sw, sw2: 0, sw3: 0, pass: 0, cross: 0,
      tv: s.tv, internet: s.internet, warmFloor: s.warm
    }));
    try {
      return EP.PoolEngine.calc({ blocks, ceilingHeight: p.settings.ceilingHeight, mode: "junction" });
    } catch (e) { return null; }
  }

  // ---------- ТОЧНЫЙ счёт по фактическим трассам ----------
  // Логика штробы — из движка пула (ёмкость 25×30 по вместимости кабелей),
  // но применённая к реальному чертежу: спуск каждой точки по СВОЕЙ стене и
  // ЕЁ материалу; ТП — 50×50 в пол; слаботочка — отдельной штробой.
  // Ниша под щит — как в конфигураторе щита: вырубка × модули + монтаж.
  const LV_LAYERS = { lv: 1, tv: 1, cctv: 1 };
  function calcByRoutes(p) {
    const routes = p.routes || [];
    if (!routes.length) return null;
    const s = p.settings, G2 = G(), RT = EP.Plan.Routes;
    const PE = window.EP.PoolEngine;
    const capTbl = (PE && PE.DEFAULTS && PE.DEFAULTS.capacity) || { "25x30": { round: { "2.5": 2 } } };
    const sizeKey = (w, h) => w + "x" + h; // мм
    const capOf = (key) => {
      const t = capTbl[key], byShape = (t && (t.round || t.flat)) || { "2.5": 2 };
      return Math.max(1, Number(byShape["2.5"]) || 2);
    };
    const elById = (id) => (p.elements || []).find((e) => e.id === id);
    const inCnt = {}, outCnt = {};
    routes.forEach((r) => { outCnt[r.fromId] = (outCnt[r.fromId] || 0) + 1; if (r.toId) inCnt[r.toId] = (inCnt[r.toId] || 0) + 1; });

    const strobe = {}; // "размер|материал" -> метры
    const addStrobe = (sizeK, mat, cm) => { if (cm > 1) { const k = sizeK + "|" + mat; strobe[k] = (strobe[k] || 0) + cm / 100; } };
    const matOfEl = (e2) => { const w = e2.wallId && G2.wallById(p, e2.wallId); return w ? G2.wallMatOf(p, w) : ((s && s.wallMaterial) || "Бетон"); };

    const podroz = {}; // материал -> { std, deep }
    const P = (m) => (podroz[m] = podroz[m] || { std: 0, deep: 0 });
    let junctBoxes = 0;
    const keyStd = sizeKey(s.chaseW || 25, s.chaseH || 30);
    (p.elements || []).forEach((e2) => {
      if (e2.status === "existing") return;
      if (e2.type === "junction") { junctBoxes++; return; }
      const mat = matOfEl(e2);
      // подрозетники по материалу СВОЕЙ стены (выключатели/ТП — глубокие, как в пуле)
      const addPost = (t) => {
        if (t === "switch" || t === "warmfloor") P(mat).deep++;
        else if (t === "socket" || t === "tv" || t === "internet" || t === "ac" || t === "sensor") P(mat).std++;
      };
      if (e2.type === "block") ((e2.params && e2.params.items) || []).forEach(addPost);
      else addPost(e2.type);
      // штроба-спуск: только у точек, к которым построена трасса
      if (!(outCnt[e2.id] || inCnt[e2.id])) return;
      const vert = RT.pointVert(p, e2);
      if (vert < 1) return;
      if (e2.layer === "warm") { addStrobe(sizeKey(s.tpChaseW || 50, s.tpChaseH || 50), mat, vert); return; }
      if (LV_LAYERS[e2.layer]) { addStrobe(keyStd, mat, vert); return; } // слаботочка — своя штроба
      const cables = (outCnt[e2.id] || 0) + (inCnt[e2.id] || 0); // вход+выход шлейфа в одном спуске
      addStrobe(keyStd, mat, Math.max(1, Math.ceil(cables / capOf(keyStd))) * vert);
    });
    // спуск у щита: все линии приходят в одну точку — ёмкость из пула
    const panelMat = () => {
      const pn = (p.panels || [])[0];
      const hit = pn && G2.wallAt(p, { x: pn.x, y: pn.y }, 60);
      return hit ? G2.wallMatOf(p, hit.wall) : ((s && s.wallMaterial) || "Бетон");
    };
    const panelCables = routes.filter((r) => r.toPanel).length;
    if ((p.panels || []).length && panelCables > 0)
      addStrobe(keyStd, panelMat(), Math.ceil(panelCables / capOf(keyStd)) * RT.panelVert(p));

    // кабель по МАРКАМ: марка линии (QF) или по слою; с настраиваемым запасом
    const cableBy = {};
    const reserve = 1 + (Number(s.cableReserve == null ? 10 : s.cableReserve) || 0) / 100;
    routes.forEach((r) => {
      const e2 = elById(r.fromId);
      const L = G2.polylineLen(r.points || []) + (e2 ? RT.pointVert(p, e2) : 0) + (r.toPanel ? RT.panelVert(p) : 0);
      const cc = (p.circuits || []).find((c) => c.id === r.circuitId);
      let mark = (cc && cc.cable) || null;
      if (!mark) {
        if (r.layer === "light") mark = "ВВГнг(А)-LS 3×1.5";
        else if (r.layer === "warm") mark = "Кабель тёплого пола";
        else if (LV_LAYERS[r.layer]) mark = "Слаботочный (UTP/RG-6)";
        else mark = "ВВГнг(А)-LS 3×2.5";
      }
      cableBy[mark] = (cableBy[mark] || 0) + L;
    });
    Object.keys(cableBy).forEach((m) => { cableBy[m] = Math.round((cableBy[m] / 100) * reserve * 10) / 10; });

    // позиции для сметы
    const items = [];
    const add = (type, name, qty, unit) => { qty = Math.round(qty * 10) / 10; if (qty > 0) items.push({ type, name, qty, unit }); };
    const low = (m) => String(m || "").toLowerCase();
    Object.keys(strobe).sort().forEach((k) => { const [size, mat] = k.split("|"); add("work", `Штробление ${size} ${low(mat)}`, strobe[k], "м"); });
    Object.keys(podroz).forEach((mat) => {
      const d = podroz[mat];
      if (d.std) add("work", `Высверливание подрозетников обычных ${low(mat)}`, d.std, "шт");
      if (d.deep) add("work", `Высверливание подрозетников глубоких ${low(mat)}`, d.deep, "шт");
    });
    let pStd = 0, pDeep = 0;
    Object.keys(podroz).forEach((m) => { pStd += podroz[m].std; pDeep += podroz[m].deep; });
    if (pStd) add("material", "Подрозетник Ø68 40-50 мм", pStd, "шт");
    if (pDeep) add("material", "Подрозетник Ø68 65 мм глубокий", pDeep, "шт");
    if (junctBoxes) add("material", "Распаечная коробка (потолок)", junctBoxes, "шт");
    Object.keys(cableBy).forEach((m) => add("material", `Кабель ${m}`, cableBy[m], "м"));
    // проходки через стены: Ø20, макс. 2 кабеля в гильзу; группируем по месту (~20 см)
    const sleeves = {}; // "x|y" -> { n: кабелей, wallId }
    routes.forEach((r) => {
      const seen = {};
      (r.throughWalls || []).forEach((c) => {
        const key = Math.round(c.x / 20) + "|" + Math.round(c.y / 20);
        if (seen[key]) return; // общая стена двух комнат — одно место, одна гильза
        seen[key] = 1;
        if (!sleeves[key]) sleeves[key] = { n: 0, wallId: c.wallId };
        sleeves[key].n++;
      });
    });
    const sleeveByMat = {};
    Object.keys(sleeves).forEach((k) => {
      const w = G2.wallById(p, sleeves[k].wallId);
      const mat = w ? G2.wallMatOf(p, w) : ((s && s.wallMaterial) || "Бетон");
      sleeveByMat[mat] = (sleeveByMat[mat] || 0) + Math.ceil(sleeves[k].n / 2);
    });
    Object.keys(sleeveByMat).forEach((m) => add("work", `Проходка Ø${s.sleeveD || 20} ${low(m)}`, sleeveByMat[m], "шт"));
    // ниша под щит — как в конфигураторе щита (вырубка × модули + монтаж)
    if ((p.panels || []).length) {
      const modules = (s.panelBox && s.panelBox.modules) ||
        (EP.Plan.Scheme && EP.Plan.Scheme.neededModules ? EP.Plan.Scheme.neededModules(p) : 0);
      if (modules > 0) add("work", `Вырубка ниши под щит (${low(panelMat())})`, modules, "мод");
      add("work", "Монтаж щита в нишу/стену", 1, "шт");
    }
    return { items, cableBy, strobe };
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
    const rl = EP.Plan.Routes ? EP.Plan.Routes.lengths(p) : { byLayer: {}, total: 0 };
    const layerName = (id) => ((p.layers || []).find((l) => l.id === id) || { name: id }).name;

    const table = `<table class="ep-plan-table"><tr><th>${T.room}</th>${COLS.map(([, l]) => `<th>${l}</th>`).join("")}</tr>
      ${stats.map((s) => `<tr><td>${esc(s.room.name)}</td>${COLS.map(([k]) => `<td>${s[k] || ""}</td>`).join("")}</tr>`).join("")}</table>`;

    const cable = rl.total > 0
      ? `<div class="ep-plan-srow ep-plan-rlens">${Object.keys(rl.byLayer).map((id) => `<span>${layerName(id)}: <b>${G().fmtLen(rl.byLayer[id])}</b></span>`).join("")}
         <span><b>${G().fmtLen(rl.total)}</b> всего</span></div>`
      : `<div class="ep-plan-srow">${T.cable}: ${T.noRoutes}</div>`;

    // приоритет — ТОЧНЫЙ счёт по построенным трассам; иначе — движок пула по комнатам
    const exact = calcByRoutes(p);
    let items, headHtml;
    if (exact && exact.items.length) {
      items = exact.items;
      headHtml = `<div class="ep-plan-srow"><b>${T.exactHead}</b></div>
        <div class="ep-plan-srow ep-plan-hintrow">${T.exactHint}</div>
        <div class="ep-plan-srow"><label class="ep-plan-range" style="flex:0 0 150px">${T.reserve}
          <input type="number" inputmode="numeric" min="0" max="50" value="${Math.round(p.settings.cableReserve == null ? 10 : p.settings.cableReserve)}" data-pc-reserve></label></div>`;
    } else {
      const res = runEngine(p, stats);
      items = res && res.draftItems ? res.draftItems : null;
      headHtml = `<div class="ep-plan-srow"><b>${T.workHead}</b></div>
        <div class="ep-plan-srow ep-plan-hintrow">${T.approxHint}</div>`;
    }
    const itemsHtml = items
      ? `${headHtml}<div class="ep-plan-items">${items.map((it) => `<div class="ep-plan-irow"><span>${esc(it.name)}</span><b>${it.qty} ${esc(it.unit)}</b></div>`).join("")}</div>`
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
  document.addEventListener("change", (e) => {
    if (!rooms() || !rooms().isActive()) return;
    if (e.target.getAttribute && e.target.getAttribute("data-pc-reserve") != null) {
      const c = core(); c.commit();
      c.project.settings.cableReserve = Math.max(0, Math.min(50, Number(e.target.value) || 0));
      c.persist("cable-reserve"); sheet();
    }
  });

  EP.Plan = EP.Plan || {};
  EP.Plan.Calc = { sheet, buildBlocks, runEngine, priceFor, calcByRoutes };
})();
