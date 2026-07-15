/* Electric Pro V29 — тест-набор модуля «Проект квартиры».
   Запуск: node test/run.js  (без зависимостей). Выход 1 при любой ошибке.
   Гейт перед деплоем в .github/workflows/firebase-deploy.yml. */
"use strict";
const { loadPlan, fakeCanvas, fakeNode } = require("./harness");

// ---- мини-фреймворк ----
let passed = 0, failed = 0;
const fails = [];
function test(name, fn) {
  try { fn(); passed++; }
  catch (e) { failed++; fails.push(name + " — " + e.message); }
}
function ok(c, m) { if (!c) throw new Error(m || "ожидалось истинное"); }
function eq(a, b, m) { if (a !== b) throw new Error((m || "") + " ждали " + JSON.stringify(b) + ", получили " + JSON.stringify(a)); }
function near(a, b, tol, m) { if (Math.abs(a - b) > (tol == null ? 1 : tol)) throw new Error((m || "") + " |" + a + "-" + b + "|>" + tol); }
function noThrow(fn, m) { try { fn(); } catch (e) { throw new Error((m || "бросил") + ": " + e.message); } }

// ---- окружение ----
const { EP, sandbox } = loadPlan();
const M = EP.Plan.Core.model, G = EP.Plan.Geometry;
// UI-хуки Rooms (в тестах — заглушки)
Object.assign(EP.Plan.Rooms, { openSheet: () => {}, closeSheet: () => {}, toast: () => {}, renderScene: () => {}, canvasCmPerPx: () => 0.5 });

function install(extra) {
  const room = M.newRoom(G.rectPoints(0, 0, 400, 300), "R");
  const proj = Object.assign(M.newProject("T"), { rooms: [room] }, extra || {});
  EP.Plan.Core.importJSON(JSON.stringify({ project: proj }));
  const P = EP.Plan.Core.project;
  return { P, room, w: (i) => P.rooms[0].id + ":" + i };
}

// ===== 1. Модель =====
test("newProject: массивы и настройки", () => {
  const p = M.newProject("x");
  ok(Array.isArray(p.beams) && Array.isArray(p.circuits) && Array.isArray(p.openings), "массивы");
  eq(p.settings.chaseW, 25, "chaseW"); eq(p.settings.panelBrand, "IEK", "brand");
});
test("newOpening: виды дверь/окно/раздвижная/балкон", () => {
  eq(M.newOpening("door").kind, "door");
  eq(M.newOpening("window").type, "window");
  eq(M.newOpening("balcony").height, 210);
  eq(M.newOpening("window").sill, 90);
});
test("newBeam: материал и толщина", () => {
  const b = M.newBeam({ x: 0, y: 0 }, { x: 100, y: 0 }, "beam", 12, "ГКЛ");
  eq(b.width, 12); eq(b.material, "ГКЛ"); eq(b.kind, "beam");
  eq(M.newBeam().width, EP.Plan.Core.DEFAULTS.wallThickness, "толщина по умолчанию");
});
test("newCircuit: полюса/кабель/УЗО", () => {
  const c = M.newCircuit("QF1", "#111", 16);
  eq(c.poles, 1); eq(c.rcd, false); eq(c.rcdRating, 30);
});

// ===== 2. Геометрия =====
test("walls: 4 стены у прямоугольника", () => {
  const { P } = install();
  eq(G.walls(P.rooms[0]).length, 4);
});
test("wallFrame: внутренняя нормаль по всем 4 стенам", () => {
  const { P } = install();
  const ws = G.walls(P.rooms[0]);
  const c = G.centroid(P.rooms[0].points);
  ws.forEach((w) => {
    const f = G.wallFrame(P, w);
    ok((c.x - w.mx) * f.nrm.x + (c.y - w.my) * f.nrm.y > 0, "нормаль внутрь у стены " + w.n);
  });
});
test("wallFrame: вогнутая (Г-образная) комната — нормаль у стены выреза не переворачивается наружу", () => {
  // Комната 2 — Г-образная, с вырезом под кладовку (0..160, 300..780); Комната 3 —
  // отдельная соседняя комната, заполняющая вырез. Общий центроид Г-формы у самого
  // выреза может оказаться "не с той" стороны локального сегмента стены — раньше
  // это переворачивало нормаль наружу (в Комнату 3) вместо внутрь (в Комнату 2).
  const L = [{ x: 0, y: 0 }, { x: 390, y: 0 }, { x: 390, y: 780 }, { x: 160, y: 780 }, { x: 160, y: 300 }, { x: 0, y: 300 }];
  const room2 = M.newRoom(L, "Комната 2");
  const room3 = M.newRoom(G.rectPoints(0, 300, 160, 480), "Комната 3");
  const proj = Object.assign(M.newProject("T"), { rooms: [room2, room3] });
  EP.Plan.Core.importJSON(JSON.stringify({ project: proj }));
  const P = EP.Plan.Core.project;
  const w2 = G.walls(P.rooms[0])[4]; // стена выреза со стороны Комнаты 2, (160,300)-(0,300)
  eq(G.wallFrame(P, w2).nrm.y, -1, "нормаль стены Комнаты 2 у выреза смотрит внутрь Комнаты 2 (вверх), не наружу");
  const w3 = G.walls(P.rooms[1])[0]; // та же стена со стороны Комнаты 3
  eq(G.wallFrame(P, w3).nrm.y, 1, "нормаль той же стены со стороны Комнаты 3 смотрит внутрь Комнаты 3 (вниз)");
  // тап с любой стороны общей стены попадает в СВОЮ комнату, а не всегда в одну
  const hitA = G.wallAt(P, { x: 80, y: 295 }, 20);
  eq(hitA.wall.roomId, room2.id, "тап снаружи выреза (в Комнате 2) — стена Комнаты 2");
  const hitB = G.wallAt(P, { x: 80, y: 305 }, 20);
  eq(hitB.wall.roomId, room3.id, "тап внутри кладовки (в Комнате 3) — стена Комнаты 3");
});
test("mergeRoomPolygons: простое соприкосновение одной прямой стеной", () => {
  const r1 = G.rectPoints(0, 0, 300, 300), r2 = G.rectPoints(300, 0, 200, 300);
  const m = G.mergeRoomPolygons(r1, r2);
  ok(m, "слияние удалось");
  near(G.area(m), G.area(r1) + G.area(r2), 1, "площадь = сумма исходных");
});
test("mergeRoomPolygons: с out.gone возвращает координаты исчезнувшей общей стены", () => {
  const r1 = G.rectPoints(0, 0, 300, 300), r2 = G.rectPoints(300, 0, 200, 300);
  const out = {};
  const m = G.mergeRoomPolygons(r1, r2, out);
  ok(m, "слияние удалось");
  ok(out.gone && out.gone.length === 1, "один погашенный отрезок");
  const [a, b] = out.gone[0];
  near(a.x, 300, 1, "погашенный отрезок на линии стыка x=300"); near(b.x, 300, 1, "погашенный отрезок на линии стыка x=300");
  near(Math.abs(a.y - b.y), 300, 1, "длина погашенного отрезка = длине общей стены");
});
test("mergeRoomPolygons: стена соседа короче/частично перекрывает стену первой комнаты", () => {
  const r1 = G.rectPoints(0, 0, 390, 300), r2 = G.rectPoints(160, 300, 230, 480);
  const m = G.mergeRoomPolygons(r1, r2);
  ok(m, "слияние удалось при частичном перекрытии стены");
  near(G.area(m), G.area(r1) + G.area(r2), 1, "площадь = сумма исходных");
});
test("mergeRoomPolygons: угловой стык (соседняя комната ровно в угловой вырез — 2 отрезка стены)", () => {
  const L = [{ x: 0, y: 0 }, { x: 390, y: 0 }, { x: 390, y: 780 }, { x: 160, y: 780 }, { x: 160, y: 300 }, { x: 0, y: 300 }];
  const cladovka = G.rectPoints(0, 300, 160, 480);
  const m = G.mergeRoomPolygons(L, cladovka);
  ok(m, "слияние через угол удалось");
  near(G.area(m), 390 * 780, 1, "площадь = полный прямоугольник (вырез заполнен)");
  eq(m.length, 4, "результат — чистый прямоугольник без мусорных точек на стыке");
});
test("mergeRoomPolygons: цепочка слияний — угловой стык может возникнуть НЕ на первом шаге", () => {
  const topStrip = G.rectPoints(0, 0, 390, 300), rightPart = G.rectPoints(160, 300, 230, 480), cladovka = G.rectPoints(0, 300, 160, 480);
  const m1 = G.mergeRoomPolygons(topStrip, rightPart);
  ok(m1, "1й шаг (одна стена) удался");
  const m2 = G.mergeRoomPolygons(m1, cladovka);
  ok(m2, "2й шаг (угловой стык) тоже удался");
  near(G.area(m2), 390 * 780, 1, "после обоих слияний — полный прямоугольник");
});
test("mergeRoomPolygons: не соприкасаются — null, без порчи данных", () => {
  const far1 = G.rectPoints(0, 0, 100, 100), far2 = G.rectPoints(500, 500, 100, 100);
  eq(G.mergeRoomPolygons(far1, far2), null, "далёкие комнаты — null");
});
test("mergeRoomPolygons: комнаты НАКЛАДЫВАЮТСЯ площадью (не просто соприкасаются) — null", () => {
  const ov1 = G.rectPoints(0, 0, 200, 200), ov2 = G.rectPoints(100, 100, 200, 200);
  eq(G.mergeRoomPolygons(ov1, ov2), null, "наложение — безопасный отказ, не мусорный полигон");
});

