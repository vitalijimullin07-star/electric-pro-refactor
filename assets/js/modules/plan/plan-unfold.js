/* Electric Pro V29 — Проект квартиры: развёртка стены v4 (Слой 3+).
   Плоский вид стены (длина × высота). Панель управления всегда на виду: выбор стены,
   ПАЛИТРА добавления (механизмы + проёмы), ползунок размера символов. Пинч-зум/пан.
   Размеры — от ВНУТРЕННИХ углов (работаем изнутри квартиры): вертикаль (высота от пола)
   и размерная ЦЕПЬ по низу (синим), сегменты между точками + общий размер. */
(() => {
  "use strict";
  window.EP = window.EP || {};
  const NS = "http://www.w3.org/2000/svg";

  const CFG = {
    hitPx: 24, padCm: 40,
    addTypes: ["block", "socket", "switch", "tv", "internet", "ac", "camera", "sensor"],
    openTypes: ["door", "window", "sliding", "balcony"]
  };
  const T = { title: "Стена", hint: "Пальцами — зум/сдвиг · выбери тип и тапни по пустому — добавить · тяни точку" };

  const esc = (s) => String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const $ = (sel, r) => (r || document).querySelector(sel);
  const core = () => EP.Plan.Core;
  const G = () => EP.Plan.Geometry;
  const rooms = () => EP.Plan.Rooms;
  const EL = () => EP.Plan.Elements;
  const isOpenKind = (k) => !!(EP.Plan.Core.OPENING_KINDS && EP.Plan.Core.OPENING_KINDS[k]);

  const S = { wallId: null, addType: "socket", drag: null, full: false, view: null, sym: 1, lastTap: null, ptPanel: null };

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
  function wallTh(p) { return Math.max(4, (p.settings && p.settings.wallThickness) || 10); }
  function fitView(H, L) { const pad = CFG.padCm; return { x: -pad, y: -pad * 1.3, w: L + pad * 2, h: H + pad * 1.3 + 110 }; }

  function open(wallId, full) {
    S.wallId = wallId; S.view = null; S.ptPanel = null; S.lastTap = null;
    if (full != null) S.full = !!full; // тап по стене на главном → сразу во весь экран
    const p = core().project, w = G().wallById(p, wallId);
    if (!w) return;
    const TY = EL().TYPES, OT = EL().OPEN_TYPES || {};
    const walls = roomWalls(p, wallId);
    const chip = (k, glyph) => `<button type="button" class="ep-plan-chip ep-clickable ${S.addType === k ? "on" : ""}" data-pu-type="${k}">${esc(glyph)}</button>`;
    const tbtn = (act, glyph, label) => `<button type="button" class="ep-plan-chip ep-clickable" data-pu-act="${act}" aria-label="${esc(label)}" title="${esc(label)}">${glyph}</button>`;
    rooms().openSheet(`<div class="ep-plan-srow ep-plan-unfhead"><b>${T.title} ${w.n}</b>
        <span>· ${G().fmtLen(w.len)} × ${G().fmtLen(wallH(p, wallId))}</span>
        <span class="ep-plan-flex"></span>
        <button type="button" class="ep-plan-mini ep-clickable" data-pu-fit aria-label="Показать всё">⛶</button>
        <button type="button" class="ep-plan-mini ep-clickable" data-pu-full aria-label="Во весь экран">⤢</button>
        <button type="button" class="ep-plan-mini ep-clickable" data-pu-close>✕</button></div>
      <div class="ep-plan-unfmain">
        <div class="ep-plan-unfctrls">
          <div class="ep-plan-unfbar ep-plan-unftools">
            <span class="ep-plan-unflbl">План:</span>${tbtn("undo", "↶", "Отменить")}${tbtn("redo", "↷", "Вернуть")}
            <span class="ep-plan-unfsep"></span>${tbtn("trace", "🧵", "Автотрассировка")}${tbtn("checks", "✅", "Проверки норм")}${tbtn("calc", "🧮", "Расчёт и смета")}${tbtn("scheme", "▤", "Однолинейная схема")}${tbtn("pdf", "📄", "Печатный лист (PDF)")}
          </div>
          <div class="ep-plan-unfbar">
            <span class="ep-plan-unflbl">Стена:</span>${walls.map((ww) => `<button type="button" class="ep-plan-chip ep-clickable ${ww.id === wallId ? "on" : ""}" data-pu-wall="${esc(ww.id)}">${ww.n}</button>`).join("")}
          </div>
          <div class="ep-plan-unfbar">
            <span class="ep-plan-unflbl">Добавить:</span>${CFG.addTypes.map((k) => chip(k, TY[k].glyph)).join("")}
            <span class="ep-plan-unfsep"></span>${CFG.openTypes.map((k) => chip(k, (OT[k] || {}).glyph || "?")).join("")}
          </div>
          <div class="ep-plan-unfbar">
            <span class="ep-plan-unflbl">Толщина, см:</span>
            <input type="number" inputmode="numeric" min="4" max="80" value="${Math.round(G().wallThOf(p, w))}" data-pu-wth class="ep-plan-unfnum">
            <span class="ep-plan-unfsep"></span>
            ${(EP.Plan.Core.DEFAULTS.partitionMaterials || []).map((m) => `<button type="button" class="ep-plan-chip ep-clickable ${G().wallMatOf(p, w) === m ? "on" : ""}" data-pu-wmat="${esc(m)}">${esc(m)}</button>`).join("")}
          </div>
          <div class="ep-plan-unfbar"><span class="ep-plan-unflbl">Размер значков:</span>
            <input type="range" min="60" max="220" value="${Math.round(S.sym * 100)}" data-pu-sym class="ep-plan-unfslider"></div>
        </div>
        <div class="ep-plan-unfold ${S.full ? "is-full" : ""}" id="ep-pu-box"></div>
      </div>
      <div class="ep-plan-modehint">${T.hint}</div>`);
    const sh = $("#ep-plan-sheet"); if (sh) sh.classList.toggle("ep-plan-sheet-full", S.full);
    drawStrip();
    if (S.full) requestFS();
  }
  const isOpen = () => !!(S.wallId && $("#ep-pu-box"));
  function close() { S.wallId = null; S.full = false; S.view = null; S.ptPanel = null; S.lastTap = null; }

  function requestFS() {
    const sheet = $("#ep-plan-sheet"), box = $("#ep-pu-box"), target = sheet || box;
    try {
      if (target && target.requestFullscreen && !document.fullscreenElement)
        target.requestFullscreen().then(() => { if (screen.orientation && screen.orientation.lock) screen.orientation.lock("landscape").catch(() => {}); }).catch(() => {});
    } catch (e) {}
  }
  function enterFS() {
    S.full = true;
    const sheet = $("#ep-plan-sheet"), box = $("#ep-pu-box");
    if (box) box.classList.add("is-full");
    if (sheet) sheet.classList.add("ep-plan-sheet-full");
    requestFS(); drawStrip();
  }
  function exitFS() {
    S.full = false;
    const sheet = $("#ep-plan-sheet"), box = $("#ep-pu-box");
    if (box) box.classList.remove("is-full");
    if (sheet) sheet.classList.remove("ep-plan-sheet-full");
    try { if (screen.orientation && screen.orientation.unlock) screen.orientation.unlock(); } catch (e) {}
    try { if (document.fullscreenElement) document.exitFullscreen().catch(() => {}); } catch (e) {}
  }
  function toggleFull() { if (S.full) { exitFS(); drawStrip(); } else enterFS(); }

  // карточка ТОЧКИ (двойной тап): справа, под большой палец — высота, от угла, посты рамки
  function ptEl() { const p = core().project; return S.ptPanel ? (p.elements || []).find((e) => e.id === S.ptPanel) : null; }
  function renderPtPanel() {
    const box = $("#ep-pu-box"); if (!box) return;
    const prev = box.querySelector(".ep-plan-unfpt"); if (prev) prev.remove();
    const el = ptEl(); if (!el) { S.ptPanel = null; return; }
    const p = core().project, w = G().wallById(p, S.wallId);
    const TY = EL().TYPES, meta = TY[el.type] || { name: el.type, glyph: "?" };
    const cc = circ(p, el);
    const isBlock = el.type === "block";
    const items = isBlock ? ((el.params && el.params.items) || ["socket"]) : null;
    const stepBtns = (key) => `
      <button type="button" class="ep-plan-unfpt-b ep-clickable" data-pu-pt="${key}-5">−5</button>
      <button type="button" class="ep-plan-unfpt-b ep-clickable" data-pu-pt="${key}-1">−1</button>
      <button type="button" class="ep-plan-unfpt-b ep-clickable" data-pu-pt="${key}+1">+1</button>
      <button type="button" class="ep-plan-unfpt-b ep-clickable" data-pu-pt="${key}+5">+5</button>`;
    const d = document.createElement("div");
    d.className = "ep-plan-unfpt";
    d.innerHTML = `<div class="ep-plan-unfpt-h"><b>${esc(meta.glyph)} ${esc(meta.name)}</b>${cc ? `<span style="color:${esc(cc.color)}">${esc(cc.name)}</span>` : ""}
        <span class="ep-plan-flex"></span><button type="button" class="ep-plan-mini ep-clickable" data-pu-pt-close aria-label="Закрыть">✕</button></div>
      <label class="ep-plan-unfpt-l">Высота от пола, см</label>
      <div class="ep-plan-unfpt-row"><input type="number" inputmode="numeric" min="0" data-pu-pt-h value="${Math.round(el.height || 0)}" class="ep-plan-unfnum">${stepBtns("h")}</div>
      <label class="ep-plan-unfpt-l">От угла, см</label>
      <div class="ep-plan-unfpt-row"><input type="number" inputmode="numeric" min="0" ${w ? `max="${Math.round(w.len)}"` : ""} data-pu-pt-o value="${Math.round(el.offset || 0)}" class="ep-plan-unfnum">${stepBtns("o")}</div>
      ${isBlock ? `<label class="ep-plan-unfpt-l">Постов в рамке: <b>${items.length}</b> (до 6)</label>
      <div class="ep-plan-unfpt-row">
        <button type="button" class="ep-plan-unfpt-b is-wide ep-clickable" data-pu-pt="p-">− пост</button>
        <button type="button" class="ep-plan-unfpt-b is-wide ep-clickable" data-pu-pt="p+">+ пост</button>
      </div>` : ""}
      <div class="ep-plan-unfpt-row"><button type="button" class="ep-plan-unfpt-b is-wide ep-clickable" data-pu-pt-edit>⚙ Полный редактор</button></div>`;
    box.appendChild(d);
  }
  function ptChange(fn, what) {
    const el = ptEl(); if (!el) return;
    const c = core(), p = c.project, w = G().wallById(p, S.wallId);
    const H = wallH(p, S.wallId);
    c.commit();
    fn(el, { H, L: w ? w.len : 10000 });
    c.persist(what || "elem-edit");
    drawStrip(); rooms().renderScene();
  }

  // проверки норм — плавающая карточка поверх развёртки (не сворачивая её)
  function showChecks() {
    const box = $("#ep-pu-box"); if (!box) return;
    const p = core().project;
    const res = EP.Plan.Rules ? EP.Plan.Rules.run(p) : { issues: [] };
    const prev = box.querySelector(".ep-plan-unfover"); if (prev) prev.remove();
    const ov = document.createElement("div");
    ov.className = "ep-plan-unfover";
    const body = (res.issues && res.issues.length)
      ? `<ul>${res.issues.map((i) => `<li>${esc(i.msg)}</li>`).join("")}</ul>`
      : `<p class="ep-plan-unfover-ok">Замечаний нет ✓</p>`;
    ov.innerHTML = `<div class="ep-plan-unfover-h"><b>✅ Проверки норм</b><button type="button" class="ep-plan-mini ep-clickable" data-pu-over-close aria-label="Закрыть">✕</button></div>${body}`;
    box.appendChild(ov);
  }

  // толщина/материал ЭТОЙ стены (для стены комнаты — переопределение, для перегородки — сама перегородка)
  function setWallTh(v) {
    v = Math.max(4, Math.min(80, Math.round(Number(v) || 0)));
    const c = core(), p = c.project, w = G().wallById(p, S.wallId);
    if (!w || v < 4) return;
    c.commit();
    if (w.isBeam) { const bm = (p.beams || []).find((b) => b.id === w.beamId); if (bm) bm.width = v; }
    else { const room = (p.rooms || []).find((r) => r.id === w.roomId); if (room) { room.wallTh = room.wallTh || {}; room.wallTh[w.i] = v; } }
    c.persist("wall-th");
    drawStrip(); rooms().renderScene();
  }
  function setWallMat(m) {
    const c = core(), p = c.project, w = G().wallById(p, S.wallId);
    if (!w) return;
    c.commit();
    if (w.isBeam) { const bm = (p.beams || []).find((b) => b.id === w.beamId); if (bm) bm.material = m; }
    else { const room = (p.rooms || []).find((r) => r.id === w.roomId); if (room) { room.wallMat = room.wallMat || {}; room.wallMat[w.i] = m; } }
    c.persist("wall-mat");
    document.querySelectorAll("[data-pu-wmat]").forEach((x) => x.classList.toggle("on", x.getAttribute("data-pu-wmat") === m));
    drawStrip(); rooms().renderScene();
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
    const H = wallH(p, S.wallId), L = w.len, th = G().wallThOf(p, w);
    if (!S.view) S.view = fitView(H, L);
    const v = S.view;
    box.innerHTML = "";
    const svg = svgEl("svg", { viewBox: `${v.x} ${v.y} ${v.w} ${v.h}`, preserveAspectRatio: "xMidYMid meet", class: "ep-plan-unfsvg" });
    svg.style.touchAction = "none";
    const kk = v.h / (S.full ? 620 : 340);   // толщина линий/сетки (тонкие, по экрану)
    const ks = S.sym * 1.25;                  // размер символов/подписей В СМ — растёт при зуме
    // внутренние углы стены (работаем изнутри — размеры от внутренней грани)
    const inA = Math.min(th / 2, L / 2), inB = Math.max(L - th / 2, L / 2);

    // стена + сетка + пол
    svg.appendChild(svgEl("rect", { x: 0, y: 0, width: L, height: H, class: "ep-plan-unfwall" }));
    for (let x = 100; x < L; x += 100) svg.appendChild(svgEl("line", { x1: x, y1: 0, x2: x, y2: H, class: "ep-plan-unfgrid", "stroke-width": kk }));
    for (let y = H - 50; y > 0; y -= 50) svg.appendChild(svgEl("line", { x1: 0, y1: y, x2: L, y2: y, class: "ep-plan-unfgrid", "stroke-width": kk }));
    svg.appendChild(svgEl("line", { x1: 0, y1: H, x2: L, y2: H, class: "ep-plan-unffloor", "stroke-width": 2.5 * kk }));

    // проёмы
    (p.openings || []).filter((o) => o.wallId === S.wallId).forEach((op) => {
      const oh = op.height || (op.type === "window" ? 140 : 200), sill = op.sill || 0;
      const yTop = H - (sill + oh), hgt = Math.min(oh, H - sill);
      const isWin = op.type === "window" || op.kind === "window" || op.kind === "balcony";
      svg.appendChild(svgEl("rect", { "data-pu-open": op.id, x: op.offset, y: yTop, width: op.width, height: hgt, class: "ep-plan-unfopen" + (isWin ? " is-win" : ""), "stroke-width": 1.5 * kk }));
      const meta = (EL().OPEN_TYPES || {})[op.kind || (isWin ? "window" : "door")] || {};
      svg.appendChild(svgEl("text", { "data-pu-open": op.id, x: op.offset + op.width / 2, y: yTop + 12 * ks, "font-size": 10 * ks, "text-anchor": "middle", class: "ep-plan-unfopent" }, (EL().openingNum ? EL().openingNum(p, op) : (meta.glyph || ""))));
    });

    // щит
    (p.panels || []).forEach((pn) => {
      const c = G().closestOnSeg({ x: pn.x, y: pn.y }, w.a, w.b);
      if (c.d > 60) return;
      const bx = p.settings.panelBox, px = c.t * L, ph = p.settings.panelHeight || 150;
      const pw = bx && bx.wmm ? bx.wmm / 10 : 36, phh = bx && bx.hmm ? bx.hmm / 10 : 60, py = H - ph;
      svg.appendChild(svgEl("rect", { x: px - pw / 2, y: py - phh / 2, width: pw, height: phh, rx: 3, class: "ep-plan-unfpanel", "stroke-width": 1.5 * kk }));
      svg.appendChild(svgEl("text", { x: px, y: py, "font-size": 12 * ks, "text-anchor": "middle", "dominant-baseline": "central", class: "ep-plan-unfpanelt" }, "Щ"));
    });

    const els = wallElems(p, S.wallId).slice().sort((a, b) => a.offset - b.offset);
    const chY = H + 30 * ks, ovY = chY + 18 * ks; // цепь размеров и общий размер по низу (в см)

    // размерная ЦЕПЬ по низу (от внутренних углов, синим)
    const stations = [];
    [inA].concat(els.map((e) => Math.max(inA, Math.min(inB, e.offset)))).concat([inB]).sort((a, b) => a - b).forEach((s) => { if (!stations.length || Math.abs(s - stations[stations.length - 1]) > 1) stations.push(s); });
    svg.appendChild(svgEl("line", { x1: inA, y1: chY, x2: inB, y2: chY, class: "ep-plan-unfdimL", "stroke-width": kk }));
    stations.forEach((s) => {
      svg.appendChild(svgEl("line", { x1: s, y1: H, x2: s, y2: chY, class: "ep-plan-unfdimE", "stroke-width": kk * 0.7 })); // выносная
      svg.appendChild(svgEl("line", { x1: s, y1: chY - 4 * ks, x2: s, y2: chY + 4 * ks, class: "ep-plan-unfdimL", "stroke-width": kk })); // засечка
    });
    for (let i = 0; i < stations.length - 1; i++) {
      const seg = Math.round(stations[i + 1] - stations[i]);
      if (seg < 2) continue;
      svg.appendChild(svgEl("text", { x: (stations[i] + stations[i + 1]) / 2, y: chY - 5 * ks, "font-size": 11 * ks, "text-anchor": "middle", class: "ep-plan-unfdimT" }, seg + ""));
    }
    // общий размер (внутренняя длина стены)
    svg.appendChild(svgEl("line", { x1: inA, y1: ovY, x2: inB, y2: ovY, class: "ep-plan-unfdimL", "stroke-width": kk }));
    [inA, inB].forEach((s) => svg.appendChild(svgEl("line", { x1: s, y1: ovY - 4 * ks, x2: s, y2: ovY + 4 * ks, class: "ep-plan-unfdimL", "stroke-width": kk })));
    svg.appendChild(svgEl("text", { x: (inA + inB) / 2, y: ovY - 5 * ks, "font-size": 11 * ks, "text-anchor": "middle", class: "ep-plan-unfdimT" }, Math.round(inB - inA) + ""));

    const TY = EL().TYPES;
    els.forEach((el) => {
      const x = el.offset, y = H - el.height;
      const cc = circ(p, el);
      const col = cc ? cc.color : "var(--accent)";
      const gr = svgEl("g", { "data-pu-el": el.id, class: "ep-plan-unfel" + (el.status === "mounted" ? " is-done" : "") });

      // вертикаль: высота от пола до точки (синим), подпись высоты
      svg.appendChild(svgEl("line", { x1: x, y1: H, x2: x, y2: y, class: "ep-plan-unfdimL", "stroke-width": kk }));
      svg.appendChild(svgEl("text", { x: x + 6 * ks, y: (H + y) / 2, "font-size": 11 * ks, "dominant-baseline": "middle", class: "ep-plan-unfdimT" }, Math.round(el.height) + ""));

      if (el.type === "block") {
        const items = (el.params && el.params.items) || ["socket"];
        const step2 = 18 * ks, bw = items.length * step2 + 6 * ks, bh = 24 * ks;
        gr.appendChild(svgEl("rect", { x: x - bw / 2, y: y - bh / 2, width: bw, height: bh, rx: 5 * ks, fill: col, class: "ep-plan-unfshape" }));
        items.forEach((it, i) => gr.appendChild(svgEl("text", { x: x - bw / 2 + 3 * ks + step2 * i + step2 / 2, y, "font-size": 9 * ks, "text-anchor": "middle", "dominant-baseline": "central", class: "ep-plan-unfglyph" }, (TY[it] || {}).glyph || "?")));
        items.forEach((it, i) => gr.appendChild(svgEl("rect", { "data-pu-post": i, x: x - bw / 2 + 3 * ks + step2 * i, y: y - bh / 2, width: step2, height: bh, fill: "transparent" })));
        const eIdx = G().blockEntryIndex(el);
        gr.appendChild(svgEl("circle", { cx: x - bw / 2 + 3 * ks + step2 * eIdx + step2 / 2, cy: y + bh / 2 + 5 * ks, r: 3 * ks, class: "ep-plan-unfentry" }));
      } else {
        gr.appendChild(svgEl("circle", { cx: x, cy: y, r: 13 * ks, fill: col, class: "ep-plan-unfshape" }));
        gr.appendChild(svgEl("text", { x, y, "font-size": 10 * ks, "text-anchor": "middle", "dominant-baseline": "central", class: "ep-plan-unfglyph" }, (TY[el.type] || {}).glyph || "?"));
      }
      if (cc) gr.appendChild(svgEl("text", { x, y: y - 18 * ks, "font-size": 8.5 * ks, "text-anchor": "middle", fill: col, class: "ep-plan-unfqf" }, cc.name));
      svg.appendChild(gr);
    });
    box.appendChild(svg);
    bindStrip(svg, w, H, L);
    if (S.ptPanel) renderPtPanel(); // карточка точки живёт поверх перерисовок
  }

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
    let penOn = false; // стилус (S Pen / Apple Pencil): пока перо на экране — ладонь игнорируем
    const pxPerCm = () => { const r = svg.getBoundingClientRect(); return Math.min(r.width / S.view.w, r.height / S.view.h) || 1; };
    const dist2 = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
    function pinchInfo() { const [a, b] = [...pts.values()]; return { d: Math.max(10, dist2(a, b)), cx: (a.x + b.x) / 2, cy: (a.y + b.y) / 2 }; }

    svg.addEventListener("pointerdown", (e) => {
      if (e.pointerType === "pen") penOn = true;
      else if (e.pointerType === "touch" && penOn) return; // ладонь при работе стилусом
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
        S.drag = { el, moved: false, postIdx: pg ? Number(pg.getAttribute("data-pu-post")) : null, pen: e.pointerType === "pen" };
        return;
      }
      pending = { kind: "empty" };
    });
    svg.addEventListener("pointermove", (e) => {
      if (!pts.has(e.pointerId)) return;
      const prev = pts.get(e.pointerId);
      pts.set(e.pointerId, { x: e.clientX, y: e.clientY });
      if (pts.size === 2 && pinch) {
        const cur = pinchInfo(), k = pinch.d / cur.d;
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
        const p = core().project, pt = toWorld(svg, e.clientX, e.clientY);
        const step = 1; // ПЛАВНО, с точностью 1 см — без прыжков по сетке
        S.drag.moved = true;
        S.drag.el.offset = G().snap(Math.max(0, Math.min(w.len, pt.x)), step);
        S.drag.el.height = G().snap(Math.max(0, Math.min(H, H - pt.y)), step);
        drawStrip(); rooms().renderScene(); return;
      }
      if (downClient && Math.hypot(e.clientX - downClient.x, e.clientY - downClient.y) > 6) {
        moved = true;
        const kpx = pxPerCm();
        S.view.x -= (e.clientX - prev.x) / kpx; S.view.y -= (e.clientY - prev.y) / kpx;
        applyView(svg);
      }
    });
    function end(e) {
      if (e.pointerType === "pen") penOn = false;
      pts.delete(e.pointerId);
      if (pts.size < 2) pinch = null;
      if (S.drag) {
        if (S.drag.moved) core().persist("elem-move");
        else {
          // двойной тап по точке — карточка параметров (высота / от угла / посты)
          const now = Date.now();
          if (S.lastTap && S.lastTap.id === S.drag.el.id && now - S.lastTap.t < 400) {
            S.ptPanel = S.drag.el.id; S.lastTap = null; renderPtPanel();
          } else {
            S.lastTap = { id: S.drag.el.id, t: now };
            if (S.drag.postIdx != null && S.drag.el.type === "block") { S.drag.el.entryPost = S.drag.postIdx; core().persist("block-entry"); drawStrip(); rooms().renderScene(); }
          }
        }
        S.drag = null; return;
      }
      if (pts.size === 0 && pending && !moved) {
        const p = core().project, c = core(), step = p.settings.gridStep, pt = toWorld(svg, e.clientX, e.clientY);
        if (pending.kind === "open") { const op = (p.openings || []).find((o) => o.id === pending.id); if (op && EL().openOpeningEditor) EL().openOpeningEditor(op); }
        else if (pending.kind === "empty" && pt.x >= 0 && pt.x <= w.len) {
          if (isOpenKind(S.addType)) {
            c.commit();
            const dw = (EP.Plan.Core.OPENING_KINDS[S.addType] || {}).w || 90;
            const off = G().snap(Math.max(0, Math.min(w.len - dw, pt.x - dw / 2)), step);
            p.openings.push(c.model.newOpening(S.addType, S.wallId, Math.max(0, off), undefined));
            c.persist("opening-add"); drawStrip(); rooms().renderScene();
          } else if (pt.y >= 0 && pt.y <= H) {
            const TYd = EL().TYPES[S.addType];
            c.commit();
            const el = c.model.newElement(S.addType, S.wallId, G().snap(pt.x, step), G().snap(Math.max(0, H - pt.y), step), TYd.layer);
            if (TYd.block) el.params = { items: ["socket"] };
            p.elements.push(el); c.persist("elem-add"); drawStrip(); rooms().renderScene();
          }
        }
        pending = null; moved = false; return;
      }
      pending = null; moved = false;
      if (pts.size === 0 && S.view) drawStrip();
    }
    svg.addEventListener("pointerup", end);
    svg.addEventListener("pointercancel", (e) => { if (e.pointerType === "pen") penOn = false; pts.delete(e.pointerId); pinch = null; S.drag = null; pending = null; });
  }

  document.addEventListener("click", (e) => {
    if (!rooms() || !rooms().isActive()) return;
    const t = e.target; let b;
    if (t.closest("[data-pu-close]")) { exitFS(); close(); rooms().closeSheet(); return; } // выходим и из полного экрана — иначе белый экран
    if (t.closest("[data-pu-over-close]")) { const ov = $("#ep-pu-box .ep-plan-unfover"); if (ov) ov.remove(); return; }
    if (t.closest("[data-pu-pt-close]")) { S.ptPanel = null; const pt = $("#ep-pu-box .ep-plan-unfpt"); if (pt) pt.remove(); return; }
    if (t.closest("[data-pu-pt-edit]")) { const el2 = ptEl(); S.ptPanel = null; if (el2 && EL().openEditor) { close(); EL().openEditor(el2); } return; }
    if ((b = t.closest("[data-pu-pt]"))) {
      const k = b.getAttribute("data-pu-pt"); // h±N | o±N | p+ | p-
      if (k[0] === "p") {
        ptChange((el2) => {
          if (el2.type !== "block") return;
          el2.params = el2.params || {}; el2.params.items = el2.params.items || ["socket"];
          if (k === "p+" && el2.params.items.length < 6) el2.params.items.push("socket");
          if (k === "p-" && el2.params.items.length > 1) el2.params.items.pop();
        }, "block-posts");
      } else {
        const dv = Number(k.slice(1)) || 0;
        ptChange((el2, lim) => {
          if (k[0] === "h") el2.height = Math.max(0, Math.min(lim.H, Math.round((el2.height || 0) + dv)));
          else el2.offset = Math.max(0, Math.min(lim.L, Math.round((el2.offset || 0) + dv)));
        }, "elem-edit");
      }
      return;
    }
    if (t.closest("[data-pu-full]")) return toggleFull();
    if (t.closest("[data-pu-fit]")) { const p = core().project, w = G().wallById(p, S.wallId); if (w) { S.view = fitView(wallH(p, S.wallId), w.len); drawStrip(); } return; }
    if ((b = t.closest("[data-pu-act]"))) {
      const act = b.getAttribute("data-pu-act"), c = core();
      if (act === "undo") { c.undo(); drawStrip(); rooms().renderScene(); }
      else if (act === "redo") { c.redo(); drawStrip(); rooms().renderScene(); }
      else if (act === "trace") { if (EP.Plan.Routes) EP.Plan.Routes.build(); drawStrip(); rooms().renderScene(); }
      else if (act === "checks") { showChecks(); }
      else if (act === "pdf") { if (EP.Plan.Export) EP.Plan.Export.print(); }
      else if (act === "calc") { exitFS(); close(); rooms().closeSheet(); if (EP.Plan.Calc) EP.Plan.Calc.sheet(); }
      else if (act === "scheme") { exitFS(); close(); rooms().closeSheet(); if (EP.Plan.Scheme) EP.Plan.Scheme.open(); }
      return;
    }
    if ((b = t.closest("[data-pu-wmat]"))) { setWallMat(b.getAttribute("data-pu-wmat")); return; }
    if ((b = t.closest("[data-pu-wall]"))) { open(b.getAttribute("data-pu-wall")); return; }
    if ((b = t.closest("[data-pu-type]"))) {
      S.addType = b.getAttribute("data-pu-type");
      document.querySelectorAll("[data-pu-type]").forEach((x) => x.classList.toggle("on", x === b));
    }
  });
  document.addEventListener("fullscreenchange", () => {
    if (!document.fullscreenElement && S.full && isOpen()) { // вышли системной кнопкой/Esc — синхронизируем состояние
      S.full = false;
      const sheet = $("#ep-plan-sheet"), box = $("#ep-pu-box");
      if (box) box.classList.remove("is-full");
      if (sheet) sheet.classList.remove("ep-plan-sheet-full");
      try { if (screen.orientation && screen.orientation.unlock) screen.orientation.unlock(); } catch (e) {}
      drawStrip();
    }
  });
  document.addEventListener("input", (e) => {
    if (!rooms() || !rooms().isActive() || !isOpen()) return;
    if (e.target.getAttribute && e.target.getAttribute("data-pu-sym") != null) { S.sym = Math.max(0.6, (Number(e.target.value) || 100) / 100); drawStrip(); }
  });
  document.addEventListener("change", (e) => {
    if (!rooms() || !rooms().isActive() || !isOpen()) return;
    if (e.target.getAttribute && e.target.getAttribute("data-pu-wth") != null) setWallTh(e.target.value);
    if (e.target.getAttribute && e.target.getAttribute("data-pu-pt-h") != null) {
      const v = Number(e.target.value) || 0;
      ptChange((el2, lim) => { el2.height = Math.max(0, Math.min(lim.H, Math.round(v))); }, "elem-edit");
    }
    if (e.target.getAttribute && e.target.getAttribute("data-pu-pt-o") != null) {
      const v = Number(e.target.value) || 0;
      ptChange((el2, lim) => { el2.offset = Math.max(0, Math.min(lim.L, Math.round(v))); }, "elem-edit");
    }
  });

  EP.Plan = EP.Plan || {};
  EP.Plan.Unfold = { open, close, isOpen, drawStrip, CFG };
})();
