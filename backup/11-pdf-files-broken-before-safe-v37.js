/*
 * Electric PRO Refactor
 * Module: 11-pdf-files.js
 * V37: PDF / печать / экспорт файлов.
 *
 * Важно:
 * - переносим только полноценные function / async function;
 * - window.* куски пока не переносим;
 * - 00-core.js временно остаётся стабильным runtime;
 * - окончательная чистка будет позже.
 */

console.log("11-pdf-files.js V37 loaded");



/* =========================================================
 * PDF FUNCTION: confirmLogout
 * ========================================================= */
function confirmLogout() { 
    if(auth) auth.signOut(); 
    safeSet('authUser_v31_pin', ''); 
    window.location.reload(); 
}



/* =========================================================
 * PDF FUNCTION: finishLoginSetup
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
 * PDF FUNCTION: saveQRs
 * ========================================================= */
function saveQRs() { 
    safeSet('qr_tg_v31', document.getElementById('qr-tg').value); 
    safeSet('qr_wa_v31', document.getElementById('qr-wa').value); 
    safeSet('qr_vk_v31', document.getElementById('qr-vk').value);
    safeSet('ai_shops_v31', document.getElementById('ai-shops').value); 
    showToast("📱 Настройки сохранены"); 
}



/* =========================================================
 * PDF FUNCTION: getPDFHeader
 * ========================================================= */
function getPDFHeader(title) { 
    return `<div class="pdf-header"><h1>${title}</h1><p>Заказчик: <b>${cust.name}</b> | Объект: ${cust.addr}</p></div>`; 
}



/* =========================================================
 * PDF FUNCTION: showPreview
 * ========================================================= */
function showPreview(mode, isActOverride = false, customTitle = null) { 
    currentPreviewMode = mode;
    let title = customTitle || (mode==='vendor' ? 'СПИСОК ПОСТАВЩИКУ' : (mode==='details' ? 'ДЕТАЛИЗАЦИЯ ЩИТА' : 'СМЕТА ОБЪЕКТA'));
    let html = getPDFHeader(title); 
    
    if (mode === 'client' || isActOverride) {
        document.getElementById('pdf-filters').style.display = 'block';
        
        let c1 = document.getElementById('pdf-cb-1').checked;
        let c2 = document.getElementById('pdf-cb-2').checked;
        let c3 = document.getElementById('pdf-cb-3').checked;
        let c4 = document.getElementById('pdf-cb-4').checked;

        let totalSum = 0;
        
        if (c1) {
            let items = currentEstimate.filter(i => categorizeEstimateItem(i) === 1);
            if(items.length > 0) {
                let grpSum = 0;
                html += '<h3 style="color:#10B981; font-size:14px; margin-bottom:10px;">1. МАТЕРИАЛЫ</h3><table class="pdf-table"><tr><th>Наименование</th><th style="text-align:center;">Кол-во</th><th style="text-align:right;">Сумма</th></tr>';
                items.forEach(it => { let s = fPrice(it)*it.q; grpSum += s; totalSum += s; html += `<tr><td>${it.n}</td><td style="text-align:center;">${it.q}</td><td style="text-align:right;">${s} Р</td></tr>`; });
                html += `<tr><td colspan="3" style="text-align:right; font-weight:bold; color:#10B981;">Итого материалы: ${grpSum} Р</td></tr></table>`;
            }
        }
        if (c2) {
            let items = currentEstimate.filter(i => categorizeEstimateItem(i) === 2);
            if(items.length > 0) {
                let grpSum = 0;
                html += '<h3 style="color:#F59E0B; font-size:14px; margin-bottom:10px; margin-top:20px;">2. ШТРОБЛЕНИЕ И РЕЗКА</h3><table class="pdf-table"><tr><th>Наименование</th><th style="text-align:center;">Кол-во</th><th style="text-align:right;">Сумма</th></tr>';
                items.forEach(it => { let s = fPrice(it)*it.q; grpSum += s; totalSum += s; html += `<tr><td>${it.n}</td><td style="text-align:center;">${it.q}</td><td style="text-align:right;">${s} Р</td></tr>`; });
                html += `<tr><td colspan="3" style="text-align:right; font-weight:bold; color:#F59E0B;">Итого штробление: ${grpSum} Р</td></tr></table>`;
            }
        }
        if (c3) {
            let items = currentEstimate.filter(i => categorizeEstimateItem(i) === 3);
            if(items.length > 0) {
                let grpSum = 0;
                html += '<h3 style="color:#64748B; font-size:14px; margin-bottom:10px; margin-top:20px;">3. ЧЕРНОВАЯ ЭЛЕКТРИКА</h3><table class="pdf-table"><tr><th>Наименование</th><th style="text-align:center;">Кол-во</th><th style="text-align:right;">Сумма</th></tr>';
                items.forEach(it => { let s = fPrice(it)*it.q; grpSum += s; totalSum += s; html += `<tr><td>${it.n}</td><td style="text-align:center;">${it.q}</td><td style="text-align:right;">${s} Р</td></tr>`; });
                html += `<tr><td colspan="3" style="text-align:right; font-weight:bold; color:#64748B;">Итого черновая: ${grpSum} Р</td></tr></table>`;
            }
        }
        if (c4) {
            let items = currentEstimate.filter(i => categorizeEstimateItem(i) === 4);
            if(items.length > 0) {
                let grpSum = 0;
                html += '<h3 style="color:#3B82F6; font-size:14px; margin-bottom:10px; margin-top:20px;">4. ЧИСТОВАЯ ЭЛЕКТРИКА</h3><table class="pdf-table"><tr><th>Наименование</th><th style="text-align:center;">Кол-во</th><th style="text-align:right;">Сумма</th></tr>';
                items.forEach(it => { let s = fPrice(it)*it.q; grpSum += s; totalSum += s; html += `<tr><td>${it.n}</td><td style="text-align:center;">${it.q}</td><td style="text-align:right;">${s} Р</td></tr>`; });
                html += `<tr><td colspan="3" style="text-align:right; font-weight:bold; color:#3B82F6;">Итого чистовая: ${grpSum} Р</td></tr></table>`;
            }
        }
        
        let extras = currentEstimate.filter(i => i.tag === 'extra');
        if(extras.length > 0) {
            let grpSum = 0;
            html += '<h3 style="color:#EF4444; font-size:14px; margin-bottom:10px; margin-top:20px;">ДОПОЛНИТЕЛЬНЫЕ РАБОТЫ</h3><table class="pdf-table"><tr><th>Наименование</th><th style="text-align:center;">Кол-во</th><th style="text-align:right;">Сумма</th></tr>';
            extras.forEach(it => { let s = fPrice(it)*it.q; grpSum += s; totalSum += s; html += `<tr><td>${it.n}</td><td style="text-align:center;">${it.q}</td><td style="text-align:right;">${s} Р</td></tr>`; });
            html += `<tr><td colspan="3" style="text-align:right; font-weight:bold; color:#EF4444;">Итого доп. работы: ${grpSum} Р</td></tr></table>`;
        }

        html += `<h2 style="text-align:right; margin-top:20px; color:var(--text); font-size:18px;">ИТОГО (ВЫБРАННОЕ): ${totalSum} Р</h2>`;

    } else {
        document.getElementById('pdf-filters').style.display = 'none';
        if(mode === 'details') {
            if (typeof epV15NormalizeCurrentEstimate === 'function') epV15NormalizeCurrentEstimate();
            let shieldItems = currentEstimate.filter(it => typeof epV15IsShieldDevice === 'function' ? epV15IsShieldDevice(it) : (it.n.includes('Автомат') || it.n.includes('ДИФ') || it.n.includes('УЗО') || it.n.includes('Реле')));
            html += '<table class="pdf-table"><tr><th>Что отвечает / линия</th><th>Аппарат</th><th>Назначение</th></tr>';
            if (!shieldItems.length) {
                html += '<tr><td colspan="3" style="text-align:center;color:var(--gray);font-weight:bold;">Щит ещё не сгенерирован</td></tr>';
            } else {
                shieldItems.forEach(it => {
                    let lines = typeof epV15GetAssignments === 'function' ? epV15GetAssignments(it) : [];
                    if (!lines.length) lines = ['назначение не указано — пересобери щит'];
                    let purpose = typeof epV15Purpose === 'function' ? epV15Purpose(it) : 'аппарат щита';
                    html += `<tr><td style="font-weight:bold; color:var(--primary);">${lines.map(x => String(x||'')).join('<br>')}</td><td>${it.n}${Number(it.q)>1 ? ' × '+Number(it.q) : ''}</td><td>${purpose}</td></tr>`;
                });
            }
            html += '</table>';
        } 
        else if(mode === 'vendor') {
            let matsFinishWords = ['розетк', 'выключател', 'рамк', 'светильник', 'терморег', 'механизм', 'люстр', 'бра', 'диммер'];
            let matsOnly = currentEstimate.filter(it => it.type === 'mat');
            let matsFinish = matsOnly.filter(it => matsFinishWords.some(w => it.n.toLowerCase().includes(w)));
            let matsRough = matsOnly.filter(it => !matsFinishWords.some(w => it.n.toLowerCase().includes(w)));
            html += '<h3 style="color:var(--primary); font-size:14px; margin-bottom:10px;">ЧЕРНОВЫЕ МАТЕРИАЛЫ</h3><table class="pdf-table"><tr><th>Наименование материала</th><th style="text-align:center;">Кол-во</th></tr>';
            matsRough.forEach(it => html += `<tr><td>${it.n}</td><td style="text-align:center; font-weight:bold;">${it.q}</td></tr>`); html += '</table>';
            if (matsFinish.length > 0) {
                html += '<h3 style="color:var(--success); font-size:14px; margin-bottom:10px; margin-top:20px;">ЧИСТОВАЯ ЭЛЕКТРИКА</h3><table class="pdf-table"><tr><th>Наименование</th><th style="text-align:center;">Кол-во</th></tr>';
                matsFinish.forEach(it => html += `<tr><td>${it.n}</td><td style="text-align:center; font-weight:bold;">${it.q}</td></tr>`); html += '</table>';
            }
        }
    }
    
    let tgLink = document.getElementById('qr-tg').value; 
    let waLink = document.getElementById('qr-wa').value;
    let vkLink = document.getElementById('qr-vk').value;
    
    if(mode === 'client' && (tgLink || waLink || vkLink)) {
        html += `<div class="pdf-footer" style="display:flex; justify-content:space-between; align-items:flex-end; border-top:2px solid #e2e8f0; padding-top:15px; margin-top:20px;"><div><p style="margin:0; font-weight:bold; color:var(--primary);">ИСПОЛНИТЕЛЬ:</p><p style="margin:5px 0;">ФИО: ${appUser?.name}</p></div><div class="qr-codes" style="display:flex; gap:15px;">`;
        if(waLink) html += `<div class="qr-box" style="text-align:center;"><img src="https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${encodeURIComponent(waLink)}"><br>WhatsApp</div>`;
        if(tgLink) html += `<div class="qr-box" style="text-align:center;"><img src="https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${encodeURIComponent(tgLink)}"><br>Telegram</div>`;
        if(vkLink) html += `<div class="qr-box" style="text-align:center;"><img src="https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${encodeURIComponent(vkLink)}"><br>Сайт / VK</div>`;
        html += `</div></div>`;
    }
    
    document.getElementById('p-cont').innerHTML = html; 
    openModal('previewModal'); 
}



/* =========================================================
 * PDF FUNCTION: refreshPreview
 * ========================================================= */
function refreshPreview() { showPreview(currentPreviewMode); }



/* =========================================================
 * PDF FUNCTION: printAct
 * ========================================================= */
function printAct() {
    if(!currentCardId) return;
    let obj = hDB.find(x => x.id === currentCardId);
    if(!obj) return;
    
    let tempEstimate = currentEstimate;
    let tempCust = cust;
    
    currentEstimate = obj.estimate || [];
    cust = { name: obj.name, addr: obj.addr, phone: obj.phone };
    
    showPreview('client', true, 'АКТ ВЫПОЛНЕННЫХ РАБОТ');
    
    currentEstimate = tempEstimate;
    cust = tempCust;
}



/* =========================================================
 * PDF FUNCTION: epEscape
 * ========================================================= */
