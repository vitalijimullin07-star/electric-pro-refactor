/* ============================================================
   Electric Pro V29 — Estimate (ОСНОВНАЯ смета)
   Кнопка «Добавить в основную» переносит сюда позиции из предварительной
   (EstimateDraft). Из основной растут: «Поставщику», «Смета работ»,
   документы, склад, затраты, расходники.
   Хранилище: localStorage ep_estimate_main_v29.
   ============================================================ */
(() => {
  "use strict";
  window.EP = window.EP || {};
  const KEY = "ep_estimate_main_v29";
  let _seq = 0;

  function read() {
    try { const a = JSON.parse(localStorage.getItem(KEY) || "[]"); return Array.isArray(a) ? a : []; }
    catch (e) { return []; }
  }
  function write(items) {
    try { localStorage.setItem(KEY, JSON.stringify(items)); } catch (e) {}
    window.dispatchEvent(new CustomEvent("ep:estimate-main-changed", { detail: { count: items.length } }));
  }
  function num(v) { const n = typeof v === "number" ? v : parseFloat(String(v).replace(",", ".")); return isFinite(n) ? n : 0; }
  function lineId() { _seq += 1; return "em_" + Date.now().toString(36) + "_" + _seq.toString(36); }
  function norm(it, source) {
    return {
      id: lineId(),
      sourceId: it.sourceId != null ? String(it.sourceId) : "",
      type: it.type === "work" ? "work" : "material",
      name: String(it.name || "").trim(),
      unit: String(it.unit || "шт"),
      price: num(it.price),
      qty: num(it.qty != null ? it.qty : 1) || 1,
      base: it.base || "",
      source: source || it.source || "main"
    };
  }

  function getItems() { return read(); }
  function removeItem(id) { write(read().filter((x) => x.id !== id)); }
  function setQty(id, qty) { const items = read(); const it = items.find((x) => x.id === id); if (it) { it.qty = num(qty); write(items); } return it || null; }
  function clear() { write([]); }
  function count() { return read().length; }
  function total() { return read().reduce((s, x) => s + num(x.price) * num(x.qty), 0); }
  function addItem(item) { const items = read(); const line = norm(item || {}, (item && item.source) || "main"); items.push(line); write(items); return line; }

  // Объединить набор позиций в основную, агрегируя одинаковые (тип+имя+единица): количество складывается.
  function mergeItems(list) {
    const items = read();
    const keyOf = (x) => (x.type === "work" ? "w" : "m") + "|" + String(x.name || "").trim().toLowerCase() + "|" + String(x.unit || "").toLowerCase();
    const index = new Map();
    items.forEach((x) => index.set(keyOf(x), x));
    let added = 0;
    (Array.isArray(list) ? list : []).forEach((raw) => {
      const it = norm(raw, "main");
      if (!it.name) return;
      const k = keyOf(it);
      const ex = index.get(k);
      if (ex) { ex.qty = num(ex.qty) + num(it.qty); if (!num(ex.price) && num(it.price)) ex.price = num(it.price); }
      else { items.push(it); index.set(k, it); }
      added++;
    });
    write(items);
    return added;
  }

  // Паритет с черновиком (для модулей, что пишут через источник, напр. расходники).
  function setSourceItems(source, list) {
    source = String(source || "");
    const kept = read().filter((x) => x.source !== source);
    const add = (Array.isArray(list) ? list : []).map((it) => norm(it, source)).filter((x) => x.name);
    write(kept.concat(add));
    return add.length;
  }
  function removeSource(source) { write(read().filter((x) => x.source !== String(source || ""))); }
  function itemsBySource(source) { return read().filter((x) => x.source === String(source || "")); }

  // ── Экспорт / импорт сметы файлом ──────────────────────────
  // Формат тот же по духу, что у «Проекта квартиры» (⤓ Экспорт / ⤒ Импорт JSON):
  // конверт с type/версией + плоский список позиций. Логика ЧИСТАЯ (без DOM) — её
  // зовёт UI из estimate-tabs.js и она же покрыта тестами.
  const FILE_TYPE = "ep-estimate";
  function exportData(meta) {
    const m = meta || {};
    return {
      type: FILE_TYPE, v: 1,
      exportedAt: new Date().toISOString(),
      name: String(m.name || ""),
      object: String(m.object || ""),
      client: String(m.client || ""),
      items: read().map((x) => ({
        type: x.type === "work" ? "work" : "material",
        name: String(x.name || ""), unit: String(x.unit || ""),
        qty: num(x.qty), price: num(x.price),
        base: x.base || "", source: x.source || ""
      }))
    };
  }
  function exportJSON(meta) { return JSON.stringify(exportData(meta), null, 1); }
  // «Работа»/«work»/«раб» → work, всё остальное → material (файл могут собрать руками)
  function typeOf(v) {
    const s = String(v == null ? "" : v).trim().toLowerCase();
    return (s === "work" || s.indexOf("раб") === 0) ? "work" : "material";
  }
  function parseImport(text) {
    let data = text;
    if (typeof text === "string") { try { data = JSON.parse(text); } catch (e) { return null; } }
    if (!data) return null;
    const raw = Array.isArray(data) ? data : (Array.isArray(data.items) ? data.items : null);
    if (!raw) return null;
    const items = raw.map((it) => ({
      type: typeOf(it && it.type),
      name: String((it && it.name) || "").trim(),
      unit: String((it && it.unit) || "шт"),
      qty: num(it && it.qty != null ? it.qty : 1) || 1,
      price: num(it && it.price),
      base: (it && it.base) || ""
    })).filter((x) => x.name);
    if (!items.length) return null;
    return {
      items: items,
      name: String((!Array.isArray(data) && data.name) || ""),
      object: String((!Array.isArray(data) && data.object) || ""),
      client: String((!Array.isArray(data) && data.client) || ""),
      works: items.filter((x) => x.type === "work").length,
      materials: items.filter((x) => x.type === "material").length
    };
  }
  // mode: "replace" — заменить смету целиком, иначе добавить к текущей (одинаковые
  // позиции по типу+имени+единице складываются — это делает mergeItems)
  function importJSON(text, mode) {
    const p = parseImport(text);
    if (!p) return null;
    if (mode === "replace") clear();
    mergeItems(p.items);
    return p;
  }

  window.EP.Estimate = {
    addItem, getItems, removeItem, setQty, clear, count, total, mergeItems, setSourceItems, removeSource, itemsBySource,
    exportData, exportJSON, parseImport, importJSON, FILE_TYPE
  };
})();
