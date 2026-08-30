/* Electric Pro V29 — 3D-прогулка: электрика (Слой 3).
   Точки, щиты, распайки, трассы и проходки — из той же модели, что и 2D-план.
   Позиция настенной точки берётся НЕ elemDrawPoint (та отступает от стены внутрь
   комнаты, чтобы маркер на чертеже не сливался со стеной), а от осевой линии
   стены + полтолщины: в 3D прибор должен сидеть ЗАПОДЛИЦО с поверхностью. */
(() => {
  "use strict";
  window.EP = window.EP || {};
  const P3 = (EP.Plan3D = EP.Plan3D || {});
  const G = () => EP.Plan.Geometry;
  const M = 0.01;

  // габариты приборов, см: рамка механизма, глубина выступа над стеной
  const DEV = { w: 8.2, h: 8.2, d: 1.4, blockStep: 7.1 };

  const isLamp = (t) => t === "light" || t === "bra" || t === "track";

  function circColor(THREE, p, el, fallback) {
    const c = (p.circuits || []).find((x) => x.id === el.circuitId);
    return new THREE.Color(c && c.color ? c.color : fallback);
  }

  // положение и разворот прибора на стене: осевая линия + полтолщины наружу,
  // в ту сторону, куда смотрит комната (та же нормаль, что у 2D-рендера)
  function wallSeat(p, el) {
    const w = G().wallById(p, el.wallId);
    if (!w) return null;
    const fr = G().wallFrame(p, w, el.beamSide);
    const c = G().pointAtOffset(w, el.offset || 0);
    const th = G().wallThOf(p, w);
    return {
      x: c.x + fr.nrm.x * th / 2, y: c.y + fr.nrm.y * th / 2,
      rot: Math.atan2(-fr.nrm.y, fr.nrm.x) - Math.PI / 2
    };
  }

  function build(THREE, scene, p, raw) {
    const D = P3.DEFAULTS;
    const S = raw.settings || {};
    const HH = S.ceilingHeight || 270;
    const group = new THREE.Group();
    group.name = "electro";
    scene.add(group);
    const lamps = [];   // {x,y,z,color} — для Слоя 4 (настоящие источники света)

    const matCache = new Map();
    const solid = (hex) => {
      const k = "s" + hex;
      if (!matCache.has(k)) matCache.set(k, new THREE.MeshStandardMaterial({ color: hex, roughness: 0.55, metalness: 0.05 }));
      return matCache.get(k);
    };
    const glow = (hex) => {
      const k = "g" + hex;
      if (!matCache.has(k)) matCache.set(k, new THREE.MeshStandardMaterial({ color: hex, emissive: hex, emissiveIntensity: 1.2, roughness: 0.4 }));
      return matCache.get(k);
    };
    const chaseMat = (hex) => {
      const k = "c" + hex;
      if (!matCache.has(k)) matCache.set(k, new THREE.MeshStandardMaterial({
        color: hex, transparent: true, opacity: 0.55, roughness: 0.7
      }));
      return matCache.get(k);
    };

    /* ---------- приборы ---------- */
    (p.elements || []).forEach((el) => {
      const col = circColor(THREE, p, el, isLamp(el.type) ? "#ffd9a0" : "#e8ecf2");
      if (el.wallId) {
        const seat = wallSeat(p, el);
        if (!seat) return;
        const items = el.type === "block" ? ((el.params && el.params.items) || ["socket"]) : [el.type];
        const wCm = el.type === "block" ? Math.max(DEV.w, items.length * DEV.blockStep + 1.1) : DEV.w;
        const g = new THREE.BoxGeometry(wCm * M, DEV.h * M, DEV.d * M);
        const m = new THREE.Mesh(g, solid(col.getHex()));
        m.position.set(seat.x * M, (el.height == null ? 30 : el.height) * M, seat.y * M);
        m.rotation.y = seat.rot;
        group.add(m);
        if (isLamp(el.type)) lamps.push({ x: seat.x * M, y: (el.height || HH) * M, z: seat.y * M, color: col.getHex() });
        return;
      }
      // свободные точки: свет/трек/распайка/ТП/выводы — у потолка или на полу
      const pt = G().elemDrawPoint(p, el);
      if (!pt) return;
      const y = (el.height == null ? HH : el.height);
      if (isLamp(el.type)) {
        const g = new THREE.SphereGeometry(9 * M, 12, 8);
        const m = new THREE.Mesh(g, glow(0xfff1d6));
        m.position.set(pt.x * M, (y - 6) * M, pt.y * M);
        group.add(m);
        lamps.push({ x: pt.x * M, y: (y - 8) * M, z: pt.y * M, color: 0xfff1d6 });
      } else {
        const g = new THREE.BoxGeometry(9 * M, 3 * M, 9 * M);
        const m = new THREE.Mesh(g, solid(col.getHex()));
        m.position.set(pt.x * M, Math.min(y, HH - 2) * M, pt.y * M);
        group.add(m);
      }
    });

    // светодиодная лента — светящийся брусок вдоль стены
    (p.ledStrips || []).forEach((ls) => {
      const w = G().wallById(p, ls.wallId);
      if (!w) return;
      const a = G().pointAtOffset(w, Math.min(ls.offsetA, ls.offsetB));
      const b = G().pointAtOffset(w, Math.max(ls.offsetA, ls.offsetB));
      const len = Math.hypot(b.x - a.x, b.y - a.y);
      if (len < 1) return;
      const g = new THREE.BoxGeometry(len * M, 2 * M, 2 * M);
      const m = new THREE.Mesh(g, glow(0xffe9c4));
      m.position.set((a.x + b.x) / 2 * M, (ls.height || HH - 10) * M, (a.y + b.y) / 2 * M);
      m.rotation.y = Math.atan2(-(b.y - a.y), b.x - a.x);
      group.add(m);
      lamps.push({ x: (a.x + b.x) / 2 * M, y: (ls.height || HH - 10) * M, z: (a.y + b.y) / 2 * M, color: 0xffe9c4 });
    });

    // щиты — шкаф на стене/в нише
    (p.panels || []).forEach((pn) => {
      const box = S.panelBox || {};
      const w = (box.wmm || 350) / 10, h = (box.hmm || 300) / 10, d = (box.dmm || 120) / 10;
      const g = new THREE.BoxGeometry(w * M, h * M, d * M);
      const m = new THREE.Mesh(g, solid(0xd7dbe2));
      const y = (pn.height != null ? pn.height : S.panelHeight || 150);
      m.position.set(pn.x * M, y * M, pn.y * M);
      group.add(m);
    });

    /* ---------- трассы ----------
       Route.points — готовая ломаная в плане (пересчитывать нечего). В 3D она идёт
       по потолку или по полу (route.routeType), а у своих концов спускается/
       поднимается к точке — это и есть штроба, которую видит монтажник. */
    const segBox = (ax, ay, az, bx, by, bz, wCm, hCm, mat) => {
      const dx = bx - ax, dy = by - ay, dz = bz - az;
      const len = Math.hypot(dx, dy, dz);
      if (len < 0.005) return null;
      const g = new THREE.BoxGeometry(len, hCm * M, wCm * M);
      const m = new THREE.Mesh(g, mat);
      m.position.set((ax + bx) / 2, (ay + by) / 2, (az + bz) / 2);
      // разворачиваем ось X бокса на направление отрезка
      const q = new THREE.Quaternion().setFromUnitVectors(
        new THREE.Vector3(1, 0, 0), new THREE.Vector3(dx, dy, dz).normalize());
      m.quaternion.copy(q);
      return m;
    };
    (p.routes || []).forEach((rt) => {
      const pts = rt.points || [];
      if (pts.length < 2) return;
      const col = new THREE.Color(rt.color || "#38bdf8").getHex();
      const mat = chaseMat(col);
      const floor = rt.routeType === "floor" || rt.chaseFloor;
      const runY = floor ? 3 * M : (HH - 3) * M;
      const cw = (rt.chaseW || S.chaseW || 25) / 10, ch = (rt.chaseH || S.chaseH || 30) / 10;
      for (let i = 0; i < pts.length - 1; i++) {
        const m = segBox(pts[i].x * M, runY, pts[i].y * M, pts[i + 1].x * M, runY, pts[i + 1].y * M, cw, ch, mat);
        if (m) group.add(m);
      }
      // спуск/подъём к самой точке на обоих концах трассы
      [[pts[0], rt.fromId], [pts[pts.length - 1], rt.toId]].forEach(([q, id]) => {
        const el = (p.elements || []).find((e) => e.id === id);
        const pn = (p.panels || []).find((x) => x.id === id);
        let y = null;
        if (el) y = (el.height == null ? HH : el.height) * M;
        else if (pn) y = (pn.height != null ? pn.height : S.panelHeight || 150) * M;
        if (y == null) return;
        const m = segBox(q.x * M, runY, q.y * M, q.x * M, y, q.y * M, cw, ch, mat);
        if (m) group.add(m);
      });
      // проходки через стены — гильза Ø sleeveD
      (rt.throughWalls || []).forEach((tw) => {
        const dmm = (S.sleeveD || 20) / 10;
        const g = new THREE.CylinderGeometry(dmm / 2 * M, dmm / 2 * M, 30 * M, 10);
        const m = new THREE.Mesh(g, chaseMat(col));
        m.rotation.z = Math.PI / 2;
        m.position.set(tw.x * M, runY, tw.y * M);
        group.add(m);
      });
    });

    return { group, lamps, dispose: () => matCache.forEach((m) => m.dispose()) };
  }

  P3.Electro = { build, wallSeat, DEV };
})();
