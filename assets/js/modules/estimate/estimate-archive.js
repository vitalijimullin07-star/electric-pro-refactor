/* Electric Pro V29 — АРХИВ СМЕТ (для себя) + деньги по объекту.
   Просьба пользователя: «сделать сохранение смет… в сохранённые показывает данные моменты
   [надбавки], и вводить сколько аванса и т.д. получили и сколько надо дополучить».

   ЧТО ЭТО ТАКОЕ. Основная смета (EP.Estimate) — ОДНА и всегда «текущая»: её правят,
   печатают, в неё складывают новые позиции. Архив — СНИМКИ: сохранил то, что отдал
   заказчику, и дальше ведёшь по этому снимку деньги (аванс, промежуточные платежи,
   остаток). Снимок ЗАМОРОЖЕН: у него свои позиции и СВОИ надбавки/скидка на момент
   сохранения — поменял потом процент прораба в текущей смете, сохранённая не поехала.
   Поэтому итоги считаются ОДИН раз при сохранении и лежат в записи; считать их заново
   при каждом показе значило бы, что архив меняется задним числом.

   ЕДИНАЯ АРИФМЕТИКА. Сумму считает EP.EstimatePrint.calcTotals — ТА ЖЕ функция, что
   печатает бланк. Своей формулы здесь нет вообще: разойдись они, карточка в архиве
   показывала бы одно, а лист заказчику — другое.

   Хранилище — localStorage ep_estimate_archive_v29 (устройство мастера; это его рабочий
   журнал, а не документ заказчика). Кап ARCH_MAX записей, старые вытесняются. */
