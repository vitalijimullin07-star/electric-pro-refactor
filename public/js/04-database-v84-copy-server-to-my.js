/*
 * Electric PRO Refactor
 * V84 Copy Server DB To My Database
 *
 * Перехватывает старую кнопку "+ Добавить выбранные в мою базу"
 * и сохраняет выбранные позиции в новую базу V83:
 *
 * - ep_my_db_materials_v83
 * - ep_my_db_works_v83
 */

(function () {
  "use strict";

  const VERSION = "V84_COPY_SERVER_TO_MY_DB";

  const KEYS = {
    mat: [
      "ep_my_db_materials_v83",
      "ep_db_my_materials_v79",
      "ep_db_my_materials_v67",
      "userMatDB",
      "EP_MY_MAT"
    ],
    work: [
      "ep_my_db_works_v83",
      "ep_db_my_works_v79",
      "ep_db_my_works_v67",
      "userWorkDB",
      "EP_MY_WORK"
    ]
  };

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
    return String((el && el.textContent) || "").replace(/\s+/g, " ").trim();
  }

  function low(el) {
    return text(el).toLowerCase();
  }

  function normalizeType(type) {
    type = String(type || "").toLowerCase();
    return type.includes("work") || type.includes("работ") ? "work" : "mat";
  }

  function getActiveTabType() {
    const buttons = Array.from(document.querySelectorAll("button"))
      .filter((b) => {
        const t = low(b);
        return t === "материалы" || t === "работы";
      });

    const active = buttons.find((b) => {
      const cls = String(b.className || "").toLowerCase();
      const aria = String(b.getAttribute("aria-selected") || "").toLowerCase();
      return cls.includes("active") || aria === "true";
    });

    if (active && low(active).includes("работ")) return "work";

    return "mat";
  }

  function serverStore(type) {
    type = normalizeType(type);

    if (window.EP_DB && typeof window.EP_DB.getActiveStore === "function") {
      try {
        const store = window.EP_DB.getActiveStore(type === "work" ? "work" : "mat");
        if (Array.isArray(store) && store.length) return store;
      } catch (e) {}
    }

    if (type === "work") {
      return arr(window.EP_GLOBAL_WORK && window.EP_GLOBAL_WORK.length ? window.EP_GLOBAL_WORK : window.workDB);
    }

    return arr(window.EP_GLOBAL_MAT && window.EP_GLOBAL_MAT.length ? window.EP_GLOBAL_MAT : window.matDB);
  }

  function readMy(type) {
    const keys = type === "work" ? KEYS.work : KEYS.mat;

    for (const key of keys) {
      const list = arr(readJson(key, []));
      if (list.length) return list;
    }

    return [];
  }

  function saveMy(type, list) {
    const keys = type === "work" ? KEYS.work : KEYS.mat;
    const normalized = arr(list).map((x) => normalizeItem(x, type)).filter((x) => x.name);

    keys.forEach((key) => writeJson(key, normalized));

    if (type === "work") {
      window.EP_MY_WORK = normalized;
      window.userWorkDB = normalized;
    } else {
      window.EP_MY_MAT = normalized;
      window.userMatDB = normalized;
    }

    return normalized;
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

  function itemPrice(item) {
    return item?.price ?? item?.cost ?? item?.amount ?? item?.["Цена"] ?? item?.["цена"] ?? 0;
  }

  function itemUnit(item) {
    return String(item?.unit || item?.measure || item?.uom || item?.["Ед"] || item?.["ед"] || "шт").trim() || "шт";
  }

  function itemCat(item) {
    return String(item?.category || item?.cat || item?.group || item?.section || item?.type || "Другое").trim() || "Другое";
  }

  function itemSub(item) {
    return String(item?.subcategory || item?.subcat || item?.sub || item?.kind || item?.folder || "Без подкатегории").trim() || "Без подкатегории";
  }

  function normalizeItem(item, type) {
    item = item && typeof item === "object" ? { ...item } : {};

    const dbType = type === "work" ? "work" : "material";
    const name = itemName(item);

    if (!item.id) {
      item.id = "my_" + dbType + "_" + Date.now() + "_" + Math.random().toString(16).slice(2);
    }

    return {
      ...item,
      id: String(item.id),
      dbType,
      name,
      price: Number(String(itemPrice(item)).replace(",", ".")) || 0,
      unit: itemUnit(item),
      category: itemCat(item),
      subcategory: itemSub(item),
      source: "server",
      updatedAt: Date.now()
    };
  }

  function signature(item) {
    return [
      itemName(item).toLowerCase(),
      String(itemPrice(item)).trim(),
      itemUnit(item).toLowerCase()
    ].join("|");
  }

  function findSelectedRows() {
    const checks = Array.from(document.querySelectorAll('input[type="checkbox"]:checked'));

    return checks
      .map((check) => {
        let el = check;

        for (let i = 0; i < 9 && el; i++) {
          const t = low(el);

          if (
            t &&
            !t.includes("массовое управление") &&
            (
              t.includes("₽") ||
              t.includes(" / ") ||
              t.includes("шт") ||
              t.includes("м.п") ||
              t.includes("автомат") ||
              t.includes("кабель") ||
              t.includes("розет") ||
              t.includes("выключ")
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

  function norm(s) {
    return String(s || "")
      .toLowerCase()
      .replace(/[ё]/g, "е")
      .replace(/[^a-zа-я0-9]+/gi, " ")
      .replace(/\s+/g, " ")
      .trim();
  }

  function rowName(row) {
    const direct = row.querySelector("b,strong,h3,h4,.name,.title");
    if (direct && text(direct)) return text(direct);

    let raw = text(row)
      .replace(/^[✓✔☑☐□\s]+/g, "")
      .replace(/\d+([.,]\d+)?\s*₽.*$/g, "")
      .replace(/\s+/g, " ")
      .trim();

    raw = raw.split(" • ")[0].split(" / ")[0].trim();

    return raw;
  }

  function findItemByRow(row, store) {
    const name = norm(rowName(row));

    if (!name) return null;

    let found = store.find((item) => {
      const n = norm(itemName(item));
      return n && (n === name || n.includes(name) || name.includes(n));
    });

    if (found) return found;

    const parts = name.split(" ").filter(Boolean).slice(0, 5);

    found = store.find((item) => {
      const n = norm(itemName(item));
      return n && parts.length && parts.every((p) => n.includes(p));
    });

    return found || null;
  }

  function copySelectedToMy() {
    const type = getActiveTabType();
    const rows = findSelectedRows();

    if (!rows.length) {
      alert("Сначала выбери позиции галочками");
      return;
    }

    const source = serverStore(type);
    const target = readMy(type);

    const existing = new Set(target.map(signature));

    let added = 0;

    rows.forEach((row) => {
      const item = findItemByRow(row, source);
      if (!item) return;

      const copy = normalizeItem(item, type);
      const sig = signature(copy);

      if (existing.has(sig)) return;

      target.push(copy);
      existing.add(sig);
      added++;
    });

    saveMy(type, target);

    alert("Добавлено в мою базу: " + added);

    return added;
  }

  function shouldHandleButton(btn) {
    const t = low(btn);

    return (
      t.includes("добавить") &&
      t.includes("мою баз")
    );
  }

  document.addEventListener("click", function (e) {
    const btn = e.target && e.target.closest ? e.target.closest("button") : null;
    if (!btn) return;

    if (!shouldHandleButton(btn)) return;

    e.preventDefault();
    e.stopPropagation();
    e.stopImmediatePropagation();

    const added = copySelectedToMy();

    if (added > 0) {
      const openNow = confirm("Открыть мою базу сейчас?");
      if (openNow) {
        window.location.href = "my-database.html?v=v84-copy-server-to-my";
      }
    }
  }, true);

  window.EP_DB_V84 = {
    version: VERSION,
    copySelectedToMy
  };

  console.log("04-database-v84-copy-server-to-my.js", VERSION, "loaded");
})();
