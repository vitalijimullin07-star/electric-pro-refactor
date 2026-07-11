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

  // Привязка: угол комнаты -> выравнивание по осям чужих углов -> сетка
  G.snapSmart = (project, p, step, cornerRadius) => {
    let best = null, ax = null, ay = null;
    (project.rooms || []).forEach((r) => (r.points || []).forEach((c) => {
      const d = G.dist(p, c);
      if (d <= cornerRadius && (!best || d < best.d)) best = { d, x: c.x, y: c.y };
      if (Math.abs(p.x - c.x) <= cornerRadius && (ax == null || Math.abs(p.x - c.x) < Math.abs(p.x - ax))) ax = c.x;
      if (Math.abs(p.y - c.y) <= cornerRadius && (ay == null || Math.abs(p.y - c.y) < Math.abs(p.y - ay))) ay = c.y;
    }));
    if (best) return { x: best.x, y: best.y };
    return { x: ax != null ? ax : G.snap(p.x, step), y: ay != null ? ay : G.snap(p.y, step) };
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
  G.wallById = (project, wallId) => {
    const [roomId, iStr] = String(wallId || "").split(":");
    const room = (project.rooms || []).find((r) => r.id === roomId);
    if (!room) return null;
    return G.walls(room)[Number(iStr)] || null;
  };

  // ---- попадания ----
  G.closestOnSeg = (p, a, b) => {
    const dx = b.x - a.x, dy = b.y - a.y, L2 = dx * dx + dy * dy;
    const t = L2 ? Math.max(0, Math.min(1, ((p.x - a.x) * dx + (p.y - a.y) * dy) / L2)) : 0;
    const x = a.x + t * dx, y = a.y + t * dy;
    return { x, y, t, d: Math.hypot(p.x - x, p.y - y) };
  };
  G.wallAt = (project, p, maxD) => {
    let best = null;
    (project.rooms || []).forEach((r) => G.walls(r).forEach((w) => {
      const c = G.closestOnSeg(p, w.a, w.b);
      if (c.d <= maxD && (!best || c.d < best.hit.d)) best = { wall: w, hit: c, offset: Math.round(c.t * w.len) };
    }));
    return best;
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

  // ЕДИНАЯ точка отрисовки/трассировки элемента на стене: фиксированный отступ внутрь
  // комнаты (в СМ, не зависит от зума) + «полоса» по номеру линии QF (зазор между трассами).
  // И маркер, и трасса берут ОДНУ эту точку — поэтому линия всегда доходит до точки.
  G.elemDrawPoint = (project, el) => {
    const pt = G.elemPoint(project, el);
    if (!pt || !pt.wall) return pt;
    const fr = G.wallFrame(project, pt.wall);
    if (!fr) return pt;
    const th = Math.max(4, (project.settings && project.settings.wallThickness) || 10);
    const laneIdx = el.circuitId ? (project.circuits || []).findIndex((c) => c.id === el.circuitId) : -1;
    const lane = laneIdx < 0 ? 0 : laneIdx;
    const d = th / 2 + 11 + lane * 5; // фикс. отступ + зазор по линии
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

  // Точка элемента, СДВИНУТАЯ внутрь комнаты от стены (чтобы трасса не шла по стене
  // и параллельные линии разных QF не ложились друг на друга). extra — доп. отступ (полоса).
  G.elemInsetPoint = (project, el, extra) => {
    const pt = G.elemPoint(project, el);
    if (!pt || !pt.wall) return pt;
    const fr = G.wallFrame(project, pt.wall);
    if (!fr) return pt;
    const th = Math.max(4, (project.settings && project.settings.wallThickness) || 10);
    const d = th / 2 + (extra == null ? 12 : extra);
    return { x: pt.x + fr.nrm.x * d, y: pt.y + fr.nrm.y * d, wall: pt.wall };
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
      const c = G.centroid(room.points);
      if ((c.x - wall.mx) * nrm.x + (c.y - wall.my) * nrm.y < 0) { nrm = { x: -nrm.x, y: -nrm.y }; }
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
