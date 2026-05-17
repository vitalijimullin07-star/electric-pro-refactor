/*
 * Electric PRO Refactor
 * Module: 01-visual.js
 * V27: визуальные функции вынесены из 00-core.js.
 *
 * Важно:
 * - пока это безопасный перенос/дублирование;
 * - 00-core.js временно остаётся стабильным runtime;
 * - после проверки будем чистить 00-core.js.
 */

console.log("01-visual.js V27 loaded");



/* =========================================================

 * VISUAL FUNCTION: showLoader

 * ========================================================= */

function showLoader(text, icon = '☁️') { document.getElementById('loader-icon').innerText = icon; document.getElementById('loader-text').innerText = text; document.getElementById('global-loader').classList.add('show'); }


/* =========================================================

 * VISUAL FUNCTION: hideLoader

 * ========================================================= */

function hideLoader() { document.getElementById('global-loader').classList.remove('show'); }


/* =========================================================

 * VISUAL FUNCTION: showToast

 * ========================================================= */

function showToast(msg) { let t = document.getElementById('toast'); t.innerText = msg; t.classList.add('show'); setTimeout(() => t.classList.remove('show'), 3000); }


/* =========================================================

 * VISUAL FUNCTION: confirmLogout

 * ========================================================= */

function confirmLogout() { 
    if(auth) auth.signOut(); 
    safeSet('authUser_v31_pin', ''); 
    window.location.reload(); 
}


/* =========================================================

 * VISUAL FUNCTION: openModal

 * ========================================================= */

function openModal(id) { 
    if(id === 'custModal') loadCustHistoryOptions(); 
    if(id === 'logicModal') renderLogicUI(); 
    if(id === 'settModal') renderDbEditors(); 
    if(id === 'configModal') populateShieldExtras();
    if(id === 'buhModal') setTimeout(renderChart, 100);
    document.getElementById(id).style.display='flex'; 
}


/* =========================================================

 * VISUAL FUNCTION: closeModal

 * ========================================================= */

function closeModal(id) { document.getElementById(id).style.display='none'; }


/* =========================================================

 * VISUAL FUNCTION: toggleMenu

 * ========================================================= */

function toggleMenu() { document.getElementById('burger-menu').classList.toggle('open'); document.getElementById('burger-overlay').classList.toggle('open'); }


/* =========================================================

 * VISUAL FUNCTION: changeTheme

 * ========================================================= */

function changeTheme(theme) { document.documentElement.setAttribute('data-theme', theme); safeSet('theme_v31', theme); }


/* =========================================================

 * VISUAL FUNCTION: updateMasterBadge

 * ========================================================= */

function updateMasterBadge() { document.getElementById('master-badge').innerHTML = `${appUser?.name || "Мастер"}<br>Объект: ${cust.name || 'Не выбран'}`; }


/* =========================================================

 * VISUAL FUNCTION: openSwapModal

 * ========================================================= */

function openSwapModal(idx) {
    swapTargetIdx = idx;
    let current = currentEstimate[idx];
    let sel = document.getElementById('swap-select');
    let isMat = current.type === 'mat';
    let dbToUse = isMat ? matDB : workDB;
    
    let opts = dbToUse.map(x => `<option value="${x.id}" ${x.n===current.n ? 'selected' : ''}>${x.n} (${x.p} ₽)</option>`).join('');
    sel.innerHTML = opts;
    openModal('swapModal');
}


/* =========================================================

 * VISUAL FUNCTION: renderMainTable

 * ========================================================= */

function renderMainTable() {
    const tb = document.querySelector("#mainTable tbody"); tb.innerHTML = ""; let total = 0;
    currentEstimate.forEach((it, idx) => {
        let sum = fPrice(it) * it.q; total += sum;
        tb.innerHTML += `<tr>
            <td class="col-name editable-name" onclick="openSwapModal(${idx})" title="Нажмите для замены">${it.n}</td>
            <td class="col-qty"><input type="number" value="${it.q}" onchange="currentEstimate[${idx}].q=Number(this.value); renderMainTable();" style="width:50px; padding:6px; margin:0; text-align:center;"></td>
            <td class="col-sum">${sum} P</td>
            <td style="text-align:right;"><button onclick="currentEstimate.splice(${idx},1);renderMainTable();" class="btn-danger" style="padding:6px; border-radius:8px; width:auto; margin:0;">✕</button></td>
        </tr>`;
    });
    document.getElementById('tot-all').innerText = total.toLocaleString() + ' P'; syncDraft();
}


