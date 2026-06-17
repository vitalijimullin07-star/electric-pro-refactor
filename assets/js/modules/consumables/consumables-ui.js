/* Electric Pro V29 — Экран расходников: калькулятор + полный редактор норм.
   Материал берётся из пула (state.wallMaterial). Движок: EP.CableConsum. → EP.EstimateDraft (source "consum"). */
(() => {
  "use strict";
  const UIKEY = "ep_consum_ui_v29";
  const n = (v, f = 0) => (Number.isFinite(Number(v)) ? Number(v) : f);
  const esc = v => String(v == null ? "" : v).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" }[c]));
  const getP = (o, p) => p.split(".").reduce((a, k) => (a && a[k] != null ? a[k] : undefined), o);
  function setP(o, p, val) { const ks = p.split("."); let a = o; for (let i = 0; i < ks.length - 1; i++) { if (typeof a[ks[i]] !== "object" || a[ks[i]] == null) a[ks[i]] = {}; a = a[ks[i]]; } a[ks[ks.length - 1]] = val; }

  const DEF_UI = { surface: "ceil", gofra: false, depth: "small", crownSize: "76", wet: false, cableM: 0, strobeM: 0, sockets: 0, boxes: 0, material: "", logicOpen: false };
  let ui = null, lastItems = [];

  function CC() { return window.EP && window.EP.CableConsum ? window.EP.CableConsum : null; }
  function Draft() { return window.EP && window.EP.EstimateDraft ? window.EP.EstimateDraft : null; }

  function loadUI() { let s = {}; try { s = JSON.parse(localStorage.getItem(UIKEY) || "{}") || {}; } catch (e) {} ui = Object.assign({}, DEF_UI, s); }
  function saveUI() { try { localStorage.setItem(UIKEY, JSON.stringify(ui)); } catch (e) {} }

  function cableFromEstimate() {
    try {
      const d = Draft(); if (!d || !d.getItems) return 0;
      const re = /кабель|ввг|nym|пвс|шввп|швввп|провод|сип|ппв|кввг|ввгнг/i;
      let m = 0; d.getItems().forEach(it => { if (re.test(it.name || "")) m += n(it.qty); });
      return Math.round(m);
    } catch (e) { return 0; }
  }
  function poolState() { try { const P = window.PoolV22CleanMonolith; return P && P.state ? P.state() : null; } catch (e) { return null; } }
  function poolMaterial() { const st = poolState(); return st && st.wallMaterial ? st.wallMaterial : ""; }
  function poolDraft() { try { const P = window.PoolV22CleanMonolith; if (!P || !P.draft) return []; if (P.buildDraft) P.buildDraft(); return P.draft() || []; } catch (e) { return []; } }
  function poolStrobe() { let m = 0; poolDraft().forEach(r => { if (/штроблен/i.test(r.name || "")) m += n(r.qty); }); return Math.round(m); }
  function poolPodroz() { let c = 0; poolDraft().forEach(r => { if (r.type === "material" && /подрозетник/i.test(r.name || "")) c += n(r.qty); }); return c; }
  function poolBoxes() { let c = 0; poolDraft().forEach(r => { if (r.type === "material" && /распайк|распаяч/i.test(r.name || "")) c += n(r.qty); }); return c; }

  function seg(label, opts, attr, cur) {
    return `<div class="ep-cs-field"><span class="ep-cs-lab">${label}</span><div class="ep-cs-seg">` +
      opts.map(([v, t]) => `<button type="button" data-${attr}="${v}" class="${cur === v ? "active" : ""}">${t}</button>`).join("") + `</div></div>`;
  }
  function num(label, key, val, unit) {
    return `<div class="ep-cs-field"><span class="ep-cs-lab">${label}${unit ? ` <i>${unit}</i>` : ""}</span><input class="ep-cs-num" type="number" inputmode="decimal" min="0" data-cs-num="${key}" value="${n(val)}" /></div>`;
  }
  function cfg(L, label, path, unit) {
    return `<label class="ep-cs-cfg"><span>${label}${unit ? ` <i>${unit}</i>` : ""}</span><input type="number" min="0" step="any" data-cfg="${path}" value="${n(getP(L, path))}" /></label>`;
  }

  function render() {
    const root = document.getElementById("ep-consum-root"); if (!root) return;
    const cc = CC(); if (!cc) { root.innerHTML = `<div class="card"><p>Движок расходников не загружен.</p></div>`; return; }
    const mats = cc.materials();
    const pm = poolMaterial();
    ui.material = pm || ui.material || mats[0] || "Бетон";

    const result = lastItems.length
      ? `<div class="ep-cs-result"><div class="ep-cs-rhead">Расходка (${lastItems.length} поз.)</div>` +
        lastItems.map(it => `<div class="ep-cs-row"><span>${esc(it.name)}</span><b>${it.qty} ${esc(it.unit)}</b></div>`).join("") +
        `<button type="button" class="btn btn-primary ep-clickable ep-cs-add" data-cs-add>➕ Добавить в предварительную</button></div>`
      : `<div class="ep-cs-hint">Заполни данные и нажми «Рассчитать».</div>`;

    const L = cc.get();
    const matRows = mats.map(m => {
      const o = L.materials[m] || {};
      return `<div class="ep-cs-matrow">
        <div class="ep-cs-mtop"><b>${esc(m)}</b>
          <button type="button" class="ep-cs-hard ${o.hard ? "active" : ""}" data-cs-hard="${esc(m)}">${o.hard ? "твёрдый" : "мягкий"}</button></div>
        <div class="ep-cs-mline"><span>диски:</span>
          ${cfg(L, "125", "materials." + m + ".disc.125", "м")}
          ${cfg(L, "150", "materials." + m + ".disc.150", "м")}</div>
        <div class="ep-cs-mline"><span>коронки:</span>
          ${cfg(L, "52", "materials." + m + ".crown.52", "отв")}
          ${cfg(L, "76", "materials." + m + ".crown.76", "отв")}
          ${cfg(L, "82", "materials." + m + ".crown.82", "отв")}</div>
      </div>`;
    }).join("");

    root.innerHTML = `
      <div class="ep-cs-shell">
        <section class="card ep-cs-card">
          ${seg("Поверхность", [["ceil", "Потолок"], ["floor", "Пол"]], "cs-surface", ui.surface)}
          ${ui.surface === "ceil" ? seg("Гофра", [["0", "Нет"], ["1", "Да"]], "cs-gofra", ui.gofra ? "1" : "0") : `<div class="ep-cs-note">По полу — всегда гофра ПНД, лента, без клипс.</div>`}
          <div class="ep-cs-field"><span class="ep-cs-lab">Материал стен</span>
            <div class="ep-cs-matshow">${pm ? esc(pm) : esc(ui.material) + " <i>(в пуле не задан — задай там)</i>"} <span class="ep-cs-frompool">из пула розеток</span></div></div>
          ${seg("Размер штробы (диск)", [["small", "≤30 → 125"], ["big", "30–55 → 150"]], "cs-depth", ui.depth)}
          ${seg("Коронка", [["52", "52 мм"], ["76", "76 мм"], ["82", "82 мм"]], "cs-crown", ui.crownSize)}
          ${seg("Рез", [["0", "Насухо"], ["1", "С водой"]], "cs-wet", ui.wet ? "1" : "0")}
        </section>

        <section class="card ep-cs-card">
          ${num("Кабель", "cableM", ui.cableM, "м")}
          ${num("Штроба", "strobeM", ui.strobeM, "м")}
          ${num("Подрозетники", "sockets", ui.sockets, "шт")}
          ${num("Распайки", "boxes", ui.boxes, "шт")}
          <div class="ep-cs-pulls">
            <button type="button" class="ep-cs-pull" data-cs-pull-cable>⤵ Кабель из материалов</button>
            <button type="button" class="ep-cs-pull" data-cs-pull-pool>⤵ Штроба + подрозетники из пула</button>
          </div>
          <button type="button" class="btn btn-primary ep-clickable ep-cs-calc" data-cs-calc>🧮 Рассчитать</button>
        </section>

        ${result}

        <section class="card ep-cs-card">
          <button type="button" class="ep-cs-logic-toggle" data-cs-logic-toggle>${ui.logicOpen ? "▾" : "▸"} ⚙ Логика расходников</button>
          <div class="ep-cs-logic ${ui.logicOpen ? "" : "hidden"}">
            <div class="ep-cs-sub">Материалы — ресурс дисков и коронок</div>
            ${matRows}
            <div class="ep-cs-sub">Крепёж (на метр кабеля)</div>
            <div class="ep-cs-grid">
              ${cfg(L, "Площадки/м", "direct.pads")}
              ${cfg(L, "Стяжки/м", "direct.ties")}
              ${cfg(L, "Прямой: гвоздь+выстрел /м", "direct.perM")}
              ${cfg(L, "Гофра: клипсы /м", "gofraCeil.clips")}
              ${cfg(L, "Пол: гвоздь+выстрел /м", "floor.perM")}
              ${cfg(L, "Пол: лента /м", "floor.tapePerM", "м")}
              ${cfg(L, "Лента: рулон", "floor.tapeRollM", "м")}
              ${cfg(L, "Распайка: гвоздь+выстрел", "junction.perBox")}
            </div>
            <div class="ep-cs-sub">Упаковки и округления</div>
            <div class="ep-cs-grid">
              ${cfg(L, "Гвозди: пачка", "packs.nails", "шт")}
              ${cfg(L, "Гвозди: допуск", "packs.nailsTol", "шт")}
              ${cfg(L, "Выстрелы: баллон", "packs.shots")}
              ${cfg(L, "Выстрелы: допуск", "packs.shotsTol")}
              ${cfg(L, "Стяжки: пачка", "packs.ties", "шт")}
              ${cfg(L, "Площадки: пачка", "packs.pads", "шт")}
              ${cfg(L, "Гофра: округл.", "gofraRoundM", "м")}
            </div>
            <div class="ep-cs-sub">Мешки</div>
            <div class="ep-cs-grid">
              ${cfg(L, "Мусор: штроба тв.", "trashBags.hardStrobeM", "м/меш")}
              ${cfg(L, "Мусор: штроба мягк.", "trashBags.softStrobeM", "м/меш")}
              ${cfg(L, "Мусор: подроз. тв.", "trashBags.hardBox", "шт/меш")}
              ${cfg(L, "Мусор: подроз. мягк.", "trashBags.softBox", "шт/меш")}
              ${cfg(L, "Пылесос: штроба", "vacBags.strobeM", "м/меш")}
              ${cfg(L, "Пылесос: подроз.", "vacBags.box", "шт/меш")}
            </div>
            <div class="ep-cs-sub">Прочее (фикс на объект)</div>
            <div class="ep-cs-grid">
              ${cfg(L, "Бур 6 мм", "drills.d6", "шт")}
              ${cfg(L, "Бур 8 мм", "drills.d8", "шт")}
              ${cfg(L, "Пика", "pikes", "шт")}
              ${cfg(L, "Карандаш", "pencil", "шт")}
              ${cfg(L, "Рез с водой: ресурс ×", "wetFactor")}
            </div>
            <div class="ep-cs-logic-actions"><button type="button" class="ep-cs-reset" data-cs-reset>Сбросить все нормы к стандарту</button></div>
          </div>
        </section>
      </div>`;
  }

  function doCalc() {
    const cc = CC(); if (!cc) return;
    lastItems = cc.calc({ cableM: ui.cableM, strobeM: ui.strobeM, sockets: ui.sockets, boxes: ui.boxes, surface: ui.surface, gofra: !!ui.gofra, material: ui.material, depth: ui.depth, crownSize: ui.crownSize, wet: !!ui.wet });
    render();
  }
  function addToEstimate() {
    const d = Draft(); if (!d || !lastItems.length) return;
    const list = lastItems.map((it, i) => ({ id: "consum_" + i, sourceId: "consum_" + i, type: "material", name: it.name, unit: it.unit || "шт", price: 0, qty: n(it.qty, 1), base: "consum", source: "consum" }));
    if (d.setSourceItems) d.setSourceItems("consum", list); else list.forEach(x => d.addItem && d.addItem(x));
    const btn = document.querySelector("[data-cs-add]");
    if (btn) { btn.textContent = "✓ Добавлено"; setTimeout(() => { if (btn) btn.textContent = "➕ Добавить в предварительную"; }, 1600); }
  }
  function saveCfg(path, value) { const cc = CC(); if (!cc) return; const L = cc.get(); setP(L, path, Math.max(0, n(value))); cc.set(L); }
  function toggleHard(name) { const cc = CC(); if (!cc) return; const L = cc.get(); if (!L.materials[name]) L.materials[name] = {}; L.materials[name].hard = !L.materials[name].hard; cc.set(L); render(); }

  function onClick(e) {
    const t = e.target; if (!t || !t.closest || !t.closest("#ep-consum-root")) return;
    let el;
    if (el = t.closest("[data-cs-surface]")) { ui.surface = el.dataset.csSurface; if (ui.surface === "floor") ui.gofra = true; saveUI(); render(); return; }
    if (el = t.closest("[data-cs-gofra]")) { ui.gofra = el.dataset.csGofra === "1"; saveUI(); render(); return; }
    if (el = t.closest("[data-cs-depth]")) { ui.depth = el.dataset.csDepth; saveUI(); render(); return; }
    if (el = t.closest("[data-cs-crown]")) { ui.crownSize = el.dataset.csCrown; saveUI(); render(); return; }
    if (el = t.closest("[data-cs-wet]")) { ui.wet = el.dataset.csWet === "1"; saveUI(); render(); return; }
    if (t.closest("[data-cs-calc]")) { doCalc(); return; }
    if (t.closest("[data-cs-add]")) { addToEstimate(); return; }
    if (t.closest("[data-cs-pull-cable]")) { ui.cableM = cableFromEstimate(); saveUI(); render(); return; }
    if (t.closest("[data-cs-pull-pool]")) { ui.sockets = poolPodroz(); ui.strobeM = poolStrobe(); ui.boxes = poolBoxes(); saveUI(); render(); return; }
    if (t.closest("[data-cs-logic-toggle]")) { ui.logicOpen = !ui.logicOpen; saveUI(); render(); return; }
    if (el = t.closest("[data-cs-hard]")) { toggleHard(el.dataset.csHard); return; }
    if (t.closest("[data-cs-reset]")) { const cc = CC(); if (cc) { cc.reset(); render(); } return; }
  }
  function onChange(e) {
    const t = e.target; if (!t || !t.closest || !t.closest("#ep-consum-root")) return;
    if (t.dataset && t.dataset.csNum) { ui[t.dataset.csNum] = Math.max(0, n(t.value)); saveUI(); return; }
    if (t.dataset && t.dataset.cfg) { saveCfg(t.dataset.cfg, t.value); return; }
  }

  document.addEventListener("click", onClick);
  document.addEventListener("change", onChange);
  window.addEventListener("ep:route-loaded", (e) => {
    if (!e || !e.detail || e.detail.route !== "consumables") return;
    loadUI();
    if (!ui.cableM) ui.cableM = cableFromEstimate();
    if (!ui.sockets) ui.sockets = poolPodroz();
    if (!ui.strobeM) ui.strobeM = poolStrobe();
    if (!ui.boxes) ui.boxes = poolBoxes();
    lastItems = [];
    setTimeout(render, 30);
  });

  window.EP = window.EP || {};
  window.EP.ConsumablesUI = { render, calc: doCalc };
})();
