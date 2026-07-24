/* Electric Pro V29 — Проект квартиры: отрисовка сцены (Слой 1).
   Рисует модель на слоях холста: подложка, комнаты (стены, номера, размеры),
   черновик рисования, рулетка. Подписи масштабируются под экран (читаемы
   на любом зуме). draw() — при изменении модели, drawScaled() — при зуме/пане. */
(() => {
  "use strict";
  window.EP = window.EP || {};
  const NS = "http://www.w3.org/2000/svg";

  const CFG = {
    labelPx: 12,        // размер подписи на экране, px
    namePx: 13,
    wallPx: 3,          // толщина линии стены на экране, px
    pointPx: 6,         // маркер точки черновика, px
    labelOffsetPx: 14,  // отступ подписи от стены, px
    // Level-of-detail подписей (порог — см в одном экранном пикселе, k=cmPerPx):
    // на отдалении (k больше порога) детальные подписи скрываются — иначе на
    // проекте из многих комнат вид «вся квартира» превращался в сплошную кашу
    // из наслаивающихся цифр (пойман полным визуальным тестом на 30 комнатах).
    // Имена комнат НЕ скрываются никогда — это ориентир на обзорном виде.
    lodDimK: 3.0,       // выше — скрыть размерные цепочки, «N · длина» стен, h=NN
    lodQfK: 4.5         // выше — скрыть ещё и QF-имена над точками, «N мод» щита
  };
  // кэш собранного <g> со стенами/масками/проёмами/балками/пустотами/лентой на
  // canvas (см. buildWalls() внутри drawScaled) — WeakMap, не свойство на canvas,
  // чтобы не полагаться на форму объекта canvas (в т.ч. в тестовом fakeCanvas())
  const wallsCache = new WeakMap();

  function el(tag, attrs, text) {
    const n = document.createElementNS(NS, tag);
    if (attrs) for (const k in attrs) n.setAttribute(k, attrs[k]);
    if (text != null) n.textContent = text;
    return n;
  }
  const clear = (g) => { while (g.firstChild) g.removeChild(g.firstChild); };
  // материал стены/перегородки -> css-класс (цвет/штрих)
  const MATMAP = { "Бетон": " mat-concrete", "Кирпич": " mat-brick", "Панель": " mat-panel", "Мягкий": " mat-soft", "Газоблок": " mat-block", "Пеноблок": " mat-block", "ГКЛ": " mat-gkl", "ПГП": " mat-pgp", "Дерево": " mat-wood" };
  const MATCLASS = (m) => MATMAP[m] || " mat-concrete";
  // чертёжная штриховка по материалу: бетон/кирпич/блоки — диагональ,
  // панель/дерево — крест, ГКЛ/ПГП/мягкий — пунктир
  const HATCHMAP = { "Бетон": "diag", "Кирпич": "diag", "Газоблок": "diag", "Пеноблок": "diag", "Панель": "cross", "Дерево": "cross", "ГКЛ": "dash", "ПГП": "dash", "Мягкий": "dash" };
  const HATCH = (m) => "url(#ep-hatch-" + (HATCHMAP[m] || "diag") + ")";
  // паттерны в userSpaceOnUse: штриховка соседних комнат совпадает по фазе —
  // общая стена (полосы внахлёст) выглядит ОДНОЙ стеной, без двойной толщины
  function ensureDefs(canvas) {
    const svg = canvas.svg;
    if (svg.querySelector("#ep-plan-defs")) return;
    const defs = el("defs", { id: "ep-plan-defs" });
    const mk = (id, d) => {
      const p = el("pattern", { id, patternUnits: "userSpaceOnUse", width: 14, height: 14 });
      p.appendChild(el("path", { d, class: "ep-plan-hatchln", fill: "none" }));
      defs.appendChild(p);
    };
    mk("ep-hatch-diag", "M-3 17 L17 -3 M-10 10 L10 -10 M4 24 L24 4");
    mk("ep-hatch-cross", "M-3 17 L17 -3 M-3 -3 L17 17");
    mk("ep-hatch-dash", "M0 4 L6 4 M8 11 L14 11");
    svg.insertBefore(defs, svg.firstChild);
  }
  const layerOn = (project, id) => {
    const l = (project.layers || []).find((x) => x.id === id);
    return !l || l.visible !== false;
  };

  // ---------- условные обозначения по ГОСТ 21.210 ----------
  // розетка — полукруг со штрихом; выключатель — кружок с «крючком»; светильник —
  // круг с крестом; ТП — змейка в рамке; вывод — точка с волнистым хвостиком провода.
  // Возвращает false, если для типа нет ГОСТ-символа (тогда рисуется базовый кружок с буквой).
  function drawGostEl(grp, elem, cx, cy, rot, dp, k, sw, col) {
    const t = elem.type;
    if (t !== "socket" && t !== "tv" && t !== "internet" && t !== "ac" && t !== "switch" && t !== "light" && t !== "warmfloor" && t !== "output" && t !== "output24") return false;
    const sub = el("g", { class: "ep-plan-gost", stroke: col, transform: `translate(${cx} ${cy})` + (rot ? ` rotate(${rot})` : "") });
    const lw = sw * 0.85;
    // локальный знак «внутрь комнаты» после поворота вдоль стены
    let sgn = 1;
    if (dp && dp.nrm) {
      const rad = (rot || 0) * Math.PI / 180;
      sgn = (-Math.sin(rad) * dp.nrm.x + Math.cos(rad) * dp.nrm.y) >= 0 ? 1 : -1;
    }
    const ln = (x0, y0, x1, y1, w2) => sub.appendChild(el("line", { x1: x0, y1: y0, x2: x1, y2: y1, "stroke-width": w2 || lw }));
    if (t === "socket" || t === "tv" || t === "internet" || t === "ac") {
      const r = 8 * k;
      sub.appendChild(el("path", { d: `M ${-r} 0 A ${r} ${r} 0 0 ${sgn > 0 ? 1 : 0} ${r} 0`, fill: "none", "stroke-width": lw }));
      ln(-r, 0, r, 0);
      ln(0, sgn * r, 0, sgn * (r + 6 * k)); // штрих от вершины внутрь комнаты
      if (t !== "socket") sub.appendChild(el("text", { x: 0, y: sgn * (r + 11 * k), "font-size": 7 * k, "text-anchor": "middle", "dominant-baseline": "central", class: "ep-plan-gosttxt", fill: col, stroke: "none" }, t === "tv" ? "TV" : t === "internet" ? "И" : "К"));
    } else if (t === "switch") {
      sub.appendChild(el("circle", { cx: 0, cy: 0, r: 3 * k, fill: col, "stroke-width": lw }));
      ln(0, 0, 5 * k, sgn * 9 * k);
      ln(5 * k, sgn * 9 * k, 8.5 * k, sgn * 7 * k); // «крючок» — клавиша
    } else if (t === "light") {
      const r = 7 * k, c = r * Math.SQRT1_2;
      sub.appendChild(el("circle", { cx: 0, cy: 0, r, fill: "none", "stroke-width": lw }));
      ln(-c, -c, c, c); ln(-c, c, c, -c); // ⊗
    } else if (t === "warmfloor") {
      const wv = 10 * k, hv = 8 * k;
      sub.appendChild(el("rect", { x: -wv, y: -hv, width: wv * 2, height: hv * 2, fill: "none", "stroke-width": lw }));
      sub.appendChild(el("path", { d: `M ${-wv + 3 * k} ${hv - 2 * k} V ${-hv + 2 * k} H ${-wv + 8 * k} V ${hv - 2 * k} H ${-wv + 13 * k} V ${-hv + 2 * k} H ${-wv + 18 * k} V ${hv - 2 * k}`, fill: "none", "stroke-width": lw * 0.8 }));
    } else if (t === "output" || t === "output24") {
      // просто точка + короткий волнистый хвостик (свободный конец провода) — без рамки
      const rd = 2.2 * k, len = 10 * k, amp = 2.6 * k;
      sub.appendChild(el("circle", { cx: 0, cy: 0, r: rd, fill: col, "stroke-width": 0 }));
      sub.appendChild(el("path", {
        d: `M 0 ${sgn * rd} Q ${amp} ${sgn * (rd + len * 0.28)} 0 ${sgn * (rd + len * 0.55)} Q ${-amp} ${sgn * (rd + len * 0.82)} 0 ${sgn * (rd + len)}`,
        fill: "none", "stroke-width": lw * 0.85
      }));
    }
    grp.appendChild(sub);
    return true;
  }

  // Стиль «Дизайн» (как на профессиональном чертеже, скрины пользователя): рамка-квадрат
  // с иконкой прибора + короткая выноска к точке-«плагу» на стене. Цвет рамки = цвет линии
  // QF (col). Рамка НЕ поворачивается вдоль стены — символ всегда стоит вертикально (как в
  // проф. плане), выноска сама тянется к нужной точке стены. Возвращает false для типов,
  // у которых своя отрисовка (распайка/блок).
  function drawDesignEl(grp, elem, pt, cx, cy, k, sw, col, glyph) {
    if (elem.type === "junction" || elem.type === "block") return false;
    const lw = sw * 0.7;
    // выноска к стене — только у настенных (у свободных pt совпадает с маркером)
    if (pt && pt.wall && (Math.abs(pt.x - cx) > 0.5 || Math.abs(pt.y - cy) > 0.5)) {
      grp.appendChild(el("line", { x1: pt.x, y1: pt.y, x2: cx, y2: cy, class: "ep-plan-leader", "stroke-width": lw }));
      grp.appendChild(el("circle", { cx: pt.x, cy: pt.y, r: 2.6 * k, class: "ep-plan-walldot" }));
    }
    const s = 11 * k;
    grp.appendChild(el("rect", { x: cx - s, y: cy - s, width: s * 2, height: s * 2, rx: 3 * k, fill: col, class: "ep-plan-designframe", "stroke-width": lw }));
    grp.appendChild(el("text", { x: cx, y: cy, "font-size": 9 * k, "text-anchor": "middle", "dominant-baseline": "central", class: "ep-plan-elglyph" }, glyph));
    return true;
  }

  // ---------- статичная часть: подложка + заливки комнат ----------
  function draw(canvas, project, ui) {
    const G = EP.Plan.Geometry;
    ensureDefs(canvas);
    clear(canvas.layers.underlay);
    clear(canvas.layers.rooms);
    if (!project) { drawScaled(canvas, project, ui); return; }

    const u = project.underlay;
    if (u && u.imageDataUri && u.nw && u.nh) {
      const img = el("image", {
        x: u.x || 0, y: u.y || 0,
        width: u.nw * u.scale, height: u.nh * u.scale,
        opacity: u.opacity == null ? 0.5 : u.opacity,
        preserveAspectRatio: "none"
      });
      img.setAttribute("href", u.imageDataUri);
      canvas.layers.underlay.appendChild(img);
    }

    (project.rooms || []).forEach((room) => {
      if ((room.points || []).length < 3) return;
      const d = "M" + room.points.map((p) => p.x + " " + p.y).join(" L") + " Z";
      const sel = ui && ui.selectedRoomId === room.id;
      canvas.layers.rooms.appendChild(el("path", {
        d, class: "ep-plan-room" + (sel ? " is-sel" : ""), "data-room": room.id
      }));
    });

    drawScaled(canvas, project, ui);
  }

  // ---------- масштабируемая часть: контуры, подписи, черновик, рулетка ----------
  function drawScaled(canvas, project, ui) {
    const G = EP.Plan.Geometry;
    const g = canvas.layers.overlay;
    if (!project) { clear(g); return; }
    const k = canvas.cmPerPx(); // см в одном экранном пикселе
    const fs = CFG.labelPx * k, fsName = CFG.namePx * k, sw = CFG.wallPx * k, off = CFG.labelOffsetPx * k;
    const dimsOn = layerOn(project, "dims"), labelsOn = layerOn(project, "labels");
    // Работа по линиям (QF): солo — показать только одну линию ярко, остальные приглушить
    // (ui.soloCircuit); видимость — circuit.hidden скрывает линию целиком. В режиме solo
    // hidden игнорируем (solo и так приглушает всё, кроме выбранной). Общие хелперы —
    // объявлены ДО блока трасс, чтобы и трассы, и точки, и связи их использовали.
    const soloC = ui && ui.soloCircuit;
    const circById = (id) => (project.circuits || []).find((c) => c.id === id);
    const circHidden = (id) => { if (soloC) return false; const c = id && circById(id); return !!(c && c.hidden); };
    const circDim = (id) => soloC && id !== soloC; // приглушить: solo активен и это НЕ выбранная линия
    const DIM_OP = "0.12";
    // level-of-detail: на отдалении детальные подписи прячем (см. CFG.lodDimK/lodQfK)
    const lodDims = k <= CFG.lodDimK, lodQf = k <= CFG.lodQfK;
    // сдвиг подписи комнаты ВНИЗ, если свободная точка (свет/ТП/распайка) стоит
    // практически в центроиде — оба рисуются в центре комнаты и налезали друг на
    // друга (пойман визуальным тестом). Порог 35см — мировой, не зависит от зума,
    // сигнатура кэша стен стабильна, пока точка реально не подвинулась к/от центра.
    const labelNudges = (project.rooms || []).map((room) => {
      if ((room.points || []).length < 3) return 0;
      const c0 = G.centroid(room.points);
      return (project.elements || []).some((e2) => {
        if (e2.wallId) return false;
        const q = e2.params || {};
        return q.x != null && Math.hypot(q.x - c0.x, q.y - c0.y) < 35;
      }) ? 1 : 0;
    });
    // Шрифты/толщины ВНУТРИ кэшируемого блока стен зависят от k (постоянный размер
    // НА ЭКРАНЕ) — но сигнатура кэша не содержала зум вообще: после зума кэш
    // переиспользовал узел со старыми размерами шрифта, и подписи стен/цепочек
    // «плыли» по размеру до первого структурного изменения (скрытый баг, найден
    // при разборе LOD). Квантованное ведро зума (шаг ~26%) — пересборка только на
    // ЗАМЕТНОМ изменении зума, а не на каждом тике колеса/пинча.
    const kBucket = Math.round(Math.log2(k || 1) * 3);

    // ---------- стены/маски/проёмы/балки/пустоты/лента — кэшируемый <g> ----------
    // Самая дорогая часть рендера (профилировано headless Chromium CPU-профилем на
    // 30 комнатах/150 точках: <mask> на каждую комнату с проёмами + до 3 наложенных
    // <path> на стену + G.wallOpeningSpans/G.walls — больше 30% времени renderScene()
    // на КАЖДЫЙ вызов), но геометрия стен меняется НАМНОГО реже точек/трасс — перенос
    // розетки, построение трассы, переключение слоя её вообще не трогают. Строим ОДИН
    // раз в отдельный <g> и переиспользуем, пока сигнатура структурных входов (ниже)
    // не изменится буквально — НЕ вручную отслеживаемый dirty-флаг (риск пропустить
    // место мутации и молча показывать устаревшие стены), а JSON-сигнатура: дешевле
    // самой сборки (масок/путей) и самокорректируется на ЛЮБОЕ структурное изменение.
    // Черновики рисования (room/beam/void draft) НАМЕРЕННО остаются ВНУТРИ этого же
    // кэшируемого блока (как и были, по позиции в коде) — их состояние тоже входит в
    // сигнатуру: пока ничего не рисуется (обычный режим правки уже готового проекта —
    // 99% времени) сигнатура стабильна и кэш работает; во время АКТИВНОГО рисования
    // комнаты/балки/пустоты сигнатура меняется на каждый пойнтермув, кэш промахивается
    // каждый раз — ровно то же поведение, что было до этой правки (не хуже, не лучше
    // — оптимизация целится в редактирование уже готового плана, не в его рисование).
    const structSig = JSON.stringify([
      project.rooms, project.openings, project.beams, project.voids, project.ledStrips,
      project.settings && project.settings.wallThickness, project.settings && project.settings.wallMaterial,
      dimsOn, labelsOn, lodDims, kBucket, labelNudges,
      ui && ui.selectedRoomId, ui && ui.draft, ui && ui.beamDraft, ui && ui.voidDraft,
      EP.Plan.Rooms && EP.Plan.Rooms.selectedBeamId && EP.Plan.Rooms.selectedBeamId(),
      EP.Plan.Rooms && EP.Plan.Rooms.selectedVoidId && EP.Plan.Rooms.selectedVoidId()
    ]);
    const wallsCached = wallsCache.get(canvas);
    let wallsGroup;
    if (wallsCached && wallsCached.sig === structSig) {
      wallsGroup = wallsCached.node;
    } else {
      wallsGroup = el("g", { "data-l": "walls" });
      buildWalls(wallsGroup);
      wallsCache.set(canvas, { sig: structSig, node: wallsGroup });
    }
    clear(g);
    g.appendChild(wallsGroup);

    // содержимое — ДОСЛОВНО тот же код, что был раньше напрямую в g (тень имени g
    // ниже гарантирует это без переписывания каждого вызова appendChild)
    function buildWalls(wallsTarget) {
      const g = wallsTarget;
      (project.rooms || []).forEach((room, roomI) => {
        const pts = room.points || [];
        if (pts.length < 2) return;
        const sel = ui && ui.selectedRoomId === room.id;
        const closed = pts.length >= 3;
        const mat = room.material || (project.settings && project.settings.wallMaterial) || "Бетон";
        const matClass = MATCLASS(mat);
        // стены — как на чертеже: митра-стыки (без кружков), заливка + штриховка
        // материала, проёмы вырезаются маской (в т.ч. проёмы общей стены соседа)
        const band = closed ? G.roomBand(project, room) : null;
        if (band) {
          const quads = [];
          G.walls(room).forEach((w) => {
            const th2 = G.wallThOf(project, w) / 2 + 0.6;
            const len = w.len || 1, ddx = (w.b.x - w.a.x) / len, ddy = (w.b.y - w.a.y) / len;
            const nx = -ddy, ny = ddx;
            G.wallOpeningSpans(project, w).forEach((o) => {
              const s0 = Math.max(0, o.offset), e0 = Math.min(w.len, o.offset + o.width);
              if (e0 - s0 < 1) return;
              const pa = G.pointAtOffset(w, s0), pb = G.pointAtOffset(w, e0);
              quads.push(`M${pa.x + nx * th2} ${pa.y + ny * th2} L${pb.x + nx * th2} ${pb.y + ny * th2} L${pb.x - nx * th2} ${pb.y - ny * th2} L${pa.x - nx * th2} ${pa.y - ny * th2} Z`);
            });
          });
          let maskAttr = {};
          if (quads.length) {
            const bb = G.bbox(band.outer);
            const m = el("mask", { id: "ep-cut-" + room.id, maskUnits: "userSpaceOnUse", x: bb.x - 60, y: bb.y - 60, width: bb.w + 120, height: bb.h + 120 });
            m.appendChild(el("rect", { x: bb.x - 60, y: bb.y - 60, width: bb.w + 120, height: bb.h + 120, fill: "#fff" }));
            m.appendChild(el("path", { d: quads.join(" "), fill: "#000" }));
            g.appendChild(m);
            maskAttr = { mask: "url(#ep-cut-" + room.id + ")" };
          }
          const ringD = (r2) => "M" + r2.map((p) => p.x + " " + p.y).join(" L") + " Z";
          const dBand = ringD(band.outer) + " " + ringD(band.inner);
          g.appendChild(el("path", Object.assign({ d: dBand, "fill-rule": "evenodd", class: "ep-plan-wallfill" + matClass + (sel ? " is-sel" : "") }, maskAttr)));
          g.appendChild(el("path", Object.assign({ d: dBand, "fill-rule": "evenodd", fill: HATCH(mat), class: "ep-plan-wallhatch" }, maskAttr)));
          g.appendChild(el("path", Object.assign({ d: dBand, "fill-rule": "evenodd", class: "ep-plan-walledge", fill: "none", "stroke-width": Math.min(1, sw * 0.3) }, maskAttr)));
          // ручки углов выбранной комнаты: тяни угол — форма, тяни стену — сдвиг стены
          if (sel) pts.forEach((v) => g.appendChild(el("circle", { cx: v.x, cy: v.y, r: CFG.pointPx * 1.25 * k, class: "ep-plan-roomhandle" })));
        } else if (pts.length >= 2) {
          const th = Math.max(4, (project.settings && project.settings.wallThickness) || 10);
          g.appendChild(el("path", { d: "M" + pts.map((p) => p.x + " " + p.y).join(" L"), class: "ep-plan-wallband" + matClass, "stroke-width": th, fill: "none" }));
        }

        if (closed && dimsOn && lodDims) {
          const c = G.centroid(pts);
          G.walls(room).forEach((w) => {
            // подпись снаружи: нормаль от центроида
            let nx = -(w.b.y - w.a.y), ny = w.b.x - w.a.x;
            const nl = Math.hypot(nx, ny) || 1;
            nx /= nl; ny /= nl;
            if ((w.mx - c.x) * nx + (w.my - c.y) * ny < 0) { nx = -nx; ny = -ny; }
            g.appendChild(el("text", {
              x: w.mx + nx * off, y: w.my + ny * off,
              class: "ep-plan-dim", "font-size": fs,
              "text-anchor": "middle", "dominant-baseline": "middle"
            }, w.n + " · " + G.fmtLen(w.len)));
          });
        }
        if (closed && labelsOn) {
          const c = G.centroid(pts);
          // labelNudges: свободная точка у центроида — подпись уезжает ниже маркера
          g.appendChild(el("text", {
            x: c.x, y: c.y + (labelNudges[roomI] ? 26 * k : 0), class: "ep-plan-name", "font-size": fsName,
            "text-anchor": "middle", "dominant-baseline": "middle"
          }, room.name + " · " + G.fmtArea(G.roomNetArea(project, room))));
        }
      });

      // черновик рисования (прямоугольник: 1-я точка; полигон: линия точек)
      const draft = ui && ui.draft;
      if (draft && draft.points && draft.points.length) {
        const dp = draft.points;
        if (dp.length > 1) {
          g.appendChild(el("polyline", {
            points: dp.map((p) => p.x + "," + p.y).join(" "),
            class: "ep-plan-draft", "stroke-width": sw, fill: "none"
          }));
          // живые длины сегментов при рисовании — видно, что получается
          for (let i = 0; i < dp.length - 1; i++) {
            const a = dp[i], b = dp[i + 1], L = G.dist(a, b);
            if (L < 5) continue;
            g.appendChild(el("text", { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 - 8 * k, class: "ep-plan-rulertext", "font-size": 10 * k, "text-anchor": "middle" }, G.fmtLen(L)));
          }
        }
        dp.forEach((p, i) => g.appendChild(el("circle", {
          cx: p.x, cy: p.y, r: CFG.pointPx * k,
          class: "ep-plan-draftpt" + (i === 0 ? " is-first" : "")
        })));
      }

      // проёмы: дверь (дуга) / раздвижная / окно (двойная линия) / балкон (окно+дверь)
      (project.openings || []).forEach((op) => {
        const w = G.wallById(project, op.wallId);
        if (!w) return;
        const a = G.pointAtOffset(w, op.offset), b = G.pointAtOffset(w, op.offset + op.width);
        const dirx = (w.b.x - w.a.x) / (w.len || 1), diry = (w.b.y - w.a.y) / (w.len || 1);
        const nx = -diry * op.flip, ny = dirx * op.flip; // сторона открывания/выступа
        const kind = op.kind || (op.type === "window" ? "window" : "door");
        const drawSwing = (h, far, width) => {
          const leaf = { x: h.x + nx * width, y: h.y + ny * width };
          const cross = (far.x - h.x) * (leaf.y - h.y) - (far.y - h.y) * (leaf.x - h.x);
          const sweep = cross > 0 ? 1 : 0;
          g.appendChild(el("path", { d: `M${far.x} ${far.y} A${width} ${width} 0 0 ${sweep} ${leaf.x} ${leaf.y}`, class: "ep-plan-doorarc", "stroke-width": sw * 0.45, fill: "none" }));
          g.appendChild(el("line", { x1: h.x, y1: h.y, x2: leaf.x, y2: leaf.y, class: "ep-plan-doorleaf", "stroke-width": sw * 0.7 }));
        };
        const drawWindow = (pa, pb) => {
          const off3 = 3.2 * k;
          [-1, 1].forEach((s) => g.appendChild(el("line", { x1: pa.x + nx * off3 * s, y1: pa.y + ny * off3 * s, x2: pb.x + nx * off3 * s, y2: pb.y + ny * off3 * s, class: "ep-plan-window", "stroke-width": sw * 0.5 })));
          [pa, pb].forEach((p) => g.appendChild(el("line", { x1: p.x + nx * off3, y1: p.y + ny * off3, x2: p.x - nx * off3, y2: p.y - ny * off3, class: "ep-plan-window", "stroke-width": sw * 0.5 })));
        };
        if (kind === "door") {
          const h = op.hinge === "a" ? a : b, far = op.hinge === "a" ? b : a;
          drawSwing(h, far, op.width);
        } else if (kind === "sliding") {
          const off3 = 3.5 * k, mid = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
          g.appendChild(el("line", { x1: a.x + nx * off3, y1: a.y + ny * off3, x2: mid.x + dirx * 3 * k + nx * off3, y2: mid.y + diry * 3 * k + ny * off3, class: "ep-plan-doorleaf", "stroke-width": sw * 0.7 }));
          g.appendChild(el("line", { x1: mid.x - dirx * 3 * k - nx * off3, y1: mid.y - diry * 3 * k - ny * off3, x2: b.x - nx * off3, y2: b.y - ny * off3, class: "ep-plan-doorleaf", "stroke-width": sw * 0.7 }));
          g.appendChild(el("line", { x1: a.x, y1: a.y, x2: b.x, y2: b.y, class: "ep-plan-window", "stroke-width": sw * 0.4 }));
        } else if (kind === "balcony") {
          const dW = Math.min(80, op.width * 0.5);
          const hinge = op.hinge === "a" ? a : b;
          const doorFar = { x: hinge.x + dirx * (op.hinge === "a" ? dW : -dW), y: hinge.y + diry * (op.hinge === "a" ? dW : -dW) };
          const winA = op.hinge === "a" ? doorFar : a, winB = op.hinge === "a" ? b : doorFar;
          drawWindow(winA, winB);
          drawSwing(hinge, doorFar, dW);
        } else if (kind === "opening") {
          // просто проём — без двери и без окна, только вырез в стене (маска выше)
        } else {
          drawWindow(a, b);
        }
        // номер проёма (О1, Дв2 …) — на слое «Подписи»
        if (labelsOn && EP.Plan.Elements && EP.Plan.Elements.openingNum) {
          const mid = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
          g.appendChild(el("text", { x: mid.x - nx * 16 * k, y: mid.y - ny * 16 * k, class: "ep-plan-opnum", "font-size": 10 * k, "text-anchor": "middle", "dominant-baseline": "middle" }, EP.Plan.Elements.openingNum(project, op)));
        }
      });

      // балки / перемычки / перегородки — рисуются КАК СТЕНА: тем же материалом и толщиной
      const matClassOf = MATCLASS;
      const wallTh = Math.max(4, (project.settings && project.settings.wallThickness) || 10);
      (project.beams || []).forEach((bm) => {
        const bw = Math.max(4, bm.width || wallTh);
        const matB = bm.material || (project.settings && project.settings.wallMaterial) || "Бетон";
        const mc = matClassOf(matB);
        const sel = EP.Plan.Rooms && EP.Plan.Rooms.selectedBeamId && EP.Plan.Rooms.selectedBeamId() === bm.id;
        // тело перегородки — заливка + штриховка материала, ЗА ВЫЧЕТОМ проёмов
        const bwWall = G.beamWall(bm);
        const bOpens = G.openingsOnWall(project, bwWall.id);
        const spans = G.spansMinusOpenings(bwWall.len, bOpens);
        const lenB = bwWall.len || 1;
        const ddx = (bwWall.b.x - bwWall.a.x) / lenB, ddy = (bwWall.b.y - bwWall.a.y) / lenB;
        const nx = -ddy, ny = ddx, h2 = bw / 2;
        const clsF = "ep-plan-wallfill" + mc + (bm.kind === "lintel" ? " is-lintel-band" : "") + (sel ? " is-sel" : "");
        spans.forEach(([s, e]) => {
          const p1 = G.pointAtOffset(bwWall, s), p2 = G.pointAtOffset(bwWall, e);
          const d = `M${p1.x + nx * h2} ${p1.y + ny * h2} L${p2.x + nx * h2} ${p2.y + ny * h2} L${p2.x - nx * h2} ${p2.y - ny * h2} L${p1.x - nx * h2} ${p1.y - ny * h2} Z`;
          g.appendChild(el("path", { d, class: clsF }));
          g.appendChild(el("path", { d, fill: HATCH(matB), class: "ep-plan-wallhatch" }));
          g.appendChild(el("path", { d, class: "ep-plan-walledge", fill: "none", "stroke-width": Math.min(1, sw * 0.3) }));
        });
        // ручки-концы, когда балка выбрана (тянуть пальцем)
        if (sel) [bm.a, bm.b].forEach((v) => g.appendChild(el("circle", { cx: v.x, cy: v.y, r: CFG.pointPx * 1.3 * k, class: "ep-plan-beamhandle" })));
      });
      // черновик балки
      if (ui && ui.beamDraft && ui.beamDraft.a) {
        const d2 = ui.beamDraft;
        if (d2.b) g.appendChild(el("line", { x1: d2.a.x, y1: d2.a.y, x2: d2.b.x, y2: d2.b.y, class: "ep-plan-wallband ep-plan-beamdraft", "stroke-width": wallTh }));
        g.appendChild(el("circle", { cx: d2.a.x, cy: d2.a.y, r: CFG.pointPx * k, class: "ep-plan-draftpt is-first" }));
      }

      // внутренние препятствия: вентшахта (штриховка) / мини-комната (тонкий контур)
      (project.voids || []).forEach((vd) => {
        const r = G.voidRect(vd);
        const selV = EP.Plan.Rooms && EP.Plan.Rooms.selectedVoidId && EP.Plan.Rooms.selectedVoidId() === vd.id;
        const cls = "ep-plan-void ep-plan-void-" + (vd.kind === "room" ? "room" : "shaft") + (selV ? " is-sel" : "");
        const grp = el("g", { "data-pl-void": vd.id });
        const rectAttrs = { x: r.x1, y: r.y1, width: r.w, height: r.h, class: cls, "stroke-width": sw * 0.6 };
        grp.appendChild(el("rect", rectAttrs));
        if (vd.kind !== "room") grp.appendChild(el("rect", { x: r.x1, y: r.y1, width: r.w, height: r.h, fill: HATCH("Панель"), class: "ep-plan-voidhatch" }));
        const cx = (r.x1 + r.x2) / 2, cy = (r.y1 + r.y2) / 2;
        const fsV = Math.max(8, Math.min(13, r.w / 6)) * k;
        grp.appendChild(el("text", { x: cx, y: cy, class: "ep-plan-voidname", "font-size": fsV, "text-anchor": "middle", "dominant-baseline": "middle" }, vd.name || (vd.kind === "room" ? "Комната" : "Шахта")));
        g.appendChild(grp);
      });
      // черновик внутреннего препятствия (первая точка уже поставлена)
      if (ui && ui.voidDraft && ui.voidDraft.a) {
        g.appendChild(el("circle", { cx: ui.voidDraft.a.x, cy: ui.voidDraft.a.y, r: CFG.pointPx * k, class: "ep-plan-draftpt is-first" }));
      }

      // светодиодная лента — сегмент ВДОЛЬ стены (offsetA..offsetB), с небольшим отступом
      // внутрь комнаты, чтобы не сливаться с самой стеной
      (project.ledStrips || []).forEach((ls) => {
        const lw = G.wallById(project, ls.wallId); if (!lw) return;
        const fr = G.wallFrame(project, lw);
        const d3 = 4; // см, чисто визуальный отступ от грани стены
        const a2 = G.pointAtOffset(lw, Math.min(ls.offsetA, ls.offsetB)), b2 = G.pointAtOffset(lw, Math.max(ls.offsetA, ls.offsetB));
        const nx = fr ? fr.nrm.x * d3 : 0, ny = fr ? fr.nrm.y * d3 : 0;
        g.appendChild(el("line", { x1: a2.x + nx, y1: a2.y + ny, x2: b2.x + nx, y2: b2.y + ny, class: "ep-plan-ledstrip", "stroke-width": sw * 1.4 }));
      });
    }

    // размерные цепочки: привязки точек и проёмов к углам стены (слой «Размеры»);
    // lodDims — на отдалении цепочки скрыты (LOD), хит-тест двойного тапа по цифре
    // в plan-rooms.js гейтится ТЕМ ЖЕ порогом CFG.lodDimK (видимая цифра = зона тапа)
    if (dimsOn && lodDims) {
      (project.rooms || []).forEach((room) => {
        if ((room.points || []).length < 3) return;
        const c0 = G.centroid(room.points);
        // размеры берём от ВНУТРЕННИХ углов (работаем изнутри квартиры)
        G.walls(room).forEach((w) => {
          const chain = G.wallChainStations(project, w);
          if (!chain) return; // нечего привязывать (только углы)
          let nx = -(w.b.y - w.a.y), ny = w.b.x - w.a.x;
          const nl = Math.hypot(nx, ny) || 1;
          nx /= nl; ny /= nl;
          if ((w.mx - c0.x) * nx + (w.my - c0.y) * ny < 0) { nx = -nx; ny = -ny; }
          // off2 — отступ размерной цепочки от грани стены. РАНЬШЕ считался в
          // экранных пикселях (labelOffsetPx*2.6*k, k=cmPerPx) — т.е. держал
          // ПОСТОЯННЫЙ размер НА ЭКРАНЕ при любом зуме, но из-за этого реальный
          // отступ В САНТИМЕТРАХ рос при отдалении вида (при бОльшем k тот же
          // экранный отступ = больше см) — на широком виде плана цепочка
          // отъезжала от стены на десятки см и налезала на трассы/точки (репорт
          // пользователя со скриншотами: «линейка отдаляется» при отдалении).
          // Теперь фиксированный отступ в РЕАЛЬНЫХ см (5см от грани стены,
          // не больше, не зависит от зума) — просьба пользователя.
          const off2 = 5, tick = 4 * k, fs2 = 8.5 * k;
          const base = (d) => { const p = G.pointAtOffset(w, d); return { x: p.x + nx * off2, y: p.y + ny * off2 }; };
          const st2 = chain.stations;
          const b0 = base(st2[0].off), b1 = base(st2[st2.length - 1].off);
          g.appendChild(el("line", { x1: b0.x, y1: b0.y, x2: b1.x, y2: b1.y, class: "ep-plan-chain", "stroke-width": sw * 0.35 }));
          st2.forEach((s) => {
            const p = base(s.off);
            g.appendChild(el("line", { x1: p.x - nx * tick, y1: p.y - ny * tick, x2: p.x + nx * tick, y2: p.y + ny * tick, class: "ep-plan-chain", "stroke-width": sw * 0.35 }));
          });
          chain.segs.forEach((sg) => {
            const m = base(sg.midOff);
            g.appendChild(el("text", { x: m.x + nx * 6 * k, y: m.y + ny * 6 * k, class: "ep-plan-chaintext", "font-size": fs2, "text-anchor": "middle", "dominant-baseline": "middle" }, String(sg.dist)));
          });
        });
      });
    }

    // магистрали трасс (p.guides): полупрозрачное приоритетное направление —
    // ПОД трассами (рисуются раньше). Скрытые (hidden после построения) видны
    // ТОЛЬКО в режиме рисования ⇉ (ui.guideMode) — там их можно убрать/дополнить.
    (project.guides || []).forEach((gd) => {
      if (gd.hidden && !(ui && ui.guideMode)) return;
      if ((gd.points || []).length < 2) return;
      g.appendChild(el("polyline", {
        points: gd.points.map((q) => q.x + "," + q.y).join(" "),
        class: "ep-plan-guide", "stroke-width": sw * 3
      }));
    });
    // черновик рисуемой магистрали (режим ⇉): ярче и пунктиром + точки
    const gDraft = ui && ui.guideDraft;
    if (gDraft && gDraft.points && gDraft.points.length) {
      if (gDraft.points.length > 1) g.appendChild(el("polyline", {
        points: gDraft.points.map((q) => q.x + "," + q.y).join(" "),
        class: "ep-plan-guidedraft", "stroke-width": sw * 3
      }));
      gDraft.points.forEach((q) => g.appendChild(el("circle", { cx: q.x, cy: q.y, r: CFG.pointPx * k, class: "ep-plan-guidept" })));
    }

    // трассы (Слой 4): полилинии цветом слоя + проходки
    if (layerOn(project, "routes")) {
      const layerColor = (id) => (((project.layers || []).find((l) => l.id === id) || {}).color) || "#94a3b8";
      const selRoute = EP.Plan.Rooms && EP.Plan.Rooms.selectedRouteId && EP.Plan.Rooms.selectedRouteId();
      // Неоном светится ВСЯ физическая трасса (щит → … → конечный механизм), а не
      // только кликнутый хоп шлейфа — просьба пользователя. chainRouteIds считается ОДИН
      // раз на рендер (не по каждой трассе), ручки тяги остаются только у самого
      // выбранного хопа (тянуть можно только его, остальные — просто светятся).
      const selRt = selRoute && (project.routes || []).find((r) => r.id === selRoute);
      const chainIds = selRt && EP.Plan.Routes && EP.Plan.Routes.chainRouteIds ? EP.Plan.Routes.chainRouteIds(project, selRt) : null;
      // Раньше свечение выбранной трассы было CSS `filter: drop-shadow(0 0 2px #fff)` —
      // «2px» здесь мировые единицы SVG-фильтра, они НЕ умножаются на k (в отличие от
      // stroke-width, который уже умножен на k, чтобы толщина держала постоянный размер
      // НА ЭКРАНЕ при любом зуме) — на обычном масштабе плана эффект превращался в доли
      // экранного пикселя, визуально неотличим от обычной линии (репорт пользователя:
      // «свечение слабое или отсутствие»). Теперь свечение — САМИ полилинии-«ореолы»
      // ЗА крисп-линией, ширина которых посчитана ТЕМ ЖЕ множителем k, что и сама толщина
      // линии (через sw) — гарантированно видимый, «боковой» (расходящийся вширь от
      // линии) неон на любом зуме, цветом самой линии + яркое белое ядро поверх.
      // На слабых устройствах (perfLevel≥2, body[data-flatshadow="1"]) халo — лишние 4
      // полилинии на КАЖДУЮ трассу цепи — пропускается целиком (перф важнее декора там,
      // где сам движок уже решил экономить на тенях/блюре/штриховке).
      const flatShadow = typeof document !== "undefined" && document.body && document.body.dataset && document.body.dataset.flatshadow === "1";
      (project.routes || []).forEach((rt) => {
        if (!layerOn(project, rt.layer)) return;
        if (circHidden(rt.circuitId)) return; // скрытая линия — не рисуем её трассы
        const dimR = circDim(rt.circuitId);
        const inChain = chainIds ? chainIds.has(rt.id) : false;
        // «Другие» трассы во время выбора — обесцвечены (просьба пользователя: «а во
        // время выбора другие должны становится черно белые»), чтобы выбранная цепь
        // читалась однозначно на фоне остальных линий. dimR (приглушение по solo другой
        // линии) — отдельный, более сильный механизм, ему уступаем (не спорим за opacity).
        const otherDim = !!(chainIds && !inChain && !dimR);
        const ptsStr = (rt.points || []).map((p) => p.x + "," + p.y).join(" ");
        const routeColor = rt.color || layerColor(rt.layer);
        if (inChain && !flatShadow) {
          const baseSw = sw * 0.8;
          [[baseSw * 7, .09], [baseSw * 4.4, .17], [baseSw * 2.6, .30]].forEach(([w, op]) => {
            g.appendChild(el("polyline", {
              points: ptsStr, class: "ep-plan-routeglow", stroke: routeColor,
              "stroke-width": w, opacity: op, fill: "none",
              "stroke-linecap": "round", "stroke-linejoin": "round"
            }));
          });
          g.appendChild(el("polyline", {
            points: ptsStr, class: "ep-plan-routeglow-core", stroke: "#fff",
            "stroke-width": baseSw * 0.85, opacity: .6, fill: "none",
            "stroke-linecap": "round", "stroke-linejoin": "round"
          }));
        }
        g.appendChild(el("polyline", Object.assign({
          points: ptsStr,
          class: "ep-plan-route" + (rt.manual ? " is-manual" : "") + (inChain ? " is-sel" : "") + (otherDim ? " is-otherdim" : ""),
          stroke: routeColor, "stroke-width": sw * 0.8
        }, dimR ? { opacity: DIM_OP } : {})));
        (rt.throughWalls || []).forEach((c) => g.appendChild(el("circle", Object.assign({
          cx: c.x, cy: c.y, r: 5 * k, class: "ep-plan-cross" + (otherDim ? " is-otherdim" : ""), "stroke-width": sw * 0.6
        }, dimR ? { opacity: DIM_OP } : {}))));
        // ручки тяги — только у РЕАЛЬНО выбранного хопа (тот, на который тапнули), только
        // на промежуточных изломах (концы 0/last завязаны на элемент/щит/распайку)
        if (rt.id === selRoute) {
          const pts = rt.points || [];
          for (let i = 1; i < pts.length - 1; i++) {
            g.appendChild(el("circle", { cx: pts[i].x, cy: pts[i].y, r: CFG.pointPx * 1.1 * k, class: "ep-plan-routehandle" }));
          }
        }
      });
    }

    // элементы и щиты (Слой 2)
    const TY = (EP.Plan.Elements && EP.Plan.Elements.TYPES) || {};
    const bad = EP.Plan.Rules ? EP.Plan.Rules.badSet() : new Set();
    const selId = EP.Plan.Elements ? EP.Plan.Elements.selectedId() : null;
    const layerColor2 = (id) => (((project.layers || []).find((l) => l.id === id) || {}).color) || "#94a3b8";
    const circ = (id) => (project.circuits || []).find((c) => c.id === id);
    const gost = (project.settings && project.settings.symbolStyle) === "gost";
    const design = (project.settings && project.settings.symbolStyle) === "design";
    // цвет элемента = цвет линии (QF), если она назначена; иначе цвет слоя. Блоки/посты
    // и одиночные точки красятся по линии, как на профессиональном чертеже (просил
    // пользователь: «цвет естественно должен зависеть от линии QF»).
    const elemColor = (elem) => (elem.circuitId && circ(elem.circuitId) ? circ(elem.circuitId).color : layerColor2(elem.layer));
    (project.elements || []).forEach((elem) => {
      if (!layerOn(project, elem.layer)) return;
      if (circHidden(elem.circuitId)) return; // скрытая линия — не рисуем её точки
      const pt = EP.Plan.Geometry.elemPoint(project, elem);
      if (!pt) return;
      const r0 = 11 * k;
      // отступ от стены ВНУТРЬ комнаты + поворот вдоль стены (ЕДИНАЯ точка с трассой)
      const dp = pt.wall ? EP.Plan.Geometry.elemDrawPoint(project, elem) : pt;
      const cx = dp.x, cy = dp.y;
      const rot = dp.angle || 0;
      const grp = el("g", { class: "ep-plan-el" + (elem.status === "mounted" ? " is-done" : "") + (elem.status === "existing" ? " is-exist" : "") + (elem.id === selId ? " is-sel" : "") });
      if (elem.type === "junction") {
        if (gost) {
          // ГОСТ: соединительная коробка — закрашенный кружок
          grp.appendChild(el("circle", { cx: pt.x, cy: pt.y, r: 5.5 * k, class: "ep-plan-junction is-gost", "stroke-width": sw * 0.7 }));
        } else {
          // распайка: ромб (повёрнутый квадрат) на слое трасс — на самой стене, без отступа
          const s2 = 12 * k;
          grp.appendChild(el("rect", { x: pt.x - s2, y: pt.y - s2, width: s2 * 2, height: s2 * 2, transform: `rotate(45 ${pt.x} ${pt.y})`, class: "ep-plan-junction", "stroke-width": sw * 0.7 }));
        }
        if (bad.has(elem.id)) grp.appendChild(el("circle", { cx: pt.x, cy: pt.y, r: r0 * 1.7, class: "ep-plan-warnring", "stroke-width": sw * 0.7 }));
      } else if (elem.type === "block") {
        // рамка постов: поворачивается ВДОЛЬ стены, отступ внутрь. Вертикальный блок
        // (elem.blockVert) — та же рамка, повёрнутая ещё на 90° (посты «столбиком»
        // на плане), просил пользователь: «кнопку развернуть на 90°».
        const items = (elem.params && elem.params.items) || ["socket"];
        const step2 = 16 * k, bw = items.length * step2 + 8 * k, bh = 22 * k;
        const rotB = (rot || 0) + (elem.blockVert ? 90 : 0);
        const tr = rotB ? `rotate(${rotB} ${cx} ${cy})` : null;
        // ГОСТ: групповая розетка (все посты блока — розетки) — концентрические полукруги
        // по числу постов вместо прямоугольника с буквами, максимум 6 колец (тот же предел,
        // что уже есть у самой возможности добавить пост в блок, см. plan-unfold.js p+/p-)
        const gostGroup = gost && items.length > 1 && items.every((it) => it === "socket");
        if (gostGroup) {
          const sub = el("g", { class: "ep-plan-gost", stroke: elemColor(elem), transform: `translate(${cx} ${cy})` + (rotB ? ` rotate(${rotB})` : "") });
          let sgn = 1;
          if (dp && dp.nrm) {
            const rad = (rot || 0) * Math.PI / 180;
            sgn = (-Math.sin(rad) * dp.nrm.x + Math.cos(rad) * dp.nrm.y) >= 0 ? 1 : -1;
          }
          const lw = sw * 0.85, r0g = 8 * k, ringGap = 3.4 * k;
          const rings = Math.min(items.length, 6);
          for (let i = 0; i < rings; i++) {
            const r = r0g + i * ringGap;
            sub.appendChild(el("path", { d: `M ${-r} 0 A ${r} ${r} 0 0 ${sgn > 0 ? 1 : 0} ${r} 0`, fill: "none", "stroke-width": lw }));
          }
          const rMax = r0g + (rings - 1) * ringGap;
          sub.appendChild(el("line", { x1: -rMax, y1: 0, x2: rMax, y2: 0, "stroke-width": lw }));
          sub.appendChild(el("line", { x1: 0, y1: sgn * rMax, x2: 0, y2: sgn * (rMax + 6 * k), "stroke-width": lw }));
          if (items.length > 6) sub.appendChild(el("text", { x: 0, y: sgn * (rMax + 13 * k), "font-size": 8 * k, "text-anchor": "middle", "dominant-baseline": "central", class: "ep-plan-gosttxt", fill: elemColor(elem), stroke: "none" }, "×" + items.length));
          grp.appendChild(sub);
          if (bad.has(elem.id)) grp.appendChild(el("circle", Object.assign({ cx: 0, cy: 0, r: rMax * 1.4, class: "ep-plan-warnring", fill: "none", "stroke-width": sw * 0.7 }, { transform: `translate(${cx} ${cy})` + (rotB ? ` rotate(${rotB})` : "") })));
          grp.appendChild(el("circle", Object.assign({ cx: 0, cy: sgn * (rMax + 6 * k), r: 2.6 * k, class: "ep-plan-entrymark" }, { transform: `translate(${cx} ${cy})` + (rotB ? ` rotate(${rotB})` : "") })));
        } else {
          // стиль «Дизайн»: выноска от блока к точке-«плагу» на стене
          if (design && pt && pt.wall && (Math.abs(pt.x - cx) > 0.5 || Math.abs(pt.y - cy) > 0.5)) {
            grp.appendChild(el("line", { x1: pt.x, y1: pt.y, x2: cx, y2: cy, class: "ep-plan-leader", "stroke-width": sw * 0.7 }));
            grp.appendChild(el("circle", { cx: pt.x, cy: pt.y, r: 2.6 * k, class: "ep-plan-walldot" }));
          }
          if (bad.has(elem.id)) grp.appendChild(el("rect", Object.assign({ x: cx - bw / 2 - 4 * k, y: cy - bh / 2 - 4 * k, width: bw + 8 * k, height: bh + 8 * k, rx: 6 * k, class: "ep-plan-warnring", fill: "none", "stroke-width": sw * 0.7 }, tr ? { transform: tr } : {})));
          grp.appendChild(el("rect", Object.assign({ x: cx - bw / 2, y: cy - bh / 2, width: bw, height: bh, rx: 5 * k, fill: elemColor(elem), class: "ep-plan-blockrect", "stroke-width": sw * 0.7 }, tr ? { transform: tr } : {})));
          items.forEach((it, i) => grp.appendChild(el("text", Object.assign({
            x: cx - bw / 2 + 4 * k + step2 * i + step2 / 2, y: cy,
            "font-size": 9 * k, "text-anchor": "middle", "dominant-baseline": "central", class: "ep-plan-elglyph"
          }, tr ? { transform: tr } : {}), (TY[it] || {}).glyph || "?")));
          // метка входа штробы (к какому подрозетнику идёт трасса)
          const eIdx = EP.Plan.Geometry.blockEntryIndex(elem);
          const ex = cx - bw / 2 + 4 * k + step2 * Math.min(eIdx, items.length - 1) + step2 / 2;
          grp.appendChild(el("circle", Object.assign({ cx: ex, cy: cy + bh / 2 + 3 * k, r: 2.6 * k, class: "ep-plan-entrymark" }, tr ? { transform: tr } : {})));
        }
      } else {
        if (bad.has(elem.id)) grp.appendChild(el("circle", { cx, cy, r: r0 * 1.55, class: "ep-plan-warnring", "stroke-width": sw * 0.7 }));
        const colEl = elem.circuitId && circ(elem.circuitId) ? circ(elem.circuitId).color : layerColor2(elem.layer);
        const drewGost = gost && drawGostEl(grp, elem, cx, cy, rot, dp, k, sw, colEl);
        const drewDesign = !drewGost && design && drawDesignEl(grp, elem, pt, cx, cy, k, sw, colEl, (TY[elem.type] || {}).glyph || "?");
        if (!drewGost && !drewDesign) {
          grp.appendChild(el("circle", { cx, cy, r: r0, fill: colEl, "stroke-width": sw * 0.7 }));
          grp.appendChild(el("text", { x: cx, y: cy, "font-size": 10 * k, "text-anchor": "middle", "dominant-baseline": "central", class: "ep-plan-elglyph" }, (TY[elem.type] || {}).glyph || "?"));
        }
      }
      if (elem.status === "mounted") grp.appendChild(el("text", { x: cx + r0, y: cy - r0, "font-size": 10 * k, class: "ep-plan-eldone" }, "✓"));
      // QF-подпись линии (обозначение автомата) над точкой; lodQf — скрыта на сильном отдалении
      if (labelsOn && lodQf && elem.circuitId) {
        const cc = circ(elem.circuitId);
        if (cc) grp.appendChild(el("text", { x: cx, y: cy - r0 - 5 * k, "font-size": 9 * k, "text-anchor": "middle", class: "ep-plan-qf", fill: cc.color }, cc.name));
      }
      // подпись высоты установки (h=NNN, см) под маркером — только у настенных точек
      // (у свободного света/ТП/распайки высота = потолок, подпись не нужна). Текст НЕ
      // повёрнут (всегда читается), опущен ниже маркера, как на проф. чертеже.
      // lodDims — на отдалении скрыта (первой начинает наслаиваться на соседей).
      if (lodDims && elem.wallId && elem.type !== "junction" && elem.height != null) {
        const below = (elem.type === "block" ? 15 * k : r0 + 2 * k);
        grp.appendChild(el("text", { x: cx, y: cy + below + 7 * k, "font-size": 8.5 * k, "text-anchor": "middle", "dominant-baseline": "central", class: "ep-plan-hlabel" }, "h=" + Math.round(elem.height)));
      }
      if (circDim(elem.circuitId)) grp.setAttribute("opacity", DIM_OP); // solo другой линии — приглушить точку
      g.appendChild(grp);
    });
    // пунктир: какой выключатель к какой лампе/выводу идёт (по линии QF или назначено вручную).
    // Цепочка проходных/перекрёстных: провод к СЛЕДУЮЩЕМУ звену (chainNext) —
    // к лампе идёт только ОТ ПОСЛЕДНЕГО звена (без chainNext), не от каждого.
    // Многоклавишный обычный выключатель — своя связь на каждую клавишу.
    if (layerOn(project, "light")) {
      (project.elements || []).forEach((elem) => {
        if (elem.type !== "switch") return;
        if (circHidden(elem.circuitId)) return; // связь скрытой линии не рисуем
        const a = G.elemDrawPoint(project, elem);
        if (!a) return;
        const dimSw = circDim(elem.circuitId);
        const swLine = (attrs) => el("line", dimSw ? Object.assign({ opacity: DIM_OP }, attrs) : attrs);
        const col = elem.circuitId && circ(elem.circuitId) ? circ(elem.circuitId).color : layerColor2("light");
        if (elem.chainNext) {
          const nextEl = (project.elements || []).find((e) => e.id === elem.chainNext);
          const b = nextEl && G.elemDrawPoint(project, nextEl);
          if (b) g.appendChild(swLine({ x1: a.x, y1: a.y, x2: b.x, y2: b.y, class: "ep-plan-swchain", stroke: col, "stroke-width": sw * 0.6 }));
          return; // не последнее звено — к лампе не рисуем, это сделает последнее
        }
        const keys = elem.swKind && elem.swKind !== "normal" ? 1 : Math.max(1, elem.keys || 1);
        for (let ki = 0; ki < keys; ki++) {
          const target = G.switchTarget(project, elem, ki);
          const b = target && G.elemDrawPoint(project, target);
          if (b) {
            // Цель клавиши — точка «Вывод 24В» И в проекте есть трансформаторный щит:
            // физразводка 24В идёт НЕ напрямую, а через щит — клавиша коммутирует 220В
            // на первичку трансформатора (выключатель→щит), со вторички 24В на точку
            // (щит→точка). Рисуем ДВУМЯ пунктирами, как у ленты. Обычная лампа/220В-вывод —
            // напрямую, как раньше (каждая клавиша решается по типу СВОЕЙ цели, так что
            // на многоклавишном выключателе одна клавиша может идти на 24В через щит,
            // а другая — прямо на свет 220В).
            const tx24 = target.type === "output24" ? (project.panels || []).find((pn) => pn.transformer) : null;
            if (tx24) {
              g.appendChild(swLine({ x1: a.x, y1: a.y, x2: tx24.x, y2: tx24.y, class: "ep-plan-swlink", stroke: col, "stroke-width": sw * 0.5 }));
              g.appendChild(swLine({ x1: tx24.x, y1: tx24.y, x2: b.x, y2: b.y, class: "ep-plan-swlink", stroke: col, "stroke-width": sw * 0.5 }));
            } else {
              g.appendChild(swLine({ x1: a.x, y1: a.y, x2: b.x, y2: b.y, class: "ep-plan-swlink", stroke: col, "stroke-width": sw * 0.5 }));
            }
            continue;
          }
          // нет лампы/вывода той же линии — пробуем светодиодную ленту. Если в проекте
          // есть щит с трансформатором (panel.transformer) — ведём ДВУМЯ отрезками
          // (выключатель→щит, щит→лента), иначе прямой линией (нет отдельного щита слаботочки).
          const ledT = G.switchLedTarget(project, elem, ki);
          if (!ledT) continue;
          const lw = G.wallById(project, ledT.wallId);
          const mid = lw && G.pointAtOffset(lw, (ledT.offsetA + ledT.offsetB) / 2);
          if (!mid) continue;
          const txPanel = (project.panels || []).find((pn) => pn.transformer);
          if (txPanel) {
            g.appendChild(el("line", { x1: a.x, y1: a.y, x2: txPanel.x, y2: txPanel.y, class: "ep-plan-swlink", stroke: col, "stroke-width": sw * 0.5 }));
            g.appendChild(el("line", { x1: txPanel.x, y1: txPanel.y, x2: mid.x, y2: mid.y, class: "ep-plan-swlink", stroke: col, "stroke-width": sw * 0.5 }));
          } else {
            g.appendChild(el("line", { x1: a.x, y1: a.y, x2: mid.x, y2: mid.y, class: "ep-plan-swlink", stroke: col, "stroke-width": sw * 0.5 }));
          }
        }
      });
    }
    const pbox = project.settings && project.settings.panelBox;
    (project.panels || []).forEach((pn) => {
      // габарит щита = реальный корпус (мм→см), иначе типовой квадрат
      const wc = pbox && pbox.wmm ? pbox.wmm / 10 : 28;
      const hc = pbox && pbox.hmm ? pbox.hmm / 10 : 20;
      const grp = el("g", { class: "ep-plan-panel" + (pn.id === selId ? " is-sel" : "") });
      grp.appendChild(el("rect", { x: pn.x - wc / 2, y: pn.y - hc / 2, width: wc, height: hc, rx: 2, "stroke-width": sw * 0.8 }));
      if (gost) {
        // ГОСТ: щиток — прямоугольник, половина закрашена (по диагонали)
        grp.appendChild(el("path", { d: `M${pn.x - wc / 2} ${pn.y + hc / 2} L${pn.x + wc / 2} ${pn.y + hc / 2} L${pn.x + wc / 2} ${pn.y - hc / 2} Z`, class: "ep-plan-panelhalf" }));
      } else {
        grp.appendChild(el("text", { x: pn.x, y: pn.y, "font-size": 12 * k, "text-anchor": "middle", "dominant-baseline": "central", class: "ep-plan-elglyph" }, "Щ"));
      }
      if (pbox && pbox.modules && lodQf) grp.appendChild(el("text", { x: pn.x, y: pn.y + hc / 2 + 7 * k, "font-size": 8 * k, "text-anchor": "middle", class: "ep-plan-dim" }, pbox.modules + " мод"));
      g.appendChild(grp);
    });

    // рулетка
    const r = ui && ui.ruler;
    if (r && r.a) {
      g.appendChild(el("circle", { cx: r.a.x, cy: r.a.y, r: CFG.pointPx * k, class: "ep-plan-rulerpt" }));
      if (r.b) {
        g.appendChild(el("line", { x1: r.a.x, y1: r.a.y, x2: r.b.x, y2: r.b.y, class: "ep-plan-ruler", "stroke-width": sw }));
        g.appendChild(el("circle", { cx: r.b.x, cy: r.b.y, r: CFG.pointPx * k, class: "ep-plan-rulerpt" }));
        g.appendChild(el("text", {
          x: (r.a.x + r.b.x) / 2, y: (r.a.y + r.b.y) / 2 - off / 2,
          class: "ep-plan-rulertext", "font-size": fs, "text-anchor": "middle"
        }, EP.Plan.Geometry.fmtLen(EP.Plan.Geometry.dist(r.a, r.b))));
      }
    }
  }

  // ---------- живой предпросмотр снапа (наведение мышью/пером до тапа) ----------
  // Отдельный узел в overlay, обновляется атрибутами БЕЗ полного renderScaled —
  // тот же принцип, что и тяга (см. CLAUDE.md: во время движения — только
  // transform/атрибуты, полный рендер только на дискретных событиях).
  // drawScaled() чистит весь overlay — узел сам пересоздаётся при следующем hover.
  function hoverPreview(canvas, sp, k) {
    const g = canvas.layers.overlay;
    let hg = g.querySelector("#ep-plan-hoverprev");
    if (!hg) { hg = el("g", { id: "ep-plan-hoverprev" }); g.appendChild(hg); }
    clear(hg);
    if (sp.snapped) {
      const v = canvas.getView();
      hg.appendChild(el("line", { x1: sp.x, y1: v.y, x2: sp.x, y2: v.y + v.h, class: "ep-plan-snapguide", "stroke-width": k }));
      hg.appendChild(el("line", { x1: v.x, y1: sp.y, x2: v.x + v.w, y2: sp.y, class: "ep-plan-snapguide", "stroke-width": k }));
    }
    hg.appendChild(el("circle", { cx: sp.x, cy: sp.y, r: (sp.snapped ? 7 : 5) * k, class: "ep-plan-hovercross" + (sp.snapped ? " is-snapped" : "") }));
  }
  function clearHoverPreview(canvas) {
    const hg = canvas.layers.overlay.querySelector("#ep-plan-hoverprev");
    if (hg && hg.parentNode) hg.parentNode.removeChild(hg);
  }

  EP.Plan = EP.Plan || {};
  EP.Plan.Render = { draw, drawScaled, CFG, hoverPreview, clearHoverPreview };
})();
