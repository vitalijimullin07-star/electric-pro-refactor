/* ============================================================
   Electric Pro V29 — СОВМЕСТНАЯ база данных (два мастера над одной «Моей БД»)
   Просьба пользователя: «добавить пользователя к моей базе данных», у него —
   «принять», после этого работаем вдвоём; «если первый или второй отключается,
   то она становится индивидуальной у каждой»; уведомления «эта позиция изменена,
   эта добавлена»; и «поиск пользователя», чтобы его найти и подключить.

   Firestore:
     db_share/{pairId}  — приглашение/связка: {from,to,uids:[a,b],fromName,toName,
                          status:"pending"|"ok",ts,at}. pairId = отсортированные uid
                          через "__" (как chat_contacts) — повторная заявка не плодит дубли.
     db_ops/{opId}      — журнал изменений: {pair,uids,by,byName,kind:"add"|"update"|
                          "delete",itemId,item,name,ts,at}. Оба подписаны, чужие операции
                          применяются к своей «Моей БД» и дают уведомление.

   ПОЧЕМУ ЖУРНАЛ, А НЕ ОБЩИЙ ДОКУМЕНТ БАЗЫ: у каждого мастера своя «Моя БД» в
   localStorage/user_db, и отключение обязано ОСТАВИТЬ данные у обоих («становится
   индивидуальной»). Журнал операций это даёт бесплатно: пока связка активна — обе
   базы идут синхронно, связку удалили — просто перестали обмениваться, у каждого
   остаётся полная копия. Плюс из журнала сразу получаются уведомления об изменениях.

   Как ловим свои изменения: НЕ трогаем database-core.js — слушаем его же событие
   ep:db-changed и сравниваем снимок «Моей БД» до/после (diffItems). Так покрыты ВСЕ
   пути правки (добавление, редактирование, удаление, перемещение, импорт, CSV).
   ============================================================ */
