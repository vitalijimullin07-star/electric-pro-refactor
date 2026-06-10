(() => {
  "use strict";

  const Admin = window.EP?.Admin;
  if (!Admin) return;

  Admin.Subscriptions = {
    planName(planId) {
      return {
        none: "Без подписки",
        basic: "Базовая",
        ai: "С ИИ",
        test_2_days: "Тест 2 дня"
      }[planId] || planId || "Без подписки";
    },

    statusForPlan(planId) {
      return planId === "none" ? "inactive" : "active";
    },

    renderPlans() {
      const el = Admin.$("#ep-admin-subscription-plans");
      if (!el) return;

      const plans = Admin.state.plans.length ? Admin.state.plans : [
        { id: "basic", name: "Базовая", description: "База, смета, поставщику, черновик. Без ИИ." },
        { id: "ai", name: "С ИИ", description: "Все функции, ИИ при положительном балансе." },
        { id: "test_2_days", name: "Тест 2 дня", description: "Пробный доступ на 2 дня." }
      ];

      el.innerHTML = plans.map((p) => `
        <div class="ep-admin-log">
          <b>${Admin.escape(p.name || p.planName || p.id)}</b>
          <div class="ep-admin-small">${Admin.escape(p.description || p.status || "")}</div>
        </div>
      `).join("");
    },

    payloadFromForm(uid) {
      const planId = Admin.$("#adm-plan")?.value || "none";
      const expiresAt = Admin.fromDateInput(Admin.$("#adm-expires")?.value);
      return {
        uid,
        planId,
        planName: this.planName(planId),
        status: this.statusForPlan(planId),
        startsAt: Admin.state.subscriptions.get(uid)?.startsAt || Admin.now(),
        expiresAt: planId === "none" ? null : expiresAt,
        updatedAt: Admin.now(),
        updatedBy: Admin.state.currentUser?.uid || "",
        adminComment: Admin.$("#adm-comment")?.value || ""
      };
    },

    async save(uid) {
      try {
        const payload = this.payloadFromForm(uid);
        await Admin.state.db.collection(Admin.collections.subscriptions).doc(uid).set(payload, { merge: true });

        await Admin.updateUserDoc(uid, {
          subscriptionPlan: payload.planId,
          subscriptionPlanName: payload.planName,
          subscriptionStatus: payload.status,
          subscriptionExpiresAt: payload.expiresAt,
          planId: payload.planId,
          planName: payload.planName
        }, "update_subscription_user_compat");

        await Admin.writeAdminLog({ action: "update_subscription", targetUid: uid, newValue: payload });
        await Admin.reloadAll();
        Admin.Users.renderDetails(uid);
      } catch (error) {
        Admin.showFirestoreError("save subscription", error);
      }
    },

    async saveDefault(uid) {
      const payload = {
        uid,
        planId: "none",
        planName: "Без подписки",
        status: "inactive",
        startsAt: null,
        expiresAt: null,
        updatedAt: Admin.now(),
        updatedBy: Admin.state.currentUser?.uid || "",
        adminComment: "Создано автоматически при активации мастера"
      };
      await Admin.state.db.collection(Admin.collections.subscriptions).doc(uid).set(payload, { merge: true });
    }
  };
})();