/* Electric Pro V29 — Проект квартиры: комнаты и инструменты (Слой 1).
   Режимы: взгляд / прямоугольник (2 тапа + размеры числом) / контур (по точкам) /
   рулетка / подложка (фото + калибровка масштаба). Панель комнаты: имя, потолок,
   размеры числом, влажная зона, копия, зеркало, удаление. Слои — вкл/выкл. */
(() => {
  "use strict";
  window.EP = window.EP || {};

  const T = {
    modes: { view: "☝", rect: "▭", poly: "⬠", beam: "▬", elem: "🔌", opening: "🚪", ruler: "📏", underlay: "🖼" },
    modeHint: {
      view: "Тап: точка — редактор, стена — развёртка, комната — свойства.",
      rect: "Тапни два противоположных угла комнаты.",
      poly: "Ставь точки по контуру. Замкни тапом в первую точку.",
      beam: "Балка/перегородка: тапни начало и конец, потом тяни концы.",
      elem: "Выбери тип в палитре и тапай по стене (свет/ТП — внутрь комнаты).",
      opening: "Проёмы: выбери дверь/окно/раздвижную/балкон и тапни по стене или перегородке.",
      ruler: "Тапни две точки — расстояние.",
      underlay: "Фото-план: загрузка, масштаб по известной длине, перенос."
    },
    room: "Комната", create: "Создать", cancel: "Отмена", close: "Закрыть",
    name: "Название", width: "Ширина, см", depth: "Глубина, см", ceil: "Потолок, см",
    wet: "Влажная зона (санузел/кухня)", dup: "⧉ Копия", mirror: "⇋ Зеркало", del: "✕ Удалить",
    confirmDelRoom: "Удалить комнату?",
    upl: { load: "📷 Загрузить фото плана", calib: "📏 Калибровка масштаба", move: "✋ Перенос",
           moveOn: "✋ Перенос: тяни подложку", del: "✕ Убрать подложку", opacity: "Прозрачность",
           calibHint: "Тапни 2 точки на подложке с известным расстоянием.",
           calibDist: "Реальное расстояние, см", apply: "Применить" },
    layersTitle: "Слои", tooSmall: "Комната слишком маленькая (мин. 30 см).",
    polyNeed: "Нужно минимум 3 точки."
  };
  const CFG = { cornerSnapCm: 20, closePolyPx: 22, minRoomCm: 30, dupShiftCm: 40, hitWallPx: 18 };

  const esc = (s) => String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const $ = (sel, r) => (r || document).querySelector(sel);
  const core = () => EP.Plan.Core;
  const G = () => EP.Plan.Geometry;

  const R = {
    canvas: null, active: false,
    mode: "view", draft: { points: [] }, pendingRect: null, pendingPoly: null,
    selectedRoomId: null, ruler: { a: null, b: null }, beamDraft: { a: null, b: null },
    umove: false, calib: { on: false, a: null, b: null }
  };

  // ---------- сцена ----------
  function ui() { return { selectedRoomId: R.selectedRoomId, draft: R.draft, ruler: R.ruler, beamDraft: R.beamDraft }; }
  function renderScene() {
    if (!R.canvas || !EP.Plan.Render) return;
    EP.Plan.Render.draw(R.canvas, core().project, ui());
    const hint = $("#ep-plan-modehint");
    if (hint) hint.textContent = T.modeHint[R.mode] || "";
  }
  function renderScaled() { if (R.canvas && EP.Plan.Render) EP.Plan.Render.drawScaled(R.canvas, core().project, ui()); }

  // ---------- режимы ----------
  function setMode(mode) {
    R.mode = mode;
    R.draft = { points: [] }; R.pendingRect = null; R.pendingPoly = null;
    R.ruler = { a: null, b: null }; R.beamDraft = { a: null, b: null };
    R.calib = { on: false, a: null, b: null };
    R.selectedBeam = null;
    setMove(false);
    document.querySelectorAll("[data-plan-mode]").forEach((b) => b.classList.toggle("on", b.getAttribute("data-plan-mode") === mode));
    if (mode === "underlay") sheetUnderlay();
    else if (mode === "elem" && EP.Plan.Elements) EP.Plan.Elements.onModeEnter();
    else if (mode === "opening" && EP.Plan.Elements) EP.Plan.Elements.onOpeningModeEnter();
    else closeSheet();
    renderScene();
  }
  function setMove(on) {
    R.umove = on;
    if (!R.canvas) return;
    if (on) {
      R.canvas.setDragHandler((dx, dy, phase) => {
        const p = core().project; if (!p || !p.underlay) return;
        if (phase === "move") { p.underlay.x = (p.underlay.x || 0) + dx; p.underlay.y = (p.underlay.y || 0) + dy; renderScene(); }
        else if (phase === "end") core().persist("underlay-move");
      });
    } else R.canvas.setDragHandler(null);
  }

  // ---------- тапы ----------
  function onTap(w) {
    const p = core().project; if (!p) return;
    const step = p.settings.gridStep || 10;
    if (R.mode === "rect") {
      const pt = G().snapSmart(p, w, step, CFG.cornerSnapCm);
      if (!R.draft.points.length) { R.draft.points = [pt]; renderScaled(); return; }
      const a = R.draft.points[0];
      const wcm = Math.abs(pt.x - a.x), hcm = Math.abs(pt.y - a.y);
      if (wcm < CFG.minRoomCm || hcm < CFG.minRoomCm) { toast(T.tooSmall); return; }
      R.pendingRect = { x: Math.min(a.x, pt.x), y: Math.min(a.y, pt.y), w: Math.round(wcm), h: Math.round(hcm) };
      R.draft.points = [a, { x: pt.x, y: a.y }, pt, { x: a.x, y: pt.y }, a];
      renderScaled();
      sheetCreateRect();
      return;
    }
    if (R.mode === "poly") {
      const pts = R.draft.points;
      if (pts.length >= 3 && G().dist(w, pts[0]) <= CFG.closePolyPx * R.canvas.cmPerPx()) {
        R.pendingPoly = pts.slice();
        sheetCreatePoly();
        return;
      }
      // автовыравнивание: линия от предыдущей точки доводится до 90°
      const ortho = G().orthoAdjust(pts[pts.length - 1] || null, w);
      pts.push(G().snapSmart(p, ortho, step, CFG.cornerSnapCm));
      renderScaled();
      return;
    }
    if (R.mode === "ruler") {
      if (!R.ruler.a || R.ruler.b) R.ruler = { a: w, b: null };
      else R.ruler.b = w;
      renderScaled();
      return;
    }
    if (R.mode === "beam") {
      const snapped = G().snapSmart(p, w, step, CFG.cornerSnapCm);
      if (!R.beamDraft.a) { R.beamDraft = { a: snapped, b: null }; renderScaled(); return; }
      const end = G().orthoAdjust(R.beamDraft.a, snapped); // прямая балка/перегородка под 90°
      const c = core();
      c.commit();
      c.project.beams = c.project.beams || [];
      // балка/перегородка — тем же материалом и толщиной, что и стена
      const beam = c.model.newBeam(R.beamDraft.a, end, "beam", p.settings.wallThickness, p.settings.wallMaterial);
      c.project.beams.push(beam);
      c.persist("beam-add");
      R.beamDraft = { a: null, b: null };
      setMode("view"); sheetBeam(beam); // сразу выделяем — можно тянуть концы
      return;
    }
    if (R.mode === "underlay") {
      if (R.calib.on) {
        if (!R.calib.a) R.calib.a = w;
        else if (!R.calib.b) { R.calib.b = w; sheetUnderlay(); }
        R.ruler = { a: R.calib.a, b: R.calib.b };
        renderScaled();
      }
      return;
    }
    if (R.mode === "elem") { if (EP.Plan.Elements) { EP.Plan.Elements.placeAt(w); renderScene(); } return; }
    if (R.mode === "opening") { if (EP.Plan.Elements) { EP.Plan.Elements.placeOpening(w); renderScene(); } return; }
    // view: приоритет — элемент/щит > балка > стена (развёртка) > комната
    clearBeamSel();
    const k = R.canvas.cmPerPx();
    if (EP.Plan.Elements) {
      const hit = EP.Plan.Elements.hitAt(w, EP.Plan.Elements.CFG.hitPx * k);
      if (hit) {
        R.selectedRoomId = null;
        if (hit.el) EP.Plan.Elements.openEditor(hit.el);
        else if (hit.panel) EP.Plan.Elements.openPanelEditor(hit.panel);
        else if (hit.opening) EP.Plan.Elements.openOpeningEditor(hit.opening);
        return;
      }
      EP.Plan.Elements.deselect();
    }
    // балка/перемычка
    const beam = beamAt(p, w, CFG.hitWallPx * k);
    if (beam) { R.selectedRoomId = null; sheetBeam(beam); renderScene(); return; }
    const wallHit = G().wallAt(p, w, CFG.hitWallPx * k);
    if (wallHit && EP.Plan.Unfold) {
      R.selectedRoomId = null;
      EP.Plan.Unfold.open(wallHit.wall.id);
      renderScene();
      return;
    }
    const room = G().roomAt(p, w);
    R.selectedRoomId = room ? room.id : null;
    if (room) sheetRoom(room); else closeSheet();
    renderScene();
  }

  // ---------- шторка (нижняя панель) ----------
  function sheet() { return $("#ep-plan-sheet"); }
  function openSheet(html) { const s = sheet(); if (s) { s.innerHTML = html; s.hidden = false; } }
  function closeSheet() { const s = sheet(); if (s) { s.hidden = true; s.innerHTML = ""; } }
  function toast(msg) { openSheet(`<div class="ep-plan-srow ep-plan-toast">${esc(msg)}</div>`); setTimeout(() => { if (sheet() && sheet().querySelector(".ep-plan-toast")) closeSheet(); }, 1800); }

  function sheetCreateRect() {
    const r = R.pendingRect;
    openSheet(`<div class="ep-plan-srow"><b>${T.room}</b></div>
      <div class="ep-plan-srow"><input id="ep-pr-name" type="text" placeholder="${T.name}" value="${T.room} ${core().project.rooms.length + 1}" maxlength="40"></div>
      <div class="ep-plan-srow ep-plan-s2">
        <label>${T.width}<input id="ep-pr-w" type="number" inputmode="numeric" min="30" value="${r.w}"></label>
        <label>${T.depth}<input id="ep-pr-h" type="number" inputmode="numeric" min="30" value="${r.h}"></label>
      </div>
      <div class="ep-plan-srow ep-plan-sbtns">
        <button type="button" class="btn btn-primary ep-clickable" data-pr-create-rect>${T.create}</button>
        <button type="button" class="btn btn-ghost ep-clickable" data-pr-cancel>${T.cancel}</button>
      </div>`);
  }
  function sheetCreatePoly() {
    openSheet(`<div class="ep-plan-srow"><b>${T.room}</b> · ${R.pendingPoly.length} точек</div>
      <div class="ep-plan-srow"><input id="ep-pr-name" type="text" placeholder="${T.name}" value="${T.room} ${core().project.rooms.length + 1}" maxlength="40"></div>
      <div class="ep-plan-srow ep-plan-sbtns">
        <button type="button" class="btn btn-primary ep-clickable" data-pr-create-poly>${T.create}</button>
        <button type="button" class="btn btn-ghost ep-clickable" data-pr-cancel>${T.cancel}</button>
      </div>`);
  }
  function sheetRoom(room) {
    const p = core().project;
    const isR = G().isRect(room), d = isR ? G().rectDims(room) : null;
    const wet = (room.zones || []).indexOf("wet") >= 0;
    openSheet(`<div class="ep-plan-srow"><b>${esc(room.name)}</b> · ${G().fmtArea(G().area(room.points))}</div>
      <div class="ep-plan-srow"><input id="ep-pr-rname" type="text" value="${esc(room.name)}" maxlength="40" data-pr-room="${esc(room.id)}"></div>
      <div class="ep-plan-srow ep-plan-s2">
        ${isR ? `<label>${T.width}<input id="ep-pr-rw" type="number" inputmode="numeric" min="30" value="${Math.round(d.w)}"></label>
        <label>${T.depth}<input id="ep-pr-rh" type="number" inputmode="numeric" min="30" value="${Math.round(d.h)}"></label>` : ""}
        <label>${T.ceil}<input id="ep-pr-rc" type="number" inputmode="numeric" min="150" placeholder="${p.settings.ceilingHeight}" value="${room.height || ""}"></label>
        <label>Толщина стен, см<input id="ep-pr-th" type="number" inputmode="numeric" min="4" value="${Math.round(p.settings.wallThickness || 10)}"></label>
      </div>
      <div class="ep-plan-srow">Стены:
        ${(EP.Plan.Core.DEFAULTS.materials || []).map((m) => `<button type="button" class="ep-plan-chip ep-clickable ${(room.material || p.settings.wallMaterial) === m ? "on" : ""}" data-pr-mat="${esc(m)}">${esc(m)}</button>`).join("")}
      </div>
      <div class="ep-plan-srow"><label class="ep-plan-chk"><input id="ep-pr-wet" type="checkbox" ${wet ? "checked" : ""}> ${T.wet}</label></div>
      <div class="ep-plan-srow ep-plan-sbtns">
        <button type="button" class="ep-plan-tbtn ep-clickable" data-pr-apply="${esc(room.id)}">✓</button>
        <button type="button" class="ep-plan-tbtn ep-clickable" data-pr-dup="${esc(room.id)}">${T.dup}</button>
        <button type="button" class="ep-plan-tbtn ep-clickable" data-pr-mirror="${esc(room.id)}">${T.mirror}</button>
        <button type="button" class="ep-plan-tbtn ep-plan-danger ep-clickable" data-pr-delroom="${esc(room.id)}">${T.del}</button>
      </div>`);
  }
  function sheetUnderlay() {
    const u = core().project && core().project.underlay;
    const U = T.upl;
    if (!u) {
      openSheet(`<div class="ep-plan-srow ep-plan-sbtns">
        <button type="button" class="btn btn-primary ep-clickable" data-pr-upl-load>${U.load}</button></div>
        <input id="ep-pr-uplfile" type="file" accept="image/*" hidden>`);
      return;
    }
    const calibStage = R.calib.on ? (R.calib.b ? 2 : 1) : 0;
    openSheet(`<div class="ep-plan-srow"><b>Подложка</b></div>
      <div class="ep-plan-srow"><label class="ep-plan-range">${U.opacity}
        <input id="ep-pr-uplop" type="range" min="10" max="100" value="${Math.round((u.opacity == null ? 0.5 : u.opacity) * 100)}"></label></div>
      ${calibStage === 1 ? `<div class="ep-plan-srow">${U.calibHint}</div>` : ""}
      ${calibStage === 2 ? `<div class="ep-plan-srow ep-plan-s2">
        <label>${U.calibDist}<input id="ep-pr-calibd" type="number" inputmode="numeric" min="10" placeholder="напр. 300"></label>
        <button type="button" class="btn btn-primary ep-clickable" data-pr-calib-apply>${U.apply}</button></div>` : ""}
      <div class="ep-plan-srow ep-plan-sbtns">
        <button type="button" class="ep-plan-tbtn ep-clickable ${R.calib.on ? "on" : ""}" data-pr-calib>${U.calib}</button>
        <button type="button" class="ep-plan-tbtn ep-clickable ${R.umove ? "on" : ""}" data-pr-uplmove>${R.umove ? U.moveOn : U.move}</button>
        <button type="button" class="ep-plan-tbtn ep-plan-danger ep-clickable" data-pr-upldel>${U.del}</button>
      </div>
      <input id="ep-pr-uplfile" type="file" accept="image/*" hidden>`);
  }
  function beamAt(p, w, maxD) {
    let best = null;
    (p.beams || []).forEach((bm) => {
      const c = G().closestOnSeg(w, bm.a, bm.b);
      if (c.d <= Math.max(maxD, (bm.width || 20) / 2) && (!best || c.d < best.d)) best = { d: c.d, beam: bm };
    });
    return best && best.beam;
  }
  function sheetBeam(bm) {
    const p = core().project;
    const mat = bm.material || p.settings.wallMaterial;
    openSheet(`<div class="ep-plan-srow"><b>${bm.kind === "lintel" ? "Перемычка" : "Балка/перегородка"}</b> · ${G().fmtLen(G().dist(bm.a, bm.b))}</div>
      <div class="ep-plan-srow">
        <button type="button" class="ep-plan-chip ep-clickable ${bm.kind !== "lintel" ? "on" : ""}" data-pr-beamkind="beam">Балка</button>
        <button type="button" class="ep-plan-chip ep-clickable ${bm.kind === "lintel" ? "on" : ""}" data-pr-beamkind="lintel">Перемычка</button>
        <label class="ep-plan-range" style="flex:0 0 120px">Толщина, см<input type="number" inputmode="numeric" min="3" data-pr-beamw="${esc(bm.id)}" value="${Math.round(bm.width || p.settings.wallThickness)}"></label>
      </div>
      <div class="ep-plan-srow">Материал:
        ${(EP.Plan.Core.DEFAULTS.partitionMaterials || []).map((m) => `<button type="button" class="ep-plan-chip ep-clickable ${mat === m ? "on" : ""}" data-pr-beammat="${esc(m)}">${esc(m)}</button>`).join("")}
      </div>
      <div class="ep-plan-modehint">Тяни синие концы, чтобы двигать. ✓ — закрыть.</div>
      <div class="ep-plan-srow ep-plan-sbtns">
        <button type="button" class="ep-plan-tbtn ep-clickable" data-pr-beamdone>✓</button>
        <button type="button" class="ep-plan-tbtn ep-plan-danger ep-clickable" data-pr-beamdel="${esc(bm.id)}">✕ Удалить</button></div>`);
    R.selectedBeam = bm.id;
    enableBeamDrag();
    renderScene();
  }
  // тянуть концы выбранной балки/перегородки пальцем
  function enableBeamDrag() {
    if (!R.canvas) return;
    let grabbed = null; // 'a' | 'b'
    R.canvas.setDragHandler((dx, dy, phase, start) => {
      const c = core(), bm = (c.project.beams || []).find((b) => b.id === R.selectedBeam);
      if (!bm) return;
      if (phase === "start") {
        const rr = Math.max(20, (bm.width || 20)) ;
        const da = G().dist(start, bm.a), db = G().dist(start, bm.b);
        grabbed = (da <= db ? "a" : "b");
        if (Math.min(da, db) > rr * 2) grabbed = null; // не по концу — не тянем
        if (grabbed) core().commit();
        return;
      }
      if (phase === "move" && grabbed) {
        bm[grabbed] = { x: bm[grabbed].x + dx, y: bm[grabbed].y + dy };
        renderScene();
      } else if (phase === "end" && grabbed) {
        const step = c.project.settings.gridStep || 10;
        bm[grabbed] = G().snapPoint(bm[grabbed], step);
        c.persist("beam-move"); grabbed = null; renderScene();
      }
    });
  }
  function clearBeamSel() { R.selectedBeam = null; if (R.canvas) R.canvas.setDragHandler(null); }
  function sheetLayers() {
    const p = core().project; if (!p) return;
    openSheet(`<div class="ep-plan-srow"><b>${T.layersTitle}</b></div>
      <div class="ep-plan-layers">${p.layers.map((l) => `
        <label class="ep-plan-chk"><input type="checkbox" data-pr-layer="${esc(l.id)}" ${l.visible !== false ? "checked" : ""}>
        <i class="ep-plan-dot" style="background:${esc(l.color)}"></i> ${esc(l.name)}</label>`).join("")}</div>
      <div class="ep-plan-srow ep-plan-sbtns"><button type="button" class="btn btn-ghost ep-clickable" data-pr-cancel>${T.close}</button></div>`);
  }

  // ---------- действия ----------
  function createRect() {
    const name = ($("#ep-pr-name") || {}).value || "";
    const w = Math.max(CFG.minRoomCm, Number(($("#ep-pr-w") || {}).value) || R.pendingRect.w);
    const h = Math.max(CFG.minRoomCm, Number(($("#ep-pr-h") || {}).value) || R.pendingRect.h);
    const c = core();
    c.commit();
    const room = c.model.newRoom(G().rectPoints(R.pendingRect.x, R.pendingRect.y, w, h), name.trim() || undefined);
    c.project.rooms.push(room);
    c.persist("room-add");
    R.selectedRoomId = room.id;
    setMode("view"); sheetRoom(room);
  }
  function createPoly() {
    const name = ($("#ep-pr-name") || {}).value || "";
    if (!R.pendingPoly || R.pendingPoly.length < 3) { toast(T.polyNeed); return; }
    const c = core();
    c.commit();
    const room = c.model.newRoom(R.pendingPoly.slice(), name.trim() || undefined);
    c.project.rooms.push(room);
    c.persist("room-add");
    R.selectedRoomId = room.id;
    setMode("view"); sheetRoom(room);
  }
  function applyRoom(id) {
    const c = core(), room = c.project.rooms.find((r) => r.id === id); if (!room) return;
    c.commit();
    const name = ($("#ep-pr-rname") || {}).value;
    if (name && name.trim()) room.name = name.trim();
    const hv = Number(($("#ep-pr-rc") || {}).value) || 0;
    room.height = hv >= 150 ? hv : null;
    const thv = Number(($("#ep-pr-th") || {}).value) || 0;
    if (thv >= 4) c.project.settings.wallThickness = thv;
    if (G().isRect(room)) {
      const w = Number(($("#ep-pr-rw") || {}).value) || 0, h = Number(($("#ep-pr-rh") || {}).value) || 0;
      if (w >= CFG.minRoomCm && h >= CFG.minRoomCm) G().setRectDims(room, w, h);
    }
    const wet = !!($("#ep-pr-wet") || {}).checked;
    room.zones = wet ? ["wet"] : [];
    c.persist("room-edit");
    R.selectedRoomId = null; closeSheet(); renderScene(); // ✓ — применить и закрыть вкладку
  }
  function dupRoom(id) {
    const c = core(), room = c.project.rooms.find((r) => r.id === id); if (!room) return;
    c.commit();
    const copy = c.model.newRoom(room.points.map((p) => ({ x: p.x, y: p.y })), room.name + " (копия)");
    copy.height = room.height; copy.zones = (room.zones || []).slice();
    G().translateRoom(copy, CFG.dupShiftCm, CFG.dupShiftCm);
    c.project.rooms.push(copy);
    c.persist("room-dup");
    R.selectedRoomId = copy.id;
    sheetRoom(copy);
  }
  function mirrorRoom(id) {
    const c = core(), room = c.project.rooms.find((r) => r.id === id); if (!room) return;
    c.commit(); G().mirrorRoom(room); c.persist("room-mirror");
  }
  function delRoom(id) {
    if (!confirm(T.confirmDelRoom)) return;
    const c = core();
    c.commit();
    c.project.rooms = c.project.rooms.filter((r) => r.id !== id);
    c.project.elements = c.project.elements.filter((e) => String(e.wallId || "").split(":")[0] !== id);
    c.persist("room-del");
    R.selectedRoomId = null;
    closeSheet();
  }

  function loadUnderlayFile(file) {
    const rd = new FileReader();
    rd.onload = () => {
      const img = new Image();
      img.onload = () => {
        const maxSide = 1600, k = Math.min(1, maxSide / Math.max(img.width, img.height));
        const cv = document.createElement("canvas");
        cv.width = Math.round(img.width * k); cv.height = Math.round(img.height * k);
        cv.getContext("2d").drawImage(img, 0, 0, cv.width, cv.height);
        const c = core();
        c.commit();
        const scale = 800 / cv.width; // старт: ширина фото = 8 м, дальше калибровка
        c.project.underlay = {
          imageDataUri: cv.toDataURL("image/jpeg", 0.82),
          nw: cv.width, nh: cv.height, scale,
          x: -cv.width * scale / 2, y: -cv.height * scale / 2, opacity: 0.5
        };
        c.persist("underlay-add");
        R.canvas.fit(G().projectBBox(c.project));
        sheetUnderlay();
      };
      img.src = String(rd.result || "");
    };
    rd.readAsDataURL(file);
  }
  function applyCalib() {
    const c = core(), u = c.project.underlay;
    const real = Number(($("#ep-pr-calibd") || {}).value) || 0;
    if (!u || !R.calib.a || !R.calib.b || real < 10) return;
    const measured = G().dist(R.calib.a, R.calib.b);
    if (measured < 1) return;
    c.commit();
    const k = real / measured;
    u.scale *= k;
    u.x = (u.x || 0) * k; u.y = (u.y || 0) * k; // масштабируем вокруг начала координат
    c.persist("underlay-calib");
    R.calib = { on: false, a: null, b: null }; R.ruler = { a: null, b: null };
    R.canvas.fit(G().projectBBox(c.project));
    sheetUnderlay();
  }

  // ---------- события ----------
  document.addEventListener("click", (e) => {
    if (!R.active) return;
    const t = e.target; let el;
    if ((el = t.closest("[data-plan-mode]"))) return setMode(el.getAttribute("data-plan-mode"));
    if (t.closest("[data-plan-layers]")) return sheetLayers();
    if (t.closest("[data-plan-fit]")) { if (R.canvas) R.canvas.fit(G().projectBBox(core().project)); return; }
    if (t.closest("[data-pr-cancel]")) { setMode(R.mode === "underlay" ? "view" : R.mode); return; }
    if (t.closest("[data-pr-create-rect]")) return createRect();
    if (t.closest("[data-pr-create-poly]")) return createPoly();
    if ((el = t.closest("[data-pr-mat]"))) {
      const c = core(), room = c.project.rooms.find((r) => r.id === R.selectedRoomId);
      if (room) { c.commit(); room.material = el.getAttribute("data-pr-mat"); c.persist("room-mat"); sheetRoom(room); }
      return;
    }
    if ((el = t.closest("[data-pr-apply]"))) return applyRoom(el.getAttribute("data-pr-apply"));
    if ((el = t.closest("[data-pr-dup]"))) return dupRoom(el.getAttribute("data-pr-dup"));
    if ((el = t.closest("[data-pr-mirror]"))) return mirrorRoom(el.getAttribute("data-pr-mirror"));
    if ((el = t.closest("[data-pr-delroom]"))) return delRoom(el.getAttribute("data-pr-delroom"));
    if (t.closest("[data-pr-upl-load]")) { const f = $("#ep-pr-uplfile"); if (f) { f.onchange = () => { if (f.files && f.files[0]) loadUnderlayFile(f.files[0]); }; f.click(); } return; }
    if (t.closest("[data-pr-upldel]")) { const c = core(); if (c.project.underlay) { c.commit(); c.project.underlay = null; c.persist("underlay-del"); } setMove(false); sheetUnderlay(); return; }
    if (t.closest("[data-pr-uplmove]")) { setMove(!R.umove); sheetUnderlay(); return; }
    if (t.closest("[data-pr-calib]")) { R.calib = R.calib.on ? { on: false, a: null, b: null } : { on: true, a: null, b: null }; R.ruler = { a: null, b: null }; setMove(false); sheetUnderlay(); renderScaled(); return; }
    if (t.closest("[data-pr-calib-apply]")) return applyCalib();
    if ((el = t.closest("[data-pr-beamkind]"))) {
      const c = core(), bm = (c.project.beams || []).find((b) => b.id === R.selectedBeam);
      if (bm) { c.commit(); bm.kind = el.getAttribute("data-pr-beamkind"); c.persist("beam-kind"); sheetBeam(bm); }
      return;
    }
    if ((el = t.closest("[data-pr-beammat]"))) {
      const c = core(), bm = (c.project.beams || []).find((b) => b.id === R.selectedBeam);
      if (bm) {
        c.commit(); bm.material = el.getAttribute("data-pr-beammat");
        const th = (EP.Plan.Core.DEFAULTS.partitionThickness || {})[bm.material];
        if (th) bm.width = th;
        c.persist("beam-mat"); sheetBeam(bm);
      }
      return;
    }
    if (t.closest("[data-pr-beamdone]")) { clearBeamSel(); closeSheet(); renderScene(); return; }
    if ((el = t.closest("[data-pr-beamdel]"))) {
      const c = core(), bid = el.getAttribute("data-pr-beamdel"); c.commit();
      c.project.beams = (c.project.beams || []).filter((b) => b.id !== bid);
      c.project.openings = (c.project.openings || []).filter((o) => o.wallId !== "beam:" + bid); // проёмы перегородки
      c.persist("beam-del"); clearBeamSel(); closeSheet(); renderScene(); return;
    }
  });

  document.addEventListener("change", (e) => {
    if (!R.active) return;
    const t = e.target;
    if (t.id === "ep-pr-uplop") { const c = core(); if (c.project.underlay) { c.commit(); c.project.underlay.opacity = Number(t.value) / 100; c.persist("underlay-op"); } return; }
    if (t.getAttribute && t.getAttribute("data-pr-layer")) {
      const c = core(), l = c.project.layers.find((x) => x.id === t.getAttribute("data-pr-layer"));
      if (l) { c.commit(); l.visible = !!t.checked; c.persist("layer-toggle"); }
    }
  });
  document.addEventListener("input", (e) => {
    if (!R.active) return;
    if (e.target.id === "ep-pr-uplop") { const p = core().project; if (p.underlay) { p.underlay.opacity = Number(e.target.value) / 100; renderScene(); } }
    if (e.target.getAttribute && e.target.getAttribute("data-pr-beamw")) {
      const c = core(), bm = (c.project.beams || []).find((b) => b.id === e.target.getAttribute("data-pr-beamw"));
      if (bm) { bm.width = Math.max(3, Number(e.target.value) || 20); renderScene(); c.persist("beam-w"); }
    }
  });

  // ---------- подключение из plan-mount ----------
  function attach(canvas) {
    R.canvas = canvas;
    canvas.onTap(onTap);
    canvas.onViewChanged(() => renderScaled());
    setMode("view");
    R.selectedRoomId = null;
    renderScene();
  }
  function detach() { R.canvas = null; if (EP.Plan.Unfold) EP.Plan.Unfold.close(); }
  function setActive(on) { R.active = on; }

  EP.Plan = EP.Plan || {};
  EP.Plan.Rooms = {
    attach, detach, setActive, setMode, renderScene, T, CFG,
    // общий доступ для модулей слоёв 2-6
    openSheet, closeSheet, toast,
    isActive: () => R.active,
    currentMode: () => R.mode,
    selectedBeamId: () => R.selectedBeam || null,
    canvasCmPerPx: () => (R.canvas ? R.canvas.cmPerPx() : 1)
  };
})();
