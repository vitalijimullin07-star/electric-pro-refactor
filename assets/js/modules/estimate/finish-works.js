/* Electric Pro V29 — ЧИСТОВЫЕ РАБОТЫ: общий каталог + счёт по точкам.
   Просьба пользователя: прайс «всех черновых, а потом чистовых работ с выбором».
   Черновые работы (штробы, подрозетники, кабель, коробки, щит) приложение и так считает
   по чертежу само. Чистовых не считал НИКТО: ни точный счёт по трассам, ни пул — розетка
   стояла на плане, а «Установка розетки» в смету не попадала, и этап «Чистовой» в смете
   по работам оставался пустым, пока мастер не добавит всё руками.

   Здесь ОДИН каталог чистовых работ, из которого читают три места — разойтись им негде:
     1) «💰 Цены на работы» (database/price-setup.js) — список цен, раздел «Чистовые»;
     2) «Проект квартиры → Расчёт» (plan-calc.js) — счёт по точкам плана;
     3) «Пул розеток» (pool-v29.js) — счёт по постам блоков.
   «С ВЫБОРОМ» — отметка «делаю сам» у каждой работы. Она решает и то, есть ли строка в
   списке цен, и то, попадёт ли работа в смету: электрик, который люстры не вешает,
   не должен получать «Установку светильника» в каждой смете и вычёркивать её руками.
   Отметка — свойство УСТРОЙСТВА (мастера), не проекта: это «что я делаю», а не «что на
   этом объекте». Хранятся только ОТЛИЧИЯ от умолчания каталога — новая работа, добавленная
   в каталог позже, придёт со своим умолчанием, а не молча выключенной.

   ИМЕНА подобраны так, чтобы ни одно не было подстрокой другого: цена в смете ищется
   двунаправленной подстрокой (EP.NameMatch), и «Установка розетки» без уточнения тихо
   брала бы цену «Установки розетки интернет», если свою мастер не вписал. Поэтому
   «Установка розетки 220В», «Установка прочего датчика» и т.п. — тест это стережёт.
   Чистая логика без DOM: модуль грузится и в фоновый вычислитель плана (solver-worker.js). */
