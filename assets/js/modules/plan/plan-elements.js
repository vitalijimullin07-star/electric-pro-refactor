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
    // камера: КАЖДАЯ своей линией в слаботочный щит (ownLine — placeAt сразу создаёт ей
    // отдельную линию CCTVn), плюс уточнение питания/данных (feedChoice: PoE по витой паре
    // ИЛИ отдельный КГ ВВГнг 3×1.5 + витая пара/оптика) — просьба пользователя
    camera:    { name: "Камера",      glyph: "ВК", layer: "cctv",  h: 230, feedChoice: true, ownLine: true },
    sensor:    { name: "Датчик",      glyph: "Д",  layer: "lv",    h: 220 },
    // датчик протечки — у ПОЛА; его трасса идёт к контроллеру «Нептун» (щит с флагом
    // neptun), а не к обычному слаботочному щиту — см. kindOf в plan-routes.js
    leak:      { name: "Датчик протечки", glyph: "ПР", layer: "lv", h: 5 },
    intercom:  { name: "Домофон",     glyph: "ДФ", layer: "lv",    h: 150, feedChoice: true },
    // датчики движения/освещённости назначаются НА лампу или подсветку — targets:true
    // включает ТУ ЖЕ строку выбора цели, что у выключателя (switchTargetRow)
    pir:       { name: "Датчик движения", glyph: "ДД", layer: "lv", h: null, free: true, targets: true },
    lux:       { name: "Датчик освещ.",   glyph: "ДО", layer: "lv", h: null, free: true, targets: true },
    output:    { name: "Вывод",       glyph: "Вых", layer: "power", h: null, free: true, layerChoice: true },
    output24:  { name: "Вывод 24В",   glyph: "24В", layer: "lv",    h: null, free: true },
    // трёхфазный вывод: «пятижилка» (под клеммы прибора) ИЛИ силовая розетка 3ф —
    // выбор в редакторе точки (el.threeKind). Линия под него автоматически 3-полюсная,
    // поэтому автоподбор кабеля (plan-scheme.js autoCable) сразу даёт 5-жильный.
    output3:   { name: "Вывод 3ф",    glyph: "3ф",  layer: "power", h: null, free: true },
    // стояк между этажами (Этажи, Этап 2): свободная точка у потолка, парная с таким же
    // стояком на другом этаже (el.riserLink). Этаж без своего щита питается через него —
    // см. riserRole/riserNodes в plan-routes.js.
    riser:     { name: "Стояк",       glyph: "СТ", layer: "power", h: null, free: true, riser: true },
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
  // тактильный отклик на примыкание к стене при установке точки/проёма — тот же
  // паттерн/интенсивность, что уже даёт снап угла при рисовании комнаты (plan-rooms.js)
  const vibrate = (pattern) => { try { navigator.vibrate && navigator.vibrate(pattern); } catch (e) {} };
  const BLOCK_TYPES = ["socket", "switch", "tv", "internet"]; // что можно ставить в рамку
  // электропалитра — без дверей/окон (они в отдельном инструменте «Проёмы»)
  const PALETTE_TYPES = Object.keys(TYPES).filter((k) => !TYPES[k].opening);
  const T = {
    palette: "Палитра", progress: "Смонтировано",
    paletteHint: "Выбери тип — палитра свернётся вниз, и можно ставить точки тапом по плану. Вернуть палитру — кнопка ︿ в правом нижнем углу.",
    offset: "Отступ от угла, см", height: "Высота от пола, см",
    status: "Статус", del: "✕ Удалить", apply: "✓", photo: "📷 Фото",
    confirmDel: "Удалить точку?", tapWall: "Тапни ближе к стене — элемент сядет на неё.",
    poolTitle: "📦 Из пула", poolLeft: (n2) => `осталось расставить: ${n2}`,
    poolHint: "Заготовки из «Пула розеток»: тапни заготовку, потом тапай по стенам — каждая точка садится со своей высотой и составом, счётчик убывает.",
    poolClear: "✕", poolClearAria: "Убрать очередь заготовок из пула", poolClearAsk: "Убрать очередь заготовок из пула? Уже расставленные точки останутся.",
    poolDone: "Все заготовки из пула расставлены ✓",
    poolGone: "Заготовка уже расставлена или очередь обновилась — выбери заново.",
    presets: "Пресеты:",
    blockTitle: "Сборка блока", blockPosts: (n, m) => `${n}/${m} постов`,
    blockAdd: "Добавить пост:", blockTapDel: "Тап по посту в рамке — убрать",
    outLayer: "Тип вывода:", outPower: "Силовой", outLv: "Слаботочный",
    swTarget: "Свет от выключателя:", swAuto: "Авто (по линии)", swNone: "не задан",
    swPick: "🎯 На плане",
    swMulti: "Целей на клавишу можно назначить НЕСКОЛЬКО — тап по чипу добавляет/убирает (например 2 трансформатора или три вывода 24В с одной клавиши). «Авто» снимает все ручные.",
    swKindLbl: "Тип:", swNormal: "Обычный", swPass: "Проходной", swCross: "Перекрёстный",
    swKeysLbl: "Клавиш:", swChain: "Цепочка — следующий:", swChainLast: "Это последнее звено → к лампе",
    swChainNone: "нет других выключателей в комнате для связи",
    beamSide: "Сторона перегородки:", beamSideFlip: "⇅ На другую сторону"
  };
  const OUT_LAYERS = [["power", "outPower"], ["lv", "outLv"]];
  const SW_KINDS = [["normal", "swNormal"], ["pass", "swPass"], ["cross", "swCross"]];
  const SW_KIND_GLYPH = { normal: "В", pass: "ПВ", cross: "ПкВ" };

  const esc = (s) => String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const $ = (sel, r) => (r || document).querySelector(sel);
  const core = () => EP.Plan.Core;
  const G = () => EP.Plan.Geometry;
  const rooms = () => EP.Plan.Rooms;

  const S = { selType: "socket", selId: null, openType: "door", pool: null };
  // ---- ОЧЕРЕДЬ ЗАГОТОВОК ИЗ ПУЛА (Пул розеток → «Проект квартиры») ----
  // Просьба пользователя: «когда пулы собираю, оттуда улетало в проект квартиры, чтобы их
  // расставить на плане». Пул геометрии не знает, поэтому передаёт СПИСОК заготовок
  // (что поставить, с какой высотой, сколько раз) — ключ localStorage общий с pool-v29.js
  // (POOL_Q_KEY там же). Тап по заготовке в палитре «вооружает» её, каждый тап по плану
  // ставит одну и уменьшает счётчик; на нуле заготовка уходит из списка.
  const POOL_Q_KEY = "ep_pool_to_plan_v1";
  function poolQueue() {
    try {
      const q = JSON.parse(localStorage.getItem(POOL_Q_KEY) || "null");
      return (q && Array.isArray(q.items)) ? q : { v: 1, items: [] };
    } catch (e) { return { v: 1, items: [] }; }
  }
  function poolQueueSave(q) {
    try {
      if (!q || !q.items || !q.items.length) localStorage.removeItem(POOL_Q_KEY);
      else localStorage.setItem(POOL_Q_KEY, JSON.stringify(q));
    } catch (e) {}
  }

  // ---------- палитра / размещение ----------
  function onModeEnter() { sheetPalette(); }
  // keep=true — это ПЕРЕрисовка (счётчик «Смонтировано» после установки точки / выбор
  // типа): если пользователь свернул палитру кнопкой в правом нижнем углу, она
  // остаётся свёрнутой и не выпрыгивает обратно поверх холста (см. openSheet в
  // plan-rooms.js). Вход в режим 🔌 (onModeEnter) — наоборот, всегда развёрнута.
  function sheetPalette(keep) {
    const p = core().project;
    const total = p.elements.filter((e) => e.status !== "existing").length;
    const done = p.elements.filter((e) => e.status === "mounted").length;
    const pct = total ? Math.round((done / total) * 100) : 0;
    rooms().openSheet(`<div class="ep-plan-srow"><b>${T.palette}</b><span class="ep-plan-flex"></span>
        <span>${T.progress}: <b>${done}/${total}</b> · ${pct}%</span></div>
      <div class="ep-plan-modehint">${esc(T.paletteHint)}</div>
      ${poolSectionHtml()}
      <div class="ep-plan-palette">${PALETTE_TYPES.map((k) => `
        <button type="button" class="ep-plan-pbtn ep-clickable ${!S.pool && S.selType === k ? "on" : ""}" data-pe-type="${k}">
          <i class="ep-plan-glyph" data-glyph="${esc(TYPES[k].glyph)}">${esc(TYPES[k].glyph)}</i>${esc(TYPES[k].name)}</button>`).join("")}
      </div>`, { keepCollapsed: !!keep });
  }
  // раздел «Из пула» в палитре: заготовки, пришедшие из «Пула розеток» (кнопка 📐 там)
  function poolSectionHtml() {
    const q = poolQueue();
    if (!q.items.length) return "";
    const total = q.items.reduce((n2, e) => n2 + (Number(e.qty) || 0), 0);
    return `<div class="ep-plan-srow"><b>${T.poolTitle}</b><span>· ${T.poolLeft(total)}</span>
        <span class="ep-plan-flex"></span><button type="button" class="ep-plan-mini ep-plan-danger ep-clickable" data-pe-poolclear aria-label="${T.poolClearAria}">${T.poolClear}</button></div>
      <div class="ep-plan-srow ep-plan-hintrow">${T.poolHint}</div>
      <div class="ep-plan-palette">${q.items.map((e, i) => `
        <button type="button" class="ep-plan-pbtn ep-clickable ${S.pool && S.pool.i === i ? "on" : ""}" data-pe-pool="${i}">
          <i class="ep-plan-glyph">${esc((TYPES[e.type] || {}).glyph || "?")}</i>${esc(e.label || (TYPES[e.type] || {}).name || e.type)} <b>×${Number(e.qty) || 0}</b></button>`).join("")}
      </div>`;
  }
  // ----- Проёмы (отдельный инструмент) -----
  function onOpeningModeEnter() { sheetOpenings(); }
  function sheetOpenings(keep) {
    const p = core().project;
    const cnt = (p.openings || []).length;
    rooms().openSheet(`<div class="ep-plan-srow"><b>🚪 Проёмы</b><span class="ep-plan-flex"></span><span>Всего: <b>${cnt}</b></span></div>
      <div class="ep-plan-palette">${Object.keys(OPEN_TYPES).map((k) => `
        <button type="button" class="ep-plan-pbtn ep-clickable ${S.openType === k ? "on" : ""}" data-pe-otype="${k}">
          <i class="ep-plan-glyph">${esc(OPEN_TYPES[k].glyph)}</i>${esc(OPEN_TYPES[k].name)}</button>`).join("")}
      </div>
      <div class="ep-plan-modehint">Тапни по стене — проём сядет на неё. Номер задаётся автоматически, размеры — в редакторе. Вернуть палитру после сворачивания — кнопка ︿ в правом нижнем углу.</div>`, { keepCollapsed: !!keep });
  }
  // Номер проёма внутри своего вида (О1..О7, Дв1..): для отображения на плане
  function openingNum(p, op) {
    const same = (p.openings || []).filter((o) => (o.kind || o.type) === (op.kind || op.type));
    const i = same.findIndex((o) => o.id === op.id);
    const pfx = (EP.Plan.Core.OPENING_KINDS[op.kind] || {}).pfx || "П";
    return pfx + (i + 1);
  }
  // Живой предпросмотр снапа к стене ДО тапа (наведение мышью/S-Pen — hover-события
  // приходят только у устройств, где указатель может «зависать» до касания; у пальца
  // их физически нет, поэтому это ЕСТЕСТВЕННО работает только на мыши/стилусе, без
  // отдельного детекта устройства). Зовётся из plan-rooms.js (onCanvasHover) для
  // режимов "elem"/"opening" — та же математика, что реально сработает на тапе в
  // placeAt/placeOpening ниже (WYSIWYG: превью совпадает с тем, что реально ляжет).
  // kind — "elem" (S.selType) или "opening" (S.openType); для "opening" без стены
  // рядом превью не показываем — реальный тап там ничего не поставит (только toast).
  function hoverSnapPoint(w, kind) {
    const p = core().project; if (!p) return null;
    const k = rooms().canvasCmPerPx();
    const hit = G().wallAt(p, w, CFG.wallSnapPx * k);
    if (hit) return { x: hit.hit.x, y: hit.hit.y, snapped: true };
    if (kind !== "elem") return null;
    const t = TYPES[S.selType];
    if (t && (t.free || t.panel)) { const sp = G().snapPoint(w, p.settings.gridStep); return { x: sp.x, y: sp.y, snapped: false }; }
    return null; // настенный тип без стены рядом — тап ничего не поставит
  }
  // Балка/перегородка (wall.isBeam) РАВНОПРАВНА с обеих сторон — G.wallFrame() БЕЗ
  // подсказки даёт ФИКСИРОВАННУЮ (произвольную, по направлению beam.a→b) нормаль,
  // ОДНУ И ТУ ЖЕ для любого тапа. Раньше это значило, что ЛЮБОЙ элемент, поставленный
  // на балку, рисовался на ОДНОЙ и той же стороне независимо от места тапа — данные
  // создавались корректно, но маркер всегда съезжал на прежнюю (первую) сторону,
  // визуально накладываясь на уже стоящую там точку — баг «нарисовал балку, а с
  // другой стороны не могу ничего поставить». Запоминаем РЕАЛЬНУЮ сторону тапа в
  // el.beamSide (читает G.elemDrawPoint/blockEntryPoint через wallFrame(...,sideHint)) —
  // знак не зависит от выбора опорной точки на прямой стены (mx/my — центр отрезка),
  // т.к. dir⊥nrm, поэтому используем готовые wall.mx/my, не hit.hit.
  function beamSideOf(w, wall) {
    const fr0 = G().wallFrame(core().project, wall);
    return ((w.x - wall.mx) * fr0.nrm.x + (w.y - wall.my) * fr0.nrm.y) >= 0 ? 1 : -1;
  }
  // в какую сторону «внутрь комнаты» смотрит проём на ЭТОЙ стене (створка двери, откосы):
  // ту же математику раньше делал только placeOpening при создании — вынесено, потому что
  // при ТЯГЕ проёма на ДРУГУЮ стену (enableOpeningDrag в plan-rooms.js) сторону надо
  // пересчитать заново, иначе дверь открывалась бы наружу. null — стена не от комнаты
  // (перегородка p.beams), там flip оставляем как был.
  function openingFlipFor(p, wall) {
    const room = (p.rooms || []).find((r) => r.id === String(wall.id).split(":")[0]);
    if (!room) return null;
    const cpt = G().centroid(room.points);
    const nx = -(wall.b.y - wall.a.y), ny = wall.b.x - wall.a.x;
    return (nx * (cpt.x - wall.mx) + ny * (cpt.y - wall.my)) >= 0 ? 1 : -1;
  }
  function placeOpening(w) {
    const c = core(), p = c.project;
    const k = rooms().canvasCmPerPx();
    const hit = G().wallAt(p, w, CFG.wallSnapPx * k);
    if (!hit) { rooms().toast(T.tapWall); return; }
    vibrate(10);
    c.commit();
    const d = EP.Plan.Core.OPENING_KINDS[S.openType] || {};
    const op = c.model.newOpening(S.openType, hit.wall.id, G().snap(Math.max(0, hit.offset - (d.w || 90) / 2), p.settings.gridStep), undefined);
    const fl = openingFlipFor(p, hit.wall);
    if (fl) op.flip = fl;
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
    const c = core(), p = c.project;
    if (S.pool) return placeFromPool(w);
    const t = TYPES[S.selType];
    const k = rooms().canvasCmPerPx();
    if (t.panel) {
      c.commit();
      p.panels.push(c.model.newPanel(G().snapPoint(w, p.settings.gridStep).x, G().snapPoint(w, p.settings.gridStep).y));
      c.persist("panel-add");
      return;
    }
    const hit = G().wallAt(p, w, CFG.wallSnapPx * k);
    if (hit) vibrate(10); // примыкание к стене — тот же лёгкий отклик, что и снап угла при рисовании
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
      if (hit.wall.isBeam) el.beamSide = beamSideOf(w, hit.wall); // см. beamSideOf выше
      p.elements.push(el);
      // КАЖДАЯ камера — СВОЕЙ линией в слаботочный щит (просьба пользователя: «видео камеры
      // должны все отдельными линиями идти в слаботочный щит»): линия создаётся сразу при
      // постановке, поэтому камеры физически не могут склеиться в один шлейф —
      // routeGroups группирует по circuitId, и у каждой он свой (CCTV1, CCTV2…)
      if (t.ownLine && !el.circuitId) assignNewCircuit(el);
      c.persist("elem-add");
      if (t.block) { openEditor(el); return; } // сразу открываем сборку блока
      sheetPalette(true); // счётчик «Смонтировано: N/M» в шапке палитры — иначе M устаревает с каждой новой точкой (свёрнутость сохраняем)
      return;
    } else if (t.free) {
      const sp = G().snapPoint(w, p.settings.gridStep);
      const el = c.model.newElement(S.selType, null, 0, defaultHeight(S.selType), t.layer);
      el.params = { x: sp.x, y: sp.y };
      p.elements.push(el);
      if (t.ownLine && !el.circuitId) assignNewCircuit(el); // см. комментарий выше (камеры)
    } else { rooms().toast(T.tapWall); return; }
    c.persist("elem-add");
    sheetPalette(true); // тот же счётчик — ветка свободной точки (свет/ТП/вывод)
  }

  // Ставит ОДНУ заготовку из очереди пула: тип/высота/клавишность приходят из пула, место —
  // из тапа. Блок пула (несколько постов) становится блоком плана с теми же постами, поэтому
  // «Сборку блока» вручную повторять не нужно. Счётчик заготовки убывает; на нуле она уходит
  // из очереди (и вооружение снимается).
  function placeFromPool(w) {
    const c = core(), p = c.project;
    const q = poolQueue();
    // ищем по id (устойчиво к сдвигу индексов), индекс — фолбэк для очередей без id
    let idx = S.pool.id ? q.items.findIndex((x) => x && x.id === S.pool.id) : -1;
    if (idx < 0) idx = S.pool.i;
    const e = q.items[idx];
    if (!e) { S.pool = null; sheetPalette(true); rooms().toast(T.poolGone); return; }
    S.pool.i = idx;
    const t = TYPES[e.type] || TYPES.socket;
    const k = rooms().canvasCmPerPx();
    const hit = G().wallAt(p, w, CFG.wallSnapPx * k);
    if (hit) vibrate(10);
    if (!hit && !t.free) { rooms().toast(T.tapWall); return; }
    c.commit();
    const h = e.height != null ? Math.max(0, Number(e.height) || 0) : defaultHeight(e.type);
    let el;
    if (hit) {
      el = c.model.newElement(e.type, hit.wall.id, G().snap(hit.offset, p.settings.gridStep), h, t.layer);
      if (hit.wall.isBeam) el.beamSide = beamSideOf(w, hit.wall);
    } else {
      const sp = G().snapPoint(w, p.settings.gridStep);
      el = c.model.newElement(e.type, null, 0, h, t.layer);
      el.params = { x: sp.x, y: sp.y };
    }
    if (e.type === "block") el.params = Object.assign({}, el.params, { items: (e.items || ["socket"]).slice() });
    if (e.type === "switch") { if (e.keys) el.keys = Math.max(1, Math.min(3, Number(e.keys) || 1)); if (e.swKind) el.swKind = e.swKind; }
    p.elements.push(el);
    if (t.ownLine && !el.circuitId) assignNewCircuit(el);
    c.persist("elem-add");
    e.qty = (Number(e.qty) || 1) - 1;
    if (e.qty <= 0) { q.items.splice(idx, 1); S.pool = null; }
    poolQueueSave(q);
    if (!q.items.length) rooms().toast(T.poolDone);
    sheetPalette(true);
  }

  // ---------- попадание / выбор ----------
  function hitAt(w, maxCm) {
    const p = G().floorScoped(core().project); // хит-тест — только по видимому (активному) этажу
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
    // балка/перегородка (wallId="beam:"+id) — НЕ "стена N" (el.wallId.split(":")[1]
    // там не число, а id самой балки — раньше давало "стена NaN"), и у неё есть
    // сторона (см. beamSideOf/el.beamSide выше) — ручной переключатель на случай,
    // если авто-детект по месту тапа ошибся (тап почти точно на оси перегородки).
    const isBeamEl = el.wallId && String(el.wallId).slice(0, 5) === "beam:";
    const wallLen = el.wallId ? Math.round((G().wallById(p, el.wallId) || { len: 0 }).len) : 0;
    rooms().openSheet(`<div class="ep-plan-srow"><b>${esc(t.name)}</b>
        ${el.wallId ? `<span>· ${isBeamEl ? "перегородка" : "стена " + esc(el.wallId.split(":")[1] * 1 + 1)} (${wallLen} см)</span>` : "· свободно"}</div>
      <div class="ep-plan-srow ep-plan-s2">
        ${el.wallId ? `<label>${T.offset}<input id="ep-pe-off" type="number" inputmode="numeric" min="0" max="${wallLen}" value="${Math.round(el.offset)}"></label>` : ""}
        <label>${T.height}<input id="ep-pe-h" type="number" inputmode="numeric" min="0" value="${Math.round(el.height)}"></label>
      </div>
      ${isBeamEl ? `<div class="ep-plan-srow">${T.beamSide}
        <button type="button" class="ep-plan-chip ep-clickable" data-pe-beamside="1">${T.beamSideFlip}</button>
      </div>` : ""}
      <div class="ep-plan-srow">${T.presets}
        ${[hp.socket, hp.switch, hp.kitchen].map((v) => `<button type="button" class="ep-plan-chip ep-clickable" data-pe-preset="${v}">${v}</button>`).join("")}
      </div>
      ${circuitRow(el)}
      ${t.layerChoice ? outLayerRow(el) : ""}
      ${el.type === "output3" ? threeKindRow(el) : ""}
      ${el.type === "switch" ? switchKindRow(el) + switchKeysRow(el) + switchChainRow(el) + (el.chainNext ? "" : switchTargetRow(el)) : ""}
      ${t.targets ? switchTargetRow(el) : ""}
      ${t.feedChoice ? feedRow(el) : ""}
      ${el.type === "riser" ? riserRow(el) : ""}
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
  function openOpeningEditor(op, opts) {
    S.selId = op.id;
    const p = core().project, wall = G().wallById(p, op.wallId);
    const kind = op.kind || (op.type === "window" ? "window" : "door");
    const meta = OPEN_TYPES[kind] || OPEN_TYPES.door;
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
        <label>Низ от пола, см<input id="ep-po-sill" type="number" inputmode="numeric" min="0" value="${Math.round(op.sill || 0)}"></label>
      </div>
      ${swingKind ? `<div class="ep-plan-srow">
        <button type="button" class="ep-plan-chip ep-clickable" data-po-hinge>Петли: ${op.hinge === "a" ? "слева" : "справа"}</button>
        <button type="button" class="ep-plan-chip ep-clickable" data-po-flip>Открывание: ${op.flip > 0 ? "внутрь" : "наружу"}</button>
      </div>` : ""}
      <div class="ep-plan-srow">Розетки в откосе:
        <button type="button" class="ep-plan-chip ep-clickable" data-po-reveal="a">＋ слева</button>
        <button type="button" class="ep-plan-chip ep-clickable" data-po-reveal="b">＋ справа</button>
      </div>
      ${revealListHtml(p, op)}
      <div class="ep-plan-modehint">Проём можно тянуть пальцем прямо по плану — он едет вдоль стены, а если довести до другой стены, перевесится на неё (створка развернётся сама). По высоте («Низ от пола») проём тянется в развёртке стены. Розетка в откосе стоит на кромке проёма (слева/справа), тапни её на плане для редактирования. Номера проёмов вкл/выкл — слой «Подписи» (🗂).</div>
      <div class="ep-plan-srow ep-plan-sbtns">
        <button type="button" class="ep-plan-tbtn ep-clickable" data-po-apply>${T.apply}</button>
        <button type="button" class="ep-plan-tbtn ep-plan-danger ep-clickable" data-po-del>${T.del}</button>
      </div>`);
    rooms().renderScene();
    // после ТЯГИ проёма вид не дёргаем (пользователь только что сам выбрал, куда смотреть) —
    // подтягиваем проём из-под шторки только при обычном открытии по тапу (тот же
    // keepView-паттерн, что у sheetMoveRoom в plan-rooms.js)
    if (!(opts && opts.keepView) && wall && rooms().ensureVisibleAboveSheet) {
      rooms().ensureVisibleAboveSheet(G().pointAtOffset(wall, op.offset + op.width / 2));
    }
    if (rooms().enableOpeningDrag) rooms().enableOpeningDrag(op.id); // тяга по плану
  }
  // розетки, привязанные к откосу этого проёма (el.reveal.openingId === op.id)
  function revealSockets(p, op) { return (p.elements || []).filter((e) => e.reveal && e.reveal.openingId === op.id); }
  function revealListHtml(p, op) {
    const rs = revealSockets(p, op);
    if (!rs.length) return "";
    return `<div class="ep-plan-srow ep-plan-sbtns">${rs.map((e) =>
      `<button type="button" class="ep-plan-chip ep-clickable" data-po-revedit="${esc(e.id)}">${e.reveal.side === "b" ? "справа" : "слева"} · h=${Math.round(e.height)}</button>` +
      `<button type="button" class="ep-plan-chip ep-plan-danger ep-clickable" data-po-revdel="${esc(e.id)}">✕</button>`).join("")}</div>`;
  }
  function currentOpening() { return (core().project.openings || []).find((o) => o.id === S.selId) || null; }

  function openPanelEditor(pn) {
    S.selId = pn.id;
    rooms().openSheet(`<div class="ep-plan-srow"><b>${esc(pn.name || "Щит")}</b></div>
      <div class="ep-plan-srow"><input id="ep-pe-pname" type="text" value="${esc(pn.name || "Щит")}" maxlength="30"></div>
      <div class="ep-plan-srow"><label class="ep-plan-chk"><input type="checkbox" data-pe-ptrafo="${esc(pn.id)}" ${pn.transformer ? "checked" : ""}>Трансформатор в слаботочном щите (24В для ленты)</label></div>
      <div class="ep-plan-srow"><label class="ep-plan-chk"><input type="checkbox" data-pe-prouter="${esc(pn.id)}" ${pn.router ? "checked" : ""}>Роутер — сюда идут все линии интернет/ТВ/видеонаблюдение</label></div>
      <div class="ep-plan-srow"><label class="ep-plan-chk"><input type="checkbox" data-pe-pavr="${esc(pn.id)}" ${pn.avr ? "checked" : ""}>Система АВР (автоматический ввод резерва: второй ввод / генератор)</label></div>
      <div class="ep-plan-srow"><label class="ep-plan-chk"><input type="checkbox" data-pe-pneptun="${esc(pn.id)}" ${pn.neptun ? "checked" : ""}>Контроллер «Нептун» — сюда идут датчики протечки</label></div>
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
  // Префикс имени линии по слою элемента — просьба пользователя: «ютп не должен
  // падать как qf1, а просто (Int 1) и цифра динамичная». Интернет/ТВ/видеонаблюдение —
  // слаботочка (LV_LAYERS-паттерн, см. plan-routes.js isLvLayer/plan-calc.js LV_LAYERS),
  // у каждого своя, НЕЗАВИСИМАЯ от "QF" последовательность номеров (Int 1, Int 2…,
  // отдельно TV 1, TV 2…) — силовые/свет/ТП и т.п. остаются "QF" как раньше.
  function circuitPrefixFor(el) {
    const layer = el && el.layer;
    // «Вывод 24В» — СВОЙ префикс «24В» (просьба пользователя: «линии 24в надо
    // маркировать»): у output24 слой lv, поэтому без этой ветки линия 24В называлась бы
    // «Int N» и в подписи над точкой/однолинейке/смете читалась как интернет-линия.
    // Нумерация у каждого префикса своя (см. assignNewCircuit) → «24В1», «24В2»…
    if (el && el.type === "output24") return "24В";
    if (layer === "lv") return "Int";
    if (layer === "tv") return "TV";
    if (layer === "cctv") return "CCTV";
    return "QF";
  }
  function assignNewCircuit(el) {
    const c = core();
    const colors = EP.Plan.Core.DEFAULTS.circuitColors;
    const cs = c.project.circuits;
    const used = new Set(cs.map((x) => x.color));
    const color = colors.find((col) => !used.has(col)) || colors[cs.length % colors.length];
    const prefix = circuitPrefixFor(el);
    // нумерация СВОЯ у каждого префикса — считаем максимум ТОЛЬКО среди линий,
    // чьё имя начинается именно с этого префикса (иначе "Int"/"TV" делили бы
    // одну последовательность номеров с "QF", как было бы при общем digit-strip)
    const re = new RegExp("^" + prefix + "\\s*(\\d+)$");
    const maxN = cs.reduce((m, x) => { const mm = re.exec(String(x.name)); const n = mm ? parseInt(mm[1], 10) : NaN; return Number.isFinite(n) ? Math.max(m, n) : m; }, 0);
    const circ = c.model.newCircuit(prefix + (maxN + 1), color, 16);
    // 3-фазный вывод (пятижилка/розетка 380) — линия сразу 3-полюсная: иначе автоподбор
    // кабеля дал бы 3 жилы, а по факту нужно 5 (см. autoCable в plan-scheme.js)
    if (el.type === "output3") { circ.poles = 3; circ.breaker = 25; }
    cs.push(circ); el.circuitId = circ.id;
    return circ;
  }
  // Назначение линии (автомата): чипы существующих линий + «новая». attr — префикс
  // data-атрибутов ("pe" в главном редакторе точки, "pu" в карточке точки развёртки —
  // РАЗНЫЕ обработчики: pe-* зовёт openEditor() и перерисовывает ВЕСЬ #ep-plan-sheet,
  // pu-* остаётся внутри развёртки и перерисовывает только карточку, см. plan-unfold.js).
  /* ---------- стояк: связка с парным стояком на другом этаже ----------
     Пара ВСЕГДА взаимная (a.riserLink===b.id и наоборот) — трассировка (riserPairs в
     plan-routes.js) односторонние ссылки игнорирует. Кнопка «＋ парный на …» создаёт
     стояк-двойник на выбранном этаже в ТЕХ ЖЕ координатах (стояк — вертикальный канал,
     он физически в одном месте на всех этажах) и связывает их сразу. */
  function riserMate(p, el) {
    if (!el || !el.riserLink) return null;
    const m = (p.elements || []).find((x) => x.id === el.riserLink);
    return (m && m.type === "riser" && m.riserLink === el.id) ? m : null;
  }
  function floorNameOf(p, fid) {
    const f = (p.floors || []).find((x) => x.id === fid);
    return f ? f.name : "этаж";
  }
  function riserRow(el) {
    const p = core().project;
    const mate = riserMate(p, el);
    const RT = EP.Plan.Routes;
    const role = (RT && RT.riserRole) ? RT.riserRole(p, el) : null;
    const roleTxt = role === "sink" ? "питает этот этаж" : role === "source" ? "уходит на другой этаж" : "";
    if (mate) {
      const run = (RT && RT.riserRun) ? Math.round(RT.riserRun(p, el)) : 0;
      return `<div class="ep-plan-srow">Связан: <b>${esc(floorNameOf(p, mate.floorId))}</b>
          ${roleTxt ? `<span>· ${roleTxt}</span>` : ""}${run ? `<span>· вертикаль ${run} см</span>` : ""}
          <button type="button" class="ep-plan-chip ep-clickable" data-pe-riser-unlink>✕ разорвать</button>
        </div>`;
    }
    const others = (p.floors || []).filter((f) => f.id !== el.floorId);
    const free = (p.elements || []).filter((x) => x.type === "riser" && x.id !== el.id && x.floorId !== el.floorId && !riserMate(p, x));
    return `<div class="ep-plan-srow">Стояк не связан — этаж по нему не питается.</div>
      ${others.length ? `<div class="ep-plan-srow">Создать парный:
        ${others.map((f) => `<button type="button" class="ep-plan-chip ep-clickable" data-pe-riser-make="${esc(f.id)}">＋ ${esc(f.name)}</button>`).join("")}
      </div>` : `<div class="ep-plan-srow">Добавь второй этаж («✎ Этажи»), чтобы связать стояк.</div>`}
      ${free.length ? `<div class="ep-plan-srow">Связать с существующим:
        ${free.map((x) => `<button type="button" class="ep-plan-chip ep-clickable" data-pe-riser-link="${esc(x.id)}">${esc(floorNameOf(p, x.floorId))}</button>`).join("")}
      </div>` : ""}`;
  }
  function circuitRow(el, attr) {
    const a = attr || "pe";
    const cs = core().project.circuits || [];
    return `<div class="ep-plan-srow">Линия:
      ${cs.map((c) => `<button type="button" class="ep-plan-chip ep-clickable ${el.circuitId === c.id ? "on" : ""}" data-${a}-circ="${esc(c.id)}" style="border-color:${esc(c.color)}"><i class="ep-plan-cdot" style="background:${esc(c.color)}"></i>${esc(c.name)}·${c.breaker}A</button>`).join("")}
      <button type="button" class="ep-plan-chip ep-clickable" data-${a}-circ-new>+ линия</button>
    </div>`;
  }

  // тип вывода (силовой/слаботочный) — для "Вывода" из стены/потолка/пола
  // Вывод 3ф: как физически заканчивается линия — «пятижилкой» под клеммы прибора
  // (варочная, котёл, каменка) или силовой РОЗЕТКОЙ 3ф. От этого зависит только
  // подпись/смета: трасса, штроба и кабель считаются одинаково (5 жил по линии).
  const THREE_KINDS = [["cable", "Пятижилка (под клеммы)"], ["socket", "Розетка 3ф"]];
  function threeKindRow(el) {
    const cur = el.threeKind === "socket" ? "socket" : "cable";
    return `<div class="ep-plan-srow">Окончание:
      ${THREE_KINDS.map(([k, nm]) => `<button type="button" class="ep-plan-chip ep-clickable ${cur === k ? "on" : ""}" data-pe-3kind="${k}">${esc(nm)}</button>`).join("")}
    </div>`;
  }

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
  // куда идёт свет от каждой клавиши: ручной выбор + авто по линии (пунктир на плане).
  // Типы-цели РАСШИРЕНЫ (просьба пользователя: «выбор кликнуть на проекте к какому
  // свету, бра, выводу 24, розетке, или просто выводу от клавиши идёт») — не только
  // свет/вывод: бра/трек/розетка/блок/вывод 24В тоже могут быть целью клавиши.
  // 🎯 «На плане» — назначение цели ТАПОМ по точке прямо на плане (armTargetPick в
  // plan-rooms.js): шторка закрывается, следующий тап по подходящей точке (ЛЮБОЙ
  // комнаты, не только своей) назначает её этой клавише и возвращает редактор.
  const SW_TARGET_TYPES = { light: 1, bra: 1, track: 1, output: 1, output24: 1, socket: 1, block: 1 };
  // Клавиша назначена точке → ЛИНИЯ ТОЧКИ проставляется АВТОМАТИЧЕСКИ (просьба
  // пользователя: «если клавиша назначена на точку, то зачем на точке указывать линию,
  // можно автоматизировать»):
  //  · 220В-цель (свет/бра/трек/вывод/розетка) питается ЧЕРЕЗ выключатель, т.е. физически
  //    сидит на ЛИНИИ ВЫКЛЮЧАТЕЛЯ — синхронизируем всегда, когда у выключателя линия есть
  //    (иначе кабель «от выключателя до точки» попал бы в другую линию сметы, чем питание
  //    самого выключателя). Своя линия у такой точки физически невозможна.
  //  · «Вывод 24В» — на СВОЕЙ 24В-линии (её коммутирует трансформатор в щите, а не сам
  //    выключатель): если линии нет — берём существующую 24В-линию проекта, иначе создаём
  //    новую (префикс «24В», см. circuitPrefixFor).
  function syncTargetCircuit(sw, target) {
    if (!sw || !target) return null;
    const p = core().project;
    if (target.type === "output24") {
      if (target.circuitId) return null;
      const only24 = (cid) => {
        const els = (p.elements || []).filter((e) => e.circuitId === cid && e.type !== "junction");
        return els.length > 0 && els.every((e) => e.type === "output24");
      };
      const ex = (p.circuits || []).find((c) => /^24В/.test(String(c.name)) || only24(c.id));
      if (ex) { target.circuitId = ex.id; return ex; }
      return assignNewCircuit(target);
    }
    if (!sw.circuitId || target.circuitId === sw.circuitId) return null;
    target.circuitId = sw.circuitId;
    return (p.circuits || []).find((c) => c.id === sw.circuitId) || null;
  }
  // Уточнение по слаботочке (просьба пользователя: «должно быть уточнение — питание по
  // ютп, или отдельно кг ввгнг 3×1.5, и ютп или оптика»): чем прибор ПИТАЕТСЯ и по чему
  // передаёт ДАННЫЕ. От этого напрямую зависит смета: PoE — один кабель (витая пара),
  // отдельное питание — ДВА кабеля (КГ ВВГнг 3×1.5 + витая пара или оптика) на ту же длину.
  const FEEDS = [["poe", "Питание по UTP (PoE)"], ["sep", "Питание отдельно 3×1.5"]];
  const DATAS = [["utp", "Данные: витая пара"], ["fiber", "Данные: оптика"]];
  function feedRow(el) {
    const f = el.feed === "sep" ? "sep" : "poe";
    const d = el.data === "fiber" ? "fiber" : "utp";
    return `<div class="ep-plan-srow">${FEEDS.map(([k, nm]) => `<button type="button" class="ep-plan-chip ep-clickable ${f === k ? "on" : ""}" data-pe-feed="${k}">${esc(nm)}</button>`).join("")}</div>
      <div class="ep-plan-srow">${DATAS.map(([k, nm]) => `<button type="button" class="ep-plan-chip ep-clickable ${d === k ? "on" : ""}" data-pe-data="${k}">${esc(nm)}</button>`).join("")}</div>`;
  }

  function switchTargetRow(el) {
    const p = core().project;
    const roomId = el.wallId ? String(el.wallId).split(":")[0] : null;
    const pool = roomId ? G().elementsInRoom(p, roomId) : p.elements;
    const opts = pool.filter((e) => e.id !== el.id && SW_TARGET_TYPES[e.type]);
    const keys = (el.swKind || "normal") !== "normal" ? 1 : Math.max(1, el.keys || 1);
    const rows = [];
    for (let ki = 0; ki < keys; ki++) {
      // целей у клавиши может быть НЕСКОЛЬКО (просьба пользователя: «на одну клавишу
      // задавать несколько 24 вольта… с одной клавиши включать 2 трансформатора, или одно
      // питание сразу на три») — чипы работают как МУЛЬТИВЫБОР: тап добавляет/убирает цель
      const manualIds = G().targetIdsOf ? G().targetIdsOf(el, ki) : [];
      const hasManual = manualIds.length > 0;
      const auto = G().switchTarget ? G().switchTarget(p, el, ki) : null; // с учётом текущих ручных
      const label = keys > 1 ? `${T.swTarget} клавиша ${ki + 1}:` : T.swTarget;
      // ручные цели из ДРУГИХ комнат не попадают в opts (пул комнаты) — показываем каждую
      // отдельным подсвеченным чипом, иначе назначение выглядело бы потерянным
      const foreign = manualIds.filter((id) => !opts.some((e) => e.id === id)).map((id) => {
        const fe = (p.elements || []).find((e) => e.id === id);
        return fe ? `<button type="button" class="ep-plan-chip ep-clickable on" data-pe-target="${ki}:${esc(id)}">${esc((TYPES[fe.type] || {}).glyph || "?")} ✓</button>` : "";
      }).join("");
      rows.push(`<div class="ep-plan-srow">${label}${manualIds.length > 1 ? ` <span class="ep-plan-dim">(${manualIds.length})</span>` : ""}
        <button type="button" class="ep-plan-chip ep-clickable ${!hasManual ? "on" : ""}" data-pe-target="${ki}:auto">${T.swAuto}${!hasManual && auto ? " → " + esc((TYPES[auto.type] || {}).glyph || "") : ""}</button>
        <button type="button" class="ep-plan-chip ep-clickable" data-pe-picktarget="${ki}">${T.swPick}</button>${foreign}
        ${opts.map((e) => `<button type="button" class="ep-plan-chip ep-clickable ${manualIds.indexOf(e.id) >= 0 ? "on" : ""}" data-pe-target="${ki}:${esc(e.id)}">${esc((TYPES[e.type] || {}).glyph || "?")} ${Math.round(e.params ? (e.params.x || 0) : e.offset)}</button>`).join("")}
      </div>`);
    }
    if (rows.length) rows.push(`<div class="ep-plan-srow ep-plan-hintrow">${T.swMulti}</div>`);
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

  // el.photos хранит короткие id (байты — в IndexedDB, см. plan-core.js) — src
  // достаём через photoUrl(id) из уже прогруженного при открытии проекта кэша
  // (синхронно, без ожидания). Фолбэк на сам id — на случай ОЧЕНЬ старого
  // проекта, ещё не прошедшего миграцию (openProject мигрирует всегда, но
  // защищаемся от неучтённого пути), где id может внезапно оказаться
  // "data:..."-строкой напрямую.
  function photosHtml(el) {
    const c = core();
    return (el.photos || []).map((id, i) => {
      const src = (typeof id === "string" && id.startsWith("data:")) ? id : ((c.photoUrl && c.photoUrl(id)) || "");
      return `<span class="ep-plan-ph"><img src="${src}" alt="фото точки"><button type="button" data-pe-phdel="${i}" aria-label="Удалить фото">✕</button></span>`;
    }).join("");
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
        // addPhoto кладёт байты в IndexedDB (фоново) и сразу в память — el.photos
        // хранит только id, поэтому commit()/persist() остаются лёгкими даже с фото
        el.photos.push(c.addPhoto ? c.addPhoto(cv.toDataURL("image/jpeg", 0.7)) : cv.toDataURL("image/jpeg", 0.7));
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
    // выбрал тип — палитра сворачивается вниз (просьба пользователя: «при выборе
    // хотел чтобы окно скрывалось… сворачивалось в нижнюю часть экрана»), холст
    // свободен для расстановки; вернуть — кнопка ︿ в правом нижнем углу
    if ((b = t.closest("[data-pe-type]"))) { S.pool = null; S.selType = b.getAttribute("data-pe-type"); sheetPalette(true); rooms().collapseSheet(); return; }
    if ((b = t.closest("[data-pe-pool]"))) { // заготовка из пула — вооружаем её вместо типа
      const i = Number(b.getAttribute("data-pe-pool")) || 0;
      // храним И индекс, И id: если пул успел перезалить очередь (кнопка «В проект квартиры»
      // ещё раз), индексы сдвинутся, и по индексу поставился бы ЧУЖОЙ тип — id это исключает
      S.pool = { i: i, id: (poolQueue().items[i] || {}).id || null };
      sheetPalette(true); rooms().collapseSheet(); return;
    }
    if (t.closest("[data-pe-poolclear]")) {
      if (!window.confirm(T.poolClearAsk)) return;
      poolQueueSave({ v: 1, items: [] }); S.pool = null; sheetPalette(true); return;
    }
    if ((b = t.closest("[data-pe-otype]"))) { S.openType = b.getAttribute("data-pe-otype"); sheetOpenings(true); rooms().collapseSheet(); return; } // как и палитра точек — свернуть вниз, холст свободен
    if ((b = t.closest("[data-pe-preset]"))) { const i = $("#ep-pe-h"); if (i) i.value = b.getAttribute("data-pe-preset"); return; }
    if ((b = t.closest("[data-pe-riser-make]"))) {
      const c = core(), el = current(); if (!el || el.type !== "riser") return;
      const fid = b.getAttribute("data-pe-riser-make");
      if (!(c.project.floors || []).some((f) => f.id === fid)) return;
      c.commit();
      const mate = c.model.newElement("riser", null, 0, defaultHeight("riser"), TYPES.riser.layer);
      mate.floorId = fid;                       // ЯВНО: newElement ставит активный этаж
      mate.params = { x: el.params.x, y: el.params.y }; // стояк — один и тот же канал
      mate.riserLink = el.id; el.riserLink = mate.id;
      c.project.elements.push(mate);
      c.persist("riser-pair"); openEditor(el); return;
    }
    if ((b = t.closest("[data-pe-riser-link]"))) {
      const c = core(), el = current(); if (!el || el.type !== "riser") return;
      const other = (c.project.elements || []).find((x) => x.id === b.getAttribute("data-pe-riser-link"));
      if (!other || other.type !== "riser" || other.floorId === el.floorId) return;
      c.commit(); el.riserLink = other.id; other.riserLink = el.id;
      c.persist("riser-pair"); openEditor(el); return;
    }
    if (t.closest("[data-pe-riser-unlink]")) {
      const c = core(), el = current(); if (!el || el.type !== "riser") return;
      const m = riserMate(c.project, el);
      c.commit(); el.riserLink = null; if (m) m.riserLink = null;
      c.persist("riser-pair"); openEditor(el); return;
    }
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
    if ((b = t.closest("[data-pe-beamside]"))) {
      const c = core(), el = current(); if (!el) return;
      c.commit(); el.beamSide = (el.beamSide || 1) * -1; c.persist("elem-beamside"); openEditor(el);
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
      // МУЛЬТИВЫБОР: чип цели тоглит её в списке клавиши, «Авто» — снимает все ручные.
      // В модель пишем СТРОКУ, если цель одна (прежний формат — старые проекты/экспорты
      // и все читатели через G.targetIdsOf видят одно и то же), массив — если несколько.
      const cur = G().targetIdsOf ? G().targetIdsOf(el, ki) : [];
      let next = [];
      if (val !== "auto") {
        const i = cur.indexOf(val);
        next = i >= 0 ? cur.filter((x) => x !== val) : cur.concat([val]);
      }
      el.targetIds[ki] = next.length > 1 ? next : (next[0] || null);
      if (ki === 0) el.targetId = next.length === 1 ? next[0] : null; // legacy-алиас: только когда цель одна
      if (val !== "auto" && next.indexOf(val) >= 0) syncTargetCircuit(el, (c.project.elements || []).find((e) => e.id === val));
      c.persist("elem-target"); openEditor(el); rooms().renderScene(); return;
    }
    if ((b = t.closest("[data-pe-picktarget]"))) {
      // назначение цели клавиши ТАПОМ по плану: вооружаем одноразовый режим выбора в
      // plan-rooms (armTargetPick), он сам закрывает шторку, ловит следующий тап и
      // возвращает редактор этой точки с уже назначенной целью
      const el = current(); if (!el || el.type !== "switch") return;
      const ki = Number(b.getAttribute("data-pe-picktarget")) || 0;
      if (rooms().armTargetPick) rooms().armTargetPick(el.id, ki);
      return;
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
    if ((b = t.closest("[data-po-reveal]"))) {
      // розетка в откосе проёма: обычная точка на стене проёма у его кромки (слева/
      // справа), с меткой el.reveal — маркер стоит на кромке (см. elemDrawPoint), а
      // трасса/расчёт видят её как обычную настенную розетку (wallId+offset+circuit).
      const c = core(), op = currentOpening(); if (!op) return;
      const wall = G().wallById(c.project, op.wallId); if (!wall) return;
      const side = b.getAttribute("data-po-reveal");
      const edge = side === "b" ? op.offset + op.width : op.offset;
      c.commit();
      const el = c.model.newElement("socket", op.wallId, Math.max(0, Math.min(wall.len, edge)), defaultHeight("socket"), "power");
      el.reveal = { openingId: op.id, side };
      c.project.elements.push(el);
      c.persist("reveal-add"); openOpeningEditor(op); return;
    }
    if ((b = t.closest("[data-po-revedit]"))) {
      const el = (core().project.elements || []).find((e) => e.id === b.getAttribute("data-po-revedit"));
      if (el) openEditor(el); return;
    }
    if ((b = t.closest("[data-po-revdel]"))) {
      const c = core(), op = currentOpening(), id = b.getAttribute("data-po-revdel");
      c.commit(); c.project.elements = (c.project.elements || []).filter((e) => e.id !== id); c.persist("reveal-del");
      if (op) openOpeningEditor(op); return;
    }
    if (t.closest("[data-po-del]")) {
      const c = core(), op = currentOpening(); if (!op) return;
      c.commit();
      c.project.openings = c.project.openings.filter((o) => o.id !== op.id);
      // откосные розетки этого проёма удаляем вместе с ним (иначе повиснут без якоря)
      c.project.elements = (c.project.elements || []).filter((e) => !(e.reveal && e.reveal.openingId === op.id));
      c.persist("opening-del");
      S.selId = null; rooms().closeSheet(); rooms().renderScene(); return;
    }
    if ((b = t.closest("[data-pe-feed]"))) {
      const el2 = current(); if (!el2) return;
      const c = core(); c.commit();
      el2.feed = b.getAttribute("data-pe-feed") === "sep" ? "sep" : "poe";
      c.persist("elem-feed"); openEditor(el2); return;
    }
    if ((b = t.closest("[data-pe-data]"))) {
      const el2 = current(); if (!el2) return;
      const c = core(); c.commit();
      el2.data = b.getAttribute("data-pe-data") === "fiber" ? "fiber" : "utp";
      c.persist("elem-data"); openEditor(el2); return;
    }
    if ((b = t.closest("[data-pe-3kind]"))) {
      const el2 = current(); if (!el2) return;
      const c = core(); c.commit();
      el2.threeKind = b.getAttribute("data-pe-3kind") === "socket" ? "socket" : "cable";
      c.persist("elem-3kind"); openEditor(el2); return;
    }
    if ((b = t.closest("[data-pe-papply]"))) {
      const c = core(), pn = c.project.panels.find((x) => x.id === b.getAttribute("data-pe-papply")); if (!pn) return;
      c.commit();
      pn.name = (($("#ep-pe-pname") || {}).value || "Щит").trim() || "Щит";
      const trafo = $(`[data-pe-ptrafo="${pn.id}"]`);
      const trafoWas = pn.transformer;
      pn.transformer = !!(trafo && trafo.checked);
      const routerChk = $(`[data-pe-prouter="${pn.id}"]`);
      const routerWas = pn.router;
      pn.router = !!(routerChk && routerChk.checked);
      const avrChk = $(`[data-pe-pavr="${pn.id}"]`);
      pn.avr = !!(avrChk && avrChk.checked); // АВР — на трассировку не влияет, только смета/подпись
      const nepChk = $(`[data-pe-pneptun="${pn.id}"]`);
      const nepWas = pn.neptun;
      pn.neptun = !!(nepChk && nepChk.checked); // цель датчиков протечки — влияет на трассы
      // panel-router/panel-trafo — отдельные метки от panel-edit: только смена флага
      // роутера/трансформатора должна тихо перестроить уже построенные трассы (LV-точки/
      // выводы 24В могли сменить целевой щит), обычное переименование щита такой
      // перестройки не требует (см. AUTOREBUILD_ON в plan-routes.js).
      c.persist(routerWas !== pn.router ? "panel-router" : trafoWas !== pn.transformer ? "panel-trafo" : nepWas !== pn.neptun ? "panel-neptun" : "panel-edit");
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
    // стояк удалён — снимаем ссылку у его пары (иначе на другом этаже остался бы
    // «висячий» стояк, который по односторонней ссылке ничего не питает)
    (c.project.elements || []).forEach((x) => { if (x.riserLink === el.id) x.riserLink = null; });
    c.persist("elem-del");
    if (S.selId === el.id) S.selId = null;
    rooms().closeSheet(); rooms().renderScene();
  }

  EP.Plan = EP.Plan || {};
  EP.Plan.Elements = { TYPES, OPEN_TYPES, CFG, SW_TARGET_TYPES, onModeEnter, onOpeningModeEnter, placeAt, placeOpening, hoverSnapPoint, openingNum, hitAt, openEditor, openPanelEditor, openOpeningEditor, openingFlipFor, selectedId, deselect, deleteElement, duplicateElement, circuitRow, assignNewCircuit, syncTargetCircuit, riserMate };
})();
