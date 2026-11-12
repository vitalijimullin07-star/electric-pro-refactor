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
    longPressMs: 550, // держим палец на месте дольше — быстрое меню объекта
    // запас картинки вокруг видимой области (доля размера экрана с каждой стороны), см.
    // placeSvg: при сдвиге/отдалении пальцем края уже нарисованы, а не «появляются из пустоты»
    overscan: 0.5
  };

  function el(tag, attrs) {
    const n = document.createElementNS(NS, tag);
    if (attrs) for (const k in attrs) n.setAttribute(k, attrs[k]);
    return n;
  }

  // opts.overscan — запас картинки вокруг экрана (доля); 0 — без запаса (офскрин-холст печати:
  // там viewBox обязан описывать ровно кадр листа, иначе масштаб чертежа считался бы с полями)
  function createCanvas(host, opts) {
    const OVS = opts && opts.overscan != null ? Math.max(0, +opts.overscan || 0) : CFG.overscan;
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
    // обёртка — её двигает transform во время жеста (см. applyLive). Именно ОБЁРТКА, а не
    // сам <svg>: смена transform у svg заставляет браузер заново раскладывать весь
    // SVG-текст (масштаб шрифта считается от экранного преобразования) — замер дал ту же
    // раскладку и перерисовку на каждый кадр, что и смена viewBox
    const wrap = document.createElement("div");
    wrap.className = "ep-plan-svgwrap";
    wrap.appendChild(svg);
    host.appendChild(wrap);

    const view = { ...CFG.startView };
    const cb = { tap: null, viewChanged: null, hover: null, hoverEnd: null, longPress: null };
    // Кэш размеров холста. svg.clientWidth/Height — layout-forcing свойства: чтение
    // ПОСЛЕ мутаций DOM синхронно флашит reflow. pxToCm() (=cmPerPx) зовётся из
    // рендера, сетки, хит-тестов — читать clientWidth каждый раз = layout thrashing
    // (CPU-профиль на 30 комнатах/150 точках: pxToCm ~40% времени renderScene, почти
    // всё — форс-reflow). Размер холста меняется ТОЛЬКО на ресайз/фуллскрин/устаканивание,
    // а ResizeObserver (resize()) их все ловит — поэтому меряем ОДИН раз и держим в
    // кэше, обновляя в resize()/fit(). pxToCm из горячего пути больше не трогает layout.
    let cw = 0, ch = 0;
    // меряем ВИДИМУЮ область — обёртку: сам svg шире её на запас (см. placeSvg)
    function measureBox() { const w = wrap.clientWidth, h = wrap.clientHeight; if (w > 0) cw = w; if (h > 0) ch = h; }
    /* ЗАПАС КАРТИНКИ ВОКРУГ ЭКРАНА (аудит: «при перемещении картинка появляется из пустоты»).
       Во время жеста двигается готовая картинка (transform обёртки), а svg раньше был ровно
       размером с экран и обрезал всё за своими краями: сдвинул план на 300 px — 300 px пустой
       полосы, пока вид не зафиксируется (пауза ~140 мс или конец жеста). Теперь svg больше
       видимой области на ov с каждой стороны (overflow контейнера холста — hidden, лишнее не
       видно), а viewBox описывает ту же расширенную область: при сдвиге и отдалении открываются
       уже нарисованные места. Видимый вид (view), масштаб (cmPerPx) и попадание тапом (toWorld)
       считаются от ВИДИМОЙ области, как раньше. Сцена и так рисуется вся (отсечения нет), так что
       запас не добавляет узлов — только площадь слоя. */
    let ovX = 0, ovY = 0;
    function placeSvg() {
      const mx = Math.round(cw * OVS), my = Math.round((ch || cw) * OVS);
      if (mx === ovX && my === ovY && svg.style.width) return;
      ovX = mx; ovY = my;
      svg.style.left = -mx + "px"; svg.style.top = -my + "px";
      svg.style.width = (cw + 2 * mx) + "px"; svg.style.height = ((ch || cw) + 2 * my) + "px";
    }

    function clampView() {
      if (view.w < CFG.minSpanCm) scaleTo(CFG.minSpanCm);
      if (view.w > CFG.maxSpanCm) scaleTo(CFG.maxSpanCm);
    }
    function scaleTo(w) {
      const cx = view.x + view.w / 2, cy = view.y + view.h / 2, k = w / view.w;
      view.w = w; view.h *= k;
      view.x = cx - view.w / 2; view.y = cy - view.h / 2;
    }
    /* ---------- «живой» вид во время жеста (пан, пинч, колесо) ----------
       Раньше КАЖДЫЙ шаг пана/зума менял viewBox, а это для браузера — новая раскладка
       ВСЕГО svg: пересчёт геометрии тысяч узлов, перерисовка и растр всего холста на
       каждый кадр движения пальца. Замер (30 комнат, ~2500 узлов, CPU ×4): Layout ~12 мс
       + Paint ~9 мс + раскладка слоёв ~13 мс на ОДИН шаг — на слабом телефоне 80+ мс,
       то есть рывки, а на части GPU (Mali) ещё и «мусор» полосами там, где растр не
       успел (не нарисованные тайлы драйвер показывает чем попало).
       Теперь во время жеста двигаем не viewBox, а CSS-transform обёртки svg
       (композитный слой, will-change: transform в plan.css): браузер просто сдвигает и
       масштабирует уже отрисованную картинку, без раскладки и перерисовки. Замер на том
       же проекте: раскладка 41→1, перерисовка 78→2, растр 552→20 мс за 40 шагов.
       За краем вида при сдвиге — пустой фон (overflow: visible у svg пробовали: слой
       тогда записывается с запасом вокруг экрана, и его раскладка на кадр выходила
       в 4 раза дороже, чем вся экономия). Поэтому viewBox фиксируется (apply) по
       окончании жеста, при паузе пальца/колеса и если жест ушёл далеко (полэкрана или
       масштаб ×2) — пустота по краям и размытие не копятся.
       committed — вид, который сейчас реально стоит в viewBox; view — живой вид. */
    let committed = null;   // {x,y,w,h} — под этот вид отрисована сцена (viewBox)
    let liveT = null;       // {tx,ty,s} — текущий CSS-transform svg; null — его нет
    let commitTimer = 0;    // отложенная фиксация (пауза колеса)
    // Прямоугольник svg БЕЗ живого сдвига — замеряется ОДИН раз в начале жеста. Раньше
    // toWorld на каждом шаге пинча/колеса читал getBoundingClientRect, а это сразу после
    // записи transform: браузер синхронно пересчитывал раскладку, и при смене масштаба —
    // раскладку всего SVG-текста (замер CPU ×4: ~20 мс на КАЖДЫЙ шаг зума). Пока идёт жест,
    // раскладка страницы не меняется (меняется только transform), так что одного замера
    // достаточно; любая фиксация вида (apply) замер сбрасывает.
    let restRect = null;
    function measureRest() {
      const r = wrap.getBoundingClientRect(); // видимая область (svg шире её на запас)
      let left = r.left, top = r.top, w = r.width, h = r.height;
      if (liveT) { left -= liveT.tx; top -= liveT.ty; w /= liveT.s; h /= liveT.s; }
      return { left, top, w, h };
    }
    function liveTransform(tx, ty, s) {
      if (!liveT && !restRect) restRect = measureRest(); // до первой записи transform — без сдвига
      liveT = { tx: tx, ty: ty, s: s };
      wrap.style.transform = "translate(" + tx + "px," + ty + "px) scale(" + s + ")";
    }
    // живой вид в пределах того, что можно показать сдвигом уже нарисованной картинки?
    function liveFits(v) {
      if (!committed || !cw) return false;
      const s = committed.w / v.w, k = cw / v.w;
      const tx = (committed.x - v.x) * k, ty = (committed.y - v.y) * k;
      return s >= 0.5 && s <= 2 && covers(tx, ty, s);
    }
    /* Пока жест ИДЁТ (пальцы на экране или серия колеса), живой вид держим дольше: масштаб
       до ×4 вместо ×2 — на время движения лёгкое размытие незаметно, зато обычный пинч
       (×2–×3) проходит вообще без промежуточной фиксации. А если фиксировать всё же
       пришлось (вид ушёл дальше нарисованного), она ЛЁГКАЯ: меняется только viewBox, сцену
       под новый масштаб не пересобираем (толщины линий и размер значков на эти доли
       секунды остаются «как у сдвинутой картинки» — ровно то, что и так было на экране).
       Полная пересборка под масштаб — один раз, когда жест закончился. Раньше каждая
       промежуточная фиксация пересобирала стены, цепочки и трассы всей квартиры посреди
       движения пальцев: на большой квартире 70–130 мс счёта (CPU ×4) плюс раскладка и
       покраска — кадр до 300 мс прямо во время пинча. */
    let rescalePending = false; // была лёгкая фиксация — сцена ждёт пересборки под масштаб
    function applyLive(active) {
      if (!committed || !cw) { apply(); return; }
      const act = !!active || pts.size > 0;
      const s = committed.w / view.w;
      const k = cw / view.w; // экранных px на см в живом виде
      const tx = (committed.x - view.x) * k, ty = (committed.y - view.y) * k;
      if (!(s >= (act ? 0.4 : 0.5) && s <= (act ? 4 : 2)) || !covers(tx, ty, s)) {
        // запас кончается — фиксируем ДО появления пустого края (во время жеста — лёгкая
        // фиксация: только viewBox, сцена не пересобирается)
        apply(act);
        if (act && pts.size === 0) commitSoon(140); // серия колеса: полная фиксация после паузы
        return;
      }
      liveTransform(tx, ty, s);
      // Пока пальцы на экране, по таймеру НЕ фиксируем: края и так нарисованы (запас), а на
      // тяжёлой сцене кадр бывает дольше 140 мс — таймер срабатывал между событиями
      // продолжающегося жеста, и дорогая фиксация шла прямо посреди движения (аудит, п. 2).
      // Фиксация — по отпусканию (endPointer); для колеса, инерции и анимации — после паузы.
      if (pts.size === 0) commitSoon(140);
    }
    // уже нарисованная картинка (svg с запасом) после transform(tx, ty, s) закрывает экран
    // с запасом хотя бы 15% от ov? Иначе пора фиксировать — пока край не показался
    function covers(tx, ty, s) {
      const sx = s * ovX * 0.15, sy = s * ovY * 0.15, H = ch || cw;
      return tx - s * ovX <= -sx && tx + s * (cw + ovX) >= cw + sx
        && ty - s * ovY <= -sy && ty + s * (H + ovY) >= H + sy;
    }
    function commitSoon(ms) {
      clearTimeout(commitTimer);
      commitTimer = setTimeout(() => { commitTimer = 0; if (liveT || rescalePending) apply(); }, ms);
    }
    /* ПРОПОРЦИИ ВИДА = ПРОПОРЦИИ ХОЛСТА (аудит Астры, п. 10). viewBox рисуется браузером с
       сохранением пропорций (preserveAspectRatio meet — картинка вписывается и центрируется), а
       toWorld пересчитывает экран в мир РАЗДЕЛЬНО по осям (view.w/ширина, view.h/высота). Пока
       пропорции совпадают, это одно и то же. Разойтись они могли: подвод вида над шторкой
       (анимация) начинался со старыми пропорциями, посреди него открытая боковая панель меняла
       размер холста, и анимация в конце ставила вид со СТАРЫМИ пропорциями — тап попадал на
       38 см ниже нарисованного (замер аудита: холст 610×614, вид 964×598). Теперь любая фиксация
       вида сводит высоту вида к пропорциям холста (центр сохраняется), анимация — тоже. */
    function fixAspect() {
      if (!(cw > 0 && ch > 0) || !(view.w > 0) || !(view.h > 0)) return;
      const asp = cw / ch;
      if (Math.abs(view.w / view.h - asp) <= asp * 1e-9) return;
      const cy = view.y + view.h / 2;
      view.h = view.w / asp; view.y = cy - view.h / 2;
    }
    function apply(light) {
      clearTimeout(commitTimer); commitTimer = 0;
      restRect = null;
      if (!cw) measureBox();
      fixAspect();
      committed = { x: view.x, y: view.y, w: view.w, h: view.h };
      // viewBox и сброс transform — в ОДНОМ кадре: иначе сцена на миг «прыгнула» бы
      if (liveT) { liveT = null; wrap.style.transform = ""; }
      placeSvg();
      const kx = view.w / Math.max(1, cw), ky = view.h / Math.max(1, ch || cw);
      svg.setAttribute("viewBox", (view.x - ovX * kx) + " " + (view.y - ovY * ky) + " " + (view.w + 2 * ovX * kx) + " " + (view.h + 2 * ovY * ky));
      drawGrid();
      // лёгкая фиксация посреди жеста: сцену под масштаб не пересобираем, но сообщаем, что
      // нарисованная область сдвинулась (отсечение невидимого должно её покрыть)
      /* Лёгкая фиксация посреди жеста — это сдвиг/масштаб viewBox, и браузер заново раскладывает
         и красит ВСЕ подписи сцены (замер, сильное приближение, ~870 подписей, CPU ×4: раскладка
         30-50 мс + покраска 20-60 мс — рывок прямо во время движения пальца; аудит, п. 2).
         Поэтому с первой такой фиксации и до конца жеста второстепенные подписи (цифры размеров,
         высоты, имена линий, номера проёмов) скрыты классом is-moving: фиксация становится
         дешёвой, а после остановки подписи возвращаются вместе с полной фиксацией. Короткие
         жесты, которым хватает запаса картинки, этого не касаются — подписи не мигают. */
      if (light) { rescalePending = true; svg.classList.add("is-moving"); if (cb.viewMoved) cb.viewMoved({ ...view }); return; }
      svg.classList.remove("is-moving");
      rescalePending = false;
      if (cb.viewChanged) cb.viewChanged({ ...view });
    }
    function pxToCm() { if (!cw) measureBox(); return view.w / Math.max(1, cw); } // читает КЭШ (см. measureBox), не форсит reflow
    function toWorld(clientX, clientY) {
      // во время жеста svg сдвинут/масштабирован transform'ом, а живой вид (view)
      // описывает НЕсдвинутый прямоугольник холста — берём его (замер начала жеста)
      const r = (liveT && restRect) ? restRect : measureRest();
      return { x: view.x + (clientX - r.left) * (view.w / r.w), y: view.y + (clientY - r.top) * (view.h / r.h) };
    }

    /* ---------- плавность: анимация вида и инерция пана ----------
       Программные переходы (двойной тап, «вписать», подвод вида над шторкой) раньше
       прыгали в новую точку за один кадр. Теперь вид плавно доезжает за ~220 мс тем же
       живым transform'ом, что и жесты (без перерисовки сцены на кадре), и фиксируется
       один раз в конце. Пан после быстрого броска пальцем докатывается по инерции с
       затуханием — как карта в телефоне. Если цель дальше, чем можно показать сдвигом
       готовой картинки (масштаб ×2 / полэкрана), — переход мгновенный, как раньше.
       prefers-reduced-motion — всегда мгновенно. */
    const reduceMotion = (() => { try { return !!(window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches); } catch (e) { return false; } })();
    let anim = 0, inertia = 0;
    function stopMotion() {
      if (anim) { cancelAnimationFrame(anim); anim = 0; }
      if (inertia) { cancelAnimationFrame(inertia); inertia = 0; }
    }
    function animateTo(target, ms) {
      stopMotion();
      if (reduceMotion || typeof requestAnimationFrame !== "function" || !liveFits(target)) { Object.assign(view, target); apply(); return; }
      const from = { ...view }, t0 = performance.now(), dur = ms || 220;
      const step = (now) => {
        const t = Math.min(1, (now - t0) / dur), e = 1 - Math.pow(1 - t, 3); // ease-out
        if (t >= 1) { anim = 0; Object.assign(view, target); apply(); return; }
        const w = from.w * Math.pow(target.w / from.w, e); // масштаб — геометрически, без «рывка» на зуме
        const cx = from.x + from.w / 2 + ((target.x + target.w / 2) - (from.x + from.w / 2)) * e;
        const cy = from.y + from.h / 2 + ((target.y + target.h / 2) - (from.y + from.h / 2)) * e;
        view.w = w; view.h = w / ((cw > 0 && ch > 0) ? cw / ch : from.w / from.h); // пропорции холста — он мог измениться посреди анимации
        view.x = cx - view.w / 2; view.y = cy - view.h / 2;
        applyLive();
        anim = requestAnimationFrame(step);
      };
      anim = requestAnimationFrame(step);
    }
    // скорость пана по последним ~100 мс движения пальца (px/мс)
    let panTrail = [];
    function trackPan(x, y) {
      const t = performance.now();
      panTrail.push({ t, x, y });
      while (panTrail.length > 2 && t - panTrail[0].t > 100) panTrail.shift();
    }
    function startInertia() {
      const tr = panTrail; panTrail = [];
      if (reduceMotion || typeof requestAnimationFrame !== "function" || tr.length < 2) return false;
      const a = tr[0], b = tr[tr.length - 1], now = performance.now();
      if (now - b.t > 60 || b.t - a.t < 8) return false; // палец остановился перед отрывом — без броска
      let vx = (b.x - a.x) / (b.t - a.t), vy = (b.y - a.y) / (b.t - a.t);
      if (Math.hypot(vx, vy) < 0.25) return false;
      let last = now;
      const step = (t) => {
        const dt = Math.min(40, Math.max(1, t - last)); last = t;
        const decay = Math.exp(-dt / 230); // затухание: за ~0.7 с почти до нуля
        vx *= decay; vy *= decay;
        const k = pxToCm();
        view.x -= vx * dt * k; view.y -= vy * dt * k;
        applyLive();
        if (Math.hypot(vx, vy) < 0.02) { inertia = 0; if (liveT || rescalePending) apply(); return; }
        inertia = requestAnimationFrame(step);
      };
      inertia = requestAnimationFrame(step);
      return true;
    }

    // ---------- сетка (адаптивный шаг) ----------
    /* Сетка — ТРИ узла <path> (мелкая, крупная, оси), а не линия на каждую черту. Раньше
       это были ~80 отдельных <line> во весь холст, и каждая — свой элемент отрисовки с
       огромным охватом: движок на КАЖДОМ кадре любого движения (сдвиг плана, масштаб,
       перенос комнаты) заново раскладывает сцену по слоям, и цена этой раскладки росла
       именно от числа таких длинных пересекающихся элементов. Замер (28 комнат, CPU ×4):
       раскладка 12,6 мс на кадр с линиями и 4,5 мс с одним контуром — при той же картинке.
       Узлы создаются один раз и дальше только получают новый d (без пересоздания). */
    const gridNodes = {};
    function gridPath(key, cls, d, sw) {
      let n = gridNodes[key];
      if (!n) { n = gridNodes[key] = el("path", { class: cls, fill: "none" }); layers.grid.appendChild(n); }
      if (n.getAttribute("d") !== d) n.setAttribute("d", d);
      const s = String(sw);
      if (n.getAttribute("stroke-width") !== s) n.setAttribute("stroke-width", s);
    }
    function drawGrid() {
      const px = pxToCm();
      let step = CFG.gridSteps[CFG.gridSteps.length - 1];
      for (const s of CFG.gridSteps) { if (s / px >= CFG.gridMinPx) { step = s; break; } }
      // сетка с запасом в экран во все стороны: во время жеста холст двигается
      // transform'ом без перерисовки (см. applyLive), и за краем вида сетка уже есть
      const gx = view.x - view.w, gy = view.y - view.h, gw = view.w * 3, gh = view.h * 3;
      const x0 = Math.floor(gx / step) * step, x1 = gx + gw;
      const y0 = Math.floor(gy / step) * step, y1 = gy + gh;
      const sw = px; // ~1px в мировых единицах
      let minor = "", major = "";
      for (let x = x0; x <= x1; x += step) {
        const seg = "M" + x + " " + gy + "V" + y1;
        if (x % CFG.gridMajorEvery === 0) major += seg; else minor += seg;
      }
      for (let y = y0; y <= y1; y += step) {
        const seg = "M" + gx + " " + y + "H" + x1;
        if (y % CFG.gridMajorEvery === 0) major += seg; else minor += seg;
      }
      gridPath("minor", "ep-plan-grid-line", minor, sw);
      gridPath("major", "ep-plan-grid-major", major, sw * 1.4);
      // оси координат (начало — точка отсчёта квартиры)
      gridPath("axis", "ep-plan-grid-axis", "M0 " + gy + "V" + y1 + "M" + gx + " 0H" + x1, sw * 1.6);
    }

    // ---------- указатели: пан / пинч / тап ----------
    const pts = new Map(); // pointerId -> {x,y}
    let pinch = null;      // { dist, cx, cy } на старте пинча
    // пользователь САМ зумил/панорамировал (колесо/пинч/пан пальцем) — отложенные
    // авто-вписывания (fitToProject-таймеры в plan-mount.js) больше не должны
    // перебивать его вид (иначе «вид отпрыгивает» через ~секунду после открытия,
    // если начать зумить сразу — пойман визуальным тестом на моём же авто-refit'e)
    let userAdjusted = false;
    // человек уже работает с холстом (коснулся/крутил колесо): автоподгоны «первых секунд»
    // (окно устаканивания вёрстки ниже и таймеры fitToProject в plan-mount.js) больше не
    // переставляют вид — иначе вид прыгал прямо под пальцем, если начать тянуть стену или
    // открыть карточку комнаты в первые 2-3 секунды после открытия проекта (поймано живым
    // прогоном: подвод вида над шторкой отменялся отложенным «вписать весь проект»)
    let interacted = false;
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
      interacted = true;
      stopMotion(); // новое касание ловит докатывающийся вид на месте
      panTrail = [];
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
      if (pts.size === 2) {
        // ВТОРОЙ ПАЛЕЦ ПОСРЕДИ ТЯГИ (аудит Астры, п. 9): тяга заканчивается там, где сейчас
        // (как если бы первый палец отпустили), дальше — обычный пинч. Раньше тяга «висела»:
        // пинч двигал вид, а оставшийся после пинча палец снова тянул объект с непонятного
        // места. dragVeto — до конца этого жеста одиночный палец только панорамирует.
        finishDrag();
        dragVeto = true;
        pinch = pinchInfo(); tapStart = null; clearLongPress();
      }
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
        applyLive();
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
            if (cb.dragStart) cb.dragStart(); // модуль запоминает, с какого шага истории начался жест (для отката)
            const res = dragHandler(0, 0, "start", toWorld((downClient || e).x, (downClient || e).y), { dbl: dblDown });
            // первый шаг — смещение от точки КАСАНИЯ, а не от прошлого события: движение под
            // порогом старта иначе терялось, и объект (или план при пане) отставал от пальца на
            // величину порога — точка захвата не сохранялась (аудит Астры, п. 11)
            const sx = downClient ? (e.clientX - downClient.x) * k : dx, sy = downClient ? (e.clientY - downClient.y) * k : dy;
            if (res === false) { dragVeto = true; userAdjusted = true; view.x -= sx; view.y -= sy; trackPan(e.clientX, e.clientY); applyLive(); }
            else { dragMoved = true; clearLongPress(); if (cb.dragBegin) cb.dragBegin(); dragHandler(sx, sy, "move"); }
          } else dragHandler(dx, dy, "move");
        }
        else { userAdjusted = true; view.x -= dx; view.y -= dy; trackPan(e.clientX, e.clientY); applyLive(); }
        if (tapStart && Math.hypot(e.clientX - tapStart.x, e.clientY - tapStart.y) > CFG.tapMaxPx) { tapStart = null; clearLongPress(); }
      }
    });
    svg.addEventListener("pointerleave", (e) => {
      if (e.pointerType === "pen") disarmPenSoon();
      if (cb.hoverEnd) cb.hoverEnd();
    });
    // закончить идущую тягу «как отпустили» / оборвать её с откатом
    function finishDrag() {
      if (!(dragHandler && dragMoved)) return false;
      dragMoved = false;
      if (cb.dragDone) cb.dragDone(false);
      dragHandler(0, 0, "end");
      return true;
    }
    function abortDrag() {
      if (!(dragHandler && dragMoved)) return false;
      dragMoved = false;
      if (cb.dragDone) cb.dragDone(true);
      if (cb.dragCancel) cb.dragCancel();
      return true;
    }
    function endPointer(e) {
      clearLongPress();
      pts.delete(e.pointerId);
      // после пинча оставшийся палец не должен «бросить» вид — траекторию сбрасываем
      if (pinch) panTrail = [];
      if (pts.size < 2) pinch = null;
      // жест закончен: быстрый бросок — докатываем по инерции, иначе фиксируем живой вид
      // в viewBox (одна перерисовка на весь жест)
      if (pts.size === 0 && !(dragHandler && dragMoved) && startInertia()) { /* зафиксирует сама инерция */ }
      else if (pts.size === 0 && (liveT || rescalePending)) apply();
      // cb.dragDone — ПЕРЕД "end": снять живой слой тяги, чтобы обработчик отпускания
      // (запись, перерисовка) работал уже с основной сценой
      if (pts.size === 0) finishDrag();
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
            // цель зума считаем на копии вида, а доезжаем до неё плавно (animateTo)
            const v0 = { ...view };
            view.w *= CFG.dblTapZoomK; view.h *= CFG.dblTapZoomK;
            clampView();
            const wc2 = toWorld(e.clientX, e.clientY);
            view.x += wc.x - wc2.x; view.y += wc.y - wc2.y;
            const target = { ...view };
            Object.assign(view, v0);
            animateTo(target, 240);
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
    /* ЖЕСТ ОБОРВАЛА СИСТЕМА (аудит Астры, п. 9): pointercancel приходит, когда браузер забирает
       касание себе (входящий звонок, системный жест, жест «назад», прокрутка страницы). Раньше
       тяга оставалась полусделанной: копия объекта висела поверх холста, gestureBusy() оставался
       true, данные в памяти были сдвинуты, а на диск ничего не ушло. Теперь — снять слои тяги
       (dragDone(true)) и сообщить модулю (dragCancel), он откатывает правку к началу жеста. */
    svg.addEventListener("pointercancel", (e) => {
      clearLongPress(); pts.delete(e.pointerId); pinch = null; tapStart = null; panTrail = [];
      abortDrag();
      if (pts.size === 0 && (liveT || rescalePending)) apply();
    });

    svg.addEventListener("wheel", (e) => {
      e.preventDefault();
      stopMotion();
      userAdjusted = true; interacted = true;
      const k = e.deltaY > 0 ? 1.12 : 1 / 1.12;
      const wc = toWorld(e.clientX, e.clientY);
      view.w *= k; view.h *= k;
      clampView();
      const wc2 = toWorld(e.clientX, e.clientY);
      view.x += wc.x - wc2.x; view.y += wc.y - wc2.y;
      // колесо — серия событий без явного «конца»: фиксируем после паузы
      applyLive(true);
    }, { passive: false });

    // ---------- вписать содержимое ----------
    // lastFit — последний осознанный fit(bbox, padRatio) (включая fit(null) —
    // «вписать дефолтный вид»): используется ниже, чтобы пережить «устаканивание»
    // вёрстки контейнера сразу после монтирования (см. resize()).
    let lastFit = null;
    function fit(bbox, padRatio, opts) {
      stopMotion();
      lastFit = { bbox, padRatio };
      const pad = padRatio == null ? 0.15 : padRatio;
      const b = bbox && bbox.w > 0 && bbox.h > 0 ? bbox : { x: CFG.startView.x, y: CFG.startView.y, w: CFG.startView.w, h: CFG.startView.h };
      measureBox(); // холодный путь — освежаем кэш размеров
      const aspect = ch > 0 ? cw / ch : 1.5;
      let w = b.w * (1 + pad * 2), h = b.h * (1 + pad * 2);
      if (w / h < aspect) w = h * aspect; else h = w / aspect;
      const target = { x: b.x + b.w / 2 - w / 2, y: b.y + b.h / 2 - h / 2, w: w, h: h };
      if (opts && opts.animate && committed) {
        const v0 = { ...view }; Object.assign(view, target); clampView();
        const t2 = { ...view }; Object.assign(view, v0);
        animateTo(t2, 260); return;
      }
      Object.assign(view, target);
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
    // размер, под который вид уже подогнан: наблюдатель размера, сработавший ПОСЛЕ ручной
    // сверки (syncSize), видит тот же размер — повторная фиксация вида не нужна (она оборвала
    // бы начатую анимацию подвода вида перерисовкой сцены)
    let fitW = 0, fitH = 0;
    function resize() { // подгон пропорций viewBox под контейнер (или полный re-fit во время «устаканивания»)
      measureBox(); // RO сработал — размер реально изменился, освежаем кэш (единая точка свежести cw/ch)
      if (cw === fitW && ch === fitH && committed) return;
      afterMeasure();
    }
    function afterMeasure() {
      fitW = cw; fitH = ch;
      if (lastFit && Date.now() < settleUntil && !interacted) { fit(lastFit.bbox, lastFit.padRatio); return; }
      const aspect = ch > 0 ? cw / ch : 1.5;
      const cy = view.y + view.h / 2;
      view.h = view.w / aspect;
      view.y = cy - view.h / 2;
      apply();
    }
    const ro = typeof ResizeObserver !== "undefined" ? new ResizeObserver(resize) : null;
    // следим за ВИДИМОЙ областью (обёрткой): размер самого svg задаём мы (запас, placeSvg)
    if (ro) ro.observe(wrap);

    setTimeout(() => { resize(); }, 0);

    return {
      svg, layers, wrap,
      getView: () => ({ ...view }),
      cmPerPx: pxToCm,
      toWorld, fit, redraw: apply,
      // сдвиг вида в мировых см (программный, не жестом); {animate:true} — плавно доехать
      panBy: (dx, dy, opts) => {
        if (opts && opts.animate) { const t = { ...view, x: view.x + dx, y: view.y + dy }; animateTo(t, 240); return; }
        stopMotion(); view.x += dx; view.y += dy; apply();
      },
      isMoving: () => !!(anim || inertia || liveT),
      /* Поставить вид целиком (мировые см), {animate:true} — плавно. Пропорции приводятся к
         холсту, масштаб — к допустимому диапазону. Нужен подводу вида к объекту над шторкой
         (аудит Астры, п. 16): объект может не помещаться в свободную часть — тогда вид
         отдаляется, а не только сдвигается. */
      viewTo: (t, opts) => {
        if (!t || !(t.w > 0) || !(t.h > 0)) return;
        const v0 = { ...view };
        Object.assign(view, { x: t.x, y: t.y, w: t.w, h: t.h }); clampView(); fixAspect();
        const t2 = { ...view }; Object.assign(view, v0);
        if (opts && opts.animate) animateTo(t2, 260);
        else { stopMotion(); Object.assign(view, t2); apply(); }
      },
      /* Сверить размер холста СЕЙЧАС, не дожидаясь наблюдателя размера. Боковая панель на
         компьютере сужает холст в момент открытия, а наблюдатель срабатывает только после
         раскладки кадра — подвод вида, посчитанный раньше, взял бы старые пропорции. */
      syncSize: () => {
        const w0 = cw, h0 = ch; measureBox();
        if (Math.abs(cw - w0) < 0.5 && Math.abs(ch - h0) < 0.5) return false;
        afterMeasure(); return true;
      },
      // ЖЁСТКО задать масштаб (см в одном экранном пикселе), сохраняя центр вида —
      // нужно для истинного 1:1 (кнопка «1:1» в шапке плана): 1 CSS-пиксель по
      // спецификации CSS = 1/96 дюйма, значит 1см = 96/2.54 px, т.е. cmPerPx = 2.54/96.
      setCmPerPx: (v) => {
        stopMotion();
        const t = Number(v);
        if (!isFinite(t) || t <= 0 || !cw) return;
        const cxw = view.x + view.w / 2, cyw = view.y + view.h / 2;
        view.w = t * cw; view.h = t * (ch || cw / 1.5);
        view.x = cxw - view.w / 2; view.y = cyw - view.h / 2;
        userAdjusted = true; // осознанный масштаб — авто-refit не должен его перебить
        apply();
        if (cb.viewChanged) cb.viewChanged();
      },
      userAdjustedView: () => userAdjusted, // юзер сам зумил/панорамировал (авто-refit больше не перебивает)
      userInteracted: () => interacted,     // юзер уже касался холста — автоподгоны первых секунд не трогают вид
      onTap: (fn) => { cb.tap = fn; },
      onDblTap: (fn) => { cb.dbl = fn; }, // (worldPt, e) → true, если двойной тап обработан (зум не делать)
      onViewChanged: (fn) => { cb.viewChanged = fn; },
      onViewMoved: (fn) => { cb.viewMoved = fn; }, // лёгкая фиксация во время жеста (масштаб сцены прежний)
      overscan: () => ({ x: ovX, y: ovY }),        // запас картинки вокруг экрана, px
      onHover: (fn) => { cb.hover = fn; },     // (worldPt, e) — живой предпросмотр снапа/прицела пера
      onHoverEnd: (fn) => { cb.hoverEnd = fn; }, // указатель ушёл с холста — убрать предпросмотр
      onLongPress: (fn) => { cb.longPress = fn; }, // (worldPt, e) — держали палец на месте, e.clientX/Y для позиционирования UI
      // смена обработчика посреди тяги: "end" прежнему уже не придёт — снимаем его слои сами
      setDragHandler: (fn) => { if (dragMoved && cb.dragDone) cb.dragDone(true); dragHandler = fn || null; dragMoved = false; },
      onDragDone: (fn) => { cb.dragDone = fn; }, // (aborted) — тяга закончилась или оборвана
      onDragStart: (fn) => { cb.dragStart = fn; },   // перед "start" обработчика тяги
      onDragBegin: (fn) => { cb.dragBegin = fn; },   // обработчик взял объект (не пан) — тяга пошла
      onDragCancel: (fn) => { cb.dragCancel = fn; }, // тягу оборвала система (pointercancel) — откатить
      destroy: () => { stopMotion(); clearTimeout(commitTimer); if (ro) ro.disconnect(); if (wrap.parentNode) wrap.parentNode.removeChild(wrap); }
    };
  }

  EP.Plan = EP.Plan || {};
  EP.Plan.Canvas = { create: createCanvas, CFG };
})();
