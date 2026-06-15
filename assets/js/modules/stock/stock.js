/* Electric Pro V29 — Этап 8. Склад: остатки материалов, приход/расход, и расчёт дефицита
   «нужно по смете − на складе = докупить». Кнопка «Оприходовать» добавляет докупленное на склад. */
(() => {
  "use strict";
  const KEY = "ep_stock_v29";
  function Draft() { return (window.EP && EP.Estimate) || null; }
  function read() { try { return JSON.parse(localStorage.getItem(KEY) || "[]") || []; } catch (e) { return []; } }
  function write(a) { try { localStorage.setItem(KEY, JSON.stringify(a || [])); } catch (e) {} try { window.dispatchEvent(new CustomEvent("ep:stock-changed")); } catch (e) {} }
  function uid() { return "s_" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6); }
  function norm(s) { return String(s == null ? "" : s).toLowerCase().replace(/ё/g, "е").replace(/[^0-9a-zа-я]+/gi, " ").trim(); }
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c])); }

  function getStock() { return read(); }
  function addItem(o) { const a = read(); const name = String(o && o.name || "").trim(); if (!name) return; a.push({ id: uid(), name, qty: Number(o.qty) || 0, unit: String(o.unit || "") }); write(a); }
  function setQty(i, q) { const a = read(); const it = a.find(x => x.id === i); if (it) { it.qty = Math.max(0, Number(q) || 0); write(a); } }
  function addQty(i, d) { const a = read(); const it = a.find(x => x.id === i); if (it) { it.qty = Math.max(0, (Number(it.qty) || 0) + d); write(a); } }
  function removeItem(i) { write(read().filter(x => x.id !== i)); }
  function stockFor(name, unit) { const n = norm(name); return read().find(x => norm(x.name) === n && (unit ? String(x.unit || "") === String(unit || "") : true)); }
  function receive(name, qty, unit) { const st = stockFor(name, unit); if (st) addQty(st.id, Number(qty) || 0); else addItem({ name, qty, unit }); }

  window.EP = window.EP || {};
  EP.Stock = { getStock, addItem, setQty, addQty, removeItem, stockFor, receive };

  /* нужные материалы по смете (агрегированно) и дефицит */
  function neededMaterials() {
    const d = Draft(); const items = d ? d.getItems() : [];
    const m = new Map();
    items.filter(x => x.type === "material").forEach(x => {
      const key = norm(x.name) + "|" + (x.unit || "");
      const e = m.get(key);
      if (e) { e.qty += Number(x.qty) || 0; } else m.set(key, { name: x.name, unit: x.unit || "", qty: Number(x.qty) || 0 });
    });
    return [...m.values()].filter(x => x.qty > 0).sort((a, b) => String(a.name).localeCompare(String(b.name), "ru"));
  }
  function deficitRows() {
    return neededMaterials().map(n => {
      const st = stockFor(n.name, n.unit);
      const have = st ? Number(st.qty) || 0 : 0;
      return { name: n.name, unit: n.unit, need: n.qty, have, buy: Math.max(0, n.qty - have) };
    });
  }

  /* ---------- UI ---------- */
  let view = "stock"; // stock | deficit
  function flash(msg) {
    try {
      let el = document.getElementById("ep-collector-flash");
      if (!el) { el = document.createElement("div"); el.id = "ep-collector-flash"; el.className = "ep-pick-flash"; document.body.appendChild(el); }
      el.textContent = msg; el.classList.add("show");
      clearTimeout(flash._t); flash._t = setTimeout(() => el && el.classList.remove("show"), 1800);
    } catch (e) {}
  }

  function tabs() {
    return `<div class="ep-est-tabs">
      <button type="button" class="ep-est-tab ${view === "stock" ? "on" : ""}" data-stock-tab="stock">Остатки</button>
      <button type="button" class="ep-est-tab ${view === "deficit" ? "on" : ""}" data-stock-tab="deficit">Что докупить</button>
    </div>`;
  }

  function renderStock() {
    const root = document.getElementById("ep-stock-root"); if (!root) return;
    const items = read().slice().sort((a, b) => String(a.name).localeCompare(String(b.name), "ru"));
    const list = items.length ? items.map(x => `
      <div class="ep-stock-row">
        <div class="ep-stock-n">${esc(x.name)}</div>
        <button type="button" class="ep-stock-b" data-stock-dec="${x.id}">−</button>
        <input class="ep-stock-q" type="number" inputmode="decimal" min="0" step="0.1" data-stock-qty="${x.id}" value="${x.qty}">
        <span class="ep-stock-u">${esc(x.unit)}</span>
        <button type="button" class="ep-stock-b" data-stock-inc="${x.id}">+</button>
        <button type="button" class="ep-stock-del" data-stock-del="${x.id}">✕</button>
      </div>`).join("") : `<div class="ep-db-empty">Склад пуст. Добавь, что есть в наличии.</div>`;
    root.innerHTML = `
      <div class="ep-stock">
        ${tabs()}
        <div class="ep-stock-add">
          <input data-stock-name type="text" placeholder="Название (кабель ВВГ 3×2.5)">
          <input data-stock-newqty type="number" inputmode="decimal" min="0" step="0.1" placeholder="кол-во">
          <input data-stock-newunit type="text" placeholder="ед." class="ep-stock-unit-in">
          <button type="button" class="btn btn-primary ep-clickable" data-stock-add>＋</button>
        </div>
        <div class="ep-stock-list">${list}</div>
        <div class="ep-prof-actions"><button type="button" class="btn btn-ghost ep-clickable" data-route="main">На главный</button></div>
      </div>`;
  }

  function renderDeficit() {
    const root = document.getElementById("ep-stock-root"); if (!root) return;
    const rows = deficitRows();
    const toBuy = rows.filter(r => r.buy > 0);
    const list = rows.length ? rows.map(r => `
      <div class="ep-def-row ${r.buy > 0 ? "need" : "ok"}">
        <div class="ep-def-n">${esc(r.name)}</div>
        <div class="ep-def-c">нужно ${r.need} ${esc(r.unit)}</div>
        <div class="ep-def-c">склад ${r.have}</div>
        <div class="ep-def-buy">${r.buy > 0 ? "докупить " + r.buy : "✓ хватает"}</div>
      </div>`).join("") : `<div class="ep-db-empty">В смете нет материалов. Добавь позиции (щит/пул/материалы → в смету).</div>`;
    root.innerHTML = `
      <div class="ep-stock">
        ${tabs()}
        <div class="ep-sup-head"><div class="ep-sup-title">Закупка с учётом склада</div><div class="ep-sup-sub">${toBuy.length} к докупке из ${rows.length}</div></div>
        <div class="ep-def-list">${list}</div>
        <div class="ep-prof-actions">
          <button type="button" class="btn btn-primary ep-clickable" data-stock-share>Поделиться списком</button>
          <button type="button" class="btn btn-ghost ep-clickable" data-stock-receive>Оприходовать на склад</button>
        </div>
        <div class="ep-stock-hint">«Оприходовать» добавит докупленное на склад — после покупки нажми, и остатки обновятся.</div>
      </div>`;
  }

  function render() { if (view === "deficit") renderDeficit(); else renderStock(); }

  function shareDeficit() {
    const toBuy = deficitRows().filter(r => r.buy > 0);
    if (!toBuy.length) { flash("Докупать нечего — склада хватает"); return; }
    const text = "Докупить:\n" + toBuy.map((r, i) => `${i + 1}. ${r.name} — ${r.buy} ${r.unit}`).join("\n");
    try {
      if (navigator.share) navigator.share({ title: "Список докупки", text }).catch(() => {});
      else if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(text).then(() => flash("Скопировано")).catch(() => flash("Не удалось"));
      else flash("Поделиться недоступно");
    } catch (e) { flash("Поделиться недоступно"); }
  }
  function receiveDeficit() {
    const toBuy = deficitRows().filter(r => r.buy > 0);
    if (!toBuy.length) { flash("Докупать нечего"); return; }
    toBuy.forEach(r => receive(r.name, r.buy, r.unit));
    flash("Оприходовано: " + toBuy.length + " позиц.");
    renderDeficit();
  }

  document.addEventListener("input", (e) => {
    const t = e.target; if (!t || !t.getAttribute || !document.getElementById("ep-stock-root")) return;
    if (t.hasAttribute("data-stock-qty")) setQty(t.getAttribute("data-stock-qty"), t.value);
  });
  document.addEventListener("click", (e) => {
    const t = e.target; if (!t || !t.closest) return; let el;
    if ((el = t.closest("[data-stock-tab]"))) { view = el.getAttribute("data-stock-tab") === "deficit" ? "deficit" : "stock"; render(); return; }
    if ((el = t.closest("[data-stock-inc]"))) { addQty(el.getAttribute("data-stock-inc"), 1); renderStock(); return; }
    if ((el = t.closest("[data-stock-dec]"))) { addQty(el.getAttribute("data-stock-dec"), -1); renderStock(); return; }
    if ((el = t.closest("[data-stock-del]"))) { removeItem(el.getAttribute("data-stock-del")); renderStock(); return; }
    if (t.closest("[data-stock-add]")) {
      const root = document.getElementById("ep-stock-root"); if (!root) return;
      const name = root.querySelector("[data-stock-name]"), q = root.querySelector("[data-stock-newqty]"), u = root.querySelector("[data-stock-newunit]");
      if (name && name.value.trim()) { addItem({ name: name.value, qty: q ? q.value : 0, unit: u ? u.value : "" }); renderStock(); }
      else flash("Введи название");
      return;
    }
    if (t.closest("[data-stock-share]")) { shareDeficit(); return; }
    if (t.closest("[data-stock-receive]")) { receiveDeficit(); return; }
  });

  window.addEventListener("ep:route-loaded", (e) => { const r = e && e.detail && e.detail.route; if (r === "stock") { view = "stock"; render(); } });
  window.addEventListener("ep:estimate-main-changed", () => { if (document.getElementById("ep-stock-root") && view === "deficit") renderDeficit(); });
})();
