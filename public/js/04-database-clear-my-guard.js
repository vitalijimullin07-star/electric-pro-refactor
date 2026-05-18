/*
 * Electric PRO Refactor
 * V62 Clear My Database Guard
 *
 * Кнопка "Очистить мою базу" находится внутри блока:
 * "Чистая база / полный сброс"
 */

(function () {
  "use strict";

  const VERSION = "V62_CLEAR_MY_DATABASE_BUTTON_INSIDE_RESET_BLOCK";
  const BTN_ID = "ep-clear-my-db-v61";
  const ROW_ID = "ep-clear-my-db-row-v62";
  const STYLE_ID = "ep-clear-my-db-style-v62";

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

    console.log("V62 my database cleared fully", {
      matDB: arr(window.matDB).length,
      workDB: arr(window.workDB).length,
      userMatDB: arr(window.userMatDB).length,
      userWorkDB: arr(window.userWorkDB).length,
      EP_MY_MAT: arr(window.EP_MY_MAT).length,
      EP_MY_WORK: arr(window.EP_MY_WORK).length
    });
  }

  function ensureStyle() {
    if (document.getElementById(STYLE_ID)) return;

    const style = document.createElement("style");
    style.id = STYLE_ID;
    style.textContent = `
      #${ROW_ID} {
        width: 100%;
        margin: 12px 0 0;
      }

      #${BTN_ID} {
        width: 100%;
        border: 0;
        border-radius: 16px;
        padding: 13px 16px;
        background: #dc2626;
        color: #fff;
        font-size: 15px;
        font-weight: 900;
        box-shadow: 0 8px 22px rgba(220, 38, 38, .22);
        cursor: pointer;
      }

      #${BTN_ID}:active {
        transform: scale(.985);
      }
    `;

    document.head.appendChild(style);
  }

  function text(el) {
    return String((el && el.textContent) || "").replace(/\s+/g, " ").trim().toLowerCase();
  }

  function isVisible(el) {
    if (!el || !el.getBoundingClientRect) return false;

    const st = window.getComputedStyle(el);
    if (st.display === "none" || st.visibility === "hidden") return false;

    const r = el.getBoundingClientRect();

    return (
      r.width > 20 &&
      r.height > 20 &&
      r.bottom > 0 &&
      r.top < window.innerHeight &&
      r.right > 0 &&
      r.left < window.innerWidth
    );
  }

  function findResetBlock() {
    const candidates = Array.from(document.querySelectorAll("section, article, aside, main, div"))
      .filter(isVisible)
      .map((el) => {
        const t = text(el);
        let score = 0;

        if (t.includes("чистая база")) score += 60;
        if (t.includes("полный сброс")) score += 60;
        if (t.includes("очищает материалы и работы")) score += 25;
        if (t.includes("полный сброс баз данных")) score += 25;
        if (t.includes("материалы")) score += 5;
        if (t.includes("работы")) score += 5;

        const r = el.getBoundingClientRect();
        const area = r.width * r.height;

        return { el, score, area };
      })
      .filter((x) => x.score >= 80)
      .sort((a, b) => {
        if (b.score !== a.score) return b.score - a.score;
        return a.area - b.area;
      });

    return candidates.length ? candidates[0].el : null;
  }

  function makeRow() {
    let row = document.getElementById(ROW_ID);

    if (!row) {
      row = document.createElement("div");
      row.id = ROW_ID;
      row.innerHTML = `
        <button type="button" id="${BTN_ID}">
          Очистить мою базу
        </button>
      `;
    }

    const btn = row.querySelector("#" + BTN_ID);

    if (btn && !btn.dataset.bound) {
      btn.dataset.bound = "1";
      btn.addEventListener("click", function () {
        if (!isMyScope()) {
          alert("Сначала включи режим: Моя база");
          return;
        }

        if (!confirm("Точно очистить МОЮ базу полностью? Материалы и работы будут 0.")) return;

        clearMyDatabaseFull();
      });
    }

    return row;
  }

  function mountButtonInsideResetBlock() {
    ensureStyle();

    const block = findResetBlock();
    if (!block) return false;

    const row = makeRow();

    if (!block.contains(row)) {
      const resetBtn = Array.from(block.querySelectorAll("button"))
        .find((btn) => text(btn).includes("полный сброс"));

      if (resetBtn) {
        resetBtn.insertAdjacentElement("afterend", row);
      } else {
        block.appendChild(row);
      }
    }

    return true;
  }

  function patchDangerButtons() {
    document.addEventListener("click", function (e) {
      const btn = e.target && e.target.closest ? e.target.closest("button") : null;
      if (!btn) return;

      const t = text(btn);

      const isClearButton =
        t.includes("очистить") ||
        t.includes("удалить всё") ||
        t.includes("удалить все") ||
        t.includes("в ноль") ||
        t.includes("сброс базы") ||
        t.includes("очистить базу");

      if (!isClearButton) return;
      if (!isMyScope()) return;

      setTimeout(() => {
        if (!isMyScope()) return;

        const matCount = arr(window.matDB).length;
        const workCount = arr(window.workDB).length;
        const myMatCount = arr(window.EP_MY_MAT).length;
        const myWorkCount = arr(window.EP_MY_WORK).length;

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

  function boot() {
    addEmergencyConsoleApi();
    patchDangerButtons();
    mountButtonInsideResetBlock();

    let ticks = 0;
    const timer = setInterval(function () {
      mountButtonInsideResetBlock();
      ticks += 1;
      if (ticks > 20) clearInterval(timer);
    }, 400);

    const observer = new MutationObserver(function () {
      mountButtonInsideResetBlock();
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ["class", "style"]
    });

    console.log("04-database-clear-my-guard.js", VERSION, "loaded");
  }

  window.EP_CLEAR_MY_DB_GUARD = {
    version: VERSION,
    clearMyDatabaseFull,
    isMyScope,
    mountButtonInsideResetBlock
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
