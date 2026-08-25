/* Electric Pro V29 — «Ввести цены работ в БД» (первый запуск после одобрения админом).
   Просьба пользователя: «при первом включении после регистрации, когда админ одобрил,
   чтобы была кнопка (ввести данные в бд), и там были все работы, которые могут быть в
   автоматическом режиме, без цен — ввести стоимость, и они занеслись в бд».

   ЗАЧЕМ: «Моя БД» у нового мастера пустая, поэтому ВЕСЬ автоматический расчёт (Расчёт в
   «Проекте квартиры», Пул, смета) показывает «нет цены в БД» — цены приходилось назначать
   по одной, натыкаясь на них в процессе. Здесь тот же набор позиций даётся СПИСКОМ заранее.

   КЛЮЧЕВОЕ: названия в каталоге ОБЯЗАНЫ совпадать с тем, что реально генерируют движки
   (plan-calc.js calcByRoutes / pool-engine-v29.js), иначе priceFor() их не найдёт и вся
   затея бессмысленна. Поэтому каталог строится НЕ из литералов, а из тех же DEFAULTS
   (материалы, сечение штробы, диаметр гильзы), что читают движки — сменится дефолт,
   сменится и каталог. priceFor() ищет точное совпадение, иначе двунаправленную подстроку
   — поэтому одна строка «Прокладка кабеля» покрывает все марки кабеля разом. */
