/*
 * Electric PRO Refactor
 * Module: 10-estimate-views.js
 * V36: поставщику / смета / детализация / табличные виды.
 *
 * Важно:
 * - переносим только полноценные function / async function;
 * - window.* куски пока не переносим;
 * - 00-core.js временно остаётся стабильным runtime;
 * - окончательная чистка будет позже.
 */

console.log("10-estimate-views.js V36 loaded");



/* =========================================================
 * ESTIMATE VIEW FUNCTION: fPrice
 * ========================================================= */
function fPrice(it) { return Math.round((it.p || 0) * (1 + (it.type === 'mat'? coeffs.mat: coeffs.work) / 100)); }



/* =========================================================
 * ESTIMATE VIEW FUNCTION: renderMainTable
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
 * ESTIMATE VIEW FUNCTION: clearCurrentEstimate
 * ========================================================= */
async function clearCurrentEstimate() { let c = await window.customConfirm("Очистка", "Очистить смету?"); if(c){ currentEstimate=[]; renderMainTable(); } }



/* =========================================================
 * ESTIMATE VIEW FUNCTION: openWorkCatalog
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
 * ESTIMATE VIEW FUNCTION: confirmQtyAdd
 * ========================================================= */
function confirmQtyAdd() { 
    let q = Number(document.getElementById('qty-input').value); 
    if(q > 0) { addAuto([{...pendingAdd.item, q: q, type: pendingAdd.type}], 'man_'+Date.now()); } 
    closeModal('qtyPromptModal'); showToast("Добавлено!");
}



/* =========================================================
 * ESTIMATE VIEW FUNCTION: applyPoolToEstimate
 * ========================================================= */
function applyPoolToEstimate() {
    if(!pool.length) return showToast("❌ Пул пуст!");
    let mode = document.getElementById('montage-mode').value;
    let connMode = document.getElementById('conn-mode') ? document.getElementById('conn-mode').value : 'gml';
    let wall = document.getElementById('g-wall').value;
    let useKk = document.getElementById('pool-cable-channel').checked;
    let useSurf = document.getElementById('pool-surface').checked;
    let ceilH = Number(cust.ceil) || 270;

    let res = { m_sh: 0, m_sh_50: 0, stdPodr: 0, deepPodr: 0, koposPodr: 0, mechs: { soc:0, sw:0, pass:0, cross:0, tv:0, tpol:0 }, frames: {1:0,2:0,3:0,4:0,5:0,6:0} };

    let swJbs = 0; let passJbs = 0; let totalSocDrops = 0;

    pool.forEach(g => {
        let isSw = (g.sw > 0 || g.cross > 0);
        let isPass = (g.pass > 0);
        let isSoc = (g.soc > 0 || g.tv > 0);
        
        let drop = (isSw || isPass) ? (ceilH - g.h)/100 : (g.route === 'ceiling' ? (ceilH - g.h)/100 : g.h/100);

        if(g.tpol > 0) { res.m_sh_50 += (g.h/100) * g.q; if(g.route === 'ceiling') res.m_sh += (drop - g.h/100) * g.q; } else { res.m_sh += drop * g.q; }
        
        // Логика распаек
        if(mode === 'classic') {
            if(isPass) passJbs += 1 * g.q;
            else if(isSw) swJbs += 1 * g.q;
            else if(isSoc && g.tpol === 0) totalSocDrops += 1 * g.q; 
        } else {
            if(isPass) passJbs += 1 * g.q;
            else if(isSw) swJbs += 1 * g.q;
            if(isSoc && !isPass && !isSw && g.tpol===0) totalSocDrops += 1 * g.q; 
        }

        let deepCount = 0;
        let stdCount = 0;
        
        if (mode === 'gyn') {
            deepCount = g.p * g.q; 
        } else {
            deepCount = (g.sw + g.pass + g.cross + g.tpol) * g.q; 
            stdCount = Math.max(0, (g.p * g.q) - deepCount);
        }
        
        if(g.podr === 'kopos') { res.koposPodr += g.p * g.q; } 
        else if(g.podr === 'deep') { res.deepPodr += g.p * g.q; } 
        else { res.deepPodr += deepCount; res.stdPodr += stdCount; } 
        
        res.mechs.soc += g.soc * g.q; res.mechs.sw += g.sw * g.q; res.mechs.pass += g.pass * g.q; res.mechs.cross += g.cross * g.q; res.mechs.tv += g.tv * g.q; res.mechs.tpol += g.tpol * g.q;
        if(g.p >= 1 && g.p <= 6) res.frames[g.p] += g.q;
    });

    let socJbs = 0;
    if(mode === 'classic') {
        let socsPerBox = appLogic.socketsPerJb || 3;
        socJbs = Math.ceil(totalSocDrops / socsPerBox);
    } else {
        socJbs = totalSocDrops;
    }

    let totalBoxes = swJbs + passJbs + socJbs;
    
    // Считаем коннекторы
    let mConnSoc = appLogic.connPerSocJb || 3;
    let mConnSw = appLogic.connPerSwJb || 3;
    let mConnPass = appLogic.connPerPassJb || 4;
    let totalConn = (socJbs * mConnSoc) + (swJbs * mConnSw) + (passJbs * mConnPass);

    let m = [], w = [];
    let prSoc = appLogic.priceSoc || 500; let prDrill = appLogic.priceDrill || 600; let prShtr = appLogic.priceShtroba || 550;

    if(!useSurf) {
        if(res.stdPodr > 0) m.push({ n: "Подрозетник стандарт (ГКЛ/Бетон)", q: res.stdPodr, p: 20, type: 'mat' });
        if(res.deepPodr > 0) m.push({ n: "Подрозетник глубокий 68х64", q: res.deepPodr, p: 12, type: 'mat' });
        if(res.koposPodr > 0) m.push({ n: "Подрозетник Короѕ 75мм", q: res.koposPodr, p: 95, type: 'mat' });
    }
    
    if(mode === 'classic' && totalBoxes > 0) {
        m.push({ n: "Коробка распределительная 100х100х40", q: totalBoxes, p: 120, type: 'mat' });
    }
    
    if(totalConn > 0) {
        if(connMode === 'gml') {
            m.push({ n: "Гильза ГМЛ 4/6", q: totalConn, p: 15, type: 'mat' });
            m.push({ n: "Термоусадка 12/4 (м)", q: Math.ceil(totalBoxes * 0.2), p: 80, type: 'mat' });
        } else if(connMode === 'wago') {
            m.push({ n: "Клемма WAGO", q: totalConn, p: 25, type: 'mat' });
        } else {
            m.push({ n: "Изолента / ТУТ (Пайка/СИЗ)", q: Math.ceil(totalBoxes * 0.2), p: 100, type: 'mat' });
        }
    }
    
    if(res.mechs.soc > 0) m.push({ n: "Розетка 220В (механизм)", q: res.mechs.soc, p: 250, type: 'mat' });
    if((res.mechs.sw+res.mechs.pass+res.mechs.cross) > 0) m.push({ n: "Выключатель (механизм)", q: res.mechs.sw+res.mechs.pass+res.mechs.cross, p: 280, type: 'mat' });
    if(res.mechs.tv > 0) m.push({ n: "Слаботочная розетка (механизм)", q: res.mechs.tv, p: 350, type: 'mat' });
    for(let i=1; i<=6; i++) { if(res.frames[i] > 0) m.push({ n: `Рамка ${i} пост(а)`, q: res.frames[i], p: i*50, type: 'mat' }); }

    if(totalBoxes > 0) {
        if(mode === 'classic') {
            let connPrice = connMode === 'gml' ? 800 : (connMode === 'solder' ? 900 : 600);
            w.push({ n: `Сборка распред. коробки (${connMode === 'gml' ? 'ГМЛ' : (connMode === 'solder' ? 'Пайка' : 'WAGO')})`, q: totalBoxes, p: connPrice, type: 'work' });
        } else {
            let connPrice = connMode === 'gml' ? 600 : (connMode === 'solder' ? 700 : 450);
            w.push({ n: `Коммутация в подрозетнике (${connMode === 'gml' ? 'ГМЛ' : (connMode === 'solder' ? 'Пайка' : 'WAGO')})`, q: totalBoxes, p: connPrice, type: 'work' });
        }
    }
    
    if(useKk) {
        if(res.m_sh > 0) w.push({ n: `Монтаж кабель-канала`, q: Math.ceil(res.m_sh), p: 150, type: 'work' });
        if(res.m_sh_50 > 0) w.push({ n: `Монтаж кабель-канала (широкий)`, q: Math.ceil(res.m_sh_50), p: 200, type: 'work' });
    } else {
        if(res.m_sh > 0) w.push({ n: `Штроба 25х30 (${wall})`, q: Math.ceil(res.m_sh), p: prShtr, type: 'work' });
        if(res.m_sh_50 > 0) w.push({ n: `Штроба 50х50 (${wall})`, q: Math.ceil(res.m_sh_50), p: prShtr*1.8, type: 'work' });
    }

    if(useSurf) {
        let sumMechs = res.mechs.soc + res.mechs.sw + res.mechs.pass + res.mechs.cross + res.mechs.tv + res.mechs.tpol;
        if(sumMechs > 0) w.push({ n: `Установка накладного механизма`, q: sumMechs, p: prSoc, type: 'work' });
    } else {
        if(res.stdPodr > 0) w.push({ n: `Высверливание подрозетников (45мм)`, q: res.stdPodr, p: prDrill, type: 'work' });
        if(res.deepPodr > 0) w.push({ n: `Высверливание подрозетников (64мм)`, q: res.deepPodr, p: prDrill+100, type: 'work' });
        let totalPodr = res.stdPodr + res.deepPodr + res.koposPodr;
        if(totalPodr > 0) w.push({ n: `Вклейка подрозетников`, q: totalPodr, p: 100, type: 'work' });
        
        if(res.mechs.soc>0) w.push({n: `Установка розетки 220B`, q:res.mechs.soc, p:prSoc, type:'work'});
        if(res.mechs.sw>0 || res.mechs.pass>0 || res.mechs.cross>0) w.push({n: `Установка выключателя`, q:res.mechs.sw+res.mechs.pass+res.mechs.cross, p:prSoc, type:'work'});
        if(res.mechs.tv>0) w.push({n: `Установка слаботочной розетки`, q:res.mechs.tv, p:prSoc, type:'work'});
        if(res.mechs.tpol>0) w.push({n: `Установка терморегулятора`, q:res.mechs.tpol, p:prSoc+400, type:'work'});
    }

    addAuto(m.concat(w), 'rough'); pool=[]; rfPool(); closeModal('roughModal'); showToast("✅ Пул добавлен!");
}



