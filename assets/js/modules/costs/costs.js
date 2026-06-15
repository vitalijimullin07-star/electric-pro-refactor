/* Electric Pro V29 — Этап 9. Затраты по проекту: доход (из сметы или вручную),
   план затрат (материалы по смете + прочее), факт (журнал реальных трат) → прибыль план/факт и маржа. */
(() => {
  "use strict";
  const KEY = "ep_costs_v29";
  const CATS = [["materials", "Материалы"], ["help", "Помощники"], ["transport", "Транспорт"], ["tools", "Инструмент"], ["other", "Прочее"]];
  const CAT_LABEL = CATS.reduce((a, [k, v]) => (a[k] = v, a), {});
  function Draft() { return (window.EP && EP.EstimateDraft) || null; }
  function read() { try { return JSON.parse(localStorage.getItem(KEY) || "{}") || {}; } catch (e) { return {}; } }
  function write(s) { try { localStorage.setItem(KEY, JSON.stringify(s)); } catch (e) {} }
  function num(v) { const n = Number(v); return isFinite(n) ? n : 0; }
  function uid() { return "c_" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6); }
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c])); }
  function money(v) { try { if (window.EPCurrency && EPCurrency.format) return EPCurrency.format(v); } catch (e) {} return num(v).toFixed(2) + " \u20bd"; }

  let st = null;
  function load() { if (st) return st; const s = read(); st = { income: s.income != null ? s.income : null, planExtra: num(s.planExtra), actuals: Array.isArray(s.actuals) ? s.actuals : [] }; return st; }
  function save() { load(); write({ income: st.income, planExtra: st.planExtra, actuals: st.actuals }); }

  function estimateTotal() { const d = Draft(); if (!d) return 0; return (d.getItems() || []).reduce((s, x) => s + num(x.price) * num(x.qty), 0); }
  function planMaterials() { const d = Draft(); if (!d) return 0; return (d.getItems() || []).filter(x => x.type === "material").reduce((s, x) => s + num(x.price) * num(x.qty), 0); }
  function income() { load(); return st.income != null ? num(st.income) : estimateTotal(); }
  function planTotal() { load(); return planMaterials() + num(st.planExtra); }
  function actualTotal() { load(); return st.actuals.reduce((s, x) => s + num(x.amount), 0); }
  function profitPlan() { return income() - planTotal(); }
  function profitFact() { return income() - actualTotal(); }

  function addActual(cat, amount, note) { load(); const a = num(amount); if (a <= 0) return false; st.actuals.push({ id: uid(), cat: cat || "other", amount: a, note: note || "" }); save(); return true; }

  window.EP = window.EP || {};
  EP.Costs = { income, planTotal, actualTotal, profitPlan, profitFact, addActual };

  /* ---------- UI ---------- */
  function summaryHtml() {
    const inc = income(), pp = profitPlan(), pf = profitFact();
    const margin = inc > 0 ? Math.round(pf / inc * 100) : 0;
    const cls = v => v >= 0 ? "pos" : "neg";
    return `
      <div class="ep-cost-sum-row"><span>Доход</span><b>${money(inc)}</b></div>
      <div class="ep-cost-sum-row"><span>Прибыль (план)</span><b class="${cls(pp)}">${money(pp)}</b></div>
      <div class="ep-cost-sum-row"><span>Прибыль (факт)</span><b class="${cls(pf)}">${money(pf)}</b></div>
      <div class="ep-cost-sum-row mut"><span>Маржа (факт)</span><b>${margin}%</b></div>`;
  }
  function render() {
    const root = document.getElementById("ep-costs-root"); if (!root) return;
    load();
    const acts = st.actuals.slice();
    const actList = acts.length ? acts.map(a => `
      <div class="ep-cost-row">
        <div class="ep-cost-cat">${esc(CAT_LABEL[a.cat] || "Прочее")}</div>
        <div class="ep-cost-note">${esc(a.note || "")}</div>
        <div class="ep-cost-amt">${money(a.amount)}</div>
        <button type="button" class="ep-stock-del" data-cost-del="${a.id}">✕</button>
      </div>`).join("") : `<div class="ep-db-empty">Пока нет фактических трат. Добавляй по мере расходов.</div>`;
    const catOpts = CATS.map(([k, v]) => `<option value="${k}">${v}</option>`).join("");
    root.innerHTML = `
      <div class="ep-costs">
        <div class="ep-cost-summary" id="ep-costs-summary">${summaryHtml()}</div>

        <div class="ep-cons-sec">
          <div class="ep-cons-h">Доход проекта</div>
          <div class="ep-cost-income">
            <input data-cost-income type="number" inputmode="decimal" min="0" value="${income()}">
            <button type="button" class="btn btn-ghost ep-clickable" data-cost-fromest>Из сметы</button>
          </div>
          <div class="ep-stock-hint">Сумма, которую платит заказчик. «Из сметы» подставит итог сметы; можно вписать договорную.</div>
        </div>

        <div class="ep-cons-sec">
          <div class="ep-cons-h">План затрат</div>
          <div class="ep-cost-prow"><span>Материалы (по смете)</span><b>${money(planMaterials())}</b></div>
          <label class="ep-prof-f"><span>Прочее (план): транспорт, помощники…</span><input data-cost-planextra type="number" inputmode="decimal" min="0" value="${num(st.planExtra)}"></label>
          <div class="ep-cost-prow tot"><span>Итого план</span><b>${money(planTotal())}</b></div>
        </div>

        <div class="ep-cons-sec">
          <div class="ep-cons-h">Факт затрат</div>
          <div class="ep-cost-add">
            <select data-cost-newcat>${catOpts}</select>
            <input data-cost-newamt type="number" inputmode="decimal" min="0" placeholder="сумма">
            <button type="button" class="btn btn-primary ep-clickable" data-cost-add>＋</button>
            <input data-cost-newnote type="text" placeholder="комментарий">
          </div>
          <div class="ep-cost-list">${actList}</div>
          <div class="ep-cost-prow tot"><span>Итого факт</span><b>${money(actualTotal())}</b></div>
          <div class="ep-cost-prow ${actualTotal() - planTotal() > 0 ? "over" : ""}"><span>Отклонение факт − план</span><b>${(actualTotal() - planTotal() >= 0 ? "+" : "") + money(actualTotal() - planTotal())}</b></div>
        </div>
        <div class="ep-prof-actions"><button type="button" class="btn btn-ghost ep-clickable" data-route="main">На главный</button></div>
      </div>`;
  }
  function updateSummary() { const el = document.getElementById("ep-costs-summary"); if (el) el.innerHTML = summaryHtml(); }
  function flash(msg) {
    try {
      let el = document.getElementById("ep-collector-flash");
      if (!el) { el = document.createElement("div"); el.id = "ep-collector-flash"; el.className = "ep-pick-flash"; document.body.appendChild(el); }
      el.textContent = msg; el.classList.add("show");
      clearTimeout(flash._t); flash._t = setTimeout(() => el && el.classList.remove("show"), 1800);
    } catch (e) {}
  }

  document.addEventListener("input", (e) => {
    const t = e.target; if (!t || !t.hasAttribute || !document.getElementById("ep-costs-root")) return;
    load();
    if (t.hasAttribute("data-cost-income")) { st.income = t.value === "" ? null : num(t.value); save(); updateSummary(); }
    else if (t.hasAttribute("data-cost-planextra")) { st.planExtra = num(t.value); save(); updateSummary(); }
  });
  document.addEventListener("change", (e) => {
    const t = e.target; if (!t || !t.hasAttribute || !document.getElementById("ep-costs-root")) return;
    if (t.hasAttribute("data-cost-planextra")) render(); // обновить «итого план»
  });
  document.addEventListener("click", (e) => {
    const t = e.target; if (!t || !t.closest) return; let el;
    if (t.closest("[data-cost-fromest]")) { load(); st.income = estimateTotal(); save(); render(); return; }
    if (t.closest("[data-cost-add]")) {
      const root = document.getElementById("ep-costs-root"); if (!root) return;
      const cat = root.querySelector("[data-cost-newcat]"), amt = root.querySelector("[data-cost-newamt]"), note = root.querySelector("[data-cost-newnote]");
      const a = num(amt && amt.value);
      if (a <= 0) { flash("Введи сумму"); return; }
      load(); st.actuals.push({ id: uid(), cat: (cat && cat.value) || "other", amount: a, note: (note && note.value) || "" }); save(); render();
      return;
    }
    if ((el = t.closest("[data-cost-del]"))) { load(); st.actuals = st.actuals.filter(x => x.id !== el.getAttribute("data-cost-del")); save(); render(); return; }
  });

  window.addEventListener("ep:route-loaded", (e) => { const r = e && e.detail && e.detail.route; if (r === "costs") render(); });
  window.addEventListener("ep:estimate-draft-changed", () => { if (document.getElementById("ep-costs-root")) updateSummary(); });
})();
