/* Electric Pro V29 — реестр иконок (волна 1).
   EP.Icon("имя") → значок текущего набора. Элементы с [data-icon="имя"] красятся автоматически
   после загрузки маршрута. Набор выбирается в визуал-настройках. */
(() => {
  "use strict";
  const KEY = "ep_icon_pack_v29";
  const PACKS = {
    emoji: {
      shield: "🛡️", pool: "🔌", materials: "🗂️", work: "🧰", estimate: "📋", details: "📦",
      tools: "🧰", stock: "📦", costs: "💰", clients: "👤", database: "🗄️", documents: "📄",
      settings: "⚙️", home: "🏠", add: "➕", del: "✕", edit: "✏️", back: "←", search: "🔍",
      save: "💾", calc: "🧮", money: "💰", warn: "⚠️", ok: "✓", import: "⬇️", export: "⬆️", backup: "📦", reset: "↺"
    },
    line: {
      shield: "◈", pool: "⚇", materials: "▤", work: "✦", estimate: "☰", details: "▥",
      tools: "✦", stock: "▦", costs: "₽", clients: "◍", database: "▤", documents: "▢",
      settings: "✲", home: "⌂", add: "+", del: "×", edit: "✎", back: "‹", search: "⌕",
      save: "▣", calc: "▦", money: "₽", warn: "△", ok: "✓", import: "↓", export: "↑", backup: "▦", reset: "↺"
    },
    mono: {
      shield: "▣", pool: "▤", materials: "▦", work: "▧", estimate: "▥", details: "▨",
      tools: "▧", stock: "▦", costs: "$", clients: "@", database: "▤", documents: "▢",
      settings: "*", home: "⌂", add: "+", del: "x", edit: "/", back: "<", search: "?",
      save: "=", calc: "%", money: "$", warn: "!", ok: "v", import: "v", export: "^", backup: "#", reset: "~"
    }
  };
  function curPack() { try { const p = localStorage.getItem(KEY); return PACKS[p] ? p : "emoji"; } catch (e) { return "emoji"; } }
  function get(name) { const p = PACKS[curPack()] || PACKS.emoji; return p[name] || PACKS.emoji[name] || ""; }
  function paint(root) {
    try { (root || document).querySelectorAll("[data-icon]").forEach((el) => { const g = get(el.getAttribute("data-icon")); if (g) el.textContent = g; }); } catch (e) {}
  }
  function use(pack) { try { localStorage.setItem(KEY, PACKS[pack] ? pack : "emoji"); } catch (e) {} paint(document); }
  function setPack(pack) { use(pack); try { window.dispatchEvent(new CustomEvent("ep:icons-changed")); } catch (e) {} }

  window.EP = window.EP || {};
  const Icon = function (name) { return get(name); };
  Icon.get = get; Icon.paint = paint; Icon.use = use; Icon.setPack = setPack; Icon.pack = curPack; Icon.PACKS = PACKS;
  EP.Icon = Icon;

  window.addEventListener("ep:route-loaded", () => paint(document));
  if (document.readyState !== "loading") paint(document);
  else document.addEventListener("DOMContentLoaded", () => paint(document));
})();
