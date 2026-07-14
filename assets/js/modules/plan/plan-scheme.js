/* Electric Pro V29 — Проект квартиры: однолинейная схема (Слой 7).
   Из линий (QF) проекта собирается однолинейка: ввод (1/3 фазы) -> вводной автомат ->
   группы (QF, номинал, полюса, УЗО/диф, кабель, нагрузка). Рисуется готовым модулем
   ShieldSchemeSVG (ГОСТ-символы). Редактируется прямо в панели: номиналы, УЗО, кабель,
   добавить/удалить линию. Синхронно с планом (те же circuits). */
(() => {
  "use strict";
  window.EP = window.EP || {};

  const esc = (s) => String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const $ = (sel, r) => (r || document).querySelector(sel);
  const core = () => EP.Plan.Core;
  const rooms = () => EP.Plan.Rooms;
  const NS = "http://www.w3.org/2000/svg";

  const S = { full: false };

  // ---- нагрузка и параметры линии ----
  function loadEls(p, c) {
    return (p.elements || []).filter((e) => e.circuitId === c.id && e.type !== "junction");
  }
  function loadSummary(p, c) {
    const TY = (EP.Plan.Elements && EP.Plan.Elements.TYPES) || {};
    const by = {};
    loadEls(p, c).forEach((e) => {
      if (e.type === "block") ((e.params && e.params.items) || []).forEach((it) => { by[it] = (by[it] || 0) + 1; });
      else by[e.type] = (by[e.type] || 0) + 1;
    });
    const parts = Object.keys(by).map((k) => `${(TY[k] || { name: k }).name} ×${by[k]}`);
    return parts.join(", ") || "—";
  }
  // подсказка кабеля по составу нагрузки, если не задан вручную
  function autoCable(p, c) {
    const layers = loadEls(p, c).map((e) => e.layer);
    if (layers.length && layers.every((l) => l === "light")) return "3×1.5";
    if (layers.some((l) => l === "ac" || l === "warm")) return "3×2.5";
    return "3×2.5";
  }
  // короткая метка нагрузки для символа группы (по первому типу)
  function loadKindLabel(p, c) {
    const els = loadEls(p, c);
    if (!els.length) return "—";
    const l = els[0].layer;
    return ({ light: "Свет", power: "Розетки", lv: "Слаботочка", tv: "ТВ", cctv: "Видео", ac: "Кондиц.", warm: "Тёплый пол" })[l] || "Линия";
  }

  // ---- дерево для ShieldSchemeSVG.render ----
  function buildTree(p) {
    const s = p.settings, circuits = p.circuits || [];
    const children = circuits.map((c) => ({
      id: esc(c.name), label: loadSummary(p, c), rating: (c.breaker || 16) + "A",
      type: c.rcd ? "rcbo" : "mcb", poles: c.poles === 3 ? 3 : 1,
      cable: (c.cable || autoCable(p, c)),
      children: [{ type: "load", label: loadKindLabel(p, c), children: [] }]
    }));
    return {
      id: s.phases === 3 ? "QF ввод" : "QF ввод",
      label: (s.phases === 3 ? "Ввод 3ф" : "Ввод 1ф") + (s.meter ? " · счётчик" : "") + (s.mainRcd ? " · УЗО" : ""),
      rating: (s.mainBreaker || 40) + "A", type: "mcb", poles: s.phases === 3 ? 3 : 1,
      children: children.length ? children : [{ id: "—", label: "нет линий (QF)", rating: "", type: "load", children: [] }]
    };
  }

  // ---- подбор корпуса щита по числу модулей и бренду ----
  function circuitModules(c) {
    const p3 = c.poles === 3;
    if (c.rcd) return p3 ? 4 : 2; // дифавтомат
    return p3 ? 3 : 1;            // автомат
  }
  function neededModules(p) {
    const s = p.settings;
    let m = s.phases === 3 ? 3 : 1;         // вводной автомат
    if (s.mainRcd) m += s.phases === 3 ? 4 : 2;
    (p.circuits || []).forEach((c) => { m += circuitModules(c); });
    m += Math.max(0, s.panelReserve || 0);  // запас
    return m;
  }
  function pickEnclosure(brand, needed) {
    const boxes = EP.Plan.Core.DEFAULTS.panelBoxes;
    const b = boxes[brand] || boxes.IEK;
    const keys = Object.keys(b.sizes).map(Number).sort((x, y) => x - y);
    let cap = keys.find((k) => k >= needed), overflow = false;
    if (cap == null) { cap = keys[keys.length - 1]; overflow = true; }
    const d = b.sizes[String(cap)];
    return { brand: (boxes[brand] ? brand : "IEK"), modules: cap, rows: Math.ceil(cap / b.rowCap), w: d[0], h: d[1], depth: d[2], overflow };
  }
  function recomputePanel(p) {
    const need = neededModules(p);
    const enc = pickEnclosure(p.settings.panelBrand || "IEK", need);
    p.settings.panelBox = { wmm: enc.w, hmm: enc.h, dmm: enc.depth, modules: enc.modules, needed: need, rows: enc.rows, brand: enc.brand, overflow: enc.overflow };
    return p.settings.panelBox;
  }

  // ---- баланс фаз (3-фазный ввод): ток по номиналу автомата — ЯВНАЯ упрощённая
  // прикидка (реальную мощность точек модуль не считает), но для равномерной
  // расстановки линий по L1/L2/L3 этого достаточно. 3-полюсная линия висит на
  // всех трёх фазах разом (её ток идёт в каждую), 1-полюсная — на своей c.phase.
  function phaseBalance(p) {
    const t = { 1: 0, 2: 0, 3: 0 };
    (p.circuits || []).forEach((c) => {
      const a = Number(c.breaker) || 0;
      if (c.poles === 3) { t[1] += a; t[2] += a; t[3] += a; }
      else { const ph = (c.phase === 2 || c.phase === 3) ? c.phase : 1; t[ph] += a; }
    });
    const vals = [t[1], t[2], t[3]], max = Math.max(...vals), min = Math.min(...vals);
    const avg = (t[1] + t[2] + t[3]) / 3;
    return { t, max, min, spread: max - min, warn: avg > 0 && (max - min) / avg > 0.3 };
  }
  // жадный автобаланс: сначала база от 3-полюсных линий, затем 1-полюсные —
  // от большего номинала к меньшему, каждую на текущую самую лёгкую фазу
  function autoBalancePhases(p) {
    const t = { 1: 0, 2: 0, 3: 0 };
    const cs = p.circuits || [];
    cs.filter((c) => c.poles === 3).forEach((c) => { const a = Number(c.breaker) || 0; t[1] += a; t[2] += a; t[3] += a; });
    cs.filter((c) => c.poles !== 3).sort((a, b) => (Number(b.breaker) || 0) - (Number(a.breaker) || 0)).forEach((c) => {
      let best = 1;
      if (t[2] < t[best]) best = 2;
      if (t[3] < t[best]) best = 3;
      c.phase = best;
      t[best] += Number(c.breaker) || 0;
    });
  }

  // ---- панель ----
  function open() {
    const p = core().project; if (!p) return;
    p.circuits = p.circuits || [];
    rooms().openSheet(`<div class="ep-plan-srow"><b>▤ Однолинейная схема</b>
        <span class="ep-plan-flex"></span>
        <button type="button" class="ep-plan-mini ep-clickable" data-psc-full aria-label="Во весь экран">⤢</button>
        <button type="button" class="ep-plan-mini ep-clickable" data-psc-close>✕</button></div>
      <div class="ep-plan-scheme ${S.full ? "is-full" : ""}" id="ep-psc-box"><div class="ep-plan-schemescroll" id="ep-psc-scroll"></div></div>
      <div id="ep-psc-edit"></div>`);
    draw();
    editor();
  }
  const isOpen = () => !!$("#ep-psc-box");
  function close() { S.full = false; }
  function toggleFull() {
    S.full = !S.full;
    const box = $("#ep-psc-box"); const sheet = $("#ep-plan-sheet");
    if (box) box.classList.toggle("is-full", S.full);
    if (sheet) sheet.classList.toggle("ep-plan-sheet-full", S.full);
    try {
      if (S.full && sheet && sheet.requestFullscreen) sheet.requestFullscreen().then(() => { if (screen.orientation && screen.orientation.lock) screen.orientation.lock("landscape").catch(() => {}); }).catch(() => {});
      else if (!S.full && document.fullscreenElement) document.exitFullscreen().catch(() => {});
    } catch (e) {}
  }

  function draw() {
    const host = $("#ep-psc-scroll"); if (!host || !window.ShieldSchemeSVG) return;
    const p = core().project;
    // пересчёт корпуса щита; если изменился — сохраняем и обновляем щит на плане
    // (считаем от p.circuits независимо от режима схемы — тот же физический набор линий)
    const before = JSON.stringify(p.settings.panelBox);
    recomputePanel(p);
    if (JSON.stringify(p.settings.panelBox) !== before) { core().persist("panel-box"); if (rooms().renderScene) rooms().renderScene(); }
    host.innerHTML = "";
    const svg = document.createElementNS(NS, "svg");
    svg.setAttribute("class", "ep-plan-schemesvg");
    host.appendChild(svg);
    try {
      if (p.settings.schemeMode === "manual" && EP.Plan.ManualScheme) EP.Plan.ManualScheme.render(svg, p);
      else window.ShieldSchemeSVG.render(svg, buildTree(p));
    } catch (e) { host.innerHTML = `<div class="ep-plan-modehint">Не удалось нарисовать схему: ${esc(e.message)}</div>`; }
  }

  function modeRow(s) {
    return `<div class="ep-plan-srow ep-plan-schememode">
      <button type="button" class="ep-plan-chip ep-clickable ${s.schemeMode !== "manual" ? "on" : ""}" data-psc-mode="auto">Авто (из линий плана)</button>
      <button type="button" class="ep-plan-chip ep-clickable ${s.schemeMode === "manual" ? "on" : ""}" data-psc-mode="manual">Ручная</button>
    </div>`;
  }
  function editor() {
    const box = $("#ep-psc-edit"); if (!box) return;
    const p = core().project, s = p.settings;
    if (s.schemeMode === "manual") {
      box.innerHTML = modeRow(s) + (EP.Plan.ManualScheme ? EP.Plan.ManualScheme.editorHtml(p) : "");
      return;
    }
    const breakers = EP.Plan.Core.DEFAULTS.breakers, cables = EP.Plan.Core.DEFAULTS.cables;
    const brkSel = (val, attr) => `<select ${attr} class="ep-plan-sel">${breakers.map((b) => `<option value="${b}" ${Number(val) === b ? "selected" : ""}>${b}A</option>`).join("")}</select>`;
    const cabSel = (val, id) => `<select data-psc-cab="${esc(id)}" class="ep-plan-sel"><option value="">авто</option>${cables.map((cb) => `<option value="${cb}" ${val === cb ? "selected" : ""}>${cb}</option>`).join("")}</select>`;
    const phaseChip = (c) => (s.phases === 3 && c.poles !== 3)
      ? `<span class="ep-plan-seg ep-plan-phaseseg">${[1, 2, 3].map((n) => `<button type="button" class="${(c.phase || 1) === n ? "on" : ""}" data-psc-phase="${esc(c.id)}:${n}">L${n}</button>`).join("")}</span>`
      : "";
    const rows = (p.circuits || []).map((c) => `<div class="ep-plan-lineRow">
        <span class="ep-plan-cdot" style="background:${esc(c.color)}"></span>
        <input type="text" data-psc-name="${esc(c.id)}" value="${esc(c.name)}" maxlength="24" style="flex:0 0 92px">
        ${brkSel(c.breaker, `data-psc-brk="${esc(c.id)}"`)}
        <button type="button" class="ep-plan-chip ep-clickable ${c.poles === 3 ? "on" : ""}" data-psc-poles="${esc(c.id)}">${c.poles === 3 ? "3P" : "1P"}</button>
        ${phaseChip(c)}
        <label class="ep-plan-chk"><input type="checkbox" data-psc-rcd="${esc(c.id)}" ${c.rcd ? "checked" : ""}>УЗО</label>
        ${cabSel(c.cable, c.id)}
        <span class="ep-plan-flex"></span>
        <button type="button" class="ep-plan-mini ep-plan-danger ep-clickable" data-psc-del="${esc(c.id)}">✕</button>
      </div>`).join("");
    const balanceHtml = s.phases === 3 ? (() => {
      const b = phaseBalance(p);
      return `<div class="ep-plan-srow"><b>Баланс фаз</b><span class="ep-plan-flex"></span>
          <button type="button" class="ep-plan-chip ep-clickable" data-psc-autobalance">⚖ Автобаланс</button></div>
        <div class="ep-plan-srow ep-plan-rlens ep-plan-balancerow${b.warn ? " is-warn" : ""}">
          <span>L1: <b>${b.t[1]}А</b></span><span>L2: <b>${b.t[2]}А</b></span><span>L3: <b>${b.t[3]}А</b></span>
          ${b.warn ? `<span class="ep-plan-warnrow">разбаланс ${Math.round(b.spread)}А — распредели линии равномернее</span>` : ""}
        </div>`;
    })() : "";
    const brands = Object.keys(EP.Plan.Core.DEFAULTS.panelBoxes);
    const bx = s.panelBox || {};
    const boxLine = bx.modules
      ? `Щит: <b>${bx.brand}</b> · нужно ${bx.needed} мод → корпус <b>${bx.modules} мод</b>${bx.overflow ? " (не хватает — 2 щита)" : ""} · ${bx.wmm}×${bx.hmm}×${bx.dmm} мм · ${bx.rows} ${bx.rows === 1 ? "ряд" : "ряда"}`
      : "Щит: —";
    box.innerHTML = modeRow(s) + `<div class="ep-plan-srow"><b>Ввод и группы</b></div>
      <div class="ep-plan-srow">
        <button type="button" class="ep-plan-chip ep-clickable ${s.phases !== 3 ? "on" : ""}" data-psc-ph="1">1 фаза</button>
        <button type="button" class="ep-plan-chip ep-clickable ${s.phases === 3 ? "on" : ""}" data-psc-ph="3">3 фазы</button>
        Ввод ${brkSel(s.mainBreaker, "data-psc-main")}
        <label class="ep-plan-chk"><input type="checkbox" data-psc-meter ${s.meter ? "checked" : ""}>Счётчик</label>
        <label class="ep-plan-chk"><input type="checkbox" data-psc-mainrcd ${s.mainRcd ? "checked" : ""}>Вводное УЗО</label>
      </div>
      <div class="ep-plan-srow">Корпус:
        <select data-psc-brand class="ep-plan-sel">${brands.map((b) => `<option value="${esc(b)}" ${s.panelBrand === b ? "selected" : ""}>${esc(b)}</option>`).join("")}</select>
        <label class="ep-plan-chk">Запас, мод<input type="number" inputmode="numeric" min="0" data-psc-res value="${Math.round(s.panelReserve || 0)}" style="width:56px"></label>
      </div>
      <div class="ep-plan-srow ep-plan-rlens">${boxLine}</div>
      ${balanceHtml}
      ${rows || `<div class="ep-plan-modehint">Линий (QF) нет. Назначь линии точкам в 🔌 или добавь ниже.</div>`}
      <div class="ep-plan-srow ep-plan-sbtns">
        <button type="button" class="btn btn-primary ep-clickable" data-psc-add>+ линия</button>
      </div>`;
  }

  function refresh() { draw(); editor(); }

  // ---- события ----
  document.addEventListener("click", (e) => {
    if (!rooms() || !rooms().isActive()) return;
    const t = e.target; let b;
    if (t.closest("[data-plan-scheme]")) return open();
    if (t.closest("[data-psc-close]")) { close(); rooms().closeSheet(); const sh = $("#ep-plan-sheet"); if (sh) sh.classList.remove("ep-plan-sheet-full"); return; }
    if (t.closest("[data-psc-full]")) return toggleFull();
    if (!isOpen()) return;
    if ((b = t.closest("[data-psc-mode]"))) { const c = core(); c.commit(); c.project.settings.schemeMode = b.getAttribute("data-psc-mode") === "manual" ? "manual" : "auto"; c.persist("scheme-mode"); refresh(); return; }
    if ((b = t.closest("[data-psc-ph]"))) { const c = core(); c.commit(); c.project.settings.phases = Number(b.getAttribute("data-psc-ph")) === 3 ? 3 : 1; c.persist("scheme-ph"); refresh(); return; }
    if ((b = t.closest("[data-psc-poles]"))) { const c = core(), cc = c.project.circuits.find((x) => x.id === b.getAttribute("data-psc-poles")); if (cc) { c.commit(); cc.poles = cc.poles === 3 ? 1 : 3; c.persist("scheme-poles"); refresh(); } return; }
    if ((b = t.closest("[data-psc-phase]"))) {
      const [id, ph] = b.getAttribute("data-psc-phase").split(":");
      const c = core(), cc = c.project.circuits.find((x) => x.id === id);
      if (cc) { c.commit(); cc.phase = Number(ph) || 1; c.persist("scheme-phase"); refresh(); }
      return;
    }
    if (t.closest("[data-psc-autobalance]")) {
      const c = core(); c.commit(); autoBalancePhases(c.project); c.persist("scheme-autobalance"); refresh(); return;
    }
    if ((b = t.closest("[data-psc-del]"))) {
      const c = core(), id = b.getAttribute("data-psc-del");
      c.commit();
      c.project.circuits = c.project.circuits.filter((x) => x.id !== id);
      (c.project.elements || []).forEach((el) => { if (el.circuitId === id) el.circuitId = null; });
      c.persist("scheme-cdel"); refresh(); return;
    }
    if (t.closest("[data-psc-add]")) {
      const c = core(), colors = EP.Plan.Core.DEFAULTS.circuitColors, cs = c.project.circuits;
      const used = new Set(cs.map((x) => x.color));
      const color = colors.find((col) => !used.has(col)) || colors[cs.length % colors.length];
      const maxN = cs.reduce((m, x) => { const n = parseInt(String(x.name).replace(/\D/g, ""), 10); return Number.isFinite(n) ? Math.max(m, n) : m; }, 0);
      c.commit(); cs.push(c.model.newCircuit("QF" + (maxN + 1), color, 16)); c.persist("scheme-cadd"); refresh(); return;
    }
  });
  document.addEventListener("change", (e) => {
    if (!rooms() || !rooms().isActive() || !isOpen()) return;
    const t = e.target, ga = (a) => t.getAttribute && t.getAttribute(a);
    const c = core();
    if (ga("data-psc-main") != null || t.hasAttribute("data-psc-main")) { c.commit(); c.project.settings.mainBreaker = Number(t.value) || 40; c.persist("scheme-main"); draw(); return; }
    if (t.hasAttribute("data-psc-meter")) { c.commit(); c.project.settings.meter = !!t.checked; c.persist("scheme-meter"); draw(); return; }
    if (t.hasAttribute("data-psc-mainrcd")) { c.commit(); c.project.settings.mainRcd = !!t.checked; c.persist("scheme-mainrcd"); draw(); return; }
    const brk = ga("data-psc-brk"); if (brk) { const cc = c.project.circuits.find((x) => x.id === brk); if (cc) { c.commit(); cc.breaker = Number(t.value) || 16; c.persist("scheme-brk"); draw(); } return; }
    const rcd = ga("data-psc-rcd"); if (rcd) { const cc = c.project.circuits.find((x) => x.id === rcd); if (cc) { c.commit(); cc.rcd = !!t.checked; c.persist("scheme-rcd"); draw(); } return; }
    const cab = ga("data-psc-cab"); if (cab) { const cc = c.project.circuits.find((x) => x.id === cab); if (cc) { c.commit(); cc.cable = t.value || null; c.persist("scheme-cab"); draw(); } return; }
    if (t.hasAttribute && t.hasAttribute("data-psc-brand")) { c.commit(); c.project.settings.panelBrand = t.value; c.persist("scheme-brand"); refresh(); return; }
    if (t.hasAttribute && t.hasAttribute("data-psc-res")) { c.commit(); c.project.settings.panelReserve = Math.max(0, Number(t.value) || 0); c.persist("scheme-res"); refresh(); return; }
  });
  document.addEventListener("input", (e) => {
    if (!rooms() || !rooms().isActive() || !isOpen()) return;
    const t = e.target, nm = t.getAttribute && t.getAttribute("data-psc-name");
    if (nm) { const c = core(), cc = c.project.circuits.find((x) => x.id === nm); if (cc) { cc.name = t.value; c.persist("scheme-name"); draw(); } }
  });

  EP.Plan = EP.Plan || {};
  EP.Plan.Scheme = { open, close, isOpen, buildTree, recompute: recomputePanel, neededModules, draw, refresh, loadEls, autoCable, loadSummary, loadKindLabel, phaseBalance, autoBalancePhases };
})();
