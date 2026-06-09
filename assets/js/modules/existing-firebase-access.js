window.EP = window.EP || {};

EP.ExistingFirebaseAccess = {
  projectId: "electric-489f7",
  dayMs: 24 * 60 * 60 * 1000,
  lastPolicy: null,
  lastAdminTarget: null,
  unsubscribe: null,

  init() {
    window.addEventListener("ep:auth-changed", () => this.reload());
    window.addEventListener("ep:route-loaded", () => this.render());

    document.addEventListener("click", (event) => {
      const refreshBtn = event.target.closest("[data-access-refresh]");
      if (refreshBtn) {
        event.preventDefault();
        this.reload({ force: true });
        window.SoundAPI?.click?.();
        return;
      }

      const loadUidBtn = event.target.closest("[data-admin-load-uid]");
      if (loadUidBtn) {
        event.preventDefault();
        const input = document.querySelector("#admin-target-uid");
        this.loadAdminTarget(String(input?.value || "").trim());
        window.SoundAPI?.click?.();
        return;
      }

      const copyBtn = event.target.closest("[data-copy-text]");
      if (copyBtn) {
        event.preventDefault();
        navigator.clipboard?.writeText?.(copyBtn.dataset.copyText || "");
        window.SoundAPI?.click?.();
        this.flashButton(copyBtn, "Скопировано");
        return;
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

  currentEmail() {
    return String(EP.state?.user?.email || EP.Firebase?.auth?.currentUser?.email || "").toLowerCase();
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
      projectId: this.projectId,
      uid: null,
      email: "",
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
      projectId: this.projectId,
      uid: this.currentUid(),
      email: this.currentEmail(),
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
    const planId = active ? this.normalizePlan(subscription?.planId || subscription?.plan) : (isAdmin ? "admin" : "none");
    const daysLeft = active ? this.daysLeft(subscription?.expiresAt || subscription?.until || subscription?.trialEndsAt) : null;
    const features = isAdmin ? this.features("admin") : this.features(planId);
    const limits = isAdmin ? this.limits("admin") : this.limits(planId);

    const accessMode = String(aiAccount?.accessMode || aiAccount?.mode || profile?.aiAccessMode || profile?.aiMode || "disabled");
    const balanceRub = Number(aiAccount?.balanceRub || aiAccount?.balance || profile?.aiBalanceRub || 0);
    const allowAi = aiAccount?.allowAi !== false && profile?.securityPolicy?.allowAi !== false && profile?.aiEnabled !== false;
    const canUseAi = !blocked && features.ai === true && allowAi && accessMode !== "disabled" && (accessMode === "own_api" || balanceRub > 0 || isAdmin);

    const planTitle = this.planTitle(planId, subscription?.planName || subscription?.planTitle);
    const statusText = this.statusText(planId, daysLeft, blocked, active, isAdmin);
    const aiText = this.aiText(accessMode, canUseAi, balanceRub, features.ai, blocked);

    return {
      ok: true,
      source: "existing-firebase-read-only",
      projectId: this.projectId,
      uid,
      email,
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
    if (subscription.active === true) return true;
    if (!["active", "trial"].includes(subscription.status)) return false;
    const date = this.toDate(subscription.expiresAt || subscription.until || subscription.trialEndsAt);
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
    return "ИИ 0 ₽";
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

  async loadAdminTarget(uid) {
    const root = document.querySelector("#admin-target-result");
    if (!root) return;
    if (!uid) {
      root.innerHTML = this.adminEmptyTarget("Вставь UID мастера и нажми «Проверить UID».");
      return;
    }

    const policy = this.lastPolicy || EP.state?.accessPolicy;
    if (!policy?.isAdmin) {
      root.innerHTML = this.adminEmptyTarget("Проверка чужого UID доступна только админу. Для обычного мастера показывается только свой профиль.");
      return;
    }

    const db = this.db();
    if (!db) {
      root.innerHTML = this.adminEmptyTarget("Firebase не готов.");
      return;
    }

    root.innerHTML = this.adminLoadingTarget(uid);

    try {
      const [userSnap, subSnap, aiSnap] = await Promise.all([
        db.collection("users").doc(uid).get(),
        db.collection("user_subscriptions").doc(uid).get(),
        db.collection("ai_accounts").doc(uid).get()
      ]);

      this.lastAdminTarget = {
        uid,
        user: userSnap.exists ? userSnap.data() : null,
        subscription: subSnap.exists ? subSnap.data() : null,
        ai: aiSnap.exists ? aiSnap.data() : null
      };

      root.innerHTML = this.renderAdminTarget(this.lastAdminTarget);
    } catch (error) {
      root.innerHTML = this.adminEmptyTarget("Не удалось прочитать карточку UID. Вероятно, текущие Firestore Rules не дают читать чужие профили напрямую. Это нормально для безопасного режима без Cloud Functions.", error.message);
    }
  },

  renderAdminInfo(root, policy) {
    const uid = this.currentUid() || "—";
    const email = this.currentEmail() || policy.email || "—";
    const firebaseConsoleUrl = `https://console.firebase.google.com/project/${this.projectId}/firestore/databases/-default-/data`;
    const userPath = uid !== "—" ? `users/${uid}` : "users/{uid}";
    const subPath = uid !== "—" ? `user_subscriptions/${uid}` : "user_subscriptions/{uid}";
    const aiPath = uid !== "—" ? `ai_accounts/${uid}` : "ai_accounts/{uid}";
    const sampleUid = uid !== "—" ? uid : "USER_UID";

    const profileTemplate = this.templateUser(sampleUid, email);
    const subTemplate = this.templateSubscription(sampleUid);
    const aiTemplate = this.templateAi(sampleUid);

    root.innerHTML = `
      <div class="admin-console-page admin-visual-page">
        <section class="admin-hero-card">
          <div>
            <div class="admin-eyebrow">V29.19 · безопасный визуал админки</div>
            <h2>Администрирование доступа</h2>
            <p>Новая V29 подключена к Firebase первого проекта и сейчас работает в режиме чтения. Управление можно делать через Firebase Console или старую рабочую админку.</p>
          </div>
          <div class="admin-hero-badges">
            <span class="admin-pill good">Старый проект не меняем</span>
            <span class="admin-pill safe">Rules/Functions не деплоим</span>
            <span class="admin-pill">${this.escape(this.projectId)}</span>
          </div>
        </section>

        <section class="admin-stat-grid">
          ${this.statCard("Профиль", email, policy.isAdmin ? "Администратор" : "Мастер", policy.isAdmin ? "good" : "")}
          ${this.statCard("Подписка", policy.statusText || "—", policy.subscriptionActive ? "Активна" : "Нет активной", policy.subscriptionActive ? "good" : "warn")}
          ${this.statCard("ИИ", policy.aiText || "—", policy.aiCanUse ? "Доступен" : "Ограничен", policy.aiCanUse ? "good" : "warn")}
          ${this.statCard("Режим", "Read only", "Без записи в защищённые поля", "safe")}
        </section>

        <section class="admin-console-grid two admin-main-grid">
          <div class="admin-console-card admin-panel-card">
            <div class="admin-card-head">
              <div>
                <h3>Текущий пользователь</h3>
                <p>Данные, которые V29 сейчас видит после входа.</p>
              </div>
              <button class="admin-icon-btn ep-clickable" type="button" data-access-refresh title="Обновить">↻</button>
            </div>
            <div class="admin-console-kv">
              <div class="admin-console-row"><b>UID</b><span><code>${this.escape(uid)}</code></span></div>
              <div class="admin-console-row"><b>Email</b><span>${this.escape(email)}</span></div>
              <div class="admin-console-row"><b>Роль</b><span>${policy.isAdmin ? "Админ" : "Мастер"}</span></div>
              <div class="admin-console-row"><b>Тариф</b><span>${this.escape(policy.statusText)}</span></div>
              <div class="admin-console-row"><b>ИИ</b><span>${this.escape(policy.aiText)}</span></div>
            </div>
            <div class="admin-console-actions">
              <button class="admin-console-btn primary ep-clickable" type="button" data-access-refresh>Обновить данные</button>
              <button class="admin-console-btn ep-clickable" type="button" data-copy-text="${this.attr(uid)}">Скопировать UID</button>
              <a class="admin-console-btn ep-clickable" href="${firebaseConsoleUrl}" target="_blank" rel="noopener">Открыть Firebase</a>
            </div>
          </div>

          <div class="admin-console-card admin-panel-card">
            <div class="admin-card-head">
              <div>
                <h3>Где править вручную</h3>
                <p>Пока это самый безопасный режим: V29 читает, админ меняет в Firebase Console.</p>
              </div>
            </div>
            <div class="admin-path-list">
              ${this.pathRow("Профиль", userPath, "роль, статус, имя, одобрение")}
              ${this.pathRow("Подписка", subPath, "тариф, статус, дата окончания")}
              ${this.pathRow("ИИ-баланс", aiPath, "режим ИИ, разрешение, баланс")}
            </div>
          </div>
        </section>

        <section class="admin-console-card admin-panel-card">
          <div class="admin-card-head">
            <div>
              <h3>Проверить карточку мастера</h3>
              <p>Вставь UID мастера. V29 попробует прочитать три документа без записи в базу.</p>
            </div>
          </div>
          <div class="admin-uid-checker">
            <input id="admin-target-uid" class="admin-input" type="text" placeholder="UID мастера" value="${this.attr(uid !== "—" ? uid : "")}" />
            <button class="admin-console-btn primary ep-clickable" type="button" data-admin-load-uid>Проверить UID</button>
          </div>
          <div id="admin-target-result" class="admin-target-result">
            ${this.adminEmptyTarget(policy.isAdmin ? "Можно проверить свой UID или UID мастера." : "Сейчас показан безопасный режим. Чужие UID доступны только админу.")}
          </div>
        </section>

        <section class="admin-console-grid three admin-template-grid">
          ${this.templateCard("users/{uid}", "Профиль и роль", profileTemplate)}
          ${this.templateCard("user_subscriptions/{uid}", "Подписка", subTemplate)}
          ${this.templateCard("ai_accounts/{uid}", "ИИ и баланс", aiTemplate)}
        </section>

        <section class="admin-console-card admin-panel-card">
          <h3>Следующий безопасный этап</h3>
          <div class="admin-timeline">
            <div><b>Сейчас</b><span>Визуал админки + чтение существующего Firebase.</span></div>
            <div><b>Потом</b><span>Сравнить старые Rules и Functions, ничего не перезаписывать.</span></div>
            <div><b>Финал</b><span>Новая админка будет сохранять через Cloud Functions, а не напрямую из клиента.</span></div>
          </div>
        </section>
      </div>
    `;
  },

  statCard(title, value, note, tone) {
    return `
      <div class="admin-stat-card ${this.escape(tone || "")}">
        <span>${this.escape(title)}</span>
        <b>${this.escape(value)}</b>
        <small>${this.escape(note)}</small>
      </div>
    `;
  },

  pathRow(title, path, hint) {
    return `
      <div class="admin-path-row">
        <div>
          <b>${this.escape(title)}</b>
          <code>${this.escape(path)}</code>
          <span>${this.escape(hint)}</span>
        </div>
        <button class="admin-mini-btn ep-clickable" type="button" data-copy-text="${this.attr(path)}">Копировать</button>
      </div>
    `;
  },

  templateCard(path, title, template) {
    const text = JSON.stringify(template, null, 2);
    return `
      <div class="admin-console-card admin-template-card">
        <h3>${this.escape(title)}</h3>
        <code>${this.escape(path)}</code>
        <pre>${this.escape(text)}</pre>
        <button class="admin-console-btn ep-clickable" type="button" data-copy-text="${this.attr(text)}">Скопировать шаблон</button>
      </div>
    `;
  },

  templateUser(uid, email) {
    return {
      uid,
      email: email === "—" ? "master@example.com" : email,
      displayName: "Имя мастера",
      role: email === "vits0007@gmail.com" ? "admin" : "master",
      status: "approved",
      isApproved: true,
      blocked: false,
      accessUpdatedAt: "Timestamp"
    };
  },

  templateSubscription(uid) {
    return {
      uid,
      planId: "pro_ai",
      planName: "С ИИ",
      status: "active",
      active: true,
      expiresAt: "Timestamp",
      updatedAt: "Timestamp"
    };
  },

  templateAi(uid) {
    return {
      uid,
      accessMode: "admin_api",
      allowAi: true,
      balanceRub: 1250,
      blocked: false,
      updatedAt: "Timestamp"
    };
  },

  adminEmptyTarget(message, detail) {
    return `
      <div class="admin-empty-state">
        <b>${this.escape(message)}</b>
        ${detail ? `<span>${this.escape(detail)}</span>` : ""}
      </div>
    `;
  },

  adminLoadingTarget(uid) {
    return `
      <div class="admin-empty-state loading">
        <b>Читаю документы для UID</b>
        <code>${this.escape(uid)}</code>
      </div>
    `;
  },

  renderAdminTarget(target) {
    return `
      <div class="admin-target-card">
        <div class="admin-target-title">
          <b>UID</b>
          <code>${this.escape(target.uid)}</code>
        </div>
        <div class="admin-target-docs">
          ${this.targetDoc("users", target.user)}
          ${this.targetDoc("user_subscriptions", target.subscription)}
          ${this.targetDoc("ai_accounts", target.ai)}
        </div>
      </div>
    `;
  },

  targetDoc(name, data) {
    const exists = data !== null && data !== undefined;
    const text = exists ? JSON.stringify(this.cleanForDisplay(data), null, 2) : "Документ не найден";
    return `
      <div class="admin-target-doc ${exists ? "exists" : "missing"}">
        <div>
          <b>${this.escape(name)}</b>
          <span>${exists ? "найден" : "нет документа"}</span>
        </div>
        <pre>${this.escape(text)}</pre>
      </div>
    `;
  },

  cleanForDisplay(value) {
    if (value === null || value === undefined) return value;
    if (typeof value?.toDate === "function") return value.toDate().toISOString();
    if (Array.isArray(value)) return value.map((item) => this.cleanForDisplay(item));
    if (typeof value === "object") {
      const out = {};
      Object.keys(value).forEach((key) => {
        out[key] = this.cleanForDisplay(value[key]);
      });
      return out;
    }
    return value;
  },

  flashButton(button, text) {
    const old = button.textContent;
    button.textContent = text;
    clearTimeout(button.__epFlashTimer);
    button.__epFlashTimer = setTimeout(() => {
      button.textContent = old;
    }, 900);
  },

  attr(text) {
    return this.escape(text).replaceAll("`", "&#96;");
  },

  escape(text) {
    return String(text ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
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
