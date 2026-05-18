/*
 * Electric PRO Refactor
 * V65 Bulk Categories Fix
 *
 * Исправляет пустые select:
 * - Категория
 * - Подкатегория
 */

(function () {
  "use strict";

  const VERSION = "V65_BULK_CATEGORIES_FIX";

  const PRESET = {
    "Кабель": ["Силовой кабель", "Слаботочный кабель", "Гофра/трубы для кабеля", "Прочее"],
    "Слаботочка": ["Интернет", "ТВ", "Домофон", "Видеонаблюдение", "Сигнализация", "Прочее"],
    "Трубы": ["ПВХ", "ПНД", "Металлорукав", "Гофра", "Прочее"],
    "Расходники": ["Крепёж", "Клеммы", "Изолента", "Стяжки", "Гильзы", "Наконечники", "Прочее"],
    "Автоматика": ["Автоматы", "УЗО", "ДИФы", "УЗДП", "УЗМ", "Реле", "Контакторы", "Другие аппараты"],
    "Щитовое": ["Корпуса встраиваемые", "Корпуса накладные", "Шинки", "Гребёнки", "DIN-рейки", "Провода", "Наконечники", "Расходка щита"],
    "Розетки/выключатели": ["Розетки", "Выключатели", "Рамки", "Механизмы", "Терморегуляторы", "Прочее"],
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

  function getScope() {
    if (typeof window.epGetDbScope === "function") return window.epGetDbScope();

    return String(
      window.EP_DB_SCOPE ||
      window.epDbScope ||
      localStorage.getItem("ep_active_db_scope_v60") ||
      localStorage.getItem("ep_db_scope") ||
      "global"
    ).toLowerCase();
  }

  function activeArrays() {
    const scope = getScope();

    if (scope === "my" || scope === "моя") {
      return [
        window.EP_MY_MAT || window.userMatDB || window.matDB || [],
        window.EP_MY_WORK || window.userWorkDB || window.workDB || []
      ];
    }

    return [
      window.EP_GLOBAL_MAT || window.matDB || [],
      window.EP_GLOBAL_WORK || window.workDB || []
    ];
  }

  function getItemCat(item) {
    return String(
      item.category ||
      item.cat ||
      item.group ||
      item.parentCategory ||
      item.parent ||
      item.section ||
      ""
    ).trim();
  }

  function getItemSub(item) {
    return String(
      item.subcategory ||
      item.subcat ||
      item.sub ||
      item.kind ||
      item.folder ||
      item.type ||
      ""
    ).trim();
  }

  function buildMap() {
    const map = {};

    Object.keys(PRESET).forEach((cat) => {
      map[cat] = new Set(PRESET[cat]);
    });

    activeArrays().forEach((arr) => {
      if (!Array.isArray(arr)) return;

      arr.forEach((item) => {
        if (!item || typeof item !== "object") return;

        const cat = getItemCat(item);
        const sub = getItemSub(item);

        if (cat) {
          if (!map[cat]) map[cat] = new Set();
          if (sub) map[cat].add(sub);
        }
      });
    });

    // Подхватываем видимые заголовки, например "Автоматика", "Автоматы"
    document.querySelectorAll("div, section, article, button, h1, h2, h3, h4").forEach((el) => {
      if (!isVisible(el)) return;

      const t = text(el);

      Object.keys(PRESET).forEach((cat) => {
        if (t === cat || t.includes(cat)) {
          if (!map[cat]) map[cat] = new Set(PRESET[cat]);
        }
      });
    });

    return map;
  }

  function setOptions(select, values, placeholder) {
    if (!select) return;

    const current = select.value;

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

    if (current && values.includes(current)) {
      select.value = current;
    }
  }

  function findBulkBlock() {
    const blocks = Array.from(document.querySelectorAll("section, article, aside, main, div"))
      .filter(isVisible)
      .filter((el) => {
        const t = lower(el);

        return (
          t.includes("массовое управление") &&
          t.includes("категория") &&
          t.includes("подкатегория")
        );
      })
      .sort((a, b) => {
        const ar = a.getBoundingClientRect();
        const br = b.getBoundingClientRect();
        return (ar.width * ar.height) - (br.width * br.height);
      });

    return blocks[0] || null;
  }

  function findSelects(block) {
    if (!block) return null;

    const selects = Array.from(block.querySelectorAll("select")).filter(isVisible);

    if (selects.length < 2) return null;

    return {
      category: selects[0],
      subcategory: selects[1]
    };
  }

  function fillSelects() {
    const block = findBulkBlock();
    const pair = findSelects(block);

    if (!pair) return false;

    const map = buildMap();
    const categories = Object.keys(map).sort((a, b) => a.localeCompare(b, "ru"));

    if (!categories.length) return false;

    const catSelect = pair.category;
    const subSelect = pair.subcategory;

    const selectedCat = catSelect.value;

    // Категорию заполняем всегда, потому что Android мог открыть пустой список.
    setOptions(catSelect, categories, "Категория");

    if (selectedCat && categories.includes(selectedCat)) {
      catSelect.value = selectedCat;
    }

    function updateSub() {
      const cat = catSelect.value;
      let subs = cat && map[cat] ? Array.from(map[cat]) : [];

      subs = subs.filter(Boolean).sort((a, b) => a.localeCompare(b, "ru"));

      if (!subs.length) subs = ["Без подкатегории"];

      setOptions(subSelect, subs, "Подкатегория");
    }

    updateSub();

    if (!catSelect.dataset.v65Bound) {
      catSelect.dataset.v65Bound = "1";
      catSelect.addEventListener("change", updateSub);
      catSelect.addEventListener("input", updateSub);
    }

    // Перед открытием Android select ещё раз принудительно обновляем options.
    ["pointerdown", "mousedown", "touchstart", "focus", "click"].forEach((ev) => {
      if (!catSelect.dataset["v65_" + ev]) {
        catSelect.dataset["v65_" + ev] = "1";
        catSelect.addEventListener(ev, function () {
          const before = catSelect.value;
          setOptions(catSelect, categories, "Категория");
          if (before && categories.includes(before)) catSelect.value = before;
        }, true);
      }

      if (!subSelect.dataset["v65_" + ev]) {
        subSelect.dataset["v65_" + ev] = "1";
        subSelect.addEventListener(ev, function () {
          updateSub();
        }, true);
      }
    });

    const moveBtn = Array.from(block.querySelectorAll("button"))
      .find((btn) => lower(btn).includes("переместить"));

    if (moveBtn && !moveBtn.dataset.v65Bound) {
      moveBtn.dataset.v65Bound = "1";
      moveBtn.addEventListener("click", function (e) {
        if (!catSelect.value) {
          e.preventDefault();
          e.stopPropagation();
          alert("Сначала выбери категорию");
          return;
        }

        updateSub();

        if (!subSelect.value && subSelect.options.length > 1) {
          subSelect.selectedIndex = 1;
        }
      }, true);
    }

    return true;
  }

  function boot() {
    let ticks = 0;

    const run = () => {
      fillSelects();
      ticks += 1;
    };

    run();

    const timer = setInterval(() => {
      run();
      if (ticks > 30) clearInterval(timer);
    }, 300);

    const observer = new MutationObserver(run);

    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ["class", "style", "disabled"]
    });

    document.addEventListener("click", () => {
      setTimeout(run, 50);
      setTimeout(run, 200);
      setTimeout(run, 500);
    }, true);

    console.log("04-database-bulk-categories-v65.js", VERSION, "loaded");
  }

  window.EP_BULK_CATEGORIES_V65 = {
    version: VERSION,
    fillSelects,
    buildMap
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
