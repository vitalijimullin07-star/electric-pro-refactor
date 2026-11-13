/* Electric Pro V29 — Проект квартиры: «СФОРМИРОВАТЬ ПРОЕКТ» (EP.Plan.AutoProject).
   Из расставленных точек и подключённой техники предлагает электросистему:
   линии (QF) с номиналами автоматов, защитой УЗО (групповые / свои дифы) и описанием —
   мастер смотрит предложение, при желании правит и принимает одной кнопкой.
   Правила (типовая практика квартирной электрики, а не норматив — всё правится потом):
   · розетки кухни — своя линия (по N розеток на линию), 16A;
   · розетки влажных помещений (ванная/санузел/душ или зона «влажная») — своя линия
     на помещение со своим дифом 30 мА;
   · розетки остальных комнат — соседние комнаты вместе, пока розеток на линии не больше
     порога из «Проверок» (maxSocketsPerCircuit, по умолчанию 8), 16A; такие линии по 3
     под одно групповое УЗО 40A 30 мА;
   · техника с ОТДЕЛЬНОЙ линией (холодильник, ПММ, духовка, варочная…) и её точка питания
     — своя линия по мощности прибора (EP.Plan.Furniture.needFor — те же номиналы, что
     показывает редактор техники), УЗО — если прибор мокрый/мощный;
   · кондиционер, тёплый пол, вывод, вывод 3ф — каждая точка своей линией;
   · свет — соседние комнаты вместе, до LIGHT_MAX точек на линию, 10A (кабель 3×1.5
     автоподбором); выключатели и датчики садятся на линию того света, которым управляют;
   · 24В — линия на помещение; интернет/ТВ/камеры — каждая точка своей линией к роутеру
     (так их и тянут); датчики протечки — одной линией к «Нептуну».
   Модуль НЕ трогает трассы сам — после применения их перестраивает обычная
   автоперестройка ("autoproject" в AUTOREBUILD_ON), если трассы уже были. */
