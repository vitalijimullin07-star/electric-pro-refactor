/* Electric Pro V29 — Auth Core (Secure Access).
   Профиль создаётся и обновляется ТОЛЬКО через Cloud Functions (ensureUserProfile):
   правила Firestore запрещают запись в users с клиента. Клиент профиль только читает.
   Вход: Google popup, при недоступности popup (WebView/APK) — redirect. */
window.EP = window.EP || {};

EP.Auth = {
  adminEmail: "vits0007@gmail.com",
  lastMode: "login",
  functionsRegion: "europe-west1",

  init() {
    window.addEventListener("ep:route-loaded", (event) => {
      if (event.detail?.route === "login") this.bindLoginPage();
    });

    if (!EP.Firebase?.init?.()) {
      EP.state.authReady = true;
      this.updateShell(null, null);
      return;
    }

    try { this.lastMode = sessionStorage.getItem("ep_auth_mode") || "login"; } catch (e) {}

    // завершение redirect-входа (WebView/APK-путь)
    EP.Firebase.auth.getRedirectResult?.().catch((error) => {
      if (error && error.code !== "auth/no-auth-event") {
        console.warn("Redirect auth error", error);
        this.setLoginStatus(error.message || "Ошибка входа", "error");
      }
    });

    EP.Firebase.auth.onAuthStateChanged(async (firebaseUser) => {
      EP.state.authReady = true;

      if (!firebaseUser) {
        EP.state.user = null;
        EP.state.profile = null;
        EP.state.policy = null;
        this.updateShell(null, null);
        window.dispatchEvent(new CustomEvent("ep:auth-changed", { detail: { user: null, profile: null } }));
        if (EP.state.currentRoute !== "login") EP.Router.go("login", { replace: true });
        return;
      }

      await this.loadProfile(firebaseUser, this.lastMode || "auto");
    });
  },

  functions() {
    try { if (window.firebase?.app) return firebase.app().functions(this.functionsRegion); } catch (e) {}
    try { if (window.firebase?.functions) return firebase.functions(this.functionsRegion); } catch (e) {}
    return null;
  },

  async callFunction(name, payload) {
    const fns = this.functions();
    if (!fns) throw new Error("functions-unavailable");
    const res = await fns.httpsCallable(name)(payload || {});
    return res && res.data;
  },

  isAdminEmail(user) {
    return String(user?.email || "").toLowerCase() === this.adminEmail.toLowerCase();
  },

  isAuthenticated() {
    return Boolean(EP.state.user);
  },

  isReady() {
    return Boolean(EP.state.authReady);
  },

  isAdmin() {
    const user = EP.state.user;
    const profile = EP.state.profile;
    return this.isAdminEmail(user) || profile?.role === "admin" || profile?.isAdmin === true || user?.role === "admin";
  },

  currentUser() {
    return EP.state.user;
  },

  async signIn(mode) {
    this.lastMode = mode || "login";
    try { sessionStorage.setItem("ep_auth_mode", this.lastMode); } catch (e) {}

    if (!EP.Firebase?.init?.()) {
      this.setLoginStatus("Firebase не готов. Проверь config/firebase-config.js", "error");
      return;
    }

    const provider = new firebase.auth.GoogleAuthProvider();
    provider.setCustomParameters({ prompt: "select_account" });

    try {
      this.setLoginStatus("Открываю Google вход...", "wait");
      const result = await EP.Firebase.auth.signInWithPopup(provider);
      await this.loadProfile(result.user, this.lastMode);
    } catch (error) {
      // WebView/APK и браузеры с блокировкой окон не умеют popup — переходим на redirect
      const popupBroken = ["auth/operation-not-supported-in-this-environment", "auth/popup-blocked", "auth/cancelled-popup-request", "auth/web-storage-unsupported"].indexOf(error?.code) >= 0;
      if (popupBroken) {
        try {
          this.setLoginStatus("Открываю вход через переход...", "wait");
          await EP.Firebase.auth.signInWithRedirect(provider);
          return;
        } catch (redirectError) {
          console.error("Redirect auth error", redirectError);
          this.setLoginStatus(redirectError.message || "Ошибка входа", "error");
          return;
        }
      }
      console.error("Google auth error", error);
      this.setLoginStatus(error.message || "Ошибка входа", "error");
    }
  },

  async signOut() {
    try {
      await EP.Firebase?.auth?.signOut?.();
    } finally {
      EP.state.user = null;
      EP.state.profile = null;
      EP.state.policy = null;
      this.updateShell(null, null);
      window.dispatchEvent(new CustomEvent("ep:auth-changed", { detail: { user: null, profile: null } }));
      EP.Router.go("login", { replace: true });
    }
  },

  policyDateMs(value) {
    if (!value) return null;
    if (typeof value.toMillis === "function") return value.toMillis();
    const s = value._seconds ?? value.seconds;
    if (typeof s === "number") return s * 1000;
    const d = new Date(value);
    return Number.isNaN(d.getTime()) ? null : d.getTime();
  },

  /* Политика V29 (role/accessStatus/subscription) + легаси-поля (status/isApproved/
     subscriptionExpiresAt), которые читают access-guard и старые модули. */
  makeCompatProfile(policy, firebaseUser) {
    const p = policy || {};
    const sub = p.subscription || {};
    const ai = p.ai || {};
    const expiresMs = this.policyDateMs(sub.expiresAt);
    const accessStatus = p.accessStatus || "pending";
    return {
      uid: p.uid || firebaseUser.uid,
      email: p.email || firebaseUser.email || "",
      name: p.displayName || firebaseUser.displayName || "Мастер",
      displayName: p.displayName || firebaseUser.displayName || "Мастер",
      role: p.role || "master",
      accessStatus,
      subscription: {
        plan: sub.plan || "none",
        title: sub.title || "",
        active: Boolean(sub.active),
        expiresAt: expiresMs ? new Date(expiresMs).toISOString() : null,
        daysLeft: Number(sub.daysLeft || 0)
      },
      ai: { mode: ai.mode || "off", enabled: Boolean(ai.enabled), balanceRub: Number(ai.balanceRub || 0) },
      features: p.features || {},
      // легаси-совместимость
      status: accessStatus,
      isAdmin: (p.role || "") === "admin",
      isApproved: accessStatus === "approved",
      approved: accessStatus === "approved",
      blocked: accessStatus === "blocked",
      subscriptionPlan: sub.plan || "none",
      subscriptionStatus: sub.active ? "active" : "none",
      subscriptionExpiresAt: expiresMs ? new Date(expiresMs).toISOString() : null
    };
  },

  async fetchPolicy(firebaseUser) {
    try {
      return await this.callFunction("ensureUserProfile", {});
    } catch (error) {
      console.warn("ensureUserProfile unavailable, read-only fallback", error);
      // Резерв: читаем свой документ (правила разрешают чтение самому себе)
      const snap = await EP.Firebase.db.collection("users").doc(firebaseUser.uid).get();
      return snap.exists ? snap.data() : null;
    }
  },

  async loadProfile(firebaseUser, mode) {
    if (!EP.Firebase.db) {
      this.setLoginStatus("Firestore не готов", "error");
      return;
    }

    try {
      this.setLoginStatus("Проверяю профиль...", "wait");

      const policy = await this.fetchPolicy(firebaseUser);

      if (!policy) {
        this.setLoginStatus("Профиль не найден и сервер недоступен. Попробуйте позже.", "error");
        await EP.Firebase.auth.signOut();
        return;
      }

      const profile = this.makeCompatProfile(policy, firebaseUser);

      if (profile.accessStatus === "blocked") {
        this.setLoginStatus("Аккаунт закрыт администратором. Обратитесь к администратору.", "error");
        await EP.Firebase.auth.signOut();
        return;
      }

      if (!this.canEnter(profile, firebaseUser)) {
        this.setLoginStatus(
          mode === "register"
            ? "Регистрация отправлена. Ожидайте подтверждения администратора."
            : "Аккаунт ожидает подтверждения администратора.",
          "wait"
        );
        await EP.Firebase.auth.signOut();
        return;
      }

      EP.state.user = {
        uid: firebaseUser.uid,
        email: firebaseUser.email || "",
        displayName: profile.displayName || firebaseUser.email || "Мастер",
        role: profile.role
      };
      EP.state.profile = profile;
      EP.state.policy = policy;

      this.updateShell(EP.state.user, profile);
      window.dispatchEvent(new CustomEvent("ep:auth-changed", { detail: { user: EP.state.user, profile } }));
      this.setLoginStatus("Вход выполнен", "ok");

      if (EP.state.currentRoute === "login") {
        EP.Router.go("main", { replace: true });
      }
    } catch (error) {
      console.error("Profile load error", error);
      this.setLoginStatus(error.message || "Ошибка профиля", "error");
    }
  },

  canEnter(profile, user) {
    if (this.isAdminEmail(user)) return true;
    if (profile?.role === "admin" || profile?.isAdmin === true) return true;
    return profile?.accessStatus === "approved" || profile?.status === "approved" || profile?.status === "active" || profile?.isApproved === true;
  },

  bindLoginPage() {
    document.querySelector("#googleLoginBtn")?.addEventListener("click", () => this.signIn("login"));
    document.querySelector("#registerGoogleBtn")?.addEventListener("click", () => this.signIn("register"));

    let reason = "";
    try { reason = sessionStorage.getItem("ep_block_reason") || ""; if (reason) sessionStorage.removeItem("ep_block_reason"); } catch (e) {}
    if (reason) { this.setLoginStatus(reason, "error"); return; }

    if (EP.Firebase?.ready) {
      this.setLoginStatus("Firebase готов", "ok");
    } else {
      this.setLoginStatus(EP.Firebase?.error?.message || "Firebase не готов", "error");
    }
  },

  setLoginStatus(text, type) {
    const status = document.querySelector("#loginStatusText");
    const dot = document.querySelector("#loginFirebaseDot");
    if (status) status.textContent = text || "";
    if (dot) {
      dot.classList.remove("status-ok", "status-wait", "status-error");
      dot.classList.add(type === "ok" ? "status-ok" : type === "error" ? "status-error" : "status-wait");
    }
  },

  updateShell(user, profile) {
    const name = user?.displayName || user?.email || (EP.state.currentRoute === "login" ? "Вход" : "Мастер");
    const role = profile?.role || user?.role || "guest";
    const isAdmin = this.isAdminEmail(user) || role === "admin" || profile?.isAdmin === true;

    document.querySelector("#masterName") && (document.querySelector("#masterName").textContent = name);
    document.querySelector("#sideMasterName") && (document.querySelector("#sideMasterName").textContent = name);
    document.querySelector("#sideMasterRole") && (document.querySelector("#sideMasterRole").textContent = role);

    const adminBtn = document.querySelector("#adminMenuBtn");
    if (adminBtn) adminBtn.style.display = isAdmin ? "" : "none";

    const logoutBtn = document.querySelector("#logoutBtn");
    if (logoutBtn) logoutBtn.style.display = user ? "" : "none";

    const dot = document.querySelector("#firebaseStatusDot");
    if (dot) {
      dot.classList.remove("status-ok", "status-wait", "status-error");
      dot.classList.add(EP.Firebase?.ready ? "status-ok" : "status-error");
    }

    EP.AppShell?.syncAccess?.();
  }
};