(() => {
  "use strict";
  window.EP = window.EP || {};

  const KEY = "ep_price_setup_v1";           // "done" | "later" — состояние подсказки на главной
  const CAT = "Проект квартиры";              // та же категория, что пишет sheetSetPrice в plan-calc.js
  const SUB = "Работы";                       //  — чтобы цены не расползались по двум папкам

  const esc = (s) => String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const D = () => window.EP.Database;
  const PD = () => (window.EP.Plan && window.EP.Plan.Core && window.EP.Plan.Core.DEFAULTS) || null;

  // ---------- каталог автоматических работ ----------
  // Материалы: 4 основных (ими считают ОБА движка — plan-calc и pool-engine) + материалы
  // перегородок, которые тоже попадают в названия, если в проекте есть ГКЛ/ПГП/газоблок.
  // Перегородочные вынесены в отдельную группу и по умолчанию свёрнуты — на первом запуске
  // важнее быстро закрыть основное, а не заполнить 60 полей.
  // ВСЕ материалы, которые вообще могут попасть в названия работ: стены комнат
  // (DEFAULTS.materials) + перегородки (DEFAULTS.partitionMaterials).
  function allMaterials() {
    const d = PD();
    const base = (d && d.materials) || ["Бетон", "Кирпич", "Панель", "Мягкий"];
    const part = (d && d.partitionMaterials) || [];
    const seen = {}, out = [];
    base.concat(part).forEach((m) => {
      const k = String(m).toLowerCase();
      if (!seen[k]) { seen[k] = 1; out.push(m); }
    });
    return out;
  }
  // С какими материалами мастер реально работает (просьба пользователя: «материалы —
  // часто работаю с бетоном, панелькой и т.д.»). Раньше в счётчик шли ВСЕ материалы
  // стен, и у мастера, который кирпич и «мягкий» не видит годами, «осталось без цены»
  // не дошло бы до нуля никогда — счётчик зря мозолил бы глаза. Выбор — свойство
  // УСТРОЙСТВА (как остальные настройки этого экрана), не проекта.
  const MATS_KEY = "ep_price_mats_v1";
  function pickedMaterials() {
    let saved = null;
    try { saved = JSON.parse(localStorage.getItem(MATS_KEY) || "null"); } catch (e) { saved = null; }
    const all = allMaterials();
    if (Array.isArray(saved) && saved.length) {
      const keep = all.filter((m) => saved.some((x) => String(x).toLowerCase() === String(m).toLowerCase()));
      if (keep.length) return keep;      // пустой/битый список — молча падаем на дефолт
    }
    const d = PD();
    return (d && d.materials) || ["Бетон", "Кирпич", "Панель", "Мягкий"];
  }
  function setMaterials(list) {
    try { localStorage.setItem(MATS_KEY, JSON.stringify(list || [])); } catch (e) {}
  }
  const chaseStd = () => { const d = PD(); return (d ? d.chaseW : 25) + "x" + (d ? d.chaseH : 30); };
  const chaseWarm = () => { const d = PD(); return (d ? d.tpChaseW : 50) + "x" + (d ? d.tpChaseH : 50); };
  const sleeveD = () => { const d = PD(); return (d && d.sleeveD) || 20; };

  // По материалу — те же шаблоны имён, что в calcByRoutes. Регистр на СОВПАДЕНИЕ не
  // влияет (priceFor сравнивает через priceNorm, а он приводит к нижнему), но материал
  // всё равно пишем строчными — движок выводит его через low(mat), и мастер должен
  // видеть в каталоге РОВНО ту строку, которую потом встретит в смете.
  function byMaterial(mats) {
    const out = [];
    const st = chaseStd(), warm = chaseWarm(), sd = sleeveD();
    mats.forEach((M) => {
      const m = String(M).toLowerCase();
      out.push({ name: `Штробление ${st} ${m}`, unit: "м" });
      out.push({ name: `Штробление ${st} ${m} (слаботочка)`, unit: "м" });
      out.push({ name: `Штробление ${warm} ${m}`, unit: "м" });
      out.push({ name: `Высверливание подрозетников обычных ${m}`, unit: "шт" });
      out.push({ name: `Высверливание подрозетников глубоких ${m}`, unit: "шт" });
      out.push({ name: `Вклейка подрозетников обычных ${m}`, unit: "шт" });
      out.push({ name: `Вклейка подрозетников глубоких ${m}`, unit: "шт" });
      out.push({ name: `Проходка Ø${sd} ${m}`, unit: "шт" });
      out.push({ name: `Вырубка ниши под щит (${m})`, unit: "мод" });
    });
    return out;
  }

  function catalog() {
    return [
      {
        id: "main", title: "Штробы, подрозетники, проходки", open: true, core: true,
        hint: "Только материалы, которые ты отметил выше. Хватит заполнить обычную штробу — слаботочная подхватит ту же цену, если оставить её пустой.",
        items: byMaterial(pickedMaterials())
      },
      {
        id: "cable", title: "Кабель и коробки", open: true, core: true,
        hint: "«Прокладка кабеля» одной ценой покрывает все марки и сечения.",
        items: [
          { name: "Прокладка кабеля", unit: "м" },
          { name: "Затяжка кабеля в гофру", unit: "м" },
          { name: "Собрать распаянную коробку на потолке", unit: "шт" },
          { name: "Собрать распайку в подрозетнике", unit: "шт" },
          { name: "Проход через перекрытие (стояк между этажами)", unit: "шт" }
        ]
      },
      {
        id: "shield", title: "Щит", open: true, core: true,
        hint: "Сборка щита считается поштучно по аппаратам.",
        items: [
          { name: "Монтаж щита в нишу/стену", unit: "шт" },
          { name: "Установка автоматического выключателя", unit: "шт" },
          { name: "Установка УЗО/дифавтомата", unit: "шт" },
          { name: "Установка счётчика", unit: "шт" },
          { name: "Монтаж и настройка системы АВР (ввод резерва)", unit: "шт" }
        ]
      },
      {
        id: "temp", title: "Временные сети", open: false,
        hint: "Считаются, только если указать число точек в «Расчёте».",
        items: [
          { name: "Временное освещение (организация)", unit: "точ." },
          { name: "Временные розеточные сети (организация)", unit: "точ." }
        ]
      }
    ].filter((g) => g.items.length);
  }

  // ---------- что уже есть в «Моей БД» ----------
  // Сверяем ТОЧНО по имени: подстрочный поиск priceFor() тут не годится — он показал бы
  // «цена есть» у позиции, которой на самом деле нет (совпала бы более общая строка).
  function myWorks() {
    const d = D();
    let items = [];
    // База может быть ещё не поднята (порядок загрузки модулей, пустое хранилище) —
    // подсказка на главном экране НЕ должна из-за этого падать и уносить с собой рендер
    try { items = (d && d.getItemsByType) ? (d.getItemsByType("work", "my") || []) : []; } catch (e) { items = []; }
    const map = new Map();
    items.forEach((x) => { if (x && x.name) map.set(String(x.name).trim().toLowerCase(), x); });
    return map;
  }
  // сколько позиций каталога ещё без цены — для подсказки на главной
  // Считаем ТОЛЬКО core-группы: перегородки (ГКЛ/ПГП/газоблок) и временные сети нужны
  // не в каждом проекте, и если тащить их в счётчик, «осталось без цены» никогда не
  // дойдёт до нуля и будет зря давить на мастера.
  function pending() {
    const have = myWorks();
    let n = 0;
    catalog().filter((g) => g.core).forEach((g) => g.items.forEach((it) => {
      const x = have.get(it.name.trim().toLowerCase());
      if (!x || !(Number(x.price) > 0)) n++;
    }));
    return n;
  }
  const total = () => catalog().filter((g) => g.core).reduce((s, g) => s + g.items.length, 0);
  const state = () => { try { return localStorage.getItem(KEY) || ""; } catch (e) { return ""; } };
  const setState = (v) => { try { localStorage.setItem(KEY, v); } catch (e) {} };

  // ---------- окно ----------
  function open() {
    let ov = document.getElementById("ep-pset-ov");
    if (!ov) {
      ov = document.createElement("div");
      ov.id = "ep-pset-ov";
      ov.className = "ep-pset-ov";
      document.body.appendChild(ov);
    }
    render(ov);
    ov.hidden = false;
  }
  function close() {
    const ov = document.getElementById("ep-pset-ov");
    if (ov) { ov.hidden = true; ov.innerHTML = ""; }
    refreshBanner();
  }
  function render(ov) {
    const have = myWorks();
    const groups = catalog();
    const left = pending();
    const picked = pickedMaterials();
    ov.innerHTML = `<div class="ep-pset-box card">
      <div class="ep-pset-head">
        <b>💰 Цены на работы</b>
        <span class="ep-pset-flex"></span>
        <button type="button" class="btn btn-ghost ep-clickable" data-pset-close>✕</button>
      </div>
      <p class="ep-pset-lead">Это все работы, которые приложение считает <b>автоматически</b> —
        в «Проекте квартиры», Пуле и смете. Впиши свои цены, и расчёт сразу начнёт показывать суммы,
        а не «нет цены в БД». Заполнять всё сразу не нужно: пустые строки просто не попадут в базу,
        вернуться можно в любой момент из «Базы данных».</p>
      <div class="ep-pset-mats">
        <div class="ep-pset-matlbl">С какими стенами работаешь — по ним и будут строки:</div>
        <div class="ep-pset-matchips">${allMaterials().map((m) => {
          const on = picked.some((x) => String(x).toLowerCase() === String(m).toLowerCase());
          return `<button type="button" class="ep-pset-chip ep-clickable${on ? " on" : ""}" data-pset-mat="${esc(m)}">${esc(m)}</button>`;
        }).join("")}</div>
      </div>
      <div class="ep-pset-sum">Осталось без цены: <b data-pset-left>${left}</b> из ${total()}</div>
      ${groups.map((g) => `
        <details class="ep-pset-grp" ${g.open ? "open" : ""} data-pset-grp="${esc(g.id)}">
          <summary>${esc(g.title)} <span class="ep-pset-cnt">${g.items.length}</span></summary>
          <div class="ep-pset-hint">${esc(g.hint)}</div>
          <div class="ep-pset-fill">
            <label>Одна цена на всю группу
              <input type="number" inputmode="decimal" min="0" step="1" placeholder="₽" data-pset-all="${esc(g.id)}"></label>
            <button type="button" class="btn btn-ghost ep-clickable" data-pset-allgo="${esc(g.id)}">Применить</button>
          </div>
          <div class="ep-pset-rows">${g.items.map((it) => {
            const cur = have.get(it.name.trim().toLowerCase());
            const price = cur && Number(cur.price) > 0 ? Number(cur.price) : "";
            return `<label class="ep-pset-row${price === "" ? "" : " is-set"}">
              <span class="ep-pset-n">${esc(it.name)}</span>
              <span class="ep-pset-u">₽/${esc(it.unit)}</span>
              <input type="number" inputmode="decimal" min="0" step="1" value="${price}"
                data-pset-price="${esc(it.name)}" data-pset-unit="${esc(it.unit)}" data-pset-g="${esc(g.id)}">
            </label>`;
          }).join("")}</div>
        </details>`).join("")}
      <div class="ep-pset-foot">
        <button type="button" class="btn btn-primary ep-clickable" data-pset-save>💾 Сохранить в базу</button>
        <button type="button" class="btn btn-ghost ep-clickable" data-pset-later>Позже</button>
      </div>
    </div>`;
  }

  // ---------- сохранение ----------
  // Пустые поля ПРОПУСКАЕМ (не пишем нули — «0 ₽» в базе выглядел бы как «работа
  // бесплатна» и молча ломал бы итог). Существующую позицию с таким же именем правим
  // (updateMyItem), а не плодим дубль — та же логика, что у sheetSetPrice в plan-calc.js.
  function save(root) {
    const d = D();
    if (!d) return { added: 0, updated: 0 };
    const have = myWorks();
    let added = 0, updated = 0;
    const inputs = (root || document).querySelectorAll("[data-pset-price]");
    inputs.forEach((inp) => {
      const price = Number(String(inp.value || "").replace(",", "."));
      if (!(price > 0)) return;
      const name = inp.getAttribute("data-pset-price");
      const unit = inp.getAttribute("data-pset-unit") || "шт";
      const cur = have.get(name.trim().toLowerCase());
      if (cur && d.updateMyItem) { d.updateMyItem(cur.id, { price, unit }); updated++; }
      else if (d.addMyItem) { d.addMyItem({ type: "work", name, unit, price, category: CAT, subcategory: SUB }); added++; }
    });
    return { added, updated };
  }

  // ---------- подсказка на главном экране ----------
  // Показывается, пока (а) в каталоге есть позиции без цены и (б) мастер не нажал
  // «Позже»/«Сохранить». Кнопка на экране «База данных» доступна ВСЕГДА — чтобы
  // однократно скрытая подсказка не забрала фичу насовсем.
  function bannerHtml(left) {
    return `<div class="card ep-pset-banner" id="ep-pset-banner">
      <div class="ep-pset-btext">
        <b>💰 Внеси цены на работы</b>
        <span>Приложение уже умеет считать объёмы само. Осталось один раз вписать твои цены —
          и смета будет считаться в рублях. Позиций без цены: ${left}.</span>
      </div>
      <div class="ep-pset-bbtns">
        <button type="button" class="btn btn-primary ep-clickable" data-price-setup>Ввести данные в БД</button>
        <button type="button" class="btn btn-ghost ep-clickable" data-pset-hide>Позже</button>
      </div>
    </div>`;
  }
  function refreshBanner() {
    const host = document.querySelector(".main-dashboard");
    const old = document.getElementById("ep-pset-banner");
    if (old) old.remove();
    if (!host) return;
    if (state() === "done" || state() === "later") return;
    const auth = window.EP.Auth;
    if (auth && auth.isApproved === false) return;   // не одобрен — в приложение и так не пустят
    const left = pending();
    if (!left) return;                                // всё заполнено — подсказка не нужна
    const head = host.querySelector(".page-head");
    const div = document.createElement("div");
    div.innerHTML = bannerHtml(left);
    const node = div.firstElementChild;
    if (head && head.parentNode) head.parentNode.insertBefore(node, head.nextSibling);
    else host.insertBefore(node, host.firstChild);
  }

  let flashTimer = null;
  function flash(msg) {
    let el = document.querySelector(".ep-db-flash");
    if (!el) { el = document.createElement("div"); el.className = "ep-db-flash"; document.body.appendChild(el); }
    el.textContent = msg;
    el.classList.add("show");
    clearTimeout(flashTimer);
    flashTimer = setTimeout(() => el.classList.remove("show"), 1800);
  }

  // ---------- события ----------
  document.addEventListener("click", (e) => {
    const t = e.target;
    if (!t || !t.closest) return;
    let el;
    if (t.closest("[data-price-setup]")) { open(); return; }
    if (t.closest("[data-pset-close]")) { close(); return; }
    if (t.closest("[data-pset-hide]")) { setState("later"); refreshBanner(); return; }
    if (t.closest("[data-pset-later]")) { setState("later"); close(); return; }
    if ((el = t.closest("[data-pset-mat]"))) {
      const box = document.getElementById("ep-pset-ov");
      // уже введённые числа сохраняем ДО перерисовки — иначе смена набора материалов
      // молча стёрла бы всё, что мастер успел вписать
      if (box) save(box);
      const m = el.getAttribute("data-pset-mat");
      const cur = pickedMaterials();
      const has = cur.some((x) => String(x).toLowerCase() === m.toLowerCase());
      const next = has ? cur.filter((x) => String(x).toLowerCase() !== m.toLowerCase()) : cur.concat([m]);
      if (!next.length) { flash("Хотя бы один материал нужен"); return; }
      setMaterials(next);
      if (box) render(box);
      return;
    }
    if ((el = t.closest("[data-pset-allgo]"))) {
      const g = el.getAttribute("data-pset-allgo");
      const box = document.getElementById("ep-pset-ov");
      const src = box && box.querySelector('[data-pset-all="' + g.replace(/"/g, '\\"') + '"]');
      const v = src ? String(src.value || "").trim() : "";
      if (!v) return;
      (box ? box.querySelectorAll('[data-pset-g="' + g.replace(/"/g, '\\"') + '"]') : []).forEach((i) => { i.value = v; });
      return;
    }
    if (t.closest("[data-pset-save]")) {
      const box = document.getElementById("ep-pset-ov");
      const r = save(box);
      setState("done");
      close();
      const n = r.added + r.updated;
      flash(n ? "Цены сохранены: " + n : "Пустые строки — сохранять нечего");
      return;
    }
  });
  // главный экран мог перерисоваться — подсказку возвращаем на место
  window.addEventListener("ep:route-loaded", (e) => {
    const r = e && e.detail && e.detail.route;
    if (r === "main") setTimeout(refreshBanner, 60);
  });
  document.addEventListener("ep:auth-changed", () => setTimeout(refreshBanner, 120));

  window.EP.PriceSetup = { open, close, catalog, pending, total, save, refreshBanner, allMaterials, pickedMaterials, setMaterials, KEY, MATS_KEY };
})();
