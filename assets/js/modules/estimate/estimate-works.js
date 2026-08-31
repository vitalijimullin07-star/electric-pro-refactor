/* Electric Pro V29 — СМЕТА ПО РАБОТАМ: этапы и трудозатраты.
   Работы в смете и раньше были (их считает точный счёт по трассам, пул, щит и генератор
   работ по материалам), но лежали ПЛОСКИМ списком: заказчику не видно, что за чем идёт и
   сколько это по времени, а мастеру нечем прикинуть срок и разбить оплату по этапам.
   Здесь ровно две вещи поверх УЖЕ посчитанных позиций — ничего заново не считается:
     1) разнос работ по ЭТАПАМ (черновой / щит / чистовой / демонтаж / прочее);
     2) трудозатраты по нормам выработки и срок при заданной бригаде.
   Чистая логика без DOM — печать берёт её из estimate-print.js, экран из estimate-tabs.js. */
(function () {
  "use strict";
  window.EP = window.EP || {};

  /* ЭТАПЫ. Порядок массива = порядок в документе (так работы и идут на объекте).
     Правила — regex по НАЗВАНИЮ позиции: жёсткого справочника id нет и быть не может,
     работы приходят из пользовательской БД и из трёх разных движков расчёта. Первое
     совпавшее правило выигрывает, поэтому «демонтаж» стоит ПЕРВЫМ: «демонтаж розеток»
     не должен попасть в чистовой этап по слову «розеток». */
  var STAGES = [
    { id: "demo", name: "Демонтаж", re: /демонтаж|снят[иь]|разбор|штраб.{0,10}демонт/i },
    { id: "rough", name: "Черновой этап",
      re: /штроб|высверлив|коронк|бурени|сверлени|проходк|гильз|прокладк|укладк|затяжк|затягив|монтаж.{0,14}(короб|подрозетник)|подрозетник|распа|гофр|лоток|штроблени|перфор|алмазн/i },
    { id: "shield", name: "Электрощит",
      re: /щит|автомат|узо|дифавтомат|диф\b|счётчик|счетчик|рубильник|авр|расключени.{0,10}щит|din|шин[аы]|ниш[аи]/i },
    { id: "fine", name: "Чистовой этап",
      re: /внутренн.{0,4}точк|установк|подключени|светильник|люстр|бра|розетк|выключател|термостат|диммер|датчик|звонок|вытяжк|тёплый пол|теплый пол|подсветк|лент/i },
    { id: "other", name: "Прочие работы", re: null }
  ];

  /* НОРМЫ ВЫРАБОТКИ (единиц в час). ЕДИНЫЙ источник на всё приложение: раньше эта таблица
     жила только в tools.js и использовалась ровно для одного — прикидки износа инструмента
     по часам. Дублировать её здесь было бы ровно той расходящейся копией, о которой
     предупреждает docs/ESTIMATE_LOGIC_AUDIT.md, поэтому таблица переехала сюда, а tools.js
     читает её отсюда (с фолбэком на свою, если модуль не подключён на странице). */
  var NORMS = [
    { re: /штроб/i, perHour: 10 },                                                  // м/ч
    { re: /высверливани.{0,20}подрозетник|коронк/i, perHour: 8 },                   // шт/ч
    { re: /укладк.{0,4}кабел|проклад.{0,4}кабел|затягив|затяжк/i, perHour: 30 },    // м/ч
    { re: /монтаж.{0,12}коробок|монтаж.{0,6}подрозетник|установочн.{0,8}коробок|вклейк/i, perHour: 12 },
    { re: /внутренн.{0,4}точк|подключени.{0,12}розетк|выключател/i, perHour: 6 },
    { re: /сборк.{0,10}щит|расключени|установк.{0,12}(автомат|узо|диф)/i, perHour: 8 }
  ];
  var DEF_NORM = 8;                 // всё, что не попало в правила
  function normFor(name) {
    var s = String(name || "");
    for (var i = 0; i < NORMS.length; i++) if (NORMS[i].re.test(s)) return NORMS[i].perHour;
    return DEF_NORM;
  }

  function stageOf(name) {
    var s = String(name || "");
    for (var i = 0; i < STAGES.length; i++) {
      if (!STAGES[i].re) return STAGES[i].id;
      if (STAGES[i].re.test(s)) return STAGES[i].id;
    }
    return "other";
  }

  // ---- бригада и смена: свойство УСТРОЙСТВА (как наценка на материалы), не проекта ----
  var CREW_KEY = "ep_est_crew_v29";
  var DEF_CREW = { people: 2, hoursPerDay: 8 };
  function getCrew() {
    var v = null;
    try { v = JSON.parse(localStorage.getItem(CREW_KEY) || "null"); } catch (e) {}
    var people = v && v.people > 0 ? Math.min(20, Math.round(v.people)) : DEF_CREW.people;
    var hpd = v && v.hoursPerDay > 0 ? Math.min(24, Number(v.hoursPerDay)) : DEF_CREW.hoursPerDay;
    return { people: people, hoursPerDay: hpd };
  }
  function setCrew(people, hoursPerDay) {
    var c = { people: Math.max(1, Math.min(20, Math.round(Number(people) || DEF_CREW.people))),
      hoursPerDay: Math.max(1, Math.min(24, Number(hoursPerDay) || DEF_CREW.hoursPerDay)) };
    try { localStorage.setItem(CREW_KEY, JSON.stringify(c)); } catch (e) {}
    return c;
  }

  var num = function (v) { var n = Number(v); return isFinite(n) ? n : 0; };
  var r1 = function (v) { return Math.round(v * 10) / 10; };

  /* Разнос по этапам + трудозатраты. items — обычные позиции сметы; берём ТОЛЬКО work
     (материалы в смете по работам не участвуют — это документ про труд, не про закупку).
     opts.extra: "all" (по умолчанию) | "only" | "skip" — как поступить с позициями,
     отнесёнными к дополнительным работам (item.extra): акт доп. работ печатается отдельно,
     и смешивать его с основным сроком нельзя. */
  function breakdown(items, opts) {
    opts = opts || {};
    var crew = opts.crew || getCrew();
    var mode = opts.extra || "all";
    var byId = {}, order = [];
    STAGES.forEach(function (s) { byId[s.id] = { id: s.id, name: s.name, items: [], sum: 0, hours: 0 }; order.push(s.id); });
    (items || []).forEach(function (it) {
      if (!it || it.type !== "work") return;
      if (mode === "only" && !it.extra) return;
      if (mode === "skip" && it.extra) return;
      var qty = num(it.qty), price = num(it.price);
      // трудозатраты: количество / норму выработки. Норма — «единиц в час» той же
      // единицы, в которой посчитана позиция (м штробы, шт подрозетников, м кабеля).
      var hours = qty > 0 ? qty / normFor(it.name) : 0;
      var st = byId[stageOf(it.name)];
      st.items.push({ name: it.name, unit: it.unit || "", qty: qty, price: price, sum: qty * price, hours: hours, extra: !!it.extra });
      st.sum += qty * price;
      st.hours += hours;
    });
    var stages = order.map(function (id) { return byId[id]; }).filter(function (s) { return s.items.length; });
    stages.forEach(function (s) { s.hours = r1(s.hours); });
    var sum = stages.reduce(function (a, s) { return a + s.sum; }, 0);
    var hours = r1(stages.reduce(function (a, s) { return a + s.hours; }, 0));
    // срок: часы одного человека делим на бригаду и смену. Округляем ВВЕРХ до половины
    // дня — «2.1 дня» на объекте всё равно означает три выхода, но дробить до сотых
    // бессмысленно, а округление вниз занижало бы срок в договоре.
    var perDay = crew.people * crew.hoursPerDay;
    var days = perDay > 0 ? Math.ceil((hours / perDay) * 2) / 2 : 0;
    return { stages: stages, sum: sum, hours: hours, days: days, crew: crew };
  }

  window.EP.EstimateWorks = {
    STAGES: STAGES, NORMS: NORMS, DEF_NORM: DEF_NORM,
    normFor: normFor, stageOf: stageOf, breakdown: breakdown,
    getCrew: getCrew, setCrew: setCrew, CREW_KEY: CREW_KEY
  };
})();