/* =========================================================
 * ESTIMATE VIEW FUNCTION: renderShieldExtras
 * ========================================================= */
function renderShieldExtras() {
    document.getElementById('shield-extras-list').innerHTML = currentShieldExtras.map((ex, i) =>
        `<div style="display:flex; justify-content:space-between; font-size:11px; border-bottom:1px dashed rgba(0,0,0,0.1); padding:4px;"><span>${ex.n} <b style="color:var(--primary);">(x${ex.q})</b></span><span style="color:red; font-size:16px; font-weight:bold; cursor:pointer;" onclick="currentShieldExtras.splice(${i},1); renderShieldExtras();">✕</span></div>`
    ).join('');
}


/* =========================================================
 * ESTIMATE VIEW FUNCTION: epAllDbItems
 * ========================================================= */
function epAllDbItems(type) {
    const local = type === 'work' ? (workDB || []) : (matDB || []);
    const user = type === 'work' ? (userWorkDB || []) : (userMatDB || []);
    return local.concat(user).filter(Boolean);
}



/* =========================================================
 * ESTIMATE VIEW FUNCTION: epFindDbItem
 * ========================================================= */
function epFindDbItem(type, words) {
    const arr = epAllDbItems(type);
    const searchWords = (words || []).map(epNormText).filter(Boolean);
    if (!searchWords.length) return null;
    let best = null;
    let bestScore = -1;
    arr.forEach(item => {
        const blob = epNormText([item.c, item.g, item.sc, item.n, item.brand, item.kind, item.nominal, item.curve, item.wallType, item.modules].join(' '));
        let score = 0;
        searchWords.forEach(w => { if (blob.includes(w)) score++; });
        if (score > bestScore) { best = item; bestScore = score; }
    });
    return bestScore >= Math.max(1, Math.ceil(searchWords.length * 0.55)) ? best : null;
}




/* =========================================================
 * ESTIMATE VIEW FUNCTION: epV15DisplayMaterialName
 * ========================================================= */
function epV15DisplayMaterialName(found, label, meta) {
    meta = meta || {};
    const k = String(meta.kind || '').toLowerCase();
    const src = [label, found && found.n].join(' ');
    if (k.includes('automatic') || k.includes('breaker') || /\bавтомат\b|A472|А472/i.test(src)) return epV15FormatAutoName(found, label, meta);
    if (k.includes('узо') || k.includes('uzo') || k.includes('dif') || /узо|диф/i.test(src)) return epV15FormatRcdName(found, label, meta);
    if (found && found.n) return epV15CleanForName(found.n);
    return epV15CleanForName(label || 'Позиция');
}


/* =========================================================
 * ESTIMATE VIEW FUNCTION: epWork
 * ========================================================= */
function epWork(label, q, price, words, meta) {
    const m = meta || {};
    const found = epFindDbItem('work', words || [label]);
    let name = label;
    if (found && found.n) {
        const bad = (/установка\s+бп\s+в\s+щит/i.test(found.n) && /установка\s+щит/i.test(label)) ||
                    (/^\s*(бетон|кирпич|панелька|мягкий)/i.test(found.n) && /штроб|ниша/i.test(label));
        name = bad ? label : found.n;
    }
    if (/штроб/i.test(label) && /100\s*[×xх]\s*50/i.test(label)) name = label.replace(/ВВОДНАЯ\s*/i, '').replace(/\s+/g,' ').trim();
    const out = {
        n: name,
        q: q,
        p: found ? (Number(found.p) || Number(price) || 0) : (Number(price) || 0),
        u: (found && found.u) || m.unit || 'шт',
        type: 'work',
        sourceId: found && found.id ? found.id : null,
        logicPrice: !found,
        dbMeta: Object.assign({}, m, { rawLabel: label, foundName: found && found.n ? found.n : '' }),
        epRawLabel: label
    };
    if (m.category) out.c = m.category;
    if (m.subcategory) { out.g = m.subcategory; out.sc = m.subcategory; out.subcategory = m.subcategory; }
    if (m.assignment) { out.epAssignment = m.assignment; out.epAssignments = [m.assignment]; out.epMergedDetails = [m.assignment]; }
    return out;
}



/* =========================================================
 * ESTIMATE VIEW FUNCTION: epAutoPrice
 * ========================================================= */
function epAutoPrice(brand) { return brand === 'ABB' ? 350 : 155; }


/* =========================================================
 * ESTIMATE VIEW FUNCTION: epDifPrice
 * ========================================================= */
function epDifPrice(brand) { return brand === 'ABB' ? 4500 : 3600; }



/* =========================================================
 * ESTIMATE VIEW FUNCTION: addLine
 * ========================================================= */
function addLine(name, nominal, group, opts) {
        const o = opts || {};
        lines.push({ name, nominal, group, curve: o.curve || curve, nonSwitchable: !!o.nonSwitchable, wet: group === 'wet' || !!o.wet });
    }
    

/* =========================================================
 * ESTIMATE VIEW FUNCTION: work
 * ========================================================= */
function work(label, q, price, words, meta, assignment) {
        meta = Object.assign({}, meta || {});
        if (assignment) meta.assignment = assignment;
        const it = epWork(label, q, price, words, meta);
        if (assignment) { it.epAssignment = assignment; it.epAssignments = [assignment]; it.epMergedDetails = [assignment]; }
        return it;
    }

    

/* =========================================================
 * ESTIMATE VIEW FUNCTION: categorizeEstimateItem
 * ========================================================= */
function categorizeEstimateItem(it) {
    if (it.type === 'mat') return 1;
    let n = it.n.toLowerCase();
    if (n.includes('штроб') || n.includes('высверл') || n.includes('алмаз') || n.includes('резк') || n.includes('отверст') || n.includes('ниши')) return 2;
    if (n.includes('установк') || n.includes('розетк') || n.includes('выключат') || n.includes('рамк') || n.includes('свет') || n.includes('люстр')) {
        if (!n.includes('подрозетн') && !n.includes('щит')) return 4;
    }
    return 3; 
}



/* =========================================================
 * ESTIMATE VIEW FUNCTION: showPreview
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
 * ESTIMATE VIEW FUNCTION: refreshPreview
 * ========================================================= */
function refreshPreview() { showPreview(currentPreviewMode); }



/* =========================================================
 * ESTIMATE VIEW FUNCTION: printAct
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
 * ESTIMATE VIEW FUNCTION: renderLogicUI
 * ========================================================= */
function renderLogicUI() { 
    document.getElementById('logic-price-soc').value = appLogic.priceSoc || 500; 
    document.getElementById('logic-price-shield').value = appLogic.priceShield || 500; 
    document.getElementById('logic-price-drill').value = appLogic.priceDrill || 600; 
    document.getElementById('logic-price-shtroba').value = appLogic.priceShtroba || 550; 
    document.getElementById('logic-price-cab-ceil').value = appLogic.priceCabCeil || 120; 

    document.getElementById('logic-shield-install').value = appLogic.shieldInstallPrice || 2500;
    document.getElementById('logic-shield-input-connect').value = appLogic.shieldInputConnectPrice || 1500;
    document.getElementById('logic-shield-test-line').value = appLogic.shieldTestLinePrice || 150;
    document.getElementById('logic-shield-mark-line').value = appLogic.shieldMarkLinePrice || 100;
    document.getElementById('logic-shield-scheme').value = appLogic.shieldSchemePrice || 4000;
    document.getElementById('logic-shield-niche-module').value = appLogic.shieldNichePerModule || 400;
    document.getElementById('logic-shield-input-groove').value = appLogic.shieldInputGroovePrice || 1500;

    document.getElementById('logic-soc-jb').value = appLogic.socketsPerJb || 3; 
    document.getElementById('logic-conn-soc').value = appLogic.connPerSocJb || 3; 
    document.getElementById('logic-conn-sw').value = appLogic.connPerSwJb || 3; 
    document.getElementById('logic-conn-pass').value = appLogic.connPerPassJb || 4; 
}




/* =========================================================
 * ESTIMATE VIEW FUNCTION: renderChart
 * ========================================================= */
function renderChart() {
    let ctxEl = document.getElementById('buhChart');
    if(!ctxEl) return;
    const ctx = ctxEl.getContext('2d');
    if(buhChartInstance) buhChartInstance.destroy();

    let period = document.getElementById('chart-period').value;
    let type = document.getElementById('chart-type').value;

    let viewHDB = appUser.role === 'admin' ? hDB : hDB.filter(h => h.masterUid === appUser.uid);
    let grouped = {};

    viewHDB.forEach(h => {
        let dParts = h.date.split('.'); 
        if(dParts.length !== 3) return;
        let key = '';
        if(period === 'year') key = `${dParts[1]}.${dParts[2]}`; 
        else if(period === 'all') key = dParts[2]; 
        else key = `${dParts[0]}.${dParts[1]}`; 

        if(!grouped[key]) grouped[key] = 0;
        grouped[key] += h.total;
    });

    let sortedKeys = Object.keys(grouped).sort();
    let data = sortedKeys.map(k => grouped[k]);

    buhChartInstance = new Chart(ctx, {
        type: type,
        data: {
            labels: sortedKeys,
            datasets: [{ label: 'Доход (₽)', data: data, backgroundColor: '#4F46E5', borderColor: '#4F46E5', tension: 0.2 }]
        },
        options: { responsive: true, maintainAspectRatio: false }
    });
}



/* =========================================================
 * ESTIMATE VIEW FUNCTION: addExtraWork
 * ========================================================= */
async function addExtraWork() { 
    const n = document.getElementById('extra-work-name').value.trim(); const p = Number(document.getElementById('extra-work-price').value); 
    if(!n || !p) return showToast("❌ Введите название и стоимость"); const obj = hDB.find(x => x.id === currentCardId); 
    if(obj) { 
        if(!obj.estimate) obj.estimate = []; obj.estimate.push({ n: n, p: p, q: 1, type: 'work', tag: 'extra' }); obj.total += p; 
        safeSet('h_v31', JSON.stringify(hDB)); updateHistList(); renderChart(); openObjCard(currentCardId); document.getElementById('extra-work-name').value = ""; document.getElementById('extra-work-price').value = ""; showToast("✅ Доп. работа добавлена!"); 
        try { if(db) await db.collection('history').doc(String(obj.id)).update({ estimate: obj.estimate, total: obj.total }); } catch(e){} 
    } 
}



