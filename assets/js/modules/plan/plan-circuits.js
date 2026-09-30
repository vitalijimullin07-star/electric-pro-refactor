/* Electric Pro V29 — Проект квартиры: ДВИЖОК ЦЕПЕЙ (EP.Plan.Circuits).
   ЕДИНАЯ точка ответа на вопрос «что откуда питается»:
     точка → линия (QF) → автомат → УЗО (своё/групповое) → щит → кабель → трассы.
   До этого модуля два звена в модели отсутствовали вовсе:
   · линия не знала СВОЙ щит — трасса просто шла к ближайшему подходящему, и в
     многощитовом проекте ни схема, ни подбор корпуса не могли понять, чья линия;
   · УЗО было ГАЛОЧКОЙ на линии (c.rcd) — «УЗО 1 → QF4, QF5, QF6» собрать было нельзя,
     а корпус щита считал по УЗО на каждую линию (известное завышение модулей).
   Модель (всё новое — необязательное, старые проекты ведут себя как раньше):
   · circuit.panelId — ЯВНЫЙ щит линии (null = определить автоматически);
   · p.rcdGroups — групповые УЗО [{id,name,rating,leak}];
   · circuit.rcdGroupId — линия под групповым УЗО. c.rcd остаётся признаком
     «линия защищена УЗО» (все проверки ПУЭ читают его как раньше), а КАК защищена —
     своим дифавтоматом или групповым УЗО — отвечает protOf().
   Модуль чистый (без DOM в расчётах), читается схемой, сметой, проверками и PDF —
   поэтому смена автомата/УЗО/щита у линии видна во всех представлениях сразу. */
