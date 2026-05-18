(function () {
  "use strict";

  const VERSION = "V87_SERVER_TO_MY_SYNC";

  const KEYS = {
    materials: [
      "ep_my_db_materials_v83",
      "ep_db_my_materials_v67",
      "userMatDB",
      "EP_MY_MAT"
    ],
    works: [
      "ep_my_db_works_v83",
      "ep_db_my_works_v67",
      "userWorkDB",
      "EP_MY_WORK"
    ]
  };

  const subToCat = {
    "Автоматы": "Автоматика",
    "УЗО": "Автоматика",
    "ДИФы": "Автоматика",
    "УЗДП": "Автоматика",
    "УЗМ": "Автоматика",
    "УЗМ / реле напряжения": "Автоматика",
    "Реле": "Автоматика",
    "Контакторы": "Автоматика",
    "Силовой кабель": "Кабель",
    "Слаботочный кабель": "Кабель",
    "Крепёж": "Расходники",
    "Клеммы": "Расходники",
    "Изолента": "Расходники",
    "Стяжки": "Расходники",
    "Наконечники": "Расходники",
    "Корпуса встраиваемые": "Щитовое",
    "Корпуса накладные": "Щитовое",
    "Шинки": "Щитовое",
    "Гребёнки": "Щитовое",
    "DIN-рейки": "Щитовое"
  };

  const topCats = [
    "Автоматика","Кабель","Расходники","Слаботочка","Трубы","Щитовое",
    "Розетки/выключатели","Освещение","Монтаж","Штробление/резка",
    "Высверливание подрозетников","Ниши щита","Черновая электрика",
    "Чистовая установка","Демонтаж","Другое"
  ];

  function arr(v) {
    return Array.isArray(v) ? v : [];
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

  function text(el) {
    return String((el && (el.innerText || el.textContent)) || "")
      .replace(/\s+/g, " ")
      .trim();
  }

  function lines(el) {
    return String((el && (el.innerText || el.textContent)) || "")
      .split(/\n+/)
      .map((x) => x.replace(/\s+/g, " ").trim())
      .filter(Boolean);
  }

  function low(el) {
    return text(el).toLowerCase();
  }

  function visible(el) {
    if (!el || !el.getBoundingClientRect) return false;
    const st = window.getComputedStyle(el);
    if (st.display === "none" || st.visibility === "hidden") return false;
    const r = el.getBoundingClientRect();
    return r.width > 4 && r.height > 4;
  }

  function activeType() {
    const tabs = Array.from(document.querySelectorAll("button"))
      .filter(visible)
      .filter((b) => {
        const t = low(b);
        return t === "материалы" || t === "работы";
      });

    const active = tabs.find((b) => {
      const cls = String(b.className || "").toLowerCase();
      const aria = String(b.getAttribute("aria-selected") || "").toLowerCase();
      return cls.includes("active") || aria === "true";
    });

    if (active && low(active).includes("работ")) return "works";
    return "materials";
  }

  function readMy(type) {
    const keys = type === "works" ? KEYS.works : KEYS.materials;

    for (const key of keys) {
      const list = arr(readJson(key, []));
      if (list.length) return list;
    }

    return [];
  }

  function saveMy(type, list) {
    const keys = type === "works" ? KEYS.works : KEYS.materials;
    const normalized = arr(list).map((x) => normalizeItem(x, type)).filter((x) => x.name);

    keys.forEach((key) => writeJson(key, normalized));

    if (type === "works") {
      window.EP_MY_WORK = normalized;
      window.userWorkDB = normalized;
      if (isMyScope()) window.workDB = normalized;
    } else {
      window.EP_MY_MAT = normalized;
      window.userMatDB = normalized;
      if (isMyScope()) window.matDB = normalized;
    }

    return normalized;
  }

  function isMyScope() {
    try {
      if (window.EP_DB && typeof window.EP_DB.getScope === "function") {
        return window.EP_DB.getScope() === "my";
      }
      if (typeof window.epGetDbScope === "function") {
        return window.epGetDbScope() === "my";
      }
    } catch (e) {}

    return String(localStorage.getItem("ep_active_db_scope_v67") || localStorage.getItem("ep_db_scope") || "").includes("my");
  }

  function syncMyToLegacy() {
    const mats = readMy("materials");
    const works = readMy("works");

    window.EP_MY_MAT = mats;
    window.EP_MY_WORK = works;
    window.userMatDB = mats;
    window.userWorkDB = works;

    writeJson("ep_db_my_materials_v67", mats);
    writeJson("ep_db_my_works_v67", works);

    if (isMyScope()) {
      window.matDB = mats;
      window.workDB = works;
    }
  }

  function cleanName(s) {
    return String(s || "")
      .replace(/^[✓✔☑☐□\s]+/g, "")
      .replace(/\d+([.,]\d+)?\s*₽.*$/g, "")
      .replace(/\s*\/\s*(шт|ед|м\.п|м|упк).*$/i, "")
      .replace(/\s+/g, " ")
      .trim();
  }

  function normalizeItem(item, type) {
    item = item && typeof item === "object" ? { ...item } : {};

    const name = String(item.name || "").trim();
    const price = Number(String(item.price ?? 0).replace(",", ".")) || 0;
    const unit = String(item.unit || "шт").trim() || "шт";
    const category = String(item.category || "Другое").trim() || "Другое";
    const subcategory = String(item.subcategory || "Без подкатегории").trim() || "Без подкатегории";

    if (!item.id) {
      item.id = "my_" + type + "_" + Date.now() + "_" + Math.random().toString(16).slice(2);
    }

    return {
      ...item,
      id: String(item.id),
      dbType: type === "works" ? "work" : "material",
      name,
      price,
      unit,
      category,
      subcategory,
      source: "server",
      updatedAt: Date.now()
    };
  }

  function signature(item) {
    return [
      String(item.name || "").toLowerCase().trim(),
      String(item.unit || "").toLowerCase().trim()
    ].join("|");
  }

  function badRowText(t) {
    return (
      t.includes("массовое управление") ||
      t.includes("добавить выбранные") ||
      t.includes("удалить выбран") ||
      t.includes("переместить выбран") ||
      t.includes("выделить все") ||
      t.includes("снять галочки")
    );
  }

  function findItemRow(check) {
    let el = check;

    for (let i = 0; i < 10 && el; i++) {
      const raw = text(el);
      const t = raw.toLowerCase();

      const hasPrice = /\d+([.,]\d+)?\s*₽/.test(raw);
      const hasUnit = /\/\s*(шт|ед|м\.п|м|упк)/i.test(raw) || /\b(шт|ед|м\.п|упк)\b/i.test(raw);

      if (!badRowText(t) && (hasPrice || hasUnit) && raw.length < 550) {
        return el;
      }

      el = el.parentElement;
    }

    return check.parentElement;
  }

  function parseRow(row) {
    const raw = text(row);
    const rowLines = lines(row);

    let name = "";

    const strong = row.querySelector("b,strong,h3,h4,.name,.title");
    if (strong && text(strong)) {
      name = cleanName(text(strong));
    }

    if (!name) {
      const firstGood = rowLines.find((line) => {
        const l = line.toLowerCase();
        return (
          !l.includes("₽") &&
          !l.includes("открыть") &&
          !l.includes("выбрать") &&
          !l.includes("удалить") &&
          !l.includes("переместить") &&
          !l.includes("выделить") &&
          line.length > 2
        );
      });

      name = cleanName(firstGood || rowLines[0] || raw);
    }

    const priceMatch = raw.match(/(\d+(?:[.,]\d+)?)\s*₽/);
    const price = priceMatch ? Number(priceMatch[1].replace(",", ".")) : 0;

    let unit = "шт";
    const unitMatch = raw.match(/\/\s*(шт|ед|м\.п|м|упк)/i);
    if (unitMatch) unit = unitMatch[1];

    let subcategory = "Без подкатегории";

    const metaLine = rowLines.find((line) => line.includes("•") && line.includes("₽"));
    if (metaLine) {
      const beforeDot = cleanName(metaLine.split("•")[0]);
      if (beforeDot) subcategory = beforeDot;
    }

    let category = subToCat[subcategory] || findNearestTopCategory(row) || "Другое";

    if (!name || name.length < 2) return null;

    return normalizeItem({ name, price, unit, category, subcategory }, activeType());
  }

  function findNearestTopCategory(row) {
    const rowTop = row.getBoundingClientRect().top;

    let best = null;
    let bestY = -Infinity;

    const nodes = Array.from(document.querySelectorAll("button,div,h3,h4,b,strong"))
      .filter(visible);

    nodes.forEach((el) => {
      const r = el.getBoundingClientRect();
      if (r.top >= rowTop) return;
      if (r.top < rowTop - 1200) return;

      const t = text(el).replace("▼", "").replace("открыть", "").trim();

      const cat = topCats.find((c) => t === c || t.startsWith(c + " "));

      if (cat && r.top > bestY) {
        best = cat;
        bestY = r.top;
      }
    });

    return best;
  }

  function selectedItemChecks() {
    return Array.from(document.querySelectorAll('input[type="checkbox"]:checked'))
      .filter(visible)
      .filter((ch) => {
        const row = findItemRow(ch);
        const item = parseRow(row);
        return !!item;
      });
  }

  function allVisibleItemChecks() {
    return Array.from(document.querySelectorAll('input[type="checkbox"]'))
      .filter(visible)
      .filter((ch) => {
        const row = findItemRow(ch);
        const item = parseRow(row);
        return !!item;
      });
  }

  function handleSelectAllButton(btn) {
    const t = low(btn);

    if (!(t.includes("выделить") && (t.includes("все") || t.includes("видим")))) return false;

    setTimeout(() => {
      const checks = allVisibleItemChecks();
      checks.forEach((ch) => ch.checked = true);
    }, 80);

    return true;
  }

  function copySelectedToMy() {
    const type = activeType();
    const checks = selectedItemChecks();

    if (!checks.length) {
      alert("Сначала выбери позиции галочками");
      return 0;
    }

    const my = readMy(type);
    const existing = new Set(my.map(signature));

    let added = 0;

    checks.forEach((check) => {
      const item = parseRow(findItemRow(check));
      if (!item) return;

      const sig = signature(item);
      if (existing.has(sig)) return;

      my.push(item);
      existing.add(sig);
      added++;
    });

    saveMy(type, my);
    syncMyToLegacy();

    alert("V87 добавлено в мою базу: " + added);

    return added;
  }

  function isAddToMyButton(btn) {
    const t = low(btn);
    return t.includes("добавить") && t.includes("мою баз");
  }

  function tryReturnToDatabase() {
    if (sessionStorage.getItem("ep_return_to_database_v87") !== "1") return;

    sessionStorage.removeItem("ep_return_to_database_v87");

    let tries = 0;

    const timer = setInterval(() => {
      tries++;

      const candidates = Array.from(document.querySelectorAll("button,a,div"))
        .filter(visible)
        .filter((el) => low(el).includes("база данных"));

      const target = candidates[0];

      if (target) {
        target.click();
        clearInterval(timer);
        return;
      }

      if (tries > 20) clearInterval(timer);
    }, 300);
  }

  document.addEventListener("click", function (e) {
    const btn = e.target && e.target.closest ? e.target.closest("button") : null;
    if (!btn) return;

    if (handleSelectAllButton(btn)) return;

    if (!isAddToMyButton(btn)) return;

    e.preventDefault();
    e.stopPropagation();
    e.stopImmediatePropagation();

    const added = copySelectedToMy();

    if (added > 0) {
      setTimeout(() => {
        if (confirm("Открыть мою базу сейчас?")) {
          location.href = "my-database.html?v=v87-server-to-my-sync";
        }
      }, 100);
    }
  }, true);

  function boot() {
    syncMyToLegacy();
    tryReturnToDatabase();

    setTimeout(syncMyToLegacy, 800);
    setTimeout(syncMyToLegacy, 2000);

    console.log("04-database-v87-server-to-my-sync.js", VERSION, "loaded");
  }

  window.EP_DB_V87 = {
    version: VERSION,
    copySelectedToMy,
    syncMyToLegacy
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
