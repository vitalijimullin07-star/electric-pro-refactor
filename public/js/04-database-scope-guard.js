/*
 * Electric PRO Refactor
 * V60 Database Scope Guard
 *
 * Цель:
 * - не смешивать "Моя база" и "Глобальная база";
 * - matDB/workDB всегда должны ссылаться только на активный источник;
 * - existing UI может вызывать epSetDbScope('my'|'global').
 */

(function () {
  "use strict";

  const VERSION = "V60_DATABASE_SCOPE_GUARD";
  const KEY_SCOPE = "ep_active_db_scope_v60";
  const KEY_MY_MAT = "ep_my_mat_v60";
  const KEY_MY_WORK = "ep_my_work_v60";

  function arr(v) {
    return Array.isArray(v) ? v : [];
  }

  function clone(v) {
    try {
      return JSON.parse(JSON.stringify(v || []));
    } catch (e) {
      return [];
    }
  }

  function loadJson(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      if (!raw) return fallback;
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : fallback;
    } catch (e) {
      return fallback;
    }
  }

  function saveJson(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(arr(value)));
    } catch (e) {}
  }

  function normalizeScope(scope) {
    scope = String(scope || "").toLowerCase();

    if (
      scope === "my" ||
      scope === "mine" ||
      scope === "user" ||
      scope === "local" ||
      scope === "моя" ||
      scope === "личная"
    ) {
      return "my";
    }

    return "global";
  }

  function ensureStores() {
    window.EP_GLOBAL_MAT = arr(window.EP_GLOBAL_MAT && window.EP_GLOBAL_MAT.length ? window.EP_GLOBAL_MAT : window.matDB);
    window.EP_GLOBAL_WORK = arr(window.EP_GLOBAL_WORK && window.EP_GLOBAL_WORK.length ? window.EP_GLOBAL_WORK : window.workDB);

    window.EP_MY_MAT = arr(window.EP_MY_MAT && window.EP_MY_MAT.length ? window.EP_MY_MAT : window.userMatDB);
    window.EP_MY_WORK = arr(window.EP_MY_WORK && window.EP_MY_WORK.length ? window.EP_MY_WORK : window.userWorkDB);

    window.EP_MY_MAT = loadJson(KEY_MY_MAT, window.EP_MY_MAT);
    window.EP_MY_WORK = loadJson(KEY_MY_WORK, window.EP_MY_WORK);

    window.userMatDB = window.EP_MY_MAT;
    window.userWorkDB = window.EP_MY_WORK;
  }

  function getScope() {
    return normalizeScope(
      window.EP_DB_SCOPE ||
      window.epDbScope ||
      localStorage.getItem(KEY_SCOPE) ||
      localStorage.getItem("ep_db_scope") ||
      localStorage.getItem("EP_DB_SCOPE") ||
      "global"
    );
  }

  function persistCurrentActiveIntoStore() {
    const scope = getScope();

    if (scope === "my") {
      window.EP_MY_MAT = arr(window.matDB);
      window.EP_MY_WORK = arr(window.workDB);
      window.userMatDB = window.EP_MY_MAT;
      window.userWorkDB = window.EP_MY_WORK;
      saveJson(KEY_MY_MAT, window.EP_MY_MAT);
      saveJson(KEY_MY_WORK, window.EP_MY_WORK);
    } else {
      window.EP_GLOBAL_MAT = arr(window.matDB);
      window.EP_GLOBAL_WORK = arr(window.workDB);
    }
  }

  function applyScope(scope, opts) {
    opts = opts || {};
    scope = normalizeScope(scope);

    ensureStores();

    window.EP_DB_SCOPE = scope;
    window.epDbScope = scope;

    localStorage.setItem(KEY_SCOPE, scope);
    localStorage.setItem("ep_db_scope", scope);

    if (scope === "my") {
      window.matDB = window.EP_MY_MAT;
      window.workDB = window.EP_MY_WORK;
      window.userMatDB = window.EP_MY_MAT;
      window.userWorkDB = window.EP_MY_WORK;
    } else {
      window.matDB = window.EP_GLOBAL_MAT;
      window.workDB = window.EP_GLOBAL_WORK;
    }

    document.documentElement.setAttribute("data-ep-db-scope", scope);

    if (!opts.silent) {
      refreshVisibleDbUi();
    }

    console.log("DB scope:", scope, {
      mat: arr(window.matDB).length,
      work: arr(window.workDB).length
    });

    return scope;
  }

  function refreshVisibleDbUi() {
    try {
      if (typeof window.renderDbEditors === "function") {
        window.renderDbEditors();
      }
    } catch (e) {
      console.warn("renderDbEditors failed", e);
    }

    try {
      if (typeof window.renderMainTable === "function") {
        window.renderMainTable();
      }
    } catch (e) {}

    try {
      if (typeof window.epReloadActiveDbV7 === "function" && window.epReloadActiveDbV7.__v60Original) {
        window.epReloadActiveDbV7.__v60Original();
      }
    } catch (e) {}
  }

  function patchFunctions() {
    if (!window.__epV60Originals) {
      window.__epV60Originals = {};
    }

    if (typeof window.epSetDbScope === "function" && !window.__epV60Originals.epSetDbScope) {
      window.__epV60Originals.epSetDbScope = window.epSetDbScope;
    }

    window.epSetDbScope = function (scope) {
      persistCurrentActiveIntoStore();
      return applyScope(scope);
    };

    window.epGetDbScope = getScope;

    window.epGetActiveMatDB = function () {
      applyScope(getScope(), { silent: true });
      return arr(window.matDB);
    };

    window.epGetActiveWorkDB = function () {
      applyScope(getScope(), { silent: true });
      return arr(window.workDB);
    };

    if (typeof window.epSaveActiveDbV7 === "function" && !window.epSaveActiveDbV7.__v60Patched) {
      const originalSave = window.epSaveActiveDbV7;

      const wrappedSave = function () {
        persistCurrentActiveIntoStore();
        return originalSave.apply(this, arguments);
      };

      wrappedSave.__v60Patched = true;
      wrappedSave.__v60Original = originalSave;
      window.epSaveActiveDbV7 = wrappedSave;
    }

    if (typeof window.openMatCatalog === "function" && !window.openMatCatalog.__v60Patched) {
      const originalOpenMat = window.openMatCatalog;

      const wrappedOpenMat = function () {
        applyScope(getScope(), { silent: true });
        return originalOpenMat.apply(this, arguments);
      };

      wrappedOpenMat.__v60Patched = true;
      wrappedOpenMat.__v60Original = originalOpenMat;
      window.openMatCatalog = wrappedOpenMat;
    }

    if (typeof window.openWorkCatalog === "function" && !window.openWorkCatalog.__v60Patched) {
      const originalOpenWork = window.openWorkCatalog;

      const wrappedOpenWork = function () {
        applyScope(getScope(), { silent: true });
        return originalOpenWork.apply(this, arguments);
      };

      wrappedOpenWork.__v60Patched = true;
      wrappedOpenWork.__v60Original = originalOpenWork;
      window.openWorkCatalog = wrappedOpenWork;
    }
  }

  function addSmallIndicator() {
    if (document.getElementById("ep-db-scope-indicator-v60")) return;

    const el = document.createElement("div");
    el.id = "ep-db-scope-indicator-v60";
    el.style.cssText = [
      "position:fixed",
      "left:10px",
      "bottom:72px",
      "z-index:9999",
      "font-size:11px",
      "font-weight:900",
      "padding:6px 9px",
      "border-radius:999px",
      "background:rgba(17,24,39,.86)",
      "color:#fff",
      "box-shadow:0 6px 18px rgba(0,0,0,.18)",
      "pointer-events:none"
    ].join(";");

    document.body.appendChild(el);
  }

  function updateIndicator() {
    const el = document.getElementById("ep-db-scope-indicator-v60");
    if (!el) return;

    const scope = getScope();
    el.textContent = scope === "my" ? "База: Моя" : "База: Глобальная";
  }

  function boot() {
    ensureStores();
    patchFunctions();
    applyScope(getScope(), { silent: true });
    addSmallIndicator();
    updateIndicator();

    let ticks = 0;
    const timer = setInterval(function () {
      patchFunctions();
      applyScope(getScope(), { silent: true });
      updateIndicator();

      ticks += 1;
      if (ticks > 20) clearInterval(timer);
    }, 500);

    document.addEventListener("click", function () {
      setTimeout(function () {
        patchFunctions();
        applyScope(getScope(), { silent: true });
        updateIndicator();
      }, 80);
    }, true);

    console.log("04-database-scope-guard.js", VERSION, "loaded");
  }

  window.EP_DATABASE_SCOPE_GUARD = {
    version: VERSION,
    applyScope,
    getScope,
    persistCurrentActiveIntoStore,
    ensureStores
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
