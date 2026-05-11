// === PDF PREVIEW / PRINT ===


// === getPDFHeader ===
function getPDFHeader(title) { 
    return `<div class="pdf-header"><h1>${title}</h1><p>Заказчик: <b>${cust.name}</b> | Объект: ${cust.addr}</p></div>`; 
}


// === categorizeEstimateItem ===
function categorizeEstimateItem(it) {
    if (it.type === 'mat') return 1;
    let n = it.n.toLowerCase();
    if (n.includes('штроб') || n.includes('высверл') || n.includes('алмаз') || n.includes('резк') || n.includes('отверст') || n.includes('ниши')) return 2;
    if (n.includes('установк') || n.includes('розетк') || n.includes('выключат') || n.includes('рамк') || n.includes('свет') || n.includes('люстр')) {
        if (!n.includes('подрозетн') && !n.includes('щит')) return 4;
    }
    return 3; 
}


// === showPreview ===
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
            let shieldItems = currentEstimate.filter(it => it.n.includes('Автомат') || it.n.includes('ДИФ') || it.n.includes('УЗО') || it.n.includes('Реле'));
            html += '<table class="pdf-table"><tr><th>Помещение/Линия</th><th>Аппарат защиты</th></tr>';
            shieldItems.forEach(it => { let match = it.n.match(/\((.*?)\)/); let room = match ? match[1] : 'Общая / Вводная'; html += `<tr><td style="font-weight:bold; color:var(--primary);">${room}</td><td>${it.n}</td></tr>`; }); 
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


// === refreshPreview ===
function refreshPreview() { showPreview(currentPreviewMode); }
