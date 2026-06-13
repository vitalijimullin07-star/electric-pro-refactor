/* Electric Pro V29 — пикер материалов/работ (маршруты materials/work) + сводка предварительной сметы на главной.
   Читает каталог через EP.Database (активная база), кладёт позиции в EP.EstimateDraft. Без MutationObserver. */
(() => {
  "use strict";
  const TYPE_BY_ROUTE = { materials: "material", work: "work" };
  const expanded = {};        // состояние раскрытия папок: "type::category" -> bool
  let currentType = null;     // активный тип пикера (material/work)

  function DB() { return (window.EP && window.EP.Database) || null; }
  function Draft() { return (window.EP && window.EP.EstimateDraft) || null; }
  function activeBase() {
    try {
      const d = DB();
      if (d && d.getActiveDb) return d.getActiveDb() || "my";
    } catch (e) {}
    try { return localStorage.getItem("epdb26_active_base") || "my"; } catch (e) { return "my"; }
  }
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c])); }
  function money(v) {
    try { if (window.EPCurrency && window.EPCurrency.format) return window.EPCurrency.format(v); } catch (e) {}
    return (Number(v || 0).toFixed(2)) + " ₽";
  }

  /* ---------- пикер (materials / work) ---------- */
  function renderPicker(type) {
    const root = document.getElementById("ep-pick-root");
    if (!root || !type) return;
    const base = activeBase();
    const d = DB();
    const items = (d && d.getItemsByType) ? (d.getItemsByType(type, base) || []) : [];
    const draft = Draft();
    const count = draft ? draft.count() : 0;
    const total = draft ? draft.total() : 0;
    const baseLabel = base === "server" ? "база сервера" : "моя база";
    const otherLabel = base === "server" ? "моя база" : "база сервера";

    const cats = {};
    items.forEach(it => { const c = (it.category || "Без категории"); (cats[c] = cats[c] || []).push(it); });
    const catNames = Object.keys(cats).sort((a, b) => a.localeCompare(b, "ru"));

    const head = `
      <div class="ep-pick-head">
        <div class="ep-pick-row1">
          <div class="ep-pick-title">${type === "work" ? "🧰 Работа" : "📦 Материалы"}</div>
          <button type="button" class="ep-pick-base" data-pick-base>${esc(baseLabel)} ⇄</button>
        </div>
        <div class="ep-pick-sub">${items.length} поз. в базе · в смете: <b>${count}</b> · ${money(total)}</div>
        <div class="ep-pick-actions">
          <button type="button" class="ep-pick-btn primary" data-pick-estimate>Открыть смету (${count})</button>
          <button type="button" class="ep-pick-btn" data-route="main">На главный</button>
        </div>
      </div>`;

    let body;
    if (!items.length) {
      body = `<div class="ep-db-empty">В базе «${esc(baseLabel)}» нет позиций типа «${type === "work" ? "работа" : "материал"}».<br>
        Переключи базу кнопкой «${esc(otherLabel)} ⇄» или заполни каталог в разделе «База».
        <div style="margin-top:10px"><button type="button" class="ep-pick-btn" data-route="database">Открыть базу</button></div></div>`;
    } else {
      body = catNames.map(c => {
        const key = type + "::" + c;
        const open = !!expanded[key];
        const rows = cats[c].map(it => `
          <div class="ep-db-row">
            <div class="ep-db-row-main">
              <div class="ep-db-row-name">${esc(it.name)}</div>
              <div class="ep-db-row-meta">${esc(c)}${it.subcategory ? " · " + esc(it.subcategory) : ""}${it.unit ? " · " + esc(it.unit) : ""}</div>
            </div>
            <div class="ep-db-row-price">${money(it.price)}</div>
            <button type="button" class="ep-db-iconbtn ep-pick-add" data-pick-add="${esc(it.id)}" title="Добавить в смету">+</button>
          </div>`).join("");
        return `<div class="ep-db-folder ${open ? "is-open" : ""}">
          <div class="ep-db-folder-head" data-pick-folder="${esc(c)}"><span>📁 ${esc(c)}</span><span class="ep-db-count">${cats[c].length}</span></div>
          ${open ? `<div class="ep-db-list">${rows}</div>` : ""}
        </div>`;
      }).join("");
    }
    root.innerHTML = `<div class="ep-pick">${head}<div class="ep-pick-body">${body}</div></div>`;
  }

  function addToDraft(id) {
    const base = activeBase();
    const d = DB();
    const it = (d && d.getItems) ? d.getItems(base).find(x => x.id === id) : null;
    const draft = Draft();
    if (!it || !draft) return;
    draft.addItem({ sourceId: it.id, type: it.type, name: it.name, unit: it.unit, price: it.price, qty: 1, base, source: "picker" });
    flash("В смету: " + it.name);
    if (currentType) renderPicker(currentType);
  }

  function toggleBase() {
    const cur = activeBase();
    const next = cur === "server" ? "my" : "server";
    try { const d = DB(); if (d && d.setActiveDb) d.setActiveDb(next); else localStorage.setItem("epdb26_active_base", next); } catch (e) {}
    if (currentType) renderPicker(currentType);
  }

  /* ---------- сводка предварительной сметы на главной ---------- */
  function renderHomeSummary() {
    const draft = Draft();
    const items = draft ? draft.getItems() : [];
    const count = draft ? draft.count() : 0;
    const total = draft ? draft.total() : 0;
    const badge = document.querySelector("[data-est-badge]");
    if (badge) badge.textContent = count ? (count + " поз. · " + money(total)) : "Пока пусто";
    const list = document.querySelector("[data-est-list]");
    if (!list) return;
    if (!items.length) { list.innerHTML = ""; return; }
    const sub = (arr) => arr.reduce((s, x) => s + (Number(x.price) || 0) * (Number(x.qty) || 0), 0);
    const section = (title, arr) => arr.length ? `
      <div class="ep-est-section">
        <div class="ep-est-sec-h">${title} · ${money(sub(arr))}</div>
        ${arr.map(x => `
          <div class="ep-est-row">
            <div class="ep-est-name">${esc(x.name)}${x.unit ? ` <span class="ep-est-unit">${esc(x.unit)}</span>` : ""}</div>
            <div class="ep-est-qty">
              <button type="button" data-est-dec="${esc(x.id)}">−</button><b>${esc(x.qty)}</b><button type="button" data-est-inc="${esc(x.id)}">+</button>
            </div>
            <div class="ep-est-sum">${money((Number(x.price) || 0) * (Number(x.qty) || 0))}</div>
            <button type="button" class="ep-est-rm" data-est-remove="${esc(x.id)}" title="Убрать">✕</button>
          </div>`).join("")}
      </div>` : "";
    list.innerHTML =
      section("📦 Материалы", items.filter(x => x.type !== "work")) +
      section("🧰 Работа", items.filter(x => x.type === "work")) +
      `<div class="ep-est-total">Итого: <b>${money(total)}</b></div>`;
  }

  /* ---------- единый делегированный клик ---------- */
  document.addEventListener("click", (e) => {
    const t = e.target;
    let el;
    const root = document.getElementById("ep-pick-root");
    if (root && root.contains(t)) {
      if ((el = t.closest("[data-pick-folder]"))) { const k = currentType + "::" + el.dataset.pickFolder; expanded[k] = !expanded[k]; renderPicker(currentType); return; }
      if ((el = t.closest("[data-pick-add]"))) { addToDraft(el.dataset.pickAdd); return; }
      if ((el = t.closest("[data-pick-base]"))) { toggleBase(); return; }
      if ((el = t.closest("[data-pick-estimate]"))) { if (window.EP && window.EP.Router) window.EP.Router.go("estimate"); return; }
    }
    // кнопки блока «Предварительная смета» на главной
    if ((el = t.closest("[data-est-inc]"))) { const d = Draft(); if (d) { const it = d.getItems().find(x => x.id === el.dataset.estInc); if (it) d.setQty(it.id, (Number(it.qty) || 0) + 1); } return; }
    if ((el = t.closest("[data-est-dec]"))) { const d = Draft(); if (d) { const it = d.getItems().find(x => x.id === el.dataset.estDec); if (it) { const q = (Number(it.qty) || 0) - 1; if (q <= 0) d.removeItem(it.id); else d.setQty(it.id, q); } } return; }
    if ((el = t.closest("[data-est-remove]"))) { const d = Draft(); if (d) d.removeItem(el.dataset.estRemove); return; }
    if ((el = t.closest("[data-est-open]"))) { if (window.EP && window.EP.Router) window.EP.Router.go("estimate"); return; }
    if ((el = t.closest("[data-est-clear]"))) { const d = Draft(); if (d && (d.count() === 0 || confirm("Очистить предварительную смету?"))) { d.clear(); renderHomeSummary(); flash("Смета очищена"); } return; }
    if ((el = t.closest("[data-est-save]"))) { flash("Черновик сохранён"); if (window.EP && window.EP.Router) window.EP.Router.go("estimate"); return; }
  });

  /* ---------- тост ---------- */
  let flashEl;
  function flash(msg) {
    try {
      if (!flashEl) { flashEl = document.createElement("div"); flashEl.className = "ep-pick-flash"; document.body.appendChild(flashEl); }
      flashEl.textContent = msg; flashEl.classList.add("show");
      clearTimeout(flash._t); flash._t = setTimeout(() => flashEl && flashEl.classList.remove("show"), 1600);
    } catch (e) {}
  }

  /* ---------- монтаж по маршруту + живое обновление ---------- */
  window.addEventListener("ep:route-loaded", (e) => {
    const route = e && e.detail && e.detail.route;
    if (route === "materials" || route === "work") { currentType = TYPE_BY_ROUTE[route]; renderPicker(currentType); }
    else if (route === "main") { renderHomeSummary(); }
  });
  window.addEventListener("ep:estimate-draft-changed", () => {
    renderHomeSummary();
    if (currentType && document.getElementById("ep-pick-root")) renderPicker(currentType);
  });
})();
