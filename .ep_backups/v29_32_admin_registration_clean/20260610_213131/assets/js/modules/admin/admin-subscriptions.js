(() => {
  "use strict";

  const Admin = window.EP?.Admin;
  if (!Admin) return;

  Admin.Subscriptions = {
    planName(planId) {
      return {
        basic: "Базовая",
        ai: "С ИИ",
        test_2_days: "Тест 2 дня"
      }[planId] || planId || "—";
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

    async save(uid) {
      try {
        const planId = Admin.$("#adm-plan")?.value || "basic";
        const expiresAt = Admin.fromDateInput(Admin.$("#adm-expires")?.value);
        const payload = {
          uid,
          planId,
          planName: this.planName(planId),
          status: "active",
          startsAt: Admin.state.subscriptions.get(uid)?.startsAt || Admin.now(),
          expiresAt,
          updatedAt: Admin.now(),
          updatedBy: Admin.state.currentUser?.uid || "",
          adminComment: Admin.$("#adm-comment")?.value || ""
        };

        await Admin.state.db.collection(Admin.collections.subscriptions).doc(uid).set(payload, { merge: true });
        await Admin.writeAdminLog({ action: "update_subscription", targetUid: uid, newValue: payload });
        await Admin.reloadAll();
        Admin.Users.renderDetails(uid);
      } catch (error) {
        Admin.showFirestoreError("save subscription", error);
      }
    }
  };
})();