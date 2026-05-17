/*
 * Electric PRO Refactor
 * Module: 07-settings.js
 * V34 FIXED ASYNC: настройки / профиль мастера / контакты / визуальные параметры.
 *
 * Важно:
 * - async function сохраняется правильно;
 * - пока это безопасный перенос/дублирование;
 * - 00-core.js временно остаётся стабильным runtime;
 * - окончательная чистка будет позже.
 */

console.log("07-settings.js V34 FIXED ASYNC loaded");



/* =========================================================
 * SETTINGS BLOCK: handleGoogleAuth
 * ========================================================= */
async function handleGoogleAuth() {
    if(!auth) return alert("Ошибка: Firebase не загружен. Проверьте интернет-соединение.");
    showLoader("Подключение к Google...", "🔄");
    try { 
        const provider = new firebase.auth.GoogleAuthProvider();
        provider.setCustomParameters({ prompt: 'select_account' });
        await auth.signInWithPopup(provider); 
    } catch(e) { 
        hideLoader();
        if(e.code !== 'auth/popup-closed-by-user') alert("Сбой Google Auth: " + e.message); 
    }
}



/* =========================================================
 * SETTINGS BLOCK: checkLocalPinUser
 * ========================================================= */
function checkLocalPinUser() {
    let pinUser = safeGet('authUser_v31_pin', null);
    if (pinUser) { 
        try { appUser = JSON.parse(pinUser); finishLoginSetup(); } catch(e){ document.getElementById('authModal').style.display='flex'; } 
    } else { document.getElementById('authModal').style.display='flex'; }
}



/* =========================================================
 * SETTINGS BLOCK: loginWithPin
 * ========================================================= */
async function loginWithPin() {
    let phone = document.getElementById('auth-phone').value.trim();
    let pin = document.getElementById('auth-pin').value.trim();
    if(!phone || !pin) return showToast("Введите номер и PIN-код!");
    showLoader("Проверка...", "🔒");
    
    if(phone === '89776230182' && pin === 'vbvbvb987') {
        appUser = { phone: phone, name: "Виталий (Руководитель)", role: "admin", isApproved: true };
        safeSet('authUser_v31_pin', JSON.stringify(appUser));
        hideLoader(); finishLoginSetup();
        return;
    }
    
    try {
        if(!db) throw new Error("Нет связи с БД");
        const snap = await db.collection('users').where('phone', '==', phone).where('pin', '==', pin).get();
        if(snap.empty) { hideLoader(); return window.customAlert("Ошибка", "Неверный вход."); }
        appUser = snap.docs[0].data(); appUser.uid = snap.docs[0].id;
        
        if (appUser.isApproved === true || appUser.role === 'admin') {
            safeSet('authUser_v31_pin', JSON.stringify(appUser));
            hideLoader(); finishLoginSetup();
        } else {
            hideLoader(); document.getElementById('authModal').style.display='none'; document.getElementById('waitingModal').style.display='block';
        }
    } catch(err) { hideLoader(); window.customAlert("Ошибка базы", err.message); }
}



/* =========================================================
 * SETTINGS BLOCK: confirmLogout
 * ========================================================= */
function confirmLogout() { 
    if(auth) auth.signOut(); 
    safeSet('authUser_v31_pin', ''); 
    window.location.reload(); 
}



/* =========================================================
 * SETTINGS BLOCK: finishLoginSetup
 * ========================================================= */
async function finishLoginSetup() {
    document.getElementById('authModal').style.display = 'none';
    document.getElementById('waitingModal').style.display = 'none';
    document.getElementById('main-app').style.display = 'block';
    
    if (appUser.geminiKey) { GEMINI_API_KEY = appUser.geminiKey; document.getElementById('api-key-input').value = GEMINI_API_KEY; }
    
    if(appUser.role === 'admin') { 
        document.getElementById('admin-panel').style.display = 'block'; 
        listenForApprovals(); 
        loadMasterDrafts(); 
        renderAdminUsers(); 
    }
    
    let savedTheme = safeGet('theme_v31', 'light'); changeTheme(savedTheme); document.getElementById('theme-select').value = savedTheme;
    document.getElementById('m-coeff').value = coeffs.mat; document.getElementById('w-coeff').value = coeffs.work;
    document.getElementById('qr-tg').value = safeGet('qr_tg_v31', ''); 
    document.getElementById('qr-wa').value = safeGet('qr_wa_v31', '');
    document.getElementById('qr-vk').value = safeGet('qr_vk_v31', '');
    document.getElementById('ai-shops').value = safeGet('ai_shops_v31', 'Лемана ПРО, ВсеИнструменты, Петрович');

    showLoader('Синхронизация...', '☁️');
    try {
        if(db) {
            const dbDoc = await db.collection('settings').doc('global_db').get();
            if(dbDoc.exists) { matDB = dbDoc.data().matDB || FULL_MAT_INIT; workDB = dbDoc.data().workDB || FULL_WORK_INIT; }
            else { matDB = FULL_MAT_INIT; workDB = FULL_WORK_INIT; }
            const logicDoc = await db.collection('settings').doc('global_logic').get();
            if(logicDoc.exists) appLogic = Object.assign(appLogic, logicDoc.data());
            
            const histSnap = await db.collection('history').get();
            hDB = histSnap.docs.map(doc => doc.data());
            const draftDoc = await db.collection('drafts').doc(appUser.uid).get();
            if(draftDoc.exists && currentEstimate.length === 0) { 
                currentEstimate = draftDoc.data().estimate || []; 
                let c = draftDoc.data().cust;
                if(c) { cust = c; safeSet('cust_v31', JSON.stringify(cust)); }
            }
        } else { matDB = FULL_MAT_INIT; workDB = FULL_WORK_INIT; }
    } catch(e) { matDB = FULL_MAT_INIT; workDB = FULL_WORK_INIT; console.error(e); }
    
    hideLoader(); updateMasterBadge(); renderMainTable(); updateHistList();
    if(!(cust && cust.name)) { setTimeout(() => { openModal('custModal'); }, 400); }
}



