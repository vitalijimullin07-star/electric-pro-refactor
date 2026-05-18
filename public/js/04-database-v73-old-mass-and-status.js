/*
 * Electric PRO Refactor
 * V73 Old Mass Management + Status Chips
 *
 * 1. Переносит нижние статусные плашки наверх.
 * 2. Отключает им клики, чтобы не триггерили меню.
 * 3. Добавляет создание категории/подкатегории в старый V21 блок.
 * 4. Исправляет перенос выбранных позиций в старом V21.
 */

(function () {
  "use strict";

  const VERSION = "V73_OLD_MASS_AND_STATUS";
  const STYLE_ID = "ep-v73-style";
  const STATUSBAR_ID = "ep-v73-statusbar";

  const LS_CUSTOM = "ep_db_custom_categories_v72";

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

  function text(el) {
    return String((el && el.textContent) || "").replace(/\s+/g, " ").trim();
  }

  function lower(el) {
    return text(el).toLowerCase();
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
      #${STATUSBAR_ID} {
        position: fixed;
        top: max(6px, env(safe-area-inset-top));
        left: 8px;
        right: 8px;
        z-index: 9999999;
        display: flex;
        flex-wrap: wrap;
        gap: 6px;
        align-items: center;
        pointer-events: none;
      }

      #${STATUSBAR_ID} > * {
        pointer-events: none !important;
        position: static !important;
        inset: auto !important;
        transform: none !important;
        margin: 0 !important;
        max-width: calc(50vw - 12px);
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .ep-v73-status-chip {
        pointer-events: none !important;
        z-index: 9999999 !important;
      }

      .ep-v73-tools {
        margin: 10px 0;
        padding: 10px;
        border-radius: 14px;
        background: rgba(37,99,235,.08);
        border: 1px solid rgba(37,99,235,.18);
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 8px;
      }

      .ep-v73-tools button {
        border: 0;
        border-radius: 12px;
        padding: 11px 9px;
        font-weight: 900;
        color: #fff;
        background: #2563eb;
      }

      .ep-v73-tools button:nth-child(2) {
        background: #059669;
      }
    `;

    document.head.appendChild(style);
  }

  function ensureStatusbar() {
    ensureStyle();

    let bar = document.getElementById(STATUSBAR_ID);

    if (!bar) {
      bar = document.createElement("div");
      bar.id = STATUSBAR_ID;
      document.body.appendChild(bar);
    }

    return bar;
  }

  function moveStatusChipsUp() {
    const bar = ensureStatusbar();

    const chips = Array.from(document.querySelectorAll("div,span,button"))
      .filter(isVisible)
      .filter((el) => {
        if (el.id === STATUSBAR_ID) return false;
        if (bar.contains(el)) return false;

        const t = lower(el);

        return (
          t === "на выход" ||
          t.includes("база:") ||
          t.includes("v17 активна") ||
          t.includes("v21 активна") ||
          t.includes("v63") ||
          t.includes("v67")
        );
      })
      .filter((el) => {
        const r = el.getBoundingClientRect();

        // Берём именно плавающие нижние/служебные плашки.
        return (
          r.bottom > window.innerHeight - 120 ||
          getComputedStyle(el).position === "fixed"
        );
      });

    chips.forEach((chip) => {
      chip.classList.add("ep-v73-status-chip");
      chip.style.pointerEvents = "none";
      bar.appendChild(chip);
    });
  }

  function getScope() {
    if (window.EP_DB && typeof window.EP_DB.getScope === "function") {
      return window.EP_DB.getScope();
    }

    if (typeof window.epGetDbScope === "function") {
      const s = window.epGetDbScope();
      return s === "global" ? "server" : s;
    }

    return localStorage.getItem("ep_active_db_scope_v67") || "server";
  }

  function getActiveType() {
    const tabs = Array.from(document.querySelectorAll("button"))
      .filter(isVisible)
      .filter((b) => {
        const t = lower(b);
        return t === "материалы" || t === "работы";
      });

    const active = tabs.find((b) => {
      const cls = String(b.className || "").toLowerCase();
      const aria = String(b.getAttribute("aria-selected") || "").toLowerCase();
      return cls.includes("active") || aria === "true";
    });

    if (active && lower(active).includes("работ")) return "work";

    return "mat";
  }

  function getStore(type) {
    if (window.EP_DB && typeof window.EP_DB.getActiveStore === "function") {
      return arr(window.EP_DB.getActiveStore(type));
    }

    return type === "work" ? arr(window.workDB) : arr(window.matDB);
  }

  function persist() {
    if (window.EP_DB_V72 && typeof window.EP_DB_V72.persistMyDb === "function") {
      window.EP_DB_V72.persistMyDb();
    }

    if (window.EP_DB_V72 && typeof window.EP_DB_V72.syncMyDb === "function") {
      window.EP_DB_V72.syncMyDb();
    }

    if (window.EP_DB && typeof window.EP_DB.applyActiveStoreToLegacy === "function") {
      window.EP_DB.applyActiveStoreToLegacy();
    }
  }

  function itemName(item) {
    return String(
      item?.name ||
      item?.title ||
      item?.label ||
      item?.Наименование ||
      item?.["Наименование"] ||
      ""
    ).trim();
  }

  function norm(s) {
    return String(s || "")
      .toLowerCase()
      .replace(/[ё]/g, "е")
      .replace(/[^a-zа-я0-9]+/gi, " ")
      .replace(/\s+/g, " ")
      .trim();
  }

  function getCategoryMap() {
    if (window.EP_DB_V72 && typeof window.EP_DB_V72.buildCategoryMapWithCustom === "function") {
      const map = window.EP_DB_V72.buildCategoryMapWithCustom();
      return map;
    }

    const saved = readJson(LS_CUSTOM, {});
    const map = {};

    Object.keys(PRESET).forEach((cat) => {
      map[cat] = new Set(PRESET[cat]);
    });

    Object.keys(saved || {}).forEach((cat) => {
      if (!map[cat]) map[cat] = new Set();
      arr(saved[cat]).forEach((sub) => map[cat].add(sub));
    });

    return map;
  }

  function saveCustomMap(map) {
    const plain = {};

    Object.keys(map).forEach((cat) => {
      plain[cat] = Array.from(map[cat]).filter(Boolean);
    });

    writeJson(LS_CUSTOM, plain);
  }

  function setOptions(select, values, placeholder) {
    if (!select) return;

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

  function findOldMassBlock() {
    return Array.from(document.querySelectorAll("section, article, aside, main, div"))
      .filter(isVisible)
      .filter((el) => {
        const t = lower(el);

        return (
          t.includes("массовое управление v21") ||
          (
            t.includes("массовое управление") &&
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
      })[0] || null;
  }

  function patchOldMassSelects() {
    const block = findOldMassBlock();
    if (!block) return;

    const selects = Array.from(block.querySelectorAll("select")).filter(isVisible);
    if (selects.length < 2) return;

    const catSelect = selects[0];
    const subSelect = selects[1];
    const map = getCategoryMap();
    const cats = Object.keys(map).sort((a, b) => a.localeCompare(b, "ru"));

    setOptions(catSelect, cats, "Категория");

    function updateSub() {
      const cat = catSelect.value;
      let subs = cat && map[cat] ? Array.from(map[cat]) : ["Без подкатегории"];
      subs = subs.filter(Boolean).sort((a, b) => a.localeCompare(b, "ru"));
      if (!subs.length) subs = ["Без подкатегории"];
      setOptions(subSelect, subs, "Подкатегория");
    }

    if (!catSelect.dataset.v73Bound) {
      catSelect.dataset.v73Bound = "1";
      catSelect.addEventListener("change", updateSub);
      catSelect.addEventListener("input", updateSub);
    }

    updateSub();
  }

  function addCreateButtonsToOldMass() {
    const block = findOldMassBlock();
    if (!block || block.querySelector(".ep-v73-tools")) return;

    const tools = document.createElement("div");
    tools.className = "ep-v73-tools";
    tools.innerHTML = `
      <button type="button" data-v73="cat">+ Создать категорию</button>
      <button type="button" data-v73="sub">+ Создать подкатегорию</button>
    `;

    const firstSelect = block.querySelector("select");

    if (firstSelect && firstSelect.parentElement) {
      firstSelect.parentElement.insertAdjacentElement("beforebegin", tools);
    } else {
      block.insertBefore(tools, block.firstChild);
    }

    tools.querySelector('[data-v73="cat"]').addEventListener("click", function () {
      const cat = prompt("Название новой категории:");
      if (!cat) return;

      const map = getCategoryMap();
      if (!map[cat]) map[cat] = new Set(["Без подкатегории"]);

      saveCustomMap(map);

      if (window.EP_DB_V72 && typeof window.EP_DB_V72.addCustomCategory === "function") {
        window.EP_DB_V72.addCustomCategory(cat);
      }

      patchOldMassSelects();
      alert("Категория создана: " + cat);
    });

    tools.querySelector('[data-v73="sub"]').addEventListener("click", function () {
      const selects = Array.from(block.querySelectorAll("select")).filter(isVisible);
      const currentCat = selects[0] && selects[0].value ? selects[0].value : "";

      const cat = prompt("К какой категории добавить подкатегорию?", currentCat);
      if (!cat) return;

      const sub = prompt("Название новой подкатегории:");
      if (!sub) return;

      const map = getCategoryMap();
      if (!map[cat]) map[cat] = new Set();
      map[cat].add(sub);

      saveCustomMap(map);

      if (window.EP_DB_V72 && typeof window.EP_DB_V72.addCustomSubcategory === "function") {
        window.EP_DB_V72.addCustomSubcategory(cat, sub);
      }

      patchOldMassSelects();
      alert("Подкатегория создана: " + cat + " / " + sub);
    });
  }

  function selectedRows(block) {
    return Array.from(block.querySelectorAll('input[type="checkbox"]:checked'))
      .map((check) => {
        let el = check;

        for (let i = 0; i < 8 && el; i++) {
          const t = lower(el);

          if (
            t &&
            !t.includes("массовое управление") &&
            (
              t.includes("₽") ||
              t.includes(" / ") ||
              t.includes("шт") ||
              t.includes("м.п") ||
              t.includes("автомат") ||
              t.includes("кабель")
            )
          ) {
            return el;
          }

          el = el.parentElement;
        }

        return check.parentElement;
      })
      .filter(Boolean);
  }

  function guessNameFromRow(row) {
    const bold = row.querySelector("b,strong,h3,h4,.name,.title");
    if (bold && text(bold)) return text(bold);

    const raw = text(row)
      .replace(/^\s*[✓✔☑☐□]+\s*/g, "")
      .replace(/\d+([.,]\d+)?\s*₽.*$/g, "")
      .replace(/\s+/g, " ")
      .trim();

    return raw.split(" • ")[0].split(" / ")[0].trim();
  }

  function setItemCategory(item, cat, sub) {
    item.category = cat;
    item.subcategory = sub;

    item.cat = cat;
    item.subcat = sub;

    item.group = cat;
    item.section = cat;

    item.updatedAt = Date.now();
  }

  function fixedOldMove(e, btn) {
    const block = findOldMassBlock();
    if (!block || !block.contains(btn)) return false;

    const t = lower(btn);
    if (!t.includes("переместить")) return false;

    e.preventDefault();
    e.stopPropagation();
    e.stopImmediatePropagation();

    const selects = Array.from(block.querySelectorAll("select")).filter(isVisible);
    const cat = selects[0] ? selects[0].value : "";
    const sub = selects[1] ? selects[1].value || "Без подкатегории" : "Без подкатегории";

    if (!cat) {
      alert("Выбери категорию");
      return true;
    }

    const rows = selectedRows(block);

    if (!rows.length) {
      alert("Сначала поставь галочки у позиций");
      return true;
    }

    const type = getActiveType();
    const store = getStore(type);

    let moved = 0;

    rows.forEach((row) => {
      const rowName = norm(guessNameFromRow(row));
      if (!rowName) return;

      let found = store.find((item) => {
        const name = norm(itemName(item));
        return name && (name === rowName || name.includes(rowName) || rowName.includes(name));
      });

      if (!found) {
        found = store.find((item) => {
          const name = norm(itemName(item));
          return name && rowName.split(" ").slice(0, 4).every((part) => name.includes(part));
        });
      }

      if (found) {
        setItemCategory(found, cat, sub);
        moved++;
      }
    });

    persist();

    alert("Перемещено: " + moved);

    if (window.EP_DB_V72 && typeof window.EP_DB_V72.refreshV68 === "function") {
      window.EP_DB_V72.refreshV68();
    }

    return true;
  }

  function bindOldMove() {
    document.addEventListener("click", function (e) {
      const btn = e.target && e.target.closest ? e.target.closest("button") : null;
      if (!btn) return;

      fixedOldMove(e, btn);
    }, true);
  }

  function run() {
    moveStatusChipsUp();
    patchOldMassSelects();
    addCreateButtonsToOldMass();
  }

  function boot() {
    ensureStyle();
    bindOldMove();

    run();

    let ticks = 0;
    const timer = setInterval(() => {
      run();
      ticks++;
      if (ticks > 40) clearInterval(timer);
    }, 500);

    document.addEventListener("click", function () {
      setTimeout(run, 80);
      setTimeout(run, 250);
    }, true);

    console.log("04-database-v73-old-mass-and-status.js", VERSION, "loaded");
  }

  window.EP_DB_V73 = {
    version: VERSION,
    run,
    moveStatusChipsUp,
    patchOldMassSelects
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
