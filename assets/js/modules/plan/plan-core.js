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
    undoLimit: 100,
    cloudDebounceMs: 1500,
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
  function newProject(name) {
    return {
      id: uid("prj"), v: 1,
      name: String(name || "").trim() || "Новый проект",
      address: "", clientId: null,
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
        rules: {} // пороги проверок (Слой 6), пусто = дефолты plan-rules
      },
      underlay: null, // { imageDataUri, scale (см/пиксель), opacity }
      rooms: [], panels: [], elements: [], routes: [], circuits: [],
      openings: [], // двери и окна в стенах
      beams: [],    // перемычки/балки на потолке (свободные отрезки)
      layers: blankLayers(),
      versions: [], // { at, note } — история версий (заполняется в следующих слоях)
      createdAt: now(), updatedAt: now()
    };
  }
  function newRoom(points, name) {
    return { id: uid("rm"), name: name || "Комната", points: points || [], height: null /* null = settings.ceilingHeight */, zones: [], material: null /* null = settings.wallMaterial */ };
  }
  function newPanel(x, y, name) { return { id: uid("pn"), x: x || 0, y: y || 0, name: name || "Щит" }; }
  function newElement(type, wallId, offset, height, layer) {
    return { id: uid("el"), type, wallId, offset: offset || 0, height: height || 0, layer: layer || "power", status: "planned", circuitId: null, entryPost: null, photos: [], params: {} };
  }
  function newRoute(layer, routeType, points, fromId, toId) {
    return { id: uid("rt"), layer: layer || "routes", routeType: routeType || "ceiling", points: points || [], fromId: fromId || null, toId: toId || null, throughWalls: [] };
  }
  function newCircuit(name, color, breaker) { return { id: uid("cc"), name: name || "Линия", color: color || DEFAULTS.circuitColors[0], breaker: breaker || 16, rcd: false }; }
  // Проёмы: дверь / раздвижная / окно / балконный блок. Размеры настраиваемые.
  // height — высота проёма (см), sill — низ проёма от пола (окно ~90, дверь 0).
  const OPENING_KINDS = {
    door:    { w: 90,  h: 200, sill: 0,  win: false, pfx: "Д" },
    sliding: { w: 140, h: 200, sill: 0,  win: false, pfx: "РД" },
    window:  { w: 140, h: 140, sill: 90, win: true,  pfx: "О" },
    balcony: { w: 180, h: 210, sill: 0,  win: false, pfx: "Б" }
  };
  function newOpening(kind, wallId, offset, width) {
    // hinge: у какого края петли ('a' — ближний угол), flip: сторона открывания (±1)
    const k = OPENING_KINDS[kind] ? kind : (kind === "window" ? "window" : "door");
    const d = OPENING_KINDS[k];
    return { id: uid("op"), kind: k, type: d.win ? "window" : "door", wallId, offset: offset || 0, width: width || d.w, height: d.h, sill: d.sill, hinge: "a", flip: 1 };
  }
  function newBeam(a, b, kind, width, material) {
    return { id: uid("bm"), a: a || { x: 0, y: 0 }, b: b || { x: 0, y: 0 }, width: width || DEFAULTS.wallThickness, kind: kind === "lintel" ? "lintel" : "beam", material: material || null };
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
  function createProject(name) {
    const p = newProject(name);
    S.project = p; S.undo = []; S.redo = [];
    persist("create");
    return p;
  }
  async function openProject(id) {
    let p = lsGet(LS_PROJECT + id, null);
    if (!p) p = await cloudPullProject(id); // проект, созданный на другом устройстве
    if (!p) return null;
    p.openings = p.openings || []; // проекты, сохранённые до появления проёмов
    p.beams = p.beams || [];
    p.circuits = p.circuits || [];
    // бэкофилл новых полей проёмов (kind/height/sill) для старых проектов
    p.openings.forEach((o) => {
      if (!o.kind) o.kind = o.type === "window" ? "window" : "door";
      const d = OPENING_KINDS[o.kind] || OPENING_KINDS.door;
      if (o.height == null) o.height = d.h;
      if (o.sill == null) o.sill = d.sill;
    });
    S.project = p; S.undo = []; S.redo = [];
    emit("open");
    return p;
  }
  function closeProject() { S.project = null; S.undo = []; S.redo = []; emit("close"); }
  function deleteProject(id) {
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

  function persist(what) {
    const p = S.project;
    if (p) {
      p.updatedAt = now();
      if (!lsSet(LS_PROJECT + p.id, p)) emit("storage-full");
      indexUpsert(p);
    }
    cloudPushSoon();
    emit(what || "change");
  }

  // ---------- undo/redo (снимки состояния) ----------
  function snapshot() { return JSON.stringify(S.project); }
  function commit() { // вызывать ПЕРЕД мутацией проекта
    if (!S.project) return;
    S.undo.push(snapshot());
    if (S.undo.length > DEFAULTS.undoLimit) S.undo.shift();
    S.redo = [];
  }
  function undo() {
    if (!S.project || !S.undo.length) return false;
    S.redo.push(snapshot());
    S.project = JSON.parse(S.undo.pop());
    persist("undo");
    return true;
  }
  function redo() {
    if (!S.project || !S.redo.length) return false;
    S.undo.push(snapshot());
    S.project = JSON.parse(S.redo.pop());
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
    model: { newProject, newRoom, newPanel, newElement, newRoute, newCircuit, newOpening, newBeam }
  };
})();
