/* Electric Pro V29 — встроенный «чат» замечаний (журнал багов).

   Просьба пользователя: «добавь пожалуйста внутрь кнопку (чат) — я прям там косяки
   буду писать, или те кто тестит, а после копировать и присылать тебе».

   Это НЕ переписка с сервером: записи лежат ЛОКАЛЬНО (localStorage устройства), а
   кнопка «📋 Скопировать всё» отдаёт весь журнал одним текстом в буфер — его
   пересылают разработчику любым мессенджером. Так тестировщику не нужен ни аккаунт,
   ни интернет в момент, когда он поймал баг.

   К каждой записи АВТОМАТИЧЕСКИ подшивается контекст (экран, проект, версия сборки,
   устройство, размер экрана) — по опыту сессии именно его всегда приходится
   выспрашивать отдельно, а без него репорт часто невоспроизводим. */
(() => {
  "use strict";
  window.EP = window.EP || {};

  const KEY = "ep_feedback_v1";
  const MAX = 300; // журнал устройства, не архив: старые записи вытесняются
  const esc = (s) => String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  function read() {
    try { const v = JSON.parse(localStorage.getItem(KEY) || "[]"); return Array.isArray(v) ? v : []; } catch (e) { return []; }
  }
  function write(list) {
    try { localStorage.setItem(KEY, JSON.stringify(list.slice(-MAX))); return true; } catch (e) { return false; }
  }
  // версия сборки = кэш-бастинг ?v=NNNN из подключённых скриптов (его ставит CI,
  // см. scripts/bump-cache-version.js) — по нему сразу видно, на какой версии баг
  function build() {
    try {
      const m = String(document.documentElement.outerHTML).match(/[?&]v=(\d+)/);
      return m ? m[1] : "—";
    } catch (e) { return "—"; }
  }
  function ctx() {
    const st = window.EP && EP.state ? EP.state : {};
    let proj = "";
    try { const p = EP.Plan && EP.Plan.Core && EP.Plan.Core.project; if (p) proj = p.name || ""; } catch (e) {}
    return {
      route: st.currentRoute || location.hash || "—",
      project: proj,
      build: build(),
      screen: (window.innerWidth || 0) + "×" + (window.innerHeight || 0),
      ua: (navigator.userAgent || "").slice(0, 120)
    };
  }
  function add(text) {
    const t = String(text || "").trim();
    if (!t) return null;
    const list = read();
    const rec = Object.assign({ at: Date.now(), text: t }, ctx());
    list.push(rec);
    write(list);
    return rec;
  }
  const fmtDate = (ms) => { try { return new Date(ms).toLocaleString("ru-RU", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" }); } catch (e) { return String(ms); } };
  // текст для отправки: сначала общая шапка (устройство/версия), потом записи по одной
  function asText() {
    const list = read();
    if (!list.length) return "";
    const last = list[list.length - 1];
    const head = `Electric Pro — замечания (${list.length} шт.)\nСборка: ${last.build} · Экран: ${last.screen}\n${last.ua}\n`;
    return head + list.map((r, i) =>
      `\n#${i + 1} ${fmtDate(r.at)} · ${r.route}${r.project ? " · проект «" + r.project + "»" : ""}\n${r.text}`
    ).join("\n");
  }
  async function copyAll() {
    const txt = asText();
    if (!txt) return false;
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) { await navigator.clipboard.writeText(txt); return true; }
    } catch (e) { /* нет доступа к буферу (не-HTTPS, старый WebView) — фолбэк ниже */ }
    try {
      // фолбэк для старых WebView: временная textarea + execCommand («Скопировать логи»
      // в logger.js работает так же; глобальный user-select:none её не касается —
      // поля ввода в белом списке, см. base.css)
      const ta = document.createElement("textarea");
      ta.value = txt; ta.style.cssText = "position:fixed;left:-2000px;top:0";
      document.body.appendChild(ta); ta.focus(); ta.select();
      const ok = document.execCommand("copy");
      ta.remove();
      return ok;
    } catch (e) { return false; }
  }

  // ---------- UI: свой оверлей (работает на ЛЮБОМ экране, не только в плане) ----------
  function ovEl() { return document.getElementById("ep-fb-ov"); }
  function render() {
    let ov = ovEl();
    if (!ov) { ov = document.createElement("div"); ov.id = "ep-fb-ov"; ov.className = "ep-fb-ov"; document.body.appendChild(ov); }
    const list = read().slice().reverse();
    ov.innerHTML = `<div class="ep-fb-card card glass">
      <div class="ep-fb-head">
        <b>💬 Замечания и баги</b>
        <span class="ep-fb-sp"></span>
        <button type="button" class="ep-plan-mini ep-clickable" data-fb-close aria-label="Закрыть">✕</button>
      </div>
      <div class="ep-fb-hint">Пиши, что не так — прямо здесь, по горячему. Запись сохраняется на устройстве вместе с экраном, проектом и версией сборки. Потом «Скопировать всё» → отправь текст разработчику.</div>
      <textarea id="ep-fb-input" class="ep-fb-input" rows="3" placeholder="Например: при тапе по проёму в развёртке зависает экран…"></textarea>
      <div class="ep-fb-row">
        <button type="button" class="btn btn-primary ep-clickable" data-fb-add>+ Записать</button>
        <button type="button" class="btn btn-ghost ep-clickable" data-fb-copy>📋 Скопировать всё</button>
        ${list.length ? `<button type="button" class="btn btn-ghost ep-clickable" data-fb-clear>Очистить</button>` : ""}
      </div>
      <div class="ep-fb-list">${list.length ? list.map((r, i) => `
        <div class="ep-fb-item">
          <div class="ep-fb-meta">${esc(fmtDate(r.at))} · ${esc(r.route)}${r.project ? " · " + esc(r.project) : ""} · v${esc(r.build)}
            <button type="button" class="ep-plan-mini ep-clickable" data-fb-del="${list.length - 1 - i}" aria-label="Удалить запись">✕</button></div>
          <div class="ep-fb-text">${esc(r.text)}</div>
        </div>`).join("") : `<div class="ep-fb-empty">Пока пусто.</div>`}</div>
    </div>`;
    ov.hidden = false;
    const inp = document.getElementById("ep-fb-input");
    if (inp) setTimeout(() => { try { inp.focus(); } catch (e) {} }, 30);
  }
  function open() { render(); }
  function close() { const ov = ovEl(); if (ov) { ov.hidden = true; ov.innerHTML = ""; } }
  function toast(msg) {
    const ov = ovEl(); if (!ov) return;
    let t = ov.querySelector(".ep-fb-toast");
    if (!t) { t = document.createElement("div"); t.className = "ep-fb-toast"; ov.appendChild(t); }
    t.textContent = msg;
    clearTimeout(toast._t);
    toast._t = setTimeout(() => { if (t && t.parentNode) t.parentNode.removeChild(t); }, 1800);
  }

  document.addEventListener("click", (e) => {
    const t = e.target;
    if (t.closest("[data-fb-open]")) { e.preventDefault(); open(); return; }
    const ov = ovEl(); if (!ov || ov.hidden) return;
    if (t.closest("[data-fb-close]")) { close(); return; }
    if (t.closest("[data-fb-add]")) {
      const inp = document.getElementById("ep-fb-input");
      const v = inp ? inp.value : "";
      if (!String(v).trim()) { toast("Напиши текст замечания"); return; }
      add(v);
      render();
      toast("Записано");
      return;
    }
    if (t.closest("[data-fb-copy]")) {
      copyAll().then((ok) => toast(ok ? "Скопировано — отправляй" : "Не удалось скопировать"));
      return;
    }
    if (t.closest("[data-fb-clear]")) {
      if (!confirm("Удалить все записи?")) return;
      write([]); render(); return;
    }
    const del = t.closest("[data-fb-del]");
    if (del) {
      const i = Number(del.getAttribute("data-fb-del"));
      const list = read();
      if (Number.isFinite(i) && i >= 0 && i < list.length) { list.splice(i, 1); write(list); render(); }
      return;
    }
    // клик по затемнению (мимо карточки) — закрыть
    if (t === ov) close();
  });

  EP.Feedback = { open, close, add, read, asText, copyAll, count: () => read().length };
})();
