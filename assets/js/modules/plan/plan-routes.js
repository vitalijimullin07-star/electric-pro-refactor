/* Electric Pro V29 — Проект квартиры: трассы v3 (дерево + шлейф).
   Топология как на реальных планах, НЕ «звезда»:
     • есть распайка линии -> точки идут к своей распайке, распайки деревом к щиту;
     • НЕТ распайки у линии -> ШЛЕЙФ: щит -> розетка -> розетка (каждая к ближайшему
       уже подключённому узлу своей линии), а не каждая отдельно к щиту.
   Линии (QF) изолированы: QF1 отдельно от QF2. Цвет трассы = цвет линии/слоя.
   Спуск у щита считается один раз (та трасса, что реально доходит до щита). */
(() => {
  "use strict";
  window.EP = window.EP || {};

  const T = {
    title: "Трассы", build: "⚡ Построить", clear: "✕ Очистить",
    noPanel: "Поставь щит: режим 🔌, тип «Щ», тап по плану.",
    noElems: "Нет точек — добавь розетки/свет в режиме 🔌.",
    hintJ: "Совет: поставь «Распайку» (◇) — трассы пойдут через неё, а не каждая к щиту.",
    routeType: "Ведём по", ceiling: "потолку", floor: "полу",
    built: (n) => `Трасс: ${n}`, total: "Итого кабеля", crossings: "проходок",
    lines: "Линии (автоматы)", noLine: "Без линии", junctions: "Распаек",
    breaker: "Автомат", rcd: "УЗО"
  };

  const esc = (s) => String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const core = () => EP.Plan.Core;
  const G = () => EP.Plan.Geometry;
  const rooms = () => EP.Plan.Rooms;

  const isJunction = (el) => el.type === "junction";
  const isPoint = (el) => el.status !== "existing" && el.type !== "junction";

  function circuitOf(p, el) { return el.circuitId ? (p.circuits || []).find((c) => c.id === el.circuitId) : null; }
  function colorOf(p, el) {
    const c = circuitOf(p, el);
    if (c) return c.color;
    const l = (p.layers || []).find((x) => x.id === el.layer);
    return (l && l.color) || "#94a3b8";
  }
  const dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
  function nearest(pos, nodes, filter) {
    let best = null;
    nodes.forEach((n) => {
      if (filter && !filter(n)) return;
      const np = n.pos;
      const d = Math.hypot(pos.x - np.x, pos.y - np.y);
      if (!best || d < best.d) best = { d, node: n };
    });
    return best && best.node;
  }
  // Г-образная ортогональная линия между двумя точками; выбираем колено (Y-first / X-first),
  // которое пересекает МЕНЬШЕ стен — так трассы реже налезают друг на друга.
  function ortho(p, a, b, skipWall) {
    if (Math.abs(a.x - b.x) < 1 || Math.abs(a.y - b.y) < 1) return [{ x: a.x, y: a.y }, { x: b.x, y: b.y }];
    const e1 = [{ x: a.x, y: a.y }, { x: a.x, y: b.y }, { x: b.x, y: b.y }]; // сначала по Y
    const e2 = [{ x: a.x, y: a.y }, { x: b.x, y: a.y }, { x: b.x, y: b.y }]; // сначала по X
    if (!p || !G().polylineCrossings) return e1;
    const c1 = G().polylineCrossings(p, e1, skipWall || null).length;
    const c2 = G().polylineCrossings(p, e2, skipWall || null).length;
    return c2 < c1 ? e2 : e1;
  }

  // ---- трассировка v4: линии по КОНТУРУ комнаты с отступом от стены ----
  // Стена — физический объект: линия не идёт по стене и не пересекает её.
  // Путь = перпендикуляр от точки к контуру отступа (по умолчанию 15 см от
  // грани стены) → по контуру → перпендикуляр к цели (лампа/распайка/щит).
  // В другую комнату — ПЕРПЕНДИКУЛЯРНАЯ проходка через стену (гильза Ø20).
  // базовый отступ + по 2 см на каждую следующую линию (QF) — чтобы параллельные
  // трассы разных линий визуально не сливались в одну (просил пользователь:
  // QF1 15см, QF2 17см…). «Без линии» и первая QF — базовый отступ.
  function circuitIdx(p, circuitId) { return circuitId ? (p.circuits || []).findIndex((c) => c.id === circuitId) : -1; }
  const routeOff = (p, circuitId) => {
    const base = Math.max(5, Math.min(40, Number(p.settings.routeOffset) || 15));
    const idx = circuitIdx(p, circuitId);
    return idx > 0 ? base + Math.min(idx, 10) * 2 : base;
  };

  // Комната для точки: строгий point-in-polygon, а если мимо (щит/точка стоит
  // ПРЯМО на стене — центр щита может лежать чуть за осью стены) — берём
  // комнату ближайшей стены. Без этого щит у стены иногда не находил свою
  // комнату, buildPath получал ra/rb=null и падал на кривой ortho()-фолбэк.
  function roomNear(p, pos) {
    return G().roomAt(p, pos) || (() => {
      const hit = G().wallAt(p, pos, 60);
      return hit && hit.wall && hit.wall.roomId ? (p.rooms || []).find((r) => r.id === hit.wall.roomId) : null;
    })();
  }
  function roomOfEl(p, el) {
    if (el && el.wallId) { const rid = String(el.wallId).split(":")[0]; return (p.rooms || []).find((r) => r.id === rid) || null; }
    const q = (el && el.params) || {};
    return q.x != null ? roomNear(p, q) : null;
  }
  function contourOf(p, room, circuitId) { return room ? G().insetContour(p, room, routeOff(p, circuitId)) : null; }

  // путь внутри ОДНОЙ комнаты: a → контур → по контуру → b
  function pathInRoom(p, room, a, b, circuitId) {
    const ct = contourOf(p, room, circuitId);
    if (!ct) return null;
    const ca = G().closestOnPoly(ct, a), cb = G().closestOnPoly(ct, b);
    if (!ca || !cb) return null;
    const walk = G().polyWalk(ct, ca, cb);
    const path = [{ x: a.x, y: a.y }].concat(walk, [{ x: b.x, y: b.y }]);
    return path.filter((q, j) => j === 0 || G().dist(q, path[j - 1]) > 0.5);
  }

  // общий построитель: та же комната — по контуру; другая — через перпендикулярные проходки
  function buildPath(p, fromEl, a, target, depth, circuitId) {
    depth = depth || 0;
    circuitId = circuitId || (fromEl && fromEl.circuitId) || null;
    const b = target.pos;
    const ra = fromEl ? roomOfEl(p, fromEl) : roomNear(p, a);
    const rb = (target.el ? roomOfEl(p, target.el) : null) || roomNear(p, b);
    if (ra && rb && ra.id === rb.id) {
      const path = pathInRoom(p, ra, a, b, circuitId);
      if (path) return path;
    } else if (ra && rb && depth < 4) {
      // первая стена на прямой a→b — точка проходки, переход строго перпендикулярно стене
      const hits = G().polylineCrossings(p, [a, b], fromEl && fromEl.wallId || null)
        .map((c) => ({ c, w: G().wallById(p, c.wallId), d: G().dist(a, c) }))
        .filter((h) => h.w).sort((x, y) => x.d - y.d);
      if (hits.length) {
        const { w } = hits[0];
        let c = hits[0].c, viaOpening = false;
        // Пол: приоритет — если на этой стене есть проём до пола (дверь/раздвижная/
        // балконная/проём, sill=0 — НЕ окно), ведём кабель прямо через него вместо
        // сверления новой гильзы (там уже физический разрыв стены). Берём ближайший
        // к «a» такой проём на найденной стене.
        if (p.settings.routeType === "floor") {
          const door = G().wallOpeningSpans(p, w).filter((o) => o.sill === 0)
            .map((o) => G().pointAtOffset(w, o.offset + o.width / 2))
            .sort((x, y) => G().dist(a, x) - G().dist(a, y))[0];
          if (door) { c = door; viaOpening = true; }
        }
        const len = w.len || 1;
        let nx = -(w.b.y - w.a.y) / len, ny = (w.b.x - w.a.x) / len;
        if ((b.x - a.x) * nx + (b.y - a.y) * ny < 0) { nx = -nx; ny = -ny; } // нормаль в сторону цели
        const jump = viaOpening ? (G().wallThOf(p, w) / 2 + 2) : (G().wallThOf(p, w) / 2 + routeOff(p, circuitId));
        const c1 = { x: c.x - nx * jump, y: c.y - ny * jump }; // по нашу сторону стены
        const c2 = { x: c.x + nx * jump, y: c.y + ny * jump }; // за стеной
        const legA = (G().roomAt(p, c1) === ra ? pathInRoom(p, ra, a, c1, circuitId) : null) || [a, c1];
        const legB = buildPath(p, null, c2, target, depth + 1, circuitId);
        const path = legA.concat(legB);
        return path.filter((q, j) => j === 0 || G().dist(q, path[j - 1]) > 0.5);
      }
    }
    return ortho(p, a, b, fromEl && fromEl.wallId || null); // запасной вариант
  }

  // ---- ручное редактирование трасс: тяга опорных точек / разворот угла (Слой 4.1) ----
  // Трасса с route.manual:true была подправлена рукой (enableRouteDrag/flipNearestCorner
  // в plan-rooms.js) — build() ниже НЕ перестраивает её заново, а сохраняет и
  // восстанавливает после полной перестройки, ЕСЛИ оба её конца (точка-источник и цель —
  // щит/распайка/следующее звено шлейфа) физически не сдвинулись с прошлого раза
  // (>1см — уже не совпадение округления). Если конец сдвинулся — ручная правка
  // считается устаревшей и точка просто перестраивается заново, как обычно (localized
  // инвалидация, а не полный сброс всех ручных трасс проекта).
  function anchorPos(p, id) {
    if (!id) return null;
    const pn = (p.panels || []).find((x) => x.id === id);
    if (pn) return { x: pn.x, y: pn.y };
    const el = (p.elements || []).find((x) => x.id === id);
    return el ? G().routeAnchor(p, el) : null;
  }
  function restoreManualRoutes(p, saved) {
    saved.forEach((old) => {
      if (!old.points || old.points.length < 2) return;
      const a = anchorPos(p, old.fromId);
      if (!a || dist(a, old.points[0]) > 1) return;
      if (old.toId) {
        const b = anchorPos(p, old.toId);
        if (!b || dist(b, old.points[old.points.length - 1]) > 1) return;
      }
      const idx = p.routes.findIndex((r) => r.fromId === old.fromId);
      if (idx >= 0) p.routes[idx] = old;
    });
  }

  // группирует точки по линии (QF) и строит их трассы: точки с доступной распайкой
  // своей линии — напрямую к ближайшей распайке/щиту; без распайки — шлейфом
  // (chainFromPanel). extraConnected — ДОПОЛНИТЕЛЬНЫЕ уже подключённые узлы для шлейфа
  // (используется buildIncremental(), чтобы новая точка могла лечь к уже проведённой
  // розетке, а не только к щиту) — build() передаёт null, поведение не меняется.
  function routeGroups(c, p, pointsToRoute, juncts, panels, extraConnected) {
    const groups = new Map();
    pointsToRoute.forEach((el) => {
      const pos = G().routeAnchor(p, el); // блок -> вход штробы (нужный подрозетник)
      if (!pos) return;
      const key = el.circuitId || "_none";
      if (!groups.has(key)) groups.set(key, { circuitId: el.circuitId || null, items: [] });
      groups.get(key).items.push({ el, pos });
    });
    groups.forEach((g) => {
      // распайки, доступные этой линии (своей QF; «без линии» — любые распайки)
      const J = g.circuitId ? juncts.filter((n) => n.circuitId === g.circuitId) : juncts.slice();
      if (J.length) {
        // есть распайка -> каждая точка к ближайшей распайке своей линии (или щиту)
        g.items.forEach(({ el, pos }) => {
          const target = nearest(pos, J.concat(panels));
          if (target) addRoute(c, p, el, pos, target, el.circuitId, colorOf(p, el));
        });
      } else {
        // НЕТ распайки -> шлейф: щит [+ уже подключённые точки] -> розетка -> розетка
        const extra = extraConnected ? (g.circuitId ? extraConnected.filter((n) => n.circuitId === g.circuitId) : extraConnected) : null;
        chainFromPanel(c, p, g.items, extra ? panels.concat(extra) : panels, g.circuitId);
      }
    });
  }
  // распайки -> дерево к щиту (juncstToRoute — какие именно достроить; allJuncts —
  // ПОЛНЫЙ список для поиска «более близкой к щиту распайки той же линии», включая
  // уже построенные — их позиция не меняется, использовать как опорные узлы безопасно)
  function routeJunctionsToPanel(c, p, allJuncts, juncstToRoute, panels) {
    const panelDist = (pos) => { const n = nearest(pos, panels); return n ? dist(pos, n.pos) : Infinity; };
    const js = allJuncts.map((n) => ({ n, d: panelDist(n.pos) }));
    juncstToRoute.forEach((n) => {
      const d = panelDist(n.pos);
      const closerJ = js.filter((x) => x.d < d - 1 && (!n.circuitId || x.n.circuitId === n.circuitId)).map((x) => x.n);
      const target = nearest(n.pos, panels.concat(closerJ));
      if (target) addRoute(c, p, n.el, n.pos, target, n.circuitId, colorOf(p, n.el));
    });
  }

  function build(opts) {
    const silent = !!(opts && opts.silent); // тихая автоперестройка: без тостов/шторки
    const c = core(), p = c.project;
    p.circuits = p.circuits || [];
    if (!(p.panels || []).length) { if (!silent) rooms().toast(T.noPanel); return; }
    const points = (p.elements || []).filter(isPoint);
    if (!points.length) { if (!silent) rooms().toast(T.noElems); return; }
    c.commit();
    const savedManual = (p.routes || []).filter((r) => r.manual);
    p.routes = [];

    // узлы: щиты + распайки
    const panels = (p.panels || []).map((pn) => ({ kind: "panel", id: pn.id, pos: { x: pn.x, y: pn.y } }));
    const juncts = (p.elements || []).filter(isJunction).map((el) => ({ kind: "junction", id: el.id, el, circuitId: el.circuitId, pos: G().elemPoint(p, el) })).filter((n) => n.pos);

    // pos — ЕДИНАЯ точка отрисовки (та же, что у маркера): трасса доходит до точки,
    // а зазор между линиями QF заложен в самой точке (полоса по номеру линии).
    routeGroups(c, p, points, juncts, panels, null);
    routeJunctionsToPanel(c, p, juncts, juncts, panels);

    if (savedManual.length) restoreManualRoutes(p, savedManual);
    c.persist("routes-build");
    if (!silent) sheet();
  }

  // ---- инкрементальная достройка: кнопка "⚡ Построить" — раньше звала build()
  // целиком, а он ВСЕГДА перестраивает С НУЛЯ все не-ручные трассы проекта (см.
  // комментарий выше про build()) — расставил новые розетки в одной комнате, нажал
  // «Построить» — и уже готовые трассы в СОВСЕМ других комнатах незаметно меняли форму
  // (баг, пойманный тем же способом — экспорт проекта до/после клика: 6 посторонних
  // трасс реально меняли путь, хотя их точки не двигались; отличие от «↺ Авто» в том,
  // что здесь это оказалось НЕ багом build() — build() детерминирован, — а ожидаемым
  // следствием того, что «Построить» полностью пересчитывает вообще всё). Пользователь
  // явно попросил другое поведение для ЭТОЙ кнопки: строить трассы ТОЛЬКО для точек/
  // распаек, у которых её ещё нет вообще; уже существующие НЕ-ручные трассы вообще не
  // трогает (даже проходки) — ручные (route.manual:true) трогает ТОЛЬКО как просил
  // пользователь дополнительно: recomputeThroughWalls (проходки актуализируются на
  // случай, если стены/комнаты вокруг успели измениться), сам путь НЕ пересчитывается.
  // Полный build() (перестройка ВООБЩЕ всех не-ручных трасс) остаётся — и ОБЯЗАН
  // оставаться — для AUTOREBUILD_ON и смены отступа/сечения штробы в настройках: там
  // геометрия ДЕЙСТВИТЕЛЬНО изменилась и старые трассы физически неточны, а не просто
  // «не нужно трогать». Полная перестройка всё ещё доступна пользователю через
  // «✕ Очистить» + «⚡ Построить» заново (для несуществующих трасс инкрементальная
  // сборка эквивалентна полной).
  function buildIncremental(opts) {
    const silent = !!(opts && opts.silent); // тихо — не открывать шторку «Трассы» (напр. поверх fullscreen развёртки)
    const c = core(), p = c.project;
    p.circuits = p.circuits || [];
    if (!(p.panels || []).length) { if (!silent) rooms().toast(T.noPanel); return; }
    const points = (p.elements || []).filter(isPoint);
    if (!points.length) { if (!silent) rooms().toast(T.noElems); return; }
    c.commit();

    // проходки уже существующих ручных трасс — актуализируем, путь НЕ трогаем
    (p.routes || []).forEach((rt) => { if (rt.manual) recomputeThroughWalls(p, rt); });

    const haveRoute = new Set((p.routes || []).map((r) => r.fromId));
    const newPoints = points.filter((el) => !haveRoute.has(el.id));
    const allJuncts = (p.elements || []).filter(isJunction).map((el) => ({ kind: "junction", id: el.id, el, circuitId: el.circuitId, pos: G().elemPoint(p, el) })).filter((n) => n.pos);
    const newJuncts = allJuncts.filter((n) => !haveRoute.has(n.id));

    if (newPoints.length || newJuncts.length) {
      const panels = (p.panels || []).map((pn) => ({ kind: "panel", id: pn.id, pos: { x: pn.x, y: pn.y } }));
      // уже проведённые точки — реальные узлы графа для шлейфа, не только щиты
      const existingPointNodes = points.filter((el) => haveRoute.has(el.id)).map((el) => {
        const pos = G().routeAnchor(p, el);
        return pos ? { kind: "point", id: el.id, el, circuitId: el.circuitId, pos } : null;
      }).filter(Boolean);
      routeGroups(c, p, newPoints, allJuncts, panels, existingPointNodes);
      routeJunctionsToPanel(c, p, allJuncts, newJuncts, panels);
    }

    c.persist("routes-build-inc");
    if (!silent) sheet();
  }

  // сброс конкретной трассы к авто-варианту (кнопка "↺ Авто" в sheetRoute) — пересчитывает
  // ТОЛЬКО путь ЭТОЙ трассы (те же fromId/toId — топология не меняется), а НЕ полный
  // build(): раньше звали build({silent:true}) целиком, а он ВСЕГДА перестраивает С НУЛЯ
  // все НЕ-ручные трассы проекта (p.routes=[] и заново), не только сброшенную — снаружи
  // это выглядело как «нажал на одну линию, а перетрассировались другие» (репорт
  // пользователя: любая другая уже построенная НЕ-ручная трасса, чья геометрия устарела
  // относительно текущего кода/состояния — что для build() нормально, restoreManualRoutes
  // хранит только manual:true — но пользователь этого не просил и не ожидал при клике
  // именно по ↺ Авто ОДНОЙ трассы). Здесь же — та же buildPath(), что и в build(), но
  // с fromEl/target, восстановленными из уже сохранённых rt.fromId/rt.toId/rt.toPanel
  // (сама связь узел->узел трассы уже определена раньше build()'ом и не пересматривается
  // здесь заново — только геометрия пути между теми же двумя концами).
  function resetRouteToAuto(routeId) {
    const c = core(), p = c.project;
    const rt = (p.routes || []).find((r) => r.id === routeId);
    if (!rt) return;
    const fromEl = (p.elements || []).find((e) => e.id === rt.fromId);
    if (!fromEl) return;
    const a = isJunction(fromEl) ? G().elemPoint(p, fromEl) : G().routeAnchor(p, fromEl);
    if (!a) return;
    let target = null;
    if (rt.toPanel) {
      const pn = (p.panels || []).find((x) => x.id === rt.toId);
      if (pn) target = { kind: "panel", id: pn.id, pos: { x: pn.x, y: pn.y } };
    } else {
      const toEl = (p.elements || []).find((e) => e.id === rt.toId);
      if (toEl) target = { kind: isJunction(toEl) ? "junction" : "point", id: toEl.id, pos: isJunction(toEl) ? G().elemPoint(p, toEl) : G().routeAnchor(p, toEl) };
    }
    if (!target || !target.pos) return;
    c.commit();
    rt.points = buildPath(p, fromEl, a, target, 0, rt.circuitId);
    rt.manual = false;
    recomputeThroughWalls(p, rt);
    c.persist("route-reset");
  }

  // хит-тест по уже построенным трассам (для ручного редактирования, plan-rooms.js)
  function routeAt(p, w, maxD) {
    let best = null;
    (p.routes || []).forEach((rt) => {
      const pts = rt.points || [];
      for (let i = 0; i < pts.length - 1; i++) {
        const cl = G().closestOnSeg(w, pts[i], pts[i + 1]);
        if (cl.d <= maxD && (!best || cl.d < best.d)) best = { d: cl.d, route: rt, pt: { x: cl.x, y: cl.y } };
      }
    });
    return best;
  }

  // ---- автоперестройка: геометрия сдвинулась (точка/стена/перегородка) —
  // ранее построенные трассы устарели бы молча (кривые длины/штробы в Расчёте).
  // Перестраиваем тихо, только если трассы уже были построены.
  const AUTOREBUILD_ON = { "elem-move": 1, "room-reshape": 1, "room-merge": 1, "wall-th": 1, "wall-mat": 1, "beam-move": 1, "beam-w": 1, "panel-move": 1, "opening-move": 1 };
  let rebuilding = false;
  if (core().onChange) {
    core().onChange((what) => {
      if (rebuilding || !AUTOREBUILD_ON[what]) return;
      const p = core().project;
      if (!p || !(p.routes || []).length) return;
      rebuilding = true;
      try { build({ silent: true }); } finally { rebuilding = false; }
    });
  }

  // шлейф от щита: каждая точка подключается к ближайшему уже подключённому узлу
  // (щиту или ранее подключённой розетке той же линии) — как реальная гирлянда.
  function chainFromPanel(c, p, items, panels, circuitId) {
    const connected = panels.slice(); // {kind:'panel', pos}
    const rest = items.slice();
    while (rest.length) {
      let best = null;
      rest.forEach((it, idx) => connected.forEach((cn) => {
        const d = dist(it.pos, cn.pos);
        if (!best || d < best.d) best = { d, idx, cn };
      }));
      if (!best) break;
      const it = rest[best.idx];
      addRoute(c, p, it.el, it.pos, best.cn, circuitId, colorOf(p, it.el));
      connected.push({ kind: "point", id: it.el.id, pos: it.pos });
      rest.splice(best.idx, 1);
    }
  }

  function addRoute(c, p, fromEl, a, target, circuitId, color) {
    const pts = buildPath(p, fromEl, a, target, 0, circuitId);
    const rt = c.model.newRoute(fromEl.layer, p.settings.routeType, pts, fromEl.id, target.id || null);
    rt.circuitId = circuitId || null;
    rt.color = color;
    rt.toPanel = target.kind === "panel"; // спуск у щита считаем один раз
    // сечение штробы: тёплый пол — в пол (50×50), остальное — стандарт (25×30), можно менять
    const s = p.settings;
    if (fromEl.layer === "warm") { rt.chaseW = s.tpChaseW || 50; rt.chaseH = s.tpChaseH || 50; rt.chaseFloor = true; }
    else { rt.chaseW = s.chaseW || 25; rt.chaseH = s.chaseH || 30; rt.chaseFloor = (s.routeType === "floor"); }
    let throughWalls = G().polylineCrossings(p, pts, fromEl.wallId || null);
    // Пол: крест пути с проёмом до пола (дверь и т.п.) — уже не «сверление», гильза
    // Ø20 туда не считается (см. приоритет проёмов в buildPath выше).
    if (s.routeType === "floor") throughWalls = throughWalls.filter((cr) => !G().floorOpeningAt(p, cr.wallId, cr));
    rt.throughWalls = throughWalls;
    p.routes.push(rt);
  }

  // Пересчитывает ТОЛЬКО проходки (throughWalls) уже существующей трассы по её ТЕКУЩИМ
  // points — вызывается после ручной правки (тяга излома / разворот угла в plan-rooms.js),
  // САМИ points НЕ трогает (иначе стёрла бы ручную правку) — только пересчитывает, где
  // путь теперь пересекает стены, той же логикой (G.polylineCrossings), что и авто-сборка.
  function recomputeThroughWalls(p, rt) {
    const fromEl = (p.elements || []).find((e) => e.id === rt.fromId);
    let throughWalls = G().polylineCrossings(p, rt.points, (fromEl && fromEl.wallId) || null);
    if (p.settings.routeType === "floor") throughWalls = throughWalls.filter((cr) => !G().floorOpeningAt(p, cr.wallId, cr));
    rt.throughWalls = throughWalls;
  }

  function clearRoutes() {
    const c = core();
    c.commit(); c.project.routes = []; c.persist("routes-clear");
    sheet();
  }

  // вертикали: спуск у точки (потолок/пол -> точка) и спуск у щита (считается один раз)
  function pointVert(p, el) {
    if (!el || el.type === "junction") return 0;
    // выключатель при разводке ПО ПОЛУ: линия идёт дальше на потолок (к лампе),
    // штроба у выключателя — на всю высоту, а не только до его собственной точки
    if (el.type === "switch" && p.settings.routeType === "floor") return p.settings.ceilingHeight;
    if (p.settings.routeType === "floor") return el.height || 0;
    return Math.max(0, p.settings.ceilingHeight - (el.height || 0));
  }
  // pn — необязательный конкретный щит (у него может быть своя высота, если её
  // подвинули в развёртке); без pn или если у него height не задан — общая
  // settings.panelHeight на проект (как раньше, обратная совместимость)
  function panelVert(p, pn) {
    const ph = (pn && pn.height != null) ? pn.height : p.settings.panelHeight;
    return p.settings.routeType === "floor" ? ph : Math.max(0, p.settings.ceilingHeight - ph);
  }
  // Без распайки на конце (обычная точка, не щит/распайка) кабель у ЭТОЙ точки
  // проходит штробу ДВАЖДЫ — вниз к посту и обратно вверх продолжать шлейф
  // дальше (нет коробки, которая приняла бы горизонтальную линию на месте).
  function hopVertMul(p, r) {
    if (r.toPanel) return 1;
    const target = (p.elements || []).find((e) => e.id === r.toId);
    return (target && target.type !== "junction") ? 2 : 1;
  }
  function lengths(p) {
    const byLayer = {}, byCircuit = {};
    let crossings = 0, total = 0;
    (p.routes || []).forEach((r) => {
      const el = (p.elements || []).find((e) => e.id === r.fromId);
      const pn = r.toPanel ? (p.panels || []).find((x) => x.id === r.toId) : null;
      const L = G().polylineLen(r.points) + pointVert(p, el) * hopVertMul(p, r) + (r.toPanel ? panelVert(p, pn) : 0);
      byLayer[r.layer] = (byLayer[r.layer] || 0) + L;
      const cid = r.circuitId || "_none";
      byCircuit[cid] = (byCircuit[cid] || 0) + L;
      total += L;
      crossings += (r.throughWalls || []).length;
    });
    return { byLayer, byCircuit, total, crossings };
  }

  function sheet() {
    const p = core().project;
    const st = lengths(p);
    const rt = p.settings.routeType;
    const juncN = (p.elements || []).filter(isJunction).length;
    const circuits = p.circuits || [];
    const breakers = EP.Plan.Core.DEFAULTS.breakers;

    const linesHtml = (circuits.length || st.byCircuit._none)
      ? `<div class="ep-plan-srow"><b>${T.lines}</b></div>` +
        circuits.map((c) => `<div class="ep-plan-lineRow">
            <span class="ep-plan-cdot" style="background:${esc(c.color)}"></span>
            <b>${esc(c.name)}</b>
            <span class="ep-plan-flex"></span>
            <span>${st.byCircuit[c.id] ? G().fmtLen(st.byCircuit[c.id]) : "—"}</span>
            <select data-prt-brk="${esc(c.id)}" class="ep-plan-sel">${breakers.map((b) => `<option value="${b}" ${c.breaker === b ? "selected" : ""}>${b}A</option>`).join("")}</select>
            <label class="ep-plan-chk"><input type="checkbox" data-prt-rcd="${esc(c.id)}" ${c.rcd ? "checked" : ""}>${T.rcd}</label>
            <button type="button" class="ep-plan-mini ep-plan-danger ep-clickable" data-prt-cdel="${esc(c.id)}">✕</button>
          </div>`).join("") +
        (st.byCircuit._none ? `<div class="ep-plan-lineRow"><span class="ep-plan-cdot" style="background:#94a3b8"></span>${T.noLine}<span class="ep-plan-flex"></span><span>${G().fmtLen(st.byCircuit._none)}</span></div>` : "")
      : "";

    rooms().openSheet(`<div class="ep-plan-srow"><b>🧵 ${T.title}</b><span>· ${T.built(p.routes.length)}</span>
        <span class="ep-plan-flex"></span><button type="button" class="ep-plan-mini ep-clickable" data-sheet-fs aria-label="Во весь экран">⛶</button><button type="button" class="ep-plan-mini ep-clickable" data-prt-close>✕</button></div>
      <div class="ep-plan-srow">${T.routeType}:
        <button type="button" class="ep-plan-chip ep-clickable ${rt === "ceiling" ? "on" : ""}" data-prt-rt="ceiling">${T.ceiling}</button>
        <button type="button" class="ep-plan-chip ep-clickable ${rt === "floor" ? "on" : ""}" data-prt-rt="floor">${T.floor}</button>
        <span class="ep-plan-flex"></span><span>${T.junctions}: <b>${juncN}</b></span>
      </div>
      <div class="ep-plan-srow ep-plan-s2">
        <label>Штроба Ш, мм<input type="number" inputmode="numeric" min="10" data-prt-chw value="${Math.round(p.settings.chaseW || 25)}"></label>
        <label>Штроба В, мм<input type="number" inputmode="numeric" min="10" data-prt-chh value="${Math.round(p.settings.chaseH || 30)}"></label>
        <label>Отступ от стены, см<input type="number" inputmode="numeric" min="5" max="40" data-prt-off value="${Math.round(p.settings.routeOffset || 15)}"></label>
      </div>
      <div class="ep-plan-srow">Соединители:
        ${[["gml", "Гильзы"], ["wago", "ВАГО"], ["siz", "СИЗ"]].map(([k, l]) => `<button type="button" class="ep-plan-chip ep-clickable ${(p.settings.connectorMode || "gml") === k ? "on" : ""}" data-prt-conn="${k}">${l}</button>`).join("")}
      </div>
      ${p.settings.routeType !== "floor" ? `<div class="ep-plan-srow">Монтаж по потолку:
        <button type="button" class="ep-plan-chip ep-clickable ${p.settings.gofraCeil !== false ? "on" : ""}" data-prt-gofra="1">В гофре</button>
        <button type="button" class="ep-plan-chip ep-clickable ${p.settings.gofraCeil === false ? "on" : ""}" data-prt-gofra="0">Без гофры</button>
      </div>` : ""}
      <div class="ep-plan-modehint">Линии идут по контуру комнаты с отступом, стены не пересекают — только перпендикулярной проходкой Ø${p.settings.sleeveD || 20} (макс. 2 кабеля в гильзу).</div>
      <div class="ep-plan-modehint">Тёплый пол — штроба в пол ${p.settings.tpChaseW || 50}×${p.settings.tpChaseH || 50} мм. Штроба к посту блока — в редакторе точки.</div>
      ${!juncN ? `<div class="ep-plan-modehint">${T.hintJ}</div>` : ""}
      ${p.routes.length ? `<div class="ep-plan-srow ep-plan-rlens"><span>${T.total}: <b>${G().fmtLen(st.total)}</b></span><span>${st.crossings} ${T.crossings}</span></div>` : ""}
      ${linesHtml}
      <div class="ep-plan-srow ep-plan-sbtns">
        <button type="button" class="btn btn-primary ep-clickable" data-prt-build>${T.build}</button>
        <button type="button" class="ep-plan-tbtn ep-plan-danger ep-clickable" data-prt-clear>${T.clear}</button>
      </div>`);
  }

  document.addEventListener("click", (e) => {
    if (!rooms() || !rooms().isActive()) return;
    const t = e.target; let b;
    if (t.closest("[data-plan-routes]")) return sheet();
    if (t.closest("[data-prt-build]")) return buildIncremental();
    if (t.closest("[data-prt-clear]")) return clearRoutes();
    if (t.closest("[data-prt-close]")) { rooms().closeSheet(); return; }
    if ((b = t.closest("[data-prt-conn]"))) {
      const c = core(); c.commit(); c.project.settings.connectorMode = b.getAttribute("data-prt-conn"); c.persist("routes-conn"); sheet(); return;
    }
    if ((b = t.closest("[data-prt-rt]"))) {
      const c = core(); c.commit(); c.project.settings.routeType = b.getAttribute("data-prt-rt"); c.persist("routes-rt"); sheet(); return;
    }
    if ((b = t.closest("[data-prt-gofra]"))) {
      const c = core(); c.commit(); c.project.settings.gofraCeil = b.getAttribute("data-prt-gofra") === "1"; c.persist("routes-gofra"); sheet(); return;
    }
    if ((b = t.closest("[data-prt-cdel]"))) {
      const c = core(), id = b.getAttribute("data-prt-cdel");
      c.commit();
      c.project.circuits = c.project.circuits.filter((x) => x.id !== id);
      (c.project.elements || []).forEach((el) => { if (el.circuitId === id) el.circuitId = null; });
      c.persist("circuit-del"); sheet(); return;
    }
  });
  document.addEventListener("change", (e) => {
    if (!rooms() || !rooms().isActive()) return;
    const t = e.target;
    if (t.getAttribute && t.getAttribute("data-prt-brk")) {
      const c = core(), circ = c.project.circuits.find((x) => x.id === t.getAttribute("data-prt-brk"));
      if (circ) { c.commit(); circ.breaker = Number(t.value) || 16; c.persist("circuit-brk"); }
    }
    if (t.getAttribute && t.getAttribute("data-prt-rcd")) {
      const c = core(), circ = c.project.circuits.find((x) => x.id === t.getAttribute("data-prt-rcd"));
      if (circ) { c.commit(); circ.rcd = !!t.checked; c.persist("circuit-rcd"); }
    }
    if (t.getAttribute && t.hasAttribute("data-prt-off")) {
      const c = core();
      c.commit();
      c.project.settings.routeOffset = Math.max(5, Math.min(40, Number(t.value) || 15));
      c.persist("route-offset");
      if ((c.project.routes || []).length) build(); // перестраиваем с новым отступом
      return;
    }
    if (t.getAttribute && (t.hasAttribute("data-prt-chw") || t.hasAttribute("data-prt-chh"))) {
      const c = core(), v = Math.max(10, Number(t.value) || 0);
      c.commit();
      if (t.hasAttribute("data-prt-chw")) c.project.settings.chaseW = v; else c.project.settings.chaseH = v;
      // применяем к уже построенным штробам стандартного сечения (не ТП)
      (c.project.routes || []).forEach((r) => { if (r.layer !== "warm") { r.chaseW = c.project.settings.chaseW; r.chaseH = c.project.settings.chaseH; } });
      c.persist("chase-size");
    }
  });

  EP.Plan = EP.Plan || {};
  EP.Plan.Routes = { build, buildIncremental, clearRoutes, lengths, sheet, pointVert, panelVert, hopVertMul, buildPath, roomNear, routeAt, resetRouteToAuto, recomputeThroughWalls };
})();
