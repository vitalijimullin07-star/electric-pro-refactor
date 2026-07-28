/* Electric Pro V29 — Проект квартиры: мебель и бытовая техника (p.appliances).

   Просьба пользователя: «по технике понятно какая нагрузка, и какой провод нужен,
   даже тот же самый водонагреватель… делай полностью по технике, и базовую мебель».

   Одна модель на оба вида — свободный прямоугольник на полу с поворотом
   (kind:"appl" — техника с мощностью, kind:"furn" — мебель без неё), потому что
   геометрия и вся работа с ней (постановка, тяга, размеры числом, поворот, слой,
   печать) у них одинаковые; отличается только «электрическая» часть: у техники есть
   мощность → ток → рекомендуемый кабель/автомат/УЗО (needFor) и связь с точкой
   питания (a.elementId), у мебели их нет. Габариты каталога — типовые, в СМ. */
(() => {
  "use strict";
  window.EP = window.EP || {};

  // ---- каталог: [id, имя, ширина, глубина, Вт, флаги] ----
  // own — техника ТРЕБУЕТ отдельную линию (практика/ПУЭ: стиралка, посудомойка,
  // духовка, варочная, водонагреватель…); wet — стоит во влажной зоне (санузел/
  // кухня у воды) → УЗО обязательно; p3 — бывает трёхфазной (варочная/каменка/
  // проточный водонагреватель — в палитре помечено «1ф/3ф»); plug — включается
  // в розетку (розеточная группа = минимум 16A/2.5, см. needFor).
  const CATALOG = {
    appl: [
      { id: "fridge", name: "Холодильник", w: 60, d: 65, kw: 300, own: true },
      { id: "freezer", name: "Морозильник", w: 60, d: 65, kw: 300, own: true },
      { id: "washer", name: "Стиральная машина", w: 60, d: 60, kw: 2200, own: true, wet: true },
      { id: "dryer", name: "Сушильная машина", w: 60, d: 60, kw: 2500, own: true },
      { id: "dishwasher", name: "Посудомоечная машина", w: 60, d: 60, kw: 2100, own: true, wet: true },
      { id: "oven", name: "Духовой шкаф", w: 60, d: 60, kw: 3500, own: true },
      { id: "hob", name: "Варочная панель", w: 60, d: 52, kw: 7200, own: true, p3: true },
      { id: "hood", name: "Вытяжка", w: 60, d: 50, kw: 250, plug: true },
      { id: "microwave", name: "СВЧ", w: 50, d: 40, kw: 1400, plug: true },
      { id: "coffee", name: "Кофемашина", w: 40, d: 45, kw: 1500, plug: true },
      { id: "waterheater", name: "Водонагреватель накопительный", w: 45, d: 45, kw: 2500, own: true, wet: true },
      { id: "waterheaterflow", name: "Водонагреватель проточный", w: 30, d: 20, kw: 11000, own: true, wet: true, p3: true },
      { id: "boiler", name: "Котёл электрический", w: 50, d: 30, kw: 6000, own: true, p3: true },
      // газовый котёл: сам по себе ест мало (плата + циркуляционный насос), но линию
      // ему делают ОТДЕЛЬНУЮ и «чистую» (часто через стабилизатор/ИБП и АВР) — от этого
      // зависит не сечение, а сама организация питания
      { id: "boilergas", name: "Котёл газовый", w: 45, d: 30, kw: 150, own: true, plug: true },
      { id: "towel", name: "Полотенцесушитель эл.", w: 50, d: 12, kw: 500, wet: true },
      { id: "acin", name: "Кондиционер (внутр. блок)", w: 90, d: 25, kw: 1200, own: true },
      { id: "pump", name: "Насос / станция", w: 40, d: 25, kw: 800, own: true, wet: true },
      { id: "jacuzzi", name: "Гидромассажная ванна", w: 170, d: 80, kw: 2000, own: true, wet: true },
      { id: "sauna", name: "Каменка / сауна", w: 60, d: 40, kw: 4500, own: true, p3: true },
      { id: "tvset", name: "ТВ (панель)", w: 120, d: 10, kw: 200, plug: true },
      { id: "pc", name: "ПК / рабочее место", w: 60, d: 60, kw: 600, plug: true },
      { id: "bell", name: "Звонок", w: 10, d: 4, kw: 15 },
      { id: "neptun", name: "Защита от протечек (Нептун)", w: 20, d: 12, kw: 30, own: true, wet: true },
      { id: "handdryer", name: "Сушилка для рук", w: 25, d: 30, kw: 2000, own: true, wet: true },
      { id: "fancoil", name: "Фанкойл", w: 100, d: 25, kw: 250, own: true },
      { id: "disposer", name: "Измельчитель под раковиной", w: 20, d: 20, kw: 560, own: true, wet: true },
      { id: "kettle", name: "Чайник", w: 22, d: 22, kw: 2200, plug: true },
      { id: "fanduct", name: "Вентилятор встраиваемый (в вытяжку)", w: 15, d: 15, kw: 60, wet: true }
    ],
    furn: [
      { id: "kitchen", name: "Кухонный шкаф", w: 60, d: 60 },
      { id: "counter", name: "Столешница", w: 120, d: 60 },
      { id: "tall", name: "Пенал / колонна", w: 60, d: 60 },
      { id: "sink", name: "Мойка", w: 60, d: 60 },
      { id: "table", name: "Стол", w: 120, d: 80 },
      { id: "chair", name: "Стул", w: 45, d: 45 },
      { id: "sofa", name: "Диван", w: 200, d: 90 },
      { id: "armchair", name: "Кресло", w: 90, d: 90 },
      { id: "bed2", name: "Кровать 2-сп.", w: 160, d: 200 },
      { id: "bed1", name: "Кровать 1-сп.", w: 90, d: 200 },
      { id: "wardrobe", name: "Шкаф", w: 100, d: 60 },
      { id: "nightstand", name: "Тумба", w: 45, d: 40 },
      { id: "desk", name: "Письменный стол", w: 120, d: 60 },
      { id: "tvstand", name: "ТВ-тумба", w: 140, d: 40 },
      { id: "wc", name: "Унитаз", w: 40, d: 70 },
      { id: "bath", name: "Ванна", w: 170, d: 75 },
      { id: "shower", name: "Душевая", w: 90, d: 90 },
      { id: "basin", name: "Раковина", w: 60, d: 50 }
    ]
  };
  const byId = (id) => CATALOG.appl.find((x) => x.id === id) || CATALOG.furn.find((x) => x.id === id) || null;

  // ток/кабель/автомат под мощность прибора. 230В, cosφ=1 (бытовая техника —
  // практически активная нагрузка); трёхфазный вариант считается по линейному
  // напряжению 400В и трём фазам. Сечения — тот же ряд, что у автоподбора кабеля
  // линии (plan-scheme.js SECTION_BY_AMP) и у проверки «сечение под автомат»
  // (plan-rules.js CABLE_AMP), чтобы советы модулей не противоречили друг другу.
  const SEC_BY_AMP = [{ amp: 10, sec: 1.5 }, { amp: 16, sec: 2.5 }, { amp: 25, sec: 4 }, { amp: 32, sec: 6 }, { amp: 50, sec: 10 }, { amp: 63, sec: 16 }];
  const BREAKERS = [6, 10, 16, 20, 25, 32, 40, 50, 63];
  function needFor(a) {
    const c = byId(a && a.catId) || {};
    const watt = a && a.watt != null ? a.watt : (c.kw || 0);
    if (!watt) return null;
    const p3 = !!(a && a.phases === 3);
    const amps = p3 ? watt / (400 * Math.sqrt(3)) : watt / 230;
    // Автомат — ближайший СТАНДАРТНЫЙ номинал не ниже тока прибора. Плюс практический
    // минимум 16A/2.5 для техники, которая идёт ОТДЕЛЬНОЙ линией (own): выделенную линию
    // под стиралку/посудомойку/водонагреватель по факту всегда делают 16A кабелем 2.5,
    // даже если по току хватило бы 10A/1.5 — иначе советы модуля расходились бы с
    // реальной практикой монтажа.
    const nextB = BREAKERS.find((b) => b >= amps) || BREAKERS[BREAKERS.length - 1];
    // Практический минимум 16A/2.5 — для техники с ОТДЕЛЬНОЙ линией (own) и для всего,
    // что включается В РОЗЕТКУ (plug: чайник, СВЧ, кофемашина, вытяжка, ТВ, ПК):
    // розеточные группы по факту всегда делают 16A кабелем 2.5, и совет «чайнику хватит
    // 3×1.5» ввёл бы в заблуждение. Приборы с ПРЯМЫМ подключением и малой мощностью
    // (звонок, канальный вентилятор, полотенцесушитель) считаются честно по току.
    const breaker = Math.max(nextB, (c.own || c.plug) ? 16 : 0);
    const sec = (SEC_BY_AMP.find((x) => breaker <= x.amp) || SEC_BY_AMP[SEC_BY_AMP.length - 1]).sec;
    return {
      watt, amps: Math.round(amps * 10) / 10, breaker,
      cable: (p3 ? "5×" : "3×") + String(sec).replace(".", "."),
      rcd: !!(c.wet || c.own), own: !!c.own, wet: !!c.wet, p3ok: !!c.p3
    };
  }

  const esc = (s) => String(s == null ? "" : s).replace(/[&<>"']/g, (ch) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[ch]));
  const $ = (sel, r) => (r || document).querySelector(sel);
  const core = () => EP.Plan.Core;
  const G = () => EP.Plan.Geometry;
  const rooms = () => EP.Plan.Rooms;
  const S = { kind: "furn", catId: "sofa", selId: null };

  // ---- палитра (вход в режим 🛋) ----
  function onModeEnter() { sheetPalette(); }
  function sheetPalette(keep) {
    const p = core().project;
    const n = (p.appliances || []).length;
    const list = CATALOG[S.kind] || CATALOG.furn;
    rooms().openSheet(`<div class="ep-plan-srow"><b>🛋 Мебель и техника</b><span class="ep-plan-flex"></span><span>В проекте: <b>${n}</b></span></div>
      <div class="ep-plan-srow">
        <button type="button" class="ep-plan-chip ep-clickable ${S.kind === "furn" ? "on" : ""}" data-pf-kind="furn">Мебель</button>
        <button type="button" class="ep-plan-chip ep-clickable ${S.kind === "appl" ? "on" : ""}" data-pf-kind="appl">Техника</button>
      </div>
      <div class="ep-plan-palette">${list.map((c) => `
        <button type="button" class="ep-plan-pbtn ep-clickable ${S.catId === c.id ? "on" : ""}" data-pf-cat="${esc(c.id)}">
          <i class="ep-plan-glyph">${c.kw ? "⚡" : "▭"}</i>${esc(c.name)}<br><small>${c.w}×${c.d}${c.kw ? " · " + (c.kw >= 1000 ? (c.kw / 1000).toFixed(1) + " кВт" : c.kw + " Вт") : ""}${c.p3 ? " · 1ф/3ф" : ""}</small></button>`).join("")}
      </div>
      <div class="ep-plan-modehint">Выбери и тапни по плану — предмет встанет центром в точку тапа. Размеры/поворот — в его редакторе (тап по предмету). У техники сразу видно нагрузку, ток и какой кабель/автомат нужен.</div>`, { keepCollapsed: !!keep });
  }

  // ---- геометрия предмета ----
  // прямоугольник задан ЦЕНТРОМ + габаритами + поворотом (в отличие от p.voids,
  // где две точки: мебель почти всегда стоит под углом к стене, поворот нужен)
  function corners(a) {
    const rad = (a.rot || 0) * Math.PI / 180, cos = Math.cos(rad), sin = Math.sin(rad);
    const hw = a.w / 2, hd = a.d / 2;
    return [[-hw, -hd], [hw, -hd], [hw, hd], [-hw, hd]].map(([dx, dy]) => ({
      x: a.x + dx * cos - dy * sin, y: a.y + dx * sin + dy * cos
    }));
  }
  function hitAt(pt) {
    const p = G().floorScoped(core().project);
    const list = (p.appliances || []).slice().reverse(); // сверху лежащий — первым
    return list.find((a) => G().pointInPolygon(pt, corners(a))) || null;
  }

  function placeAt(w) {
    const c = core(), p = c.project;
    const cat = byId(S.catId); if (!cat) return null;
    const step = p.settings.gridStep || 10;
    const pt = G().snapPoint(w, step);
    c.commit();
    const a = c.model.newAppliance(S.kind, cat.id, pt.x, pt.y, cat.w, cat.d);
    p.appliances.push(a);
    c.persist("appl-add");
    S.selId = a.id;
    rooms().renderScene();
    openEditor(a);
    return a;
  }

  function openEditor(a) {
    const p = core().project;
    S.selId = a.id;
    const cat = byId(a.catId) || {};
    const nd = a.kind === "appl" ? needFor(a) : null;
    const circ = nd ? (p.circuits || []).find((c) => c.id === a.circuitId) : null;
    const pts = (a.kind === "appl") ? (G().floorScoped(p).elements || []).filter((e) => e.type === "socket" || e.type === "output" || e.type === "block") : [];
    rooms().openSheet(`<div class="ep-plan-srow"><b>${esc(a.name || cat.name || "Предмет")}</b>
        <span class="ep-plan-flex"></span><span>${a.kind === "appl" ? "техника" : "мебель"}</span></div>
      <div class="ep-plan-srow ep-plan-s2">
        <label>Ширина, см<input id="ep-pf-w" type="number" inputmode="numeric" min="10" value="${Math.round(a.w)}"></label>
        <label>Глубина, см<input id="ep-pf-d" type="number" inputmode="numeric" min="10" value="${Math.round(a.d)}"></label>
      </div>
      <div class="ep-plan-srow">
        <button type="button" class="ep-plan-chip ep-clickable" data-pf-rot="90">⟳ 90°</button>
        <button type="button" class="ep-plan-chip ep-clickable" data-pf-rot="45">⟳ 45°</button>
        <button type="button" class="ep-plan-chip ep-clickable" data-pf-rot="-45">⟲ 45°</button>
        <span>Поворот: <b>${Math.round(a.rot || 0)}°</b></span>
      </div>
      ${a.kind === "appl" ? `
      <div class="ep-plan-srow ep-plan-s2">
        <label>Мощность, Вт<input id="ep-pf-watt" type="number" inputmode="numeric" min="0" value="${Math.round(a.watt != null ? a.watt : (cat.kw || 0))}"></label>
        <label class="ep-plan-chk"><input id="ep-pf-p3" type="checkbox" ${a.phases === 3 ? "checked" : ""}> 3 фазы</label>
      </div>
      ${nd ? `<div class="ep-plan-modehint"><b>Нагрузка:</b> ${(nd.watt / 1000).toFixed(nd.watt >= 1000 ? 1 : 2)} кВт · ${nd.amps} А →
        нужен кабель <b>${esc(nd.cable)}</b>, автомат <b>${nd.breaker}A</b>${nd.rcd ? ", <b>УЗО обязательно</b>" : ""}${nd.own ? ". Своя отдельная линия." : ""}
        ${nd.p3ok ? " Возможно подключение в 3 фазы." : ""}</div>` : ""}
      <div class="ep-plan-srow">Линия питания:
        ${(p.circuits || []).map((c) => `<button type="button" class="ep-plan-chip ep-clickable ${a.circuitId === c.id ? "on" : ""}" data-pf-circ="${esc(c.id)}" style="border-color:${esc(c.color)}">${esc(c.name)}</button>`).join("") || "<span>линий пока нет</span>"}
        ${a.circuitId ? `<button type="button" class="ep-plan-chip ep-clickable" data-pf-circ="">✕ снять</button>` : ""}
      </div>
      ${circ ? `<div class="ep-plan-modehint">На линии ${esc(circ.name)}: автомат ${circ.breaker || 16}A${circ.rcd ? " + УЗО" : ""}, кабель ${esc(circ.cable || "авто")}. Расхождения покажет «✅ Проверки».</div>` : ""}
      <div class="ep-plan-srow">Точка питания:
        ${pts.length ? pts.slice(0, 12).map((e) => `<button type="button" class="ep-plan-chip ep-clickable ${a.elementId === e.id ? "on" : ""}" data-pf-el="${esc(e.id)}">${esc((EP.Plan.Elements.TYPES[e.type] || {}).glyph || "?")} ${Math.round(e.height || 0)}см</button>`).join("") : "<span>розеток/выводов пока нет</span>"}
      </div>` : ""}
      <div class="ep-plan-srow ep-plan-sbtns">
        <button type="button" class="ep-plan-tbtn ep-clickable" data-pf-apply>✓</button>
        <button type="button" class="ep-plan-tbtn ep-clickable" data-pf-dup>Копия</button>
        <button type="button" class="ep-plan-tbtn ep-plan-danger ep-clickable" data-pf-del>✕ Удалить</button>
      </div>`);
    rooms().renderScene();
    if (rooms().ensureVisibleAboveSheet) rooms().ensureVisibleAboveSheet({ x: a.x, y: a.y });
    enableDrag(a.id);
  }

  // тяга предмета целиком (veto-паттерн: жест НЕ на предмете — панорама)
  function enableDrag(id) {
    const R = rooms();
    if (!R || !R.canvasSetDrag) return;
    R.canvasSetDrag((dx, dy, phase, start) => {
      const c = core(), p = c.project;
      const a = (p.appliances || []).find((x) => x.id === id);
      if (!a) return false;
      if (phase === "start") {
        if (!G().pointInPolygon(start, corners(a))) return false;
        c.commit();
        return;
      }
      if (phase === "move") { a.x += dx; a.y += dy; R.renderSceneSoon ? R.renderSceneSoon() : R.renderScene(); }
      else if (phase === "end") {
        const step = p.settings.gridStep || 10;
        const sp = G().snapPoint({ x: a.x, y: a.y }, step);
        a.x = sp.x; a.y = sp.y;
        c.persist("appl-move");
        R.renderScene();
        openEditor(a);
      }
    });
  }

  function cur() {
    const p = core().project;
    return p && (p.appliances || []).find((a) => a.id === S.selId);
  }
  function editApply() {
    const a = cur(); if (!a) return;
    const c = core();
    const w = Number(($("#ep-pf-w") || {}).value), d = Number(($("#ep-pf-d") || {}).value);
    const watt = Number(($("#ep-pf-watt") || {}).value);
    const p3 = !!($("#ep-pf-p3") || {}).checked;
    c.commit();
    if (Number.isFinite(w) && w >= 10) a.w = w;
    if (Number.isFinite(d) && d >= 10) a.d = d;
    if (a.kind === "appl") {
      if (Number.isFinite(watt) && watt >= 0) a.watt = watt;
      a.phases = p3 ? 3 : 1;
    }
    c.persist("appl-edit");
    rooms().renderScene();
    openEditor(a);
  }

  document.addEventListener("click", (e) => {
    if (!rooms() || !rooms().isActive()) return;
    const t = e.target; let el;
    if ((el = t.closest("[data-pf-kind]"))) { S.kind = el.getAttribute("data-pf-kind") === "appl" ? "appl" : "furn"; S.catId = (CATALOG[S.kind][0] || {}).id; sheetPalette(true); return; }
    if ((el = t.closest("[data-pf-cat]"))) {
      S.catId = el.getAttribute("data-pf-cat");
      sheetPalette(true);
      if (rooms().collapseSheet) rooms().collapseSheet(); // как палитра точек: свернуть и ставить
      return;
    }
    if ((el = t.closest("[data-pf-rot]"))) {
      const a = cur(); if (!a) return;
      const c = core(); c.commit();
      a.rot = ((a.rot || 0) + Number(el.getAttribute("data-pf-rot")) + 360) % 360;
      c.persist("appl-rot"); rooms().renderScene(); openEditor(a); return;
    }
    if ((el = t.closest("[data-pf-circ]"))) {
      const a = cur(); if (!a) return;
      const c = core(); c.commit();
      a.circuitId = el.getAttribute("data-pf-circ") || null;
      c.persist("appl-circ"); rooms().renderScene(); openEditor(a); return;
    }
    if ((el = t.closest("[data-pf-el]"))) {
      const a = cur(); if (!a) return;
      const c = core(), p = c.project;
      const pe = (p.elements || []).find((x) => x.id === el.getAttribute("data-pf-el"));
      c.commit();
      a.elementId = a.elementId === (pe && pe.id) ? null : (pe ? pe.id : null);
      // линия питания подтягивается с точки — чтобы не задавать её дважды
      if (a.elementId && pe && pe.circuitId) a.circuitId = pe.circuitId;
      c.persist("appl-link"); rooms().renderScene(); openEditor(a); return;
    }
    if (t.closest("[data-pf-apply]")) { editApply(); return; }
    if (t.closest("[data-pf-dup]")) {
      const a = cur(); if (!a) return;
      const c = core(), p = c.project;
      c.commit();
      const cp = JSON.parse(JSON.stringify(a));
      cp.id = c.uid("ap"); cp.x += 30; cp.y += 30;
      p.appliances.push(cp);
      c.persist("appl-dup"); S.selId = cp.id; rooms().renderScene(); openEditor(cp); return;
    }
    if (t.closest("[data-pf-del]")) {
      const a = cur(); if (!a) return;
      const c = core(), p = c.project;
      c.commit();
      p.appliances = (p.appliances || []).filter((x) => x.id !== a.id);
      c.persist("appl-del"); S.selId = null;
      rooms().closeSheet(); rooms().renderScene(); return;
    }
  });

  EP.Plan = EP.Plan || {};
  EP.Plan.Furniture = {
    CATALOG, byId, needFor, corners, hitAt, placeAt, openEditor, onModeEnter, sheetPalette,
    selectedId: () => S.selId, deselect: () => { S.selId = null; },
    setKind: (k) => { S.kind = k === "appl" ? "appl" : "furn"; },
    setCat: (id) => { if (byId(id)) S.catId = id; }
  };
})();
