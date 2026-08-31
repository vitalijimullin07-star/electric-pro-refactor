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
  // Печать — что печатать (scope) и наценка на материалы (%). Просьба пользователя:
  // «печатать как материалы так и работы, и на материалы перед печатью задавать процент».
  // scope: "all" (смета целиком) | "work" (только работы) | "mat" (только материалы).
  // Наценка применяется к цене материалов в самом бланке (EstimatePrint) — сессионно,
  // но сохраняется в localStorage, чтобы не вводить её заново при каждом заходе.
  const MK_KEY = "ep_est_matmarkup_v29";
  let printScope = "all";
  // добавление позиции прямо в основную смету (просьба пользователя): showAdd —
  // раскрыта ли форма, addType — работа/материал (по умолчанию по текущей вкладке)
  let showAdd = false, addType = "work";
  let matMarkup = (() => { try { return Number(localStorage.getItem(MK_KEY)) || 0; } catch (e) { return 0; } })();
  function setMarkup(v) { matMarkup = Math.max(0, Number(v) || 0); try { localStorage.setItem(MK_KEY, String(matMarkup)); } catch (e) {} }
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

  function render() {
    const root = document.getElementById("ep-estimate-root");
    if (!root) return;
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
        <div class="ep-sup-list">${list}</div>
        ${(!isSupply && rs.length) ? `<div class="ep-sup-total">Итого: <b>${money(tot)}</b></div>` : ""}
        ${isSupply ? "" : stagesBlock(rs)}
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
        <div class="ep-est-stgtitle"><b>Этап ${i + 1}. ${esc(s.name)}</b><span>${num0(s.hours)} ч · ${money(s.sum)}</span></div>
        ${s.items.map((x) => `<div class="ep-est-stgrow"><span>${esc(x.name)}</span><i>${num0(x.qty)}${x.unit ? " " + esc(x.unit) : ""} · ${num0(x.hours)} ч</i></div>`).join("")}
      </div>`).join("");
    return `<div class="ep-est-stages">${head}
      <div class="ep-est-crew">
        <label>Бригада, чел.<input type="number" inputmode="numeric" min="1" max="20" step="1" value="${esc(String(br.crew.people))}" data-est-crew></label>
        <label>Смена, ч<input type="number" inputmode="decimal" min="1" max="24" step="1" value="${esc(String(br.crew.hoursPerDay))}" data-est-shift></label>
      </div>
      ${rowsHtml}
      <div class="ep-est-stgtot">Трудозатраты <b>${num0(br.hours)} чел.-ч</b> · срок при ${br.crew.people} чел. — <b>${num0(br.days)} раб. дн.</b></div>
      <div class="ep-est-stgnote">Срок расчётный, по нормам выработки: фактический зависит от материала стен и готовности объекта.
        Позиции, помеченные «доп.», в срок не входят — они идут отдельным актом.</div>
    </div>`;
  }
  const num0 = (v) => { const n = Number(v) || 0; return (Math.round(n * 10) / 10).toString().replace(".", ","); };

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
    return `<div class="ep-est-print">
        <label class="ep-est-no">Смета №<input type="text" inputmode="numeric" maxlength="12" value="${esc(prnNo())}" data-est-no></label>
        <div class="ep-est-scope"><span class="ep-est-lbl">Печатать:</span>
          ${SCOPES.map(([v, l]) => `<button type="button" class="ep-est-chip ep-clickable ${printScope === v ? "on" : ""}" data-est-scope="${v}">${l}</button>`).join("")}
        </div>
        ${(printScope !== "work" && printScope !== "stages") ? `<label class="ep-est-markup">Наценка на материалы, %<input type="number" inputmode="decimal" min="0" step="1" value="${esc(String(matMarkup))}" data-est-markup></label>` : ""}
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
    if (printScope === "work") {
      if (!works.length) return flash("Работ нет — печатать нечего");
      html = P.estimateHtml({ works, mats: [], heading: "Смета работ" });
    } else if (printScope === "stages") {
      // смета ПО РАБОТАМ: те же работы, но по этапам и с трудозатратами/сроком
      if (!works.length) return flash("Работ нет — печатать нечего");
      html = P.worksStagesHtml({ works, extraMode: "skip" });
    } else if (printScope === "mat") {
      if (!mats.length) return flash("Материалов нет — печатать нечего");
      html = P.estimateHtml({ works: [], mats, markup: matMarkup, heading: "Смета материалов" });
    } else if (printScope === "extra") {
      // ОТДЕЛЬНЫЙ акт: только помеченные «доп.» — то, что выявилось на объекте и в
      // основной договор не входило. Основная смета при этом остаётся как была.
      const ew = works.filter((x) => x.extra), em = mats.filter((x) => x.extra);
      if (!ew.length && !em.length) return flash("Нет позиций, помеченных «доп.»");
      html = P.estimateHtml({ works: ew, mats: em, markup: matMarkup, heading: "Дополнительные работы" });
    } else {
      if (!works.length && !mats.length) return flash("Смета пуста — печатать нечего");
      html = P.estimateHtml({ works, mats, markup: matMarkup, heading: "Смета" });
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
    else if (t.hasAttribute("data-est-markup")) { setMarkup(t.value); }
    // бригада/смена: сохраняем и обновляем ТОЛЬКО итоговую строку — полный render()
    // сбил бы фокус поля прямо во время набора числа
    else if (t.hasAttribute("data-est-crew") || t.hasAttribute("data-est-shift")) {
      const W = EW(); if (!W) return;
      const c = document.querySelector("[data-est-crew]"), h = document.querySelector("[data-est-shift]");
      const crew = W.setCrew(c && c.value, h && h.value);
      const br = W.breakdown(rows("work"), { extra: "skip", crew });
      const tot = document.querySelector(".ep-est-stgtot");
      if (tot) tot.innerHTML = `Трудозатраты <b>${num0(br.hours)} чел.-ч</b> · срок при ${crew.people} чел. — <b>${num0(br.days)} раб. дн.</b>`;
      const hd = document.querySelector("[data-est-stages] b");
      if (hd) hd.textContent = `${num0(br.hours)} чел.-ч · ${num0(br.days)} дн.`;
    }
  });
  document.addEventListener("click", (e) => {
    const t = e.target; let el;
    if ((el = t.closest && t.closest("[data-esttab]"))) { tab = el.dataset.esttab === "supply" ? "supply" : "works"; render(); return; }
    if (document.getElementById("ep-estimate-root")) {
      if ((el = t.closest && t.closest("[data-est-scope]"))) { printScope = el.getAttribute("data-est-scope"); render(); return; }
      if (t.closest && t.closest("[data-est-stages]")) { stagesOpen = !stagesOpen; render(); return; }
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
})();