/* =========================================================
 * ESTIMATE VIEW FUNCTION: renderDbEditors
 * ========================================================= */
function renderDbEditors() {
    let catsM = [...new Set(matDB.map(m=>m.c || 'Разное'))];
    let catsW = [...new Set(workDB.map(w=>w.c || 'Разное'))];
    document.getElementById('db-cats').innerHTML = [...new Set([...catsM, ...catsW])].map(c=>`<option value="${c}">`).join('');

    let htmlMat = '';
    let mGroups = {}; matDB.forEach(m => { mGroups[m.c||'Разное'] = mGroups[m.c||'Разное'] || []; mGroups[m.c||'Разное'].push(m); });
    Object.keys(mGroups).forEach((c, idx) => {
        let sid = 'db_m_'+idx;
        htmlMat += `<div class="cat-header" onclick="toggleCat('${sid}')">${c}</div><div class="cat-body" id="${sid}">`;
        mGroups[c].forEach(m => {
            htmlMat += `<div class="emp-row"><div><b>${m.n}</b><br><span style="color:var(--gray);font-size:10px;">${m.p} ₽ / ${m.u}</span></div> <input type="number" value="${m.p}" onchange="requestPriceChange('mat', '${m.id}', this.value)" style="width:60px;margin:0;padding:4px;text-align:center;"></div>`;
        });
        htmlMat += `</div>`;
    });
    document.getElementById('editor-mat-list').innerHTML = htmlMat;

    let htmlWork = '';
    let wGroups = {}; workDB.forEach(w => { wGroups[w.c||'Разное'] = wGroups[w.c||'Разное'] || []; wGroups[w.c||'Разное'].push(w); });
    Object.keys(wGroups).forEach((c, idx) => {
        let sid = 'db_w_'+idx;
        htmlWork += `<div class="cat-header" style="color:var(--orange); border-color:rgba(245,158,11,0.2); background:rgba(245,158,11,0.08);" onclick="toggleCat('${sid}')">${c}</div><div class="cat-body" id="${sid}">`;
        wGroups[c].forEach(w => {
            htmlWork += `<div class="emp-row"><div><b>${w.n}</b><br><span style="color:var(--gray);font-size:10px;">${w.p} ₽ / ${w.u}</span></div> <input type="number" value="${w.p}" onchange="requestPriceChange('work', '${w.id}', this.value)" style="width:60px;margin:0;padding:4px;text-align:center;"></div>`;
        });
        htmlWork += `</div>`;
    });
    document.getElementById('editor-work-list').innerHTML = htmlWork;
}



/* =========================================================
 * ESTIMATE VIEW FUNCTION: addDbItem
 * ========================================================= */
async function addDbItem() {
    if(appUser.role !== 'admin') return showToast("Только админ может добавлять");
    let cat = document.getElementById('db-new-cat').value.trim() || 'Разное';
    let name = document.getElementById('db-new-name').value.trim();
    let price = Number(document.getElementById('db-new-price').value) || 0;
    let unit = document.getElementById('db-new-unit').value.trim() || 'шт';
    let isMat = document.getElementById('editor-mat-list').style.display !== 'none';
    
    if(!name) return showToast("Введите название!");
    
    let newItem = { id: (isMat?'m':'w') + Date.now(), c: cat, n: name, p: price, u: unit };
    if(isMat) matDB.push(newItem); else workDB.push(newItem);
    
    try { if(db) await db.collection('settings').doc('global_db').set({matDB: matDB, workDB: workDB}); } catch(e){}
    
    renderDbEditors();
    document.getElementById('db-new-name').value = ''; document.getElementById('db-new-price').value = '';
    showToast("✅ Позиция добавлена");
}



/* =========================================================
 * ESTIMATE VIEW FUNCTION: requestPriceChange
 * ========================================================= */
async function requestPriceChange(type, id, newPrice) { 
    newPrice = Number(newPrice); 
    if (appUser.role === 'admin') { 
        let dbArr = type === 'mat' ? matDB : workDB; let item = dbArr.find(x => x.id === id); 
        if (item) item.p = newPrice; priceOverrides[id] = newPrice; 
        try { if(db) { await db.collection('settings').doc('price_overrides').set({overrides: priceOverrides}); await db.collection('settings').doc('global_db').set({matDB: matDB, workDB: workDB}); } } catch(e){} 
        showToast("✅ Цена изменена"); 
    } else { showToast("Отправлено админу"); } 
}



/* =========================================================
 * ESTIMATE VIEW FUNCTION: renderAdminUsers
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
 * ESTIMATE VIEW FUNCTION: epNormProvider
 * ========================================================= */
function epNormProvider(p) {
        return p === 'openai' ? 'openai' : 'gemini';
    }

    

/* =========================================================
 * ESTIMATE VIEW FUNCTION: epCurrentProvider
 * ========================================================= */
function epCurrentProvider() {
        return epNormProvider(window.EP_AI_CONFIG.provider || safeGet('ep_ai_provider_v1', 'gemini'));
    }

    

/* =========================================================
 * ESTIMATE VIEW FUNCTION: epSetAiProvider
 * ========================================================= */
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

    

/* =========================================================
 * ESTIMATE VIEW FUNCTION: epRefreshProviderUI
 * ========================================================= */
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

    

/* =========================================================
 * ESTIMATE VIEW FUNCTION: epInsertMainProviderSwitch
 * ========================================================= */
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

    

/* =========================================================
 * ESTIMATE VIEW FUNCTION: epTestProviderKey
 * ========================================================= */
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

    

/* =========================================================
 * ESTIMATE VIEW FUNCTION: epParseLooseTableText
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
 * ESTIMATE VIEW FUNCTION: epNormalizeItems
 * ========================================================= */
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

    

/* =========================================================
 * ESTIMATE VIEW FUNCTION: epExtractItemsFromSheetRows
 * ========================================================= */
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
    

/* =========================================================
 * ESTIMATE VIEW FUNCTION: epSameItem
 * ========================================================= */
function epSameItem(a, b) {
        return epCleanText(a.n).toLowerCase() === epCleanText(b.n).toLowerCase()
            && epCleanText(a.c).toLowerCase() === epCleanText(b.c).toLowerCase()
            && (!a.sc || !b.sc || epCleanText(a.sc).toLowerCase() === epCleanText(b.sc).toLowerCase());
    }

    

/* =========================================================
 * ESTIMATE VIEW FUNCTION: epMaterialFromName
 * ========================================================= */
function epMaterialFromName(name) {
        const s = String(name || '');
        const m = s.match(/\((Бетон|Кирпич|Панелька|Мягкий\s*мат\.?|Мягкий материал|ГКЛ|Все типы)\)/i);
        return m ? m[1].replace(/Мягкий\s*материал/i, 'Мягкий мат.').replace(/ГКЛ/i, 'Мягкий мат.') : '';
    }
    

/* =========================================================
 * ESTIMATE VIEW FUNCTION: epNormalizeWorkItem
 * ========================================================= */
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
    

/* =========================================================
 * ESTIMATE VIEW FUNCTION: epDisplayWorkName
 * ========================================================= */
function epDisplayWorkName(it) {
        const g = it.g || it.sc || '';
        const n = it.n || '';
        if (g && n && !String(n).toLowerCase().includes(String(g).toLowerCase())) return g + ' — ' + n;
        return n || g || 'Позиция';
    }
    

/* =========================================================
 * ESTIMATE VIEW FUNCTION: epEstimateCopy
 * ========================================================= */
function epEstimateCopy(it, type) {
        const copy = Object.assign({}, it);
        if (type === 'work') copy.n = epDisplayWorkName(copy);
        return copy;
    }
    

/* =========================================================
 * ESTIMATE VIEW FUNCTION: epMergeFullWorksInto
 * ========================================================= */
function epMergeFullWorksInto(arr) {
        let out = (arr || []).map(epNormalizeWorkItem);
        EP_FULL_WORKS.forEach(function(w) {
            const nw = epNormalizeWorkItem(w);
            if (!out.some(x => epSame(x, nw))) out.push(Object.assign({}, nw));
        });
        return out;
    }
    

/* =========================================================
 * ESTIMATE VIEW FUNCTION: epNormalizeAllWorkDb
 * ========================================================= */
function epNormalizeAllWorkDb() {
        workDB = epMergeFullWorksInto(workDB || []);
        try { if (typeof safeSet === 'function') safeSet('user_db_work_v31', JSON.stringify(workDB)); } catch(e){}
    }
    

/* =========================================================
 * ESTIMATE VIEW FUNCTION: epRenderGroupedList
 * ========================================================= */
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

    

/* =========================================================
 * ESTIMATE VIEW FUNCTION: epRenderGlobalDbModal
 * ========================================================= */
function epRenderGlobalDbModal() {
        const matBtn = document.getElementById('ep-global-tab-mat'); const workBtn = document.getElementById('ep-global-tab-work');
        if (matBtn) matBtn.classList.toggle('active', epGlobalDbType === 'mat'); if (workBtn) workBtn.classList.toggle('active', epGlobalDbType === 'work');
        const list = document.getElementById('ep-global-db-list'); if (!list) return;
        const arr = epGlobalDbType === 'work' ? epGlobalDbCache.workDB : epGlobalDbCache.matDB;
        list.innerHTML = epRenderGroupedList(arr || [], epGlobalDbType, { prefix:'global_full', mode:'global' });
    }
    

/* =========================================================
 * ESTIMATE VIEW FUNCTION: epProposalItemName
 * ========================================================= */
function epProposalItemName(x) { return [x.g || x.sc || '', x.n || ''].filter(Boolean).join(' — ') || 'Позиция'; }
    

/* =========================================================
 * ESTIMATE VIEW FUNCTION: epRenderProposalList
 * ========================================================= */
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
    

/* =========================================================
 * ESTIMATE VIEW FUNCTION: epInitFullWorksPatch
 * ========================================================= */
function epInitFullWorksPatch() {
        epInsertGlobalDbButton(); epNormalizeAllWorkDb(); if (typeof renderDbEditors === 'function') renderDbEditors(); epStartProposalV2();
    }
    

/* =========================================================
 * ESTIMATE VIEW FUNCTION: epMoveShieldSettingsIntoDetails
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
 * ESTIMATE VIEW FUNCTION: epNormalizeMaterialsDb
 * ========================================================= */
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

  

/* =========================================================
 * ESTIMATE VIEW FUNCTION: epRenderGrouped
 * ========================================================= */
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

  

