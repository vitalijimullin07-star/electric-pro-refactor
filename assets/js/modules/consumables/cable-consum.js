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
    wetFactor: 1.5,  // ресурс дисков/коронок при резе с водой (×). 1 = как насухо
    packs: { nails: 1000, nailsTol: 200, shots: 1000, shotsTol: 200, ties: 100, pads: 100 },
    discs: { pair: 2 },
    drills: { d6: 2, d8: 3 },
    pikes: 1,
    pencil: 1,
    // Мешки: тв = бетон/кирпич/панель, мягкий = газоблок и т.п.
    trashBags: { hardStrobeM: 10, softStrobeM: 20, hardBox: 30, softBox: 50 },
    vacBags: { strobeM: 30, box: 40 },
    // Инструмент списком: коронки/диски, привязка к функции, ресурс по материалам. Диск — depth (под размер штробы).
    tools: [
      { id: "t76", kind: "crown", size: 76, fn: "podroz", life: { "Бетон": 15, "Кирпич": 40, "Панель": 12, "Мягкий": 120 } },
      { id: "t82", kind: "crown", size: 82, fn: "boxes",  life: { "Бетон": 12, "Кирпич": 30, "Панель": 10, "Мягкий": 90 } },
      { id: "t52", kind: "crown", size: 52, fn: "other",  life: { "Бетон": 20, "Кирпич": 50, "Панель": 16, "Мягкий": 150 } },
      { id: "d125", kind: "disc", size: 125, depth: "small", fn: "strobe", life: { "Бетон": 60,  "Кирпич": 120, "Панель": 50, "Мягкий": 300 } },
      { id: "d150", kind: "disc", size: 150, depth: "big",   fn: "strobe", life: { "Бетон": 50,  "Кирпич": 100, "Панель": 40, "Мягкий": 250 } }
    ],
    // Материалы: hard (мешки) + ресурс дисков (м/шт по размеру 125/150) + ресурс коронок (отв/шт по 52/76/82). Правишь сам.
    materials: {
      "Бетон":  { hard: true,  disc: { "125": 60,  "150": 50 },  crown: { "52": 20,  "76": 15,  "82": 12 } },
      "Кирпич": { hard: true,  disc: { "125": 120, "150": 100 }, crown: { "52": 50,  "76": 40,  "82": 30 } },
      "Панель": { hard: true,  disc: { "125": 50,  "150": 40 },  crown: { "52": 16,  "76": 12,  "82": 10 } },
      "Мягкий": { hard: false, disc: { "125": 300, "150": 250 }, crown: { "52": 150, "76": 120, "82": 90 } }
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
    const cfg = deepMerge(DEFAULTS, saved);
    if (Array.isArray(saved.tools)) cfg.tools = saved.tools;
    Object.keys(cfg.materials || {}).forEach(m => {
      const o = cfg.materials[m]; if (!o) return;
      if (o.discM != null && !o.disc) o.disc = { "125": n(o.discM, 60), "150": Math.max(1, Math.round(n(o.discM, 60) * 0.85)) };
      if (o.coreN != null && !o.crown) o.crown = { "52": Math.round(n(o.coreN, 15) * 1.3), "76": n(o.coreN, 15), "82": Math.max(1, Math.round(n(o.coreN, 15) * 0.8)) };
      if (!o.disc) o.disc = { "125": 60, "150": 50 };
      if (!o.crown) o.crown = { "52": 20, "76": 15, "82": 12 };
    });
    return cfg;
  }
  function set(cfg) {
    try { localStorage.setItem(KEY, JSON.stringify(cfg)); } catch (e) {}
  }
  function reset() {
    try { localStorage.removeItem(KEY); } catch (e) {}
  }
  function materials() { return ["Бетон", "Кирпич", "Панель", "Мягкий"]; }
  function defaults() { return JSON.parse(JSON.stringify(DEFAULTS)); }

  const FUNCTIONS = { podroz: "Подрозетники", boxes: "Распайки", strobe: "Штроба (диск)", shield: "Ниша щита", breezer: "Отверстие под бризер", sewer: "Канализация", other: "Иное" };

  const roundUpTo = (x, step) => (step > 0 ? Math.ceil(x / step) * step : Math.ceil(x));
  // Пачки гвоздей/выстрелов: до (pack+tol) — одна пачка, дальше +пачка
  const packCount = (count, pack, tol) => Math.max(1, Math.ceil((count - tol) / pack));

  // inputs: { mode:"single"|"mount"|"material", cableM, strobeM, sockets, boxes, surface, gofra, material, depth, wet, shield, breezer, sewer, otherCounts }
  function calc(inp) {
    inp = inp || {};
    const L = get();
    const mode = inp.mode || "single";
    const cableM = n(inp.cableM), strobeM = n(inp.strobeM), sockets = n(inp.sockets), boxes = n(inp.boxes);
    const surfaceCable = Math.max(0, cableM - strobeM);
    const matName = inp.material && L.materials[inp.material] ? inp.material : materials()[0];
    const mat = L.materials[matName] || { hard: true };
    const wf = inp.wet ? n(L.wetFactor, 1.5) : 1;

    const items = [];
    const add = (name, qty, unit) => { const q = Math.ceil(n(qty)); if (q > 0) items.push({ name, qty: q, unit: unit || "шт" }); };

    // Крепёж + распайки + фикс — один раз (в режиме "material" пропускаем)
    if (mode !== "material") {
      let nails = 0, shots = 0;
      if (inp.surface === "floor") {
        add("Гофра ПНД", roundUpTo(surfaceCable, L.gofraRoundM), "м");
        add(`Лента монтажная (рулон ${L.floor.tapeRollM} м)`, Math.ceil(surfaceCable * n(L.floor.tapePerM) / n(L.floor.tapeRollM, 20)), "рулон");
        nails += surfaceCable * n(L.floor.perM); shots += surfaceCable * n(L.floor.perM);
      } else if (inp.gofra) {
        add("Гофра", roundUpTo(surfaceCable, L.gofraRoundM), "м");
        const clips = Math.ceil(surfaceCable * n(L.gofraCeil.clips));
        add("Клипсы для гофры", clips, "шт"); nails += clips; shots += clips;
      } else {
        add("Площадки под стяжку (прямой монтаж)", roundUpTo(surfaceCable * n(L.direct.pads), L.packs.pads), "шт");
        add("Стяжки кабельные", roundUpTo(surfaceCable * n(L.direct.ties), L.packs.ties), "шт");
        nails += surfaceCable * n(L.direct.perM); shots += surfaceCable * n(L.direct.perM);
      }
      nails += boxes * n(L.junction.perBox); shots += boxes * n(L.junction.perBox);
      nails = Math.ceil(nails); shots = Math.ceil(shots);
      if (nails > 0) add(`Гвозди для пистолета (упак. ${L.packs.nails})`, packCount(nails, n(L.packs.nails, 1000), n(L.packs.nailsTol)) * n(L.packs.nails, 1000), "шт");
      if (shots > 0) add(`Газовый баллон (≈${L.packs.shots} выстр.)`, packCount(shots, n(L.packs.shots, 1000), n(L.packs.shotsTol)), "баллон");
      add("Бур 6 мм", L.drills.d6, "шт");
      add("Бур 8 мм", L.drills.d8, "шт");
      add("Пика", L.pikes, "шт");
      add("Карандаш", L.pencil, "шт");
    }

    // Инструмент списком (привязка к функции). podroz/strobe — на метраж материала; остальные — объектные.
    const PERMAT = { podroz: 1, strobe: 1 };
    const fnQty = { podroz: sockets, boxes: boxes, strobe: strobeM, shield: n(inp.shield), breezer: n(inp.breezer), sewer: n(inp.sewer) };
    (L.tools || []).forEach(tool => {
      if (!tool || tool.off) return;
      const isPerMat = !!PERMAT[tool.fn];
      if (mode === "mount" && isPerMat) return;
      if (mode === "material" && !isPerMat) return;
      let src = (tool.fn === "other") ? n((inp.otherCounts || {})[tool.id]) : n(fnQty[tool.fn]);
      if (tool.kind === "disc" && tool.depth && inp.depth && tool.depth !== inp.depth) src = 0;
      const life = n(tool.life && tool.life[matName], 0) * wf;
      if (src <= 0 || life <= 0) return;
      const pair = (tool.kind === "disc") ? n(L.discs.pair, 2) : 1;
      const nm = (tool.kind === "disc" ? "Диск " : "Коронка ") + tool.size + " мм" + (tool.fn === "other" && tool.work ? " (" + tool.work + ")" : "");
      add(nm, Math.ceil(src / life) * pair, "шт");
    });

    // Мешки — на метраж материала (в режиме "mount" пропускаем)
    if (mode !== "mount") {
      const trash = strobeM / (mat.hard ? n(L.trashBags.hardStrobeM, 10) : n(L.trashBags.softStrobeM, 20))
                  + sockets / (mat.hard ? n(L.trashBags.hardBox, 30) : n(L.trashBags.softBox, 50));
      add("Мешки для строительного мусора", Math.ceil(trash), "шт");
      const vac = strobeM / n(L.vacBags.strobeM, 30) + sockets / n(L.vacBags.box, 40);
      add("Мешки для пылесоса", Math.ceil(vac), "шт");
    }

    return items;
  }

  window.EP = window.EP || {};
  window.EP.CableConsum = { get, set, reset, calc, materials, defaults, functions: () => FUNCTIONS, KEY };
})();
