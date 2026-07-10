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
      const d = "M" + pts.map((p) => p.x + " " + p.y).join(" L") + (closed ? " Z" : "");
      g.appendChild(el("path", { d, class: "ep-plan-wall" + (sel ? " is-sel" : ""), "stroke-width": sw, fill: "none" }));

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

    // трассы (Слой 4): полилинии цветом слоя + проходки
    if (layerOn(project, "routes")) {
      const layerColor = (id) => (((project.layers || []).find((l) => l.id === id) || {}).color) || "#94a3b8";
      (project.routes || []).forEach((rt) => {
        if (!layerOn(project, rt.layer)) return;
        g.appendChild(el("polyline", {
          points: (rt.points || []).map((p) => p.x + "," + p.y).join(" "),
          class: "ep-plan-route", stroke: layerColor(rt.layer), "stroke-width": sw * 0.8
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
    (project.elements || []).forEach((elem) => {
      if (!layerOn(project, elem.layer)) return;
      const pt = EP.Plan.Geometry.elemPoint(project, elem);
      if (!pt) return;
      const r0 = 11 * k;
      const grp = el("g", { class: "ep-plan-el" + (elem.status === "mounted" ? " is-done" : "") + (elem.status === "existing" ? " is-exist" : "") + (elem.id === selId ? " is-sel" : "") });
      if (bad.has(elem.id)) grp.appendChild(el("circle", { cx: pt.x, cy: pt.y, r: r0 * 1.55, class: "ep-plan-warnring", "stroke-width": sw * 0.7 }));
      grp.appendChild(el("circle", { cx: pt.x, cy: pt.y, r: r0, fill: layerColor2(elem.layer), "stroke-width": sw * 0.7 }));
      grp.appendChild(el("text", { x: pt.x, y: pt.y, "font-size": 10 * k, "text-anchor": "middle", "dominant-baseline": "central", class: "ep-plan-elglyph" }, (TY[elem.type] || {}).glyph || "?"));
      if (elem.status === "mounted") grp.appendChild(el("text", { x: pt.x + r0, y: pt.y - r0, "font-size": 10 * k, class: "ep-plan-eldone" }, "✓"));
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
