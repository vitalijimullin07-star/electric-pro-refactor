/* Electric Pro V29 — Проект квартиры: МОНТАЖ — задачи, готовность объекта, задание на день
   (EP.Plan.Work). Задачи НЕ вводятся руками — они выводятся из самого проекта:
   · по помещениям: «Штробы — Кухня», «Подрозетники — Кухня (7 шт)», «Механизмы — Кухня»;
   · по линиям: «Проложить QF3 — Розетки: Кухня»;
   · по распайкам: «Собрать распайку №2 — Коридор»; по щитам: «Собрать щит ЩК».
   Отметки ручных задач живут в p.work.done (ключ задачи → время), «механизмы» считаются
   сами по статусам точек (○ план / ◐ в работе / ✓ готово). Готовность объекта — среднее
   по задачам. Задание на день — p.work.today {date, keys}: мастер собирает список на сегодня
   из оставшихся задач, отмечает по ходу, может скопировать текстом (бригаде в мессенджер).
   Ключи задач стабильны (id помещения/линии/точки/щита) — удалил комнату, её задачи просто
   исчезли, отметки остальных не сдвинулись. */
(() => {
  "use strict";
  window.EP = window.EP || {};
  EP.Plan = EP.Plan || {};
  const core = () => EP.Plan.Core;
  const G = () => EP.Plan.Geometry;
  const rooms = () => EP.Plan.Rooms;
  const esc = (s) => String(s == null ? "" : s).replace(/[&<>"']/g, (m) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[m]);

  const NOT_POINT = { junction: 1, riser: 1, panel: 1, door: 1, window: 1 };
  const BOX_TYPES = { socket: 1, switch: 1, tv: 1, internet: 1, ac: 1, sensor: 1, warmfloor: 1, block: 1, intercom: 1, leak: 1, bra: 1 };
  const STAGES = [
    { id: "strobe", name: "Штробы", icon: "🔨" },
    { id: "boxes", name: "Подрозетники", icon: "⭘" },
    { id: "cable", name: "Кабель", icon: "〰" },
    { id: "junct", name: "Распайки", icon: "◇" },
    { id: "panel", name: "Щит", icon: "▤" },
    { id: "mech", name: "Механизмы", icon: "🔌" }
  ];
  const todayStr = () => { const d = new Date(); return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0"); };

  function work(p) {
    if (!p.work || typeof p.work !== "object") p.work = { done: {}, today: { date: "", keys: [] } };
    if (!p.work.done || typeof p.work.done !== "object") p.work.done = {};
    if (!p.work.today || typeof p.work.today !== "object") p.work.today = { date: "", keys: [] };
    if (!Array.isArray(p.work.today.keys)) p.work.today.keys = [];
    return p.work;
  }
  const doneMap = (p) => (p.work && p.work.done && typeof p.work.done === "object") ? p.work.done : {};

  function roomOfEl(p, el) {
    const rid = el.wallId && String(el.wallId).indexOf("beam:") !== 0 ? String(el.wallId).split(":")[0] : null;
    let r = rid ? (p.rooms || []).find((x) => x.id === rid) : null;
    if (!r) { const pt = G().elemPoint(p, el); r = pt ? (p.rooms || []).find((x) => (x.points || []).length >= 3 && G().pointInPolygon(pt, x.points)) : null; }
    return r || null;
  }
  const boxesOf = (el) => el.type === "block" ? Math.max(1, ((el.params && el.params.items) || []).length) : 1;

  // ---- задачи проекта (чистая функция) ----
  function tasks(p) {
    const out = [], done = doneMap(p);
    const pts = (p.elements || []).filter((e) => !NOT_POINT[e.type] && e.status !== "existing");
    const byRoom = new Map();
    pts.forEach((e) => { const r = roomOfEl(p, e); const k = r ? r.id : "_"; if (!byRoom.has(k)) byRoom.set(k, { room: r, els: [] }); byRoom.get(k).els.push(e); });
    const manual = (stage, key, title, qty) => out.push({ stage, key, title, qty: qty || "", auto: false, progress: done[key] ? 1 : 0 });
    (p.rooms || []).forEach((r) => {
      const b = byRoom.get(r.id); if (!b) return;
      const wall = b.els.filter((e) => e.wallId && BOX_TYPES[e.type]);
      if (wall.length) {
        manual("strobe", "strobe:" + r.id, `Штробы — ${r.name}`, "");
        manual("boxes", "boxes:" + r.id, `Подрозетники — ${r.name}`, wall.reduce((s, e) => s + boxesOf(e), 0) + " шт");
      }
    });
    (p.circuits || []).forEach((c) => {
      if (!pts.some((e) => e.circuitId === c.id)) return;
      manual("cable", "cable:" + c.id, `Проложить ${c.name}${c.title ? " — " + c.title : ""}`, "");
    });
    let jn = 0;
    (p.elements || []).filter((e) => e.type === "junction" && e.status !== "existing").forEach((e) => {
      jn++; const r = roomOfEl(p, e);
      manual("junct", "junct:" + e.id, `Собрать распайку №${jn}${r ? " — " + r.name : ""}`, "");
    });
    (p.panels || []).forEach((pn) => manual("panel", "panel:" + pn.id, `Собрать щит ${pn.name || ""}`.trim(), ""));
    // механизмы — АВТОМАТИЧЕСКИ по статусам точек помещения (◐ в работе = половина)
    byRoom.forEach((b, k) => {
      const tot = b.els.length; if (!tot) return;
      const mounted = b.els.filter((e) => e.status === "mounted").length, inWork = b.els.filter((e) => e.status === "work").length;
      out.push({ stage: "mech", key: "mech:" + k, title: `Механизмы — ${b.room ? b.room.name : "без помещения"}`, qty: `${mounted}/${tot}`,
        auto: true, progress: (mounted + inWork * 0.5) / tot, roomId: b.room ? b.room.id : null });
    });
    return out;
  }
  // готовность объекта: среднее по задачам (0..100, целое)
  function readiness(p) {
    const t = tasks(p);
    if (!t.length) return 0;
    return Math.round(t.reduce((s, x) => s + x.progress, 0) / t.length * 100);
  }
  // подпись готовности: работа начата, но до 1% не дотянула — «<1%», а не «0%»
  // (иначе мастер отметил первую розетку и видит «0%» — будто отметка не сработала)
  function readyLabel(p) {
    const t = tasks(p);
    const raw = t.length ? t.reduce((s, x) => s + x.progress, 0) / t.length * 100 : 0;
    return raw > 0 && raw < 0.5 ? "<1%" : Math.round(raw) + "%";
  }
  // уточнения количества для задания (метры/штуки) — из расшифровки Расчёта, если трассы есть
  function detailsFor(p) {
    const det = {};
    try {
      const res = EP.Plan.Calc && EP.Plan.Calc.calcByRoutes ? EP.Plan.Calc.calcByRoutes(p) : null;
      const o = res && res.origin;
      if (o) {
        const strobe = {};
        Object.keys(o).forEach((k) => { if (o[k].kind === "strobe") o[k].byRoom.forEach((x) => { strobe[x.room] = (strobe[x.room] || 0) + x.qty; }); });
        (p.rooms || []).forEach((r) => { if (strobe[r.name]) det["strobe:" + r.id] = (Math.round(strobe[r.name] * 10) / 10).toString().replace(".", ",") + " м"; });
      }
      const per = EP.Plan.Calc && EP.Plan.Calc.perCircuit ? EP.Plan.Calc.perCircuit(p) : null;
      (per || []).forEach((r) => { if (r.cableLen) det["cable:" + r.id] = (r.mark ? r.mark + " · " : "") + (Math.round(r.cableLen * 10) / 10).toString().replace(".", ",") + " м"; });
    } catch (e) {}
    return det;
  }

  // ---- мутации (одна запись истории на действие) ----
  function toggleDone(key) {
    const c = core(), p = c.project; if (!p) return;
    c.commit();
    const w = work(p);
    if (w.done[key]) delete w.done[key]; else w.done[key] = Date.now();
    c.persist("work");
  }
  function setToday(keys) {
    const c = core(), p = c.project; if (!p) return;
    c.commit();
    const w = work(p);
    w.today = { date: todayStr(), keys: keys.slice() };
    c.persist("work");
  }
  function todayKeys(p) {
    const w = p.work && p.work.today;
    return w && w.date === todayStr() && Array.isArray(w.keys) ? w.keys : [];
  }
  function staleKeys(p) {
    const w = p.work && p.work.today;
    if (!w || w.date === todayStr() || !Array.isArray(w.keys)) return [];
    const t = new Map(tasks(p).map((x) => [x.key, x]));
    return w.keys.filter((k) => t.has(k) && t.get(k).progress < 1);
  }
  function dayText(p) {
    const t = new Map(tasks(p).map((x) => [x.key, x])), det = detailsFor(p);
    const d = new Date();
    const lines = todayKeys(p).map((k) => t.get(k)).filter(Boolean)
      .map((x) => `${x.progress >= 1 ? "☑" : "☐"} ${x.title}${det[x.key] || x.qty ? " · " + (det[x.key] || x.qty) : ""}`);
    return `Задание на ${String(d.getDate()).padStart(2, "0")}.${String(d.getMonth() + 1).padStart(2, "0")} — ${p.name || "объект"}\n` + lines.join("\n") + `\nГотовность объекта: ${readyLabel(p)}`;
  }

  // ---- шторка «Задание на день» ----
  const S = { open: {} };
  function sheet() {
    const p = core().project; if (!p) return;
    const all = tasks(p), det = detailsFor(p);
    const byKey = new Map(all.map((x) => [x.key, x]));
    const today = todayKeys(p).map((k) => byKey.get(k)).filter(Boolean);
    const stale = staleKeys(p);
    const rd = readiness(p);
    const box = (x) => x.auto
      ? `<span class="ep-work-prog" aria-label="Готово ${Math.round(x.progress * 100)}%">${x.qty}</span>`
      : `<span class="ep-work-box${x.progress >= 1 ? " is-on" : ""}" aria-hidden="true">${x.progress >= 1 ? "✓" : ""}</span>`;
    const row = (x, inToday) => `<div class="ep-work-row${x.progress >= 1 ? " is-done" : ""}">
        <button type="button" class="ep-work-main ep-clickable" ${x.auto ? `data-pw-mech="${esc(x.roomId || "")}"` : `data-pw-toggle="${esc(x.key)}"`} aria-label="${esc(x.title)}">
          ${box(x)}<span class="ep-work-t">${esc(x.title)}${det[x.key] || (!x.auto && x.qty) ? `<i>${esc(det[x.key] || x.qty)}</i>` : ""}</span></button>
        ${inToday ? `<button type="button" class="ep-plan-mini ep-clickable" data-pw-rm="${esc(x.key)}" aria-label="Убрать из задания">✕</button>`
          : `<button type="button" class="ep-plan-mini ep-clickable" data-pw-add="${esc(x.key)}" aria-label="Добавить на сегодня">＋</button>`}
      </div>`;
    const todaySet = new Set(today.map((x) => x.key));
    const stages = STAGES.map((st) => {
      const list = all.filter((x) => x.stage === st.id && !todaySet.has(x.key) && x.progress < 1);
      if (!list.length) return "";
      return `<details class="ep-work-stage" ${S.open[st.id] ? "open" : ""} data-pw-stage="${st.id}"><summary>${st.icon} ${st.name} <span class="ep-plan-mshint">${list.length}</span></summary>
        ${list.map((x) => row(x, false)).join("")}</details>`;
    }).join("");
    const doneN = all.filter((x) => x.progress >= 1).length;
    const d = new Date();
    rooms().openSheet(`<div class="ep-plan-srow"><b>📋 Задание на ${String(d.getDate()).padStart(2, "0")}.${String(d.getMonth() + 1).padStart(2, "0")}</b><span class="ep-plan-flex"></span>
        <button type="button" class="ep-plan-mini ep-clickable" data-sheet-fs aria-label="Во весь экран">⛶</button>
        <button type="button" class="ep-plan-mini ep-clickable" data-pw-close aria-label="Закрыть">✕</button></div>
      <div class="ep-work-ready"><span>Готовность объекта</span><b>${readyLabel(p)}</b></div>
      <div class="ep-work-bar" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${rd}"><i style="width:${rd}%"></i></div>
      ${stale.length ? `<button type="button" class="btn ep-clickable ep-work-carry" data-pw-carry>Перенести незавершённое со вчера (${stale.length})</button>` : ""}
      <div class="ep-plan-srow"><b>Сегодня</b><span class="ep-plan-mshint">${today.length ? today.filter((x) => x.progress >= 1).length + " из " + today.length : "пусто — добавь задачи ниже"}</span></div>
      ${today.map((x) => row(x, true)).join("")}
      ${today.length ? `<div class="ep-plan-srow ep-plan-sbtns"><button type="button" class="btn ep-clickable" data-pw-copy>📋 Скопировать задание</button></div>` : ""}
      ${stages ? `<div class="ep-plan-srow"><b>＋ Добавить на сегодня</b><span class="ep-plan-mshint">по этапам</span></div>${stages}` : `<div class="ep-plan-modehint">${all.length ? "Все задачи выполнены или уже в задании." : "Задач пока нет — расставь точки и линии."}</div>`}
      ${doneN ? `<div class="ep-plan-modehint">Выполнено задач: ${doneN} из ${all.length}. «Механизмы» отмечаются сами — по статусу точек (тап по точке в режиме 👷).</div>` : ""}`);
  }
  function copyText(text) {
    try { if (navigator.clipboard && navigator.clipboard.writeText) { navigator.clipboard.writeText(text); return true; } } catch (e) {}
    try { const ta = document.createElement("textarea"); ta.value = text; document.body.appendChild(ta); ta.select(); document.execCommand("copy"); ta.remove(); return true; } catch (e) { return false; }
  }

  if (typeof document !== "undefined") {
    document.addEventListener("click", (e) => {
      if (!rooms() || !rooms().isActive || !rooms().isActive()) return;
      const t = e.target; let b;
      if (t.closest("[data-plan-daytask]")) { sheet(); return; }
      if (t.closest("[data-pw-close]")) { rooms().closeSheet(); return; }
      const p = core().project; if (!p) return;
      if ((b = t.closest("[data-pw-toggle]"))) { toggleDone(b.getAttribute("data-pw-toggle")); sheet(); return; }
      if ((b = t.closest("[data-pw-add]"))) { setToday(todayKeys(p).concat([b.getAttribute("data-pw-add")])); sheet(); return; }
      if ((b = t.closest("[data-pw-rm]"))) { const k = b.getAttribute("data-pw-rm"); setToday(todayKeys(p).filter((x) => x !== k)); sheet(); return; }
      if (t.closest("[data-pw-carry]")) { setToday(staleKeys(p).concat(todayKeys(p))); sheet(); return; }
      if (t.closest("[data-pw-copy]")) { const ok = copyText(dayText(p)); if (rooms().toast) rooms().toast(ok ? "Задание скопировано — вставь в мессенджер бригаде" : "Не удалось скопировать"); return; }
      if ((b = t.closest("[data-pw-mech]"))) {
        if (rooms().toast) rooms().toast("«Механизмы» отмечаются по точкам: включи 👷 и тапни точку на плане — ○ план / ◐ в работе / ✓ готово.");
        return;
      }
    });
    // запоминаем раскрытые этапы, чтобы перерисовка после отметки не сворачивала их
    document.addEventListener("toggle", (e) => {
      const d = e.target && e.target.getAttribute && e.target.getAttribute("data-pw-stage");
      if (d) S.open[d] = e.target.open;
    }, true);
  }

  EP.Plan.Work = { STAGES, tasks, readiness, readyLabel, detailsFor, toggleDone, setToday, todayKeys, staleKeys, dayText, sheet, todayStr };
})();
