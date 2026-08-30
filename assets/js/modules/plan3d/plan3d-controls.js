/* Electric Pro V29 — 3D-прогулка: управление от первого лица.
   ДВА джойстика, как в мобильных играх: ЛЕВЫЙ — идти, ПРАВЫЙ — осматриваться.
   Гироскоп — НЕ обязателен и по умолчанию выключен: включается кнопкой «Датчики»
   и работает ВМЕСТЕ со стиком (складывается с ним, а не отбирает управление) —
   просьба пользователя «управление с джойстиком, не только датчиками положения».
   На десктопе дополнительно WASD/стрелки и осмотр перетаскиванием мышью.

   Стики стоят в своих углах, но ПРЫГАЮТ под палец: коснулся нижней половины
   слева/справа — стик встал туда, где палец, и работает от этой точки. Так и
   видно, что управление есть (стики нарисованы всегда), и не нужно целиться.

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
    const moveEl = box.querySelector("[data-p3d-joy]");
    const lookEl = box.querySelector("[data-p3d-joy2]");
    const sensBtn = box.querySelector("[data-p3d-sensors]");
    const hintEl = box.querySelector("[data-p3d-hint]");

    const st = {
      pos: new THREE.Vector3(built.spawn.x, D.eyeHeight * CM, built.spawn.z),
      yaw: 0, pitch: 0,
      move: { id: null, ox: 0, oy: 0, dx: 0, dy: 0, el: moveEl },
      look: { id: null, ox: 0, oy: 0, dx: 0, dy: 0, el: lookEl },
      swipe: { id: null, x: 0, y: 0 },
      keys: {},                    // десктоп: WASD/стрелки
      gyro: null, gyroPrev: null, gyroOn: false
    };
    camera.rotation.order = "YXZ";

    /* ---------- джойстики ---------- */
    // зона стика: нижняя половина экрана, левая или правая по x
    const zoneOf = (e) => {
      if (e.clientY < window.innerHeight * 0.45) return null;
      return e.clientX < window.innerWidth * 0.5 ? st.move : st.look;
    };
    function joyStart(j, e) {
      j.id = e.pointerId; j.ox = e.clientX; j.oy = e.clientY; j.dx = 0; j.dy = 0;
      // стик прыгает под палец и остаётся там до отпускания
      j.el.style.left = e.clientX + "px";
      j.el.style.top = e.clientY + "px";
      j.el.classList.add("on");
      j.el.querySelector("i").style.transform = "translate(-50%,-50%)";
    }
    function joyMove(j, e) {
      let dx = e.clientX - j.ox, dy = e.clientY - j.oy;
      const d = Math.hypot(dx, dy);
      if (d > D.joyRadius) { dx = dx / d * D.joyRadius; dy = dy / d * D.joyRadius; }
      j.dx = dx; j.dy = dy;
      j.el.querySelector("i").style.transform = `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px))`;
    }
    function joyEnd(j) {
      j.id = null; j.dx = 0; j.dy = 0;
      j.el.classList.remove("on");
      j.el.querySelector("i").style.transform = "translate(-50%,-50%)";
      restJoys();                                      // вернуться в свой угол
    }
    // позиция стиков «в покое»: левый/правый нижние углы. Ставится из JS (а не
    // CSS-ом), потому что под пальцем позиция всё равно задаётся из JS — один
    // механизм на оба состояния, нечему разъезжаться при повороте экрана.
    function restJoys() {
      const y = window.innerHeight - 128;
      if (st.move.id === null) { moveEl.style.left = "96px"; moveEl.style.top = y + "px"; }
      if (st.look.id === null) { lookEl.style.left = (window.innerWidth - 96) + "px"; lookEl.style.top = y + "px"; }
    }
    window.addEventListener("resize", restJoys);
    restJoys();
    // отклонение стика 0..1 с мёртвой зоной
    function amount(j) {
      const d = Math.hypot(j.dx, j.dy);
      if (d <= D.joyDead) return 0;
      return Math.min(1, (d - D.joyDead) / (D.joyRadius - D.joyDead));
    }

    function onDown(e) {
      const j = zoneOf(e);
      if (j && j.id === null) {
        joyStart(j, e);
        if (cv.setPointerCapture) try { cv.setPointerCapture(e.pointerId); } catch (err) { /* не критично */ }
      } else if (st.swipe.id === null) {
        // верхняя часть экрана — осмотр перетаскиванием (мышь на десктопе, палец на телефоне)
        st.swipe.id = e.pointerId; st.swipe.x = e.clientX; st.swipe.y = e.clientY;
      }
      if (hintEl) hintEl.classList.add("is-gone");
    }
    function onMove(e) {
      if (e.pointerId === st.move.id) return joyMove(st.move, e);
      if (e.pointerId === st.look.id) return joyMove(st.look, e);
      if (e.pointerId !== st.swipe.id) return;
      st.yaw -= (e.clientX - st.swipe.x) * D.lookSpeed;
      st.pitch -= (e.clientY - st.swipe.y) * D.lookSpeed;
      st.pitch = Math.max(-D.pitchLimit, Math.min(D.pitchLimit, st.pitch));
      st.swipe.x = e.clientX; st.swipe.y = e.clientY;
    }
    function onUp(e) {
      if (e.pointerId === st.move.id) joyEnd(st.move);
      if (e.pointerId === st.look.id) joyEnd(st.look);
      if (e.pointerId === st.swipe.id) st.swipe.id = null;
    }
    cv.addEventListener("pointerdown", onDown);
    cv.addEventListener("pointermove", onMove);
    cv.addEventListener("pointerup", onUp);
    cv.addEventListener("pointercancel", onUp);

    /* ---------- клавиатура (десктоп) ---------- */
    const KEY = { KeyW: "f", ArrowUp: "f", KeyS: "b", ArrowDown: "b", KeyA: "l", ArrowLeft: "l", KeyD: "r", ArrowRight: "r" };
    function onKey(e) {
      const k = KEY[e.code];
      if (!k) return;
      st.keys[k] = e.type === "keydown";
      e.preventDefault();
    }
    window.addEventListener("keydown", onKey);
    window.addEventListener("keyup", onKey);

    /* ---------- гироскоп (по кнопке, НЕ обязателен) ----------
       Складывается со стиком: применяем не абсолютный угол телефона, а ПРИРАЩЕНИЕ
       с прошлого события. Иначе датчик каждый кадр возвращал бы камеру в своё
       положение и «перетирал» бы поворот стиком. */
    function onOrient(e) {
      if (e.alpha == null && e.beta == null) return;
      st.gyro = { a: e.alpha || 0, b: e.beta || 0 };
    }
    function gyroOff() {
      window.removeEventListener("deviceorientation", onOrient);
      st.gyroOn = false; st.gyro = null; st.gyroPrev = null;
      if (sensBtn) sensBtn.classList.remove("on");
    }
    function gyroOn() {
      const DOE = window.DeviceOrientationEvent;
      if (!DOE) return;
      const go = () => {
        window.addEventListener("deviceorientation", onOrient);
        st.gyroOn = true;
        if (sensBtn) sensBtn.classList.add("on");
      };
      // iOS без явного тапа разрешение не даст — именно поэтому это кнопка
      if (typeof DOE.requestPermission === "function") {
        DOE.requestPermission().then((r) => { if (r === "granted") go(); }).catch(() => {});
      } else go();
    }
    if (sensBtn) {
      sensBtn.hidden = !window.DeviceOrientationEvent;
      sensBtn.onclick = () => { if (st.gyroOn) gyroOff(); else gyroOn(); };
    }

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
      // 1) осмотр: правый стик задаёт СКОРОСТЬ поворота (как в играх)
      const la = amount(st.look);
      if (la > 0) {
        const d = Math.hypot(st.look.dx, st.look.dy) || 1;
        st.yaw -= (st.look.dx / d) * la * D.lookStickSpeed * dt;
        st.pitch -= (st.look.dy / d) * la * D.lookStickSpeed * dt;
      }
      // 2) гироскоп — ПРИРАЩЕНИЕМ поверх стика (если включён кнопкой)
      if (st.gyroOn && st.gyro) {
        if (st.gyroPrev) {
          const dA = ((st.gyro.a - st.gyroPrev.a + 540) % 360) - 180;
          st.yaw -= (dA * Math.PI) / 180;
          st.pitch += ((st.gyro.b - st.gyroPrev.b) * Math.PI) / 180;
        }
        st.gyroPrev = st.gyro;
      }
      st.pitch = Math.max(-D.pitchLimit, Math.min(D.pitchLimit, st.pitch));
      camera.rotation.y = st.yaw;
      camera.rotation.x = st.pitch;

      // 3) ходьба: левый стик + клавиатура
      const fx = -Math.sin(st.yaw), fz = -Math.cos(st.yaw);   // «вперёд» камеры в плане
      const rx = Math.cos(st.yaw), rz = -Math.sin(st.yaw);    // «вправо»
      let ux = 0, uz = 0, power = 0;
      const ma = amount(st.move);
      if (ma > 0) {
        const d = Math.hypot(st.move.dx, st.move.dy) || 1;
        const nx = st.move.dx / d, ny = st.move.dy / d;
        ux += fx * -ny + rx * nx; uz += fz * -ny + rz * nx;
        power = ma;
      }
      const k = st.keys;
      if (k.f || k.b || k.l || k.r) {
        const ky = (k.f ? 1 : 0) - (k.b ? 1 : 0), kx = (k.r ? 1 : 0) - (k.l ? 1 : 0);
        ux += fx * ky + rx * kx; uz += fz * ky + rz * kx;
        power = 1;
      }
      const ul = Math.hypot(ux, uz);
      if (ul > 1e-6 && power > 0) {
        const step = D.walkSpeed * CM * dt * power;
        const np = resolve(st.pos.x + (ux / ul) * step, st.pos.z + (uz / ul) * step);
        st.pos.x = np.x; st.pos.z = np.z;
      }
      camera.position.set(st.pos.x, st.pos.y, st.pos.z);
    }

    function detach() {
      cv.removeEventListener("pointerdown", onDown);
      cv.removeEventListener("pointermove", onMove);
      cv.removeEventListener("pointerup", onUp);
      cv.removeEventListener("pointercancel", onUp);
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("keyup", onKey);
      window.removeEventListener("deviceorientation", onOrient);
      window.removeEventListener("resize", restJoys);
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
