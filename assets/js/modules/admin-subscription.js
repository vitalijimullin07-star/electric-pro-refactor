window.EP = window.EP || {};

EP.AdminSubscription = {
  users: [],
  adminEmails: ["vits0007@gmail.com"],

  getAuth() {
    return window.firebase && firebase.auth ? firebase.auth() : null;
  },

  getDb() {
    return window.firebase && firebase.firestore ? firebase.firestore() : null;
  },

  isAdmin(user, profile) {
    if (!user) return false;
    if (this.adminEmails.includes(String(user.email || "").toLowerCase())) return true;
    return profile?.role === "admin" || profile?.isAdmin === true;
  },

  async getMyProfile(user) {
    const db = this.getDb();
    if (!db || !user) return null;
    const snap = await db.collection("users").doc(user.uid).get();
    return snap.exists ? snap.data() : null;
  },

  formatDate(value) {
    if (!value) return "—";
    const d = typeof value.toDate === "function" ? value.toDate() : new Date(value);
    if (Number.isNaN(d.getTime())) return "—";
    return d.toLocaleDateString("ru-RU");
  },

  addDays(days) {
    const d = new Date();
    d.setDate(d.getDate() + Number(days || 0));
    return d;
  },

  planLabel(plan) {
    if (plan === "ai") return "С ИИ";
    if (plan === "basic") return "Базовая";
    if (plan === "test") return "Тест 2 дня";
    return "Нет";
  },

  async loadUsers() {
    const db = this.getDb();
    if (!db) return [];
    const snap = await db.collection("users").limit(100).get();
    return snap.docs.map((doc) => Object.assign({ uid: doc.id }, doc.data()));
  },

  async saveUser(uid, form) {
    const db = this.getDb();
    if (!db) throw new Error("Firestore не подключён");

    const plan = form.querySelector("[data-admin-plan]").value;
    const days = Number(form.querySelector("[data-admin-days]").value || 0);
    const aiMode = form.querySelector("[data-admin-ai-mode]").value;
    const balance = Number(form.querySelector("[data-admin-ai-balance]").value || 0);
    const approved = form.querySelector("[data-admin-approved]").value === "true";
    const expiresAt = this.addDays(days);
    const aiEnabled = plan === "ai" && (aiMode === "client_api" || balance > 0);

    const payload = {
      approved,
      role: form.querySelector("[data-admin-role]").value,
      subscriptionPlan: plan,
      subscriptionStatus: plan === "none" ? "inactive" : "active",
      subscriptionExpiresAt: expiresAt,
      subscription: {
        plan,
        title: this.planLabel(plan),
        status: plan === "none" ? "inactive" : "active",
        expiresAt
      },
      aiMode,
      aiEnabled,
      aiBalanceRub: balance,
      ai: {
        mode: aiMode,
        enabled: aiEnabled,
        balanceRub: balance
      },
      updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    };

    await db.collection("users").doc(uid).set(payload, { merge: true });
    return payload;
  },

  userCard(user) {
    const plan = user.subscriptionPlan || user.subscription?.plan || "none";
    const role = user.role || (String(user.email || "").toLowerCase() === "vits0007@gmail.com" ? "admin" : "master");
    const approved = user.approved === true;
    const aiMode = user.aiMode || user.ai?.mode || "server_balance";
    const balance = user.aiBalanceRub ?? user.ai?.balanceRub ?? 0;
    const expires = user.subscriptionExpiresAt || user.subscription?.expiresAt;
    const title = user.displayName || user.name || "Без имени";
    const email = user.email || "Без email";

    return `
      <form class="ep-master-card" data-admin-user-form data-uid="${user.uid}">
        <div class="ep-master-head">
          <div>
            <div class="ep-master-name">${title}</div>
            <div class="ep-master-mail">${email}</div>
            <div class="ep-master-meta">UID: ${user.uid}</div>
            <div class="ep-master-meta">Подписка до: ${this.formatDate(expires)}</div>
          </div>
          <div class="ep-master-badge">${this.planLabel(plan)}</div>
        </div>

        <div class="ep-admin-grid">
          <label class="ep-admin-field">
            <span class="ep-admin-label">Роль</span>
            <select class="ep-admin-select" data-admin-role>
              <option value="master" ${role === "master" ? "selected" : ""}>Мастер</option>
              <option value="admin" ${role === "admin" ? "selected" : ""}>Админ</option>
            </select>
          </label>

          <label class="ep-admin-field">
            <span class="ep-admin-label">Доступ</span>
            <select class="ep-admin-select" data-admin-approved>
              <option value="true" ${approved ? "selected" : ""}>Разрешён</option>
              <option value="false" ${!approved ? "selected" : ""}>Ожидает</option>
            </select>
          </label>

          <label class="ep-admin-field">
            <span class="ep-admin-label">Тариф</span>
            <select class="ep-admin-select" data-admin-plan>
              <option value="none" ${plan === "none" ? "selected" : ""}>Нет</option>
              <option value="basic" ${plan === "basic" ? "selected" : ""}>Базовая</option>
              <option value="ai" ${plan === "ai" ? "selected" : ""}>С ИИ</option>
              <option value="test" ${plan === "test" ? "selected" : ""}>Тест 2 дня</option>
            </select>
          </label>

          <label class="ep-admin-field">
            <span class="ep-admin-label">Срок</span>
            <select class="ep-admin-select" data-admin-days>
              <option value="2">2 дня</option>
              <option value="30" selected>30 дней</option>
              <option value="90">90 дней</option>
              <option value="180">180 дней</option>
              <option value="360">360 дней</option>
            </select>
          </label>

          <label class="ep-admin-field">
            <span class="ep-admin-label">ИИ режим</span>
            <select class="ep-admin-select" data-admin-ai-mode>
              <option value="server_balance" ${aiMode === "server_balance" ? "selected" : ""}>API сервера / баланс</option>
              <option value="client_api" ${aiMode === "client_api" ? "selected" : ""}>API клиента</option>
              <option value="disabled" ${aiMode === "disabled" ? "selected" : ""}>Выключен</option>
            </select>
          </label>

          <label class="ep-admin-field">
            <span class="ep-admin-label">Баланс ИИ, ₽</span>
            <input class="ep-admin-input" type="number" step="0.01" min="0" value="${balance}" data-admin-ai-balance />
          </label>

          <div class="ep-admin-field ep-wide">
            <button class="ep-admin-button" type="submit">Сохранить пользователю</button>
            <div class="ep-admin-status" data-admin-status></div>
          </div>
        </div>
      </form>
    `;
  },

  filterUsers(query) {
    const q = String(query || "").trim().toLowerCase();
    if (!q) return this.users;
    return this.users.filter((user) => {
      return [user.displayName, user.name, user.email, user.uid].some((value) => String(value || "").toLowerCase().includes(q));
    });
  },

  renderUsers(list) {
    const root = document.querySelector("#admin-users-root");
    if (!root) return;
    root.innerHTML = list.length ? list.map((user) => this.userCard(user)).join("") : `<div class="card">Пользователи не найдены.</div>`;

    root.querySelectorAll("[data-admin-user-form]").forEach((form) => {
      form.addEventListener("submit", async (event) => {
        event.preventDefault();
        const status = form.querySelector("[data-admin-status]");
        status.textContent = "Сохраняю...";
        try {
          await this.saveUser(form.dataset.uid, form);
          status.textContent = "Сохранено.";
        } catch (error) {
          console.error(error);
          status.textContent = "Ошибка: " + (error.message || error);
        }
      });
    });
  },

  async createMyTest() {
    const auth = this.getAuth();
    const db = this.getDb();
    const user = auth?.currentUser;
    if (!db || !user) throw new Error("Нужно войти в аккаунт");
    const expiresAt = this.addDays(30);
    await db.collection("users").doc(user.uid).set({
      email: user.email,
      displayName: user.displayName || "Виталий Имуллин",
      role: "admin",
      approved: true,
      subscriptionPlan: "ai",
      subscriptionStatus: "active",
      subscriptionExpiresAt: expiresAt,
      subscription: { plan: "ai", title: "С ИИ", status: "active", expiresAt },
      aiMode: "server_balance",
      aiEnabled: true,
      aiBalanceRub: 1000,
      ai: { mode: "server_balance", enabled: true, balanceRub: 1000 },
      updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    }, { merge: true });
  },

  async render() {
    const root = document.querySelector("#admin-subscription-root");
    if (!root) return;

    const auth = this.getAuth();
    const db = this.getDb();

    if (!auth || !db) {
      root.innerHTML = `<div class="card"><h2>Админка</h2><p>Firebase ещё не подключён.</p></div>`;
      return;
    }

    const user = auth.currentUser;
    if (!user) {
      root.innerHTML = `<div class="card"><h2>Админка</h2><p>Нужно войти в аккаунт.</p><button class="ep-admin-button" data-route="login">Перейти ко входу</button></div>`;
      return;
    }

    const profile = await this.getMyProfile(user);
    if (!this.isAdmin(user, profile)) {
      root.innerHTML = `<div class="card"><h2>Админка</h2><p>Доступ только для администратора.</p></div>`;
      return;
    }

    root.innerHTML = `
      <div class="ep-admin-page">
        <section class="card ep-admin-hero">
          <h1>Админ-панель</h1>
          <p class="ep-admin-note">Управление подпиской, ИИ-режимом и балансом мастеров. Данные пишутся в Firestore: users/{uid}.</p>
          <div class="ep-admin-toolbar">
            <button class="ep-admin-button" type="button" id="admin-refresh-users">Обновить</button>
            <button class="ep-admin-button-secondary" type="button" id="admin-create-my-test">Создать/обновить мой тест</button>
          </div>
        </section>
        <section class="card">
          <input class="ep-admin-search" id="admin-user-search" placeholder="Поиск по имени, email или UID" />
        </section>
        <section id="admin-users-root" class="ep-admin-list">
          <div class="card">Загружаю мастеров...</div>
        </section>
      </div>
    `;

    const reload = async () => {
      const listRoot = document.querySelector("#admin-users-root");
      if (listRoot) listRoot.innerHTML = `<div class="card">Загружаю мастеров...</div>`;
      this.users = await this.loadUsers();
      this.renderUsers(this.users);
    };

    document.querySelector("#admin-refresh-users")?.addEventListener("click", reload);
    document.querySelector("#admin-create-my-test")?.addEventListener("click", async () => {
      await this.createMyTest();
      await reload();
    });
    document.querySelector("#admin-user-search")?.addEventListener("input", (event) => {
      this.renderUsers(this.filterUsers(event.target.value));
    });

    await reload();
  },

  init() {
    window.addEventListener("ep:route-loaded", (event) => {
      if (event.detail?.route === "admin") this.render();
    });
  }
};

EP.AdminSubscription.init();
