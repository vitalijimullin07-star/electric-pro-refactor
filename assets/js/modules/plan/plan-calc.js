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
    tempHint: "Временные сети на время ремонта (организация — не выводится из чертежа, вводится вручную)",
    tempLighting: "Врем. освещение, точек", tempSockets: "Врем. розетки, точек",
    noPrice: "нет цены в БД", total: "Итого по ценам БД",
    priceTitle: "Цена", priceLabel: "Цена за", priceSave: "✓ Сохранить в БД",
    priceHint: "Сохранится в «Мою БД» — эта же цена подставится автоматически в этом и других проектах.",
    consumCfg: "⚙ Настроить расходники", consumTitle: "⚙ Логика расходников", back: "‹ Назад",
    byLines: "По линиям (QF)", secCable: "Кабель", secConsum: "Расходники",
    secMaterial: "Материалы", secWork: "Работы"
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
    const row = (id) => (byId[id] = byId[id] || { cableLen: 0, mark: null, points: 0, posts: 0, crossings: 0 });
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
      const L = G().polylineLen(rt.points || []) + (el ? RT.pointVert(p, el) * RT.hopVertMul(p, rt) : 0) + (rt.toPanel ? RT.panelVert(p, pn) : 0);
      const r = row(rt.circuitId);
      r.cableLen += L; r.crossings += (rt.throughWalls || []).length;
      const cc = (p.circuits || []).find((c) => c.id === rt.circuitId);
      if (!r.mark) r.mark = (cc && cc.cable) || (rt.layer === "light" ? "3×1.5" : "3×2.5");
    });
    return (p.circuits || []).map((c) => {
      const r = byId[c.id] || { cableLen: 0, mark: c.cable || null, points: 0, posts: 0, crossings: 0 };
      return { id: c.id, name: c.name, color: c.color, breaker: c.breaker, rcd: c.rcd,
        cableLen: Math.round((r.cableLen / 100) * reserve * 10) / 10, mark: r.mark, points: r.points, posts: r.posts, crossings: r.crossings };
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
      // принимающей горизонталь на месте) — hopVertMul=2 для такого хопа
      const L = G2.polylineLen(r.points || []) + (e2 ? RT.pointVert(p, e2) * RT.hopVertMul(p, r) : 0) + (r.toPanel ? RT.panelVert(p, pn) : 0);
      const cc = (p.circuits || []).find((c) => c.id === r.circuitId);
      let mark = (cc && cc.cable) || null;
      if (!mark) {
        if (r.layer === "light") mark = "ВВГнг(А)-LS 3×1.5";
        else if (r.layer === "warm") mark = "Кабель тёплого пола";
        else if (LV_LAYERS[r.layer]) mark = "Слаботочный (UTP/RG-6)";
        else mark = "ВВГнг(А)-LS 3×2.5";
      }
      cableBy[mark] = (cableBy[mark] || 0) + L;
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
    if (junctBoxes) add("work", "Монтаж и расключение распределительной коробки", junctBoxes, "шт");
    Object.keys(cableBy).forEach((m) => add("material", `Кабель ${m}`, cableBy[m], "м"));
    // прокладка кабеля — работа отдельно от материала (метраж кабеля тот же, что уже
    // посчитан построчно выше по маркам)
    const totalCableM = Object.keys(cableBy).reduce((sum, m) => sum + cableBy[m], 0);
    add("work", "Прокладка кабеля", totalCableM, "м");
    // проходки через стены: Ø20, макс. 2 кабеля в гильзу; группируем по месту (~20 см)
    const sleeves = {}; // "x|y" -> { n: кабелей, wallId }
    routes.forEach((r) => {
      const seen = {};
      (r.throughWalls || []).forEach((c) => {
        const key = Math.round(c.x / 20) + "|" + Math.round(c.y / 20);
        if (seen[key]) return; // общая стена двух комнат — одно место, одна гильза
        seen[key] = 1;
        if (!sleeves[key]) sleeves[key] = { n: 0, wallId: c.wallId };
        sleeves[key].n++;
      });
    });
    const sleeveByMat = {};
    Object.keys(sleeves).forEach((k) => {
      const w = G2.wallById(p, sleeves[k].wallId);
      const mat = w ? G2.wallMatOf(p, w) : ((s && s.wallMaterial) || "Бетон");
      sleeveByMat[mat] = (sleeveByMat[mat] || 0) + Math.ceil(sleeves[k].n / 2);
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
    return { items, cableBy, strobe, conn, podroz, junctBoxes };
  }

  // ---------- позиции для сметы: тот же приоритет, что и в sheet() —
  // точный счёт по построенным трассам, иначе приближённый по движку пула ----------
  function estimateItems(p) {
    const stats = buildBlocks(p);
    if (!stats.length) return null;
    const exact = calcByRoutes(p);
    if (exact && exact.items.length) return exact.items;
    const res = runEngine(p, stats);
    return (res && res.draftItems) || null;
  }

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
    const exact = calcByRoutes(p);
    let items, headHtml;
    if (exact && exact.items.length) {
      items = exact.items;
      headHtml = `<div class="ep-plan-srow"><b>${T.exactHead}</b></div>
        <div class="ep-plan-srow ep-plan-hintrow">${T.exactHint}</div>
        <div class="ep-plan-srow"><label class="ep-plan-range" style="flex:0 0 150px">${T.reserve}
          <input type="number" inputmode="numeric" min="0" max="50" value="${Math.round(p.settings.cableReserve == null ? 10 : p.settings.cableReserve)}" data-pc-reserve></label></div>
        <div class="ep-plan-srow ep-plan-hintrow">${T.tempHint}</div>
        <div class="ep-plan-srow">
          <label class="ep-plan-range" style="flex:1 1 150px">${T.tempLighting}
            <input type="number" inputmode="numeric" min="0" value="${Math.round(p.settings.tempLightingPts || 0)}" data-pc-templight></label>
          <label class="ep-plan-range" style="flex:1 1 150px">${T.tempSockets}
            <input type="number" inputmode="numeric" min="0" value="${Math.round(p.settings.tempSocketsPts || 0)}" data-pc-tempsock></label>
        </div>`;
    } else {
      const res = runEngine(p, stats);
      items = res && res.draftItems ? res.draftItems : null;
      headHtml = `<div class="ep-plan-srow"><b>${T.workHead}</b></div>
        <div class="ep-plan-srow ep-plan-hintrow">${T.approxHint}</div>`;
    }
    // цены — из EP.Database (по совпадению названия, priceFor); строка «нет цены»,
    // если для позиции нет подходящей записи в БД, и общий итог по найденным ценам
    const fmtRub = (n) => (window.EP.Currency && EP.Currency.format) ? EP.Currency.format(n) : (Math.round(n * 100) / 100) + " ₽";
    // разбивка по линиям QF (информационная сводка) — только если есть трассы и линии
    const perQF = exact && exact.items.length ? perCircuit(p) : null;
    // пометка «с запасом» ОБЯЗАТЕЛЬНА: perCircuit() считает длины С запасом кабеля
    // (+N%), а сводка «Кабель по трассам» выше — БЕЗ запаса; без пометки сумма по
    // линиям не сходилась со «всего» на вид (репорт полного визуального теста:
    // 10.4+8.4=18.8 против «17.05 всего» — оба числа верные, но выглядело ошибкой)
    const perQFHtml = (perQF && perQF.length)
      ? `<div class="ep-plan-srow"><b>${T.byLines}</b><span class="ep-plan-flex"></span><span class="ep-plan-mshint">кабель с запасом +${Math.round(p.settings.cableReserve == null ? 10 : p.settings.cableReserve)}%</span></div>` +
        `<div class="ep-plan-qflist">${perQF.map((r) => `<div class="ep-plan-qfrow">
            <span class="ep-plan-cdot" style="background:${esc(r.color)}"></span><b>${esc(r.name)}</b>
            <span class="ep-plan-qfmeta">${r.breaker || "—"}A${r.rcd ? " · УЗО" : ""}</span>
            <span class="ep-plan-flex"></span>
            <span class="ep-plan-qfnums">${r.mark ? esc(r.mark) + " · " : ""}${r.cableLen ? G().fmtLen(r.cableLen * 100) : "—"} · ${r.points} тчк${r.crossings ? " · " + r.crossings + " прох." : ""}</span>
          </div>`).join("")}</div>`
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
      const irow = ({ it, price, lineSum }) => `<div class="ep-plan-irow"><span>${esc(it.name)}</span><span class="ep-plan-irow-r"><b>${it.qty} ${esc(it.unit)}</b><button type="button" class="ep-plan-iprice${price > 0 ? "" : " is-noprice"} ep-clickable" data-pc-setprice data-pc-pname="${esc(it.name)}" data-pc-ptype="${esc(it.type)}" data-pc-punit="${esc(it.unit)}" data-pc-pcur="${price > 0 ? price : ""}">${price > 0 ? esc(fmtRub(lineSum)) : esc(T.noPrice)}</button></span></div>`;
      // группировка по секциям (Кабель / Работы / Материалы / Расходники) —
      // просьба пользователя «информативно по расходке», чтобы расходка читалась отдельно
      const secHtml = SECTIONS.map(([key, label]) => {
        const rows = priced.filter((x) => x.sec === key);
        if (!rows.length) return "";
        const secSum = rows.reduce((s, x) => s + (x.price > 0 ? x.lineSum : 0), 0);
        return `<div class="ep-plan-srow ep-plan-sechead"><b>${label}</b><span class="ep-plan-flex"></span><span class="ep-plan-mshint">${secSum > 0 ? esc(fmtRub(secSum)) : ""}</span></div>
          <div class="ep-plan-items ep-plan-secitems">${rows.map(irow).join("")}</div>`;
      }).join("");
      itemsHtml = `${headHtml}${secHtml}
        <div class="ep-plan-srow ep-plan-total"><b>${esc(T.total)}</b><b>${esc(fmtRub(total))}</b>${noPriceN ? `<span class="ep-plan-mshint">(${noPriceN} без цены в БД)</span>` : ""}</div>`;
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

  document.addEventListener("click", (e) => {
    if (!rooms() || !rooms().isActive()) return;
    const t = e.target;
    if (t.closest("[data-plan-calc]")) return sheet();
    if (t.closest("[data-pc-close]")) { rooms().closeSheet(); return; }
    if (t.closest("[data-pc-consumcfg]")) return sheetConsumSettings();
    if (t.closest("[data-pc-consumback]")) return sheet();
    if (t.closest("[data-pc-setprice]")) {
      const b = t.closest("[data-pc-setprice]");
      return sheetSetPrice(b.getAttribute("data-pc-pname"), b.getAttribute("data-pc-ptype"), b.getAttribute("data-pc-punit"), b.getAttribute("data-pc-pcur"));
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
  });

  EP.Plan = EP.Plan || {};
  EP.Plan.Calc = { sheet, buildBlocks, runEngine, priceFor, calcByRoutes, estimateItems, perCircuit, sheetConsumSettings };
})();
