/* Electric Pro V29 — время/сеть/батарея ВНУТРИ шапки приложения (topbar).
   Просьба пользователя: раз "Во весь экран" на установленном PWA (manifest.
   webmanifest display:"fullscreen") реально скрывает системный статус-бар —
   освободившееся место наверху занять той же информацией внутри самого
   приложения. Кластер показывается ТОЛЬКО когда matchMedia подтверждает
   display-mode:fullscreen (значит статус-бар ОС реально скрыт) — в обычной
   вкладке браузера или в display-mode:standalone (где браузер статус-бар
   НЕ скрывает) кластер остаётся display:none через body.pwa-fullscreen — не
   дублируем уже видимый системный статус-бар.
   ВАЖНО (раскрыто пользователю, не решаемо со стороны сайта): реального
   уровня сигнала сети ("антенн") веб-страницам браузер не отдаёт ни в каком
   виде — такого API не существует ни в одном браузере. Показываем лучшее
   доступное: онлайн/офлайн (navigator.onLine, надёжно везде) + тип
   соединения (Network Information API — ТОЛЬКО Chromium, effectiveType
   "4g"/"3g"/…, НЕ различает Wi-Fi/сотовую — такого разделения API тоже не
   даёт). Батарея — navigator.getBattery(), давно устаревший/урезанный API,
   поддержка НЕ гарантирована ни на одном браузере/устройстве — если
   недоступен, элемент остаётся скрыт (hidden), без ошибки и без
   выдуманных цифр. */
(() => {
  "use strict";
  function pad2(n) { return String(n).padStart(2, "0"); }

  function tickClock() {
    const el = document.getElementById("topbarClock");
    if (!el) return;
    const d = new Date();
    el.textContent = pad2(d.getHours()) + ":" + pad2(d.getMinutes());
  }

  function connApi() {
    return navigator.connection || navigator.mozConnection || navigator.webkitConnection || null;
  }

  function updateNet() {
    const el = document.getElementById("topbarNet");
    if (!el) return;
    const online = navigator.onLine !== false;
    const conn = connApi();
    let label = online ? "📶" : "📵"; // 📶 / 📵
    if (online && conn && conn.effectiveType) label += " " + conn.effectiveType.toUpperCase();
    el.textContent = label;
    el.classList.toggle("is-offline", !online);
  }

  function initBattery() {
    const el = document.getElementById("topbarBatt");
    if (!el) return;
    if (typeof navigator.getBattery !== "function") { el.hidden = true; return; }
    navigator.getBattery().then((batt) => {
      const render = () => {
        const pct = Math.round(batt.level * 100);
        el.textContent = (batt.charging ? "⚡" : "🔋") + " " + pct + "%"; // ⚡ / 🔋
        el.hidden = false;
      };
      render();
      batt.addEventListener("levelchange", render);
      batt.addEventListener("chargingchange", render);
    }).catch(() => { el.hidden = true; });
  }

  function applyPwaFullscreenClass() {
    let fs = false;
    try { fs = !!(window.matchMedia && window.matchMedia("(display-mode: fullscreen)").matches); } catch (e) {}
    document.body.classList.toggle("pwa-fullscreen", fs);
  }

  let started = false;
  function start() {
    if (started) return;
    if (!document.getElementById("topbarClock")) return; // топбар (app-shell.js) ещё не отрисован
    started = true;
    applyPwaFullscreenClass();
    tickClock();
    updateNet();
    initBattery();
    setInterval(tickClock, 30000);
    window.addEventListener("online", updateNet);
    window.addEventListener("offline", updateNet);
    const conn = connApi();
    if (conn && conn.addEventListener) conn.addEventListener("change", updateNet);
  }

  // app.js: AppShell.render() → Router.init() (тот же тик DOMContentLoaded, раньше по
  // порядку) — к моменту первого ep:route-loaded топбар уже в DOM; readyState-ветки —
  // подстраховка на случай другого порядка инициализации в будущем.
  window.addEventListener("ep:route-loaded", start);
  if (document.readyState !== "loading") start();
  else document.addEventListener("DOMContentLoaded", start);
})();
