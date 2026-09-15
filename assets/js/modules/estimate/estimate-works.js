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
    // ПОРЯДОК ВАЖЕН: первое совпавшее правило выигрывает. Сборка щита стоит ПЕРЕД
    // установкой аппаратов, иначе «сборка и расключение щита» попала бы под «установку
    // автоматов» (12 шт/ч) и целый щит оценивался бы в 5 минут.
    { re: /сборк.{0,14}щит|расключени.{0,14}щит|щит.{0,14}(сборк|расключени)/i, perHour: 0.2 },  // 5 ч на щит
    { re: /монтаж.{0,10}щит|установк.{0,10}щит|щит.{0,10}(в нишу|на стену)/i, perHour: 0.7 },    // ~1.5 ч
    { re: /штроб/i, perHour: 10 },                                                  // м/ч
    { re: /высверливани.{0,20}подрозетник|коронк/i, perHour: 8 },                   // шт/ч
    { re: /укладк.{0,4}кабел|проклад.{0,4}кабел|затягив|затяжк/i, perHour: 30 },    // м/ч
    { re: /монтаж.{0,12}коробок|монтаж.{0,6}подрозетник|установочн.{0,8}коробок|вклейк/i, perHour: 12 },
    { re: /светильник|люстр|бра\b|трек|подсветк|лент/i, perHour: 2.5 },             // шт/ч
    { re: /установк.{0,12}(автомат|узо|диф|счётчик|счетчик)|модул/i, perHour: 12 },
    { re: /внутренн.{0,4}точк|подключени.{0,12}розетк|выключател|розетк/i, perHour: 6 },
    { re: /распа|коробк.{0,10}(потолк|подрозетник)/i, perHour: 3 }                  // расключение распайки
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

  /* ---- бригада и РЕЖИМ ДНЯ: свойство УСТРОЙСТВА (как наценка на материалы), не проекта ----
     Режим дня задаётся ИНТЕРВАЛАМИ («с 10 до 13 и с 15 до 18»), а не одним числом
     «часов в смене»: у бригады обед, и такой день это 6 рабочих часов, а не 8. Число
     hoursPerDay СЧИТАЕТСЯ из интервалов, поэтому «во сколько работаем» и «сколько часов
     в дне» физически не могут разойтись. Прежний формат {people, hoursPerDay} без
     интервалов продолжает читаться (см. getCrew) — у кого он сохранён, срок не поедет. */
  var CREW_KEY = "ep_est_crew_v29";
  var DEF_SHIFT = [{ from: "10:00", to: "13:00" }, { from: "15:00", to: "18:00" }];
  var DEF_CREW = { people: 2 };
  var SHIFT_MAX = 4;                        // больше четырёх заходов в день не бывает

  function hhmm(s) {                        // "10:30" -> минуты от полуночи, иначе null
    var m = /^\s*(\d{1,2}):(\d{2})\s*$/.exec(String(s == null ? "" : s));
    if (!m) return null;
    var h = Number(m[1]), mi = Number(m[2]);
    if (!(h >= 0 && h <= 23 && mi >= 0 && mi <= 59)) return null;
    return h * 60 + mi;
  }
  function normShift(list) {
    var out = [];
    (Array.isArray(list) ? list : []).forEach(function (iv) {
      if (!iv) return;
      var a = hhmm(iv.from), b = hhmm(iv.to);
      if (a == null || b == null || b <= a) return;   // «до» раньше «с» — интервал пустой
      if (out.length < SHIFT_MAX) out.push({ from: iv.from, to: iv.to });
    });
    return out;
  }
  function shiftHours(list) {
    var mins = 0;
    normShift(list).forEach(function (iv) { mins += hhmm(iv.to) - hhmm(iv.from); });
    return Math.min(24, Math.round((mins / 60) * 100) / 100);
  }
  function shiftText(list) {
    return normShift(list).map(function (iv) { return iv.from + "–" + iv.to; }).join(", ");
  }
  function getCrew() {
    var v = null;
    try { v = JSON.parse(localStorage.getItem(CREW_KEY) || "null"); } catch (e) {}
    var people = v && v.people > 0 ? Math.min(20, Math.round(v.people)) : DEF_CREW.people;
    var shift = normShift(v && v.shift);
    if (!shift.length && v && v.hoursPerDay > 0) {
      // старая запись без расписания: синтезируем один заход от 09:00, чтобы число
      // часов осталось прежним и поля на экране не были пустыми
      var h = Math.max(1, Math.min(24, Number(v.hoursPerDay)));
      var end = 9 * 60 + Math.round(h * 60);
      shift = normShift([{ from: "09:00", to: pad2(Math.floor(end / 60) % 24) + ":" + pad2(end % 60) }]);
    }
    if (!shift.length) shift = DEF_SHIFT.slice();
    return { people: people, shift: shift, hoursPerDay: shiftHours(shift) };
  }
  function pad2(n) { return (n < 10 ? "0" : "") + n; }
  /* setCrew(people, shift) — shift это массив интервалов ЛИБО число часов (тогда
     синтезируем один заход от 09:00): второй вид оставлен, чтобы прежние вызовы и тесты
     с «часами в смене» продолжали работать. */
  function setCrew(people, shift) {
    var list = Array.isArray(shift) ? normShift(shift) : [];
    if (!list.length && Number(shift) > 0) {
      var end = 9 * 60 + Math.round(Math.min(24, Number(shift)) * 60);
      list = normShift([{ from: "09:00", to: pad2(Math.floor(end / 60) % 24) + ":" + pad2(end % 60) }]);
    }
    if (!list.length) list = DEF_SHIFT.slice();
    var c = { people: Math.max(1, Math.min(20, Math.round(Number(people) || DEF_CREW.people))), shift: list };
    try { localStorage.setItem(CREW_KEY, JSON.stringify(c)); } catch (e) {}
    return { people: c.people, shift: list, hoursPerDay: shiftHours(list) };
  }
  // часы в дне у ЛЮБОГО crew: явный hoursPerDay (старый контракт, в т.ч. из тестов и
  // печати) главнее, иначе считаем из интервалов
  function crewHours(crew) {
    if (!crew) return 0;
    if (crew.hoursPerDay > 0) return Number(crew.hoursPerDay);
    return shiftHours(crew.shift);
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
    // срок: часы одного человека делим на бригаду и рабочие часы дня. Округляем ВВЕРХ до
    // половины дня — «2.1 дня» на объекте всё равно означает три выхода, но дробить до
    // сотых бессмысленно, а округление вниз занижало бы срок в договоре.
    var perDay = crew.people * crewHours(crew);
    var toDays = function (h) { return perDay > 0 ? Math.ceil((h / perDay) * 2) / 2 : 0; };
    stages.forEach(function (s) { s.hours = r1(s.hours); s.days = toDays(s.hours); });
    var sum = stages.reduce(function (a, s) { return a + s.sum; }, 0);
    var hours = r1(stages.reduce(function (a, s) { return a + s.hours; }, 0));
    // ОБЩИЙ срок считается от ОБЩИХ часов, а не суммой этапных: иначе округление вверх
    // у каждого этапа накапливалось бы и срок вырастал на ровном месте (5 этапов дали бы
    // до +2 дней из воздуха). Сумма этапных дней МОЖЕТ быть больше общего — это нормально
    // и честно: бригада не начинает чистовой этап в тот же час, когда закончила черновой.
    return {
      stages: stages, sum: sum, hours: hours, days: toDays(hours),
      crew: crew, hoursPerDay: crewHours(crew), shiftText: shiftText(crew.shift)
    };
  }

  window.EP.EstimateWorks = {
    STAGES: STAGES, NORMS: NORMS, DEF_NORM: DEF_NORM, DEF_SHIFT: DEF_SHIFT, SHIFT_MAX: SHIFT_MAX,
    normFor: normFor, stageOf: stageOf, breakdown: breakdown,
    getCrew: getCrew, setCrew: setCrew, CREW_KEY: CREW_KEY,
    shiftHours: shiftHours, shiftText: shiftText, crewHours: crewHours
  };
})();