// ===== EP.Plan.Rooms.mergeRooms: слияние комнат уровня проекта (стены/точки/проёмы) =====
test("mergeRooms: успешное слияние — 2 комнаты становятся 1, площадь верна", () => {
  const { P } = install();
  const roomB = M.newRoom(G.rectPoints(400, 0, 200, 300), "B");
  P.rooms.push(roomB);
  const before = G.area(P.rooms[0].points) + G.area(P.rooms[1].points);
  const merged = EP.Plan.Rooms.mergeRooms(P.rooms[0].id, P.rooms[1].id);
  ok(merged, "слияние прошло");
  eq(P.rooms.length, 1, "осталась одна комната");
  near(G.area(P.rooms[0].points), before, 1, "площадь объединённой = сумме исходных");
});
test("mergeRooms: точка на НЕ общей стене переносится на новую комнату с сохранением мировой позиции", () => {
  const { P, w } = install();
  const roomB = M.newRoom(G.rectPoints(400, 0, 200, 300), "B");
  P.rooms.push(roomB);
  const s1 = M.newElement("socket", w(0), 100, 30, "power"); // верхняя стена комнаты A — НЕ общая с B
  P.elements.push(s1);
  const before = G.elemPoint(P, s1);
  const merged = EP.Plan.Rooms.mergeRooms(P.rooms[0].id, roomB.id);
  ok(merged, "слияние прошло");
  const after = G.elemPoint(P, s1);
  ok(after, "точка не потеряна (осталась на стене)");
  near(after.x, before.x, 1, "мировая позиция X сохранена"); near(after.y, before.y, 1, "мировая позиция Y сохранена");
  eq(String(s1.wallId).split(":")[0], merged.id, "wallId точки указывает на объединённую комнату");
});
test("mergeRooms: точка РОВНО на общей (исчезающей) стене — слияние блокируется, ничего не портится", () => {
  const { P } = install();
  const roomB = M.newRoom(G.rectPoints(400, 0, 200, 300), "B");
  P.rooms.push(roomB);
  const s1 = M.newElement("socket", P.rooms[0].id + ":1", 100, 30, "power"); // общая стена A/B (x=400)
  P.elements.push(s1);
  const merged = EP.Plan.Rooms.mergeRooms(P.rooms[0].id, roomB.id);
  eq(merged, null, "слияние отклонено");
  eq(P.rooms.length, 2, "комнаты не тронуты");
  eq(s1.wallId, P.rooms[0].id + ":1", "wallId точки не тронут");
});
test("mergeRooms: толщина/материал СОХРАНИВШЕЙСЯ (не общей) стены наследуются от исходной комнаты", () => {
  const { P } = install();
  P.rooms[0].wallTh = [25, null, null, null]; // верхняя стена комнаты A (i=0) потолще — НЕ общая с B
  P.rooms[0].wallMat = ["Кирпич", null, null, null];
  const roomB = M.newRoom(G.rectPoints(0, 300, 400, 200), "B"); // снизу, общая стена — i=2 (нижняя A)
  P.rooms.push(roomB);
  const merged = EP.Plan.Rooms.mergeRooms(P.rooms[0].id, roomB.id);
  ok(merged, "слияние прошло");
  // верхняя стена (0,0)-(400,0) должна пережить слияние — ищем её в объединённой комнате
  const w = G.walls(merged).find((ww) => G.dist(ww.a, { x: 0, y: 0 }) < 1 && G.dist(ww.b, { x: 400, y: 0 }) < 1);
  ok(w, "верхняя стена никуда не делась после слияния");
  eq(G.wallThOf(P, w), 25, "толщина унаследована на новом индексе стены");
  eq(G.wallMatOf(P, w), "Кирпич", "материал унаследован на новом индексе стены");
});
test("mergeRooms: opts.remnant:'lintel' — на месте погашенной стены появляется балка kind:lintel", () => {
  const { P } = install();
  P.rooms[0].wallTh = [null, 18, null, null]; // правая (общая с B) стена A потолще обычной
  P.rooms[0].wallMat = [null, "Кирпич", null, null];
  const roomB = M.newRoom(G.rectPoints(400, 0, 200, 300), "B");
  P.rooms.push(roomB);
  eq((P.beams || []).length, 0, "балок изначально нет");
  const merged = EP.Plan.Rooms.mergeRooms(P.rooms[0].id, roomB.id, { remnant: "lintel" });
  ok(merged, "слияние прошло");
  eq(P.beams.length, 1, "появилась одна перемычка");
  const bm = P.beams[0];
  eq(bm.kind, "lintel", "тип — перемычка");
  near(bm.a.x, 400, 1, "балка на линии исчезнувшей стены x=400"); near(bm.b.x, 400, 1, "балка на линии исчезнувшей стены x=400");
  eq(bm.width, 18, "толщина унаследована от исчезнувшей стены");
  eq(bm.material, "Кирпич", "материал унаследован от исчезнувшей стены");
});
test("mergeRooms: opts.remnant:'beam' — на месте погашенной стены появляется сплошная перегородка kind:beam", () => {
  const { P } = install();
  P.rooms[0].wallTh = [null, 18, null, null];
  P.rooms[0].wallMat = [null, "Кирпич", null, null];
  const roomB = M.newRoom(G.rectPoints(400, 0, 200, 300), "B");
  P.rooms.push(roomB);
  const merged = EP.Plan.Rooms.mergeRooms(P.rooms[0].id, roomB.id, { remnant: "beam" });
  ok(merged, "слияние прошло");
  eq(P.beams.length, 1, "появилась одна перегородка");
  eq(P.beams[0].kind, "beam", "тип — перегородка (не перемычка)");
  eq(P.beams[0].width, 18, "толщина унаследована от исчезнувшей стены");
});
test("mergeRooms: без opts.remnant — балка не добавляется (поведение по умолчанию не меняется)", () => {
  const { P } = install();
  const roomB = M.newRoom(G.rectPoints(400, 0, 200, 300), "B");
  P.rooms.push(roomB);
  const merged = EP.Plan.Rooms.mergeRooms(P.rooms[0].id, roomB.id);
  ok(merged, "слияние прошло");
  eq((P.beams || []).length, 0, "без remnant балка не создаётся");
});
test("mergeRooms: несоприкасающиеся комнаты — null, ничего не меняется", () => {
  const { P } = install();
  const roomB = M.newRoom(G.rectPoints(1000, 1000, 200, 300), "B");
  P.rooms.push(roomB);
  eq(EP.Plan.Rooms.mergeRooms(P.rooms[0].id, roomB.id), null, "не соприкасаются — null");
  eq(P.rooms.length, 2, "комнаты не тронуты");
});
test("beamWall: перегородка резолвится как стена", () => {
  const { P } = install({ beams: [M.newBeam({ x: 0, y: 150 }, { x: 300, y: 150 }, "beam", 8, "ГКЛ")] });
  const bw = G.wallById(P, "beam:" + P.beams[0].id);
  ok(bw && bw.isBeam, "isBeam"); near(bw.len, 300, 1, "len");
});
test("spansMinusOpenings: окно рвёт стену на 2 участка", () => {
  const { P, w } = install({ openings: [M.newOpening("window", null, 120)] });
  P.openings[0].wallId = w(0);
  const wall = G.wallById(P, w(0));
  eq(G.spansMinusOpenings(wall.len, G.openingsOnWall(P, w(0))).length, 2);
});
test("elemDrawPoint: отступ от стены ОДИНАКОВЫЙ (не зависит от QF)", () => {
  const q1 = M.newCircuit("QF1", "#e11", 16), q2 = M.newCircuit("QF2", "#1e1", 16);
  const { P, w } = install({ circuits: [q1, q2] });
  const s1 = M.newElement("socket", w(0), 100, 30, "power"); s1.circuitId = q1.id;
  const s2 = M.newElement("socket", w(0), 100, 30, "power"); s2.circuitId = q2.id;
  P.elements.push(s1, s2);
  const d0 = G.elemPoint(P, s1), d1 = G.elemDrawPoint(P, s1), d2 = G.elemDrawPoint(P, s2);
  ok(Math.hypot(d1.x - d0.x, d1.y - d0.y) > 4, "маркер отступает от стены");
  ok(Math.hypot(d1.x - d2.x, d1.y - d2.y) < 0.5, "точки на разных QF — одинаковый отступ (не расползаются)");
});
test("общая стена: проём режет обе полосы (соседние комнаты)", () => {
  const r1 = M.newRoom(G.rectPoints(0, 0, 400, 300), "R1");
  const r2 = M.newRoom(G.rectPoints(410, 0, 300, 300), "R2"); // R2 слева граничит с правой стеной R1
  const proj = Object.assign(M.newProject("T"), { rooms: [r1, r2] });
  EP.Plan.Core.importJSON(JSON.stringify({ project: proj }));
  const P = EP.Plan.Core.project;
  const r1w1 = P.rooms[0].id + ":1"; // правая стена R1 (x=400)
  const op = M.newOpening("door", r1w1, 100); P.openings.push(op);
  // левая стена R2 (x=410) — её id :3
  const r2left = G.wallById(P, P.rooms[1].id + ":3");
  const spans = G.wallOpeningSpans(P, r2left);
  ok(spans.length >= 1, "проём с соседней стены спроецирован на общую (" + spans.length + ")");
});
test("blockEntry: авто «середина левого» и ручной выбор", () => {
  const blk = M.newElement("block", "x", 0, 30, "power");
  blk.params = { items: ["s", "s", "s", "s"] };
  eq(G.blockEntryIndex(blk), 1, "авто для 4 постов");
  blk.entryPost = 3; eq(G.blockEntryIndex(blk), 3, "ручной");
});

