/*
 * Electric PRO Refactor
 * Module: 11-pdf-files.js
 * V37 SAFE: PDF / печать / экспорт файлов.
 *
 * Важно:
 * - модуль пересобран безопасно;
 * - каждый блок проверяется через node --check;
 * - битые куски автоматически пропускаются;
 * - 00-core.js временно остаётся стабильным runtime.
 */

console.log("11-pdf-files.js V37 SAFE loaded");



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
 * PDF FUNCTION: epAiNormalizeImage
 * ========================================================= */
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
 * PDF FUNCTION: smartFindMat
 * ========================================================= */
function smartFindMat(label, words, meta){
    normalizeMaterialDb();
    const arr = dbArr('mat') || [];
    meta = meta || {};
    const key = lookupKey('mat', meta, label);
    const saved = savedChoices()[key];
    if(saved){ const found = arr.find(x => String(x.id)===String(saved)); if(found) return {item: found, key}; }
    const brand = meta.brand || detectBrand(label) || '';
    const nominal = meta.nominal || detectNominal(label) || '';
    const kind = String(meta.kind||'').toLowerCase();
    const searchWords = (words || []).concat([label, brand, nominal, kind]).filter(Boolean).map(norm).filter(Boolean);
    let best=null, bestScore=-999;
    arr.forEach(function(it){
      const blob = norm([it.c,it.g,it.sc,it.subcategory,it.kind,it.brand,it.nominal,it.curve,it.rcdType,it.leakage,it.n].filter(Boolean).join(' '));
      let score = 0;
      if(kind && blob.includes(norm(kind))) score += 4;
      if(kind.includes('automatic') && (blob.includes('автомат') || blob.includes('automatic'))) score += 5;
      if(kind.includes('dif') && blob.includes('диф')) score += 5;
      if(kind.includes('uzo') && blob.includes('узо')) score += 5;
      if(brand){ if(blob.includes(norm(brand))) score += 8; else score -= 20; }
      if(nominal){ if(blob.replace(/\s+/g,'').includes(norm(nominal).replace(/\s+/g,''))) score += 10; else if(kind.includes('automatic') || kind.includes('breaker')) score -= 30; }
      if(meta.curve && blob.includes(norm(meta.curve))) score += 2;
      if(meta.leakage && blob.includes(norm(meta.leakage+'ма'))) score += 4;
      searchWords.forEach(w => { if(w && blob.includes(w)) score += 1; });
      if(score > bestScore){ bestScore=score; best=it; }
    });
    if(best && bestScore >= 6) return {item:best, key};
    return {item:null, key};
  }

  


/* =========================================================
 * PDF FUNCTION: strictFindMaterial
 * ========================================================= */
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
 * PDF FUNCTION: aiFromImage
 * ========================================================= */
