/* Electric Pro V29 — Этап 6. Документы. Смета заказчику (клиентский вид):
   шапка из реквизитов мастера и карточки клиента, работы + материалы (списком или суммой),
   наценка на материалы и скидка, профессиональный PDF/печать и «Поделиться».
   Хаб документов: остальные (договор/акт/счёт/гарантия) добавляются на Этапе 7. */
(() => {
  "use strict";
  function Draft() { return (window.EP && EP.EstimateDraft) || null; }
  function Profile() { return (window.EP && EP.Profile) || null; }
  function money(v) { try { if (window.EPCurrency && EPCurrency.format) return EPCurrency.format(v); } catch (e) {} return Number(v || 0).toFixed(2) + " \u20bd"; }
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c])); }
  const NKEY = "ep_smeta_no_v29";
  const TYPE_LABEL = { self: "Самозанятый", ip: "ИП", ooo: "ООО", fiz: "" };

  let view = "hub";                               // hub | client-estimate
  let opt = { markup: 0, discount: 0, matMode: "list" }; // matMode: list | sum

  function agg(type) {
    const d = Draft(); const items = d ? d.getItems() : [];
    const m = new Map();
    items.filter(x => x.type === type).forEach(x => {
      const key = String(x.name || "").toLowerCase().trim() + "|" + (x.unit || "");
      const e = m.get(key);
      if (e) { e.qty += Number(x.qty) || 0; if (!e.price && Number(x.price)) e.price = Number(x.price); }
      else m.set(key, { name: x.name, unit: x.unit || "", price: Number(x.price) || 0, qty: Number(x.qty) || 0 });
    });
    return [...m.values()].filter(x => x.qty > 0).sort((a, b) => String(a.name).localeCompare(String(b.name), "ru"));
  }
  function sums() {
    const mats = agg("material"), works = agg("work");
    const matBase = mats.reduce((s, x) => s + x.price * x.qty, 0);
    const k = 1 + (Number(opt.markup) || 0) / 100;
    const matSum = matBase * k;
    const workSum = works.reduce((s, x) => s + x.price * x.qty, 0);
    const subtotal = matSum + workSum;
    const disc = subtotal * (Number(opt.discount) || 0) / 100;
    const total = subtotal - disc;
    return { mats, works, matBase, matSum, workSum, subtotal, disc, total, k };
  }

  function docNo() { try { return localStorage.getItem(NKEY) || "1"; } catch (e) { return "1"; } }
  function setDocNo(v) { try { localStorage.setItem(NKEY, String(v || "1")); } catch (e) {} }
  function today() { const d = new Date(); return ("0" + d.getDate()).slice(-2) + "." + ("0" + (d.getMonth() + 1)).slice(-2) + "." + d.getFullYear(); }

  function masterLine() {
    const P = Profile(); const m = P ? P.getMaster() : {};
    const parts = [];
    if (m.name) parts.push(m.name);
    const t = TYPE_LABEL[m.type]; if (t) parts.push(t);
    if (m.inn) parts.push("ИНН " + m.inn);
    if (m.phone) parts.push("тел. " + m.phone);
    return parts.join(", ");
  }
  function clientInfo() {
    const P = Profile(); const c = P ? P.getClient() : {};
    return { client: [c.name, c.phone ? ("тел. " + c.phone) : ""].filter(Boolean).join(", "), object: c.object || "" };
  }

  /* ---------- хаб ---------- */
  function renderHub() {
    const root = document.getElementById("ep-docs-root"); if (!root) return;
    root.innerHTML = `
      <div class="ep-docs">
        <div class="ep-docs-grid">
          <button type="button" class="ep-doc-item on" data-doc="client-estimate">Смета заказчику<span>Клиентская смета с реквизитами, PDF</span></button>
          <button type="button" class="ep-doc-item soon" disabled>Договор подряда<span>Скоро</span></button>
          <button type="button" class="ep-doc-item soon" disabled>Акт выполненных работ<span>Скоро</span></button>
          <button type="button" class="ep-doc-item soon" disabled>Счёт на оплату<span>Скоро</span></button>
          <button type="button" class="ep-doc-item soon" disabled>Гарантийный талон<span>Скоро</span></button>
        </div>
        <div class="ep-docs-actions"><button type="button" class="btn btn-ghost ep-clickable" data-route="main">На главный</button></div>
      </div>`;
  }

  /* ---------- смета заказчику ---------- */
  function renderClientEstimate() {
    const root = document.getElementById("ep-docs-root"); if (!root) return;
    const s = sums();
    const ci = clientInfo();
    const ml = masterLine();
    const profileWarn = (!ml || !ci.client) ? `<div class="ep-docs-warn">Заполни <a href="#" data-route="profile">профиль и клиента</a> — попадут в шапку документа.</div>` : "";
    const matList = opt.matMode === "list"
      ? (s.mats.length ? s.mats.map((x, i) => `<div class="ep-sup-row"><div class="ep-sup-n">${i + 1}. ${esc(x.name)}</div><div class="ep-sup-q">${x.qty} ${esc(x.unit)}</div><div class="ep-sup-p">${money(x.price * s.k)}</div><div class="ep-sup-s">${money(x.price * s.k * x.qty)}</div></div>`).join("") : `<div class="ep-db-empty">Материалов нет.</div>`)
      : `<div class="ep-sup-row"><div class="ep-sup-n">Материалы (комплект)</div><div class="ep-sup-q"></div><div class="ep-sup-p"></div><div class="ep-sup-s">${money(s.matSum)}</div></div>`;
    const workList = s.works.length ? s.works.map((x, i) => `<div class="ep-sup-row"><div class="ep-sup-n">${i + 1}. ${esc(x.name)}</div><div class="ep-sup-q">${x.qty} ${esc(x.unit)}</div><div class="ep-sup-p">${money(x.price)}</div><div class="ep-sup-s">${money(x.price * x.qty)}</div></div>`).join("") : `<div class="ep-db-empty">Работ нет.</div>`;
    root.innerHTML = `
      <div class="ep-docs">
        <div class="ep-docs-bar"><button type="button" class="ep-docs-back" data-doc-back>← Документы</button><div class="ep-docs-title">Смета заказчику</div></div>
        ${profileWarn}
        <div class="ep-doc-head">
          <div><b>Исполнитель:</b> ${esc(ml) || "—"}</div>
          <div><b>Заказчик:</b> ${esc(ci.client) || "—"}</div>
          <div><b>Объект:</b> ${esc(ci.object) || "—"}</div>
        </div>
        <div class="ep-doc-ctrls">
          <label class="ep-prof-f"><span>Смета №</span><input data-doc-no type="text" value="${esc(docNo())}"></label>
          <label class="ep-prof-f"><span>Наценка на материалы, %</span><input data-doc-markup type="number" inputmode="decimal" min="0" value="${opt.markup}"></label>
          <label class="ep-prof-f"><span>Скидка, %</span><input data-doc-disc type="number" inputmode="decimal" min="0" value="${opt.discount}"></label>
          <div class="ep-doc-modes">Материалы:
            <button type="button" class="ep-doc-mode ${opt.matMode === "list" ? "on" : ""}" data-doc-mat="list">списком</button>
            <button type="button" class="ep-doc-mode ${opt.matMode === "sum" ? "on" : ""}" data-doc-mat="sum">суммой</button>
          </div>
        </div>
        <div class="ep-sup-head"><div class="ep-sup-title">Работы</div><div class="ep-sup-sub">итого <b>${money(s.workSum)}</b></div></div>
        <div class="ep-sup-list">${workList}</div>
        <div class="ep-sup-head" style="margin-top:12px"><div class="ep-sup-title">Материалы</div><div class="ep-sup-sub">итого <b>${money(s.matSum)}</b></div></div>
        <div class="ep-sup-list">${matList}</div>
        <div class="ep-doc-totals">
          ${s.disc > 0 ? `<div>Подытог: <b>${money(s.subtotal)}</b></div><div>Скидка ${esc(String(opt.discount))}%: <b>−${money(s.disc)}</b></div>` : ""}
          <div class="ep-doc-grand">К оплате: <b>${money(s.total)}</b></div>
        </div>
        <div class="ep-prof-actions">
          <button type="button" class="btn btn-primary ep-clickable" data-doc-print>Печать / PDF</button>
          <button type="button" class="btn btn-ghost ep-clickable" data-doc-share>Поделиться</button>
        </div>
      </div>`;
  }

  function render() { if (view === "client-estimate") renderClientEstimate(); else renderHub(); }

  /* ---------- печать ---------- */
  function printClientEstimate() {
    const s = sums(); const ci = clientInfo(); const ml = masterLine();
    const wrows = s.works.map((x, i) => `<tr><td>${i + 1}</td><td>${esc(x.name)}</td><td class="c">${x.qty} ${esc(x.unit)}</td><td class="r">${money(x.price)}</td><td class="r">${money(x.price * x.qty)}</td></tr>`).join("");
    const mrows = opt.matMode === "list"
      ? s.mats.map((x, i) => `<tr><td>${i + 1}</td><td>${esc(x.name)}</td><td class="c">${x.qty} ${esc(x.unit)}</td><td class="r">${money(x.price * s.k)}</td><td class="r">${money(x.price * s.k * x.qty)}</td></tr>`).join("")
      : `<tr><td>1</td><td>Материалы (комплект)</td><td class="c"></td><td class="r"></td><td class="r">${money(s.matSum)}</td></tr>`;
    const html = `<!doctype html><html><head><meta charset="utf-8"><title>Смета № ${esc(docNo())}</title>
<style>body{font-family:Arial,Helvetica,sans-serif;color:#111;padding:20px;max-width:760px;margin:0 auto}
h1{font-size:18px;margin:0 0 4px}.sub{color:#475569;font-size:12px;margin-bottom:12px}
.head{font-size:13px;line-height:1.6;margin-bottom:14px;border:1px solid #e2e8f0;border-radius:8px;padding:10px}
h2{font-size:14px;margin:16px 0 6px}table{width:100%;border-collapse:collapse;font-size:12px}
th,td{border:1px solid #cbd5e1;padding:5px 7px}th{background:#f1f5f9;text-align:left}.c{text-align:center}.r{text-align:right}
.sub-t{text-align:right;font-size:13px;margin:6px 2px}.grand{text-align:right;font-size:16px;font-weight:700;margin-top:8px}
.sign{display:flex;justify-content:space-between;margin-top:34px;font-size:13px}.foot{margin-top:18px;color:#94a3b8;font-size:11px}</style></head>
<body>
<h1>Смета № ${esc(docNo())}</h1><div class="sub">от ${today()}</div>
<div class="head"><div><b>Исполнитель:</b> ${esc(ml) || "—"}</div><div><b>Заказчик:</b> ${esc(ci.client) || "—"}</div><div><b>Объект:</b> ${esc(ci.object) || "—"}</div></div>
<h2>Работы</h2><table><thead><tr><th>№</th><th>Наименование</th><th class="c">Кол-во</th><th class="r">Цена</th><th class="r">Сумма</th></tr></thead><tbody>${wrows || '<tr><td colspan="5" class="c">—</td></tr>'}</tbody></table>
<div class="sub-t">Итого работы: <b>${money(s.workSum)}</b></div>
<h2>Материалы</h2><table><thead><tr><th>№</th><th>Наименование</th><th class="c">Кол-во</th><th class="r">Цена</th><th class="r">Сумма</th></tr></thead><tbody>${mrows || '<tr><td colspan="5" class="c">—</td></tr>'}</tbody></table>
<div class="sub-t">Итого материалы: <b>${money(s.matSum)}</b></div>
${s.disc > 0 ? `<div class="sub-t">Подытог: <b>${money(s.subtotal)}</b></div><div class="sub-t">Скидка ${esc(String(opt.discount))}%: <b>−${money(s.disc)}</b></div>` : ""}
<div class="grand">К ОПЛАТЕ: ${money(s.total)}</div>
<div class="sign"><div>Исполнитель ______________</div><div>Заказчик ______________</div></div>
<div class="foot">Electric Pro</div>
<script>window.onload=function(){setTimeout(function(){window.print();},300);};<\/script></body></html>`;
    const w = window.open("", "_blank");
    if (w && w.document) { w.document.open(); w.document.write(html); w.document.close(); }
    else flash("Разреши всплывающие окна для печати");
  }

  function shareClientEstimate() {
    const s = sums(); const ci = clientInfo();
    const text = `Смета № ${docNo()} от ${today()}\nОбъект: ${ci.object || "—"}\n\nРаботы: ${money(s.workSum)}\nМатериалы: ${money(s.matSum)}\nК оплате: ${money(s.total)}`;
    try {
      if (navigator.share) navigator.share({ title: "Смета № " + docNo(), text }).catch(() => {});
      else if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(text).then(() => flash("Скопировано")).catch(() => flash("Не удалось"));
      else flash("Поделиться недоступно");
    } catch (e) { flash("Поделиться недоступно"); }
  }

  function flash(msg) {
    try {
      let el = document.getElementById("ep-collector-flash");
      if (!el) { el = document.createElement("div"); el.id = "ep-collector-flash"; el.className = "ep-pick-flash"; document.body.appendChild(el); }
      el.textContent = msg; el.classList.add("show");
      clearTimeout(flash._t); flash._t = setTimeout(() => el && el.classList.remove("show"), 1800);
    } catch (e) {}
  }

  document.addEventListener("input", (e) => {
    const t = e.target; if (!t || !t.getAttribute || !document.getElementById("ep-docs-root")) return;
    if (t.hasAttribute("data-doc-no")) { setDocNo(t.value); }
    else if (t.hasAttribute("data-doc-markup")) { opt.markup = Number(t.value) || 0; }
    else if (t.hasAttribute("data-doc-disc")) { opt.discount = Number(t.value) || 0; }
  });
  // пересчёт превью — по уходу с поля (не на каждый символ), чтобы не сбивать фокус
  document.addEventListener("change", (e) => {
    const t = e.target; if (!t || !t.getAttribute || !document.getElementById("ep-docs-root")) return;
    if ((t.hasAttribute("data-doc-markup") || t.hasAttribute("data-doc-disc")) && view === "client-estimate") renderClientEstimate();
  });

  document.addEventListener("click", (e) => {
    const t = e.target; if (!t || !t.closest) return;
    let el;
    if ((el = t.closest("[data-doc]"))) { view = el.getAttribute("data-doc"); render(); return; }
    if (t.closest("[data-doc-back]")) { view = "hub"; render(); return; }
    if ((el = t.closest("[data-doc-mat]"))) { opt.matMode = el.getAttribute("data-doc-mat") === "sum" ? "sum" : "list"; renderClientEstimate(); return; }
    if (t.closest("[data-doc-print]")) { printClientEstimate(); return; }
    if (t.closest("[data-doc-share]")) { shareClientEstimate(); return; }
  });

  window.addEventListener("ep:route-loaded", (e) => {
    const r = e && e.detail && e.detail.route;
    if (r === "documents") { view = "hub"; render(); }
  });
  window.addEventListener("ep:estimate-draft-changed", () => { if (document.getElementById("ep-docs-root") && view === "client-estimate") renderClientEstimate(); });
})();
