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
     circuitOf — функция поиска линии элемента: у живой и печатной она своя. */
  function labelBoxes(els, o, circuitOf) {
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
    const offBoxes = els.map((e) => {
      const x = e.offset, y = H - e.height, c = cornerOf(x, inA, inB);
      if (Math.abs(x - c) <= 2) return null;
      return { x: (c + x) / 2, y: y - 3 * k, hw: 14 * k, hh: 8 * k };
    }).filter(Boolean);
    // qfBoxes/offBoxes отдаются отдельно: цифра «от угла» обходит только посты и имена QF
    // (её собственные offBoxes в препятствия себе не годятся), а подпись высоты — всё разом.
    return { elBoxes, qfBoxes, offBoxes, obstacles: elBoxes.concat(qfBoxes, offBoxes) };
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

  EP.Plan.UnfoldGeo = {
    frameW, frameH, blockGeom, insideEdges, cornerOf, symHalf,
    labelBoxes, placeHLabel, CHASE_COL, chaseKindOf, chaseLabels
  };
})();
