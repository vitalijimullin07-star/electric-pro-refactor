(() => {
  "use strict";

  const Admin = window.EP?.Admin;
  if (!Admin) return;

  Admin.Security = {
    renderList() {
      const el = Admin.$("#ep-admin-security-list");
      if (!el) return;
      const users = Admin.state.users
        .map((u) => ({ uid: u.uid || u.id, email: u.email || "", policy: u.securityPolicy || {}, status: u.status || "" }))
        .filter((u) => u.policy.blocked || u.policy.aiBlocked || u.policy.reviewRequired || u.status === "blocked");

      if (!users.length) {
        el.innerHTML = "<div class='ep-admin-placeholder'>Проблем безопасности сейчас не найдено.</div>";
        return;
      }

      el.innerHTML = users.map((u) => `
        <div class="ep-admin-log">
          <b>${Admin.escape(u.email || u.uid)}</b>
          <div class="ep-admin-small">
            blocked: ${u.policy.blocked ? "да" : "нет"} ·
            aiBlocked: ${u.policy.aiBlocked ? "да" : "нет"} ·
            reviewRequired: ${u.policy.reviewRequired ? "да" : "нет"}
          </div>
          <div class="ep-admin-small">${Admin.escape(u.policy.blockReason || "")}</div>
        </div>
      `).join("");
    },

    async setBlocked(uid, blocked) {
      try {
        const reason = Admin.$("#adm-block-reason")?.value || (blocked ? "Заблокирован администратором" : "");
        const policy = {
          blocked,
          blockReason: blocked ? reason : "",
          aiBlocked: blocked,
          cacheDisabled: blocked,
          onlineOnly: blocked,
          reviewRequired: blocked
        };

        await Admin.updateUserDoc(uid, {
          status: blocked ? "blocked" : "active",
          securityPolicy: policy
        }, blocked ? "block_user" : "unblock_user");

        await Admin.state.db.collection(Admin.collections.securityEvents).add({
          uid,
          type: blocked ? "user_blocked" : "user_unblocked",
          reason,
          createdAt: Admin.now(),
          createdBy: Admin.state.currentUser?.uid || "",
          source: "ep-admin-v29.30"
        });

        await Admin.reloadAll();
        Admin.Users.renderDetails(uid);
      } catch (error) {
        Admin.showFirestoreError("security update", error);
      }
    }
  };
})();