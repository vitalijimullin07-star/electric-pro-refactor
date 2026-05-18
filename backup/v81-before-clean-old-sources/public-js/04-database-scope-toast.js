/*
 * Electric PRO Refactor
 * V63 Database Scope Toast
 *
 * Показывает всплывающее окно на 5 секунд:
 * - Активна: Моя база
 * - Активна: База сервера
 */

(function () {
  "use strict";

  const VERSION = "V63_DATABASE_SCOPE_TOAST";
  const STYLE_ID = "ep-db-scope-toast-style-v63";
  const TOAST_ID = "ep-db-scope-toast-v63";
  const STORAGE_KEY = "ep_active_db_scope_v60";

  let lastScope = null;
  let hideTimer = null;

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

  function getScope() {
    if (typeof window.epGetDbScope === "function") {
      return normalizeScope(window.epGetDbScope());
    }

    return normalizeScope(
      window.EP_DB_SCOPE ||
      window.epDbScope ||
      localStorage.getItem(STORAGE_KEY) ||
      localStorage.getItem("ep_db_scope") ||
      "global"
    );
  }

  function ensureStyle() {
    if (document.getElementById(STYLE_ID)) return;

    const style = document.createElement("style");
    style.id = STYLE_ID;
    style.textContent = `
      #${TOAST_ID} {
        position: fixed;
        left: 50%;
        top: 18px;
        transform: translateX(-50%) translateY(-20px);
        z-index: 999999;
        min-width: 260px;
        max-width: calc(100vw - 28px);
        padding: 14px 18px;
        border-radius: 18px;
        background: rgba(17, 24, 39, .96);
        color: #fff;
        box-shadow: 0 14px 36px rgba(0,0,0,.28);
        font-size: 15px;
        font-weight: 900;
        text-align: center;
        opacity: 0;
        pointer-events: none;
        transition: opacity .22s ease, transform .22s ease;
      }

      #${TOAST_ID}.show {
        opacity: 1;
        transform: translateX(-50%) translateY(0);
      }

      #${TOAST_ID}.my {
        background: linear-gradient(135deg, #2563eb, #4f46e5);
      }

      #${TOAST_ID}.global {
        background: linear-gradient(135deg, #059669, #10b981);
      }

      #${TOAST_ID} small {
        display: block;
        margin-top: 4px;
        font-size: 12px;
        font-weight: 700;
        opacity: .86;
      }
    `;

    document.head.appendChild(style);
  }

  function ensureToast() {
    ensureStyle();

    let toast = document.getElementById(TOAST_ID);

    if (!toast) {
      toast = document.createElement("div");
      toast.id = TOAST_ID;
      document.body.appendChild(toast);
    }

    return toast;
  }

  function showDbScopeToast(scope, forced) {
    scope = normalizeScope(scope);

    const toast = ensureToast();

    toast.className = "";
    toast.classList.add(scope === "my" ? "my" : "global");

    if (scope === "my") {
      toast.innerHTML = `👤 Активна: Моя база<small>Добавление и редактирование только у мастера</small>`;
    } else {
      toast.innerHTML = `🌍 Активна: База сервера<small>Общая база, прямое редактирование только для админа</small>`;
    }

    requestAnimationFrame(() => {
      toast.classList.add("show");
    });

    clearTimeout(hideTimer);

    hideTimer = setTimeout(() => {
      toast.classList.remove("show");
    }, 5000);

    lastScope = scope;

    if (forced) {
      console.log("DB scope toast:", scope);
    }
  }

  function patchScopeFunction() {
    if (window.__epV63ScopeToastPatched) return;

    const original = typeof window.epSetDbScope === "function" ? window.epSetDbScope : null;

    window.epSetDbScope = function (scope) {
      let result;

      if (original) {
        result = original.apply(this, arguments);
      } else if (typeof window.EP_DATABASE_SCOPE_GUARD?.applyScope === "function") {
        result = window.EP_DATABASE_SCOPE_GUARD.applyScope(scope);
      } else {
        const normalized = normalizeScope(scope);
        window.EP_DB_SCOPE = normalized;
        window.epDbScope = normalized;
        localStorage.setItem(STORAGE_KEY, normalized);
        localStorage.setItem("ep_db_scope", normalized);
        result = normalized;
      }

      const active = getScope();
      showDbScopeToast(active, true);

      return result;
    };

    window.__epV63ScopeToastPatched = true;
  }

  function watchManualClicks() {
    document.addEventListener("click", function (e) {
      const btn = e.target && e.target.closest ? e.target.closest("button") : null;
      if (!btn) return;

      const t = String(btn.textContent || "").toLowerCase();

      if (t.includes("моя база")) {
        setTimeout(() => showDbScopeToast(getScope(), true), 120);
      }

      if (t.includes("база сервера") || t.includes("сервер")) {
        setTimeout(() => showDbScopeToast(getScope(), true), 120);
      }
    }, true);
  }

  function watchScopeChanges() {
    lastScope = getScope();

    setInterval(() => {
      const current = getScope();

      if (current !== lastScope) {
        showDbScopeToast(current, true);
      }
    }, 500);
  }

  function boot() {
    patchScopeFunction();
    watchManualClicks();
    watchScopeChanges();

    console.log("04-database-scope-toast.js", VERSION, "loaded");
  }

  window.EP_DB_SCOPE_TOAST = {
    version: VERSION,
    show: showDbScopeToast,
    getScope
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
