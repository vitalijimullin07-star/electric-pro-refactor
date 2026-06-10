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
      return {
        uid,
        email: user.email || user.mail || "",
        name: user.name || user.displayName || user.fullName || "",
        role: user.role || (user.isAdmin ? "admin" : "master"),
        status: user.status || (policy.blocked ? "blocked" : "active"),
        lastLoginAt: user.lastLoginAt || user.lastSeenAt || "",
        planName: sub.planName || sub.planId || "—",
        expiresAt: sub.expiresAt || "",
        balanceRub: ai.balanceRub ?? 0,
        allowAi: ai.allowAi === true,
        policy
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
      const activeSubs = users.filter((u) => u.planName && u.planName !== "—").length;
      const emptySubs = users.length - activeSubs;
      const blocked = users.filter((u) => u.status === "blocked" || u.policy?.blocked).length;
      const aiCount = users.filter((u) => u.allowAi).length;

      const set = (id, value) => { const el = Admin.$(id); if (el) el.textContent = value; };
      set("#ep-admin-count-users", users.length);
      set("#ep-admin-count-active", activeSubs);
      set("#ep-admin-count-empty", emptySubs);
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
          <div class="ep-admin-field"><label>Статус</label>
            <select id="adm-status">
              ${["active", "blocked", "pending", "deleted"].map((x) => `<option value="${x}" ${u.status === x ? "selected" : ""}>${x}</option>`).join("")}
            </select>
          </div>

          <div class="ep-admin-field"><label>Тариф</label>
            <select id="adm-plan">
              ${["basic|Базовая", "ai|С ИИ", "test_2_days|Тест 2 дня"].map((pair) => {
                const [id, name] = pair.split("|");
                return `<option value="${id}" ${(sub.planId || "") === id ? "selected" : ""}>${name}</option>`;
              }).join("")}
            </select>
          </div>
          <div class="ep-admin-field"><label>Окончание подписки</label><input id="adm-expires" type="date" value="${Admin.toDateInput(sub.expiresAt)}"></div>

          <div class="ep-admin-field"><label>ИИ-режим</label>
            <select id="adm-ai-mode">
              ${["admin_api", "user_api", "disabled"].map((x) => `<option value="${x}" ${(ai.aiMode || "disabled") === x ? "selected" : ""}>${x}</option>`).join("")}
            </select>
          </div>
          <div class="ep-admin-field"><label>ИИ-баланс, ₽</label><input id="adm-ai-balance" type="number" step="0.01" value="${Admin.escape(ai.balanceRub ?? 0)}"></div>

          <div class="ep-admin-field"><label>ИИ включён</label>
            <select id="adm-allow-ai"><option value="true" ${ai.allowAi === true ? "selected" : ""}>Да</option><option value="false" ${ai.allowAi !== true ? "selected" : ""}>Нет</option></select>
          </div>
          <div class="ep-admin-field"><label>Аккаунт заблокирован</label>
            <select id="adm-blocked"><option value="false" ${!policy.blocked ? "selected" : ""}>Нет</option><option value="true" ${policy.blocked ? "selected" : ""}>Да</option></select>
          </div>

          <div class="ep-admin-field"><label>Причина блокировки</label><input id="adm-block-reason" value="${Admin.escape(policy.blockReason || "")}"></div>
          <div class="ep-admin-field"><label>Комментарий админа</label><input id="adm-comment" value="${Admin.escape(raw.adminComment || sub.adminComment || "")}"></div>
        </div>

        <div class="ep-admin-actions">
          <button id="adm-save-user">Сохранить пользователя</button>
          <button id="adm-save-sub">Сохранить подписку</button>
          <button id="adm-save-ai">Сохранить ИИ-баланс</button>
          <button id="adm-block-user" class="ep-admin-danger">Заблокировать</button>
          <button id="adm-unblock-user">Разблокировать</button>
        </div>
      `;

      Admin.$("#adm-save-user")?.addEventListener("click", () => this.saveUser(uid));
      Admin.$("#adm-save-sub")?.addEventListener("click", () => Admin.Subscriptions.save(uid));
      Admin.$("#adm-save-ai")?.addEventListener("click", () => Admin.AiBalance.save(uid));
      Admin.$("#adm-block-user")?.addEventListener("click", () => Admin.Security.setBlocked(uid, true));
      Admin.$("#adm-unblock-user")?.addEventListener("click", () => Admin.Security.setBlocked(uid, false));
    },

    async saveUser(uid) {
      try {
        await Admin.updateUserDoc(uid, {
          name: Admin.$("#adm-name")?.value || "",
          displayName: Admin.$("#adm-name")?.value || "",
          role: Admin.$("#adm-role")?.value || "master",
          status: Admin.$("#adm-status")?.value || "active",
          adminComment: Admin.$("#adm-comment")?.value || ""
        }, "update_user");
        await Admin.reloadAll();
        this.renderDetails(uid);
      } catch (error) {
        Admin.showFirestoreError("save user", error);
      }
    }
  };
})();