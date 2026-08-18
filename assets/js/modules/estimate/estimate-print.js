/* Electric Pro V29 — ПЕЧАТНЫЙ ДОКУМЕНТ СМЕТЫ (единый на все экраны).
   Раньше «Печать / PDF» на экране «Смета» отдавала голую таблицу без шапки, реквизитов,
   итогов и подписей, а «Документы → Смета заказчику» имела свой отдельный HTML — два
   разных бланка на один и тот же документ. Здесь ОДИН источник бланка: печатный лист A4
   с шапкой (номер, дата, исполнитель/заказчик/объект), разделами «Работы»/«Материалы»,
   подытогами по разделам, наценкой/скидкой, суммой ПРОПИСЬЮ, отметкой по НДС и подписями.
   Отдельный бланк — «Заявка на материалы» (лист поставщику: без цен, с местом под отметки).
   ВАЖНО: window.open() ОБЯЗАН вызываться синхронно из обработчика клика (иначе блокировщик
   всплывающих окон его срежет) — open() ниже так и делает, тяжёлой сборки в нём нет. */
(() => {
  "use strict";
  window.EP = window.EP || {};
  const NKEY = "ep_smeta_no_v29";               // тот же счётчик, что у «Документов» — нумерация одна
  const TYPE_LABEL = { self: "Самозанятый", ip: "ИП", ooo: "ООО", fiz: "" };

  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c])); }
  function num(v) { const n = Number(v); return Number.isFinite(n) ? n : 0; }
  // Денежный формат ДОКУМЕНТА: разряды пробелом, копейки запятой, без знака валюты
  // (валюта — в заголовке колонки «Цена, ₽»). Не через EPCurrency: там формат для экрана
  // (символ валюты в каждой ячейке), в печатной таблице это шум.
  function money(v) {
    const n = num(v), f = Math.abs(n).toFixed(2).split(".");
    return (n < 0 ? "−" : "") + f[0].replace(/\B(?=(\d{3})+(?!\d))/g, " ") + "," + f[1];
  }
  // Количество: до 3 знаков, без хвостовых нулей (120 м, 12,5 м, 0,75 кг)
  function qty(v) {
    const n = num(v);
    let s = (Math.round(n * 1000) / 1000).toFixed(3).replace(/0+$/, "").replace(/\.$/, "");
    return s.replace(".", ",");
  }
  function today(d) {
    const t = d instanceof Date ? d : new Date();
    return ("0" + t.getDate()).slice(-2) + "." + ("0" + (t.getMonth() + 1)).slice(-2) + "." + t.getFullYear();
  }
  function docNo() { try { return localStorage.getItem(NKEY) || "1"; } catch (e) { return "1"; } }
  function setDocNo(v) { try { localStorage.setItem(NKEY, String(v || "1")); } catch (e) {} }

  /* ---------- сумма прописью ----------
     Обязательный элемент сметы/счёта. Род числа зависит от разряда: «одна тысяча», но
     «один миллион» и «один рубль» — поэтому triad() принимает признак женского рода. */
  const ONES = [
    ["", "один", "два", "три", "четыре", "пять", "шесть", "семь", "восемь", "девять"],
    ["", "одна", "две", "три", "четыре", "пять", "шесть", "семь", "восемь", "девять"]
  ];
  const TEENS = ["десять", "одиннадцать", "двенадцать", "тринадцать", "четырнадцать", "пятнадцать", "шестнадцать", "семнадцать", "восемнадцать", "девятнадцать"];
  const TENS = ["", "", "двадцать", "тридцать", "сорок", "пятьдесят", "шестьдесят", "семьдесят", "восемьдесят", "девяносто"];
  const HUNDREDS = ["", "сто", "двести", "триста", "четыреста", "пятьсот", "шестьсот", "семьсот", "восемьсот", "девятьсот"];
  function plural(n, one, few, many) {
    const a = Math.abs(n) % 100, b = a % 10;
    if (a > 10 && a < 20) return many;
    if (b > 1 && b < 5) return few;
    if (b === 1) return one;
    return many;
  }
  function triad(n, fem) {
    const out = [];
    const h = Math.floor(n / 100), t = Math.floor((n % 100) / 10), o = n % 10;
    if (h) out.push(HUNDREDS[h]);
    if (t === 1) out.push(TEENS[o]);
    else {
      if (t) out.push(TENS[t]);
      if (o) out.push(ONES[fem ? 1 : 0][o]);
    }
    return out.join(" ");
  }
  function rublesInWords(v) {
    const total = Math.round(num(v) * 100);
    const rub = Math.floor(total / 100), kop = total % 100;
    const parts = [];
    const mlrd = Math.floor(rub / 1e9), mln = Math.floor((rub % 1e9) / 1e6), thou = Math.floor((rub % 1e6) / 1000), ones = rub % 1000;
    if (mlrd) parts.push(triad(mlrd, false), plural(mlrd, "миллиард", "миллиарда", "миллиардов"));
    if (mln) parts.push(triad(mln, false), plural(mln, "миллион", "миллиона", "миллионов"));
    if (thou) parts.push(triad(thou, true), plural(thou, "тысяча", "тысячи", "тысяч"));
    if (!rub) parts.push("ноль");            // «Ноль рублей 05 копеек», а не «Рублей 05 копеек»
    else if (ones) parts.push(triad(ones, false));
    parts.push(plural(rub, "рубль", "рубля", "рублей"));
    let s = parts.filter(Boolean).join(" ").replace(/\s+/g, " ").trim();
    s = s.charAt(0).toUpperCase() + s.slice(1);
    return s + " " + ("0" + kop).slice(-2) + " " + plural(kop, "копейка", "копейки", "копеек");
  }

  /* ---------- реквизиты ---------- */
  function masterOf(o) {
    if (o && o.master) return o.master;
    try { return (window.EP.Profile && window.EP.Profile.getMaster()) || {}; } catch (e) { return {}; }
  }
  function clientOf(o) {
    if (o && (o.client || o.object)) return { name: o.client || "", object: o.object || "", phone: o.clientPhone || "" };
    try {
      const c = (window.EP.Profile && window.EP.Profile.getClient()) || {};
      return { name: c.name || "", object: c.object || "", phone: c.phone || "" };
    } catch (e) { return { name: "", object: "", phone: "" }; }
  }
  function masterFull(m) {
    const parts = [];
    const t = TYPE_LABEL[m.type];
    if (m.name) parts.push((t ? t + " " : "") + m.name);
    else if (t) parts.push(t);
    if (m.inn) parts.push("ИНН " + m.inn);
    if (m.ogrn) parts.push("ОГРН " + m.ogrn);
    if (m.address) parts.push(m.address);
    if (m.phone) parts.push("тел. " + m.phone);
    if (m.email) parts.push(m.email);
    return parts.join(", ");
  }
  // «НДС не облагается» — честно только для форм без НДС (самозанятый/ИП/физлицо);
  // для ООО режим налогообложения приложению неизвестен, поэтому строку не печатаем,
  // чтобы не подписать документ неверной формулировкой.
  function vatNote(m) {
    if (m.type === "ooo") return "";
    if (m.type === "self") return "НДС не облагается (налог на профессиональный доход).";
    return "НДС не облагается.";
  }

  /* ---------- общий каркас листа ---------- */
  function pageCss() {
    return `@page { size: A4 portrait; margin: 15mm 12mm 14mm; }
      * { box-sizing: border-box; }
      body { margin: 0; font: 11px/1.35 Arial, "Helvetica Neue", Helvetica, sans-serif; color: #000;
             -webkit-print-color-adjust: exact; print-color-adjust: exact; }
      .doc { max-width: 186mm; margin: 0 auto; }
      h1 { font-size: 16px; margin: 0; text-transform: uppercase; letter-spacing: .02em; }
      .top { display: flex; justify-content: space-between; align-items: flex-end; border-bottom: 0.6mm solid #000; padding-bottom: 2mm; margin-bottom: 3mm; }
      .top .date { font-size: 12px; }
      table.req { width: 100%; border-collapse: collapse; margin-bottom: 3mm; }
      table.req th { width: 26mm; text-align: left; vertical-align: top; font-weight: 700; padding: 1mm 2mm 1mm 0; }
      table.req td { vertical-align: top; padding: 1mm 0; }
      table.tb { width: 100%; border-collapse: collapse; }
      table.tb th, table.tb td { border: 0.2mm solid #000; padding: 1.2mm 1.6mm; vertical-align: top; }
      table.tb th { background: #eef2f7; text-align: center; font-weight: 700; }
      /* шапка таблицы повторяется на КАЖДОЙ странице печати, строки не рвутся пополам */
      table.tb thead { display: table-header-group; }
      table.tb tr, table.tb td, table.tb th { break-inside: avoid; page-break-inside: avoid; }
      td.c { text-align: center; } td.r { text-align: right; white-space: nowrap; }
      tr.sec td { background: #e2e8f0; font-weight: 700; text-transform: uppercase; letter-spacing: .02em; }
      tr.st td { font-weight: 700; background: #f6f8fb; }
      .tot { margin-top: 3mm; break-inside: avoid; page-break-inside: avoid; }
      table.sum { border-collapse: collapse; margin-left: auto; }
      table.sum td { padding: 1mm 2mm; }
      table.sum td.k { text-align: right; }
      table.sum td.v { text-align: right; white-space: nowrap; min-width: 30mm; border-bottom: 0.2mm solid #000; }
      table.sum tr.grand td { font-size: 13px; font-weight: 700; padding-top: 2mm; }
      .words { margin-top: 2mm; font-size: 11px; }
      .vat { margin-top: 1mm; font-size: 10px; }
      .sign { margin-top: 10mm; display: flex; gap: 10mm; break-inside: avoid; page-break-inside: avoid; }
      .sign > div { flex: 1 1 0; }
      .sign .ln { border-bottom: 0.2mm solid #000; height: 7mm; }
      .sign .cap { font-size: 9px; color: #333; text-align: center; padding-top: 1mm; }
      .note { margin-top: 4mm; font-size: 10px; color: #333; }
      .foot { margin-top: 6mm; font-size: 9px; color: #555; border-top: 0.2mm solid #999; padding-top: 1.5mm; }
      .empty { text-align: center; padding: 4mm; }`;
  }
  function wrap(title, body) {
    return `<!doctype html><html lang="ru"><head><meta charset="utf-8"><title>${esc(title)}</title>
<style>${pageCss()}</style></head><body><div class="doc">${body}</div>
<script>window.onload=function(){setTimeout(function(){window.print();},350);};<\/script></body></html>`;
  }
  function reqTable(rows) {
    return `<table class="req">${rows.filter((r) => r).map((r) => `<tr><th>${esc(r[0])}</th><td>${esc(r[1]) || "—"}</td></tr>`).join("")}</table>`;
  }
  function signBlock(left, right) {
    return `<div class="sign">
      <div><div class="ln"></div><div class="cap">${esc(left)}</div></div>
      <div><div class="ln"></div><div class="cap">${esc(right)}</div></div>
    </div>`;
  }

  /* ---------- СМЕТА ----------
     o = { works, mats, no, date, master, client, object, markup, discount, matMode, title }
     works/mats — уже агрегированные строки {name, unit, qty, price}; наценка (markup, %)
     применяется к цене МАТЕРИАЛОВ (как в «Документах»), скидка (discount, %) — к подытогу. */
  function estimateHtml(o) {
    o = o || {};
    const works = (o.works || []).filter((x) => num(x.qty) > 0);
    const mats = (o.mats || []).filter((x) => num(x.qty) > 0);
    const k = 1 + num(o.markup) / 100;
    const workSum = works.reduce((s, x) => s + num(x.price) * num(x.qty), 0);
    const matSum = mats.reduce((s, x) => s + num(x.price) * k * num(x.qty), 0);
    const subtotal = workSum + matSum;
    const disc = subtotal * num(o.discount) / 100;
    const total = subtotal - disc;
    const m = masterOf(o), ci = clientOf(o);
    const no = o.no || docNo(), date = o.date || today();

    let n = 0;
    const rowsOf = (arr, mul) => arr.map((x) => {
      const price = num(x.price) * (mul || 1), sum = price * num(x.qty);
      return `<tr><td class="c">${++n}</td><td>${esc(x.name)}</td><td class="c">${esc(x.unit || "")}</td>
        <td class="r">${qty(x.qty)}</td><td class="r">${money(price)}</td><td class="r">${money(sum)}</td></tr>`;
    }).join("");
    const secWorks = works.length ? `<tr class="sec"><td colspan="6">Раздел 1. Работы</td></tr>${rowsOf(works, 1)}
      <tr class="st"><td colspan="5" class="r">Итого по разделу 1</td><td class="r">${money(workSum)}</td></tr>` : "";
    const matBody = (o.matMode === "sum")
      ? `<tr><td class="c">${++n}</td><td>Материалы по проекту (комплект)</td><td class="c">компл</td>
           <td class="r">1</td><td class="r">${money(matSum)}</td><td class="r">${money(matSum)}</td></tr>`
      : rowsOf(mats, k);
    const secMats = mats.length ? `<tr class="sec"><td colspan="6">Раздел ${works.length ? 2 : 1}. Материалы</td></tr>${matBody}
      <tr class="st"><td colspan="5" class="r">Итого по разделу ${works.length ? 2 : 1}</td><td class="r">${money(matSum)}</td></tr>` : "";

    // heading — заголовок листа: «Смета» (целиком), «Смета работ», «Смета материалов»
    // (когда печатают только один раздел). По умолчанию «Смета» — обратная совместимость.
    const heading = o.heading || "Смета";
    const sumRows = [];
    if (works.length) sumRows.push(["Работы", money(workSum)]);
    if (mats.length) sumRows.push([o.markup ? "Материалы (с наценкой " + qty(o.markup) + " %)" : "Материалы", money(matSum)]);
    if (disc > 0) { sumRows.push(["Подытог", money(subtotal)]); sumRows.push(["Скидка " + qty(o.discount) + " %", "−" + money(disc)]); }
    const body = `
      <div class="top"><h1>${esc(heading)} № ${esc(no)}</h1><div class="date">от ${esc(date)}</div></div>
      ${reqTable([["Исполнитель", masterFull(m)], ["Заказчик", [ci.name, ci.phone ? "тел. " + ci.phone : ""].filter(Boolean).join(", ")], ["Объект", ci.object]])}
      <table class="tb">
        <colgroup><col style="width:9mm"><col><col style="width:14mm"><col style="width:18mm"><col style="width:24mm"><col style="width:26mm"></colgroup>
        <thead><tr><th>№</th><th>Наименование работ и материалов</th><th>Ед.</th><th>Кол-во</th><th>Цена, ₽</th><th>Сумма, ₽</th></tr></thead>
        <tbody>${secWorks}${secMats}${(!works.length && !mats.length) ? `<tr><td colspan="6" class="empty">Смета пуста</td></tr>` : ""}</tbody>
      </table>
      <div class="tot">
        <table class="sum">
          ${sumRows.map((r) => `<tr><td class="k">${esc(r[0])}</td><td class="v">${r[1]}</td></tr>`).join("")}
          <tr class="grand"><td class="k">Всего к оплате</td><td class="v">${money(total)} ₽</td></tr>
        </table>
        <div class="words">Всего к оплате: <b>${esc(rublesInWords(total))}</b>.</div>
        ${vatNote(m) ? `<div class="vat">${esc(vatNote(m))}</div>` : ""}
      </div>
      <div class="note">Смета носит предварительный характер: фактический объём работ и материалов уточняется по факту выполнения.
        Стоимость материалов может измениться при изменении цен поставщика.</div>
      ${signBlock("Исполнитель (подпись, ФИО)", "Заказчик (подпись, ФИО)")}
      <div class="foot">${esc(heading)} № ${esc(no)} от ${esc(date)} · ${esc(m.name || "Electric Pro")} · сформировано в Electric Pro</div>`;
    return wrap(heading + " № " + no, body);
  }

  /* ---------- ЗАЯВКА НА МАТЕРИАЛЫ (лист поставщику) ----------
     Цены НЕ печатаем: это закупочный лист, цену ставит поставщик — под это есть колонки
     «Цена» и «Сумма» ПУСТЫЕ, чтобы он заполнил их от руки или в своей системе. */
  function supplyHtml(o) {
    o = o || {};
    const mats = (o.mats || []).filter((x) => num(x.qty) > 0);
    const m = masterOf(o), ci = clientOf(o);
    const no = o.no || docNo(), date = o.date || today();
    const rows = mats.map((x, i) => `<tr><td class="c">${i + 1}</td><td>${esc(x.name)}</td>
      <td class="c">${esc(x.unit || "")}</td><td class="r">${qty(x.qty)}</td><td></td><td></td></tr>`).join("");
    const body = `
      <div class="top"><h1>Заявка на материалы № ${esc(no)}</h1><div class="date">от ${esc(date)}</div></div>
      ${reqTable([["Заказчик", masterFull(m)], ["Объект", ci.object], ["Позиций", String(mats.length)]])}
      <table class="tb">
        <colgroup><col style="width:9mm"><col><col style="width:14mm"><col style="width:18mm"><col style="width:24mm"><col style="width:26mm"></colgroup>
        <thead><tr><th>№</th><th>Наименование материала</th><th>Ед.</th><th>Кол-во</th><th>Цена, ₽</th><th>Сумма, ₽</th></tr></thead>
        <tbody>${rows || `<tr><td colspan="6" class="empty">Материалов нет</td></tr>`}</tbody>
      </table>
      <div class="note">Цены и суммы заполняет поставщик. Аналоги — по согласованию с заказчиком заявки.</div>
      ${signBlock("Заявку составил (подпись, ФИО)", "Принял, поставщик (подпись, ФИО)")}
      <div class="foot">Заявка № ${esc(no)} от ${esc(date)} · ${esc(m.name || "Electric Pro")} · сформировано в Electric Pro</div>`;
    return wrap("Заявка на материалы № " + no, body);
  }

  // window.open ОБЯЗАН быть синхронным в стеке клика (см. комментарий вверху файла)
  function open(html) {
    const w = window.open("", "_blank");
    if (!w || !w.document) return false;
    w.document.open(); w.document.write(html); w.document.close();
    return true;
  }

  window.EP.EstimatePrint = { estimateHtml, supplyHtml, open, rublesInWords, money, qty, today, docNo, setDocNo, masterFull, vatNote };
})();