(() => {
  "use strict";
  window.EP = window.EP || {};
  EP.Plan = EP.Plan || {};
  const core = () => EP.Plan.Core;
  const G = () => EP.Plan.Geometry;
  const rooms = () => EP.Plan.Rooms;
  const esc = (s) => String(s == null ? "" : s).replace(/[&<>"']/g, (m) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[m]);
  const $ = (sel, r) => (r || document).querySelector(sel);

  const LIGHT_MAX = 15;       // точек света на линию 10A
  const RCD_GROUP_LINES = 3;  // розеточных линий под одним групповым УЗО
  const WET_RE = /ванн|санузел|с\/у|туалет|уборн|душ|сауна|бассейн|постирочн/i;
  const KITCHEN_RE = /кухн|кухон/i;
  const SKIP = { junction: 1, riser: 1, panel: 1, door: 1, window: 1 };
  const LIGHTS = { light: 1, bra: 1, track: 1 };
  const SWITCHES = { switch: 1, pir: 1, lux: 1 };

  const S = { mode: "free", last: null }; // mode: "free" — только точки без линии, "all" — пересобрать всё

  // ---- помещение точки ----
  function roomOf(p, el) {
    if (el.wallId && String(el.wallId).indexOf("beam:") !== 0) {
      const rid = String(el.wallId).split(":")[0];
      const r = (p.rooms || []).find((x) => x.id === rid);
      if (r) return r;
    }
    const pt = G().elemPoint(p, el);
    if (!pt) return null;
    return (p.rooms || []).find((r) => (r.points || []).length >= 3 && G().pointInPolygon(pt, r.points)) || null;
  }
  const isWet = (r) => !!r && (((r.zones || []).indexOf("wet") >= 0) || WET_RE.test(r.name || ""));
  const isKitchen = (r) => !!r && KITCHEN_RE.test(r.name || "");
  const centroid = (r) => {
    const pts = r.points || []; if (!pts.length) return { x: 0, y: 0 };
    return { x: pts.reduce((s, q) => s + q.x, 0) / pts.length, y: pts.reduce((s, q) => s + q.y, 0) / pts.length };
  };
  // порядок обхода комнат: от главного щита «ближайшая следующая» — так в одну линию
  // попадают СОСЕДНИЕ комнаты, а не случайные по порядку рисования
  function roomTour(p, list) {
    const CX = EP.Plan.Circuits;
    const main = CX ? CX.mainPanel(p) : (p.panels || [])[0];
    let cur = main ? { x: main.x, y: main.y } : { x: 0, y: 0 };
    const left = list.slice(), out = [];
    while (left.length) {
      let bi = 0, bd = Infinity;
      left.forEach((r, i) => { const c = centroid(r); const d = Math.hypot(c.x - cur.x, c.y - cur.y); if (d < bd - 1e-6) { bd = d; bi = i; } });
      const r = left.splice(bi, 1)[0]; out.push(r); cur = centroid(r);
    }
    return out;
  }
  const socketCount = (el) => el.type === "block" ? ((el.params && el.params.items) || []).filter((t) => t === "socket").length : (el.type === "socket" ? 1 : 0);
  const tname = (el) => { const T = EP.Plan.Elements && EP.Plan.Elements.TYPES; return (T && T[el.type] && T[el.type].name) || el.type; };

  // ---- ПРЕДЛОЖЕНИЕ (чистая функция: проект не меняет) ----
  function propose(p, mode) {
    mode = mode === "all" ? "all" : "free";
    const cIds = new Set((p.circuits || []).map((c) => c.id));
    const free = (el) => mode === "all" || !el.circuitId || !cIds.has(el.circuitId);
    const maxSock = ((p.settings && p.settings.rules && p.settings.rules.maxSocketsPerCircuit) || 8);
    const F = EP.Plan.Furniture;
    const applByEl = new Map();
    (p.appliances || []).forEach((a) => { if (a.kind === "appl" && a.elementId) applByEl.set(a.elementId, a); });

    const lines = [], groups = [];
    const bucket = { light: new Map(), sock: new Map(), wet: new Map(), v24: new Map() };
    const add = (m, r, el) => { const k = r ? r.id : "_"; if (!m.has(k)) m.set(k, { room: r, els: [] }); m.get(k).els.push(el); };
    const switches = [];
    const leaks = [];
    const lineOf = new Map(); // el.id -> line (для выключателей)
    const mk = (o) => { const ln = Object.assign({ prot: "none", poles: 1, elIds: [], rooms: [] }, o); lines.push(ln); return ln; };
    let skipped = 0;
    (p.elements || []).forEach((el) => {
      if (SKIP[el.type] || el.status === "existing") return;
      // блок только из ТВ/интернета: у его постов свои кабели к роутеру без линии (пакет 3)
      if (el.type === "block" && !((el.params && el.params.items) || []).some((t) => t === "socket" || t === "switch")) return;
      if (!free(el)) { skipped++; return; }
      const r = roomOf(p, el);
      const rn = r ? r.name : "";
      const appl = applByEl.get(el.id);
      const nd = appl && F && F.needFor ? F.needFor(appl) : null;
      if (SWITCHES[el.type]) { switches.push({ el, r }); return; }
      if (LIGHTS[el.type]) { add(bucket.light, r, el); return; }
      if (el.type === "output24") { add(bucket.v24, r, el); return; }
      if (el.type === "leak") { leaks.push(el); return; }
      if (el.type === "internet" || el.type === "sensor" || el.type === "intercom") { mk({ prefix: "Int", kind: "lv", title: `${tname(el)}${rn ? " · " + rn : ""}`, breaker: 6, elIds: [el.id], rooms: [rn] }); return; }
      if (el.type === "tv") { mk({ prefix: "TV", kind: "lv", title: `ТВ${rn ? " · " + rn : ""}`, breaker: 6, elIds: [el.id], rooms: [rn] }); return; }
      if (el.type === "camera") { mk({ prefix: "CCTV", kind: "lv", title: `Камера${rn ? " · " + rn : ""}`, breaker: 6, elIds: [el.id], rooms: [rn] }); return; }
      // техника со своей линией — по мощности прибора
      if (nd && nd.own) {
        mk({ prefix: "QF", kind: "ded", title: `${appl.name || (F.byId(appl.catId) || {}).name || "Прибор"}${rn ? " · " + rn : ""}`,
          breaker: nd.breaker, poles: appl.phases === 3 ? 3 : 1, prot: nd.rcd ? "own" : "none", elIds: [el.id], rooms: [rn], applId: appl.id });
        return;
      }
      if (el.type === "ac") { mk({ prefix: "QF", kind: "ded", title: `Кондиционер${rn ? " · " + rn : ""}`, breaker: 16, elIds: [el.id], rooms: [rn] }); return; }
      if (el.type === "warmfloor") { mk({ prefix: "QF", kind: "ded", title: `Тёплый пол${rn ? " · " + rn : ""}`, breaker: 16, prot: "own", elIds: [el.id], rooms: [rn] }); return; }
      if (el.type === "output3") { mk({ prefix: "QF", kind: "ded", title: `Вывод 3ф${rn ? " · " + rn : ""}`, breaker: 25, poles: 3, elIds: [el.id], rooms: [rn] }); return; }
      if (el.type === "output") {
        mk({ prefix: "QF", kind: "ded", title: `${nd ? (appl.name || "Прибор") : "Вывод"}${rn ? " · " + rn : ""}`, breaker: nd ? nd.breaker : 16,
          prot: nd && nd.rcd ? "own" : (isWet(r) ? "own" : "none"), elIds: [el.id], rooms: [rn] });
        return;
      }
      if (socketCount(el) > 0 || el.type === "socket" || el.type === "block") {
        if (isWet(r)) add(bucket.wet, r, el); else add(bucket.sock, r, el);
        return;
      }
      // прочее силовое без правила — к розеткам своей комнаты
      add(bucket.sock, r, el);
    });

    // розетки кухни — отдельно, остальные комнаты — туром от щита
    const sockRooms = [...bucket.sock.values()];
    const kitchen = sockRooms.filter((b) => isKitchen(b.room));
    const others = roomTour(p, sockRooms.filter((b) => !isKitchen(b.room) && b.room).map((b) => b.room)).map((r) => bucket.sock.get(r.id));
    const noRoom = bucket.sock.get("_");
    const sockLines = [];
    const chunk = (els, title, rooms) => {
      let cur = null;
      els.forEach((el) => {
        const n = Math.max(1, socketCount(el));
        if (!cur || (cur.n + n > maxSock && cur.n > 0)) { cur = mk({ prefix: "QF", kind: "sock", title, breaker: 16, rooms: rooms.slice() }); cur.n = 0; sockLines.push(cur); }
        cur.elIds.push(el.id); cur.n += n;
      });
    };
    kitchen.forEach((b) => chunk(b.els, `Розетки: ${b.room.name}`, [b.room.name]));
    // соседние комнаты вместе, пока помещается
    let cur = null;
    others.concat(noRoom ? [noRoom] : []).forEach((b) => {
      const n = b.els.reduce((s, el) => s + Math.max(1, socketCount(el)), 0);
      const rn = b.room ? b.room.name : "без комнаты";
      if (!cur || cur.n + n > maxSock) {
        if (n > maxSock) { chunk(b.els, `Розетки: ${rn}`, [rn]); cur = null; return; }
        cur = mk({ prefix: "QF", kind: "sock", title: "", breaker: 16, rooms: [] }); cur.n = 0; sockLines.push(cur);
      }
      b.els.forEach((el) => cur.elIds.push(el.id)); cur.n += n; cur.rooms.push(rn);
      cur.title = "Розетки: " + cur.rooms.join(", ");
    });
    // групповые УЗО: по RCD_GROUP_LINES розеточных линий на УЗО 40A 30 мА
    sockLines.forEach((ln, i) => {
      const gi = Math.floor(i / RCD_GROUP_LINES);
      if (!groups[gi]) groups[gi] = { key: "g" + gi, rating: 40, leak: 30 };
      ln.prot = "group"; ln.groupKey = groups[gi].key;
    });
    // влажные помещения — своя линия со своим дифом на помещение
    bucket.wet.forEach((b) => {
      const rn = b.room ? b.room.name : "влажная зона";
      mk({ prefix: "QF", kind: "wet", title: `Розетки: ${rn}`, breaker: 16, prot: "own", elIds: b.els.map((e) => e.id), rooms: [rn] });
    });
    // свет — туром по комнатам, до LIGHT_MAX точек на линию
    const lightRooms = roomTour(p, [...bucket.light.values()].filter((b) => b.room).map((b) => b.room)).map((r) => bucket.light.get(r.id));
    if (bucket.light.get("_")) lightRooms.push(bucket.light.get("_"));
    let lc = null;
    const lightLineOfRoom = new Map();
    lightRooms.forEach((b) => {
      const n = b.els.length, rn = b.room ? b.room.name : "без комнаты";
      if (!lc || lc.n + n > LIGHT_MAX) { lc = mk({ prefix: "QF", kind: "light", title: "", breaker: 10, rooms: [] }); lc.n = 0; }
      b.els.forEach((el) => { lc.elIds.push(el.id); lineOf.set(el.id, lc); });
      lc.n += n; lc.rooms.push(rn); lc.title = "Свет: " + lc.rooms.join(", ");
      if (b.room) lightLineOfRoom.set(b.room.id, lc);
    });
    // выключатели/датчики — на линию того света, которым управляют (первая цель),
    // иначе на свет своей комнаты, иначе — на первую линию света
    const firstLight = lines.find((l) => l.kind === "light") || null;
    const existing = new Map((p.circuits || []).map((c) => [c.id, c]));
    switches.forEach(({ el, r }) => {
      const tids = G().allTargetIds ? G().allTargetIds(el) : [];
      let ln = null, keepCid = null;
      for (const id of tids) {
        if (lineOf.has(id)) { ln = lineOf.get(id); break; }
        const t = (p.elements || []).find((x) => x.id === id);
        if (t && t.circuitId && existing.has(t.circuitId) && mode !== "all" && t.type !== "output24") { keepCid = t.circuitId; break; }
      }
      if (!ln && !keepCid && r) ln = lightLineOfRoom.get(r.id) || null;
      if (!ln && !keepCid) ln = firstLight;
      if (ln) { ln.elIds.push(el.id); if (r && ln.rooms.indexOf(r.name) < 0) { /* выключатель в соседней комнате — комнату в заголовок не добавляем */ } }
      else if (keepCid) lines.push({ attach: keepCid, elIds: [el.id] });
      else mk({ prefix: "QF", kind: "light", title: `Свет${r ? ": " + r.name : ""}`, breaker: 10, elIds: [el.id], rooms: [r ? r.name : ""] });
    });
    // 24В — линия на помещение
    bucket.v24.forEach((b) => {
      const rn = b.room ? b.room.name : "";
      mk({ prefix: "24В", kind: "v24", title: `24В${rn ? " · " + rn : ""}`, breaker: 6, elIds: b.els.map((e) => e.id), rooms: [rn], rgb: null });
    });
    if (leaks.length) mk({ prefix: "Int", kind: "lv", title: "Датчики протечки → Нептун", breaker: 6, elIds: leaks.map((e) => e.id), rooms: [] });

    // порядок нумерации QF: розетки → влажные → выделенные → свет (как в щите по привычке)
    const ORDER = { sock: 0, wet: 1, ded: 2, light: 3, v24: 4, lv: 5 };
    const real = lines.filter((l) => !l.attach).sort((a, b) => (ORDER[a.kind] - ORDER[b.kind]));
    const attach = lines.filter((l) => l.attach);
    // имена: своя нумерация у каждого префикса, продолжая существующие (режим «free»)
    const next = {};
    const startOf = (prefix) => {
      if (next[prefix] != null) return next[prefix];
      if (mode === "all") return (next[prefix] = 1);
      const re = new RegExp("^" + prefix + "\\s*(\\d+)");
      const mx = (p.circuits || []).reduce((m, c) => { const mm = re.exec(String(c.name)); return mm ? Math.max(m, parseInt(mm[1], 10)) : m; }, 0);
      return (next[prefix] = mx + 1);
    };
    real.forEach((l) => { const n = startOf(l.prefix); l.name = l.prefix + n; next[l.prefix] = n + 1; });
    let gn = 0;
    const exGroups = mode === "all" ? 0 : (p.rcdGroups || []).reduce((m, g) => { const k = parseInt(String(g.name).replace(/\D/g, ""), 10); return Number.isFinite(k) ? Math.max(m, k) : m; }, 0);
    groups.forEach((g) => { gn++; g.name = "УЗО" + (exGroups + gn); });
    const noApplPoint = (p.appliances || []).filter((a) => a.kind === "appl" && !a.elementId && F && F.needFor && F.needFor(a) && F.needFor(a).own).length;
    return { mode, lines: real, attach, groups, skipped, noApplPoint };
  }

  // РАСПАЙКИ в раскладку не входят (SKIP), а «пересобрать всё» стирало им линию — коробка
  // становилась «без линии», точки её больше не видели, а к ней тянулся кабель «в никуда»
  // (аудит цепей, пакет 2). Запоминаем, с какими точками коробка делила линию, и после
  // раскладки отдаём ей ту новую линию, на которую ушло большинство этих точек её комнаты.
  // only — переразложить только коробки, чьи точки затронуты (автоматы по комнатам).
  function junctionMates(p, only) {
    const jMates = new Map();
    (p.elements || []).forEach((j) => {
      if (j.type !== "junction" || !j.circuitId) return;
      const mates = (p.elements || []).filter((e) => e !== j && e.type !== "junction" && e.circuitId === j.circuitId);
      if (mates.length && (!only || mates.some((e) => only.has(e.id)))) jMates.set(j.id, mates);
    });
    return jMates;
  }
  function junctionRevote(p, jMates, byId) {
    jMates.forEach((mates, jid) => {
      const j = byId.get(jid);
      if (!j) return;
      const jr = roomOf(p, j);
      const vote = (list) => { const n = {}; list.forEach((e) => { if (e.circuitId) n[e.circuitId] = (n[e.circuitId] || 0) + 1; }); return Object.keys(n).sort((a, b) => n[b] - n[a])[0] || null; };
      const inRoom = jr ? mates.filter((e) => { const r = roomOf(p, e); return r && r.id === jr.id; }) : [];
      j.circuitId = vote(inRoom) || vote(mates);
    });
  }

  // ---- ПРИМЕНИТЬ предложение (одна транзакция undo) ----
  function apply(prop) {
    const c = core(), p = c.project;
    if (!p || !prop) return null;
    c.commit();
    const jMates = prop.mode === "all" ? junctionMates(p, null) : new Map();
    if (prop.mode === "all") {
      p.circuits = []; p.rcdGroups = [];
      (p.elements || []).forEach((el) => { el.circuitId = null; });
      (p.ledStrips || []).forEach((l) => { l.circuitId = null; });
      (p.appliances || []).forEach((a) => { a.circuitId = null; });
    }
    p.rcdGroups = Array.isArray(p.rcdGroups) ? p.rcdGroups : [];
    const colors = core().DEFAULTS.circuitColors;
    const gById = {};
    prop.groups.forEach((g) => { const ng = { id: core().uid("rg"), name: g.name, rating: g.rating, leak: g.leak }; p.rcdGroups.push(ng); gById[g.key] = ng; });
    const byId = new Map((p.elements || []).map((e) => [e.id, e]));
    const made = [];
    prop.lines.forEach((l, i) => {
      const circ = c.model.newCircuit(l.name, colors[(p.circuits.length) % colors.length], l.breaker);
      circ.poles = l.poles === 3 ? 3 : 1;
      circ.title = l.title || "";
      if (l.prot === "own") circ.rcd = true;
      if (l.prot === "group" && gById[l.groupKey]) { circ.rcd = true; circ.rcdGroupId = gById[l.groupKey].id; }
      if (l.kind === "v24") circ.rgb = l.rgb == null ? null : l.rgb;
      p.circuits.push(circ);
      l.elIds.forEach((id) => { const el = byId.get(id); if (el) el.circuitId = circ.id; });
      made.push(circ);
    });
    prop.attach.forEach((a) => a.elIds.forEach((id) => { const el = byId.get(id); if (el) el.circuitId = a.attach; }));
    junctionRevote(p, jMates, byId);
    // техника — на линию своей точки питания; лента — на свет своей комнаты
    (p.appliances || []).forEach((a) => { const el = a.elementId && byId.get(a.elementId); if (el && el.circuitId && (!a.circuitId || prop.mode === "all")) a.circuitId = el.circuitId; });
    (p.ledStrips || []).forEach((ls) => {
      if (ls.circuitId) return;
      const rid = String(ls.wallId || "").split(":")[0];
      const lamp = (p.elements || []).find((e) => LIGHTS[e.type] && e.circuitId && roomOf(p, e) && roomOf(p, e).id === rid);
      if (lamp) ls.circuitId = lamp.circuitId;
    });
    c.persist("autoproject");
    return made;
  }

  /* ---------- АВТОМАТЫ ПО КОМНАТАМ ----------
     Просьба пользователя: «отдельную кнопку, где могу этот процесс автоматизировать — назначить
     на комнату отдельные автоматы на розетки, ТП, кондей, свет и т.д., но это должна быть
     галочка — что та, что эта, в виде тумблера». В отличие от «⚡ Сформировать проект» (соседние
     комнаты вместе, пока помещается) здесь КАЖДАЯ комната получает свой автомат на каждый
     включённый вид нагрузки, а ТП, кондиционер, выводы и техника — свой на каждую точку.
     Выключенный тумблер — этот вид не трогаем вовсе. Комнаты — все на этаже или выбранные.
     proposeByRoom — чистая функция (проект не меняет), applyByRoom — одна транзакция ↶, после неё
     трассы прокладываются сразу (routeAssigned) — как при назначении линии в редакторе точки.
     Тумблеры — свойство УСТРОЙСТВА (как мастер обычно разносит щит), не проекта. */
  const BR_CATS = [
    { key: "sock", icon: "🔌", label: "Розетки", hint: "свой автомат на комнату; во влажной — свой диф" },
    { key: "light", icon: "💡", label: "Свет", hint: "свой автомат на комнату; выключатели — к своему свету" },
    { key: "warm", icon: "🌡", label: "Тёплый пол", hint: "свой автомат с дифом на каждый терморегулятор" },
    { key: "ac", icon: "❄", label: "Кондиционер", hint: "свой автомат на каждый" },
    { key: "out", icon: "⚡", label: "Выводы и техника", hint: "свой автомат на каждый вывод и прибор со своей линией" },
    { key: "v24", icon: "🔆", label: "24В", hint: "своя линия на комнату" },
    { key: "lv", icon: "🌐", label: "Слаботочка", hint: "интернет, ТВ, камеры — своя линия к роутеру на каждую точку" }
  ];
  const BR_DEF = { sock: true, light: true, warm: true, ac: true, out: true, v24: true, lv: false };
  const BR_KEY = "ep_plan_byroom_v1";
  const LV_TYPES = { internet: 1, tv: 1, camera: 1, sensor: 1, intercom: 1, leak: 1 };
  function brLoad() {
    const o = Object.assign({}, BR_DEF);
    try {
      const s = JSON.parse(localStorage.getItem(BR_KEY) || "null");
      if (s && typeof s === "object") Object.keys(BR_DEF).forEach((k) => { if (typeof s[k] === "boolean") o[k] = s[k]; });
    } catch (e) { /* хранилище недоступно — умолчания */ }
    return o;
  }
  function brSave(o) { try { localStorage.setItem(BR_KEY, JSON.stringify(o)); } catch (e) { /* без запоминания */ } }
  const BS = { cats: null, rooms: null, mode: "free", last: null }; // rooms: null — все комнаты этажа

  // вид нагрузки точки (null — не раскладывается: распайка, стояк, щит, проём, «было»)
  function brCatOf(el, appl) {
    if (SKIP[el.type] || el.status === "existing") return null;
    if (el.type === "block" && !((el.params && el.params.items) || []).some((t) => t === "socket" || t === "switch")) return null;
    if (SWITCHES[el.type]) return "switch";        // садится на линию своего света (вид «Свет»)
    if (LIGHTS[el.type]) return "light";
    if (el.type === "output24") return "v24";
    if (el.type === "warmfloor") return "warm";
    if (el.type === "ac") return "ac";
    if (LV_TYPES[el.type] || (el.type === "output" && el.layer === "lv")) return "lv";
    const F = EP.Plan.Furniture, nd = appl && F && F.needFor ? F.needFor(appl) : null;
    if ((nd && nd.own) || el.type === "output" || el.type === "output3") return "out";
    return "sock"; // розетки, блоки и прочее силовое
  }

  function proposeByRoom(p, o) {
    o = o || {};
    const cats = Object.assign({}, BR_DEF, o.cats || {});
    const mode = o.mode === "all" ? "all" : "free";
    const fp = G().floorScoped(p);
    const roomSel = o.rooms && o.rooms.length ? new Set(o.rooms) : null;
    const cIds = new Set((p.circuits || []).map((c) => c.id));
    const maxSock = ((p.settings && p.settings.rules && p.settings.rules.maxSocketsPerCircuit) || 8);
    const F = EP.Plan.Furniture;
    const applByEl = new Map();
    (p.appliances || []).forEach((a) => { if (a.kind === "appl" && a.elementId) applByEl.set(a.elementId, a); });
    const lines = [], groups = [], attach = [], switches = [];
    const mk = (x) => { const ln = Object.assign({ prot: "none", poles: 1, elIds: [], rooms: [] }, x); lines.push(ln); return ln; };
    const B = { sock: new Map(), light: new Map(), v24: new Map(), leak: new Map() };
    const byRoom = (m, r, el) => { const k = r ? r.id : "_"; if (!m.has(k)) m.set(k, { room: r, els: [] }); m.get(k).els.push(el); };
    const scope = new Set(); // точки, которым это действие назначает линию
    let skipped = 0;
    (fp.elements || []).forEach((el) => {
      const appl = applByEl.get(el.id);
      const cat = brCatOf(el, appl);
      if (!cat || !cats[cat === "switch" ? "light" : cat]) return;
      const r = roomOf(p, el);
      if (roomSel && !(r && roomSel.has(r.id))) return;
      if (mode !== "all" && el.circuitId && cIds.has(el.circuitId)) { skipped++; return; }
      scope.add(el.id);
      const rn = r ? r.name : "";
      const nd = appl && F && F.needFor ? F.needFor(appl) : null;
      if (cat === "switch") { switches.push({ el, r }); return; }
      if (cat === "light") { byRoom(B.light, r, el); return; }
      if (cat === "v24") { byRoom(B.v24, r, el); return; }
      if (cat === "sock") { byRoom(B.sock, r, el); return; }
      if (cat === "warm") { mk({ prefix: "QF", kind: "ded", title: `Тёплый пол${rn ? " · " + rn : ""}`, breaker: 16, prot: "own", elIds: [el.id], rooms: [rn] }); return; }
      if (cat === "ac") { mk({ prefix: "QF", kind: "ded", title: `Кондиционер${rn ? " · " + rn : ""}`, breaker: 16, elIds: [el.id], rooms: [rn] }); return; }
      if (cat === "out") {
        if (nd && nd.own) {
          mk({ prefix: "QF", kind: "ded", title: `${appl.name || ((F.byId && F.byId(appl.catId)) || {}).name || "Прибор"}${rn ? " · " + rn : ""}`,
            breaker: nd.breaker, poles: appl.phases === 3 ? 3 : 1, prot: nd.rcd ? "own" : "none", elIds: [el.id], rooms: [rn], applId: appl.id });
          return;
        }
        if (el.type === "output3") { mk({ prefix: "QF", kind: "ded", title: `Вывод 3ф${rn ? " · " + rn : ""}`, breaker: 25, poles: 3, elIds: [el.id], rooms: [rn] }); return; }
        mk({ prefix: "QF", kind: "ded", title: `${nd ? (appl.name || "Прибор") : "Вывод"}${rn ? " · " + rn : ""}`, breaker: nd ? nd.breaker : 16,
          prot: (nd && nd.rcd) || isWet(r) ? "own" : "none", elIds: [el.id], rooms: [rn] });
        return;
      }
      if (cat === "lv") {
        if (el.type === "leak") { byRoom(B.leak, r, el); return; }
        const pre = el.type === "tv" ? "TV" : el.type === "camera" ? "CCTV" : "Int";
        const nm = el.type === "tv" ? "ТВ" : el.type === "camera" ? "Камера" : tname(el);
        mk({ prefix: pre, kind: "lv", title: `${nm}${rn ? " · " + rn : ""}`, breaker: 6, elIds: [el.id], rooms: [rn] });
      }
    });
    // комнаты — туром от главного щита (соседние подряд — и номера линий идут по квартире)
    const tourOf = (m) => roomTour(p, [...m.values()].filter((b) => b.room).map((b) => b.room)).map((r) => m.get(r.id)).concat(m.get("_") ? [m.get("_")] : []);
    const parts = (own) => { if (own.length > 1) own.forEach((l, i) => { l.title += ` (${i + 1}/${own.length})`; }); };
    // розетки: своя линия на комнату (больше порога «Проверок» — делим), влажная — свой диф
    const sockLines = [];
    tourOf(B.sock).forEach((b) => {
      const rn = b.room ? b.room.name : "без комнаты", wet = isWet(b.room), own = [];
      let cur = null;
      b.els.forEach((el) => {
        const n = Math.max(1, socketCount(el));
        if (!cur || (cur.n + n > maxSock && cur.n > 0)) {
          cur = mk({ prefix: "QF", kind: wet ? "wet" : "sock", title: `Розетки: ${rn}`, breaker: 16, prot: wet ? "own" : "none", rooms: [rn] });
          cur.n = 0; own.push(cur); if (!wet) sockLines.push(cur);
        }
        cur.elIds.push(el.id); cur.n += n;
      });
      parts(own);
    });
    // линии, у которых НЕ останется точек (все их точки переназначаем), — их номера свободны,
    // а сами линии после применения уберём; новые номера — наименьшие свободные у префикса
    const willFree = new Set();
    if (mode === "all") (p.circuits || []).forEach((c) => {
      const mem = (p.elements || []).filter((e) => e.circuitId === c.id && e.type !== "junction");
      if (mem.length && mem.every((e) => scope.has(e.id))) willFree.add(c.id);
    });
    // групповые УЗО на розетки — по RCD_GROUP_LINES линий на УЗО 40A 30 мА, как у «Сформировать
    // проект». Но сначала — в УЖЕ стоящие групповые УЗО, где есть место: «Автоматы по комнатам»
    // часто применяют к одной комнате за раз, и новое УЗО на каждую комнату (при полупустом
    // соседнем) — лишний аппарат и два модуля в щите
    const joined = [];
    let si = 0;
    (p.rcdGroups || []).forEach((g) => {
      const n = (p.circuits || []).filter((c) => c.rcdGroupId === g.id && !willFree.has(c.id)).length;
      let left = n > 0 ? RCD_GROUP_LINES - n : 0, k = 0;
      while (left > 0 && si < sockLines.length) { const ln = sockLines[si++]; ln.prot = "group"; ln.groupId = g.id; ln.groupName = g.name; left--; k++; }
      if (k) joined.push({ name: g.name, n: k });
    });
    sockLines.slice(si).forEach((ln, i) => {
      const gi = Math.floor(i / RCD_GROUP_LINES);
      if (!groups[gi]) groups[gi] = { key: "g" + gi, rating: 40, leak: 30 };
      ln.prot = "group"; ln.groupKey = groups[gi].key;
    });
    // свет: своя линия на комнату (до LIGHT_MAX точек)
    const lightOfRoom = new Map(), lineOf = new Map();
    tourOf(B.light).forEach((b) => {
      const rn = b.room ? b.room.name : "без комнаты", own = [];
      let cur = null;
      b.els.forEach((el) => {
        if (!cur || cur.n >= LIGHT_MAX) { cur = mk({ prefix: "QF", kind: "light", title: `Свет: ${rn}`, breaker: 10, rooms: [rn] }); cur.n = 0; own.push(cur); }
        cur.elIds.push(el.id); cur.n++; lineOf.set(el.id, cur);
      });
      parts(own);
      if (b.room) lightOfRoom.set(b.room.id, own[0]);
    });
    // выключатели и датчики — на линию света, которым управляют; цель вне этого действия со своей
    // линией — на её линию; иначе — на свет своей комнаты, иначе своя линия света
    const existing = new Map((p.circuits || []).map((c) => [c.id, c]));
    const elById = new Map((p.elements || []).map((e) => [e.id, e]));
    switches.forEach(({ el, r }) => {
      const tids = G().allTargetIds ? G().allTargetIds(el) : [];
      let ln = null, keep = null;
      for (const id of tids) {
        if (lineOf.has(id)) { ln = lineOf.get(id); break; }
        const t = elById.get(id);
        if (t && t.type !== "output24" && t.circuitId && existing.has(t.circuitId) && !scope.has(t.id)) { keep = t.circuitId; break; }
      }
      if (!ln && !keep && r) ln = lightOfRoom.get(r.id) || null;
      if (ln) ln.elIds.push(el.id);
      else if (keep) attach.push({ attach: keep, elIds: [el.id] });
      else mk({ prefix: "QF", kind: "light", title: `Свет${r ? ": " + r.name : ""}`, breaker: 10, elIds: [el.id], rooms: [r ? r.name : ""] });
    });
    tourOf(B.v24).forEach((b) => { const rn = b.room ? b.room.name : ""; mk({ prefix: "24В", kind: "v24", title: `24В${rn ? " · " + rn : ""}`, breaker: 6, elIds: b.els.map((e) => e.id), rooms: [rn], rgb: null }); });
    tourOf(B.leak).forEach((b) => { const rn = b.room ? b.room.name : ""; mk({ prefix: "Int", kind: "lv", title: `Протечка → Нептун${rn ? " · " + rn : ""}`, breaker: 6, elIds: b.els.map((e) => e.id), rooms: [rn] }); });

    const ORDER = { sock: 0, wet: 1, ded: 2, light: 3, v24: 4, lv: 5 };
    lines.sort((a, b) => ORDER[a.kind] - ORDER[b.kind]);
    const used = {};
    const usedOf = (prefix) => {
      if (used[prefix]) return used[prefix];
      const re = new RegExp("^" + prefix + "\\s*(\\d+)$"), s = new Set();
      (p.circuits || []).forEach((c) => { if (willFree.has(c.id)) return; const mm = re.exec(String(c.name)); if (mm) s.add(parseInt(mm[1], 10)); });
      return (used[prefix] = s);
    };
    lines.forEach((l) => { const s = usedOf(l.prefix); let n = 1; while (s.has(n)) n++; s.add(n); l.name = l.prefix + n; });
    const keptG = (p.rcdGroups || []).filter((g) => { const ls = (p.circuits || []).filter((c) => c.rcdGroupId === g.id); return !(ls.length && ls.every((c) => willFree.has(c.id))); });
    const gUsed = new Set(keptG.map((g) => parseInt(String(g.name).replace(/\D/g, ""), 10)).filter(Number.isFinite));
    groups.forEach((g) => { let n = 1; while (gUsed.has(n)) n++; gUsed.add(n); g.name = "УЗО" + n; });
    return { mode, cats, rooms: roomSel ? [...roomSel] : null, lines, attach, groups, joined, skipped, scope: [...scope], willFree: [...willFree] };
  }

  function applyByRoom(prop) {
    const c = core(), p = c.project;
    if (!p || !prop || !(prop.lines.length || prop.attach.length)) return null;
    const scope = new Set(prop.scope);
    c.commit();
    const hadEls = new Set((p.elements || []).map((e) => e.circuitId).filter(Boolean));
    const hadG = new Set((p.circuits || []).map((x) => x.rcdGroupId).filter(Boolean));
    const jMates = prop.mode === "all" ? junctionMates(p, scope) : new Map();
    const byId = new Map((p.elements || []).map((e) => [e.id, e]));
    if (prop.mode === "all") scope.forEach((id) => { const el = byId.get(id); if (el) el.circuitId = null; });
    p.rcdGroups = Array.isArray(p.rcdGroups) ? p.rcdGroups : [];
    const gById = {};
    prop.groups.forEach((g) => { const ng = { id: core().uid("rg"), name: g.name, rating: g.rating, leak: g.leak }; p.rcdGroups.push(ng); gById[g.key] = ng; });
    const colors = core().DEFAULTS.circuitColors;
    const made = [];
    prop.lines.forEach((l) => {
      // цвет — первый свободный (как у «+ линия» в редакторе точки), чтобы линии различались
      const usedC = new Set((p.circuits || []).map((x) => x.color));
      const color = colors.find((col) => !usedC.has(col)) || colors[(p.circuits || []).length % colors.length];
      const circ = c.model.newCircuit(l.name, color, l.breaker);
      circ.poles = l.poles === 3 ? 3 : 1;
      circ.title = l.title || "";
      if (l.prot === "own") circ.rcd = true;
      if (l.prot === "group") {
        // в уже стоящее УЗО (groupId) или в новое этого действия (groupKey); УЗО пропало (не
        // должно — предложение считается заново перед применением) — свой диф: розетки без
        // защиты не оставляем
        const g = l.groupId ? p.rcdGroups.find((x) => x.id === l.groupId) : gById[l.groupKey];
        circ.rcd = true;
        if (g) circ.rcdGroupId = g.id;
      }
      if (l.kind === "v24") circ.rgb = l.rgb == null ? null : l.rgb;
      p.circuits.push(circ);
      l.elIds.forEach((id) => { const el = byId.get(id); if (el) el.circuitId = circ.id; });
      made.push(circ);
    });
    prop.attach.forEach((a) => a.elIds.forEach((id) => { const el = byId.get(id); if (el) el.circuitId = a.attach; }));
    junctionRevote(p, jMates, byId);
    // техника — на линию своей точки; лента без линии (или на опустевшей) — на свет своей комнаты
    (p.appliances || []).forEach((a) => { const el = a.elementId && byId.get(a.elementId); if (el && scope.has(el.id) && el.circuitId) a.circuitId = el.circuitId; });
    const nowEls = new Set((p.elements || []).map((e) => e.circuitId).filter(Boolean));
    (p.ledStrips || []).forEach((ls) => {
      if (ls.circuitId && nowEls.has(ls.circuitId)) return;
      const rid = String(ls.wallId || "").split(":")[0];
      const lamp = (p.elements || []).find((e) => LIGHTS[e.type] && e.circuitId && scope.has(e.id) && roomOf(p, e) && roomOf(p, e).id === rid);
      if (lamp) ls.circuitId = lamp.circuitId;
    });
    // опустевшие ЭТИМ действием линии и групповые УЗО — убрать (в схеме остались бы пустыми строками);
    // линии, которые были пустыми и до этого (мастер завёл заранее), не трогаем
    const refd = (id) => nowEls.has(id) || (p.ledStrips || []).some((l) => l.circuitId === id) || (p.appliances || []).some((a) => a.circuitId === id);
    const gone = new Set((p.circuits || []).filter((x) => hadEls.has(x.id) && !refd(x.id)).map((x) => x.id));
    if (gone.size) {
      p.circuits = p.circuits.filter((x) => !gone.has(x.id));
      p.rcdGroups = p.rcdGroups.filter((g) => !(hadG.has(g.id) && !p.circuits.some((x) => x.rcdGroupId === g.id)));
    }
    c.persist("byroom");
    return { made, ids: [...scope], removed: gone.size };
  }

  // ---- шторка ----
  const PROT = (p, l, prop) => l.prot === "group" ? (l.groupName || (prop.groups.find((g) => g.key === l.groupKey) || {}).name) : l.prot === "own" ? "диф 30мА" : "без УЗО";
  function cableFor(p, l) {
    const SC = EP.Plan.Scheme, SEC = { 6: "1.5", 10: "1.5", 16: "2.5", 20: "2.5", 25: "4", 32: "6", 40: "10", 50: "10", 63: "16" };
    if (l.kind === "lv") return "витая пара";
    if (l.kind === "light") return core().cableMark(p, "3×1.5");
    if (l.kind === "v24") return p.settings.cable24 || "2×2.5";
    const sec = SEC[l.breaker] || "2.5";
    return core().cableMark(p, (l.poles === 3 ? "5×" : "3×") + sec);
  }
  function sheet() {
    const p = core().project; if (!p) return;
    const prop = propose(p, S.mode);
    S.last = prop;
    const attachN = prop.attach.reduce((s, a) => s + a.elIds.length, 0);
    rooms().openSheet(`<div class="ep-plan-srow"><b>⚡ Сформировать проект</b><span class="ep-plan-flex"></span>
        <button type="button" class="ep-plan-mini ep-clickable" data-sheet-fs aria-label="Во весь экран">⛶</button>
        <button type="button" class="ep-plan-mini ep-clickable" data-pap-close aria-label="Закрыть">✕</button></div>
      <div class="ep-plan-hintrow">Приложение предлагает линии, автоматы и УЗО по расставленным точкам и технике. Проверь и прими — дальше всё правится как обычно.</div>
      <div class="ep-plan-srow">
        <button type="button" class="ep-plan-chip ep-clickable ${S.mode === "free" ? "on" : ""}" data-pap-mode="free">Только точки без линии</button>
        <button type="button" class="ep-plan-chip ep-clickable ${S.mode === "all" ? "on" : ""}" data-pap-mode="all">Пересобрать все линии</button>
      </div>
      ${S.mode === "all" && (p.circuits || []).length ? `<div class="ep-plan-warnhint">Текущие линии (${p.circuits.length}) и групповые УЗО будут заменены. ↶ вернёт как было.</div>` : ""}
      ${prop.skipped && S.mode === "free" ? `<div class="ep-plan-modehint">Уже на линиях: ${prop.skipped} точ. — не трогаю.</div>` : ""}
      ${prop.lines.length ? linesTable(p, prop)
        : `<div class="ep-plan-modehint">${(p.elements || []).length ? "Все точки уже на линиях. Выбери «Пересобрать все линии», чтобы разложить заново." : "Сначала расставь точки (🔌)."}</div>`}
      ${prop.groups.length ? `<div class="ep-plan-modehint">Групповые УЗО: ${prop.groups.map((g) => `${esc(g.name)} ${g.rating}A ${g.leak}мА`).join(", ")}</div>` : ""}
      ${attachN ? `<div class="ep-plan-modehint">Выключателей на уже существующие линии света: ${attachN}.</div>` : ""}
      ${prop.noApplPoint ? `<div class="ep-plan-warnhint">Техника без точки питания: ${prop.noApplPoint} — назначь ей точку в 🛋, иначе своей линии не будет.</div>` : ""}
      <div class="ep-plan-srow"><button type="button" class="ep-plan-chip ep-clickable" data-plan-byroom>🎚 Свой автомат на каждую комнату →</button></div>
      <div class="ep-plan-srow ep-plan-sbtns ep-plan-actbar">
        <button type="button" class="btn btn-primary ep-clickable" data-pap-apply ${prop.lines.length || attachN ? "" : "disabled"}>✓ Применить (${prop.lines.length} ${prop.lines.length === 1 ? "линия" : "линий"})</button>
      </div>`);
  }
  // таблица предложения — общая для обеих шторок
  function linesTable(p, prop) {
    const rows = prop.lines.map((l) => `<tr>
        <td><b>${esc(l.name)}</b></td>
        <td>${esc(l.title)}<div class="ep-ap-sub">${l.elIds.length} ${l.elIds.length === 1 ? "точка" : "точ."}</div></td>
        <td>${l.poles === 3 ? "3P " : ""}${l.breaker}A<div class="ep-ap-sub">${esc(PROT(p, l, prop))}</div></td>
        <td>${esc(cableFor(p, l))}</td></tr>`).join("");
    return `<div class="ep-ap-wrap"><table class="ep-ap-table"><thead><tr><th>Линия</th><th>Что питает</th><th>Защита</th><th>Кабель</th></tr></thead><tbody>${rows}</tbody></table></div>`;
  }
  // шторка «🎚 Автоматы по комнатам»: тумблеры видов нагрузки, комнаты, режим, предпросмотр
  function sheetByRoom() {
    const p = core().project; if (!p) return;
    if (!BS.cats) BS.cats = brLoad();
    const rs = (G().floorScoped(p).rooms || []).filter((r) => (r.points || []).length >= 3);
    if (BS.rooms) { BS.rooms = BS.rooms.filter((id) => rs.some((r) => r.id === id)); if (!BS.rooms.length) BS.rooms = null; }
    const prop = proposeByRoom(p, { cats: BS.cats, rooms: BS.rooms, mode: BS.mode });
    BS.last = prop;
    const tgl = (cc) => `<button type="button" class="ep-plan-tgl ep-clickable" role="switch" aria-checked="${BS.cats[cc.key] ? "true" : "false"}" data-pbr-cat="${cc.key}">
        <span class="ep-plan-tglic" aria-hidden="true">${cc.icon}</span><span class="ep-plan-tgltx"><b>${esc(cc.label)}</b><small>${esc(cc.hint)}</small></span><span class="ep-plan-tglsw" aria-hidden="true"></span></button>`;
    const roomChips = `<button type="button" class="ep-plan-chip ep-clickable ${!BS.rooms ? "on" : ""}" data-pbr-room="all" aria-pressed="${!BS.rooms}">Все комнаты</button>`
      + rs.map((r) => { const on = !!(BS.rooms && BS.rooms.indexOf(r.id) >= 0); return `<button type="button" class="ep-plan-chip ep-clickable ${on ? "on" : ""}" data-pbr-room="${esc(r.id)}" aria-pressed="${on}">${esc(r.name)}</button>`; }).join("");
    const attachN = prop.attach.reduce((s, a) => s + a.elIds.length, 0);
    const anyCat = BR_CATS.some((cc) => BS.cats[cc.key]);
    const routeHint = p.settings && p.settings.routeOnAssign === false ? "" : `<div class="ep-plan-modehint">После «Применить» трассы новых линий проложатся сразу (нужны щит и магистраль ⇉ до комнат).</div>`;
    rooms().openSheet(`<div class="ep-plan-srow"><b>🎚 Автоматы по комнатам</b><span class="ep-plan-flex"></span>
        <button type="button" class="ep-plan-mini ep-clickable" data-sheet-fs aria-label="Во весь экран">⛶</button>
        <button type="button" class="ep-plan-mini ep-clickable" data-pbr-close aria-label="Закрыть">✕</button></div>
      <div class="ep-plan-hintrow">Каждой комнате — свой автомат на включённые виды нагрузки. Тёплый пол, кондиционер и выводы — свой на каждую точку. Выключенное не трогаем.</div>
      <div class="ep-plan-tgls">${BR_CATS.map(tgl).join("")}</div>
      <div class="ep-plan-slabel">Комнаты${rs.length ? "" : " — сначала нарисуй комнаты"}</div>
      <div class="ep-plan-chips">${roomChips}</div>
      <div class="ep-plan-srow">
        <button type="button" class="ep-plan-chip ep-clickable ${BS.mode === "free" ? "on" : ""}" data-pbr-mode="free">Только точки без линии</button>
        <button type="button" class="ep-plan-chip ep-clickable ${BS.mode === "all" ? "on" : ""}" data-pbr-mode="all">Переназначить и уже назначенные</button>
      </div>
      ${BS.mode === "all" && prop.willFree.length ? `<div class="ep-plan-warnhint">Линий останется без точек: ${prop.willFree.length} — они будут убраны. ↶ вернёт как было.</div>` : ""}
      ${prop.skipped && BS.mode === "free" ? `<div class="ep-plan-modehint">Уже на линиях: ${prop.skipped} точ. — не трогаю.</div>` : ""}
      ${prop.lines.length ? linesTable(p, prop)
        : `<div class="ep-plan-modehint">${!anyCat ? "Включи хотя бы один вид нагрузки." : (prop.skipped ? "Все точки этих видов уже на линиях — выбери «Переназначить», чтобы разнести заново." : "В выбранных комнатах нет точек этих видов.")}</div>`}
      ${prop.joined.length ? `<div class="ep-plan-modehint">Розетки — в уже стоящие групповые УЗО, где есть место: ${prop.joined.map((j) => `${esc(j.name)} +${j.n}`).join(", ")}.</div>` : ""}
      ${prop.groups.length ? `<div class="ep-plan-modehint">Новые групповые УЗО на розетки: ${prop.groups.map((g) => `${esc(g.name)} ${g.rating}A ${g.leak}мА`).join(", ")}</div>` : ""}
      ${attachN ? `<div class="ep-plan-modehint">Выключателей на уже существующие линии света: ${attachN}.</div>` : ""}
      ${prop.lines.length ? routeHint : ""}
      <div class="ep-plan-srow ep-plan-sbtns ep-plan-actbar">
        <button type="button" class="btn btn-primary ep-clickable" data-pbr-apply ${prop.lines.length || attachN ? "" : "disabled"}>✓ Применить (${prop.lines.length} ${prop.lines.length === 1 ? "линия" : "линий"})</button>
      </div>`);
  }
  // применить «Автоматы по комнатам» + трассы сразу; итог — над планом
  function applyByRoomAndRoute() {
    const p = core().project; if (!p) return null;
    const prop = proposeByRoom(p, { cats: BS.cats || brLoad(), rooms: BS.rooms, mode: BS.mode }); // свежее: проект мог измениться
    const res = applyByRoom(prop);
    if (!res) return null;
    const RT = EP.Plan.Routes;
    const rr = RT && RT.routeAssigned ? RT.routeAssigned(res.ids) : null;
    const p2 = core().project;
    const lined = res.ids.filter((id) => (p2.elements || []).some((e) => e.id === id && e.circuitId));
    const routed = lined.filter((id) => (p2.routes || []).some((r) => r.fromId === id)).length;
    const busy = RT && RT.routeStatus && RT.routeStatus(p2).code === "busy";
    let msg = `Готово: линий ${res.made.length}${res.removed ? `, убрано пустых ${res.removed}` : ""}.`;
    if (rr && !rr.off) {
      if (busy) msg += " Трассы перестраиваются…";
      else if (lined.length) msg += ` Трассы: ${routed} из ${lined.length}${rr.unrouted.length ? ` · без трассы — ${rr.unrouted[0].reason}` : ""}.`;
    }
    res.msg = msg; res.routed = routed;
    return res;
  }

  if (typeof document !== "undefined") {
    document.addEventListener("click", (e) => {
      if (!rooms() || !rooms().isActive || !rooms().isActive()) return;
      const t = e.target; let b;
      if (t.closest("[data-plan-autoproj]")) { sheet(); return; }
      if (t.closest("[data-pap-close]")) { rooms().closeSheet(); return; }
      if ((b = t.closest("[data-pap-mode]"))) { S.mode = b.getAttribute("data-pap-mode") === "all" ? "all" : "free"; sheet(); return; }
      if (t.closest("[data-pap-apply]")) {
        const prop = S.last || propose(core().project, S.mode);
        const made = apply(prop);
        rooms().closeSheet();
        if (rooms().renderScene) rooms().renderScene();
        if (rooms().toast) rooms().toast(`Готово: линий ${made ? made.length : 0}. Проверь в ▤ Схеме и ✅ Проверках.`);
        return;
      }
      // 🎚 автоматы по комнатам
      if (t.closest("[data-plan-byroom]")) { sheetByRoom(); return; }
      if (t.closest("[data-pbr-close]")) { rooms().closeSheet(); return; }
      if ((b = t.closest("[data-pbr-cat]"))) {
        const k = b.getAttribute("data-pbr-cat");
        BS.cats = BS.cats || brLoad();
        if (k in BR_DEF) { BS.cats[k] = !BS.cats[k]; brSave(BS.cats); }
        sheetByRoom(); return;
      }
      if ((b = t.closest("[data-pbr-room]"))) {
        const id = b.getAttribute("data-pbr-room");
        if (id === "all") BS.rooms = null;
        else { const cur = BS.rooms ? BS.rooms.slice() : []; const i = cur.indexOf(id); if (i >= 0) cur.splice(i, 1); else cur.push(id); BS.rooms = cur.length ? cur : null; }
        sheetByRoom(); return;
      }
      if ((b = t.closest("[data-pbr-mode]"))) { BS.mode = b.getAttribute("data-pbr-mode") === "all" ? "all" : "free"; sheetByRoom(); return; }
      if (t.closest("[data-pbr-apply]")) {
        const res = applyByRoomAndRoute();
        rooms().closeSheet();
        if (rooms().renderScene) rooms().renderScene();
        if (res) (rooms().flash || rooms().toast)(res.msg);
      }
    });
  }

  EP.Plan.AutoProject = { propose, apply, sheet, roomOf, isWet, isKitchen, LIGHT_MAX, RCD_GROUP_LINES,
    // автоматы по комнатам
    BR_CATS, BR_DEF, brLoad, brCatOf, proposeByRoom, applyByRoom, applyByRoomAndRoute, sheetByRoom,
    byRoomState: () => BS, setByRoom: (o) => { if (o && o.cats) BS.cats = Object.assign({}, BR_DEF, o.cats); if (o && "rooms" in o) BS.rooms = o.rooms; if (o && o.mode) BS.mode = o.mode === "all" ? "all" : "free"; } };
})();
