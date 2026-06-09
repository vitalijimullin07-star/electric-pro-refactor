window.EP = window.EP || {};

EP.ExistingFirebaseAccess = {
  projectId: "electric-489f7",
  dayMs: 24 * 60 * 60 * 1000,
  lastPolicy: null,
  unsubscribe: null,

  init() {
    window.addEventListener("ep:auth-changed", () => this.reload());
    window.addEventListener("ep:route-loaded", () => this.render());

    document.addEventListener("click", (event) => {
      const refreshBtn = event.target.closest("[data-access-refresh]");
      if (refreshBtn) {
        event.preventDefault();
        this.reload({ force: true });
      }

      const copyBtn = event.target.closest("[data-copy-text]");
      if (copyBtn) {
        event.preventDefault();
        navigator.clipboard?.writeText?.(copyBtn.dataset.copyText || "");
        window.SoundAPI?.click?.();
      }
    }, true);

    setTimeout(() => this.reload(), 300);
  },

  db() {
    if (!EP.Firebase?.init?.()) return null;
    return EP.Firebase.db || null;
  },

  currentUid() {
    return EP.state?.user?.uid || EP.Firebase?.auth?.currentUser?.uid || null;
  },

  async reload() {
    const uid = this.currentUid();
    if (!uid) {
      this.lastPolicy = this.buildGuestPolicy();
      EP.state.accessPolicy = this.lastPolicy;
      this.render();
      return this.lastPolicy;
    }

    const db = this.db();
    if (!db) {
      this.lastPolicy = this.buildErrorPolicy("Firebase не готов");
      EP.state.accessPolicy = this.lastPolicy;
      this.render();
      return this.lastPolicy;
    }

    try {
      const [userSnap, subSnap, aiSnap] = await Promise.all([
        db.collection("users").doc(uid).get(),
        db.collection("user_subscriptions").doc(uid).get(),
        db.collection("ai_accounts").doc(uid).get()
      ]);

      const profile = userSnap.exists ? (userSnap.data() || {}) : (EP.state.profile || {});
      const subscription = subSnap.exists ? (subSnap.data() || {}) : null;
      const aiAccount = aiSnap.exists ? (aiSnap.data() || {}) : null;

      this.lastPolicy = this.buildPolicy(uid, profile, subscription, aiAccount);
      EP.state.accessPolicy = this.lastPolicy;
      window.dispatchEvent(new CustomEvent("ep:access-policy-loaded", { detail: { policy: this.lastPolicy } }));
      this.render();
      return this.lastPolicy;
    } catch (error) {
      console.warn("Existing Firebase access load error", error);
      this.lastPolicy = this.buildErrorPolicy(error.message || "Доступ не загружен");
      EP.state.accessPolicy = this.lastPolicy;
      this.render();
      return this.lastPolicy;
    }
  },

  buildGuestPolicy() {
    return {
      ok: false,
      source: "existing-firebase-read-only",
      uid: null,
      planId: "none",
      planTitle: "Вход",
      daysLeft: null,
      subscriptionActive: false,
      statusText: "Вход",
      aiText: "—",
      aiMode: "disabled",
      aiBalanceRub: 0,
      features: this.features("none"),
      limits: this.limits("none"),
      error: "Нет входа"
    };
  },

  buildErrorPolicy(message) {
    return {
      ok: false,
      source: "existing-firebase-read-only",
      uid: this.currentUid(),
      planId: "unknown",
      planTitle: "Доступ",
      daysLeft: null,
      subscriptionActive: false,
      statusText: "Доступ не загружен",
      aiText: "ИИ —",
      aiMode: "disabled",
      aiBalanceRub: 0,
      features: this.features("none"),
      limits: this.limits("none"),
      error: message
    };
  },

  buildPolicy(uid, profile, subscription, aiAccount) {
    const email = String(profile?.email || EP.state?.user?.email || "").toLowerCase();
    const isAdmin = profile?.role === "admin" || profile?.isAdmin === true || email === "vits0007@gmail.com";
    const blocked = profile?.blocked === true || ["blocked", "blocked_review", "deleted"].includes(profile?.status);

    const active = this.isSubscriptionActive(subscription);
    const planId = active ? this.normalizePlan(subscription?.planId) : (isAdmin ? "admin" : "none");
    const daysLeft = active ? this.daysLeft(subscription?.expiresAt) : null;
    const features = isAdmin ? this.features("admin") : this.features(planId);
    const limits = isAdmin ? this.limits("admin") : this.limits(planId);

    const accessMode = String(aiAccount?.accessMode || profile?.aiAccessMode || "disabled");
    const balanceRub = Number(aiAccount?.balanceRub || profile?.aiBalanceRub || 0);
    const allowAi = aiAccount?.allowAi !== false && profile?.securityPolicy?.allowAi !== false;
    const canUseAi = !blocked && features.ai === true && allowAi && accessMode !== "disabled" && (accessMode === "own_api" || balanceRub > 0 || isAdmin);

    const planTitle = this.planTitle(planId, subscription?.planName);
    const statusText = this.statusText(planId, daysLeft, blocked, active, isAdmin);
    const aiText = this.aiText(accessMode, canUseAi, balanceRub, features.ai, blocked);

    return {
      ok: true,
      source: "existing-firebase-read-only",
      projectId: this.projectId,
      uid,
      profile,
      subscription: subscription || null,
      aiAccount: aiAccount || null,
      isAdmin,
      blocked,
      subscriptionActive: active || isAdmin,
      planId,
      planTitle,
      daysLeft,
      statusText,
      aiText,
      aiMode: accessMode,
      aiBalanceRub: balanceRub,
      aiCanUse: canUseAi,
      features,
      limits
    };
  },

  normalizePlan(planId) {
    if (["pro_ai", "ai", "with_ai", "pro"].includes(planId)) return "pro_ai";
    if (["basic", "base"].includes(planId)) return "basic";
    if (planId === "trial") return "trial";
    return planId || "none";
  },

  planTitle(planId, fallback) {
    if (fallback) return String(fallback);
    if (planId === "admin") return "Админ";
    if (planId === "pro_ai") return "С ИИ";
    if (planId === "basic") return "Базовая";
    if (planId === "trial") return "Тест";
    return "Нет подписки";
  },

  features(planId) {
    if (planId === "admin" || planId === "pro_ai") {
      return {
        ai: true,
        customerEstimate: true,
        singleLineScheme: true,
        visualization: true,
        warehouse: true,
        accounting: true,
        fullStorage: true
      };
    }

    if (planId === "basic") {
      return {
        ai: false,
        customerEstimate: false,
        singleLineScheme: false,
        visualization: false,
        warehouse: false,
        accounting: false,
        fullStorage: false
      };
    }

    return {
      ai: false,
      customerEstimate: false,
      singleLineScheme: false,
      visualization: false,
      warehouse: false,
      accounting: false,
      fullStorage: false
    };
  },

  limits(planId) {
    if (planId === "admin" || planId === "pro_ai") return { shieldItemsMax: null, poolItemsMax: null };
    if (planId === "basic") return { shieldItemsMax: 60, poolItemsMax: 50 };
    return { shieldItemsMax: 0, poolItemsMax: 0 };
  },

  toDate(value) {
    if (!value) return null;
    try {
      if (typeof value.toDate === "function") return value.toDate();
      if (typeof value.seconds === "number") return new Date(value.seconds * 1000);
      const date = new Date(value);
      return Number.isFinite(date.getTime()) ? date : null;
    } catch (_) {
      return null;
    }
  },

  daysLeft(value) {
    const date = this.toDate(value);
    if (!date) return null;
    return Math.max(0, Math.ceil((date.getTime() - Date.now()) / this.dayMs));
  },

  isSubscriptionActive(subscription) {
    if (!subscription) return false;
    if (!["active", "trial"].includes(subscription.status)) return false;
    const date = this.toDate(subscription.expiresAt || subscription.trialEndsAt);
    return Boolean(date && date.getTime() > Date.now());
  },

  statusText(planId, daysLeft, blocked, active, isAdmin) {
    if (blocked) return "Доступ закрыт";
    if (active && daysLeft !== null) return `${this.planTitle(planId)} · ${daysLeft}д`;
    if (isAdmin) return "Админ · доступ";
    return "Нет подписки";
  },

  money(value) {
    return new Intl.NumberFormat("ru-RU", { maximumFractionDigits: 0 }).format(Number(value || 0)) + " ₽";
  },

  aiText(accessMode, canUseAi, balanceRub, featureAi, blocked) {
    if (blocked) return "ИИ закрыт";
    if (!featureAi || accessMode === "disabled") return "ИИ выкл.";
    if (accessMode === "own_api") return canUseAi ? "ИИ API клиента" : "ИИ клиент";
    if (canUseAi) return `ИИ вкл. · ${this.money(balanceRub)}`;
    return `ИИ 0 ₽`;
  },

  render() {
    const policy = this.lastPolicy || EP.state?.accessPolicy || this.buildGuestPolicy();

    const line = document.querySelector(".ep-top-status-line");
    const left = document.querySelector("[data-subscription-summary], .ep-top-status-left");
    const right = document.querySelector("[data-ai-status], .ep-top-status-right");

    if (line) {
      const status = policy.blocked ? "none" : policy.planId === "pro_ai" || policy.planId === "admin" ? "pro" : policy.planId === "basic" ? "basic" : policy.planId === "trial" ? "trial" : "none";
      const ai = policy.aiMode === "own_api" ? "own_api" : policy.aiMode === "disabled" ? "disabled" : "admin_api";
      line.dataset.status = status;
      line.dataset.ai = ai;
    }

    if (left) left.textContent = policy.statusText || "Доступ";
    if (right) right.textContent = policy.aiText || "ИИ —";

    const adminRoot = document.querySelector("#firebase-console-access-root");
    if (adminRoot) this.renderAdminInfo(adminRoot, policy);
  },

  renderAdminInfo(root, policy) {
    const uid = this.currentUid() || "—";
    root.innerHTML = `
      <div class="admin-console-page">
        <div class="admin-console-card">
          <h2>Администрирование через Firebase Console</h2>
          <p>V29 подключена к Firebase первого проекта и только читает защищённые данные. Старый проект не меняется.</p>
          <div class="admin-console-note">Подписку, ИИ-баланс, роль и доступ сейчас задаём в Firebase Console или старой рабочей админке.</div>
          <div class="admin-console-actions">
            <button class="admin-console-btn primary ep-clickable" type="button" data-access-refresh>Обновить данные</button>
            <button class="admin-console-btn ep-clickable" type="button" data-copy-text="${uid}">Скопировать мой UID</button>
          </div>
        </div>

        <div class="admin-console-grid two">
          <div class="admin-console-card">
            <h3>Текущий доступ</h3>
            <div class="admin-console-kv">
              <div class="admin-console-row"><b>UID</b><span><code>${this.escape(uid)}</code></span></div>
              <div class="admin-console-row"><b>Тариф</b><span>${this.escape(policy.statusText)}</span></div>
              <div class="admin-console-row"><b>ИИ</b><span>${this.escape(policy.aiText)}</span></div>
              <div class="admin-console-row"><b>Источник</b><span>${this.escape(policy.source)}</span></div>
            </div>
          </div>

          <div class="admin-console-card">
            <h3>Где задавать</h3>
            <ul>
              <li><code>users/{uid}</code> — роль, статус, одобрение.</li>
              <li><code>user_subscriptions/{uid}</code> — тариф, статус, срок.</li>
              <li><code>ai_accounts/{uid}</code> — ИИ-режим и баланс.</li>
            </ul>
          </div>
        </div>

        <div class="admin-console-card">
          <h3>Пример полей</h3>
          <div class="admin-console-kv">
            <div class="admin-console-row"><b>users</b><span><code>role: "admin" | "master", status: "approved", isApproved: true</code></span></div>
            <div class="admin-console-row"><b>subscription</b><span><code>planId: "pro_ai", status: "active", expiresAt: Timestamp</code></span></div>
            <div class="admin-console-row"><b>ai</b><span><code>accessMode: "admin_api", allowAi: true, balanceRub: 1250</code></span></div>
          </div>
        </div>
      </div>
    `;
  },

  escape(text) {
    return String(text ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;");
  }
};

window.AccessPolicy = {
  reload: () => EP.ExistingFirebaseAccess.reload(),
  current: () => EP.ExistingFirebaseAccess.lastPolicy || EP.state?.accessPolicy || null,
  check(feature) {
    const policy = this.current();
    if (!policy) return false;
    if (feature === "ai") return policy.aiCanUse === true;
    return policy.features?.[feature] === true;
  }
};

EP.ExistingFirebaseAccess.init();
