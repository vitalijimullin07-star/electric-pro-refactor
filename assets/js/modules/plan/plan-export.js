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

  // развёртка одной стены для печати (длина × высота, точки с рулетками от угла и от пола)
  function unfoldSvg(p, room, w, els) {
    const H = room.height || p.settings.ceilingHeight, L = w.len, pad = 45;
    const TY = EP.Plan.Elements.TYPES;
    const kk = (H + pad) / 200;
    let s = `<svg viewBox="${-pad} ${-pad} ${L + pad * 1.5} ${H + pad * 1.9}" preserveAspectRatio="xMidYMid meet" class="unf">`;
    s += `<rect x="0" y="0" width="${L}" height="${H}" class="unfwall"/>`;
    s += `<line x1="0" y1="${H}" x2="${L}" y2="${H}" class="unffloor"/>`;
    els.slice().sort((a, b) => a.offset - b.offset).forEach((el) => {
      const x = el.offset, y = H - el.height;
      const cc = (p.circuits || []).find((c) => c.id === el.circuitId);
      const col = cc ? cc.color : "#1d4ed8";
      s += `<line x1="${x}" y1="${H}" x2="${x}" y2="${y}" class="unfdim"/>`;
      s += `<text x="${x + 6 * kk}" y="${(H + y) / 2}" font-size="${11 * kk}" class="unfdimt">${Math.round(el.height)}</text>`;
      s += `<line x1="0" y1="${H + 16 * kk}" x2="${x}" y2="${H + 16 * kk}" class="unfdim"/>`;
      s += `<text x="${x / 2}" y="${H + 30 * kk}" font-size="${11 * kk}" text-anchor="middle" class="unfdimt">${Math.round(el.offset)}</text>`;
      if (el.type === "block") {
        const items = (el.params && el.params.items) || ["socket"];
        const step = 18 * kk, bw = items.length * step + 6 * kk, bh = 24 * kk;
        s += `<rect x="${x - bw / 2}" y="${y - bh / 2}" width="${bw}" height="${bh}" rx="${5 * kk}" fill="${col}" class="unfshape"/>`;
        items.forEach((it, i) => { s += `<text x="${x - bw / 2 + 3 * kk + step * i + step / 2}" y="${y}" font-size="${9 * kk}" text-anchor="middle" dominant-baseline="central" class="unfglyph">${esc((TY[it] || {}).glyph || "?")}</text>`; });
      } else {
        s += `<circle cx="${x}" cy="${y}" r="${13 * kk}" fill="${col}" class="unfshape"/>`;
        s += `<text x="${x}" y="${y}" font-size="${10 * kk}" text-anchor="middle" dominant-baseline="central" class="unfglyph">${esc((TY[el.type] || {}).glyph || "?")}</text>`;
      }
      if (cc) s += `<text x="${x}" y="${y - 18 * kk}" font-size="${8.5 * kk}" text-anchor="middle" fill="${col}" class="unfqf">${esc(cc.name)}</text>`;
    });
    return s + "</svg>";
  }
  function buildUnfolds(p) {
    const cards = [];
    (p.rooms || []).forEach((room) => {
      if ((room.points || []).length < 2) return;
      G().walls(room).forEach((w) => {
        const els = (p.elements || []).filter((e) => e.wallId === w.id);
        if (!els.length) return;
        cards.push(`<div class="unfcard"><h4>${esc(room.name)} · стена ${w.n} · ${G().fmtLen(w.len)} × ${G().fmtLen(room.height || p.settings.ceilingHeight)}</h4>${unfoldSvg(p, room, w, els)}</div>`);
      });
    });
    return cards.length ? `<div class="unfsec"><h3>Развёртки стен</h3><div class="unfgrid">${cards.join("")}</div></div>` : "";
  }

  // однолинейная схема в лист (тем же движком, что и в приложении)
  function buildScheme(p) {
    if (!window.ShieldSchemeSVG || !EP.Plan.Scheme || !(p.circuits || []).length) return "";
    try {
      const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
      window.ShieldSchemeSVG.render(svg, EP.Plan.Scheme.buildTree(p));
      svg.setAttribute("width", "100%");
      return `<div class="unfsec"><h3>Однолинейная схема</h3><div class="schemebox">${svg.outerHTML}</div></div>`;
    } catch (e) { return ""; }
  }
  // таблица линий (QF) + щит
  function buildCircuits(p) {
    const circuits = p.circuits || [];
    if (!circuits.length) return "";
    if (EP.Plan.Scheme && EP.Plan.Scheme.recompute) { try { EP.Plan.Scheme.recompute(p); } catch (e) {} }
    const rl = EP.Plan.Routes ? EP.Plan.Routes.lengths(p) : { byCircuit: {} };
    const rows = circuits.map((c) => `<tr><td><i class="cd" style="background:${esc(c.color)}"></i>${esc(c.name)}</td><td>${(c.breaker || 16)}A${c.rcd ? " + УЗО" : ""}</td><td>${esc(c.cable || "—")}</td><td>${c.poles === 3 ? "3P" : "1P"}</td><td>${rl.byCircuit && rl.byCircuit[c.id] ? G().fmtLen(rl.byCircuit[c.id]) : "—"}</td></tr>`).join("");
    const box = p.settings.panelBox;
    const panelInfo = box && box.modules ? `Щит: <b>${esc(box.brand)}</b> · ${box.modules} мод · ${box.wmm}×${box.hmm}×${box.dmm} мм` : "";
    return `<div class="unfsec"><h3>Линии и щит</h3>${panelInfo ? `<p style="margin:2px 0 6px">${panelInfo}</p>` : ""}
      <table><tr><th>Линия</th><th>Автомат</th><th>Кабель</th><th>Полюса</th><th>Длина</th></tr>${rows}</table></div>`;
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
      .ep-plan-wallband { stroke: #111; fill: none; }
      .ep-plan-wallband.mat-brick { stroke: #b45309; }
      .ep-plan-wallband.mat-panel { stroke: #555; stroke-dasharray: 40 10; }
      .ep-plan-wallband.mat-soft { stroke: #777; stroke-dasharray: 16 9; }
      .ep-plan-wallband.is-lintel-band { opacity: .7; }
      .ep-plan-wallcorner { fill: #111; }
      .ep-plan-wallcorner.mat-brick { fill: #b45309; }
      .ep-plan-wallcorner.mat-panel, .ep-plan-wallcorner.mat-soft { fill: #555; }
      .ep-plan-junction { fill: #1d4ed8; stroke: #111; }
      .ep-plan-room { fill: rgba(37, 99, 235, .05); }
      .ep-plan-dim { fill: #444; font-family: system-ui; } .ep-plan-name { fill: #111; font-family: system-ui; font-weight: 600; }
      .ep-plan-chain, .ep-plan-chaintext { stroke: #dc2626; fill: #dc2626; font-family: system-ui; }
      .ep-plan-chaintext { stroke: none; }
      .ep-plan-doorarc { stroke: #444; } .ep-plan-doorleaf { stroke: #111; } .ep-plan-window { stroke: #111; }
      .ep-plan-elglyph { fill: #fff; font-family: system-ui; font-weight: 700; }
      .ep-plan-el circle, .ep-plan-blockrect { stroke: #111; } .ep-plan-panel rect { fill: #1d4ed8; stroke: #111; }
      .ep-plan-route { opacity: .75; } .ep-plan-cross { stroke: #b45309; fill: none; }
      .ep-plan-warnring, .ep-plan-eldone { display: none; }
      /* развёртки стен */
      .unfsec { break-before: page; page-break-before: always; margin-top: 6px; }
      .unfsec h3 { font-size: 12px; margin-bottom: 6px; }
      .unfgrid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
      .unfcard { border: 1px solid #999; padding: 4px 6px; break-inside: avoid; }
      .unfcard h4 { font-size: 9.5px; margin-bottom: 2px; }
      .unf { width: 100%; max-height: 62mm; }
      .unfwall { fill: #f1f5f9; stroke: #94a3b8; stroke-width: 1; }
      .unffloor { stroke: #111; stroke-width: 2; }
      .unfdim { stroke: #0891b2; stroke-width: 1; }
      .unfdimt { fill: #0e7490; font-family: system-ui; }
      .unfshape { stroke: #111; stroke-width: 1; }
      .unfglyph { fill: #fff; font-weight: 700; font-family: system-ui; }
      .unfqf { font-weight: 700; font-family: system-ui; }
      /* однолинейка + линии */
      .schemebox { border: 1px solid #999; padding: 6px; overflow: auto; }
      .schemebox svg { max-width: 100%; height: auto; }
      .cd { display: inline-block; width: 10px; height: 10px; border-radius: 50%; margin-right: 5px; vertical-align: middle; }
    </style></head><body><div class="frame">
      <div class="plan">${buildSvg(p)}</div>
      <div class="cols">
        <div><h3>${T.expl}</h3><table><tr><th>№</th><th>Помещение</th><th>S</th><th>Стены</th></tr>${expl}</table></div>
        <div><h3>${T.spec}</h3><table><tr><th></th><th>Тип</th><th>Кол-во</th></tr>${spec}</table></div>
        <div class="legend"><h3>${T.legend}</h3>${legendRows}</div>
      </div>
      ${buildUnfolds(p)}
      ${buildCircuits(p)}
      ${buildScheme(p)}
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
