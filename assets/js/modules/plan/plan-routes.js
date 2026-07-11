/* Electric Pro V29 — Проект квартиры: трассы v2 (дерево через распайки).
   Топология как на реальных планах, НЕ «звезда»:
     точка -> ближайшая распайка (или щит, если распаек нет) — спуск;
     распайка -> ближайший узел ближе к щиту (или щит) — магистраль (дерево).
   Если у точки задана линия (автомат) — предпочитаем распайку той же линии;
   цвет трассы = цвет линии, иначе цвет слоя. Длины и разбивка по линиям. */
(() => {
  "use strict";
  window.EP = window.EP || {};

  const T = {
    title: "Трассы", build: "⚡ Построить", clear: "✕ Очистить",
    noPanel: "Поставь щит: режим 🔌, тип «Щ», тап по плану.",
    noElems: "Нет точек — добавь розетки/свет в режиме 🔌.",
    hintJ: "Совет: поставь «Распайку» (◇) — трассы пойдут через неё, а не каждая к щиту.",
    routeType: "Ведём по", ceiling: "потолку", floor: "полу",
    built: (n) => `Трасс: ${n}`, total: "Итого кабеля", crossings: "проходок",
    lines: "Линии (автоматы)", noLine: "Без линии", junctions: "Распаек",
    breaker: "Автомат", rcd: "УЗО"
  };

  const esc = (s) => String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const core = () => EP.Plan.Core;
  const G = () => EP.Plan.Geometry;
  const rooms = () => EP.Plan.Rooms;

  const isJunction = (el) => el.type === "junction";
  const isPoint = (el) => el.status !== "existing" && el.type !== "junction" && el.type !== "warmfloor";

  function circuitOf(p, el) { return el.circuitId ? (p.circuits || []).find((c) => c.id === el.circuitId) : null; }
  function colorOf(p, el) {
    const c = circuitOf(p, el);
    if (c) return c.color;
    const l = (p.layers || []).find((x) => x.id === el.layer);
    return (l && l.color) || "#94a3b8";
  }
  function nodePos(p, node) {
    if (node.kind === "panel") return { x: node.x, y: node.y };
    return G().elemPoint(p, node.el);
  }
  function nearest(pos, nodes, filter) {
    let best = null;
    nodes.forEach((n) => {
      if (filter && !filter(n)) return;
      const np = n.pos;
      const d = Math.hypot(pos.x - np.x, pos.y - np.y);
      if (!best || d < best.d) best = { d, node: n };
    });
    return best && best.node;
  }
  // Г-образная ортогональная линия между двумя точками (сначала по Y, потом по X)
  function ortho(a, b) {
    if (Math.abs(a.x - b.x) < 1 || Math.abs(a.y - b.y) < 1) return [{ x: a.x, y: a.y }, { x: b.x, y: b.y }];
    return [{ x: a.x, y: a.y }, { x: a.x, y: b.y }, { x: b.x, y: b.y }];
  }

  function build() {
    const c = core(), p = c.project;
    p.circuits = p.circuits || [];
    if (!(p.panels || []).length) { rooms().toast(T.noPanel); return; }
    const points = (p.elements || []).filter(isPoint);
    if (!points.length) { rooms().toast(T.noElems); return; }
    c.commit();
    p.routes = [];

    // узлы: щиты + распайки
    const panels = (p.panels || []).map((pn) => ({ kind: "panel", id: pn.id, x: pn.x, y: pn.y, pos: { x: pn.x, y: pn.y } }));
    const juncts = (p.elements || []).filter(isJunction).map((el) => ({ kind: "junction", id: el.id, el, circuitId: el.circuitId, pos: G().elemPoint(p, el) })).filter((n) => n.pos);
    const nodes = panels.concat(juncts);

    // 1) точки -> узел СВОЕЙ линии (QF): дерево QF1 отдельно от QF2.
    //    точка с линией идёт только к распайке своей линии или к щиту (не к чужой QF);
    //    точка без линии — к любой распайке или щиту.
    points.forEach((el) => {
      const pos = G().elemPoint(p, el);
      if (!pos) return;
      let cand;
      if (el.circuitId) {
        const sameC = juncts.filter((n) => n.circuitId === el.circuitId);
        cand = (sameC.length ? sameC : []).concat(panels);
      } else {
        cand = (juncts.length ? juncts : []).concat(panels);
      }
      const target = nearest(pos, cand);
      if (!target) return;
      addRoute(c, p, el, pos, target.pos, el.circuitId, colorOf(p, el));
    });

    // 2) распайки -> дерево к щиту. Распайка с линией предпочитает узлы своей QF
    //    (ближе к щиту), иначе — щит. Без цикла: сортировка по расстоянию до щита.
    const panelDist = (pos) => { const n = nearest(pos, panels); return n ? Math.hypot(pos.x - n.pos.x, pos.y - n.pos.y) : Infinity; };
    const js = juncts.map((n) => ({ n, d: panelDist(n.pos) })).sort((a, b) => a.d - b.d);
    js.forEach(({ n, d }) => {
      const closerJ = js.filter((x) => x.d < d - 1 && (!n.circuitId || x.n.circuitId === n.circuitId)).map((x) => x.n);
      const target = nearest(n.pos, panels.concat(closerJ));
      if (!target) return;
      addRoute(c, p, n.el, n.pos, target.pos, n.circuitId, colorOf(p, n.el));
    });

    c.persist("routes-build");
    sheet();
  }

  function addRoute(c, p, fromEl, a, b, circuitId, color) {
    const pts = ortho(a, b);
    const rt = c.model.newRoute(fromEl.layer, p.settings.routeType, pts, fromEl.id, null);
    rt.circuitId = circuitId || null;
    rt.color = color;
    rt.throughWalls = G().polylineCrossings(p, pts, fromEl.wallId || null);
    p.routes.push(rt);
  }

  function clearRoutes() {
    const c = core();
    c.commit(); c.project.routes = []; c.persist("routes-clear");
    sheet();
  }

  // вертикали (спуски у точки и у щита) — как в v1
  function verticalLen(p, el) {
    const ceil = p.settings.ceilingHeight, ph = p.settings.panelHeight;
    if (el.type === "junction") return 0;
    if (p.settings.routeType === "floor") return (el.height || 0) + ph;
    return Math.max(0, ceil - (el.height || 0)) + Math.max(0, ceil - ph);
  }
  function lengths(p) {
    const byLayer = {}, byCircuit = {};
    let crossings = 0, total = 0;
    (p.routes || []).forEach((r) => {
      const el = (p.elements || []).find((e) => e.id === r.fromId);
      const L = G().polylineLen(r.points) + (el ? verticalLen(p, el) : 0);
      byLayer[r.layer] = (byLayer[r.layer] || 0) + L;
      const cid = r.circuitId || "_none";
      byCircuit[cid] = (byCircuit[cid] || 0) + L;
      total += L;
      crossings += (r.throughWalls || []).length;
    });
    return { byLayer, byCircuit, total, crossings };
  }

  function sheet() {
    const p = core().project;
    const st = lengths(p);
    const rt = p.settings.routeType;
    const juncN = (p.elements || []).filter(isJunction).length;
    const circuits = p.circuits || [];
    const breakers = EP.Plan.Core.DEFAULTS.breakers;

    const linesHtml = (circuits.length || st.byCircuit._none)
      ? `<div class="ep-plan-srow"><b>${T.lines}</b></div>` +
        circuits.map((c) => `<div class="ep-plan-lineRow">
            <span class="ep-plan-cdot" style="background:${esc(c.color)}"></span>
            <b>${esc(c.name)}</b>
            <span class="ep-plan-flex"></span>
            <span>${st.byCircuit[c.id] ? G().fmtLen(st.byCircuit[c.id]) : "—"}</span>
            <select data-prt-brk="${esc(c.id)}" class="ep-plan-sel">${breakers.map((b) => `<option value="${b}" ${c.breaker === b ? "selected" : ""}>${b}A</option>`).join("")}</select>
            <label class="ep-plan-chk"><input type="checkbox" data-prt-rcd="${esc(c.id)}" ${c.rcd ? "checked" : ""}>${T.rcd}</label>
            <button type="button" class="ep-plan-mini ep-plan-danger ep-clickable" data-prt-cdel="${esc(c.id)}">✕</button>
          </div>`).join("") +
        (st.byCircuit._none ? `<div class="ep-plan-lineRow"><span class="ep-plan-cdot" style="background:#94a3b8"></span>${T.noLine}<span class="ep-plan-flex"></span><span>${G().fmtLen(st.byCircuit._none)}</span></div>` : "")
      : "";

    rooms().openSheet(`<div class="ep-plan-srow"><b>🧵 ${T.title}</b><span>· ${T.built(p.routes.length)}</span>
        <span class="ep-plan-flex"></span><button type="button" class="ep-plan-mini ep-clickable" data-prt-close>✕</button></div>
      <div class="ep-plan-srow">${T.routeType}:
        <button type="button" class="ep-plan-chip ep-clickable ${rt === "ceiling" ? "on" : ""}" data-prt-rt="ceiling">${T.ceiling}</button>
        <button type="button" class="ep-plan-chip ep-clickable ${rt === "floor" ? "on" : ""}" data-prt-rt="floor">${T.floor}</button>
        <span class="ep-plan-flex"></span><span>${T.junctions}: <b>${juncN}</b></span>
      </div>
      ${!juncN ? `<div class="ep-plan-modehint">${T.hintJ}</div>` : ""}
      ${p.routes.length ? `<div class="ep-plan-srow ep-plan-rlens"><span>${T.total}: <b>${G().fmtLen(st.total)}</b></span><span>${st.crossings} ${T.crossings}</span></div>` : ""}
      ${linesHtml}
      <div class="ep-plan-srow ep-plan-sbtns">
        <button type="button" class="btn btn-primary ep-clickable" data-prt-build>${T.build}</button>
        <button type="button" class="ep-plan-tbtn ep-plan-danger ep-clickable" data-prt-clear>${T.clear}</button>
      </div>`);
  }

  document.addEventListener("click", (e) => {
    if (!rooms() || !rooms().isActive()) return;
    const t = e.target; let b;
    if (t.closest("[data-plan-routes]")) return sheet();
    if (t.closest("[data-prt-build]")) return build();
    if (t.closest("[data-prt-clear]")) return clearRoutes();
    if (t.closest("[data-prt-close]")) { rooms().closeSheet(); return; }
    if ((b = t.closest("[data-prt-rt]"))) {
      const c = core(); c.commit(); c.project.settings.routeType = b.getAttribute("data-prt-rt"); c.persist("routes-rt"); sheet(); return;
    }
    if ((b = t.closest("[data-prt-cdel]"))) {
      const c = core(), id = b.getAttribute("data-prt-cdel");
      c.commit();
      c.project.circuits = c.project.circuits.filter((x) => x.id !== id);
      (c.project.elements || []).forEach((el) => { if (el.circuitId === id) el.circuitId = null; });
      c.persist("circuit-del"); sheet(); return;
    }
  });
  document.addEventListener("change", (e) => {
    if (!rooms() || !rooms().isActive()) return;
    const t = e.target;
    if (t.getAttribute && t.getAttribute("data-prt-brk")) {
      const c = core(), circ = c.project.circuits.find((x) => x.id === t.getAttribute("data-prt-brk"));
      if (circ) { c.commit(); circ.breaker = Number(t.value) || 16; c.persist("circuit-brk"); }
    }
    if (t.getAttribute && t.getAttribute("data-prt-rcd")) {
      const c = core(), circ = c.project.circuits.find((x) => x.id === t.getAttribute("data-prt-rcd"));
      if (circ) { c.commit(); circ.rcd = !!t.checked; c.persist("circuit-rcd"); }
    }
  });

  EP.Plan = EP.Plan || {};
  EP.Plan.Routes = { build, clearRoutes, lengths, sheet, verticalLen };
})();
