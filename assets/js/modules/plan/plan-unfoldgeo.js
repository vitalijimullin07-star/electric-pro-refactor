/* Electric Pro V29 — ОБЩАЯ геометрия развёртки стены.
   Развёрток две: живая (plan-unfold.js, строит SVG-узлы через DOM) и печатная
   (plan-export.js, собирает СТРОКУ для отдельного документа). Они обязаны показывать
   одно и то же, но отрисовку разделить нельзя — разные механизмы вывода. Поэтому сюда
   вынесена вся ЧИСТАЯ математика раскладки, а рисование осталось у каждой своё; тот же
   приём, что у EP.Plan.Render.deviceFace (возвращает примитивы, а не узлы).

   До этого пять функций были продублированы файл-в-файл, и синхронность держалась вручную.
   По истории модуля именно здесь уже расходились: штробы считали габарит блока по легаси-
   раскладке, а символ — по реальным рамкам, и штробы «не доходили до точек»; размеры в PDF
   мерились от левого угла вместо ближайшего; проёмы в печатной не рисовались вовсе.
   На момент выноса копии опять разъехались: подпись высоты обходила препятствия по рамке
   15×9 в живой и 14×8 в печатной.

   Все размеры — в САНТИМЕТРАХ проекта. Параметр k — масштаб символов своей развёртки
   (S.sym у живой, pdfScale у печатной): от него зависят только «экранные» величины
   (кружок поста, отступы подписей), физические габариты в режиме «1:1» от него не зависят. */
