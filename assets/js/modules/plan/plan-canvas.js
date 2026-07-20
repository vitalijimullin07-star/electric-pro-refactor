/* Electric Pro V29 — Проект квартиры: SVG-холст (Слой 0).
   Мировые координаты — сантиметры (viewBox в см). Пинч — зум, палец/мышь — пан,
   колесо — зум. Адаптивная сетка. Тап (короткое касание) — событие для след. слоёв. */
(() => {
  "use strict";
  window.EP = window.EP || {};
  const NS = "http://www.w3.org/2000/svg";

  const CFG = {
    startView: { x: -320, y: -220, w: 640, h: 440 }, // старт: ~6.4×4.4 м вокруг нуля
    minSpanCm: 60,       // максимальный зум: 60 см на ширину экрана
    maxSpanCm: 20000,    // минимальный зум: 200 м
    gridSteps: [5, 10, 25, 50, 100, 250, 500, 1000], // см
    gridMinPx: 26,       // не рисуем сетку чаще, чем раз в 26px
    gridMajorEvery: 100, // жирная линия каждый метр
    tapMaxPx: 9, tapMaxMs: 450, dragStartPx: 6,
    dblTapMs: 300, dblTapPx: 34, dblTapZoomK: 1 / 1.6, // двойной тап — зум ×1.6 к точке касания
    longPressMs: 550 // держим палец на месте дольше — быстрое меню объекта
  };

  function el(tag, attrs) {
    const n = document.createElementNS(NS, tag);
    if (attrs) for (const k in attrs) n.setAttribute(k, attrs[k]);
    return n;
  }

  function createCanvas(host) {
    const svg = el("svg", { class: "ep-plan-svg" });
    svg.style.touchAction = "none";
    const layers = {
      grid: el("g", { "data-l": "grid" }),
      underlay: el("g", { "data-l": "underlay" }),
      rooms: el("g", { "data-l": "rooms" }),
      routes: el("g", { "data-l": "routes" }),
      elements: el("g", { "data-l": "elements" }),
      overlay: el("g", { "data-l": "overlay" })
    };
    Object.values(layers).forEach((g) => svg.appendChild(g));
    host.appendChild(svg);

    const view = { ...CFG.startView };
    const cb = { tap: null, viewChanged: null, hover: null, hoverEnd: null, longPress: null };

    function clampView() {
      if (view.w < CFG.minSpanCm) scaleTo(CFG.minSpanCm);
      if (view.w > CFG.maxSpanCm) scaleTo(CFG.maxSpanCm);
    }
    function scaleTo(w) {
      const cx = view.x + view.w / 2, cy = view.y + view.h / 2, k = w / view.w;
      view.w = w; view.h *= k;
      view.x = cx - view.w / 2; view.y = cy - view.h / 2;
    }
    function apply() {
      svg.setAttribute("viewBox", view.x + " " + view.y + " " + view.w + " " + view.h);
      drawGrid();
      if (cb.viewChanged) cb.viewChanged({ ...view });
    }
    function pxToCm() { return view.w / Math.max(1, svg.clientWidth); }
    function toWorld(clientX, clientY) {
      const r = svg.getBoundingClientRect();
      return { x: view.x + (clientX - r.left) * (view.w / r.width), y: view.y + (clientY - r.top) * (view.h / r.height) };
    }

    // ---------- сетка (адаптивный шаг) ----------
    function drawGrid() {
      const g = layers.grid;
      while (g.firstChild) g.removeChild(g.firstChild);
      const px = pxToCm();
      let step = CFG.gridSteps[CFG.gridSteps.length - 1];
      for (const s of CFG.gridSteps) { if (s / px >= CFG.gridMinPx) { step = s; break; } }
      const x0 = Math.floor(view.x / step) * step, x1 = view.x + view.w;
      const y0 = Math.floor(view.y / step) * step, y1 = view.y + view.h;
      const sw = px; // ~1px в мировых единицах
      for (let x = x0; x <= x1; x += step) {
        const major = x % CFG.gridMajorEvery === 0;
        g.appendChild(el("line", { x1: x, y1: view.y, x2: x, y2: y1, class: major ? "ep-plan-grid-major" : "ep-plan-grid-line", "stroke-width": sw * (major ? 1.4 : 1) }));
      }
      for (let y = y0; y <= y1; y += step) {
        const major = y % CFG.gridMajorEvery === 0;
        g.appendChild(el("line", { x1: view.x, y1: y, x2: x1, y2: y, class: major ? "ep-plan-grid-major" : "ep-plan-grid-line", "stroke-width": sw * (major ? 1.4 : 1) }));
      }
      // оси координат (начало — точка отсчёта квартиры)
      g.appendChild(el("line", { x1: 0, y1: view.y, x2: 0, y2: y1, class: "ep-plan-grid-axis", "stroke-width": sw * 1.6 }));
      g.appendChild(el("line", { x1: view.x, y1: 0, x2: x1, y2: 0, class: "ep-plan-grid-axis", "stroke-width": sw * 1.6 }));
    }

    // ---------- указатели: пан / пинч / тап ----------
    const pts = new Map(); // pointerId -> {x,y}
    let pinch = null;      // { dist, cx, cy } на старте пинча
    // пользователь САМ зумил/панорамировал (колесо/пинч/пан пальцем) — отложенные
    // авто-вписывания (fitToProject-таймеры в plan-mount.js) больше не должны
    // перебивать его вид (иначе «вид отпрыгивает» через ~секунду после открытия,
    // если начать зумить сразу — пойман визуальным тестом на моём же авто-refit'e)
    let userAdjusted = false;
    let tapStart = null;   // { x, y, t, id }
    let dragHandler = null, dragMoved = false; // перехват одиночного перетаскивания (подложка/элементы)
    let dragVeto = false; // хендлер вернул false на "start" — жест остаётся панорамой
    // стилус (S Pen / Apple Pencil): пока он рядом с экраном — касания ладони игнорируем.
    // Взводим уже на ХОВЕРЕ (перо репортит pointermove с pointerType="pen" ДО касания) —
    // иначе ладонь успевает лечь на экран за 100-300мс до касания пером и словить жест
    // раньше него. Снимаем не сразу на отрыве, а с задержкой после ухода зоны ховера
    // (pointerleave) — между мазками перо часто приподнимается, но остаётся рядом.
    let penActive = false;
    let penDisarmTimer = null;
    function armPen() { penActive = true; if (penDisarmTimer) { clearTimeout(penDisarmTimer); penDisarmTimer = null; } }
    function disarmPenSoon() {
      if (penDisarmTimer) clearTimeout(penDisarmTimer);
      penDisarmTimer = setTimeout(() => { penActive = false; penDisarmTimer = null; }, 500);
    }

    function dist2(a, b) { const dx = a.x - b.x, dy = a.y - b.y; return Math.hypot(dx, dy); }
    function pinchInfo() {
      const [a, b] = [...pts.values()];
      return { dist: Math.max(10, dist2(a, b)), cx: (a.x + b.x) / 2, cy: (a.y + b.y) / 2 };
    }

    let downClient = null; // экранная точка начала одиночного жеста (для drag-старта)
    let lastTapInfo = null; // { x, y, t } — экранные координаты последнего одиночного тапа, для двойного
    let dblDown = false; // текущий pointerdown — ВТОРОЙ тап двойного (в окне dblTapMs/dblTapPx
    // от отпускания предыдущего одиночного тапа): прокидывается в dragHandler("start") пятым
    // аргументом {dbl}, чтобы «двойной тап + тяга» отличался от обычной тяги (плану нужно:
    // dbl → тянуть целый прямой участок трассы, обычная тяга → ломать и тянуть точку).
    let longPressTimer = null;
    function clearLongPress() { if (longPressTimer) { clearTimeout(longPressTimer); longPressTimer = null; } }
    svg.addEventListener("pointerdown", (e) => {
      if (e.pointerType === "pen") armPen();
      else if (e.pointerType === "touch" && penActive) return; // ладонь при работе стилусом
      svg.setPointerCapture(e.pointerId);
      pts.set(e.pointerId, { x: e.clientX, y: e.clientY });
      if (pts.size === 1) {
        downClient = { x: e.clientX, y: e.clientY };
        // этот down — второй тап двойного? (в окне dblTapMs/dblTapPx от прошлого одиночного)
        dblDown = !!(lastTapInfo && (Date.now() - lastTapInfo.t) <= CFG.dblTapMs &&
          Math.hypot(e.clientX - lastTapInfo.x, e.clientY - lastTapInfo.y) <= CFG.dblTapPx);
        // боковая кнопка пера (S Pen/Wacom, приходит как button=2) — всегда чистая
        // панорама этим же пером, без тапа/тяги под наконечником
        const barrelBtn = e.pointerType === "pen" && e.button === 2;
        dragVeto = barrelBtn;
        tapStart = barrelBtn ? null : { x: e.clientX, y: e.clientY, t: Date.now(), id: e.pointerId };
        clearLongPress();
        if (!barrelBtn && cb.longPress) {
          const pid = e.pointerId, cx = e.clientX, cy = e.clientY;
          longPressTimer = setTimeout(() => {
            longPressTimer = null;
            // палец всё ещё на месте, тяга не началась — длинное нажатие, а не тап/пан
            if (tapStart && tapStart.id === pid && !dragMoved) {
              cb.longPress(toWorld(cx, cy), { clientX: cx, clientY: cy, pointerId: pid });
              tapStart = null; // подавляем обычный тап на отпускании
            }
          }, CFG.longPressMs);
        }
      }
      if (pts.size === 2) { pinch = pinchInfo(); tapStart = null; clearLongPress(); }
    });
    svg.addEventListener("pointermove", (e) => {
      if (e.pointerType === "pen") armPen(); // в т.ч. ховер без касания — pts его не содержит
      // живой предпросмотр (снап-направляющие, прицел пера) — пока НЕ идёт активная
      // тяга/пинч этим указателем: чистый ховер пера (не в pts) или ещё не начатая тяга
      if (cb.hover && (!pts.has(e.pointerId) || (pts.size === 1 && !dragMoved))) cb.hover(toWorld(e.clientX, e.clientY), e);
      if (!pts.has(e.pointerId)) return;
      const prev = pts.get(e.pointerId);
      pts.set(e.pointerId, { x: e.clientX, y: e.clientY });
      if (pts.size === 2 && pinch) {
        userAdjusted = true;
        const cur = pinchInfo();
        const k = pinch.dist / cur.dist; // >1 — отдаление
        const wc = toWorld(cur.cx, cur.cy);
        view.w *= k; view.h *= k;
        clampView();
        const wc2 = toWorld(cur.cx, cur.cy);
        view.x += wc.x - wc2.x; view.y += wc.y - wc2.y;
        // доводим панораму за средней точкой
        view.x -= (cur.cx - pinch.cx) * pxToCm(); view.y -= (cur.cy - pinch.cy) * pxToCm();
        pinch = cur;
        apply();
      } else if (pts.size === 1) {
        const k = pxToCm();
        const dx = (e.clientX - prev.x) * k, dy = (e.clientY - prev.y) * k;
        if (dragHandler && !dragVeto) {
          if (!dragMoved) {
            // не начинаем тягу, пока смещение от точки касания не превысит порог —
            // лёгкое дрожание пальца при тапе по уже выбранному объекту иначе создаёт
            // мусорный микро-шаг в истории отмены (commit() на "start" уже необратим)
            if (downClient && Math.hypot(e.clientX - downClient.x, e.clientY - downClient.y) < CFG.dragStartPx) return;
            // хендлер может отказаться (вернуть false) — тогда жест панорамирует
            const res = dragHandler(0, 0, "start", toWorld((downClient || e).x, (downClient || e).y), { dbl: dblDown });
            if (res === false) { dragVeto = true; userAdjusted = true; view.x -= dx; view.y -= dy; apply(); }
            else { dragMoved = true; clearLongPress(); dragHandler(dx, dy, "move"); }
          } else dragHandler(dx, dy, "move");
        }
        else { userAdjusted = true; view.x -= dx; view.y -= dy; apply(); }
        if (tapStart && Math.hypot(e.clientX - tapStart.x, e.clientY - tapStart.y) > CFG.tapMaxPx) { tapStart = null; clearLongPress(); }
      }
    });
    svg.addEventListener("pointerleave", (e) => {
      if (e.pointerType === "pen") disarmPenSoon();
      if (cb.hoverEnd) cb.hoverEnd();
    });
    function endPointer(e) {
      clearLongPress();
      pts.delete(e.pointerId);
      if (pts.size < 2) pinch = null;
      if (dragHandler && dragMoved && pts.size === 0) { dragMoved = false; dragHandler(0, 0, "end"); }
      if (tapStart && tapStart.id === e.pointerId) {
        const dt = Date.now() - tapStart.t;
        if (dt <= CFG.tapMaxMs) {
          const now = Date.now();
          const isDbl = lastTapInfo && (now - lastTapInfo.t) <= CFG.dblTapMs &&
            Math.hypot(e.clientX - lastTapInfo.x, e.clientY - lastTapInfo.y) <= CFG.dblTapPx;
          if (isDbl) {
            // двойной тап — сперва даём модулю шанс обработать (напр. правка размера по
            // цепочке): если cb.dbl вернул truthy — двойной тап «съеден», зум НЕ делаем.
            const wc = toWorld(e.clientX, e.clientY);
            if (cb.dbl && cb.dbl(wc, e)) { lastTapInfo = null; tapStart = null; return; }
            // иначе зум к точке касания (первый тап уже отработал как обычно,
            // задержки на распознавание двойного тапа НЕТ — второй просто переосмыслен)
            userAdjusted = true;
            view.w *= CFG.dblTapZoomK; view.h *= CFG.dblTapZoomK;
            clampView();
            const wc2 = toWorld(e.clientX, e.clientY);
            view.x += wc.x - wc2.x; view.y += wc.y - wc2.y;
            apply();
            lastTapInfo = null;
          } else {
            if (cb.tap) cb.tap(toWorld(e.clientX, e.clientY), e);
            lastTapInfo = { x: e.clientX, y: e.clientY, t: now };
          }
        }
        tapStart = null;
      }
    }
    svg.addEventListener("pointerup", endPointer);
    svg.addEventListener("pointercancel", (e) => { clearLongPress(); pts.delete(e.pointerId); pinch = null; tapStart = null; });

    svg.addEventListener("wheel", (e) => {
      e.preventDefault();
      userAdjusted = true;
      const k = e.deltaY > 0 ? 1.12 : 1 / 1.12;
      const wc = toWorld(e.clientX, e.clientY);
      view.w *= k; view.h *= k;
      clampView();
      const wc2 = toWorld(e.clientX, e.clientY);
      view.x += wc.x - wc2.x; view.y += wc.y - wc2.y;
      apply();
    }, { passive: false });

    // ---------- вписать содержимое ----------
    // lastFit — последний осознанный fit(bbox, padRatio) (включая fit(null) —
    // «вписать дефолтный вид»): используется ниже, чтобы пережить «устаканивание»
    // вёрстки контейнера сразу после монтирования (см. resize()).
    let lastFit = null;
    function fit(bbox, padRatio) {
      lastFit = { bbox, padRatio };
      const pad = padRatio == null ? 0.15 : padRatio;
      const b = bbox && bbox.w > 0 && bbox.h > 0 ? bbox : { x: CFG.startView.x, y: CFG.startView.y, w: CFG.startView.w, h: CFG.startView.h };
      const aspect = svg.clientHeight > 0 ? svg.clientWidth / svg.clientHeight : 1.5;
      let w = b.w * (1 + pad * 2), h = b.h * (1 + pad * 2);
      if (w / h < aspect) w = h * aspect; else h = w / aspect;
      view.x = b.x + b.w / 2 - w / 2; view.y = b.y + b.h / 2 - h / 2; view.w = w; view.h = h;
      clampView(); apply();
    }

    // Окно «устаканивания» после монтирования (мс) — на части реальных мобильных
    // браузеров 100dvh у .ep-plan (см. plan.css) при первой отрисовке ещё не
    // отражает финальный размер (адресная строка сворачивается/разворачивается
    // уже ПОСЛЕ первого layout) — mountCanvas() (plan-mount.js) зовёт fit(bbox)
    // синхронно сразу после создания канваса, когда svg.clientWidth/Height может
    // быть замерен по ЕЩЁ НЕ устаканившемуся контейнеру. Раньше resize() (колбэк
    // ResizeObserver) только подстраивал ПРОПОРЦИИ viewBox под новый размер,
    // сохраняя уже неверный ЦЕНТР вида — план оставался обрезанным/съехавшим до
    // ручного действия, которое заново зовёт fit() (репорт пользователя: «при
    // открытии проекта получается обрезанное, нормальным становится когда нажимаю
    // во весь экран 2 раза» — сам toggleFullscreen() fit() не зовёт, но резкий
    // скачок размера контейнера в fullscreen лишний раз гоняет resize(), и к
    // моменту возврата из fullscreen dvh у браузера уже успевает устаканиться).
    // Пока это окно не истекло, resize() вместо простой подстройки пропорций
    // заново зовёт fit() с ПОСЛЕДНИМИ осознанными параметрами — самокорректируется
    // без необходимости лезть в fullscreen. После окна — обычное поведение (сохраняет
    // текущий вид пользователя, НЕ переприменяет fit поверх его собственного зума/пана).
    // 1500мс → 3000мс: повторный репорт того же класса бага (пустота внизу, «пропадает
    // после переключения во весь экран туда-обратно») — переход в true-fullscreen PWA
    // (см. manifest display:"fullscreen") или смена компоновки на компактный тулбар,
    // судя по всему, на части реальных устройств устаканивается ДОЛЬШЕ 1.5с. Запас
    // безопасен — окно всё равно закрывается на первом же осознанном действии
    // пользователя (зум/пан вызывают fit() заново с новыми параметрами через apply()).
    const settleUntil = Date.now() + 3000;
    function resize() { // подгон пропорций viewBox под контейнер (или полный re-fit во время «устаканивания»)
      if (lastFit && Date.now() < settleUntil) { fit(lastFit.bbox, lastFit.padRatio); return; }
      const aspect = svg.clientHeight > 0 ? svg.clientWidth / svg.clientHeight : 1.5;
      const cy = view.y + view.h / 2;
      view.h = view.w / aspect;
      view.y = cy - view.h / 2;
      apply();
    }
    const ro = typeof ResizeObserver !== "undefined" ? new ResizeObserver(resize) : null;
    if (ro) ro.observe(svg);

    setTimeout(() => { resize(); }, 0);

    return {
      svg, layers,
      getView: () => ({ ...view }),
      cmPerPx: pxToCm,
      toWorld, fit, redraw: apply,
      panBy: (dx, dy) => { view.x += dx; view.y += dy; apply(); }, // сдвиг вида в мировых см (программный, не жестом)
      userAdjustedView: () => userAdjusted, // юзер сам зумил/панорамировал (авто-refit больше не перебивает)
      onTap: (fn) => { cb.tap = fn; },
      onDblTap: (fn) => { cb.dbl = fn; }, // (worldPt, e) → true, если двойной тап обработан (зум не делать)
      onViewChanged: (fn) => { cb.viewChanged = fn; },
      onHover: (fn) => { cb.hover = fn; },     // (worldPt, e) — живой предпросмотр снапа/прицела пера
      onHoverEnd: (fn) => { cb.hoverEnd = fn; }, // указатель ушёл с холста — убрать предпросмотр
      onLongPress: (fn) => { cb.longPress = fn; }, // (worldPt, e) — держали палец на месте, e.clientX/Y для позиционирования UI
      setDragHandler: (fn) => { dragHandler = fn || null; dragMoved = false; },
      destroy: () => { if (ro) ro.disconnect(); if (svg.parentNode) svg.parentNode.removeChild(svg); }
    };
  }

  EP.Plan = EP.Plan || {};
  EP.Plan.Canvas = { create: createCanvas, CFG };
})();
