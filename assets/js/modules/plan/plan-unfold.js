/* Electric Pro V29 — Проект квартиры: развёртка стены v3 (Слой 3+).
   Тап по стене -> плоский вид (длина × высота). Полный экран. Пинч-зум/пан пальцами.
   Добавление механизмов И проёмов (двери/окна) прямо в развёртке. Линейки: от
   БЛИЖАЙШЕГО угла (по низу, со сдвигом рядов) и от пола (слева) — чтобы не накладывались. */
(() => {
  "use strict";
  window.EP = window.EP || {};
  const NS = "http://www.w3.org/2000/svg";

  const CFG = {
    hitPx: 24, padCm: 40,
    addTypes: ["block", "socket", "switch", "tv", "internet", "ac", "camera", "sensor"],
    openTypes: ["door", "window", "sliding", "balcony"]
  };
  const T = { title: "Стена", hint: "Пальцами — зум/сдвиг · тап по пустому — добавить · тяни точку · размеры от ближайшего угла и пола" };

  const esc = (s) => String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const $ = (sel, r) => (r || document).querySelector(sel);
  const core = () => EP.Plan.Core;
  const G = () => EP.Plan.Geometry;
  const rooms = () => EP.Plan.Rooms;
  const EL = () => EP.Plan.Elements;
  const isOpenKind = (k) => !!(EP.Plan.Core.OPENING_KINDS && EP.Plan.Core.OPENING_KINDS[k]);

  const S = { wallId: null, addType: "socket", drag: null, full: false, view: null };

  function wallH(p, wallId) {
    const roomId = String(wallId).split(":")[0];
    const room = (p.rooms || []).find((r) => r.id === roomId);
    return (room && room.height) || p.settings.ceilingHeight;
  }
  function wallElems(p, wallId) { return p.elements.filter((e) => e.wallId === wallId); }
  function circ(p, el) { return el.circuitId ? (p.circuits || []).find((c) => c.id === el.circuitId) : null; }
  function roomWalls(p, wallId) {
    const roomId = String(wallId).split(":")[0];
    const room = (p.rooms || []).find((r) => r.id === roomId);
    return room ? G().walls(room) : [];
  }
  // стартовый viewBox: вся стена + поля под линейки
  function fitView(H, L) { const pad = CFG.padCm; return { x: -pad, y: -pad * 1.3, w: L + pad * 2, h: H + pad * 1.3 + 96 }; }

  function open(wallId) {
    S.wallId = wallId; S.view = null;
    const p = core().project, w = G().wallById(p, wallId);
    if (!w) return;
    const TY = EL().TYPES, OT = EL().OPEN_TYPES || {};
    const walls = roomWalls(p, wallId);
    const chip = (k, glyph) => `<button type="button" class="ep-plan-chip ep-clickable ${S.addType === k ? "on" : ""}" data-pu-type="${k}">${esc(glyph)}</button>`;
    rooms().openSheet(`<div class="ep-plan-srow"><b>${T.title} ${w.n}</b>
        <span>· ${G().fmtLen(w.len)} × ${G().fmtLen(wallH(p, wallId))}</span>
        <span class="ep-plan-flex"></span>
        <button type="button" class="ep-plan-mini ep-clickable" data-pu-fit aria-label="Показать всё">⛶</button>
        <button type="button" class="ep-plan-mini ep-clickable" data-pu-full aria-label="Во весь экран">⤢</button>
        <button type="button" class="ep-plan-mini ep-clickable" data-pu-close>✕</button></div>
      <div class="ep-plan-srow ep-plan-unfwalls">Стена:${walls.map((ww) =>
        `<button type="button" class="ep-plan-chip ep-clickable ${ww.id === wallId ? "on" : ""}" data-pu-wall="${esc(ww.id)}">${ww.n}</button>`).join("")}
      </div>
      <div class="ep-plan-srow ep-plan-unftypes">${CFG.addTypes.map((k) => chip(k, TY[k].glyph)).join("")}
        <span class="ep-plan-unfsep"></span>${CFG.openTypes.map((k) => chip(k, (OT[k] || {}).glyph || "?")).join("")}
      </div>
      <div class="ep-plan-unfold ${S.full ? "is-full" : ""}" id="ep-pu-box"></div>
      <div class="ep-plan-modehint">${T.hint}</div>`);
    drawStrip();
  }
  const isOpen = () => !!(S.wallId && $("#ep-pu-box"));
  function close() { S.wallId = null; S.full = false; S.view = null; }
  function toggleFull() {
    S.full = !S.full;
    const box = $("#ep-pu-box"), sheet = $("#ep-plan-sheet");
    if (box) box.classList.toggle("is-full", S.full);
    if (sheet) sheet.classList.toggle("ep-plan-sheet-full", S.full);
    try {
      if (S.full) {
        const target = sheet || box;
        if (target && target.requestFullscreen) target.requestFullscreen().then(() => { if (screen.orientation && screen.orientation.lock) screen.orientation.lock("landscape").catch(() => {}); }).catch(() => {});
      } else {
        if (screen.orientation && screen.orientation.unlock) { try { screen.orientation.unlock(); } catch (e) {} }
        if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
      }
    } catch (e) {}
    drawStrip();
  }

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
    const H = wallH(p, S.wallId), L = w.len;
    if (!S.view) S.view = fitView(H, L);
    const v = S.view;
    box.innerHTML = "";
    const svg = svgEl("svg", { viewBox: `${v.x} ${v.y} ${v.w} ${v.h}`, preserveAspectRatio: "xMidYMid meet", class: "ep-plan-unfsvg" });
    svg.style.touchAction = "none";
    const kk = v.h / (S.full ? 620 : 340); // см в пикселе (толщины/шрифты ~ постоянны на экране)

    // стена + сетка + пол
    svg.appendChild(svgEl("rect", { x: 0, y: 0, width: L, height: H, class: "ep-plan-unfwall" }));
    for (let x = 100; x < L; x += 100) svg.appendChild(svgEl("line", { x1: x, y1: 0, x2: x, y2: H, class: "ep-plan-unfgrid", "stroke-width": kk }));
    for (let y = H - 50; y > 0; y -= 50) svg.appendChild(svgEl("line", { x1: 0, y1: y, x2: L, y2: y, class: "ep-plan-unfgrid", "stroke-width": kk }));
    svg.appendChild(svgEl("line", { x1: 0, y1: H, x2: L, y2: H, class: "ep-plan-unffloor", "stroke-width": 2.5 * kk }));

    // проёмы (тап — редактор проёма)
    (p.openings || []).filter((o) => o.wallId === S.wallId).forEach((op) => {
      const oh = op.height || (op.type === "window" ? 140 : 200), sill = op.sill || 0;
      const yTop = H - (sill + oh), hgt = Math.min(oh, H - sill);
      const isWin = op.type === "window" || op.kind === "window" || op.kind === "balcony";
      svg.appendChild(svgEl("rect", { "data-pu-open": op.id, x: op.offset, y: yTop, width: op.width, height: hgt, class: "ep-plan-unfopen" + (isWin ? " is-win" : ""), "stroke-width": 1.5 * kk }));
      const meta = (EL().OPEN_TYPES || {})[op.kind || (isWin ? "window" : "door")] || {};
      svg.appendChild(svgEl("text", { "data-pu-open": op.id, x: op.offset + op.width / 2, y: yTop + 12 * kk, "font-size": 10 * kk, "text-anchor": "middle", class: "ep-plan-unfopent" }, (EL().openingNum ? EL().openingNum(p, op) : (meta.glyph || ""))));
    });

    // щит на этой стене
    (p.panels || []).forEach((pn) => {
      const c = G().closestOnSeg({ x: pn.x, y: pn.y }, w.a, w.b);
      if (c.d > 60) return;
      const bx = p.settings.panelBox, px = c.t * L, ph = p.settings.panelHeight || 150;
      const pw = bx && bx.wmm ? bx.wmm / 10 : 36, phh = bx && bx.hmm ? bx.hmm / 10 : 60, py = H - ph;
      svg.appendChild(svgEl("rect", { x: px - pw / 2, y: py - phh / 2, width: pw, height: phh, rx: 3, class: "ep-plan-unfpanel", "stroke-width": 1.5 * kk }));
      svg.appendChild(svgEl("text", { x: px, y: py, "font-size": 12 * kk, "text-anchor": "middle", "dominant-baseline": "central", class: "ep-plan-unfpanelt" }, "Щ"));
    });

    const TY = EL().TYPES;
    const els = wallElems(p, S.wallId).slice().sort((a, b) => a.offset - b.offset);
    els.forEach((el, idx) => {
      const x = el.offset, y = H - el.height;
      const cc = circ(p, el);
      const col = cc ? cc.color : "var(--accent)";
      const gr = svgEl("g", { "data-pu-el": el.id, class: "ep-plan-unfel" + (el.status === "mounted" ? " is-done" : "") });

      // линейка от пола (вертикальная у точки)
      svg.appendChild(svgEl("line", { x1: x, y1: H, x2: x, y2: y, class: "ep-plan-unfdimL", "stroke-width": kk }));
      svg.appendChild(svgEl("text", { x: x + 6 * kk, y: (H + y) / 2, "font-size": 11 * kk, "dominant-baseline": "middle", class: "ep-plan-unfdimT" }, Math.round(el.height) + ""));
      // линейка от БЛИЖАЙШЕГО угла (по низу), ряды через один — чтобы не накладывались
      const cornerX = x <= L - x ? 0 : L, dist = Math.round(cornerX === 0 ? x : L - x);
      const yDim = H + (16 + (idx % 2) * 15) * kk;
      svg.appendChild(svgEl("line", { x1: cornerX, y1: yDim, x2: x, y2: yDim, class: "ep-plan-unfdimL", "stroke-width": kk }));
      svg.appendChild(svgEl("line", { x1: x, y1: H, x2: x, y2: yDim, class: "ep-plan-unfdimL", "stroke-width": kk * 0.7 }));
      svg.appendChild(svgEl("text", { x: (cornerX + x) / 2, y: yDim - 3 * kk, "font-size": 11 * kk, "text-anchor": "middle", class: "ep-plan-unfdimT" }, dist + ""));

      if (el.type === "block") {
        const items = (el.params && el.params.items) || ["socket"];
        const step2 = 18 * kk, bw = items.length * step2 + 6 * kk, bh = 24 * kk;
        gr.appendChild(svgEl("rect", { x: x - bw / 2, y: y - bh / 2, width: bw, height: bh, rx: 5 * kk, fill: col, class: "ep-plan-unfshape" }));
        items.forEach((it, i) => gr.appendChild(svgEl("text", { x: x - bw / 2 + 3 * kk + step2 * i + step2 / 2, y, "font-size": 9 * kk, "text-anchor": "middle", "dominant-baseline": "central", class: "ep-plan-unfglyph" }, (TY[it] || {}).glyph || "?")));
        items.forEach((it, i) => gr.appendChild(svgEl("rect", { "data-pu-post": i, x: x - bw / 2 + 3 * kk + step2 * i, y: y - bh / 2, width: step2, height: bh, fill: "transparent" })));
        const eIdx = G().blockEntryIndex(el);
        gr.appendChild(svgEl("circle", { cx: x - bw / 2 + 3 * kk + step2 * eIdx + step2 / 2, cy: y + bh / 2 + 5 * kk, r: 3 * kk, class: "ep-plan-unfentry" }));
      } else {
        gr.appendChild(svgEl("circle", { cx: x, cy: y, r: 13 * kk, fill: col, class: "ep-plan-unfshape" }));
        gr.appendChild(svgEl("text", { x, y, "font-size": 10 * kk, "text-anchor": "middle", "dominant-baseline": "central", class: "ep-plan-unfglyph" }, (TY[el.type] || {}).glyph || "?"));
      }
      if (cc) gr.appendChild(svgEl("text", { x, y: y - 18 * kk, "font-size": 8.5 * kk, "text-anchor": "middle", fill: col, class: "ep-plan-unfqf" }, cc.name));
      svg.appendChild(gr);
    });
    box.appendChild(svg);
    bindStrip(svg, w, H, L);
  }

  // экран -> мир, с учётом текущего viewBox и центрирования meet
  function toWorld(svg, clientX, clientY) {
    const v = S.view, r = svg.getBoundingClientRect();
    const scale = Math.min(r.width / v.w, r.height / v.h);
    const ox = (r.width - v.w * scale) / 2, oy = (r.height - v.h * scale) / 2;
    return { x: v.x + (clientX - r.left - ox) / scale, y: v.y + (clientY - r.top - oy) / scale };
  }
  function applyView(svg) { const v = S.view; svg.setAttribute("viewBox", `${v.x} ${v.y} ${v.w} ${v.h}`); }

  function bindStrip(svg, w, H, L) {
    const pts = new Map();
    let pinch = null, moved = false, downClient = null, pending = null;
    const pxPerCm = () => { const r = svg.getBoundingClientRect(); return Math.min(r.width / S.view.w, r.height / S.view.h) || 1; };
    const dist2 = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
    function pinchInfo() { const [a, b] = [...pts.values()]; return { d: Math.max(10, dist2(a, b)), cx: (a.x + b.x) / 2, cy: (a.y + b.y) / 2 }; }

    svg.addEventListener("pointerdown", (e) => {
      svg.setPointerCapture(e.pointerId);
      pts.set(e.pointerId, { x: e.clientX, y: e.clientY });
      if (pts.size === 2) { pinch = pinchInfo(); S.drag = null; pending = null; return; }
      const p = core().project;
      downClient = { x: e.clientX, y: e.clientY }; moved = false; pending = null;
      const og = e.target.closest && e.target.closest("[data-pu-open]");
      if (og) { pending = { kind: "open", id: og.getAttribute("data-pu-open") }; return; }
      const g = e.target.closest && e.target.closest("[data-pu-el]");
      if (g) {
        const el = p.elements.find((x) => x.id === g.getAttribute("data-pu-el"));
        if (!el) return;
        const pg = e.target.closest && e.target.closest("[data-pu-post]");
        core().commit();
        S.drag = { el, moved: false, postIdx: pg ? Number(pg.getAttribute("data-pu-post")) : null };
        return;
      }
      pending = { kind: "empty" }; // тап по пустому -> добавить; движение -> пан
    });
    svg.addEventListener("pointermove", (e) => {
      if (!pts.has(e.pointerId)) return;
      const prev = pts.get(e.pointerId);
      pts.set(e.pointerId, { x: e.clientX, y: e.clientY });
      if (pts.size === 2 && pinch) {
        const cur = pinchInfo(), k = pinch.d / cur.d;      // >1 — отдаление
        const wc = toWorld(svg, cur.cx, cur.cy);
        S.view.w = Math.max(40, Math.min((L + 400) * 4, S.view.w * k));
        S.view.h = Math.max(40, Math.min((H + 400) * 4, S.view.h * k));
        const wc2 = toWorld(svg, cur.cx, cur.cy);
        S.view.x += wc.x - wc2.x; S.view.y += wc.y - wc2.y;
        const kpx = pxPerCm();
        S.view.x -= (cur.cx - pinch.cx) / kpx; S.view.y -= (cur.cy - pinch.cy) / kpx;
        pinch = cur; applyView(svg); return;
      }
      if (pts.size !== 1) return;
      if (S.drag) {
        const p = core().project, step = p.settings.gridStep, pt = toWorld(svg, e.clientX, e.clientY);
        S.drag.moved = true;
        S.drag.el.offset = G().snap(Math.max(0, Math.min(w.len, pt.x)), step);
        S.drag.el.height = G().snap(Math.max(0, Math.min(H, H - pt.y)), step);
        drawStrip(); rooms().renderScene(); return;
      }
      // пан по пустому/проёму, если сдвинули палец
      if (downClient && Math.hypot(e.clientX - downClient.x, e.clientY - downClient.y) > 6) {
        moved = true;
        const kpx = pxPerCm();
        S.view.x -= (e.clientX - prev.x) / kpx; S.view.y -= (e.clientY - prev.y) / kpx;
        applyView(svg);
      }
    });
    function end(e) {
      pts.delete(e.pointerId);
      if (pts.size < 2) pinch = null;
      if (S.drag) {
        if (S.drag.moved) core().persist("elem-move");
        else if (S.drag.postIdx != null && S.drag.el.type === "block") { S.drag.el.entryPost = S.drag.postIdx; core().persist("block-entry"); drawStrip(); rooms().renderScene(); }
        S.drag = null; return;
      }
      if (pts.size === 0 && pending && !moved) {
        const p = core().project, c = core(), step = p.settings.gridStep, pt = toWorld(svg, e.clientX, e.clientY);
        if (pending.kind === "open") { const op = (p.openings || []).find((o) => o.id === pending.id); if (op && EL().openOpeningEditor) EL().openOpeningEditor(op); }
        else if (pending.kind === "empty" && pt.x >= 0 && pt.x <= w.len) {
          if (isOpenKind(S.addType)) { // добавить проём
            c.commit();
            const op = c.model.newOpening(S.addType, S.wallId, G().snap(Math.max(0, pt.x), step), undefined);
            p.openings.push(op); c.persist("opening-add"); drawStrip(); rooms().renderScene();
          } else if (pt.y >= 0 && pt.y <= H) { // добавить механизм
            const TYd = EL().TYPES[S.addType];
            c.commit();
            const el = c.model.newElement(S.addType, S.wallId, G().snap(pt.x, step), G().snap(Math.max(0, H - pt.y), step), TYd.layer);
            if (TYd.block) el.params = { items: ["socket"] };
            p.elements.push(el); c.persist("elem-add"); drawStrip(); rooms().renderScene();
          }
        }
      }
      pending = null; moved = false;
      if (pts.size === 0 && (S.view)) drawStrip(); // перерисовать чётко после жеста
    }
    svg.addEventListener("pointerup", end);
    svg.addEventListener("pointercancel", (e) => { pts.delete(e.pointerId); pinch = null; S.drag = null; pending = null; });
  }

  document.addEventListener("click", (e) => {
    if (!rooms() || !rooms().isActive()) return;
    const t = e.target; let b;
    if (t.closest("[data-pu-close]")) { close(); rooms().closeSheet(); const sh = $("#ep-plan-sheet"); if (sh) sh.classList.remove("ep-plan-sheet-full"); return; }
    if (t.closest("[data-pu-full]")) return toggleFull();
    if (t.closest("[data-pu-fit]")) { const p = core().project, w = G().wallById(p, S.wallId); if (w) { S.view = fitView(wallH(p, S.wallId), w.len); drawStrip(); } return; }
    if ((b = t.closest("[data-pu-wall]"))) { open(b.getAttribute("data-pu-wall")); return; }
    if ((b = t.closest("[data-pu-type]"))) {
      S.addType = b.getAttribute("data-pu-type");
      document.querySelectorAll("[data-pu-type]").forEach((x) => x.classList.toggle("on", x === b));
    }
  });

  EP.Plan = EP.Plan || {};
  EP.Plan.Unfold = { open, close, isOpen, drawStrip, CFG };
})();