// ===== 3. Автотрассировка =====
function scene(withJunc) {
  const q1 = M.newCircuit("QF1", "#e11", 16), q2 = M.newCircuit("QF2", "#1e1", 16);
  const { P, w } = install({ circuits: [q1, q2], panels: [M.newPanel(200, 295)] });
  const s1 = M.newElement("socket", w(0), 80, 30, "power"); s1.circuitId = q1.id;
  const s2 = M.newElement("socket", w(2), 80, 30, "power"); s2.circuitId = q2.id;
  const els = [s1, s2];
  if (withJunc) { const j = M.newElement("junction", w(0), 150, 240, "routes"); j.circuitId = q1.id; els.push(j); }
  P.elements.push(...els);
  return { P, q1, q2, s1, s2 };
}
test("routing: строит трассы и считает длину", () => {
  const { P } = scene(false);
  EP.Plan.Routes.build();
  ok(P.routes.length > 0, "есть трассы");
  ok(EP.Plan.Routes.lengths(P).total > 0, "длина > 0");
});
test("routing: шлейф без распаек соединяется с щитом один раз", () => {
  const q1 = M.newCircuit("QF1", "#e11", 16);
  const { P, w } = install({ circuits: [q1], panels: [M.newPanel(0, 0)] });
  [60, 160, 260].forEach((o) => { const s = M.newElement("socket", w(0), o, 30, "power"); s.circuitId = q1.id; P.elements.push(s); });
  EP.Plan.Routes.build();
  eq(P.routes.filter((r) => r.toPanel).length, 1, "к щиту один раз");
  ok(P.routes.some((r) => { const to = P.elements.find((e) => e.id === r.toId); return to && to.type === "socket"; }), "розетка→розетка есть");
});
test("routing: сечение штробы 25×30, тёплый пол 50×50", () => {
  const { P } = scene(false);
  EP.Plan.Routes.build();
  const r = P.routes[0];
  eq(r.chaseW, 25); eq(r.chaseH, 30);
});
test("routing: блок — трасса ко входу штробы, не в центр", () => {
  const q1 = M.newCircuit("QF1", "#e11", 16);
  const { P, w } = install({ circuits: [q1], panels: [M.newPanel(200, 295)] });
  const blk = M.newElement("block", w(0), 200, 30, "power");
  blk.params = { items: ["socket", "socket", "socket"] }; blk.circuitId = q1.id; blk.entryPost = 2;
  P.elements.push(blk);
  const a = G.routeAnchor(P, blk), c = G.elemDrawPoint(P, blk);
  ok(Math.hypot(a.x - c.x, a.y - c.y) > 1, "вход штробы смещён от центра");
});
test("build(): тёплый пол (ТП) тоже получает трассу (раньше исключался из isPoint)", () => {
  const q1 = M.newCircuit("QF1", "#e11", 16);
  const { P } = install({ circuits: [q1], panels: [M.newPanel(50, 50)] });
  const wf = M.newElement("warmfloor", null, 0, 0, "warm"); wf.params = { x: 200, y: 150 }; wf.circuitId = q1.id;
  P.elements.push(wf);
  EP.Plan.Routes.build();
  ok(P.routes.some((r) => r.fromId === wf.id), "у тёплого пола есть построенная трасса");
});
test("hitAt: тап попадает по ВИДИМОМУ маркеру (elemDrawPoint), а не по оси стены", () => {
  const { P, w } = install();
  const s1 = M.newElement("socket", w(0), 100, 30, "power");
  P.elements.push(s1);
  const drawPt = G.elemDrawPoint(P, s1);
  ok(G.dist(drawPt, G.elemPoint(P, s1)) > 5, "маркер реально смещён от оси стены (th/2+8)");
  const hit = EP.Plan.Elements.hitAt(drawPt, 5); // маленький радиус — по оси стены не попал бы
  ok(hit && hit.el && hit.el.id === s1.id, "тап по маркеру находит элемент, а не стену");
});

// ===== 4. Однолинейка + щит =====
test("scheme: линия с УЗО -> дифавтомат, без -> автомат", () => {
  const q1 = M.newCircuit("QF1", "#e11", 16), q2 = M.newCircuit("QF2", "#1e1", 10);
  q1.rcd = true; q2.cable = "3×1.5";
  const { P } = install({ circuits: [q1, q2] });
  const tree = EP.Plan.Scheme.buildTree(P);
  eq(tree.children[0].type, "rcbo", "УЗО -> диф");
  eq(tree.children[1].type, "mcb", "без УЗО -> автомат");
  eq(tree.children[1].cable, "3×1.5", "ручной кабель");
});
test("scheme: рисуется валидный SVG", () => {
  const q1 = M.newCircuit("QF1", "#e11", 16);
  const { P } = install({ circuits: [q1] });
  const svg = fakeNode();
  noThrow(() => sandbox.ShieldSchemeSVG.render(svg, EP.Plan.Scheme.buildTree(P)), "render схемы");
  ok(svg.innerHTML.length > 300, "svg непустой");
});
test("phaseBalance: 1-полюсные линии считаются по своей фазе, 3-полюсная — во все три", () => {
  const q1 = M.newCircuit("QF1", "#e11", 16); q1.phase = 1;
  const q2 = M.newCircuit("QF2", "#1e1", 25); q2.phase = 2;
  const q3 = M.newCircuit("QF3-плита", "#11e", 32); q3.poles = 3; // висит на всех трёх фазах
  const { P } = install({ circuits: [q1, q2, q3] });
  const b = EP.Plan.Scheme.phaseBalance(P);
  eq(b.t[1], 16 + 32, "L1 = QF1 + база от 3P");
  eq(b.t[2], 25 + 32, "L2 = QF2 + база от 3P");
  eq(b.t[3], 32, "L3 = только база от 3P (нет 1P-линий на ней)");
});
test("phaseBalance: сильный перекос помечается warn", () => {
  const q1 = M.newCircuit("QF1", "#e11", 63); q1.phase = 1;
  const q2 = M.newCircuit("QF2", "#1e1", 6); q2.phase = 2;
  const q3 = M.newCircuit("QF3", "#11e", 6); q3.phase = 3;
  const { P } = install({ circuits: [q1, q2, q3] });
  ok(EP.Plan.Scheme.phaseBalance(P).warn, "63А на одной фазе против 6А на других — перекос");
});
test("autoBalancePhases: жадно раскидывает линии, разбаланс не растёт", () => {
  const cs = [16, 16, 16, 16, 16, 16].map((a, i) => M.newCircuit("QF" + (i + 1), "#e11", a));
  const { P } = install({ circuits: cs });
  EP.Plan.Scheme.autoBalancePhases(P);
  const b = EP.Plan.Scheme.phaseBalance(P);
  eq(b.t[1], 32, "6×16А поровну по 2 на фазу"); eq(b.t[2], 32); eq(b.t[3], 32);
  ok(!b.warn, "после автобаланса перекоса нет");
});

// ===== 5. Проёмы =====
test("openingNum: нумерация по видам О1/Дв1", () => {
  const { P, w } = install();
  const o1 = M.newOpening("window", w(0), 50), o2 = M.newOpening("window", w(0), 200), d1 = M.newOpening("door", w(0), 300);
  P.openings.push(o1, o2, d1);
  eq(EP.Plan.Elements.openingNum(P, o2), "О2");
  eq(EP.Plan.Elements.openingNum(P, d1), "Д1");
});

// ===== 6. Проверки норм =====
test("rules: badSet -> Set, ловит точку в проёме", () => {
  const { P, w } = install();
  const win = M.newOpening("window", w(0), 100); P.openings.push(win);
  const s = M.newElement("socket", w(0), 150, 30, "power"); P.elements.push(s); // 150 в диапазоне окна 100..240
  const bad = EP.Plan.Rules.run(P).badIds;
  ok(bad && typeof bad.has === "function", "Set");
  ok(bad.has(s.id), "точка в проёме помечена");
});

// ===== 6b. Проверки ПУЭ по линиям =====
test("ПУЭ: розетки без УЗО -> предупреждение", () => {
  const q1 = M.newCircuit("QF1", "#e11", 16); q1.rcd = false;
  const { P, w } = install({ circuits: [q1] });
  const s = M.newElement("socket", w(0), 100, 30, "power"); s.circuitId = q1.id; P.elements.push(s);
  const msgs = EP.Plan.Rules.run(P).issues.map((i) => i.msg).join(" | ");
  ok(/УЗО/.test(msgs), "нет предупреждения об УЗО");
});
test("ПУЭ: мощный потребитель смешан с розетками -> отдельная линия", () => {
  const q1 = M.newCircuit("QF1", "#e11", 16); q1.rcd = true;
  const { P, w } = install({ circuits: [q1] });
  const s = M.newElement("socket", w(0), 100, 30, "power"); s.circuitId = q1.id;
  const ac = M.newElement("ac", w(0), 200, 220, "ac"); ac.circuitId = q1.id;
  P.elements.push(s, ac);
  const msgs = EP.Plan.Rules.run(P).issues.map((i) => i.msg).join(" | ");
  ok(/отдельн/.test(msgs), "нет предупреждения об отдельной линии");
});
test("ПУЭ: тонкий кабель под автомат -> предупреждение", () => {
  const q1 = M.newCircuit("QF1", "#e11", 25); q1.rcd = true; q1.cable = "3×1.5"; // 1.5 -> макс 10A, а автомат 25A
  const { P, w } = install({ circuits: [q1] });
  const s = M.newElement("socket", w(0), 100, 30, "power"); s.circuitId = q1.id; P.elements.push(s);
  const msgs = EP.Plan.Rules.run(P).issues.map((i) => i.msg).join(" | ");
  ok(/мал для автомата/.test(msgs), "нет предупреждения о сечении");
});

// ===== 6c. PWA (manifest + service worker) =====
test("PWA: manifest валиден и содержит нужные поля", () => {
  const fs = require("fs"), path = require("path");
  const m = JSON.parse(fs.readFileSync(path.resolve(__dirname, "..", "manifest.webmanifest"), "utf8"));
  eq(m.display, "standalone", "display");
  ok(m.start_url && m.scope, "start_url/scope");
  ok(Array.isArray(m.icons) && m.icons.length > 0, "иконки");
});
test("PWA: sw.js без синтаксических ошибок", () => {
  const { execSync } = require("child_process"), path = require("path");
  noThrow(() => execSync("node --check " + path.resolve(__dirname, "..", "sw.js")), "sw.js синтаксис");
});

