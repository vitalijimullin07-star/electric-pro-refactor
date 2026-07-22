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
    });

    return { issues, badIds };
  }
  // кэш для рендера (пересчитывается при каждом draw — объёмы малые)
  function badSet() {
    const p = core().project;
    return p ? run(p).badIds : new Set();
  }

  // ---------- шторка ----------
  function sheet() {
    const p = core().project, R = rules(p);
    const { issues } = run(p);
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
  EP.Plan.Rules = { run, rules, badSet, sheet, RULES_DEFAULTS };
})();
