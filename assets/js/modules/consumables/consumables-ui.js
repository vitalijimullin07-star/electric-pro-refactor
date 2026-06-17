/* Electric Pro V29 — Экран расходников: калькулятор + редактор материалов.
   Рендер в #ep-consum-root на ep:route-loaded(consumables). Чистый V29 (без stopImmediatePropagation).
   Движок: EP.CableConsum. Результат → EP.EstimateDraft (source "consum"). */
(() => {
  "use strict";
  const UIKEY = "ep_consum_ui_v29";
  const n = (v, f = 0) => (Number.isFinite(Number(v)) ? Number(v) : f);
  const esc = v => String(v == null ? "" : v).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" }[c]));

  const DEF_UI = { surface: "ceil", gofra: false, material: "", depth: "small", cableM: 0, strobeM: 0, sockets: 0, boxes: 0, logicOpen: false };
  let ui = null, lastItems = [];

  function CC() { return window.EP && window.EP.CableConsum ? window.EP.CableConsum : null; }
  function Draft() { return window.EP && window.EP.EstimateDraft ? window.EP.EstimateDraft : null; }

  function loadUI() {
    let s = {};
    try { s = JSON.parse(localStorage.getItem(UIKEY) || "{}") || {}; } catch (e) {}
    ui = Object.assign({}, DEF_UI, s);
    const cc = CC();
    if (!ui.material && cc) ui.material = (cc.materials()[0] || "");
  }
  function saveUI() { try { localStorage.setItem(UIKEY, JSON.stringify(ui)); } catch (e) {} }

  // Кабель из предварительной сметы (позиции-кабель), сумма метража
  function cableFromEstimate() {
    try {
      const d = Draft(); if (!d || !d.getItems) return 0;
      const re = /кабель|ввг|nym|нym|пвс|шввп|швввп|провод|сип|ппв|кввг|ввгнг/i;
      let m = 0;
      d.getItems().forEach(it => { if (re.test(it.name || "")) m += n(it.qty); });
      return Math.round(m);
    } catch (e) { return 0; }
  }
  // Подрозетники из пула (best-effort: сумма механизмов × рамки)
  function poolPodroz() {
    try {
      const P = window.PoolV22CleanMonolith; const st = P && P.state ? P.state() : null;
      if (!st) return null;
      let per = 0; ["sockets", "switches", "pass", "cross", "tv", "floorReg"].forEach(k => per += n(st[k]));
      const frames = n(st.framesQty, 1) || 1;
      return per * frames;
    } catch (e) { return null; }
  }

  function btnRow(label, opts, attr, cur) {
    return `<div class="ep-cs-field"><span class="ep-cs-lab">${label}</span><div class="ep-cs-seg">` +
      opts.map(([v, t]) => `<button type="button" data-${attr}="${v}" class="${cur === v ? "active" : ""}">${t}</button>`).join("") +
      `</div></div>`;
  }
  function numField(label, key, val, unit) {
    return `<div class="ep-cs-field"><span class="ep-cs-lab">${label}${unit ? ` <i>${unit}</i>` : ""}</span>` +
      `<input class="ep-cs-num" type="number" inputmode="decimal" min="0" data-cs-num="${key}" value="${n(val)}" /></div>`;
  }

  function render() {
    const root = document.getElementById("ep-consum-root");
    if (!root) return;
    const cc = CC();
    if (!cc) { root.innerHTML = `<div class="card"><p>Движок расходников не загружен.</p></div>`; return; }
    const mats = cc.materials();
    if (!ui.material || mats.indexOf(ui.material) < 0) ui.material = mats[0] || "";

    const matOpts = mats.map(m => `<option value="${esc(m)}" ${ui.material === m ? "selected" : ""}>${esc(m)}</option>`).join("");
    const resultHtml = lastItems.length
      ? `<div class="ep-cs-result"><div class="ep-cs-rhead">Расходка (${lastItems.length} поз.)</div>` +
        lastItems.map(it => `<div class="ep-cs-row"><span>${esc(it.name)}</span><b>${it.qty} ${esc(it.unit)}</b></div>`).join("") +
        `<button type="button" class="btn btn-primary ep-clickable ep-cs-add" data-cs-add>➕ Добавить в предварительную</button></div>`
      : `<div class="ep-cs-hint">Заполни данные и нажми «Рассчитать».</div>`;

    const L = cc.get();
    const matRows = mats.map(m => {
      const o = L.materials[m] || {};
      return `<div class="ep-cs-matrow">
        <input class="ep-cs-mname" data-cs-mname="${esc(m)}" value="${esc(m)}" />
        <button type="button" class="ep-cs-hard ${o.hard ? "active" : ""}" data-cs-hard="${esc(m)}">${o.hard ? "твёрдый" : "мягкий"}</button>
        <label>диск<input class="ep-cs-mnum" type="number" min="0" data-cs-disc="${esc(m)}" value="${n(o.discM)}" /><i>м/шт</i></label>
        <label>коронка<input class="ep-cs-mnum" type="number" min="0" data-cs-core="${esc(m)}" value="${n(o.coreN)}" /><i>отв/шт</i></label>
        <button type="button" class="ep-cs-mdel" data-cs-mdel="${esc(m)}">✕</button>
      </div>`;
    }).join("");

    root.innerHTML = `
      <div class="ep-cs-shell">
        <section class="card ep-cs-card">
          ${btnRow("Поверхность", [["ceil", "Потолок"], ["floor", "Пол"]], "cs-surface", ui.surface)}
          ${ui.surface === "ceil" ? btnRow("Гофра", [["0", "Нет"], ["1", "Да"]], "cs-gofra", ui.gofra ? "1" : "0") : `<div class="ep-cs-note">По полу — всегда гофра ПНД, лента, без клипс.</div>`}
          <div class="ep-cs-field"><span class="ep-cs-lab">Материал</span><select class="ep-cs-sel" data-cs-material>${matOpts}</select></div>
          ${btnRow("Размер штробы", [["small", "≤30 мм (диск 125)"], ["big", "30–55 мм (диск 150)"]], "cs-depth", ui.depth)}
        </section>

        <section class="card ep-cs-card">
          ${numField("Кабель", "cableM", ui.cableM, "м")}
          ${numField("Штроба", "strobeM", ui.strobeM, "м")}
          ${numField("Подрозетники", "sockets", ui.sockets, "шт")}
          ${numField("Распайки", "boxes", ui.boxes, "шт")}
          <div class="ep-cs-pulls">
            <button type="button" class="ep-cs-pull" data-cs-pull-cable>⤵ Кабель из материалов</button>
            <button type="button" class="ep-cs-pull" data-cs-pull-pool>⤵ Подрозетники из пула</button>
          </div>
          <button type="button" class="btn btn-primary ep-clickable ep-cs-calc" data-cs-calc>🧮 Рассчитать</button>
        </section>

        ${resultHtml}

        <section class="card ep-cs-card">
          <button type="button" class="ep-cs-logic-toggle" data-cs-logic-toggle>${ui.logicOpen ? "▾" : "▸"} ⚙ Логика расходников — материалы</button>
          <div class="ep-cs-logic ${ui.logicOpen ? "" : "hidden"}">
            <div class="ep-cs-mhint">Ресурс дисков и коронок по материалу — впиши свои значения.</div>
            ${matRows}
            <button type="button" class="ep-cs-madd" data-cs-madd>+ материал</button>
            <div class="ep-cs-logic-actions">
              <button type="button" class="ep-cs-reset" data-cs-reset>Сбросить нормы</button>
            </div>
          </div>
        </section>
      </div>`;
  }

  function setNum(key, val) { ui[key] = Math.max(0, n(val)); saveUI(); }

  function doCalc() {
    const cc = CC(); if (!cc) return;
    lastItems = cc.calc({
      cableM: ui.cableM, strobeM: ui.strobeM, sockets: ui.sockets, boxes: ui.boxes,
      surface: ui.surface, gofra: !!ui.gofra, material: ui.material, depth: ui.depth
    });
    render();
  }

  function addToEstimate() {
    const d = Draft(); if (!d || !lastItems.length) return;
    const list = lastItems.map((it, i) => ({
      id: "consum_" + i + "_" + (it.name || "").slice(0, 12).replace(/\s+/g, "_"),
      sourceId: "consum_" + i, type: "material", name: it.name, unit: it.unit || "шт",
      price: 0, qty: n(it.qty, 1), base: "consum", source: "consum"
    }));
    if (d.setSourceItems) d.setSourceItems("consum", list);
    else list.forEach(x => d.addItem && d.addItem(x));
    const btn = document.querySelector("[data-cs-add]");
    if (btn) { btn.textContent = "✓ Добавлено в предварительную"; setTimeout(() => { if (btn) btn.textContent = "➕ Добавить в предварительную"; }, 1800); }
  }

  // редактирование материалов
  function patchMat(name, field, value) {
    const cc = CC(); if (!cc) return;
    const L = cc.get();
    if (!L.materials[name]) L.materials[name] = { hard: true, discM: 60, coreN: 15 };
    if (field === "hard") L.materials[name].hard = !L.materials[name].hard;
    else if (field === "discM") L.materials[name].discM = Math.max(0, n(value));
    else if (field === "coreN") L.materials[name].coreN = Math.max(0, n(value));
    cc.set(L);
  }
  function renameMat(oldName, newName) {
    const cc = CC(); if (!cc) return;
    newName = String(newName || "").trim(); if (!newName || newName === oldName) return;
    const L = cc.get();
    if (L.materials[oldName] && !L.materials[newName]) { L.materials[newName] = L.materials[oldName]; delete L.materials[oldName]; cc.set(L); if (ui.material === oldName) { ui.material = newName; saveUI(); } }
  }
  function addMat() {
    const cc = CC(); if (!cc) return; const L = cc.get();
    let base = "Материал", name = base, i = 1; while (L.materials[name]) name = base + " " + (++i);
    L.materials[name] = { hard: true, discM: 60, coreN: 15 }; cc.set(L); render();
  }
  function delMat(name) {
    const cc = CC(); if (!cc) return; const L = cc.get();
    if (Object.keys(L.materials).length <= 1) return;
    delete L.materials[name]; cc.set(L); if (ui.material === name) ui.material = Object.keys(L.materials)[0] || ""; saveUI(); render();
  }

  function onClick(e) {
    const t = e.target; if (!t || !t.closest) return;
    if (!t.closest("#ep-consum-root")) return;
    let el;
    if (el = t.closest("[data-cs-surface]")) { ui.surface = el.dataset.csSurface; if (ui.surface === "floor") ui.gofra = true; saveUI(); render(); return; }
    if (el = t.closest("[data-cs-gofra]")) { ui.gofra = el.dataset.csGofra === "1"; saveUI(); render(); return; }
    if (el = t.closest("[data-cs-depth]")) { ui.depth = el.dataset.csDepth; saveUI(); render(); return; }
    if (t.closest("[data-cs-calc]")) { doCalc(); return; }
    if (t.closest("[data-cs-add]")) { addToEstimate(); return; }
    if (t.closest("[data-cs-pull-cable]")) { ui.cableM = cableFromEstimate(); saveUI(); render(); return; }
    if (t.closest("[data-cs-pull-pool]")) { const p = poolPodroz(); if (p != null) { ui.sockets = p; saveUI(); render(); } return; }
    if (t.closest("[data-cs-logic-toggle]")) { ui.logicOpen = !ui.logicOpen; saveUI(); render(); return; }
    if (el = t.closest("[data-cs-hard]")) { patchMat(el.dataset.csHard, "hard"); render(); return; }
    if (el = t.closest("[data-cs-mdel]")) { delMat(el.dataset.csMdel); return; }
    if (t.closest("[data-cs-madd]")) { addMat(); return; }
    if (t.closest("[data-cs-reset]")) { const cc = CC(); if (cc) { cc.reset(); render(); } return; }
  }
  function onChange(e) {
    const t = e.target; if (!t || !t.closest || !t.closest("#ep-consum-root")) return;
    if (t.dataset && t.dataset.csNum) { setNum(t.dataset.csNum, t.value); return; }
    if (t.dataset && t.dataset.csMaterial != null && t.tagName === "SELECT") { ui.material = t.value; saveUI(); return; }
    if (t.hasAttribute && t.hasAttribute("data-cs-material")) { ui.material = t.value; saveUI(); return; }
    if (t.dataset && t.dataset.csDisc) { patchMat(t.dataset.csDisc, "discM", t.value); return; }
    if (t.dataset && t.dataset.csCore) { patchMat(t.dataset.csCore, "coreN", t.value); return; }
    if (t.dataset && t.dataset.csMname) { renameMat(t.dataset.csMname, t.value); return; }
  }

  document.addEventListener("click", onClick);
  document.addEventListener("change", onChange);
  window.addEventListener("ep:route-loaded", (e) => {
    const route = e && e.detail && e.detail.route;
    if (route !== "consumables") return;
    loadUI();
    if (!ui.cableM) ui.cableM = cableFromEstimate();
    lastItems = [];
    setTimeout(render, 30);
  });

  window.EP = window.EP || {};
  window.EP.ConsumablesUI = { render, calc: doCalc };
})();