// ===== 7. Рендер =====
test("render: полная сцена без ошибок", () => {
  const q1 = M.newCircuit("QF1", "#e11", 16);
  const { P, w } = install({ circuits: [q1], panels: [M.newPanel(200, 295)], beams: [M.newBeam({ x: 0, y: 150 }, { x: 400, y: 150 }, "beam", 10, "Кирпич")] });
  const blk = M.newElement("block", w(3), 150, 30, "power"); blk.params = { items: ["socket", "switch"] }; blk.circuitId = q1.id;
  const op = M.newOpening("door", w(0), 150);
  P.elements.push(blk); P.openings.push(op);
  const sw = M.newElement("switch", w(0), 60, 90, "light"); sw.circuitId = q1.id;
  P.elements.push(sw);
  P.ledStrips.push(M.newLedStrip(w(0), 200, 300, 220, q1.id));
  P.panels[0].transformer = true;
  noThrow(() => EP.Plan.Render.draw(fakeCanvas(), P, { selectedRoomId: P.rooms[0].id, draft: { points: [] }, ruler: {}, beamDraft: {} }), "Render.draw");
});
test("switchLedTarget: находит ленту той же линии в той же комнате", () => {
  const { P, w } = install();
  const cc = M.newCircuit("QF1 LED", "#fbbf24", 6); P.circuits.push(cc);
  const sw = M.newElement("switch", w(0), 100, 90, "light"); sw.circuitId = cc.id;
  P.elements.push(sw);
  const ls = M.newLedStrip(w(0), 150, 250, 220, cc.id);
  P.ledStrips.push(ls);
  const target = G.switchLedTarget(P, sw, 0);
  ok(target && target.id === ls.id, "нашёл ленту той же линии");
});
test("switchLedTarget: без общей линии (circuitId) связь не строим", () => {
  const { P, w } = install();
  const cc1 = M.newCircuit("QF1", "#e11", 16), cc2 = M.newCircuit("QF2 LED", "#fbbf24", 6);
  P.circuits.push(cc1, cc2);
  const sw = M.newElement("switch", w(0), 100, 90, "light"); sw.circuitId = cc1.id;
  P.elements.push(sw);
  P.ledStrips.push(M.newLedStrip(w(0), 150, 250, 220, cc2.id));
  eq(G.switchLedTarget(P, sw, 0), null, "разные линии — связи нет");
});
test("panelBox: подбор корпуса по числу модулей (сцена → IEK)", () => {
  const cs = []; for (let i = 1; i <= 8; i++) { const c = M.newCircuit("QF" + i, "#e11", 16); if (i > 6) c.rcd = true; cs.push(c); }
  const { P } = install({ circuits: cs, panels: [M.newPanel(200, 295)] });
  P.settings.mainRcd = true; P.settings.panelReserve = 6; P.settings.panelBrand = "IEK";
  // 1(ввод)+2(УЗО)+6(авт)+4(диф) +6(запас)=19 -> IEK 24
  const need = (P.settings.phases === 3 ? 3 : 1) + 2 + cs.reduce((m, c) => m + (c.rcd ? 2 : 1), 0) + 6;
  eq(need, 19, "нужно модулей");
  const boxes = EP.Plan.Core.DEFAULTS.panelBoxes.IEK;
  const cap = Object.keys(boxes.sizes).map(Number).sort((a, b) => a - b).find((k) => k >= need);
  eq(cap, 24, "корпус IEK 24 мод");
});

// ===== 8. undo/redo, import/export, бэкофилл =====
test("undo/redo восстанавливают состояние", () => {
  const { P, w } = install();
  const c = EP.Plan.Core;
  const n0 = P.elements.length;
  c.commit(); c.project.elements.push(M.newElement("tv", w(0), 300, 130, "tv")); c.persist("add");
  const n1 = c.project.elements.length;
  c.undo(); eq(c.project.elements.length, n0, "после undo");
  c.redo(); eq(c.project.elements.length, n1, "после redo");
});
test("export/import JSON roundtrip", () => {
  const q1 = M.newCircuit("QF1", "#e11", 16);
  const { P, w } = install({ circuits: [q1], openings: [M.newOpening("window", null, 100)], beams: [M.newBeam({ x: 0, y: 150 }, { x: 300, y: 150 }, "beam", 8, "ГКЛ")] });
  P.openings[0].wallId = w(0);
  const js = EP.Plan.Core.exportJSON();
  const imp = EP.Plan.Core.importJSON(js);
  eq(imp.rooms.length, 1); eq(imp.circuits.length, 1); eq(imp.openings.length, 1); eq(imp.beams.length, 1);
});

