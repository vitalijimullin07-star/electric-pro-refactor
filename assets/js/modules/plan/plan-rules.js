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

    return { issues, badIds };
  }
  // подсветка проблемных точек — зовётся на КАЖДЫЙ рендер сцены, поэтому через мемо-кэш
  // (runCached ниже: сбрасывается на любое изменение проекта)
  function badSet() {
    const p = core().project;
    return p ? runCached(p).badIds : new Set();
  }

  // ---------- шторка ----------
  function sheet() {
    const p = core().project, R = rules(p);
    const { issues } = runCached(p);
    rooms().openSheet(`<div class="ep-plan-srow"><b>✅ ${T.title}</b>
        <span class="ep-plan-flex"></span><button type="button" class="ep-plan-mini ep-clickable" data-sheet-fs aria-label="Во весь экран">⛶</button><button type="button" class="ep-plan-mini ep-clickable" data-pl-close>✕</button></div>
      ${issues.length
        ? `<div class="ep-plan-items">${issues.map((i) => `<div class="ep-plan-irow ep-plan-warnrow"><span>⚠ ${esc(i.msg)}</span></div>`).join("")}</div>`
        : `<div class="ep-plan-srow">${T.ok}</div>`}
      <div class="ep-plan-srow ep-plan-s2">
        ${Object.keys(T.labels).map((k) => `<label>${T.labels[k]}<input type="number" inputmode="numeric" data-pl-rule="${k}" value="${R[k]}"></label>`).join("")}
      </div>
      <div class="ep-plan-srow ep-plan-sbtns"><button type="button" class="ep-plan-tbtn ep-clickable" data-pl-save>${T.save}</button></div>`);
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

  EP.Plan.Rules = { run, runCached, rules, badSet, sheet, RULES_DEFAULTS, setPrefetched, memoToken: () => memoTok };
})();
