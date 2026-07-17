/* Electric Pro V29 — Проект квартиры: шаблоны квартир.
   Готовый набор комнатных раскладок — общие категории по числу комнат и
   ПРИБЛИЖЁННЫЕ типовые серии домов (П-44/И-155/«Хрущёвка»/КОПЭ). Это не
   чертежи БТИ конкретных объектов — разумные пропорции по типу серии,
   стартовый каркас: после вставки комнаты правятся руками как обычные
   нарисованные (та же модель, тот же undo). Вставляется на АКТИВНЫЙ этаж
   текущего проекта, правее уже нарисованного (если что-то уже есть). */
(() => {
  "use strict";
  window.EP = window.EP || {};

  const T = {
    title: "🧩 Шаблон квартиры", close: "✕",
    catsTitle: "По количеству комнат", seriesTitle: "По серии дома",
    seriesNote: "Пропорции по типовым сериям — ПРИБЛИЖЁННО, не чертёж БТИ конкретного дома. После вставки комнаты можно свободно менять.",
    applied: (n) => `Добавлено комнат: ${n} — поправь под реальные размеры объекта.`
  };

  const core = () => EP.Plan.Core;
  const G = () => EP.Plan.Geometry;
  const rooms = () => EP.Plan.Rooms;

  // ряды комнат: [[{name,w,h}...], ...] — комнаты ряда слева направо, ряды друг
  // под другом (СМ). Смежные прямоугольники касаются координатами — общая
  // стена определяется тем же way, что и у любых двух нарисованных вручную
  // комнат (см. G.wallAt: совпадающая centerline двух соседей).
  function layoutRows(rows) {
    let y = 0;
    const list = [];
    rows.forEach((row) => {
      let x = 0;
      const rowH = Math.max(...row.map((r) => r.h));
      row.forEach((r) => {
        list.push({ name: r.name, points: [{ x, y }, { x: x + r.w, y }, { x: x + r.w, y: y + r.h }, { x, y: y + r.h }] });
        x += r.w;
      });
      y += rowH;
    });
    return list;
  }

  const CATEGORIES = [
    { id: "studio", name: "Студия", area: "~20 м²", build: () => layoutRows([
      [{ name: "Прихожая", w: 150, h: 180 }, { name: "Санузел", w: 180, h: 180 }],
      [{ name: "Кухня-гостиная", w: 330, h: 450 }]
    ]) },
    { id: "r1", name: "1-комнатная", area: "~35 м²", build: () => layoutRows([
      [{ name: "Прихожая", w: 150, h: 180 }, { name: "Санузел", w: 180, h: 180 }, { name: "Кухня", w: 250, h: 180 }],
      [{ name: "Комната", w: 580, h: 380 }]
    ]) },
    { id: "r2j", name: "2-комнатная (смежная)", area: "~46 м²", build: () => layoutRows([
      [{ name: "Прихожая", w: 150, h: 180 }, { name: "Санузел", w: 180, h: 180 }, { name: "Кухня", w: 280, h: 180 }],
      [{ name: "Комната 1 (проходная)", w: 300, h: 380 }, { name: "Комната 2", w: 310, h: 380 }]
    ]) },
    { id: "r2s", name: "2-комнатная (раздельная)", area: "~50 м²", build: () => layoutRows([
      [{ name: "Прихожая", w: 200, h: 180 }, { name: "Санузел", w: 180, h: 180 }, { name: "Кухня", w: 280, h: 180 }],
      [{ name: "Комната 1", w: 330, h: 380 }, { name: "Комната 2", w: 330, h: 380 }]
    ]) },
    { id: "r3", name: "3-комнатная", area: "~68 м²", build: () => layoutRows([
      [{ name: "Прихожая", w: 200, h: 180 }, { name: "Ванная", w: 150, h: 180 }, { name: "Туалет", w: 90, h: 180 }, { name: "Кухня", w: 300, h: 180 }],
      [{ name: "Комната 1", w: 250, h: 400 }, { name: "Комната 2", w: 240, h: 400 }, { name: "Комната 3", w: 250, h: 400 }]
    ]) }
  ];

  const SERIES = [
    { id: "khr1", name: "«Хрущёвка», 1-комн.", area: "~30 м²", build: () => layoutRows([
      [{ name: "Прихожая", w: 130, h: 150 }, { name: "Санузел", w: 150, h: 150 }, { name: "Кухня", w: 200, h: 150 }],
      [{ name: "Комната", w: 480, h: 350 }]
    ]) },
    { id: "khr2", name: "«Хрущёвка», 2-комн.", area: "~44 м²", build: () => layoutRows([
      [{ name: "Прихожая", w: 130, h: 150 }, { name: "Санузел", w: 150, h: 150 }, { name: "Кухня", w: 210, h: 150 }],
      [{ name: "Комната 1 (проходная)", w: 240, h: 360 }, { name: "Комната 2", w: 250, h: 360 }]
    ]) },
    { id: "p44-2", name: "П-44, 2-комн.", area: "~53 м²", build: () => layoutRows([
      [{ name: "Прихожая", w: 200, h: 190 }, { name: "Санузел", w: 190, h: 190 }, { name: "Кухня", w: 300, h: 190 }],
      [{ name: "Комната 1", w: 340, h: 390 }, { name: "Комната 2", w: 350, h: 390 }]
    ]) },
    { id: "p44-3", name: "П-44, 3-комн.", area: "~72 м²", build: () => layoutRows([
      [{ name: "Прихожая", w: 220, h: 190 }, { name: "Санузел", w: 190, h: 190 }, { name: "Кухня", w: 320, h: 190 }],
      [{ name: "Комната 1", w: 250, h: 400 }, { name: "Комната 2", w: 240, h: 400 }, { name: "Комната 3", w: 240, h: 400 }]
    ]) },
    { id: "i155-2", name: "И-155, 2-комн.", area: "~58 м²", build: () => layoutRows([
      [{ name: "Прихожая", w: 220, h: 200 }, { name: "Санузел", w: 200, h: 200 }, { name: "Кухня", w: 330, h: 200 }],
      [{ name: "Комната 1", w: 370, h: 400 }, { name: "Комната 2", w: 380, h: 400 }]
    ]) },
    { id: "kope-2", name: "КОПЭ, 2-комн.", area: "~54 м²", build: () => layoutRows([
      [{ name: "Прихожая", w: 200, h: 190 }, { name: "Санузел", w: 190, h: 190 }, { name: "Кухня", w: 290, h: 190 }],
      [{ name: "Комната 1", w: 330, h: 400 }, { name: "Комната 2", w: 340, h: 400 }]
    ]) }
  ];

  function findTpl(id) {
    return CATEGORIES.find((t) => t.id === id) || SERIES.find((t) => t.id === id) || null;
  }

  // Вставляет комнаты шаблона в ТЕКУЩИЙ проект на активный этаж — правее уже
  // нарисованного на этом этаже (если что-то уже есть), иначе от нуля.
  // Возвращает число добавленных комнат (0, если шаблон/проект не найден).
  function apply(tplId) {
    const tpl = findTpl(tplId);
    const c = core(), p = c && c.project;
    if (!tpl || !p) return 0;
    const built = tpl.build();
    if (!built.length) return 0;
    c.commit();
    const bb = G().projectBBox(G().floorScoped(p));
    const dx = bb ? bb.x + bb.w + 100 : 0; // отступ 100см правее уже нарисованного на этаже
    const dy = bb ? bb.y : 0;
    built.forEach((r) => {
      const pts = r.points.map((pt) => ({ x: pt.x + dx, y: pt.y + dy }));
      p.rooms.push(c.model.newRoom(pts, r.name));
    });
    c.persist("template-apply");
    return built.length;
  }

  function pickerHtml() {
    const card = (t) => `<button type="button" class="ep-plan-tplcard ep-clickable" data-plan-tpl="${t.id}">
        <b>${t.name}</b><span>${t.area}</span>
      </button>`;
    return `<div class="ep-plan-srow"><b>${T.title}</b><span class="ep-plan-flex"></span><button type="button" class="ep-plan-mini ep-clickable" data-plan-tpl-close>${T.close}</button></div>
      <div class="ep-plan-modehint">${T.catsTitle}</div>
      <div class="ep-plan-tplgrid">${CATEGORIES.map(card).join("")}</div>
      <div class="ep-plan-modehint">${T.seriesTitle}</div>
      <div class="ep-plan-modehint">${T.seriesNote}</div>
      <div class="ep-plan-tplgrid">${SERIES.map(card).join("")}</div>`;
  }
  function sheetPicker() {
    if (!rooms()) return;
    rooms().openSheet(pickerHtml());
  }

  document.addEventListener("click", (e) => {
    if (!rooms() || !rooms().isActive()) return;
    if (e.target.closest("[data-plan-tpl-open]")) return sheetPicker();
    if (e.target.closest("[data-plan-tpl-close]")) { rooms().closeSheet(); return; }
    const btn = e.target.closest("[data-plan-tpl]");
    if (btn) {
      const n = apply(btn.getAttribute("data-plan-tpl"));
      rooms().closeSheet();
      if (n) { rooms().toast(T.applied(n)); rooms().renderScene(); }
      return;
    }
  });

  EP.Plan = EP.Plan || {};
  EP.Plan.Templates = { CATEGORIES, SERIES, apply, pickerHtml };
})();
