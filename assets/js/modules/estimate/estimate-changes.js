/* ============================================================
   Electric Pro V29 — ИЗМЕНЕНИЕ СМЕТЫ ПО ЗАКОНУ (журнал изменений + основания)

   Смета — приложение к договору подряда, и менять её «на ходу» нельзя: по ГК РФ цена
   работы меняется не правкой таблицы, а СОГЛАШЕНИЕМ СТОРОН, а дополнительные работы
   оплачиваются, только если подрядчик о них ВОВРЕМЯ сообщил. Модуль хранит журнал
   изменений (что было → что стало, почему и на каком основании) и отдаёт из него два
   документа: акт о выявленных дополнительных работах (уведомление заказчика) и
   дополнительное соглашение к договору (собственно изменение цены и объёма).

   Правовая рамка (ГК РФ, часть вторая, гл. 37):
     п. 4 ст. 709  — смета приблизительная либо твёрдая; при отсутствии других указаний
                     смета считается ТВЁРДОЙ, поэтому вид сметы лучше указывать прямо;
     п. 5 ст. 709  — при существенном превышении ПРИБЛИЗИТЕЛЬНОЙ сметы подрядчик обязан
                     своевременно предупредить заказчика;
     п. 6 ст. 709  — по ТВЁРДОЙ смете подрядчик не вправе требовать увеличения цены, а
                     заказчик — уменьшения, кроме существенного возрастания стоимости
                     материалов, которое нельзя было предусмотреть;
     п. 3 ст. 743  — обнаружив не учтённые в документации работы, подрядчик обязан
                     сообщить заказчику; без ответа в течение 10 дней — приостановить;
     п. 4 ст. 743  — не сообщивший лишается права требовать оплаты этих работ;
     ст. 744       — изменения по требованию заказчика: доп. работы сверх 10 % общей
                     стоимости выполняются по согласованной сторонами доп. смете;
     ст. 450, 452  — изменение договора соглашением сторон, в той же форме, что договор.

   Хранилище: localStorage ep_estimate_changes_v29.
   ============================================================ */