// ===== 9. Стены-чертёж + счёт по трассам (пакет А+В) =====
test("roomBand: митра-стыки, внешняя/внутренняя грань", () => {
  const { P } = install();
  const band = G.roomBand(P, P.rooms[0]); // 400×300, th=10
  ok(band && band.outer.length === 4 && band.inner.length === 4, "две грани по 4 угла");
  near(band.outer[0].x, -5, 0.01, "outer x"); near(band.outer[0].y, -5, 0.01, "outer y");
  near(band.outer[2].x, 405, 0.01); near(band.outer[2].y, 305, 0.01);
  near(band.inner[0].x, 5, 0.01, "inner x"); near(band.inner[0].y, 5, 0.01, "inner y");
  near(band.inner[2].x, 395, 0.01); near(band.inner[2].y, 295, 0.01);
});
test("wallThOf/wallMatOf: переопределение на конкретную стену", () => {
  const { P, w } = install();
  P.rooms[0].wallTh = { 0: 20 };
  P.rooms[0].wallMat = { 1: "ГКЛ" };
  eq(G.wallThOf(P, G.wallById(P, w(0))), 20, "стена 0 толще");
  eq(G.wallThOf(P, G.wallById(P, w(1))), 10, "стена 1 по умолчанию");
  eq(G.wallMatOf(P, G.wallById(P, w(1))), "ГКЛ", "материал стены 1");
  eq(G.wallMatOf(P, G.wallById(P, w(2))), "Бетон", "материал по умолчанию");
  // митра учитывает разную толщину: угол 0 = пересечение граней стен 3 (th 10) и 0 (th 20)
  const band = G.roomBand(P, P.rooms[0]);
  near(band.outer[0].x, -5, 0.01, "по стене 3");
  near(band.outer[0].y, -10, 0.01, "по толстой стене 0");
});
test("elemDrawPoint: отступ по толщине СВОЕЙ стены", () => {
  const { P, w } = install();
  P.rooms[0].wallTh = { 0: 20 };
  const e1 = M.newElement("socket", w(0), 100, 30, "power");
  P.elements.push(e1);
  const dp = G.elemDrawPoint(P, e1);
  near(dp.y, 18, 0.01, "отступ = 20/2+8");
});
test("calcByRoutes: штробы/подрозетники/кабель/ниша по чертежу", () => {
  const { P, w } = install();
  const pn = M.newPanel(50, 50, "Щ");
  P.panels.push(pn);
  P.settings.panelBox = { brand: "IEK", modules: 24, wmm: 395, hmm: 310, dmm: 120 };
  const s1 = M.newElement("socket", w(0), 100, 30, "power");
  const sw1 = M.newElement("switch", w(1), 150, 90, "light");
  P.elements.push(s1, sw1);
  const rt = M.newRoute("power", "ceiling", [{ x: 100, y: 18 }, { x: 100, y: 50 }, { x: 50, y: 50 }], s1.id, pn.id);
  rt.toPanel = true;
  P.routes.push(rt);
  const res = EP.Plan.Calc.calcByRoutes(P);
  ok(res && res.items.length, "есть позиции");
  // спуск точки: 270-30=240; спуск щита: 270-150=120 → 3.6 м штробы 25x30 по бетону
  const strb = res.items.find((i) => i.name === "Штробление 25x30 бетон");
  ok(strb, "есть штробление по материалу");
  near(strb.qty, 3.6, 0.05, "метры штробы по трассе");
  // подрозетники: розетка (обычный) — бетон; выключатель (глубокий) — бетон
  const drillStd = res.items.find((i) => i.name.indexOf("обычных бетон") >= 0);
  const drillDeep = res.items.find((i) => i.name.indexOf("глубоких бетон") >= 0);
  ok(drillStd && drillStd.qty === 1, "1 обычный");
  ok(drillDeep && drillDeep.qty === 1, "1 глубокий");
  // кабель: (32+50)горизонталь + 240 + 120 = 442 см × 1.1 запас = 4.9 м
  const cab = res.items.find((i) => i.name.indexOf("3×2.5") >= 0);
  ok(cab, "кабель по марке");
  near(cab.qty, 4.9, 0.05, "метры кабеля с запасом");
  // ниша под щит — как в конфигураторе щита
  const niche = res.items.find((i) => i.name.indexOf("Вырубка ниши") >= 0);
  ok(niche && niche.qty === 24, "вырубка × модули");
  ok(res.items.some((i) => i.name === "Монтаж щита в нишу/стену"), "монтаж щита");
});
test("calcByRoutes: слаботочка не сливается с силовой", () => {
  const { P, w } = install();
  const pn = M.newPanel(50, 50, "Щ"); P.panels.push(pn);
  const tv1 = M.newElement("tv", w(0), 100, 130, "tv");
  P.elements.push(tv1);
  const r1 = M.newRoute("tv", "ceiling", [{ x: 100, y: 18 }, { x: 50, y: 50 }], tv1.id, pn.id); r1.toPanel = true;
  P.routes.push(r1);
  const res = EP.Plan.Calc.calcByRoutes(P);
  // слаботочка — ОТДЕЛЬНАЯ строка с суффиксом (не совпадает с силовой той же ширины)
  const lv = res.items.find((i) => i.name === "Штробление 25x30 бетон (слаботочка)");
  ok(lv, "слаботочка — своя строка");
  near(lv.qty, 2.6, 0.05, "свой спуск (140см) + спуск у щита (120см)");
  ok(res.items.some((i) => i.name.indexOf("Слаботочный") >= 0), "марка слаботочки");
});
test("calcByRoutes: ТП — подача обычной штробой + ВСЕГДА 50×50 в пол отдельно", () => {
  const { P, w } = install();
  const pn = M.newPanel(50, 50, "Щ"); P.panels.push(pn);
  const tp = M.newElement("warmfloor", w(2), 200, 30, "warm"); // термостат на стене, 30см от пола
  P.elements.push(tp);
  const r = M.newRoute("warm", "ceiling", [{ x: 200, y: 282 }, { x: 50, y: 50 }], tp.id, pn.id); r.toPanel = true;
  P.routes.push(r);
  const res = EP.Plan.Calc.calcByRoutes(P);
  // подача к термостату: потолок(270)-высота(30)=240см силовой штробой + спуск у щита 120см = 3.6м
  const pw = res.items.find((i) => i.name === "Штробление 25x30 бетон");
  ok(pw, "подача к термостату — обычная штроба (не 50×50)");
  near(pw.qty, 3.6, 0.05, "спуск к термостату 240см + у щита 120см");
  // от термостата вниз в пол — ВСЕГДА 50×50, равно высоте термостата (30см)
  const warm = res.items.find((i) => i.name === "Штробление 50x50 бетон");
  ok(warm, "от термостата в пол — отдельная 50×50 строка");
  near(warm.qty, 0.3, 0.02, "от термостата (30см) до пола");
});
test("calcByRoutes: коннекторы (распайки + разводка выключателей) из графа трасс", () => {
  const { P, w } = install();
  const pn = M.newPanel(50, 50, "Щ"); P.panels.push(pn);
  const j = M.newElement("junction", w(0), 100, 0, "routes");
  P.elements.push(j);
  // 3 точки заходят в распайку + 1 выход к щиту = 4 конца сходятся в коробке
  for (let i = 0; i < 3; i++) {
    const e2 = M.newElement("socket", w(0), 50 + i * 10, 30, "power");
    P.elements.push(e2);
    P.routes.push(M.newRoute("power", "ceiling", [{ x: 50 + i * 10, y: 20 }, { x: 100, y: 0 }], e2.id, j.id));
  }
  const rj = M.newRoute("power", "ceiling", [{ x: 100, y: 0 }, { x: 50, y: 50 }], j.id, pn.id);
  rj.toPanel = true;
  P.routes.push(rj);
  const sw1 = M.newElement("switch", w(1), 60, 90, "light");
  const sw2 = M.newElement("switch", w(1), 120, 90, "light");
  P.elements.push(sw1, sw2);
  const res = EP.Plan.Calc.calcByRoutes(P);
  eq(P.settings.connectorMode, "gml", "режим по умолчанию — гильзы");
  const gml4 = res.items.find((i) => i.name === "ГМЛ 4");
  ok(gml4, "распайка (pin4×3) и выключатели (pin2×8) — обе группы в типоразмер ГМЛ 4 (≤4 провода)");
  eq(gml4.qty, 11, "3(коробка: 3 входа+1 выход) + 8(2 выключателя × шаблон pin2×4)");
  const shrink = res.items.find((i) => i.name === "Термоусадка 12/4");
  ok(shrink && shrink.qty > 0, "термоусадка на стыки гильз");
});
test("calcByRoutes: коннекторы в режиме ВАГО — без термоусадки", () => {
  const { P, w } = install();
  const pn = M.newPanel(50, 50, "Щ"); P.panels.push(pn);
  P.settings.connectorMode = "wago";
  const sw1 = M.newElement("switch", w(1), 60, 90, "light");
  P.elements.push(sw1);
  const s1 = M.newElement("socket", w(0), 100, 30, "power");
  P.elements.push(s1);
  const rt = M.newRoute("power", "ceiling", [{ x: 100, y: 18 }, { x: 50, y: 50 }], s1.id, pn.id);
  rt.toPanel = true;
  P.routes.push(rt);
  const res = EP.Plan.Calc.calcByRoutes(P);
  const wago = res.items.find((i) => i.name === "ВАГО 2-пин");
  ok(wago && wago.qty === 4, "1 выключатель → pin2×4 (шаблон switch_1)");
  ok(!res.items.some((i) => i.name.indexOf("Термоусадка") >= 0), "ВАГО — без термоусадки");
});
test("priceFor: цена из EP.Database по совпадению названия (точное и по подстроке)", () => {
  const savedDb = EP.Database;
  EP.Database = { getItemsByType: (type) => type === "material" ? [{ name: "Кабель ВВГнг(А)-LS 3×2.5", price: 55, type: "material" }] : [] };
  try {
    eq(EP.Plan.Calc.priceFor("Кабель ВВГнг(А)-LS 3×2.5", "material"), 55, "точное совпадение");
    eq(EP.Plan.Calc.priceFor("Кабель ВВГнг(А)-LS 3×2.5 (доп)", "material"), 55, "совпадение по подстроке");
    eq(EP.Plan.Calc.priceFor("Совсем другое", "material"), 0, "нет совпадения — 0");
  } finally { EP.Database = savedDb; }
});
test("Расчёт: цены из БД показаны в шторке — есть строка «Итого» и найденная цена", () => {
  const q1 = M.newCircuit("QF1", "#e11", 16);
  const { P, w } = install({ circuits: [q1], panels: [M.newPanel(200, 295)] });
  const s1 = M.newElement("socket", w(0), 80, 30, "power"); s1.circuitId = q1.id;
  P.elements.push(s1);
  EP.Plan.Routes.build();
  const savedDb = EP.Database, savedOpen = EP.Plan.Rooms.openSheet;
  EP.Database = { getItemsByType: (type) => type === "material" ? [{ name: "Кабель ВВГнг(А)-LS 3×2.5", price: 55, type: "material" }] : [] };
  let captured = "";
  EP.Plan.Rooms.openSheet = (html) => { captured = html; };
  try { EP.Plan.Calc.sheet(); } finally { EP.Plan.Rooms.openSheet = savedOpen; EP.Database = savedDb; }
  ok(captured.indexOf("Итого по ценам БД") >= 0, "строка итога есть");
  ok(captured.indexOf("₽") >= 0, "хотя бы одна цена подтянулась и показана");
});
test("автоперестройка трасс: elem-move тихо перестраивает построенные трассы", () => {
  const { P, w } = install();
  const pn = M.newPanel(50, 50, "Щ"); P.panels.push(pn);
  const s1 = M.newElement("socket", w(0), 100, 30, "power");
  P.elements.push(s1);
  EP.Plan.Routes.build();
  ok(P.routes.length > 0, "трассы построены");
  const before = JSON.stringify(P.routes[0].points);
  const c = EP.Plan.Core;
  c.commit();
  s1.offset = 250; // геометрия сдвинулась
  c.persist("elem-move");
  ok(P.routes.length > 0, "трассы остались (тихо перестроены, не пропали)");
  ok(JSON.stringify(P.routes[0].points) !== before, "путь пересчитан под новую позицию точки");
});
test("автоперестройка НЕ срабатывает, если трассы ещё не строились", () => {
  const { P, w } = install();
  const s1 = M.newElement("socket", w(0), 100, 30, "power");
  P.elements.push(s1);
  const c = EP.Plan.Core;
  c.commit();
  s1.offset = 200;
  c.persist("elem-move"); // нет щита/трасс — build() тихо не найдёт что строить
  eq(P.routes.length, 0, "трассы не появились сами по себе");
});

// ===== 11. Общая стена соседних комнат + маршрут через щит у стены =====
test("wallAt: общая стена двух комнат — приоритет той, куда физически смещён тап", () => {
  const { P } = install(); // room A: rect(0,0,400,300)
  const roomB = M.newRoom(G.rectPoints(400, 0, 400, 300), "B"); // общая стена x=400
  P.rooms.push(roomB);
  const hitA = G.wallAt(P, { x: 395, y: 150 }, 20);
  ok(hitA && hitA.wall.roomId === P.rooms[0].id, "тап у комнаты A (слева от границы) — её стена");
  const hitB = G.wallAt(P, { x: 405, y: 150 }, 20);
  ok(hitB && hitB.wall.roomId === P.rooms[1].id, "тап у комнаты B (справа) — её стена, а не всегда A");
});
test("wallAt: тап точно на границе — не падает, возвращает какую-то из двух", () => {
  const { P } = install();
  const roomB = M.newRoom(G.rectPoints(400, 0, 400, 300), "B");
  P.rooms.push(roomB);
  const hit = G.wallAt(P, { x: 400, y: 150 }, 20);
  ok(hit && (hit.wall.roomId === P.rooms[0].id || hit.wall.roomId === P.rooms[1].id), "не роняется на точной границе");
});
test("roomNear: щит формально вне полигона (у стены) всё равно находит комнату", () => {
  const { P } = install();
  const pn = { x: -5, y: 150 }; // 5см за левой стеной — щит физически у стены
  ok(!G.roomAt(P, pn), "контроль: строгий point-in-polygon не находит комнату");
  const room = EP.Plan.Routes.roomNear(P, pn);
  ok(room && room.id === P.rooms[0].id, "roomNear находит комнату через ближайшую стену (fallback)");
});
test("buildPath: щит у стены не строго внутри полигона — путь всё равно строится по контуру", () => {
  const { P, w } = install();
  const pn = M.newPanel(-5, 150, "Щ");
  P.panels.push(pn);
  const s1 = M.newElement("socket", w(0), 100, 30, "power");
  P.elements.push(s1);
  const a = G.routeAnchor(P, s1);
  const path = EP.Plan.Routes.buildPath(P, s1, a, { kind: "panel", pos: { x: pn.x, y: pn.y } });
  ok(path && path.length >= 3, "путь не голая прямая в никуда — есть промежуточные точки контура");
});

test("настройки: ГОСТ-значки и запас кабеля по умолчанию", () => {
  const p = M.newProject("x");
  eq(p.settings.symbolStyle, "gost", "значки ГОСТ");
  eq(p.settings.cableReserve, 10, "запас 10%");
  eq(p.settings.routeOffset, 15, "отступ трассы 15 см");
  eq(p.settings.sleeveD, 20, "гильза Ø20");
});