(function () {
  "use strict";
  const EP = (window.EP = window.EP || {});
  EP.Plan = EP.Plan || {};

  // Рамка прибора в режиме «1:1» — из единого источника габаритов (plan-render.js).
  // Фолбэк 8.4 см = 84 мм, одинарная рамка по datasheet.
  function frameW(n) { const R = EP.Plan.Render; return R && R.frameWcm ? R.frameWcm(n) : 8.4; }
  function frameH() { const R = EP.Plan.Render; return R && R.frameHcm ? R.frameHcm() : 8.4; }

  /* Раскладка блока постов. ЕЮ ОБЯЗАНЫ пользоваться и символ, и штроба, и AABB подписей:
     раньше расхождение этих трёх мест и давало «штробы не доходят до точек».
     vert (el.blockVert) — посты столбиком по высоте: развёртка это вид фасада, поэтому
     вертикальный блок здесь именно по высоте, а не поворот графики.
     real (settings.realScale) — рамка настоящей ширины (84/155/226/300/368 мм) и высоты
     84 мм с равным шагом постов; иначе прежняя «экранная» раскладка 18k на пост. */
  function blockGeom(el, o) {
    const k = (o && o.k) || 1, real = !!(o && o.real), H = (o && o.H) || 0;
    const items = (el.params && el.params.items) || ["socket"];
    const vert = !!el.blockVert;
    const along = real ? frameW(items.length) : items.length * 18 * k + 6 * k;
    const across = real ? frameH() : 24 * k;
    const step = real ? along / items.length : 18 * k;
    const inset = real ? 0 : 3 * k;
    const bw = vert ? across : along, bh = vert ? along : across;
    const x = el.offset, y = H - el.height;
    return {
      items, vert, bw, bh, step, inset,
      cell: (i) => (vert
        ? { cx: x, cy: y - bh / 2 + inset + step * i + step / 2 }
        : { cx: x - bw / 2 + inset + step * i + step / 2, cy: y }),
      rect: (i) => (vert
        ? { x: x - bw / 2, y: y - bh / 2 + inset + step * i, width: bw, height: step }
        : { x: x - bw / 2 + inset + step * i, y: y - bh / 2, width: step, height: bh })
    };
  }

  /* Внутренние грани стены: размер поста меряется от них, а не от оси — в печатной
     развёртке когда-то мерилось от x=0, и цифры были больше живых на полтолщины стены. */
  function insideEdges(L, th) {
    return { inA: Math.min(th / 2, L / 2), inB: Math.max(L - th / 2, L / 2) };
  }
  // Ближайший внутренний угол: до этого размер ВСЕГДА тянулся к левому, и у поста
  // у правого края линейка шла через всю стену поверх остальных постов.
  function cornerOf(x, inA, inB) { return x - inA <= inB - x ? inA : inB; }

  // Полуразмеры символа поста — для антиналожения подписей.
  function symHalf(el, o) {
    const k = (o && o.k) || 1, real = !!(o && o.real);
    if (el.type === "block") { const bg = blockGeom(el, o); return { hw: bg.bw / 2, hh: bg.bh / 2 }; }
    return real ? { hw: frameW(1) / 2, hh: frameH() / 2 } : { hw: 13 * k, hh: 13 * k };
  }

  /* Препятствия для подписи высоты: сами посты, имена линий QF над ними и подписи
     расстояния от угла. Раньше учитывались только посты, и подпись высоты садилась
     ровно на чужое имя QF или на чужую цифру расстояния (репорт со скриншотом).
     circuitOf — функция поиска линии элемента: у живой и печатной она своя. extra —
     дополнительные прямоугольники (подписи штроб, placeChaseLabels): их обходят и цифра
     «от угла», и подпись высоты. */
  function labelBoxes(els, o, circuitOf, extra) {
    const k = (o && o.k) || 1, H = (o && o.H) || 0;
    const { inA, inB } = o;
    const elBoxes = els.map((e) => {
      const s = symHalf(e, o);
      return { x: e.offset, y: H - e.height, hw: s.hw, hh: s.hh };
    });
    const qfBoxes = els.map((e) => {
      const cc = circuitOf ? circuitOf(e) : null;
      if (!cc) return null;
      return { x: e.offset, y: H - e.height - 18 * k, hw: Math.max(14, String(cc.name || "").length * 4.2) * k, hh: 7 * k };
    }).filter(Boolean);
    // цифра «от угла» — сразу ИТОГОВАЯ позиция (offLabelPos), по ней же обходит её подпись
    // высоты: раньше препятствием считалась «середина над линией», а сама цифра в развёртке
    // могла стоять выше (обход чужого поста), и подпись высоты ложилась прямо на неё.
    // offPos — по индексу точки (null — размера нет), y без ручного сдвига линии (uh):
    // в живой развёртке горизонталь сдвигается своим transform, в печатной — прибавляется.
    const ext = extra || [];
    const blockers = elBoxes.concat(qfBoxes, ext);
    const offPos = els.map((e) => {
      const x = e.offset, y = H - e.height, c = cornerOf(x, inA, inB);
      if (Math.abs(x - c) <= 2) return null;
      const uh = Number((e.uDim || {}).h) || 0;
      // линию двигали руками — цифра стоит ровно над ней, как поставили, без автообхода
      return Object.assign(uh ? { x: (c + x) / 2, y: y - 3 * k } : offLabelPos(x, y, c, blockers, k), { uh });
    });
    const offBoxes = offPos.filter(Boolean).map((o) => ({ x: o.x, y: o.y + o.uh, hw: 14 * k, hh: 8 * k }));
    // qfBoxes/offBoxes отдаются отдельно: цифра «от угла» обходит только посты и имена QF
    // (её собственные offBoxes в препятствия себе не годятся), а подпись высоты — всё разом.
    return { elBoxes, qfBoxes, offBoxes, offPos, obstacles: elBoxes.concat(qfBoxes, offBoxes, ext) };
  }

  /* Где стоит цифра «от угла» (размер от ближайшего внутреннего угла до поста): середина
     выноски над линией; занято чужим постом/именем линии — выше (не больше двух шагов,
     иначе цифра уедет от своей выноски), потом под линией, потом СНАРУЖИ засечки угла — как
     в черчении, когда размер не помещается между выносными (короткая выноска у самого угла:
     середина её лежит под самим постом, и над ней — его же имя линии; «25» налезало на
     «Int1»). Нигде не свободно — середина над линией, как было. */
  function offLabelPos(x, hy, c0, blockers, k) {
    const lx = (c0 + x) / 2;
    const half = String(Math.round(Math.abs(x - c0))).length * 2.8 * k + 1.5 * k; // полширины числа (шрифт 9.5)
    const bad = (px, py) => blockers.some((o) => Math.abs(px - o.x) < 12 * k + o.hw && Math.abs(py - o.y) < 6 * k + o.hh);
    const out = x > c0 ? c0 - half - 3 * k : c0 + half + 3 * k;
    const cand = [[lx, hy - 3 * k], [lx, hy - 10 * k], [lx, hy - 17 * k], [lx, hy + 11 * k], [out, hy - 3 * k]];
    for (let i = 0; i < cand.length; i++) if (!bad(cand[i][0], cand[i][1])) return { x: cand[i][0], y: cand[i][1] };
    return { x: lx, y: hy - 3 * k };
  }

  /* Позиция подписи высоты: первый кандидат (справа/слева/выше/ниже), чей прямоугольник
     не задевает чужие. Если свободного нет — справа, как было. */
  function placeHLabel(idx, elBoxes, obstacles, k) {
    const b = elBoxes[idx], lw = 15 * k, lh = 9 * k;
    const hits = (lx, ly) => obstacles.some((o) => o !== b && Math.abs(lx - o.x) < lw + o.hw && Math.abs(ly - o.y) < lh + o.hh);
    const cand = [
      [b.x + b.hw + lw + 2 * k, b.y], [b.x - b.hw - lw - 2 * k, b.y],
      [b.x + b.hw + lw + 2 * k, b.y - b.hh - lh], [b.x - b.hw - lw - 2 * k, b.y - b.hh - lh],
      [b.x, b.y - b.hh - lh - 2 * k], [b.x, b.y + b.hh + lh + 2 * k]
    ];
    for (let i = 0; i < cand.length; i++) if (!hits(cand[i][0], cand[i][1])) return { x: cand[i][0], y: cand[i][1] };
    return { x: b.x + b.hw + lw + 2 * k, y: b.y };
  }

  // Вид штробы по слою точки и её оформление (цвет + подпись сечения из настроек проекта).
  const CHASE_COL = { power: "#f59e0b", light: "#facc15", lv: "#38bdf8", warm: "#fb7185" };
  function chaseKindOf(layer) {
    if (layer === "warm") return "warm";
    if (layer === "lv" || layer === "tv" || layer === "cctv") return "lv";
    return layer === "light" ? "light" : "power";
  }
  function chaseLabels(p) {
    const st = (p && p.settings) || {};
    const std = `${Math.round(st.chaseW || 25)}×${Math.round(st.chaseH || 30)}`;
    return { power: std, light: std, lv: std, warm: `${Math.round(st.tpChaseW || 50)}×${Math.round(st.tpChaseH || 50)}` };
  }

  // Ёмкость штробы 25×30 по кабелю 2.5 — та же таблица пула, что у сметы (capOf в plan-calc.js)
  function chaseCap(p) {
    const st = (p && p.settings) || {};
    const key = Math.round(st.chaseW || 25) + "x" + Math.round(st.chaseH || 30);
    const PE = window.EP && window.EP.PoolEngine;
    const t = PE && PE.DEFAULTS && PE.DEFAULTS.capacity && PE.DEFAULTS.capacity[key];
    const byShape = (t && (t.round || t.flat)) || { "2.5": 2 };
    return Math.max(1, Number(byShape["2.5"]) || 2);
  }

  /* ШТРОБЫ ДО ТОЧЕК И ЩИТА ЭТОЙ СТЕНЫ — ОДИН список на живую и печатную развёртку (аудит цепей,
     пакет 5). Раньше обе развёртки считали штробы каждая у себя и иначе, чем смета: (1) к щиту
     штроба не рисовалась вовсе, а в смете это самый длинный её кусок; (2) параллельные штробы
     (шлейф: вход и выход в одном подрозетнике, два кабеля сверх ёмкости) рисовались одной линией;
     (3) штроба шла и к точкам «было» и к точкам без трассы, которых в смете нет; (4) силовая
     штроба блока шла в крайнюю левую розетку, хотя трасса — и выбор «Штроба к посту» в редакторе
     блока — заходят в G.blockEntryIndex. Теперь правило то же, что у сметы (calcByRoutes):
     кабелей в точке / ёмкость штробы = число штроб (n, подпись «×n»), «было» и точки без трассы
     (когда трассы вообще построены) — без штробы, у щита — по поверхности прихода кабелей до
     корпуса (RT.panelChaseVert), силовая и слаботочка раздельно.
     opts: { H, blockGeom(el) → {cell(idx)} }. Возвращает [{ x, y0, y1, kind, n }]: x — вдоль
     стены, y — от потолка вниз (0 потолок, H пол). */
  function chases(p, w, els, opts) {
    const G = EP.Plan.Geometry, RT = EP.Plan.Routes;
    const H = opts.H, bgOf = opts.blockGeom;
    const fp = G.floorScoped ? G.floorScoped(p) : p;
    const routes = fp.routes || [];
    const anyRoutes = routes.length > 0;
    const deg = {}, blkR = {};
    routes.forEach((r) => {
      deg[r.fromId] = (deg[r.fromId] || 0) + 1;
      if (r.toId) deg[r.toId] = (deg[r.toId] || 0) + 1;
      const id = String(r.fromId || "");
      if (id.indexOf("blk:") === 0) { const parts = id.slice(4).split("#"); (blkR[parts[0]] = blkR[parts[0]] || {})[parts[1]] = r; }
    });
    const cap = chaseCap(p);
    const surfFor = (layer, el2) => {
      if (el2 && el2.type !== "block" && RT && RT.surfaceOfEl) return RT.surfaceOfEl(p, el2);
      return G.routeSurface ? G.routeSurface(p, layer, el2) : (p.settings.routeType === "floor" ? "floor" : "ceiling");
    };
    const isFloor = (layer, el2) => surfFor(layer, el2) === "floor";
    const y0Of = (layer, el2) => (isFloor(layer, el2) ? H : 0);
    const out = [];
    const push = (x, y0, y1, kind, n) => { if (Math.abs(y1 - y0) >= 1) out.push({ x, y0, y1, kind, n: Math.max(1, n || 1) }); };
    const nOf = (id) => Math.max(1, Math.ceil((deg[id] || 0) / cap));
    (els || []).forEach((el2) => {
      if (el2.status === "existing") return;                    // «было» — уже стоит, не штробим
      const own = deg[el2.id] > 0, lvOwn = blkR[el2.id] || null;
      if (anyRoutes && !own && !lvOwn) return;                   // трассы к точке нет — и штробы нет
      const xx = el2.offset, yy = H - el2.height;
      if (el2.type === "block") {
        const bg = bgOf(el2);
        const ent = G.blockChaseEntries ? G.blockChaseEntries(el2) : [];
        const entry = G.blockEntryIndex ? G.blockEntryIndex(el2) : 0;
        ent.forEach((en) => {
          if (en.kind === "lv") {
            // свой кабель поста к роутеру (пакет 3) — штроба к посту, если кабель есть
            if (anyRoutes && !(lvOwn && lvOwn[String(en.idx)])) return;
            const r = lvOwn && lvOwn[String(en.idx)];
            const c = bg.cell(en.idx);
            push(c.cx, r ? (r.routeType === "floor" ? H : 0) : y0Of("lv", el2), c.cy, "lv", 1);
            return;
          }
          if (anyRoutes && !own) return;
          // силовая — в пост, куда заходит трасса (выбор «Штроба к посту» в редакторе блока)
          const idx = en.kind === "power" ? entry : en.idx;
          const c = bg.cell(idx);
          const lay = en.kind === "light" ? "light" : "power";
          // силовая — по поверхности СВОЕЙ построенной трассы (как в смете), свет — по группе
          const fl = (en.kind === "power" && own && RT && RT.surfaceOfEl) ? RT.surfaceOfEl(p, el2) === "floor" : isFloor(lay, el2);
          // выключатель в блоке при разводке по полу — штроба тянется до потолка (дальше к лампе)
          const y0 = en.kind === "light" ? 0 : (fl ? H : 0);
          push(c.cx, y0, c.cy, en.kind, en.kind === "power" ? nOf(el2.id) : 1);
        });
      } else if (el2.layer === "warm") {
        // ТП: подача обычной штробой к термостату + ОТДЕЛЬНО всегда 50×50 от термостата в пол
        push(xx, y0Of("warm", el2), yy, "power", 1);
        if (el2.height > 1) push(xx, yy, H, "warm", 1);
      } else {
        const feeder = RT && RT.isFeeder && RT.isFeeder(p, el2);
        const kind = feeder ? "light" : chaseKindOf(el2.layer);
        const lay = feeder ? "light" : el2.layer;
        // выключатель при разводке по полу: кабель поднимается к нему снизу и уходит дальше к
        // свету — штроба на всю высоту стены (смета так и считает: pointVert = потолок)
        if (el2.type === "switch" && isFloor(lay, el2)) push(xx, H, 0, kind, nOf(el2.id));
        else push(xx, y0Of(lay, el2), yy, kind, kind === "lv" ? 1 : nOf(el2.id));
      }
    });
    // щит этой стены: штроба от поверхности до корпуса (сверху до верха, снизу до низа),
    // силовые и слаботочные кабели раздельно — как в смете
    const box = G.panelBoxCm ? G.panelBoxCm(p) : { w: 39.5, h: 43.5 };
    (fp.panels || []).forEach((pn) => {
      const c = G.panelOnWall(p, w, pn);
      if (!c) return;
      const px = c.t * w.len, bottom = G.panelBottom ? G.panelBottom(p, pn) : 150;
      const rs = routes.filter((r) => r.toPanel && !r.toRiser && r.toId === pn.id);
      ["ceiling", "floor"].forEach((sf) => {
        const inSf = rs.filter((r) => (r.routeType === "floor" ? "floor" : "ceiling") === sf);
        if (!inSf.length) return;
        const lvN = inSf.filter((r) => r.layer === "lv" || r.layer === "tv" || r.layer === "cctv").length, powN = inSf.length - lvN;
        const y0 = sf === "floor" ? H : 0;
        const y1 = sf === "floor" ? H - bottom : H - bottom - box.h;
        const both = lvN > 0 && powN > 0, dx = both ? box.w / 4 : 0;
        if (powN > 0) push(px - dx, y0, y1, "power", Math.ceil(powN / cap));
        if (lvN > 0) push(px + dx, y0, y1, "lv", Math.ceil(lvN / cap));
      });
    });
    return out;
  }
  // подпись штробы: сечение и, если штроб несколько параллельно, «×n»
  function chaseText(p, kind, n) {
    const t = chaseLabels(p)[kind] || "";
    return t && n > 1 ? t + " ×" + n : t;
  }

  /* ПОДПИСИ СЕЧЕНИЯ ШТРОБ — одно размещение на обе развёртки (аудит цепей, пакет 6). Раньше
     каждая развёртка ставила подпись у начала штробы без оглядки на соседей: у короткой штробы
     (коробка под потолком — 20 см) подпись уходила под значок поста, её закрывали цифра высоты
     и цифра «от угла» — подписи штроб в обходе подписей не участвовали вовсе. Кандидаты: как
     было (у начала штробы), дальше по штробе, правее (мимо значка и имени линии), за линией
     потолка/пола; первый, что не задевает blockers (значки постов, имена линий) и уже
     поставленные подписи. Такое же сечение рядом — один раз (как было: штробы блока).
     Возвращает [{ txt, kind, x, y, box }] — box отдаётся в labelBoxes(..., extra), и цифры
     размеров и высот обходят подпись. x — левый край текста (text-anchor start). */
  function placeChaseLabels(p, list, k, blockers, H) {
    const out = [];
    (list || []).forEach((c) => {
      const txt = chaseText(p, c.kind, c.n);
      if (!txt) return;
      const down = c.y1 > c.y0;                       // от потолка вниз (иначе от пола вверх)
      const yDef = c.y0 + (down ? 12 * k : -6 * k);
      const tw = txt.length * 4.6 * k;                // ширина текста (шрифт 8)
      const lw2 = Math.max(22, tw);
      if (out.some((l) => l.txt === txt && Math.abs(l.cx - c.x) < lw2 && Math.abs(l.yDef - yDef) < 9 * k)) return;
      const boxAt = (x, y) => ({ x: x + tw / 2, y: y - 3 * k, hw: tw / 2 + k, hh: 4.5 * k }); // 4.5: соседний ряд через 10 не «касается» из-за округления
      const all = (blockers || []).concat(out.map((l) => l.box));
      const hits = (b) => all.some((o) => Math.abs(b.x - o.x) < b.hw + o.hw && Math.abs(b.y - o.y) < b.hh + o.hh);
      const dir = down ? 1 : -1, yOut = down ? -4 * k : (H || 0) + 10 * k;
      const cand = [[c.x + 3 * k, yDef], [c.x + 3 * k, yDef + 10 * k * dir], [c.x + 3 * k, yDef + 20 * k * dir],
        [c.x + 16 * k, yDef], [c.x + 26 * k, yDef], [c.x + 3 * k, yOut], [c.x + 16 * k, yOut], [c.x - 3 * k - tw, yOut]];
      let pick = null;
      for (let i = 0; i < cand.length && !pick; i++) { const b = boxAt(cand[i][0], cand[i][1]); if (!hits(b)) pick = { x: cand[i][0], y: cand[i][1], box: b }; }
      if (!pick) pick = { x: c.x + 3 * k, y: yDef, box: boxAt(c.x + 3 * k, yDef) };
      out.push({ txt, kind: c.kind, cx: c.x, yDef, x: pick.x, y: pick.y, box: pick.box });
    });
    return out;
  }

  EP.Plan.UnfoldGeo = {
    frameW, frameH, blockGeom, insideEdges, cornerOf, symHalf,
    labelBoxes, offLabelPos, placeHLabel, CHASE_COL, chaseKindOf, chaseLabels, chaseCap, chases, chaseText, placeChaseLabels
  };
})();
