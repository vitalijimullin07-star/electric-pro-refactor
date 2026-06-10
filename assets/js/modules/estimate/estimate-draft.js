/* ============================================================
   Electric Pro V29 — EstimateDraft (предварительная смета)
   Временный ЧИСТЫЙ контракт единой предварительной сметы.
   Все модули (Материалы/Работа/Щит/Пул/Однолинейка) кладут позиции
   сюда, а не в собственные несвязанные сметы.
   Хранилище: localStorage ep_estimate_draft_v29.
   Деньги храним как есть (Number), НЕ округляем без команды.
   ============================================================ */
(() => {
  "use strict";
  window.EP = window.EP || {};

  const KEY = "ep_estimate_draft_v29";
  let _seq = 0;

  function read() {
    try {
      const arr = JSON.parse(localStorage.getItem(KEY) || "[]");
      return Array.isArray(arr) ? arr : [];
    } catch (e) { return []; }
  }
  function write(items) {
    try { localStorage.setItem(KEY, JSON.stringify(items)); } catch (e) {}
    window.dispatchEvent(new CustomEvent("ep:estimate-draft-changed", { detail: { count: items.length } }));
  }
  function num(v) { const n = typeof v === "number" ? v : parseFloat(String(v).replace(",", ".")); return isFinite(n) ? n : 0; }
  function lineId() { _seq += 1; return "ed_" + Date.now().toString(36) + "_" + _seq.toString(36); }

  // item: { sourceId, type, name, unit, price, qty, base, source }
  function addItem(item) {
    item = item || {};
    const items = read();
    const base = item.base || (window.EP.Database ? window.EP.Database.getActiveDb() : "my");
    const srcId = item.sourceId != null ? String(item.sourceId) : "";
    // если такая же позиция уже есть (тот же источник+база) — увеличиваем количество
    const found = srcId ? items.find((x) => x.sourceId === srcId && x.base === base) : null;
    if (found) {
      found.qty = num(found.qty) + num(item.qty != null ? item.qty : 1);
      write(items);
      return found;
    }
    const line = {
      id: lineId(),
      sourceId: srcId,
      type: item.type === "work" ? "work" : "material",
      name: String(item.name || "").trim(),
      unit: String(item.unit || "шт"),
      price: num(item.price),
      qty: num(item.qty != null ? item.qty : 1) || 1,
      base,
      source: item.source || "database"
    };
    items.push(line);
    write(items);
    return line;
  }

  function getItems() { return read(); }
  function removeItem(id) { write(read().filter((x) => x.id !== id)); }
  function setQty(id, qty) {
    const items = read();
    const it = items.find((x) => x.id === id);
    if (it) { it.qty = num(qty); write(items); }
    return it || null;
  }
  function clear() { write([]); }
  function count() { return read().length; }
  function total() { return read().reduce((s, x) => s + num(x.price) * num(x.qty), 0); }

  window.EP.EstimateDraft = { addItem, getItems, removeItem, setQty, clear, count, total };
})();
