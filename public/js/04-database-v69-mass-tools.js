/*
 * Electric PRO Refactor
 * V69 Database Mass Tools for V68
 */

(function () {
  "use strict";

  const VERSION = "V69_DATABASE_MASS_TOOLS";
  const STYLE_ID = "ep-db-v69-style";
  const TOOLBAR_ID = "ep-db-v69-toolbar";

  const PRESET = {
    "Кабель": ["Силовой кабель", "Слаботочный кабель", "Прочее"],
    "Слаботочка": ["Интернет", "ТВ", "Домофон", "Видеонаблюдение", "Прочее"],
    "Трубы": ["ПВХ", "ПНД", "Гофра", "Металлорукав", "Прочее"],
    "Расходники": ["Крепёж", "Клеммы", "Изолента", "Стяжки", "Наконечники", "Прочее"],
    "Автоматика": ["Автоматы", "УЗО", "ДИФы", "УЗДП", "УЗМ", "Реле", "Контакторы", "Другие аппараты"],
    "Щитовое": ["Корпуса встраиваемые", "Корпуса накладные", "Шинки", "Гребёнки", "DIN-рейки", "Провода", "Расходка щита"],
    "Розетки/выключатели": ["Розетки", "Выключатели", "Рамки", "Механизмы", "Прочее"],
    "Освещение": ["Светильники", "Ленты", "Блоки питания", "Датчики", "Прочее"],
    "Монтаж": ["Подрозетники", "Коробки", "Крепёж", "Прочее"],
    "Штробление/резка": ["Штробы", "Ниши", "Резка", "Прочее"],
    "Высверливание подрозетников": ["Бетон", "Кирпич", "Гипс", "Прочее"],
    "Ниши щита": ["Бетон", "Кирпич", "Гипс", "Прочее"],
    "Черновая электрика": ["Кабельные линии", "Подрозетники", "Щит", "Слаботочка", "Прочее"],
    "Чистовая установка": ["Розетки", "Выключатели", "Светильники", "Механизмы", "Прочее"],
    "Демонтаж": ["Демонтаж кабеля", "Демонтаж механизмов", "Демонтаж щита", "Прочее"],
    "Другое": ["Без подкатегории", "Прочее"]
  };

  function arr(v) {
    return Array.isArray(v) ? v : [];
  }

  function getScope() {
    if (window.EP_DB && typeof window.EP_DB.getScope === "function") {
      return window.EP_DB.getScope();
    }
    return "server";
  }

  function isAdmin() {
    return !!(window.EP_DB && typeof window.EP_DB.isAdmin === "function" && window.EP_DB.isAdmin());
  }

  function canMassManage() {
    const scope = getScope();
    if (scope === "my") return true;
    return isAdmin();
  }

  function getActiveType() {
    const active = document.querySelector("#ep-db-v68-modal .ep-db-v68-tab.active");
    return active ? active.dataset.type : "mat";
  }

  function getStore(type) {
    if (window.EP_DB && typeof window.EP_DB.getActiveStore === "function") {
      return arr(window.EP_DB.getActiveStore(type));
    }
    return type === "work" ? arr(window.workDB) : arr(window.matDB);
  }

  function saveMyIfNeeded() {
    try {
      if (window.EP_DB && typeof window.EP_DB.applyActiveStoreToLegacy === "function") {
        window.EP_DB.applyActiveStoreToLegacy();
      }
    } catch (e) {}

    try {
      if (window.EP_DATABASE_SCOPE_GUARD && typeof window.EP_DATABASE_SCOPE_GUARD.persistCurrentActiveIntoStore === "function") {
        window.EP_DATABASE_SCOPE_GUARD.persistCurrentActiveIntoStore();
      }
    } catch (e) {}
  }

  function itemId(item, index) {
    if (!item.id) {
      item.id = "ep_item_" + Date.now() + "_" + index + "_" + Math.random().toString(16).slice(2);
    }
    return String(item.id);
  }

  function itemCat(item) {
    return String(item.category || item.cat || item.group || item.section || item.type || "Другое").trim() || "Другое";
  }

  function itemSub(item) {
    return String(item.subcategory || item.subcat || item.sub || item.kind || item.folder || "Без подкатегории").trim() || "Без подкатегории";
  }

  function setItemCatSub(item, cat, sub) {
    item.category = cat;
    item.subcategory = sub;
    item.cat = cat;
    item.subcat = sub;
  }

  function ensureStyle() {
    if (document.getElementById(STYLE_ID)) return;

    const style = document.createElement("style");
    style.id = STYLE_ID;
    style.textContent = `
      #${TOOLBAR_ID} {
        margin: 0 0 12px;
        padding: 10px;
        border-radius: 16px;
        background: #fff;
        border: 1px solid rgba(17,24,39,.08);
        display: grid;
        gap: 8px;
      }

      .ep-db-v69-row {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 8px;
      }

      #${TOOLBAR_ID} select,
      #${TOOLBAR_ID} button {
        width: 100%;
        border: 1px solid #d1d5db;
        border-radius: 12px;
        padding: 11px 10px;
        font-size: 13px;
        font-weight: 900;
        background: #fff;
      }

      #${TOOLBAR_ID} button {
        border: 0;
        cursor: pointer;
      }

      .ep-db-v69-move {
        background: #2563eb !important;
        color: #fff !important;
      }

      .ep-db-v69-delete {
        background: #dc2626 !important;
        color: #fff !important;
      }

      .ep-db-v69-info {
        font-size: 12px;
        font-weight: 800;
        color: #4b5563;
      }

      .ep-db-v68-item {
        grid-template-columns: 28px 1fr 92px 78px !important;
      }

      .ep-db-v69-check {
        width: 18px;
        height: 18px;
      }
    `;

    document.head.appendChild(style);
  }

  function buildCategoryMap() {
    const map = {};

    Object.keys(PRESET).forEach((cat) => {
      map[cat] = new Set(PRESET[cat]);
    });

    ["mat", "work"].forEach((type) => {
      getStore(type).forEach((item) => {
        const cat = itemCat(item);
        const sub = itemSub(item);
        if (!map[cat]) map[cat] = new Set();
        if (sub) map[cat].add(sub);
      });
    });

    return map;
  }

  function fillSelect(select, values, placeholder) {
    const old = select.value;
    select.innerHTML = "";

    const ph = document.createElement("option");
    ph.value = "";
    ph.textContent = placeholder;
    select.appendChild(ph);

    values.forEach((v) => {
      const opt = document.createElement("option");
      opt.value = v;
      opt.textContent = v;
      select.appendChild(opt);
    });

    if (old && values.includes(old)) select.value = old;
  }

  function ensureToolbar() {
    const modal = document.getElementById("ep-db-v68-modal");
    if (!modal || !modal.classList.contains("show")) return;

    const body = modal.querySelector(".ep-db-v68-body");
    if (!body) return;

    let toolbar = document.getElementById(TOOLBAR_ID);

    if (!toolbar) {
      toolbar = document.createElement("div");
      toolbar.id = TOOLBAR_ID;
      toolbar.innerHTML = `
        <div class="ep-db-v69-info">Массовое управление V69</div>
        <div class="ep-db-v69-row">
          <select data-v69="cat"></select>
          <select data-v69="sub"></select>
        </div>
        <div class="ep-db-v69-row">
          <button type="button" class="ep-db-v69-move">Переместить выбранные</button>
          <button type="button" class="ep-db-v69-delete">Удалить выбранные</button>
        </div>
      `;
    }

    if (body.firstElementChild !== toolbar) {
      body.insertBefore(toolbar, body.firstChild);
    }

    const catSelect = toolbar.querySelector('[data-v69="cat"]');
    const subSelect = toolbar.querySelector('[data-v69="sub"]');
    const map = buildCategoryMap();
    const cats = Object.keys(map).sort((a, b) => a.localeCompare(b, "ru"));

    fillSelect(catSelect, cats, "Категория");

    function updateSub() {
      const cat = catSelect.value;
      const subs = cat && map[cat] ? Array.from(map[cat]).sort((a, b) => a.localeCompare(b, "ru")) : ["Без подкатегории"];
      fillSelect(subSelect, subs.length ? subs : ["Без подкатегории"], "Подкатегория");
    }

    if (!catSelect.dataset.bound) {
      catSelect.dataset.bound = "1";
      catSelect.addEventListener("change", updateSub);
    }

    updateSub();

    toolbar.querySelector(".ep-db-v69-move").onclick = moveSelected;
    toolbar.querySelector(".ep-db-v69-delete").onclick = deleteSelected;

    toolbar.style.display = canMassManage() ? "grid" : "none";
  }

  function addCheckboxes() {
    const type = getActiveType();
    const store = getStore(type);
    const rows = Array.from(document.querySelectorAll("#ep-db-v68-modal .ep-db-v68-item"));

    rows.forEach((row, index) => {
      if (row.querySelector(".ep-db-v69-check")) return;

      const item = store[index];
      if (!item) return;

      const id = itemId(item, index);

      const check = document.createElement("input");
      check.type = "checkbox";
      check.className = "ep-db-v69-check";
      check.dataset.itemId = id;

      row.insertBefore(check, row.firstChild);
    });
  }

  function selectedIds() {
    return Array.from(document.querySelectorAll("#ep-db-v68-modal .ep-db-v69-check:checked"))
      .map((x) => x.dataset.itemId)
      .filter(Boolean);
  }

  function moveSelected() {
    if (!canMassManage()) {
      alert("Нет прав на массовое управление этой базой");
      return;
    }

    const toolbar = document.getElementById(TOOLBAR_ID);
    const cat = toolbar.querySelector('[data-v69="cat"]').value;
    const sub = toolbar.querySelector('[data-v69="sub"]').value || "Без подкатегории";

    if (!cat) {
      alert("Выбери категорию");
      return;
    }

    const ids = selectedIds();
    if (!ids.length) {
      alert("Сначала отметь позиции галочками");
      return;
    }

    const type = getActiveType();
    const store = getStore(type);

    store.forEach((item, index) => {
      if (ids.includes(itemId(item, index))) {
        setItemCatSub(item, cat, sub);
      }
    });

    saveMyIfNeeded();

    if (window.EP_DB_V68) {
      window.EP_DB_V68.renderCategories(type);
    }

    setTimeout(run, 80);
  }

  function deleteSelected() {
    if (!canMassManage()) {
      alert("Нет прав на массовое управление этой базой");
      return;
    }

    const ids = selectedIds();
    if (!ids.length) {
      alert("Сначала отметь позиции галочками");
      return;
    }

    if (!confirm("Удалить выбранные позиции?")) return;

    const type = getActiveType();
    const store = getStore(type);

    for (let i = store.length - 1; i >= 0; i--) {
      if (ids.includes(itemId(store[i], i))) {
        store.splice(i, 1);
      }
    }

    saveMyIfNeeded();

    if (window.EP_DB_V68) {
      window.EP_DB_V68.renderCategories(type);
    }

    setTimeout(run, 80);
  }

  function run() {
    ensureStyle();
    ensureToolbar();
    addCheckboxes();
  }

  function boot() {
    setInterval(run, 600);

    document.addEventListener("click", function () {
      setTimeout(run, 80);
      setTimeout(run, 250);
    }, true);

    const observer = new MutationObserver(run);
    observer.observe(document.body, { childList: true, subtree: true });

    console.log("04-database-v69-mass-tools.js", VERSION, "loaded");
  }

  window.EP_DB_V69 = {
    version: VERSION,
    run,
    moveSelected,
    deleteSelected
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
