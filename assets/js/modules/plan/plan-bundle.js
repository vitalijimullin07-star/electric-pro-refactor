/* Electric Pro V29 — «Проект квартиры»: РАЗНОС ПУЧКОВ ТРАСС НА ЭКРАНЕ (чистая геометрия).

   Физически линии идут в 2 см друг от друга (полосы routeOff/guideLaneOff) — так считаются
   метраж, штробы и проходки. Но на телефоне квартира шириной 9 м занимает ~400 px, то есть
   2 см — это меньше одного пикселя: пучок из восьми линий по коридору рисовался ОДНОЙ
   толстой полосой цвета последней линии, и понять, какая линия куда идёт, было нельзя
   (репорт пользователя: «каша», «грамотно отображать визуал трасс»).

   Здесь считается только ОТОБРАЖЕНИЕ: параллельные отрезки, идущие ближе читаемого шага,
   раздвигаются до него — как линии на схеме метро. Модель (route.points) не меняется вообще:
   смета, проходки, PDF-размеры, DXF и 3D читают её как раньше. Когда масштаб достаточно
   крупный и 2 см сами становятся читаемыми, сдвиг равен нулю и линии стоят ровно на своих
   физических местах.

   Правила:
   · раздвигаются только ОСЕВЫЕ отрезки (горизонталь/вертикаль), каждый сдвигается целиком
     перпендикулярно себе — прямые углы остаются прямыми, длины соседних отрезков просто
     меняются;
   · пучок = отрезки одной ориентации, которые перекрываются по длине и стоят ближе шага;
   · порядок линий в пучке сохраняется (кто был ближе к стене, тот и остаётся ближе);
   · у стены пучок растёт ОТ стены (крайняя к стене линия стоит на месте), посреди комнаты
     или коридора — симметрично вокруг своего места; в чужую стену пучок не заходит: шаг
     сжимается, пока лента не поместится;
   · отрезки одной линии, лежащие точно друг на друге, остаются вместе (это один кабельный
     ход, а не две линии);
   · концы трассы (прибор, щит) не двигаются: к сдвинутому отрезку ведёт короткая ступенька.

   Модуль без DOM и без обращения к проекту — на входе точки и стены, на выходе точки.
   Экспорт: EP.Plan.Bundle = { spread, toPhysical } */
