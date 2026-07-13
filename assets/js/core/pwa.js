/* Electric Pro V29 — регистрация service worker (PWA: установка + оффлайн).
   Вынесено в отдельный файл, т.к. CSP запрещает inline-скрипты. */
(() => {
  "use strict";
  if (!("serviceWorker" in navigator)) return;
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/sw.js").catch(() => {});
  });
})();
