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
  if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
      navigator.serviceWorker.register("/sw.js").catch((e) => { swRegError = String((e && e.message) || e); });
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
