/* ============================================================
   Electric Pro V29 — Админка (выбор пользователя + карточка + разделы)
   ПО ПРАВИЛАМ: список/доступ — Cloud Functions adminListUsers/adminSetUserAccess;
   данные пользователя — прямым чтением (админу разрешено):
     БД user_db/{uid} | черновики drafts/{uid} | документы estimates/{uid}
     ИИ ai_usage/{uid} | логи admin_logs(targetUid)
   accounting/{uid} и documents/{uid} в правилах НЕТ -> понятное сообщение.
   Монтаж только по ep:route-loaded(admin), без observer/самофеча.
   ============================================================ */
(() => {
  "use strict";
  window.EP = window.EP || {};
  const OWNER = "vits0007@gmail.com";
  const A = { users: [], selectedUid: null, section: null };
  const $ = (s, r) => (r || document).querySelector(s);
  const esc = (s) => String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const json = (o) => { try { return JSON.stringify(o, null, 2); } catch (e) { return String(o); } };

  function me() { try { return (EP.Auth && EP.Auth.currentUser && EP.Auth.currentUser()) || (EP.state && EP.state.user) || {}; } catch (e) { return {}; } }
  function isAdmin() {
    try {
      if (EP.Auth && EP.Auth.isAdmin && EP.Auth.isAdmin()) return true;
      if ((me() || {}).email === OWNER) return true;
      const p = (EP.state && EP.state.profile) || {}; return p.role === "admin" && p.accessStatus !== "blocked";
    } catch (e) { return false; }
  }
  function fns() { try { if (typeof firebase !== "undefined" && firebase.functions) return firebase.functions(); } catch (e) {} return null; }
  function db() { try { return (EP.Firebase && EP.Firebase.db) || null; } catch (e) { return null; } }
  async function call(name, payload) { const f = fns(); if (!f) throw new Error("functions-unavailable"); const r = await f.httpsCallable(name)(payload || {}); return r && r.data; }
  function status(msg) { const el = $("#ep-admin-status"); if (el) el.textContent = msg; }

  async function loadUsers() {
    status("Загрузка пользователей…");
    try { const d = await call("adminListUsers", {}); A.users = (d && d.users) || []; renderDashboard(); status("Пользователей: " + A.users.length); }
    catch (e) { const c = e && (e.code || e.message); status(String(c).indexOf("permission-denied") >= 0 ? "Нет прав администратора." : "Облачные функции недоступны: " + c); }
  }
  async function readDoc(coll, id) {
    const d = db(); if (!d) return { error: "no-db" };
    try { const s = await d.collection(coll).doc(id).get(); return { exists: s.exists, data: s.exists ? (s.data() || {}) : null }; }
    catch (e) { return { error: (e && (e.code || e.message)) || "error" }; }
  }
  async function readColl(coll, field, val) {
    const d = db(); if (!d) return { error: "no-db" };
    try { let q = d.collection(coll); if (field) q = q.where(field, "==", val); const s = await q.limit(40).get(); return { docs: s.docs.map((x) => ({ id: x.id, data: x.data() || {} })) }; }
    catch (e) { return { error: (e && (e.code || e.message)) || "error" }; }
  }

  function active(u) { const s = u.subscription || {}; return u.accessStatus === "approved" && s.active && s.plan && s.plan !== "none"; }
  function renderDashboard() {
    const set = (id, v) => { const el = $(id); if (el) el.textContent = v; };
    set("#ep-admin-count-users", A.users.length);
    set("#ep-admin-count-pending", A.users.filter((u) => u.accessStatus === "pending").length);
    set("#ep-admin-count-active", A.users.filter(active).length);
    set("#ep-admin-count-blocked", A.users.filter((u) => u.accessStatus === "blocked").length);
    set("#ep-admin-count-ai", A.users.filter((u) => (u.ai || {}).enabled).length);
  }

  function openPicker() { const m = $("#ep-admin-modal"); if (!m) return; m.classList.add("open"); renderPickerList(); const s = $("#ep-admin-modal-search"); if (s) { s.value = ""; setTimeout(() => s.focus && s.focus(), 50); } }
  function closePicker() { const m = $("#ep-admin-modal"); if (m) m.classList.remove("open"); }
  function renderPickerList() {
    const el = $("#ep-admin-modal-list"); if (!el) return;
    const q = ($("#ep-admin-modal-search") && $("#ep-admin-modal-search").value || "").trim().toLowerCase();
    const list = !q ? A.users : A.users.filter((u) => [u.uid, u.email, u.displayName, u.role, (u.subscription || {}).plan].some((x) => String(x || "").toLowerCase().indexOf(q) >= 0));
    if (!list.length) { el.innerHTML = "<div class='ep-admin-placeholder'>Никого не найдено.</div>"; return; }
    el.innerHTML = list.map((u) => { const s = u.subscription || {}; return `<button type="button" class="ep-admin-pick-row" data-pick="${esc(u.uid)}"><b>${esc(u.email || "(без email)")}</b><span>${esc(u.displayName || "—")} · ${esc(u.role)} · ${esc(u.accessStatus)} · ${esc(s.plan || "none")}</span></button>`; }).join("");
  }

  function selectUser(uid) { A.selectedUid = uid; A.section = null; closePicker(); renderDetail(); }
  function user() { return A.users.find((x) => x.uid === A.selectedUid); }

  function renderDetail() {
    const host = $("#ep-admin-detail"); if (!host) return;
    const u = user();
    if (!u) { host.innerHTML = "<div class='ep-admin-placeholder'>Нажмите «Выбрать пользователя».</div>"; return; }
    const s = u.subscription || {}, ai = u.ai || {};
    const opt = (vals, cur) => vals.map((v) => `<option value="${v[0]}" ${String(cur) === v[0] ? "selected" : ""}>${esc(v[1])}</option>`).join("");
    const exp = s.expiresAt && (s.expiresAt._seconds || s.expiresAt.seconds) ? new Date((s.expiresAt._seconds || s.expiresAt.seconds) * 1000).toLocaleDateString("ru-RU") : "—";
    host.innerHTML = `
      <div class="ep-admin-userhead">
        <div><h2>${esc(u.email || u.uid)}</h2><p class="ep-admin-muted">${esc(u.displayName || "")} · UID ${esc(u.uid)}</p></div>
        <div class="ep-admin-badges">
          <span class="ep-badge ${u.accessStatus === "approved" ? "ok" : u.accessStatus === "blocked" ? "bad" : ""}">${esc(u.accessStatus)}</span>
          <span class="ep-badge">${esc(u.role)}</span><span class="ep-badge">${esc(s.plan || "none")}</span>
        </div>
      </div>
      <details class="ep-admin-card2" open>
        <summary>Подписка и доступ</summary>
        <div class="ep-admin-grid2">
          <div class="ep-admin-field"><label>Роль</label><select id="adm-role">${opt([["master", "Мастер"], ["admin", "Админ"]], u.role)}</select></div>
          <div class="ep-admin-field"><label>Доступ</label><select id="adm-status">${opt([["pending", "ожидает"], ["approved", "одобрен"], ["blocked", "заблокирован"]], u.accessStatus)}</select></div>
          <div class="ep-admin-field"><label>Тариф</label><select id="adm-plan">${opt([["none", "нет"], ["basic", "базовый"], ["ai", "с ИИ"], ["trial", "пробный"]], s.plan || "none")}</select></div>
          <div class="ep-admin-field"><label>Дней подписки</label><input id="adm-days" type="number" min="0" step="1" value="30"></div>
          <div class="ep-admin-field"><label>ИИ режим</label><select id="adm-ai-mode">${opt([["off", "выкл"], ["client", "свой ключ"], ["server", "по балансу"]], ai.mode || "off")}</select></div>
          <div class="ep-admin-field"><label>ИИ включён</label><select id="adm-ai-enabled">${opt([["true", "да"], ["false", "нет"]], ai.enabled ? "true" : "false")}</select></div>
          <div class="ep-admin-field"><label>ИИ баланс, ₽</label><input id="adm-ai-balance" type="number" min="0" step="0.01" value="${esc(ai.balanceRub || 0)}"></div>
          <div class="ep-admin-field"><label>Заметка</label><input id="adm-note" value="${esc(u.adminNote || "")}"></div>
        </div>
        <p class="ep-admin-muted">Текущий срок: ${esc(exp)}</p>
        <div class="ep-admin-actions">
          <button id="adm-save" type="button">Сохранить доступ</button>
          <button id="adm-quick-approve" type="button" class="ghost">Одобрить</button>
          <button id="adm-quick-block" type="button" class="ghost">Заблокировать</button>
        </div>
        <p id="adm-save-status" class="ep-admin-muted"></p>
      </details>
      <div class="ep-admin-sections">
        <button type="button" data-sec="db">🗂️ БД</button>
        <button type="button" data-sec="documents">📄 Документы</button>
        <button type="button" data-sec="accounting">📊 Бухгалтерия</button>
        <button type="button" data-sec="drafts">📝 Черновики</button>
        <button type="button" data-sec="ai">🤖 ИИ-расход</button>
        <button type="button" data-sec="logs">📜 Логи</button>
      </div>
      <div class="ep-admin-section-content" id="ep-admin-section-content"><div class="ep-admin-placeholder">Выберите раздел выше.</div></div>`;
    if (A.section) openSection(A.section);
  }

  async function saveUser(extra) {
    const uid = A.selectedUid; if (!uid) return;
    const v = (id) => { const e = $(id); return e ? e.value : ""; };
    const payload = Object.assign({ targetUid: uid, role: v("#adm-role"), accessStatus: v("#adm-status"), plan: v("#adm-plan"), days: Number(v("#adm-days") || 0), aiMode: v("#adm-ai-mode"), aiEnabled: v("#adm-ai-enabled") === "true", aiBalanceRub: Number(v("#adm-ai-balance") || 0), note: v("#adm-note") }, extra || {});
    const stx = $("#adm-save-status"); if (stx) stx.textContent = "Сохранение…";
    try { const d = await call("adminSetUserAccess", payload); if (d && d.user) { const i = A.users.findIndex((x) => x.uid === uid); if (i >= 0) A.users[i] = d.user; } if (stx) stx.textContent = "Сохранено ✓"; renderDashboard(); renderDetail(); }
    catch (e) { const c = e && (e.code || e.message); if (stx) stx.textContent = "Ошибка: " + (String(c).indexOf("permission-denied") >= 0 ? "нет прав администратора" : c); }
  }

  function secContent(html) { const el = $("#ep-admin-section-content"); if (el) el.innerHTML = html; }
  function errBlock(coll, r) {
    if (String(r.error).indexOf("permission-denied") >= 0) return `<div class='ep-admin-placeholder'>Нет доступа к <code>${esc(coll)}</code> по текущим правилам Firestore.</div>`;
    return `<div class='ep-admin-placeholder'>Ошибка чтения <code>${esc(coll)}</code>: ${esc(r.error)}</div>`;
  }
  async function openSection(name) {
    A.section = name; const uid = A.selectedUid; if (!uid) return;
    document.querySelectorAll(".ep-admin-sections button").forEach((b) => b.classList.toggle("active", b.getAttribute("data-sec") === name));
    secContent("<div class='ep-admin-placeholder'>Загрузка…</div>");
    if (name === "db") {
      const r = await readDoc("user_db", uid); if (r.error) return secContent(errBlock("user_db/{uid}", r));
      const items = (r.data && Array.isArray(r.data.items)) ? r.data.items : [];
      if (!items.length) return secContent("<div class='ep-admin-placeholder'>Личная БД пуста.</div>");
      const rows = items.slice(0, 200).map((x) => `<tr><td>${esc(x.type)}</td><td>${esc(x.name)}</td><td>${esc(x.category || "")}</td><td>${esc(x.unit || "")}</td><td>${esc(x.price)}</td></tr>`).join("");
      secContent(`<p class="ep-admin-muted">Позиций: ${items.length} (первые ${Math.min(items.length, 200)})</p><table class="ep-admin-table"><thead><tr><th>тип</th><th>название</th><th>категория</th><th>ед.</th><th>цена</th></tr></thead><tbody>${rows}</tbody></table>`);
    } else if (name === "drafts" || name === "documents") {
      const coll = name === "drafts" ? "drafts" : "estimates";
      const r = await readDoc(coll, uid); if (r.error) return secContent(errBlock(coll + "/{uid}", r));
      if (!r.exists || !r.data || !Object.keys(r.data).length) return secContent(`<div class='ep-admin-placeholder'>В <code>${esc(coll)}/{uid}</code> данных нет (либо в подколлекции — уточним при переносе раздела).</div>`);
      secContent(`<pre class="ep-admin-pre">${esc(json(r.data))}</pre>`);
    } else if (name === "accounting") {
      const r = await readDoc("accounting", uid);
      if (r.error && String(r.error).indexOf("permission-denied") >= 0) return secContent("<div class='ep-admin-placeholder'>Бухгалтерия (<code>accounting/{uid}</code>) пока не описана в правилах Firestore. Заведём коллекцию и правило — раздел заработает. Могу подготовить текст правила.</div>");
      if (r.error) return secContent(errBlock("accounting/{uid}", r));
      if (!r.exists) return secContent("<div class='ep-admin-placeholder'>Данных по бухгалтерии нет.</div>");
      secContent(`<pre class="ep-admin-pre">${esc(json(r.data))}</pre>`);
    } else if (name === "ai") {
      const u = user(), ai = (u && u.ai) || {};
      const head = `<div class="ep-admin-aihead"><span>Баланс: <b>${esc(ai.balanceRub || 0)} ₽</b></span><span>режим: ${esc(ai.mode || "off")}</span><span>ИИ: ${ai.enabled ? "вкл" : "выкл"}</span></div>`;
      const r = await readDoc("ai_usage", uid);
      if (r.error && String(r.error).indexOf("permission-denied") >= 0) return secContent(head + "<div class='ep-admin-placeholder'>Детализация расхода (ai_usage) недоступна по правилам.</div>");
      if (r.error) return secContent(head + errBlock("ai_usage/{uid}", r));
      secContent(head + (r.exists && r.data ? `<pre class="ep-admin-pre">${esc(json(r.data))}</pre>` : "<div class='ep-admin-placeholder'>Расхода ИИ пока нет.</div>"));
    } else if (name === "logs") {
      const r = await readColl("admin_logs", "targetUid", uid); if (r.error) return secContent(errBlock("admin_logs", r));
      if (!r.docs || !r.docs.length) return secContent("<div class='ep-admin-placeholder'>Логов по этому пользователю нет.</div>");
      secContent(r.docs.map((d) => { const x = d.data; const t = x.createdAt && x.createdAt.toDate ? x.createdAt.toDate().toLocaleString("ru-RU") : ""; return `<div class="ep-admin-logrow"><span>${esc(t)}</span> ${esc(x.plan || x.type || "")} · ИИ:${esc(x.aiMode || "")} · ${esc(x.actorEmail || "")}</div>`; }).join(""));
    }
  }

  function bind(root) {
    if (root.__epAdminBound) return; root.__epAdminBound = true;
    root.addEventListener("click", (ev) => {
      const t = ev.target;
      if (t.closest("#ep-admin-open-picker")) return openPicker();
      if (t.closest("#ep-admin-modal-close") || t.closest("#ep-admin-modal-overlay")) return closePicker();
      const pick = t.closest("[data-pick]"); if (pick) return selectUser(pick.getAttribute("data-pick"));
      const sec = t.closest("[data-sec]"); if (sec) return openSection(sec.getAttribute("data-sec"));
      if (t.closest("#adm-save")) return saveUser();
      if (t.closest("#adm-quick-approve")) { const e = $("#adm-status"); if (e) e.value = "approved"; return saveUser({ accessStatus: "approved" }); }
      if (t.closest("#adm-quick-block")) { const e = $("#adm-status"); if (e) e.value = "blocked"; return saveUser({ accessStatus: "blocked" }); }
      if (t.closest("#ep-admin-refresh")) return loadUsers();
    });
    root.addEventListener("input", (ev) => { if (ev.target.id === "ep-admin-modal-search") renderPickerList(); });
  }
  function mount() {
    const root = $("#ep-admin-root"); if (!root) return;
    if (!isAdmin()) { root.innerHTML = "<div class='ep-admin-hero'><h1>Админка</h1><p>Доступ только для администратора.</p></div>"; return; }
    bind(root);
    if (!fns()) { status("Cloud Functions SDK не загружен."); return; }
    loadUsers().then(() => renderDetail());
  }
  window.addEventListener("ep:route-loaded", (e) => { if (e && e.detail && e.detail.route === "admin") mount(); });
  EP.Admin = { mount, reload: loadUsers, isAdmin };
})();
