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

  // Привязка к углам существующих комнат (радиус в см), иначе к сетке
  G.snapSmart = (project, p, step, cornerRadius) => {
    let best = null;
    (project.rooms || []).forEach((r) => (r.points || []).forEach((c) => {
      const d = G.dist(p, c);
      if (d <= cornerRadius && (!best || d < best.d)) best = { d, x: c.x, y: c.y };
    }));
    return best ? { x: best.x, y: best.y } : G.snapPoint(p, step);
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

  // ---- форматирование ----
  G.fmtLen = (cm) => (cm >= 100 ? (Math.round(cm) / 100).toFixed(2).replace(/\.?0+$/, "") + " м" : Math.round(cm) + " см");
  G.fmtArea = (cm2) => (Math.round(cm2 / 1000) / 10).toFixed(1) + " м²";

  EP.Plan = EP.Plan || {};
  EP.Plan.Geometry = G;
})();
