(() => {
  "use strict";

  const Admin = window.EP?.Admin;
  if (!Admin) return;

  Admin.Logs = {
    shortJson(value) {
      try {
        const s = JSON.stringify(value || {});
        return s.length > 220 ? s.slice(0, 220) + "..." : s;
      } catch (_) {
        return "";
      }
    },

    render() {
      const adminEl = Admin.$("#ep-admin-logs-admin");
      const errorEl = Admin.$("#ep-admin-logs-errors");

      if (adminEl) {
        const logs = Admin.state.logs.slice().reverse().slice(0, 50);
        adminEl.innerHTML = logs.length ? logs.map((l) => `
          <div class="ep-admin-log">
            <b>${Admin.escape(l.action || l.type || "admin_action")}</b>
            <div class="ep-admin-small">Кому: ${Admin.escape(l.targetUid || "")}</div>
            <div class="ep-admin-small">Кто: ${Admin.escape(l.actorEmail || l.actorUid || "")}</div>
            <div class="ep-admin-small">${Admin.escape(l.createdAt || "")}</div>
          </div>
        `).join("") : "<div class='ep-admin-placeholder'>Журнал действий пуст.</div>";
      }

      if (errorEl) {
        const errors = Admin.state.errors.slice().reverse().slice(0, 50);
        errorEl.innerHTML = errors.length ? errors.map((e) => `
          <div class="ep-admin-log">
            <b>${Admin.escape(e.type || e.code || "error")}</b>
            <div class="ep-admin-small">${Admin.escape(e.message || e.text || "")}</div>
            <div class="ep-admin-small">${Admin.escape(e.createdAt || e.time || "")}</div>
          </div>
        `).join("") : "<div class='ep-admin-placeholder'>Ошибок не найдено.</div>";
      }
    }
  };
})();