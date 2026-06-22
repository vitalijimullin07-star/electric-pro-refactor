/* Electric Pro V29 — Этап 10. Инструмент: инвентарь (цена, срок службы, дата, состояние, место),
   амортизация (цена / срок) и остаточная стоимость; «Списать амортизацию за месяц в затраты». */
(() => {
  "use strict";
  const KEY = "ep_tools_v29";
  const CONDS = [["new", "Новый"], ["work", "Рабочий"], ["repair", "Ремонт"], ["off", "Списан"]];
  const COND_LABEL = CONDS.reduce((a, [k, v]) => (a[k] = v, a), {});
  function read() { try { return JSON.parse(localStorage.getItem(KEY) || "[]") || []; } catch (e) { return []; } }
  function write(a) { try { localStorage.setItem(KEY, JSON.stringify(a || [])); } catch (e) {} syncPush(); }
  function uid() { return "t_" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6); }
  function num(v) { const n = Number(v); return isFinite(n) ? n : 0; }
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c])); }
  function money(v) { try { if (window.EPCurrency && EPCurrency.format) return EPCurrency.format(v); } catch (e) {} return num(v).toFixed(2) + " \u20bd"; }

  function getTools() { return read(); }
  function addTool(o) { const a = read(); const name = String(o && o.name || "").trim(); if (!name) return; a.push({ id: uid(), name, price: num(o.price), lifeMonths: num(o.lifeMonths) || 36, buyDate: o.buyDate || "", condition: o.condition || "work", location: o.location || "" }); write(a); }
  function setField(id, key, val) { const a = read(); const it = a.find(x => x.id === id); if (it) { it[key] = (key === "price" || key === "lifeMonths") ? num(val) : val; write(a); } }
  function removeTool(id) { write(read().filter(x => x.id !== id)); }
  window.EP = window.EP || {};
  EP.Tools = { getTools, addTool, setField, removeTool };

  function dep(t) { const life = num(t.lifeMonths) || 36; return num(t.price) / life; }
  function monthsSince(d) { if (!d) return 0; const dt = new Date(d); if (isNaN(dt.getTime())) return 0; const now = new Date(); return Math.max(0, (now.getFullYear() - dt.getFullYear()) * 12 + (now.getMonth() - dt.getMonth())); }
  function residual(t) { const acc = Math.min(num(t.price), dep(t) * monthsSince(t.buyDate)); return Math.max(0, num(t.price) - acc); }
  function wear(t) { if (!t.buyDate) return null; const life = num(t.lifeMonths) || 36; return Math.min(100, Math.round(monthsSince(t.buyDate) / life * 100)); }
  function totals() { const ts = read(); return { value: ts.reduce((s, t) => s + num(t.price), 0), perMonth: ts.reduce((s, t) => s + dep(t), 0), residual: ts.reduce((s, t) => s + residual(t), 0) }; }

  /* ---------- UI ---------- */
  function flash(msg) {
    try {
      let el = document.getElementById("ep-collector-flash");
      if (!el) { el = document.createElement("div"); el.id = "ep-collector-flash"; el.className = "ep-pick-flash"; document.body.appendChild(el); }
      el.textContent = msg; el.classList.add("show");
      clearTimeout(flash._t); flash._t = setTimeout(() => el && el.classList.remove("show"), 1800);
    } catch (e) {}
  }
  function render() {
    const root = document.getElementById("ep-tools-root"); if (!root) return;
    const ts = read().slice().sort((a, b) => String(a.name).localeCompare(String(b.name), "ru"));
    const tot = totals();
    const list = ts.length ? ts.map(t => {
      const w = wear(t);
      const opts = CONDS.map(([k, v]) => `<option value="${k}" ${t.condition === k ? "selected" : ""}>${v}</option>`).join("");
      return `
      <div class="ep-tool-row ${t.condition === "off" ? "off" : ""}">
        <div class="ep-tool-top">
          <div class="ep-tool-main">
            <div class="ep-tool-n">${esc(t.name)}</div>
            <div class="ep-tool-sub">${money(t.price)} · аморт ${money(dep(t))}/мес${w != null ? " · износ " + w + "%" : ""}</div>
          </div>
          <button type="button" class="ep-stock-del" data-tool-del="${t.id}">✕</button>
        </div>
        <div class="ep-tool-bot">
          <select data-tool-cond="${t.id}">${opts}</select>
          <input data-tool-loc="${t.id}" type="text" value="${esc(t.location)}" placeholder="где сейчас (дом/объект/помощник)">
        </div>
      </div>`;
    }).join("") : `<div class="ep-db-empty">Список инструмента пуст. Добавь свой инструмент.</div>`;
    root.innerHTML = `
      <div class="ep-tools">
        <div class="ep-cost-summary">
          <div class="ep-cost-sum-row"><span>Стоимость инструмента</span><b>${money(tot.value)}</b></div>
          <div class="ep-cost-sum-row"><span>Амортизация / мес</span><b>${money(tot.perMonth)}</b></div>
          <div class="ep-cost-sum-row mut"><span>Остаточная стоимость</span><b>${money(tot.residual)}</b></div>
        </div>
        <div class="ep-tool-add">
          <input data-tool-name type="text" placeholder="Инструмент (перфоратор Bosch)">
          <div class="ep-tool-add-r">
            <input data-tool-price type="number" inputmode="decimal" min="0" placeholder="цена">
            <input data-tool-life type="number" inputmode="numeric" min="1" placeholder="срок, мес">
            <input data-tool-date type="date" title="дата покупки">
            <button type="button" class="btn btn-primary ep-clickable" data-tool-add>＋</button>
          </div>
        </div>
        <div class="ep-tool-list">${list}</div>
        <div class="ep-prof-actions">
          <button type="button" class="btn btn-primary ep-clickable" data-tool-tocosts>Списать амортизацию за месяц в затраты</button>
          <button type="button" class="btn btn-ghost ep-clickable" data-route="main">На главный</button>
        </div>
        <div class="ep-stock-hint">Амортизация = цена ÷ срок службы. Кнопка добавит сумму месяца в «Затраты» (категория Инструмент).</div>
      </div>`;
  }

  document.addEventListener("input", (e) => {
    const t = e.target; if (!t || !t.getAttribute || !document.getElementById("ep-tools-root")) return;
    if (t.hasAttribute("data-tool-loc")) setField(t.getAttribute("data-tool-loc"), "location", t.value);
  });
  document.addEventListener("change", (e) => {
    const t = e.target; if (!t || !t.getAttribute || !document.getElementById("ep-tools-root")) return;
    if (t.hasAttribute("data-tool-cond")) { setField(t.getAttribute("data-tool-cond"), "condition", t.value); render(); }
  });
  document.addEventListener("click", (e) => {
    const t = e.target; if (!t || !t.closest) return; let el;
    if (t.closest("[data-tool-add]")) {
      const root = document.getElementById("ep-tools-root"); if (!root) return;
      const n = root.querySelector("[data-tool-name]"), p = root.querySelector("[data-tool-price]"), l = root.querySelector("[data-tool-life]"), d = root.querySelector("[data-tool-date]");
      if (n && n.value.trim()) { addTool({ name: n.value, price: p ? p.value : 0, lifeMonths: l ? l.value : 36, buyDate: d ? d.value : "" }); render(); }
      else flash("Введи название");
      return;
    }
    if ((el = t.closest("[data-tool-del]"))) { removeTool(el.getAttribute("data-tool-del")); render(); return; }
    if (t.closest("[data-tool-tocosts]")) {
      const tot = totals();
      if (!(tot.perMonth > 0)) { flash("Нет инструмента с амортизацией"); return; }
      if (window.EP && EP.Costs && EP.Costs.addActual) { EP.Costs.addActual("tools", Math.round(tot.perMonth * 100) / 100, "Амортизация инструмента за месяц"); flash("Амортизация за месяц добавлена в «Затраты»"); }
      else flash("Модуль «Затраты» недоступен");
      return;
    }
  });
  window.addEventListener("ep:route-loaded", (e) => { const r = e && e.detail && e.detail.route; if (r === "tools") render(); });

  // ---- облако (через общий EP.Cloud) ----
  function syncPush() { if (window.EP && window.EP.Cloud) window.EP.Cloud.push("tools", { items: read() }); }
  function syncPull() {
    if (!window.EP || !window.EP.Cloud) return;
    window.EP.Cloud.pull("tools").then(function (d) {
      if (!d || !Array.isArray(d.items)) return;
      write(window.EP.Cloud.mergeById(read(), d.items));
      if (document.getElementById("ep-tools-root")) render();
    });
  }
  if (window.EP && window.EP.Cloud && window.EP.Cloud.onLogin) window.EP.Cloud.onLogin(syncPull);
  window.EP = window.EP || {};
  window.EP.Tools = { getTools: getTools, syncPush: syncPush, syncPull: syncPull };
})();