(() => {
  "use strict";
  window.EP = window.EP || {};
  const KEY = "ep_estimate_archive_v29";
  const ARCH_MAX = 60;

  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c])); }
  function num(v) { const n = typeof v === "number" ? v : parseFloat(String(v).replace(",", ".")); return isFinite(n) ? n : 0; }
  function uid(p) { return (p || "a") + Math.random().toString(36).slice(2, 9); }
  function PRN() { return window.EP && window.EP.EstimatePrint; }
  function EST() { return window.EP && window.EP.Estimate; }
  function money(v) {
    const P = PRN();
    if (P && P.money) return P.money(v) + " ₽";
    return (Math.round(num(v) * 100) / 100).toFixed(2) + " ₽";
  }
  function pct(v) { const n = num(v); return (Math.round(n * 100) / 100).toString().replace(".", ",") + " %"; }
  function dateOf(ts) {
    const d = new Date(num(ts) || Date.now());
    return ("0" + d.getDate()).slice(-2) + "." + ("0" + (d.getMonth() + 1)).slice(-2) + "." + d.getFullYear();
  }

  function read() {
    try { const a = JSON.parse(localStorage.getItem(KEY) || "[]"); return Array.isArray(a) ? a : []; }
    catch (e) { return []; }
  }
  function write(list) {
    try { localStorage.setItem(KEY, JSON.stringify(list.slice(0, ARCH_MAX))); } catch (e) {}
    try { window.dispatchEvent(new CustomEvent("ep:estimate-archive-changed", { detail: { count: list.length } })); } catch (e) {}
  }

  function normMarkups(m) {
    m = m || {};
    return { work: num(m.work), mat: num(m.mat), pad: num(m.pad), discount: num(m.discount) };
  }
  // Итоги считает печатный модуль (единая арифметика, см. шапку). Без него — плоская
  // сумма без надбавок: лучше честный минимум, чем вторая формула, которая разойдётся.
  function totalsOf(items, mk) {
    const P = PRN(), M = normMarkups(mk);
    const works = (items || []).filter((x) => x.type === "work");
    const mats = (items || []).filter((x) => x.type !== "work");
    if (P && P.calcTotals) {
      const t = P.calcTotals({ works, mats, workMarkup: M.work, markup: M.mat, pad: M.pad, discount: M.discount });
      return { workSum: t.workSum, matSum: t.matSum, subtotal: t.subtotal, disc: t.disc, total: t.total };
    }
    const w = works.reduce((s, x) => s + num(x.price) * num(x.qty), 0);
    const m = mats.reduce((s, x) => s + num(x.price) * num(x.qty), 0);
    return { workSum: w, matSum: m, subtotal: w + m, disc: 0, total: w + m };
  }

  function list() { return read().slice(); }
  function get(id) { return read().find((r) => r.id === id) || null; }

  /* Сохранить снимок. o = {name, items, markups, client, object, no} */
  function save(o) {
    o = o || {};
    const items = (o.items || []).filter((x) => x && x.name && num(x.qty) > 0).map((x) => ({
      type: x.type === "work" ? "work" : "material",
      name: String(x.name), unit: String(x.unit || ""),
      qty: num(x.qty), price: num(x.price), extra: !!x.extra
    }));
    if (!items.length) return null;
    const mk = normMarkups(o.markups);
    const rec = {
      id: uid("est"), at: Date.now(),
      name: String(o.name || "").trim() || ("Смета от " + dateOf(Date.now())),
      client: String(o.client || ""), object: String(o.object || ""),
      no: String(o.no || ""),
      items, markups: mk, totals: totalsOf(items, mk), payments: []
    };
    const l = read(); l.unshift(rec); write(l);
    return rec;
  }
  function remove(id) { write(read().filter((r) => r.id !== id)); }
  function rename(id, name) {
    const l = read(), r = l.find((x) => x.id === id);
    if (!r) return null;
    r.name = String(name || "").trim() || r.name;
    write(l); return r;
  }
  function addPayment(id, p) {
    const l = read(), r = l.find((x) => x.id === id);
    if (!r) return null;
    const sum = num(p && p.sum);
    if (!sum) return null;
    r.payments = r.payments || [];
    r.payments.push({ id: uid("p"), at: num(p.at) || Date.now(), sum, note: String((p && p.note) || "") });
    write(l); return r;
  }
  function removePayment(id, pid) {
    const l = read(), r = l.find((x) => x.id === id);
    if (!r) return null;
    r.payments = (r.payments || []).filter((p) => p.id !== pid);
    write(l); return r;
  }
  function paid(rec) { return (rec && rec.payments || []).reduce((s, p) => s + num(p.sum), 0); }
  function totalOf(rec) { return rec && rec.totals ? num(rec.totals.total) : 0; }
  // Остаток не уходит в минус: переплату показываем отдельно (см. cardHtml)
  function left(rec) { return Math.max(0, totalOf(rec) - paid(rec)); }

  /* Загрузить снимок в текущую смету (заменить). Позиции возвращаются как есть —
     надбавки в них НЕ «запечены» (в снимке хранятся чистые цены и проценты отдельно),
     иначе повторное сохранение накрутило бы процент второй раз. ПОЭТОМУ ЖЕ вместе с
     позициями ОБЯЗАТЕЛЬНО возвращаются и проценты (просьба пользователя: «главное, чтобы
     когда смету открываем, были сохранены параметры процентов»): цены в позициях чистые,
     и без своих процентов открытая смета напечаталась бы по ЧУЖИМ — по тем, что стояли на
     экране в момент открытия. Пишем через EstimateTabs.setMarkups — единственный путь
     записи надбавок, своего хранения архив не заводит. */
  function loadToMain(id) {
    const r = get(id), d = EST(), T = TABS();
    if (!r || !d || !d.clear || !d.mergeItems) return null;
    d.clear();
    d.mergeItems(r.items.map((x) => Object.assign({}, x)));
    if (T && T.setMarkups) T.setMarkups(r.markups);
    return r;
  }
  function printOf(id) {
    const r = get(id), P = PRN();
    if (!r || !P) return false;
    const works = r.items.filter((x) => x.type === "work");
    const mats = r.items.filter((x) => x.type !== "work");
    const html = P.estimateHtml({
      works, mats, no: r.no || undefined, date: dateOf(r.at),
      client: r.client || undefined, object: r.object || undefined,
      workMarkup: r.markups.work, markup: r.markups.mat, pad: r.markups.pad, discount: r.markups.discount,
      heading: "Смета"
    });
    return P.open(html);
  }
  function exportOf(id) {
    const r = get(id), F = window.EP && window.EP.EstimateFile;
    if (!r || !F || !F.envelope || !F.download) return false;
    const env = F.envelope(r.items, { name: r.name, client: r.client, object: r.object });
    F.download((F.stamp ? F.stamp("smeta") : "smeta") + ".json", JSON.stringify(env, null, 1));
    return true;
  }

  /* ---------- UI ---------- */
  let open = false, cardId = null;
  function TABS() { return window.EP && window.EP.EstimateTabs; }
  function repaint() { const T = TABS(); if (T && T.render) T.render(); }
  function flash(msg) { const T = TABS(); if (T && T.flash) T.flash(msg); }

  function markupsLine(mk) {
    const parts = [];
    if (num(mk.work)) parts.push("прорабу " + pct(mk.work));
    if (num(mk.mat)) parts.push("материалы " + pct(mk.mat));
    if (num(mk.pad)) parts.push("резерв " + pct(mk.pad));
    if (num(mk.discount)) parts.push("скидка " + pct(mk.discount));
    return parts.length ? parts.join(" · ") : "без надбавок";
  }
  function cardHtml(r) {
    const t = r.totals || {}, pd = paid(r), lf = left(r), over = pd - totalOf(r);
    const pay = (r.payments || []).map((p) => `<div class="ep-arch-pay">
        <b>${money(p.sum)}</b><span>${esc(dateOf(p.at))}${p.note ? " · " + esc(p.note) : ""}</span>
        <button type="button" class="ep-arch-x ep-clickable" data-arch-paydel="${esc(p.id)}" aria-label="Удалить платёж">✕</button>
      </div>`).join("");
    return `<div class="ep-arch-card">
      <div class="ep-arch-sum">
        <div><span>Работы</span><b>${money(t.workSum)}</b></div>
        <div><span>Материалы</span><b>${money(t.matSum)}</b></div>
        ${num(t.disc) > 0 ? `<div><span>Скидка</span><b>−${money(t.disc)}</b></div>` : ""}
        <div class="ep-arch-grand"><span>Всего к оплате</span><b>${money(t.total)}</b></div>
      </div>
      <div class="ep-arch-mk">Заложено: ${esc(markupsLine(r.markups || {}))}</div>
      <div class="ep-arch-money">
        <div><span>Получено</span><b>${money(pd)}</b></div>
        ${over > 0
          ? `<div class="ep-arch-over"><span>Переплата</span><b>${money(over)}</b></div>`
          : `<div class="ep-arch-left"><span>Осталось получить</span><b>${money(lf)}</b></div>`}
      </div>
      ${pay ? `<div class="ep-arch-pays">${pay}</div>` : ""}
      <div class="ep-arch-payadd">
        <input id="ep-arch-psum" type="number" inputmode="decimal" min="0" step="any" placeholder="Сумма ₽">
        <input id="ep-arch-pnote" type="text" maxlength="60" placeholder="аванс / за этап / остаток">
        <button type="button" class="btn btn-primary ep-clickable" data-arch-payadd>Записать</button>
      </div>
      <div class="ep-arch-acts">
        <button type="button" class="btn btn-ghost ep-clickable" data-arch-load="${esc(r.id)}">↧ Открыть в смете</button>
        <button type="button" class="btn btn-ghost ep-clickable" data-arch-print="${esc(r.id)}">🖨 Печать</button>
        <button type="button" class="btn btn-ghost ep-clickable" data-arch-export="${esc(r.id)}">⤓ Экспорт</button>
        <button type="button" class="btn btn-ghost ep-clickable" data-arch-del="${esc(r.id)}">🗑 Удалить</button>
      </div>
    </div>`;
  }
  function blockHtml() {
    const l = read();
    const head = `<button type="button" class="ep-arch-head ep-clickable" data-arch-toggle>
        <b>💾 Сохранённые сметы</b><span>${l.length ? l.length + " шт · получено " + money(l.reduce((s, r) => s + paid(r), 0)) : "пусто"}</span>
        <i>${open ? "▾" : "▸"}</i></button>`;
    if (!open) return `<div class="ep-arch">${head}</div>`;
    const rowsHtml = l.map((r) => {
      const sel = cardId === r.id;
      const lf = left(r);
      return `<div class="ep-arch-row ${sel ? "on" : ""}">
          <button type="button" class="ep-arch-rowhead ep-clickable" data-arch-open="${esc(r.id)}">
            <b>${esc(r.name)}</b>
            <span>${esc(dateOf(r.at))}${r.client ? " · " + esc(r.client) : ""} · ${money(totalOf(r))}${lf > 0 ? " · остаток " + money(lf) : " · закрыта"}</span>
          </button>
          ${sel ? cardHtml(r) : ""}
        </div>`;
    }).join("");
    return `<div class="ep-arch">${head}
      <div class="ep-arch-body">
        <div class="ep-arch-save">
          <input id="ep-arch-name" type="text" maxlength="60" placeholder="Название (объект, заказчик)">
          <button type="button" class="btn btn-primary ep-clickable" data-arch-save>💾 Сохранить текущую</button>
        </div>
        <div class="ep-arch-hint">Снимок текущей сметы с надбавками — по нему ведутся авансы и остаток. На текущую смету не влияет, а «Открыть в смете» вернёт и позиции, и проценты.</div>
        ${rowsHtml || `<div class="ep-arch-empty">Пока ничего не сохранено.</div>`}
      </div></div>`;
  }

  function saveCurrent() {
    const d = EST(), T = TABS();
    if (!d || !d.getItems) return flash("Смета недоступна");
    const items = d.getItems();
    if (!items.length) return flash("Смета пуста — сохранять нечего");
    const el = document.getElementById("ep-arch-name");
    const mk = (T && T.markups) ? T.markups() : {};
    let cl = {}, master = null;
    try { cl = (window.EP.Profile && window.EP.Profile.getClient()) || {}; } catch (e) {}
    const P = PRN();
    const r = save({
      name: el ? el.value : "", items, markups: mk,
      client: cl.name || "", object: cl.object || "", no: P ? P.docNo() : ""
    });
    if (!r) return flash("Сохранять нечего");
    cardId = r.id; open = true;
    repaint();
    flash("Сохранено: " + r.name);
  }

  if (typeof document !== "undefined" && document.addEventListener) {
    document.addEventListener("click", (e) => {
      const t = e.target;
      if (!t || !t.closest) return;
      let el;
      if (t.closest("[data-arch-toggle]")) { open = !open; repaint(); return; }
      if (t.closest("[data-arch-save]")) { saveCurrent(); return; }
      if ((el = t.closest("[data-arch-open]"))) {
        const id = el.getAttribute("data-arch-open");
        cardId = cardId === id ? null : id;
        repaint(); return;
      }
      if ((el = t.closest("[data-arch-load]"))) {
        if (!window.confirm("Заменить текущую смету сохранённой? Проценты надбавок тоже вернутся из неё.")) return;
        const r = loadToMain(el.getAttribute("data-arch-load"));
        repaint();
        flash(r ? "Открыто: " + r.name + " · надбавки: " + markupsLine(r.markups || {}) : "Не удалось загрузить");
        return;
      }
      if ((el = t.closest("[data-arch-print]"))) {
        if (!printOf(el.getAttribute("data-arch-print"))) flash("Разреши всплывающие окна, чтобы напечатать");
        return;
      }
      if ((el = t.closest("[data-arch-export]"))) {
        if (!exportOf(el.getAttribute("data-arch-export"))) flash("Экспорт недоступен");
        return;
      }
      if ((el = t.closest("[data-arch-del]"))) {
        const id = el.getAttribute("data-arch-del"), r = get(id);
        if (!r || !window.confirm("Удалить сохранённую смету «" + r.name + "»? Платежи по ней тоже удалятся.")) return;
        remove(id); if (cardId === id) cardId = null;
        repaint(); flash("Удалено"); return;
      }
      if (t.closest("[data-arch-payadd]")) {
        if (!cardId) return;
        const s = document.getElementById("ep-arch-psum"), n = document.getElementById("ep-arch-pnote");
        const sum = num(s ? s.value : 0);
        if (!sum) return flash("Впиши сумму платежа");
        addPayment(cardId, { sum, note: n ? n.value : "" });
        repaint(); flash("Платёж записан"); return;
      }
      if ((el = t.closest("[data-arch-paydel]"))) {
        if (!cardId) return;
        removePayment(cardId, el.getAttribute("data-arch-paydel"));
        repaint(); return;
      }
    });
  }

  window.EP.EstimateArchive = {
    list, get, save, remove, rename, addPayment, removePayment,
    paid, left, totalOf, totalsOf, loadToMain, printOf, exportOf, blockHtml, saveCurrent,
    isOpen: () => open, setOpen: (v) => { open = !!v; }, selected: () => cardId
  };
})();
