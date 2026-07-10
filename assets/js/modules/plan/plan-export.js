/* Electric Pro V29 — Проект квартиры: печатный лист (Remplanner-стиль).
   Кнопка 📄 собирает лист А4: рамка со штампом, план в чистом виде (без
   сетки и подложки), экспликация помещений, легенда, спецификация точек.
   Открывается окно печати — «Сохранить как PDF» на любом устройстве. */
(() => {
  "use strict";
  window.EP = window.EP || {};

  const T = { sheet: "План электрики", made: "Исполнитель", obj: "Объект", addr: "Адрес", date: "Дата", legend: "Условные обозначения", expl: "Экспликация помещений", spec: "Спецификация точек", door: "Дверь", win: "Окно", panel: "Щит" };

  const esc = (s) => String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const core = () => EP.Plan.Core;
  const G = () => EP.Plan.Geometry;
  const rooms = () => EP.Plan.Rooms;

  // чистый SVG плана: отдельный офф-скрин холст, без сетки и подложки
  function buildSvg(p) {
    const host = document.createElement("div");
    host.style.cssText = "position:fixed;left:-2000px;top:0;width:1050px;height:700px;";
    document.body.appendChild(host);
    const cv = EP.Plan.Canvas.create(host);
    const bb = G().projectBBox(p);
    if (bb) cv.fit(bb, 0.07);
    EP.Plan.Render.draw(cv, p, {});
    ["grid", "underlay"].forEach((n) => { const gl = cv.layers[n]; while (gl.firstChild) gl.removeChild(gl.firstChild); });
    cv.svg.setAttribute("width", "100%");
    cv.svg.removeAttribute("class");
    const html = cv.svg.outerHTML;
    cv.destroy();
    document.body.removeChild(host);
    return html;
  }

  function counts(p) {
    const TY = EP.Plan.Elements.TYPES, out = {};
    (p.elements || []).forEach((e) => {
      if (e.type === "block") ((e.params && e.params.items) || []).forEach((it) => { out[it] = (out[it] || 0) + 1; });
      else out[e.type] = (out[e.type] || 0) + 1;
    });
    return Object.keys(out).map((k) => ({ name: (TY[k] || { name: k }).name, glyph: (TY[k] || {}).glyph || "?", qty: out[k] }));
  }

  function sheetHtml(p) {
    const master = (window.EP.state && EP.state.user && EP.state.user.displayName) || "";
    const date = new Date().toLocaleDateString("ru-RU");
    const expl = (p.rooms || []).filter((r) => (r.points || []).length >= 3)
      .map((r, i) => `<tr><td>${i + 1}</td><td>${esc(r.name)}</td><td>${G().fmtArea(G().area(r.points))}</td><td>${esc(r.material || p.settings.wallMaterial)}</td></tr>`).join("");
    const spec = counts(p).map((c) => `<tr><td><i class="g">${esc(c.glyph)}</i></td><td>${esc(c.name)}</td><td>${c.qty}</td></tr>`).join("");
    const legendRows = counts(p).map((c) => `<div><i class="g">${esc(c.glyph)}</i>${esc(c.name)}</div>`).join("")
      + ((p.openings || []).some((o) => o.type === "door") ? `<div><i class="g">Дв</i>${T.door}</div>` : "")
      + ((p.openings || []).some((o) => o.type === "window") ? `<div><i class="g">Ок</i>${T.win}</div>` : "")
      + ((p.panels || []).length ? `<div><i class="g">Щ</i>${T.panel}</div>` : "");
    return `<!doctype html><html lang="ru"><head><meta charset="utf-8"><title>${esc(p.name)} — ${T.sheet}</title><style>
      @page { size: A4 landscape; margin: 8mm; }
      * { box-sizing: border-box; margin: 0; }
      body { font: 11px/1.35 system-ui, sans-serif; color: #111; }
      .frame { border: 2.2px solid #111; padding: 8px; min-height: 190mm; display: flex; flex-direction: column; gap: 6px; }
      .plan { flex: 1; border: 1px solid #999; min-height: 120mm; display:flex; align-items:center; justify-content:center; }
      .plan svg { max-width: 100%; max-height: 128mm; }
      .cols { display: flex; gap: 8px; align-items: flex-start; }
      .cols > div { flex: 1; }
      h3 { font-size: 11px; margin: 2px 0 4px; border-bottom: 1px solid #111; }
      table { width: 100%; border-collapse: collapse; }
      td, th { border: 1px solid #555; padding: 2px 5px; text-align: left; font-size: 10px; }
      .legend div { display: flex; align-items: center; gap: 6px; padding: 1.5px 0; }
      .g { font-style: normal; display: inline-flex; width: 17px; height: 17px; border-radius: 50%; border: 1px solid #111; align-items: center; justify-content: center; font-size: 8.5px; font-weight: 700; flex: none; }
      .stamp { border: 1.6px solid #111; display: grid; grid-template-columns: 1fr 1fr 1fr 90px; }
      .stamp div { border: .6px solid #555; padding: 3px 6px; }
      .stamp b { display: block; font-size: 8.5px; color: #555; font-weight: 600; }
      /* сцена SVG — печатные цвета */
      .ep-plan-wall { stroke: #111; } .ep-plan-wall.mat-brick { stroke: #92400e; }
      .ep-plan-wall.mat-panel { stroke: #555; stroke-dasharray: 12 4; } .ep-plan-wall.mat-soft { stroke: #777; stroke-dasharray: 5 5; }
      .ep-plan-room { fill: rgba(37, 99, 235, .05); }
      .ep-plan-dim { fill: #444; font-family: system-ui; } .ep-plan-name { fill: #111; font-family: system-ui; font-weight: 600; }
      .ep-plan-chain, .ep-plan-chaintext { stroke: #dc2626; fill: #dc2626; font-family: system-ui; }
      .ep-plan-chaintext { stroke: none; }
      .ep-plan-doorarc { stroke: #444; } .ep-plan-doorleaf { stroke: #111; } .ep-plan-window { stroke: #111; }
      .ep-plan-elglyph { fill: #fff; font-family: system-ui; font-weight: 700; }
      .ep-plan-el circle, .ep-plan-blockrect { stroke: #111; } .ep-plan-panel rect { fill: #1d4ed8; stroke: #111; }
      .ep-plan-route { opacity: .75; } .ep-plan-cross { stroke: #b45309; fill: none; }
      .ep-plan-warnring, .ep-plan-eldone { display: none; }
    </style></head><body><div class="frame">
      <div class="plan">${buildSvg(p)}</div>
      <div class="cols">
        <div><h3>${T.expl}</h3><table><tr><th>№</th><th>Помещение</th><th>S</th><th>Стены</th></tr>${expl}</table></div>
        <div><h3>${T.spec}</h3><table><tr><th></th><th>Тип</th><th>Кол-во</th></tr>${spec}</table></div>
        <div class="legend"><h3>${T.legend}</h3>${legendRows}</div>
      </div>
      <div class="stamp">
        <div><b>${T.obj}</b>${esc(p.name)}</div>
        <div><b>${T.addr}</b>${esc(p.address || "—")}</div>
        <div><b>${T.made}</b>${esc(master || "—")}</div>
        <div><b>${T.date}</b>${esc(date)}</div>
      </div>
    </div></body></html>`;
  }

  function print() {
    const p = core().project;
    if (!p || !(p.rooms || []).length) { rooms().toast("Нарисуй план — потом лист."); return; }
    const w = window.open("", "_blank");
    if (!w) { rooms().toast("Разреши всплывающие окна для печати."); return; }
    w.document.write(sheetHtml(p));
    w.document.close();
    setTimeout(() => { try { w.focus(); w.print(); } catch (e) {} }, 400);
  }

  document.addEventListener("click", (e) => {
    if (!rooms() || !rooms().isActive()) return;
    if (e.target.closest("[data-plan-pdf]")) print();
  });

  EP.Plan = EP.Plan || {};
  EP.Plan.Export = { print, sheetHtml };
})();