/* =========================================================
 * SETTINGS BLOCK: changeTheme
 * ========================================================= */
function changeTheme(theme) { document.documentElement.setAttribute('data-theme', theme); safeSet('theme_v31', theme); }


/* =========================================================
 * SETTINGS BLOCK: updateMasterBadge
 * ========================================================= */
function updateMasterBadge() { document.getElementById('master-badge').innerHTML = `${appUser?.name || "Мастер"}<br>Объект: ${cust.name || 'Не выбран'}`; }



/* =========================================================
 * SETTINGS BLOCK: saveQRs
 * ========================================================= */
function saveQRs() { 
    safeSet('qr_tg_v31', document.getElementById('qr-tg').value); 
    safeSet('qr_wa_v31', document.getElementById('qr-wa').value); 
    safeSet('qr_vk_v31', document.getElementById('qr-vk').value);
    safeSet('ai_shops_v31', document.getElementById('ai-shops').value); 
    showToast("📱 Настройки сохранены"); 
}



/* =========================================================
 * SETTINGS BLOCK: addExtraToShieldConfig
 * ========================================================= */
function addExtraToShieldConfig() {
    let sel = document.getElementById('cfg-extra-db');
    let q = Number(document.getElementById('cfg-extra-q').value) || 1;
    if(!sel.value) return showToast("Выберите аппарат!");
    let item = matDB.find(m => m.id === sel.value);
    if(item) {
        currentShieldExtras.push({...item, q: q});
        renderShieldExtras();
    }
}



/* =========================================================
 * SETTINGS BLOCK: loadCustHistoryOptions
 * ========================================================= */
function loadCustHistoryOptions() {
    let sel = document.getElementById('c-history-select'); 
    if(!sel) return;
    let opts = '<option value="">📥 Загрузить (История)</option>'; 
    let uniqueCusts = []; hDB.forEach(h => { if(h.name && !uniqueCusts.find(c => c.name === h.name)) uniqueCusts.push(h); }); 
    uniqueCusts.forEach(h => { opts += `<option value="${h.id}">${h.name} (${h.date})</option>`; }); 
    sel.innerHTML = opts;
}



/* =========================================================
 * SETTINGS BLOCK: approveUser
 * ========================================================= */
async function approveUser(uid) { try { await db.collection('users').doc(uid).update({ isApproved: true }); showToast("Одобрено!"); } catch(e){} }



/* =========================================================
 * SETTINGS BLOCK: loadMasterDrafts
 * ========================================================= */
async function loadMasterDrafts() {
    if(!db || appUser.role !== 'admin') return;
    try {
        const snap = await db.collection('drafts').get(); 
        const usersSnap = await db.collection('users').get();
        let users = usersSnap.docs.map(d => ({id: d.id, ...d.data()})); 
        adminDraftsCache = [];
        let draftsHtml = '';
        snap.forEach(doc => {
            let data = doc.data(); let master = users.find(u => u.id === doc.id); let mName = master ? master.name : 'Неизвестный мастер'; let total = 0;
            if(data.estimate) { data.estimate.forEach(it => { total += fPrice(it) * it.q; }); }
            data.masterName = mName; data.uid = doc.id; data.total = total;
            adminDraftsCache.push(data);
            draftsHtml += `<div class="emp-row" style="flex-direction:column; align-items:flex-start; cursor:pointer;" onclick="openAdminDraftView('${doc.id}')"><div style="width:100%; display:flex; justify-content:space-between;"><b>${mName}</b> <span style="color:var(--primary); font-weight:bold;">${total} Р</span></div><span style="font-size:10px; color:var(--gray);">Объект: ${data.cust ? data.cust.name : 'Не указан'} | Поз: ${data.estimate ? data.estimate.length : 0}</span></div>`;
        }); 
        document.getElementById('admin-drafts-list').innerHTML = draftsHtml || "<span style='font-size:11px; color:gray;'>Активных смет нет</span>";
    } catch(e) { console.error("Load drafts error", e); }
}



