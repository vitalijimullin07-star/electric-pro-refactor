/* Electric Pro V29 — Проект квартиры: развёртка стены v2 (Слой 3+).
   Тап по стене -> плоский вид (длина × высота). Можно РАЗВЕРНУТЬ НА ВЕСЬ ЭКРАН.
   У каждой точки — линейки: от угла (по низу) и от пола (слева). Палитра мягкая,
   без «чёрное-красное». Точки тянутся пальцем, добавляются тапом. Синхронно с планом. */
(() => {
  "use strict";
  window.EP = window.EP || {};
  const NS = "http://www.w3.org/2000/svg";

  const CFG = { hitPx: 24, addTypes: ["block", "socket", "switch", "tv", "internet", "ac", "camera", "sensor"], padCm: 40 };
  const T = { title: "Стена", hint: "Тяни точку · тап по пустому — добавить · размеры от угла и от пола" };

  const esc = (s) => String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const $ = (sel, r) => (r || document).querySelector(sel);
  const core = () => EP.Plan.Core;
  const G = () => EP.Plan.Geometry;
  const rooms = () => EP.Plan.Rooms;
  const EL = () => EP.Plan.Elements;

  const S = { wallId: null, addType: "socket", drag: null, full: false };

  function wallH(p, wallId) {
    const roomId = String(wallId).split(":")[0];
    const room = (p.rooms || []).find((r) => r.id === roomId);
    return (room && room.height) || p.settings.ceilingHeight;
  }
  function wallElems(p, wallId) { return p.elements.filter((e) => e.wallId === wallId); }
  function circ(p, el) { return el.circuitId ? (p.circuits || []).find((c) => c.id === el.circuitId) : null; }

  function open(wallId) {
    S.wallId = wallId;
    const p = core().project, w = G().wallById(p, wallId);
    if (!w) return;
    const TY = EL().TYPES;
    rooms().openSheet(`<div class="ep-plan-srow"><b>${T.title} ${w.n}</b>
        <span>· ${G().fmtLen(w.len)} × ${G().fmtLen(wallH(p, wallId))}</span>
        <span class="ep-plan-flex"></span>
        <button type="button" class="ep-plan-mini ep-clickable" data-pu-full aria-label="Во весь экран">⤢</button>
        <button type="button" class="ep-plan-mini ep-clickable" data-pu-close>✕</button></div>
      <div class="ep-plan-srow ep-plan-unftypes">${CFG.addTypes.map((k) =>
        `<button type="button" class="ep-plan-chip ep-clickable ${S.addType === k ? "on" : ""}" data-pu-type="${k}">${esc(TY[k].glyph)}</button>`).join("")}
      </div>
      <div class="ep-plan-unfold ${S.full ? "is-full" : ""}" id="ep-pu-box"></div>
      <div class="ep-plan-modehint">${T.hint}</div>`);
    drawStrip();
  }
  const isOpen = () => !!(S.wallId && $("#ep-pu-box"));
  function close() { S.wallId = null; S.full = false; }
  function toggleFull() {
    S.full = !S.full;
    const box = $("#ep-pu-box");
    const sheet = $("#ep-plan-sheet");
    if (box) box.classList.toggle("is-full", S.full);
    if (sheet) sheet.classList.toggle("ep-plan-sheet-full", S.full);
    drawStrip();
  }

  function svgEl(tag, attrs, text) {
    const n = document.createElementNS(NS, tag);
    if (attrs) for (const k in attrs) n.setAttribute(k, attrs[k]);
    if (text != null) n.textContent = text;
    return n;
  }

  // виртуальное поле с полями под линейки: X слева (высоты), снизу (отступы)
  function drawStrip() {
    const box = $("#ep-pu-box");
    const p = core().project, w = S.wallId && G().wallById(p, S.wallId);
    if (!box || !w) return;
    const H = wallH(p, S.wallId), L = w.len, pad = CFG.padCm;
    box.innerHTML = "";
    const vb = `${-pad} ${-pad} ${L + pad * 1.4} ${H + pad * 1.6}`;
    const svg = svgEl("svg", { viewBox: vb, preserveAspectRatio: "xMidYMid meet", class: "ep-plan-unfsvg" });
    svg.style.touchAction = "none";
    const kk = (H + pad) / (S.full ? 560 : 200); // см в пикселе (для толщин/шрифтов)

    // стена + пол
    svg.appendChild(svgEl("rect", { x: 0, y: 0, width: L, height: H, class: "ep-plan-unfwall" }));
    for (let x = 100; x < L; x += 100) svg.appendChild(svgEl("line", { x1: x, y1: 0, x2: x, y2: H, class: "ep-plan-unfgrid", "stroke-width": kk }));
    for (let y = H - 50; y > 0; y -= 50) svg.appendChild(svgEl("line", { x1: 0, y1: y, x2: L, y2: y, class: "ep-plan-unfgrid", "stroke-width": kk }));
    svg.appendChild(svgEl("line", { x1: 0, y1: H, x2: L, y2: H, class: "ep-plan-unffloor", "stroke-width": 2.5 * kk }));

    const TY = EL().TYPES;
    const els = wallElems(p, S.wallId).slice().sort((a, b) => a.offset - b.offset);
    els.forEach((el) => {
      const x = el.offset, y = H - el.height;
      const cc = circ(p, el);
      const col = cc ? cc.color : "var(--accent)";
      const gr = svgEl("g", { "data-pu-el": el.id, class: "ep-plan-unfel" + (el.status === "mounted" ? " is-done" : "") });

      // линейка от пола (вертикальная, слева от точки)
      svg.appendChild(svgEl("line", { x1: x, y1: H, x2: x, y2: y, class: "ep-plan-unfdimL", "stroke-width": kk }));
      svg.appendChild(svgEl("text", { x: x + 6 * kk, y: (H + y) / 2, "font-size": 11 * kk, "dominant-baseline": "middle", class: "ep-plan-unfdimT" }, Math.round(el.height) + ""));
      // линейка от угла (горизонтальная, по низу)
      svg.appendChild(svgEl("line", { x1: 0, y1: H + 18 * kk, x2: x, y2: H + 18 * kk, class: "ep-plan-unfdimL", "stroke-width": kk }));
      svg.appendChild(svgEl("text", { x: x / 2, y: H + 30 * kk, "font-size": 11 * kk, "text-anchor": "middle", class: "ep-plan-unfdimT" }, Math.round(el.offset) + ""));

      if (el.type === "block") {
        const items = (el.params && el.params.items) || ["socket"];
        const step2 = 18 * kk, bw = items.length * step2 + 6 * kk, bh = 24 * kk;
        gr.appendChild(svgEl("rect", { x: x - bw / 2, y: y - bh / 2, width: bw, height: bh, rx: 5 * kk, fill: col, class: "ep-plan-unfshape" }));
        items.forEach((it, i) => gr.appendChild(svgEl("text", { x: x - bw / 2 + 3 * kk + step2 * i + step2 / 2, y, "font-size": 9 * kk, "text-anchor": "middle", "dominant-baseline": "central", class: "ep-plan-unfglyph" }, (TY[it] || {}).glyph || "?")));
      } else {
        gr.appendChild(svgEl("circle", { cx: x, cy: y, r: 13 * kk, fill: col, class: "ep-plan-unfshape" }));
        gr.appendChild(svgEl("text", { x, y, "font-size": 10 * kk, "text-anchor": "middle", "dominant-baseline": "central", class: "ep-plan-unfglyph" }, (TY[el.type] || {}).glyph || "?"));
      }
      if (cc) gr.appendChild(svgEl("text", { x, y: y - 18 * kk, "font-size": 8.5 * kk, "text-anchor": "middle", fill: col, class: "ep-plan-unfqf" }, cc.name));
      svg.appendChild(gr);
    });
    box.appendChild(svg);
    bindStrip(svg, w, H, pad, L);
  }

  function stripPoint(svg, w, H, pad, L, clientX, clientY) {
    const r = svg.getBoundingClientRect();
    const vbw = L + pad * 1.4, vbh = H + pad * 1.6;
    const scale = Math.min(r.width / vbw, r.height / vbh);
    const ox = (r.width - vbw * scale) / 2, oy = (r.height - vbh * scale) / 2;
    return { x: (clientX - r.left - ox) / scale - pad, y: (clientY - r.top - oy) / scale - pad };
  }
  function bindStrip(svg, w, H, pad, L) {
    svg.addEventListener("pointerdown", (e) => {
      const p = core().project, step = p.settings.gridStep;
      const pt = stripPoint(svg, w, H, pad, L, e.clientX, e.clientY);
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
      const pt = stripPoint(svg, w, H, pad, L, e.clientX, e.clientY);
      S.drag.moved = true;
      S.drag.el.offset = G().snap(Math.max(0, Math.min(w.len, pt.x)), step);
      S.drag.el.height = G().snap(Math.max(0, Math.min(H, H - pt.y)), step);
      drawStrip(); rooms().renderScene();
    });
    const done = () => { if (!S.drag) return; if (S.drag.moved) core().persist("elem-move"); S.drag = null; };
    svg.addEventListener("pointerup", done);
    svg.addEventListener("pointercancel", done);
  }

  document.addEventListener("click", (e) => {
    if (!rooms() || !rooms().isActive()) return;
    const t = e.target; let b;
    if (t.closest("[data-pu-close]")) { close(); rooms().closeSheet(); const sh = $("#ep-plan-sheet"); if (sh) sh.classList.remove("ep-plan-sheet-full"); return; }
    if (t.closest("[data-pu-full]")) return toggleFull();
    if ((b = t.closest("[data-pu-type]"))) {
      S.addType = b.getAttribute("data-pu-type");
      document.querySelectorAll("[data-pu-type]").forEach((x) => x.classList.toggle("on", x === b));
    }
  });

  EP.Plan = EP.Plan || {};
  EP.Plan.Unfold = { open, close, isOpen, drawStrip, CFG };
})();
