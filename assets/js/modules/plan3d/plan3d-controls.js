/* Electric Pro V29 — 3D-прогулка: управление от первого лица.
   Ходьба — плавающий джойстик (появляется под пальцем в нижней трети экрана).
   Осмотр — гироскоп телефона, если разрешён, иначе свайп пальцем по экрану.
   Коллизия — камера как цилиндр против отрезков стен (2D в плане, высота не
   нужна): проще полноценной физики и достаточно, чтобы не проходить сквозь стены.
   ВСЕ высокочастотные события (pointermove, deviceorientation) только ПИШУТ
   последнее значение, а читается оно раз в кадр в update() — тот же принцип,
   что и renderSceneSoon в 2D-плане. */
(() => {
  "use strict";
  window.EP = window.EP || {};
  const P3 = (EP.Plan3D = EP.Plan3D || {});
  const CM = 0.01;

  function attach(THREE, box, camera, built, D) {
    const cv = box.querySelector(".ep-p3d-cv");
    const joyEl = box.querySelector("[data-p3d-joy]");
    const knob = joyEl.querySelector("i");
    const sensBtn = box.querySelector("[data-p3d-sensors]");
    const hintEl = box.querySelector("[data-p3d-hint]");

    const st = {
      pos: new THREE.Vector3(built.spawn.x, D.eyeHeight * CM, built.spawn.z),
      yaw: 0, pitch: 0,
      joy: { id: null, ox: 0, oy: 0, dx: 0, dy: 0 },
      look: { id: null, x: 0, y: 0 },
      gyro: null,                 // {alpha,beta,gamma} последнее событие
      gyroOn: false, gyroBase: null
    };
    camera.rotation.order = "YXZ";

    /* ---------- джойстик ---------- */
    const joyZone = (e) => e.clientY > window.innerHeight * 0.6;
    function joyStart(e) {
      st.joy.id = e.pointerId; st.joy.ox = e.clientX; st.joy.oy = e.clientY;
      st.joy.dx = 0; st.joy.dy = 0;
      joyEl.style.left = e.clientX + "px";
      joyEl.style.top = e.clientY + "px";
      joyEl.classList.add("on");
      knob.style.transform = "translate(-50%,-50%)";
    }
    function joyMove(e) {
      let dx = e.clientX - st.joy.ox, dy = e.clientY - st.joy.oy;
      const d = Math.hypot(dx, dy);
      if (d > D.joyRadius) { dx = dx / d * D.joyRadius; dy = dy / d * D.joyRadius; }
      st.joy.dx = dx; st.joy.dy = dy;
      knob.style.transform = `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px))`;
    }
    function joyEnd() {
      st.joy.id = null; st.joy.dx = 0; st.joy.dy = 0;
      joyEl.classList.remove("on");
    }

    function onDown(e) {
      if (st.joy.id === null && joyZone(e)) { joyStart(e); cv.setPointerCapture && cv.setPointerCapture(e.pointerId); return; }
      if (st.look.id === null) { st.look.id = e.pointerId; st.look.x = e.clientX; st.look.y = e.clientY; }
      if (hintEl) hintEl.classList.add("is-gone");
    }
    function onMove(e) {
      if (e.pointerId === st.joy.id) return joyMove(e);
      if (e.pointerId !== st.look.id) return;
      // свайпом крутим камеру, ТОЛЬКО пока гироскоп не ведёт (иначе борьба за угол)
      if (!st.gyroOn) {
        st.yaw -= (e.clientX - st.look.x) * D.lookSpeed;
        st.pitch -= (e.clientY - st.look.y) * D.lookSpeed;
        st.pitch = Math.max(-D.pitchLimit, Math.min(D.pitchLimit, st.pitch));
      }
      st.look.x = e.clientX; st.look.y = e.clientY;
    }
    function onUp(e) {
      if (e.pointerId === st.joy.id) joyEnd();
      if (e.pointerId === st.look.id) st.look.id = null;
    }
    cv.addEventListener("pointerdown", onDown);
    cv.addEventListener("pointermove", onMove);
    cv.addEventListener("pointerup", onUp);
    cv.addEventListener("pointercancel", onUp);

    /* ---------- гироскоп ----------
       iOS без явного тапа по кнопке разрешение не даст (requestPermission), на
       Android событие приходит сразу. Первое событие берём за «ноль», чтобы
       камера не прыгала: дальше поворачиваем ОТНОСИТЕЛЬНО стартового положения
       телефона в руке. */
    function onOrient(e) {
      if (e.alpha == null && e.beta == null && e.gamma == null) return;
      st.gyro = { a: e.alpha || 0, b: e.beta || 0, g: e.gamma || 0 };
      if (!st.gyroBase) st.gyroBase = { a: st.gyro.a, b: st.gyro.b };
      st.gyroOn = true;
    }
    function startGyro() {
      const DOE = window.DeviceOrientationEvent;
      if (!DOE) return;
      if (typeof DOE.requestPermission === "function") {
        if (sensBtn) {
          sensBtn.hidden = false;
          sensBtn.onclick = () => {
            DOE.requestPermission().then((r) => {
              if (r === "granted") window.addEventListener("deviceorientation", onOrient);
            }).catch(() => {});
            sensBtn.hidden = true;
          };
        }
      } else {
        window.addEventListener("deviceorientation", onOrient);
      }
    }
    startGyro();

    /* ---------- коллизия ----------
       камера — цилиндр радиуса bodyRadius; для каждого отрезка стены считаем
       ближайшую точку и, если ближе (радиус + полтолщины), выталкиваем наружу */
    const R = D.bodyRadius * CM;
    function resolve(x, z) {
      for (let pass = 0; pass < 2; pass++) {         // два прохода — чтобы в углу не застревать
        let moved = false;
        for (let i = 0; i < built.collide.length; i++) {
          const s = built.collide[i];
          const vx = s.bx - s.ax, vz = s.bz - s.az;
          const len2 = vx * vx + vz * vz;
          let t = len2 ? ((x - s.ax) * vx + (z - s.az) * vz) / len2 : 0;
          t = Math.max(0, Math.min(1, t));
          const px = s.ax + vx * t, pz = s.az + vz * t;
          let dx = x - px, dz = z - pz;
          let d = Math.hypot(dx, dz);
          const min = R + s.th / 2;
          if (d < min) {
            if (d < 1e-6) { dx = 1; dz = 0; d = 1; }  // ровно на осевой — выталкиваем в любую сторону
            x = px + dx / d * min; z = pz + dz / d * min;
            moved = true;
          }
        }
        if (!moved) break;
      }
      return { x, z };
    }

    /* ---------- кадр ---------- */
    function update(dt) {
      // осмотр гироскопом: alpha — азимут (поворот вокруг вертикали), beta — наклон
      if (st.gyroOn && st.gyro && st.gyroBase) {
        const dA = ((st.gyro.a - st.gyroBase.a + 540) % 360) - 180;
        st.yaw = -dA * Math.PI / 180;
        const dB = st.gyro.b - st.gyroBase.b;
        st.pitch = Math.max(-D.pitchLimit, Math.min(D.pitchLimit, dB * Math.PI / 180));
      }
      camera.rotation.y = st.yaw;
      camera.rotation.x = st.pitch;

      // ходьба: вектор стика в системе камеры (вперёд — куда смотрим)
      const jx = st.joy.dx, jy = st.joy.dy;
      const jd = Math.hypot(jx, jy);
      if (jd > D.joyDead) {
        const k = Math.min(1, (jd - D.joyDead) / (D.joyRadius - D.joyDead));
        const step = D.walkSpeed * CM * dt * k;
        const fx = -Math.sin(st.yaw), fz = -Math.cos(st.yaw);   // «вперёд» камеры в плане
        const rx = Math.cos(st.yaw), rz = -Math.sin(st.yaw);    // «вправо»
        const ux = (fx * -jy + rx * jx) / jd, uz = (fz * -jy + rz * jx) / jd;
        const np = resolve(st.pos.x + ux * step, st.pos.z + uz * step);
        st.pos.x = np.x; st.pos.z = np.z;
      }
      camera.position.set(st.pos.x, st.pos.y, st.pos.z);
    }

    function detach() {
      cv.removeEventListener("pointerdown", onDown);
      cv.removeEventListener("pointermove", onMove);
      cv.removeEventListener("pointerup", onUp);
      cv.removeEventListener("pointercancel", onUp);
      window.removeEventListener("deviceorientation", onOrient);
      if (sensBtn) sensBtn.onclick = null;
    }

    // стартовая позиция сразу корректируется коллизией: центр комнаты может
    // оказаться ближе полутолщины к стене у маленького помещения
    const sp = resolve(st.pos.x, st.pos.z);
    st.pos.x = sp.x; st.pos.z = sp.z;

    return { update, detach, state: st };
  }

  P3.Controls = { attach };
})();
