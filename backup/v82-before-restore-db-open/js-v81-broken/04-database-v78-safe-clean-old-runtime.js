/*
 * Electric PRO Refactor
 * V78 Safe Clean Old Runtime
 *
 * Безопасно:
 * - не работает на экране "Загрузка профиля...";
 * - не использует MutationObserver;
 * - не трогает системную загрузку;
 * - после загрузки убирает старые V17/V18/V21 плашки;
 * - скрывает старые массовые блоки;
 * - оставляет одну актуальную строку сверху.
 */

(function () {
  "use strict";

  const VERSION = "V78_SAFE_CLEAN_OLD_RUNTIME";
  const STYLE_ID = "ep-v78-style";
  const TOPLINE_ID = "ep-v78-topline";
  const PANEL_ID = "ep-v78-new-db-panel";

  function txt(el) {
    return String((el && el.textContent) || "").replace(/\s+/g, " ").trim();
  }

  function low(el) {
    return txt(el).toLowerCase();
  }

  function visible(el) {
    if (!el || !el.getBoundingClientRect) return false;

    const st = window.getComputedStyle(el);
    if (st.display === "none" || st.visibility === "hidden") return false;

    const r = el.getBoundingClientRect();
    return r.width > 4 && r.height > 4;
  }

  function appIsLoading() {
    const body = String(document.body && document.body.textContent || "").toLowerCase();

    return (
      body.includes("загрузка профиля") ||
      body.includes("загрузка данных") ||
      body.includes("loading profile")
    );
  }

  function appIsReady() {
    if (appIsLoading()) return false;

    const body = String(document.body && document.body.textContent || "").toLowerCase();

    return (
      body.includes("база сервера") ||
      body.includes("моя база") ||
      body.includes("материалы") ||
      body.includes("работы") ||
      body.includes("заказчик") ||
      body.includes("смета")
    );
  }

  function ensureStyle() {
    if (document.getElementById(STYLE_ID)) return;

    const style = document.createElement("style");
    style.id = STYLE_ID;
    style.textContent = `
      .ep-v78-hide-old {
        display: none !important;
        visibility: hidden !important;
        opacity: 0 !important;
        pointer-events: none !important;
      }

      #${TOPLINE_ID} {
        position: fixed;
        top: max(2px, env(safe-area-inset-top));
        left: 6px;
        right: 6px;
        height: 22px;
        z-index: 2147483647;
        display: flex;
        align-items: center;
        justify-content: center;
        pointer-events: none !important;
      }

      #${TOPLINE_ID} .ep-v78-pill {
        max-width: calc(100vw - 14px);
        padding: 4px 9px;
        border-radius: 999px;
        background: rgba(17,24,39,.9);
        color: #fff;
        font-size: 10px;
        line-height: 1;
        font-weight: 900;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        pointer-events: none !important;
        box-shadow: 0 3px 10px rgba(0,0,0,.14);
      }

      #${PANEL_ID} {
        margin: 12px 0;
        padding: 12px;
        border-radius: 18px;
        background: #ecfdf5;
        border: 1px solid rgba(16,185,129,.28);
        display: grid;
        gap: 9px;
      }

      #${PANEL_ID} button {
        width: 100%;
        border: 0;
        border-radius: 14px;
        padding: 13px 12px;
        font-weight: 900;
        color: #fff;
        background: #059669;
      }

      #${PANEL_ID} .ep-v78-main-btn {
        background: linear-gradient(135deg, #059669, #2563eb);
      }

      #${PANEL_ID} .ep-v78-row {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 8px;
      }

      #${PANEL_ID} .ep-v78-row button {
        background: #2563eb;
      }

      #${PANEL_ID} .ep-v78-note {
        font-size: 12px;
        font-weight: 800;
        color: #065f46;
        line-height: 1.3;
      }
    `;

    document.head.appendChild(style);
  }

  function scopeLabel() {
    try {
      if (window.EP_DB && typeof window.EP_DB.getScope === "function") {
        return window.EP_DB.getScope() === "my" ? "Моя" : "Сервера";
      }

      if (typeof window.epGetDbScope === "function") {
        return window.epGetDbScope() === "my" ? "Моя" : "Сервера";
      }
    } catch (e) {}

    const saved =
      localStorage.getItem("ep_active_db_scope_v67") ||
      localStorage.getItem("ep_active_db_scope_v60") ||
      localStorage.getItem("ep_db_scope") ||
      "";

    return String(saved).includes("my") ? "Моя" : "Сервера";
  }

  function ensureTopline() {
    if (!appIsReady()) return;

    ensureStyle();

    let line = document.getElementById(TOPLINE_ID);

    if (!line) {
      line = document.createElement("div");
      line.id = TOPLINE_ID;
      line.innerHTML = `<div class="ep-v78-pill"></div>`;
      document.body.appendChild(line);
    }

    line.querySelector(".ep-v78-pill").textContent =
      `Electric PRO · V78 · База: ${scopeLabel()}`;
  }

  function disableOldStatusFunctions() {
    if (!appIsReady()) return;

    const noop = function () { return true; };

    [
      "ep17SetStatus",
      "ep18SetStatus",
      "epV18SetStatus",
      "epV21SetStatus",
      "setStatus"
    ].forEach((name) => {
      if (typeof window[name] === "function" && !window[name].__epV78Noop) {
        const fn = noop;
        fn.__epV78Noop = true;
        window[name] = fn;
      }
    });
  }

  function hideOldStatusChips() {
    if (!appIsReady()) return;

    ["ep-v73-statusbar", "ep-v74-top-status"].forEach((id) => {
      const el = document.getElementById(id);
      if (el) el.classList.add("ep-v78-hide-old");
    });

    const nodes = Array.from(document.querySelectorAll("div, span, button"))
      .filter(visible)
      .filter((el) => !el.closest("#" + TOPLINE_ID));

    nodes.forEach((el) => {
      const raw = txt(el);
      const t = raw.toLowerCase();
      const r = el.getBoundingClientRect();
      const st = window.getComputedStyle(el);

      const isOldVersion =
        /^✅?\s*v(16|17|18|19|20|21)\s+(активна|загружена)$/i.test(raw) ||
        t.includes("v17 активна") ||
        t.includes("v18 активна") ||
        t.includes("v21 активна") ||
        t.includes("v16 загружена");

      const isOldBase =
        /^база:\s*(моя|глобальная|сервера|серверная)$/i.test(raw);

      const small =
        r.width < 300 &&
        r.height < 90 &&
        raw.length < 70;

      const floating =
        st.position === "fixed" ||
        r.top < 130 ||
        r.bottom > window.innerHeight - 170;

      if ((isOldVersion || isOldBase) && small && floating) {
        el.classList.add("ep-v78-hide-old");
        el.style.pointerEvents = "none";
      }
    });
  }

  function oldMassCard(el) {
    if (!visible(el)) return false;

    const t = low(el);
    const r = el.getBoundingClientRect();

    if (r.width > 950 || r.height > 750) return false;

    const oldTitle =
      t.includes("массовое управление v17") ||
      t.includes("массовое управление v18") ||
      t.includes("массовое управление v21");

    const oldControls =
      t.includes("категория") &&
      t.includes("подкатегория") &&
      t.includes("переместить") &&
      t.includes("удалить выбран");

    return oldTitle && oldControls;
  }

  function hideOldMassCards() {
    if (!appIsReady()) return;

    const cards = Array.from(document.querySelectorAll("section, article, aside, div"))
      .filter(oldMassCard);

    cards.forEach((card) => {
      card.classList.add("ep-v78-hide-old");
      card.setAttribute("data-ep-v78-hidden", "old-mass");
    });
  }

  function findDbBlock() {
    const buttons = Array.from(document.querySelectorAll("button")).filter(visible);

    const server = buttons.find((b) => low(b).includes("база сервера"));
    const my = buttons.find((b) => low(b).includes("моя база"));
    const start = server || my;

    if (!start) return null;

    let el = start;

    for (let i = 0; i < 10 && el; i++) {
      const t = low(el);
      const r = el.getBoundingClientRect();

      if (
        t.includes("материалы") &&
        t.includes("работы") &&
        r.width < 1000 &&
        r.height < 2200
      ) {
        return el;
      }

      el = el.parentElement;
    }

    return start.parentElement || null;
  }

  function openNewDb() {
    if (window.EP_DB_V68 && typeof window.EP_DB_V68.open === "function") {
      window.EP_DB_V68.open();
      return;
    }

    alert("Новая база ещё загружается. Обнови страницу.");
  }

  function createCategory() {
    const name = prompt("Название новой категории:");
    if (!name) return;

    if (window.EP_DB_V72 && typeof window.EP_DB_V72.addCustomCategory === "function") {
      window.EP_DB_V72.addCustomCategory(name);
    }

    alert("Категория создана: " + name);

    if (window.EP_DB_V72 && typeof window.EP_DB_V72.refreshV68 === "function") {
      window.EP_DB_V72.refreshV68();
    }
  }

  function createSubcategory() {
    const cat = prompt("К какой категории добавить подкатегорию?");
    if (!cat) return;

    const sub = prompt("Название новой подкатегории:");
    if (!sub) return;

    if (window.EP_DB_V72 && typeof window.EP_DB_V72.addCustomSubcategory === "function") {
      window.EP_DB_V72.addCustomSubcategory(cat, sub);
    }

    alert("Подкатегория создана: " + cat + " / " + sub);

    if (window.EP_DB_V72 && typeof window.EP_DB_V72.refreshV68 === "function") {
      window.EP_DB_V72.refreshV68();
    }
  }

  function ensurePanel() {
    if (!appIsReady()) return;

    ensureStyle();

    let panel = document.getElementById(PANEL_ID);

    if (!panel) {
      panel = document.createElement("div");
      panel.id = PANEL_ID;
      panel.innerHTML = `
        <button type="button" class="ep-v78-main-btn">✅ Открыть новую базу V68/V69</button>

        <div class="ep-v78-row">
          <button type="button" data-v78="cat">+ Создать категорию</button>
          <button type="button" data-v78="sub">+ Создать подкатегорию</button>
        </div>

        <div class="ep-v78-note">
          Старые V17/V18/V21 отключены после загрузки. Работаем через новую базу.
        </div>
      `;

      panel.querySelector(".ep-v78-main-btn").addEventListener("click", openNewDb);
      panel.querySelector('[data-v78="cat"]').addEventListener("click", createCategory);
      panel.querySelector('[data-v78="sub"]').addEventListener("click", createSubcategory);
    }

    const db = findDbBlock();

    if (db && !db.contains(panel)) {
      const tabs = Array.from(db.querySelectorAll("button"))
        .filter(visible)
        .find((b) => low(b).includes("материалы"));

      if (tabs && tabs.parentElement) {
        tabs.parentElement.insertAdjacentElement("afterend", panel);
      } else {
        db.insertBefore(panel, db.firstChild ? db.firstChild.nextSibling : null);
      }
    }
  }

  function run() {
    if (!appIsReady()) return;

    ensureTopline();
    disableOldStatusFunctions();
    hideOldStatusChips();
    hideOldMassCards();
    ensurePanel();
  }

  function boot() {
    ensureStyle();

    let ticks = 0;

    const timer = setInterval(() => {
      run();
      ticks += 1;

      if (ticks > 50) {
        clearInterval(timer);
      }
    }, 400);

    document.addEventListener("click", function () {
      setTimeout(run, 120);
      setTimeout(run, 400);
    }, true);

    console.log("04-database-v78-safe-clean-old-runtime.js", VERSION, "loaded");
  }

  window.EP_DB_V78 = {
    version: VERSION,
    run,
    openNewDb,
    createCategory,
    createSubcategory
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