(() => {
  "use strict";
  window.EP = window.EP || {};
  EP.Plan = EP.Plan || {};
  const core = () => EP.Plan.Core;
  const G = () => EP.Plan.Geometry;
  const esc = (s) => String(s == null ? "" : s).replace(/[&<>"']/g, (m) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[m]);

  const RCD_RATINGS = [25, 40, 63, 80];
  const RCD_LEAKS = [10, 30, 100, 300];
  const LV = { lv: 1, tv: 1, cctv: 1 };

  function groups(p) { if (!Array.isArray(p.rcdGroups)) p.rcdGroups = []; return p.rcdGroups; }
  function groupById(p, id) { return id ? groups(p).find((g) => g.id === id) || null : null; }
  function newGroup(p, opts) {
    const gs = groups(p);
    const n = gs.reduce((m, g) => { const k = parseInt(String(g.name).replace(/\D/g, ""), 10); return Number.isFinite(k) ? Math.max(m, k) : m; }, 0) + 1;
    const g = Object.assign({ id: core().uid("rg"), name: "УЗО" + n, rating: 40, leak: 30 }, opts || {});
    gs.push(g);
    return g;
  }
  // убрать групповое УЗО: его линии НЕ теряют защиту — становятся линиями со своим
  // дифавтоматом (c.rcd остаётся true). Иначе удаление группы молча снимало бы УЗО
  // с розеток ванной, и проверки ПУЭ узнали бы об этом последними.
  function removeGroup(p, id) {
    p.rcdGroups = groups(p).filter((g) => g.id !== id);
    (p.circuits || []).forEach((c) => { if (c.rcdGroupId === id) c.rcdGroupId = null; });
  }

  // как защищена линия: "group" (групповое УЗО), "own" (свой дифавтомат), "none"
  function protOf(p, c) {
    const g = c && groupById(p, c.rcdGroupId);
    if (g) return { kind: "group", group: g };
    if (c && c.rcd) return { kind: "own", group: null };
    return { kind: "none", group: null };
  }
  // v: "none" | "own" | "grp:<id>" | "new" (создать новое групповое УЗО и посадить линию)
  function setProtection(p, c, v) {
    if (!c) return null;
    if (v === "none") { c.rcd = false; c.rcdGroupId = null; return protOf(p, c); }
    if (v === "own") { c.rcd = true; c.rcdGroupId = null; return protOf(p, c); }
    let g = null;
    if (v === "new") g = newGroup(p);
    else if (typeof v === "string" && v.indexOf("grp:") === 0) g = groupById(p, v.slice(4));
    if (!g) return protOf(p, c);
    c.rcd = true; c.rcdGroupId = g.id;
    return protOf(p, c);
  }
  function protLabel(p, c) {
    const pr = protOf(p, c);
    if (pr.kind === "group") return `${pr.group.name} ${pr.group.rating}A ${pr.group.leak}мА`;
    if (pr.kind === "own") return `диф ${c.rcdRating || 30}мА`;
    return "";
  }

  // ---- щит линии ----
  const isPlain = (pn) => !pn.router && !pn.transformer;
  // «главный» щит проекта — квартирный: первый щит без признаков слаботочного
  // (роутер/трансформатор), иначе просто первый. Ему принадлежат вводной аппарат,
  // счётчик и вводное УЗО из настроек проекта.
  function mainPanel(p) {
    const ps = p.panels || [];
    return ps.find(isPlain) || ps[0] || null;
  }
  // род линии по её нагрузке — какой щит её принимает, пока щит не задан явно
  // (то же правило, что у трассировки: 24В → трансформатор, слаботочка → роутер)
  function lineKind(p, c) {
    const els = (p.elements || []).filter((e) => e.circuitId === c.id);
    if (!els.length) return "pw";
    if (els.every((e) => e.type === "output24")) return "24";
    if (els.every((e) => LV[e.layer])) return "lv";
    return "pw";
  }
  function panelOf(p, c) {
    const ps = p.panels || [];
    if (!c || !ps.length) return { panel: null, explicit: false };
    if (c.panelId) { const pn = ps.find((x) => x.id === c.panelId); if (pn) return { panel: pn, explicit: true }; }
    // по уже построенным трассам — трассировка решила, куда реально идёт кабель
    const cnt = {};
    (p.routes || []).forEach((r) => { if (r.circuitId === c.id && r.toPanel && !r.toRiser && r.toId) cnt[r.toId] = (cnt[r.toId] || 0) + 1; });
    const best = Object.keys(cnt).sort((a, b) => cnt[b] - cnt[a])[0];
    if (best) { const pn = ps.find((x) => x.id === best); if (pn) return { panel: pn, explicit: false }; }
    // трасс нет — по роду нагрузки, ближайший подходящий щит к центру точек линии
    const kind = lineKind(p, c);
    let cand = kind === "24" ? ps.filter((x) => x.transformer) : kind === "lv" ? ps.filter((x) => x.router) : ps.filter(isPlain);
    if (!cand.length) cand = kind === "pw" ? ps : ps.filter(isPlain);
    if (!cand.length) cand = ps;
    const pts = (p.elements || []).filter((e) => e.circuitId === c.id).map((e) => G().elemPoint(p, e)).filter(Boolean);
    if (!pts.length || cand.length === 1) return { panel: cand.indexOf(mainPanel(p)) >= 0 ? mainPanel(p) : cand[0], explicit: false };
    const cx = pts.reduce((s, q) => s + q.x, 0) / pts.length, cy = pts.reduce((s, q) => s + q.y, 0) / pts.length;
    const pick = cand.slice().sort((a, b) => Math.hypot(a.x - cx, a.y - cy) - Math.hypot(b.x - cx, b.y - cy))[0];
    return { panel: pick, explicit: false };
  }
  function setPanel(p, c, panelId) {
    if (!c) return;
    c.panelId = panelId && (p.panels || []).some((x) => x.id === panelId) ? panelId : null;
  }
  // линии щита (panelId не задан — все линии проекта, как раньше)
  function linesOf(p, panelId) {
    const cs = p.circuits || [];
    if (!panelId) return cs.slice();
    return cs.filter((c) => { const r = panelOf(p, c); return (r.panel ? r.panel.id : null) === panelId; });
  }

  // ---- аппараты щита: ОДИН список для модулей корпуса, сметы и спецификации ----
  // Дифавтомат — ОДИН аппарат (раньше смета считала его и автоматом, и УЗО разом).
  function devices(p, panelId) {
    const out = [];
    const lines = linesOf(p, panelId);
    const used = new Map();
    lines.forEach((c) => {
      const pr = protOf(p, c), poles = c.poles === 3 ? 3 : 1, amp = Number(c.breaker) || 16;
      if (pr.kind === "own") out.push({ kind: "rcbo", poles, amp, leak: c.rcdRating || 30, lineIds: [c.id] });
      else out.push({ kind: "mcb", poles, amp, lineIds: [c.id] });
      if (pr.kind === "group") {
        const u = used.get(pr.group.id) || { g: pr.group, lines: [] };
        u.lines.push(c); used.set(pr.group.id, u);
      }
    });
    used.forEach(({ g, lines: ls }) => {
      const poles = ls.some((c) => c.poles === 3) ? 3 : 1;
      out.push({ kind: "rcd", poles, amp: Number(g.rating) || 40, leak: Number(g.leak) || 30, groupId: g.id, name: g.name, lineIds: ls.map((c) => c.id) });
    });
    return out;
  }
  // модулей в щите: вводной (+ вводное УЗО) — только у главного щита, у остальных
  // питающий аппарат считаем как вводной того же числа полюсов
  function modulesOfDevice(d) {
    if (d.kind === "mcb") return d.poles === 3 ? 3 : 1;
    return d.poles === 3 ? 4 : 2; // rcbo / rcd
  }
  function modules(p, panelId, opts) {
    const s = p.settings || {};
    const main = mainPanel(p);
    const isMain = !panelId || !main || panelId === main.id;
    let m = s.phases === 3 ? 3 : 1;
    if (isMain && s.mainRcd) m += s.phases === 3 ? 4 : 2;
    devices(p, panelId).forEach((d) => { m += modulesOfDevice(d); });
    if (!(opts && opts.noReserve)) m += Math.max(0, s.panelReserve || 0);
    return m;
  }

  // ---- дерево однолинейки: линии без группы — прямо на шину, групповые — под своим УЗО ----
  function tree(p, panelId, lineNode) {
    const lines = linesOf(p, panelId);
    const out = [];
    const byGroup = new Map();
    lines.forEach((c) => {
      const pr = protOf(p, c);
      if (pr.kind === "group") {
        if (!byGroup.has(pr.group.id)) {
          const node = { id: pr.group.name, label: `${pr.group.leak}мА`, rating: (pr.group.rating || 40) + "A", type: "rcd", poles: 1, children: [] };
          byGroup.set(pr.group.id, node); out.push(node);
        }
        const node = byGroup.get(pr.group.id);
        const ln = lineNode(c, "mcb");
        if (ln.poles === 3) node.poles = 3;
        node.children.push(ln);
      } else out.push(lineNode(c, pr.kind === "own" ? "rcbo" : "mcb"));
    });
    return out;
  }

  // ---- цепочка точки: что показывать в редакторе точки ----
  function chain(p, el) {
    if (!el) return null;
    const c = (p.circuits || []).find((x) => x.id === el.circuitId) || null;
    if (!c) return { circuit: null };
    const pr = protOf(p, c), pn = panelOf(p, c);
    const SC = EP.Plan.Scheme, R = EP.Plan.Routes;
    let lenCm = null;
    try { const L = R && R.lengths ? R.lengths(p) : null; lenCm = L && L.byCircuit ? (L.byCircuit[c.id] || 0) : null; } catch (e) {}
    const routes = (p.routes || []).filter((r) => r.circuitId === c.id);
    return {
      circuit: c, breaker: Number(c.breaker) || 16, poles: c.poles === 3 ? 3 : 1,
      prot: pr, protText: protLabel(p, c), panel: pn.panel, panelExplicit: pn.explicit,
      cable: c.cable || (SC && SC.autoCable ? SC.autoCable(p, c) : ""),
      routes: routes.length, lenCm,
      points: (p.elements || []).filter((e) => e.circuitId === c.id).length
    };
  }
  function chainHtml(p, el) {
    const ch = chain(p, el);
    if (!ch || !ch.circuit) return "";
    const c = ch.circuit;
    const step = (label, val) => `<span class="ep-plan-chainstep"><i>${label}</i>${val}</span>`;
    const len = ch.lenCm != null && ch.routes ? `${(ch.lenCm / 100).toFixed(1)} м` : "нет трассы";
    return `<div class="ep-plan-chainrow" aria-label="Откуда питается точка">
      ${step("линия", `<b style="color:${esc(c.color)}">${esc(c.name)}</b>`)}
      ${step("автомат", `${ch.poles === 3 ? "3P " : ""}${ch.breaker}A`)}
      ${step("УЗО", esc(ch.protText || "нет"))}
      ${step("щит", ch.panel ? esc(ch.panel.name) + (ch.panelExplicit ? "" : " (авто)") : "—")}
      ${step("кабель", esc(ch.cable || "—"))}
      ${step("трасса", len)}
    </div>`;
  }

  // ---- разметка выбора (общая для схемы и шторки «Трассы») ----
  function protSelectHtml(p, c, attr) {
    const pr = protOf(p, c);
    const cur = pr.kind === "group" ? "grp:" + pr.group.id : pr.kind;
    const opt = (v, l) => `<option value="${esc(v)}" ${cur === v ? "selected" : ""}>${esc(l)}</option>`;
    return `<select ${attr}="${esc(c.id)}" class="ep-plan-sel ep-plan-protsel" aria-label="Защита УЗО линии ${esc(c.name)}">
      ${opt("none", "без УЗО")}${opt("own", "диф (своё)")}
      ${groups(p).map((g) => opt("grp:" + g.id, g.name + " " + g.rating + "A")).join("")}
      <option value="new">+ групповое УЗО</option></select>`;
  }
  function panelSelectHtml(p, c, attr) {
    const ps = p.panels || [];
    if (ps.length < 2) return "";
    const r = panelOf(p, c);
    const cur = c.panelId && r.explicit ? c.panelId : "";
    return `<select ${attr}="${esc(c.id)}" class="ep-plan-sel ep-plan-pansel" aria-label="Щит линии ${esc(c.name)}">
      <option value="" ${cur ? "" : "selected"}>щит: авто${r.panel && !cur ? " (" + esc(r.panel.name) + ")" : ""}</option>
      ${ps.map((pn) => `<option value="${esc(pn.id)}" ${cur === pn.id ? "selected" : ""}>${esc(pn.name)}</option>`).join("")}</select>`;
  }
  // блок «Групповые УЗО»: номинал/ток утечки/удаление; data-pcx-* ловит хост (схема)
  function groupsEditorHtml(p) {
    const gs = groups(p);
    if (!gs.length) return `<div class="ep-plan-modehint">Групповых УЗО нет. Выбери у линии «+ групповое УЗО», чтобы посадить несколько линий под одно УЗО.</div>`;
    return gs.map((g) => {
      const n = (p.circuits || []).filter((c) => c.rcdGroupId === g.id);
      const maxBr = n.reduce((m, c) => Math.max(m, Number(c.breaker) || 0), 0);
      const warn = n.length && (Number(g.rating) || 0) < maxBr ? ` <span class="ep-plan-warnrow">номинал ниже автомата линии (${maxBr}A)</span>` : "";
      return `<div class="ep-plan-lineRow">
        <b>${esc(g.name)}</b>
        <select data-pcx-grating="${esc(g.id)}" class="ep-plan-sel" aria-label="Номинал ${esc(g.name)}">${RCD_RATINGS.map((a) => `<option value="${a}" ${Number(g.rating) === a ? "selected" : ""}>${a}A</option>`).join("")}</select>
        <select data-pcx-gleak="${esc(g.id)}" class="ep-plan-sel" aria-label="Ток утечки ${esc(g.name)}">${RCD_LEAKS.map((a) => `<option value="${a}" ${Number(g.leak) === a ? "selected" : ""}>${a}мА</option>`).join("")}</select>
        <span class="ep-plan-qfmeta">${n.length ? n.map((c) => esc(c.name)).join(", ") : "нет линий"}</span>${warn}
        <span class="ep-plan-flex"></span>
        <button type="button" class="ep-plan-mini ep-plan-danger ep-clickable" data-pcx-gdel="${esc(g.id)}" aria-label="Удалить ${esc(g.name)}">✕</button>
      </div>`;
    }).join("");
  }
  // общий обработчик изменений из разметки выше: возвращает true, если событие его
  function handleChange(t, onDone) {
    const ga = (a) => t.getAttribute && t.getAttribute(a);
    const c0 = core(), p = c0 && c0.project;
    if (!p) return false;
    const circ = (id) => (p.circuits || []).find((x) => x.id === id);
    let id;
    if ((id = ga("data-pcx-prot"))) { const cc = circ(id); if (!cc) return true; c0.commit(); setProtection(p, cc, t.value); c0.persist("circuit-prot"); if (onDone) onDone(); return true; }
    if ((id = ga("data-pcx-panel"))) { const cc = circ(id); if (!cc) return true; c0.commit(); setPanel(p, cc, t.value || null); c0.persist("circuit-panel"); if (onDone) onDone(); return true; }
    if ((id = ga("data-pcx-grating"))) { const g = groupById(p, id); if (!g) return true; c0.commit(); g.rating = Number(t.value) || 40; c0.persist("rcd-group"); if (onDone) onDone(); return true; }
    if ((id = ga("data-pcx-gleak"))) { const g = groupById(p, id); if (!g) return true; c0.commit(); g.leak = Number(t.value) || 30; c0.persist("rcd-group"); if (onDone) onDone(); return true; }
    return false;
  }
  function handleClick(t, onDone) {
    const b = t.closest && t.closest("[data-pcx-gdel]");
    if (!b) return false;
    const c0 = core(), p = c0 && c0.project; if (!p) return true;
    c0.commit(); removeGroup(p, b.getAttribute("data-pcx-gdel")); c0.persist("rcd-group"); if (onDone) onDone();
    return true;
  }

  EP.Plan.Circuits = {
    RCD_RATINGS, RCD_LEAKS,
    groups, groupById, newGroup, removeGroup,
    protOf, setProtection, protLabel,
    mainPanel, lineKind, panelOf, setPanel, linesOf,
    devices, modulesOfDevice, modules, tree,
    chain, chainHtml,
    protSelectHtml, panelSelectHtml, groupsEditorHtml, handleChange, handleClick
  };
})();