/* =========================================================
 * ESTIMATE VIEW FUNCTION: epPatchDbRenderers
 * ========================================================= */
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

  

/* =========================================================
 * ESTIMATE VIEW FUNCTION: epFindItem
 * ========================================================= */
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
  

/* =========================================================
 * ESTIMATE VIEW FUNCTION: autoPrice
 * ========================================================= */
function autoPrice(){ return bAuto === 'ABB' ? 350 : 155; }
      

/* =========================================================
 * ESTIMATE VIEW FUNCTION: difPrice
 * ========================================================= */
function difPrice(){ return bAuto === 'ABB' ? 4500 : 3600; }
      

/* =========================================================
 * ESTIMATE VIEW FUNCTION: normalizeMaterialDb
 * ========================================================= */
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

  

/* =========================================================
 * ESTIMATE VIEW FUNCTION: renderGrouped
 * ========================================================= */
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
    });
    return html || '<div style="padding:15px;color:var(--gray);font-weight:700;">База пустая или ещё загружается</div>';
  }
  

/* =========================================================
 * ESTIMATE VIEW FUNCTION: renderItem
 * ========================================================= */
function renderItem(it,type){
    const id = String(it.id || '');
    const meta = [getGroup(it), it.brand, it.nominal, it.curve, it.rcdType, it.leakage].filter(Boolean).join(' • ');
    const btnColor = type==='work' ? 'background:var(--orange);' : '';
    return '<div class="mat-item"><div style="flex:1;"><div class="ep-db-item-title">'+safe(it.n || 'Позиция')+'</div><div class="ep-db-item-meta">'+safe(meta)+' '+safe(Number(it.p)||0)+' ₽ / '+safe(it.u || 'шт')+'</div></div><button class="mat-add-btn" style="'+btnColor+'width:auto;margin:0;" onclick="promptAdd(\''+safe(id)+'\', \''+type+'\')">+ Добавить</button></div>';
  }
  

/* =========================================================
 * ESTIMATE VIEW FUNCTION: mergeEstimate
 * ========================================================= */
function mergeEstimate(){
    try{
      if(!Array.isArray(currentEstimate)) return;
      const map = new Map();
      currentEstimate.forEach(function(it){
        if(!it) return;
        const name = canonicalName(it);
        const key = [it.type||'', it.sourceId||'', name, Number(it.p)||0, it.u||'шт', it.tag||''].join('|');
        if(!map.has(key)) map.set(key, Object.assign({}, it, { n:name, q:Number(it.q)||0, epMergedDetails: [] }));
        else map.get(key).q += Number(it.q)||0;
        const rec = map.get(key); if(it.n && it.n !== name) rec.epMergedDetails.push(it.n);
      });
      currentEstimate = Array.from(map.values()).filter(x => Number(x.q) !== 0);
    }catch(e){ console.error('mergeEstimate', e); }
  }
  

/* =========================================================
 * ESTIMATE VIEW FUNCTION: normalizeDbItem
 * ========================================================= */
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

  

/* =========================================================
 * ESTIMATE VIEW FUNCTION: renderGroupedFixed
 * ========================================================= */
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

  

/* =========================================================
 * ESTIMATE VIEW FUNCTION: strictFindMaterial
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
 * ESTIMATE VIEW FUNCTION: lineFromRaw
 * ========================================================= */
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

  

/* =========================================================
 * ESTIMATE VIEW FUNCTION: mergeEstimateFixed
 * ========================================================= */
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

  

/* =========================================================
 * ESTIMATE VIEW FUNCTION: shieldRowsForDetails
 * ========================================================= */
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

  

/* =========================================================
 * ESTIMATE VIEW FUNCTION: detailNote
 * ========================================================= */
function detailNote(app, line){
    var n = String(app || '');
    if(/Вводной/i.test(n)) return 'ввод питания щита';
    if(/ДИФ|УЗО/i.test(n)) return /10\s*мА/i.test(n) ? 'защита влажных зон 10 мА' : 'групповая защита 30 мА';
    if(/Автомат/i.test(n)) return 'отдельный автомат линии';
    if(/Реле напряж/i.test(n)) return 'защита от перенапряжения';
    if(/Контактор/i.test(n)) return 'мастер-кнопка только на свет';
    return '';
  }

  

/* =========================================================
 * ESTIMATE VIEW FUNCTION: itemKey
 * ========================================================= */
function itemKey(type, it){
    if(!it) return '';
    if(it.id) return 'id:' + String(it.id);
    return 'sig:' + type + '|' + norm([it.c,getGroup(it),it.n,it.u].filter(Boolean).join('|'));
  }
  

/* =========================================================
 * ESTIMATE VIEW FUNCTION: renderGlobalModalFixed
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
 * ESTIMATE VIEW FUNCTION: renderList
 * ========================================================= */
function renderList(arr,type,prefix,mode){
    var data = {};
    (arr || []).forEach(function(it){
      var c = it.c || 'Разное';
      var g = groupOf(it) || 'Разное';
      if(!data[c]) data[c] = {};
      if(!data[c][g]) data[c][g] = [];
      data[c][g].push(it);
    });
    var html = '', i = 0;
    Object.keys(data).sort(function(a,b){return a.localeCompare(b,'ru');}).forEach(function(c){
      var cid = prefix + '_c_' + (i++);
      var catStyle = type === 'work' ? 'style="color:var(--orange);background:rgba(245,158,11,.08);"' : '';
      html += '<div class="cat-header" '+catStyle+' onclick="toggleCat(\''+cid+'\')">'+esc(c)+'</div><div class="cat-body" id="'+cid+'">';
      Object.keys(data[c]).sort(function(a,b){return a.localeCompare(b,'ru');}).forEach(function(g){
        var gid = prefix + '_g_' + (i++);
        html += '<div class="ep-db-sub-header" onclick="epHardToggleDbSub(\''+gid+'\', event)"><span>'+esc(g)+'</span><small>открыть</small></div><div class="ep-db-sub-body" id="'+gid+'">';
        data[c][g].sort(function(a,b){return String(a.n||'').localeCompare(String(b.n||''),'ru');}).forEach(function(it,idx){
          var sk = sigKey(type,it);
          var src = it.__src === 'global' ? '<span style="color:#8B5CF6;font-weight:900;">🌍 серверная</span>' : '<span style="color:#10B981;font-weight:900;">👤 моя</span>';
          var meta = esc(g) + ' • ' + src + ' • ' + (Number(it.p)||0) + ' ₽ / ' + esc(it.u || 'шт');
          if(mode === 'global'){
            html += '<label class="mat-item ep-select-row">' +
              '<input type="checkbox" class="ep-global-check" data-type="'+type+'" data-sig="'+esc(sk)+'" data-id="'+esc(String(it.id||''))+'" style="width:22px;height:22px;accent-color:var(--primary);">' +
              '<div style="flex:1;"><div class="ep-db-item-title">'+esc(it.n || 'Позиция')+'</div><div class="ep-db-item-meta">'+meta+'</div></div></label>';
          } else if(mode === 'editor'){
            html += '<div class="emp-row" style="align-items:flex-start;">' +
              '<label style="display:flex;gap:8px;align-items:flex-start;flex:1;">' +
              '<input type="checkbox" class="ep-db-delete-check" data-type="'+type+'" data-sig="'+esc(sk)+'" data-id="'+esc(String(it.id||''))+'" style="width:22px;height:22px;accent-color:#EF4444;margin-top:4px;">' +
              '<div style="flex:1;"><b>'+esc(it.n || 'Позиция')+'</b><br><span style="color:var(--gray);font-size:10px;">'+meta+'</span></div></label>' +
              '<div class="ep-row-actions">' +
              '<input type="number" value="'+(Number(it.p)||0)+'" onchange="requestPriceChange(\''+type+'\', \''+esc(String(it.id||''))+'\', this.value)" style="width:72px;margin:0;padding:4px;text-align:center;">' +
              '<button class="btn-danger" onclick="epHardDeleteLocalPosition(\''+type+'\', \''+esc(sk)+'\', \''+esc(String(it.id||''))+'\')" style="white-space:nowrap;">Удалить позицию</button>' +
              '</div></div>';
          } else {
            var color = type === 'work' ? 'background:var(--orange);' : '';
            html += '<div class="mat-item"><div style="flex:1;"><div class="ep-db-item-title">'+esc(it.n || 'Позиция')+'</div><div class="ep-db-item-meta">'+meta+'</div></div>' +
              '<button class="mat-add-btn" style="'+color+'width:auto;margin:0;" onclick="promptAdd(\''+esc(sk)+'\', \''+type+'\')">+ Добавить</button></div>';
          }
        });
        html += '</div>';
      });
      html += '</div>';
    });
    return html || '<div style="padding:15px;color:var(--gray);font-weight:700;">Позиции не найдены</div>';
  }
  

/* =========================================================
 * ESTIMATE VIEW FUNCTION: encodeItem
 * ========================================================= */
function encodeItem(it){
    try { return encodeURIComponent(JSON.stringify(it || {})); } catch(e){ return ''; }
  }
  

/* =========================================================
 * ESTIMATE VIEW FUNCTION: decodeItem
 * ========================================================= */
function decodeItem(v){
    try { return JSON.parse(decodeURIComponent(v || '{}')); } catch(e){ return null; }
  }
  

/* =========================================================
 * ESTIMATE VIEW FUNCTION: renderItems
 * ========================================================= */