/* =========================================================
 * SETTINGS BLOCK: openAdminDraftView
 * ========================================================= */
function openAdminDraftView(uid) {
    let draft = adminDraftsCache.find(d => d.uid === uid);
    if(!draft) return;
    let html = `<h3 style="margin-top:0; color:var(--primary);">${draft.masterName}</h3>`;
    html += `<p style="font-size:12px; color:var(--gray); margin-bottom:15px;">Объект: ${draft.cust?.name || 'Не указан'} (${draft.cust?.addr || 'Нет адреса'})</p>`;
    html += `<table class="pdf-table" style="width:100%;">`;
    (draft.estimate || []).forEach(it => {
        html += `<tr><td>${it.n}</td><td style="text-align:center;">x${it.q}</td><td style="text-align:right; font-weight:bold;">${fPrice(it) * it.q} ₽</td></tr>`;
    });
    html += `</table><h3 style="text-align:right; color:var(--primary);">Итого: ${draft.total} ₽</h3>`;
    document.getElementById('admin-draft-content').innerHTML = html;
    openModal('adminDraftModal');
}



/* =========================================================
 * SETTINGS BLOCK: renderAdminUsers
 * ========================================================= */
async function renderAdminUsers() {
    if(appUser.role !== 'admin') return;
    try {
        if(db) {
            const snap = await db.collection('users').get();
            let html = snap.docs.map(doc => {
                let u = doc.data();
                return `<div class="emp-row" style="flex-wrap: wrap; gap: 5px;"><div><b>${u.name}</b><br><span style="font-size:10px; color:var(--gray);">${u.phone || u.email} (${u.role})</span></div> <button class="btn-danger" style="padding:6px 10px; width:auto; margin:0;" onclick="deleteUser('${doc.id}')">✕</button></div>`;
            }).join('');
            document.getElementById('admin-users-list').innerHTML = html || "<span style='font-size:11px; color:gray;'>Нет сотрудников</span>";
        }
    } catch(e) { console.error("Render users error", e); }
}



/* =========================================================
 * SETTINGS BLOCK: adminAddUser
 * ========================================================= */
async function adminAddUser() {
    let p = document.getElementById('add-user-phone').value.trim();
    let pin = document.getElementById('add-user-pin').value.trim();
    let n = document.getElementById('add-user-name').value.trim();
    if(!p || !pin || !n) return showToast("Заполните все поля!");
    try {
        await db.collection('users').add({ phone: p, pin: pin, name: n, role: 'master', isApproved: true });
        showToast("Мастер добавлен!"); renderAdminUsers();
    } catch(e) { window.customAlert("Ошибка", e.message); }
}



/* =========================================================
 * SETTINGS BLOCK: deleteUser
 * ========================================================= */
async function deleteUser(uid) {
    let conf = await window.customConfirm("Удаление", "Удалить мастера из базы?");
    if(conf && db) { try { await db.collection('users').doc(uid).delete(); renderAdminUsers(); showToast("Удален"); } catch(e){} }
}




/* =========================================================
 * SETTINGS BLOCK: epPatchSettingsUI
 * ========================================================= */
