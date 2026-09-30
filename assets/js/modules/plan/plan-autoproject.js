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

  // ---- ПРИМЕНИТЬ предложение (одна транзакция undo) ----
  function apply(prop) {
    const c = core(), p = c.project;
    if (!p || !prop) return null;
    c.commit();
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

  // ---- шторка ----
  const PROT = (p, l, prop) => l.prot === "group" ? (prop.groups.find((g) => g.key === l.groupKey) || {}).name : l.prot === "own" ? "диф 30мА" : "без УЗО";
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
    const rows = prop.lines.map((l) => `<tr>
        <td><b>${esc(l.name)}</b></td>
        <td>${esc(l.title)}<div class="ep-ap-sub">${l.elIds.length} ${l.elIds.length === 1 ? "точка" : "точ."}</div></td>
        <td>${l.poles === 3 ? "3P " : ""}${l.breaker}A<div class="ep-ap-sub">${esc(PROT(p, l, prop))}</div></td>
        <td>${esc(cableFor(p, l))}</td></tr>`).join("");
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
      ${prop.lines.length ? `<div class="ep-ap-wrap"><table class="ep-ap-table"><thead><tr><th>Линия</th><th>Что питает</th><th>Защита</th><th>Кабель</th></tr></thead><tbody>${rows}</tbody></table></div>`
        : `<div class="ep-plan-modehint">${(p.elements || []).length ? "Все точки уже на линиях. Выбери «Пересобрать все линии», чтобы разложить заново." : "Сначала расставь точки (🔌)."}</div>`}
      ${prop.groups.length ? `<div class="ep-plan-modehint">Групповые УЗО: ${prop.groups.map((g) => `${esc(g.name)} ${g.rating}A ${g.leak}мА`).join(", ")}</div>` : ""}
      ${attachN ? `<div class="ep-plan-modehint">Выключателей на уже существующие линии света: ${attachN}.</div>` : ""}
      ${prop.noApplPoint ? `<div class="ep-plan-warnhint">Техника без точки питания: ${prop.noApplPoint} — назначь ей точку в 🛋, иначе своей линии не будет.</div>` : ""}
      <div class="ep-plan-srow ep-plan-sbtns ep-ap-apply">
        <button type="button" class="btn btn-primary ep-clickable" data-pap-apply ${prop.lines.length || attachN ? "" : "disabled"}>✓ Применить (${prop.lines.length} ${prop.lines.length === 1 ? "линия" : "линий"})</button>
      </div>`);
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
      }
    });
  }

  EP.Plan.AutoProject = { propose, apply, sheet, roomOf, isWet, isKitchen, LIGHT_MAX, RCD_GROUP_LINES };
})();
