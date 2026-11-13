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
    newCeil: "Высота потолка (от пола), см",
    newRoute: "Ведём силу по",
    newCeiling: "потолку", newFloor: "полу",
    newMount: "Монтаж по потолку", newGofra: "В гофре", newTies: "На стяжки",
    metaCeil: "Высота потолка по умолчанию, см",
    importBtn: "⤒ Импорт JSON",
    empty: "Проектов пока нет. Создай первый — название можно менять потом.",
    syncOn: "☁ Проекты синхронизируются между устройствами",
    syncOff: "☁ Нет связи с облаком — проекты только на этом устройстве",
    syncBtn: "⟳ Обновить",
    syncing: "Смотрю облако…",
    syncDone: (n) => (n ? `Список обновлён: проектов ${n}` : "Список обновлён"),
    syncNone: "Облако недоступно — нужен вход и интернет",
    back: "‹ Проекты", backArrow: "‹", backText: " Проекты", backLabel: "К списку проектов",
    rename: "✎",
    meta: "ℹ️", metaTitle: "О проекте (для титульного листа PDF)",
    metaClient: "Заказчик", metaAddress: "Адрес объекта",
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
  const DEFAULTS_CEIL = 270; // дефолт высоты потолка в форме создания (зеркалит plan-core DEFAULTS.ceilingHeight)
  const $ = (sel, r) => (r || document).querySelector(sel);
  // «10.11, 14:05» — собираем сами. toLocaleString поднимает системный форматтер дат (Intl):
  // первый вызов — десятки мс, а зовётся это на КАЖДОЕ сохранение, то есть в момент
  // отпускания пальца после любой тяги (замер: 61 мс при CPU ×4 — заметный рывок фиксации)
  const p2 = (n) => (n < 10 ? "0" : "") + n;
  const fmtDate = (ms) => { const d = new Date(ms); if (isNaN(d.getTime())) return "—"; return p2(d.getDate()) + "." + p2(d.getMonth() + 1) + ", " + p2(d.getHours()) + ":" + p2(d.getMinutes()); };

  // Вкладки инструментов (просьба пользователя: «одна вкладка чисто стены, двери,
  // окна, вторая кнопка чисто для работы с электрикой») — 17 иконок в одну строку
  // всё равно уезжали в горизонтальный скролл, и половина из них в текущей задаче
  // не нужна. Группа — свойство КНОПОК (data-plan-grp, через пробел можно указать
  // обе), не отдельная разметка на группу: инструмент, полезный и там и там
  // (📐 развёртка), просто перечисляет обе вкладки, а «общие» (☝ Просмотр, ⛶
  // Вписать) не имеют атрибута вообще и видны всегда. Выбор вкладки — устройство,
  // не проект (как quickbar): localStorage, не в модели.
  const GROUP_KEY = "ep_plan_toolgroup";
  const readGroup = () => { try { const g = localStorage.getItem(GROUP_KEY); return g === "elec" ? "elec" : "build"; } catch (e) { return "build"; } };
  const V = { active: false, canvas: null, unsub: null, saveNote: "", ctrlsOn: true, group: readGroup() };
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
        </div>
        <div class="ep-plan-newrow">
          <label class="ep-plan-newfield" style="flex:1">${T.newCeil}
            <input id="ep-plan-ceil" type="number" inputmode="numeric" min="150" max="600" value="${DEFAULTS_CEIL}">
          </label>
        </div>
        <div class="ep-plan-newrow ep-plan-newseg" data-plan-newroute="ceiling">
          <span class="ep-plan-newlbl">${T.newRoute}:</span>
          <button type="button" class="ep-plan-chip ep-clickable on" data-plan-rt="ceiling">${T.newCeiling}</button>
          <button type="button" class="ep-plan-chip ep-clickable" data-plan-rt="floor">${T.newFloor}</button>
        </div>
        <div class="ep-plan-newrow ep-plan-newseg ep-plan-newmount" data-plan-newmount="1">
          <span class="ep-plan-newlbl">${T.newMount}:</span>
          <button type="button" class="ep-plan-chip ep-clickable on" data-plan-mt="1">${T.newGofra}</button>
          <button type="button" class="ep-plan-chip ep-clickable" data-plan-mt="0">${T.newTies}</button>
        </div>
        <div class="ep-plan-newrow">
          <button type="button" class="btn btn-primary ep-clickable" data-plan-create>${T.create}</button>
          <button type="button" class="btn btn-ghost ep-clickable" data-plan-import>${T.importBtn}</button>
          <input id="ep-plan-file" type="file" accept="application/json,.json" hidden>
        </div>
      </div>
      <div class="ep-plan-syncrow">
        <span class="ep-plan-syncst">${core().cloudReady() ? T.syncOn : T.syncOff}</span>
        <span class="ep-plan-flex"></span>
        <button type="button" class="ep-plan-mini ep-clickable" data-plan-sync>${T.syncBtn}</button>
      </div>
      <div class="ep-plan-list">${rows.length ? rows.map(rowHtml).join("") : `<div class="card ep-plan-empty">${esc(T.empty)}</div>`}</div>
    </div>`;
    setNavHidden(false); // список проектов — общая шапка «← Plan» нужна для навигации назад
  }
  // значок синхронизации у строки проекта: показываем ТОЛЬКО когда есть что сказать
  // (совпадает с облаком — молчим, чтобы список не рябил одинаковыми галочками)
  const SYNC_BADGE = {
    cloud: { t: "☁ новее в облаке", c: "is-cloud" },
    pending: { t: "↑ не отправлен", c: "is-pending" },
    local: { t: "только здесь", c: "is-local" }
  };
  function rowHtml(r) {
    const b = SYNC_BADGE[core().syncState(r.id)];
    return `<div class="card ep-plan-item">
      <button type="button" class="ep-plan-item-main ep-clickable" data-plan-open="${esc(r.id)}">
        <b>${esc(r.name)}</b>
        <span>${esc(T.stats(r.rooms || 0, r.elements || 0))} · ${esc(T.updated)} ${esc(fmtDate(r.updatedAt))}${b ? ` <i class="ep-plan-syncb ${b.c}">${esc(b.t)}</i>` : ""}</span>
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
        <button type="button" class="btn btn-ghost ep-clickable ep-plan-backbtn" data-plan-back aria-label="${T.backLabel}">${T.backArrow}<span class="ep-plan-backtxt">${T.backText}</span></button>
        <div class="ep-plan-title">${titleHtml(p)}</div>
        <div class="ep-plan-topx" id="ep-plan-topx">
          <button type="button" class="ep-plan-mini ep-clickable" data-plan-rename aria-label="Переименовать проект">${T.rename}<span class="ep-plan-xlbl">Переименовать</span></button>
          <button type="button" class="ep-plan-mini ep-clickable" data-plan-meta aria-label="${T.metaTitle}" title="${T.metaTitle}">${T.meta}<span class="ep-plan-xlbl">О проекте</span></button>
          <button type="button" class="ep-plan-mini ep-clickable" data-plan-3d aria-label="3D-прогулка по квартире" title="Пройтись по квартире от первого лица: стены, проёмы, точки и трассы в 3D">🚶<span class="ep-plan-xlbl">3D-прогулка</span></button>
          <button type="button" class="ep-plan-mini ep-clickable" data-fb-open aria-label="Замечания и баги (чат)" title="Записать замечание/баг — потом скопировать и отправить">💬<span class="ep-plan-xlbl">Замечания (чат)</span></button>
          <button type="button" class="ep-plan-mini ep-clickable${paperOn() ? " on" : ""}" data-plan-paper aria-label="Бумажный режим холста" title="Холст как печатный лист: белый фон, тёмные линии — видно, как выйдет из принтера">📄<span class="ep-plan-xlbl">Бумажный вид</span></button>
          <button type="button" class="ep-plan-mini ep-clickable${p.settings.realScale ? " on" : ""}" data-plan-realscale aria-pressed="${p.settings.realScale ? "true" : "false"}" aria-label="Значки в реальном размере (1:1)" title="Значки в реальном размере, мм — рамки 84/155/226/300/368 мм (1:1)">1:1<span class="ep-plan-xlbl">Реальный размер значков</span></button>
        </div>
        <button type="button" class="ep-plan-mini ep-clickable ep-plan-topxbtn" data-plan-topx aria-label="Ещё: переименовать, о проекте, 3D, бумажный вид, 1:1" aria-expanded="false" aria-controls="ep-plan-topx">⋮</button>
        <button type="button" class="ep-plan-mini ep-clickable" data-plan-full aria-label="Во весь экран">⤢</button>
        <button type="button" class="ep-plan-mini ep-clickable" data-plan-ctrls aria-label="${V.ctrlsOn ? "Свернуть панель" : "Развернуть панель"}" title="Свернуть/развернуть панель инструментов">${V.ctrlsOn ? "︿" : "﹀"}</button>
      </div>
      <div class="ep-plan-compactrow">
        ${floorsBarHtml(p)}
        <div class="ep-plan-toolbar ep-plan-savebar">
          <button type="button" class="ep-plan-ready ep-clickable" id="ep-plan-ready" data-plan-daytask hidden aria-label="Готовность объекта — задание на день"></button>
          <button type="button" class="ep-plan-rstat ep-clickable" id="ep-plan-rstat" data-plan-rstat hidden></button>
          <button type="button" class="ep-plan-tbtn ep-clickable" data-plan-undo aria-label="Отменить">${T.undo}</button>
          <button type="button" class="ep-plan-tbtn ep-clickable" data-plan-redo aria-label="Вернуть">${T.redo}</button>
          <span class="ep-plan-savenote" id="ep-plan-savenote"></span>
          <button type="button" class="ep-plan-tbtn ep-clickable" data-plan-more aria-label="Ещё: PDF, экспорт, импорт">⋯</button>
        </div>
      </div>
      <div class="ep-plan-moremenu" id="ep-plan-moremenu" hidden>
        <button type="button" class="ep-plan-tbtn ep-clickable" data-plan-tpl-open aria-label="Шаблон квартиры" title="Готовая раскладка комнат: выбираешь тип, вписываешь свои размеры — комнаты встают уже состыкованными">🧩 Шаблон</button>
        <button type="button" class="ep-plan-tbtn ep-clickable" data-plan-pdf aria-label="Печатный лист (PDF)">📄 Печатный лист (PDF)</button>
        <button type="button" class="ep-plan-tbtn ep-clickable" data-plan-dxf aria-label="Экспорт DXF для AutoCAD">⤓ DXF (AutoCAD)</button>
        <button type="button" class="ep-plan-tbtn ep-clickable" data-plan-export>${T.exportBtn}</button>
        <button type="button" class="ep-plan-tbtn ep-clickable" data-plan-import>${T.importBtn}</button>
        <input id="ep-plan-file" type="file" accept="application/json,.json" hidden>
      </div>
      <div class="ep-plan-grouptabs" role="tablist">
        <button type="button" class="ep-plan-gtab ep-clickable" data-plan-group="build" aria-label="Планировка: стены, двери, окна">🏗 Планировка</button>
        <button type="button" class="ep-plan-gtab ep-clickable" data-plan-group="elec" aria-label="Электрика: точки, трассы, смета">⚡ Электрика</button>
      </div>
      <div class="ep-plan-toolbar ep-plan-modes">
        <button type="button" class="ep-plan-tbtn on ep-clickable" data-plan-mode="view" aria-label="Просмотр и выбор" aria-pressed="true">☝</button>
        <button type="button" class="ep-plan-tbtn ep-clickable" data-plan-fit aria-label="Показать всё">⛶</button>
        <span class="ep-plan-modesep" aria-hidden="true"></span>
        <button type="button" class="ep-plan-tbtn ep-clickable" data-plan-grp="build" data-plan-mode="rect" aria-label="Прямоугольная комната">▭</button>
        <button type="button" class="ep-plan-tbtn ep-clickable" data-plan-grp="build" data-plan-mode="poly" aria-label="Комната по точкам">⬠</button>
        <button type="button" class="ep-plan-tbtn ep-clickable" data-plan-grp="build" data-plan-mode="attach" aria-label="Пристроить комнату к стене" title="Тапни стену — комната встанет вплотную, общая стена получится сама">⊞</button>
        <button type="button" class="ep-plan-tbtn ep-clickable" data-plan-grp="build" data-plan-mode="split" aria-label="Разрезать комнату перегородкой" title="Два тапа поперёк комнаты — получатся две комнаты с общей стеной">✂</button>
        <button type="button" class="ep-plan-tbtn ep-clickable" data-plan-grp="build elec" data-plan-mode="note" aria-label="Заметка на плане" title="Записка прямо на чертеже: «здесь штробить нельзя», «согласовать» — попадёт и в PDF">📝</button>
        <button type="button" class="ep-plan-tbtn ep-clickable" data-plan-grp="build elec" data-plan-mode="dim" aria-label="Размеры" title="Размеры: тапни две точки — свой размер. Тяни размерную цепочку у стены или подпись h=NN — подвинешь их">⟷</button>
        <button type="button" class="ep-plan-tbtn ep-clickable" data-plan-grp="build" data-plan-mode="opening" aria-label="Проёмы: двери, окна, балкон">🚪</button>
        <button type="button" class="ep-plan-tbtn ep-clickable" data-plan-grp="build" data-plan-mode="beam" aria-label="Балка/перемычка на потолке">▬</button>
        <button type="button" class="ep-plan-tbtn ep-clickable" data-plan-grp="build" data-plan-mode="void" aria-label="Вентшахта / мини-комната внутри комнаты">▦</button>
        <button type="button" class="ep-plan-tbtn ep-clickable" data-plan-grp="build" data-plan-mode="furn" aria-label="Мебель и бытовая техника">🛋</button>
        <button type="button" class="ep-plan-tbtn ep-clickable" data-plan-grp="build" data-plan-mode="merge" aria-label="Объединить две соседние комнаты в одну">🔗</button>
        <button type="button" class="ep-plan-tbtn ep-clickable" data-plan-grp="build" data-plan-mode="movroom" aria-label="Перенести комнату целиком" title="Тяни комнату — поедет целиком, с точками и проёмами">🧭</button>
        <button type="button" class="ep-plan-tbtn ep-clickable" data-plan-grp="build" data-plan-mode="ruler" aria-label="Рулетка">📏</button>
        <button type="button" class="ep-plan-tbtn ep-clickable" data-plan-grp="build" data-plan-mode="underlay" aria-label="Подложка-фото">🖼</button>
        <button type="button" class="ep-plan-tbtn ep-clickable" data-plan-grp="elec" data-plan-mode="elem" aria-label="Точки: розетки, свет">🔌</button>
        <button type="button" class="ep-plan-tbtn ep-clickable${EP.Plan.Rooms && EP.Plan.Rooms.montageOn && EP.Plan.Rooms.montageOn() ? " on" : ""}" data-plan-grp="elec" data-plan-montage aria-label="Режим монтажника: только нужное на объекте, статусы точек" title="Режим монтажника">👷</button>
        <button type="button" class="ep-plan-tbtn ep-clickable" data-plan-grp="elec" data-plan-daytask aria-label="Задание на день и готовность объекта" title="Задание на день">📋</button>
        <button type="button" class="ep-plan-tbtn ep-clickable" data-plan-grp="elec" data-plan-autoproj aria-label="Сформировать проект: линии, автоматы, УЗО по точкам" title="Сформировать проект: линии, автоматы и УЗО по расставленным точкам">⚡</button>
        <button type="button" class="ep-plan-tbtn ep-clickable" data-plan-grp="elec" data-plan-byroom aria-label="Автоматы по комнатам: свой автомат на комнату — розетки, свет, тёплый пол, кондиционер (тумблеры)" title="Автоматы по комнатам: свой автомат на каждую комнату по видам нагрузки">🎚</button>
        <button type="button" class="ep-plan-tbtn ep-clickable" data-plan-grp="elec" data-plan-mode="guide" aria-label="Магистраль трасс — приоритетное направление автотрассировки" title="Нарисуй линию по коридору — трассы пойдут по ней">⇉</button>
        <button type="button" class="ep-plan-tbtn ep-clickable" data-plan-grp="elec" data-plan-layers aria-label="Слои">🗂</button>
        <button type="button" class="ep-plan-tbtn ep-clickable" data-plan-grp="elec" data-plan-routes aria-label="Трассы">🧵</button>
        <button type="button" class="ep-plan-tbtn ep-clickable" data-plan-grp="elec" data-plan-calc aria-label="Расчёт и смета">🧮</button>
        <button type="button" class="ep-plan-tbtn ep-clickable" data-plan-grp="elec" data-plan-checks aria-label="Проверить проект: что готово и что забыто" title="Проверить проект">🔍</button>
        <button type="button" class="ep-plan-tbtn ep-clickable" data-plan-grp="elec" data-plan-scheme aria-label="Однолинейная схема">▤</button>
        <span class="ep-plan-modesep" aria-hidden="true"></span>
        <button type="button" class="ep-plan-tbtn ep-clickable" data-plan-mode="wall" aria-label="Развёртка: выбрать комнату">📐</button>
      </div>
      <div class="ep-plan-modehint" id="ep-plan-modehint"></div>
      <div class="ep-plan-canvas" id="ep-plan-canvas">
        <div class="ep-plan-quickbar" id="ep-plan-quickbar" hidden></div>
        <div class="ep-plan-sheet" id="ep-plan-sheet" hidden></div>
        <button type="button" class="ep-plan-sheetbtn ep-clickable" id="ep-plan-sheetbtn" data-sheet-collapse hidden aria-label="Свернуть панель вниз">⌄</button>
      </div>
    </div>`;
    watchTop();          // название проекта видно всегда: узкая шапка прячет второстепенное в ⋮
    syncPlanBoxHeight(); // ДО mountCanvas() — холст должен измерить УЖЕ верную высоту .ep-plan
    mountCanvas();
    refreshToolbar();
    applyToolGroup(root); // вкладка «Планировка»/«Электрика» — сразу после вставки разметки
    applyPaper(root);     // бумажный режим холста — выбор устройства, переживает переоткрытие
    armBack(); // ставим «ловушку» для аппаратной кнопки Назад
    setNavHidden(true); // редактор уже имеет свою «‹ Проекты» — общая шапка не нужна
  }

  // Название проекта — кнопка: тап по нему = переименовать (на узкой шапке ✎ уходит в меню ⋮)
  function titleHtml(p) {
    return `<button type="button" class="ep-plan-titlebtn ep-clickable" data-plan-rename title="Переименовать" aria-label="Проект «${esc(p.name)}» — переименовать"><b id="ep-plan-title-text">${esc(p.name)}</b></button>`;
  }
  /* НАЗВАНИЕ ПРОЕКТА ВИДНО ВСЕГДА (аудит Астры, п. 15). На телефоне шесть кнопок справа сжимали
     название до 0 px — не видно, какой проект открыт. Если шапке не хватает ширины на всё,
     второстепенные кнопки (переименовать, о проекте, 3D, чат, бумажный вид, 1:1) уходят в меню ⋮:
     это те же самые кнопки, меняется только раскладка (класс is-narrow, plan.css). На экране
     остаются «‹», название, ⋮, «во весь экран» и «свернуть панель». Мерим саму шапку, а не окно:
     на компьютере рядом стоит боковое меню, и окно широкое, а шапка — нет. clientWidth — в
     CSS-пикселях шапки, как и размеры кнопок (масштаб интерфейса на сравнение не влияет). */
  const TOP_NARROW_PX = 720;
  let topRO = null;
  const topBar = () => { const r = root(); return r ? r.querySelector(".ep-plan-top") : null; };
  function closeTopX(top) {
    const t = top || topBar(); if (!t || !t.classList.contains("is-xopen")) return;
    t.classList.remove("is-xopen");
    const b = t.querySelector("[data-plan-topx]"); if (b) b.setAttribute("aria-expanded", "false");
  }
  function toggleTopX() {
    const t = topBar(); if (!t) return;
    const open = !t.classList.contains("is-xopen");
    t.classList.toggle("is-xopen", open);
    const b = t.querySelector("[data-plan-topx]"); if (b) b.setAttribute("aria-expanded", open ? "true" : "false");
  }
  function syncTopNarrow() {
    const top = topBar(); if (!top) return;
    const w = top.clientWidth;
    if (!(w > 0)) return; // шапка ещё не разложена (скрытый контейнер) — решим на следующем замере
    const narrow = w < TOP_NARROW_PX;
    if (top.classList.contains("is-narrow") === narrow) return;
    top.classList.toggle("is-narrow", narrow);
    if (!narrow) closeTopX(top);
  }
  function watchTop() {
    if (topRO) { topRO.disconnect(); topRO = null; }
    const top = topBar(); if (!top) return;
    syncTopNarrow();
    const row = modesRow();
    if (row) { row.addEventListener("scroll", syncModesEdge, { passive: true }); syncModesEdge(); }
    // ширина шапки меняется не только с окном: боковое меню, «во весь экран», поворот экрана
    if (typeof ResizeObserver === "function") {
      topRO = new ResizeObserver(() => { syncTopNarrow(); syncModesEdge(); });
      topRO.observe(top);
      if (row) topRO.observe(row);
    }
  }
  /* Ряд инструментов на телефоне шире экрана и листается вбок (аудит Астры, п. 17: «не
     очевидно без знания интерфейса»). Признак — затухание у того края, за которым есть ещё
     кнопки (классы can-l / can-r, маска в plan.css); долистали до конца — край чёткий. */
  function modesRow() { return document.querySelector(".ep-plan-modes"); }
  function syncModesEdge() {
    const row = modesRow(); if (!row) return;
    const max = row.scrollWidth - row.clientWidth;
    row.classList.toggle("can-l", max > 2 && row.scrollLeft > 2);
    row.classList.toggle("can-r", max > 2 && row.scrollLeft < max - 2);
  }

  // Высота .ep-plan — ЯВНО измеряется через JS (window.innerHeight/visualViewport),
  // а НЕ полагается только на CSS calc(100dvh...) (см. plan.css) — повторный репорт
  // пользователя того же класса бага («первый раз открыл проект, холст не во всю зону
  // ниже функций, нажимаю во весь экран и обратно — становится нормально») ПОСЛЕ уже
  // нескольких предыдущих заходов (100vh→100dvh, settle-окно в plan-canvas.js, явный
  // height у .ep-plan/.ep-plan-canvas/.ep-plan-svg вместо auto) показал: на части
  // реальных мобильных браузеров сам `dvh` при холодном открытии вычисляется ОДНОКРАТНО
  // (адресная строка ещё видна) и, судя по всему, НЕ пересчитывается сам по себе без
  // скролла страницы — а у app-shell своего скролла нет (нечему скроллиться), значит
  // браузер может вообще никогда не переоценить dvh заново. `.ep-plan.is-full`
  // (position:fixed;inset:0, меряется относительно ФАКТИЧЕСКОГО видимого вьюпорта)
  // побочным эффектом форсирует у браузера реальный пересчёт — отсюда и «нажал во весь
  // экран, отжал — стало нормально» из репорта. Настоящий фикс — не полагаться на dvh
  // ВООБЩЕ для этого измерения: `window.visualViewport.height` (точнее отражает
  // адресную строку, если браузер её поддерживает) / `window.innerHeight` — те же API,
  // которыми десятилетиями чинили ровно этот класс мобильных багов ДО появления dvh,
  // и `resize`/`visualViewport.resize`/`orientationchange` — события, которые браузер
  // ГАРАНТИРОВАННО шлёт при реальном изменении видимой области (в отличие от dvh, чьё
  // обновление ничем не гарантировано). Инлайн `style.height` побеждает CSS calc(dvh)
  // по специфичности — без `!important`, поэтому `.ep-plan.is-full{height:auto}`
  // (см. plan.css) всё равно берёт верх, КОГДА мы сами очищаем инлайн при входе в
  // fullscreen (см. toggleFullscreen ниже) — иначе зафиксированный пиксельный инлайн
  // конфликтовал бы с `position:fixed;inset:0`, которому нужен именно `auto`.
  // Настройка «Масштаб интерфейса» (visual-settings.js) применяется как CSS `zoom` на
  // #app целиком (base.css: #app{zoom:var(--font-scale,1)}) — НАЙДЕНО по реальной
  // диагностике пользователя (числа из [plan-height-diag]: заданная через
  // box.style.height высота на экране рендерилась МЕНЬШЕ заданной ровно в
  // --font-scale раз, независимо подтверждено воспроизведением с zoom=0.9 в headless).
  // getBoundingClientRect() (top/vh) — уже ВИЗУАЛЬНЫЕ координаты (после зума, как на
  // экране), а вот CSS-свойство `height`, которое мы пишем в style, — ЛОГИЧЕСКАЯ длина
  // ВНУТРИ зумленного контейнера: браузер дополнительно умножает её на zoom при
  // рендере. Раньше высота считалась только в визуальных пикселях и присваивалась как
  // есть — при zoom≠1 (масштаб интерфейса не 100%) итоговый холст получался в
  // --font-scale раз меньше нужного. `.ep-plan.is-full` (position:fixed;inset:0) этой
  // проблемы не имело — "0" не длина, которую можно смасштабировать.
  function currentZoom() {
    const v = parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--font-scale"));
    return (Number.isFinite(v) && v > 0) ? v : 1;
  }
  function syncPlanBoxHeight() {
    const r = root(); if (!r) return;
    const box = r.querySelector(".ep-plan");
    if (!box || box.classList.contains("is-full")) return;
    // КЛАВИАТУРА ОТКРЫТА — высоту НЕ пересчитываем (жалоба пользователя: «окно слишком
    // высоко забирается»). visualViewport.height при открытой клавиатуре меньше на её
    // высоту, и формула ниже схлопывала .ep-plan до полоски: холст исчезал, а шторка,
    // приклеенная к его низу, подскакивала к самой шапке. Правильное поведение — холст
    // остаётся как был, а шторку поднимает на высоту клавиатуры CSS (body[data-kb="1"]
    // в plan.css). Когда клавиатура закрывается, keyboard-inset.js шлёт ep:keyboard с
    // kb=0 — тогда пересчёт снова разрешён и вызывается (см. слушатель ниже).
    if (EP.Keyboard && EP.Keyboard.isOpen && EP.Keyboard.isOpen()) return;
    const vh = (window.visualViewport && window.visualViewport.height) || window.innerHeight;
    const top = box.getBoundingClientRect().top;
    const zoom = currentZoom();
    const h = Math.max(240, Math.round((vh - top - 8) / zoom));
    // min-height у .ep-plan (тот же calc(dvh...), plan.css) страдает от ТОГО ЖЕ зума —
    // при zoom>1 её отрендеренное значение может оказаться БОЛЬШЕ, чем наша (верно
    // посчитанная) высота, а min-height по спецификации ВСЕГДА побеждает меньший height
    // (used height = max(min-height, height)) — без сброса инлайн-высота выше молча
    // игнорировалась бы при масштабе интерфейса >100%. min-height:0 отдаёт финальный
    // размер целиком нашему height (то же значение, что мы только что посчитали).
    box.style.minHeight = "0";
    box.style.height = h + "px";
  }

  // Ре-фит содержимого на весь проект — та же логика, что и у кнопки «⛶ Показать
  // всё» (data-plan-fit). Зовётся при ЛЮБОМ ручном изменении доступного места под
  // холст (свернуть/развернуть панель инструментов, вход/выход из fullscreen) —
  // без этого resize() (колбэк ResizeObserver в plan-canvas.js) только подстраивал
  // ПРОПОРЦИИ viewBox под новый размер, сохраняя прежний zoom/центр: контейнер
  // резко меняется (обычно сильно вырастает по высоте), а содержимое остаётся
  // того же масштаба — на экране это выглядит как «комната стала крошечной
  // посередине большого пустого холста» (репорт пользователя со скриншотом сразу
  // после сворачивания панели). «Настройка устаканивания» в plan-canvas.js (см.
  // её инвариант) помогает только в первые 1.5с после монтирования — здесь же
  // осознанное ручное действие пользователя в ЛЮБОЙ момент, поэтому вписываем
  // явно, а не полагаемся на таймер.
  function fitToProject() {
    if (!V.canvas || !EP.Plan.Geometry || !core().project) return;
    const bb = EP.Plan.Geometry.projectBBox(core().project);
    if (bb) V.canvas.fit(bb);
  }

  // Вкладки инструментов: показать только кнопки активной группы. Кнопки БЕЗ
  // data-plan-grp (☝ Просмотр, 📐 Развёртка, ⛶ Вписать, разделители) видны всегда —
  // они нужны в любой задаче. hidden работает потому, что ни у .ep-plan-tbtn, ни у
  // .ep-plan-modesep нет авторского display (иначе UA-правило [hidden]{display:none}
  // проиграло бы по каскаду — тот же класс бага, что уже ловили у шторки/quickbar;
  // на всякий случай в plan.css добавлены явные [hidden]-правила).
  function applyToolGroup(root) {
    const r = root || document;
    r.querySelectorAll("[data-plan-grp]").forEach((n) => {
      n.hidden = (n.getAttribute("data-plan-grp") || "").split(/\s+/).indexOf(V.group) === -1;
    });
    r.querySelectorAll("[data-plan-group]").forEach((b) => {
      const on = b.getAttribute("data-plan-group") === V.group;
      b.classList.toggle("on", on);
      b.setAttribute("aria-pressed", on ? "true" : "false");
    });
    syncModesEdge(); // набор кнопок в ряду сменился — и признак прокрутки тоже
  }
  function setToolGroup(root, g) {
    if (g !== "build" && g !== "elec") return;
    V.group = g;
    try { localStorage.setItem(GROUP_KEY, g); } catch (e) {}
    applyToolGroup(root);
    // активный инструмент мог остаться из ДРУГОЙ вкладки (кнопка теперь скрыта — нечем
    // выйти из режима, и подсветка «где я» не видна) — возвращаемся в «Просмотр»
    const R2 = EP.Plan.Rooms;
    const cur = R2 && R2.currentMode ? R2.currentMode() : "view";
    const btn = document.querySelector(`[data-plan-mode="${cur}"]`);
    if (R2 && btn && btn.hidden) R2.setMode("view");
  }

  // свернуть/развернуть панель инструментов редактора — холст занимает освободившееся место
  // «1:1» — значки настенных приборов/блоков в РЕАЛЬНЫХ габаритах (мм, FRAME_MM в
  // plan-render.js) вместо постоянного размера на экране. При ВКЛЮЧЕНИИ дополнительно
  // ставим истинный масштаб вида (1 см проекта = 1 см на экране, CM_PER_PX_1TO1) —
  // просьба пользователя «чтобы в масштабе 1:1 смотреть»; при выключении зум не трогаем
  // (пользователь мог сам его подобрать). Точность 1:1 — на уровне соглашения CSS
  // (96 px = 1 дюйм): у части устройств физический размер может отличаться на несколько
  // процентов, поэтому в тосте это честно оговорено.
  // «📄» — бумажный режим ХОЛСТА: белый лист и тёмные линии независимо от темы
  // приложения, чтобы на экране было видно то же, что выйдет из принтера. Реализован
  // ЧИСТЫМ CSS (.ep-plan.is-paper в plan.css переиспользует ровно дневные правила
  // сцены — новых цветов не заводим, разъехаться им негде). Это настройка ВИДА, а не
  // проекта: живёт в localStorage устройства (как quickbar/вкладка инструментов), в
  // модель и undo-историю не попадает и на печать никак не влияет — PDF и так всегда
  // печатается на белом со своим самодостаточным <style>.
  const PAPER_KEY = "ep_plan_paper_v1";
  const paperOn = () => { try { return localStorage.getItem(PAPER_KEY) === "1"; } catch (e) { return false; } };
  function togglePaper(root) {
    const on = !paperOn();
    try { localStorage.setItem(PAPER_KEY, on ? "1" : "0"); } catch (e) {}
    applyPaper(root);
    if (EP.Plan.Rooms && EP.Plan.Rooms.toast) {
      EP.Plan.Rooms.toast(on ? "Бумажный режим: холст как печатный лист." : "Холст снова по теме приложения.");
    }
  }
  function applyPaper(root) {
    const r = root || document;
    const box = r.querySelector(".ep-plan");
    if (box) box.classList.toggle("is-paper", paperOn());
    const btn = r.querySelector("[data-plan-paper]");
    if (btn) { btn.classList.toggle("on", paperOn()); btn.setAttribute("aria-pressed", paperOn() ? "true" : "false"); }
  }
  function toggleRealScale(root) {
    const c = core(), p = c.project; if (!p) return;
    const on = !p.settings.realScale;
    c.commit();
    p.settings.realScale = on;
    c.persist("realscale");
    const btn = (root || document).querySelector("[data-plan-realscale]");
    if (btn) { btn.classList.toggle("on", on); btn.setAttribute("aria-pressed", on ? "true" : "false"); }
    if (on && V.canvas && V.canvas.setCmPerPx && EP.Plan.Render.CM_PER_PX_1TO1) {
      V.canvas.setCmPerPx(EP.Plan.Render.CM_PER_PX_1TO1);
    }
    if (EP.Plan.Rooms) {
      EP.Plan.Rooms.renderScene();
      if (EP.Plan.Rooms.toast) {
        EP.Plan.Rooms.toast(on
          ? "Реальный размер приборов (рамка 84 мм). Вид — 1:1, точность зависит от экрана."
          : "Значки снова постоянного размера на экране.");
      }
    }
  }
  function toggleTopCtrls(root) {
    V.ctrlsOn = !V.ctrlsOn;
    const box = root.querySelector(".ep-plan");
    if (box) box.classList.toggle("is-ctrls-collapsed", !V.ctrlsOn);
    const moreMenu = root.querySelector("#ep-plan-moremenu"); // кнопка-переключатель прячется вместе с панелью — само меню тоже
    if (moreMenu) moreMenu.hidden = true;
    const btn = root.querySelector("[data-plan-ctrls]");
    if (btn) {
      btn.textContent = V.ctrlsOn ? "︿" : "﹀";
      const lbl = V.ctrlsOn ? "Свернуть панель" : "Развернуть панель";
      btn.setAttribute("aria-label", lbl); btn.setAttribute("title", lbl);
    }
    fitToProject();
    if (V.canvas && V.canvas.redraw) V.canvas.redraw();
    // Плавающая quickbar раньше пряталась ТОЛЬКО по режиму (view/не-view) — если
    // панель инструментов свёрнута, никакого другого способа сменить
    // режим/отменить/вписать не остаётся вообще, поэтому quickbar теперь должна
    // быть видна и в режиме «Просмотр», пока панель свёрнута (см. её видимость в
    // plan-rooms.js setMode()/syncQuickbarVisibility()).
    if (EP.Plan.Rooms && EP.Plan.Rooms.syncQuickbarVisibility) EP.Plan.Rooms.syncQuickbarVisibility();
  }

  function mountCanvas() {
    const host = $("#ep-plan-canvas");
    if (!host || !EP.Plan.Canvas) return;
    if (V.canvas) { try { V.canvas.destroy(); } catch (e) {} }
    V.canvas = EP.Plan.Canvas.create(host);
    if (EP.Plan.Rooms) EP.Plan.Rooms.attach(V.canvas);
    // Холст не прокручивается НИКОГДА. У него overflow:hidden, а такой блок всё равно
    // прокручивается программно: браузер, показывая поле ввода в шторке (фокус), и
    // scrollIntoView сдвигали ВСЁ содержимое холста вверх — план и шторка уезжали, внизу
    // оставалась пустая полоса, пока что-нибудь не перерисует экран (поймано замером:
    // scrollTop холста 81 px). В CSS — overflow:clip (такой блок прокрутить нельзя вовсе);
    // где clip не поддерживается (старый Safari) — сбрасываем прокрутку тут же.
    if (!host.__epNoScroll) {
      host.__epNoScroll = true;
      host.addEventListener("scroll", () => { if (host.scrollTop || host.scrollLeft) { host.scrollTop = 0; host.scrollLeft = 0; } }, { passive: true });
    }
    fitToProject();
    V.canvas.redraw();
    // Повторный «пустой холст снизу» (репорт пользователя, скриншот: пустота внизу
    // экрана, «пропадает когда нажму во весь экран и выйду») — тот же класс, что и
    // ранее исправленный timing race 100dvh/.ep-plan-svg, просто на этот раз не
    // самокорректировался ЧЕРЕЗ ResizeObserver в течение settle-окна (см. plan-canvas.js)
    // — вероятно, на конкретном устройстве переход в true-fullscreen PWA (или просто
    // компоновка после смены на компактный тулбар) занимает больше времени, чем окно
    // устаканивания. toggleFullscreen() чинит это ОДНИМ явным вызовом fitToProject()
    // — тот же вызов теперь повторяем САМИ ещё дважды с задержкой (без участия
    // пользователя), той же логикой, что и ручной тоггл. myCanvas-замыкание защищает
    // от срабатывания на УЖЕ пересозданном/уничтоженном канвасе (быстрый повторный
    // заход в проект/выход из него до истечения таймера).
    const myCanvas = V.canvas;
    [400, 1200, 2500].forEach((ms) => {
      setTimeout(() => {
        if (V.canvas !== myCanvas) return;
        // повторяем И syncPlanBoxHeight (не только fitToProject) — та же гонка может
        // задержать САМО измерение window.innerHeight/visualViewport.height на конкретном
        // устройстве, не только подгонку viewBox под уже готовый контейнер.
        syncPlanBoxHeight();
        // пользователь УЖЕ сам зумил/панорамировал — не перебиваем его вид
        // авто-вписыванием (иначе вид «отпрыгивал» через ~секунду, если начать
        // зумить сразу после открытия проекта — пойман визуальным тестом)
        if (myCanvas.userAdjustedView && myCanvas.userAdjustedView()) return;
        // и если уже начал работать (тапнул комнату, тянет стену) — вид под пальцем не прыгает
        if (myCanvas.userInteracted && myCanvas.userInteracted()) return;
        fitToProject();
        myCanvas.redraw();
      }, ms);
    });
  }

  function refreshToolbar() {
    const c = core();
    // querySelectorAll — undo/redo дублируются в плавающей quickbar-панели (《/》),
    // оба места должны гаснуть вместе
    document.querySelectorAll("[data-plan-undo]").forEach((b) => { b.disabled = !c.canUndo(); });
    document.querySelectorAll("[data-plan-redo]").forEach((b) => { b.disabled = !c.canRedo(); });
    const note = $("#ep-plan-savenote");
    if (note) note.textContent = V.saveNote;
    refreshReady();
    refreshRouteStatus();
  }
  // чип статуса трасс (аудит 11.11, пакет 5): актуальны ли трассы и смета прямо сейчас —
  // «✓ Трассы» / «↻ Пересчёт» / «⚠ Разрыв N» / «⛔ Конфликт N». Тап — шторка «Трассы»,
  // где та же строка развёрнута и есть кнопка пересчёта
  const RST_SHORT = { ok: "✓ Трассы", busy: "⏳ Пересчёт", stale: "↻ Пересчёт", gap: "⚠ Разрыв", conflict: "⛔ Конфликт" };
  function refreshRouteStatus() {
    const chip = $("#ep-plan-rstat"), p = core().project, RT = EP.Plan.Routes;
    if (!chip) return;
    const st = (p && RT && RT.routeStatus) ? RT.routeStatus(p) : { code: "none" };
    chip.hidden = st.code === "none";
    if (chip.hidden) return;
    chip.className = "ep-plan-rstat ep-clickable is-" + st.code;
    chip.textContent = RST_SHORT[st.code] + (st.n ? " " + st.n : "");
    chip.setAttribute("aria-label", st.text);
    chip.title = st.text;
  }
  // чип «Готовность N%» — только в режиме монтажника (там он и нужен); считается по
  // статусам точек и отметкам задач (EP.Plan.Work.readiness — без пересчёта сметы, дёшево)
  function refreshReady() {
    const chip = $("#ep-plan-ready"), p = core().project;
    const on = !!(EP.Plan.Rooms && EP.Plan.Rooms.montageOn && EP.Plan.Rooms.montageOn());
    if (!chip) return;
    chip.hidden = !(on && p && EP.Plan.Work);
    if (!chip.hidden) chip.textContent = "Готовность " + EP.Plan.Work.readyLabel(p);
  }
  function toggleMontage(root) {
    const R = EP.Plan.Rooms; if (!R || !R.setMontage) return;
    const on = !R.montageOn();
    R.setMontage(on);
    const btn = (root || document).querySelector("[data-plan-montage]");
    if (btn) btn.classList.toggle("on", on);
    refreshReady();
    if (R.toast) R.toast(on ? "Режим монтажника: размеры и мебель скрыты, тап по точке — её статус (○ ◐ ✓)." : "Режим проектирования.");
  }

  // ---------- действия ----------
  // Чипы «Ведём силу по» / «Монтаж по потолку» в форме создания — тоглятся прямо в
  // DOM (форма статична, без ре-рендера): подсветка активного + скрытие блока
  // «Монтаж по потолку» при выборе «полу» (по полу способ монтажа не спрашиваем —
  // расходка всегда гофра+лента, см. EP.CableConsum).
  function pickNewRoute(root, rt) {
    const seg = root.querySelector("[data-plan-newroute]"); if (!seg) return;
    seg.setAttribute("data-plan-newroute", rt);
    seg.querySelectorAll("[data-plan-rt]").forEach((b) => b.classList.toggle("on", b.getAttribute("data-plan-rt") === rt));
    const mount = root.querySelector("[data-plan-newmount]");
    if (mount) mount.style.display = rt === "floor" ? "none" : "";
  }
  function pickNewMount(root, mt) {
    const seg = root.querySelector("[data-plan-newmount]"); if (!seg) return;
    seg.setAttribute("data-plan-newmount", mt);
    seg.querySelectorAll("[data-plan-mt]").forEach((b) => b.classList.toggle("on", b.getAttribute("data-plan-mt") === mt));
  }
  function doCreate(root) {
    const inp = $("#ep-plan-name");
    const ceilInp = $("#ep-plan-ceil");
    const routeSeg = root.querySelector("[data-plan-newroute]");
    const mountSeg = root.querySelector("[data-plan-newmount]");
    const opts = {
      ceilingHeight: ceilInp ? Number(ceilInp.value) : DEFAULTS_CEIL,
      routeType: routeSeg ? routeSeg.getAttribute("data-plan-newroute") : "ceiling",
      gofraCeil: mountSeg ? mountSeg.getAttribute("data-plan-newmount") !== "0" : true
    };
    core().createProject(inp ? inp.value : "", opts);
    renderEditor(root);
  }
  async function doOpen(root, id) {
    const p = await core().openProject(id);
    if (p) renderEditor(root);
  }
  // ручное «⟳ Обновить»: тянет индекс проектов из облака и перерисовывает список.
  // Автоматически он тянется один раз при входе (EP.Cloud.onLogin) — эта кнопка нужна,
  // когда правку сделали на другом устройстве уже ПОСЛЕ открытия списка здесь.
  async function doSync(root, btn) {
    if (!core().cloudReady()) { alert(T.syncNone); return; }
    const prev = btn.textContent;
    btn.textContent = T.syncing; btn.disabled = true;
    try { await core().cloudPullIndex(); } catch (e) {}
    btn.disabled = false; btn.textContent = prev;
    renderList(root);
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
    const done = () => { core().renameProject(inp.value); const t = $(".ep-plan-title"); if (t) t.innerHTML = titleHtml(core().project); };
    inp.addEventListener("keydown", (e) => { if (e.key === "Enter") inp.blur(); });
    inp.addEventListener("blur", done);
    inp.focus(); inp.select();
  }
  // ---------- этажи ----------
  // Чипы этажей — ВСЕГДА видны (даже с одним этажом), чтобы «+ Этаж» был на виду
  // и пользователь вообще узнал о фиче. Переключение — 1 тап по чипу; управление
  // (переименовать/удалить/добавить) — отдельная кнопка «✎ Этажи» → шторка со
  // списком (тот же rooms().openSheet(), что и у остальных редакторов модуля).
  function floorsBarHtml(p) {
    const floors = p.floors || [];
    return `<div class="ep-plan-toolbar ep-plan-floors" id="ep-plan-floors">
      ${floors.map((f) => `<button type="button" class="ep-plan-chip ep-clickable ${f.id === p.activeFloorId ? "on" : ""}" data-plan-floor="${esc(f.id)}">${esc(f.name)}</button>`).join("")}
      <button type="button" class="ep-plan-mini ep-clickable" data-plan-floors-manage aria-label="Управление этажами" title="Добавить/переименовать/удалить этаж">✎ Этажи</button>
    </div>`;
  }
  function refreshFloorsBar() {
    const p = core().project; if (!p) return;
    const el = $("#ep-plan-floors");
    if (el) el.outerHTML = floorsBarHtml(p);
  }
  // Выйти из инструмента ДО того, как сменится проект или этаж: незаконченная магистраль (⇉)
  // сохраняется туда, где её рисовали (setMode). Раньше этаж/проект менялся первым, и черновик
  // тихо пропадал — сохранять его было уже некуда.
  function leaveMode() {
    const R3 = EP.Plan.Rooms;
    if (R3 && R3.currentMode && R3.currentMode() !== "view") R3.setMode("view");
  }
  function doSwitchFloor(id) {
    leaveMode();
    core().setActiveFloor(id);
    if (EP.Plan.Rooms) EP.Plan.Rooms.setMode("view"); // прошлая шторка/режим — с чужого этажа, закрываем
  }
  // высота этажа по умолчанию — потолок + перекрытие (та же формула, что в
  // plan-routes.js floorHeight; тут только для подсказки/плейсхолдера)
  function defFloorH(p) {
    const s = p.settings || {};
    return Math.round((s.ceilingHeight || 270) + (s.slabThickness == null ? 20 : s.slabThickness));
  }
  function doFloors() {
    const c = core(), p = c.project; if (!p) return;
    const rooms = EP.Plan.Rooms; if (!rooms) return;
    rooms.openSheet(`<div class="ep-plan-srow"><b>🏢 Этажи</b><span class="ep-plan-flex"></span><button type="button" class="ep-plan-mini ep-clickable" data-plan-floors-close>✕</button></div>
      ${p.floors.map((f) => `<div class="ep-plan-srow">
        <input type="text" class="ep-plan-flex" data-plan-floor-rn="${esc(f.id)}" value="${esc(f.name)}" maxlength="40">
        <label class="ep-plan-flh">Высота, см<input type="number" inputmode="numeric" min="0" max="2000" placeholder="${defFloorH(p)}" data-plan-floor-h="${esc(f.id)}" value="${f.height > 0 ? Math.round(f.height) : ""}"></label>
        ${p.floors.length > 1 ? `<button type="button" class="ep-plan-mini ep-plan-danger ep-clickable" data-plan-floor-del="${esc(f.id)}" aria-label="Удалить этаж ${esc(f.name)}">✕</button>` : ""}
      </div>`).join("")}
      <div class="ep-plan-srow ep-plan-sbtns"><button type="button" class="ep-plan-tbtn ep-clickable" data-plan-floor-add>+ Добавить этаж</button></div>
      <div class="ep-plan-modehint">Высота этажа (от пола до пола) нужна для вертикали кабеля в СТОЯКЕ («СТ») между этажами; пусто — потолок + перекрытие (${defFloorH(p)} см). Этаж без своего щита питается через стояк: поставь точку «Стояк» на обоих этажах и свяжи их в редакторе точки. Удаление этажа стирает всё его содержимое (комнаты, точки, трассы) безвозвратно.</div>`);
  }
  function doMeta() {
    const c = core(), p = c.project; if (!p) return;
    const rooms = EP.Plan.Rooms; if (!rooms) return;
    rooms.openSheet(`<div class="ep-plan-srow"><b>${T.metaTitle}</b><span class="ep-plan-flex"></span><button type="button" class="ep-plan-mini ep-clickable" data-plan-meta-close>✕</button></div>
      <div class="ep-plan-srow"><label style="flex:1">${T.metaClient}<input type="text" id="ep-plan-meta-client" value="${esc(p.client || "")}" placeholder="Иванов И.И."></label></div>
      <div class="ep-plan-srow"><label style="flex:1">${T.metaAddress}<input type="text" id="ep-plan-meta-addr" value="${esc(p.address || "")}" placeholder="г. Москва, ул. …, д. …, кв. …"></label></div>
      <div class="ep-plan-srow"><label style="flex:1">${T.metaCeil}<input type="number" inputmode="numeric" min="150" max="600" id="ep-plan-meta-ceil" value="${esc(p.settings.ceilingHeight || 270)}"></label></div>
      <div class="ep-plan-modehint">Высота потолка проекта — база для вертикалей трасс и расчёта кабеля. У отдельной комнаты можно задать свою высоту в её карточке.</div>
      <div class="ep-plan-srow"><label style="flex:1">Север, ° (для 3D-прогулки)<input type="number" inputmode="numeric" min="0" max="359" id="ep-plan-meta-north" value="${esc(p.settings.northDeg || 0)}"></label></div>
      <div class="ep-plan-modehint">Куда смотрит север относительно ВЕРХА плана: 0° — вверх, 90° — вправо. По нему в 🚶 3D солнце светит в окна с правильной стороны.</div>
      <div class="ep-plan-srow"><b>Основная надпись (штамп PDF)</b></div>
      <div class="ep-plan-srow ep-plan-s2">
        <label>Шифр документа<input type="text" id="ep-plan-meta-code" value="${esc(p.docCode || "")}" placeholder="074/1/26"></label>
        <label>Стадия<input type="text" id="ep-plan-meta-stage" value="${esc(p.stage || "Р")}" placeholder="Р" maxlength="3"></label>
      </div>
      <div class="ep-plan-srow ep-plan-s2">
        <label>Марка комплекта<input type="text" id="ep-plan-meta-mark" value="${esc(p.mark == null ? "ЭОМ" : p.mark)}" placeholder="ЭОМ" maxlength="6"></label>
        <label>ГИП<input type="text" id="ep-plan-meta-gip" value="${esc(p.gip || "")}" placeholder="Фамилия"></label>
      </div>
      <div class="ep-plan-srow ep-plan-s2">
        <label>Организация<input type="text" id="ep-plan-meta-org" value="${esc(p.org || "")}" placeholder="Название"></label>
      </div>
      <div class="ep-plan-modehint">Эти графы печатаются в основной надписи каждого листа PDF (ГОСТ Р 21.101). Марка комплекта (ЭОМ — силовое, ЭО — освещение, ЭОМС — вместе, СС — слаботочка) подставляет наименование раздела и приписывается к шифру, если её там ещё нет. Пустые графы — просто не заполняются.</div>`);
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
      rd.onload = () => { leaveMode(); if (core().importJSON(String(rd.result || ""))) renderEditor(root); };
      rd.readAsText(file);
    };
    f.click();
  }

  // ---------- события ----------
  function root() { return document.getElementById("ep-plan-root"); }

  // «⋯» — редко нужные действия (PDF/Экспорт/Импорт/Шаблон), спрятанные из
  // основной ленты (просьба пользователя сделать панель компактнее). Позиция —
  // JS-расчёт от getBoundingClientRect() кнопки (та же техника, что и у
  // #ep-plan-qmenu в plan-rooms.js), т.к. меню НЕ вложено в горизонтально
  // скроллящуюся .ep-plan-compactrow (иначе overflow-x:auto той обрезал бы
  // всплывающее меню — см. комментарий в plan.css).
  function toggleMoreMenu(btn) {
    const m = document.getElementById("ep-plan-moremenu");
    if (!m) return;
    if (!m.hidden) { m.hidden = true; return; }
    const r = btn.getBoundingClientRect();
    m.style.position = "fixed";
    m.style.top = (r.bottom + 6) + "px";
    m.style.right = Math.max(6, window.innerWidth - r.right) + "px";
    m.style.left = "auto";
    m.hidden = false;
  }
  document.addEventListener("click", (e) => {
    const r = root(); if (!r || !V.active) return;
    const t = e.target; let el;
    // закрыть «⋯»-меню на ЛЮБОЙ клик, кроме самой кнопки-переключателя (она
    // сама решает открыть/закрыть ниже) — и по клику на пункт меню (выбор
    // действия), и по клику мимо (обычный паттерн выпадающего меню)
    const moreMenu = document.getElementById("ep-plan-moremenu");
    if (moreMenu && !moreMenu.hidden && !t.closest("[data-plan-more]")) moreMenu.hidden = true;
    if ((el = t.closest("[data-plan-more]"))) return toggleMoreMenu(el);
    // меню ⋮ узкой шапки — так же: любой клик, кроме самой кнопки, его закрывает (пункт меню
    // при этом срабатывает ниже как обычно)
    if (!t.closest("[data-plan-topx]")) closeTopX();
    if (t.closest("[data-plan-topx]")) return toggleTopX();
    if ((el = t.closest("[data-plan-group]"))) return setToolGroup(r, el.getAttribute("data-plan-group"));
    if ((el = t.closest("[data-plan-rt]"))) return pickNewRoute(r, el.getAttribute("data-plan-rt"));
    if ((el = t.closest("[data-plan-mt]"))) return pickNewMount(r, el.getAttribute("data-plan-mt"));
    if ((el = t.closest("[data-plan-create]"))) return doCreate(r);
    if ((el = t.closest("[data-plan-open]"))) return void doOpen(r, el.getAttribute("data-plan-open"));
    if ((el = t.closest("[data-plan-del]"))) return doDelete(r, el.getAttribute("data-plan-del"));
    if (t.closest("[data-plan-back]")) {
      leaveMode(); // незаконченная магистраль — в ЭТОТ проект, а не в никуда
      core().closeProject(); return renderList(r);
    }
    if (t.closest("[data-plan-ctrls]")) return toggleTopCtrls(r);
    if (t.closest("[data-plan-paper]")) return togglePaper(r);
    if (t.closest("[data-plan-montage]")) return toggleMontage(r);
    if (t.closest("[data-plan-realscale]")) return toggleRealScale(r);
    if (t.closest("[data-plan-rename]")) return doRename();
    if (t.closest("[data-plan-meta]")) return doMeta();
    if (t.closest("[data-plan-meta-close]")) { EP.Plan.Rooms.closeSheet(); return; }
    if (t.closest("[data-plan-undo]")) { core().undo(); return; }
    if (t.closest("[data-plan-redo]")) { core().redo(); return; }
    if (t.closest("[data-plan-export]")) return doExport();
    if (t.closest("[data-plan-dxf]")) { if (EP.Plan.Dxf) EP.Plan.Dxf.sheet(); return; }
    if (t.closest("[data-plan-import]")) return doImport(r);
    if ((el = t.closest("[data-plan-sync]"))) return void doSync(r, el);
    if (t.closest("[data-plan-full]")) return toggleFullscreen(r);
    if ((el = t.closest("[data-plan-floor]"))) return doSwitchFloor(el.getAttribute("data-plan-floor"));
    if (t.closest("[data-plan-floors-manage]")) return doFloors();
    if (t.closest("[data-plan-floors-close]")) { EP.Plan.Rooms.closeSheet(); return; }
    if (t.closest("[data-plan-floor-add]")) { core().addFloor(); doFloors(); return; }
    if ((el = t.closest("[data-plan-floor-del]"))) {
      const p = core().project, f = p && (p.floors || []).find((x) => x.id === el.getAttribute("data-plan-floor-del"));
      if (f && confirm(`Удалить «${f.name}» со всем содержимым?`)) { core().deleteFloor(f.id); doFloors(); }
      return;
    }
  });

  // Во весь экран главного редактора: ЧИСТЫЙ CSS (position:fixed, см. plan.css
  // .ep-plan.is-full) — БЕЗ нативного Fullscreen API. Раньше здесь звался
  // box.requestFullscreen()/exitFullscreen(), но нативный Fullscreen API
  // невозможно "запереть" только на свою кнопку — браузер ВСЕГДА позволяет
  // выйти из него по Esc/системному жесту «назад» в обход любой логики
  // страницы (это гарантия самого API, не обойти). Пользователь явно попросил:
  // «снималась ТОЛЬКО нажатием данной кнопки, ни кнопками назад и т.д.» —
  // единственный надёжный способ дать эту гарантию — вообще не отдавать
  // управление нативному API. Тот же приём уже стоял у шторок (⛶ у Расчёта/
  // Трасс/Слоёв — см. инвариант «Во весь экран шторок») и у 🔄-развёртки
  // (position:fixed без screen.orientation.lock). ЦЕНА: браузерный chrome
  // (адресная строка) теперь не скрывается, как скрывал бы настоящий
  // Fullscreen API — сознательный компромисс ради предсказуемости закрытия.
  // При входе в fullscreen панель инструментов сворачивается автоматически —
  // просьба пользователя («хотел бы что бы оно всплывало когда во весь экран
  // раскрываю», про плавающую quickbar снизу холста): у крупного тулбара (шапка+
  // этажи+2 ряда режимов) на реальном телефоне остаётся так мало места, что холст
  // (и quickbar на нём, привязанная к его низу) может оказаться ниже видимой
  // области fullscreen — тот же самый экран, что и должен максимально освобождать
  // место под рисование. Прежнее состояние панели запоминается и восстанавливается
  // при выходе — если пользователь сам её не разворачивал, сама панель по-прежнему
  // сворачивается/разворачивается вручную (︿/﹀) независимо от fullscreen.
  let ctrlsWasOnBeforeFull = null;
  function toggleFullscreen(r) {
    const box = r.querySelector(".ep-plan");
    if (!box) return;
    const enteringFull = !box.classList.contains("is-full");
    box.classList.toggle("is-full");
    if (enteringFull) {
      // is-full сам position:fixed;inset:0 с height:auto (plan.css) — инлайн-высота
      // от syncPlanBoxHeight() (пиксельное значение) победила бы это auto по
      // специфичности и осталась бы висеть поверх фиксированного вьюпорта; очищаем,
      // чтобы CSS is-full полноценно взял на себя размер.
      box.style.height = "";
      box.style.minHeight = "";
      ctrlsWasOnBeforeFull = V.ctrlsOn;
      if (V.ctrlsOn) toggleTopCtrls(r); // уже сам вписывает + синхронизирует quickbar
      else fitToProject(); // панель и так была свёрнута — вписываем явно под сам fullscreen
    } else if (ctrlsWasOnBeforeFull != null) {
      // выход из fullscreen — пересчитываем инлайн-высоту ЯВНО (см. syncPlanBoxHeight):
      // сам возврат в обычный (не fixed) поток не обязательно даёт window.innerHeight
      // native "resize" (высота окна физически не менялась, менялась только раскладка
      // ВНУТРИ страницы) — событие resize могло бы не сработать вообще.
      syncPlanBoxHeight();
      if (V.ctrlsOn !== ctrlsWasOnBeforeFull) toggleTopCtrls(r);
      else fitToProject(); // состояние панели не менялось — холст всё равно сменил размер
      ctrlsWasOnBeforeFull = null;
    }
    // toggleTopCtrls() выше уже сам синхронизирует quickbar, НО обе ветки "else"
    // (панель и до этого была свёрнута — ни при входе, ни при выходе она не
    // меняется) идут В ОБХОД toggleTopCtrls() и раньше НЕ обновляли видимость
    // quickbar вообще — репорт пользователя со скриншотом: «во весь экран нажал,
    // а панель (быстрый выбор) не вылезла» именно в этом случае (панель
    // инструментов уже была свёрнута ДО входа в fullscreen). Зовём безусловно и
    // ещё раз здесь — идемпотентно, лишним вызовом не вредит.
    if (EP.Plan.Rooms && EP.Plan.Rooms.syncQuickbarVisibility) EP.Plan.Rooms.syncQuickbarVisibility();
  }
  document.addEventListener("input", (e) => {
    const r = root(); if (!r || !V.active) return;
    const t = e.target, c = core(); if (!c.project) return;
    if (t.id === "ep-plan-meta-client") { c.project.client = t.value; c.persist("meta-client"); }
    else if (t.id === "ep-plan-meta-addr") { c.project.address = t.value; c.persist("meta-addr"); }
    else if (t.id === "ep-plan-meta-ceil") { const v = Math.round(Number(t.value)); if (v >= 150 && v <= 600) { c.project.settings.ceilingHeight = v; c.persist("meta-ceil"); } }
    // графы основной надписи PDF — сохраняются на "input" БЕЗ commit(), как клиент/адрес
    // (иначе каждая набранная буква плодила бы снимок undo)
    else if (t.id === "ep-plan-meta-north") { const v = Math.round(Number(t.value)); if (v >= 0 && v <= 359) { c.project.settings.northDeg = v; c.persist("meta-north"); } }
    else if (t.id === "ep-plan-meta-code") { c.project.docCode = t.value; c.persist("meta-code"); }
    else if (t.id === "ep-plan-meta-mark") { c.project.mark = t.value; c.persist("meta-mark"); }
    else if (t.id === "ep-plan-meta-stage") { c.project.stage = t.value; c.persist("meta-stage"); }
    else if (t.id === "ep-plan-meta-gip") { c.project.gip = t.value; c.persist("meta-gip"); }
    else if (t.id === "ep-plan-meta-org") { c.project.org = t.value; c.persist("meta-org"); }
    else if (t.hasAttribute("data-plan-floor-rn")) {
      // без commit() — как gtitle/lname в ручной схеме: не плодить undo-снапшот на каждую букву
      const f = (c.project.floors || []).find((x) => x.id === t.getAttribute("data-plan-floor-rn"));
      if (f) { f.name = t.value; c.persist("floor-rename-live"); refreshFloorsBar(); }
    }
  });
  // Высота этажа — на "change", а НЕ на "input": setFloorHeight делает commit()
  // (снимок undo), и на каждую набранную цифру плодить историю не нужно.
  document.addEventListener("change", (e) => {
    const r = root(); if (!r || !V.active) return;
    const t = e.target, c = core(); if (!c.project || !t.hasAttribute || !t.hasAttribute("data-plan-floor-h")) return;
    c.setFloorHeight(t.getAttribute("data-plan-floor-h"), t.value);
  });
  // Главный редактор БОЛЬШЕ НЕ запрашивает нативный Fullscreen API (см.
  // toggleFullscreen выше) — .ep-plan.is-full теперь ЧИСТО CSS-состояние,
  // не завязанное на document.fullscreenElement, поэтому реагировать на
  // fullscreenchange здесь больше не на что: слушатель, что раньше снимал
  // is-full при ЛЮБОМ выходе из нативного fullscreen (в т.ч. чужого — Esc
  // после fullscreen Развёртки/Схемы), удалён целиком — иначе он бы ошибочно
  // гасил is-full редактора при выходе ИЗ ЧУЖОГО fullscreen.

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
    // Полный экран ГЛАВНОГО редактора (fullBox) больше НЕ закрывается «назад» —
    // прямая просьба пользователя: снимается только повторным нажатием кнопки
    // ⤢. Полностью глотаем нажатие (только перевзводим ловушку), не давая ему
    // провалиться ни в закрытие шторки/режима, ни тем более в закрытие проекта.
    if (fullBox) { armBack(); return; }
    if (sh) sh.classList.remove("ep-plan-sheet-full");
    if (EP.Plan.Unfold && EP.Plan.Unfold.isOpen()) { EP.Plan.Unfold.close(); if (R2) R2.closeSheet(); armBack(); return; }
    if (sheetOpen || mode !== "view") { if (R2) R2.setMode("view"); armBack(); return; }
    // внутри планировки ничего не открыто — возвращаемся к списку проектов (не выходим)
    core().closeProject(); if (r) renderList(r);
  });

  // Реальные изменения видимой области (адресная строка, поворот экрана) — держим
  // .ep-plan синхронной высотой ВСЕГДА, не только при монтировании/fullscreen (см.
  // инвариант syncPlanBoxHeight выше). window.resize у части мобильных браузеров не
  // срабатывает надёжно на чистое сворачивание/разворачивание адресной строки без
  // изменения window.innerWidth — visualViewport.resize специально для этого.
  window.addEventListener("resize", () => { if (V.active) syncPlanBoxHeight(); });
  window.addEventListener("orientationchange", () => { if (V.active) syncPlanBoxHeight(); });
  if (window.visualViewport) window.visualViewport.addEventListener("resize", () => { if (V.active) syncPlanBoxHeight(); });
  // клавиатура закрылась (kb=0) — вернуть холсту полную высоту (пока она была открыта,
  // syncPlanBoxHeight() намеренно ничего не делал, см. гвард выше); порядок важен —
  // keyboard-inset.js снимает body[data-kb] ДО того, как шлёт событие, поэтому к моменту
  // пересчёта шторка уже вернулась к своему обычному положению
  window.addEventListener("ep:keyboard", (e) => {
    if (!V.active) return;
    if (!e.detail || !e.detail.kb) syncPlanBoxHeight();
    if (EP.Plan.Rooms && EP.Plan.Rooms.placeSheetBtn) EP.Plan.Rooms.placeSheetBtn();
  });

  /* Фокус в поле ввода текста — Ctrl/Cmd+Z отменяет набранный ТЕКСТ (штатно, браузер), а не
     правку плана (аудит Астры, п. 8). Раньше глобальный обработчик откатывал геометрию и глушил
     отмену текста: дописал « тест» в названии, нажал Ctrl+Z — комната уехала назад, а «Гостиная
     тест» осталось в поле. Галочки, кнопки, ползунки текста не держат — там Ctrl+Z, как и на
     холсте, отменяет правку плана. */
  const NOT_TEXT = ["checkbox", "radio", "button", "submit", "reset", "range", "color", "file", "image"];
  function isTextEditable(n) {
    if (!n || !n.tagName) return false;
    if (n.isContentEditable) return true;
    const tg = String(n.tagName).toLowerCase();
    if (tg === "textarea") return true;
    if (tg !== "input") return false;
    return NOT_TEXT.indexOf(String(n.getAttribute("type") || "text").toLowerCase()) < 0;
  }
  document.addEventListener("keydown", (e) => {
    if (!V.active || !core().project) return;
    const z = (e.ctrlKey || e.metaKey) && (e.key === "z" || e.key === "Z" || e.key === "я" || e.key === "Я");
    if (!z) return;
    if (isTextEditable(e.target) || isTextEditable(document.activeElement)) return; // отмена текста — браузеру
    e.preventDefault();
    if (e.shiftKey) core().redo(); else core().undo();
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
        // открытая карточка объекта — по новой модели (или закрыть, если объекта нет): иначе
        // форма показывает отменённое, и ✓ вернул бы его обратно (аудит Астры, п. 6)
        if (EP.Plan.Rooms.refreshSheetObj) EP.Plan.Rooms.refreshSheetObj();
      }
      if (what === "floor-switch" || what === "floor-add" || what === "floor-del") {
        refreshFloorsBar();
        if (EP.Plan.Rooms) EP.Plan.Rooms.renderScene(); // сменился набор видимой геометрии — перерисовать холст
      } else if (what === "floor-rename" || what === "floor-rename-live") {
        refreshFloorsBar();
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
  // fitToProject экспортируется ради модулей, которые ВСТАВЛЯЮТ геометрию правее уже
  // нарисованного (шаблоны, общая база контуров) — без «вписать» вставленное ложится за
  // краем экрана, и пользователю кажется, что ничего не произошло.
  EP.Plan.Mount = { mount, T, ctrlsOn: () => V.ctrlsOn, fitToProject };
})();
