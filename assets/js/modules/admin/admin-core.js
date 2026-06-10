(() => {
  "use strict";

  const ADMIN_VERSION = "V29.31";
  const EP = window.EP = window.EP || {};
  const Admin = EP.Admin = EP.Admin || {};

  Admin.state = {
    version: ADMIN_VERSION,
    booted: false,
    initInProgress: false,
    firebaseReady: false,
    db: null,
    auth: null,
    currentUser: null,
    currentProfile: null,
    isAdmin: false,
    users: [],
    subscriptions: new Map(),
    aiAccounts: new Map(),
    plans: [],
    selectedUid: null,
    logs: [],
    errors: []
  };

  Admin.collections = {
    users: "users",
    subscriptions: "user_subscriptions",
    ai: "ai_accounts",
    plans: "subscription_plans",
    adminLogs: "admin_logs",
    securityEvents: "security_events",
    errorLogs: "error_logs"
  };

  Admin.$ = (selector, root = document) => root.querySelector(selector);
  Admin.$$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));

  Admin.isAdminRoute = () => {
    const hash = String(location.hash || "");
    const path = String(location.pathname || "");
    return !!document.querySelector("#ep-admin-root")
      || hash === "#admin"
      || hash.startsWith("#admin/")
      || path.endsWith("/admin.html");
  };

  Admin.setStatus = (message, tone = "") => {
    const el = Admin.$("#ep-admin-status");
    if (!el) return;
    el.textContent = message;
    el.className = "ep-admin-status" + (tone ? " " + tone : "");
  };

  Admin.escape = (value) => String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

  Admin.toDateInput = (value) => {
    if (!value) return "";
    try {
      if (typeof value.toDate === "function") value = value.toDate();
      const d = new Date(value);
      if (Number.isNaN(d.getTime())) return "";
      return d.toISOString().slice(0, 10);
    } catch (_) {
      return "";
    }
  };

  Admin.fromDateInput = (value) => {
    if (!value) return null;
    const d = new Date(value + "T23:59:59");
    return Number.isNaN(d.getTime()) ? null : d.toISOString();
  };

  Admin.now = () => new Date().toISOString();

  Admin.waitForFirebase = () => new Promise((resolve) => {
    const started = Date.now();
    const tick = () => {
      if (window.firebase && firebase.auth && firebase.firestore) return resolve(true);
      if (Date.now() - started > 9000) return resolve(false);
      setTimeout(tick, 120);
    };
    tick();
  });

  Admin.requireFirebase = async () => {
    const ok = await Admin.waitForFirebase();
    if (!ok) {
      Admin.setStatus("Firebase не найден", "ep-admin-warn");
      return false;
    }
    Admin.state.auth = firebase.auth();
    Admin.state.db = firebase.firestore();
    Admin.state.firebaseReady = true;
    return true;
  };

  Admin.waitForAuth = async () => new Promise(async (resolve) => {
    const firebaseOk = await Admin.requireFirebase();
    if (!firebaseOk) return resolve(null);

    const done = (user) => {
      Admin.state.currentUser = user || null;
      resolve(user || null);
    };

    const current = Admin.state.auth.currentUser;
    if (current) return done(current);

    let finished = false;
    const unsub = Admin.state.auth.onAuthStateChanged((user) => {
      if (finished) return;
      finished = true;
      try { unsub(); } catch (_) {}
      done(user);
    });

    setTimeout(() => {
      if (finished) return;
      finished = true;
      try { unsub(); } catch (_) {}
      done(Admin.state.auth.currentUser || null);
    }, 4500);
  });

  Admin.getDocData = async (collection, id) => {
    const snap = await Admin.state.db.collection(collection).doc(id).get();
    return snap.exists ? { id: snap.id, ...snap.data() } : null;
  };

  Admin.loadCollection = async (collection, limit = 300) => {
    const snap = await Admin.state.db.collection(collection).limit(limit).get();
    return snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  };

  Admin.safeLoadCollection = async (collection, limit = 300) => {
    try {
      return await Admin.loadCollection(collection, limit);
    } catch (error) {
      Admin.showFirestoreError(collection, error);
      return [];
    }
  };

  Admin.showFirestoreError = (where, error) => {
    const code = error && error.code ? error.code : "unknown";
    console.warn("[EP Admin]", where, error);
    if (code === "permission-denied") {
      Admin.setStatus("Нет прав Firestore: " + where, "ep-admin-warn");
    } else {
      Admin.setStatus("Ошибка Firestore: " + where, "ep-admin-warn");
    }
  };

  Admin.checkAdminAccess = async (user) => {
    if (!user) {
      Admin.setStatus("Нужно войти в аккаунт", "ep-admin-warn");
      Admin.renderAccessDenied("Нужно войти в аккаунт.");
      return false;
    }

    let profile = null;
    try {
      profile = await Admin.getDocData(Admin.collections.users, user.uid);
    } catch (error) {
      Admin.showFirestoreError("users/" + user.uid, error);
    }

    Admin.state.currentProfile = profile || { uid: user.uid, email: user.email };
    const role = String(profile?.role || "").toLowerCase();
    const isAdmin = role === "admin" || profile?.isAdmin === true;
    Admin.state.isAdmin = isAdmin;

    if (!isAdmin) {
      Admin.setStatus("Доступ запрещён", "ep-admin-warn");
      Admin.renderAccessDenied("Раздел доступен только администратору.");
      return false;
    }

    Admin.setStatus("Админка подключена", "ep-admin-ok");
    return true;
  };

  Admin.renderAccessDenied = (message) => {
    const root = Admin.ensureRoot();
    if (!root) return;
    root.innerHTML = `
      <div class="ep-admin-hero">
        <div>
          <div class="ep-admin-kicker">Electric Pro V29</div>
          <h1>Админка</h1>
          <p>${Admin.escape(message)}</p>
        </div>
        <div id="ep-admin-status" class="ep-admin-status ep-admin-warn">${Admin.escape(message)}</div>
      </div>
    `;
  };

  Admin.ensureRoot = () => {
    let root = Admin.$("#ep-admin-root");
    if (root) return root;

    if (location.hash === "#admin" || location.hash.startsWith("#admin/")) {
      root = document.createElement("main");
      root.id = "ep-admin-root";
      root.className = "ep-admin-page";
      document.body.innerHTML = "";
      document.body.appendChild(root);
      root.innerHTML = "<div class='ep-admin-hero'><div><div class='ep-admin-kicker'>Electric Pro V29</div><h1>Админка</h1><p>Загрузка страницы админки...</p></div><div id='ep-admin-status' class='ep-admin-status'>Загрузка...</div></div>";
      return root;
    }

    return null;
  };

  Admin.injectAdminPageIfNeeded = async () => {
    const root = Admin.ensureRoot();
    if (!root) return;

    if (root.dataset.epAdmin === "v29.31") return;

    try {
      const res = await fetch("pages/admin.html?admin=" + encodeURIComponent(ADMIN_VERSION), { cache: "no-store" });
      if (!res.ok) throw new Error("admin html not loaded");
      root.outerHTML = await res.text();
    } catch (error) {
      root.innerHTML = `
        <div class="ep-admin-hero">
          <div>
            <div class="ep-admin-kicker">Electric Pro V29</div>
            <h1>Админка</h1>
            <p>Не удалось загрузить pages/admin.html</p>
          </div>
          <div id="ep-admin-status" class="ep-admin-status ep-admin-warn">Ошибка</div>
        </div>
      `;
    }
  };

  Admin.bindTabs = () => {
    Admin.$$(".ep-admin-tab").forEach((btn) => {
      if (btn.dataset.bound === "1") return;
      btn.dataset.bound = "1";
      btn.addEventListener("click", () => {
        const tab = btn.dataset.adminTab;
        Admin.$$(".ep-admin-tab").forEach((b) => b.classList.remove("active"));
        Admin.$$(".ep-admin-panel").forEach((p) => p.classList.remove("active"));
        btn.classList.add("active");
        const panel = Admin.$("#ep-admin-tab-" + tab);
        if (panel) panel.classList.add("active");
      });
    });

    const refresh = Admin.$("#ep-admin-refresh");
    if (refresh && refresh.dataset.bound !== "1") {
      refresh.dataset.bound = "1";
      refresh.addEventListener("click", () => Admin.reloadAll());
    }

    const search = Admin.$("#ep-admin-user-search");
    if (search && search.dataset.bound !== "1") {
      search.dataset.bound = "1";
      search.addEventListener("input", () => Admin.Users?.renderList());
    }
  };

  Admin.reloadAll = async () => {
    if (!Admin.state.isAdmin) return;
    Admin.setStatus("Загрузка данных...");

    const [users, subs, ai, plans, logs, errors] = await Promise.all([
      Admin.safeLoadCollection(Admin.collections.users, 500),
      Admin.safeLoadCollection(Admin.collections.subscriptions, 500),
      Admin.safeLoadCollection(Admin.collections.ai, 500),
      Admin.safeLoadCollection(Admin.collections.plans, 100),
      Admin.safeLoadCollection(Admin.collections.adminLogs, 100),
      Admin.safeLoadCollection(Admin.collections.errorLogs, 100)
    ]);

    Admin.state.users = users;
    Admin.state.subscriptions = new Map(subs.map((x) => [x.uid || x.id, x]));
    Admin.state.aiAccounts = new Map(ai.map((x) => [x.uid || x.id, x]));
    Admin.state.plans = plans;
    Admin.state.logs = logs;
    Admin.state.errors = errors;

    Admin.Users?.renderList();
    Admin.Users?.renderCounters();
    Admin.Subscriptions?.renderPlans();
    Admin.AiBalance?.renderList();
    Admin.Security?.renderList();
    Admin.Logs?.render();

    Admin.setStatus("Данные загружены", "ep-admin-ok");
  };

  Admin.writeAdminLog = async (payload) => {
    try {
      const actor = Admin.state.currentUser;
      await Admin.state.db.collection(Admin.collections.adminLogs).add({
        ...payload,
        actorUid: actor?.uid || "",
        actorEmail: actor?.email || "",
        createdAt: Admin.now(),
        source: "ep-admin-v29.31"
      });
    } catch (error) {
      console.warn("[EP Admin] log write failed", error);
    }
  };

  Admin.updateUserDoc = async (uid, data, action) => {
    await Admin.state.db.collection(Admin.collections.users).doc(uid).set({
      ...data,
      updatedAt: Admin.now(),
      updatedBy: Admin.state.currentUser?.uid || ""
    }, { merge: true });
    await Admin.writeAdminLog({ action, targetUid: uid, newValue: data });
  };

  Admin.init = async () => {
    if (!Admin.isAdminRoute()) return;
    if (Admin.state.initInProgress) return;

    Admin.state.initInProgress = true;
    try {
      await Admin.injectAdminPageIfNeeded();
      if (!Admin.ensureRoot()) return;

      Admin.bindTabs();
      Admin.setStatus("Ожидание Firebase...");

      const user = await Admin.waitForAuth();
      Admin.setStatus("Проверка прав...");

      const ok = await Admin.checkAdminAccess(user);
      if (!ok) return;

      await Admin.reloadAll();
    } finally {
      Admin.state.initInProgress = false;
    }
  };

  Admin.boot = () => {
    if (Admin.state.booted) return;
    Admin.state.booted = true;

    const start = () => setTimeout(() => Admin.init(), 0);

    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", start, { once: true });
    } else {
      start();
    }

    window.addEventListener("load", start, { once: true });
    window.addEventListener("hashchange", start);

    document.addEventListener("ep:route:loaded", start);
    document.addEventListener("ep:page:loaded", start);
    document.addEventListener("ep:route:changed", start);

    // Одноразовый безопасный bootstrap для SPA-роутера:
    // следит только до появления #ep-admin-root и отключается максимум через 15 секунд.
    const attachObserver = () => {
      if (!document.body) return;
      if (document.querySelector("#ep-admin-root")) {
        start();
        return;
      }
      const observer = new MutationObserver(() => {
        if (document.querySelector("#ep-admin-root")) {
          observer.disconnect();
          start();
        }
      });
      observer.observe(document.body, { childList: true, subtree: true });
      setTimeout(() => observer.disconnect(), 15000);
    };

    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", attachObserver, { once: true });
    } else {
      attachObserver();
    }
  };

  Admin.boot();
})();