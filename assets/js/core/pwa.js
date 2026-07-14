/* Electric Pro V29 — регистрация service worker (PWA: установка + оффлайн).
   Вынесено в отдельный файл, т.к. CSP запрещает inline-скрипты.
   Плюс: ловим beforeinstallprompt, чтобы показать свою кнопку «Установить
   приложение» в боковом меню — раньше приложение полагалось только на
   нативную иконку установки браузера (не все её замечают). */
(() => {
  "use strict";
  window.EP = window.EP || {};

  if (!("serviceWorker" in navigator)) return;
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/sw.js").catch(() => {});
  });

  let deferredPrompt = null;
  const isStandalone = () =>
    (window.matchMedia && window.matchMedia("(display-mode: standalone)").matches) ||
    window.navigator.standalone === true; // iOS Safari, уже установлено на главный экран

  function notify() {
    window.dispatchEvent(new CustomEvent("ep:pwa-installable-changed", { detail: { canInstall: !!deferredPrompt } }));
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
    if (!deferredPrompt) return false;
    const p = deferredPrompt;
    deferredPrompt = null;
    notify();
    try {
      p.prompt();
      await p.userChoice;
    } catch (e) {}
    return true;
  }

  window.EP.PWA = { canInstall: () => !!deferredPrompt && !isStandalone(), install, isStandalone };
})();
