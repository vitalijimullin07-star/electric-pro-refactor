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
    tapMaxPx: 9, tapMaxMs: 450
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
    const cb = { tap: null, viewChanged: null };

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
    let tapStart = null;   // { x, y, t, id }
    let dragHandler = null, dragMoved = false; // перехват одиночного перетаскивания (подложка/элементы)
    let penActive = false; // стилус (S Pen / Apple Pencil): пока он на экране — касания ладони игнорируем

    function dist2(a, b) { const dx = a.x - b.x, dy = a.y - b.y; return Math.hypot(dx, dy); }
    function pinchInfo() {
      const [a, b] = [...pts.values()];
      return { dist: Math.max(10, dist2(a, b)), cx: (a.x + b.x) / 2, cy: (a.y + b.y) / 2 };
    }

    svg.addEventListener("pointerdown", (e) => {
      if (e.pointerType === "pen") penActive = true;
      else if (e.pointerType === "touch" && penActive) return; // ладонь при работе стилусом
      svg.setPointerCapture(e.pointerId);
      pts.set(e.pointerId, { x: e.clientX, y: e.clientY });
      if (pts.size === 1) tapStart = { x: e.clientX, y: e.clientY, t: Date.now(), id: e.pointerId };
      if (pts.size === 2) { pinch = pinchInfo(); tapStart = null; }
    });
    svg.addEventListener("pointermove", (e) => {
      if (!pts.has(e.pointerId)) return;
      const prev = pts.get(e.pointerId);
      pts.set(e.pointerId, { x: e.clientX, y: e.clientY });
      if (pts.size === 2 && pinch) {
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
        if (dragHandler) { dragMoved = true; dragHandler(dx, dy, "move"); }
        else { view.x -= dx; view.y -= dy; apply(); }
        if (tapStart && Math.hypot(e.clientX - tapStart.x, e.clientY - tapStart.y) > CFG.tapMaxPx) tapStart = null;
      }
    });
    function endPointer(e) {
      if (e.pointerType === "pen") penActive = false;
      pts.delete(e.pointerId);
      if (pts.size < 2) pinch = null;
      if (dragHandler && dragMoved && pts.size === 0) { dragMoved = false; dragHandler(0, 0, "end"); }
      if (tapStart && tapStart.id === e.pointerId) {
        const dt = Date.now() - tapStart.t;
        if (dt <= CFG.tapMaxMs && cb.tap) cb.tap(toWorld(e.clientX, e.clientY), e);
        tapStart = null;
      }
    }
    svg.addEventListener("pointerup", endPointer);
    svg.addEventListener("pointercancel", (e) => { pts.delete(e.pointerId); pinch = null; tapStart = null; });

    svg.addEventListener("wheel", (e) => {
      e.preventDefault();
      const k = e.deltaY > 0 ? 1.12 : 1 / 1.12;
      const wc = toWorld(e.clientX, e.clientY);
      view.w *= k; view.h *= k;
      clampView();
      const wc2 = toWorld(e.clientX, e.clientY);
      view.x += wc.x - wc2.x; view.y += wc.y - wc2.y;
      apply();
    }, { passive: false });

    // ---------- вписать содержимое ----------
    function fit(bbox, padRatio) {
      const pad = padRatio == null ? 0.15 : padRatio;
      const b = bbox && bbox.w > 0 && bbox.h > 0 ? bbox : { x: CFG.startView.x, y: CFG.startView.y, w: CFG.startView.w, h: CFG.startView.h };
      const aspect = svg.clientHeight > 0 ? svg.clientWidth / svg.clientHeight : 1.5;
      let w = b.w * (1 + pad * 2), h = b.h * (1 + pad * 2);
      if (w / h < aspect) w = h * aspect; else h = w / aspect;
      view.x = b.x + b.w / 2 - w / 2; view.y = b.y + b.h / 2 - h / 2; view.w = w; view.h = h;
      clampView(); apply();
    }

    function resize() { // подгон пропорций viewBox под контейнер
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
      onTap: (fn) => { cb.tap = fn; },
      onViewChanged: (fn) => { cb.viewChanged = fn; },
      setDragHandler: (fn) => { dragHandler = fn || null; dragMoved = false; },
      destroy: () => { if (ro) ro.disconnect(); if (svg.parentNode) svg.parentNode.removeChild(svg); }
    };
  }

  EP.Plan = EP.Plan || {};
  EP.Plan.Canvas = { create: createCanvas, CFG };
})();
