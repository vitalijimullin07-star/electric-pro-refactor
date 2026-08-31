/* Electric Pro V29 — ОБЩАЯ БАЗА КОНТУРОВ КВАРТИР (Слой 2 шаблонов).
   Мастер делится контуром СВОЕЙ квартиры (только стены и размеры), админ модерирует,
   остальные вставляют одобренные контуры как обычный шаблон — не перерисовывая типовую
   планировку заново на каждом объекте той же серии.

   ЧТО УЕЗЖАЕТ: только геометрия комнат — имя, точки контура, толщина/материал стен.
   НЕ уезжает НИЧЕГО из персонального: ни точек/трасс/щитов, ни заказчика, ни адреса
   проекта, ни фото, ни сметы. Это гарантируется функцией strip() ниже, а не аккуратностью
   вызывающего: она СОБИРАЕТ новый объект из белого списка полей, а не удаляет лишние из
   копии проекта (при удалении легко забыть поле, добавленное в модель потом).

   ДВЕ КОЛЛЕКЦИИ, а не одна с флагом «одобрено» — Firestore не умеет прятать ОТДЕЛЬНЫЕ ПОЛЯ
   правилами чтения, только документ целиком:
     plan_layout_subs — приватные заявки (автора видит он сам и админ);
     plan_layouts     — публичные одобренные, поля автора там НЕТ ВООБЩЕ (админ копирует
                        только очищенную геометрию, см. approve()). */
