/* Electric Pro V29 — Проект квартиры: элементы (Слой 2).
   Палитра типов, посадка на стену (отступ+высота) или свободно (свет/ТП/щит),
   редактор числом, пресеты высот, статус монтажа, фото точки, прогресс. */
(() => {
  "use strict";
  window.EP = window.EP || {};

  const TYPES = {
    block:     { name: "Блок (рамка)", glyph: "▣", layer: "power", h: 30, block: true },
    junction:  { name: "Распайка",    glyph: "◇", layer: "routes", h: null, free: true, node: true },
    door:      { name: "Дверь",       glyph: "Дв", layer: "labels", h: 0, opening: true },
    window:    { name: "Окно",        glyph: "Ок", layer: "labels", h: 90, opening: true },
    socket:    { name: "Розетка",     glyph: "Р",  layer: "power", h: 30 },
    switch:    { name: "Выключатель", glyph: "В",  layer: "light", h: 90 },
    light:     { name: "Свет",        glyph: "С",  layer: "light", h: null, free: true },
    ac:        { name: "Кондиционер", glyph: "КД", layer: "ac",    h: 220 },
    warmfloor: { name: "Тёплый пол",  glyph: "ТП", layer: "warm",  h: 0, free: true },
    internet:  { name: "Интернет",    glyph: "И",  layer: "lv",    h: 30 },
    tv:        { name: "ТВ",          glyph: "ТВ", layer: "tv",    h: 130 },
    camera:    { name: "Камера",      glyph: "ВК", layer: "cctv",  h: 230 },
    sensor:    { name: "Датчик",      glyph: "Д",  layer: "lv",    h: 220 },
    panel:     { name: "Щит",         glyph: "Щ",  layer: "power", h: 150, panel: true }
  };
  const STATUS = [["planned", "План"], ["mounted", "Готово ✓"], ["existing", "Было"]];
  const CFG = { hitPx: 22, wallSnapPx: 26, photoMax: 4, photoSide: 640, blockMax: 6 };
  const BLOCK_TYPES = ["socket", "switch", "tv", "internet"]; // что можно ставить в рамку
  const T = {
    palette: "Палитра", progress: "Смонтировано",
    offset: "Отступ от угла, см", height: "Высота от пола, см",
    status: "Статус", del: "✕ Удалить", apply: "✓", photo: "📷 Фото",
    confirmDel: "Удалить точку?", tapWall: "Тапни ближе к стене — элемент сядет на неё.",
    presets: "Пресеты:",
    blockTitle: "Сборка блока", blockPosts: (n, m) => `${n}/${m} постов`,
    blockAdd: "Добавить пост:", blockTapDel: "Тап по посту в рамке — убрать"
  };

  const esc = (s) => String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const $ = (sel, r) => (r || document).querySelector(sel);
  const core = () => EP.Plan.Core;
  const G = () => EP.Plan.Geometry;
  const rooms = () => EP.Plan.Rooms;

  const S = { selType: "socket", selId: null };

  // ---------- палитра / размещение ----------
  function onModeEnter() { sheetPalette(); }
  function sheetPalette() {
    const p = core().project;
    const total = p.elements.filter((e) => e.status !== "existing").length;
    const done = p.elements.filter((e) => e.status === "mounted").length;
    const pct = total ? Math.round((done / total) * 100) : 0;
    rooms().openSheet(`<div class="ep-plan-srow"><b>${T.palette}</b><span class="ep-plan-flex"></span>
        <span>${T.progress}: <b>${done}/${total}</b> · ${pct}%</span></div>
      <div class="ep-plan-palette">${Object.keys(TYPES).map((k) => `
        <button type="button" class="ep-plan-pbtn ep-clickable ${S.selType === k ? "on" : ""}" data-pe-type="${k}">
          <i class="ep-plan-glyph" data-glyph="${esc(TYPES[k].glyph)}">${esc(TYPES[k].glyph)}</i>${esc(TYPES[k].name)}</button>`).join("")}
      </div>`);
  }
  function defaultHeight(type) {
    const s = core().project.settings;
    if (type === "socket") return s.heightPresets.socket;
    if (type === "switch") return s.heightPresets.switch;
    return TYPES[type].h == null ? s.ceilingHeight : TYPES[type].h;
  }
  function placeAt(w) {
    const c = core(), p = c.project, t = TYPES[S.selType];
    const k = rooms().canvasCmPerPx();
    if (t.panel) {
      c.commit();
      p.panels.push(c.model.newPanel(G().snapPoint(w, p.settings.gridStep).x, G().snapPoint(w, p.settings.gridStep).y));
      c.persist("panel-add");
      return;
    }
    const hit = G().wallAt(p, w, CFG.wallSnapPx * k);
    if (t.opening) { // дверь/окно — это проём в стене, не электроточка
      if (!hit) { rooms().toast(T.tapWall); return; }
      c.commit();
      const op = c.model.newOpening(S.selType, hit.wall.id, G().snap(Math.max(0, hit.offset - (S.selType === "window" ? 70 : 45)), p.settings.gridStep), undefined);
      // дверь по умолчанию открывается внутрь комнаты
      const room = p.rooms.find((r) => r.id === String(hit.wall.id).split(":")[0]);
      if (room) {
        const cpt = G().centroid(room.points);
        const nx = -(hit.wall.b.y - hit.wall.a.y), ny = hit.wall.b.x - hit.wall.a.x;
        op.flip = (nx * (cpt.x - hit.wall.mx) + ny * (cpt.y - hit.wall.my)) >= 0 ? 1 : -1;
      }
      p.openings.push(op);
      c.persist("opening-add");
      openOpeningEditor(op);
      return;
    }
    c.commit();
    if (hit) {
      const el = c.model.newElement(S.selType, hit.wall.id, G().snap(hit.offset, p.settings.gridStep), defaultHeight(S.selType), t.layer);
      if (t.block) el.params = { items: ["socket"] }; // рамка начинается с одной розетки
      p.elements.push(el);
      c.persist("elem-add");
      if (t.block) { openEditor(el); return; } // сразу открываем сборку блока
      return;
    } else if (t.free) {
      const sp = G().snapPoint(w, p.settings.gridStep);
      const el = c.model.newElement(S.selType, null, 0, defaultHeight(S.selType), t.layer);
      el.params = { x: sp.x, y: sp.y };
      p.elements.push(el);
    } else { rooms().toast(T.tapWall); return; }
    c.persist("elem-add");
  }

  // ---------- попадание / выбор ----------
  function hitAt(w, maxCm) {
    const p = core().project;
    let best = null;
    p.elements.forEach((el) => {
      const pt = G().elemPoint(p, el);
      if (!pt) return;
      const d = G().dist(w, pt);
      if (d <= maxCm && (!best || d < best.d)) best = { d, el };
    });
    p.panels.forEach((pn) => {
      const d = G().dist(w, pn);
      if (d <= maxCm && (!best || d < best.d)) best = { d, panel: pn };
    });
    (p.openings || []).forEach((op) => {
      const wall = G().wallById(p, op.wallId);
      if (!wall) return;
      const mid = G().pointAtOffset(wall, op.offset + op.width / 2);
      const d = G().dist(w, mid);
      const r = Math.max(maxCm, op.width / 2);
      if (d <= r && (!best || d < best.d)) best = { d, opening: op };
    });
    return best;
  }
  const selectedId = () => S.selId;

  // ---------- редактор элемента ----------
  function openEditor(el) {
    S.selId = el.id;
    const p = core().project, t = TYPES[el.type] || { name: el.type };
    const hp = p.settings.heightPresets;
    const wallLen = el.wallId ? Math.round((G().wallById(p, el.wallId) || { len: 0 }).len) : 0;
    rooms().openSheet(`<div class="ep-plan-srow"><b>${esc(t.name)}</b>
        ${el.wallId ? `<span>· стена ${esc(el.wallId.split(":")[1] * 1 + 1)} (${wallLen} см)</span>` : "· свободно"}</div>
      <div class="ep-plan-srow ep-plan-s2">
        ${el.wallId ? `<label>${T.offset}<input id="ep-pe-off" type="number" inputmode="numeric" min="0" max="${wallLen}" value="${Math.round(el.offset)}"></label>` : ""}
        <label>${T.height}<input id="ep-pe-h" type="number" inputmode="numeric" min="0" value="${Math.round(el.height)}"></label>
      </div>
      <div class="ep-plan-srow">${T.presets}
        ${[hp.socket, hp.switch, hp.kitchen].map((v) => `<button type="button" class="ep-plan-chip ep-clickable" data-pe-preset="${v}">${v}</button>`).join("")}
      </div>
      ${circuitRow(el)}
      ${el.type === "block" ? blockHtml(el) : ""}
      <div class="ep-plan-srow">${T.status}:
        ${STATUS.map(([v, l]) => `<button type="button" class="ep-plan-chip ep-clickable ${el.status === v ? "on" : ""}" data-pe-status="${v}">${l}</button>`).join("")}
      </div>
      <div class="ep-plan-srow" id="ep-pe-photos">${photosHtml(el)}</div>
      <div class="ep-plan-srow ep-plan-sbtns">
        <button type="button" class="ep-plan-tbtn ep-clickable" data-pe-apply>${T.apply}</button>
        <button type="button" class="ep-plan-tbtn ep-clickable" data-pe-photo>${T.photo} (${(el.photos || []).length})</button>
        <button type="button" class="ep-plan-tbtn ep-plan-danger ep-clickable" data-pe-del>${T.del}</button>
      </div>
      <input id="ep-pe-file" type="file" accept="image/*" capture="environment" hidden>`);
    rooms().renderScene();
  }
  function openOpeningEditor(op) {
    S.selId = op.id;
    const p = core().project, wall = G().wallById(p, op.wallId);
    const isDoor = op.type === "door";
    rooms().openSheet(`<div class="ep-plan-srow"><b>${isDoor ? "Дверь" : "Окно"}</b>
        <span>· стена ${wall ? wall.n : "?"} (${wall ? Math.round(wall.len) : 0} см)</span></div>
      <div class="ep-plan-srow ep-plan-s2">
        <label>${T.offset}<input id="ep-po-off" type="number" inputmode="numeric" min="0" value="${Math.round(op.offset)}"></label>
        <label>Ширина, см<input id="ep-po-w" type="number" inputmode="numeric" min="40" value="${Math.round(op.width)}"></label>
      </div>
      ${isDoor ? `<div class="ep-plan-srow">
        <button type="button" class="ep-plan-chip ep-clickable" data-po-hinge>Петли: ${op.hinge === "a" ? "слева" : "справа"}</button>
        <button type="button" class="ep-plan-chip ep-clickable" data-po-flip>Открывание: ${op.flip > 0 ? "внутрь" : "наружу"}</button>
      </div>` : ""}
      <div class="ep-plan-srow ep-plan-sbtns">
        <button type="button" class="ep-plan-tbtn ep-clickable" data-po-apply>${T.apply}</button>
        <button type="button" class="ep-plan-tbtn ep-plan-danger ep-clickable" data-po-del>${T.del}</button>
      </div>`);
    rooms().renderScene();
  }
  function currentOpening() { return (core().project.openings || []).find((o) => o.id === S.selId) || null; }

  function openPanelEditor(pn) {
    S.selId = pn.id;
    rooms().openSheet(`<div class="ep-plan-srow"><b>${esc(pn.name || "Щит")}</b></div>
      <div class="ep-plan-srow"><input id="ep-pe-pname" type="text" value="${esc(pn.name || "Щит")}" maxlength="30"></div>
      <div class="ep-plan-srow ep-plan-sbtns">
        <button type="button" class="ep-plan-tbtn ep-clickable" data-pe-papply="${esc(pn.id)}">${T.apply}</button>
        <button type="button" class="ep-plan-tbtn ep-plan-danger ep-clickable" data-pe-pdel="${esc(pn.id)}">${T.del}</button>
      </div>`);
    rooms().renderScene();
  }
  // Назначение линии (автомата): чипы существующих линий + «новая»
  function circuitRow(el) {
    const cs = core().project.circuits || [];
    return `<div class="ep-plan-srow">Линия:
      ${cs.map((c) => `<button type="button" class="ep-plan-chip ep-clickable ${el.circuitId === c.id ? "on" : ""}" data-pe-circ="${esc(c.id)}" style="border-color:${esc(c.color)}"><i class="ep-plan-cdot" style="background:${esc(c.color)}"></i>${esc(c.name)}·${c.breaker}A</button>`).join("")}
      <button type="button" class="ep-plan-chip ep-clickable" data-pe-circ-new>+ линия</button>
    </div>`;
  }

  // «Сборка блока»: рамка с постами (как на бумажных схемах — 1-6 в общей рамке)
  function blockHtml(el) {
    const items = (el.params && el.params.items) || [];
    return `<div class="ep-plan-srow"><b>${T.blockTitle}</b><span class="ep-plan-flex"></span><span>${T.blockPosts(items.length, CFG.blockMax)}</span></div>
      <div class="ep-plan-blockframe">${items.map((k, i) =>
        `<button type="button" class="ep-plan-post ep-clickable" data-pe-bdel="${i}" aria-label="Убрать пост ${esc((TYPES[k] || {}).name || k)}">${esc((TYPES[k] || {}).glyph || "?")}</button>`).join("")}
      </div>
      <div class="ep-plan-srow">${T.blockAdd}
        ${BLOCK_TYPES.map((k) => `<button type="button" class="ep-plan-chip ep-clickable" data-pe-badd="${k}">+${esc(TYPES[k].glyph)}</button>`).join("")}
      </div>
      <div class="ep-plan-modehint">${T.blockTapDel}</div>`;
  }

  function photosHtml(el) {
    return (el.photos || []).map((src, i) =>
      `<span class="ep-plan-ph"><img src="${src}" alt="фото точки"><button type="button" data-pe-phdel="${i}" aria-label="Удалить фото">✕</button></span>`).join("");
  }
  function current() { return core().project.elements.find((e) => e.id === S.selId) || null; }

  function applyEditor() {
    const c = core(), el = current(); if (!el) return;
    c.commit();
    if (el.wallId) {
      const w = G().wallById(c.project, el.wallId);
      const off = Number(($("#ep-pe-off") || {}).value);
      if (Number.isFinite(off) && w) el.offset = Math.max(0, Math.min(w.len, off));
    }
    const h = Number(($("#ep-pe-h") || {}).value);
    if (Number.isFinite(h)) el.height = Math.max(0, h);
    c.persist("elem-edit");
    openEditor(el);
  }
  function addPhoto(file) {
    const el = current(); if (!el) return;
    if ((el.photos || []).length >= CFG.photoMax) return;
    const rd = new FileReader();
    rd.onload = () => {
      const img = new Image();
      img.onload = () => {
        const k = Math.min(1, CFG.photoSide / Math.max(img.width, img.height));
        const cv = document.createElement("canvas");
        cv.width = Math.round(img.width * k); cv.height = Math.round(img.height * k);
        cv.getContext("2d").drawImage(img, 0, 0, cv.width, cv.height);
        const c = core();
        c.commit();
        el.photos = el.photos || [];
        el.photos.push(cv.toDataURL("image/jpeg", 0.7));
        c.persist("elem-photo");
        openEditor(el);
      };
      img.src = String(rd.result || "");
    };
    rd.readAsDataURL(file);
  }

  // ---------- события ----------
  document.addEventListener("click", (e) => {
    if (!rooms() || !rooms().isActive()) return;
    const t = e.target; let b;
    if ((b = t.closest("[data-pe-type]"))) { S.selType = b.getAttribute("data-pe-type"); sheetPalette(); return; }
    if ((b = t.closest("[data-pe-preset]"))) { const i = $("#ep-pe-h"); if (i) i.value = b.getAttribute("data-pe-preset"); return; }
    if ((b = t.closest("[data-pe-status]"))) {
      const c = core(), el = current(); if (!el) return;
      c.commit(); el.status = b.getAttribute("data-pe-status"); c.persist("elem-status"); openEditor(el); return;
    }
    if ((b = t.closest("[data-pe-badd]"))) {
      const c = core(), el = current(); if (!el || el.type !== "block") return;
      const items = (el.params.items = el.params.items || []);
      if (items.length >= CFG.blockMax) return;
      c.commit(); items.push(b.getAttribute("data-pe-badd")); c.persist("block-add"); openEditor(el); return;
    }
    if ((b = t.closest("[data-pe-bdel]"))) {
      const c = core(), el = current(); if (!el || el.type !== "block") return;
      const items = (el.params.items = el.params.items || []);
      if (items.length <= 1) return; // пустых рамок не бывает — удаляй сам блок
      c.commit(); items.splice(Number(b.getAttribute("data-pe-bdel")), 1); c.persist("block-del"); openEditor(el); return;
    }
    if ((b = t.closest("[data-pe-circ]"))) {
      const c = core(), el = current(); if (!el) return;
      const id = b.getAttribute("data-pe-circ");
      c.commit(); el.circuitId = el.circuitId === id ? null : id; c.persist("elem-circuit"); openEditor(el); return;
    }
    if (t.closest("[data-pe-circ-new]")) {
      const c = core(), el = current(); if (!el) return;
      c.commit();
      const colors = EP.Plan.Core.DEFAULTS.circuitColors;
      const cs = c.project.circuits;
      const circ = c.model.newCircuit("QF" + (cs.length + 1), colors[cs.length % colors.length], 16);
      cs.push(circ); el.circuitId = circ.id;
      c.persist("circuit-add"); openEditor(el); return;
    }
    if (t.closest("[data-pe-apply]")) return applyEditor();
    if (t.closest("[data-pe-del]")) {
      const c = core(), el = current(); if (!el) return;
      if (!confirm(T.confirmDel)) return;
      c.commit();
      c.project.elements = c.project.elements.filter((x) => x.id !== el.id);
      c.project.routes = c.project.routes.filter((r) => r.fromId !== el.id);
      c.persist("elem-del");
      S.selId = null; rooms().closeSheet(); rooms().renderScene(); return;
    }
    if (t.closest("[data-pe-photo]")) { const f = $("#ep-pe-file"); if (f) { f.onchange = () => { if (f.files && f.files[0]) addPhoto(f.files[0]); }; f.click(); } return; }
    if ((b = t.closest("[data-pe-phdel]"))) {
      const c = core(), el = current(); if (!el) return;
      c.commit(); el.photos.splice(Number(b.getAttribute("data-pe-phdel")), 1); c.persist("elem-photo-del"); openEditor(el); return;
    }
    if (t.closest("[data-po-apply]")) {
      const c = core(), op = currentOpening(); if (!op) return;
      const wall = G().wallById(c.project, op.wallId);
      c.commit();
      const off = Number(($("#ep-po-off") || {}).value), wd = Number(($("#ep-po-w") || {}).value);
      if (Number.isFinite(wd) && wd >= 40) op.width = wd;
      if (Number.isFinite(off) && wall) op.offset = Math.max(0, Math.min(wall.len - op.width, off));
      c.persist("opening-edit"); openOpeningEditor(op); return;
    }
    if (t.closest("[data-po-hinge]")) {
      const c = core(), op = currentOpening(); if (!op) return;
      c.commit(); op.hinge = op.hinge === "a" ? "b" : "a"; c.persist("opening-hinge"); openOpeningEditor(op); return;
    }
    if (t.closest("[data-po-flip]")) {
      const c = core(), op = currentOpening(); if (!op) return;
      c.commit(); op.flip = -op.flip; c.persist("opening-flip"); openOpeningEditor(op); return;
    }
    if (t.closest("[data-po-del]")) {
      const c = core(), op = currentOpening(); if (!op) return;
      c.commit(); c.project.openings = c.project.openings.filter((o) => o.id !== op.id); c.persist("opening-del");
      S.selId = null; rooms().closeSheet(); rooms().renderScene(); return;
    }
    if ((b = t.closest("[data-pe-papply]"))) {
      const c = core(), pn = c.project.panels.find((x) => x.id === b.getAttribute("data-pe-papply")); if (!pn) return;
      c.commit(); pn.name = (($("#ep-pe-pname") || {}).value || "Щит").trim() || "Щит"; c.persist("panel-edit"); return;
    }
    if ((b = t.closest("[data-pe-pdel]"))) {
      const c = core(), id = b.getAttribute("data-pe-pdel");
      c.commit();
      c.project.panels = c.project.panels.filter((x) => x.id !== id);
      c.project.routes = c.project.routes.filter((r) => r.toId !== id);
      c.persist("panel-del");
      S.selId = null; rooms().closeSheet(); rooms().renderScene(); return;
    }
  });

  function deselect() { S.selId = null; }

  EP.Plan = EP.Plan || {};
  EP.Plan.Elements = { TYPES, CFG, onModeEnter, placeAt, hitAt, openEditor, openPanelEditor, openOpeningEditor, selectedId, deselect };
})();