function epPatchSettingsUI() {
        if (document.getElementById('ep-ai-admin-box')) return;

        const oldInput = document.getElementById('api-key-input');
        if (!oldInput) return;

        const h4 = oldInput.previousElementSibling;
        if (h4) h4.style.display = 'none';
        oldInput.style.display = 'none';

        const box = document.createElement('div');
        box.id = 'ep-ai-admin-box';
        box.style.cssText = 'padding:12px; background:rgba(79,70,229,.06); border:1px solid rgba(79,70,229,.25); border-radius:14px; margin-bottom:14px;';
        box.innerHTML = `
            <h4 style="color:var(--primary); margin:0 0 8px;">🤖 ИИ-провайдер</h4>

            <div style="display:grid; grid-template-columns:1fr 1fr; gap:8px; margin-bottom:10px;">
                <label class="ep-ai-choice"><input type="radio" name="ep-ai-provider-admin" value="gemini" onchange="epSetAiProvider('gemini', false)"> Gemini</label>
                <label class="ep-ai-choice"><input type="radio" name="ep-ai-provider-admin" value="openai" onchange="epSetAiProvider('openai', false)"> OpenAI</label>
            </div>

            <div id="ep-ai-admin-keys">
                <label style="font-size:11px; font-weight:800; color:var(--gray);">Gemini API</label>
                <input type="password" id="ep-gemini-key-input" placeholder="AIza..." style="margin-bottom:8px;">

                <label style="font-size:11px; font-weight:800; color:var(--gray);">OpenAI API</label>
                <input type="password" id="ep-openai-key-input" placeholder="sk-..." style="margin-bottom:8px;">

                <label style="font-size:11px; font-weight:800; color:var(--gray);">OpenAI модель</label>
                <input type="text" id="ep-openai-model-input" value="gpt-4o-mini" style="margin-bottom:8px;">

                <button class="btn-primary" style="width:100%; margin-bottom:8px;" onclick="epSaveAiConfig(true)">✅ Проверить и отправить мастерам</button>
                <button class="btn-danger" style="width:100%; background:var(--gray);" onclick="epClearLocalAiKeys()">🧹 Очистить старые локальные ключи</button>
            </div>

            <div id="ep-ai-master-info" style="display:none; font-size:12px; font-weight:900; padding:10px; border-radius:10px; background:rgba(16,185,129,.1); color:var(--success);">
                ИИ подключён администратором
            </div>
        `;

        oldInput.parentNode.insertBefore(box, oldInput.nextSibling);
    }

    

/* =========================================================
 * SETTINGS BLOCK: epLoadAiConfigFromServer
 * ========================================================= */
async function epLoadAiConfigFromServer() {
        try {
            let data = null;

            if (db) {
                const cfgDoc = await db.collection('settings').doc('ai_config').get();
                if (cfgDoc.exists) data = cfgDoc.data();

                if (!data) {
                    const oldDoc = await db.collection('settings').doc('global_api').get();
                    if (oldDoc.exists) data = oldDoc.data();
                }

                if (appUser && appUser.uid) {
                    const userDoc = await db.collection('users').doc(appUser.uid).get();
                    if (userDoc.exists) {
                        const u = userDoc.data();
                        data = Object.assign({}, data || {}, {
                            provider: u.aiProvider || (data && data.provider),
                            geminiKey: u.geminiKey || (data && data.geminiKey),
                            openaiKey: u.openaiKey || (data && data.openaiKey),
                            openaiModel: u.openaiModel || (data && data.openaiModel)
                        });
                    }
                }
            }

            if (data) {
                window.EP_AI_CONFIG.provider = epNormProvider(data.provider || window.EP_AI_CONFIG.provider);
                window.EP_AI_CONFIG.geminiKey = data.geminiKey || data.key || window.EP_AI_CONFIG.geminiKey || '';
                window.EP_AI_CONFIG.openaiKey = data.openaiKey || window.EP_AI_CONFIG.openaiKey || '';
                window.EP_AI_CONFIG.openaiModel = data.openaiModel || window.EP_AI_CONFIG.openaiModel || 'gpt-4o-mini';
            } else {
                window.EP_AI_CONFIG.geminiKey = safeGet('ep_gemini_key_v1', '') || safeGet('gemini_key_v31', '');
                window.EP_AI_CONFIG.openaiKey = safeGet('ep_openai_key_v1', '');
                window.EP_AI_CONFIG.openaiModel = safeGet('ep_openai_model_v1', 'gpt-4o-mini');
            }

            safeSet('ep_ai_provider_v1', window.EP_AI_CONFIG.provider);
            if (window.EP_AI_CONFIG.geminiKey && typeof GEMINI_API_KEY !== 'undefined') GEMINI_API_KEY = window.EP_AI_CONFIG.geminiKey;

            const g = document.getElementById('ep-gemini-key-input');
            const o = document.getElementById('ep-openai-key-input');
            const m = document.getElementById('ep-openai-model-input');
            if (g) g.value = window.EP_AI_CONFIG.geminiKey || '';
            if (o) o.value = window.EP_AI_CONFIG.openaiKey || '';
            if (m) m.value = window.EP_AI_CONFIG.openaiModel || 'gpt-4o-mini';

            const keysBox = document.getElementById('ep-ai-admin-keys');
            const masterInfo = document.getElementById('ep-ai-master-info');
            if (keysBox && masterInfo && appUser) {
                if (appUser.role === 'admin') {
                    keysBox.style.display = 'block';
                    masterInfo.style.display = 'none';
                } else {
                    keysBox.style.display = 'none';
                    masterInfo.style.display = 'block';
                }
            }

            epRefreshProviderUI();
        } catch (e) {
            console.warn('AI config load error:', e);
        }
    }

    

/* =========================================================
 * SETTINGS BLOCK: epSaveUserDb
 * ========================================================= */