(function () {
  "use strict";
  window.EP = window.EP || {};
  EP.Plan = EP.Plan || {};

  const AX = 0.5;        // см: отклонение, при котором отрезок ещё считается осевым
  const MIN_SEG = 1;     // см: короче — не отрезок, а стык (ступенька анкера и т.п.)
  const MIN_OVERLAP = 6; // см: меньшее перекрытие по длине — не «идут рядом», а «встретились»
  const SAME_C = 0.3;    // см: одна и та же полоса
  const WALL_GAP = 4;    // см: ближе к грани стены ленту не подпускаем
  const HUG = 0.6;       // пучок считается «у стены», если до неё заметно ближе, чем до другой

  // отрезки одной ориентации: c — постоянная координата, [lo, hi] — пробег вдоль
  function collect(routes) {
    const H = [], V = [];
    routes.forEach((r, ri) => {
      const pts = r.points || [];
      for (let i = 0; i < pts.length - 1; i++) {
        const a = pts[i], b = pts[i + 1], dx = b.x - a.x, dy = b.y - a.y;
        const ax = Math.abs(dx), ay = Math.abs(dy);
        if (ay < AX && ax >= MIN_SEG) H.push({ ri, si: i, c: (a.y + b.y) / 2, lo: Math.min(a.x, b.x), hi: Math.max(a.x, b.x), key: r.key });
        else if (ax < AX && ay >= MIN_SEG) V.push({ ri, si: i, c: (a.x + b.x) / 2, lo: Math.min(a.y, b.y), hi: Math.max(a.y, b.y), key: r.key });
      }
    });
    return { H, V };
  }

  // стены той же ориентации: { c — ось, half — полутолщина, lo, hi }
  function wallsOf(walls, horiz) {
    const out = [];
    (walls || []).forEach((w) => {
      const dx = Math.abs(w.b.x - w.a.x), dy = Math.abs(w.b.y - w.a.y);
      if (horiz ? (dy < 2 && dx >= 10) : (dx < 2 && dy >= 10)) {
        out.push(horiz
          ? { c: (w.a.y + w.b.y) / 2, half: (w.th || 10) / 2, lo: Math.min(w.a.x, w.b.x), hi: Math.max(w.a.x, w.b.x) }
          : { c: (w.a.x + w.b.x) / 2, half: (w.th || 10) / 2, lo: Math.min(w.a.y, w.b.y), hi: Math.max(w.a.y, w.b.y) });
      }
    });
    return out;
  }

  function find(par, i) { while (par[i] !== i) { par[i] = par[par[i]]; i = par[i]; } return i; }

  // сдвиги отрезков одной ориентации; пишет seg.d (см, вдоль оси, перпендикулярной отрезкам)
  function spreadAxis(segs, walls, gap) {
    const n = segs.length;
    if (!n) return;
    segs.sort((a, b) => a.c - b.c || a.lo - b.lo);
    const par = new Array(n);
    for (let i = 0; i < n; i++) { par[i] = i; segs[i].d = 0; }
    for (let i = 0; i < n; i++) {
      const a = segs[i];
      for (let j = i + 1; j < n; j++) {
        const b = segs[j];
        if (b.c - a.c >= gap) break;
        if (Math.min(a.hi, b.hi) - Math.max(a.lo, b.lo) >= MIN_OVERLAP) {
          const ra = find(par, i), rb = find(par, j);
          if (ra !== rb) par[rb] = ra;
        }
      }
    }
    const comps = new Map();
    for (let i = 0; i < n; i++) {
      const r = find(par, i);
      if (!comps.has(r)) comps.set(r, []);
      comps.get(r).push(segs[i]);
    }
    comps.forEach((list) => {
      if (list.length < 2) return;
      // места в пучке: по координате, затем по линии (разные линии на одной координате —
      // разные места; одна линия на одной координате — одно место)
      list.sort((a, b) => a.c - b.c || (a.key < b.key ? -1 : a.key > b.key ? 1 : 0));
      const slots = [];
      list.forEach((s) => {
        const last = slots[slots.length - 1];
        if (last && Math.abs(s.c - last.c) < SAME_C && last.key === s.key) last.segs.push(s);
        else slots.push({ c: s.c, key: s.key, segs: [s] });
      });
      const m = slots.length;
      if (m < 2) return;
      // желаемые места при полном шаге, от нижнего края
      const full = [0];
      for (let i = 1; i < m; i++) full.push(full[i - 1] + Math.max(slots[i].c - slots[i - 1].c, gap));
      const c1 = slots[0].c, cm = slots[m - 1].c, extra = full[m - 1] - (cm - c1);
      if (extra < 0.05) return;
      // ближайшие параллельные стены снизу и сверху (по перекрытию с пробегом пучка)
      let lo = Infinity, hi = -Infinity;
      list.forEach((s) => { if (s.lo < lo) lo = s.lo; if (s.hi > hi) hi = s.hi; });
      let faceLo = -Infinity, faceHi = Infinity, split = false;
      for (let i = 0; i < walls.length; i++) {
        const w = walls[i];
        if (Math.min(w.hi, hi) - Math.max(w.lo, lo) < MIN_OVERLAP) continue;
        if (w.c <= c1) { const f = w.c + w.half; if (f > faceLo) faceLo = f; }
        else if (w.c >= cm) { const f = w.c - w.half; if (f < faceHi) faceHi = f; }
        else split = true;                   // стена ВНУТРИ пучка: линии по разные её стороны
      }
      if (split) return;                     // такие не раздвигаем — уехали бы сквозь стену
      const dLo = c1 - faceLo, dHi = faceHi - cm;
      // куда растёт лента: 0 — от нижнего края вверх, 1 — от верхнего вниз, 0.5 — в обе стороны
      const side = dLo < dHi * HUG ? 0 : (dHi < dLo * HUG ? 1 : 0.5);
      // сжимаем шаг, пока лента не поместится между гранями стен. Край, который и так стоит
      // на месте (или уже ближе к стене, чем положено), ограничением не считается — иначе
      // трасса, физически прижатая к стене, запрещала бы раздвинуть весь пучок.
      const limLo = Math.min(c1, faceLo + WALL_GAP), limHi = Math.max(cm, faceHi - WALL_GAP);
      let t = 1, base = c1;
      for (; t > 0.01; t -= 0.125) {
        base = c1 - extra * t * side;
        const top = base + (cm - c1) + extra * t;
        if (base >= limLo - 0.01 && top <= limHi + 0.01) break;
      }
      if (t <= 0.01) return;
      slots.forEach((sl, i) => {
        const phys = sl.c - c1, want = phys + (full[i] - phys) * t;
        const d = base + want - sl.c;
        sl.segs.forEach((s) => { s.d = d; });
      });
    });
  }

  /* routes: [{ id, points:[{x,y}], key }]   key — линия (одинаковый key = один кабельный ход)
     opts:   { gap — читаемый шаг в САНТИМЕТРАХ плана (экранный шаг × см-на-пиксель),
               walls: [{ a, b, th }] }
     → Map(id → { pts — отображаемая ломаная, vpos — где оказалась каждая исходная вершина,
                  shift — сдвиг каждого исходного отрезка {x, y} }) */
  function spread(routes, opts) {
    const out = new Map();
    const gap = (opts && opts.gap) || 0;
    const list = (routes || []).filter((r) => r && r.points && r.points.length > 1);
    const sh = list.map((r) => { const a = new Array(r.points.length - 1); for (let i = 0; i < a.length; i++) a[i] = null; return a; });
    if (gap > 0 && list.length > 1) {
      const { H, V } = collect(list);
      const walls = (opts && opts.walls) || [];
      spreadAxis(H, wallsOf(walls, true), gap);
      spreadAxis(V, wallsOf(walls, false), gap);
      H.forEach((s) => { sh[s.ri][s.si] = { o: "H", d: s.d }; });
      V.forEach((s) => { sh[s.ri][s.si] = { o: "V", d: s.d }; });
    } else if (list.length) {
      const { H, V } = collect(list);
      H.forEach((s) => { sh[s.ri][s.si] = { o: "H", d: 0 }; });
      V.forEach((s) => { sh[s.ri][s.si] = { o: "V", d: 0 }; });
    }
    list.forEach((r, ri) => {
      const src = r.points, n = src.length, S = sh[ri];
      const vec = (s) => (!s || !s.d) ? { x: 0, y: 0 } : (s.o === "H" ? { x: 0, y: s.d } : { x: s.d, y: 0 });
      const shift = S.map(vec);
      const pts = [], vpos = new Array(n);
      const push = (q) => { const l = pts[pts.length - 1]; if (!l || Math.abs(l.x - q.x) > 0.01 || Math.abs(l.y - q.y) > 0.01) pts.push(q); };
      for (let j = 0; j < n; j++) {
        const p = src[j], sp = j > 0 ? S[j - 1] : null, sn = j < n - 1 ? S[j] : null;
        const vp = j > 0 ? shift[j - 1] : { x: 0, y: 0 }, vn = j < n - 1 ? shift[j] : { x: 0, y: 0 };
        if (j === 0) {                       // конец трассы стоит на месте, к сдвинутому отрезку — ступенька
          vpos[j] = { x: p.x, y: p.y }; push(vpos[j]);
          if (vn.x || vn.y) push({ x: p.x + vn.x, y: p.y + vn.y });
        } else if (j === n - 1) {
          if (vp.x || vp.y) push({ x: p.x + vp.x, y: p.y + vp.y });
          vpos[j] = { x: p.x, y: p.y }; push(vpos[j]);
        } else if (sp && sn && sp.o !== sn.o) { // прямой угол: пересечение двух сдвинутых прямых
          vpos[j] = { x: p.x + vp.x + vn.x, y: p.y + vp.y + vn.y }; push(vpos[j]);
        } else if (sp && sn) {               // продолжение по той же оси: разные сдвиги — ступенька
          vpos[j] = { x: p.x + vp.x, y: p.y + vp.y }; push(vpos[j]);
          if (Math.abs(vp.x - vn.x) > 0.01 || Math.abs(vp.y - vn.y) > 0.01) push({ x: p.x + vn.x, y: p.y + vn.y });
        } else {                             // рядом косой отрезок — он принимает сдвиг осевого соседа
          const v = sp ? vp : vn;
          vpos[j] = { x: p.x + v.x, y: p.y + v.y }; push(vpos[j]);
        }
      }
      out.set(r.id, { pts, vpos, shift });
    });
    return out;
  }

  /* Точка касания на ОТОБРАЖАЕМОЙ трассе → та же точка на физической: правка трассы
     (тяга излома, тяга участка) работает с моделью, а палец попадает в то, что нарисовано. */
  function toPhysical(disp, srcPts, w, vertexTol) {
    if (!disp || !srcPts || srcPts.length < 2) return w;
    let bj = -1, bd = vertexTol || 0;
    for (let j = 0; j < disp.vpos.length; j++) {
      const q = disp.vpos[j], d = Math.sqrt((q.x - w.x) * (q.x - w.x) + (q.y - w.y) * (q.y - w.y));
      if (d <= bd) { bd = d; bj = j; }
    }
    if (bj >= 0) return { x: w.x - (disp.vpos[bj].x - srcPts[bj].x), y: w.y - (disp.vpos[bj].y - srcPts[bj].y) };
    let bi = -1, best = Infinity;
    for (let i = 0; i < srcPts.length - 1; i++) {
      const a = { x: srcPts[i].x + disp.shift[i].x, y: srcPts[i].y + disp.shift[i].y };
      const b = { x: srcPts[i + 1].x + disp.shift[i].x, y: srcPts[i + 1].y + disp.shift[i].y };
      const dx = b.x - a.x, dy = b.y - a.y, L2 = dx * dx + dy * dy;
      let t = L2 ? ((w.x - a.x) * dx + (w.y - a.y) * dy) / L2 : 0;
      t = t < 0 ? 0 : t > 1 ? 1 : t;
      const qx = a.x + dx * t, qy = a.y + dy * t, d = (qx - w.x) * (qx - w.x) + (qy - w.y) * (qy - w.y);
      if (d < best) { best = d; bi = i; }
    }
    return bi < 0 ? w : { x: w.x - disp.shift[bi].x, y: w.y - disp.shift[bi].y };
  }

  EP.Plan.Bundle = { spread, toPhysical };
})();
