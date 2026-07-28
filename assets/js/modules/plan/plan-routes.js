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
    qualityLbl: "Качество:", qFast: "Быстро", qPrecise: "Точно", qMax: "Максимум",
    qualityHint: "«Точно»/«Максимум» — тяжёлый просчёт в фоне (телефон считает 1-4 с, экран не подвисает): подбирается порядок полос линий и переклад проблемных трасс так, чтобы линии как можно меньше пересекались. Кнопка «⚡ Построить» и автоперестройка при переносе точек всегда работают в быстром режиме.",
    optimizeBtn: "✨ Оптимизировать",
    heavyStart: "Считаю в фоне… (экран не подвисает)",
    heavyStartN: (n) => `Считаю в фоне на ${n} ядрах — беру лучший вариант…`,
    precalcLbl: "Предрасчёт в фоне:", precalcOn: "Вкл", precalcOff: "Выкл",
    precalcHint: "Пока рисуешь, свободные ядра считают трассы и смету заранее — «✨ Оптимизировать» и шторки «Расчёт»/«Проверки» открываются мгновенно. Расходует батарею.",
    precalcHintReady: "✓ Вариант уже посчитан в фоне — «✨ Оптимизировать» применит его мгновенно.",
    precalcDone: (sc) => `Готово мгновенно (посчитано заранее). Пересечений линий: ${sc ? sc.crossings : "—"}, отверстий: ${sc ? sc.holes : "—"}`,
    heavyBusy: "Просчёт уже идёт — подожди результат.",
    heavyFail: "Фоновый просчёт недоступен — построил обычным способом.",
    heavyStale: "Проект изменился во время просчёта — результат отброшен, нажми ещё раз.",
    heavyDone: (sc, ms, it, cores) => `Готово за ${(ms / 1000).toFixed(1)}с (вариантов: ${it}${cores > 1 ? ", ядер: " + cores : ""}). Пересечений линий: ${sc ? sc.crossings : "—"}, отверстий: ${sc ? sc.holes : "—"}`,
    buildDone: (sc, ms) => `Трассы построены (${(ms / 1000).toFixed(1)}с). Пересечений линий: ${sc ? sc.crossings : "—"}, отверстий: ${sc ? sc.holes : "—"}`,
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
    buildConfirmGo: "✓ Построить", buildConfirmBack: "‹ Назад",
    suggestGuide: "✨ Предложить магистраль",
    suggestNone: "Не удалось предложить: нужна хотя бы одна комната, смежная с другими, и точки в комнатах.",
    suggestOk: (n) => `Черновик магистрали построен (${n} линий) — проверьте в режиме ⇉ и правьте как обычную`,
    noGuideHint: "Магистрали (⇉) нет — межкомнатные трассы не построятся. Нарисуйте её или нажмите «Предложить магистраль»."
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
  // ПОРЯДОК ПОЛОС линий. По умолчанию = порядок в p.circuits (QF1 ближе к стене, QF2 +2см…).
  // laneOrder (Map circuitId -> индекс) позволяет ПЕРЕСТАВИТЬ полосы, НЕ меняя порядок линий
  // в UI/смете — это ручка для оптимизатора: перестановка полос меняет, какие линии идут
  // ближе к стене на общих участках, а значит и число ПЕРЕСЕЧЕНИЙ линий между собой.
  let laneOrder = null;
  function setLaneOrder(map) { laneOrder = map || null; }
  function circuitIdx(p, circuitId) {
    if (!circuitId) return -1;
    if (laneOrder && laneOrder[circuitId] != null) return laneOrder[circuitId];
    return (p.circuits || []).findIndex((c) => c.id === circuitId);
  }
  // РАНЬШЕ был кап "×10 лэйнов" (Math.min(idx, 10)) — задуман, чтобы отступ не рос
  // безгранично на проектах с большим числом линий, но давал реальный баг: у ЛЮБОГО
  // проекта с 11+ линиями ВСЕ линии начиная с QF11 получали ОДИН И ТОТ ЖЕ отступ (кап
  // "залипал" на одном значении) — их трассы сливались без разноса вместо параллельного
  // веера (репорт пользователя: «не все трассы идут с отступом друг от друга»,
  // подтверждено тестом — 11-я/12-я/15-я линии давали identical offset). У реальных
  // квартирных проектов 15-20+ линий — обычное дело, кап срабатывал систематически, не
  // как редкий крайний случай. Убран целиком — отступ растёт линейно без ограничения;
  // если для очень большого числа линий отступ превысит размер комнаты, insetContour
  // сам возвращает null (см. её же проверку area>100), и buildPath уже умеет мягко
  // деградировать (guideRoute/ortho) — эта деградация СУЩЕСТВОВАЛА и раньше для других
  // причин (вырожденная комната), новый риск не появился.
  // ДОП. под-полоса ВНУТРИ одной линии (QF): «до клавиши» и «от клавиши до освещения» —
  // трассы ОДНОЙ линии, у них одинаковый offset по circuitIdx, и на общей стене они ложились
  // РОВНО друг на друга (репорт пользователя со скриншотом: «линии друг на друга наложились,
  // я думал до клавиши и от клавиши будут друг от друга 2 см»). curLane выставляет addRoute:
  // строит путь, проверяет наложение с уже построенными трассами и при необходимости
  // переносит ЭТУ трассу на следующую полосу (+2см). Модульная переменная, а не 7-й параметр
  // через buildPath→guideRoute→pathInRoom→contourOf (тот же приём, что usedGuideIds/
  // lastGuideTrunkShare) — иначе пришлось бы протаскивать её через пять функций.
  let curLane = 0;
  const routeOff = (p, circuitId) => {
    const base = Math.max(5, Math.min(40, Number(p.settings.routeOffset) || 15));
    const idx = circuitIdx(p, circuitId);
    return (idx > 0 ? base + idx * 2 : base) + curLane * 2;
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
  // Ниже этой доли «ствола» (участка ПО магистрали) в полной длине пути считаем, что
  // магистраль не работает как коридор — см. фикс крюка в buildPath. 0.25 с большим
  // запасом отделяет замеренный баг (0.11) от нормальной работы магистрали, где ствол —
  // основная часть пути.
  const GUIDE_TRUNK_MIN_SHARE = 0.25;
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
  // Раньше это было ЧИСЛО, и у него было две проблемы: (1) непонятно, КАКИЕ точки и
  // почему не построились — баннер сообщал только количество; (2) счётчик модульный и не
  // сбрасывался при смене проекта — открыл проект A с 2 неотрастрассированными, перешёл в
  // проект B, открыл шторку «Трассы» БЕЗ build() и видел «Без трассы: 2» про чужой
  // проект. Теперь это список {id, name, reason, projectId} + список сбрасывается при
  // открытии проекта и в «Очистить».
  let lastUnrouted = [];
  let lastUnroutedPid = null;
  // Точки, которым нужна трасса, но её нет — с ПРИЧИНОЙ (её видно в баннере шторки).
  // Причина определяется по тем же данным, на которых buildPath принимал решение:
  // нет комнаты у самой точки / нет щита-приёмника её рода / нет магистрали до её комнаты.
  function unroutedReason(p, el, panels) {
    const room = roomOfEl(p, el);
    if (!room) return "точка вне комнат — обведите это место комнатой";
    if (!panels.length) return "нет щита для её линии";
    const sameRoom = panels.some((pn) => { const r = roomNear(p, pn.pos); return r && r.id === room.id; });
    if (sameRoom) return "щит в этой же комнате, но контур трассировки не построился";
    const gs = (G().floorScoped(p).guides || []).filter((gd) => (gd.points || []).length >= 2);
    if (!gs.length) return "нет магистрали (⇉) — щит в другой комнате";
    return "магистраль не доходит до её комнаты";
  }
  function collectUnrouted(p, points, juncts, panels) {
    const routed = new Set((p.routes || []).map((r) => r.fromId));
    const TY = (EP.Plan.Elements && EP.Plan.Elements.TYPES) || {};
    const nameOf = (el) => {
      const t = TY[el.type] || {};
      const room = roomOfEl(p, el);
      return (t.label || t.name || el.type) + (room ? " · " + room.name : "");
    };
    const out = [];
    points.concat(juncts.map((n) => n.el)).forEach((el) => {
      if (!el || routed.has(el.id)) return;
      out.push({ id: el.id, name: nameOf(el), reason: unroutedReason(p, el, panels) });
    });
    lastUnrouted = out;
    lastUnroutedPid = p.id || null;
    return out;
  }
  // баннер актуален только для ТЕКУЩЕГО проекта (см. выше про протечку между проектами)
  function unroutedForSheet(p) { return (lastUnroutedPid && lastUnroutedPid === (p.id || null)) ? lastUnrouted : []; }
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
  // Тот же кап "×10" убран — см. подробное объяснение у routeOff выше (систематическое
  // слияние офсетов у 11+ линий, реальный баг на проектах с большим числом линий).
  const guideLaneOff = (p, circuitId) => {
    const idx = circuitIdx(p, circuitId);
    return (idx > 0 ? idx * 2 : 0) + curLane * 2;
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
  // Кэш собранного графа. buildGuideGraph — самая горячая функция трассировки: она
  // O(отрезки × вершины) (для каждого сырого отрезка перебирает ВСЕ вершины всех
  // магистралей, ища точки разреза), а звалась ЗАНОВО на каждый вызов guideRoute — то
  // есть на каждую трассу И на каждый замер-кандидат шлейфа. Измерено на 12 комнатах/
  // 84 точках/13 магистралях: 116 000 вызовов closestOnSeg (~1377 на трассу ≈ 4
  // пересборки графа), build() 292мс; с кэшем — 17 000 вызовов и 98мс (3× быстрее),
  // автоперестройка на перенос точки 178мс → 67мс (на слабом телефоне ~1.4с → ~0.5с).
  // ИНВАЛИДАЦИЯ — ПО СИГНАТУРЕ ГЕОМЕТРИИ, А НЕ ПО ССЫЛКЕ НА МАССИВ: p.guides мутируется
  // НА МЕСТЕ (push при рисовании новой магистрали, gd.hidden в hideGuides, filter при
  // «убрать все»), поэтому ссылка на массив НЕ меняется при добавлении магистрали.
  // Кэш по ссылке ломает ровно этот сценарий — «нарисовал магистраль и сразу строю» —
  // и это НЕ теоретический риск: первая (ссылочная) версия кэша уронила существующий
  // тест «другая комната: перпендикулярная проходка через стену», который делает
  // buildPath → push магистрали → buildPath на одном и том же массиве. Сигнатура ниже
  // ловит и добавление/удаление магистрали, и изменение любой её точки; стоит ~30
  // арифметических операций против 338 closestOnSeg, которые защищает. gd.hidden в
  // сигнатуру НЕ входит — на геометрию графа он не влияет (buildGuideGraph получает уже
  // отфильтрованный список, а скрытые магистрали продолжают работать, см. hideGuides).
  let graphCache = null;
  function guideSig(gs) {
    let s = gs.length + "|", sum = 0, n = 0;
    for (let i = 0; i < gs.length; i++) {
      const pts = gs[i].points || [];
      s += gs[i].id + ":" + pts.length + ";";
      for (let j = 0; j < pts.length; j++) { sum += pts[j].x * 31 + pts[j].y * 17; n++; }
    }
    return s + n + "|" + Math.round(sum * 100);
  }
  // ---- «линии рисуются прямо по стене» (репорт пользователя со скриншотом) ----
  // Магистраль (⇉) пользователь часто ведёт ВПЛОТНУЮ к стене или прямо по её оси (это
  // самый естественный ориентир на плане), а боковой веер линий (guideLaneOff, +2см на
  // каждую следующую QF) уходит вдоль КАНОНИЧЕСКОЙ нормали ребра — фиксированной по
  // порядку точек магистрали, т.е. вообще без оглядки на стены. Итог: часть линий (а если
  // нормаль смотрит в стену — то и весь пучок) ложится ВНУТРЬ тела стены. Воспроизведено
  // детектором (сэмплирование пути + проверка «внутри тела стены И ВДОЛЬ неё», чтобы не
  // путать с законной перпендикулярной проходкой): магистраль по оси стены — 2 трассы из
  // 8 внутри стены, до 5см глубины.
  // Фикс: у КАЖДОГО ребра графа своя пара {нормаль веера, базовый отвод от стены},
  // считается ОДИН РАЗ при сборке графа:
  //  · сторона веера выбирается так, чтобы линии уходили ОТ стены, а не в неё;
  //  · если само ребро лежит в теле стены (или ближе стандартного отступа к её грани) —
  //    ВЕСЬ пучок отводится на settings.routeOffset от грани, как обычная трасса в комнате.
  // Рёбра, ПЕРЕСЕКАЮЩИЕ стену (ветка, входящая в комнату), не трогаются: кандидатами
  // считаются только стены, ПАРАЛЛЕЛЬНЫЕ ребру (|cos| > 0.85) — проходка сквозь стену
  // законна и нужна (гильза Ø20).
  const GUIDE_WALL_PARALLEL = 0.85;
  // Список стен этажа с толщинами — КЭШИРУЕТСЯ по той же сигнатуре геометрии, что и граф
  // магистралей: его просит и сборка графа (один раз), и clearOfWalls (на КАЖДЫЙ buildPath,
  // т.е. на каждую точку И на каждый замер-кандидат шлейфа) — без кэша сборка списка стен
  // из комнат/балок повторялась десятки раз за build() (замерено: build 33мс → 55мс).
  let wallsCache = null;
  function floorWallsWithTh(p) {
    const sig = geomSig(p);
    if (wallsCache && wallsCache.sig === sig) return wallsCache.walls;
    const fp = G().floorScoped(p);
    const out = [];
    // bbox стены кладём сразу — быстрый отсев «далеко» без closestOnSeg (горячий путь:
    // clearOfWalls зовётся на каждый путь, а стен в квартире несколько десятков)
    const push = (w, half) => out.push({ w, half,
      x0: Math.min(w.a.x, w.b.x), x1: Math.max(w.a.x, w.b.x),
      y0: Math.min(w.a.y, w.b.y), y1: Math.max(w.a.y, w.b.y) });
    (fp.rooms || []).forEach((r) => G().walls(r).forEach((w) => push(w, G().wallThOf(p, w) / 2)));
    (fp.beams || []).forEach((b) => { const bw = G().beamWall(b); if (bw) push(bw, G().wallThOf(p, bw) / 2); });
    wallsCache = { sig, walls: out };
    return out;
  }
  function edgeWallAdjust(p, A, B, walls, lanes, clear) {
    const n0 = guideSegNormal(A, B);
    const L = G().dist(A, B);
    if (L < 1) return { n: n0, base: 0 };
    const dir = { x: (B.x - A.x) / L, y: (B.y - A.y) / L };
    const mid = { x: (A.x + B.x) / 2, y: (A.y + B.y) / 2 };
    const near = [];
    walls.forEach((it) => {
      const w = it.w, wl = w.len || 1;
      const wd = { x: (w.b.x - w.a.x) / wl, y: (w.b.y - w.a.y) / wl };
      if (Math.abs(dir.x * wd.x + dir.y * wd.y) < GUIDE_WALL_PARALLEL) return; // не параллельна — это проходка
      const cl = G().closestOnSeg(mid, w.a, w.b);
      if (cl.d > it.half + clear + lanes) return;                              // веер до неё не достаёт
      near.push({ a: w.a, nw: { x: -wd.y, y: wd.x }, need: it.half + clear });
    });
    if (!near.length) return { n: n0, base: 0 };
    // сколько надо отвести ВЕСЬ пучок [0..lanes] вдоль нормали n, чтобы ни одна линия не
    // оказалась ближе need к оси стены (т.е. внутри её тела + зазор)
    const baseFor = (n) => {
      let b = 0;
      near.forEach((w) => {
        const along = w.nw.x * n.x + w.nw.y * n.y;
        const sd = ((mid.x - w.a.x) * w.nw.x + (mid.y - w.a.y) * w.nw.y) * (along < 0 ? -1 : 1);
        if (sd >= w.need) return;          // пучок уходит от стены — конфликта нет
        if (sd + lanes <= -w.need) return; // пучок целиком по другую сторону, до стены не доходит
        b = Math.max(b, w.need - sd);
      });
      return b;
    };
    const nAlt = { x: -n0.x, y: -n0.y };
    const b0 = baseFor(n0), b1 = baseFor(nAlt);
    if (b1 < b0 - 0.5) {
      // выбираем противоположную сторону, но не выталкиваем пучок за пределы квартиры:
      // если по ней конец веера уже вне комнат, а по исходной — внутри, остаёмся на исходной
      const probe = (n, b) => G().roomAt(p, { x: mid.x + n.x * (b + lanes), y: mid.y + n.y * (b + lanes) });
      if (probe(nAlt, b1) || !probe(n0, b0)) return { n: nAlt, base: b1 };
    }
    return { n: n0, base: b0 };
  }
  // сигнатура ГЕОМЕТРИИ КОМНАТ (не магистралей) — от неё зависят edgeAdj выше, поэтому
  // кэш графа обязан инвалидироваться и на перенос стены/смену толщины/добавление линии
  // (число линий = ширина веера), а не только на правку самих магистралей
  function geomSig(p) {
    const fp = G().floorScoped(p);
    let sum = 0, n = 0;
    (fp.rooms || []).forEach((r) => {
      (r.points || []).forEach((q) => { sum += q.x * 31 + q.y * 17; n++; });
      (r.wallTh || []).forEach((t, i) => { if (t) sum += t * (i + 7); });
    });
    (fp.beams || []).forEach((b) => { sum += b.a.x + b.a.y * 3 + b.b.x * 5 + b.b.y * 7 + (b.th || 0) * 11; n++; });
    const s = p.settings || {};
    return n + "|" + Math.round(sum * 100) + "|" + (s.wallThickness || 0) + "|" + (s.routeOffset || 0) + "|" + ((p.circuits || []).length);
  }
  function buildGuideGraph(guides, p) {
    const sig = guideSig(guides) + "#" + (p ? geomSig(p) : "");
    if (graphCache && graphCache.sig === sig) return graphCache.g;
    const g = buildGuideGraphRaw(guides);
    if (p) {
      const walls = floorWallsWithTh(p);
      const lanes = 2 * Math.max(0, ((p.circuits || []).length - 1));
      const clear = Math.max(0, p.settings && p.settings.routeOffset != null ? p.settings.routeOffset : 15);
      g.edgeAdj = g.edges.map((e) => edgeWallAdjust(p, g.nodes[e.a], g.nodes[e.b], walls, lanes, clear));
    }
    graphCache = { sig, g };
    return g;
  }
  function buildGuideGraphRaw(guides) {
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
  // …плюс отвод от стены (edgeWallAdjust): нормаль может быть РАЗВЁРНУТА, чтобы веер шёл
  // от стены, а base — общий для всех линий сдвиг этого ребра за грань стены.
  function edgeNormal(graph, edgeI) {
    const adj = graph.edgeAdj && graph.edgeAdj[edgeI];
    if (adj) return adj.n;
    const e = graph.edges[edgeI];
    return guideSegNormal(graph.nodes[e.a], graph.nodes[e.b]);
  }
  function edgeBase(graph, edgeI) {
    const adj = graph.edgeAdj && graph.edgeAdj[edgeI];
    return adj ? adj.base : 0;
  }
  // применяет боковой офсет (guideLaneOff) ко ВСЕМУ пути графа: на каждой точке — митра
  // между каноническими нормалями соседних рёбер (если оба есть), иначе простой сдвиг
  // вдоль единственного соседнего ребра (концы S/T). Базовые точки/направления для
  // пересечения прямых — route-локальные (points[i-1]/points[i]/points[i+1], как раньше в
  // offsetJoint), но САМИ нормали — канонические (см. edgeNormal) — это и есть фикс: смена
  // знака направления обхода не может задеть нормаль, только n0/n1 определяют сторону
  // сдвига, а они фиксированы per-edge.
  // ВАЖНО: офсет теперь ПЕР-РЕБЁРНЫЙ (лан-офсет линии + свой base ребра от стены), поэтому
  // ранний выход только когда суммарный офсет нулевой у ВСЕХ рёбер пути.
  function offsetGraphPath(graph, points, segEdges, off) {
    const offOf = (ei) => edgeBase(graph, ei) + off;
    let any = false;
    for (let i = 0; i < segEdges.length; i++) if (Math.abs(offOf(segEdges[i])) > 0.01) { any = true; break; }
    if (!any) return points;
    return points.map((pt, i) => {
      const n0 = i > 0 ? edgeNormal(graph, segEdges[i - 1]) : null;
      const o0 = i > 0 ? offOf(segEdges[i - 1]) : 0;
      const n1 = i < segEdges.length ? edgeNormal(graph, segEdges[i]) : null;
      const o1 = i < segEdges.length ? offOf(segEdges[i]) : 0;
      if (!n0 || !n1) {
        const n = n0 || n1, o = n0 ? o0 : o1;
        return { x: pt.x + n.x * o, y: pt.y + n.y * o };
      }
      const prev = points[i - 1], next = points[i + 1];
      const a0 = { x: prev.x + n0.x * o0, y: prev.y + n0.y * o0 };
      const d0 = { x: pt.x - prev.x, y: pt.y - prev.y };
      const a1 = { x: pt.x + n1.x * o1, y: pt.y + n1.y * o1 };
      const d1 = { x: next.x - pt.x, y: next.y - pt.y };
      const den = d0.x * d1.y - d0.y * d1.x;
      if (Math.abs(den) < 1e-6) return { x: pt.x + n1.x * o1, y: pt.y + n1.y * o1 }; // параллельны — смещённый угол
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
  // Насколько СИЛЬНО последний guideRoute() реально использовал магистраль: доля длины
  // «ствола» (участка ПО магистрали) в полной длине пути. Если ствол — мелочь на фоне
  // подходов к нему, магистраль не работает как «общий коридор между комнатами», а лишь
  // оттягивает путь к себе и обратно (см. фикс крюка в buildPath). Читает ТОЛЬКО
  // buildPath сразу после вызова guideRoute.
  let lastGuideTrunkShare = 1;
  function guideRoute(p, a, b, circuitId) {
    lastGuideTrunkShare = 1;
    const gs = (G().floorScoped(p).guides || []).filter((gd) => (gd.points || []).length >= 2);
    if (!gs.length) return null;
    const graph = buildGuideGraph(gs, p);
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
    const out = path.filter((q, j) => j === 0 || G().dist(q, path[j - 1]) > 0.5);
    const totalLen = G().polylineLen(out);
    lastGuideTrunkShare = totalLen > 1 ? G().polylineLen(trunk) / totalLen : 1;
    return out;
  }
  // ---- автопредложение магистрали (⇉), когда её нет вовсе ----
  // Без магистрали межкомнатные трассы не строятся ВООБЩЕ (см. инвариант buildPath): на
  // типовой 2-комн квартире «Построить» давало 0 трасс из 9 точек — тост есть, но
  // пользователь видит пустой план и должен сам догадаться нарисовать ⇉ до КАЖДОЙ комнаты.
  // Здесь строим черновик за него: ствол по «коридорной» комнате (у которой больше всего
  // общих стен с другими — на реальных планах это и есть коридор/прихожая) + ножка-отросток
  // в каждую комнату, где есть точки. Это ИМЕННО ЧЕРНОВИК: обычные записи p.guides, их
  // видно полупрозрачным, можно удалить/дорисовать в режиме ⇉ как любую нарисованную
  // вручную магистраль — никакой особой сущности не заводим.
  function roomsAdjacency(p) {
    const rs = (G().floorScoped(p).rooms || []);
    const cnt = new Map(rs.map((r) => [r.id, 0]));
    for (let i = 0; i < rs.length; i++) for (let j = i + 1; j < rs.length; j++) {
      // общая стена: у соседей совпадает centerline пары точек (тот же признак, что
      // использует wallAt для общей стены двух комнат)
      let share = false;
      G().walls(rs[i]).forEach((w1) => G().walls(rs[j]).forEach((w2) => {
        const d1 = G().dist(w1.a, w2.a) + G().dist(w1.b, w2.b);
        const d2 = G().dist(w1.a, w2.b) + G().dist(w1.b, w2.a);
        if (Math.min(d1, d2) < 2) share = true;
        else { // частичное перекрытие коллинеарных стен
          const c1 = G().closestOnSeg({ x: w1.mx, y: w1.my }, w2.a, w2.b);
          const c2 = G().closestOnSeg({ x: w2.mx, y: w2.my }, w1.a, w1.b);
          if (c1.d < 2 || c2.d < 2) share = true;
        }
      }));
      if (share) { cnt.set(rs[i].id, cnt.get(rs[i].id) + 1); cnt.set(rs[j].id, cnt.get(rs[j].id) + 1); }
    }
    return cnt;
  }
  // строит и КЛАДЁТ в p.guides черновик магистрали; возвращает число добавленных линий
  function suggestGuides() {
    const c = core(), p = c.project;
    const fp = G().floorScoped(p);
    const rs = fp.rooms || [];
    if (rs.length < 2) return 0;
    const adj = roomsAdjacency(p);
    // «коридор» — комната с максимумом смежных стен; при равенстве берём вытянутую (по
    // отношению сторон bbox) — коридор почти всегда самый узкий и длинный
    const scored = rs.map((r) => {
      const bb = G().bbox(r.points);
      const elong = Math.max(bb.w, bb.h) / Math.max(1, Math.min(bb.w, bb.h));
      return { r, adj: adj.get(r.id) || 0, elong, bb };
    }).sort((x, y) => (y.adj - x.adj) || (y.elong - x.elong));
    const hub = scored[0];
    if (!hub || hub.adj < 1) return 0;
    // ствол — по длинной оси коридора, по его центру
    const hb = hub.bb, horiz = hb.w >= hb.h;
    const cx = hb.x + hb.w / 2, cy = hb.y + hb.h / 2;
    const pad = 30; // не упираемся в самые углы
    const trunk = horiz
      ? [{ x: hb.x + pad, y: cy }, { x: hb.x + hb.w - pad, y: cy }]
      : [{ x: cx, y: hb.y + pad }, { x: cx, y: hb.y + hb.h - pad }];
    const added = [];
    added.push(c.model.newGuide(trunk));
    // ножка в каждую комнату, где есть точки (кроме самого коридора)
    const withPts = new Set();
    (fp.elements || []).forEach((el) => { const r = roomOfEl(p, el); if (r) withPts.add(r.id); });
    rs.forEach((r) => {
      if (r.id === hub.r.id || !withPts.has(r.id)) return;
      const bb = G().bbox(r.points), rc = { x: bb.x + bb.w / 2, y: bb.y + bb.h / 2 };
      // от ствола к центру комнаты — строго перпендикулярным отростком
      const from = horiz ? { x: Math.max(trunk[0].x, Math.min(trunk[1].x, rc.x)), y: cy }
                         : { x: cx, y: Math.max(trunk[0].y, Math.min(trunk[1].y, rc.y)) };
      const to = horiz ? { x: from.x, y: rc.y } : { x: rc.x, y: from.y };
      if (G().dist(from, to) < 20) return;
      added.push(c.model.newGuide([from, to]));
    });
    if (added.length < 2) return 0; // один ствол без ножек — толку нет
    c.commit();
    p.guides = (p.guides || []).concat(added);
    graphCache = null; wallsCache = null;
    c.persist("guide-add");
    return added.length;
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

  // РЕАЛЬНОЕ число проходок пути — ровно так же, как их посчитает addRoute (включая
  // фильтр floorSkip при разводке по полу: переход через дверь до пола гильзой не
  // считается). Нужно для сравнения «а не больше ли проходок у короткого пути» в фиксе
  // крюка ниже: сравнивать по СТЕНАМ нельзя — одна и та же стена, пересечённая в ДРУГОМ
  // месте, превращает бесплатный переход через дверь в настоящую гильзу (этот случай
  // поймал существующий тест «переход через дверь не считается гильзой»).
  function sleeveCount(p, pts, skipWall) {
    let tw = G().polylineCrossings(p, pts, skipWall || null);
    if (p.settings.routeType === "floor") tw = tw.filter((cr) => !floorSkip(p, cr));
    return tw.length;
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
  // ---- финальная страховка: ни один участок пути не идёт ВНУТРИ тела стены ----
  // Отвод магистрали от стены (edgeWallAdjust) закрывает свою причину, но остаётся вторая:
  // контур комнаты (pathInRoom) отступает от СВОИХ стен, а если соседняя комната нарисована
  // с расхождением (у пользователя два помещения разъехались на 20см — уже разбирали этот
  // случай), контур одной комнаты попадает РОВНО на ось стены другой, и линия рисуется по
  // штриховке. Тут проходим готовый путь и сдвигаем такие участки от чужой стены. Только
  // участки, идущие ВДОЛЬ стены (|cos| > 0.85) — перпендикулярная проходка сквозь стену
  // законна и нужна (гильза Ø20), её не трогаем. Концы пути — анкеры (позиция точки/щита/
  // распайки), двигать их нельзя: у сдвинутого крайнего участка вставляется коннектор-копия
  // анкера (тот же приём, что у ручной тяги целого сегмента в plan-rooms.js).
  const WALL_CLEAR_MIN = 5; // см от грани стены — как фикс. отступ размерной цепочки
  function clearOfWalls(p, pts) {
    if (!pts || pts.length < 2) return pts;
    const walls = floorWallsWithTh(p);
    if (!walls.length) return pts;
    const out = pts.map((q) => ({ x: q.x, y: q.y }));
    for (let i = 1; i < out.length; i++) {
      const a = out[i - 1], b = out[i];
      const L = G().dist(a, b);
      if (L < 2) continue;
      const dir = { x: (b.x - a.x) / L, y: (b.y - a.y) / L };
      const n = { x: -dir.y, y: dir.x };
      const mid = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
      let need = 0, sgn = 1;
      const sx0 = Math.min(a.x, b.x), sx1 = Math.max(a.x, b.x);
      const sy0 = Math.min(a.y, b.y), sy1 = Math.max(a.y, b.y);
      walls.forEach((it) => {
        const pad = it.half + WALL_CLEAR_MIN;
        if (it.x1 < sx0 - pad || it.x0 > sx1 + pad || it.y1 < sy0 - pad || it.y0 > sy1 + pad) return; // далеко
        const w = it.w, wl = w.len || 1;
        const wd = { x: (w.b.x - w.a.x) / wl, y: (w.b.y - w.a.y) / wl };
        if (Math.abs(dir.x * wd.x + dir.y * wd.y) < GUIDE_WALL_PARALLEL) return;
        const cl = G().closestOnSeg(mid, w.a, w.b);
        const d = it.half + WALL_CLEAR_MIN - cl.d;
        if (d <= 0.01 || d <= need) return;
        const s = (mid.x - cl.x) * n.x + (mid.y - cl.y) * n.y; // в какую сторону «от стены»
        need = d; sgn = Math.abs(s) < 0.01 ? 1 : (s > 0 ? 1 : -1);
      });
      if (need <= 0.01) continue;
      const probe = (sg) => G().roomAt(p, { x: mid.x + n.x * sg * need, y: mid.y + n.y * sg * need });
      if (!probe(sgn) && probe(-sgn)) sgn = -sgn;
      const dx = n.x * sgn * need, dy = n.y * sgn * need;
      if (i - 1 === 0) { out.splice(0, 0, { x: a.x, y: a.y }); i++; }
      if (i === out.length - 1) out.splice(out.length - 1, 0, { x: b.x, y: b.y });
      out[i - 1].x += dx; out[i - 1].y += dy;
      out[i].x += dx; out[i].y += dy;
    }
    return out.filter((q, j) => j === 0 || G().dist(q, out[j - 1]) > 0.5);
  }
  // raw:true — только ДЛИНА пути нужна (замер кандидата шлейфа): пост-проход по стенам
  // геометрию длины почти не меняет (сдвиг на единицы см), а стоит ощутимо на O(n²)
  // замерах — build() на реальном проекте 21мс → 64мс, если гонять его и на замерах
  function buildPath(p, fromEl, a, target, circuitId, raw) {
    const pts = buildPathRaw(p, fromEl, a, target, circuitId);
    if (raw || !pts || pts.length < 2) return pts;
    return clearOfWalls(p, pts);
  }
  function buildPathRaw(p, fromEl, a, target, circuitId) {
    circuitId = circuitId || (fromEl && fromEl.circuitId) || null;
    const b = target.pos;
    const skip = (fromEl && fromEl.wallId) || null;
    const ra = fromEl ? roomOfEl(p, fromEl) : roomNear(p, a);
    const rb = (target.el ? roomOfEl(p, target.el) : null) || roomNear(p, b);
    if (ra && rb && ra.id === rb.id) {
      const path = pathInRoom(p, ra, a, b, circuitId);
      if (path) return path;
      return ortho(p, a, b, skip); // контур не построился — крайний случай (вырожденная комната)
    }
    // ФИКС: комната ОДНОЙ из сторон не определилась вообще. Типовой реальный случай —
    // щит стоит в прихожей/нише, которую пользователь НЕ нарисовал комнатой (или дальше
    // 60см от любой стены, за пределами фолбэка roomNear). Раньше это считалось «разные
    // комнаты» и требовало магистраль — из-за чего щит в 80см вне комнаты убивал
    // трассировку ЦЕЛИКОМ, включая точки той же единственной комнаты (измерено: 0 трасс
    // из 2). Магистраль тут не при чём: у нас есть ровно одна известная комната, ведём по
    // её контуру (как «внутри комнаты»), а короткий выход за её границу к щиту честно
    // посчитается гильзой через общий polylineCrossings.
    if (!ra !== !rb) {
      const known = ra || rb;
      const path = pathInRoom(p, known, a, b, circuitId);
      if (path) return path;
      return ortho(p, a, b, skip);
    }
    const gp = guideRoute(p, a, b, circuitId); // разные комнаты — только по магистрали, иначе null
    if (!gp) return null;
    // ФИКС «крюка». Узкий случай, замеренный на реальной форме плана: путь по магистрали
    // почти целиком состоит из ПОДХОДОВ к ней, а сам ствол — мелочь (замерено 50см ствола
    // из 450см пути). Магистраль тут не выполняет свою работу «общего коридора между
    // комнатами», а лишь оттягивает путь к себе и обратно. Если при этом цель лежит МЕЖДУ точкой и этим участком, путь
    // уходит за цель и возвращается: замерено 450см против 226см Г-образных при ОДНОЙ И
    // ТОЙ ЖЕ гильзе (плюс 2 самопересечения с соседней трассой).
    // Условие СПЕЦИАЛЬНО узкое — доля ствола в пути ниже GUIDE_TRUNK_MIN_SHARE: как
    // только трасса реально ЕДЕТ по магистрали (коридор → ножка в комнату — типовой
    // случай, ради которого магистраль и сделана единственным путём наружу), ствол
    // составляет основную часть пути, сокращение НЕ применяется вообще, и приоритет
    // магистрали сохраняется буквально. Признак «обе проекции на одном отрезке» для этого
    // НЕ годится (проверено — ломает 3 теста): одна прямая магистраль по коридору — это
    // ровно один отрезок графа, и она как раз работает по назначению. Плюс страховка по РЕАЛЬНОМУ числу
    // проходок (sleeveCount, с учётом двери до пола) — короткий путь не должен добавить
    // ни одной гильзы.
    if (lastGuideTrunkShare < GUIDE_TRUNK_MIN_SHARE) {
      const dp = ortho(p, a, b, skip);
      if (dp && dp.length >= 2 && G().polylineLen(dp) < G().polylineLen(gp) - 1
          && sleeveCount(p, dp, skip) <= sleeveCount(p, gp, skip)) return dp;
    }
    return gp;
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
  // Точка, которой назначена КЛАВИША выключателя, питается ЧЕРЕЗ этот выключатель: кабель
  // идёт щит→выключатель→точка, а НЕ щит→точка (просьба пользователя: «от щита до
  // выключателя ВВГнг-LS 3×1.5, от выключателя до точки света 220В ВВГнг-LS 3×1.5»).
  // Раньше управляемая лампа трассировалась к щиту НАПРЯМУЮ, мимо выключателя — на
  // диагностическом прогоне сценария пользователя это давало 10.4м трассы лампы к щиту
  // при 3.6м у самого выключателя, т.е. физически неверную разводку и завышенный кабель.
  // Точки «Вывод 24В» тут НЕ участвуют — у них своя физика (клавиша коммутирует первичку
  // трансформатора в щите, см. build24Legs): их ведёт kindOf "24" к трансформаторному щиту.
  function switchFeedMap(p) {
    const fp = G().floorScoped(p);
    const byId = new Map((fp.elements || []).map((e) => [e.id, e]));
    const out = new Map();
    (fp.elements || []).forEach((sw) => {
      if (sw.type !== "switch") return;
      const tids = (sw.targetIds || []).concat(sw.targetId ? [sw.targetId] : []);
      tids.forEach((id) => {
        const t = id ? byId.get(id) : null;
        if (!t || t.id === sw.id || t.type === "output24") return;
        if (!out.has(t.id)) out.set(t.id, sw);
      });
    });
    return out;
  }
  // сколько клавиш ЭТОГО выключателя назначено на точки «Вывод 24В» — от этого зависит
  // марка кабеля «до щита» (первичка): 1 клавиша — 3 жилы, 2-3 клавиши — 5 жил
  function keys24Of(p, sw) {
    const byId = new Map((G().floorScoped(p).elements || []).map((e) => [e.id, e]));
    const tids = ((sw && sw.targetIds) || []).concat(sw && sw.targetId ? [sw.targetId] : []);
    const seen = new Set();
    tids.forEach((id) => { const t = id ? byId.get(id) : null; if (t && t.type === "output24") seen.add(t.id); });
    return seen.size;
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
    // Щиты, принимающие СИЛОВЫЕ линии. Раньше сюда шёл весь список panels, и силовая линия
    // могла уйти в слаботочный щит просто потому, что он оказался геометрически ближе
    // (поймано на реальном проекте: «QF2 Розетки К1» и «QF1 Свет» трассировались в «Щит
    // слаботочный», стоявший на 120см ближе к комнате, чем квартирный). Физически это
    // неверно — в слаботочном щите нет силовых автоматов, а подбор корпуса щита
    // (neededModules) считает модули по p.circuits для ОДНОГО щита.
    // Правило симметрично тому, как router-щит работает для слаботочки: если в проекте есть
    // хотя бы один щит БЕЗ признаков слаботочного (router/transformer) — силовые идут
    // только в такие. Если же ВСЕ щиты помечены router/transformer (типовой случай — один
    // единственный комбинированный щит на квартиру), силовые идут в них, как и раньше:
    // обратная совместимость сохранена, флаг сам по себе щит из силовых не исключает.
    const plainPanels = panels.filter((pn) => !pn.router && !pn.transformer);
    const powerPanels = plainPanels.length ? plainPanels : panels;
    const groups = new Map();
    const feed = switchFeedMap(p);
    const viaSw = [];
    pointsToRoute.forEach((el) => {
      const pos = G().routeAnchor(p, el); // блок -> вход штробы (нужный подрозетник)
      if (!pos) return;
      const sw = feed.get(el.id);
      if (sw) {
        const spos = G().routeAnchor(p, sw);
        if (spos) { viaSw.push({ el, pos, sw, spos }); return; } // питание через выключатель
      }
      const kind = kindOf(el);
      const key = (el.circuitId || "_none") + (kind === "pw" ? "" : ":" + kind);
      if (!groups.has(key)) groups.set(key, { circuitId: el.circuitId || null, kind, items: [] });
      groups.get(key).items.push({ el, pos });
    });
    // точки, управляемые клавишей: трасса к САМОМУ ВЫКЛЮЧАТЕЛЮ (он уже подключён к щиту
    // своей линией). Если до выключателя не добраться (нет магистрали между комнатами) —
    // фолбэк на прежнее поведение (ближайшая распайка своей линии / щит), чтобы точка не
    // осталась вообще без трассы.
    viaSw.forEach(({ el, pos, sw, spos }) => {
      // линия управляемой точки = линия ВЫКЛЮЧАТЕЛЯ (она физически питается через него).
      // Проставляем и здесь, а не только в момент назначения клавиши в редакторе
      // (EP.Plan.Elements.syncTargetCircuit): так автоматика догоняет проекты, где клавиши
      // расставлены ДО этой версии, и случай «у выключателя поменяли линию после назначения».
      if (sw.circuitId && el.circuitId !== sw.circuitId) el.circuitId = sw.circuitId;
      const cid = el.circuitId || sw.circuitId || null;
      const color = colorOf(p, el);
      let rt = addRoute(c, p, el, pos, { kind: "el", id: sw.id, pos: spos, el: sw }, cid, color);
      if (rt) return;
      const J = cid ? juncts.filter((n) => n.circuitId === cid) : juncts.slice();
      connectNearest(c, p, el, pos, J.concat(powerPanels), cid, color);
    });
    groups.forEach((g) => {
      const targetPanels = g.kind === "24" ? trafoPanels : g.kind === "lv" ? routerPanels : powerPanels;
      // распайки, доступные этой линии (своей QF; «без линии» — любые распайки)
      const J = g.circuitId ? juncts.filter((n) => n.circuitId === g.circuitId) : juncts.slice();
      // 24В — НИКОГДА не шлейфом: у каждого вывода 24В свой кабель от трансформаторного
      // щита (просьба пользователя: «на каждый вывод 24В, которую назначили клавишой, от
      // щита идёт провод до точки»); клавиши коммутируют их независимо, шлейф физически
      // не даёт этого сделать.
      if (J.length || g.kind === "24") {
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
  function routeJunctionsToPanel(c, p, allJuncts, juncstToRoute, panelsAll) {
    // распайка — силовой узел, ей тот же приоритет щитов, что и силовым точкам
    // (см. powerPanels в routeGroups): слаботочный щит принимает распайку только если
    // других щитов в проекте нет вообще
    const plain = panelsAll.filter((pn) => !pn.router && !pn.transformer);
    const panels = plain.length ? plain : panelsAll;
    const panelDist = (pos) => { const n = nearest(pos, panels); return n ? dist(pos, n.pos) : Infinity; };
    const js = allJuncts.map((n) => ({ n, d: panelDist(n.pos) }));
    juncstToRoute.forEach((n) => {
      const d = panelDist(n.pos);
      const closerJ = js.filter((x) => x.d < d - 1 && (!n.circuitId || x.n.circuitId === n.circuitId)).map((x) => x.n);
      connectNearest(c, p, n.el, n.pos, panels.concat(closerJ), n.circuitId, colorOf(p, n.el));
    });
  }

  // «До щита» для 24В (просьба пользователя: «от клавиши до щита, от щита до точки 24в;
  // до щита и от щита раздельно»): если клавиша выключателя управляет точкой «Вывод 24В»
  // (targetIds), а в проекте есть трансформаторный щит — физразводка идёт выключатель→
  // трансформатор (220В, первичка) → точка 24В (24В, вторичка). Точка 24В УЖЕ трассируется
  // к трансформатору (kindOf "24" в routeGroups) — это «от щита», тегируем leg="sec24".
  // Здесь достраиваем НЕДОСТАЮЩУЮ трассу выключатель→трансформатор — «до щита», leg="pri24",
  // с СИНТЕТИЧЕСКИМ fromId ("sw24:"+id выключателя): у выключателя уже есть СВОЯ трасса-
  // питание (fromId = его настоящий id), а Set'ы по fromId (haveRoute/routedIds) не должны
  // их путать. circuitId «до щита» = линия УПРАВЛЯЕМОЙ 24В-точки (обе половины под одной
  // линией 24В в смете). buildPath строит РЕАЛЬНЫЙ путь (штроба/гильзы/метраж) — «полноценная
  // трасса на плане» (выбор пользователя). Идемпотентна: не дублирует уже существующую
  // "sw24:id" (для инкрементальной сборки). Без трансформаторного щита ИЛИ без магистрали
  // между комнатами выключателя и щита — трасса не строится (как любая межкомнатная).
  // Ручная правка sw24-трассы (drag) на rebuild НЕ восстанавливается (anchorPos не знает
  // синтетический id) — регенерируется заново; редактировать её вручную смысла мало.
  function build24Legs(c, p, panels) {
    const trafo = panels.filter((pn) => pn.transformer);
    const fp = G().floorScoped(p);
    const byId = new Map((fp.elements || []).map((e) => [e.id, e]));
    if (trafo.length) {
      (fp.elements || []).forEach((sw) => {
        if (sw.type !== "switch") return;
        if ((p.routes || []).some((r) => r.fromId === "sw24:" + sw.id)) return;
        const tids = (sw.targetIds || []).concat(sw.targetId ? [sw.targetId] : []);
        const t24 = tids.map((id) => byId.get(id)).find((t) => t && t.type === "output24");
        if (!t24) return;
        const a = G().routeAnchor(p, sw);
        if (!a) return;
        const near = trafo.slice().sort((x, y) => dist(a, x.pos) - dist(a, y.pos))[0];
        const pts = buildPath(p, sw, a, { kind: "panel", id: near.id, pos: near.pos }, t24.circuitId);
        if (!pts || pts.length < 2) return;
        const rt = c.model.newRoute("power", p.settings.routeType, pts, "sw24:" + sw.id, near.id);
        rt.circuitId = t24.circuitId || null;
        rt.leg = "pri24";
        rt.toPanel = true;
        rt.color = colorOf(p, t24);
        const s = p.settings;
        rt.chaseW = s.chaseW || 25; rt.chaseH = s.chaseH || 30; rt.chaseFloor = (s.routeType === "floor");
        let tw = G().polylineCrossings(p, pts, sw.wallId || null);
        if (s.routeType === "floor") tw = tw.filter((cr) => !floorSkip(p, cr));
        rt.throughWalls = tw;
        p.routes.push(rt);
      });
    }
    // тег «от щита» на уже построенных трассах output24 -> трансформатор
    (p.routes || []).forEach((rt) => {
      if (rt.leg) return;
      const fe = byId.get(rt.fromId);
      if (fe && fe.type === "output24" && rt.toPanel && trafo.some((t) => t.id === rt.toId)) rt.leg = "sec24";
    });
  }

  function build(opts) {
    const silent = !!(opts && opts.silent); // тихая автоперестройка: без тостов/шторки
    // noCommit — ПРОБНЫЙ прогон (оптимизатор гоняет build() десятки раз, перебирая порядок
    // полос): не пишем ни в undo-историю, ни на диск, иначе один клик «Построить» оставил
    // бы десятки снимков undo и столько же записей в localStorage
    const quiet = !!(opts && opts.noCommit);
    const c = core(), p = c.project;
    p.circuits = p.circuits || [];
    const fp = G().floorScoped(p); // щиты/точки/распайки ТОЛЬКО активного этажа — иначе
    // трасса на этаже без своего щита попыталась бы дотянуться до щита другого этажа
    // прямой линией по общим координатам (физически бессмысленно, до «стояка» — Этап 2).
    if (!(fp.panels || []).length) { if (!silent) rooms().toast(T.noPanel); return; }
    const points = (fp.elements || []).filter(isPoint);
    if (!points.length) { if (!silent) rooms().toast(T.noElems); return; }
    if (!quiet) c.commit();
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
    build24Legs(c, p, panels); // трасса «до щита» (выкл→трансформатор) + тег «от щита»

    if (savedManual.length) restoreManualRoutes(p, savedManual);
    hideGuides(p); // прячем ТОЛЬКО применённые магистрали (см. usedGuideIds/hideGuides)
    usedGuideIds = null;
    const un = collectUnrouted(p, points, juncts, panels);
    if (!quiet) c.persist("routes-build");
    if (!silent) { if (un.length) rooms().toast(T.unroutedToast(un.length)); sheet(); }
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
    const quiet = !!(opts && opts.noCommit); // пробный/воркерный прогон — без undo и записи на диск
    const c = core(), p = c.project;
    p.circuits = p.circuits || [];
    const fp = G().floorScoped(p); // только активный этаж — та же причина, что и в build()
    if (!(fp.panels || []).length) { if (!silent) rooms().toast(T.noPanel); return; }
    const points = (fp.elements || []).filter(isPoint);
    if (!points.length) { if (!silent) rooms().toast(T.noElems); return; }
    if (!quiet) c.commit();

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
    // «до щита» 24В (выкл→трансформатор) — достраиваем недостающие даже если новых точек
    // нет (напр. только-только назначили клавише 24В-цель): идемпотентна, не дублирует
    build24Legs(c, p, (fp.panels || []).map((pn) => ({ kind: "panel", id: pn.id, pos: { x: pn.x, y: pn.y }, transformer: !!pn.transformer })));

    hideGuides(p); // прячем ТОЛЬКО применённые к новым точкам (уже применённые ранее — уже скрыты)
    usedGuideIds = null;
    const unInc = collectUnrouted(p, newPoints, newJuncts,
      (fp.panels || []).map((pn) => ({ kind: "panel", id: pn.id, pos: { x: pn.x, y: pn.y } })));
    c.persist("routes-build-inc");
    if (!silent) { if (unInc.length) rooms().toast(T.unroutedToast(unInc.length)); sheet(); }
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

  // ВСЯ физическая трасса (одна жила кабеля), к которой относится переданный хоп rt —
  // от щита (точка А) до конечного механизма (точка Б), просьба пользователя: «когда
  // кликаю на трассу для сдвигов, светилось с неоном ВСЯ выбранная трасса от точки А
  // (щит) до точки Б (конечный механизм)». Раньше подсвечивался ТОЛЬКО кликнутый хоп —
  // при шлейфе (щит→точка1→точка2→точка3, chainFromPanel) каждое звено — ОТДЕЛЬНАЯ
  // запись p.routes (свой fromId/toId), и клик по среднему звену светил только его,
  // не всю физическую жилу. Топология трасс — дерево от щита (каждый узел имеет РОВНО
  // ОДНУ исходящую «к родителю» трассу — fromId=этот узел, toId=родитель/щит): назад
  // (к щиту) — идём по toId текущей записи, ищем запись с ТАКИМ ЖЕ fromId (это trassa
  // родителя к ЕГО родителю), пока не дойдём до toPanel:true. Вперёд (к конечному
  // механизму/механизмам) — ищем ВСЕ записи, чей toId совпадает с fromId текущей (это
  // дальнейшие звенья шлейфа/распайки, для которых текущий узел — ближайший): обычно
  // одна (линейный шлейф), но если несколько (фан-аут от распайки) — подсвечиваем ВСЕ
  // (безопасный дефолт, не гадаем какую ветку выбрал пользователь).
  // ---- МЕТРИКА КАЧЕСТВА разводки: то, что минимизирует оптимизатор (и что можно
  // честно сравнить между вариантами). crossings — НАСТОЯЩИЕ пересечения линий друг с
  // другом (segIntersect, общие узлы не считаем: у щита/распайки кабели физически
  // сходятся в одну коробку, это не «каша»), sleeves — число физических отверстий,
  // len — суммарная длина трасс (см), unrouted — сколько точек осталось без трассы.
  function scoreRoutes(p) {
    const rs = (p.routes || []).filter((r) => (r.points || []).length > 1);
    const near = (a, b) => dist(a, b) < 2;
    let crossSame = 0, crossDiff = 0, len = 0;
    const boxes = rs.map((r) => ({ r, bb: bboxOf(r.points) }));
    rs.forEach((r) => { len += G().polylineLen(r.points); });
    for (let i = 0; i < boxes.length; i++) for (let j = i + 1; j < boxes.length; j++) {
      const A = boxes[i], B = boxes[j];
      if (A.bb.x1 < B.bb.x0 || A.bb.x0 > B.bb.x1 || A.bb.y1 < B.bb.y0 || A.bb.y0 > B.bb.y1) continue;
      const P1 = A.r.points, P2 = B.r.points;
      for (let x = 1; x < P1.length; x++) for (let y = 1; y < P2.length; y++) {
        const a1 = P1[x - 1], a2 = P1[x], b1 = P2[y - 1], b2 = P2[y];
        if (near(a1, b1) || near(a1, b2) || near(a2, b1) || near(a2, b2)) continue;
        if (!G().segIntersect(a1, a2, b1, b2)) continue;
        if ((A.r.circuitId || null) === (B.r.circuitId || null)) crossSame++; else crossDiff++;
      }
    }
    const holes = sleeveHoles(p);
    const unrouted = unroutedForSheet(p).length;
    // вес: пересечение линий — главное зло (просьба пользователя), потом лишние отверстия,
    // потом метраж; unrouted — запретительный вес, вариант без трасс не может «выиграть»
    const cost = crossDiff * 100 + crossSame * 40 + holes * 30 + len / 100 + unrouted * 10000;
    return { crossings: crossDiff, crossSame, holes, len: Math.round(len), unrouted, cost: Math.round(cost) };
  }
  // ================== ОПТИМИЗАТОР РАЗВОДКИ (тяжёлый режим) ==================
  // Просьба пользователя: «готов дополнительно задействовать CPU телефона, если нужно
  // больше ресурсов для лучшего просчёта» + «сделать наименьшее количество пересечений
  // линий между друг другом». Идея: ПОРЯДОК ПОЛОС линий (какая линия идёт ближе к стене
  // на общих участках) — свободный параметр, от которого напрямую зависит число
  // пересечений: две линии, входящие в общий коридор в одном порядке, а выходящие в
  // другом, ОБЯЗАНЫ пересечься. Перебираем порядок: детерминированный локальный поиск
  // (обмен пар полос), каждый вариант оцениваем scoreRoutes и держим лучший.
  // build({noCommit:true}) — пробный прогон без undo/записи на диск (см. quiet в build).
  // Детерминированность (инвариант модуля: тот же вход → тот же результат) обеспечивает
  // СВОЙ ГПСЧ с фиксированным сидом, а не Math.random.
  function lcg(seed) { let x = (seed || 1) >>> 0; return () => ((x = (x * 1664525 + 1013904223) >>> 0) / 4294967296); }
  function optimizeRouting(opts) {
    opts = opts || {};
    const c = core(), p = c.project;
    if (!p) return null;
    const budget = Math.max(50, opts.budgetMs || 900);
    const t0 = Date.now();
    const rnd = lcg(opts.seed || 12345);
    const ids = (p.circuits || []).map((x) => x.id);
    const snap = () => JSON.parse(JSON.stringify(p.routes || []));
    const evalOrder = (order) => {
      setLaneOrder(order);
      build({ silent: true, noCommit: true });
      return scoreRoutes(p);
    };
    const identity = {}; ids.forEach((id, i) => { identity[id] = i; });
    // РАЗНЫЕ СТАРТЫ для multistart (opts.start): «auto» — как раньше (identity + порядок по
    // геометрии), «reverse» — геометрия наоборот, «shuffle» — случайная перестановка от сида.
    // Без этого multistart не давал НИЧЕГО: замер 1 воркер против 3 дал цену 3114 у обоих —
    // подъём по склону из ОДНОГО И ТОГО ЖЕ старта сходится в тот же локальный минимум, каким
    // бы ни был сид (он влиял только на порядок пробуемых обменов, а бюджета хватало
    // перебрать почти все пары). Разные старты = разные «бассейны» — вот они и расходятся.
    const shuffled = () => {
      const arr = ids.slice();
      for (let i = arr.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); const t = arr[i]; arr[i] = arr[j]; arr[j] = t; }
      const o = {}; arr.forEach((id, i) => { o[id] = i; }); return o;
    };
    const startMode = opts.start || "auto";
    let iterations = 1;
    let best = { order: identity, score: evalOrder(identity), routes: snap() };
    // меньше двух линий — перестраивать полосы нечего (иначе крутили бы пустой цикл
    // весь бюджет: на проекте с одной линией живой прогон дал 6513 бессмысленных итераций)
    if (ids.length < 2) { setLaneOrder(best.order); p.routes = best.routes; return { score: best.score, iterations, ms: Date.now() - t0, laneOrder: best.order }; }
    // (1) СТАРТ ПО ГЕОМЕТРИИ: порядок полос по средней координате точек линии вдоль
    // главной оси плана — «естественный» порядок, при котором линии не переплетаются
    if (ids.length > 1) {
      const axis = (() => { // по какой оси тянется квартира — вдоль неё и сортируем
        const bb = G().projectBBox(G().floorScoped(p));
        return bb && bb.h > bb.w ? "y" : "x";
      })();
      const keyOf = (id) => {
        const els = (p.elements || []).filter((e) => e.circuitId === id);
        let s = 0, n = 0;
        els.forEach((e) => { const q = G().elemPoint(p, e); if (q) { s += q[axis]; n++; } });
        return n ? s / n : 0;
      };
      const sorted = ids.slice().sort((a, b) => keyOf(a) - keyOf(b));
      if (startMode === "reverse") sorted.reverse();
      const geom = {};
      sorted.forEach((id, i) => { geom[id] = i; });
      const startOrder = startMode === "shuffle" ? shuffled() : geom;
      const sc = evalOrder(startOrder); iterations++;
      if (sc.cost < best.score.cost) best = { order: startOrder, score: sc, routes: snap() };
    }
    // (2) ЛОКАЛЬНЫЙ ПОИСК с РЕСТАРТАМИ: меняем местами полосы двух линий; стало лучше — идём
    // дальше от нового варианта, долго нет улучшений (STALL_LIMIT подряд) — прыгаем в
    // случайный порядок и продолжаем оттуда, храня ГЛОБАЛЬНО лучший. Раньше поиск всегда
    // мутировал только best и застревал в первом локальном минимуме навсегда.
    // РЕСТАРТЫ включаются ТОЛЬКО для дополнительных воркеров multistart (opts.restart):
    // воркер №0 (start:"auto") намеренно считает РОВНО тем же алгоритмом, что и до этого
    // пакета — иначе на устройстве с 1-2 ядрами (единственный воркер) рестарты УХУДШАЛИ
    // результат (замер: 25→28 пересечений — каждый прыжок стоит полного build(), а бюджета
    // и без того хватало едва-едва). Так «лучший из N» гарантированно НЕ ХУЖЕ прежнего.
    const STALL_LIMIT = 12, allowRestart = !!opts.restart;
    let cur = best, stall = 0;
    while (ids.length > 1 && Date.now() - t0 < budget) {
      const order = Object.assign({}, cur.order);
      const i = Math.floor(rnd() * ids.length), j = Math.floor(rnd() * ids.length);
      if (i === j) continue;
      const a = ids[i], b = ids[j];
      const t = order[a]; order[a] = order[b]; order[b] = t;
      const sc = evalOrder(order); iterations++;
      if (sc.cost < cur.score.cost) {
        cur = { order, score: sc, routes: snap() }; stall = 0;
        if (sc.cost < best.score.cost) best = cur;
      } else if (allowRestart && ++stall >= STALL_LIMIT) {
        const sh = shuffled();
        const sc2 = evalOrder(sh); iterations++;
        cur = { order: sh, score: sc2, routes: snap() }; stall = 0;
        if (sc2.cost < best.score.cost) best = cur;
      }
    }
    // возвращаем ЛУЧШИЙ найденный вариант в проект
    setLaneOrder(best.order);
    p.routes = best.routes;
    return { score: best.score, iterations, ms: Date.now() - t0, laneOrder: best.order };
  }
  // ---- РЕЖИМ «МАКСИМУМ»: rip-up & reroute (приём из разводки печатных плат) ----
  // После поиска порядка полос остаются пересечения, которые порядком не лечатся (сходы к
  // щиту/распайке). Здесь берём САМУЮ проблемную трассу (участвует в максимуме пересечений),
  // пересобираем ТОЛЬКО ЕЁ на другой полосе и оставляем вариант, если общая метрика улучшилась;
  // не улучшилась — честный откат и переходим к следующей по проблемности. Итерируем, пока
  // не кончится бюджет CPU. Полный сеточный A* НАМЕРЕННО не берём: он ведёт трассы через
  // середину комнат, а инвариант модуля — кабель идёт вдоль стен по контуру (и по нему же
  // считается штроба), т.е. выигрыш по пересечениям пришёл бы ценой физически неверных трасс.
  function crossPerRoute(p) {
    const rs = (p.routes || []).filter((r) => (r.points || []).length > 1);
    const near = (a, b) => dist(a, b) < 2;
    const cnt = {};
    for (let i = 0; i < rs.length; i++) for (let j = i + 1; j < rs.length; j++) {
      const P1 = rs[i].points, P2 = rs[j].points;
      let n = 0;
      for (let x = 1; x < P1.length; x++) for (let y = 1; y < P2.length; y++) {
        const a1 = P1[x - 1], a2 = P1[x], b1 = P2[y - 1], b2 = P2[y];
        if (near(a1, b1) || near(a1, b2) || near(a2, b1) || near(a2, b2)) continue;
        if (G().segIntersect(a1, a2, b1, b2)) n++;
      }
      if (n) { cnt[rs[i].id] = (cnt[rs[i].id] || 0) + n; cnt[rs[j].id] = (cnt[rs[j].id] || 0) + n; }
    }
    return cnt;
  }
  // пересобрать ОДНУ трассу на заданной полосе (без commit/persist — это проба оптимизатора)
  function rerouteOne(p, rt, lane) {
    const fromEl = (p.elements || []).find((e) => e.id === rt.fromId);
    if (!fromEl) return false;
    const a = isJunction(fromEl) ? G().elemPoint(p, fromEl) : G().routeAnchor(p, fromEl);
    if (!a) return false;
    let target = null;
    if (rt.toPanel) {
      const pn = (p.panels || []).find((x) => x.id === rt.toId);
      if (pn) target = { kind: "panel", id: pn.id, pos: { x: pn.x, y: pn.y } };
    } else {
      const toEl = (p.elements || []).find((e) => e.id === rt.toId);
      if (toEl) target = { kind: isJunction(toEl) ? "junction" : "point", id: toEl.id, pos: isJunction(toEl) ? G().elemPoint(p, toEl) : G().routeAnchor(p, toEl) };
    }
    if (!target || !target.pos) return false;
    curLane = lane;
    const pts = buildPath(p, fromEl, a, target, rt.circuitId);
    curLane = 0;
    if (!pts || pts.length < 2) return false;
    rt.points = pts; rt.lane = lane;
    recomputeThroughWalls(p, rt);
    return true;
  }
  function optimizeRoutingMax(opts) {
    opts = opts || {};
    const p = core().project;
    if (!p) return null;
    const t0 = Date.now(), budget = Math.max(200, opts.budgetMs || 3000);
    // фаза 1 — порядок полос (примерно половина бюджета), фаза 2 — rip-up & reroute
    const r1 = optimizeRouting({ budgetMs: Math.round(budget * 0.5), seed: opts.seed, start: opts.start, restart: opts.restart });
    let cur = scoreRoutes(p);
    let iterations = (r1 && r1.iterations) || 0;
    const skip = {};
    while (Date.now() - t0 < budget) {
      const cnt = crossPerRoute(p);
      const cand = Object.keys(cnt).filter((id) => !skip[id]).sort((x, y) => cnt[y] - cnt[x])[0];
      if (!cand) break;
      const rt = (p.routes || []).find((r) => r.id === cand);
      if (!rt || rt.manual) { skip[cand] = 1; continue; }
      const before = JSON.stringify(rt.points), beforeLane = rt.lane || 0, beforeTw = JSON.stringify(rt.throughWalls || []);
      let improved = false;
      for (let lane = 0; lane <= 4 && Date.now() - t0 < budget; lane++) {
        if (lane === beforeLane) continue;
        if (!rerouteOne(p, rt, lane)) continue;
        iterations++;
        const sc = scoreRoutes(p);
        if (sc.cost < cur.cost) { cur = sc; improved = true; break; }
        rt.points = JSON.parse(before); rt.lane = beforeLane; rt.throughWalls = JSON.parse(beforeTw); // откат
      }
      if (!improved) skip[cand] = 1;
    }
    return { score: cur, iterations, ms: Date.now() - t0, phase1: r1 && r1.score };
  }
  // ================== ФОНОВЫЙ ВОРКЕР (тяжёлый просчёт) ==================
  // Воркер грузит ТЕ ЖЕ файлы модуля (см. solver-worker.js) — один алгоритм на оба режима.
  // Сюда он возвращает готовые трассы, а принимаем мы их ОДНОЙ транзакцией
  // (commit → подмена p.routes → persist), поэтому Undo отменяет весь тяжёлый прогон целиком.
  let solverPool = [], solverBusy = false, autoBusy = false;
  const QUALITY_BUDGET = { precise: 1200, max: 4000 };
  // MULTISTART: тяжёлые режимы («Точно»/«Максимум») запускаются в НЕСКОЛЬКИХ воркерах
  // одновременно — берём вариант с лучшей метрикой (scoreRoutes.cost). Просьба
  // пользователя «задействовать CPU телефона на максимум»: время ожидания то же (считают
  // параллельно), вариантов перебирается в N раз больше. ВАЖНО: разные СИДЫ сами по себе
  // не дают ничего — замер (1 воркер против 3) показал одинаковую цену 3114, потому что
  // подъём по склону из ОДНОГО старта сходится в тот же локальный минимум. Поэтому у
  // каждого воркера ещё и свой СТАРТОВЫЙ порядок полос (HEAVY_STARTS) и рестарты — после
  // этого 3 воркера дали 24 пересечения против 25 у одного.
  const HEAVY_SEEDS = [12345, 22345, 32345, 42345, 52345, 62345];
  const HEAVY_STARTS = ["auto", "reverse", "shuffle", "shuffle", "shuffle", "shuffle"];
  function heavyWorkerCount() {
    let cores = 2;
    try { cores = navigator.hardwareConcurrency || 2; } catch (e) {}
    // минус одно ядро — главному потоку (рендер/жесты), иначе UI начнёт подтормаживать
    // ровно тогда, когда мы «ускоряемся»
    return Math.max(1, Math.min(HEAVY_SEEDS.length, cores - 1));
  }
  function qualityOf(p) {
    const q = p && p.settings && p.settings.routeQuality;
    return (q === "precise" || q === "max") ? q : "fast";
  }
  // URL воркера + ВЕРСИЯ ассетов из уже загруженного тега <script> plan-routes.js: воркер
  // импортирует модули ровно той же версии, что работает в приложении (кэш-бастинг у нас
  // общий на деплой, а сам воркер-файл в index.html не упоминается и версии не имеет)
  function workerUrl() {
    let base = "assets/js/modules/plan/", ver = "";
    try {
      const sc = document.querySelector('script[src*="plan-routes.js"]');
      const src = sc ? String(sc.getAttribute("src") || "") : "";
      const m = /[?&](v=\d+)/.exec(src);
      if (m) ver = "?" + m[1];
      if (src) base = src.split("?")[0].replace(/plan-routes\.js$/, "");
    } catch (e) {}
    return base + "solver-worker.js" + ver;
  }
  // Пул создаётся лениво и переиспользуется (создание воркера — десятки мс, плюс каждый
  // заново импортирует модули плана). solverPool[0] — «интерактивный» (автоперестройка,
  // «Построить», предрасчёт), остальные добавляются только под multistart.
  function getPool(n) {
    if (typeof Worker !== "function") return [];
    while (solverPool.length < n) {
      let w = null;
      try { w = new Worker(workerUrl()); } catch (e) { break; }
      if (!w) break;
      solverPool.push(w);
    }
    return solverPool.slice(0, n);
  }
  function getWorker() { return getPool(1)[0] || null; }
  // подпись состава проекта — чтобы не применить устаревший результат, если пользователь
  // успел что-то дорисовать/удалить, пока воркер считал
  function projectSig(p) {
    return [p.id, (p.rooms || []).length, (p.elements || []).length, (p.panels || []).length,
      (p.circuits || []).length, (p.guides || []).length, (p.beams || []).length, p.activeFloorId].join("|");
  }
  // применить пришедшие из воркера трассы ОДНОЙ транзакцией (commit → подмена → persist):
  // Undo отменяет весь тяжёлый прогон целиком. floorId доштамповываем — в воркере состояние
  // ядра пусто, curFloorId() там вернул бы null (см. solver-worker.js).
  function applyWorkerRoutes(routes) {
    const c = core(), cur = c.project;
    if (!cur || !Array.isArray(routes)) return false;
    c.commit();
    const fid0 = cur.floors && cur.floors[0] && cur.floors[0].id;
    const activeFid = cur.activeFloorId || fid0;
    cur.routes = routes.map((r) => (r.floorId ? r : Object.assign({}, r, { floorId: activeFid })));
    c.persist("routes-build");
    if (rooms().renderScene) rooms().renderScene();
    return true;
  }
  // ЕДИНАЯ точка запуска пула: раскидываем ОДИН И ТОТ ЖЕ снимок по всем воркерам (свой сид
  // и свой стартовый порядок каждому) и отдаём в cb ЛУЧШИЙ вариант по метрике. Используют и
  // кнопка «✨ Оптимизировать» (buildHeavy), и фоновый предрасчёт (runPrecalc) — поэтому
  // посчитанный заранее вариант ИДЕНТИЧЕН тому, что дала бы кнопка на том же состоянии
  // (иначе «мгновенно» тихо означало бы «хуже», что хуже ожидания).
  function postSolve(pool, snapshot, mode, cb) {
    let pending = pool.length, best = null, totalIter = 0;
    const t0 = Date.now();
    pool.forEach((w, i) => {
      const onMsg = (e) => {
        const d = (e && e.data) || {};
        if (d.type !== "done") return;
        w.removeEventListener("message", onMsg);
        totalIter += (d.iterations || 0);
        // строгое «<» = при равной цене выигрывает воркер с МЕНЬШИМ индексом (детерминизм:
        // порядок сидов/стартов фиксирован)
        if (d.ok && Array.isArray(d.routes) && (!best || (d.score && best.score && d.score.cost < best.score.cost))) {
          best = { routes: d.routes, score: d.score, ms: d.ms || 0 };
        }
        if (--pending === 0) cb(best, { ms: Date.now() - t0, iterations: totalIter, cores: pool.length });
      };
      w.addEventListener("message", onMsg);
      w.postMessage({ type: "solve", project: snapshot, mode, budgetMs: QUALITY_BUDGET[mode] || 1200,
        seed: HEAVY_SEEDS[i] || HEAVY_SEEDS[0], start: HEAVY_STARTS[i] || "shuffle", restart: i > 0 });
    });
  }
  function heavyPool(mode) {
    const heavy = mode === "precise" || mode === "max";
    return getPool(heavy ? heavyWorkerCount() : 1);
  }
  function buildHeavy(mode, opts) {
    const c = core(), p = c.project;
    if (!p) return false;
    const pool = heavyPool(mode);
    if (!pool.length) return false;
    if (solverBusy) { if (!(opts && opts.silent)) rooms().toast(T.heavyBusy); return true; }
    let snapshot;
    try { snapshot = JSON.parse(JSON.stringify(p)); } catch (e) { return false; }
    const sig = projectSig(p);
    solverBusy = true;
    if (!(opts && opts.silent)) rooms().toast(pool.length > 1 ? T.heavyStartN(pool.length) : T.heavyStart);
    postSolve(pool, snapshot, mode, (best, info) => {
      solverBusy = false;
      const cur = core().project;
      if (!cur) return;
      if (!best) { if (!(opts && opts.silent)) rooms().toast(T.heavyFail); build(opts); return; }
      if (projectSig(cur) !== sig) { if (!(opts && opts.silent)) rooms().toast(T.heavyStale); return; }
      applyWorkerRoutes(best.routes);
      if (!(opts && opts.silent)) {
        // у обычной сборки в фоне нет «вариантов» — свой короткий текст
        rooms().toast((mode === "precise" || mode === "max")
          ? T.heavyDone(best.score, info.ms, info.iterations || 1, info.cores)
          : T.buildDone(best.score, best.ms || 0));
        sheet();
      }
      if (autoPending) { autoPending = false; autoRebuild(); } // геометрия менялась, пока считали
    });
    return true;
  }
  // ---- СПЕКУЛЯТИВНЫЙ ПРЕДРАСЧЁТ (settings.routePrecalc) ----
  // Через 1.5с ПРОСТОЯ (пользователь перестал рисовать) пул считает ТОТ ЖЕ вариант, который
  // дала бы кнопка «✨ Оптимизировать» — тем же postSolve, тем же числом воркеров/сидов,
  // поэтому «мгновенно» НЕ означает «хуже»: на одном и том же состоянии результат тот же,
  // что после нажатия кнопки. Кэш хранится вместе с подписью состава проекта; совпала —
  // применяем МГНОВЕННО, не совпала (успел дорисовать) — обычный путь через buildHeavy.
  // К «⚡ Построить» кэш НЕ применяется: у неё другая семантика (достроить только новые
  // точки, не перекладывать готовые трассы), а предрасчёт — полная перекладка.
  const PRECALC_IDLE_MS = 1500;
  let precalcTimer = 0, precalcBusy = false, precalc = null; // {sig, routes, score, mode}
  const precalcOn = (p) => !!(p && p.settings && p.settings.routePrecalc);
  function schedulePrecalc() {
    if (precalcTimer) { clearTimeout(precalcTimer); precalcTimer = 0; }
    const p = core().project;
    if (!p || !precalcOn(p)) return;
    precalcTimer = setTimeout(runPrecalc, PRECALC_IDLE_MS);
  }
  function runPrecalc() {
    precalcTimer = 0;
    const p = core().project;
    if (!p || !precalcOn(p)) return;
    if (solverBusy || autoBusy || precalcBusy) { schedulePrecalc(); return; } // занят — позже
    if (!(p.elements || []).length) return;
    const sig = projectSig(p);
    if (precalc && precalc.sig === sig) return; // на это состояние уже посчитано
    const mode = qualityOf(p) === "fast" ? "precise" : qualityOf(p);
    const pool = heavyPool(mode);
    if (!pool.length) return;
    let snapshot;
    try { snapshot = JSON.parse(JSON.stringify(p)); } catch (e) { return; }
    precalcBusy = true;
    postSolve(pool, snapshot, mode, (best) => {
      precalcBusy = false;
      if (best) precalc = { sig, routes: best.routes, score: best.score, mode };
      prefetchEstimate(); // тем же простоем греем смету и проверки (см. ниже)
    });
  }
  // ---- ФОНОВЫЙ ПРЕДРАСЧЁТ СМЕТЫ И ПУЭ-ПРОВЕРОК ----
  // Замер (стресс-проект 30 комнат/150 точек, CPU ×8): calcByRoutes 12мс + perCircuit 4мс +
  // ПУЭ-проверки 12мс на КАЖДУЮ перерисовку шторки. Мемо-кэш в plan-calc/plan-rules убирает
  // повторный счёт внутри одного состояния, а этот предрасчёт — и первый: пока пользователь
  // рисует, другое ядро уже посчитало смету на текущее состояние, и шторка «Расчёт»/
  // «Проверки» открывается вообще без вычислений на главном потоке. Под тем же тумблером
  // «Предрасчёт в фоне» (это ровно то же «использовать свободное ядро»).
  // ВАЖНО: нормы расходников (EP.CableConsum) живут в localStorage, которого в воркере нет —
  // отправляем их снимком, иначе метраж гофры/стяжек в предрасчёте разошёлся бы с тем, что
  // видит пользователь (поймано живым прогоном, см. ветку "estimate" в solver-worker.js).
  function prefetchEstimate() {
    const p = core().project;
    if (!p || !precalcOn(p)) return;
    const CALC = EP.Plan.Calc, RULES = EP.Plan.Rules;
    if (!CALC || !CALC.setPrefetched || !RULES || !RULES.setPrefetched) return;
    if (!(p.elements || []).length) return;
    const w = getWorker(); if (!w) return;
    let snapshot, consum = null;
    try { snapshot = JSON.parse(JSON.stringify(p)); } catch (e) { return; }
    try { consum = (EP.CableConsum && EP.CableConsum.get) ? EP.CableConsum.get() : null; } catch (e) {}
    const tokC = CALC.memoToken(), tokR = RULES.memoToken();
    const onMsg = (e) => {
      const d = (e && e.data) || {};
      if (d.type !== "done" || d.mode !== "estimate") return;
      w.removeEventListener("message", onMsg);
      if (!d.ok) return;
      CALC.setPrefetched(tokC, d.items, d.per);   // токен не совпал (проект изменился) — мимо
      RULES.setPrefetched(tokR, d.checks);
    };
    w.addEventListener("message", onMsg);
    w.postMessage({ type: "solve", project: snapshot, mode: "estimate", consum });
  }
  // есть ли готовый фоновый результат РОВНО на текущее состояние (подсказка в шторке и
  // живые проверки)
  function precalcReady() {
    const p = core().project;
    return !!(p && precalc && precalc.sig === projectSig(p) && Array.isArray(precalc.routes));
  }
  // «⚡ Построить» на большом проекте — тоже в воркер: замерено на стресс-проекте (30 комнат /
  // 150 точек) при CPU ×8 синхронная сборка блокирует главный поток на ~300мс. Семантика та же
  // (инкрементальная достройка только новых точек), просто считается в фоне.
  function buildIncrementalMaybeAsync() {
    const p = core().project;
    if (!p) return;
    if ((p.elements || []).length >= AUTO_ASYNC_MIN && buildHeavy("incremental")) return;
    buildIncremental();
  }
  // «✨ Оптимизировать» — полная перестройка ВСЕХ не-ручных трасс с минимизацией пересечений.
  // ОТДЕЛЬНАЯ кнопка, а не поведение «⚡ Построить»: та по инварианту модуля достраивает
  // только новые точки и не трогает готовые трассы, а оптимизация по смыслу перекладывает всё.
  function optimizeAndApply() {
    const p = core().project;
    if (!p) return;
    const mode = qualityOf(p) === "fast" ? "precise" : qualityOf(p);
    // готовый результат фонового предрасчёта на РОВНО это состояние — применяем сразу
    if (precalc && precalc.sig === projectSig(p) && precalc.mode === mode && Array.isArray(precalc.routes)) {
      const sc = precalc.score;
      if (applyWorkerRoutes(precalc.routes)) { rooms().toast(T.precalcDone(sc)); sheet(); return; }
    }
    if (buildHeavy(mode)) return;
    // воркеров нет (старый WebView) — считаем в главном потоке коротким бюджетом,
    // чтобы не заморозить UI надолго
    const c = core();
    c.commit();
    const r = mode === "max" ? optimizeRoutingMax({ budgetMs: 700 }) : optimizeRouting({ budgetMs: 500 });
    c.persist("routes-build");
    if (rooms().renderScene) rooms().renderScene();
    rooms().toast(T.heavyDone(r && r.score, (r && r.ms) || 0, (r && r.iterations) || 1));
    sheet();
  }
  function chainRouteIds(p, rt) {
    if (!rt) return new Set();
    const routes = p.routes || [];
    const ids = new Set([rt.id]);
    let cur = rt, guard = 0;
    while (!cur.toPanel && guard++ < 500) {
      const next = routes.find((r) => r.fromId === cur.toId);
      if (!next || ids.has(next.id)) break;
      ids.add(next.id); cur = next;
    }
    const frontier = [rt]; guard = 0;
    while (frontier.length && guard++ < 500) {
      const c = frontier.pop();
      routes.forEach((r) => { if (r.toId === c.fromId && !ids.has(r.id)) { ids.add(r.id); frontier.push(r); } });
    }
    return ids;
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
  const AUTOREBUILD_ON = { "elem-move": 1, "room-reshape": 1, "room-merge": 1, "wall-th": 1, "wall-mat": 1, "beam-move": 1, "beam-w": 1, "panel-move": 1, "panel-router": 1, "panel-trafo": 1, "opening-move": 1, "elem-target": 1 };
  let rebuilding = false;
  // ---- АВТОПЕРЕСТРОЙКА БЕЗ ФРИЗА: тяжёлый build() уходит в фоновый воркер ----
  // Замерено на стресс-проекте (30 комнат / 150 точек / 56 трасс) с эмуляцией слабого
  // телефона (CPU ×8): синхронный build() = 313мс — это и есть главный фриз «на отпускании
  // пальца» после переноса точки (renderScene там же 63мс, commit 9мс, смета 15мс).
  // Теперь: снимок проекта уходит в воркер, главный поток свободен, результат применяется
  // по готовности. Мелкие проекты считаем как раньше синхронно — там build дешевле, чем
  // клонирование проекта и обмен сообщениями (порог AUTO_ASYNC_MIN точек).
  const AUTO_ASYNC_MIN = 25;
  let autoSeq = 0;          // номер задания: результат старого задания применять нельзя
  let autoPending = false;  // пришёл новый триггер, пока воркер считал — досчитаем после
  function autoRebuild() {
    const p = core().project;
    if (!p || !(p.routes || []).length) return;
    const many = (p.elements || []).length >= AUTO_ASYNC_MIN;
    const w = many ? getWorker() : null;
    if (!w) { // мало точек или воркеров нет — как раньше, синхронно
      rebuilding = true;
      try { build({ silent: true }); } finally { rebuilding = false; }
      return;
    }
    // коалесинг: важен только последний результат. solverBusy — воркеры заняты тяжёлым
    // просчётом («✨ Оптимизировать»); дождёмся его — он всё равно перестроит трассы, а если
    // геометрия к тому моменту уедет, projectSig отбракует результат и autoPending поднимет
    // автоперестройку заново (см. finish() в buildHeavy)
    if (autoBusy || solverBusy) { autoPending = true; return; }
    let snapshot;
    try { snapshot = JSON.parse(JSON.stringify(p)); } catch (e) {
      rebuilding = true; try { build({ silent: true }); } finally { rebuilding = false; } return;
    }
    const seq = ++autoSeq, pid = p.id;
    autoBusy = true;
    const onMsg = (e) => {
      const d = (e && e.data) || {};
      if (d.type !== "done") return;
      w.removeEventListener("message", onMsg);
      autoBusy = false;
      const cur = core().project;
      // результат устарел (пользователь успел ещё раз подвигать / ушёл в другой проект)
      const stale = !cur || cur.id !== pid || seq !== autoSeq;
      if (!stale && d.ok && Array.isArray(d.routes)) {
        const c = core();
        rebuilding = true; // не зацикливаться на своём же persist
        try {
          c.commit();
          const fid0 = cur.floors && cur.floors[0] && cur.floors[0].id;
          cur.routes = d.routes.map((r) => (r.floorId ? r : Object.assign({}, r, { floorId: cur.activeFloorId || fid0 })));
          c.persist("routes-build");
          if (rooms().renderScene) rooms().renderScene();
        } finally { rebuilding = false; }
      }
      if (autoPending) { autoPending = false; autoRebuild(); }
    };
    w.addEventListener("message", onMsg);
    w.postMessage({ type: "solve", project: snapshot, mode: "fast" });
  }
  if (core().onChange) {
    core().onChange((what) => {
      // другой проект открыт — список «Без трассы» от прошлого проекта больше не про него
      if (what === "open" || what === "import") { lastUnrouted = []; lastUnroutedPid = null; graphCache = null; wallsCache = null; autoSeq++; autoPending = false; precalc = null; schedulePrecalc(); return; }
      // ЛЮБОЕ изменение обесценивает фоновый предрасчёт (он был на прошлом состоянии) —
      // сбрасываем кэш и переводим таймер на новую точку простоя
      if (!rebuilding) { precalc = null; schedulePrecalc(); }
      if (rebuilding || !AUTOREBUILD_ON[what]) return;
      autoRebuild();
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
  // Порог, после которого метрика выбора звена шлейфа падает с РЕАЛЬНОЙ длины пути
  // (buildPath) на прямую евклидову дистанцию — иначе O(n²·buildPath) на длинных линиях.
  // Раньше 18 — и на 19-й точке линии качество обрывалось СКАЧКОМ. Насколько это плохо,
  // видно только в МНОГОКОМНАТНОМ сценарии (в одной комнате прямая дистанция и длина пути
  // почти совпадают, разницы нет вообще — первый замер именно поэтому её и не показал).
  // Замер: одна линия, точки размазаны по 4 комнатам вокруг коридора с магистралью —
  //   20 точек: путь 5451см / 8 гильз / 0 пересечений   ПРОТИВ   прямая 12151см / 37 / 6
  //   32 точки: путь 6414см / 4 гильзы / 0              ПРОТИВ   прямая 13635см / 48 / 8
  //   40 точек: путь 6753см / 4 гильзы / 0              ПРОТИВ   прямая 13977см / 48 / 8
  // То есть прямая дистанция на 19+ точках давала ВДВОЕ больше кабеля, в 6-12 раз больше
  // проходок и крестящиеся хопы — и это попадало прямо в смету, а не только в картинку.
  // Порог поднят до 40 (заведомо больше любой практической бытовой группы на одном
  // автомате); цена — 95мс против 11мс на предельных 40 точках одной линии, что после
  // кэша графа магистралей (см. buildGuideGraph выше) приемлемо.
  const CHAIN_LEN_MAX = 40;
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
      curLane = 0;                                     // замер — всегда по базовой полосе линии
      const pts = buildPath(p, fromEl, a, target, circuitId, true);
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
  // Длина КОЛЛИНЕАРНОГО наложения двух отрезков (параллельны, расстояние между линиями
  // меньше 1см) — насколько трассы физически нарисованы одна поверх другой.
  function segOverlapLen(a1, a2, b1, b2) {
    const L1 = dist(a1, a2), L2 = dist(b1, b2);
    if (L1 < 1 || L2 < 1) return 0;
    const d1 = { x: (a2.x - a1.x) / L1, y: (a2.y - a1.y) / L1 };
    const d2 = { x: (b2.x - b1.x) / L2, y: (b2.y - b1.y) / L2 };
    if (Math.abs(d1.x * d2.x + d1.y * d2.y) < 0.99) return 0;      // не параллельны
    const n = { x: -d1.y, y: d1.x };
    if (Math.abs((b1.x - a1.x) * n.x + (b1.y - a1.y) * n.y) > 1) return 0; // уже разнесены
    const t = (q) => (q.x - a1.x) * d1.x + (q.y - a1.y) * d1.y;
    const lo = Math.min(t(b1), t(b2)), hi = Math.max(t(b1), t(b2));
    return Math.max(0, Math.min(hi, L1) - Math.max(lo, 0));
  }
  // сколько кандидат-путь идёт ПОВЕРХ уже построенных трасс (любой линии — офсет по линиям
  // как раз и нужен, чтобы этого не было; проверяем всё, чтобы под-полоса одной линии не
  // «села» на полосу другой). ГОРЯЧИЙ путь: зовётся на каждую пробную полосу каждой трассы,
  // поэтому (1) bbox-отсев по трассе целиком и по каждому отрезку, (2) ранний выход, как
  // только наложение превысило порог — точная сумма нам не нужна, только факт. Без этого
  // build() на реальном проекте (43 трассы) уходил с 16мс на 109мс.
  function bboxOf(pts) {
    let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
    for (let i = 0; i < pts.length; i++) {
      const q = pts[i];
      if (q.x < x0) x0 = q.x; if (q.x > x1) x1 = q.x;
      if (q.y < y0) y0 = q.y; if (q.y > y1) y1 = q.y;
    }
    return { x0, y0, x1, y1 };
  }
  // {sum, maxLane}: сколько кандидат идёт поверх уже построенных трасс и на какой САМОЙ
  // ДАЛЬНЕЙ полосе стоят те, с кем он слипся — новая трасса встаёт СЛЕДУЮЩЕЙ полосой за
  // ними (а не перебирает полосы вслепую: перебор давал 4 вызова buildPath на трассу и
  // разгонял build() на реальном проекте с 16мс до 109мс).
  // ВАЖНО: сравниваем только с трассами СВОЕЙ линии. Разные линии и так разведены базовым
  // офсетом (+2см на линию) — если бы новая трасса «отодвигалась» и от чужих линий, она
  // уезжала бы с СВОЕЙ полосы на полосу соседней линии, и наложений становилось БОЛЬШЕ, а не
  // меньше (замерено: 65 пар наложений → 79; заодно ломался тест «QF2 по магистрали ровно
  // +2см»). Внутри же одной линии полосы и нужны: «до клавиши» и «от клавиши до освещения»
  // имеют одинаковый базовый офсет и ложились ровно друг на друга.
  function conflicts(built, pts, limit) {
    const bb = bboxOf(pts);
    let sum = 0, maxLane = 0;
    for (let k = 0; k < built.length; k++) {
      const it = built[k], q = it.pts, b = it.bb;
      if (b.x1 < bb.x0 - 2 || b.x0 > bb.x1 + 2 || b.y1 < bb.y0 - 2 || b.y0 > bb.y1 + 2) continue;
      let own = 0;
      for (let i = 1; i < pts.length; i++) {
        const a1 = pts[i - 1], a2 = pts[i];
        const ax0 = Math.min(a1.x, a2.x), ax1 = Math.max(a1.x, a2.x);
        const ay0 = Math.min(a1.y, a2.y), ay1 = Math.max(a1.y, a2.y);
        for (let j = 1; j < q.length; j++) {
          const b1 = q[j - 1], b2 = q[j];
          if (Math.max(b1.x, b2.x) < ax0 - 2 || Math.min(b1.x, b2.x) > ax1 + 2) continue;
          if (Math.max(b1.y, b2.y) < ay0 - 2 || Math.min(b1.y, b2.y) > ay1 + 2) continue;
          own += segOverlapLen(a1, a2, b1, b2);
        }
      }
      if (own > limit) { sum += own; if (it.lane > maxLane) maxLane = it.lane; }
    }
    return { sum, maxLane };
  }
  const LANE_MAX = 2;          // максимум 2 доп. полосы (+2/+4 см) — дальше не двигаем
  const LANE_OVERLAP_MIN = 30; // см — короткий стык у общего анкера наложением не считаем
  // Полосы ищем ТОЧЕЧНО — только у трасс, связанных с ВЫКЛЮЧАТЕЛЕМ (питание выключателя от
  // щита и трассы точек, которые он коммутирует): именно там два кабеля ОДНОЙ линии идут к
  // одной коробке по одной стене и ложатся друг на друга (репорт пользователя). Расширять
  // поиск на все трассы вредно и дорого: на плотном реальном проекте (17 трасс одной линии
  // по общему коридору) двух полос физически не хватает, трассы начинают садиться на чужие
  // полосы, суммарное наложение РОСЛО (10168 → 11549 см), а build() дорожал 16мс → 34мс.
  // ---- «ГРЕБЁНКА» У ЩИТА ----
  // Раньше ВСЕ трассы приходили ровно в ЦЕНТР щита (одна точка) — и перекрещивались прямо
  // перед ним: на реальном проекте 66 из 158 пересечений линий приходились на пятно радиусом
  // 120см вокруг щита. Физически это неверно: щит шириной 30-46см, кабели заходят в него
  // через кромку в РАЗНЫХ местах, гребёнкой. Теперь точка входа разносится по ширине
  // корпуса, а ПОРЯДОК входа берётся по координате источника вдоль той же оси — кабель,
  // идущий слева, входит слева, идущий справа — справа, поэтому они не перекрещиваются.
  // Ширина: реальный корпус из settings.panelBox.wmm (мм), иначе 36см; шаг = ширина/(N+1),
  // не больше 6см (иначе на 1-2 кабелях гребёнка выглядела бы как разъезд в стороны).
  const PANEL_COMB_MAX_STEP = 6;
  function panelCombPos(p, panelId, basePos, fromPos) {
    const box = p.settings && p.settings.panelBox;
    const wCm = Math.max(20, Math.min(60, box && box.wmm ? box.wmm / 10 : 36));
    // ось гребёнки — вдоль стены, на которой стоит щит (нормаль стены даёт направление);
    // без стены рядом — вдоль X (щит в нише/на свободном месте)
    const hit = G().wallAt(p, basePos, 80);
    let ax = { x: 1, y: 0 };
    if (hit && hit.wall) {
      const w = hit.wall, L = w.len || 1;
      ax = { x: (w.b.x - w.a.x) / L, y: (w.b.y - w.a.y) / L };
    }
    // все трассы ЭТОГО щита, уже построенные + текущая: сортируем по проекции источника
    // на ось гребёнки, порядковый номер даёт смещение
    const others = (p.routes || []).filter((r) => r.toPanel && r.toId === panelId && (r.points || []).length > 1);
    const proj = (q) => q.x * ax.x + q.y * ax.y;
    const mine = proj(fromPos);
    let idx = 0;
    others.forEach((r) => { if (proj(r.points[0]) < mine) idx++; });
    const n = others.length + 1;
    const step = Math.min(PANEL_COMB_MAX_STEP, wCm / (n + 1));
    const off = (idx - (n - 1) / 2) * step;
    return { x: basePos.x + ax.x * off, y: basePos.y + ax.y * off };
  }
  function addRoute(c, p, fromEl, a, target, circuitId, color) {
    if (target && target.kind === "panel" && target.pos && !target.noComb) {
      target = Object.assign({}, target, { pos: panelCombPos(p, target.id, target.pos, a) });
    }
    // под-полоса: если путь ложится поверх уже построенной трассы длиннее 30см — сдвигаем
    // ЭТУ трассу на +2см и пробуем снова (до LANE_MAX раз)
    // Сравниваем ТОЛЬКО с трассами своей линии, которые сходятся в ТОМ ЖЕ узле (в тот же
    // подрозетник выключателя / тот же щит): именно они физически идут рядом по одной стене
    // и ложились друг на друга. Сравнение со ВСЕМИ трассами линии пробовал — на плотном
    // реальном проекте (17 трасс QF1 по общему коридору) полос не хватает, трассы съезжают
    // на чужие полосы и суммарное наложение РОСЛО (10168 → 11738 см) при +15мс к build().
    const nodeIds = {};
    if (fromEl && fromEl.id) nodeIds[fromEl.id] = 1;
    if (target && target.id) nodeIds[target.id] = 1;
    const built = (p.routes || []).filter((r) => (r.points || []).length > 1
        && (r.circuitId || null) === (circuitId || null)
        && (nodeIds[r.fromId] || nodeIds[r.toId]))
      .map((r) => ({ pts: r.points, bb: bboxOf(r.points), lane: r.lane || 0 }));
    curLane = 0;
    let pts = buildPath(p, fromEl, a, target, circuitId), lane = 0;
    const swLeg = fromEl.type === "switch" || (target.el && target.el.type === "switch");
    if (swLeg && pts && pts.length >= 2 && built.length
        && conflicts(built, pts, LANE_OVERLAP_MIN).sum > LANE_OVERLAP_MIN) {
      // ищем СВОБОДНУЮ полосу: +2см, +4см, +6см. Если свободной нет (плотный участок, где
      // по одному коридору идёт больше трасс, чем полос) — ОСТАЁМСЯ НА БАЗОВОЙ, а не
      // «сваливаемся» на последнюю: иначе трассы кучей садятся на одну и ту же дальнюю
      // полосу и наложений становится больше, чем было (замерено на реальном проекте).
      for (let ln = 1; ln <= LANE_MAX; ln++) {
        curLane = ln;
        const cand = buildPath(p, fromEl, a, target, circuitId);
        if (!cand || cand.length < 2) break;
        if (conflicts(built, cand, LANE_OVERLAP_MIN).sum <= LANE_OVERLAP_MIN) { pts = cand; lane = ln; break; }
      }
    }
    curLane = 0;
    if (!pts || pts.length < 2) return null;
    const rt = c.model.newRoute(fromEl.layer, p.settings.routeType, pts, fromEl.id, target.id || null);
    rt.circuitId = circuitId || null;
    rt.color = color;
    rt.lane = lane;                       // под-полоса внутри линии (см. curLane выше)
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
    lastUnrouted = []; lastUnroutedPid = null; // баннер «Без трассы» относился к прошлой сборке
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
    // распайка и ВЫКЛЮЧАТЕЛЬ — терминалы хопа: там есть коробка/подрозетник, принимающая
    // кабель на месте, штроба вниз проходится один раз (у обычной точки шлейфа — дважды)
    return (target && target.type !== "junction" && target.type !== "switch") ? 2 : 1;
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
  // ---- ФИЗИЧЕСКИЕ проходки (отверстия), а не кабеле-пересечения ----
  // ЕДИНЫЙ источник для шторки «Трассы» И для сметы (plan-calc.js). Раньше шторка
  // показывала СУММУ throughWalls по всем трассам (кабеле-пересечения), а смета —
  // сгруппированные по месту отверстия с учётом ёмкости гильзы: на 6 линиях через одну
  // стену получалось «12 проходок» в шторке против «6 шт» (в гофре) и «4 шт» (без гофры)
  // в смете — три разных числа под одним словом «проходка». Теперь алгоритм ровно один,
  // и разойтись они не могут.
  // Группировка: по месту (~20см) — общая стена двух комнат хранится как ДВА wall-объекта,
  // но это одно физическое отверстие, поэтому внутри одной трассы место считается один
  // раз (seen). Ёмкость: «в гофре» (по полу всегда, по потолку — settings.gofraCeil) —
  // 1 кабель на гильзу, без гофры — 2 (гофра толще, вдвоём в Ø20 не входят).
  function sleeveGroups(p) {
    const s = p.settings || {};
    const cap = (s.routeType === "floor" || s.gofraCeil !== false) ? 1 : 2;
    const groups = {}; // "x|y" -> { n: кабелей, wallId }
    (p.routes || []).forEach((r) => {
      const seen = {};
      (r.throughWalls || []).forEach((c) => {
        const key = Math.round(c.x / 20) + "|" + Math.round(c.y / 20);
        if (seen[key]) return;
        seen[key] = 1;
        if (!groups[key]) groups[key] = { n: 0, wallId: c.wallId };
        groups[key].n++;
      });
    });
    return { groups, cap };
  }
  // сколько РЕАЛЬНЫХ отверстий сверлить (сумма по местам с учётом ёмкости гильзы)
  function sleeveHoles(p) {
    const { groups, cap } = sleeveGroups(p);
    return Object.keys(groups).reduce((n, k) => n + Math.ceil(groups[k].n / cap), 0);
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
    const unrouted = unroutedForSheet(p);
    const holes = sleeveHoles(p); // ФИЗИЧЕСКИЕ отверстия — то же число, что в смете
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
      ${unrouted.length ? `<div class="ep-plan-modehint ep-plan-warnhint">${T.unroutedBanner(unrouted.length)}
        ${!((G().floorScoped(p).guides || []).filter((gd) => (gd.points || []).length >= 2)).length ? `<div class="ep-plan-srow"><button type="button" class="ep-plan-tbtn ep-clickable" data-prt-suggest>${T.suggestGuide}</button></div>` : ""}
        <div class="ep-plan-unrlist">${unrouted.slice(0, 12).map((u) => `<div class="ep-plan-unrrow"><button type="button" class="ep-plan-mini ep-clickable" data-prt-show="${esc(u.id)}" aria-label="Показать на плане">👁</button><b>${esc(u.name)}</b> — ${esc(u.reason)}</div>`).join("")}${unrouted.length > 12 ? `<div class="ep-plan-unrrow">…и ещё ${unrouted.length - 12}</div>` : ""}</div></div>` : ""}
      ${p.routes.length ? `<div class="ep-plan-srow ep-plan-rlens"><span>${T.total}: <b>${G().fmtLen(st.total)}</b></span><span title="физических отверстий сверлить">${holes} ${T.crossings}</span>${st.crossings !== holes ? `<span class="ep-plan-dim">(кабеле-пересечений ${st.crossings})</span>` : ""}</div>` : ""}
      ${linesHtml}
      <div class="ep-plan-srow">${T.qualityLbl}
        ${["fast", "precise", "max"].map((q) => `<button type="button" class="ep-plan-chip ep-clickable ${qualityOf(p) === q ? "on" : ""}" data-prt-quality="${q}">${q === "fast" ? T.qFast : q === "precise" ? T.qPrecise : T.qMax}</button>`).join("")}
      </div>
      <div class="ep-plan-srow ep-plan-hintrow">${T.qualityHint}</div>
      <div class="ep-plan-srow">${T.precalcLbl}
        ${[true, false].map((on) => `<button type="button" class="ep-plan-chip ep-clickable ${precalcOn(p) === on ? "on" : ""}" data-prt-precalc="${on ? 1 : 0}">${on ? T.precalcOn : T.precalcOff}</button>`).join("")}
      </div>
      <div class="ep-plan-srow ep-plan-hintrow">${precalcOn(p) && precalcReady() ? T.precalcHintReady : T.precalcHint}</div>
      <div class="ep-plan-srow ep-plan-sbtns">
        <button type="button" class="btn btn-primary ep-clickable" data-prt-build>${T.build}</button>
        ${p.routes.length ? `<button type="button" class="ep-plan-tbtn ep-clickable" data-prt-optimize>${T.optimizeBtn}</button>` : ""}
        <button type="button" class="ep-plan-tbtn ep-plan-danger ep-clickable" data-prt-clear>${T.clear}</button>
      </div>`);
  }

  // Напоминание ПЕРЕД трассировкой (просьба пользователя): между комнатами трасса теперь
  // строится ТОЛЬКО по нарисованной магистрали (⇉) — если её не хватает до какой-то
  // комнаты, точки в ней останутся без трассы (см. lastUnrouted/баннер выше). Подсказка
  // показывается КАЖДЫЙ раз перед явным нажатием «Построить» (тот же паттерн под-вида
  // поверх шторки, что и sheetSetPrice/sheetConsumSettings — «‹ Назад» возвращает в sheet()).
  function sheetBuildConfirm() {
    const hasGuides = ((G().floorScoped(core().project).guides || []).filter((gd) => (gd.points || []).length >= 2)).length > 0;
    rooms().openSheet(`<div class="ep-plan-srow"><b>🧭 ${T.buildConfirmTitle}</b></div>
      <div class="ep-plan-modehint">${T.buildConfirmText}</div>
      ${!hasGuides ? `<div class="ep-plan-modehint ep-plan-warnhint">${T.noGuideHint}</div>` : ""}
      <div class="ep-plan-srow ep-plan-sbtns">
        <button type="button" class="btn btn-primary ep-clickable" data-prt-build-go>${T.buildConfirmGo}</button>
        ${!hasGuides ? `<button type="button" class="ep-plan-tbtn ep-clickable" data-prt-suggest>${T.suggestGuide}</button>` : ""}
        <button type="button" class="ep-plan-tbtn ep-clickable" data-prt-build-back>${T.buildConfirmBack}</button>
      </div>`);
  }

  document.addEventListener("click", (e) => {
    if (!rooms() || !rooms().isActive()) return;
    const t = e.target; let b;
    if (t.closest("[data-plan-routes]")) return sheet();
    if (t.closest("[data-prt-build]")) return sheetBuildConfirm();
    if (t.closest("[data-prt-build-go]")) return buildIncrementalMaybeAsync();
    let qb;
    if ((qb = t.closest("[data-prt-precalc]"))) {
      const c = core(), on = qb.getAttribute("data-prt-precalc") === "1";
      if (precalcOn(c.project) !== on) { c.commit(); c.project.settings.routePrecalc = on; c.persist("route-precalc"); }
      if (on) schedulePrecalc(); else { precalc = null; if (precalcTimer) { clearTimeout(precalcTimer); precalcTimer = 0; } }
      sheet(); return;
    }
    if ((qb = t.closest("[data-prt-quality]"))) {
      const c = core(), q = qb.getAttribute("data-prt-quality");
      c.commit(); c.project.settings.routeQuality = q; c.persist("route-quality"); sheet(); return;
    }
    if (t.closest("[data-prt-optimize]")) return optimizeAndApply();
    if (t.closest("[data-prt-suggest]")) { // черновик магистрали за пользователя
      const n = suggestGuides();
      if (!n) { rooms().toast(T.suggestNone); return; }
      rooms().renderScene();
      rooms().toast(T.suggestOk(n));
      sheetBuildConfirm();
      return;
    }
    if (t.closest("[data-prt-build-back]")) return sheet();
    if (t.closest("[data-prt-clear]")) return clearRoutes();
    if ((b = t.closest("[data-prt-show]"))) { // «Без трассы» -> показать точку на плане
      const id = b.getAttribute("data-prt-show");
      const e2 = (core().project.elements || []).find((x) => x.id === id);
      const pt = e2 && G().elemDrawPoint(core().project, e2);
      // подтягиваем вид к точке (тот же хелпер, что используют шторки комнаты/балки) и
      // открываем её редактор — оттуда сразу видно линию/высоту и можно поправить
      if (pt && rooms().ensureVisibleAboveSheet) rooms().ensureVisibleAboveSheet(pt);
      if (e2 && EP.Plan.Elements && EP.Plan.Elements.openEditor) EP.Plan.Elements.openEditor(e2);
      return;
    }
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
  EP.Plan.Routes = { build, buildIncremental, clearRoutes, suggestGuides, lengths, sheet, sleeveGroups, sleeveHoles, unroutedList: () => unroutedForSheet(core().project).slice(), resetUnrouted: () => { lastUnrouted = []; lastUnroutedPid = null; }, pointVert, panelVert, hopVertMul, cableStub, keys24Of, scoreRoutes, setLaneOrder, optimizeRouting, optimizeRoutingMax, optimizeAndApply, buildHeavy, precalcReady, buildPath, roomNear, routeAt, resetRouteToAuto, recomputeThroughWalls, chainRouteIds };
})();