(() => {
  "use strict";
  window.EP = window.EP || {};

  const SHARE = "db_share", OPS = "db_ops";
  const SEEN_KEY = "ep_dbshare_seen_v1";   // применённые операции (чтобы не применять дважды)
  const SEED_KEY = "ep_dbshare_seeded_v1"; // пары, которым свою базу уже отправляли
  const SNAP_KEY = "ep_dbshare_snap_v1";   // снимок «Моей БД» для diff
  const NOTES_KEY = "ep_dbshare_notes_v1"; // уведомления об изменениях
  const OPS_LIMIT = 200, NOTES_MAX = 40, SEEN_MAX = 400;

  const state = {
    incoming: [],   // мне прислали заявку (нужно «Принять»)
    outgoing: [],   // я отправил, ждём
    active: null,   // активная связка (status ok)
    people: [],     // кого нашли для подключения
    notes: [],      // уведомления об изменениях
    error: ""
  };
  let unsubShare = null, unsubOps = null, applying = false, started = false;

  /* ---------- служебное ---------- */
  function db() {
    try { if (window.EP.Firebase) { if (!EP.Firebase.ready && EP.Firebase.init) EP.Firebase.init(); return EP.Firebase.db || null; } } catch (e) {}
    return null;
  }
  function me() { try { return (EP.Auth && EP.Auth.currentUser && EP.Auth.currentUser()) || (EP.state && EP.state.user) || {}; } catch (e) { return {}; } }
  function uid() { return me().uid || null; }
  function myName() { const u = me(); return u.displayName || u.name || u.email || "Мастер"; }
  function DB() { return window.EP && window.EP.Database; }
  function sts() { try { return firebase.firestore.FieldValue.serverTimestamp(); } catch (e) { return Date.now(); } }
  function pairIdOf(a, b) { return [String(a), String(b)].sort().join("__"); }
  function lsGet(k, dflt) { try { const v = JSON.parse(localStorage.getItem(k) || "null"); return v == null ? dflt : v; } catch (e) { return dflt; } }
  function lsSet(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
  function emit() { try { window.dispatchEvent(new CustomEvent("ep:dbshare-changed", { detail: { active: !!state.active, notes: state.notes.length } })); } catch (e) {} }

  /* ---------- уведомления ---------- */
  function noteText(op) {
    const who = op.byName || "партнёр";
    const nm = op.name || "позиция";
    if (op.kind === "add") return "➕ «" + nm + "» добавил " + who;
    if (op.kind === "delete") return "🗑️ «" + nm + "» удалил " + who;
    return "✏️ «" + nm + "» изменил " + who;
  }
  function addNote(op) {
    state.notes.unshift({ id: op.id || ("n" + Date.now()), text: noteText(op), ts: op.ts || Date.now(), kind: op.kind });
    if (state.notes.length > NOTES_MAX) state.notes.length = NOTES_MAX;
    lsSet(NOTES_KEY, state.notes);
  }
  function notes() { return state.notes.slice(); }
  function clearNotes() { state.notes = []; lsSet(NOTES_KEY, state.notes); emit(); }

  /* ---------- сравнение снимков «Моей БД» (чистая функция, покрыта тестами) ---------- */
  function itemKeyFields(it) {
    return {
      id: String(it.id), name: String(it.name || ""), type: it.type === "work" ? "work" : "material",
      unit: String(it.unit || ""), price: Number(it.price) || 0,
      category: String(it.category || ""), subcategory: String(it.subcategory || "")
    };
  }
  function sameItem(a, b) {
    const x = itemKeyFields(a), y = itemKeyFields(b);
    return x.name === y.name && x.type === y.type && x.unit === y.unit && x.price === y.price
      && x.category === y.category && x.subcategory === y.subcategory;
  }
  function diffItems(prev, next) {
    const P = new Map((prev || []).map((x) => [String(x.id), x]));
    const N = new Map((next || []).map((x) => [String(x.id), x]));
    const ops = [];
    N.forEach((it, id) => {
      const was = P.get(id);
      if (!was) ops.push({ kind: "add", itemId: id, item: it, name: it.name || "" });
      else if (!sameItem(was, it)) ops.push({ kind: "update", itemId: id, item: it, name: it.name || "" });
    });
    P.forEach((it, id) => {
      if (!N.has(id)) ops.push({ kind: "delete", itemId: id, item: null, name: it.name || "" });
    });
    return ops;
  }
  function myItems() {
    const d = DB();
    if (!d) return [];
    try { return (d.getLocalItems ? d.getLocalItems("my") : d.getItems("my")) || []; } catch (e) { return []; }
  }
  function baseline() { lsSet(SNAP_KEY, myItems().map(itemKeyFields)); }

  /* ---------- отправка своих изменений в журнал ---------- */
  function pushOps(ops) {
    const f = db(), u = uid(), act = state.active;
    if (!f || !u || !act || !ops.length) return;
    const nm = myName();
    ops.slice(0, 50).forEach((op) => {
      f.collection(OPS).add({
        pair: act.id, uids: act.uids.slice(), by: u, byName: nm,
        kind: op.kind, itemId: String(op.itemId), item: op.item || null,
        name: String(op.name || ""), ts: Date.now(), at: sts()
      }).catch(() => {});
    });
  }
  function onDbChanged(e) {
    if (applying) return;                       // применяем чужое — своих операций не плодим
    const base = e && e.detail && e.detail.base;
    if (base && base !== "my") return;          // делимся только «Моей БД»
    const prev = lsGet(SNAP_KEY, null);
    const next = myItems();
    baseline();
    if (!state.active || prev == null) return;
    pushOps(diffItems(prev, next));
  }

  /* ---------- применение чужих изменений ---------- */
  function seenList() { return lsGet(SEEN_KEY, []); }
  function markSeen(id) {
    const s = seenList();
    if (s.indexOf(id) >= 0) return false;
    s.push(id);
    if (s.length > SEEN_MAX) s.splice(0, s.length - SEEN_MAX);
    lsSet(SEEN_KEY, s);
    return true;
  }
  function applyOp(op) {
    const d = DB();
    if (!d) return false;
    applying = true;
    try {
      if (op.kind === "delete") { d.deleteMyItems([String(op.itemId)]); return true; }
      const it = op.item || null;
      if (!it) return false;
      const mine = (d.getLocalItems ? d.getLocalItems("my") : d.getItems("my") || []).find((x) => String(x.id) === String(op.itemId));
      // позиция уже такая же (например, партнёр при подключении прислал нам наши же
      // позиции обратно) — ничего не меняем и уведомление не показываем
      if (mine && sameItem(mine, Object.assign({ id: op.itemId }, it))) return false;
      if (mine) d.updateMyItem(String(op.itemId), it);
      else d.addMyItem(Object.assign({}, it, { id: String(op.itemId) }));
      return true;
    } catch (e) { return false; }
    finally { applying = false; baseline(); }
  }

  /* ---------- подписки ---------- */
  function stopOps() { if (unsubOps) { try { unsubOps(); } catch (e) {} unsubOps = null; } }
  function subscribeOps() {
    stopOps();
    const f = db(), u = uid(), act = state.active;
    if (!f || !u || !act) return;
    try {
      unsubOps = f.collection(OPS).where("uids", "array-contains", u).limit(OPS_LIMIT)
        .onSnapshot((snap) => {
          const list = [];
          snap.forEach((doc) => list.push(Object.assign({ id: doc.id }, doc.data())));
          list.sort((a, b) => (a.ts || 0) - (b.ts || 0));
          let changed = false;
          list.forEach((op) => {
            if (op.pair !== act.id || op.by === u) return;   // свои операции не применяем
            if (!markSeen(op.id)) return;                    // уже применяли
            if (applyOp(op)) { addNote(op); changed = true; }
          });
          if (changed) emit();
        }, (err) => { state.error = (err && err.code) || "ops-error"; emit(); });
    } catch (e) { state.error = "ops-error"; }
  }
  function subscribeShare() {
    const f = db(), u = uid();
    if (!f || !u) return;
    if (unsubShare) { try { unsubShare(); } catch (e) {} unsubShare = null; }
    try {
      unsubShare = f.collection(SHARE).where("uids", "array-contains", u)
        .onSnapshot((snap) => {
          const inc = [], out = [];
          let act = null;
          snap.forEach((doc) => {
            const d = Object.assign({ id: doc.id }, doc.data());
            if (d.status === "ok") act = d;
            else if (d.to === u) inc.push(d);
            else out.push(d);
          });
          const wasActive = state.active && state.active.id;
          state.incoming = inc; state.outgoing = out; state.active = act;
          if (act && act.id !== wasActive) { baseline(); subscribeOps(); seedBase(act); }
          // связку удалили/разорвали — база снова индивидуальная у каждого,
          // данные остаются как есть, просто перестаём обмениваться
          if (!act && wasActive) { stopOps(); }
          emit();
        }, (err) => { state.error = (err && err.code) || "share-error"; emit(); });
    } catch (e) { state.error = "share-error"; }
  }

  // Отправить партнёру СВОЮ базу целиком — делают ОБЕ стороны в момент, когда связка
  // стала активной (иначе база приглашающего до партнёра не доехала бы: он сам ничего
  // не менял, а diff шлёт только изменения). Один раз на пару — SEED_KEY.
  function seedBase(act) {
    if (!act || act.status !== "ok") return;
    const seeded = lsGet(SEED_KEY, []);
    if (seeded.indexOf(act.id) >= 0) return;
    seeded.push(act.id);
    if (seeded.length > 20) seeded.splice(0, seeded.length - 20);
    lsSet(SEED_KEY, seeded);
    pushOps(myItems().map((it) => ({ kind: "add", itemId: String(it.id), item: it, name: it.name || "" })));
  }

  /* ---------- поиск пользователей (каталог — chat_presence, как в чате) ---------- */
  function findPeople(query) {
    const f = db(), u = uid();
    if (!f || !u) return Promise.resolve([]);
    const q = String(query || "").trim().toLowerCase();
    return f.collection("chat_presence").limit(200).get().then((snap) => {
      const out = [];
      snap.forEach((doc) => {
        if (doc.id === u) return;
        const d = doc.data() || {};
        const name = String(d.name || doc.id);
        if (q && name.toLowerCase().indexOf(q) < 0) return;
        out.push({ uid: doc.id, name: name, at: Number(d.at) || 0, online: (Date.now() - (Number(d.at) || 0)) < 5 * 60 * 1000 });
      });
      out.sort((a, b) => (b.at || 0) - (a.at || 0));
      state.people = out;
      emit();
      return out;
    }).catch((e) => { state.error = (e && e.code) || "people-error"; emit(); return []; });
  }

  /* ---------- действия ---------- */
  function invite(theirUid, theirName) {
    const f = db(), u = uid();
    if (!f || !u) return Promise.reject(new Error("offline"));
    if (!theirUid || theirUid === u) return Promise.reject(new Error("bad-uid"));
    if (state.active) return Promise.reject(new Error("already-shared"));
    const id = pairIdOf(u, theirUid);
    return f.collection(SHARE).doc(id).set({
      from: u, to: String(theirUid), uids: [u, String(theirUid)].sort(),
      fromName: myName(), toName: String(theirName || ""),
      status: "pending", ts: Date.now(), at: sts()
    });
  }
  // принял — с этого момента работаем вдвоём: обе базы сливаются в объединение
  // (свои позиции отправляем партнёру, его придут журналом и применятся к нам)
  function accept(pairId) {
    const f = db(), u = uid();
    if (!f || !u) return Promise.reject(new Error("offline"));
    const rec = state.incoming.find((x) => x.id === pairId) || { id: pairId };
    return f.collection(SHARE).doc(pairId).update({ status: "ok", at: sts() }).then(() => {
      state.active = Object.assign({}, rec, { status: "ok" });
      baseline(); subscribeOps(); seedBase(state.active);   // свою базу отправляем один раз на пару
    });
  }
  function decline(pairId) { return stop(pairId); }
  // отключение любой из сторон: связка удаляется, база у каждого остаётся своей
  function stop(pairId) {
    const f = db();
    const id = pairId || (state.active && state.active.id) || (state.outgoing[0] && state.outgoing[0].id);
    if (!f || !id) return Promise.reject(new Error("no-share"));
    return f.collection(SHARE).doc(id).delete().then(() => {
      stopOps(); state.active = null;
      lsSet(SEED_KEY, lsGet(SEED_KEY, []).filter((x) => x !== id));  // подключимся снова — базы сольются заново
      emit();
    });
  }
  function partnerName() {
    const a = state.active, u = uid();
    if (!a) return "";
    return String((a.from === u ? a.toName : a.fromName) || "партнёр");
  }
  function getState() {
    return {
      active: state.active ? { id: state.active.id, partner: partnerName() } : null,
      incoming: state.incoming.slice(), outgoing: state.outgoing.slice(),
      people: state.people.slice(), notes: notes(), error: state.error
    };
  }

  function start() {
    if (started) return;
    started = true;
    state.notes = lsGet(NOTES_KEY, []);
    if (lsGet(SNAP_KEY, null) == null) baseline();
    window.addEventListener("ep:db-changed", onDbChanged);
    window.addEventListener("ep:auth-changed", () => {
      state.incoming = []; state.outgoing = []; state.active = null;
      stopOps(); subscribeShare();
    });
    subscribeShare();
  }
  if (typeof window !== "undefined" && window.addEventListener) {
    window.addEventListener("DOMContentLoaded", start);
    if (document && document.readyState !== "loading") start();
  }

  window.EP.DbShare = {
    start, getState, notes, clearNotes, findPeople, invite, accept, decline, stop,
    partnerName, isActive: () => !!state.active,
    // для тестов и повторного использования
    diffItems, applyOp, pairIdOf, baseline
  };
})();
