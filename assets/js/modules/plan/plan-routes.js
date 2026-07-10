/* Electric Pro V29 — Проект квартиры: трассы (Слой 4).
   Полу-автомат: от каждой точки к ближайшему щиту ортогональной Г-линией,
   проходки через стены отмечаются автоматически. Длина = горизонталь +
   вертикальные спуски (потолок/пол). Цвет — по слою элемента. */
(() => {
  "use strict";
  window.EP = window.EP || {};

  const T = {
    title: "Трассы", build: "⚡ Построить", clear: "✕ Очистить", close: "Закрыть",
    noPanel: "Сначала поставь щит: режим 🔌, тип «Щ», тап по плану.",
    noElems: "Нет точек — добавь розетки/свет в режиме 🔌.",
    routeType: "Ведём по", ceiling: "потолку", floor: "полу",
    built: (n) => `Построено трасс: ${n}`,
    total: "Итого кабеля", crossings: "проходок"
  };

  const $ = (sel, r) => (r || document).querySelector(sel);
  const core = () => EP.Plan.Core;
  const G = () => EP.Plan.Geometry;
  const rooms = () => EP.Plan.Rooms;

  function nearestPanel(p, pt) {
    let best = null;
    (p.panels || []).forEach((pn) => {
      const d = G().dist(pt, pn);
      if (!best || d < best.d) best = { d, pn };
    });
    return best && best.pn;
  }

  // Вертикали: спуск у точки + спуск у щита (по типу трассы)
  function verticalLen(p, el) {
    const ceil = p.settings.ceilingHeight, ph = p.settings.panelHeight;
    if (p.settings.routeType === "floor") return (el.height || 0) + ph;
    return Math.max(0, ceil - (el.height || 0)) + Math.max(0, ceil - ph);
  }

  function build() {
    const c = core(), p = c.project;
    if (!(p.panels || []).length) { rooms().toast(T.noPanel); return; }
    const els = p.elements.filter((e) => e.status !== "existing" && e.type !== "warmfloor");
    if (!els.length) { rooms().toast(T.noElems); return; }
    c.commit();
    p.routes = [];
    els.forEach((el) => {
      const pos = G().elemPoint(p, el);
      if (!pos) return;
      const pn = nearestPanel(p, pos);
      if (!pn) return;
      // Г-образная ортогональная линия: сначала вертикаль по Y, потом горизонталь
      const mid = { x: pos.x, y: pn.y };
      const pts = (Math.abs(pos.x - pn.x) < 1 || Math.abs(pos.y - pn.y) < 1)
        ? [{ x: pos.x, y: pos.y }, { x: pn.x, y: pn.y }]
        : [{ x: pos.x, y: pos.y }, mid, { x: pn.x, y: pn.y }];
      const rt = c.model.newRoute(el.layer, p.settings.routeType, pts, el.id, pn.id);
      rt.throughWalls = G().polylineCrossings(p, pts, el.wallId || null);
      p.routes.push(rt);
    });
    c.persist("routes-build");
    sheet();
  }
  function clearRoutes() {
    const c = core();
    c.commit(); c.project.routes = []; c.persist("routes-clear");
    sheet();
  }

  function lengths(p) {
    const byLayer = {};
    let crossings = 0, total = 0;
    (p.routes || []).forEach((r) => {
      const el = p.elements.find((e) => e.id === r.fromId);
      const L = G().polylineLen(r.points) + (el ? verticalLen(p, el) : 0);
      byLayer[r.layer] = (byLayer[r.layer] || 0) + L;
      total += L;
      crossings += (r.throughWalls || []).length;
    });
    return { byLayer, total, crossings };
  }

  function sheet() {
    const p = core().project;
    const st = lengths(p);
    const layerName = (id) => ((p.layers || []).find((l) => l.id === id) || { name: id }).name;
    const rt = p.settings.routeType;
    rooms().openSheet(`<div class="ep-plan-srow"><b>${T.title}</b><span>· ${T.built(p.routes.length)}</span>
        <span class="ep-plan-flex"></span><button type="button" class="ep-plan-mini ep-clickable" data-prt-close>✕</button></div>
      <div class="ep-plan-srow">${T.routeType}:
        <button type="button" class="ep-plan-chip ep-clickable ${rt === "ceiling" ? "on" : ""}" data-prt-rt="ceiling">${T.ceiling}</button>
        <button type="button" class="ep-plan-chip ep-clickable ${rt === "floor" ? "on" : ""}" data-prt-rt="floor">${T.floor}</button>
      </div>
      ${p.routes.length ? `<div class="ep-plan-srow ep-plan-rlens">${Object.keys(st.byLayer).map((id) =>
        `<span>${layerName(id)}: <b>${G().fmtLen(st.byLayer[id])}</b></span>`).join("")}
        <span>${T.total}: <b>${G().fmtLen(st.total)}</b> · ${st.crossings} ${T.crossings}</span></div>` : ""}
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
      const c = core();
      c.commit(); c.project.settings.routeType = b.getAttribute("data-prt-rt"); c.persist("routes-rt");
      sheet(); return;
    }
  });

  EP.Plan = EP.Plan || {};
  EP.Plan.Routes = { build, clearRoutes, lengths, sheet, verticalLen };
})();
