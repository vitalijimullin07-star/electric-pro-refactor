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
    labelOffsetPx: 14   // отступ подписи от стены, px
  };

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
  const layerOn = (project, id) => {
    const l = (project.layers || []).find((x) => x.id === id);
    return !l || l.visible !== false;
  };

  // ---------- статичная часть: подложка + заливки комнат ----------
  function draw(canvas, project, ui) {
    const G = EP.Plan.Geometry;
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
    clear(g);
    if (!project) return;
    const k = canvas.cmPerPx(); // см в одном экранном пикселе
    const fs = CFG.labelPx * k, fsName = CFG.namePx * k, sw = CFG.wallPx * k, off = CFG.labelOffsetPx * k;
    const dimsOn = layerOn(project, "dims"), labelsOn = layerOn(project, "labels");

    (project.rooms || []).forEach((room) => {
      const pts = room.points || [];
      if (pts.length < 2) return;
      const sel = ui && ui.selectedRoomId === room.id;
      const closed = pts.length >= 3;
      const mat = room.material || (project.settings && project.settings.wallMaterial) || "Бетон";
      const matClass = MATCLASS(mat);
      // стены — ТОЛСТЫЕ (как на плане): band шириной = толщина стены + скруглённые углы
      const th = Math.max(4, (project.settings && project.settings.wallThickness) || 10); // см
      const dParts = [];
      G.walls(room).forEach((w) => {
        const opens = G.openingsOnWall(project, w.id);
        G.spansMinusOpenings(w.len, opens).forEach(([s, e]) => {
          const p1 = G.pointAtOffset(w, s), p2 = G.pointAtOffset(w, e);
          dParts.push("M" + p1.x + " " + p1.y + " L" + p2.x + " " + p2.y);
        });
      });
      if (dParts.length) {
        g.appendChild(el("path", { d: dParts.join(" "), class: "ep-plan-wallband" + matClass + (sel ? " is-sel" : ""), "stroke-width": th, fill: "none" }));
        if (closed) pts.forEach((v) => g.appendChild(el("circle", { cx: v.x, cy: v.y, r: th / 2, class: "ep-plan-wallcorner" + matClass + (sel ? " is-sel" : "") })));
      } else if (!closed) {
        g.appendChild(el("path", { d: "M" + pts.map((p) => p.x + " " + p.y).join(" L"), class: "ep-plan-wallband" + matClass, "stroke-width": th, fill: "none" }));
      }

      if (closed && dimsOn) {
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
        g.appendChild(el("text", {
          x: c.x, y: c.y, class: "ep-plan-name", "font-size": fsName,
          "text-anchor": "middle", "dominant-baseline": "middle"
        }, room.name + " · " + G.fmtArea(G.area(pts))));
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
      const mc = matClassOf(bm.material || (project.settings && project.settings.wallMaterial) || "Бетон");
      const sel = EP.Plan.Rooms && EP.Plan.Rooms.selectedBeamId && EP.Plan.Rooms.selectedBeamId() === bm.id;
      // тело перегородки — полоса-стена ЗА ВЫЧЕТОМ проёмов (окна/двери в перегородке)
      const bwWall = G.beamWall(bm);
      const bOpens = G.openingsOnWall(project, bwWall.id);
      const spans = G.spansMinusOpenings(bwWall.len, bOpens);
      const cls = "ep-plan-wallband" + mc + (bm.kind === "lintel" ? " is-lintel-band" : "") + (sel ? " is-sel" : "");
      if (spans.length) {
        spans.forEach(([s, e]) => {
          const p1 = G.pointAtOffset(bwWall, s), p2 = G.pointAtOffset(bwWall, e);
          g.appendChild(el("path", { d: "M" + p1.x + " " + p1.y + " L" + p2.x + " " + p2.y, class: cls, "stroke-width": bw, fill: "none" }));
        });
      }
      [bm.a, bm.b].forEach((v) => g.appendChild(el("circle", { cx: v.x, cy: v.y, r: bw / 2, class: "ep-plan-wallcorner" + mc + (sel ? " is-sel" : "") })));
      // ручки-концы, когда балка выбрана (тянуть пальцем)
      if (sel) [bm.a, bm.b].forEach((v) => g.appendChild(el("circle", { cx: v.x, cy: v.y, r: CFG.pointPx * 1.3 * k, class: "ep-plan-beamhandle" })));
    });
    // черновик балки
    if (ui && ui.beamDraft && ui.beamDraft.a) {
      const d2 = ui.beamDraft;
      if (d2.b) g.appendChild(el("line", { x1: d2.a.x, y1: d2.a.y, x2: d2.b.x, y2: d2.b.y, class: "ep-plan-wallband ep-plan-beamdraft", "stroke-width": wallTh }));
      g.appendChild(el("circle", { cx: d2.a.x, cy: d2.a.y, r: CFG.pointPx * k, class: "ep-plan-draftpt is-first" }));
    }

    // размерные цепочки: привязки точек и проёмов к углам стены (слой «Размеры»)
    if (dimsOn) {
      (project.rooms || []).forEach((room) => {
        if ((room.points || []).length < 3) return;
        const c0 = G.centroid(room.points);
        // размеры берём от ВНУТРЕННИХ углов (работаем изнутри квартиры)
        const thR = Math.max(4, (project.settings && project.settings.wallThickness) || 10);
        G.walls(room).forEach((w) => {
          const inA = Math.min(thR / 2, w.len / 2), inB = Math.max(w.len - thR / 2, w.len / 2);
          const clamp = (d) => Math.round(Math.max(inA, Math.min(inB, d)));
          const stations = new Set([Math.round(inA), Math.round(inB)]);
          (project.elements || []).forEach((e2) => { if (e2.wallId === w.id) stations.add(clamp(e2.offset)); });
          G.openingsOnWall(project, w.id).forEach((o) => { stations.add(clamp(o.offset)); stations.add(clamp(o.offset + o.width)); });
          if (stations.size <= 2) return; // нечего привязывать
          let nx = -(w.b.y - w.a.y), ny = w.b.x - w.a.x;
          const nl = Math.hypot(nx, ny) || 1;
          nx /= nl; ny /= nl;
          if ((w.mx - c0.x) * nx + (w.my - c0.y) * ny < 0) { nx = -nx; ny = -ny; }
          const off2 = CFG.labelOffsetPx * 2.6 * k, tick = 4 * k, fs2 = 8.5 * k;
          const st2 = [...stations].sort((x, y) => x - y);
          const base = (d) => { const p = G.pointAtOffset(w, d); return { x: p.x + nx * off2, y: p.y + ny * off2 }; };
          const b0 = base(st2[0]), b1 = base(st2[st2.length - 1]);
          g.appendChild(el("line", { x1: b0.x, y1: b0.y, x2: b1.x, y2: b1.y, class: "ep-plan-chain", "stroke-width": sw * 0.35 }));
          st2.forEach((d) => {
            const p = base(d);
            g.appendChild(el("line", { x1: p.x - nx * tick, y1: p.y - ny * tick, x2: p.x + nx * tick, y2: p.y + ny * tick, class: "ep-plan-chain", "stroke-width": sw * 0.35 }));
          });
          for (let i = 0; i < st2.length - 1; i++) {
            const seg = st2[i + 1] - st2[i];
            if (seg < 2) continue;
            const m = base((st2[i] + st2[i + 1]) / 2);
            g.appendChild(el("text", { x: m.x + nx * 6 * k, y: m.y + ny * 6 * k, class: "ep-plan-chaintext", "font-size": fs2, "text-anchor": "middle", "dominant-baseline": "middle" }, String(seg)));
          }
        });
      });
    }

    // трассы (Слой 4): полилинии цветом слоя + проходки
    if (layerOn(project, "routes")) {
      const layerColor = (id) => (((project.layers || []).find((l) => l.id === id) || {}).color) || "#94a3b8";
      (project.routes || []).forEach((rt) => {
        if (!layerOn(project, rt.layer)) return;
        g.appendChild(el("polyline", {
          points: (rt.points || []).map((p) => p.x + "," + p.y).join(" "),
          class: "ep-plan-route", stroke: rt.color || layerColor(rt.layer), "stroke-width": sw * 0.8
        }));
        (rt.throughWalls || []).forEach((c) => g.appendChild(el("circle", {
          cx: c.x, cy: c.y, r: 5 * k, class: "ep-plan-cross", "stroke-width": sw * 0.6
        })));
      });
    }

    // элементы и щиты (Слой 2)
    const TY = (EP.Plan.Elements && EP.Plan.Elements.TYPES) || {};
    const bad = EP.Plan.Rules ? EP.Plan.Rules.badSet() : new Set();
    const selId = EP.Plan.Elements ? EP.Plan.Elements.selectedId() : null;
    const layerColor2 = (id) => (((project.layers || []).find((l) => l.id === id) || {}).color) || "#94a3b8";
    const circ = (id) => (project.circuits || []).find((c) => c.id === id);
    const wallThEl = Math.max(4, (project.settings && project.settings.wallThickness) || 10);
    (project.elements || []).forEach((elem) => {
      if (!layerOn(project, elem.layer)) return;
      const pt = EP.Plan.Geometry.elemPoint(project, elem);
      if (!pt) return;
      const r0 = 11 * k;
      // отступ от стены ВНУТРЬ комнаты + поворот вдоль стены (ЕДИНАЯ точка с трассой)
      const dp = pt.wall ? EP.Plan.Geometry.elemDrawPoint(project, elem) : pt;
      const cx = dp.x, cy = dp.y;
      const rot = dp.angle || 0;
      const grp = el("g", { class: "ep-plan-el" + (elem.status === "mounted" ? " is-done" : "") + (elem.status === "existing" ? " is-exist" : "") + (elem.id === selId ? " is-sel" : "") });
      if (elem.type === "junction") {
        // распайка: ромб (повёрнутый квадрат) на слое трасс — на самой стене, без отступа
        const s2 = 12 * k;
        grp.appendChild(el("rect", { x: pt.x - s2, y: pt.y - s2, width: s2 * 2, height: s2 * 2, transform: `rotate(45 ${pt.x} ${pt.y})`, class: "ep-plan-junction", "stroke-width": sw * 0.7 }));
        if (bad.has(elem.id)) grp.appendChild(el("circle", { cx: pt.x, cy: pt.y, r: r0 * 1.7, class: "ep-plan-warnring", "stroke-width": sw * 0.7 }));
      } else if (elem.type === "block") {
        // рамка постов: поворачивается ВДОЛЬ стены, отступ внутрь
        const items = (elem.params && elem.params.items) || ["socket"];
        const step2 = 16 * k, bw = items.length * step2 + 8 * k, bh = 22 * k;
        const tr = rot ? `rotate(${rot} ${cx} ${cy})` : null;
        if (bad.has(elem.id)) grp.appendChild(el("rect", Object.assign({ x: cx - bw / 2 - 4 * k, y: cy - bh / 2 - 4 * k, width: bw + 8 * k, height: bh + 8 * k, rx: 6 * k, class: "ep-plan-warnring", fill: "none", "stroke-width": sw * 0.7 }, tr ? { transform: tr } : {})));
        grp.appendChild(el("rect", Object.assign({ x: cx - bw / 2, y: cy - bh / 2, width: bw, height: bh, rx: 5 * k, fill: layerColor2(elem.layer), class: "ep-plan-blockrect", "stroke-width": sw * 0.7 }, tr ? { transform: tr } : {})));
        items.forEach((it, i) => grp.appendChild(el("text", Object.assign({
          x: cx - bw / 2 + 4 * k + step2 * i + step2 / 2, y: cy,
          "font-size": 9 * k, "text-anchor": "middle", "dominant-baseline": "central", class: "ep-plan-elglyph"
        }, tr ? { transform: tr } : {}), (TY[it] || {}).glyph || "?")));
        // метка входа штробы (к какому подрозетнику идёт трасса)
        const eIdx = EP.Plan.Geometry.blockEntryIndex(elem);
        const ex = cx - bw / 2 + 4 * k + step2 * Math.min(eIdx, items.length - 1) + step2 / 2;
        grp.appendChild(el("circle", Object.assign({ cx: ex, cy: cy + bh / 2 + 3 * k, r: 2.6 * k, class: "ep-plan-entrymark" }, tr ? { transform: tr } : {})));
      } else {
        if (bad.has(elem.id)) grp.appendChild(el("circle", { cx, cy, r: r0 * 1.55, class: "ep-plan-warnring", "stroke-width": sw * 0.7 }));
        grp.appendChild(el("circle", { cx, cy, r: r0, fill: layerColor2(elem.layer), "stroke-width": sw * 0.7 }));
        grp.appendChild(el("text", { x: cx, y: cy, "font-size": 10 * k, "text-anchor": "middle", "dominant-baseline": "central", class: "ep-plan-elglyph" }, (TY[elem.type] || {}).glyph || "?"));
      }
      if (elem.status === "mounted") grp.appendChild(el("text", { x: cx + r0, y: cy - r0, "font-size": 10 * k, class: "ep-plan-eldone" }, "✓"));
      // QF-подпись линии (обозначение автомата) над точкой
      if (labelsOn && elem.circuitId) {
        const cc = circ(elem.circuitId);
        if (cc) grp.appendChild(el("text", { x: cx, y: cy - r0 - 5 * k, "font-size": 9 * k, "text-anchor": "middle", class: "ep-plan-qf", fill: cc.color }, cc.name));
      }
      g.appendChild(grp);
    });
    const pbox = project.settings && project.settings.panelBox;
    (project.panels || []).forEach((pn) => {
      // габарит щита = реальный корпус (мм→см), иначе типовой квадрат
      const wc = pbox && pbox.wmm ? pbox.wmm / 10 : 28;
      const hc = pbox && pbox.hmm ? pbox.hmm / 10 : 20;
      const grp = el("g", { class: "ep-plan-panel" + (pn.id === selId ? " is-sel" : "") });
      grp.appendChild(el("rect", { x: pn.x - wc / 2, y: pn.y - hc / 2, width: wc, height: hc, rx: 2, "stroke-width": sw * 0.8 }));
      grp.appendChild(el("text", { x: pn.x, y: pn.y, "font-size": 12 * k, "text-anchor": "middle", "dominant-baseline": "central", class: "ep-plan-elglyph" }, "Щ"));
      if (pbox && pbox.modules) grp.appendChild(el("text", { x: pn.x, y: pn.y + hc / 2 + 7 * k, "font-size": 8 * k, "text-anchor": "middle", class: "ep-plan-dim" }, pbox.modules + " мод"));
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

  EP.Plan = EP.Plan || {};
  EP.Plan.Render = { draw, drawScaled, CFG };
})();
