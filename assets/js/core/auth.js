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

    // НАТИВНАЯ сборка (APK с кодом внутри): ни popup, ни redirect тут не работают —
    // Google СПЕЦИАЛЬНО отказывает встроенным WebView («disallowed_useragent»), чтобы
    // приложение не могло подсмотреть чужой пароль. Единственный законный путь —
    // системный Google Sign-In: нативное окно выбора аккаунта отдаёт idToken, а им уже
    // логинимся в Firebase обычным signInWithCredential. В TWA и в браузере этой ветки
    // нет — там полноценный Chrome и работает обычный popup.
    if (this.isNative()) { await this.signInGoogleNative(); return; }

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

  // Приложение собрано как нативное (Capacitor), а не открыто в браузере/TWA.
  isNative() {
    return !!(window.Capacitor && window.Capacitor.isNativePlatform && window.Capacitor.isNativePlatform());
  },

  // Вход в нативной сборке: системное окно Google → idToken → Firebase.
  async signInGoogleNative() {
    const plugin = window.Capacitor?.Plugins?.FirebaseAuthentication;
    if (!plugin) {
      this.setLoginStatus("В этой сборке не подключён нативный вход Google", "error");
      return;
    }
    try {
      this.setLoginStatus("Открываю Google вход...", "wait");
      // skipNativeAuth не ставим: плагин логинит нативный Firebase SDK сам, а нам нужен
      // credential, чтобы тем же аккаунтом войти в JS SDK — именно его состояние читает
      // весь остальной код приложения (onAuthStateChanged, правила Firestore, чат).
      const res = await plugin.signInWithGoogle();
      const idToken = res?.credential?.idToken;
      if (!idToken) throw new Error("Google не вернул idToken");
      const cred = firebase.auth.GoogleAuthProvider.credential(idToken);
      const out = await EP.Firebase.auth.signInWithCredential(cred);
      await this.loadProfile(out.user, this.lastMode);
    } catch (error) {
      const code = String(error?.code || error?.message || error);
      console.error("Native Google auth error", error);
      // Самая частая причина на свежей сборке: в Firebase не заведено Android-приложение
      // с этим package и отпечатком ключа — Google Play Services отвечают DEVELOPER_ERROR
      // (код 10) без каких-либо подробностей, и понять это по сообщению невозможно.
      if (/10|DEVELOPER_ERROR|ApiException/.test(code)) {
        this.setLoginStatus("Вход не настроен для этой сборки: в Firebase нужно добавить Android-приложение с отпечатком ключа (см. docs/APK.md)", "error");
        return;
      }
      if (/12501|canceled|cancelled/i.test(code)) { this.setLoginStatus("Вход отменён", "error"); return; }
      this.setLoginStatus(error?.message || "Ошибка входа", "error");
    }
  },

  async signOut() {
    // вышел явно — офлайн-профиль больше не нужен (на общем телефоне следующий
    // мастер не должен войти без сети под чужим профилем)
    this.clearOfflineProfile();
    try {
      // В нативной сборке выходим и из системного Google-аккаунта: иначе следующий вход
      // молча возьмёт прежний аккаунт, не показав выбор, — «сменить пользователя» на
      // общем телефоне станет невозможно.
      if (this.isNative()) {
        try { await window.Capacitor.Plugins.FirebaseAuthentication.signOut(); } catch (e) {}
      }
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

  /* ---------- ОФЛАЙН-ВХОД ----------
     Без сети приложение не пускало даже мастера, который уже входил: профиль проверяется
     на сервере (ensureUserProfile → резервное чтение users/{uid}), а Firestore без связи
     ещё и ждёт до 10 секунд, прежде чем сдаться. Итог — экран входа с «client is
     offline», хотя все проекты, сметы и база лежат на самом устройстве.
     Теперь после КАЖДОЙ успешной проверки профиль кэшируется (тот же uid, срок
     OFFLINE_DAYS), и при отсутствии связи вход идёт по кэшу. Это не ослабляет защиту:
     облачные данные по-прежнему закрыты правилами Firestore, а свежий ответ сервера
     (закрыли доступ, кончилась подписка) применяется сразу, как только появится сеть.
     Первый вход на устройстве — только с интернетом: кэшировать ещё нечего. */
  OFFLINE_KEY: "ep_auth_offline_v1",
  OFFLINE_DAYS: 30,
  OFFLINE_WAIT_MS: 6000,

  saveOfflineProfile(uid, policy) {
    try { localStorage.setItem(this.OFFLINE_KEY, JSON.stringify({ uid: uid, policy: policy, at: Date.now() })); } catch (e) {}
  },

  readOfflineProfile(uid) {
    try {
      const o = JSON.parse(localStorage.getItem(this.OFFLINE_KEY) || "null");
      if (!o || !uid || o.uid !== uid || !o.policy || typeof o.policy !== "object" || typeof o.at !== "number") return null;
      if (Date.now() - o.at > this.OFFLINE_DAYS * 86400000) return null;
      return o;
    } catch (e) { return null; }
  },

  clearOfflineProfile() {
    try { localStorage.removeItem(this.OFFLINE_KEY); } catch (e) {}
  },

  isOffline() {
    return typeof navigator !== "undefined" && navigator.onLine === false;
  },

  // Ошибка «нет связи», а не «сервер ответил отказом»: только в первом случае можно
  // войти по кэшу. Отказ сервера (профиль удалён, нет прав) кэшем не перекрываем.
  isNetworkError(error) {
    if (this.isOffline()) return true;
    const s = String((error && error.code) || "") + " " + String((error && error.message) || "");
    return /unavailable|offline|network|timeout|deadline-exceeded|failed to fetch/i.test(s);
  },

  withTimeout(promise, ms) {
    return new Promise((resolve, reject) => {
      const t = setTimeout(() => { const e = new Error("timeout"); e.code = "timeout"; reject(e); }, ms);
      promise.then((v) => { clearTimeout(t); resolve(v); }, (e) => { clearTimeout(t); reject(e); });
    });
  },

  notice(text) {
    try {
      let el = document.getElementById("ep-log-toast");
      if (!el) { el = document.createElement("div"); el.id = "ep-log-toast"; document.body.appendChild(el); }
      el.textContent = text; el.style.opacity = "1";
      clearTimeout(this._noticeT);
      this._noticeT = setTimeout(() => { try { el.style.opacity = "0"; } catch (e) {} }, 3500);
    } catch (e) {}
  },

  // Вход по сохранённому профилю. Закрытый в кэше доступ не открываем и офлайн.
  enterOffline(firebaseUser, cached, mode) {
    const profile = this.makeCompatProfile(cached.policy, firebaseUser);
    if (profile.accessStatus === "blocked" || !this.canEnter(profile, firebaseUser)) {
      this.setLoginStatus("Нет связи с сервером, а доступ этого аккаунта не подтверждён. Подключись к интернету.", "error");
      return false;
    }
    this.applyProfile(firebaseUser, cached.policy, profile, true);
    const d = new Date(cached.at);
    const when = String(d.getDate()).padStart(2, "0") + "." + String(d.getMonth() + 1).padStart(2, "0");
    this.setLoginStatus("Офлайн: профиль от " + when, "ok");
    this.notice("Нет сети — работаю офлайн. Чат, облако и ИИ включатся, когда появится интернет.");
    this.watchOnline(firebaseUser, mode);
    return true;
  },

  // Связь вернулась — перепроверяем профиль на сервере (там могли закрыть доступ или
  // продлить подписку). Плюс страховка таймером: navigator.onLine бывает true и в сети
  // без интернета, тогда события «online» просто не будет.
  watchOnline(firebaseUser, mode) {
    const recheck = () => {
      if (!EP.state.offline || this._rechecking) return;
      const u = EP.Firebase?.auth?.currentUser;
      if (!u || u.uid !== firebaseUser.uid || this.isOffline()) return;
      this._rechecking = true;
      this.loadProfile(u, mode || "auto").finally(() => { this._rechecking = false; });
    };
    if (!this._onlineHooked) {
      this._onlineHooked = true;
      window.addEventListener("online", () => setTimeout(recheck, 800));
    }
    clearInterval(this._offlineTimer);
    this._offlineTimer = setInterval(() => {
      if (!EP.state.offline) { clearInterval(this._offlineTimer); return; }
      recheck();
    }, 60000);
  },

  applyProfile(firebaseUser, policy, profile, offline) {
    EP.state.user = {
      uid: firebaseUser.uid,
      email: firebaseUser.email || "",
      displayName: profile.displayName || firebaseUser.email || "Мастер",
      role: profile.role
    };
    EP.state.profile = profile;
    EP.state.policy = policy;
    EP.state.offline = !!offline;
    try { document.body.dataset.offline = offline ? "1" : "0"; } catch (e) {}

    this.updateShell(EP.state.user, profile);
    window.dispatchEvent(new CustomEvent("ep:auth-changed", { detail: { user: EP.state.user, profile, offline: !!offline } }));

    if (EP.state.currentRoute === "login") {
      EP.Router.go("main", { replace: true });
    }
  },

  async loadProfile(firebaseUser, mode) {
    if (!EP.Firebase.db) {
      this.setLoginStatus("Firestore не готов", "error");
      return;
    }

    const cached = this.readOfflineProfile(firebaseUser.uid);
    // сети нет совсем — не ждём таймаутов Firestore (до 10 с), сразу входим по кэшу
    if (cached && this.isOffline()) {
      this.enterOffline(firebaseUser, cached, mode);
      return;
    }

    try {
      this.setLoginStatus("Проверяю профиль...", "wait");

      let policy;
      try {
        // с кэшем ждём сервер недолго: плохая связь не должна держать мастера на
        // экране входа — войдёт по кэшу, а свежий профиль подтянется позже
        policy = cached
          ? await this.withTimeout(this.fetchPolicy(firebaseUser), this.OFFLINE_WAIT_MS)
          : await this.fetchPolicy(firebaseUser);
      } catch (error) {
        if (cached && this.isNetworkError(error)) {
          this.enterOffline(firebaseUser, cached, mode);
          return;
        }
        if (!cached && this.isNetworkError(error)) {
          this.setLoginStatus("Нет связи с сервером. Первый вход — с интернетом, дальше приложение работает и без сети.", "error");
          return;
        }
        throw error;
      }

      if (!policy) {
        this.clearOfflineProfile();
        this.setLoginStatus("Профиль не найден и сервер недоступен. Попробуйте позже.", "error");
        await EP.Firebase.auth.signOut();
        return;
      }

      const profile = this.makeCompatProfile(policy, firebaseUser);

      if (profile.accessStatus === "blocked") {
        // свежий ответ сервера главнее кэша: закрытый аккаунт не войдёт и офлайн
        this.clearOfflineProfile();
        this.setLoginStatus("Аккаунт закрыт администратором. Обратитесь к администратору.", "error");
        await EP.Firebase.auth.signOut();
        return;
      }

      if (!this.canEnter(profile, firebaseUser)) {
        this.clearOfflineProfile();
        this.setLoginStatus(
          mode === "register"
            ? "Регистрация отправлена. Ожидайте подтверждения администратора."
            : "Аккаунт ожидает подтверждения администратора.",
          "wait"
        );
        await EP.Firebase.auth.signOut();
        return;
      }

      // профиль подтверждён сервером — его и кэшируем для входа без сети
      this.saveOfflineProfile(firebaseUser.uid, policy);
      this.applyProfile(firebaseUser, policy, profile, false);
      this.setLoginStatus("Вход выполнен", "ok");
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