function epEscape(s) {
        return String(s ?? '').replace(/[&<>"']/g, function (m) {
            return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[m];
        });
    }

    function epNormProvider(p) {
        return p === 'openai' ? 'openai' : 'gemini';
    }

    function epCurrentProvider() {
        return epNormProvider(window.EP_AI_CONFIG.provider || safeGet('ep_ai_provider_v1', 'gemini'));
    }

    function epCurrentKey() {
        const p = epCurrentProvider();
        if (p === 'openai') return window.EP_AI_CONFIG.openaiKey || safeGet('ep_openai_key_v1', '');
        return window.EP_AI_CONFIG.geminiKey || (typeof GEMINI_API_KEY !== 'undefined' ? GEMINI_API_KEY : '') || safeGet('gemini_key_v31', '');
    }

    function epSetAiProvider(provider, saveRemote) {
        provider = epNormProvider(provider);
        window.EP_AI_CONFIG.provider = provider;
        safeSet('ep_ai_provider_v1', provider);
        epRefreshProviderUI();

        if (saveRemote && db && appUser && appUser.role === 'admin') {
            epSaveAiConfig(false);
        } else if (saveRemote && appUser && appUser.role !== 'admin') {
            showToast('ИИ-провайдер: ' + (provider === 'openai' ? 'OpenAI' : 'Gemini'));
        }
    }

    window.epSetAiProvider = epSetAiProvider;

    function epRefreshProviderUI() {
        const p = epCurrentProvider();

        document.querySelectorAll('input[name="ep-ai-provider-main"], input[name="ep-ai-provider-admin"]').forEach(function (r) {
            r.checked = (r.value === p);
        });

        document.querySelectorAll('.ep-ai-choice').forEach(function (el) {
            const input = el.querySelector('input');
            el.classList.toggle('active', input && input.value === p);
        });

        const label = p === 'openai' ? 'OpenAI' : 'Gemini';
        const state = document.getElementById('ep-main-ai-state');
        if (state) state.innerText = 'Активный ИИ: ' + label;

        const masterInfo = document.getElementById('ep-ai-master-info');
        if (masterInfo) masterInfo.innerText = 'ИИ подключён администратором: ' + label;
    }

    window.epRefreshProviderUI = epRefreshProviderUI;

    function epInsertMainProviderSwitch() {
        if (document.getElementById('ep-main-ai-switch')) return;

        const header = document.querySelector('#main-app .header');
        if (!header) return;

        const box = document.createElement('div');
        box.id = 'ep-main-ai-switch';
        box.innerHTML = `
            <label class="ep-ai-choice">
                <input type="radio" name="ep-ai-provider-main" value="gemini" onchange="epSetAiProvider('gemini', true)">
                Gemini
            </label>
            <label class="ep-ai-choice">
                <input type="radio" name="ep-ai-provider-main" value="openai" onchange="epSetAiProvider('openai', true)">
                OpenAI
            </label>
            <div id="ep-main-ai-state">Активный ИИ</div>
        `;

        header.parentNode.insertBefore(box, header.nextSibling);
    }

    function epMakeAiMenuGroup() {
        const menu = document.getElementById('burger-menu');
        if (!menu || document.getElementById('ep-ai-functions-group')) return;

        const aiButtons = Array.from(menu.querySelectorAll('button')).filter(function (b) {
            const t = epCleanText(b.textContent);
            return t.includes('ИИ-Анализ') || t.includes('ИИ-Снабженец') || t.includes('ИИ-Помощник') || t.includes('ИИ-Сравнение');
        });

        if (!aiButtons.length) return;

        const wrap = document.createElement('div');
        wrap.id = 'ep-ai-functions-group';
        wrap.innerHTML = `
            <button id="ep-ai-functions-btn" type="button">✨ ИИ Функции <span class="ep-beta-label">(бета)</span></button>
            <div id="ep-ai-functions-panel"></div>
        `;

        aiButtons[0].parentNode.insertBefore(wrap, aiButtons[0]);
        const panel = wrap.querySelector('#ep-ai-functions-panel');

        aiButtons.forEach(function (b) {
            panel.appendChild(b);
        });

        wrap.querySelector('#ep-ai-functions-btn').addEventListener('click', function (e) {
            e.preventDefault();
            e.stopPropagation();
            wrap.classList.toggle('open');
        });
    }

    function epAddBetaLabels() {
        Array.from(document.querySelectorAll('button')).forEach(function (b) {
            const t = epCleanText(b.textContent);
            if (t.includes('Конфигуратор щита') && !t.includes('бета')) {
                b.innerHTML = b.innerHTML.replace('Конфигуратор щита', 'Конфигуратор щита <span class="ep-beta-label">(бета)</span>');
            }
            if (t.includes('Пул розеток') && !t.includes('бета')) {
                b.innerHTML = b.innerHTML.replace(/Пул розеток и\s*В?\S?M|Пул розеток и BIM|Пул розеток и ВІM/iu, 'Пул розеток и BIM <span class="ep-beta-label">(бета)</span>');
            }
        });
    }

    // === SETTINGS / API SYNC ===
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

    window.epClearLocalAiKeys = function () {
        safeSet('gemini_key_v31', '');
        safeSet('ep_openai_key_v1', '');
        safeSet('ep_gemini_key_v1', '');
        if (typeof GEMINI_API_KEY !== 'undefined') GEMINI_API_KEY = '';
        if (document.getElementById('api-key-input')) document.getElementById('api-key-input').value = '';
        if (document.getElementById('ep-gemini-key-input')) document.getElementById('ep-gemini-key-input').value = '';
        if (document.getElementById('ep-openai-key-input')) document.getElementById('ep-openai-key-input').value = '';
        showToast('Старые локальные ключи очищены');
    };

    async function epTestProviderKey(provider, key, model) {
        provider = epNormProvider(provider);
        if (!key) throw new Error('Введите API-ключ');

        if (provider === 'openai') {
            const r = await fetch('https://api.openai.com/v1/responses', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + key },
                body: JSON.stringify({
                    model: model || 'gpt-4o-mini',
                    input: [{ role: 'user', content: [{ type: 'input_text', text: 'Ответь одним словом: ok' }] }],
                    max_output_tokens: 20
                })
            });
            const data = await r.json();
            if (!r.ok || data.error) throw new Error(data.error ? data.error.message : 'OpenAI API error');
            return true;
        }

        const url = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=' + encodeURIComponent(key);
        const r = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ contents: [{ parts: [{ text: 'Ответь одним словом: ok' }] }] })
        });
        const data = await r.json();
        if (!r.ok || data.error) throw new Error(data.error ? data.error.message : 'Gemini API error');
        return true;
    }

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

    window.saveApiKey = async function (val) {
        if (!appUser || appUser.role !== 'admin') {
            showToast('API вводит только админ');
            return;
        }
        epPatchSettingsUI();
        const input = document.getElementById('ep-gemini-key-input');
        if (input) input.value = val || '';
        window.EP_AI_CONFIG.provider = 'gemini';
        epSetAiProvider('gemini', false);
        await epSaveAiConfig(true);
    };

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

    // === AI PROVIDER CALLS ===
    async function epCallGemini(promptText, opts) {
        const key = window.EP_AI_CONFIG.geminiKey || (typeof GEMINI_API_KEY !== 'undefined' ? GEMINI_API_KEY : '') || safeGet('gemini_key_v31', '');
        if (!key) throw new Error('Нужен Gemini API ключ');

        const parts = [{ text: promptText }];
        if (opts && opts.imageDataUrl) {
            const match = opts.imageDataUrl.match(/^data:(.*?);base64,(.*)$/);
            if (match) parts.push({ inline_data: { mime_type: match[1], data: match[2] } });
        }

        const url = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=' + encodeURIComponent(key);
        const r = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ contents: [{ parts: parts }] })
        });
        const data = await r.json();
        if (!r.ok || data.error) throw new Error(data.error ? data.error.message : 'Gemini API error');
        return (((data.candidates || [])[0] || {}).content || {}).parts?.map(p => p.text || '').join('') || '';
    }

    function epExtractOpenAiText(data) {
        if (data.output_text) return data.output_text;
        let out = '';
        (data.output || []).forEach(function (item) {
            (item.content || []).forEach(function (c) {
                if (c.text) out += c.text;
                if (c.type === 'output_text' && c.text) out += c.text;
            });
        });
        return out;
    }

    async function epCallOpenAI(promptText, opts) {
        const key = window.EP_AI_CONFIG.openaiKey || safeGet('ep_openai_key_v1', '');
        if (!key) throw new Error('Нужен OpenAI API ключ');

        const content = [{ type: 'input_text', text: promptText }];
        if (opts && opts.imageDataUrl) {
            content.push({
                type: 'input_image',
                image_url: opts.imageDataUrl,
                detail: (opts && opts.imageDetail) ? opts.imageDetail : 'high'
            });
        }

        const body = {
            model: window.EP_AI_CONFIG.openaiModel || 'gpt-4o-mini',
            input: [{ role: 'user', content: content }],
            max_output_tokens: opts && opts.maxTokens ? opts.maxTokens : 5000
        };

        const r = await fetch('https://api.openai.com/v1/responses', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + key },
            body: JSON.stringify(body)
        });
        const data = await r.json();
        if (!r.ok || data.error) throw new Error(data.error ? data.error.message : 'OpenAI API error');
        return epExtractOpenAiText(data);
    }

    async function epAskAI(promptText, opts) {
        await epLoadAiConfigFromServer();
        const provider = epCurrentProvider();
        if (provider === 'openai') return epCallOpenAI(promptText, opts || {});
        return epCallGemini(promptText, opts || {});
    }

    window.epAskAI = epAskAI;

    function epStripCode(t) {
        return (t || '').replace(/```json/gi, '').replace(/```html/gi, '').replace(/```javascript/gi, '').replace(/```js/gi, '').replace(/```[a-z]*/gi, '').replace(/```/g, '').trim();
    }

    function epTryJsonParseLoose(t) {
        if (!t) return null;
        let s = epStripCode(String(t));
        s = s.replace(/[“”]/g, '"').replace(/[‘’]/g, "'");
        s = s.replace(/,\s*([}\]])/g, '$1');
        try { return JSON.parse(s); } catch(e) {}
        const arr = s.match(/\[[\s\S]*\]/);
        if (arr) {
            try { return JSON.parse(arr[0].replace(/,\s*([}\]])/g, '$1')); } catch(e) {}
        }
        const obj = s.match(/\{[\s\S]*\}/);
        if (obj) {
            try { return JSON.parse(obj[0].replace(/,\s*([}\]])/g, '$1')); } catch(e) {}
        }
        return null;
    }

    function epParseLooseTableText(t, type) {
        const lines = epStripCode(t).split(/\r?\n/).map(x => x.trim()).filter(Boolean);
        const out = [];
        lines.forEach(function(line) {
            if (/^(№|номер|код|артикул|итого|сумма|json|категория)/i.test(line)) return;
            let s = line.replace(/[|;]/g, '\t').replace(/\s{2,}/g, '\t');
            const parts = s.split(/\t+/).map(x => x.trim()).filter(Boolean);
            const unitIdx = parts.findIndex(x => /^(шт|м|м2|м²|м3|м³|упак|уп|компл|кг|л)$/i.test(x));
            if (unitIdx > 0) {
                let nameParts = parts.slice(0, unitIdx).filter(x => !/^\d+$/.test(x) && !/^[A-ZА-Я0-9\-.]{3,15}$/i.test(x));
                let name = nameParts.join(' ').trim();
                let nums = parts.slice(unitIdx + 1).map(epMoney).filter(n => n > 0);
                let p = nums.length ? nums[0] : 0;
                if (name.length > 3) out.push({ c: epInferCategory(name, type), n: name, p: p, u: parts[unitIdx] });
            } else {
                const nums = line.match(/\d+[\d\s]*[,.]?\d*/g) || [];
                if (nums.length && line.length > 8) {
                    let p = epMoney(nums[nums.length - 1]);
                    let name = line.replace(/^[\d\s.№-]+/, '').replace(/\d+[\d\s]*[,.]?\d*\s*$/, '').trim();
                    if (name.length > 4) out.push({ c: epInferCategory(name, type), n: name, p: p, u: 'шт' });
                }
            }
        });
        return out;
    }
    function epExtractJsonObjectsLoose(t) {
        const s = epStripCode(String(t || '')).replace(/[“”]/g, '"').replace(/[‘’]/g, "'");
        const out = [];
        let depth = 0, start = -1, inStr = null, esc = false;

        for (let i = 0; i < s.length; i++) {
            const ch = s[i];
            if (inStr) {
                if (esc) esc = false;
                else if (ch === '\\') esc = true;
                else if (ch === inStr) inStr = null;
                continue;
            }
            if (ch === '"' || ch === "'") { inStr = ch; continue; }
            if (ch === '{') {
                if (depth === 0) start = i;
                depth++;
            } else if (ch === '}') {
                depth--;
                if (depth === 0 && start >= 0) {
                    const piece = s.slice(start, i + 1).replace(/,\s*([}\]])/g, '$1');
                    try { out.push(JSON.parse(piece)); } catch(e) {}
                    start = -1;
                }
            }
        }
        return out;
    }

    function epParseJsonArray(t) {
        const parsed = epTryJsonParseLoose(t);
        if (Array.isArray(parsed)) return parsed;
        if (parsed && typeof parsed === 'object') {
            const keys = ['items', 'positions', 'rows', 'data', 'result', 'materials', 'works', 'материалы', 'работы', 'позиции'];
            for (const k of keys) {
                if (Array.isArray(parsed[k])) return parsed[k];
            }
        }

        // Бывает, ИИ возвращает не массив, а цепочку объектов:
        // {"n":"..."},{"n":"..."},{"n":"..."}
        const objects = epExtractJsonObjectsLoose(t);
        if (objects.length) return objects;

        return epParseLooseTableText(t, 'mat');
    }

    // Override AI functions
    window.runAiCheck = async function () {
        showLoader('ИИ анализирует...', '🤖');
        try {
            const estNames = currentEstimate.map(i => i.n).join(', ');
            const promptText = 'Я электрик. Смета: ' + estNames + '. Найди логические ошибки: крепеж, рамки, УЗО, автоматы, коробки, расходники. Верни ТОЛЬКО JSON массив: [{"reason":"объяснение","suggestedName":"название"}]. Если всё идеально, верни [].';
            const txt = await epAskAI(promptText, { maxTokens: 2500 });
            const suggestions = epParseJsonArray(txt);
            hideLoader();

            if (!suggestions.length) return showToast('✨ Всё идеально! Смета полная.');

            document.getElementById('ai-modal-title').innerText = '✨ ИИ-Аналитика';
            document.getElementById('ai-suggestions').innerHTML = suggestions.map(function (s) {
                return `<div style="background:var(--bg); padding:12px; border-radius:10px; margin-bottom:10px; border-left:4px solid var(--ai);">
                    <div style="font-weight:800;">${epEscape(s.reason || '')}</div>
                    <div style="font-size:12px; color:var(--gray); margin-top:5px;">Совет: ${epEscape(s.suggestedName || '')}</div>
                </div>`;
            }).join('');
            openModal('aiModal');
        } catch (e) {
            hideLoader();
            showToast('❌ ' + (e.message || 'Сбой ИИ'));
        }
    };

    window.aiSupply = async function () {
        showLoader('ИИ формирует закупку...', '🤖');
        try {
            const mats = currentEstimate.filter(i => i.type === 'mat').map(i => `${i.n} - ${i.q} ${i.u || ''}`).join(', ');
            const txt = await epAskAI('Смета материалов: ' + mats + '. Раздели на категории для закупки. Верни чистый HTML: <h3>, <ul>, <li>, <b>.', { maxTokens: 2500 });
            hideLoader();
            document.getElementById('ai-modal-title').innerText = '📦 ИИ-Снабженец';
            document.getElementById('ai-suggestions').innerHTML = `<div style="font-size:13px; line-height:1.5;">${epStripCode(txt)}</div>`;
            openModal('aiModal');
        } catch(e) { hideLoader(); showToast('❌ ' + (e.message || 'Сбой ИИ')); }
    };

    window.aiPueHelper = async function () {
        showLoader('ИИ думает...', '🤖');
        try {
            const txt = await epAskAI('Смета: ' + currentEstimate.map(i => i.n).join(', ') + '. Какие нормы ПУЭ и практические замечания нужны? Кратко в HTML.', { maxTokens: 2500 });
            hideLoader();
            document.getElementById('ai-modal-title').innerText = '📚 ПУЭ Справка';
            document.getElementById('ai-suggestions').innerHTML = `<div style="font-size:13px; line-height:1.5;">${epStripCode(txt)}</div>`;
            openModal('aiModal');
        } catch(e) { hideLoader(); showToast('❌ ' + (e.message || 'Сбой ИИ')); }
    };

    window.compareShopsAI = async function () {
        showLoader('Сравнение цен...', '🤖');
        try {
            let shops = document.getElementById('ai-shops')?.value || 'Лемана ПРО, Петрович, ВсеИнструменты';
            const txt = await epAskAI('Материалы: ' + currentEstimate.filter(i=>i.type==='mat').map(i=>i.n).join(', ') + '. Создай HTML таблицу с максимальными розничными ценами ГОСТ в магазинах: ' + shops + '. Верни только HTML.', { maxTokens: 3000 });
            hideLoader();
            document.getElementById('ai-modal-title').innerText = '🛒 Макс. Цены ГОСТ';
            document.getElementById('ai-suggestions').innerHTML = `<div style="overflow-x:auto;">${epStripCode(txt)}</div>`;
            openModal('aiModal');
        } catch(e) { hideLoader(); showToast('❌ ' + (e.message || 'Сбой ИИ')); }
    };

    // === DATABASE IMPORT / EXPORT / SERVER ===
    function epDbTypeLabel(type) { return type === 'work' ? 'работ' : 'материалов'; }
    function epCurrentDb(type) { return type === 'work' ? workDB : matDB; }
    function epSetCurrentDb(type, arr) { if (type === 'work') workDB = arr; else matDB = arr; }

    function epInferCategory(name, type) {
        const n = String(name || '').toLowerCase();
        if (type === 'work') {
            if (/штроб|борозд|резк|алмаз/.test(n)) return 'Штробление';
            if (/подрозет|розет|выключ|механизм|рамк|светильник/.test(n)) return 'Чистовая';
            if (/кабел|провод|гофр|труб|лоток|короб/.test(n)) return 'Черновая';
            if (/щит|автомат|узо|диф|реле/.test(n)) return 'Щит';
            return 'Работы';
        }
        if (/ввг|пуг|пвс|провод|кабел|cat|utp|ftp|sat|коаксиал/.test(n)) return 'Кабель';
        if (/гофр|труб|кабель.?канал|лоток|клипс|стяжк/.test(n)) return 'Трубы';
        if (/подрозет|короб|распред|клемм|wago|гмл|изол|саморез|дюбел|гвозд|площадк|баллон|наконечник/.test(n)) return 'Расходники';
        if (/автомат|узо|диф|реле|выключател[ья] автомат|щит|бокс|din|дин|шина|кросс/.test(n)) return 'Автоматика';
        if (/tv|тв|интернет|rj|utp|ftp|cat|слаботоч/.test(n)) return 'Слаботочка';
        if (/розет|выключ|рамк|механизм|диммер|терморег/.test(n)) return 'Чистовое';
        return 'Разное';
    }


    function epInferSubcategory(name, category, type) {
        const n = String(name || '').toLowerCase();
        const c = String(category || '').toLowerCase();
        if (type === 'work') {
            if (/штроб|борозд/.test(n)) return 'Штробление';
            if (/сверл|подрозет/.test(n)) return 'Подрозетники';
            if (/кабел|провод|проклад/.test(n)) return 'Прокладка кабеля';
            if (/щит|автомат|узо|диф/.test(n)) return 'Щит';
            if (/розет|выключ|механизм|рамк/.test(n)) return 'Чистовая установка';
            return 'Работы';
        }
        if (/ввг/.test(n)) return 'ВВГ';
        if (/пугв|пу ?гв|пв-?3/.test(n)) return 'ПУГВ';
        if (/cat|utp|ftp|rj|интернет/.test(n)) return 'UTP/FTP';
        if (/sat|tv|коаксиал|cavel|антенн/.test(n)) return 'TV/SAT';
        if (/подрозет/.test(n)) return 'Подрозетники';
        if (/короб|распред/.test(n)) return 'Коробки';
        if (/клемм|wago|гмл|наконечник|шина/.test(n)) return 'Клеммы/соединители';
        if (/стяжк|клипс|дюбел|саморез|гвозд|площадк|баллон/.test(n)) return 'Крепёж';
        if (/гофр|труб/.test(n)) return 'Трубы/гофра';
        if (/щит|бокс|шкаф|корпус/.test(n)) return 'Щиты/корпуса';
        if (/диф/.test(n)) return 'Дифавтоматы';
        if (/узо/.test(n)) return 'УЗО';
        if (/автомат|выключател[ья] автомат/.test(n)) return 'Автоматы';
        if (/розет/.test(n)) return 'Розетки';
        if (/выключ/.test(n)) return 'Выключатели';
        if (/рамк/.test(n)) return 'Рамки';
        if (/механизм|диммер|терморег/.test(n)) return 'Механизмы';
        if (c.includes('кабель')) return 'Кабель силовой';
        if (c.includes('расход')) return 'Прочие расходники';
        return 'Разное';
    }

    function epNormalizeItems(raw, type) {
        let arr = [];
        if (Array.isArray(raw)) arr = raw;
        else if (raw && typeof raw === 'object') {
            arr = raw.items || raw.positions || raw.rows || raw.data || raw.result || raw.materials || raw.works || raw['позиции'] || raw['материалы'] || raw['работы'] || [];
        }
        return arr.map(function (x, i) {
            if (Array.isArray(x)) {
                x = { n: x[1] || x[0], c: x[0], sc: x[2], p: x[3], u: x[4] };
            }

            const name = epCleanText(
                x.n || x.name || x.title || x.item || x.position || x.material || x.work || x.itemName ||
                x['Имя'] || x['Название'] || x['Наименование'] || x['Наименование позиции'] || x['Товар'] || x['Материал'] || x['Работа'] ||
                x['номенклатура'] || x['наименование'] || x['позиция'] || ''
            );

            const cat = epCleanText(
                x.c || x.cat || x.category || x.group ||
                x['Категория'] || x['Группа'] || x['категория'] || ''
            ) || epInferCategory(name, type);

            const subcat = epCleanText(
                x.sc || x.subcat || x.subcategory || x.subCategory || x.sub_group || x.section ||
                x['Подкатегория'] || x['Подраздел'] || x['Раздел'] || x['подкатегория'] || x['подраздел'] || ''
            ) || epInferSubcategory(name, cat, type);

            const unit = epCleanText(
                x.u || x.unit || x.measure || x.measurement ||
                x['Ед'] || x['Ед.'] || x['Ед. изм'] || x['Ед.изм.'] || x['Единица'] || x['Единица измерения'] || x['единица'] || x['ед'] || 'шт'
            ) || 'шт';

            const priceRaw = x.p || x.price || x.cost || x.unitPrice || x.unit_price ||
                x['Цена'] || x['Цена ₽'] || x['Цена руб'] || x['Цена за ед.'] || x['Цена за единицу'] || x['Стоимость'] || x['цена'] || 0;

            return {
                id: x.id || (type === 'work' ? 'w' : 'm') + '_ai_' + Date.now() + '_' + i,
                n: name,
                c: cat || 'Разное',
                sc: subcat || 'Разное',
                p: epMoney(priceRaw),
                u: unit
            };
        }).filter(function (x) { return x.n && x.n.length > 2; });
    }

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

    async function epSaveGlobalDb() {
        if (!db) return;
        await db.collection('settings').doc('global_db').set({ matDB: matDB, workDB: workDB, updatedAt: new Date().toISOString() }, { merge: true });
    }

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

    function epInsertDbTools() {
        if (document.getElementById('ep-db-ai-tools')) return;
        const tabs = document.querySelector('#settModal .tabs-container');
        if (!tabs) return;

        const box = document.createElement('div');
        box.id = 'ep-db-ai-tools';
        box.innerHTML = `
            <h3>🤖 Импорт / экспорт базы через ИИ</h3>
            <div class="ep-db-ai-grid">
                <button class="btn-info" onclick="epTriggerDbFileImport('mat')">📥 Материалы: Excel / JSON / фото / скрин</button>
                <button class="btn-work" onclick="epTriggerDbFileImport('work')">📥 Работы: Excel / JSON / фото / скрин</button>
                <button class="btn-vendor" onclick="epOpenTextImport('mat')">📝 Материалы из текста</button>
                <button class="btn-vendor" onclick="epOpenTextImport('work')">📝 Работы из текста</button>
                <button class="btn-success" onclick="epExportMyDb()">📤 Экспорт моей базы</button>
                <button class="btn-shield" onclick="epExportGlobalDb()">🌍 Экспорт базы сервера</button>
            </div>
        `;
        tabs.parentNode.insertBefore(box, tabs);
    }

    window.epTriggerDbFileImport = function (type) {
        window.EP_DB_REVIEW.type = type;
        const input = document.getElementById('ep-db-file-input');
        input.value = '';
        input.onchange = function (e) {
            const file = e.target.files && e.target.files[0];
            if (file) epReadDbFile(file, type);
        };
        input.click();
    };

    window.epOpenTextImport = function (type) {
        window.EP_DB_REVIEW.type = type;
        document.getElementById('ep-text-import-title').innerText = 'Импорт ' + epDbTypeLabel(type) + ' из текста';
        document.getElementById('ep-text-import-value').value = '';
        openModal('ep-text-import-modal');
    };

    window.epRunTextImport = async function () {
        const text = document.getElementById('ep-text-import-value').value;
        closeModal('ep-text-import-modal');
        await epAiNormalizeDbText(text, window.EP_DB_REVIEW.type, 'текст');
    };

    function epReadFileAsText(file) {
        return new Promise(function (resolve, reject) {
            const r = new FileReader();
            r.onload = function () { resolve(r.result); };
            r.onerror = reject;
            r.readAsText(file);
        });
    }

    function epReadFileAsDataURL(file) {
        return new Promise(function (resolve, reject) {
            const r = new FileReader();
            r.onload = function () { resolve(r.result); };
            r.onerror = reject;
            r.readAsDataURL(file);
        });
    }

    function epReadFileAsArrayBuffer(file) {
        return new Promise(function (resolve, reject) {
            const r = new FileReader();
            r.onload = function () { resolve(r.result); };
            r.onerror = reject;
            r.readAsArrayBuffer(file);
        });
    }



    function epIsEmptyCell(v) {
        return v === null || v === undefined || String(v).trim() === '';
    }

    function epCleanCell(v) {
        return epCleanText(String(v === null || v === undefined ? '' : v).replace(/\u00a0/g, ' '));
    }

    function epIsUnitCell(v) {
        const s = epCleanCell(v).toLowerCase().replace(/\./g, '');
        return /^(шт|штук|м|мп|м\/п|м2|м²|м3|м³|упак|уп|компл|комплект|час|точка|линия|кг|л)$/i.test(s);
    }

    function epNormalizeUnit(v) {
        const s = epCleanCell(v).toLowerCase().replace(/\./g, '');
        if (!s) return 'шт';
        if (s === 'мп' || s === 'м/п') return 'м';
        if (s === 'штук') return 'шт';
        if (s === 'комплект') return 'компл';
        return s;
    }

    function epIsNumberLikeCell(v) {
        if (typeof v === 'number') return true;
        const s = epCleanCell(v);
        if (!s) return false;
        return /^\d+[\d\s]*([,.]\d+)?$/.test(s);
    }

    function epLooksLikeCodeOrNumber(v) {
        const s = epCleanCell(v);
        if (!s) return true;
        if (/^№$/i.test(s)) return true;
        if (/^\d+[.)]?$/.test(s)) return true;
        if (/^\d+(\.\d+)+$/.test(s)) return true;
        if (/^[A-ZА-Я0-9\-_.\/]{2,18}$/i.test(s) && !/[а-яё]{4,}/i.test(s)) return true;
        return false;
    }

    function epTitleCaseRu(s) {
        s = epCleanCell(s).replace(/:+$/, '').trim();
        if (!s) return '';
        return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
    }

    function epExtractItemsFromSheetRows(rows, type) {
        const out = [];
        let currentCat = type === 'work' ? 'Работы' : 'Разное';
        let currentSubcat = 'Разное';

        (rows || []).forEach(function(row) {
            const cells = (Array.isArray(row) ? row : Object.values(row || {})).map(epCleanCell);
            const nonEmpty = cells.filter(x => x);
            if (!nonEmpty.length) return;

            const rowText = nonEmpty.join(' ');
            if (/^(№|номер|код|артикул)$/i.test(rowText)) return;
            if (/наименование/i.test(rowText) && /(ед|цена|стоимость)/i.test(rowText)) return;

            const unitIdx = cells.findIndex(epIsUnitCell);
            const numIdxs = cells.map((v, i) => epIsNumberLikeCell(v) ? i : -1).filter(i => i >= 0);
            const priceIdxs = numIdxs.filter(i => unitIdx < 0 || i > unitIdx);
            const priceIdx = priceIdxs.length ? priceIdxs[0] : (numIdxs.length ? numIdxs[numIdxs.length - 1] : -1);
            const hasPrice = priceIdx >= 0 && epMoney(cells[priceIdx]) > 0;
            const hasUnit = unitIdx >= 0;

            // Строка-раздел без цены и единицы
            if (!hasPrice && !hasUnit) {
                let title = nonEmpty.find(x => !/^\d+(\.\d+)*\.?$/.test(x)) || rowText;
                title = epTitleCaseRu(title);
                if (!title || title.length < 3) return;

                const first = nonEmpty[0] || '';
                if (/^\d+\.$/.test(first) || /работ/i.test(title) || title === title.toUpperCase()) {
                    currentCat = title;
                    currentSubcat = 'Разное';
                } else if (/^\d+\.\d+/.test(first) || /:$/.test(rowText) || nonEmpty.length <= 2) {
                    currentSubcat = title;
                } else if (type === 'work') {
                    currentSubcat = title;
                } else {
                    currentCat = title;
                }
                return;
            }

            let nameCandidates = cells.map((v, i) => ({ v, i }))
                .filter(x => x.v)
                .filter(x => x.i !== unitIdx && x.i !== priceIdx)
                .filter(x => !epIsNumberLikeCell(x.v))
                .filter(x => !epLooksLikeCodeOrNumber(x.v))
                .filter(x => !/^(ед|ед изм|цена|сумма|стоимость|кол-во|количество)$/i.test(x.v));

            if (!nameCandidates.length) return;
            nameCandidates.sort((a, b) => b.v.length - a.v.length);
            const name = epCleanText(nameCandidates[0].v);
            if (!name || name.length < 4) return;

            const cat = currentCat && currentCat !== 'Разное' ? currentCat : epInferCategory(name, type);
            const subcat = currentSubcat && currentSubcat !== 'Разное' ? currentSubcat : epInferSubcategory(name, cat, type);
            const unit = hasUnit ? epNormalizeUnit(cells[unitIdx]) : 'шт';
            const price = hasPrice ? epMoney(cells[priceIdx]) : 0;

            out.push({
                id: (type === 'work' ? 'w' : 'm') + '_sheet_' + Date.now() + '_' + out.length,
                n: name,
                c: cat || (type === 'work' ? 'Работы' : 'Разное'),
                sc: subcat || 'Разное',
                p: price,
                u: unit
            });
        });

        return out;
    }
    async function epReadDbFile(file, type) {
        showLoader('Читаю файл...', '📥');
        try {
            const name = file.name || '';
            const lower = name.toLowerCase();

            if (file.type.startsWith('image/')) {
                const imageDataUrl = await epReadFileAsDataURL(file);
                await epAiNormalizeImage(imageDataUrl, type, name);
                return;
            }

            if (lower.endsWith('.json')) {
                const txt = await epReadFileAsText(file);
                let raw = JSON.parse(txt);
                if (raw.matDB && type === 'mat') raw = raw.matDB;
                if (raw.workDB && type === 'work') raw = raw.workDB;
                epShowDbReview(epNormalizeItems(raw, type), type, name);
                return;
            }
            if (lower.endsWith('.xlsx') || lower.endsWith('.xls') || lower.endsWith('.csv')) {
                let rows = [];
                if (window.XLSX) {
                    const ab = await epReadFileAsArrayBuffer(file);
                    const wb = XLSX.read(ab, { type: 'array' });
                    const ws = wb.Sheets[wb.SheetNames[0]];
                    rows = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '' });
                } else {
                    const txt = await epReadFileAsText(file);
                    rows = txt.split(/\r?\n/).map(function(line) {
                        return line.split(';').length > line.split(',').length ? line.split(';') : line.split(',');
                    });
                }

                // Сначала разбираем Excel/CSV локально, построчно: каждая строка = отдельная позиция.
                // ИИ нужен только как запасной вариант, если таблица слишком кривая.
                const localItems = epExtractItemsFromSheetRows(rows, type);
                if (localItems.length) {
                    hideLoader();
                    epShowDbReview(localItems, type, name);
                    return;
                }

                await epAiNormalizeDbText(JSON.stringify(rows).slice(0, 90000), type, name);
                return;
            }

            const txt = await epReadFileAsText(file);
            await epAiNormalizeDbText(txt, type, name);
        } catch (e) {
            hideLoader();
            showToast('❌ ' + (e.message || 'Ошибка импорта'));
        }
    }

    async function epAiNormalizeImage(imageDataUrl, type, source) {
        showLoader('ИИ читает таблицу с изображения...', '👁️');
        let rawAnswer = '';
        try {
            const prompt = `Ты профессионально распознаёшь русские сметы, счета и прайсы электромонтажных материалов.
На изображении таблица. Нужно извлечь ВСЕ видимые строки с позициями для базы ${epDbTypeLabel(type)}.

Правила:
1. Читай каждую строку таблицы, даже если качество среднее.
2. Не возвращай пустой массив, если видны строки с товарами/работами.
3. Для имени n бери колонку с наименованием/описанием, НЕ артикул и НЕ номер строки.
4. c — главная категория: Кабель, Трубы, Расходники, Автоматика, Слаботочка, Чистовое, Работы, Щит, Разное.
5. sc — подкатегория. Определи точнее: ВВГ, ПУГВ, SAT/TV, UTP/FTP, Подрозетники, Крепёж, Клеммники, Коробки, Щиты, Автоматы, УЗО, Дифавтоматы, Розетки, Выключатели и т.д.
6. p — цена за единицу. Если есть две суммы, бери меньшую как цену за единицу, большую не бери как цену.
7. u — единица измерения: шт, м, упак, компл, кг, л и т.д.
8. Если цену не видно — p=0. Если единицу не видно — u="шт". Если подкатегорию не понял — sc="Разное".
9. Верни СТРОГО JSON-массив без текста вокруг.

Формат строго такой:
[
  {"n":"ВВГ-Пнг(A)-LS ГОСТ Конкорд 3x1,5","c":"Кабель","sc":"ВВГ","p":58.43,"u":"м"},
  {"n":"Подрозетник бетон 68x60","c":"Расходники","sc":"Подрозетники","p":12,"u":"шт"}
]`;

            rawAnswer = await epAskAI(prompt, { imageDataUrl: imageDataUrl, imageDetail: 'high', maxTokens: 9000 });
            let parsed = epParseJsonArray(rawAnswer);
            let items = epNormalizeItems(parsed, type);

            if (!items.length) {
                const retryPrompt = `Ты ответил без позиций. Посмотри изображение ещё раз. Там таблица со строками, например кабели, подрозетники, клеммники, автоматы, расходники. Извлеки хотя бы 10-30 видимых строк. Верни только JSON массив [{"n":"Имя позиции","c":"Категория","sc":"Подкатегория","p":0,"u":"шт"}]. Не объясняй.`;
                rawAnswer = await epAskAI(retryPrompt, { imageDataUrl: imageDataUrl, imageDetail: 'high', maxTokens: 9000 });
                parsed = epParseJsonArray(rawAnswer);
                items = epNormalizeItems(parsed, type);
            }

            hideLoader();
            epShowDbReview(items, type, source, rawAnswer);
        } catch (e) {
            hideLoader();
            showToast('❌ ' + (e.message || 'ИИ не прочитал изображение'));
        }
    }

    async function epAiNormalizeDbText(rawText, type, source) {
        showLoader('ИИ структурирует базу...', '🤖');
        let rawAnswer = '';
        try {
            const prompt = 'Ты помощник электрика. Приведи данные к базе ' + epDbTypeLabel(type) + '. Верни ТОЛЬКО JSON массив объектов: [{"n":"Имя позиции","c":"Категория","sc":"Подкатегория","p":123,"u":"шт"}]. n — имя/наименование позиции. c — главная категория. sc — подкатегория. p — цена за единицу, не итоговая сумма. u — единица измерения. Если цены нет, p=0. Если категории нет, определи сам: Кабель, Трубы, Расходники, Автоматика, Слаботочка, Чистовое, Работы, Щит, Разное. Если подкатегории нет, определи сам или поставь "Разное". Не возвращай пустой массив, если в данных есть строки с позициями. Данные: ' + String(rawText).slice(0, 90000);
            rawAnswer = await epAskAI(prompt, { maxTokens: 8000 });
            const items = epNormalizeItems(epParseJsonArray(rawAnswer), type);
            hideLoader();
            epShowDbReview(items, type, source, rawAnswer);
        } catch (e) {
            hideLoader();
            showToast('❌ ' + (e.message || 'ИИ не обработал данные'));
        }
    }

    window.epReviewCheckAll = function (checked) {
        document.querySelectorAll('#ep-db-ai-review-list input[type="checkbox"]').forEach(function (cb) {
            cb.checked = !!checked;
        });
    };

    function epShowDbReview(items, type, source, rawAnswer) {
        window.EP_DB_REVIEW = { type: type, items: items, source: source || '' };
        document.getElementById('ep-db-ai-review-title').innerText = 'Импорт ' + epDbTypeLabel(type) + ': ' + (source || '');
        const list = document.getElementById('ep-db-ai-review-list');

        if (!items.length) {
            list.innerHTML = `<div style="padding:12px; color:var(--danger); font-weight:800;">ИИ не нашёл позиции. Попробуйте другой файл, текст или сделайте скрин крупнее.</div><details style="margin-top:10px; font-size:11px; color:var(--gray);"><summary>Показать ответ ИИ</summary><pre style="white-space:pre-wrap; max-height:220px; overflow:auto;">${epEscape(rawAnswer || '')}</pre></details>`;
        } else {
            list.innerHTML = items.map(function (it, idx) {
                return `<div class="ep-db-review-row">
                    <input type="checkbox" id="ep-db-check-${idx}" checked>
                    <div class="ep-db-review-fields">
                        <div><label>Имя</label><input id="ep-db-name-${idx}" value="${epEscape(it.n)}" placeholder="Имя / наименование"></div>
                        <div class="ep-db-review-2col">
                            <div><label>Категория</label><input id="ep-db-cat-${idx}" value="${epEscape(it.c)}" placeholder="Категория"></div>
                            <div><label class="ep-db-subcat-label">Подкатегория</label><input id="ep-db-subcat-${idx}" value="${epEscape(it.sc || 'Разное')}" placeholder="Подкатегория"></div>
                        </div>
                        <div class="ep-db-review-2col">
                            <div><label>Цена за единицу</label><input id="ep-db-price-${idx}" type="number" step="0.01" value="${Number(it.p)||0}" placeholder="Цена"></div>
                            <div><label>Единица</label><input id="ep-db-unit-${idx}" value="${epEscape(it.u || 'шт')}" placeholder="шт / м / упак"></div>
                        </div>
                    </div>
                </div>`;
            }).join('');
        }

        openModal('ep-db-ai-review-modal');
    }

    function epGetReviewedSelected() {
        const items = window.EP_DB_REVIEW.items || [];
        return items.map(function (it, idx) {
            const checked = document.getElementById('ep-db-check-' + idx)?.checked;
            if (!checked) return null;
            return {
                id: it.id || (window.EP_DB_REVIEW.type === 'work' ? 'w' : 'm') + '_ai_' + Date.now() + '_' + idx,
                c: epCleanText(document.getElementById('ep-db-cat-' + idx)?.value) || 'Разное',
                sc: epCleanText(document.getElementById('ep-db-subcat-' + idx)?.value) || 'Разное',
                n: epCleanText(document.getElementById('ep-db-name-' + idx)?.value),
                p: epMoney(document.getElementById('ep-db-price-' + idx)?.value),
                u: epCleanText(document.getElementById('ep-db-unit-' + idx)?.value) || 'шт'
            };
        }).filter(Boolean).filter(function (x) { return x.n; });
    }

    function epSameItem(a, b) {
        return epCleanText(a.n).toLowerCase() === epCleanText(b.n).toLowerCase()
            && epCleanText(a.c).toLowerCase() === epCleanText(b.c).toLowerCase()
            && (!a.sc || !b.sc || epCleanText(a.sc).toLowerCase() === epCleanText(b.sc).toLowerCase());
    }

    async function epSendDbProposal(type, items, action) {
        if (!db || !appUser || appUser.role === 'admin' || !items.length) return;
        try {
            await db.collection('db_proposals').add({
                uid: appUser.uid || '',
                masterName: appUser.name || appUser.email || '',
                type: type,
                action: action,
                items: items,
                status: 'pending',
                createdAt: new Date().toISOString()
            });
        } catch(e) {
            console.warn('proposal error', e);
        }
    }

    window.epApplyReviewedDbItems = async function (mode) {
        const type = window.EP_DB_REVIEW.type;
        const items = epGetReviewedSelected();
        if (!items.length) return showToast('Нет выбранных позиций');

        let arr = epCurrentDb(type).slice();

        items.forEach(function (it) {
            const idx = arr.findIndex(x => epSameItem(x, it));
            if (mode === 'replace' && idx >= 0) {
                arr[idx] = Object.assign({}, arr[idx], it, { id: arr[idx].id || it.id });
            } else if (idx < 0) {
                arr.push(it);
            } else if (mode === 'add') {
                arr.push(Object.assign({}, it, { id: it.id + '_' + Math.random().toString(36).slice(2, 6) }));
            }
        });

        epSetCurrentDb(type, arr);

        if (appUser && appUser.role === 'admin') {
            try { await epSaveGlobalDb(); } catch(e) { console.warn(e); }
        }

        await epSaveUserDb();
        await epSendDbProposal(type, items, mode);

        renderDbEditors();
        closeModal('ep-db-ai-review-modal');
        showToast('✅ База обновлена' + (appUser && appUser.role !== 'admin' ? ' и отправлена админу' : ''));
    };

    function epDownloadJson(filename, data) {
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url; a.download = filename;
        document.body.appendChild(a); a.click(); a.remove();
        setTimeout(function(){ URL.revokeObjectURL(url); }, 1000);
    }

    window.epExportMyDb = function () {
        epDownloadJson('electric-pro-my-db.json', {
            owner: appUser ? { uid: appUser.uid, name: appUser.name || appUser.email || '' } : null,
            matDB: matDB,
            workDB: workDB,
            exportedAt: new Date().toISOString()
        });
    };

    window.epExportGlobalDb = async function () {
        let data = { matDB: matDB, workDB: workDB };
        try {
            if (db) {
                const doc = await db.collection('settings').doc('global_db').get();
                if (doc.exists) data = doc.data();
            }
        } catch(e){}
        epDownloadJson('electric-pro-global-db.json', Object.assign({}, data, { exportedAt: new Date().toISOString() }));
    };

    // Override renderDbEditors with delete buttons
    const epOldRenderDbEditors = window.renderDbEditors;
    window.renderDbEditors = function () {
        let catsM = [...new Set(matDB.map(m=>m.c || 'Разное'))];
        let catsW = [...new Set(workDB.map(w=>w.c || 'Разное'))];

        const catsEl = document.getElementById('db-cats');
        if (catsEl) catsEl.innerHTML = [...new Set([...catsM, ...catsW])].map(c=>`<option value="${epEscape(c)}">`).join('');

        let htmlMat = '';
        let mGroups = {}; matDB.forEach(m => { mGroups[m.c||'Разное'] = mGroups[m.c||'Разное'] || []; mGroups[m.c||'Разное'].push(m); });
        Object.keys(mGroups).forEach((c, idx) => {
            let sid = 'db_m_'+idx;
            htmlMat += `<div class="cat-header" onclick="toggleCat('${sid}')">${epEscape(c)}</div><div class="cat-body" id="${sid}">`;
            mGroups[c].forEach(m => {
                htmlMat += `<div class="emp-row">
                    <div style="flex:1;"><b>${epEscape(m.n)}</b><br><span style="color:var(--gray);font-size:10px;">${epEscape(m.sc || 'Разное')} • ${Number(m.p)||0} ₽ / ${epEscape(m.u || 'шт')}</span></div>
                    <div class="ep-row-actions">
                        <input type="number" value="${Number(m.p)||0}" onchange="requestPriceChange('mat', '${epEscape(m.id)}', this.value)" style="width:70px;margin:0;padding:4px;text-align:center;">
                        <button class="btn-danger" onclick="epDeleteDbItem('mat','${epEscape(m.id)}')" title="Удалить">🗑</button>
                    </div>
                </div>`;
            });
            htmlMat += `</div>`;
        });
        const em = document.getElementById('editor-mat-list');
        if (em) em.innerHTML = htmlMat;

        let htmlWork = '';
        let wGroups = {}; workDB.forEach(w => { wGroups[w.c||'Разное'] = wGroups[w.c||'Разное'] || []; wGroups[w.c||'Разное'].push(w); });
        Object.keys(wGroups).forEach((c, idx) => {
            let sid = 'db_w_'+idx;
            htmlWork += `<div class="cat-header" style="color:var(--orange); border-color:rgba(245,158,11,0.2); background:rgba(245,158,11,0.08);" onclick="toggleCat('${sid}')">${epEscape(c)}</div><div class="cat-body" id="${sid}">`;
            wGroups[c].forEach(w => {
                htmlWork += `<div class="emp-row">
                    <div style="flex:1;"><b>${epEscape(w.n)}</b><br><span style="color:var(--gray);font-size:10px;">${epEscape(w.sc || 'Разное')} • ${Number(w.p)||0} ₽ / ${epEscape(w.u || 'шт')}</span></div>
                    <div class="ep-row-actions">
                        <input type="number" value="${Number(w.p)||0}" onchange="requestPriceChange('work', '${epEscape(w.id)}', this.value)" style="width:70px;margin:0;padding:4px;text-align:center;">
                        <button class="btn-danger" onclick="epDeleteDbItem('work','${epEscape(w.id)}')" title="Удалить">🗑</button>
                    </div>
                </div>`;
            });
            htmlWork += `</div>`;
        });
        const ew = document.getElementById('editor-work-list');
        if (ew) ew.innerHTML = htmlWork;
    };

    window.epDeleteDbItem = async function (type, id) {
        const isAdmin = appUser && appUser.role === 'admin';
        let mode = 'mine';

        if (isAdmin) {
            mode = await new Promise(function (resolve) {
                const all = confirm('Админ: нажмите OK = удалить у всех. Отмена = удалить только у меня.');
                resolve(all ? 'all' : 'mine');
            });
        } else {
            const ok = confirm('Удалить позицию только у себя?');
            if (!ok) return;
        }

        let arr = epCurrentDb(type).filter(x => x.id !== id);
        epSetCurrentDb(type, arr);

        await epSaveUserDb();

        if (isAdmin && mode === 'all') {
            try { await epSaveGlobalDb(); } catch(e) { console.warn(e); }
        }

        renderDbEditors();
        showToast(isAdmin && mode === 'all' ? 'Удалено у всех' : 'Удалено у меня');
    };

    window.addDbItem = async function () {
        let cat = document.getElementById('db-new-cat').value.trim() || 'Разное';
        let name = document.getElementById('db-new-name').value.trim();
        let price = Number(document.getElementById('db-new-price').value) || 0;
        let unit = document.getElementById('db-new-unit').value.trim() || 'шт';
        let isMat = document.getElementById('editor-mat-list').style.display !== 'none';

        if(!name) return showToast('Введите название!');

        const type = isMat ? 'mat' : 'work';
        let newItem = { id: (isMat?'m':'w') + Date.now(), c: cat, n: name, p: price, u: unit };
        let arr = epCurrentDb(type).slice();
        arr.push(newItem);
        epSetCurrentDb(type, arr);

        if (appUser && appUser.role === 'admin') {
            try { await epSaveGlobalDb(); } catch(e) {}
        } else {
            await epSendDbProposal(type, [newItem], 'manual_add');
        }

        await epSaveUserDb();
        renderDbEditors();
        document.getElementById('db-new-name').value = '';
        document.getElementById('db-new-price').value = '';
        showToast(appUser && appUser.role === 'admin' ? '✅ Позиция добавлена в базу сервера' : '✅ Добавлено у вас и отправлено админу');
    };

    window.requestPriceChange = async function (type, id, newPrice) {
        newPrice = Number(newPrice) || 0;
        let arr = epCurrentDb(type);
        let item = arr.find(x => x.id === id);
        if (!item) return;
        item.p = newPrice;

        if (appUser && appUser.role === 'admin') {
            try { await epSaveGlobalDb(); } catch(e){}
            showToast('✅ Цена изменена в базе сервера');
        } else {
            await epSaveUserDb();
            await epSendDbProposal(type, [item], 'price_change');
            showToast('✅ Цена изменена у вас и отправлена админу');
        }
    };

    // Admin proposals
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

    function epListenDbProposals() {
        if (!db || !appUser || appUser.role !== 'admin') return;
        epInsertAdminProposalBox();
        const cont = document.getElementById('admin-db-proposals');
        if (!cont || cont.dataset.listen === '1') return;
        cont.dataset.listen = '1';

        db.collection('db_proposals').where('status', '==', 'pending').onSnapshot(function (snap) {
            if (snap.empty) {
                cont.innerHTML = `<span style="color:var(--gray);">Новых заявок нет</span>`;
                return;
            }
            cont.innerHTML = '';
            snap.forEach(function (doc) {
                const d = doc.data();
                const items = d.items || [];
                cont.innerHTML += `<div class="ep-db-admin-proposal">
                    <b>${epEscape(d.masterName || d.uid || 'Мастер')}</b>
                    <div style="color:var(--gray); font-size:11px;">${d.type === 'work' ? 'Работы' : 'Материалы'} • ${epEscape(d.action || '')} • ${items.length} поз.</div>
                    <div style="font-size:11px; margin-top:5px;">${items.slice(0,3).map(x => epEscape(x.n) + (x.sc ? ' <span style="color:var(--gray);">[' + epEscape(x.sc) + ']</span>' : '')).join('<br>')}${items.length > 3 ? '<br>...' : ''}</div>
                    <div class="ep-mini-actions">
                        <button class="btn-success" onclick="epAdminResolveDbProposal('${doc.id}','full')">✅ Добавить полностью</button>
                        <button class="btn-primary" onclick="epAdminResolveDbProposal('${doc.id}','names')">🏷 Только название без суммы</button>
                        <button class="btn-danger" onclick="epAdminResolveDbProposal('${doc.id}','reject')">❌ Отклонить</button>
                    </div>
                </div>`;
            });
        }, function (e) {
            cont.innerHTML = `<span style="color:var(--danger);">Ошибка заявок: ${epEscape(e.message)}</span>`;
        });
    }

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

    // Patch lifecycle
    const epOldFinishLoginSetup = window.finishLoginSetup;
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

    function epInitialApply() {
        epPatchSettingsUI();
        epInsertMainProviderSwitch();
        epInsertDbTools();
        epMakeAiMenuGroup();
        epAddBetaLabels();
        epRefreshProviderUI();
        if (appUser) {
            epLoadAiConfigFromServer();
            epLoadUserDbAfterLogin();
            epListenDbProposals();
        }
    }

    document.addEventListener('DOMContentLoaded', function () {
        epInitialApply();
        setTimeout(epInitialApply, 400);
        setTimeout(epInitialApply, 1200);
    });

    document.addEventListener('click', function () {
        setTimeout(function () {
            epMakeAiMenuGroup();
            epAddBetaLabels();
            epInsertDbTools();
            epRefreshProviderUI();
        }, 120);
    });
})();