async function epSaveUserDb() {
        try {
            safeSet('user_db_mat_v31', JSON.stringify(matDB));
            safeSet('user_db_work_v31', JSON.stringify(workDB));
            if (db && appUser && appUser.uid) {
                await db.collection('user_db').doc(appUser.uid).set({
                    uid: appUser.uid,
                    name: appUser.name || appUser.email || '',
                    matDB: matDB,
                    workDB: workDB,
                    updatedAt: new Date().toISOString()
                }, { merge: true });
            }
        } catch (e) {
            console.warn('save user db error', e);
        }
    }

    

/* =========================================================
 * SETTINGS BLOCK: epLoadUserDbAfterLogin
 * ========================================================= */
async function epLoadUserDbAfterLogin() {
        try {
            if (!appUser || !appUser.uid) return;
            let loaded = false;

            if (db) {
                const doc = await db.collection('user_db').doc(appUser.uid).get();
                if (doc.exists) {
                    const d = doc.data();
                    if (Array.isArray(d.matDB)) { matDB = d.matDB; loaded = true; }
                    if (Array.isArray(d.workDB)) { workDB = d.workDB; loaded = true; }
                }
            }

            if (!loaded) {
                try {
                    const lm = JSON.parse(safeGet('user_db_mat_v31', '[]'));
                    const lw = JSON.parse(safeGet('user_db_work_v31', '[]'));
                    if (lm.length) matDB = lm;
                    if (lw.length) workDB = lw;
                } catch(e){}
            }

            renderDbEditors();
        } catch(e) {
            console.warn('load user db error', e);
        }
    }

    

/* =========================================================
 * SETTINGS BLOCK: epInsertAdminProposalBox
 * ========================================================= */
function epInsertAdminProposalBox() {
        if (document.getElementById('admin-db-proposals')) return;
        const panel = document.getElementById('admin-panel');
        if (!panel) return;
        const box = document.createElement('div');
        box.innerHTML = `
            <h4 style="color:var(--primary); margin: 10px 0 5px;">🌍 Заявки в базу сервера:</h4>
            <div id="admin-db-proposals" style="margin-bottom:10px; border:1px solid var(--primary); background:rgba(79,70,229,.05); border-radius:8px; padding:8px; max-height:240px; overflow-y:auto; font-size:12px;"></div>
        `;
        panel.insertBefore(box, panel.firstChild.nextSibling);
    }

    

/* =========================================================
 * SETTINGS BLOCK: epMoveShieldSettingsIntoDetails
 * ========================================================= */
function epMoveShieldSettingsIntoDetails(){
    var modal = qs('configModal');
    if (!modal || qs('ep-shield-settings-box')) return;
    var content = modal.querySelector('.modal-content');
    if (!content) return;
    var anchor = qs('cfg-brand-box');
    if (!anchor) return;

    var details = document.createElement('details');
    details.id = 'ep-shield-settings-box';
    details.className = 'ep-shield-settings-box';
    details.innerHTML = '<summary>⚙️ Настройки автоматики и щита</summary><div id="ep-shield-settings-inner"></div>';
    var firstRow = anchor.closest('div[style*="grid-template-columns"]') || anchor.parentElement;
    content.insertBefore(details, firstRow);
    var inner = qs('ep-shield-settings-inner');

    var ids = ['cfg-brand-box','cfg-brand-auto','cfg-phase','cfg-auto-curve','cfg-rcd-type','cfg-protection-type'];
    var moved = [];
    ids.forEach(function(id){
      var el = qs(id); if(!el) return;
      var row = el.closest('div[style*="grid-template-columns"]') || el.parentElement;
      if(row && moved.indexOf(row) === -1){ moved.push(row); inner.appendChild(row); }
    });

    var wall = qs('cfg-shield-wall');
    if (wall) {
      var wrap = document.createElement('div');
      wrap.style.marginBottom = '8px';
      var label = wall.previousElementSibling;
      if (label && String(label.tagName).toLowerCase() === 'label') wrap.appendChild(label);
      wrap.appendChild(wall);
      inner.appendChild(wrap);
    }
  }

  

/* =========================================================
 * SETTINGS BLOCK: isAdmin
 * ========================================================= */
function isAdmin(){ try{ return appUser && appUser.role === 'admin'; }catch(e){ return false; } }
  

/* =========================================================
 * SETTINGS BLOCK: fbUser
 * ========================================================= */
function fbUser(){ try{ return (typeof firebase!=='undefined' && firebase.auth && firebase.auth().currentUser) ? firebase.auth().currentUser : null; }catch(e){ return null; } }
  

/* =========================================================
 * SETTINGS BLOCK: currentUserLabel
 * ========================================================= */
