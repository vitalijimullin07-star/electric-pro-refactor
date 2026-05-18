/*
 * Electric PRO Refactor
 * V64 Database Editor Permissions
 *
 * Исправляет:
 * 1. В "Моя база" можно редактировать цену и единицу измерения.
 * 2. В массовом управлении подкатегория не должна быть пустой при перемещении.
 * 3. Мастер в "База сервера" не должен редактировать серверную базу напрямую.
 */

(function () {
  "use strict";

  const VERSION = "V64_DATABASE_EDITOR_PERMISSIONS";
  const STYLE_ID = "ep-db-editor-permissions-v64-style";

  const UNITS = ["ед", "ед.", "м.п", "м.п.", "м", "м.", "упк", "шт", "шт."];

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
      localStorage.getItem("ep_active_db_scope_v60") ||
      localStorage.getItem("ep_db_scope") ||
      "global"
    );
  }

  function isAdmin() {
    try {
      if (window.isAdmin === true) return true;
      if (window.adminServerMode === true) return true;
      if (window.EP_IS_ADMIN === true) return true;

      const email =
        (window.fbUser && window.fbUser.email) ||
        (window.currentUser && window.currentUser.email) ||
        "";

      if (String(email).toLowerCase() === "vits0007@gmail.com") return true;

      const txt = String(document.body.textContent || "").toLowerCase();
      if (txt.includes("админ") && txt.includes("панель")) {
        return true;
      }
    } catch (e) {}

    return false;
  }

  function canEditCurrentDb() {
    const scope = getScope();

    if (scope === "my") return true;
    if (scope === "global" && isAdmin()) return true;

    return false;
  }

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

    return (
      r.width > 8 &&
      r.height > 8 &&
      r.bottom > 0 &&
      r.top < window.innerHeight &&
      r.right > 0 &&
      r.left < window.innerWidth
    );
  }

  function ensureStyle() {
    if (document.getElementById(STYLE_ID)) return;

    const style = document.createElement("style");
    style.id = STYLE_ID;
    style.textContent = `
      .ep-db-readonly-v64 {
        opacity: .58 !important;
        pointer-events: none !important;
      }

      .ep-db-editable-v64 {
        outline: 2px solid rgba(37,99,235,.18) !important;
        background: #fff !important;
      }

      .ep-db-locked-note-v64 {
        margin: 8px 0;
        padding: 9px 11px;
        border-radius: 12px;
        background: rgba(245, 158, 11, .12);
        color: #92400e;
        font-weight: 800;
        font-size: 12px;
      }
    `;

    document.head.appendChild(style);
  }

  function getActiveItems() {
    const scope = getScope();

    let mat = [];
    let work = [];

    if (scope === "my") {
      mat = window.EP_MY_MAT || window.userMatDB || window.matDB || [];
      work = window.EP_MY_WORK || window.userWorkDB || window.workDB || [];
    } else {
      mat = window.EP_GLOBAL_MAT || window.matDB || [];
      work = window.EP_GLOBAL_WORK || window.workDB || [];
    }

    return []
      .concat(Array.isArray(mat) ? mat : [])
      .concat(Array.isArray(work) ? work : []);
  }

  function getCategory(item) {
    return (
      item.category ||
      item.cat ||
      item.group ||
      item.section ||
      item.type ||
      ""
    );
  }

  function getSubcategory(item) {
    return (
      item.subcategory ||
      item.subcat ||
      item.sub ||
      item.kind ||
      item.folder ||
      ""
    );
  }

  function getCategoryMap() {
    const map = {};
    const items = getActiveItems();

    items.forEach((item) => {
      const cat = String(getCategory(item) || "").trim();
      const sub = String(getSubcategory(item) || "").trim();

      if (!cat) return;

      if (!map[cat]) map[cat] = new Set();

      if (sub) map[cat].add(sub);
    });

    return map;
  }

  function setSelectOptions(select, values, placeholder) {
    if (!select) return;

    const oldValue = select.value;

    select.innerHTML = "";

    const ph = document.createElement("option");
    ph.value = "";
    ph.textContent = placeholder;
    select.appendChild(ph);

    values.forEach((value) => {
      const opt = document.createElement("option");
      opt.value = value;
      opt.textContent = value;
      select.appendChild(opt);
    });

    if (oldValue && values.includes(oldValue)) {
      select.value = oldValue;
    }
  }

  function findBulkBlocks() {
    return Array.from(document.querySelectorAll("section, article, aside, main, div"))
      .filter(isVisible)
      .filter((el) => {
        const t = lower(el);

        return (
          t.includes("массовое управление") ||
          (
            t.includes("категория") &&
            t.includes("подкатегория") &&
            t.includes("переместить")
          )
        );
      })
      .sort((a, b) => {
        const ar = a.getBoundingClientRect();
        const br = b.getBoundingClientRect();
        return (ar.width * ar.height) - (br.width * br.height);
      })
      .slice(0, 3);
  }

  function fixBulkCategorySelectors() {
    const map = getCategoryMap();
    const categories = Object.keys(map).sort((a, b) => a.localeCompare(b, "ru"));

    findBulkBlocks().forEach((block) => {
      const selects = Array.from(block.querySelectorAll("select")).filter(isVisible);
      if (selects.length < 2) return;

      const catSelect = selects[0];
      const subSelect = selects[1];

      if (categories.length && catSelect.options.length <= 1) {
        setSelectOptions(catSelect, categories, "Категория");
      }

      function updateSubcategories() {
        const cat = catSelect.value;
        const subs = cat && map[cat] ? Array.from(map[cat]).sort((a, b) => a.localeCompare(b, "ru")) : [];

        if (subs.length) {
          setSelectOptions(subSelect, subs, "Подкатегория");
        } else {
          setSelectOptions(subSelect, ["Без подкатегории"], "Подкатегория");
          subSelect.value = "Без подкатегории";
        }
      }

      if (!catSelect.dataset.v64Bound) {
        catSelect.dataset.v64Bound = "1";
        catSelect.addEventListener("change", updateSubcategories);
      }

      if (!subSelect.dataset.v64Fixed) {
        subSelect.dataset.v64Fixed = "1";

        if (subSelect.options.length <= 1) {
          updateSubcategories();
        }
      }

      const moveBtn = Array.from(block.querySelectorAll("button"))
        .find((btn) => lower(btn).includes("переместить"));

      if (moveBtn && !moveBtn.dataset.v64Bound) {
        moveBtn.dataset.v64Bound = "1";
        moveBtn.addEventListener("click", function (e) {
          if (!catSelect.value) {
            e.preventDefault();
            e.stopPropagation();
            alert("Сначала выбери категорию");
            return;
          }

          if (!subSelect.value && subSelect.options.length > 1) {
            subSelect.selectedIndex = 1;
          }
        }, true);
      }
    });
  }

  function isPriceInput(input) {
    if (!input) return false;

    const type = String(input.type || "").toLowerCase();
    const val = String(input.value || "");

    if (type === "number") return true;

    const row = input.closest("li, tr, .row, .item, .card, div") || input.parentElement;
    const t = lower(row);

    if (t.includes("₽") || t.includes("руб") || t.includes("цена")) {
      if (/^\d+([.,]\d+)?$/.test(val.trim())) return true;
    }

    return false;
  }

  function isUnitSelect(select) {
    if (!select) return false;

    const values = Array.from(select.options || []).map((o) => lower(o));
    return values.some((v) => UNITS.includes(v));
  }

  function unlockAllowedEditors() {
    ensureStyle();

    const allowed = canEditCurrentDb();
    const scope = getScope();

    const rootBlocks = Array.from(document.querySelectorAll("section, article, aside, main, div"))
      .filter(isVisible)
      .filter((el) => {
        const t = lower(el);
        return (
          t.includes("база данных") ||
          t.includes("моя база") ||
          t.includes("база сервера") ||
          t.includes("материалы") ||
          t.includes("работы")
        );
      });

    const roots = rootBlocks.length ? rootBlocks.slice(0, 8) : [document.body];

    roots.forEach((root) => {
      root.querySelectorAll("input").forEach((input) => {
        if (!isVisible(input)) return;

        if (input.type === "checkbox") return;

        if (isPriceInput(input)) {
          input.disabled = !allowed;
          input.readOnly = !allowed;
          input.classList.toggle("ep-db-editable-v64", allowed);
          input.classList.toggle("ep-db-readonly-v64", !allowed);
        }
      });

      root.querySelectorAll("select").forEach((select) => {
        if (!isVisible(select)) return;

        if (isUnitSelect(select)) {
          select.disabled = !allowed;
          select.classList.toggle("ep-db-editable-v64", allowed);
          select.classList.toggle("ep-db-readonly-v64", !allowed);
        }
      });
    });

    // Если это серверная база и пользователь не админ — даём понятную подсказку.
    if (scope === "global" && !isAdmin()) {
      const serverBlocks = Array.from(document.querySelectorAll("section, article, aside, main, div"))
        .filter(isVisible)
        .filter((el) => lower(el).includes("база сервера"));

      const block = serverBlocks[0];

      if (block && !block.querySelector(".ep-db-locked-note-v64")) {
        const note = document.createElement("div");
        note.className = "ep-db-locked-note-v64";
        note.textContent = "База сервера доступна мастеру только для выбора/копирования. Редактирование сервера — через админа.";
        block.insertBefore(note, block.firstChild ? block.firstChild.nextSibling : null);
      }
    }
  }

  function patchAddButtons() {
    document.addEventListener("click", function (e) {
      const btn = e.target && e.target.closest ? e.target.closest("button") : null;
      if (!btn) return;

      const t = lower(btn);

      if (!t.includes("добав") && !t.includes("создать")) return;

      const scope = getScope();

      // Мастер в базе сервера не должен добавлять напрямую.
      if (scope === "global" && !isAdmin()) {
        const area = lower(btn.closest("section, div, main, aside") || document.body);

        if (area.includes("база сервера") || area.includes("глобальная") || area.includes("сервер")) {
          e.preventDefault();
          e.stopPropagation();
          alert("В базу сервера мастер напрямую не добавляет. Добавление на сервер — через заявку админу.");
        }
      }
    }, true);
  }

  function boot() {
    ensureStyle();
    patchAddButtons();

    let ticks = 0;

    const run = () => {
      unlockAllowedEditors();
      fixBulkCategorySelectors();

      ticks += 1;
    };

    run();

    const timer = setInterval(() => {
      run();
      if (ticks > 30) clearInterval(timer);
    }, 400);

    const observer = new MutationObserver(() => {
      run();
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ["class", "style", "disabled", "readonly"]
    });

    document.addEventListener("click", () => {
      setTimeout(run, 80);
      setTimeout(run, 250);
    }, true);

    console.log("04-database-editor-permissions-v64.js", VERSION, "loaded");
  }

  window.EP_DB_EDITOR_PERMISSIONS_V64 = {
    version: VERSION,
    unlockAllowedEditors,
    fixBulkCategorySelectors,
    canEditCurrentDb,
    isAdmin,
    getScope
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
