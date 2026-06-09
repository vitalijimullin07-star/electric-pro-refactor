window.EP = window.EP || {};

EP.Auth = {
  adminEmail: "vits0007@gmail.com",
  lastMode: "login",

  init() {
    window.addEventListener("ep:route-loaded", (event) => {
      if (event.detail?.route === "login") this.bindLoginPage();
    });

    if (!EP.Firebase?.init?.()) {
      EP.state.authReady = true;
      this.updateShell(null, null);
      return;
    }

    EP.Firebase.auth.onAuthStateChanged(async (firebaseUser) => {
      EP.state.authReady = true;

      if (!firebaseUser) {
        EP.state.user = null;
        EP.state.profile = null;
        this.updateShell(null, null);
        if (EP.state.currentRoute !== "login") EP.Router.go("login", { replace: true });
        return;
      }

      await this.loadProfile(firebaseUser, "auto");
    });
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

  currentUser() {
    return EP.state.user;
  },

  async signIn(mode) {
    this.lastMode = mode || "login";

    if (!EP.Firebase?.init?.()) {
      this.setLoginStatus("Firebase не готов. Проверь config/firebase-config.js", "error");
      return;
    }

    try {
      this.setLoginStatus("Открываю Google вход...", "wait");
      const provider = new firebase.auth.GoogleAuthProvider();
      provider.setCustomParameters({ prompt: "select_account" });
      const result = await EP.Firebase.auth.signInWithPopup(provider);
      await this.loadProfile(result.user, this.lastMode);
    } catch (error) {
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
      this.updateShell(null, null);
      EP.Router.go("login", { replace: true });
    }
  },

  async loadProfile(firebaseUser, mode) {
    const db = EP.Firebase.db;
    if (!db) {
      this.setLoginStatus("Firestore не готов", "error");
      return;
    }

    try {
      this.setLoginStatus("Проверяю профиль...", "wait");

      const ref = db.collection("users").doc(firebaseUser.uid);
      const snap = await ref.get();
      const adminByEmail = this.isAdminEmail(firebaseUser);

      if (!snap.exists) {
        if (!adminByEmail && mode !== "register") {
          this.setLoginStatus("Профиль не найден. Нажми регистрацию мастера.", "error");
          await EP.Firebase.auth.signOut();
          return;
        }

        const profile = adminByEmail
          ? this.makeAdminProfile(firebaseUser)
          : this.makePendingMasterProfile(firebaseUser);

        await ref.set(profile, { merge: true });

        if (!adminByEmail) {
          this.setLoginStatus("Регистрация отправлена. Жди одобрения администратора.", "wait");
          await EP.Firebase.auth.signOut();
          return;
        }
      }

      const freshSnap = await ref.get();
      const profile = freshSnap.exists ? freshSnap.data() : this.makeAdminProfile(firebaseUser);

      if (!this.canEnter(profile, firebaseUser)) {
        this.setLoginStatus("Аккаунт ожидает одобрения администратора.", "wait");
        await EP.Firebase.auth.signOut();
        return;
      }

      await ref.set({
        lastLoginAt: firebase.firestore.FieldValue.serverTimestamp(),
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
      }, { merge: true });

      EP.state.user = {
        uid: firebaseUser.uid,
        email: firebaseUser.email || "",
        displayName: profile.name || firebaseUser.displayName || firebaseUser.email || "Мастер",
        role: profile.role || (adminByEmail ? "admin" : "master")
      };
      EP.state.profile = profile;

      this.updateShell(EP.state.user, profile);
      this.setLoginStatus("Вход выполнен", "ok");

      if (EP.state.currentRoute === "login") {
        EP.Router.go("main", { replace: true });
      }
    } catch (error) {
      console.error("Profile load error", error);
      this.setLoginStatus(error.message || "Ошибка профиля", "error");
    }
  },

  makeAdminProfile(user) {
    return {
      uid: user.uid,
      name: user.displayName || "Администратор",
      email: user.email || this.adminEmail,
      role: "admin",
      isAdmin: true,
      isApproved: true,
      status: "approved",
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    };
  },

  makePendingMasterProfile(user) {
    return {
      uid: user.uid,
      name: user.displayName || "Мастер",
      email: user.email || "",
      role: "master",
      isAdmin: false,
      isApproved: false,
      status: "pending",
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    };
  },

  canEnter(profile, user) {
    if (this.isAdminEmail(user)) return true;
    if (profile?.isAdmin === true) return true;
    if (profile?.isApproved === true) return true;
    return profile?.status === "approved";
  },

  bindLoginPage() {
    document.querySelector("#googleLoginBtn")?.addEventListener("click", () => this.signIn("login"));
    document.querySelector("#registerGoogleBtn")?.addEventListener("click", () => this.signIn("register"));

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
    const name = user?.displayName || user?.email || "Мастер";
    const role = profile?.role || user?.role || "guest";
    const isAdmin = role === "admin" || profile?.isAdmin === true;

    document.querySelector("#masterName") && (document.querySelector("#masterName").textContent = name);
    document.querySelector("#sideMasterName") && (document.querySelector("#sideMasterName").textContent = name);
    document.querySelector("#sideMasterRole") && (document.querySelector("#sideMasterRole").textContent = role);
    document.querySelector("#adminMenuBtn")?.classList.toggle("hidden", !isAdmin);
    document.querySelector("#logoutBtn")?.classList.toggle("hidden", !user);

    const dot = document.querySelector("#firebaseStatusDot");
    if (dot) {
      dot.classList.remove("status-ok", "status-wait", "status-error");
      dot.classList.add(EP.Firebase?.ready ? "status-ok" : "status-error");
    }
  }
};
