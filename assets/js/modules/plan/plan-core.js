/* Electric Pro V29 — Проект квартиры: ядро (Слой 0).
   Модель данных, состояние, сохранение (localStorage + EP.Cloud поверх),
   undo/redo, список проектов, экспорт/импорт JSON.
   Принцип: одна модель — много видов. Все размеры — в САНТИМЕТРАХ. */
(() => {
  "use strict";
  window.EP = window.EP || {};

  const LS_INDEX = "ep_plan_v1_index";
  const LS_PROJECT = "ep_plan_v1_p_";   // + id проекта
  const CLOUD_INDEX = "plan-index";
  const CLOUD_PROJECT = "plan-";        // + id проекта

  // ---- центральный конфиг (редактируется пользователем в следующих слоях) ----
  const DEFAULTS = {
    ceilingHeight: 270,   // см — высота потолка по умолчанию
    wallThickness: 10,    // см
    gridStep: 10,         // см — шаг привязки
    snapEnabled: true,
    undoLimit: 40,
    cloudDebounceMs: 1500,
    persistDebounceMs: 400, // localStorage-запись коалесируется (см. persist() ниже)
    heightPresets: { socket: 30, switch: 90, kitchen: 110 }, // см от пола
    panelHeight: 150,     // см — низ щита (для вертикалей трасс)
    wallMaterial: "Бетон", // материал стен по умолчанию (для расчёта штробления)
    materials: ["Бетон", "Кирпич", "Панель", "Мягкий"], // как в движке пула
    // материалы конструкций (стены/перегородки): для перегородок из ГКЛ/ПГП и пр.
    partitionMaterials: ["Бетон", "Кирпич", "Газоблок", "Пеноблок", "ГКЛ", "ПГП", "Дерево"],
    partitionThickness: { "Бетон": 12, "Кирпич": 12, "Газоблок": 10, "Пеноблок": 10, "ГКЛ": 8, "ПГП": 8, "Дерево": 8 },
    routeType: "ceiling",  // потолок/пол — как ведём трассы
    chaseW: 25, chaseH: 30,     // мм — сечение штробы под провод (стандарт), редактируется
    tpChaseW: 50, tpChaseH: 50, // мм — штроба тёплого пола (в пол)
    symbolStyle: "gost",   // значки на плане: "simple" (кружки с буквами) | "gost" (ГОСТ 21.210)
    cableReserve: 10,      // % запаса кабеля при расчёте по трассам
    routeOffset: 15,       // см — отступ трассы от грани стены (линии идут по контуру комнаты)
    sleeveD: 20,           // мм — диаметр проходки (гильзы) через стену, макс. 2 кабеля
    connectorMode: "gml",  // соединители в распайках: "wago" | "gml" (гильзы) | "siz"
    gofraCeil: true,       // прокладка по потолку: в гофре (true) или прямой монтаж на клипсах (false) — влияет на расходники (EP.CableConsum)
    schemeMode: "auto",    // однолинейка: "auto" (из p.circuits) | "manual" (ручной конструктор)
    mainBreaker: 40, phases: 1, // вводной автомат (А) и число фаз (1/3) для однолинейки
    panelBrand: "IEK", panelReserve: 6, // бренд корпуса щита и запас модулей
    cables: ["3×1.5", "3×2.5", "3×4", "3×6", "5×2.5", "5×4", "5×6", "5×10"], // сечения кабеля
    // типовые модульные корпуса: бренд -> {модулей в ряду, размеры [Ш,В,Г] мм по числу модулей}
    panelBoxes: {
      "IEK":       { rowCap: 12, sizes: { "12": [285, 205, 102], "24": [395, 310, 120], "36": [395, 435, 120], "48": [395, 560, 120], "54": [460, 560, 120], "72": [460, 685, 120] } },
      "ABB":       { rowCap: 12, sizes: { "12": [300, 220, 103], "24": [300, 360, 103], "36": [300, 500, 108], "48": [320, 735, 108], "54": [550, 585, 120], "72": [550, 720, 120] } },
      "Schneider": { rowCap: 13, sizes: { "13": [296, 236, 97], "26": [296, 376, 97], "39": [296, 516, 97], "52": [296, 656, 97] } },
      "ТЕКФОР":    { rowCap: 12, sizes: { "12": [280, 200, 100], "24": [385, 300, 115], "36": [385, 430, 115], "48": [385, 560, 115], "54": [450, 560, 115] } }
    },
    breakers: [10, 16, 20, 25, 32, 40, 63], // номиналы автоматов, А
    circuitColors: ["#ef4444", "#f59e0b", "#22c55e", "#3b82f6", "#a855f7", "#ec4899", "#14b8a6", "#eab308"],
    layers: [
      { id: "light",  name: "Освещение",       color: "#facc15" },
      { id: "power",  name: "Силовые",         color: "#f87171" },
      { id: "lv",     name: "Слаботочка",      color: "#60a5fa" },
      { id: "tv",     name: "ТВ",              color: "#c084fc" },
      { id: "cctv",   name: "Видеонаблюдение", color: "#34d399" },
      { id: "ac",     name: "Кондиционеры",    color: "#22d3ee" },
      { id: "warm",   name: "Тёплый пол",      color: "#fb923c" },
      { id: "routes", name: "Трассы",          color: "#94a3b8" },
      { id: "dims",   name: "Размеры",         color: "#cbd5e1" },
      { id: "labels", name: "Подписи",         color: "#e2e8f0" }
    ]
  };

  const uid = (p) => (p || "id") + Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
  const now = () => Date.now();

  // ---------- фабрики модели (все поля закладываются сразу — см. spec) ----------
  function blankLayers() {
    return DEFAULTS.layers.map((l) => ({ id: l.id, name: l.name, color: l.color, visible: true, opacity: 1 }));
  }
  // Этажи: проект — ОДНА модель на все этажи (общая смета/схема/циркуиты),
  // но комнаты/точки/щиты/балки/пустоты/лента/проёмы/трассы у каждой сущности
  // своё floorId — рендер/хит-тест/автотрассировка видят только activeFloorId
  // (см. G.floorScoped в plan-geometry.js), а расчёт/смета/однолинейка читают
  // p.routes/p.circuits КАК ЕСТЬ, без фильтра — суммируются по всем этажам разом.
  function newFloor(name) { return { id: uid("fl"), name: name || "Этаж" }; }
  // floorId новых сущностей берём из S.project.activeFloorId (текущий активный этаж) —
  // ЕДИНАЯ точка простановки, чтобы не трогать десятки мест создания комнат/точек/щитов
  // по всему модулю (все они и так создаются только над видимым, т.е. активным, этажом).
  function curFloorId() {
    const p = S.project;
    if (!p) return null;
    return p.activeFloorId || (p.floors && p.floors[0] && p.floors[0].id) || null;
  }
  function newProject(name) {
    const floors = [newFloor("1 этаж")];
    return {
      id: uid("prj"), v: 1,
      name: String(name || "").trim() || "Новый проект",
      address: "", client: "", clientId: null,
      floors, activeFloorId: floors[0].id,
      settings: {
        ceilingHeight: DEFAULTS.ceilingHeight,
        wallThickness: DEFAULTS.wallThickness,
        gridStep: DEFAULTS.gridStep,
        snapEnabled: DEFAULTS.snapEnabled,
        heightPresets: { ...DEFAULTS.heightPresets },
        panelHeight: DEFAULTS.panelHeight,
        wallMaterial: DEFAULTS.wallMaterial,
        routeType: DEFAULTS.routeType,
        chaseW: DEFAULTS.chaseW, chaseH: DEFAULTS.chaseH,
        tpChaseW: DEFAULTS.tpChaseW, tpChaseH: DEFAULTS.tpChaseH,
        mainBreaker: DEFAULTS.mainBreaker, phases: DEFAULTS.phases, meter: false, mainRcd: false,
        panelBrand: DEFAULTS.panelBrand, panelReserve: DEFAULTS.panelReserve, panelBox: null,
        symbolStyle: DEFAULTS.symbolStyle, cableReserve: DEFAULTS.cableReserve,
        routeOffset: DEFAULTS.routeOffset, sleeveD: DEFAULTS.sleeveD, connectorMode: DEFAULTS.connectorMode,
        gofraCeil: DEFAULTS.gofraCeil,
        schemeMode: DEFAULTS.schemeMode,
        rules: {} // пороги проверок (Слой 6), пусто = дефолты plan-rules
      },
      underlay: null, // { imageDataUri, scale (см/пиксель), opacity }
      rooms: [], panels: [], elements: [], routes: [], circuits: [],
      openings: [], // двери и окна в стенах
      beams: [],    // перемычки/балки на потолке (свободные отрезки)
      voids: [],    // внутренние препятствия: вентшахта / мини-комната внутри комнаты
      ledStrips: [], // светодиодная лента: сегменты ВДОЛЬ стены (wallId+offsetA/offsetB)
      manualScheme: newManualScheme(), // ручной конструктор однолинейки (Слой 7б)
      layers: blankLayers(),
      versions: [], // { at, note } — история версий (заполняется в следующих слоях)
      createdAt: now(), updatedAt: now()
    };
  }
  function newRoom(points, name) {
    return { id: uid("rm"), name: name || "Комната", points: points || [], height: null /* null = settings.ceilingHeight */, zones: [], material: null /* null = settings.wallMaterial */, floorId: curFloorId() };
  }
  function newPanel(x, y, name) { return { id: uid("pn"), x: x || 0, y: y || 0, name: name || "Щит", transformer: false, height: null /* null = settings.panelHeight (общая на проект) */, floorId: curFloorId() }; }
  function newElement(type, wallId, offset, height, layer) {
    return {
      id: uid("el"), type, wallId, offset: offset || 0, height: height || 0, layer: layer || "power", status: "planned",
      circuitId: null, entryPost: null, targetId: null, photos: [], params: {}, floorId: curFloorId(),
      // только для type:"switch" — клавиши (1-3), вид (обычный/проходной/перекрёстный),
      // цель каждой клавиши (свет/вывод) и звено цепочки проходных/перекрёстных
      keys: 1, swKind: "normal", targetIds: [], chainNext: null
    };
  }
  function newRoute(layer, routeType, points, fromId, toId) {
    return { id: uid("rt"), layer: layer || "routes", routeType: routeType || "ceiling", points: points || [], fromId: fromId || null, toId: toId || null, throughWalls: [], floorId: curFloorId() };
  }
  // phase: 1/2/3 — на какую фазу L1/L2/L3 посажена 1-полюсная линия (в 3-фазном щите,
  // для баланса нагрузки); у 3-полюсной линии (poles:3) не используется — она сама
  // висит на всех трёх фазах разом.
  function newCircuit(name, color, breaker) { return { id: uid("cc"), name: name || "Линия", color: color || DEFAULTS.circuitColors[0], breaker: breaker || 16, rcd: false, poles: 1, phase: 1, cable: null, rcdRating: 30 }; }
  // ручная однолинейка (Слой 7б): группы (УЗО/Диф) -> линии, линия может ссылаться
  // на линию плана (circuitId в p.circuits) — тогда она уходит из «не расставлено» в чек-листе.
  // Вводной автомат/счётчик/вводное УЗО НЕ дублируются здесь — те же settings.mainBreaker/
  // meter/mainRcd, что и в авто-режиме (единый источник, влияет и на подбор корпуса щита).
  function newManualScheme() {
    return {
      apparatus: { rubilnik: false, opn: false, uzm: false, avr: false, phaseSwitch: false, priority: false, contactor: false, uzdp: false, bell: false, serviceSocket: false },
      apparatusOrder: [],
      busbarCable: null, busbarCableLen: null,
      groups: []
    };
  }
  function newSchemeGroup(title) {
    return { id: uid("mg"), title: title || "Группа", kind: "uzo", leak: 30, rcdType: "A", curve: "C", amp: 40, phase: "1", phaseSel: "1", apps: [], appsAfter: [], lines: [] };
  }
  function newSchemeLine(name) {
    return { id: uid("ml"), circuitId: null, name: name || "", curve: "C", amp: 16, phase: "1", cable: null, cableLen: null, apps: [] };
  }
  // светодиодная лента: сегмент ВДОЛЬ конкретной стены между двумя офсетами (см. wall).
  // Привязка к стене (как у элементов) — тривиальный рендер и на плане, и в развёртке.
  function newLedStrip(wallId, offsetA, offsetB, height, circuitId) {
    return { id: uid("ls"), wallId, offsetA: offsetA || 0, offsetB: offsetB || 0, height: height || 0, circuitId: circuitId || null, status: "planned", floorId: curFloorId() };
  }
  // Проёмы: дверь / раздвижная / окно / балконный блок. Размеры настраиваемые.
  // height — высота проёма (см), sill — низ проёма от пола (окно ~90, дверь 0).
  const OPENING_KINDS = {
    door:    { w: 90,  h: 200, sill: 0,  win: false, pfx: "Д" },
    sliding: { w: 140, h: 200, sill: 0,  win: false, pfx: "РД" },
    window:  { w: 140, h: 140, sill: 90, win: true,  pfx: "О" },
    balcony: { w: 180, h: 210, sill: 0,  win: false, pfx: "Б" },
    opening: { w: 90,  h: 200, sill: 0,  win: false, pfx: "Пр" } // проём без двери/окна — просто вырез в стене
  };
  function newOpening(kind, wallId, offset, width) {
    // hinge: у какого края петли ('a' — ближний угол), flip: сторона открывания (±1)
    const k = OPENING_KINDS[kind] ? kind : (kind === "window" ? "window" : "door");
    const d = OPENING_KINDS[k];
    return { id: uid("op"), kind: k, type: d.win ? "window" : "door", wallId, offset: offset || 0, width: width || d.w, height: d.h, sill: d.sill, hinge: "a", flip: 1, floorId: curFloorId() };
  }
  function newBeam(a, b, kind, width, material) {
    return { id: uid("bm"), a: a || { x: 0, y: 0 }, b: b || { x: 0, y: 0 }, width: width || DEFAULTS.wallThickness, kind: kind === "lintel" ? "lintel" : "beam", material: material || null, floorId: curFloorId() };
  }
  // Внутреннее препятствие (вентшахта / мини-комната внутри комнаты) — прямоугольник
  // по двум противоположным углам a/b, БЕЗ привязки к конкретной room (комната
  // определяется геометрически, как и у всех прочих свободных объектов плана).
  function newVoid(a, b, kind) {
    const k = kind === "room" ? "room" : "shaft";
    return { id: uid("vd"), a: a || { x: 0, y: 0 }, b: b || { x: 0, y: 0 }, kind: k, name: k === "room" ? "Комната" : "Шахта", floorId: curFloorId() };
  }

  // ---------- состояние ----------
  const S = { project: null, index: [], undo: [], redo: [], cloudTimer: null, listeners: new Set() };

  function emit(what) {
    S.listeners.forEach((fn) => { try { fn(what); } catch (e) {} });
  }
  function onChange(fn) { S.listeners.add(fn); return () => S.listeners.delete(fn); }

  // ---------- localStorage ----------
  function lsGet(key, fallback) {
    try { const v = JSON.parse(localStorage.getItem(key) || "null"); return v === null ? fallback : v; } catch (e) { return fallback; }
  }
  function lsSet(key, value) { try { localStorage.setItem(key, JSON.stringify(value)); return true; } catch (e) { return false; } }

  function loadIndex() { S.index = lsGet(LS_INDEX, []); }
  function saveIndex() { lsSet(LS_INDEX, S.index); }
  function indexUpsert(p) {
    const row = { id: p.id, name: p.name, address: p.address || "", updatedAt: p.updatedAt, rooms: p.rooms.length, elements: p.elements.length };
    const i = S.index.findIndex((x) => x.id === p.id);
    if (i >= 0) S.index[i] = row; else S.index.unshift(row);
    S.index.sort((a, b) => b.updatedAt - a.updatedAt);
    saveIndex();
  }

  // ---------- облако (best-effort поверх localStorage) ----------
  function cloudReady() { return !!(window.EP.Cloud && EP.Cloud.isReady && EP.Cloud.isReady()); }
  function cloudPushSoon() {
    clearTimeout(S.cloudTimer);
    S.cloudTimer = setTimeout(() => {
      if (!cloudReady()) return;
      const p = S.project;
      if (p) EP.Cloud.push(CLOUD_PROJECT + p.id, { project: p, updatedAt: p.updatedAt });
      EP.Cloud.push(CLOUD_INDEX, { rows: S.index, updatedAt: now() });
    }, DEFAULTS.cloudDebounceMs);
  }
  async function cloudPullIndex() {
    if (!cloudReady()) return;
    const d = await EP.Cloud.pull(CLOUD_INDEX);
    if (d && Array.isArray(d.rows)) {
      d.rows.forEach((r) => { if (r && r.id && !S.index.some((x) => x.id === r.id)) S.index.push(r); });
      S.index.sort((a, b) => b.updatedAt - a.updatedAt);
      saveIndex();
      emit("index");
    }
  }
  async function cloudPullProject(id) {
    if (!cloudReady()) return null;
    const d = await EP.Cloud.pull(CLOUD_PROJECT + id);
    return d && d.project ? d.project : null;
  }

  // ---------- проекты ----------
  function listProjects() { return S.index.slice(); }
  // opts (необязателен) — стартовые настройки, заданные в форме создания проекта:
  // { ceilingHeight (см), routeType ("ceiling"|"floor"), gofraCeil (bool — способ
  //  монтажа по потолку: гофра/на стяжки) }. Материалы (пол → гофра+лента, потолок →
  // гофра ИЛИ стяжки) считает EP.CableConsum по routeType+gofraCeil, отдельной модели
  // не заводим — здесь только начальные значения settings.
  function createProject(name, opts) {
    const p = newProject(name);
    if (opts) {
      if (Number(opts.ceilingHeight) >= 150) p.settings.ceilingHeight = Math.round(Number(opts.ceilingHeight));
      if (opts.routeType === "floor" || opts.routeType === "ceiling") p.settings.routeType = opts.routeType;
      if (typeof opts.gofraCeil === "boolean") p.settings.gofraCeil = opts.gofraCeil;
    }
    S.project = p; S.undo = []; S.redo = [];
    persist("create");
    return p;
  }
  // Бэкофилл проектов, сохранённых/экспортированных до появления новых полей —
  // применяется и при открытии (openProject), и при импорте JSON (importJSON),
  // чтобы старые/сторонние проекты не теряли настройки молча.
  function backfillProject(p) {
    if (p.client == null) p.client = "";
    // Этажи: старые проекты — один неявный этаж. Сюда же попадают проекты,
    // где чей-то floorId ссылается на этаж, которого уже нет (например, после
    // ручного редактирования JSON) — фолбэк на первый этаж, а не потеря объекта.
    if (!Array.isArray(p.floors) || !p.floors.length) p.floors = [newFloor("1 этаж")];
    if (!p.activeFloorId || !p.floors.some((f) => f.id === p.activeFloorId)) p.activeFloorId = p.floors[0].id;
    const fid0 = p.floors[0].id;
    [p.rooms, p.panels, p.elements, p.beams, p.voids, p.ledStrips, p.openings, p.routes].forEach((arr) => {
      (arr || []).forEach((x) => { if (!x.floorId || !p.floors.some((f) => f.id === x.floorId)) x.floorId = fid0; });
    });
    p.openings = p.openings || [];
    p.beams = p.beams || [];
    p.voids = p.voids || [];
    p.ledStrips = p.ledStrips || [];
    p.circuits = p.circuits || [];
    p.circuits.forEach((c) => { if (c.phase !== 1 && c.phase !== 2 && c.phase !== 3) c.phase = 1; });
    p.panels = p.panels || [];
    p.panels.forEach((pn) => { if (pn.transformer == null) pn.transformer = false; });
    p.settings = p.settings || {};
    if (!p.settings.symbolStyle) p.settings.symbolStyle = DEFAULTS.symbolStyle;
    if (p.settings.cableReserve == null) p.settings.cableReserve = DEFAULTS.cableReserve;
    if (p.settings.routeOffset == null) p.settings.routeOffset = DEFAULTS.routeOffset;
    if (p.settings.sleeveD == null) p.settings.sleeveD = DEFAULTS.sleeveD;
    if (!p.settings.connectorMode) p.settings.connectorMode = DEFAULTS.connectorMode;
    if (p.settings.gofraCeil == null) p.settings.gofraCeil = DEFAULTS.gofraCeil;
    if (!p.settings.schemeMode) p.settings.schemeMode = DEFAULTS.schemeMode;
    if (!p.manualScheme || typeof p.manualScheme !== "object") p.manualScheme = newManualScheme();
    else {
      p.manualScheme.apparatus = p.manualScheme.apparatus || newManualScheme().apparatus;
      p.manualScheme.apparatusOrder = Array.isArray(p.manualScheme.apparatusOrder) ? p.manualScheme.apparatusOrder : [];
      p.manualScheme.groups = Array.isArray(p.manualScheme.groups) ? p.manualScheme.groups : [];
    }
    // бэкофилл новых полей проёмов (kind/height/sill) для старых проектов
    p.openings.forEach((o) => {
      if (!o.kind) o.kind = o.type === "window" ? "window" : "door";
      const d = OPENING_KINDS[o.kind] || OPENING_KINDS.door;
      if (o.height == null) o.height = d.h;
      if (o.sill == null) o.sill = d.sill;
    });
    return p;
  }

  async function openProject(id) {
    let p = lsGet(LS_PROJECT + id, null);
    if (!p) p = await cloudPullProject(id); // проект, созданный на другом устройстве
    if (!p) return null;
    backfillProject(p);
    S.project = p; S.undo = []; S.redo = [];
    emit("open");
    return p;
  }
  function closeProject() { S.project = null; S.undo = []; S.redo = []; emit("close"); }
  function deleteProject(id) {
    // отложенная (debounced) запись persist() могла ещё не сработать — если она
    // как раз для ЭТОГО проекта, гасим её, иначе таймер воскресит удалённый
    // проект в localStorage после того, как мы его тут же удалим строкой ниже.
    if (persistDirty && persistDirty.id === id) { clearTimeout(persistTimer); persistTimer = 0; persistDirty = null; }
    try { localStorage.removeItem(LS_PROJECT + id); } catch (e) {}
    S.index = S.index.filter((x) => x.id !== id);
    saveIndex(); cloudPushSoon();
    if (S.project && S.project.id === id) closeProject(); else emit("index");
  }
  function renameProject(name) {
    if (!S.project) return;
    const clean = String(name || "").trim();
    if (!clean || clean === S.project.name) return;
    commit();
    S.project.name = clean;
    persist("rename");
  }

  // ---------- этажи ----------
  function addFloor(name) {
    if (!S.project) return null;
    commit();
    const f = newFloor(name || `Этаж ${S.project.floors.length + 1}`);
    S.project.floors.push(f);
    S.project.activeFloorId = f.id;
    persist("floor-add");
    return f;
  }
  function renameFloor(id, name) {
    if (!S.project) return;
    const f = (S.project.floors || []).find((x) => x.id === id);
    const clean = String(name || "").trim();
    if (!f || !clean) return;
    commit();
    f.name = clean;
    persist("floor-rename");
  }
  // Переключение вида — НЕ мутация данных (без commit(), как R.mode), но persist()
  // запоминает, на каком этаже пользователь остановился (переживает перезагрузку/синк).
  function setActiveFloor(id) {
    if (!S.project || S.project.activeFloorId === id) return;
    if (!(S.project.floors || []).some((f) => f.id === id)) return;
    S.project.activeFloorId = id;
    persist("floor-switch");
  }
  // Удаляет этаж СО ВСЕМ содержимым (комнаты/щиты/точки/балки/пустоты/лента/проёмы/
  // трассы этого floorId) — каскадно, как удаление комнаты чистит её точки; подтверждение
  // (confirm) — на стороне UI. Нельзя удалить последний оставшийся этаж проекта.
  function deleteFloor(id) {
    if (!S.project || S.project.floors.length < 2) return false;
    commit();
    const p = S.project;
    p.floors = p.floors.filter((f) => f.id !== id);
    ["rooms", "panels", "elements", "beams", "voids", "ledStrips", "openings", "routes"].forEach((key) => {
      p[key] = (p[key] || []).filter((x) => x.floorId !== id);
    });
    if (p.activeFloorId === id) p.activeFloorId = p.floors[0].id;
    persist("floor-del");
    return true;
  }

  // Запись в localStorage (JSON.stringify всего проекта + пересчёт индекса) —
  // синхронная и тяжёлая операция на больших проектах; persist() вызывается почти
  // на каждое действие (в т.ч. на "input" некоторых полей — набор текста без
  // commit()). Коалесируем несколько persist() подряд в ОДНУ запись через
  // debounce: persistDirty держит ПРЯМУЮ ссылку на объект проекта (не id,
  // не S.project на момент таймера) — мутации происходят на месте, поэтому
  // к моменту срабатывания таймера в нём уже самые свежие данные, даже если
  // пользователь успел переключиться на ДРУГОЙ проект (S.project уже другой,
  // но persistDirty всё ещё корректно указывает на прежний объект/id).
  // emit(what) НЕ откладываем — UI/автоперестройка трасс (AUTOREBUILD_ON и
  // т.п.) должны узнавать об изменении сразу, откладывается только диск/индекс.
  let persistTimer = 0, persistDirty = null;
  function flushPersist() {
    clearTimeout(persistTimer); persistTimer = 0;
    const p = persistDirty; persistDirty = null;
    if (!p) return;
    if (!lsSet(LS_PROJECT + p.id, p)) emit("storage-full");
    indexUpsert(p);
  }
  function persist(what) {
    const p = S.project;
    if (p) {
      p.updatedAt = now();
      persistDirty = p;
      clearTimeout(persistTimer);
      persistTimer = setTimeout(flushPersist, DEFAULTS.persistDebounceMs);
    }
    cloudPushSoon();
    emit(what || "change");
  }
  // уход со страницы/сворачивание — добить отложенную запись немедленно, чтобы
  // не потерять последнее действие, если debounce (400мс) не успел сработать
  try {
    document.addEventListener("visibilitychange", () => { if (document.visibilityState === "hidden") flushPersist(); });
    window.addEventListener("pagehide", flushPersist);
  } catch (e) {}

  // ---------- undo/redo (снимки состояния) ----------
  // structuredClone (нативное глубокое клонирование) вместо JSON.stringify —
  // быстрее на больших проектах (нет прохода через промежуточную строку) и
  // избавляет undo/redo от повторного JSON.parse при восстановлении снимка.
  // Фолбэк на JSON-клон — для старых движков без structuredClone (в т.ч.
  // тестовый vm-сэндбокс test/harness.js, где structuredClone не пробрасывается
  // в контекст) — то же поведение, что было раньше, без регресса.
  const deepClone = typeof structuredClone === "function"
    ? (o) => structuredClone(o)
    : (o) => JSON.parse(JSON.stringify(o));
  function snapshot() { return deepClone(S.project); }
  function commit() { // вызывать ПЕРЕД мутацией проекта
    if (!S.project) return;
    S.undo.push(snapshot());
    if (S.undo.length > DEFAULTS.undoLimit) S.undo.shift();
    S.redo = [];
  }
  function undo() {
    if (!S.project || !S.undo.length) return false;
    S.redo.push(snapshot());
    S.project = S.undo.pop();
    persist("undo");
    return true;
  }
  function redo() {
    if (!S.project || !S.redo.length) return false;
    S.undo.push(snapshot());
    S.project = S.redo.pop();
    persist("redo");
    return true;
  }
  const canUndo = () => S.undo.length > 0;
  const canRedo = () => S.redo.length > 0;

  // ---------- экспорт / импорт ----------
  function exportJSON() {
    if (!S.project) return null;
    return JSON.stringify({ type: "ep-plan-project", exportedAt: new Date().toISOString(), project: S.project }, null, 2);
  }
  function importJSON(text) {
    try {
      const d = JSON.parse(text);
      const src = d && d.project ? d.project : d;
      if (!src || !Array.isArray(src.rooms) || !Array.isArray(src.elements)) return null;
      const p = Object.assign(newProject(src.name), src, { id: uid("prj"), updatedAt: now() }); // копия, свой id
      backfillProject(p); // старые/сторонние экспорты не теряют новые настройки молча
      S.project = p; S.undo = []; S.redo = [];
      persist("import");
      return p;
    } catch (e) { return null; }
  }

  // ---------- init ----------
  loadIndex();
  if (window.EP.Cloud && EP.Cloud.onLogin) EP.Cloud.onLogin(() => { cloudPullIndex(); });

  EP.Plan = EP.Plan || {};
  EP.Plan.Core = {
    DEFAULTS, uid, OPENING_KINDS,
    get project() { return S.project; },
    onChange,
    listProjects, createProject, openProject, closeProject, deleteProject, renameProject,
    commit, undo, redo, canUndo, canRedo, persist,
    exportJSON, importJSON, cloudPullIndex,
    addFloor, renameFloor, setActiveFloor, deleteFloor,
    model: { newProject, newRoom, newPanel, newElement, newRoute, newCircuit, newOpening, newBeam, newVoid, newManualScheme, newSchemeGroup, newSchemeLine, newLedStrip, newFloor }
  };
})();
