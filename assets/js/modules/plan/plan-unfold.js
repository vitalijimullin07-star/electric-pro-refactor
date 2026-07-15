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
    addTypes: ["block", "socket", "switch", "bra", "tv", "internet", "ac", "camera", "sensor"],
    openTypes: ["door", "window", "sliding", "balcony", "opening"]
  };
  const T = { title: "Стена", hint: "Пальцами — зум/сдвиг · выбери тип и тапни по пустому — добавить · тяни точку" };

  const esc = (s) => String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const $ = (sel, r) => (r || document).querySelector(sel);
  const core = () => EP.Plan.Core;
  const G = () => EP.Plan.Geometry;
  const rooms = () => EP.Plan.Rooms;
  const EL = () => EP.Plan.Elements;
  const isOpenKind = (k) => !!(EP.Plan.Core.OPENING_KINDS && EP.Plan.Core.OPENING_KINDS[k]);

  const S = { wallId: null, addType: "socket", drag: null, full: false, view: null, sym: 1, lastTap: null, ptPanel: null, showChases: false, ctrlsOn: true, ledDraft: null };

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
  function fitView(H, L) { const pad = CFG.padCm; return { x: -pad, y: -pad * 1.3, w: L + pad * 2, h: H + pad * 1.3 + 110 }; }

  function open(wallId, full) {
    S.wallId = wallId; S.view = null; S.ptPanel = null; S.lastTap = null; S.ledDraft = null;
    if (full != null) S.full = !!full; // full=true — только из явного режима «Стена»; обычный тап по стене открывает мини-превью
    const p = core().project, w = G().wallById(p, wallId);
    if (!w) return;
    const TY = EL().TYPES, OT = EL().OPEN_TYPES || {};
    const walls = roomWalls(p, wallId);
    const chip = (k, glyph) => `<button type="button" class="ep-plan-chip ep-clickable ${S.addType === k ? "on" : ""}" data-pu-type="${k}">${esc(glyph)}</button>`;
    const tbtn = (act, glyph, label) => `<button type="button" class="ep-plan-chip ep-clickable" data-pu-act="${act}" aria-label="${esc(label)}" title="${esc(label)}">${glyph}</button>`;
    rooms().openSheet(`<div class="ep-plan-srow ep-plan-unfhead"><b>${T.title} ${w.n}</b>
        <span>· ${G().fmtLen(w.len)} × ${G().fmtLen(wallH(p, wallId))}</span>
        <span class="ep-plan-flex"></span>
        <button type="button" class="ep-plan-mini ep-clickable" data-pu-ctrls aria-label="${S.ctrlsOn ? "Свернуть функции" : "Развернуть функции"}" title="Свернуть/развернуть функции">${S.ctrlsOn ? "︿" : "﹀"}</button>
        <button type="button" class="ep-plan-mini ep-clickable" data-pu-fit aria-label="Показать всё">⛶</button>
        <button type="button" class="ep-plan-mini ep-clickable" data-pu-full aria-label="Во весь экран">⤢</button>
        <button type="button" class="ep-plan-mini ep-clickable" data-pu-close>✕</button></div>
      <div class="ep-plan-unfmain">
        <div class="ep-plan-unfctrls${S.ctrlsOn ? "" : " is-collapsed"}">
          <div class="ep-plan-unfbar ep-plan-unftools">
            <span class="ep-plan-unflbl">План:</span>${tbtn("undo", "↶", "Отменить")}${tbtn("redo", "↷", "Вернуть")}
            <span class="ep-plan-unfsep"></span>${tbtn("trace", "🧵", "Автотрассировка")}${tbtn("checks", "✅", "Проверки норм")}${tbtn("calc", "🧮", "Расчёт и смета")}${tbtn("scheme", "▤", "Однолинейная схема")}${tbtn("pdf", "📄", "Печатный лист (PDF)")}
            <span class="ep-plan-unfsep"></span>
            <button type="button" class="ep-plan-chip ep-clickable ${S.showChases ? "on" : ""}" data-pu-chases aria-label="Показать штробы" title="Как идут штробы">〰 Штробы</button>
          </div>
          <div class="ep-plan-unfbar">
            <span class="ep-plan-unflbl">Стена:</span>${walls.map((ww) => `<button type="button" class="ep-plan-chip ep-clickable ${ww.id === wallId ? "on" : ""}" data-pu-wall="${esc(ww.id)}">${ww.n}</button>`).join("")}
          </div>
          <div class="ep-plan-unfbar">
            <span class="ep-plan-unflbl">Добавить:</span>${CFG.addTypes.map((k) => chip(k, TY[k].glyph)).join("")}
            <span class="ep-plan-unfsep"></span>${CFG.openTypes.map((k) => chip(k, (OT[k] || {}).glyph || "?")).join("")}
            <span class="ep-plan-unfsep"></span>${chip("led", "💡 Лента")}
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
  function close() { S.wallId = null; S.full = false; S.view = null; S.ptPanel = null; S.lastTap = null; S.ledDraft = null; }

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

  // свернуть/развернуть панель функций — не трогая S.view (зум/пан остаются как есть)
  function toggleCtrls() {
    S.ctrlsOn = !S.ctrlsOn;
    const ctrls = $(".ep-plan-unfctrls");
    if (ctrls) ctrls.classList.toggle("is-collapsed", !S.ctrlsOn);
    const btn = $("[data-pu-ctrls]");
    if (btn) {
      btn.textContent = S.ctrlsOn ? "︿" : "﹀";
      const lbl = S.ctrlsOn ? "Свернуть функции" : "Развернуть функции";
      btn.setAttribute("aria-label", lbl); btn.setAttribute("title", lbl);
    }
    drawStrip(); // размер бокса поменялся — пересчитать масштаб символов на экране
  }

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

    // проёмы (в <g data-pu-open> — общий узел для рендера И тяги, как у элементов)
    (p.openings || []).filter((o) => o.wallId === S.wallId).forEach((op) => {
      const oh = op.height || (op.type === "window" ? 140 : 200), sill = op.sill || 0;
      const yTop = H - (sill + oh), hgt = Math.min(oh, H - sill);
      const isWin = op.type === "window" || op.kind === "window" || op.kind === "balcony";
      const grp = svgEl("g", { "data-pu-open": op.id });
      grp.appendChild(svgEl("rect", { x: op.offset, y: yTop, width: op.width, height: hgt, class: "ep-plan-unfopen" + (isWin ? " is-win" : ""), "stroke-width": 1.5 * kk }));
      const meta = (EL().OPEN_TYPES || {})[op.kind || (isWin ? "window" : "door")] || {};
      grp.appendChild(svgEl("text", { x: op.offset + op.width / 2, y: yTop + 12 * ks, "font-size": 10 * ks, "text-anchor": "middle", class: "ep-plan-unfopent" }, (EL().openingNum ? EL().openingNum(p, op) : (meta.glyph || ""))));
      svg.appendChild(grp);
    });

    // щит (тоже в <g data-pu-panel> — тянется вдоль стены, сохраняя отступ от неё)
    (p.panels || []).forEach((pn) => {
      const c = G().closestOnSeg({ x: pn.x, y: pn.y }, w.a, w.b);
      if (c.d > 60) return;
      const bx = p.settings.panelBox, px = c.t * L, ph = p.settings.panelHeight || 150;
      const pw = bx && bx.wmm ? bx.wmm / 10 : 36, phh = bx && bx.hmm ? bx.hmm / 10 : 60, py = H - ph;
      const grp = svgEl("g", { "data-pu-panel": pn.id });
      grp.appendChild(svgEl("rect", { x: px - pw / 2, y: py - phh / 2, width: pw, height: phh, rx: 3, class: "ep-plan-unfpanel", "stroke-width": 1.5 * kk }));
      grp.appendChild(svgEl("text", { x: px, y: py, "font-size": 12 * ks, "text-anchor": "middle", "dominant-baseline": "central", class: "ep-plan-unfpanelt" }, "Щ"));
      svg.appendChild(grp);
    });

    // светодиодная лента: сегмент вдоль ЭТОЙ стены (offsetA..offsetB), тянется целиком
    (p.ledStrips || []).filter((ls) => ls.wallId === S.wallId).forEach((ls) => {
      const x1 = Math.min(ls.offsetA, ls.offsetB), x2 = Math.max(ls.offsetA, ls.offsetB), ly = H - ls.height;
      const grp = svgEl("g", { "data-pu-led": ls.id });
      grp.appendChild(svgEl("line", { x1, y1: ly, x2: x2, y2: ly, class: "ep-plan-unfled", "stroke-width": kk * 3 }));
      grp.appendChild(svgEl("text", { x: (x1 + x2) / 2, y: ly - 6 * ks, "font-size": 9 * ks, "text-anchor": "middle", class: "ep-plan-unfledt" }, "Лента " + Math.round(x2 - x1) + "см"));
      svg.appendChild(grp);
    });
    // черновик ленты: первая точка уже поставлена, ждём вторую
    if (S.ledDraft && S.ledDraft.wallId === S.wallId) {
      const dy = H - S.ledDraft.height;
      svg.appendChild(svgEl("circle", { cx: S.ledDraft.offset, cy: dy, r: 4 * ks, class: "ep-plan-unfleddraft" }));
    }

    const els = wallElems(p, S.wallId).slice().sort((a, b) => a.offset - b.offset);
    const chY = H + 30 * ks, ovY = chY + 18 * ks; // цепь размеров и общий размер по низу (в см)

    // прозрачный хит-рект под текстом — цифра на пальце маленькая, area больше
    const hitRect = (cx, cy, w2, h2, attrs) => svgEl("rect", Object.assign({ x: cx - w2 / 2, y: cy - h2 / 2, width: w2, height: h2, fill: "transparent" }, attrs));

    // размерная ЦЕПЬ по низу (от внутренних углов, синим); станции хранят
    // ЭЛЕМЕНТ (если это не угол стены) — клик по сегменту откроет карточку
    // ПРАВОЙ точки цепочки: «хотелось бы кликать по размерам и вводить вручную».
    const stations = [];
    [{ v: inA, el: null }].concat(els.map((e) => ({ v: Math.max(inA, Math.min(inB, e.offset)), el: e }))).concat([{ v: inB, el: null }])
      .sort((a, b) => a.v - b.v)
      .forEach((s) => { if (!stations.length || Math.abs(s.v - stations[stations.length - 1].v) > 1) stations.push(s); else if (s.el) stations[stations.length - 1].el = s.el; });
    svg.appendChild(svgEl("line", { x1: inA, y1: chY, x2: inB, y2: chY, class: "ep-plan-unfdimL", "stroke-width": kk }));
    stations.forEach((s) => {
      svg.appendChild(svgEl("line", { x1: s.v, y1: H, x2: s.v, y2: chY, class: "ep-plan-unfdimE", "stroke-width": kk * 0.7 })); // выносная
      svg.appendChild(svgEl("line", { x1: s.v, y1: chY - 4 * ks, x2: s.v, y2: chY + 4 * ks, class: "ep-plan-unfdimL", "stroke-width": kk })); // засечка
    });
    for (let i = 0; i < stations.length - 1; i++) {
      const seg = Math.round(stations[i + 1].v - stations[i].v);
      if (seg < 2) continue;
      const mx = (stations[i].v + stations[i + 1].v) / 2;
      const editEl = stations[i + 1].el; // двигаем правую точку цепочки
      if (editEl) svg.appendChild(hitRect(mx, chY - 5 * ks, 22 * ks, 16 * ks, { "data-pu-segof": editEl.id, class: "ep-plan-unftap" }));
      svg.appendChild(svgEl("text", { x: mx, y: chY - 5 * ks, "font-size": 11 * ks, "text-anchor": "middle", class: "ep-plan-unfdimT" + (editEl ? " is-tap" : "") }, seg + ""));
    }
    // общий размер (внутренняя длина стены)
    svg.appendChild(svgEl("line", { x1: inA, y1: ovY, x2: inB, y2: ovY, class: "ep-plan-unfdimL", "stroke-width": kk }));
    [inA, inB].forEach((s) => svg.appendChild(svgEl("line", { x1: s, y1: ovY - 4 * ks, x2: s, y2: ovY + 4 * ks, class: "ep-plan-unfdimL", "stroke-width": kk })));
    svg.appendChild(svgEl("text", { x: (inA + inB) / 2, y: ovY - 5 * ks, "font-size": 11 * ks, "text-anchor": "middle", class: "ep-plan-unfdimT" }, Math.round(inB - inA) + ""));

    // ШТРОБЫ (по кнопке 〰): откуда физически идёт кабель (потолок/пол) до поста;
    // вход в блок — раздельно по видам (силовая/свет/слаботочка), см. blockChaseEntries.
    // Символично: широкая полупрозрачная "канавка" + пунктирный центр + подпись сечения.
    if (S.showChases) {
      const floorRoute = p.settings.routeType === "floor";
      const chaseY0 = floorRoute ? H : 0;
      const CHASE_COL = { power: "#f59e0b", light: "#facc15", lv: "#38bdf8", warm: "#fb7185" };
      const SIZE_LBL = {
        power: `${Math.round(p.settings.chaseW || 25)}×${Math.round(p.settings.chaseH || 30)}`,
        light: `${Math.round(p.settings.chaseW || 25)}×${Math.round(p.settings.chaseH || 30)}`,
        lv: `${Math.round(p.settings.chaseW || 25)}×${Math.round(p.settings.chaseH || 30)}`,
        warm: `${Math.round(p.settings.tpChaseW || 50)}×${Math.round(p.settings.tpChaseH || 50)}`
      };
      const chaseKindOf = (layer) => (layer === "warm" ? "warm" : (layer === "lv" || layer === "tv" || layer === "cctv" ? "lv" : (layer === "light" ? "light" : "power")));
      const drawChase = (cx, cy0, cy1, kind) => {
        if (Math.abs(cy1 - cy0) < 1) return;
        const col = CHASE_COL[kind] || CHASE_COL.power;
        svg.appendChild(svgEl("line", { x1: cx, y1: cy0, x2: cx, y2: cy1, class: "ep-plan-unfchasebg", stroke: col, "stroke-width": kk * 5 }));
        svg.appendChild(svgEl("line", { x1: cx, y1: cy0, x2: cx, y2: cy1, class: "ep-plan-unfchase", stroke: col, "stroke-width": kk * 1.6 }));
        const labelY = cy0 + (cy1 > cy0 ? 12 * ks : -6 * ks);
        svg.appendChild(svgEl("text", { x: cx + 3 * ks, y: labelY, "font-size": 8 * ks, class: "ep-plan-unfchaselbl", fill: col }, SIZE_LBL[kind] || ""));
      };
      els.forEach((el2) => {
        const xx = el2.offset, yy = H - el2.height;
        if (el2.type === "block") {
          const items = (el2.params && el2.params.items) || [];
          const step2 = 18 * ks, bw = items.length * step2 + 6 * ks;
          (G().blockChaseEntries ? G().blockChaseEntries(el2) : []).forEach((en) => {
            const ex = xx - bw / 2 + 3 * ks + step2 * en.idx + step2 / 2;
            // выключатель в блоке при разводке по полу — штроба тянется до потолка (дальше к лампе)
            const y0 = (en.kind === "light" && floorRoute) ? 0 : chaseY0;
            drawChase(ex, y0, yy, en.kind);
          });
        } else if (el2.layer === "warm") {
          // ТП: подача обычной штробой к термостату + ОТДЕЛЬНО всегда 50×50 от термостата в пол
          drawChase(xx, chaseY0, yy, "power");
          if (el2.height > 1) drawChase(xx, yy, H, "warm");
        } else {
          const kind = chaseKindOf(el2.layer);
          const y0 = (el2.type === "switch" && floorRoute) ? 0 : chaseY0;
          drawChase(xx, y0, yy, kind);
        }
      });
    }

    const TY = EL().TYPES;
    els.forEach((el) => {
      const x = el.offset, y = H - el.height;
      const cc = circ(p, el);
      const col = cc ? cc.color : "var(--accent)";
      const gr = svgEl("g", { "data-pu-el": el.id, class: "ep-plan-unfel" + (el.status === "mounted" ? " is-done" : "") });

      // вертикаль: высота от пола до точки (синим), подпись высоты (тап — карточка точки)
      svg.appendChild(svgEl("line", { "data-pu-diml": el.id, x1: x, y1: H, x2: x, y2: y, class: "ep-plan-unfdimL", "stroke-width": kk }));
      svg.appendChild(hitRect(x + 16 * ks, (H + y) / 2, 26 * ks, 16 * ks, { "data-pu-heightof": el.id, class: "ep-plan-unftap" }));
      svg.appendChild(svgEl("text", { "data-pu-dimt": el.id, x: x + 6 * ks, y: (H + y) / 2, "font-size": 11 * ks, "dominant-baseline": "middle", class: "ep-plan-unfdimT is-tap" }, Math.round(el.height) + ""));

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
    // стилус: взводим уже на ховере (перо шлёт pointermove с pointerType="pen" до
    // касания), снимаем с задержкой после ухода из зоны (pointerleave) — см. plan-canvas.js
    let penOn = false;
    let penDisarmTimer = null;
    function armPen() { penOn = true; if (penDisarmTimer) { clearTimeout(penDisarmTimer); penDisarmTimer = null; } }
    function disarmPenSoon() { if (penDisarmTimer) clearTimeout(penDisarmTimer); penDisarmTimer = setTimeout(() => { penOn = false; penDisarmTimer = null; }, 500); }
    const pxPerCm = () => { const r = svg.getBoundingClientRect(); return Math.min(r.width / S.view.w, r.height / S.view.h) || 1; };
    const dist2 = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
    function pinchInfo() { const [a, b] = [...pts.values()]; return { d: Math.max(10, dist2(a, b)), cx: (a.x + b.x) / 2, cy: (a.y + b.y) / 2 }; }

    // плавная тяга: обновляем позицию узлов без пересборки всего SVG
    function updateDragVisual() {
      const d = S.drag; if (!d) return;
      if (d.kind === "open") { if (d.g) d.g.setAttribute("transform", `translate(${d.op.offset - d.x0} 0)`); return; }
      if (d.kind === "panel") { if (d.g) d.g.setAttribute("transform", `translate(${d.curPx - d.x0} 0)`); return; }
      if (d.kind === "led") { if (d.g) d.g.setAttribute("transform", `translate(${Math.min(d.ls.offsetA, d.ls.offsetB) - d.x0} 0)`); return; }
      const x = d.el.offset, yTrue = H - d.el.height;
      // палец закрывает саму точку под собой — на время тяги ПАЛЬЦЕМ (не пером/мышью,
      // у них точность и так достаточная) визуально приподнимаем маркер и его
      // размерную цепочку над пальцем; d.el.offset/height — настоящие значения, не
      // трогаем, это чисто отрисовка, полный рендер на отпускании вернёт всё на место
      const ghostCm = d.pointerType === "touch" ? 40 / Math.max(0.01, pxPerCm()) : 0;
      const y = yTrue - ghostCm;
      if (d.g) d.g.setAttribute("transform", `translate(${x - d.x0} ${y - d.y0})`);
      if (d.dimL) { d.dimL.setAttribute("x1", x); d.dimL.setAttribute("x2", x); d.dimL.setAttribute("y2", y); }
      if (d.dimT) {
        if (d.dimTx == null) d.dimTx = (Number(d.dimT.getAttribute("x")) || d.x0) - d.x0;
        d.dimT.setAttribute("x", d.dimTx + x); d.dimT.setAttribute("y", (H + y) / 2);
        d.dimT.textContent = Math.round(d.el.height) + "";
      }
    }

    svg.addEventListener("pointerdown", (e) => {
      if (e.pointerType === "pen") armPen();
      else if (e.pointerType === "touch" && penOn) return; // ладонь при работе стилусом
      svg.setPointerCapture(e.pointerId);
      pts.set(e.pointerId, { x: e.clientX, y: e.clientY });
      if (pts.size === 2) { pinch = pinchInfo(); S.drag = null; pending = null; return; }
      const p = core().project;
      downClient = { x: e.clientX, y: e.clientY }; moved = false; pending = null;
      // тап по цифре размера — сразу карточка точки с полями (не тяга, не добавление)
      const hof = e.target.closest && e.target.closest("[data-pu-heightof]");
      if (hof) { pending = { kind: "dimof", id: hof.getAttribute("data-pu-heightof") }; return; }
      const sof = e.target.closest && e.target.closest("[data-pu-segof]");
      if (sof) { pending = { kind: "dimof", id: sof.getAttribute("data-pu-segof") }; return; }
      const pg2 = e.target.closest && e.target.closest("[data-pu-panel]");
      if (pg2) {
        const pn = (p.panels || []).find((x) => x.id === pg2.getAttribute("data-pu-panel"));
        if (!pn) return;
        const c0 = G().closestOnSeg({ x: pn.x, y: pn.y }, w.a, w.b);
        core().commit();
        // тянем щит ВДОЛЬ стены, сохраняя перпендикулярный отступ от неё (perp)
        S.drag = { kind: "panel", pn, moved: false, g: pg2, x0: c0.t * w.len, curPx: c0.t * w.len, perp: { x: pn.x - c0.x, y: pn.y - c0.y } };
        return;
      }
      const og = e.target.closest && e.target.closest("[data-pu-open]");
      if (og) {
        const op = (p.openings || []).find((x) => x.id === og.getAttribute("data-pu-open"));
        if (!op) return;
        core().commit();
        S.drag = { kind: "open", op, moved: false, g: og, x0: op.offset };
        return;
      }
      const lg = e.target.closest && e.target.closest("[data-pu-led]");
      if (lg) {
        const ls = (p.ledStrips || []).find((x) => x.id === lg.getAttribute("data-pu-led"));
        if (!ls) return;
        core().commit();
        // тянем сегмент ЦЕЛИКОМ вдоль стены (длина сохраняется)
        S.drag = { kind: "led", ls, moved: false, g: lg, x0: Math.min(ls.offsetA, ls.offsetB), len: Math.abs(ls.offsetB - ls.offsetA) };
        return;
      }
      const g = e.target.closest && e.target.closest("[data-pu-el]");
      if (g) {
        const el = p.elements.find((x) => x.id === g.getAttribute("data-pu-el"));
        if (!el) return;
        const pg = e.target.closest && e.target.closest("[data-pu-post]");
        core().commit();
        // узлы для ПЛАВНОЙ тяги на месте (без пересборки SVG во время движения)
        S.drag = {
          kind: "el", el, moved: false, postIdx: pg ? Number(pg.getAttribute("data-pu-post")) : null,
          g, x0: el.offset, y0: (wallH(p, S.wallId)) - el.height, dimTx: null,
          pointerType: e.pointerType, // тач — приподнимаем маркер над пальцем, см. updateDragVisual
          dimL: svg.querySelector(`[data-pu-diml="${el.id}"]`),
          dimT: svg.querySelector(`[data-pu-dimt="${el.id}"]`)
        };
        return;
      }
      pending = { kind: "empty" };
    });
    svg.addEventListener("pointermove", (e) => {
      if (e.pointerType === "pen") armPen(); // в т.ч. ховер без касания
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
        // мёртвая зона тапа: палец всегда дрожит на пару пикселей — это ещё не тяга
        if (!S.drag.moved && downClient && Math.hypot(e.clientX - downClient.x, e.clientY - downClient.y) < 7) return;
        const pt = toWorld(svg, e.clientX, e.clientY);
        S.drag.moved = true;
        if (S.drag.kind === "open") {
          const maxOff = Math.max(0, w.len - S.drag.op.width);
          S.drag.op.offset = Math.round(Math.max(0, Math.min(maxOff, pt.x - S.drag.op.width / 2))); // тянем за центр проёма
        } else if (S.drag.kind === "panel") {
          const px = Math.round(Math.max(0, Math.min(w.len, pt.x)));
          S.drag.curPx = px;
          const t = w.len ? px / w.len : 0;
          const nearest = { x: w.a.x + (w.b.x - w.a.x) * t, y: w.a.y + (w.b.y - w.a.y) * t };
          S.drag.pn.x = nearest.x + S.drag.perp.x; // сохраняем перпендикулярный отступ от стены
          S.drag.pn.y = nearest.y + S.drag.perp.y;
        } else if (S.drag.kind === "led") {
          const x0 = Math.round(Math.max(0, Math.min(w.len - S.drag.len, pt.x - S.drag.len / 2)));
          S.drag.ls.offsetA = x0; S.drag.ls.offsetB = x0 + S.drag.len;
        } else {
          S.drag.el.offset = Math.round(Math.max(0, Math.min(w.len, pt.x))); // плавно, 1 см
          S.drag.el.height = Math.round(Math.max(0, Math.min(H, H - pt.y)));
        }
        updateDragVisual(); // двигаем узлы на месте — БЕЗ пересборки SVG (плавно)
        return;
      }
      if (downClient && Math.hypot(e.clientX - downClient.x, e.clientY - downClient.y) > 6) {
        moved = true;
        const kpx = pxPerCm();
        S.view.x -= (e.clientX - prev.x) / kpx; S.view.y -= (e.clientY - prev.y) / kpx;
        applyView(svg);
      }
    });
    svg.addEventListener("pointerleave", (e) => { if (e.pointerType === "pen") disarmPenSoon(); });
    function end(e) {
      pts.delete(e.pointerId);
      if (pts.size < 2) pinch = null;
      if (S.drag) {
        if (S.drag.moved) {
          const what = S.drag.kind === "open" ? "opening-move" : S.drag.kind === "panel" ? "panel-move" : S.drag.kind === "led" ? "led-move" : "elem-move";
          core().persist(what);
          S.drag = null;
          drawStrip(); rooms().renderScene(); // полная перерисовка ОДИН раз, на отпускании
          return;
        }
        else if (S.drag.kind === "open") {
          if (EL().openOpeningEditor) EL().openOpeningEditor(S.drag.op);
        }
        else if (S.drag.kind === "panel") {
          // тап без тяги по щиту — своего редактора тут нет, просто ничего не делаем
        }
        else if (S.drag.kind === "led") {
          if (confirm("Удалить ленту?")) {
            const p2 = core().project;
            p2.ledStrips = (p2.ledStrips || []).filter((x) => x.id !== S.drag.ls.id);
            core().persist("led-del"); drawStrip(); rooms().renderScene();
          }
        }
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
        if (pending.kind === "dimof") { const el2 = p.elements.find((x) => x.id === pending.id); if (el2) { S.ptPanel = el2.id; renderPtPanel(); } }
        else if (pending.kind === "empty" && S.addType === "led" && pt.x >= 0 && pt.x <= w.len && pt.y >= 0 && pt.y <= H) {
          const off = G().snap(pt.x, step), height = G().snap(Math.max(0, H - pt.y), step);
          if (!S.ledDraft) { S.ledDraft = { wallId: S.wallId, offset: off, height }; drawStrip(); }
          else {
            c.commit();
            p.ledStrips = p.ledStrips || [];
            p.ledStrips.push(c.model.newLedStrip(S.wallId, S.ledDraft.offset, off, S.ledDraft.height));
            S.ledDraft = null;
            c.persist("led-add"); drawStrip(); rooms().renderScene();
          }
        }
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
    if (t.closest("[data-pu-ctrls]")) return toggleCtrls();
    if (t.closest("[data-pu-full]")) return toggleFull();
    if (t.closest("[data-pu-fit]")) { const p = core().project, w = G().wallById(p, S.wallId); if (w) { S.view = fitView(wallH(p, S.wallId), w.len); drawStrip(); } return; }
    if (t.closest("[data-pu-chases]")) { S.showChases = !S.showChases; drawStrip(); return; }
    if ((b = t.closest("[data-pu-act]"))) {
      const act = b.getAttribute("data-pu-act"), c = core();
      if (act === "undo") { c.undo(); drawStrip(); rooms().renderScene(); }
      else if (act === "redo") { c.redo(); drawStrip(); rooms().renderScene(); }
      else if (act === "trace") { if (EP.Plan.Routes) EP.Plan.Routes.build({ silent: true }); drawStrip(); rooms().renderScene(); } // silent — иначе build() зовёт sheet() и стирает DOM развёртки поверх неё
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
      if (S.addType !== "led" && S.ledDraft) { S.ledDraft = null; drawStrip(); } // сменили тип посреди расстановки ленты — бросаем первую точку
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
