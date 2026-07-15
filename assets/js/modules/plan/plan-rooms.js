/* Electric Pro V29 — Проект квартиры: комнаты и инструменты (Слой 1).
   Режимы: взгляд / прямоугольник (2 тапа + размеры числом) / контур (по точкам) /
   рулетка / подложка (фото + калибровка масштаба). Панель комнаты: имя, потолок,
   размеры числом, влажная зона, копия, зеркало, удаление. Слои — вкл/выкл. */
(() => {
  "use strict";
  window.EP = window.EP || {};

  const T = {
    modes: { view: "☝", rect: "▭", poly: "⬠", beam: "▬", void: "▦", elem: "🔌", opening: "🚪", wall: "📐", ruler: "📏", underlay: "🖼", merge: "🔗" },
    modeHint: {
      view: "Тап: точка — редактор, стена — развёртка, комната — свойства.",
      rect: "Тапни два противоположных угла комнаты.",
      poly: "Ставь точки по контуру. Замкни тапом в первую точку.",
      beam: "Балка/перегородка: тапни начало и конец, потом тяни концы.",
      void: "Вентшахта / мини-комната внутри комнаты: тапни два противоположных угла.",
      elem: "Выбери тип в палитре и тапай по стене (свет/ТП — внутрь комнаты).",
      opening: "Проёмы: выбери дверь/окно/раздвижную/балкон и тапни по стене или перегородке.",
      wall: "Тапни по любой стене — сразу откроется её развёртка во весь экран.",
      ruler: "Тапни две точки — расстояние.",
      underlay: "Фото-план: загрузка, масштаб по известной длине, перенос.",
      merge: "Тапни первую комнату, потом соседнюю — объединятся в одну.",
      mergeSecond: "Тапни соседнюю комнату (или ту же — отменить)."
    },
    room: "Комната", create: "Создать", cancel: "Отмена", close: "Закрыть",
    name: "Название", width: "Ширина, см", depth: "Глубина, см", ceil: "Потолок, см",
    wet: "Влажная зона (санузел/кухня)", dup: "⧉ Копия", mirror: "⇋ Зеркало", del: "✕ Удалить",
    confirmDelRoom: "Удалить комнату?",
    mergeTapRoom: "Тапни по комнате.",
    mergeFail: "Эти комнаты не соприкасаются одной общей границей — объединить нельзя.",
    mergeBlocked: "На общей стене есть точки/проёмы — перенеси или удали их и повтори.",
    mergeCancelled: "Объединение отменено.",
    mergeDone: "Комнаты объединены.",
    mergeAskTitle: "Как объединить?",
    mergeAskHint: "«Полностью» — общая стена исчезает совсем. «Перегородка» — останется сплошная стена (как обычная перегородка). «Перемычка» — останется только балка сверху, низ свободен (проём/арка). Оставленное можно потом подвинуть/сменить материал/удалить, как любую балку.",
    mergeFullBtn: "Полностью",
    mergeBeamBtn: "Перегородка",
    mergeLintelBtn: "Перемычка",
    routeTitle: "Трасса",
    routeManual: "· правлено вручную",
    routeHint: "Тяни точку излома, чтобы подвинуть путь. Тяни середину прямого участка — добавит новый излом. Концы (у точки/щита/распайки) не двигаются.",
    routeFlip: "🔄 Развернуть",
    routeFlipNone: "Рядом нет прямого угла — разворачивать нечего.",
    routeAuto: "↺ Авто",
    routeCalc: "🧮 Пересчитать",
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
  // тактильный отклик на значимый снап (угол/ось) и замыкание контура — молча
  // не срабатывает, если Vibration API недоступен (iOS Safari и т.п.)
  const vibrate = (pattern) => { try { navigator.vibrate && navigator.vibrate(pattern); } catch (e) {} };
  const core = () => EP.Plan.Core;
  const G = () => EP.Plan.Geometry;

  const R = {
    canvas: null, active: false,
    mode: "view", draft: { points: [] }, pendingRect: null, pendingPoly: null,
    selectedRoomId: null, ruler: { a: null, b: null }, beamDraft: { a: null, b: null }, voidDraft: { a: null, b: null },
    umove: false, calib: { on: false, a: null, b: null }, mergeFirst: null, mergePending: null
  };

  // ---------- сцена ----------
  function ui() { return { selectedRoomId: R.selectedRoomId, draft: R.draft, ruler: R.ruler, beamDraft: R.beamDraft, voidDraft: R.voidDraft }; }
  function renderScene() {
    if (!R.canvas || !EP.Plan.Render) return;
    EP.Plan.Render.draw(R.canvas, core().project, ui());
    const hint = $("#ep-plan-modehint");
    if (hint) hint.textContent = T.modeHint[R.mode] || "";
  }
  function renderScaled() { if (R.canvas && EP.Plan.Render) EP.Plan.Render.drawScaled(R.canvas, core().project, ui()); }
  // перерисовка не чаще кадра — тяга пальцем остаётся плавной
  let sceneRaf = 0;
  function renderSceneSoon() {
    if (sceneRaf) return;
    sceneRaf = (window.requestAnimationFrame || ((f) => setTimeout(f, 16)))(() => { sceneRaf = 0; renderScene(); });
  }

  // ---------- режимы ----------
  function setMode(mode) {
    R.mode = mode;
    R.draft = { points: [] }; R.pendingRect = null; R.pendingPoly = null;
    R.ruler = { a: null, b: null }; R.beamDraft = { a: null, b: null }; R.voidDraft = { a: null, b: null };
    R.calib = { on: false, a: null, b: null };
    R.selectedBeam = null; R.selectedVoid = null; R.selectedRoute = null; R.selectedRouteTap = null; R.mergeFirst = null; R.mergePending = null;
    setMove(false);
    document.querySelectorAll("[data-plan-mode]").forEach((b) => b.classList.toggle("on", b.getAttribute("data-plan-mode") === mode));
    // плавающая quickbar (отмена/просмотр/вписать) снизу холста — только в активных
    // режимах рисования/расстановки, где тулбар сверху далеко от пальца
    const qb = document.querySelector("#ep-plan-quickbar");
    if (qb) qb.hidden = mode === "view";
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
        if (phase === "move") { p.underlay.x = (p.underlay.x || 0) + dx; p.underlay.y = (p.underlay.y || 0) + dy; renderSceneSoon(); }
        else if (phase === "end") core().persist("underlay-move");
      });
    } else R.canvas.setDragHandler(null);
  }

  // ---------- тапы ----------
  function onTap(w, e) {
    const p = core().project; if (!p) return;
    // ластик стилуса (Apple Pencil/Wacom, pointerType="eraser") — удаляет точку
    // под собой в любом режиме, если под ним реально что-то есть; иначе — обычный тап
    if (e && e.pointerType === "eraser" && R.canvas && EP.Plan.Elements) {
      const k = R.canvas.cmPerPx();
      const hit = EP.Plan.Elements.hitAt(w, EP.Plan.Elements.CFG.hitPx * k);
      if (hit && hit.el) { EP.Plan.Elements.deleteElement(hit.el); return; }
    }
    const step = p.settings.gridStep || 10;
    if (R.mode === "rect") {
      const pt = G().snapSmart(p, w, step, CFG.cornerSnapCm);
      if (pt.snapped) vibrate(10);
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
        vibrate([10, 30, 10]); // замкнули контур — отклик заметнее обычного снапа
        R.pendingPoly = pts.slice();
        sheetCreatePoly();
        return;
      }
      // автовыравнивание: линия от предыдущей точки доводится до 90°
      const ortho = G().orthoAdjust(pts[pts.length - 1] || null, w);
      const sp = G().snapSmart(p, ortho, step, CFG.cornerSnapCm);
      if (sp.snapped) vibrate(10);
      pts.push({ x: sp.x, y: sp.y }); // без snapped — эти точки уходят в room.points как есть
      renderScaled();
      sheetPolyDraft(); // длину следующей стены можно набрать цифрами
      return;
    }
    if (R.mode === "ruler") {
      if (!R.ruler.a || R.ruler.b) R.ruler = { a: w, b: null };
      else R.ruler.b = w;
      renderScaled();
      return;
    }
    if (R.mode === "beam") {
      const sp = G().snapSmart(p, w, step, CFG.cornerSnapCm);
      if (sp.snapped) vibrate(10);
      const snapped = { x: sp.x, y: sp.y }; // без snapped — уходит в beam.a/b как есть
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
    if (R.mode === "void") {
      const sp = G().snapSmart(p, w, step, CFG.cornerSnapCm);
      if (sp.snapped) vibrate(10);
      const snapped = { x: sp.x, y: sp.y }; // без snapped — уходит в void.a/b как есть
      if (!R.voidDraft.a) { R.voidDraft = { a: snapped, b: null }; renderScaled(); return; }
      const c = core();
      c.commit();
      c.project.voids = c.project.voids || [];
      const vd = c.model.newVoid(R.voidDraft.a, snapped, "shaft");
      c.project.voids.push(vd);
      c.persist("void-add");
      R.voidDraft = { a: null, b: null };
      setMode("view"); sheetVoid(vd); // сразу выделяем — можно поправить размер/тип
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
    if (R.mode === "wall") {
      // выделенный режим: любой тап сразу открывает развёртку СТЕНЫ (без приоритета
      // элементов/балок/комнат, как в "view") — надёжнее, чем ловить нужную стену обычным тапом
      const k = R.canvas.cmPerPx();
      const hit = G().wallAt(p, w, CFG.hitWallPx * 1.6 * k);
      if (hit && EP.Plan.Unfold) EP.Plan.Unfold.open(hit.wall.id, true);
      else toast(T.modeHint.wall);
      return;
    }
    if (R.mode === "merge") { onMergeTap(p, w); return; }
    // view: приоритет — элемент/щит > балка > шахта/мини-комната > трасса > стена (развёртка) > комната
    clearBeamSel(); clearVoidSel(); clearRouteSel();
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
    // вентшахта / мини-комната
    const vhit = voidAt(p, w);
    if (vhit) { R.selectedRoomId = null; sheetVoid(vhit); renderScene(); return; }
    // трасса (ручное редактирование)
    const rHit = routeAt(p, w, CFG.hitWallPx * k);
    if (rHit) { R.selectedRoomId = null; sheetRoute(rHit.route, rHit.pt); renderScene(); return; }
    const wallHit = G().wallAt(p, w, CFG.hitWallPx * k);
    if (wallHit && EP.Plan.Unfold) {
      R.selectedRoomId = null;
      // мини-превью — во весь экран разворачивается ТОЛЬКО явным режимом «Стена»
      // (см. R.mode==="wall" выше) или кнопкой ⤢ внутри самой развёртки
      EP.Plan.Unfold.open(wallHit.wall.id, false);
      renderScene();
      return;
    }
    const room = G().roomAt(p, w);
    R.selectedRoomId = room ? room.id : null;
    if (room) sheetRoom(room);
    else { closeSheet(); if (R.canvas) R.canvas.setDragHandler(null); }
    renderScene();
  }

  // ---------- шторка (нижняя панель) ----------
  function sheet() { return $("#ep-plan-sheet"); }
  // quickbar прячется, пока открыта шторка — они бы перекрывались снизу, а у
  // шторки обычно есть свои ✓/✕ рядом с тем же местом
  function syncQuickbarForSheet(sheetOpen) {
    const qb = $("#ep-plan-quickbar");
    if (qb) qb.style.display = sheetOpen ? "none" : "";
  }
  function openSheet(html) { const s = sheet(); if (s) { s.innerHTML = html; s.hidden = false; } syncQuickbarForSheet(true); }
  function closeSheet() { const s = sheet(); if (s) { s.hidden = true; s.innerHTML = ""; } syncQuickbarForSheet(false); }
  function toast(msg) { openSheet(`<div class="ep-plan-srow ep-plan-toast">${esc(msg)}</div>`); setTimeout(() => { if (sheet() && sheet().querySelector(".ep-plan-toast")) closeSheet(); }, 1800); }

  // редактируемый объект может оказаться под шторкой (она до 60% высоты холста
  // снизу) — сдвигаем вид вверх, чтобы точку/комнату было видно, пока её правишь.
  // Вызывается ПОСЛЕ openSheet(...) с мировой точкой объекта.
  function ensureVisibleAboveSheet(worldPt) {
    if (!R.canvas || !worldPt) return;
    const host = document.querySelector("#ep-plan-canvas"); if (!host) return;
    const hb = host.getBoundingClientRect();
    const r = R.canvas.svg.getBoundingClientRect();
    const v = R.canvas.getView();
    if (!v.h || !r.height) return;
    const sy = r.top + ((worldPt.y - v.y) / v.h) * r.height; // экранный Y точки
    const sheetTopScreen = hb.top + hb.height * 0.4; // шторка занимает нижние ~60%
    const margin = 40; // px запаса над шторкой
    if (sy < sheetTopScreen - margin) return; // и так видно — не дёргаем вид
    const dyPx = sy - (sheetTopScreen - margin);
    R.canvas.panBy(0, dyPx * R.canvas.cmPerPx());
  }

  // ---------- живой предпросмотр снапа при наведении (мышь/перо до тапа) ----------
  // Только в режимах, где вообще идёт снап на тапе (rect/poly/beam/void) — рисует
  // направляющие + прицел через plan-render.js, без полного renderScaled на каждое
  // движение (см. CLAUDE.md про перф во время жеста).
  const HOVER_SNAP_MODES = { rect: 1, poly: 1, beam: 1, void: 1 };
  function clearHoverPreview() { if (R.canvas && EP.Plan.Render) EP.Plan.Render.clearHoverPreview(R.canvas); }
  function onCanvasHover(w) {
    if (!R.canvas || !EP.Plan.Render || !HOVER_SNAP_MODES[R.mode]) { clearHoverPreview(); return; }
    const p = core().project; if (!p) { clearHoverPreview(); return; }
    const step = p.settings.gridStep || 10;
    // поли-режим доводит линию от прошлой точки до 90° ПЕРЕД снапом — так же,
    // как на реальном тапе (иначе предпросмотр не совпадёт с тем, что реально ляжет)
    const sp = (R.mode === "poly" && R.draft.points.length)
      ? G().snapSmart(p, G().orthoAdjust(R.draft.points[R.draft.points.length - 1], w), step, CFG.cornerSnapCm)
      : G().snapSmart(p, w, step, CFG.cornerSnapCm);
    EP.Plan.Render.hoverPreview(R.canvas, sp, R.canvas.cmPerPx());
  }

  // ---------- быстрое меню по долгому нажатию на точку (режим «Просмотр») ----------
  // Только удалить/копия — смену линии и так удобно делать в редакторе по обычному тапу.
  function closeQuickMenu() { const m = document.querySelector("#ep-plan-qmenu"); if (m) m.remove(); }
  function onCanvasLongPress(w, e) {
    if (R.mode !== "view" || !EP.Plan.Elements || !R.canvas) return;
    const k = R.canvas.cmPerPx();
    const hit = EP.Plan.Elements.hitAt(w, EP.Plan.Elements.CFG.hitPx * k);
    if (!hit || !hit.el) return;
    vibrate(15);
    closeQuickMenu();
    const host = document.querySelector("#ep-plan-canvas"); if (!host) return;
    const hb = host.getBoundingClientRect();
    const menu = document.createElement("div");
    menu.id = "ep-plan-qmenu";
    menu.className = "ep-plan-qmenu";
    menu.style.left = Math.max(6, Math.min(hb.width - 130, e.clientX - hb.left - 60)) + "px";
    menu.style.top = Math.max(6, Math.min(hb.height - 50, e.clientY - hb.top - 56)) + "px";
    menu.innerHTML = `<button type="button" class="ep-plan-qmbtn ep-clickable" data-qm-dup>⧉ Копия</button><button type="button" class="ep-plan-qmbtn ep-plan-qmbtn-del ep-clickable" data-qm-del>✕ Удалить</button>`;
    host.appendChild(menu);
    const elId = hit.el.id;
    menu.addEventListener("click", (ev) => {
      const t = ev.target;
      const el2 = (core().project.elements || []).find((x) => x.id === elId);
      if (t.closest("[data-qm-del]")) { closeQuickMenu(); EP.Plan.Elements.deleteElement(el2); }
      else if (t.closest("[data-qm-dup]")) { closeQuickMenu(); EP.Plan.Elements.duplicateElement(el2); }
    });
    setTimeout(() => { document.addEventListener("pointerdown", closeQuickMenu, { once: true, capture: true }); }, 0);
  }

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
  // рисование контура с ЦИФРАМИ: набери длину и нажми направление — точка ляжет точно
  function sheetPolyDraft() {
    const pts = R.draft.points;
    if (!pts.length) return;
    openSheet(`<div class="ep-plan-srow"><b>Контур</b> · точек: ${pts.length}</div>
      <div class="ep-plan-srow">
        <label class="ep-plan-range" style="flex:0 0 150px">Длина стены, см<input id="ep-pr-plen" type="number" inputmode="numeric" min="10" placeholder="напр. 320"></label>
        <button type="button" class="ep-plan-tbtn ep-clickable" data-pr-pdir="l" aria-label="Влево">←</button>
        <button type="button" class="ep-plan-tbtn ep-clickable" data-pr-pdir="u" aria-label="Вверх">↑</button>
        <button type="button" class="ep-plan-tbtn ep-clickable" data-pr-pdir="d" aria-label="Вниз">↓</button>
        <button type="button" class="ep-plan-tbtn ep-clickable" data-pr-pdir="r" aria-label="Вправо">→</button>
      </div>
      <div class="ep-plan-srow ep-plan-sbtns">
        <button type="button" class="ep-plan-tbtn ep-clickable" data-pr-pundo>⌫ Точка</button>
        ${pts.length >= 3 ? `<button type="button" class="btn btn-primary ep-clickable" data-pr-pclosepoly>Замкнуть</button>` : ""}
        <button type="button" class="btn btn-ghost ep-clickable" data-pr-cancel>${T.cancel}</button>
      </div>
      <div class="ep-plan-modehint">Или просто тапай по плану. Замкнуть — тап в первую точку.</div>`);
  }
  function polyDirAdd(dir) {
    const pts = R.draft.points;
    if (!pts.length) return;
    const len = Number(($("#ep-pr-plen") || {}).value) || 0;
    if (len < 10) { toast("Введи длину, см (мин. 10)."); return; }
    const last = pts[pts.length - 1];
    const D = { r: [1, 0], l: [-1, 0], d: [0, 1], u: [0, -1] }[dir] || [1, 0];
    pts.push({ x: last.x + D[0] * len, y: last.y + D[1] * len });
    renderScaled();
    sheetPolyDraft();
    const inp = $("#ep-pr-plen"); if (inp) inp.focus();
  }

  function sheetRoom(room) {
    const p = core().project;
    const isR = G().isRect(room), d = isR ? G().rectDims(room) : null;
    const wet = (room.zones || []).indexOf("wet") >= 0;
    openSheet(`<div class="ep-plan-srow"><b>${esc(room.name)}</b> · ${G().fmtArea(G().roomNetArea(p, room))}</div>
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
    enableRoomDrag(room.id); // тяни углы/стены выбранной комнаты
    ensureVisibleAboveSheet(G().centroid(room.points));
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
    ensureVisibleAboveSheet({ x: (bm.a.x + bm.b.x) / 2, y: (bm.a.y + bm.b.y) / 2 });
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
        if (!grabbed) return false; // жест остаётся панорамой
        core().commit();
        return;
      }
      if (phase === "move" && grabbed) {
        bm[grabbed] = { x: bm[grabbed].x + dx, y: bm[grabbed].y + dy };
        renderSceneSoon();
      } else if (phase === "end" && grabbed) {
        const step = c.project.settings.gridStep || 10;
        bm[grabbed] = G().snapPoint(bm[grabbed], step);
        c.persist("beam-move"); grabbed = null; renderScene();
      }
    });
  }
  function clearBeamSel() { R.selectedBeam = null; if (R.canvas) R.canvas.setDragHandler(null); }

  // ---------- вентшахта / мини-комната внутри комнаты (project.voids) ----------
  function voidAt(p, w) {
    return (p.voids || []).find((vd) => {
      const r = G().voidRect(vd);
      return w.x >= r.x1 && w.x <= r.x2 && w.y >= r.y1 && w.y <= r.y2;
    }) || null;
  }
  function sheetVoid(vd) {
    const r = G().voidRect(vd);
    openSheet(`<div class="ep-plan-srow"><b>${esc(vd.kind === "room" ? "Мини-комната" : "Вент. шахта")}</b></div>
      <div class="ep-plan-srow">
        <button type="button" class="ep-plan-chip ep-clickable ${vd.kind !== "room" ? "on" : ""}" data-pr-voidkind="shaft">Шахта</button>
        <button type="button" class="ep-plan-chip ep-clickable ${vd.kind === "room" ? "on" : ""}" data-pr-voidkind="room">Комната</button>
      </div>
      <div class="ep-plan-srow"><input id="ep-pr-vname" type="text" value="${esc(vd.name || "")}" maxlength="30" placeholder="Название"></div>
      <div class="ep-plan-srow ep-plan-s2">
        <label>${T.width}<input id="ep-pr-vw" type="number" inputmode="numeric" min="10" value="${Math.round(r.w)}"></label>
        <label>${T.depth}<input id="ep-pr-vh" type="number" inputmode="numeric" min="10" value="${Math.round(r.h)}"></label>
      </div>
      <div class="ep-plan-modehint">Тяни целиком, чтобы переместить.</div>
      <div class="ep-plan-srow ep-plan-sbtns">
        <button type="button" class="ep-plan-tbtn ep-clickable" data-pr-voidapply="${esc(vd.id)}">✓</button>
        <button type="button" class="ep-plan-tbtn ep-plan-danger ep-clickable" data-pr-voiddel="${esc(vd.id)}">${T.del}</button></div>`);
    R.selectedVoid = vd.id;
    enableVoidDrag();
    renderScene();
    ensureVisibleAboveSheet({ x: (r.x1 + r.x2) / 2, y: (r.y1 + r.y2) / 2 });
  }
  function applyVoid(id) {
    const c = core(), vd = (c.project.voids || []).find((v) => v.id === id);
    if (!vd) return;
    c.commit();
    const nm = ($("#ep-pr-vname") || {}).value;
    vd.name = (nm || "").trim() || (vd.kind === "room" ? "Комната" : "Шахта");
    const r = G().voidRect(vd);
    const cx = (r.x1 + r.x2) / 2, cy = (r.y1 + r.y2) / 2;
    const wv = Math.max(10, Number(($("#ep-pr-vw") || {}).value) || r.w);
    const hv = Math.max(10, Number(($("#ep-pr-vh") || {}).value) || r.h);
    vd.a = { x: cx - wv / 2, y: cy - hv / 2 };
    vd.b = { x: cx + wv / 2, y: cy + hv / 2 };
    c.persist("void-apply");
    clearVoidSel(); closeSheet(); renderScene();
  }
  // тянуть весь прямоугольник целиком (без ресайза — размер только числом в редакторе)
  function enableVoidDrag() {
    if (!R.canvas) return;
    R.canvas.setDragHandler((dx, dy, phase, start) => {
      const c = core(), vd = (c.project.voids || []).find((v) => v.id === R.selectedVoid);
      if (!vd) return;
      if (phase === "start") {
        const r = G().voidRect(vd);
        if (start.x < r.x1 || start.x > r.x2 || start.y < r.y1 || start.y > r.y2) return false; // мимо — пан
        core().commit();
        return;
      }
      if (phase === "move") {
        vd.a = { x: vd.a.x + dx, y: vd.a.y + dy };
        vd.b = { x: vd.b.x + dx, y: vd.b.y + dy };
        renderSceneSoon();
      } else if (phase === "end") {
        const step = c.project.settings.gridStep || 10;
        vd.a = G().snapPoint(vd.a, step); vd.b = G().snapPoint(vd.b, step);
        c.persist("void-move"); renderScene();
      }
    });
  }
  function clearVoidSel() { R.selectedVoid = null; if (R.canvas) R.canvas.setDragHandler(null); }

  // ---------- ручное редактирование трасс (Слой 4.1): тяга опорных точек / разворот угла ----------
  // Данные и хит-тест — в plan-routes.js (владелец p.routes); здесь — только выделение/тяга/UI,
  // тем же способом, что и у балки/пустоты (единственное место, где есть доступ к R.canvas).
  function routeAt(p, w, maxD) {
    return EP.Plan.Routes && EP.Plan.Routes.routeAt ? EP.Plan.Routes.routeAt(p, w, maxD) : null;
  }
  function sheetRoute(rt, tapPos) {
    const p = core().project;
    const circ = rt.circuitId ? (p.circuits || []).find((c) => c.id === rt.circuitId) : null;
    const len = G().polylineLen(rt.points || []);
    openSheet(`<div class="ep-plan-srow"><b>${T.routeTitle}</b>${circ ? ` · ${esc(circ.name)}` : ""} · ${G().fmtLen(len)}${rt.manual ? ` <span class="ep-plan-mshint">${T.routeManual}</span>` : ""}</div>
      <div class="ep-plan-modehint">${T.routeHint}</div>
      <div class="ep-plan-srow ep-plan-sbtns">
        <button type="button" class="ep-plan-tbtn ep-clickable" data-prt2-flip>${T.routeFlip}</button>
        ${rt.manual ? `<button type="button" class="ep-plan-tbtn ep-clickable" data-prt2-auto="${esc(rt.id)}">${T.routeAuto}</button>` : ""}
        ${EP.Plan.Calc ? `<button type="button" class="ep-plan-tbtn ep-clickable" data-prt2-calc>${T.routeCalc}</button>` : ""}
        <button type="button" class="ep-plan-tbtn ep-clickable" data-prt2-done>✓</button>
      </div>`);
    R.selectedRoute = rt.id;
    R.selectedRouteTap = tapPos || (rt.points && rt.points[Math.floor((rt.points.length - 1) / 2)]) || null;
    enableRouteDrag();
    renderScene();
    if (tapPos) ensureVisibleAboveSheet(tapPos);
  }
  function clearRouteSel() { R.selectedRoute = null; R.selectedRouteTap = null; if (R.canvas) R.canvas.setDragHandler(null); }
  // разворачивает ближайший к последнему тапу прямой угол трассы (P->C->N сначала по
  // одной оси, потом по другой) в альтернативную вершину того же прямоугольника
  function flipNearestCorner() {
    const c = core(), rt = (c.project.routes || []).find((r) => r.id === R.selectedRoute);
    if (!rt || !R.selectedRouteTap || !rt.points || rt.points.length < 3) { toast(T.routeFlipNone); return; }
    let best = -1, bestD = Infinity;
    for (let i = 1; i < rt.points.length - 1; i++) {
      const d = G().dist(R.selectedRouteTap, rt.points[i]);
      if (d < bestD) { bestD = d; best = i; }
    }
    if (best < 0) { toast(T.routeFlipNone); return; }
    const flipped = G().flipOrthoCorner(rt.points[best - 1], rt.points[best], rt.points[best + 1]);
    if (!flipped) { toast(T.routeFlipNone); return; }
    c.commit();
    rt.points[best] = flipped;
    rt.manual = true;
    c.persist("route-flip");
    R.selectedRouteTap = flipped;
    sheetRoute(rt, flipped);
  }
  // тяга: существующий излом (не концевые точки — те завязаны на позицию элемента/
  // щита/распайки) — двигаем; середина прямого участка — вставляем новый излом и
  // сразу тянем его. Мимо — жест остаётся паном (return false из "start").
  function enableRouteDrag() {
    if (!R.canvas) return;
    let grabbed = -1;
    R.canvas.setDragHandler((dx, dy, phase, start) => {
      const c = core(), rt = (c.project.routes || []).find((r) => r.id === R.selectedRoute);
      if (!rt || !rt.points) return false;
      if (phase === "start") {
        const k = R.canvas.cmPerPx();
        const rr = Math.max(18 * k, 14);
        let best = -1, bestD = rr;
        for (let i = 1; i < rt.points.length - 1; i++) {
          const d = G().dist(start, rt.points[i]);
          if (d <= bestD) { bestD = d; best = i; }
        }
        if (best >= 0) { grabbed = best; core().commit(); return; }
        let segI = -1, segD = rr, segPt = null;
        for (let i = 0; i < rt.points.length - 1; i++) {
          const cl = G().closestOnSeg(start, rt.points[i], rt.points[i + 1]);
          if (cl.d <= segD) { segD = cl.d; segI = i; segPt = cl; }
        }
        if (segI < 0) return false; // мимо — пан
        core().commit();
        rt.points.splice(segI + 1, 0, { x: segPt.x, y: segPt.y });
        grabbed = segI + 1;
        return;
      }
      if (phase === "move" && grabbed >= 0) {
        rt.points[grabbed] = { x: rt.points[grabbed].x + dx, y: rt.points[grabbed].y + dy };
        renderSceneSoon();
      } else if (phase === "end" && grabbed >= 0) {
        const step = c.project.settings.gridStep || 10;
        const oj = G().orthoJoint(rt.points[grabbed - 1], rt.points[grabbed], rt.points[grabbed + 1]);
        rt.points[grabbed] = {
          x: oj.lockedX ? oj.x : G().snap(oj.x, step),
          y: oj.lockedY ? oj.y : G().snap(oj.y, step)
        };
        rt.manual = true;
        R.selectedRouteTap = rt.points[grabbed];
        c.persist("route-drag"); grabbed = -1; renderScene();
      }
    });
  }

  // тянуть УГЛЫ и СТЕНЫ выбранной комнаты: угол — форма, стена — сдвиг по нормали.
  // Если палец не попал ни в угол, ни в стену — жест панорамирует (return false).
  function enableRoomDrag(roomId) {
    if (!R.canvas) return;
    let grab = null; // { kind: 'corner'|'wall', i, n?{x,y} }
    R.canvas.setDragHandler((dx, dy, phase, start) => {
      const c = core(), room = (c.project.rooms || []).find((r) => r.id === roomId);
      if (!room || (room.points || []).length < 3) return false;
      const pts = room.points;
      if (phase === "start") {
        const k = R.canvas.cmPerPx();
        const rCorner = 18 * k, rWall = 14 * k;
        grab = null;
        let bd = rCorner;
        pts.forEach((v, i) => { const d = G().dist(start, v); if (d <= bd) { bd = d; grab = { kind: "corner", i }; } });
        if (!grab) {
          let bw = rWall;
          G().walls(room).forEach((w) => {
            const cs = G().closestOnSeg(start, w.a, w.b);
            if (cs.d <= bw && cs.t > 0.12 && cs.t < 0.88) { // середина стены, не углы
              const len = w.len || 1;
              bw = cs.d;
              grab = { kind: "wall", i: w.i, n: { x: -(w.b.y - w.a.y) / len, y: (w.b.x - w.a.x) / len } };
            }
          });
        }
        if (!grab) return false;
        c.commit();
        return;
      }
      if (phase === "move" && grab) {
        if (grab.kind === "corner") {
          pts[grab.i] = { x: pts[grab.i].x + dx, y: pts[grab.i].y + dy };
        } else {
          const d = dx * grab.n.x + dy * grab.n.y; // проекция на нормаль — стена едет параллельно себе
          const j = (grab.i + 1) % pts.length;
          pts[grab.i] = { x: pts[grab.i].x + grab.n.x * d, y: pts[grab.i].y + grab.n.y * d };
          pts[j] = { x: pts[j].x + grab.n.x * d, y: pts[j].y + grab.n.y * d };
        }
        renderSceneSoon();
      } else if (phase === "end" && grab) {
        const step = c.project.settings.gridStep || 10;
        if (grab.kind === "corner") pts[grab.i] = G().snapPoint(pts[grab.i], step);
        else { const j = (grab.i + 1) % pts.length; pts[grab.i] = G().snapPoint(pts[grab.i], step); pts[j] = G().snapPoint(pts[j], step); }
        c.persist("room-reshape");
        grab = null;
        renderScene();
      }
    });
  }
  function sheetLayers() {
    const p = core().project; if (!p) return;
    const st = p.settings.symbolStyle || "simple";
    openSheet(`<div class="ep-plan-srow"><b>${T.layersTitle}</b></div>
      <div class="ep-plan-layers">${p.layers.map((l) => `
        <label class="ep-plan-chk"><input type="checkbox" data-pr-layer="${esc(l.id)}" ${l.visible !== false ? "checked" : ""}>
        <i class="ep-plan-dot" style="background:${esc(l.color)}"></i> ${esc(l.name)}</label>`).join("")}</div>
      <div class="ep-plan-srow">Значки:
        <button type="button" class="ep-plan-chip ep-clickable ${st !== "gost" ? "on" : ""}" data-pr-symst="simple">Простые</button>
        <button type="button" class="ep-plan-chip ep-clickable ${st === "gost" ? "on" : ""}" data-pr-symst="gost">ГОСТ</button>
      </div>
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
    R.selectedRoomId = null; closeSheet(); if (R.canvas) R.canvas.setDragHandler(null);
    renderScene(); // ✓ — применить и закрыть вкладку
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
    closeSheet(); if (R.canvas) R.canvas.setDragHandler(null);
  }

  // ---- объединение двух соприкасающихся комнат в одну (Г/Ш-образная без ручного контура) ----
  function onMergeTap(p, w) {
    const room = G().roomAt(p, w);
    if (!room) { toast(T.mergeTapRoom); return; }
    if (!R.mergeFirst) {
      R.mergeFirst = room.id;
      R.selectedRoomId = room.id;
      renderScene(); // ПЕРЕД правкой подсказки — иначе renderScene() сама сбросит текст на T.modeHint[R.mode]
      const hint = $("#ep-plan-modehint"); if (hint) hint.textContent = T.modeHint.mergeSecond;
      return;
    }
    if (room.id === R.mergeFirst) { R.mergeFirst = null; R.selectedRoomId = null; toast(T.mergeCancelled); renderScene(); return; }
    sheetMergeConfirm(R.mergeFirst, room.id);
  }
  // спрашивает — стереть общую стену совсем, оставить сплошной перегородкой
  // или перемычкой (балкой сверху проёма) на её месте
  function sheetMergeConfirm(aId, bId) {
    R.mergeFirst = null;
    R.mergePending = { a: aId, b: bId };
    openSheet(`<div class="ep-plan-srow"><b>${esc(T.mergeAskTitle)}</b></div>
      <div class="ep-plan-srow ep-plan-sbtns">
        <button type="button" class="ep-plan-tbtn ep-clickable" data-pr-mergemode="full">${esc(T.mergeFullBtn)}</button>
        <button type="button" class="ep-plan-tbtn ep-clickable" data-pr-mergemode="beam">${esc(T.mergeBeamBtn)}</button>
        <button type="button" class="ep-plan-tbtn ep-clickable" data-pr-mergemode="lintel">${esc(T.mergeLintelBtn)}</button>
      </div>
      <div class="ep-plan-modehint">${esc(T.mergeAskHint)}</div>
      <div class="ep-plan-srow ep-plan-sbtns"><button type="button" class="ep-plan-tbtn ep-plan-danger ep-clickable" data-pr-mergecancel>✕ ${esc(T.cancel)}</button></div>`);
    renderScene();
  }
  // переносит переопределения толщины/материала на стену объединённой комнаты от той
  // исходной комнаты (A или B), чья стена физически там была — иначе после слияния
  // все стены тихо съезжали бы на настройки проекта по умолчанию
  function inheritWallOverrides(mergedPts, roomA, roomB) {
    const wallTh = [], wallMat = [];
    const sources = [roomA, roomB].map((room) => ({ room, walls: G().walls(room) }));
    const n = mergedPts.length;
    for (let i = 0; i < n; i++) {
      const a = mergedPts[i], b = mergedPts[(i + 1) % n];
      const mid = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
      let best = null;
      sources.forEach(({ room, walls }) => walls.forEach((ww) => {
        const cl = G().closestOnSeg(mid, ww.a, ww.b);
        if (cl.d < 1 && (!best || cl.d < best.d)) best = { room, wi: ww.i, d: cl.d };
      }));
      if (best) {
        const th = best.room.wallTh && best.room.wallTh[best.wi];
        const mat = best.room.wallMat && best.room.wallMat[best.wi];
        if (th != null) wallTh[i] = th;
        if (mat != null) wallMat[i] = mat;
      }
    }
    return { wallTh, wallMat };
  }
  // ставит балку kind:kind ("beam" — сплошная перегородка, "lintel" — перемычка)
  // на месте каждого куска стены, погашенного слиянием — толщину/материал берёт
  // с той исходной стены (A или B), что там физически была.
  // ВАЖНО: roomA/roomB к этому моменту уже могут быть удалены из project.rooms
  // (см. вызов ниже) — поэтому переопределение читаем напрямую из room.wallTh/wallMat
  // по индексу стены (как inheritWallOverrides), а не через G.wallThOf/wallMatOf,
  // которые ищут владеющую комнату ЧЕРЕЗ project.rooms и не найдут её там.
  function addMergeLintels(project, goneSegs, roomA, roomB, kind) {
    if (!goneSegs || !goneSegs.length) return;
    const defTh = Math.max(4, (project.settings && project.settings.wallThickness) || 10);
    const defMat = (project.settings && project.settings.wallMaterial) || "Бетон";
    const sources = [roomA, roomB].map((room) => ({ room, walls: G().walls(room) }));
    project.beams = project.beams || [];
    goneSegs.forEach(([a, b]) => {
      if (G().dist(a, b) < 1) return;
      const mid = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
      let best = null;
      sources.forEach(({ room, walls }) => walls.forEach((ww) => {
        const cl = G().closestOnSeg(mid, ww.a, ww.b);
        if (cl.d < 5 && (!best || cl.d < best.d)) best = { room, wi: ww.i, d: cl.d };
      }));
      const th = best && best.room.wallTh && Number(best.room.wallTh[best.wi]);
      const mat = best && best.room.wallMat && best.room.wallMat[best.wi];
      project.beams.push(core().model.newBeam(a, b, kind, th >= 4 ? th : defTh, mat || defMat));
    });
  }
  // возвращает объединённую комнату при успехе, иначе null (с тостом причины);
  // opts.remnant: "beam" — на месте погашенной общей стены остаётся сплошная
  // перегородка, "lintel" — только перемычка (балка) сверху проёма, иначе
  // (null/undefined) — прежнее поведение: стена исчезает совсем
  function mergeRooms(idA, idB, opts) {
    const c = core(), p = c.project;
    const roomA = (p.rooms || []).find((r) => r.id === idA);
    const roomB = (p.rooms || []).find((r) => r.id === idB);
    if (!roomA || !roomB || roomA.id === roomB.id) return null;
    const goneInfo = {};
    const mergedPts = G().mergeRoomPolygons(roomA.points, roomB.points, goneInfo);
    if (!mergedPts) { toast(T.mergeFail); return null; }

    // мировые позиции точек/проёмов на стенах A и B — считаем ДО перестройки геометрии,
    // пока старые стены ещё существуют в project
    const belongsToPair = (wallId) => { const rid = String(wallId || "").split(":")[0]; return rid === roomA.id || rid === roomB.id; };
    const els = (p.elements || []).filter((el) => el.wallId && belongsToPair(el.wallId));
    const ops = (p.openings || []).filter((op) => op.wallId && belongsToPair(op.wallId));
    const elPos = els.map((el) => G().elemPoint(p, el));
    const opPos = ops.map((op) => { const ww = G().wallById(p, op.wallId); return ww ? G().pointAtOffset(ww, op.offset + op.width / 2) : null; });

    const newRoom = c.model.newRoom(mergedPts, roomA.name);
    newRoom.material = roomA.material || roomB.material || null;
    newRoom.height = roomA.height || roomB.height || null;
    if ((roomA.zones || []).indexOf("wet") >= 0 || (roomB.zones || []).indexOf("wet") >= 0) newRoom.zones = ["wet"];
    const inh = inheritWallOverrides(mergedPts, roomA, roomB);
    if (inh.wallTh.length) newRoom.wallTh = inh.wallTh;
    if (inh.wallMat.length) newRoom.wallMat = inh.wallMat;

    // если точка/проём стояли РОВНО на исчезающей общей стене — им больше некуда
    // приткнуться на новой комнате; сливать в таком виде небезопасно (потеряли бы
    // привязку), просим сначала убрать их с этого места
    const newWalls = G().walls(newRoom);
    const findNearWall = (pos) => {
      if (!pos) return null;
      let best = null;
      newWalls.forEach((ww) => { const cl = G().closestOnSeg(pos, ww.a, ww.b); if (cl.d < 5 && (!best || cl.d < best.d)) best = { wall: ww, cl }; });
      return best;
    };
    for (let i = 0; i < elPos.length; i++) if (!findNearWall(elPos[i])) { toast(T.mergeBlocked); return null; }
    for (let i = 0; i < opPos.length; i++) if (!findNearWall(opPos[i])) { toast(T.mergeBlocked); return null; }

    c.commit();
    c.project.rooms = c.project.rooms.filter((r) => r.id !== roomA.id && r.id !== roomB.id);
    c.project.rooms.push(newRoom);
    els.forEach((el, i) => { const hit = findNearWall(elPos[i]); el.wallId = newRoom.id + ":" + hit.wall.i; el.offset = Math.round(hit.cl.t * hit.wall.len); });
    ops.forEach((op, i) => { const hit = findNearWall(opPos[i]); op.wallId = newRoom.id + ":" + hit.wall.i; op.offset = Math.max(0, Math.round(hit.cl.t * hit.wall.len - op.width / 2)); });
    if (opts && (opts.remnant === "beam" || opts.remnant === "lintel")) addMergeLintels(c.project, goneInfo.gone, roomA, roomB, opts.remnant);
    c.persist("room-merge");
    return newRoom;
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
    if ((el = t.closest("[data-pr-pdir]"))) return polyDirAdd(el.getAttribute("data-pr-pdir"));
    if (t.closest("[data-pr-pundo]")) { R.draft.points.pop(); renderScaled(); if (R.draft.points.length) sheetPolyDraft(); else closeSheet(); return; }
    if (t.closest("[data-pr-pclosepoly]")) { if (R.draft.points.length >= 3) { R.pendingPoly = R.draft.points.slice(); sheetCreatePoly(); } return; }
    if ((el = t.closest("[data-pr-symst]"))) {
      const c = core(); c.commit();
      c.project.settings.symbolStyle = el.getAttribute("data-pr-symst");
      c.persist("symbol-style"); sheetLayers(); renderScene();
      return;
    }
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
    if ((el = t.closest("[data-pr-mergemode]"))) {
      const mp = R.mergePending; R.mergePending = null; closeSheet();
      if (!mp) return;
      const mode = el.getAttribute("data-pr-mergemode");
      const merged = mergeRooms(mp.a, mp.b, { remnant: mode === "beam" || mode === "lintel" ? mode : null });
      if (!merged) return; // тост с причиной уже показан внутри mergeRooms
      toast(T.mergeDone);
      setMode("view");
      R.selectedRoomId = merged.id;
      sheetRoom(merged);
      return;
    }
    if (t.closest("[data-pr-mergecancel]")) { R.mergePending = null; R.selectedRoomId = null; closeSheet(); toast(T.mergeCancelled); renderScene(); return; }
    if (t.closest("[data-prt2-flip]")) { flipNearestCorner(); return; }
    if ((el = t.closest("[data-prt2-auto]"))) {
      if (EP.Plan.Routes && EP.Plan.Routes.resetRouteToAuto) EP.Plan.Routes.resetRouteToAuto(el.getAttribute("data-prt2-auto"));
      clearRouteSel(); closeSheet(); renderScene(); return;
    }
    if (t.closest("[data-prt2-calc]")) {
      clearRouteSel(); closeSheet(); renderScene();
      if (EP.Plan.Calc) EP.Plan.Calc.sheet();
      return;
    }
    if (t.closest("[data-prt2-done]")) { clearRouteSel(); closeSheet(); renderScene(); return; }
    if ((el = t.closest("[data-pr-beamdel]"))) {
      const c = core(), bid = el.getAttribute("data-pr-beamdel"); c.commit();
      c.project.beams = (c.project.beams || []).filter((b) => b.id !== bid);
      c.project.openings = (c.project.openings || []).filter((o) => o.wallId !== "beam:" + bid); // проёмы перегородки
      c.persist("beam-del"); clearBeamSel(); closeSheet(); renderScene(); return;
    }
    if ((el = t.closest("[data-pr-voidkind]"))) {
      const c = core(), vd = (c.project.voids || []).find((v) => v.id === R.selectedVoid);
      if (vd) {
        c.commit();
        const nk = el.getAttribute("data-pr-voidkind");
        if (vd.name === (vd.kind === "room" ? "Комната" : "Шахта")) vd.name = nk === "room" ? "Комната" : "Шахта"; // кастомное имя не трогаем
        vd.kind = nk;
        c.persist("void-kind"); sheetVoid(vd);
      }
      return;
    }
    if ((el = t.closest("[data-pr-voidapply]"))) return applyVoid(el.getAttribute("data-pr-voidapply"));
    if ((el = t.closest("[data-pr-voiddel]"))) {
      const c = core(), vid = el.getAttribute("data-pr-voiddel"); c.commit();
      c.project.voids = (c.project.voids || []).filter((v) => v.id !== vid);
      c.persist("void-del"); clearVoidSel(); closeSheet(); renderScene(); return;
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
    canvas.onHover(onCanvasHover);
    canvas.onHoverEnd(clearHoverPreview);
    canvas.onLongPress(onCanvasLongPress);
    setMode("view");
    R.selectedRoomId = null;
    renderScene();
  }
  function detach() { R.canvas = null; closeQuickMenu(); if (EP.Plan.Unfold) EP.Plan.Unfold.close(); }
  function setActive(on) { R.active = on; }

  EP.Plan = EP.Plan || {};
  EP.Plan.Rooms = {
    attach, detach, setActive, setMode, renderScene, T, CFG,
    // общий доступ для модулей слоёв 2-6
    openSheet, closeSheet, toast, ensureVisibleAboveSheet,
    isActive: () => R.active,
    currentMode: () => R.mode,
    selectedBeamId: () => R.selectedBeam || null,
    selectedVoidId: () => R.selectedVoid || null,
    selectedRouteId: () => R.selectedRoute || null,
    canvasCmPerPx: () => (R.canvas ? R.canvas.cmPerPx() : 1),
    mergeRooms
  };
})();