(() => {
  "use strict";
  window.EP = window.EP || {};
  const SUBS = "plan_layout_subs", PUB = "plan_layouts";
  const MAX_ROOMS = 60, MAX_PTS = 80, TITLE_MAX = 120;

  const core = () => EP.Plan.Core;
  const G = () => EP.Plan.Geometry;
  const rooms = () => EP.Plan.Rooms;
  const esc = (s) => String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  function db() { try { return (EP.Firebase && EP.Firebase.db) || null; } catch (e) { return null; } }
  function uid() { try { const u = EP.Auth && EP.Auth.currentUser && EP.Auth.currentUser(); return (u && u.uid) || null; } catch (e) { return null; } }
  function myName() { try { const u = EP.Auth && EP.Auth.currentUser && EP.Auth.currentUser(); return (u && (u.displayName || u.email)) || "мастер"; } catch (e) { return "мастер"; } }
  const ready = () => !!(db() && uid());

  const T = {
    title: "🌐 Общая база контуров",
    hint: "Контуры квартир от других мастеров: только стены и размеры. Вставляются как обычный шаблон — правь под свой обмер.",
    shareBtn: "📤 Поделиться контуром",
    shareHint: "Уедут ТОЛЬКО стены и размеры активного этажа. Точки, трассы, щит, заказчик, адрес и фото не передаются. Появится в базе после проверки администратором.",
    empty: "Пока пусто — общая база наполняется мастерами.",
    off: "Нужен вход в аккаунт и интернет.",
    sent: "Отправлено на проверку — появится в общей базе после одобрения.",
    noRooms: "На этаже нет ни одной комнаты — делиться нечем.",
    applied: (n) => `Вставлено комнат: ${n} — поправь под свой обмер.`
  };

  /* ---------- очистка: белый список полей ---------- */
  function stripRoom(r) {
    const pts = (r.points || []).slice(0, MAX_PTS).map((q) => ({ x: Math.round(q.x), y: Math.round(q.y) }));
    const out = { name: String(r.name || "").slice(0, 40), points: pts };
    if (Array.isArray(r.wallTh)) out.wallTh = r.wallTh.map((v) => (typeof v === "number" ? Math.round(v) : null));
    if (Array.isArray(r.wallMat)) out.wallMat = r.wallMat.map((v) => (typeof v === "string" ? v.slice(0, 24) : null));
    return out;
  }
  // Контур активного этажа проекта, приведённый к нулю (чтобы одобренный шаблон не тащил
  // за собой координаты чужого проекта) и без единого персонального поля.
  function strip(project) {
    if (!project) return null;
    const fp = G().floorScoped(project);
    const src = (fp.rooms || []).filter((r) => (r.points || []).length >= 3).slice(0, MAX_ROOMS);
    if (!src.length) return null;
    const bb = G().projectBBox(fp);
    const dx = bb ? bb.x : 0, dy = bb ? bb.y : 0;
    const list = src.map((r) => {
      const s = stripRoom(r);
      s.points = s.points.map((q) => ({ x: q.x - Math.round(dx), y: q.y - Math.round(dy) }));
      return s;
    });
    const area = list.reduce((a, r) => a + Math.abs(G().area(r.points) || 0), 0) / 10000;
    return {
      rooms: list,
      w: Math.round(bb ? bb.w : 0), h: Math.round(bb ? bb.h : 0),
      areaM2: Math.round(area * 10) / 10,
      wallThickness: Math.round((project.settings && project.settings.wallThickness) || 10),
      wallMaterial: String((project.settings && project.settings.wallMaterial) || "").slice(0, 24)
    };
  }

  /* ---------- отправка заявки ---------- */
  async function submit(title, series) {
    const d = db(), u = uid();
    if (!d || !u) return { ok: false, err: "off" };
    const geo = strip(core() && core().project);
    if (!geo) return { ok: false, err: "empty" };
    const rec = Object.assign({
      by: u, byName: myName(), status: "pending",
      title: String(title || "").trim().slice(0, TITLE_MAX) || "Контур квартиры",
      series: String(series || "").trim().slice(0, 60),
      ts: Date.now()
    }, geo);
    try { await d.collection(SUBS).add(rec); return { ok: true }; }
    catch (e) { return { ok: false, err: (e && e.code) || "fail" }; }
  }

  /* ---------- чтение общей базы ---------- */
  let cache = null, cacheAt = 0;
  const CACHE_MS = 60000;
  async function list(force) {
    const d = db();
    if (!d) return [];
    if (!force && cache && Date.now() - cacheAt < CACHE_MS) return cache;
    try {
      const snap = await d.collection(PUB).orderBy("at", "desc").limit(200).get();
      cache = snap.docs.map((s) => Object.assign({ id: s.id }, s.data()));
      cacheAt = Date.now();
      return cache;
    } catch (e) { return cache || []; }
  }

  /* ---------- вставка в проект (тем же приёмом, что и встроенный шаблон) ---------- */
  function applyLayout(layout) {
    const c = core(), p = c && c.project;
    if (!p || !layout || !(layout.rooms || []).length) return 0;
    c.commit();
    const bb = G().projectBBox(G().floorScoped(p));
    const dx = bb ? bb.x + bb.w + 100 : 0, dy = bb ? bb.y : 0;
    layout.rooms.forEach((r) => {
      const pts = (r.points || []).map((q) => ({ x: q.x + dx, y: q.y + dy }));
      if (pts.length < 3) return;
      const room = c.model.newRoom(pts, r.name || "Комната");
      if (Array.isArray(r.wallTh)) room.wallTh = r.wallTh.slice();
      if (Array.isArray(r.wallMat)) room.wallMat = r.wallMat.slice();
      p.rooms.push(room);
    });
    c.persist("layout-apply");
    return layout.rooms.length;
  }

  /* ---------- модерация (админка) ---------- */
  async function pending() {
    const d = db();
    if (!d) return [];
    try {
      const snap = await d.collection(SUBS).orderBy("ts", "desc").limit(100).get();
      return snap.docs.map((s) => Object.assign({ id: s.id }, s.data()));
    } catch (e) { return []; }
  }
  // Публикуем ОЧИЩЕННЫЕ поля: by/byName в публичную коллекцию не переносятся ВООБЩЕ —
  // читатель одобренного шаблона не должен узнать, чья это квартира.
  async function approve(sub) {
    const d = db();
    if (!d || !sub) return false;
    const pub = {
      title: String(sub.title || "Контур квартиры").slice(0, TITLE_MAX),
      series: String(sub.series || "").slice(0, 60),
      rooms: (sub.rooms || []).slice(0, MAX_ROOMS).map(stripRoom),
      w: Number(sub.w) || 0, h: Number(sub.h) || 0, areaM2: Number(sub.areaM2) || 0,
      wallThickness: Number(sub.wallThickness) || 10,
      wallMaterial: String(sub.wallMaterial || ""),
      at: Date.now()
    };
    try {
      await d.collection(PUB).add(pub);
      await d.collection(SUBS).doc(sub.id).delete();
      cache = null;
      return true;
    } catch (e) { return false; }
  }
  async function reject(sub) {
    const d = db();
    if (!d || !sub) return false;
    try { await d.collection(SUBS).doc(sub.id).delete(); return true; } catch (e) { return false; }
  }
  async function removePublic(id) {
    const d = db();
    if (!d || !id) return false;
    try { await d.collection(PUB).doc(id).delete(); cache = null; return true; } catch (e) { return false; }
  }

  /* ---------- UI: раздел в шторке «🧩 Шаблон» ---------- */
  function sectionHtml(items) {
    const card = (x) => `<button type="button" class="ep-plan-tplcard ep-clickable" data-plan-lay="${esc(x.id)}">
        <b>${esc(x.title)}</b><span>${x.areaM2 ? x.areaM2 + " м² · " : ""}комнат ${(x.rooms || []).length}${x.series ? " · " + esc(x.series) : ""}</span>
      </button>`;
    return `<div class="ep-plan-modehint">${T.title}</div>
      <div class="ep-plan-modehint">${T.hint}</div>
      ${items && items.length ? `<div class="ep-plan-tplgrid">${items.map(card).join("")}</div>`
        : `<div class="ep-plan-modehint">${ready() ? T.empty : T.off}</div>`}
      <div class="ep-plan-srow ep-plan-sbtns">
        <button type="button" class="ep-plan-tbtn ep-clickable" data-plan-lay-share>${T.shareBtn}</button>
      </div>`;
  }
  // раздел дорисовывается в УЖЕ открытую шторку шаблонов: список приходит из сети, а
  // шторку показываем сразу (иначе она «подвисала» бы до ответа Firestore)
  function fillSection() {
    const box = document.getElementById("ep-plan-laybox");
    if (!box) return;
    list().then((items) => {
      const b = document.getElementById("ep-plan-laybox");
      if (b) b.innerHTML = sectionHtml(items);
    });
  }
  function shareHtml() {
    const geo = strip(core() && core().project);
    const p = core() && core().project;
    return `<div class="ep-plan-srow"><b>${T.shareBtn}</b><span class="ep-plan-flex"></span>
        <button type="button" class="ep-plan-mini ep-plan-back ep-clickable" data-plan-lay-back>‹ Назад</button></div>
      <div class="ep-plan-modehint">${T.shareHint}</div>
      ${geo ? `<div class="ep-plan-srow">Уедет: комнат <b>${geo.rooms.length}</b> · ${geo.areaM2} м² · габарит ${Math.round(geo.w / 100 * 10) / 10}×${Math.round(geo.h / 100 * 10) / 10} м</div>`
        : `<div class="ep-plan-modehint">${T.noRooms}</div>`}
      <div class="ep-plan-srow">Название<input type="text" maxlength="120" placeholder="Например: П-44Т, 2-комн, распашонка" value="${esc((p && p.name) || "")}" data-lay-title></div>
      <div class="ep-plan-srow">Серия дома (необязательно)<input type="text" maxlength="60" placeholder="П-44Т / И-155 / улица, дом" data-lay-series></div>
      <div class="ep-plan-srow ep-plan-sbtns">
        <button type="button" class="ep-plan-tbtn ep-clickable" data-plan-lay-send ${geo ? "" : "disabled"}>📤 Отправить на проверку</button>
      </div>`;
  }

  document.addEventListener("click", (e) => {
    if (!rooms() || !rooms().isActive()) return;
    const t = e.target;
    if (t.closest("[data-plan-lay-share]")) { rooms().openSheet(shareHtml()); return; }
    if (t.closest("[data-plan-lay-back]")) { const TP = EP.Plan.Templates; if (TP && TP.openPicker) TP.openPicker(); return; }
    if (t.closest("[data-plan-lay-send]")) {
      const ti = document.querySelector("[data-lay-title]"), se = document.querySelector("[data-lay-series]");
      const title = ti ? ti.value : "", series = se ? se.value : "";
      rooms().toast("Отправляю…");
      submit(title, series).then((r) => {
        rooms().closeSheet();
        rooms().toast(r.ok ? T.sent : (r.err === "empty" ? T.noRooms : T.off));
      });
      return;
    }
    const lay = t.closest("[data-plan-lay]");
    if (lay) {
      const id = lay.getAttribute("data-plan-lay");
      list().then((items) => {
        const x = items.find((v) => v.id === id);
        if (!x) return;
        const n = applyLayout(x);
        rooms().closeSheet();
        if (n) { rooms().toast(T.applied(n)); rooms().renderScene(); const M = EP.Plan.Mount; if (M && M.fitToProject) M.fitToProject(); }
      });
      return;
    }
  });

  EP.Plan = EP.Plan || {};
  EP.Plan.Layouts = { strip, submit, list, applyLayout, pending, approve, reject, removePublic,
    sectionHtml, fillSection, ready, SUBS, PUB, T };
})();