(function () {
  "use strict";
  var root = (typeof window !== "undefined" && window) || self;
  root.EP = root.EP || {};

  var KEY = "ep_finish_works_v1";

  var GROUPS = [
    { id: "mech", title: "Розетки и выключатели" },
    { id: "light", title: "Освещение" },
    { id: "lv", title: "Датчики и слаботочка" },
    { id: "equip", title: "Подключение оборудования" },
    { id: "extra", title: "Ещё работы — без автосчёта", hint: "Их нет на чертеже как отдельных точек, поэтому в смету сами не попадают. Цена ляжет в базу — позицию можно взять вручную из «Работы»." }
  ];

  // on — умолчание «делаю сам»; manual — в список цен, но в автосчёт не идёт
  var CATALOG = [
    { id: "socket", group: "mech", name: "Установка розетки 220В", unit: "шт", on: true },
    { id: "socket3", group: "mech", name: "Установка розетки 380В (3ф)", unit: "шт", on: true },
    { id: "sw1", group: "mech", name: "Установка выключателя 1-клавишного", unit: "шт", on: true },
    { id: "sw2", group: "mech", name: "Установка выключателя 2-клавишного", unit: "шт", on: true },
    { id: "sw3", group: "mech", name: "Установка выключателя 3-клавишного", unit: "шт", on: true },
    { id: "pass", group: "mech", name: "Установка выключателя проходного", unit: "шт", on: true },
    { id: "cross", group: "mech", name: "Установка выключателя перекрёстного", unit: "шт", on: true },
    { id: "internet", group: "mech", name: "Установка розетки интернет RJ45", unit: "шт", on: true },
    { id: "tv", group: "mech", name: "Установка розетки ТВ", unit: "шт", on: true },

    { id: "light", group: "light", name: "Установка светильника", unit: "шт", on: true },
    { id: "bra", group: "light", name: "Установка бра", unit: "шт", on: true },
    { id: "track", group: "light", name: "Установка трековой системы", unit: "шт", on: true },
    { id: "led", group: "light", name: "Монтаж светодиодной ленты", unit: "м", on: true },
    { id: "out24", group: "light", name: "Подключение вывода 24В", unit: "шт", on: true },

    { id: "pir", group: "lv", name: "Установка датчика движения", unit: "шт", on: true },
    { id: "lux", group: "lv", name: "Установка датчика освещённости", unit: "шт", on: true },
    { id: "leak", group: "lv", name: "Установка датчика протечки", unit: "шт", on: true },
    { id: "sensor", group: "lv", name: "Установка прочего датчика", unit: "шт", on: true },
    { id: "camera", group: "lv", name: "Установка видеокамеры", unit: "шт", on: true },
    { id: "intercom", group: "lv", name: "Установка домофона", unit: "шт", on: true },

    { id: "thermo", group: "equip", name: "Установка терморегулятора тёплого пола", unit: "шт", on: true },
    { id: "output", group: "equip", name: "Подключение оборудования к выводу", unit: "шт", on: true },
    { id: "output3", group: "equip", name: "Подключение трёхфазного оборудования", unit: "шт", on: true },
    // кондиционер обычно подключают сами климатчики — по умолчанию выключено
    { id: "ac", group: "equip", name: "Подключение кондиционера", unit: "шт", on: false },

    { id: "chandelier", group: "extra", name: "Сборка и установка люстры", unit: "шт", on: false, manual: true },
    { id: "spot", group: "extra", name: "Установка точечного светильника", unit: "шт", on: false, manual: true },
    { id: "dimmer", group: "extra", name: "Установка диммера", unit: "шт", on: false, manual: true },
    { id: "bell", group: "extra", name: "Установка звонка", unit: "шт", on: false, manual: true },
    { id: "fan", group: "extra", name: "Установка вытяжного вентилятора", unit: "шт", on: false, manual: true },
    { id: "replace", group: "extra", name: "Замена механизма розетки/выключателя", unit: "шт", on: false, manual: true }
  ];
  var BY_ID = {};
  CATALOG.forEach(function (c) { BY_ID[c.id] = c; });

  // ---------- выбор «делаю сам» (только отличия от умолчания) ----------
  function readOv() {
    var o = null;
    try { o = JSON.parse(root.localStorage.getItem(KEY) || "null"); } catch (e) { o = null; }
    return (o && typeof o === "object" && !Array.isArray(o)) ? o : {};
  }
  function writeOv(o) {
    try { root.localStorage.setItem(KEY, JSON.stringify(o || {})); } catch (e) {}
    try {
      if (root.dispatchEvent && typeof CustomEvent === "function") root.dispatchEvent(new CustomEvent("ep:finish-works-changed"));
    } catch (e) {}
  }
  function isOn(id) {
    var c = BY_ID[id];
    if (!c) return false;
    var ov = readOv();
    return Object.prototype.hasOwnProperty.call(ov, id) ? !!ov[id] : !!c.on;
  }
  function setOn(id, on) {
    var c = BY_ID[id];
    if (!c) return;
    var ov = readOv();
    if (!!on === !!c.on) delete ov[id]; else ov[id] = !!on;
    writeOv(ov);
  }
  function setMany(ids, on) {
    var ov = readOv();
    (ids || []).forEach(function (id) {
      var c = BY_ID[id]; if (!c) return;
      if (!!on === !!c.on) delete ov[id]; else ov[id] = !!on;
    });
    writeOv(ov);
  }
  // снимок выбора — для фонового вычислителя (у него своего хранилища нет)
  function snapshot() { return readOv(); }
  function load(ov) {
    try { root.localStorage.setItem(KEY, JSON.stringify(ov && typeof ov === "object" ? ov : {})); } catch (e) {}
  }
  function reset() { writeOv({}); }

  // ---------- счёт ----------
  var n = function (v) { v = Number(v); return v > 0 ? v : 0; };
  function swId(keys, kind) {
    if (kind === "pass") return "pass";
    if (kind === "cross") return "cross";
    var k = Math.max(1, Math.min(3, Math.round(Number(keys) || 1)));
    return "sw" + k;
  }
  // тип точки плана → работа (null — у точки нет чистовой работы: распайка, стояк, щит…)
  function planIdOf(el) {
    switch (el.type) {
      case "socket": return "socket";
      case "switch": return swId(el.keys, el.swKind);
      case "internet": return "internet";
      case "tv": return "tv";
      case "light": return "light";
      case "bra": return "bra";
      case "track": return "track";
      case "output24": return "out24";
      case "pir": return "pir";
      case "lux": return "lux";
      case "leak": return "leak";
      case "sensor": return "sensor";
      case "camera": return "camera";
      case "intercom": return "intercom";
      case "warmfloor": return "thermo";
      case "output": return "output";
      case "output3": return el.threeKind === "socket" ? "socket3" : "output3";
      case "ac": return "ac";
      default: return null;
    }
  }
  var POST_ID = { socket: "socket", tv: "tv", internet: "internet" };

  /* Счёт по проекту плана: ВСЕ этажи (смета общая на проект, как и остальной расчёт).
     roomOf(el) — имя помещения для «ⓘ Откуда взялось»; без него всё в одну кучу. */
  function countPlan(p, roomOf) {
    var counts = {}, rooms = {};
    var G = root.EP.Plan && root.EP.Plan.Geometry;
    function inc(id, q, room) {
      if (!id || !(q > 0)) return;
      counts[id] = (counts[id] || 0) + q;
      var r = (rooms[id] = rooms[id] || {});
      var rn = room || "без помещения";
      r[rn] = (r[rn] || 0) + q;
    }
    ((p && p.elements) || []).forEach(function (el) {
      if (!el || !el.type) return;
      var room = roomOf ? roomOf(el) : "";
      if (el.type === "block") {
        var items = (el.params && el.params.items) || [];
        items.forEach(function (t, i) {
          if (t === "switch") {
            var m = (G && G.postMeta) ? G.postMeta(el, i) : { keys: 1, swKind: "normal" };
            inc(swId(m.keys, m.swKind), 1, room);
          } else inc(POST_ID[t], 1, room);
        });
        return;
      }
      inc(planIdOf(el), 1, room);
    });
    // светодиодная лента — метры по стене; помещение — по стене, на которой она висит
    ((p && p.ledStrips) || []).forEach(function (ls) {
      if (!ls) return;
      var cm = Math.abs(n(ls.offsetB) - n(ls.offsetA));
      if (!(cm > 0)) return;
      var rn = "без помещения";
      var rid = ls.wallId && String(ls.wallId).indexOf("beam:") !== 0 ? String(ls.wallId).split(":")[0] : null;
      var r = rid ? ((p.rooms || []).find(function (x) { return x.id === rid; })) : null;
      if (r) rn = r.name;
      inc("led", cm / 100, rn);
    });
    return { counts: counts, rooms: rooms };
  }

  /* Счёт по блокам пула: посты блоков + отдельные линии (dedicated). */
  var POOL_DED = { "Кондей": "ac", "Стиралка": "socket", "Сушилка": "socket", "Плита": "output" };
  function countPool(blocks) {
    var counts = {};
    var inc = function (id, q) { if (id && q > 0) counts[id] = (counts[id] || 0) + q; };
    (blocks || []).forEach(function (b) {
      if (!b) return;
      if (b.dedicated) { inc(POOL_DED[b.dedicated], 1); return; }
      inc("socket", n(b.sockets));
      inc("sw1", n(b.sw1)); inc("sw2", n(b.sw2)); inc("sw3", n(b.sw3));
      inc("pass", n(b.pass)); inc("cross", n(b.cross));
      inc("tv", n(b.tv)); inc("internet", n(b.internet));
      inc("thermo", n(b.warmFloor));
    });
    return { counts: counts, rooms: {} };
  }

  /* Счёт → позиции сметы: только отмеченные «делаю сам» и не ручные, в порядке каталога
     (так они и лягут в смету — группами, а не вперемешку). finish:true — чтобы «Расчёт»
     вынес их отдельным разделом «Чистовые работы». */
  function items(res) {
    var counts = (res && res.counts) || res || {};
    var out = [];
    CATALOG.forEach(function (c) {
      if (c.manual || !isOn(c.id)) return;
      var q = counts[c.id];
      if (!(q > 0)) return;
      q = c.unit === "шт" ? Math.round(q) : Math.round(q * 10) / 10;
      if (q > 0) out.push({ type: "work", name: c.name, qty: q, unit: c.unit, finish: true });
    });
    return out;
  }

  var isFinishName = function (name) {
    var s = String(name || "").trim().toLowerCase();
    return CATALOG.some(function (c) { return c.name.toLowerCase() === s; });
  };

  root.EP.FinishWorks = {
    KEY: KEY, GROUPS: GROUPS, CATALOG: CATALOG,
    isOn: isOn, setOn: setOn, setMany: setMany, snapshot: snapshot, load: load, reset: reset,
    countPlan: countPlan, countPool: countPool, items: items, isFinishName: isFinishName
  };
})();
