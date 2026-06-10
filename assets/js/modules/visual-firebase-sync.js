(function () {
  window.EP = window.EP || {};

  const LOCAL_KEYS = ["ep_visual_settings_clean_v5_3", "ep.visual.v29"];
  const META_KEY = "ep.visual.firebase.sync.meta.v1";
  const MODULE_VERSION = "V29.27";
  const COLLECTION = "settings";
  const DOC_ID = "visual";

  const allowedKeys = new Set([
    "themeId", "mode", "profile", "accent", "buttonColor", "textColor", "mutedColor",
    "backgroundColor", "cardColor", "opacity", "buttonOpacity", "radius", "buttonRadius",
    "blur", "density", "fontScale", "buttonShape", "backgroundStyle", "animationStyle",
    "animationSpeed", "reduceMotion", "electricPulse", "soundEnabled", "hapticEnabled",
    "hapticPattern", "soundVolume", "soundStyle", "advancedOpen"
  ]);

  const state = {
    user: null,
    status: "wait",
    text: "Ожидаю вход",
    busy: false,
    lastError: "",
    lastSyncAt: "",
    suppressLocalUpload: false,
    uploadTimer: null,
    installedStorageHook: false
  };

  function nowIso() {
    return new Date().toISOString();
  }

  function formatTime(value) {
    if (!value) return "—";
    try {
      const d = value instanceof Date ? value : new Date(value);
      return d.toLocaleString("ru-RU", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" });
    } catch (_) {
      return "—";
    }
  }

  function getMeta() {
    try {
      return JSON.parse(localStorage.getItem(META_KEY) || "{}");
    } catch (_) {
      return {};
    }
  }

  function setMeta(patch) {
    const next = Object.assign({}, getMeta(), patch || {});
    localStorage.setItem(META_KEY, JSON.stringify(next));
    return next;
  }

  function setStatus(status, text, error) {
    state.status = status || "wait";
    state.text = text || "";
    state.lastError = error || "";
    renderPanel();
  }

  function getDb() {
    try {
      if (!window.EP?.Firebase?.ready) window.EP?.Firebase?.init?.();
      return window.EP?.Firebase?.db || null;
    } catch (_) {
      return null;
    }
  }

  function getUser() {
    return state.user || window.EP?.state?.user || null;
  }

  function visualRef() {
    const user = getUser();
    const db = getDb();
    if (!user?.uid || !db) return null;
    return db.collection("users").doc(user.uid).collection(COLLECTION).doc(DOC_ID);
  }

  function getLocalSettings() {
    try {
      if (window.EP?.VisualSettings?.getSettings) {
        return sanitize(window.EP.VisualSettings.getSettings());
      }
      const newest = JSON.parse(localStorage.getItem("ep.visual.v29") || "{}");
      const old = JSON.parse(localStorage.getItem("ep_visual_settings_clean_v5_3") || "{}");
      return sanitize(Object.assign({}, old, newest));
    } catch (_) {
      return {};
    }
  }

  function hasLocalVisualSettings() {
    return LOCAL_KEYS.some((key) => {
      const value = localStorage.getItem(key);
      return value && value !== "{}" && value.length > 10;
    });
  }

  function sanitize(value) {
    const source = value && typeof value === "object" ? value : {};
    const out = {};
    Object.keys(source).forEach((key) => {
      if (!allowedKeys.has(key)) return;
      const v = source[key];
      if (v === undefined || typeof v === "function") return;
      if (typeof v === "number" && !Number.isFinite(v)) return;
      out[key] = v;
    });
    return out;
  }

  function applySettings(settings, reason) {
    const clean = sanitize(settings);
    state.suppressLocalUpload = true;
    try {
      localStorage.setItem("ep_visual_settings_clean_v5_3", JSON.stringify(clean));
      localStorage.setItem("ep.visual.v29", JSON.stringify(clean));
      window.EP?.VisualSettings?.apply?.(clean);
      window.EP?.VisualSettings?.render?.();
      setMeta({ lastDownloadedAt: nowIso(), lastApplyReason: reason || "cloud" });
    } finally {
      setTimeout(() => {
        state.suppressLocalUpload = false;
      }, 500);
    }
    renderPanel();
  }

  function tsToMillis(value) {
    if (!value) return 0;
    if (typeof value === "number") return value;
    if (value && typeof value.toMillis === "function") return value.toMillis();
    if (value && typeof value.seconds === "number") return value.seconds * 1000;
    const parsed = Date.parse(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }

  async function downloadCloud(options) {
    const ref = visualRef();
    if (!ref) {
      setStatus("error", "Firebase/пользователь не готов", "no-user-or-db");
      return { ok: false, reason: "no-user-or-db" };
    }

    try {
      state.busy = true;
      setStatus("wait", "Читаю визуал из Firebase...");
      const snap = await ref.get();

      if (!snap.exists) {
        if (hasLocalVisualSettings() && options?.uploadIfMissing !== false) {
          setStatus("wait", "В Firebase визуала нет. Загружаю локальные настройки...");
          return await uploadCloud("first-local-upload");
        }
        setStatus("wait", "В Firebase настройки визуала пока не сохранены");
        return { ok: false, reason: "missing" };
      }

      const data = snap.data() || {};
      const cloudSettings = sanitize(data.settings || data.visual || {});
      if (!Object.keys(cloudSettings).length) {
        setStatus("wait", "Документ визуала найден, но настройки пустые");
        return { ok: false, reason: "empty" };
      }

      applySettings(cloudSettings, "download");
      const syncAt = nowIso();
      state.lastSyncAt = syncAt;
      setMeta({
        cloudUpdatedAtMillis: data.updatedAtMillis || tsToMillis(data.updatedAt),
        lastDownloadedAt: syncAt,
        lastSyncAt: syncAt
      });
      setStatus("ok", "Визуал загружен из Firebase");
      return { ok: true };
    } catch (error) {
      console.error("Visual Firebase download error", error);
      setStatus("error", "Не удалось загрузить визуал из Firebase", error.code || error.message || String(error));
      return { ok: false, error };
    } finally {
      state.busy = false;
      renderPanel();
    }
  }

  async function uploadCloud(reason) {
    const ref = visualRef();
    const user = getUser();
    if (!ref || !user?.uid) {
      setStatus("error", "Firebase/пользователь не готов", "no-user-or-db");
      return { ok: false, reason: "no-user-or-db" };
    }

    const settings = getLocalSettings();
    if (!Object.keys(settings).length) {
      setStatus("error", "Нет локальных настроек для сохранения", "empty-local-settings");
      return { ok: false, reason: "empty-local-settings" };
    }

    try {
      state.busy = true;
      setStatus("wait", "Сохраняю визуал в Firebase...");
      const updatedAtMillis = Date.now();
      await ref.set({
        version: MODULE_VERSION,
        type: "visual-settings",
        settings,
        updatedAt: window.firebase?.firestore?.FieldValue?.serverTimestamp ? firebase.firestore.FieldValue.serverTimestamp() : new Date().toISOString(),
        updatedAtMillis,
        updatedBy: user.uid,
        updatedByEmail: user.email || "",
        source: "electric-pro-refactor",
        reason: reason || "manual"
      }, { merge: true });

      const syncAt = nowIso();
      state.lastSyncAt = syncAt;
      setMeta({ lastUploadedAt: syncAt, lastSyncAt: syncAt, cloudUpdatedAtMillis: updatedAtMillis });
      setStatus("ok", "Визуал сохранён в Firebase");
      return { ok: true };
    } catch (error) {
      console.error("Visual Firebase upload error", error);
      const code = error.code || error.message || String(error);
      setStatus("error", code === "permission-denied" ? "Нет прав записи visual settings" : "Не удалось сохранить визуал в Firebase", code);
      return { ok: false, error };
    } finally {
      state.busy = false;
      renderPanel();
    }
  }

  function scheduleUpload(reason) {
    if (state.suppressLocalUpload) return;
    if (!getUser()?.uid) return;
    clearTimeout(state.uploadTimer);
    state.uploadTimer = setTimeout(() => uploadCloud(reason || "local-change"), 1400);
  }

  function installStorageHook() {
    if (state.installedStorageHook) return;
    state.installedStorageHook = true;

    const nativeSetItem = localStorage.setItem.bind(localStorage);
    localStorage.setItem = function (key, value) {
      nativeSetItem(key, value);
      if (LOCAL_KEYS.includes(String(key))) {
        setMeta({ localUpdatedAt: nowIso() });
        scheduleUpload("localStorage-change");
      }
    };
  }

  function panelHtml() {
    const meta = getMeta();
    const statusText = state.text || "Ожидаю";
    const last = state.lastSyncAt || meta.lastSyncAt || meta.lastUploadedAt || meta.lastDownloadedAt || "";
    const disabled = state.busy ? "disabled" : "";
    const user = getUser();
    const uidText = user?.uid ? `${String(user.email || user.uid).slice(0, 36)}` : "нет входа";

    return `
      <div id="visualFirebaseSyncPanel" class="card visual-cloud-card" data-sync-status="${state.status}">
        <div class="visual-cloud-head">
          <div>
            <p class="visual-section-title">Синхронизация визуала</p>
            <small>Firebase: users/{uid}/settings/visual · localStorage остаётся кэшем</small>
          </div>
          <span class="visual-cloud-badge">${statusText}</span>
        </div>
        <div class="visual-cloud-grid">
          <div><b>Аккаунт</b><span>${uidText}</span></div>
          <div><b>Последняя синхронизация</b><span>${formatTime(last)}</span></div>
          <div><b>Локально</b><span>${hasLocalVisualSettings() ? "есть настройки" : "нет данных"}</span></div>
          <div><b>Режим</b><span>авто: изменения сохраняются в Firebase</span></div>
        </div>
        ${state.lastError ? `<div class="visual-cloud-error">${escapeHtml(state.lastError)}</div>` : ""}
        <div class="visual-cloud-actions">
          <button id="visualCloudDownloadBtn" class="btn btn-ghost ep-clickable" type="button" ${disabled}>Firebase → это устройство</button>
          <button id="visualCloudUploadBtn" class="btn btn-primary ep-clickable" type="button" ${disabled}>Это устройство → Firebase</button>
        </div>
      </div>
    `;
  }

  function escapeHtml(value) {
    return String(value || "").replace(/[&<>'"]/g, (ch) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" }[ch]));
  }

  function renderPanel() {
    const root = document.getElementById("visual-settings-root");
    if (!root) return;
    const page = root.querySelector(".visual-settings-page") || root;
    let holder = root.querySelector("#visualFirebaseSyncMount");
    if (!holder) {
      holder = document.createElement("div");
      holder.id = "visualFirebaseSyncMount";
      const firstCard = root.querySelector(".visual-card");
      if (firstCard?.parentNode) firstCard.parentNode.insertBefore(holder, firstCard.nextSibling);
      else page.appendChild(holder);
    }
    holder.innerHTML = panelHtml();
    holder.querySelector("#visualCloudDownloadBtn")?.addEventListener("click", () => downloadCloud({ uploadIfMissing: false }));
    holder.querySelector("#visualCloudUploadBtn")?.addEventListener("click", () => uploadCloud("manual-button"));
  }

  function bindSettingsPage() {
    renderPanel();
    const root = document.getElementById("visual-settings-root");
    if (!root) return;
    root.addEventListener("input", (event) => {
      if (event.target?.matches?.("[data-visual-key]")) scheduleUpload("settings-input");
    }, { passive: true });
    root.addEventListener("change", (event) => {
      if (event.target?.matches?.("[data-visual-key]")) scheduleUpload("settings-change");
    }, { passive: true });
    root.addEventListener("click", (event) => {
      if (event.target?.closest?.("[data-theme],[data-visual-mode],[data-profile],#resetVisualBtn,#baseVisualBtn,#toggleAdvancedVisualBtn")) {
        scheduleUpload("settings-click");
      }
    }, { passive: true });
  }

  async function onUserReady(user) {
    state.user = user || null;
    if (!state.user?.uid) {
      setStatus("wait", "Ожидаю вход");
      return;
    }
    setStatus("wait", "Проверяю визуал в Firebase...");
    await downloadCloud({ uploadIfMissing: true });
  }

  function init() {
    installStorageHook();

    window.addEventListener("ep:auth-changed", (event) => {
      onUserReady(event.detail?.user || null);
    });

    window.addEventListener("ep:route-loaded", (event) => {
      if (event.detail?.route === "settings") {
        setTimeout(bindSettingsPage, 80);
      }
    });

    if (window.EP?.state?.user) {
      onUserReady(window.EP.state.user);
    } else {
      setStatus("wait", "Ожидаю вход");
    }

    setTimeout(() => {
      if (window.EP?.state?.currentRoute === "settings") bindSettingsPage();
    }, 600);
  }

  window.EP.VisualFirebaseSync = {
    init,
    upload: uploadCloud,
    download: downloadCloud,
    getStatus: () => Object.assign({}, state),
    getPath: () => {
      const user = getUser();
      return user?.uid ? `users/${user.uid}/${COLLECTION}/${DOC_ID}` : "users/{uid}/settings/visual";
    }
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }
})();