/* =========================================================

 * VISUAL FUNCTION: openMatCatalog

 * ========================================================= */

function openMatCatalog() { 
    let cats = {}; matDB.forEach(m => { let c = m.c || "ОБЩЕЕ"; if(!cats[c]) cats[c] = []; cats[c].push(m); }); 
    let html = ""; let idx = 0;
    for(let c in cats) { 
        let sid = 'mcat_' + (idx++);
        html += `<div class="cat-header" onclick="toggleCat('${sid}')">${c}</div><div class="cat-body" id="${sid}">`;
        cats[c].forEach(m => { html += `<div class="mat-item"><div style="flex:1; font-size:12px; font-weight:600;">${m.n}<br><span style="color:var(--gray); font-size:11px; font-weight:normal;">${m.p} P / ${m.u}</span></div><button class="mat-add-btn" onclick="promptAdd('${m.id}', 'mat')">+ Добавить</button></div>`; });
        html += `</div>`;
    } document.getElementById('mat-cat-list').innerHTML = html; openModal('matCatModal'); 
}


/* =========================================================

 * VISUAL FUNCTION: openWorkCatalog

 * ========================================================= */

function openWorkCatalog() { 
    let cats = {}; workDB.forEach(w => { let c = w.c || "ОБЩЕЕ"; if(!cats[c]) cats[c] = []; cats[c].push(w); });
    let html = ""; let idx = 0;
    for(let c in cats) { 
        let sid = 'wcat_' + (idx++);
        html += `<div class="cat-header" style="color:var(--orange); border-color:rgba(245,158,11,0.2); background:rgba(245,158,11,0.08);" onclick="toggleCat('${sid}')">${c}</div><div class="cat-body" id="${sid}">`;
        cats[c].forEach(w => { html += `<div class="mat-item"><div style="flex:1; font-size:12px; font-weight:600;">${w.n}<br><span style="color:var(--gray); font-size:11px; font-weight:normal;">${w.p} P / ${w.u}</span></div><button class="mat-add-btn" style="background:var(--orange);" onclick="promptAdd('${w.id}', 'work')">+ Добавить</button></div>`; });
        html += `</div>`;
    } document.getElementById('work-cat-list').innerHTML = html; openModal('workModal'); 
}


/* =========================================================

 * VISUAL FUNCTION: confirmQtyAdd

 * ========================================================= */

function confirmQtyAdd() { 
    let q = Number(document.getElementById('qty-input').value); 
    if(q > 0) { addAuto([{...pendingAdd.item, q: q, type: pendingAdd.type}], 'man_'+Date.now()); } 
    closeModal('qtyPromptModal'); showToast("Добавлено!");
}


/* =========================================================

 * VISUAL FUNCTION: showPreview

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

 * VISUAL FUNCTION: openRecalcModal

 * ========================================================= */

function openRecalcModal() { 
    globalRecalcCab = 0; globalRecalcSht = 0;
    currentEstimate.forEach(it => { let nameLower = it.n.toLowerCase(); if (nameLower.includes('ввг') || nameLower.includes('bbг') || nameLower.includes('провод') || nameLower.includes('кабель')) globalRecalcCab += Number(it.q); if (nameLower.includes('штроб') && !nameLower.includes('вводная')) globalRecalcSht += Number(it.q); }); 
    document.getElementById('r-cab').innerText = globalRecalcCab + ' м'; document.getElementById('r-sht').innerText = globalRecalcSht + ' м'; document.getElementById('r-ceil-input').value = 0; updateRecalcUI(); openModal('recalcModal'); 
}


