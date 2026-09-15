/* Electric Pro V29 — Этап 2. Вкладки «Смета работ» (работы клиенту) и «Поставщику» (материалы, закупка)
   из общего сборника EP.Estimate. Суммирование одинаковых, печать/PDF, поделиться. Без MutationObserver. */
(() => {
  "use strict";
  function Draft() { return (window.EP && window.EP.Estimate) || null; }
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c])); }
  function money(v) {
    try { if (window.EPCurrency && window.EPCurrency.format) return window.EPCurrency.format(v); } catch (e) {}
    return (Number(v || 0).toFixed(2)) + " \u20bd";
  }
  let tab = "works"; // works | supply
  // Печать — что печатать (scope). Просьба пользователя: «печатать как материалы так и
  // работы». scope: "all" (целиком) | "work" | "stages" | "mat" | "extra".
  // НАДБАВКИ (просьба пользователя: «перед печатью заложить надбавки, чтобы отдать прорабу
  // процент… и заложить под будущую скидку»). Все четыре — проценты, живут на УСТРОЙСТВЕ
  // мастера (как наценка на материалы раньше), потому что это его способ считать, а не
  // свойство конкретной сметы. Надбавки меняют ЦЕНУ ПОЗИЦИИ в бланке (10 ₽ → 11 ₽ при
  // 10 %), а не добавляют строку: заказчику видна обычная цена, а не «сколько сверху».
  // Скидка, наоборот, показывается отдельной строкой — её как раз и предъявляют.
  const MK = {
    mat: "ep_est_matmarkup_v29",          // ключ НЕ менялся — у мастеров уже сохранён процент
    work: "ep_est_workmarkup_v29",
    pad: "ep_est_pad_v29",
    discount: "ep_est_discount_v29"
  };
  let printScope = "all";
  // добавление позиции прямо в основную смету (просьба пользователя): showAdd —
  // раскрыта ли форма, addType — работа/материал (по умолчанию по текущей вкладке)
  let showAdd = false, addType = "work";
  const rdPct = (k) => { try { return Math.max(0, Number(localStorage.getItem(k)) || 0); } catch (e) { return 0; } };
  let mk = { mat: rdPct(MK.mat), work: rdPct(MK.work), pad: rdPct(MK.pad), discount: rdPct(MK.discount) };
  function setMarkup(field, v) {
    if (!MK[field]) return;
    mk[field] = Math.max(0, Number(v) || 0);
    try { localStorage.setItem(MK[field], String(mk[field])); } catch (e) {}
  }
  // читает архив снимков при сохранении — единственный внешний потребитель
  function markups() { return { work: mk.work, mat: mk.mat, pad: mk.pad, discount: mk.discount }; }
  /* Вернуть проценты из снимка (архив, «↧ В текущую смету»). Просьба пользователя:
     «главное, чтобы когда смету открываем, были сохранены параметры процентов» — сами по
     себе поля переживают перезагрузку (они в localStorage), но открытие СОХРАНЁННОЙ сметы
     обязано вернуть ЕЁ проценты, иначе печать той же сметы дала бы другие цены. Пишем
     через тот же setMarkup — один путь записи, второй копии хранения нет. */
  function setMarkups(o) {
    if (!o) return markups();
    ["work", "mat", "pad", "discount"].forEach((k) => {
      if (o[k] != null) setMarkup(k, o[k]);
    });
    return markups();
  }
  // о = что уходит в печатный бланк (имена полей — его контракт)
  function prnMk() { return { workMarkup: mk.work, markup: mk.mat, pad: mk.pad, discount: mk.discount }; }
  // номер сметы — ТОТ ЖЕ счётчик, что у «Документов» (ep_smeta_no_v29), чтобы номер
  // документа не расходился между экранами
  function prnNo() { const P = window.EP && window.EP.EstimatePrint; return P ? P.docNo() : "1"; }

  // агрегированные строки по типу (суммирование одинаковых по имени+единице)
  function rows(type) {
    const d = Draft(); const items = d ? d.getItems() : [];
    const m = new Map();
    items.filter(x => x.type === type).forEach(x => {
      const key = String(x.name || "").toLowerCase().trim() + "|" + (x.unit || "");
      const e = m.get(key);
      if (e) { e.qty += Number(x.qty) || 0; if (!e.price && Number(x.price)) e.price = Number(x.price); if (x.extra) e.extra = true; }
      // type в агрегированной строке ОБЯЗАТЕЛЕН: её читают не только вкладки, но и
      // EP.EstimateWorks (разнос по этапам фильтрует именно по type) — без него смета
      // по работам молча получала пустой список
      else m.set(key, { type, name: x.name, unit: x.unit || "", price: Number(x.price) || 0, qty: Number(x.qty) || 0, extra: !!x.extra });
    });
    return [...m.values()].filter(x => x.qty > 0).sort((a, b) => String(a.name).localeCompare(String(b.name), "ru"));
  }
  function total(rs) { return rs.reduce((s, x) => s + x.price * x.qty, 0); }

  // Обязательные позиции (связки «триггер → спутники») и журнал изменений сметы —
  // свои модули: экран только вставляет их готовую разметку и не знает про их данные.
  function REQ() { return window.EP && window.EP.EstimateRequired; }
  function CHG() { return window.EP && window.EP.EstimateChanges; }
  function ARC() { return window.EP && window.EP.EstimateArchive; }

  function render() {
    const root = document.getElementById("ep-estimate-root");
    if (!root) return;
    const R = REQ();
    // редактор связок открывается ПОВЕРХ экрана сметы (как под-вид шторок плана)
    if (R && R.rulesOpen && R.rulesOpen()) { root.innerHTML = R.rulesHtml(); return; }
    const isSupply = tab === "supply";
    const rs = rows(isSupply ? "material" : "work");
    const tot = total(rs);
    const delBtn = (x) => `<button type="button" class="ep-sup-del ep-clickable" data-est-del data-del-type="${isSupply ? "material" : "work"}" data-del-name="${esc(x.name)}" data-del-unit="${esc(x.unit)}" aria-label="Удалить позицию">✕</button>`;
    // «доп.» — позиция уедет в ОТДЕЛЬНЫЙ акт дополнительных работ, а не в основную смету
    const extBtn = (x) => `<button type="button" class="ep-sup-ext ep-clickable ${x.extra ? "on" : ""}" data-est-extra data-ext-type="${isSupply ? "material" : "work"}" data-ext-name="${esc(x.name)}" data-ext-unit="${esc(x.unit)}" data-ext-on="${x.extra ? "0" : "1"}" aria-label="${x.extra ? "Убрать из доп. работ" : "В доп. работы"}" title="${x.extra ? "Убрать из доп. работ" : "Отнести к доп. работам (отдельный акт)"}">доп.</button>`;
    const list = rs.length ? rs.map((x, i) => isSupply ? `
      <div class="ep-sup-row supply">
        <div class="ep-sup-n">${i + 1}. ${esc(x.name)}</div>
        <div class="ep-sup-q">${x.qty}${x.unit ? " " + esc(x.unit) : ""}</div>
        ${extBtn(x)}${delBtn(x)}
      </div>` : `
      <div class="ep-sup-row">
        <div class="ep-sup-n">${i + 1}. ${esc(x.name)}</div>
        <div class="ep-sup-q">${x.qty}${x.unit ? " " + esc(x.unit) : ""}</div>
        <div class="ep-sup-p">${x.price ? money(x.price) : "—"}</div>
        <div class="ep-sup-s">${money(x.price * x.qty)}</div>
        ${extBtn(x)}${delBtn(x)}
      </div>`).join("") :
      `<div class="ep-db-empty">Пока пусто. Добавь позиции через щит, пул или «Материалы/Работа» — кнопкой «В смету», или прямо здесь кнопкой «➕ Добавить позицию».</div>`;
    root.innerHTML = `
      <div class="ep-est-tabs">
        <button type="button" class="ep-est-tab ${!isSupply ? "on" : ""}" data-esttab="works">Смета работ</button>
        <button type="button" class="ep-est-tab ${isSupply ? "on" : ""}" data-esttab="supply">Поставщику</button>
      </div>
      <div class="ep-sup">
        <div class="ep-sup-head">
          <div class="ep-sup-title">${isSupply ? "Материалы для закупки" : "Работы для заказчика"}</div>
          <div class="ep-sup-sub">${rs.length} позиц.${(!isSupply && rs.length) ? " · итого <b>" + money(tot) + "</b>" : ""}</div>
        </div>
        ${isSupply || !R || !R.bannerHtml ? "" : R.bannerHtml()}
        <div class="ep-sup-list">${list}</div>
        ${(!isSupply && rs.length) ? `<div class="ep-sup-total">Итого: <b>${money(tot)}</b></div>` : ""}
        ${isSupply ? "" : stagesBlock(rs)}
        ${isSupply || !R || !R.blockHtml ? "" : R.blockHtml()}
        ${isSupply || !CHG() || !CHG().blockHtml ? "" : CHG().blockHtml()}
        ${isSupply || !ARC() || !ARC().blockHtml ? "" : ARC().blockHtml()}
        <div class="ep-est-additem">${showAdd ? addForm(isSupply) : `<button type="button" class="btn btn-ghost ep-clickable" data-est-add>➕ Добавить позицию</button>`}</div>
        ${printBlock()}
        <div class="ep-sup-actions">
          <button type="button" class="btn btn-ghost ep-clickable" data-est-share>Поделиться</button>
          <button type="button" class="btn btn-ghost ep-clickable" data-est-export>⤓ Экспорт</button>
          <button type="button" class="btn btn-ghost ep-clickable" data-est-import>⤒ Импорт</button>
          ${isSupply ? '<button type="button" class="btn btn-ghost ep-clickable" data-route="consumables">+ Расходники</button>' : ""}
          ${isSupply ? '<button type="button" class="btn btn-ghost ep-clickable" data-est-usestock>📤 Задействовать со склада</button>' : ""}
          <button type="button" class="btn btn-ghost ep-clickable" data-route="main">На главный</button>
        </div>
      </div>`;
  }

  /* Блок «Этапы и сроки» на вкладке работ. Ничего заново не считает — раскладывает уже
     посчитанные позиции по этапам (EP.EstimateWorks) и показывает трудозатраты и срок.
     Свёрнут по умолчанию: на экране главное — список и сумма, а это справка под ним. */
  let stagesOpen = false;
  function EW() { return window.EP && window.EP.EstimateWorks; }
  function stagesBlock(works) {
    const W = EW();
    if (!W || !works.length) return "";
    const br = W.breakdown(works, { extra: "skip" });
    if (!br.stages.length) return "";
    const head = `<button type="button" class="ep-est-stghead ep-clickable" data-est-stages>
        <span>${stagesOpen ? "▾" : "▸"} 🕒 Этапы и сроки</span>
        <b>${num0(br.hours)} чел.-ч · ${num0(br.days)} дн.</b></button>`;
    if (!stagesOpen) return `<div class="ep-est-stages">${head}</div>`;
    const rowsHtml = br.stages.map((s, i) => `
      <div class="ep-est-stg">
        <div class="ep-est-stgtitle"><b>Этап ${i + 1}. ${esc(s.name)}</b><span>${num0(s.hours)} ч · ${num0(s.days)} дн. · ${money(s.sum)}</span></div>
        ${s.items.map((x) => `<div class="ep-est-stgrow"><span>${esc(x.name)}</span><i>${num0(x.qty)}${x.unit ? " " + esc(x.unit) : ""} · ${num0(x.hours)} ч</i></div>`).join("")}
      </div>`).join("");
    // РЕЖИМ ДНЯ интервалами («с 10 до 13 и с 15 до 18»), а не одним числом часов: у
    // бригады обед, и такой день это 6 рабочих часов, а не 8. Число часов в дне здесь
    // не поле ввода, а ИТОГ интервалов — разойтись «во сколько работаем» и «сколько
    // часов» физически не может.
    const ivs = br.crew.shift.map((iv, i) => `
        <div class="ep-est-iv">
          <input type="time" value="${esc(iv.from)}" data-est-shift-from="${i}" aria-label="Начало заход ${i + 1}">
          <span>–</span>
          <input type="time" value="${esc(iv.to)}" data-est-shift-to="${i}" aria-label="Конец заход ${i + 1}">
          ${br.crew.shift.length > 1 ? `<button type="button" class="ep-est-ivdel ep-clickable" data-est-shift-del="${i}" aria-label="Убрать заход">✕</button>` : ""}
        </div>`).join("");
    const canAdd = br.crew.shift.length < (W.SHIFT_MAX || 4);
    return `<div class="ep-est-stages">${head}
      <div class="ep-est-crew">
        <label>Бригада, чел.<input type="number" inputmode="numeric" min="1" max="20" step="1" value="${esc(String(br.crew.people))}" data-est-crew></label>
        <div class="ep-est-shift">
          <span class="ep-est-shlbl">Часы работы <b data-est-shifth>${num0(br.hoursPerDay)} ч/день</b></span>
          ${ivs}
          ${canAdd ? '<button type="button" class="btn btn-ghost ep-clickable ep-est-ivadd" data-est-shift-add>＋ ещё заход</button>' : ""}
        </div>
      </div>
      ${rowsHtml}
      <div class="ep-est-stgtot">Трудозатраты <b>${num0(br.hours)} чел.-ч</b> · срок при ${br.crew.people} чел. и ${num0(br.hoursPerDay)} ч/день — <b>${num0(br.days)} раб. дн.</b></div>
      <div class="ep-est-stgnote">Рабочий день ${esc(br.shiftText)} — ${num0(br.hoursPerDay)} ч.
        Срок расчётный, по нормам выработки: фактический зависит от материала стен и готовности объекта.
        Дни по этапам считаются каждый со своим округлением вверх, поэтому их сумма может быть больше общего срока.
        Позиции, помеченные «доп.», в срок не входят — они идут отдельным актом.</div>
    </div>`;
  }
  const num0 = (v) => { const n = Number(v) || 0; return (Math.round(n * 10) / 10).toString().replace(".", ","); };

  /* Численность бригады ПЕРЕД печатью (просьба пользователя «надо указывать сколько человек
     на объекте»): само поле остаётся одно — в блоке «Этапы и сроки», здесь только видно,
     что уйдёт в документ, и кнопка, которая РАСКРЫВАЕТ тот блок (не второе поле ввода:
     два места записи одного значения рано или поздно разъезжаются). Строки нет, когда
     печатаются только материалы — бригада в том листе не указывается. */
  function crewHintHtml() {
    const W = EW();
    if (!W || printScope === "mat" || !rows("work").length) return "";
    const c = W.getCrew(), h = W.crewHours ? W.crewHours(c) : c.hoursPerDay;
    const sh = W.shiftText ? W.shiftText(c.shift) : "";
    return `<div class="ep-est-crewhint">👷 На объекте: <b>${num0(c.people)} чел.</b>${h ? " · " + num0(h) + " ч/день" : ""}${sh ? " · " + esc(sh) : ""}
      <button type="button" class="ep-clickable" data-est-crewedit>изменить</button></div>`;
  }

  // Блок печати: номер сметы, выбор что печатать (смета целиком / только работы /
  // только материалы) и наценка на материалы (%), плюс отдельная кнопка «Заявка
  // поставщику» (материалы без цен). Наценка показывается, только когда в печать
  // попадают материалы (scope ≠ work).
  const SCOPES = [["all", "Смета целиком"], ["work", "Работы"], ["stages", "По этапам"], ["mat", "Материалы"], ["extra", "Доп. работы"]];
  function printBlock() {
    const printLabel = printScope === "work" ? "🖨 Печать работ"
      : printScope === "stages" ? "🖨 Печать сметы по работам"
      : printScope === "mat" ? "🖨 Печать материалов"
      : printScope === "extra" ? "🖨 Печать акта доп. работ" : "🖨 Печать сметы";
    // сводка перед выгрузкой: чего из обязательного не хватает. НЕ блокирует печать —
    // это предупреждение, а не запрет (решает мастер, а не программа)
    const R = REQ();
    const warn = R && R.warnHtml ? R.warnHtml() : "";
    return `<div class="ep-est-print">
        ${warn}
        <label class="ep-est-no">Смета №<input type="text" inputmode="numeric" maxlength="12" value="${esc(prnNo())}" data-est-no></label>
        <div class="ep-est-scope"><span class="ep-est-lbl">Печатать:</span>
          ${SCOPES.map(([v, l]) => `<button type="button" class="ep-est-chip ep-clickable ${printScope === v ? "on" : ""}" data-est-scope="${v}">${l}</button>`).join("")}
        </div>
        <div class="ep-est-mkgrid">
          ${(printScope !== "work" && printScope !== "stages") ? `<label>Наценка на материалы, %<input type="number" inputmode="decimal" min="0" step="1" value="${esc(String(mk.mat))}" data-est-mk="mat"></label>` : ""}
          ${printScope !== "mat" ? `<label>Прорабу (на работы), %<input type="number" inputmode="decimal" min="0" step="1" value="${esc(String(mk.work))}" data-est-mk="work"></label>` : ""}
          <label>Резерв под скидку, %<input type="number" inputmode="decimal" min="0" step="1" value="${esc(String(mk.pad))}" data-est-mk="pad"></label>
          <label>Скидка, %<input type="number" inputmode="decimal" min="0" step="1" value="${esc(String(mk.discount))}" data-est-mk="discount"></label>
        </div>
        <div class="ep-est-mkhint">Надбавки входят в цену позиции и в документе отдельной строкой не видны. Скидка — видна.</div>
        ${crewHintHtml()}
        <div class="ep-est-prow">
          <button type="button" class="btn btn-primary ep-clickable" data-est-print>${printLabel}</button>
          <button type="button" class="btn btn-ghost ep-clickable" data-est-supply>Заявка поставщику (без цен)</button>
        </div>
      </div>`;
  }

  // Форма добавления позиции прямо в основную смету. Тип по умолчанию — по текущей
  // вкладке (работы → «Работа», Поставщику → «Материал»), но можно переключить.
  function addForm() {
    return `<div class="ep-est-addform">
        <div class="ep-est-scope"><span class="ep-est-lbl">Тип:</span>
          <button type="button" class="ep-est-chip ep-clickable ${addType === "work" ? "on" : ""}" data-eaf-type="work">Работа</button>
          <button type="button" class="ep-est-chip ep-clickable ${addType === "material" ? "on" : ""}" data-eaf-type="material">Материал</button>
        </div>
        <input id="ep-eaf-name" type="text" placeholder="Наименование" autocomplete="off">
        <div class="ep-est-af2">
          <input id="ep-eaf-qty" type="number" inputmode="decimal" min="0" step="any" placeholder="Кол-во" value="1">
          <input id="ep-eaf-unit" type="text" placeholder="ед." value="шт" maxlength="12">
          <input id="ep-eaf-price" type="number" inputmode="decimal" min="0" step="any" placeholder="Цена ₽">
        </div>
        <div class="ep-est-prow">
          <button type="button" class="btn btn-primary ep-clickable" data-est-addsave>Добавить</button>
          <button type="button" class="btn btn-ghost ep-clickable" data-est-addcancel>Отмена</button>
        </div>
      </div>`;
  }
  function addSave() {
    const d = Draft(); if (!d || !d.addItem) return flash("Добавление недоступно");
    const val = (id) => { const el = document.getElementById(id); return el ? el.value : ""; };
    const name = String(val("ep-eaf-name") || "").trim();
    if (!name) return flash("Впиши наименование позиции");
    const numv = (s) => { const n = parseFloat(String(s).replace(",", ".")); return isFinite(n) ? n : 0; };
    const qty = numv(val("ep-eaf-qty")) || 1;
    const unit = String(val("ep-eaf-unit") || "шт").trim() || "шт";
    const price = numv(val("ep-eaf-price"));
    d.addItem({ type: addType, name, unit, qty, price, source: "manual" });
    showAdd = false;
    render();
    flash("Позиция добавлена");
  }
  // Удалить позицию из основной сметы. Строки на экране агрегированы (одинаковые
  // тип+имя+единица сложены), поэтому удаляем ВСЕ позиции с этим ключом — как их и
  // видит пользователь одной строкой.
  function removeRow(type, name, unit) {
    const d = Draft(); if (!d || !d.getItems) return;
    const key = String(name || "").toLowerCase().trim() + "|" + String(unit || "");
    const kill = d.getItems().filter((x) => x.type === type && (String(x.name || "").toLowerCase().trim() + "|" + String(x.unit || "")) === key);
    kill.forEach((x) => d.removeItem(x.id));
    render();
  }

  // Печать — ЕДИНЫЙ печатный бланк (EP.EstimatePrint). Что печатать выбирает scope:
  // «all» — смета целиком (работы + материалы), «work» — только работы, «mat» — только
  // материалы. К материалам применяется наценка matMarkup (%). Отдельная кнопка «Заявка
  // поставщику» печатает материалы БЕЗ цен (supplyHtml). heading подставляется в заголовок
  // листа, чтобы «Печать работ» дала документ «Смета работ», а не «Смета».
  function PRN() { return window.EP && window.EP.EstimatePrint; }
  function printDoc() {
    const P = PRN();
    if (!P) return flash("Печать недоступна");
    const works = rows("work"), mats = rows("material");
    let html;
    const M = prnMk();
    if (printScope === "work") {
      if (!works.length) return flash("Работ нет — печатать нечего");
      html = P.estimateHtml(Object.assign({}, M, { works, mats: [], heading: "Смета работ" }));
    } else if (printScope === "stages") {
      // смета ПО РАБОТАМ: те же работы, но по этапам и с трудозатратами/сроком
      if (!works.length) return flash("Работ нет — печатать нечего");
      html = P.worksStagesHtml(Object.assign({}, M, { works, extraMode: "skip" }));
    } else if (printScope === "mat") {
      if (!mats.length) return flash("Материалов нет — печатать нечего");
      html = P.estimateHtml(Object.assign({}, M, { works: [], mats, heading: "Смета материалов" }));
    } else if (printScope === "extra") {
      // ОТДЕЛЬНЫЙ акт: только помеченные «доп.» — то, что выявилось на объекте и в
      // основной договор не входило. Основная смета при этом остаётся как была.
      const ew = works.filter((x) => x.extra), em = mats.filter((x) => x.extra);
      if (!ew.length && !em.length) return flash("Нет позиций, помеченных «доп.»");
      html = P.estimateHtml(Object.assign({}, M, { works: ew, mats: em, heading: "Дополнительные работы" }));
    } else {
      if (!works.length && !mats.length) return flash("Смета пуста — печатать нечего");
      html = P.estimateHtml(Object.assign({}, M, { works, mats, heading: "Смета" }));
    }
    if (!P.open(html)) flash("Разреши всплывающие окна, чтобы напечатать");
  }
  function supplyDoc() {
    const P = PRN();
    if (!P) return flash("Печать недоступна");
    const mats = rows("material");
    if (!mats.length) return flash("Материалов нет — заявка пустая");
    if (!P.open(P.supplyHtml({ mats }))) flash("Разреши всплывающие окна, чтобы напечатать");
  }

  function shareText() {
    const isSupply = tab === "supply";
    const rs = rows(isSupply ? "material" : "work");
    const tot = total(rs);
    const title = isSupply ? "Материалы (закупка)" : "Смета работ";
    const lines = rs.map((x, i) => isSupply
      ? `${i + 1}. ${x.name} — ${x.qty}${x.unit ? " " + x.unit : ""}`
      : `${i + 1}. ${x.name} — ${x.qty}${x.unit ? " " + x.unit : ""}` + (x.price ? ` x ${money(x.price)} = ${money(x.price * x.qty)}` : "")).join("\n");
    const text = title + "\n" + lines + (isSupply ? "" : "\n\nИтого: " + money(tot));
    try {
      if (navigator.share) { navigator.share({ title: title, text: text }).catch(() => {}); }
      else if (navigator.clipboard && navigator.clipboard.writeText) { navigator.clipboard.writeText(text).then(() => flash("Скопировано")).catch(() => flash("Не удалось скопировать")); }
      else flash("Поделиться недоступно");
    } catch (e) { flash("Поделиться недоступно"); }
  }

  // ── Экспорт / импорт сметы файлом ──────────────────────────
  // Формат, скачивание и чтение файла — ОБЩИЕ с предварительной сметой
  // (EP.EstimateFile), слияние — в EP.Estimate. Здесь только сценарий экрана.
  function FILE() { return window.EP && window.EP.EstimateFile; }
  function exportFile() {
    const d = Draft(), F = FILE();
    if (!d || !d.exportJSON || !F) return flash("Экспорт недоступен");
    if (!d.count || !d.count()) return flash("Смета пуста — экспортировать нечего");
    const stamp = F.stamp();
    const ok = F.download("smeta-" + stamp + ".json", d.exportJSON({ name: "Смета " + stamp }));
    flash(ok ? "Файл сметы сохранён" : "Не удалось сохранить файл");
  }
  function importFile() {
    const d = Draft(), F = FILE();
    if (!d || !d.importJSON || !F) return flash("Импорт недоступен");
    F.pickFile((text) => {
      if (text == null) return flash("Не удалось прочитать файл");
      const info = d.parseImport(text);
      if (!info) return flash("Не похоже на файл сметы");
      const has = d.count && d.count();
      // ОК — заменить смету целиком, Отмена — добавить к текущей (позиции сложатся)
      const replace = has ? confirm("В файле позиций: " + info.items.length +
        " (работ " + info.works + ", материалов " + info.materials + ").\n\n" +
        "ОК — заменить текущую смету.\nОтмена — добавить к текущей.") : false;
      const res = d.importJSON(text, replace ? "replace" : "add");
      if (!res) return flash("Не похоже на файл сметы");
      render();
      flash((replace ? "Смета заменена: " : "Добавлено позиций: ") + res.items.length);
    });
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
    const t = e.target;
    if (!t || !t.hasAttribute || !document.getElementById("ep-estimate-root")) return;
    if (t.hasAttribute("data-est-no")) { const P = window.EP && window.EP.EstimatePrint; if (P) P.setDocNo(t.value); }
    // наценку сохраняем на ввод, но НЕ перерисовываем экран (иначе сбился бы фокус поля)
    else if (t.hasAttribute("data-est-mk")) { setMarkup(t.getAttribute("data-est-mk"), t.value); }
    // бригада/часы работы: сохраняем и обновляем ТОЛЬКО итоговые строки — полный render()
    // сбил бы фокус поля прямо во время набора числа или времени
    else if (t.hasAttribute("data-est-crew") || t.hasAttribute("data-est-shift-from") || t.hasAttribute("data-est-shift-to")) {
      applyCrew();
    }
  });

  // читает бригаду и ВСЕ интервалы дня из полей, сохраняет и патчит итоговые строки
  function applyCrew() {
    const W = EW(); if (!W) return null;
    const c = document.querySelector("[data-est-crew]");
    const shift = [];
    document.querySelectorAll("[data-est-shift-from]").forEach((f) => {
      const i = f.getAttribute("data-est-shift-from");
      const to = document.querySelector(`[data-est-shift-to="${i}"]`);
      shift.push({ from: f.value, to: to ? to.value : "" });
    });
    const crew = W.setCrew(c && c.value, shift);
    const br = W.breakdown(rows("work"), { extra: "skip", crew });
    const tot = document.querySelector(".ep-est-stgtot");
    if (tot) tot.innerHTML = `Трудозатраты <b>${num0(br.hours)} чел.-ч</b> · срок при ${crew.people} чел. и ${num0(br.hoursPerDay)} ч/день — <b>${num0(br.days)} раб. дн.</b>`;
    const hd = document.querySelector("[data-est-stages] b");
    if (hd) hd.textContent = `${num0(br.hours)} чел.-ч · ${num0(br.days)} дн.`;
    const hh = document.querySelector("[data-est-shifth]");
    if (hh) hh.textContent = `${num0(br.hoursPerDay)} ч/день`;
    // строка «сколько человек на объекте» в блоке печати — тот же источник, её тоже
    // патчим здесь: иначе перед печатью показывалось бы старое число (поймано живым прогоном)
    const ch = document.querySelector(".ep-est-crewhint");
    if (ch) { const h = crewHintHtml(); if (h) ch.outerHTML = h; }
    // дни по этапам тоже зависят от режима дня — патчим их той же правкой
    document.querySelectorAll(".ep-est-stgtitle span").forEach((sp, i) => {
      const s = br.stages[i];
      if (s) sp.textContent = `${num0(s.hours)} ч · ${num0(s.days)} дн. · ${money(s.sum)}`;
    });
    return crew;
  }
  document.addEventListener("click", (e) => {
    const t = e.target; let el;
    if ((el = t.closest && t.closest("[data-esttab]"))) { tab = el.dataset.esttab === "supply" ? "supply" : "works"; render(); return; }
    if (document.getElementById("ep-estimate-root")) {
      if ((el = t.closest && t.closest("[data-est-scope]"))) { printScope = el.getAttribute("data-est-scope"); render(); return; }
      if (t.closest && t.closest("[data-est-stages]")) { stagesOpen = !stagesOpen; render(); return; }
      // «изменить» у строки бригады: ВСЕГДА раскрывает блок этапов (а не тоглит — иначе у
      // уже открытого блока кнопка его закрывала бы) и подводит к полям
      if (t.closest && t.closest("[data-est-crewedit]")) {
        stagesOpen = true; render();
        const c = document.querySelector("[data-est-crew]");
        if (c && c.scrollIntoView) { try { c.scrollIntoView({ block: "center" }); } catch (e) { c.scrollIntoView(); } }
        return;
      }
      // добавить/убрать заход дня: тут полный render() НУЖЕН — меняется набор полей,
      // патчем строк это не решается (в отличие от правки самого времени)
      if (t.closest && t.closest("[data-est-shift-add]")) {
        const W = EW(); if (!W) return;
        const crew = applyCrew() || W.getCrew();
        // новый заход — от конца предыдущего на два часа, но не за полночь (иначе
        // «до» оказалось бы раньше «с» и интервал молча отбросился бы)
        const last = crew.shift[crew.shift.length - 1];
        const from = last ? last.to : "09:00";
        const mins = Math.min(23 * 60 + 59, (Number(from.slice(0, 2)) || 0) * 60 + (Number(from.slice(3, 5)) || 0) + 120);
        const p2 = (n) => (n < 10 ? "0" : "") + n;
        const to = p2(Math.floor(mins / 60)) + ":" + p2(mins % 60);
        W.setCrew(crew.people, crew.shift.concat([{ from, to }]));
        render(); return;
      }
      if ((el = t.closest && t.closest("[data-est-shift-del]"))) {
        const W = EW(); if (!W) return;
        const i = Number(el.getAttribute("data-est-shift-del"));
        const crew = applyCrew() || W.getCrew();
        W.setCrew(crew.people, crew.shift.filter((x, k) => k !== i));
        render(); return;
      }
      // добавление позиции в основную смету
      if (t.closest && t.closest("[data-est-add]")) { showAdd = true; addType = tab === "supply" ? "material" : "work"; render(); return; }
      if ((el = t.closest && t.closest("[data-eaf-type]"))) {
        // переключаем тип БЕЗ полного render() — иначе стёрлись бы уже введённые поля
        addType = el.getAttribute("data-eaf-type");
        document.querySelectorAll("[data-eaf-type]").forEach((b) => b.classList.toggle("on", b.getAttribute("data-eaf-type") === addType));
        return;
      }
      if (t.closest && t.closest("[data-est-addsave]")) { addSave(); return; }
      if (t.closest && t.closest("[data-est-addcancel]")) { showAdd = false; render(); return; }
      if ((el = t.closest && t.closest("[data-est-extra]"))) {
        const M = window.EP && window.EP.Estimate;
        if (M && M.setExtra) {
          M.setExtra(el.getAttribute("data-ext-type"), el.getAttribute("data-ext-name"),
            el.getAttribute("data-ext-unit"), el.getAttribute("data-ext-on") === "1");
        }
        render(); return;
      }
      if ((el = t.closest && t.closest("[data-est-del]"))) {
        if (!confirm("Удалить позицию из сметы?")) return;
        removeRow(el.getAttribute("data-del-type"), el.getAttribute("data-del-name"), el.getAttribute("data-del-unit"));
        return;
      }
      if (t.closest && t.closest("[data-est-print]")) { printDoc(); return; }
      if (t.closest && t.closest("[data-est-supply]")) { supplyDoc(); return; }
      if (t.closest && t.closest("[data-est-share]")) { shareText(); return; }
      if (t.closest && t.closest("[data-est-export]")) { exportFile(); return; }
      if (t.closest && t.closest("[data-est-import]")) { importFile(); return; }
      if (t.closest && t.closest("[data-est-usestock]")) { if (window.EP && EP.Stock && EP.Stock.useFromSupply) EP.Stock.useFromSupply(); return; }
    }
  });

  window.addEventListener("ep:route-loaded", (e) => {
    const route = e && e.detail && e.detail.route;
    if (route === "estimate" || route === "details") {
      const root = document.getElementById("ep-estimate-root");
      const def = root && root.getAttribute("data-est-default");
      if (def === "supply") tab = "supply"; else if (def === "works") tab = "works";
      render();
    }
  });
  window.addEventListener("ep:estimate-main-changed", () => { if (document.getElementById("ep-estimate-root")) render(); });

  // Экран сметы отдаёт наружу перерисовку и тост: модули обязательных позиций и журнала
  // изменений вставляют сюда свою разметку и после правки просят перерисовать экран.
  window.EP = window.EP || {};
  // markups()/setMarkups() читает и возвращает архив снимков: надбавки — состояние ЭТОГО
  // экрана, и второй копии их хранения быть не должно.
  window.EP.EstimateTabs = { render, flash, markups, setMarkups };
})();
