(function () {
  "use strict";

  const VERSION = "V86_SERVER_TO_MY_BRIDGE_RETRY";

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

  function rawLines(el) {
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
    const buttons = Array.from(document.querySelectorAll("button")).filter(visible);

    const tabs = buttons.filter((b) => {
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
    } else {
      window.EP_MY_MAT = normalized;
      window.userMatDB = normalized;
    }

    return normalized;
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

  function selectedChecks() {
    return Array.from(document.querySelectorAll('input[type="checkbox"]:checked'))
      .filter(visible)
      .filter((ch) => {
        const t = low(ch.closest("div,li,tr,section,article") || ch.parentElement);
        return !t.includes("выделить все") && !t.includes("снять галочки");
      });
  }

  function findItemRow(check) {
    let el = check;

    for (let i = 0; i < 10 && el; i++) {
      const raw = text(el);
      const t = raw.toLowerCase();

      const hasPrice = /\d+([.,]\d+)?\s*₽/.test(raw);
      const hasUnit =
        /\/\s*(шт|ед|м\.п|м|упк)/i.test(raw) ||
        /\b(шт|ед|м\.п|упк)\b/i.test(raw);

      const bad =
        t.includes("массовое управление") ||
        t.includes("добавить выбранные") ||
        t.includes("удалить выбран") ||
        t.includes("переместить выбран") ||
        t.includes("выделить все") ||
        t.includes("снять галочки");

      if (!bad && (hasPrice || hasUnit) && raw.length < 500) {
        return el;
      }

      el = el.parentElement;
    }

    return check.parentElement;
  }

  function parseVisibleRow(row) {
    const rawText = text(row);
    const lines = rawLines(row);

    let name = "";

    const strong = row.querySelector("b,strong,h3,h4,.name,.title");
    if (strong && text(strong)) {
      name = cleanName(text(strong));
    }

    if (!name) {
      const firstGood = lines.find((line) => {
        const l = line.toLowerCase();
        return (
          !l.includes("₽") &&
          !l.includes("открыть") &&
          !l.includes("выбрать") &&
          !l.includes("удалить") &&
          !l.includes("переместить") &&
          line.length > 2
        );
      });

      name = cleanName(firstGood || lines[0] || rawText);
    }

    const priceMatch = rawText.match(/(\d+(?:[.,]\d+)?)\s*₽/);
    const price = priceMatch ? Number(priceMatch[1].replace(",", ".")) : 0;

    let unit = "шт";
    const unitMatch = rawText.match(/\/\s*(шт|ед|м\.п|м|упк)/i);
    if (unitMatch) unit = unitMatch[1];

    let category = "Другое";
    let subcategory = "Без подкатегории";

    const metaLine = lines.find((line) => line.includes("₽") || line.includes("•"));
    if (metaLine && metaLine.includes("•")) {
      const beforeDot = metaLine.split("•")[0].trim();
      if (beforeDot && !beforeDot.includes("₽")) {
        category = cleanName(beforeDot) || category;
      }
    }

    if (!name || name.length < 2) return null;

    return normalizeItem({ name, price, unit, category, subcategory }, activeType());
  }

  function copySelectedToMy() {
    const type = activeType();
    const checks = selectedChecks();

    if (!checks.length) {
      alert("Сначала выбери позиции галочками");
      return 0;
    }

    const my = readMy(type);
    const existing = new Set(my.map(signature));

    let added = 0;

    checks.forEach((check) => {
      const row = findItemRow(check);
      const item = parseVisibleRow(row);

      if (!item) return;

      const sig = signature(item);
      if (existing.has(sig)) return;

      my.push(item);
      existing.add(sig);
      added++;
    });

    saveMy(type, my);

    alert("V86 добавлено в мою базу: " + added);

    return added;
  }

  function isAddToMyButton(btn) {
    const t = low(btn);
    return t.includes("добавить") && t.includes("мою баз");
  }

  document.addEventListener("click", function (e) {
    const btn = e.target && e.target.closest ? e.target.closest("button") : null;
    if (!btn) return;

    if (!isAddToMyButton(btn)) return;

    e.preventDefault();
    e.stopPropagation();
    e.stopImmediatePropagation();

    const added = copySelectedToMy();

    if (added > 0) {
      setTimeout(() => {
        if (confirm("Открыть мою базу сейчас?")) {
          location.href = "my-database.html?v=v86-server-to-my";
        }
      }, 100);
    }
  }, true);

  window.EP_DB_V86 = {
    version: VERSION,
    copySelectedToMy
  };

  console.log("04-database-v86-server-to-my-bridge.js", VERSION, "loaded");
})();