/* =========================================================
 * SOURCE: legacy/extracted-js-blocks/block-04.js
 * ========================================================= */

/*
 * Extracted from public/index.html
 * Original script block: 4
 * Original HTML lines: 3576-3867
 */

(function() {
    const EP_FULL_WORKS=[{"id":"w44","c":"Алмазная резка","g":"Штроба 25х30","n":"Бетон","p":550,"u":"м.п."},{"id":"w45","c":"Алмазная резка","g":"Штроба 25х30","n":"Кирпич","p":400,"u":"м.п."},{"id":"w46","c":"Алмазная резка","g":"Штроба 25х30","n":"Панелька","p":700,"u":"м.п."},{"id":"w47","c":"Алмазная резка","g":"Штроба 25х30","n":"Мягкий мат.","p":400,"u":"м.п."},{"id":"w48","c":"Алмазная резка","g":"Штроба 50х50","n":"Бетон","p":1500,"u":"м.п."},{"id":"w49","c":"Алмазная резка","g":"Штроба 50х50","n":"Кирпич","p":1300,"u":"м.п."},{"id":"w50","c":"Алмазная резка","g":"Штроба 50х50","n":"Панелька","p":1900,"u":"м.п."},{"id":"w51","c":"Алмазная резка","g":"Штроба 50х50","n":"Мягкий мат.","p":900,"u":"м.п."},{"id":"w52","c":"Алмазная резка","g":"Штроба 100х50 ВВОДНАЯ","n":"Бетон","p":2200,"u":"м.п."},{"id":"w53","c":"Алмазная резка","g":"Штроба 100х50 ВВОДНАЯ","n":"Кирпич","p":1550,"u":"м.п."},{"id":"w54","c":"Алмазная резка","g":"Штроба 100х50 ВВОДНАЯ","n":"Панелька","p":2500,"u":"м.п."},{"id":"w55","c":"Алмазная резка","g":"Штроба 100х50 ВВОДНАЯ","n":"Мягкий мат.","p":1400,"u":"м.п."},{"id":"w56","c":"Алмазная резка","g":"Высверливание подр. стандарт","n":"Бетон","p":600,"u":"шт"},{"id":"w57","c":"Алмазная резка","g":"Высверливание подр. стандарт","n":"Кирпич","p":500,"u":"шт"},{"id":"w58","c":"Алмазная резка","g":"Высверливание подр. стандарт","n":"Панелька","p":650,"u":"шт"},{"id":"w59","c":"Алмазная резка","g":"Высверливание подр. стандарт","n":"Мягкий мат.","p":400,"u":"шт"},{"id":"w60","c":"Черновая электрика","g":"Вклейка подрозетников","n":"Все типы","p":100,"u":"шт"},{"id":"w61","c":"Алмазная резка","g":"Вырубка ниши щита","n":"Бетон","p":400,"u":"мод."},{"id":"w62","c":"Алмазная резка","g":"Вырубка ниши щита","n":"Кирпич","p":300,"u":"мод."},{"id":"w63","c":"Алмазная резка","g":"Вырубка ниши щита","n":"Панелька","p":500,"u":"мод."},{"id":"w64","c":"Алмазная резка","g":"Вырубка ниши щита","n":"Мягкий мат.","p":250,"u":"мод."},{"id":"w65","c":"Монтаж","g":"Прокладка кабеля","n":"Без гофры (Потолок)","p":120,"u":"м.п."},{"id":"w66","c":"Монтаж","g":"Прокладка кабеля","n":"В гофре (Пол)","p":150,"u":"м.п."},{"id":"w67","c":"Монтаж","g":"Распаячная коробка","n":"Сборка распред. коробки / коммутация","p":800,"u":"шт"},{"id":"w68","c":"Чистовая установка","g":"Механизмы","n":"Установка розетки 220В","p":500,"u":"шт"},{"id":"w69","c":"Чистовая установка","g":"Механизмы","n":"Установка выключателя","p":550,"u":"шт"},{"id":"w70","c":"Чистовая установка","g":"Механизмы","n":"Установка терморегулятора","p":900,"u":"шт"},{"id":"w71","c":"Алмазная резка","g":"Высверливание подрозетников глубокий","n":"Бетон","p":650,"u":"шт"},{"id":"w72","c":"Алмазная резка","g":"Высверливание подрозетников глубокий","n":"Кирпич","p":550,"u":"шт"},{"id":"w73","c":"Алмазная резка","g":"Высверливание подрозетников глубокий","n":"Панелька","p":750,"u":"шт"},{"id":"w74","c":"Алмазная резка","g":"Высверливание подрозетников глубокий","n":"Мягкий мат.","p":450,"u":"шт"},{"id":"w75","c":"Алмазная резка","g":"Высверливание подрозетников копос 74х75","n":"Бетон","p":800,"u":"шт"},{"id":"w76","c":"Алмазная резка","g":"Высверливание подрозетников копос 74х75","n":"Кирпич","p":700,"u":"шт"},{"id":"w77","c":"Алмазная резка","g":"Высверливание подрозетников копос 74х75","n":"Панелька","p":850,"u":"шт"},{"id":"w78","c":"Алмазная резка","g":"Высверливание подрозетников копос 74х75","n":"Мягкий мат.","p":500,"u":"шт"},{"id":"w79","c":"Алмазная резка","g":"Отверстие 132 ММ L= до 450","n":"Бетон","p":6000,"u":"шт"},{"id":"w80","c":"Алмазная резка","g":"Отверстие 132 ММ L= до 450","n":"Кирпич","p":4500,"u":"шт"},{"id":"w81","c":"Алмазная резка","g":"Отверстие 132 ММ L= до 450","n":"Панелька","p":7000,"u":"шт"},{"id":"w82","c":"Алмазная резка","g":"Отверстие 132 ММ L= до 450","n":"Мягкий мат.","p":4000,"u":"шт"},{"id":"w83","c":"Алмазная резка","g":"Отверстие 52мм L=до 450мм","n":"Бетон","p":2500,"u":"шт"},{"id":"w84","c":"Алмазная резка","g":"Отверстие 52мм L=до 450мм","n":"Кирпич","p":2000,"u":"шт"},{"id":"w85","c":"Алмазная резка","g":"Отверстие 52мм L=до 450мм","n":"Панелька","p":3000,"u":"шт"},{"id":"w86","c":"Алмазная резка","g":"Отверстие 52мм L=до 450мм","n":"Мягкий мат.","p":1900,"u":"шт"},{"id":"w87","c":"Щитовое","g":"Монтаж","n":"Сборка щита","p":500,"u":"мод."},{"id":"w89","c":"Щитовое","g":"Монтаж","n":"Установка БП в щит","p":900,"u":"ед"},{"id":"w91","c":"Монтаж","g":"Спецоборудование","n":"Подключение нагревателя","p":4000,"u":"ед"},{"id":"w92","c":"Монтаж","g":"Спецоборудование","n":"Система КУП","p":5000,"u":"ед"},{"id":"s_r1","c":"Щитовое","g":"Автоматика и Реле","n":"Установка реле времени","p":1250,"u":"шт"},{"id":"s_r2","c":"Щитовое","g":"Автоматика и Реле","n":"Установка реле освещения (в щите)","p":1250,"u":"шт"},{"id":"s_r3","c":"Щитовое","g":"Автоматика и Реле","n":"Установка реле температуры/жидкости","p":1700,"u":"шт"},{"id":"s_r4","c":"Щитовое","g":"Автоматика и Реле","n":"Установка реле контроля фаз","p":1450,"u":"шт"},{"id":"s_r5","c":"Щитовое","g":"Автоматика и Реле","n":"Установка реле напряжения","p":1150,"u":"шт"},{"id":"s_r6","c":"Щитовое","g":"Автоматика и Реле","n":"Установка реле управления нагрузкой","p":2050,"u":"шт"},{"id":"s_m1","c":"Щитовое","g":"Счетчики","n":"Установка электросчетчика 220-240В на DIN","p":1000,"u":"шт"},{"id":"s_m2","c":"Щитовое","g":"Счетчики","n":"Установка электросчетчика 220-240В на монтажную панель","p":1250,"u":"шт"},{"id":"s_m3","c":"Щитовое","g":"Счетчики","n":"Установка электросчетчика 380-400В на DIN","p":1700,"u":"шт"},{"id":"s_m4","c":"Щитовое","g":"Счетчики","n":"Установка электросчетчика 380-400В на монтажную панель","p":2200,"u":"шт"},{"id":"s_m5","c":"Щитовое","g":"Счетчики","n":"Установка электросчетчика под трансформаторы тока","p":2400,"u":"шт"},{"id":"s_m6","c":"Щитовое","g":"Счетчики","n":"Установка трансформатора тока (без подкл)","p":720,"u":"шт"},{"id":"s_p1","c":"Чистовая установка","g":"Розетки накладные","n":"Установка накладной розетки/выкл на бетон","p":680,"u":"шт"},{"id":"s_p2","c":"Чистовая установка","g":"Розетки накладные","n":"Установка накладной розетки/выкл на кирпич","p":600,"u":"шт"},{"id":"s_p3","c":"Чистовая установка","g":"Розетки накладные","n":"Установка накладной розетки/выкл на ГКЛ","p":530,"u":"шт"},{"id":"s_p4","c":"Чистовая установка","g":"Розетки накладные","n":"Установка накладной розетки/выкл на дерево","p":450,"u":"шт"},{"id":"s_p5","c":"Чистовая установка","g":"Механизмы (Спец)","n":"Установка накладной силовой розетки 380В","p":1000,"u":"шт"},{"id":"s_p6","c":"Чистовая установка","g":"Механизмы (Спец)","n":"Установка встраиваемой силовой розетки 380В","p":530,"u":"шт"},{"id":"s_p7","c":"Чистовая установка","g":"Механизмы","n":"Установка встраиваемой розетки/выкл в подрозетник","p":300,"u":"шт"},{"id":"s_p8","c":"Чистовая установка","g":"Механизмы","n":"Установка блока розеток/выкл","p":1200,"u":"шт"},{"id":"s_d1","c":"Черновая электрика","g":"Электроточки","n":"Установка накладного подрозетника","p":300,"u":"шт"},{"id":"s_d2","c":"Черновая электрика","g":"Электроточки","n":"Установка подрозетника","p":180,"u":"шт"},{"id":"s_d3","c":"Черновая электрика","g":"Электроточки","n":"Установка накладной распаечной коробки","p":450,"u":"шт"},{"id":"s_d4","c":"Черновая электрика","g":"Электроточки","n":"Установка встраиваемой распаечной коробки","p":300,"u":"шт"},{"id":"s_d5","c":"Чистовая установка","g":"Механизмы (Спец)","n":"Установка термостата","p":380,"u":"шт"},{"id":"s_d6","c":"Чистовая установка","g":"Механизмы (Спец)","n":"Установка встраиваемого датчика движения","p":330,"u":"шт"},{"id":"s_d7","c":"Чистовая установка","g":"Механизмы (Спец)","n":"Установка звонка","p":680,"u":"шт"},{"id":"s_d8","c":"Чистовая установка","g":"Механизмы (Спец)","n":"Установка кнопки звонка","p":450,"u":"шт"},{"id":"s_d9","c":"Чистовая установка","g":"Механизмы (Спец)","n":"Установка ТВ краба","p":480,"u":"шт"},{"id":"s_sh1","c":"Щитовое","g":"Монтаж накладных","n":"Монтаж электрощитка накладного 2 модуля","p":180,"u":"шт"},{"id":"s_sh2","c":"Щитовое","g":"Монтаж накладных","n":"Монтаж электрощитка накладного 4-8 модулей","p":290,"u":"шт"},{"id":"s_sh3","c":"Щитовое","g":"Монтаж накладных","n":"Монтаж электрощитка накладного 12-24 модуля","p":330,"u":"шт"},{"id":"s_sh4","c":"Щитовое","g":"Монтаж накладных","n":"Монтаж электрощитка накладного 36-60 модулей","p":560,"u":"шт"},{"id":"s_sh5","c":"Щитовое","g":"Монтаж накладных","n":"Монтаж электрощитка накладного 72-96 модулей","p":780,"u":"шт"},{"id":"s_l1","c":"Освещение","g":"LED Лента","n":"Монтаж светодиодной ленты на кухне под шкафами","p":270,"u":"м.п."},{"id":"s_l2","c":"Освещение","g":"LED Лента","n":"Монтаж светодиодной ленты в натяжной потолок","p":390,"u":"м.п."},{"id":"s_l3","c":"Освещение","g":"LED Лента","n":"Монтаж светодиодной ленты на гипсокартон","p":300,"u":"м.п."},{"id":"s_l4","c":"Освещение","g":"LED Лента","n":"Монтаж светодиодной ленты в потолочный плинтус","p":350,"u":"м.п."},{"id":"s_l5","c":"Освещение","g":"LED Лента","n":"Монтаж светодиодной ленты в алюминиевый профиль","p":230,"u":"м.п."},{"id":"s_l6","c":"Освещение","g":"LED Лента","n":"Монтаж светодиодной ленты на карниз","p":350,"u":"м.п."},{"id":"s_l7","c":"Освещение","g":"LED Лента","n":"Установка светодиодной ленты в светильник","p":180,"u":"м.п."},{"id":"s_l8","c":"Освещение","g":"LED Лента","n":"Монтаж светодиодной ленты на улице","p":380,"u":"м.п."},{"id":"s_l9","c":"Освещение","g":"Алюм. профиль","n":"Установка накладного алюм. профиля на скотч","p":110,"u":"м.п."},{"id":"s_l10","c":"Освещение","g":"Алюм. профиль","n":"Установка накладного алюм. профиля со сверлением","p":290,"u":"м.п."},{"id":"s_l11","c":"Освещение","g":"Алюм. профиль","n":"Установка врезного алюм. профиля в готовый паз","p":120,"u":"м.п."},{"id":"s_l12","c":"Освещение","g":"Алюм. профиль","n":"Установка врезного алюм. профиля с подготовкой паза","p":390,"u":"м.п."},{"id":"s_c1","c":"Освещение","g":"Люстры и Светильники","n":"Сборка простой люстры","p":630,"u":"шт"},{"id":"s_c2","c":"Освещение","g":"Люстры и Светильники","n":"Сборка сложной люстры","p":870,"u":"шт"},{"id":"s_c3","c":"Освещение","g":"Люстры и Светильники","n":"Установка крюка под люстру","p":230,"u":"шт"},{"id":"s_c4","c":"Освещение","g":"Люстры и Светильники","n":"Установка люстры на готовый крюк","p":740,"u":"шт"},{"id":"s_c5","c":"Освещение","g":"Люстры и Светильники","n":"Установка люстры с креплением к потолку (простая)","p":1200,"u":"шт"},{"id":"s_c6","c":"Освещение","g":"Люстры и Светильники","n":"Установка люстры с креплением к потолку (сложная/ДУ)","p":2250,"u":"шт"},{"id":"s_c7","c":"Освещение","g":"Люстры и Светильники","n":"Установка тяжелой люстры с креплением на крюк","p":1950,"u":"шт"},{"id":"s_c8","c":"Освещение","g":"Люстры и Светильники","n":"Установка тяжелой люстры с креплением к потолку","p":3600,"u":"шт"},{"id":"s_c9","c":"Освещение","g":"Люстры и Светильники","n":"Установка настенного светильника, бра","p":450,"u":"шт"},{"id":"s_c10","c":"Освещение","g":"Люстры и Светильники","n":"Установка точечного светильника","p":750,"u":"шт"},{"id":"s_c11","c":"Освещение","g":"Люстры и Светильники","n":"Установка светодиодного светильника","p":680,"u":"шт"},{"id":"s_c12","c":"Освещение","g":"Люстры и Светильники","n":"Установка светильника Армстронг","p":380,"u":"шт"},{"id":"s_c13","c":"Освещение","g":"Люстры и Светильники","n":"Установка люминесцентного светильника","p":410,"u":"шт"},{"id":"s_c14","c":"Освещение","g":"Люстры и Светильники","n":"Установка трекового светильника","p":140,"u":"шт"},{"id":"s_c15","c":"Освещение","g":"Люстры и Светильники","n":"Монтаж шинопровода","p":450,"u":"м.п."},{"id":"s_c16","c":"Освещение","g":"Уличное освещение","n":"Установка уличного светильника на фасаде","p":830,"u":"шт"},{"id":"s_c17","c":"Освещение","g":"Уличное освещение","n":"Установка садово-паркового светильника","p":1350,"u":"шт"},{"id":"s_c18","c":"Освещение","g":"Люстры и Светильники","n":"Установка светильника Выход","p":480,"u":"шт"},{"id":"s_c19","c":"Освещение","g":"Уличное освещение","n":"Установка антивандального светильника","p":660,"u":"шт"},{"id":"s_dem1","c":"Демонтаж","g":"Освещение","n":"Демонтаж люстры","p":240,"u":"шт"},{"id":"s_dem2","c":"Демонтаж","g":"Освещение","n":"Демонтаж светильника","p":210,"u":"шт"},{"id":"s_dem3","c":"Демонтаж","g":"Электроточки","n":"Демонтаж розетки","p":200,"u":"шт"},{"id":"s_dem4","c":"Демонтаж","g":"Электроточки","n":"Демонтаж выключателя","p":200,"u":"шт"},{"id":"s_dem5","c":"Демонтаж","g":"Электроточки","n":"Демонтаж распаечной коробки","p":200,"u":"шт"},{"id":"s_dem6","c":"Демонтаж","g":"Электроточки","n":"Демонтаж дверного звонка","p":200,"u":"шт"},{"id":"s_dem7","c":"Демонтаж","g":"Щитовое","n":"Демонтаж реле времени","p":230,"u":"шт"},{"id":"s_dem8","c":"Демонтаж","g":"Щитовое","n":"Демонтаж электрощитка до 8 модулей","p":110,"u":"шт"},{"id":"s_dem9","c":"Демонтаж","g":"Щитовое","n":"Демонтаж электрощитка 12-36 модулей","p":260,"u":"шт"},{"id":"s_dem10","c":"Демонтаж","g":"Щитовое","n":"Демонтаж электрощитка 48-96 модулей","p":470,"u":"шт"},{"id":"s_dem11","c":"Демонтаж","g":"Щитовое","n":"Демонтаж автомата","p":150,"u":"шт"},{"id":"s_dem12","c":"Демонтаж","g":"Щитовое","n":"Демонтаж УЗО","p":150,"u":"шт"},{"id":"s_dem13","c":"Демонтаж","g":"Щитовое","n":"Демонтаж дифавтомата","p":150,"u":"шт"},{"id":"s_dem14","c":"Демонтаж","g":"Щитовое","n":"Демонтаж рубильника","p":150,"u":"шт"},{"id":"s_dem15","c":"Демонтаж","g":"Щитовое","n":"Демонтаж магнитного пускателя","p":140,"u":"шт"}];
    let epGlobalDbType = 'mat';
    let epGlobalDbCache = { matDB: [], workDB: [] };
    window.EP_DB_PROPOSALS_CACHE_V2 = window.EP_DB_PROPOSALS_CACHE_V2 || {};

    function epEsc(v) { return String(v ?? '').replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch])); }
    function epId(v) { return String(v ?? '').replace(/[^a-zA-Z0-9_:-]/g, '_'); }
    function epArr(type) { return type === 'work' ? workDB : matDB; }
    function epSetArr(type, arr) { if (type === 'work') workDB = arr; else matDB = arr; }
    function epClean(v) { return String(v ?? '').trim().toLowerCase(); }
    function epSame(a,b) {
        if (a && b && a.id && b.id && String(a.id) === String(b.id)) return true;
        return epClean(a && a.c) === epClean(b && b.c)
            && epClean((a && (a.g || a.sc)) || '') === epClean((b && (b.g || b.sc)) || '')
            && epClean(a && a.n) === epClean(b && b.n);
    }
    function epMaterialFromName(name) {
        const s = String(name || '');
        const m = s.match(/\((Бетон|Кирпич|Панелька|Мягкий\s*мат\.?|Мягкий материал|ГКЛ|Все типы)\)/i);
        return m ? m[1].replace(/Мягкий\s*материал/i, 'Мягкий мат.').replace(/ГКЛ/i, 'Мягкий мат.') : '';
    }
    function epOpFromName(name) {
        let s = String(name || '').replace(/\s*\((Бетон|Кирпич|Панелька|Мягкий\s*мат\.?|Мягкий материал|ГКЛ|Все типы)\)\s*/ig, '').trim();
        s = s.replace(/подрозетников\s*\((45|64|75)мм\)/i, 'подрозетников $1мм');
        return s;
    }
    function epNormalizeWorkItem(x) {
        const it = Object.assign({}, x || {});
        const originalName = String(it.n || '');
        if (it.sc && !it.g) it.g = it.sc;
        const mat = epMaterialFromName(originalName);
        if (!it.g && mat) it.g = epOpFromName(originalName);
        if (mat && (!it.g || originalName.includes('('))) it.n = mat;
        if (!it.g) {
            const low = originalName.toLowerCase();
            if (/штроб/.test(low)) it.g = epOpFromName(originalName) || 'Штроба';
            else if (/высверл|подрозет/.test(low)) it.g = epOpFromName(originalName) || 'Подрозетники';
            else if (/ниш/.test(low)) it.g = epOpFromName(originalName) || 'Ниши';
            else if (/отверст|алмаз/.test(low)) it.g = epOpFromName(originalName) || 'Алмазные отверстия';
            else if (/демонтаж/.test(low)) it.g = it.g || 'Демонтаж';
            else if (/розет|выключ|механизм|терморег/.test(low)) it.g = it.g || 'Механизмы';
            else if (/кабел|гофр|лоток|труб|короб/.test(low)) it.g = it.g || 'Прокладка кабеля';
            else it.g = it.g || 'Разное';
        }
        if (!it.c) it.c = 'Работы';
        if (!it.u) it.u = 'шт';
        it.p = Number(it.p) || 0;
        return it;
    }
    function epDisplayWorkName(it) {
        const g = it.g || it.sc || '';
        const n = it.n || '';
        if (g && n && !String(n).toLowerCase().includes(String(g).toLowerCase())) return g + ' — ' + n;
        return n || g || 'Позиция';
    }
    function epEstimateCopy(it, type) {
        const copy = Object.assign({}, it);
        if (type === 'work') copy.n = epDisplayWorkName(copy);
        return copy;
    }
    function epMergeFullWorksInto(arr) {
        let out = (arr || []).map(epNormalizeWorkItem);
        EP_FULL_WORKS.forEach(function(w) {
            const nw = epNormalizeWorkItem(w);
            if (!out.some(x => epSame(x, nw))) out.push(Object.assign({}, nw));
        });
        return out;
    }
    function epNormalizeAllWorkDb() {
        workDB = epMergeFullWorksInto(workDB || []);
        try { if (typeof safeSet === 'function') safeSet('user_db_work_v31', JSON.stringify(workDB)); } catch(e){}
    }
    function epGroupCatalog(arr, type) {
        const cats = {};
        (arr || []).forEach(function(raw) {
            const it = type === 'work' ? epNormalizeWorkItem(raw) : Object.assign({}, raw);
            const c = it.c || 'Разное';
            const g = type === 'work' ? (it.g || it.sc || 'Разное') : (it.sc || it.g || 'Разное');
            if (!cats[c]) cats[c] = {};
            if (!cats[c][g]) cats[c][g] = [];
            cats[c][g].push(it);
        });
        return cats;
    }
    function epRenderGroupedList(arr, type, opts) {
        opts = opts || {};
        const cats = epGroupCatalog(arr, type);
        let html = '';
        let idx = 0;
        Object.keys(cats).sort((a,b)=>a.localeCompare(b,'ru')).forEach(function(c) {
            const cid = (opts.prefix || 'ep_cat') + '_' + epId(type + '_' + idx++);
            const catStyle = type === 'work' ? 'style="color:var(--orange); border-color:rgba(245,158,11,.2); background:rgba(245,158,11,.08);"' : '';
            html += `<div class="cat-header" ${catStyle} onclick="toggleCat('${cid}')">${epEsc(c)} <span>▼</span></div><div class="cat-body" id="${cid}">`;
            Object.keys(cats[c]).sort((a,b)=>a.localeCompare(b,'ru')).forEach(function(g) {
                const sid = (opts.prefix || 'ep_sub') + '_' + epId(type + '_' + idx++);
                html += `<div class="ep-subcat-header" onclick="epToggleSubCat('${sid}', event)">${epEsc(g)} <span>открыть</span></div><div class="ep-subcat-body" id="${sid}">`;
                cats[c][g].sort((a,b)=>String(a.n||'').localeCompare(String(b.n||''), 'ru')).forEach(function(it) {
                    if (!it.id) it.id = 'ep_' + type + '_' + Math.abs((String(it.c)+String(it.g)+String(it.n)).split('').reduce((h,ch)=>((h<<5)-h+ch.charCodeAt(0))|0,0));
                    const id = epEsc(it.id);
                    const itemTitle = epEsc(it.n || 'Позиция');
                    if (opts.mode === 'editor') {
                        html += `<div class="emp-row"><div style="flex:1;"><div class="ep-db-item-title">${itemTitle}</div><div class="ep-db-item-meta">${epEsc(g)} • ${Number(it.p)||0} ₽ / ${epEsc(it.u || 'шт')}</div></div><div class="ep-row-actions"><input type="number" value="${Number(it.p)||0}" onchange="requestPriceChange('${type}','${id}',this.value)" style="width:74px;margin:0;padding:5px;text-align:center;"><button class="btn-danger" onclick="epDeleteDbItem('${type}','${id}')" title="Удалить">🗑</button></div></div>`;
                    } else if (opts.mode === 'global') {
                        html += `<label class="mat-item ep-select-row"><input type="checkbox" class="ep-global-check" data-type="${type}" data-id="${id}"><div style="flex:1;"><div class="ep-db-item-title">${itemTitle}</div><div class="ep-db-item-meta">${epEsc(c)} • ${epEsc(g)} • ${Number(it.p)||0} ₽ / ${epEsc(it.u || 'шт')}</div></div></label>`;
                    } else {
                        html += `<div class="mat-item"><div style="flex:1;"><div class="ep-db-item-title">${itemTitle}</div><div class="ep-db-item-meta">${epEsc(g)} • ${Number(it.p)||0} ₽ / ${epEsc(it.u || 'шт')}</div></div><button class="mat-add-btn" style="${type === 'work' ? 'background:var(--orange);' : ''} width:auto; margin:0;" onclick="epPromptGroupedAdd('${id}','${type}')">+ Добавить</button></div>`;
                    }
                });
                html += '</div>';
            });
            html += '</div>';
        });
        return html || '<p style="color:var(--gray);font-size:12px;">Позиций нет</p>';
    }

    window.epToggleSubCat = function(id, ev) { if (ev) ev.stopPropagation(); const el = document.getElementById(id); if (el) el.classList.toggle('active'); };
    window.epPromptGroupedAdd = function(id, type) {
        const item = epArr(type).map(x => type === 'work' ? epNormalizeWorkItem(x) : x).find(x => String(x.id) === String(id));
        if (!item) return;
        window.pendingAdd = { item: epEstimateCopy(item, type), type: type };
        const nameEl = document.getElementById('qty-prompt-name'); if (nameEl) nameEl.innerText = type === 'work' ? epDisplayWorkName(item) : item.n;
        const qtyEl = document.getElementById('qty-input'); if (qtyEl) qtyEl.value = 1;
        openModal('qtyPromptModal');
    };
    const oldPromptAddFull = window.promptAdd;
    window.promptAdd = function(id, type) { if (type === 'work') return window.epPromptGroupedAdd(id, type); if (typeof oldPromptAddFull === 'function') return oldPromptAddFull(id, type); return window.epPromptGroupedAdd(id, type); };
    window.openWorkCatalog = function() { epNormalizeAllWorkDb(); const el = document.getElementById('work-cat-list'); if (el) el.innerHTML = epRenderGroupedList(workDB || [], 'work', { prefix:'wcat_full', mode:'catalog' }); openModal('workModal'); };
    const oldOpenMatCatalogFull = window.openMatCatalog;
    window.openMatCatalog = function() {
        const hasNested = (matDB || []).some(x => x.sc || x.g);
        if (!hasNested && typeof oldOpenMatCatalogFull === 'function') return oldOpenMatCatalogFull();
        const el = document.getElementById('mat-cat-list'); if (el) el.innerHTML = epRenderGroupedList(matDB || [], 'mat', { prefix:'mcat_full', mode:'catalog' }); openModal('matCatModal');
    };
    window.renderDbEditors = function() {
        epNormalizeAllWorkDb();
        const catsM = [...new Set((matDB || []).map(m => m.c || 'Разное'))];
        const catsW = [...new Set((workDB || []).map(w => w.c || 'Разное'))];
        const catsEl = document.getElementById('db-cats'); if (catsEl) catsEl.innerHTML = [...new Set([...catsM, ...catsW])].map(c => `<option value="${epEsc(c)}">`).join('');
        const em = document.getElementById('editor-mat-list'); const ew = document.getElementById('editor-work-list');
        if (em) em.innerHTML = epRenderGroupedList(matDB || [], 'mat', { prefix:'db_m_full', mode:'editor' });
        if (ew) ew.innerHTML = epRenderGroupedList(workDB || [], 'work', { prefix:'db_w_full', mode:'editor' });
    };

    async function epGetGlobalDb() {
        try {
            if (db) {
                const doc = await db.collection('settings').doc('global_db').get();
                if (doc.exists) {
                    const d = doc.data() || {};
                    epGlobalDbCache.matDB = Array.isArray(d.matDB) ? d.matDB : (matDB || []);
                    epGlobalDbCache.workDB = Array.isArray(d.workDB) ? epMergeFullWorksInto(d.workDB) : epMergeFullWorksInto(workDB || []);
                } else { epGlobalDbCache.matDB = matDB || []; epGlobalDbCache.workDB = epMergeFullWorksInto(workDB || []); }
            } else { epGlobalDbCache.matDB = matDB || []; epGlobalDbCache.workDB = epMergeFullWorksInto(workDB || []); }
        } catch(e) { epGlobalDbCache.matDB = matDB || []; epGlobalDbCache.workDB = epMergeFullWorksInto(workDB || []); }
    }
    window.epOpenGlobalDbModal = async function() { if (typeof showLoader === 'function') showLoader('Загрузка базы сервера...', '🌍'); await epGetGlobalDb(); if (typeof hideLoader === 'function') hideLoader(); epGlobalDbType='mat'; epRenderGlobalDbModal(); openModal('globalDbModal'); };
    window.epSwitchGlobalDbTab = function(type) { epGlobalDbType = type; epRenderGlobalDbModal(); };
    window.epGlobalSelectAll = function(flag) { document.querySelectorAll('#ep-global-db-list .ep-global-check').forEach(ch => ch.checked = !!flag); };
    function epRenderGlobalDbModal() {
        const matBtn = document.getElementById('ep-global-tab-mat'); const workBtn = document.getElementById('ep-global-tab-work');
        if (matBtn) matBtn.classList.toggle('active', epGlobalDbType === 'mat'); if (workBtn) workBtn.classList.toggle('active', epGlobalDbType === 'work');
        const list = document.getElementById('ep-global-db-list'); if (!list) return;
        const arr = epGlobalDbType === 'work' ? epGlobalDbCache.workDB : epGlobalDbCache.matDB;
        list.innerHTML = epRenderGroupedList(arr || [], epGlobalDbType, { prefix:'global_full', mode:'global' });
    }
    window.epAddSelectedGlobalToMyDb = async function() {
        const checks = Array.from(document.querySelectorAll('#ep-global-db-list .ep-global-check:checked'));
        if (!checks.length) return showToast('Выберите позиции');
        const type = epGlobalDbType;
        const src = type === 'work' ? epGlobalDbCache.workDB : epGlobalDbCache.matDB;
        let target = epArr(type).slice(); let added=0;
        checks.forEach(function(ch) { const it = src.find(x => String(x.id) === String(ch.dataset.id)); if (it && !target.some(x => epSame(x,it))) { target.push(Object.assign({}, it)); added++; } });
        epSetArr(type, target); if (type === 'work') epNormalizeAllWorkDb();
        try { if (typeof epSaveUserDb === 'function') await epSaveUserDb(); else safeSet(type === 'work' ? 'user_db_work_v31' : 'user_db_mat_v31', JSON.stringify(target)); } catch(e){}
        if (typeof renderDbEditors === 'function') renderDbEditors();
        showToast('✅ Добавлено выбранных: ' + added);
    };
    function epInsertGlobalDbButton() {
        if (document.getElementById('ep-global-db-entry')) return;
        const tools = document.getElementById('ep-db-ai-tools'); const tabs = document.querySelector('#settModal .tabs-container'); const anchor = tools || tabs;
        if (!anchor || !anchor.parentNode) return;
        const box = document.createElement('div'); box.id='ep-global-db-entry'; box.className='ep-global-db-entry'; box.innerHTML = `<button class="btn-shield" onclick="epOpenGlobalDbModal()">🌍 База сервера</button>`;
        anchor.parentNode.insertBefore(box, anchor.nextSibling);
    }
    const oldOpenModalFull = window.openModal;
    window.openModal = function(id) {
        if (typeof oldOpenModalFull === 'function') oldOpenModalFull(id);
        if (id === 'settModal') setTimeout(function() { epInsertGlobalDbButton(); epNormalizeAllWorkDb(); if (typeof renderDbEditors === 'function') renderDbEditors(); epStartProposalV2(); }, 80);
    };

    // Заявки в базу сервера: открыть массив и принимать/отклонять отдельные позиции.
    function epEnsureProposalBox() {
        let cont = document.getElementById('admin-db-proposals');
        if (cont) return cont;
        const panel = document.getElementById('admin-panel');
        if (!panel) return null;
        const box = document.createElement('div');
        box.innerHTML = `<h4 style="color:var(--primary); margin:10px 0 5px;">🌍 Заявки в базу сервера:</h4><div id="admin-db-proposals" style="margin-bottom:10px; border:1px solid var(--primary); background:rgba(79,70,229,.05); border-radius:8px; padding:8px; max-height:260px; overflow-y:auto; font-size:12px;"></div>`;
        panel.insertBefore(box, panel.firstChild ? panel.firstChild.nextSibling : null);
        return document.getElementById('admin-db-proposals');
    }
    function epProposalItemName(x) { return [x.g || x.sc || '', x.n || ''].filter(Boolean).join(' — ') || 'Позиция'; }
    function epRenderProposalList() {
        const cont = epEnsureProposalBox(); if (!cont) return;
        const entries = Object.entries(window.EP_DB_PROPOSALS_CACHE_V2 || {});
        if (!entries.length) { cont.innerHTML = '<span style="color:var(--gray);">Новых заявок нет</span>'; return; }
        cont.innerHTML = entries.map(function([id,d]) {
            const items = Array.isArray(d.items) ? d.items : [];
            const decisions = d.itemDecisions || {};
            const done = Object.keys(decisions).length;
            const preview = items.slice(0,3).map(x => epEsc(epProposalItemName(x))).join('<br>');
            return `<div class="ep-proposal-open-card" onclick="epOpenProposalDetail('${id}')"><b>${epEsc(d.masterName || d.uid || 'Мастер')}</b><span class="ep-proposal-badge">${d.type === 'work' ? 'Работы' : 'Материалы'}</span><div style="font-size:11px;color:var(--gray);margin-top:4px;">${epEsc(d.action || '')} • ${items.length} поз. • обработано ${done}/${items.length}</div><div style="font-size:11px;margin-top:6px;">${preview}${items.length>3?'<br>...':''}</div><button class="btn-info" style="width:100%;margin-top:8px;padding:9px;" onclick="event.stopPropagation(); epOpenProposalDetail('${id}')">Открыть заявку</button></div>`;
        }).join('');
    }
    window.epOpenProposalDetail = function(id) {
        const d = window.EP_DB_PROPOSALS_CACHE_V2[id]; if (!d) return showToast('Заявка не найдена');
        const items = Array.isArray(d.items) ? d.items : [];
        const decisions = d.itemDecisions || {};
        const title = document.getElementById('ep-proposal-title'); if (title) title.innerText = '🌍 Заявка: ' + (d.masterName || d.uid || 'Мастер');
        const body = document.getElementById('ep-proposal-body'); if (!body) return;
        body.innerHTML = `<div style="font-size:12px;color:var(--gray);margin-bottom:8px;">${d.type === 'work' ? 'Работы' : 'Материалы'} • ${items.length} позиций. Можно принять или отклонить каждую отдельно.</div><div class="ep-proposal-top-actions"><button class="btn-info" onclick="epProposalSelectAll(true)">✅ Все</button><button class="btn-vendor" onclick="epProposalSelectAll(false)">⬜ Снять</button><button class="btn-danger" onclick="epResolveProposalItems('${id}','reject')">❌ Отклонить выбранные</button></div><div class="ep-proposal-top-actions"><button class="btn-success" onclick="epResolveProposalItems('${id}','full')">✅ Добавить выбранные</button><button class="btn-primary" onclick="epResolveProposalItems('${id}','names')">🏷 Без суммы</button><button class="btn-vendor" onclick="closeModal('epProposalModal')">Закрыть</button></div>` +
        items.map(function(x,i) {
            const dec = decisions[String(i)];
            const done = !!dec;
            const status = done ? (dec.mode === 'reject' ? 'Отклонено' : (dec.mode === 'names' ? 'Добавлено без суммы' : 'Добавлено полностью')) : 'На рассмотрении';
            return `<div class="ep-proposal-row ${done?'done':''}"><label style="display:flex;gap:8px;align-items:flex-start;"><input type="checkbox" class="ep-proposal-check" data-index="${i}" ${done?'disabled':''} style="width:22px;height:22px;accent-color:var(--primary);"><div style="flex:1;"><div class="ep-db-item-title">${epEsc(epProposalItemName(x))}</div><div class="ep-db-item-meta">${epEsc(x.c || 'Разное')} • ${epEsc(x.g || x.sc || 'Разное')} • ${Number(x.p)||0} ₽ / ${epEsc(x.u || 'шт')} • <b>${status}</b></div></div></label>${done?'':`<div class="ep-proposal-actions"><button class="btn-success" onclick="epResolveProposalOne('${id}',${i},'full')">Добавить</button><button class="btn-primary" onclick="epResolveProposalOne('${id}',${i},'names')">Без суммы</button><button class="btn-danger" onclick="epResolveProposalOne('${id}',${i},'reject')">Отклонить</button></div>`}</div>`;
        }).join('');
        openModal('epProposalModal');
    };
    window.epProposalSelectAll = function(flag) { document.querySelectorAll('#ep-proposal-body .ep-proposal-check:not(:disabled)').forEach(ch => ch.checked = !!flag); };
    window.epResolveProposalOne = function(id, idx, mode) { epResolveProposalItems(id, mode, [idx]); };
    window.epResolveProposalItems = async function(id, mode, forcedIndexes) {
        if (!db || !appUser || appUser.role !== 'admin') return showToast('Только админ');
        const d = window.EP_DB_PROPOSALS_CACHE_V2[id]; if (!d) return showToast('Заявка не найдена');
        const items = Array.isArray(d.items) ? d.items : [];
        let indexes = Array.isArray(forcedIndexes) ? forcedIndexes : Array.from(document.querySelectorAll('#ep-proposal-body .ep-proposal-check:checked')).map(ch => Number(ch.dataset.index));
        indexes = indexes.filter(i => i >= 0 && i < items.length && !(d.itemDecisions || {})[String(i)]);
        if (!indexes.length) return showToast('Выберите необработанные позиции');
        if (typeof showLoader === 'function') showLoader('Обработка позиций...', '🌍');
        try {
            const ref = db.collection('db_proposals').doc(id);
            const fresh = await ref.get(); if (!fresh.exists) throw new Error('Заявка не найдена');
            const fd = fresh.data() || d;
            const decisions = Object.assign({}, fd.itemDecisions || {});
            const type = fd.type || 'mat';
            if (mode !== 'reject') {
                let globalMat = matDB || [], globalWork = workDB || [];
                try { const gdoc = await db.collection('settings').doc('global_db').get(); if (gdoc.exists) { const gd = gdoc.data() || {}; if (Array.isArray(gd.matDB)) globalMat = gd.matDB; if (Array.isArray(gd.workDB)) globalWork = gd.workDB; } } catch(e){}
                let arr = (type === 'work' ? globalWork : globalMat).slice();
                indexes.forEach(function(i) {
                    let it = Object.assign({}, items[i], mode === 'names' ? { p:0 } : {});
                    if (type === 'work') it = epNormalizeWorkItem(it);
                    const pos = arr.findIndex(x => epSame(type === 'work' ? epNormalizeWorkItem(x) : x, it));
                    if (pos >= 0) arr[pos] = Object.assign({}, arr[pos], it, { id: arr[pos].id || it.id });
                    else arr.push(it);
                });
                if (type === 'work') { globalWork = epMergeFullWorksInto(arr); workDB = epMergeFullWorksInto(workDB || []); } else { globalMat = arr; }
                await db.collection('settings').doc('global_db').set({ matDB: globalMat, workDB: globalWork, updatedAt: new Date().toISOString() }, { merge:true });
            }
            indexes.forEach(i => decisions[String(i)] = { mode: mode, decidedAt: new Date().toISOString(), decidedBy: appUser.uid || '' });
            const allDone = items.every((_,i) => !!decisions[String(i)]);
            const status = allDone ? 'processed' : 'pending';
            await ref.set({ itemDecisions: decisions, status: status, updatedAt: new Date().toISOString(), decidedBy: appUser.uid || '' }, { merge:true });
            if (typeof hideLoader === 'function') hideLoader();
            showToast(mode === 'reject' ? 'Позиции отклонены' : '✅ Позиции добавлены');
            const nd = Object.assign({}, fd, { itemDecisions: decisions, status: status });
            if (status === 'pending') window.EP_DB_PROPOSALS_CACHE_V2[id] = nd; else delete window.EP_DB_PROPOSALS_CACHE_V2[id];
            epRenderProposalList(); if (status === 'pending') window.epOpenProposalDetail(id); else closeModal('epProposalModal');
            if (typeof renderDbEditors === 'function') renderDbEditors();
        } catch(e) { if (typeof hideLoader === 'function') hideLoader(); showToast('❌ ' + (e.message || 'Ошибка')); }
    };
    function epStartProposalV2() {
        if (!db || !appUser || appUser.role !== 'admin') return;
        const cont = epEnsureProposalBox(); if (!cont || cont.dataset.v2listen === '1') return;
        cont.dataset.v2listen = '1';
        db.collection('db_proposals').where('status','==','pending').onSnapshot(function(snap) {
            window.EP_DB_PROPOSALS_CACHE_V2 = {};
            snap.forEach(function(doc) { window.EP_DB_PROPOSALS_CACHE_V2[doc.id] = Object.assign({}, doc.data() || {}, { id: doc.id }); });
            epRenderProposalList();
        }, function(e) { cont.innerHTML = '<span style="color:var(--danger);">Ошибка заявок: ' + epEsc(e.message) + '</span>'; });
    }
    function epInitFullWorksPatch() {
        epInsertGlobalDbButton(); epNormalizeAllWorkDb(); if (typeof renderDbEditors === 'function') renderDbEditors(); epStartProposalV2();
    }
    const oldFinishSetupFull = window.finishLoginSetup;
    if (typeof oldFinishSetupFull === 'function') { window.finishLoginSetup = async function() { await oldFinishSetupFull.apply(this, arguments); setTimeout(epInitFullWorksPatch, 250); }; }
    document.addEventListener('DOMContentLoaded', function() { setTimeout(epInitFullWorksPatch, 350); setTimeout(epInitFullWorksPatch, 1300); });
    document.addEventListener('click', function() { setTimeout(function() { epInsertGlobalDbButton(); epStartProposalV2(); }, 120); });
})();


