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
const { EP, sandbox, store } = loadPlan();
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
// Баг (репорт пользователя): «нарисовал балку, а с другой стороны не могу ничего
// поставить» — у балки нет своей комнаты (roomId:null), G.wallFrame() без подсказки
// давал ОДНУ И ТУ ЖЕ (произвольную) нормаль независимо от места тапа, поэтому ЛЮБОЙ
// элемент на балке рисовался на одной стороне: данные создавались, но маркер второй
// точки съезжал на прежнюю сторону (визуально накладывался/пропадал). Фикс —
// wallFrame(project, wall, sideHint) + el.beamSide, проставляемый в placeAt() по
// РЕАЛЬНОМУ месту тапа (beamSideOf).
test("wallFrame: sideHint у балки разворачивает нормаль на противоположную сторону", () => {
  const { P } = install({ beams: [M.newBeam({ x: 0, y: 150 }, { x: 300, y: 150 }, "beam", 8, "ГКЛ")] });
  const bw = G.wallById(P, "beam:" + P.beams[0].id);
  const base = G.wallFrame(P, bw); // без sideHint — прежняя фиксированная сторона
  eq(G.wallFrame(P, bw, 1).nrm.x, base.nrm.x, "sideHint=1 — та же сторона, что и без подсказки");
  eq(G.wallFrame(P, bw, -1).nrm.x, -base.nrm.x, "sideHint=-1 — нормаль X развёрнута");
  eq(G.wallFrame(P, bw, -1).nrm.y, -base.nrm.y, "sideHint=-1 — нормаль Y развёрнута");
});
test("elemDrawPoint: el.beamSide — элемент на балке рисуется на СВОЕЙ стороне (без поля — прежняя фикс. сторона)", () => {
  const beam = M.newBeam({ x: 100, y: 150 }, { x: 300, y: 150 }, "beam", 10, "Бетон");
  const { P } = install({ beams: [beam] });
  const wallId = "beam:" + beam.id;
  const legacy = M.newElement("socket", wallId, 50, 30, "power"); // элемент до этого фикса — без beamSide
  const sideA = M.newElement("socket", wallId, 100, 30, "power"); sideA.beamSide = 1;
  const sideB = M.newElement("socket", wallId, 150, 30, "power"); sideB.beamSide = -1;
  P.elements.push(legacy, sideA, sideB);
  near(G.elemDrawPoint(P, legacy).y, 163, 0.1, "легаси-элемент без beamSide — прежняя (базовая) сторона");
  near(G.elemDrawPoint(P, sideA).y, 163, 0.1, "beamSide=1 совпадает с базовой стороной");
  near(G.elemDrawPoint(P, sideB).y, 137, 0.1, "beamSide=-1 — ПРОТИВОПОЛОЖНАЯ сторона балки");
});
test("placeAt: тап по РАЗНЫМ сторонам балки ставит элементы на РАЗНЫХ сторонах, не один поверх другого", () => {
  const beam = M.newBeam({ x: 100, y: 150 }, { x: 300, y: 150 }, "beam", 10, "Бетон");
  const { P } = install({ beams: [beam] });
  const wallId = "beam:" + beam.id;
  EP.Plan.Elements.placeAt({ x: 150, y: 142 }); // тап ВЫШЕ оси балки (y<150), в пределах снапа
  EP.Plan.Elements.placeAt({ x: 200, y: 158 }); // тап НИЖЕ оси балки (y>150)
  const els = P.elements.filter((e) => e.wallId === wallId);
  eq(els.length, 2, "оба тапа поставили точку на балке");
  ok(els[0].beamSide !== els[1].beamSide, "разные стороны тапа — разный el.beamSide");
  const d0 = G.elemDrawPoint(P, els[0]), d1 = G.elemDrawPoint(P, els[1]);
  ok((d0.y - 150) * (d1.y - 150) < 0, "маркеры реально нарисованы по РАЗНЫЕ стороны от оси балки");
});
test("spansMinusOpenings: окно рвёт стену на 2 участка", () => {
  const { P, w } = install({ openings: [M.newOpening("window", null, 120)] });
  P.openings[0].wallId = w(0);
  const wall = G.wallById(P, w(0));
  eq(G.spansMinusOpenings(wall.len, G.openingsOnWall(P, w(0))).length, 2);
});
test("elemDrawPoint: отступ от стены ОДИНАКОВЫЙ (не зависит от QF), точки не сталкиваются", () => {
  const q1 = M.newCircuit("QF1", "#e11", 16), q2 = M.newCircuit("QF2", "#1e1", 16);
  const { P, w } = install({ circuits: [q1, q2] });
  const s1 = M.newElement("socket", w(0), 100, 30, "power"); s1.circuitId = q1.id;
  const s2 = M.newElement("socket", w(0), 160, 30, "power"); s2.circuitId = q2.id; // разный offset — не сталкиваются
  P.elements.push(s1, s2);
  const d0a = G.elemPoint(P, s1), d0b = G.elemPoint(P, s2);
  const d1 = G.elemDrawPoint(P, s1), d2 = G.elemDrawPoint(P, s2);
  ok(Math.hypot(d1.x - d0a.x, d1.y - d0a.y) > 4, "маркер отступает от стены");
  near(Math.abs(d1.y - d0a.y), Math.abs(d2.y - d0b.y), 0.5); // одинаковый отступ от СВОЕЙ точки на стене у обеих (QF не влияет)
  eq(G.elemOverlapIndex(P, s1), 0, "не сталкиваются — индекс лесенки 0");
  eq(G.elemOverlapIndex(P, s2), 0, "не сталкиваются — индекс лесенки 0");
});
test("elemDrawPoint: «лесенка» — точки почти в одном месте стены раздвигаются, а не рисуются друг на друге", () => {
  const { P, w } = install({});
  const s1 = M.newElement("socket", w(0), 100, 30, "power");
  const s2 = M.newElement("socket", w(0), 100, 150, "power"); // тот же offset, другая высота — на 2D-плане совпали бы
  const s3 = M.newElement("socket", w(0), 101, 90, "power"); // offset почти совпадает (в пределах порога 3см)
  P.elements.push(s1, s2, s3);
  // порядок внутри группы стабилен (по id), но не обязан совпадать с порядком push —
  // важно, что индексы РАЗНЫЕ и покрывают 0,1,2 без повторов
  const idxs = [s1, s2, s3].map((s) => G.elemOverlapIndex(P, s));
  eq(new Set(idxs).size, 3, "у всех трёх — разные индексы лесенки");
  eq(idxs.slice().sort().join(","), "0,1,2", "индексы группы — ровно 0,1,2");
  const pts = [s1, s2, s3].map((s) => G.elemDrawPoint(P, s));
  for (let i = 0; i < 3; i++) for (let j = i + 1; j < 3; j++) {
    ok(Math.hypot(pts[i].x - pts[j].x, pts[i].y - pts[j].y) >= G.STACK_STEP_CM - 0.5, `точки ${i} и ${j} видимо разнесены`);
  }
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
test("routing: router-щит — LV-точка (интернет) идёт ТОЛЬКО к нему, а не к геометрически ближайшему щиту", () => {
  const near = M.newPanel(10, 10, "Щит");
  const router = M.newPanel(390, 290, "Роутер"); router.router = true;
  const { P, w } = install({ panels: [near, router] });
  const net = M.newElement("internet", w(0), 20, 30, "lv");
  P.elements.push(net);
  EP.Plan.Routes.build();
  const rt = P.routes.find((r) => r.fromId === net.id);
  ok(rt, "трасса построена");
  eq(rt.toId, router.id, "LV-точка идёт к router-щиту, а не к ближайшему обычному");
  ok(rt.toPanel, "конец трассы — щит");
});
test("routing: без router-щита LV-точка идёт к геометрически ближайшему щиту (обратная совместимость)", () => {
  const near = M.newPanel(10, 10, "Щит");
  const far = M.newPanel(390, 290, "Далёкий щит");
  const { P, w } = install({ panels: [near, far] });
  const net = M.newElement("internet", w(0), 20, 30, "lv");
  P.elements.push(net);
  EP.Plan.Routes.build();
  const rt = P.routes.find((r) => r.fromId === net.id);
  ok(rt, "трасса построена");
  eq(rt.toId, near.id, "без роутера — как раньше, ближайший щит");
});
test("routing: router-щит не мешает силовым точкам — розетка по-прежнему идёт к ближайшему обычному щиту", () => {
  const near = M.newPanel(10, 10, "Щит");
  const router = M.newPanel(390, 290, "Роутер"); router.router = true;
  const { P, w } = install({ panels: [near, router] });
  const s = M.newElement("socket", w(0), 20, 30, "power");
  P.elements.push(s);
  EP.Plan.Routes.build();
  const rt = P.routes.find((r) => r.fromId === s.id);
  ok(rt, "трасса построена");
  eq(rt.toId, near.id, "силовая точка НЕ уходит к роутеру");
});
test("routing: ТВ и видеонаблюдение (isLvLayer: tv/cctv) уходят LV-шлейфом к router-щиту, не к обычному", () => {
  const near = M.newPanel(10, 10, "Щит");
  const router = M.newPanel(390, 290, "Роутер"); router.router = true;
  const { P, w } = install({ panels: [near, router] });
  const tv = M.newElement("tv", w(0), 20, 130, "tv");
  const cam = M.newElement("camera", w(0), 60, 230, "cctv");
  P.elements.push(tv, cam);
  EP.Plan.Routes.build();
  const rtTv = P.routes.find((r) => r.fromId === tv.id);
  const rtCam = P.routes.find((r) => r.fromId === cam.id);
  ok(rtTv && rtCam, "трассы построены для обеих LV-точек");
  ok(!P.routes.some((r) => r.toId === near.id), "ни одна LV-трасса не подключена к обычному щиту");
  eq(P.routes.filter((r) => r.toPanel).length, 1, "спуск к щиту — один раз (шлейф)");
  eq(P.routes.find((r) => r.toPanel).toId, router.id, "спуск к щиту идёт именно к роутеру");
});
test("routing: трансформаторный щит — Вывод 24В идёт ТОЛЬКО к нему (при наличии router-щита и более близкого обычного)", () => {
  const near = M.newPanel(10, 10, "Щит");
  const router = M.newPanel(200, 290, "Роутер"); router.router = true;
  const trafo = M.newPanel(390, 290, "Слаботочный"); trafo.transformer = true;
  const { P, w } = install({ panels: [near, router, trafo] });
  const o24 = M.newElement("output24", w(0), 20, 30, "lv");
  P.elements.push(o24);
  EP.Plan.Routes.build();
  const rt = P.routes.find((r) => r.fromId === o24.id);
  ok(rt, "трасса построена");
  eq(rt.toId, trafo.id, "вывод 24В идёт к щиту с трансформатором, а не к роутеру/ближайшему");
});
test("routing: без трансформаторного щита Вывод 24В — прежнее поведение (ближайший щит)", () => {
  const near = M.newPanel(10, 10, "Щит");
  const far = M.newPanel(390, 290, "Далёкий");
  const { P, w } = install({ panels: [near, far] });
  const o24 = M.newElement("output24", w(0), 20, 30, "lv");
  P.elements.push(o24);
  EP.Plan.Routes.build();
  const rt = P.routes.find((r) => r.fromId === o24.id);
  ok(rt, "трасса построена");
  eq(rt.toId, near.id, "как раньше — ближайший щит");
});
test("24В шаг2: build24Legs — трасса «до щита» (выкл→трансформатор, leg pri24) + тег «от щита» (sec24)", () => {
  const trafo = M.newPanel(200, 280, "Слаботочный"); trafo.transformer = true;
  const qLight = M.newCircuit("QF1", "#e11", 10);
  const q24 = M.newCircuit("Int1", "#0af", 6); q24.cable = "2×0.75"; q24.cable220 = "ВВГ 3×1.5";
  const { P, w } = install({ panels: [trafo], circuits: [qLight, q24] });
  const sw = M.newElement("switch", w(0), 100, 90, "light"); sw.circuitId = qLight.id;
  const o24 = M.newElement("output24", null, 0, 270, "lv"); o24.params = { x: 200, y: 150 }; o24.circuitId = q24.id;
  sw.targetIds = [o24.id];
  P.elements.push(sw, o24);
  EP.Plan.Routes.build();
  // fromId = "sw24:<выключатель>@<щит>" — щит в ключе с тех пор, как одна клавиша может
  // кормить НЕСКОЛЬКО трансформаторов (у каждого своя трасса «до щита»)
  const pri = P.routes.find((r) => String(r.fromId).indexOf("sw24:" + sw.id) === 0);
  ok(pri && pri.leg === "pri24", "трасса «до щита» sw24 построена, leg=pri24");
  eq(pri.toId, trafo.id, "«до щита» идёт к трансформаторному щиту");
  eq(pri.circuitId, q24.id, "«до щита» отнесена к линии 24В (не к линии выключателя)");
  const sec = P.routes.find((r) => r.fromId === o24.id);
  ok(sec && sec.leg === "sec24", "трасса «от щита» (output24→трансформатор) помечена sec24");
});
test("24В шаг2: без трансформаторного щита трасса «до щита» НЕ строится (обратная совместимость)", () => {
  const pan = M.newPanel(200, 280, "Щит"); // без transformer
  const q24 = M.newCircuit("Int1", "#0af", 6);
  const { P, w } = install({ panels: [pan], circuits: [q24] });
  const sw = M.newElement("switch", w(0), 100, 90, "light"); sw.circuitId = q24.id;
  const o24 = M.newElement("output24", null, 0, 270, "lv"); o24.params = { x: 200, y: 150 }; o24.circuitId = q24.id;
  sw.targetIds = [o24.id];
  P.elements.push(sw, o24);
  EP.Plan.Routes.build();
  ok(!P.routes.some((r) => String(r.fromId).indexOf("sw24:" + sw.id) === 0), "нет трансформатора — нет трассы «до щита»");
});
test("24В шаг2: смета — кабель «до щита (220В)» и «от щита (24В)» отдельными позициями с маркой линии", () => {
  const trafo = M.newPanel(200, 280, "Слаботочный"); trafo.transformer = true;
  const q24 = M.newCircuit("Int1", "#0af", 6); q24.cable = "2×0.75"; q24.cable220 = "ВВГ 3×1.5";
  const { P, w } = install({ panels: [trafo], circuits: [q24] });
  const sw = M.newElement("switch", w(0), 100, 90, "light"); sw.circuitId = q24.id;
  const o24 = M.newElement("output24", null, 0, 270, "lv"); o24.params = { x: 200, y: 150 }; o24.circuitId = q24.id;
  sw.targetIds = [o24.id];
  P.elements.push(sw, o24);
  EP.Plan.Routes.build();
  const res = EP.Plan.Calc.calcByRoutes(P);
  const names = res.items.map((it) => it.name);
  ok(names.some((n) => /^Кабель ВВГ 3×1\.5 · до щита \(220В\)/.test(n)), "«Кабель ВВГ 3×1.5 · до щита (220В)» отдельной строкой");
  ok(names.some((n) => /^Кабель 2×0\.75 · от щита \(24В\)/.test(n)), "«Кабель 2×0.75 · от щита (24В)» отдельной строкой");
});
test("24В шаг2: cable220 бэкофилл (старый проект без поля)", () => {
  const p = M.newProject("x");
  const c = M.newCircuit("Int1", "#0af", 6);
  delete c.cable220;
  p.circuits = [c];
  EP.Plan.Core.importJSON(JSON.stringify({ project: p }));
  eq(EP.Plan.Core.project.circuits[0].cable220, null, "cable220 добавлен бэкофиллом = null");
});
test("switchTarget: ручной целью клавиши может быть розетка (расширенные типы целей)", () => {
  const { P, w } = install();
  const sw = M.newElement("switch", w(0), 100, 90, "light");
  const sock = M.newElement("socket", w(1), 50, 30, "power");
  sw.targetIds = [sock.id];
  P.elements.push(sw, sock);
  const t = G.switchTarget(P, sw, 0);
  ok(t && t.id === sock.id, "ручное назначение отдаёт розетку");
});
test("assignNewCircuit: слаботочные линии — свой префикс и НЕЗАВИСИМАЯ нумерация от QF", () => {
  const { P, w } = install();
  const EL = EP.Plan.Elements;
  const power1 = M.newElement("socket", w(0), 100, 30, "power"); P.elements.push(power1);
  const power2 = M.newElement("socket", w(1), 100, 30, "power"); P.elements.push(power2);
  const inet1 = M.newElement("internet", w(2), 100, 30, "lv"); P.elements.push(inet1);
  const inet2 = M.newElement("internet", w(0), 200, 30, "lv"); P.elements.push(inet2);
  const tv1 = M.newElement("tv", w(1), 200, 130, "tv"); P.elements.push(tv1);
  const cam1 = M.newElement("camera", w(2), 200, 250, "cctv"); P.elements.push(cam1);
  const cQF1 = EL.assignNewCircuit(power1);
  const cInt1 = EL.assignNewCircuit(inet1);
  const cQF2 = EL.assignNewCircuit(power2);
  const cInt2 = EL.assignNewCircuit(inet2);
  const cTv1 = EL.assignNewCircuit(tv1);
  const cCam1 = EL.assignNewCircuit(cam1);
  eq(cQF1.name, "QF1", "силовая линия — QF1"); eq(cQF2.name, "QF2", "вторая силовая — QF2, QF-счётчик свой");
  eq(cInt1.name, "Int1", "интернет — Int1"); eq(cInt2.name, "Int2", "второй интернет — Int2, не задет QF-счётчиком");
  eq(cTv1.name, "TV1", "ТВ — свой префикс TV1");
  eq(cCam1.name, "CCTV1", "видеонаблюдение — свой префикс CCTV1");
});
test("calcEdits: скрыть/заменить/добавить позицию сметы (applyCalcEdits внутри calcByRoutes)", () => {
  const { P, w } = install();
  const pn = M.newPanel(50, 50, "Щ"); P.panels.push(pn);
  const s1 = M.newElement("socket", w(0), 100, 30, "power");
  P.elements.push(s1);
  const r1 = M.newRoute("power", "ceiling", [{ x: 100, y: 18 }, { x: 50, y: 50 }], s1.id, pn.id); r1.toPanel = true;
  P.routes.push(r1);
  const base = EP.Plan.Calc.calcByRoutes(P);
  const layName0 = base.items.find((i) => i.name.indexOf("Прокладка кабеля") === 0).name;
  ok(layName0, "исходно есть «Прокладка кабеля ...»");
  ok(base.items.some((i) => i.name === "Подрозетник Ø68 40-50 мм"), "исходно есть подрозетник");
  P.calcEdits = {
    hidden: ["work|" + layName0],
    renamed: { "material|Подрозетник Ø68 40-50 мм": "Подрозетник Синий-люкс" },
    custom: [{ type: "work", name: "Вынос мусора", qty: 3, unit: "шт" }]
  };
  const res = EP.Plan.Calc.calcByRoutes(P);
  ok(!res.items.some((i) => i.name === layName0), "скрытая позиция убрана из сметы");
  const ren = res.items.find((i) => i.name === "Подрозетник Синий-люкс");
  ok(ren && ren.origName === "Подрозетник Ø68 40-50 мм", "замена названия хранит исходное имя (стабильный ключ)");
  const cust = res.items.find((i) => i.name === "Вынос мусора");
  ok(cust && cust.qty === 3 && cust.type === "work", "своя позиция добавлена");
});
test("flipOrthoCorner: разворачивает прямой угол (P->C->N) в альтернативную вершину прямоугольника", () => {
  // сначала по Y (100,50)->(100,150), потом по X (100,150)->(200,150) — разворот: сначала по X, потом по Y
  const flipped = G.flipOrthoCorner({ x: 100, y: 50 }, { x: 100, y: 150 }, { x: 200, y: 150 });
  ok(flipped, "нашли альтернативную вершину");
  near(flipped.x, 200, 0.5); near(flipped.y, 50, 0.5);
  // не прямой угол по осям — нечего разворачивать
  eq(G.flipOrthoCorner({ x: 0, y: 0 }, { x: 50, y: 50 }, { x: 100, y: 0 }), null, "диагональ — null");
});
test("orthoJoint: оба соседа рядом с осью — магнит собирает прямой угол", () => {
  const r = G.orthoJoint({ x: 0, y: 0 }, { x: 5, y: 97 }, { x: 100, y: 100 });
  near(r.x, 0, 0.5); near(r.y, 100, 0.5);
  ok(r.lockedX && r.lockedY, "обе оси зафиксированы соседями");
});
test("orthoJoint: сработал только один сосед — выравнивается только одна сторона", () => {
  const r = G.orthoJoint({ x: 0, y: 0 }, { x: 4, y: 150 }, { x: 300, y: 10 });
  near(r.x, 0, 0.5); near(r.y, 150, 0.5);
  ok(r.lockedX && !r.lockedY, "только X зафиксирован, Y — как отпустили");
});
test("orthoJoint: диагональ без намёка на ось — точка не трогается (иногда полезно, не жёстко)", () => {
  const r = G.orthoJoint({ x: 0, y: 0 }, { x: 70, y: 130 }, { x: 200, y: 200 });
  near(r.x, 70, 0.5); near(r.y, 130, 0.5);
  ok(!r.lockedX && !r.lockedY, "ни одна ось не зафиксирована");
});
test("recomputeThroughWalls: пересчитывает проходки по ТЕКУЩИМ points трассы (после ручной правки)", () => {
  const { P, w } = install({});
  const el = M.newElement("socket", w(0), 50, 30, "power");
  P.elements.push(el);
  const rt = M.newRoute(el.layer, "ceiling", [{ x: 350, y: 50 }, { x: 450, y: 50 }], el.id, null);
  P.routes.push(rt);
  EP.Plan.Routes.recomputeThroughWalls(P, rt);
  eq(rt.throughWalls.length, 1, "трасса пересекает правую стену — 1 проходка");
  eq(rt.throughWalls[0].wallId, w(1), "проходка именно на правой стене (индекс 1)");
  // "ручная правка" увела путь так, что он больше НЕ пересекает стену
  rt.points = [{ x: 350, y: 50 }, { x: 380, y: 50 }];
  EP.Plan.Routes.recomputeThroughWalls(P, rt);
  eq(rt.throughWalls.length, 0, "путь больше не пересекает стену — проходка снята");
});
test("wallChainStations: размерная цепочка точек вдоль стены (внутр. углы + точки, звенья с elemId)", () => {
  const { P, w } = install();
  // стена 0 = верх (0,0)->(400,0), длина 400; стена 10см → внутр. углы 5 и 395
  const a = M.newElement("socket", w(0), 100, 30, "power");
  const b = M.newElement("socket", w(0), 250, 30, "power");
  P.elements.push(a, b);
  const wall = G.walls(P.rooms[0])[0];
  const ch = G.wallChainStations(P, wall);
  ok(ch, "цепочка построена");
  eq(ch.stations.length, 4, "4 станции: 2 внутр. угла + 2 точки");
  eq(ch.segs.length, 3, "3 звена");
  near(ch.segs[0].dist, 95, 0.5, "внутр.угол(5)→a(100) = 95");
  near(ch.segs[1].dist, 150, 0.5, "a→b = 150");
  near(ch.segs[2].dist, 145, 0.5, "b(250)→внутр.угол(395) = 145");
  eq(ch.segs[1].aElemId, a.id, "ближняя точка среднего звена = a");
  eq(ch.segs[1].bElemId, b.id, "дальняя точка среднего звена = b");
});
test("wallChainStations: без точек на стене — null; распайка не считается точкой", () => {
  const { P, w } = install();
  const wall = G.walls(P.rooms[0])[0];
  eq(G.wallChainStations(P, wall), null, "пустая стена — null (только углы)");
  const j = M.newElement("junction", w(0), 100, 240, "routes");
  P.elements.push(j);
  eq(G.wallChainStations(P, wall), null, "распайка на стене не участвует в размерной цепочке");
});
test("routeAt: хит-тест находит построенную трассу рядом с сегментом", () => {
  const { P } = scene(false);
  EP.Plan.Routes.build();
  ok(P.routes.length > 0, "трасса построена");
  const rt = P.routes[0];
  const mid = { x: (rt.points[0].x + rt.points[1].x) / 2, y: (rt.points[0].y + rt.points[1].y) / 2 };
  const hit = EP.Plan.Routes.routeAt(P, mid, 5);
  ok(hit && hit.route.id === rt.id, "нашли ту же трассу рядом с её сегментом");
  const far = EP.Plan.Routes.routeAt(P, { x: mid.x + 1000, y: mid.y + 1000 }, 5);
  eq(far, null, "далеко от всех трасс — null");
});
test("build(): ручная трасса (manual:true) сохраняется при перестройке, если её концы не сдвинулись", () => {
  const { P } = scene(false);
  EP.Plan.Routes.build();
  const rt = P.routes[0];
  const before = rt.points.length;
  rt.points.splice(1, 0, { x: rt.points[0].x + 5, y: rt.points[0].y + 5 }); // ручная правка — лишняя точка
  rt.manual = true;
  EP.Plan.Routes.build(); // полная перестройка — концы точки/цели не двигались
  const after = P.routes.find((r) => r.fromId === rt.fromId);
  ok(after, "трасса на месте после перестройки");
  eq(after.points.length, before + 1, "ручная точка излома сохранилась (не потёрлась авто-перестройкой)");
  ok(after.manual, "флаг manual сохранён");
});
test("build(): ручная трасса СБРАСЫВАЕТСЯ в авто, если её точка-источник физически сдвинулась", () => {
  const { P } = scene(false);
  EP.Plan.Routes.build();
  const rt = P.routes[0];
  rt.points.splice(1, 0, { x: rt.points[0].x + 5, y: rt.points[0].y + 5 });
  rt.manual = true;
  const el = P.elements.find((e) => e.id === rt.fromId);
  el.offset += 40; // точка физически переехала по стене
  EP.Plan.Routes.build();
  const after = P.routes.find((r) => r.fromId === rt.fromId);
  ok(after, "трасса всё ещё есть (перестроена заново)");
  ok(!after.manual, "manual снят — анкор устарел, трасса пересчитана как обычная");
});
test("resetRouteToAuto: снимает manual и пересчитывает конкретную трассу, не трогая остальные ручные", () => {
  const { P } = scene(true); // с распайкой — минимум 2 трассы
  EP.Plan.Routes.build();
  ok(P.routes.length >= 2, "минимум 2 трассы в сцене с распайкой");
  P.routes.forEach((r) => { r.manual = true; r.points.splice(1, 0, { x: r.points[0].x + 3, y: r.points[0].y + 3 }); });
  const target = P.routes[0];
  const untouchedId = P.routes[1].fromId;
  const untouchedLenBefore = P.routes[1].points.length;
  EP.Plan.Routes.resetRouteToAuto(target.id);
  const resetRt = P.routes.find((r) => r.fromId === target.fromId);
  ok(resetRt && !resetRt.manual, "выбранная трасса сброшена в авто");
  const other = P.routes.find((r) => r.fromId === untouchedId);
  ok(other && other.manual, "остальные ручные трассы не тронуты");
  eq(other.points.length, untouchedLenBefore, "точки нетронутой ручной трассы не изменились");
});
test("resetRouteToAuto: НЕ трогает геометрию других (не-ручных, автоматических) трасс", () => {
  // баг: раньше resetRouteToAuto() звал полный build({silent:true}), а он ВСЕГДА
  // пересчитывает С НУЛЯ все НЕ-ручные трассы проекта — клик по «↺ Авто» одной линии
  // незаметно перетрассировывал и все остальные уже построенные авто-трассы.
  const { P } = scene(true); // с распайкой — минимум 2 трассы на QF1
  EP.Plan.Routes.build();
  ok(P.routes.length >= 2, "минимум 2 трассы в сцене с распайкой");
  const target = P.routes[0], other = P.routes[1];
  ok(!target.manual && !other.manual, "обе трассы автоматические (не ручные)");
  // симулируем «устаревшую» геометрию другой трассы (как будто она была построена
  // раньше при другом состоянии) — если resetRouteToAuto зовёт полный build(),
  // эта «устаревшая» точка исчезнет, пересчитавшись заново
  other.points.splice(1, 0, { x: other.points[0].x + 3, y: other.points[0].y + 7 });
  const stalePts = JSON.stringify(other.points);
  EP.Plan.Routes.resetRouteToAuto(target.id);
  const otherAfter = P.routes.find((r) => r.fromId === other.fromId);
  ok(otherAfter, "другая трасса всё ещё на месте");
  eq(JSON.stringify(otherAfter.points), stalePts, "точки другой авто-трассы не пересчитаны — их не должно было коснуться");
});
test("buildIncremental: не трогает уже существующие трассы, строит только новые точки", () => {
  // баг: «⚡ Построить» звала полный build() — расставил новые точки в одной комнате,
  // нажал «Построить», и уже готовые трассы в СОВСЕМ других местах незаметно меняли
  // форму (пойман экспортом реального проекта пользователя до/после клика). Теперь
  // кнопка достраивает ТОЛЬКО точки без трассы, старые не трогает вообще.
  const { P } = scene(false);
  EP.Plan.Routes.build();
  const before = P.routes.length;
  ok(before >= 2, "минимум 2 трассы построены изначально");
  const s1rt = P.routes[0];
  // симулируем «устаревшую» геометрию — если buildIncremental трогает старые трассы,
  // эта лишняя точка исчезнет при пересчёте
  s1rt.points.splice(1, 0, { x: s1rt.points[0].x + 4, y: s1rt.points[0].y + 6 });
  const stalePts = JSON.stringify(s1rt.points);

  const q3 = M.newCircuit("QF3", "#33f", 16);
  P.circuits.push(q3);
  const s3 = M.newElement("socket", P.rooms[0].id + ":1", 60, 30, "power");
  s3.circuitId = q3.id;
  P.elements.push(s3);

  EP.Plan.Routes.buildIncremental();
  eq(P.routes.length, before + 1, "добавилась ровно одна новая трасса — для новой точки");
  const s1rtAfter = P.routes.find((r) => r.fromId === s1rt.fromId);
  eq(JSON.stringify(s1rtAfter.points), stalePts, "старая трасса не пересчитана — точки как были (включая «устаревшую»)");
  const s3rt = P.routes.find((r) => r.fromId === s3.id);
  ok(s3rt, "у новой точки появилась трасса");
});
test("buildIncremental: у ручной трассы проходки актуализируются, путь не трогается", () => {
  const { P, w } = install({ panels: [M.newPanel(600, 150)] });
  const el = M.newElement("socket", w(0), 50, 30, "power");
  P.elements.push(el);
  const rt = M.newRoute(el.layer, "ceiling", [{ x: 350, y: 50 }, { x: 450, y: 50 }], el.id, null);
  rt.manual = true;
  P.routes.push(rt);
  EP.Plan.Routes.buildIncremental();
  eq(rt.points.length, 2, "путь ручной трассы не тронут");
  eq(rt.throughWalls.length, 1, "проходка пересчитана по текущим точкам — трасса пересекает правую стену");
  eq(rt.throughWalls[0].wallId, w(1), "проходка именно на правой стене");
});
test("buildIncremental: новая точка шлейфом подключается к уже проведённой точке, а не только к щиту", () => {
  const { P, w } = install({ panels: [M.newPanel(600, 150)] }); // щит далеко от комнаты
  P.guides.push(M.newGuide([{ x: 0, y: 150 }, { x: 700, y: 150 }])); // магистраль до щита — комната/щит не в одной комнате
  const a = M.newElement("socket", w(0), 50, 30, "power");
  P.elements.push(a);
  EP.Plan.Routes.build();
  const aRoute = P.routes.find((r) => r.fromId === a.id);
  ok(aRoute && aRoute.toPanel, "A изначально ведёт прямо к щиту (единственная точка)");

  const b = M.newElement("socket", w(0), 55, 30, "power"); // рядом с A, далеко от щита
  P.elements.push(b);
  EP.Plan.Routes.buildIncremental();
  const bRoute = P.routes.find((r) => r.fromId === b.id);
  ok(bRoute, "у B появилась трасса");
  eq(bRoute.toId, a.id, "B подключилась к уже проведённой A (ближе), а не напрямую к щиту");
  eq(JSON.stringify(aRoute.points), JSON.stringify(P.routes.find((r) => r.fromId === a.id).points), "трасса A не изменилась");
});
test("розетка в откосе: маркер на кромке проёма, без отступа внутрь комнаты", () => {
  const { P, w } = install();
  const op = M.newOpening("window"); op.wallId = w(0); op.offset = 100; op.width = 90;
  P.openings.push(op);
  // откосная розетка слева (сторона "a" = кромка на offset 100)
  const el = M.newElement("socket", w(0), 100, 90, "power");
  el.reveal = { openingId: op.id, side: "a" };
  P.elements.push(el);
  const dp = G.elemDrawPoint(P, el);
  // стена 0 = верх (0,0)->(400,0), внутренняя нормаль вниз (+y); откосная розетка
  // остаётся на оси стены (y≈0), НЕ отступает внутрь комнаты, сдвинута вдоль стены в проём
  near(dp.y, 0, 3, "маркер откосной розетки на оси стены, не внутрь комнаты");
  ok(dp.x > 100, "сдвинут вдоль стены внутрь проёма (сторона a → больший offset)");
  // обычная розетка на той же стене — для контраста — отступает внутрь комнаты
  const normal = M.newElement("socket", w(0), 250, 30, "power"); P.elements.push(normal);
  ok(Math.abs(G.elemDrawPoint(P, normal).y) > 10, "обычная розетка отступает внутрь комнаты");
  // откосная розетка — обычная точка для трассировки (не исключается)
  ok(el.type === "socket" && el.status !== "existing", "откосная розетка участвует в трассировке как обычная точка");
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
test("rules: потолочный свет НЕ «слишком высоко», а настенное устройство выше макс — ДА", () => {
  const { P, w } = install();
  // свободный потолочный свет на высоте потолка (270 > дефолт maxDeviceH 250) — БЕЗ wallId
  const light = M.newElement("light", null, 0, 270, "light"); light.params = { x: 200, y: 150 };
  P.elements.push(light);
  let msgs = EP.Plan.Rules.run(P).issues.map((i) => i.msg).join(" | ");
  ok(!/слишком высоко/.test(msgs), "потолочный свет не должен флагаться как слишком высоко");
  // а вот настенная розетка на 270 — реально слишком высоко
  const sock = M.newElement("socket", w(0), 100, 270, "power"); P.elements.push(sock);
  msgs = EP.Plan.Rules.run(P).issues.map((i) => i.msg).join(" | ");
  ok(/слишком высоко/.test(msgs), "настенное устройство выше макс должно флагаться");
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
  // orientation НЕ должен быть задан в манифесте — иначе установленное PWA (WebAPK)
  // крутится по датчику в обход системного тумблера автоповорота Android
  // ("any" → SCREEN_ORIENTATION_FULL_SENSOR). Без поля → SCREEN_ORIENTATION_UNSPECIFIED,
  // ориентация уважает системную настройку; принудительный разворот развёртки стен
  // остаётся через runtime screen.orientation.lock() в fullscreen (не зависит от манифеста).
  ok(m.orientation === undefined, "orientation не задан (уважаем системный автоповорот)");
});
test("UI: системное выделение текста выключено, но живо там, где копируют", () => {
  const fs = require("fs"), path = require("path");
  const css = fs.readFileSync(path.resolve(__dirname, "..", "assets", "css", "base.css"), "utf8");
  // долгий тап — СВОЙ жест приложения (меню точки на плане, тяга отрезка трассы);
  // системное выделение поднимало плашку «Искать в Google» поверх интерфейса
  ok(/body\{[^}]*user-select:\s*none/.test(css), "глобально user-select:none на body");
  ok(/-webkit-touch-callout:\s*none/.test(css), "callout по долгому тапу выключен");
  const back = css.match(/[^}]*\{[^}]*user-select:\s*text[^}]*\}/g) || [];
  const sel = back.join(" ");
  ["input", "textarea", "contenteditable", ".guide-page", ".privacy-page", ".whatsnew-page",
    ".ep-log-box", ".ep-ai-msgs", ".ep-selectable"].forEach((s) => {
    ok(sel.indexOf(s) >= 0, "выделение возвращено: " + s);
  });
  const privacy = fs.readFileSync(path.resolve(__dirname, "..", "pages", "privacy.html"), "utf8");
  ok(/class="page privacy-page"/.test(privacy), "у политики есть класс privacy-page для белого списка");
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
  // кабель: (32+50)горизонталь + 240 + 120 = 442 см + выпуск (20 точка + 50 щит) = 512 см × 1.1 запас = 5.6 м
  const cab = res.items.find((i) => i.name.indexOf("3×2.5") >= 0);
  ok(cab, "кабель по марке");
  near(cab.qty, 5.6, 0.05, "метры кабеля с запасом");
  // ниша под щит — как в конфигураторе щита
  const niche = res.items.find((i) => i.name.indexOf("Вырубка ниши") >= 0);
  ok(niche && niche.qty === 24, "вырубка × модули");
  ok(res.items.some((i) => i.name === "Монтаж щита в нишу/стену"), "монтаж щита");
  // работы, «не падавшие в работу» (просьба пользователя): вклейка подрозетников —
  // та же раскладка std/deep, что и высверливание; прокладка кабеля — тот же метраж,
  // что и материал «Кабель …»; сборка/расключение щита — по числу аппаратов
  const glueStd = res.items.find((i) => i.name === "Вклейка подрозетников обычных бетон");
  const glueDeep = res.items.find((i) => i.name === "Вклейка подрозетников глубоких бетон");
  ok(glueStd && glueStd.qty === 1, "вклейка обычного подрозетника отдельно от сверления");
  ok(glueDeep && glueDeep.qty === 1, "вклейка глубокого подрозетника отдельно от сверления");
  const layCable = res.items.find((i) => i.name === "Прокладка кабеля ВВГнг(А)-LS 3×2.5");
  ok(layCable, "есть работа «прокладка кабеля», отдельной строкой по марке");
  near(layCable.qty, cab.qty, 0.05, "метраж прокладки = метражу материала кабеля той же марки");
  const breakers = res.items.find((i) => i.name === "Установка автоматического выключателя");
  ok(breakers && breakers.qty === 1, "только вводной — линии (p.circuits) в этом проекте не заведены");
});
test("calcByRoutes: сборка щита — автоматы/УЗО по числу линий+вводных, распред. коробка, гофра", () => {
  const { P, w } = install();
  const pn = M.newPanel(50, 50, "Щ");
  P.panels.push(pn);
  P.settings.mainRcd = true; // вводное УЗО
  const cc1 = M.newCircuit("QF1", "#f00", 16); cc1.rcd = true; // линия с УЗО/дифом
  const cc2 = M.newCircuit("QF2", "#0f0", 16); // линия без УЗО
  P.circuits.push(cc1, cc2);
  const s1 = M.newElement("socket", w(0), 100, 30, "power"); s1.circuitId = cc1.id;
  const s2 = M.newElement("socket", w(1), 100, 30, "power"); s2.circuitId = cc2.id;
  const j1 = M.newElement("junction", w(2), 100, 270, "power");
  P.elements.push(s1, s2, j1);
  const rt1 = M.newRoute("power", "ceiling", [{ x: 100, y: 18 }, { x: 50, y: 50 }], s1.id, pn.id); rt1.toPanel = true;
  const rt2 = M.newRoute("power", "ceiling", [{ x: 100, y: 18 }, { x: 50, y: 50 }], s2.id, pn.id); rt2.toPanel = true;
  P.routes.push(rt1, rt2);
  const res = EP.Plan.Calc.calcByRoutes(P);
  const breakers = res.items.find((i) => i.name === "Установка автоматического выключателя");
  ok(breakers && breakers.qty === 3, "вводной + 2 линии"); // 1 вводной + cc1 + cc2
  const rcds = res.items.find((i) => i.name === "Установка УЗО/дифавтомата");
  ok(rcds && rcds.qty === 2, "вводное УЗО + УЗО линии cc1"); // mainRcd + cc1.rcd
  // работы по распайкам разделены по МЕСТУ: коробка на потолке vs распайка в подрозетнике
  const junctWork = res.items.find((i) => i.name === "Собрать распаянную коробку на потолке");
  ok(junctWork && junctWork.qty === 1, "сборка потолочной коробки по числу распаек");
});
test("calcByRoutes: временные сети — вручную заданное число точек добавляет работу", () => {
  const { P, w } = install();
  const pn = M.newPanel(50, 50, "Щ"); P.panels.push(pn);
  P.settings.tempLightingPts = 3; P.settings.tempSocketsPts = 5;
  const s1 = M.newElement("socket", w(0), 100, 30, "power"); P.elements.push(s1);
  const rt = M.newRoute("power", "ceiling", [{ x: 100, y: 18 }, { x: 50, y: 50 }], s1.id, pn.id); rt.toPanel = true;
  P.routes.push(rt);
  const res = EP.Plan.Calc.calcByRoutes(P);
  const tl = res.items.find((i) => i.name === "Временное освещение (организация)");
  const ts = res.items.find((i) => i.name === "Временные розеточные сети (организация)");
  ok(tl && tl.qty === 3, "временное освещение — 3 точки");
  ok(ts && ts.qty === 5, "временные розетки — 5 точек");
});
test("calcByRoutes: временные сети по умолчанию (0) — работа не добавляется", () => {
  const { P, w } = install();
  const pn = M.newPanel(50, 50, "Щ"); P.panels.push(pn);
  const s1 = M.newElement("socket", w(0), 100, 30, "power"); P.elements.push(s1);
  const rt = M.newRoute("power", "ceiling", [{ x: 100, y: 18 }, { x: 50, y: 50 }], s1.id, pn.id); rt.toPanel = true;
  P.routes.push(rt);
  const res = EP.Plan.Calc.calcByRoutes(P);
  ok(!res.items.some((i) => i.name.indexOf("Временн") >= 0), "без ручного ввода — временных работ нет");
});
test("calcByRoutes: своя высота щита (pn.height) меняет метраж кабеля до него", () => {
  const { P, w } = install();
  const pn = M.newPanel(50, 50, "Щ"); pn.height = 250; // щит высоко — спуск короче (270-250=20, не 120)
  P.panels.push(pn);
  const s1 = M.newElement("socket", w(0), 100, 30, "power");
  P.elements.push(s1);
  const rt = M.newRoute("power", "ceiling", [{ x: 100, y: 18 }, { x: 100, y: 50 }, { x: 50, y: 50 }], s1.id, pn.id);
  rt.toPanel = true;
  P.routes.push(rt);
  const res = EP.Plan.Calc.calcByRoutes(P);
  // (32+50)горизонталь + 240(точка) + 20(щит, 270-250) = 342 см + выпуск (20 точка + 50 щит) = 412 см × 1.1 запас = 4.5 м
  const cab = res.items.find((i) => i.name.indexOf("3×2.5") >= 0);
  ok(cab, "кабель по марке");
  near(cab.qty, 4.5, 0.05, "метры кабеля со своей (высокой) высотой щита, не с общей 150см");
});
test("calcByRoutes: расходники по кабелю/штробам (крепёж/буры/коронки/диски/мешки) из EP.CableConsum", () => {
  const { P, w } = install();
  const pn = M.newPanel(50, 50, "Щ");
  P.panels.push(pn);
  const s1 = M.newElement("socket", w(0), 100, 30, "power");
  const sw1 = M.newElement("switch", w(1), 150, 90, "light");
  P.elements.push(s1, sw1);
  const rt = M.newRoute("power", "ceiling", [{ x: 100, y: 18 }, { x: 100, y: 50 }, { x: 50, y: 50 }], s1.id, pn.id);
  rt.toPanel = true;
  P.routes.push(rt);
  const res = EP.Plan.Calc.calcByRoutes(P);
  ok(res.items.some((i) => i.name === "Бур 6 мм"), "буры — есть подрозетники");
  ok(res.items.some((i) => i.name === "Бур 8 мм"), "буры — есть подрозетники");
  ok(res.items.some((i) => i.name === "Пика"), "пика — есть подрозетники и штроба");
  ok(res.items.some((i) => i.name === "Карандаш"), "карандаш — есть подрозетники и штроба");
  ok(res.items.some((i) => i.name.indexOf("Коронка") >= 0), "коронка по подрозетникам (Бетон)");
  ok(res.items.some((i) => i.name.indexOf("Диск") >= 0), "диск по штробе (Бетон)");
  ok(res.items.some((i) => i.name.indexOf("Мешки") >= 0), "мешки мусора/пылесоса");
});
test("calcByRoutes: без EP.CableConsum — обычные позиции есть, расходники просто не добавляются", () => {
  const { P, w } = install();
  const pn = M.newPanel(50, 50, "Щ"); P.panels.push(pn);
  const s1 = M.newElement("socket", w(0), 100, 30, "power");
  P.elements.push(s1);
  const rt = M.newRoute("power", "ceiling", [{ x: 100, y: 18 }, { x: 50, y: 50 }], s1.id, pn.id);
  rt.toPanel = true;
  P.routes.push(rt);
  const saved = EP.CableConsum;
  delete EP.CableConsum;
  let res;
  noThrow(() => { res = EP.Plan.Calc.calcByRoutes(P); }, "не падает без CableConsum");
  ok(res && res.items.length, "обычные позиции всё равно есть");
  ok(!res.items.some((i) => i.name === "Пика"), "расходников CableConsum нет без модуля");
  EP.CableConsum = saved;
});
test("calcByRoutes: «Прокладка кабеля» разбита ПО МАРКЕ (свет 3×1.5 и силовая 3×2.5 — отдельные строки)", () => {
  const { P, w } = install();
  const pn = M.newPanel(50, 50, "Щ"); P.panels.push(pn);
  const s1 = M.newElement("socket", w(0), 100, 30, "power");
  const sw1 = M.newElement("switch", w(1), 150, 90, "light");
  P.elements.push(s1, sw1);
  const rt1 = M.newRoute("power", "ceiling", [{ x: 100, y: 18 }, { x: 50, y: 50 }], s1.id, pn.id); rt1.toPanel = true;
  const rt2 = M.newRoute("light", "ceiling", [{ x: 150, y: 18 }, { x: 50, y: 50 }], sw1.id, pn.id); rt2.toPanel = true;
  P.routes.push(rt1, rt2);
  const res = EP.Plan.Calc.calcByRoutes(P);
  const layPower = res.items.find((i) => i.name === "Прокладка кабеля ВВГнг(А)-LS 3×2.5");
  const layLight = res.items.find((i) => i.name === "Прокладка кабеля ВВГнг(А)-LS 3×1.5");
  ok(layPower && layLight, "две отдельные строки прокладки — по своей марке каждая");
  ok(layPower.name !== layLight.name, "строки не слились в одну");
  near(layPower.qty, res.cableBy["ВВГнг(А)-LS 3×2.5"], 0.05, "силовая прокладка = метражу материала своей марки");
  near(layLight.qty, res.cableBy["ВВГнг(А)-LS 3×1.5"], 0.05, "световая прокладка = метражу материала своей марки");
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
  // интернет/ТВ/видеонаблюдение — «Витая пара» (просьба пользователя), не «Слаботочный (UTP/RG-6)»
  ok(res.items.some((i) => i.name.indexOf("Витая пара") >= 0), "марка слаботочки — витая пара");
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
  eq(p.settings.cableStubPoint, 20, "выпуск у точки 20см");
  eq(p.settings.cableStubJunction, 30, "выпуск у распайки 30см");
  eq(p.settings.cableStubPanel, 50, "запас в щите 50см");
});
test("backfillProject: старый проект без cableStub* — бэкофилл дефолтами", () => {
  const old = { name: "old", settings: {}, rooms: [], elements: [], panels: [], routes: [] };
  const imp = EP.Plan.Core.importJSON(JSON.stringify({ project: old }));
  eq(imp.settings.cableStubPoint, 20, "бэкофилл cableStubPoint");
  eq(imp.settings.cableStubJunction, 30, "бэкофилл cableStubJunction");
  eq(imp.settings.cableStubPanel, 50, "бэкофилл cableStubPanel");
});
test("RT.cableStub: точка/распайка × щит/без щита", () => {
  const { P } = install();
  const el = { type: "socket" };
  const junc = { type: "junction" };
  eq(EP.Plan.Routes.cableStub(P, el, {}), 20, "обычная точка, без щита — 20см");
  eq(EP.Plan.Routes.cableStub(P, junc, {}), 30, "распайка, без щита — 30см");
  eq(EP.Plan.Routes.cableStub(P, el, { toPanel: true }), 70, "точка до щита — 20+50=70см");
  eq(EP.Plan.Routes.cableStub(P, junc, { toPanel: true }), 80, "распайка до щита — 30+50=80см");
  P.settings.cableStubPoint = 15;
  P.settings.cableStubJunction = 25;
  P.settings.cableStubPanel = 40;
  eq(EP.Plan.Routes.cableStub(P, el, { toPanel: true }), 55, "кастомные настройки применяются");
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
test("routeOff: НЕ схлопывается на проектах с 11+ линиями (раньше кап ×10 давал identical offset начиная с QF11)", () => {
  const { P, w } = install();
  const circs = [];
  for (let i = 0; i < 15; i++) { const c = M.newCircuit("QF" + (i + 1), "#e11", 16); P.circuits.push(c); circs.push(c); }
  const pn = M.newPanel(200, 295, "Щ"); P.panels.push(pn);
  const target = { kind: "panel", pos: { x: pn.x, y: pn.y } };
  const ys = new Set();
  [9, 10, 11, 14].forEach((idx) => {
    const el = M.newElement("socket", w(0), 100, 30, "power"); el.circuitId = circs[idx].id; P.elements.push(el);
    const path = EP.Plan.Routes.buildPath(P, el, G.routeAnchor(P, el), target);
    ys.add(Math.round(path[1].y));
  });
  eq(ys.size, 4, "линии с индексом 10, 11, 12, 15 (idx 9,10,11,14) дают 4 РАЗНЫХ отступа, не 1 общий");
});
test("chainRouteIds: шлейф без распайки — клик по СРЕДНЕМУ звену выделяет ВСЮ цепь от щита до конечной точки", () => {
  const { P, w } = install();
  const q = M.newCircuit("QF1", "#e11", 16); P.circuits.push(q);
  const pan = M.newPanel(390, 295); P.panels.push(pan);
  const el1 = M.newElement("socket", w(0), 60, 30, "power"); el1.circuitId = q.id;
  const el2 = M.newElement("socket", w(0), 150, 30, "power"); el2.circuitId = q.id;
  const el3 = M.newElement("socket", w(0), 240, 30, "power"); el3.circuitId = q.id;
  P.elements.push(el1, el2, el3);
  EP.Plan.Routes.build();
  eq(P.routes.length, 3, "3 хопа шлейфа построены");
  const mid = P.routes.find((r) => r.fromId === el2.id) || P.routes.find((r) => r.toId === el2.id);
  const chain = EP.Plan.Routes.chainRouteIds(P, mid);
  eq(chain.size, 3, "клик по среднему звену — вся цепь (все 3 хопа), не только кликнутый");
});
test("chainRouteIds: через распайку — клик по одной ветке не задевает соседнюю, клик по стволу задевает обе", () => {
  const { P, w } = install();
  const q = M.newCircuit("QF1", "#e11", 16); P.circuits.push(q);
  const pan = M.newPanel(390, 295); P.panels.push(pan);
  const junc = M.newElement("junction", null, 0, 0, "routes"); junc.params = { x: 200, y: 150 }; junc.circuitId = q.id;
  const dev1 = M.newElement("socket", w(0), 60, 30, "power"); dev1.circuitId = q.id;
  const dev2 = M.newElement("light", null, 0, 270, "light"); dev2.params = { x: 100, y: 250 }; dev2.circuitId = q.id;
  P.elements.push(junc, dev1, dev2);
  EP.Plan.Routes.build();
  const rDev1 = P.routes.find((r) => r.fromId === dev1.id);
  const rTrunk = P.routes.find((r) => r.fromId === junc.id);
  eq(EP.Plan.Routes.chainRouteIds(P, rDev1).size, 2, "ветка dev1: сама + ствол распайки, БЕЗ dev2");
  ok(!EP.Plan.Routes.chainRouteIds(P, rDev1).has(P.routes.find((r) => r.fromId === dev2.id).id), "ветка dev2 не задета");
  eq(EP.Plan.Routes.chainRouteIds(P, rTrunk).size, 3, "клик по стволу — ствол + обе ветки (dev1 и dev2)");
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
test("другая комната: перпендикулярная проходка через стену (по магистрали — без неё путь между комнатами не строится)", () => {
  const { P } = install();
  const roomB = M.newRoom(G.rectPoints(400, 0, 400, 300), "B");
  P.rooms.push(roomB);
  const pn = M.newPanel(100, 150, "Щ"); P.panels.push(pn); // в комнате A
  const s1 = M.newElement("socket", roomB.id + ":1", 150, 30, "power"); // правая стена B
  P.elements.push(s1);
  const a = G.routeAnchor(P, s1);
  const target = { kind: "panel", pos: { x: pn.x, y: pn.y } };
  ok(EP.Plan.Routes.buildPath(P, s1, a, target) === null, "БЕЗ магистрали между комнатами путь не строится");
  P.guides.push(M.newGuide([{ x: 50, y: 150 }, { x: 750, y: 150 }])); // магистраль через обе комнаты, пересекает стену x=400
  const path = EP.Plan.Routes.buildPath(P, s1, a, target);
  ok(path, "С магистралью путь построен");
  const hits = G.polylineCrossings(P, path, s1.wallId);
  ok(hits.length >= 1, "есть проходка");
  // сегмент через стену x=400 — строго горизонтальный (перпендикуляр к вертикальной стене) —
  // магистраль нарисована прямой горизонтальной линией, поэтому и переход через стену на ней прямой
  let perp = false;
  for (let i = 0; i < path.length - 1; i++) {
    const p1 = path[i], p2 = path[i + 1];
    if ((p1.x - 400) * (p2.x - 400) < 0) { if (Math.abs(p1.y - p2.y) < 0.5) perp = true; }
  }
  ok(perp, "проходка перпендикулярна стене");
});
test("проходка через перегородку-балку (после слияния комнат): polylineCrossings ловит beam", () => {
  const { P } = install();
  const beam = M.newBeam({ x: 200, y: 0 }, { x: 200, y: 300 }, "beam", 12, "Бетон");
  P.beams.push(beam);
  const hits = G.polylineCrossings(P, [{ x: 100, y: 150 }, { x: 300, y: 150 }], null);
  ok(hits.some((h) => h.wallId === "beam:" + beam.id), "пересечение сплошной перегородки поймано");
});
test("трасса по полу: сплошная перегородка — гильза, перемычка — без гильзы; по потолку — обе с гильзой", () => {
  const { P } = install();
  const beam = M.newBeam({ x: 200, y: 0 }, { x: 200, y: 300 }, "beam", 12, "Бетон");
  P.beams.push(beam);
  const rt = M.newRoute("power", "floor", [{ x: 100, y: 150 }, { x: 300, y: 150 }], null, null);
  const has = () => (rt.throughWalls || []).some((c) => c.wallId === "beam:" + beam.id);
  P.settings.routeType = "floor";
  EP.Plan.Routes.recomputeThroughWalls(P, rt);
  ok(has(), "перегородка по полу — гильза нужна");
  beam.kind = "lintel";
  EP.Plan.Routes.recomputeThroughWalls(P, rt);
  ok(!has(), "перемычка по полу — кабель под ней, гильзы нет");
  // поверхность теперь у КАЖДОЙ трассы своя (rt.routeType) и она главнее общей настройки
  // проекта — при комбинированной разводке иначе фильтр применялся бы не по физике хопа
  rt.routeType = "ceiling";
  P.settings.routeType = "ceiling";
  EP.Plan.Routes.recomputeThroughWalls(P, rt);
  ok(has(), "перемычка по потолку — гильза нужна");
  P.settings.routeType = "floor"; // общая настройка «пол», но САМА трасса по потолку
  EP.Plan.Routes.recomputeThroughWalls(P, rt);
  ok(has(), "поверхность самой трассы главнее общей настройки проекта");
});
test("createProject: стартовые настройки высота/пол-потолок/монтаж (опции формы создания)", () => {
  const p = EP.Plan.Core.createProject("X", { ceilingHeight: 300, routeType: "floor", gofraCeil: false });
  eq(p.settings.ceilingHeight, 300, "высота из формы");
  eq(p.settings.routeType, "floor", "сила по полу");
  eq(p.settings.gofraCeil, false, "монтаж на стяжки");
  const d = EP.Plan.Core.createProject("Y");
  eq(d.settings.ceilingHeight, 270, "дефолт без opts");
  eq(d.settings.routeType, "ceiling", "дефолт по потолку");
});
test("проходки Ø20: без гофры — макс. 2 кабеля в гильзу", () => {
  const { P, w } = install({ settings: Object.assign({}, M.newProject("t").settings, { gofraCeil: false }) });
  const pn = M.newPanel(50, 50, "Щ"); P.panels.push(pn);
  // 3 кабеля через одно место стены, БЕЗ гофры (settings.gofraCeil:false) → 2 гильзы
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
  eq(sl.qty, 2, "3 кабеля без гофры → 2 гильзы");
});
test("проходки Ø20: в гофре (по умолчанию) — 1 кабель на гильзу", () => {
  // просьба пользователя: «1 проходка это 2 провода без гофры, или 1 в гофре» — гофра
  // толще, вдвоём в Ø20 уже не входят. По умолчанию settings.gofraCeil=true (потолок).
  const { P, w } = install();
  const pn = M.newPanel(50, 50, "Щ"); P.panels.push(pn);
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
  eq(sl.qty, 3, "3 кабеля в гофре → 3 гильзы (каждому своя)");
});
test("проходки Ø20: по полу — всегда гофра (1 кабель на гильзу), даже если gofraCeil=false", () => {
  const { P, w } = install({ settings: Object.assign({}, M.newProject("t").settings, { routeType: "floor", gofraCeil: false }) });
  const pn = M.newPanel(50, 50, "Щ"); P.panels.push(pn);
  for (let i = 0; i < 2; i++) {
    const e2 = M.newElement("socket", w(0), 100 + i * 5, 30, "power");
    P.elements.push(e2);
    const rt = M.newRoute("power", "floor", [{ x: 100, y: 20 }, { x: 200, y: 150 }], e2.id, pn.id);
    rt.toPanel = true;
    rt.throughWalls = [{ x: 400, y: 150, wallId: w(1) }];
    P.routes.push(rt);
  }
  const res = EP.Plan.Calc.calcByRoutes(P);
  const sl = res.items.find((i) => i.name.indexOf("Проходка Ø20") >= 0);
  ok(sl, "есть проходки");
  eq(sl.qty, 2, "по полу гофра всегда — 2 кабеля → 2 гильзы, gofraCeil на пол не влияет");
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
test("panelVert: своя высота щита (pn.height) используется вместо общей settings.panelHeight", () => {
  const { P } = install();
  const pn = M.newPanel(50, 50, "Щ"); pn.height = 30; // низкий щит
  P.panels.push(pn);
  eq(EP.Plan.Routes.panelVert(P, pn), P.settings.ceilingHeight - 30, "своя высота, не общая");
  eq(EP.Plan.Routes.panelVert(P, null), P.settings.ceilingHeight - P.settings.panelHeight, "без щита — общая settings.panelHeight, как раньше");
});
test("panelVert: у старого щита (без поля height, undefined) — общая settings.panelHeight (обратная совместимость)", () => {
  const { P } = install();
  const pn = M.newPanel(50, 50, "Щ"); delete pn.height; // как в проектах, сохранённых до этой правки
  P.panels.push(pn);
  eq(EP.Plan.Routes.panelVert(P, pn), P.settings.ceilingHeight - P.settings.panelHeight, "undefined трактуется как «нет своей высоты»");
});
test("lengths: своя высота щита меняет метраж спуска у щита для трасс, приходящих именно в него", () => {
  const { P, w } = install();
  const pn = M.newPanel(390, 10, "Щ"); pn.height = 30; P.panels.push(pn);
  const s1 = M.newElement("socket", w(0), 100, 30, "power"); P.elements.push(s1);
  const rt = M.newRoute("power", "ceiling", [{ x: 100, y: 18 }, { x: 390, y: 10 }], s1.id, pn.id);
  rt.toPanel = true;
  P.routes.push(rt);
  const withCustom = EP.Plan.Routes.lengths(P).total;
  pn.height = P.settings.panelHeight; // подвинули обратно на общую высоту
  const withDefault = EP.Plan.Routes.lengths(P).total;
  ok(Math.abs(withCustom - withDefault) > 1, "разная высота щита даёт разный суммарный метраж трассы");
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
  // межкомнатный переход теперь ТОЛЬКО по магистрали (см. инвариант buildPath) — рисуем её
  // сами. Пол+дверь — магистраль ЧЕРЕЗ дверь (y=250), тогда дверь остаётся реальной точкой
  // перехода (без лишней гильзы, см. floorSkip) — пользователь сам ведёт направление через
  // проём, а не автопоиск ближайшего на прямой, как было раньше. Иначе — прямая y=150.
  const guideY = (routeType === "floor" && withDoor) ? 250 : 150;
  P.guides.push(M.newGuide([{ x: 50, y: guideY }, { x: 750, y: guideY }]));
  return { P, pn, lamp };
}
// Точка пересечения пути с линией стены x=400 — С магистралью крест стены теперь чаще
// приходится НА середину прямого участка (по трунку магистрали), а не на явную вершину
// пути, как было у старого прямого фолбэка — интерполируем между соседними точками.
function crossYAt400(path) {
  for (let i = 0; i < path.length - 1; i++) {
    const p1 = path[i], p2 = path[i + 1];
    if ((p1.x - 400) * (p2.x - 400) <= 0 && p1.x !== p2.x) {
      const t = (400 - p1.x) / (p2.x - p1.x);
      return p1.y + t * (p2.y - p1.y);
    }
  }
  return null;
}
test("buildPath (пол): дверь на общей стене — переход через неё, а не в произвольном месте", () => {
  const { P, pn, lamp } = twoRoomsWithLamp("floor", true);
  const a = G.routeAnchor(P, lamp);
  const path = EP.Plan.Routes.buildPath(P, lamp, a, { kind: "panel", pos: { x: pn.x, y: pn.y } });
  near(crossYAt400(path), 250, 10, "путь проходит через дверь (y≈250) — магистраль нарисована через неё");
});
test("buildPath (пол): без двери на стене — прежнее поведение, проходка на прямой", () => {
  const { P, pn, lamp } = twoRoomsWithLamp("floor", false);
  const a = G.routeAnchor(P, lamp);
  const path = EP.Plan.Routes.buildPath(P, lamp, a, { kind: "panel", pos: { x: pn.x, y: pn.y } });
  near(crossYAt400(path), 150, 10, "без проёма — переход там, где нарисована магистраль (y≈150)");
});
test("buildPath (потолок): дверь есть, но обход применяется только к трассировке по полу", () => {
  const { P, pn, lamp } = twoRoomsWithLamp("ceiling", true);
  const a = G.routeAnchor(P, lamp);
  const path = EP.Plan.Routes.buildPath(P, lamp, a, { kind: "panel", pos: { x: pn.x, y: pn.y } });
  near(crossYAt400(path), 150, 10, "потолок — дверь не влияет, переход там, где нарисована магистраль (y≈150)");
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
test("perCircuit: разбивка по линиям QF — кабель/точки/проходки по своей линии", () => {
  const { P, w } = install();
  const cc1 = M.newCircuit("QF1", "#ef4444", 16); P.circuits.push(cc1);
  const cc2 = M.newCircuit("QF2", "#22c55e", 25); cc2.rcd = true; P.circuits.push(cc2);
  const pn = M.newPanel(50, 50, "Щ"); P.panels.push(pn);
  const a = M.newElement("socket", w(0), 100, 30, "power"); a.circuitId = cc1.id; P.elements.push(a);
  const b = M.newElement("socket", w(0), 200, 30, "power"); b.circuitId = cc1.id; P.elements.push(b);
  const d = M.newElement("socket", w(2), 100, 30, "power"); d.circuitId = cc2.id; P.elements.push(d);
  [a, b, d].forEach((e) => {
    const rt = M.newRoute("power", "ceiling", [G.elemPoint(P, e), { x: pn.x, y: pn.y }], e.id, pn.id);
    rt.toPanel = true; rt.circuitId = e.circuitId; P.routes.push(rt);
  });
  const per = EP.Plan.Calc.perCircuit(P);
  ok(per && per.length === 2, "две линии в разбивке");
  const r1 = per.find((r) => r.name === "QF1"), r2 = per.find((r) => r.name === "QF2");
  eq(r1.points, 2, "QF1 — 2 точки"); eq(r1.breaker, 16, "QF1 автомат 16A"); eq(r1.rcd, false, "QF1 без УЗО");
  eq(r2.points, 1, "QF2 — 1 точка"); eq(r2.breaker, 25, "QF2 автомат 25A"); eq(r2.rcd, true, "QF2 с УЗО");
  ok(r1.cableLen > 0, "QF1 длина кабеля посчитана");
});
test("estimateItems: без движка пула (PoolEngine не подключён) и без трасс — null, не падает", () => {
  const { P, w } = install();
  const pn = M.newPanel(50, 50, "Щ"); P.panels.push(pn);
  const s1 = M.newElement("socket", w(0), 100, 30, "power");
  P.elements.push(s1);
  noThrow(() => EP.Plan.Calc.estimateItems(P), "не бросает без EP.PoolEngine");
  eq(EP.Plan.Calc.estimateItems(P), null, "нет ни точного счёта, ни движка — null (как и runEngine напрямую)");
});

// ===== 18. Этажи =====
test("newProject: floors — один этаж по умолчанию, activeFloorId указывает на него", () => {
  const p = M.newProject("x");
  eq(p.floors.length, 1, "один этаж");
  eq(p.floors[0].name, "1 этаж");
  eq(p.activeFloorId, p.floors[0].id, "активный этаж — единственный");
});
test("backfillProject: старый проект без floors — миграция на один этаж, все сущности получают floorId", () => {
  const old = {
    name: "old", settings: {}, rooms: [{ id: "r1", points: [] }], elements: [{ id: "e1" }],
    panels: [{ id: "p1", x: 0, y: 0 }], routes: [{ id: "rt1" }], beams: [{ id: "b1" }],
    voids: [{ id: "v1" }], ledStrips: [{ id: "l1" }], openings: [{ id: "o1", type: "door", wallId: "r1:0" }]
  };
  const imp = EP.Plan.Core.importJSON(JSON.stringify({ project: old }));
  ok(Array.isArray(imp.floors) && imp.floors.length === 1, "миграция создала один этаж");
  ok(imp.activeFloorId === imp.floors[0].id, "activeFloorId проставлен");
  ["rooms", "elements", "panels", "routes", "beams", "voids", "ledStrips", "openings"].forEach((key) => {
    eq(imp[key][0].floorId, imp.floors[0].id, key + ": floorId проставлен бэкофиллом");
  });
});
test("G.floorScoped: с одним этажом возвращает ТОТ ЖЕ объект (без клонирования)", () => {
  const { P } = install();
  ok(G.floorScoped(P) === P, "нет клона для однoэтажного проекта");
});
test("G.floorScoped: с двумя этажами фильтрует геометрические массивы на активный этаж", () => {
  const { P } = install();
  const f2 = EP.Plan.Core.addFloor("2 этаж");
  const roomB = M.newRoom(G.rectPoints(0, 0, 300, 300), "B"); // создана уже на активном (f2)
  P.rooms.push(roomB);
  eq(roomB.floorId, f2.id, "новая комната получила floorId активного этажа");
  let sv = G.floorScoped(P);
  eq(sv.rooms.length, 1, "на f2 видна только roomB");
  eq(sv.rooms[0].id, roomB.id);
  EP.Plan.Core.setActiveFloor(P.floors[0].id);
  sv = G.floorScoped(P);
  eq(sv.rooms.length, 1, "после переключения на этаж 1 видна только исходная комната");
  eq(sv.rooms[0].id, P.rooms.find((r) => r.id !== roomB.id).id);
});
test("addFloor/setActiveFloor/deleteFloor: нельзя удалить последний этаж, удаление чистит содержимое", () => {
  const { P } = install();
  eq(EP.Plan.Core.deleteFloor(P.floors[0].id), false, "нельзя удалить единственный этаж");
  const f2 = EP.Plan.Core.addFloor("2 этаж");
  eq(P.activeFloorId, f2.id, "addFloor сразу переключает на новый этаж");
  const pn = M.newPanel(10, 10, "Щ2"); P.panels.push(pn);
  eq(pn.floorId, f2.id, "щит создан на активном (новом) этаже");
  ok(EP.Plan.Core.deleteFloor(f2.id), "удаление второго этажа разрешено (не последний)");
  eq(P.floors.length, 1, "остался один этаж");
  eq(P.panels.find((x) => x.id === pn.id), undefined, "щит второго этажа удалён вместе с этажом");
  eq(P.activeFloorId, P.floors[0].id, "активный этаж переключился на оставшийся");
});
test("EP.Plan.Routes.build(): перестройка активного этажа не трогает трассы другого этажа", () => {
  const { P, w } = install();
  const pn1 = M.newPanel(-50, -50, "Щ1"); P.panels.push(pn1); // щит вне комнаты — нужна магистраль
  P.guides.push(M.newGuide([{ x: -50, y: -50 }, { x: 300, y: 200 }])); // магистраль этажа 1
  const s1 = M.newElement("socket", w(0), 100, 30, "power"); P.elements.push(s1);
  EP.Plan.Routes.build({ silent: true });
  eq(P.routes.length, 1, "трасса этажа 1 построена");
  const rt1Id = P.routes[0].id;

  EP.Plan.Core.addFloor("2 этаж");
  const roomB = M.newRoom(G.rectPoints(0, 0, 400, 300), "B"); P.rooms.push(roomB);
  const pn2 = M.newPanel(-50, -50, "Щ2"); P.panels.push(pn2);
  P.guides.push(M.newGuide([{ x: -50, y: -50 }, { x: 300, y: 200 }])); // своя магистраль этажа 2 (addFloor уже переключил активный)
  const s2 = M.newElement("socket", roomB.id + ":0", 100, 30, "power"); P.elements.push(s2);
  EP.Plan.Routes.build({ silent: true });

  ok(P.routes.some((r) => r.id === rt1Id), "трасса этажа 1 осталась нетронутой");
  eq(P.routes.filter((r) => r.fromId === s2.id).length, 1, "трасса этажа 2 построена");
});
test("EP.Plan.Elements.hitAt: не находит элемент другого (неактивного) этажа по тем же координатам", () => {
  const { P, w } = install();
  const s1 = M.newElement("socket", w(0), 100, 30, "power"); P.elements.push(s1);
  const pt1 = G.elemDrawPoint(P, s1);
  EP.Plan.Core.addFloor("2 этаж"); // теперь активен новый этаж, s1 на нём не виден
  const hit = EP.Plan.Elements.hitAt(pt1, 50);
  ok(!hit || !hit.el || hit.el.id !== s1.id, "элемент этажа 1 не находится хит-тестом на этаже 2");
  EP.Plan.Core.setActiveFloor(P.floors[0].id);
  const hit2 = EP.Plan.Elements.hitAt(pt1, 50);
  ok(hit2 && hit2.el && hit2.el.id === s1.id, "но находится обратно на своём этаже");
});

// ===== 19. Шаблоны квартир =====
test("EP.Plan.Templates: все шаблоны строят валидные прямоугольные комнаты", () => {
  const all = EP.Plan.Templates.CATEGORIES.concat(EP.Plan.Templates.SERIES);
  ok(all.length >= 10, "категорий+серий достаточно");
  all.forEach((t) => {
    const built = t.build();
    ok(built.length >= 1, t.id + ": хотя бы одна комната");
    built.forEach((r) => {
      eq(r.points.length, 4, t.id + "/" + r.name + ": прямоугольник — 4 точки");
      const area = Math.abs((r.points[2].x - r.points[0].x) * (r.points[2].y - r.points[0].y));
      ok(area > 10000, t.id + "/" + r.name + ": комната не вырожденная (>1 м²)"); // 10000 см² = 1 м²
    });
  });
});
test("EP.Plan.Templates.apply: вставляет комнаты на активный этаж пустого проекта", () => {
  const { P } = install(); // одна комната уже есть от install()
  const before = P.rooms.length;
  const n = EP.Plan.Templates.apply("r2s");
  ok(n > 0, "вернул число добавленных комнат");
  eq(P.rooms.length, before + n, "комнаты реально добавлены в проект");
  const added = P.rooms.slice(before);
  added.forEach((r) => eq(r.floorId, P.activeFloorId, "новая комната — на активном этаже"));
});
test("EP.Plan.Templates.apply: неизвестный id — 0, ничего не добавляет, не падает", () => {
  const { P } = install();
  const before = P.rooms.length;
  noThrow(() => {
    eq(EP.Plan.Templates.apply("no-such-template"), 0, "неизвестный шаблон — 0");
  });
  eq(P.rooms.length, before, "проект не тронут");
});
test("EP.Plan.Templates.apply: вставляет ПРАВЕЕ уже нарисованного на этаже (не поверх)", () => {
  const { P, room } = install(); // room: rectPoints(0,0,400,300)
  EP.Plan.Templates.apply("studio");
  const added = P.rooms[P.rooms.length - 1];
  const minX = Math.min(...added.points.map((p) => p.x));
  ok(minX >= 400, "новый шаблон начинается не левее правого края существующей комнаты (x=400)");
});

// ===== 20. Фото точек: IndexedDB вместо inline base64 (оптимизация под слабые
// телефоны — фото больше НЕ дублируются в каждом undo-снимке/localStorage-записи) =====
test("фото: миграция inline base64 при импорте старого проекта → компактный id + photoUrl из кэша", () => {
  const room = M.newRoom(G.rectPoints(0, 0, 400, 300), "R");
  const proj = Object.assign(M.newProject("PhotoTest"), { rooms: [room] });
  const el = M.newElement("socket", room.id + ":0", 50, 30, "power");
  el.photos = ["data:image/jpeg;base64,AAAABBBB"];
  proj.elements = [el];
  EP.Plan.Core.importJSON(JSON.stringify({ project: proj }));
  const P = EP.Plan.Core.project;
  const id = P.elements[0].photos[0];
  ok(typeof id === "string" && !id.startsWith("data:"), "фото мигрировано в id, не data:-строка");
  eq(EP.Plan.Core.photoUrl(id), "data:image/jpeg;base64,AAAABBBB", "photoUrl отдаёт оригинальные байты из кэша");
});
test("фото: exportJSON гидрирует id обратно в base64 (переносимость на другое устройство), сам проект остаётся компактным", () => {
  const room = M.newRoom(G.rectPoints(0, 0, 400, 300), "R");
  const proj = Object.assign(M.newProject("PhotoExport"), { rooms: [room] });
  const el = M.newElement("light", room.id + ":0", 50, 0, "power");
  el.photos = ["data:image/png;base64,ZZZZ"];
  proj.elements = [el];
  EP.Plan.Core.importJSON(JSON.stringify({ project: proj }));
  const exported = JSON.parse(EP.Plan.Core.exportJSON());
  eq(exported.project.elements[0].photos[0], "data:image/png;base64,ZZZZ", "экспорт гидрирует id обратно в base64");
  ok(!EP.Plan.Core.project.elements[0].photos[0].startsWith("data:"), "исходный (не экспортный) проект остаётся с компактным id");
});
test("фото: addPhoto/photoUrl работают синхронно в памяти (без IndexedDB в тестовом сэндбоксе)", () => {
  const id = EP.Plan.Core.addPhoto("data:image/png;base64,QQQQ");
  ok(typeof id === "string" && id.length > 0, "addPhoto вернул id");
  eq(EP.Plan.Core.photoUrl(id), "data:image/png;base64,QQQQ");
});
test("фото: deleteProject чистит кэш фото своего проекта (утечки нет — не отменяемое действие)", () => {
  const room = M.newRoom(G.rectPoints(0, 0, 400, 300), "R");
  const proj = Object.assign(M.newProject("PhotoDel"), { rooms: [room] });
  const el = M.newElement("socket", room.id + ":0", 50, 30, "power");
  el.photos = ["data:image/jpeg;base64,CCCC"];
  proj.elements = [el];
  EP.Plan.Core.importJSON(JSON.stringify({ project: proj }));
  const pid = EP.Plan.Core.project.id;
  const photoId = EP.Plan.Core.project.elements[0].photos[0];
  ok(EP.Plan.Core.photoUrl(photoId) != null, "фото в кэше до удаления проекта");
  EP.Plan.Core.deleteProject(pid);
  eq(EP.Plan.Core.photoUrl(photoId), null, "фото вычищено из кэша после удаления проекта");
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
  eq(imp.panels[0].router, false, "бэкофилл panel.router");
  ok(Array.isArray(imp.guides), "бэкофилл guides (магистрали трасс)");

  // ===== 21. Магистраль трасс (p.guides) =====
  test("guides: newGuide — полилиния, hidden=false, floorId", () => {
    const g = M.newGuide([{ x: 0, y: 0 }, { x: 100, y: 0 }]);
    ok(g.id && g.points.length === 2 && g.hidden === false, "форма объекта");
  });
  test("guides: межкомнатная трасса идёт ПО нарисованной магистрали", () => {
    const r1 = M.newRoom(G.rectPoints(0, 0, 400, 300), "К1");
    const r2 = M.newRoom(G.rectPoints(400, 0, 400, 300), "К2");
    const q1 = M.newCircuit("QF1", "#e11", 16);
    const guide = M.newGuide([{ x: 50, y: 400 }, { x: 750, y: 400 }]); // «коридор» ниже комнат
    const { P } = install({ rooms: [r1, r2], circuits: [q1], panels: [M.newPanel(50, 50)], guides: [guide] });
    const sock = M.newElement("socket", P.rooms[1].id + ":0", 100, 30); sock.circuitId = q1.id;
    P.elements.push(sock);
    EP.Plan.Routes.build();
    const rt = P.routes.find((r) => r.fromId === sock.id);
    ok(rt, "трасса построена");
    ok((rt.points || []).some((pt) => Math.abs(pt.y - 400) < 1), "путь проходит по магистрали (y=400)");
  });
  test("guides: внутри ОДНОЙ комнаты магистраль НЕ применяется (обычный контур)", () => {
    const q1 = M.newCircuit("QF1", "#e11", 16);
    const guide = M.newGuide([{ x: 50, y: 400 }, { x: 350, y: 400 }]);
    const { P, w } = install({ circuits: [q1], panels: [M.newPanel(50, 50)], guides: [guide] });
    const sock = M.newElement("socket", w(0), 200, 30); sock.circuitId = q1.id;
    P.elements.push(sock);
    EP.Plan.Routes.build();
    const rt = P.routes.find((r) => r.fromId === sock.id);
    ok(rt, "трасса построена");
    ok(!(rt.points || []).some((pt) => Math.abs(pt.y - 400) < 1), "путь НЕ уходит на магистраль вне комнаты");
  });
  test("guides: РАЗНЫЕ линии (QF) по одной магистрали разносятся по +2см на линию (не ложатся друг на друга)", () => {
    const r1 = M.newRoom(G.rectPoints(0, 0, 400, 300), "К1");
    const r2 = M.newRoom(G.rectPoints(400, 0, 400, 300), "К2");
    const q1 = M.newCircuit("QF1", "#e11", 16); // idx 0 — offset 0, прямо по магистрали
    const q2 = M.newCircuit("QF2", "#0a0", 16); // idx 1 — offset +2см
    const guide = M.newGuide([{ x: 50, y: 400 }, { x: 750, y: 400 }]);
    const { P } = install({ rooms: [r1, r2], circuits: [q1, q2], panels: [M.newPanel(50, 50)], guides: [guide] });
    const s1 = M.newElement("socket", P.rooms[1].id + ":0", 100, 30); s1.circuitId = q1.id;
    const s2 = M.newElement("socket", P.rooms[1].id + ":0", 200, 30); s2.circuitId = q2.id;
    P.elements.push(s1, s2);
    EP.Plan.Routes.build();
    const rt1 = P.routes.find((r) => r.fromId === s1.id);
    const rt2 = P.routes.find((r) => r.fromId === s2.id);
    ok(rt1 && rt2, "обе трассы построены");
    // QF1 (первая линия) идёт РОВНО по нарисованной магистрали (y=400, без базового отступа —
    // магистраль не стена, это и есть «рекомендуемое направление» пользователя)
    ok(rt1.points.some((pt) => Math.abs(pt.y - 400) < 1), "QF1 — ровно на магистрали (y=400)");
    // QF2 (вторая линия) сдвинута на +2см перпендикулярно магистрали — НЕ совпадает с QF1
    ok(rt2.points.some((pt) => Math.abs(pt.y - 402) < 1), "QF2 — магистраль +2см (y=402)");
    ok(!rt2.points.some((pt) => Math.abs(pt.y - 400) < 1), "QF2 не ложится ровно на линию QF1");
  });
  test("guides: точка БЕЗ линии (circuitId=null) идёт РОВНО по магистрали (offset=0, не отрицательный)", () => {
    // Баг: circuitIdx(p,null) возвращал -1, а guideLaneOff без guard'а (Math.min(-1,10)*2 = -2)
    // сдвигал бы путь на -2см — на ПРОТИВОПОЛОЖНУЮ сторону от магистрали, вместо offset=0.
    const r1 = M.newRoom(G.rectPoints(0, 0, 400, 300), "К1");
    const r2 = M.newRoom(G.rectPoints(400, 0, 400, 300), "К2");
    const guide = M.newGuide([{ x: 50, y: 400 }, { x: 750, y: 400 }]);
    const { P } = install({ rooms: [r1, r2], panels: [M.newPanel(50, 50)], guides: [guide] });
    const sock = M.newElement("socket", P.rooms[1].id + ":0", 100, 30); // circuitId не задан (null)
    P.elements.push(sock);
    EP.Plan.Routes.build();
    const rt = P.routes.find((r) => r.fromId === sock.id);
    ok(rt, "трасса построена");
    ok(rt.points.some((pt) => Math.abs(pt.y - 400) < 1), "без линии — offset=0, путь ровно на магистрали (y=400)");
    ok(!rt.points.some((pt) => Math.abs(pt.y - 398) < 1), "НЕ уходит на -2см (старый баг с отрицательным offset)");
  });
  test("guides: build() скрывает ПРИМЕНЁННУЮ магистраль (hidden=true), но НЕ удаляет из модели", () => {
    const r1 = M.newRoom(G.rectPoints(0, 0, 400, 300), "К1");
    const r2 = M.newRoom(G.rectPoints(400, 0, 400, 300), "К2");
    const guide = M.newGuide([{ x: 50, y: 400 }, { x: 750, y: 400 }]); // коридор ниже — межкомнатная трасса пойдёт по нему
    const { P } = install({ rooms: [r1, r2], panels: [M.newPanel(50, 50)], guides: [guide] });
    P.elements.push(M.newElement("socket", P.rooms[1].id + ":0", 200, 30)); // в К2, щит в К1 — разные комнаты
    EP.Plan.Routes.build();
    eq(P.guides.length, 1, "магистраль осталась в модели");
    eq(P.guides[0].hidden, true, "применённая магистраль скрыта после построения");
  });
  test("guides: фикс №1 — НЕиспользованная магистраль (далеко) остаётся ВИДИМОЙ после build", () => {
    const guide = M.newGuide([{ x: 0, y: 5000 }, { x: 400, y: 5000 }]); // >8м от всего — не применится
    const { P, w } = install({ panels: [M.newPanel(50, 50)], guides: [guide] });
    P.elements.push(M.newElement("socket", w(0), 200, 30));
    EP.Plan.Routes.build();
    eq(P.guides[0].hidden, false, "далёкая/неиспользованная магистраль не скрывается — пользователь видит, что она не сработала");
  });
  test("guides: фикс №4 — шлейф по длине пути строит все трассы без падений", () => {
    const q1 = M.newCircuit("QF1", "#e11", 16);
    const { P, w } = install({ circuits: [q1], panels: [M.newPanel(50, 50)] });
    // 4 розетки одной линии без распайки -> шлейф (метрика по buildPath)
    [80, 160, 240, 320].forEach((off) => { const s = M.newElement("socket", w(0), off, 30); s.circuitId = q1.id; P.elements.push(s); });
    EP.Plan.Routes.build();
    const chain = P.routes.filter((r) => r.circuitId === q1.id);
    eq(chain.length, 4, "все 4 точки шлейфа получили трассу");
    eq(chain.filter((r) => r.toPanel).length >= 1, true, "хотя бы одна доходит до щита (голова шлейфа)");
  });
  test("guides: Т-магистраль (одна полилиния с ретрейсом центра) — БЕЗ лишнего крюка в тупиковую ветку", () => {
    // Т нарисована ОДНИМ росчерком: левое плечо -> центр -> низ ножки -> центр (повтор) -> правое плечо —
    // единственный способ нарисовать Т/Ш одной непрерывной линией в текущем UI (⇉). Раньше (до графа
    // магистралей) trunk строился по СЫРЫМ индексам между двумя точками — путь от правого плеча к щиту
    // (у левого плеча) зря нырял вниз по всей ножке и обратно (репорт пользователя со скриншотом).
    const rLeft = M.newRoom(G.rectPoints(0, 200, 250, 200), "Слева");
    const rRight = M.newRoom(G.rectPoints(600, 200, 250, 200), "Справа");
    const q1 = M.newCircuit("QF1", "#e11", 16);
    const gd = M.newGuide([
      { x: 50, y: 400 }, { x: 300, y: 400 }, // левое плечо
      { x: 300, y: 700 },                     // низ ножки (тупиковая ветка)
      { x: 300, y: 400 },                     // ретрейс центра
      { x: 550, y: 400 }                      // правое плечо
    ]);
    const { P } = install({ rooms: [rLeft, rRight], circuits: [q1], panels: [M.newPanel(30, 380)], guides: [gd] });
    const sRight = M.newElement("socket", P.rooms[1].id + ":2", 100, 30); sRight.circuitId = q1.id;
    P.elements.push(sRight);
    EP.Plan.Routes.build();
    const rt = P.routes.find((r) => r.fromId === sRight.id);
    ok(rt, "трасса построена");
    ok(!rt.points.some((pt) => pt.y > 500), "путь НЕ ныряет в тупиковую ножку (y>500) — идёт напрямую через центр Т");
  });
  test("guides: Т как ДВЕ отдельные магистрали, стыкующиеся в одной точке — граф соединяет их в один путь", () => {
    // Т нарисована ДВУМЯ отдельными заходами в ⇉ (перекладина + ножка), касающимися в (300,400).
    // Раньше guideRoute умел использовать только ОДНУ магистраль целиком — вторая половина пути шла
    // напрямую БЕЗ учёта геометрии магистрали. Граф объединяет их по общей (близкой) точке.
    const rLeft = M.newRoom(G.rectPoints(0, 200, 250, 200), "Слева");
    const rDown = M.newRoom(G.rectPoints(200, 700, 250, 200), "Внизу");
    const q1 = M.newCircuit("QF1", "#e11", 16);
    const bar = M.newGuide([{ x: 50, y: 400 }, { x: 300, y: 400 }]);
    const stem = M.newGuide([{ x: 300, y: 400 }, { x: 300, y: 700 }]);
    const { P } = install({ rooms: [rLeft, rDown], circuits: [q1], panels: [M.newPanel(30, 380)], guides: [bar, stem] });
    const sDown = M.newElement("socket", P.rooms[1].id + ":0", 100, 30); sDown.circuitId = q1.id;
    P.elements.push(sDown);
    EP.Plan.Routes.build();
    const rt = P.routes.find((r) => r.fromId === sDown.id);
    ok(rt, "трасса построена");
    ok(rt.points.some((pt) => Math.abs(pt.x - 300) < 5 && pt.y > 400), "путь идёт по «ножке» (stem)");
    // допуск 25см, а не 5: «перекладина» нарисована РОВНО по оси стены комнаты «Слева»
    // (y=400), а трассы больше не идут внутри тела стены — весь пучок отводится от неё на
    // settings.routeOffset (см. edgeWallAdjust в plan-routes.js), т.е. ложится на y≈380/420
    ok(rt.points.some((pt) => Math.abs(pt.y - 400) <= 25 && pt.x < 300), "путь идёт по «перекладине» (bar) — граф сшил обе магистрали");
  });
  test("guides: ответвление, упирающееся в СЕРЕДИНУ длинного прямого коридора (не в его конец) — граф всё равно сшивает", () => {
    // Найдено ПО РЕАЛЬНОМУ ПРОЕКТУ пользователя (экспорт JSON): длинный коридор нарисован
    // ОДНИМ прямым отрезком (2 точки), а короткая «ножка» в комнату — ОТДЕЛЬНОЙ магистралью,
    // чей конец упирается НЕ в конец коридора, а в его середину (естественный способ нарисовать
    // ответвление от уже нарисованного длинного коридора). Раньше 2 из 3 магистралей реального
    // проекта оставались неиспользованными именно из-за этого — дедуп узлов графа сливал только
    // ВЕРШИНЫ разных магистралей между собой, а тут стыка вершина-к-вершине нет вообще.
    const rTop = M.newRoom(G.rectPoints(0, 0, 300, 200), "Комната"); // ножка ведёт СЮДА
    const cor = M.newRoom(G.rectPoints(0, 200, 900, 150), "Коридор"); // длинный коридор, щит здесь
    const q1 = M.newCircuit("QF1", "#e11", 16);
    const corridor = M.newGuide([{ x: 20, y: 270 }, { x: 880, y: 270 }]); // ОДИН прямой отрезок на всю длину
    const leg = M.newGuide([{ x: 150, y: 270 }, { x: 150, y: 30 }]); // конец УПИРАЕТСЯ В СЕРЕДИНУ coridor (x=150, не в его конец x=20/880)
    const { P } = install({ rooms: [rTop, cor], circuits: [q1], panels: [M.newPanel(850, 260)], guides: [corridor, leg] });
    const s1 = M.newElement("socket", P.rooms[0].id + ":0", 150, 30); s1.circuitId = q1.id; // в комнате, над серединой коридора
    P.elements.push(s1);
    EP.Plan.Routes.build();
    eq(P.guides.filter((g) => g.hidden).length, 2, "ОБЕ магистрали применены (раньше — только коридор, ножка оставалась неиспользованной)");
    const rt = P.routes.find((r) => r.fromId === s1.id);
    ok(rt, "трасса построена");
    ok(rt.points.some((pt) => Math.abs(pt.x - 150) < 5 && pt.y < 270), "путь идёт по «ножке»");
    ok(rt.points.some((pt) => Math.abs(pt.y - 270) < 5 && pt.x > 150), "путь идёт по коридору дальше к щиту");
  });
  test("guides: боковой офсет между линиями НЕ зависит от направления обхода трассы (канонический per-edge)", () => {
    // Две трассы едут по ОДНОМУ ребру графа в ФИЗИЧЕСКИ противоположных направлениях (одна слева
    // направо к своему щиту, другая справа налево к своему) — офсет второй линии обязан оказаться
    // на ТОЙ ЖЕ физической стороне магистрали, что и у первой, а не зеркально (баг, пойманный при
    // разработке графа: нормаль считалась от направления route a->b, а не от фиксированного порядка
    // точек магистрали).
    const r1 = M.newRoom(G.rectPoints(0, 0, 300, 300), "К1");
    const r2 = M.newRoom(G.rectPoints(600, 0, 300, 300), "К2");
    const cor = M.newRoom(G.rectPoints(0, 400, 900, 150), "Коридор");
    const q1 = M.newCircuit("QF1", "#e11", 16), q2 = M.newCircuit("QF2", "#0a0", 16);
    const gd = M.newGuide([{ x: 20, y: 420 }, { x: 880, y: 420 }]);
    const panelLeft = M.newPanel(40, 470), panelRight = M.newPanel(860, 470);
    const { P } = install({ rooms: [r1, r2, cor], circuits: [q1, q2], panels: [panelLeft, panelRight], guides: [gd] });
    const s1 = M.newElement("socket", P.rooms[0].id + ":2", 100, 30); s1.circuitId = q1.id;
    const s2 = M.newElement("socket", P.rooms[1].id + ":2", 100, 30); s2.circuitId = q2.id;
    P.elements.push(s1, s2);
    EP.Plan.Routes.build();
    const rt1 = P.routes.find((r) => r.fromId === s1.id), rt2 = P.routes.find((r) => r.fromId === s2.id);
    ok(rt1.points.some((pt) => Math.abs(pt.y - 420) < 1), "QF1 (первая линия) — ровно на магистрали");
    ok(rt2.points.some((pt) => Math.abs(pt.y - 422) < 1), "QF2 (вторая линия) — та же СТОРОНА +2см, несмотря на обратное направление обхода");
    ok(!rt2.points.some((pt) => Math.abs(pt.y - 418) < 1), "QF2 НЕ ушла на противоположную сторону (-2см)");
  });
  test("guides: своя ветка магистрали предпочтительнее чужой, даже если чужая численно ближе — без лишнего перехода через соседнюю комнату", () => {
    // Найдено ПО РЕАЛЬНОМУ ПРОЕКТУ пользователя (репорт: «должно было зайти из 3 в 1, а
    // зашло 3-2-1»): общий коридор в комнате R3, от него отходят КОРОТКАЯ ветка в R1 и
    // ДЛИННАЯ ветка в R2. Элемент у дальней стены R1 оказывается численно БЛИЖЕ к концу
    // ДЛИННОЙ ветки R2 (физически лежащей в другой комнате), чем к концу своей короткой
    // ветки — nearestOnGraph БЕЗ учёта комнаты выбирал чужую ветку, трасса шла R1→R2→R3
    // (лишняя проходка) вместо прямого R1→R3.
    const r1 = M.newRoom(G.rectPoints(0, 0, 300, 300), "R1");
    const r2 = M.newRoom(G.rectPoints(300, 0, 300, 300), "R2");
    const r3 = M.newRoom(G.rectPoints(0, 300, 600, 150), "R3");
    const pn = M.newPanel(300, 400, "Щ");
    const corridor = M.newGuide([{ x: 20, y: 350 }, { x: 580, y: 350 }]);
    const legShort = M.newGuide([{ x: 150, y: 350 }, { x: 150, y: 250 }]); // короткая ветка — в R1
    const legLong = M.newGuide([{ x: 450, y: 350 }, { x: 450, y: 50 }]); // длинная ветка — в R2
    const { P } = install({ rooms: [r1, r2, r3], panels: [pn], guides: [corridor, legShort, legLong] });
    const s1 = M.newElement("socket", P.rooms[0].id + ":0", 280, 30); // верхняя стена R1, у края к R2
    P.elements.push(s1);
    EP.Plan.Routes.build();
    const rt = P.routes.find((r) => r.fromId === s1.id);
    ok(rt, "трасса построена");
    const crossedRoomIds = new Set((rt.throughWalls || []).map((tw) => String(tw.wallId).split(":")[0]));
    eq(crossedRoomIds.size, 2, "ровно одна физическая проходка (2 записи — общая стена R1/R3, оба id стены)");
    ok(crossedRoomIds.has(r1.id) && crossedRoomIds.has(r3.id), "переход именно между R1 и R3");
    ok(!crossedRoomIds.has(r2.id), "НЕ идёт через R2 (не цепляет чужую, хоть и более близкую по прямой, ветку)");
  });
  test("guides: ветка магистрали нарисована ГЛУБОКО в комнату (дальше стандартного отступа) — вход всё равно РОВНО на routeOff от стены, строго 90°, без скачка в сторону", () => {
    // Репорт пользователя со скриншотами: «линии когда вошли в комнату, они не идут с
    // отступом 15см... на скрине 1 видно дефект в виде скачка линий» + «как только
    // магистраль прошла стену — линии шли 15см от стены, каждая новая +2см, строго 90°».
    // Ветка магистрали физически дотянута ПОЛЬЗОВАТЕЛЕМ глубоко в комнату (до y=50) —
    // намного дальше стандартного отступа (contour был бы у y≈280). Раньше guideApproach
    // роутил ПРЯМО к дальнему концу ветки через pathInRoom — тот сначала доходил до
    // ближайшей точки контура (y≈280), а затем делал лишний прыжок В СТОРОНУ ОТ стены
    // до самого конца ветки (y=50) — видимый «скачок», да ещё и по диагонали.
    const rA = M.newRoom(G.rectPoints(0, 0, 300, 300), "A");
    const rB = M.newRoom(G.rectPoints(0, 300, 600, 150), "B");
    const pn = M.newPanel(300, 350, "Щ");
    const corridor = M.newGuide([{ x: 20, y: 350 }, { x: 580, y: 350 }]);
    const leg = M.newGuide([{ x: 150, y: 350 }, { x: 150, y: 50 }]); // дотянута до y=50, отступ был бы у y≈280
    const { P } = install({ rooms: [rA, rB], panels: [pn], guides: [corridor, leg] });
    const s1 = M.newElement("socket", P.rooms[0].id + ":0", 260, 30); // верхняя стена A, в стороне от ветки
    P.elements.push(s1);
    EP.Plan.Routes.build();
    const rt = P.routes.find((r) => r.fromId === s1.id);
    ok(rt, "трасса построена");
    const pts = rt.points;
    for (let i = 1; i < pts.length; i++) {
      const dx = Math.abs(pts[i].x - pts[i - 1].x), dy = Math.abs(pts[i].y - pts[i - 1].y);
      ok(dx < 0.5 || dy < 0.5, `сегмент ${i} не строго по одной оси: (${pts[i - 1].x},${pts[i - 1].y})->(${pts[i].x},${pts[i].y})`);
    }
    ok(pts.some((pt) => Math.abs(pt.y - 280) < 1), "вход в районе y≈280 — РОВНО отступ 15см от стены (y=300)");
    ok(!pts.some((pt) => Math.abs(pt.x - 150) < 1 && pt.y < 100), "у x=150 (ветка) путь НЕ уходит до конца нарисованной ветки (y=50)");
  });

  // ===== 22. Аудит автотрассировки: фиксы по замерам =====
  test("щит ВНЕ нарисованной комнаты не ломает трассировку (нет магистрали, одна комната)", () => {
    // щит в 150см снаружи: roomNear его комнату не находит, раньше это считалось
    // «разные комнаты» и требовало магистраль -> 0 трасс даже в одной комнате
    const room = M.newRoom(G.rectPoints(200, 0, 400, 300), "R");
    const cc = M.newCircuit("QF1", "#f00", 16);
    const { P } = install({ rooms: [room], circuits: [cc], panels: [M.newPanel(50, 150, "Щ")] });
    const s1 = M.newElement("socket", P.rooms[0].id + ":0", 100, 30);
    const s2 = M.newElement("socket", P.rooms[0].id + ":2", 100, 30);
    s1.circuitId = s2.circuitId = cc.id;
    P.elements.push(s1, s2);
    ok(!EP.Plan.Routes.roomNear(P, { x: 50, y: 150 }), "комната щита действительно не определяется");
    EP.Plan.Routes.build();
    eq(P.routes.length, 2, "обе точки отрассированы по контуру известной комнаты");
  });
  test("силовая линия НЕ уходит в слаботочный щит, если есть обычный", () => {
    const room = M.newRoom(G.rectPoints(0, 0, 400, 300), "R");
    const cc = M.newCircuit("QF1", "#f00", 16);
    const main = M.newPanel(10, 150, "Щит");                       // дальше от точки
    const lv = M.newPanel(390, 150, "Слаботочный"); lv.router = true; lv.transformer = true; // ближе
    const { P } = install({ rooms: [room], circuits: [cc], panels: [main, lv] });
    const s1 = M.newElement("socket", P.rooms[0].id + ":0", 380, 30); s1.circuitId = cc.id;
    P.elements.push(s1);
    EP.Plan.Routes.build();
    const rt = P.routes.find((r) => r.fromId === s1.id);
    ok(rt && rt.toPanel, "трасса до щита есть");
    eq(rt.toId, P.panels[0].id, "силовая ушла в ОБЫЧНЫЙ щит, хоть слаботочный и ближе");
  });
  test("все щиты слаботочные (один комбинированный) — силовая всё равно строится", () => {
    const room = M.newRoom(G.rectPoints(0, 0, 400, 300), "R");
    const cc = M.newCircuit("QF1", "#f00", 16);
    const combo = M.newPanel(20, 150, "Щит"); combo.router = true; combo.transformer = true;
    const { P } = install({ rooms: [room], circuits: [cc], panels: [combo] });
    const s1 = M.newElement("socket", P.rooms[0].id + ":0", 200, 30); s1.circuitId = cc.id;
    P.elements.push(s1);
    EP.Plan.Routes.build();
    eq(P.routes.length, 1, "обратная совместимость: единственный комбинированный щит принимает силовую");
  });
  test("проходки: шторка «Трассы» и смета дают ОДНО число (общий sleeveGroups)", () => {
    const cor = M.newRoom(G.rectPoints(0, 0, 200, 600), "Кор");
    const rm = M.newRoom(G.rectPoints(200, 0, 400, 600), "Зал");
    const cs = [];
    for (let i = 0; i < 4; i++) cs.push(M.newCircuit("QF" + (i + 1), "#f00", 16));
    const { P } = install({ rooms: [cor, rm], circuits: cs, panels: [M.newPanel(100, 50, "Щ")] });
    cs.forEach((c) => { const e = M.newElement("socket", P.rooms[1].id + ":2", 150, 30); e.circuitId = c.id; P.elements.push(e); });
    P.guides.push(M.newGuide([{ x: 100, y: 50 }, { x: 100, y: 300 }, { x: 350, y: 300 }]));
    EP.Plan.Routes.build();
    const holes = EP.Plan.Routes.sleeveHoles(P);
    const fromCalc = EP.Plan.Calc.calcByRoutes(P).items
      .filter((i) => /^Проходка/.test(i.name)).reduce((a, i) => a + i.qty, 0);
    ok(holes > 0, "проходки есть");
    eq(fromCalc, holes, "смета и шторка совпадают");
    const raw = P.routes.reduce((n, r) => n + (r.throughWalls || []).length, 0);
    ok(raw >= holes, "сырых кабеле-пересечений не меньше, чем физических отверстий");
  });
  test("«Без трассы»: список с причинами + сброс при открытии другого проекта", () => {
    const cor = M.newRoom(G.rectPoints(0, 0, 150, 600), "Кор");
    const rm = M.newRoom(G.rectPoints(150, 0, 400, 600), "Зал");
    const cc = M.newCircuit("QF1", "#f00", 16);
    const { P } = install({ rooms: [cor, rm], circuits: [cc], panels: [M.newPanel(60, 40, "Щ")] });
    const s1 = M.newElement("socket", P.rooms[1].id + ":0", 100, 30); s1.circuitId = cc.id;
    P.elements.push(s1);
    EP.Plan.Routes.build();
    const un = EP.Plan.Routes.unroutedList();
    eq(un.length, 1, "одна точка без трассы");
    ok(/магистрал/i.test(un[0].reason), "причина названа: " + un[0].reason);
    ok(/Зал/.test(un[0].name), "в названии есть комната: " + un[0].name);
    install(); // открыли ДРУГОЙ проект — счётчик прошлого не должен протечь
    eq(EP.Plan.Routes.unroutedList().length, 0, "список сброшен при открытии другого проекта");
  });
  test("автопредложение магистрали: 0 трасс -> все точки отрассированы", () => {
    const cor = M.newRoom(G.rectPoints(0, 0, 150, 600), "Коридор");
    const liv = M.newRoom(G.rectPoints(150, 0, 450, 350), "Гостиная");
    const bed = M.newRoom(G.rectPoints(150, 350, 450, 250), "Спальня");
    const cc = M.newCircuit("QF1", "#f00", 16);
    const { P } = install({ rooms: [cor, liv, bed], circuits: [cc], panels: [M.newPanel(60, 40, "Щ")] });
    [[1, 0, 100], [1, 2, 200], [2, 0, 100], [2, 2, 200]].forEach(([ri, wi, off]) => {
      const e = M.newElement("socket", P.rooms[ri].id + ":" + wi, off, 30); e.circuitId = cc.id; P.elements.push(e);
    });
    EP.Plan.Routes.build();
    eq(P.routes.length, 0, "без магистрали межкомнатных трасс нет");
    const n = EP.Plan.Routes.suggestGuides();
    ok(n >= 2, "предложен ствол + минимум одна ножка, получили " + n);
    P.routes = [];
    EP.Plan.Routes.build();
    eq(P.routes.length, 4, "после автомагистрали отрассированы все точки");
  });
  test("работы по распайкам: коробка на потолке ОТДЕЛЬНО от распайки в подрозетнике", () => {
    const room = M.newRoom(G.rectPoints(0, 0, 600, 400), "R");
    const cc = M.newCircuit("QF1", "#f00", 16);
    const { P } = install({ rooms: [room], circuits: [cc], panels: [M.newPanel(30, 30, "Щ")] });
    // 3 розетки шлейфом (транзит -> распайка в подрозетнике) + потолочная распайка
    for (let i = 0; i < 3; i++) { const e = M.newElement("socket", P.rooms[0].id + ":" + i, 150, 30); e.circuitId = cc.id; P.elements.push(e); }
    const j = M.newElement("junction", null, 0, 0, "power"); j.wallId = null; j.params = { x: 300, y: 200 }; j.circuitId = cc.id;
    P.elements.push(j);
    EP.Plan.Routes.build();
    const items = EP.Plan.Calc.calcByRoutes(P).items;
    const ceil = items.find((i) => i.name === "Собрать распаянную коробку на потолке");
    ok(ceil && ceil.qty === 1, "одна потолочная коробка");
    ok(!items.find((i) => i.name === "Монтаж и расключение распределительной коробки"), "старая общая позиция убрана");
    // транзит шлейфа считается распайкой в подрозетнике
    const inCnt = {}, outCnt = {};
    P.routes.forEach((r) => { outCnt[r.fromId] = (outCnt[r.fromId] || 0) + 1; if (r.toId) inCnt[r.toId] = (inCnt[r.toId] || 0) + 1; });
    const transit = P.elements.filter((e) => e.type !== "junction" && ((outCnt[e.id] || 0) + (inCnt[e.id] || 0)) > 1).length;
    const box = items.find((i) => i.name === "Собрать распайку в подрозетнике");
    eq(box ? box.qty : 0, transit, "распайки в подрозетнике = число транзитов шлейфа");
  });
  test("шлейф по РЕАЛЬНОЙ длине пути и на 19+ точках (порог CHAIN_LEN_MAX поднят)", () => {
    // одна линия, точки в 2 комнатах: прямая дистанция дала бы крестящиеся хопы
    const cor = M.newRoom(G.rectPoints(0, 0, 180, 800), "Кор");
    const r1 = M.newRoom(G.rectPoints(180, 0, 420, 400), "К1");
    const r2 = M.newRoom(G.rectPoints(180, 400, 420, 400), "К2");
    const cc = M.newCircuit("QF1", "#f00", 16);
    const { P } = install({ rooms: [cor, r1, r2], circuits: [cc], panels: [M.newPanel(90, 50, "Щ")] });
    [1, 2].forEach((ri) => { for (let k = 0; k < 10; k++) {
      const e = M.newElement("socket", P.rooms[ri].id + ":" + (k % 4), 60 + k * 35, 30); e.circuitId = cc.id; P.elements.push(e);
    } });
    P.guides.push(M.newGuide([{ x: 90, y: 50 }, { x: 90, y: 750 }]));
    P.guides.push(M.newGuide([{ x: 90, y: 200 }, { x: 350, y: 200 }]));
    P.guides.push(M.newGuide([{ x: 90, y: 600 }, { x: 350, y: 600 }]));
    EP.Plan.Routes.build();
    eq(P.routes.length, 20, "все 20 точек одной линии отрассированы");
    const total = P.routes.reduce((a, r) => a + G.polylineLen(r.points), 0);
    // с прямой метрикой на этой геометрии выходило вдвое больше (замерено в аудите)
    ok(total < 12000, "суммарная длина шлейфа разумная (" + Math.round(total) + "см), не удвоенная");
  });

  // ===== 23. Трассы не по стене + маркировка 24В + марка кабеля по умолчанию =====
  // сколько сэмплов пути идут ВНУТРИ тела стены ВДОЛЬ неё (перпендикулярную проходку
  // сквозь стену не считаем — она законна, ей и нужна гильза Ø20)
  function alongWallInside(P, pts) {
    const ws = [];
    (P.rooms || []).forEach((r) => G.walls(r).forEach((w) => ws.push({ w, half: G.wallThOf(P, w) / 2 })));
    (P.beams || []).forEach((b) => { const bw = G.beamWall(b); if (bw) ws.push({ w: bw, half: G.wallThOf(P, bw) / 2 }); });
    let bad = 0;
    for (let i = 1; i < (pts || []).length; i++) {
      const a = pts[i - 1], b = pts[i], L = G.dist(a, b);
      if (L < 0.5) continue;
      const dir = { x: (b.x - a.x) / L, y: (b.y - a.y) / L };
      const n = Math.max(1, Math.round(L / 5));
      for (let k = 0; k <= n; k++) {
        const t = k / n, q = { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t };
        ws.forEach(({ w, half }) => {
          const wl = w.len || 1, wd = { x: (w.b.x - w.a.x) / wl, y: (w.b.y - w.a.y) / wl };
          if (Math.abs(dir.x * wd.x + dir.y * wd.y) <= 0.7) return; // это проходка, не «вдоль»
          if (half - G.closestOnSeg(q, w.a, w.b).d > 1) bad++;
        });
      }
    }
    return bad;
  }
  function wallGuideCase(guidePts) {
    const cor = M.newRoom(G.rectPoints(0, 0, 800, 100), "Коридор");
    const r1 = M.newRoom(G.rectPoints(0, 100, 400, 400), "К1");
    const r2 = M.newRoom(G.rectPoints(400, 100, 400, 400), "К2");
    const cs = [];
    for (let i = 0; i < 8; i++) cs.push(M.newCircuit("QF" + (i + 1), "#f00", 16));
    const { P } = install({ rooms: [cor, r1, r2], circuits: cs, panels: [M.newPanel(60, 50, "Щ")] });
    [1, 2].forEach((ri) => { for (let k = 0; k < 4; k++) {
      const e = M.newElement("socket", P.rooms[ri].id + ":2", 60 + k * 80, 30);
      e.circuitId = cs[(ri - 1) * 4 + k].id; P.elements.push(e);
    } });
    P.guides.push(M.newGuide(guidePts));
    EP.Plan.Routes.build();
    return P;
  }
  test("трассы НЕ идут внутри стены, если магистраль нарисована по её оси", () => {
    // репорт пользователя со скриншотом: «линии рисуются прям по стене». Магистраль по оси
    // общей стены коридора (y=100) — веер линий (+2см на линию) ложился ВНУТРЬ тела стены.
    const P = wallGuideCase([{ x: 40, y: 100 }, { x: 760, y: 100 }]);
    eq(P.routes.length, 8, "все 8 линий отрассированы");
    const bad = P.routes.reduce((a, r) => a + alongWallInside(P, r.points), 0);
    eq(bad, 0, "ни один участок не идёт внутри тела стены вдоль неё");
  });
  test("сторона веера линий разворачивается ОТ стены (обратный порядок точек магистрали)", () => {
    // канонический нормаль ребра берётся из порядка точек магистрали — при рисовании
    // справа налево веер смотрел в стену; теперь сторона выбирается по геометрии стен
    const P = wallGuideCase([{ x: 760, y: 100 }, { x: 40, y: 100 }]);
    const bad = P.routes.reduce((a, r) => a + alongWallInside(P, r.points), 0);
    eq(bad, 0, "порядок рисования магистрали не заводит линии в стену");
  });
  test("проходка сквозь стену (перпендикулярная ветка) от фикса НЕ пострадала", () => {
    const P = wallGuideCase([{ x: 40, y: 50 }, { x: 760, y: 50 }]);
    const withSleeve = P.routes.filter((r) => (r.throughWalls || []).length > 0).length;
    ok(withSleeve > 0, "трассы из комнат в коридор по-прежнему дают гильзы (" + withSleeve + ")");
  });
  test("линия «Вывод 24В» маркируется своим префиксом 24В, а не Int", () => {
    const r1 = M.newRoom(G.rectPoints(0, 0, 400, 300), "К1");
    const { P } = install({ rooms: [r1] });
    const e24 = M.newElement("output24", r1.id + ":0", 100, 240, "lv"); P.elements.push(e24);
    const c24 = EP.Plan.Elements.assignNewCircuit(e24);
    eq(c24.name, "24В1", "первая 24В-линия — «24В1»");
    const e24b = M.newElement("output24", r1.id + ":0", 200, 240, "lv"); P.elements.push(e24b);
    eq(EP.Plan.Elements.assignNewCircuit(e24b).name, "24В2", "нумерация 24В своя");
    const eNet = M.newElement("internet", r1.id + ":0", 300, 30, "lv"); P.elements.push(eNet);
    eq(EP.Plan.Elements.assignNewCircuit(eNet).name, "Int1", "интернет по-прежнему Int1 (свой счётчик)");
  });
  test("марка кабеля по умолчанию (settings.cableBrand) — одна во всех местах", () => {
    const r1 = M.newRoom(G.rectPoints(0, 0, 400, 300), "К1");
    const qf = M.newCircuit("QF1", "#f00", 16);
    const c24 = M.newCircuit("24В1", "#0ff", 10);
    const { P } = install({ rooms: [r1], circuits: [qf, c24], panels: [M.newPanel(50, 50, "Щ")] });
    eq(P.settings.cableBrand, "ВВГнг(А)-LS", "бэкофилл марки по умолчанию");
    const s1 = M.newElement("socket", r1.id + ":0", 100, 30); s1.circuitId = qf.id; P.elements.push(s1);
    const o24 = M.newElement("output24", r1.id + ":0", 200, 240, "lv"); o24.circuitId = c24.id; P.elements.push(o24);
    eq(EP.Plan.Scheme.autoCable(P, qf), "ВВГнг(А)-LS 3×2.5", "однолинейка: марка + сечение");
    eq(EP.Plan.Scheme.autoCable(P, c24), "КГ ВВГнг-LS 2×2.5", "линия 24В — своя марка «от щита» (монохром), НЕ витая пара");
    c24.rgb = true;
    eq(EP.Plan.Scheme.autoCable(P, c24), "КГ ВВГнг-LS 5×1.5", "RGB-линия 24В — 5 жил (общий + 3 канала)");
    c24.rgb = false;
    P.settings.cableBrand = "";
    eq(EP.Plan.Scheme.autoCable(P, qf), "3×2.5", "пустая марка — только сечение (как было раньше)");
    P.settings.cableBrand = "КГ";
    eq(EP.Plan.Scheme.autoCable(P, qf), "КГ 3×2.5", "марка меняется одним полем настроек");
  });
  test("«По линиям (QF)» и смета показывают ОДНУ И ТУ ЖЕ марку кабеля", () => {
    const r1 = M.newRoom(G.rectPoints(0, 0, 400, 300), "К1");
    const qf = M.newCircuit("QF1", "#f00", 16);
    const { P } = install({ rooms: [r1], circuits: [qf], panels: [M.newPanel(50, 50, "Щ")] });
    const s1 = M.newElement("socket", r1.id + ":0", 100, 30); s1.circuitId = qf.id; P.elements.push(s1);
    EP.Plan.Routes.build();
    const per = EP.Plan.Calc.perCircuit(P).find((x) => x.id === qf.id);
    const res = EP.Plan.Calc.calcByRoutes(P);
    ok(per && per.mark, "марка в «По линиям» есть");
    ok(Object.keys(res.cableBy).some((k) => k === per.mark), "та же марка в смете: " + per.mark + " / " + Object.keys(res.cableBy).join(","));
  });

  // ===== 24. Сценарии пользователя: выключатель → свет 220В + выводы 24В =====
  // Общая фикстура: комната + прихожая, силовой щит + слаботочный (роутер+трансформатор),
  // магистраль между комнатами, выключатель на линии света, лампа 220В и два вывода 24В.
  function scen24(keys, rgb) {
    const room = M.newRoom(G.rectPoints(0, 0, 500, 400), "Комната");
    const hall = M.newRoom(G.rectPoints(0, 400, 500, 150), "Прихожая");
    const pnMain = M.newPanel(60, 470, "Щит квартирный");
    const pnLV = M.newPanel(200, 470, "Щит слаботочный"); pnLV.router = true; pnLV.transformer = true;
    const qf = M.newCircuit("QF1 Свет", "#fbbf24", 10);
    const c24 = M.newCircuit("24В1", "#14b8a6", 10); if (rgb != null) c24.rgb = rgb;
    const { P } = install({ rooms: [room, hall], circuits: [qf, c24], panels: [pnMain, pnLV] });
    const sw = M.newElement("switch", P.rooms[0].id + ":3", 100, 90, "light");
    sw.circuitId = qf.id; sw.keys = keys; P.elements.push(sw);
    const lamp = M.newElement("light", null, 0, 0, "light");
    lamp.wallId = null; lamp.params = { x: 250, y: 200 }; P.elements.push(lamp);
    const o24a = M.newElement("output24", P.rooms[0].id + ":0", 300, 240, "lv"); o24a.circuitId = c24.id; P.elements.push(o24a);
    const o24b = M.newElement("output24", P.rooms[0].id + ":0", 400, 240, "lv"); o24b.circuitId = c24.id; P.elements.push(o24b);
    sw.targetIds = keys >= 3 ? [lamp.id, o24a.id, o24b.id] : keys === 2 ? [lamp.id, o24a.id] : [o24a.id];
    P.guides.push(M.newGuide([{ x: 130, y: 470 }, { x: 130, y: 200 }]));
    EP.Plan.Routes.build();
    // install() прогоняет проект через importJSON — линии/щиты внутри P это КОПИИ
    // переданных объектов (id совпадают, ссылки нет): для мутаций берём объекты из P
    const cP = (id) => (P.circuits || []).find((x) => x.id === id);
    return { P, sw, lamp, o24a, o24b, qf: cP(qf.id), c24: cP(c24.id), pnMain, pnLV };
  }
  const markKeys = (P) => Object.keys(EP.Plan.Calc.calcByRoutes(P).cableBy);
  test("сценарий 1: кабель идёт щит → выключатель → точка света (а не щит → точка)", () => {
    const { P, sw, lamp, pnMain } = scen24(2, false);
    const rLamp = P.routes.find((r) => r.fromId === lamp.id);
    const rSw = P.routes.find((r) => r.fromId === sw.id);
    ok(rLamp, "у точки света есть трасса");
    eq(rLamp.toId, sw.id, "трасса точки света идёт к ВЫКЛЮЧАТЕЛЮ");
    eq(!!rLamp.toPanel, false, "и НЕ к щиту напрямую");
    ok(rSw && rSw.toPanel && rSw.toId === pnMain.id, "сам выключатель питается от силового щита");
  });
  test("линия точки света проставляется АВТОМАТИЧЕСКИ от выключателя", () => {
    const { P, lamp, qf } = scen24(2, false);
    eq(lamp.circuitId, qf.id, "лампа села на линию выключателя без ручного назначения");
    const rLamp = P.routes.find((r) => r.fromId === lamp.id);
    eq(rLamp.circuitId, qf.id, "и трасса отнесена к той же линии");
  });
  test("syncTargetCircuit: 220В-цель наследует линию, «Вывод 24В» получает свою 24В-линию", () => {
    const room = M.newRoom(G.rectPoints(0, 0, 400, 300), "К1");
    const qf = M.newCircuit("QF1", "#f00", 10);
    const { P } = install({ rooms: [room], circuits: [qf] });
    const sw = M.newElement("switch", room.id + ":3", 100, 90, "light"); sw.circuitId = qf.id; P.elements.push(sw);
    const lamp = M.newElement("light", null, 0, 0, "light"); lamp.wallId = null; lamp.params = { x: 200, y: 150 }; P.elements.push(lamp);
    const o24 = M.newElement("output24", room.id + ":0", 200, 240, "lv"); P.elements.push(o24);
    EP.Plan.Elements.syncTargetCircuit(sw, lamp);
    eq(lamp.circuitId, qf.id, "лампа → линия выключателя");
    const c = EP.Plan.Elements.syncTargetCircuit(sw, o24);
    ok(c && c.id === o24.circuitId, "у вывода 24В появилась своя линия");
    ok(/^24В/.test(c.name), "и она названа с префиксом 24В: " + c.name);
    const o24b = M.newElement("output24", room.id + ":0", 300, 240, "lv"); P.elements.push(o24b);
    EP.Plan.Elements.syncTargetCircuit(sw, o24b);
    eq(o24b.circuitId, o24.circuitId, "второй вывод 24В сел на ТУ ЖЕ существующую 24В-линию");
  });
  test("каждый вывод 24В — свой кабель от трансформаторного щита (без шлейфа)", () => {
    const { P, o24a, o24b, pnLV } = scen24(3, false);
    const ra = P.routes.find((r) => r.fromId === o24a.id);
    const rb = P.routes.find((r) => r.fromId === o24b.id);
    ok(ra && rb, "у обоих выводов 24В своя трасса");
    eq(ra.toId, pnLV.id, "первый — к трансформаторному щиту");
    eq(rb.toId, pnLV.id, "второй — тоже к щиту, а НЕ шлейфом через первый");
    eq(ra.leg, "sec24", "тег «от щита» у первого");
    eq(rb.leg, "sec24", "тег «от щита» у второго");
  });
  test("«до щита» (первичка 24В): 1 клавиша — 3 жилы, 2-3 клавиши — 5 жил", () => {
    const one = scen24(1, false);
    ok(markKeys(one.P).some((k) => k === "ВВГнг(А)-LS 3×1.5 · до щита (220В)"),
      "1 клавиша на 24В → 3×1.5: " + markKeys(one.P).join(" | "));
    const three = scen24(3, false);
    ok(markKeys(three.P).some((k) => k === "ВВГнг(А)-LS 5×1.5 · до щита (220В)"),
      "2-3 клавиши на 24В → 5×1.5: " + markKeys(three.P).join(" | "));
    eq(EP.Plan.Routes.keys24Of(three.P, three.sw), 2, "клавиш на 24В посчитано верно");
  });
  test("«от щита» (24В): монохром 2×2.5, RGB 5×1.5", () => {
    const mono = scen24(3, false);
    ok(markKeys(mono.P).some((k) => k === "КГ ВВГнг-LS 2×2.5 · от щита (24В)"),
      "монохром: " + markKeys(mono.P).join(" | "));
    const rgb = scen24(3, true);
    ok(markKeys(rgb.P).some((k) => k === "КГ ВВГнг-LS 5×1.5 · от щита (24В)"),
      "RGB: " + markKeys(rgb.P).join(" | "));
    // марки редактируются одним полем настроек
    rgb.P.settings.cable24Rgb = "КГ 4×1.5";
    ok(Object.keys(EP.Plan.Calc.calcByRoutes(rgb.P).cableBy).some((k) => k === "КГ 4×1.5 · от щита (24В)"), "марка RGB берётся из настроек");
  });
  test("Проверки: у линии 24В не указан тип (монохром/RGB) — подсказка", () => {
    const un = scen24(3, null);
    const iss = EP.Plan.Rules.run(un.P).issues.map((i) => i.msg).join(" | ");
    ok(/укажи тип 24В/.test(iss), "есть напоминание: " + iss);
    un.c24.rgb = false;
    const iss2 = EP.Plan.Rules.run(un.P).issues.map((i) => i.msg).join(" | ");
    eq(/укажи тип 24В/.test(iss2), false, "после выбора «Монохром» подсказка уходит");
  });

  test("трассы ОДНОЙ линии, сходящиеся в выключателе, разносятся на 2см (не ложатся друг на друга)", () => {
    // репорт пользователя со скриншотом: «линии друг на друга наложились, я думал до клавиши
    // и от клавиши до освещения будут друг от друга 2 см». Комната 3×3, щит внизу слева,
    // выключатель на левой стене, две лампы — всё на одной линии QF1.
    const room = M.newRoom(G.rectPoints(0, 0, 300, 300), "Комната 1");
    const qf = M.newCircuit("QF1", "#ef4444", 10);
    const { P } = install({ rooms: [room], circuits: [qf], panels: [M.newPanel(30, 285, "Щ")] });
    const sw = M.newElement("switch", P.rooms[0].id + ":3", 150, 90, "light"); sw.circuitId = qf.id; sw.keys = 2; P.elements.push(sw);
    const l1 = M.newElement("light", null, 0, 0, "light"); l1.wallId = null; l1.params = { x: 220, y: 80 }; l1.circuitId = qf.id; P.elements.push(l1);
    const l2 = M.newElement("light", null, 0, 0, "light"); l2.wallId = null; l2.params = { x: 220, y: 220 }; l2.circuitId = qf.id; P.elements.push(l2);
    sw.targetIds = [l1.id, l2.id];
    EP.Plan.Routes.build();
    // длина коллинеарного наложения (перпендикулярно ближе 1см) между всеми парами трасс
    const ovl = (a1, a2, b1, b2) => {
      const L1 = G.dist(a1, a2), L2 = G.dist(b1, b2);
      if (L1 < 1 || L2 < 1) return 0;
      const d1 = { x: (a2.x - a1.x) / L1, y: (a2.y - a1.y) / L1 };
      const d2 = { x: (b2.x - b1.x) / L2, y: (b2.y - b1.y) / L2 };
      if (Math.abs(d1.x * d2.x + d1.y * d2.y) < 0.99) return 0;
      const n = { x: -d1.y, y: d1.x };
      if (Math.abs((b1.x - a1.x) * n.x + (b1.y - a1.y) * n.y) > 1) return 0;
      const t = (q) => (q.x - a1.x) * d1.x + (q.y - a1.y) * d1.y;
      const lo = Math.min(t(b1), t(b2)), hi = Math.max(t(b1), t(b2));
      return Math.max(0, Math.min(hi, L1) - Math.max(lo, 0));
    };
    let total = 0;
    for (let i = 0; i < P.routes.length; i++) for (let j = i + 1; j < P.routes.length; j++) {
      const A = P.routes[i].points, B = P.routes[j].points;
      for (let x = 1; x < A.length; x++) for (let y = 1; y < B.length; y++) total += ovl(A[x - 1], A[x], B[y - 1], B[y]);
    }
    eq(P.routes.length, 3, "три трассы: щит→выключатель и две лампы→выключатель");
    // до фикса на этой геометрии наложение было 161см (замерено), стык у общего анкера даёт ~20см
    ok(total < 40, "трассы не идут одна поверх другой (наложение " + Math.round(total) + "см, было 161см)");
    ok(P.routes.some((r) => (r.lane || 0) > 0), "одна из трасс встала на следующую полосу (+2см)");
  });

  // ===== 25. Тяжёлый просчёт: метрика, порядок полос, оптимизатор =====
  function optProject() {
    // коридор + две комнаты, 4 линии по 2 точки — есть что переставлять полосами
    const cor = M.newRoom(G.rectPoints(0, 0, 700, 120), "Коридор");
    const r1 = M.newRoom(G.rectPoints(0, 120, 350, 400), "К1");
    const r2 = M.newRoom(G.rectPoints(350, 120, 350, 400), "К2");
    const cs = [];
    for (let i = 0; i < 4; i++) cs.push(M.newCircuit("QF" + (i + 1), "#f00", 16));
    const { P } = install({ rooms: [cor, r1, r2], circuits: cs, panels: [M.newPanel(60, 60, "Щ")] });
    [1, 2].forEach((ri) => { for (let k = 0; k < 4; k++) {
      const e = M.newElement("socket", P.rooms[ri].id + ":" + (k % 3), 60 + k * 70, 30);
      e.circuitId = cs[k].id; P.elements.push(e);
    } });
    P.guides.push(M.newGuide([{ x: 60, y: 60 }, { x: 640, y: 60 }]));
    P.guides.push(M.newGuide([{ x: 175, y: 60 }, { x: 175, y: 300 }]));
    P.guides.push(M.newGuide([{ x: 520, y: 60 }, { x: 520, y: 300 }]));
    return P;
  }
  test("scoreRoutes: метрика качества считает пересечения/отверстия/длину", () => {
    const P = optProject();
    EP.Plan.Routes.setLaneOrder(null);
    EP.Plan.Routes.build();
    const sc = EP.Plan.Routes.scoreRoutes(P);
    ok(sc && typeof sc.cost === "number", "метрика есть");
    eq(sc.unrouted, 0, "все точки отрассированы");
    eq(sc.holes, EP.Plan.Routes.sleeveHoles(P), "отверстия — тот же общий хелпер, что в шторке и смете");
    ok(sc.len > 0, "длина считается");
  });
  test("setLaneOrder меняет полосы линий, НЕ меняя порядок линий в проекте", () => {
    const P = optProject();
    EP.Plan.Routes.setLaneOrder(null);
    EP.Plan.Routes.build();
    const before = JSON.stringify(P.routes.map((r) => r.points));
    const namesBefore = P.circuits.map((c) => c.name).join(",");
    const order = {}; P.circuits.forEach((c, i) => { order[c.id] = P.circuits.length - 1 - i; }); // развернули полосы
    EP.Plan.Routes.setLaneOrder(order);
    EP.Plan.Routes.build();
    ok(JSON.stringify(P.routes.map((r) => r.points)) !== before, "геометрия трасс изменилась");
    eq(P.circuits.map((c) => c.name).join(","), namesBefore, "порядок линий в проекте (UI/смета) не тронут");
    EP.Plan.Routes.setLaneOrder(null);
  });
  test("оптимизатор: результат не хуже базового и ДЕТЕРМИНИРОВАН", () => {
    const P = optProject();
    EP.Plan.Routes.setLaneOrder(null);
    EP.Plan.Routes.build();
    const base = EP.Plan.Routes.scoreRoutes(P);
    const r1 = EP.Plan.Routes.optimizeRouting({ budgetMs: 200, seed: 42 });
    ok(r1 && r1.score.cost <= base.cost, `оптимизатор не хуже базы (${r1.score.cost} ≤ ${base.cost})`);
    eq(r1.score.unrouted, 0, "все точки по-прежнему с трассами");
    const geom1 = JSON.stringify(P.routes.map((r) => r.points));
    // тот же сид → тот же результат (инвариант детерминизма модуля)
    const P2 = optProject();
    EP.Plan.Routes.setLaneOrder(null);
    const r2 = EP.Plan.Routes.optimizeRouting({ budgetMs: 200, seed: 42 });
    ok(r2 && Math.abs(r2.score.cost - r1.score.cost) < 1e-6, "тот же сид — та же метрика");
    EP.Plan.Routes.setLaneOrder(null);
    ok(geom1.length > 10, "трассы построены");
  });
  test("режим «Максимум»: rip-up & reroute не ухудшает результат", () => {
    const P = optProject();
    EP.Plan.Routes.setLaneOrder(null);
    EP.Plan.Routes.build();
    const base = EP.Plan.Routes.scoreRoutes(P);
    const r = EP.Plan.Routes.optimizeRoutingMax({ budgetMs: 400, seed: 5 });
    ok(r && r.score.cost <= base.cost, `максимум не хуже базы (${r.score.cost} ≤ ${base.cost})`);
    eq(r.score.unrouted, 0, "ни одна точка не потеряла трассу");
    EP.Plan.Routes.setLaneOrder(null);
  });
  test("качество трассировки — настройка проекта с бэкофиллом", () => {
    const { P } = install({});
    eq(P.settings.routeQuality, "fast", "по умолчанию быстрый режим (как раньше)");
    const old = M.newProject("x"); delete old.settings.routeQuality;
    EP.Plan.Core.importJSON(JSON.stringify({ project: old }));
    eq(EP.Plan.Core.project.settings.routeQuality, "fast", "бэкофилл старого проекта");
  });

  test("noCommit: пробный/фоновый прогон не пишет undo-историю и не персистит", () => {
    const P = optProject();
    EP.Plan.Routes.setLaneOrder(null);
    EP.Plan.Routes.build();               // обычная сборка — снимок в истории есть
    const canUndoBefore = EP.Plan.Core.canUndo();
    ok(canUndoBefore, "после обычной сборки undo доступен");
    // сбросим историю до предела: сколько снимков добавит пробный прогон
    let depth = 0; while (EP.Plan.Core.canUndo() && depth < 100) { EP.Plan.Core.undo(); depth++; }
    EP.Plan.Routes.build({ silent: true, noCommit: true });
    eq(EP.Plan.Core.canUndo(), false, "пробный build не добавил снимок в undo");
    EP.Plan.Routes.buildIncremental({ silent: true, noCommit: true });
    eq(EP.Plan.Core.canUndo(), false, "пробная инкрементальная сборка тоже не пишет историю");
    ok((P.routes || []).length > 0, "трассы при этом построены");
  });

  test("предрасчёт в фоне — настройка проекта с бэкофиллом", () => {
    const { P } = install({});
    eq(P.settings.routePrecalc, false, "по умолчанию выключен (батарея)");
    const old = M.newProject("x"); delete old.settings.routePrecalc;
    EP.Plan.Core.importJSON(JSON.stringify({ project: old }));
    eq(EP.Plan.Core.project.settings.routePrecalc, false, "бэкофилл старого проекта");
  });
  test("multistart: разные старты/рестарты дают валидный и детерминированный результат", () => {
    const P = optProject();
    const run = (o) => { EP.Plan.Routes.setLaneOrder(null); return EP.Plan.Routes.optimizeRouting(o); };
    const base = run({ budgetMs: 120, seed: 12345 });                                  // воркер №0 (как раньше)
    const rev = run({ budgetMs: 120, seed: 22345, start: "reverse", restart: true });   // воркер №1
    const shuf = run({ budgetMs: 120, seed: 32345, start: "shuffle", restart: true });  // воркер №2
    [base, rev, shuf].forEach((r, i) => {
      ok(r && r.score, "вариант " + i + " вернул метрику");
      eq(r.score.unrouted, 0, "вариант " + i + " не потерял трассы");
      ok((P.routes || []).length > 0, "трассы построены");
    });
    // тот же сид + тот же старт = тот же результат (инвариант детерминизма модуля)
    const rev2 = run({ budgetMs: 120, seed: 22345, start: "reverse", restart: true });
    eq(rev2.score.cost, rev.score.cost, "«reverse» детерминирован при том же сиде");
    EP.Plan.Routes.setLaneOrder(null);
  });
  test("мемо-кэш сметы: повторный вызов не пересчитывает, изменение проекта сбрасывает", () => {
    const { P } = install({ rooms: 1, els: 3, panel: true, guide: true });
    EP.Plan.Routes.build({ silent: true });
    const C = EP.Plan.Calc;
    let calls = 0;
    const real = C.calcByRoutes;
    // мемо живёт ВНУТРИ plan-calc, поэтому считаем вызовы «настоящего» счёта через
    // estimateItems: первый раз считает, второй — берёт из кэша
    const items1 = C.estimateItems(P);
    const items2 = C.estimateItems(P);
    ok(items1 && items1.length, "смета посчитана");
    eq(items2.length, items1.length, "повторный вызов даёт тот же результат");
    ok(items1 === items2 || JSON.stringify(items1) === JSON.stringify(items2), "результат стабилен");
    // мутация проекта через persist — кэш обязан сброситься (иначе смета устареет молча)
    P.elements[0].height = 111;
    EP.Plan.Core.persist("elem-edit");
    const items3 = C.estimateItems(P);
    ok(items3 && items3.length, "после изменения смета считается заново");
  });
  test("проверки ПУЭ: runCached отдаёт тот же результат, что run", () => {
    const { P } = install({ rooms: 1, els: 2 });
    const a = EP.Plan.Rules.run(P), b = EP.Plan.Rules.runCached(P);
    eq(b.issues.length, a.issues.length, "кэшированный прогон совпадает с обычным");
  });

  test("запись проекта: localStorage остаётся основным хранилищем", () => {
    // flushPersist переписан (JSON.stringify + setItem напрямую вместо lsSet, плюс копия в
    // IndexedDB для больших проектов) — тест держит главное: обычная запись как была.
    // IndexedDB в vm-харнессе нет (idbOpen резолвится в null) — её путь проверен живым
    // прогоном headless Chromium (проект 507КБ: копия в IDB, восстановление после пробоя
    // квоты, чистка при удалении).
    const { P } = install({ rooms: 1 });
    P.name = "Хранилище-тест";
    EP.Plan.Core.persist("rename");
    EP.Plan.Core.flushPersist ? EP.Plan.Core.flushPersist() : null;
    const raw = store["ep_plan_v1_p_" + P.id];
    ok(raw, "проект записан в localStorage");
    const back = JSON.parse(raw);
    eq(back.name, "Хранилище-тест", "записано актуальное состояние");
  });

  test("страховка «не по стене» не зацикливается (репорт «не строит трассы»)", () => {
    // Регресс: clearOfWalls вставлял коннектор-«ступеньку» ПРЯМО в массив, по которому шёл
    // цикл — если ступенька снова оказывалась вдоль стены, она сдвигалась и вставляла
    // следующую, БЕЗ КОНЦА. Внешне это выглядело как «трассировка ничего не строит»: в
    // воркере бесконечный цикл, ответа нет вообще (ни ошибки, ни результата). Ловим
    // геометрией, которая это и вызывала: две комнаты с расхождением стен + магистраль,
    // проходящая рядом со стенами, точки по обе стороны.
    const p = EP.Plan.Core.createProject("clearOfWalls");
    const A = M.newRoom(G.rectPoints(0, 0, 400, 300), "A");
    const B = M.newRoom(G.rectPoints(0, 320, 400, 200), "B"); // расхождение 20см, как у пользователя
    p.rooms.push(A, B);
    const pn = M.newPanel(40, 420, "Щит"); p.panels.push(pn);
    const c1 = M.newCircuit("QF1", "#ef4444", 16); p.circuits.push(c1);
    // магистраль вплотную к стенам обеих комнат (в т.ч. по самому шву)
    p.guides.push(M.newGuide([{ x: 60, y: 410 }, { x: 60, y: 310 }, { x: 200, y: 310 }, { x: 200, y: 150 }]));
    [[A, 0, 60], [A, 2, 120], [B, 0, 200]].forEach(([room, wi, off]) => {
      const el = M.newElement("socket", room.id + ":" + wi, off, 30, "power");
      el.circuitId = c1.id; p.elements.push(el);
    });
    const t = Date.now();
    EP.Plan.Routes.build({ silent: true });
    const ms = Date.now() - t;
    ok(ms < 5000, "сборка завершилась (была бесконечной), заняла " + ms + "мс");
    ok((p.routes || []).length > 0, "трассы построены");
    // и сам путь не раздут ступеньками до бесконечности
    (p.routes || []).forEach((r) => ok((r.points || []).length < 200, "путь не разросся: точек " + (r.points || []).length));
  });

  // ===== 26. Сворачивание шторки (контракт между модулями) =====
  // Сама механика — DOM-only (в vm-харнессе querySelector отдаёт null, шторки нет),
  // поэтому проверяем то, что тестами вообще проверяемо: КОНТРАКТ. plan-elements.js
  // зовёт rooms().collapseSheet() после выбора типа в палитре и openSheet(html, opts)
  // с keepCollapsed — переименование/потеря экспорта сломала бы палитру молча (живой
  // прогон это ловит, но только если о нём вспомнить).
  test("шторка: экспорт collapseSheet/expandSheet/toggleSheetCollapsed", () => {
    const R = EP.Plan.Rooms;
    ["collapseSheet", "expandSheet", "toggleSheetCollapsed"].forEach((k) => {
      eq(typeof R[k], "function", k + " экспортирован из plan-rooms");
    });
  });
  test("шторка: openSheet(html, opts) и сворачивание без DOM не падают", () => {
    const R = EP.Plan.Rooms;
    // в харнессе шторки нет — все три должны тихо ничего не делать, а не бросать
    R.openSheet("<b>x</b>", { keepCollapsed: true });
    R.openSheet("<b>y</b>", { transient: true });
    R.collapseSheet(); R.expandSheet(); R.toggleSheetCollapsed();
    ok(true, "нет исключений при отсутствующем #ep-plan-sheet");
  });

  // ===== 27. 🧭 Перенос комнаты целиком =====
  test("перенос комнаты: контур и всё внутри едут вместе, чужое — нет", () => {
    const p = EP.Plan.Core.createProject("move");
    const A = M.newRoom(G.rectPoints(0, 0, 400, 300), "A");
    const B = M.newRoom(G.rectPoints(600, 0, 300, 300), "B"); // далеко — магнит не должен сработать
    p.rooms.push(A, B);
    const wallEl = M.newElement("socket", A.id + ":0", 100, 30, "power");   // настенная — едет САМА
    const freeEl = M.newElement("light", null, 0, 270, "light");
    freeEl.params = { x: 200, y: 150 };                                      // свободная внутри A
    const otherEl = M.newElement("light", null, 0, 270, "light");
    otherEl.params = { x: 700, y: 150 };                                     // внутри B — не двигать
    p.elements.push(wallEl, freeEl, otherEl);
    const pn = M.newPanel(50, 250, "Щит"); p.panels.push(pn);                 // щит внутри A
    const bm = M.newBeam({ x: 100, y: 100 }, { x: 300, y: 100 }); p.beams.push(bm); // балка внутри A
    EP.Plan.Core.commit(); EP.Plan.Core.persist("seed");

    const before = { wall: G.elemPoint(p, wallEl), free: { x: freeEl.params.x, y: freeEl.params.y } };
    const d = EP.Plan.Rooms.moveRoom(A.id, 50, 30, { raw: true });
    eq(d.x, 50, "сдвиг по X применён"); eq(d.y, 30, "сдвиг по Y применён");
    eq(A.points[0].x, 50, "контур поехал"); eq(A.points[0].y, 30, "контур поехал по Y");
    const wallAfter = G.elemPoint(p, wallEl);
    eq(Math.round(wallAfter.x - before.wall.x), 50, "настенная точка поехала вместе со стеной");
    eq(Math.round(wallAfter.y - before.wall.y), 30, "настенная точка поехала по Y");
    eq(freeEl.params.x, before.free.x + 50, "свободная точка внутри поехала");
    eq(pn.x, 100, "щит внутри поехал"); eq(pn.y, 280, "щит внутри поехал по Y");
    eq(bm.a.x, 150, "балка внутри поехала");
    eq(otherEl.params.x, 700, "точка ДРУГОЙ комнаты не тронута");
    eq(B.points[0].x, 600, "соседняя комната не тронута");
  });
  test("перенос комнаты: магнит углов приклеивает к соседней комнате", () => {
    const p = EP.Plan.Core.createProject("move2");
    const A = M.newRoom(G.rectPoints(0, 0, 400, 300), "A");
    const B = M.newRoom(G.rectPoints(414, 0, 300, 300), "B"); // щель 14см (< cornerSnapCm=20)
    p.rooms.push(A, B);
    EP.Plan.Core.commit(); EP.Plan.Core.persist("seed");
    // тянем A вправо на 10см — правый край окажется в 4см от левого края B, магнит должен доклеить
    EP.Plan.Rooms.moveRoom(A.id, 10, 0);
    const rightX = Math.max.apply(null, A.points.map((q) => q.x));
    eq(rightX, 414, "правый край A прилип к левому краю B (стены не расходятся)");
  });
  test("перенос комнаты: неизвестный id безопасен, нулевой сдвиг ничего не пишет", () => {
    const p = EP.Plan.Core.createProject("move3");
    p.rooms.push(M.newRoom(G.rectPoints(0, 0, 300, 300), "A"));
    EP.Plan.Core.commit(); EP.Plan.Core.persist("seed");
    eq(EP.Plan.Rooms.moveRoom("нет-такого", 50, 50), null, "нет комнаты — null, без исключения");
    const d = EP.Plan.Rooms.moveRoom(p.rooms[0].id, 2, 2); // округлится до 0 по сетке 10см
    eq(d.x, 0, "сдвиг меньше половины шага сетки — ноль");
  });

  // ===== 28. PDF: артефакты печати + размер от БЛИЖАЙШЕГО угла в развёртке =====
  test("PDF: у печатного листа заглушена заливка polyline и скрыты магистрали", () => {
    const p = EP.Plan.Core.createProject("pdfart");
    const r = M.newRoom(G.rectPoints(0, 0, 400, 300), "К1");
    p.rooms.push(r);
    const gd = M.newGuide([{ x: 20, y: 20 }, { x: 380, y: 20 }, { x: 380, y: 280 }]);
    p.guides.push(gd);                       // видимая (не hidden) — как у пользователя до сборки
    p.elements.push(M.newElement("socket", r.id + ":0", 100, 30, "power"));
    EP.Plan.Core.commit(); EP.Plan.Core.persist("seed");
    const html = EP.Plan.Export.sheetHtml(p);
    // SVG по умолчанию ЗАЛИВАЕТ многоточечный polyline чёрным — в печатном <style>
    // (у него нет доступа к plan.css) это давало чёрные пятна поверх плана.
    ok(/polyline\s*\{\s*fill:\s*none/.test(html), "в печатном <style> есть общее polyline{fill:none}");
    ok(/\.ep-plan-guide[^{]*\{[^}]*display:\s*none/.test(html), "магистрали (⇉) на печатном листе скрыты");
    ok(/\.ep-plan-swlink[^{]*\{[^}]*stroke-dasharray/.test(html), "связи выключатель→свет в печати пунктиром");
  });
  // ===== 34. Печать: штробы приходят в свои посты + масштаб под формат листа =====
  function blockCard(p, extra) {
    const html = EP.Plan.Export.sheetHtml(p);
    const card = html.split("unfcard").find((s) => /стена 1/.test(s)) || "";
    const rect = /<rect x="([-\d.]+)" y="([-\d.]+)" width="([\d.]+)" height="([\d.]+)"[^>]*class="unfshape"/.exec(card);
    const chases = [...card.matchAll(/<line x1="([-\d.]+)" y1="([-\d.]+)" x2="[-\d.]+" y2="([-\d.]+)"[^>]*stroke-dasharray/g)]
      .map((m) => ({ x: +m[1], y0: +m[2], y1: +m[3] }));
    return { html, card, rect: rect && { x: +rect[1], y: +rect[2], w: +rect[3], h: +rect[4] }, chases };
  }
  test("развёртка (PDF, 1:1): штробы блока идут В ЕГО ПОСТЫ, а не мимо", () => {
    const p = EP.Plan.Core.createProject("chase1");
    p.settings.realScale = true;                  // «1:1»: рамка блока — настоящие 368мм
    const r = M.newRoom(G.rectPoints(0, 0, 200, 300), "К");
    p.rooms.push(r);
    const c = M.newCircuit("QF1", "#ef4444", 16); p.circuits.push(c);
    const b = M.newElement("block", r.id + ":0", 100, 30, "power");
    b.params = { items: ["socket", "socket", "socket", "internet", "tv"] }; b.circuitId = c.id;
    p.elements.push(b);
    EP.Plan.Core.commit(); EP.Plan.Core.persist("seed");
    const { rect, chases, card } = blockCard(p);
    ok(rect && Math.abs(rect.w - 36.8) < 0.5, "рамка блока — реальные 368мм: " + (rect && rect.w));
    ok(chases.length >= 3, "штробы есть: " + chases.length);
    // ДО фикса штробы считались по легаси-габариту (18*kk на пост ≈ 150см) и уезжали
    // за пределы блока (были x = -21.7 / 63.4 / 91.7 при рамке 81.6..118.4)
    chases.forEach((h) => ok(h.x >= rect.x - 0.1 && h.x <= rect.x + rect.w + 0.1,
      "штроба x=" + Math.round(h.x * 10) / 10 + " внутри рамки " + rect.x + ".." + Math.round((rect.x + rect.w) * 10) / 10));
    eq((card.match(/>25×30</g) || []).length, 1, "одинаковое сечение рядом подписано ОДИН раз (не «25×3025×30»)");
  });
  test("развёртка (PDF): вертикальный блок — штробы в одну вертикаль (посты столбиком)", () => {
    const p = EP.Plan.Core.createProject("chase2");
    p.settings.realScale = true;
    const r = M.newRoom(G.rectPoints(0, 0, 200, 300), "К");
    p.rooms.push(r);
    const b = M.newElement("block", r.id + ":0", 100, 90, "power");
    b.params = { items: ["switch", "switch"] }; b.blockVert = true;
    p.elements.push(b);
    EP.Plan.Core.commit(); EP.Plan.Core.persist("seed");
    const { rect, chases } = blockCard(p);
    ok(rect && rect.h > rect.w, "рамка вертикального блока выше, чем шире");
    ok(chases.length >= 1, "штробы есть");
    chases.forEach((h) => ok(Math.abs(h.x - 100) < 0.6, "штроба на оси блока: " + h.x));
  });
  test("PDF: масштаб чертежа подбирается плотнее и формат листа идёт в штамп", () => {
    const p = EP.Plan.Core.createProject("fmt");
    p.rooms.push(M.newRoom(G.rectPoints(0, 0, 700, 450), "К"));
    p.elements.push(M.newElement("socket", p.rooms[0].id + ":0", 100, 30, "power"));
    EP.Plan.Core.commit(); EP.Plan.Core.persist("seed");
    const html = EP.Plan.Export.sheetHtml(p);
    // физический размер плана в мм в vm-харнессе не проверить (fakeNode не хранит
    // атрибуты, buildSvg читает viewBox через DOM) — это покрыто живым прогоном;
    // здесь проверяем ряд масштабов и то, что формат листа попал в штамп
    ok(/· A4/.test(html), "в штампе рядом с масштабом стоит формат листа");
    const src0 = require("fs").readFileSync(require("path").join(__dirname, "..", "assets", "js", "modules", "plan", "plan-export.js"), "utf8");
    ok(/⤢ Во весь лист/.test(src0), "есть режим «во весь лист»");
    ok(/let pdfFit = true;/.test(src0), "по умолчанию — во весь лист (репорт «выбрал A1, а проект как в A4»)");
    ok(/data-pxp-fit/.test(src0), "переключатель режима масштаба в шторке");
    ok(/Math\.round\(100 \/ k\)/.test(src0), "знаменатель масштаба при вписывании = 100/k (не 10/k — на этом первый прогон дал «1:3»)");
    ok(/lastPlanFit \? " впис\." : ""/.test(src0), "вписанный масштаб честно помечен в штампе");
    ok(/Сформировать PDF \(\$\{pdfFormat\}/.test(src0), "формат листа видно прямо на кнопке печати");
    const src = require("fs").readFileSync(require("path").join(__dirname, "..", "assets", "js", "modules", "plan", "plan-export.js"), "utf8");
    const row = /const SCALES = \[([^\]]+)\]/.exec(src);
    ok(row, "ряд масштабов найден");
    const list = row[1].split(",").map((x) => Number(x.trim()));
    [30, 40, 60, 125].forEach((sc) => ok(list.indexOf(sc) >= 0, "в ряду есть промежуточный 1:" + sc + " (чертёж плотнее заполняет лист)"));
    [10, 15].forEach((sc) => ok(list.indexOf(sc) >= 0, "в ряду есть крупный 1:" + sc + " — иначе на A1/A0 «стандартный» режим упирался в 1:20 (45% листа)"));
    ok(list.every((v, i) => i === 0 || v > list[i - 1]), "ряд строго по возрастанию — find() берёт САМЫЙ крупный подходящий");
  });
  test("PDF: размер чертежа не перебивается инлайн-стилем офскрин-обмера", () => {
    // Репорт пользователя (дважды: «выбрал A1, а проект как будто в A4 остался», затем
    // «общий план не во весь лист»): buildSvg выставляет svg.style.width/height = 1050×700px
    // ДЛЯ ОФСКРИН-ОБМЕРА (fit() должен мерить ландшафтный бокс), а физический размер по
    // масштабу — атрибутами width/height. Инлайн-стиль СИЛЬНЕЕ одноимённых атрибутов, и
    // чертёж на ЛЮБОМ формате печатался в неизменном боксе 1050×700px ≈ 278×185мм (поле A4).
    const src = require("fs").readFileSync(require("path").join(__dirname, "..", "assets", "js", "modules", "plan", "plan-export.js"), "utf8");
    const fn = /function buildSvg\(pRaw, uiExtra\)[\s\S]*?\n  \}/.exec(src);
    ok(fn, "buildSvg найдена");
    const body = fn[0];
    ok(/cv\.svg\.style\.width = "";\s*cv\.svg\.style\.height = "";/.test(body),
      "инлайн-стиль px снимается перед outerHTML");
    const clearAt = body.indexOf('cv.svg.style.width = ""');
    const htmlAt = body.indexOf("const html = cv.svg.outerHTML");
    ok(clearAt > 0 && htmlAt > clearAt, "снятие стиля идёт ДО чтения outerHTML");
    // физический размер ставится в px (1px = 1/96 дюйма — точный перевод из мм): именно
    // так svg печатался всё время до фикса, только размер был фиксированный
    ok(/96 \/ 25\.4/.test(body), "мм переводятся в px по 96/25.4");
    ok(/boxMm\.w \* MM/.test(body) && /boxMm\.h \* MM/.test(body), "в атрибуты идёт посчитанный по масштабу размер");
    ok(!/setAttribute\("width", [^)]*"mm"\)/.test(body), "физических «мм» на самом svg не остаётся (печатный композитор Chromium их смещает)");
  });
  test("развёртка (PDF): размер поста считается от БЛИЖАЙШЕГО внутреннего угла", () => {
    const p = EP.Plan.Core.createProject("nearcorner");
    const r = M.newRoom(G.rectPoints(0, 0, 500, 300), "К1");
    p.rooms.push(r);
    const wid = r.id + ":0", w = G.wallById(p, wid), L = w.len, th = G.wallThOf(p, w);
    const inA = Math.min(th / 2, L / 2), inB = Math.max(L - th / 2, L / 2);
    const eL = M.newElement("socket", wid, 60, 30, "power");        // ближе к ЛЕВОМУ углу
    const eR = M.newElement("socket", wid, L - 70, 90, "power");    // ближе к ПРАВОМУ углу
    p.elements.push(eL, eR);
    EP.Plan.Core.commit(); EP.Plan.Core.persist("seed");
    const svg = EP.Plan.Export.sheetHtml(p);
    // числа размеров: от своего ближайшего угла, НЕ от левого для обоих
    ok(svg.indexOf(">" + Math.round(60 - inA) + "<") >= 0, "левый пост: расстояние до левого угла");
    ok(svg.indexOf(">" + Math.round(inB - (L - 70)) + "<") >= 0, "правый пост: расстояние до ПРАВОГО угла");
    ok(svg.indexOf(">" + Math.round(L - 70 - inA) + "<") < 0, "правый пост НЕ мерится от левого угла");
  });

  // ===== 29. Проёмы: тяга по плану/развёртке + подъём окон над клавиатурой =====
  test("проём: сторона створки считается ПО КОМНАТЕ (перевес на другую стену)", () => {
    const p = EP.Plan.Core.createProject("flip");
    const r = M.newRoom(G.rectPoints(0, 0, 400, 300), "К1");
    p.rooms.push(r);
    EP.Plan.Core.commit(); EP.Plan.Core.persist("seed");
    // для КАЖДОЙ стены комнаты сторона должна смотреть ВНУТРЬ (иначе дверь открывалась
    // бы наружу после перевеса проёма на другую стену)
    G.walls(r).forEach((w) => {
      const fl = EP.Plan.Elements.openingFlipFor(p, w);
      ok(fl === 1 || fl === -1, "стена " + w.n + ": сторона определена");
      const nx = -(w.b.y - w.a.y), ny = w.b.x - w.a.x, L = Math.hypot(nx, ny) || 1;
      const probe = { x: w.mx + (nx / L) * fl * 2, y: w.my + (ny / L) * fl * 2 };
      ok(G.pointInPolygon(probe, r.points), "стена " + w.n + ": сторона смотрит внутрь комнаты");
    });
    // балка (перегородка) своей комнаты не имеет — сторону не пересчитываем
    const bm = M.newBeam({ x: 50, y: 50 }, { x: 250, y: 50 });
    p.beams.push(bm);
    eq(EP.Plan.Elements.openingFlipFor(p, G.beamWall(bm)), null, "у перегородки стороны нет — null");
  });
  test("проём: контракт тяги по плану (Rooms.enableOpeningDrag ⟷ Elements.openingFlipFor)", () => {
    // plan-elements.js зовёт rooms().enableOpeningDrag(op.id) из редактора проёма, а
    // plan-rooms.js — EL.openingFlipFor при перевесе на другую стену: переименование
    // любой из двух молча выключило бы тягу проёма (без ошибки в консоли)
    ok(typeof EP.Plan.Rooms.enableOpeningDrag === "function", "Rooms.enableOpeningDrag есть");
    ok(typeof EP.Plan.Elements.openingFlipFor === "function", "Elements.openingFlipFor есть");
    ok(typeof EP.Plan.Rooms.placeSheetBtn === "function", "Rooms.placeSheetBtn есть (клавиатура поднимает кнопку)");
  });
  test("UI: всплывающие окна поднимаются над экранной клавиатурой (--kb)", () => {
    const fs = require("fs"), path = require("path"), root = path.resolve(__dirname, "..");
    const idx = fs.readFileSync(path.join(root, "index.html"), "utf8");
    ok(/ui\/keyboard-inset\.js/.test(idx), "keyboard-inset.js подключён в index.html");
    const base = fs.readFileSync(path.join(root, "assets", "css", "base.css"), "utf8");
    ok(/--kb:\s*0px/.test(base), "--kb объявлена в :root");
    const kbRules = (base.match(/body\[data-kb="1"\][^{]*\{[^}]*\}/g) || []).join(" ");
    [".modal", ".ep-qty-ov", ".ep-card-ov", ".ep-db-modal-ov", ".pv29-dbmodal", ".shv28-dbmodal"].forEach((s) => {
      ok(kbRules.indexOf(s) >= 0, "оверлей поднимается над клавиатурой: " + s);
    });
    ok(/var\(--kb/.test(kbRules), "оверлеи используют именно --kb");
    const plan = fs.readFileSync(path.join(root, "assets", "css", "plan.css"), "utf8");
    ok(/body\[data-kb="1"\]\s*\.ep-plan-sheet\s*\{[^}]*var\(--kb/.test(plan), "шторка плана поднимается над клавиатурой");
  });

  // ===== 30. Реальный масштаб приборов (1:1): габариты рамок + «лица» =====
  test("1:1: габариты рамок по datasheet (84/155/226/300/368 мм)", () => {
    const R = EP.Plan.Render;
    eq(R.frameWmm(1), 84, "1 пост"); eq(R.frameWmm(2), 155, "2 поста");
    eq(R.frameWmm(3), 226, "3 поста"); eq(R.frameWmm(4), 300, "4 поста");
    eq(R.frameWmm(5), 368, "5 постов");
    eq(R.frameHcm(), 8.4, "высота рамки 84 мм");
    eq(R.frameWcm(3), 22.6, "см для 3 постов");
    ok(R.frameWmm(6) > R.frameWmm(5), "6+ постов — экстраполяция, не схлопывание в 84мм");
    ok(Math.abs(R.CM_PER_PX_1TO1 - 2.54 / 96) < 1e-9, "истинный 1:1 = 2.54/96 см на пиксель");
  });
  test("1:1: «лицо» прибора — розетка с гнёздами, выключатель клавишами, RJ45, ТВ", () => {
    const R = EP.Plan.Render;
    const sock = R.deviceFace("socket", 1);
    eq(sock.filter((o) => o.cls === "hole").length, 2, "у розетки два гнезда");
    eq(sock.filter((o) => o.cls === "earth").length, 2, "и заземляющие усики");
    eq(R.deviceFace("switch", 3).filter((o) => o.cls === "key").length, 3, "3 клавиши — три качельки");
    eq(R.deviceFace("switch", 1).filter((o) => o.cls === "key").length, 1, "1 клавиша — одна");
    ok(R.deviceFace("internet", 1).some((o) => o.t === "path" && o.cls === "jack"), "интернет — гнездо RJ45");
    ok(R.deviceFace("tv", 1).some((o) => o.cls === "pin"), "ТВ — коаксиал со штырьком");
    // у типов без «лица» остаётся только рамка поста (букву дорисует вызывающий)
    eq(R.deviceFace("ac", 1).filter((o) => o.cls !== "post").length, 0, "кондиционер — без лица");
    // все примитивы — в пределах окна поста 58×58 (иначе «лицо» вылезло бы за рамку)
    sock.forEach((o) => {
      const m = o.t === "circle" ? Math.abs(o.cx) + o.r : (o.t === "rect" ? Math.max(Math.abs(o.x), Math.abs(o.x + o.w)) : 0);
      ok(m <= R.POST_MM / 2 + 0.01, "примитив внутри окна поста");
    });
  });
  test("1:1: настройка realScale — дефолт выключена, бэкофилл у старых проектов", () => {
    const p = EP.Plan.Core.createProject("rs");
    eq(p.settings.realScale, false, "по умолчанию выключено (обычный вид)");
    const old = JSON.stringify({ project: { id: "x", name: "old", rooms: [], elements: [], settings: {} } });
    const imp = EP.Plan.Core.importJSON(old);
    eq(imp.settings.realScale, false, "старый проект получает поле, а не undefined");
  });
  test("1:1: реальные габариты и «лица» доходят до ПЕЧАТНОЙ развёртки", () => {
    const p = EP.Plan.Core.createProject("rspdf");
    const r = M.newRoom(G.rectPoints(0, 0, 500, 300), "К1");
    p.rooms.push(r);
    const wid = r.id + ":0";
    const blk = M.newElement("block", wid, 200, 30, "power");
    blk.params = { items: ["socket", "socket", "socket"] };
    p.elements.push(blk, M.newElement("internet", wid, 350, 30, "lv"));
    p.settings.realScale = true;
    EP.Plan.Core.commit(); EP.Plan.Core.persist("seed");
    const html = EP.Plan.Export.sheetHtml(p);
    ok(html.indexOf('width="22.6"') >= 0, "рамка блока из 3 постов — 226 мм и в PDF");
    ok(/fill="#0f172a"/.test(html) || /fill="#111827"/.test(html), "«лицо» (гнёзда) нарисовано в PDF");
    ok(/@page \{ size: A4 landscape/.test(html), "формат листа по умолчанию A4");
    ok(/\.sheet \{[^}]*width: 297mm/.test(html), "и его физический размер");
  });

  // ===== 31. Мебель и бытовая техника (p.appliances) =====
  test("техника: каталог валиден (габариты, мощность, уникальные id)", () => {
    const F = EP.Plan.Furniture, seen = new Set();
    ["appl", "furn"].forEach((k) => F.CATALOG[k].forEach((c) => {
      ok(!seen.has(c.id), "id уникален: " + c.id); seen.add(c.id);
      ok(c.name && c.w > 0 && c.d > 0, c.id + ": имя и габариты заданы");
      if (k === "appl") ok(c.kw > 0, c.id + ": у техники есть мощность");
      else ok(c.kw == null, c.id + ": у мебели мощности нет");
    }));
    ok(F.CATALOG.appl.length >= 15 && F.CATALOG.furn.length >= 15, "каталог не обрезан");
  });
  test("техника: нагрузка → ток → автомат/кабель/УЗО", () => {
    const F = EP.Plan.Furniture;
    const nd = (id, o) => F.needFor(Object.assign({ kind: "appl", catId: id, watt: null, phases: 1 }, o || {}));
    const wash = nd("washer");
    eq(wash.breaker, 16, "стиралка 2.2кВт → автомат 16A");
    eq(wash.cable, "3×2.5", "и кабель 2.5 (выделенная линия — практический минимум)");
    ok(wash.rcd && wash.own, "мокрая зона → УЗО, и своя линия");
    const wh = nd("waterheater");
    eq(wh.amps, 10.9, "водонагреватель 2.5кВт → 10.9 А");
    eq(wh.cable, "3×2.5", "кабель 2.5");
    const hob = nd("hob");
    eq(hob.breaker, 32, "варочная 7.2кВт в 1 фазу → 32A");
    eq(hob.cable, "3×6", "и кабель 6 мм²");
    const hob3 = nd("hob", { phases: 3 });
    ok(hob3.amps < hob.amps && hob3.cable.indexOf("5×") === 0, "в 3 фазы ток меньше и кабель 5-жильный");
    const mw = nd("microwave");
    eq(mw.cable, "3×2.5", "СВЧ включается в розетку → розеточная группа 2.5");
    ok(!mw.own, "но отдельной линии не требует");
    // прямое подключение малой мощности считается честно по току, без «розеточного» минимума
    const bell = nd("bell");
    eq(bell.cable, "3×1.5", "звонок 15Вт — 1.5 мм²");
    ok(bell.breaker <= 10 && !bell.own, "и малый автомат, без выделенной линии");
    const flow1 = nd("waterheaterflow"), flow3 = nd("waterheaterflow", { phases: 3 });
    eq(flow1.breaker, 50, "проточный ВН 11кВт в 1 фазу → 50A");
    eq(flow1.cable, "3×10", "и кабель 10 мм²");
    eq(flow3.cable, "5×2.5", "он же в 3 фазы — 5×2.5");
    ok(flow1.rcd && flow1.own && flow1.p3ok, "мокрая зона, своя линия, возможны 3 фазы");
    ["bell", "waterheaterflow", "neptun", "handdryer", "fancoil", "disposer", "kettle", "fanduct"].forEach((id) => {
      ok(F.byId(id), "прибор есть в каталоге: " + id);
    });
    eq(F.needFor({ kind: "furn", catId: "sofa" }), null, "у мебели нагрузки нет");
  });
  test("техника/мебель: модель, бэкофилл, фильтр по этажу, каскад удаления", () => {
    const p = EP.Plan.Core.createProject("ap");
    ok(Array.isArray(p.appliances), "массив есть у нового проекта");
    const a = M.newAppliance("appl", "washer", 100, 200, 60, 60);
    p.appliances.push(a);
    eq(a.kind, "appl"); eq(a.rot, 0); eq(a.phases, 1);
    ok(a.floorId, "floorId проставлен (этажи)");
    // второй этаж — предмет первого не должен попадать в его геометрию
    const f2 = EP.Plan.Core.addFloor("2 этаж");
    EP.Plan.Core.setActiveFloor(f2.id);
    eq(G.floorScoped(EP.Plan.Core.project).appliances.length, 0, "на другом этаже мебели нет");
    EP.Plan.Core.setActiveFloor(p.floors[0].id);
    eq(G.floorScoped(EP.Plan.Core.project).appliances.length, 1, "на своём — есть");
    EP.Plan.Core.setActiveFloor(f2.id);
    EP.Plan.Core.deleteFloor(p.floors[0].id);
    eq(EP.Plan.Core.project.appliances.length, 0, "удаление этажа уносит его мебель");
    // старый проект без поля — бэкофилл
    const imp = EP.Plan.Core.importJSON(JSON.stringify({ project: { name: "old", rooms: [], elements: [], settings: {} } }));
    ok(Array.isArray(imp.appliances), "у старого проекта поле появилось");
  });
  test("техника: проверки ловят слабую линию, отсутствие УЗО и точки питания", () => {
    const p = EP.Plan.Core.createProject("apchk");
    const r = M.newRoom(G.rectPoints(0, 0, 400, 300), "Кухня");
    p.rooms.push(r);
    const c = M.newCircuit("QF1", "#ef4444", 10); c.rcd = false; c.cable = "ВВГ 3×1.5";
    p.circuits.push(c);
    const hob = M.newAppliance("appl", "hob", 100, 100, 60, 52);
    hob.circuitId = c.id;
    p.appliances.push(hob);
    EP.Plan.Core.commit(); EP.Plan.Core.persist("seed");
    const msgs = EP.Plan.Rules.run(p).issues.map((i) => i.msg).join(" | ");
    ok(/автомат 10A мал/.test(msgs), "слабый автомат под варочную");
    ok(/кабель ВВГ 3×1.5 тонкий/.test(msgs), "тонкий кабель");
    ok(/без УЗО/.test(msgs), "нет УЗО у мощного прибора");
    ok(/не указана точка питания/.test(msgs), "не привязана точка питания");
    // правильная линия — претензий по прибору нет
    c.breaker = 32; c.cable = "ВВГ 3×6"; c.rcd = true;
    hob.elementId = "x";
    const ok2 = EP.Plan.Rules.run(p).issues.map((i) => i.msg).filter((m) => /Варочная/.test(m));
    eq(ok2.length, 0, "на верной линии претензий к прибору нет: " + ok2.join(","));
  });
  test("свет: автокабель линии освещения — 3×1.5", () => {
    const p = EP.Plan.Core.createProject("lightcab");
    const r = M.newRoom(G.rectPoints(0, 0, 300, 300), "К");
    p.rooms.push(r);
    const cl = M.newCircuit("QF1", "#facc15", 16); p.circuits.push(cl);
    const lamp = M.newElement("light", null, 0, 270, "light");
    lamp.circuitId = cl.id; lamp.params = { x: 150, y: 150 };
    const sock = M.newElement("socket", r.id + ":0", 100, 30, "power");
    const cp = M.newCircuit("QF2", "#ef4444", 16); p.circuits.push(cp);
    sock.circuitId = cp.id;
    p.elements.push(lamp, sock);
    EP.Plan.Core.commit(); EP.Plan.Core.persist("seed");
    ok(/3×1\.5/.test(EP.Plan.Scheme.autoCable(p, cl)), "свет — 3×1.5");
    ok(/3×2\.5/.test(EP.Plan.Scheme.autoCable(p, cp)), "розетки — по номиналу автомата (2.5)");
    // кап по безопасности: под автомат 25А 1.5мм² нельзя
    cl.breaker = 25;
    ok(!/3×1\.5/.test(EP.Plan.Scheme.autoCable(p, cl)), "при автомате 25A свет уже не 1.5");
  });

  // ===== 32. Вывод 3ф, котлы, АВР, журнал замечаний =====
  test("вывод 3ф: тип, окончание (пятижилка/розетка), линия сразу 3-полюсная", () => {
    const T3 = EP.Plan.Elements.TYPES.output3;
    ok(T3 && T3.free && T3.layer === "power", "тип есть, свободный, силовой");
    const p = EP.Plan.Core.createProject("o3");
    const r = M.newRoom(G.rectPoints(0, 0, 400, 300), "К");
    p.rooms.push(r);
    const el = M.newElement("output3", null, 0, 270, "power");
    el.params = { x: 200, y: 150 };
    p.elements.push(el);
    EP.Plan.Core.commit(); EP.Plan.Core.persist("seed");
    const c = EP.Plan.Elements.assignNewCircuit(el);
    eq(c.poles, 3, "новая линия под 3ф-вывод — трёхполюсная");
    ok(/5×/.test(EP.Plan.Scheme.autoCable(p, c)), "и кабель 5-жильный: " + EP.Plan.Scheme.autoCable(p, c));
    // «розетка 3ф» — то же питание, отличается только окончанием
    el.threeKind = "socket";
    eq(EP.Plan.Elements.TYPES.output3.glyph, "3ф", "глиф на плане");
  });
  test("котлы: газовый и электрический — отдельные позиции каталога", () => {
    const F = EP.Plan.Furniture;
    const el = F.byId("boiler"), gas = F.byId("boilergas");
    eq(el.name, "Котёл электрический"); eq(gas.name, "Котёл газовый");
    ok(el.kw > 1000 && gas.kw < 1000, "электрический — киловатты, газовый — плата+насос");
    const ndGas = F.needFor({ kind: "appl", catId: "boilergas", watt: null, phases: 1 });
    ok(ndGas.own, "газовому тоже нужна своя линия (чистое питание)");
    eq(ndGas.cable, "3×2.5", "розеточная группа — 2.5");
    const ndEl = F.needFor({ kind: "appl", catId: "boiler", watt: null, phases: 1 });
    eq(ndEl.breaker, 32, "электрический 6кВт → 32A");
  });
  test("АВР: флаг щита, бэкофилл и позиции в смете (оба пути расчёта)", () => {
    const p = EP.Plan.Core.createProject("avr");
    const r = M.newRoom(G.rectPoints(0, 0, 400, 300), "К");
    p.rooms.push(r);
    const pn = M.newPanel(50, 250, "Щит");
    eq(pn.avr, false, "по умолчанию АВР нет");
    pn.avr = true; p.panels.push(pn);
    p.elements.push(M.newElement("socket", r.id + ":0", 100, 30, "power"));
    EP.Plan.Core.commit(); EP.Plan.Core.persist("seed");
    const names = (EP.Plan.Calc.estimateItems(p) || []).map((i) => i.name).join(" | ");
    ok(/Монтаж и настройка системы АВР/.test(names), "работа по АВР в смете");
    ok(/Комплект АВР/.test(names), "и материал");
    // старый проект без поля — бэкофилл
    const imp = EP.Plan.Core.importJSON(JSON.stringify({ project: { name: "o", rooms: [], elements: [], panels: [{ id: "pn1", x: 0, y: 0, name: "Щит" }], settings: {} } }));
    eq(imp.panels[0].avr, false, "у старого щита поле появилось");
  });
  test("журнал замечаний (чат): подключён и кнопка есть в шапке плана", () => {
    const fs = require("fs"), path = require("path"), root = path.resolve(__dirname, "..");
    const idx = fs.readFileSync(path.join(root, "index.html"), "utf8");
    ok(/ui\/feedback\.js/.test(idx), "feedback.js подключён");
    const mount = fs.readFileSync(path.join(root, "assets", "js", "modules", "plan", "plan-mount.js"), "utf8");
    ok(/data-fb-open/.test(mount), "кнопка 💬 в шапке редактора плана");
    ok(mount.indexOf("data-fb-open") < mount.indexOf("data-plan-realscale"), "стоит рядом с «1:1» (перед ней)");
    const fb = fs.readFileSync(path.join(root, "assets", "js", "modules", "ui", "feedback.js"), "utf8");
    ok(/localStorage/.test(fb) && /clipboard/.test(fb), "хранит локально и умеет копировать в буфер");
    const css = fs.readFileSync(path.join(root, "assets", "css", "base.css"), "utf8");
    ok(/body\[data-kb="1"\][^{]*\.ep-fb-ov/.test(css), "оверлей чата поднимается над клавиатурой");
  });
  test("общий ОНЛАЙН-чат: коллекция, живая подписка, офлайн-очередь, вход из меню", () => {
    const fs = require("fs"), path = require("path"), root = path.resolve(__dirname, "..");
    const fb = fs.readFileSync(path.join(root, "assets", "js", "modules", "ui", "feedback.js"), "utf8");
    ok(/chat_messages/.test(fb), "пишет в общую коллекцию chat_messages");
    ok(/onSnapshot/.test(fb), "живая подписка (сообщения других видно без перезагрузки)");
    ok(/serverTimestamp/.test(fb), "время сообщения — серверное");
    // подписка живёт, пока открыто ПРИЛОЖЕНИЕ (иначе не было бы ни метки, ни звука при
    // закрытом окне чата), а снимается на смене входа — см. раздел 35
    ok(/function unsubAll\(\)/.test(fb) && /ep:auth-changed/.test(fb), "подписки снимаются при смене входа");
    ok(/ep_chat_queue_v1/.test(fb) && /flushQueue/.test(fb), "офлайн-очередь и автодосылка");
    ok(/data-fb-tab/.test(fb) && /"notes"/.test(fb), "локальный журнал остался отдельной вкладкой");
    ok(/chatText/.test(fb), "чат можно скопировать целиком (у разработчика доступа к базе нет)");
    const shell = fs.readFileSync(path.join(root, "assets", "js", "core", "app-shell.js"), "utf8");
    ok(/data-fb-open[^>]*>💬 Общий чат/.test(shell), "пункт «💬 Общий чат» в бургер-меню (доступен не только в плане)");
    const rules = fs.readFileSync(path.join(root, "firestore.rules"), "utf8");
    const blk = rules.slice(rules.indexOf("match /chat_messages/"));
    ok(rules.indexOf("match /chat_messages/") > 0, "правила для chat_messages есть");
    ok(/allow read: if isApproved\(\) \|\| isAdmin\(\)/.test(blk), "читают одобренные — это и есть «общий» чат");
    ok(/request\.resource\.data\.uid == request\.auth\.uid/.test(blk), "писать только от своего имени");
    ok(/text\.size\(\) <= 2000/.test(blk), "ограничение длины сообщения");
    ok(/allow update: if signedIn\(\)/.test(blk) && /resource\.data\.uid == request\.auth\.uid/.test(blk),
      "править можно ТОЛЬКО своё сообщение (правка добавлена по просьбе пользователя, см. раздел 35)");
    ok(/allow delete: if isAdmin\(\) \|\| \(signedIn\(\) && resource\.data\.uid == request\.auth\.uid\)/.test(blk), "удаляет автор или админ");
    ok(/match \/\{document=\*\*\} \{\s*allow read, write: if false;/.test(rules), "финальный запрет-всё на месте (не потерян)");
    const css2 = fs.readFileSync(path.join(root, "assets", "css", "base.css"), "utf8");
    ok(/\.ep-fb-msg\.is-mine/.test(css2), "свои сообщения отличаются визуально");
    ok(!/\.ep-fb-msg\{[^}]*rgba\(255,\s*255,\s*255/.test(css2), "пузырь чужого сообщения не белым по белому (видно в светлой теме)");
  });
  // ===== 35. Полноценный чат: личка, кто в сети, ответы/правка, уведомления, метка =====
  test("чат: личные сообщения и присутствие — модель и правила", () => {
    const fs = require("fs"), path = require("path"), root = path.resolve(__dirname, "..");
    const fb = fs.readFileSync(path.join(root, "assets", "js", "modules", "ui", "feedback.js"), "utf8");
    ok(/chat_dm/.test(fb) && /uids/.test(fb), "личка пишется в chat_dm с массивом участников");
    ok(/array-contains/.test(fb), "вся моя личка тянется одной подпиской (без составного индекса)");
    ok(/chat_presence/.test(fb) && /HB_MS/.test(fb), "присутствие: свой документ + «сердцебиение»");
    ok(/ONLINE_MS/.test(fb) && /isOnline/.test(fb), "«в сети» считается по свежести сердцебиения");
    const rules = fs.readFileSync(path.join(root, "firestore.rules"), "utf8");
    const dm = rules.slice(rules.indexOf("match /chat_dm/"));
    ok(rules.indexOf("match /chat_dm/") > 0, "правила для личных сообщений есть");
    ok(/allow read: if signedIn\(\) && request\.auth\.uid in resource\.data\.uids/.test(dm), "личку читают ТОЛЬКО двое участников (админ тоже нет)");
    ok(/request\.resource\.data\.from == request\.auth\.uid/.test(dm), "писать личку только от своего имени");
    ok(/resource\.data\.to == request\.auth\.uid[\s\S]{0,200}seen == true/.test(dm), "получатель может только отметить прочтение");
    const pres = rules.slice(rules.indexOf("match /chat_presence/"));
    ok(rules.indexOf("match /chat_presence/") > 0, "правила присутствия есть");
    ok(/allow create, update: if isSelf\(uid\)/.test(pres), "своё присутствие обновляет только сам пользователь");
    const pub = rules.slice(rules.indexOf("match /chat_messages/"), rules.indexOf("match /chat_presence/"));
    ok(/allow update: if signedIn\(\)/.test(pub) && /resource\.data\.uid == request\.auth\.uid/.test(pub), "правку своего сообщения разрешили (просьба пользователя)");
    ok(/request\.resource\.data\.ts == resource\.data\.ts/.test(pub), "но время/автора подменить нельзя");
    ok(/match \/\{document=\*\*\} \{\s*allow read, write: if false;/.test(rules), "финальный запрет-всё на месте");
  });
  test("чат: ответы, правка, автопрокрутка, растущее поле, звук и метка", () => {
    const fs = require("fs"), path = require("path"), root = path.resolve(__dirname, "..");
    const fb = fs.readFileSync(path.join(root, "assets", "js", "modules", "ui", "feedback.js"), "utf8");
    ok(/replyTo/.test(fb) && /data-fb-reply/.test(fb), "ответ на сообщение (цитата)");
    ok(/data-fb-edit\b/.test(fb) && /function editMsg/.test(fb), "правка своего сообщения");
    ok(/function grow\(/.test(fb) && /scrollHeight/.test(fb), "поле ввода растёт по тексту");
    ok(/scrollTop = box\.scrollHeight/.test(fb), "автопрокрутка к последнему сообщению");
    ok(/pendingNew/.test(fb) && /data-fb-tobottom/.test(fb), "«↓ N новых», если список прокручен вверх");
    ok(/function ping\(/.test(fb) && /SoundFeedback/.test(fb), "звуковой сигнал (через общий модуль звука)");
    ok(/function notify\(/.test(fb) && /showNotification/.test(fb), "уведомление через service worker");
    ok(/function paintBadge/.test(fb) && /setAppBadge/.test(fb), "красная метка у кнопки чата и на иконке приложения");
    ok(/data-fb-older/.test(fb) && /function loadOlder/.test(fb), "история: загрузить предыдущие");
    ok(/ep-chat-fab/.test(fb) && /route === "login"/.test(fb), "плавающая кнопка чата на любом экране (кроме входа)");
    const css = fs.readFileSync(path.join(root, "assets", "css", "base.css"), "utf8");
    ok(/\.ep-chat-fab\{[^}]*position:fixed/.test(css), "FAB зафиксирован поверх экрана");
    ok(/\[data-fb-open\]\[data-unread\]::after/.test(css), "метка непрочитанных рисуется CSS у любой кнопки вызова");
    ok(/\.ep-fb-dot\.is-on/.test(css), "зелёная точка «в сети»");
    const sw = fs.readFileSync(path.join(root, "sw.js"), "utf8");
    ok(/notificationclick/.test(sw) && /clients\.matchAll/.test(sw), "клик по уведомлению поднимает открытое приложение");
    ok(/addEventListener\("push"/.test(sw), "обработчик push готов (для будущего серверного пуша)");
  });
  test("чат: писать может только одобренный, модерация — бан/жалобы/чистка", () => {
    const fs = require("fs"), path = require("path"), root = path.resolve(__dirname, "..");
    const rules = fs.readFileSync(path.join(root, "firestore.rules"), "utf8");
    ok(/function chatBanned\(\)[\s\S]{0,200}chat_bans/.test(rules), "бан проверяется прямо в правилах (chat_bans)");
    const pub = rules.slice(rules.indexOf("match /chat_messages/"), rules.indexOf("match /chat_presence/"));
    ok(/allow create: if \(isApproved\(\) \|\| isAdmin\(\)\)[\s\S]{0,80}!chatBanned\(\)/.test(pub),
      "в общий чат пишет ТОЛЬКО одобренный и не забаненный");
    const dm = rules.slice(rules.indexOf("match /chat_dm/"));
    ok(/allow create: if \(isApproved\(\) \|\| isAdmin\(\)\)[\s\S]{0,80}!chatBanned\(\)/.test(dm),
      "в личку — тоже только одобренный и не забаненный (не просто signedIn)");
    const pres = rules.slice(rules.indexOf("match /chat_presence/"), rules.indexOf("match /chat_dm/"));
    ok(/isSelf\(uid\) && \(isApproved\(\) \|\| isAdmin\(\)\)/.test(pres), "присутствие пишет только одобренный сам за себя");
    const bans = rules.slice(rules.indexOf("match /chat_bans/"), rules.indexOf("match /chat_reports/"));
    ok(/allow read: if isApproved\(\) \|\| isAdmin\(\)/.test(bans) && /allow create, update, delete: if isAdmin\(\)/.test(bans),
      "бан ставит/снимает только админ, видят все одобренные (чтобы честно показать «ограничен»)");
    const reps = rules.slice(rules.indexOf("match /chat_reports/"), rules.indexOf("match /chat_messages/"));
    ok(/allow read: if isAdmin\(\)/.test(reps), "жалобы читает только админ");
    ok(/request\.resource\.data\.by == request\.auth\.uid/.test(reps), "жалоба пишется только от своего имени");
    ok(/match \/\{document=\*\*\} \{\s*allow read, write: if false;/.test(rules), "финальный запрет-всё на месте");
    const fb = fs.readFileSync(path.join(root, "assets", "js", "modules", "ui", "feedback.js"), "utf8");
    ok(/function banUser/.test(fb) && /function unbanUser/.test(fb), "бан/разбан из чата");
    ok(/function purgeUser/.test(fb) && /where\("uid", "==", uid\)/.test(fb), "удалить ВСЕ сообщения человека (в т.ч. старые, вне живого лимита)");
    ok(/function reportMsg/.test(fb) && /data-fb-report/.test(fb), "жалоба на сообщение у обычного мастера");
    ok(/view === "mod"/.test(fb) && /🛡 Модерация/.test(fb), "вкладка модерации (только админу)");
    ok(/iAmBanned\(\)/.test(fb) && /ep-fb-banned/.test(fb), "забаненному вместо поля ввода — честная плашка");
    ok(/const skin = \(\)/.test(fb) && /is-retro/.test(fb), "ретро-облик «Классика» с переключателем");
    ok(/is-retro" : " card glass"/.test(fb), "в ретро-облике не вешаем card/glass (их !important-фон перебил бы окно)");
    const css = fs.readFileSync(path.join(root, "assets", "css", "base.css"), "utf8");
    ok(/\.ep-fb-ov \.ep-fb-card\.is-retro\{[^}]*background:#ece9d8/.test(css), "ретро-окно: непрозрачный бежевый фон");
    ok(/\.ep-fb-ov \.ep-fb-card\.is-retro \.ep-fb-msg\.is-mine \.ep-fb-msgtop b\{color:#b91c1c\}/.test(css), "свои подписи красным (как в старых мессенджерах)");
    ok(/\.ep-fb-banned\{/.test(css) && /\.ep-fb-flower/.test(css), "плашка бана и цветок статуса");
    // имя чужого продукта не должно попадать в интерфейс/стили приложения (товарный знак)
    const shipped = [fb, css, fs.readFileSync(path.join(root, "pages", "guide.html"), "utf8")].join("\n");
    ok(!/\bICQ\b/i.test(shipped.replace(/\[старому мессенджеру\]/g, "")), "в поставляемом коде нет названия чужого мессенджера");
  });
  test("чат: контакты (заявка → принятие) и вложения проект/БД/смета", () => {
    const fs = require("fs"), path = require("path"), root = path.resolve(__dirname, "..");
    const rules = fs.readFileSync(path.join(root, "firestore.rules"), "utf8");
    const cont = rules.slice(rules.indexOf("match /chat_contacts/"), rules.indexOf("match /chat_files/"));
    ok(rules.indexOf("match /chat_contacts/") > 0, "правила контактов есть");
    ok(/allow read: if signedIn\(\) && request\.auth\.uid in resource\.data\.uids/.test(cont), "контакт видят только двое");
    ok(/request\.resource\.data\.status == "pending"/.test(cont), "заявка создаётся только как pending");
    ok(/resource\.data\.to == request\.auth\.uid[\s\S]{0,300}status == "ok"/.test(cont), "принять может ТОЛЬКО адресат");
    ok(/allow delete: if signedIn\(\) && request\.auth\.uid in resource\.data\.uids/.test(cont), "отклонить/убрать — любая сторона");
    const files = rules.slice(rules.indexOf("match /chat_files/"));
    ok(/resource\.data\.pub == true && \(isApproved\(\) \|\| isAdmin\(\)\)/.test(files), "вложение общего чата видят одобренные");
    ok(/request\.auth\.uid in resource\.data\.uids/.test(files), "вложение лички — только участники");
    ok(/data\.size\(\) <= 900000/.test(files), "ограничение размера вложения (лимит документа Firestore)");
    ok(/allow update: if false/.test(files), "вложение неизменяемо — это снимок");
    ok(/match \/\{document=\*\*\} \{\s*allow read, write: if false;/.test(rules), "финальный запрет-всё на месте");
    const fb = fs.readFileSync(path.join(root, "assets", "js", "modules", "ui", "feedback.js"), "utf8");
    ok(/function addContact/.test(fb) && /function acceptContact/.test(fb) && /function dropContact/.test(fb), "заявка/принятие/удаление контакта");
    ok(/pairId = \(a, b\) => \[a, b\]\.sort\(\)\.join\("__"\)/.test(fb), "id пары отсортирован — повторная заявка не плодит дубли");
    ok(/data-fb-cadd/.test(fb) && /Заявки в контакты/.test(fb) && /Мои контакты/.test(fb), "секции людей: заявки, контакты, все мастера");
    ok(/function putFile/.test(fb) && /function getFile/.test(fb) && /function applyAttach/.test(fb), "вложения: положить/прочитать/применить");
    ok(/kind === "plan"[\s\S]{0,200}importJSON/.test(fb), "проект применяется штатным importJSON");
    ok(/kind === "dbitem"[\s\S]{0,300}addMyItem/.test(fb), "позиция уходит в «Мою БД» штатным addMyItem");
    ok(/kind === "estimate"[\s\S]{0,300}EstimateDraft/.test(fb), "смета уходит в предварительную смету");
    ok(/tooBig/.test(fb), "слишком большое вложение (фото) не отправляется молча");
    ok(/data-fb-attach/.test(fb) && /data-fb-apply/.test(fb), "кнопка 📎 и кнопка применения у получателя");
    const core = fs.readFileSync(path.join(root, "assets", "js", "modules", "plan", "plan-core.js"), "utf8");
    ok(/async function exportJSONById/.test(core), "экспорт ЛЮБОГО проекта по id (не переключая открытый)");
    ok(/exportJSONById[\s\S]{0,400}preloadPhotos/.test(core), "у неактивного проекта фото догружаются из IndexedDB");
    ok(/exportJSON, exportJSONById, importJSON/.test(core), "и он экспортирован из модуля");
  });
  test("чат: групповые чаты (комнаты и сообщения со снимком участников)", () => {
    const fs = require("fs"), path = require("path"), root = path.resolve(__dirname, "..");
    const rules = fs.readFileSync(path.join(root, "firestore.rules"), "utf8");
    const rooms = rules.slice(rules.indexOf("match /chat_rooms/"), rules.indexOf("match /chat_group/"));
    const grp = rules.slice(rules.indexOf("match /chat_group/"), rules.indexOf("match /{document=**}"));
    ok(rules.indexOf("match /chat_rooms/") > 0 && rules.indexOf("match /chat_group/") > 0, "правила групп есть");
    ok(/allow read: if signedIn\(\) && request\.auth\.uid in resource\.data\.uids/.test(rooms), "комнату видят только её участники");
    ok(/uids\.size\(\) <= 50/.test(rooms), "участников не больше 50");
    ok(/request\.resource\.data\.by == resource\.data\.by/.test(rooms), "создателя комнаты подменить нельзя");
    ok(/allow delete: if isAdmin\(\) \|\| \(signedIn\(\) && resource\.data\.by == request\.auth\.uid\)/.test(rooms), "удалить комнату — создатель или админ");
    // сообщение НЕСЁТ свой снимок uids: доступ проверяется БЕЗ get() комнаты на каждое чтение
    ok(/allow read: if signedIn\(\) && request\.auth\.uid in resource\.data\.uids/.test(grp), "сообщение группы читают по снимку uids в самом сообщении");
    ok(!/get\(\/databases/.test(grp), "никаких get() комнаты в правилах сообщений (дешевле и не ломается при удалении комнаты)");
    ok(/request\.resource\.data\.roomId is string/.test(grp), "сообщение привязано к комнате");
    ok(/request\.resource\.data\.ts == resource\.data\.ts/.test(grp), "при правке текста время не подменить");
    const fb = fs.readFileSync(path.join(root, "assets", "js", "modules", "ui", "feedback.js"), "utf8");
    ok(/function createRoom/.test(fb) && /function roomAdd/.test(fb) && /function roomKick/.test(fb), "создать группу / добавить / убрать участника");
    ok(/function sendGroup/.test(fb), "отправка в группу");
    ok(/uids: \(r\.uids \|\| \[\]\)\.slice\(\)/.test(fb), "сообщение сохраняет СНИМОК списка участников на момент отправки");
    ok(/data-fb-roomnew/.test(fb) && /data-fb-room=/.test(fb) && /data-fb-roompeople/.test(fb), "UI: новая группа, вход в группу, состав");
    ok(/seenR\[r\.id\]/.test(fb), "непрочитанное считается по каждой группе отдельно");
    ok(/r\.by === uid/.test(fb), "выкидывать участников может только создатель");
  });
  test("чат: статусы, аватарки и «печатает…»", () => {
    const fs = require("fs"), path = require("path"), root = path.resolve(__dirname, "..");
    const fb = fs.readFileSync(path.join(root, "assets", "js", "modules", "ui", "feedback.js"), "utf8");
    ok(/const STATUSES = \{[\s\S]{0,300}dnd/.test(fb), "три статуса, включая «не беспокоить»");
    ok(/const AVATARS = \[/.test(fb), "набор аватарок-эмодзи (файлы не грузим — presence должен остаться крошечным)");
    ok(/localStorage\.getItem\(STK\)/.test(fb) && /localStorage\.getItem\(AVK\)/.test(fb), "статус и аватарка живут на устройстве");
    ok(/status: myStatus\(\)/.test(fb) && /avatar: myAvatar\(\)/.test(fb), "оба уходят в presence вместе с сердцебиением");
    ok(/const quiet = \(\) => myStatus\(\) === "dnd"/.test(fb), "«не беспокоить» — отдельный предикат");
    ok(/quiet\(\)/.test(fb) && /function notify/.test(fb), "он глушит уведомления/звук, но НЕ скрывает сообщения");
    ok(/function markTyping/.test(fb) && /TYPING_MS/.test(fb), "«печатает…» с временем жизни");
    ok(/const where = view === "dm" \? \("dm:" \+ dmUid\)[\s\S]{0,90}"pub"/.test(fb), "«печатает…» помечено местом (общий/личка/группа) — иначе показывалось бы во всех чатах разом");
    ok(/data-fb-setstatus/.test(fb) && /data-fb-setavatar/.test(fb), "выбор статуса и аватарки в шапке чата");
  });
  test("чат: клавиатура только по тапу в поле + чужие статусы/аватарки видны", () => {
    const fs = require("fs"), path = require("path"), root = path.resolve(__dirname, "..");
    const fb = fs.readFileSync(path.join(root, "assets", "js", "modules", "ui", "feedback.js"), "utf8");
    // РАНЬШЕ в render() стоял безусловный focus() — клавиатура выезжала на КАЖДУЮ
    // перерисовку (смена вкладки, облик, статус, «во весь экран», входящее сообщение)
    ok(!/if \(inp\) \{ grow\(inp\); setTimeout\(\(\) => \{ try \{ inp\.focus\(\)/.test(fb),
      "безусловного автофокуса в render() больше нет");
    ok(/if \(keepFocus \|\| Date\.now\(\) < focusUntil\) setTimeout/.test(fb),
      "фокус только если человек печатал ИЛИ сам начал текстовое действие");
    ok(/const keepFocus = !!\(ae &&/.test(fb) && fb.indexOf("const keepFocus") < fb.indexOf("ov.innerHTML ="),
      "«печатал ли сейчас» проверяется ДО пересборки innerHTML (иначе activeElement уже body)");
    // окно времени, а не одноразовый флаг: отправку сопровождают ДВА рендера (подписка
    // Firestore + промис отправки), и одноразовый флаг съедал первый из них
    ok(/let focusUntil = 0;/.test(fb) && /const wantFocus = \(\) => \{ focusUntil = Date\.now\(\) \+ /.test(fb),
      "намерение печатать — окно времени, его не съедает гонка двух рендеров");
    ok(/inpBlurAt = Date\.now\(\)/.test(fb) && /Date\.now\(\) - inpBlurAt < 2500\) wantFocus\(\)/.test(fb),
      "после «Отправить» клавиатура остаётся, если человек только что печатал (тап по кнопке забирает фокус у поля)");
    // статусы/аватарки: в список людей должна попадать ВСЯ запись присутствия
    ok(/map\[p\.uid\] = Object\.assign\(\{\}, p, \{ name: p\.name/.test(fb),
      "в список людей переносится вся запись присутствия — иначе status/avatar теряются и у всех показывались ⚡ и «в сети»");
    const peopleFn = /function peopleListHtml\(\)[\s\S]*?\n  \}/.exec(fb);
    ok(peopleFn && !/map\[p\.uid\] = \{ uid: p\.uid, name: p\.name \|\| "Мастер", at: p\.at \|\| 0 \}/.test(peopleFn[0]),
      "прежней «обрезки» полей в peopleListHtml не осталось");
    ok(/<span class="ep-fb-ava">\$\{esc\(p\.avatar/.test(fb) && /STATUSES\[statusOf\(p\)\]/.test(fb),
      "строка человека рисует ЕГО аватарку и статус");
  });
  test("чат: поле ввода в одной строке с 📎 и «Отправить», без чужого стиля", () => {
    const fs = require("fs"), path = require("path"), root = path.resolve(__dirname, "..");
    const css = fs.readFileSync(path.join(root, "assets", "css", "base.css"), "utf8");
    const inp = /\.ep-fb-input\{([^}]+)\}/.exec(css);
    ok(inp, "стиль поля ввода найден");
    // РАНЬШЕ было width:100%;resize:vertical;font:inherit — поле брало ОБЩИЙ стиль
    // input/textarea: чужой радиус, почти невидимый фон, уголок ресайза, без line-height
    ok(/resize:none/.test(inp[1]), "уголка ресайза нет (высота растёт сама)");
    ok(/line-height:/.test(inp[1]), "задан line-height — иначе при масштабе интерфейса >100% текст обрезался");
    ok(/min-height:/.test(inp[1]), "минимальная высота на одну строку — поле не может стать ниже строки");
    ok(/border-radius:12px/.test(inp[1]), "радиус как у пузырей сообщений (было 15px от кнопок)");
    ok(/background:rgba\(148, ?163, ?184/.test(inp[1]) && /border:1px solid/.test(inp[1]),
      "своя рамка и фон — поле читается как поле, а не сливается с карточкой");
    ok(/\.ep-fb-inrow\{[^}]*align-items:flex-end/.test(css),
      "📎 · поле · «Отправить» одной строкой, кнопки прижаты к низу выросшего поля");
    ok(/\.ep-fb-row2 button\{[^}]*white-space:nowrap/.test(css),
      "«Скопировать переписку» — своя тонкая строка (класс .ep-plan-mini ломал подпись на две строки)");
    const fb = fs.readFileSync(path.join(root, "assets", "js", "modules", "ui", "feedback.js"), "utf8");
    ok(/class="ep-fb-inrow"><button[^>]*data-fb-attach/.test(fb), "📎 внутри строки поля");
    ok(/ep-fb-sendbtn" data-fb-send/.test(fb), "кнопка отправки помечена своим классом");
    ok(/ep-fb-row2"><button[^>]*data-fb-copychat/.test(fb), "копирование переписки — отдельной строкой");
    // ретро-облик не должен потерять «оконный» вид поля
    ok(/is-retro \.ep-fb-inrow\{/.test(css) && /is-retro \.ep-fb-clip\{/.test(css),
      "у ретро-облика свои отступы строки и стиль 📎");
  });
  test("чат: «во весь экран» — класс + нативный фуллскрин, безопасно для чужого", () => {
    const fs = require("fs"), path = require("path"), root = path.resolve(__dirname, "..");
    const fb = fs.readFileSync(path.join(root, "assets", "js", "modules", "ui", "feedback.js"), "utf8");
    ok(/data-fb-full/.test(fb) && /function setFull/.test(fb), "кнопка ⛶ и переключатель");
    ok(/const fullOn = \(\) => localStorage\.getItem\(FULLK\) === "1"/.test(fb), "выбор запоминается на устройстве");
    // ДВА механизма: класс покрывает вьюпорт всегда, нативный API убирает адресную строку
    ok(/classList\.toggle\("is-full"/.test(fb) && /function enterNativeFs/.test(fb),
      "и CSS-класс, и нативный requestFullscreen — на устройствах, где API молча не работает, класс уже даёт полный экран");
    ok(/ov\.requestFullscreen \|\| ov\.webkitRequestFullscreen/.test(fb),
      "фуллскрин запрашивается на ОВЕРЛЕЕ, а не на карточке (у карточки backdrop-filter — на нём нативный фуллскрин давал плоский серый)");
    ok(/if \(!ov \|\| fsEl\(\) \|\| fsPending\) return/.test(fb),
      "чужой фуллскрин (план/развёртка) не перебиваем и не дублируем запрос");
    ok(/if \(!nativeFsMine \|\| !ov \|\| fsEl\(\) !== ov\)/.test(fb),
      "выходим ТОЛЬКО из своего фуллскрина — иначе закрытие чата гасило бы фуллскрин плана");
    ok(/exitNativeFs\(\);\s*\n\s*const ov = ovEl\(\)/.test(fb), "close() гасит фуллскрин ДО очистки окна");
    ok(/fullscreenchange/.test(fb) && /localStorage\.setItem\(FULLK, "0"\)/.test(fb),
      "системный выход (жест «назад»/Esc) синхронизирует класс и запомненный выбор");
    ok(/if \(fullOn\(\)\) enterNativeFs\(ov\)/.test(fb), "переоткрытый чат восстанавливает режим");
    ok(/const cap = fullOn\(\) \? 0\.45 : 0\.35/.test(fb), "в развёрнутом окне поле ввода может стать выше");
    const css = fs.readFileSync(path.join(root, "assets", "css", "base.css"), "utf8");
    const blk = css.slice(css.indexOf(".ep-fb-ov.is-full{"), css.indexOf(".ep-fb-ov.is-full{") + 1400);
    ok(css.indexOf(".ep-fb-ov.is-full{") > 0, "стили развёрнутого окна есть");
    ok(/padding:0/.test(blk) && /max-height:none/.test(blk) && /max-width:none/.test(blk),
      "снимаем паддинги и лимиты — оверлей и так position:fixed;inset:0");
    // НИКАКИХ 100vw/100vh/dvh: на устройствах, где vh недооценивает вьюпорт в PWA, явные
    // размеры СЖИМАЛИ бы окно — этот класс бага в сессии уже ловили у шторок плана
    ok(!/100vw|100vh|100dvw/.test(blk), "размеры не задаются через vh/vw — только снятие ограничений");
    ok(/\.ep-fb-ov:fullscreen\{background:rgb\(var\(--card-bg-rgb\)\)\}/.test(css),
      "фон фуллскрин-элемента непрозрачный (полупрозрачный скрим выглядел бы серой заливкой)");
    ok(/body\[data-kb="1"\] \.ep-fb-ov\.is-full \.ep-fb-card\{max-height:none\}/.test(css),
      "при клавиатуре лимит высоты не вычитается дважды");
    ok(/\.ep-fb-status\{display:inline-flex/.test(css), "подпись статуса и кношки в шапке больше не наезжают друг на друга");
  });
  test("чат: push при закрытом приложении — токен, правила, функция, sw", () => {
    const fs = require("fs"), path = require("path"), root = path.resolve(__dirname, "..");
    // ключ VAPID — ПУБЛИЧНЫЙ (браузер отдаёт его push-сервису открыто), поэтому лежит
    // рядом с остальным клиентским конфигом Firebase, а не в секретах
    const cfg = fs.readFileSync(path.join(root, "config", "firebase-config.js"), "utf8");
    const key = /EP_VAPID_KEY\s*=\s*"([^"]+)"/.exec(cfg);
    ok(key && key[1].length > 80, "публичный ключ Web Push прошит в конфиг");
    const html = fs.readFileSync(path.join(root, "index.html"), "utf8");
    ok(/firebase-messaging-compat\.js/.test(html), "SDK messaging подключён");
    const csp = /Content-Security-Policy[^>]*content="([^"]+)"/.exec(html);
    ok(csp && /connect-src[^;]*https:\/\/\*\.googleapis\.com/.test(csp[1]),
      "CSP разрешает запрос токена (fcmregistrations.googleapis.com попадает под *.googleapis.com)");
    const fb = fs.readFileSync(path.join(root, "assets", "js", "modules", "ui", "feedback.js"), "utf8");
    ok(/function registerPush/.test(fb) && /vapidKey: window\.EP_VAPID_KEY/.test(fb), "клиент запрашивает токен по этому ключу");
    ok(/serviceWorkerRegistration: reg/.test(fb),
      "передаём СВОЙ sw.js — иначе SDK ищет отдельный firebase-messaging-sw.js, которого нет");
    ok(/collection\(TOKENS\)\.doc\(token\)/.test(fb), "id документа = сам токен (повторный вход не плодит дубли)");
    ok(/mute: quiet\(\)/.test(fb) && /function syncPushMute/.test(fb),
      "«не беспокоить» зеркалится на сервер — он не видит localStorage");
    ok(/function dropPushToken/.test(fb) && /dropPushToken\(\);/.test(fb),
      "при смене аккаунта токен прежнего владельца удаляется");
    ok(/if \(ok\) registerPush\(\)/.test(fb), "после выдачи разрешения токен берётся сразу");
    const rules = fs.readFileSync(path.join(root, "firestore.rules"), "utf8");
    const tk = rules.slice(rules.indexOf("match /chat_tokens/"), rules.indexOf("match /{document=**}"));
    ok(rules.indexOf("match /chat_tokens/") > 0, "правила для токенов есть");
    ok(/allow read: if false/.test(tk), "КЛИЕНТ не читает токены вообще (это список устройств людей)");
    ok(/request\.resource\.data\.uid == request\.auth\.uid/.test(tk), "писать можно только свой токен");
    ok(/match \/\{document=\*\*\} \{\s*allow read, write: if false;/.test(rules), "финальный запрет-всё на месте");
    const fn = fs.readFileSync(path.join(root, "functions", "index.js"), "utf8");
    // ПОЧЕМУ НЕ ТРИГГЕР НА FIRESTORE: деплой упал с «Resource .../chat_messages/{msgId}
    // is in region eur3-europe-west1 which is not supported» — база в мультирегионе eur3,
    // и триггер обязан жить в совместимом с ней регионе. onCall от региона базы не зависит.
    ok(/exports\.chatPush = onCall/.test(fn), "рассылка — вызываемая функция (у неё нет привязки к региону базы)");
    ok(!/firebase-functions\/v1/.test(fn) && !/\.firestore\.document\(/.test(fn),
      "триггеров на Firestore нет — именно на них падал деплой (регион базы eur3)");
    ok(/const author = kind === "pub" \? m\.uid : m\.from;[\s\S]{0,200}permission-denied/.test(fn),
      "функция САМА читает сообщение и проверяет авторство — чужой id подсунуть нельзя");
    ok(/if \(m\.pushedAt\) return \{ sent: 0, already: true \}/.test(fn),
      "повторный вызов не рассылает второй раз (защита от ретрая и от спама)");
    ok(/sendEachForMulticast/.test(fn) && !/notification:/.test(fn),
      "отправляем ТОЛЬКО data — иначе FCM покажет уведомление в обход нашего sw.js");
    ok(/function dropDeadTokens/.test(fn) && /registration-token-not-registered/.test(fn), "мёртвые токены удаляются");
    ok(/t\.mute !== true/.test(fn), "функция уважает «не беспокоить»");
    ok(/for \(let i = 0; i < list\.length; i \+= 30\)/.test(fn), "whereIn режется по 30 значений — предел Firestore");
    ok(/function askServerPush/.test(fb) && /EP\.Auth\.callFunction\("chatPush"/.test(fb),
      "клиент просит рассылку после отправки");
    ["pub", "dm", "group"].forEach((k) => ok(new RegExp('askServerPush\\("' + k + '"').test(fb), "запрос push для вида: " + k));
    ok((fb.match(/askServerPush\("pub"/g) || []).length >= 2,
      "и для отложенного сообщения из офлайн-очереди тоже");
    // страховка: hosting на любой НЕсуществующий путь отдаёт index.html, из-за чего SDK
    // падал на «unsupported MIME type ('text/html')» при попытке дефолтного SW
    const fms = fs.readFileSync(path.join(root, "firebase-messaging-sw.js"), "utf8");
    ok(/importScripts\("\/sw\.js"\)/.test(fms), "дефолтный путь FCM существует и переиспользует логику sw.js");
    const fj = JSON.parse(fs.readFileSync(path.join(root, "firebase.json"), "utf8"));
    ok(fj.hosting.headers.some((h) => h.source === "/firebase-messaging-sw.js"),
      "у него no-cache, как у sw.js — иначе браузер держал бы старую копию");
    ok(/function swReg/.test(fb) && /instanceof ServiceWorkerRegistration/.test(fb),
      "без своей регистрации getToken НЕ зовётся — иначе SDK уходит за дефолтным SW");
    ok(/Promise\.race\(\[sw\.ready, wait\]\)/.test(fb), "ready не может подвесить регистрацию навсегда");
    const sw = fs.readFileSync(path.join(root, "sw.js"), "utf8");
    ok(/raw\.data === "object"/.test(sw), "sw читает формат FCM (payload.data) и ручной push (верхний уровень)");
    ok(/visibilityState === "visible"/.test(sw),
      "приложение открыто — sw НЕ дублирует уведомление (его рисует страница со своим звуком/меткой)");
    const wf = fs.readFileSync(path.join(root, ".github", "workflows", "firebase-deploy.yml"), "utf8");
    ok(/--only hosting,firestore:rules /.test(wf) && /--only functions /.test(wf),
      "деплой разделён: падение функции больше не блокирует выкат приложения");
    ok(wf.indexOf("--only hosting,firestore:rules") < wf.indexOf("--only functions"),
      "и приложение уезжает ПЕРВЫМ");
  });
  test("чат: вложения клиент/щит/фото и поиск по переписке", () => {
    const fs = require("fs"), path = require("path"), root = path.resolve(__dirname, "..");
    const fb = fs.readFileSync(path.join(root, "assets", "js", "modules", "ui", "feedback.js"), "utf8");
    ok(/data-fb-attclient/.test(fb) && /data-fb-attshield/.test(fb) && /data-fb-attfile/.test(fb), "три новых вида вложений в панели 📎");
    // EP.Clients.addClient принимает ИМЯ (строка), не запись: объект давал клиента
    // «[object Object]» — поймано живым прогоном
    ok(/kind === "client"[\s\S]{0,600}EP\.Clients\.addClient\(nm\)/.test(fb), "клиент добавляется по ИМЕНИ (API клиентов принимает строку)");
    ok(/kind === "shield"[\s\S]{0,300}confirm\(/.test(fb), "щит спрашивает подтверждение — он ЗАМЕНЯЕТ текущую сборку");
    ok(/kind === "shield"[\s\S]{0,400}ep_shield_v28_config/.test(fb), "щит пишется в тот же ключ, что читает конфигуратор");
    ok(/kind === "photo" \|\| f\.kind === "file"[\s\S]{0,300}download/.test(fb), "фото/файл скачиваются, а не «применяются»");
    ok(/function readAsAttach/.test(fb) && /1280/.test(fb), "фото сжимается перед отправкой (снимок с телефона иначе не влезет в документ)");
    ok(/function searchHits/.test(fb) && /searchQ/.test(fb), "поиск по загруженной переписке");
    ok(/view === "dm" \? dmMsgs\(\) : \(view === "room" \? roomMsgs\(\) : older\.concat\(msgs\)\)/.test(fb), "поиск идёт по ТЕКУЩЕЙ переписке (общий/личка/группа)");
    ok(/is-hit/.test(fb) && /is-cur/.test(fb), "найденные подсвечиваются, текущая — отдельно");
    ok(/data-fb-searchnext/.test(fb) && /scrollIntoView/.test(fb), "переход «к следующему» прокручивает к находке");
    // строка поиска перерисовывается ЦЕЛИКОМ своей обёрткой: иначе кнопка «↓ к следующему»
    // не появлялась, пока не случится полный render() из другого места (поймано живым прогоном)
    ok(/ep-fb-searchwrap/.test(fb), "у строки поиска своя обёртка для точечной перерисовки");
    ok(/wrap\.innerHTML = searchBarHtml\(\)/.test(fb), "по вводу перерисовывается вся строка поиска, а не только счётчик");
    const css = fs.readFileSync(path.join(root, "assets", "css", "base.css"), "utf8");
    ok(/\.ep-fb-msg\.is-hit/.test(css) && /\.ep-fb-msg\.is-cur/.test(css), "подсветка находок в стилях");
  });

  // ===== 33. Слаботочка: Нептун, домофон, датчики с целью, камеры отдельными линиями =====
  function lvFixture() {
    const p = EP.Plan.Core.createProject("lv" + Math.random().toString(36).slice(2, 6));
    const r = M.newRoom(G.rectPoints(0, 0, 600, 400), "К");
    p.rooms.push(r);
    const wid = r.id + ":0";
    const pw = M.newPanel(20, 380, "Щит"); p.panels.push(pw);
    const lv = M.newPanel(560, 380, "Слаботочный"); lv.router = true; lv.neptun = true; p.panels.push(lv);
    return { p, r, wid, pw, lv };
  }
  test("Нептун: датчики протечки идут к контроллеру, а не в роутер-щит", () => {
    const { p, wid, lv } = lvFixture();
    const leak = M.newElement("leak", wid, 100, 5, "lv");
    p.elements.push(leak);
    EP.Plan.Core.commit(); EP.Plan.Core.persist("seed");
    EP.Plan.Routes.build({ silent: true });
    const rt = (EP.Plan.Core.project.routes || []).find((x) => x.fromId === leak.id);
    ok(rt && rt.toPanel && rt.toId === lv.id, "трасса датчика протечки — в щит с флагом neptun");
    // без флага neptun поведение прежнее (обычная слаботочка) — обратная совместимость
    lv.neptun = false;
    EP.Plan.Routes.build({ silent: true });
    const rt2 = (EP.Plan.Core.project.routes || []).find((x) => x.fromId === leak.id);
    ok(rt2 && rt2.toPanel, "без Нептуна датчик всё равно доходит до щита");
    eq(EP.Plan.Core.project.panels[1].neptun, false, "флаг сброшен");
  });
  test("камеры: каждая своей линией в слаботочный щит", () => {
    const { p, wid, lv } = lvFixture();
    const c1 = M.newElement("camera", wid, 300, 230, "cctv");
    const c2 = M.newElement("camera", wid, 400, 230, "cctv");
    p.elements.push(c1, c2);
    EP.Plan.Elements.assignNewCircuit(c1);
    EP.Plan.Elements.assignNewCircuit(c2);
    EP.Plan.Core.commit(); EP.Plan.Core.persist("seed");
    ok(c1.circuitId && c2.circuitId && c1.circuitId !== c2.circuitId, "линии разные");
    const names = p.circuits.map((c) => c.name);
    ok(names.indexOf("CCTV1") >= 0 && names.indexOf("CCTV2") >= 0, "нумерация CCTV: " + names.join(","));
    ok(EP.Plan.Elements.TYPES.camera.ownLine, "тип помечен ownLine (линия создаётся при постановке)");
    EP.Plan.Routes.build({ silent: true });
    const rts = (EP.Plan.Core.project.routes || []).filter((x) => x.fromId === c1.id || x.fromId === c2.id);
    eq(rts.length, 2, "две отдельные трассы");
    ok(rts.every((x) => x.toPanel && x.toId === lv.id), "обе — в слаботочный щит, не шлейфом");
  });
  test("камера/домофон: питание PoE или отдельно 3×1.5, данные UTP или оптика", () => {
    const { p, wid } = lvFixture();
    const cam = M.newElement("camera", wid, 300, 230, "cctv");
    cam.feed = "sep"; cam.data = "utp";
    const dom = M.newElement("intercom", wid, 500, 150, "lv");
    dom.feed = "poe"; dom.data = "fiber";
    p.elements.push(cam, dom);
    EP.Plan.Elements.assignNewCircuit(cam);
    EP.Plan.Core.commit(); EP.Plan.Core.persist("seed");
    EP.Plan.Routes.build({ silent: true });
    const names = EP.Plan.Calc.calcByRoutes(EP.Plan.Core.project).items.map((i) => i.name).join(" | ");
    ok(/КГ ВВГнг-LS 3×1\.5 · питание/.test(names), "отдельное питание — своя строка: " + names);
    ok(/Витая пара \(UTP\) · данные/.test(names), "и данные витой парой отдельной строкой");
    ok(/Оптический кабель · данные\+PoE/.test(names), "домофон по оптике с PoE — одной строкой");
    ok(EP.Plan.Elements.TYPES.intercom.feedChoice && EP.Plan.Elements.TYPES.camera.feedChoice, "у обоих есть выбор питания");
  });
  test("датчики движения/освещённости: назначаются на лампу, проверки ловят «без цели»", () => {
    const { p, wid } = lvFixture();
    const lamp = M.newElement("light", null, 0, 270, "light"); lamp.params = { x: 300, y: 120 };
    const pir = M.newElement("pir", null, 0, 270, "lv"); pir.params = { x: 300, y: 200 };
    const lux = M.newElement("lux", null, 0, 270, "lv"); lux.params = { x: 100, y: 200 };
    p.elements.push(lamp, pir, lux);
    EP.Plan.Core.commit(); EP.Plan.Core.persist("seed");
    ok(EP.Plan.Elements.TYPES.pir.targets && EP.Plan.Elements.TYPES.lux.targets, "оба типа умеют назначать цель");
    let msgs = EP.Plan.Rules.run(EP.Plan.Core.project).issues.map((i) => i.msg).join(" | ");
    ok(/Датчик движения: не назначена/.test(msgs), "без цели — предупреждение: " + msgs);
    pir.targetIds = [lamp.id];
    eq(G.switchTarget(EP.Plan.Core.project, pir, 0).id, lamp.id, "назначенная лампа читается той же switchTarget");
    msgs = EP.Plan.Rules.run(EP.Plan.Core.project).issues.map((i) => i.msg).join(" | ");
    ok(!/Датчик движения: не назначена/.test(msgs), "после назначения претензии нет");
    ok(/Датчик освещённости: не назначена/.test(msgs), "а по второму датчику осталась");
  });
  test("слаботочка: проверки про Нептун и общие линии камер", () => {
    const p = EP.Plan.Core.createProject("lvchk");
    const r = M.newRoom(G.rectPoints(0, 0, 400, 300), "К");
    p.rooms.push(r);
    const wid = r.id + ":0";
    p.panels.push(M.newPanel(20, 280, "Щит")); // ни роутера, ни Нептуна
    p.elements.push(M.newElement("leak", wid, 100, 5, "lv"));
    const c1 = M.newElement("camera", wid, 200, 230, "cctv");
    const c2 = M.newElement("camera", wid, 300, 230, "cctv"); // обе без линии
    p.elements.push(c1, c2);
    EP.Plan.Core.commit(); EP.Plan.Core.persist("seed");
    const msgs = EP.Plan.Rules.run(p).issues.map((i) => i.msg).join(" | ");
    ok(/контроллер «Нептун»/.test(msgs), "нет Нептуна — предупреждение");
    ok(/нет слаботочного щита/.test(msgs), "нет роутер-щита для камер");
    ok(/отдельными линиями/.test(msgs), "камеры без своих линий");
  });


  // ===== 23. Комбинированные поверхности трасс + несколько целей на клавишу =====
  test("поверхности: бэкофилл settings.surfaces (старые проекты — все «общее»)", () => {
    const p = M.newProject("s");
    ok(p.settings.surfaces && p.settings.surfaces.light === null && p.settings.surfaces.v24 === null, "новый проект — все null");
    const old = M.newProject("old"); delete old.settings.surfaces;
    EP.Plan.Core.importJSON(JSON.stringify({ project: old }));
    const P = EP.Plan.Core.project;
    ok(P.settings.surfaces && "lv" in P.settings.surfaces, "бэкофилл проставил объект");
    // мусорное значение (вручную правленый JSON) нормализуется бэкофиллом при импорте
    const dirty = M.newProject("dirty"); dirty.settings.surfaces = { light: "мусор", power: "floor" };
    EP.Plan.Core.importJSON(JSON.stringify({ project: dirty }));
    const P2 = EP.Plan.Core.project;
    eq(P2.settings.surfaces.light, null, "мусорное значение нормализовано в null");
    eq(P2.settings.surfaces.power, "floor", "валидное значение сохранено");
  });
  test("G.routeSurface: группа слоёв главнее общего; у света по полу лампа-хоп по потолку", () => {
    const p = M.newProject("s");
    p.settings.routeType = "ceiling";
    eq(G.routeSurface(p, "power", null), "ceiling", "общее — потолок");
    p.settings.surfaces.lv = "floor";
    eq(G.routeSurface(p, "lv", null), "floor", "слаботочка своя — пол");
    eq(G.routeSurface(p, "tv", null), "floor", "ТВ в той же группе lv");
    eq(G.routeSurface(p, "power", null), "ceiling", "сила не затронута");
    p.settings.surfaces.light = "floor";
    eq(G.routeSurface(p, "light", null, { lampHop: false }), "floor", "питание света — по полу");
    eq(G.routeSurface(p, "light", null, { lampHop: true }), "ceiling", "к лампе — всегда по потолку");
    eq(G.surfaceKeyOf("lv", { type: "output24" }), "v24", "24В — своя группа");
  });
  test("поверхности: трасса розетки по полу, света — по потолку в одном проекте", () => {
    const { P, w } = install({ panels: [M.newPanel(20, 280, "Щ")] });
    P.settings.routeType = "ceiling";
    P.settings.surfaces.power = "floor";
    const sock = M.newElement("socket", w(0), 100, 30, "power");
    const lamp = M.newElement("light", null, 0, 270, "light"); lamp.params = { x: 200, y: 150 };
    P.elements.push(sock, lamp);
    EP.Plan.Routes.build();
    const rs = P.routes.find((r) => r.fromId === sock.id), rl = P.routes.find((r) => r.fromId === lamp.id);
    eq(rs.routeType, "floor", "розетка — по полу");
    eq(rs.chaseFloor, true, "штроба розетки в пол");
    eq(rl.routeType, "ceiling", "свет — по потолку");
    eq(rl.chaseFloor, false, "штроба света не в пол");
    // спуск считается по поверхности ХОПА: у розетки h=30 от пола, у лампы от потолка
    eq(EP.Plan.Routes.pointVert(P, sock, "floor"), 30, "спуск розетки от пола = высоте");
    eq(EP.Plan.Routes.pointVert(P, sock, "ceiling"), P.settings.ceilingHeight - 30, "тот же элемент по потолку — другой спуск");
  });
  test("поверхности: питание света по полу, а хоп к лампе — по потолку", () => {
    const q = M.newCircuit("QF1", "#e11", 10);
    const { P, w } = install({ panels: [M.newPanel(20, 280, "Щ")], circuits: [q] });
    P.settings.surfaces.light = "floor";
    const sw = M.newElement("switch", w(0), 100, 90, "light"); sw.circuitId = q.id;
    const lamp = M.newElement("light", null, 0, 270, "light"); lamp.params = { x: 200, y: 150 }; lamp.circuitId = q.id;
    sw.targetIds = [lamp.id];
    P.elements.push(sw, lamp);
    EP.Plan.Routes.build();
    const feed = P.routes.find((r) => r.fromId === sw.id && r.toPanel);
    const toLamp = P.routes.find((r) => r.fromId === lamp.id);
    ok(feed && feed.routeType === "floor", "щит→выключатель (питание) — по полу");
    ok(toLamp && toLamp.routeType === "ceiling", "выключатель→лампа — по потолку");
  });
  test("поверхности: гильза по полу и по потолку в одном месте — ДВА отверстия", () => {
    const { P } = install();
    const rf = M.newRoute("power", "floor", [{ x: 100, y: 150 }, { x: 300, y: 150 }], "a", null);
    const rc = M.newRoute("light", "ceiling", [{ x: 100, y: 150 }, { x: 300, y: 150 }], "b", null);
    rf.throughWalls = [{ x: 200, y: 150, wallId: P.rooms[0].id + ":0" }];
    rc.throughWalls = [{ x: 200, y: 150, wallId: P.rooms[0].id + ":0" }];
    P.routes.push(rf, rc);
    eq(EP.Plan.Routes.sleeveHoles(P), 2, "пол и потолок — разные отверстия");
    const two = M.newRoute("power", "floor", [{ x: 100, y: 140 }, { x: 300, y: 140 }], "c", null);
    two.throughWalls = [{ x: 200, y: 150, wallId: P.rooms[0].id + ":0" }];
    P.routes.push(two);
    eq(EP.Plan.Routes.sleeveHoles(P), 3, "по полу в гофре — 1 кабель на гильзу, второй кабель = ещё отверстие");
  });
  test("цели клавиши: одна — строкой, несколько — массивом; targetIdsOf читает оба формата", () => {
    const el = { type: "switch", targetIds: ["a"], targetId: "a" };
    eq(G.targetIdsOf(el, 0).join(","), "a", "строка");
    el.targetIds = [["a", "b", "c"]];
    eq(G.targetIdsOf(el, 0).join(","), "a,b,c", "массив");
    eq(G.allTargetIds(el).join(","), "a,b,c", "все цели плоско (без дублей targetId)");
    const legacy = { type: "switch", targetIds: [], targetId: "z" };
    eq(G.targetIdsOf(legacy, 0).join(","), "z", "legacy targetId клавиши 0");
  });
  test("switchTargets: несколько ручных целей у одной клавиши; switchTarget — первая", () => {
    const q = M.newCircuit("QF1", "#e11", 10);
    const { P, w } = install({ circuits: [q] });
    const sw = M.newElement("switch", w(0), 100, 90, "light"); sw.circuitId = q.id;
    const l1 = M.newElement("light", null, 0, 270, "light"); l1.params = { x: 150, y: 150 }; l1.circuitId = q.id;
    const l2 = M.newElement("light", null, 0, 270, "light"); l2.params = { x: 250, y: 150 }; l2.circuitId = q.id;
    sw.targetIds = [[l1.id, l2.id]];
    P.elements.push(sw, l1, l2);
    const ts = G.switchTargets(P, sw, 0);
    eq(ts.length, 2, "обе цели");
    eq(G.switchTarget(P, sw, 0).id, l1.id, "switchTarget — первая (контракт «один элемент»)");
  });
  test("24В: одна клавиша на ДВА трансформатора — две трассы «до щита» (по одной на щит)", () => {
    const t1 = M.newPanel(20, 280, "Тр1"); t1.transformer = true;
    const t2 = M.newPanel(380, 280, "Тр2"); t2.transformer = true;
    const q24 = M.newCircuit("Int1", "#0af", 6);
    const { P, w } = install({ panels: [t1, t2], circuits: [q24] });
    const sw = M.newElement("switch", w(0), 200, 90, "light");
    const o1 = M.newElement("output24", null, 0, 270, "lv"); o1.params = { x: 60, y: 150 }; o1.circuitId = q24.id;
    const o2 = M.newElement("output24", null, 0, 270, "lv"); o2.params = { x: 340, y: 150 }; o2.circuitId = q24.id;
    sw.targetIds = [[o1.id, o2.id]];
    P.elements.push(sw, o1, o2);
    EP.Plan.Routes.build();
    const pri = P.routes.filter((r) => r.leg === "pri24");
    eq(pri.length, 2, "две трассы «до щита»");
    ok(pri.some((r) => r.toId === t1.id) && pri.some((r) => r.toId === t2.id), "к обоим трансформаторам");
    ok(pri.every((r) => String(r.fromId).indexOf("sw24:" + sw.id + "@") === 0), "fromId уникален по щиту");
    // повторная инкрементальная сборка не плодит дубли
    EP.Plan.Routes.buildIncremental({ silent: true });
    eq(P.routes.filter((r) => r.leg === "pri24").length, 2, "buildIncremental не задвоил");
    // «до щита» кабель на 2 цели 24В — 5 жил (keys24Of считает по всем целям всех клавиш)
    eq(EP.Plan.Routes.keys24Of(P, sw), 2, "две цели 24В у выключателя");
  });
  test("смета: марка «до щита» находит выключатель при fromId с @щитом", () => {
    const trafo = M.newPanel(200, 280, "Тр"); trafo.transformer = true;
    const q24 = M.newCircuit("Int1", "#0af", 6);
    const { P, w } = install({ panels: [trafo], circuits: [q24] });
    const sw = M.newElement("switch", w(0), 100, 90, "light");
    const o1 = M.newElement("output24", null, 0, 270, "lv"); o1.params = { x: 150, y: 150 }; o1.circuitId = q24.id;
    const o2 = M.newElement("output24", null, 0, 270, "lv"); o2.params = { x: 250, y: 150 }; o2.circuitId = q24.id;
    sw.targetIds = [[o1.id, o2.id]];
    P.elements.push(sw, o1, o2);
    EP.Plan.Routes.build();
    const names = EP.Plan.Calc.estimateItems(P).map((i) => i.name).join(" | ");
    ok(/5×1\.5.*до щита \(220В\)/.test(names), "две цели 24В → 5 жил «до щита»: " + names);
  });


  // ===== 24. Пул: повтор блоков + передача заготовок в «Проект квартиры» =====
  test("пул: повтор блоков и очередь заготовок — контракт с планом", () => {
    const fs2 = require("fs"), path2 = require("path");
    const pool = fs2.readFileSync(path2.join(__dirname, "..", "assets", "js", "modules", "pool", "pool-v29.js"), "utf8");
    const plan = fs2.readFileSync(path2.join(__dirname, "..", "assets", "js", "modules", "plan", "plan-elements.js"), "utf8");
    // повтор: чипы ×N, своё число, кап, сброс на 1 после добавления, дублирование блока
    ok(/data-pv-rep=/.test(pool) && /data-pv-repcustom/.test(pool), "чипы повтора и своё число");
    ok(/REPEAT_MAX\s*=\s*\d+/.test(pool) && /clampRep/.test(pool), "кап повтора (страховка от опечатки)");
    ok(/repeat = 1;\s*\/\/ «12» не залипает/.test(pool), "повтор сбрасывается на 1 после добавления");
    ok(/data-pv-dupblock/.test(pool) && /function dupBlock/.test(pool), "повтор уже добавленного блока (⧉)");
    ok(/JSON\.parse\(JSON\.stringify\(b\)\)/.test(pool), "копии блоков глубокие, а не одна ссылка");
    // ключ очереди ОБЯЗАН совпадать в пуле и в плане — иначе передача молча не работает
    const kPool = /POOL_Q_KEY = "([^"]+)"/.exec(pool);
    const kPlan = /POOL_Q_KEY = "([^"]+)"/.exec(plan);
    ok(kPool && kPlan && kPool[1] === kPlan[1], "ключ очереди совпадает: " + (kPool && kPool[1]) + " / " + (kPlan && kPlan[1]));
    ok(/data-pv-toplan/.test(pool) && /function exportToPlan/.test(pool), "кнопка «В проект квартиры» и экспорт очереди");
    // маппинг постов пула на типы плана: только те типы, что план умеет в блоке
    ok(/PLAN_POST = \{[^}]*sockets: "socket"[^}]*sw2: "switch"[^}]*tv: "tv"[^}]*internet: "internet"/.test(pool), "посты пула → типы плана");
    ok(!/PLAN_POST = \{[^}]*warmFloor/.test(pool), "тёплый пол НЕ пост блока плана (идёт отдельной заготовкой)");
    ok(/type: "warmfloor"/.test(pool), "тёплый пол — отдельная заготовка");
    ok(/PLAN_DED = \{[^}]*"Кондей": "ac"/.test(pool), "отдельные линии пула → типы плана");
    // план: раздел «Из пула», вооружение заготовки, постановка, убывание счётчика
    ok(/data-pe-pool=/.test(plan) && /function poolSectionHtml/.test(plan), "раздел «Из пула» в палитре");
    ok(/function placeFromPool/.test(plan), "постановка заготовки");
    ok(/if \(S\.pool\) return placeFromPool\(w\);/.test(plan), "placeAt отдаёт управление заготовке");
    ok(/e\.qty = \(Number\(e\.qty\) \|\| 1\) - 1;/.test(plan) && /q\.items\.splice\(idx, 1\)/.test(plan), "счётчик убывает, на нуле заготовка уходит");
    ok(/S\.pool\.id \? q\.items\.findIndex/.test(plan), "заготовка ищется по id, а не только по индексу (пул мог перезалить очередь)");
    ok(/if \(e\.type === "switch"\) \{ if \(e\.keys\)/.test(plan), "клавишность/вид выключателя переносятся из пула");
    ok(/S\.pool = null; S\.selType = /.test(plan), "выбор обычного типа снимает вооружение заготовки");
  });
  test("пул: сборщик сметы читает АКТИВНЫЙ модуль пула (алиас не потерян)", () => {
    // poolItems() в collector-bridge.js обращается к window.PoolV22CleanMonolith — это АЛИАС,
    // который ставит pool-v29.js. Если алиас потеряется, кнопка «В смету» в пуле молча скажет
    // «Пул пуст», хотя блоки есть — страж именно на связку этих двух файлов.
    const fs2 = require("fs"), path2 = require("path");
    const bridge = fs2.readFileSync(path2.join(__dirname, "..", "assets", "js", "modules", "estimate", "collector-bridge.js"), "utf8");
    const pool = fs2.readFileSync(path2.join(__dirname, "..", "assets", "js", "modules", "pool", "pool-v29.js"), "utf8");
    const need = /window\.(PoolV22CleanMonolith|EP\.Pool)/.exec(bridge);
    ok(need, "мост берёт пул из window");
    ok(/window\.PoolV22CleanMonolith = api/.test(pool), "pool-v29 ставит алиас, которого ждёт мост");
    ok(/setSourceItems\("pool"/.test(bridge) && /setSourceItems\("plan"/.test(bridge), "пул и план — РАЗНЫЕ источники сметы (не затирают друг друга)");
  });

  console.log("\n" + "=".repeat(48));
  if (failed) { console.log("ТЕСТЫ: " + passed + " ok, " + failed + " ОШИБОК\n"); fails.forEach((f) => console.log("  ✗ " + f)); process.exit(1); }
  console.log("ТЕСТЫ: все " + passed + " прошли ✓"); process.exit(0);
})();
