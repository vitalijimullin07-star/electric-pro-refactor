/*
 * Electric PRO Refactor
 * V61 Clear My Database Guard
 *
 * Исправление:
 * если мастер чистит "Моя база", должны очищаться и материалы, и работы.
 */

(function () {
  "use strict";

  const VERSION = "V61_CLEAR_MY_DATABASE_GUARD";

  const MY_MAT_KEYS = [
    "ep_my_mat_v60",
    "ep_my_mat",
    "EP_MY_MAT",
    "userMatDB",
    "myMatDB",
    "electric_pro_my_mat",
    "electric_pro_user_mat"
  ];

  const MY_WORK_KEYS = [
    "ep_my_work_v60",
    "ep_my_work",
    "EP_MY_WORK",
    "userWorkDB",
    "myWorkDB",
    "electric_pro_my_work",
    "electric_pro_user_work"
  ];

  function arr(v) {
    return Array.isArray(v) ? v : [];
  }

  function getScope() {
    if (typeof window.epGetDbScope === "function") {
      return window.epGetDbScope();
    }

    return String(
      window.EP_DB_SCOPE ||
      window.epDbScope ||
      localStorage.getItem("ep_active_db_scope_v60") ||
      localStorage.getItem("ep_db_scope") ||
      "global"
    ).toLowerCase();
  }

  function isMyScope() {
    const s = getScope();
    return s === "my" || s === "mine" || s === "user" || s === "local" || s === "моя" || s === "личная";
  }

  function saveEmptyKeys() {
    [...MY_MAT_KEYS, ...MY_WORK_KEYS].forEach((key) => {
      try {
        localStorage.setItem(key, "[]");
      } catch (e) {}
    });
  }

  function clearMyDatabaseFull(opts) {
    opts = opts || {};

    window.EP_MY_MAT = [];
    window.EP_MY_WORK = [];

    window.userMatDB = [];
    window.userWorkDB = [];

    saveEmptyKeys();

    if (isMyScope()) {
      window.matDB = [];
      window.workDB = [];
    }

    try {
      if (typeof window.EP_DATABASE_SCOPE_GUARD?.applyScope === "function") {
        window.EP_DATABASE_SCOPE_GUARD.applyScope("my", { silent: true });
      }
    } catch (e) {}

    try {
      if (typeof window.renderDbEditors === "function") {
        window.renderDbEditors();
      }
    } catch (e) {}

    try {
      if (typeof window.renderMainTable === "function") {
        window.renderMainTable();
      }
    } catch (e) {}

    if (!opts.silent) {
      alert("Моя база очищена полностью: материалы 0, работы 0");
    }

    console.log("V61 my database cleared fully", {
      matDB: arr(window.matDB).length,
      workDB: arr(window.workDB).length,
      userMatDB: arr(window.userMatDB).length,
      userWorkDB: arr(window.userWorkDB).length,
      EP_MY_MAT: arr(window.EP_MY_MAT).length,
      EP_MY_WORK: arr(window.EP_MY_WORK).length
    });
  }

  function patchDangerButtons() {
    document.addEventListener("click", function (e) {
      const btn = e.target && e.target.closest ? e.target.closest("button") : null;
      if (!btn) return;

      const t = String(btn.textContent || "").toLowerCase();

      const isClearButton =
        t.includes("очистить") ||
        t.includes("удалить всё") ||
        t.includes("удалить все") ||
        t.includes("в ноль") ||
        t.includes("сброс базы") ||
        t.includes("очистить базу");

      if (!isClearButton) return;
      if (!isMyScope()) return;

      const areaText = String((btn.closest("section, div, main, aside") || document.body).textContent || "").toLowerCase();
      const looksLikeDb =
        areaText.includes("моя база") ||
        areaText.includes("база данных") ||
        areaText.includes("материал") ||
        areaText.includes("работ");

      if (!looksLikeDb) return;

      setTimeout(() => {
        const stillMy = isMyScope();

        if (!stillMy) return;

        const matCount = arr(window.matDB).length;
        const workCount = arr(window.workDB).length;
        const myMatCount = arr(window.EP_MY_MAT).length;
        const myWorkCount = arr(window.EP_MY_WORK).length;

        // Если после очистки что-то осталось в моей базе — добиваем всё.
        if (matCount > 0 || workCount > 0 || myMatCount > 0 || myWorkCount > 0) {
          clearMyDatabaseFull({ silent: true });
        }
      }, 300);
    }, true);
  }

  function addEmergencyConsoleApi() {
    window.epClearMyDatabaseFull = function () {
      if (!confirm("Точно очистить МОЮ базу полностью? Материалы и работы будут 0.")) return;
      clearMyDatabaseFull();
    };

    window.EP_CLEAR_MY_DATABASE_FULL = window.epClearMyDatabaseFull;
  }

  function addTinyButton() {
    if (document.getElementById("ep-clear-my-db-v61")) return;

    const btn = document.createElement("button");
    btn.id = "ep-clear-my-db-v61";
    btn.type = "button";
    btn.textContent = "Очистить мою базу";
    btn.style.cssText = [
      "position:fixed",
      "right:10px",
      "bottom:72px",
      "z-index:9999",
      "border:0",
      "border-radius:999px",
      "padding:8px 10px",
      "font-size:11px",
      "font-weight:900",
      "background:#dc2626",
      "color:#fff",
      "box-shadow:0 6px 18px rgba(0,0,0,.22)"
    ].join(";");

    btn.addEventListener("click", function () {
      if (!isMyScope()) {
        alert("Сначала включи режим: Моя база");
        return;
      }

      if (!confirm("Точно очистить МОЮ базу полностью? Материалы и работы будут 0.")) return;
      clearMyDatabaseFull();
    });

    document.body.appendChild(btn);
  }

  function boot() {
    addEmergencyConsoleApi();
    patchDangerButtons();
    addTinyButton();

    console.log("04-database-clear-my-guard.js", VERSION, "loaded");
  }

  window.EP_CLEAR_MY_DB_GUARD = {
    version: VERSION,
    clearMyDatabaseFull,
    isMyScope
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