// ===== 10. Трассировка v4: контур с отступом, проходки =====
test("insetContour: отступ th/2+15 от оси стены", () => {
  const { P } = install();
  const ct = G.insetContour(P, P.rooms[0], 15); // th=10 → 5+15=20
  ok(ct && ct.length === 4, "4 угла");
  near(ct[0].x, 20, 0.01); near(ct[0].y, 20, 0.01);
  near(ct[2].x, 380, 0.01); near(ct[2].y, 280, 0.01);
});
test("трасса в одной комнате: по контуру, стены не пересекает", () => {
  const { P, w } = install();
  const pn = M.newPanel(200, 150, "Щ"); P.panels.push(pn);
  const s1 = M.newElement("socket", w(0), 100, 30, "power");
  P.elements.push(s1);
  const a = G.routeAnchor(P, s1);
  const path = EP.Plan.Routes.buildPath(P, s1, a, { kind: "panel", pos: { x: pn.x, y: pn.y } });
  ok(path.length >= 3, "путь через контур");
  eq(G.polylineCrossings(P, path, s1.wallId).length, 0, "стен не пересекает");
  // выход на контур отступа: есть точка на y=20 (контур верхней стены)
  ok(path.some((q) => Math.abs(q.y - 20) < 0.5), "идёт по отступу 15 см от стены");
});
test("routeOff: у разных линий (QF) отступ от стены разный — трассы визуально не сливаются", () => {
  const { P, w } = install();
  const cc1 = M.newCircuit("QF1", "#ef4444", 16); P.circuits.push(cc1);
  const cc2 = M.newCircuit("QF2", "#f59e0b", 16); P.circuits.push(cc2);
  const pn = M.newPanel(200, 150, "Щ"); P.panels.push(pn);
  const s1 = M.newElement("socket", w(0), 100, 30, "power"); s1.circuitId = cc1.id; P.elements.push(s1);
  const s2 = M.newElement("socket", w(0), 200, 30, "power"); s2.circuitId = cc2.id; P.elements.push(s2);
  const target = { kind: "panel", pos: { x: pn.x, y: pn.y } };
  const path1 = EP.Plan.Routes.buildPath(P, s1, G.routeAnchor(P, s1), target);
  const path2 = EP.Plan.Routes.buildPath(P, s2, G.routeAnchor(P, s2), target);
  ok(path1.some((q) => Math.abs(q.y - 20) < 0.5), "QF1 (первая линия) — база 15 см (контур y=20)");
  ok(path2.some((q) => Math.abs(q.y - 22) < 0.5), "QF2 (вторая линия) — +2 см, 17 см (контур y=22)");
});
test("лампа: подход по контуру и под прямым углом", () => {
  const { P } = install();
  const pn = M.newPanel(60, 60, "Щ"); P.panels.push(pn);
  const lamp = M.newElement("light", null, 0, 0, "light");
  lamp.params = { x: 200, y: 150 };
  P.elements.push(lamp);
  const a = G.routeAnchor(P, lamp);
  const path = EP.Plan.Routes.buildPath(P, lamp, a, { kind: "panel", pos: { x: pn.x, y: pn.y } });
  ok(path.length >= 2, "путь есть");
  const q = path[1]; // первый излом от лампы — перпендикуляр к контуру (оси комнаты)
  ok(Math.abs(q.x - 200) < 0.5 || Math.abs(q.y - 150) < 0.5, "прямой угол от лампы");
});
test("другая комната: перпендикулярная проходка через стену", () => {
  const { P } = install();
  const roomB = M.newRoom(G.rectPoints(400, 0, 400, 300), "B");
  P.rooms.push(roomB);
  const pn = M.newPanel(100, 150, "Щ"); P.panels.push(pn); // в комнате A
  const s1 = M.newElement("socket", roomB.id + ":1", 150, 30, "power"); // правая стена B
  P.elements.push(s1);
  const a = G.routeAnchor(P, s1);
  const path = EP.Plan.Routes.buildPath(P, s1, a, { kind: "panel", pos: { x: pn.x, y: pn.y } });
  const hits = G.polylineCrossings(P, path, s1.wallId);
  ok(hits.length >= 1, "есть проходка");
  // сегмент через стену x=400 — строго горизонтальный (перпендикуляр к вертикальной стене)
  let perp = false;
  for (let i = 0; i < path.length - 1; i++) {
    const p1 = path[i], p2 = path[i + 1];
    if ((p1.x - 400) * (p2.x - 400) < 0) { if (Math.abs(p1.y - p2.y) < 0.5) perp = true; }
  }
  ok(perp, "проходка перпендикулярна стене");
});
test("проходки Ø20: макс. 2 кабеля в гильзу", () => {
  const { P, w } = install();
  const pn = M.newPanel(50, 50, "Щ"); P.panels.push(pn);
  // 3 кабеля через одно место стены → 2 гильзы
  for (let i = 0; i < 3; i++) {
    const e2 = M.newElement("socket", w(0), 100 + i * 5, 30, "power");
    P.elements.push(e2);
    const rt = M.newRoute("power", "ceiling", [{ x: 100, y: 20 }, { x: 200, y: 150 }], e2.id, pn.id);
    rt.toPanel = true;
    rt.throughWalls = [{ x: 400, y: 150, wallId: w(1) }];
    P.routes.push(rt);
  }
  const res = EP.Plan.Calc.calcByRoutes(P);
  const sl = res.items.find((i) => i.name.indexOf("Проходка Ø20") >= 0);
  ok(sl, "есть проходки");
  eq(sl.qty, 2, "3 кабеля → 2 гильзы");
});

// ===== 12. Штробы в блок по видам, связь выключатель→свет, тип «Вывод» =====
test("blockChaseEntries: только розетки — крайний левый пост", () => {
  const el = { params: { items: ["socket", "socket", "socket"] } };
  const entries = G.blockChaseEntries(el);
  eq(entries.length, 1, "одна силовая штроба");
  eq(entries[0].kind, "power");
  eq(entries[0].idx, 0, "крайний левый пост розетки");
});
test("blockChaseEntries: выключатель+розетка вместе — штроба между ними", () => {
  const el = { params: { items: ["switch", "socket", "socket"] } }; // switch=0, sockets=1,2
  const entries = G.blockChaseEntries(el);
  const power = entries.find((e) => e.kind === "power"), light = entries.find((e) => e.kind === "light");
  eq(power.idx, 1, "розетка — крайний левый её пост (индекс 1)");
  near(light.idx, 0.5, 0.01, "выключатель — между ним (0) и розеткой (1)");
});
test("blockChaseEntries: выключатель один (без розетки) — штроба прямо к нему", () => {
  const el = { params: { items: ["switch", "switch"] } };
  const entries = G.blockChaseEntries(el);
  eq(entries.length, 2, "оба выключателя — свои штробы");
  ok(entries.every((e) => e.kind === "light"), "оба — свет");
  eq(entries[0].idx, 0); eq(entries[1].idx, 1);
});
test("blockChaseEntries: интернет/ТВ — каждый отдельной штробой к своему посту", () => {
  const el = { params: { items: ["socket", "internet", "tv"] } };
  const entries = G.blockChaseEntries(el);
  const lv = entries.filter((e) => e.kind === "lv");
  eq(lv.length, 2, "интернет и ТВ — раздельно");
  ok(lv.some((e) => e.idx === 1) && lv.some((e) => e.idx === 2), "каждый к своему посту (1 и 2)");
});
test("switchTarget: авто — ближайший свет своей линии в комнате", () => {
  const { P, w } = install();
  const q1 = M.newCircuit("QF1", "#e11", 16);
  P.circuits.push(q1);
  const sw = M.newElement("switch", w(0), 100, 90, "light"); sw.circuitId = q1.id;
  const lampNear = M.newElement("light", null, 0, 0, "light"); lampNear.circuitId = q1.id; lampNear.params = { x: 150, y: 150 };
  const lampFar = M.newElement("light", null, 0, 0, "light"); lampFar.circuitId = q1.id; lampFar.params = { x: 380, y: 280 };
  P.elements.push(sw, lampNear, lampFar);
  const t = G.switchTarget(P, sw);
  ok(t && t.id === lampNear.id, "выбрана ближайшая лампа своей линии");
});
test("switchTarget: без линии — связь не строим", () => {
  const { P, w } = install();
  const sw = M.newElement("switch", w(0), 100, 90, "light");
  const lamp = M.newElement("light", null, 0, 0, "light"); lamp.params = { x: 150, y: 150 };
  P.elements.push(sw, lamp);
  ok(!G.switchTarget(P, sw), "нет circuitId — нет авто-связи");
});
test("switchTarget: ручное targetId — приоритет над авто", () => {
  const { P, w } = install();
  const q1 = M.newCircuit("QF1", "#e11", 16);
  P.circuits.push(q1);
  const sw = M.newElement("switch", w(0), 100, 90, "light"); sw.circuitId = q1.id;
  const lampNear = M.newElement("light", null, 0, 0, "light"); lampNear.circuitId = q1.id; lampNear.params = { x: 150, y: 150 };
  const outFar = M.newElement("output", null, 0, 0, "light"); outFar.circuitId = q1.id; outFar.params = { x: 380, y: 280 };
  sw.targetId = outFar.id;
  P.elements.push(sw, lampNear, outFar);
  const t = G.switchTarget(P, sw);
  ok(t && t.id === outFar.id, "ручное назначение побеждает авто-ближайшую");
});
test("тип «Вывод»: layerChoice, силовой по умолчанию, free-размещение", () => {
  const TY = EP.Plan.Elements.TYPES.output;
  ok(TY, "тип зарегистрирован");
  eq(TY.layer, "power", "по умолчанию силовой");
  ok(TY.free, "можно ставить свободно (потолок/пол) — как и на стену при тапе рядом");
  ok(TY.layerChoice, "есть переключатель силовой/слаботочный в редакторе");
});

