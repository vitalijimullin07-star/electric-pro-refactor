/* Electric Pro V29 — Проект квартиры: развёртка стены (Слой 3).
   Тап по стене -> плоский вид (длина × высота потолка) в шторке. Элементы
   можно тянуть пальцем (отступ/высота с привязкой) и добавлять тапом —
   план и развёртка синхронны, т.к. читают одну модель. */
(() => {
  "use strict";
  window.EP = window.EP || {};
  const NS = "http://www.w3.org/2000/svg";

  const CFG = { hPx: 200, hitPx: 24, addTypes: ["block", "socket", "switch", "tv", "internet", "ac", "camera", "sensor"] };
  const T = { title: "Стена", close: "Закрыть", hint: "Тяни точку пальцем · тап по пустому — добавить выбранный тип" };

  const esc = (s) => String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const $ = (sel, r) => (r || document).querySelector(sel);
  const core = () => EP.Plan.Core;
  const G = () => EP.Plan.Geometry;
  const rooms = () => EP.Plan.Rooms;
  const EL = () => EP.Plan.Elements;

  const S = { wallId: null, addType: "socket", drag: null };

  function wallH(p, wallId) {
    const roomId = String(wallId).split(":")[0];
    const room = (p.rooms || []).find((r) => r.id === roomId);
    return (room && room.height) || p.settings.ceilingHeight;
  }
  function wallElems(p, wallId) { return p.elements.filter((e) => e.wallId === wallId); }

  function open(wallId) {
    S.wallId = wallId;
    const p = core().project, w = G().wallById(p, wallId);
    if (!w) return;
    const TY = EL().TYPES;
    rooms().openSheet(`<div class="ep-plan-srow"><b>${T.title} ${w.n}</b>
        <span>· ${G().fmtLen(w.len)} × ${G().fmtLen(wallH(p, wallId))}</span>
        <span class="ep-plan-flex"></span>
        <button type="button" class="ep-plan-mini ep-clickable" data-pu-close>✕</button></div>
      <div class="ep-plan-srow ep-plan-unftypes">${CFG.addTypes.map((k) =>
        `<button type="button" class="ep-plan-chip ep-clickable ${S.addType === k ? "on" : ""}" data-pu-type="${k}">${esc(TY[k].glyph)}</button>`).join("")}
      </div>
      <div class="ep-plan-unfold" id="ep-pu-box"></div>
      <div class="ep-plan-modehint">${T.hint}</div>`);
    drawStrip();
  }
  const isOpen = () => !!(S.wallId && $("#ep-pu-box"));
  function close() { S.wallId = null; }

  // ---------- отрисовка полосы ----------
  function svgEl(tag, attrs, text) {
    const n = document.createElementNS(NS, tag);
    if (attrs) for (const k in attrs) n.setAttribute(k, attrs[k]);
    if (text != null) n.textContent = text;
    return n;
  }
  function drawStrip() {
    const box = $("#ep-pu-box");
    const p = core().project, w = S.wallId && G().wallById(p, S.wallId);
    if (!box || !w) return;
    const H = wallH(p, S.wallId);
    box.innerHTML = "";
    const svg = svgEl("svg", { viewBox: `0 0 ${w.len} ${H}`, preserveAspectRatio: "xMidYMid meet", class: "ep-plan-unfsvg" });
    svg.style.touchAction = "none";
    // фон стены + пол
    svg.appendChild(svgEl("rect", { x: 0, y: 0, width: w.len, height: H, class: "ep-plan-unfwall" }));
    const kk = H / CFG.hPx; // см в пикселе полосы (по вертикали)
    for (let x = 100; x < w.len; x += 100) svg.appendChild(svgEl("line", { x1: x, y1: 0, x2: x, y2: H, class: "ep-plan-grid-line", "stroke-width": kk }));
    svg.appendChild(svgEl("line", { x1: 0, y1: H, x2: w.len, y2: H, class: "ep-plan-unffloor", "stroke-width": 2.5 * kk }));
    const TY = EL().TYPES;
    wallElems(p, S.wallId).forEach((el) => {
      const x = el.offset, y = H - el.height;
      const gr = svgEl("g", { "data-pu-el": el.id, class: "ep-plan-unfel" + (el.status === "mounted" ? " is-done" : "") });
      if (el.type === "block") {
        const items = (el.params && el.params.items) || ["socket"];
        const step2 = 18 * kk, bw = items.length * step2 + 6 * kk, bh = 24 * kk;
        gr.appendChild(svgEl("rect", { x: x - bw / 2, y: y - bh / 2, width: bw, height: bh, rx: 5 * kk }));
        items.forEach((it, i) => gr.appendChild(svgEl("text", {
          x: x - bw / 2 + 3 * kk + step2 * i + step2 / 2, y,
          "font-size": 9 * kk, "text-anchor": "middle", "dominant-baseline": "central"
        }, (TY[it] || {}).glyph || "?")));
      } else {
        gr.appendChild(svgEl("circle", { cx: x, cy: y, r: 12 * kk }));
        gr.appendChild(svgEl("text", { x, y, "font-size": 10 * kk, "text-anchor": "middle", "dominant-baseline": "central" }, (TY[el.type] || {}).glyph || "?"));
      }
      gr.appendChild(svgEl("text", { x, y: y + 24 * kk, "font-size": 8 * kk, "text-anchor": "middle", class: "ep-plan-unfdim" }, Math.round(el.offset) + "/" + Math.round(el.height)));
      svg.appendChild(gr);
    });
    box.appendChild(svg);
    bindStrip(svg, w, H);
  }

  // ---------- взаимодействие ----------
  function stripPoint(svg, w, H, clientX, clientY) {
    const r = svg.getBoundingClientRect();
    // viewBox вписан с сохранением пропорций — учитываем поля
    const scale = Math.min(r.width / w.len, r.height / H);
    const ox = (r.width - w.len * scale) / 2, oy = (r.height - H * scale) / 2;
    return { x: (clientX - r.left - ox) / scale, y: (clientY - r.top - oy) / scale };
  }
  function bindStrip(svg, w, H) {
    svg.addEventListener("pointerdown", (e) => {
      const p = core().project, step = p.settings.gridStep;
      const pt = stripPoint(svg, w, H, e.clientX, e.clientY);
      const g = e.target.closest && e.target.closest("[data-pu-el]");
      if (g) {
        const el = p.elements.find((x) => x.id === g.getAttribute("data-pu-el"));
        if (!el) return;
        core().commit();
        S.drag = { el, moved: false };
        svg.setPointerCapture(e.pointerId);
      } else if (pt.x >= 0 && pt.x <= w.len && pt.y >= 0 && pt.y <= H) {
        const c = core(), TY = EL().TYPES[S.addType];
        c.commit();
        const el = c.model.newElement(S.addType, S.wallId, G().snap(pt.x, step), G().snap(Math.max(0, H - pt.y), step), TY.layer);
        if (TY.block) el.params = { items: ["socket"] };
        p.elements.push(el);
        c.persist("elem-add");
        drawStrip(); rooms().renderScene();
      }
    });
    svg.addEventListener("pointermove", (e) => {
      if (!S.drag) return;
      const p = core().project, step = p.settings.gridStep;
      const pt = stripPoint(svg, w, H, e.clientX, e.clientY);
      S.drag.moved = true;
      S.drag.el.offset = G().snap(Math.max(0, Math.min(w.len, pt.x)), step);
      S.drag.el.height = G().snap(Math.max(0, Math.min(H, H - pt.y)), step);
      drawStrip(); rooms().renderScene();
    });
    const done = () => {
      if (!S.drag) return;
      if (S.drag.moved) core().persist("elem-move");
      S.drag = null;
    };
    svg.addEventListener("pointerup", done);
    svg.addEventListener("pointercancel", done);
  }

  document.addEventListener("click", (e) => {
    if (!rooms() || !rooms().isActive()) return;
    const t = e.target; let b;
    if (t.closest("[data-pu-close]")) { close(); rooms().closeSheet(); return; }
    if ((b = t.closest("[data-pu-type]"))) {
      S.addType = b.getAttribute("data-pu-type");
      document.querySelectorAll("[data-pu-type]").forEach((x) => x.classList.toggle("on", x === b));
    }
  });

  EP.Plan = EP.Plan || {};
  EP.Plan.Unfold = { open, close, isOpen, drawStrip, CFG };
})();
