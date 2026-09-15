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

  /* Правовая оговорка сметы. По п. 4 ст. 709 ГК РФ смета бывает приблизительной или
     твёрдой, и ПРИ ОТСУТСТВИИ УКАЗАНИЙ считается твёрдой — то есть молчание в документе
     само по себе юридический выбор, причём в пользу заказчика. Поэтому вид сметы всегда
     печатается явно; текст берётся у EP.EstimateChanges (единый источник формулировок для
     сметы, акта и доп. соглашения), фолбэк — на случай, если модуль не подключён. */
  function legalNote(o) {
    const C = window.EP && window.EP.EstimateChanges;
    const kind = (o && o.kind) || (C && C.getKind ? C.getKind() : "approx");
    const base = C && C.kindNote ? C.kindNote(kind)
      : "Смета носит предварительный характер: фактический объём работ и материалов уточняется по факту выполнения.";
    return base + " Стоимость материалов может измениться при изменении цен поставщика на дату закупки.";
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
  // БЕЗ авто-print <script> внутри листа: печать вызывает open() ниже — из скрытого
  // iframe с явным focus()+print(), иначе часть браузеров печатала бы родительскую
  // страницу вместо листа. Для фолбэка-вкладки печать тоже вызывается из open().
  function wrap(title, body) {
    return `<!doctype html><html lang="ru"><head><meta charset="utf-8"><title>${esc(title)}</title>
<style>${pageCss()}</style></head><body><div class="doc">${body}</div></body></html>`;
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

  /* ---------- НАДБАВКИ И ИТОГИ (единый счёт для бланка и для архива) ----------
     Надбавки меняют ЦЕНУ ПОЗИЦИИ, а не добавляют отдельную строку: 10 ₽ при 10 % — это
     11 ₽ в колонке «Цена». Заказчику надбавки НЕ раскрываются (в документе их не видно —
     он видит обычную цену), скидка — видна отдельной строкой, её как раз показывают.
       markup     — наценка на МАТЕРИАЛЫ (как было, «Документы» шлют её же);
       workMarkup — процент прорабу, на РАБОТЫ;
       pad        — резерв под будущую скидку, на ВСЁ (чтобы скидку было из чего дать);
       discount   — сама скидка, к подытогу.
     Цена позиции округляется до копейки ДО умножения на количество — иначе итог в шапке
     не сходился бы с суммой колонки «Сумма» на доли копейки. */
  function r2(x) { return Math.round(num(x) * 100) / 100; }
  function factors(o) {
    o = o || {};
    const pad = 1 + num(o.pad) / 100;
    return { work: (1 + num(o.workMarkup) / 100) * pad, mat: (1 + num(o.markup) / 100) * pad };
  }
  function calcTotals(o) {
    o = o || {};
    const f = factors(o);
    const works = (o.works || []).filter((x) => num(x.qty) > 0);
    const mats = (o.mats || []).filter((x) => num(x.qty) > 0);
    const workSum = works.reduce((s, x) => s + r2(num(x.price) * f.work) * num(x.qty), 0);
    const matSum = mats.reduce((s, x) => s + r2(num(x.price) * f.mat) * num(x.qty), 0);
    const subtotal = workSum + matSum;
    const disc = subtotal * num(o.discount) / 100;
    return { works, mats, f, workSum, matSum, subtotal, disc, total: subtotal - disc };
  }

  /* ---------- СМЕТА ----------
     o = { works, mats, no, date, master, client, object, markup, workMarkup, pad,
           discount, matMode, title }
     works/mats — уже агрегированные строки {name, unit, qty, price}. */
  function estimateHtml(o) {
    o = o || {};
    const T = calcTotals(o);
    const works = T.works, mats = T.mats, k = T.f.mat;
    const workSum = T.workSum, matSum = T.matSum, subtotal = T.subtotal, disc = T.disc, total = T.total;
    const m = masterOf(o), ci = clientOf(o);
    const no = o.no || docNo(), date = o.date || today();

    let n = 0;
    const rowsOf = (arr, mul) => arr.map((x) => {
      const price = r2(num(x.price) * (mul || 1)), sum = price * num(x.qty);
      return `<tr><td class="c">${++n}</td><td>${esc(x.name)}</td><td class="c">${esc(x.unit || "")}</td>
        <td class="r">${qty(x.qty)}</td><td class="r">${money(price)}</td><td class="r">${money(sum)}</td></tr>`;
    }).join("");
    const secWorks = works.length ? `<tr class="sec"><td colspan="6">Раздел 1. Работы</td></tr>${rowsOf(works, T.f.work)}
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
    if (mats.length) sumRows.push(["Материалы", money(matSum)]);
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
      <div class="note">${esc(legalNote(o))}</div>
      ${signBlock("Исполнитель (подпись, ФИО)", "Заказчик (подпись, ФИО)")}
      <div class="foot">${esc(heading)} № ${esc(no)} от ${esc(date)} · ${esc(m.name || "Electric Pro")} · сформировано в Electric Pro</div>`;
    return wrap(heading + " № " + no, body);
  }

  /* ---------- СМЕТА ПО РАБОТАМ: ЭТАПЫ И СРОКИ ----------
     Тот же бланк (шапка, реквизиты, подписи, печатная механика — всё общее), но работы
     сгруппированы ПО ЭТАПАМ и у каждой строки есть трудозатраты. Заказчику видно, что за
     чем идёт и сколько это по времени; мастеру — чем обосновать срок и разбить оплату.
     Материалов здесь нет вовсе: это документ про труд, не про закупку. */
  function worksStagesHtml(o) {
    o = o || {};
    const W = window.EP && window.EP.EstimateWorks;
    if (!W) return estimateHtml(o);          // модуль не подключён — обычная смета работ
    // надбавки применяются К ЦЕНЕ строки ДО разбивки по этапам — иначе подытоги этапов и
    // «Всего работ» считались бы по «чистой» цене и разошлись бы с обычной сметой
    const fw = factors(o).work;
    const wsrc = (o.works || []).map((x) => (fw === 1 ? x : Object.assign({}, x, { price: r2(num(x.price) * fw) })));
    const br = W.breakdown(wsrc, { extra: o.extraMode || "all", crew: o.crew });
    const m = masterOf(o), ci = clientOf(o);
    const no = o.no || docNo(), date = o.date || today();
    const heading = o.heading || "Смета по работам";
    let n = 0;
    const secs = br.stages.map((s, i) => `
      <tr class="sec"><td colspan="7">Этап ${i + 1}. ${esc(s.name)}</td></tr>
      ${s.items.map((x) => `<tr><td class="c">${++n}</td><td>${esc(x.name)}</td><td class="c">${esc(x.unit)}</td>
        <td class="r">${qty(x.qty)}</td><td class="r">${money(x.price)}</td><td class="r">${money(x.sum)}</td>
        <td class="r">${qty(Math.round(x.hours * 10) / 10)}</td></tr>`).join("")}
      <tr class="st"><td colspan="5" class="r">Итого по этапу ${i + 1}</td><td class="r">${money(s.sum)}</td><td class="r">${qty(s.hours)}</td></tr>`).join("");
    const body = `
      <div class="top"><h1>${esc(heading)} № ${esc(no)}</h1><div class="date">от ${esc(date)}</div></div>
      ${reqTable([["Исполнитель", masterFull(m)], ["Заказчик", [ci.name, ci.phone ? "тел. " + ci.phone : ""].filter(Boolean).join(", ")], ["Объект", ci.object]])}
      <table class="tb">
        <colgroup><col style="width:9mm"><col><col style="width:12mm"><col style="width:16mm"><col style="width:22mm"><col style="width:24mm"><col style="width:16mm"></colgroup>
        <thead><tr><th>№</th><th>Наименование работ</th><th>Ед.</th><th>Кол-во</th><th>Цена, ₽</th><th>Сумма, ₽</th><th>Труд, ч</th></tr></thead>
        <tbody>${secs || `<tr><td colspan="7" class="empty">Работ нет</td></tr>`}</tbody>
      </table>
      <div class="tot">
        <table class="sum">
          <tr><td class="k">Трудозатраты</td><td class="v">${qty(br.hours)} чел.-ч</td></tr>
          <tr><td class="k">Бригада</td><td class="v">${br.crew.people} чел. × ${qty(br.crew.hoursPerDay)} ч/смена</td></tr>
          <tr><td class="k">Ориентировочный срок</td><td class="v">${qty(br.days)} раб. дн.</td></tr>
          <tr class="grand"><td class="k">Всего работ</td><td class="v">${money(br.sum)} ₽</td></tr>
        </table>
        <div class="words">Всего по работам: <b>${esc(rublesInWords(br.sum))}</b>.</div>
        ${vatNote(m) ? `<div class="vat">${esc(vatNote(m))}</div>` : ""}
      </div>
      <div class="note">Трудозатраты и срок — расчётные, по нормам выработки: фактическое время зависит от материала стен,
        готовности объекта и доступа к фронту работ. Материалы в настоящий документ не входят.</div>
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

  /* ---------- ИЗМЕНЕНИЯ СМЕТЫ: общая таблица «было → стало» ----------
     Одна и та же таблица печатается и в акте о дополнительных работах (уведомление
     заказчика), и в дополнительном соглашении (само изменение договора) — считать разницу
     двумя разными способами в двух документах, которые подписываются вместе, нельзя. */
  function CHG() { return window.EP && window.EP.EstimateChanges; }
  const OP_LABEL = { add: "Добавление", swap: "Замена", qty: "Изменение объёма", price: "Изменение цены", remove: "Исключение" };
  function changeTable(entries) {
    const C = CHG();
    const rows = (entries || []).map((e, i) => {
      const d = C && C.deltaOf ? C.deltaOf(e) : (num(e.qtyNew) * num(e.priceNew) - num(e.qtyOld) * num(e.priceOld));
      const was = num(e.qtyOld) ? qty(e.qtyOld) + " × " + money(e.priceOld) : "—";
      const now = num(e.qtyNew) ? qty(e.qtyNew) + " × " + money(e.priceNew) : "—";
      const nm = e.nameOld ? esc(e.nameOld) + " → " + esc(e.name) : esc(e.name);
      return `<tr><td class="c">${i + 1}</td><td class="c">${esc(OP_LABEL[e.op] || e.op || "")}</td>
        <td>${nm}${e.reason ? `<br><span style="font-size:9px;color:#444">${esc(e.reason)}</span>` : ""}</td>
        <td class="c">${esc(e.unit || "")}</td><td class="r">${was}</td><td class="r">${now}</td>
        <td class="r">${(d >= 0 ? "+" : "") + money(d)}</td></tr>`;
    }).join("");
    return `<table class="tb">
      <colgroup><col style="width:8mm"><col style="width:22mm"><col><col style="width:11mm"><col style="width:27mm"><col style="width:27mm"><col style="width:24mm"></colgroup>
      <thead><tr><th>№</th><th>Вид изменения</th><th>Наименование</th><th>Ед.</th><th>Было (кол-во × цена)</th><th>Стало (кол-во × цена)</th><th>Разница, ₽</th></tr></thead>
      <tbody>${rows || `<tr><td colspan="7" class="empty">Изменений нет</td></tr>`}</tbody></table>`;
  }
  // Правовые основания, реально использованные в этих записях — по одному разу, в порядке
  // появления: подписывать документ полным списком статей, включая неприменённые, нельзя.
  function basisList(entries) {
    const C = CHG(); if (!C || !C.basisInfo) return [];
    const seen = {}, out = [];
    (entries || []).forEach((e) => {
      const b = C.basisInfo(e.basis);
      if (b && !seen[b.id]) { seen[b.id] = 1; out.push(b); }
    });
    return out;
  }

  /* ---------- АКТ О ВЫЯВЛЕННЫХ ДОПОЛНИТЕЛЬНЫХ РАБОТАХ ----------
     Уведомление заказчика по п. 3 ст. 743 ГК РФ. Ценность документа не в таблице, а в
     ДАТЕ и подписи заказчика: подрядчик, не сообщивший о дополнительных работах, по п. 4
     ст. 743 ГК РФ лишается права требовать их оплаты, даже если работы реально выполнены. */
  function changeActHtml(o) {
    o = o || {};
    const C = CHG();
    const entries = o.entries || (C && C.list ? C.list() : []);
    const sm = o.summary || (C && C.summary ? C.summary(o.contractSum) : { delta: 0, up: 0, down: 0, start: 0, total: 0, percent: 0, over10: false });
    const m = masterOf(o), ci = clientOf(o);
    const doc = (C && C.getDoc ? C.getDoc() : {}) || {};
    const no = o.no || doc.actNo || docNo(), date = o.date || today();
    const dog = doc.dogNo ? `к договору подряда № ${esc(doc.dogNo)}${doc.dogDate ? " от " + esc(doc.dogDate) : ""}` : "";
    const bases = basisList(entries);
    const body = `
      <div class="top"><h1>Акт о выявленных дополнительных работах № ${esc(no)}</h1><div class="date">от ${esc(date)}</div></div>
      ${reqTable([["Исполнитель", masterFull(m)], ["Заказчик", [ci.name, ci.phone ? "тел. " + ci.phone : ""].filter(Boolean).join(", ")],
        ["Объект", ci.object], ["Договор", dog ? dog.replace("к договору подряда ", "") : "—"]])}
      <div class="note" style="margin:0 0 3mm">В ходе выполнения работ ${dog ? dog + " " : ""}Исполнителем выявлена необходимость
        изменения объёма и стоимости работ. Настоящим Исполнитель уведомляет Заказчика о следующем:</div>
      ${changeTable(entries)}
      <div class="tot">
        <table class="sum">
          <tr><td class="k">Стоимость по договору</td><td class="v">${money(sm.start)}</td></tr>
          ${sm.up ? `<tr><td class="k">Увеличение</td><td class="v">+${money(sm.up)}</td></tr>` : ""}
          ${sm.down ? `<tr><td class="k">Уменьшение</td><td class="v">${money(sm.down)}</td></tr>` : ""}
          <tr class="grand"><td class="k">Стоимость с учётом изменений</td><td class="v">${money(sm.total)} ₽</td></tr>
        </table>
        <div class="words">Изменение стоимости: <b>${(sm.delta >= 0 ? "+" : "") + money(sm.delta)} ₽</b>
          (${qty(Math.round(sm.percent * 10) / 10)} % от цены договора). ${esc(rublesInWords(Math.abs(sm.delta)))}.</div>
      </div>
      <div class="note">
        ${bases.map((b) => `<div>• ${esc(b.name)}: ${esc(b.note)}</div>`).join("")}
        <div style="margin-top:2mm">Заказчику надлежит в течение 10 (десяти) дней со дня получения настоящего акта сообщить Исполнителю
        о принятом решении, если договором не установлен иной срок. При неполучении ответа в указанный срок Исполнитель обязан
        приостановить соответствующие работы с отнесением убытков на счёт Заказчика (п. 3 ст. 743 ГК РФ).</div>
        <div>Дополнительные работы выполняются и оплачиваются после подписания сторонами дополнительного соглашения к договору
        ${sm.over10 ? "и согласованной сторонами дополнительной сметы (ст. 744 ГК РФ — изменение превышает 10 % общей стоимости работ)" : "(ст. 450, 452 ГК РФ)"}.</div>
      </div>
      ${signBlock("Уведомил, Исполнитель (подпись, ФИО, дата)", "Уведомление получил, Заказчик (подпись, ФИО, дата)")}
      <div class="foot">Акт № ${esc(no)} от ${esc(date)} · ${esc(m.name || "Electric Pro")} · сформировано в Electric Pro</div>`;
    return wrap("Акт о доп. работах № " + no, body);
  }

  /* ---------- ДОПОЛНИТЕЛЬНОЕ СОГЛАШЕНИЕ К ДОГОВОРУ ----------
     Само изменение договора: цена и объём меняются соглашением сторон (п. 1 ст. 450 ГК РФ),
     совершённым в той же форме, что и договор (п. 1 ст. 452 ГК РФ) — то есть письменно и
     с подписями обеих сторон. Правка таблицы в приложении договор не меняет. */
  function supplementHtml(o) {
    o = o || {};
    const C = CHG();
    const entries = o.entries || (C && C.list ? C.list() : []);
    const sm = o.summary || (C && C.summary ? C.summary(o.contractSum) : { delta: 0, start: 0, total: 0, percent: 0, over10: false });
    const m = masterOf(o), ci = clientOf(o);
    const doc = (C && C.getDoc ? C.getDoc() : {}) || {};
    const no = o.no || doc.supNo || "1", date = o.date || today();
    const days = num(doc.days);
    const body = `
      <div class="top"><h1>Дополнительное соглашение № ${esc(no)}</h1><div class="date">от ${esc(date)}</div></div>
      <div class="note" style="margin:0 0 3mm">к договору подряда № ${esc(doc.dogNo || "____")}${doc.dogDate ? " от " + esc(doc.dogDate) : ""}
        ${doc.city ? " · г. " + esc(doc.city) : ""}</div>
      ${reqTable([["Исполнитель", masterFull(m)], ["Заказчик", [ci.name, ci.phone ? "тел. " + ci.phone : ""].filter(Boolean).join(", ")], ["Объект", ci.object]])}
      <div class="note" style="margin:0 0 3mm">${esc(masterFull(m) || "Исполнитель")} (далее — «Исполнитель») и
        ${esc(ci.name || "Заказчик")} (далее — «Заказчик»), руководствуясь п. 1 ст. 450 Гражданского кодекса Российской Федерации,
        заключили настоящее дополнительное соглашение о нижеследующем:</div>
      <div class="note" style="margin:0 0 2mm"><b>1.</b> Стороны согласовали изменение объёма и стоимости работ по договору
        согласно таблице изменений:</div>
      ${changeTable(entries)}
      <div class="tot">
        <table class="sum">
          <tr><td class="k">Цена договора до изменения</td><td class="v">${money(sm.start)}</td></tr>
          <tr><td class="k">Изменение</td><td class="v">${(sm.delta >= 0 ? "+" : "") + money(sm.delta)}</td></tr>
          <tr class="grand"><td class="k">Цена договора после изменения</td><td class="v">${money(sm.total)} ₽</td></tr>
        </table>
        <div class="words">Цена договора с учётом настоящего соглашения: <b>${esc(rublesInWords(sm.total))}</b>.</div>
        ${vatNote(m) ? `<div class="vat">${esc(vatNote(m))}</div>` : ""}
      </div>
      <div class="note">
        <div><b>2.</b> Смета (приложение к договору) излагается в новой редакции с учётом изменений, указанных в п. 1
          настоящего соглашения. Стоимость дополнительных работ оплачивается Заказчиком в порядке, установленном договором.</div>
        ${days ? `<div><b>3.</b> Срок выполнения работ по договору продлевается на ${esc(String(days))} рабочих дней.</div>` : ""}
        <div><b>${days ? 4 : 3}.</b> Остальные условия договора, не затронутые настоящим соглашением, остаются неизменными.</div>
        <div><b>${days ? 5 : 4}.</b> Настоящее соглашение составлено в двух экземплярах, имеющих равную юридическую силу, является
          неотъемлемой частью договора и вступает в силу с момента подписания обеими сторонами (п. 1 ст. 452 ГК РФ).</div>
      </div>
      ${signBlock("Исполнитель (подпись, ФИО)", "Заказчик (подпись, ФИО)")}
      <div class="foot">Доп. соглашение № ${esc(no)} от ${esc(date)} к договору № ${esc(doc.dogNo || "____")} · сформировано в Electric Pro</div>`;
    return wrap("Доп. соглашение № " + no, body);
  }

  // Печать. РАНЬШЕ открывала лист в новой вкладке (window.open) и полагалась на
  // авто-print внутри неё — но в мобильных браузерах и в УСТАНОВЛЕННОМ PWA
  // window.open("","_blank") часто блокируется или открывает вкладку без диалога
  // печати: «нажимаю печать, а выбор принтера не появляется». Теперь печатаем из
  // СКРЫТОГО iframe с явным focus()+print() — системный диалог выбора принтера/
  // «Сохранить как PDF» поднимается надёжно. Вызывается синхронно из обработчика клика.
  function open(html) {
    try {
      if (!document || !document.body) throw new Error("no dom");
      const frame = document.createElement("iframe");
      frame.setAttribute("aria-hidden", "true");
      frame.style.cssText = "position:fixed;right:0;bottom:0;width:1px;height:1px;border:0;opacity:0;";
      document.body.appendChild(frame);
      const cw = frame.contentWindow, idoc = cw.document;
      idoc.open(); idoc.write(html); idoc.close();
      let ran = false;
      const run = function () {
        if (ran) return; ran = true;
        // focus() ОБЯЗАТЕЛЕН перед print(): без него часть движков печатает
        // родительскую страницу, а не содержимое iframe.
        try { cw.focus(); cw.print(); } catch (e) {}
        // убрать iframe после закрытия диалога печати (afterprint) либо по таймауту
        const kill = function () { setTimeout(function () { try { frame.remove(); } catch (e) {} }, 1000); };
        try { cw.onafterprint = kill; } catch (e) {}
        setTimeout(kill, 60000);
      };
      // лист — чистый HTML/CSS (без внешних картинок/шрифтов), раскладка готова почти
      // сразу; небольшая задержка на всякий случай
      setTimeout(run, 160);
      return true;
    } catch (e) {
      // фолбэк — отдельная вкладка (десктоп, где popup разрешён): печать по загрузке
      // + страховка таймером; guard, чтобы диалог не открылся дважды
      const w = window.open("", "_blank");
      if (!w || !w.document) return false;
      w.document.open(); w.document.write(html); w.document.close();
      let pr = false;
      const doPr = function () { if (pr) return; pr = true; try { w.focus(); w.print(); } catch (e) {} };
      try { w.onload = doPr; } catch (e) {}
      setTimeout(doPr, 500);
      return true;
    }
  }

  window.EP.EstimatePrint = {
    estimateHtml, worksStagesHtml, supplyHtml, changeActHtml, supplementHtml,
    open, rublesInWords, money, qty, today, docNo, setDocNo, masterFull, vatNote, legalNote,
    factors, calcTotals
  };
})();
