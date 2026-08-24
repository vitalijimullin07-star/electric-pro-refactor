/* Electric Pro V29 — Проект квартиры: комнаты и инструменты (Слой 1).
   Режимы: взгляд / прямоугольник (2 тапа + размеры числом) / контур (по точкам) /
   рулетка / подложка (фото + калибровка масштаба). Панель комнаты: имя, потолок,
   размеры числом, влажная зона, копия, зеркало, удаление. Слои — вкл/выкл. */
(() => {
  "use strict";
  window.EP = window.EP || {};

  const T = {
    modes: { view: "☝", rect: "▭", poly: "⬠", beam: "▬", void: "▦", furn: "🛋", elem: "🔌", opening: "🚪", ruler: "📏", underlay: "🖼", merge: "🔗", movroom: "🧭" },
    modeHint: {
      view: "Тап: точка — редактор, стена — развёртка, комната — свойства.",
      rect: "Тапни угол — впиши размеры, или тапни второй угол.",
      attach: "Тапни стену, к которой пристроить комнату — она встанет вплотную.",
      split: "Разрез: тапни на одной стене комнаты, потом на противоположной — станет две комнаты.",
      furn: "Выбери мебель/технику и тапни по плану — встанет центром в точку тапа.",
      poly: "Ставь точки по контуру. Замкни тапом в первую точку.",
      beam: "Балка/перегородка: тапни начало и конец, потом тяни концы.",
      void: "Вентшахта / мини-комната внутри комнаты: тапни два противоположных угла.",
      elem: "Выбери тип в палитре и тапай по стене (свет/ТП — внутрь комнаты).",
      opening: "Проёмы: выбери дверь/окно/раздвижную/балкон и тапни по стене или перегородке.",
      ruler: "Тапни две точки — расстояние.",
      underlay: "Фото-план: загрузка, масштаб по известной длине, перенос.",
      merge: "Тапни первую комнату, потом соседнюю — объединятся в одну.",
      movroom: "Тапни комнату и тяни — поедет целиком: точки, проёмы, щит и балки внутри. Углы липнут к углам соседних комнат.",
      mergeSecond: "Тапни соседнюю комнату (или ту же — отменить).",
      guide: "Магистраль: тапай точки приоритетного направления трасс (по коридору). Повторный тап в последнюю точку — сохранить линию."
    },
    targetPickHint: "Тапни точку на плане (свет/бра/трек/вывод/24В/розетку) — она станет целью этой клавиши.",
    targetPicked: (name) => `Клавиша → ${name} ✓`,
    targetPickMiss: "Отменено — тап не попал в подходящую точку.",
    room: "Комната", create: "Создать", cancel: "Отмена", close: "Закрыть",
    splitFail: "Разрез не получился: тапни у ДВУХ противоположных стен одной комнаты.",
    splitBlocked: "Сначала убери точку/проём с линии разреза — иначе потеряется привязка.",
    name: "Название", width: "Ширина, см", depth: "Глубина, см", ceil: "Потолок, см",
    wet: "Влажная зона (санузел/кухня)", dup: "⧉ Копия", mirror: "⇋ Зеркало", del: "✕ Удалить",
    unfoldBtn: "Развёртка",
    pickRoomHint: "Выбери комнату — откроется развёртка её первой стены во весь экран.",
    pickRoomEmpty: "Сначала нарисуй комнату.",
    confirmDelRoom: "Удалить комнату?",
    mergeTapRoom: "Тапни по комнате.",
    mergeFail: "Эти комнаты не соприкасаются одной общей границей — объединить нельзя.",
    mergeBlocked: "На общей стене есть точки/проёмы — перенеси или удали их и повтори.",
    mergeCancelled: "Объединение отменено.",
    mergeDone: "Комнаты объединены.",
    mvTitle: "🧭 Перенос комнаты",
    mvHint: "Тяни комнату пальцем — она едет целиком (стены, точки на них, проёмы, свободные точки/щиты/балки внутри). Углы прилипают к углам соседних комнат, чтобы стены не расходились. Стрелки — по шагу сетки.",
    mvTapRoom: "Тапни по комнате, которую нужно перенести.",
    mvDone: "✓ Готово",
    mvMoved: (dx, dy) => `Перенесена на ${dx > 0 ? "+" : ""}${Math.round(dx)} / ${dy > 0 ? "+" : ""}${Math.round(dy)} см`,
    mergeAskTitle: "Как объединить?",
    mergeAskHint: "«Полностью» — общая стена исчезает совсем. «Перегородка» — останется сплошная стена (как обычная перегородка). «Перемычка» — останется только балка сверху, низ свободен (проём/арка). Оставленное можно потом подвинуть/сменить материал/удалить, как любую балку.",
    mergeFullBtn: "Полностью",
    mergeBeamBtn: "Перегородка",
    mergeLintelBtn: "Перемычка",
    routeTitle: "Трасса",
    routeManual: "· правлено вручную",
    routeModePoint: "✏️ Ломать",
    routeModeSegment: "↔ Двигать",
    routeHintPoint: "Тяни точку излома, чтобы подвинуть путь. Тяни середину прямого участка — добавит новый излом. Концы (у точки/щита/распайки) не двигаются.",
    routeHintSeg: "Тяни любую точку прямого участка — двигается ВЕСЬ отрезок целиком, от угла до угла. Концы (у точки/щита/распайки) не двигаются.",
    routeFlip: "🔄 Развернуть",
    routeFlipNone: "Рядом нет прямого угла — разворачивать нечего.",
    routeAuto: "↺ Авто",
    routeCalc: "🧮 Пересчитать",
    sheetFs: "Во весь экран",
    upl: { load: "📷 Загрузить фото плана", calib: "📏 Калибровка масштаба", move: "✋ Перенос",
           moveOn: "✋ Перенос: тяни подложку", del: "✕ Убрать подложку", opacity: "Прозрачность",
           calibHint: "Тапни 2 точки на подложке с известным расстоянием.",
           calibDist: "Реальное расстояние, см", apply: "Применить" },
    layersTitle: "Слои", legendTitle: "Условные обозначения", legendEmpty: "Пока пусто — добавь точки на план.",
    tooSmall: "Комната слишком маленькая (мин. 30 см).",
    polyNeed: "Нужно минимум 3 точки.",
    qbEdit: "✎ Быстрый доступ", qbClose: "✕",
    qbEditHint: "Отметь инструменты, которые всегда должны быть под рукой на плавающей панели снизу. Первые места панель дополнительно подстраивает сама — под последние использованные инструменты.",
    qbReset: "↺ Сбросить"
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
    umove: false, calib: { on: false, a: null, b: null }, mergeFirst: null, mergePending: null,
    soloCircuit: null, // работа по линиям: id единственной показанной ярко линии QF (view-состояние, не в модели)
    routeDragMode: "point", // "point"|"segment" — явный переключатель режима тяги трассы (кнопки в sheetRoute), см. enableRouteDrag
    guideDraft: { points: [] }, // черновик рисуемой магистрали трасс (режим ⇉)
    targetPick: null // одноразовый выбор цели клавиши выключателя тапом: {elId, ki} (armTargetPick)
  };

  // ---------- плавающая quickbar: быстрый доступ (просьба пользователя — редактируемая
  // панель, 2 левых места динамические — под последние использованные инструменты,
  // запоминаются между сессиями) ----------
  // Тот же набор, что и «режимы» в верхнем тулбаре (см. T.modes) — здесь его пилотный
  // список для панели быстрого доступа (что можно закрепить/что попадает в MRU).
  const QB_TOOLS = { view: "☝", rect: "▭", poly: "⬠", attach: "⊞", split: "✂", beam: "▬", void: "▦", furn: "🛋", merge: "🔗", movroom: "🧭", elem: "🔌", opening: "🚪", wall: "📐", ruler: "📏", underlay: "🖼", guide: "⇉" };
  const QB_LABELS = {
    view: "Просмотр", rect: "Прямоугольная комната", poly: "Комната по точкам",
    attach: "Пристроить к стене", split: "Разрезать комнату", beam: "Балка/перемычка",
    void: "Вентшахта/мини-комната", merge: "Объединить комнаты", movroom: "Перенести комнату", elem: "Точки", opening: "Проёмы",
    wall: "Развёртка стены", ruler: "Рулетка", underlay: "Подложка-фото",
    guide: "Магистраль трасс"
  };
  const QB_LS_KEY = "ep_plan_quickbar_v1";
  // localStorage — view-состояние устройства, не часть проекта (как и soloCircuit
  // выше, но переживает перезагрузку страницы, поэтому свой ключ, а не R.*)
  function qbLoad() {
    try {
      const v = JSON.parse(localStorage.getItem(QB_LS_KEY) || "null");
      if (v && typeof v === "object") {
        return {
          mru: Array.isArray(v.mru) ? v.mru.filter((m) => QB_TOOLS[m]).slice(0, 2) : [],
          pinned: Array.isArray(v.pinned) ? v.pinned.filter((m) => QB_TOOLS[m]) : ["view"]
        };
      }
    } catch (e) {}
    return { mru: [], pinned: ["view"] }; // по умолчанию — как раньше: закреплён «Просмотр»
  }
  const QB = qbLoad();
  function qbSave() { try { localStorage.setItem(QB_LS_KEY, JSON.stringify(QB)); } catch (e) {} }
  // запоминаем инструмент как «последний использованный» — левые 2 места панели.
  // "view" НЕ трогает MRU: это не инструмент, а нейтральное состояние — attach()
  // при КАЖДОМ монтировании канваса безусловно зовёт setMode("view") (см. attach()
  // ниже), и если бы это тоже попадало в MRU, каждое открытие проекта тихо съедало
  // бы одно из двух «запомненных» мест ДО того, как пользователь вообще что-то
  // сделал. «Просмотр» и так всегда доступен — закреплён по умолчанию в pinned.
  function qbTrack(mode) {
    if (QB_TOOLS[mode] && mode !== "view") {
      QB.mru = [mode].concat(QB.mru.filter((m) => m !== mode)).slice(0, 2);
      qbSave();
    }
    // renderQuickbar() — ВСЕГДА, даже для "view" (в MRU он не попадает, см. выше):
    // (1) первый setMode("view") из attach() — единственный гарантированный вызов
    // при открытии проекта; раньше early-return оставлял #ep-plan-quickbar ПУСТЫМ
    // контейнером до первого выбора инструмента — свернул панель (︿) сразу после
    // открытия → плавающая панель без единой кнопки (пойман полным визуальным
    // тестом); (2) возврат в "view" теперь тоже перерисовывает — иначе подсветка
    // .on последнего инструмента залипала на кнопке quickbar.
    renderQuickbar();
  }
  function renderQuickbar() {
    const qb = $("#ep-plan-quickbar"); if (!qb) return;
    const c = core();
    const dyn = QB.mru;
    const pinned = QB.pinned.filter((m) => dyn.indexOf(m) === -1);
    const toolBtn = (id) => `<button type="button" class="ep-plan-qbtn ep-clickable${R.mode === id ? " on" : ""}" data-plan-mode="${id}" aria-label="${esc(QB_LABELS[id] || id)}">${QB_TOOLS[id]}</button>`;
    qb.innerHTML = `
      <div class="ep-plan-qb-top">
        <button type="button" class="ep-plan-qb-mini ep-clickable" data-plan-undo aria-label="Отменить" title="Назад по изменениям" ${c.canUndo() ? "" : "disabled"}>《</button>
        <button type="button" class="ep-plan-qb-mini ep-clickable" data-plan-redo aria-label="Вернуть" title="Вперёд по изменениям" ${c.canRedo() ? "" : "disabled"}>》</button>
        <button type="button" class="ep-plan-qb-mini ep-clickable" data-qb-edit aria-label="${T.qbEdit}" title="${T.qbEdit}">✎</button>
      </div>
      <div class="ep-plan-qb-main">
        ${dyn.map(toolBtn).join("")}${pinned.map(toolBtn).join("")}
        <button type="button" class="ep-plan-qbtn ep-clickable" data-plan-fit aria-label="Показать всё">⛶</button>
      </div>`;
  }
  // Видимость плавающей quickbar: раньше показывалась ЛИБО в режиме рисования,
  // ЛИБО когда свёрнута панель инструментов (двойной триггер). Пользователь
  // явно попросил сузить до ОДНОГО триггера — видна РОВНО тогда, когда нажата
  // кнопка ︿ (панель инструментов свёрнута), и скрыта всегда, когда панель
  // развёрнута, ДАЖЕ в активном режиме рисования (раньше в этом случае
  // оставалась видна). EP.Plan.Mount может быть ещё не готов при первом вызове
  // (порядок загрузки модулей) — тогда просто не учитываем её состояние,
  // а не падаем (панель развёрнута по умолчанию => quickbar скрыта).
  function syncQuickbarVisibility() {
    const qb = document.querySelector("#ep-plan-quickbar");
    if (!qb) return;
    const ctrlsExpanded = !EP.Plan.Mount || !EP.Plan.Mount.ctrlsOn || EP.Plan.Mount.ctrlsOn();
    qb.hidden = ctrlsExpanded;
  }
  // шторка редактирования: какие инструменты держать закреплёнными на панели (кроме
  // двух динамических мест — теми панель распоряжается сама, см. qbTrack)
  function sheetQuickbar() {
    const chip = (id) => `<button type="button" class="ep-plan-chip ep-clickable ${QB.pinned.indexOf(id) !== -1 ? "on" : ""}" data-qb-pin="${id}">${QB_TOOLS[id]} ${esc(QB_LABELS[id])}</button>`;
    openSheet(`<div class="ep-plan-srow"><b>${T.qbEdit}</b><span class="ep-plan-flex"></span><button type="button" class="ep-plan-mini ep-clickable" data-qb-close>${T.qbClose}</button></div>
      <div class="ep-plan-modehint">${T.qbEditHint}</div>
      <div class="ep-plan-srow ep-plan-qbchips">${Object.keys(QB_TOOLS).map(chip).join("")}</div>
      <div class="ep-plan-srow ep-plan-sbtns"><button type="button" class="ep-plan-tbtn ep-plan-danger ep-clickable" data-qb-reset>${T.qbReset}</button></div>`);
  }

  // ---------- сцена ----------
  function ui() { return { selectedRoomId: R.selectedRoomId, draft: R.draft, ruler: R.ruler, beamDraft: R.beamDraft, voidDraft: R.voidDraft, soloCircuit: R.soloCircuit, guideDraft: R.guideDraft, guideMode: R.mode === "guide" }; }
  // solo линии QF (изоляция на плане): тап по линии в шторке 🧵 Трассы — только она ярко,
  // остальные приглушены. Повторный тап по той же линии — снять solo. Не персистится.
  function setSoloCircuit(id) { R.soloCircuit = (R.soloCircuit === id) ? null : (id || null); renderScene(); }
  function clearSolo() { if (R.soloCircuit) { R.soloCircuit = null; renderScene(); } }
  function renderScene() {
    if (!R.canvas || !EP.Plan.Render) return;
    EP.Plan.Render.draw(R.canvas, G().floorScoped(core().project), ui());
    const hint = $("#ep-plan-modehint");
    if (hint) hint.textContent = T.modeHint[R.mode] || "";
  }
  function renderScaled() { if (R.canvas && EP.Plan.Render) EP.Plan.Render.drawScaled(R.canvas, G().floorScoped(core().project), ui()); }
  // перерисовка не чаще кадра — тяга пальцем остаётся плавной
  let sceneRaf = 0;
  function renderSceneSoon() {
    if (sceneRaf) return;
    sceneRaf = (window.requestAnimationFrame || ((f) => setTimeout(f, 16)))(() => { sceneRaf = 0; renderScene(); });
  }
  // Перерисовка сцены при ИЗМЕНЕНИИ ВИДА (пан/зум) — вызывается из canvas.onViewChanged
  // на КАЖДЫЙ pointermove. КРИТИЧНО для слабых телефонов (репорт: Redmi Note 8 Pro,
  // «фризы при перемещении плана»): drawScaled зависит ТОЛЬКО от cmPerPx (масштаб),
  // а НЕ от позиции пана — при чистом пане (сдвиг viewBox без смены масштаба) вывод
  // drawScaled ПОБАЙТОВО тот же, viewBox сам визуально двигает содержимое. Значит
  // ре-рендер на пан — чистая трата (полный обход элементов/трасс/подписей каждый
  // кадр). Раньше onViewChanged звал renderScaled() СИНХРОННО на каждый кадр пана —
  // отсюда фризы и графический тиринг на слабом GPU. Теперь: пан (cmPerPx не менялся)
  // пропускаем целиком; зум/ресайз контейнера (cmPerPx изменился) — через rAF, не чаще
  // кадра. lastScaledK не мешает контент-перерисовкам (renderScene/renderScaled их зовут
  // напрямую) — он гейтит ТОЛЬКО повторный ре-скейл от движения вида.
  let scaledRaf = 0, lastScaledK = null;
  function onViewChanged() {
    const k = R.canvas ? R.canvas.cmPerPx() : null;
    if (k !== null && lastScaledK !== null && Math.abs(k - lastScaledK) < 1e-6) return; // пан — масштаб тот же
    lastScaledK = k;
    if (scaledRaf) return;
    scaledRaf = (window.requestAnimationFrame || ((f) => setTimeout(f, 16)))(() => { scaledRaf = 0; renderScaled(); });
  }

  // ---------- режимы ----------
  function setMode(mode) {
    R.mode = mode;
    R.draft = { points: [] }; R.pendingRect = null; R.pendingPoly = null; R.rectAnchor = null; R.attach = null; R.split = null;
    R.ruler = { a: null, b: null }; R.beamDraft = { a: null, b: null }; R.voidDraft = { a: null, b: null };
    R.guideDraft = { points: [] };
    R.targetPick = null; // смена режима отменяет одноразовый выбор цели клавиши
    R.calib = { on: false, a: null, b: null };
    R.selectedBeam = null; R.selectedVoid = null; R.selectedRoute = null; R.selectedRouteTap = null; R.mergeFirst = null; R.mergePending = null;
    setMove(false);
    document.querySelectorAll("[data-plan-mode]").forEach((b) => b.classList.toggle("on", b.getAttribute("data-plan-mode") === mode));
    qbTrack(mode); // запомнить как «последний использованный» + перерисовать панель быстрого доступа
    syncQuickbarVisibility();
    if (mode === "underlay") sheetUnderlay();
    else if (mode === "furn" && EP.Plan.Furniture) EP.Plan.Furniture.onModeEnter();
    else if (mode === "elem" && EP.Plan.Elements) EP.Plan.Elements.onModeEnter();
    else if (mode === "opening" && EP.Plan.Elements) EP.Plan.Elements.onOpeningModeEnter();
    else if (mode === "guide") {
      // шторку открываем ТОЛЬКО если уже есть сохранённые магистрали (ради 🗑) —
      // иначе она закрывает низ холста и первый же тап рисования попадает в неё,
      // а не в план (поймано живым тестом); свежее рисование — только подсказка
      const hasGuides = (G().floorScoped(core().project).guides || []).length > 0;
      if (hasGuides) sheetGuide(); else closeSheet();
    }
    else closeSheet();
    renderScene();
  }
  // вооружить одноразовый выбор цели клавиши выключателя тапом по плану (кнопка 🎯 в
  // редакторе точки, plan-elements.js): закрываем шторку, чтобы не мешала целиться, и
  // ждём следующий onTap (перехват в начале onTap) — режим НЕ меняем (обычно view)
  function armTargetPick(elId, ki) {
    R.targetPick = { elId, ki: ki || 0 };
    closeSheet();
    toast(T.targetPickHint);
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
    // одноразовый выбор цели клавиши выключателя тапом (armTargetPick из редактора
    // точки, кнопка 🎯): следующий тап по подходящей точке — назначить и вернуться в
    // редактор; тап мимо/по неподходящему типу — отмена (тоже с возвратом в редактор)
    if (R.targetPick && EP.Plan.Elements) {
      const pick = R.targetPick; R.targetPick = null;
      const c = core();
      const sw = (c.project.elements || []).find((x) => x.id === pick.elId);
      const okT = EP.Plan.Elements.SW_TARGET_TYPES || {};
      const hit = EP.Plan.Elements.hitAt(w, EP.Plan.Elements.CFG.hitPx * R.canvas.cmPerPx());
      if (sw && hit && hit.el && hit.el.id !== sw.id && okT[hit.el.type]) {
        c.commit();
        sw.targetIds = sw.targetIds || [];
        // ДОБАВЛЯЕМ к уже назначенным целям этой клавиши (их может быть несколько —
        // 2 трансформатора / три вывода 24В с одной клавиши), а не заменяем; повторный
        // выбор той же точки ничего не дублирует
        const curT = G().targetIdsOf ? G().targetIdsOf(sw, pick.ki) : [];
        const nextT = curT.indexOf(hit.el.id) >= 0 ? curT : curT.concat([hit.el.id]);
        sw.targetIds[pick.ki] = nextT.length > 1 ? nextT : (nextT[0] || null);
        if (pick.ki === 0) sw.targetId = nextT.length === 1 ? nextT[0] : null; // legacy-алиас клавиши 0
        // линия цели — автоматически (220В-цель = линия выключателя, «Вывод 24В» — своя
        // 24В-линия): тот же хелпер, что и у чипов выбора цели в редакторе точки
        if (EP.Plan.Elements.syncTargetCircuit) EP.Plan.Elements.syncTargetCircuit(sw, hit.el);
        c.persist("elem-target");
        toast(T.targetPicked((EP.Plan.Elements.TYPES[hit.el.type] || {}).name || hit.el.type));
      } else {
        toast(T.targetPickMiss);
      }
      if (sw) EP.Plan.Elements.openEditor(sw);
      renderScene();
      return;
    }
    const step = p.settings.gridStep || 10;
    // ✂ разрез: два тапа поперёк комнаты
    if (R.mode === "split") {
      const pt = G().snapSmart(p, w, step, CFG.cornerSnapCm);
      const room = G().roomAt(p, { x: pt.x, y: pt.y }) || G().roomAt(p, w);
      if (!R.split || !R.split.a) {
        if (!room) { toast("Тапни внутри комнаты, у стены, где начать разрез."); return; }
        R.split = { roomId: room.id, a: { x: pt.x, y: pt.y }, b: null };
        splitPreview(); sheetSplit(); return;
      }
      R.split.b = { x: pt.x, y: pt.y };
      splitPreview(); sheetSplit(); return;
    }
    // ＋ пристроить комнату: тап по стене выбирает её как базу
    if (R.mode === "attach") {
      const hit = G().wallAt(p, w, CFG.hitWallPx * R.canvas.cmPerPx());
      if (!hit) { toast("Тапни по стене, к которой пристроить комнату."); return; }
      R.attach = { wallId: hit.wall.id, w: Math.round(hit.wall.len), h: 300, flip: false };
      attachPreview(); sheetAttach();
      return;
    }
    if (R.mode === "rect") {
      const pt = G().snapSmart(p, w, step, CFG.cornerSnapCm);
      if (pt.snapped) vibrate(10);
      // Первый тап — сразу предлагаем ВВЕСТИ размеры: второй тап целиться не нужно
      // (он по-прежнему работает, как раньше — кто привык, тот и тапает).
      if (!R.draft.points.length) {
        R.draft.points = [pt]; R.rectAnchor = pt;
        rectPreview(); sheetRectFromPoint();
        return;
      }
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
    if (R.mode === "guide") {
      // магистраль трасс: тапы набирают полилинию (автовыравнивание до 90°, как у
      // комнаты по точкам). Завершение — ПОВТОРНЫЙ тап в последнюю точку (паттерн
      // замыкания poly). Шторка закрывается на первом тапе — иначе она закрывает
      // низ холста и съедает тапы рисования по «коридору» (поймано живым тестом).
      const pts = R.guideDraft.points;
      if (pts.length >= 2 && G().dist(w, pts[pts.length - 1]) <= CFG.closePolyPx * R.canvas.cmPerPx()) {
        vibrate([10, 30, 10]);
        finishGuide();
        return;
      }
      const orthoG = G().orthoAdjust(pts[pts.length - 1] || null, w);
      const sp = G().snapSmart(p, orthoG, step, CFG.cornerSnapCm);
      if (sp.snapped) vibrate(10);
      pts.push({ x: sp.x, y: sp.y });
      if (pts.length === 1) closeSheet(); // шторка не мешает рисовать; вернётся после сохранения
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
    if (R.mode === "furn") { if (EP.Plan.Furniture) { EP.Plan.Furniture.placeAt(w); } return; }
    if (R.mode === "merge") { onMergeTap(p, w); return; }
    if (R.mode === "movroom") { onMoveRoomTap(p, w); return; }
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
    // мебель / бытовая техника
    if (EP.Plan.Furniture) {
      const ahit = EP.Plan.Furniture.hitAt(w);
      if (ahit) { R.selectedRoomId = null; EP.Plan.Furniture.openEditor(ahit); return; }
    }
    // трасса (ручное редактирование)
    const rHit = routeAt(p, w, CFG.hitWallPx * k);
    if (rHit) { R.selectedRoomId = null; sheetRoute(rHit.route, rHit.pt); renderScene(); return; }
    const wallHit = G().wallAt(p, w, CFG.hitWallPx * k);
    if (wallHit && EP.Plan.Unfold) {
      R.selectedRoomId = null;
      // мини-превью — во весь экран разворачивается ТОЛЬКО через кнопку 📐 (список
      // комнат, sheetPickRoomForUnfold), кнопку «📐 Развёртка» в шторке комнаты,
      // или кнопкой ⤢ внутри самой развёртки
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

  // Двойной тап по ЦИФРЕ размера (подпись высоты h=NNN под точкой ИЛИ звено размерной
  // цепочки вдоль стены) → сразу открыть редактор ЭТОЙ точки, где меняются «Отступ от
  // угла» и «Высота» (пользователь: «хотел двойной там по размеру, и редактировать»).
  // Возвращает true, если попал по цифре — тогда plan-canvas НЕ делает зум. Работает
  // только в режиме view (в режимах рисования двойной тап не переосмысливается).
  function onDoubleTap(w) {
    const p = core().project;
    if (!p || R.mode !== "view" || !R.canvas || !EP.Plan.Elements) return false;
    const k = R.canvas.cmPerPx();
    const tol = 16 * k;
    const dimsOn = ((p.layers || []).find((l) => l.id === "dims") || {}).visible !== false;
    // LOD: на отдалении подписи размеров/высот СКРЫТЫ (plan-render.js CFG.lodDimK) —
    // хит-тест по невидимой цифре не должен срабатывать (видимая цифра = зона тапа)
    const lodDims = k <= ((EP.Plan.Render && EP.Plan.Render.CFG && EP.Plan.Render.CFG.lodDimK) || 3);
    let best = null;
    const consider = (elemId, d) => { if (elemId && d < tol && (!best || d < best.d)) best = { elemId, d }; };
    // подписи высоты h=NNN под маркерами (видимы, пока не сработал LOD)
    if (lodDims) (p.elements || []).forEach((e) => {
      if (!e.wallId || e.type === "junction" || e.height == null) return;
      const dp = G().elemDrawPoint(p, e); if (!dp) return;
      const lp = { x: dp.x, y: dp.y + (e.type === "block" ? 22 : 20) * k };
      consider(e.id, Math.hypot(w.x - lp.x, w.y - lp.y));
    });
    // звенья размерной цепочки вдоль стен (только если слой «Размеры» включён И
    // цепочка не скрыта LOD'ом — иначе их не видно). Позиция цифры считается ТЕМ ЖЕ
    // off2, что и в plan-render.js — фиксированный отступ 5см от грани стены (не
    // зависит от зума, просьба пользователя) — общий хелпер G.wallChainStations,
    // чтобы хит-тест совпадал с видимой цифрой.
    if (dimsOn && lodDims) {
      const off2 = 5;
      (p.rooms || []).forEach((room) => {
        if ((room.points || []).length < 3) return;
        const c0 = G().centroid(room.points);
        G().walls(room).forEach((wl) => {
          const chain = G().wallChainStations(p, wl);
          if (!chain) return;
          let nx = -(wl.b.y - wl.a.y), ny = wl.b.x - wl.a.x;
          const nl = Math.hypot(nx, ny) || 1; nx /= nl; ny /= nl;
          if ((wl.mx - c0.x) * nx + (wl.my - c0.y) * ny < 0) { nx = -nx; ny = -ny; }
          chain.segs.forEach((sg) => {
            const pm = G().pointAtOffset(wl, sg.midOff);
            const mid = { x: pm.x + nx * off2, y: pm.y + ny * off2 };
            // правим «дальнюю» точку звена (bElemId), иначе ближнюю (у углов/проёмов elemId=null)
            consider(sg.bElemId || sg.aElemId, Math.hypot(w.x - mid.x, w.y - mid.y));
          });
        });
      });
    }
    if (!best) return false;
    const elem = (p.elements || []).find((e) => e.id === best.elemId);
    if (!elem) return false;
    R.selectedRoomId = null;
    EP.Plan.Elements.openEditor(elem);
    return true;
  }

  // ---------- шторка (нижняя панель) ----------
  function sheet() { return $("#ep-plan-sheet"); }
  // quickbar прячется, пока открыта шторка — они бы перекрывались снизу, а у
  // шторки обычно есть свои ✓/✕ рядом с тем же местом
  function syncQuickbarForSheet(sheetOpen) {
    const qb = $("#ep-plan-quickbar");
    if (qb) qb.style.display = sheetOpen ? "none" : "";
  }
  // ---------- сворачивание шторки (не закрытие) ----------
  // Просьба пользователя: «когда выбираю (щит или розетка, или бра и т.д.) при выборе
  // хотел чтобы окно скрывалось, да и в целом везде хотел так — не скрывалось, а
  // сворачивалось в нижнюю часть экрана кнопкой ^, но чтобы просто была кнопка в
  // нижнем правом углу». Реализовано ОДНОЙ плавающей кнопкой #ep-plan-sheetbtn в
  // правом нижнем углу холста (plan-mount.js): пока шторка открыта — «⌄» (свернуть),
  // пока свёрнута — «︿» (развернуть). Сворачивание НЕ трогает содержимое шторки
  // (innerHTML остаётся) — развернули и продолжаем с того же места; закрытие
  // (closeSheet) как раньше чистит всё. z-index кнопки выше .ep-plan-sheet-full,
  // поэтому она доступна и у шторки «во весь экран».
  function sheetBtn() { return $("#ep-plan-sheetbtn"); }
  // Пока шторка РАЗВЁРНУТА, кнопка поднимается РОВНО над её верхней кромкой (шторка
  // скроллится внутри себя — фиксированная кнопка в углу висела бы поверх её
  // содержимого на любой позиции скролла, паддинга снизу тут не хватает). Свёрнутая
  // шторка / «во весь экран» — кнопка на своём CSS-месте в правом нижнем углу.
  function placeSheetBtn() {
    const s = sheet(), b = sheetBtn(); if (!s || !b) return;
    const overlay = s.classList.contains("ep-plan-sheet-full") || s.classList.contains("is-landscape-forced");
    // на широком экране шторка — БОКОВАЯ панель (position:static, plan.css @media
    // 1024px): она не закрывает низ холста и высотой равна ему, поднимать над ней
    // кнопку нельзя (уехала бы за верх холста) — оставляем в углу
    let side = false;
    try { side = window.getComputedStyle(s).position !== "absolute"; } catch (e) {}
    if (b.hidden || R.sheetCollapsed || overlay || side) { b.style.bottom = ""; return; }
    // клавиатура открыта — шторка поднята на её высоту (plan.css, body[data-kb]), значит
    // и кнопку над кромкой надо поднять на столько же: инлайн-стиль здесь ПОБЕЖДАЕТ
    // CSS-правило, поэтому учитываем клавиатуру прямо в вычислении, а не только в CSS
    const kb = (EP.Keyboard && EP.Keyboard.height && EP.Keyboard.height()) || 0;
    b.style.bottom = ((s.offsetHeight || 0) + 14 + kb) + "px";
  }
  function syncSheetBtn() {
    const s = sheet(), b = sheetBtn(); if (!b) return;
    const open = !!(s && !s.hidden);
    b.hidden = !open || !!R.sheetTransient; // у тоста (1.8с) кнопка не нужна — мигала бы
    b.textContent = R.sheetCollapsed ? "︿" : "⌄";
    const lbl = R.sheetCollapsed ? "Развернуть панель" : "Свернуть панель вниз";
    b.setAttribute("aria-label", lbl); b.setAttribute("title", lbl);
    b.classList.toggle("is-collapsed", !!R.sheetCollapsed);
    placeSheetBtn();
    // высота шторки меняется и БЕЗ openSheet (правка полей внутри, раскрытие блоков) —
    // ResizeObserver держит кнопку над её кромкой; ставится один раз на элемент
    // (renderEditor пересоздаёт #ep-plan-sheet — сравниваем узел, иначе наблюдали бы
    // за отсоединённым старым элементом и кнопка перестала бы следить за высотой)
    if (s && window.ResizeObserver && R.sheetROnode !== s) {
      if (R.sheetRO) { try { R.sheetRO.disconnect(); } catch (e) {} }
      R.sheetRO = new ResizeObserver(() => placeSheetBtn());
      R.sheetRO.observe(s); R.sheetROnode = s;
    }
  }
  function collapseSheet() {
    const s = sheet(); if (!s || s.hidden) return;
    R.sheetCollapsed = true;
    s.classList.add("is-collapsed");
    syncQuickbarForSheet(false); // низ холста свободен — quickbar снова по своему правилу
    syncSheetBtn();
  }
  function expandSheet() {
    const s = sheet(); if (!s || s.hidden) return;
    R.sheetCollapsed = false;
    s.classList.remove("is-collapsed");
    syncQuickbarForSheet(true);
    syncSheetBtn();
  }
  function toggleSheetCollapsed() { if (R.sheetCollapsed) expandSheet(); else collapseSheet(); }
  // opts.keepCollapsed — ПЕРЕрисовка той же шторки (счётчик палитры после установки
  // точки и т.п.): если пользователь свернул её, она НЕ должна выпрыгивать обратно.
  // opts.transient — тост (сам закроется), кнопку сворачивания не показываем.
  function openSheet(html, opts) {
    const s = sheet();
    const keep = !!(opts && opts.keepCollapsed) && !!R.sheetCollapsed;
    R.sheetTransient = !!(opts && opts.transient);
    R.sheetCollapsed = keep;
    if (s) { s.innerHTML = html; s.hidden = false; s.classList.toggle("is-collapsed", keep); }
    syncQuickbarForSheet(!keep);
    syncSheetBtn();
  }
  function closeSheet() {
    const s = sheet();
    R.sheetCollapsed = false; R.sheetTransient = false;
    if (s) s.classList.remove("is-collapsed");
    // is-landscape-forced — CSS-разворот на 90° (Схема ⤢, Развёртка 🔄) на ОБЩЕМ
    // #ep-plan-sheet; снимаем здесь же (единая точка закрытия ЛЮБОЙ шторки, не
    // только своим ✕) — иначе класс мог бы залипнуть на элементе и сломать вид
    // СЛЕДУЮЩЕЙ открытой шторки.
    if (s) { s.hidden = true; s.innerHTML = ""; s.classList.remove("ep-plan-sheet-full"); s.classList.remove("is-landscape-forced"); }
    // solo линии управляется из шторки 🧵 Трассы — закрыли шторку, вернули полный вид
    // (иначе план остался бы приглушённым без видимого элемента управления)
    if (R.soloCircuit) { R.soloCircuit = null; renderScene(); }
    syncQuickbarForSheet(false);
    syncSheetBtn();
  }
  // общая кнопка «во весь экран» для шторок БЕЗ своего fullscreen-состояния
  // (Расчёт/Трассы/Проверки/Слои) — ЧИСТЫЙ CSS toggle (position:fixed через
  // .ep-plan-sheet-full), БЕЗ настоящего Fullscreen API — тот же приём и по той
  // же причине, что и у «Во весь экран» главного редактора (.ep-plan is-full,
  // см. инвариант выше): реальный requestFullscreen() на элементе с
  // backdrop-filter (шторка полупрозрачная, blur(8px)) на части реальных
  // устройств (репорт пользователя — «когда раскрываю, становится серым»)
  // ломает композитинг backdrop-filter внутри нативного fullscreen-топ-слоя —
  // браузер вместо блюра фона рисует шторку плоским серым вместо тёмной
  // полупрозрачной карточки. Раньше код ВСЁ ЕЩЁ звал s.requestFullscreen()
  // «для системного выхода жестом/кнопкой назад» — именно этот вызов и
  // провоцировал баг. Теперь — просто toggle класса, как у Развёртки/Схемы
  // это НЕ трогали (у них своя leaner fullscreen-логика без backdrop-filter
  // на самом fullscreen-элементе — .ep-plan-sheet-full там не участвует).
  function toggleSheetFullscreen() {
    const s = sheet(); if (!s) return;
    s.classList.toggle("ep-plan-sheet-full");
    placeSheetBtn(); // во весь экран кнопка сворачивания живёт в углу, обычная — над кромкой шторки
  }
  function toast(msg) { openSheet(`<div class="ep-plan-srow ep-plan-toast">${esc(msg)}</div>`, { transient: true }); setTimeout(() => { if (sheet() && sheet().querySelector(".ep-plan-toast")) closeSheet(); }, 1800); }

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

  // ---------- живой предпросмотр снапа при наведении (мышь/S-Pen до тапа) ----------
  // Режимы, где вообще идёт снап на тапе (rect/poly/beam/void — к сетке/углу; elem/
  // opening — к стене при установке точки/проёма) — рисует направляющие + прицел
  // через plan-render.js, без полного renderScaled на каждое движение (см. CLAUDE.md
  // про перф во время жеста). Наведение ДО касания физически существует только у
  // мыши и стилуса (S-Pen и т.п.) — у пальца hover-событий нет, поэтому это ЕСТЕСТВЕННО
  // работает только для этих указателей, без отдельного детекта модели устройства.
  const HOVER_SNAP_MODES = { rect: 1, poly: 1, beam: 1, void: 1, elem: 1, opening: 1 };
  function clearHoverPreview() { if (R.canvas && EP.Plan.Render) EP.Plan.Render.clearHoverPreview(R.canvas); }
  function onCanvasHover(w) {
    if (!R.canvas || !EP.Plan.Render || !HOVER_SNAP_MODES[R.mode]) { clearHoverPreview(); return; }
    const p = core().project; if (!p) { clearHoverPreview(); return; }
    if (R.mode === "elem" || R.mode === "opening") {
      const sp = EP.Plan.Elements ? EP.Plan.Elements.hoverSnapPoint(w, R.mode) : null;
      if (sp) EP.Plan.Render.hoverPreview(R.canvas, sp, R.canvas.cmPerPx()); else clearHoverPreview();
      return;
    }
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

  // ---------- магистраль трасс (режим ⇉): шторка рисования ----------
  // Магистраль — нарисованное ПРИОРИТЕТНОЕ направление автотрассировки (просьба
  // пользователя со скриншотом «каши»: трассы должны идти по нарисованному стволу
  // по коридору, заходить в комнаты от него). Полупрозрачная линия; после
  // «⚡ Построить» скрывается с плана (guide.hidden, см. plan-routes.js hideGuides).
  function sheetGuide() {
    const p = core().project;
    const saved = (G().floorScoped(p).guides || []).length;
    const draftN = R.guideDraft.points.length;
    openSheet(`<div class="ep-plan-srow"><b>⇉ Магистраль трасс</b><span class="ep-plan-flex"></span><button type="button" class="ep-plan-mini ep-clickable" data-pg-close>✕</button></div>
      <div class="ep-plan-modehint">${T.modeHint.guide} Нарисованных: ${saved}${draftN ? ` · точек в текущей: ${draftN}` : ""}. Трассы пойдут по магистрали между комнатами, внутри комнат — как обычно. После построения линия скрывается.</div>
      <div class="ep-plan-srow ep-plan-sbtns">
        <button type="button" class="btn btn-primary ep-clickable" data-pg-done ${draftN >= 2 ? "" : "disabled"}>✓ Готово</button>
        <button type="button" class="ep-plan-tbtn ep-clickable" data-pg-undo ${draftN ? "" : "disabled"}>↩ Точка</button>
        ${saved ? `<button type="button" class="ep-plan-tbtn ep-plan-danger ep-clickable" data-pg-clear>🗑 Убрать все</button>` : ""}
      </div>`);
  }
  function finishGuide() {
    const c = core(), p = c.project;
    if (R.guideDraft.points.length < 2) return;
    c.commit();
    p.guides = p.guides || [];
    p.guides.push(c.model.newGuide(R.guideDraft.points.slice()));
    c.persist("guide-add");
    R.guideDraft = { points: [] };
    toast("Магистраль добавлена — можно рисовать следующую или строить трассы");
    sheetGuide();
    renderScene();
  }

  /* ---------- комната ЧИСЛАМИ от одной точки ----------
     Раньше прямоугольник требовал двух тапов, и только потом размеры правились числами
     в шторке. Теперь после ПЕРВОГО тапа сразу можно вбить ширину и глубину: поставил
     угол — ввёл «420 × 310» — готово. Направление роста от этого угла выбирается чипами
     (↘ по умолчанию: вправо-вниз, как читается план). Второй тап никуда не делся.  */
  const RECT_DIRS = [["se", "↘"], ["sw", "↙"], ["ne", "↗"], ["nw", "↖"]];
  function rectNums() {
    const w = Math.max(CFG.minRoomCm, Number(($("#ep-pr-w") || {}).value) || 0);
    const h = Math.max(CFG.minRoomCm, Number(($("#ep-pr-h") || {}).value) || 0);
    return { w, h };
  }
  function rectFromAnchor(w, h) {
    const a = R.rectAnchor, d = R.rectDir || "se";
    return { x: d.indexOf("w") >= 0 ? a.x - w : a.x, y: d.indexOf("n") >= 0 ? a.y - h : a.y, w, h };
  }
  // живое превью контура по введённым числам (тот же draft, что рисует обычный второй тап)
  function rectPreview() {
    if (!R.rectAnchor) return;
    const n = rectNums();
    const r = rectFromAnchor(n.w || 400, n.h || 300);
    R.draft.points = [{ x: r.x, y: r.y }, { x: r.x + r.w, y: r.y }, { x: r.x + r.w, y: r.y + r.h }, { x: r.x, y: r.y + r.h }, { x: r.x, y: r.y }];
    renderScaled();
  }
  function sheetRectFromPoint() {
    R.rectDir = R.rectDir || "se";
    openSheet(`<div class="ep-plan-srow"><b>${T.room}</b> · угол поставлен</div>
      <div class="ep-plan-srow"><input id="ep-pr-name" type="text" placeholder="${T.name}" value="${T.room} ${core().project.rooms.length + 1}" maxlength="40"></div>
      <div class="ep-plan-srow ep-plan-s2">
        <label>${T.width}<input id="ep-pr-w" type="number" inputmode="numeric" min="30" value="400"></label>
        <label>${T.depth}<input id="ep-pr-h" type="number" inputmode="numeric" min="30" value="300"></label>
      </div>
      <div class="ep-plan-srow">Куда строить:
        ${RECT_DIRS.map(([d, g]) => `<button type="button" class="ep-plan-chip ep-clickable ${R.rectDir === d ? "on" : ""}" data-pr-rdir="${d}">${g}</button>`).join("")}
      </div>
      <div class="ep-plan-modehint">Впиши размеры — или просто тапни второй угол на плане, как раньше.</div>
      <div class="ep-plan-srow ep-plan-sbtns">
        <button type="button" class="btn btn-primary ep-clickable" data-pr-create-rect2>${T.create}</button>
        <button type="button" class="btn btn-ghost ep-clickable" data-pr-cancel>${T.cancel}</button>
      </div>`);
  }
  function createRectFromPoint() {
    if (!R.rectAnchor) return;
    const n = rectNums();
    R.pendingRect = rectFromAnchor(n.w, n.h);
    R.rectAnchor = null;
    createRect();
  }
  /* ---------- ＋ Пристроить комнату к стене ----------
     Самый частый способ набрать квартиру: от коридора пристроить спальню, от спальни —
     кухню. Ключевое отличие от «нарисовать рядом»: комната строится ПО САМОЙ СТЕНЕ
     (та же линия, те же координаты), поэтому общая стена получается по построению и
     физически не может разойтись на пару сантиметров — а именно из-за таких расхождений
     трассы потом идут «по стене». Сторона по умолчанию — НАРУЖУ от комнаты-хозяйки
     (нормаль G.wallFrame смотрит внутрь неё), но её можно перевернуть.  */
  function attachGeom(p, wall, width, depth, flip) {
    const fr = G().wallFrame(p, wall);
    if (!fr) return null;
    const dir = fr.dir;
    const nx = flip ? fr.nrm.x : -fr.nrm.x, ny = flip ? fr.nrm.y : -fr.nrm.y;
    const w = Math.max(CFG.minRoomCm, Math.min(width, wall.len));
    const a = wall.a;
    const b = { x: a.x + dir.x * w, y: a.y + dir.y * w };
    return [
      { x: a.x, y: a.y }, { x: b.x, y: b.y },
      { x: b.x + nx * depth, y: b.y + ny * depth },
      { x: a.x + nx * depth, y: a.y + ny * depth }
    ];
  }
  function attachPreview() {
    const a = R.attach;
    if (!a) return;
    const p = core().project, wall = G().wallById(p, a.wallId);
    if (!wall) return;
    const pts = attachGeom(p, wall, a.w, a.h, a.flip);
    if (!pts) return;
    R.draft.points = pts.concat([pts[0]]);
    renderScaled();
  }
  function sheetAttach() {
    const a = R.attach;
    if (!a) return;
    const p = core().project, wall = G().wallById(p, a.wallId);
    if (!wall) { closeSheet(); return; }
    const own = (p.rooms || []).find((r) => r.id === wall.roomId);
    openSheet(`<div class="ep-plan-srow"><b>Пристроить комнату</b> · стена ${wall.n} (${Math.round(wall.len)} см)${own ? " · " + esc(own.name) : ""}</div>
      <div class="ep-plan-srow"><input id="ep-pr-aname" type="text" placeholder="${T.name}" value="${T.room} ${(p.rooms || []).length + 1}" maxlength="40"></div>
      <div class="ep-plan-srow ep-plan-s2">
        <label>Вдоль стены, см<input id="ep-pr-aw" type="number" inputmode="numeric" min="30" max="${Math.round(wall.len)}" value="${Math.round(a.w)}"></label>
        <label>${T.depth}<input id="ep-pr-ah" type="number" inputmode="numeric" min="30" value="${Math.round(a.h)}"></label>
      </div>
      <div class="ep-plan-srow">
        <button type="button" class="ep-plan-chip ep-clickable" data-pr-aflip>⇄ На другую сторону</button>
      </div>
      <div class="ep-plan-modehint">Комната встанет вплотную к этой стене — общая стена получится сама, подгонять не нужно.</div>
      <div class="ep-plan-srow ep-plan-sbtns">
        <button type="button" class="btn btn-primary ep-clickable" data-pr-attach-go>✓ Пристроить</button>
        <button type="button" class="btn btn-ghost ep-clickable" data-pr-cancel>${T.cancel}</button>
      </div>`);
  }
  function attachRead() {
    const a = R.attach; if (!a) return;
    const w = Number(($("#ep-pr-aw") || {}).value) || a.w;
    const h = Number(($("#ep-pr-ah") || {}).value) || a.h;
    a.w = Math.max(CFG.minRoomCm, w);
    a.h = Math.max(CFG.minRoomCm, h);
  }
  function attachGo() {
    const a = R.attach; if (!a) return;
    attachRead();
    const c = core(), p = c.project, wall = G().wallById(p, a.wallId);
    if (!wall) return;
    const pts = attachGeom(p, wall, a.w, a.h, a.flip);
    if (!pts) { toast("Не получилось построить — попробуй другую стену."); return; }
    const name = (($("#ep-pr-aname") || {}).value || "").trim();
    c.commit();
    const room = c.model.newRoom(pts, name || undefined);
    p.rooms.push(room);
    c.persist("room-add");
    R.attach = null; R.draft = { points: [] };
    R.selectedRoomId = room.id;
    setMode("view"); sheetRoom(room);
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

  // кнопка 📐 в тулбаре: не режим рисования — сразу список комнат, тап по имени
  // открывает Развёртку fullscreen для ПЕРВОЙ стены этой комнаты (переключиться на
  // другую стену той же комнаты — чипы «Стена:» уже внутри развёртки). Без прицельного
  // тапа по конкретной стене на плане — пользователь путался, куда именно тапнуть.
  function sheetPickRoomForUnfold() {
    const rs = core().project.rooms || [];
    if (!rs.length) { toast(T.pickRoomEmpty); return; }
    openSheet(`<div class="ep-plan-srow"><b>📐 ${T.unfoldBtn}</b></div>
      <div class="ep-plan-srow">${T.pickRoomHint}</div>
      <div class="ep-plan-srow ep-plan-sbtns">
        ${rs.map((r) => `<button type="button" class="ep-plan-tbtn ep-clickable" data-pr-pickunfold="${esc(r.id)}">${esc(r.name)}</button>`).join("")}
      </div>`);
  }
  // ---------- 🧭 ПЕРЕНОС КОМНАТЫ ЦЕЛИКОМ ----------
  // Просьба пользователя: «кнопку 🧭, чтобы за неё перетаскивать комнаты — при изменении
  // размеров бывает уменьшает/увеличивает не в ту сторону». Правка размеров числом всегда
  // тянет от одного угла, поэтому «сдвинуть готовую комнату» и «поправить размер» — разные
  // задачи, и вторая не заменяет первую.
  // ЧТО ЕДЕТ ВМЕСТЕ С КОМНАТОЙ: настенные точки и проёмы (wallId+offset) и лента едут САМИ
  // — их мировая позиция считается ОТ точек комнаты, трогать их не нужно (и нельзя: сдвинув
  // их отдельно, мы бы сдвинули их дважды). Руками переносим только то, что живёт в
  // АБСОЛЮТНЫХ координатах и физически находится внутри контура: свободные точки
  // (свет/ТП/распайка/вывод — params.x/y), щиты, балки/перегородки и пустоты (обе точки/
  // оба угла внутри). Магистрали (p.guides) НЕ трогаем: это осевые линии коридоров, они
  // рисуются по всей квартире и к одной комнате не привязаны.
  function roomAttached(p, room) {
    const inside = (q) => q && G().pointInPolygon(q, room.points || []);
    const els = (p.elements || []).filter((el) => !el.wallId && el.params && el.params.x != null && inside({ x: el.params.x, y: el.params.y }));
    const panels = (p.panels || []).filter((pn) => inside({ x: pn.x, y: pn.y }));
    const beams = (p.beams || []).filter((bm) => inside(bm.a) && inside(bm.b));
    const voids = (p.voids || []).filter((vd) => inside(vd.a) && inside(vd.b));
    return { els, panels, beams, voids };
  }
  // снимок исходных координат — двигаем ОТ него на суммарный сдвиг (без накопления
  // погрешности от пошаговых мутаций) и на нём же считаем магнит углов
  function roomMoveSnapshot(p, room) {
    const at = roomAttached(p, room);
    return {
      room, at,
      pts: (room.points || []).map((q) => ({ x: q.x, y: q.y })),
      els: at.els.map((el) => ({ x: el.params.x, y: el.params.y })),
      panels: at.panels.map((pn) => ({ x: pn.x, y: pn.y })),
      beams: at.beams.map((bm) => ({ a: { x: bm.a.x, y: bm.a.y }, b: { x: bm.b.x, y: bm.b.y } })),
      voids: at.voids.map((vd) => ({ a: { x: vd.a.x, y: vd.a.y }, b: { x: vd.b.x, y: vd.b.y } }))
    };
  }
  function applyRoomMove(snap, dx, dy) {
    const { room, at } = snap;
    (room.points || []).forEach((q, i) => { q.x = snap.pts[i].x + dx; q.y = snap.pts[i].y + dy; });
    at.els.forEach((el, i) => { el.params.x = snap.els[i].x + dx; el.params.y = snap.els[i].y + dy; });
    at.panels.forEach((pn, i) => { pn.x = snap.panels[i].x + dx; pn.y = snap.panels[i].y + dy; });
    at.beams.forEach((bm, i) => {
      bm.a = { x: snap.beams[i].a.x + dx, y: snap.beams[i].a.y + dy };
      bm.b = { x: snap.beams[i].b.x + dx, y: snap.beams[i].b.y + dy };
    });
    at.voids.forEach((vd, i) => {
      vd.a = { x: snap.voids[i].a.x + dx, y: snap.voids[i].a.y + dy };
      vd.b = { x: snap.voids[i].b.x + dx, y: snap.voids[i].b.y + dy };
    });
  }
  // сдвиг по сетке + МАГНИТ: если после сдвига какой-то угол комнаты оказался в пределах
  // CFG.cornerSnapCm от угла ДРУГОЙ комнаты — доводим ровно на него (тот же порог и та же
  // идея, что у snapSmart при рисовании: стены соседних помещений не должны расходиться на
  // считанные сантиметры — именно из-за таких расхождений трассы потом идут «по стене»)
  function snapRoomMove(p, snap, dx, dy) {
    const step = (p.settings && p.settings.gridStep) || 10;
    let d = { x: Math.round(dx / step) * step, y: Math.round(dy / step) * step };
    const others = [];
    (G().floorScoped(p).rooms || []).forEach((r) => { if (r.id !== snap.room.id) (r.points || []).forEach((q) => others.push(q)); });
    let best = null;
    snap.pts.forEach((q0) => {
      const moved = { x: q0.x + d.x, y: q0.y + d.y };
      others.forEach((o) => {
        const dd = G().dist(o, moved);
        if (dd <= CFG.cornerSnapCm && (!best || dd < best.dd)) best = { dd, ox: o.x - moved.x, oy: o.y - moved.y };
      });
    });
    if (best) { d.x += best.ox; d.y += best.oy; return d; }
    // Магнит ГРАНЕЙ (не только углов): у комнат разного размера углы не совпадают, и
    // старый магнит «угол к углу» не срабатывал — комната вставала со щелью или
    // наползанием на пару сантиметров. Из-за таких расхождений трассы потом идут «по
    // стене» (реальный случай: две комнаты разъехались ровно на 20 см). Поэтому, если
    // угол ни к чему не прилип, доводим по ОСИ: ищем ближайшую вертикальную грань чужой
    // комнаты к вертикальной грани нашей (совпадение по x) и то же по y — независимо,
    // так что комната может прилипнуть сразу двумя сторонами (в угол).
    const xs = [], ys = [];
    (G().floorScoped(p).rooms || []).forEach((r) => {
      if (r.id === snap.room.id) return;
      (r.points || []).forEach((q) => { xs.push(q.x); ys.push(q.y); });
    });
    const axis = (vals, cur, get) => {
      let bx = null;
      snap.pts.forEach((q0) => {
        const v = get(q0) + cur;
        vals.forEach((o) => { const dd = Math.abs(o - v); if (dd <= CFG.cornerSnapCm && (!bx || dd < bx.dd)) bx = { dd, off: o - v }; });
      });
      return bx ? bx.off : 0;
    };
    d.x += axis(xs, d.x, (q) => q.x);
    d.y += axis(ys, d.y, (q) => q.y);
    return d;
  }
  // публичный перенос на заданный сдвиг (стрелки в шторке + тесты): одна транзакция
  // commit → мутация → persist("room-move"), т.е. отменяется одним ↶
  function moveRoom(roomId, dx, dy, opts) {
    const c = core(), p = c.project;
    const room = p && (p.rooms || []).find((r) => r.id === roomId);
    if (!room) return null;
    const snap = roomMoveSnapshot(p, room);
    const d = (opts && opts.raw) ? { x: dx, y: dy } : snapRoomMove(p, snap, dx, dy);
    if (!d.x && !d.y) return { x: 0, y: 0 };
    c.commit();
    applyRoomMove(snap, d.x, d.y);
    c.persist("room-move");
    renderScene();
    return d;
  }
  function onMoveRoomTap(p, w) {
    const room = G().roomAt(p, w);
    if (!room) { toast(T.mvTapRoom); return; }
    if (R.selectedRoomId !== room.id) R.mvLast = null; // другая комната — счётчик сдвига с нуля
    R.selectedRoomId = room.id;
    sheetMoveRoom(room);
  }
  function sheetMoveRoom(room, opts) {
    const p = core().project;
    openSheet(`<div class="ep-plan-srow"><b>${T.mvTitle}</b> · ${esc(room.name)} · ${G().fmtArea(G().roomNetArea(p, room))}${R.mvLast ? ` · <span class="ep-plan-dim">${T.mvMoved(R.mvLast.x, R.mvLast.y)}</span>` : ""}</div>
      <div class="ep-plan-modehint">${T.mvHint}</div>
      <div class="ep-plan-srow ep-plan-sbtns">
        <button type="button" class="ep-plan-tbtn ep-clickable" data-pr-mvnudge="l" aria-label="Влево">←</button>
        <button type="button" class="ep-plan-tbtn ep-clickable" data-pr-mvnudge="u" aria-label="Вверх">↑</button>
        <button type="button" class="ep-plan-tbtn ep-clickable" data-pr-mvnudge="d" aria-label="Вниз">↓</button>
        <button type="button" class="ep-plan-tbtn ep-clickable" data-pr-mvnudge="r" aria-label="Вправо">→</button>
        <span class="ep-plan-flex"></span>
        <button type="button" class="ep-plan-tbtn ep-clickable" data-pr-mvdone>${T.mvDone}</button>
      </div>`);
    enableWholeRoomDrag();
    renderScene();
    // после ТЯГИ вид не дёргаем (пользователь только что сам выбрал, куда смотреть) —
    // подтягиваем комнату из-под шторки только при первом открытии по тапу
    if (!(opts && opts.keepView)) ensureVisibleAboveSheet(G().centroid(room.points || []));
  }
  // тяга ВСЕЙ комнаты пальцем. Жест начинается ТОЛЬКО внутри выбранной комнаты — иначе
  // return false и жест остаётся панорамой (тот же veto-паттерн, что у балки/пустоты).
  // ИМЯ ОБЯЗАНО отличаться от enableRoomDrag(roomId) ниже (тяга УГЛОВ/СТЕН комнаты из
  // sheetRoom): объявления функций поднимаются, и одноимённая НИЖЕ молча перекрывает
  // верхнюю — режим 🧭 внешне работал (шторка открывалась), но тяга вызывала чужой
  // обработчик с roomId=undefined и комната не двигалась (поймано живым прогоном).
  function enableWholeRoomDrag() {
    if (!R.canvas) return;
    let snap = null, acc = null;
    R.canvas.setDragHandler((dx, dy, phase, start) => {
      const c = core(), p = c.project;
      const room = p && (p.rooms || []).find((r) => r.id === R.selectedRoomId);
      if (!room) return false;
      if (phase === "start") {
        if (!G().pointInPolygon(start, room.points || [])) return false; // мимо комнаты — пан
        snap = roomMoveSnapshot(p, room); acc = { x: 0, y: 0 };
        c.commit();
        return;
      }
      if (!snap) return;
      if (phase === "move") {
        acc.x += dx; acc.y += dy;
        applyRoomMove(snap, acc.x, acc.y); // от ИСХОДНОГО положения — без накопления дрейфа
        renderSceneSoon();
      } else if (phase === "end") {
        const d = snapRoomMove(p, snap, acc.x, acc.y);
        applyRoomMove(snap, d.x, d.y);
        c.persist("room-move");
        snap = null; acc = null;
        R.mvLast = d;
        // ВАЖНО: НЕ toast — он бы затёр панель со стрелками (шторка одна на модуль) и
        // через 1.8с закрыл её совсем; вместо этого перерисовываем ту же шторку, показав
        // сдвиг в её шапке (поймано живым прогоном: после тяги стрелки исчезали)
        sheetMoveRoom(room, { keepView: true });
      }
    });
  }

  // Тяга ПРОЁМА (двери/окна) пальцем ПО ПЛАНУ — просьба пользователя: «дверные проёмы и
  // окна хотелось бы двигать по оси икс и игрик». Раньше проём на плане только тапался
  // (открывался редактор), двигать его можно было ЧИСЛОМ в поле «Отступ» или пальцем, но
  // ТОЛЬКО в развёртке стены. Проём физически живёт НА стене, поэтому «свободные X/Y»
  // реализованы как «палец ведёт куда угодно, проём садится на ближайшую стену»: пока
  // палец у своей стены — едет offset вдоль неё (для горизонтальной стены это ось X, для
  // вертикальной — Y), а если довести до ДРУГОЙ стены (в т.ч. соседней комнаты или
  // перегородки), проём перевешивается на неё целиком (wallId+offset+flip). Тот же
  // veto-паттерн, что у балки/комнаты: жест, начатый НЕ на проёме, остаётся панорамой.
  function enableOpeningDrag(openingId) {
    if (!R.canvas) return;
    let cur = null;
    R.canvas.setDragHandler((dx, dy, phase, start) => {
      const c = core(), p = c.project;
      const op = p && (p.openings || []).find((o) => o.id === openingId);
      if (!op || !EP.Plan.Elements) return false;
      const EL = EP.Plan.Elements, k = R.canvas.cmPerPx();
      if (phase === "start") {
        // тот же хит-тест, что и у тапа (по видимой геометрии проёма) — если палец начал
        // жест не на проёме, отдаём жест панораме
        const hit = EL.hitAt(start, EL.CFG.hitPx * k);
        if (!hit || !hit.opening || hit.opening.id !== op.id) return false;
        cur = { x: start.x, y: start.y };
        c.commit();
        return;
      }
      if (!cur) return;
      cur.x += dx; cur.y += dy;
      const snapPx = (EL.CFG.wallSnapPx || 26) * k;
      const hitW = G().wallAt(p, cur, snapPx);
      if (hitW) {
        const wl = hitW.wall;
        if (wl.id !== op.wallId) {
          op.wallId = wl.id;
          // створка/откосы считаются от центроида комнаты-владельца — на новой стене
          // сторона другая, пересчитываем (иначе дверь открывалась бы наружу)
          const fl = EL.openingFlipFor && EL.openingFlipFor(p, wl);
          if (fl) op.flip = fl;
        }
        const maxOff = Math.max(0, wl.len - op.width);
        op.offset = Math.round(Math.max(0, Math.min(maxOff, hitW.offset - op.width / 2)));
      }
      // палец вне зоны любой стены — проём просто остаётся там, где был (не отвязываем
      // его от стены: проёма «в воздухе» в модели не существует)
      if (phase === "move") renderSceneSoon();
      else if (phase === "end") {
        cur = null;
        c.persist("opening-move"); // в AUTOREBUILD_ON — построенные трассы пересчитаются
        renderScene();
        // перерисовываем редактор (поля «Отступ»/стена устарели после тяги), но БЕЗ
        // наджима камеры — пользователь только что сам выбрал, куда смотреть
        if (EL.openOpeningEditor) EL.openOpeningEditor(op, { keepView: true });
      }
    });
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
        <button type="button" class="ep-plan-tbtn ep-clickable" data-pr-unfold="${esc(room.id)}">📐 ${T.unfoldBtn}</button>
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
    (G().floorScoped(p).beams || []).forEach((bm) => {
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
    return (G().floorScoped(p).voids || []).find((vd) => {
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
    if (R.selectedRoute !== rt.id) R.routeDragMode = "point"; // новая трасса выбрана — сброс режима тяги на дефолт
    openSheet(`<div class="ep-plan-srow"><b>${T.routeTitle}</b>${circ ? ` · ${esc(circ.name)}` : ""} · ${G().fmtLen(len)}${rt.manual ? ` <span class="ep-plan-mshint">${T.routeManual}</span>` : ""}</div>
      <div class="ep-plan-modehint">${R.routeDragMode === "segment" ? T.routeHintSeg : T.routeHintPoint}</div>
      <div class="ep-plan-srow ep-plan-sbtns">
        <button type="button" class="ep-plan-chip ep-clickable ${R.routeDragMode !== "segment" ? "on" : ""}" data-prt2-mode="point">${T.routeModePoint}</button>
        <button type="button" class="ep-plan-chip ep-clickable ${R.routeDragMode === "segment" ? "on" : ""}" data-prt2-mode="segment">${T.routeModeSegment}</button>
      </div>
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
    if (EP.Plan.Routes.recomputeThroughWalls) EP.Plan.Routes.recomputeThroughWalls(c.project, rt);
    c.persist("route-flip");
    R.selectedRouteTap = flipped;
    sheetRoute(rt, flipped);
  }
  // Тяга трассы — режим ВЫБИРАЕТСЯ ЯВНО кнопками в шторке (R.routeDragMode,
  // чипы «✏️ Ломать»/«↔ Двигать» в sheetRoute), а НЕ жестами (двойной тап/долгое
  // нажатие) — просьба пользователя: «лучше кнопку перетаскивания сделать, вместо
  // кликабельности... одна ломает линию и перетаскивает, а вторая... от угла до
  // угла отрезок носит». Раньше режим определялся жестом (двойной тап/долгое
  // нажатие вооружали segDrag) — конфликтовало с зумом по двойному тапу и было
  // неочевидно; теперь ЛЮБАЯ тяга по уже выбранной трассе идёт в режиме,
  // подсвеченном в шторке, без угадывания жеста.
  //  • routeDragMode="point" (дефолт): существующий излом (не концевые — те
  //    завязаны на позицию элемента/щита/распайки) двигаем; середина прямого
  //    участка — вставляем новый излом и тянем его в 2D. Мимо — жест остаётся
  //    паном (return false из "start").
  //  • routeDragMode="segment": хватаем ЦЕЛЫЙ прямой участок (сегмент между двумя
  //    изломами) и двигаем его как жёсткий отрезок ПЕРПЕНДИКУЛЯРНО себе — обе
  //    концевые точки сегмента едут на одинаковый перпендикулярный сдвиг, а
  //    соседние (перпендикулярные) сегменты просто удлиняются/укорачиваются, сохраняя
  //    прямые углы. Если участок упирается в КОНЦЕВУЮ точку трассы (анкер элемента/щита) —
  //    у неё вставляем короткий коннектор (копию анкера), чтобы сам анкер не двигать, а
  //    участок всё равно ехал прямым (полоса «до первого поворота», а где поворота нет —
  //    до анкера через новый коннектор). segDrag хранит индексы концов участка и нормаль.
  function enableRouteDrag() {
    if (!R.canvas) return;
    let grabbed = -1, segDrag = null;
    R.canvas.setDragHandler((dx, dy, phase, start) => {
      const c = core(), rt = (c.project.routes || []).find((r) => r.id === R.selectedRoute);
      if (!rt || !rt.points) return false;
      if (phase === "start") {
        const k = R.canvas.cmPerPx();
        const rr = Math.max(18 * k, 14);
        // ---- режим «Двигать» (R.routeDragMode==="segment"): тянем целый прямой участок ----
        if (R.routeDragMode === "segment") {
          let segI = -1, segD = rr;
          for (let i = 0; i < rt.points.length - 1; i++) {
            const cl = G().closestOnSeg(start, rt.points[i], rt.points[i + 1]);
            if (cl.d <= segD) { segD = cl.d; segI = i; }
          }
          if (segI < 0) return false; // мимо — пан
          core().commit();
          let a = segI, b = segI + 1;
          // концевую точку (анкер) не двигаем — вставляем у неё коннектор-копию
          if (a === 0) { rt.points.splice(1, 0, { x: rt.points[0].x, y: rt.points[0].y }); a = 1; b = 2; }
          if (b === rt.points.length - 1) { rt.points.splice(b, 0, { x: rt.points[b].x, y: rt.points[b].y }); }
          const A = rt.points[a], B = rt.points[b];
          let sx = B.x - A.x, sy = B.y - A.y; const L = Math.hypot(sx, sy) || 1;
          segDrag = { a, b, nx: -sy / L, ny: sx / L }; // нормаль к участку
          grabbed = -2;
          return;
        }
        // ---- режим «Ломать» (дефолт): излом или вставка излома ----
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
      if (phase === "move" && grabbed === -2 && segDrag) {
        // проекция сдвига пальца на нормаль участка — обе концевые точки едут одинаково
        const pn = segDrag.nx * dx + segDrag.ny * dy;
        const A = rt.points[segDrag.a], B = rt.points[segDrag.b];
        A.x += segDrag.nx * pn; A.y += segDrag.ny * pn;
        B.x += segDrag.nx * pn; B.y += segDrag.ny * pn;
        renderSceneSoon();
      } else if (phase === "move" && grabbed >= 0) {
        rt.points[grabbed] = { x: rt.points[grabbed].x + dx, y: rt.points[grabbed].y + dy };
        renderSceneSoon();
      } else if (phase === "end" && grabbed === -2 && segDrag) {
        const step = c.project.settings.gridStep || 10;
        [segDrag.a, segDrag.b].forEach((idx) => {
          const q = rt.points[idx];
          rt.points[idx] = { x: G().snap(q.x, step), y: G().snap(q.y, step) };
        });
        rt.manual = true;
        if (EP.Plan.Routes.recomputeThroughWalls) EP.Plan.Routes.recomputeThroughWalls(c.project, rt);
        R.selectedRouteTap = rt.points[segDrag.a];
        c.persist("route-dragseg"); grabbed = -1; segDrag = null; renderScene();
      } else if (phase === "end" && grabbed >= 0) {
        const step = c.project.settings.gridStep || 10;
        const oj = G().orthoJoint(rt.points[grabbed - 1], rt.points[grabbed], rt.points[grabbed + 1]);
        rt.points[grabbed] = {
          x: oj.lockedX ? oj.x : G().snap(oj.x, step),
          y: oj.lockedY ? oj.y : G().snap(oj.y, step)
        };
        rt.manual = true;
        if (EP.Plan.Routes.recomputeThroughWalls) EP.Plan.Routes.recomputeThroughWalls(c.project, rt);
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
    openSheet(`<div class="ep-plan-srow"><b>${T.layersTitle}</b>
        <span class="ep-plan-flex"></span><button type="button" class="ep-plan-mini ep-clickable" data-sheet-fs aria-label="${T.sheetFs}">⛶</button></div>
      <div class="ep-plan-layers">${p.layers.map((l) => `
        <label class="ep-plan-chk"><input type="checkbox" data-pr-layer="${esc(l.id)}" ${l.visible !== false ? "checked" : ""}>
        <i class="ep-plan-dot" style="background:${esc(l.color)}"></i> ${esc(l.name)}</label>`).join("")}</div>
      <div class="ep-plan-srow">Значки:
        <button type="button" class="ep-plan-chip ep-clickable ${st === "simple" ? "on" : ""}" data-pr-symst="simple">Простые</button>
        <button type="button" class="ep-plan-chip ep-clickable ${st === "gost" ? "on" : ""}" data-pr-symst="gost">ГОСТ</button>
        <button type="button" class="ep-plan-chip ep-clickable ${st === "design" ? "on" : ""}" data-pr-symst="design">Дизайн</button>
      </div>
      <div class="ep-plan-srow ep-plan-sbtns">
        <button type="button" class="ep-plan-tbtn ep-clickable" data-pr-legend>📋 ${T.legendTitle}</button>
        <button type="button" class="btn btn-ghost ep-clickable" data-pr-cancel>${T.close}</button>
      </div>`);
  }

  // живая легенда «Условные обозначения» — те же типы точек, что использованы в проекте,
  // с подсчётом штук (переиспользует EP.Plan.Export.counts). В отличие от легенды в PDF
  // (чёрные ГОСТ-значки для печати) — здесь значок цветной, по цвету СЛОЯ (легенда
  // группируется по ТИПУ прибора, а не по линии QF), чтобы читалось на тёмной шторке.
  function sheetLegend() {
    const p = core().project; if (!p) return;
    const TY = (EP.Plan.Elements && EP.Plan.Elements.TYPES) || {};
    const layerColor = (lid) => ((p.layers || []).find((l) => l.id === lid) || {}).color || "#94a3b8";
    const rows = (EP.Plan.Export && EP.Plan.Export.counts) ? EP.Plan.Export.counts(p) : [];
    const line = (glyph, color, name, qty) =>
      `<div class="ep-leg-row"><span class="ep-leg-ic" style="background:${esc(color)}">${esc(glyph)}</span>` +
      `<span class="ep-leg-name">${esc(name)}</span><span class="ep-leg-qty">${qty != null ? qty + " шт." : ""}</span></div>`;
    let html = rows.map((c) => line(c.glyph, layerColor((TY[c.k] || {}).layer), c.name, c.qty)).join("");
    // проёмы/щиты/лента живут не в p.elements — добавляем отдельно
    const doorN = (p.openings || []).filter((o) => o.type === "door").length;
    if (doorN) html += line("Дв", "#94a3b8", "Дверь / проём", doorN);
    const winN = (p.openings || []).filter((o) => o.type === "window").length;
    if (winN) html += line("Ок", "#94a3b8", "Окно", winN);
    if ((p.panels || []).length) html += line("Щ", layerColor("power"), "Щит", (p.panels || []).length);
    if ((p.ledStrips || []).length) html += line("LED", layerColor("light"), "Светодиодная лента", (p.ledStrips || []).length);
    if (!html) html = `<div class="ep-plan-modehint">${T.legendEmpty}</div>`;
    openSheet(`<div class="ep-plan-srow"><b>📋 ${T.legendTitle}</b>
        <span class="ep-plan-flex"></span><button type="button" class="ep-plan-mini ep-clickable" data-sheet-fs aria-label="${T.sheetFs}">⛶</button>
        <button type="button" class="ep-plan-mini ep-clickable" data-pr-cancel>✕</button></div>
      <div class="ep-leg">${html}</div>`);
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

  /* ---------- ✂ Разрез комнаты на две ----------
     Обратная операция к 🔗 «Объединить». Обвёл квартиру одним контуром — режешь её
     перегородками: два тапа поперёк комнаты, и получаются две комнаты с ОБЩЕЙ стеной
     (обе используют один и тот же отрезок разреза, поэтому разойтись не могут).
     Точки/проёмы старой комнаты перевязываются на ту из новых, у чьей стены они
     физически стоят — тот же приём, что у mergeRooms (мировые позиции считаются ДО
     перестройки геометрии). Если точка/проём попали РОВНО на линию разреза, они
     достанутся комнате, к стене которой ближе, — терять привязку нельзя.
     opts.remnant: "beam"|"lintel" — поставить на месте разреза перегородку/перемычку
     (как у слияния); без него разрез — просто новая общая стена двух комнат. */
  function splitRoom(roomId, a, b, opts) {
    const c = core(), p = c.project;
    const room = (p.rooms || []).find((r) => r.id === roomId);
    if (!room) return null;
    const res = G().splitRoomPolygon(room.points, a, b);
    if (!res) { toast(T.splitFail); return null; }

    // мировые позиции точек/проёмов ДО перестройки
    const els = (p.elements || []).filter((el) => el.wallId && String(el.wallId).split(":")[0] === room.id);
    const ops = (p.openings || []).filter((op) => op.wallId && String(op.wallId).split(":")[0] === room.id);
    const elPos = els.map((el) => G().elemPoint(p, el));
    const opPos = ops.map((op) => { const ww = G().wallById(p, op.wallId); return ww ? G().pointAtOffset(ww, op.offset + op.width / 2) : null; });

    const mk = (pts, name) => {
      const r = c.model.newRoom(pts, name);
      r.material = room.material || null;
      r.height = room.height || null;
      if ((room.zones || []).indexOf("wet") >= 0) r.zones = ["wet"];
      return r;
    };
    const rA = mk(res.a, room.name);
    const rB = mk(res.b, (room.name || T.room) + " 2");
    const walls = G().walls(rA).map((ww) => ({ ww, room: rA })).concat(G().walls(rB).map((ww) => ({ ww, room: rB })));
    const findNearWall = (pos) => {
      if (!pos) return null;
      let best = null;
      walls.forEach((x) => { const cl = G().closestOnSeg(pos, x.ww.a, x.ww.b); if (cl.d < 5 && (!best || cl.d < best.cl.d)) best = { room: x.room, wall: x.ww, cl }; });
      return best;
    };
    for (let i = 0; i < elPos.length; i++) if (!findNearWall(elPos[i])) { toast(T.splitBlocked); return null; }
    for (let i = 0; i < opPos.length; i++) if (!findNearWall(opPos[i])) { toast(T.splitBlocked); return null; }

    c.commit();
    p.rooms = p.rooms.filter((r) => r.id !== room.id);
    p.rooms.push(rA, rB);
    els.forEach((el, i) => { const hit = findNearWall(elPos[i]); el.wallId = hit.room.id + ":" + hit.wall.i; el.offset = Math.round(hit.cl.t * hit.wall.len); });
    ops.forEach((op, i) => { const hit = findNearWall(opPos[i]); op.wallId = hit.room.id + ":" + hit.wall.i; op.offset = Math.max(0, Math.round(hit.cl.t * hit.wall.len - op.width / 2)); });
    if (opts && (opts.remnant === "beam" || opts.remnant === "lintel")) {
      const bm = c.model.newBeam(res.cut[0], res.cut[1]);
      bm.kind = opts.remnant;
      bm.width = Math.round(G().wallThOf(p, G().walls(rA)[0]) || p.settings.wallThickness || 10);
      p.beams.push(bm);
    }
    c.persist("room-split");
    return { a: rA, b: rB };
  }
  function splitPreview() {
    const sp = R.split;
    if (!sp || !sp.a) { R.draft = { points: [] }; renderScaled(); return; }
    R.draft.points = sp.b ? [sp.a, sp.b] : [sp.a];
    renderScaled();
  }
  function sheetSplit() {
    const sp = R.split;
    if (!sp || !sp.roomId) return;
    const p = core().project, room = (p.rooms || []).find((r) => r.id === sp.roomId);
    const res = (sp.a && sp.b && room) ? G().splitRoomPolygon(room.points, sp.a, sp.b) : null;
    const areas = res ? `${G().fmtArea(Math.abs(G().area(res.a)))} + ${G().fmtArea(Math.abs(G().area(res.b)))}` : "";
    openSheet(`<div class="ep-plan-srow"><b>✂ Разрез</b>${room ? " · " + esc(room.name) : ""}${areas ? " · " + areas : ""}</div>
      <div class="ep-plan-modehint">${sp.b ? "Разрез намечен. Что поставить на его месте?" : "Тапни на противоположной стене комнаты."}</div>
      ${sp.b ? `<div class="ep-plan-srow ep-plan-sbtns">
        <button type="button" class="btn btn-primary ep-clickable" data-pr-split-go="">${res ? "✓ Разрезать" : "✕ Так не выйдет"}</button>
        <button type="button" class="ep-plan-tbtn ep-clickable" data-pr-split-go="beam">＋ Перегородка</button>
        <button type="button" class="ep-plan-tbtn ep-clickable" data-pr-split-go="lintel">＋ Перемычка</button>
      </div>` : ""}
      <div class="ep-plan-srow ep-plan-sbtns">
        <button type="button" class="btn btn-ghost ep-clickable" data-pr-cancel>${T.cancel}</button>
      </div>`);
  }
  function splitGo(remnant) {
    const sp = R.split;
    if (!sp || !sp.a || !sp.b || !sp.roomId) return;
    const res = splitRoom(sp.roomId, sp.a, sp.b, remnant ? { remnant } : null);
    if (!res) return;
    R.split = null; R.draft = { points: [] };
    R.selectedRoomId = res.a.id;
    setMode("view"); sheetRoom(res.a);
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
    if (t.closest("[data-sheet-collapse]")) { toggleSheetCollapsed(); return; }
    if ((el = t.closest("[data-plan-mode]"))) {
      const m = el.getAttribute("data-plan-mode");
      if (m === "wall") { qbTrack("wall"); return sheetPickRoomForUnfold(); } // не режим — сразу список комнат
      return setMode(m);
    }
    if (t.closest("[data-qb-edit]")) return sheetQuickbar();
    if (t.closest("[data-qb-close]")) { closeSheet(); return; }
    if ((el = t.closest("[data-qb-pin]"))) {
      const id = el.getAttribute("data-qb-pin");
      const i = QB.pinned.indexOf(id);
      if (i === -1) QB.pinned.push(id); else QB.pinned.splice(i, 1);
      qbSave(); renderQuickbar(); sheetQuickbar();
      return;
    }
    if (t.closest("[data-qb-reset]")) { QB.mru = []; QB.pinned = ["view"]; qbSave(); renderQuickbar(); sheetQuickbar(); return; }
    if (t.closest("[data-plan-layers]")) return sheetLayers();
    // общая кнопка «во весь экран» шторки — используется ЛЮБЫМ модулем слоёв 2-6
    // (Расчёт/Трассы/Проверки/Слои и т.п.), поэтому обработчик один здесь, а не в каждом
    if (t.closest("[data-sheet-fs]")) return toggleSheetFullscreen();
    if (t.closest("[data-plan-fit]")) { if (R.canvas) R.canvas.fit(G().projectBBox(core().project)); return; }
    if (t.closest("[data-pr-cancel]")) { setMode(R.mode === "underlay" ? "view" : R.mode); return; }
    if (t.closest("[data-pr-create-rect]")) return createRect();
    if (t.closest("[data-pr-create-rect2]")) return createRectFromPoint();
    if (t.closest("[data-pr-attach-go]")) return attachGo();
    if ((el = t.closest("[data-pr-split-go]"))) return splitGo(el.getAttribute("data-pr-split-go"));
    if (t.closest("[data-pr-aflip]")) { if (R.attach) { attachRead(); R.attach.flip = !R.attach.flip; attachPreview(); sheetAttach(); } return; }
    if ((el = t.closest("[data-pr-rdir]"))) { R.rectDir = el.getAttribute("data-pr-rdir"); rectPreview(); sheetRectFromPoint(); return; }
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
    if (t.closest("[data-pr-legend]")) return sheetLegend();
    if ((el = t.closest("[data-pr-mat]"))) {
      const c = core(), room = c.project.rooms.find((r) => r.id === R.selectedRoomId);
      if (room) { c.commit(); room.material = el.getAttribute("data-pr-mat"); c.persist("room-mat"); sheetRoom(room); }
      return;
    }
    if ((el = t.closest("[data-pr-apply]"))) return applyRoom(el.getAttribute("data-pr-apply"));
    if ((el = t.closest("[data-pr-unfold]"))) {
      const rid = el.getAttribute("data-pr-unfold");
      const room2 = (core().project.rooms || []).find((r) => r.id === rid);
      if (room2 && EP.Plan.Unfold) EP.Plan.Unfold.open(rid + ":0", true);
      return;
    }
    if ((el = t.closest("[data-pr-pickunfold]"))) {
      const rid = el.getAttribute("data-pr-pickunfold");
      closeSheet();
      if (EP.Plan.Unfold) EP.Plan.Unfold.open(rid + ":0", true);
      return;
    }
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
    if ((el = t.closest("[data-pr-mvnudge]"))) {
      const p = core().project, step = (p.settings && p.settings.gridStep) || 10;
      const dir = el.getAttribute("data-pr-mvnudge");
      const d = { l: [-step, 0], r: [step, 0], u: [0, -step], d: [0, step] }[dir] || [0, 0];
      const dd = moveRoom(R.selectedRoomId, d[0], d[1], { raw: true }); // стрелка = ровно шаг сетки, без магнита
      const room = (p.rooms || []).find((r) => r.id === R.selectedRoomId);
      if (dd && room) { R.mvLast = { x: (R.mvLast ? R.mvLast.x : 0) + dd.x, y: (R.mvLast ? R.mvLast.y : 0) + dd.y }; sheetMoveRoom(room, { keepView: true }); }
      return;
    }
    if (t.closest("[data-pr-mvdone]")) { R.selectedRoomId = null; R.mvLast = null; closeSheet(); if (R.canvas) R.canvas.setDragHandler(null); renderScene(); return; }
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
    if (t.closest("[data-pg-done]")) { finishGuide(); return; }
    if (t.closest("[data-pg-undo]")) { R.guideDraft.points.pop(); renderScaled(); sheetGuide(); return; }
    if (t.closest("[data-pg-clear]")) {
      const c = core(), p = c.project;
      c.commit();
      const fid0 = p.floors && p.floors[0] && p.floors[0].id;
      const activeF = p.activeFloorId || fid0;
      p.guides = (p.guides || []).filter((gd) => (gd.floorId || fid0) !== activeF); // только активный этаж
      c.persist("guide-del");
      R.guideDraft = { points: [] };
      sheetGuide(); renderScene(); return;
    }
    if (t.closest("[data-pg-close]")) { setMode("view"); return; }
    if ((el = t.closest("[data-prt2-mode]"))) {
      const c = core(), rt = (c.project.routes || []).find((r) => r.id === R.selectedRoute);
      R.routeDragMode = el.getAttribute("data-prt2-mode") === "segment" ? "segment" : "point";
      if (rt) sheetRoute(rt, R.selectedRouteTap); // перерисовать шторку с новым активным чипом+подсказкой
      return;
    }
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
    if ((e.target.id === "ep-pr-w" || e.target.id === "ep-pr-h") && R.rectAnchor) { rectPreview(); return; }
    if ((e.target.id === "ep-pr-aw" || e.target.id === "ep-pr-ah") && R.attach) { attachRead(); attachPreview(); return; }
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
    if (canvas.onDblTap) canvas.onDblTap(onDoubleTap);
    canvas.onViewChanged(onViewChanged);
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
    openSheet, closeSheet, toast, ensureVisibleAboveSheet, toggleSheetFullscreen,
    collapseSheet, expandSheet, toggleSheetCollapsed, placeSheetBtn, enableOpeningDrag,
    isActive: () => R.active,
    currentMode: () => R.mode,
    selectedBeamId: () => R.selectedBeam || null,
    selectedVoidId: () => R.selectedVoid || null,
    selectedRouteId: () => R.selectedRoute || null,
    soloCircuitId: () => R.soloCircuit || null,
    setSoloCircuit, clearSolo,
    canvasCmPerPx: () => (R.canvas ? R.canvas.cmPerPx() : 1),
    // для plan-furniture.js: своего доступа к канвасу у модулей слоёв нет (инвариант —
    // вся drag-инфраструктура живёт в plan-rooms.js), поэтому тягу мебели ставим через
    // этот тонкий проброс, а сам обработчик (что двигать) остаётся в модуле мебели
    canvasSetDrag: (fn) => { if (R.canvas) R.canvas.setDragHandler(fn || null); },
    renderSceneSoon,
    mergeRooms, splitRoom, moveRoom, syncQuickbarVisibility, armTargetPick
  };
})();