/* =========================================================

 * VISUAL FUNCTION: openObjCard

 * ========================================================= */

function openObjCard(id) {
    closeModal('buhModal'); currentCardId = id; const obj = hDB.find(x => x.id === id); if(!obj) return; 
    
    document.getElementById('card-obj-name').innerHTML = `${obj.name || 'Без имени'}<br><span style="font-size:12px; color:var(--gray); font-weight:normal;">📞 ${obj.phone || 'Нет тел.'} | 📍 ${obj.addr || 'Нет адреса'}</span>`; 
    
    let sumMat = 0, sumCut = 0, sumRough = 0, sumFine = 0, sumExtra = 0;
    let htmlMat='', htmlCut='', htmlRough='', htmlFine='', htmlExtra='';
    
    if(obj.estimate) {
        obj.estimate.forEach(it => {
            let sum = fPrice(it) * it.q;
            let row = `<div class="act-item-row"><span>${it.n} <b style="color:var(--primary);">(x${it.q})</b></span><b>${sum} ₽</b></div>`;
            let cat = categorizeEstimateItem(it);

            if(it.tag === 'extra') { sumExtra += sum; htmlExtra += row; }
            else if(cat === 1) { sumMat += sum; htmlMat += row; }
            else if(cat === 2) { sumCut += sum; htmlCut += row; }
            else if(cat === 4) { sumFine += sum; htmlFine += row; }
            else { sumRough += sum; htmlRough += row; }
        });
    }

    let finalHtml = '';
    if(htmlMat) finalHtml += `<div class="act-group-title" style="background:#10B981;"><span>1. Материалы</span><span>${sumMat} ₽</span></div>${htmlMat}`;
    if(htmlCut) finalHtml += `<div class="act-group-title" style="background:#F59E0B;"><span>2. Штробление и резка</span><span>${sumCut} ₽</span></div>${htmlCut}`;
    if(htmlRough) finalHtml += `<div class="act-group-title" style="background:#64748B;"><span>3. Черновая электрика</span><span>${sumRough} ₽</span></div>${htmlRough}`;
    if(htmlFine) finalHtml += `<div class="act-group-title" style="background:#3B82F6;"><span>4. Чистовая электрика</span><span>${sumFine} ₽</span></div>${htmlFine}`;
    if(htmlExtra) finalHtml += `<div class="act-group-title" style="background:#EF4444;"><span>Дополнительные работы</span><span>${sumExtra} ₽</span></div>${htmlExtra}`;

    if(!finalHtml) finalHtml = "<p style='font-size:12px; color:gray;'>Нет данных по смете</p>";

    document.getElementById('card-acts-container').innerHTML = finalHtml;
    
    let pay = obj.payments || {};
    document.getElementById('pay-mat').checked = !!pay.mat;
    document.getElementById('pay-cut').checked = !!pay.cut;
    document.getElementById('pay-rough').checked = !!pay.rough;
    document.getElementById('pay-fine').checked = !!pay.fine;
    document.getElementById('pay-extra').checked = !!pay.extra;
    document.getElementById('pay-prepay').value = pay.prepay || 0;

    openModal('objCardModal'); 
}


/* =========================================================

 * VISUAL FUNCTION: closeObjCardAndReturn

 * ========================================================= */

function closeObjCardAndReturn() { closeModal('objCardModal'); openModal('buhModal'); }


/* =========================================================

 * VISUAL FUNCTION: switchDbTab

 * ========================================================= */

function switchDbTab(tab) { 
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active')); 
    document.getElementById(tab === 'mat' ? 'btnTabMat' : 'btnTabWork').classList.add('active'); 
    document.getElementById('editor-mat-list').style.display = tab === 'mat' ? 'block' : 'none'; 
    document.getElementById('editor-work-list').style.display = tab === 'work' ? 'block' : 'none'; 
}


/* =========================================================

 * VISUAL FUNCTION: openAdminDraftView

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

 * VISUAL FUNCTION: epMakeAiMenuGroup

 * ========================================================= */

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


