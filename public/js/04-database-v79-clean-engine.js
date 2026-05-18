/*
 * Electric PRO Refactor
 * V79 Clean Database Engine
 *
 * Новый чистый движок базы:
 * - без MutationObserver;
 * - без постоянных ререндеров;
 * - без V68/V69/V72 зависаний;
 * - один источник моей базы;
 * - очистка моей базы чистит все старые хвосты;
 * - добавление с сервера в мою базу сохраняется.
 */

(function () {
  "use strict";

  const VERSION = "V79_CLEAN_DATABASE_ENGINE";

  const STYLE_ID = "ep-db-v79-style";
  const MODAL_ID = "ep-db-v79-modal";

  const LS = {
    myMat: "ep_db_my_materials_v79",
    myWork: "ep_db_my_works_v79",
    customCats: "ep_db_custom_categories_v79",
    clearedAt: "ep_db_my_cleared_at_v79"
  };

  const OLD_MY_KEYS = [
    "ep_db_my_materials_v67",
    "ep_db_my_works_v67",
    "EP_MY_MAT",
    "EP_MY_WORK",
    "userMatDB",
    "userWorkDB",
    "ep_my_mat",
    "ep_my_work",
    "ep_user_mat",
    "ep_user_work",
    "ep_user_materials",
    "ep_user_works",
    "ep_db_my_materials",
    "ep_db_my_works",
    "ep_materials_my",
    "ep_works_my",
    "electric_pro_my_materials",
    "electric_pro_my_works"
  ];

  const PRESET = {
    "Автоматика": ["Автоматы", "УЗО", "ДИФы", "УЗДП", "УЗМ", "Реле", "Контакторы", "Другие аппараты"],
    "Кабель": ["Силовой кабель", "Слаботочный кабель", "Прочее"],
    "Расходники": ["Крепёж", "Клеммы", "Изолента", "Стяжки", "Наконечники", "Прочее"],
    "Слаботочка": ["Интернет", "ТВ", "Домофон", "Видеонаблюдение", "Прочее"],
    "Трубы": ["ПВХ", "ПНД", "Гофра", "Металлорукав", "Прочее"],
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

  let activeType = "mat";

  function arr(v) {
    return Array.isArray(v) ? v : [];
  }

  function clone(v) {
    try {
      return JSON.parse(JSON.stringify(v));
    } catch (e) {
      return v;
    }
  }

  function readJson(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      if (!raw) return fallback;
      return JSON.parse(raw) ?? fallback;
    } catch (e) {
      return fallback;
    }
  }

  function writeJson(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {}
  }

  function removeKey(key) {
    try {
      localStorage.removeItem(key);
    } catch (e) {}
  }

  function text(el) {
    return String((el && el.textContent) || "").replace(/\s+/g, " ").trim();
  }

  function low(el) {
    return text(el).toLowerCase();
  }

  function getScope() {
    try {
      if (window.EP_DB && typeof window.EP_DB.getScope === "function") {
        return window.EP_DB.getScope();
      }

      if (typeof window.epGetDbScope === "function") {
        const s = window.epGetDbScope();
        return s === "global" ? "server" : s;
      }
    } catch (e) {}

    const saved =
      localStorage.getItem("ep_active_db_scope_v67") ||
      localStorage.getItem("ep_active_db_scope_v60") ||
      localStorage.getItem("ep_db_scope") ||
      "server";

    return String(saved).includes("my") ? "my" : "server";
  }

  function setScope(scope) {
    scope = scope === "my" ? "my" : "server";

    try {
      if (window.EP_DB && typeof window.EP_DB.setScope === "function") {
        window.EP_DB.setScope(scope);
      }
    } catch (e) {}

    localStorage.setItem("ep_active_db_scope_v67", scope);
    localStorage.setItem("ep_active_db_scope_v60", scope === "my" ? "my" : "global");
    localStorage.setItem("ep_db_scope", scope === "my" ? "my" : "global");

    applyLegacy();

    updateTopline();
  }

  function serverMat() {
    return arr(window.EP_GLOBAL_MAT && window.EP_GLOBAL_MAT.length ? window.EP_GLOBAL_MAT : window.matDB);
  }

  function serverWork() {
    return arr(window.EP_GLOBAL_WORK && window.EP_GLOBAL_WORK.length ? window.EP_GLOBAL_WORK : window.workDB);
  }

  function loadMyMat() {
    return arr(readJson(LS.myMat, []));
  }

  function loadMyWork() {
    return arr(readJson(LS.myWork, []));
  }

  function saveMy(mat, work) {
    window.EP_MY_MAT = arr(mat);
    window.EP_MY_WORK = arr(work);

    window.userMatDB = window.EP_MY_MAT;
    window.userWorkDB = window.EP_MY_WORK;

    writeJson(LS.myMat, window.EP_MY_MAT);
    writeJson(LS.myWork, window.EP_MY_WORK);

    // Дублируем в V67, чтобы старые каталоги тоже видели новую мою базу.
    writeJson("ep_db_my_materials_v67", window.EP_MY_MAT);
    writeJson("ep_db_my_works_v67", window.EP_MY_WORK);

    if (getScope() === "my") {
      window.matDB = window.EP_MY_MAT;
      window.workDB = window.EP_MY_WORK;
    }
  }

  function applyLegacy() {
    window.EP_GLOBAL_MAT = serverMat();
    window.EP_GLOBAL_WORK = serverWork();

    window.EP_MY_MAT = loadMyMat();
    window.EP_MY_WORK = loadMyWork();

    window.userMatDB = window.EP_MY_MAT;
    window.userWorkDB = window.EP_MY_WORK;

    if (getScope() === "my") {
      window.matDB = window.EP_MY_MAT;
      window.workDB = window.EP_MY_WORK;
    } else {
      window.matDB = window.EP_GLOBAL_MAT;
      window.workDB = window.EP_GLOBAL_WORK;
    }
  }

  function itemName(item) {
    return String(
      item?.name ||
      item?.title ||
      item?.label ||
      item?.Наименование ||
      item?.["Наименование"] ||
      "Без названия"
    ).trim();
  }

  function itemPrice(item) {
    return item?.price ?? item?.cost ?? item?.amount ?? item?.["Цена"] ?? item?.["цена"] ?? "";
  }

  function itemUnit(item) {
    return item?.unit || item?.measure || item?.uom || item?.["Ед"] || item?.["ед"] || item?.["Ед."] || "шт";
  }

  function itemCat(item) {
    return String(item?.category || item?.cat || item?.group || item?.section || item?.type || "Другое").trim() || "Другое";
  }

  function itemSub(item) {
    return String(item?.subcategory || item?.subcat || item?.sub || item?.kind || item?.folder || "Без подкатегории").trim() || "Без подкатегории";
  }

  function ensureId(item, type) {
    if (!item.id) {
      const safe = itemName(item).toLowerCase().replace(/[^a-zа-я0-9]+/gi, "_").slice(0, 40);
      item.id = "v79_" + type + "_" + safe + "_" + Math.random().toString(16).slice(2);
    }

    return String(item.id);
  }

  function signature(item) {
    return [
      itemName(item).toLowerCase(),
      String(itemPrice(item)).trim(),
      String(itemUnit(item)).toLowerCase().trim()
    ].join("|");
  }

  function normalizeItem(item, type) {
    const x = clone(item || {});

    x.name = itemName(x);
    x.price = Number(String(itemPrice(x)).replace(",", ".") || 0);
    x.unit = itemUnit(x);
    x.category = itemCat(x);
    x.subcategory = itemSub(x);
    x.dbType = type;
    x.updatedAt = Date.now();

    ensureId(x, type);

    return x;
  }

  function getActiveStore(type) {
    applyLegacy();

    type = type === "work" ? "work" : "mat";

    if (getScope() === "my") {
      return type === "work" ? window.EP_MY_WORK : window.EP_MY_MAT;
    }

    return type === "work" ? window.EP_GLOBAL_WORK : window.EP_GLOBAL_MAT;
  }

  function groupByCat(items) {
    const map = new Map();

    arr(items).forEach((item) => {
      const cat = itemCat(item);
      const sub = itemSub(item);

      if (!map.has(cat)) map.set(cat, new Map());
      if (!map.get(cat).has(sub)) map.get(cat).set(sub, []);

      map.get(cat).get(sub).push(item);
    });

    return map;
  }

  function customMap() {
    const saved = readJson(LS.customCats, readJson("ep_db_custom_categories_v72", {}));
    const map = {};

    Object.keys(PRESET).forEach((cat) => {
      map[cat] = new Set(PRESET[cat]);
    });

    Object.keys(saved || {}).forEach((cat) => {
      if (!map[cat]) map[cat] = new Set();
      arr(saved[cat]).forEach((sub) => {
        if (sub) map[cat].add(String(sub));
      });
    });

    [serverMat(), serverWork(), loadMyMat(), loadMyWork()].forEach((list) => {
      arr(list).forEach((item) => {
        const cat = itemCat(item);
        const sub = itemSub(item);

        if (!map[cat]) map[cat] = new Set();
        if (sub) map[cat].add(sub);
      });
    });

    return map;
  }

  function saveCustomMap(map) {
    const plain = {};

    Object.keys(map).forEach((cat) => {
      plain[cat] = Array.from(map[cat]).filter(Boolean);
    });

    writeJson(LS.customCats, plain);
    writeJson("ep_db_custom_categories_v72", plain);
  }

  function addCustomCategory(cat) {
    cat = String(cat || "").trim();
    if (!cat) return false;

    const map = customMap();

    if (!map[cat]) map[cat] = new Set(["Без подкатегории"]);

    saveCustomMap(map);

    return true;
  }

  function addCustomSubcategory(cat, sub) {
    cat = String(cat || "").trim();
    sub = String(sub || "").trim();

    if (!cat || !sub) return false;

    const map = customMap();

    if (!map[cat]) map[cat] = new Set();
    map[cat].add(sub);

    saveCustomMap(map);

    return true;
  }

  function ensureStyle() {
    if (document.getElementById(STYLE_ID)) return;

    const style = document.createElement("style");
    style.id = STYLE_ID;
    style.textContent = `
      #${MODAL_ID} {
        position: fixed;
        inset: 0;
        z-index: 2147483646;
        background: rgba(17,24,39,.66);
        display: none;
        align-items: center;
        justify-content: center;
        padding: 12px;
      }

      #${MODAL_ID}.show {
        display: flex;
      }

      .ep-v79-card {
        width: min(760px, 100%);
        height: min(88dvh, 900px);
        background: #fff;
        border-radius: 22px;
        overflow: hidden;
        display: flex;
        flex-direction: column;
        box-shadow: 0 20px 70px rgba(0,0,0,.36);
      }

      .ep-v79-head {
        background: #111827;
        color: #fff;
        padding: 12px 14px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 8px;
      }

      .ep-v79-title {
        font-weight: 900;
        font-size: 16px;
      }

      .ep-v79-sub {
        opacity: .75;
        font-size: 12px;
        margin-top: 2px;
      }

      .ep-v79-close {
        border: 0;
        border-radius: 12px;
        padding: 9px 11px;
        background: #ef4444;
        color: #fff;
        font-weight: 900;
      }

      .ep-v79-tabs {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 8px;
        padding: 10px;
        background: #f3f4f6;
      }

      .ep-v79-tabs button {
        border: 0;
        border-radius: 14px;
        padding: 11px;
        background: #fff;
        color: #4f46e5;
        font-weight: 900;
      }

      .ep-v79-tabs button.active {
        background: #4f46e5;
        color: #fff;
      }

      .ep-v79-tools {
        padding: 10px;
        background: #ecfdf5;
        border-bottom: 1px solid rgba(17,24,39,.08);
        display: grid;
        gap: 8px;
      }

      .ep-v79-row {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 8px;
      }

      .ep-v79-tools select,
      .ep-v79-tools button {
        border: 0;
        border-radius: 12px;
        padding: 10px;
        font-weight: 900;
        font-size: 12px;
      }

      .ep-v79-tools select {
        background: #fff;
        border: 1px solid #d1d5db;
      }

      .ep-v79-blue { background: #2563eb; color: #fff; }
      .ep-v79-green { background: #059669; color: #fff; }
      .ep-v79-red { background: #dc2626; color: #fff; }
      .ep-v79-dark { background: #111827; color: #fff; }

      .ep-v79-body {
        flex: 1;
        overflow: auto;
        padding: 12px;
        background: #f9fafb;
      }

      .ep-v79-info {
        padding: 10px 12px;
        margin-bottom: 10px;
        border-radius: 14px;
        background: #fff;
        color: #111827;
        font-weight: 900;
        font-size: 13px;
      }

      .ep-v79-cat {
        margin-bottom: 10px;
        border-radius: 17px;
        overflow: hidden;
        background: #fff;
        border: 1px solid rgba(17,24,39,.08);
      }

      .ep-v79-cat-head {
        width: 100%;
        border: 0;
        background: #eef2ff;
        color: #3730a3;
        padding: 13px;
        font-weight: 900;
        display: flex;
        justify-content: space-between;
        align-items: center;
      }

      .ep-v79-sub-block {
        padding: 10px 12px;
        border-top: 1px solid rgba(17,24,39,.08);
      }

      .ep-v79-sub-title {
        font-weight: 900;
        color: #111827;
        margin: 4px 0 8px;
      }

      .ep-v79-item {
        display: grid;
        grid-template-columns: 26px 1fr 88px 72px;
        gap: 7px;
        align-items: center;
        padding: 9px 0;
        border-top: 1px solid rgba(17,24,39,.06);
      }

      .ep-v79-check {
        width: 18px;
        height: 18px;
      }

      .ep-v79-name {
        font-weight: 850;
        font-size: 13px;
        color: #1f2937;
      }

      .ep-v79-meta {
        font-size: 11px;
        color: #6b7280;
        margin-top: 2px;
      }

      .ep-v79-price,
      .ep-v79-unit {
        width: 100%;
        border: 1px solid #d1d5db;
        border-radius: 11px;
        padding: 8px 7px;
        font-size: 12px;
        font-weight: 850;
        background: #fff;
      }

      .ep-v79-price:disabled,
      .ep-v79-unit:disabled {
        opacity: .62;
        background: #f3f4f6;
      }
    `;

    document.head.appendChild(style);
  }

  function ensureModal() {
    ensureStyle();

    let modal = document.getElementById(MODAL_ID);

    if (!modal) {
      modal = document.createElement("div");
      modal.id = MODAL_ID;
      modal.innerHTML = `
        <div class="ep-v79-card">
          <div class="ep-v79-head">
            <div>
              <div class="ep-v79-title">✅ Новая база V79</div>
              <div class="ep-v79-sub">Один источник. Без зависаний.</div>
            </div>
            <button type="button" class="ep-v79-close">Закрыть</button>
          </div>

          <div class="ep-v79-tabs">
            <button type="button" data-type="mat" class="active">Материалы</button>
            <button type="button" data-type="work">Работы</button>
          </div>

          <div class="ep-v79-tools">
            <div class="ep-v79-row">
              <select data-v79="cat"></select>
              <select data-v79="sub"></select>
            </div>

            <div class="ep-v79-row">
              <button type="button" class="ep-v79-blue" data-v79="copy">+ Добавить выбранные в мою базу</button>
              <button type="button" class="ep-v79-green" data-v79="move">Переместить выбранные</button>
            </div>

            <div class="ep-v79-row">
              <button type="button" class="ep-v79-dark" data-v79="cat-create">+ Категория</button>
              <button type="button" class="ep-v79-dark" data-v79="sub-create">+ Подкатегория</button>
            </div>

            <div class="ep-v79-row">
              <button type="button" class="ep-v79-red" data-v79="delete">Удалить выбранные</button>
              <button type="button" class="ep-v79-red" data-v79="clear">Очистить мою базу</button>
            </div>
          </div>

          <div class="ep-v79-body"></div>
        </div>
      `;

      modal.querySelector(".ep-v79-close").addEventListener("click", close);

      modal.querySelectorAll(".ep-v79-tabs button").forEach((btn) => {
        btn.addEventListener("click", () => {
          modal.querySelectorAll(".ep-v79-tabs button").forEach((x) => x.classList.remove("active"));
          btn.classList.add("active");
          activeType = btn.dataset.type === "work" ? "work" : "mat";
          render();
        });
      });

      modal.querySelector('[data-v79="copy"]').addEventListener("click", copySelectedToMy);
      modal.querySelector('[data-v79="move"]').addEventListener("click", moveSelected);
      modal.querySelector('[data-v79="delete"]').addEventListener("click", deleteSelected);
      modal.querySelector('[data-v79="clear"]').addEventListener("click", clearMyDatabase);
      modal.querySelector('[data-v79="cat-create"]').addEventListener("click", createCategoryFromModal);
      modal.querySelector('[data-v79="sub-create"]').addEventListener("click", createSubcategoryFromModal);

      modal.querySelector('[data-v79="cat"]').addEventListener("change", fillSubSelect);

      document.body.appendChild(modal);
    }

    return modal;
  }

  function open() {
    applyLegacy();

    const modal = ensureModal();
    modal.classList.add("show");

    fillCategorySelects();
    render();
  }

  function close() {
    const modal = document.getElementById(MODAL_ID);
    if (modal) modal.classList.remove("show");
  }

  function selectedIds() {
    return Array.from(document.querySelectorAll("#" + MODAL_ID + " .ep-v79-check:checked"))
      .map((x) => x.dataset.id)
      .filter(Boolean);
  }

  function fillCategorySelects() {
    const modal = ensureModal();
    const cat = modal.querySelector('[data-v79="cat"]');
    const map = customMap();
    const cats = Object.keys(map).sort((a, b) => a.localeCompare(b, "ru"));

    const old = cat.value;

    cat.innerHTML = '<option value="">Категория</option>';

    cats.forEach((name) => {
      const opt = document.createElement("option");
      opt.value = name;
      opt.textContent = name;
      cat.appendChild(opt);
    });

    if (old && cats.includes(old)) cat.value = old;

    fillSubSelect();
  }

  function fillSubSelect() {
    const modal = ensureModal();
    const cat = modal.querySelector('[data-v79="cat"]').value;
    const sub = modal.querySelector('[data-v79="sub"]');
    const map = customMap();

    let subs = cat && map[cat] ? Array.from(map[cat]) : ["Без подкатегории"];

    subs = subs.filter(Boolean).sort((a, b) => a.localeCompare(b, "ru"));

    if (!subs.length) subs = ["Без подкатегории"];

    const old = sub.value;

    sub.innerHTML = '<option value="">Подкатегория</option>';

    subs.forEach((name) => {
      const opt = document.createElement("option");
      opt.value = name;
      opt.textContent = name;
      sub.appendChild(opt);
    });

    if (old && subs.includes(old)) sub.value = old;
  }

  function render() {
    const modal = ensureModal();
    const body = modal.querySelector(".ep-v79-body");
    const scope = getScope();
    const items = getActiveStore(activeType);
    const grouped = groupByCat(items);

    body.innerHTML = "";

    const info = document.createElement("div");
    info.className = "ep-v79-info";
    info.textContent =
      `${scope === "my" ? "Моя база" : "База сервера"} · ${activeType === "work" ? "Работы" : "Материалы"} · позиций: ${items.length}`;
    body.appendChild(info);

    Array.from(grouped.keys()).sort((a, b) => a.localeCompare(b, "ru")).forEach((catName) => {
      const subMap = grouped.get(catName);
      const count = Array.from(subMap.values()).reduce((sum, list) => sum + list.length, 0);

      const catBox = document.createElement("div");
      catBox.className = "ep-v79-cat";

      const head = document.createElement("button");
      head.type = "button";
      head.className = "ep-v79-cat-head";
      head.innerHTML = `<span>${escapeHtml(catName)}</span><span>${count}</span>`;

      const content = document.createElement("div");
      content.hidden = true;

      head.addEventListener("click", () => {
        if (content.hidden) {
          content.hidden = false;

          if (!content.dataset.rendered) {
            renderCatContent(content, subMap);
            content.dataset.rendered = "1";
          }
        } else {
          content.hidden = true;
        }
      });

      catBox.appendChild(head);
      catBox.appendChild(content);
      body.appendChild(catBox);
    });

    updateToolVisibility();
  }

  function renderCatContent(content, subMap) {
    content.innerHTML = "";

    Array.from(subMap.keys()).sort((a, b) => a.localeCompare(b, "ru")).forEach((subName) => {
      const wrap = document.createElement("div");
      wrap.className = "ep-v79-sub-block";

      const title = document.createElement("div");
      title.className = "ep-v79-sub-title";
      title.textContent = subName;

      wrap.appendChild(title);

      subMap.get(subName).forEach((item) => {
        wrap.appendChild(renderItem(item));
      });

      content.appendChild(wrap);
    });
  }

  function renderItem(item) {
    const type = activeType;
    const id = ensureId(item, type);
    const scope = getScope();

    const row = document.createElement("div");
    row.className = "ep-v79-item";

    const check = document.createElement("input");
    check.type = "checkbox";
    check.className = "ep-v79-check";
    check.dataset.id = id;

    const name = document.createElement("div");
    name.innerHTML = `
      <div class="ep-v79-name">${escapeHtml(itemName(item))}</div>
      <div class="ep-v79-meta">${escapeHtml(itemCat(item))} · ${escapeHtml(itemSub(item))}</div>
    `;

    const price = document.createElement("input");
    price.className = "ep-v79-price";
    price.type = "number";
    price.value = itemPrice(item);
    price.disabled = scope !== "my";

    const unit = document.createElement("select");
    unit.className = "ep-v79-unit";

    ["ед", "м.п", "м", "упк", "шт"].forEach((u) => {
      const opt = document.createElement("option");
      opt.value = u;
      opt.textContent = u;
      unit.appendChild(opt);
    });

    unit.value = itemUnit(item);
    unit.disabled = scope !== "my";

    function saveRow() {
      if (getScope() !== "my") return;

      item.price = Number(String(price.value || 0).replace(",", "."));
      item.unit = unit.value;
      item.updatedAt = Date.now();

      if (activeType === "work") {
        saveMy(loadMyMat(), window.EP_MY_WORK);
      } else {
        saveMy(window.EP_MY_MAT, loadMyWork());
      }
    }

    price.addEventListener("change", saveRow);
    unit.addEventListener("change", saveRow);

    row.appendChild(check);
    row.appendChild(name);
    row.appendChild(price);
    row.appendChild(unit);

    return row;
  }

  function updateToolVisibility() {
    const modal = ensureModal();
    const scope = getScope();

    const copy = modal.querySelector('[data-v79="copy"]');
    const move = modal.querySelector('[data-v79="move"]');
    const del = modal.querySelector('[data-v79="delete"]');
    const clear = modal.querySelector('[data-v79="clear"]');

    copy.style.display = scope === "server" ? "" : "none";
    move.style.display = scope === "my" ? "" : "none";
    del.style.display = scope === "my" ? "" : "none";
    clear.style.display = scope === "my" ? "" : "none";
  }

  function copySelectedToMy() {
    const ids = selectedIds();

    if (!ids.length) {
      alert("Сначала выбери позиции галочками");
      return;
    }

    const source = getActiveStore(activeType);
    const myMat = loadMyMat();
    const myWork = loadMyWork();
    const target = activeType === "work" ? myWork : myMat;

    const existing = new Set(target.map(signature));

    let added = 0;

    source.forEach((item) => {
      if (!ids.includes(String(item.id))) return;

      const copy = normalizeItem(item, activeType);
      const sig = signature(copy);

      if (existing.has(sig)) return;

      target.push(copy);
      existing.add(sig);
      added++;
    });

    saveMy(myMat, myWork);
    setScope("my");

    alert("Добавлено в мою базу: " + added);

    fillCategorySelects();
    render();
  }

  function moveSelected() {
    if (getScope() !== "my") {
      alert("Перемещение доступно только в моей базе");
      return;
    }

    const ids = selectedIds();

    if (!ids.length) {
      alert("Сначала выбери позиции галочками");
      return;
    }

    const modal = ensureModal();
    const cat = modal.querySelector('[data-v79="cat"]').value;
    const sub = modal.querySelector('[data-v79="sub"]').value || "Без подкатегории";

    if (!cat) {
      alert("Выбери категорию");
      return;
    }

    const store = getActiveStore(activeType);

    let moved = 0;

    store.forEach((item) => {
      if (!ids.includes(String(item.id))) return;

      item.category = cat;
      item.subcategory = sub;
      item.cat = cat;
      item.subcat = sub;
      item.group = cat;
      item.section = cat;
      item.updatedAt = Date.now();

      moved++;
    });

    if (activeType === "work") {
      saveMy(loadMyMat(), store);
    } else {
      saveMy(store, loadMyWork());
    }

    alert("Перемещено: " + moved);

    fillCategorySelects();
    render();
  }

  function deleteSelected() {
    if (getScope() !== "my") {
      alert("Удаление доступно только в моей базе");
      return;
    }

    const ids = selectedIds();

    if (!ids.length) {
      alert("Сначала выбери позиции галочками");
      return;
    }

    if (!confirm("Удалить выбранные позиции?")) return;

    const store = getActiveStore(activeType);
    const next = store.filter((item) => !ids.includes(String(item.id)));

    if (activeType === "work") {
      saveMy(loadMyMat(), next);
    } else {
      saveMy(next, loadMyWork());
    }

    alert("Удалено: " + (store.length - next.length));

    render();
  }

  function clearMyDatabase() {
    if (!confirm("Очистить мою базу полностью? Материалы и работы будут удалены.")) return;

    window.EP_MY_MAT = [];
    window.EP_MY_WORK = [];
    window.userMatDB = [];
    window.userWorkDB = [];

    writeJson(LS.myMat, []);
    writeJson(LS.myWork, []);
    writeJson(LS.clearedAt, Date.now());

    OLD_MY_KEYS.forEach((key) => {
      writeJson(key, []);
    });

    // Удаляем все подозрительные старые ключи моей базы, чтобы они не воскресили данные.
    try {
      const keys = [];
      for (let i = 0; i < localStorage.length; i++) {
        keys.push(localStorage.key(i));
      }

      keys.forEach((key) => {
        const k = String(key || "").toLowerCase();
        const isMy = k.includes("my") || k.includes("user") || k.includes("лич") || k.includes("моя");
        const isDb = k.includes("db") || k.includes("mat") || k.includes("work") || k.includes("material") || k.includes("работ");
        const keep = k.includes("scope") || k.includes("custom_categories");

        if (isMy && isDb && !keep) {
          removeKey(key);
        }
      });
    } catch (e) {}

    saveMy([], []);

    setScope("my");

    alert("Моя база очищена");

    render();
  }

  function createCategoryFromModal() {
    const name = prompt("Название новой категории:");
    if (!name) return;

    addCustomCategory(name);

    fillCategorySelects();

    alert("Категория создана: " + name);
  }

  function createSubcategoryFromModal() {
    const modal = ensureModal();
    const currentCat = modal.querySelector('[data-v79="cat"]').value || "";

    const cat = prompt("К какой категории добавить подкатегорию?", currentCat);
    if (!cat) return;

    const sub = prompt("Название новой подкатегории:");
    if (!sub) return;

    addCustomSubcategory(cat, sub);

    fillCategorySelects();

    alert("Подкатегория создана: " + cat + " / " + sub);
  }

  function updateTopline() {
    const old = document.querySelector("#ep-v78-topline .ep-v78-pill");
    if (old) {
      old.textContent = `Electric PRO · V79 · База: ${getScope() === "my" ? "Моя" : "Сервера"}`;
    }
  }

  function patchOldAddToMyButton() {
    document.addEventListener("click", function (e) {
      const btn = e.target && e.target.closest ? e.target.closest("button") : null;
      if (!btn) return;

      const t = low(btn);

      if (t.includes("добавить") && t.includes("мою баз")) {
        // Старую кнопку не используем. Открываем чистую базу, где добавление сохраняется.
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();

        alert("Добавление теперь через чистую базу V79. Открою её.");
        open();
      }
    }, true);
  }

  function patchCompatibility() {
    window.EP_DB_V79 = {
      version: VERSION,
      open,
      close,
      render,
      applyLegacy,
      clearMyDatabase,
      addCustomCategory,
      addCustomSubcategory,
      getActiveStore,
      saveMy
    };

    // Совместимость со старой панелью V78.
    window.EP_DB_V68 = window.EP_DB_V68 || {};
    window.EP_DB_V68.open = open;
    window.EP_DB_V68.renderCategories = render;

    window.EP_DB_V72 = window.EP_DB_V72 || {};
    window.EP_DB_V72.addCustomCategory = addCustomCategory;
    window.EP_DB_V72.addCustomSubcategory = addCustomSubcategory;
    window.EP_DB_V72.refreshV68 = render;
    window.EP_DB_V72.persistMyDb = function () {
      saveMy(loadMyMat(), loadMyWork());
    };
    window.EP_DB_V72.syncMyDb = function () {
      applyLegacy();
      return {
        mat: loadMyMat().length,
        work: loadMyWork().length
      };
    };

    if (window.EP_DB && typeof window.EP_DB.getActiveStore === "function" && !window.EP_DB.__v79Patched) {
      const oldGet = window.EP_DB.getActiveStore.bind(window.EP_DB);
      const oldSetScope = window.EP_DB.setScope ? window.EP_DB.setScope.bind(window.EP_DB) : null;

      window.EP_DB.getActiveStore = function (type) {
        const scope = getScope();

        if (scope === "my") {
          return type === "work" ? loadMyWork() : loadMyMat();
        }

        return oldGet(type);
      };

      window.EP_DB.setScope = function (scope) {
        if (oldSetScope) {
          try {
            oldSetScope(scope);
          } catch (e) {}
        }

        setScope(scope);

        return scope;
      };

      window.EP_DB.__v79Patched = true;
    }
  }

  function escapeHtml(v) {
    return String(v ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function boot() {
    ensureStyle();
    applyLegacy();
    patchCompatibility();
    patchOldAddToMyButton();
    updateTopline();

    console.log("04-database-v79-clean-engine.js", VERSION, "loaded", {
      myMat: loadMyMat().length,
      myWork: loadMyWork().length,
      scope: getScope()
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