(() => {
  "use strict";
  window.EP = window.EP || {};
  const KEY = "ep_estimate_changes_v29";
  let _seq = 0;

  function num(v) { const n = typeof v === "number" ? v : parseFloat(String(v).replace(",", ".")); return isFinite(n) ? n : 0; }
  function emit() { try { window.dispatchEvent(new CustomEvent("ep:estimate-changes-changed")); } catch (e) {} }

  /* Вид сметы. Юридически это главная развилка: от неё зависит, можно ли вообще
     требовать увеличения цены и каким документом оформляется изменение. */
  const KINDS = [
    {
      id: "approx", name: "Приблизительная",
      note: "Смета приблизительная (п. 4 ст. 709 ГК РФ). При необходимости проведения дополнительных работ и существенного " +
        "превышения сметы Исполнитель обязан своевременно предупредить Заказчика (п. 5 ст. 709, п. 3 ст. 743 ГК РФ). " +
        "Заказчик вправе отказаться от договора, оплатив фактически выполненную часть работ."
    },
    {
      id: "firm", name: "Твёрдая",
      note: "Смета твёрдая (п. 4 ст. 709 ГК РФ). Исполнитель не вправе требовать увеличения цены, а Заказчик — её уменьшения, " +
        "в том числе при неучтённых объёмах, кроме случая существенного возрастания стоимости материалов, которое нельзя " +
        "было предусмотреть (п. 6 ст. 709 ГК РФ). Изменение цены и объёма — только соглашением сторон (ст. 450, 452 ГК РФ)."
    }
  ];

  /* Правовое основание изменения — печатается в акте/соглашении по каждой позиции. */
  const BASES = [
    {
      id: "743", name: "Доп. работы, не учтённые в документации (п. 3 ст. 743 ГК РФ)",
      note: "Работы не были учтены в технической документации и смете; выявлены в ходе выполнения; Заказчик уведомлён до начала их выполнения."
    },
    {
      id: "744", name: "Изменение по требованию Заказчика (ст. 744 ГК РФ)",
      note: "Изменения внесены по требованию Заказчика; при превышении 10 % общей стоимости работы выполняются по согласованной сторонами дополнительной смете."
    },
    {
      id: "709-6", name: "Существенный рост стоимости материалов (п. 6 ст. 709 ГК РФ)",
      note: "Существенно возросла стоимость материалов и оборудования, которую нельзя было предусмотреть при заключении договора."
    },
    {
      id: "709-5", name: "Превышение приблизительной сметы (п. 5 ст. 709 ГК РФ)",
      note: "Возникла необходимость проведения дополнительных работ и существенного превышения приблизительной сметы; Заказчик предупреждён своевременно."
    },
    {
      id: "716", name: "Обстоятельства, угрожающие качеству (ст. 716 ГК РФ)",
      note: "Выявлены обстоятельства, угрожающие годности или прочности результата работ; Исполнитель предупредил Заказчика."
    },
    {
      id: "450", name: "Соглашение сторон (п. 1 ст. 450 ГК РФ)",
      note: "Изменение согласовано сторонами и оформлено дополнительным соглашением к договору."
    },
    {
      id: "swap", name: "Замена на эквивалент по согласованию",
      note: "Материал заменён на эквивалент, не ухудшающий характеристик результата работ; замена согласована с Заказчиком (ст. 450 ГК РФ)."
    }
  ];

  // Вид изменения. Порядок важен только для UI; в документах печатается name.
  const OPS = [
    ["add", "Добавление"],
    ["swap", "Замена"],
    ["qty", "Изменение объёма"],
    ["price", "Изменение цены"],
    ["remove", "Исключение"]
  ];

  function read() {
    try {
      const o = JSON.parse(localStorage.getItem(KEY) || "null");
      if (o && typeof o === "object") {
        o.entries = Array.isArray(o.entries) ? o.entries : [];
        o.doc = o.doc || {};
        o.kind = o.kind === "firm" ? "firm" : "approx";
        return o;
      }
    } catch (e) {}
    return { v: 1, kind: "approx", doc: {}, entries: [] };
  }
  function write(o) { try { localStorage.setItem(KEY, JSON.stringify(o)); } catch (e) {} emit(); }

  function getState() { return read(); }
  function getKind() { return read().kind; }
  function setKind(k) { const o = read(); o.kind = k === "firm" ? "firm" : "approx"; write(o); return o.kind; }
  function kindInfo(k) { const id = k || getKind(); return KINDS.find((x) => x.id === id) || KINDS[0]; }
  function kindNote(k) { return kindInfo(k).note; }
  function basisInfo(id) { return BASES.find((x) => x.id === id) || null; }

  function getDoc() { return read().doc || {}; }
  function setDoc(key, val) { const o = read(); o.doc = o.doc || {}; o.doc[String(key)] = String(val == null ? "" : val); write(o); return o.doc; }

  function list() { return read().entries.slice(); }
  function count() { return read().entries.length; }

  /* Одна запись журнала. Поля «было/стало» хранятся ЧИСЛАМИ, а не строкой «120 → 140»:
     из них считается денежная разница, а её нельзя восстановить из текста. */
  function norm(e) {
    e = e || {};
    const op = OPS.some((x) => x[0] === e.op) ? e.op : "add";
    return {
      id: "ch_" + Date.now().toString(36) + "_" + (++_seq).toString(36),
      at: Date.now(),
      op: op,
      type: e.type === "material" ? "material" : "work",
      name: String(e.name || "").trim(),
      nameOld: String(e.nameOld || "").trim(),
      unit: String(e.unit || "шт"),
      qtyOld: num(e.qtyOld), priceOld: num(e.priceOld),
      qtyNew: num(e.qtyNew), priceNew: num(e.priceNew),
      basis: basisInfo(e.basis) ? e.basis : (op === "swap" ? "swap" : "743"),
      reason: String(e.reason || "").trim()
    };
  }
  function log(e) {
    const it = norm(e);
    if (!it.name) return null;
    const o = read(); o.entries.push(it); write(o);
    return it;
  }
  function remove(id) { const o = read(); o.entries = o.entries.filter((x) => x.id !== id); write(o); }
  function clear() { const o = read(); o.entries = []; write(o); }

  // Денежная разница по записи: «стало» минус «было» (исключение даёт отрицательную).
  function deltaOf(e) { return num(e.qtyNew) * num(e.priceNew) - num(e.qtyOld) * num(e.priceOld); }

  /* Сводка по журналу. `base` — цена договора (для процента). Процент считается от
     ИСХОДНОЙ цены, то есть от текущего итога сметы МИНУС уже внесённые изменения:
     иначе 10 % из ст. 744 считались бы от уже увеличенной суммы и порог поехал бы. */
  function summary(base) {
    const ent = read().entries;
    let up = 0, down = 0;
    ent.forEach((e) => { const d = deltaOf(e); if (d >= 0) up += d; else down += d; });
    const delta = up + down;
    let start = num(base);
    if (!start) {
      const est = window.EP && window.EP.Estimate;
      const tot = est && est.total ? est.total() : 0;
      start = tot - delta;
    }
    const percent = start > 0 ? (delta / start) * 100 : 0;
    return {
      count: ent.length, up: up, down: down, delta: delta, start: start, total: start + delta,
      percent: percent,
      // порог ст. 744: доп. работы свыше 10 % общей стоимости требуют согласованной
      // сторонами дополнительной сметы, а не просто уведомления
      over10: percent > 10
    };
  }

  /* ============================================================
     UI — блок «Изменения и доп. работы» на экране сметы.
     Как и у обязательных позиций, разметка и обработчики живут в своём модуле: экран
     сметы только вставляет blockHtml() и ничего не знает про журнал и правовые основания.
     ============================================================ */
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c])); }
  function PRN() { return window.EP && window.EP.EstimatePrint; }
  function money(v) { const P = PRN(); return (P ? P.money(v) : Number(v || 0).toFixed(2)) + " ₽"; }
  function q0(v) { const n = num(v); return (Math.round(n * 100) / 100).toString().replace(".", ","); }
  function repaint() { const T = window.EP && window.EP.EstimateTabs; if (T && T.render) T.render(); }
  function flash(msg) { const T = window.EP && window.EP.EstimateTabs; if (T && T.flash) T.flash(msg); }

  const V = { open: false, form: false, op: "add" };
  const OP_LABEL = {}; OPS.forEach((o) => { OP_LABEL[o[0]] = o[1]; });

  // Позиции текущей сметы — чтобы «было» не вбивать руками: выбрал строку, поля заполнились.
  function estRows() {
    const est = window.EP && window.EP.Estimate;
    const items = est && est.getItems ? est.getItems() : [];
    const m = new Map();
    items.forEach((x) => {
      const key = (x.type === "work" ? "w" : "m") + "|" + String(x.name || "").toLowerCase().trim() + "|" + (x.unit || "");
      const e = m.get(key);
      if (e) { e.qty += num(x.qty); if (!e.price && num(x.price)) e.price = num(x.price); }
      else m.set(key, { type: x.type, name: x.name, unit: x.unit || "", qty: num(x.qty), price: num(x.price) });
    });
    return [...m.values()].sort((a, b) => String(a.name).localeCompare(String(b.name), "ru"));
  }

  function formHtml() {
    const rows = estRows();
    const swap = V.op === "swap";
    return `<div class="ep-chg-form">
      <div class="ep-est-scope"><span class="ep-est-lbl">Вид:</span>
        ${OPS.map(([id, nm]) => `<button type="button" class="ep-est-chip ep-clickable ${V.op === id ? "on" : ""}" data-chg-op="${id}">${esc(nm)}</button>`).join("")}
      </div>
      <label class="ep-chg-f"><span>Позиция из сметы (заполнит «было»)</span>
        <select data-chg-pick><option value="">— выбрать —</option>
          ${rows.map((r, i) => `<option value="${i}">${esc(r.name)} · ${q0(r.qty)} ${esc(r.unit)}</option>`).join("")}
        </select></label>
      ${swap ? `<input id="ep-chg-nameold" type="text" placeholder="Что было (наименование)">` : ""}
      <input id="ep-chg-name" type="text" placeholder="${swap ? "Чем заменено (наименование)" : "Наименование позиции"}">
      <div class="ep-chg-g4">
        <input id="ep-chg-unit" type="text" placeholder="ед." value="шт" maxlength="10">
        <input id="ep-chg-qo" type="number" step="any" min="0" placeholder="было кол-во">
        <input id="ep-chg-po" type="number" step="any" min="0" placeholder="было цена">
      </div>
      <div class="ep-chg-g4">
        <select id="ep-chg-type"><option value="work">работа</option><option value="material">материал</option></select>
        <input id="ep-chg-qn" type="number" step="any" min="0" placeholder="стало кол-во">
        <input id="ep-chg-pn" type="number" step="any" min="0" placeholder="стало цена">
      </div>
      <label class="ep-chg-f"><span>Правовое основание</span>
        <select id="ep-chg-basis">${BASES.map((b) => `<option value="${b.id}">${esc(b.name)}</option>`).join("")}</select></label>
      <input id="ep-chg-reason" type="text" placeholder="Причина (что именно выявлено, по чьей инициативе)">
      <div class="ep-est-prow">
        <button type="button" class="btn btn-primary ep-clickable" data-chg-save>Зафиксировать</button>
        <button type="button" class="btn btn-ghost ep-clickable" data-chg-cancel>Отмена</button>
      </div></div>`;
  }

  function blockHtml() {
    const st = read(), sm = summary();
    const head = `<button type="button" class="ep-est-stghead ep-clickable" data-chg-toggle>
        <span>${V.open ? "▾" : "▸"} 📝 Изменения и доп. работы</span>
        <b>${sm.count ? sm.count + " · " + (sm.delta >= 0 ? "+" : "") + money(sm.delta) : "нет"}</b></button>`;
    if (!V.open) return `<div class="ep-chg-block">${head}</div>`;
    const d = st.doc || {};
    const f = (key, label, ph) => `<label class="ep-chg-f"><span>${esc(label)}</span>
      <input type="text" value="${esc(d[key] || "")}" data-chg-doc="${key}" placeholder="${esc(ph || "")}"></label>`;
    const rows = st.entries.map((e) => `<div class="ep-chg-row">
        <span class="ep-chg-nm">${esc(OP_LABEL[e.op] || e.op)}: ${esc(e.nameOld ? e.nameOld + " → " + e.name : e.name)}
          <i>${esc((basisInfo(e.basis) || {}).name || "")}${e.reason ? " · " + esc(e.reason) : ""}</i></span>
        <span class="ep-chg-d">${(deltaOf(e) >= 0 ? "+" : "") + money(deltaOf(e))}</span>
        <button type="button" class="ep-req-del ep-clickable" data-chg-del="${esc(e.id)}" aria-label="Убрать запись">✕</button>
      </div>`).join("");
    return `<div class="ep-chg-block">${head}
      <div class="ep-chg-kind">
        <span class="ep-est-lbl">Смета:</span>
        ${KINDS.map((k) => `<button type="button" class="ep-est-chip ep-clickable ${st.kind === k.id ? "on" : ""}" data-chg-kind="${k.id}">${esc(k.name)}</button>`).join("")}
      </div>
      <div class="ep-chg-law">${esc(kindNote(st.kind))}</div>
      <div class="ep-chg-doc">${f("dogNo", "Договор №", "1")}${f("dogDate", "от", "ДД.ММ.ГГГГ")}${f("city", "Город", "")}
        ${f("actNo", "Акт №", "1")}${f("supNo", "Доп. соглашение №", "1")}${f("days", "Продление срока, дн.", "0")}</div>
      ${rows ? `<div class="ep-chg-list">${rows}</div>
        <div class="ep-chg-sum">Цена договора: ${money(sm.start)} → <b>${money(sm.total)}</b> (${(sm.delta >= 0 ? "+" : "") + q0(sm.percent)} %)
          ${sm.over10 ? `<span class="ep-chg-over">свыше 10 % — нужна согласованная доп. смета (ст. 744 ГК РФ)</span>` : ""}</div>`
      : `<div class="ep-req-note">Пока изменений нет. Любое отступление от подписанной сметы — доп. работы, замена материала,
          изменение объёма — фиксируется здесь: из журнала печатаются акт (уведомление заказчика) и доп. соглашение.</div>`}
      ${V.form ? formHtml() : `<div class="ep-est-prow"><button type="button" class="btn btn-ghost ep-clickable" data-chg-new>➕ Зафиксировать изменение</button></div>`}
      <div class="ep-est-prow">
        <button type="button" class="btn btn-primary ep-clickable" data-chg-act>🖨 Акт о доп. работах</button>
        <button type="button" class="btn btn-ghost ep-clickable" data-chg-sup>🖨 Доп. соглашение</button>
      </div>
      <div class="ep-req-note">Порядок по закону: сначала АКТ — уведомление заказчика (п. 3 ст. 743 ГК РФ: не сообщил — не вправе
        требовать оплаты), затем ДОП. СОГЛАШЕНИЕ — им и меняются цена договора и смета (ст. 450, 452 ГК РФ).</div>
    </div>`;
  }

  function saveForm() {
    const val = (id) => { const el = document.getElementById(id); return el ? el.value : ""; };
    const name = String(val("ep-chg-name") || "").trim();
    if (!name) return flash("Впиши наименование позиции");
    const e = log({
      op: V.op, type: val("ep-chg-type"), name: name, nameOld: val("ep-chg-nameold"),
      unit: val("ep-chg-unit") || "шт",
      qtyOld: val("ep-chg-qo"), priceOld: val("ep-chg-po"),
      qtyNew: val("ep-chg-qn"), priceNew: val("ep-chg-pn"),
      basis: val("ep-chg-basis"), reason: val("ep-chg-reason")
    });
    if (!e) return flash("Не удалось записать изменение");
    V.form = false; repaint(); flash("Изменение зафиксировано");
  }
  function printDoc(kind) {
    const P = PRN(); if (!P) return flash("Печать недоступна");
    if (!count()) return flash("Журнал изменений пуст");
    const html = kind === "sup" ? P.supplementHtml({}) : P.changeActHtml({});
    if (!P.open(html)) flash("Разреши всплывающие окна, чтобы напечатать");
  }

  if (typeof document !== "undefined" && document.addEventListener) {
    document.addEventListener("click", (e) => {
      const t = e.target; if (!t || !t.closest) return;
      if (!document.getElementById("ep-estimate-root")) return;
      let el;
      if (t.closest("[data-chg-toggle]")) { V.open = !V.open; repaint(); return; }
      if ((el = t.closest("[data-chg-kind]"))) { setKind(el.getAttribute("data-chg-kind")); repaint(); return; }
      if (t.closest("[data-chg-new]")) { V.form = true; repaint(); return; }
      if (t.closest("[data-chg-cancel]")) { V.form = false; repaint(); return; }
      if ((el = t.closest("[data-chg-op]"))) {
        V.op = el.getAttribute("data-chg-op");
        // «Замена» добавляет поле «что было» — перерисовываем форму целиком, но только её
        repaint(); return;
      }
      if (t.closest("[data-chg-save]")) { saveForm(); return; }
      if ((el = t.closest("[data-chg-del]"))) { remove(el.getAttribute("data-chg-del")); repaint(); return; }
      if (t.closest("[data-chg-act]")) { printDoc("act"); return; }
      if (t.closest("[data-chg-sup]")) { printDoc("sup"); return; }
    });
    document.addEventListener("change", (e) => {
      const t = e.target; if (!t || !t.getAttribute) return;
      if (!document.getElementById("ep-estimate-root")) return;
      if (t.hasAttribute("data-chg-doc")) { setDoc(t.getAttribute("data-chg-doc"), t.value); return; }
      if (t.hasAttribute("data-chg-pick")) {
        // заполняем «было» из выбранной строки сметы БЕЗ перерисовки — иначе стёрлось бы
        // то, что пользователь уже успел вписать в другие поля формы
        const r = estRows()[Number(t.value)];
        if (!r) return;
        const set = (id, v) => { const el = document.getElementById(id); if (el) el.value = v; };
        set("ep-chg-name", r.name); set("ep-chg-unit", r.unit); set("ep-chg-qo", r.qty); set("ep-chg-po", r.price);
        set("ep-chg-type", r.type === "material" ? "material" : "work");
        if (V.op === "swap") set("ep-chg-nameold", r.name);
        return;
      }
    });
  }

  window.EP.EstimateChanges = {
    KINDS, BASES, OPS, getState, getKind, setKind, kindInfo, kindNote, basisInfo,
    getDoc, setDoc, list, count, log, remove, clear, deltaOf, summary, blockHtml
  };
})();