/* =========================================================
 * SOURCE: legacy/extracted-js-blocks/block-05.js
 * ========================================================= */

/*
 * Extracted from public/index.html
 * Original script block: 5
 * Original HTML lines: 3871-4181
 */

(function(){
  function qs(id){ return document.getElementById(id); }
  function safeText(v){ return String(v || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }
  function norm(v){ return String(v || '').toLowerCase().replace(/ё/g,'е').replace(/[^a-zа-я0-9]+/g,' ').trim(); }
  function uniq(arr){ return Array.from(new Set(arr.filter(Boolean))); }
  function getVal(id, def){ var el=qs(id); return el ? el.value : def; }
  function getCheck(id){ var el=qs(id); return !!(el && el.checked); }
  function toNum(v, def){ var n=Number(v); return Number.isFinite(n) ? n : (def || 0); }

  function getCfgCount(key, id, def){
    try { if (window.cfg && Number.isFinite(Number(window.cfg[key]))) return Number(window.cfg[key]); } catch(e){}
    var el = qs(id || ('v-'+key));
    if (el) return toNum(el.textContent || el.value, def || 0);
    return def || 0;
  }

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

  function epMatGroupName(item){
    var text = norm([item.c,item.g,item.sc,item.n,item.kind,item.brand,item.nominal].join(' '));
    var name = norm(item.n);
    var c = norm(item.c);

    if (text.includes('уздп') || text.includes('дугов')) return {c:'Автоматика', g:'УЗДП'};
    if (text.includes('узм') || text.includes('реле напряж')) return {c:'Автоматика', g:'УЗМ / реле напряжения'};
    if (text.includes('диф') || text.includes('дифф')) return {c:'Автоматика', g:'ДИФы'};
    if (text.includes('узо')) return {c:'Автоматика', g:'УЗО'};
    if (text.includes('автомат') || text.match(/\bc\s*(6|10|16|25|32|40)\b/)) return {c:'Автоматика', g:'Автоматы'};
    if (text.includes('реле времени')) return {c:'Автоматика', g:'Реле времени'};
    if (text.includes('контактор') || text.includes('пускател')) return {c:'Автоматика', g:'Контакторы'};
    if (text.includes('реле')) return {c:'Автоматика', g:'Прочие реле'};

    if (text.includes('щит') || text.includes('шкаф') || text.includes('корпус')) {
      if (text.includes('наклад')) return {c:'Щитовое', g:'Корпуса → Накладной'};
      if (text.includes('встра') || text.includes('внутр')) return {c:'Щитовое', g:'Корпуса → Встраиваемый'};
      return {c:'Щитовое', g:'Корпуса'};
    }
    if (text.includes('ншви') || text.includes('наконеч')) return {c:'Щитовое', g:'Расходка под сборку → Наконечники'};
    if (text.includes('пугв') || (text.includes('провод') && c !== 'кабель')) return {c:'Щитовое', g:'Расходка под сборку → Провода'};
    if (text.includes('шин') || text.includes('клемм')) return {c:'Щитовое', g:'Расходка под сборку → Шинки / клеммники'};
    if (text.includes('греб') || text.includes('comb')) return {c:'Щитовое', g:'Расходка под сборку → Гребёнки'};
    if (text.includes('din') || text.includes('рейк') || text.includes('огранич')) return {c:'Щитовое', g:'Расходка под сборку → DIN-рейки / ограничители'};
    if (text.includes('маркиров') || text.includes('бирк')) return {c:'Щитовое', g:'Расходка под сборку → Маркировка'};
    if (text.includes('сальник') || text.includes('кабельный ввод')) return {c:'Щитовое', g:'Расходка под сборку → Кабельные вводы'};

    return {c:item.c || 'Разное', g:item.g || item.sc || 'Разное'};
  }

  function epNormalizeMaterialsDb(){
    function fixArr(arr){
      if (!Array.isArray(arr)) return [];
      arr.forEach(function(it){
        if(!it || typeof it !== 'object') return;
        if(!it.id) it.id = 'm_' + Math.abs(norm([it.c,it.g,it.n,it.p].join('_')).split('').reduce(function(h,ch){return ((h<<5)-h+ch.charCodeAt(0))|0;},0));
        var grp = epMatGroupName(it);
        // Меняем только автоматику/щитовое, остальное не трогаем.
        if (grp.c === 'Автоматика' || grp.c === 'Щитовое') { it.c = grp.c; it.g = grp.g; it.sc = grp.g; }
      });
      return arr;
    }
    try { window.matDB = fixArr(window.matDB || []); } catch(e){}
    try { window.userMatDB = fixArr(window.userMatDB || []); } catch(e){}
  }

  function epGroupedData(arr, type){
    var data = {};
    (arr || []).forEach(function(it){
      if(!it) return;
      if(!it.id) it.id = (type === 'work' ? 'w_' : 'm_') + Math.abs(norm([it.c,it.g,it.n,it.p].join('_')).split('').reduce(function(h,ch){return ((h<<5)-h+ch.charCodeAt(0))|0;},0));
      var c = it.c || 'Разное';
      var g = type === 'mat' ? (it.g || it.sc || 'Разное') : (it.g || it.sc || 'Разное');
      if(!data[c]) data[c] = {};
      if(!data[c][g]) data[c][g] = [];
      data[c][g].push(it);
    });
    return data;
  }

  function epRenderGrouped(arr, type, mode, prefix){
    var data = epGroupedData(arr, type);
    var html = '', i = 0;
    Object.keys(data).sort(function(a,b){return a.localeCompare(b,'ru');}).forEach(function(c){
      var cid = prefix + '_c_' + (i++);
      var catStyle = type === 'work' ? 'style="color:var(--orange); border-color:rgba(245,158,11,0.2); background:rgba(245,158,11,0.08);"' : '';
      html += '<div class="cat-header" '+catStyle+' onclick="toggleCat(\''+cid+'\')">'+safeText(c)+' <span>▼</span></div><div class="cat-body" id="'+cid+'">';
      Object.keys(data[c]).sort(function(a,b){return a.localeCompare(b,'ru');}).forEach(function(g){
        var sid = prefix + '_s_' + (i++);
        html += '<div class="ep-db-sub-header" onclick="epToggleShieldDbSub(\''+sid+'\', event)">'+safeText(g)+' <small>открыть</small></div><div class="ep-db-sub-body" id="'+sid+'">';
        data[c][g].sort(function(a,b){return String(a.n||'').localeCompare(String(b.n||''),'ru');}).forEach(function(it){
          var id = safeText(it.id);
          var meta = safeText(g)+' • '+(Number(it.p)||0)+' ₽ / '+safeText(it.u || 'шт');
          if (mode === 'editor') {
            html += '<div class="emp-row"><div style="flex:1;"><div class="ep-db-item-title">'+safeText(it.n || 'Позиция')+'</div><div class="ep-db-item-meta">'+meta+'</div></div><div class="ep-row-actions"><input type="number" value="'+(Number(it.p)||0)+'" onchange="requestPriceChange(\''+type+'\',\''+id+'\',this.value)" style="width:74px;margin:0;padding:5px;text-align:center;"><button class="btn-danger" onclick="epDeleteDbItem && epDeleteDbItem(\''+type+'\',\''+id+'\')" title="Удалить">🗑</button></div></div>';
          } else {
            var color = type === 'work' ? 'background:var(--orange);' : '';
            html += '<div class="mat-item"><div style="flex:1;"><div class="ep-db-item-title">'+safeText(it.n || 'Позиция')+'</div><div class="ep-db-item-meta">'+meta+'</div></div><button class="mat-add-btn" style="'+color+' width:auto; margin:0;" onclick="epPromptShieldGroupedAdd(\''+id+'\',\''+type+'\')">+ Добавить</button></div>';
          }
        });
        html += '</div>';
      });
      html += '</div>';
    });
    return html || '<div style="color:var(--gray);font-size:12px;padding:10px;">Позиции не найдены</div>';
  }

  window.epToggleShieldDbSub = function(id, e){ if(e) e.stopPropagation(); var el=qs(id); if(el) el.classList.toggle('active'); };
  window.epPromptShieldGroupedAdd = function(id, type){
    var arr = type === 'work' ? (window.workDB || []) : (window.matDB || []);
    var item = arr.find(function(x){return String(x.id) === String(id);});
    if(!item) return;
    window.pendingAdd = { item:item, type:type };
    var n = qs('qty-prompt-name'); if(n) n.innerText = item.n || 'Позиция';
    var q = qs('qty-input'); if(q) q.value = 1;
    if (typeof openModal === 'function') openModal('qtyPromptModal');
  };

  function epPatchDbRenderers(){
    var oldMat = window.openMatCatalog;
    var oldWork = window.openWorkCatalog;
    var oldRender = window.renderDbEditors;
    window.openMatCatalog = function(){ epNormalizeMaterialsDb(); var el=qs('mat-cat-list'); if(el) el.innerHTML = epRenderGrouped(window.matDB || [], 'mat', 'catalog', 'mat_shield'); if(typeof openModal==='function') openModal('matCatModal'); else if(oldMat) oldMat(); };
    window.openWorkCatalog = function(){ var el=qs('work-cat-list'); if(el) el.innerHTML = epRenderGrouped(window.workDB || [], 'work', 'catalog', 'work_shield'); if(typeof openModal==='function') openModal('workModal'); else if(oldWork) oldWork(); };
    window.renderDbEditors = function(){
      epNormalizeMaterialsDb();
      var catsEl = qs('db-cats');
      if (catsEl) catsEl.innerHTML = uniq([].concat((window.matDB||[]).map(function(x){return x.c;}),(window.workDB||[]).map(function(x){return x.c;}))).map(function(c){return '<option value="'+safeText(c)+'">';}).join('');
      var em=qs('editor-mat-list'); if(em) em.innerHTML = epRenderGrouped(window.matDB || [], 'mat', 'editor', 'db_mat_shield');
      var ew=qs('editor-work-list'); if(ew) ew.innerHTML = epRenderGrouped(window.workDB || [], 'work', 'editor', 'db_work_shield');
    };
  }

  function epAllDbItems(type){
    var a = type === 'work' ? (window.workDB || []) : (window.matDB || []);
    var b = type === 'work' ? (window.userWorkDB || []) : (window.userMatDB || []);
    return [].concat(a || [], b || []).filter(Boolean);
  }
  function epFindItem(type, words){
    var ws = (words || []).map(norm).filter(Boolean);
    var best = null, bestScore = -1;
    epAllDbItems(type).forEach(function(it){
      var blob = norm([it.c,it.g,it.sc,it.n,it.brand,it.kind,it.nominal,it.curve,it.wallType,it.modules,it.mountType].join(' '));
      var score = 0;
      ws.forEach(function(w){ if(w && blob.includes(w)) score++; });
      if(score > bestScore){ bestScore = score; best = it; }
    });
    return bestScore >= Math.max(1, Math.ceil(ws.length * 0.55)) ? best : null;
  }
  function epMat(label, q, fallbackPrice, words, meta){
    epNormalizeMaterialsDb();
    var found = epFindItem('mat', words || [label]);
    if(found) return { n: found.n, q: q, p: Number(found.p) || 0, u: found.u || 'шт', type: 'mat', sourceId: found.id || null };
    meta = meta || {};
    var path = meta.category ? ' [' + meta.category + (meta.subcategory ? ' → ' + meta.subcategory : '') + ']' : '';
    return { n: '⚠️ ' + label + path + ' — добавить в БД', q: q, p: Number(fallbackPrice) || 0, u: meta.unit || 'шт', type: 'mat', needDb: true, dbMeta: meta };
  }
  function epWork(label, q, price, words, meta){
    var found = epFindItem('work', words || [label]);
    if(found) return { n: found.n, q: q, p: Number(found.p) || Number(price) || 0, u: found.u || (meta && meta.unit) || 'шт', type: 'work', sourceId: found.id || null };
    return { n: label, q: q, p: Number(price) || 0, u: (meta && meta.unit) || 'шт', type: 'work', logicPrice: true };
  }

  window.epGenerateShieldFixed = function(){
    try {
      if (typeof window.addAuto !== 'function') throw new Error('addAuto не найден');
      var bBox = getVal('cfg-brand-box','Tekfor');
      var bAuto = getVal('cfg-brand-auto','IEK');
      var sWall = getVal('cfg-shield-wall','Бетон');
      var ph = parseInt(getVal('cfg-phase','1'),10) || 1;
      var curve = getVal('cfg-auto-curve','C');
      var rcdType = getVal('cfg-rcd-type','A');
      var protectionType = getVal('cfg-protection-type','uzo_auto');
      var isMaster = getCheck('cfg-master');
      var heavySeparate = getCheck('cfg-heavy-separate');
      var appLogic = window.appLogic || {};

      var m = [], w = [], lines = [], protectionDevices = [], warnings = [];
      var groupNames = { power:'Силовые линии', climate:'Климат', wet:'Влажные зоны', light:'Освещение', heavy:'Большая техника', alwaysOn:'Неотключаемые группы', main:'Главная защита' };

      function addLine(name, nominal, group, opts){ opts=opts||{}; lines.push({name:name, nominal:nominal, group:group, curve:opts.curve || curve, nonSwitchable:!!opts.nonSwitchable, wet:group==='wet'||!!opts.wet}); }
      function addRoom(label, count, wetPower){ for(var i=1;i<=count;i++){ var n = count > 1 ? label + ' ' + i : label; addLine(n + ' розетки', 'C16', wetPower ? 'wet' : 'power', {wet:wetPower}); addLine(n + ' свет', 'C10', 'light'); } }
      addRoom('Кухня', getCfgCount('kits','v-kits',1), false);
      addRoom('Ванная', getCfgCount('baths','v-baths',1), true);
      addRoom('Туалет', getCfgCount('toilets','v-toilets',1), true);
      addRoom('Комната', getCfgCount('rms','v-rms',1), false);
      addRoom('Балкон', getCfgCount('bals','v-bals',0), false);
      if(getCheck('c-apron')) addLine('Фартук кухни','C16','power');
      if(getCheck('c-dish')) addLine('Посудомойка','C10','power');
      if(getCheck('c-washer')) addLine('Стиралка/сушилка','C10','wet',{wet:true});
      if(getCheck('c-towel')) addLine('Полотенцесушитель','C10','wet',{wet:true});
      for(var ac=1; ac<=getCfgCount('acs','v-acs',0); ac++) addLine('Кондиционер '+ac,'C10','climate');
      for(var fl=1; fl<=getCfgCount('fls','v-fls',0); fl++) addLine('Тёплый пол '+fl,'C10','climate');
      if(getCheck('c-fridge')) addLine('Холодильник, неотключаемая группа','C10','alwaysOn',{nonSwitchable:true});
      if(getCheck('c-neptun')) addLine('Нептун, неотключаемая группа','C10','alwaysOn',{nonSwitchable:true});
      if(getCheck('c-router')) addLine('Роутер, неотключаемая группа','C6','alwaysOn',{nonSwitchable:true});
      var hob = getVal('c-hob-power','none'); if(hob==='6') addLine('Плита до 6 кВт','C25',heavySeparate?'heavy':'power'); if(hob==='10') addLine('Плита до 10 кВт','C32',heavySeparate?'heavy':'power');
      var boiler = getVal('c-boiler-power','none'); if(boiler==='6') addLine('Бойлер до 6 кВт','C25','wet',{wet:true}); if(boiler==='10') addLine('Бойлер до 10 кВт','C32','wet',{wet:true});

      var presentGroups = uniq(lines.map(function(l){return l.group;}));
      function addProtection(group, kind){ var leakage = group === 'wet' ? 10 : 30; protectionDevices.push({group:group, kind:kind, leakage:leakage, rcdType:rcdType, modules:2}); }
      if(protectionType === 'main_dif_auto') protectionDevices.push({group:'main', kind:'Главный ДИФ', leakage:30, rcdType:rcdType, modules:2});
      else if(protectionType === 'mixed') presentGroups.forEach(function(g){ addProtection(g, g === 'wet' ? 'ДИФ' : 'УЗО'); });
      else presentGroups.forEach(function(g){ addProtection(g, protectionType === 'dif_auto' ? 'ДИФ' : 'УЗО'); });

      function autoPrice(){ return bAuto === 'ABB' ? 350 : 155; }
      function difPrice(){ return bAuto === 'ABB' ? 4500 : 3600; }
      m.push(epMat('Вводной автомат '+ph+'ф '+bAuto, 1, bAuto === 'ABB' ? 3500 : 1800, ['автомат','вводной',bAuto,ph+'ф'], {category:'Автоматика', subcategory:'Автоматы', kind:'input_breaker'}));
      protectionDevices.forEach(function(pd){ var label = pd.kind === 'Главный ДИФ' ? 'Главный ДИФ '+bAuto+' '+pd.leakage+'мА тип '+pd.rcdType : pd.kind+' '+(groupNames[pd.group]||pd.group)+' '+pd.leakage+'мА тип '+pd.rcdType+' '+bAuto; m.push(epMat(label,1,difPrice(),[pd.kind,bAuto,pd.leakage+'мА',pd.rcdType,groupNames[pd.group]||pd.group],{category:'Автоматика', subcategory: pd.kind === 'УЗО' ? 'УЗО' : 'ДИФы', kind:pd.kind, leakage:pd.leakage, rcdType:pd.rcdType, modules:2})); });
      lines.forEach(function(line){ var label = 'Автомат '+line.nominal+' тип '+line.curve+' '+bAuto+' — '+line.name; m.push(epMat(label,1,autoPrice(),['автомат',bAuto,line.nominal,line.curve],{category:'Автоматика', subcategory:'Автоматы', kind:'automatic', nominal:line.nominal, curve:line.curve, modules:1})); });
      var relayModules = 0;
      if(getCheck('cfg-uzm')) { var rq = ph === 3 ? 3 : 1; relayModules = ph === 3 ? 6 : 2; m.push(epMat('Реле напряжения '+bAuto, rq, 4500, ['реле напряжения','узм',bAuto], {category:'Автоматика', subcategory:'УЗМ / реле напряжения', kind:'voltage_relay', modules:relayModules})); }
      if(isMaster){ m.push(epMat('Контактор C40 '+bAuto+' — мастер-кнопка света',1,2200,['контактор','C40',bAuto],{category:'Автоматика', subcategory:'Контакторы', kind:'contactor', modules:2})); m.push(epMat('Автомат C40 тип '+curve+' '+bAuto+' — байпас мастер-кнопки',1,autoPrice(),['автомат','C40',bAuto,curve],{category:'Автоматика', subcategory:'Автоматы', kind:'bypass_breaker', modules:1})); }
      try { (window.currentShieldExtras||[]).forEach(function(ex){ m.push({n:ex.n, q:Number(ex.q)||1, p:Number(ex.p)||0, u:ex.u||'шт', type:'mat'}); }); } catch(e){}

      var onePoleCount = lines.length + (isMaster ? 1 : 0);
      var twoPoleCount = protectionDevices.length;
      var masterModules = isMaster ? 3 : 0;
      var extraModules = 0; try { extraModules = (window.currentShieldExtras||[]).reduce(function(s,ex){return s + (Number(ex.modules||1)*Number(ex.q||1));},0); } catch(e){}
      var totalModules = Math.ceil(onePoleCount + twoPoleCount*2 + relayModules + masterModules + extraModules + (ph===3 ? 3 : 2));
      var boxSize = [6,12,24,36,48,60,72].find(function(s){return s >= totalModules;}) || 72;
      if(totalModules > 72) warnings.push('Нужно больше 72 модулей — требуется второй щит или пересборка схемы');
      m.unshift(epMat('Щит '+(sWall==='Накладной'?'накладной':'встраиваемый')+' '+bBox+' '+boxSize+'М',1,bBox==='ABB'?6510:2660,['щит',bBox,String(boxSize),sWall==='Накладной'?'накладной':'встраиваемый'],{category:'Щитовое', subcategory: sWall==='Накладной'?'Корпуса → Накладной':'Корпуса → Встраиваемый', kind:'shield_box', modules:boxSize}));

      var comb1P = Math.ceil(onePoleCount/12);
      var comb2P = Math.ceil(twoPoleCount/6);
      var rows = Math.ceil(boxSize/12);
      var pugvSize = Number(appLogic.shieldPugvSize || 6);
      var pugvMeters = Math.max(4, Math.ceil(totalModules * 0.4));
      var nshviPacks = Math.max(1, Math.ceil(boxSize/48));
      if(comb1P>0) m.push(epMat('Гребёнка 1P 25см',comb1P,250,['гребенка','1P','25'],{category:'Щитовое', subcategory:'Расходка под сборку → Гребёнки'}));
      if(comb2P>0) m.push(epMat('Гребёнка 2P 25см',comb2P,450,['гребенка','2P','25'],{category:'Щитовое', subcategory:'Расходка под сборку → Гребёнки'}));
      if(twoPoleCount>0) m.push(epMat('Нулевая шинка N на группу УЗО/ДИФ',twoPoleCount,285,['шина','N','ноль','DIN'],{category:'Щитовое', subcategory:'Расходка под сборку → Шинки / клеммники'}));
      m.push(epMat('PE-шина на '+(appLogic.shieldPeBusContacts || 26)+' контактов',1,770,['PE','шина','26'],{category:'Щитовое', subcategory:'Расходка под сборку → Шинки / клеммники'}));
      m.push(epMat('DIN-рейка / комплект DIN для щита',rows,180,['DIN','рейка'],{category:'Щитовое', subcategory:'Расходка под сборку → DIN-рейки / ограничители'}));
      m.push(epMat('Ограничитель на DIN-рейку',rows*2,35,['ограничитель','DIN'],{category:'Щитовое', subcategory:'Расходка под сборку → DIN-рейки / ограничители'}));
      m.push(epMat('Провод ПуГВ 1×'+pugvSize,pugvMeters,85,['ПуГВ','1x'+pugvSize,'1×'+pugvSize],{category:'Щитовое', subcategory:'Расходка под сборку → Провода', unit:'м.п.'}));
      m.push(epMat('НШВИ 1×'+pugvSize+', упак. 100 шт',nshviPacks,225,['НШВИ','1x'+pugvSize,'1×'+pugvSize],{category:'Щитовое', subcategory:'Расходка под сборку → Наконечники'}));
      m.push(epMat('Маркировка линий / бирки',lines.length,15,['маркировка','бирки'],{category:'Щитовое', subcategory:'Расходка под сборку → Маркировка'}));
      if(getCheck('cfg-cable-glands')) m.push(epMat('Кабельные вводы / сальники',1,250,['кабельный ввод','сальник'],{category:'Щитовое', subcategory:'Расходка под сборку → Кабельные вводы'}));

      if(sWall !== 'Накладной') w.push(epWork('Ниша щита '+boxSize+'М ('+sWall+')', boxSize, appLogic.shieldNichePerModule || 400, ['ниша','щит',sWall,String(boxSize)], {unit:'мод.'}));
      if(sWall !== 'Накладной') w.push(epWork('Штроба ВВОДНАЯ 100×50 ('+sWall+')',2,appLogic.shieldInputGroovePrice || 1500,['штроба','вводная','100x50',sWall],{unit:'м.п.'}));
      w.push(epWork('Сборка щита',totalModules,appLogic.priceShield || 500,['сборка','щит'],{unit:'мод.'}));
      w.push(epWork('Установка щита',1,appLogic.shieldInstallPrice || 2500,['установка','щит'],{unit:'шт'}));
      w.push(epWork('Подключение вводного кабеля',1,appLogic.shieldInputConnectPrice || 1500,['подключение','вводного','кабеля'],{unit:'шт'}));
      w.push(epWork('Прозвонка / проверка линий',lines.length,appLogic.shieldTestLinePrice || 150,['прозвонка','проверка','линий'],{unit:'линия'}));
      w.push(epWork('Маркировка линий',lines.length,appLogic.shieldMarkLinePrice || 100,['маркировка','линий'],{unit:'линия'}));
      if(getCheck('cfg-scheme')) w.push(epWork('Составление однолинейной схемы щита',1,appLogic.shieldSchemePrice || 4000,['однолинейная','схема','щит'],{unit:'шт'}));
      var info = [
        {n:'ℹ️ Щит: занято '+totalModules+' мод.; корпус '+boxSize+'М; свободно '+Math.max(0, boxSize-totalModules)+' мод.', q:1, p:0, type:'work'},
        {n:'ℹ️ Защита: '+protectionType+'; автоматы тип '+curve+'; УЗО/ДИФ тип '+rcdType+'; влажные зоны 10мА', q:1, p:0, type:'work'},
        {n:'ℹ️ Гребёнки: 1P '+comb1P+'×25см; 2P '+comb2P+'×25см; N-шинок '+twoPoleCount+'; PE-шина '+(appLogic.shieldPeBusContacts || 26)+' контактов', q:1, p:0, type:'work'}
      ];
      warnings.forEach(function(x){ info.push({n:'⚠️ '+x,q:1,p:0,type:'work'}); });
      window.addAuto(m.concat(w).concat(info),'shield');
      try { window.currentShieldExtras = []; } catch(e){}
      if(typeof closeModal === 'function') closeModal('configModal');
      if(typeof showToast === 'function') showToast('✅ Щит сгенерирован');
    } catch(err) {
      console.error('Shield generate error', err);
      var box = qs('ep-shield-generate-error');
      if(!box){ box = document.createElement('div'); box.id = 'ep-shield-generate-error'; box.className='ep-shield-generate-error'; var btn = Array.from(document.querySelectorAll('button')).find(function(b){return (b.textContent||'').includes('Сгенерировать щит');}); if(btn && btn.parentElement) btn.parentElement.insertBefore(box, btn); }
      if(box) box.textContent = 'Ошибка генерации щита: ' + (err && err.message ? err.message : err);
      if(typeof showToast === 'function') showToast('❌ Ошибка генерации щита');
    }
  };

  function epPatchGenerateButton(){
    window.generateCascadePanel = window.epGenerateShieldFixed;
    Array.from(document.querySelectorAll('button')).forEach(function(btn){ if((btn.textContent||'').includes('Сгенерировать щит')) btn.onclick = window.epGenerateShieldFixed; });
  }

  function boot(){ epMoveShieldSettingsIntoDetails(); epPatchDbRenderers(); epNormalizeMaterialsDb(); epPatchGenerateButton(); }
  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();
  setTimeout(boot, 500);
  setTimeout(boot, 1500);
})();


/* =========================================================
 * SOURCE: legacy/extracted-js-blocks/block-06.js
 * ========================================================= */

/*
 * Extracted from public/index.html
 * Original script block: 6
 * Original HTML lines: 4187-4391
 */

(function(){
  const BRAND_LIST = ['ABB','IEK','ИЭК','EKF','Schneider','Schneider Electric','Legrand','Hager','Dekraft','CHINT','Tekfor','TDM'];

  function qs(id){ return document.getElementById(id); }
  function toast(t){ if(typeof showToast==='function') showToast(t); else console.log(t); }
  function safe(s){ return String(s == null ? '' : s).replace(/[&<>"]/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[m])); }
  function norm(s){ return String(s||'').toLowerCase().replace(/с/g,'c').replace(/а/g,'a').replace(/в/g,'b').replace(/х/g,'x').replace(/ё/g,'е').replace(/[×]/g,'x').replace(/[^a-zа-я0-9]+/g,' ').trim(); }
  function dbArr(type){
    try { return type === 'mat' ? matDB : workDB; } catch(e) { return type === 'mat' ? (window.matDB || []) : (window.workDB || []); }
  }
  function setDbArr(type, arr){
    try { if(type === 'mat') matDB = arr; else workDB = arr; } catch(e) { if(type === 'mat') window.matDB = arr; else window.workDB = arr; }
  }
  function detectBrand(s){ const raw = String(s||''); const n = norm(raw); for(const b of BRAND_LIST){ if(n.includes(norm(b))) return b === 'ИЭК' ? 'IEK' : b; } return ''; }
  function detectNominal(s){ const n = norm(s).replace(/\s+/g,''); const m = n.match(/([abcd])([0-9]{1,3})/i); return m ? (m[1].toUpperCase()+m[2]) : ''; }
  function getGroup(it){ return it.g || it.sc || it.subcategory || it.group || ''; }
  function setGroup(it,g){ it.g = it.g || g; it.sc = it.sc || g; }

  function normalizeMaterialDb(){
    const arr = dbArr('mat') || [];
    arr.forEach(function(it){
      if(!it || !it.n) return;
      const n = norm((it.c||'')+' '+(it.g||'')+' '+(it.sc||'')+' '+it.n);
      const raw = String(it.n||'');
      if(/(диф|дифавтомат|dif)/i.test(raw) || n.includes('диф')){ it.c='Автоматика'; setGroup(it,'ДИФы'); it.kind=it.kind||'dif'; }
      else if(/\bузо\b/i.test(raw) || n.includes(' uzo ') || n.includes(' узо ')){ it.c='Автоматика'; setGroup(it,'УЗО'); it.kind=it.kind||'uzo'; }
      else if(/уздп/i.test(raw) || n.includes('уздп') || n.includes('дугов')){ it.c='Автоматика'; setGroup(it,'УЗДП'); it.kind=it.kind||'uzdp'; }
      else if(/узм|реле напряж/i.test(raw) || n.includes('реле напряж')){ it.c='Автоматика'; setGroup(it,'УЗМ / реле напряжения'); it.kind=it.kind||'voltage_relay'; }
      else if(/реле времени/i.test(raw) || n.includes('реле времени')){ it.c='Автоматика'; setGroup(it,'Реле времени'); it.kind=it.kind||'time_relay'; }
      else if(/контактор/i.test(raw) || n.includes('контактор')){ it.c='Автоматика'; setGroup(it,'Контакторы'); it.kind=it.kind||'contactor'; }
      else if(/автомат|\b[abcdсавд]\s?\d{1,3}\b/i.test(raw) || /(^|\s)c\s?\d{1,3}(\s|$)/.test(n)){ it.c='Автоматика'; setGroup(it,'Автоматы'); it.kind=it.kind||'automatic'; }
      else if(/щит|корпус|бокс/i.test(raw) || n.includes('корпус')){ it.c='Щитовое'; setGroup(it, (/наклад/i.test(raw)||n.includes('наклад')) ? 'Корпуса → Накладной' : 'Корпуса → Встраиваемый'); it.kind=it.kind||'shield_box'; }
      else if(/ншви|наконеч/i.test(raw) || n.includes('наконеч')){ it.c='Щитовое'; setGroup(it,'Расходка под сборку → Наконечники'); it.kind=it.kind||'lug_pack'; }
      else if(/пугв|пугов|провод/i.test(raw) || n.includes('пугв')){ it.c=it.c||'Щитовое'; if(it.c==='Щитовое' || n.includes('пугв')) setGroup(it,'Расходка под сборку → Провода'); it.kind=it.kind||'pugv'; }
      else if(/шин|клемм/i.test(raw) || n.includes('шина') || n.includes('клемм')){ it.c='Щитовое'; setGroup(it,'Расходка под сборку → Шинки / клеммники'); it.kind=it.kind||'busbar'; }
      else if(/греб/i.test(raw) || n.includes('греб')){ it.c='Щитовое'; setGroup(it,'Расходка под сборку → Гребёнки'); it.kind=it.kind||'comb_bus'; }
      else if(/din|дин|рейк|огранич/i.test(raw) || n.includes('din')){ it.c='Щитовое'; setGroup(it,'Расходка под сборку → DIN-рейки / ограничители'); it.kind=it.kind||'din'; }
      else if(/маркир|бирк/i.test(raw) || n.includes('маркир')){ it.c='Щитовое'; setGroup(it,'Расходка под сборку → Маркировка'); it.kind=it.kind||'marking'; }
      else if(/сальник|кабельн.*ввод/i.test(raw) || n.includes('сальник')){ it.c='Щитовое'; setGroup(it,'Расходка под сборку → Кабельные вводы'); it.kind=it.kind||'cable_gland'; }
      if(!it.brand) it.brand = detectBrand(raw) || it.brand;
      if(!it.nominal) it.nominal = detectNominal(raw) || it.nominal;
    });
    setDbArr('mat', arr);
  }

  function renderGrouped(arr, type, prefix){
    arr = arr || [];
    const cats = {};
    arr.forEach(it => { const c = it.c || 'Разное'; (cats[c]||(cats[c]={direct:[], groups:{}})); const g=getGroup(it); if(g){ (cats[c].groups[g]||(cats[c].groups[g]=[])).push(it); } else cats[c].direct.push(it); });
    let html = ''; let ci = 0;
    Object.keys(cats).sort().forEach(function(c){
      const cid = prefix+'_cat_'+(ci++);
      const color = type==='work' ? 'color:var(--orange);background:rgba(245,158,11,.08);' : '';
      html += '<div class="cat-header" style="'+color+'" onclick="toggleCat(\''+cid+'\')">'+safe(c)+'</div><div class="cat-body" id="'+cid+'">';
      const cat = cats[c]; let gi = 0;
      Object.keys(cat.groups).sort().forEach(function(g){
        const gid = cid+'_g_'+(gi++);
        html += '<div class="ep-db-sub-header" onclick="epDbToggleSub(\''+gid+'\', event)"><span>'+safe(g)+'</span><small>открыть</small></div><div class="ep-db-sub-body" id="'+gid+'">';
        cat.groups[g].forEach(it => { html += renderItem(it,type); });
        html += '</div>';
      });
      cat.direct.forEach(it => { html += renderItem(it,type); });
      html += '</div>';
    }

/* =========================================================
 * PDF FUNCTION: epReadFileAsText
 * ========================================================= */
function epReadFileAsText(file) {
        return new Promise(function (resolve, reject) {
            const r = new FileReader();
            r.onload = function () { resolve(r.result); };
            r.onerror = reject;
            r.readAsText(file);
        });
    }

    

/* =========================================================
 * PDF FUNCTION: epReadFileAsDataURL
 * ========================================================= */
function epReadFileAsDataURL(file) {
        return new Promise(function (resolve, reject) {
            const r = new FileReader();
            r.onload = function () { resolve(r.result); };
            r.onerror = reject;
            r.readAsDataURL(file);
        });
    }

    

/* =========================================================
 * PDF FUNCTION: epReadFileAsArrayBuffer
 * ========================================================= */
function epReadFileAsArrayBuffer(file) {
        return new Promise(function (resolve, reject) {
            const r = new FileReader();
            r.onload = function () { resolve(r.result); };
            r.onerror = reject;
            r.readAsArrayBuffer(file);
        });
    }



    

/* =========================================================
 * PDF FUNCTION: epReadDbFile
 * ========================================================= */
async function epReadDbFile(file, type) {
        showLoader('Читаю файл...', '📥');
        try {
            const name = file.name || '';
            const lower = name.toLowerCase();

            if (file.type.startsWith('image/')) {
                const imageDataUrl = await epReadFileAsDataURL(file);
                await epAiNormalizeImage(imageDataUrl, type, name);
                return;
            }

            if (lower.endsWith('.json')) {
                const txt = await epReadFileAsText(file);
                let raw = JSON.parse(txt);
                if (raw.matDB && type === 'mat') raw = raw.matDB;
                if (raw.workDB && type === 'work') raw = raw.workDB;
                epShowDbReview(epNormalizeItems(raw, type), type, name);
                return;
            }
            if (lower.endsWith('.xlsx') || lower.endsWith('.xls') || lower.endsWith('.csv')) {
                let rows = [];
                if (window.XLSX) {
                    const ab = await epReadFileAsArrayBuffer(file);
                    const wb = XLSX.read(ab, { type: 'array' });
                    const ws = wb.Sheets[wb.SheetNames[0]];
                    rows = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '' });
                } else {
                    const txt = await epReadFileAsText(file);
                    rows = txt.split(/\r?\n/).map(function(line) {
                        return line.split(';').length > line.split(',').length ? line.split(';') : line.split(',');
                    });
                }

                // Сначала разбираем Excel/CSV локально, построчно: каждая строка = отдельная позиция.
                // ИИ нужен только как запасной вариант, если таблица слишком кривая.
                const localItems = epExtractItemsFromSheetRows(rows, type);
                if (localItems.length) {
                    hideLoader();
                    epShowDbReview(localItems, type, name);
                    return;
                }

                await epAiNormalizeDbText(JSON.stringify(rows).slice(0, 90000), type, name);
                return;
            }

            const txt = await epReadFileAsText(file);
            await epAiNormalizeDbText(txt, type, name);
        } catch (e) {
            hideLoader();
            showToast('❌ ' + (e.message || 'Ошибка импорта'));
        }
    }

    

/* =========================================================
 * PDF FUNCTION: epDownloadJson
 * ========================================================= */
function epDownloadJson(filename, data) {
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url; a.download = filename;
        document.body.appendChild(a); a.click(); a.remove();
        setTimeout(function(){ URL.revokeObjectURL(url); }, 1000);
    }

    

/* =========================================================
 * PDF FUNCTION: safeHtml
 * ========================================================= */
function safeHtml(s){
    return String(s == null ? '' : s).replace(/[&<>"]/g, function(m){
      return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[m];
    });
  }
  function norm(s){
    return String(s || '')
      .toLowerCase()
      .replace(/ё/g,'е')
      .replace(/×/g,'x')
      .replace(/с/g,'c')
      .replace(/[^a-zа-я0-9]+/g,' ')
      .trim();
  }

  function arrByType(type){
    try{
      var arr = type === 'work' ? workDB : matDB;
      if(type === 'mat' && (!Array.isArray(arr) || !arr.length) && typeof FULL_MAT_INIT !== 'undefined') {
        matDB = (FULL_MAT_INIT || []).slice();
        arr = matDB;
      }
      if(type === 'work' && (!Array.isArray(arr) || !arr.length) && typeof FULL_WORK_INIT !== 'undefined') {
        workDB = (FULL_WORK_INIT || []).slice();
        arr = workDB;
      }
      return Array.isArray(arr) ? arr : [];
    }catch(e){
      return [];
    }
  }

  function setArrByType(type, arr){
    try{
      if(type === 'work') workDB = arr || [];
      else matDB = arr || [];
    }catch(e){}
  }

  function detectBrand(s){
    var raw = String(s || '');
    var brands = ['ABB','АBB','IEK','ИЭК','Schneider','Legrand','EKF','DEKraft','Tekfor','Hager','Lezard','TDM'];
    var low = norm(raw);
    for(var i=0;i<brands.length;i++){
      if(low.indexOf(norm(brands[i])) >= 0) return brands[i] === 'ИЭК' ? 'IEK' : (brands[i] === 'АBB' ? 'ABB' : brands[i]);
    }
    return '';
  }
  function detectNominal(s){
    var n = norm(s).replace(/\s+/g,'');
    var m = n.match(/([abcd])([0-9]{1,3})/i);
    return m ? (m[1].toUpperCase()+m[2]) : '';
  }
  function detectLeakage(s){
    var m = String(s||'').match(/(10|30|100|300)\s*м?а/i);
    return m ? Number(m[1]) : '';
  }
  function detectRcdType(s){
    var raw = String(s || '');
    var m = raw.match(/тип\s*(AC|A|B|АС|А|В)\b/i);
    if(m) {
      var t = m[1].toUpperCase();
      if(t === 'АС') return 'AC';
      if(t === 'А') return 'A';
      if(t === 'В') return 'B';
      return t;
    }
    return '';
  }

  function normalizeDbItem(it, type){
    if(!it) return it;
    if(!it.id) {
      it.id = (type === 'work' ? 'w_' : 'm_') + Date.now() + '_' + Math.random().toString(36).slice(2,8);
    }
    if(type === 'mat') {
      var raw = String([it.c,it.g,it.sc,it.subcategory,it.n].filter(Boolean).join(' '));
      var n = norm(raw);
      if(/диф|дифавтомат|dif/i.test(raw)){
        it.c = 'Автоматика'; it.g = it.g || it.sc || 'ДИФы'; it.sc = it.sc || it.g; it.kind = it.kind || 'dif';
      } else if(/узо/i.test(raw)) {
        it.c = 'Автоматика'; it.g = it.g || it.sc || 'УЗО'; it.sc = it.sc || it.g; it.kind = it.kind || 'uzo';
      } else if(/уздп|дугов/i.test(raw)) {
        it.c = 'Автоматика'; it.g = it.g || it.sc || 'УЗДП'; it.sc = it.sc || it.g; it.kind = it.kind || 'uzdp';
      } else if(/узм|реле напряж/i.test(raw)) {
        it.c = 'Автоматика'; it.g = it.g || it.sc || 'УЗМ / реле напряжения'; it.sc = it.sc || it.g; it.kind = it.kind || 'voltage_relay';
      } else if(/реле времени/i.test(raw)) {
        it.c = 'Автоматика'; it.g = it.g || it.sc || 'Реле времени'; it.sc = it.sc || it.g; it.kind = it.kind || 'time_relay';
      } else if(/контактор/i.test(raw)) {
        it.c = 'Автоматика'; it.g = it.g || it.sc || 'Контакторы'; it.sc = it.sc || it.g; it.kind = it.kind || 'contactor';
      } else if(/автомат|(^|\s)[abcdсавд]\s?\d{1,3}(\s|$)/i.test(raw)) {
        it.c = 'Автоматика'; it.g = it.g || it.sc || 'Автоматы'; it.sc = it.sc || it.g; it.kind = it.kind || 'automatic';
      } else if(/щит|корпус|бокс/i.test(raw)) {
        it.c = 'Щитовое';
        var g = /наклад/i.test(raw) ? 'Корпуса → Накладной' : 'Корпуса → Встраиваемый';
        it.g = it.g || it.sc || g; it.sc = it.sc || it.g; it.kind = it.kind || 'shield_box';
      } else if(/ншви|наконеч/i.test(raw)) {
        it.c = 'Щитовое'; it.g = it.g || it.sc || 'Расходка под сборку → Наконечники'; it.sc = it.sc || it.g; it.kind = it.kind || 'lug_pack';
      } else if(/пугв|провод/i.test(raw)) {
        it.c = it.c || 'Щитовое'; it.g = it.g || it.sc || 'Расходка под сборку → Провода'; it.sc = it.sc || it.g; it.kind = it.kind || 'pugv';
      } else if(/шин|клемм/i.test(raw)) {
        it.c = 'Щитовое'; it.g = it.g || it.sc || 'Расходка под сборку → Шинки / клеммники'; it.sc = it.sc || it.g; it.kind = it.kind || 'busbar';
      } else if(/греб/i.test(raw)) {
        it.c = 'Щитовое'; it.g = it.g || it.sc || 'Расходка под сборку → Гребёнки'; it.sc = it.sc || it.g; it.kind = it.kind || 'comb_bus';
      } else if(/din|дин|рейк|огранич/i.test(raw)) {
        it.c = 'Щитовое'; it.g = it.g || it.sc || 'Расходка под сборку → DIN-рейки / ограничители'; it.sc = it.sc || it.g; it.kind = it.kind || 'din';
      } else if(/маркир|бирк/i.test(raw)) {
        it.c = 'Щитовое'; it.g = it.g || it.sc || 'Расходка под сборку → Маркировка'; it.sc = it.sc || it.g; it.kind = it.kind || 'marking';
      }
      it.brand = it.brand || detectBrand(raw);
      it.nominal = it.nominal || detectNominal(raw);
      it.leakage = it.leakage || detectLeakage(raw);
      it.rcdType = it.rcdType || detectRcdType(raw);
    }
    if(type === 'work') {
      var wr = String([it.c,it.g,it.sc,it.subcategory,it.n].filter(Boolean).join(' '));
      if(/ниша.*щит|щит.*ниша|штроб|резк|алмаз|высверл|отверст/i.test(wr)) {
        it.c = it.c || 'Штробление и резка';
        if(/ниша.*щит|щит.*ниша/i.test(wr)) {
          it.c = 'Штробление и резка';
          it.g = it.g || it.sc || 'Ниши щита';
          it.sc = it.sc || it.g;
        }
      }
    }
    return it;
  }

  function normalizeDbs(){
    var mats = arrByType('mat').map(function(x){ return normalizeDbItem(x,'mat'); });
    var works = arrByType('work').map(function(x){ return normalizeDbItem(x,'work'); });
    setArrByType('mat', mats);
    setArrByType('work', works);
  }

  function renderGroupedFixed(arr, type, prefix){
    normalizeDbs();
    arr = type === 'work' ? arrByType('work') : arrByType('mat');
    var data = {};
    arr.forEach(function(it){
      if(!it) return;
      var c = it.c || 'Разное';
      var g = it.g || it.sc || it.subcategory || 'Разное';
      if(!data[c]) data[c] = {};
      if(!data[c][g]) data[c][g] = [];
      data[c][g].push(it);
    });
    var html = '', i = 0;
    Object.keys(data).sort(function(a,b){return a.localeCompare(b,'ru');}).forEach(function(c){
      var cid = prefix + '_cat_' + (i++);
      var catStyle = type === 'work' ? 'style="color:var(--orange);background:rgba(245,158,11,.08);"' : '';
      html += '<div class="cat-header" '+catStyle+' onclick="toggleCat(\''+cid+'\')">'+safeHtml(c)+'</div><div class="cat-body" id="'+cid+'">';
      Object.keys(data[c]).sort(function(a,b){return a.localeCompare(b,'ru');}).forEach(function(g){
        var gid = prefix + '_grp_' + (i++);
        html += '<div class="ep-db-sub-header" onclick="epDbToggleSubFixed(\''+gid+'\', event)"><span>'+safeHtml(g)+'</span><small>открыть</small></div><div class="ep-db-sub-body" id="'+gid+'">';
        data[c][g].sort(function(a,b){return String(a.n||'').localeCompare(String(b.n||''),'ru');}).forEach(function(it){
          var id = safeHtml(String(it.id||''));
          var meta = [g, it.brand, it.nominal, it.leakage ? it.leakage+'мА' : '', it.rcdType].filter(Boolean).join(' • ');
          var color = type === 'work' ? 'background:var(--orange);' : '';
          html += '<div class="mat-item"><div style="flex:1;"><div class="ep-db-item-title">'+safeHtml(it.n||'Позиция')+'</div><div class="ep-db-item-meta">'+safeHtml(meta)+' '+(Number(it.p)||0)+' ₽ / '+safeHtml(it.u||'шт')+'</div></div><button class="mat-add-btn" style="'+color+' width:auto;margin:0;" onclick="promptAdd(\''+id+'\', \''+type+'\')">+ Добавить</button></div>';
        });
        html += '</div>';
      });
      html += '</div>';
    });
    return html || '<div style="padding:15px;color:var(--gray);font-weight:700;">База пустая или ещё загружается</div>';
  }

  window.epDbToggleSubFixed = function(id,e){
    if(e) e.stopPropagation();
    var el = qs(id);
    if(el) el.classList.toggle('active');
  };

  window.openMatCatalog = function(){
    normalizeDbs();
    var el = qs('mat-cat-list');
    if(el) el.innerHTML = renderGroupedFixed(arrByType('mat'), 'mat', 'mat_fixed');
    if(typeof openModal === 'function') openModal('matCatModal');
  };
  window.openWorkCatalog = function(){
    normalizeDbs();
    var el = qs('work-cat-list');
    if(el) el.innerHTML = renderGroupedFixed(arrByType('work'), 'work', 'work_fixed');
    if(typeof openModal === 'function') openModal('workModal');
  };
  window.renderDbEditors = function(){
    normalizeDbs();
    var cats = qs('db-cats');
    if(cats) {
      var all = arrByType('mat').concat(arrByType('work'));
      cats.innerHTML = Array.from(new Set(all.map(function(x){return x.c || 'Разное';}))).sort(function(a,b){return a.localeCompare(b,'ru');}).map(function(c){return '<option value="'+safeHtml(c)+'">';}).join('');
    }
    var em = qs('editor-mat-list');
    var ew = qs('editor-work-list');
    if(em) em.innerHTML = renderGroupedFixed(arrByType('mat'), 'mat', 'dbmat_fixed');
    if(ew) ew.innerHTML = renderGroupedFixed(arrByType('work'), 'work', 'dbwork_fixed');
  };

  function reqDisplayName(label, meta){
    meta = meta || {};
    var brand = meta.brand || detectBrand(label);
    var nominal = meta.nominal || detectNominal(label);
    var kind = String(meta.kind || '').toLowerCase();
    var leakage = meta.leakage || detectLeakage(label);
    var rcdType = meta.rcdType || detectRcdType(label);

    if(kind.indexOf('automatic') >= 0 || kind.indexOf('breaker') >= 0 || /^C\d+/i.test(nominal)) {
      return ('Автомат ' + (nominal || '') + (brand ? ' ' + brand : '')).trim();
    }
    if(kind.indexOf('dif') >= 0 || /диф/i.test(label)) {
      return ('ДИФ ' + (leakage ? leakage + 'мА ' : '') + (rcdType ? rcdType + ' ' : '') + (brand || '')).trim();
    }
    if(kind.indexOf('uzo') >= 0 || /узо/i.test(label)) {
      return ('УЗО ' + (leakage ? leakage + 'мА ' : '') + (rcdType ? rcdType + ' ' : '') + (brand || '')).trim();
    }
    return String(label || 'Позиция').replace(/\s+—\s+.*$/,'').trim();
  }

  function strictFindMaterial(label, meta){
    normalizeDbs();
    meta = meta || {};
    var arr = arrByType('mat');
    var brand = meta.brand || detectBrand(label) || '';
    var nominal = meta.nominal || detectNominal(label) || '';
    var kind = String(meta.kind || '').toLowerCase();
    var leakage = meta.leakage || detectLeakage(label);
    var rcdType = meta.rcdType || detectRcdType(label);
    var isBreaker = kind.indexOf('automatic') >= 0 || kind.indexOf('breaker') >= 0 || !!nominal;
    var isDif = kind.indexOf('dif') >= 0 || /диф/i.test(label);
    var isUzo = kind.indexOf('uzo') >= 0 || /узо/i.test(label);

    var best = null, bestScore = -999;
    arr.forEach(function(it){
      var blob = norm([it.c,it.g,it.sc,it.subcategory,it.kind,it.brand,it.nominal,it.leakage,it.rcdType,it.n].filter(Boolean).join(' '));
      var raw = String(it.n || '');
      var score = 0;

      if(isBreaker) {
        if(!(blob.indexOf('автомат') >= 0 || String(it.kind||'').toLowerCase().indexOf('automatic') >= 0 || String(it.kind||'').toLowerCase().indexOf('breaker') >= 0)) return;
        if(nominal && blob.replace(/\s+/g,'').indexOf(norm(nominal).replace(/\s+/g,'')) < 0) return;
        score += 20;
      }

      if(isDif) {
        if(blob.indexOf('диф') < 0 && String(it.kind||'').toLowerCase().indexOf('dif') < 0) return;
        if(leakage && blob.indexOf(norm(leakage + 'ма')) < 0 && String(it.leakage||'') !== String(leakage)) return;
        if(rcdType && blob.indexOf(norm(rcdType)) < 0 && String(it.rcdType||'').toUpperCase() !== String(rcdType).toUpperCase()) score -= 3;
        if(norm(raw) === 'диф' || norm(raw) === 'дифы') score -= 100;
        score += 20;
      }

      if(isUzo) {
        if(blob.indexOf('узо') < 0 && String(it.kind||'').toLowerCase().indexOf('uzo') < 0) return;
        if(leakage && blob.indexOf(norm(leakage + 'ма')) < 0 && String(it.leakage||'') !== String(leakage)) return;
        if(rcdType && blob.indexOf(norm(rcdType)) < 0 && String(it.rcdType||'').toUpperCase() !== String(rcdType).toUpperCase()) score -= 3;
        if(norm(raw) === 'узо') score -= 100;
        score += 20;
      }

      if(brand) {
        if(blob.indexOf(norm(brand)) >= 0) score += 15;
        else score -= 30;
      }

      if(!isBreaker && !isDif && !isUzo) {
        var words = norm(label).split(/\s+/).filter(Boolean);
        words.forEach(function(w){ if(blob.indexOf(w) >= 0) score += 1; });
      }

      if(score > bestScore) { bestScore = score; best = it; }
    });

    if(best && bestScore >= 10) return best;
    return null;
  }

  window.epMat = function(label, q, fallbackPrice, words, meta){
    meta = meta || {};
    var found = strictFindMaterial(label, meta);
    var display = reqDisplayName(label, meta);

    if(found) {
      var foundName = String(found.n || '').trim();
      var generic = /^(диф|узо|автомат)$/i.test(foundName);
      return {
        n: generic ? display : display,
        q: q,
        p: Number(found.p) || Number(fallbackPrice) || 0,
        u: found.u || meta.unit || 'шт',
        type: 'mat',
        sourceId: found.id || null,
        dbMeta: meta,
        epRawLabel: label
      };
    }

    var extra = meta.category ? ' [' + meta.category + (meta.subcategory ? ' → ' + meta.subcategory : '') + ']' : '';
    return {
      n: '⚠️ ' + display + extra + ' — добавить в БД',
      q: q,
      p: Number(fallbackPrice) || 0,
      u: meta.unit || 'шт',
      type: 'mat',
      needDb: true,
      dbMeta: meta,
      epRawLabel: label
    };
  };
  try { epMat = window.epMat; } catch(e) {}

  function cleanCanonicalName(it){
    var n = String((it && it.n) || '').replace(/^⚠️\s*/,'').replace(/\s*\[[^\]]+\]\s*—\s*добавить в БД/i,'').trim();
    var meta = (it && it.dbMeta) || {};
    if(meta && (meta.kind || meta.nominal || meta.leakage)) return reqDisplayName(n, meta);
    var brand = detectBrand(n);
    var nominal = detectNominal(n);
    if(/автомат/i.test(n) && nominal) return ('Автомат '+nominal+(brand?' '+brand:'')).trim();
    if(/диф/i.test(n)) return reqDisplayName(n, {kind:'dif', brand:brand, leakage:detectLeakage(n), rcdType:detectRcdType(n)});
    if(/узо/i.test(n)) return reqDisplayName(n, {kind:'uzo', brand:brand, leakage:detectLeakage(n), rcdType:detectRcdType(n)});
    return n.replace(/\s+—\s+.*$/,'').trim();
  }

  function lineFromRaw(raw, fallbackName){
    raw = String(raw || '');
    var after = raw.split('—').slice(1).join('—').trim();
    if(after) return after;
    var n = String(fallbackName || raw || '');
    if(/вводн/i.test(n)) return 'Вводная линия';
    if(/реле напряж/i.test(n)) return 'Защита от перенапряжения';
    if(/контактор/i.test(n)) return 'Мастер-кнопка света';
    if(/байпас/i.test(n)) return 'Байпас мастер-кнопки света';
    if(/греб/i.test(n)) return 'Питание модульной автоматики';
    if(/нулев/i.test(n) || /N на группу/i.test(n)) return 'Нулевые шинки по группам защиты';
    if(/PE-шина/i.test(n)) return 'Защитное заземление PE';
    return 'Позиция щита';
  }

  function mergeEstimateFixed(){
    try{
      if(!Array.isArray(currentEstimate)) return;
      var map = new Map();
      currentEstimate.forEach(function(it){
        if(!it) return;
        var originalName = String(it.n || '');
        if(/^ДИФ$/i.test(originalName.trim()) || /^УЗО$/i.test(originalName.trim())) return; // лишняя обобщённая позиция
        var name = cleanCanonicalName(it);
        var key = [it.type||'', it.sourceId||'', name, Number(it.p)||0, it.u||'шт', it.tag||''].join('|');
        if(!map.has(key)) {
          map.set(key, Object.assign({}, it, {
            n: name,
            q: Number(it.q)||0,
            epMergedDetails: [],
            epRawLabels: []
          }));
        } else {
          map.get(key).q += Number(it.q)||0;
        }
        var rec = map.get(key);
        var raw = it.epRawLabel || originalName;
        if(raw && rec.epRawLabels.indexOf(raw) < 0) rec.epRawLabels.push(raw);
        var line = lineFromRaw(raw, name);
        if(line && rec.epMergedDetails.indexOf(line) < 0) rec.epMergedDetails.push(line);
      });
      currentEstimate = Array.from(map.values()).filter(function(x){ return Number(x.q) !== 0; });
    }catch(e){ console.error('mergeEstimateFixed', e); }
  }

  var oldRenderMainTableFixed = window.renderMainTable;
  window.renderMainTable = function(){
    mergeEstimateFixed();
    if(typeof oldRenderMainTableFixed === 'function') oldRenderMainTableFixed();
  };

  window.categorizeEstimateItem = function(it){
    if(!it) return 3;
    if(it.type === 'mat') return 1;
    var n = String(it.n || '').toLowerCase();
    if(n.indexOf('штроб') >= 0 || n.indexOf('высверл') >= 0 || n.indexOf('алмаз') >= 0 || n.indexOf('резк') >= 0 || n.indexOf('отверст') >= 0 || n.indexOf('ниша') >= 0 || n.indexOf('ниши') >= 0) return 2;
    if(n.indexOf('установк') >= 0 || n.indexOf('розетк') >= 0 || n.indexOf('выключат') >= 0 || n.indexOf('рамк') >= 0 || n.indexOf('свет') >= 0 || n.indexOf('люстр') >= 0) {
      if(n.indexOf('подрозетн') < 0 && n.indexOf('щит') < 0) return 4;
    }
    return 3;
  };
  try { categorizeEstimateItem = window.categorizeEstimateItem; } catch(e) {}

  function shieldRowsForDetails(){
    var rows = [];
    (currentEstimate || []).forEach(function(it){
      var n = String((it && it.n) || '');
      if(!/(Автомат|ДИФ|УЗО|Реле|Контактор|Вводной)/i.test(n)) return;

      var details = Array.isArray(it.epMergedDetails) && it.epMergedDetails.length ? it.epMergedDetails.slice() : [lineFromRaw(it.epRawLabel || n, n)];

      if(/ДИФ|УЗО/i.test(n)) {
        if(/10\s*мА/i.test(n)) details = ['Влажные зоны / защита 10 мА'];
        else if(/30\s*мА/i.test(n) && /ДИФ|УЗО/i.test(n)) {
          if(/Климат/i.test(n)) details = ['Климат / кондиционеры / тёплые полы'];
          else if(/Освещ/i.test(n)) details = ['Освещение / группы мастер-кнопки'];
          else if(/Неотключ/i.test(n)) details = ['Неотключаемые группы / холодильник / Нептун / роутер'];
          else if(/Больш/i.test(n)) details = ['Большая техника / плита / бойлер'];
          else if(/Силов/i.test(n)) details = ['Силовые линии / розеточные группы'];
          else details = ['Группа защиты'];
        }
      }

      details.forEach(function(line){
        rows.push({
          line: line,
          app: n,
          note: detailNote(n, line)
        });
      });
    });
    return rows;
  }

  function detailNote(app, line){
    var n = String(app || '');
    if(/Вводной/i.test(n)) return 'ввод питания щита';
    if(/ДИФ|УЗО/i.test(n)) return /10\s*мА/i.test(n) ? 'защита влажных зон 10 мА' : 'групповая защита 30 мА';
    if(/Автомат/i.test(n)) return 'отдельный автомат линии';
    if(/Реле напряж/i.test(n)) return 'защита от перенапряжения';
    if(/Контактор/i.test(n)) return 'мастер-кнопка только на свет';
    return '';
  }

  var oldShowPreviewFixed = window.showPreview;
  window.showPreview = function(mode, isActOverride, customTitle){
    if(mode !== 'details') {
      return oldShowPreviewFixed.apply(this, arguments);
    }

    currentPreviewMode = mode;
    var title = customTitle || 'ДЕТАЛИЗАЦИЯ ЩИТА';
    var html = getPDFHeader(title);
    var filters = qs('pdf-filters');
    if(filters) filters.style.display = 'none';

    var rows = shieldRowsForDetails();

    html += '<table class="pdf-table"><tr><th>Что отвечает / линия</th><th>Аппарат</th><th>Назначение</th></tr>';
    if(!rows.length) {
      html += '<tr><td colspan="3" style="text-align:center;color:var(--gray);">Щит ещё не сгенерирован</td></tr>';
    } else {
      rows.forEach(function(r){
        html += '<tr><td style="font-weight:bold;color:var(--primary);">'+safeHtml(r.line)+'</td><td>'+safeHtml(r.app)+'</td><td>'+safeHtml(r.note)+'</td></tr>';
      });
    }
    html += '</table>';

    var p = qs('p-cont');
    if(p) p.innerHTML = html;
    if(typeof openModal === 'function') openModal('previewModal');
  };
  try { showPreview = window.showPreview; } catch(e) {}

  document.addEventListener('DOMContentLoaded', function(){
    try{ normalizeDbs(); }catch(e){}
    try{
      var em = qs('editor-mat-list'), ew = qs('editor-work-list');
      if(em && em.textContent && em.textContent.indexOf('Позиции не найдены') >= 0) em.innerHTML = renderGroupedFixed(arrByType('mat'), 'mat', 'dbmat_fixed_start');
      if(ew && ew.textContent && ew.textContent.indexOf('Позиции не найдены') >= 0) ew.innerHTML = renderGroupedFixed(arrByType('work'), 'work', 'dbwork_fixed_start');
    }catch(e){}
  });
})();


/* =========================================================
 * SOURCE: legacy/extracted-js-blocks/block-08.js
 * ========================================================= */

/*
 * Extracted from public/index.html
 * Original script block: 8
 * Original HTML lines: 4873-5226
 */

/* === SURGICAL FIX 2026-05-13: global add/upsert + smart swap filter === */
(function(){
  function qs(id){ return document.getElementById(id); }
  function toast(msg){ if(typeof showToast === 'function') showToast(msg); else alert(msg); }
  function safe(s){
    return String(s == null ? '' : s).replace(/[&<>"]/g, function(m){
      return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[m];
    });
  }
  function norm(s){
    return String(s || '')
      .toLowerCase()
      .replace(/ё/g,'е')
      .replace(/×/g,'x')
      .replace(/с/g,'c')
      .replace(/а/g,'a')
      .replace(/в/g,'b')
      .replace(/[^a-zа-я0-9]+/g,' ')
      .trim();
  }

  function localArr(type){
    try{
      var arr = type === 'work' ? workDB : matDB;
      if(!Array.isArray(arr)) arr = [];
      if(type === 'mat' && !arr.length && typeof FULL_MAT_INIT !== 'undefined') { matDB = (FULL_MAT_INIT || []).slice(); arr = matDB; }
      if(type === 'work' && !arr.length && typeof FULL_WORK_INIT !== 'undefined') { workDB = (FULL_WORK_INIT || []).slice(); arr = workDB; }
      return arr;
    }catch(e){ return []; }
  }
  function setLocalArr(type, arr){
    try{ if(type === 'work') workDB = arr || []; else matDB = arr || []; }catch(e){}
  }

  function getGroup(it){ return (it && (it.g || it.sc || it.subcategory || it.group)) || ''; }
  function itemKey(type, it){
    if(!it) return '';
    if(it.id) return 'id:' + String(it.id);
    return 'sig:' + type + '|' + norm([it.c,getGroup(it),it.n,it.u].filter(Boolean).join('|'));
  }
  function sigKey(type, it){
    return 'sig:' + type + '|' + norm([it && it.c, getGroup(it), it && it.n, it && it.u].filter(Boolean).join('|'));
  }
  function deletedSet(type){
    try{
      var k = type === 'work' ? 'ep_deleted_work_ids_local_v1' : 'ep_deleted_mat_ids_local_v1';
      return new Set(JSON.parse(localStorage.getItem(k) || '[]'));
    }catch(e){ return new Set(); }
  }
  function saveLocalDb(){
    try{
      if(typeof safeSet === 'function'){
        safeSet('user_db_mat_v31', JSON.stringify(localArr('mat')));
        safeSet('user_db_work_v31', JSON.stringify(localArr('work')));
      } else {
        localStorage.setItem('user_db_mat_v31', JSON.stringify(localArr('mat')));
        localStorage.setItem('user_db_work_v31', JSON.stringify(localArr('work')));
      }
    }catch(e){}
    try{
      if(typeof db !== 'undefined' && db && typeof appUser !== 'undefined' && appUser && appUser.uid){
        db.collection('user_db').doc(appUser.uid).set({
          uid: appUser.uid,
          name: appUser.name || appUser.email || '',
          matDB: localArr('mat'),
          workDB: localArr('work'),
          updatedAt: new Date().toISOString()
        }, { merge:true });
      }
    }catch(e){}
  }

  window.EP_GLOBAL_DB_VISIBLE_CACHE = window.EP_GLOBAL_DB_VISIBLE_CACHE || { matDB: [], workDB: [], loadedAt: 0 };
  window.EP_GLOBAL_DB_TAB_FIXED = window.EP_GLOBAL_DB_TAB_FIXED || 'mat';

  async function loadGlobalDb(force){
    if(!force && window.EP_GLOBAL_DB_VISIBLE_CACHE.loadedAt && Date.now() - window.EP_GLOBAL_DB_VISIBLE_CACHE.loadedAt < 12000){
      return window.EP_GLOBAL_DB_VISIBLE_CACHE;
    }
    var cache = { matDB: [], workDB: [], loadedAt: Date.now() };
    try{
      if(typeof db !== 'undefined' && db){
        var doc = await db.collection('settings').doc('global_db').get();
        if(doc.exists){
          var d = doc.data() || {};
          cache.matDB = Array.isArray(d.matDB) ? d.matDB : [];
          cache.workDB = Array.isArray(d.workDB) ? d.workDB : [];
        }
      }
    }catch(e){ console.warn('global_db read error', e); }
    if(!cache.matDB.length) cache.matDB = localArr('mat').slice();
    if(!cache.workDB.length) cache.workDB = localArr('work').slice();
    window.EP_GLOBAL_DB_VISIBLE_CACHE = cache;
    return cache;
  }

  function mergedArr(type){
    var local = localArr(type).map(function(x){ return Object.assign({}, x, {__src:'local'}); });
    var cache = window.EP_GLOBAL_DB_VISIBLE_CACHE || {};
    var global = (type === 'work' ? (cache.workDB || []) : (cache.matDB || [])).map(function(x){ return Object.assign({}, x, {__src:'global'}); });
    var del = deletedSet(type);
    var map = new Map();

    local.forEach(function(it){
      var k1 = itemKey(type,it), k2 = sigKey(type,it);
      if(del.has(k1) || del.has(k2)) return;
      map.set(k2, it);
    });
    global.forEach(function(it){
      var k1 = itemKey(type,it), k2 = sigKey(type,it);
      if(del.has(k1) || del.has(k2)) return;
      if(!map.has(k2)) map.set(k2, it);
    });
    return Array.from(map.values());
  }

  function groupHtml(arr, type, prefix, mode){
    var data = {};
    (arr || []).forEach(function(it){
      var c = it.c || 'Разное';
      var g = getGroup(it) || 'Разное';
      if(!data[c]) data[c] = {};
      if(!data[c][g]) data[c][g] = [];
      data[c][g].push(it);
    });
    var html = '', idx = 0;
    Object.keys(data).sort(function(a,b){return a.localeCompare(b,'ru');}).forEach(function(c){
      var cid = prefix + '_c_' + (idx++);
      var catStyle = type === 'work' ? 'style="color:var(--orange);background:rgba(245,158,11,.08);"' : '';
      html += '<div class="cat-header" '+catStyle+' onclick="toggleCat(\''+cid+'\')">'+safe(c)+'</div><div class="cat-body" id="'+cid+'">';
      Object.keys(data[c]).sort(function(a,b){return a.localeCompare(b,'ru');}).forEach(function(g){
        var gid = prefix + '_g_' + (idx++);
        html += '<div class="ep-db-sub-header" onclick="epToggleSmartSub(\''+gid+'\', event)"><span>'+safe(g)+'</span><small>открыть</small></div><div class="ep-db-sub-body" id="'+gid+'">';
        data[c][g].sort(function(a,b){return String(a.n||'').localeCompare(String(b.n||''),'ru');}).forEach(function(it){
          var k = sigKey(type,it);
          var src = it.__src === 'global' ? '<span style="color:#8B5CF6;font-weight:900;">🌍 серверная</span>' : '<span style="color:#10B981;font-weight:900;">👤 моя</span>';
          var meta = safe(g) + ' • ' + src + ' • ' + (Number(it.p)||0) + ' ₽ / ' + safe(it.u || 'шт');
          if(mode === 'global'){
            html += '<label class="mat-item ep-select-row">' +
              '<input type="checkbox" class="ep-global-check" data-key="'+safe(k)+'" data-type="'+type+'" style="width:22px;height:22px;accent-color:var(--primary);">' +
              '<div style="flex:1;"><div class="ep-db-item-title">'+safe(it.n || 'Позиция')+'</div><div class="ep-db-item-meta">'+meta+'</div></div></label>';
          } else {
            var color = type === 'work' ? 'background:var(--orange);' : '';
            html += '<div class="mat-item"><div style="flex:1;"><div class="ep-db-item-title">'+safe(it.n || 'Позиция')+'</div><div class="ep-db-item-meta">'+meta+'</div></div>' +
              '<button class="mat-add-btn" style="'+color+'width:auto;margin:0;" onclick="promptAdd(\''+safe(k)+'\', \''+type+'\')">+ Добавить</button></div>';
          }
        });
        html += '</div>';
      });
      html += '</div>';
    }

/* =========================================================
 * PDF FUNCTION: downloadJson
 * ========================================================= */
function downloadJson(filename,data){
    var blob=new Blob([JSON.stringify(data,null,2)],{type:'application/json;charset=utf-8'});
    var url=URL.createObjectURL(blob);
    var a=document.createElement('a'); a.href=url; a.download=filename; document.body.appendChild(a); a.click(); a.remove();
    setTimeout(function(){URL.revokeObjectURL(url);},1000);
  }
  

/* =========================================================
 * PDF FUNCTION: fileText
 * ========================================================= */
function fileText(file){ return new Promise(function(resolve,reject){ var r = new FileReader(); r.onload = function(){ resolve(String(r.result || '')); }; r.onerror = reject; r.readAsText(file); }); }
  

/* =========================================================
 * PDF FUNCTION: fileBuffer
 * ========================================================= */
function fileBuffer(file){ return new Promise(function(resolve,reject){ var r = new FileReader(); r.onload = function(){ resolve(r.result); }; r.onerror = reject; r.readAsArrayBuffer(file); }); }
  

/* =========================================================
 * PDF FUNCTION: renderReviewPage
 * ========================================================= */
function renderReviewPage(){
    var st = window.EP_DB_REVIEW_V6;
    window.EP_DB_REVIEW = { type: st.type, items: st.items, source: st.source };
    var title = $('ep-db-ai-review-title');
    if(title) title.innerText = 'Импорт ' + (st.type === 'work' ? 'работ' : 'материалов') + ': ' + (st.source || 'файл');
    var list = $('ep-db-ai-review-list');
    if(!list) return;
    var total = st.items.length;
    if(!total){
      list.innerHTML = '<div style="padding:12px;color:var(--danger);font-weight:800;">Позиции не найдены. Проверьте файл или попробуйте импортировать другой формат.</div>';
      return;
    }
    var pages = Math.max(1, Math.ceil(total / PAGE_SIZE));
    st.page = Math.max(0, Math.min(st.page || 0, pages - 1));
    var start = st.page * PAGE_SIZE;
    var end = Math.min(start + PAGE_SIZE, total);
    var html = '<div style="position:sticky;top:0;z-index:2;background:var(--card-bg,rgba(255,255,255,.95));padding:8px;border-radius:12px;margin-bottom:8px;border:1px solid var(--border);">' +
      '<b>Найдено: ' + total + '</b> • выбрано: <b id="ep-v6-selected-count">' + selectedCount() + '</b><br>' +
      '<span style="font-size:11px;color:var(--gray);">Показаны строки ' + (start+1) + '–' + end + ' из ' + total + '. Большой файл не грузится весь на экран, поэтому телефон не зависает.</span>' +
      '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:8px;">' +
      '<button type="button" class="btn-info" onclick="epReviewPageV6(-1)" ' + (st.page<=0?'disabled':'') + '>← Назад</button>' +
      '<button type="button" class="btn-info" onclick="epReviewPageV6(1)" ' + (st.page>=pages-1?'disabled':'') + '>Вперёд →</button>' +
      '</div></div>';
    for(var i=start;i<end;i++){
      var it = st.items[i] || {};
      var ed = st.editCache[i] || it;
      html += '<div class="ep-db-review-row">' +
        '<input type="checkbox" id="ep-db-check-' + i + '" ' + (st.selected[i] !== false ? 'checked' : '') + ' onchange="epReviewToggleV6(' + i + ', this.checked)">' +
        '<div class="ep-db-review-fields">' +
          '<div><label>Имя</label><input id="ep-db-name-' + i + '" value="' + esc(ed.n || '') + '" placeholder="Имя / наименование"></div>' +
          '<div class="ep-db-review-2col">' +
            '<div><label>Категория</label><input id="ep-db-cat-' + i + '" value="' + esc(ed.c || 'Разное') + '" placeholder="Категория"></div>' +
            '<div><label class="ep-db-subcat-label">Подкатегория</label><input id="ep-db-subcat-' + i + '" value="' + esc(ed.sc || ed.g || 'Разное') + '" placeholder="Подкатегория"></div>' +
          '</div>' +
          '<div class="ep-db-review-2col">' +
            '<div><label>Цена за единицу</label><input id="ep-db-price-' + i + '" type="number" step="0.01" value="' + (Number(ed.p)||0) + '" placeholder="Цена"></div>' +
            '<div><label>Единица</label><input id="ep-db-unit-' + i + '" value="' + esc(ed.u || 'шт') + '" placeholder="шт / м / упак"></div>' +
          '</div>' +
        '</div></div>';
    }
    list.innerHTML = html;
    setTimeout(hardHideLoader, 0);
  }
  

/* =========================================================
 * PDF FUNCTION: readDbFileV6
 * ========================================================= */
async function readDbFileV6(file,type){
    var safety = setTimeout(hardHideLoader, 25000);
    showReadLoader('Читаю файл...', '📥');
    try{
      var name = file.name || '';
      var lower = name.toLowerCase();
      var items = [];
      if(file.type && file.type.indexOf('image/') === 0){
        items = await aiFromImage(file,type);
      } else if(/\.json$/i.test(lower)){
        var txt = await fileText(file);
        items = jsonToItems(JSON.parse(txt), type);
      } else if(/\.(xlsx|xls)$/i.test(lower)){
        if(!window.XLSX) throw new Error('Библиотека XLSX не загрузилась. Сохраните файл как CSV или JSON.');
        var ab = await fileBuffer(file);
        var wb = XLSX.read(ab, {type:'array'});
        var rows = [];
        wb.SheetNames.forEach(function(sh){
          var ws = wb.Sheets[sh];
          rows = rows.concat(XLSX.utils.sheet_to_json(ws, {header:1, defval:''}));
        });
        items = rowsToItems(rows,type);
      } else if(/\.csv$/i.test(lower)){
        items = rowsToItems(csvRows(await fileText(file)), type);
      } else {
        var raw = await fileText(file);
        items = rowsToItems(csvRows(raw), type);
        if(!items.length) items = await aiFromText(raw,type);
      }
      clearTimeout(safety);
      hardHideLoader();
      showReview(items,type,name);
    }catch(e){
      clearTimeout(safety);
      hardHideLoader();
      toast('❌ ' + (e.message || 'Ошибка импорта'));
      console.error('EP V6 import error', e);
    }
  }
  

/* =========================================================
 * PDF FUNCTION: fileTextProgress
 * ========================================================= */
function fileTextProgress(file,onp){ return new Promise(function(resolve,reject){ var r=new FileReader(); r.onprogress=function(e){ if(e.lengthComputable&&onp)onp(Math.min(45,10+e.loaded/e.total*35),'Чтение файла');}; r.onload=function(){resolve(String(r.result||''));}; r.onerror=reject; r.readAsText(file); }); }
  

/* =========================================================
 * PDF FUNCTION: fileBufferProgress
 * ========================================================= */
function fileBufferProgress(file,onp){ return new Promise(function(resolve,reject){ var r=new FileReader(); r.onprogress=function(e){ if(e.lengthComputable&&onp)onp(Math.min(45,10+e.loaded/e.total*35),'Чтение файла');}; r.onload=function(){resolve(r.result);}; r.onerror=reject; r.readAsArrayBuffer(file); }); }
  

/* =========================================================
 * PDF FUNCTION: readDbFile
 * ========================================================= */
async function readDbFile(file,type,target){ showProgress('Импорт базы',5,'Старт'); var name=file.name||'', lower=name.toLowerCase(), items=[]; if(file.type&&file.type.indexOf('image/')===0){ hideProgress(); if(typeof window.epAskAI==='function' && typeof oldTrigger==='function'){ return oldTrigger(type); } return toast('Для фото нужен ИИ.'); } if(/\.json$/i.test(lower)){ var txt=await fileTextProgress(file,showProgress); showProgress('Импорт базы',55,'Разбор JSON'); items=jsonToItems(JSON.parse(txt),type); } else if(/\.(xlsx|xls)$/i.test(lower)){ if(!window.XLSX) throw new Error('Библиотека XLSX не загрузилась. Сохраните файл как CSV или JSON.'); var ab=await fileBufferProgress(file,showProgress); showProgress('Импорт базы',55,'Разбор Excel'); var wb=XLSX.read(ab,{type:'array'}), rows=[]; wb.SheetNames.forEach(function(sh){ rows=rows.concat(XLSX.utils.sheet_to_json(wb.Sheets[sh],{header:1,defval:''})); }); showProgress('Импорт базы',78,'Подготовка строк'); items=rowsToItems(rows,type); } else { var raw=await fileTextProgress(file,showProgress); showProgress('Импорт базы',60,'Разбор текста/CSV'); items=rowsToItems(csvRows(raw),type); }
    showProgress('Импорт базы',100,'Открываю проверку'); setTimeout(hideProgress,250); showReview(items,type,name,target); }
  

/* =========================================================
 * PDF FUNCTION: esc
 * ========================================================= */
function esc(s){ return String(s==null?'':s).replace(/[&<>"']/g,function(m){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m];}); }
  function clean(v){ return String(v==null?'':v).replace(/\s+/g,' ').trim(); }
  function norm(s){ return clean(s).toLowerCase().replace(/ё/g,'е').replace(/×/g,'x').replace(/х/g,'x').replace(/[^a-zа-я0-9]+/g,' ').trim(); }
  function money(v){ var n=Number(String(v==null?'':v).replace(',','.').replace(/[^\d.\-]/g,'')); return Number.isFinite(n)?n:0; }
  function scope(){ try{return localStorage.getItem(LS_SCOPE)==='global'?'global':'my';}catch(e){return 'my';} }
  function setScope(s){ try{ localStorage.setItem(LS_SCOPE, s==='global'?'global':'my'); }catch(e){} }
  function isAdmin(){ try{ return !!(window.appUser && window.appUser.role==='admin'); }catch(e){ return false; } }
  function uid(){ try{ return (window.appUser && window.appUser.uid) || (firebase.auth && firebase.auth().currentUser && firebase.auth().currentUser.uid) || ''; }catch(e){ return (window.appUser&&window.appUser.uid)||''; } }
  function currentUserLabel(){ try{ var u=(firebase.auth&&firebase.auth().currentUser)||null; return (u&&(u.email||u.uid)) || (window.appUser&&(appUser.email||appUser.phone||appUser.uid)) || ''; }catch(e){ return (window.appUser&&(appUser.email||appUser.phone||appUser.uid)) || ''; } }
  function readArr(k){ try{ var a=JSON.parse(localStorage.getItem(k)||'[]'); return Array.isArray(a)?a:[]; }catch(e){ return []; } }
  function writeArr(k,a){ try{ if(typeof safeSet==='function') safeSet(k,JSON.stringify(a||[])); else localStorage.setItem(k,JSON.stringify(a||[])); }catch(e){ try{ localStorage.setItem(k,JSON.stringify(a||[])); }catch(_e){} } }
  function readObj(k){ try{ var o=JSON.parse(localStorage.getItem(k)||'{}'); return o&&typeof o==='object'?o:{}; }catch(e){ return {}; } }
  function writeObj(k,o){ try{ localStorage.setItem(k,JSON.stringify(o||{})); }catch(e){} }
  function clone(x){ return Object.assign({},x||{}); }
  function groupOf(it){ return (it&&(it.sc||it.g||it.group||it.subcategory))||''; }
  function sig(type,it){ return type+'|'+norm([it&&it.c,groupOf(it),it&&it.n,it&&it.u].filter(Boolean).join('|')); }
  function unique(arr,type){ var seen={},out=[]; (arr||[]).forEach(function(raw){ var it=clone(raw); if(!clean(it.n))return; if(it.sc&&!it.g)it.g=it.sc; if(it.g&&!it.sc)it.sc=it.g; if(!it.c)it.c='Разное'; if(!it.u)it.u='шт'; if(!it.id)it.id=(type==='work'?'w':'m')+'_v9_'+Date.now()+'_'+Math.random().toString(36).slice(2,8); var k=sig(type,it); if(seen[k])return; seen[k]=1; out.push(it); }); return out; }
  function getServer(type){ var a=type==='work'?window.EP_GLOBAL_WORK:window.EP_GLOBAL_MAT; if(Array.isArray(a)) return a.slice(); var c=readObj(LS_SERVER_CACHE); a=type==='work'?c.workDB:c.matDB; return Array.isArray(a)?a.slice():[]; }
  function getMy(type){ var a=type==='work'?window.EP_MY_WORK:window.EP_MY_MAT; return Array.isArray(a)?a.slice():readArr(type==='work'?LS_MY_WORK:LS_MY_MAT); }
  function setServer(type,arr){ arr=unique(arr,type); if(type==='work') window.EP_GLOBAL_WORK=arr; else window.EP_GLOBAL_MAT=arr; var mat=type==='mat'?arr:getServer('mat'); var work=type==='work'?arr:getServer('work'); writeObj(LS_SERVER_CACHE,{matDB:mat,workDB:work,ts:Date.now()}); try{ window.EP_FORCE_GLOBAL={matDB:mat,workDB:work}; window.EP_ULTIMATE_DB_CACHE={matDB:mat,workDB:work,ts:Date.now()}; window.EP_GLOBAL_DB_VISIBLE_CACHE={matDB:mat,workDB:work,ts:Date.now()}; }catch(e){} if(scope()==='global') syncMain('global'); }
  function setMy(type,arr){ arr=unique(arr,type); if(type==='work') window.EP_MY_WORK=arr; else window.EP_MY_MAT=arr; writeArr(type==='work'?LS_MY_WORK:LS_MY_MAT,arr); try{ window.userMatDB=getMy('mat'); window.userWorkDB=getMy('work'); }catch(e){} if(scope()==='my') syncMain('my'); }
  function syncMain(target){ try{ var use=target||scope(); window.matDB=(use==='global'?getServer('mat'):getMy('mat')); window.workDB=(use==='global'?getServer('work'):getMy('work')); try{ matDB=window.matDB; workDB=window.workDB; }catch(e){} }catch(e){} }
  function upsert(arr,type,it,replace){ arr=Array.isArray(arr)?arr.slice():[]; it=clone(it); if(!it.id)it.id=(type==='work'?'w':'m')+'_imp_v9_'+Date.now()+'_'+Math.random().toString(36).slice(2,8); if(it.sc&&!it.g)it.g=it.sc; if(it.g&&!it.sc)it.sc=it.g; if(!it.c)it.c='Разное'; if(!it.u)it.u='шт'; var k=sig(type,it); var idx=arr.findIndex(function(x){ return sig(type,x)===k || (it.id&&String(x.id||'')===String(it.id)); }); if(idx>=0){ arr[idx]=replace?Object.assign({},it,{id:(arr[idx]&&arr[idx].id)||it.id}):Object.assign({},arr[idx],it,{id:(arr[idx]&&arr[idx].id)||it.id}); } else arr.push(it); return arr; }

  function ensureProgress(){
    if($('ep-v9-progress')) return;
    var d=document.createElement('div'); d.id='ep-v9-progress'; d.style.cssText='position:fixed;inset:0;z-index:100000;background:rgba(15,23,42,.62);display:none;align-items:center;justify-content:center;padding:18px;';
    d.innerHTML='<div style="width:min(460px,94vw);border-radius:20px;background:#fff;box-shadow:0 24px 70px rgba(0,0,0,.35);padding:18px;"><div id="ep-v9-title" style="font-weight:900;color:#4f46e5;font-size:17px;margin-bottom:8px;">Выполняю...</div><div style="height:16px;background:#e5e7eb;border-radius:999px;overflow:hidden;"><div id="ep-v9-fill" style="height:100%;width:0%;background:linear-gradient(90deg,#2563eb,#10b981);transition:width .18s ease;"></div></div><div id="ep-v9-txt" style="font-size:12px;color:#64748b;font-weight:800;margin-top:8px;">0%</div></div>';
    document.body.appendChild(d);
  }
  function progress(title,pct,txt){ ensureProgress(); var p=$('ep-v9-progress'),f=$('ep-v9-fill'),t=$('ep-v9-title'),x=$('ep-v9-txt'); if(p)p.style.display='flex'; if(t)t.textContent=title||'Выполняю...'; if(f)f.style.width=Math.max(0,Math.min(100,Math.round(pct||0)))+'%'; if(x)x.textContent=(txt||'')+' '+Math.max(0,Math.min(100,Math.round(pct||0)))+'%'; try{ if(typeof hideLoader==='function') hideLoader(); }catch(e){} }
  function hideProgress(){ var p=$('ep-v9-progress'); if(p)p.style.display='none'; }
  function explain(e){ var msg=(e&&(e.message||e.code))?String(e.message||e.code):String(e||'Ошибка'); if(/permission|insufficient/i.test(msg)) return 'Firebase запретил запись: Missing or insufficient permissions. Проверь вход админа через Google и Firestore Rules.'; return msg; }

  function inferCat(name,type){
    var n=norm(name); if(type==='work'){ if(/штроб|борозд|резк|алмаз/.test(n))return 'Штробление'; if(/сверл|подрозет/.test(n))return 'Высверливание подрозетников'; if(/щит|автомат|узо|диф|реле/.test(n))return 'Щитовое'; if(/розет|выключ|механизм|рамк|светильник/.test(n))return 'Чистовая электрика'; return 'Работы'; }
    if(/ввг|пугв|провод|кабел|cat|utp|ftp|sat/.test(n))return 'Кабель'; if(/автомат|узо|диф|реле|контактор|узм|уздп/.test(n))return 'Автоматика'; if(/щит|бокс|корпус|din|шина|гребен|клемм/.test(n))return 'Щитовое'; if(/гофр|труб|лоток|канал/.test(n))return 'Трубы'; if(/подрозет|wago|гмл|наконечник|стяж|клипс|дюбел|саморез/.test(n))return 'Расходники'; if(/розет|выключ|рамк|диммер|механизм/.test(n))return 'Чистовое'; return 'Разное';
  }
  function inferSub(name,cat,type){ var n=norm(name); if(type==='work'){ if(/подрозет|сверл/.test(n))return 'Подрозетники'; if(/штроб/.test(n))return 'Штробление'; if(/щит/.test(n))return 'Щит'; return 'Работы'; } if(/диф/.test(n))return 'ДИФы'; if(/узо/.test(n))return 'УЗО'; if(/автомат/.test(n))return 'Автоматы'; if(/гребен/.test(n))return 'Гребёнки'; if(/шина|клемм/.test(n))return 'Шинки / клеммники'; if(/подрозет/.test(n))return 'Подрозетники'; if(/ввг/.test(n))return 'ВВГ'; if(/пугв/.test(n))return 'ПуГВ'; return cat||'Разное'; }
  function normItem(raw,type,idx){ raw=raw||{}; var n=clean(raw.n||raw.name||raw.title||raw.item||raw.position||raw['Наименование']||raw['Название']||raw['Имя']||raw['Позиция']); if(!n)return null; var c=clean(raw.c||raw.category||raw.cat||raw.group||raw['Категория'])||inferCat(n,type); var sc=clean(raw.sc||raw.g||raw.subcategory||raw.subcat||raw['Подкатегория']||raw['Группа'])||inferSub(n,c,type); var p=money(raw.p!=null?raw.p:(raw.price!=null?raw.price:(raw.cost!=null?raw.cost:(raw['Цена']||raw['Стоимость'])))); var u=clean(raw.u||raw.unit||raw.measure||raw['Ед']||raw['Ед.']||raw['Единица']||raw['Ед. изм.'])||'шт'; var it={id:raw.id||((type==='work'?'w':'m')+'_imp_v9_'+Date.now()+'_'+idx),n:n,c:c,sc:sc,g:sc,p:p,u:u}; try{ if(typeof window.epAutoGroupItem==='function') it=window.epAutoGroupItem(type,it); }catch(e){} return it; }
  function collectReviewed(){
    var st=window.EP_DB_REVIEW_V6 || window.EP_DB_REVIEW || {}; var type=st.type==='work'?'work':'mat';
    var start=(st.page||0)*PAGE_SIZE, end=Math.min(start+PAGE_SIZE,(st.items||[]).length);
    st.editCache=st.editCache||{}; st.selected=st.selected||{};
    for(var i=start;i<end;i++){
      var base=(st.items||[])[i]||{}; var ch=$('ep-db-check-'+i); if(ch) st.selected[i]=!!ch.checked;
      var n=$('ep-db-name-'+i), c=$('ep-db-cat-'+i), sc=$('ep-db-subcat-'+i), p=$('ep-db-price-'+i), u=$('ep-db-unit-'+i);
      if(n||c||sc||p||u) st.editCache[i]={n:n?n.value:base.n,c:c?c.value:base.c,sc:sc?sc.value:(base.sc||base.g),p:p?p.value:base.p,u:u?u.value:base.u};
    }
    var out=[]; (st.items||[]).forEach(function(base,i){ if(st.selected&&st.selected[i]===false)return; var ed=(st.editCache&&st.editCache[i])||base||{}; var it=normItem({id:base.id,n:ed.n||base.n,c:ed.c||base.c,sc:ed.sc||ed.g||base.sc||base.g,p:ed.p!=null?ed.p:base.p,u:ed.u||base.u},type,i); if(it)out.push(it); });
    return {type:type,items:unique(out,type)};
  }

  async function readGlobalDoc(){
    if(!(typeof db!=='undefined'&&db)) throw new Error('Firebase db не подключён.');
    var snap=await db.collection('settings').doc('global_db').get();
    var data=snap.exists?(snap.data()||{}):{};
    return {matDB:Array.isArray(data.matDB)?data.matDB:[], workDB:Array.isArray(data.workDB)?data.workDB:[], raw:data};
  }
  async function saveGlobalImport(type,items,replace){
    if(!isAdmin()) throw new Error('Импорт в базу сервера может делать только админ.');
    if(!(typeof db!=='undefined'&&db)) throw new Error('Firebase db не подключён.');
    progress('Запись в базу сервера',20,'Читаю текущую базу сервера');
    var current=await readGlobalDoc().catch(function(){ return {matDB:getServer('mat'),workDB:getServer('work'),raw:{}}; });
    var targetArr=(type==='work'?current.workDB:current.matDB).slice();
    items.forEach(function(it,idx){ targetArr=upsert(targetArr,type,it,!!replace); if(idx%25===0) progress('Запись в базу сервера',25+Math.min(40,idx/Math.max(1,items.length)*40),'Добавляю строки'); });
    var finalMat=type==='mat'?unique(targetArr,'mat'):unique(current.matDB,'mat');
    var finalWork=type==='work'?unique(targetArr,'work'):unique(current.workDB,'work');
    setServer('mat',finalMat); setServer('work',finalWork);
    progress('Запись в базу сервера',72,'Отправляю в Firebase settings/global_db');
    await db.collection('settings').doc('global_db').set({matDB:finalMat,workDB:finalWork,cleanMode:true,updatedAt:new Date().toISOString(),updatedBy:currentUserLabel()}, {merge:true});
    progress('Запись в базу сервера',88,'Проверяю запись');
    var verify=await readGlobalDoc();
    setServer('mat',verify.matDB); setServer('work',verify.workDB); syncMain('global');
    var savedCount=(type==='work'?verify.workDB:verify.matDB).length;
    if(savedCount < items.length) throw new Error('Firebase вернул слишком мало позиций после записи. Проверь правила или структуру settings/global_db.');
    return savedCount;
  }
  async function saveMyImport(type,items,replace){
    var arr=getMy(type); items.forEach(function(it,idx){ arr=upsert(arr,type,it,!!replace); if(idx%25===0) progress('Запись в мою базу',20+Math.min(40,idx/Math.max(1,items.length)*40),'Добавляю строки'); });
    setMy(type,arr); progress('Запись в мою базу',68,'Локально сохранено');
    if(typeof db!=='undefined'&&db&&uid()){
      await db.collection('user_db').doc(uid()).set({uid:uid(),masterName:(window.appUser&&(appUser.name||appUser.email||appUser.phone))||'',matDB:getMy('mat'),workDB:getMy('work'),created:true,updatedAt:new Date().toISOString()}, {merge:true});
      progress('Запись в мою базу',90,'Сервер подтвердил');
    }
    return getMy(type).length;
  }
  async function sendServerProposal(type,items){
    if(!(typeof db!=='undefined'&&db)) throw new Error('Firebase db не подключён.');
    progress('Отправляю заявку админу',60,'db_proposals');
    await db.collection('db_proposals').add({type:type,items:items.map(clone),reason:'import_to_server',target:'server_db',uid:uid(),masterName:(window.appUser&&(appUser.name||appUser.email||appUser.phone))||'',userEmail:currentUserLabel(),status:'pending',createdAt:new Date().toISOString()});
    return true;
  }
  function rerender(){ try{ syncMain(scope()); if(typeof renderDbEditors==='function') renderDbEditors(); }catch(e){} try{ if(typeof rf==='function') rf(); }catch(e){} }

  window.epTriggerDbFileImport=function(type){
    type=type==='work'?'work':'mat';
    var target=scope()==='global'?(isAdmin()?'global':'server_proposal'):'my';
    window.EP_V9_IMPORT_TARGET=target;
    window.EP_V7_IMPORT_TARGET=target;
    if(target==='my') setScope('my');
    var input=$('ep-db-file-input');
    if(!input){ if(typeof oldTrigger==='function') return oldTrigger(type); return toast('Поле выбора файла не найдено'); }
    input.value='';
    input.onchange=function(e){
      window.EP_V9_IMPORT_TARGET=target;
      window.EP_V7_IMPORT_TARGET=target;
      if(typeof oldTrigger==='function'){
        // The old handler is not called here because it would reset onchange.
      }
      var file=e.target.files&&e.target.files[0];
      if(!file)return;
      // Use the existing reader if V7/V6 already installed it by calling original read through old public handler is impossible,
      // so reproduce the simple reliable path: delegate to oldTrigger only when no FileReader parser exists is not safe.
      // Instead call the latest visible V7 trigger parser by temporarily restoring target and using old input reader fallback if present.
      if(window.epReadDbFileV9){ return window.epReadDbFileV9(file,type,target); }
      toast('Ошибка: парсер импорта V9 не загрузился');
    };
    input.click();
  };

  function fileText(file){ return new Promise(function(res,rej){ var r=new FileReader(); r.onload=function(){res(String(r.result||''));}; r.onerror=rej; r.readAsText(file); }); }
  function fileBuffer(file){ return new Promise(function(res,rej){ var r=new FileReader(); r.onload=function(){res(r.result);}; r.onerror=rej; r.readAsArrayBuffer(file); }); }
  function csvRows(txt){ return String(txt||'').split(/\r?\n/).map(function(line){ return line.split(';').length>=line.split(',').length?line.split(';'):line.split(','); }); }
  function rowsToItems(rows,type){
    rows=rows||[]; var header=null,currentCat='',currentSub='',out=[];
    function cell(row,i){ return clean((row||[])[i]); }
    rows.forEach(function(row){
      row=(row||[]).map(clean); var non=row.filter(Boolean); if(!non.length)return;
      var joined=norm(non.join(' '));
      if(/наимен|назван|имя|позиция|товар|работ|цена|стоим|ед/.test(joined)&&!header){
        header={}; row.forEach(function(v,i){ var s=norm(v); if(/наимен|назван|имя|позиция|товар|материал|работ/.test(s))header.name=i; if(/категор/.test(s)&&header.cat==null)header.cat=i; if(/подкат|группа|раздел/.test(s))header.sub=i; if(/цена|стоим|прайс/.test(s))header.price=i; if(/ед|изм/.test(s))header.unit=i; }); return;
      }
      var priceIdx=-1,unitIdx=-1;
      row.forEach(function(v,i){ if(priceIdx<0&&money(v)>0&&/^[-\d\s.,]+/.test(v))priceIdx=i; if(unitIdx<0&&/^(шт|м|м\.п\.?|пог\.м|уп|упак|компл|кг|л|рул|бухта)$/i.test(v))unitIdx=i; });
      if(header){ var hn=cell(row,header.name); if(hn)out.push(normItem({n:hn,c:cell(row,header.cat),sc:cell(row,header.sub),p:cell(row,header.price),u:cell(row,header.unit)},type,out.length)); return; }
      if(priceIdx<0&&non.length<=2){ var title=non.join(' '); if(type==='work'||/работ|монтаж|штроб|резк|сверл|демонтаж/i.test(title)){currentCat=title;currentSub='';} else if(!currentCat)currentCat=title; else currentSub=title; return; }
      var candidates=row.map(function(v,i){return {v:v,i:i};}).filter(function(x){return x.v&&x.i!==priceIdx&&x.i!==unitIdx&&!/^[-\d\s.,]+$/.test(x.v);});
      if(!candidates.length)return; candidates.sort(function(a,b){return b.v.length-a.v.length;}); var name=candidates[0].v; if(name.length<3)return;
      out.push(normItem({n:name,c:currentCat||inferCat(name,type),sc:currentSub||inferSub(name,currentCat,type),p:priceIdx>=0?row[priceIdx]:0,u:unitIdx>=0?row[unitIdx]:'шт'},type,out.length));
    });
    return out.filter(Boolean);
  }
  function jsonToItems(raw,type){ if(raw&&raw.matDB&&type==='mat')raw=raw.matDB; else if(raw&&raw.workDB&&type==='work')raw=raw.workDB; else if(raw&&Array.isArray(raw.items))raw=raw.items; else if(raw&&Array.isArray(raw.data))raw=raw.data; else if(raw&&typeof raw==='object'&&!Array.isArray(raw))raw=Object.keys(raw).map(function(k){return raw[k];}); if(!Array.isArray(raw))raw=[]; return raw.map(function(x,i){return normItem(x,type,i);}).filter(Boolean); }
  function showReviewV9(items,type,source,target){
    items=unique((items||[]).filter(Boolean),type); var selected={}; items.forEach(function(_,i){selected[i]=true;});
    window.EP_DB_REVIEW_V6={type:type,items:items,source:source||'',page:0,selected:selected,editCache:{}};
    window.EP_DB_REVIEW={type:type,items:items,source:source||''}; window.EP_V9_IMPORT_TARGET=target; window.EP_V7_IMPORT_TARGET=target;
    var title=$('ep-db-ai-review-title'); if(title) title.innerText='Импорт '+(type==='work'?'работ':'материалов')+': '+(source||'файл')+' → '+(target==='global'?'База сервера':target==='server_proposal'?'Заявка админу':'Моя база');
    if(typeof window.epReviewPageV6==='function') window.epReviewPageV6(0); else {
      var list=$('ep-db-ai-review-list'); if(list) list.innerHTML=items.map(function(it,i){ return '<div class="ep-db-review-row"><input type="checkbox" id="ep-db-check-'+i+'" checked><div class="ep-db-review-fields"><div><label>Имя</label><input id="ep-db-name-'+i+'" value="'+esc(it.n)+'"></div><div class="ep-db-review-2col"><div><label>Категория</label><input id="ep-db-cat-'+i+'" value="'+esc(it.c)+'"></div><div><label>Подкатегория</label><input id="ep-db-subcat-'+i+'" value="'+esc(it.sc||it.g||'Разное')+'"></div></div><div class="ep-db-review-2col"><div><label>Цена</label><input id="ep-db-price-'+i+'" type="number" value="'+(Number(it.p)||0)+'"></div><div><label>Единица</label><input id="ep-db-unit-'+i+'" value="'+esc(it.u||'шт')+'"></div></div></div></div>'; }).join('');
    }
    try{ if(typeof openModal==='function') openModal('ep-db-ai-review-modal'); }catch(e){ var m=$('ep-db-ai-review-modal'); if(m)m.style.display='flex'; }
    setTimeout(hideProgress,200);
  }
  window.epReadDbFileV9=async function(file,type,target){
    progress('Импорт базы',5,'Читаю файл');
    try{
      var name=file.name||'', lower=name.toLowerCase(), items=[];
      if(/\.json$/i.test(lower)){ var txt=await fileText(file); progress('Импорт базы',45,'Разбор JSON'); items=jsonToItems(JSON.parse(txt),type); }
      else if(/\.(xlsx|xls)$/i.test(lower)){ if(!window.XLSX) throw new Error('Библиотека XLSX не загрузилась. Сохраните файл как CSV или JSON.'); var ab=await fileBuffer(file); progress('Импорт базы',45,'Разбор Excel'); var wb=XLSX.read(ab,{type:'array'}), rows=[]; wb.SheetNames.forEach(function(sh){ rows=rows.concat(XLSX.utils.sheet_to_json(wb.Sheets[sh],{header:1,defval:''})); }); progress('Импорт базы',75,'Подготовка строк'); items=rowsToItems(rows,type); }
      else if(/\.csv$/i.test(lower)){ items=rowsToItems(csvRows(await fileText(file)),type); }
      else if(file.type&&file.type.indexOf('image/')===0){ hideProgress(); if(typeof oldTrigger==='function') return oldTrigger(type); throw new Error('Для фото нужен старый ИИ-импорт.'); }
      else { items=rowsToItems(csvRows(await fileText(file)),type); }
      progress('Импорт базы',100,'Открываю проверку'); showReviewV9(items,type,name,target);
    }catch(e){ hideProgress(); toast('❌ '+explain(e)); console.error('EP V9 read import failed',e); }
  };

  window.epOpenTextImport=function(type){
    type=type==='work'?'work':'mat'; var target=scope()==='global'?(isAdmin()?'global':'server_proposal'):'my'; window.EP_V9_IMPORT_TARGET=target; window.EP_V7_IMPORT_TARGET=target;
    if(typeof oldOpenText==='function') return oldOpenText(type);
    var t=$('ep-text-import-title'); if(t)t.innerText='Импорт '+(type==='work'?'работ':'материалов')+' из текста'; var v=$('ep-text-import-value'); if(v)v.value=''; try{openModal('ep-text-import-modal');}catch(e){}
  };

  window.epApplyReviewedDbItems=async function(mode){
    var data=collectReviewed(), type=data.type, items=data.items; if(!items.length) return toast('Нет выбранных позиций');
    var target=window.EP_V9_IMPORT_TARGET || window.EP_V7_IMPORT_TARGET || (scope()==='global'?(isAdmin()?'global':'server_proposal'):'my');
    progress(target==='global'?'Запись в базу сервера':target==='server_proposal'?'Отправка заявки':'Запись в мою базу',10,'Подготовка');
    try{
      var total=0;
      if(target==='global'){
        total=await saveGlobalImport(type,items,mode==='replace');
        setScope('global'); syncMain('global'); rerender();
        try{ if(typeof closeModal==='function') closeModal('ep-db-ai-review-modal'); }catch(e){}
        progress('Запись в базу сервера',100,'Готово'); setTimeout(hideProgress,500);
        toast('✅ Импорт улетел в базу сервера и сохранён: '+items.length+' поз. Сейчас на сервере: '+total+'.');
      } else if(target==='server_proposal'){
        await sendServerProposal(type,items); try{ if(typeof closeModal==='function') closeModal('ep-db-ai-review-modal'); }catch(e){}
        progress('Отправка заявки',100,'Готово'); setTimeout(hideProgress,500); toast('✅ Импорт отправлен админу заявкой: '+items.length+' поз.');
      } else {
        setScope('my'); total=await saveMyImport(type,items,mode==='replace'); syncMain('my'); rerender(); try{ if(typeof closeModal==='function') closeModal('ep-db-ai-review-modal'); }catch(e){}
        progress('Запись в мою базу',100,'Готово'); setTimeout(hideProgress,500); toast('✅ Импорт сохранён в моей базе: '+items.length+' поз. Сейчас в моей базе: '+total+'.');
      }
    }catch(e){ hideProgress(); toast('❌ '+explain(e)); console.error('EP V9 apply import failed',e); }
    finally{ window.EP_V9_IMPORT_TARGET=null; window.EP_V7_IMPORT_TARGET=null; }
  };

  window.epFirebaseDbDebug=function(){
    var info={scope:scope(),target:window.EP_V9_IMPORT_TARGET||window.EP_V7_IMPORT_TARGET||'',isAdmin:isAdmin(),uid:uid(),user:currentUserLabel(),serverMat:getServer('mat').length,serverWork:getServer('work').length,myMat:getMy('mat').length,myWork:getMy('work').length};
    console.log('EP V9 Firebase DB debug',info);
    alert('Проверка базы V9\n\nАктивно: '+(scope()==='global'?'База сервера':'Моя база')+'\nЦель импорта: '+(info.target||'не выбрана')+'\nАдмин: '+(info.isAdmin?'да':'нет')+'\nПользователь: '+(info.user||'нет')+'\nUID: '+(info.uid||'нет')+'\nСервер: '+info.serverMat+' мат / '+info.serverWork+' раб\nМоя база: '+info.myMat+' мат / '+info.myWork+' раб');
    return info;
  };

  try{ syncMain(scope()); }catch(e){}
})();


/* =========================================================
 * SOURCE: legacy/extracted-js-blocks/block-18.js
 * ========================================================= */

/*
 * Extracted from public/index.html
 * Original script block: 18
 * Original HTML lines: 8625-8829
 */

/* === EP DB AI PHOTO/PDF IMPORT FIX V10 ===
   Fixes V9: photo import was delegated to the old picker and PDF was not handled.
   Does not touch shield logic.
*/
(function(){
  var oldAskAI = window.epAskAI;

  function $(id){ return document.getElementById(id); }
  function toast(t){ try{ if(typeof showToast==='function') showToast(t); else alert(t); }catch(e){ console.log(t); } }
  function progress(title,pct,text){
    try{ if(typeof window.epDbProgress==='function') return window.epDbProgress(title,pct,text); }catch(e){}
    try{ if(typeof showLoader==='function') showLoader((text||title||'Загрузка') + (pct!=null?' '+pct+'%':''),'🤖'); }catch(e){}
  }
  function hideProgress(){ try{ if(typeof window.epDbHideProgress==='function') return window.epDbHideProgress(); }catch(e){} try{ if(typeof hideLoader==='function') hideLoader(); }catch(e){} }
  function clean(v){ return String(v==null?'':v).replace(/\s+/g,' ').trim(); }
  function esc(s){ return String(s==null?'':s).replace(/[&<>"']/g,function(m){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m];}); }
  function money(v){ var n=Number(String(v==null?'':v).replace(',','.').replace(/[^\d.\-]/g,'')); return Number.isFinite(n)?n:0; }
  function provider(){
    try{ var p=(window.EP_AI_CONFIG&&window.EP_AI_CONFIG.provider)||safeGet('ep_ai_provider_v1','gemini'); return p==='openai'?'openai':'gemini'; }catch(e){ return 'gemini'; }
  }
  function keyForProvider(p){
    try{
      if(p==='openai') return (window.EP_AI_CONFIG&&window.EP_AI_CONFIG.openaiKey)||safeGet('ep_openai_key_v1','');
      return (window.EP_AI_CONFIG&&window.EP_AI_CONFIG.geminiKey)||(typeof GEMINI_API_KEY!=='undefined'?GEMINI_API_KEY:'')||safeGet('gemini_key_v31','');
    }catch(e){ return ''; }
  }
  function openAiModel(){ try{ return (window.EP_AI_CONFIG&&window.EP_AI_CONFIG.openaiModel)||safeGet('ep_openai_model_v1','gpt-4o-mini')||'gpt-4o-mini'; }catch(e){ return 'gpt-4o-mini'; } }
  function dataMime(dataUrl){ var m=String(dataUrl||'').match(/^data:([^;]+);base64,/i); return m?m[1]:''; }
  function fileToDataURL(file){ return new Promise(function(res,rej){ var r=new FileReader(); r.onload=function(){res(String(r.result||''));}; r.onerror=rej; r.readAsDataURL(file); }); }
  function extractTextFromOpenAI(data){
    if(data && data.output_text) return data.output_text;
    var out='';
    ((data&&data.output)||[]).forEach(function(item){ ((item&&item.content)||[]).forEach(function(c){ if(c&&c.text) out+=c.text; if(c&&c.type==='output_text'&&c.text) out+=c.text; }); });
    return out;
  }
  async function askOpenAI(promptText, opts){
    var key=keyForProvider('openai'); if(!key) throw new Error('Нужен OpenAI API ключ');
    var content=[{type:'input_text', text:promptText}];
    if(opts && opts.fileDataUrl){
      content.push({ type:'input_file', filename: opts.fileName || 'import.pdf', file_data: opts.fileDataUrl });
    } else if(opts && opts.imageDataUrl){
      content.push({ type:'input_image', image_url: opts.imageDataUrl, detail: opts.imageDetail || 'high' });
    }
    var r=await fetch('https://api.openai.com/v1/responses',{
      method:'POST', headers:{'Content-Type':'application/json','Authorization':'Bearer '+key},
      body:JSON.stringify({ model:openAiModel(), input:[{role:'user', content:content}], max_output_tokens:(opts&&opts.maxTokens)||9000 })
    });
    var data=await r.json().catch(function(){return {};});
    if(!r.ok || data.error) throw new Error((data.error&&data.error.message)||'OpenAI API error');
    return extractTextFromOpenAI(data);
  }
  async function askGemini(promptText, opts){
    var key=keyForProvider('gemini'); if(!key) throw new Error('Нужен Gemini API ключ');
    var parts=[{text:promptText}];
    var dataUrl=(opts&&opts.fileDataUrl)||(opts&&opts.imageDataUrl)||'';
    if(dataUrl){
      var m=dataUrl.match(/^data:([^;]+);base64,(.*)$/i);
      if(m) parts.push({ inline_data:{ mime_type:m[1], data:m[2] } });
    }
    var url='https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key='+encodeURIComponent(key);
    var r=await fetch(url,{ method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({contents:[{parts:parts}]}) });
    var data=await r.json().catch(function(){return {};});
    if(!r.ok || data.error) throw new Error((data.error&&data.error.message)||'Gemini API error');
    return ((((data.candidates||[])[0]||{}).content||{}).parts||[]).map(function(p){return p.text||'';}).join('');
  }

  window.epAskAI = async function(promptText, opts){
    opts = opts || {};
    if(opts.fileDataUrl || opts.imageDataUrl){
      var p=provider();
      if(p==='openai') return askOpenAI(promptText, opts);
      return askGemini(promptText, opts);
    }
    if(typeof oldAskAI==='function') return oldAskAI(promptText, opts);
    var pp=provider(); return pp==='openai'?askOpenAI(promptText, opts):askGemini(promptText, opts);
  };

  function stripCode(t){ return String(t||'').replace(/```json/gi,'').replace(/```[a-z]*/gi,'').replace(/```/g,'').trim(); }
  function parseJsonLoose(t){
    var s=stripCode(t).replace(/[“”]/g,'"').replace(/[‘’]/g,"'").replace(/,\s*([}\]])/g,'$1');
    try{ var v=JSON.parse(s); if(Array.isArray(v))return v; if(v&&typeof v==='object')return v.items||v.positions||v.rows||v.data||v.result||v.materials||v.works||v['позиции']||[]; }catch(e){}
    var m=s.match(/\[[\s\S]*\]/); if(m){ try{return JSON.parse(m[0].replace(/,\s*([}\]])/g,'$1'));}catch(e){} }
    return [];
  }
  function inferCat(name,type){
    var n=String(name||'').toLowerCase();
    if(type==='work'){
      if(/штроб|борозд|резк|алмаз/.test(n))return 'Штробление';
      if(/подрозет|сверл/.test(n))return 'Высверливание подрозетников';
      if(/щит|автомат|узо|диф/.test(n))return 'Щитовое';
      if(/розет|выключ|механизм|рамк|светильник/.test(n))return 'Чистовая электрика';
      if(/кабел|провод|гофр|труб|короб/.test(n))return 'Черновая электрика';
      return 'Работы';
    }
    if(/ввг|пугв|пвс|кабел|провод|cat|utp|ftp|sat|коаксиал/.test(n))return 'Кабель';
    if(/гофр|труб|лоток|клипс/.test(n))return 'Трубы';
    if(/автомат|узо|диф|реле|контактор|щит|бокс|din|дин|шина|кросс/.test(n))return 'Автоматика';
    if(/подрозет|короб|клемм|wago|гмл|изол|саморез|дюбел|стяжк|наконечник|ншви/.test(n))return 'Расходники';
    if(/розет|выключ|рамк|механизм|диммер|терморег/.test(n))return 'Чистовое';
    if(/tv|интернет|rj|слаботоч/.test(n))return 'Слаботочка';
    return 'Разное';
  }
  function inferSub(name,cat,type){
    var n=String(name||'').toLowerCase();
    if(type==='work'){
      if(/штроб|борозд/.test(n))return 'Штробление';
      if(/подрозет|сверл/.test(n))return 'Подрозетники';
      if(/щит/.test(n))return 'Щит';
      if(/розет|выключ|механизм/.test(n))return 'Чистовая установка';
      return 'Работы';
    }
    if(/ввг/.test(n))return 'ВВГ'; if(/пугв|пу ?гв|пв-?3/.test(n))return 'ПУГВ';
    if(/utp|ftp|cat|rj/.test(n))return 'UTP/FTP'; if(/sat|tv|коаксиал/.test(n))return 'TV/SAT';
    if(/диф/.test(n))return 'ДИФы'; if(/узо/.test(n))return 'УЗО'; if(/автомат/.test(n))return 'Автоматы';
    if(/щит|бокс|шкаф|корпус/.test(n))return 'Щиты/корпуса'; if(/подрозет/.test(n))return 'Подрозетники';
    if(/клемм|wago|гмл|шина/.test(n))return 'Клеммы/соединители'; if(/ншви|наконеч/.test(n))return 'Наконечники';
    if(/розет/.test(n))return 'Розетки'; if(/выключ/.test(n))return 'Выключатели'; if(/рамк/.test(n))return 'Рамки';
    return 'Разное';
  }
  function normItem(x,type,i){
    x=x||{};
    var name=clean(x.n||x.name||x.title||x.item||x.position||x.material||x.work||x['Имя']||x['Название']||x['Наименование']||x['Товар']||x['Материал']||x['Работа']||x['позиция']||'');
    if(!name || name.length<3)return null;
    var cat=clean(x.c||x.cat||x.category||x.group||x['Категория']||x['Группа']||'')||inferCat(name,type);
    var sc=clean(x.sc||x.subcat||x.subcategory||x.subCategory||x.section||x.g||x['Подкатегория']||x['Раздел']||'')||inferSub(name,cat,type);
    var unit=clean(x.u||x.unit||x.measure||x['Ед']||x['Ед.']||x['Единица']||x['Единица измерения']||'шт')||'шт';
    var price=x.p||x.price||x.cost||x.unitPrice||x['Цена']||x['Цена ₽']||x['Цена за единицу']||x['Стоимость']||0;
    return { id:x.id||((type==='work'?'w':'m')+'_ai_v10_'+Date.now()+'_'+i), n:name, c:cat, sc:sc, g:sc, p:money(price), u:unit };
  }
  function normalize(raw,type){ var arr=Array.isArray(raw)?raw:(raw&&typeof raw==='object'?(raw.items||raw.positions||raw.data||raw.materials||raw.works||raw['позиции']||[]):[]); return (arr||[]).map(function(x,i){return normItem(x,type,i);}).filter(Boolean); }
  function unique(items,type){ var seen={}; return (items||[]).filter(function(it){ var k=[it.n,it.c,it.sc,it.u,Number(it.p)||0].join('|').toLowerCase(); if(seen[k])return false; seen[k]=1; return true; }); }
  function showReview(items,type,source,target,raw){
    items=unique(items,type);
    var selected={}; items.forEach(function(_,i){selected[i]=true;});
    window.EP_DB_REVIEW_V6={type:type,items:items,source:source||'',page:0,selected:selected,editCache:{}};
    window.EP_DB_REVIEW={type:type,items:items,source:source||''};
    window.EP_V9_IMPORT_TARGET=target; window.EP_V7_IMPORT_TARGET=target;
    var title=$('ep-db-ai-review-title'); if(title) title.innerText='Импорт '+(type==='work'?'работ':'материалов')+': '+(source||'файл')+' → '+(target==='global'?'База сервера':target==='server_proposal'?'Заявка админу':'Моя база');
    if(!items.length){ var list=$('ep-db-ai-review-list'); if(list) list.innerHTML='<div style="padding:12px;color:var(--danger);font-weight:900;">ИИ не нашёл позиции. Попробуй фото крупнее/ровнее или PDF с таблицей.</div><details style="font-size:11px;color:var(--gray);"><summary>Ответ ИИ</summary><pre style="white-space:pre-wrap;max-height:240px;overflow:auto;">'+esc(raw||'')+'</pre></details>'; }
    else if(typeof window.epReviewPageV6==='function') window.epReviewPageV6(0);
    else { var list2=$('ep-db-ai-review-list'); if(list2) list2.innerHTML=items.map(function(it,i){return '<div class="ep-db-review-row"><input type="checkbox" id="ep-db-check-'+i+'" checked><div class="ep-db-review-fields"><div><label>Имя</label><input id="ep-db-name-'+i+'" value="'+esc(it.n)+'"></div><div class="ep-db-review-2col"><div><label>Категория</label><input id="ep-db-cat-'+i+'" value="'+esc(it.c)+'"></div><div><label>Подкатегория</label><input id="ep-db-subcat-'+i+'" value="'+esc(it.sc||'Разное')+'"></div></div><div class="ep-db-review-2col"><div><label>Цена</label><input id="ep-db-price-'+i+'" type="number" value="'+(Number(it.p)||0)+'"></div><div><label>Единица</label><input id="ep-db-unit-'+i+'" value="'+esc(it.u||'шт')+'"></div></div></div></div>';}).join(''); }
    try{ if(typeof openModal==='function') openModal('ep-db-ai-review-modal'); }catch(e){ var m=$('ep-db-ai-review-modal'); if(m)m.style.display='flex'; }
    setTimeout(hideProgress,200);
  }
  function importPrompt(type, kind){
    return 'Ты профессионально распознаёшь русские прайсы, счета, сметы и таблицы электромонтажных '+(type==='work'?'работ':'материалов')+'. '+
      'Источник: '+kind+'. Извлеки ВСЕ строки с позициями. Верни ТОЛЬКО JSON массив объектов без текста вокруг. '+
      'Формат строго: [{"n":"Имя позиции","c":"Категория","sc":"Подкатегория","p":123,"u":"шт"}]. '+
      'n — полное наименование, не артикул и не номер строки. p — цена за единицу, не итоговая сумма; если цены нет p=0. '+
      'u — единица: шт, м, м.п., упак, компл, кг, л. c/sc определи сам по электрике. Не возвращай пустой массив, если видны позиции.';
  }
  async function aiFromImageFile(file,type,target){
    progress('ИИ-импорт фото',15,'Читаю изображение');
    var dataUrl=await fileToDataURL(file);
    progress('ИИ-импорт фото',35,'Отправляю в ИИ');
    var ans=await window.epAskAI(importPrompt(type,'фото или скрин таблицы'),{imageDataUrl:dataUrl,imageDetail:'high',maxTokens:9000});
    progress('ИИ-импорт фото',85,'Разбираю ответ');
    var items=normalize(parseJsonLoose(ans),type);
    showReview(items,type,file.name||'фото',target,ans);
  }
  async function aiFromPdfFile(file,type,target){
    var maxMb=18;
    if(file.size && file.size > maxMb*1024*1024) throw new Error('PDF слишком большой. Сделай файл до '+maxMb+' МБ или загрузи несколько страниц отдельно.');
    progress('ИИ-импорт PDF',15,'Читаю PDF');
    var dataUrl=await fileToDataURL(file);
    progress('ИИ-импорт PDF',35,'Отправляю PDF в ИИ');
    var ans=await window.epAskAI(importPrompt(type,'PDF прайс/счёт/смета'),{fileDataUrl:dataUrl,fileName:file.name||'import.pdf',mimeType:dataMime(dataUrl)||'application/pdf',maxTokens:12000});
    progress('ИИ-импорт PDF',85,'Разбираю ответ');
    var items=normalize(parseJsonLoose(ans),type);
    showReview(items,type,file.name||'PDF',target,ans);
  }

  var oldReadV9 = window.epReadDbFileV9;
  window.epReadDbFileV9 = async function(file,type,target){
    type = type==='work'?'work':'mat'; target = target || (function(){ try{return localStorage.getItem('ep_db_scope_v2')==='global'&&window.appUser&&appUser.role==='admin'?'global':'my';}catch(e){return 'my';} })();
    try{
      var name=(file&&file.name)||'', lower=name.toLowerCase();
      if(file && file.type && file.type.indexOf('image/')===0) return aiFromImageFile(file,type,target);
      if(/\.pdf$/i.test(lower) || (file&&file.type==='application/pdf')) return aiFromPdfFile(file,type,target);
      if(typeof oldReadV9==='function') return oldReadV9(file,type,target);
      throw new Error('Парсер импорта не найден');
    }catch(e){ hideProgress(); toast('❌ '+(e.message||'Ошибка ИИ-импорта')); console.error('EP V10 AI import error',e); }
  };

  var oldTrigger=window.epTriggerDbFileImport;
  window.epTriggerDbFileImport=function(type){
    var input=$('ep-db-file-input');
    if(input) input.setAttribute('accept','.xlsx,.xls,.csv,.json,.txt,.pdf,image/*');
    if(typeof oldTrigger==='function') return oldTrigger(type);
  };

  function patchLabels(){
    var input=$('ep-db-file-input'); if(input) input.setAttribute('accept','.xlsx,.xls,.csv,.json,.txt,.pdf,image/*');
    Array.prototype.forEach.call(document.querySelectorAll('button'),function(b){
      var t=clean(b.textContent);
      if(t.indexOf('Excel')>=0 && t.indexOf('PDF')<0 && (t.indexOf('Материалы')>=0 || t.indexOf('Работы')>=0)){
        b.innerHTML=b.innerHTML.replace('фото / скрин','фото / PDF / скрин').replace('Excel / JSON','Excel / JSON / PDF');
      }
    });
  }
  document.addEventListener('DOMContentLoaded',function(){ setTimeout(patchLabels,500); setTimeout(patchLabels,1600); });
  document.addEventListener('click',function(){ setTimeout(patchLabels,120); });
})();


/* =========================================================
 * SOURCE: legacy/extracted-js-blocks/block-19.js
 * ========================================================= */

/*
 * Extracted from public/index.html
 * Original script block: 19
 * Original HTML lines: 8832-9134
 */

/* === EP DB ADMIN SETTINGS + AI STABILITY V11 ===
   Surgical patch:
   1) Normal "База данных" no longer writes/imports into server DB just because user is admin.
   2) Server DB write/import mode is enabled only from Settings -> Admin panel.
   3) AI photo/PDF import gets real progress overlay, image compression and timeout so it cannot hang forever at 35%.
   Does not touch shield logic.
*/
(function(){
  if(window.EP_DB_ADMIN_SETTINGS_AI_STABILITY_V11) return;
  window.EP_DB_ADMIN_SETTINGS_AI_STABILITY_V11 = true;

  function $(id){ return document.getElementById(id); }
  function txt(el){ return String((el && (el.textContent || el.innerText)) || '').replace(/\s+/g,' ').trim(); }
  function toast(t){ try{ if(typeof showToast==='function') showToast(t); else alert(t); }catch(e){ console.log(t); } }
  function scope(){ try{ return localStorage.getItem('ep_db_scope_v2') === 'global' ? 'global' : 'my'; }catch(e){ return 'my'; } }
  function isAdmin(){
    try{
      var u = window.appUser || {};
      var email = String(u.email || u.userEmail || u.mail || '').toLowerCase();
      return !!(u.role === 'admin' || u.isAdmin === true || email === 'vits0007@gmail.com');
    }catch(e){ return false; }
  }
  function adminServerMode(){ return !!(window.EP_ADMIN_SERVER_DB_EDIT === true && isAdmin()); }
  function explainServerEdit(){ return '🌍 Базу сервера меняем только через Настройки → Админ панель → База сервера. Здесь сервер открыт для просмотра/выбора, чтобы случайно не залить личный импорт в глобальную базу.'; }

  function ensureProgress(){
    if($('ep-v11-progress')) return;
    var d = document.createElement('div');
    d.id = 'ep-v11-progress';
    d.style.cssText = 'position:fixed;inset:0;z-index:100000;background:rgba(15,23,42,.64);display:none;align-items:center;justify-content:center;padding:18px;';
    d.innerHTML = '<div style="width:min(460px,94vw);border-radius:22px;background:var(--card-bg,#fff);box-shadow:0 24px 70px rgba(0,0,0,.35);padding:18px;border:1px solid var(--border,#e5e7eb);">'
      + '<div id="ep-v11-progress-title" style="font-weight:900;color:var(--primary,#4f46e5);font-size:17px;margin-bottom:8px;">Выполняю...</div>'
      + '<div style="height:16px;background:rgba(148,163,184,.25);border-radius:999px;overflow:hidden;border:1px solid rgba(148,163,184,.35);"><div id="ep-v11-progress-fill" style="height:100%;width:0%;background:linear-gradient(90deg,#2563eb,#10b981);transition:width .18s ease;"></div></div>'
      + '<div id="ep-v11-progress-txt" style="font-size:12px;color:var(--gray,#64748b);font-weight:800;margin-top:8px;">0%</div>'
      + '<div id="ep-v11-progress-hint" style="font-size:11px;color:var(--gray,#64748b);margin-top:8px;line-height:1.35;">Не закрывай экран до завершения.</div>'
      + '</div>';
    document.body.appendChild(d);
  }
  window.epDbProgress = function(title,pct,text){
    ensureProgress();
    var p=$('ep-v11-progress'), f=$('ep-v11-progress-fill'), t=$('ep-v11-progress-title'), x=$('ep-v11-progress-txt');
    var n = Math.max(0, Math.min(100, Math.round(Number(pct)||0)));
    if(p) p.style.display='flex';
    if(t) t.textContent = title || 'Выполняю...';
    if(f) f.style.width = n + '%';
    if(x) x.textContent = (text || '') + ' ' + n + '%';
    try{ if(typeof hideLoader==='function') hideLoader(); }catch(e){}
  };
  window.epDbHideProgress = function(){
    var p=$('ep-v11-progress'); if(p) p.style.display='none';
    try{ if(typeof hideLoader==='function') hideLoader(); }catch(e){}
  };

  function setScope(s){
    try{ localStorage.setItem('ep_db_scope_v2', s === 'global' ? 'global' : 'my'); }catch(e){}
    try{ if(typeof window.epSetDbScope === 'function') window.epSetDbScope(s === 'global' ? 'global' : 'my'); }catch(e){}
  }
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

  var oldOpenModal = window.openModal;
  if(typeof oldOpenModal === 'function' && !oldOpenModal.__ep_v11_wrapped){
    var wrappedOpen = function(id){
      if(id === 'settModal' && !window.EP_OPENING_ADMIN_SERVER_DB){
        window.EP_ADMIN_SERVER_DB_EDIT = false;
      }
      var r = oldOpenModal.apply(this, arguments);
      setTimeout(patchDbUi,120);
      return r;
    };
    wrappedOpen.__ep_v11_wrapped = true;
    window.openModal = wrappedOpen;
  }

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

  function normalDbButtonWasClicked(e){
    var b = e && e.target && e.target.closest ? e.target.closest('button') : null;
    if(!b) return false;
    var s = txt(b);
    return /База данных/.test(s) && !/База сервера/.test(s) && b.id !== 'ep-v11-admin-server-db-btn';
  }
  document.addEventListener('click', function(e){
    if(normalDbButtonWasClicked(e)) window.EP_ADMIN_SERVER_DB_EDIT = false;
    setTimeout(function(){ installAdminSettingsButton(); patchDbUi(); },80);
  }, true);

  var oldSetDbScope = window.epSetDbScope;
  if(typeof oldSetDbScope === 'function' && !oldSetDbScope.__ep_v11_wrapped){
    var wrappedScope = function(s){
      var r = oldSetDbScope.apply(this, arguments);
      setTimeout(patchDbUi,120);
      return r;
    };
    wrappedScope.__ep_v11_wrapped = true;
    window.epSetDbScope = wrappedScope;
  }

  function patchDbUi(){
    installAdminSettingsButton();
    var isGlobal = scope() === 'global';
    var serverEdit = adminServerMode();
    var panel = $('ep-v7-db-panel');
    if(panel){
      var oldNote = $('ep-v11-server-mode-note'); if(oldNote) oldNote.remove();
      var note = document.createElement('div');
      note.id = 'ep-v11-server-mode-note';
      note.style.cssText = 'font-size:11px;font-weight:900;line-height:1.35;margin:8px 0;padding:9px;border-radius:12px;';
      if(isGlobal && serverEdit){
        note.style.border = '1px solid var(--danger)'; note.style.color = 'var(--danger)'; note.style.background='rgba(239,68,68,.08)';
        note.textContent = '👑 Режим админа: разрешены импорт, замена, цены и сохранение базы сервера.';
        panel.insertBefore(note, panel.firstChild);
      } else if(isGlobal){
        note.style.border = '1px solid var(--border)'; note.style.color = 'var(--gray)'; note.style.background='rgba(100,116,139,.08)';
        note.textContent = explainServerEdit();
        panel.insertBefore(note, panel.firstChild);
      }
      Array.prototype.forEach.call(panel.querySelectorAll('button'), function(btn){
        var s=txt(btn);
        if(isGlobal && !serverEdit && /Импорт|текстом|заявк|Сохранить базу|Очистка сервера|Очистка \/ сброс/.test(s)){
          btn.style.display='none';
        }
      });
    }
    var addBtn = document.querySelector('#settModal button[onclick="addDbItem()"]');
    if(addBtn){
      var block=addBtn.parentElement;
      if(block) block.style.display = (!isGlobal || serverEdit) ? 'block' : 'none';
      addBtn.textContent = isGlobal ? '+ Добавить в базу сервера' : '+ Добавить в мою базу';
    }
    if(isGlobal && !serverEdit){
      Array.prototype.forEach.call(document.querySelectorAll('#editor-mat-list input,#editor-work-list input,#editor-mat-list select,#editor-work-list select,#editor-mat-list textarea,#editor-work-list textarea'), function(el){ el.disabled = true; });
      Array.prototype.forEach.call(document.querySelectorAll('#editor-mat-list button,#editor-work-list button'), function(btn){
        var s=txt(btn);
        if(/Сохранить|Удалить|Замени|✕|🗑/.test(s)) btn.style.display='none';
      });
    }
  }

  var oldAddDbItem = window.addDbItem;
  if(typeof oldAddDbItem === 'function' && !oldAddDbItem.__ep_v11_wrapped){
    var wrappedAdd = function(){
      if(scope()==='global' && !adminServerMode()) return toast(explainServerEdit());
      return oldAddDbItem.apply(this, arguments);
    };
    wrappedAdd.__ep_v11_wrapped = true;
    window.addDbItem = wrappedAdd;
  }
  var oldSaveActive = window.epSaveActiveDbV7;
  if(typeof oldSaveActive === 'function' && !oldSaveActive.__ep_v11_wrapped){
    var wrappedSave = async function(){
      if(scope()==='global' && !adminServerMode()) return toast(explainServerEdit());
      return oldSaveActive.apply(this, arguments);
    };
    wrappedSave.__ep_v11_wrapped = true;
    window.epSaveActiveDbV7 = wrappedSave;
  }

  function importTarget(){
    if(scope() === 'global'){
      if(adminServerMode()) return 'global';
      return 'blocked_server_edit';
    }
    return 'my';
  }
  var oldTriggerImport = window.epTriggerDbFileImport;
  window.epTriggerDbFileImport = function(type){
    type = type === 'work' ? 'work' : 'mat';
    var target = importTarget();
    if(target === 'blocked_server_edit') return toast(explainServerEdit());
    window.EP_V9_IMPORT_TARGET = target;
    window.EP_V7_IMPORT_TARGET = target;
    if(target === 'my') setScope('my');
    var input = $('ep-db-file-input');
    if(!input){ if(typeof oldTriggerImport === 'function') return oldTriggerImport(type); return toast('Поле выбора файла не найдено'); }
    input.setAttribute('accept','.xlsx,.xls,.csv,.json,.txt,.pdf,image/*');
    input.value = '';
    input.onchange = function(e){
      var file = e.target.files && e.target.files[0];
      if(!file) return;
      window.EP_V9_IMPORT_TARGET = target;
      window.EP_V7_IMPORT_TARGET = target;
      if(typeof window.epReadDbFileV9 === 'function') return window.epReadDbFileV9(file,type,target);
      return toast('Парсер импорта не найден');
    };
    input.click();
  };

  var oldOpenText = window.epOpenTextImport;
  window.epOpenTextImport = function(type){
    type = type === 'work' ? 'work' : 'mat';
    var target = importTarget();
    if(target === 'blocked_server_edit') return toast(explainServerEdit());
    window.EP_DB_REVIEW = window.EP_DB_REVIEW || {};
    window.EP_DB_REVIEW.type = type;
    window.EP_V9_IMPORT_TARGET = target;
    window.EP_V7_IMPORT_TARGET = target;
    if(target === 'my') setScope('my');
    var title = $('ep-text-import-title'); if(title) title.textContent = 'Импорт ' + (type==='work'?'работ':'материалов') + ' из текста → ' + (target==='global'?'База сервера':'Моя база');
    var val = $('ep-text-import-value'); if(val) val.value = '';
    try{ if(typeof openModal === 'function') openModal('ep-text-import-modal'); }catch(e){ var m=$('ep-text-import-modal'); if(m)m.style.display='flex'; }
  };

  var oldApply = window.epApplyReviewedDbItems;
  if(typeof oldApply === 'function' && !oldApply.__ep_v11_wrapped){
    var wrappedApply = async function(mode){
      var target = window.EP_V9_IMPORT_TARGET || window.EP_V7_IMPORT_TARGET || (scope()==='global'?'global':'my');
      if(target === 'global' && !adminServerMode()){
        window.EP_V9_IMPORT_TARGET = null; window.EP_V7_IMPORT_TARGET = null;
        return toast(explainServerEdit());
      }
      return oldApply.apply(this, arguments);
    };
    wrappedApply.__ep_v11_wrapped = true;
    window.epApplyReviewedDbItems = wrappedApply;
  }

  async function compressImageDataUrl(dataUrl){
    dataUrl = String(dataUrl || '');
    if(!/^data:image\//i.test(dataUrl)) return dataUrl;
    if(dataUrl.length < 1200000) return dataUrl;
    return new Promise(function(resolve){
      var img = new Image();
      img.onload = function(){
        try{
          var maxSide = 1700;
          var w = img.naturalWidth || img.width || 0, h = img.naturalHeight || img.height || 0;
          if(!w || !h) return resolve(dataUrl);
          var k = Math.min(1, maxSide / Math.max(w,h));
          var canvas = document.createElement('canvas');
          canvas.width = Math.max(1, Math.round(w*k));
          canvas.height = Math.max(1, Math.round(h*k));
          var ctx = canvas.getContext('2d');
          ctx.drawImage(img,0,0,canvas.width,canvas.height);
          resolve(canvas.toDataURL('image/jpeg',0.82));
        }catch(e){ resolve(dataUrl); }
      };
      img.onerror = function(){ resolve(dataUrl); };
      img.src = dataUrl;
    });
  }
  function timeoutPromise(ms, label){
    return new Promise(function(_,reject){
      setTimeout(function(){ reject(new Error(label || 'ИИ долго не отвечает. Попробуй фото крупнее/светлее, меньший PDF или другой ИИ-провайдер.')); }, ms);
    });
  }
  var oldAskAI = window.epAskAI;
  if(typeof oldAskAI === 'function' && !oldAskAI.__ep_v11_wrapped){
    var wrappedAsk = async function(promptText, opts){
      opts = opts || {};
      var isFile = !!(opts.imageDataUrl || opts.fileDataUrl);
      var title = opts.fileDataUrl ? 'ИИ-импорт PDF' : (opts.imageDataUrl ? 'ИИ-импорт фото' : 'ИИ');
      var pct = 36;
      var timer = null;
      try{
        if(opts.imageDataUrl){
          window.epDbProgress(title,28,'Сжимаю фото для телефона');
          opts = Object.assign({}, opts, { imageDataUrl: await compressImageDataUrl(opts.imageDataUrl) });
        }
        if(isFile){
          timer = setInterval(function(){
            pct = Math.min(82, pct + 4);
            window.epDbProgress(title,pct,'ИИ обрабатывает файл, жду ответ');
          }, 4500);
        }
        var ms = opts.fileDataUrl ? 120000 : (opts.imageDataUrl ? 90000 : 70000);
        return await Promise.race([oldAskAI.call(this, promptText, opts), timeoutPromise(ms)]);
      }finally{
        if(timer) clearInterval(timer);
      }
    };
    wrappedAsk.__ep_v11_wrapped = true;
    window.epAskAI = wrappedAsk;
  }

  function patchAll(){ installAdminSettingsButton(); patchDbUi(); }
  document.addEventListener('DOMContentLoaded', function(){ setTimeout(patchAll,300); setTimeout(patchAll,1200); });
  setInterval(function(){ var m=$('settModal'); if(m && (m.style.display==='flex' || m.style.display==='block')) patchDbUi(); installAdminSettingsButton(); },900);
})();


/* =========================================================
 * SOURCE: legacy/extracted-js-blocks/block-20.js
 * ========================================================= */

/*
 * Extracted from public/index.html
 * Original script block: 20
 * Original HTML lines: 9137-9406
 */

/* === EP V12 SURGICAL FIX: shield work names + instant swap modal ===
   Fixes:
   1) "Установка БП в щит" no longer appears from shield generator.
   2) Bare wall material work name "Бетон/Кирпич/..." becomes "Штроба 100×50, под трассу кабелей (...)".
   3) Replace-position modal uses already loaded DB caches and never waits forever on Firebase.
   Shield math is not changed.
*/
(function(){
  var V='EP_V12_SWAP_SHIELD_FIX';
  function $(id){ return document.getElementById(id); }
  function toast(t){ try{ if(typeof showToast==='function') showToast(t); else console.log(t); }catch(e){ console.log(t); } }
  function esc(s){ return String(s==null?'':s).replace(/[&<>"']/g,function(m){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m];}); }
  

/* =========================================================
 * PDF FUNCTION: readGlobalDoc
 * ========================================================= */
async function readGlobalDoc(){
    if(!(typeof db!=='undefined'&&db)) throw new Error('Firebase db не подключён.');
    var snap=await db.collection('settings').doc('global_db').get();
    var data=snap.exists?(snap.data()||{}):{};
    return {matDB:Array.isArray(data.matDB)?data.matDB:[], workDB:Array.isArray(data.workDB)?data.workDB:[], raw:data};
  }
  

/* =========================================================
 * PDF FUNCTION: fileToDataURL
 * ========================================================= */
function fileToDataURL(file){ return new Promise(function(res,rej){ var r=new FileReader(); r.onload=function(){res(String(r.result||''));}; r.onerror=rej; r.readAsDataURL(file); }); }
  

/* =========================================================
 * PDF FUNCTION: aiFromImageFile
 * ========================================================= */
async function aiFromImageFile(file,type,target){
    progress('ИИ-импорт фото',15,'Читаю изображение');
    var dataUrl=await fileToDataURL(file);
    progress('ИИ-импорт фото',35,'Отправляю в ИИ');
    var ans=await window.epAskAI(importPrompt(type,'фото или скрин таблицы'),{imageDataUrl:dataUrl,imageDetail:'high',maxTokens:9000});
    progress('ИИ-импорт фото',85,'Разбираю ответ');
    var items=normalize(parseJsonLoose(ans),type);
    showReview(items,type,file.name||'фото',target,ans);
  }
  

/* =========================================================
 * PDF FUNCTION: aiFromPdfFile
 * ========================================================= */
async function aiFromPdfFile(file,type,target){
    var maxMb=18;
    if(file.size && file.size > maxMb*1024*1024) throw new Error('PDF слишком большой. Сделай файл до '+maxMb+' МБ или загрузи несколько страниц отдельно.');
    progress('ИИ-импорт PDF',15,'Читаю PDF');
    var dataUrl=await fileToDataURL(file);
    progress('ИИ-импорт PDF',35,'Отправляю PDF в ИИ');
    var ans=await window.epAskAI(importPrompt(type,'PDF прайс/счёт/смета'),{fileDataUrl:dataUrl,fileName:file.name||'import.pdf',mimeType:dataMime(dataUrl)||'application/pdf',maxTokens:12000});
    progress('ИИ-импорт PDF',85,'Разбираю ответ');
    var items=normalize(parseJsonLoose(ans),type);
    showReview(items,type,file.name||'PDF',target,ans);
  }

  

/* =========================================================
 * PDF FUNCTION: patchLabels
 * ========================================================= */
function patchLabels(){
    var input=$('ep-db-file-input'); if(input) input.setAttribute('accept','.xlsx,.xls,.csv,.json,.txt,.pdf,image/*');
    Array.prototype.forEach.call(document.querySelectorAll('button'),function(b){
      var t=clean(b.textContent);
      if(t.indexOf('Excel')>=0 && t.indexOf('PDF')<0 && (t.indexOf('Материалы')>=0 || t.indexOf('Работы')>=0)){
        b.innerHTML=b.innerHTML.replace('фото / скрин','фото / PDF / скрин').replace('Excel / JSON','Excel / JSON / PDF');
      }
    });
  }
  

/* =========================================================
 * PDF FUNCTION: compressImageDataUrl
 * ========================================================= */
async function compressImageDataUrl(dataUrl){
    dataUrl = String(dataUrl || '');
    if(!/^data:image\//i.test(dataUrl)) return dataUrl;
    if(dataUrl.length < 1200000) return dataUrl;
    return new Promise(function(resolve){
      var img = new Image();
      img.onload = function(){
        try{
          var maxSide = 1700;
          var w = img.naturalWidth || img.width || 0, h = img.naturalHeight || img.height || 0;
          if(!w || !h) return resolve(dataUrl);
          var k = Math.min(1, maxSide / Math.max(w,h));
          var canvas = document.createElement('canvas');
          canvas.width = Math.max(1, Math.round(w*k));
          canvas.height = Math.max(1, Math.round(h*k));
          var ctx = canvas.getContext('2d');
          ctx.drawImage(img,0,0,canvas.width,canvas.height);
          resolve(canvas.toDataURL('image/jpeg',0.82));
        }catch(e){ resolve(dataUrl); }
      };
      img.onerror = function(){ resolve(dataUrl); };
      img.src = dataUrl;
    });
  }
  

/* =========================================================
 * PDF FUNCTION: showDetailsV16
 * ========================================================= */
function showDetailsV16(customTitle){
    normalizeV16();
    try{ currentPreviewMode='details'; }catch(e){}
    var html = (typeof getPDFHeader==='function') ? getPDFHeader(customTitle || 'ДЕТАЛИЗАЦИЯ ЩИТА') : '<h2>ДЕТАЛИЗАЦИЯ ЩИТА</h2>';
    var f=$('pdf-filters'); if(f) f.style.display='none';
    var items=(window.currentEstimate||[]).filter(isShieldDeviceV16);
    html += '<table class="pdf-table"><tr><th>Что отвечает / линия</th><th>Аппарат</th><th>Назначение</th></tr>';
    if(!items.length) html += '<tr><td colspan="3" style="text-align:center;color:var(--gray);font-weight:900;">Щит ещё не сгенерирован</td></tr>';
    else items.forEach(function(it){
      var lines=getAssignV16(it); if(!lines.length) lines=['назначение не указано — нажми «Сгенерировать щит» ещё раз'];
      html += '<tr><td style="font-weight:bold;color:var(--primary);">'+lines.map(esc).join('<br>')+'</td><td>'+esc(it.n)+(Number(it.q)>1?' × '+Number(it.q):'')+'</td><td>'+esc(purposeV16(it))+'</td></tr>';
    });
    html += '</table>';
    var p=$('p-cont'); if(p) p.innerHTML=html;
    if(typeof openModal==='function') openModal('previewModal');
  }
  
