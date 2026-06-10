/* ============================================================
   Electric Pro V29 — Database / Firestore Sync
   Отвечает ТОЛЬКО за связь localStorage <-> Firestore.
   Пути (как в инструкции):
     БД сервера : server_database/{itemId}
     Моя БД     : users/{uid}/my_database/{itemId}
   Firebase: compat SDK через EP.Firebase.db (firebase.firestore()).
   Безопасность данных: пустой Firestore НЕ затирает непустой локальный кэш.
   Безопасность ключей: читаем подколлекцию my_database, НЕ документ
   users/{uid} (там openaiKey/geminiKey) — ключи не попадают в кэш.
   Не делает deploy, не меняет rules/functions. Логи — только ошибки.
   ============================================================ */
(() => {
  "use strict";
  window.EP = window.EP || {};

  const PATHS = { server: "server_database", usersCol: "users", myDbSub: "my_database" };
  const status = {
    state: "init",        // init|connected|signed-out|error|permission-denied|cache
    lastSync: null,
    serverCount: null,
    myCount: null,
    serverEmptyRemote: null,
    myEmptyRemote: null,
    message: ""
  };

  function db() {
    try {
      if (window.EP.Firebase) {
        if (!EP.Firebase.ready && EP.Firebase.init) EP.Firebase.init();
        return EP.Firebase.db || null;
      }
    } catch (e) {}
    return null;
  }
  function uid() {
    try { return ((EP.Auth && EP.Auth.currentUser && EP.Auth.currentUser()) || (EP.state && EP.state.user) || {}).uid || null; }
    catch (e) { return null; }
  }
  function isAdmin() { try { return !!(EP.Auth && EP.Auth.isAdmin && EP.Auth.isAdmin()); } catch (e) { return false; } }
  function now() { return new Date().toISOString(); }
  function logErr(tag, e) { try { console.warn("[" + tag + "]", (e && (e.code || e.message)) || e); } catch (_) {} }

  function setState(st, msg) {
    status.state = st;
    if (msg != null) status.message = msg;
    window.dispatchEvent(new CustomEvent("ep:db-sync-status", { detail: Object.assign({}, status) }));
  }
  function getStatus() { return Object.assign({}, status); }

  function handleErr(tag, e) {
    logErr(tag, e);
    if (e && e.code === "permission-denied") { setState("permission-denied", "Нет прав (permission-denied)"); return { ok: false, error: "permission-denied" }; }
    setState("error", "Ошибка: " + ((e && (e.code || e.message)) || e));
    return { ok: false, error: String((e && (e.code || e.message)) || e) };
  }

  // позиция -> документ Firestore (нормализованный формат, без потери старого)
  function toDoc(item, sourceDb, byUid) {
    const it = EP.Database.normalizeItem(item, item && item.type);
    return {
      id: it.id, name: it.name, type: it.type,
      category: it.category, subcategory: it.subcategory,
      unit: it.unit, price: it.price, currency: it.currency || "RUB",
      source: "v29", sourceDb: sourceDb,
      active: it.active !== false, deleted: it.deleted === true,
      updatedAt: now(), updatedBy: byUid || uid() || null,
      raw: Object.assign({}, item)
    };
  }
  // документ Firestore -> позиция (нормализатор понимает и старые короткие поля)
  function fromDoc(id, data) {
    return EP.Database.normalizeItem(Object.assign({}, data || {}, { id: id }), data && data.type);
  }

  async function readCollection(ref) {
    const snap = await ref.get();
    const out = [];
    snap.forEach((d) => out.push(fromDoc(d.id, d.data())));
    return out;
  }

  async function downloadServerDb() {
    const d = db(); if (!d) return null;
    return await readCollection(d.collection(PATHS.server));
  }
  async function downloadMyDb(forUid) {
    const d = db(); const u = forUid || uid(); if (!d || !u) return null;
    return await readCollection(d.collection(PATHS.usersCol).doc(u).collection(PATHS.myDbSub));
  }

  async function writeItems(colRef, items, sourceDb, byUid) {
    const d = db(); if (!d) throw new Error("no-db");
    const list = (items || []).map((x) => EP.Database.normalizeItem(x, x && x.type));
    for (let i = 0; i < list.length; i += 400) {
      const batch = d.batch();
      list.slice(i, i + 400).forEach((it) => batch.set(colRef.doc(it.id), toDoc(it, sourceDb, byUid), { merge: true }));
      await batch.commit();
    }
    return list.length;
  }

  async function uploadMyDb(forUid, items) {
    const d = db(); const u = forUid || uid(); if (!d || !u) throw new Error("no-uid");
    return await writeItems(d.collection(PATHS.usersCol).doc(u).collection(PATHS.myDbSub), items, "my", u);
  }
  async function uploadServerDb(items) {
    const d = db(); if (!d) throw new Error("no-db");
    return await writeItems(d.collection(PATHS.server), items, "server", uid());
  }

  async function uploadMyDbCurrent() {
    const u = uid(); if (!u) { setState("signed-out", "Нет входа"); return { ok: false, error: "no-uid" }; }
    try {
      const n = await uploadMyDb(u, EP.Database.getLocalItems("my"));
      status.lastSync = now(); status.myEmptyRemote = (n === 0); setState("connected", "Моя БД выгружена: " + n);
      return { ok: true, count: n };
    } catch (e) { return handleErr("db-save-error", e); }
  }
  async function uploadServerDbCurrent() {
    if (!isAdmin()) { return { ok: false, error: "not-admin" }; }
    try {
      const n = await uploadServerDb(EP.Database.getLocalItems("server"));
      status.lastSync = now(); status.serverEmptyRemote = (n === 0); setState("connected", "БД сервера выгружена: " + n);
      return { ok: true, count: n };
    } catch (e) { return handleErr("db-save-error", e); }
  }

  // ПУЛЛ Firestore -> локальный кэш. Пустой remote НЕ затирает локальное.
  async function pullToLocal(which) {
    if (!db()) { setState("cache", "Firebase недоступен — кэш"); return { ok: false, error: "no-db" }; }
    if (!uid()) { setState("signed-out", "Нет входа"); return { ok: false, error: "no-uid" }; }
    const res = {};
    try {
      if (which !== "my") {
        const remote = await downloadServerDb();
        if (remote && remote.length) { EP.Database.saveLocalItems("server", remote); res.server = remote.length; } else res.server = 0;
      }
      if (which !== "server") {
        const remote = await downloadMyDb();
        if (remote && remote.length) { EP.Database.saveLocalItems("my", remote); res.my = remote.length; } else res.my = 0;
      }
      status.lastSync = now();
      status.serverCount = EP.Database.getLocalItems("server").length;
      status.myCount = EP.Database.getLocalItems("my").length;
      setState("connected", "Загружено из Firebase");
      window.dispatchEvent(new CustomEvent("ep:db-changed", { detail: { base: "my" } }));
      return Object.assign({ ok: true }, res);
    } catch (e) { return handleErr("db-load-error", e); }
  }

  // АВТО при входе — безопасно: локальное заполняем ТОЛЬКО если оно пустое.
  async function syncAll() {
    if (!db()) { setState("cache", "Работаем из локального кэша"); return getStatus(); }
    const u = uid();
    if (!u) { setState("signed-out", "Нет входа — кэш"); return getStatus(); }
    try {
      const remoteServer = await downloadServerDb();
      const remoteMy = await downloadMyDb(u);
      const localServer = EP.Database.getLocalItems("server");
      const localMy = EP.Database.getLocalItems("my");
      if (!localServer.length && remoteServer && remoteServer.length) EP.Database.saveLocalItems("server", remoteServer);
      if (!localMy.length && remoteMy && remoteMy.length) EP.Database.saveLocalItems("my", remoteMy);
      status.lastSync = now();
      status.serverCount = EP.Database.getLocalItems("server").length;
      status.myCount = EP.Database.getLocalItems("my").length;
      status.serverEmptyRemote = !(remoteServer && remoteServer.length);
      status.myEmptyRemote = !(remoteMy && remoteMy.length);
      setState("connected", "Подключено");
      window.dispatchEvent(new CustomEvent("ep:db-changed", { detail: { base: "my" } }));
      return getStatus();
    } catch (e) { handleErr("db-sync-error", e); return getStatus(); }
  }

  EP.DatabaseSync = {
    PATHS, getStatus,
    downloadServerDb, downloadMyDb, uploadMyDb, uploadServerDb,
    uploadMyDbCurrent, uploadServerDbCurrent,
    pullToLocal, syncAll, isAdmin, uid
  };

  // авто-синхронизация после входа (через штатное событие auth)
  window.addEventListener("ep:auth-changed", (e) => {
    if (e && e.detail && e.detail.user) { setTimeout(() => { try { syncAll(); } catch (_) {} }, 300); }
    else { setState("signed-out", "Нет входа"); }
  });
})();