function currentUserLabel(){ try{ var u=(firebase.auth&&firebase.auth().currentUser)||null; return (u&&(u.email||u.uid)) || (window.appUser&&(appUser.email||appUser.phone||appUser.uid)) || ''; }catch(e){ return (window.appUser&&(appUser.email||appUser.phone||appUser.uid)) || ''; } }
  

/* =========================================================
 * SETTINGS BLOCK: adminServerMode
 * ========================================================= */
function adminServerMode(){ return !!(window.EP_ADMIN_SERVER_DB_EDIT === true && isAdmin()); }
  

/* =========================================================
 * SETTINGS BLOCK: installAdminSettingsButton
 * ========================================================= */
function installAdminSettingsButton(){
    var panel = $('admin-panel');
    if(!panel || $('ep-v11-admin-server-db-btn')) return;
    var box = document.createElement('div');
    box.id = 'ep-v11-admin-server-db-btn';
    box.style.cssText = 'margin:12px 0;padding:10px;border:1px solid var(--primary);border-radius:12px;background:rgba(79,70,229,.07);';
    box.innerHTML = '<div style="font-weight:900;color:var(--primary);margin-bottom:6px;">🌍 База сервера</div>'
      + '<div style="font-size:11px;color:var(--gray);line-height:1.35;margin-bottom:8px;">Импорт, замена, цены и сохранение глобальной базы выполняются только отсюда, чтобы личный импорт админа случайно не улетел на сервер.</div>'
      + '<button type="button" class="btn-primary" style="width:100%;padding:12px;margin:0;" onclick="epOpenAdminServerDbFromSettings()">👑 Открыть редактирование базы сервера</button>';
    var firstH = panel.querySelector('h4');
    if(firstH) panel.insertBefore(box, firstH); else panel.appendChild(box);
  }

  

/* =========================================================
 * SETTINGS BLOCK: lineConfig
 * ========================================================= */
function lineConfig(){
    var out=[]; function e(id){ return $(id); } function ch(id){ var x=e(id); return !!(x&&x.checked); }
    function add(n,nom,g){ out.push({name:n,nominal:nom,group:g}); }
    function room(label,count,wet){ count=Number(count)||0; for(var i=1;i<=count;i++){ var p=count>1?label+' '+i:label; add(p+' розетки','C16',wet?'wet':'power'); add(p+' свет','C10','light'); } }
    try{ room('Кухня',window.cfg&&cfg.kits,false); room('Ванная',window.cfg&&cfg.baths,true); room('Туалет',window.cfg&&cfg.toilets,true); room('Комната',window.cfg&&cfg.rms,false); room('Балкон',window.cfg&&cfg.bals,false); }catch(e){}
    if(ch('c-apron')) add('Фартук кухни','C16','power'); if(ch('c-dish')) add('Посудомойка','C10','power'); if(ch('c-washer')) add('Стиралка/сушилка','C10','wet'); if(ch('c-towel')) add('Полотенцесушитель','C10','wet');
    var acs=(window.cfg&&Number(cfg.acs))||0, fls=(window.cfg&&Number(cfg.fls))||0; for(var a=1;a<=acs;a++) add('Кондиционер '+a,'C10','climate'); for(var f=1;f<=fls;f++) add('Тёплый пол '+f,'C10','climate');
    if(ch('c-fridge')) add('Холодильник, неотключаемая группа','C10','alwaysOn'); if(ch('c-neptun')) add('Нептун, неотключаемая группа','C10','alwaysOn'); if(ch('c-router')) add('Роутер, неотключаемая группа','C6','alwaysOn');
    var hp=e('c-hob-power')?e('c-hob-power').value:'none'; if(hp==='6') add('Плита до 6 кВт','C25','heavy'); if(hp==='10') add('Плита до 10 кВт','C32','heavy');
    var bp=e('c-boiler-power')?e('c-boiler-power').value:'none'; if(bp==='6') add('Бойлер до 6 кВт','C25','wet'); if(bp==='10') add('Бойлер до 10 кВт','C32','wet');
    return out;
  }
  

/* =========================================================
 * SETTINGS BLOCK: optionsHtml
 * ========================================================= */
function optionsHtml(vals,placeholder){ vals=Array.from(new Set((vals||[]).map(clean).filter(Boolean))).sort(function(a,b){return a.localeCompare(b,'ru');}); return '<option value="">'+esc(placeholder||'Выбрать')+'</option>'+vals.map(function(v){return '<option value="'+esc(v)+'">'+esc(v)+'</option>';}).join(''); }
  

/* =========================================================
 * SETTINGS BLOCK: options
 * ========================================================= */
