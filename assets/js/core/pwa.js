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

  if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
      navigator.serviceWorker.register("/sw.js").catch(() => {});
    });
  }

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

  window.EP.PWA = { canInstall, install, isStandalone };
})();
