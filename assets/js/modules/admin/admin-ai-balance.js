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
          <div class="ep-admin-small">Режим: ${Admin.escape(a.aiMode || "disabled")} · Баланс: ${Admin.escape(a.balanceRub ?? 0)} ₽ · ИИ: ${a.allowAi ? "вкл" : "выкл"}</div>
        </div>
      `).join("");
    },

    async save(uid) {
      try {
        const payload = {
          uid,
          allowAi: Admin.$("#adm-allow-ai")?.value === "true",
          aiMode: Admin.$("#adm-ai-mode")?.value || "disabled",
          balanceRub: Number(Admin.$("#adm-ai-balance")?.value || 0),
          updatedAt: Admin.now(),
          updatedBy: Admin.state.currentUser?.uid || ""
        };

        if (payload.aiMode === "disabled") payload.allowAi = false;

        await Admin.state.db.collection(Admin.collections.ai).doc(uid).set(payload, { merge: true });
        await Admin.writeAdminLog({ action: "update_ai_balance", targetUid: uid, newValue: payload });
        await Admin.reloadAll();
        Admin.Users.renderDetails(uid);
      } catch (error) {
        Admin.showFirestoreError("save ai", error);
      }
    }
  };
})();