function renderItems(arr,type,prefix,mode){
    var data = {};
    (arr || []).forEach(function(it){
      var c = it.c || 'Разное';
      var g = groupOf(it) || 'Разное';
      if(!data[c]) data[c] = {};
      if(!data[c][g]) data[c][g] = [];
      data[c][g].push(it);
    });

    var html = '', n = 0;
    Object.keys(data).sort(function(a,b){return a.localeCompare(b,'ru');}).forEach(function(c){
      var cid = prefix + '_c_' + (n++);
      var catStyle = type === 'work' ? 'style="color:var(--orange);background:rgba(245,158,11,.08);"' : '';
      html += '<div class="cat-header" '+catStyle+' onclick="toggleCat(\''+cid+'\')">'+esc(c)+'</div><div class="cat-body" id="'+cid+'">';
      Object.keys(data[c]).sort(function(a,b){return a.localeCompare(b,'ru');}).forEach(function(g){
        var gid = prefix + '_g_' + (n++);
        html += '<div class="ep-db-sub-header" onclick="epUltimateToggleSub(\''+gid+'\', event)"><span>'+esc(g)+'</span><small>открыть</small></div><div class="ep-db-sub-body" id="'+gid+'">';
        data[c][g].sort(function(a,b){return String(a.n||'').localeCompare(String(b.n||''),'ru');}).forEach(function(it){
          var encoded = encodeItem(it);
          var sk = sig(type,it);
          var src = it.__src === 'global'
            ? '<span style="color:#8B5CF6;font-weight:900;">🌍 серверная</span>'
            : '<span style="color:#10B981;font-weight:900;">👤 моя</span>';
          var meta = esc(g) + ' • ' + src + ' • ' + (Number(it.p)||0) + ' ₽ / ' + esc(it.u || 'шт');

          if(mode === 'global'){
            html += '<label class="mat-item ep-select-row">' +
              '<input type="checkbox" class="ep-global-check" data-type="'+type+'" data-item="'+esc(encoded)+'" data-sig="'+esc(sk)+'" style="width:22px;height:22px;accent-color:var(--primary);">' +
              '<div style="flex:1;"><div class="ep-db-item-title">'+esc(it.n || 'Позиция')+'</div><div class="ep-db-item-meta">'+meta+'</div></div></label>';
          } else if(mode === 'editor'){
            html += '<div class="emp-row" style="align-items:flex-start;">' +
              '<label style="display:flex;gap:8px;align-items:flex-start;flex:1;">' +
              '<input type="checkbox" class="ep-db-delete-check" data-type="'+type+'" data-item="'+esc(encoded)+'" data-sig="'+esc(sk)+'" style="width:22px;height:22px;accent-color:#EF4444;margin-top:4px;">' +
              '<div style="flex:1;"><b>'+esc(it.n || 'Позиция')+'</b><br><span style="color:var(--gray);font-size:10px;">'+meta+'</span></div></label>' +
              '<div class="ep-row-actions">' +
              '<input type="number" value="'+(Number(it.p)||0)+'" onchange="epUltimateEditPrice(\''+type+'\', \''+esc(encoded)+'\', this.value)" style="width:74px;margin:0;padding:4px;text-align:center;">' +
              '<button class="btn-danger" onclick="epUltimateDeleteOne(\''+type+'\', \''+esc(encoded)+'\')" style="white-space:nowrap;">Удалить позицию</button>' +
              '</div></div>';
          } else {
            var color = type === 'work' ? 'background:var(--orange);' : '';
            html += '<div class="mat-item"><div style="flex:1;"><div class="ep-db-item-title">'+esc(it.n || 'Позиция')+'</div><div class="ep-db-item-meta">'+meta+'</div></div>' +
              '<button class="mat-add-btn" style="'+color+'width:auto;margin:0;" onclick="promptAdd(\''+esc(encoded)+'\', \''+type+'\')">+ Добавить</button></div>';
          }
        });
        html += '</div>';
      });
      html += '</div>';
    });

    return html || '<div style="padding:15px;color:var(--gray);font-weight:700;">Позиции не найдены</div>';
  }

  

/* =========================================================
 * ESTIMATE VIEW FUNCTION: renderCatalog
 * ========================================================= */
function renderCatalog(type){
    var arr = activeArr(type);
    var html = sourceSwitcherHtml(type);
    if(!arr.length){
      return html + '<div style="padding:16px;border:1px dashed var(--border);border-radius:14px;text-align:center;color:var(--gray);font-weight:800;">'+activeLabel()+' пустая.<br><br>'+(scope()==='my'?'Можно добавить вручную, импортом или взять позицию из базы сервера.':'После полного сброса база сервера пустая. Админ может заполнить её вручную или импортом.')+'</div>';
    }
    var cats={}, i=0;
    arr.forEach(function(it){ var c=it.c||'Разное'; var g=groupOf(it)||'Без группы'; if(!cats[c]) cats[c]={}; if(!cats[c][g]) cats[c][g]=[]; cats[c][g].push(it); });
    Object.keys(cats).sort(function(a,b){return a.localeCompare(b,'ru');}).forEach(function(c){
      var cid='ep_cat_'+type+'_'+(i++);
      html += '<div class="cat-header" onclick="epDbToggle(&quot;'+cid+'&quot;, event)">'+esc(c)+'</div><div class="cat-body" id="'+cid+'">';
      Object.keys(cats[c]).sort(function(a,b){return a.localeCompare(b,'ru');}).forEach(function(g){
        var gid='ep_sub_'+type+'_'+(i++);
        html += '<div class="sub-cat-header" onclick="epDbToggle(&quot;'+gid+'&quot;, event)">'+esc(g)+' ▾</div><div class="sub-cat-body" id="'+gid+'">';
        cats[c][g].sort(function(a,b){return String(a.n||'').localeCompare(String(b.n||''),'ru');}).forEach(function(it){ html += catalogRow(type,it); });
        html += '</div>';
      });
      html += '</div>';
    });
    return html;
  }

  

/* =========================================================
 * ESTIMATE VIEW FUNCTION: catalogRow
 * ========================================================= */
function catalogRow(type,it){
    var item=enc(it);
    var sub=(groupOf(it)?groupOf(it)+' • ':'')+(Number(it.p)||0)+' ₽ / '+(it.u||'шт');
    var copyBtn = scope()==='global' ? '<button class="btn-info" style="width:auto;margin:0 0 0 6px;padding:8px;" data-type="'+type+'" data-item="'+esc(item)+'" onclick="epCopyOneServerToMy(this.dataset.type,this.dataset.item)">В мою</button>' : '';
    return '<div class="mat-item"><div style="flex:1;font-size:12px;font-weight:600;"><b>'+esc(it.n||'Позиция')+'</b><br><span style="color:var(--gray);font-size:11px;font-weight:normal;">'+esc(sub)+'</span></div><button class="mat-add-btn" style="'+(type==='work'?'background:var(--orange);':'')+'" data-item="'+esc(item)+'" data-type="'+type+'" onclick="promptAdd(this.dataset.item,this.dataset.type)">+ Добавить</button>'+copyBtn+'</div>';
  }

  

/* =========================================================
 * ESTIMATE VIEW FUNCTION: renderDbRows
 * ========================================================= */
function renderDbRows(type){
    var arr=activeArr(type);
    var html=editorTop(type);
    if(!arr.length){
      html += '<div style="padding:15px;border:1px dashed var(--border);border-radius:12px;text-align:center;color:var(--gray);font-weight:800;">'+activeLabel()+' пустая.</div>';
      return html;
    }
    var cats={}, i=0;
    arr.forEach(function(it){ var c=it.c||'Разное'; var g=groupOf(it)||'Без группы'; if(!cats[c]) cats[c]={}; if(!cats[c][g]) cats[c][g]=[]; cats[c][g].push(it); });
    Object.keys(cats).sort(function(a,b){return a.localeCompare(b,'ru');}).forEach(function(c){
      var cid='db_cat_'+type+'_'+(i++);
      html += '<div class="cat-header" onclick="epDbToggle(&quot;'+cid+'&quot;, event)">'+esc(c)+'</div><div class="cat-body" id="'+cid+'">';
      Object.keys(cats[c]).sort(function(a,b){return a.localeCompare(b,'ru');}).forEach(function(g){
        var gid='db_sub_'+type+'_'+(i++);
        html += '<div class="sub-cat-header" onclick="epDbToggle(&quot;'+gid+'&quot;, event)">'+esc(g)+' ▾</div><div class="sub-cat-body" id="'+gid+'">';
        cats[c][g].sort(function(a,b){return String(a.n||'').localeCompare(String(b.n||''),'ru');}).forEach(function(it){ html += editorRow(type,it); });
        html += '</div>';
      });
      html += '</div>';
    });
    return html;
  }

  

/* =========================================================
 * ESTIMATE VIEW FUNCTION: editorRow
 * ========================================================= */
function editorRow(type,it){
    var item=enc(it);
    var sub=(groupOf(it)?groupOf(it)+' • ':'')+(Number(it.p)||0)+' ₽ / '+(it.u||'шт');
    var checked=scope()==='my' ? '<input type="checkbox" class="ep-my-del-check" data-type="'+type+'" data-item="'+esc(item)+'" style="width:20px;height:20px;accent-color:#EF4444;margin:4px 8px 0 0;">' : '';
    var copy=scope()==='global' ? '<button class="btn-info" style="width:auto;margin:0;padding:7px;" data-type="'+type+'" data-item="'+esc(item)+'" onclick="epCopyOneServerToMy(this.dataset.type,this.dataset.item)">В мою</button>' : '';
    return '<div class="emp-row" style="align-items:flex-start;">'+checked+'<div style="flex:1;"><b>'+esc(it.n||'Позиция')+'</b><br><span style="color:var(--gray);font-size:10px;">'+esc(sub)+'</span></div><input type="number" value="'+(Number(it.p)||0)+'" data-id="'+esc(String(it.id||''))+'" data-type="'+type+'" onchange="requestPriceChange(this.dataset.type,this.dataset.id,this.value)" style="width:70px;margin:0;padding:4px;text-align:center;">'+copy+'</div>';
  }

  

/* =========================================================
 * ESTIMATE VIEW FUNCTION: reviewedItems
 * ========================================================= */
function reviewedItems(){
    var src=(window.EP_DB_REVIEW && window.EP_DB_REVIEW.items) || [];
    var type=(window.EP_DB_REVIEW && window.EP_DB_REVIEW.type) || 'mat';
    var out=[];
    for(var i=0;i<src.length;i++){
      var ch=$('ep-db-check-'+i); if(ch && !ch.checked) continue;
      var name=$('ep-db-name-'+i), cat=$('ep-db-cat-'+i), sub=$('ep-db-subcat-'+i), price=$('ep-db-price-'+i), unit=$('ep-db-unit-'+i);
      var it={
        id: src[i].id || ((type==='work'?'w':'m')+'_imp_'+Date.now()+'_'+i),
        c: cat ? cat.value.trim() : (src[i].c || 'Разное'),
        g: sub ? sub.value.trim() : (src[i].g || src[i].sc || ''),
        sc: sub ? sub.value.trim() : (src[i].sc || src[i].g || ''),
        n: name ? name.value.trim() : src[i].n,
        p: price ? Number(String(price.value).replace(',','.').replace(/[^\d.]/g,''))||0 : Number(src[i].p)||0,
        u: unit ? unit.value.trim() || 'шт' : (src[i].u || 'шт')
      };
      if(it.n) out.push(epAutoGroupItem(type,it));
    }
    return out;
  }

  

/* =========================================================
 * ESTIMATE VIEW FUNCTION: autoGroupMaterial
 * ========================================================= */
