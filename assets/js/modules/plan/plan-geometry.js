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
  G.dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);

  // Привязка: угол комнаты -> выравнивание по осям чужих углов -> сетка.
  // snapped=true только для угла/оси (значимая привязка) — НЕ для рядового
  // округления по сетке, чтобы вызывающий код мог дать тактильный отклик
  // только на реальный снап, а не на каждый тап.
  G.snapSmart = (project, p, step, cornerRadius) => {
    let best = null, ax = null, ay = null;
    (project.rooms || []).forEach((r) => (r.points || []).forEach((c) => {
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
    return G.walls(room)[Number(iStr)] || null;
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

  // ---- контур ТРАССИРОВКИ: отступ от внутренней грани стены на extra см ----
  // Линии кабеля идут по этому контуру — параллельно стенам, не по стене.
  G.insetContour = (project, room, extra) => {
    const ring = offsetRing(project, room, 1, Math.max(0, extra || 0));
    if (!ring) return null;
    // выродившийся контур (отступ больше комнаты) — не годится
    return G.area(ring) > 100 ? ring : null;
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
    return { x, y, t, d: Math.hypot(p.x - x, p.y - y) };
  };
  G.wallAt = (project, p, maxD) => {
    const cands = [];
    (project.rooms || []).forEach((r) => G.walls(r).forEach((w) => {
      const c = G.closestOnSeg(p, w.a, w.b);
      if (c.d <= maxD) cands.push({ wall: w, hit: c, offset: Math.round(c.t * w.len) });
    }));
    // перегородки/балки тоже принимают проёмы
    (project.beams || []).forEach((bm) => {
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
      const fr = G.wallFrame(project, cand.wall);
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
    (project.rooms || []).find((r) => (r.points || []).length >= 3 && G.pointInPolygon(p, r.points)) || null;

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
  G.setRectDims = (room, w, h) => {
    const d = G.rectDims(room);
    if (!d) return;
    room.points = G.rectPoints(d.x, d.y, Math.max(10, w), Math.max(10, h));
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
  // Куда идёт свет от выключателя: ручное назначение (el.targetId) — приоритет;
  // иначе АВТО — ближайшая лампа/вывод той же ЛИНИИ (QF) в той же комнате
  // (без линии связь не рисуем — слишком много ложных совпадений).
  // keyIdx — номер клавиши (0-based), для многоклавишных выключателей у каждой
  // клавиши своя цель; для проходных/перекрёстных клавиши не различаем (keyIdx=0).
  G.switchTarget = (project, el, keyIdx) => {
    if (!el || el.type !== "switch") return null;
    const ki = keyIdx || 0;
    const manualId = (el.targetIds && el.targetIds[ki]) || (ki === 0 ? el.targetId : null);
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
    for (let i = 0; i < pts.length - 1; i++) {
      (project.rooms || []).forEach((room) => G.walls(room).forEach((w) => {
        if (w.id === skipWallId) return;
        const hit = G.segIntersect(pts[i], pts[i + 1], w.a, w.b);
        if (hit) out.push({ x: hit.x, y: hit.y, wallId: w.id });
      }));
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
  G.wallOpeningSpans = (project, wall) => {
    const out = G.openingsOnWall(project, wall.id).map((o) => ({ offset: o.offset, width: o.width, sill: o.sill }));
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
        if (e > s + 1) out.push({ offset: s, width: e - s, sill: o.sill });
      });
    });
    return out;
  };

  // ЕДИНАЯ точка отрисовки/трассировки элемента на стене: ОДИНАКОВЫЙ небольшой отступ
  // внутрь комнаты (в СМ, не зависит ни от зума, ни от линии QF) — точки стоят ровно у
  // стены, не «расползаются». И маркер, и трасса берут ОДНУ эту точку — линия доходит до точки.
  G.elemDrawPoint = (project, el) => {
    const pt = G.elemPoint(project, el);
    if (!pt || !pt.wall) return pt;
    const fr = G.wallFrame(project, pt.wall);
    if (!fr) return pt;
    const th = G.wallThOf(project, pt.wall);
    const d = th / 2 + 8; // фикс. отступ от стены внутрь, одинаковый для всех точек
    return { x: pt.x + fr.nrm.x * d, y: pt.y + fr.nrm.y * d, wall: pt.wall, nrm: fr.nrm, angle: fr.angle };
  };

  // Шаг подрозетников в блоке, см (стандарт межцентрового расстояния ~71 мм)
  G.POST_SPACING = 7;
  // Индекс поста, к которому идёт штроба: заданный вручную или АВТО —
  // для блока из 2+ постов «середина левого», для 1 поста — центр.
  G.blockEntryIndex = (el) => {
    const items = (el.params && el.params.items) || [];
    const n = Math.max(1, items.length);
    let idx = el.entryPost;
    if (idx == null || idx < 0 || idx >= n) idx = n >= 2 ? Math.floor((n - 1) / 2) : 0;
    return idx;
  };
  // Мировая точка входа штробы в блок (позиция нужного подрозетника, с отступом от стены).
  G.blockEntryPoint = (project, el) => {
    const dp = G.elemDrawPoint(project, el);
    if (!dp || !dp.wall) return dp;
    const items = (el.params && el.params.items) || [];
    const n = Math.max(1, items.length);
    const idx = G.blockEntryIndex(el);
    const fr = G.wallFrame(project, dp.wall);
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
  G.wallFrame = (project, wall) => {
    if (!wall) return null;
    const len = wall.len || 1;
    const dir = { x: (wall.b.x - wall.a.x) / len, y: (wall.b.y - wall.a.y) / len };
    let nrm = { x: -dir.y, y: dir.x };
    const room = (project.rooms || []).find((r) => r.id === wall.roomId);
    if (room && (room.points || []).length >= 3) {
      // проба ТОЧКОЙ РЯДОМ со стеной, а не центроидом всей комнаты — у вогнутых
      // контуров (Г-образная комната с вырезом под кладовку/нишу) общий центроид
      // может физически оказаться С ДРУГОЙ стороны конкретного локального сегмента
      // стены у вогнутого угла, разворачивая нормаль наружу вместо внутрь.
      const probe = { x: wall.mx + nrm.x * 2, y: wall.my + nrm.y * 2 };
      if (!G.pointInPolygon(probe, room.points)) { nrm = { x: -nrm.x, y: -nrm.y }; }
    }
    let angle = Math.atan2(dir.y, dir.x) * 180 / Math.PI;
    // держим подписи/глифы «не вверх ногами»
    if (angle > 90) angle -= 180; else if (angle < -90) angle += 180;
    return { dir, nrm, angle };
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
