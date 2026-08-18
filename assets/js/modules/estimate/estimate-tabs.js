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
      if (e) { e.qty += Number(x.qty) || 0; if (!e.price && Number(x.price)) e.price = Number(x.price); }
      else m.set(key, { name: x.name, unit: x.unit || "", price: Number(x.price) || 0, qty: Number(x.qty) || 0 });
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
    const list = rs.length ? rs.map((x, i) => isSupply ? `
      <div class="ep-sup-row supply">
        <div class="ep-sup-n">${i + 1}. ${esc(x.name)}</div>
        <div class="ep-sup-q">${x.qty}${x.unit ? " " + esc(x.unit) : ""}</div>
      </div>` : `
      <div class="ep-sup-row">
        <div class="ep-sup-n">${i + 1}. ${esc(x.name)}</div>
        <div class="ep-sup-q">${x.qty}${x.unit ? " " + esc(x.unit) : ""}</div>
        <div class="ep-sup-p">${x.price ? money(x.price) : "—"}</div>
        <div class="ep-sup-s">${money(x.price * x.qty)}</div>
      </div>`).join("") :
      `<div class="ep-db-empty">Пока пусто. Добавь позиции через щит, пул или «Материалы/Работа» — кнопкой «В смету», и они появятся здесь.</div>`;
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
        <div class="ep-sup-actions">
          ${!isSupply ? `<label class="ep-est-no">Смета №<input type="text" inputmode="numeric" maxlength="12" value="${esc(prnNo())}" data-est-no></label>` : ""}
          <button type="button" class="btn btn-primary ep-clickable" data-est-print>${isSupply ? "Печать заявки" : "Печать сметы"}</button>
          <button type="button" class="btn btn-ghost ep-clickable" data-est-share>Поделиться</button>
          <button type="button" class="btn btn-ghost ep-clickable" data-est-export>⤓ Экспорт</button>
          <button type="button" class="btn btn-ghost ep-clickable" data-est-import>⤒ Импорт</button>
          ${isSupply ? '<button type="button" class="btn btn-ghost ep-clickable" data-route="consumables">+ Расходники</button>' : ""}
          ${isSupply ? '<button type="button" class="btn btn-ghost ep-clickable" data-est-usestock>📤 Задействовать со склада</button>' : ""}
          <button type="button" class="btn btn-ghost ep-clickable" data-route="main">На главный</button>
        </div>
      </div>`;
  }

  // Печать — ЕДИНЫЙ печатный бланк (EP.EstimatePrint): смета работ печатается полным
  // документом (шапка с реквизитами, разделы «Работы»/«Материалы», подытоги, сумма
  // прописью, отметка по НДС, подписи), вкладка «Поставщику» — заявкой на материалы
  // (без цен: их заполняет поставщик). Раньше здесь была своя голая таблица без шапки.
  function PRN() { return window.EP && window.EP.EstimatePrint; }
  function printDoc() {
    const P = PRN();
    if (!P) return flash("Печать недоступна");
    const works = rows("work"), mats = rows("material");
    if (!works.length && !mats.length) return flash("Смета пуста — печатать нечего");
    const html = tab === "supply" ? P.supplyHtml({ mats }) : P.estimateHtml({ works, mats });
    if (!P.open(html)) flash("Разреши всплывающие окна, чтобы напечатать");
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
  });
  document.addEventListener("click", (e) => {
    const t = e.target; let el;
    if ((el = t.closest && t.closest("[data-esttab]"))) { tab = el.dataset.esttab === "supply" ? "supply" : "works"; render(); return; }
    if (document.getElementById("ep-estimate-root")) {
      if (t.closest && t.closest("[data-est-print]")) { printDoc(); return; }
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