function autoGroupMaterial(item){
    var it=clone(item); var n=cleanText([it.n,it.c,it.g,it.sc].join(' '));
    if(/utp|ftp|cat5|cat6|витая|интернет|tv|sat|коаксиал|слаботоч/.test(n)){ it.c='Слаботочка'; it.g=/tv|sat|коаксиал/.test(n)?'ТВ / коаксиальный кабель':'Интернет / витая пара'; }
    else if(/кабель|ввг|провод|пугв|пв 3|нг/.test(n)){ if(/пугв|пв 3/.test(n)){ it.c='Щитовое'; it.g='Расходка под сборку / Провода'; } else { it.c='Кабель'; if(/1\.5|1 5|3x1 5|3 1 5/.test(n)) it.g='Силовой кабель 3×1.5'; else if(/2\.5|2 5|3x2 5|3 2 5/.test(n)) it.g='Силовой кабель 3×2.5'; else if(/3x4|3 4|x4/.test(n)) it.g='Силовой кабель 3×4'; else if(/3x6|3 6|x6/.test(n)) it.g='Силовой кабель 3×6'; else it.g='Силовой кабель'; } }
    else if(/гофр|труб|пнд|пвх/.test(n)){ it.c='Трубы'; it.g=/20/.test(n)?'Гофра / труба 20 мм':'Гофра / трубы'; }
    else if(/диф|дифф/.test(n)){ it.c='Автоматика'; it.g='ДИФы'; }
    else if(/узо|вд1/.test(n)){ it.c='Автоматика'; it.g='УЗО'; }
    else if(/уздп|дугов/.test(n)){ it.c='Автоматика'; it.g='УЗДП'; }
    else if(/узм|реле напряж/.test(n)){ it.c='Автоматика'; it.g='УЗМ / реле напряжения'; }
    else if(/реле времени/.test(n)){ it.c='Автоматика'; it.g='Реле времени'; }
    else if(/контактор|пускател/.test(n)){ it.c='Автоматика'; it.g='Контакторы'; }
    else if(/автомат|ва47|sh201|1p|2p|3p|c10|c16|c25|c32|c40/.test(n)){ it.c='Автоматика'; it.g='Автоматы'; }
    else if(/щит|шкаф|корпус|бокс|щрв|tekfor|uk6/.test(n)){ it.c='Щитовое'; if(/внутр|встра|скрыт/.test(n)) it.g='Корпуса / Встраиваемый'; else if(/наклад/.test(n)) it.g='Корпуса / Накладной'; else it.g='Корпуса'; }
    else if(/ншви|наконеч/.test(n)){ it.c='Щитовое'; it.g='Расходка под сборку / Наконечники'; }
    else if(/шин|клемм|n |pe |ноль|земл/.test(n)){ it.c='Щитовое'; it.g='Расходка под сборку / Шинки и клеммники'; }
    else if(/греб/.test(n)){ it.c='Щитовое'; it.g='Расходка под сборку / Гребёнки'; }
    else if(/din|дин|рейк|огранич/.test(n)){ it.c='Щитовое'; it.g='Расходка под сборку / DIN-рейки и ограничители'; }
    else if(/маркир|бирк/.test(n)){ it.c='Щитовое'; it.g='Расходка под сборку / Маркировка'; }
    else if(/подрозет|коробк|гмл|гильз|термоусад|стяжк|лента|гвозд|баллон|площадк/.test(n)){ it.c='Расходники'; if(/подрозет/.test(n)) it.g='Подрозетники'; else if(/коробк/.test(n)) it.g='Распределительные коробки'; else if(/гмл|гильз|термоусад/.test(n)) it.g='Соединения'; else it.g='Прочая расходка'; }
    else { it.c=it.c&&it.c!=='Разное'?it.c:'Прочее'; it.g=it.g||it.sc||'Без группы'; }
    it.sc=it.g; return it;
  }
  

/* =========================================================
 * ESTIMATE VIEW FUNCTION: autoGroupWork
 * ========================================================= */
function autoGroupWork(item){
    var it=clone(item); var n=cleanText([it.n,it.c,it.g,it.sc].join(' '));
    if(/демонтаж/.test(n)){ it.c='Демонтаж'; if(/щит|автомат|узо|диф|рубильник|реле/.test(n)) it.g='Щитовое'; else if(/розет|выключ|короб|звон/.test(n)) it.g='Электроточки'; else if(/люстр|свет/.test(n)) it.g='Освещение'; else it.g='Демонтаж'; }
    else if(/ниша|вырубка.*щит|щит.*ниша/.test(n)){ it.c='Ниши щита'; if(/бетон/.test(n)) it.g='Бетон'; else if(/кирпич/.test(n)) it.g='Кирпич'; else if(/панель/.test(n)) it.g='Панелька'; else if(/мягк|гипс|гкл/.test(n)) it.g='Мягкий материал'; else it.g='Материал стены'; }
    else if(/штроб|резк|отверстие|алмаз/.test(n)){ it.c='Штробление и резка'; if(/100x50|100 50|ввод/.test(n)) it.g='Штроба 100×50 вводная'; else if(/50x50|50 50/.test(n)) it.g='Штроба 50×50'; else if(/25x30|25 30/.test(n)) it.g='Штроба 25×30'; else if(/132/.test(n)) it.g='Отверстие 132 мм'; else if(/52/.test(n)) it.g='Отверстие 52 мм'; else it.g='Алмазная резка'; }
    else if(/высверл|подрозет/.test(n) && /бетон|кирпич|панель|мягк|копос|глубок|стандарт/.test(n)){ it.c='Высверливание подрозетников'; if(/копос|75|74/.test(n)) it.g='Копос 74×75'; else if(/глубок|64/.test(n)) it.g='Глубокий'; else it.g='Стандарт'; }
    else if(/вклейк|установка подрозет|распаечн|электроточк/.test(n)){ it.c='Черновая электрика'; if(/подрозет/.test(n)) it.g='Подрозетники'; else if(/короб/.test(n)) it.g='Распределительные коробки'; else it.g='Электроточки'; }
    else if(/проклад|кабел|гофр|трасс/.test(n)){ it.c='Монтаж'; if(/гофр|пол/.test(n)) it.g='Прокладка кабеля в гофре / пол'; else if(/потол|без гоф/.test(n)) it.g='Прокладка кабеля без гофры / потолок'; else it.g='Прокладка кабеля'; }
    else if(/розет|выключ|механизм|терморег|датчик|звонк|краб/.test(n)){ it.c='Чистовая установка'; if(/наклад/.test(n)) it.g='Накладные механизмы'; else it.g='Механизмы'; }
    else if(/свет|люстр|бра|трек|спот|лента|профил/.test(n)){ it.c='Освещение'; if(/лента|профил/.test(n)) it.g='LED / профиль'; else it.g='Светильники'; }
    else if(/щит|автомат|узо|диф|реле|счетчик|сборка щита|однолин/.test(n)){ it.c='Щитовое'; if(/сборка/.test(n)) it.g='Сборка щита'; else if(/счетчик/.test(n)) it.g='Счетчики'; else if(/реле/.test(n)) it.g='Автоматика и реле'; else it.g='Монтаж'; }
    else { it.c=it.c&&it.c!=='Разное'?it.c:'Прочие работы'; it.g=it.g||it.sc||'Без группы'; }
    it.sc=it.g; return it;
  }
  

/* =========================================================
 * ESTIMATE VIEW FUNCTION: serverModalRow
 * ========================================================= */
function serverModalRow(type,it){
    var item=enc(it);
    var sub=(groupOf(it)?groupOf(it)+' • ':'')+(Number(it.p)||0)+' ₽ / '+(it.u||'шт');
    return '<label class="mat-item ep-select-row"><input type="checkbox" class="ep-global-check" data-type="'+type+'" data-item="'+esc(item)+'" style="width:22px;height:22px;accent-color:var(--primary);"><div style="flex:1;"><b>'+esc(it.n||'Позиция')+'</b><br><span style="color:var(--gray);font-size:11px;">'+esc(sub)+'</span></div></label>';
  }
  

/* =========================================================
 * ESTIMATE VIEW FUNCTION: renderServerModalList
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
 * ESTIMATE VIEW FUNCTION: rerender
 * ========================================================= */
function rerender(){
    try{ if(typeof renderDbEditors === 'function') renderDbEditors(); }catch(e){}
    try{ if(window.renderDbEditors && window.renderDbEditors !== renderDbEditors) window.renderDbEditors(); }catch(e){}
    try{ if(typeof window.epRefreshDbScopeUi === 'function') window.epRefreshDbScopeUi(); }catch(e){}
    setTimeout(function(){ try{ if(typeof renderDbEditors === 'function') renderDbEditors(); }catch(e){} },80);
    setTimeout(function(){ try{ if(typeof renderDbEditors === 'function') renderDbEditors(); }catch(e){} },500);
  }

  

/* =========================================================
 * ESTIMATE VIEW FUNCTION: rerenderOpenScreens
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
 * ESTIMATE VIEW FUNCTION: csvRows
 * ========================================================= */
function csvRows(txt){
    var lines = String(txt || '').split(/\r?\n/).filter(function(x){ return x.trim(); });
    var delims = [';','\t',','];
    var delim = delims.map(function(d){ return {d:d, n:(lines[0] || '').split(d).length}; }).sort(function(a,b){ return b.n-a.n; })[0].d;
    return lines.map(function(line){
      var out = [], cur = '', q = false;
      for(var i=0;i<line.length;i++){
        var ch = line[i];
        if(ch === '"') { if(q && line[i+1] === '"'){ cur += '"'; i++; } else q = !q; }
        else if(ch === delim && !q){ out.push(cur); cur=''; }
        else cur += ch;
      }
      out.push(cur);
      return out;
    });
  }
  

/* =========================================================
 * ESTIMATE VIEW FUNCTION: normItem
 * ========================================================= */
function normItem(raw,type,idx){
    raw = raw || {};
    var n = cleanText(raw.n || raw.name || raw.title || raw.имя || raw.наименование || raw['Наименование'] || raw['Название'] || raw['Имя']);
    if(!n) return null;
    var c = cleanText(raw.c || raw.category || raw.cat || raw.категория || raw['Категория']) || inferCat(n,type);
    var sc = cleanText(raw.sc || raw.g || raw.subcategory || raw.group || raw.подкатегория || raw['Подкатегория'] || raw['Группа']) || inferSub(n,c,type);
    var p = money(raw.p != null ? raw.p : (raw.price != null ? raw.price : (raw.цена != null ? raw.цена : raw['Цена'])));
    var u = cleanText(raw.u || raw.unit || raw.ед || raw['Ед.'] || raw['Единица'] || raw['Ед. изм.']) || 'шт';
    return { id: raw.id || ((type === 'work' ? 'w' : 'm') + '_imp_' + Date.now() + '_' + idx), n:n, c:c, sc:sc, g:sc, p:p, u:u };
  }
  

