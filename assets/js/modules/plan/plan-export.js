/* Electric Pro V29 — Проект квартиры: печатный лист (Remplanner-стиль).
   Кнопка 📄 собирает лист А4: рамка со штампом, план в чистом виде (без
   сетки и подложки), экспликация помещений, легенда, спецификация точек.
   Открывается окно печати — «Сохранить как PDF» на любом устройстве. */
(() => {
  "use strict";
  window.EP = window.EP || {};

  const T = { sheet: "План электрики", made: "Исполнитель", obj: "Объект", addr: "Адрес", client: "Заказчик", area: "Площадь", roomsN: "Помещений", date: "Дата", legend: "Условные обозначения", expl: "Экспликация помещений", spec: "Спецификация точек", door: "Дверь", win: "Окно", panel: "Щит", genplan: "Общий план", specSheet: "Экспликация и условные обозначения", tracesOf: (name) => `Трассы: ${name}`,
    stage: "Стадия", stageVal: "Р", sheetNo: "Лист", sheetsN: "Листов", scaleLbl: "Масштаб",
    album: "Состав альбома", docTitle: "Проект электроснабжения", sheetName: "Наименование листа",
    unfolds: "Развёртки стен", scheme: "Однолинейная схема", circuits: "Линии и щит",
    dimsOf: (name) => `Размеры и высоты: ${name}`,
    // ГОСТ 21.110 — спецификация оборудования, изделий и материалов
    specGost: "Спецификация оборудования, изделий и материалов",
    specCols: ["Позиция", "Наименование и техническая характеристика", "Тип, марка, обозначение документа, опросного листа",
      "Код оборудования, изделия, материала", "Поставщик", "Единица измерения", "Коли-<br>чество", "Масса единицы, кг", "Примечание"],
    secShields: "Щитовые устройства", secCables: "Провода и кабели",
    secDevices: "Электроустановочные изделия", secMount: "Монтажные изделия",
    byDesign: "по дизайн-проекту", section: "Электрооборудование и электроосвещение",
    specNote: `<b>Примечание:</b><br>1. Количество материалов уточняется по месту.<br>2. В спецификации указаны рекомендуемые материалы и оборудование.<br>Допускается замена указанных материалов и оборудования на другие с аналогичными характеристиками, имеющие сертификаты соответствия Госстандарта РФ.` };
  // слои-«трассы» — те, что реально прокладываются кабелем (не считая dims/labels/routes —
  // это служебные оверлеи, не самостоятельный вид работ)
  const TRACE_LAYER_IDS = ["light", "power", "lv", "tv", "cctv", "ac", "warm"];

  const esc = (s) => String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const core = () => EP.Plan.Core;
  const G = () => EP.Plan.Geometry;
  const rooms = () => EP.Plan.Rooms;

  // масштаб символов/подписей на развёртках стен в PDF — сессионная настройка
  // (как S.sym в живой развёртке, plan-unfold.js: не часть модели проекта,
  // сбрасывается между сессиями), крутится ползунком в шторке 📄 перед печатью
  let pdfScale = 1;

  // чистый SVG плана: отдельный офф-скрин холст, без сетки и подложки.
  // floorScoped() ЗДЕСЬ, а не у каждого вызывающего — buildLayerPages() тоже
  // зовёт buildSvg(p) внутри withLayers(), одно место фильтра покрывает оба
  // случая. У многоэтажных проектов «Общий план»/страницы по слоям в PDF —
  // ТОЛЬКО активный этаж (известное ограничение Этапа 1: без разбивки PDF
  // постранично по этажам — иначе комнаты разных этажей легли бы друг на
  // друга в одних координатах).
  function buildSvg(pRaw, uiExtra) {
    const p = G().floorScoped(pRaw);
    const host = document.createElement("div");
    host.style.cssText = "position:fixed;left:-2000px;top:0;width:1050px;height:700px;";
    document.body.appendChild(host);
    const cv = EP.Plan.Canvas.create(host);
    // ЯВНЫЙ размер офскрин-холста: .ep-plan-svg в plan.css — flex:1 1 auto; width:auto;
    // height:auto (нужно живому редактору), а host здесь НЕ flex-контейнер, поэтому svg
    // сжимался до интринсик-размера и fit() мерил не 1050×700, а почти вертикальный бокс —
    // viewBox выходил портретным, и подбор масштаба давал 1:150 вместо 1:50 (поймано живым
    // прогоном печати: план 8×4м печатался как 60×142мм вместо 160×80мм).
    cv.svg.style.width = "1050px"; cv.svg.style.height = "700px";
    const bb = G().projectBBox(p);
    if (bb) cv.fit(bb, 0.07);
    EP.Plan.Render.draw(cv, p, uiExtra || {});
    if (uiExtra && uiExtra.freeDims) freeDimsOverlay(cv, p);
    ["grid", "underlay"].forEach((n) => { const gl = cv.layers[n]; while (gl.firstChild) gl.removeChild(gl.firstChild); });
    // ИСТИННЫЙ МАСШТАБ ЧЕРТЕЖА (признак проф. документа, а не картинки «во всю ширину»):
    // viewBox после fit() — в САНТИМЕТРАХ проекта, поэтому физический размер на бумаге =
    // см × 10 / знаменатель масштаба (мм). Подбираем ближайший СТАНДАРТНЫЙ масштаб, при
    // котором чертёж влезает в поле листа, и задаём svg размер в мм — печать выходит
    // в реальном масштабе, и он же честно пишется в штамп.
    const vb = String(cv.svg.getAttribute("viewBox") || "").trim().split(/\s+/).map(Number);
    let scale = null, boxMm = null;
    if (vb.length === 4 && vb[2] > 0 && vb[3] > 0) {
      const AREA = planArea();
      if (pdfFit) {
        // мм на сантиметр проекта: сколько влезает по узкой стороне поля (пропорции целы)
        // k — миллиметров бумаги на ДЕЦИМЕТР проекта (viewBox в см), берём меньшее из
        // двух, чтобы пропорции чертежа не искажались
        const k = Math.min(AREA.w / (vb[2] / 10), AREA.h / (vb[3] / 10));
        boxMm = { w: Math.round(vb[2] / 10 * k * 10) / 10, h: Math.round(vb[3] / 10 * k * 10) / 10 };
        // знаменатель масштаба: см проекта × 10 / мм бумаги = 100 / k (НЕ 10/k — на
        // этом первый прогон дал бессмысленные «1:3»/«1:9», поймано замером)
        scale = Math.max(1, Math.round(100 / k));
        lastPlanFit = true;
      } else {
        scale = SCALES.find((sc) => (vb[2] * 10 / sc) <= AREA.w && (vb[3] * 10 / sc) <= AREA.h) || SCALES[SCALES.length - 1];
        boxMm = { w: Math.round(vb[2] * 100 / scale) / 10, h: Math.round(vb[3] * 100 / scale) / 10 };
        lastPlanFit = false;
      }
    }
    // Физический размер чертежа ставим В ПИКСЕЛЯХ (1px = 1/96 дюйма — точный перевод из
    // мм), а НЕ в «мм» и не процентами от обёртки. Это не косметика: печатный компositор
    // Chromium рисовал содержимое такого svg со сдвигом (левый верхний угол чертежа
    // попадал в ЦЕНТР своего бокса) и в масштабе ×4/3 (96/72 dpi) — половина плана
    // уезжала за край листа и обрезалась. Проверено печатью в PDF на A1 и A3: с «мм» и
    // с процентами — сдвиг и обрезка, с px — чертёж ровно в поле листа. Именно в px
    // (1050×700) svg и печатался всё время до этой правки — просто размер был
    // ФИКСИРОВАННЫЙ, от формата листа и масштаба не зависел.
    if (boxMm) {
      const MM = 96 / 25.4;
      cv.svg.setAttribute("width", Math.round(boxMm.w * MM));
      cv.svg.setAttribute("height", Math.round(boxMm.h * MM));
    } else {
      cv.svg.setAttribute("width", "100%");
    }
    cv.svg.removeAttribute("class");
    // КРИТИЧНО: снять ИНЛАЙН-стиль width/height 1050×700px, который выставлен выше ТОЛЬКО
    // для офскрин-обмера (fit() должен мерить ландшафтный бокс, см. комментарий там). В
    // печатный лист уходит cv.svg.outerHTML вместе с этим style, а инлайн-стиль ВСЕГДА
    // сильнее одноимённых презентационных атрибутов width/height — те самые «мм», которые
    // мы только что посчитали по масштабу, молча игнорировались, и чертёж на ЛЮБОМ формате
    // печатался в неизменном боксе 1050×700px ≈ 278×185мм (поле листа A4!). Именно это
    // видел пользователь: «выбрал А1, а проект как будто в А4 остался» и «общий план не во
    // весь лист» — формат листа и масштаб в штампе менялись, физический размер чертежа нет.
    cv.svg.style.width = ""; cv.svg.style.height = "";
    if (!cv.svg.getAttribute("style")) cv.svg.removeAttribute("style");
    const html = cv.svg.outerHTML;
    cv.destroy();
    document.body.removeChild(host);
    lastPlanScale = scale;
    return html;
  }
  // поле чертежа внутри рамки листа A4 landscape (297×210 при полях 20/5/5/5 и штампе
  // 185×25мм справа снизу) и стандартный ряд масштабов строительных чертежей
  // Формат листа альбома (просьба пользователя: «отдельно пдф делать на формат
  // А1-А2-А0» — на больших форматах чертёж печатается КРУПНЕЕ, вплоть до 1:20).
  // Сессионная настройка, как pdfScale (не часть модели проекта). Поле чертежа
  // считается от размера листа теми же полями/штампом, что были у A4 (297-35 × 210-64),
  // поэтому автоподбор масштаба (SCALES ниже) сам выбирает более крупный масштаб.
  const PAGE = { A4: { w: 297, h: 210 }, A3: { w: 420, h: 297 }, A2: { w: 594, h: 420 }, A1: { w: 841, h: 594 }, A0: { w: 1189, h: 841 } };
  let pdfFormat = "A4";
  const pg = () => PAGE[pdfFormat] || PAGE.A4;
  // высота поля: лист − (5+5 поля, 6 внутренний отступ рамки, ~9 заголовок листа,
  // 58 основная надпись по ГОСТ 21.101 — она стала выше прежней вольной вёрстки)
  const planArea = () => ({ w: pg().w - 35, h: pg().h - 84 });
  // Ряд подбирается «первый, при котором влезает» = САМЫЙ КРУПНЫЙ из подходящих.
  // Шагов стало больше (добавлены 30/40/60/125): на грубой лестнице 25→50→75 чертёж
  // часто занимал 60% поля листа и вокруг оставалась пустота — «проект не
  // масштабируется под печать» (репорт пользователя). Промежуточные метрические
  // масштабы — такие же стандартные, и они честно пишутся в штамп.
  // 1:10 и 1:15 (тоже стандартные по ГОСТ 2.302) добавлены ради БОЛЬШИХ форматов: ряд
  // начинался с 1:20, и на A1/A0 «стандартный» режим упирался в него — чертёж квартиры
  // занимал 45% листа A1 и 32% A0, дальше крупнее было просто нечем (замер раскладки).
  const SCALES = [10, 15, 20, 25, 30, 40, 50, 60, 75, 100, 125, 150, 200, 250, 500];
  let lastPlanScale = null; // масштаб последнего собранного плана — идёт в штамп листа
  let lastPlanFit = false;  // он получен «вписыванием в лист» (нестандартный) — пометка в штампе
  // «Во весь лист» (репорт пользователя: «выбрал формат а1, а проект как будто в а4
  // остался»): стандартный ряд масштабов оставляет 10-40% поля пустыми, потому что
  // берётся ближайший СТАНДАРТНЫЙ масштаб, при котором чертёж влезает. В этом режиме
  // чертёж растягивается точно на поле листа, а в штамп идёт получившийся (нестандартный)
  // масштаб с пометкой «впис.» — честнее, чем молча печатать мелко. Сессионная настройка,
  // как pdfScale/pdfFormat (не часть модели проекта).
  let pdfFit = true;

  // Привязка СВОБОДНЫХ точек (свет/трек/ТП/вывод/распайка — те, что не на стене) на листах
  // «Размеры и высоты»: у настенных точек размеры даёт обычная размерная цепочка вдоль стены
  // (слой «Размеры», тот же счёт, что и в живом плане), а у свободных цепочки нет в принципе —
  // без привязки лист со светом был бы «точки без размеров». Рисуем ДВЕ выноски от габарита
  // комнаты (левая стена → X, верхняя стена → Y), как на монтажном чертеже. Только в PDF
  // (офскрин-оверлей поверх уже готовой сцены) — живой план не трогаем.
  function freeDimsOverlay(cv, p) {
    const g = cv.layers.overlay;
    const k = cv.cmPerPx();
    const NS = "http://www.w3.org/2000/svg";
    const mk = (tag, attrs, txt) => {
      const n = document.createElementNS(NS, tag);
      Object.keys(attrs).forEach((a) => n.setAttribute(a, attrs[a]));
      if (txt != null) n.textContent = txt;
      g.appendChild(n);
    };
    (p.elements || []).forEach((el) => {
      if (el.wallId) return;
      const q = el.params || {};
      if (q.x == null || q.y == null) return;
      const room = G().roomAt(p, q);
      if (!room || (room.points || []).length < 3) return;
      const xs = room.points.map((pt) => pt.x), ys = room.points.map((pt) => pt.y);
      const x0 = Math.min.apply(null, xs), y0 = Math.min.apply(null, ys);
      const dx = Math.round(q.x - x0), dy = Math.round(q.y - y0);
      const st = { class: "ep-plan-freedim", "stroke-width": Math.max(0.6, 0.9 * k) };
      if (dx > 5) {
        mk("line", Object.assign({ x1: x0, y1: q.y, x2: q.x, y2: q.y }, st));
        mk("text", { x: (x0 + q.x) / 2, y: q.y - 3 * k, "font-size": 8 * k, "text-anchor": "middle", class: "ep-plan-freedimt" }, dx);
      }
      if (dy > 5) {
        mk("line", Object.assign({ x1: q.x, y1: y0, x2: q.x, y2: q.y }, st));
        mk("text", { x: q.x + 3 * k, y: (y0 + q.y) / 2, "font-size": 8 * k, class: "ep-plan-freedimt" }, dy);
      }
    });
  }

  // временно включает ТОЛЬКО перечисленные слои (project.layers[].visible), зовёт fn,
  // восстанавливает исходную видимость — для страниц-по-слоям альбома (не трогаем
  // настройки видимости, которые пользователь оставил в самом редакторе плана)
  function withLayers(p, onIds, fn) {
    const layers = p.layers || [];
    const orig = layers.map((l) => l.visible);
    layers.forEach((l) => { l.visible = onIds.indexOf(l.id) >= 0; });
    try { return fn(); } finally { layers.forEach((l, i) => { l.visible = orig[i]; }); }
  }
  function layerName(p, id) {
    const l = (p.layers || []).find((x) => x.id === id);
    return l ? l.name : id;
  }
  // какие из «трассируемых» слоёв реально что-то содержат в ЭТОМ проекте (нет
  // смысла печатать пустую страницу «Тёплый пол», если его в проекте нет)
  function usedTraceLayers(p) {
    const used = new Set();
    (p.routes || []).forEach((r) => { if (r.layer) used.add(r.layer); });
    (p.elements || []).forEach((e) => { if (e.layer) used.add(e.layer); });
    return TRACE_LAYER_IDS.filter((id) => used.has(id));
  }
  // отдельная страница альбома на каждый слой трасс — сам план (стены/комнаты
  // рисуются всегда, они не «слой») + точки и трассы ТОЛЬКО этого слоя. labels
  // включаем всегда (имя линии QF над точкой — полезно даже на отдельном листе),
  // routes включаем как мастер-тумблер (рендер трасс гейтится ОБОИМИ: "routes" И
  // r.layer, см. plan-render.js draw()).
  function buildLayerPages(p) {
    const ids = usedTraceLayers(p);
    if (!ids.length) return [];
    return ids.map((id) => {
      const svg = withLayers(p, [id, "routes", "labels"], () => buildSvg(p));
      return { title: T.tracesOf(layerName(p, id)), body: `<div class="plan">${svg}</div>`, scale: lastPlanScale };
    });
  }
  // ---- отдельный ЛИСТ «Размеры и высоты» НА КАЖДЫЙ ТИП точек ----
  // Просьба пользователя (скриншот монтажного чертежа): «на общем плане размеры и высоты
  // отдельно, розеток, выключателей, интернета и т.д. все точки, абсолютно все точки
  // раздельно по типам. без трасс и т.д.» Лист = стены/проёмы/комнаты (рисуются всегда) +
  // точки ТОЛЬКО одного типа + размерные цепочки вдоль стен + высоты h=NNN, БЕЗ трасс.
  // Фильтр по типу сделан НЕ новым параметром рендера, а мелким клоном проекта с урезанным
  // p.elements — тогда автоматически фильтруется ВСЁ разом (маркеры, размерная цепочка,
  // подписи высоты, имена линий QF), и в plan-render.js/plan-geometry.js трогать нечего.
  function typeName(t) {
    const T2 = (EP.Plan.Elements && EP.Plan.Elements.TYPES) || {};
    return (T2[t] && T2[t].name) || t;
  }
  // все типы точек, реально стоящие в проекте; блок раскрывается на свои посты (блок — это
  // рамка с постами разных типов, а не отдельный «тип точки» для листа)
  function usedPointTypes(p) {
    const T2 = (EP.Plan.Elements && EP.Plan.Elements.TYPES) || {};
    const has = new Set();
    (p.elements || []).forEach((e) => {
      if (e.type === "block") ((e.params && e.params.items) || []).forEach((t) => has.add(t));
      else if (e.type !== "panel") has.add(e.type);
    });
    const order = Object.keys(T2).filter((t) => !T2[t].opening && t !== "panel" && t !== "block");
    return order.filter((t) => has.has(t)).concat(Array.from(has).filter((t) => order.indexOf(t) < 0));
  }
  // проект-клон с точками ОДНОГО типа. Блок остаётся ЦЕЛИКОМ, если в нём есть пост нужного
  // типа — это одна физическая рамка на стене, «вынуть» из неё один пост нельзя (ограничение
  // осознанное: на листе «Розетки» блок «розетка+выключатель» показан целиком).
  function projectOfType(p, t) {
    const els = (p.elements || []).filter((e) => e.type === t
      || (e.type === "block" && ((e.params && e.params.items) || []).indexOf(t) >= 0));
    return Object.assign({}, p, { elements: els });
  }
  function buildTypePages(p) {
    const pages = [];
    usedPointTypes(p).forEach((t) => {
      const sub = projectOfType(p, t);
      if (!sub.elements.length) return;
      // слои самих точек + «Размеры» (цепочки) + «Подписи» (имя линии QF); слой "routes"
      // НЕ включаем — трасс на этом листе быть не должно (прямая просьба пользователя)
      const on = Array.from(new Set(sub.elements.map((e) => e.layer).filter(Boolean))).concat(["dims", "labels"]);
      // noLod: на печатном листе LOD-скрытие подписей неуместно — лист статичный, а
      // размеры/высоты это его СМЫСЛ (на большой квартире LOD убрал бы ровно их)
      // noWallLabels: подписи «N · длина» стен на этом листе не нужны (они есть на «Общем
      // плане») и физически налезали на размерную цепочку — а цепочка и есть смысл листа
      const svg = withLayers(p, on, () => buildSvg(sub, { noLod: true, freeDims: true, noWallLabels: true }));
      const n = sub.elements.filter((e) => e.type === t).length;
      const nb = sub.elements.length - n;
      pages.push({
        title: T.dimsOf(typeName(t)), scale: lastPlanScale,
        body: `<div class="tpnote">Размеры — по цепочке от внутренних углов стен; высота установки — <b>h=NNN</b> (см от пола); свободные (потолочные) точки привязаны к габариту помещения. Точек: ${n}${nb ? ` (+ блоков с этим типом: ${nb})` : ""}. Трассы на листе не показаны.</div><div class="plan tpplan">${svg}</div>`
      });
    });
    return pages;
  }
  // титульный лист — заказчик/объект/площадь (просьба пользователя: «титульный
  // лист где информация о заказчике и квартире/доме»)
  // Общие данные проекта для титула и штампа каждого листа
  function docMeta(p) {
    const master = (window.EP.state && EP.state.user && EP.state.user.displayName) || "";
    return {
      obj: p.name || "—", addr: p.address || "—", client: p.client || "—",
      master: master || "—", date: new Date().toLocaleDateString("ru-RU"),
      // поля основной надписи по ГОСТ 21.101 (правятся в шторке ℹ️ проекта):
      // шифр документа, ГИП, организация, стадия. Пустые — прочерк, лист всё равно
      // остаётся оформленным, просто без этих граф.
      code: p.docCode || "", gip: p.gip || "", org: p.org || "",
      stage: p.stage || T.stageVal
    };
  }
  // ОСНОВНАЯ НАДПИСЬ (штамп) — на КАЖДОМ листе, правый нижний угол, как в проектной
  // документации: объект/адрес, заказчик, исполнитель, наименование листа, стадия,
  // номер листа из общего числа, масштаб, дата. Раньше штамп был один раз на титуле,
  // а листы уходили заказчику без единой идентификации (просьба пользователя:
  // «адаптируй печать PDF как проф. документ и проф. чертёж»).
  // ОСНОВНАЯ НАДПИСЬ по ГОСТ 21.101 (форма 3) — 185×55 мм, правый нижний угол:
  // слева таблица изменений и подписи (Разраб./ГИП), в середине шифр документа,
  // объект и наименование листа, справа стадия/лист/листов и организация.
  // Раньше штамп был свободной вёрсткой «объект/адрес/заказчик» — пользователь
  // прислал реальный проектный PDF («хотелось бы точь в точь так»), там ГОСТ-форма.
  function stampHtml(p, title, no, of, scale) {
    const m = docMeta(p);
    const dash = (s) => { const v = String(s == null ? "" : s).trim(); return v && v !== "—" ? esc(v) : ""; };
    const c = (t, cls) => `<td class="s-c${cls ? " " + cls : ""}">${t || ""}</td>`;
    const six = () => c() + c() + c() + c() + c() + c();
    // 5 строк таблицы изменений (графы 14-18): 4 пустые + шапка
    return `<table class="stamp"><colgroup>
        <col style="width:8mm"><col style="width:11mm"><col style="width:12mm"><col style="width:14mm"><col style="width:16mm"><col style="width:18mm">
        <col style="width:70mm"><col style="width:12mm"><col style="width:12mm"><col style="width:12mm">
      </colgroup>
      <tr>${six()}<td class="s-c s-code" colspan="4" rowspan="2">${dash(m.code) || esc(p.name || "")}</td></tr>
      <tr>${six()}</tr>
      <tr>${six()}<td class="s-c s-obj" colspan="4" rowspan="3">${esc(m.addr === "—" ? m.obj : m.addr)}</td></tr>
      <tr>${six()}</tr>
      <tr>${c("Изм.")}${c("Колич.")}${c("Лист")}${c("№ док")}${c("Подп.")}${c("Дата")}</tr>
      <tr><td class="s-l" colspan="2">Разраб.</td><td class="s-c" colspan="2">${dash(m.master)}</td>${c()}${c()}
        <td class="s-c s-sec" rowspan="2">${T.section}</td>
        <td class="s-c s-h">${T.stage}</td><td class="s-c s-h">${T.sheetNo}</td><td class="s-c s-h">${T.sheetsN}</td></tr>
      <tr><td class="s-l" colspan="2">Пров.</td><td class="s-c" colspan="2"></td>${c()}${c()}
        <td class="s-c">${esc(m.stage)}</td><td class="s-c">${no}</td><td class="s-c">${of}</td></tr>
      <tr><td class="s-l" colspan="2">Н. контр.</td><td class="s-c" colspan="2"></td>${c()}${c()}
        <td class="s-c s-title" rowspan="2">${esc(title)}${scale ? `<br>М 1:${scale}${lastPlanFit ? " (впис.)" : ""}` : ""}</td>
        <td class="s-c s-org" colspan="3" rowspan="2">${dash(m.org)}</td></tr>
      <tr><td class="s-l" colspan="2">ГИП</td><td class="s-c" colspan="2">${dash(m.gip)}</td>${c()}${c()}</tr>
    </table>`;
  }
  // Сокращённая основная надпись (ГОСТ 21.101, форма 6) — для ПОСЛЕДУЮЩИХ листов
  // одного документа: только таблица изменений, шифр и номер листа. Так оформлен
  // и второй лист спецификации в присланном пользователем проекте.
  function stampContHtml(p, no) {
    const m = docMeta(p);
    const c = (t) => `<td class="s-c">${t || ""}</td>`;
    return `<table class="stamp stamp-c"><colgroup>
        <col style="width:8mm"><col style="width:11mm"><col style="width:12mm"><col style="width:14mm"><col style="width:16mm"><col style="width:18mm">
        <col style="width:94mm"><col style="width:12mm">
      </colgroup>
      <tr>${c()}${c()}${c()}${c()}${c()}${c()}
        <td class="s-c s-code" rowspan="2">${esc(m.code || p.name || "")}</td>
        <td class="s-c s-h">${T.sheetNo}</td></tr>
      <tr>${c("Изм.")}${c("Колич.")}${c("Лист")}${c("№ док")}${c("Подп.")}${c("Дата")}
        <td class="s-c">${no}</td></tr>
    </table>`;
  }
  // Графы подшивки (ГОСТ 2.104, графы 19-23) — вертикальные надписи в левом поле:
  // «Инв. № подл.», «Подп. и дата», «Взам. инв. №». В присланном проекте они есть
  // на каждом листе — без них лист не читается как проектный документ.
  const bindingHtml = () => `<div class="bind">
      <div class="bind-b"><span>Взам. инв. №</span></div>
      <div class="bind-b bind-t"><span>Подп. и дата</span></div>
      <div class="bind-b"><span>Инв. № подл.</span></div>
    </div>`;
  // один лист альбома: поля по ГОСТ 2.301 (20мм слева под подшивку, 5мм остальные),
  // рамка, графы подшивки, штамп внизу справа и подпись формата под рамкой
  function sheetWrap(p, page, no, of) {
    const stamp = page.contd ? stampContHtml(p, no) : stampHtml(p, page.title, no, of, page.scale || null);
    return `<div class="sheet">${bindingHtml()}<div class="fr">
      ${page.noHead ? "" : `<h2>${esc(page.title)}</h2>`}
      <div class="body${page.contd || page.noHead ? " body-c" : ""}">${page.body}</div>
      ${page.side || ""}
      ${stamp}
    </div><div class="fmt">Формат ${pdfFormat}</div></div>`;
  }
  // титульный лист: объект/заказчик/площадь + ВЕДОМОСТЬ листов альбома (состав) —
  // так документ читается как альбом, а не как набор картинок
  function buildTitlePage(p, pages, of) {
    const m = docMeta(p);
    const roomsList = (p.rooms || []).filter((r) => (r.points || []).length >= 3);
    const totalArea = roomsList.reduce((s2, r) => s2 + G().roomNetArea(p, r), 0);
    const ved = pages.map((pg, i) => `<tr><td class="st-c">${i + 2}</td><td>${esc(pg.title)}</td><td class="st-c">${pg.scale ? "1:" + pg.scale : "—"}</td></tr>`).join("");
    return `<div class="sheet">${bindingHtml()}<div class="fr">
      <div class="tp">
        <div class="tp-top">
          <div class="tp-stage">${T.stage} ${esc(m.stage)}</div>
          <h1>${esc(m.obj)}</h1>
          <div class="tp-sub">${T.docTitle}</div>
        </div>
        <div class="tp-cols">
          <table class="tb tp-info">
            <tr><th>${T.obj}</th><td>${esc(m.obj)}</td></tr>
            <tr><th>${T.addr}</th><td>${esc(m.addr)}</td></tr>
            <tr><th>${T.client}</th><td>${esc(m.client)}</td></tr>
            ${roomsList.length ? `<tr><th>${T.area}</th><td>${G().fmtArea(totalArea)}</td></tr><tr><th>${T.roomsN}</th><td>${roomsList.length}</td></tr>` : ""}
            <tr><th>${T.made}</th><td>${esc(m.master)}</td></tr>
            <tr><th>${T.date}</th><td>${esc(m.date)}</td></tr>
          </table>
          <table class="tb tp-ved">
            <thead><tr><th colspan="3">${T.album}</th></tr><tr><th>Лист</th><th>Наименование</th><th>М</th></tr></thead>
            <tbody><tr><td class="st-c">1</td><td>Титульный лист. ${T.album}</td><td class="st-c">—</td></tr>${ved}</tbody>
          </table>
        </div>
      </div>
      ${stampHtml(p, "Титульный лист. " + T.album, 1, of, null)}
    </div><div class="fmt">Формат ${pdfFormat}</div></div>`;
  }

  // развёртка одной стены для печати (длина × высота, точки с рулетками от угла и от пола)
  function unfoldSvg(p, room, w, els) {
    const H = room.height || p.settings.ceilingHeight, L = w.len, pad = 45;
    const TY = EP.Plan.Elements.TYPES;
    // «1:1» (settings.realScale): посты в РЕАЛЬНЫХ габаритах рамок и с настоящим «лицом»
    // (гнёзда розетки, клавиши, RJ45, коаксиал) — ТА ЖЕ геометрия и ТЕ ЖЕ цвета, что в
    // живой развёртке: примитивы из EP.Plan.Render.deviceFace + FACE_STYLE (один источник,
    // иначе бумага и экран показывали бы прибор по-разному).
    const RD = EP.Plan.Render, real = !!(p.settings && p.settings.realScale) && !!(RD && RD.deviceFace);
    const fW = (n) => (RD && RD.frameWcm ? RD.frameWcm(n) : 8.4);
    const fH = () => (RD && RD.frameHcm ? RD.frameHcm() : 8.4);
    const hasFace = (type, keys) => (RD.deviceFace(type, keys) || []).some((o) => o.cls !== "post");
    function faceStr(type, keys, cx, cy) {
      const prim = RD.deviceFace(type, keys) || [], ST = RD.FACE_STYLE || {};
      let out = "";
      prim.forEach((o) => {
        const st = ST[o.cls] || {};
        const at = `fill="${st.fill || "none"}" stroke="${st.stroke || "none"}" stroke-width="${(st.sw || 0) / 10}"`;
        if (o.t === "rect") out += `<rect x="${cx + o.x / 10}" y="${cy + o.y / 10}" width="${o.w / 10}" height="${o.h / 10}" rx="${(o.rx || 0) / 10}" ${at}/>`;
        else if (o.t === "circle") out += `<circle cx="${cx + o.cx / 10}" cy="${cy + o.cy / 10}" r="${o.r / 10}" ${at}/>`;
        else if (o.t === "line") out += `<line x1="${cx + o.x1 / 10}" y1="${cy + o.y1 / 10}" x2="${cx + o.x2 / 10}" y2="${cy + o.y2 / 10}" fill="none" stroke="${st.stroke || "none"}" stroke-width="${(st.sw || 0) / 10}"/>`;
        else if (o.t === "path") out += `<path d="${o.d.replace(/-?\d+(?:\.\d+)?/g, (m2) => String(Number(m2) / 10))}" transform="translate(${cx} ${cy})" ${at}/>`;
        else if (o.t === "text") out += `<text x="${cx + (o.x || 0) / 10}" y="${cy + (o.y || 0) / 10}" font-size="${(o.s || 12) / 10}" text-anchor="middle" dominant-baseline="central" fill="#0f172a">${esc(o.txt)}</text>`;
      });
      return out;
    }
    // viewBox (физические пропорции стены) от масштаба НЕ зависит — растут только
    // символы/подписи/толщины линий (kk), просьба пользователя: «масштаб самих постов»
    const kk = (H + pad) / 200 * pdfScale;
    // ЕДИНАЯ геометрия блока постов — ею ОБЯЗАНЫ пользоваться и символ, и ШТРОБА, и
    // AABB для подписей. Раньше штробы считали габарит блока по ЛЕГАСИ-раскладке
    // (18*kk на пост), а символ в режиме «1:1» — по РЕАЛЬНЫМ рамкам (мм из FRAME_MM):
    // на 5-постовом блоке легаси-габарит выходил ~150см против настоящих 36.8см, и
    // штробы уезжали по сторонам, «не доходя до точек» (репорт пользователя с PDF).
    // vert (el.blockVert) — посты столбиком по высоте, как в живой развёртке
    // (раньше печатная его игнорировала и рисовала вертикальный блок в ряд).
    const blockGeom = (el) => {
      const items = (el.params && el.params.items) || ["socket"];
      const vert = !!el.blockVert;
      const along = real ? fW(items.length) : items.length * 18 * kk + 6 * kk;
      const across = real ? fH() : 24 * kk;
      const step = real ? along / items.length : 18 * kk;
      const inset = real ? 0 : 3 * kk;
      const bw = vert ? across : along, bh = vert ? along : across;
      const x = el.offset, y = H - el.height;
      return {
        items, vert, bw, bh, step, inset,
        cell: (i) => (vert
          ? { cx: x, cy: y - bh / 2 + inset + step * i + step / 2 }
          : { cx: x - bw / 2 + inset + step * i + step / 2, cy: y })
      };
    };
    let s = `<svg viewBox="${-pad} ${-pad} ${L + pad * 1.5} ${H + pad * 1.9}" preserveAspectRatio="xMidYMid meet" class="unf">`;
    s += `<rect x="0" y="0" width="${L}" height="${H}" class="unfwall"/>`;
    s += `<line x1="0" y1="${H}" x2="${L}" y2="${H}" class="unffloor"/>`;
    // проёмы (двери/окна) — раньше в PDF-развёртке не рисовались вообще. Через
    // G.wallOpeningSpans (не сырой фильтр по openings[].wallId) — общая стена двух
    // комнат хранится как ДВА wall-объекта, проём мог быть физически поставлен с
    // СОСЕДНЕЙ стороны шва (owner — стена другой комнаты), но должен быть виден и
    // на этой развёртке (репорт пользователя: «не вижу проём» в PDF).
    G().wallOpeningSpans(p, w).forEach((sp) => {
      const op = (p.openings || []).find((o) => o.id === sp.srcId);
      if (!op) return;
      const oh = op.height || (op.type === "window" ? 140 : 200), sill = op.sill || 0;
      const yTop = H - (sill + oh), hgt = Math.min(oh, H - sill);
      const isWin = op.type === "window" || op.kind === "window" || op.kind === "balcony";
      const OT = EP.Plan.Elements.OPEN_TYPES || {};
      const meta = OT[op.kind || (isWin ? "window" : "door")] || {};
      s += `<rect x="${sp.offset}" y="${yTop}" width="${sp.width}" height="${hgt}" class="unfopen${isWin ? " is-win" : ""}"/>`;
      s += `<text x="${sp.offset + sp.width / 2}" y="${yTop + 12 * kk}" font-size="${10 * kk}" text-anchor="middle" class="unfopent">${esc(EP.Plan.Elements.openingNum ? EP.Plan.Elements.openingNum(p, op) : (meta.glyph || ""))}</text>`;
    });
    const sorted = els.slice().sort((a, b) => a.offset - b.offset);
    // ШТРОБЫ: откуда физически идёт кабель (потолок/пол) до поста — та же
    // логика, что и в живой развёртке (кнопка «〰 Штробы», S.showChases в
    // plan-unfold.js), но в PDF рисуется ВСЕГДА (печатный лист статичен,
    // незачем прятать монтажную информацию, ради которой лист и печатают —
    // репорт пользователя: «нет направления штроб»). Цвет по виду (силовая/
    // свет/слаботочка/тёплый пол), линия идёт от потолка ИЛИ от пола (по
    // routeType) до высоты поста — это и есть направление; подпись сечения
    // рядом с концом линии.
    {
      // Поверхность (пол/потолок) больше НЕ одна на проект: у каждой группы слоёв своя
      // (settings.surfaces). Направление штробы считаем НА КАЖДУЮ точку/пост — по её
      // построенной трассе, иначе по настройкам её группы (G.routeSurface). У блока постов
      // виды разные (силовая/свет/слаботочка), поэтому там — по виду входа.
      const RTm = EP.Plan.Routes;
      const surfFor = (layer, el2) => {
        if (el2 && el2.type !== "block" && RTm && RTm.surfaceOfEl) return RTm.surfaceOfEl(p, el2);
        return G().routeSurface ? G().routeSurface(p, layer, el2) : (p.settings.routeType === "floor" ? "floor" : "ceiling");
      };
      const isFloor = (layer, el2) => surfFor(layer, el2) === "floor";
      const y0Of = (layer, el2) => (isFloor(layer, el2) ? H : 0);
      const KIND_LAYER = { power: "power", light: "light", lv: "lv", warm: "warm" };
      const CHASE_COL = { power: "#f59e0b", light: "#facc15", lv: "#38bdf8", warm: "#fb7185" };
      const SIZE_LBL = {
        power: `${Math.round(p.settings.chaseW || 25)}×${Math.round(p.settings.chaseH || 30)}`,
        light: `${Math.round(p.settings.chaseW || 25)}×${Math.round(p.settings.chaseH || 30)}`,
        lv: `${Math.round(p.settings.chaseW || 25)}×${Math.round(p.settings.chaseH || 30)}`,
        warm: `${Math.round(p.settings.tpChaseW || 50)}×${Math.round(p.settings.tpChaseH || 50)}`
      };
      const chaseKindOf = (layer) => (layer === "warm" ? "warm" : (layer === "lv" || layer === "tv" || layer === "cctv" ? "lv" : (layer === "light" ? "light" : "power")));
      // подписи сечения у соседних штроб (блок постов) вставали друг на друга —
      // «25×3025×25×30» на скриншоте печатного листа. Одинаковую подпись рядом
      // (ближе 22см на той же высоте) рисуем ОДИН раз: сечение у них всё равно одно.
      const lbls = [];
      const drawChase = (cx, cy0, cy1, kind) => {
        if (Math.abs(cy1 - cy0) < 1) return;
        const col = CHASE_COL[kind] || CHASE_COL.power;
        s += `<line x1="${cx}" y1="${cy0}" x2="${cx}" y2="${cy1}" stroke="${col}" stroke-width="${kk * 5}" opacity="0.28"/>`;
        s += `<line x1="${cx}" y1="${cy0}" x2="${cx}" y2="${cy1}" stroke="${col}" stroke-width="${kk * 1.4}" stroke-dasharray="${3 * kk} ${2 * kk}"/>`;
        const txt = SIZE_LBL[kind] || "";
        if (!txt) return;
        let labelY = cy0 + (cy1 > cy0 ? 12 * kk : -6 * kk);
        // порог по X — от РЕАЛЬНОЙ ширины подписи (шрифт 8*kk), а не магических 22см:
        // на «1:1» подписи крупные и рядом стоящие штробы блока сливались в «25×3025×30»
        const lw2 = Math.max(22, txt.length * 4.6 * kk);
        const near = (ly, t) => lbls.some((l) => (t === undefined || l.txt === t) && Math.abs(l.x - cx) < lw2 && Math.abs(l.y - ly) < 9 * kk);
        if (near(labelY, txt)) return;              // такое же сечение рядом уже подписано
        for (let i = 0; i < 3 && near(labelY); i++) labelY += 10 * kk; // разное — разносим по высоте
        lbls.push({ txt, x: cx, y: labelY });
        s += `<text x="${cx + 3 * kk}" y="${labelY}" font-size="${8 * kk}" fill="${col}">${txt}</text>`;
      };
      sorted.forEach((el2) => {
        const xx = el2.offset, yy = H - el2.height;
        if (el2.type === "block") {
          const bg = blockGeom(el2);
          (G().blockChaseEntries ? G().blockChaseEntries(el2) : []).forEach((en) => {
            const c = bg.cell(en.idx);
            const enLayer = KIND_LAYER[en.kind] || "power";
            const y0 = (en.kind === "light" && isFloor(enLayer, el2)) ? 0 : y0Of(enLayer, el2);
            drawChase(c.cx, y0, c.cy, en.kind);
          });
        } else if (el2.layer === "warm") {
          drawChase(xx, y0Of("warm", el2), yy, "power");
          if (el2.height > 1) drawChase(xx, yy, H, "warm");
        } else {
          const kind = chaseKindOf(el2.layer);
          const y0 = (el2.type === "switch" && isFloor(el2.layer, el2)) ? 0 : y0Of(el2.layer, el2);
          drawChase(xx, y0, yy, kind);
        }
      });
    }
    // AABB символов — подпись высоты кладём РЯДОМ с постом, сдвигая, если она
    // ложится на другой пост (просьба пользователя: высота у поста, не пересекать)
    const symHalf = (el) => {
      if (el.type === "block") { const bg = blockGeom(el); return { hw: bg.bw / 2, hh: bg.bh / 2 }; }
      return real ? { hw: fW(1) / 2, hh: fH() / 2 } : { hw: 13 * kk, hh: 13 * kk };
    };
    const boxes = sorted.map((e) => { const h = symHalf(e); return { x: e.offset, y: H - e.height, hw: h.hw, hh: h.hh }; });
    // QF-имя и подпись расстояния от угла — тоже места, которые подпись высоты не
    // должна перекрывать (репорт пользователя со скриншотом: цифры сливаются)
    const qfBoxes = sorted.map((e) => {
      const cc = (p.circuits || []).find((c) => c.id === e.circuitId); if (!cc) return null;
      return { x: e.offset, y: H - e.height - 18 * kk, hw: Math.max(14, cc.name.length * 4.2) * kk, hh: 7 * kk };
    }).filter(Boolean);
    // размер поста — от БЛИЖАЙШЕГО ВНУТРЕННЕГО угла стены (та же логика, что и в живой
    // развёртке plan-unfold.js — оба вида ОБЯЗАНЫ совпадать; просьба пользователя «от
    // ближайшего угла брались размеры, и строилась туда линейка»). Раньше в PDF размер
    // шёл ВСЕГДА от x=0, т.е. даже не от внутренней грани, а от оси стены.
    const th = G().wallThOf ? G().wallThOf(p, w) : 0;
    const inA = Math.min(th / 2, L / 2), inB = Math.max(L - th / 2, L / 2);
    const cornerOf = (x) => (x - inA <= inB - x ? inA : inB);
    const offBoxes = sorted.map((e) => {
      const x = e.offset, y = H - e.height, c = cornerOf(x);
      if (Math.abs(x - c) <= 2) return null;
      return { x: (c + x) / 2, y: y - 3 * kk, hw: 14 * kk, hh: 8 * kk };
    }).filter(Boolean);
    const obstacles = boxes.concat(qfBoxes, offBoxes);
    const placeHLabel = (idx) => {
      const b = boxes[idx], lw = 14 * kk, lh = 8 * kk;
      const hits = (lx, ly) => obstacles.some((o) => o !== b && Math.abs(lx - o.x) < lw + o.hw && Math.abs(ly - o.y) < lh + o.hh);
      const cand = [
        [b.x + b.hw + lw + 2 * kk, b.y], [b.x - b.hw - lw - 2 * kk, b.y],
        [b.x + b.hw + lw + 2 * kk, b.y - b.hh - lh], [b.x - b.hw - lw - 2 * kk, b.y - b.hh - lh],
        [b.x, b.y - b.hh - lh - 2 * kk], [b.x, b.y + b.hh + lh + 2 * kk]
      ];
      for (const [lx, ly] of cand) if (!hits(lx, ly)) return { x: lx, y: ly };
      return { x: b.x + b.hw + lw + 2 * kk, y: b.y };
    };
    // ДВА прохода: сначала все символы постов, потом ВСЕ размеры/подписи высоты —
    // иначе (при одном проходе) собственный кружок/блок поста рисуется ПОСЛЕ своих
    // размерных линий в том же SVG-документе и закрывает их конец собой («размеры
    // уходят за точку», репорт пользователя со скриншотом печатного листа).
    sorted.forEach((el) => {
      const x = el.offset, y = H - el.height;
      const cc = (p.circuits || []).find((c) => c.id === el.circuitId);
      const col = cc ? cc.color : "#1d4ed8";
      if (el.type === "block") {
        const bg = blockGeom(el);
        s += `<rect x="${x - bg.bw / 2}" y="${y - bg.bh / 2}" width="${bg.bw}" height="${bg.bh}" rx="${real ? 0.4 : 5 * kk}" fill="${col}" class="unfshape"/>`;
        bg.items.forEach((it, i) => {
          const c = bg.cell(i);
          if (real) {
            s += faceStr(it, el.keys, c.cx, c.cy);
            if (!hasFace(it, el.keys)) s += `<text x="${c.cx}" y="${c.cy}" font-size="2.6" text-anchor="middle" dominant-baseline="central" fill="#0f172a">${esc((TY[it] || {}).glyph || "?")}</text>`;
          } else {
            s += `<text x="${c.cx}" y="${c.cy}" font-size="${9 * kk}" text-anchor="middle" dominant-baseline="central" class="unfglyph">${esc((TY[it] || {}).glyph || "?")}</text>`;
          }
        });
      } else if (real) {
        const fw = fW(1), fh = fH();
        s += `<rect x="${x - fw / 2}" y="${y - fh / 2}" width="${fw}" height="${fh}" rx="0.4" fill="${col}" class="unfshape"/>`;
        s += faceStr(el.type, el.keys, x, y);
        if (!hasFace(el.type, el.keys)) s += `<text x="${x}" y="${y}" font-size="2.6" text-anchor="middle" dominant-baseline="central" fill="#0f172a">${esc((TY[el.type] || {}).glyph || "?")}</text>`;
      } else {
        s += `<circle cx="${x}" cy="${y}" r="${13 * kk}" fill="${col}" class="unfshape"/>`;
        s += `<text x="${x}" y="${y}" font-size="${10 * kk}" text-anchor="middle" dominant-baseline="central" class="unfglyph">${esc((TY[el.type] || {}).glyph || "?")}</text>`;
      }
      if (cc) s += `<text x="${x}" y="${y - 18 * kk}" font-size="${8.5 * kk}" text-anchor="middle" fill="${col}" class="unfqf">${esc(cc.name)}</text>`;
    });
    // проход 2: размеры/высоты — ПОСЛЕ всех символов, значит визуально ПОВЕРХ них
    sorted.forEach((el, idx) => {
      const x = el.offset, y = H - el.height;
      // el.uDim — ручные сдвиги размеров, поставленные тягой в живой развёртке
      // (plan-unfold.js). Обе развёртки ОБЯЗАНЫ совпадать, поэтому читаем их и здесь:
      // v — вертикаль вбок, h — горизонталь вверх/вниз, lx/ly — подпись высоты.
      const ud = el.uDim || {};
      const uv = Number(ud.v) || 0, uh = Number(ud.h) || 0;
      s += `<line x1="${x + uv}" y1="${H}" x2="${x + uv}" y2="${y}" class="unfdim"/>`;
      const cx0 = cornerOf(x);
      if (Math.abs(x - cx0) > 2) {
        const hy = y + uh;
        s += `<line x1="${cx0}" y1="${hy}" x2="${x}" y2="${hy}" class="unfdimh"/>`;
        s += `<line x1="${cx0}" y1="${hy - 3 * kk}" x2="${cx0}" y2="${hy + 3 * kk}" class="unfdimh"/>`;
        // цифра «от угла» стоит на середине выноски — а там часто оказывается ДРУГОЙ пост
        // (соседняя точка на близкой высоте) или его имя QF: на скриншотах пользователя
        // цифры сливались в «1236»/«1387». Приподнимаем её, пока не выйдет из чужих габаритов
        // (при ручном сдвиге линии — не трогаем, стоит ровно где поставили).
        const lx = (cx0 + x) / 2;
        let ly = hy - 3 * kk;
        if (!uh) {
          const bad = (yy2) => boxes.concat(qfBoxes).some((o) => Math.abs(lx - o.x) < 12 * kk + o.hw && Math.abs(yy2 - o.y) < 6 * kk + o.hh);
          for (let i = 0; i < 2 && bad(ly); i++) ly -= 7 * kk; // не больше двух шагов — иначе цифра уедет от своей выноски
        }
        s += `<text x="${lx}" y="${ly}" font-size="${9.5 * kk}" text-anchor="middle" class="unfdimt">${Math.round(Math.abs(x - cx0))}</text>`;
      }
      const hl = (ud.lx != null || ud.ly != null)
        ? { x: x + (Number(ud.lx) || 0), y: y + (Number(ud.ly) || 0) }
        : placeHLabel(idx);
      s += `<text x="${hl.x}" y="${hl.y}" font-size="${11 * kk}" text-anchor="middle" dominant-baseline="middle" class="unfdimt">${Math.round(el.height)}</text>`;
    });
    return s + "</svg>";
  }
  // РОВНО 2 развёртки на лист (просьба пользователя — «на объекте по бумагам
  // смотреть» удобнее парой, не разбросано по многу штук на странице).
  // Раньше все карточки лежали в ОДНОМ .unfgrid (CSS Grid) и печатный движок
  // сам решал, сколько строк влезет на лист — CSS Grid в печати у Chromium
  // ненадёжно разбивается по страницам (может ужать/обрезать лишние строки
  // вместо переноса на новый лист). Явное разбиение на страницы по 2 карточки
  // — детерминировано, не зависит от печатного движка браузера.
  // Ключ-схема к развёртке (просьба пользователя со скриншотом дизайнерского чертежа «ВИД Б»
  // с планом-ключом): мини-план КОМНАТЫ, где ЭТА стена выделена и нарисована стрелка
  // направления взгляда (изнутри помещения на стену) — сразу видно, какой участок напечатан
  // на листе, не сверяясь с общим планом.
  function wallKeySvg(room, w) {
    const pts = room.points || [];
    if (pts.length < 3) return "";
    const xs = pts.map((q) => q.x), ys = pts.map((q) => q.y);
    const x0 = Math.min.apply(null, xs), x1 = Math.max.apply(null, xs);
    const y0 = Math.min.apply(null, ys), y1 = Math.max.apply(null, ys);
    const pad = Math.max(20, (x1 - x0 + y1 - y0) * 0.06);
    const c = G().centroid(pts);
    // стрелка: от центра комнаты к середине стены, чуть не доводя до самой стены
    const dx = w.mx - c.x, dy = w.my - c.y, L = Math.hypot(dx, dy) || 1;
    const ax = c.x + dx * 0.28, ay = c.y + dy * 0.28;
    const bx = c.x + dx * 0.82, by = c.y + dy * 0.82;
    const ux = dx / L, uy = dy / L, hd = Math.max(10, L * 0.16);
    return `<svg class="unfkey" viewBox="${x0 - pad} ${y0 - pad} ${x1 - x0 + pad * 2} ${y1 - y0 + pad * 2}" preserveAspectRatio="xMidYMid meet">
      <polygon points="${pts.map((q) => q.x + "," + q.y).join(" ")}" class="ukroom"></polygon>
      <line x1="${w.a.x}" y1="${w.a.y}" x2="${w.b.x}" y2="${w.b.y}" class="ukwall"></line>
      <line x1="${ax}" y1="${ay}" x2="${bx}" y2="${by}" class="ukarr"></line>
      <polygon class="ukarrh" points="${bx},${by} ${bx - ux * hd + uy * hd * 0.55},${by - uy * hd - ux * hd * 0.55} ${bx - ux * hd - uy * hd * 0.55},${by - uy * hd + ux * hd * 0.55}"></polygon>
    </svg>`;
  }
  const UNF_PER_PAGE = 2;
  function buildUnfolds(p) {
    const cards = [];
    (p.rooms || []).forEach((room) => {
      if ((room.points || []).length < 2) return;
      const walls = G().walls(room);
      walls.forEach((w) => {
        const els = (p.elements || []).filter((e) => e.wallId === w.id);
        if (!els.length) return;
        const H = room.height || p.settings.ceilingHeight;
        const opN = (G().wallOpeningSpans ? G().wallOpeningSpans(p, w) : []).length;
        // информационная панель карточки: какое помещение / какая стена напечатана + ключ
        const info = `<div class="unfinfo">
          <table class="unfinfot"><tr><th>Помещение</th><td><b>${esc(room.name)}</b></td></tr>
            <tr><th>Стена</th><td>№ ${w.n} из ${walls.length}</td></tr>
            <tr><th>Габарит</th><td>${G().fmtLen(w.len)} × ${G().fmtLen(H)}</td></tr>
            <tr><th>Материал</th><td>${esc(G().wallMatOf(p, w))}</td></tr>
            <tr><th>Точек</th><td>${els.length}${opN ? ` · проёмов: ${opN}` : ""}</td></tr></table>
          <div class="unfkeyw">${wallKeySvg(room, w)}<div class="unfkeyc">вид на стену №${w.n}<br>со стороны помещения</div></div>
        </div>`;
        cards.push(`<div class="unfcard"><h4>${esc(room.name)} · стена ${w.n} · ${G().fmtLen(w.len)} × ${G().fmtLen(H)}</h4>${info}${unfoldSvg(p, room, w, els)}</div>`);
      });
    });
    if (!cards.length) return [];
    const totalPages = Math.ceil(cards.length / UNF_PER_PAGE);
    const pages = [];
    for (let i = 0; i < cards.length; i += UNF_PER_PAGE) {
      const n = i / UNF_PER_PAGE + 1;
      const title = totalPages > 1 ? `${T.unfolds} (${n}/${totalPages})` : T.unfolds;
      pages.push({ title, body: `<div class="unfgrid">${cards.slice(i, i + UNF_PER_PAGE).join("")}</div>` });
    }
    return pages;
  }

  // однолинейная схема в лист (тем же движком, что и в приложении)
  function buildScheme(p) {
    if (!window.ShieldSchemeSVG || !EP.Plan.Scheme || !(p.circuits || []).length) return [];
    try {
      const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
      window.ShieldSchemeSVG.render(svg, EP.Plan.Scheme.buildTree(p));
      // render() ставит ТОЛЬКО пиксельные width/height, БЕЗ viewBox (рассчитан на
      // живой просмотр с горизонтальным скроллом при много QF в ряд — трогать
      // общий модуль shield-scheme-svg-v28.js нельзя, им пользуются и живые экраны).
      // Раньше здесь просто перезаписывался width="100%" БЕЗ viewBox — без него
      // width:100% не масштабирует содержимое (внутренние координаты остаются в
      // исходных px), схему просто обрезало по правому краю листа (репорт
      // пользователя — часть линий QF не влезала на печатный лист). viewBox из тех
      // же width/height, что уже проставил render(), — сохраняет пропорции, и
      // .schemebox svg{max-width:100%;height:auto} ниже честно вписывает всю схему.
      const w0 = svg.getAttribute("width"), h0 = svg.getAttribute("height");
      if (w0 && h0) svg.setAttribute("viewBox", `0 0 ${w0} ${h0}`);
      svg.setAttribute("width", "100%");
      return [{ title: T.scheme, body: `<div class="schemebox">${svg.outerHTML}</div>` }];
    } catch (e) { return []; }
  }
  // таблица линий (QF) + щит
  function buildCircuits(p) {
    const circuits = p.circuits || [];
    if (!circuits.length) return [];
    if (EP.Plan.Scheme && EP.Plan.Scheme.recompute) { try { EP.Plan.Scheme.recompute(p); } catch (e) {} }
    const rl = EP.Plan.Routes ? EP.Plan.Routes.lengths(p) : { byCircuit: {} };
    const cableOf = (c) => c.cable || (EP.Plan.Scheme && EP.Plan.Scheme.autoCable ? EP.Plan.Scheme.autoCable(p, c) : null) || "—";
    const rows = circuits.map((c) => `<tr><td><i class="cd" style="background:${esc(c.color)}"></i>${esc(c.name)}</td><td>${(c.breaker || 16)}A${c.rcd ? " + УЗО" : ""}</td><td>${esc(cableOf(c))}</td><td>${c.poles === 3 ? "3P" : "1P"}</td><td>${rl.byCircuit && rl.byCircuit[c.id] ? G().fmtLen(rl.byCircuit[c.id]) : "—"}</td></tr>`).join("");
    const box = p.settings.panelBox;
    const panelInfo = box && box.modules ? `Щит: <b>${esc(box.brand)}</b> · ${box.modules} мод · ${box.wmm}×${box.hmm}×${box.dmm} мм` : "";
    return [{ title: T.circuits, body: `${panelInfo ? `<p class="note">${panelInfo}</p>` : ""}
      <table class="tb"><thead><tr><th>Линия</th><th>Аппарат защиты</th><th>Кабель</th><th>Полюса</th><th>Длина трасс</th></tr></thead><tbody>${rows}</tbody></table>` }];
  }

  function counts(p) {
    const TY = EP.Plan.Elements.TYPES, out = {};
    (p.elements || []).forEach((e) => {
      if (e.type === "block") ((e.params && e.params.items) || []).forEach((it) => { out[it] = (out[it] || 0) + 1; });
      else out[e.type] = (out[e.type] || 0) + 1;
    });
    return Object.keys(out).map((k) => ({ k, name: (TY[k] || { name: k }).name, glyph: (TY[k] || {}).glyph || "?", qty: out[k] }));
  }

  /* ---------- СПЕЦИФИКАЦИЯ ОБОРУДОВАНИЯ, ИЗДЕЛИЙ И МАТЕРИАЛОВ (ГОСТ 21.110) ----------
     Форма 1: 9 граф, разделы курсивом по центру. Данные берём из УЖЕ существующих
     расчётов, а не считаем заново: аппараты — из p.circuits/settings (как в однолинейке),
     кабель и монтажные изделия — из EP.Plan.Calc.estimateItems (тот же список, что уходит
     в смету), приборы — из p.elements. Так спецификация не может разойтись со сметой. */
  // расходники ИНСТРУМЕНТА (буры, диски, мешки, гвозди) в спецификацию объекта не идут —
  // это не материалы, остающиеся на объекте; в присланном проекте их тоже нет
  const SPEC_SKIP = /^(гвозд|газовый баллон|бур |пика|карандаш|коронка|диск |мешки|термоусадк)/i;
  const SPEC_MOUNT = /гофра|клипс|стяжк|площадк|лента монтажная|подрозетник|коробк|гмл|ваго|сиз|наконечник|гильз|труба/i;
  const CABLE_SEC = (mark) => {
    const m = /(\d+)\s*[×xх]\s*([\d.,]+)/i.exec(String(mark || ""));
    return m ? { cores: m[1], sec: m[2].replace(".", ",") } : null;
  };
  function specRows(p) {
    const S = p.settings || {}, out = [];
    const push = (sec, name, mark, unit, qty) => out.push({ sec, name, mark, unit, qty });
    // --- 1. Щитовые устройства (по модели щита и линиям, как в однолинейке) ---
    const panels = (p.panels || []);
    const modules = EP.Plan.Scheme && EP.Plan.Scheme.neededModules ? EP.Plan.Scheme.neededModules(p) : 0;
    if (panels.length) {
      const box = S.panelBox || {};
      const size = box.wmm && box.hmm ? ` ${box.wmm}x${box.hmm}${box.dmm ? "x" + box.dmm : ""} мм` : "";
      push(T.secShields, `Шкаф внутреннего монтажа${modules ? " на " + modules + " модулей" : ""}${size}`,
        esc(S.panelBrand || ""), "шт.", panels.length);
    }
    if (S.mainBreaker) push(T.secShields, `Выключатель нагрузки ${S.mainBreaker}А`, "", "шт.", 1);
    if (S.meter) push(T.secShields, "Счётчик электроэнергии", "", "шт.", 1);
    if (S.mainRcd) push(T.secShields, `Устройство защитного отключения ${S.mainBreaker || 63}А 30mA`, "", "шт.", 1);
    const byKey = {};
    (p.circuits || []).forEach((c2) => {
      const amp = c2.breaker || 16, poles = c2.poles === 3 ? "3P" : "1P";
      const key = (c2.rcd ? "d" : "a") + poles + amp;
      byKey[key] = byKey[key] || {
        n: 0, name: c2.rcd ? `Автоматический выключатель дифференциального тока ${amp}А` : `Автоматический выключатель ${poles} ${amp}А`
      };
      byKey[key].n++;
    });
    Object.keys(byKey).sort().forEach((k) => push(T.secShields, byKey[k].name, "", "шт.", byKey[k].n));
    // --- 2/4. Кабель и монтажные изделия — из общего списка позиций сметы ---
    const items = (EP.Plan.Calc && EP.Plan.Calc.estimateItems ? EP.Plan.Calc.estimateItems(p) : null) || [];
    items.filter((it) => it.type === "material").forEach((it) => {
      const nm = String(it.name || "");
      if (SPEC_SKIP.test(nm)) return;
      const qty = Math.ceil(Number(it.qty) || 0);
      if (!qty) return;
      if (/^кабель/i.test(nm)) {
        const mark = nm.replace(/^кабель\s*/i, "").split("·")[0].trim();
        const cs = CABLE_SEC(mark);
        push(T.secCables,
          `Кабель силовой с медными жилами с ПВХ изоляцией пониженной горючести, низким дымо- и газовыделением${cs ? ` сеч.${cs.cores}x${cs.sec} мм²` : ""}`,
          mark, "м.", qty);
      } else if (SPEC_MOUNT.test(nm)) {
        push(T.secMount, nm, "", it.unit === "м" ? "м." : it.unit === "шт" ? "шт." : (it.unit || "шт."), qty);
      }
    });
    // --- 3. Электроустановочные изделия (механизмы — «по дизайн-проекту») ---
    const dev = {};
    const addDev = (name) => { dev[name] = (dev[name] || 0) + 1; };
    const TY = EP.Plan.Elements ? EP.Plan.Elements.TYPES : {};
    const nameOf = (type, el) => {
      if (type === "socket") return "Розетка скрытой установки";
      if (type === "switch") {
        const keys = (el && el.keys) || 1;
        const kind = el && el.swKind === "pass" ? " проходной" : el && el.swKind === "cross" ? " перекрёстный" : "";
        return `Выключатель ${keys}-кл.${kind} скрытой установки`;
      }
      if (type === "internet") return "Розетка компьютерная RJ45 скрытой установки";
      if (type === "tv") return "Розетка телевизионная скрытой установки";
      if (type === "warmfloor") return "Терморегулятор тёплого пола";
      if (type === "light") return "Светильник потолочный";
      if (type === "bra") return "Светильник настенный (бра)";
      if (type === "track") return "Трековый светильник";
      if (type === "ac") return "Вывод для кондиционера";
      // выводы/распайки/стояки — не изделия, в спецификацию механизмов не идут
      if (type === "junction" || type === "output" || type === "output24" || type === "output3" || type === "riser") return null;
      return (TY[type] || {}).name || null;
    };
    (p.elements || []).forEach((e) => {
      if (e.type === "block") ((e.params && e.params.items) || []).forEach((t2) => { const n = nameOf(t2, null); if (n) addDev(n); });
      else { const n = nameOf(e.type, e); if (n) addDev(n); }
    });
    Object.keys(dev).sort().forEach((n) => push(T.secDevices, n, T.byDesign, "шт.", dev[n]));
    return out;
  }
  // листы спецификации: строки бьются по страницам, разделы печатаются курсивом
  const SPEC_ROWS_PER_PAGE = 22;
  function buildSpecPages(p) {
    const rows = specRows(p);
    if (!rows.length) return [];
    // ГРУППИРУЕМ по разделам в фиксированном порядке ГОСТ-спецификации: позиции приходят
    // из расчёта вперемешку (подрозетник, кабель, ГМЛ…), и без группировки один и тот же
    // раздел печатался бы дважды — поймано на первом же прогоне печати
    const ORDER = [T.secShields, T.secCables, T.secDevices, T.secMount];
    const flat = [];
    ORDER.forEach((sec) => {
      const part = rows.filter((r) => r.sec === sec);
      if (!part.length) return;
      if (flat.length) flat.push({ blank: true });
      flat.push({ head: sec });
      part.forEach((r) => flat.push(r));
    });
    const head = `<tr class="sp-h">${T.specCols.map((c2) => `<th>${c2}</th>`).join("")}</tr>
      <tr class="sp-n">${T.specCols.map((c2, i) => `<td>${i + 1}</td>`).join("")}</tr>`;
    const cell = (r) => r.blank ? `<tr>${"<td></td>".repeat(9)}</tr>`
      : r.head ? `<tr><td></td><td class="sp-sec">${esc(r.head)}</td>${"<td></td>".repeat(7)}</tr>`
        : `<tr><td></td><td class="sp-nm">${esc(r.name)}</td><td class="sp-c">${esc(r.mark)}</td><td></td><td></td>
             <td class="sp-c">${esc(r.unit)}</td><td class="sp-c">${r.qty}</td><td></td><td></td></tr>`;
    // заголовок раздела не должен оставаться ОДИН в конце листа (строки уехали на
    // следующий) — двигаем его на следующий лист, на его место пустая строка
    for (let i = SPEC_ROWS_PER_PAGE - 1; i < flat.length; i += SPEC_ROWS_PER_PAGE) {
      if (flat[i] && flat[i].head) flat.splice(i, 0, { blank: true });
    }
    const pages = [];
    for (let i = 0; i < flat.length; i += SPEC_ROWS_PER_PAGE) {
      const part = flat.slice(i, i + SPEC_ROWS_PER_PAGE);
      // добиваем пустыми строками, чтобы таблица на листе была одной высоты
      while (part.length < SPEC_ROWS_PER_PAGE) part.push({ blank: true });
      pages.push({
        title: T.specGost, noHead: true, contd: i > 0,
        body: `<table class="spec">${head}${part.map(cell).join("")}</table>`,
        side: i === 0 ? `<div class="spec-note">${T.specNote}</div>` : ""
      });
    }
    return pages;
  }

  // мини-значки ГОСТ 21.210 для легенды/спецификации листа
  const gi = (inner) => `<svg class="gsym" viewBox="-14 -15 28 28" width="18" height="18" fill="none" stroke="#111" stroke-width="1.7">${inner}</svg>`;
  const GOST_ICONS = {
    socket: gi(`<path d="M-8 3 A8 8 0 0 0 8 3"/><line x1="-8" y1="3" x2="8" y2="3"/><line x1="0" y1="-5" x2="0" y2="-11"/>`),
    tv: gi(`<path d="M-8 3 A8 8 0 0 0 8 3"/><line x1="-8" y1="3" x2="8" y2="3"/><line x1="0" y1="-5" x2="0" y2="-11"/><text x="0" y="-13" font-size="7" text-anchor="middle" fill="#111" stroke="none">TV</text>`),
    internet: gi(`<path d="M-8 3 A8 8 0 0 0 8 3"/><line x1="-8" y1="3" x2="8" y2="3"/><line x1="0" y1="-5" x2="0" y2="-11"/><text x="0" y="-13" font-size="7" text-anchor="middle" fill="#111" stroke="none">И</text>`),
    ac: gi(`<path d="M-8 3 A8 8 0 0 0 8 3"/><line x1="-8" y1="3" x2="8" y2="3"/><line x1="0" y1="-5" x2="0" y2="-11"/><text x="0" y="-13" font-size="7" text-anchor="middle" fill="#111" stroke="none">К</text>`),
    switch: gi(`<circle cx="0" cy="5" r="2.6" fill="#111"/><line x1="0" y1="5" x2="5" y2="-4"/><line x1="5" y1="-4" x2="8.5" y2="-2"/>`),
    light: gi(`<circle cx="0" cy="0" r="7"/><line x1="-5" y1="-5" x2="5" y2="5"/><line x1="-5" y1="5" x2="5" y2="-5"/>`),
    warmfloor: gi(`<rect x="-10" y="-8" width="20" height="16"/><path d="M-7 6 V-6 H-2 V6 H3 V-6 H8 V6" stroke-width="1.2"/>`),
    junction: gi(`<circle cx="0" cy="0" r="4.5" fill="#111"/>`)
  };
  const iconFor = (k, glyph, gost) => (gost && GOST_ICONS[k]) ? GOST_ICONS[k] : `<i class="g">${esc(glyph)}</i>`;

  // Временное переключение активного этажа на время сборки одного набора листов.
  // БЕЗ persist/commit — это чтение, а не правка проекта; finally возвращает как было
  // даже если рендер листа бросил исключение (иначе пользователь остался бы на чужом этаже).
  function withFloor(p, fid, fn) {
    if (!fid) return fn();
    const prev = p.activeFloorId;
    p.activeFloorId = fid;
    try { return fn(); } finally { p.activeFloorId = prev; }
  }
  function sheetHtml(p) {
    const expl = (p.rooms || []).filter((r) => (r.points || []).length >= 3)
      .map((r, i) => `<tr><td>${i + 1}</td><td>${esc(r.name)}</td><td>${G().fmtArea(G().roomNetArea(p, r))}</td><td>${esc(r.material || p.settings.wallMaterial)}</td></tr>`).join("");
    const gost = (p.settings && p.settings.symbolStyle) === "gost";
    const spec = counts(p).map((c) => `<tr><td>${iconFor(c.k, c.glyph, gost)}</td><td>${esc(c.name)}</td><td>${c.qty}</td></tr>`).join("");
    const legendRows = counts(p).map((c) => `<div>${iconFor(c.k, c.glyph, gost)}${esc(c.name)}</div>`).join("")
      + ((p.elements || []).some((e) => e.type === "junction") ? `<div>${iconFor("junction", "◇", gost)}Распаечная коробка</div>` : "")
      + ((p.openings || []).some((o) => o.type === "door") ? `<div><i class="g">Дв</i>${T.door}</div>` : "")
      + ((p.openings || []).some((o) => o.type === "window") ? `<div><i class="g">Ок</i>${T.win}</div>` : "")
      + ((p.panels || []).length ? `<div><i class="g">Щ</i>${T.panel}</div>` : "");
    // ---- альбом: собираем ЛИСТЫ по порядку, потом нумеруем (штамп каждого листа знает
    // свой номер и общее число — «Лист N / Листов M», как в проектной документации) ----
    const pages = [];
    // МНОГОЭТАЖНЫЙ альбом: листы, зависящие от ГЕОМЕТРИИ (общий план, по типам точек, по
    // слоям трасс, развёртки), печатаются НА КАЖДЫЙ этаж — buildSvg/unfoldSvg берут
    // активный этаж через G.floorScoped, поэтому просто прогоняем их по очереди с
    // временно переключённым p.activeFloorId (withFloor, БЕЗ persist — вид пользователя
    // не меняется). Листы, общие для всего проекта (спецификация, линии и щит,
    // однолинейка), печатаются ОДИН раз: смета/линии/схема в модуле и так одни на проект.
    const floors = (p.floors || []).length > 1 ? (p.floors || []).slice() : [null];
    floors.forEach((f) => withFloor(p, f && f.id, () => {
      const suf = f ? " · " + f.name : "";
      pages.push({ title: T.genplan + suf, body: `<div class="plan">${buildSvg(p)}</div>`, scale: lastPlanScale });
      buildTypePages(p).forEach((pg) => pages.push(Object.assign({}, pg, { title: pg.title + suf })));
      buildLayerPages(p).forEach((pg) => pages.push(Object.assign({}, pg, { title: pg.title + suf })));
      buildUnfolds(p).forEach((pg) => pages.push(Object.assign({}, pg, { title: pg.title + suf })));
    }));
    pages.push({ title: T.specSheet, body: `<div class="cols">
          <div><h3>${T.expl}</h3><table class="tb"><thead><tr><th>№</th><th>Помещение</th><th>S</th><th>Стены</th></tr></thead><tbody>${expl}</tbody></table></div>
          <div><h3>${T.spec}</h3><table class="tb"><thead><tr><th></th><th>Тип</th><th>Кол-во</th></tr></thead><tbody>${spec}</tbody></table></div>
          <div class="legend"><h3>${T.legend}</h3>${legendRows}</div>
        </div>` });
    buildSpecPages(p).forEach((pg) => pages.push(pg));
    buildCircuits(p).forEach((pg) => pages.push(pg));
    buildScheme(p).forEach((pg) => pages.push(pg));
    const of = pages.length + 1; // + титульный лист
    const sheets = buildTitlePage(p, pages, of) + pages.map((pg, i) => sheetWrap(p, pg, i + 2, of)).join("");
    return `<!doctype html><html lang="ru"><head><meta charset="utf-8"><title>${esc(p.name)} — ${T.sheet}</title><style>
      /* ---- лист альбома: A4 landscape, поля по ГОСТ 2.301 (20мм слева под подшивку,
         5мм остальные), рамка, штамп внизу справа. margin:0 у @page — поля рисуем сами,
         иначе браузерные поля складывались бы с нашими и рамка «плыла» от принтера ---- */
      @page { size: ${pdfFormat} landscape; margin: 0; }
      * { box-sizing: border-box; margin: 0; }
      /* ГОСТ-шрифт: узкий наклонный (тип А). Настоящего ГОСТ-шрифта в системе нет —
         ближайшее из гарантированно доступного это Arial Narrow курсивом, как и
         выглядит присланный пользователем проект. */
      body { font: italic 10.5px/1.25 "Arial Narrow", "Liberation Sans Narrow", Arial, sans-serif; color: #000; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
      .sheet { position: relative; width: ${pg().w}mm; height: ${pg().h}mm; padding: 5mm 5mm 5mm 20mm; overflow: hidden; break-after: page; page-break-after: always; }
      /* графы подшивки (ГОСТ 2.104, графы 19-23) — в левом поле, текст на 90° */
      .bind { position: absolute; left: 5mm; bottom: 5mm; width: 15mm; display: flex; flex-direction: column; }
      .bind-b { height: 25mm; border: .25mm solid #000; border-right: 0; display: flex; align-items: center; justify-content: center; }
      .bind-b.bind-t { height: 35mm; }
      .bind-b span { writing-mode: vertical-rl; transform: rotate(180deg); font-size: 8px; white-space: nowrap; }
      .fmt { position: absolute; right: 5mm; bottom: 1mm; font-size: 8px; }
      .sheet:last-child { break-after: auto; page-break-after: auto; }
      .fr { position: relative; width: 100%; height: 100%; border: 0.7mm solid #000; padding: 3mm; display: flex; flex-direction: column; }
      .fr > h2 { font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: .03em; padding-bottom: 1mm; border-bottom: .3mm solid #000; margin-bottom: 2mm; }
      /* содержимое НИКОГДА не залезает под штамп (он position:absolute) */
      /* содержимое НИКОГДА не залезает под штамп: полная надпись 55мм, сокращённая 11мм */
      .body { flex: 1 1 auto; min-height: 0; padding-bottom: 58mm; }
      .body-c { padding-bottom: 14mm; }
      .plan { height: 100%; display: flex; align-items: center; justify-content: center; }
      .plan svg { display: block; max-width: 100%; max-height: 100%; }
      .cols { display: flex; gap: 4mm; align-items: flex-start; }
      .cols > div { flex: 1; }
      h3 { font-size: 10.5px; font-weight: 700; margin: 0 0 1.5mm; }
      table { width: 100%; border-collapse: collapse; }
      td, th { border: .25mm solid #000; padding: .8mm 1.5mm; text-align: left; font-size: 9.5px; }
      thead th, .tb th { background: #ececec; font-weight: 700; }
      .note { font-size: 10px; margin-bottom: 2mm; }
      .legend div { display: flex; align-items: center; gap: 2mm; padding: .4mm 0; font-size: 9.5px; }
      .g { font-style: normal; display: inline-flex; width: 4.5mm; height: 4.5mm; border-radius: 50%; border: .25mm solid #000; align-items: center; justify-content: center; font-size: 7.5px; font-weight: 700; flex: none; }
      /* ---- основная надпись по ГОСТ 21.101 (форма 3 — первый лист, форма 6 — далее) ---- */
      .stamp { position: absolute; right: 0; bottom: 0; width: 185mm; border-collapse: collapse; table-layout: fixed; }
      .stamp td { border: .25mm solid #000; padding: 0 .8mm; height: 5.5mm; font-size: 8px; vertical-align: middle; overflow: hidden; }
      .stamp .s-c { text-align: center; }
      .stamp .s-l { text-align: left; }
      .stamp .s-code { font-size: 10px; }
      .stamp .s-obj { font-size: 8.5px; line-height: 1.15; padding: .5mm 2mm; }
      .stamp .s-sec, .stamp .s-title { font-size: 9px; line-height: 1.15; padding: .5mm 1.5mm; }
      .stamp .s-h { font-size: 7.5px; }
      .stamp .s-org { font-size: 11px; letter-spacing: .06em; }
      .stamp-c { width: 185mm; }
      /* ---- спецификация оборудования (ГОСТ 21.110, форма 1) ---- */
      .spec { width: 100%; border-collapse: collapse; table-layout: fixed; }
      .spec th, .spec td { border: .25mm solid #000; height: 5.6mm; padding: 0 1mm; font-size: 8.5px; font-weight: 400; vertical-align: middle; overflow: hidden; }
      .spec .sp-h th { text-align: center; height: 12mm; font-size: 8px; line-height: 1.15; padding: .5mm; }
      .spec .sp-n td { text-align: center; font-size: 8px; height: 4.4mm; }
      .spec col { }
      .spec th:nth-child(1), .spec td:nth-child(1) { width: 12mm; }
      .spec th:nth-child(3), .spec td:nth-child(3) { width: 40mm; }
      .spec th:nth-child(4), .spec td:nth-child(4) { width: 25mm; }
      .spec th:nth-child(5), .spec td:nth-child(5) { width: 25mm; }
      .spec th:nth-child(6), .spec td:nth-child(6) { width: 18mm; }
      .spec th:nth-child(7), .spec td:nth-child(7) { width: 15mm; }
      .spec th:nth-child(8), .spec td:nth-child(8) { width: 20mm; }
      .spec th:nth-child(9), .spec td:nth-child(9) { width: 24mm; }
      .spec .sp-c { text-align: center; }
      .spec .sp-sec { text-align: center; }
      .spec .sp-nm { padding-left: 3mm; }
      .spec-note { position: absolute; left: 0; bottom: 2mm; width: calc(100% - 188mm); font-size: 8.5px; line-height: 1.3; }
      /* ---- титульный лист ---- */
      .tp { display: flex; flex-direction: column; height: 100%; padding-bottom: 58mm; }
      .tp-top { text-align: center; padding: 6mm 0 8mm; }
      .tp-stage { font-size: 10px; letter-spacing: .18em; text-transform: uppercase; color: #444; margin-bottom: 3mm; }
      .tp-top h1 { font-size: 22px; font-weight: 700; letter-spacing: .01em; }
      .tp-sub { font-size: 12px; color: #333; margin-top: 2mm; text-transform: uppercase; letter-spacing: .08em; }
      .tp-cols { display: flex; gap: 6mm; align-items: flex-start; }
      .tp-info { flex: 0 0 105mm; }
      .tp-info th { width: 32mm; white-space: nowrap; }
      .tp-ved { flex: 1 1 auto; }
      .tp-ved th:first-child, .tp-ved td:first-child { width: 12mm; }
      .tp-ved th:last-child, .tp-ved td:last-child { width: 16mm; text-align: center; }
      /* сцена SVG — печатные цвета */
      .gsym { flex: none; vertical-align: middle; }
      .legend .gsym { margin-right: 0; }
      .ep-plan-wallfill { fill: #d8dee7; stroke: none; }
      .ep-plan-wallfill.mat-brick { fill: #ecd6c2; }
      .ep-plan-wallfill.mat-block { fill: #e2e9d6; }
      .ep-plan-wallfill.mat-panel { fill: #dcd8e8; }
      .ep-plan-wallfill.mat-wood { fill: #ead9c0; }
      .ep-plan-wallfill.mat-gkl, .ep-plan-wallfill.mat-pgp, .ep-plan-wallfill.mat-soft { fill: #eef1f5; }
      .ep-plan-walledge { stroke: #111; }
      .ep-plan-hatchln { stroke: #64748b; stroke-width: .8; }
      .ep-plan-gost { stroke: #111; }
      .ep-plan-gosttxt { fill: #111; }
      .ep-plan-panelhalf { fill: #1d4ed8; }
      .ep-plan-roomhandle, .ep-plan-beamhandle { display: none; }
      .ep-plan-wallband { stroke: #111; fill: none; }
      .ep-plan-wallband.mat-brick { stroke: #b45309; }
      .ep-plan-wallband.mat-panel { stroke: #555; stroke-dasharray: 40 10; }
      .ep-plan-wallband.mat-soft { stroke: #777; stroke-dasharray: 16 9; }
      .ep-plan-wallband.is-lintel-band { opacity: .7; }
      .ep-plan-wallcorner { fill: #111; }
      .ep-plan-wallcorner.mat-brick { fill: #b45309; }
      .ep-plan-wallcorner.mat-panel, .ep-plan-wallcorner.mat-soft { fill: #555; }
      .ep-plan-junction { fill: #1d4ed8; stroke: #111; }
      .ep-plan-room { fill: rgba(37, 99, 235, .05); }
      .ep-plan-dim { fill: #444; font-family: system-ui; } .ep-plan-name { fill: #111; font-family: system-ui; font-weight: 600; }
      .ep-plan-chain, .ep-plan-chaintext { stroke: #dc2626; fill: #dc2626; font-family: system-ui; }
      .ep-plan-chaintext { stroke: none; }
      .ep-plan-doorarc { stroke: #444; } .ep-plan-doorleaf { stroke: #111; } .ep-plan-window { stroke: #111; }
      .ep-plan-elglyph { fill: #fff; font-family: system-ui; font-weight: 700; }
      .ep-plan-el circle, .ep-plan-blockrect { stroke: #111; } .ep-plan-panel rect { fill: #1d4ed8; stroke: #111; }
      .ep-plan-route { opacity: .75; fill: none; } .ep-plan-cross { stroke: #b45309; fill: none; }
      .ep-plan-warnring, .ep-plan-eldone { display: none; }
      /* многосегментные линии-связи БЕЗ fill:none — SVG по умолчанию заливает область
         между последней и первой точкой пути чёрным (даже без явного "Z" замыкания),
         на изогнутых трассах это давало жирные тёмные треугольники в PDF (репорт
         пользователя, скриншот) — в живом плане это НЕ видно, там fill:none уже есть
         в plan.css, а этот <style> — отдельный, только для печати. */
      .ep-plan-swlink, .ep-plan-swchain { fill: none; }
      /* ГЛУШИМ ВЕСЬ КЛАСС бага разом, а не по одному классу: НИ ОДНА polyline в сцене
         плана (трассы, магистрали, черновик комнаты) заливки не требует, а SVG по
         умолчанию заливает её чёрным — новый вид линии, добавленный когда-нибудь позже,
         больше не сможет молча дать чёрные пятна в PDF. */
      polyline { fill: none; }
      /* мебель/техника на печати — тонким контуром, техника с подписью нагрузки */
      .ep-plan-furnrect { fill: none; stroke: #666; stroke-dasharray: 6 4; }
      .ep-plan-furn.is-appl .ep-plan-furnrect { stroke: #333; stroke-dasharray: none; }
      .ep-plan-furntext { fill: #333; font-family: system-ui; }
      .ep-plan-furnload { fill: #111; font-family: system-ui; }
      .ep-plan-furnlink { stroke: #666; stroke-dasharray: 4 3; fill: none; }
      .ep-plan-tail { fill: none; }
      .ep-plan-tailtxt { fill: #111; font-family: system-ui; }
      /* Магистрали (⇉, p.guides) — ЧЕРТЁЖНЫЙ АИД РЕДАКТОРА (приоритетное направление
         для автотрассировки), не монтажная информация: на печатном листе они не нужны
         (кабель показан самими трассами), а как polyline без fill:none давали ровно те
         чёрные пятна из репорта пользователя. */
      .ep-plan-guide, .ep-plan-guidedraft, .ep-plan-guidept { display: none; }
      /* заметки/выноски — их ради монтажников и пишут, на листе они ОБЯЗАНЫ быть;
         на белой бумаге тёмно-янтарным, без тёмной обводки живого плана */
      /* свои размеры — часть чертежа, печатаются наравне с автоматической цепочкой */
      .ep-plan-udimline { stroke: #0f172a; fill: none; }
      .ep-plan-udimext { stroke: #0f172a; stroke-dasharray: 4 3; opacity: .6; fill: none; }
      .ep-plan-udimtext { fill: #0f172a; font-family: Arial, sans-serif; font-weight: 700; stroke: none; }
      .ep-plan-udimgrip { display: none; }   /* ручка тяги — только на экране */
      .ep-plan-notetext { fill: #92400e; font-family: Arial, sans-serif; font-weight: 700; stroke: none; }
      .ep-plan-noteline { stroke: #92400e; stroke-dasharray: 6 4; fill: none; }
      .ep-plan-notetip { fill: #92400e; stroke: none; }
      /* связи выключатель→свет в печати — пунктиром и бледнее: это ЛОГИЧЕСКАЯ связь,
         а не кабель; сплошными яркими линиями (dash задан только в plan.css, которого
         у печатного <style> нет) они читались как посторонние диагонали через комнаты. */
      .ep-plan-swlink, .ep-plan-swchain { stroke-dasharray: 7 5; opacity: .45; }
      /* развёртки стен */
      .unfgrid { display: grid; grid-template-columns: 1fr 1fr; gap: 4mm; height: 100%; }
      .unfcard { border: .25mm solid #000; padding: 1.5mm 2mm; break-inside: avoid; display: flex; flex-direction: column; }
      .unfcard h4 { font-size: 9px; font-weight: 700; margin-bottom: 1mm; }
      .unf { width: 100%; flex: 1 1 auto; max-height: ${pg().h - 65}mm; }
      /* информационная панель карточки развёртки: помещение/стена + ключ-схема с направлением взгляда */
      .unfinfo { display: flex; gap: 2mm; align-items: flex-start; border-bottom: .2mm solid #000; padding-bottom: 1mm; margin-bottom: 1mm; }
      .unfinfot { width: auto; flex: 1 1 auto; border-collapse: collapse; }
      .unfinfot th, .unfinfot td { border: none; padding: 0 2mm 0 0; font-size: 8px; line-height: 1.25; text-align: left; }
      .unfinfot th { font-weight: 400; color: #444; white-space: nowrap; width: 1%; }
      .unfkeyw { flex: none; width: 28mm; }
      .unfkey { width: 28mm; height: 20mm; border: .2mm solid #000; }
      .unfkey .ukroom { fill: #f2f2f2; stroke: #999; stroke-width: 2; }
      .unfkey .ukwall { stroke: #000; stroke-width: 11; }
      .unfkey .ukarr { stroke: #000; stroke-width: 3; }
      .unfkey .ukarrh { fill: #000; }
      .unfkeyc { font-size: 7px; color: #444; text-align: center; line-height: 1.15; }
      /* листы «Размеры и высоты» по типам точек */
      .tpnote { font-size: 8px; color: #222; margin-bottom: 1mm; }
      .tpplan { height: calc(100% - 5mm); }
      .ep-plan-freedim { stroke: #000; stroke-dasharray: 10 5; }
      .ep-plan-freedimt { fill: #000; font-family: Arial, sans-serif; }
      .unfwall { fill: #f1f5f9; stroke: #94a3b8; stroke-width: 1; }
      .unffloor { stroke: #111; stroke-width: 2; }
      .unfopen { fill: rgba(56,189,248,.12); stroke: #0891b2; stroke-width: 1; }
      .unfopen.is-win { fill: rgba(56,189,248,.2); }
      .unfopent { fill: #0e7490; font-family: system-ui; font-weight: 700; }
      .unfdim { stroke: #0891b2; stroke-width: 1; }
      .unfdimh { stroke: #38bdf8; stroke-width: .8; }
      .unfdimt { fill: #0e7490; font-family: system-ui; }
      .unfshape { stroke: #111; stroke-width: 1; }
      .unfglyph { fill: #fff; font-weight: 700; font-family: system-ui; }
      .unfqf { font-weight: 700; font-family: system-ui; }
      /* однолинейка + линии */
      .schemebox { border: .25mm solid #000; padding: 2mm; overflow: hidden; height: 100%; display: flex; align-items: center; justify-content: center; }
      .schemebox svg { max-width: 100%; height: auto; }
      .cd { display: inline-block; width: 10px; height: 10px; border-radius: 50%; margin-right: 5px; vertical-align: middle; }
    </style></head><body>${sheets}</body></html>`;
  }

  function print() {
    const p = core().project;
    if (!p || !(p.rooms || []).length) { rooms().toast("Нарисуй план — потом лист."); return; }
    // window.open() ОБЯЗАН остаться синхронным, прямо в обработчике клика — иначе
    // блокировщик всплывающих окон режет его (popup разрешён только внутри стека
    // вызовов пользовательского жеста, не из setTimeout).
    const w = window.open("", "_blank");
    if (!w) { rooms().toast("Разреши всплывающие окна для печати."); return; }
    rooms().toast("Строим PDF…");
    // sheetHtml(p) синхронно пересобирает офскрин-SVG НЕСКОЛЬКО раз подряд (общий
    // план + страница на каждый слой трасс + каждая развёртка стены) — на большом
    // многоэтажном проекте это заметная пауза, во время которой интерфейс молча
    // «подвисает» без единой обратной связи. setTimeout(…, 30) отдаёт браузеру
    // один кадр на отрисовку тоста ПЕРЕД тяжёлой синхронной сборкой.
    setTimeout(() => {
      w.document.write(sheetHtml(p));
      w.document.close();
      setTimeout(() => { try { w.focus(); w.print(); } catch (e) {} }, 400);
    }, 30);
  }

  // первая попавшаяся стена с точками — образец для живого превью масштаба
  // (просьба пользователя: ползунок с превью ПЕРЕД печатью PDF)
  function firstUnfoldSample(p) {
    let card = null;
    (p.rooms || []).some((room) => {
      if ((room.points || []).length < 2) return false;
      return G().walls(room).some((w) => {
        const els = (p.elements || []).filter((e) => e.wallId === w.id);
        if (!els.length) return false;
        card = unfoldSvg(p, room, w, els);
        return true;
      });
    });
    return card;
  }
  function pdfScalePreview(p) {
    const card = firstUnfoldSample(p);
    return card ? `<div class="ep-plan-pdfpreview">${card}</div>` : `<div class="ep-plan-modehint">Нет точек на стенах для превью — масштаб всё равно применится ко всем развёрткам.</div>`;
  }
  function sheetPdfScale() {
    const p = core().project;
    if (!p || !(p.rooms || []).length) { rooms().toast("Нарисуй план — потом лист."); return; }
    const pct = Math.round(pdfScale * 100);
    rooms().openSheet(`<div class="ep-plan-srow"><b>📄 Печатный лист (PDF)</b><span class="ep-plan-flex"></span><button type="button" class="ep-plan-mini ep-clickable" data-sheet-fs aria-label="Во весь экран">⛶</button><button type="button" class="ep-plan-mini ep-clickable" data-pxp-close>✕</button></div>
      <div class="ep-plan-srow">Масштаб постов на развёртках:
        <input type="range" min="20" max="220" value="${pct}" data-pxp-scale class="ep-plan-unfslider">
        <b data-pxp-scaleval>${pct}%</b>
      </div>
      <div class="ep-plan-modehint">Меняет размер символов/подписей НА РАЗВЁРТКАХ СТЕН в PDF — сам план и физические размеры не меняются.</div>
      <div class="ep-plan-srow">Формат листа:
        ${Object.keys(PAGE).map((f) => `<button type="button" class="ep-plan-chip ep-clickable ${pdfFormat === f ? "on" : ""}" data-pxp-fmt="${f}">${f}</button>`).join("")}
      </div>
      <div class="ep-plan-srow">Масштаб чертежа:
        <button type="button" class="ep-plan-chip ep-clickable ${pdfFit ? "on" : ""}" data-pxp-fit="1">⤢ Во весь лист</button>
        <button type="button" class="ep-plan-chip ep-clickable ${pdfFit ? "" : "on"}" data-pxp-fit="0">📐 Стандартный (1:20…1:500)</button>
      </div>
      <div class="ep-plan-modehint">«Во весь лист» — чертёж занимает всё поле листа (в штамп идёт получившийся масштаб с пометкой «впис.»). «Стандартный» — ближайший масштаб из ряда 1:20…1:500, чертёж может занять не весь лист, зато масштаб истинный и его можно мерить линейкой.</div>
      <div class="ep-plan-modehint">На большом листе (A2-A0) план печатается КРУПНЕЕ — масштаб чертежа подбирается автоматически (до 1:20) и пишется в штамп вместе с форматом.
      <b>Важно:</b> в диалоге печати выбери ТУ ЖЕ бумагу. На Android диалог сам решает размер: если оставить A4, лист впишется со сжатием — чертёж будет читаемым, но масштаб в штампе перестанет быть истинным.</div>
      <div id="ep-plan-pdfpreview-box">${pdfScalePreview(p)}</div>
      <div class="ep-plan-srow ep-plan-sbtns">
        <button type="button" class="btn btn-primary ep-clickable" data-pxp-print>📄 Сформировать PDF (${pdfFormat}${pdfFit ? " · во весь лист" : ""})</button>
      </div>`);
  }

  document.addEventListener("click", (e) => {
    if (!rooms() || !rooms().isActive()) return;
    if (e.target.closest("[data-plan-pdf]")) return sheetPdfScale();
    if (e.target.closest("[data-pxp-close]")) { rooms().closeSheet(); return; }
    const fmtBtn = e.target.closest("[data-pxp-fmt]");
    if (fmtBtn) { pdfFormat = fmtBtn.getAttribute("data-pxp-fmt") || "A4"; sheetPdfScale(); return; }
    const fitBtn = e.target.closest("[data-pxp-fit]");
    if (fitBtn) { pdfFit = fitBtn.getAttribute("data-pxp-fit") === "1"; sheetPdfScale(); return; }
    // closeSheet() ПЕРЕД print() — иначе он тут же стёр бы тост «Строим PDF…»,
    // который print() показывает через тот же openSheet() сразу после себя.
    if (e.target.closest("[data-pxp-print]")) { rooms().closeSheet(); print(); return; }
  });
  document.addEventListener("input", (e) => {
    if (!rooms() || !rooms().isActive()) return;
    const t = e.target;
    if (!(t.hasAttribute && t.hasAttribute("data-pxp-scale"))) return;
    pdfScale = Math.max(0.2, Math.min(2.2, (Number(t.value) || 100) / 100));
    const lbl = document.querySelector("[data-pxp-scaleval]"); if (lbl) lbl.textContent = Math.round(pdfScale * 100) + "%";
    const box = document.getElementById("ep-plan-pdfpreview-box");
    const p = core().project;
    if (box && p) box.innerHTML = pdfScalePreview(p);
  });

  EP.Plan = EP.Plan || {};
  EP.Plan.Export = { print, sheetHtml, counts };
})();