function options(vals,placeholder,current){
    var seen={}, out=[]; (vals||[]).forEach(function(v){ v=clean(v); if(v&&!seen[v]){ seen[v]=1; out.push(v); } });
    out.sort(function(a,b){ return a.localeCompare(b,'ru'); });
    var h='<option value="">'+esc(placeholder)+'</option>';
    out.forEach(function(v){ h+='<option value="'+esc(v)+'"'+(v===current?' selected':'')+'>'+esc(v)+'</option>'; });
    return h;
  }
  

/* =========================================================
 * SETTINGS BLOCK: window.epSaveAiConfig
 * ========================================================= */
window.epSaveAiConfig = async function (withTest) {
        if (!appUser || appUser.role !== 'admin') {
            showToast('Только админ меняет API');
            return;
        }

        const provider = epCurrentProvider();
        const geminiKey = epCleanText(document.getElementById('ep-gemini-key-input')?.value || window.EP_AI_CONFIG.geminiKey || '');
        const openaiKey = epCleanText(document.getElementById('ep-openai-key-input')?.value || window.EP_AI_CONFIG.openaiKey || '');
        const model = epCleanText(document.getElementById('ep-openai-model-input')?.value || 'gpt-4o-mini');

        const keyToTest = provider === 'openai' ? openaiKey : geminiKey;

        try {
            if (withTest) {
                showLoader('Проверяю API...', '🤖');
                await epTestProviderKey(provider, keyToTest, model);
            }

            window.EP_AI_CONFIG = { provider: provider, geminiKey: geminiKey, openaiKey: openaiKey, openaiModel: model };
            safeSet('ep_ai_provider_v1', provider);
            safeSet('ep_gemini_key_v1', geminiKey);
            safeSet('ep_openai_key_v1', openaiKey);
            safeSet('ep_openai_model_v1', model);

            if (geminiKey && typeof GEMINI_API_KEY !== 'undefined') GEMINI_API_KEY = geminiKey;

            if (db) {
                await db.collection('settings').doc('ai_config').set({
                    provider: provider,
                    geminiKey: geminiKey,
                    openaiKey: openaiKey,
                    openaiModel: model,
                    updatedAt: new Date().toISOString(),
                    updatedBy: appUser.uid || null
                }, { merge: true });

                await db.collection('settings').doc('global_api').set({
                    provider: provider,
                    geminiKey: geminiKey,
                    openaiKey: openaiKey,
                    openaiModel: model,
                    updatedAt: new Date().toISOString()
                }, { merge: true });

                try {
                    const usersSnap = await db.collection('users').get();
                    const batch = db.batch();
                    usersSnap.forEach(function (doc) {
                        batch.set(doc.ref, {
                            aiProvider: provider,
                            geminiKey: geminiKey,
                            openaiKey: openaiKey,
                            openaiModel: model
                        }, { merge: true });
                    });
                    await batch.commit();
                } catch (e) {
                    console.warn('Не удалось разослать по users:', e);
                }
            }

            hideLoader();
            epRefreshProviderUI();
            showToast('✅ API проверен и отправлен мастерам');
        } catch (e) {
            hideLoader();
            showToast('❌ ' + (e.message || 'Ошибка API'));
        }
    };

/* =========================================================
 * SETTINGS BLOCK: window.epAdminResolveDbProposal
 * ========================================================= */
window.epAdminResolveDbProposal = async function (id, mode) {
        if (!db || !appUser || appUser.role !== 'admin') return;
        showLoader('Обработка заявки...', '🌍');
        try {
            const ref = db.collection('db_proposals').doc(id);
            const doc = await ref.get();
            if (!doc.exists) throw new Error('Заявка не найдена');
            const d = doc.data();

            if (mode !== 'reject') {
                const type = d.type || 'mat';
                let items = (d.items || []).map(function (x) {
                    return Object.assign({}, x, mode === 'names' ? { p: 0 } : {});
                });
                let arr = epCurrentDb(type).slice();
                items.forEach(function (it) {
                    const idx = arr.findIndex(x => epSameItem(x, it));
                    if (idx >= 0) arr[idx] = Object.assign({}, arr[idx], it, { id: arr[idx].id || it.id });
                    else arr.push(it);
                });
                epSetCurrentDb(type, arr);
                await epSaveGlobalDb();
                renderDbEditors();
            }

            await ref.set({
                status: mode === 'reject' ? 'rejected' : 'approved',
                decision: mode,
                decidedAt: new Date().toISOString(),
                decidedBy: appUser.uid || ''
            }, { merge: true });

            hideLoader();
            showToast(mode === 'reject' ? 'Заявка отклонена' : '✅ Добавлено в базу сервера');
        } catch(e) {
            hideLoader();
            showToast('❌ ' + (e.message || 'Ошибка'));
        }
    };

/* =========================================================
 * SETTINGS BLOCK: window.finishLoginSetup
 * ========================================================= */
