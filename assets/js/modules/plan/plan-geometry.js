/* Electric Pro V29 — Проект квартиры: геометрия (Слой 1).
   Чистая математика без DOM: стены из точек комнаты, привязки, попадания,
   прямоугольники, зеркало/сдвиг, габариты. Все размеры — сантиметры. */
(() => {
  "use strict";
  window.EP = window.EP || {};
  const G = {};

  // ---- привязка ----
  G.snap = (v, step) => (step > 0 ? Math.round(v / step) * step : v);
  G.snapPoint = (p, step) => ({ x: G.snap(p.x, step), y: G.snap(p.y, step) });
  // sqrt, а НЕ Math.hypot: профиль сборки трасс показал, что на G.dist уходит 32% всего
  // собственного времени модуля — это самый горячий примитив (его зовут рендер, хит-тесты,
  // трассировка, миллионы раз за проход). Math.hypot в V8 медленнее ровно втрое с лишним
  // из-за защиты от переполнения, которая координатам плана в сантиметрах не нужна:
  // значения тут порядка 10²…10⁴, а double переполняется на 10³⁰⁸. Замер: 39 мс против
  // 11 мс на одном и том же наборе, расхождение результата 9e-13 (предел double).
  G.dist = (a, b) => { const dx = a.x - b.x, dy = a.y - b.y; return Math.sqrt(dx * dx + dy * dy); };

  // ---- этажи: view-фильтр проекта на активный этаж (не мутирует project) ----
  // Один проект — одна модель на ВСЕ этажи (общая смета/схема/циркуиты читают
  // p.routes/p.circuits как есть, БЕЗ фильтра — суммируются по всем этажам разом),
  // но рендер/хит-тест/автотрассировка должны видеть только activeFloorId — иначе
  // геометрия разных этажей в одних координатах физически накладывалась бы друг
  // на друга. floorScoped() — ЕДИНАЯ точка этого фильтра: возвращает мелкий клон
  // project с 12 геометрическими массивами, урезанными до активного этажа (те же
  // ссылки на объекты — мутации через них по-прежнему бьют в реальный проект).
  // Для проектов с одним этажом (подавляющее большинство) возвращает project
  // КАК ЕСТЬ, без клонирования — нулевые накладные расходы и 100% обратная
  // совместимость со старыми проектами/тестами.
  // КЭШ обязателен, а не «приятная оптимизация»: floorScoped зовётся из G.roomAt/G.wallAt/
  // G.snapSmart, то есть из САМЫХ горячих путей — на сборке трасс замер дал 124 549 вызовов,
  // и на многоэтажном проекте каждый из них заново фильтровал все 12 массивов. Второй этаж,
  // даже пустой, стоил 2,4× времени трассировки (1003 → 2450 мс на 300 точках), ничего не
  // добавляя к результату. Подпись — activeFloorId + число этажей + длины массивов: состав
  // любого из них меняется только через добавление/удаление, а единственное место, где
  // floorId переписывается у СУЩЕСТВУЮЩЕГО объекта (пара стояка, plan-elements.js), тут же
  // добавляет парный элемент, то есть длину всё равно двигает.
  const fsCache = typeof WeakMap === "function" ? new WeakMap() : null;
  const FS_ARRAYS = ["rooms", "elements", "panels", "beams", "voids", "ledStrips",
    "openings", "routes", "guides", "appliances", "notes", "dims"];
  G.floorScoped = (project) => {
    const floors = project && project.floors;
    if (!floors || floors.length <= 1) return project;
    const fid = project.activeFloorId || floors[0].id;
    let sig = fid + "|" + floors.length;
    for (let i = 0; i < FS_ARRAYS.length; i++) sig += "|" + ((project[FS_ARRAYS[i]] || []).length);
    const hit = fsCache && fsCache.get(project);
    if (hit && hit.sig === sig) return hit.scoped;
    const fid0 = floors[0].id;
    const on = (arr) => (arr || []).filter((x) => (x.floorId || fid0) === fid);
    const scoped = Object.assign({}, project, {
      rooms: on(project.rooms), elements: on(project.elements), panels: on(project.panels),
      beams: on(project.beams), voids: on(project.voids), ledStrips: on(project.ledStrips),
      openings: on(project.openings), routes: on(project.routes), guides: on(project.guides),
      appliances: on(project.appliances), notes: on(project.notes), dims: on(project.dims)
    });
    if (fsCache) fsCache.set(project, { sig, scoped });
    return scoped;
  };

  // Привязка: угол комнаты -> выравнивание по осям чужих углов -> сетка.
  // snapped=true только для угла/оси (значимая привязка) — НЕ для рядового
  // округления по сетке, чтобы вызывающий код мог дать тактильный отклик
  // только на реальный снап, а не на каждый тап.
  G.snapSmart = (project, p, step, cornerRadius) => {
    let best = null, ax = null, ay = null;
    const pr = G.floorScoped(project);
    (pr.rooms || []).forEach((r) => (r.points || []).forEach((c) => {
      const d = G.dist(p, c);
      if (d <= cornerRadius && (!best || d < best.d)) best = { d, x: c.x, y: c.y };
      if (Math.abs(p.x - c.x) <= cornerRadius && (ax == null || Math.abs(p.x - c.x) < Math.abs(p.x - ax))) ax = c.x;
      if (Math.abs(p.y - c.y) <= cornerRadius && (ay == null || Math.abs(p.y - c.y) < Math.abs(p.y - ay))) ay = c.y;
    }));
    if (best) return { x: best.x, y: best.y, snapped: true };
    return { x: ax != null ? ax : G.snap(p.x, step), y: ay != null ? ay : G.snap(p.y, step), snapped: ax != null || ay != null };
  };

  // Автовыравнивание под 90°: если линия от prev почти вертикальна/горизонтальна — доводим
  G.orthoAdjust = (prev, p, ratio) => {
    if (!prev) return p;
    const r = ratio == null ? 0.36 : ratio;
    const dx = Math.abs(p.x - prev.x), dy = Math.abs(p.y - prev.y);
    if (dx <= dy * r) return { x: prev.x, y: p.y };
    if (dy <= dx * r) return { x: p.x, y: prev.y };
    return p;
  };

  // Магнит для тяги ВНУТРЕННЕЙ точки излома трассы (два соседа prev/next): каждый сосед
  // независимо пытается довести СВОЙ отрезок до вертикали/горизонтали (тот же ratio-порог,
  // что и orthoAdjust) — если оба соседа сработали на РАЗНЫЕ оси, результат авто прямой угол
  // (x от prev, y от next или наоборот); если сработал только один — просто выравнивается
  // одна сторона ("иногда полезно", не жёсткий constraint). lockedX/lockedY сообщают
  // вызывающему коду, какие оси уже выровнены под соседа (их нельзя дальше округлять по сетке
  // — иначе округление снова собьёт точное совпадение координаты с соседом).
  G.orthoJoint = (prev, p, next, ratio) => {
    const r = ratio == null ? 0.36 : ratio;
    let x = p.x, y = p.y, lockedX = false, lockedY = false;
    if (prev) {
      const dx = Math.abs(x - prev.x), dy = Math.abs(y - prev.y);
      if (dx <= dy * r) { x = prev.x; lockedX = true; }
      else if (dy <= dx * r) { y = prev.y; lockedY = true; }
    }
    if (next) {
      const dx = Math.abs(x - next.x), dy = Math.abs(y - next.y);
      if (!lockedX && dx <= dy * r) { x = next.x; lockedX = true; }
      else if (!lockedY && dy <= dx * r) { y = next.y; lockedY = true; }
    }
    return { x, y, lockedX, lockedY };
  };

  // ---- стены комнаты (производные от точек полигона) ----
  G.walls = (room) => {
    const pts = room.points || [], out = [];
    if (pts.length < 2) return out;
    for (let i = 0; i < pts.length; i++) {
      const a = pts[i], b = pts[(i + 1) % pts.length];
      out.push({
        id: room.id + ":" + i, roomId: room.id, i, n: i + 1, a, b,
        len: G.dist(a, b), mx: (a.x + b.x) / 2, my: (a.y + b.y) / 2
      });
    }
    return out;
  };
  // Перегородка/балка как «стена»: синтетический wall-объект (чтобы принимать проёмы)
  G.beamWall = (beam) => {
    if (!beam) return null;
    const len = G.dist(beam.a, beam.b);
    return { id: "beam:" + beam.id, beamId: beam.id, isBeam: true, roomId: null, i: 0, n: "перег.", a: beam.a, b: beam.b, len, mx: (beam.a.x + beam.b.x) / 2, my: (beam.a.y + beam.b.y) / 2 };
  };
  G.wallById = (project, wallId) => {
    const s = String(wallId || "");
    if (s.slice(0, 5) === "beam:") {
      const beam = (project.beams || []).find((b) => b.id === s.slice(5));
      return beam ? G.beamWall(beam) : null;
    }
    const [roomId, iStr] = s.split(":");
    const room = (project.rooms || []).find((r) => r.id === roomId);
    if (!room) return null;
    // ровно тот объект, что дал бы G.walls(room)[i], но без сборки ВСЕХ стен комнаты:
    // wallById зовётся на каждую точку при каждой отрисовке (позиция маркера), и
    // выделение массива стен на каждый вызов было заметной долей рендера плана
    const pts = room.points || [], i = Number(iStr);
    if (pts.length < 2 || !(i >= 0 && i < pts.length) || Math.floor(i) !== i) return null;
    const a = pts[i], b = pts[(i + 1) % pts.length];
    return { id: room.id + ":" + i, roomId: room.id, i, n: i + 1, a, b, len: G.dist(a, b), mx: (a.x + b.x) / 2, my: (a.y + b.y) / 2 };
  };

  // ---- толщина/материал КОНКРЕТНОЙ стены (переопределение на стену поверх настроек) ----
  G.wallThOf = (project, wall) => {
    const def = Math.max(4, (project.settings && project.settings.wallThickness) || 10);
    if (!wall) return def;
    if (wall.isBeam) {
      const bm = (project.beams || []).find((b) => b.id === wall.beamId);
      return Math.max(4, (bm && bm.width) || def);
    }
    const room = (project.rooms || []).find((r) => r.id === wall.roomId);
    const o = room && room.wallTh && Number(room.wallTh[wall.i]);
    return o >= 4 ? o : def;
  };
  // Вынос размерной ЦЕПОЧКИ этой стены от её грани (см, знак = сторона): переопределение
  // НА СТЕНУ (room.wallDimOff[i], ставится тягой цифры) поверх общей settings.dimOffset.
  // Тот же приём, что wallThOf/wallMatOf. Читают И рендер, И хит-тест — иначе видимая
  // цифра и зона тапа по ней разъедутся (давний инвариант размерной цепочки).
  G.wallDimOffOf = (project, wall) => {
    const s = project && project.settings;
    const def = s && s.dimOffset >= 0 ? s.dimOffset : 5;
    if (!wall || wall.isBeam) return def;
    const room = (project.rooms || []).find((r) => r.id === wall.roomId);
    const o = room && room.wallDimOff && room.wallDimOff[wall.i];
    return typeof o === "number" && isFinite(o) ? o : def;
  };
  G.wallMatOf = (project, wall) => {
    const def = (project.settings && project.settings.wallMaterial) || "Бетон";
    if (!wall) return def;
    if (wall.isBeam) {
      const bm = (project.beams || []).find((b) => b.id === wall.beamId);
      return (bm && bm.material) || def;
    }
    const room = (project.rooms || []).find((r) => r.id === wall.roomId);
    return (room && ((room.wallMat && room.wallMat[wall.i]) || room.material)) || def;
  };

  // ---- смещённые кольца полигона комнаты (митра-пересечения граней) ----
  // side: +1 внутрь, -1 наружу; extra — доп. отступ ЗА грань стены (для трасс)
  function offsetRing(project, room, side, extra) {
    const pts = room.points || [], n = pts.length;
    if (n < 3) return null;
    let a2 = 0;
    for (let i = 0; i < n; i++) { const p1 = pts[i], p2 = pts[(i + 1) % n]; a2 += p1.x * p2.y - p2.x * p1.y; }
    const s = a2 > 0 ? 1 : -1; // знак обхода: куда смотрит нормаль «внутрь»
    const edge = G.walls(room).map((w) => {
      const len = w.len || 1;
      const d = { x: (w.b.x - w.a.x) / len, y: (w.b.y - w.a.y) / len };
      return { d, ni: { x: -d.y * s, y: d.x * s }, half: G.wallThOf(project, w) / 2 + (extra || 0), a: w.a };
    });
    const out = [];
    for (let i = 0; i < n; i++) {
      const e0 = edge[(i - 1 + n) % n], e1 = edge[i];
      const a0 = { x: e0.a.x + e0.ni.x * e0.half * side, y: e0.a.y + e0.ni.y * e0.half * side };
      const a1 = { x: e1.a.x + e1.ni.x * e1.half * side, y: e1.a.y + e1.ni.y * e1.half * side };
      const den = e0.d.x * e1.d.y - e0.d.y * e1.d.x;
      if (Math.abs(den) < 1e-6) { out.push(a1); continue; } // грани параллельны — берём смещённый угол
      const t = ((a1.x - a0.x) * e1.d.y - (a1.y - a0.y) * e1.d.x) / den;
      out.push({ x: a0.x + e0.d.x * t, y: a0.y + e0.d.y * t });
    }
    return out;
  }

  // ---- контур стен комнаты со СТЫКАМИ (митра, как на чертеже) ----
  // Точки комнаты — ОСЬ стены. Грани смещаются на th/2 своей стены,
  // углы — пересечение соседних граней (митра). Поддерживает разную толщину стен.
  G.roomBand = (project, room) => {
    const inner = offsetRing(project, room, 1, 0);
    if (!inner) return null;
    return { inner, outer: offsetRing(project, room, -1, 0) };
  };

  // ---- станции размерной цепочки ВДОЛЬ стены (плана) ----
  // ЕДИНЫЙ источник для рендера цепочки (plan-render.js) И для двойного тапа по цифре
  // размера (plan-rooms.js) — чтобы визуальные цифры и хит-тест не разъезжались.
  // Станции: ВНУТРЕННИЕ углы стены (thR/2 от края — работаем изнутри квартиры) + каждая
  // настенная точка (offset, приклампленный к внутренним углам) + края проёмов. У станции-
  // точки тегируется elemId (для правки — какую точку двигать), у угла/проёма elemId=null.
  G.wallChainStations = (project, wall) => {
    if (!wall || !wall.len) return null;
    const thR = G.wallThOf(project, wall);
    const inA = Math.min(thR / 2, wall.len / 2), inB = Math.max(wall.len - thR / 2, wall.len / 2);
    const clamp = (d) => Math.round(Math.max(inA, Math.min(inB, d)));
    const map = new Map(); // off -> elemId | null
    map.set(Math.round(inA), null); map.set(Math.round(inB), null);
    (project.elements || []).forEach((e) => {
      if (e.wallId === wall.id && e.offset != null && e.type !== "junction") map.set(clamp(e.offset), e.id);
    });
    G.openingsOnWall(project, wall.id).forEach((o) => {
      const s = clamp(o.offset), e2 = clamp(o.offset + o.width);
      if (!map.has(s)) map.set(s, null);
      if (!map.has(e2)) map.set(e2, null);
    });
    const offs = [...map.keys()].sort((a, b) => a - b);
    if (offs.length <= 2) return null; // только углы — нечего привязывать
    const stations = offs.map((off) => ({ off, elemId: map.get(off) || null }));
    const segs = [];
    for (let i = 0; i < stations.length - 1; i++) {
      const a = stations[i], b = stations[i + 1], dist = b.off - a.off;
      if (dist < 2) continue;
      segs.push({ aOff: a.off, bOff: b.off, midOff: (a.off + b.off) / 2, dist, aElemId: a.elemId, bElemId: b.elemId });
    }
    return { stations, segs };
  };

  // ---- контур ТРАССИРОВКИ: отступ от внутренней грани стены на extra см ----
  // Линии кабеля идут по этому контуру — параллельно стенам, не по стене.
  G.insetContour = (project, room, extra) => {
    const ring = offsetRing(project, room, 1, Math.max(0, extra || 0));
    if (!ring) return null;
    // выродившийся контур (отступ больше комнаты) — не годится
    if (!(G.area(ring) > 100)) return null;
    // ВЫВЕРНУТЫЙ контур (аудит 11.11, п.12): при отступе больше полуширины комнаты митра даёт
    // кольцо с НЕнулевой площадью, но вывернутое наизнанку — узкий коридор 80 см и 35 линий
    // уводили трассу за противоположную стену. Признак: длинная грань (≥ 30 см) сменила
    // направление на обратное или точка кольца вышла из комнаты. Короткие грани (уступ,
    // колонна) могут схлопнуться законно — это прежнее поведение, его не трогаем.
    const pts = room.points || [], n = pts.length;
    for (let i = 0; i < n; i++) {
      const a = pts[i], b = pts[(i + 1) % n], ra = ring[i], rb = ring[(i + 1) % n];
      const ox = b.x - a.x, oy = b.y - a.y;
      if (ox * ox + oy * oy < 900) continue;
      if (ox * (rb.x - ra.x) + oy * (rb.y - ra.y) <= 0) return null;
    }
    for (let i = 0; i < ring.length; i++) if (!G.pointInPolygon(ring[i], pts)) return null;
    return ring;
  };
  // наибольший отступ трассы от грани стены, при котором контур ещё не выворачивается
  // (двоичный поиск по G.insetContour; комнаты маленькие — дёшево)
  G.maxInset = (project, room) => {
    const pts = (room && room.points) || [];
    if (pts.length < 3 || !G.insetContour(project, room, 0)) return 0;
    let lo = 0, hi = 0;
    pts.forEach((q) => { pts.forEach((r) => { const d = Math.abs(q.x - r.x) + Math.abs(q.y - r.y); if (d > hi) hi = d; }); });
    if (G.insetContour(project, room, hi)) return hi;
    for (let k = 0; k < 16; k++) { const m = (lo + hi) / 2; if (G.insetContour(project, room, m)) lo = m; else hi = m; }
    return lo;
  };
  // ближайшая точка на замкнутом контуре: {x,y,seg,t,d}
  // угол ломаной (для ручного редактирования трасс): если prev->corner->next — прямой
  // угол по осям (сначала по одной оси, потом по другой), возвращает АЛЬТЕРНАТИВНУЮ
  // вершину того же прямоугольника (свернуть "сначала вертикаль" в "сначала
  // горизонталь" и наоборот). null, если это не прямой угол по осям (нечего разворачивать).
  G.flipOrthoCorner = (prev, corner, next) => {
    const EPS = 1;
    const vertFirst = Math.abs(corner.x - prev.x) < EPS && Math.abs(corner.y - next.y) < EPS;
    const horizFirst = Math.abs(corner.y - prev.y) < EPS && Math.abs(corner.x - next.x) < EPS;
    if (vertFirst) return { x: next.x, y: prev.y };
    if (horizFirst) return { x: prev.x, y: next.y };
    return null;
  };
  G.closestOnPoly = (pts, p) => {
    let best = null;
    for (let i = 0; i < pts.length; i++) {
      const c = G.closestOnSeg(p, pts[i], pts[(i + 1) % pts.length]);
      if (!best || c.d < best.d) best = { x: c.x, y: c.y, seg: i, t: c.t, d: c.d };
    }
    return best;
  };
  // путь ПО контуру между двумя его точками — короткой стороной
  G.polyWalk = (pts, from, to) => {
    const n = pts.length;
    const segLen = (i) => G.dist(pts[i], pts[(i + 1) % n]);
    let per = 0; for (let i = 0; i < n; i++) per += segLen(i);
    const posOf = (q) => { let s = 0; for (let i = 0; i < q.seg; i++) s += segLen(i); return s + segLen(q.seg) * q.t; };
    const pa = posOf(from), pb = posOf(to);
    const fwd = (pb - pa + per) % per, back = per - fwd;
    const path = [{ x: from.x, y: from.y }];
    let i = from.seg, guard = 0;
    if (fwd <= back) { while (i !== to.seg && guard++ <= n) { i = (i + 1) % n; path.push({ x: pts[i].x, y: pts[i].y }); } }
    else { while (i !== to.seg && guard++ <= n) { path.push({ x: pts[i].x, y: pts[i].y }); i = (i - 1 + n) % n; } }
    path.push({ x: to.x, y: to.y });
    // выкидываем совпадающие соседние точки
    return path.filter((q, j) => j === 0 || G.dist(q, path[j - 1]) > 0.5);
  };

  // ---- попадания ----
  G.closestOnSeg = (p, a, b) => {
    const dx = b.x - a.x, dy = b.y - a.y, L2 = dx * dx + dy * dy;
    const t = L2 ? Math.max(0, Math.min(1, ((p.x - a.x) * dx + (p.y - a.y) * dy) / L2)) : 0;
    const x = a.x + t * dx, y = a.y + t * dy;
    const ex = p.x - x, ey = p.y - y;
    return { x, y, t, d: Math.sqrt(ex * ex + ey * ey) }; // sqrt вместо hypot — см. G.dist выше
  };
  G.wallAt = (project, p, maxD) => {
    const pr = G.floorScoped(project);
    const cands = [];
    (pr.rooms || []).forEach((r) => G.walls(r).forEach((w) => {
      const c = G.closestOnSeg(p, w.a, w.b);
      if (c.d <= maxD) cands.push({ wall: w, hit: c, offset: Math.round(c.t * w.len) });
    }));
    // перегородки/балки тоже принимают проёмы
    (pr.beams || []).forEach((bm) => {
      const w = G.beamWall(bm);
      const c = G.closestOnSeg(p, w.a, w.b);
      const md = Math.max(maxD, (bm.width || 10) / 2);
      if (c.d <= md) cands.push({ wall: w, hit: c, offset: Math.round(c.t * w.len) });
    });
    if (!cands.length) return null;
    // ОБЩАЯ стена двух соседних комнат: у обеих centerline совпадает, дистанция
    // до неё одинаковая — раньше побеждала всегда первая построенная комната,
    // вторая становилась недостижимой для простановки точек на этой стене.
    // Отдаём предпочтение той комнате, В СТОРОНУ КОТОРОЙ тап физически смещён.
    const side = (cand) => {
      const fr = G.wallFrame(pr, cand.wall);
      return fr ? (p.x - cand.hit.x) * fr.nrm.x + (p.y - cand.hit.y) * fr.nrm.y : 0; // >0 — тап внутри ЭТОЙ комнаты
    };
    const inside = cands.filter((c) => side(c) > -0.5);
    const pool = inside.length ? inside : cands;
    return pool.reduce((best, c) => (!best || c.hit.d < best.hit.d ? c : best), null);
  };
  G.pointInPolygon = (p, pts) => {
    let inside = false;
    for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
      const xi = pts[i].x, yi = pts[i].y, xj = pts[j].x, yj = pts[j].y;
      if ((yi > p.y) !== (yj > p.y) && p.x < ((xj - xi) * (p.y - yi)) / (yj - yi) + xi) inside = !inside;
    }
    return inside;
  };
  G.roomAt = (project, p) =>
    (G.floorScoped(project).rooms || []).find((r) => (r.points || []).length >= 3 && G.pointInPolygon(p, r.points)) || null;

  // ---- прямоугольные комнаты (размеры числом) ----
  G.rectPoints = (x, y, w, h) => [{ x, y }, { x: x + w, y }, { x: x + w, y: y + h }, { x, y: y + h }];
  G.isRect = (room) => {
    const p = room.points || [];
    if (p.length !== 4) return false;
    return G.walls(room).every((w) => Math.abs(w.a.x - w.b.x) < 0.01 || Math.abs(w.a.y - w.b.y) < 0.01);
  };
  G.rectDims = (room) => {
    const b = G.bbox(room.points);
    return b ? { x: b.x, y: b.y, w: b.w, h: b.h } : null;
  };
  // ПОРЯДОК ВЕРШИН сохраняется: стены — это «комната:индекс», к ним привязаны точки и проёмы.
  // Раньше контур собирался заново от левого верхнего угла, и у отражённой или нарисованной не
  // с того угла комнаты все точки молча переезжали на другие стены.
  G.setRectDims = (room, w, h) => {
    const d = G.rectDims(room);
    if (!d) return;
    const W = Math.max(10, w), H = Math.max(10, h);
    room.points = (room.points || []).map((q) => ({ x: Math.abs(q.x - d.x) < 0.01 ? d.x : d.x + W, y: Math.abs(q.y - d.y) < 0.01 ? d.y : d.y + H }));
  };

  // ---- трансформации ----
  G.translateRoom = (room, dx, dy) => { room.points = room.points.map((p) => ({ x: p.x + dx, y: p.y + dy })); };
  G.mirrorRoom = (room) => {
    const b = G.bbox(room.points);
    if (!b) return;
    const cx = b.x + b.w / 2;
    room.points = room.points.map((p) => ({ x: 2 * cx - p.x, y: p.y })).reverse();
  };

  // ---- габариты ----
  G.bbox = (pts) => {
    if (!pts || !pts.length) return null;
    let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
    pts.forEach((p) => { x0 = Math.min(x0, p.x); y0 = Math.min(y0, p.y); x1 = Math.max(x1, p.x); y1 = Math.max(y1, p.y); });
    return { x: x0, y: y0, w: x1 - x0, h: y1 - y0 };
  };
  G.projectBBox = (project) => {
    const all = [];
    (project.rooms || []).forEach((r) => all.push(...(r.points || [])));
    const u = project.underlay;
    if (u && u.nw && u.nh) {
      all.push({ x: u.x || 0, y: u.y || 0 });
      all.push({ x: (u.x || 0) + u.nw * u.scale, y: (u.y || 0) + u.nh * u.scale });
    }
    (project.panels || []).forEach((pn) => all.push({ x: pn.x, y: pn.y }));
    return G.bbox(all);
  };
  G.centroid = (pts) => {
    if (!pts || !pts.length) return { x: 0, y: 0 };
    let sx = 0, sy = 0;
    pts.forEach((p) => { sx += p.x; sy += p.y; });
    return { x: sx / pts.length, y: sy / pts.length };
  };
  G.area = (pts) => { // площадь полигона, см²
    let s = 0;
    for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) s += (pts[j].x + pts[i].x) * (pts[j].y - pts[i].y);
    return Math.abs(s / 2);
  };
  // площадь СО ЗНАКОМ (shoelace) — знак говорит про направление обхода контура
  G.signedArea = (pts) => {
    let s = 0;
    for (let i = 0; i < pts.length; i++) { const p1 = pts[i], p2 = pts[(i + 1) % pts.length]; s += p1.x * p2.y - p2.x * p1.y; }
    return s / 2;
  };

  // ---- слияние двух соприкасающихся комнат в одну (Г/Ш-образная без ручного контура) ----
  // Требование: комнаты не накладываются площадью, а соприкасаются по границе — ОДНОЙ
  // прямой стеной ИЛИ цепочкой стен через угол (Г/Ш-стык — соседняя комната ровно
  // заполняет угловой вырез). Возвращает точки объединённого контура или null,
  // если общей границы не нашли (либо она рвётся на несколько несвязанных мест).
  //
  // Алгоритм: рёбра A и B, что совпадают (коллинеарны, перекрываются, обход навстречу
  // друг другу) — "гасятся" (это стала внутренняя стена, которой больше нет снаружи).
  // Остаток рёбер (у обеих фигур) сшивается по общим концам в один замкнутый контур —
  // не важно, была общая граница одним отрезком или цепочкой через угол(ы).
  // третий параметр `out` — необязательный: если передан объект, в out.gone
  // кладётся список [p,q]-отрезков ИСЧЕЗНУВШЕЙ (погашенной) общей стены —
  // используется, чтобы опционально поставить на её месте перемычку (балку)
  /* ---------- РАЗРЕЗ комнаты хордой (обратная операция к mergeRoomPolygons) ----------
     Обвёл квартиру одним контуром по наружным стенам — и режешь её перегородками на
     комнаты. Общая стена получается ПО ПОСТРОЕНИЮ (обе новые комнаты используют один и
     тот же отрезок разреза), поэтому разойтись на пару сантиметров физически не может —
     а именно из-за таких расхождений трассы потом идут «по стене».
     a/b — два тапа (у стен комнаты, не обязательно точно на них). Возвращает
     {a: [...], b: [...], cut: [p, q]} или null, если разрез вырожденный. */
  // ---- задать длину КОНКРЕТНОЙ стены числом (не тягой) ----
  // Замерил стену лазером — вписал 342, а не подгоняй пальцем. Правило: конечная
  // вершина стены едет ВДОЛЬ неё на разницу длин, и сдвиг ПРОТАСКИВАЕТСЯ дальше по
  // контуру, пока соседняя стена ПЕРПЕНДИКУЛЯРНА направлению сдвига (такая стена от
  // переноса своей вершины только параллельно смещается, форма не ломается);
  // на первой ПАРАЛЛЕЛЬНОЙ стене останавливаемся — она и поглощает изменение.
  // На прямоугольнике это даёт ровно ожидаемое: «сделай верхнюю стену 500» →
  // прямоугольник 500×глубина, а не трапецию (наивный перенос одной вершины давал
  // бы именно её). Возвращает НОВЫЙ массив точек либо null, если правка не имеет
  // смысла (вырожденный контур, нулевая длина, сдвиг обошёл контур по кругу —
  // тогда ничего не мутируем, вызывающий просто показывает toast).
  // ---- свой размер: геометрия «вынесенного» размера ----
  // Отрезок a-b + перпендикулярный ВЫНОС off: размерная линия идёт параллельно отрезку
  // на расстоянии off, а к самим точкам тянутся выносные линии (как на чертеже).
  // Возвращает null у вырожденного отрезка — вызывающий просто ничего не рисует.
  G.dimGeom = (d) => {
    if (!d || !d.a || !d.b) return null;
    const len = G.dist(d.a, d.b);
    if (len < 1e-6) return null;
    const dir = { x: (d.b.x - d.a.x) / len, y: (d.b.y - d.a.y) / len };
    const n = { x: -dir.y, y: dir.x };
    const off = Number(d.off) || 0;
    const A = { x: d.a.x + n.x * off, y: d.a.y + n.y * off };
    const B = { x: d.b.x + n.x * off, y: d.b.y + n.y * off };
    return {
      len, dir, n, A, B,
      mid: { x: (A.x + B.x) / 2, y: (A.y + B.y) / 2 },
      grip: { x: (A.x + B.x) / 2, y: (A.y + B.y) / 2 }   // за что тянуть вынос
    };
  };
  // Перевод «мышь тут» -> вынос: проекция вектора от середины отрезка на нормаль.
  // Тем же знаком, что и сам off, поэтому размер честно перелетает на другую сторону,
  // если протащить его сквозь отрезок.
  G.dimOffsetAt = (d, pt) => {
    const g = G.dimGeom(d);
    if (!g) return 0;
    const mid = { x: (d.a.x + d.b.x) / 2, y: (d.a.y + d.b.y) / 2 };
    return (pt.x - mid.x) * g.n.x + (pt.y - mid.y) * g.n.y;
  };

  G.setWallLength = (pts, i, len) => {
    const n = (pts || []).length;
    if (n < 3 || !(len > 0)) return null;
    const i0 = ((i % n) + n) % n, i1 = (i0 + 1) % n;
    const a = pts[i0], b = pts[i1];
    const cur = G.dist(a, b);
    if (cur < 1e-6) return null;
    const d = { x: (b.x - a.x) / cur, y: (b.y - a.y) / cur };
    const delta = len - cur;
    if (Math.abs(delta) < 1e-6) return pts.map((q) => ({ x: q.x, y: q.y }));
    const mv = { x: d.x * delta, y: d.y * delta };
    const out = pts.map((q) => ({ x: q.x, y: q.y }));
    // тащим i1 и дальше по контуру, пока стена перпендикулярна направлению сдвига
    let k = i1, steps = 0;
    while (steps < n) {
      out[k].x += mv.x; out[k].y += mv.y;
      const k2 = (k + 1) % n;
      if (k2 === i0) return null;                 // обошли контур целиком — правка бессмысленна
      const e = { x: pts[k2].x - pts[k].x, y: pts[k2].y - pts[k].y };
      const el = Math.hypot(e.x, e.y);
      if (el < 1e-6) return null;
      const cos = Math.abs((e.x * d.x + e.y * d.y) / el);
      if (cos > 0.2) break;                       // стена вдоль сдвига — она и поглощает разницу
      k = k2; steps++;
    }
    if (Math.abs(G.area(out)) < 10000) return null; // меньше 0.1 м² — комната выродилась
    return out;
  };

  G.splitRoomPolygon = (pts, a, b) => {
    if (!pts || pts.length < 3 || !a || !b) return null;
    // 1) почти вертикальный/горизонтальный разрез доводим до точной оси (тот же порог
    //    ratio, что у orthoAdjust) — перегородки в квартирах прямые
    let A = { x: a.x, y: a.y }, B = { x: b.x, y: b.y };
    const dx = Math.abs(A.x - B.x), dy = Math.abs(A.y - B.y);
    // главный тут ПЕРВЫЙ тап: разрез ложится ровно туда, куда прицелился пользователь
    // (среднее между двумя тапами давало «полусантиметры» и уезжало от намеченного места)
    if (dx <= dy * 0.36) B.x = A.x;
    else if (dy <= dx * 0.36) B.y = A.y;
    const dir = { x: B.x - A.x, y: B.y - A.y };
    const len = Math.hypot(dir.x, dir.y);
    // два тапа рядом — это не разрез, а промах: линия через них всё равно пересекла бы
    // контур где-то далеко и «разрезала» комнату случайной диагональю
    if (len < 50) return null;
    dir.x /= len; dir.y /= len;
    // 2) продлеваем линию разреза и ищем ВСЕ пересечения с контуром
    const n = pts.length, hits = [];
    // Решаем A + s*dir = p0 + u*e (две неизвестные s, u) методом Крамера:
    //   s*dir.x - u*e.x = w.x        w = p0 - A
    //   s*dir.y - u*e.y = w.y
    for (let i = 0; i < n; i++) {
      const p0 = pts[i], p1 = pts[(i + 1) % n];
      const ex = p1.x - p0.x, ey = p1.y - p0.y;
      const D = ex * dir.y - dir.x * ey;
      if (Math.abs(D) < 1e-9) continue;                   // ребро параллельно разрезу
      const wx = p0.x - A.x, wy = p0.y - A.y;
      const sc = (ex * wy - wx * ey) / D;                 // вдоль линии разреза
      const u = (dir.x * wy - wx * dir.y) / D;            // вдоль ребра, должен быть 0..1
      if (u < -1e-6 || u > 1 + 1e-6) continue;
      const uu = Math.min(1, Math.max(0, u));
      hits.push({ seg: i, t: uu, s: sc, x: p0.x + ex * uu, y: p0.y + ey * uu });
    }
    if (hits.length < 2) return null;
    hits.sort((h1, h2) => h1.s - h2.s);
    // 3) берём пару, которая ОХВАТЫВАЕТ середину между тапами (у выпуклой комнаты это
    //    просто две точки; у вогнутой — та пара, между которой пользователь и тапал)
    const mid = len / 2;
    let qa = null, qb = null;
    for (let i = 0; i + 1 < hits.length; i++) {
      if (hits[i].s <= mid + 1e-6 && hits[i + 1].s >= mid - 1e-6) { qa = hits[i]; qb = hits[i + 1]; break; }
    }
    if (!qa) { qa = hits[0]; qb = hits[hits.length - 1]; }
    if (qa.seg === qb.seg && Math.abs(qa.t - qb.t) < 1e-6) return null;
    if (G.dist(qa, qb) < 30) return null;                  // слишком короткий разрез
    // 4) обходим контур в обе стороны — получаем две комнаты с ОБЩИМ отрезком разреза
    const walk = (from, to) => {
      const out = [{ x: from.x, y: from.y }];
      let i = from.seg, guard = 0;
      while (guard++ <= n + 1) {
        const nxt = (i + 1) % n;
        if (i === to.seg && !(from.seg === to.seg && guard === 1)) break;
        out.push({ x: pts[nxt].x, y: pts[nxt].y });
        i = nxt;
        if (i === to.seg) break;
      }
      out.push({ x: to.x, y: to.y });
      return out;
    };
    const polyA = walk(qa, qb), polyB = walk(qb, qa);
    const clean = (arr) => arr.filter((q, i) => i === 0 || G.dist(q, arr[i - 1]) > 0.5);
    const pa = clean(polyA), pb = clean(polyB);
    if (pa.length < 3 || pb.length < 3) return null;
    if (Math.abs(G.area(pa)) < 10000 || Math.abs(G.area(pb)) < 10000) return null; // <1 м²
    return { a: pa, b: pb, cut: [{ x: qa.x, y: qa.y }, { x: qb.x, y: qb.y }] };
  };

  G.mergeRoomPolygons = (ptsA, ptsB, out) => {
    if (!ptsA || !ptsB || ptsA.length < 3 || ptsB.length < 3) return null;
    const EPS = 1; // см — допуск на неточность рисования от руки
    const a = G.signedArea(ptsA) < 0 ? ptsA.slice().reverse() : ptsA.slice();
    const b = G.signedArea(ptsB) < 0 ? ptsB.slice().reverse() : ptsB.slice();
    const remA = remainingPieces(a, b, EPS);
    const remB = remainingPieces(b, a, EPS);
    const perim = (pts) => { let s = 0; for (let i = 0; i < pts.length; i++) s += G.dist(pts[i], pts[(i + 1) % pts.length]); return s; };
    const remLen = (segs) => segs.reduce((s, [p, q]) => s + G.dist(p, q), 0);
    if (perim(a) - remLen(remA.out) < EPS) return null; // ничего не погасили — не соприкасаются общей стеной
    const stitched = stitchPieces(remA.out.concat(remB.out));
    if (!stitched) return null;
    if (out) out.gone = remA.gone;
    return dropCollinear(stitched);
  };
  // рёбра `from`, минус части, совпадающие с рёбрами `other` (навстречу, на одной прямой);
  // возвращает { out: оставшиеся куски, gone: погашенные (общая стена) куски — от `from` }
  function remainingPieces(from, other, EPS) {
    const out = [], gone = [], n = from.length, m = other.length;
    for (let i = 0; i < n; i++) {
      const a0 = from[i], a1 = from[(i + 1) % n];
      const alen = G.dist(a0, a1);
      if (alen < EPS) continue;
      const adir = { x: (a1.x - a0.x) / alen, y: (a1.y - a0.y) / alen };
      const covered = [];
      for (let j = 0; j < m; j++) {
        const b0 = other[j], b1 = other[(j + 1) % m];
        const blen = G.dist(b0, b1);
        if (blen < EPS) continue;
        const bdir = { x: (b1.x - b0.x) / blen, y: (b1.y - b0.y) / blen };
        if (Math.abs(adir.x * bdir.y - adir.y * bdir.x) > 0.02) continue; // не параллельны (~1°)
        const perp = (b0.x - a0.x) * -adir.y + (b0.y - a0.y) * adir.x;
        if (Math.abs(perp) > EPS) continue; // не на одной прямой
        if (adir.x * bdir.x + adir.y * bdir.y > -0.98) continue; // общая стена — всегда навстречу
        const tb0 = (b0.x - a0.x) * adir.x + (b0.y - a0.y) * adir.y;
        const tb1 = (b1.x - a0.x) * adir.x + (b1.y - a0.y) * adir.y;
        const lo = Math.max(0, Math.min(tb0, tb1)), hi = Math.min(alen, Math.max(tb0, tb1));
        if (hi - lo > EPS) covered.push([lo, hi]);
      }
      if (!covered.length) { out.push([a0, a1]); continue; }
      covered.sort((x, y) => x[0] - y[0]);
      const merged = [covered[0].slice()];
      for (let k = 1; k < covered.length; k++) {
        const last = merged[merged.length - 1];
        if (covered[k][0] <= last[1] + EPS) last[1] = Math.max(last[1], covered[k][1]);
        else merged.push(covered[k].slice());
      }
      const pt = (t) => ({ x: a0.x + adir.x * t, y: a0.y + adir.y * t });
      let cur = 0;
      merged.forEach(([lo, hi]) => { gone.push([pt(lo), pt(hi)]); if (lo - cur > EPS) out.push([pt(cur), pt(lo)]); cur = hi; });
      if (alen - cur > EPS) out.push([pt(cur), pt(alen)]);
    }
    return { out, gone };
  }
  // сшивает несвязанные отрезки [a,b] в один замкнутый контур по совпадающим концам;
  // null, если контур рвётся (общая граница не одна связная цепь) или остались лишние куски
  function stitchPieces(segs) {
    if (!segs.length) return null;
    const used = new Array(segs.length).fill(false);
    const start = segs[0][0];
    const poly = [start];
    let next = segs[0][1];
    used[0] = true;
    let guard = 0;
    while (G.dist(next, start) > 0.5 && guard++ <= segs.length + 2) {
      poly.push(next);
      let found = -1;
      for (let k = 0; k < segs.length; k++) { if (!used[k] && G.dist(segs[k][0], next) < 1) { found = k; break; } }
      if (found < 0) return null; // разрыв цепочки — соприкосновение не одной связной границей
      used[found] = true;
      next = segs[found][1];
    }
    if (used.some((u) => !u)) return null; // остались несвязанные куски — области не соединились в одну
    const cleaned = poly.filter((q, i) => i === 0 || G.dist(q, poly[i - 1]) > 0.5);
    if (cleaned.length > 1 && G.dist(cleaned[0], cleaned[cleaned.length - 1]) < 0.5) cleaned.pop();
    return cleaned.length >= 3 ? cleaned : null;
  }
  // убирает почти-прямые углы (170°+) — стык прямоугольников часто даёт лишнюю точку
  // ровно посередине прямого участка внешней границы
  function dropCollinear(pts) {
    const n = pts.length, out = [];
    for (let i = 0; i < n; i++) {
      const prev = pts[(i - 1 + n) % n], cur = pts[i], next = pts[(i + 1) % n];
      const d1x = cur.x - prev.x, d1y = cur.y - prev.y, l1 = Math.hypot(d1x, d1y) || 1;
      const d2x = next.x - cur.x, d2y = next.y - cur.y, l2 = Math.hypot(d2x, d2y) || 1;
      const cross = (d1x / l1) * (d2y / l2) - (d1y / l1) * (d2x / l2);
      if (Math.abs(cross) > 0.02) out.push(cur); // не почти прямая линия — сохраняем угол
    }
    return out.length >= 3 ? out : pts;
  }
  // Внутренние препятствия (вентшахта / мини-комната) — свободные прямоугольники
  // без привязки к room.id, комната определяется по центру препятствия (как у
  // элементов без wallId). Площадь вычитается из площади помещения в Расчёте/на плане.
  G.voidRect = (vd) => {
    const x1 = Math.min(vd.a.x, vd.b.x), x2 = Math.max(vd.a.x, vd.b.x);
    const y1 = Math.min(vd.a.y, vd.b.y), y2 = Math.max(vd.a.y, vd.b.y);
    return { x1, y1, x2, y2, w: x2 - x1, h: y2 - y1 };
  };
  G.roomVoidArea = (project, room) => (project.voids || []).reduce((sum, vd) => {
    const r = G.voidRect(vd);
    const c = { x: (r.x1 + r.x2) / 2, y: (r.y1 + r.y2) / 2 };
    return sum + (G.pointInPolygon(c, room.points) ? r.w * r.h : 0);
  }, 0);
  G.roomNetArea = (project, room) => Math.max(0, G.area(room.points) - G.roomVoidArea(project, room));

  // ---- позиции элементов и пересечения (Слои 2-4) ----
  G.pointOnWall = (project, wallId, offset) => {
    const w = G.wallById(project, wallId);
    if (!w) return null;
    const t = Math.max(0, Math.min(1, (offset || 0) / (w.len || 1)));
    return { x: w.a.x + (w.b.x - w.a.x) * t, y: w.a.y + (w.b.y - w.a.y) * t, wall: w };
  };
  G.elemPoint = (project, el) => {
    if (el.wallId) {
      const p = G.pointOnWall(project, el.wallId, el.offset);
      return p ? { x: p.x, y: p.y, wall: p.wall } : null;
    }
    const q = el.params || {};
    return q.x != null && q.y != null ? { x: q.x, y: q.y, wall: null } : null;
  };
  G.elementsInRoom = (project, roomId) => (project.elements || []).filter((el) => {
    if (el.wallId) return String(el.wallId).split(":")[0] === roomId;
    const q = el.params || {};
    if (q.x == null) return false;
    const room = (project.rooms || []).find((r) => r.id === roomId);
    return !!(room && G.pointInPolygon(q, room.points));
  });
  // ---- ПОВЕРХНОСТЬ ТРАССЫ по слоям (пол/потолок) ----
  // Раньше поверхность была ОДНА на весь проект (settings.routeType). Просьба пользователя:
  // «трассы надо иметь возможность комбинировать: слаботочка по полу или потолку, освещение
  // по полу и потолку (по полу только питание идёт если по полу), розетки, 24 вольта, и общее».
  // settings.surfaces — переопределение НА ГРУППУ СЛОЁВ, null/пусто = «общее» (settings.routeType,
  // как было). Ключи групп: light (освещение), power (розетки/сила/кондиционеры/тёплый пол),
  // lv (слаботочка — интернет/ТВ/видеонаблюдение), v24 (выводы 24В, ОБЕ половины — «до щита»
  // и «от щита», см. build24Legs в plan-routes.js).
  // Тёплый пол намеренно в группе power: сама штроба ТП всегда 50×50 В ПОЛ независимо от
  // поверхности (см. addRoute), а поверхность влияет только на подачу к термостату — она у
  // ТП такая же силовая, как у розеток.
  G.SURFACE_KEYS = ["light", "power", "lv", "v24"];
  G.surfaceKeyOf = (layer, el) => {
    if (el && el.type === "output24") return "v24";
    if (layer === "light") return "light";
    if (layer === "lv" || layer === "tv" || layer === "cctv") return "lv";
    return "power";
  };
  // opts.lampHop — хоп НЕ доходит до щита (лампа↔выключатель, лампа↔распайка): у ОСВЕЩЕНИЯ
  // при выборе «пол» по полу идёт ТОЛЬКО ПИТАНИЕ (хоп до щита), остальное — по потолку
  // («по полу только питание идёт если по полу», прямая формулировка пользователя).
  G.routeSurface = (project, layer, el, opts) => {
    const s = (project && project.settings) || {};
    const gen = s.routeType === "floor" ? "floor" : "ceiling";
    const key = G.surfaceKeyOf(layer, el);
    const v = (s.surfaces || {})[key];
    let sf = (v === "floor" || v === "ceiling") ? v : gen;
    if (key === "light" && sf === "floor" && opts && opts.lampHop) sf = "ceiling";
    return sf;
  };
  // ---- ЦЕЛИ КЛАВИШИ выключателя/датчика: одна ИЛИ несколько ----
  // el.targetIds[ki] хранит СТРОКУ (одна цель — прежний формат, старые проекты/экспорты
  // читаются как есть) ИЛИ МАССИВ строк (несколько целей — просьба пользователя: «на одну
  // клавишу задавать несколько 24 вольта, можно с одной клавиши включать 2 трансформатора,
  // или одно питание сразу на три»). targetId — legacy-алиас клавиши 0.
  G.targetIdsOf = (el, keyIdx) => {
    if (!el) return [];
    const ki = keyIdx || 0;
    const raw = (el.targetIds || [])[ki];
    const list = Array.isArray(raw) ? raw.slice() : (raw ? [raw] : []);
    if (!list.length && ki === 0 && el.targetId) list.push(el.targetId);
    return list.filter(Boolean);
  };
  // все цели ВСЕХ клавиш одним плоским списком (без повторов) — для трассировки/проверок
  G.allTargetIds = (el) => {
    const out = [];
    const push = (v) => (Array.isArray(v) ? v : [v]).forEach((x) => { if (x && out.indexOf(x) < 0) out.push(x); });
    ((el && el.targetIds) || []).forEach(push);
    if (el && el.targetId) push(el.targetId);
    return out;
  };
  // Куда идёт свет от выключателя: ручное назначение (el.targetId) — приоритет;
  // иначе АВТО — ближайшая лампа/вывод той же ЛИНИИ (QF) в той же комнате
  // (без линии связь не рисуем — слишком много ложных совпадений).
  // keyIdx — номер клавиши (0-based), для многоклавишных выключателей у каждой
  // клавиши своя цель; для проходных/перекрёстных клавиши не различаем (keyIdx=0).
  G.switchTarget = (project, el, keyIdx) => {
    // не только выключатель: датчики движения/освещённости (pir/lux) назначаются НА лампу
    // тем же targetIds (просьба пользователя «назначать их на какую лампу или подсветку»),
    // и весь код вокруг — пунктир на плане, «Проверки», авто-поиск ближайшей лампы линии —
    // должен работать для них так же. Список типов держим ЗДЕСЬ, а не читаем TYPES из
    // plan-elements.js: геометрия грузится РАНЬШЕ и не должна зависеть от него.
    if (!el || (el.type !== "switch" && el.type !== "pir" && el.type !== "lux")) return null;
    const ki = keyIdx || 0;
    // ПЕРВАЯ из назначенных вручную целей — контракт функции остаётся «ОДИН элемент»
    // (её читают проверки/расчёт/автоподбор); полный список — G.switchTargets ниже.
    const manualId = G.targetIdsOf(el, ki)[0];
    if (manualId) { const t = (project.elements || []).find((e) => e.id === manualId); if (t) return t; }
    if (!el.circuitId) return null;
    const p0 = G.elemDrawPoint(project, el);
    if (!p0) return null;
    const roomId = el.wallId ? String(el.wallId).split(":")[0] : null;
    const pool = roomId ? G.elementsInRoom(project, roomId) : (project.elements || []);
    let best = null;
    pool.forEach((e) => {
      if (e.id === el.id || e.circuitId !== el.circuitId || (e.type !== "light" && e.type !== "output")) return;
      const pe = G.elemDrawPoint(project, e);
      if (!pe) return;
      const d = G.dist(p0, pe);
      if (!best || d < best.d) best = { d, el: e };
    });
    return best ? best.el : null;
  };
  // ВСЕ цели клавиши списком (одна ручная = массив из одного, несколько ручных = все,
  // без ручных = авто-цель одним элементом, ничего нет = пустой массив). Рендер пунктиров
  // и трассировка 24В идут ИМЕННО через неё; switchTarget выше остаётся «первой целью».
  G.switchTargets = (project, el, keyIdx) => {
    if (!el) return [];
    const ids = G.targetIdsOf(el, keyIdx);
    if (ids.length) {
      const els = ids.map((id) => (project.elements || []).find((e) => e.id === id)).filter(Boolean);
      if (els.length) return els;
    }
    const one = G.switchTarget(project, el, keyIdx);
    return one ? [one] : [];
  };
  // Куда идёт свет от выключателя, если это НЕ обычная лампа/вывод, а светодиодная
  // лента той же линии (QF) в той же комнате — отдельно от switchTarget, т.к. лента
  // не элемент (project.elements), а самостоятельная сущность (project.ledStrips).
  G.switchLedTarget = (project, el, keyIdx) => {
    if (!el || el.type !== "switch" || !el.circuitId || !el.wallId) return null;
    const p0 = G.elemDrawPoint(project, el);
    if (!p0) return null;
    const roomId = String(el.wallId).split(":")[0];
    let best = null;
    (project.ledStrips || []).forEach((ls) => {
      if (ls.circuitId !== el.circuitId || String(ls.wallId).split(":")[0] !== roomId) return;
      const w = G.wallById(project, ls.wallId);
      if (!w) return;
      const mid = G.pointAtOffset(w, (ls.offsetA + ls.offsetB) / 2);
      const d = G.dist(p0, mid);
      if (!best || d < best.d) best = { d, ls };
    });
    return best ? best.ls : null;
  };
  // Пересечение отрезков (для проходок); касания концов не считаются
  G.segIntersect = (a, b, c, d) => {
    const r = { x: b.x - a.x, y: b.y - a.y }, s = { x: d.x - c.x, y: d.y - c.y };
    const den = r.x * s.y - r.y * s.x;
    if (!den) return null;
    const t = ((c.x - a.x) * s.y - (c.y - a.y) * s.x) / den;
    const u = ((c.x - a.x) * r.y - (c.y - a.y) * r.x) / den;
    if (t <= 0.001 || t >= 0.999 || u <= 0.001 || u >= 0.999) return null;
    return { x: a.x + t * r.x, y: a.y + t * r.y };
  };
  G.polylineCrossings = (project, pts, skipWallId) => {
    const out = [];
    if (!pts || pts.length < 2) return out;
    // стены собираются ОДИН раз на вызов, а не на каждый отрезок пути (профиль сборки трасс:
    // пересборка стен всех комнат на каждый отрезок давала треть времени построения);
    // порядок результата прежний — комнаты, затем перегородки, по отрезкам
    const ws = [];
    (project.rooms || []).forEach((room) => G.walls(room).forEach((w) => {
      if (w.id !== skipWallId) ws.push({ w, x0: Math.min(w.a.x, w.b.x), x1: Math.max(w.a.x, w.b.x), y0: Math.min(w.a.y, w.b.y), y1: Math.max(w.a.y, w.b.y) });
    }));
    for (let i = 0; i < pts.length - 1; i++) {
      const a = pts[i], b = pts[i + 1];
      const sx0 = Math.min(a.x, b.x), sx1 = Math.max(a.x, b.x), sy0 = Math.min(a.y, b.y), sy1 = Math.max(a.y, b.y);
      for (let k = 0; k < ws.length; k++) {
        const W = ws[k];
        if (W.x1 < sx0 || W.x0 > sx1 || W.y1 < sy0 || W.y0 > sy1) continue;
        const hit = G.segIntersect(a, b, W.w.a, W.w.b);
        if (hit) out.push({ x: hit.x, y: hit.y, wallId: W.w.id });
      }
      // Перегородки/перемычки (project.beams) — тоже препятствие для трассы. Сплошная
      // перегородка (kind:"beam", напр. остаток общей стены ПОСЛЕ СЛИЯНИЯ двух комнат)
      // физически стоит от пола до потолка — кабель сквозь неё требует такой же
      // проходки-гильзы Ø20, как через обычную стену. РАНЬШЕ beams тут НЕ проверялись:
      // после слияния комнат общая стена превращалась в балку, полностью выпадала из
      // этой проверки, и проходки на трассах через неё пропадали (репорт со скриншотом
      // «не указывает проходки через перегородки после слияния»). Перемычка
      // (kind:"lintel" — низ открыт, как арка) тоже даёт геометрическое пересечение,
      // но при трассировке ПО ПОЛУ она отфильтровывается как проём до пола (floorSkip в
      // plan-routes.js — кабель идёт под ней); по потолку гильза нужна и там. Тег
      // wallId = "beam:"+id (G.beamWall), рендер гильзы и floorSkip опознают его.
      (project.beams || []).forEach((b) => {
        const bw = G.beamWall(b);
        if (!bw || bw.id === skipWallId) return;
        const hit = G.segIntersect(pts[i], pts[i + 1], bw.a, bw.b);
        if (hit) out.push({ x: hit.x, y: hit.y, wallId: bw.id });
      });
    }
    return out;
  };
  // Отрезки стены за вычетом проёмов: [[от,до],...] в см от угла a
  G.spansMinusOpenings = (len, opens) => {
    const spans = (opens || [])
      .map((o) => [Math.max(0, o.offset), Math.min(len, o.offset + o.width)])
      .filter(([s, e]) => e > s)
      .sort((x, y) => x[0] - y[0]);
    const out = [];
    let cur = 0;
    spans.forEach(([s, e]) => {
      if (s > cur) out.push([cur, s]);
      cur = Math.max(cur, e);
    });
    if (cur < len) out.push([cur, len]);
    return out;
  };
  G.pointAtOffset = (w, d) => {
    const t = w.len ? d / w.len : 0;
    return { x: w.a.x + (w.b.x - w.a.x) * t, y: w.a.y + (w.b.y - w.a.y) * t };
  };
  G.openingsOnWall = (project, wallId) => (project.openings || []).filter((o) => o.wallId === wallId);
  // Проекция точки на прямую стены -> смещение в см от угла a (для поиска "в каком
  // проёме" лежит точка трассировки).
  G.offsetOnWall = (w, pt) => {
    const len = w.len || 1;
    return ((pt.x - w.a.x) * (w.b.x - w.a.x) + (pt.y - w.a.y) * (w.b.y - w.a.y)) / len;
  };
  /* ВИДИМАЯ ГЕОМЕТРИЯ ПРОЁМА — одна на рисование (plan-render.js buildOpenings) и на попадание
     тапом (plan-elements.js hitAt, аудит Астры п. 11). Раньше проём ловился кругом вокруг своей
     середины: тап по нарисованной створке или дуге двери промахивался и открывал комнату, а
     круг при этом заходил на полширины проёма в комнату с ДРУГОЙ стороны, где двери не видно.
     a→b — проём вдоль стены, n — сторона открывания (знак op.flip), swing — створка двери:
     петли h, второй край проёма far, радиус r (у балконного блока — только его дверная часть). */
  G.openingShape = (project, op) => {
    const w = op && G.wallById(project, op.wallId);
    if (!w) return null;
    const a = G.pointAtOffset(w, op.offset), b = G.pointAtOffset(w, op.offset + op.width);
    const dir = { x: (w.b.x - w.a.x) / (w.len || 1), y: (w.b.y - w.a.y) / (w.len || 1) };
    const n = { x: -dir.y * op.flip, y: dir.x * op.flip };
    const kind = op.kind || (op.type === "window" ? "window" : "door");
    let swing = null;
    if (kind === "door") {
      swing = { h: op.hinge === "a" ? a : b, far: op.hinge === "a" ? b : a, r: op.width };
    } else if (kind === "balcony") {
      const r = Math.min(80, op.width * 0.5), h = op.hinge === "a" ? a : b, s = op.hinge === "a" ? r : -r;
      swing = { h, far: { x: h.x + dir.x * s, y: h.y + dir.y * s }, r };
    }
    return { wall: w, a, b, dir, n, kind, th: G.wallThOf(project, w), swing };
  };
  // Расстояние от точки до НАРИСОВАННОГО проёма: вырез в стене (вдоль — от a до b, поперёк —
  // полтолщины), полотно двери (отрезок от петель) и дуга открывания. Внутренность дуги — пол
  // комнаты: тап туда остаётся комнате, трассе, точке (по ней же часто идёт кабель через дверь).
  G.openingHitDist = (project, op, pt) => {
    const s = G.openingShape(project, op);
    if (!s) return null;
    const L = G.dist(s.a, s.b);
    const along = (pt.x - s.a.x) * s.dir.x + (pt.y - s.a.y) * s.dir.y;
    const across = Math.abs((pt.x - s.a.x) * s.n.x + (pt.y - s.a.y) * s.n.y);
    const ex = Math.max(0, -along, along - L), ey = Math.max(0, across - s.th / 2);
    let d = Math.sqrt(ex * ex + ey * ey);
    if (s.swing) {
      const { h, far, r } = s.swing;
      const u = { x: (far.x - h.x) / (r || 1), y: (far.y - h.y) / (r || 1) };
      const leaf = { x: h.x + s.n.x * r, y: h.y + s.n.y * r };
      d = Math.min(d, G.closestOnSeg(pt, h, leaf).d);
      const vu = (pt.x - h.x) * u.x + (pt.y - h.y) * u.y, vn = (pt.x - h.x) * s.n.x + (pt.y - h.y) * s.n.y;
      d = Math.min(d, (vu >= 0 && vn >= 0) ? Math.abs(Math.sqrt(vu * vu + vn * vn) - r) : Math.min(G.dist(pt, far), G.dist(pt, leaf)));
    }
    return d;
  };
  // Проём ДО ПОЛА (дверь/раздвижная/балконная/проём — sill=0, НЕ окно) на стене
  // рядом с точкой — трассировка по полу ведёт кабель прямо через такой проём
  // (там уже физический разрыв стены), без новой гильзы-проходки. Через
  // wallOpeningSpans (не сырой openingsOnWall), т.к. общая стена двух комнат —
  // ДВА разных wall-объекта с разными id, а проём определён только на одном из
  // них; wallOpeningSpans уже умеет проецировать его на соседнюю сторону шва.
  G.floorOpeningAt = (project, wallId, pt) => {
    const w = G.wallById(project, wallId);
    if (!w) return null;
    const t = G.offsetOnWall(w, pt);
    return G.wallOpeningSpans(project, w).find((o) => o.sill === 0 && t >= o.offset - 1 && t <= o.offset + o.width + 1) || null;
  };

  // Проёмы для ВЫРЕЗА в стене как {offset,width,sill}: свои + спроецированные с
  // близкой параллельной стены соседней комнаты/перегородки — чтобы проём «резал»
  // обе полосы общей стены (две комнаты рядом), а не только одну.
  // srcId/ownWallId — ID реального проёма (project.openings) и стены, которая им
  // физически владеет (offset/width которой в исходных данных проёма) — нужно
  // развёртке (plan-unfold.js/plan-export.js), чтобы найти настоящий объект проёма
  // (тип/высоту/номер) и понять, редактируется ли он с ЭТОЙ стороны шва или нет.
  // Существующие вызовы (routes/render) читают только offset/width/sill — доп.
  // поля им не мешают, обратная совместимость сохранена.
  G.wallOpeningSpans = (project, wall) => {
    const out = G.openingsOnWall(project, wall.id).map((o) => ({ offset: o.offset, width: o.width, sill: o.sill, srcId: o.id, ownWallId: wall.id }));
    const len = wall.len || 1;
    const dir = { x: (wall.b.x - wall.a.x) / len, y: (wall.b.y - wall.a.y) / len };
    const nx = -dir.y, ny = dir.x;
    const th = G.wallThOf(project, wall);
    const others = [];
    (project.rooms || []).forEach((r) => G.walls(r).forEach((w2) => { if (w2.id !== wall.id) others.push(w2); }));
    (project.beams || []).forEach((b) => { const bw = G.beamWall(b); if (bw && bw.id !== wall.id) others.push(bw); });
    others.forEach((w2) => {
      const l2 = w2.len || 1, d2x = (w2.b.x - w2.a.x) / l2, d2y = (w2.b.y - w2.a.y) / l2;
      if (Math.abs(dir.x * d2y - dir.y * d2x) > 0.05) return;                 // не параллельна
      if (Math.abs((w2.mx - wall.a.x) * nx + (w2.my - wall.a.y) * ny) > th * 4) return; // далеко — не общая
      G.openingsOnWall(project, w2.id).forEach((o) => {
        const pa = G.pointAtOffset(w2, o.offset), pb = G.pointAtOffset(w2, o.offset + o.width);
        const ta = (pa.x - wall.a.x) * dir.x + (pa.y - wall.a.y) * dir.y;
        const tb = (pb.x - wall.a.x) * dir.x + (pb.y - wall.a.y) * dir.y;
        const s = Math.max(0, Math.min(len, Math.min(ta, tb))), e = Math.max(0, Math.min(len, Math.max(ta, tb)));
        if (e > s + 1) out.push({ offset: s, width: e - s, sill: o.sill, srcId: o.id, ownWallId: w2.id });
      });
    });
    return out;
  };

  // ЕДИНАЯ точка отрисовки/трассировки элемента на стене: ОДИНАКОВЫЙ небольшой отступ
  // внутрь комнаты (в СМ, не зависит ни от зума, ни от линии QF) — точки стоят ровно у
  // стены, не «расползаются». И маркер, и трасса берут ОДНУ эту точку — линия доходит до точки.
  // «Лесенка» для точек, стоящих практически в одном месте стены (одинаковый offset,
  // разная высота — высота на 2D-плане никак не отражается, поэтому такие точки раньше
  // рисовались ровно друг на друге и были недоступны для тапа, кроме верхней). Индекс
  // 0 у «первой» точки группы — её позиция не меняется (обратная совместимость),
  // у остальных k-я точка смещается дальше от стены И вдоль неё на k шагов —
  // видно и можно тапнуть все, включая те, что раньше были полностью скрыты.
  G.STACK_STEP_CM = 14;
  // Кадр отрисовки: на время ОДНОГО прохода рендера точки группируются по стенам один раз
  // (иначе «лесенка» на каждую точку перебирала все точки проекта — квадрат от их числа
  // на каждом кадре). Вне кадра (трассировка, хит-тесты, смета) — прежний полный перебор:
  // там модель может меняться между вызовами, кэшировать нельзя.
  let frameEls = null, frameByWall = null;
  G.beginFrame = (project) => { frameEls = (project && project.elements) || null; frameByWall = null; };
  G.endFrame = () => { frameEls = null; frameByWall = null; };
  G.elemOverlapIndex = (project, el) => {
    if (!el.wallId) return 0;
    const STACK_CM = 3; // порог "то же место" — фиксированный, не зависит от зума
    let pool = project.elements || [];
    if (frameEls && frameEls === project.elements) {
      if (!frameByWall) {
        frameByWall = new Map();
        frameEls.forEach((e) => { if (!e.wallId) return; if (!frameByWall.has(e.wallId)) frameByWall.set(e.wallId, []); frameByWall.get(e.wallId).push(e); });
      }
      pool = frameByWall.get(el.wallId) || [];
    }
    const group = pool.filter((e) =>
      e.wallId === el.wallId && Math.abs((e.offset || 0) - (el.offset || 0)) <= STACK_CM);
    if (group.length < 2) return 0;
    group.sort((a, b) => (a.id < b.id ? -1 : a.id > b.id ? 1 : 0)); // стабильный порядок
    return Math.max(0, group.findIndex((e) => e.id === el.id));
  };
  G.elemDrawPoint = (project, el) => {
    const pt = G.elemPoint(project, el);
    if (!pt || !pt.wall) return pt;
    const fr = G.wallFrame(project, pt.wall, el.beamSide);
    if (!fr) return pt;
    const th = G.wallThOf(project, pt.wall);
    // розетка в откосе проёма — маркер стоит НА кромке проёма (в самом вырезе, на
    // поверхности откоса), БЕЗ отступа внутрь комнаты. Чуть сдвигаем вдоль стены
    // внутрь проёма (сторона "b" — к меньшему offset), чтобы сидел на откосе, не в углу.
    if (el.reveal) {
      const sign = el.reveal.side === "b" ? -1 : 1;
      const nudge = 6;
      return { x: pt.x + fr.dir.x * nudge * sign, y: pt.y + fr.dir.y * nudge * sign, wall: pt.wall, nrm: fr.nrm, angle: fr.angle };
    }
    const idx = G.elemOverlapIndex(project, el);
    const step = idx * G.STACK_STEP_CM;
    const d = th / 2 + 8 + step; // фикс. отступ от стены внутрь + ступенька лесенки
    return { x: pt.x + fr.nrm.x * d + fr.dir.x * step, y: pt.y + fr.nrm.y * d + fr.dir.y * step, wall: pt.wall, nrm: fr.nrm, angle: fr.angle };
  };

  // Шаг подрозетников в блоке, см (стандарт межцентрового расстояния ~71 мм)
  G.POST_SPACING = 7;
  /* КОРПУС ЩИТА — единый источник для развёртки, 3D и штробы у щита в смете (аудит цепей,
     пакет 4). Высота щита (panel.height, иначе settings.panelHeight) везде означает НИЗ
     корпуса — так она и описана в DEFAULTS; раньше развёртка и 3D рисовали её как СЕРЕДИНУ,
     и щит на чертеже стоял на полкорпуса ниже, чем считала смета. Габарит — подобранный
     корпус (settings.panelBox, мм), пока его не подобрали — типовой на 36 модулей (IEK). */
  G.PANEL_BOX_DEF = { w: 39.5, h: 43.5, d: 12 };
  G.panelBoxCm = (project) => {
    const b = (project && project.settings && project.settings.panelBox) || {};
    const D = G.PANEL_BOX_DEF;
    return { w: b.wmm > 0 ? b.wmm / 10 : D.w, h: b.hmm > 0 ? b.hmm / 10 : D.h, d: b.dmm > 0 ? b.dmm / 10 : D.d };
  };
  // Щит на этой стене? (развёртки, штроба к щиту) — ближе 60 см к оси И с ЕЁ стороны: общая
  // стена двух комнат — два объекта стены с одной осью, а щит висит только с одной стороны
  // (раньше он рисовался и считался в развёртках ОБЕИХ комнат). Щит прямо на оси — на обеих.
  G.panelOnWall = (project, w, pn) => {
    if (!w || !pn) return null;
    const c = G.closestOnSeg({ x: pn.x, y: pn.y }, w.a, w.b);
    if (c.d > 60) return null;
    if (c.d > 2 && !w.isBeam) {
      const fr = G.wallFrame(project, w);
      if (fr && fr.nrm && (pn.x - c.x) * fr.nrm.x + (pn.y - c.y) * fr.nrm.y < 0) return null;
    }
    return c;
  };
  G.panelBottom = (project, pn) => {
    const s = (project && project.settings) || {};
    const v = (pn && pn.height != null) ? pn.height : s.panelHeight;
    return Number.isFinite(Number(v)) ? Number(v) : 150;
  };
  /* Свойства ОТДЕЛЬНОГО ПОСТА блока (клавишность и вид выключателя).
     params.items — массив СТРОК-типов, и таким он и остаётся: его читают восемь мест
     (рендер, развёртка, расчёт, PDF, DXF, шаблоны, «мои блоки», геометрия штроб), и смена
     формы данных потребовала бы миграции всех проектов ради двух полей у одного типа поста.
     Поэтому свойства лежат ПАРАЛЛЕЛЬНО, в params.itemMeta[i] — старые проекты и все
     существующие читатели не затронуты вообще, а отсутствующая мета = прежние умолчания
     (1 клавиша, обычный выключатель). ЕДИНАЯ точка чтения: и рендер, и развёртка, и
     коннекторы в смете, и DXF берут клавишность отсюда, разойтись им негде. */
  G.postMeta = (el, i) => {
    const m = (el && el.params && el.params.itemMeta && el.params.itemMeta[i]) || null;
    return {
      keys: Math.max(1, Math.min(3, (m && m.keys) || 1)),
      swKind: (m && m.swKind) || "normal"
    };
  };
  // Индекс поста, к которому идёт штроба: заданный вручную или АВТО —
  // для блока из 2+ постов «середина левого», для 1 поста — центр.
  G.blockEntryIndex = (el) => {
    const items = (el.params && el.params.items) || [];
    const n = Math.max(1, items.length);
    let idx = el.entryPost;
    if (idx == null || idx < 0 || idx >= n) {
      // «Авто» — середина среди постов, куда приходит СВОЙ кабель блока (розетки/выключатели):
      // у ТВ/интернета теперь свой кабель к роутеру (аудит цепей, пакет 3), и силовая трасса
      // в блоке «розетка + интернет + ТВ» заходила бы в пост интернета. Блок без слаботочных
      // постов — как раньше (середина всех постов).
      const pw = items.map((t, i) => (t === "socket" || t === "switch") ? i : -1).filter((i) => i >= 0);
      if (pw.length && pw.length < items.length) idx = pw[Math.floor((pw.length - 1) / 2)];
      else idx = n >= 2 ? Math.floor((n - 1) / 2) : 0;
    }
    return idx;
  };
  // Мировая точка входа штробы в блок (позиция нужного подрозетника, с отступом от стены).
  G.blockEntryPoint = (project, el) => G.blockPostPoint(project, el, G.blockEntryIndex(el));
  // Мировая точка поста idx блока (с отступом от стены) — вход штробы силовой трассы и
  // начало отдельного кабеля слаботочного поста (ТВ/интернет) к роутеру
  G.blockPostPoint = (project, el, idx) => {
    const dp = G.elemDrawPoint(project, el);
    if (!dp || !dp.wall) return dp;
    const items = (el.params && el.params.items) || [];
    const n = Math.max(1, items.length);
    const fr = G.wallFrame(project, dp.wall, el.beamSide);
    const off = (idx - (n - 1) / 2) * G.POST_SPACING;
    return { x: dp.x + fr.dir.x * off, y: dp.y + fr.dir.y * off, wall: dp.wall };
  };
  // Точка подключения трассы к элементу: блок -> вход штробы (нужный пост), иначе -> сам элемент
  G.routeAnchor = (project, el) => (el.type === "block" ? G.blockEntryPoint(project, el) : G.elemDrawPoint(project, el));

  // ВИЗУАЛИЗАЦИЯ штроб В БЛОК (логика как в Пуле розеток, но по видам раздельно —
  // это НЕ единая точка подключения трассы (та — G.blockEntryIndex/routeAnchor),
  // а отдельные штробы на каждый вид тока):
  //  · силовая (розетка) — крайний ЛЕВЫЙ пост розетки;
  //  · выключатель + розетка вместе в блоке — штроба входит МЕЖДУ ними;
  //  · выключатель один (без розетки рядом) — штроба прямо к нему;
  //  · интернет/ТВ (слаботочка) — КАЖДЫЙ отдельной штробой прямо к своему посту.
  // Возвращает [{ idx: дробный индекс поста 0..n-1, kind: 'power'|'light'|'lv' }].
  G.blockChaseEntries = (el) => {
    const items = (el && el.params && el.params.items) || [];
    const power = [], light = [], lv = [];
    items.forEach((it, i) => {
      if (it === "socket") power.push(i);
      else if (it === "switch") light.push(i);
      else if (it === "internet" || it === "tv") lv.push(i);
    });
    const out = [];
    if (power.length) out.push({ idx: Math.min(...power), kind: "power" });
    if (light.length) {
      if (power.length) out.push({ idx: (Math.min(...light) + Math.min(...power)) / 2, kind: "light" });
      else light.forEach((i) => out.push({ idx: i, kind: "light" }));
    }
    lv.forEach((i) => out.push({ idx: i, kind: "lv" }));
    return out;
  };

  // Локальный «репер» стены: направление вдоль (a→b), нормаль ВНУТРЬ комнаты, угол в градусах.
  // Нужно, чтобы точки/блоки отступали от стены внутрь и поворачивались вдоль неё.
  // sideHint — ТОЛЬКО для балок/перегородок (wall.isBeam): у них нет своей комнаты
  // (roomId:null), поэтому «внутрь» пробой через pointInPolygon определить нечем —
  // обе стороны балки равноправны. sideHint = el.beamSide (см. plan-elements.js
  // placeAt) — какую сторону реально тапнул пользователь при установке ЭТОГО
  // элемента: -1 разворачивает nrm на противоположную сторону от базовой (+1/undefined).
  // Без sideHint (старые элементы до этого фикса, ЛЕД-лента и другие вызовы без
  // элемента) — прежняя фиксированная сторона, обратная совместимость сохранена.
  G.wallFrame = (project, wall, sideHint) => {
    if (!wall) return null;
    const len = wall.len || 1;
    const dir = { x: (wall.b.x - wall.a.x) / len, y: (wall.b.y - wall.a.y) / len };
    let nrm = { x: -dir.y, y: dir.x };
    if (wall.isBeam) {
      if (sideHint < 0) nrm = { x: -nrm.x, y: -nrm.y };
    } else {
      const room = (project.rooms || []).find((r) => r.id === wall.roomId);
      if (room && (room.points || []).length >= 3) {
        // проба ТОЧКОЙ РЯДОМ со стеной, а не центроидом всей комнаты — у вогнутых
        // контуров (Г-образная комната с вырезом под кладовку/нишу) общий центроид
        // может физически оказаться С ДРУГОЙ стороны конкретного локального сегмента
        // стены у вогнутого угла, разворачивая нормаль наружу вместо внутрь.
        const probe = { x: wall.mx + nrm.x * 2, y: wall.my + nrm.y * 2 };
        if (!G.pointInPolygon(probe, room.points)) { nrm = { x: -nrm.x, y: -nrm.y }; }
      }
    }
    let angle = Math.atan2(dir.y, dir.x) * 180 / Math.PI;
    // держим подписи/глифы «не вверх ногами»
    if (angle > 90) angle -= 180; else if (angle < -90) angle += 180;
    return { dir, nrm, angle };
  };

  /* ---------- ЦЕЛОСТНОСТЬ ГЕОМЕТРИИ (аудит Астры, 12.11) ----------
     Три вещи, без которых правка плана ломала модель молча:
     1) ОБЩАЯ ГРАНИЦА. Две комнаты, нарисованные вплотную, хранят каждая СВОЮ стену на одной
        оси. Тяга стены одной комнаты двигала только её — соседняя оставалась на месте, и
        комнаты наезжали друг на друга (аудит: стену гостиной на X=490, спальня осталась на
        400 — наложение 90 см). G.lineWalls находит стены других комнат ЭТОГО этажа на той же
        прямой, перекрывающиеся с тянущейся (и дальше вдоль прямой по цепочке перекрытий):
        физически это одна стена, двигаются они вместе.
     2) ВАЛИДНЫЙ КОНТУР И ПРОЁМЫ. G.geomProblems — что делает геометрию неверной: контур
        пересекает сам себя или выродился, проём шире стены или вылез за её край, проёмы
        перекрываются. Правка сравнивает список ДО и ПОСЛЕ и отказывает, только если появилась
        НОВАЯ проблема — проекты с уже кривыми данными остаются редактируемыми (их покажут
        «Проверки»), а сохранить новую ошибку нельзя ни пальцем, ни мышью, ни числом.
     3) ТОЧКИ И ПРОЁМЫ НА МЕСТЕ. Позиция на стене — отступ от её начала. Когда соседняя стена
        сдвигается, у этой меняется длина, и если сдвинулось именно НАЧАЛО, всё на ней уезжало
        вместе с ним. G.wallItemsSnap/G.wallItemsRestore: стена сдвинулась целиком — всё на ней
        едет с ней; поменяла длину или наклон — каждая вещь остаётся, где стояла (проекция
        прежней точки на новую стену). */
  G.SHARED_TOL = 2; // см: оси двух стен разошлись не больше — это одна стена
  const flOf = (project, x) => (x && x.floorId) || (project.floors && project.floors[0] && project.floors[0].id) || null;
  // стены других комнат того же этажа на прямой отрезка a-b, перекрывающиеся с ним (и дальше
  // по цепочке перекрытий вдоль этой прямой). Касание концами (комнаты в ряд) — не перекрытие.
  G.lineWalls = (project, room, a, b, tol) => {
    const T = tol == null ? G.SHARED_TOL : tol;
    const len = G.dist(a, b);
    if (len < 0.5) return [];
    const d = { x: (b.x - a.x) / len, y: (b.y - a.y) / len }, n = { x: -d.y, y: d.x };
    const fl = flOf(project, room), cands = [];
    (project.rooms || []).forEach((r) => {
      if (r.id === room.id || flOf(project, r) !== fl) return;
      G.walls(r).forEach((w) => {
        if (w.len < 0.5) return;
        const da = (w.a.x - a.x) * n.x + (w.a.y - a.y) * n.y, db = (w.b.x - a.x) * n.x + (w.b.y - a.y) * n.y;
        if (Math.abs(da) > T || Math.abs(db) > T) return;
        const ta = (w.a.x - a.x) * d.x + (w.a.y - a.y) * d.y, tb = (w.b.x - a.x) * d.x + (w.b.y - a.y) * d.y;
        cands.push({ room: r, wall: w, s: Math.min(ta, tb), e: Math.max(ta, tb) });
      });
    });
    const ivs = [[0, len]], out = [];
    let grew = true;
    while (grew) {
      grew = false;
      for (let k = 0; k < cands.length; k++) {
        const c = cands[k];
        if (c.taken || !ivs.some(([s, e]) => Math.min(e, c.e) - Math.max(s, c.s) > 1)) continue;
        c.taken = true; ivs.push([c.s, c.e]); out.push(c); grew = true;
      }
    }
    return out;
  };
  // вершины других комнат того же этажа в точке pt — общий угол
  G.coincidentVerts = (project, room, pt, tol) => {
    const T = tol == null ? 1 : tol, fl = flOf(project, room), out = [];
    (project.rooms || []).forEach((r) => {
      if (r.id === room.id || flOf(project, r) !== fl) return;
      (r.points || []).forEach((q, i) => { if (G.dist(q, pt) <= T) out.push({ room: r, i }); });
    });
    return out;
  };
  function segSegDist(p1, p2, q1, q2) {
    if (G.segIntersect(p1, p2, q1, q2)) return 0;
    return Math.min(G.closestOnSeg(p1, q1, q2).d, G.closestOnSeg(p2, q1, q2).d, G.closestOnSeg(q1, p1, p2).d, G.closestOnSeg(q2, p1, p2).d);
  }
  // контур пересекает или касается сам себя: несоседние рёбра сошлись, либо соседнее ребро
  // сложилось «назад» поверх предыдущего (шпилька). Вырожденные рёбра — отдельная проверка.
  G.polySelfIntersects = (pts) => {
    const n = (pts || []).length;
    if (n < 4) return false;
    for (let i = 0; i < n; i++) {
      const a1 = pts[i], a2 = pts[(i + 1) % n];
      for (let j = i + 2; j < n; j++) {
        if (i === 0 && j === n - 1) continue; // первое и последнее рёбра делят вершину
        if (segSegDist(a1, a2, pts[j], pts[(j + 1) % n]) < 0.5) return true;
      }
    }
    for (let i = 0; i < n; i++) {
      const p0 = pts[(i - 1 + n) % n], p1 = pts[i], p2 = pts[(i + 1) % n];
      const ax = p1.x - p0.x, ay = p1.y - p0.y, bx = p2.x - p1.x, by = p2.y - p1.y;
      const la = Math.sqrt(ax * ax + ay * ay), lb = Math.sqrt(bx * bx + by * by);
      if (la >= 0.5 && lb >= 0.5 && (ax * bx + ay * by) / (la * lb) < -0.999) return true;
    }
    return false;
  };
  const opName = (o) => {
    const k = o.kind || (o.type === "window" ? "window" : "door");
    return k === "window" ? "Окно" : k === "opening" ? "Проём" : k === "balcony" ? "Балконная дверь" : k === "sliding" ? "Раздвижная дверь" : "Дверь";
  };
  // все проёмы на ОДНОЙ ФИЗИЧЕСКОЙ стене: свои + со стен соседей того же этажа на этой оси.
  // Допуск плотный (SHARED_TOL), а не «×4 толщины», как у выреза в wallOpeningSpans: здесь
  // ищем ПЕРЕКРЫТИЕ, и дверь на стене через узкий коридор чужой считаться не должна.
  // s/e — интервал проёма в см вдоль этой стены от её начала.
  function physWallOpenings(project, wall, fl) {
    const len = wall.len || 1;
    const d = { x: (wall.b.x - wall.a.x) / len, y: (wall.b.y - wall.a.y) / len }, n = { x: -d.y, y: d.x };
    const on = (w2) => {
      if (w2.id === wall.id) return true;
      if (!(w2.len >= 0.5)) return false;
      const da = (w2.a.x - wall.a.x) * n.x + (w2.a.y - wall.a.y) * n.y, db = (w2.b.x - wall.a.x) * n.x + (w2.b.y - wall.a.y) * n.y;
      return Math.abs(da) <= G.SHARED_TOL && Math.abs(db) <= G.SHARED_TOL;
    };
    const byId = {};
    (project.rooms || []).forEach((r) => { if (flOf(project, r) === fl) G.walls(r).forEach((w2) => { if (on(w2)) byId[w2.id] = w2; }); });
    (project.beams || []).forEach((bm) => { if (flOf(project, bm) === fl) { const bw = G.beamWall(bm); if (bw && on(bw)) byId[bw.id] = bw; } });
    if (wall.isBeam || !byId[wall.id]) byId[wall.id] = wall;
    const out = [];
    (project.openings || []).forEach((o) => {
      const w2 = byId[o.wallId];
      if (!w2) return;
      const pa = G.pointAtOffset(w2, o.offset || 0), pb = G.pointAtOffset(w2, (o.offset || 0) + (o.width || 0));
      const ta = (pa.x - wall.a.x) * d.x + (pa.y - wall.a.y) * d.y, tb = (pb.x - wall.a.x) * d.x + (pb.y - wall.a.y) * d.y;
      out.push({ op: o, s: Math.min(ta, tb), e: Math.max(ta, tb) });
    });
    return out;
  }
  const wallFloor = (project, wall) => {
    if (!wall) return null;
    const own = wall.isBeam ? (project.beams || []).find((b) => b.id === wall.beamId) : (project.rooms || []).find((r) => r.id === wall.roomId);
    return flOf(project, own || {});
  };
  // проблемы стены: проём шире/за краем, проёмы перекрываются
  function wallProblems(project, w, label, push) {
    if (!(w.len >= 0.5)) return;
    const list = physWallOpenings(project, w, wallFloor(project, w));
    list.forEach((it) => {
      if (it.op.wallId !== w.id) return; // свой проём проверяем на своей стене
      if (it.op.width > w.len + 0.5) push("opwide:" + it.op.id, `${opName(it.op)} не помещается на стене ${w.n} ${label}: ширина ${Math.round(it.op.width)} см, стена ${Math.round(w.len)} см`, { kind: "opening", id: it.op.id });
      else if ((it.op.offset || 0) < -0.5 || (it.op.offset || 0) + it.op.width > w.len + 0.5) push("opout:" + it.op.id, `${opName(it.op)} выходит за край стены ${w.n} ${label}`, { kind: "opening", id: it.op.id });
    });
    for (let i = 0; i < list.length; i++) {
      for (let j = i + 1; j < list.length; j++) {
        const A = list[i], B = list[j];
        if (A.op.id === B.op.id || Math.min(A.e, B.e) - Math.max(A.s, B.s) <= 1) continue;
        if (A.op.wallId !== w.id && B.op.wallId !== w.id) continue; // чужая пара — проверит своя стена
        const own = A.op.wallId === w.id ? A.op : B.op;
        push("opover:" + [A.op.id, B.op.id].sort().join("|"), `Проёмы перекрываются на стене ${w.n} ${label}: ${opName(A.op).toLowerCase()} и ${opName(B.op).toLowerCase()}`, { kind: "opening", id: own.id });
      }
    }
  }
  // roomIds — только эти комнаты (правка), без него — весь проект (все этажи, «Проверки»)
  G.geomProblems = (project, roomIds) => {
    const ids = roomIds ? new Set(roomIds) : null;
    const out = [], seen = new Set();
    const push = (key, msg, ref) => { if (!seen.has(key)) { seen.add(key); out.push({ key, msg, ref }); } };
    (project.rooms || []).forEach((r) => {
      if (ids && !ids.has(r.id)) return;
      const label = "«" + (r.name || "Комната") + "»", ref = { kind: "room", id: r.id };
      const pts = r.points || [];
      if (pts.length < 3) { push("pts:" + r.id, `Комната ${label}: меньше трёх углов`, ref); return; }
      const ws = G.walls(r);
      if (ws.some((w) => w.len < 0.5)) push("edge:" + r.id, `Комната ${label}: два угла в одной точке — стена нулевой длины`, ref);
      else if (G.polySelfIntersects(pts)) push("self:" + r.id, `Контур комнаты ${label} пересекает сам себя`, ref);
      if (G.area(pts) < 1000) push("area:" + r.id, `Комната ${label} выродилась — меньше 0,1 м²`, ref);
      ws.forEach((w) => wallProblems(project, w, "(" + label + ")", push));
    });
    if (!ids) (project.beams || []).forEach((bm) => { const bw = G.beamWall(bm); if (bw) wallProblems(project, bw, "(перегородка)", push); });
    return out;
  };
  // проблемы, которых не было в списке before — то, что внесла эта правка
  G.newProblems = (before, after) => {
    const had = new Set((before || []).map((x) => x.key));
    return (after || []).filter((x) => !had.has(x.key));
  };
  // свободное место для проёма шириной width с центром около c на стене (свободное — не
  // занятое другими проёмами этой физической стены): offset или null, если места нет нигде.
  // Берётся промежуток, ближайший к желаемому центру. excludeId — сам этот проём.
  G.fitOpening = (project, wall, width, c, excludeId) => {
    if (!wall || !(width > 0) || width > wall.len + 0.5) return null;
    const occ = physWallOpenings(project, wall, wallFloor(project, wall))
      .filter((it) => it.op.id !== excludeId).map((it) => [it.s, it.e]).sort((x, y) => x[0] - y[0]);
    const free = [];
    let cur = 0;
    occ.forEach(([s, e]) => { if (s > cur) free.push([cur, s]); cur = Math.max(cur, e); });
    if (cur < wall.len) free.push([cur, wall.len]);
    let best = null;
    free.forEach(([s, e]) => {
      if (e - s + 0.5 < width) return;
      const off = Math.max(s, Math.min(e - width, c - width / 2));
      const dd = Math.abs(off + width / 2 - c);
      if (!best || dd < best.d) best = { d: dd, off };
    });
    return best ? Math.max(0, best.off) : null;
  };
  // снимок «что стоит на стенах этих комнат» (точки, проёмы, лента): прежние отступы, концы
  // стены и мировые позиции — чтобы после правки контура вернуть каждой вещи её место
  G.wallItemsSnap = (project, roomIds) => {
    const ids = new Set(roomIds || []);
    const mine = (wid) => { const s = String(wid || ""); return !!s && s.slice(0, 5) !== "beam:" && ids.has(s.split(":")[0]); };
    const out = [];
    const take = (k, o, wid, orig, at) => {
      const w = G.wallById(project, wid);
      if (!w) return;
      out.push({ k, o, wid, a: { x: w.a.x, y: w.a.y }, b: { x: w.b.x, y: w.b.y }, orig, pts: at.map((v) => G.pointAtOffset(w, v)) });
    };
    (project.elements || []).forEach((el) => { if (mine(el.wallId)) take("el", el, el.wallId, [el.offset], [el.offset || 0]); });
    (project.openings || []).forEach((op) => { if (mine(op.wallId)) take("op", op, op.wallId, [op.offset], [(op.offset || 0) + (op.width || 0) / 2]); });
    (project.ledStrips || []).forEach((ls) => { if (mine(ls.wallId)) take("led", ls, ls.wallId, [ls.offsetA, ls.offsetB], [ls.offsetA || 0, ls.offsetB || 0]); });
    return out;
  };
  // Возвращает вещи, которые пришлось СДВИНУТЬ к краю стены (их прежнее место оказалось за её
  // концом — стену укоротили): вызывающий говорит об этом, а не переносит молча.
  G.wallItemsRestore = (project, snap) => {
    const r1 = (v) => Math.round(v * 10) / 10;
    const shifted = [];
    (snap || []).forEach((it) => {
      const w = G.wallById(project, it.wid);
      if (!w) return;
      const vax = w.a.x - it.a.x, vay = w.a.y - it.a.y, vbx = w.b.x - it.b.x, vby = w.b.y - it.b.y;
      // стена не изменилась или сдвинулась целиком — отступы прежние (данные не трогаем вовсе)
      if (Math.abs(vax - vbx) < 0.01 && Math.abs(vay - vby) < 0.01) {
        if (it.k === "led") { it.o.offsetA = it.orig[0]; it.o.offsetB = it.orig[1]; } else it.o.offset = it.orig[0];
        return;
      }
      // проекция прежней мировой точки на прямую стены, БЕЗ обрезки — по ней видно, что вещь
      // оказалась за концом стены
      const L = w.len || 0, dx = w.b.x - w.a.x, dy = w.b.y - w.a.y;
      const raw = it.pts.map((q) => (L ? ((q.x - w.a.x) * dx + (q.y - w.a.y) * dy) / L : 0));
      if (it.k === "el") {
        const v = Math.max(0, Math.min(L, raw[0]));
        if (Math.abs(v - raw[0]) > 1) shifted.push(it);
        it.o.offset = r1(v);
      } else if (it.k === "op") {
        const ww = it.o.width || 0, want = raw[0] - ww / 2, v = Math.max(0, Math.min(Math.max(0, L - ww), want));
        if (Math.abs(v - want) > 1) shifted.push(it);
        it.o.offset = r1(v);
      } else {
        const x = Math.max(0, Math.min(L, raw[0])), y = Math.max(0, Math.min(L, raw[1]));
        if (Math.abs(x - raw[0]) > 1 || Math.abs(y - raw[1]) > 1) shifted.push(it);
        it.o.offsetA = r1(Math.min(x, y)); it.o.offsetB = r1(Math.max(x, y));
      }
    });
    return shifted;
  };

  G.polylineLen = (pts) => {
    let L = 0;
    for (let i = 0; i < pts.length - 1; i++) L += G.dist(pts[i], pts[i + 1]);
    return L;
  };

  // ---- форматирование ----
  G.fmtLen = (cm) => (cm >= 100 ? (Math.round(cm) / 100).toFixed(2).replace(/\.?0+$/, "") + " м" : Math.round(cm) + " см");
  G.fmtArea = (cm2) => (Math.round(cm2 / 1000) / 10).toFixed(1) + " м²";

  EP.Plan = EP.Plan || {};
  EP.Plan.Geometry = G;
})();
