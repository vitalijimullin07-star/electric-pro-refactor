/* Electric Pro V29 — Расходники: калькулятор + редактор (инструменты списком с привязкой к функции).
   Материал — из пула. Движок EP.CableConsum. → EP.EstimateDraft (source "consum"). */
(() => {
  "use strict";
  const UIKEY = "ep_consum_ui_v29";
  const n = (v, f = 0) => (Number.isFinite(Number(v)) ? Number(v) : f);
  const esc = v => String(v == null ? "" : v).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" }[c]));
  const getP = (o, p) => p.split(".").reduce((a, k) => (a && a[k] != null ? a[k] : undefined), o);
  function setP(o, p, val) { const ks = p.split("."); let a = o; for (let i = 0; i < ks.length - 1; i++) { if (typeof a[ks[i]] !== "object" || a[ks[i]] == null) a[ks[i]] = {}; a = a[ks[i]]; } a[ks[ks.length - 1]] = val; }

  const MANUAL_FNS = ["shield", "breezer", "sewer", "other"];
  const DEF_UI = { surface: "ceil", gofra: false, depth: "small", wet: false, cableM: 0, strobeM: 0, sockets: 0, boxes: 0, shield: 0, breezer: 0, sewer: 0, other: 0, material: "", logicOpen: false };
  let ui = null, lastItems = [];

  function CC() { return window.EP && window.EP.CableConsum ? window.EP.CableConsum : null; }
  function Draft() { return window.EP && window.EP.EstimateDraft ? window.EP.EstimateDraft : null; }
  function loadUI() { let s = {}; try { s = JSON.parse(localStorage.getItem(UIKEY) || "{}") || {}; } catch (e) {} ui = Object.assign({}, DEF_UI, s); }
  function saveUI() { try { localStorage.setItem(UIKEY, JSON.stringify(ui)); } catch (e) {} }

  function cableFromEstimate() {
    try { const d = Draft(); if (!d || !d.getItems) return 0; const re = /кабель|ввг|nym|пвс|шввп|швввп|провод|сип|ппв|кввг|ввгнг/i; let m = 0; d.getItems().forEach(it => { if (re.test(it.name || "")) m += n(it.qty); }); return Math.round(m); } catch (e) { return 0; }
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
    const FN = cc.functions();
    const L = cc.get();
    const pm = poolMaterial();
    ui.material = pm || ui.material || mats[0] || "Бетон";

    // ручные функции, которые реально используются инструментами
    const usedManual = MANUAL_FNS.filter(f => (L.tools || []).some(t => t && t.fn === f && !t.off));
    const manualLabels = { shield: "Ниши щита", breezer: "Бризеры", sewer: "Канализация", other: "Иное" };
    const manualBlock = usedManual.length
      ? `<div class="ep-cs-field"><span class="ep-cs-lab">Доп. отверстия (для коронок)</span><div class="ep-cs-grid">` +
        usedManual.map(f => `<label class="ep-cs-cfg"><span>${manualLabels[f]}</span><input type="number" min="0" data-cs-num="${f}" value="${n(ui[f])}" /></label>`).join("") + `</div></div>`
      : "";

    const result = lastItems.length
      ? `<div class="ep-cs-result"><div class="ep-cs-rhead">Расходка (${lastItems.length} поз.)</div>` +
        lastItems.map(it => `<div class="ep-cs-row"><span>${esc(it.name)}</span><b>${it.qty} ${esc(it.unit)}</b></div>`).join("") +
        `<button type="button" class="btn btn-primary ep-clickable ep-cs-add" data-cs-add>➕ Добавить в предварительную</button></div>`
      : `<div class="ep-cs-hint">Заполни данные и нажми «Рассчитать».</div>`;

    // редактор инструментов
    const fnOpts = (cur) => Object.keys(FN).map(k => `<option value="${k}" ${cur === k ? "selected" : ""}>${esc(FN[k])}</option>`).join("");
    const toolRows = (L.tools || []).map(t => {
      const lifeInputs = mats.map(m => `<label>${esc(m).slice(0,4)}<input type="number" min="0" data-tool-life="${t.id}|${m}" value="${n(t.life && t.life[m])}" /></label>`).join("");
      return `<div class="ep-cs-tool">
        <div class="ep-cs-ttop">
          <b>${t.kind === "disc" ? "Диск" : "Коронка"}</b>
          <input class="ep-cs-tsize" type="number" min="0" data-tool-size="${t.id}" value="${n(t.size)}" /><span class="ep-cs-mm">мм</span>
          <select class="ep-cs-tfn" data-tool-fn="${t.id}">${fnOpts(t.fn)}</select>
          ${t.kind === "disc" ? `<select class="ep-cs-tdepth" data-tool-depth="${t.id}"><option value="small" ${t.depth === "small" ? "selected" : ""}>≤30</option><option value="big" ${t.depth === "big" ? "selected" : ""}>30–55</option></select>` : ""}
          <button type="button" class="ep-cs-tdel" data-tool-del="${t.id}">✕</button>
        </div>
        <div class="ep-cs-tlife"><span>ресурс${t.kind === "disc" ? " (м/шт, ×2)" : " (отв/шт)"}:</span>${lifeInputs}</div>
      </div>`;
    }).join("");

    const matHard = mats.map(m => {
      const o = (L.materials && L.materials[m]) || {};
      return `<button type="button" class="ep-cs-hard ${o.hard ? "active" : ""}" data-cs-hard="${esc(m)}">${esc(m)}: ${o.hard ? "твёрдый" : "мягкий"}</button>`;
    }).join("");

    root.innerHTML = `
      <div class="ep-cs-shell">
        <section class="card ep-cs-card">
          ${seg("Поверхность", [["ceil", "Потолок"], ["floor", "Пол"]], "cs-surface", ui.surface)}
          ${ui.surface === "ceil" ? seg("Гофра", [["0", "Нет"], ["1", "Да"]], "cs-gofra", ui.gofra ? "1" : "0") : `<div class="ep-cs-note">По полу — всегда гофра ПНД, лента, без клипс.</div>`}
          <div class="ep-cs-field"><span class="ep-cs-lab">Материал стен</span>
            <div class="ep-cs-matshow">${pm ? esc(pm) : esc(ui.material) + " <i>(в пуле не задан)</i>"} <span class="ep-cs-frompool">из пула</span></div></div>
          ${seg("Размер штробы (диск)", [["small", "≤30 → 125"], ["big", "30–55 → 150"]], "cs-depth", ui.depth)}
          ${seg("Рез", [["0", "Насухо"], ["1", "С водой"]], "cs-wet", ui.wet ? "1" : "0")}
        </section>

        <section class="card ep-cs-card">
          ${num("Кабель", "cableM", ui.cableM, "м")}
          ${num("Штроба", "strobeM", ui.strobeM, "м")}
          ${num("Подрозетники", "sockets", ui.sockets, "шт")}
          ${num("Распайки", "boxes", ui.boxes, "шт")}
          ${manualBlock}
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
            <div class="ep-cs-sub">Инструмент — коронки и диски (привязка к функции)</div>
            ${toolRows}
            <div class="ep-cs-tadd"><button type="button" data-tool-add="crown">+ коронка</button><button type="button" data-tool-add="disc">+ диск</button></div>

            <div class="ep-cs-sub">Материалы — мешки (твёрдый/мягкий)</div>
            <div class="ep-cs-hardrow">${matHard}</div>

            <div class="ep-cs-sub">Крепёж (на метр кабеля)</div>
            <div class="ep-cs-grid">
              ${cfg(L, "Площадки/м", "direct.pads")}${cfg(L, "Стяжки/м", "direct.ties")}
              ${cfg(L, "Прямой: гв+выстр /м", "direct.perM")}${cfg(L, "Гофра: клипсы /м", "gofraCeil.clips")}
              ${cfg(L, "Пол: гв+выстр /м", "floor.perM")}${cfg(L, "Пол: лента /м", "floor.tapePerM", "м")}
              ${cfg(L, "Лента: рулон", "floor.tapeRollM", "м")}${cfg(L, "Распайка: гв+выстр", "junction.perBox")}
            </div>
            <div class="ep-cs-sub">Упаковки</div>
            <div class="ep-cs-grid">
              ${cfg(L, "Гвозди: пачка", "packs.nails")}${cfg(L, "Гвозди: допуск", "packs.nailsTol")}
              ${cfg(L, "Выстрелы: баллон", "packs.shots")}${cfg(L, "Выстрелы: допуск", "packs.shotsTol")}
              ${cfg(L, "Стяжки: пачка", "packs.ties")}${cfg(L, "Площадки: пачка", "packs.pads")}
              ${cfg(L, "Гофра: округл.", "gofraRoundM", "м")}${cfg(L, "Рез с водой: ресурс ×", "wetFactor")}
            </div>
            <div class="ep-cs-sub">Мешки</div>
            <div class="ep-cs-grid">
              ${cfg(L, "Мусор: штроба тв.", "trashBags.hardStrobeM", "м")}${cfg(L, "Мусор: штроба мягк.", "trashBags.softStrobeM", "м")}
              ${cfg(L, "Мусор: подроз. тв.", "trashBags.hardBox", "шт")}${cfg(L, "Мусор: подроз. мягк.", "trashBags.softBox", "шт")}
              ${cfg(L, "Пылесос: штроба", "vacBags.strobeM", "м")}${cfg(L, "Пылесос: подроз.", "vacBags.box", "шт")}
            </div>
            <div class="ep-cs-sub">Прочее (фикс на объект)</div>
            <div class="ep-cs-grid">
              ${cfg(L, "Бур 6 мм", "drills.d6")}${cfg(L, "Бур 8 мм", "drills.d8")}
              ${cfg(L, "Пика", "pikes")}${cfg(L, "Карандаш", "pencil")}
            </div>
            <div class="ep-cs-logic-actions"><button type="button" class="ep-cs-reset" data-cs-reset>Сбросить все нормы к стандарту</button></div>
          </div>
        </section>
      </div>`;
  }

  function doCalc() {
    const cc = CC(); if (!cc) return;
    lastItems = cc.calc({ cableM: ui.cableM, strobeM: ui.strobeM, sockets: ui.sockets, boxes: ui.boxes, shield: ui.shield, breezer: ui.breezer, sewer: ui.sewer, other: ui.other, surface: ui.surface, gofra: !!ui.gofra, material: ui.material, depth: ui.depth, wet: !!ui.wet });
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

  // инструменты
  function tools() { const cc = CC(); return cc ? (cc.get().tools || []) : []; }
  function saveTools(arr) { const cc = CC(); if (!cc) return; const L = cc.get(); L.tools = arr; cc.set(L); }
  function patchTool(id, fn) { const arr = tools().slice(); const i = arr.findIndex(t => t && t.id === id); if (i < 0) return; arr[i] = Object.assign({}, arr[i]); fn(arr[i]); saveTools(arr); }
  function addTool(kind) {
    const arr = tools().slice();
    const id = (kind === "disc" ? "d" : "t") + Date.now().toString(36);
    const life = {}; CC().materials().forEach(m => life[m] = kind === "disc" ? 60 : 15);
    arr.push(kind === "disc" ? { id, kind: "disc", size: 125, depth: "small", fn: "strobe", life } : { id, kind: "crown", size: 68, fn: "podroz", life });
    saveTools(arr); render();
  }
  function delTool(id) { saveTools(tools().filter(t => t && t.id !== id)); render(); }

  function onClick(e) {
    const t = e.target; if (!t || !t.closest || !t.closest("#ep-consum-root")) return;
    let el;
    if (el = t.closest("[data-cs-surface]")) { ui.surface = el.dataset.csSurface; if (ui.surface === "floor") ui.gofra = true; saveUI(); render(); return; }
    if (el = t.closest("[data-cs-gofra]")) { ui.gofra = el.dataset.csGofra === "1"; saveUI(); render(); return; }
    if (el = t.closest("[data-cs-depth]")) { ui.depth = el.dataset.csDepth; saveUI(); render(); return; }
    if (el = t.closest("[data-cs-wet]")) { ui.wet = el.dataset.csWet === "1"; saveUI(); render(); return; }
    if (t.closest("[data-cs-calc]")) { doCalc(); return; }
    if (t.closest("[data-cs-add]")) { addToEstimate(); return; }
    if (t.closest("[data-cs-pull-cable]")) { ui.cableM = cableFromEstimate(); saveUI(); render(); return; }
    if (t.closest("[data-cs-pull-pool]")) { ui.sockets = poolPodroz(); ui.strobeM = poolStrobe(); ui.boxes = poolBoxes(); saveUI(); render(); return; }
    if (t.closest("[data-cs-logic-toggle]")) { ui.logicOpen = !ui.logicOpen; saveUI(); render(); return; }
    if (el = t.closest("[data-cs-hard]")) { toggleHard(el.dataset.csHard); return; }
    if (el = t.closest("[data-tool-add]")) { addTool(el.dataset.toolAdd); return; }
    if (el = t.closest("[data-tool-del]")) { delTool(el.dataset.toolDel); return; }
    if (t.closest("[data-cs-reset]")) { const cc = CC(); if (cc) { cc.reset(); render(); } return; }
  }
  function onChange(e) {
    const t = e.target; if (!t || !t.closest || !t.closest("#ep-consum-root")) return;
    const d = t.dataset || {};
    if (d.csNum) { ui[d.csNum] = Math.max(0, n(t.value)); saveUI(); return; }
    if (d.cfg) { saveCfg(d.cfg, t.value); return; }
    if (d.toolSize) { patchTool(d.toolSize, tt => tt.size = Math.max(0, n(t.value))); return; }
    if (d.toolFn) { patchTool(d.toolFn, tt => tt.fn = t.value); const need = MANUAL_FNS.indexOf(t.value) >= 0; if (need) render(); return; }
    if (d.toolDepth) { patchTool(d.toolDepth, tt => tt.depth = t.value); return; }
    if (d.toolLife) { const [id, m] = d.toolLife.split("|"); patchTool(id, tt => { tt.life = Object.assign({}, tt.life); tt.life[m] = Math.max(0, n(t.value)); }); return; }
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
