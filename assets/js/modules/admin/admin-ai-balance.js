(() => {
  "use strict";

  const Admin = window.EP?.Admin;
  if (!Admin) return;

  Admin.AiBalance = {
    renderList() {
      const el = Admin.$("#ep-admin-ai-list");
      if (!el) return;
      const items = Array.from(Admin.state.aiAccounts.values());
      if (!items.length) {
        el.innerHTML = "<div class='ep-admin-placeholder'>ИИ-аккаунты пока не найдены.</div>";
        return;
      }
      el.innerHTML = items.map((a) => `
        <div class="ep-admin-log">
          <b>${Admin.escape(a.uid || a.id)}</b>
          <div class="ep-admin-small">Режим: ${Admin.escape(a.aiMode || a.accessMode || "disabled")} · Баланс: ${Admin.escape(a.balanceRub ?? 0)} ₽ · ИИ: ${a.allowAi ? "вкл" : "выкл"}</div>
        </div>
      `).join("");
    },

    payloadFromForm(uid) {
      const aiMode = Admin.$("#adm-ai-mode")?.value || "disabled";
      const allowAi = aiMode !== "disabled" && Admin.$("#adm-allow-ai")?.value === "true";
      const balanceRub = Number(Admin.$("#adm-ai-balance")?.value || 0);
      return {
        uid,
        allowAi,
        aiMode,
        accessMode: aiMode === "user_api" ? "own_api" : aiMode,
        balanceRub,
        spentRub: Number(Admin.state.aiAccounts.get(uid)?.spentRub || 0),
        limitRub: Number(Admin.state.aiAccounts.get(uid)?.limitRub || 0),
        provider: Admin.state.aiAccounts.get(uid)?.provider || "mixed",
        updatedAt: Admin.now(),
        updatedBy: Admin.state.currentUser?.uid || ""
      };
    },

    async save(uid) {
      try {
        const payload = this.payloadFromForm(uid);
        await Admin.state.db.collection(Admin.collections.ai).doc(uid).set(payload, { merge: true });

        await Admin.updateUserDoc(uid, {
          aiEnabled: payload.allowAi,
          aiMode: payload.aiMode,
          aiBalanceRub: payload.balanceRub,
          aiAccessMode: payload.accessMode
        }, "update_ai_user_compat");

        await Admin.writeAdminLog({ action: "update_ai_balance", targetUid: uid, newValue: {
          allowAi: payload.allowAi,
          aiMode: payload.aiMode,
          balanceRub: payload.balanceRub,
          provider: payload.provider
        }});
        await Admin.reloadAll();
        Admin.Users.renderDetails(uid);
      } catch (error) {
        Admin.showFirestoreError("save ai", error);
      }
    },

    async saveDefault(uid) {
      const payload = {
        uid,
        allowAi: false,
        aiMode: "disabled",
        accessMode: "disabled",
        balanceRub: 0,
        spentRub: 0,
        limitRub: 0,
        provider: "mixed",
        updatedAt: Admin.now(),
        updatedBy: Admin.state.currentUser?.uid || "",
        createdReason: "auto_default"
      };
      await Admin.state.db.collection(Admin.collections.ai).doc(uid).set(payload, { merge: true });
    }
  };
})();