window.finishLoginSetup = async function () {
        if (typeof epOldFinishLoginSetup === 'function') epOldFinishLoginSetup();
        epPatchSettingsUI();
        epInsertMainProviderSwitch();
        epInsertDbTools();
        epMakeAiMenuGroup();
        epAddBetaLabels();
        await epLoadAiConfigFromServer();
        await epLoadUserDbAfterLogin();
        epListenDbProposals();
    };

/* =========================================================
 * SETTINGS BLOCK: window.userMatDB
 * ========================================================= */
window.userMatDB = fixArr(window.userMatDB || []); } catch(e){}
  

/* =========================================================
 * SETTINGS BLOCK: window.userWorkDB
 * ========================================================= */
window.userWorkDB = EP_MY_WORK;
      if(scope()==='global'){ matDB = EP_SERVER_MAT.slice(); workDB = EP_SERVER_WORK.slice(); }
      

/* =========================================================
 * SETTINGS BLOCK: window.epCreateMasterDb
 * ========================================================= */
window.epCreateMasterDb = async function(){
    try{ localStorage.setItem(LS_MASTER_CREATED,'1'); localStorage.setItem(LS_SCOPE,'my'); }catch(e){}
    EP_MY_MAT = arrLS(LS_MY_MAT);
    EP_MY_WORK = arrLS(LS_MY_WORK);
    setLS(LS_MY_MAT, EP_MY_MAT);
    setLS(LS_MY_WORK, EP_MY_WORK);
    syncWindowCaches();
    await epSaveMyDbToServer();
    renderDbEditors();
    toast('✅ Своя база создана. Добавление и импорт идут в мою базу без админа.');
  };

/* =========================================================
 * SETTINGS BLOCK: window.epOpenAdminServerDbFromSettings
 * ========================================================= */
window.epOpenAdminServerDbFromSettings = function(){
    if(!isAdmin()) return toast('Только админ может редактировать базу сервера');
    window.EP_ADMIN_SERVER_DB_EDIT = true;
    window.EP_OPENING_ADMIN_SERVER_DB = true;
    try{ localStorage.setItem('ep_db_scope_v2','global'); }catch(e){}
    try{ if(typeof openModal === 'function') openModal('settModal'); }catch(e){ var m=$('settModal'); if(m)m.style.display='flex'; }
    setTimeout(function(){
      setScope('global');
      window.EP_OPENING_ADMIN_SERVER_DB = false;
      patchDbUi();
      toast('👑 Включён режим админа: можно менять базу сервера');
    },120);
  };

/* =========================================================
 * SETTINGS BLOCK: window.epV15BuildLinesFromConfig
 * ========================================================= */
window.epV15BuildLinesFromConfig = function(){
    var lines=[]; function val(id){ var e=$(id); return e?e.value:''; } function chk(id){ var e=$(id); return !!(e&&e.checked); }
    function add(name,nom,group){ lines.push({name:name,nominal:nom,group:group}); }
    function room(label,count,wet){ count=Number(count)||0; for(var i=1;i<=count;i++){ var n=count>1?label+' '+i:label; add(n+' розетки','C16',wet?'wet':'power'); add(n+' свет','C10','light'); } }
    try{ room('Кухня',window.cfg&&cfg.kits,false); room('Ванная',window.cfg&&cfg.baths,true); room('Туалет',window.cfg&&cfg.toilets,true); room('Комната',window.cfg&&cfg.rms,false); room('Балкон',window.cfg&&cfg.bals,false); }catch(e){}
    if(chk('c-apron')) add('Фартук кухни','C16','power'); if(chk('c-dish')) add('Посудомойка','C10','power'); if(chk('c-washer')) add('Стиралка/сушилка','C10','wet'); if(chk('c-towel')) add('Полотенцесушитель','C10','wet');
    var acs=(window.cfg&&Number(cfg.acs))||0, fls=(window.cfg&&Number(cfg.fls))||0; for(var a=1;a<=acs;a++) add('Кондиционер '+a,'C10','climate'); for(var f=1;f<=fls;f++) add('Тёплый пол '+f,'C10','climate');
    if(chk('c-fridge')) add('Холодильник, неотключаемая группа','C10','alwaysOn'); if(chk('c-neptun')) add('Нептун, неотключаемая группа','C10','alwaysOn'); if(chk('c-router')) add('Роутер, неотключаемая группа','C6','alwaysOn');
    if(val('c-hob-power')==='6') add('Плита до 6 кВт','C25','heavy'); if(val('c-hob-power')==='10') add('Плита до 10 кВт','C32','heavy'); if(val('c-boiler-power')==='6') add('Бойлер до 6 кВт','C25','wet'); if(val('c-boiler-power')==='10') add('Бойлер до 10 кВт','C32','wet');
    return lines;
  };
