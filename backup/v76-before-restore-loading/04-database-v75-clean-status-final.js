/*
 * Electric PRO Refactor
 * V75 Clean Status Final
 *
 * Убирает старые хвосты:
 * - V17 активна
 * - V18/V21 массовое управление
 * - старые База: Моя/Глобальная плашки
 *
 * Оставляет одну маленькую строку сверху:
 * Electric PRO · V75 · База: ...
 */

(function () {
  "use strict";

  const VERSION = "V75_CLEAN_STATUS_FINAL";

  const STYLE_ID = "ep-v75-clean-style";
  const TOPLINE_ID = "ep-v75-topline";
  const PANEL_ID = "ep-v75-new-db-panel";

  function text(el) {
    return String((el && el.textContent) || "").replace(/\s+/g, " ").trim();
  }

  function lower(el) {
    return text(el).toLowerCase();
  }

  function isVisible(el) {
    if (!el || !el.getBoundingClientRect) return false;

    const st = window.getComputedStyle(el);
    if (st.display === "none" || st.visibility === "hidden") return false;

    const r = el.getBoundingClientRect();
    return r.width > 4 && r.height > 4;
  }

  function ensureStyle() {
    if (document.getElementById(STYLE_ID)) return;

    const style = document.createElement("style");
    style.id = STYLE_ID;
    style.textContent = `
      .ep-v75-force-hide {
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
        justify-content: center;
        align-items: center;
        pointer-events: none !important;
      }

      #${TOPLINE_ID} .ep-v75-pill {
        max-width: calc(100vw - 14px);
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
        padding: 4px 9px;
        border-radius: 999px;
        background: rgba(17,24,39,.88);
        color: #fff;
        font-size: 10px;
        line-height: 1;
        font-weight: 900;
        letter-spacing: .1px;
        box-shadow: 0 3px 10px rgba(0,0,0,.14);
        pointer-events: none !important;
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
        box-shadow: 0 6px 18px rgba(5,150,105,.18);
      }

      #${PANEL_ID} .ep-v75-main-btn {
        background: linear-gradient(135deg, #059669, #2563eb);
      }

      #${PANEL_ID} .ep-v75-row {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 8px;
      }

      #${PANEL_ID} .ep-v75-row button {
        background: #2563eb;
      }

      #${PANEL_ID} .ep-v75-note {
        font-size: 12px;
        font-weight: 800;
        color: #065f46;
        line-height: 1.3;
      }
    `;

    document.head.appendChild(style);
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

  function ensureTopline() {
    ensureStyle();

    let line = document.getElementById(TOPLINE_ID);

    if (!line) {
      line = document.createElement("div");
      line.id = TOPLINE_ID;
      line.innerHTML = `<div class="ep-v75-pill"></div>`;
      document.body.appendChild(line);
    }

    const pill = line.querySelector(".ep-v75-pill");
    pill.textContent = `Electric PRO · V75 · База: ${getScopeLabel()}`;

    return line;
  }

  function hideOldStatusBars() {
    // Убираем контейнеры от прошлых версий, если они остались.
    ["ep-v73-statusbar", "ep-v74-top-status"].forEach((id) => {
      const el = document.getElementById(id);
      if (el) el.classList.add("ep-v75-force-hide");
    });

    const nodes = Array.from(document.querySelectorAll("div, span, button"))
      .filter((el) => el.id !== TOPLINE_ID)
      .filter((el) => !el.closest("#" + TOPLINE_ID))
      .filter(isVisible);

    nodes.forEach((el) => {
      const t = lower(el);
      const raw = text(el);
      const r = el.getBoundingClientRect();
      const st = window.getComputedStyle(el);

      const isOldVersionChip =
        /^✅?\s*v\d+\s+активна$/i.test(raw) ||
        /^v\d+\s+активна$/i.test(raw) ||
        t.includes("v17 активна") ||
        t.includes("v18 активна") ||
        t.includes("v21 активна");

      const isOldBaseChip =
        /^база:\s*(моя|глобальная|сервера|серверная)$/i.test(raw);

      const isFloatingSmall =
        r.width < 280 &&
        r.height < 80 &&
        raw.length < 60 &&
        (
          st.position === "fixed" ||
          r.top < 110 ||
          r.bottom > window.innerHeight - 150
        );

      if ((isOldVersionChip || isOldBaseChip) && isFloatingSmall) {
        el.classList.add("ep-v75-force-hide");
        el.style.display = "none";
        el.style.pointerEvents = "none";
      }
    });
  }

  function findOldMassCards() {
    const candidates = Array.from(document.querySelectorAll("section, article, aside, div"))
      .filter(isVisible)
      .filter((el) => {
        const t = lower(el);
        const r = el.getBoundingClientRect();

        const hasOldTitle =
          t.includes("массовое управление v18") ||
          t.includes("массовое управление v21") ||
          t.includes("массовое управление v17");

        const hasOldControls =
          t.includes("категория") &&
          t.includes("подкатегория") &&
          t.includes("переместить") &&
          t.includes("удалить выбран");

        const notHuge = r.width < 950 && r.height < 650;

        return hasOldTitle && hasOldControls && notHuge;
      });

    return Array.from(new Set(candidates));
  }

  function hideOldMassCards() {
    const cards = findOldMassCards();

    cards.forEach((card) => {
      card.classList.add("ep-v75-force-hide");
      card.setAttribute("data-ep-v75-hidden", "old-mass");
    });
  }

  function findDatabaseBlock() {
    const buttons = Array.from(document.querySelectorAll("button")).filter(isVisible);

    const serverBtn = buttons.find((b) => lower(b).includes("база сервера"));
    const myBtn = buttons.find((b) => lower(b).includes("моя база"));

    const start = serverBtn || myBtn;
    if (!start) return null;

    let el = start;

    for (let i = 0; i < 10 && el; i++) {
      const t = lower(el);
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
    } else {
      const key = "ep_db_custom_categories_v72";
      let data = {};
      try {
        data = JSON.parse(localStorage.getItem(key) || "{}");
      } catch (e) {}

      if (!data[name]) data[name] = ["Без подкатегории"];
      localStorage.setItem(key, JSON.stringify(data));
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
    } else {
      const key = "ep_db_custom_categories_v72";
      let data = {};
      try {
        data = JSON.parse(localStorage.getItem(key) || "{}");
      } catch (e) {}

      if (!data[cat]) data[cat] = [];
      if (!data[cat].includes(sub)) data[cat].push(sub);
      localStorage.setItem(key, JSON.stringify(data));
    }

    alert("Подкатегория создана: " + cat + " / " + sub);

    if (window.EP_DB_V72 && typeof window.EP_DB_V72.refreshV68 === "function") {
      window.EP_DB_V72.refreshV68();
    }
  }

  function ensureCleanPanel() {
    ensureStyle();

    let panel = document.getElementById(PANEL_ID);

    if (!panel) {
      panel = document.createElement("div");
      panel.id = PANEL_ID;
      panel.innerHTML = `
        <button type="button" class="ep-v75-main-btn">✅ Открыть новую базу V68/V69</button>

        <div class="ep-v75-row">
          <button type="button" data-v75="cat">+ Создать категорию</button>
          <button type="button" data-v75="sub">+ Создать подкатегорию</button>
        </div>

        <div class="ep-v75-note">
          Старые V17/V18/V21 скрыты. Работаем через новую базу.
        </div>
      `;

      panel.querySelector(".ep-v75-main-btn").addEventListener("click", openNewDb);
      panel.querySelector('[data-v75="cat"]').addEventListener("click", createCategory);
      panel.querySelector('[data-v75="sub"]').addEventListener("click", createSubcategory);
    }

    const db = findDatabaseBlock();

    if (db && !db.contains(panel)) {
      const tabs = Array.from(db.querySelectorAll("button"))
        .filter(isVisible)
        .find((b) => lower(b).includes("материалы"));

      if (tabs && tabs.parentElement) {
        tabs.parentElement.insertAdjacentElement("afterend", panel);
      } else {
        db.insertBefore(panel, db.firstChild ? db.firstChild.nextSibling : null);
      }
    }
  }

  function run() {
    ensureTopline();
    hideOldStatusBars();
    hideOldMassCards();
    ensureCleanPanel();
  }

  function boot() {
    run();

    let ticks = 0;

    const timer = setInterval(() => {
      run();
      ticks++;
      if (ticks > 60) clearInterval(timer);
    }, 350);

    const observer = new MutationObserver(() => {
      setTimeout(run, 40);
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ["class", "style"]
    });

    document.addEventListener("click", () => {
      setTimeout(run, 60);
      setTimeout(run, 180);
    }, true);

    console.log("04-database-v75-clean-status-final.js", VERSION, "loaded");
  }

  window.EP_DB_V75 = {
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