// ===== 13. Провод без распайки ×2, выключатель на всю высоту при полу =====
test("hopVertMul: хоп точка→точка без распайки — штроба ×2 в длине кабеля", () => {
  const { P, w } = install();
  const pn = M.newPanel(50, 50, "Щ"); P.panels.push(pn);
  const s1 = M.newElement("socket", w(0), 100, 30, "power");
  const s2 = M.newElement("socket", w(0), 150, 30, "power");
  P.elements.push(s1, s2);
  const r1 = M.newRoute("power", "ceiling", [{ x: 100, y: 18 }, { x: 50, y: 50 }], s1.id, pn.id); r1.toPanel = true;
  const r2 = M.newRoute("power", "ceiling", [{ x: 150, y: 18 }, { x: 100, y: 18 }], s2.id, s1.id); // шлейф: s2 -> s1, без распайки
  P.routes.push(r1, r2);
  eq(EP.Plan.Routes.hopVertMul(P, r1), 1, "хоп в щит — ×1");
  eq(EP.Plan.Routes.hopVertMul(P, r2), 2, "хоп в обычную точку (нет распайки) — ×2");
});
test("hopVertMul: хоп в распайку (junction) — ×1, не удваиваем", () => {
  const { P, w } = install();
  const j = M.newElement("junction", null, 0, 0, "routes"); j.params = { x: 200, y: 150 };
  const s1 = M.newElement("socket", w(0), 100, 30, "power");
  P.elements.push(j, s1);
  const r = M.newRoute("power", "ceiling", [{ x: 100, y: 18 }, { x: 200, y: 150 }], s1.id, j.id);
  P.routes.push(r);
  eq(EP.Plan.Routes.hopVertMul(P, r), 1, "распайка принимает горизонталь — штроба не удваивается");
});
test("pointVert: выключатель при разводке ПО ПОЛУ — штроба на всю высоту (до потолка, к лампе)", () => {
  const { P, w } = install();
  const sw = M.newElement("switch", w(0), 100, 90, "light");
  P.settings.routeType = "floor";
  eq(EP.Plan.Routes.pointVert(P, sw), P.settings.ceilingHeight, "не 90см (своя высота), а вся высота до потолка");
});
test("pointVert: выключатель при разводке ПО ПОТОЛКУ — обычная формула (без изменений)", () => {
  const { P, w } = install();
  const sw = M.newElement("switch", w(0), 100, 90, "light");
  eq(EP.Plan.Routes.pointVert(P, sw), P.settings.ceilingHeight - 90, "потолок минус высота — как обычно");
});

// ===== 14. Многоклавишные/проходные/перекрёстные выключатели, цепочка =====
test("switchTarget: у каждой клавиши своя ручная цель", () => {
  const { P, w } = install();
  const sw = M.newElement("switch", w(0), 100, 90, "light");
  sw.keys = 2;
  const lampA = M.newElement("light", null, 0, 0, "light"); lampA.params = { x: 50, y: 50 };
  const lampB = M.newElement("light", null, 0, 0, "light"); lampB.params = { x: 350, y: 250 };
  sw.targetIds = [lampA.id, lampB.id];
  P.elements.push(sw, lampA, lampB);
  eq(G.switchTarget(P, sw, 0).id, lampA.id, "клавиша 1 -> своя лампа");
  eq(G.switchTarget(P, sw, 1).id, lampB.id, "клавиша 2 -> другая лампа");
});
test("switchTarget: targetId (старое поле) читается как клавиша 0", () => {
  const { P, w } = install();
  const sw = M.newElement("switch", w(0), 100, 90, "light");
  const lamp = M.newElement("light", null, 0, 0, "light"); lamp.params = { x: 50, y: 50 };
  sw.targetId = lamp.id; // без targetIds — старый формат
  P.elements.push(sw, lamp);
  eq(G.switchTarget(P, sw, 0).id, lamp.id, "обратная совместимость с targetId");
});
test("цепочка проходной->перекрёстный->проходной: chainNext связывает звенья, финал ведёт к лампе", () => {
  const { P, w } = install();
  const sw1 = M.newElement("switch", w(0), 50, 90, "light"); sw1.swKind = "pass";
  const sw2 = M.newElement("switch", w(1), 50, 90, "light"); sw2.swKind = "cross";
  const sw3 = M.newElement("switch", w(2), 50, 90, "light"); sw3.swKind = "pass"; // последний — к лампе
  const lamp = M.newElement("light", null, 0, 0, "light"); lamp.params = { x: 200, y: 150 };
  sw1.chainNext = sw2.id; sw2.chainNext = sw3.id; sw3.chainNext = null;
  sw3.targetId = lamp.id;
  P.elements.push(sw1, sw2, sw3, lamp);
  ok(sw1.chainNext === sw2.id && sw2.chainNext === sw3.id, "звенья связаны по цепочке");
  ok(!sw3.chainNext, "последнее звено без chainNext");
  eq(G.switchTarget(P, sw3, 0).id, lamp.id, "финал цепочки ведёт к лампе");
});
test("коннекторы: клавишность и тип выключателя выбирают шаблон пула (не всегда switch_1)", () => {
  const { P, w } = install();
  const pn = M.newPanel(50, 50, "Щ"); P.panels.push(pn);
  const sw2 = M.newElement("switch", w(0), 60, 90, "light"); sw2.keys = 2; // switch_2: pin2×3, pin4×2
  const swPass = M.newElement("switch", w(1), 60, 90, "light"); swPass.swKind = "pass"; swPass.keys = 1; // pass_1: pin2×6
  P.elements.push(sw2, swPass);
  const rt = M.newRoute("light", "ceiling", [{ x: 60, y: 18 }, { x: 50, y: 50 }], sw2.id, pn.id); rt.toPanel = true;
  P.routes.push(rt); // calcByRoutes требует хотя бы одну трассу (иначе ранний return null)
  const res = EP.Plan.Calc.calcByRoutes(P);
  // pin2 и pin4 оба попадают в типоразмер ГМЛ 4 (sleeveByWires: ≤4 провода)
  const gml4 = res.items.find((i) => i.name === "ГМЛ 4");
  ok(gml4, "есть гильзы ГМЛ 4");
  eq(gml4.qty, 3 + 2 + 6, "switch_2: pin2×3+pin4×2, pass_1: pin2×6 — итого 11 (не как всегда switch_1×2=8)");
});

// ===== 15. Ручная однолинейка (Слой 7б): группы/линии, чек-лист линий с плана =====
test("ручная схема: buildTree null без групп", () => {
  const { P } = install();
  eq(EP.Plan.ManualScheme.buildTree(P), null, "нет групп — дерева нет");
});
test("ручная схема: чек-лист — линия с плана без группы «не расставлена»", () => {
  const { P } = install();
  P.circuits.push(M.newCircuit("QF1", "#ef4444", 16));
  const html = EP.Plan.ManualScheme.checklistHtml(P);
  ok(html.indexOf("0/1 расставлено") >= 0, "0 из 1 линий расставлено");
  ok(html.indexOf("is-done") < 0, "нет отметки «расставлено»");
});
test("ручная схема: линия, привязанная к circuitId, помечается в чек-листе ✓", () => {
  const { P } = install();
  const cc = M.newCircuit("QF1 Розетки", "#ef4444", 16); P.circuits.push(cc);
  const g = M.newSchemeGroup("Розетки"); P.manualScheme.groups.push(g);
  const ln = M.newSchemeLine("QF1 Розетки"); ln.circuitId = cc.id; ln.amp = cc.breaker;
  g.lines.push(ln);
  const html = EP.Plan.ManualScheme.checklistHtml(P);
  ok(html.indexOf("1/1 расставлено") >= 0, "1 из 1 линий расставлено");
  ok(html.indexOf("is-done") >= 0, "строка линии плана помечена расставленной");
});
test("ручная схема: дерево — группа/линия строятся, номинал и имя видны", () => {
  const { P } = install();
  const cc = M.newCircuit("Розетки кухня", "#ef4444", 16); P.circuits.push(cc);
  const g = M.newSchemeGroup("Кухня"); P.manualScheme.groups.push(g);
  const ln = M.newSchemeLine("Розетки кухня"); ln.circuitId = cc.id; ln.amp = 16; ln.curve = "C";
  g.lines.push(ln);
  const tree = EP.Plan.ManualScheme.buildTree(P);
  ok(tree && tree.children.length === 1, "один узел группы под вводом");
  const rcdNode = tree.children[0];
  eq(rcdNode.type, "rcd", "УЗО по умолчанию (kind не dif)");
  eq(rcdNode.children.length, 1, "одна линия в группе");
  const lineNode = rcdNode.children[0];
  eq(lineNode.label, "Розетки кухня", "имя линии в дереве");
  eq(lineNode.rating, "C16А", "номинал линии в дереве");
});
test("ручная схема: счётчик и вводное УЗО берутся из settings, не дублируются как отдельные тумблеры", () => {
  const { P } = install();
  P.settings.meter = true; P.settings.mainRcd = true;
  const g = M.newSchemeGroup("Г"); P.manualScheme.groups.push(g);
  g.lines.push(M.newSchemeLine("Л"));
  const tree = EP.Plan.ManualScheme.buildTree(P);
  eq(tree.type, "mcb", "корень — вводной автомат");
  eq(tree.children[0].type, "meter", "следующий узел — счётчик (settings.meter)");
  eq(tree.children[0].children[0].type, "rcd", "затем вводное УЗО (settings.mainRcd)");
});
test("ручная схема: аппараты вводной цепи идут в порядке apparatusOrder", () => {
  const { P } = install();
  P.manualScheme.apparatus.rubilnik = true;
  P.manualScheme.apparatus.opn = true;
  P.manualScheme.apparatusOrder = ["rubilnik", "opn"];
  const g = M.newSchemeGroup("Г"); P.manualScheme.groups.push(g);
  g.lines.push(M.newSchemeLine("Л"));
  const tree = EP.Plan.ManualScheme.buildTree(P);
  eq(tree.children[0].type, "switch", "рубильник первым");
  eq(tree.children[0].children[0].type, "spd", "ОПН вторым");
});

