/* Electric Pro V29 — 3D-прогулка: свет (Слой 4).
   Светит РОВНО от тех ламп, что нарисованы на плане (light/bra/track + ленты), и
   солнце — в окна, с той стороны, откуда реально светило бы (settings.northDeg).

   ВАЖНО про число источников: WebGL считает свет в шейдере, и на каждый источник
   шейдер перекомпилируется/дорожает — в квартире на 15-20 ламп сцена встанет.
   Поэтому источников создаётся ФИКСИРОВАННОЕ небольшое число (DEFAULTS.maxLights),
   и раз в кадр они ПЕРЕВЕШИВАЮТСЯ на ближайшие к камере лампы. Дальние лампы
   продолжают светиться сами (emissive-материал плафона), но комнату не освещают —
   на прогулке этого не видно, зато fps не падает. */
(() => {
  "use strict";
  window.EP = window.EP || {};
  const P3 = (EP.Plan3D = EP.Plan3D || {});
  const G = () => EP.Plan.Geometry;
  const M = 0.01;

  function build(THREE, scene, p, raw, lamps) {
    const D = P3.DEFAULTS;
    const S = raw.settings || {};
    const pool = [];
    for (let i = 0; i < D.maxLights; i++) {
      const l = new THREE.PointLight(0xfff1d6, 0, D.lampRange * M, 1.6);
      l.visible = false;
      scene.add(l);
      pool.push(l);
    }

    /* ---------- солнце ----------
       Направление: азимут = «север» плана (settings.northDeg) + сторона, куда
       смотрит ОКНО. Если окон нет — просто светим с юга плана, чтобы сцена не
       осталась без направленного света. */
    const sun = new THREE.DirectionalLight(0xfff4e0, D.sunIntensity);
    const north = ((S.northDeg || 0) * Math.PI) / 180;
    let az = north + Math.PI;              // по умолчанию — «с юга»
    const wins = [];
    (p.rooms || []).forEach((r) => G().walls(r).forEach((w) => {
      G().wallOpeningSpans(p, w).forEach((s) => {
        const op = (p.openings || []).find((o) => o.id === s.srcId);
        if (!op || op.type !== "window") return;
        const fr = G().wallFrame(p, w);
        // нормаль смотрит В комнату, значит солнце должно идти ей навстречу
        wins.push(Math.atan2(-fr.nrm.y, -fr.nrm.x));
      });
    }));
    if (wins.length) {
      // среднее направление окон (через вектора — иначе 350° и 10° дали бы 180°)
      let cx = 0, cy = 0;
      wins.forEach((a) => { cx += Math.cos(a); cy += Math.sin(a); });
      az = Math.atan2(cy, cx) + north;
    }
    const alt = (D.sunAltitudeDeg * Math.PI) / 180;
    sun.position.set(
      Math.cos(az) * Math.cos(alt) * 40,
      Math.sin(alt) * 40,
      Math.sin(az) * Math.cos(alt) * 40
    );
    scene.add(sun);
    const amb = new THREE.HemisphereLight(0xcfe0ff, 0x6a7382, D.ambient);
    scene.add(amb);

    // раз в кадр: перевесить пул источников на ближайшие лампы
    let acc = 0;
    function update(dt, camera) {
      acc += dt;
      if (acc < D.lightRebindSec) return;   // не каждый кадр — сортировка не бесплатна
      acc = 0;
      if (!lamps.length) return;
      const cp = camera.position;
      const near = lamps
        .map((l) => ({ l, d: (l.x - cp.x) ** 2 + (l.y - cp.y) ** 2 + (l.z - cp.z) ** 2 }))
        .sort((a, b) => a.d - b.d)
        .slice(0, pool.length);
      pool.forEach((src, i) => {
        const n = near[i];
        if (!n) { src.visible = false; src.intensity = 0; return; }
        src.position.set(n.l.x, n.l.y, n.l.z);
        src.color.setHex(n.l.color);
        src.intensity = D.lampIntensity;
        src.visible = true;
      });
    }
    return { update, sun, pool, azimuth: az };
  }

  P3.Light = { build };
})();
