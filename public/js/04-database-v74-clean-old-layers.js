/*
 * Electric PRO Refactor
 * V74 Clean Old Database Layers
 *
 * Цель:
 * - скрыть старые дубли "Массовое управление V18/V21";
 * - оставить один вход в новую базу V68/V69;
 * - поднять статусные плашки наверх и отключить им клики;
 * - дать кнопки создания категории/подкатегории.
 */

(function () {
  "use strict";

  const VERSION = "V74_CLEAN_OLD_DATABASE_LAYERS";
  const STYLE_ID = "ep-v74-clean-style";
  const PANEL_ID = "ep-v74-clean-db-panel";
  const STATUS_ID = "ep-v74-top-status";

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

    return r.width > 8 && r.height > 8;
  }

  function ensureStyle() {
    if (document.getElementById(STYLE_ID)) return;

    const style = document.createElement("style");
    style.id = STYLE_ID;
    style.textContent = `
      .ep-v74-hidden-old-mass {
        display: none !important;
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

      #${PANEL_ID} .ep-v74-main-btn {
        background: linear-gradient(135deg, #059669, #2563eb);
      }

      #${PANEL_ID} .ep-v74-row {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 8px;
      }

      #${PANEL_ID} .ep-v74-row button {
        background: #2563eb;
      }

      #${PANEL_ID} .ep-v74-note {
        font-size: 12px;
        font-weight: 800;
        color: #065f46;
        line-height: 1.3;
      }

      #${STATUS_ID} {
        position: fixed;
        top: max(4px, env(safe-area-inset-top));
        left: 6px;
        right: 6px;
        z-index: 2147483647;
        display: flex;
        gap: 5px;
        flex-wrap: wrap;
        pointer-events: none !important;
      }

      #${STATUS_ID} > * {
        position: static !important;
        inset: auto !important;
        left: auto !important;
        right: auto !important;
        bottom: auto !important;
        top: auto !important;
        transform: none !important;
        margin: 0 !important;
        max-width: calc(50vw - 10px);
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        pointer-events: none !important;
      }

      .ep-v74-status-chip {
        pointer-events: none !important;
      }
    `;

    document.head.appendChild(style);
  }

  function getStatusBar() {
    ensureStyle();

    let bar = document.getElementById(STATUS_ID);

    if (!bar) {
      bar = document.createElement("div");
      bar.id = STATUS_ID;
      document.body.appendChild(bar);
    }

    return bar;
  }

  function moveStatusChips() {
    const bar = getStatusBar();

    const chips = Array.from(document.querySelectorAll("div, span, button"))
      .filter(isVisible)
      .filter((el) => {
        if (bar.contains(el)) return false;
        if (el.id === STATUS_ID) return false;

        const t = lower(el);
        const r = el.getBoundingClientRect();
        const st = window.getComputedStyle(el);

        const looksLikeStatus =
          t.includes("база:") ||
          /v\d+\s+активна/.test(t) ||
          t === "на выход";

        const small =
          r.width < 260 &&
          r.height < 70 &&
          text(el).length < 40;

        const floatingOrBottom =
          st.position === "fixed" ||
          r.bottom > window.innerHeight - 150 ||
          r.top < 80;

        return looksLikeStatus && small && floatingOrBottom;
      });

    chips.forEach((chip) => {
      chip.classList.add("ep-v74-status-chip");
      chip.style.pointerEvents = "none";
      bar.appendChild(chip);
    });
  }

  function titleLooksLikeOldMass(el) {
    const t = text(el);

    return /^Массовое управление V\d+$/i.test(t);
  }

  function findOldMassCards() {
    const titles = Array.from(document.querySelectorAll("h1,h2,h3,h4,b,strong,p,div"))
      .filter(isVisible)
      .filter(titleLooksLikeOldMass);

    const cards = [];

    titles.forEach((title) => {
      let el = title;

      for (let i = 0; i < 8 && el; i++) {
        const t = lower(el);
        const selects = el.querySelectorAll ? el.querySelectorAll("select").length : 0;
        const buttons = el.querySelectorAll ? Array.from(el.querySelectorAll("button")).map(lower).join(" ") : "";
        const r = el.getBoundingClientRect ? el.getBoundingClientRect() : { width: 9999, height: 9999 };

        const isCard =
          t.includes("массовое управление") &&
          selects >= 2 &&
          buttons.includes("переместить") &&
          buttons.includes("удалить") &&
          r.height < 700 &&
          r.width < 900;

        if (isCard) {
          cards.push(el);
          break;
        }

        el = el.parentElement;
      }
    });

    return Array.from(new Set(cards));
  }

  function findDatabaseBlock() {
    const buttons = Array.from(document.querySelectorAll("button"))
      .filter(isVisible);

    const serverBtn = buttons.find((b) => lower(b).includes("база сервера"));
    const myBtn = buttons.find((b) => lower(b).includes("моя база"));

    let start = serverBtn || myBtn;

    if (!start) return null;

    let el = start;

    for (let i = 0; i < 10 && el; i++) {
      const t = lower(el);
      const r = el.getBoundingClientRect();

      if (
        t.includes("материалы") &&
        t.includes("работы") &&
        r.width < 1000 &&
        r.height < 1800
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

    alert("Новая база V68/V69 ещё не загрузилась. Обнови страницу.");
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

  function createCleanPanel() {
    let panel = document.getElementById(PANEL_ID);

    if (!panel) {
      panel = document.createElement("div");
      panel.id = PANEL_ID;
      panel.innerHTML = `
        <button type="button" class="ep-v74-main-btn">✅ Открыть новую базу V68/V69</button>

        <div class="ep-v74-row">
          <button type="button" data-v74="cat">+ Создать категорию</button>
          <button type="button" data-v74="sub">+ Создать подкатегорию</button>
        </div>

        <div class="ep-v74-note">
          Старые блоки V18/V21 скрыты. Работаем через новую базу, чтобы не было дублей и зависаний.
        </div>
      `;

      panel.querySelector(".ep-v74-main-btn").addEventListener("click", openNewDb);
      panel.querySelector('[data-v74="cat"]').addEventListener("click", createCategory);
      panel.querySelector('[data-v74="sub"]').addEventListener("click", createSubcategory);
    }

    return panel;
  }

  function mountCleanPanel(anchor) {
    const panel = createCleanPanel();

    if (panel.parentElement) return;

    if (anchor && anchor.parentElement) {
      anchor.parentElement.insertBefore(panel, anchor);
      return;
    }

    const db = findDatabaseBlock();

    if (db) {
      db.insertBefore(panel, db.firstChild ? db.firstChild.nextSibling : null);
    }
  }

  function hideOldMassCards() {
    const cards = findOldMassCards();

    cards.forEach((card, index) => {
      if (index === 0) mountCleanPanel(card);

      card.classList.add("ep-v74-hidden-old-mass");
      card.setAttribute("data-ep-v74-hidden", "old-mass");
    });

    if (!cards.length && !document.getElementById(PANEL_ID)) {
      mountCleanPanel(null);
    }
  }

  function run() {
    ensureStyle();
    moveStatusChips();
    hideOldMassCards();
  }

  function boot() {
    run();

    let ticks = 0;

    const timer = setInterval(() => {
      run();
      ticks++;
      if (ticks > 40) clearInterval(timer);
    }, 400);

    const observer = new MutationObserver(() => {
      setTimeout(run, 60);
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ["class", "style"]
    });

    document.addEventListener("click", () => {
      setTimeout(run, 80);
      setTimeout(run, 250);
    }, true);

    console.log("04-database-v74-clean-old-layers.js", VERSION, "loaded");
  }

  window.EP_DB_V74 = {
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
