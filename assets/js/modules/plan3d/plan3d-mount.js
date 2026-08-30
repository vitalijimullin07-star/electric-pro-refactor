/* Electric Pro V29 — 3D-прогулка по плану: каркас режима.
   Кнопка «🚶 3D» в шапке редактора плана открывает СВОЙ fullscreen-контейнер
   с WebGL-канвасом поверх обычного 2D-плана. 3D только ПОКАЗЫВАЕТ уже
   нарисованное: единственный способ редактировать план — прежний 2D-редактор.
   three.js грузится ДИНАМИЧЕСКИМ import() при первом входе — обычная работа
   с планом её вес не тянет (см. assets/js/vendor/three/README.md). */
(() => {
  "use strict";
  window.EP = window.EP || {};
  const P3 = (EP.Plan3D = EP.Plan3D || {});

  const T = {
    open: "🚶 3D", exit: "Выйти", loading: "Загружаю 3D…",
    noRooms: "Сначала нарисуй хотя бы одну комнату — по ней и строится 3D.",
    failed: "Не удалось запустить 3D на этом устройстве",
    sensors: "Включить датчики", sensorsHint: "Осмотр поворотом телефона",
    hint: "Джойстик снизу — идти. Веди пальцем по экрану — осмотреться."
  };

  // Единый центр настроек 3D — здесь и только здесь магические числа режима.
  const DEFAULTS = {
    eyeHeight: 170,        // см от пола: рост «игрока»
    walkSpeed: 220,        // см/сек
    bodyRadius: 22,        // см: радиус цилиндра камеры для коллизии
    near: 0.05, far: 120,  // метры
    fov: 72,
    joyRadius: 60,         // px: радиус хода стика
    joyDead: 8,            // px: мёртвая зона
    lookSpeed: 0.0032,     // рад на px свайпа
    pitchLimit: 1.35       // рад: ограничение взгляда вверх/вниз
  };
  P3.DEFAULTS = DEFAULTS;
  P3.CM = 0.01;            // см -> метры (three.js работает в метрах)

  const core = () => EP.Plan.Core;
  const G = () => EP.Plan.Geometry;
  const $ = (s) => document.querySelector(s);

  // состояние режима; всё, что нужно освободить при выходе, живёт здесь
  const S = { on: false, THREE: null, renderer: null, scene: null, camera: null,
    raf: 0, ctl: null, box: null, loading: false, lastT: 0 };
  P3.state = S;

  function toast(msg) {
    const r = EP.Plan.Rooms;
    if (r && r.toast) r.toast(msg); else alert(msg);
  }

  /* ---------- контейнер режима ---------- */
  function buildBox() {
    const d = document.createElement("div");
    d.className = "ep-p3d";
    d.id = "ep-plan3d";
    d.innerHTML = `
      <canvas class="ep-p3d-cv"></canvas>
      <div class="ep-p3d-top">
        <button type="button" class="ep-p3d-btn ep-clickable" data-p3d-exit>✕ ${T.exit}</button>
        <span class="ep-p3d-fps" data-p3d-fps></span>
        <button type="button" class="ep-p3d-btn ep-clickable" data-p3d-sensors hidden>${T.sensors}</button>
      </div>
      <div class="ep-p3d-hint" data-p3d-hint>${T.hint}</div>
      <div class="ep-p3d-joy" data-p3d-joy><i></i></div>`;
    document.body.appendChild(d);
    return d;
  }

  /* ---------- вход/выход ---------- */
  async function open() {
    if (S.on || S.loading) return;
    const p = core() && core().project;
    if (!p) return;
    if (!(p.rooms || []).some((r) => (r.points || []).length >= 3)) return toast(T.noRooms);
    S.loading = true;
    try {
      // three.js — только сейчас, первым входом (и только один раз за сессию)
      if (!S.THREE) S.THREE = await import("../../vendor/three/three.module.min.js");
      const THREE = S.THREE;
      S.box = buildBox();
      const cv = S.box.querySelector(".ep-p3d-cv");
      const rend = new THREE.WebGLRenderer({ canvas: cv, antialias: true, powerPreference: "high-performance" });
      rend.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      rend.setSize(window.innerWidth, window.innerHeight, false);
      rend.shadowMap.enabled = false;
      S.renderer = rend;
      S.scene = new THREE.Scene();
      S.scene.background = new THREE.Color(0x0d1526);
      S.camera = new THREE.PerspectiveCamera(DEFAULTS.fov, window.innerWidth / window.innerHeight, DEFAULTS.near, DEFAULTS.far);
      // сцена из данных проекта (Слой 1) — читает project как есть, ничего не мутирует
      const built = P3.Scene.build(THREE, S.scene, G().floorScoped(p), p);
      S.built = built;
      // управление (Слой 2): джойстик + гироскоп/свайп + коллизия со стенами
      S.ctl = P3.Controls.attach(THREE, S.box, S.camera, built, DEFAULTS);
      S.on = true;
      window.addEventListener("resize", onResize);
      window.addEventListener("orientationchange", onResize);
      onResize();
      S.lastT = performance.now();
      loop();
    } catch (e) {
      console.warn("[3D]", e && e.message);
      closeBox();
      toast(T.failed);
    } finally { S.loading = false; }
  }

  function onResize() {
    if (!S.renderer || !S.camera) return;
    const w = window.innerWidth, h = window.innerHeight;
    S.renderer.setSize(w, h, false);
    S.camera.aspect = w / h;
    S.camera.updateProjectionMatrix();
  }

  let fpsAcc = 0, fpsN = 0;
  function loop() {
    if (!S.on) return;
    S.raf = requestAnimationFrame(loop);
    const now = performance.now();
    const dt = Math.min(0.1, (now - S.lastT) / 1000); // клампим, чтобы после фона не «телепортироваться»
    S.lastT = now;
    if (S.ctl) S.ctl.update(dt);
    S.renderer.render(S.scene, S.camera);
    fpsAcc += dt; fpsN++;
    if (fpsAcc >= 1) {
      const el = S.box && S.box.querySelector("[data-p3d-fps]");
      if (el) el.textContent = Math.round(fpsN / fpsAcc) + " fps";
      fpsAcc = 0; fpsN = 0;
    }
  }

  // Полное освобождение WebGL: без dispose повторные заходы в 3D копят
  // геометрии/материалы/текстуры в памяти до падения вкладки на телефоне.
  function disposeScene(obj) {
    if (!obj) return;
    obj.traverse((o) => {
      if (o.geometry) o.geometry.dispose();
      const mats = Array.isArray(o.material) ? o.material : (o.material ? [o.material] : []);
      mats.forEach((m) => {
        Object.keys(m).forEach((k) => { const v = m[k]; if (v && v.isTexture) v.dispose(); });
        m.dispose();
      });
    });
  }
  function closeBox() {
    if (S.raf) cancelAnimationFrame(S.raf);
    S.raf = 0;
    window.removeEventListener("resize", onResize);
    window.removeEventListener("orientationchange", onResize);
    if (S.ctl) { S.ctl.detach(); S.ctl = null; }
    disposeScene(S.scene);
    if (S.renderer) {
      S.renderer.dispose();
      // явно теряем контекст — на мобильных браузерах их число ограничено (обычно 8-16)
      const ext = S.renderer.getContext && S.renderer.getContext().getExtension("WEBGL_lose_context");
      if (ext) ext.loseContext();
      S.renderer = null;
    }
    if (S.box && S.box.parentNode) S.box.parentNode.removeChild(S.box);
    S.box = null; S.scene = null; S.camera = null; S.built = null;
    S.on = false;
  }
  function close() { if (S.on || S.box) closeBox(); }

  P3.Mount = { open, close, isOpen: () => S.on, DEFAULTS, T };

  /* ---------- события ---------- */
  document.addEventListener("click", (e) => {
    const t = e.target;
    if (t.closest && t.closest("[data-plan-3d]")) { e.preventDefault(); return void open(); }
    if (t.closest && t.closest("[data-p3d-exit]")) { e.preventDefault(); return close(); }
  });
  // Android-«назад» и Esc закрывают 3D, не выходя из плана целиком
  window.addEventListener("popstate", (e) => {
    if (!S.on) return;
    close();
    if (e.stopImmediatePropagation) e.stopImmediatePropagation();
  });
  document.addEventListener("keydown", (e) => { if (S.on && e.key === "Escape") close(); });
  // уход с роута плана — гасим 3D (иначе канвас остался бы поверх другого экрана)
  window.addEventListener("ep:route-loaded", () => close());
})();