/* =========================================================

 * VISUAL FUNCTION: epExtractOpenAiText

 * ========================================================= */

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


/* =========================================================

 * VISUAL FUNCTION: epCallOpenAI

 * ========================================================= */

function epCallOpenAI(promptText, opts) {
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


/* =========================================================

 * VISUAL FUNCTION: epParseLooseTableText

 * ========================================================= */

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


/* =========================================================

 * VISUAL FUNCTION: epShowDbReview

 * ========================================================= */

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


/* =========================================================

 * VISUAL FUNCTION: epRenderGlobalDbModal

 * ========================================================= */

function epRenderGlobalDbModal() {
        const matBtn = document.getElementById('ep-global-tab-mat'); const workBtn = document.getElementById('ep-global-tab-work');
        if (matBtn) matBtn.classList.toggle('active', epGlobalDbType === 'mat'); if (workBtn) workBtn.classList.toggle('active', epGlobalDbType === 'work');
        const list = document.getElementById('ep-global-db-list'); if (!list) return;
        const arr = epGlobalDbType === 'work' ? epGlobalDbCache.workDB : epGlobalDbCache.matDB;
        list.innerHTML = epRenderGroupedList(arr || [], epGlobalDbType, { prefix:'global_full', mode:'global' });
    }


/* =========================================================

 * VISUAL FUNCTION: toast

 * ========================================================= */

function toast(t){ if(typeof showToast==='function') showToast(t); else console.log(t); }


/* =========================================================

 * VISUAL FUNCTION: renderGlobalModalFixed

 * ========================================================= */

function renderGlobalModalFixed(){
    var type = window.EP_GLOBAL_DB_TAB_FIXED || 'mat';
    var matBtn = qs('ep-global-tab-mat'), workBtn = qs('ep-global-tab-work');
    if(matBtn) matBtn.classList.toggle('active', type === 'mat');
    if(workBtn) workBtn.classList.toggle('active', type === 'work');
    var list = qs('ep-global-db-list');
    if(!list) return;
    var cache = window.EP_GLOBAL_DB_VISIBLE_CACHE || {};
    var arr = (type === 'work' ? (cache.workDB || []) : (cache.matDB || [])).map(function(x){ return Object.assign({}, x, {__src:'global'}); });
    list.innerHTML = groupHtml(arr, type, 'global_fixed_'+type, 'global');
  }


/* =========================================================

 * VISUAL FUNCTION: unhide

 * ========================================================= */

function unhide(type,it){
    var del = delSet(type);
    del.delete(idkey(it));
    del.delete(sig(type,it));
    if(it && it.originGlobalId) del.delete('id:' + String(it.originGlobalId));
    saveDel(type,del);
  }


/* =========================================================

 * VISUAL FUNCTION: serverModalRow

 * ========================================================= */

function serverModalRow(type,it){
    var item=enc(it);
    var sub=(groupOf(it)?groupOf(it)+' • ':'')+(Number(it.p)||0)+' ₽ / '+(it.u||'шт');
    return '<label class="mat-item ep-select-row"><input type="checkbox" class="ep-global-check" data-type="'+type+'" data-item="'+esc(item)+'" style="width:22px;height:22px;accent-color:var(--primary);"><div style="flex:1;"><b>'+esc(it.n||'Позиция')+'</b><br><span style="color:var(--gray);font-size:11px;">'+esc(sub)+'</span></div></label>';
  }


/* =========================================================

 * VISUAL FUNCTION: renderServerModalList

 * ========================================================= */

function renderServerModalList(type){
    var arr=serverArr(type), html='';
    if(!arr.length) return '<div style="padding:16px;border:1px dashed var(--border);border-radius:14px;text-align:center;color:var(--gray);font-weight:800;">База сервера пустая.</div>';
    var cats={}, i=0;
    arr.forEach(function(it){ var c=it.c||'Разное'; var g=groupOf(it)||'Без группы'; if(!cats[c]) cats[c]={}; if(!cats[c][g]) cats[c][g]=[]; cats[c][g].push(it); });
    Object.keys(cats).sort(function(a,b){return a.localeCompare(b,'ru');}).forEach(function(c){
      var cid='srv_cat_'+type+'_'+(i++);
      html += '<div class="cat-header" onclick="epDbToggle(&quot;'+cid+'&quot;, event)">'+esc(c)+'</div><div class="cat-body" id="'+cid+'">';
      Object.keys(cats[c]).sort(function(a,b){return a.localeCompare(b,'ru');}).forEach(function(g){
        var gid='srv_sub_'+type+'_'+(i++);
        html += '<div class="sub-cat-header" onclick="epDbToggle(&quot;'+gid+'&quot;, event)">'+esc(g)+' ▾</div><div class="sub-cat-body" id="'+gid+'">';
        cats[c][g].forEach(function(it){ html += serverModalRow(type,it); });
        html += '</div>';
      });
      html += '</div>';
    });
    return html;
  }


/* =========================================================

 * VISUAL FUNCTION: rerenderOpenScreens

 * ========================================================= */

function rerenderOpenScreens(){
    syncActiveArrays();
    updateButtons();
    try{ if(typeof renderDbEditors === 'function') renderDbEditors(); }catch(e){}
    try{ if(window.renderDbEditors && window.renderDbEditors !== renderDbEditors) window.renderDbEditors(); }catch(e){}
    if(isVisible('matCatModal')){
      setTimeout(function(){ try{ if(typeof openMatCatalog === 'function') openMatCatalog(); }catch(e){} }, 20);
    }
    if(isVisible('workModal')){
      setTimeout(function(){ try{ if(typeof openWorkCatalog === 'function') openWorkCatalog(); }catch(e){} }, 20);
    }
    if(isVisible('globalDbModal') && typeof window.epRenderServerDbModal === 'function'){
      try{ window.epRenderServerDbModal(); }catch(e){}
    }
  }


/* =========================================================

 * VISUAL FUNCTION: hardHideLoader

 * ========================================================= */

function hardHideLoader(){
    try{ if(typeof hideLoader === 'function') hideLoader(); }catch(e){}
    try{ var l = $('global-loader'); if(l) l.classList.remove('show'); }catch(e){}
  }


/* =========================================================

 * VISUAL FUNCTION: showReadLoader

 * ========================================================= */

function showReadLoader(text, icon){ try{ if(typeof showLoader === 'function') showLoader(text || 'Читаю файл...', icon || '📥'); }catch(e){} }


/* =========================================================

 * VISUAL FUNCTION: showReview

 * ========================================================= */

function showReview(items,type,source){
    hardHideLoader();
    items = unique((items || []).filter(Boolean), type);
    var selected = {};
    items.forEach(function(_,i){ selected[i] = true; });
    window.EP_DB_REVIEW_V6 = { type:type, items:items, source:source || '', page:0, selected:selected, editCache:{} };
    window.EP_DB_REVIEW = { type:type, items:items, source:source || '' };
    renderReviewPage();
    try{ if(typeof openModal === 'function') openModal('ep-db-ai-review-modal'); }catch(e){ var m=$('ep-db-ai-review-modal'); if(m) m.style.display='flex'; }
    setTimeout(hardHideLoader, 20);
  }


/* =========================================================

 * VISUAL FUNCTION: showProgress

 * ========================================================= */

function showProgress(title,pct,txt){ ensureProgress(); var p=$('ep-v7-progress'), f=$('ep-v7-progress-fill'), t=$('ep-v7-progress-title'), x=$('ep-v7-progress-txt'); if(p)p.style.display='flex'; if(t)t.textContent=title||'Выполняю...'; if(f)f.style.width=Math.max(0,Math.min(100,Math.round(pct||0)))+'%'; if(x)x.textContent=(txt||'')+' '+Math.max(0,Math.min(100,Math.round(pct||0)))+'%'; try{ if(typeof hideLoader==='function') hideLoader(); }catch(e){} }


/* =========================================================

 * VISUAL FUNCTION: hideProgress

 * ========================================================= */

function hideProgress(){ var p=$('ep-v7-progress'); if(p)p.style.display='none'; }


/* =========================================================

 * VISUAL FUNCTION: showReviewV9

 * ========================================================= */

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


/* =========================================================

 * VISUAL FUNCTION: openAiModel

 * ========================================================= */

function openAiModel(){ try{ return (window.EP_AI_CONFIG&&window.EP_AI_CONFIG.openaiModel)||safeGet('ep_openai_model_v1','gpt-4o-mini')||'gpt-4o-mini'; }catch(e){ return 'gpt-4o-mini'; } }


/* =========================================================

 * VISUAL FUNCTION: extractTextFromOpenAI

 * ========================================================= */

function extractTextFromOpenAI(data){
    if(data && data.output_text) return data.output_text;
    var out='';
    ((data&&data.output)||[]).forEach(function(item){ ((item&&item.content)||[]).forEach(function(c){ if(c&&c.text) out+=c.text; if(c&&c.type==='output_text'&&c.text) out+=c.text; }); });
    return out;
  }


/* =========================================================

 * VISUAL FUNCTION: askOpenAI

 * ========================================================= */

function askOpenAI(promptText, opts){
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


/* =========================================================

 * VISUAL FUNCTION: showDetailsV16

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


/* =========================================================

 * VISUAL FUNCTION: addBadge

 * ========================================================= */

function addBadge(){
    if($('ep-v17-badge')) return;
    var d=document.createElement('div'); d.id='ep-v17-badge';
    d.style.cssText='position:fixed;left:8px;bottom:8px;z-index:2147483647;background:#111827;color:#fff;border:2px solid #22c55e;border-radius:999px;padding:6px 10px;font:900 11px system-ui;box-shadow:0 8px 24px rgba(0,0,0,.35);opacity:.92;';
    d.textContent='✅ V17 активна';
    document.body.appendChild(d);
  }


/* =========================================================

 * VISUAL FUNCTION: ensureBadge

 * ========================================================= */

function ensureBadge(){
    var b=$('ep-v18-status-badge');
    if(!b){
      b=document.createElement('div'); b.id='ep-v18-status-badge';
      b.style.cssText='position:fixed;left:10px;bottom:12px;z-index:2147483647;border-radius:999px;padding:8px 13px;color:#fff;font-size:12px;font-weight:1000;box-shadow:0 10px 30px rgba(0,0,0,.25);border:2px solid rgba(255,255,255,.55);letter-spacing:.2px;';
      document.body.appendChild(b);
    }
    return b;
  }


/* =========================================================

 * VISUAL FUNCTION: setStatus

 * ========================================================= */

function setStatus(state,msg){
    try{ if(typeof window.epV18SetStatus==='function'){ window.epV18SetStatus(state,msg); return; } }catch(e){}
    var b=$('ep-v18-status-badge')||document.createElement('div');
    b.id='ep-v18-status-badge';
    b.style.cssText='position:fixed;left:10px;bottom:12px;z-index:2147483647;border-radius:999px;padding:8px 13px;color:#fff;font-size:12px;font-weight:1000;box-shadow:0 10px 30px rgba(0,0,0,.25);border:2px solid rgba(255,255,255,.55);letter-spacing:.2px;background:'+(state==='upload'?'#dc2626':state==='download'?'#2563eb':state==='error'?'#991b1b':'#16a34a')+';';
    b.textContent=(state==='upload'?'🔴 ':state==='download'?'🔵 ':state==='error'?'⚠️ ':'✅ ')+(msg||'V21 активна');
    if(!b.parentNode) document.body.appendChild(b);
  }


/* =========================================================

 * VISUAL FUNCTION: hideOldBulk

 * ========================================================= */

function hideOldBulk(){
    ['ep-v17-bulk-box','ep-v18-bulk-box'].forEach(function(id){ var el=$(id); if(el){ el.style.display='none'; el.setAttribute('aria-hidden','true'); } });
  }
