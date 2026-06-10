(() => {
  "use strict";

  const Admin = window.EP?.Admin;
  if (!Admin) return;

  Admin.Users = {
    normalize(user) {
      const uid = user.uid || user.id || "";
      const sub = Admin.state.subscriptions.get(uid) || {};
      const ai = Admin.state.aiAccounts.get(uid) || {};
      const policy = user.securityPolicy || {};
      const approved = user.approved === true || user.isApproved === true || user.status === "approved" || user.accessStatus === "approved";
      const blocked = policy.blocked === true || user.status === "blocked";
      return {
        uid,
        email: user.email || user.mail || "",
        name: user.name || user.displayName || user.fullName || "",
        role: user.role || (user.isAdmin ? "admin" : "master"),
        status: blocked ? "blocked" : (approved ? "approved" : (user.status || "pending")),
        accessStatus: user.accessStatus || "",
        lastLoginAt: user.lastLoginAt || user.lastSeenAt || "",
        planName: sub.planName || user.subscriptionPlanName || user.planName || sub.planId || user.subscriptionPlan || "—",
        expiresAt: sub.expiresAt || user.subscriptionExpiresAt || "",
        balanceRub: ai.balanceRub ?? user.aiBalanceRub ?? 0,
        allowAi: ai.allowAi === true || user.aiEnabled === true,
        policy,
        approved,
        blocked
      };
    },

    filteredUsers() {
      const q = (Admin.$("#ep-admin-user-search")?.value || "").trim().toLowerCase();
      const list = Admin.state.users.map((u) => this.normalize(u));
      if (!q) return list;
      return list.filter((u) => [u.uid, u.email, u.name, u.role, u.status, u.planName]
        .join(" ")
        .toLowerCase()
        .includes(q));
    },

    renderList() {
      const el = Admin.$("#ep-admin-users-list");
      if (!el) return;
      const users = this.filteredUsers();

      if (!users.length) {
        el.innerHTML = "<div class='ep-admin-placeholder'>Пользователи не найдены.</div>";
        return;
      }

      el.innerHTML = users.map((u) => `
        <div class="ep-admin-user-row ${Admin.state.selectedUid === u.uid ? "active" : ""}" data-uid="${Admin.escape(u.uid)}">
          <b>${Admin.escape(u.email || u.uid)}</b>
          <span>${Admin.escape(u.name || "Без имени")} · ${Admin.escape(u.role)} · ${Admin.escape(u.status)}</span>
          <span>Тариф: ${Admin.escape(u.planName)} · ИИ: ${u.allowAi ? "вкл" : "выкл"} · Баланс: ${Admin.escape(u.balanceRub)} ₽</span>
          <i class="ep-admin-badge ${Admin.escape(u.status)}">${Admin.escape(u.status)}</i>
        </div>
      `).join("");

      Admin.$$(".ep-admin-user-row", el).forEach((row) => {
        row.addEventListener("click", () => {
          Admin.state.selectedUid = row.dataset.uid;
          this.renderList();
          this.renderDetails(Admin.state.selectedUid);
        });
      });
    },

    renderCounters() {
      const users = Admin.state.users.map((u) => this.normalize(u));
      const activeSubs = users.filter((u) => u.planName && u.planName !== "—" && u.planName !== "none" && u.planName !== "Без подписки").length;
      const pending = users.filter((u) => !u.approved && !u.blocked).length;
      const blocked = users.filter((u) => u.blocked).length;
      const aiCount = users.filter((u) => u.allowAi).length;

      const set = (id, value) => { const el = Admin.$(id); if (el) el.textContent = value; };
      set("#ep-admin-count-users", users.length);
      set("#ep-admin-count-pending", pending);
      set("#ep-admin-count-active", activeSubs);
      set("#ep-admin-count-blocked", blocked);
      set("#ep-admin-count-ai", aiCount);
    },

    renderDetails(uid) {
      const raw = Admin.state.users.find((u) => (u.uid || u.id) === uid);
      if (!raw) return;
      const u = this.normalize(raw);
      const sub = Admin.state.subscriptions.get(uid) || {};
      const ai = Admin.state.aiAccounts.get(uid) || {};
      const policy = raw.securityPolicy || {};
      const el = Admin.$("#ep-admin-user-details");
      if (!el) return;

      const planId = sub.planId || raw.subscriptionPlan || "none";
      const aiMode = ai.aiMode || raw.aiMode || "disabled";

      el.innerHTML = `
        <h2>Карточка пользователя</h2>
        <div class="ep-admin-small">UID: ${Admin.escape(uid)}</div>

        <div class="ep-admin-form">
          <div class="ep-admin-field"><label>Email</label><input id="adm-email" value="${Admin.escape(u.email)}" readonly></div>
          <div class="ep-admin-field"><label>Имя</label><input id="adm-name" value="${Admin.escape(u.name)}"></div>

          <div class="ep-admin-field"><label>Роль</label>
            <select id="adm-role">
              ${["master", "admin", "user"].map((x) => `<option value="${x}" ${u.role === x ? "selected" : ""}>${x}</option>`).join("")}
            </select>
          </div>

          <div class="ep-admin-field"><label>Статус входа</label>
            <select id="adm-status">
              ${["pending", "approved", "blocked", "deleted"].map((x) => `<option value="${x}" ${u.status === x ? "selected" : ""}>${x}</option>`).join("")}
            </select>
          </div>

          <div class="ep-admin-field"><label>Тариф</label>
            <select id="adm-plan">
              ${["none|Без подписки", "basic|Базовая", "ai|С ИИ", "test_2_days|Тест 2 дня"].map((pair) => {
                const [id, name] = pair.split("|");
                return `<option value="${id}" ${planId === id ? "selected" : ""}>${name}</option>`;
              }).join("")}
            </select>
          </div>

          <div class="ep-admin-field"><label>Окончание подписки</label><input id="adm-expires" type="date" value="${Admin.toDateInput(sub.expiresAt || raw.subscriptionExpiresAt)}"></div>

          <div class="ep-admin-field"><label>ИИ-режим</label>
            <select id="adm-ai-mode">
              ${["admin_api", "user_api", "disabled"].map((x) => `<option value="${x}" ${aiMode === x ? "selected" : ""}>${x}</option>`).join("")}
            </select>
          </div>

          <div class="ep-admin-field"><label>ИИ-баланс, ₽</label><input id="adm-ai-balance" type="number" step="0.01" value="${Admin.escape(ai.balanceRub ?? raw.aiBalanceRub ?? 0)}"></div>

          <div class="ep-admin-field"><label>ИИ включён</label>
            <select id="adm-allow-ai"><option value="true" ${ai.allowAi === true || raw.aiEnabled === true ? "selected" : ""}>Да</option><option value="false" ${ai.allowAi !== true && raw.aiEnabled !== true ? "selected" : ""}>Нет</option></select>
          </div>

          <div class="ep-admin-field"><label>Аккаунт заблокирован</label>
            <select id="adm-blocked"><option value="false" ${!policy.blocked && u.status !== "blocked" ? "selected" : ""}>Нет</option><option value="true" ${policy.blocked || u.status === "blocked" ? "selected" : ""}>Да</option></select>
          </div>

          <div class="ep-admin-field"><label>Причина блокировки</label><input id="adm-block-reason" value="${Admin.escape(policy.blockReason || "")}"></div>
          <div class="ep-admin-field"><label>Комментарий админа</label><input id="adm-comment" value="${Admin.escape(raw.adminComment || sub.adminComment || "")}"></div>
        </div>

        <div class="ep-admin-actions">
          <button id="adm-activate-user" type="button">Активировать мастера</button>
          <button id="adm-save-user" type="button">Сохранить пользователя</button>
          <button id="adm-save-sub" type="button">Сохранить подписку</button>
          <button id="adm-save-ai" type="button">Сохранить ИИ-баланс</button>
          <button id="adm-block-user" class="ep-admin-danger" type="button">Заблокировать</button>
          <button id="adm-unblock-user" type="button">Разблокировать</button>
        </div>
      `;

      Admin.$("#adm-activate-user")?.addEventListener("click", () => this.activateMaster(uid));
      Admin.$("#adm-save-user")?.addEventListener("click", () => this.saveUser(uid));
      Admin.$("#adm-save-sub")?.addEventListener("click", () => Admin.Subscriptions.save(uid));
      Admin.$("#adm-save-ai")?.addEventListener("click", () => Admin.AiBalance.save(uid));
      Admin.$("#adm-block-user")?.addEventListener("click", () => Admin.Security.setBlocked(uid, true));
      Admin.$("#adm-unblock-user")?.addEventListener("click", () => Admin.Security.setBlocked(uid, false));
    },

    userPayloadFromForm(extra = {}) {
      const status = Admin.$("#adm-status")?.value || "pending";
      const blockedByForm = Admin.$("#adm-blocked")?.value === "true";
      const approved = status === "approved";
      const blocked = status === "blocked" || blockedByForm;

      return {
        name: Admin.$("#adm-name")?.value || "",
        displayName: Admin.$("#adm-name")?.value || "",
        role: Admin.$("#adm-role")?.value || "master",
        status: blocked ? "blocked" : status,
        accessStatus: approved ? "approved" : (blocked ? "blocked" : "pending"),
        approved: approved && !blocked,
        isApproved: approved && !blocked,
        adminComment: Admin.$("#adm-comment")?.value || "",
        securityPolicy: {
          blocked,
          blockReason: blocked ? (Admin.$("#adm-block-reason")?.value || "Заблокирован администратором") : "",
          aiBlocked: blocked,
          cacheDisabled: blocked,
          onlineOnly: blocked,
          reviewRequired: blocked
        },
        ...extra
      };
    },

    async saveUser(uid) {
      try {
        const payload = this.userPayloadFromForm();
        await Admin.updateUserDoc(uid, payload, "update_user");
        await Admin.reloadAll();
        this.renderDetails(uid);
      } catch (error) {
        Admin.showFirestoreError("save user", error);
      }
    },

    async activateMaster(uid) {
      try {
        const name = Admin.$("#adm-name")?.value || "";
        const payload = {
          name,
          displayName: name,
          role: Admin.$("#adm-role")?.value || "master",
          status: "approved",
          accessStatus: "approved",
          approved: true,
          isApproved: true,
          adminComment: Admin.$("#adm-comment")?.value || "",
          securityPolicy: {
            blocked: false,
            blockReason: "",
            aiBlocked: false,
            cacheDisabled: false,
            onlineOnly: false,
            reviewRequired: false
          }
        };

        await Admin.updateUserDoc(uid, payload, "activate_master");

        if (!Admin.state.subscriptions.get(uid)) {
          await Admin.Subscriptions.saveDefault(uid);
        }
        if (!Admin.state.aiAccounts.get(uid)) {
          await Admin.AiBalance.saveDefault(uid);
        }

        await Admin.reloadAll();
        this.renderDetails(uid);
      } catch (error) {
        Admin.showFirestoreError("activate master", error);
      }
    }
  };
})();