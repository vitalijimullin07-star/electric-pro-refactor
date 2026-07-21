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
    breaker: "Автомат", rcd: "УЗО",
    soloHint: "Тап по линии — показать на плане только её (повторный тап или ✕ шторки — вернуть все). 👁 — скрыть линию.",
    soloAll: "Показать все линии",
    unroutedToast: (n) => `Без трассы: ${n} — нет магистрали до их комнаты`,
    unroutedBanner: (n) => `⚠ Без трассы: ${n} точ. — не нашлась магистраль (⇉) до их комнаты. Нарисуйте направление и нажмите «Построить» ещё раз.`,
    buildConfirmTitle: "Перед трассировкой",
    buildConfirmText: "Между комнатами трасса идёт ТОЛЬКО по нарисованной магистрали (⇉) — прямого пути через случайную стену больше нет (меньше лишних проходок). Убедитесь, что магистраль нарисована до КАЖДОЙ комнаты, где есть точки — иначе трассы в ней не построятся.",
    buildConfirmGo: "✓ Построить", buildConfirmBack: "‹ Назад"
  };

  const esc = (s) => String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const core = () => EP.Plan.Core;
  const G = () => EP.Plan.Geometry;
  const rooms = () => EP.Plan.Rooms;

  const isJunction = (el) => el.type === "junction";
  const isPoint = (el) => el.status !== "existing" && el.type !== "junction";
  // Слаботочка сети (интернет/ТВ/видеонаблюдение) — те же слои, что и в plan-calc.js
  // LV_LAYERS (для штроб/маркировки кабеля); здесь своя копия — модуль грузится
  // раньше plan-calc.js в index.html, общий экспорт не переиспользуем.
  const isLvLayer = (layer) => layer === "lv" || layer === "tv" || layer === "cctv";

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

  // ---- магистраль трасс (p.guides): нарисованное ПРИОРИТЕТНОЕ направление ----
  // Пользователь рисует полупрозрачную полилинию (режим ⇉) — МЕЖкомнатные прогоны
  // автотрассировки идут ПО ней (от точки — перпендикулярное «колено» к магистрали,
  // по магистрали, колено к цели), вместо прежнего перехода по прямой a→b, который
  // на реальной квартире давал «кашу» пересекающихся линий (репорт пользователя со
  // скриншотом). ВНУТРИ одной комнаты магистраль не применяется — там прежний обход
  // по контуру с отступом (routeOff). Гильзы через стены на пути магистрали считает
  // общий polylineCrossings по итоговому пути — отдельной логики не потребовалось.
  const GUIDE_SNAP_MAX = 800; // см: дальше проекции — магистраль «не про эту трассу»
  // Узел графа магистралей — точки БЛИЖЕ этого расстояния считаются одним и тем же
  // стыком (объединяет: (1) РАЗНЫЕ магистрали, нарисованные раздельно, но касающиеся в
  // одной точке — Т/Ш-форма из нескольких заходов в ⇉; (2) ретрейс одной и той же точки
  // ВНУТРИ одной магистрали — Т-форма, нарисованная ОДНИМ непрерывным росчерком через
  // центр туда и обратно). 15см — с запасом покрывает шаг сетки (gridStep=10) и
  // cornerSnapCm=20 привязки при рисовании, но не сольёт две реально разные комнаты.
  const GUIDE_MERGE_EPS = 15;
  // Какие магистрали РЕАЛЬНО применились в текущем прогоне build()/buildIncremental() —
  // чтобы hideGuides() прятал ТОЛЬКО их (фикс №1 аудита: раньше пряталась любая
  // нарисованная магистраль безусловно, даже если она далеко/вырождена и не участвовала
  // в трассировке — пользователь не мог понять, сработала ли она). null вне build() —
  // тогда guideRoute() ничего не помечает (например, при замере длины в chainFromPanel
  // или в resetRouteToAuto), а hideGuides() при null сохраняет прежнее поведение.
  let usedGuideIds = null;
  // Сколько точек/распаек остались БЕЗ трассы после последнего build()/buildIncremental()
  // (см. инвариант buildPath: между комнатами без магистрали путь не строится) — читает
  // sheet() для баннера-предупреждения и toast после явного нажатия «Построить».
  let lastUnrouted = 0;
  // перпендикулярный заход: к горизонтальному участку магистрали подходим вертикально
  // (и наоборот) — примыкание всегда прямым углом, как просил пользователь
  function guideKnee(pt, proj, segA, segB) {
    const horiz = Math.abs(segB.x - segA.x) >= Math.abs(segB.y - segA.y);
    return horiz ? { x: proj.x, y: pt.y } : { x: pt.x, y: proj.y };
  }
  // боковой разнос трасс РАЗНЫХ линий (QF), идущих по ОДНОЙ магистрали — та же логика
  // «+2см на каждую следующую линию», что и у обычной контурной трассировки (routeOff),
  // но БЕЗ базовых 15см: первая линия идёт ПРЯМО по нарисованной магистрали (это и есть
  // «рекомендуемое направление» пользователя), базовый отступ от стены тут неуместен —
  // магистраль не стена.
  const guideLaneOff = (p, circuitId) => {
    const idx = circuitIdx(p, circuitId);
    return idx > 0 ? Math.min(idx, 10) * 2 : 0;
  };
  // нормаль отрезка ФИКСИРОВАННОЙ ориентации относительно порядка (a->b) — трассы, идущие
  // по одному и тому же ребру графа в РАЗНЫЕ стороны, всё равно должны разъезжаться в одну
  // и ту же физическую сторону (параллельный веер), а не в разные
  function guideSegNormal(sA, sB) {
    const len = Math.hypot(sB.x - sA.x, sB.y - sA.y) || 1;
    return { x: -(sB.y - sA.y) / len, y: (sB.x - sA.x) / len };
  }
  // ---- граф магистралей (Т/Ш/Г-формы) ----
  // Раньше guideRoute искал ОДНУ «лучшую» магистраль целиком и брал кусок её точек между
  // двумя индексами — это ломалось на форме сложнее прямой линии: (1) если Т/Ш нарисована
  // ОДНИМ росчерком с повтором центральной точки, путь между двумя «плечами» тупо включал
  // ВСЕ точки массива между ними, включая лишний крюк по «ножке» туда-обратно; (2) если
  // Т/Ш нарисована НЕСКОЛЬКИМИ отдельными магистралями, касающимися в одной точке — путь
  // мог использовать только ОДНУ из них целиком, вторая половина шла напрямую без учёта
  // геометрии (репорт пользователя со скриншотом — трассы зря ныряли по «ножке» Т и
  // рвались на стыке). Теперь ВСЕ магистрали этажа собираются в ОДИН граф (общие/близкие
  // точки — общий узел, см. GUIDE_MERGE_EPS), путь ищется кратчайшим по графу (Дейкстра) —
  // лишняя ветка просто не выбирается (её длина только добавляла бы пути), а несколько
  // магистралей, стыкующихся в узле, естественно продолжают друг друга.
  //
  // ВАЖНОЕ ДОПОЛНЕНИЕ (найдено ПО РЕАЛЬНОМУ ПРОЕКТУ пользователя — экспорт JSON до/после
  // build(), 2 из 3 нарисованных магистралей остались неиспользованными): первая версия
  // графа сливала в общий узел только ВЕРШИНЫ разных магистралей между собой (concом
  // магистрали к концу другой) — но пользователь нарисовал длинный коридор ОДНИМ прямым
  // отрезком (2 точки), а затем ОТДЕЛЬНЫЕ короткие «ножки» в комнаты, конец которых
  // упирается НЕ в конец коридора, а в его СЕРЕДИНУ (естественный способ нарисовать
  // ответвление от уже нарисованного длинного коридора, не обязательно от самого его
  // кончика). Раз у коридора нет СВОЕЙ вершины в этой точке — старый nodeAt() никогда не
  // сливал их, ножка оставалась изолированным «островом» графа, недостижимым от коридора.
  // Фикс: buildGuideGraph теперь СНАЧАЛА собирает все вершины ВСЕХ магистралей разом
  // (anchors), затем для КАЖДОГО сырого отрезка ищет, какие anchor-точки лежат НА нём
  // (closestOnSeg .d <= GUIDE_MERGE_EPS, включая его собственные концы) — и РЕЖЕТ отрезок
  // на под-рёбра в этих точках. Место разреза становится настоящим узлом графа, и
  // соседняя магистраль, чья вершина туда попала, дедуплицируется в ТОТ ЖЕ узел обычным
  // nodeAt (её собственный конец — тоже anchor, попадает в тот же радиус). Работает и для
  // прежнего случая конец-к-концу (он просто частный случай: anchor совпадает с уже
  // имеющейся вершиной отрезка, t=0 или t=1, ничего не меняется).
  function buildGuideGraph(guides) {
    const rawSegs = [];
    guides.forEach((gd) => {
      const pts = gd.points || [];
      for (let i = 0; i < pts.length - 1; i++) {
        if (G().dist(pts[i], pts[i + 1]) < 0.5) continue; // вырожденный (нулевой длины)
        rawSegs.push({ a: pts[i], b: pts[i + 1], gdId: gd.id });
      }
    });
    if (!rawSegs.length) return { nodes: [], edges: [] };
    const anchors = [];
    rawSegs.forEach((s) => { anchors.push(s.a); anchors.push(s.b); });
    const nodes = [];
    const nodeAt = (pt) => {
      for (let i = 0; i < nodes.length; i++) if (G().dist(nodes[i], pt) <= GUIDE_MERGE_EPS) return i;
      nodes.push({ x: pt.x, y: pt.y });
      return nodes.length - 1;
    };
    const edges = [];
    rawSegs.forEach((s) => {
      const ts = new Set([0, 1]); // концы отрезка — всегда точки разреза
      anchors.forEach((p) => {
        const cl = G().closestOnSeg(p, s.a, s.b);
        if (cl.d <= GUIDE_MERGE_EPS) ts.add(cl.t);
      });
      const sorted = Array.from(ts).sort((x, y) => x - y);
      for (let i = 0; i < sorted.length - 1; i++) {
        const t0 = sorted[i], t1 = sorted[i + 1];
        const p0 = { x: s.a.x + (s.b.x - s.a.x) * t0, y: s.a.y + (s.b.y - s.a.y) * t0 };
        const p1 = { x: s.a.x + (s.b.x - s.a.x) * t1, y: s.a.y + (s.b.y - s.a.y) * t1 };
        if (G().dist(p0, p1) < 0.5) continue; // вырожденный кусок (совпавшие точки разреза)
        const ai = nodeAt(p0), bi = nodeAt(p1);
        if (ai === bi) continue;
        edges.push({ a: ai, b: bi, gdId: s.gdId, len: G().dist(nodes[ai], nodes[bi]) });
      }
    });
    return { nodes, edges };
  }
  // ближайшая проекция точки на ЛЮБОЙ отрезок графа (перебор рёбер). roomFilter (опц.) —
  // предикат по проекции: если задан, СНАЧАЛА ищем ближайшую проекцию СРЕДИ ТЕХ, что
  // проходят фильтр (обычно «лежит в той же комнате, что и точка a»), и берём её ДАЖЕ
  // если она дальше глобально ближайшей — иначе «в комнату» через ветку магистрали
  // соседней комнаты, только потому что её КОНЕЦ (ограниченный длиной ветки) численно
  // ближе по прямой, чем конец «своей» ветки — реальный баг, пойманный на проекте
  // пользователя (репорт «должно было зайти из 3 в 1, а зашло 3-2-1» — ветка в комнату 2
  // технически ближе к точке в комнате 1, чем её же собственная ветка в комнату 1, если
  // у обеих веток разная длина). Без фильтра (b — щит/цель без известной комнаты) —
  // прежнее поведение (глобально ближайшая проекция по всему графу).
  function nearestOnGraph(graph, pt, roomFilter) {
    let best = null, bestIn = null;
    graph.edges.forEach((e, ei) => {
      const cl = G().closestOnSeg(pt, graph.nodes[e.a], graph.nodes[e.b]);
      if (!best || cl.d < best.d) best = { d: cl.d, x: cl.x, y: cl.y, edgeI: ei };
      if (roomFilter && roomFilter({ x: cl.x, y: cl.y }) && (!bestIn || cl.d < bestIn.d)) {
        bestIn = { d: cl.d, x: cl.x, y: cl.y, edgeI: ei };
      }
    });
    return bestIn || best;
  }
  // кратчайший путь по графу между двумя проекциями (каждая — точка НА своём ребре, не
  // обязательно узел): если обе на ОДНОМ ребре — прямой отрезок между ними (тривиально
  // кратчайший, соседние узлы того же ребра не короче). Иначе — Дейкстра от узлов, к
  // которым примыкает ребро sProj, до узлов ребра tProj, с добавкой самих проекций как
  // концевых сегментов. Возвращает {points:[{x,y}…], segEdges:[edgeI…], edgeIds:Set<gdId>}:
  // segEdges[i] — КАКОМУ ребру графа принадлежит отрезок points[i]->points[i+1] (нужно
  // офсету ниже — знать канонический edgeI, а не просто координаты хопа).
  function shortestOnGraph(graph, sProj, tProj) {
    const sPt = { x: sProj.x, y: sProj.y }, tPt = { x: tProj.x, y: tProj.y };
    const gdOf = (ei) => graph.edges[ei].gdId;
    if (sProj.edgeI === tProj.edgeI) return { points: [sPt, tPt], segEdges: [sProj.edgeI], edgeIds: new Set([gdOf(sProj.edgeI)]) };
    const se = graph.edges[sProj.edgeI], te = graph.edges[tProj.edgeI];
    // от S до каждого узла своего ребра, от T — до каждого узла своего ребра
    const starts = [{ node: se.a, d: G().dist(sPt, graph.nodes[se.a]) }, { node: se.b, d: G().dist(sPt, graph.nodes[se.b]) }];
    const goals = new Map([[te.a, G().dist(tPt, graph.nodes[te.a])], [te.b, G().dist(tPt, graph.nodes[te.b])]]);
    // Дейкстра от узлов graph.nodes, старт — оба конца ребра S разом (виртуальный источник)
    const dist = new Array(graph.nodes.length).fill(Infinity);
    const prevNode = new Array(graph.nodes.length).fill(-1);
    const prevEdge = new Array(graph.nodes.length).fill(-1);
    const visited = new Array(graph.nodes.length).fill(false);
    starts.forEach((s) => { if (s.d < dist[s.node]) dist[s.node] = s.d; });
    for (let iter = 0; iter < graph.nodes.length; iter++) {
      let u = -1, best = Infinity;
      for (let i = 0; i < graph.nodes.length; i++) if (!visited[i] && dist[i] < best) { best = dist[i]; u = i; }
      if (u < 0) break;
      visited[u] = true;
      graph.edges.forEach((e, ei) => {
        let v = -1; if (e.a === u) v = e.b; else if (e.b === u) v = e.a; else return;
        const nd = dist[u] + e.len;
        if (nd < dist[v]) { dist[v] = nd; prevNode[v] = u; prevEdge[v] = ei; }
      });
    }
    // лучший узел-цель среди концов ребра T
    let bestGoal = null, bestGoalD = Infinity;
    goals.forEach((d, node) => { const total = dist[node] + d; if (total < bestGoalD) { bestGoalD = total; bestGoal = node; } });
    if (bestGoal == null || !isFinite(dist[bestGoal])) return null; // граф разорван (не должно случаться — все рёбра связаны построением)
    // восстанавливаем цепочку узлов И рёбер между ними от bestGoal к источнику
    const nodeChain = [bestGoal], edgeChain = [];
    let cur = bestGoal;
    while (prevNode[cur] >= 0) { edgeChain.push(prevEdge[cur]); cur = prevNode[cur]; nodeChain.push(cur); }
    nodeChain.reverse(); edgeChain.reverse(); // от источника к bestGoal
    const points = [sPt].concat(nodeChain.map((ni) => graph.nodes[ni]), [tPt]);
    const segEdges = [sProj.edgeI].concat(edgeChain, [tProj.edgeI]); // segEdges[i] для points[i]->points[i+1]
    const edgeIds = new Set(segEdges.map(gdOf));
    // чистим совпадающие соседние точки (нулевой длины хоп — напр. S ровно в узле графа),
    // синхронно прорежая segEdges (у выброшенной точки i её ВХОДНОЙ сегмент теряется —
    // оставшийся сегмент i+1 сам по себе корректно описывает связь с предыдущей точкой)
    const outPts = [points[0]], outEdges = [];
    for (let i = 1; i < points.length; i++) {
      if (G().dist(points[i], outPts[outPts.length - 1]) > 0.5) { outPts.push(points[i]); outEdges.push(segEdges[i - 1]); }
    }
    return { points: outPts, segEdges: outEdges, edgeIds };
  }
  // канонический (не зависящий от направления обхода КОНКРЕТНОЙ трассы) нормаль ребра —
  // считается по ФИКСИРОВАННОМУ порядку graph.nodes[e.a]->graph.nodes[e.b], который сам
  // граф получил из порядка точек магистрали при построении (buildGuideGraph) — одинаков
  // для любой трассы, использующей это ребро, независимо от того, в какую сторону она
  // по нему едет. Без этого разные трассы по одному ребру в разные стороны (a->b vs
  // b->a) получили бы ПРОТИВОПОЛОЖНЫЙ знак нормали и разъехались бы на разные физические
  // стороны линии вместо параллельного веера (конкретный баг, пойманный тестом).
  function edgeNormal(graph, edgeI) {
    const e = graph.edges[edgeI];
    return guideSegNormal(graph.nodes[e.a], graph.nodes[e.b]);
  }
  // применяет боковой офсет (guideLaneOff) ко ВСЕМУ пути графа: на каждой точке — митра
  // между каноническими нормалями соседних рёбер (если оба есть), иначе простой сдвиг
  // вдоль единственного соседнего ребра (концы S/T). Базовые точки/направления для
  // пересечения прямых — route-локальные (points[i-1]/points[i]/points[i+1], как раньше в
  // offsetJoint), но САМИ нормали — канонические (см. edgeNormal) — это и есть фикс: смена
  // знака направления обхода не может задеть нормаль, только n0/n1 определяют сторону
  // сдвига, а они фиксированы per-edge.
  function offsetGraphPath(graph, points, segEdges, off) {
    if (!off) return points;
    return points.map((pt, i) => {
      const n0 = i > 0 ? edgeNormal(graph, segEdges[i - 1]) : null;
      const n1 = i < segEdges.length ? edgeNormal(graph, segEdges[i]) : null;
      if (!n0 || !n1) {
        const n = n0 || n1;
        return { x: pt.x + n.x * off, y: pt.y + n.y * off };
      }
      const prev = points[i - 1], next = points[i + 1];
      const a0 = { x: prev.x + n0.x * off, y: prev.y + n0.y * off };
      const d0 = { x: pt.x - prev.x, y: pt.y - prev.y };
      const a1 = { x: pt.x + n1.x * off, y: pt.y + n1.y * off };
      const d1 = { x: next.x - pt.x, y: next.y - pt.y };
      const den = d0.x * d1.y - d0.y * d1.x;
      if (Math.abs(den) < 1e-6) return { x: pt.x + n1.x * off, y: pt.y + n1.y * off }; // параллельны — смещённый угол
      const t = ((a1.x - a0.x) * d1.y - (a1.y - a0.y) * d1.x) / den;
      return { x: a0.x + d0.x * t, y: a0.y + d0.y * t };
    });
  }
  // Где ветка магистрали (сырой, БЕЗ лан-офсета отрезок edgeA-edgeB) пересекает стену
  // комнаты `room`, + стандартный отступ routeOff(circuitId) от НЕЁ (та же математика,
  // что и у обычной перпендикулярной проходки) — просьба пользователя: «как только
  // магистраль прошла стену, линии шли 15см от стены, с каждой новой +2см, строго 90°»,
  // т.е. НЕ докуда физически дотянута ветка пользователем (она может уходить на середину
  // комнаты или обратно кончаться у самой стены — как нарисовано), а где она пересекает
  // стену, offset от ЭТОЙ точки. Раньше guideApproach ниже роутил ПРЯМО к дальнему концу
  // ветки (offset-скорректированному Ao) через pathInRoom — если ветка физически заходила
  // глубже в комнату, чем стандартный контурный отступ линии, contour-walk сначала доходил
  // до ближайшей точки контура, а затем делал ЛИШНИЙ прыжок В СТОРОНУ ОТ стены до самого
  // конца ветки — visible «скачок» на скриншоте пользователя.
  // offVec — боковой лан-офсет (guideLaneOff), УЖЕ применённый к этой ветке в остальном
  // трунке (Ao минус сырая точка) — складываем поверх перпендикулярного прыжка от стены,
  // а НЕ вместо него: ветка почти всегда пересекает стену ПЕРПЕНДИКУЛЯРНО ей (иначе вход
  // в комнату не имел бы смысла), значит offVec (вдоль НОРМАЛИ ветки) и прыжок от стены
  // (вдоль нормали СТЕНЫ) — две НЕЗАВИСИМЫЕ оси; без сложения соседние линии, разнесённые
  // по трунку на +2см каждая, съезжались бы обратно в одну точку у самой стены и потом
  // шли диагональю (не строго 90°) до следующего узла трунка.
  function guideWallEntry(p, edgeA, edgeB, room, circuitId, offVec) {
    const hits = G().polylineCrossings(p, [edgeA, edgeB], null)
      .map((c) => ({ c, w: G().wallById(p, c.wallId) })).filter((h) => h.w)
      .sort((x, y) => G().dist(edgeA, x.c) - G().dist(edgeA, y.c));
    if (!hits.length) return null;
    const own = hits.find((h) => h.w.roomId === room.id) || hits[0];
    const { c, w } = own;
    const len = w.len || 1;
    let nx = -(w.b.y - w.a.y) / len, ny = (w.b.x - w.a.x) / len;
    const probe = { x: c.x + nx * 2, y: c.y + ny * 2 };
    const pr = G().roomAt(p, probe);
    if (!pr || pr.id !== room.id) { nx = -nx; ny = -ny; }
    const jump = G().wallThOf(p, w) / 2 + routeOff(p, circuitId);
    const ov = offVec || { x: 0, y: 0 };
    return { x: c.x + nx * jump + ov.x, y: c.y + ny * jump + ov.y };
  }
  // заход трассы к магистрали (фикс №2 аудита): если точка `from` и точка входа на
  // магистраль `entry` в ОДНОЙ комнате (магистраль нарисована ВНУТРИ комнаты, напр.
  // студия/большая гостиная) — ведём по контуру комнаты с отступом (как обычная трасса
  // «внутри комнаты всё как обычно»), а не прямым коленом через середину. Если entry в
  // ДРУГОЙ комнате (типовой случай: магистраль в коридоре, точка в спальне) — прежнее
  // перпендикулярное колено `[from, knee, entry]` (заход через стену неизбежен, короткий).
  // Применяется ТОЛЬКО к стороне ТОЧКИ (не к стороне щита/цели), чтобы не менять уже
  // проверенное поведение коридорной магистрали у щита. edgeA/edgeB (опц.) — СЫРОЙ (без
  // лан-офсета) отрезок ветки графа, из которого получен `entry` — по нему ищем
  // guideWallEntry (см. выше); без них (вызов без 6/7 параметров) — старое поведение.
  function guideApproach(p, from, entry, circuitId, knee, edgeA, edgeB) {
    const straight = [{ x: from.x, y: from.y }, knee, { x: entry.x, y: entry.y }];
    const rf = roomNear(p, from), re = roomNear(p, entry);
    if (rf && re && rf.id === re.id) {
      const offVec = (edgeA && edgeB) ? { x: entry.x - edgeA.x, y: entry.y - edgeA.y } : null;
      const wallEntry = (edgeA && edgeB) ? guideWallEntry(p, edgeA, edgeB, rf, circuitId, offVec) : null;
      // Есть wallEntry (ветка реально пересекает стену этой комнаты) — доверяем ему БЕЗ
      // сравнения с прямым коленом: это и есть стандартный отступ 15+2n от стены, который
      // просил пользователь, а не эвристика «не уйти в обход всей комнаты» (она была нужна
      // для СТАРОГО entry — произвольной точки где-то в комнате, а не гарантированно
      // пристенной). pathInRoom сам выбирает короче направление вдоль периметра
      // (G.polyWalk), так что кругосветки здесь не бывает по построению.
      if (wallEntry) {
        const pr = pathInRoom(p, rf, from, wallEntry, circuitId);
        if (pr && pr.length >= 2) return pr;
      } else {
        const pr = pathInRoom(p, rf, from, entry, circuitId);
        if (pr && pr.length >= 2) {
          // контур берём ТОЛЬКО если он не сильно длиннее прямого колена — иначе точка у
          // самой магистрали (или свободный свет посреди комнаты) ушла бы в обход всей
          // комнаты вместо короткого примыкания. Порог 1.6× + 1см: хват по стене добавляет
          // немного длины (это ок, «как обычно»), но кругосветку по периметру отсекает.
          let contourLen = 0; for (let i = 1; i < pr.length; i++) contourLen += G().dist(pr[i - 1], pr[i]);
          const straightLen = G().dist(from, knee) + G().dist(knee, entry);
          if (contourLen <= straightLen * 1.6 + 1) return pr; // [from, …контур…, entry]
        }
      }
    }
    return straight;
  }
  function guideRoute(p, a, b, circuitId) {
    const gs = (G().floorScoped(p).guides || []).filter((gd) => (gd.points || []).length >= 2);
    if (!gs.length) return null;
    const graph = buildGuideGraph(gs);
    if (!graph.edges.length) return null;
    // Фильтр «проекция в ТОЙ ЖЕ комнате, что и точка» — см. инвариант nearestOnGraph:
    // предпочитаем ветку магистрали СВОЕЙ комнаты, даже если чужая ветка технически ближе
    // по прямой (иначе получаем лишний переход через соседнюю комнату вместо прямого).
    const ra = roomNear(p, a), rb = roomNear(p, b);
    const inRoom = (room) => room ? (proj) => { const r = G().roomAt(p, proj); return !!r && r.id === room.id; } : null;
    const pa = nearestOnGraph(graph, a, inRoom(ra)), pb = nearestOnGraph(graph, b, inRoom(rb));
    if (!pa || !pb || pa.d > GUIDE_SNAP_MAX || pb.d > GUIDE_SNAP_MAX) return null;
    if (G().dist({ x: pa.x, y: pa.y }, { x: pb.x, y: pb.y }) < 10) return null; // проекции сошлись — магистраль не нужна
    const sp = shortestOnGraph(graph, pa, pb);
    if (!sp) return null;
    const off = guideLaneOff(p, circuitId);
    const trunk = offsetGraphPath(graph, sp.points, sp.segEdges, off);
    const Ao = trunk[0], Bo = trunk[trunk.length - 1];
    // соседние точки трасс (для направления колена — горизонтальный/вертикальный подход)
    const segA = sp.points[1] || sp.points[0], segB = sp.points[sp.points.length - 2] || sp.points[sp.points.length - 1];
    // заход к точке — по контуру (если магистраль в той же комнате), иначе колено;
    // сторона щита (Bo -> knee -> b) остаётся прежней.
    const legA = guideApproach(p, a, Ao, circuitId, guideKnee(a, Ao, sp.points[0], segA), sp.points[0], segA);
    const path = legA.concat(trunk.slice(1), [guideKnee(b, Bo, segB, sp.points[sp.points.length - 1]), { x: b.x, y: b.y }]);
    if (usedGuideIds) sp.edgeIds.forEach((id) => usedGuideIds.add(id)); // фикс №1: магистраль(и) реально применились
    return path.filter((q, j) => j === 0 || G().dist(q, path[j - 1]) > 0.5);
  }
  // «пропадает после трассировки»: скрыть магистрали активного этажа с плана.
  // НЕ удаляем из модели — автоперестройка (AUTOREBUILD_ON) продолжает вести
  // трассы по ним; в режиме рисования ⇉ скрытые магистрали снова видны/удаляемы.
  // Фикс №1 аудита: если usedGuideIds — Set (идёт build()/buildIncremental()), прячем
  // ТОЛЬКО реально применённые магистрали; нетронутая (далёкая/вырожденная/лишняя)
  // остаётся видимой — пользователь сразу видит, что она не сработала. Вне build()
  // (usedGuideIds===null) — прежнее поведение (спрятать все), на всякий случай.
  function hideGuides(p) {
    (G().floorScoped(p).guides || []).forEach((gd) => {
      if (!usedGuideIds || usedGuideIds.has(gd.id)) gd.hidden = true;
    });
  }

  // общий построитель: та же комната — по контуру с отступом. РАЗНЫЕ комнаты (или хотя
  // бы одна сторона вне контура — щит в коридоре и т.п.) — ТОЛЬКО через нарисованную
  // магистраль (⇉, guideRoute). Просьба пользователя: прежняя «жадная» трассировка между
  // комнатами (к ближайшей по прямой стене, с рекурсивным обходом дальше) убрана целиком —
  // она давала «кашу»: разные независимые точки сверлили РАЗНЫЕ места одной и той же
  // стены вместо одного общего прохода, отсюда лишние проходки. Магистраль — ЕДИНСТВЕННЫЙ
  // путь наружу комнаты: она задаёт одно общее место перехода для всех точек, которые к
  // ней подключаются. Без магистрали, реально соединяющей комнаты источника и цели, путь
  // НЕ строится — buildPath возвращает null (см. addRoute/chainFromPanel: точка остаётся
  // без трассы, попадает в счётчик «Без трассы» после build()/buildIncremental() — вместо
  // того чтобы молча построить кривой прямой путь через случайную стену).
  function buildPath(p, fromEl, a, target, circuitId) {
    circuitId = circuitId || (fromEl && fromEl.circuitId) || null;
    const b = target.pos;
    const ra = fromEl ? roomOfEl(p, fromEl) : roomNear(p, a);
    const rb = (target.el ? roomOfEl(p, target.el) : null) || roomNear(p, b);
    if (ra && rb && ra.id === rb.id) {
      const path = pathInRoom(p, ra, a, b, circuitId);
      if (path) return path;
      return ortho(p, a, b, fromEl && fromEl.wallId || null); // контур не построился — крайний случай (вырожденная комната)
    }
    return guideRoute(p, a, b, circuitId); // разные комнаты — только по магистрали, иначе null
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
  // Роутер (panel.router:true, щит-хаб для сети): если в проекте есть хотя бы один
  // такой щит, ВСЕ точки слаботочной сети (интернет/ТВ/видеонаблюдение — isLvLayer)
  // трассируются ТОЛЬКО к нему (к ближайшему из router-щитов, если их несколько) —
  // просьба пользователя: «роутор, к которому идут абсолютно все отдельно линии
  // интернета/тв/пк». Без router-щита (routerPanels пуст) — поведение НЕ меняется
  // вообще (обратная совместимость со всеми существующими проектами): LV-точки, как
  // и раньше, идут к геометрически ближайшему щиту наравне с силовыми. Силовые/прочие
  // слои router-щит НЕ исключает из общего списка панелей — флаг влияет только на
  // выбор цели ДЛЯ LV-точек, не ограничивает сам щит в приёме силовых линий.
  // Трансформатор (panel.transformer:true): ВСЕ точки «Вывод 24В» (output24) идут
  // ТОЛЬКО к щиту с трансформатором (к ближайшему, если их несколько) — просьба
  // пользователя: «если слаботочный вывод 24в, то они все абсолютно все идут от щита
  // где указано (трансформаторы тока тут)». Приоритет ВЫШЕ роутера (output24 — слой
  // lv, без этой ветки его перехватил бы router-щит). Без transformer-щита — прежнее
  // поведение (output24 как обычная LV-точка: роутер, если есть, иначе ближайший щит).
  // Подключает el к БЛИЖАЙШЕМУ ДОСТИЖИМОМУ узлу из nodes (по прямой дистанции, как и
  // раньше — nearest()), но если ближайший по прямой оказался недостижим (buildPath
  // вернул null — нет магистрали между его комнатой и комнатой el), пробует следующий
  // по дальности, и так далее — иначе точка осталась бы без трассы вслепую, хотя более
  // дальний, но реально соединённый магистралью узел был доступен.
  function connectNearest(c, p, el, pos, nodes, circuitId, color) {
    const sorted = nodes.slice().sort((x, y) => dist(pos, x.pos) - dist(pos, y.pos));
    for (let i = 0; i < sorted.length; i++) {
      const rt = addRoute(c, p, el, pos, sorted[i], circuitId, color);
      if (rt) return rt;
    }
    return null;
  }
  function routeGroups(c, p, pointsToRoute, juncts, panels, extraConnected) {
    const routerPanels = panels.filter((pn) => pn.router);
    const trafoPanels = panels.filter((pn) => pn.transformer);
    // «род» точки — какая группа щитов её принимает: "24" (вывод 24В -> трансформатор),
    // "lv" (слаботочка -> роутер), "pw" (все остальные -> любой щит). Считается ОДНОЙ
    // функцией и для группируемых точек, и для extraConnected-узлов шлейфа — чтобы
    // шлейф 24В не мог пройти через силовую розетку и наоборот.
    const kindOf = (el) => (trafoPanels.length && el.type === "output24") ? "24"
      : (routerPanels.length && isLvLayer(el.layer)) ? "lv" : "pw";
    const groups = new Map();
    pointsToRoute.forEach((el) => {
      const pos = G().routeAnchor(p, el); // блок -> вход штробы (нужный подрозетник)
      if (!pos) return;
      const kind = kindOf(el);
      const key = (el.circuitId || "_none") + (kind === "pw" ? "" : ":" + kind);
      if (!groups.has(key)) groups.set(key, { circuitId: el.circuitId || null, kind, items: [] });
      groups.get(key).items.push({ el, pos });
    });
    groups.forEach((g) => {
      const targetPanels = g.kind === "24" ? trafoPanels : g.kind === "lv" ? routerPanels : panels;
      // распайки, доступные этой линии (своей QF; «без линии» — любые распайки)
      const J = g.circuitId ? juncts.filter((n) => n.circuitId === g.circuitId) : juncts.slice();
      if (J.length) {
        // есть распайка -> каждая точка к ближайшей распайке своей линии (или щиту/роутеру/трансформатору)
        g.items.forEach(({ el, pos }) => {
          connectNearest(c, p, el, pos, J.concat(targetPanels), el.circuitId, colorOf(p, el));
        });
      } else {
        // НЕТ распайки -> шлейф: щит/роутер [+ уже подключённые точки того же рода] -> точка -> точка
        const extra = extraConnected ? extraConnected.filter((n) =>
          (g.circuitId ? n.circuitId === g.circuitId : true) && kindOf(n.el) === g.kind
        ) : null;
        chainFromPanel(c, p, g.items, extra ? targetPanels.concat(extra) : targetPanels, g.circuitId);
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
      connectNearest(c, p, n.el, n.pos, panels.concat(closerJ), n.circuitId, colorOf(p, n.el));
    });
  }

  function build(opts) {
    const silent = !!(opts && opts.silent); // тихая автоперестройка: без тостов/шторки
    const c = core(), p = c.project;
    p.circuits = p.circuits || [];
    const fp = G().floorScoped(p); // щиты/точки/распайки ТОЛЬКО активного этажа — иначе
    // трасса на этаже без своего щита попыталась бы дотянуться до щита другого этажа
    // прямой линией по общим координатам (физически бессмысленно, до «стояка» — Этап 2).
    if (!(fp.panels || []).length) { if (!silent) rooms().toast(T.noPanel); return; }
    const points = (fp.elements || []).filter(isPoint);
    if (!points.length) { if (!silent) rooms().toast(T.noElems); return; }
    c.commit();
    // Чистим/перестраиваем ТОЛЬКО трассы АКТИВНОГО этажа — трассы других этажей
    // изолированы (своя геометрия) и не трогаются: иначе «Построить» на этаже 2
    // незаметно стирал бы уже готовые трассы этажа 1.
    const floors = p.floors, fid0 = floors && floors[0] && floors[0].id;
    const activeFid = p.activeFloorId || fid0;
    const onActiveFloor = (r) => (r.floorId || fid0) === activeFid;
    const savedManual = (p.routes || []).filter((r) => r.manual && onActiveFloor(r));
    p.routes = (p.routes || []).filter((r) => !onActiveFloor(r));

    // узлы: щиты + распайки (этого же этажа); router — флаг щита-хаба сети (LV-точки
    // предпочитают его, см. routeGroups)
    const panels = (fp.panels || []).map((pn) => ({ kind: "panel", id: pn.id, pos: { x: pn.x, y: pn.y }, router: !!pn.router, transformer: !!pn.transformer }));
    const juncts = (fp.elements || []).filter(isJunction).map((el) => ({ kind: "junction", id: el.id, el, circuitId: el.circuitId, pos: G().elemPoint(p, el) })).filter((n) => n.pos);

    // pos — ЕДИНАЯ точка отрисовки (та же, что у маркера): трасса доходит до точки,
    // а зазор между линиями QF заложен в самой точке (полоса по номеру линии).
    usedGuideIds = new Set(); // фикс №1: собираем реально применённые магистрали (guideRoute помечает)
    routeGroups(c, p, points, juncts, panels, null);
    routeJunctionsToPanel(c, p, juncts, juncts, panels);

    if (savedManual.length) restoreManualRoutes(p, savedManual);
    hideGuides(p); // прячем ТОЛЬКО применённые магистрали (см. usedGuideIds/hideGuides)
    usedGuideIds = null;
    const routedIds = new Set(p.routes.filter(onActiveFloor).map((r) => r.fromId));
    lastUnrouted = points.filter((el) => !routedIds.has(el.id)).length + juncts.filter((n) => !routedIds.has(n.id)).length;
    c.persist("routes-build");
    if (!silent) { if (lastUnrouted) rooms().toast(T.unroutedToast(lastUnrouted)); sheet(); }
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
    const fp = G().floorScoped(p); // только активный этаж — та же причина, что и в build()
    if (!(fp.panels || []).length) { if (!silent) rooms().toast(T.noPanel); return; }
    const points = (fp.elements || []).filter(isPoint);
    if (!points.length) { if (!silent) rooms().toast(T.noElems); return; }
    c.commit();

    // проходки уже существующих ручных трасс — актуализируем, путь НЕ трогаем
    (p.routes || []).forEach((rt) => { if (rt.manual) recomputeThroughWalls(p, rt); });

    const haveRoute = new Set((p.routes || []).map((r) => r.fromId));
    const newPoints = points.filter((el) => !haveRoute.has(el.id));
    const allJuncts = (fp.elements || []).filter(isJunction).map((el) => ({ kind: "junction", id: el.id, el, circuitId: el.circuitId, pos: G().elemPoint(p, el) })).filter((n) => n.pos);
    const newJuncts = allJuncts.filter((n) => !haveRoute.has(n.id));

    usedGuideIds = new Set(); // фикс №1: только магистрали, реально применённые к НОВЫМ точкам
    if (newPoints.length || newJuncts.length) {
      const panels = (fp.panels || []).map((pn) => ({ kind: "panel", id: pn.id, pos: { x: pn.x, y: pn.y }, router: !!pn.router, transformer: !!pn.transformer }));
      // уже проведённые точки — реальные узлы графа для шлейфа, не только щиты
      const existingPointNodes = points.filter((el) => haveRoute.has(el.id)).map((el) => {
        const pos = G().routeAnchor(p, el);
        return pos ? { kind: "point", id: el.id, el, circuitId: el.circuitId, pos } : null;
      }).filter(Boolean);
      routeGroups(c, p, newPoints, allJuncts, panels, existingPointNodes);
      routeJunctionsToPanel(c, p, allJuncts, newJuncts, panels);
    }

    hideGuides(p); // прячем ТОЛЬКО применённые к новым точкам (уже применённые ранее — уже скрыты)
    usedGuideIds = null;
    const routedIdsAfter = new Set(p.routes.map((r) => r.fromId));
    lastUnrouted = newPoints.filter((el) => !routedIdsAfter.has(el.id)).length + newJuncts.filter((n) => !routedIdsAfter.has(n.id)).length;
    c.persist("routes-build-inc");
    if (!silent) { if (lastUnrouted) rooms().toast(T.unroutedToast(lastUnrouted)); sheet(); }
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
    rt.points = buildPath(p, fromEl, a, target, rt.circuitId);
    rt.manual = false;
    recomputeThroughWalls(p, rt);
    c.persist("route-reset");
  }

  // хит-тест по уже построенным трассам (для ручного редактирования, plan-rooms.js)
  function routeAt(p, w, maxD) {
    let best = null;
    (G().floorScoped(p).routes || []).forEach((rt) => {
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
  const AUTOREBUILD_ON = { "elem-move": 1, "room-reshape": 1, "room-merge": 1, "wall-th": 1, "wall-mat": 1, "beam-move": 1, "beam-w": 1, "panel-move": 1, "panel-router": 1, "panel-trafo": 1, "opening-move": 1 };
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
  // Фикс №4 аудита: метрика выбора звена — РЕАЛЬНАЯ длина трассы (buildPath), а не
  // прямая евклидова дистанция. Прямая могла соединить точки, между которыми путь
  // физически идёт в обход стены (крестящиеся хопы, «каша»); реальная длина это
  // учитывает и попутно делает шлейф магистраль-осведомлённым (buildPath уже знает
  // о guideRoute). buildPath чистая (без мутаций) — безопасно звать для замера; memo
  // по паре id, чтобы не пересчитывать один и тот же кандидат на каждой итерации.
  // Для БОЛЬШИХ цепей (> CHAIN_LEN_MAX точек) — прежняя прямая дистанция, чтобы не
  // ловить O(n²·buildPath) на реально длинных линиях.
  const CHAIN_LEN_MAX = 18;
  function chainFromPanel(c, p, items, panels, circuitId) {
    const connected = panels.slice(); // {kind:'panel', pos}
    const rest = items.slice();
    const useLen = rest.length <= CHAIN_LEN_MAX;
    const memo = new Map();
    const metric = (fromEl, a, cn) => {
      if (!useLen) return dist(a, cn.pos);
      const key = fromEl.id + "|" + (cn.id || ("@" + Math.round(cn.pos.x) + "_" + Math.round(cn.pos.y)));
      if (memo.has(key)) return memo.get(key);
      const target = { kind: cn.kind, id: cn.id, pos: cn.pos, el: cn.el };
      const save = usedGuideIds; usedGuideIds = null; // ЗАМЕР не должен помечать магистраль как использованную (фикс №1)
      const pts = buildPath(p, fromEl, a, target, circuitId);
      usedGuideIds = save;
      // buildPath может вернуть null (нет магистрали между комнатами source/target —
      // см. инвариант buildPath выше) — недостижимая пара, не участвует в выборе
      // ближайшего звена шлейфа.
      const L = pts ? (() => { let s = 0; for (let i = 1; i < pts.length; i++) s += dist(pts[i - 1], pts[i]); return s; })() : Infinity;
      memo.set(key, L);
      return L;
    };
    while (rest.length) {
      let best = null;
      rest.forEach((it, idx) => connected.forEach((cn) => {
        const d = metric(it.el, it.pos, cn);
        if (!best || d < best.d) best = { d, idx, cn };
      }));
      if (!best) break;
      const it = rest[best.idx];
      const rt = addRoute(c, p, it.el, it.pos, best.cn, circuitId, colorOf(p, it.el));
      // трасса реально построена (не Infinity/недостижимая пара) — только тогда точка
      // становится узлом для следующих звеньев шлейфа; иначе она осталась бы «фиктивно
      // подключённой» и следующие точки могли бы тянуться к несуществующему проводу.
      if (rt) connected.push({ kind: "point", id: it.el.id, el: it.el, pos: it.pos });
      rest.splice(best.idx, 1);
    }
  }

  // Возвращает созданный route, или null — если buildPath не смог построить путь
  // (разные комнаты без магистрали между ними, см. инвариант buildPath). В этом случае
  // точка остаётся БЕЗ трассы (попадает в счётчик «Без трассы», см. build()).
  function addRoute(c, p, fromEl, a, target, circuitId, color) {
    const pts = buildPath(p, fromEl, a, target, circuitId);
    if (!pts || pts.length < 2) return null;
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
    if (s.routeType === "floor") throughWalls = throughWalls.filter((cr) => !floorSkip(p, cr));
    rt.throughWalls = throughWalls;
    p.routes.push(rt);
    return rt;
  }

  // При трассировке ПО ПОЛУ гильза НЕ нужна там, где кабель физически идёт понизу без
  // сверления: (1) проём до пола на стене (дверь/раздвижная/балконная/«Проём», sill=0,
  // НЕ окно) — G.floorOpeningAt; (2) перемычка (балка kind:"lintel" — низ открыт, как
  // арка над проходом) — кабель идёт под ней. Сплошная перегородка (kind:"beam", остаток
  // общей стены после слияния комнат) — стена от пола до потолка, гильза НУЖНА, её
  // floorSkip НЕ пропускает. По потолку floorSkip не применяется вовсе — там любое
  // пересечение стены/перегородки/перемычки сверлится (см. фильтр только при "floor").
  function floorSkip(p, cr) {
    if (G().floorOpeningAt(p, cr.wallId, cr)) return true;
    const s = String(cr.wallId || "");
    if (s.slice(0, 5) === "beam:") {
      const bm = (p.beams || []).find((b) => "beam:" + b.id === s);
      if (bm && bm.kind === "lintel") return true;
    }
    return false;
  }

  // Пересчитывает ТОЛЬКО проходки (throughWalls) уже существующей трассы по её ТЕКУЩИМ
  // points — вызывается после ручной правки (тяга излома / разворот угла в plan-rooms.js),
  // САМИ points НЕ трогает (иначе стёрла бы ручную правку) — только пересчитывает, где
  // путь теперь пересекает стены, той же логикой (G.polylineCrossings), что и авто-сборка.
  function recomputeThroughWalls(p, rt) {
    const fromEl = (p.elements || []).find((e) => e.id === rt.fromId);
    let throughWalls = G().polylineCrossings(p, rt.points, (fromEl && fromEl.wallId) || null);
    if (p.settings.routeType === "floor") throughWalls = throughWalls.filter((cr) => !floorSkip(p, cr));
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
  // Выпуск кабеля на разделку/подключение — просьба пользователя: «выпуск кабеля из
  // подрозетников… длину вывода из стены любого кабеля, и так же в распред коробках…
  // запас в щите на расключение». Считается ОДИН раз на каждый хоп (route), как и
  // pointVert — по типу СВОЕГО источника (fromEl): обычная точка — cableStubPoint,
  // распайка — cableStubJunction (там разделка нескольких кабелей сразу, запас больше).
  // Если хоп доходит до щита (r.toPanel) — ДОПОЛНИТЕЛЬНО cableStubPanel (расключение в
  // щите нужно НЕЗАВИСИМО от того, что стоит на другом конце). Используется ТОЛЬКО там,
  // где считается сам метраж материала (calcByRoutes/perCircuit) — «Кабель по трассам»
  // (lengths() ниже) остаётся ЧИСТОЙ длиной трассы без запаса/выпуска, как и раньше.
  function cableStub(p, fromEl, r) {
    const s = p.settings;
    const base = (fromEl && fromEl.type === "junction")
      ? (s.cableStubJunction != null ? s.cableStubJunction : 30)
      : (s.cableStubPoint != null ? s.cableStubPoint : 20);
    return base + (r.toPanel ? (s.cableStubPanel != null ? s.cableStubPanel : 50) : 0);
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

    const solo = rooms().soloCircuitId ? rooms().soloCircuitId() : null;
    const linesHtml = (circuits.length || st.byCircuit._none)
      ? `<div class="ep-plan-srow"><b>${T.lines}</b>${solo ? `<span class="ep-plan-flex"></span><button type="button" class="ep-plan-mini ep-clickable" data-prt-soloall>${T.soloAll}</button>` : ""}</div>` +
        `<div class="ep-plan-srow ep-plan-hintrow">${T.soloHint}</div>` +
        circuits.map((c) => `<div class="ep-plan-lineRow${solo === c.id ? " is-solo" : ""}${c.hidden ? " is-hidden" : ""}">
            <button type="button" class="ep-plan-lineName ep-clickable" data-prt-solo="${esc(c.id)}">
              <span class="ep-plan-cdot" style="background:${esc(c.color)}"></span><b>${esc(c.name)}</b></button>
            <span class="ep-plan-flex"></span>
            <span>${st.byCircuit[c.id] ? G().fmtLen(st.byCircuit[c.id]) : "—"}</span>
            <button type="button" class="ep-plan-mini ep-clickable" data-prt-hide="${esc(c.id)}" aria-label="Скрыть/показать линию">${c.hidden ? "🚫" : "👁"}</button>
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
        <button type="button" class="ep-plan-chip ep-clickable ${p.settings.gofraCeil === false ? "on" : ""}" data-prt-gofra="0">На стяжки</button>
      </div>` : `<div class="ep-plan-modehint">По полу: кабель в гофре ПНД + монтажная лента (расходка считается автоматически).</div>`}
      <div class="ep-plan-modehint">Линии идут по контуру комнаты с отступом, стены не пересекают — только перпендикулярной проходкой Ø${p.settings.sleeveD || 20} (${p.settings.routeType === "floor" || p.settings.gofraCeil !== false ? "в гофре — 1 кабель на гильзу" : "без гофры — макс. 2 кабеля на гильзу"}).</div>
      <div class="ep-plan-modehint">Тёплый пол — штроба в пол ${p.settings.tpChaseW || 50}×${p.settings.tpChaseH || 50} мм. Штроба к посту блока — в редакторе точки.</div>
      ${!juncN ? `<div class="ep-plan-modehint">${T.hintJ}</div>` : ""}
      ${lastUnrouted ? `<div class="ep-plan-modehint ep-plan-warnhint">${T.unroutedBanner(lastUnrouted)}</div>` : ""}
      ${p.routes.length ? `<div class="ep-plan-srow ep-plan-rlens"><span>${T.total}: <b>${G().fmtLen(st.total)}</b></span><span>${st.crossings} ${T.crossings}</span></div>` : ""}
      ${linesHtml}
      <div class="ep-plan-srow ep-plan-sbtns">
        <button type="button" class="btn btn-primary ep-clickable" data-prt-build>${T.build}</button>
        <button type="button" class="ep-plan-tbtn ep-plan-danger ep-clickable" data-prt-clear>${T.clear}</button>
      </div>`);
  }

  // Напоминание ПЕРЕД трассировкой (просьба пользователя): между комнатами трасса теперь
  // строится ТОЛЬКО по нарисованной магистрали (⇉) — если её не хватает до какой-то
  // комнаты, точки в ней останутся без трассы (см. lastUnrouted/баннер выше). Подсказка
  // показывается КАЖДЫЙ раз перед явным нажатием «Построить» (тот же паттерн под-вида
  // поверх шторки, что и sheetSetPrice/sheetConsumSettings — «‹ Назад» возвращает в sheet()).
  function sheetBuildConfirm() {
    rooms().openSheet(`<div class="ep-plan-srow"><b>🧭 ${T.buildConfirmTitle}</b></div>
      <div class="ep-plan-modehint">${T.buildConfirmText}</div>
      <div class="ep-plan-srow ep-plan-sbtns">
        <button type="button" class="btn btn-primary ep-clickable" data-prt-build-go>${T.buildConfirmGo}</button>
        <button type="button" class="ep-plan-tbtn ep-clickable" data-prt-build-back>${T.buildConfirmBack}</button>
      </div>`);
  }

  document.addEventListener("click", (e) => {
    if (!rooms() || !rooms().isActive()) return;
    const t = e.target; let b;
    if (t.closest("[data-plan-routes]")) return sheet();
    if (t.closest("[data-prt-build]")) return sheetBuildConfirm();
    if (t.closest("[data-prt-build-go]")) return buildIncremental();
    if (t.closest("[data-prt-build-back]")) return sheet();
    if (t.closest("[data-prt-clear]")) return clearRoutes();
    if (t.closest("[data-prt-close]")) { rooms().closeSheet(); return; }
    // solo линии (изоляция на плане): тап по имени линии — показать только её; ✕ шторки
    // или «Показать все» — вернуть. Хендлер только меняет view-состояние в Rooms + перерисовка.
    if ((b = t.closest("[data-prt-solo]"))) { rooms().setSoloCircuit(b.getAttribute("data-prt-solo")); sheet(); return; }
    if (t.closest("[data-prt-soloall]")) { rooms().clearSolo(); sheet(); return; }
    // видимость линии (👁) — circuit.hidden персистится в модели (в отличие от solo)
    if ((b = t.closest("[data-prt-hide]"))) {
      const c = core(), circ = (c.project.circuits || []).find((x) => x.id === b.getAttribute("data-prt-hide"));
      if (circ) { c.commit(); circ.hidden = !circ.hidden; c.persist("circuit-hide"); rooms().renderScene(); sheet(); }
      return;
    }
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
  EP.Plan.Routes = { build, buildIncremental, clearRoutes, lengths, sheet, pointVert, panelVert, hopVertMul, cableStub, buildPath, roomNear, routeAt, resetRouteToAuto, recomputeThroughWalls };
})();
