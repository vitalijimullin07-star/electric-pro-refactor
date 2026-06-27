/* Electric Pro V29 — Страж доступа.
   Если тест/подписка истекли (или аккаунт закрыт) и это не админ — доступ ко всему приложению
   блокируется: пользователя перебрасывает на «Подписку» с баннером. Админ не блокируется. */
(() => {
  "use strict";
  const FREE = ["login", "subscription"]; // всегда доступны

  function normDate(v) {
    if (!v) return null;
    if (typeof v === "object") {
      if (typeof v.toDate === "function") { try { return v.toDate(); } catch (e) {} }
      if (typeof v.seconds === "number") return new Date(v.seconds * 1000);
    }
    const d = new Date(v); return isNaN(d.getTime()) ? null : d;
  }
  function profile() { return (window.EP && EP.state && EP.state.profile) || null; }
  function isAdmin(p) { return !!(p && (p.isAdmin === true || p.role === "admin")); }
  function blockedProfile(p) { return !!(p && (p.blocked === true || ["blocked", "blocked_review", "deleted"].indexOf(p.status) >= 0)); }
  function expiryDate(p) { return normDate(p.subscriptionExpiresAt || p.trialEndsAt || p.subscriptionUntil || p.expiresAt || (p.subscription && p.subscription.expiresAt)); }
  function subActive(p) {
    const exp = expiryDate(p);
    if (exp) return exp.getTime() > Date.now();
    const plan = p.subscriptionPlan || p.plan || (p.subscription && p.subscription.plan) || "none";
    const ss = p.subscriptionStatus || (p.subscription && p.subscription.status);
    return plan !== "none" && ss === "active";
  }
  function accessOk() {
    const p = profile();
    if (!p) return true;            // не залогинен — этим занимается auth (экран входа)
    if (isAdmin(p)) return true;
    if (blockedProfile(p)) return false;
    return subActive(p);
  }
  function daysLeft(p) { const e = expiryDate(p); return e ? Math.max(0, Math.ceil((e.getTime() - Date.now()) / 86400000)) : 0; }

  function showBanner() {
    const sec = document.querySelector("#ep-app .page, .page"); if (!sec) return;
    if (document.getElementById("ep-blocked-banner")) return;
    const b = document.createElement("div");
    b.id = "ep-blocked-banner"; b.className = "ep-blocked";
    b.innerHTML =
      '<div class="ep-blocked-i">⛔</div>' +
      '<div class="ep-blocked-t">Доступ закрыт</div>' +
      '<div class="ep-blocked-s">Тест или подписка истекли — работа в приложении приостановлена. Продлите доступ, чтобы продолжить.</div>' +
      '<div class="ep-blocked-actions"><button type="button" class="btn btn-ghost ep-clickable" id="ep-blocked-logout">Выйти</button></div>';
    sec.insertBefore(b, sec.firstChild);
    const lo = document.getElementById("ep-blocked-logout");
    if (lo) lo.addEventListener("click", () => { try { if (window.EP && EP.Auth && EP.Auth.signOut) EP.Auth.signOut(); } catch (e) {} });
  }

  let busy = false;
  function enforce(route) {
    route = route || (window.EP && EP.state && EP.state.currentRoute) || "";
    const p = profile();
    if (!p) return;                                  // нет профиля — не вмешиваемся
    const ok = accessOk();
    if (route === "subscription") { if (!ok && !isAdmin(p)) showBanner(); return; }
    if (FREE.indexOf(route) >= 0) return;            // login — свободно
    if (ok) return;
    if (busy) return; busy = true;                   // блокируем доступ → на подписку
    try { if (window.EP && EP.Router && EP.Router.go) EP.Router.go("subscription", { replace: true }); } catch (e) {}
    setTimeout(() => { busy = false; }, 60);
  }

  window.EP = window.EP || {};
  EP.AccessGuard = { accessOk: accessOk, enforce: enforce, daysLeft: function () { const p = profile(); return p ? daysLeft(p) : 0; } };

  window.addEventListener("ep:route-loaded", (e) => enforce(e && e.detail && e.detail.route));
  window.addEventListener("ep:auth-changed", () => setTimeout(() => enforce(), 0));
  document.addEventListener("visibilitychange", () => { if (!document.hidden) enforce(); });
  setInterval(() => enforce(), 60000);
})();