/* =========================================================
 * ESTIMATE VIEW FUNCTION: rowsToItems
 * ========================================================= */
function rowsToItems(rows,type){
    rows = rows || [];
    var header = null, currentCat = '', currentSub = '', out = [];
    function cell(row,i){ return cleanText((row || [])[i]); }
    rows.forEach(function(row,ri){
      row = (row || []).map(function(v){ return cleanText(v); });
      var non = row.filter(Boolean);
      if(!non.length) return;
      var joined = norm(non.join(' '));
      if(/наимен|назван|имя|цена|стоим|ед/.test(joined) && !header){
        header = {};
        row.forEach(function(v,i){ var s = norm(v); if(/наимен|назван|имя|позиция|товар|работ/.test(s)) header.name=i; if(/категор/.test(s) && header.cat == null) header.cat=i; if(/подкат|группа/.test(s)) header.sub=i; if(/цена|стоим|прайс/.test(s)) header.price=i; if(/ед|изм/.test(s)) header.unit=i; });
        return;
      }
      var priceIdx = -1, unitIdx = -1;
      row.forEach(function(v,i){ if(priceIdx < 0 && money(v) > 0 && /^[-\d\s.,]+/.test(v)) priceIdx = i; if(unitIdx < 0 && /^(шт|м|м\.п\.?|пог\.м|уп|упак|компл|кг|л|рул|бухта)$/i.test(v)) unitIdx = i; });
      if(header){
        var n = cell(row, header.name);
        if(n){
          out.push(normItem({n:n, c:cell(row, header.cat), sc:cell(row, header.sub), p:cell(row, header.price), u:cell(row, header.unit)}, type, out.length));
        }
        return;
      }
      if(priceIdx < 0 && non.length <= 2){
        var title = non.join(' ');
        if(type === 'work' || /работ|монтаж|штроб|резк|сверл|демонтаж/i.test(title)) { currentCat = title; currentSub = ''; }
        else if(!currentCat) currentCat = title; else currentSub = title;
        return;
      }
      var candidates = row.map(function(v,i){ return {v:v,i:i}; }).filter(function(x){ return x.v && x.i !== priceIdx && x.i !== unitIdx && !/^[-\d\s.,]+$/.test(x.v); });
      if(!candidates.length) return;
      candidates.sort(function(a,b){ return b.v.length - a.v.length; });
      var name = candidates[0].v;
      if(name.length < 3) return;
      out.push(normItem({n:name, c:currentCat || inferCat(name,type), sc:currentSub || inferSub(name,currentCat,type), p:priceIdx >= 0 ? row[priceIdx] : 0, u:unitIdx >= 0 ? row[unitIdx] : 'шт'}, type, out.length));
    });
    return out.filter(Boolean);
  }
  

/* =========================================================
 * ESTIMATE VIEW FUNCTION: jsonToItems
 * ========================================================= */
function jsonToItems(raw,type){
    if(raw && raw.matDB && type === 'mat') raw = raw.matDB;
    else if(raw && raw.workDB && type === 'work') raw = raw.workDB;
    else if(raw && Array.isArray(raw.items)) raw = raw.items;
    else if(raw && raw.data && Array.isArray(raw.data)) raw = raw.data;
    else if(raw && typeof raw === 'object' && !Array.isArray(raw)) raw = Object.keys(raw).map(function(k){ return raw[k]; });
    if(!Array.isArray(raw)) raw = [];
    return raw.map(function(x,i){ return normItem(x,type,i); }).filter(Boolean);
  }
  

/* =========================================================
 * ESTIMATE VIEW FUNCTION: renderReviewPage
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
 * ESTIMATE VIEW FUNCTION: renderPanel
 * ========================================================= */
function renderPanel(){
    var p=ensurePanel(); if(!p) return;
    var s=scope(), admin=isAdmin(), my=s==='my';
    var title=my?'👤 Моя база данных':'🌍 База сервера';
    var matCount=active('mat').length, workCount=active('work').length;
    var note=my
      ? 'Это личная база текущего мастера. Импорт, экспорт, цены и замена позиций меняют только эту базу.'
      : (admin?'Вы админ: можно импортировать, заменять, редактировать цены и сохранять базу сервера.':'Просмотр базы сервера. Мастер не меняет сервер напрямую: можно экспортировать, взять позицию себе или отправить импорт заявкой админу.');
    var html='<div style="font-weight:900;color:var(--primary);font-size:15px;">'+title+'</div>'+
      '<div class="ep-v7-note">'+note+'<br>Материалы: <b>'+matCount+'</b>, работы: <b>'+workCount+'</b>. Вперемешку базы не считаются.</div>'+
      '<div class="ep-v7-actions">';
    if(my || admin){
      html+='<button class="btn-info" onclick="epTriggerDbFileImport(\'mat\')">📥 Импорт материалов</button>'+
            '<button class="btn-work" onclick="epTriggerDbFileImport(\'work\')">📥 Импорт работ</button>'+
            '<button class="btn-vendor" onclick="epOpenTextImport && epOpenTextImport(\'mat\')">📝 Материалы текстом</button>'+
            '<button class="btn-vendor" onclick="epOpenTextImport && epOpenTextImport(\'work\')">📝 Работы текстом</button>';
    } else {
      html+='<button class="btn-info" onclick="epTriggerServerProposalImportV7(\'mat\')">📨 Материалы заявкой админу</button>'+
            '<button class="btn-work" onclick="epTriggerServerProposalImportV7(\'work\')">📨 Работы заявкой админу</button>'+
            '<button class="btn-vendor" onclick="epOpenTextImportServerProposalV7(\'mat\')">📝 Материалы заявкой</button>'+
            '<button class="btn-vendor" onclick="epOpenTextImportServerProposalV7(\'work\')">📝 Работы заявкой</button>';
    }
    html+='<button class="btn-success" onclick="epExportActiveDb()">📤 Экспорт этой базы</button>'+
          '<button class="btn-info" onclick="epReloadActiveDbV7()">🔄 Обновить / перезагрузить</button>';
    if(canEditActive()) html+='<button class="btn-primary" onclick="epSaveActiveDbV7()">💾 Сохранить базу</button>';
    if(my) html+='<button class="btn-danger" onclick="epOpenDbFactoryResetModal && epOpenDbFactoryResetModal()">🧹 Очистка / сброс</button>';
    else if(admin) html+='<button class="btn-danger" onclick="epOpenDbFactoryResetModal && epOpenDbFactoryResetModal()">🧹 Очистка сервера</button>';
    html+='</div>';
    if(!my && !admin) html+='<div class="ep-v7-note">Редактирование, сохранение, замена и цены сервера заблокированы для мастера.</div>';
    p.innerHTML=html;
  }
  

/* =========================================================
 * ESTIMATE VIEW FUNCTION: renderRows
 * ========================================================= */
function renderRows(type){
    var arr=active(type), html=editorTop(type);
    if(!arr.length) return html+'<div style="padding:15px;border:1px dashed var(--border);border-radius:12px;text-align:center;color:var(--gray);font-weight:800;">'+label()+' пустая.</div>';
    var cats={},i=0; arr.forEach(function(it){ var c=it.c||'Разное', g=groupOf(it)||'Без группы'; if(!cats[c])cats[c]={}; if(!cats[c][g])cats[c][g]=[]; cats[c][g].push(it); });
    Object.keys(cats).sort(function(a,b){return a.localeCompare(b,'ru');}).forEach(function(c){ var cid='v7_cat_'+type+'_'+(i++); html+='<div class="cat-header" onclick="epDbToggle && epDbToggle(&quot;'+cid+'&quot;, event)">'+esc(c)+'</div><div class="cat-body" id="'+cid+'">'; Object.keys(cats[c]).sort(function(a,b){return a.localeCompare(b,'ru');}).forEach(function(g){ var gid='v7_sub_'+type+'_'+(i++); html+='<div class="sub-cat-header" onclick="epDbToggle && epDbToggle(&quot;'+gid+'&quot;, event)">'+esc(g)+' ▾</div><div class="sub-cat-body" id="'+gid+'">'; cats[c][g].sort(function(a,b){return String(a.n||'').localeCompare(String(b.n||''),'ru');}).forEach(function(it){ html+=editorRow(type,it); }); html+='</div>'; }); html+='</div>'; });
    return html;
  }
  

/* =========================================================
 * ESTIMATE VIEW FUNCTION: makeManualItem
 * ========================================================= */
function makeManualItem(type){
    var cat=$('db-new-cat')?clean($('db-new-cat').value):'';
    var name=$('db-new-name')?clean($('db-new-name').value):'';
    var price=$('db-new-price')?money($('db-new-price').value):0;
    var unit=$('db-new-unit')?clean($('db-new-unit').value)||'шт':'шт';
    if(!name) throw new Error('Введите название позиции');
    var it={id:(type==='work'?'w':'m')+'_manual_v8_'+Date.now(),c:cat||'Разное',n:name,p:price,u:unit};
    try{ if(typeof window.epAutoGroupItem==='function') it=window.epAutoGroupItem(type,it); }catch(e){}
    return it;
  }

  

/* =========================================================
 * ESTIMATE VIEW FUNCTION: provider
 * ========================================================= */
function provider(){
    try{ var p=(window.EP_AI_CONFIG&&window.EP_AI_CONFIG.provider)||safeGet('ep_ai_provider_v1','gemini'); return p==='openai'?'openai':'gemini'; }catch(e){ return 'gemini'; }
  }
  

/* =========================================================
 * ESTIMATE VIEW FUNCTION: keyForProvider
 * ========================================================= */
function keyForProvider(p){
    try{
      if(p==='openai') return (window.EP_AI_CONFIG&&window.EP_AI_CONFIG.openaiKey)||safeGet('ep_openai_key_v1','');
      return (window.EP_AI_CONFIG&&window.EP_AI_CONFIG.geminiKey)||(typeof GEMINI_API_KEY!=='undefined'?GEMINI_API_KEY:'')||safeGet('gemini_key_v31','');
    }catch(e){ return ''; }
  }
  

