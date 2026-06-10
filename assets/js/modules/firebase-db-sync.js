/* ============================================================
   Electric Pro V29.24 — Firebase Database Sync Core

   Назначение:
   - общий Firestore для двух фронтов: electric-pro и electric-pro-refactor;
   - Firestore = общий источник между устройствами;
   - localStorage epdb26_my / epdb26_server = быстрый локальный кэш;
   - без firebase deploy, без rules/functions, без patch/fix/restore.

   Firestore paths:
   - server_database/{itemId}
   - users/{uid}/my_database/{itemId}
   ============================================================ */
(() => {
  "use strict";

  window.EP = window.EP || {};

  const VERSION = "V29.24 Firebase Database Sync Core";
  const SERVER_COLLECTION = "server_database";
  const MY_SUBCOLLECTION = "my_database";
  const SYNC_META_KEY = "epdb26_firebase_sync_meta";
  const MAX_BATCH = 450;

  const state = {
    status: "idle",
    text: "Firebase-синхронизация ожидает вход",
    lastSyncAt: null,
    serverCount: null,
    myCount: null,
    error: null,
    busy: false
  };

  function db() {
    if (!EP.Firebase?.init?.()) return null;
    return EP.Firebase.db || null;
  }

  function currentUser() {
    return EP.state?.user || EP.Firebase?.auth?.currentUser || null;
  }

  function currentUid() {
    return currentUser()?.uid || null;
  }

  function isAdmin() {
    return EP.Auth?.isAdmin?.() === true || EP.state?.accessPolicy?.isAdmin === true;
  }

  function serverTimestamp() {
    try { return firebase.firestore.FieldValue.serverTimestamp(); }
    catch (_) { return new Date().toISOString(); }
  }

  function cleanObject(value) {
    if (Array.isArray(value)) return value.map(cleanObject).filter((x) => x !== undefined);
    if (value && typeof value === "object") {
      if (typeof value.toDate === "function") return value;
      const out = {};
      Object.keys(value).forEach((key) => {
        const v = cleanObject(value[key]);
        if (v !== undefined) out[key] = v;
      });
      return out;
    }
    if (value === undefined) return undefined;
    if (typeof value === "number" && !Number.isFinite(value)) return 0;
    return value;
  }

  function makeId(prefix) {
    return String(prefix || "item") + "_" + Date.now().toString(36) + "_" + Math.random().toString(36).slice(2, 8);
  }

  function normalizeItem(raw, typeHint) {
    const normalizer = EP.Database?.normalizeItem;
    let item;
    if (typeof normalizer === "function") {
      item = normalizer(raw || {}, typeHint || raw?.type);
    } else {
      const r = raw || {};
      item = {
        id: String(r.id || r.itemId || r.uid || makeId("db")),
        type: String(r.type || typeHint || "material"),
        name: String(r.name || r.title || r.n || r["Наименование"] || "").trim(),
        category: String(r.category || r.cat || r.c || r.folder || r["Папка"] || "").trim(),
        subcategory: String(r.subcategory || r.subcat || r.sc || r.sub || r.group || r["Подпапка"] || "").trim(),
        unit: String(r.unit || r.u || r.ed || r["Ед"] || "шт").trim() || "шт",
        price: Number(String(r.price ?? r.p ?? r.cost ?? r["Цена"] ?? 0).replace(",", ".")) || 0,
        active: r.active === false ? false : true
      };
    }

    item.id = String(item.id || raw?.id || makeId("db"));
    item.type = item.type === "work" ? "work" : "material";
    item.name = String(item.name || "").trim();
    item.category = String(item.category || "").trim();
    item.subcategory = String(item.subcategory || "").trim();
    item.unit = String(item.unit || "шт").trim() || "шт";
    item.price = Number(item.price) || 0;
    item.active = item.active === false ? false : true;
    return item;
  }

  function docPayload(item, base, uid) {
    const normal = normalizeItem(item, item?.type);
    return cleanObject({
      ...normal,
      id: normal.id,
      base,
      ownerUid: base === "my" ? uid : null,
      source: "electric-pro-v29",
      updatedAt: serverTimestamp()
    });
  }

  function localStorageLayer() {
    return EP.Database?.Storage || null;
  }

  function readLocal(base) {
    const S = localStorageLayer();
    const key = base === "server" ? "epdb26_server" : "epdb26_my";
    if (S?.readJson) return S.readJson(key, []);
    try {
      const raw = localStorage.getItem(key);
      const arr = raw ? JSON.parse(raw) : [];
      return Array.isArray(arr) ? arr : [];
    } catch (_) { return []; }
  }

  function writeLocal(base, items) {
    const S = localStorageLayer();
    const key = base === "server" ? "epdb26_server" : "epdb26_my";
    const arr = Array.isArray(items) ? items.map((x) => normalizeItem(x, x?.type)) : [];
    if (S?.writeJson) S.writeJson(key, arr);
    else localStorage.setItem(key, JSON.stringify(arr));
    window.dispatchEvent(new CustomEvent("ep:db-firebase-cache-updated", { detail: { base, count: arr.length } }));
    window.dispatchEvent(new CustomEvent("ep:db-changed", { detail: { base, source: "firebase-cache" } }));
    return arr;
  }

  function saveMeta(patch) {
    const meta = { ...(loadMeta() || {}), ...(patch || {}) };
    try { localStorage.setItem(SYNC_META_KEY, JSON.stringify(meta)); } catch (_) {}
    return meta;
  }

  function loadMeta() {
    try { return JSON.parse(localStorage.getItem(SYNC_META_KEY) || "{}"); }
    catch (_) { return {}; }
  }

  function setStatus(next) {
    Object.assign(state, next || {});
    EP.state = EP.state || {};
    EP.state.dbSync = { ...state };
    window.dispatchEvent(new CustomEvent("ep:firebase-db-sync-status", { detail: { status: { ...state } } }));
    renderPanel();
  }

  async function collectionToItems(ref) {
    const snap = await ref.get();
    const items = [];
    snap.forEach((doc) => {
      const data = doc.data() || {};
      items.push(normalizeItem({ ...data, id: data.id || doc.id }, data.type));
    });
    return items.sort((a, b) =>
      a.category.localeCompare(b.category, "ru") ||
      a.subcategory.localeCompare(b.subcategory, "ru") ||
      a.name.localeCompare(b.name, "ru")
    );
  }

  function serverRef() {
    const firestore = db();
    return firestore ? firestore.collection(SERVER_COLLECTION) : null;
  }

  function myRef(uid) {
    const firestore = db();
    return firestore && uid ? firestore.collection("users").doc(uid).collection(MY_SUBCOLLECTION) : null;
  }

  async function replaceCollection(ref, items, base, uid) {
    const firestore = db();
    if (!firestore || !ref) throw new Error("Firebase не готов");
    const normalized = (Array.isArray(items) ? items : []).map((x) => normalizeItem(x, x?.type));
    const existing = await ref.get();
    let batch = firestore.batch();
    let ops = 0;

    const incomingIds = new Set(normalized.map((x) => String(x.id)));
    for (const doc of existing.docs) {
      if (!incomingIds.has(doc.id)) {
        batch.delete(doc.ref);
        ops += 1;
        if (ops >= MAX_BATCH) {
          await batch.commit();
          batch = firestore.batch();
          ops = 0;
        }
      }
    }

    for (const item of normalized) {
      const id = String(item.id || makeId(base));
      batch.set(ref.doc(id), docPayload({ ...item, id }, base, uid), { merge: true });
      ops += 1;
      if (ops >= MAX_BATCH) {
        await batch.commit();
        batch = firestore.batch();
        ops = 0;
      }
    }

    if (ops > 0) await batch.commit();
    return normalized.length;
  }

  async function downloadServer() {
    const ref = serverRef();
    if (!ref) throw new Error("Firestore не готов");
    const items = await collectionToItems(ref);
    if (items.length) writeLocal("server", items);
    state.serverCount = items.length;
    return items;
  }

  async function downloadMy(uid) {
    uid = uid || currentUid();
    const ref = myRef(uid);
    if (!ref) throw new Error("Нет UID или Firestore не готов");
    const items = await collectionToItems(ref);
    if (items.length) writeLocal("my", items);
    state.myCount = items.length;
    return items;
  }

  async function downloadAll(options) {
    options = options || {};
    const uid = currentUid();
    if (!uid) {
      setStatus({ status: "wait", text: "Войдите, чтобы загрузить общую Firebase-БД", error: null });
      return { ok: false, reason: "no-user" };
    }

    if (state.busy) return { ok: false, reason: "busy" };
    state.busy = true;
    setStatus({ status: "syncing", text: "Загружаю БД из Firebase…", error: null, busy: true });

    try {
      const [serverResult, myResult] = await Promise.allSettled([downloadServer(), downloadMy(uid)]);
      const serverCount = serverResult.status === "fulfilled" ? serverResult.value.length : null;
      const myCount = myResult.status === "fulfilled" ? myResult.value.length : null;
      const errors = [serverResult, myResult].filter((x) => x.status === "rejected").map((x) => x.reason?.message || String(x.reason));
      const now = new Date().toISOString();

      saveMeta({ lastDownloadAt: now, serverCount, myCount });
      state.busy = false;
      setStatus({
        status: errors.length ? "warn" : "ok",
        text: errors.length
          ? "Firebase частично недоступен. Используется локальный кэш."
          : `Firebase-БД загружена: сервер ${serverCount ?? "?"}, моя ${myCount ?? "?"}`,
        lastSyncAt: now,
        serverCount,
        myCount,
        error: errors.join("; ") || null,
        busy: false
      });
      return { ok: !errors.length, serverCount, myCount, errors };
    } catch (error) {
      state.busy = false;
      setStatus({ status: "error", text: "Не удалось загрузить Firebase-БД. Работаем из локального кэша.", error: error.message || String(error), busy: false });
      return { ok: false, error };
    }
  }

  async function uploadMyFromLocal(options) {
    options = options || {};
    const uid = currentUid();
    if (!uid) throw new Error("Нет входа пользователя");
    const items = readLocal("my");
    setStatus({ status: "syncing", text: "Выгружаю Мою БД в Firebase…", error: null, busy: true });
    const count = await replaceCollection(myRef(uid), items, "my", uid);
    const now = new Date().toISOString();
    saveMeta({ lastUploadMyAt: now, myCount: count });
    setStatus({ status: "ok", text: `Моя БД сохранена в Firebase: ${count} поз.`, myCount: count, lastSyncAt: now, error: null, busy: false });
    return count;
  }

  async function uploadServerFromLocal(options) {
    options = options || {};
    if (!isAdmin()) throw new Error("БД сервера может выгружать только администратор");
    const items = readLocal("server");
    setStatus({ status: "syncing", text: "Выгружаю БД сервера в Firebase…", error: null, busy: true });
    const count = await replaceCollection(serverRef(), items, "server", currentUid());
    const now = new Date().toISOString();
    saveMeta({ lastUploadServerAt: now, serverCount: count });
    setStatus({ status: "ok", text: `БД сервера сохранена в Firebase: ${count} поз.`, serverCount: count, lastSyncAt: now, error: null, busy: false });
    return count;
  }

  let saveTimer = null;
  const pendingSaves = new Map();

  function afterLocalSave(base, items) {
    if (base !== "my" && base !== "server") return;
    pendingSaves.set(base, Array.isArray(items) ? items.slice() : []);
    clearTimeout(saveTimer);
    saveTimer = setTimeout(flushPendingSaves, 1200);
  }

  async function flushPendingSaves() {
    const uid = currentUid();
    if (!uid || !db()) return;
    const entries = Array.from(pendingSaves.entries());
    pendingSaves.clear();
    for (const [base, items] of entries) {
      try {
        if (base === "my") await replaceCollection(myRef(uid), items, "my", uid);
        if (base === "server" && isAdmin()) await replaceCollection(serverRef(), items, "server", uid);
        const now = new Date().toISOString();
        saveMeta({ lastBackgroundUploadAt: now, [`${base}Count`]: items.length });
        setStatus({ status: "ok", text: `${base === "server" ? "БД сервера" : "Моя БД"} синхронизирована с Firebase`, lastSyncAt: now, error: null, [`${base}Count`]: items.length });
      } catch (error) {
        console.warn("Firebase DB background upload failed", base, error);
        setStatus({ status: "warn", text: "Изменения сохранены локально, Firebase пока не принял запись", error: error.message || String(error) });
      }
    }
  }

  function statusClass() {
    if (state.status === "ok") return "ok";
    if (state.status === "error") return "error";
    if (state.status === "warn") return "warn";
    if (state.status === "syncing") return "syncing";
    return "idle";
  }

  function esc(s) {
    return String(s == null ? "" : s)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function renderPanel() {
    const route = EP.state?.currentRoute;
    if (route !== "database") return;
    const root = document.querySelector("#ep-db-root");
    if (!root) return;
    let panel = document.querySelector("#ep-firebase-db-sync-panel");
    if (!panel) {
      panel = document.createElement("div");
      panel.id = "ep-firebase-db-sync-panel";
      panel.className = "card ep-firebase-db-sync";
      root.parentNode.insertBefore(panel, root);
    }

    const user = currentUser();
    const uid = user?.uid || "нет входа";
    const localServer = readLocal("server").length;
    const localMy = readLocal("my").length;

    panel.innerHTML = `
      <div class="ep-sync-head">
        <div>
          <b>☁️ Firebase-БД</b>
          <span>Общая база для electric-pro и electric-pro-refactor</span>
        </div>
        <em class="ep-sync-state ${statusClass()}">${esc(state.status || "idle")}</em>
      </div>
      <div class="ep-sync-status">${esc(state.text || "Ожидание синхронизации")}${state.error ? `<small>${esc(state.error)}</small>` : ""}</div>
      <div class="ep-sync-paths">
        <code>server_database/{itemId}</code>
        <code>users/${esc(uid)}/my_database/{itemId}</code>
      </div>
      <div class="ep-sync-counts">
        <span>Локально сервер: <b>${localServer}</b></span>
        <span>Локально моя: <b>${localMy}</b></span>
        <span>Firebase сервер: <b>${state.serverCount ?? "—"}</b></span>
        <span>Firebase моя: <b>${state.myCount ?? "—"}</b></span>
      </div>
      <div class="ep-sync-actions">
        <button class="btn btn-ghost ep-clickable" type="button" data-fbdb-download ${state.busy ? "disabled" : ""}>⬇️ Firebase → локально</button>
        <button class="btn btn-primary ep-clickable" type="button" data-fbdb-upload-my ${state.busy || !user ? "disabled" : ""}>⬆️ Моя БД → Firebase</button>
        ${isAdmin() ? `<button class="btn btn-ghost ep-clickable" type="button" data-fbdb-upload-server ${state.busy || !user ? "disabled" : ""}>⬆️ БД сервера → Firebase</button>` : ""}
      </div>
      <p class="ep-sync-note">Firestore — общий источник между устройствами. localStorage остаётся быстрым кэшем epdb26_my / epdb26_server.</p>
    `;
  }

  async function handleClick(event) {
    const download = event.target.closest("[data-fbdb-download]");
    const uploadMy = event.target.closest("[data-fbdb-upload-my]");
    const uploadServer = event.target.closest("[data-fbdb-upload-server]");
    if (!download && !uploadMy && !uploadServer) return;
    event.preventDefault();
    event.stopPropagation();
    try {
      window.SoundAPI?.click?.();
      if (download) await downloadAll({ manual: true });
      if (uploadMy) await uploadMyFromLocal({ manual: true });
      if (uploadServer) await uploadServerFromLocal({ manual: true });
      EP.Database?.UI?.render?.();
    } catch (error) {
      console.warn("Firebase DB sync action failed", error);
      setStatus({ status: "error", text: "Операция Firebase-БД не выполнена", error: error.message || String(error), busy: false });
    }
  }

  function init() {
    document.addEventListener("click", handleClick, true);

    window.addEventListener("ep:auth-changed", () => {
      setTimeout(() => downloadAll({ auto: true }), 500);
    });

    window.addEventListener("ep:route-loaded", (event) => {
      if (event.detail?.route === "database") {
        renderPanel();
        setTimeout(() => renderPanel(), 250);
      }
    });

    const meta = loadMeta();
    if (meta.lastDownloadAt || meta.lastUploadMyAt || meta.lastUploadServerAt) {
      state.lastSyncAt = meta.lastDownloadAt || meta.lastUploadMyAt || meta.lastUploadServerAt;
      state.serverCount = meta.serverCount ?? null;
      state.myCount = meta.myCount ?? null;
    }

    setTimeout(() => {
      if (currentUid()) downloadAll({ auto: true });
      else setStatus({ status: "wait", text: "Войдите, чтобы синхронизировать БД через Firebase" });
    }, 1200);
  }

  EP.FirebaseDbSync = {
    version: VERSION,
    SERVER_COLLECTION,
    MY_SUBCOLLECTION,
    state,
    init,
    downloadAll,
    downloadServer,
    downloadMy,
    uploadMyFromLocal,
    uploadServerFromLocal,
    afterLocalSave,
    readLocal,
    writeLocal,
    renderPanel
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }
})();
