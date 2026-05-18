/*
 * Electric PRO Refactor
 * V81 State Line
 *
 * Только одна актуальная строка сверху.
 * Без MutationObserver.
 * Не работает на экране загрузки профиля.
 */

(function () {
  "use strict";

  const VERSION = "V81_STATE_LINE";
  const STYLE_ID = "ep-v81-state-style";
  const LINE_ID = "ep-v81-state-line";

  function appIsLoading() {
    const body = String(document.body && document.body.textContent || "").toLowerCase();
    return body.includes("загрузка профиля") || body.includes("loading profile");
  }

  function appIsReady() {
    if (appIsLoading()) return false;

    const body = String(document.body && document.body.textContent || "").toLowerCase();

    return (
      body.includes("материалы") ||
      body.includes("работы") ||
      body.includes("база сервера") ||
      body.includes("моя база") ||
      body.includes("смета")
    );
  }

  function getScopeLabel() {
    try {
      if (window.EP_DB && typeof window.EP_DB.getScope === "function") {
        return window.EP_DB.getScope() === "my" ? "Моя" : "Сервера";
      }

      if (typeof window.epGetDbScope === "function") {
        const s = window.epGetDbScope();
        return s === "my" ? "Моя" : "Сервера";
      }
    } catch (e) {}

    const saved =
      localStorage.getItem("ep_active_db_scope_v67") ||
      localStorage.getItem("ep_active_db_scope_v60") ||
      localStorage.getItem("ep_db_scope") ||
      "server";

    return String(saved).includes("my") ? "Моя" : "Сервера";
  }

  function getRoleLabel() {
    try {
      if (window.EP_DB && typeof window.EP_DB.isAdmin === "function" && window.EP_DB.isAdmin()) {
        return "админ";
      }
    } catch (e) {}

    return "мастер";
  }

  function ensureStyle() {
    if (document.getElementById(STYLE_ID)) return;

    const style = document.createElement("style");
    style.id = STYLE_ID;
    style.textContent = `
      #${LINE_ID} {
        position: fixed;
        top: max(2px, env(safe-area-inset-top));
        left: 6px;
        right: 6px;
        height: 22px;
        z-index: 2147483647;
        display: flex;
        justify-content: center;
        align-items: center;
        pointer-events: none !important;
      }

      #${LINE_ID} span {
        max-width: calc(100vw - 14px);
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
        padding: 4px 9px;
        border-radius: 999px;
        background: rgba(17,24,39,.9);
        color: #fff;
        font-size: 10px;
        line-height: 1;
        font-weight: 900;
        box-shadow: 0 3px 10px rgba(0,0,0,.14);
        pointer-events: none !important;
      }
    `;

    document.head.appendChild(style);
  }

  function render() {
    if (!appIsReady()) return;

    ensureStyle();

    let line = document.getElementById(LINE_ID);

    if (!line) {
      line = document.createElement("div");
      line.id = LINE_ID;
      line.innerHTML = "<span></span>";
      document.body.appendChild(line);
    }

    const span = line.querySelector("span");
    span.textContent = `Electric PRO · V81 · База: ${getScopeLabel()} · Роль: ${getRoleLabel()}`;
  }

  function boot() {
    let ticks = 0;

    const timer = setInterval(() => {
      render();
      ticks += 1;
      if (ticks > 30) clearInterval(timer);
    }, 500);

    document.addEventListener("click", function () {
      setTimeout(render, 150);
    }, true);

    console.log("04-database-v81-state-line.js", VERSION, "loaded");
  }

  window.EP_DB_V81 = {
    version: VERSION,
    render
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
