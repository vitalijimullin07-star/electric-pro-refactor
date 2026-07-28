/* Electric Pro V29 — Проект квартиры: расчёт и смета (Слой 5).
   Мост в EP.PoolEngine: точки по комнатам -> блоки -> штробы/подрозетники/
   распайки/коннекторы (draftItems). Кабель — по построенным трассам.
   Цены подтягиваются из EP.Database по совпадению названия. Кнопка «В смету». */
(() => {
  "use strict";
  window.EP = window.EP || {};

  const T = {
    title: "Расчёт", close: "Закрыть", toEstimate: "📋 В смету",
    noRooms: "Нет комнат — нарисуй план.", noElems: "Нет точек — добавь в режиме 🔌.",
    cable: "Кабель по трассам", noRoutes: "трассы не построены (🧵)",
    room: "Комната",
    engineMissing: "Движок расчёта недоступен.",
    workHead: "Работы и материалы (по движку пула)",
    exactHead: "Работы и материалы — ПО ТРАССАМ (точный счёт)",
    exactHint: "Штробы, подрозетники и кабель посчитаны по фактическому чертежу: длина спуска × материал стены, ёмкость штробы — из движка пула.",
    approxHint: "⚠ Приближённый счёт по комнатам. Построй трассы (🧵) — расчёт станет точным по чертежу.",
    reserve: "Запас кабеля, %",
    stubHint: "Выпуск кабеля на разделку (добавляется к длине каждого конца кабеля отдельно от самой трассы)",
    stubPoint: "У точки, см", stubJunction: "У распайки, см", stubPanel: "В щите, см",
    tempHint: "Временные сети на время ремонта (организация — не выводится из чертежа, вводится вручную)",
    tempLighting: "Врем. освещение, точек", tempSockets: "Врем. розетки, точек",
    noPrice: "нет цены в БД", total: "Итого по ценам БД",
    priceTitle: "Цена", priceLabel: "Цена за", priceSave: "✓ Сохранить в БД",
    priceHint: "Сохранится в «Мою БД» — эта же цена подставится автоматически в этом и других проектах.",
    consumCfg: "⚙ Настроить расходники", consumTitle: "⚙ Логика расходников", back: "‹ Назад",
    addItem: "+ Добавить позицию", addTitle: "➕ Своя позиция",
    editTitle: "✎ Заменить позицию",
    editHint: "Количество остаётся по чертежу — меняется только название (например, другой кабель или расходник). Цена ищется в БД уже по новому названию. Пустое поле / исходное название — вернуть как было.",
    hiddenN: (n) => `Скрыто позиций: ${n}`, restoreAll: "↩ вернуть все",
    nameLbl: "Название", qtyLbl: "Кол-во", unitLbl: "Ед. изм.",
    typeWork: "Работа", typeMaterial: "Материал", saveBtn: "✓ Сохранить",
    byLines: "По линиям (QF)", secCable: "Кабель", secConsum: "Расходники",
    secMaterial: "Материалы", secWork: "Работы",
    cableTitle: "🔌 Кабель линии", cableLbl: "Марка/сечение",
    cableFromDb: "Выбери из БД (раздел «Материалы») или впиши свою марку:",
    cableNoDb: "В активной БД нет позиций-кабелей — впиши марку вручную (можно добавить кабели в «Базу данных»).",
    rgbLbl: "Тип 24В:", rgbMono: "Монохром", rgbOn: "RGB",
    c24Lbl: "24В от щита (монохром)", c24RgbLbl: "24В от щита (RGB)",
    c24Hint: "Кабель «от щита до точки 24В»: у монохромного вывода 2 жилы, у RGB — 5 (общий + 3 канала). Марка «до щита» (первичка от выключателя) считается сама: 1 клавиша на 24В — 3 жилы, 2-3 клавиши — 5 жил.",
    brandLbl: "Марка кабеля по умолчанию", brandHint: "Подставляется перед сечением там, где марка линии не задана вручную (однолинейка, «По линиям», смета): ВВГнг(А)-LS, ВВГнг, КГ… Пустое поле — только сечение.",
    cableHint: "Марка/сечение кабеля именно этой линии — поменяет и материал, и «Прокладку кабеля» в смете. Пустое поле — автоподбор по нагрузке/автомату, как раньше."
  };
  // Категории для секций сметы: имя позиции → ключ секции (порядок вывода ниже).
  // Расходники (крепёж/гофра/лента/стяжки/буры/коронки/мешки) выносим ОТДЕЛЬНО от
  // прочих материалов — просьба пользователя «информативно по расходке».
  const CONSUM_RE = /гофра|лента монтажная|стяжк|площадк|клипс|гвозд|дюбел|бур |бур$|пик|коронк|диск |диск$|мешк|карандаш|термоусад|выстрел|скоб|баллон/i;
  function sectionOf(it) {
    const n = String(it.name || "");
    if (it.type === "material" && /^кабель/i.test(n)) return "cable";
    if (CONSUM_RE.test(n)) return "consum";
    return it.type === "work" ? "work" : "material";
  }
  const SECTIONS = [["cable", "🔌 Кабель"], ["work", "🔨 Работы"], ["material", "📦 Материалы"], ["consum", "🧰 Расходники"]];

  // Разбивка по линиям QF (информ. сводка, не пересчёт сметы): по каждой линии —
  // автомат/УЗО, длина кабеля (марка) по трассам, число точек и подрозетников,
  // проходок. Агрегируется прямо по p.routes/p.elements, отдельной модели не надо.
  function perCircuit(p) {
    const RT = EP.Plan.Routes; if (!RT) return null;
    const routes = p.routes || [];
    const s = p.settings, reserve = 1 + (Number(s.cableReserve == null ? 10 : s.cableReserve) || 0) / 100;
    const byId = {};
    const row = (id) => (byId[id] = byId[id] || { cableLen: 0, mark: null, points: 0, posts: 0, crossings: 0, has24: false });
    (p.elements || []).forEach((e) => {
      if (e.status === "existing" || e.type === "junction") return;
      if (!e.circuitId) return;
      const r = row(e.circuitId);
      r.points++;
      const posts = e.type === "block" ? ((e.params && e.params.items) || []).length : 1;
      r.posts += posts;
    });
    routes.forEach((rt) => {
      if (!rt.circuitId) return;
      const el = (p.elements || []).find((e) => e.id === rt.fromId);
      const pn = rt.toPanel ? (p.panels || []).find((x) => x.id === rt.toId) : null;
      const L = G().polylineLen(rt.points || []) + (el ? RT.pointVert(p, el) * RT.hopVertMul(p, rt) : 0) + (rt.toPanel ? RT.panelVert(p, pn) : 0) + RT.cableStub(p, el, rt);
      const r = row(rt.circuitId);
      r.cableLen += L; r.crossings += (rt.throughWalls || []).length;
      if (rt.leg === "pri24" || rt.leg === "sec24") r.has24 = true; // линия с 24В-разводкой (до/от щита)
      const cc = (p.circuits || []).find((c) => c.id === rt.circuitId);
      if (!r.mark) {
        const i24 = r.has24 || is24Circuit(p, rt.circuitId);
        r.mark = (cc && cc.cable) || defaultCableMark(p, rt.layer, i24, i24 && !!(cc && cc.rgb));
      }
    });
    return (p.circuits || []).map((c) => {
      const r = byId[c.id] || { cableLen: 0, mark: c.cable || null, points: 0, posts: 0, crossings: 0, has24: false };
      const i24 = r.has24 || is24Circuit(p, c.id);
      // автоподбор марок для 24В-линии, чтобы кнопки «до щита»/«от щита» показывали то, что
      // реально уйдёт в смету, а не «—», когда марка вручную не задана
      let auto24 = null, auto220 = null;
      if (i24) {
        auto24 = defaultCableMark(p, "lv", true, !!c.rgb);
        const R = EP.Plan.Routes;
        let k = 1;
        (p.elements || []).forEach((sw) => {
          if (sw.type !== "switch" || !R || !R.keys24Of) return;
          const tids = (sw.targetIds || []).concat(sw.targetId ? [sw.targetId] : []);
          const feeds = tids.some((id) => { const t = (p.elements || []).find((e) => e.id === id); return t && t.type === "output24" && t.circuitId === c.id; });
          if (feeds) k = Math.max(k, R.keys24Of(p, sw));
        });
        auto220 = EP.Plan.Core.cableMark(p, k >= 2 ? "5×1.5" : "3×1.5");
      }
      return { id: c.id, name: c.name, color: c.color, breaker: c.breaker, rcd: c.rcd, is24: i24, rgb: c.rgb == null ? null : !!c.rgb, auto24, auto220,
        cableLen: Math.round((r.cableLen / 100) * reserve * 10) / 10, mark: r.mark, points: r.points, posts: r.posts, crossings: r.crossings,
        has24: r.has24, cable: c.cable || null, cable220: c.cable220 || null };
    }).filter((r) => r.points > 0 || r.cableLen > 0);
  }
  const COLS = [["sockets", "Р"], ["sw", "В"], ["light", "С"], ["tv", "ТВ"], ["internet", "И"], ["warm", "ТП"]];

  const esc = (s) => String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const core = () => EP.Plan.Core;
  const G = () => EP.Plan.Geometry;
  const rooms = () => EP.Plan.Rooms;

  // ---------- сбор блоков по комнатам ----------
  function roomStats(p, room) {
    const els = G().elementsInRoom(p, room.id).filter((e) => e.status !== "existing");
    // блоки (рамки) раскрываются на посты
    const n = { socket: 0, switch: 0, light: 0, tv: 0, internet: 0, warmfloor: 0, ac: 0 };
    const socketHeights = [];
    els.forEach((e) => {
      if (e.type === "block") {
        ((e.params && e.params.items) || []).forEach((it) => {
          if (n[it] != null) n[it]++;
          if (it === "socket") socketHeights.push(e.height);
        });
      } else {
        if (n[e.type] != null) n[e.type]++;
        if (e.type === "socket") socketHeights.push(e.height);
      }
    });
    const medianH = socketHeights.length
      ? socketHeights.sort((a, b) => a - b)[Math.floor(socketHeights.length / 2)]
      : (p.settings.heightPresets.socket || 30);
    return {
      room, sockets: n.socket, sw: n.switch, light: n.light,
      tv: n.tv, internet: n.internet, warm: n.warmfloor,
      ac: n.ac, height: medianH, material: room.material || p.settings.wallMaterial || "Бетон"
    };
  }
  function buildBlocks(p) {
    return (p.rooms || []).map((room) => roomStats(p, room)).filter((s) =>
      s.sockets + s.sw + s.light + s.tv + s.internet + s.warm + s.ac > 0
    );
  }

  function runEngine(p, stats) {
    if (!window.EP.PoolEngine) return null;
    const blocks = stats.map((s) => ({
      material: s.material,
      route: p.settings.routeType === "floor" ? "floor" : "ceiling",
      height: s.height,
      sockets: s.sockets, sw1: s.sw, sw2: 0, sw3: 0, pass: 0, cross: 0,
      tv: s.tv, internet: s.internet, warmFloor: s.warm
    }));
    try {
      return EP.PoolEngine.calc({ blocks, ceilingHeight: p.settings.ceilingHeight, mode: "junction" });
    } catch (e) { return null; }
  }

  // ---------- ТОЧНЫЙ счёт по фактическим трассам ----------
  // Логика штробы — из движка пула (ёмкость 25×30 по вместимости кабелей),
  // но применённая к реальному чертежу: спуск каждой точки по СВОЕЙ стене и
  // ЕЁ материалу; ТП — 50×50 в пол; слаботочка — ОТДЕЛЬНАЯ штроба и строка
  // (не смешивается с силовой, даже когда физический размер сечения совпадает).
  // Ниша под щит — как в конфигураторе щита: вырубка × модули + монтаж.
  const LV_LAYERS = { lv: 1, tv: 1, cctv: 1 };
  // Линия 24В: вся её нагрузка — точки «Вывод 24В». У output24 слой lv, поэтому без
  // отдельной проверки такая линия попадала бы в LV_LAYERS и получала марку «Витая пара»
  // (просьба пользователя: линии 24В маркировать как 24В и давать им силовой кабель).
  function is24Circuit(p, circuitId) {
    if (!circuitId) return false;
    const els = (p.elements || []).filter((e) => e.circuitId === circuitId && e.type !== "junction");
    return els.length > 0 && els.every((e) => e.type === "output24");
  }
  // Марка кабеля ПО УМОЛЧАНИЮ (когда circuit.cable не задан вручную) — ЕДИНАЯ для сметы
  // и для блока «По линиям (QF)»: раньше смета подставляла «ВВГнг(А)-LS 3×2.5», а «По
  // линиям» на тех же данных — «3×2.5», т.е. одна линия показывала разные марки.
  // Бренд берётся из settings.cableBrand (EP.Plan.Core.cableMark), сечение — по слою.
  function defaultCableMark(p, layer, is24, rgb) {
    const C = EP.Plan.Core;
    // 24В «от щита»: своя марка из настроек (КГ ВВГнг-LS 2×2.5), у RGB-линии — 5 жил
    // (общий + 3 канала), просьба пользователя. rgb=null («не указано») считаем монохромом,
    // но «Проверки» об этом напомнят (см. plan-rules.js).
    if (is24) return rgb ? (p.settings.cable24Rgb || "КГ ВВГнг-LS 5×1.5") : (p.settings.cable24 || "КГ ВВГнг-LS 2×2.5");
    if (layer === "warm") return "Кабель тёплого пола";
    if (LV_LAYERS[layer]) return "Витая пара (UTP)"; // интернет/ТВ/видеонаблюдение
    return C.cableMark(p, layer === "light" ? "3×1.5" : "3×2.5");
  }
  // Марка кабеля «до щита» (первичка 24В, выключатель→трансформатор): число жил зависит от
  // того, сколько КЛАВИШ этого выключателя назначено на выводы 24В — 1 клавиша даёт 3×1.5,
  // 2-3 клавиши 5×1.5 (просьба пользователя). Считается по СВОЕЙ трассе (fromId "sw24:<id>").
  function pri24Mark(p, r) {
    const swId = String(r.fromId || "").indexOf("sw24:") === 0 ? String(r.fromId).slice(5) : null;
    const sw = swId ? (p.elements || []).find((e) => e.id === swId) : null;
    const R = EP.Plan.Routes;
    const k = (sw && R && R.keys24Of) ? R.keys24Of(p, sw) : 1;
    return EP.Plan.Core.cableMark(p, k >= 2 ? "5×1.5" : "3×1.5");
  }
  // у линии 24В: RGB ли она (для марки «от щита»)
  function rgbOf(p, circuitId) {
    const cc = (p.circuits || []).find((c) => c.id === circuitId);
    return !!(cc && cc.rgb);
  }
  const STROBE_KIND_SUFFIX = { lv: " (слаботочка)" }; // power/warm — без суффикса (размер их обычно и так различает)

  // ---------- коннекторы (ВАГО/ГМЛ/СИЗ + термоусадка) — логика из EP.PoolEngine ----------
  const CONN_NAME = {
    pin2: "ВАГО 2-пин", pin3: "ВАГО 3-пин", pin4: "ВАГО 4-пин", pin5: "ВАГО 5-пин",
    pin6: "ВАГО 6-пин", pin8: "ВАГО 8-пин", pin10: "ВАГО 10-пин",
    gml4: "ГМЛ 4", gml6: "ГМЛ 6", gml8: "ГМЛ 8", gml10: "ГМЛ 10",
    siz2: "СИЗ на 2 провода", siz3: "СИЗ на 3 провода", siz4: "СИЗ на 4 провода",
    siz5: "СИЗ на 5 проводов", siz6: "СИЗ на 6 проводов", siz8: "СИЗ на 8 проводов", siz10: "СИЗ на 10 проводов"
  };
  function connName(key) { return CONN_NAME[key] || key; }
  function sleeveByWires(w) { if (w <= 4) return "gml4"; if (w <= 6) return "gml6"; if (w <= 8) return "gml8"; return "gml10"; }
  // распаечные коробки: pin-count = ТОЧНОЕ число сходящихся кабелей (вход+выход,
  // берём из построенного графа трасс), ×3 разъёма (L/N/PE) на коробку.
  // выключатели: внутренняя разводка ПО ФАКТИЧЕСКОМУ виду (клавиши/проходной/
  // перекрёстный) — шаблоны пула; проходной/перекрёстный максимум 2-клавишные
  // (у pool-engine нет шаблона на 3 — берём _2 как верхнюю границу).
  const SW_TEMPLATES = {
    switch_1: { pin2: 4 }, switch_2: { pin2: 3, pin4: 2 }, switch_3: { pin2: 4, pin4: 2 },
    pass_1: { pin2: 6 }, pass_2: { pin2: 8, pin4: 1 },
    cross_1: { pin2: 9 }, cross_2: { pin2: 15, pin3: 1 }
  };
  function switchTemplateKey(el) {
    const kind = el.swKind || "normal";
    const keys = Math.max(1, Math.min(3, el.keys || 1));
    if (kind === "pass") return "pass_" + Math.min(2, keys);
    if (kind === "cross") return "cross_" + Math.min(2, keys);
    return "switch_" + keys;
  }
  function connectorsByRoutes(p, inCnt, outCnt) {
    const mode = (p.settings && p.settings.connectorMode) || "gml";
    const pinMap = {};
    const addPin = (pins, q) => { if (pins >= 2 && q > 0) pinMap["pin" + pins] = (pinMap["pin" + pins] || 0) + q; };
    (p.elements || []).forEach((e2) => {
      if (e2.status === "existing" || e2.type !== "junction") return;
      addPin((inCnt[e2.id] || 0) + (outCnt[e2.id] || 0), 3);
    });
    (p.elements || []).forEach((e2) => {
      if (e2.status === "existing") return;
      if (e2.type === "switch") {
        const t = SW_TEMPLATES[switchTemplateKey(e2)] || SW_TEMPLATES.switch_1;
        Object.keys(t).forEach((pin) => addPin(Number(pin.replace("pin", "")), t[pin]));
      } else if (e2.type === "block") {
        // пост "switch" внутри блока — в блоке нет данных о клавишности, считаем простым 1-клавишным
        ((e2.params && e2.params.items) || []).forEach((it) => { if (it === "switch") addPin(2, 4); });
      }
    });
    const materials = {}; let shrinkCount = 0;
    Object.keys(pinMap).forEach((pin) => {
      const w = Number(pin.replace("pin", "")), q = pinMap[pin];
      if (mode === "wago") materials[pin] = (materials[pin] || 0) + q;
      else if (mode === "siz") { const k = "siz" + w; materials[k] = (materials[k] || 0) + q; shrinkCount += q; }
      else { const k = sleeveByWires(w); materials[k] = (materials[k] || 0) + q; shrinkCount += q; }
    });
    return { materials, shrinkM: Math.round((shrinkCount * 5 / 100) * 100) / 100 }; // 5 см термоусадки на стык
  }

  // ---------- расходники по кабелю/штробам (крепёж, буры, коронки/диски, мешки) — из
  // EP.CableConsum, на ТОЧНЫХ метрах/подрозетниках/коробках/кабеле, уже посчитанных по
  // трассам выше. EP.CableConsum знает только 4 материала пула (Бетон/Кирпич/Панель/
  // Мягкий) — стены перегородок/балок допускают более широкий список
  // (Газоблок/Пеноблок/ГКЛ/ПГП/Дерево, см. DEFAULTS.partitionMaterials в plan-core.js),
  // поэтому всё, что не входит в 4 базовых, отображаем на "Мягкий" (физически они все
  // мягче бетона/кирпича для реза/сверления — тот же принцип, что и у
  // DEFAULTS.partitionThickness, где эта группа тоньше несущих стен).
  const CONSUM_MAT_MAP = {
    "Бетон": "Бетон", "Кирпич": "Кирпич", "Панель": "Панель", "Мягкий": "Мягкий",
    "Газоблок": "Мягкий", "Пеноблок": "Мягкий", "ГКЛ": "Мягкий", "ПГП": "Мягкий", "Дерево": "Мягкий"
  };
  const consumMat = (m) => CONSUM_MAT_MAP[m] || "Бетон";
  // диски штробы подбираются по глубине ("small"/"big") ОДНИМ вызовом CableConsum на
  // глубину — штроба тёплого пола (50×50, kind:"warm") режется диском "big", силовая и
  // слаботочная (kind power/lv, обычный размер settings.chaseW/H) — "small"; подрозетники
  // (коронка) и крепёж кабеля/буры от глубины НЕ зависят — считаются один раз в "small".
  function addConsumItems(add, p, strobe, podroz, junctBoxes, cableBy) {
    const CC = window.EP && window.EP.CableConsum;
    if (!CC) return; // модуль расходников не подключен на странице — тихо пропускаем
    const smallByMat = {}, bigByMat = {}, sockByMat = {};
    Object.keys(strobe).forEach((k) => {
      const [, mat, kind] = k.split("|");
      const m = consumMat(mat);
      const bucket = kind === "warm" ? bigByMat : smallByMat;
      bucket[m] = (bucket[m] || 0) + strobe[k];
    });
    Object.keys(podroz).forEach((mat) => {
      const m = consumMat(mat), d = podroz[mat];
      sockByMat[m] = (sockByMat[m] || 0) + (d.std || 0) + (d.deep || 0);
    });
    const sum = (o) => Object.keys(o).reduce((s, k) => s + o[k], 0);
    const totalStrobeSmall = sum(smallByMat), totalStrobeBig = sum(bigByMat);
    const totalSockets = sum(sockByMat), totalCable = sum(cableBy);
    if (!totalStrobeSmall && !totalStrobeBig && !totalSockets && !totalCable) return;

    const merged = {}; // имя -> { qty, unit }
    const collect = (list) => (list || []).forEach((it) => {
      const e = merged[it.name] || (merged[it.name] = { qty: 0, unit: it.unit });
      e.qty += it.qty;
    });

    const surface = p.settings.routeType === "floor" ? "floor" : "ceil";
    collect(CC.calc({
      mode: "mount", cableM: totalCable, boxes: junctBoxes,
      sockets: totalSockets, strobeM: totalStrobeSmall + totalStrobeBig,
      surface, gofra: surface !== "floor" && p.settings.gofraCeil !== false
    }));

    const matNames = Array.from(new Set(Object.keys(smallByMat).concat(Object.keys(bigByMat), Object.keys(sockByMat))));
    if (matNames.length) {
      const rowsSmall = matNames.map((m) => ({ material: m, sockets: sockByMat[m] || 0, strobeM: smallByMat[m] || 0 }));
      collect(CC.calc({ mode: "materials", matRows: rowsSmall, depth: "small", boxes: junctBoxes }));
      if (totalStrobeBig > 0) {
        const rowsBig = matNames.map((m) => ({ material: m, sockets: 0, strobeM: bigByMat[m] || 0 }));
        collect(CC.calc({ mode: "materials", matRows: rowsBig, depth: "big", boxes: 0 }));
      }
    }
    Object.keys(merged).forEach((name) => add("material", name, merged[name].qty, merged[name].unit));
  }

  function calcByRoutes(p) {
    const routes = p.routes || [];
    if (!routes.length) return null;
    const s = p.settings, G2 = G(), RT = EP.Plan.Routes;
    const PE = window.EP.PoolEngine;
    const capTbl = (PE && PE.DEFAULTS && PE.DEFAULTS.capacity) || { "25x30": { round: { "2.5": 2 } } };
    const sizeKey = (w, h) => w + "x" + h; // мм
    const capOf = (key) => {
      const t = capTbl[key], byShape = (t && (t.round || t.flat)) || { "2.5": 2 };
      return Math.max(1, Number(byShape["2.5"]) || 2);
    };
    const elById = (id) => (p.elements || []).find((e) => e.id === id);
    const inCnt = {}, outCnt = {};
    routes.forEach((r) => { outCnt[r.fromId] = (outCnt[r.fromId] || 0) + 1; if (r.toId) inCnt[r.toId] = (inCnt[r.toId] || 0) + 1; });

    const strobe = {}; // "размер|материал|вид" -> метры (вид: power/lv/warm — не смешиваем в одну строку)
    const addStrobe = (sizeK, mat, cm, kind) => { if (cm > 1) { const k = sizeK + "|" + mat + "|" + (kind || "power"); strobe[k] = (strobe[k] || 0) + cm / 100; } };
    const matOfEl = (e2) => { const w = e2.wallId && G2.wallById(p, e2.wallId); return w ? G2.wallMatOf(p, w) : ((s && s.wallMaterial) || "Бетон"); };

    const podroz = {}; // материал -> { std, deep }
    const P = (m) => (podroz[m] = podroz[m] || { std: 0, deep: 0 });
    let junctBoxes = 0;
    const keyStd = sizeKey(s.chaseW || 25, s.chaseH || 30);
    (p.elements || []).forEach((e2) => {
      if (e2.status === "existing") return;
      if (e2.type === "junction") { junctBoxes++; return; }
      const mat = matOfEl(e2);
      // подрозетники по материалу СВОЕЙ стены (выключатели/ТП — глубокие, как в пуле)
      const addPost = (t) => {
        if (t === "switch" || t === "warmfloor") P(mat).deep++;
        else if (t === "socket" || t === "tv" || t === "internet" || t === "ac" || t === "sensor") P(mat).std++;
      };
      if (e2.type === "block") ((e2.params && e2.params.items) || []).forEach(addPost);
      else addPost(e2.type);
      // штроба-спуск: только у точек, к которым построена трасса
      if (!(outCnt[e2.id] || inCnt[e2.id])) return;
      const vert = RT.pointVert(p, e2);
      if (vert < 1) return;
      if (e2.layer === "warm") {
        // ТП: подача к термостату — обычная штроба (потолок/пол, куда бы ни шла трасса);
        // от термостата ВНИЗ в пол, к самому греющему кабелю — ВСЕГДА 50×50, отдельно
        addStrobe(keyStd, mat, vert, "power");
        const toFloor = Math.max(0, e2.height || 0);
        if (toFloor > 1) addStrobe(sizeKey(s.tpChaseW || 50, s.tpChaseH || 50), mat, toFloor, "warm");
        return;
      }
      if (LV_LAYERS[e2.layer]) { addStrobe(keyStd, mat, vert, "lv"); return; } // слаботочка — своя штроба и своя строка
      const cables = (outCnt[e2.id] || 0) + (inCnt[e2.id] || 0); // вход+выход шлейфа в одном спуске
      addStrobe(keyStd, mat, Math.max(1, Math.ceil(cables / capOf(keyStd))) * vert, "power");
    });
    // спуск у щита: линии приходят в одну точку — ёмкость из пула; слаботочку
    // считаем ОТДЕЛЬНОЙ штробой у щита (не мешаем её с силовой и там)
    const panelMat = () => {
      const pn = (p.panels || [])[0];
      const hit = pn && G2.wallAt(p, { x: pn.x, y: pn.y }, 60);
      return hit ? G2.wallMatOf(p, hit.wall) : ((s && s.wallMaterial) || "Бетон");
    };
    const panelRoutes = routes.filter((r) => r.toPanel);
    if ((p.panels || []).length && panelRoutes.length) {
      const lvPanelCables = panelRoutes.filter((r) => LV_LAYERS[r.layer]).length;
      const powPanelCables = panelRoutes.length - lvPanelCables;
      const pm = panelMat();
      if (powPanelCables > 0) addStrobe(keyStd, pm, Math.ceil(powPanelCables / capOf(keyStd)) * RT.panelVert(p), "power");
      if (lvPanelCables > 0) addStrobe(keyStd, pm, Math.ceil(lvPanelCables / capOf(keyStd)) * RT.panelVert(p), "lv");
    }

    // кабель по МАРКАМ: марка линии (QF) или по слою; с настраиваемым запасом
    const cableBy = {};
    const reserve = 1 + (Number(s.cableReserve == null ? 10 : s.cableReserve) || 0) / 100;
    routes.forEach((r) => {
      const e2 = elById(r.fromId);
      const pn = r.toPanel ? (p.panels || []).find((x) => x.id === r.toId) : null;
      // без распайки на конце кабель проходит штробу туда-обратно (нет коробки,
      // принимающей горизонталь на месте) — hopVertMul=2 для такого хопа; + выпуск
      // на разделку/подключение (RT.cableStub — см. её инвариант)
      const L = G2.polylineLen(r.points || []) + (e2 ? RT.pointVert(p, e2) * RT.hopVertMul(p, r) : 0) + (r.toPanel ? RT.panelVert(p, pn) : 0) + RT.cableStub(p, e2, r);
      const cc = (p.circuits || []).find((c) => c.id === r.circuitId);
      // 24В-линия: «до щита» (leg pri24, выключатель→трансформатор, 220В — марка
      // circuit.cable220) и «от щита» (leg sec24, трансформатор→точка 24В — circuit.cable)
      // ИДУТ ОТДЕЛЬНЫМИ ПОЗИЦИЯМИ (просьба пользователя). Метка добавляется СУФФИКСОМ после
      // марки — priceFor() ищет цену в БД двунаправленной подстрокой (см. priceFor), поэтому
      // «Кабель ВВГ 3×1.5 · до щита (220В)» всё равно матчит запись БД «Кабель ВВГ 3×1.5».
      let key;
      if (r.leg === "pri24") {
        key = ((cc && cc.cable220) || pri24Mark(p, r)) + " · до щита (220В)";
      } else if (r.leg === "sec24") {
        key = ((cc && cc.cable) || defaultCableMark(p, r.layer, true, rgbOf(p, r.circuitId))) + " · от щита (24В)";
      } else {
        const i24 = is24Circuit(p, r.circuitId);
        key = (cc && cc.cable) || defaultCableMark(p, r.layer, i24, i24 && rgbOf(p, r.circuitId));
      }
      cableBy[key] = (cableBy[key] || 0) + L;
    });
    Object.keys(cableBy).forEach((m) => { cableBy[m] = Math.round((cableBy[m] / 100) * reserve * 10) / 10; });

    // позиции для сметы
    const items = [];
    const add = (type, name, qty, unit) => { qty = Math.round(qty * 10) / 10; if (qty > 0) items.push({ type, name, qty, unit }); };
    const low = (m) => String(m || "").toLowerCase();
    Object.keys(strobe).sort().forEach((k) => {
      const [size, mat, kind] = k.split("|");
      add("work", `Штробление ${size} ${low(mat)}${STROBE_KIND_SUFFIX[kind] || ""}`, strobe[k], "м");
    });
    Object.keys(podroz).forEach((mat) => {
      const d = podroz[mat];
      if (d.std) add("work", `Высверливание подрозетников обычных ${low(mat)}`, d.std, "шт");
      if (d.deep) add("work", `Высверливание подрозетников глубоких ${low(mat)}`, d.deep, "шт");
    });
    // вклейка подрозетников — ОТДЕЛЬНАЯ работа от высверливания отверстия (просьба
    // пользователя: список работ, которые «не падают в работу»), те же счётчики std/deep
    Object.keys(podroz).forEach((mat) => {
      const d = podroz[mat];
      if (d.std) add("work", `Вклейка подрозетников обычных ${low(mat)}`, d.std, "шт");
      if (d.deep) add("work", `Вклейка подрозетников глубоких ${low(mat)}`, d.deep, "шт");
    });
    let pStd = 0, pDeep = 0;
    Object.keys(podroz).forEach((m) => { pStd += podroz[m].std; pDeep += podroz[m].deep; });
    if (pStd) add("material", "Подрозетник Ø68 40-50 мм", pStd, "шт");
    if (pDeep) add("material", "Подрозетник Ø68 65 мм глубокий", pDeep, "шт");
    if (junctBoxes) add("material", "Распаечная коробка (потолок)", junctBoxes, "шт");
    // Работы по распайкам РАЗДЕЛЕНЫ по МЕСТУ распайки — просьба пользователя: «работы по
    // распайкам (Собрать распаяную коробку на потолке / в подрозетнике)». Раньше была одна
    // общая строка «Монтаж и расключение распределительной коробки», хотя это две разные
    // по трудоёмкости операции: коробка на потолке (отдельная коробка, крышка, доступ с
    // лестницы) и распайка ВНУТРИ подрозетника (тесно, без отдельной коробки).
    // · «на потолке» = число потолочных распаечных коробок (элементы type:"junction").
    // · «в подрозетнике» = число точек-ТРАНЗИТОВ шлейфа: в подрозетник кабель и приходит,
    //   и уходит дальше (outCnt+inCnt > 1) — именно там физически делается соединение без
    //   отдельной коробки. Тот же признак, по которому hopVertMul в plan-routes.js считает
    //   штробу у такой точки дважды, и по которому connectorsByRoutes считает пины
    //   соединителей — источник один (inCnt/outCnt по графу трасс), расходиться не могут.
    let spliceInBox = 0;
    (p.elements || []).forEach((e2) => {
      if (e2.status === "existing" || e2.type === "junction") return;
      if (((outCnt[e2.id] || 0) + (inCnt[e2.id] || 0)) > 1) spliceInBox++;
    });
    if (junctBoxes) add("work", "Собрать распаянную коробку на потолке", junctBoxes, "шт");
    if (spliceInBox) add("work", "Собрать распайку в подрозетнике", spliceInBox, "шт");
    Object.keys(cableBy).forEach((m) => add("material", `Кабель ${m}`, cableBy[m], "м"));
    // прокладка кабеля — работа отдельно от материала, ОТДЕЛЬНОЙ СТРОКОЙ на каждую марку
    // (просьба пользователя: «прокладка кабеля в работах, должна разделиться (прокладка
    // 3×1.5, 3×2.5) и так далее» — раньше была ОДНА строка суммарно по всем маркам разом);
    // метраж каждой строки = метражу материала «Кабель N» той же марки выше, той же цифрой
    Object.keys(cableBy).forEach((m) => add("work", `Прокладка кабеля ${m}`, cableBy[m], "м"));
    // проходки через стены: Ø20, группируем по месту (~20 см); ёмкость гильзы зависит от
    // способа прокладки (тот же признак «в гофре», что уже определяет расходку выше) —
    // просьба пользователя: «1 проходка это 2 провода без гофры, или 1 в гофре» (гофра
    // толще — вдвоём в Ø20 уже не входят). По полу — всегда гофра (см. addConsumItems
    // выше, там floor не зависит от gofraCeil вообще); по потолку — settings.gofraCeil.
    // Группировку/ёмкость считает ЕДИНЫЙ хелпер EP.Plan.Routes.sleeveGroups — тот же, что
    // показывает шторка «Трассы» (раньше алгоритм был продублирован здесь, и шторка
    // показывала сырую сумму throughWalls: «12 проходок» против «6 шт» в смете).
    const sg = EP.Plan.Routes.sleeveGroups(p);
    const sleeves = sg.groups, sleeveCap = sg.cap;
    const sleeveByMat = {};
    Object.keys(sleeves).forEach((k) => {
      const w = G2.wallById(p, sleeves[k].wallId);
      const mat = w ? G2.wallMatOf(p, w) : ((s && s.wallMaterial) || "Бетон");
      sleeveByMat[mat] = (sleeveByMat[mat] || 0) + Math.ceil(sleeves[k].n / sleeveCap);
    });
    Object.keys(sleeveByMat).forEach((m) => add("work", `Проходка Ø${s.sleeveD || 20} ${low(m)}`, sleeveByMat[m], "шт"));
    // ниша под щит — как в конфигураторе щита (вырубка × модули + монтаж)
    if ((p.panels || []).length) {
      const modules = (s.panelBox && s.panelBox.modules) ||
        (EP.Plan.Scheme && EP.Plan.Scheme.neededModules ? EP.Plan.Scheme.neededModules(p) : 0);
      if (modules > 0) add("work", `Вырубка ниши под щит (${low(panelMat())})`, modules, "мод");
      add("work", "Монтаж щита в нишу/стену", 1, "шт");
      // сборка и расключение щита — просьба пользователя: «цена складывается за
      // установку автомата, узо, диф и т.д.», т.е. поштучно по числу реально стоящих
      // в щите аппаратов защиты, а не одной строкой «сборка щита». Модель различает
      // только breaker (есть всегда) и rcd (bool — УЗО/дифавтомат одной галкой, без
      // подтипа) — раздельного «узо vs диф» поля нет, считаем их одной строкой.
      const circAll = p.circuits || [];
      const breakerCnt = 1 + circAll.length; // вводной + по одному на линию
      const rcdCnt = (s.mainRcd ? 1 : 0) + circAll.filter((c) => c.rcd).length; // вводное + по линиям
      add("work", "Установка автоматического выключателя", breakerCnt, "шт");
      if (rcdCnt) add("work", "Установка УЗО/дифавтомата", rcdCnt, "шт");
      if (s.meter) add("work", "Установка счётчика", 1, "шт");
    }
    // временное освещение / временная розеточная сеть на время ремонта — организационная
    // работа (собирается на штатных светильниках/точках проекта, но само подключение и
    // демонтаж — отдельная услуга), количество вводится вручную (не выводится из чертежа)
    if (s.tempLightingPts > 0) add("work", "Временное освещение (организация)", s.tempLightingPts, "точ.");
    if (s.tempSocketsPts > 0) add("work", "Временные розеточные сети (организация)", s.tempSocketsPts, "точ.");
    // коннекторы: точное число сходящихся кабелей в распайках + разводка выключателей
    const conn = connectorsByRoutes(p, inCnt, outCnt);
    Object.keys(conn.materials).forEach((k) => add("material", connName(k), conn.materials[k], "шт"));
    if (conn.shrinkM > 0) add("material", "Термоусадка 12/4", conn.shrinkM, "м");
    // расходники (крепёж/буры/коронки/диски/мешки) — по уже посчитанным точным метрам/
    // подрозетникам/коробкам/кабелю выше; молча пропускается, если EP.CableConsum не подключен
    addConsumItems(add, p, strobe, podroz, junctBoxes, cableBy);
    // затяжка кабеля в гофру — работа отдельно от самой гофры (материал); метраж
    // берём из уже посчитанного addConsumItems (там же гофра ПНД/потолочная гофра
    // считается по routeType/gofraCeil) — не пересчитываем заново, чтобы не разойтись
    const gofraM = items.filter((it) => it.type === "material" && /^гофра/i.test(it.name)).reduce((sum, it) => sum + it.qty, 0);
    if (gofraM > 0) add("work", "Затяжка кабеля в гофру", gofraM, "м");
    // правки пользователя (скрыть/заменить/добавить) — В САМОМ КОНЦЕ, после всего
    // авто-счёта: gofraM выше читает items ДО правок (метраж затяжки не должен
    // зависеть от того, скрыл ли пользователь строку гофры из сметы)
    return { items: applyCalcEdits(p, items), cableBy, strobe, conn, podroz, junctBoxes };
  }

  // ---------- правки сметы (p.calcEdits, бэкофилл в plan-core.js): скрытые позиции,
  // замена названия (кабель/расходка — количество остаётся по чертежу, цена ищется в
  // БД уже по НОВОМУ названию) и добавленные вручную работы/материалы. Ключ позиции —
  // type|ИСХОДНОЕ имя (стабилен между пересчётами: авто-счёт детерминирован по чертежу);
  // у переименованных origName хранит исходное имя, чтобы ✎/✕ работали по тому же ключу.
  const editKey = (type, name) => type + "|" + name;
  function applyCalcEdits(p, items) {
    if (!items) return items;
    const ed = p.calcEdits || {};
    const hidden = ed.hidden || [], renamed = ed.renamed || {}, custom = ed.custom || [];
    const out = items
      .filter((it) => hidden.indexOf(editKey(it.type, it.name)) < 0)
      .map((it) => {
        const nn = renamed[editKey(it.type, it.name)];
        return nn ? Object.assign({}, it, { name: nn, origName: it.name }) : it;
      });
    custom.forEach((cIt, i) => {
      if (cIt && cIt.name && Number(cIt.qty) > 0) out.push({ type: cIt.type === "material" ? "material" : "work", name: cIt.name, qty: Number(cIt.qty), unit: cIt.unit || "шт", custom: i });
    });
    return out;
  }

  // ---------- позиции для сметы: тот же приоритет, что и в sheet() —
  // точный счёт по построенным трассам, иначе приближённый по движку пула ----------
  function estimateItems(p) {
    const stats = buildBlocks(p);
    if (!stats.length) return null;
    const exact = exactOf(p);
    if (exact && exact.items.length) return exact.items; // правки уже применены внутри calcByRoutes
    const res = runEngine(p, stats);
    return applyCalcEdits(p, (res && res.draftItems) || null); // приближённый счёт — те же правки
  }

  // ---------- МЕМО-КЭШ расчёта ----------
  // calcByRoutes/perCircuit — чистые функции от проекта, но шторка «Расчёт» перерисовывается
  // ЧАСТО (каждый вход в под-вид «цена/название/расходники» и возврат назад зовут sheet()
  // заново), и каждый раз считала всё с нуля: замер на стресс-проекте (30 комнат/150 точек,
  // CPU ×8) — calcByRoutes 12мс + perCircuit 4мс на КАЖДУЮ перерисовку. Кэш сбрасывается на
  // ЛЮБОЕ изменение проекта (core().onChange — через него проходит любая мутация модели),
  // поэтому устареть не может; цены НЕ кэшируются (priceFor читает БД на каждый рендер —
  // правка цены видна сразу).
  let memo = null;      // { exact, per }
  let memoTok = 0;      // токен состояния: результат воркера с чужим токеном не принимаем
  function exactOf(p) {
    if (memo && memo.exact !== undefined) return memo.exact;
    const v = calcByRoutes(p);
    memo = memo || {}; memo.exact = v;
    return v;
  }
  function perOf(p) {
    if (memo && memo.per !== undefined) return memo.per;
    const v = perCircuit(p);
    memo = memo || {}; memo.per = v;
    return v;
  }
  // фоновый предрасчёт из воркера (plan-routes.js prefetchEstimate): готовые items/perCircuit
  // на ТЕКУЩЕЕ состояние — шторка «Расчёт» открывается без счёта на главном потоке
  function setPrefetched(tok, items, per) {
    if (tok !== memoTok) return false; // проект успел измениться — данные уже не про него
    memo = memo || {};
    // из результата calcByRoutes и шторка, и estimateItems читают ТОЛЬКО .items
    // (cableBy/strobe/conn/podroz/junctBoxes используются внутри самой calcByRoutes) —
    // поэтому предрасчёту достаточно вернуть items; форму специально не раздуваем
    if (Array.isArray(items)) memo.exact = { items, prefetched: true };
    if (per) memo.per = per;
    return true;
  }
  const memoToken = () => memoTok;
  if (core().onChange) core().onChange(() => { memo = null; memoTok++; });

  // ---------- цены из БД ----------
  function priceFor(name, type) {
    try {
      const items = (EP.Database && EP.Database.getItemsByType && EP.Database.getItemsByType(type)) || [];
      const low = String(name).toLowerCase();
      const exact = items.find((x) => String(x.name).toLowerCase() === low);
      if (exact) return Number(exact.price) || 0;
      const part = items.find((x) => low.indexOf(String(x.name).toLowerCase()) >= 0 || String(x.name).toLowerCase().indexOf(low) >= 0);
      return part ? Number(part.price) || 0 : 0;
    } catch (e) { return 0; }
  }

  // ---------- шторка ----------
  function sheet() {
    const p = core().project;
    if (!(p.rooms || []).length) { rooms().toast(T.noRooms); return; }
    const stats = buildBlocks(p);
    if (!stats.length) { rooms().toast(T.noElems); return; }
    const rl = EP.Plan.Routes ? EP.Plan.Routes.lengths(p) : { byLayer: {}, total: 0 };
    const layerName = (id) => ((p.layers || []).find((l) => l.id === id) || { name: id }).name;

    const table = `<table class="ep-plan-table"><tr><th>${T.room}</th>${COLS.map(([, l]) => `<th>${l}</th>`).join("")}</tr>
      ${stats.map((s) => `<tr><td>${esc(s.room.name)}</td>${COLS.map(([k]) => `<td>${s[k] || ""}</td>`).join("")}</tr>`).join("")}</table>`;

    const cable = rl.total > 0
      ? `<div class="ep-plan-srow ep-plan-rlens">${Object.keys(rl.byLayer).map((id) => `<span>${layerName(id)}: <b>${G().fmtLen(rl.byLayer[id])}</b></span>`).join("")}
         <span><b>${G().fmtLen(rl.total)}</b> всего</span></div>`
      : `<div class="ep-plan-srow">${T.cable}: ${T.noRoutes}</div>`;

    // приоритет — ТОЧНЫЙ счёт по построенным трассам; иначе — движок пула по комнатам
    const exact = exactOf(p);
    let items, headHtml;
    if (exact && exact.items.length) {
      items = exact.items;
      headHtml = `<div class="ep-plan-srow"><b>${T.exactHead}</b></div>
        <div class="ep-plan-srow ep-plan-hintrow">${T.exactHint}</div>
        <div class="ep-plan-srow"><label class="ep-plan-range" style="flex:0 0 150px">${T.reserve}
          <input type="number" inputmode="numeric" min="0" max="50" value="${Math.round(p.settings.cableReserve == null ? 10 : p.settings.cableReserve)}" data-pc-reserve></label>
          <label class="ep-plan-range" style="flex:1 1 180px">${T.brandLbl}
            <input type="text" value="${esc(p.settings.cableBrand == null ? "" : p.settings.cableBrand)}" data-pc-cablebrand></label></div>
        <div class="ep-plan-srow ep-plan-hintrow">${T.brandHint}</div>
        <div class="ep-plan-srow">
          <label class="ep-plan-range" style="flex:1 1 170px">${T.c24Lbl}
            <input type="text" value="${esc(p.settings.cable24 == null ? "" : p.settings.cable24)}" data-pc-cable24></label>
          <label class="ep-plan-range" style="flex:1 1 170px">${T.c24RgbLbl}
            <input type="text" value="${esc(p.settings.cable24Rgb == null ? "" : p.settings.cable24Rgb)}" data-pc-cable24rgb></label>
        </div>
        <div class="ep-plan-srow ep-plan-hintrow">${T.c24Hint}</div>
        <div class="ep-plan-srow ep-plan-hintrow">${T.stubHint}</div>
        <div class="ep-plan-srow">
          <label class="ep-plan-range" style="flex:1 1 110px">${T.stubPoint}
            <input type="number" inputmode="numeric" min="0" max="200" value="${Math.round(p.settings.cableStubPoint == null ? 20 : p.settings.cableStubPoint)}" data-pc-stubpoint></label>
          <label class="ep-plan-range" style="flex:1 1 110px">${T.stubJunction}
            <input type="number" inputmode="numeric" min="0" max="200" value="${Math.round(p.settings.cableStubJunction == null ? 30 : p.settings.cableStubJunction)}" data-pc-stubjunction></label>
          <label class="ep-plan-range" style="flex:1 1 110px">${T.stubPanel}
            <input type="number" inputmode="numeric" min="0" max="200" value="${Math.round(p.settings.cableStubPanel == null ? 50 : p.settings.cableStubPanel)}" data-pc-stubpanel></label>
        </div>
        <div class="ep-plan-srow ep-plan-hintrow">${T.tempHint}</div>
        <div class="ep-plan-srow">
          <label class="ep-plan-range" style="flex:1 1 150px">${T.tempLighting}
            <input type="number" inputmode="numeric" min="0" value="${Math.round(p.settings.tempLightingPts || 0)}" data-pc-templight></label>
          <label class="ep-plan-range" style="flex:1 1 150px">${T.tempSockets}
            <input type="number" inputmode="numeric" min="0" value="${Math.round(p.settings.tempSocketsPts || 0)}" data-pc-tempsock></label>
        </div>`;
    } else {
      const res = runEngine(p, stats);
      items = applyCalcEdits(p, res && res.draftItems ? res.draftItems : null);
      headHtml = `<div class="ep-plan-srow"><b>${T.workHead}</b></div>
        <div class="ep-plan-srow ep-plan-hintrow">${T.approxHint}</div>`;
    }
    // цены — из EP.Database (по совпадению названия, priceFor); строка «нет цены»,
    // если для позиции нет подходящей записи в БД, и общий итог по найденным ценам
    const fmtRub = (n) => (window.EP.Currency && EP.Currency.format) ? EP.Currency.format(n) : (Math.round(n * 100) / 100) + " ₽";
    // разбивка по линиям QF (информационная сводка) — только если есть трассы и линии
    const perQF = exact && exact.items.length ? perOf(p) : null;
    // пометка «с запасом» ОБЯЗАТЕЛЬНА: perCircuit() считает длины С запасом кабеля
    // (+N%), а сводка «Кабель по трассам» выше — БЕЗ запаса; без пометки сумма по
    // линиям не сходилась со «всего» на вид (репорт полного визуального теста:
    // 10.4+8.4=18.8 против «17.05 всего» — оба числа верные, но выглядело ошибкой)
    const perQFHtml = (perQF && perQF.length)
      ? `<div class="ep-plan-srow"><b>${T.byLines}</b><span class="ep-plan-flex"></span><span class="ep-plan-mshint">кабель с запасом +${Math.round(p.settings.cableReserve == null ? 10 : p.settings.cableReserve)}%</span></div>` +
        `<div class="ep-plan-qflist">${perQF.map((r) => {
            const cbtn = (fld, mark, label) => `<button type="button" class="ep-plan-iprice ep-plan-qfmark ep-clickable" data-pc-editcable data-pc-circid="${esc(r.id)}" data-pc-cablefield="${fld}" data-pc-curmark="${esc(mark || "")}">${label ? esc(label) + ": " : ""}${esc(mark || "—")}</button>`;
            // 24В-линия: ДВЕ кнопки марки — до щита (cable220, 220В) и от щита (cable, 24В);
            // обычная линия — одна кнопка (cable). Просьба пользователя: до/от щита раздельно.
            const marksHtml = (r.has24 || r.is24)
              ? cbtn("cable220", r.cable220 || r.auto220, "до щита") + " " + cbtn("cable", r.cable || r.auto24, "от щита") + " · "
              : (r.mark ? cbtn("cable", r.mark, "") + " · " : "");
            // линия 24В: ОБЯЗАТЕЛЬНО указать монохром/RGB — от этого зависит кабель «от щита»
            // (2 жилы против 5). Пока не указано — «Проверки» напоминают, счёт идёт как монохром.
            const rgbHtml = r.is24 ? `<div class="ep-plan-qfrgb">${T.rgbLbl}
              <button type="button" class="ep-plan-chip ep-clickable ${r.rgb === false ? "on" : ""}" data-pc-rgb="0" data-pc-circid="${esc(r.id)}">${T.rgbMono}</button>
              <button type="button" class="ep-plan-chip ep-clickable ${r.rgb === true ? "on" : ""}" data-pc-rgb="1" data-pc-circid="${esc(r.id)}">${T.rgbOn}</button>
              ${r.rgb == null ? `<span class="ep-plan-mshint">не указано</span>` : ""}</div>` : "";
            return `<div class="ep-plan-qfrow">
            <span class="ep-plan-cdot" style="background:${esc(r.color)}"></span><b>${esc(r.name)}</b>
            <span class="ep-plan-qfmeta">${r.breaker || "—"}A${r.rcd ? " · УЗО" : ""}</span>
            <span class="ep-plan-flex"></span>
            <span class="ep-plan-qfnums">${marksHtml}${r.cableLen ? G().fmtLen(r.cableLen * 100) : "—"} · ${r.points} тчк${r.crossings ? " · " + r.crossings + " прох." : ""}</span>
          </div>${rgbHtml}`;
          }).join("")}</div>`
      : "";

    let itemsHtml;
    if (items) {
      const priced = items.map((it) => { const price = priceFor(it.name, it.type); return { it, price, lineSum: price * it.qty, sec: sectionOf(it) }; });
      const total = priced.reduce((s, x) => s + (x.price > 0 ? x.lineSum : 0), 0);
      const noPriceN = priced.filter((x) => !(x.price > 0)).length;
      // цена кликабельна ВСЕГДА (и «нет цены в БД», и уже найденную — можно поправить) —
      // просьба пользователя «назначать стоимость, и чтобы сохранялась в БД»: тап открывает
      // sheetSetPrice(), сохранение идёт через EP.Database.addMyItem — та же запись потом
      // находится priceFor() (точное совпадение по имени, см. ниже) уже на следующий рендер
      // ✎/✕ — правки сметы (p.calcEdits): ✎ заменяет название (кабель/расходку — кол-во
      // остаётся по чертежу), ✕ скрывает позицию (вернуть — блок «Скрытые» под итогом);
      // у добавленных вручную (it.custom) ✎ редактирует саму позицию, ✕ удаляет её
      const irow = ({ it, price, lineSum }) => {
        const k = editKey(it.type, it.origName || it.name);
        const editBtns = it.custom != null
          ? `<button type="button" class="ep-plan-mini ep-clickable" data-pc-editcustom="${it.custom}" aria-label="Изменить позицию">✎</button><button type="button" class="ep-plan-mini ep-clickable" data-pc-delcustom="${it.custom}" aria-label="Удалить позицию">✕</button>`
          : `<button type="button" class="ep-plan-mini ep-clickable" data-pc-editname data-pc-ekey="${esc(k)}" data-pc-ecur="${esc(it.name)}" aria-label="Заменить позицию">✎</button><button type="button" class="ep-plan-mini ep-clickable" data-pc-hide data-pc-ekey="${esc(k)}" aria-label="Убрать из сметы">✕</button>`;
        return `<div class="ep-plan-irow"><span>${esc(it.name)}${it.origName ? ` <span class="ep-plan-mshint">✎</span>` : ""}</span><span class="ep-plan-irow-r"><b>${it.qty} ${esc(it.unit)}</b><button type="button" class="ep-plan-iprice${price > 0 ? "" : " is-noprice"} ep-clickable" data-pc-setprice data-pc-pname="${esc(it.name)}" data-pc-ptype="${esc(it.type)}" data-pc-punit="${esc(it.unit)}" data-pc-pcur="${price > 0 ? price : ""}">${price > 0 ? esc(fmtRub(lineSum)) : esc(T.noPrice)}</button>${editBtns}</span></div>`;
      };
      // группировка по секциям (Кабель / Работы / Материалы / Расходники) —
      // просьба пользователя «информативно по расходке», чтобы расходка читалась отдельно
      const secHtml = SECTIONS.map(([key, label]) => {
        const rows = priced.filter((x) => x.sec === key);
        if (!rows.length) return "";
        const secSum = rows.reduce((s, x) => s + (x.price > 0 ? x.lineSum : 0), 0);
        return `<div class="ep-plan-srow ep-plan-sechead"><b>${label}</b><span class="ep-plan-flex"></span><span class="ep-plan-mshint">${secSum > 0 ? esc(fmtRub(secSum)) : ""}</span></div>
          <div class="ep-plan-items ep-plan-secitems">${rows.map(irow).join("")}</div>`;
      }).join("");
      // скрытые позиции — под итогом, каждую можно вернуть (↩), «вернуть все» разом
      const hid = (p.calcEdits && p.calcEdits.hidden) || [];
      const hiddenHtml = hid.length
        ? `<div class="ep-plan-srow"><span class="ep-plan-mshint">${T.hiddenN(hid.length)}</span><span class="ep-plan-flex"></span><button type="button" class="ep-plan-mini ep-clickable" data-pc-unhideall>${T.restoreAll}</button></div>
           <div class="ep-plan-items ep-plan-secitems">${hid.map((k) => `<div class="ep-plan-irow"><span class="ep-plan-mshint">${esc(k.split("|").slice(1).join("|"))}</span><span class="ep-plan-irow-r"><button type="button" class="ep-plan-mini ep-clickable" data-pc-unhide data-pc-ekey="${esc(k)}">↩</button></span></div>`).join("")}</div>`
        : "";
      itemsHtml = `${headHtml}${secHtml}
        <div class="ep-plan-srow ep-plan-total"><b>${esc(T.total)}</b><b>${esc(fmtRub(total))}</b>${noPriceN ? `<span class="ep-plan-mshint">(${noPriceN} без цены в БД)</span>` : ""}</div>
        <div class="ep-plan-srow"><button type="button" class="ep-plan-mini ep-clickable" data-pc-additem>${T.addItem}</button></div>
        ${hiddenHtml}`;
    } else {
      itemsHtml = `<div class="ep-plan-srow">${T.engineMissing}</div>`;
    }

    const consumBtn = (window.EP && window.EP.ConsumablesUI && EP.ConsumablesUI.renderLogic)
      ? `<button type="button" class="ep-plan-mini ep-clickable" data-pc-consumcfg>${T.consumCfg}</button>` : "";
    rooms().openSheet(`<div class="ep-plan-srow"><b>🧮 ${T.title}</b>
        <span class="ep-plan-flex"></span>${consumBtn}<button type="button" class="ep-plan-mini ep-clickable" data-sheet-fs aria-label="Во весь экран">⛶</button><button type="button" class="ep-plan-mini ep-clickable" data-pc-close>✕</button></div>
      ${table}
      <div class="ep-plan-srow"><b>${T.cable}</b></div>${cable}
      ${perQFHtml}
      ${itemsHtml}
      ${items ? `<div class="ep-plan-srow ep-plan-sbtns"><button type="button" class="btn btn-primary ep-clickable" data-plan-to-estimate>${T.toEstimate}</button></div>` : ""}`);
  }

  // редактор норм расходников (крепёж/буры/коронки/диски/мешки) ПРЯМО внутри плана —
  // та же панель, что и в «Логике расходников» на экране «Расходники» (общий движок
  // EP.CableConsum, изменения сразу видны в обоих местах); открывается поверх шторки
  // «Расчёт», ‹ Назад возвращает к ней.
  function sheetConsumSettings() {
    rooms().openSheet(`<div class="ep-plan-srow"><b>${T.consumTitle}</b>
        <span class="ep-plan-flex"></span><button type="button" class="ep-plan-mini ep-clickable" data-pc-consumback>${T.back}</button></div>
      <div id="ep-consum-root"></div>`);
    if (window.EP && window.EP.ConsumablesUI && EP.ConsumablesUI.renderLogic) EP.ConsumablesUI.renderLogic("ep-consum-root");
  }

  // заменить марку/сечение кабеля КОНКРЕТНОЙ линии (QF) — прямо из списка «По линиям»
  // (просьба пользователя: «где написано (qf4) (кабель) вот кабель менять, сечение,
  // марку»). circuit.cable — тот же источник правды, что уже читают calcByRoutes()/
  // perCircuit()/autoCable() в plan-scheme.js — правка сразу видна и в материале
  // «Кабель …», и в «Прокладке кабеля …» (см. Feature B выше), и в самой однолинейке.
  // марки кабеля из активной БД (раздел «Материалы») — для пикера в редакторе кабеля.
  // Кабель определяем по имени/категории; храним МАРКУ без префикса «Кабель» (смета сама
  // добавляет «Кабель …», а priceFor двунаправленной подстрокой всё равно найдёт цену).
  function cableDbMarks() {
    try {
      const items = (EP.Database && EP.Database.getItemsByType && EP.Database.getItemsByType("material")) || [];
      const re = /кабел|ввг|nym|пвс|пугв|кспв|шввп|utp|витая пара|гибкий кабель|кг\b/i;
      const seen = new Set(), out = [];
      items.forEach((x) => {
        const n = String(x.name || "");
        if (!re.test(n) && !/кабел/i.test(String(x.category || ""))) return;
        const mark = n.replace(/^\s*кабель\s+/i, "").trim();
        const k = mark.toLowerCase();
        if (mark && !seen.has(k)) { seen.add(k); out.push(mark); }
      });
      return out.slice(0, 40);
    } catch (e) { return []; }
  }
  // field: "cable" (от щита / обычная линия) или "cable220" (до щита, 220В у 24В-линии)
  function sheetEditCable(circuitId, curMark, field) {
    field = field === "cable220" ? "cable220" : "cable";
    const marks = cableDbMarks();
    const chips = marks.length
      ? `<div class="ep-plan-srow ep-plan-cablechips">${marks.map((m) => `<button type="button" class="ep-plan-chip ep-clickable" data-pc-cablepick="${esc(m)}">${esc(m)}</button>`).join("")}</div>`
      : `<div class="ep-plan-srow ep-plan-hintrow">${T.cableNoDb}</div>`;
    rooms().openSheet(`<div class="ep-plan-srow"><b>${T.cableTitle}${field === "cable220" ? " · до щита (220В)" : ""}</b>
        <span class="ep-plan-flex"></span><button type="button" class="ep-plan-mini ep-clickable" data-pc-priceback>${T.back}</button></div>
      <div class="ep-plan-srow ep-plan-mshint">${T.cableFromDb}</div>
      ${chips}
      <div class="ep-plan-srow"><label class="ep-plan-range" style="flex:1 1 100%">${T.cableLbl}
        <input type="text" value="${esc(curMark || "")}" data-pc-cablemark></label></div>
      <div class="ep-plan-srow ep-plan-hintrow">${T.cableHint}</div>
      <div class="ep-plan-srow ep-plan-sbtns"><button type="button" class="btn btn-primary ep-clickable" data-pc-cablesave data-pc-circid="${esc(circuitId)}" data-pc-cablefield="${field}">${T.saveBtn}</button></div>`);
    const inp = document.querySelector("[data-pc-cablemark]");
    if (inp) { inp.focus(); inp.select(); }
  }

  // назначить/поправить цену позиции — сохраняется в «Мою БД» (EP.Database.addMyItem),
  // ту же самую, что читает priceFor() ниже — точное совпадение по имени находит её
  // сразу на следующем рендере sheet() (и в «В смету», т.к. estimateItems тоже идёт
  // через priceFor). Просьба пользователя: «назначать стоимость, и чтобы сохранялась в БД».
  function sheetSetPrice(name, type, unit, curPrice) {
    rooms().openSheet(`<div class="ep-plan-srow"><b>💰 ${T.priceTitle}</b>
        <span class="ep-plan-flex"></span><button type="button" class="ep-plan-mini ep-clickable" data-pc-priceback>${T.back}</button></div>
      <div class="ep-plan-srow"><b>${esc(name)}</b></div>
      <div class="ep-plan-srow"><label class="ep-plan-range" style="flex:1 1 100%">${T.priceLabel} (${esc(unit)}), ₽
        <input type="number" inputmode="decimal" min="0" step="0.01" value="${curPrice || ""}" data-pc-pricevalue></label></div>
      <div class="ep-plan-srow ep-plan-hintrow">${T.priceHint}</div>
      <div class="ep-plan-srow ep-plan-sbtns"><button type="button" class="btn btn-primary ep-clickable" data-pc-pricesave data-pc-pname="${esc(name)}" data-pc-ptype="${esc(type)}" data-pc-punit="${esc(unit)}">${T.priceSave}</button></div>`);
    const inp = document.querySelector("[data-pc-pricevalue]");
    if (inp) { inp.focus(); inp.select(); }
  }

  // заменить название авто-позиции (✎): p.calcEdits.renamed[ключ] = новое имя;
  // возврат к исходному — сохранить пустым или исходным названием
  function sheetEditName(key, curName) {
    const origName = key.split("|").slice(1).join("|");
    rooms().openSheet(`<div class="ep-plan-srow"><b>${T.editTitle}</b>
        <span class="ep-plan-flex"></span><button type="button" class="ep-plan-mini ep-clickable" data-pc-priceback>${T.back}</button></div>
      <div class="ep-plan-srow ep-plan-mshint">${esc(origName)}</div>
      <div class="ep-plan-srow"><label class="ep-plan-range" style="flex:1 1 100%">${T.nameLbl}
        <input type="text" value="${esc(curName)}" data-pc-editval></label></div>
      <div class="ep-plan-srow ep-plan-hintrow">${T.editHint}</div>
      <div class="ep-plan-srow ep-plan-sbtns"><button type="button" class="btn btn-primary ep-clickable" data-pc-editsave data-pc-ekey="${esc(key)}">${T.saveBtn}</button></div>`);
    const inp = document.querySelector("[data-pc-editval]");
    if (inp) { inp.focus(); inp.select(); }
  }
  // своя позиция (работа/материал) — добавление или правка уже добавленной (idx>=0)
  function sheetCustomItem(idx) {
    const p = core().project;
    const cur = (idx != null && p.calcEdits && p.calcEdits.custom[idx]) || { type: "work", name: "", qty: 1, unit: "шт" };
    rooms().openSheet(`<div class="ep-plan-srow"><b>${T.addTitle}</b>
        <span class="ep-plan-flex"></span><button type="button" class="ep-plan-mini ep-clickable" data-pc-priceback>${T.back}</button></div>
      <div class="ep-plan-srow">
        <button type="button" class="ep-plan-chip ep-clickable ${cur.type !== "material" ? "on" : ""}" data-pc-ctype="work">${T.typeWork}</button>
        <button type="button" class="ep-plan-chip ep-clickable ${cur.type === "material" ? "on" : ""}" data-pc-ctype="material">${T.typeMaterial}</button>
      </div>
      <div class="ep-plan-srow"><label class="ep-plan-range" style="flex:1 1 100%">${T.nameLbl}
        <input type="text" value="${esc(cur.name)}" data-pc-cname></label></div>
      <div class="ep-plan-srow">
        <label class="ep-plan-range" style="flex:1 1 100px">${T.qtyLbl}
          <input type="number" inputmode="decimal" min="0" step="0.1" value="${cur.qty}" data-pc-cqty></label>
        <label class="ep-plan-range" style="flex:1 1 100px">${T.unitLbl}
          <input type="text" value="${esc(cur.unit)}" data-pc-cunit></label>
      </div>
      <div class="ep-plan-srow ep-plan-sbtns"><button type="button" class="btn btn-primary ep-clickable" data-pc-customsave data-pc-cidx="${idx != null ? idx : ""}">${T.saveBtn}</button></div>`);
    const inp = document.querySelector("[data-pc-cname]");
    if (inp && !cur.name) inp.focus();
  }
  // правка модели правок сметы: commit -> мутация -> persist — обычная undo-запись
  function editCalc(fn) {
    const c = core(); c.commit();
    c.project.calcEdits = c.project.calcEdits || { hidden: [], renamed: {}, custom: [] };
    fn(c.project.calcEdits);
    c.persist("calc-edit");
    sheet();
  }

  document.addEventListener("click", (e) => {
    if (!rooms() || !rooms().isActive()) return;
    const t = e.target;
    if (t.closest("[data-plan-calc]")) return sheet();
    let b;
    // монохром/RGB у линии 24В — от этого зависит кабель «от щита» (2 жилы против 5)
    if ((b = t.closest("[data-pc-rgb]"))) {
      const c = core(), cid = b.getAttribute("data-pc-circid");
      const cc = (c.project.circuits || []).find((x) => x.id === cid);
      if (!cc) return;
      c.commit(); cc.rgb = b.getAttribute("data-pc-rgb") === "1";
      c.persist("circuit-rgb"); sheet(); rooms().renderScene(); return;
    }
    if ((b = t.closest("[data-pc-hide]")) && b.getAttribute("data-pc-ekey")) {
      const k = b.getAttribute("data-pc-ekey");
      return editCalc((ed) => { if (ed.hidden.indexOf(k) < 0) ed.hidden.push(k); });
    }
    if ((b = t.closest("[data-pc-unhide]"))) {
      const k = b.getAttribute("data-pc-ekey");
      return editCalc((ed) => { ed.hidden = ed.hidden.filter((x) => x !== k); });
    }
    if (t.closest("[data-pc-unhideall]")) return editCalc((ed) => { ed.hidden = []; });
    if ((b = t.closest("[data-pc-editname]"))) return sheetEditName(b.getAttribute("data-pc-ekey"), b.getAttribute("data-pc-ecur"));
    if ((b = t.closest("[data-pc-editsave]"))) {
      const k = b.getAttribute("data-pc-ekey");
      const origName = k.split("|").slice(1).join("|");
      const val = ((document.querySelector("[data-pc-editval]") || {}).value || "").trim();
      return editCalc((ed) => {
        if (!val || val === origName) delete ed.renamed[k];
        else ed.renamed[k] = val;
      });
    }
    if (t.closest("[data-pc-additem]")) return sheetCustomItem(null);
    if ((b = t.closest("[data-pc-editcustom]"))) return sheetCustomItem(Number(b.getAttribute("data-pc-editcustom")));
    if ((b = t.closest("[data-pc-delcustom]"))) {
      const i = Number(b.getAttribute("data-pc-delcustom"));
      return editCalc((ed) => { ed.custom.splice(i, 1); });
    }
    if ((b = t.closest("[data-pc-ctype]"))) { // тумблер Работа/Материал в форме своей позиции
      document.querySelectorAll("[data-pc-ctype]").forEach((x) => x.classList.toggle("on", x === b));
      return;
    }
    if ((b = t.closest("[data-pc-customsave]"))) {
      const idxRaw = b.getAttribute("data-pc-cidx");
      const idx = idxRaw === "" ? null : Number(idxRaw);
      const typeBtn = document.querySelector("[data-pc-ctype].on");
      const item = {
        type: typeBtn ? typeBtn.getAttribute("data-pc-ctype") : "work",
        name: ((document.querySelector("[data-pc-cname]") || {}).value || "").trim(),
        qty: Number((document.querySelector("[data-pc-cqty]") || {}).value) || 0,
        unit: ((document.querySelector("[data-pc-cunit]") || {}).value || "шт").trim() || "шт"
      };
      if (!item.name || item.qty <= 0) { rooms().toast(T.nameLbl + " и " + T.qtyLbl.toLowerCase() + " обязательны"); return; }
      return editCalc((ed) => { if (idx == null) ed.custom.push(item); else ed.custom[idx] = item; });
    }
    if (t.closest("[data-pc-close]")) { rooms().closeSheet(); return; }
    if (t.closest("[data-pc-consumcfg]")) return sheetConsumSettings();
    if (t.closest("[data-pc-consumback]")) return sheet();
    if (t.closest("[data-pc-setprice]")) {
      const b = t.closest("[data-pc-setprice]");
      return sheetSetPrice(b.getAttribute("data-pc-pname"), b.getAttribute("data-pc-ptype"), b.getAttribute("data-pc-punit"), b.getAttribute("data-pc-pcur"));
    }
    if ((b = t.closest("[data-pc-editcable]"))) return sheetEditCable(b.getAttribute("data-pc-circid"), b.getAttribute("data-pc-curmark"), b.getAttribute("data-pc-cablefield"));
    if ((b = t.closest("[data-pc-cablepick]"))) { const inp = document.querySelector("[data-pc-cablemark]"); if (inp) inp.value = b.getAttribute("data-pc-cablepick"); return; }
    if ((b = t.closest("[data-pc-cablesave]"))) {
      const circId = b.getAttribute("data-pc-circid");
      const field = b.getAttribute("data-pc-cablefield") === "cable220" ? "cable220" : "cable";
      const val = ((document.querySelector("[data-pc-cablemark]") || {}).value || "").trim();
      const c = core(); c.commit();
      const circ = (c.project.circuits || []).find((x) => x.id === circId);
      if (circ) circ[field] = val || null; // пусто — сброс на автоподбор (см. T.cableHint)
      c.persist("circuit-cable");
      return sheet();
    }
    if (t.closest("[data-pc-priceback]")) return sheet();
    if (t.closest("[data-pc-pricesave]")) {
      const b = t.closest("[data-pc-pricesave]");
      const name = b.getAttribute("data-pc-pname"), type = b.getAttribute("data-pc-ptype"), unit = b.getAttribute("data-pc-punit");
      const inp = document.querySelector("[data-pc-pricevalue]");
      const price = Number(inp && inp.value) || 0;
      if (price > 0 && window.EP && window.EP.Database) {
        const D = EP.Database;
        // если позиция с таким именем уже есть в «Моей БД» — правим цену на месте
        // (updateMyItem), а не плодим дубль тем же именем (addMyItem создал бы второй
        // независимый item — priceFor() всё равно нашёл бы верную цену через find(),
        // но в самой БД остался бы мёртвый дубль со старой ценой)
        const mine = (D.getItems && D.getItems("my")) || [];
        const existing = mine.find((x) => x.type === type && String(x.name).toLowerCase() === String(name).toLowerCase());
        if (existing && D.updateMyItem) D.updateMyItem(existing.id, { price });
        else if (D.addMyItem) D.addMyItem({ type, name, unit, price, category: "Проект квартиры", subcategory: type === "work" ? "Работы" : "Материалы" });
      }
      return sheet(); // назад к расчёту — цена, если сохранилась, уже найдётся priceFor()
    }
  });
  document.addEventListener("change", (e) => {
    if (!rooms() || !rooms().isActive()) return;
    if (e.target.getAttribute && e.target.getAttribute("data-pc-reserve") != null) {
      const c = core(); c.commit();
      c.project.settings.cableReserve = Math.max(0, Math.min(50, Number(e.target.value) || 0));
      c.persist("cable-reserve"); sheet();
    }
    if (e.target.getAttribute && e.target.getAttribute("data-pc-cablebrand") != null) {
      const c = core(); c.commit();
      c.project.settings.cableBrand = String(e.target.value || "").trim();
      c.persist("cable-brand"); sheet();
    }
    if (e.target.getAttribute && e.target.getAttribute("data-pc-cable24") != null) {
      const c = core(); c.commit();
      c.project.settings.cable24 = String(e.target.value || "").trim();
      c.persist("cable-24"); sheet();
    }
    if (e.target.getAttribute && e.target.getAttribute("data-pc-cable24rgb") != null) {
      const c = core(); c.commit();
      c.project.settings.cable24Rgb = String(e.target.value || "").trim();
      c.persist("cable-24rgb"); sheet();
    }
    if (e.target.getAttribute && e.target.getAttribute("data-pc-templight") != null) {
      const c = core(); c.commit();
      c.project.settings.tempLightingPts = Math.max(0, Number(e.target.value) || 0);
      c.persist("temp-lighting"); sheet();
    }
    if (e.target.getAttribute && e.target.getAttribute("data-pc-tempsock") != null) {
      const c = core(); c.commit();
      c.project.settings.tempSocketsPts = Math.max(0, Number(e.target.value) || 0);
      c.persist("temp-sockets"); sheet();
    }
    if (e.target.getAttribute && e.target.getAttribute("data-pc-stubpoint") != null) {
      const c = core(); c.commit();
      c.project.settings.cableStubPoint = Math.max(0, Math.min(200, Number(e.target.value) || 0));
      c.persist("cable-stub"); sheet();
    }
    if (e.target.getAttribute && e.target.getAttribute("data-pc-stubjunction") != null) {
      const c = core(); c.commit();
      c.project.settings.cableStubJunction = Math.max(0, Math.min(200, Number(e.target.value) || 0));
      c.persist("cable-stub"); sheet();
    }
    if (e.target.getAttribute && e.target.getAttribute("data-pc-stubpanel") != null) {
      const c = core(); c.commit();
      c.project.settings.cableStubPanel = Math.max(0, Math.min(200, Number(e.target.value) || 0));
      c.persist("cable-stub"); sheet();
    }
  });

  EP.Plan = EP.Plan || {};
  EP.Plan.Calc = { sheet, buildBlocks, runEngine, priceFor, calcByRoutes, estimateItems, perCircuit, setPrefetched, memoToken, sheetConsumSettings, applyCalcEdits, defaultCableMark, is24Circuit };
})();