async function aiFromImage(file,type){
    if(typeof window.epAskAI !== 'function') throw new Error('ИИ не подключён');
    var dataUrl = await new Promise(function(resolve,reject){ var r = new FileReader(); r.onload=function(){resolve(r.result);}; r.onerror=reject; r.readAsDataURL(file); });
    showReadLoader('ИИ читает изображение...', '👁️');
    var prompt = 'Распознай таблицу для базы электрика. Верни строго JSON массив объектов [{"n":"Имя позиции","c":"Категория","sc":"Подкатегория","p":123,"u":"шт"}]. Если цены нет p=0. Без текста вокруг.';
    var ans = await window.epAskAI(prompt, { imageDataUrl:dataUrl, imageDetail:'high', maxTokens:9000 });
    var arr = [];
    try{ var m = String(ans || '').match(/\[[\s\S]*\]/); arr = JSON.parse(m ? m[0] : ans); }catch(e){ arr = []; }
    return jsonToItems(arr,type);
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
 * PDF FUNCTION: askOpenAI
 * ========================================================= */
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
  


/* =========================================================
 * PDF FUNCTION: askGemini
 * ========================================================= */
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
  


/* =========================================================
 * PDF FUNCTION: esc
 * ========================================================= */
function esc(v){ return text(v).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];}); }
  function toast(msg){ try{ if(typeof showToast==='function') showToast(msg); else console.log(msg); }catch(e){ console.log(msg); } }
  function money(v){ var n=Number(text(v).replace(',','.').replace(/[^0-9.\-]/g,'')); return isFinite(n)?n:0; }
  function val(id,def){ var e=$(id); return e ? (e.value || def || '') : (def || ''); }
  function chk(id){ var e=$(id); return !!(e && e.checked); }
  function count(k,def){
    var e=$('v-'+k); var n=NaN;
    if(e) n=Number(clean(e.textContent));
    if(!isFinite(n)) { try{ n=Number(cfg && cfg[k]); }catch(_e){} }
    if(!isFinite(n)) n=Number(def)||0;
    return Math.max(0,n||0);
  }
  function appPrice(k,def){ try{ var n=Number(window.appLogic && appLogic[k]); return n||def; }catch(e){ return def; } }
  function brandRu(b){ var s=text(b||'IEK').toUpperCase(); if(s.indexOf('IEK')>=0||s.indexOf('ИЭК')>=0) return 'ИЭК'; if(s.indexOf('ABB')>=0) return 'ABB'; if(s.indexOf('SCHNEIDER')>=0) return 'Schneider'; if(s.indexOf('LEGRAND')>=0) return 'Legrand'; if(s.indexOf('EKF')>=0) return 'EKF'; return clean(b)||'ИЭК'; }
  function norm(v){ return clean(v).toLowerCase().replace(/ё/g,'е').replace(/×/g,'x').replace(/х/g,'x'); }
  function activeMatDb(){
    var out=[];
    try{ if(Array.isArray(window.matDB)) out=out.concat(window.matDB); }catch(e){}
    try{ if(Array.isArray(window.EP_MY_MAT)) out=out.concat(window.EP_MY_MAT); }catch(e){}
    try{ if(Array.isArray(window.EP_GLOBAL_MAT)) out=out.concat(window.EP_GLOBAL_MAT); }catch(e){}
    try{ var c=JSON.parse(localStorage.getItem('ep_global_cache_force_v1')||'{}'); if(Array.isArray(c.matDB)) out=out.concat(c.matDB); }catch(e){}
    return out;
  }
  function curveNom(nom,curve){ var amp=text(nom).replace(/[^0-9]/g,'') || '16'; var c=text(curve || text(nom).charAt(0) || 'C').toUpperCase().charAt(0); if(!/[ABCDАВСД]/.test(c)) c='C'; return c+amp; }
  function dbFindAuto(nom,brand){
    var amp=text(nom).replace(/[^0-9]/g,''); var br=norm(brand||''); var cn=norm(curveNom(nom));
    return activeMatDb().find(function(it){ var n=norm(it && it.n); if(!n) return false; var isAuto=/автомат|выключатель автоматический|ва47|sh201|a9f|a472|а472/.test(n); var hasAmp=n.indexOf(amp)>=0 || n.indexOf(amp+'a')>=0 || n.indexOf(amp+' a')>=0; var hasCurve=n.indexOf(cn)>=0 || new RegExp('\\b'+amp+'\\s*a?\\b').test(n); var hasBrand=!br || n.indexOf(br)>=0 || (br==='iek' && n.indexOf('иэк')>=0) || (br==='иэк' && n.indexOf('iek')>=0); return isAuto && hasAmp && hasCurve && hasBrand; }) || null;
  }
  function dbFindRcd(kind,leak,brand){
    var k=norm(kind==='ДИФ'||kind==='Главный ДИФ'?'диф':'узо'), br=norm(brand||''), l=text(leak);
    return activeMatDb().find(function(it){ var n=norm(it && it.n); if(!n) return false; var okKind=n.indexOf(k)>=0; var okLeak=n.indexOf(l)>=0; var okBrand=!br || n.indexOf(br)>=0 || (br==='iek'&&n.indexOf('иэк')>=0) || (br==='иэк'&&n.indexOf('iek')>=0); return okKind && okLeak && okBrand; }) || null;
  }
  function modelFromDbName(n){ var m=text(n).match(/\(([^)]+)\)/); return m ? clean(m[1]).replace(/^IEK\s*/i,'ИЭК ') : ''; }
  function autoName(nom,brand,curve){ var cn=curveNom(nom,curve), br=brandRu(brand); var hit=dbFindAuto(cn,brand); var model=hit?modelFromDbName(hit.n):''; if(model) return cn+' 1P '+model; if(br==='ABB') return cn+' 1P ABB SH201'; if(br==='Schneider') return cn+' 1P Schneider'; if(br==='Legrand') return cn+' 1P Legrand'; if(br==='EKF') return cn+' 1P EKF'; return cn+' 1P ИЭК ВА47-29'; }
  function autoPrice(nom,brand){ var hit=dbFindAuto(nom,brand); if(hit && Number(hit.p)>0) return Number(hit.p); var amp=Number(text(nom).replace(/[^0-9]/g,''))||16; if(text(brand).toUpperCase().indexOf('ABB')>=0) return amp>=25?600:265; return amp>=40?380:(amp<=10?172:150); }
  function rcdName(kind,leak,brand,rcdType){ var k=(kind==='ДИФ'||kind==='Главный ДИФ')?kind:'УЗО'; var hit=dbFindRcd(k,leak,brand); var br=brandRu(brand); var model=hit?modelFromDbName(hit.n):''; if(model) return k+' 2P 40A '+leak+'мА тип '+(rcdType||'A')+' '+model; if(br==='ABB') return k+' 2P 40A '+leak+'мА тип '+(rcdType||'A')+' ABB'; return k+' 2P 40A '+leak+'мА тип '+(rcdType||'A')+' '+br+(br==='ИЭК'?' ВД1-63':''); }
  function rcdPrice(kind,leak,brand){ var hit=dbFindRcd(kind,leak,brand); if(hit && Number(hit.p)>0) return Number(hit.p); return (kind==='ДИФ'||kind==='Главный ДИФ') ? 3600 : (Number(leak)===10?3600:1195); }
  function item(n,q,p,type,meta,assigns){
    var a=[]; if(Array.isArray(assigns)) a=assigns.map(clean).filter(Boolean); else if(assigns) a=[clean(assigns)].filter(Boolean);
    var it=Object.assign({n:n,q:Number(q)||1,p:money(p),u:(meta&&meta.unit)||'шт',type:type||'mat',tag:'shield'},meta||{});
    if(a.length){ it.epAssignment=a[0]; it.epAssignments=a.slice(); it.epMergedDetails=a.slice(); it.assignment=a[0]; it.dbMeta=Object.assign({},it.dbMeta||{}, {assignment:a[0]}); }
    return it;
  }
  function addUniqueAssign(rec,arr){
    rec.epAssignments=rec.epAssignments||[]; rec.epMergedDetails=rec.epMergedDetails||[];
    (arr||[]).forEach(function(v){ v=clean(v); if(v && !/позиция щита|назначение не указано/i.test(v) && rec.epAssignments.indexOf(v)<0){ rec.epAssignments.push(v); rec.epMergedDetails.push(v); } });
    rec.epAssignment=rec.epAssignments[0]||rec.epAssignment||''; rec.dbMeta=Object.assign({},rec.dbMeta||{}, {assignment:rec.epAssignment});
  }
  function directAdd(items){
    var map={}, out=[];
    (items||[]).forEach(function(src){ if(!src||!src.n) return; var it=Object.assign({},src,{tag:src.tag||'shield'}); var k=[it.tag,it.type,it.n,it.p,it.u].join('|'); var rec=map[k]; if(!rec){ rec=Object.assign({},it,{q:0,epAssignments:[],epMergedDetails:[]}); map[k]=rec; out.push(rec); } rec.q += Number(it.q)||1; addUniqueAssign(rec,[].concat(it.epAssignments||[],it.epMergedDetails||[],it.epAssignment||[])); });
    try{ currentEstimate=(Array.isArray(currentEstimate)?currentEstimate:[]).filter(function(x){ return x && x.tag!=='shield' && x.tag!=='shield_info'; }).concat(out); window.currentEstimate=currentEstimate; }catch(e){ window.currentEstimate=(window.currentEstimate||[]).filter(function(x){ return x && x.tag!=='shield' && x.tag!=='shield_info'; }).concat(out); }
    try{ if(typeof renderMainTable==='function') renderMainTable(); else if(typeof renderMainDirect==='function') renderMainDirect(); }catch(e){}
    try{ if(typeof syncDraft==='function') syncDraft(); }catch(e){}
  }
  function buildLines(curve){
    var lines=[];
    function add(name,nom,group,opts){ opts=opts||{}; lines.push({name:name,nominal:curveNom(nom,curve),curve:curve,group:group,wet:group==='wet'||!!opts.wet,nonSwitchable:!!opts.nonSwitchable}); }
    function room(label,c,wet){ c=Number(c)||0; for(var i=1;i<=c;i++){ var n=c>1?label+' '+i:label; add(n+' розетки','C16',wet?'wet':'power',{wet:wet}); add(n+' свет','C10','light'); } }
    room('Кухня',count('kits',1),false);
    room('Ванная',count('baths',1),true);
    room('Туалет',count('toilets',1),true);
    room('Комната',count('rms',1),false);
    room('Балкон',count('bals',0),false);
    if(chk('c-apron')) add('Фартук кухни','C16','power');
    if(chk('c-dish')) add('Посудомойка','C10','power');
    if(chk('c-washer')) add('Стиралка/сушилка','C10','wet',{wet:true});
    if(chk('c-towel')) add('Полотенцесушитель','C10','wet',{wet:true});
    for(var a=1;a<=count('acs',0);a++) add('Кондиционер '+a,'C10','climate');
    for(var f=1;f<=count('fls',0);f++) add('Тёплый пол '+f,'C10','climate');
    if(chk('c-fridge')) add('Холодильник, неотключаемая группа','C10','alwaysOn',{nonSwitchable:true});
    if(chk('c-neptun')) add('Нептун, неотключаемая группа','C10','alwaysOn',{nonSwitchable:true});
    if(chk('c-router')) add('Роутер, неотключаемая группа','C6','alwaysOn',{nonSwitchable:true});
    var hob=val('c-hob-power','none'); if(hob==='6') add('Плита до 6 кВт','C25',chk('cfg-heavy-separate')?'heavy':'power'); if(hob==='10') add('Плита до 10 кВт','C32',chk('cfg-heavy-separate')?'heavy':'power');
    var boil=val('c-boiler-power','none'); if(boil==='6') add('Бойлер до 6 кВт','C25','wet',{wet:true}); if(boil==='10') add('Бойлер до 10 кВт','C32','wet',{wet:true});
    return lines;
  }
  function groupNominals(lines){ var m={}; lines.forEach(function(l){ var k=l.nominal; if(!m[k]) m[k]={nominal:k,assign:[]}; m[k].assign.push(l.name); }); return Object.keys(m).sort(function(a,b){ var na=Number(a.replace(/\D/g,'')), nb=Number(b.replace(/\D/g,'')); return nb-na; }).map(function(k){return m[k];}); }
  function presentGroups(lines){ var seen={},out=[]; lines.forEach(function(l){ if(!seen[l.group]){ seen[l.group]=1; out.push(l.group); } }); return out; }
  window.epV20GenerateShield=function(){
    var bBox=val('cfg-brand-box','Tekfor'), bAuto=val('cfg-brand-auto','IEK'), sWall=val('cfg-shield-wall','Бетон'), ph=Number(val('cfg-phase','1'))||1, curve=val('cfg-auto-curve','C'), rcdType=val('cfg-rcd-type','A'), protectionType=val('cfg-protection-type','uzo_auto'), isMaster=chk('cfg-master');
    var lines=buildLines(curve);
    if(!lines.length){ toast('Добавь хотя бы одно помещение или линию'); return; }
    var groupNames={power:'Силовые линии',climate:'Климат',wet:'Влажные зоны',light:'Освещение',heavy:'Большая техника',alwaysOn:'Неотключаемые'};
    function groupAssign(g){ var arr=lines.filter(function(l){return l.group===g;}).map(function(l){return l.name;}); return (g==='wet'?'Влажные зоны / защита 10 мА':(groupNames[g]||g))+(arr.length?': '+arr.join(', '):''); }
    var prot=[];
    if(protectionType==='main_dif_auto') prot.push({group:'main',kind:'Главный ДИФ',leak:30,assign:['Вводная групповая защита всего щита']});
    else presentGroups(lines).forEach(function(g){ prot.push({group:g,kind:(protectionType==='dif_auto'||(protectionType==='mixed'&&g==='wet'))?'ДИФ':'УЗО',leak:g==='wet'?10:30,assign:[groupAssign(g)]}); });
    var items=[];
    var onePole=lines.length+(isMaster?1:0), twoPole=prot.length, relayMods=chk('cfg-uzm')?(ph===3?6:2):0, masterMods=isMaster?3:0;
    var extraMods=0; try{ (window.currentShieldExtras||[]).forEach(function(ex){ extraMods += (Number(ex.modules||1)*Number(ex.q||1)); }); }catch(e){}
    var totalModules=Math.ceil(onePole+twoPole*2+relayMods+masterMods+extraMods+(ph===3?4:2));
    var boxSize=[6,12,24,36,48,60,72].find(function(s){return s>=totalModules;})||72;
    items.push(item('Щит '+(sWall==='Накладной'?'накладной':'встраиваемый')+' '+bBox+' '+boxSize+'М',1,bBox==='ABB'?6510:2660,'mat',{c:'Щитовое',g:'Корпуса',sc:sWall==='Накладной'?'Накладной':'Встраиваемый',kind:'shield_box',modules:boxSize},'Корпус щита'));
    items.push(item('Вводной автомат '+(ph===3?'4P':'2P')+' '+brandRu(bAuto)+' ВА47-29',1,bAuto==='ABB'?3500:1800,'mat',{c:'Автоматика',g:'Автоматы',sc:'Автоматы',kind:'input_breaker'},'Вводной аппарат щита'));
    var pMap={}; prot.forEach(function(p){ var nm=rcdName(p.kind,p.leak,bAuto,rcdType); var price=rcdPrice(p.kind,p.leak,bAuto); var key=nm+'|'+price; if(!pMap[key]) pMap[key]={n:nm,q:0,p:price,kind:p.kind,leak:p.leak,assign:[]}; pMap[key].q++; pMap[key].assign=pMap[key].assign.concat(p.assign||[]); });
    Object.keys(pMap).forEach(function(k){ var p=pMap[k]; items.push(item(p.n,p.q,p.p,'mat',{c:'Автоматика',g:p.kind==='УЗО'?'УЗО':'ДИФы',sc:p.kind==='УЗО'?'УЗО':'ДИФы',kind:p.kind==='УЗО'?'uzo':'dif',leakage:p.leak},p.assign)); });
    groupNominals(lines).forEach(function(g){ items.push(item(autoName(g.nominal,bAuto,curve),g.assign.length,autoPrice(g.nominal,bAuto),'mat',{c:'Автоматика',g:'Автоматы',sc:'Автоматы',kind:'automatic',nominal:g.nominal,curve:curve},g.assign)); });
    if(chk('cfg-uzm')) items.push(item('Реле напряжения '+brandRu(bAuto),ph===3?3:1,4500,'mat',{c:'Автоматика',g:'УЗМ / реле напряжения',sc:'УЗМ / реле напряжения'},'Защита от перенапряжения'));
    if(isMaster){ var light=lines.filter(function(l){return l.group==='light';}).map(function(l){return l.name;}); items.push(item('Контактор C40 '+brandRu(bAuto)+' — мастер-кнопка света',1,2200,'mat',{c:'Автоматика',g:'Контакторы',sc:'Контакторы'},'Мастер-кнопка только на свет: '+(light.join(', ')||'световые группы'))); items.push(item(autoName('C40',bAuto,curve),1,autoPrice('C40',bAuto),'mat',{c:'Автоматика',g:'Автоматы',sc:'Автоматы',kind:'automatic',nominal:'C40',curve:curve},'Байпас мастер-кнопки света')); }
    try{ (window.currentShieldExtras||[]).forEach(function(ex){ items.push(item(ex.n,ex.q||1,ex.p||0,'mat',{c:'Автоматика',g:'Другие аппараты',sc:'Другие аппараты'},'Дополнительный аппарат защиты')); }); window.currentShieldExtras=[]; }catch(e){}
    var comb1P=Math.ceil(onePole/12), comb2P=Math.ceil(twoPole/6), rows=Math.ceil(boxSize/12), pugvSize=appPrice('shieldPugvSize',6), pugvMeters=Math.max(4,Math.ceil(totalModules*0.4)), nshviPacks=Math.max(1,Math.ceil(boxSize/48));
    if(comb1P>0) items.push(item('Гребёнка 1P 25см',comb1P,250,'mat',{c:'Щитовое',g:'Гребёнки',sc:'Гребёнки'},'Питание однополюсных автоматов: '+onePole+' шт.'));
    if(comb2P>0) items.push(item('Гребёнка 2P 25см',comb2P,450,'mat',{c:'Щитовое',g:'Гребёнки',sc:'Гребёнки'},'Питание УЗО/ДИФ: '+twoPole+' шт.'));
    if(twoPole>0) items.push(item('Шина N ноль на DIN-изол (ИЭК)',twoPole,285,'mat',{c:'Щитовое',g:'Шины N/PE',sc:'Шины N/PE'},'N-шинки по количеству УЗО/ДИФ'));
    items.push(item('PE-шина на '+appPrice('shieldPeBusContacts',26)+' контактов',1,770,'mat',{c:'Щитовое',g:'Шины N/PE',sc:'Шины N/PE'},'Защитное заземление PE'));
    items.push(item('DIN-рейка / комплект DIN для щита',rows,180,'mat',{c:'Щитовое',g:'DIN-рейки / ограничители',sc:'DIN-рейки / ограничители'},'Крепление аппаратов на DIN-рейке'));
    items.push(item('Ограничитель на DIN-рейку',rows*2,35,'mat',{c:'Щитовое',g:'DIN-рейки / ограничители',sc:'DIN-рейки / ограничители'},'Фиксация аппаратов на DIN-рейке'));
    items.push(item('Провод ПуГВ 1×'+pugvSize,pugvMeters,85,'mat',{c:'Щитовое',g:'Провода',sc:'Провода',unit:'м.п.'},'Внутренняя разводка щита'));
    items.push(item('НШВИ 1×'+pugvSize+', упак. 100 шт',nshviPacks,225,'mat',{c:'Щитовое',g:'Наконечники',sc:'Наконечники'},'Опрессовка проводов щита'));
    items.push(item('Маркировка линий / бирки',lines.length,15,'mat',{c:'Щитовое',g:'Маркировка',sc:'Маркировка'},'Маркировка линий: '+lines.map(function(l){return l.name;}).join(', ')));
    if(chk('cfg-cable-glands')) items.push(item('Кабельные вводы / сальники',1,250,'mat',{c:'Щитовое',g:'Кабельные вводы',sc:'Кабельные вводы'},'Ввод кабелей в щит'));
    if(sWall!=='Накладной'){ items.push(item('Ниша щита '+boxSize+'М ('+sWall+')',boxSize,appPrice('shieldNichePerModule',400),'work',{c:'Штробление и резка',g:'Ниши щита',sc:'Ниши щита',unit:'мод.'},'Ниша под корпус щита')); items.push(item('Штроба 100×50, под трассу кабелей ('+sWall+')',2,appPrice('shieldInputGroovePrice',1500),'work',{c:'Штробление и резка',g:'Штроба 100×50 под трассу кабелей',sc:'Штроба 100×50 под трассу кабелей',unit:'м.п.'},'Штроба под ввод/трассу кабелей')); }
    items.push(item('Сборка щита',totalModules,appPrice('priceShield',500),'work',{c:'Щитовое',g:'Сборка щита',sc:'Сборка щита',unit:'мод.'},'Сборка модульного щита'));
    items.push(item('Установка щита',1,appPrice('shieldInstallPrice',2500),'work',{c:'Щитовое',g:'Монтаж щита',sc:'Монтаж щита'},'Монтаж корпуса щита'));
    items.push(item('Подключение вводного кабеля',1,appPrice('shieldInputConnectPrice',1500),'work',{c:'Щитовое',g:'Монтаж щита',sc:'Монтаж щита'},'Подключение ввода'));
    items.push(item('Прозвонка / проверка линий',lines.length,appPrice('shieldTestLinePrice',150),'work',{c:'Щитовое',g:'Проверка линий',sc:'Проверка линий',unit:'линия'},'Проверка каждой линии'));
    items.push(item('Маркировка линий',lines.length,appPrice('shieldMarkLinePrice',100),'work',{c:'Щитовое',g:'Маркировка линий',sc:'Маркировка линий',unit:'линия'},'Маркировка каждой линии'));
    if(chk('cfg-scheme')) items.push(item('Составление однолинейной схемы щита',1,appPrice('shieldSchemePrice',4000),'work',{c:'Щитовое',g:'Документация',sc:'Документация'},'Однолинейная схема'));
    items.push(item('ℹ️ Щит: линий '+lines.length+'; занято '+totalModules+' мод.; корпус '+boxSize+'М; свободно '+Math.max(0,boxSize-totalModules)+' мод.',1,0,'work',{tag:'shield_info'},'Информация по щиту'));
    directAdd(items);
    try{ if(typeof closeModal==='function') closeModal('configModal'); }catch(e){}
    try{ if(window.epV18SetStatus) window.epV18SetStatus('ok','V20 активна'); }catch(e){}
    toast('✅ Щит сгенерирован V20 по твоей логике: C16/C10 считаются от помещений и отдельных линий');
  };
  function getAssigns(it){ var out=[]; function add(v){ v=clean(v); if(v && !/позиция щита|назначение не указано/i.test(v) && out.indexOf(v)<0) out.push(v); } if(it){ (it.epAssignments||[]).forEach(add); (it.epMergedDetails||[]).forEach(add); add(it.epAssignment); if(it.dbMeta) add(it.dbMeta.assignment); } return out; }
  function isDevice(it){ var n=text(it&&it.n); return it && it.type==='mat' && /C\d{1,3}|[ABCDАВСД]\d{1,3}|автомат|узо|диф|реле|контактор|вводной/i.test(n); }
  window.epV20ShowDetails=function(){
    var arr=[]; try{ arr=Array.isArray(currentEstimate)?currentEstimate:(window.currentEstimate||[]); }catch(e){ arr=window.currentEstimate||[]; }
    var rows=arr.filter(function(it){ return (it.tag==='shield'||it.tag==='shield_info') && isDevice(it); });
    var html='<div class="pdf-header"><h1>ДЕТАЛИЗАЦИЯ ЩИТА</h1><p>Заказчик: <b>'+esc((window.cust&&cust.name)||'')+'</b> | Объект: '+esc((window.cust&&cust.addr)||'')+'</p></div>'+
      '<div style="margin:8px 0 14px;padding:8px 10px;border-radius:12px;background:#ecfdf5;color:#047857;font-weight:900;font-size:12px;">Проверка: детализация сформирована V20. Помещения читаются с экрана, не из window.cfg.</div>'+
      '<table class="pdf-table"><thead><tr><th>Что отвечает / линия</th><th>Аппарат</th><th>Назначение</th></tr></thead><tbody>';
    if(!rows.length) html+='<tr><td colspan="3" style="text-align:center;color:#64748b;font-weight:900;">Щит ещё не сгенерирован</td></tr>';
    rows.forEach(function(it){ var as=getAssigns(it); var q=Number(it.q)||1; var purp='аппарат щита'; if(/узо|диф/i.test(it.n)) purp='групповая защита'+(q>1?' × '+q:''); else if(/контактор/i.test(it.n)) purp='мастер-кнопка света'; else if(/вводн/i.test(it.n)) purp='вводной аппарат'; else if(/автомат|C\d|[ABCDАВСД]\d/i.test(it.n)) purp=q>1?'отдельные автоматы линий: '+q+' шт.':'отдельный автомат линии'; html+='<tr><td style="font-weight:800;color:#5b54b7;">'+(as.length?as.map(esc).join('<br>'):'Позиция щита')+'</td><td>'+esc(it.n)+(q>1?' <b>× '+q+'</b>':'')+'</td><td>'+esc(purp)+'</td></tr>'; });
    html+='</tbody></table><button class="btn-vendor" style="margin-top:20px;" onclick="closeModal(\'previewModal\')">Закрыть</button>';
    var body=$('preview-body')||$('p-cont'); if(body) body.innerHTML=html; try{ openModal('previewModal'); }catch(e){}
  };