/* =========================================================
 * ESTIMATE VIEW FUNCTION: appPrice
 * ========================================================= */
function appPrice(key, def){ try{ return money((window.appLogic||{})[key]) || def; }catch(e){ return def; } }
  

/* =========================================================
 * ESTIMATE VIEW FUNCTION: fixShieldWorkItem
 * ========================================================= */
function fixShieldWorkItem(it, originalLabel){
    if(!it) return it;
    var x=it;
    var n=String(x.n||'').trim();
    var label=String(originalLabel||n||'');
    var nl=norm(n), ll=norm(label);

    // Wrong fuzzy match: "Установка щита" was matched to "Установка БП в щит".
    if(/установка\s+бп\s+в\s+щит/i.test(n) || /установка\s+щита/.test(ll)){
      x.n='Установка щита';
      x.p=appPrice('shieldInstallPrice', 2500);
      x.u='шт';
      x.type='work';
      x.c='Щитовое';
      x.g='Монтаж щита';
      x.sc='Монтаж щита';
      x.dbMeta=Object.assign({}, x.dbMeta||{}, {category:'Щитовое', subcategory:'Монтаж щита'});
      delete x.sourceId;
      return x;
    }

    // Wrong fuzzy match: DB row name is only "Бетон", but estimate must show the actual work.
    if((/^(бетон|кирпич|панелька|мягкий мат|мягкий материал)$/.test(nl) && x.type==='work') || /штроба.*100.*50/.test(ll)){
      var wall = wallFromName(label+' '+n);
      x.n='Штроба 100×50, под трассу кабелей ('+wall+')';
      x.p=money(x.p) || appPrice('shieldInputGroovePrice',1500);
      x.u='м.п.';
      x.type='work';
      x.c='Штробление и резка';
      x.g='Штроба 100×50 под трассу кабелей';
      x.sc='Штроба 100×50 под трассу кабелей';
      x.dbMeta=Object.assign({}, x.dbMeta||{}, {category:'Штробление и резка', subcategory:'Штроба 100×50 под трассу кабелей', wall:wall});
      if(/^бетон|кирпич|панелька|мягкий/.test(nl)) delete x.sourceId;
      return x;
    }

    if(/^ниша\s+щита/i.test(n)){
      x.c='Штробление и резка';
      x.g='Ниши щита';
      x.sc='Ниши щита';
      x.u=x.u||'мод.';
      x.dbMeta=Object.assign({}, x.dbMeta||{}, {category:'Штробление и резка', subcategory:'Ниши щита'});
    }
    return x;
  }

  

/* =========================================================
 * ESTIMATE VIEW FUNCTION: normalizeCurrentEstimate
 * ========================================================= */
function normalizeCurrentEstimate(){
    try{
      if(!Array.isArray(currentEstimate)) return;
      currentEstimate.forEach(function(it){
        if(!it || it.type!=='work') return;
        fixShieldWorkItem(it, it.n);
      });
    }catch(e){ console.warn(V, e); }
  }

  

/* =========================================================
 * ESTIMATE VIEW FUNCTION: showDetailsV16
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
 * ESTIMATE VIEW FUNCTION: lineConfig
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
 * ESTIMATE VIEW FUNCTION: rcdPrice
 * ========================================================= */
function rcdPrice(leak,brand,kind){ var hit=dbFindRcd(leak,brand,kind); if(hit) return money(hit.p); return leak===10?3600:1195; }
  

/* =========================================================
 * ESTIMATE VIEW FUNCTION: makeItem
 * ========================================================= */
function makeItem(n,q,p,type,meta,assign){ var it=Object.assign({n:n,q:Number(q)||1,p:money(p),u:(meta&&meta.unit)||'шт',type:type||'mat',tag:'shield'},meta||{}); if(assign){ it.epAssignment=assign; it.epAssignments=[assign]; it.epMergedDetails=[assign]; if(!it.dbMeta) it.dbMeta={}; it.dbMeta.assignment=assign; } return it; }
  

/* =========================================================
 * ESTIMATE VIEW FUNCTION: renderMainDirect
 * ========================================================= */
function renderMainDirect(){
    var tb=document.querySelector('#mainTable tbody'); if(!tb) return;
    var arr=[]; try{ arr=Array.isArray(currentEstimate)?currentEstimate:(Array.isArray(window.currentEstimate)?window.currentEstimate:[]); }catch(e){ arr=Array.isArray(window.currentEstimate)?window.currentEstimate:[]; }
    tb.innerHTML=''; var total=0;
    arr.forEach(function(it,idx){ var q=Number(it.q)||0, sum=(typeof fPrice==='function'?fPrice(it):(Number(it.p)||0))*q; total+=sum; tb.insertAdjacentHTML('beforeend','<tr><td class="col-name editable-name" onclick="openSwapModal('+idx+')" title="Нажмите для замены">'+esc(it.n)+'</td><td class="col-qty"><input type="number" value="'+esc(q)+'" onchange="currentEstimate['+idx+'].q=Number(this.value); window.currentEstimate=currentEstimate; renderMainTable();" style="width:50px;padding:6px;margin:0;text-align:center;"></td><td class="col-sum">'+Math.round(sum)+' P</td><td style="text-align:right;"><button onclick="currentEstimate.splice('+idx+',1); window.currentEstimate=currentEstimate; renderMainTable();" class="btn-danger" style="padding:6px;border-radius:8px;width:auto;margin:0;">✕</button></td></tr>'); });
    var tot=$('tot-all'); if(tot) tot.innerText=total.toLocaleString('ru-RU')+' P';
    try{ if(typeof syncDraft==='function') syncDraft(); }catch(e){}
  }
  

/* =========================================================
 * ESTIMATE VIEW FUNCTION: groupLines
 * ========================================================= */
function groupLines(lines){
    var m={};
    lines.forEach(function(l){ var key=curveNom(l.nominal,l.curve); if(!m[key]) m[key]={nominal:key, lines:[], groups:{}}; m[key].lines.push(l.name); m[key].groups[l.group]=true; });
    return Object.keys(m).map(function(k){ return m[k]; });
  }
  

/* =========================================================
 * ESTIMATE VIEW FUNCTION: buildLines
 * ========================================================= */
function buildLines(curve){
    var lines=[];
    function add(name,nom,group,opts){ opts=opts||{}; lines.push({name:name,nominal:nom,curve:curve,group:group,wet:group==='wet'||!!opts.wet,nonSwitchable:!!opts.nonSwitchable}); }
    function room(label,count,wet){ count=Number(count)||0; for(var i=1;i<=count;i++){ var n=count>1?label+' '+i:label; add(n+' розетки','C16',wet?'wet':'power',{wet:wet}); add(n+' свет','C10','light'); } }
    room('Кухня',cfgN('kits'),false); room('Ванная',cfgN('baths'),true); room('Туалет',cfgN('toilets'),true); room('Комната',cfgN('rms'),false); room('Балкон',cfgN('bals'),false);
    if(chk('c-apron')) add('Фартук кухни','C16','power');
    if(chk('c-dish')) add('Посудомойка','C10','power');
    if(chk('c-washer')) add('Стиралка/сушилка','C10','wet',{wet:true});
    if(chk('c-towel')) add('Полотенцесушитель','C10','wet',{wet:true});
    for(var a=1;a<=cfgN('acs');a++) add('Кондиционер '+a,'C10','climate');
    for(var f=1;f<=cfgN('fls');f++) add('Тёплый пол '+f,'C10','climate');
    if(chk('c-fridge')) add('Холодильник, неотключаемая группа','C10','alwaysOn',{nonSwitchable:true});
    if(chk('c-neptun')) add('Нептун, неотключаемая группа','C10','alwaysOn',{nonSwitchable:true});
    if(chk('c-router')) add('Роутер, неотключаемая группа','C6','alwaysOn',{nonSwitchable:true});
    var hp=val('c-hob-power','none'); if(hp==='6') add('Плита до 6 кВт','C25',chk('cfg-heavy-separate')?'heavy':'power'); if(hp==='10') add('Плита до 10 кВт','C32',chk('cfg-heavy-separate')?'heavy':'power');
    var bp=val('c-boiler-power','none'); if(bp==='6') add('Бойлер до 6 кВт','C25','wet',{wet:true}); if(bp==='10') add('Бойлер до 10 кВт','C32','wet',{wet:true});
    return lines;
  }
  

/* =========================================================
 * ESTIMATE VIEW FUNCTION: addShieldToEstimate
 * ========================================================= */
function addShieldToEstimate(items){
    // Use original addAuto if possible, because it also syncs totals and storage. Items are already aggregated by V19.
    try{ if(typeof addAuto==='function'){ addAuto(items,'shield'); return; } }catch(e){}
    try{ window.currentEstimate=(Array.isArray(window.currentEstimate)?window.currentEstimate:[]).filter(function(it){return it.tag!=='shield'&&it.tag!=='shield_info';}).concat(items); currentEstimate=window.currentEstimate; if(typeof renderMainTable==='function') renderMainTable(); }catch(e){}
  }
  

/* =========================================================
 * ESTIMATE VIEW FUNCTION: item
 * ========================================================= */
function item(n,q,p,type,meta,assigns){
    var a=[]; if(Array.isArray(assigns)) a=assigns.map(clean).filter(Boolean); else if(assigns) a=[clean(assigns)].filter(Boolean);
    var it=Object.assign({n:n,q:Number(q)||1,p:money(p),u:(meta&&meta.unit)||'шт',type:type||'mat',tag:'shield'},meta||{});
    if(a.length){ it.epAssignment=a[0]; it.epAssignments=a.slice(); it.epMergedDetails=a.slice(); it.assignment=a[0]; it.dbMeta=Object.assign({},it.dbMeta||{}, {assignment:a[0]}); }
    return it;
  }
  

/* =========================================================
 * ESTIMATE VIEW FUNCTION: rowId
 * ========================================================= */
function rowId(row,type,idx){
    var price=row.querySelector('input[type="number"][data-id]'); if(price && price.getAttribute('data-id')) return {id:price.getAttribute('data-id'), type:price.getAttribute('data-type')||type};
    var itemBtn=row.querySelector('[data-item]');
    if(itemBtn){ try{ var raw=decodeURIComponent(escape(atob(itemBtn.getAttribute('data-item')))); var obj=JSON.parse(raw); if(obj&&obj.id) return {id:obj.id,type:itemBtn.getAttribute('data-type')||type}; }catch(e){} }
    return {id:'v21row_'+type+'_'+idx+'_'+clean(row.textContent).slice(0,40), type:type};
  }
  
