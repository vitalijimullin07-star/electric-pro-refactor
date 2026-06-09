window.EP = window.EP || {};

EP.SubscriptionState = {
  current: null,
  unsubscribe: null,

  getAuth() {
    return window.firebase && firebase.auth ? firebase.auth() : null;
  },

  getDb() {
    return window.firebase && firebase.firestore ? firebase.firestore() : null;
  },

  normalizeDate(value) {
    if (!value) return null;
    if (typeof value.toDate === "function") return value.toDate();
    if (value instanceof Date) return value;
    if (typeof value === "number") return new Date(value);
    if (typeof value === "string") {
      const d = new Date(value);
      return Number.isNaN(d.getTime()) ? null : d;
    }
    return null;
  },

  daysLeft(value) {
    const date = this.normalizeDate(value);
    if (!date) return null;
    const diff = date.getTime() - Date.now();
    return Math.max(0, Math.ceil(diff / 86400000));
  },

  planLabel(profile) {
    const plan = profile?.subscriptionPlan || profile?.subscription?.plan || "none";
    if (plan === "ai") return "С ИИ";
    if (plan === "basic") return "Базовая";
    if (plan === "test") return "Тест";
    return "Нет подписки";
  },

  aiEnabled(profile) {
    if (!profile) return false;
    if (profile.aiEnabled === true) return true;
    if (profile.ai?.enabled === true) return true;
    const plan = profile.subscriptionPlan || profile.subscription?.plan;
    const balance = Number(profile.aiBalanceRub ?? profile.ai?.balanceRub ?? 0);
    return plan === "ai" && balance > 0;
  },

  apply(profile) {
    this.current = profile || null;

    const subscriptionEls = document.querySelectorAll("[data-subscription-summary]");
    const aiEls = document.querySelectorAll("[data-ai-status]");

    if (!profile) {
      subscriptionEls.forEach((el) => { el.textContent = "Нет подписки"; });
      aiEls.forEach((el) => { el.textContent = "ИИ выкл."; });
      return;
    }

    const expires = profile.subscriptionExpiresAt || profile.subscription?.expiresAt;
    const days = this.daysLeft(expires);
    const label = this.planLabel(profile);
    const text = days === null ? label : `${label} · ${days}д`;
    const aiText = this.aiEnabled(profile) ? "ИИ вкл." : "ИИ выкл.";

    subscriptionEls.forEach((el) => { el.textContent = text; });
    aiEls.forEach((el) => { el.textContent = aiText; });
  },

  bindUser(user) {
    if (this.unsubscribe) {
      this.unsubscribe();
      this.unsubscribe = null;
    }

    if (!user) {
      this.apply(null);
      return;
    }

    const db = this.getDb();
    if (!db) {
      this.apply({
        displayName: user.displayName,
        email: user.email,
        subscriptionPlan: "none",
        aiEnabled: false
      });
      return;
    }

    this.unsubscribe = db.collection("users").doc(user.uid).onSnapshot((snap) => {
      const data = snap.exists ? snap.data() : {};
      this.apply(Object.assign({ uid: user.uid, email: user.email, displayName: user.displayName }, data));
    }, (error) => {
      console.warn("SubscriptionState snapshot error", error);
      this.apply(null);
    });
  },

  init() {
    const auth = this.getAuth();
    if (auth) {
      auth.onAuthStateChanged((user) => this.bindUser(user));
    }
    window.addEventListener("ep:route-loaded", () => this.apply(this.current));
  }
};

EP.SubscriptionState.init();
