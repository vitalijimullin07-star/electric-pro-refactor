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
      const matClass = { "Бетон": " mat-concrete", "Кирпич": " mat-brick", "Панель": " mat-panel", "Мягкий": " mat-soft" }[mat] || "";
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

    // двери (дуга открывания) и окна (двойная линия)
    (project.openings || []).forEach((op) => {
      const w = G.wallById(project, op.wallId);
      if (!w) return;
      const a = G.pointAtOffset(w, op.offset), b = G.pointAtOffset(w, op.offset + op.width);
      const dirx = (w.b.x - w.a.x) / (w.len || 1), diry = (w.b.y - w.a.y) / (w.len || 1);
      const nx = -diry * op.flip, ny = dirx * op.flip; // сторона открывания/выступа
      if (op.type === "door") {
        const h = op.hinge === "a" ? a : b, far = op.hinge === "a" ? b : a;
        const leaf = { x: h.x + nx * op.width, y: h.y + ny * op.width };
        const cross = (far.x - h.x) * (leaf.y - h.y) - (far.y - h.y) * (leaf.x - h.x);
        const sweep = cross > 0 ? 1 : 0;
        g.appendChild(el("path", {
          d: `M${far.x} ${far.y} A${op.width} ${op.width} 0 0 ${sweep} ${leaf.x} ${leaf.y}`,
          class: "ep-plan-doorarc", "stroke-width": sw * 0.45, fill: "none"
        }));
        g.appendChild(el("line", { x1: h.x, y1: h.y, x2: leaf.x, y2: leaf.y, class: "ep-plan-doorleaf", "stroke-width": sw * 0.7 }));
      } else {
        const off3 = 3.2 * k;
        [-1, 1].forEach((s) => g.appendChild(el("line", {
          x1: a.x + nx * off3 * s, y1: a.y + ny * off3 * s,
          x2: b.x + nx * off3 * s, y2: b.y + ny * off3 * s,
          class: "ep-plan-window", "stroke-width": sw * 0.5
        })));
        [a, b].forEach((p) => g.appendChild(el("line", {
          x1: p.x + nx * off3, y1: p.y + ny * off3, x2: p.x - nx * off3, y2: p.y - ny * off3,
          class: "ep-plan-window", "stroke-width": sw * 0.5
        })));
      }
    });

    // балки / перемычки на потолке (свободные отрезки)
    (project.beams || []).forEach((bm) => {
      const bw = Math.max(3, bm.width || 20);
      g.appendChild(el("line", { x1: bm.a.x, y1: bm.a.y, x2: bm.b.x, y2: bm.b.y, class: "ep-plan-beam" + (bm.kind === "lintel" ? " is-lintel" : ""), "stroke-width": bw }));
    });
    // черновик балки
    if (ui && ui.beamDraft && ui.beamDraft.a) {
      const d2 = ui.beamDraft;
      if (d2.b) g.appendChild(el("line", { x1: d2.a.x, y1: d2.a.y, x2: d2.b.x, y2: d2.b.y, class: "ep-plan-beam ep-plan-beamdraft", "stroke-width": 20 }));
      g.appendChild(el("circle", { cx: d2.a.x, cy: d2.a.y, r: CFG.pointPx * k, class: "ep-plan-draftpt is-first" }));
    }

    // размерные цепочки: привязки точек и проёмов к углам стены (слой «Размеры»)
    if (dimsOn) {
      (project.rooms || []).forEach((room) => {
        if ((room.points || []).length < 3) return;
        const c0 = G.centroid(room.points);
        G.walls(room).forEach((w) => {
          const stations = new Set([0, Math.round(w.len)]);
          (project.elements || []).forEach((e2) => { if (e2.wallId === w.id) stations.add(Math.round(e2.offset)); });
          G.openingsOnWall(project, w.id).forEach((o) => { stations.add(Math.round(o.offset)); stations.add(Math.round(o.offset + o.width)); });
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
    (project.elements || []).forEach((elem) => {
      if (!layerOn(project, elem.layer)) return;
      const pt = EP.Plan.Geometry.elemPoint(project, elem);
      if (!pt) return;
      const r0 = 11 * k;
      const grp = el("g", { class: "ep-plan-el" + (elem.status === "mounted" ? " is-done" : "") + (elem.status === "existing" ? " is-exist" : "") + (elem.id === selId ? " is-sel" : "") });
      if (elem.type === "junction") {
        // распайка: ромб (повёрнутый квадрат) на слое трасс
        const s2 = 12 * k;
        grp.appendChild(el("rect", { x: pt.x - s2, y: pt.y - s2, width: s2 * 2, height: s2 * 2, transform: `rotate(45 ${pt.x} ${pt.y})`, class: "ep-plan-junction", "stroke-width": sw * 0.7 }));
        if (bad.has(elem.id)) grp.appendChild(el("circle", { cx: pt.x, cy: pt.y, r: r0 * 1.7, class: "ep-plan-warnring", "stroke-width": sw * 0.7 }));
      } else if (elem.type === "block") {
        // рамка постов: скруглённый прямоугольник с глифами внутри
        const items = (elem.params && elem.params.items) || ["socket"];
        const step2 = 16 * k, bw = items.length * step2 + 8 * k, bh = 22 * k;
        if (bad.has(elem.id)) grp.appendChild(el("rect", { x: pt.x - bw / 2 - 4 * k, y: pt.y - bh / 2 - 4 * k, width: bw + 8 * k, height: bh + 8 * k, rx: 6 * k, class: "ep-plan-warnring", fill: "none", "stroke-width": sw * 0.7 }));
        grp.appendChild(el("rect", { x: pt.x - bw / 2, y: pt.y - bh / 2, width: bw, height: bh, rx: 5 * k, fill: layerColor2(elem.layer), class: "ep-plan-blockrect", "stroke-width": sw * 0.7 }));
        items.forEach((it, i) => grp.appendChild(el("text", {
          x: pt.x - bw / 2 + 4 * k + step2 * i + step2 / 2, y: pt.y,
          "font-size": 9 * k, "text-anchor": "middle", "dominant-baseline": "central", class: "ep-plan-elglyph"
        }, (TY[it] || {}).glyph || "?")));
      } else {
        if (bad.has(elem.id)) grp.appendChild(el("circle", { cx: pt.x, cy: pt.y, r: r0 * 1.55, class: "ep-plan-warnring", "stroke-width": sw * 0.7 }));
        grp.appendChild(el("circle", { cx: pt.x, cy: pt.y, r: r0, fill: layerColor2(elem.layer), "stroke-width": sw * 0.7 }));
        grp.appendChild(el("text", { x: pt.x, y: pt.y, "font-size": 10 * k, "text-anchor": "middle", "dominant-baseline": "central", class: "ep-plan-elglyph" }, (TY[elem.type] || {}).glyph || "?"));
      }
      if (elem.status === "mounted") grp.appendChild(el("text", { x: pt.x + r0, y: pt.y - r0, "font-size": 10 * k, class: "ep-plan-eldone" }, "✓"));
      // QF-подпись линии (обозначение автомата) над точкой
      if (labelsOn && elem.circuitId) {
        const cc = circ(elem.circuitId);
        if (cc) grp.appendChild(el("text", { x: pt.x, y: pt.y - r0 - 5 * k, "font-size": 9 * k, "text-anchor": "middle", class: "ep-plan-qf", fill: cc.color }, cc.name));
      }
      g.appendChild(grp);
    });
    (project.panels || []).forEach((pn) => {
      const s2 = 14 * k;
      const grp = el("g", { class: "ep-plan-panel" + (pn.id === selId ? " is-sel" : "") });
      grp.appendChild(el("rect", { x: pn.x - s2, y: pn.y - s2, width: s2 * 2, height: s2 * 2, rx: 3 * k, "stroke-width": sw * 0.8 }));
      grp.appendChild(el("text", { x: pn.x, y: pn.y, "font-size": 12 * k, "text-anchor": "middle", "dominant-baseline": "central", class: "ep-plan-elglyph" }, "Щ"));
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