test("newVoid: дефолт kind=shaft, имя автоматом", () => {
  const vd = M.newVoid({ x: 10, y: 10 }, { x: 60, y: 40 });
  eq(vd.kind, "shaft", "дефолтный тип — шахта");
  eq(vd.name, "Шахта", "имя по умолчанию");
});
test("newVoid: kind=room даёт имя «Комната»", () => {
  const vd = M.newVoid({ x: 0, y: 0 }, { x: 50, y: 50 }, "room");
  eq(vd.kind, "room");
  eq(vd.name, "Комната");
});
test("G.roomVoidArea/roomNetArea: шахта внутри комнаты вычитается из площади", () => {
  const { P, room } = install();
  const vd = M.newVoid({ x: 50, y: 50 }, { x: 100, y: 100 }, "shaft"); // 50x50 = 2500 см²
  P.voids = [vd];
  eq(G.roomVoidArea(P, room), 2500, "площадь шахты 50x50 см");
  const full = G.area(room.points); // 400*300 = 120000
  eq(G.roomNetArea(P, room), full - 2500, "чистая площадь за вычетом шахты");
});
test("G.roomVoidArea: препятствие ВНЕ комнаты не вычитается", () => {
  const { P, room } = install();
  const vd = M.newVoid({ x: 1000, y: 1000 }, { x: 1050, y: 1050 });
  P.voids = [vd];
  eq(G.roomVoidArea(P, room), 0, "центр препятствия вне полигона комнаты");
});
test("G.snapSmart: возле угла комнаты — snapped=true, координаты угла", () => {
  const { P, room } = install(); // комната rectPoints(0,0,400,300) — угол (0,0)
  const r = G.snapSmart(P, { x: 3, y: 4 }, 10, 20);
  eq(r.x, 0, "притянуло к X угла");
  eq(r.y, 0, "притянуло к Y угла");
  eq(r.snapped, true, "угол — значимый снап");
});
test("G.snapSmart: далеко от углов/осей — обычное округление по сетке, snapped=false", () => {
  const { P } = install();
  const r = G.snapSmart(P, { x: 1234, y: 1234 }, 10, 20);
  eq(r.x, 1230, "округлено по шагу сетки 10");
  eq(r.y, 1230, "округлено по шагу сетки 10");
  eq(r.snapped, false, "простое округление по сетке — не значимый снап");
});
test("OPENING_KINDS.opening: проём без двери/окна, win=false", () => {
  const op = M.newOpening("opening", "w:0", 0, undefined);
  eq(op.kind, "opening");
  eq(op.type, "door", "type остаётся door (внутреннее поле, win=false)");
});

// ===== 16. Обход проёмов при полу: приоритет двери над новой гильзой =====
function twoRoomsWithLamp(routeType, withDoor) {
  const { P } = install(); // room A: rect(0,0,400,300)
  const roomB = M.newRoom(G.rectPoints(400, 0, 400, 300), "B"); // общая стена x=400
  P.rooms.push(roomB);
  P.settings.routeType = routeType;
  if (withDoor) P.openings.push(M.newOpening("door", P.rooms[0].id + ":1", 220, 60)); // дверь y=220..280
  const pn = M.newPanel(100, 150, "Щ"); P.panels.push(pn); // комната A
  const lamp = M.newElement("light", null, 0, 0, "light");
  lamp.params = { x: 600, y: 150 }; // комната B; прямая к щиту идёт по y=150 (мимо двери)
  P.elements.push(lamp);
  return { P, pn, lamp };
}
test("buildPath (пол): дверь на общей стене — переход через неё, а не в произвольном месте", () => {
  const { P, pn, lamp } = twoRoomsWithLamp("floor", true);
  const a = G.routeAnchor(P, lamp);
  const path = EP.Plan.Routes.buildPath(P, lamp, a, { kind: "panel", pos: { x: pn.x, y: pn.y } });
  ok(path.some((q) => Math.abs(q.x - 400) < 25 && Math.abs(q.y - 250) < 10), "путь проходит через дверь (y≈250)");
  ok(!path.some((q) => Math.abs(q.x - 400) < 25 && Math.abs(q.y - 150) < 10), "НЕ идёт через прямую точку пересечения — там нет проёма");
});
test("buildPath (пол): без двери на стене — прежнее поведение, проходка на прямой", () => {
  const { P, pn, lamp } = twoRoomsWithLamp("floor", false);
  const a = G.routeAnchor(P, lamp);
  const path = EP.Plan.Routes.buildPath(P, lamp, a, { kind: "panel", pos: { x: pn.x, y: pn.y } });
  ok(path.some((q) => Math.abs(q.x - 400) < 25 && Math.abs(q.y - 150) < 10), "без проёма — обычная перпендикулярная проходка на прямой");
});
test("buildPath (потолок): дверь есть, но обход применяется только к трассировке по полу", () => {
  const { P, pn, lamp } = twoRoomsWithLamp("ceiling", true);
  const a = G.routeAnchor(P, lamp);
  const path = EP.Plan.Routes.buildPath(P, lamp, a, { kind: "panel", pos: { x: pn.x, y: pn.y } });
  ok(path.some((q) => Math.abs(q.x - 400) < 25 && Math.abs(q.y - 150) < 10), "потолок — дверь не влияет, проходка на прямой");
});
test("build (пол): переход через дверь не считается гильзой-проходкой Ø20", () => {
  const { P } = twoRoomsWithLamp("floor", true);
  EP.Plan.Routes.build();
  ok(P.routes.length > 0, "трасса построена");
  eq((P.routes[0].throughWalls || []).length, 0, "через дверь — без гильзы");
});
test("build (пол): без двери — переход через стену по-прежнему считается гильзой Ø20", () => {
  const { P } = twoRoomsWithLamp("floor", false);
  EP.Plan.Routes.build();
  ok(P.routes.length > 0, "трасса построена");
  ok((P.routes[0].throughWalls || []).length > 0, "без проёма — обычная гильза требуется");
});
test("floorOpeningAt: находит проём и со стороны СОСЕДНЕЙ комнаты (другой wall-id того же шва)", () => {
  const { P } = install();
  const roomB = M.newRoom(G.rectPoints(400, 0, 400, 300), "B");
  P.rooms.push(roomB);
  const wallAId = P.rooms[0].id + ":1"; // A: стена x=400 (0..300)
  P.openings.push(M.newOpening("door", wallAId, 220, 60));
  const hitOwn = G.floorOpeningAt(P, wallAId, { x: 400, y: 250 });
  ok(hitOwn, "находит на своей же стене");
  const wallBId = roomB.id + ":3"; // B: та же физическая стена, другой id/направление
  const hitOther = G.floorOpeningAt(P, wallBId, { x: 400, y: 250 });
  ok(hitOther, "находит и через wall-id соседней комнаты (проекция wallOpeningSpans)");
});

// ===== 17. estimateItems: единая точка входа для сметы (Расчёт + мост в EstimateDraft) =====
test("estimateItems: нет точек — null (нечего класть в смету)", () => {
  const { P } = install();
  eq(EP.Plan.Calc.estimateItems(P), null, "пустой проект — null");
});
test("estimateItems: с построенными трассами — тот же набор, что и calcByRoutes (точный счёт)", () => {
  const { P, w } = install();
  const pn = M.newPanel(50, 50, "Щ"); P.panels.push(pn);
  const s1 = M.newElement("socket", w(0), 100, 30, "power");
  P.elements.push(s1);
  const rt = M.newRoute("power", "ceiling", [{ x: 100, y: 18 }, { x: 50, y: 50 }], s1.id, pn.id);
  rt.toPanel = true;
  P.routes.push(rt);
  const exact = EP.Plan.Calc.calcByRoutes(P);
  const items = EP.Plan.Calc.estimateItems(P);
  ok(items && items.length, "позиции есть");
  eq(JSON.stringify(items), JSON.stringify(exact.items), "тот же точный счёт по трассам, что в шторке Расчёта");
});
test("estimateItems: без движка пула (PoolEngine не подключён) и без трасс — null, не падает", () => {
  const { P, w } = install();
  const pn = M.newPanel(50, 50, "Щ"); P.panels.push(pn);
  const s1 = M.newElement("socket", w(0), 100, 30, "power");
  P.elements.push(s1);
  noThrow(() => EP.Plan.Calc.estimateItems(P), "не бросает без EP.PoolEngine");
  eq(EP.Plan.Calc.estimateItems(P), null, "нет ни точного счёта, ни движка — null (как и runEngine напрямую)");
});

(async () => {
  await test("openProject: бэкофилл старых проектов", async () => {}); // placeholder to keep sync
  // п.1 аудита: importJSON теперь ТОЖЕ бэкофиллит (не только openProject) — старые/
  // сторонние экспорты не должны молча терять новые настройки и поля проёмов.
  const old = { name: "old", settings: { ceilingHeight: 270 }, rooms: [], elements: [], routes: [], openings: [{ id: "o", type: "window", wallId: "x:0", offset: 0, width: 140 }], panels: [{ id: "p1", x: 0, y: 0, name: "Щ" }] };
  const imp = EP.Plan.Core.importJSON(JSON.stringify({ project: old }));
  ok(imp && imp.openings.length === 1, "импорт старого формата");
  eq(imp.openings[0].kind, "window", "бэкофилл kind проёма");
  eq(imp.openings[0].height, 140, "бэкофилл height проёма");
  eq(imp.openings[0].sill, 90, "бэкофилл sill проёма");
  eq(imp.settings.symbolStyle, "gost", "бэкофилл symbolStyle");
  eq(imp.settings.cableReserve, 10, "бэкофилл cableReserve");
  eq(imp.settings.routeOffset, 15, "бэкофилл routeOffset");
  eq(imp.settings.sleeveD, 20, "бэкофилл sleeveD");
  eq(imp.settings.connectorMode, "gml", "бэкофилл connectorMode");
  eq(imp.settings.schemeMode, "auto", "бэкофилл schemeMode");
  ok(imp.manualScheme && Array.isArray(imp.manualScheme.groups), "бэкофилл manualScheme.groups");
  ok(Array.isArray(imp.ledStrips), "бэкофилл ledStrips");
  ok(Array.isArray(imp.voids), "бэкофилл voids");
  eq(imp.panels[0].transformer, false, "бэкофилл panel.transformer");

  console.log("\n" + "=".repeat(48));
  if (failed) { console.log("ТЕСТЫ: " + passed + " ok, " + failed + " ОШИБОК\n"); fails.forEach((f) => console.log("  ✗ " + f)); process.exit(1); }
  console.log("ТЕСТЫ: все " + passed + " прошли ✓"); process.exit(0);
})();
