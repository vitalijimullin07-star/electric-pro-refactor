/* Electric Pro V29 — 3D-прогулка: адаптивное качество (Слой 5).
   Уровень определяется САМОЗАМЕРОМ (сколько миллисекунд реально занимает кадр на
   ЭТОМ устройстве), а не по названию телефона: модель ни о чём не говорит — один и
   тот же аппарат тормозит в фоне и летает на свежей перезагрузке. Тот же принцип,
   что у perfLevel в visual-settings.js (там детект по возможностям + монитор FPS).

   Рычаги, которые работают БЕЗ пересборки сцены (её перестройка на ходу дала бы
   заметный рывок и лишний мусор в памяти):
     · разрешение рендера (renderer.setPixelRatio) — самый сильный;
     · сколько источников света реально светит (шейдер дорожает с каждым);
     · дальность отсечения камеры + туман, чтобы не рисовать дальние комнаты.
   Антиалиасинг переключать нельзя — это атрибут КОНТЕКСТА, задаётся при создании
   рендерера; менять его можно только пересоздав канвас, что дороже пользы. */
(() => {
  "use strict";
  window.EP = window.EP || {};
  const P3 = (EP.Plan3D = EP.Plan3D || {});

  // от слабого к сильному; dpr домножается на реальный devicePixelRatio с капом
  const LEVELS = [
    { id: "low", dpr: 0.7, lights: 2, far: 35, fog: true },
    { id: "mid", dpr: 1.0, lights: 4, far: 70, fog: true },
    { id: "high", dpr: 2.0, lights: 6, far: 120, fog: false }
  ];
  const CFG = {
    probeSec: 1.2,      // сколько замеряем на входе, прежде чем выбрать уровень
    dropFps: 42,        // ниже — снижаем уровень
    raiseFps: 57,       // выше — можно попробовать поднять
    dropHold: 2,        // сек подряд ниже порога
    raiseHold: 6        // сек подряд выше (гистерезис: реже поднимаем, чем роняем)
  };

  // Какой API реально достался. WebGPU НЕ подключаем: в three.js он живёт в
  // ОТДЕЛЬНОЙ сборке (three.webgpu.js, +1 МБ к весу), а на этой сцене узкое место
  // не в числе вызовов отрисовки, а в закраске пикселей — выигрыш был бы нулевой
  // при заметной плате за вес и второй код-пас.
  function detect(renderer) {
    const gl = renderer.getContext ? renderer.getContext() : null;
    const isGL2 = !!(gl && window.WebGL2RenderingContext && gl instanceof window.WebGL2RenderingContext);
    return { api: isGL2 ? "webgl2" : "webgl", maxTexture: gl ? gl.getParameter(gl.MAX_TEXTURE_SIZE) : 0 };
  }

  function attach(THREE, renderer, camera, scene, lightRig) {
    const dprMax = window.devicePixelRatio || 1;
    let idx = LEVELS.length - 1;        // стартуем на максимуме — иначе нечего замерять
    let probe = 0, probeFrames = 0, probeMs = 0;
    let sec = 0, frames = 0, lowSec = 0, highSec = 0;
    const info = detect(renderer);

    function apply(i) {
      idx = Math.max(0, Math.min(LEVELS.length - 1, i));
      const L = LEVELS[idx];
      renderer.setPixelRatio(Math.min(dprMax, L.dpr));
      renderer.setSize(window.innerWidth, window.innerHeight, false);
      camera.far = L.far;
      camera.updateProjectionMatrix();
      scene.fog = L.fog ? new THREE.Fog(scene.background ? scene.background.getHex() : 0x0d1526, L.far * 0.45, L.far) : null;
      if (lightRig && lightRig.pool) lightRig.pool.forEach((l, k) => { if (k >= L.lights) { l.visible = false; l.intensity = 0; } });
      if (lightRig) lightRig.activeLights = L.lights;
      return L;
    }
    apply(idx);

    // dt приходит из общего цикла кадров — своего таймера не заводим
    function update(dt) {
      if (probe < CFG.probeSec) {       // фаза самозамера: копим реальное время кадра
        probe += dt; probeFrames++; probeMs += dt * 1000;
        if (probe >= CFG.probeSec && probeFrames > 5) {
          const avg = probeMs / probeFrames;
          // 16.7мс ≈ 60fps, 22мс ≈ 45fps: ниже — устройство не тянет максимум
          apply(avg <= 18 ? 2 : avg <= 30 ? 1 : 0);
        }
        return;
      }
      sec += dt; frames++;
      if (sec < 1) return;
      const fps = frames / sec;
      sec = 0; frames = 0;
      if (fps < CFG.dropFps) { lowSec++; highSec = 0; } else if (fps > CFG.raiseFps) { highSec++; lowSec = 0; } else { lowSec = 0; highSec = 0; }
      if (lowSec >= CFG.dropHold && idx > 0) { apply(idx - 1); lowSec = 0; }
      else if (highSec >= CFG.raiseHold && idx < LEVELS.length - 1) { apply(idx + 1); highSec = 0; }
    }

    return { update, apply, info, level: () => LEVELS[idx].id, levels: LEVELS };
  }

  P3.Quality = { attach, detect, LEVELS, CFG };
})();
