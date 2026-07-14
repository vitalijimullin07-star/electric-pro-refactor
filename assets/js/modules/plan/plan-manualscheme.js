/* Electric Pro V29 — Проект квартиры: РУЧНАЯ однолинейная схема (Слой 7б).
   Тот же принцип, что в общем конструкторе (ManualSchemeV28): группы (УЗО/Диф) →
   линии → аппараты до/после УЗО, аппараты вводной цепи. НО данные — часть
   ПРОЕКТА (p.manualScheme), участвуют в undo/persist/облаке, как всё на плане —
   не отдельный localStorage. Вводной автомат/счётчик/вводное УЗО НЕ дублируются:
   те же p.settings.mainBreaker/meter/mainRcd, что и в авто-режиме (и подбор
   корпуса щита neededModules() их же считает).
   Линию можно взять с плана (p.circuits, уже названы на Слое 5 «Трассы») —
   чек-лист наверху показывает, какие линии ещё НЕ расставлены в схему; после
   выбора линия помечается ✓ и пропадает из списка «+ линия…» у всех групп.
   Реордер аппаратов/групп/линий — прямо в SVG-предпросмотре (renderGost
   рисует ▲▼/◀▶ у interactive-дерева), в форме — только добавить/убрать/удалить. */
(() => {
  "use strict";
  window.EP = window.EP || {};

  const esc = (s) => String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const core = () => EP.Plan.Core;
  const rooms = () => EP.Plan.Rooms;

  // палитра аппаратов вводной цепи (кроме вводного автомата/счётчика/вводного УЗО — те из settings)
  const APPAR = [
    { key: "rubilnik", title: "Рубильник нагрузки", sym: "switch", inline: true },
    { key: "opn", title: "ОПН / УЗИП", sym: "spd", inline: true },
    { key: "uzm", title: "Реле напряжения", sym: "relay", inline: true },
    { key: "avr", title: "АВР (резерв)", sym: "switch", inline: true },
    { key: "phaseSwitch", title: "Переключатель фаз", sym: "switch", inline: true },
    { key: "priority", title: "Реле приоритета", sym: "relay", inline: true },
    { key: "contactor", title: "Контактор", sym: "contactor", inline: true },
    { key: "uzdp", title: "УЗДП (от дуги)", sym: "mcb", inline: true },
    { key: "bell", title: "Звонок", sym: "contactor", inline: false },
    { key: "serviceSocket", title: "Сервисная розетка", sym: "mcb", inline: false }
  ];
  const CURVES = ["A", "B", "C", "D"];
  const RCD_TYPES = ["AC", "A", "B"];
  const AMPS_LINE = [6, 10, 16, 20, 25, 32, 40, 50, 63];
  const AMPS_GROUP = [25, 40, 63, 80, 100];
  const APP_PICK = ["contactor", "uzm", "priority", "opn", "uzdp", "rubilnik", "phaseSwitch"];

  function ms(p) { return p.manualScheme || (p.manualScheme = core().model.newManualScheme()); }
  function circuitById(p, id) { return (p.circuits || []).find((c) => c.id === id) || null; }
  function placedCircuitIds(p) {
    const set = new Set();
    (ms(p).groups || []).forEach((g) => (g.lines || []).forEach((l) => { if (l.circuitId) set.add(l.circuitId); }));
    return set;
  }
  function appMeta(key) { return APPAR.find((a) => a.key === key) || { key, title: key, sym: "switch" }; }
  function cableShort(cable, len) {
    if (!cable) return "";
    const l = Number(len) || 0;
    return cable + (l > 0 ? " · " + l + "м" : "");
  }

  // ---- дерево для ShieldSchemeSVG.renderGost (та же схема, что в общем конструкторе) ----
  function appNode(key, poles) { const a = appMeta(key); return { id: "", type: a.sym, label: a.title.split(" ")[0], rating: "", poles: poles || 1, children: [] }; }
  function tagReorder(n, refPrefix, i, total) { n.reorder = refPrefix + ":" + i; n.canUp = i > 0; n.canDown = i < total - 1; return n; }
  function chainTo(keys, tail, poles, refPrefix) {
    keys = keys || [];
    const ns = keys.map((k, i) => tagReorder(appNode(k, poles), refPrefix, i, keys.length));
    for (let i = 0; i < ns.length; i++) ns[i].children = [i + 1 < ns.length ? ns[i + 1] : tail];
    return ns.length ? ns[0] : tail;
  }
  function chainAfter(device, keys, tail, poles, refPrefix) {
    keys = keys || [];
    if (!keys.length) { device.children = tail; return; }
    const ns = keys.map((k, i) => tagReorder(appNode(k, poles), refPrefix, i, keys.length));
    for (let i = 0; i < ns.length; i++) ns[i].children = i + 1 < ns.length ? [ns[i + 1]] : tail;
    device.children = [ns[0]];
  }
  function effPhase(p, ph) { return p.settings.phases === 3 ? (ph === "3" ? 3 : 1) : 1; }

  function buildTree(p) {
    const M = ms(p), s = p.settings;
    if (!M.groups.length) return null;
    const amp = (n) => String(n).replace(/[^\d]/g, "") + "А";
    const feedPoles = s.phases === 3 ? 3 : 1;
    let qf = 0, qd = 0;
    const ordered = (M.apparatusOrder || []).map((k) => APPAR.find((a) => a.key === k)).filter((a) => a && M.apparatus[a.key]);
    const inlineA = ordered.filter((a) => a.inline);
    const branchA = ordered.filter((a) => !a.inline);

    const groupNodes = M.groups.map((g, gi) => {
      qd++;
      const gp = effPhase(p, g.phase);
      const autom = (g.lines || []).map((l, li) => {
        qf++;
        const lp = effPhase(p, l.phase);
        const brk = { id: "QF" + qf, type: "mcb", label: l.name || "Линия", rating: (l.curve || "C") + (l.amp || 16) + "А", poles: lp, children: [] };
        const cab = cableShort(l.cable, l.cableLen);
        if ((l.apps || []).length) { const load = { id: "", type: "load", label: "", rating: "", cable: cab, children: [] }; brk.children = [chainTo(l.apps, load, lp, "la:" + gi + ":" + li)]; }
        else brk.cable = cab;
        return brk;
      });
      const rcd = {
        id: "QD" + qd, type: g.kind === "dif" ? "rcbo" : "rcd",
        label: (g.title || "Группа") + " " + (g.leak || 30) + "мА" + (s.phases === 3 && g.phase !== "3" ? " · L" + (g.phaseSel || "1") : ""),
        rating: (g.rcdType || "A") + " " + (g.kind === "dif" ? (g.curve || "C") + " " : "") + (g.amp || 40) + "А/" + (g.leak || 30) + "мА",
        poles: gp, children: autom
      };
      chainAfter(rcd, g.appsAfter || [], autom, gp, "ga:" + gi);
      return chainTo(g.apps || [], rcd, gp, "gb:" + gi);
    });

    // фикс. вводная цепь: автомат -> счётчик (если settings.meter) -> вводное УЗО (если settings.mainRcd)
    // -> остальные аппараты (эти уже с порядком/реордером через apparatusOrder)
    const fixed = [{ id: "QF0", type: "mcb", label: "Ввод", rating: amp(s.mainBreaker), poles: feedPoles, children: [] }];
    if (s.meter) fixed.push({ id: "", type: "meter", label: "Счётчик", rating: "", poles: feedPoles, children: [] });
    if (s.mainRcd) fixed.push({ id: "", type: "rcd", label: "Вводное УЗО", rating: "", poles: feedPoles, children: [] });
    const reord = inlineA.map((a, i) => tagReorder({ id: "", type: a.sym, label: a.title.split(" ")[0], rating: "", poles: feedPoles, children: [] }, "ap", i, inlineA.length));
    // reorder-ref у аппаратов должен нести ключ (а не индекс) — reorderInput ищет по ключу
    reord.forEach((n, i) => { n.reorder = "ap:" + inlineA[i].key; });
    const nodes = fixed.concat(reord);
    for (let i = 0; i < nodes.length - 1; i++) nodes[i].children = [nodes[i + 1]];
    const rt = nodes[0], tail = nodes[nodes.length - 1];

    const extra = branchA.map((a) => ({ id: "", type: a.sym, label: a.title, rating: "", poles: 1, children: [] }));
    tail.children = groupNodes.concat(extra);
    rt.busbarCable = cableShort(M.busbarCable, M.busbarCableLen);
    rt.interactive = true;
    return rt;
  }

  function render(svg, p) {
    const tree = buildTree(p);
    if (!tree || !window.ShieldSchemeSVG) { svg.setAttribute("width", "300"); svg.setAttribute("height", "60"); return; }
    window.ShieldSchemeSVG.renderGost(svg, tree);
  }

  // ---- реордер по кликам в SVG-предпросмотре (data-vreorder/greorder/lreorder) ----
  function reorderInput(p, key, dir) {
    const M = ms(p);
    const full = M.apparatusOrder || [];
    const isInline = (k) => { const a = APPAR.find((x) => x.key === k); return !!(a && a.inline && M.apparatus[k]); };
    const inlineKeys = full.filter(isInline);
    const i = inlineKeys.indexOf(key); if (i < 0) return;
    const j = dir === "up" ? i - 1 : i + 1; if (j < 0 || j >= inlineKeys.length) return;
    const pa = full.indexOf(inlineKeys[i]), pb = full.indexOf(inlineKeys[j]); if (pa < 0 || pb < 0) return;
    const c = core(); c.commit();
    const t0 = full[pa]; full[pa] = full[pb]; full[pb] = t0;
    c.persist("mscheme-reorder");
  }
  function vreorder(p, ref, dir) {
    const M = ms(p);
    const parts = String(ref).split(":");
    if (parts[0] === "ap") return reorderInput(p, parts[1], dir);
    let arr = null, idx = -1;
    const g = M.groups[+parts[1]];
    if (parts[0] === "gb") { arr = g && g.apps; idx = +parts[2]; }
    else if (parts[0] === "ga") { arr = g && g.appsAfter; idx = +parts[2]; }
    else if (parts[0] === "la") { const ln = g && g.lines && g.lines[+parts[2]]; arr = ln && ln.apps; idx = +parts[3]; }
    if (!arr || idx < 0) return;
    const j = dir === "up" ? idx - 1 : idx + 1; if (j < 0 || j >= arr.length) return;
    const c = core(); c.commit();
    const t0 = arr[idx]; arr[idx] = arr[j]; arr[j] = t0;
    c.persist("mscheme-reorder");
  }
  function reorderGroup(p, gi, dir) {
    const M = ms(p);
    const j = dir === "left" ? gi - 1 : gi + 1;
    if (gi < 0 || gi >= M.groups.length || j < 0 || j >= M.groups.length) return;
    const c = core(); c.commit();
    const t0 = M.groups[gi]; M.groups[gi] = M.groups[j]; M.groups[j] = t0;
    c.persist("mscheme-reorder");
  }
  function reorderLine(p, gi, li, dir) {
    const M = ms(p);
    const g = M.groups[gi]; if (!g || !g.lines) return;
    const j = dir === "left" ? li - 1 : li + 1;
    if (li < 0 || li >= g.lines.length || j < 0 || j >= g.lines.length) return;
    const c = core(); c.commit();
    const t0 = g.lines[li]; g.lines[li] = g.lines[j]; g.lines[j] = t0;
    c.persist("mscheme-reorder");
  }

  // ---- редактор (HTML-строка — вставляется в #ep-psc-edit после переключателя режима) ----
  function checklistHtml(p) {
    const circuits = p.circuits || [];
    if (!circuits.length) return `<div class="ep-plan-modehint">Линий (QF) с плана нет — назначь линии точкам в 🔌, затем возьми их сюда.</div>`;
    const placed = placedCircuitIds(p);
    const n = circuits.filter((c) => placed.has(c.id)).length;
    return `<div class="ep-plan-srow"><b>Линии с плана</b><span class="ep-plan-flex"></span><span>${n}/${circuits.length} расставлено</span></div>
      <div class="ep-plan-mschecklist">${circuits.map((c) => `<div class="ep-plan-mscheckrow${placed.has(c.id) ? " is-done" : ""}"><i class="ep-plan-cdot" style="background:${esc(c.color)}"></i><span>${esc(c.name)}</span><b>${placed.has(c.id) ? "✓" : "—"}</b></div>`).join("")}</div>`;
  }
  function apparatusChips(p) {
    const M = ms(p);
    return APPAR.map((a) => `<button type="button" class="ep-plan-chip ep-clickable ${M.apparatus[a.key] ? "on" : ""}" data-pms-ap="${a.key}">${esc(a.title)}</button>`).join("");
  }
  function appChipsRow(keys, ref) {
    const list = keys || [];
    if (!list.length) return `<span class="ep-plan-msnone">—</span>`;
    return list.map((k, idx) => `<span class="ep-plan-mschip">${esc(appMeta(k).title)}<i class="ep-plan-mschipx ep-clickable" data-pms-appx="${ref}:${idx}" title="Убрать">✕</i></span>`).join("");
  }
  function appAddSelect(dataName, dataVal) {
    return `<select class="ep-plan-sel" data-${dataName}="${esc(dataVal)}"><option value="">+ аппарат…</option>${APP_PICK.map((k) => `<option value="${k}">${esc(appMeta(k).title)}</option>`).join("")}</select>`;
  }
  function apparatusSection(p) {
    const M = ms(p);
    const cables = core().DEFAULTS.cables;
    return `<div class="ep-plan-srow"><b>Аппараты вводной цепи</b></div>
      <div class="ep-plan-mschips">${apparatusChips(p)}</div>
      <div class="ep-plan-srow ep-plan-cabrow">
        <span title="Кабель обвязки">🔌</span>
        <select class="ep-plan-sel" data-pms-buscab><option value="">— кабель обвязки —</option>${cables.map((cb) => `<option value="${esc(cb)}" ${M.busbarCable === cb ? "selected" : ""}>${esc(cb)}</option>`).join("")}</select>
        <input type="number" inputmode="decimal" min="0" step="0.5" data-pms-buslen value="${M.busbarCableLen == null ? "" : esc(M.busbarCableLen)}" placeholder="м" style="width:70px">
      </div>`;
  }
  function groupCard(p, g, gi) {
    const is3 = p.settings.phases === 3;
    const g3 = g.phase === "3";
    const placed = placedCircuitIds(p);
    const cables = core().DEFAULTS.cables;
    const lines = (g.lines || []).map((l, li) => {
      const circuit = l.circuitId ? circuitById(p, l.circuitId) : null;
      const loadInfo = circuit && EP.Plan.Scheme ? EP.Plan.Scheme.loadSummary(p, circuit) : "";
      return `
      <div class="ep-plan-lineRow">
        <input type="text" data-pms-lname="${gi}:${li}" value="${esc(l.name || "")}" placeholder="Название линии" style="flex:1 1 120px">
        <select class="ep-plan-sel" data-pms-lcurve="${gi}:${li}">${CURVES.map((c) => `<option value="${c}" ${l.curve === c ? "selected" : ""}>${c}</option>`).join("")}</select>
        <select class="ep-plan-sel" data-pms-lamp="${gi}:${li}">${AMPS_LINE.map((a) => `<option value="${a}" ${Number(l.amp) === a ? "selected" : ""}>${a}А</option>`).join("")}</select>
        ${is3 ? `<button type="button" class="ep-plan-chip ep-clickable ${l.phase === "3" ? "on" : ""}" data-pms-lphase="${gi}:${li}">${l.phase === "3" ? "3ф" : "1ф"}</button>` : ""}
        <button type="button" class="ep-plan-mini ep-plan-danger ep-clickable" data-pms-ldel="${gi}:${li}">✕</button>
      </div>
      <div class="ep-plan-lineRow">
        <select class="ep-plan-sel" data-pms-lcab="${gi}:${li}"><option value="">авто</option>${cables.map((cb) => `<option value="${esc(cb)}" ${l.cable === cb ? "selected" : ""}>${esc(cb)}</option>`).join("")}</select>
        <input type="number" inputmode="decimal" min="0" step="0.5" data-pms-lclen="${gi}:${li}" value="${l.cableLen == null ? "" : esc(l.cableLen)}" placeholder="м" style="width:70px">
        ${circuit ? `<span class="ep-plan-mshint">${esc(loadInfo)}</span>` : ""}
      </div>
      <div class="ep-plan-msapps"><span class="ep-plan-mshint">Аппараты:</span>${appChipsRow(l.apps, "l:" + gi + ":" + li)}${appAddSelect("pms-lappadd", gi + ":" + li)}</div>`;
    }).join("");
    const freeCircuits = (p.circuits || []).filter((c) => !placed.has(c.id));
    return `<div class="ep-plan-msgroup">
      <div class="ep-plan-srow">
        <input type="text" data-pms-gtitle="${gi}" value="${esc(g.title || "")}" placeholder="Название группы" style="flex:1;font-weight:700">
        <button type="button" class="ep-plan-mini ep-plan-danger ep-clickable" data-pms-gdel="${gi}">✕</button>
      </div>
      <div class="ep-plan-srow">
        <button type="button" class="ep-plan-chip ep-clickable ${g.kind !== "dif" ? "on" : ""}" data-pms-gkind="${gi}:uzo">УЗО</button>
        <button type="button" class="ep-plan-chip ep-clickable ${g.kind === "dif" ? "on" : ""}" data-pms-gkind="${gi}:dif">Диф</button>
        <select class="ep-plan-sel" data-pms-gleak="${gi}">${[30, 10].map((v) => `<option value="${v}" ${Number(g.leak) === v ? "selected" : ""}>${v} мА</option>`).join("")}</select>
        <select class="ep-plan-sel" data-pms-grtype="${gi}">${RCD_TYPES.map((t) => `<option value="${t}" ${g.rcdType === t ? "selected" : ""}>тип ${t}</option>`).join("")}</select>
        ${g.kind === "dif" ? `<select class="ep-plan-sel" data-pms-gcurve="${gi}">${CURVES.map((c) => `<option value="${c}" ${g.curve === c ? "selected" : ""}>кл. ${c}</option>`).join("")}</select>` : ""}
        <select class="ep-plan-sel" data-pms-gamp="${gi}">${AMPS_GROUP.map((a) => `<option value="${a}" ${Number(g.amp) === a ? "selected" : ""}>${a}А</option>`).join("")}</select>
        ${is3 ? `<button type="button" class="ep-plan-chip ep-clickable ${g3 ? "on" : ""}" data-pms-gphase="${gi}">${g3 ? "3ф" : "1ф"}</button>` : ""}
        ${is3 && !g3 ? `<select class="ep-plan-sel" data-pms-gphasesel="${gi}">${["1", "2", "3"].map((n) => `<option value="${n}" ${g.phaseSel === n ? "selected" : ""}>L${n}</option>`).join("")}</select>` : ""}
      </div>
      <div class="ep-plan-msapps"><span class="ep-plan-mshint">До УЗО:</span>${appChipsRow(g.apps, "gb:" + gi)}${appAddSelect("pms-gappadd", gi)}</div>
      <div class="ep-plan-msapps"><span class="ep-plan-mshint">После УЗО:</span>${appChipsRow(g.appsAfter, "ga:" + gi)}${appAddSelect("pms-gappadda", gi)}</div>
      <div class="ep-plan-mslines">${lines || `<div class="ep-plan-modehint">Линий нет — добавь ниже.</div>`}</div>
      <select class="ep-plan-sel" data-pms-addline="${gi}">
        <option value="">+ линия…</option>
        ${freeCircuits.length ? `<optgroup label="С плана">${freeCircuits.map((c) => `<option value="${esc(c.id)}">${esc(c.name)}</option>`).join("")}</optgroup>` : ""}
        <option value="_manual">— вручную —</option>
      </select>
    </div>`;
  }
  function editorHtml(p) {
    const M = ms(p);
    return `${checklistHtml(p)}
      ${apparatusSection(p)}
      <div class="ep-plan-srow"><b>Группы и линии</b></div>
      <div class="ep-plan-msgroups">${M.groups.map((g, gi) => groupCard(p, g, gi)).join("") || `<div class="ep-plan-modehint">Групп нет. Нажми «+ группа».</div>`}</div>
      <div class="ep-plan-srow ep-plan-sbtns"><button type="button" class="btn btn-primary ep-clickable" data-pms-addgroup>+ группа</button></div>`;
  }

  // ---- события ----
  function active() {
    return !!(rooms() && rooms().isActive() && EP.Plan.Scheme && EP.Plan.Scheme.isOpen() && core().project && core().project.settings.schemeMode === "manual");
  }
  function refresh() { if (EP.Plan.Scheme && EP.Plan.Scheme.refresh) EP.Plan.Scheme.refresh(); }
  function drawOnly() { if (EP.Plan.Scheme && EP.Plan.Scheme.draw) EP.Plan.Scheme.draw(); }

  document.addEventListener("click", (e) => {
    if (!active()) return;
    const t = e.target, p = core().project, c = core();
    let el;
    if ((el = t.closest("[data-pms-ap]"))) {
      const k = el.getAttribute("data-pms-ap"), M = ms(p);
      c.commit();
      M.apparatus[k] = !M.apparatus[k];
      if (M.apparatus[k]) { if (M.apparatusOrder.indexOf(k) < 0) M.apparatusOrder.push(k); }
      else M.apparatusOrder = M.apparatusOrder.filter((x) => x !== k);
      c.persist("mscheme-ap"); refresh(); return;
    }
    if ((el = t.closest("[data-pms-gkind]"))) { const [gi, kind] = el.getAttribute("data-pms-gkind").split(":"); const g = ms(p).groups[+gi]; if (g) { c.commit(); g.kind = kind; c.persist("mscheme-gkind"); refresh(); } return; }
    if ((el = t.closest("[data-pms-gphase]"))) { const gi = +el.getAttribute("data-pms-gphase"); const g = ms(p).groups[gi]; if (g) { c.commit(); g.phase = g.phase === "3" ? "1" : "3"; c.persist("mscheme-gphase"); refresh(); } return; }
    if ((el = t.closest("[data-pms-lphase]"))) { const [gi, li] = el.getAttribute("data-pms-lphase").split(":").map(Number); const ln = ms(p).groups[gi] && ms(p).groups[gi].lines[li]; if (ln) { c.commit(); ln.phase = ln.phase === "3" ? "1" : "3"; c.persist("mscheme-lphase"); refresh(); } return; }
    if ((el = t.closest("[data-pms-appx]"))) {
      const parts = el.getAttribute("data-pms-appx").split(":");
      const M = ms(p);
      let arr = null;
      if (parts[0] === "gb") { const g = M.groups[+parts[1]]; arr = g && g.apps; }
      else if (parts[0] === "ga") { const g = M.groups[+parts[1]]; arr = g && g.appsAfter; }
      else if (parts[0] === "l") { const g = M.groups[+parts[1]]; const ln = g && g.lines[+parts[2]]; arr = ln && ln.apps; }
      const idx = +parts[parts.length - 1];
      if (arr && idx >= 0 && idx < arr.length) { c.commit(); arr.splice(idx, 1); c.persist("mscheme-appdel"); refresh(); }
      return;
    }
    if ((el = t.closest("[data-pms-ldel]"))) { const [gi, li] = el.getAttribute("data-pms-ldel").split(":").map(Number); const g = ms(p).groups[gi]; if (g) { c.commit(); g.lines.splice(li, 1); c.persist("mscheme-ldel"); refresh(); } return; }
    if ((el = t.closest("[data-pms-gdel]"))) { const gi = +el.getAttribute("data-pms-gdel"); if (confirm("Удалить группу?")) { c.commit(); ms(p).groups.splice(gi, 1); c.persist("mscheme-gdel"); refresh(); } return; }
    if (t.closest("[data-pms-addgroup]")) { c.commit(); ms(p).groups.push(c.model.newSchemeGroup("Группа " + (ms(p).groups.length + 1))); c.persist("mscheme-gadd"); refresh(); return; }
    // реордер прямо в SVG-предпросмотре (кнопки ▲▼/◀▶ рисует ShieldSchemeSVG.renderGost)
    if ((el = t.closest("[data-vreorder]"))) { vreorder(p, el.getAttribute("data-vref"), el.getAttribute("data-vreorder")); drawOnly(); return; }
    if ((el = t.closest("[data-greorder]"))) { reorderGroup(p, +el.getAttribute("data-gi"), el.getAttribute("data-greorder")); drawOnly(); return; }
    if ((el = t.closest("[data-lreorder]"))) { reorderLine(p, +el.getAttribute("data-gi"), +el.getAttribute("data-li"), el.getAttribute("data-lreorder")); drawOnly(); return; }
  });

  document.addEventListener("change", (e) => {
    if (!active()) return;
    const t = e.target, ga = (a) => t.getAttribute && t.getAttribute(a);
    const p = core().project, c = core();
    let ref;
    if ((ref = ga("data-pms-addline"))) {
      const gi = +ref, g = ms(p).groups[gi], val = t.value;
      if (g && val) {
        c.commit();
        const ln = c.model.newSchemeLine("");
        if (val !== "_manual") { const circuit = circuitById(p, val); if (circuit) { ln.circuitId = circuit.id; ln.name = circuit.name; ln.amp = circuit.breaker || 16; ln.cable = circuit.cable || null; } }
        (g.lines = g.lines || []).push(ln);
        c.persist("mscheme-ladd"); refresh();
      }
      return;
    }
    if ((ref = ga("data-pms-gappadd"))) { const g = ms(p).groups[+ref]; const k = t.value; if (g && k) { c.commit(); (g.apps = g.apps || []).push(k); c.persist("mscheme-gapp"); refresh(); } return; }
    if ((ref = ga("data-pms-gappadda"))) { const g = ms(p).groups[+ref]; const k = t.value; if (g && k) { c.commit(); (g.appsAfter = g.appsAfter || []).push(k); c.persist("mscheme-gappa"); refresh(); } return; }
    if ((ref = ga("data-pms-lappadd"))) { const [gi, li] = ref.split(":").map(Number); const ln = ms(p).groups[gi] && ms(p).groups[gi].lines[li]; const k = t.value; if (ln && k) { c.commit(); (ln.apps = ln.apps || []).push(k); c.persist("mscheme-lapp"); refresh(); } return; }
    if ((ref = ga("data-pms-gleak"))) { const g = ms(p).groups[+ref]; if (g) { c.commit(); g.leak = Number(t.value) || 30; c.persist("mscheme-gleak"); drawOnly(); } return; }
    if ((ref = ga("data-pms-grtype"))) { const g = ms(p).groups[+ref]; if (g) { c.commit(); g.rcdType = t.value; c.persist("mscheme-grtype"); drawOnly(); } return; }
    if ((ref = ga("data-pms-gcurve"))) { const g = ms(p).groups[+ref]; if (g) { c.commit(); g.curve = t.value; c.persist("mscheme-gcurve"); drawOnly(); } return; }
    if ((ref = ga("data-pms-gamp"))) { const g = ms(p).groups[+ref]; if (g) { c.commit(); g.amp = Number(t.value) || 40; c.persist("mscheme-gamp"); drawOnly(); } return; }
    if ((ref = ga("data-pms-gphasesel"))) { const g = ms(p).groups[+ref]; if (g) { c.commit(); g.phaseSel = t.value; c.persist("mscheme-gphasesel"); drawOnly(); } return; }
    if ((ref = ga("data-pms-lcurve"))) { const [gi, li] = ref.split(":").map(Number); const ln = ms(p).groups[gi] && ms(p).groups[gi].lines[li]; if (ln) { c.commit(); ln.curve = t.value; c.persist("mscheme-lcurve"); drawOnly(); } return; }
    if ((ref = ga("data-pms-lamp"))) { const [gi, li] = ref.split(":").map(Number); const ln = ms(p).groups[gi] && ms(p).groups[gi].lines[li]; if (ln) { c.commit(); ln.amp = Number(t.value) || 16; c.persist("mscheme-lamp"); drawOnly(); } return; }
    if ((ref = ga("data-pms-lcab"))) { const [gi, li] = ref.split(":").map(Number); const ln = ms(p).groups[gi] && ms(p).groups[gi].lines[li]; if (ln) { c.commit(); ln.cable = t.value || null; c.persist("mscheme-lcab"); drawOnly(); } return; }
    if ((ref = ga("data-pms-lclen"))) { const [gi, li] = ref.split(":").map(Number); const ln = ms(p).groups[gi] && ms(p).groups[gi].lines[li]; if (ln) { c.commit(); ln.cableLen = t.value || null; c.persist("mscheme-lclen"); drawOnly(); } return; }
    if (t.hasAttribute && t.hasAttribute("data-pms-buscab")) { c.commit(); ms(p).busbarCable = t.value || null; c.persist("mscheme-buscab"); drawOnly(); return; }
  });

  document.addEventListener("input", (e) => {
    if (!active()) return;
    const t = e.target, ga = (a) => t.getAttribute && t.getAttribute(a);
    const p = core().project, c = core();
    let ref;
    if ((ref = ga("data-pms-gtitle"))) { const g = ms(p).groups[+ref]; if (g) { g.title = t.value; c.persist("mscheme-gtitle"); drawOnly(); } return; }
    if ((ref = ga("data-pms-lname"))) { const [gi, li] = ref.split(":").map(Number); const ln = ms(p).groups[gi] && ms(p).groups[gi].lines[li]; if (ln) { ln.name = t.value; c.persist("mscheme-lname"); drawOnly(); } return; }
    if (t.hasAttribute && t.hasAttribute("data-pms-buslen")) { ms(p).busbarCableLen = t.value || null; c.persist("mscheme-buslen"); drawOnly(); return; }
  });

  EP.Plan = EP.Plan || {};
  EP.Plan.ManualScheme = { buildTree, render, editorHtml, checklistHtml };
})();
