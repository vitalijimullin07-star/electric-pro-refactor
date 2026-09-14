/* ============================================================
   Electric Pro V29 — ОБЯЗАТЕЛЬНЫЕ ПОЗИЦИИ СМЕТЫ (связки «триггер → спутники»)

   Зачем: работы, которые по факту выполняются ВСЕГДА (маркировка проводников в щите,
   ДСУП в санузле, вывоз мусора после штробления, акт скрытых работ при сдаче), в смету
   попадают не всегда — их вспоминают уже на объекте, и заказчик читает их как довесок.
   Модуль не даёт про них забыть НА ЭТАПЕ СОСТАВЛЕНИЯ: как только в смете появляется
   позиция-триггер, показывается список связанных работ с чекбоксами. Молча ничего не
   добавляется — электрик отмечает нужное, а отказ ФИКСИРУЕТСЯ (видно, что позицию
   исключили осознанно, а не пропустили).

   ПОЧЕМУ ТРИГГЕР ЛОВИТСЯ ПО СОСТАВУ СМЕТЫ, А НЕ ПО ВЫЗОВУ addItem: позиции попадают в
   смету пятью разными путями (ручное добавление, «В смету» из плана/пула/щита, импорт
   файла, генератор работ по материалам, перенос из предварительной). Патчить каждый путь
   значило бы рано или поздно пропустить один и тихо потерять всю механику. Здесь вместо
   этого считается, какие группы СЕЙЧАС сработали по составу сметы, а «показать один раз»
   обеспечивает отметка seen по id группы — это покрывает все пути разом, включая будущие.

   Хранилища (localStorage):
     ep_required_rules_v29 — сами связки (пользователь правит их в приложении, без кода);
     ep_required_seen_v29  — каким группам предложение уже показывали;
     ep_required_skip_v29  — осознанные отказы «groupId|имя позиции».
   ============================================================ */
