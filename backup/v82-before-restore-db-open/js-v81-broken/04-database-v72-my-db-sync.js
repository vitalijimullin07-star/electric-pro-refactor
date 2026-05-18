/*
 * Electric PRO Refactor
 * V72 My DB Sync
 *
 * Исправляет рассинхрон:
 * - старая кнопка "+ Добавить выбранные в мою базу"
 * - EP_MY_MAT / EP_MY_WORK
 * - userMatDB / userWorkDB
 * - matDB / workDB
 * - localStorage V67
 *
 * Плюс:
 * - свои категории
 * - свои подкатегории
 */

(function () {
  "use strict";

  const VERSION = "V72_MY_DB_SYNC";

  const STYLE_ID = "ep-db-v72-style";

  const LS = {
    myMat: "ep_db_my_materials_v67",
    myWork: "ep_db_my_works_v67",
    customCats: "ep_db_custom_categories_v72"
  };

  const EXTRA_MY_MAT_KEYS = [
    "EP_MY_MAT",
    "userMatDB",
    "ep_my_mat",
    "ep_user_mat",
    "ep_user_materials",
    "ep_db_my_materials",
    "ep_materials_my",
    "electric_pro_my_materials"
  ];

  const EXTRA_MY_WORK_KEYS = [
    "EP_MY_WORK",
    "userWorkDB",
    "ep_my_work",
    "ep_user_work",
    "ep_user_works",
    "ep_db_my_works",
    "ep_works_my",
    "electric_pro_my_works"
  ];

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
      const parsed = JSON.parse(raw);
      return parsed ?? fallback;
    } catch (e) {
      return fallback;
    }
  }

  function writeJson(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {}
  }

  function normalizeName(item) {
    return String(
      item?.name ||
      item?.title ||
      item?.label ||
      item?.Наименование ||
      item?.["Наименование"] ||
      ""
    ).trim().toLowerCase();
  }

  function normalizePrice(item) {
    return String(item?.price ?? item?.cost ?? item?.amount ?? item?.["Цена"] ?? "");
  }

  function makeId(item, type) {
    const name = normalizeName(item);
    const price = normalizePrice(item);
    const unit = String(item?.unit || item?.measure || item?.uom || "");
    return `${type}|${name}|${price}|${unit}`;
  }

  function mergeItems(type, lists) {
    const map = new Map();

    lists.forEach((list) => {
      arr(list).forEach((raw) => {
        if (!raw || typeof raw !== "object") return;

        const item = raw;

        const name = normalizeName(item);
        if (!name) return;

        if (!item.id) {
          item.id = "ep_" + type + "_" + Date.now() + "_" + Math.random().toString(16).slice(2);
        }

        const key = String(item.id || makeId(item, type));

        if (!map.has(key)) {
          map.set(key, item);
        } else {
          Object.assign(map.get(key), item);
        }
      });
    });

    return Array.from(map.values());
  }

  function discoverStorageArrays(type) {
    const keys = type === "work" ? EXTRA_MY_WORK_KEYS : EXTRA_MY_MAT_KEYS;
    const found = [];

    keys.forEach((key) => {
      const value = readJson(key, null);
      if (Array.isArray(value)) found.push(value);
    });

    // Аккуратный поиск по localStorage: только ключи, явно похожие на мою базу.
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        const low = String(key || "").toLowerCase();

        const isMy = low.includes("my") || low.includes("user") || low.includes("лич") || low.includes("моя");
        const isMat = low.includes("mat") || low.includes("material") || low.includes("мат");
        const isWork = low.includes("work") || low.includes("работ");

        if (!isMy) continue;

        if (type === "mat" && !isMat) continue;
        if (type === "work" && !isWork) continue;

        const value = readJson(key, null);

        if (Array.isArray(value)) found.push(value);
      }
    } catch (e) {}

    return found;
  }

  function getMyMatSources() {
    return [
      window.EP_MY_MAT,
      window.userMatDB,
      readJson(LS.myMat, []),
      ...discoverStorageArrays("mat")
    ];
  }

  function getMyWorkSources() {
    return [
      window.EP_MY_WORK,
      window.userWorkDB,
      readJson(LS.myWork, []),
      ...discoverStorageArrays("work")
    ];
  }

  function persistMyDb() {
    window.EP_MY_MAT = arr(window.EP_MY_MAT);
    window.EP_MY_WORK = arr(window.EP_MY_WORK);

    window.userMatDB = window.EP_MY_MAT;
    window.userWorkDB = window.EP_MY_WORK;

    writeJson(LS.myMat, window.EP_MY_MAT);
    writeJson(LS.myWork, window.EP_MY_WORK);

    EXTRA_MY_MAT_KEYS.forEach((key) => writeJson(key, window.EP_MY_MAT));
    EXTRA_MY_WORK_KEYS.forEach((key) => writeJson(key, window.EP_MY_WORK));

    if (getScope() === "my") {
      window.matDB = window.EP_MY_MAT;
      window.workDB = window.EP_MY_WORK;
    }
  }

  function syncMyDb() {
    const myMat = mergeItems("mat", getMyMatSources());
    const myWork = mergeItems("work", getMyWorkSources());

    if (myMat.length || !Array.isArray(window.EP_MY_MAT)) {
      window.EP_MY_MAT = myMat;
      window.userMatDB = window.EP_MY_MAT;
    }

    if (myWork.length || !Array.isArray(window.EP_MY_WORK)) {
      window.EP_MY_WORK = myWork;
      window.userWorkDB = window.EP_MY_WORK;
    }

    persistMyDb();

    if (window.EP_DB && typeof window.EP_DB.applyActiveStoreToLegacy === "function") {
      try {
        window.EP_DB.applyActiveStoreToLegacy();
      } catch (e) {}
    }

    updateCounters();

    return {
      mat: arr(window.EP_MY_MAT).length,
      work: arr(window.EP_MY_WORK).length
    };
  }

  function getScope() {
    if (window.EP_DB && typeof window.EP_DB.getScope === "function") {
      return window.EP_DB.getScope();
    }

    if (typeof window.epGetDbScope === "function") {
      const s = window.epGetDbScope();
      return s === "global" ? "server" : s;
    }

    return String(localStorage.getItem("ep_active_db_scope_v67") || "server");
  }

  function setScope(scope) {
    if (window.EP_DB && typeof window.EP_DB.setScope === "function") {
      window.EP_DB.setScope(scope);
    }

    localStorage.setItem("ep_active_db_scope_v67", scope);
    localStorage.setItem("ep_active_db_scope_v60", scope === "my" ? "my" : "global");
    localStorage.setItem("ep_db_scope", scope === "my" ? "my" : "global");

    if (scope === "my") {
      window.matDB = window.EP_MY_MAT;
      window.workDB = window.EP_MY_WORK;
    }
  }

  function updateCounters() {
    const mat = arr(window.EP_MY_MAT).length;
    const work = arr(window.EP_MY_WORK).length;

    window.EP_MY_DB_COUNT_V72 = {
      mat,
      work,
      total: mat + work
    };
  }

  function text(el) {
    return String((el && el.textContent) || "").replace(/\s+/g, " ").trim();
  }

  function lower(el) {
    return text(el).toLowerCase();
  }

  function ensureStyle() {
    if (document.getElementById(STYLE_ID)) return;

    const style = document.createElement("style");
    style.id = STYLE_ID;
    style.textContent = `
      .ep-db-v72-panel {
        margin: 10px 0 12px;
        padding: 10px;
        border-radius: 16px;
        background: #ecfdf5;
        border: 1px solid rgba(16,185,129,.25);
        display: grid;
        gap: 8px;
      }

      .ep-db-v72-panel button {
        border: 0;
        border-radius: 12px;
        padding: 11px 10px;
        font-weight: 900;
        background: #059669;
        color: #fff;
      }

      .ep-db-v72-panel .secondary {
        background: #2563eb;
      }

      .ep-db-v72-note {
        font-size: 12px;
        font-weight: 800;
        color: #065f46;
      }

      .ep-db-v72-row {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 8px;
      }
    `;

    document.head.appendChild(style);
  }

  function loadCustomCategories() {
    const saved = readJson(LS.customCats, {});
    const result = {};

    Object.keys(PRESET).forEach((cat) => {
      result[cat] = new Set(PRESET[cat]);
    });

    Object.keys(saved || {}).forEach((cat) => {
      if (!result[cat]) result[cat] = new Set();

      arr(saved[cat]).forEach((sub) => {
        if (sub) result[cat].add(String(sub));
      });
    });

    return result;
  }

  function saveCustomCategories(map) {
    const plain = {};

    Object.keys(map).forEach((cat) => {
      plain[cat] = Array.from(map[cat]).filter(Boolean);
    });

    writeJson(LS.customCats, plain);
  }

  function addCustomCategory(cat) {
    cat = String(cat || "").trim();

    if (!cat) return false;

    const map = loadCustomCategories();

    if (!map[cat]) {
      map[cat] = new Set(["Без подкатегории"]);
    }

    saveCustomCategories(map);
    return true;
  }

  function addCustomSubcategory(cat, sub) {
    cat = String(cat || "").trim();
    sub = String(sub || "").trim();

    if (!cat || !sub) return false;

    const map = loadCustomCategories();

    if (!map[cat]) {
      map[cat] = new Set();
    }

    map[cat].add(sub);

    saveCustomCategories(map);
    return true;
  }

  function buildCategoryMapWithCustom() {
    const map = loadCustomCategories();

    [window.EP_MY_MAT, window.EP_MY_WORK, window.EP_GLOBAL_MAT, window.EP_GLOBAL_WORK, window.matDB, window.workDB].forEach((list) => {
      arr(list).forEach((item) => {
        const cat = String(item.category || item.cat || item.group || item.section || item.type || "").trim();
        const sub = String(item.subcategory || item.subcat || item.sub || item.kind || item.folder || "").trim();

        if (!cat) return;

        if (!map[cat]) map[cat] = new Set();
        if (sub) map[cat].add(sub);
      });
    });

    return map;
  }

  function patchV69Toolbar() {
    const toolbar = document.getElementById("ep-db-v69-toolbar");
    if (!toolbar || toolbar.dataset.v72Patched) return;

    toolbar.dataset.v72Patched = "1";

    const panel = document.createElement("div");
    panel.className = "ep-db-v72-panel";
    panel.innerHTML = `
      <div class="ep-db-v72-note">Свои категории V72</div>
      <div class="ep-db-v72-row">
        <button type="button" data-v72="add-cat">+ Создать категорию</button>
        <button type="button" class="secondary" data-v72="add-sub">+ Создать подкатегорию</button>
      </div>
    `;

    toolbar.appendChild(panel);

    panel.querySelector('[data-v72="add-cat"]').addEventListener("click", function () {
      const cat = prompt("Название новой категории:");

      if (!cat) return;

      if (addCustomCategory(cat)) {
        alert("Категория создана: " + cat);
        refreshV68();
      }
    });

    panel.querySelector('[data-v72="add-sub"]').addEventListener("click", function () {
      const catSelect = toolbar.querySelector('[data-v69="cat"]');
      const currentCat = catSelect && catSelect.value ? catSelect.value : "";

      const cat = prompt("К какой категории добавить подкатегорию?", currentCat);

      if (!cat) return;

      const sub = prompt("Название новой подкатегории:");

      if (!sub) return;

      if (addCustomSubcategory(cat, sub)) {
        alert("Подкатегория создана: " + cat + " / " + sub);
        refreshV68();
      }
    });

    refillV69Selects();
  }

  function refillV69Selects() {
    const toolbar = document.getElementById("ep-db-v69-toolbar");
    if (!toolbar) return;

    const catSelect = toolbar.querySelector('[data-v69="cat"]');
    const subSelect = toolbar.querySelector('[data-v69="sub"]');

    if (!catSelect || !subSelect) return;

    const map = buildCategoryMapWithCustom();
    const cats = Object.keys(map).sort((a, b) => a.localeCompare(b, "ru"));
    const oldCat = catSelect.value;

    catSelect.innerHTML = '<option value="">Категория</option>';

    cats.forEach((cat) => {
      const opt = document.createElement("option");
      opt.value = cat;
      opt.textContent = cat;
      catSelect.appendChild(opt);
    });

    if (oldCat && cats.includes(oldCat)) catSelect.value = oldCat;

    function updateSub() {
      const cat = catSelect.value;
      const subs = cat && map[cat] ? Array.from(map[cat]).sort((a, b) => a.localeCompare(b, "ru")) : ["Без подкатегории"];

      const oldSub = subSelect.value;

      subSelect.innerHTML = '<option value="">Подкатегория</option>';

      subs.forEach((sub) => {
        const opt = document.createElement("option");
        opt.value = sub;
        opt.textContent = sub;
        subSelect.appendChild(opt);
      });

      if (oldSub && subs.includes(oldSub)) subSelect.value = oldSub;
    }

    if (!catSelect.dataset.v72SubBound) {
      catSelect.dataset.v72SubBound = "1";
      catSelect.addEventListener("change", updateSub);
    }

    updateSub();
  }

  function refreshV68() {
    syncMyDb();

    const active = document.querySelector("#ep-db-v68-modal .ep-db-v68-tab.active");
    const type = active ? active.dataset.type : "mat";

    if (window.EP_DB_V68 && typeof window.EP_DB_V68.renderCategories === "function") {
      window.EP_DB_V68.renderCategories(type);
    }

    setTimeout(() => {
      patchV69Toolbar();
      refillV69Selects();
    }, 150);
  }

  function patchAddToMyButtons() {
    document.addEventListener("click", function (e) {
      const btn = e.target && e.target.closest ? e.target.closest("button") : null;
      if (!btn) return;

      const t = lower(btn);

      if (!t.includes("добавить") || !t.includes("мою баз")) return;

      // После старой функции даём ей выполниться, затем принудительно синхронизируем все хранилища.
      setTimeout(() => {
        const before = syncMyDb();

        setScope("my");
        syncMyDb();

        if (window.EP_DB_V68 && typeof window.EP_DB_V68.renderCategories === "function") {
          window.EP_DB_V68.renderCategories("mat");
        }

        console.log("V72 synced after add-to-my", before);
      }, 350);

      setTimeout(syncMyDb, 1000);
      setTimeout(syncMyDb, 2000);
    }, true);
  }

  function patchEpDbGetActiveStore() {
    if (!window.EP_DB || window.EP_DB.datasetV72Patched) return;

    const originalGetActiveStore = window.EP_DB.getActiveStore;
    const originalSetScope = window.EP_DB.setScope;

    if (typeof originalGetActiveStore === "function") {
      window.EP_DB.getActiveStore = function (type) {
        syncMyDb();

        const scope = getScope();

        if (scope === "my") {
          return String(type).toLowerCase().includes("work") ? window.EP_MY_WORK : window.EP_MY_MAT;
        }

        return originalGetActiveStore.call(window.EP_DB, type);
      };
    }

    if (typeof originalSetScope === "function") {
      window.EP_DB.setScope = function (scope) {
        const result = originalSetScope.call(window.EP_DB, scope);

        syncMyDb();

        if (scope === "my") {
          window.matDB = window.EP_MY_MAT;
          window.workDB = window.EP_MY_WORK;
        }

        return result;
      };
    }

    window.EP_DB.datasetV72Patched = "1";
  }

  function boot() {
    ensureStyle();

    syncMyDb();
    patchEpDbGetActiveStore();
    patchAddToMyButtons();

    let ticks = 0;

    const run = () => {
      syncMyDb();
      patchEpDbGetActiveStore();
      patchV69Toolbar();
      refillV69Selects();

      ticks += 1;
    };

    run();

    const timer = setInterval(() => {
      run();
      if (ticks > 30) clearInterval(timer);
    }, 700);

    const observer = new MutationObserver(() => {
      setTimeout(run, 80);
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });

    console.log("04-database-v72-my-db-sync.js", VERSION, "loaded", syncMyDb());
  }

  window.EP_DB_V72 = {
    version: VERSION,
    syncMyDb,
    persistMyDb,
    addCustomCategory,
    addCustomSubcategory,
    buildCategoryMapWithCustom,
    refreshV68
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
