/* Electric Pro V29 — Инструмент: инвентарь + РЕСУРС инструмента.
   Технически сложный инструмент (АКБ/электро). Ресурс списывается по факту ПОСЛЕ сохранения сметы.
   Режимы ресурса:
     • material — по материалам (штроба: метры по Бетон/Кирпич/Панель/Мягкий; высверливание: шт);
     • hours    — по часам (часы прикидываются из часов работ сметы; пылесос = «уборка» = пыльные работы);
     • period   — по сроку (календарь, как раньше).
   Амортизация → «Затраты» (как раньше). Облако через общий EP.Cloud. */
(() => {
  "use strict";
  const KEY = "ep_tools_v29";
  const CONDS = [["new", "Новый"], ["work", "Рабочий"], ["repair", "Ремонт"], ["off", "Списан"]];
  const COND_LABEL = CONDS.reduce((a, [k, v]) => (a[k] = v, a), {});
  const MATS = ["Бетон", "Кирпич", "Панель", "Мягкий"];
  // нормы выработки (единиц в час) — для прикидки часов из сметы (редактируемо позже)
  const NORMS = [
    { re: /штроб/i, perHour: 10 },
    { re: /высверливани.{0,20}подрозетник|коронк/i, perHour: 8 },
    { re: /укладк.{0,4}кабел|проклад.{0,4}кабел|затягив/i, perHour: 30 },
    { re: /монтаж.{0,12}коробок|монтаж.{0,6}подрозетник|установочн.{0,8}коробок/i, perHour: 12 },
    { re: /внутренн.{0,4}точк|подключени.{0,12}розетк|выключател/i, perHour: 6 }
  ];
  const DEF_NORM = 8;

  function read() { try { return JSON.parse(localStorage.getItem(KEY) || "[]") || []; } catch (e) { return []; } }
  function write(a) { try { localStorage.setItem(KEY, JSON.stringify(a || [])); } catch (e) {} syncPush(); }
  function uid() { return "t_" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6); }
  function num(v) { const n = Number(v); return isFinite(n) ? n : 0; }
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c])); }
  function money(v) { try { if (window.EPCurrency && EPCurrency.format) return EPCurrency.format(v); } catch (e) {} return num(v).toFixed(2) + " \u20bd"; }

  function normTool(t) {
    t = t || {};
    return Object.assign({
      id: uid(), name: "", model: "", price: 0, buyDate: "", condition: "work", location: "",
      resMode: "period", workKind: "", unit: "м", cap: {}, hoursTotal: 0, used: 0, lifeMonths: 36, doneEstimates: []
    }, t);
  }

  function getTools() { return read(); }
  function addTool(o) {
    o = o || {}; const a = read(); const name = String(o.name || "").trim(); if (!name) return;
    a.push(normTool({ name: name, model: o.model || "", price: num(o.price), resMode: o.resMode || "period", lifeMonths: num(o.lifeMonths) || 36, buyDate: o.buyDate || "", condition: o.condition || "work" }));
    write(a);
  }
  function setField(id, key, val) {
    const a = read(); const it = a.find(x => x.id === id); if (!it) return;
    if (key === "price" || key === "lifeMonths" || key === "hoursTotal" || key === "used") it[key] = num(val);
    else it[key] = val;
    if (key === "workKind") it.unit = (val === "подрозетник") ? "шт" : "м";
    write(a);
  }
  function setCap(id, mat, val) { const a = read(); const it = a.find(x => x.id === id); if (!it) return; it.cap = it.cap || {}; it.cap[mat] = num(val); write(a); }
  function resetResource(id) { const a = read(); const it = a.find(x => x.id === id); if (it) { it.used = 0; it.doneEstimates = []; write(a); } }
  function removeTool(id) { write(read().filter(x => x.id !== id)); }

  // ---- разбор материала из названия работы ----
  function matOf(name) {
    const s = String(name || "").toLowerCase();
    if (/газобетон|пенобетон|пеноблок/.test(s)) return "Мягкий";
    if (/бетон/.test(s)) return "Бетон";
    if (/кирпич/.test(s)) return "Кирпич";
    if (/панел/.test(s)) return "Панель";
    if (/гипс|алебастр|мягк|дерев|гкл|газоблок/.test(s)) return "Мягкий";
    return null;
  }
  function normFor(name) { for (const n of NORMS) { if (n.re.test(name)) return n.perHour; } return DEF_NORM; }
  // часы для вида работ инструмента: "уборка" = пыльные работы, иначе все работы
  function hoursFor(items, kind) {
    let h = 0;
    (items || []).forEach(it => {
      if (it.type !== "work") return;
      const nm = String(it.name || "");
      let take = (kind === "уборка") ? /штроб|высверливани.{0,20}подрозетник|коронк|алмазн|сверлени/i.test(nm) : true;
      if (take) h += num(it.qty) / normFor(nm);
    });
    return h;
  }

  // ---- СПИСАНИЕ РЕСУРСА после сохранения сметы ----
  function consumeFromEstimate(items, estimateId) {
    if (!items || !items.length) return null;
    const a = read(); const report = [];
    a.forEach(t => {
      if (t.condition === "off") return;
      if (estimateId && (t.doneEstimates || []).indexOf(estimateId) >= 0) return; // один раз на смету
      let consumedPct = 0, info = "";
      if (t.resMode === "material") {
        const per = {};
        items.forEach(it => {
          if (it.type !== "work") return;
          const nm = String(it.name || "");
          let match = false;
          if (t.workKind === "штроба") match = /штроб/i.test(nm);
          else if (t.workKind === "подрозетник") match = /высверливани.{0,20}подрозетник|коронк|подрозетник/i.test(nm);
          if (!match) return;
          const m = matOf(nm); if (!m) return;
          const cap = num((t.cap || {})[m]); if (cap <= 0) return;
          consumedPct += num(it.qty) / cap * 100;
          per[m] = (per[m] || 0) + num(it.qty);
        });
        if (consumedPct > 0) { t.used = num(t.used) + consumedPct; info = Object.keys(per).map(k => Math.round(per[k] * 10) / 10 + (t.unit || "") + " " + k).join(", "); }
      } else if (t.resMode === "hours") {
        const h = hoursFor(items, t.workKind);
        if (h > 0) { t.used = num(t.used) + h; consumedPct = num(t.hoursTotal) > 0 ? h / num(t.hoursTotal) * 100 : 1; info = "~" + Math.round(h * 10) / 10 + " ч"; }
      }
      if (consumedPct > 0 || info) {
        if (estimateId) { t.doneEstimates = t.doneEstimates || []; t.doneEstimates.push(estimateId); }
        report.push({ name: t.name, info: info });
      }
    });
    write(a);
    return report;
  }

  // ---- износ / остаток ----
  function monthsSince(d) { if (!d) return 0; const dt = new Date(d); if (isNaN(dt.getTime())) return 0; const now = new Date(); return Math.max(0, (now.getFullYear() - dt.getFullYear()) * 12 + (now.getMonth() - dt.getMonth())); }
  function wearPct(t) {
    if (t.resMode === "material") return Math.min(100, Math.max(0, Math.round(num(t.used))));
    if (t.resMode === "hours") return num(t.hoursTotal) > 0 ? Math.min(100, Math.round(num(t.used) / num(t.hoursTotal) * 100)) : 0;
    const life = num(t.lifeMonths) || 36; return t.buyDate ? Math.min(100, Math.round(monthsSince(t.buyDate) / life * 100)) : 0;
  }
  function remainText(t) {
    const rem = 100 - wearPct(t);
    if (t.resMode === "hours") return num(t.hoursTotal) > 0 ? ("осталось ~" + Math.max(0, Math.round(num(t.hoursTotal) - num(t.used))) + " ч из " + num(t.hoursTotal)) : "задай ресурс в часах";
    if (t.resMode === "material") {
      const m = MATS.find(x => num((t.cap || {})[x]) > 0);
      if (m) { const left = Math.max(0, Math.round(num(t.cap[m]) * (rem / 100))); return "ресурс ~" + rem + "% (≈" + left + " " + (t.unit || "") + " по «" + m + "»)"; }
      return "задай, на сколько хватает";
    }
    return t.buyDate ? ("износ " + wearPct(t) + "% (срок " + (num(t.lifeMonths) || 36) + " мес)") : "укажи дату покупки";
  }
  function lowRes(t) { return (100 - wearPct(t)) <= 20 && (t.resMode !== "material" || MATS.some(x => num((t.cap || {})[x]) > 0)) && (t.resMode !== "hours" || num(t.hoursTotal) > 0); }

  // амортизация (как было) → затраты
  function dep(t) { const life = num(t.lifeMonths) || 36; return num(t.price) / life; }
  function residual(t) { const acc = Math.min(num(t.price), dep(t) * monthsSince(t.buyDate)); return Math.max(0, num(t.price) - acc); }
  function totals() { const ts = read(); return { value: ts.reduce((s, t) => s + num(t.price), 0), perMonth: ts.reduce((s, t) => s + dep(t), 0), residual: ts.reduce((s, t) => s + residual(t), 0) }; }

  window.EP = window.EP || {};
  EP.Tools = { getTools: getTools, addTool: addTool, setField: setField, setCap: setCap, resetResource: resetResource, removeTool: removeTool, consumeFromEstimate: consumeFromEstimate };

  /* ---------- UI ---------- */
  const expanded = {};
  function flash(msg) {
    try {
      let el = document.getElementById("ep-collector-flash");
      if (!el) { el = document.createElement("div"); el.id = "ep-collector-flash"; el.className = "ep-pick-flash"; document.body.appendChild(el); }
      el.textContent = msg; el.classList.add("show");
      clearTimeout(flash._t); flash._t = setTimeout(() => el && el.classList.remove("show"), 1800);
    } catch (e) {}
  }
  function cfgBlock(t) {
    const modeSel = `<label class="ep-tool-f"><span>Учёт ресурса</span><select data-tool-mode="${t.id}">
      <option value="period" ${t.resMode === "period" ? "selected" : ""}>по сроку (календарь)</option>
      <option value="material" ${t.resMode === "material" ? "selected" : ""}>по материалам (штроба / подрозетники)</option>
      <option value="hours" ${t.resMode === "hours" ? "selected" : ""}>по часам (из сметы)</option>
    </select></label>`;
    let body = "";
    if (t.resMode === "material") {
      body = `<label class="ep-tool-f"><span>Что делает</span><select data-tool-kind="${t.id}">
          <option value="штроба" ${t.workKind === "штроба" ? "selected" : ""}>Штробление (метры)</option>
          <option value="подрозетник" ${t.workKind === "подрозетник" ? "selected" : ""}>Высверливание подрозетников (шт)</option>
        </select></label>
        <div class="ep-tool-caps"><div class="ep-tool-caps-h">На сколько хватает (${esc(t.unit || "м")}):</div>
          ${MATS.map(m => `<label class="ep-tool-cap"><span>${m}</span><input data-tool-cap="${t.id}" data-mat="${m}" type="number" inputmode="numeric" min="0" value="${num((t.cap || {})[m]) || ""}" placeholder="0"></label>`).join("")}
        </div>`;
    } else if (t.resMode === "hours") {
      body = `<label class="ep-tool-f"><span>Ресурс, часов</span><input data-tool-hours="${t.id}" type="number" inputmode="numeric" min="0" value="${num(t.hoursTotal) || ""}" placeholder="напр. 300"></label>
        <label class="ep-tool-f"><span>Считать часы</span><select data-tool-kind="${t.id}">
          <option value="уборка" ${t.workKind === "уборка" ? "selected" : ""}>Уборка (штроба + сверление)</option>
          <option value="" ${!t.workKind ? "selected" : ""}>Все работы сметы</option>
        </select></label>`;
    } else {
      body = `<label class="ep-tool-f"><span>Срок, мес</span><input data-tool-life="${t.id}" type="number" inputmode="numeric" min="1" value="${num(t.lifeMonths) || 36}"></label>
        <label class="ep-tool-f"><span>Дата покупки</span><input data-tool-date="${t.id}" type="date" value="${esc(t.buyDate || "")}"></label>`;
    }
    return `<div class="ep-tool-cfg">${modeSel}${body}
      <button type="button" class="ep-tool-reset" data-tool-reset="${t.id}">↺ Сбросить ресурс (заменил инструмент)</button></div>`;
  }
  function render() {
    const root = document.getElementById("ep-tools-root"); if (!root) return;
    const ts = read().slice().sort((a, b) => String(a.name).localeCompare(String(b.name), "ru"));
    const tot = totals();
    const list = ts.length ? ts.map(t => {
      const w = wearPct(t), rem = 100 - w, low = lowRes(t);
      const opts = CONDS.map(([k, v]) => `<option value="${k}" ${t.condition === k ? "selected" : ""}>${v}</option>`).join("");
      const isExp = !!expanded[t.id];
      return `
      <div class="ep-tool-row ${t.condition === "off" ? "off" : ""}">
        <div class="ep-tool-top">
          <div class="ep-tool-main">
            <div class="ep-tool-n">${esc(t.name)}${t.model ? ` <small>${esc(t.model)}</small>` : ""}</div>
            <div class="ep-tool-sub">${money(t.price)} · аморт ${money(dep(t))}/мес</div>
            <div class="ep-tool-res ${low ? "low" : ""}">
              <div class="ep-tool-bar"><i style="width:${w}%"></i></div>
              <span class="ep-tool-restxt">${esc(remainText(t))}${low ? " · ⚠ скоро замена" : ""}</span>
            </div>
          </div>
          <button type="button" class="ep-stock-del" data-tool-del="${t.id}">✕</button>
        </div>
        <div class="ep-tool-bot">
          <select data-tool-cond="${t.id}">${opts}</select>
          <input data-tool-loc="${t.id}" type="text" value="${esc(t.location)}" placeholder="где сейчас (дом/объект/помощник)">
          <button type="button" class="ep-tool-exp" data-tool-expand="${t.id}">${isExp ? "▲ скрыть" : "⚙ ресурс"}</button>
        </div>
        ${isExp ? cfgBlock(t) : ""}
      </div>`;
    }).join("") : `<div class="ep-db-empty">Список инструмента пуст. Добавь технически сложный инструмент (АКБ/электро).</div>`;
    root.innerHTML = `
      <div class="ep-tools">
        <div class="ep-cost-summary">
          <div class="ep-cost-sum-row"><span>Стоимость инструмента</span><b>${money(tot.value)}</b></div>
          <div class="ep-cost-sum-row"><span>Амортизация / мес</span><b>${money(tot.perMonth)}</b></div>
          <div class="ep-cost-sum-row mut"><span>Остаточная стоимость</span><b>${money(tot.residual)}</b></div>
        </div>
        <div class="ep-tool-add">
          <input data-tool-name type="text" placeholder="Инструмент (штроборез Зубр)">
          <input data-tool-model type="text" placeholder="модель (необязательно)">
          <div class="ep-tool-add-r">
            <input data-tool-price type="number" inputmode="decimal" min="0" placeholder="цена">
            <select data-tool-newmode>
              <option value="material">по материалам</option>
              <option value="hours">по часам</option>
              <option value="period" selected>по сроку</option>
            </select>
            <button type="button" class="btn btn-primary ep-clickable" data-tool-add>＋</button>
          </div>
        </div>
        <div class="ep-tool-list">${list}</div>
        <div class="ep-prof-actions">
          <button type="button" class="btn btn-primary ep-clickable" data-tool-tocosts>Списать амортизацию за месяц в затраты</button>
          <button type="button" class="btn btn-ghost ep-clickable" data-route="main">На главный</button>
        </div>
        <div class="ep-stock-hint">Ресурс списывается сам после сохранения сметы (штробы и подрозетники из сметы → минус ресурс). «⚙ ресурс» — настроить, на сколько хватает.</div>
      </div>`;
  }

  document.addEventListener("input", (e) => {
    const t = e.target; if (!t || !t.getAttribute || !document.getElementById("ep-tools-root")) return;
    if (t.hasAttribute("data-tool-loc")) setField(t.getAttribute("data-tool-loc"), "location", t.value);
    else if (t.hasAttribute("data-tool-cap")) setCap(t.getAttribute("data-tool-cap"), t.getAttribute("data-mat"), t.value);
    else if (t.hasAttribute("data-tool-hours")) setField(t.getAttribute("data-tool-hours"), "hoursTotal", t.value);
    else if (t.hasAttribute("data-tool-life")) setField(t.getAttribute("data-tool-life"), "lifeMonths", t.value);
    else if (t.hasAttribute("data-tool-date")) setField(t.getAttribute("data-tool-date"), "buyDate", t.value);
  });
  document.addEventListener("change", (e) => {
    const t = e.target; if (!t || !t.getAttribute || !document.getElementById("ep-tools-root")) return;
    if (t.hasAttribute("data-tool-cond")) { setField(t.getAttribute("data-tool-cond"), "condition", t.value); render(); }
    else if (t.hasAttribute("data-tool-mode")) { setField(t.getAttribute("data-tool-mode"), "resMode", t.value); render(); }
    else if (t.hasAttribute("data-tool-kind")) { setField(t.getAttribute("data-tool-kind"), "workKind", t.value); render(); }
  });
  document.addEventListener("click", (e) => {
    const t = e.target; if (!t || !t.closest) return; let el;
    if (t.closest("[data-tool-add]")) {
      const root = document.getElementById("ep-tools-root"); if (!root) return;
      const n = root.querySelector("[data-tool-name]"), md = root.querySelector("[data-tool-model]"), p = root.querySelector("[data-tool-price]"), mode = root.querySelector("[data-tool-newmode]");
      if (n && n.value.trim()) { addTool({ name: n.value, model: md ? md.value : "", price: p ? p.value : 0, resMode: mode ? mode.value : "period" }); render(); }
      else flash("Введи название");
      return;
    }
    if ((el = t.closest("[data-tool-del]"))) { removeTool(el.getAttribute("data-tool-del")); render(); return; }
    if ((el = t.closest("[data-tool-expand]"))) { const id = el.getAttribute("data-tool-expand"); expanded[id] = !expanded[id]; render(); return; }
    if ((el = t.closest("[data-tool-reset]"))) { resetResource(el.getAttribute("data-tool-reset")); flash("Ресурс сброшен на 100%"); render(); return; }
    if (t.closest("[data-tool-tocosts]")) {
      const tot = totals();
      if (!(tot.perMonth > 0)) { flash("Нет инструмента с амортизацией"); return; }
      if (window.EP && EP.Costs && EP.Costs.addActual) { EP.Costs.addActual("tools", Math.round(tot.perMonth * 100) / 100, "Амортизация инструмента за месяц"); flash("Амортизация за месяц добавлена в «Затраты»"); }
      else flash("Модуль «Затраты» недоступен");
      return;
    }
  });
  window.addEventListener("ep:route-loaded", (e) => { const r = e && e.detail && e.detail.route; if (r === "tools") render(); });
  // списание ресурса инструмента после сохранения сметы
  window.addEventListener("ep:estimate-saved", function (e) {
    try {
      var est = e && e.detail && e.detail.estimate;
      if (est && est.items) {
        var rep = consumeFromEstimate(est.items, est.id);
        if (rep && rep.length && document.getElementById("ep-tools-root")) render();
      }
    } catch (er) {}
  });

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
  EP.Tools.syncPush = syncPush; EP.Tools.syncPull = syncPull;
})();