(() => {
  "use strict";
  window.EP = window.EP || {};
  const RKEY = "ep_required_rules_v29";
  const SKEY = "ep_required_seen_v29";
  const XKEY = "ep_required_skip_v29";

  function num(v) { const n = typeof v === "number" ? v : parseFloat(String(v).replace(",", ".")); return isFinite(n) ? n : 0; }
  function EST() { return (window.EP && window.EP.Estimate) || null; }
  function NM() { return (window.EP && window.EP.NameMatch) || null; }
  function low(s) { const N = NM(); return N ? N.norm(s) : String(s == null ? "" : s).toLowerCase().trim(); }
  function lsGet(k, def) { try { const v = JSON.parse(localStorage.getItem(k) || "null"); return v == null ? def : v; } catch (e) { return def; } }
  function lsSet(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
  function emit() { try { window.dispatchEvent(new CustomEvent("ep:required-changed")); } catch (e) {} }

  /* ---------- ЧЕМ МЕРИТЬ КОЛИЧЕСТВО ----------
     У части позиций количество зависит от ОБЪЁМА триггера (маркировка — от числа модулей
     щита), у части оно фиксированное (акт скрытых работ — один на объект). База считается
     по уже собранной смете теми же признаками, что и «Параметры объекта» в калькуляторе
     мелочёвки (estimate/consumables.js) — отдельной модели объекта в приложении нет. */
  const PER = [
    ["fixed", "фикс. количество"],
    ["trigger", "× количество триггера"],
    ["modules", "× модулей щита"],
    ["circuits", "× линий (автоматов)"],
    ["points", "× точек"],
    ["cableM", "× метров кабеля"],
    ["boxes", "× распаечных коробок"]
  ];

  /* Имена ВСЕХ позиций-спутников — их нельзя считать базой для самих себя. Поймано живым
     прогоном: «Комплект маркировки автоматов» (материал) попадал под признак модуля щита,
     и после добавления спутников маркировки становилось 18 вместо 17 — счёт «поехал» от
     собственного результата. */
  function ruleNames() {
    const set = {};
    getRules().groups.forEach((g) => (g.items || []).forEach((r) => { if (r && r.name) set[low(r.name)] = true; }));
    return set;
  }

  /* Один и тот же объём описан в смете ДВАЖДЫ — работой и материалом («Высверливание
     подрозетников» 42 шт и «Подрозетник Ø68» 42 шт): складывать их нельзя, получится 84.
     Поэтому считаем отдельно по материалам и по работам, а берём материалы, если они есть
     (материал — сам предмет счёта), иначе работы (смета без материалов — обычное дело). */
  function params(items, exclude) {
    const skip = exclude || {};
    const M = { modules: 0, circuits: 0, points: 0, cableM: 0, boxes: 0 };
    const W = { modules: 0, circuits: 0, points: 0, cableM: 0, boxes: 0 };
    (items || []).forEach((x) => {
      const n = low(x.name), q = num(x.qty), u = String(x.unit || "").toLowerCase();
      if (!n || q <= 0 || skip[n]) return;
      const T = x.type === "material" ? M : W;
      const auto = /автомат|диф|узо/.test(n);
      // линия = отходящий автомат (дифавтомат тоже линия); УЗО отдельной строкой —
      // групповая защита, своей линии не даёт. Различить УЗО и дифавтомат в смете точнее
      // нельзя: модель приложения их не разделяет (одна строка «Установка УЗО/дифавтомата»).
      if (auto) { T.modules += q; if (/автомат/.test(n)) T.circuits += q; }
      // «выключатель» есть и у автоматического выключателя — его точкой не считаем
      if (/подрозетник/.test(n) || (/розетк|выключател|светильник|датчик/.test(n) && !auto)) T.points += q;
      if (/^м$|^пог м$|^м п$/.test(u) && /кабель|ввг|nym|пвс|сип|провод/.test(n)) T.cableM += q;
      if (/распайк|распаечн|распредел/.test(n)) T.boxes += q;
    });
    const pick = {};
    Object.keys(M).forEach((k) => { pick[k] = M[k] || W[k]; });
    return pick;
  }

  // Штучное округляем ВВЕРХ (0.4 коробки не купить), метраж/объём — до сотых.
  const PIECE_UNIT = /^(шт|компл|уп|лин|точ|меш|объект|рейс|пог)/;
  function qtyOf(rule, trigQty, prm) {
    const k = num(rule && rule.k) || 1;
    let base = 1;
    switch (rule && rule.per) {
      case "trigger": base = num(trigQty); break;
      case "modules": base = prm.modules; break;
      case "circuits": base = prm.circuits; break;
      case "points": base = prm.points; break;
      case "cableM": base = prm.cableM; break;
      case "boxes": base = prm.boxes; break;
      default: base = 1;
    }
    const q = base * k;
    if (!(q > 0)) return 0;
    return PIECE_UNIT.test(String((rule && rule.unit) || "").toLowerCase()) ? Math.ceil(q) : Math.round(q * 100) / 100;
  }

  /* ---------- ВСТРОЕННЫЕ СВЯЗКИ ----------
     `match` — по каким словам в названии позиции срабатывает группа (сравнение идёт по
     нормализованному имени, EP.NameMatch.norm). `always: true` — группа не привязана к
     позиции сметы и предлагается на любом объекте (сдача объекта).
     `pre: false` у позиции — в предложении галка СНЯТА по умолчанию (спорное/«если входит
     в договор»), но позиция на виду и её видно в сводке. */
  const DEFAULTS = [
    {
      id: "shield_power", name: "Щит силовой", builtin: true, on: true,
      match: ["сборка и расключение щита", "монтаж щита", "щит силовой", "сборка щита", "расключение щита"],
      items: [
        { name: "Маркировка проводников в щите", type: "work", unit: "шт", per: "modules", k: 1 },
        { name: "Опрессовка наконечников НШВИ", type: "work", unit: "шт", per: "modules", k: 2 },
        { name: "Протяжка клеммных соединений", type: "work", unit: "шт", per: "modules", k: 1 },
        { name: "Комплект маркировки автоматов", type: "material", unit: "компл", per: "fixed", k: 1 },
        { name: "Испытания и прозвонка линий", type: "work", unit: "лин", per: "circuits", k: 1 }
      ]
    },
    {
      id: "shield_lv", name: "Щит слаботочный", builtin: true, on: true,
      match: ["щит слаботочн", "слаботочный щит", "мультимедийный щит", "монтаж слаботочного щита"],
      items: [
        { name: "Маркировка проводников в щите", type: "work", unit: "компл", per: "trigger", k: 1 },
        { name: "Монтаж кросс/патч-панели", type: "work", unit: "шт", per: "trigger", k: 1 },
        { name: "Патч-панель", type: "material", unit: "шт", per: "trigger", k: 1 },
        { name: "Заземление слаботочного щита", type: "work", unit: "шт", per: "trigger", k: 1 }
      ]
    },
    {
      id: "wet", name: "Санузел / влажное помещение", builtin: true, on: true,
      match: ["санузел", "ванн", "душев", "влажн", "сан узел"],
      items: [
        { name: "Монтаж ДСУП к точкам (уравнивание потенциалов)", type: "work", unit: "точ", per: "trigger", k: 1 },
        { name: "Монтаж и расключение КУП", type: "work", unit: "шт", per: "fixed", k: 1 },
        { name: "Коробка уравнивания потенциалов КУП", type: "material", unit: "шт", per: "fixed", k: 1 },
        { name: "Хомут заземляющий на трубу", type: "material", unit: "шт", per: "fixed", k: 4 }
      ]
    },
    {
      id: "chase", name: "Штробление", builtin: true, on: true,
      match: ["штроблен", "штроба", "штробление стен"],
      items: [
        { name: "Вынос и вывоз строительного мусора", type: "work", unit: "меш", per: "trigger", k: 0.1 },
        { name: "Мешки строительные", type: "material", unit: "шт", per: "trigger", k: 0.1 },
        { name: "Уборка помещения после штробления", type: "work", unit: "объект", per: "fixed", k: 1 },
        { name: "Заделка штроб штукатурной смесью", type: "work", unit: "м", per: "trigger", k: 1, pre: false }
      ]
    },
    {
      id: "cable", name: "Прокладка кабеля", builtin: true, on: true,
      match: ["прокладка кабел", "укладка кабел", "затяжка кабел", "монтаж кабел"],
      items: [
        { name: "Проходка через стену/перекрытие", type: "work", unit: "шт", per: "cableM", k: 0.05 },
        { name: "Гофра ПНД для защиты кабеля", type: "material", unit: "м", per: "trigger", k: 1, pre: false },
        { name: "Крепёж кабеля (дюбель-хомут)", type: "material", unit: "шт", per: "trigger", k: 2 }
      ]
    },
    {
      id: "boxes", name: "Подрозетники", builtin: true, on: true,
      match: ["подрозетник", "установочная коробка"],
      items: [
        { name: "Вклейка подрозетников", type: "work", unit: "шт", per: "trigger", k: 1 },
        { name: "Зачистка и подготовка концов кабеля", type: "work", unit: "шт", per: "trigger", k: 1 },
        { name: "Расключение подрозетника", type: "work", unit: "шт", per: "trigger", k: 1 }
      ]
    },
    {
      id: "handover", name: "Сдача объекта", builtin: true, on: true, always: true, match: [],
      items: [
        { name: "Акт освидетельствования скрытых работ", type: "work", unit: "шт", per: "fixed", k: 1 },
        { name: "Фотофиксация трасс до закрытия", type: "work", unit: "объект", per: "fixed", k: 1 },
        { name: "Исполнительная схема по факту монтажа", type: "work", unit: "компл", per: "fixed", k: 1 },
        { name: "Протокол испытаний (сопротивление изоляции)", type: "work", unit: "шт", per: "fixed", k: 1 }
      ]
    }
  ];

  function cloneDefaults() { return JSON.parse(JSON.stringify(DEFAULTS)); }

  /* Чтение связок. Встроенная группа, которой ещё нет в сохранённом наборе, ДОБАВЛЯЕТСЯ
     автоматически — иначе новые встроенные связки не появились бы у тех, кто уже правил
     свой набор. Удалённую пользователем встроенную группу помним в removed, чтобы она не
     воскресала на каждом запуске. */
  function getRules() {
    const saved = lsGet(RKEY, null);
    if (!saved || !Array.isArray(saved.groups)) return { v: 1, groups: cloneDefaults(), removed: [] };
    const removed = Array.isArray(saved.removed) ? saved.removed : [];
    const have = {};
    saved.groups.forEach((g) => { if (g && g.id) have[g.id] = true; });
    const add = cloneDefaults().filter((g) => !have[g.id] && removed.indexOf(g.id) < 0);
    return { v: 1, groups: saved.groups.concat(add), removed: removed };
  }
  function setRules(r) { lsSet(RKEY, { v: 1, groups: (r && r.groups) || [], removed: (r && r.removed) || [] }); emit(); }
  function resetRules() { try { localStorage.removeItem(RKEY); } catch (e) {} emit(); }

  function groupById(id) { return getRules().groups.find((g) => g.id === id) || null; }
  function saveGroup(id, patch) {
    const r = getRules(); const g = r.groups.find((x) => x.id === id); if (!g) return null;
    Object.assign(g, patch || {}); setRules(r); return g;
  }
  function addGroup(name) {
    const r = getRules();
    const g = { id: "g_" + Date.now().toString(36), name: String(name || "Своя связка"), on: true, match: [], items: [] };
    r.groups.push(g); setRules(r); return g;
  }
  function removeGroup(id) {
    const r = getRules(); const g = r.groups.find((x) => x.id === id);
    r.groups = r.groups.filter((x) => x.id !== id);
    if (g && g.builtin && r.removed.indexOf(id) < 0) r.removed.push(id);
    setRules(r);
  }
  function addRule(groupId, rule) {
    const r = getRules(); const g = r.groups.find((x) => x.id === groupId); if (!g) return null;
    g.items = g.items || [];
    g.items.push({
      name: String((rule && rule.name) || "").trim(),
      type: rule && rule.type === "material" ? "material" : "work",
      unit: String((rule && rule.unit) || "шт"),
      per: (rule && rule.per) || "fixed",
      k: num(rule && rule.k) || 1,
      pre: !(rule && rule.pre === false)
    });
    setRules(r); return g;
  }
  function updateRule(groupId, idx, patch) {
    const r = getRules(); const g = r.groups.find((x) => x.id === groupId); if (!g || !g.items || !g.items[idx]) return null;
    Object.assign(g.items[idx], patch || {}); setRules(r); return g.items[idx];
  }
  function removeRule(groupId, idx) {
    const r = getRules(); const g = r.groups.find((x) => x.id === groupId); if (!g || !g.items) return;
    g.items.splice(idx, 1); setRules(r);
  }

  /* ---------- показано / отказ ---------- */
  function seen() { return lsGet(SKEY, {}) || {}; }
  function markSeen(id) { const s = seen(); s[id] = Date.now(); lsSet(SKEY, s); emit(); }
  function resetSeen() { try { localStorage.removeItem(SKEY); } catch (e) {} emit(); }
  function skipped() { return lsGet(XKEY, {}) || {}; }
  function skipKey(groupId, name) { return groupId + "|" + String(name || ""); }
  function skip(groupId, name, why) { const s = skipped(); s[skipKey(groupId, name)] = { at: Date.now(), why: String(why || "") }; lsSet(XKEY, s); emit(); }
  function unskip(groupId, name) { const s = skipped(); delete s[skipKey(groupId, name)]; lsSet(XKEY, s); emit(); }
  function resetSkips() { try { localStorage.removeItem(XKEY); } catch (e) {} emit(); }

  /* ---------- цена из активной базы ----------
     Берём только ЦЕНУ: единица измерения остаётся из связки, потому что от неё зависит
     формула количества (× модулей, × метров) — подмена единицы записью базы сломала бы счёт. */
  function dbItems() {
    try {
      const db = window.EP && window.EP.Database; if (!db || !db.getItems) return [];
      const act = db.getActiveDb ? db.getActiveDb() : "my";
      const list = (db.getItems(act) || []).filter((x) => x && !x.deleted);
      return act === "my" ? list : list.concat((db.getItems("my") || []).filter((x) => x && !x.deleted));
    } catch (e) { return []; }
  }
  function priceOf(name) {
    const N = NM(); if (!N) return 0;
    const hit = N.best(name, dbItems());
    return hit ? num(hit.price) : 0;
  }

  /* ---------- анализ сметы ---------- */
  function keyOf(type, name) { return (type === "material" ? "m|" : "w|") + low(name); }
  function findTrigger(items, g) {
    const m = (g.match || []).map(low).filter(Boolean);
    if (!m.length) return null;
    for (let i = 0; i < items.length; i++) {
      const n = low(items[i].name);
      if (!n) continue;
      for (let j = 0; j < m.length; j++) if (n.indexOf(m[j]) >= 0) return { name: items[i].name, qty: num(items[i].qty) || 1 };
    }
    return null;
  }

  // Полная картина: какие группы сработали, что из них уже в смете, от чего отказались.
  function analyze(items) {
    const list = items || (EST() ? EST().getItems() : []);
    const prm = params(list, ruleNames()), sk = skipped(), sn = seen();
    const have = {};
    list.forEach((x) => { have[keyOf(x.type, x.name)] = true; });
    const groups = [];
    getRules().groups.forEach((g) => {
      if (g.on === false) return;
      const trig = g.always ? { name: g.name, qty: 1, always: true } : findTrigger(list, g);
      if (!trig) return;
      const need = (g.items || []).filter((r) => r && r.name).map((r) => {
        const q = qtyOf(r, trig.qty, prm);
        return {
          name: r.name, type: r.type === "material" ? "material" : "work", unit: r.unit || "шт",
          per: r.per || "fixed", qty: q || 1, guess: !q, pre: r.pre !== false,
          have: !!have[keyOf(r.type, r.name)], skipped: !!sk[skipKey(g.id, r.name)],
          price: priceOf(r.name)
        };
      });
      groups.push({
        id: g.id, name: g.name, trigger: trig, seen: !!sn[g.id], need: need,
        missing: need.filter((x) => !x.have && !x.skipped).length
      });
    });
    return { groups: groups, missing: groups.reduce((s, g) => s + g.missing, 0), params: prm };
  }

  // Группы, по которым предложение ЕЩЁ не показывали (и есть что предложить).
  function pending(items) { return analyze(items).groups.filter((g) => !g.seen && g.missing > 0); }

  /* Добавить отмеченные позиции группы в ОСНОВНУЮ смету. Невыбранные помечаются
     осознанным отказом — в сводке видно, что их исключили, а не забыли. */
  function apply(groupId, names, items) {
    const est = EST(); if (!est || !est.mergeItems) return 0;
    const g = analyze(items).groups.find((x) => x.id === groupId); if (!g) return 0;
    const pick = {};
    (names || []).forEach((n) => { pick[low(n)] = true; });
    const add = g.need.filter((x) => !x.have && pick[low(x.name)])
      .map((x) => ({ type: x.type, name: x.name, unit: x.unit, qty: x.qty, price: x.price, source: "required" }));
    g.need.forEach((x) => { if (!x.have && !pick[low(x.name)]) skip(groupId, x.name); else if (pick[low(x.name)]) unskip(groupId, x.name); });
    if (add.length) est.mergeItems(add);
    markSeen(groupId);
    return add.length;
  }
  // Отказ от всей группы разом («Не нужно»): всё непокрытое помечается отказом.
  function skipGroup(groupId, items) {
    const g = analyze(items).groups.find((x) => x.id === groupId); if (!g) return 0;
    let n = 0;
    g.need.forEach((x) => { if (!x.have && !x.skipped) { skip(groupId, x.name); n++; } });
    markSeen(groupId);
    return n;
  }

  /* Новая смета — новый объект: когда смету очистили, «показывали» и «отказались»
     обнуляются, иначе на следующем объекте предложение молча не появилось бы. */
  if (window.addEventListener) window.addEventListener("ep:estimate-main-changed", (e) => {
    const c = e && e.detail ? e.detail.count : null;
    if (c === 0) { resetSeen(); resetSkips(); }
  });

  /* ============================================================
     UI — предложение, сводка и редактор связок.
     Живёт здесь, а не в estimate-tabs.js: экран сметы только вставляет готовые куски
     разметки (blockHtml/bannerHtml) и не знает про правила ничего. Клики ловит свой
     делегат, после изменения зовём перерисовку экрана сметы.
     ============================================================ */
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c])); }
  function money(v) { const P = window.EP && window.EP.EstimatePrint; return (P ? P.money(v) : Number(v || 0).toFixed(2)) + " ₽"; }
  function q0(v) { const n = num(v); return (Math.round(n * 100) / 100).toString().replace(".", ","); }
  const PER_LABEL = {}; PER.forEach((p) => { PER_LABEL[p[0]] = p[1]; });

  // Состояние экрана (не модель): раскрыт ли блок сводки, открыт ли редактор связок и
  // какие позиции отмечены галкой в предложении. Галки инициализируются полем `pre`.
  const V = { open: false, rules: false, sel: {}, selReady: {} };
  function selKey(gid, name) { return gid + "|" + name; }
  function ensureSel(g) {
    if (V.selReady[g.id]) return;
    g.need.forEach((x) => { if (!x.have) V.sel[selKey(g.id, x.name)] = x.pre !== false; });
    V.selReady[g.id] = true;
  }
  function isSel(gid, name) { return !!V.sel[selKey(gid, name)]; }
  function repaint() { const T = window.EP && window.EP.EstimateTabs; if (T && T.render) T.render(); }

  function needRow(g, x, mode) {
    const price = x.price ? " · " + money(x.price) : "";
    const qtyTxt = q0(x.qty) + (x.unit ? " " + esc(x.unit) : "") + (x.guess ? " (уточни)" : "");
    if (mode === "pick") {
      return `<button type="button" class="ep-req-row ep-clickable ${isSel(g.id, x.name) ? "on" : ""}" data-req-chk="${esc(g.id)}" data-req-name="${esc(x.name)}">
        <span class="ep-req-box">${isSel(g.id, x.name) ? "☑" : "☐"}</span>
        <span class="ep-req-nm">${esc(x.name)}<i>${x.type === "material" ? "материал" : "работа"} · ${esc(PER_LABEL[x.per] || "")}</i></span>
        <span class="ep-req-q">${qtyTxt}${price}</span></button>`;
    }
    const state = x.have ? `<span class="ep-req-ok">в смете</span>`
      : x.skipped ? `<button type="button" class="ep-req-back ep-clickable" data-req-unskip="${esc(g.id)}" data-req-name="${esc(x.name)}">исключена · вернуть</button>`
      : `<button type="button" class="ep-req-add ep-clickable" data-req-add="${esc(g.id)}" data-req-name="${esc(x.name)}">+ добавить</button>`;
    return `<div class="ep-req-row static ${x.have ? "is-have" : x.skipped ? "is-skip" : "is-miss"}">
      <span class="ep-req-nm">${esc(x.name)}<i>${qtyTxt}${price}</i></span>${state}</div>`;
  }

  /* Предложение при появлении триггера. Показывается ОДИН РАЗ на группу (дальше всё
     видно в сводке ниже) и не блокирует работу: это подсказка, а не диалог. */
  function bannerHtml(items) {
    const list = pending(items);
    if (!list.length) return "";
    const g = list[0];
    ensureSel(g);
    const rows = g.need.filter((x) => !x.have).map((x) => needRow(g, x, "pick")).join("");
    const more = list.length > 1 ? `<div class="ep-req-more">Ещё групп с обязательными позициями: ${list.length - 1}</div>` : "";
    return `<div class="ep-req-banner">
      <div class="ep-req-head">К позиции «${esc(g.trigger.name)}» обычно добавляют:</div>
      <div class="ep-req-rows">${rows}</div>
      <div class="ep-req-acts">
        <button type="button" class="btn btn-primary ep-clickable" data-req-apply="${esc(g.id)}">✓ Добавить отмеченные</button>
        <button type="button" class="btn btn-ghost ep-clickable" data-req-skipall="${esc(g.id)}">Не нужно</button>
      </div>
      ${more}
      <div class="ep-req-note">Невыбранные позиции запомнятся как осознанно исключённые — их будет видно в сводке перед печатью.</div>
    </div>`;
  }

  // Сводка: все сработавшие группы, что включено, что исключено, чего не хватает.
  function blockHtml(items) {
    const a = analyze(items);
    if (!a.groups.length) return "";
    const head = `<button type="button" class="ep-est-stghead ep-clickable" data-req-toggle>
        <span>${V.open ? "▾" : "▸"} 📋 Обязательные позиции</span>
        <b>${a.missing ? "не включено: " + a.missing : "всё включено"}</b></button>`;
    if (!V.open) return `<div class="ep-req-block">${head}</div>`;
    const body = a.groups.map((g) => `<div class="ep-req-grp">
        <div class="ep-req-gname">${esc(g.name)}<span>${g.trigger.always ? "на любом объекте" : "по позиции: " + esc(g.trigger.name)}</span></div>
        ${g.need.map((x) => needRow(g, x, "list")).join("")}
      </div>`).join("");
    return `<div class="ep-req-block">${head}${body}
      <div class="ep-req-foot">
        <button type="button" class="btn btn-ghost ep-clickable" data-req-rules>⚙ Настроить связки</button>
        <button type="button" class="btn btn-ghost ep-clickable" data-req-reshow>↺ Спросить заново (снять отказы)</button>
      </div></div>`;
  }

  // Строка-предупреждение в блоке печати. НЕ блокирует печать — только предупреждает.
  function warnHtml(items) {
    const a = analyze(items);
    if (!a.missing) return "";
    return `<div class="ep-req-warn">⚠ Не включены обязательные позиции: ${a.missing}
      <button type="button" class="ep-req-show ep-clickable" data-req-open>показать</button></div>`;
  }

  /* Редактор связок — то, ради чего связки лежат в хранилище, а не в коде: свои триггеры
     и свои позиции добавляются прямо в приложении. */
  function rulesOpen() { return V.rules; }
  function rulesHtml() {
    const r = getRules();
    const perOpts = (cur) => PER.map((p) => `<option value="${p[0]}"${p[0] === cur ? " selected" : ""}>${esc(p[1])}</option>`).join("");
    const groups = r.groups.map((g) => `<div class="ep-req-egrp">
        <div class="ep-req-etop">
          <input type="text" value="${esc(g.name)}" data-req-gname="${esc(g.id)}" placeholder="Название связки">
          <button type="button" class="ep-est-chip ep-clickable ${g.on === false ? "" : "on"}" data-req-gon="${esc(g.id)}">${g.on === false ? "выкл" : "вкл"}</button>
          <button type="button" class="ep-req-del ep-clickable" data-req-gdel="${esc(g.id)}" aria-label="Удалить связку">✕</button>
        </div>
        <label class="ep-req-match"><span>Срабатывает на слова в названии позиции (через запятую)</span>
          <input type="text" value="${esc((g.match || []).join(", "))}" data-req-gmatch="${esc(g.id)}" placeholder="${g.always ? "не требуется — группа предлагается всегда" : "щит, сборка щита"}"${g.always ? " disabled" : ""}></label>
        ${(g.items || []).map((it, i) => `<div class="ep-req-erow">
            <input type="text" value="${esc(it.name)}" data-req-rname="${esc(g.id)}" data-req-i="${i}" placeholder="Наименование позиции">
            <select data-req-rtype="${esc(g.id)}" data-req-i="${i}">
              <option value="work"${it.type === "material" ? "" : " selected"}>работа</option>
              <option value="material"${it.type === "material" ? " selected" : ""}>материал</option>
            </select>
            <input type="text" value="${esc(it.unit || "шт")}" data-req-runit="${esc(g.id)}" data-req-i="${i}" placeholder="ед." maxlength="10">
            <select data-req-rper="${esc(g.id)}" data-req-i="${i}">${perOpts(it.per || "fixed")}</select>
            <input type="number" step="any" min="0" value="${esc(String(it.k == null ? 1 : it.k))}" data-req-rk="${esc(g.id)}" data-req-i="${i}" placeholder="k">
            <button type="button" class="ep-req-del ep-clickable" data-req-rdel="${esc(g.id)}" data-req-i="${i}" aria-label="Убрать позицию">✕</button>
          </div>`).join("")}
        <button type="button" class="btn btn-ghost ep-clickable" data-req-radd="${esc(g.id)}">＋ позиция</button>
      </div>`).join("");
    return `<div class="ep-req-editor">
      <div class="ep-docs-bar"><button type="button" class="ep-docs-back ep-clickable" data-req-close>← Смета</button>
        <div class="ep-docs-title">Связки «триггер → обязательные позиции»</div></div>
      <div class="ep-req-note">Количество считается по формуле: фикс. число либо коэффициент k, умноженный на объём триггера
        или на параметр объекта (модули щита, линии, точки, метры кабеля, коробки) — параметры берутся из уже собранной сметы.</div>
      ${groups}
      <div class="ep-req-foot">
        <button type="button" class="btn btn-primary ep-clickable" data-req-gadd>＋ Своя связка</button>
        <button type="button" class="btn btn-ghost ep-clickable" data-req-greset>↺ Вернуть встроенные</button>
      </div></div>`;
  }

  if (typeof document !== "undefined" && document.addEventListener) {
    document.addEventListener("click", (e) => {
      const t = e.target; if (!t || !t.closest) return;
      if (!document.getElementById("ep-estimate-root")) return;
      let el;
      if ((el = t.closest("[data-req-chk]"))) {
        const k = selKey(el.getAttribute("data-req-chk"), el.getAttribute("data-req-name"));
        V.sel[k] = !V.sel[k]; repaint(); return;
      }
      if ((el = t.closest("[data-req-apply]"))) {
        const gid = el.getAttribute("data-req-apply");
        const g = analyze().groups.find((x) => x.id === gid);
        const names = g ? g.need.filter((x) => !x.have && isSel(gid, x.name)).map((x) => x.name) : [];
        apply(gid, names); repaint(); return;
      }
      if ((el = t.closest("[data-req-skipall]"))) { skipGroup(el.getAttribute("data-req-skipall")); repaint(); return; }
      if ((el = t.closest("[data-req-add]"))) {
        apply(el.getAttribute("data-req-add"), [el.getAttribute("data-req-name")]); repaint(); return;
      }
      if ((el = t.closest("[data-req-unskip]"))) { unskip(el.getAttribute("data-req-unskip"), el.getAttribute("data-req-name")); repaint(); return; }
      if (t.closest("[data-req-toggle]")) { V.open = !V.open; repaint(); return; }
      if (t.closest("[data-req-open]")) { V.open = true; repaint(); return; }
      // «Спросить заново» снимает И показ, И отказы: пока позиция помечена осознанно
      // исключённой, предлагать её нечего — она уже не числится пропущенной
      if (t.closest("[data-req-reshow]")) { resetSeen(); resetSkips(); V.selReady = {}; repaint(); return; }
      if (t.closest("[data-req-rules]")) { V.rules = true; repaint(); return; }
      if (t.closest("[data-req-close]")) { V.rules = false; repaint(); return; }
      if ((el = t.closest("[data-req-gon]"))) { const g = groupById(el.getAttribute("data-req-gon")); if (g) saveGroup(g.id, { on: g.on === false }); repaint(); return; }
      if ((el = t.closest("[data-req-gdel]"))) { if (confirm("Удалить связку целиком?")) { removeGroup(el.getAttribute("data-req-gdel")); repaint(); } return; }
      if ((el = t.closest("[data-req-rdel]"))) { removeRule(el.getAttribute("data-req-rdel"), Number(el.getAttribute("data-req-i"))); repaint(); return; }
      if ((el = t.closest("[data-req-radd]"))) { addRule(el.getAttribute("data-req-radd"), { name: "Новая позиция", type: "work", unit: "шт", per: "fixed", k: 1 }); repaint(); return; }
      if (t.closest("[data-req-gadd]")) { addGroup("Своя связка"); repaint(); return; }
      if (t.closest("[data-req-greset]")) { if (confirm("Вернуть встроенные связки? Свои останутся.")) { const r = getRules(); r.removed = []; setRules(r); repaint(); } return; }
    });
    // Правка полей редактора — на «change», а не на каждый символ: setRules пишет в
    // хранилище и шлёт событие, перерисовка на каждую букву сбивала бы фокус.
    document.addEventListener("change", (e) => {
      const t = e.target; if (!t || !t.getAttribute) return;
      if (!document.getElementById("ep-estimate-root")) return;
      const gid = t.getAttribute("data-req-gname") || t.getAttribute("data-req-gmatch") ||
        t.getAttribute("data-req-rname") || t.getAttribute("data-req-rtype") ||
        t.getAttribute("data-req-runit") || t.getAttribute("data-req-rper") || t.getAttribute("data-req-rk");
      if (!gid) return;
      const i = Number(t.getAttribute("data-req-i"));
      if (t.hasAttribute("data-req-gname")) saveGroup(gid, { name: t.value });
      else if (t.hasAttribute("data-req-gmatch")) saveGroup(gid, { match: String(t.value || "").split(",").map((s) => s.trim()).filter(Boolean) });
      else if (t.hasAttribute("data-req-rname")) updateRule(gid, i, { name: t.value });
      else if (t.hasAttribute("data-req-rtype")) updateRule(gid, i, { type: t.value });
      else if (t.hasAttribute("data-req-runit")) updateRule(gid, i, { unit: t.value });
      else if (t.hasAttribute("data-req-rper")) updateRule(gid, i, { per: t.value });
      else if (t.hasAttribute("data-req-rk")) updateRule(gid, i, { k: num(t.value) || 1 });
    });
  }

  window.EP.EstimateRequired = {
    PER, DEFAULTS, getRules, setRules, resetRules, groupById, saveGroup, addGroup, removeGroup,
    addRule, updateRule, removeRule,
    params, qtyOf, analyze, pending, apply, skipGroup,
    seen, markSeen, resetSeen, skipped, skip, unskip, resetSkips, priceOf,
    bannerHtml, blockHtml, warnHtml, rulesHtml, rulesOpen
  };
})();
