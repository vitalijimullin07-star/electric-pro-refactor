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
    bra:       { name: "Бра",         glyph: "Бра", layer: "light", h: 170 },
    track:     { name: "Трек",        glyph: "Трек", layer: "light", h: null, free: true },
    ac:        { name: "Кондиционер", glyph: "КД", layer: "ac",    h: 220 },
    warmfloor: { name: "Тёплый пол",  glyph: "ТП", layer: "warm",  h: 0, free: true },
    internet:  { name: "Интернет",    glyph: "И",  layer: "lv",    h: 30 },
    tv:        { name: "ТВ",          glyph: "ТВ", layer: "tv",    h: 130 },
    camera:    { name: "Камера",      glyph: "ВК", layer: "cctv",  h: 230 },
    sensor:    { name: "Датчик",      glyph: "Д",  layer: "lv",    h: 220 },
    output:    { name: "Вывод",       glyph: "Вых", layer: "power", h: null, free: true, layerChoice: true },
    output24:  { name: "Вывод 24В",   glyph: "24В", layer: "lv",    h: null, free: true },
    panel:     { name: "Щит",         glyph: "Щ",  layer: "power", h: 150, panel: true }
  };
  // Проёмы — под ОТДЕЛЬНОЙ кнопкой (🚪): дверь / раздвижная / окно / балкон.
  const OPEN_TYPES = {
    door:    { name: "Дверь",      glyph: "Дв" },
    sliding: { name: "Раздвижная", glyph: "РД" },
    window:  { name: "Окно",       glyph: "Ок" },
    balcony: { name: "Балкон",     glyph: "Бл" },
    opening: { name: "Проём",      glyph: "Пр" }
  };
  const STATUS = [["planned", "План"], ["mounted", "Готово ✓"], ["existing", "Было"]];
  const CFG = { hitPx: 22, wallSnapPx: 26, photoMax: 4, photoSide: 640, blockMax: 6 };
  const BLOCK_TYPES = ["socket", "switch", "tv", "internet"]; // что можно ставить в рамку
  // электропалитра — без дверей/окон (они в отдельном инструменте «Проёмы»)
  const PALETTE_TYPES = Object.keys(TYPES).filter((k) => !TYPES[k].opening);
  const T = {
    palette: "Палитра", progress: "Смонтировано",
    offset: "Отступ от угла, см", height: "Высота от пола, см",
    status: "Статус", del: "✕ Удалить", apply: "✓", photo: "📷 Фото",
    confirmDel: "Удалить точку?", tapWall: "Тапни ближе к стене — элемент сядет на неё.",
    presets: "Пресеты:",
    blockTitle: "Сборка блока", blockPosts: (n, m) => `${n}/${m} постов`,
    blockAdd: "Добавить пост:", blockTapDel: "Тап по посту в рамке — убрать",
    outLayer: "Тип вывода:", outPower: "Силовой", outLv: "Слаботочный",
    swTarget: "Свет от выключателя:", swAuto: "Авто (по линии)", swNone: "не задан",
    swKindLbl: "Тип:", swNormal: "Обычный", swPass: "Проходной", swCross: "Перекрёстный",
    swKeysLbl: "Клавиш:", swChain: "Цепочка — следующий:", swChainLast: "Это последнее звено → к лампе",
    swChainNone: "нет других выключателей в комнате для связи"
  };
  const OUT_LAYERS = [["power", "outPower"], ["lv", "outLv"]];
  const SW_KINDS = [["normal", "swNormal"], ["pass", "swPass"], ["cross", "swCross"]];
  const SW_KIND_GLYPH = { normal: "В", pass: "ПВ", cross: "ПкВ" };

  const esc = (s) => String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const $ = (sel, r) => (r || document).querySelector(sel);
  const core = () => EP.Plan.Core;
  const G = () => EP.Plan.Geometry;
  const rooms = () => EP.Plan.Rooms;

  const S = { selType: "socket", selId: null, openType: "door" };

  // ---------- палитра / размещение ----------
  function onModeEnter() { sheetPalette(); }
  function sheetPalette() {
    const p = core().project;
    const total = p.elements.filter((e) => e.status !== "existing").length;
    const done = p.elements.filter((e) => e.status === "mounted").length;
    const pct = total ? Math.round((done / total) * 100) : 0;
    rooms().openSheet(`<div class="ep-plan-srow"><b>${T.palette}</b><span class="ep-plan-flex"></span>
        <span>${T.progress}: <b>${done}/${total}</b> · ${pct}%</span></div>
      <div class="ep-plan-palette">${PALETTE_TYPES.map((k) => `
        <button type="button" class="ep-plan-pbtn ep-clickable ${S.selType === k ? "on" : ""}" data-pe-type="${k}">
          <i class="ep-plan-glyph" data-glyph="${esc(TYPES[k].glyph)}">${esc(TYPES[k].glyph)}</i>${esc(TYPES[k].name)}</button>`).join("")}
      </div>`);
  }
  // ----- Проёмы (отдельный инструмент) -----
  function onOpeningModeEnter() { sheetOpenings(); }
  function sheetOpenings() {
    const p = core().project;
    const cnt = (p.openings || []).length;
    rooms().openSheet(`<div class="ep-plan-srow"><b>🚪 Проёмы</b><span class="ep-plan-flex"></span><span>Всего: <b>${cnt}</b></span></div>
      <div class="ep-plan-palette">${Object.keys(OPEN_TYPES).map((k) => `
        <button type="button" class="ep-plan-pbtn ep-clickable ${S.openType === k ? "on" : ""}" data-pe-otype="${k}">
          <i class="ep-plan-glyph">${esc(OPEN_TYPES[k].glyph)}</i>${esc(OPEN_TYPES[k].name)}</button>`).join("")}
      </div>
      <div class="ep-plan-modehint">Тапни по стене — проём сядет на неё. Номер задаётся автоматически, размеры — в редакторе.</div>`);
  }
  // Номер проёма внутри своего вида (О1..О7, Дв1..): для отображения на плане
  function openingNum(p, op) {
    const same = (p.openings || []).filter((o) => (o.kind || o.type) === (op.kind || op.type));
    const i = same.findIndex((o) => o.id === op.id);
    const pfx = (EP.Plan.Core.OPENING_KINDS[op.kind] || {}).pfx || "П";
    return pfx + (i + 1);
  }
  function placeOpening(w) {
    const c = core(), p = c.project;
    const k = rooms().canvasCmPerPx();
    const hit = G().wallAt(p, w, CFG.wallSnapPx * k);
    if (!hit) { rooms().toast(T.tapWall); return; }
    c.commit();
    const d = EP.Plan.Core.OPENING_KINDS[S.openType] || {};
    const op = c.model.newOpening(S.openType, hit.wall.id, G().snap(Math.max(0, hit.offset - (d.w || 90) / 2), p.settings.gridStep), undefined);
    const room = p.rooms.find((r) => r.id === String(hit.wall.id).split(":")[0]);
    if (room) {
      const cpt = G().centroid(room.points);
      const nx = -(hit.wall.b.y - hit.wall.a.y), ny = hit.wall.b.x - hit.wall.a.x;
      op.flip = (nx * (cpt.x - hit.wall.mx) + ny * (cpt.y - hit.wall.my)) >= 0 ? 1 : -1;
    }
    p.openings.push(op);
    c.persist("opening-add");
    openOpeningEditor(op);
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
      const pt = G().elemDrawPoint(p, el); // тап должен попадать по ВИДИМОМУ маркеру, а не по оси стены
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
      ${t.layerChoice ? outLayerRow(el) : ""}
      ${el.type === "switch" ? switchKindRow(el) + switchKeysRow(el) + switchChainRow(el) + (el.chainNext ? "" : switchTargetRow(el)) : ""}
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
    const pt = G().elemPoint(p, el);
    if (pt && rooms().ensureVisibleAboveSheet) rooms().ensureVisibleAboveSheet(pt);
  }
  function openOpeningEditor(op) {
    S.selId = op.id;
    const p = core().project, wall = G().wallById(p, op.wallId);
    const kind = op.kind || (op.type === "window" ? "window" : "door");
    const meta = OPEN_TYPES[kind] || OPEN_TYPES.door;
    const isWin = kind === "window" || kind === "balcony";
    const swingKind = kind === "door" || kind === "balcony";
    rooms().openSheet(`<div class="ep-plan-srow"><b>${esc(meta.name)} ${esc(openingNum(p, op))}</b>
        <span>· стена ${wall ? wall.n : "?"} (${wall ? Math.round(wall.len) : 0} см)</span></div>
      <div class="ep-plan-srow">Тип:
        ${Object.keys(OPEN_TYPES).map((k) => `<button type="button" class="ep-plan-chip ep-clickable ${kind === k ? "on" : ""}" data-po-kind="${k}">${esc(OPEN_TYPES[k].name)}</button>`).join("")}
      </div>
      <div class="ep-plan-srow ep-plan-s2">
        <label>${T.offset}<input id="ep-po-off" type="number" inputmode="numeric" min="0" value="${Math.round(op.offset)}"></label>
        <label>Ширина, см<input id="ep-po-w" type="number" inputmode="numeric" min="40" value="${Math.round(op.width)}"></label>
      </div>
      <div class="ep-plan-srow ep-plan-s2">
        <label>Высота проёма, см<input id="ep-po-h" type="number" inputmode="numeric" min="40" value="${Math.round(op.height || 200)}"></label>
        ${isWin ? `<label>Низ от пола, см<input id="ep-po-sill" type="number" inputmode="numeric" min="0" value="${Math.round(op.sill || 0)}"></label>` : ""}
      </div>
      ${swingKind ? `<div class="ep-plan-srow">
        <button type="button" class="ep-plan-chip ep-clickable" data-po-hinge>Петли: ${op.hinge === "a" ? "слева" : "справа"}</button>
        <button type="button" class="ep-plan-chip ep-clickable" data-po-flip>Открывание: ${op.flip > 0 ? "внутрь" : "наружу"}</button>
      </div>` : ""}
      <div class="ep-plan-modehint">Номера проёмов вкл/выкл — слой «Подписи» (🗂).</div>
      <div class="ep-plan-srow ep-plan-sbtns">
        <button type="button" class="ep-plan-tbtn ep-clickable" data-po-apply>${T.apply}</button>
        <button type="button" class="ep-plan-tbtn ep-plan-danger ep-clickable" data-po-del>${T.del}</button>
      </div>`);
    rooms().renderScene();
    if (wall && rooms().ensureVisibleAboveSheet) rooms().ensureVisibleAboveSheet(G().pointAtOffset(wall, op.offset + op.width / 2));
  }
  function currentOpening() { return (core().project.openings || []).find((o) => o.id === S.selId) || null; }

  function openPanelEditor(pn) {
    S.selId = pn.id;
    rooms().openSheet(`<div class="ep-plan-srow"><b>${esc(pn.name || "Щит")}</b></div>
      <div class="ep-plan-srow"><input id="ep-pe-pname" type="text" value="${esc(pn.name || "Щит")}" maxlength="30"></div>
      <div class="ep-plan-srow"><label class="ep-plan-chk"><input type="checkbox" data-pe-ptrafo="${esc(pn.id)}" ${pn.transformer ? "checked" : ""}>Трансформатор в слаботочном щите (24В для ленты)</label></div>
      <div class="ep-plan-srow ep-plan-sbtns">
        <button type="button" class="ep-plan-tbtn ep-clickable" data-pe-papply="${esc(pn.id)}">${T.apply}</button>
        <button type="button" class="ep-plan-tbtn ep-plan-danger ep-clickable" data-pe-pdel="${esc(pn.id)}">${T.del}</button>
      </div>`);
    rooms().renderScene();
    if (rooms().ensureVisibleAboveSheet) rooms().ensureVisibleAboveSheet({ x: pn.x, y: pn.y });
  }
  // создаёт новую линию (QF) и назначает её элементу — первый незанятый цвет,
  // номер = максимум существующих QF + 1 (без повторов после удалений). Общая
  // логика для главного редактора точки (data-pe-circ-new) и карточки точки
  // в развёртке (data-pu-circ-new) — не дублировать подбор цвета/номера.
  function assignNewCircuit(el) {
    const c = core();
    const colors = EP.Plan.Core.DEFAULTS.circuitColors;
    const cs = c.project.circuits;
    const used = new Set(cs.map((x) => x.color));
    const color = colors.find((col) => !used.has(col)) || colors[cs.length % colors.length];
    const maxN = cs.reduce((m, x) => { const n = parseInt(String(x.name).replace(/\D/g, ""), 10); return Number.isFinite(n) ? Math.max(m, n) : m; }, 0);
    const circ = c.model.newCircuit("QF" + (maxN + 1), color, 16);
    cs.push(circ); el.circuitId = circ.id;
    return circ;
  }
  // Назначение линии (автомата): чипы существующих линий + «новая». attr — префикс
  // data-атрибутов ("pe" в главном редакторе точки, "pu" в карточке точки развёртки —
  // РАЗНЫЕ обработчики: pe-* зовёт openEditor() и перерисовывает ВЕСЬ #ep-plan-sheet,
  // pu-* остаётся внутри развёртки и перерисовывает только карточку, см. plan-unfold.js).
  function circuitRow(el, attr) {
    const a = attr || "pe";
    const cs = core().project.circuits || [];
    return `<div class="ep-plan-srow">Линия:
      ${cs.map((c) => `<button type="button" class="ep-plan-chip ep-clickable ${el.circuitId === c.id ? "on" : ""}" data-${a}-circ="${esc(c.id)}" style="border-color:${esc(c.color)}"><i class="ep-plan-cdot" style="background:${esc(c.color)}"></i>${esc(c.name)}·${c.breaker}A</button>`).join("")}
      <button type="button" class="ep-plan-chip ep-clickable" data-${a}-circ-new>+ линия</button>
    </div>`;
  }

  // тип вывода (силовой/слаботочный) — для "Вывода" из стены/потолка/пола
  function outLayerRow(el) {
    return `<div class="ep-plan-srow">${T.outLayer}
      ${OUT_LAYERS.map(([v, lk]) => `<button type="button" class="ep-plan-chip ep-clickable ${(el.layer || "power") === v ? "on" : ""}" data-pe-outlayer="${v}">${esc(T[lk])}</button>`).join("")}
    </div>`;
  }
  // выключатель: тип (обычный/проходной/перекрёстный) — влияет на разводку и коннекторы
  function switchKindRow(el) {
    return `<div class="ep-plan-srow">${T.swKindLbl}
      ${SW_KINDS.map(([v, lk]) => `<button type="button" class="ep-plan-chip ep-clickable ${(el.swKind || "normal") === v ? "on" : ""}" data-pe-swkind="${v}">${esc(T[lk])}</button>`).join("")}
    </div>`;
  }
  // клавиши (1-3) — только у обычного (проходной/перекрёстный всегда 1 клавиша цепочки)
  function switchKeysRow(el) {
    if ((el.swKind || "normal") !== "normal") return "";
    return `<div class="ep-plan-srow">${T.swKeysLbl}
      ${[1, 2, 3].map((n) => `<button type="button" class="ep-plan-chip ep-clickable ${(el.keys || 1) === n ? "on" : ""}" data-pe-swkeys="${n}">${n}</button>`).join("")}
    </div>`;
  }
  // куда идёт свет от каждой клавиши: ручной выбор + авто по линии (пунктир на плане)
  function switchTargetRow(el) {
    const p = core().project;
    const roomId = el.wallId ? String(el.wallId).split(":")[0] : null;
    const pool = roomId ? G().elementsInRoom(p, roomId) : p.elements;
    const opts = pool.filter((e) => e.id !== el.id && (e.type === "light" || e.type === "output"));
    if (!opts.length) return `<div class="ep-plan-modehint">${T.swNone}</div>`;
    const keys = (el.swKind || "normal") !== "normal" ? 1 : Math.max(1, el.keys || 1);
    const rows = [];
    for (let ki = 0; ki < keys; ki++) {
      const manualId = (el.targetIds && el.targetIds[ki]) || (ki === 0 ? el.targetId : null);
      const auto = G().switchTarget ? G().switchTarget(p, el, ki) : null; // с учётом текущего manualId
      const label = keys > 1 ? `${T.swTarget} клавиша ${ki + 1}:` : T.swTarget;
      rows.push(`<div class="ep-plan-srow">${label}
        <button type="button" class="ep-plan-chip ep-clickable ${!manualId ? "on" : ""}" data-pe-target="${ki}:auto">${T.swAuto}${!manualId && auto ? " → " + esc((TYPES[auto.type] || {}).glyph || "") : ""}</button>
        ${opts.map((e) => `<button type="button" class="ep-plan-chip ep-clickable ${manualId === e.id ? "on" : ""}" data-pe-target="${ki}:${esc(e.id)}">${esc((TYPES[e.type] || {}).glyph || "?")} ${Math.round(e.params ? (e.params.x || 0) : e.offset)}</button>`).join("")}
      </div>`);
    }
    return rows.join("");
  }
  // цепочка проходных/перекрёстных: провод к СЛЕДУЮЩЕМУ звену; без chainNext — это
  // последнее звено, оно ведёт к лампе (см. switchTargetRow выше)
  function switchChainRow(el) {
    if ((el.swKind || "normal") === "normal") return "";
    const p = core().project;
    const roomId = el.wallId ? String(el.wallId).split(":")[0] : null;
    const pool = (roomId ? G().elementsInRoom(p, roomId) : p.elements).filter((e) => e.id !== el.id && e.type === "switch");
    return `<div class="ep-plan-srow">${T.swChain}
      <button type="button" class="ep-plan-chip ep-clickable ${!el.chainNext ? "on" : ""}" data-pe-chain="">${T.swChainLast}</button>
      ${pool.map((e) => `<button type="button" class="ep-plan-chip ep-clickable ${el.chainNext === e.id ? "on" : ""}" data-pe-chain="${esc(e.id)}">${esc(SW_KIND_GLYPH[e.swKind || "normal"])} ${Math.round(e.offset)}</button>`).join("")}
      ${!pool.length ? `<span class="ep-plan-modehint">${T.swChainNone}</span>` : ""}
    </div>`;
  }

  // «Сборка блока»: рамка с постами (как на бумажных схемах — 1-6 в общей рамке)
  function blockHtml(el) {
    const items = (el.params && el.params.items) || [];
    const autoIdx = G().blockEntryIndex ? G().blockEntryIndex(el) : 0;
    const entrySet = el.entryPost != null;
    return `<div class="ep-plan-srow"><b>${T.blockTitle}</b><span class="ep-plan-flex"></span><span>${T.blockPosts(items.length, CFG.blockMax)}</span></div>
      <div class="ep-plan-blockframe">${items.map((k, i) =>
        `<button type="button" class="ep-plan-post ep-clickable" data-pe-bdel="${i}" aria-label="Убрать пост ${esc((TYPES[k] || {}).name || k)}">${esc((TYPES[k] || {}).glyph || "?")}</button>`).join("")}
      </div>
      <div class="ep-plan-srow">${T.blockAdd}
        ${BLOCK_TYPES.map((k) => `<button type="button" class="ep-plan-chip ep-clickable" data-pe-badd="${k}">+${esc(TYPES[k].glyph)}</button>`).join("")}
      </div>
      <div class="ep-plan-srow">Штроба к посту:
        ${items.map((k, i) => `<button type="button" class="ep-plan-chip ep-clickable ${(entrySet ? el.entryPost === i : autoIdx === i) ? "on" : ""}" data-pe-entry="${i}">${i + 1}</button>`).join("")}
        <button type="button" class="ep-plan-chip ep-clickable ${entrySet ? "" : "on"}" data-pe-entry="auto">Авто</button>
      </div>
      <div class="ep-plan-srow">Ориентация:
        <button type="button" class="ep-plan-chip ep-clickable" data-pe-brot="1">⟳ ${el.blockVert ? "Вертикальный" : "Горизонтальный"} · развернуть 90°</button>
      </div>
      <div class="ep-plan-modehint">${T.blockTapDel} · штроба входит в выбранный подрозетник.</div>`;
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
    S.selId = null; rooms().closeSheet(); rooms().renderScene(); // ✓ — применить и закрыть
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
    if ((b = t.closest("[data-pe-otype]"))) { S.openType = b.getAttribute("data-pe-otype"); sheetOpenings(); return; }
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
    if ((b = t.closest("[data-pe-entry]"))) {
      const c = core(), el = current(); if (!el || el.type !== "block") return;
      const v = b.getAttribute("data-pe-entry");
      c.commit(); el.entryPost = v === "auto" ? null : Number(v); c.persist("block-entry"); openEditor(el); return;
    }
    if ((b = t.closest("[data-pe-brot]"))) {
      const c = core(), el = current(); if (!el || el.type !== "block") return;
      c.commit(); el.blockVert = !el.blockVert; c.persist("block-rot"); openEditor(el);
      if (rooms().renderScene) rooms().renderScene();
      return;
    }
    if ((b = t.closest("[data-pe-outlayer]"))) {
      const c = core(), el = current(); if (!el) return;
      c.commit(); el.layer = b.getAttribute("data-pe-outlayer"); c.persist("elem-outlayer"); openEditor(el); return;
    }
    if ((b = t.closest("[data-pe-target]"))) {
      const c = core(), el = current(); if (!el || el.type !== "switch") return;
      const [kiStr, val] = b.getAttribute("data-pe-target").split(":");
      const ki = Number(kiStr) || 0;
      c.commit();
      el.targetIds = el.targetIds || [];
      el.targetIds[ki] = val === "auto" ? null : val;
      if (ki === 0) el.targetId = el.targetIds[0]; // старое поле — для обратной совместимости чтения
      c.persist("elem-target"); openEditor(el); rooms().renderScene(); return;
    }
    if ((b = t.closest("[data-pe-swkind]"))) {
      const c = core(), el = current(); if (!el || el.type !== "switch") return;
      c.commit();
      el.swKind = b.getAttribute("data-pe-swkind");
      if (el.swKind !== "normal") el.keys = 1; // проходной/перекрёстный — одна цепь на клавиатуру
      c.persist("elem-swkind"); openEditor(el); rooms().renderScene(); return;
    }
    if ((b = t.closest("[data-pe-swkeys]"))) {
      const c = core(), el = current(); if (!el || el.type !== "switch") return;
      c.commit(); el.keys = Number(b.getAttribute("data-pe-swkeys")) || 1; c.persist("elem-swkeys"); openEditor(el); return;
    }
    if ((b = t.closest("[data-pe-chain]"))) {
      const c = core(), el = current(); if (!el || el.type !== "switch") return;
      c.commit(); el.chainNext = b.getAttribute("data-pe-chain") || null; c.persist("elem-chain"); openEditor(el); rooms().renderScene(); return;
    }
    if ((b = t.closest("[data-pe-circ]"))) {
      const c = core(), el = current(); if (!el) return;
      const id = b.getAttribute("data-pe-circ");
      c.commit(); el.circuitId = el.circuitId === id ? null : id; c.persist("elem-circuit"); openEditor(el); return;
    }
    if (t.closest("[data-pe-circ-new]")) {
      const c = core(), el = current(); if (!el) return;
      c.commit(); assignNewCircuit(el); c.persist("circuit-add"); openEditor(el); return;
    }
    if (t.closest("[data-pe-apply]")) return applyEditor();
    if (t.closest("[data-pe-del]")) { deleteElement(current()); return; }
    if (t.closest("[data-pe-photo]")) { const f = $("#ep-pe-file"); if (f) { f.onchange = () => { if (f.files && f.files[0]) addPhoto(f.files[0]); }; f.click(); } return; }
    if ((b = t.closest("[data-pe-phdel]"))) {
      const c = core(), el = current(); if (!el) return;
      c.commit(); el.photos.splice(Number(b.getAttribute("data-pe-phdel")), 1); c.persist("elem-photo-del"); openEditor(el); return;
    }
    if ((b = t.closest("[data-po-kind]"))) {
      const c = core(), op = currentOpening(); if (!op) return;
      const kind = b.getAttribute("data-po-kind");
      const d = EP.Plan.Core.OPENING_KINDS[kind]; if (!d) return;
      c.commit();
      op.kind = kind; op.type = d.win ? "window" : "door";
      if (op.height == null) op.height = d.h;
      op.sill = d.win ? (op.sill || d.sill) : 0;
      c.persist("opening-kind"); openOpeningEditor(op); return;
    }
    if (t.closest("[data-po-apply]")) {
      const c = core(), op = currentOpening(); if (!op) return;
      const wall = G().wallById(c.project, op.wallId);
      c.commit();
      const off = Number(($("#ep-po-off") || {}).value), wd = Number(($("#ep-po-w") || {}).value);
      const hd = Number(($("#ep-po-h") || {}).value), sill = Number(($("#ep-po-sill") || {}).value);
      if (Number.isFinite(wd) && wd >= 40) op.width = wd;
      if (Number.isFinite(hd) && hd >= 40) op.height = hd;
      if (Number.isFinite(sill) && sill >= 0) op.sill = sill;
      if (Number.isFinite(off) && wall) op.offset = Math.max(0, Math.min(wall.len - op.width, off));
      c.persist("opening-edit");
      S.selId = null; rooms().closeSheet(); rooms().renderScene(); return; // ✓ применить и закрыть
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
      c.commit();
      pn.name = (($("#ep-pe-pname") || {}).value || "Щит").trim() || "Щит";
      const trafo = $(`[data-pe-ptrafo="${pn.id}"]`);
      pn.transformer = !!(trafo && trafo.checked);
      c.persist("panel-edit");
      S.selId = null; rooms().closeSheet(); rooms().renderScene(); return; // ✓ применить и закрыть
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

  // копия точки со сдвигом на 30см (вдоль стены — по offset, свободная — по x/y);
  // для быстрого меню по долгому нажатию (см. plan-rooms.js onCanvasLongPress)
  function duplicateElement(el) {
    if (!el) return null;
    const c = core(), p = c.project;
    c.commit();
    const copy = JSON.parse(JSON.stringify(el));
    copy.id = EP.Plan.Core.uid("el");
    copy.status = "planned";
    if (copy.wallId) {
      const w = G().wallById(p, copy.wallId);
      copy.offset = Math.min(w ? Math.max(0, w.len - 1) : copy.offset, copy.offset + 30);
    } else if (copy.params && copy.params.x != null) {
      copy.params = Object.assign({}, copy.params, { x: copy.params.x + 30, y: copy.params.y + 30 });
    }
    p.elements.push(copy);
    c.persist("elem-dup");
    rooms().renderScene();
    return copy;
  }

  // с подтверждением — вызывается и кнопкой ✕ в редакторе, и ластиком стилуса
  // (S Pen/Apple Pencil, pointerType "eraser") прямо по точке на плане
  function deleteElement(el) {
    if (!el) return;
    if (!confirm(T.confirmDel)) return;
    const c = core();
    c.commit();
    c.project.elements = c.project.elements.filter((x) => x.id !== el.id);
    c.project.routes = c.project.routes.filter((r) => r.fromId !== el.id);
    c.persist("elem-del");
    if (S.selId === el.id) S.selId = null;
    rooms().closeSheet(); rooms().renderScene();
  }

  EP.Plan = EP.Plan || {};
  EP.Plan.Elements = { TYPES, OPEN_TYPES, CFG, onModeEnter, onOpeningModeEnter, placeAt, placeOpening, openingNum, hitAt, openEditor, openPanelEditor, openOpeningEditor, selectedId, deselect, deleteElement, duplicateElement, circuitRow, assignNewCircuit };
})();
