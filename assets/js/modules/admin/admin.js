/* ============================================================
   Electric Pro V29 — Админка (АДАПТИРОВАНО ПО ПРАВИЛАМ)
   UI взят из версии GPT, слой данных переписан:
   - запись доступа ТОЛЬКО через Cloud Functions adminSetUserAccess
     (прямую запись в users/{uid} правила запрещают);
   - список — через adminListUsers; логи/события — прямым чтением
     admin_logs / security_events (админу чтение разрешено правилами);
   - монтаж ТОЛЬКО по ep:route-loaded(route=admin), без MutationObserver
     и без самозагрузки pages/admin.html (роутер сам грузит страницу).
   ============================================================ */
(() => {
  "use strict";
  window.EP = window.EP || {};
  const OWNER = "vits0007@gmail.com";

  const A = {
    users: [], selectedUid: null, loaded: false, busy: false, mounted: false
  };
  const $ = (sel, root) => (root || document).querySelector(sel);
  const esc = (s) => String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  function me() { try { return (EP.Auth && EP.Auth.currentUser && EP.Auth.currentUser()) || (EP.state && EP.state.user) || {}; } catch (e) { return {}; } }
  function isAdmin() {
    try {
      if (EP.Auth && EP.Auth.isAdmin && EP.Auth.isAdmin()) return true;
      const u = me(); if (u && u.email === OWNER) return true;
      const p = (EP.state && EP.state.profile) || {};
      return p.role === "admin" && p.accessStatus !== "blocked";
    } catch (e) { return false; }
  }
  function fns() {
    try { if (typeof firebase !== "undefined" && firebase.functions) return firebase.functions(); } catch (e) {}
    return null;
  }
  function db() { try { return (EP.Firebase && EP.Firebase.db) || null; } catch (e) { return null; } }

  async function call(name, payload) {
    const f = fns(); if (!f) throw new Error("functions-unavailable");
    const res = await f.httpsCallable(name)(payload || {});
    return res && res.data;
  }

  // ---- загрузка пользователей через Cloud Function ----
  async function loadUsers() {
    setStatus("Загрузка пользователей…");
    try {
      const data = await call("adminListUsers", {});
      A.users = (data && data.users) || [];
      A.loaded = true;
      setStatus("Пользователей: " + A.users.length);
      renderDashboard(); renderList();
      if (A.selectedUid) renderDetails(A.selectedUid);
    } catch (e) {
      A.loaded = false;
      const code = e && (e.code || e.message);
      if (String(code).indexOf("permission-denied") >= 0) setStatus("Нет прав администратора.");
      else if (String(code).indexOf("unavailable") >= 0 || String(code).indexOf("internal") >= 0) setStatus("Облачные функции недоступны (проверь деплой/регион).");
      else setStatus("Ошибка загрузки: " + code);
      const list = $("#ep-admin-users-list"); if (list) list.innerHTML = "<div class='ep-admin-placeholder'>Не удалось загрузить. " + esc(code) + "</div>";
    }
  }

  function setStatus(msg) { const el = $("#ep-admin-status"); if (el) el.textContent = msg; }

  function countActive(u) { const s = u.subscription || {}; return u.accessStatus === "approved" && s.active && s.plan && s.plan !== "none"; }
  function renderDashboard() {
    const set = (id, v) => { const el = $(id); if (el) el.textContent = v; };
    set("#ep-admin-count-users", A.users.length);
    set("#ep-admin-count-pending", A.users.filter((u) => u.accessStatus === "pending").length);
    set("#ep-admin-count-active", A.users.filter(countActive).length);
    set("#ep-admin-count-blocked", A.users.filter((u) => u.accessStatus === "blocked").length);
    set("#ep-admin-count-ai", A.users.filter((u) => (u.ai || {}).enabled).length);
  }

  function filtered() {
    const q = ($("#ep-admin-user-search") && $("#ep-admin-user-search").value || "").trim().toLowerCase();
    if (!q) return A.users;
    return A.users.filter((u) => [u.uid, u.email, u.displayName, u.role, u.accessStatus, (u.subscription || {}).plan]
      .some((x) => String(x || "").toLowerCase().indexOf(q) >= 0));
  }

  function renderList() {
    const el = $("#ep-admin-users-list"); if (!el) return;
    const users = filtered();
    if (!users.length) { el.innerHTML = "<div class='ep-admin-placeholder'>Пользователи не найдены.</div>"; return; }
    el.innerHTML = users.map((u) => {
      const s = u.subscription || {}, ai = u.ai || {};
      return `<div class="ep-admin-user-row ${A.selectedUid === u.uid ? "active" : ""}" data-uid="${esc(u.uid)}">
        <b>${esc(u.email || "(без email)")}</b>
        <span>${esc(u.displayName || "—")} · ${esc(u.role)} · ${esc(u.accessStatus)}</span>
        <span>тариф: ${esc(s.plan || "none")} · ИИ: ${ai.enabled ? "вкл" : "выкл"} · баланс: ${esc(ai.balanceRub || 0)} ₽</span>
      </div>`;
    }).join("");
  }

  function renderDetails(uid) {
    const el = $("#ep-admin-user-details"); if (!el) return;
    const u = A.users.find((x) => x.uid === uid);
    if (!u) { el.innerHTML = "<h2>Карточка пользователя</h2><p>Выберите пользователя слева.</p>"; return; }
    const s = u.subscription || {}, ai = u.ai || {};
    const opt = (vals, cur) => vals.map((v) => `<option value="${v[0]}" ${String(cur) === v[0] ? "selected" : ""}>${esc(v[1])}</option>`).join("");
    const expires = s.expiresAt && s.expiresAt._seconds ? new Date(s.expiresAt._seconds * 1000).toLocaleDateString("ru-RU")
      : (s.expiresAt && s.expiresAt.seconds ? new Date(s.expiresAt.seconds * 1000).toLocaleDateString("ru-RU") : "—");
    el.innerHTML = `
      <h2>${esc(u.email || u.uid)}</h2>
      <div class="ep-admin-field"><label>UID</label><input value="${esc(u.uid)}" readonly></div>
      <div class="ep-admin-field"><label>Имя</label><input value="${esc(u.displayName)}" readonly></div>
      <div class="ep-admin-field"><label>Роль</label><select id="adm-role">${opt([["master", "Мастер"], ["admin", "Админ"]], u.role)}</select></div>
      <div class="ep-admin-field"><label>Доступ</label><select id="adm-status">${opt([["pending", "ожидает"], ["approved", "одобрен"], ["blocked", "заблокирован"]], u.accessStatus)}</select></div>
      <div class="ep-admin-field"><label>Тариф</label><select id="adm-plan">${opt([["none", "нет"], ["basic", "базовый"], ["ai", "с ИИ"], ["trial", "пробный"]], s.plan || "none")}</select></div>
      <div class="ep-admin-field"><label>Дней подписки</label><input id="adm-days" type="number" min="0" step="1" value="30" placeholder="0 = без срока"></div>
      <div class="ep-admin-field"><label>ИИ режим</label><select id="adm-ai-mode">${opt([["off", "выкл"], ["client", "свой ключ"], ["server", "по балансу"]], ai.mode || "off")}</select></div>
      <div class="ep-admin-field"><label>ИИ включён</label><select id="adm-ai-enabled">${opt([["true", "да"], ["false", "нет"]], ai.enabled ? "true" : "false")}</select></div>
      <div class="ep-admin-field"><label>ИИ баланс, ₽</label><input id="adm-ai-balance" type="number" min="0" step="0.01" value="${esc(ai.balanceRub || 0)}"></div>
      <div class="ep-admin-field"><label>Заметка</label><input id="adm-note" value="${esc(u.adminNote || "")}" placeholder="комментарий администратора"></div>
      <p class="ep-admin-muted">Текущий срок: ${esc(expires)}</p>
      <div class="ep-admin-actions">
        <button id="adm-save" type="button">Сохранить доступ</button>
      </div>
      <p id="adm-save-status" class="ep-admin-muted"></p>`;
  }

  async function saveUser() {
    if (A.busy) return; const uid = A.selectedUid; if (!uid) return;
    const val = (id) => { const e = $(id); return e ? e.value : ""; };
    const payload = {
      targetUid: uid,
      role: val("#adm-role"),
      accessStatus: val("#adm-status"),
      plan: val("#adm-plan"),
      days: Number(val("#adm-days") || 0),
      aiMode: val("#adm-ai-mode"),
      aiEnabled: val("#adm-ai-enabled") === "true",
      aiBalanceRub: Number(val("#adm-ai-balance") || 0),
      note: val("#adm-note")
    };
    const st = $("#adm-save-status"); if (st) st.textContent = "Сохранение…";
    A.busy = true;
    try {
      const data = await call("adminSetUserAccess", payload);
      if (data && data.user) { const i = A.users.findIndex((x) => x.uid === uid); if (i >= 0) A.users[i] = data.user; else A.users.push(data.user); }
      if (st) st.textContent = "Сохранено ✓";
      renderDashboard(); renderList(); renderDetails(uid);
    } catch (e) {
      const code = e && (e.code || e.message);
      if (st) st.textContent = "Ошибка: " + (String(code).indexOf("permission-denied") >= 0 ? "нет прав администратора" : code);
    } finally { A.busy = false; }
  }

  // ---- вкладки логов/безопасности: прямое чтение (админу разрешено) ----
  async function loadLogs() {
    const d = db(); if (!d) return;
    const fill = async (coll, elId) => {
      const el = $(elId); if (!el) return;
      try {
        const snap = await d.collection(coll).orderBy("createdAt", "desc").limit(40).get();
        if (snap.empty) { el.innerHTML = "<div class='ep-admin-placeholder'>Записей нет.</div>"; return; }
        el.innerHTML = snap.docs.map((doc) => { const x = doc.data() || {}; const t = x.createdAt && x.createdAt.toDate ? x.createdAt.toDate().toLocaleString("ru-RU") : ""; return `<div class="ep-admin-logrow"><span>${esc(t)}</span> ${esc(x.type || x.event || "")} ${esc(x.targetUid || x.actorEmail || "")}</div>`; }).join("");
      } catch (e) { el.innerHTML = "<div class='ep-admin-placeholder'>Нет доступа к " + esc(coll) + ".</div>"; }
    };
    fill("admin_logs", "#ep-admin-logs-admin");
    fill("security_events", "#ep-admin-logs-errors");
  }

  function switchTab(tab) {
    document.querySelectorAll(".ep-admin-tab").forEach((b) => b.classList.toggle("active", b.getAttribute("data-admin-tab") === tab));
    document.querySelectorAll(".ep-admin-panel").forEach((p) => p.classList.toggle("active", p.id === "ep-admin-tab-" + tab));
    if (tab === "logs" || tab === "security") loadLogs();
  }

  // ---- единая делегация на корне (без observer) ----
  function bind(root) {
    if (root.__epAdminBound) return; root.__epAdminBound = true;
    root.addEventListener("click", (ev) => {
      const tabBtn = ev.target.closest("[data-admin-tab]"); if (tabBtn) { switchTab(tabBtn.getAttribute("data-admin-tab")); return; }
      const row = ev.target.closest(".ep-admin-user-row"); if (row) { A.selectedUid = row.getAttribute("data-uid"); renderList(); renderDetails(A.selectedUid); return; }
      if (ev.target.closest("#ep-admin-refresh")) { loadUsers(); return; }
      if (ev.target.closest("#adm-save")) { saveUser(); return; }
    });
    root.addEventListener("input", (ev) => { if (ev.target.id === "ep-admin-user-search") renderList(); });
  }

  function mount() {
    const root = $("#ep-admin-root"); if (!root) return;
    if (!isAdmin()) { root.innerHTML = "<div class='ep-admin-hero'><h1>Админка</h1><p>Доступ только для администратора.</p></div>"; return; }
    bind(root);
    if (!fns()) { setStatus("Cloud Functions SDK не загружен."); return; }
    loadUsers();
  }

  window.addEventListener("ep:route-loaded", (e) => { if (e && e.detail && e.detail.route === "admin") mount(); });
  EP.Admin = { mount, reload: loadUsers, isAdmin };
})();
