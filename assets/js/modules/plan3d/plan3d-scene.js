/* Electric Pro V29 — 3D-прогулка: построение сцены из данных проекта.
   Читает ТУ ЖЕ модель, что и 2D-план (project.rooms/openings/beams/voids) через
   существующие геттеры EP.Plan.Geometry — никакого дублирования данных, 3D это
   ещё одна проекция, как развёртка или печатный лист.
   План в СМ (x, y) -> мир three.js в МЕТРАХ (x, высота, z): плановый y = мировой z. */
(() => {
  "use strict";
  window.EP = window.EP || {};
  const P3 = (EP.Plan3D = EP.Plan3D || {});
  const G = () => EP.Plan.Geometry;

  const M = 0.01;                       // см -> метры
  const EPS = 1;                        // см: порог «одна и та же стена»

  // высота проёма, если у него не задана своя — тот же дефолт, что в развёртке
  const openH = (op) => (op && op.height) || (op && op.type === "window" ? 140 : 200);

  /* ---------- стена: разбивка по проёмам на сплошные куски ----------
     Настоящий вырез в стене БЕЗ CSG: стена режется вдоль своей длины на
     прямоугольные куски (слева/справа от проёма, под подоконником, над проёмом).
     Каждый кусок — обычный бокс. Дёшево, точно и не тянет за собой CSG-библиотеку. */
  function wallPieces(p, wall, H) {
    const L = wall.len || 0;
    if (L < 1) return { solid: [], block: [] };
    const spans = G().wallOpeningSpans(p, wall)
      .map((s) => {
        const op = (p.openings || []).find((o) => o.id === s.srcId);
        return { a: Math.max(0, s.offset), b: Math.min(L, s.offset + s.width), sill: s.sill || 0, h: openH(op) };
      })
      .filter((s) => s.b > s.a + 1)
      .sort((x, y) => x.a - y.a);
    const solid = [];   // {u0,u1,y0,y1} — куски стены (см)
    const block = [];   // [u0,u1] — участки, непроходимые для камеры
    let u = 0;
    spans.forEach((s) => {
      if (s.a > u + 1) { solid.push({ u0: u, u1: s.a, y0: 0, y1: H }); block.push([u, s.a]); }
      const top = Math.min(H, s.sill + s.h);
      if (s.sill > 0) solid.push({ u0: s.a, u1: s.b, y0: 0, y1: s.sill });        // под подоконником
      if (top < H) solid.push({ u0: s.a, u1: s.b, y0: top, y1: H });              // над проёмом
      if (s.sill > 0) block.push([s.a, s.b]);   // окно — не пройти; дверь/проём до пола — пройти
      u = Math.max(u, s.b);
    });
    if (u < L - 1) { solid.push({ u0: u, u1: L, y0: 0, y1: H }); block.push([u, L]); }
    return { solid, block };
  }

  // бокс вдоль отрезка: длина по оси стены, толщина поперёк, высота по y
  function boxAlong(THREE, mat, wall, u0, u1, y0, y1, th) {
    const L = wall.len || 1;
    const dx = (wall.b.x - wall.a.x) / L, dy = (wall.b.y - wall.a.y) / L;
    const um = (u0 + u1) / 2;
    const cx = wall.a.x + dx * um, cy = wall.a.y + dy * um;
    const g = new THREE.BoxGeometry((u1 - u0) * M, (y1 - y0) * M, th * M);
    const m = new THREE.Mesh(g, mat);
    m.position.set(cx * M, (y0 + y1) / 2 * M, cy * M);
    m.rotation.y = Math.atan2(-dy, dx);
    return m;
  }

  // плоскость пола/потолка по полигону комнаты
  function slab(THREE, mat, pts, yCm) {
    const shape = new THREE.Shape(pts.map((q) => new THREE.Vector2(q.x * M, q.y * M)));
    const g = new THREE.ShapeGeometry(shape);
    g.rotateX(Math.PI / 2);              // (x, y, 0) -> (x, 0, y): плановый y становится мировым z
    const m = new THREE.Mesh(g, mat);
    m.position.y = yCm * M;
    return m;
  }

  /* ---------- сборка ---------- */
  function build(THREE, scene, p, raw) {
    const D = P3.DEFAULTS;
    const S = raw.settings || {};
    const mats = P3.Materials.make(THREE, p);
    const group = new THREE.Group();
    scene.add(group);
    const collide = [];  // отрезки в МЕТРАХ: {ax,az,bx,bz,th}
    const pushCollide = (wall, u0, u1, th) => {
      const L = wall.len || 1;
      const dx = (wall.b.x - wall.a.x) / L, dy = (wall.b.y - wall.a.y) / L;
      collide.push({
        ax: (wall.a.x + dx * u0) * M, az: (wall.a.y + dy * u0) * M,
        bx: (wall.a.x + dx * u1) * M, bz: (wall.a.y + dy * u1) * M, th: th * M
      });
    };

    const rooms = (p.rooms || []).filter((r) => (r.points || []).length >= 3);
    // Одна и та же физическая стена принадлежит ДВУМ соседним комнатам (общий шов) —
    // без дедупликации по осевой линии в 3D вставали бы два совпадающих бокса
    // (мерцание совпадающих граней и лишняя геометрия).
    const seen = new Set();
    const key = (w) => {
      const a = [Math.round(w.a.x), Math.round(w.a.y)], b = [Math.round(w.b.x), Math.round(w.b.y)];
      return (a[0] < b[0] || (a[0] === b[0] && a[1] <= b[1]) ? a.concat(b) : b.concat(a)).join(",");
    };

    rooms.forEach((room) => {
      const H = room.height || S.ceilingHeight || 270;
      group.add(slab(THREE, mats.floor, room.points, 0));
      group.add(slab(THREE, mats.ceil, room.points, H));
      G().walls(room).forEach((w) => {
        const k = key(w);
        if (seen.has(k)) return;
        seen.add(k);
        const th = G().wallThOf(p, w);
        const mat = mats.wallOf(G().wallMatOf(p, w));
        const { solid, block } = wallPieces(p, w, H);
        solid.forEach((s) => group.add(boxAlong(THREE, mat, w, s.u0, s.u1, s.y0, s.y1, th)));
        block.forEach(([u0, u1]) => pushCollide(w, u0, u1, th));
      });
    });

    // перегородки и перемычки (project.beams): «beam» — от пола до потолка,
    // «lintel» — только сверху (низ свободен, под ней проходят)
    const HH = S.ceilingHeight || 270;
    (p.beams || []).forEach((b) => {
      const w = G().beamWall(b);
      if (!w || w.len < 1) return;
      const th = b.width || S.wallThickness || 10;
      const mat = mats.wallOf(b.material || S.wallMaterial);
      if (b.kind === "lintel") {
        group.add(boxAlong(THREE, mat, w, 0, w.len, HH - D.lintelH, HH, th));
      } else {
        const { solid, block } = wallPieces(p, w, HH);
        solid.forEach((s) => group.add(boxAlong(THREE, mat, w, s.u0, s.u1, s.y0, s.y1, th)));
        block.forEach(([u0, u1]) => pushCollide(w, u0, u1, th));
      }
    });

    // вентшахты (Void kind:"shaft") — непроходимый объём; kind:"room" в 2D это
    // только контур (мини-комната), объёма у него нет — в 3D не строим
    (p.voids || []).filter((v) => v.kind === "shaft").forEach((v) => {
      const x0 = Math.min(v.a.x, v.b.x), x1 = Math.max(v.a.x, v.b.x);
      const z0 = Math.min(v.a.y, v.b.y), z1 = Math.max(v.a.y, v.b.y);
      const g = new THREE.BoxGeometry((x1 - x0) * M, HH * M, (z1 - z0) * M);
      const m = new THREE.Mesh(g, mats.shaft);
      m.position.set((x0 + x1) / 2 * M, HH / 2 * M, (z0 + z1) / 2 * M);
      group.add(m);
      const seg = (ax, az, bx, bz) => collide.push({ ax: ax * M, az: az * M, bx: bx * M, bz: bz * M, th: 0.02 });
      seg(x0, z0, x1, z0); seg(x1, z0, x1, z1); seg(x1, z1, x0, z1); seg(x0, z1, x0, z0);
    });

    // Базовое освещение — чтобы Слой 1/2 был виден до появления настоящих ламп
    // (Слой 4 добавит источники по нарисованным светильникам и солнце в окна).
    // ДВА направленных с разных сторон, а не один: у стен нормали горизонтальные,
    // от одной полусферы они все получают ОДИНАКОВУЮ яркость и углы комнаты
    // становятся неразличимы — вид «плоская серая стена» (поймано первым прогоном).
    const hemi = new THREE.HemisphereLight(0xdfe8ff, 0x8d94a3, 1.5);
    scene.add(hemi);
    const d1 = new THREE.DirectionalLight(0xfff6e8, 1.5);
    d1.position.set(4, 8, 2);
    scene.add(d1);
    const d2 = new THREE.DirectionalLight(0xdce6ff, 0.7);
    d2.position.set(-5, 6, -3);
    scene.add(d2);

    // точка старта — центр первой комнаты (для вогнутых центроид может лечь вне
    // полигона, тогда берём середину bbox по её точкам)
    const r0 = rooms[0];
    let sp = G().centroid(r0.points);
    if (!G().pointInPolygon(sp, r0.points)) {
      const xs = r0.points.map((q) => q.x), ys = r0.points.map((q) => q.y);
      sp = { x: (Math.min(...xs) + Math.max(...xs)) / 2, y: (Math.min(...ys) + Math.max(...ys)) / 2 };
    }
    return { group, collide, spawn: { x: sp.x * M, z: sp.y * M }, ceilHeight: HH };
  }

  P3.Scene = { build, wallPieces };
})();
