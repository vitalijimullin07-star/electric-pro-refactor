/* Electric Pro V29 — Проект квартиры: печатный лист (Remplanner-стиль).
   Кнопка 📄 собирает лист А4: рамка со штампом, план в чистом виде (без
   сетки и подложки), экспликация помещений, легенда, спецификация точек.
   Открывается окно печати — «Сохранить как PDF» на любом устройстве. */
(() => {
  "use strict";
  window.EP = window.EP || {};

  const T = { sheet: "План электрики", made: "Исполнитель", obj: "Объект", addr: "Адрес", client: "Заказчик", area: "Площадь", roomsN: "Помещений", date: "Дата", legend: "Условные обозначения", expl: "Экспликация помещений", spec: "Спецификация точек", door: "Дверь", win: "Окно", panel: "Щит", genplan: "Общий план", specSheet: "Спецификация", tracesOf: (name) => `Трассы: ${name}` };
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
  function buildSvg(pRaw) {
    const p = G().floorScoped(pRaw);
    const host = document.createElement("div");
    host.style.cssText = "position:fixed;left:-2000px;top:0;width:1050px;height:700px;";
    document.body.appendChild(host);
    const cv = EP.Plan.Canvas.create(host);
    const bb = G().projectBBox(p);
    if (bb) cv.fit(bb, 0.07);
    EP.Plan.Render.draw(cv, p, {});
    ["grid", "underlay"].forEach((n) => { const gl = cv.layers[n]; while (gl.firstChild) gl.removeChild(gl.firstChild); });
    cv.svg.setAttribute("width", "100%");
    cv.svg.removeAttribute("class");
    const html = cv.svg.outerHTML;
    cv.destroy();
    document.body.removeChild(host);
    return html;
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
    if (!ids.length) return "";
    return ids.map((id) => {
      const svg = withLayers(p, [id, "routes", "labels"], () => buildSvg(p));
      return `<div class="unfsec"><h3>${esc(T.tracesOf(layerName(p, id)))}</h3><div class="plan">${svg}</div></div>`;
    }).join("");
  }
  // титульный лист — заказчик/объект/площадь (просьба пользователя: «титульный
  // лист где информация о заказчике и квартире/доме»)
  function buildTitlePage(p) {
    const master = (window.EP.state && EP.state.user && EP.state.user.displayName) || "";
    const date = new Date().toLocaleDateString("ru-RU");
    const roomsList = (p.rooms || []).filter((r) => (r.points || []).length >= 3);
    const totalArea = roomsList.reduce((s, r) => s + G().roomNetArea(p, r), 0);
    return `<div class="titlepage">
      <div class="tpbadge">⚡</div>
      <h1>${esc(p.name)}</h1>
      <div class="tpsub">Проект электроснабжения</div>
      <table class="tptable">
        <tr><th>${T.obj}</th><td>${esc(p.name)}</td></tr>
        <tr><th>${T.addr}</th><td>${esc(p.address || "—")}</td></tr>
        ${p.client ? `<tr><th>${T.client}</th><td>${esc(p.client)}</td></tr>` : ""}
        ${roomsList.length ? `<tr><th>${T.area}</th><td>${G().fmtArea(totalArea)}</td></tr><tr><th>${T.roomsN}</th><td>${roomsList.length}</td></tr>` : ""}
        <tr><th>${T.made}</th><td>${esc(master || "—")}</td></tr>
        <tr><th>${T.date}</th><td>${esc(date)}</td></tr>
      </table>
    </div>`;
  }

  // развёртка одной стены для печати (длина × высота, точки с рулетками от угла и от пола)
  function unfoldSvg(p, room, w, els) {
    const H = room.height || p.settings.ceilingHeight, L = w.len, pad = 45;
    const TY = EP.Plan.Elements.TYPES;
    // viewBox (физические пропорции стены) от масштаба НЕ зависит — растут только
    // символы/подписи/толщины линий (kk), просьба пользователя: «масштаб самих постов»
    const kk = (H + pad) / 200 * pdfScale;
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
      const floorRoute = p.settings.routeType === "floor";
      const chaseY0 = floorRoute ? H : 0;
      const CHASE_COL = { power: "#f59e0b", light: "#facc15", lv: "#38bdf8", warm: "#fb7185" };
      const SIZE_LBL = {
        power: `${Math.round(p.settings.chaseW || 25)}×${Math.round(p.settings.chaseH || 30)}`,
        light: `${Math.round(p.settings.chaseW || 25)}×${Math.round(p.settings.chaseH || 30)}`,
        lv: `${Math.round(p.settings.chaseW || 25)}×${Math.round(p.settings.chaseH || 30)}`,
        warm: `${Math.round(p.settings.tpChaseW || 50)}×${Math.round(p.settings.tpChaseH || 50)}`
      };
      const chaseKindOf = (layer) => (layer === "warm" ? "warm" : (layer === "lv" || layer === "tv" || layer === "cctv" ? "lv" : (layer === "light" ? "light" : "power")));
      const drawChase = (cx, cy0, cy1, kind) => {
        if (Math.abs(cy1 - cy0) < 1) return;
        const col = CHASE_COL[kind] || CHASE_COL.power;
        s += `<line x1="${cx}" y1="${cy0}" x2="${cx}" y2="${cy1}" stroke="${col}" stroke-width="${kk * 5}" opacity="0.28"/>`;
        s += `<line x1="${cx}" y1="${cy0}" x2="${cx}" y2="${cy1}" stroke="${col}" stroke-width="${kk * 1.4}" stroke-dasharray="${3 * kk} ${2 * kk}"/>`;
        const labelY = cy0 + (cy1 > cy0 ? 12 * kk : -6 * kk);
        s += `<text x="${cx + 3 * kk}" y="${labelY}" font-size="${8 * kk}" fill="${col}">${SIZE_LBL[kind] || ""}</text>`;
      };
      sorted.forEach((el2) => {
        const xx = el2.offset, yy = H - el2.height;
        if (el2.type === "block") {
          const items = (el2.params && el2.params.items) || [];
          const step2 = 18 * kk, bw = items.length * step2 + 6 * kk;
          (G().blockChaseEntries ? G().blockChaseEntries(el2) : []).forEach((en) => {
            const ex = xx - bw / 2 + 3 * kk + step2 * en.idx + step2 / 2;
            const y0 = (en.kind === "light" && floorRoute) ? 0 : chaseY0;
            drawChase(ex, y0, yy, en.kind);
          });
        } else if (el2.layer === "warm") {
          drawChase(xx, chaseY0, yy, "power");
          if (el2.height > 1) drawChase(xx, yy, H, "warm");
        } else {
          const kind = chaseKindOf(el2.layer);
          const y0 = (el2.type === "switch" && floorRoute) ? 0 : chaseY0;
          drawChase(xx, y0, yy, kind);
        }
      });
    }
    // AABB символов — подпись высоты кладём РЯДОМ с постом, сдвигая, если она
    // ложится на другой пост (просьба пользователя: высота у поста, не пересекать)
    const symHalf = (el) => {
      if (el.type === "block") {
        const items = (el.params && el.params.items) || ["socket"];
        const step = 18 * kk, bw = items.length * step + 6 * kk, bh = 24 * kk;
        return { hw: bw / 2, hh: bh / 2 };
      }
      return { hw: 13 * kk, hh: 13 * kk };
    };
    const boxes = sorted.map((e) => { const h = symHalf(e); return { x: e.offset, y: H - e.height, hw: h.hw, hh: h.hh }; });
    // QF-имя и подпись расстояния от угла — тоже места, которые подпись высоты не
    // должна перекрывать (репорт пользователя со скриншотом: цифры сливаются)
    const qfBoxes = sorted.map((e) => {
      const cc = (p.circuits || []).find((c) => c.id === e.circuitId); if (!cc) return null;
      return { x: e.offset, y: H - e.height - 18 * kk, hw: Math.max(14, cc.name.length * 4.2) * kk, hh: 7 * kk };
    }).filter(Boolean);
    const offBoxes = sorted.map((e) => {
      const x = e.offset, y = H - e.height;
      if (x <= 2) return null;
      return { x: x / 2, y: y - 3 * kk, hw: 14 * kk, hh: 8 * kk };
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
        const items = (el.params && el.params.items) || ["socket"];
        const step = 18 * kk, bw = items.length * step + 6 * kk, bh = 24 * kk;
        s += `<rect x="${x - bw / 2}" y="${y - bh / 2}" width="${bw}" height="${bh}" rx="${5 * kk}" fill="${col}" class="unfshape"/>`;
        items.forEach((it, i) => { s += `<text x="${x - bw / 2 + 3 * kk + step * i + step / 2}" y="${y}" font-size="${9 * kk}" text-anchor="middle" dominant-baseline="central" class="unfglyph">${esc((TY[it] || {}).glyph || "?")}</text>`; });
      } else {
        s += `<circle cx="${x}" cy="${y}" r="${13 * kk}" fill="${col}" class="unfshape"/>`;
        s += `<text x="${x}" y="${y}" font-size="${10 * kk}" text-anchor="middle" dominant-baseline="central" class="unfglyph">${esc((TY[el.type] || {}).glyph || "?")}</text>`;
      }
      if (cc) s += `<text x="${x}" y="${y - 18 * kk}" font-size="${8.5 * kk}" text-anchor="middle" fill="${col}" class="unfqf">${esc(cc.name)}</text>`;
    });
    // проход 2: размеры/высоты — ПОСЛЕ всех символов, значит визуально ПОВЕРХ них
    sorted.forEach((el, idx) => {
      const x = el.offset, y = H - el.height;
      s += `<line x1="${x}" y1="${H}" x2="${x}" y2="${y}" class="unfdim"/>`;
      if (x > 2) {
        s += `<line x1="0" y1="${y}" x2="${x}" y2="${y}" class="unfdimh"/>`;
        s += `<line x1="0" y1="${y - 3 * kk}" x2="0" y2="${y + 3 * kk}" class="unfdimh"/>`;
        s += `<text x="${x / 2}" y="${y - 3 * kk}" font-size="${9.5 * kk}" text-anchor="middle" class="unfdimt">${Math.round(el.offset)}</text>`;
      }
      const hl = placeHLabel(idx);
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
  const UNF_PER_PAGE = 2;
  function buildUnfolds(p) {
    const cards = [];
    (p.rooms || []).forEach((room) => {
      if ((room.points || []).length < 2) return;
      G().walls(room).forEach((w) => {
        const els = (p.elements || []).filter((e) => e.wallId === w.id);
        if (!els.length) return;
        cards.push(`<div class="unfcard"><h4>${esc(room.name)} · стена ${w.n} · ${G().fmtLen(w.len)} × ${G().fmtLen(room.height || p.settings.ceilingHeight)}</h4>${unfoldSvg(p, room, w, els)}</div>`);
      });
    });
    if (!cards.length) return "";
    const totalPages = Math.ceil(cards.length / UNF_PER_PAGE);
    const pages = [];
    for (let i = 0; i < cards.length; i += UNF_PER_PAGE) {
      const n = i / UNF_PER_PAGE + 1;
      const title = totalPages > 1 ? `Развёртки стен (${n}/${totalPages})` : "Развёртки стен";
      pages.push(`<div class="unfsec"><h3>${esc(title)}</h3><div class="unfgrid">${cards.slice(i, i + UNF_PER_PAGE).join("")}</div></div>`);
    }
    return pages.join("");
  }

  // однолинейная схема в лист (тем же движком, что и в приложении)
  function buildScheme(p) {
    if (!window.ShieldSchemeSVG || !EP.Plan.Scheme || !(p.circuits || []).length) return "";
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
      return `<div class="unfsec"><h3>Однолинейная схема</h3><div class="schemebox">${svg.outerHTML}</div></div>`;
    } catch (e) { return ""; }
  }
  // таблица линий (QF) + щит
  function buildCircuits(p) {
    const circuits = p.circuits || [];
    if (!circuits.length) return "";
    if (EP.Plan.Scheme && EP.Plan.Scheme.recompute) { try { EP.Plan.Scheme.recompute(p); } catch (e) {} }
    const rl = EP.Plan.Routes ? EP.Plan.Routes.lengths(p) : { byCircuit: {} };
    const cableOf = (c) => c.cable || (EP.Plan.Scheme && EP.Plan.Scheme.autoCable ? EP.Plan.Scheme.autoCable(p, c) : null) || "—";
    const rows = circuits.map((c) => `<tr><td><i class="cd" style="background:${esc(c.color)}"></i>${esc(c.name)}</td><td>${(c.breaker || 16)}A${c.rcd ? " + УЗО" : ""}</td><td>${esc(cableOf(c))}</td><td>${c.poles === 3 ? "3P" : "1P"}</td><td>${rl.byCircuit && rl.byCircuit[c.id] ? G().fmtLen(rl.byCircuit[c.id]) : "—"}</td></tr>`).join("");
    const box = p.settings.panelBox;
    const panelInfo = box && box.modules ? `Щит: <b>${esc(box.brand)}</b> · ${box.modules} мод · ${box.wmm}×${box.hmm}×${box.dmm} мм` : "";
    return `<div class="unfsec"><h3>Линии и щит</h3>${panelInfo ? `<p style="margin:2px 0 6px">${panelInfo}</p>` : ""}
      <table><tr><th>Линия</th><th>Автомат</th><th>Кабель</th><th>Полюса</th><th>Длина</th></tr>${rows}</table></div>`;
  }

  function counts(p) {
    const TY = EP.Plan.Elements.TYPES, out = {};
    (p.elements || []).forEach((e) => {
      if (e.type === "block") ((e.params && e.params.items) || []).forEach((it) => { out[it] = (out[it] || 0) + 1; });
      else out[e.type] = (out[e.type] || 0) + 1;
    });
    return Object.keys(out).map((k) => ({ k, name: (TY[k] || { name: k }).name, glyph: (TY[k] || {}).glyph || "?", qty: out[k] }));
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
    return `<!doctype html><html lang="ru"><head><meta charset="utf-8"><title>${esc(p.name)} — ${T.sheet}</title><style>
      @page { size: A4 landscape; margin: 8mm; }
      * { box-sizing: border-box; margin: 0; }
      body { font: 11px/1.35 system-ui, sans-serif; color: #111; }
      .frame { border: 2.2px solid #111; padding: 8px; min-height: 190mm; display: flex; flex-direction: column; gap: 6px; }
      .plan { flex: 1; border: 1px solid #999; min-height: 120mm; display:flex; align-items:center; justify-content:center; }
      .plan svg { max-width: 100%; max-height: 128mm; }
      .cols { display: flex; gap: 8px; align-items: flex-start; }
      .cols > div { flex: 1; }
      h3 { font-size: 11px; margin: 2px 0 4px; border-bottom: 1px solid #111; }
      table { width: 100%; border-collapse: collapse; }
      td, th { border: 1px solid #555; padding: 2px 5px; text-align: left; font-size: 10px; }
      .legend div { display: flex; align-items: center; gap: 6px; padding: 1.5px 0; }
      .g { font-style: normal; display: inline-flex; width: 17px; height: 17px; border-radius: 50%; border: 1px solid #111; align-items: center; justify-content: center; font-size: 8.5px; font-weight: 700; flex: none; }
      /* титульный лист (заменил собой прежний .stamp внизу листа — тот же
         Объект/Адрес/Исполнитель/Дата, но отдельной первой страницей, плюс Заказчик/Площадь) */
      .titlepage { break-after: page; page-break-after: always; min-height: 190mm; border: 2.2px solid #111; padding: 20mm; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; }
      .titlepage .tpbadge { font-size: 40px; margin-bottom: 10px; }
      .titlepage h1 { font-size: 24px; margin-bottom: 4px; }
      .titlepage .tpsub { color: #555; margin-bottom: 22px; font-size: 13px; }
      .titlepage .tptable { border-collapse: collapse; }
      .titlepage .tptable th, .titlepage .tptable td { border: 1px solid #555; padding: 5px 16px; text-align: left; font-size: 12px; }
      .titlepage .tptable th { color: #555; font-weight: 600; white-space: nowrap; background: #f8fafc; }
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
      /* развёртки стен */
      .unfsec { break-before: page; page-break-before: always; margin-top: 6px; }
      .unfsec h3 { font-size: 12px; margin-bottom: 6px; }
      .unfgrid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
      .unfcard { border: 1px solid #999; padding: 4px 6px; break-inside: avoid; }
      .unfcard h4 { font-size: 9.5px; margin-bottom: 2px; }
      .unf { width: 100%; max-height: 160mm; }
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
      .schemebox { border: 1px solid #999; padding: 6px; overflow: auto; }
      .schemebox svg { max-width: 100%; height: auto; }
      .cd { display: inline-block; width: 10px; height: 10px; border-radius: 50%; margin-right: 5px; vertical-align: middle; }
    </style></head><body>
      ${buildTitlePage(p)}
      <div class="frame">
        <h3>${T.genplan}</h3>
        <div class="plan">${buildSvg(p)}</div>
      </div>
      <div class="unfsec"><h3>${T.specSheet}</h3>
        <div class="cols">
          <div><h3>${T.expl}</h3><table><tr><th>№</th><th>Помещение</th><th>S</th><th>Стены</th></tr>${expl}</table></div>
          <div><h3>${T.spec}</h3><table><tr><th></th><th>Тип</th><th>Кол-во</th></tr>${spec}</table></div>
          <div class="legend"><h3>${T.legend}</h3>${legendRows}</div>
        </div>
      </div>
      ${buildLayerPages(p)}
      ${buildCircuits(p)}
      ${buildUnfolds(p)}
      ${buildScheme(p)}
    </body></html>`;
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
      <div id="ep-plan-pdfpreview-box">${pdfScalePreview(p)}</div>
      <div class="ep-plan-srow ep-plan-sbtns">
        <button type="button" class="btn btn-primary ep-clickable" data-pxp-print>📄 Сформировать PDF</button>
      </div>`);
  }

  document.addEventListener("click", (e) => {
    if (!rooms() || !rooms().isActive()) return;
    if (e.target.closest("[data-plan-pdf]")) return sheetPdfScale();
    if (e.target.closest("[data-pxp-close]")) { rooms().closeSheet(); return; }
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
