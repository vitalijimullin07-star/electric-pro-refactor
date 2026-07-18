/* Electric Pro V29 — регистрация service worker (PWA: установка + оффлайн).
   Вынесено в отдельный файл, т.к. CSP запрещает inline-скрипты.
   Плюс: ловим beforeinstallprompt, чтобы показать свою кнопку «Установить
   приложение» в боковом меню — раньше приложение полагалось только на
   нативную иконку установки браузера (не все её замечают).
   iOS Safari: beforeinstallprompt там НЕ существует в принципе (Apple его
   не реализует) — кнопка всё равно показывается, но вместо системного
   промпта объясняет ручной путь через «Поделиться → На экран «Домой»». */
(() => {
  "use strict";
  window.EP = window.EP || {};

  let swRegError = "";
  let swReg = null;

  // ---- автообновление (жалоба пользователя: «иногда цепляется за предыдущее») ----
  // Два НЕЗАВИСИМЫХ источника устаревания, оба лечатся здесь:
  // (1) sw.js сам поменялся (правится редко) — браузер проверяет его на новую
  //     версию не чаще раза в ~24ч (throttle спецификации Service Worker, НЕ
  //     связан с Cache-Control — отдельный механизм); reg.update() форсирует
  //     проверку раньше. Даже когда новый SW активируется (self.skipWaiting()+
  //     clients.claim() в sw.js уже это делают САМИ), controllerchange НЕ
  //     обновляет уже выполняющийся в памяти JS текущей страницы — нужен
  //     явный reload().
  // (2) Обычный деплой (JS/CSS/index.html) БЕЗ изменения sw.js — самый частый
  //     случай в реальности (sw.js правится редко, контент — постоянно): SW и
  //     не должен тут ничего замечать, controllerchange не сработает вообще.
  //     Ловим это ОТДЕЛЬНО — сравниваем «отпечаток» версии (набор ?v=NNNN у
  //     <script>/<link>, тот самый единый номер пакета из CLAUDE.md) уже
  //     загруженной страницы со свежим index.html (no-store, тот же самый URL,
  //     что сервер всегда отдаёт по последнему деплою).
  // Оба пути сходятся в ОДНОМ reload(): не дёргаем его, пока пользователь
  // СМОТРИТ на экран (мог бы сбросить незакоммиченный жест — драг точки на
  // плане и т.п., хоть данные и не теряются, они коммитятся отдельно) — если
  // апдейт нашёлся, пока вкладка видима, откладываем reload() до следующего
  // ухода в фон: к моменту возврата пользователь уже увидит свежую версию без
  // единого заметного скачка. Проверка версии — на КАЖДЫЙ возврат в приложение
  // (visibilitychange -> visible), throttled до раза в минуту — покрывает
  // самый частый триггер устаревания: приложение висело в фоне/было закрыто,
  // открыли заново.
  let refreshing = false, pendingReload = false;
  function reloadNowOrOnHide() {
    if (refreshing || pendingReload) return;
    if (document.visibilityState === "hidden") { refreshing = true; window.location.reload(); }
    else pendingReload = true;
  }
  document.addEventListener("visibilitychange", () => {
    if (pendingReload && document.visibilityState === "hidden" && !refreshing) {
      refreshing = true;
      window.location.reload();
    }
  });

  function versionFingerprint(html) { return (html.match(/[?&]v=(\d+)/g) || []).join(","); }
  const startFingerprint = versionFingerprint(document.documentElement.outerHTML);
  let lastVersionCheck = 0, checkingVersion = false;
  async function checkForNewDeploy() {
    const now = Date.now();
    if (checkingVersion || now - lastVersionCheck < 60000) return; // не чаще раза в минуту
    lastVersionCheck = now; checkingVersion = true;
    try {
      const r = await fetch("/index.html", { cache: "no-store" });
      if (r.ok) {
        const html = await r.text();
        if (versionFingerprint(html) !== startFingerprint) reloadNowOrOnHide();
      }
    } catch (e) {}
    checkingVersion = false;
  }

  let lastSwUpdateCheck = 0;
  function checkForSwUpdate() {
    if (!swReg) return;
    const now = Date.now();
    if (now - lastSwUpdateCheck < 60000) return;
    lastSwUpdateCheck = now;
    swReg.update().catch(() => {});
  }

  if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
      navigator.serviceWorker.register("/sw.js")
        .then((reg) => { swReg = reg; checkForSwUpdate(); })
        .catch((e) => { swRegError = String((e && e.message) || e); });
    });
    navigator.serviceWorker.addEventListener("controllerchange", reloadNowOrOnHide);
  }
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState !== "visible") return;
    checkForSwUpdate();
    checkForNewDeploy();
  });

  let deferredPrompt = null;
  const isIOS = () => /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
  const isStandalone = () =>
    (window.matchMedia && window.matchMedia("(display-mode: standalone)").matches) ||
    window.navigator.standalone === true; // iOS Safari, уже установлено на главный экран
  const canInstall = () => !isStandalone() && (!!deferredPrompt || isIOS());

  function notify() {
    window.dispatchEvent(new CustomEvent("ep:pwa-installable-changed", { detail: { canInstall: canInstall() } }));
  }

  window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault();
    deferredPrompt = e;
    notify();
  });
  window.addEventListener("appinstalled", () => {
    deferredPrompt = null;
    notify();
  });

  async function install() {
    if (deferredPrompt) {
      const p = deferredPrompt;
      deferredPrompt = null;
      notify();
      try { p.prompt(); await p.userChoice; } catch (e) {}
      return true;
    }
    if (isIOS()) {
      alert("Чтобы установить на iPhone/iPad:\n1. Нажмите «Поделиться» (значок ⬆️ внизу экрана Safari)\n2. Выберите «На экран «Домой»»");
      return true;
    }
    return false;
  }

  // Диагностика для случая, когда beforeinstallprompt так и не пришёл —
  // чтобы получить факты с реального устройства без доступа к devtools.
  async function diag() {
    const lines = [];
    lines.push("HTTPS: " + (location.protocol === "https:" ? "да" : "НЕТ (" + location.protocol + ")"));
    lines.push("URL: " + location.href);
    lines.push("Service Worker поддержка: " + ("serviceWorker" in navigator ? "да" : "нет"));
    if ("serviceWorker" in navigator) {
      try {
        const reg = await navigator.serviceWorker.getRegistration();
        if (reg) {
          const state = reg.active ? "active" : reg.installing ? "installing" : reg.waiting ? "waiting" : "?";
          lines.push("SW зарегистрирован: да (" + state + ")");
        } else {
          lines.push("SW зарегистрирован: НЕТ");
        }
      } catch (e) {
        lines.push("SW проверка: ошибка (" + ((e && e.message) || e) + ")");
      }
      if (swRegError) lines.push("Ошибка register(): " + swRegError);
    }
    try {
      const r = await fetch("/manifest.webmanifest", { cache: "no-store" });
      lines.push("manifest.webmanifest: HTTP " + r.status + ", " + r.headers.get("content-type"));
    } catch (e) {
      lines.push("manifest.webmanifest: ошибка загрузки (" + ((e && e.message) || e) + ")");
    }
    lines.push("Уже установлено (standalone): " + (isStandalone() ? "да" : "нет"));
    lines.push("beforeinstallprompt получен: " + (deferredPrompt ? "да" : "нет"));
    lines.push("Браузер: " + navigator.userAgent);
    return lines.join("\n");
  }

  window.EP.PWA = { canInstall, install, isStandalone, diag };
})();
