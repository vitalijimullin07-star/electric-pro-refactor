/*
 * Electric PRO Refactor
 * V85 Copy Visible Selected Rows To My DB
 *
 * Исправляет V84:
 * - больше не ищет позицию в старом массиве;
 * - берёт название/цену/единицу/категорию из видимой строки;
 * - сохраняет сразу в новую Мою базу V83.
 */

(function () {
  "use strict";

  const VERSION = "V85_COPY_VISIBLE_TO_MY";

  const KEYS = {
    materials: [
      "ep_my_db_materials_v83",
      "ep_db_my_materials_v79",
      "ep_db_my_materials_v67",
      "userMatDB",
      "EP_MY_MAT"
    ],
    works: [
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

  function getActiveType() {
    const btns = Array.from(document.querySelectorAll("button"))
      .filter((b) => {
        const t = low(b);
        return t === "материалы" || t === "работы";
      });

    const active = btns.find((b) => {
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
    const normalized = arr(list).map((item) => normalizeItem(item, type)).filter((x) => x.name);

    keys.forEach((key) => writeJson(key, normalized));

    if (type === "works") {
      window.EP_MY_WORK = normalized;
      window.userWorkDB = normalized;
    } else {
      window.EP_MY_MAT = normalized;
      window.userMatDB = normalized;
    }

    return normalized;
  }

  function normalizeItem(item, type) {
    item = item && typeof item === "object" ? { ...item } : {};

    const name = String(item.name || item.title || item.label || "").trim();
    const price = Number(String(item.price ?? item.cost ?? 0).replace(",", ".")) || 0;
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
      source: "server-visible-row",
      updatedAt: Date.now()
    };
  }

  function signature(item) {
    return [
      String(item.name || "").toLowerCase().trim(),
      String(item.price ?? "").trim(),
      String(item.unit || "").toLowerCase().trim()
    ].join("|");
  }

  function selectedCheckboxes() {
    return Array.from(document.querySelectorAll('input[type="checkbox"]:checked'))
      .filter((ch) => {
        const areaText = low(ch.closest("section,article,main,div") || document.body);
        return !areaText.includes("массовое управление");
      });
  }

  function findRow(ch) {
    let el = ch;

    for (let i = 0; i < 8 && el; i++) {
      const t = low(el);

      const hasPrice = /(\d+([.,]\d+)?)\s*₽/.test(text(el));
      const hasUnit = t.includes(" / шт") || t.includes("/ шт") || t.includes("шт") || t.includes("м.п") || t.includes("ед");
      const looksItem = hasPrice || hasUnit || t.includes("автомат") || t.includes("кабель") || t.includes("розет") || t.includes("выключ");

      if (looksItem && !t.includes("выделить все") && !t.includes("снять галочки")) {
        return el;
      }

      el = el.parentElement;
    }

    return ch.parentElement;
  }

  function cleanName(raw) {
    raw = String(raw || "")
      .replace(/^[✓✔☑☐□\s]+/g, "")
      .replace(/\s+/g, " ")
      .trim();

    // режем по цене
    raw = raw.replace(/\d+([.,]\d+)?\s*₽.*$/g, "").trim();

    // режем по мета-разделителям
    raw = raw.split(" • ")[0].split(" / ")[0].trim();

    // убираем слова кнопок
    raw = raw
      .replace(/открыть$/i, "")
      .replace(/выбрать$/i, "")
      .trim();

    return raw;
  }

  function parseRow(row) {
    const full = text(row);

    let name = "";

    const strong = row.querySelector("b,strong,h3,h4,.name,.title");
    if (strong && text(strong)) {
      name = cleanName(text(strong));
    }

    if (!name) {
      name = cleanName(full);
    }

    const priceMatch = full.match(/(\d+(?:[.,]\d+)?)\s*₽/);
    const price = priceMatch ? Number(priceMatch[1].replace(",", ".")) : 0;

    let unit = "шт";
    if (/м\.п/i.test(full)) unit = "м.п";
    else if (/\bед\b/i.test(full)) unit = "ед";
    else if (/\bупк\b/i.test(full)) unit = "упк";
    else if (/\bм\b/i.test(full) && !/м\.п/i.test(full)) unit = "м";
    else if (/шт/i.test(full)) unit = "шт";

    let category = "Другое";
    let subcategory = "Без подкатегории";

    const meta = full.match(/([^•]+)\s*•\s*[^₽]+₽\s*\/\s*([^\s]+)/);
    if (meta) {
      category = cleanName(meta[1]) || category;
      unit = meta[2] || unit;
    }

    // Если строка вида "Автоматы • 265 ₽ / шт"
    const dotParts = full.split("•");
    if (dotParts.length >= 2) {
      const left = cleanName(dotParts[0]);
      const beforePrice = cleanName(dotParts[1].replace(/\d+([.,]\d+)?\s*₽.*$/g, ""));
      if (beforePrice) category = beforePrice;
      if (left && left.length > name.length) name = left;
    }

    if (!name || name.length < 2) return null;

    return normalizeItem({
      name,
      price,
      unit,
      category,
      subcategory
    }, getActiveType());
  }

  function copySelectedVisibleRows() {
    const type = getActiveType();
    const checks = selectedCheckboxes();

    if (!checks.length) {
      alert("Сначала выбери позиции галочками");
      return 0;
    }

    const target = readMy(type);
    const existing = new Set(target.map(signature));

    let added = 0;

    checks.forEach((ch) => {
      const row = findRow(ch);
      const item = parseRow(row);

      if (!item) return;

      const sig = signature(item);

      if (existing.has(sig)) return;

      target.push(item);
      existing.add(sig);
      added++;
    });

    saveMy(type, target);

    alert("Добавлено в мою базу: " + added);

    return added;
  }

  function shouldHandle(btn) {
    const t = low(btn);
    return t.includes("добавить") && t.includes("мою баз");
  }

  document.addEventListener("click", function (e) {
    const btn = e.target && e.target.closest ? e.target.closest("button") : null;
    if (!btn) return;

    if (!shouldHandle(btn)) return;

    e.preventDefault();
    e.stopPropagation();
    e.stopImmediatePropagation();

    const added = copySelectedVisibleRows();

    if (added > 0) {
      setTimeout(() => {
        if (confirm("Открыть мою базу сейчас?")) {
          location.href = "my-database.html?v=v85-copy-visible";
        }
      }, 100);
    }
  }, true);

  window.EP_DB_V85 = {
    version: VERSION,
    copySelectedVisibleRows
  };

  console.log("04-database-v85-copy-visible-to-my.js", VERSION, "loaded");
})();
