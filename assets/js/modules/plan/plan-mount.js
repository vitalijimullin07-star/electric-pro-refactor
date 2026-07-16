/* Electric Pro V29 — Проект квартиры: монтаж и экран (Слой 0).
   Список проектов -> редактор (шапка, undo/redo, экспорт, холст).
   Рисование комнат/элементов подключается следующими слоями. */
(() => {
  "use strict";
  window.EP = window.EP || {};

  const T = { // все строки модуля — в одном месте (задел под i18n)
    title: "🏗️ Проект квартиры",
    subtitle: "План электрики: комнаты, точки, трассы, расчёт.",
    newPlaceholder: "Название проекта (адрес, клиент)…",
    create: "Создать",
    importBtn: "⤒ Импорт JSON",
    empty: "Проектов пока нет. Создай первый — название можно менять потом.",
    back: "‹ Проекты",
    rename: "✎",
    undo: "↶", redo: "↷",
    exportBtn: "⤓ Экспорт",
    del: "Удалить",
    open: "Открыть",
    confirmDel: "Удалить проект безвозвратно?",
    savedAt: "Сохранено",
    storageFull: "Мало места в памяти устройства — проект может не сохраниться.",
    stats: (r, e) => `Комнат: ${r} · Точек: ${e}`,
    updated: "изм."
  };

  const esc = (s) => String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const $ = (sel, r) => (r || document).querySelector(sel);
  const fmtDate = (ms) => { try { return new Date(ms).toLocaleString("ru-RU", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" }); } catch (e) { return "—"; } };

  const V = { active: false, canvas: null, unsub: null, saveNote: "", ctrlsOn: true };
  const core = () => EP.Plan && EP.Plan.Core;

  // общая шапка «← Plan» (nav-header.js) в редакторе проекта дублирует «‹ Проекты» — прячем
  function setNavHidden(hide) {
    const bar = document.querySelector(".ep-navbar");
    if (bar) bar.style.display = hide ? "none" : "";
  }

  // ---------- список проектов ----------
  function renderList(root) {
    const rows = core().listProjects();
    root.innerHTML = `<div class="ep-plan">
      <div class="page-head"><h1>${T.title}</h1><p>${esc(T.subtitle)}</p></div>
      <div class="card ep-plan-new">
        <div class="ep-plan-newrow">
          <input id="ep-plan-name" type="text" placeholder="${esc(T.newPlaceholder)}" maxlength="80">
          <button type="button" class="btn btn-primary ep-clickable" data-plan-create>${T.create}</button>
        </div>
        <div class="ep-plan-newrow">
          <button type="button" class="btn btn-ghost ep-clickable" data-plan-import>${T.importBtn}</button>
          <input id="ep-plan-file" type="file" accept="application/json,.json" hidden>
        </div>
      </div>
      <div class="ep-plan-list">${rows.length ? rows.map(rowHtml).join("") : `<div class="card ep-plan-empty">${esc(T.empty)}</div>`}</div>
    </div>`;
    setNavHidden(false); // список проектов — общая шапка «← Plan» нужна для навигации назад
  }
  function rowHtml(r) {
    return `<div class="card ep-plan-item">
      <button type="button" class="ep-plan-item-main ep-clickable" data-plan-open="${esc(r.id)}">
        <b>${esc(r.name)}</b>
        <span>${esc(T.stats(r.rooms || 0, r.elements || 0))} · ${esc(T.updated)} ${esc(fmtDate(r.updatedAt))}</span>
      </button>
      <button type="button" class="ep-plan-item-del ep-clickable" data-plan-del="${esc(r.id)}" aria-label="${esc(T.del)}: ${esc(r.name)}">✕</button>
    </div>`;
  }

  // ---------- редактор ----------
  function renderEditor(root) {
    const p = core().project;
    if (!p) return renderList(root);
    root.innerHTML = `<div class="ep-plan${V.ctrlsOn ? "" : " is-ctrls-collapsed"}">
      <div class="ep-plan-top">
        <button type="button" class="btn btn-ghost ep-clickable" data-plan-back>${T.back}</button>
        <div class="ep-plan-title">
          <b id="ep-plan-title-text">${esc(p.name)}</b>
          <button type="button" class="ep-plan-mini ep-clickable" data-plan-rename aria-label="Переименовать проект">${T.rename}</button>
        </div>
        <button type="button" class="ep-plan-mini ep-clickable" data-plan-full aria-label="Во весь экран">⤢</button>
        <button type="button" class="ep-plan-mini ep-clickable" data-plan-ctrls aria-label="${V.ctrlsOn ? "Свернуть панель" : "Развернуть панель"}" title="Свернуть/развернуть панель инструментов">${V.ctrlsOn ? "︿" : "﹀"}</button>
      </div>
      <div class="ep-plan-toolbar">
        <button type="button" class="ep-plan-tbtn ep-clickable" data-plan-undo aria-label="Отменить">${T.undo}</button>
        <button type="button" class="ep-plan-tbtn ep-clickable" data-plan-redo aria-label="Вернуть">${T.redo}</button>
        <span class="ep-plan-savenote" id="ep-plan-savenote"></span>
        <span class="ep-plan-flex"></span>
        <button type="button" class="ep-plan-tbtn ep-clickable" data-plan-pdf aria-label="Печатный лист (PDF)">📄</button>
        <button type="button" class="ep-plan-tbtn ep-clickable" data-plan-export>${T.exportBtn}</button>
      </div>
      <div class="ep-plan-toolbar ep-plan-modes">
        <button type="button" class="ep-plan-tbtn on ep-clickable" data-plan-mode="view" aria-label="Просмотр и выбор">☝</button>
        <button type="button" class="ep-plan-tbtn ep-clickable" data-plan-mode="rect" aria-label="Прямоугольная комната">▭</button>
        <button type="button" class="ep-plan-tbtn ep-clickable" data-plan-mode="poly" aria-label="Комната по точкам">⬠</button>
        <button type="button" class="ep-plan-tbtn ep-clickable" data-plan-mode="beam" aria-label="Балка/перемычка на потолке">▬</button>
        <button type="button" class="ep-plan-tbtn ep-clickable" data-plan-mode="void" aria-label="Вентшахта / мини-комната внутри комнаты">▦</button>
        <button type="button" class="ep-plan-tbtn ep-clickable" data-plan-mode="merge" aria-label="Объединить две соседние комнаты в одну">🔗</button>
        <span class="ep-plan-modesep" aria-hidden="true"></span>
        <button type="button" class="ep-plan-tbtn ep-clickable" data-plan-mode="elem" aria-label="Точки: розетки, свет">🔌</button>
        <button type="button" class="ep-plan-tbtn ep-clickable" data-plan-mode="opening" aria-label="Проёмы: двери, окна, балкон">🚪</button>
        <span class="ep-plan-modesep" aria-hidden="true"></span>
        <button type="button" class="ep-plan-tbtn ep-clickable" data-plan-mode="wall" aria-label="Развёртка: выбрать комнату">📐</button>
        <button type="button" class="ep-plan-tbtn ep-clickable" data-plan-mode="ruler" aria-label="Рулетка">📏</button>
        <button type="button" class="ep-plan-tbtn ep-clickable" data-plan-mode="underlay" aria-label="Подложка-фото">🖼</button>
        <span class="ep-plan-modesep" aria-hidden="true"></span>
        <button type="button" class="ep-plan-tbtn ep-clickable" data-plan-layers aria-label="Слои">🗂</button>
        <button type="button" class="ep-plan-tbtn ep-clickable" data-plan-routes aria-label="Трассы">🧵</button>
        <button type="button" class="ep-plan-tbtn ep-clickable" data-plan-calc aria-label="Расчёт и смета">🧮</button>
        <button type="button" class="ep-plan-tbtn ep-clickable" data-plan-checks aria-label="Проверки норм">✅</button>
        <button type="button" class="ep-plan-tbtn ep-clickable" data-plan-scheme aria-label="Однолинейная схема">▤</button>
        <span class="ep-plan-modesep" aria-hidden="true"></span>
        <button type="button" class="ep-plan-tbtn ep-clickable" data-plan-fit aria-label="Показать всё">⛶</button>
      </div>
      <div class="ep-plan-modehint" id="ep-plan-modehint"></div>
      <div class="ep-plan-canvas" id="ep-plan-canvas">
        <div class="ep-plan-quickbar" id="ep-plan-quickbar" hidden>
          <button type="button" class="ep-plan-qbtn ep-clickable" data-plan-undo aria-label="Отменить">↶</button>
          <button type="button" class="ep-plan-qbtn ep-clickable" data-plan-mode="view" aria-label="Выйти в просмотр">☝</button>
          <button type="button" class="ep-plan-qbtn ep-clickable" data-plan-fit aria-label="Показать всё">⛶</button>
        </div>
        <div class="ep-plan-sheet" id="ep-plan-sheet" hidden></div>
      </div>
    </div>`;
    mountCanvas();
    refreshToolbar();
    armBack(); // ставим «ловушку» для аппаратной кнопки Назад
    setNavHidden(true); // редактор уже имеет свою «‹ Проекты» — общая шапка не нужна
  }

  // свернуть/развернуть панель инструментов редактора — холст занимает освободившееся место
  function toggleTopCtrls(root) {
    V.ctrlsOn = !V.ctrlsOn;
    const box = root.querySelector(".ep-plan");
    if (box) box.classList.toggle("is-ctrls-collapsed", !V.ctrlsOn);
    const btn = root.querySelector("[data-plan-ctrls]");
    if (btn) {
      btn.textContent = V.ctrlsOn ? "︿" : "﹀";
      const lbl = V.ctrlsOn ? "Свернуть панель" : "Развернуть панель";
      btn.setAttribute("aria-label", lbl); btn.setAttribute("title", lbl);
    }
    if (V.canvas && V.canvas.redraw) V.canvas.redraw();
  }

  function mountCanvas() {
    const host = $("#ep-plan-canvas");
    if (!host || !EP.Plan.Canvas) return;
    if (V.canvas) { try { V.canvas.destroy(); } catch (e) {} }
    V.canvas = EP.Plan.Canvas.create(host);
    if (EP.Plan.Rooms) EP.Plan.Rooms.attach(V.canvas);
    if (EP.Plan.Geometry) {
      const bb = EP.Plan.Geometry.projectBBox(core().project);
      if (bb) V.canvas.fit(bb);
    }
    V.canvas.redraw();
  }

  function refreshToolbar() {
    const c = core();
    // querySelectorAll — undo дублируется в плавающей quickbar-панели, оба должны гаснуть вместе
    document.querySelectorAll("[data-plan-undo]").forEach((b) => { b.disabled = !c.canUndo(); });
    const r = $("[data-plan-redo]"), note = $("#ep-plan-savenote");
    if (r) r.disabled = !c.canRedo();
    if (note) note.textContent = V.saveNote;
  }

  // ---------- действия ----------
  function doCreate(root) {
    const inp = $("#ep-plan-name");
    core().createProject(inp ? inp.value : "");
    renderEditor(root);
  }
  async function doOpen(root, id) {
    const p = await core().openProject(id);
    if (p) renderEditor(root);
  }
  function doDelete(root, id) {
    if (!confirm(T.confirmDel)) return;
    core().deleteProject(id);
    renderList(root);
  }
  function doRename() {
    const p = core().project; if (!p) return;
    const box = $(".ep-plan-title"); if (!box || box.querySelector("input")) return;
    box.innerHTML = `<input id="ep-plan-rn" type="text" value="${esc(p.name)}" maxlength="80">`;
    const inp = $("#ep-plan-rn");
    const done = () => { core().renameProject(inp.value); const t = $(".ep-plan-title"); if (t) t.innerHTML = `<b id="ep-plan-title-text">${esc(core().project.name)}</b><button type="button" class="ep-plan-mini ep-clickable" data-plan-rename aria-label="Переименовать проект">${T.rename}</button>`; };
    inp.addEventListener("keydown", (e) => { if (e.key === "Enter") inp.blur(); });
    inp.addEventListener("blur", done);
    inp.focus(); inp.select();
  }
  function doExport() {
    const c = core(), p = c.project; if (!p) return;
    const text = c.exportJSON(); if (!text) return;
    const blob = new Blob([text], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "ep-plan-" + (p.name || "proekt").replace(/[^\wа-яё-]+/gi, "_") + ".json";
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 1500);
  }
  function doImport(root) {
    const f = $("#ep-plan-file"); if (!f) return;
    f.onchange = () => {
      const file = f.files && f.files[0]; if (!file) return;
      const rd = new FileReader();
      rd.onload = () => { if (core().importJSON(String(rd.result || ""))) renderEditor(root); };
      rd.readAsText(file);
    };
    f.click();
  }

  // ---------- события ----------
  function root() { return document.getElementById("ep-plan-root"); }

  document.addEventListener("click", (e) => {
    const r = root(); if (!r || !V.active) return;
    const t = e.target; let el;
    if ((el = t.closest("[data-plan-create]"))) return doCreate(r);
    if ((el = t.closest("[data-plan-open]"))) return void doOpen(r, el.getAttribute("data-plan-open"));
    if ((el = t.closest("[data-plan-del]"))) return doDelete(r, el.getAttribute("data-plan-del"));
    if (t.closest("[data-plan-back]")) { core().closeProject(); return renderList(r); }
    if (t.closest("[data-plan-ctrls]")) return toggleTopCtrls(r);
    if (t.closest("[data-plan-rename]")) return doRename();
    if (t.closest("[data-plan-undo]")) { core().undo(); return; }
    if (t.closest("[data-plan-redo]")) { core().redo(); return; }
    if (t.closest("[data-plan-export]")) return doExport();
    if (t.closest("[data-plan-import]")) return doImport(r);
    if (t.closest("[data-plan-full]")) return toggleFullscreen(r);
  });

  // Во весь экран: нативный Fullscreen API + фиксированная раскладка как запас (iOS)
  function toggleFullscreen(r) {
    const box = r.querySelector(".ep-plan");
    if (!box) return;
    const on = !box.classList.contains("is-full");
    box.classList.toggle("is-full", on);
    try {
      if (on && box.requestFullscreen) box.requestFullscreen().catch(() => {});
      // гасим браузерный fullscreen, только если он принадлежит РЕДАКТОРУ (не
      // развёртке стены поверх него — та гасит себя сама, см. exitFS в plan-unfold.js)
      else if (!on && document.fullscreenElement === box) document.exitFullscreen().catch(() => {});
    } catch (e) {}
  }
  document.addEventListener("fullscreenchange", () => {
    if (!document.fullscreenElement) {
      const box = document.querySelector(".ep-plan.is-full");
      if (box) box.classList.remove("is-full");
    }
  });

  // Кнопка «Назад» на Android: закрывает функцию ВНУТРИ планировки (вкладку/режим/
  // полноэкранку), а не выходит из неё. Когда ничего не открыто — уходит к списку проектов.
  // ВАЖНО: этот листенер регистрируется раньше EP.Router.init() (тот вызывается из
  // app.js на DOMContentLoaded, а этот файл — обычный deferred-скрипт, отрабатывает
  // раньше) — значит на popstate он срабатывает ПЕРВЫМ. Раньше он не звал
  // stopImmediatePropagation(), и следом ВСЕГДА срабатывал ОБЩИЙ роутерный обработчик
  // (router.js), который безусловно уводил на предыдущий РОУТ приложения (EP.Router.back())
  // — то есть каждый Android-«назад» внутри «Проекта квартиры» не просто закрывал текущий
  // слой (полноэкран/развёртку/шторку), а следом ЕЩЁ и выкидывал из всего модуля целиком.
  // Останавливаем всплытие до роутера, если мы сами обработали нажатие.
  function armBack() { try { history.pushState({ epPlan: true }, ""); } catch (e) {} }
  window.addEventListener("popstate", (event) => {
    if (!V.active || !core().project) return;
    if (event && event.stopImmediatePropagation) event.stopImmediatePropagation();
    const r = root();
    const R2 = EP.Plan.Rooms;
    const fullBox = document.querySelector(".ep-plan.is-full");
    // ЛЮБОЙ нативный fullscreen (главный редактор, развёртка, схема, любая шторка через
    // ⛶/⤢/🔄) гасим первым делом, независимо от того, что именно его включило — иначе
    // на Android «назад» мог сначала молча погасить только сам fullscreen (браузер
    // перехватывает жест на выход из Fullscreen API раньше, чем событие доходит до
    // popstate), а следующий "назад" уже закрывал бы другой, неожиданный слой.
    if (document.fullscreenElement) { try { document.exitFullscreen(); } catch (e) {} }
    const sh = document.getElementById("ep-plan-sheet");
    const sheetOpen = sh && !sh.hidden;
    const mode = R2 && R2.currentMode ? R2.currentMode() : "view";
    if (fullBox) { fullBox.classList.remove("is-full"); armBack(); return; }
    if (sh) sh.classList.remove("ep-plan-sheet-full");
    if (EP.Plan.Unfold && EP.Plan.Unfold.isOpen()) { EP.Plan.Unfold.close(); if (R2) R2.closeSheet(); armBack(); return; }
    if (sheetOpen || mode !== "view") { if (R2) R2.setMode("view"); armBack(); return; }
    // внутри планировки ничего не открыто — возвращаемся к списку проектов (не выходим)
    core().closeProject(); if (r) renderList(r);
  });

  document.addEventListener("keydown", (e) => {
    if (!V.active || !core().project) return;
    const z = (e.ctrlKey || e.metaKey) && (e.key === "z" || e.key === "Z" || e.key === "я" || e.key === "Я");
    if (z && e.shiftKey) { e.preventDefault(); core().redo(); }
    else if (z) { e.preventDefault(); core().undo(); }
  });

  function onCoreChange(what) {
    if (!V.active) return;
    if (what === "storage-full") { V.saveNote = T.storageFull; refreshToolbar(); return; }
    if (what !== "index" && what !== "close") {
      V.saveNote = T.savedAt + " " + fmtDate(Date.now());
      refreshToolbar();
      if ((what === "undo" || what === "redo") && EP.Plan.Rooms) {
        EP.Plan.Rooms.renderScene();
        if (EP.Plan.Unfold && EP.Plan.Unfold.isOpen()) EP.Plan.Unfold.drawStrip();
      }
    }
    if (what === "index" && !core().project) { const r = root(); if (r) renderList(r); }
  }

  function mount() {
    const r = root(); if (!r) return;
    if (!core() || !EP.Plan.Canvas) { r.innerHTML = "<div class='card'><p>Модуль плана не загрузился.</p></div>"; return; }
    if (!V.unsub) V.unsub = core().onChange(onCoreChange);
    if (core().project) renderEditor(r); else renderList(r);
    core().cloudPullIndex && core().cloudPullIndex();
  }

  window.addEventListener("ep:route-loaded", (e) => {
    const routeName = e && e.detail && e.detail.route;
    V.active = routeName === "plan";
    if (EP.Plan.Rooms) EP.Plan.Rooms.setActive(V.active);
    if (V.active) mount();
    else if (V.canvas) { try { V.canvas.destroy(); } catch (err) {} V.canvas = null; if (EP.Plan.Rooms) EP.Plan.Rooms.detach(); }
  });

  EP.Plan = EP.Plan || {};
  EP.Plan.Mount = { mount, T };
})();
