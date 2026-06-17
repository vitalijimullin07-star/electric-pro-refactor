/* Electric Pro V29 — Логика расходников по кабелю/штробам (движок).
   EP.CableConsum: get/set конфиг (нормы) + calc(inputs) -> [{name, qty, unit}].
   Хранилище: ep_cable_consum_logic_v29. Все нормы редактируются на экране «Логика расходников». */
(() => {
  "use strict";
  const KEY = "ep_cable_consum_logic_v29";
  const n = (v, f = 0) => (Number.isFinite(Number(v)) ? Number(v) : f);

  const DEFAULTS = {
    // Прямой монтаж по потолку — на метр поверхностного кабеля (кабель − штроба)
    direct: { pads: 3, ties: 3, perM: 3 },            // площадки/стяжки/(гвоздь+выстрел) на метр
    // Гофра по потолку — на метр; каждая клипса = 1 гвоздь + 1 выстрел
    gofraCeil: { clips: 3 },
    // По полу — на метр полового кабеля; всегда гофра ПНД
    floor: { tapePerM: 0.6, tapeRollM: 20, perM: 4 },  // лента м/м, рулон, (гвоздь+выстрел)/м
    junction: { perBox: 4 },                           // распайка: 4 гвоздя + 4 выстрела
    gofraRoundM: 100,
    packs: { nails: 1000, nailsTol: 200, shots: 1000, shotsTol: 200, ties: 100, pads: 100 },
    discs: { pair: 2, smallLabel: "125 мм (штроба ≤30×30)", bigLabel: "150 мм (штроба 30–55)" },
    drills: { d6: 2, d8: 3 },
    pikes: 1,
    pencil: 1,
    // Мешки: тв = бетон/кирпич/панель, мягкий = газоблок и т.п.
    trashBags: { hardStrobeM: 10, softStrobeM: 20, hardBox: 30, softBox: 50 },
    vacBags: { strobeM: 30, box: 40 },
    // Материалы: hard (для мешков) + ресурс диска (м.п./диск) + ресурс коронки (отв./коронка). Правишь сам.
    materials: {
      "Бетон":  { hard: true,  discM: 60,  coreN: 15 },
      "Кирпич": { hard: true,  discM: 120, coreN: 40 },
      "Панель": { hard: true,  discM: 50,  coreN: 12 },
      "Мягкий": { hard: false, discM: 300, coreN: 120 }
    }
  };

  function deepMerge(base, over) {
    const out = Array.isArray(base) ? base.slice() : Object.assign({}, base);
    if (!over || typeof over !== "object") return out;
    Object.keys(over).forEach(k => {
      if (over[k] && typeof over[k] === "object" && !Array.isArray(over[k]) && base[k] && typeof base[k] === "object") {
        out[k] = deepMerge(base[k], over[k]);
      } else {
        out[k] = over[k];
      }
    });
    return out;
  }

  function get() {
    let saved = {};
    try { saved = JSON.parse(localStorage.getItem(KEY) || "{}") || {}; } catch (e) {}
    return deepMerge(DEFAULTS, saved);
  }
  function set(cfg) {
    try { localStorage.setItem(KEY, JSON.stringify(cfg)); } catch (e) {}
  }
  function reset() {
    try { localStorage.removeItem(KEY); } catch (e) {}
  }
  function materials() { return Object.keys(get().materials); }
  function defaults() { return JSON.parse(JSON.stringify(DEFAULTS)); }

  const roundUpTo = (x, step) => (step > 0 ? Math.ceil(x / step) * step : Math.ceil(x));
  // Пачки гвоздей/выстрелов: до (pack+tol) — одна пачка, дальше +пачка
  const packCount = (count, pack, tol) => Math.max(1, Math.ceil((count - tol) / pack));

  // inputs: { cableM, strobeM, sockets, boxes, surface:"ceil"|"floor", gofra:bool, material, depth:"small"|"big" }
  function calc(inp) {
    inp = inp || {};
    const L = get();
    const cableM = n(inp.cableM), strobeM = n(inp.strobeM), sockets = n(inp.sockets), boxes = n(inp.boxes);
    const surfaceCable = Math.max(0, cableM - strobeM);
    const matName = inp.material && L.materials[inp.material] ? inp.material : materials()[0];
    const mat = L.materials[matName] || { hard: true, discM: 60, coreN: 15 };

    const items = [];
    const add = (name, qty, unit) => { const q = Math.ceil(n(qty)); if (q > 0) items.push({ name, qty: q, unit: unit || "шт" }); };
    let nails = 0, shots = 0;

    if (inp.surface === "floor") {
      add("Гофра ПНД", roundUpTo(surfaceCable, L.gofraRoundM), "м");
      const tapeM = surfaceCable * n(L.floor.tapePerM);
      add(`Лента монтажная (рулон ${L.floor.tapeRollM} м)`, Math.ceil(tapeM / n(L.floor.tapeRollM, 20)), "рулон");
      nails += surfaceCable * n(L.floor.perM);
      shots += surfaceCable * n(L.floor.perM);
    } else if (inp.gofra) {
      add("Гофра", roundUpTo(surfaceCable, L.gofraRoundM), "м");
      const clips = Math.ceil(surfaceCable * n(L.gofraCeil.clips));
      add("Клипсы для гофры", clips, "шт");
      nails += clips; shots += clips;
    } else {
      add("Площадки под стяжку (прямой монтаж)", roundUpTo(surfaceCable * n(L.direct.pads), L.packs.pads), "шт");
      add("Стяжки кабельные", roundUpTo(surfaceCable * n(L.direct.ties), L.packs.ties), "шт");
      nails += surfaceCable * n(L.direct.perM);
      shots += surfaceCable * n(L.direct.perM);
    }

    // Распайки — всегда
    nails += boxes * n(L.junction.perBox);
    shots += boxes * n(L.junction.perBox);
    nails = Math.ceil(nails); shots = Math.ceil(shots);

    if (nails > 0) {
      const p = packCount(nails, n(L.packs.nails, 1000), n(L.packs.nailsTol));
      add(`Гвозди для пистолета (упак. ${L.packs.nails})`, p * n(L.packs.nails, 1000), "шт");
    }
    if (shots > 0) {
      const c = packCount(shots, n(L.packs.shots, 1000), n(L.packs.shotsTol));
      add(`Газовый баллон (≈${L.packs.shots} выстр.)`, c, "баллон");
    }

    // Диски — по штробе, ресурс материала, парами
    if (strobeM > 0) {
      const pairs = Math.ceil(strobeM / n(mat.discM, 60));
      add("Диск " + (inp.depth === "big" ? L.discs.bigLabel : L.discs.smallLabel), pairs * n(L.discs.pair, 2), "шт");
    }
    // Коронки — по подрозетникам
    if (sockets > 0) add("Коронка по «" + matName.toLowerCase() + "»", Math.ceil(sockets / n(mat.coreN, 15)), "шт");

    // Буры / пики / карандаш — фикс на объект
    add("Бур 6 мм", L.drills.d6, "шт");
    add("Бур 8 мм", L.drills.d8, "шт");
    add("Пика", L.pikes, "шт");
    add("Карандаш", L.pencil, "шт");

    // Мешки — штроба + подрозетники
    const trash = strobeM / (mat.hard ? n(L.trashBags.hardStrobeM, 10) : n(L.trashBags.softStrobeM, 20))
                + sockets / (mat.hard ? n(L.trashBags.hardBox, 30) : n(L.trashBags.softBox, 50));
    add("Мешки мусорные", Math.ceil(trash), "шт");
    const vac = strobeM / n(L.vacBags.strobeM, 30) + sockets / n(L.vacBags.box, 40);
    add("Мешки для пылесоса", Math.ceil(vac), "шт");

    return items;
  }

  window.EP = window.EP || {};
  window.EP.CableConsum = { get, set, reset, calc, materials, defaults, KEY };
})();
