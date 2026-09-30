/* Electric Pro V29 — Проект квартиры: проверки норм (Слой 6).
   Редактируемые пороги (хранятся в settings.rules проекта) + живые
   предупреждения: точки с проблемами подсвечиваются на плане. */
(() => {
  "use strict";
  window.EP = window.EP || {};

  // Дефолтные пороги — переопределяются в settings.rules проекта
  const RULES_DEFAULTS = {
    wetMinSocketH: 60,   // см: мин. высота розетки во влажной зоне
    minSocketH: 5,       // см: розетка ниже — подозрительно
    maxDeviceH: 250,     // см: выше — проверь
    needLightPerRoom: 1, // 1 = предупреждать, если в комнате нет света
    needPanel: 1,        // 1 = предупреждать, если есть точки, но нет щита
    // — нормы по линиям (ПУЭ, упрощённо) —
    rcdRequired: 1,           // розеточные/влажные группы должны быть под УЗО
    maxSocketsPerCircuit: 8,  // макс. розеток на одну линию (16А)
    separateHeavy: 1,         // мощные (кондиц./тёплый пол) — отдельной линией
    cableCheck: 1             // сечение кабеля под номинал автомата
  };
  // макс. автомат (А) под сечение медного кабеля, мм²
  const CABLE_AMP = { "1.5": 10, "2.5": 16, "4": 25, "6": 32, "10": 50, "16": 63 };
  const HEAVY_LAYERS = { ac: 1, warm: 1 };
  function sectionOf(cable) { const m = String(cable || "").match(/[×xX](\d+(?:\.\d+)?)/); return m ? parseFloat(m[1]) : null; }
  function circuitSockets(p, c) {
    let n = 0;
    (p.elements || []).forEach((e) => {
      if (e.circuitId !== c.id) return;
      if (e.type === "block") ((e.params && e.params.items) || []).forEach((it) => { if (it === "socket") n++; });
      else if (e.type === "socket") n++;
    });
    return n;
  }
  const T = {
    title: "Проверки", close: "Закрыть", ok: "Замечаний нет ✓", save: "Сохранить пороги",
    wet: (h, min) => `Розетка во влажной зоне на ${h} см (мин. ${min} см)`,
    low: (h) => `Точка слишком низко: ${h} см`,
    high: (h) => `Точка слишком высоко: ${h} см`,
    offWall: "Точка за пределами стены",
    inOpening: "Точка попадает в дверной/оконный проём",
    noLight: (r) => `«${r}»: нет света`,
    noPanel: "Есть точки, но нет щита — трассы не построить",
    needRcd: (q) => `${q}: розетки без УЗО — по ПУЭ нужна защита 30 мА`,
    rcdWeak: (g, a, br) => `${g}: номинал ${a}A ниже автомата своей линии (${br}A) — возьми УЗО не меньше ${br}A`,
    rcdSplit: (g) => `${g}: линии этого УЗО назначены в разные щиты — одно УЗО стоит в одном щите`,
    heavySep: (q) => `${q}: мощный потребитель смешан с другими — выдели отдельную линию`,
    tooMany: (q, n, m) => `${q}: розеток ${n} на одной линии (реком. ≤ ${m})`,
    thinCable: (q, s, br) => `${q}: кабель ${s} мм² мал для автомата ${br}A`,
    rgb24: (q) => `${q}: укажи тип 24В-линии — монохром или RGB (от этого зависит кабель «от щита»: 2 жилы против 5). Кнопки в «🧮 Расчёт» → «По линиям (QF)»`,
    labels: {
      wetMinSocketH: "Мин. высота розетки во влажной зоне, см",
      minSocketH: "Мин. высота точки, см",
      maxDeviceH: "Макс. высота точки, см",
      maxSocketsPerCircuit: "Макс. розеток на линию"
    }
  };

  const esc = (s) => String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const $ = (sel, r) => (r || document).querySelector(sel);
  const core = () => EP.Plan.Core;
  const G = () => EP.Plan.Geometry;
  const rooms = () => EP.Plan.Rooms;

  function rules(p) { return Object.assign({}, RULES_DEFAULTS, (p.settings && p.settings.rules) || {}); }

  // ---------- прогон проверок ----------
  function run(p) {
    const R = rules(p), issues = [], badIds = new Set();
    const wetRooms = new Set((p.rooms || []).filter((r) => (r.zones || []).indexOf("wet") >= 0).map((r) => r.id));

    (p.elements || []).forEach((el) => {
      if (el.status === "existing" || el.type === "junction") return;
      const roomId = el.wallId ? String(el.wallId).split(":")[0] : null;
      if (el.wallId) {
        const w = G().wallById(p, el.wallId);
        if (!w) { issues.push({ id: el.id, msg: T.offWall }); badIds.add(el.id); return; }
        if (el.offset > w.len) { issues.push({ id: el.id, msg: T.offWall }); badIds.add(el.id); }
      }
      const carriesSocket = el.type === "socket" ||
        (el.type === "block" && ((el.params && el.params.items) || []).indexOf("socket") >= 0);
      if (carriesSocket && roomId && wetRooms.has(roomId) && el.height < R.wetMinSocketH) {
        issues.push({ id: el.id, msg: T.wet(Math.round(el.height), R.wetMinSocketH) }); badIds.add(el.id);
      }
      if (el.wallId) {
        const inOpening = (p.openings || []).some((o) => o.wallId === el.wallId && el.offset >= o.offset && el.offset <= o.offset + o.width);
        if (inOpening) { issues.push({ id: el.id, msg: T.inOpening }); badIds.add(el.id); }
      }
      if (el.type !== "warmfloor" && el.height < R.minSocketH) {
        issues.push({ id: el.id, msg: T.low(Math.round(el.height)) }); badIds.add(el.id);
      }
      // «слишком высоко» — только для НАСТЕННЫХ устройств (el.wallId): у них высота
      // установки реальна и не должна лезть выше maxDeviceH. Свободные потолочные точки
      // (свет/трек/вывод без wallId) по определению стоят на высоте потолка
      // (defaultHeight = settings.ceilingHeight, обычно 270) — иначе ПЕРВЫЙ же
      // потолочный светильник в любом проекте давал ложное «Точка слишком высоко».
      if (el.wallId && el.height > R.maxDeviceH) {
        issues.push({ id: el.id, msg: T.high(Math.round(el.height)) }); badIds.add(el.id);
      }
    });

    if (R.needLightPerRoom) {
      (p.rooms || []).forEach((r) => {
        if ((r.points || []).length < 3) return;
        const has = G().elementsInRoom(p, r.id).some((e) => e.type === "light" || e.type === "switch");
        if (!has) issues.push({ roomId: r.id, msg: T.noLight(r.name) });
      });
    }
    if (R.needPanel && (p.elements || []).length && !(p.panels || []).length) issues.push({ msg: T.noPanel });

    // — нормы по линиям (ПУЭ) —
    (p.circuits || []).forEach((c) => {
      const els = (p.elements || []).filter((e) => e.circuitId === c.id && e.status !== "existing" && e.type !== "junction");
      if (!els.length) return;
      const socketN = circuitSockets(p, c);
      const hasSocket = socketN > 0;
      const heavy = els.filter((e) => HEAVY_LAYERS[e.layer] || e.type === "ac" || e.type === "warmfloor");
      const hasHeavy = heavy.length > 0;
      const others = els.length - heavy.length;
      const wet = els.some((e) => { const rid = e.wallId ? String(e.wallId).split(":")[0] : null; return rid && wetRooms.has(rid); });
      if (R.rcdRequired && (hasSocket || wet) && !c.rcd) issues.push({ circuitId: c.id, msg: T.needRcd(c.name) });
      if (R.separateHeavy && hasHeavy && others > 0) issues.push({ circuitId: c.id, msg: T.heavySep(c.name) });
      if (R.maxSocketsPerCircuit && (c.breaker || 16) >= 16 && socketN > R.maxSocketsPerCircuit) issues.push({ circuitId: c.id, msg: T.tooMany(c.name, socketN, R.maxSocketsPerCircuit) });
      if (R.cableCheck && c.cable) { const s = sectionOf(c.cable), max = CABLE_AMP[String(s)]; if (s && max && (c.breaker || 16) > max) issues.push({ circuitId: c.id, msg: T.thinCable(c.name, s, c.breaker) }); }
      // линия 24В: тип (монохром/RGB) ОБЯЗАТЕЛЕН — просьба пользователя («что нужно указать
      // обязательно на линии 24в»), от него зависит кабель «от щита до точки» (2 или 5 жил).
      // Пока не указано, смета считает как монохром — поэтому это подсказка, а не блокировка.
      if (c.rgb == null && els.every((e) => e.type === "output24")) issues.push({ circuitId: c.id, msg: T.rgb24(c.name) });
    });

    // — групповые УЗО (движок цепей): номинал УЗО не ниже автомата любой его линии
    // (иначе УЗО перегружается раньше, чем сработает автомат), и все линии одного УЗО
    // — в ОДНОМ щите (физически УЗО стоит в конкретном щите)
    const CX = EP.Plan.Circuits;
    if (CX) CX.groups(p).forEach((g) => {
      const ls = (p.circuits || []).filter((c) => c.rcdGroupId === g.id);
      if (!ls.length) return;
      const maxBr = ls.reduce((m, c) => Math.max(m, Number(c.breaker) || 0), 0);
      if ((Number(g.rating) || 0) < maxBr) issues.push({ circuitId: ls[0].id, msg: T.rcdWeak(g.name, g.rating, maxBr) });
      const pns = new Set(ls.map((c) => { const r = CX.panelOf(p, c); return r.panel ? r.panel.id : ""; }));
      if (pns.size > 1) issues.push({ circuitId: ls[0].id, msg: T.rcdSplit(g.name) });
    });

    // — СЛАБОТОЧКА: датчики протечки / камеры / датчики движения-освещённости —
    const leaks = (p.elements || []).filter((e) => e.type === "leak" && e.status !== "existing");
    if (leaks.length && !(p.panels || []).some((pn) => pn.neptun)) {
      issues.push({ msg: `Датчики протечки (${leaks.length}) есть, но ни один щит не помечен как контроллер «Нептун» — трассы пойдут в обычный слаботочный щит.` });
    }
    const cams = (p.elements || []).filter((e) => e.type === "camera" && e.status !== "existing");
    if (cams.length) {
      if (!(p.panels || []).some((pn) => pn.router)) {
        issues.push({ msg: `Камеры (${cams.length}) есть, но нет слаботочного щита (галочка «Роутер» у щита) — им некуда идти отдельными линиями.` });
      }
      // каждая камера — СВОЕЙ линией (просьба пользователя): ловим общие/пустые линии
      const byCirc = new Map();
      cams.forEach((e) => { const k = e.circuitId || "_none"; byCirc.set(k, (byCirc.get(k) || 0) + 1); });
      const shared = [...byCirc.entries()].filter(([k, n]) => k === "_none" || n > 1);
      if (shared.length) issues.push({ msg: "Камеры должны идти отдельными линиями: есть камеры без линии или несколько на одной." });
    }
    /* Цепочка проходных/перекрёстных. Питание в цепочке приходит ТОЛЬКО в первое звено —
       трассировка теперь это знает (chainPrevMap в plan-routes.js), но она же молча
       игнорирует ДВА случая, которые пользователь может собрать кнопками и не заметить:
       (1) цепочка замкнута сама на себя (A→B→A) — головы нет, питать неоткуда;
       (2) у последнего звена не назначена лампа — цепочка никуда не ведёт.
       Про них честно говорим здесь, а не «чиним» догадкой. */
    {
      const sws = (p.elements || []).filter((e) => e.type === "switch");
      const byId = new Map(sws.map((e) => [e.id, e]));
      const inChain = new Set();
      sws.forEach((e) => { if (e.chainNext && byId.has(e.chainNext)) inChain.add(e.chainNext); });
      sws.forEach((e) => {
        if (!e.chainNext && !inChain.has(e.id)) return;           // одиночный выключатель
        const seen = new Set([e.id]);
        let cur = byId.get(e.chainNext);
        while (cur && !seen.has(cur.id)) { seen.add(cur.id); cur = byId.get(cur.chainNext); }
        if (cur) {
          issues.push({ id: e.id, msg: "Цепочка проходных замкнута сама на себя — питать её неоткуда, поправь «следующее звено»." });
          badIds.add(e.id);
          return;
        }
        // последнее звено (chainNext пуст) обязано вести к лампе — иначе цепочка вникуда
        if (!e.chainNext) {
          const tid = (G().allTargetIds ? G().allTargetIds(e) : [])[0];
          const auto = G().switchTarget ? G().switchTarget(p, e, 0) : null;
          if (!tid && !auto) { issues.push({ id: e.id, msg: "Последнее звено цепочки проходных ни на что не назначено — свет включать нечем." }); badIds.add(e.id); }
        }
      });
    }
    (p.elements || []).forEach((e) => {
      if (e.type !== "pir" && e.type !== "lux") return;
      const tid = (G().allTargetIds ? G().allTargetIds(e) : [])[0]; // цель может быть массивом (несколько на клавишу)
      const auto = G().switchTarget ? G().switchTarget(p, e, 0) : null;
      if (!tid && !auto) { issues.push({ id: e.id, msg: `${e.type === "pir" ? "Датчик движения" : "Датчик освещённости"}: не назначена лампа/подсветка.` }); badIds.add(e.id); }
    });

    // — БЫТОВАЯ ТЕХНИКА (p.appliances, kind:"appl") —
    // просьба пользователя: «по технике понятно какая нагрузка, и какой провод нужен».
    // Считаем по мощности прибора (plan-furniture.js needFor: ток → автомат → сечение) и
    // сверяем с ЛИНИЕЙ, на которую его посадили: тонкий кабель, слабый автомат, отсутствие
    // УЗО у мокрой/мощной техники, отсутствие точки питания, чужая компания на своей линии.
    const FN = EP.Plan.Furniture;
    if (FN && FN.needFor) {
      (p.appliances || []).forEach((a) => {
        if (a.kind !== "appl") return;
        const nd = FN.needFor(a);
        if (!nd) return;
        const nm = a.name || ((FN.byId(a.catId) || {}).name) || "Прибор";
        if (!a.elementId) issues.push({ applId: a.id, msg: `${nm}: не указана точка питания (розетка/вывод).` });
        const c = (p.circuits || []).find((x) => x.id === a.circuitId);
        if (!c) { issues.push({ applId: a.id, msg: `${nm} (${(nd.watt / 1000).toFixed(1)} кВт, ${nd.amps} А): не назначена линия. Нужен кабель ${nd.cable}, автомат ${nd.breaker}A${nd.rcd ? " + УЗО" : ""}.` }); return; }
        if ((c.breaker || 16) < nd.breaker) issues.push({ circuitId: c.id, applId: a.id, msg: `${nm}: автомат ${c.breaker || 16}A мал под ${nd.amps} А — нужен ${nd.breaker}A.` });
        const sec = c.cable ? sectionOf(c.cable) : null;
        const needSec = parseFloat(String(nd.cable).split("×")[1]);
        if (sec && needSec && sec < needSec) issues.push({ circuitId: c.id, applId: a.id, msg: `${nm}: кабель ${c.cable} тонкий — нужен ${nd.cable}.` });
        if (nd.rcd && !c.rcd) issues.push({ circuitId: c.id, applId: a.id, msg: `${nm}: линия ${c.name} без УЗО (мокрая зона / мощный прибор).` });
        if (nd.own) {
          const others = (p.appliances || []).filter((b) => b.kind === "appl" && b.id !== a.id && b.circuitId === c.id).length;
          const pts = (p.elements || []).filter((e) => e.circuitId === c.id && e.status !== "existing" && e.type !== "junction").length;
          if (others > 0 || pts > 2) issues.push({ circuitId: c.id, applId: a.id, msg: `${nm}: должен быть на ОТДЕЛЬНОЙ линии (сейчас на ${c.name} ещё ${others + Math.max(0, pts - 1)} потребителей).` });
        }
      });
    }

    // — ЭТАЖИ И СТОЯКИ (Этажи, Этап 2) —
    // Проверяем ровно две вещи, которые молча оставляют этаж без трасс: стояк без пары
    // (односторонняя ссылка ничего не питает — см. riserPairs в plan-routes.js) и этаж,
    // на котором есть точки, но нет ни щита, ни стояка-приёмника.
    if ((p.floors || []).length > 1) {
      const RT = EP.Plan.Routes;
      const nameF = (fid) => ((p.floors || []).find((f) => f.id === fid) || {}).name || "этаж";
      (p.elements || []).forEach((el) => {
        if (el.type !== "riser") return;
        const m = el.riserLink ? (p.elements || []).find((x) => x.id === el.riserLink) : null;
        if (!m || m.type !== "riser" || m.riserLink !== el.id) {
          issues.push({ id: el.id, msg: `Стояк (${nameF(el.floorId)}): нет парного стояка на другом этаже — этаж по нему не питается.` });
          badIds.add(el.id);
        }
      });
      (p.floors || []).forEach((f) => {
        const pts = (p.elements || []).filter((e) => e.floorId === f.id && e.status !== "existing" && e.type !== "junction" && e.type !== "riser");
        if (!pts.length) return;
        if ((p.panels || []).some((pn) => pn.floorId === f.id)) return;
        const sinks = (RT && RT.sinkRisersOn) ? RT.sinkRisersOn(p, f.id) : [];
        if (!sinks.length) issues.push({ msg: `${f.name}: нет щита и нет связанного стояка «СТ» — трассы на этом этаже не построятся.` });
      });
    }

    return { issues, badIds };
  }
  // подсветка проблемных точек — зовётся на КАЖДЫЙ рендер сцены, поэтому через мемо-кэш
  // (runCached ниже: сбрасывается на любое изменение проекта)
  function badSet() {
    const p = core().project;
    return p ? runCached(p).badIds : new Set();
  }

  // ---------- ПРОВЕРКА ПРОЕКТА (🔍): отчёт «✓ пройдено / ⚠ проблема» ----------
  // К замечаниям run() добавляются ПОЛОЖИТЕЛЬНЫЕ пункты (что уже в порядке — мастеру важно
  // видеть и это перед монтажом) и проверки полноты: помещения без точек, точки без линии,
  // точки без трассы, влажные по имени без отметки зоны, свободные модули щита. У каждого
  // замечания — ссылка ref {kind:"el"|"room"|"circuit"|"appl"|"panel", id}: тап ведёт к объекту.
  const NOT_POINT = { junction: 1, riser: 1, panel: 1, door: 1, window: 1 };
  const WET_NAME = /ванн|санузел|с\/у|туалет|уборн|душ|сауна/i;
  function report(p) {
    const res = runCached(p);
    const passed = [], issues = [];
    const tname = (t) => { const X = EP.Plan.Elements && EP.Plan.Elements.TYPES; return (X && X[t] && X[t].name) || t; };
    const refOf = (i) => i.id ? { kind: "el", id: i.id } : i.applId ? { kind: "appl", id: i.applId } : i.circuitId ? { kind: "circuit", id: i.circuitId } : i.roomId ? { kind: "room", id: i.roomId } : null;
    res.issues.forEach((i) => issues.push({ level: "warn", msg: i.msg, ref: refOf(i) }));
    const pts = (p.elements || []).filter((e) => !NOT_POINT[e.type] && e.status !== "existing");
    const cIds = new Set((p.circuits || []).map((c) => c.id));
    // 1. помещения с точками
    const emptyRooms = (p.rooms || []).filter((r) => (r.points || []).length >= 3 && !G().elementsInRoom(p, r.id).length);
    if (!(p.rooms || []).length) issues.push({ level: "err", msg: "Нет ни одного помещения — нарисуй комнаты (▭ / ⬠)." });
    else if (emptyRooms.length) emptyRooms.forEach((r) => issues.push({ level: "warn", msg: `«${r.name}»: в помещении нет ни одной точки.`, ref: { kind: "room", id: r.id } }));
    else passed.push("Во всех помещениях есть точки");
    // 2. высоты
    const noH = pts.filter((e) => !Number.isFinite(e.height));
    if (!noH.length && pts.length) passed.push("У всех точек задана высота");
    noH.forEach((e) => issues.push({ level: "err", msg: `${tname(e.type)}: не задана высота установки.`, ref: { kind: "el", id: e.id } }));
    // 3. линии
    const noLine = pts.filter((e) => !e.circuitId || !cIds.has(e.circuitId));
    if (pts.length && !noLine.length) passed.push(`Все точки на линиях (${pts.length})`);
    noLine.slice(0, 30).forEach((e) => issues.push({ level: "err", msg: `${tname(e.type)}: линия не назначена.`, ref: { kind: "el", id: e.id } }));
    if (noLine.length > 30) issues.push({ level: "err", msg: `…и ещё ${noLine.length - 30} точек без линии — «⚡ Сформировать проект» разложит их разом.` });
    const cs = p.circuits || [];
    if (cs.length) {
      if (cs.every((c) => Number(c.breaker) > 0)) passed.push(`У всех линий есть автомат (${cs.length})`);
      const SC = EP.Plan.Scheme;
      if (cs.every((c) => c.cable || (SC && SC.autoCable && SC.autoCable(p, c)))) passed.push("У всех линий определён кабель");
    }
    // 4. трассы
    const routes = p.routes || [];
    if (pts.length && !routes.length) issues.push({ level: "warn", msg: "Трассы не построены — «🧵 Трассы» → «⚡ Построить»." });
    else if (routes.length) {
      const from = new Set(routes.map((r) => r.fromId));
      const noRoute = pts.filter((e) => !from.has(e.id) && e.circuitId);
      if (!noRoute.length) passed.push(`Все точки соединены трассами (${routes.length})`);
      noRoute.slice(0, 20).forEach((e) => issues.push({ level: "warn", msg: `${tname(e.type)}: нет трассы до щита.`, ref: { kind: "el", id: e.id } }));
      const RT = EP.Plan.Routes;
      if (RT && RT.sleeveHoles) { try { passed.push(`Проходки рассчитаны: ${RT.sleeveHoles(p)} отв.`); } catch (e) {} }
    }
    // 5. влажные помещения по имени, но без отметки зоны — от неё зависят проверки УЗО/высот
    (p.rooms || []).forEach((r) => {
      if (WET_NAME.test(r.name || "") && (r.zones || []).indexOf("wet") < 0)
        issues.push({ level: "warn", msg: `«${r.name}»: отметь зону «влажная» в свойствах помещения — от неё зависят проверки УЗО и высот.`, ref: { kind: "room", id: r.id } });
    });
    // 6. щит: свободные модули в корпусе главного щита
    const CX = EP.Plan.Circuits, SCH = EP.Plan.Scheme;
    const main = CX && CX.mainPanel(p);
    if (main && cs.length && SCH && SCH.recompute) {
      try {
        const box = SCH.recompute(p);
        const need = CX.modules(p, main.id, { noReserve: true });
        const free = (box && box.modules || 0) - need;
        if (box && box.overflow) issues.push({ level: "err", msg: `Щит ${main.name}: ${need} мод. не помещаются в самый большой корпус ${box.brand} — нужен второй щит.`, ref: { kind: "panel", id: main.id } });
        else if (free < 2) issues.push({ level: "warn", msg: `Щит ${main.name}: свободно ${Math.max(0, free)} мод. — запаса почти нет.`, ref: { kind: "panel", id: main.id } });
        else passed.push(`Щит ${main.name}: корпус ${box.modules} мод., свободно ${free}`);
      } catch (e) {}
    }
    // 7. УЗО по ПУЭ — если run() не нашёл замечаний про УЗО, это тоже пройденный пункт
    if (cs.length && !res.issues.some((i) => /УЗО/.test(i.msg))) passed.push("Линии розеток и влажных зон защищены УЗО");
    if (!(p.panels || []).length && pts.length) issues.push({ level: "err", msg: "Нет щита — поставь щит (🔌 → Щит)." });
    // у замечаний про ТОЧКУ — какая и где («Розетка · Кухня: …»): иначе «Точка попадает в
    // проём» не говорит, какую из сорока точек смотреть
    const roomOfEl = (el) => {
      const rid = el.wallId && String(el.wallId).indexOf("beam:") !== 0 ? String(el.wallId).split(":")[0] : null;
      let r = rid ? (p.rooms || []).find((x) => x.id === rid) : null;
      if (!r) { const pt = G().elemPoint(p, el); r = pt ? (p.rooms || []).find((x) => (x.points || []).length >= 3 && G().pointInPolygon(pt, x.points)) : null; }
      return r ? r.name : "";
    };
    issues.forEach((i) => {
      if (!i.ref || i.ref.kind !== "el") return;
      const el = (p.elements || []).find((e) => e.id === i.ref.id); if (!el) return;
      const who = tname(el.type) + (roomOfEl(el) ? " · " + roomOfEl(el) : "");
      if (i.msg.indexOf(tname(el.type)) !== 0) i.msg = who + ": " + i.msg.charAt(0).toLowerCase() + i.msg.slice(1);
      else if (roomOfEl(el)) i.msg = who + i.msg.slice(tname(el.type).length);
    });
    // ⛔ ошибки — первыми (без них проект не собрать), дальше ⚠
    issues.sort((a, b) => (a.level === "err" ? 0 : 1) - (b.level === "err" ? 0 : 1));
    const errN = issues.filter((i) => i.level === "err").length;
    return { passed, issues, errN, warnN: issues.length - errN };
  }
  // тап по замечанию — к объекту на плане (камера + его редактор)
  function goTo(ref) {
    const p = core().project; if (!p || !ref) return false;
    const R = rooms(), E = EP.Plan.Elements;
    if (ref.kind === "el") { const el = (p.elements || []).find((e) => e.id === ref.id); if (el && E) { if (el.floorId && p.activeFloorId !== el.floorId && core().setActiveFloor) core().setActiveFloor(el.floorId); E.openEditor(el); return true; } }
    if (ref.kind === "room") { const r = (p.rooms || []).find((x) => x.id === ref.id); if (r && R.sheetRoom) { R.sheetRoom(r); return true; } }
    if (ref.kind === "panel") { const pn = (p.panels || []).find((x) => x.id === ref.id); if (pn && E && E.openPanelEditor) { E.openPanelEditor(pn); return true; } }
    if (ref.kind === "appl") { const a = (p.appliances || []).find((x) => x.id === ref.id); const F = EP.Plan.Furniture; if (a && F && F.openEditor) { F.openEditor(a); return true; } }
    if (ref.kind === "circuit") { if (R.setSoloCircuit) R.setSoloCircuit(ref.id); if (EP.Plan.Routes && EP.Plan.Routes.sheet) EP.Plan.Routes.sheet(); return true; }
    return false;
  }

  // ---------- шторка ----------
  let lastRep = null;
  function sheet() {
    const p = core().project, R = rules(p);
    const rep = report(p); lastRep = rep;
    const issueRow = (i, k) => i.ref
      ? `<button type="button" class="ep-plan-qa ep-clickable is-${i.level}" data-pl-go="${k}"><span>${i.level === "err" ? "⛔" : "⚠"} ${esc(i.msg)}</span><span class="ep-plan-qago">→</span></button>`
      : `<div class="ep-plan-qa is-${i.level}"><span>${i.level === "err" ? "⛔" : "⚠"} ${esc(i.msg)}</span></div>`;
    rooms().openSheet(`<div class="ep-plan-srow"><b>🔍 Проверка проекта</b>
        <span class="ep-plan-flex"></span><button type="button" class="ep-plan-mini ep-clickable" data-sheet-fs aria-label="Во весь экран">⛶</button><button type="button" class="ep-plan-mini ep-clickable" data-pl-close aria-label="Закрыть">✕</button></div>
      <div class="ep-plan-qasum">
        <span class="ep-plan-qachip is-ok">✓ ${rep.passed.length}</span>
        <span class="ep-plan-qachip is-warn">⚠ ${rep.warnN}</span>
        <span class="ep-plan-qachip is-err">⛔ ${rep.errN}</span>
        <span class="ep-plan-mshint">${rep.issues.length ? "тап по замечанию — к объекту на плане" : T.ok}</span>
      </div>
      ${rep.issues.length ? `<div class="ep-plan-qalist">${rep.issues.map(issueRow).join("")}</div>` : ""}
      ${rep.passed.length ? `<details class="ep-plan-qapass" ${rep.issues.length ? "" : "open"}><summary>✓ Пройдено: ${rep.passed.length}</summary>${rep.passed.map((t) => `<div class="ep-plan-qa is-ok"><span>✓ ${esc(t)}</span></div>`).join("")}</details>` : ""}
      <details class="ep-plan-qapass"><summary>⚙ Пороги проверок</summary>
      <div class="ep-plan-srow ep-plan-s2">
        ${Object.keys(T.labels).map((k) => `<label>${T.labels[k]}<input type="number" inputmode="numeric" data-pl-rule="${k}" value="${R[k]}"></label>`).join("")}
      </div>
      <div class="ep-plan-srow ep-plan-sbtns"><button type="button" class="ep-plan-tbtn ep-clickable" data-pl-save>${T.save}</button></div></details>`);
  }
  function saveRules() {
    const c = core(), p = c.project;
    c.commit();
    p.settings.rules = p.settings.rules || {};
    document.querySelectorAll("[data-pl-rule]").forEach((inp) => {
      const v = Number(inp.value);
      if (Number.isFinite(v)) p.settings.rules[inp.getAttribute("data-pl-rule")] = v;
    });
    c.persist("rules-save");
    sheet();
  }

  document.addEventListener("click", (e) => {
    if (!rooms() || !rooms().isActive()) return;
    const t = e.target;
    if (t.closest("[data-plan-checks]")) return sheet();
    if (t.closest("[data-pl-close]")) { rooms().closeSheet(); return; }
    if (t.closest("[data-pl-save]")) return saveRules();
    const go = t.closest("[data-pl-go]");
    if (go && lastRep) { const i = lastRep.issues[Number(go.getAttribute("data-pl-go"))]; if (i && i.ref) goTo(i.ref); return; }
  });

  EP.Plan = EP.Plan || {};
  // ---------- МЕМО-КЭШ проверок ----------
  // run(p) — чистая функция от проекта (12мс на стресс-проекте при CPU ×8), а шторка
  // «Проверки» и подсветка проблемных точек (badSet) зовут её на каждый рендер. Кэш
  // сбрасывается на ЛЮБОЕ изменение проекта; фоновый предрасчёт из воркера
  // (plan-routes.js prefetchEstimate) наполняет его заранее — шторка открывается без счёта.
  let memo = null, memoTok = 0;
  function runCached(p) {
    if (memo) return memo;
    memo = run(p);
    return memo;
  }
  function setPrefetched(tok, res) {
    if (tok !== memoTok || !res) return false;
    memo = res;
    return true;
  }
  if (core().onChange) core().onChange(() => { memo = null; memoTok++; });

  EP.Plan.Rules = { run, runCached, report, goTo, rules, badSet, sheet, RULES_DEFAULTS, setPrefetched, memoToken: () => memoTok };
})();
