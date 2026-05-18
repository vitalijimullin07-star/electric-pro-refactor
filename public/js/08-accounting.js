/*
 * Electric PRO Refactor
 * Module: 08-accounting.js
 * V39 SAFE: Accounting.
 *
 * Важно:
 * - модуль пересобран безопасно;
 * - переносим только полноценные function / async function;
 * - каждый блок проверяется через node --check;
 * - 00-core.js временно остаётся стабильным runtime.
 */

console.log("08-accounting.js V39 SAFE loaded");



/* =========================================================
 * ACCOUNTING FUNCTION: fPrice
 * ========================================================= */
function fPrice(it) { return Math.round((it.p || 0) * (1 + (it.type === 'mat'? coeffs.mat: coeffs.work) / 100)); }




/* =========================================================
 * ACCOUNTING FUNCTION: renderMainTable
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
 * ACCOUNTING FUNCTION: applyPoolToEstimate
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
 * ACCOUNTING FUNCTION: epMat
 * ========================================================= */
function epMat(label, q, fallbackPrice, words, meta) {
    const m = meta || {};
    const found = epFindDbItem('mat', words || [label]);
    const name = epV15DisplayMaterialName(found, label, Object.assign({}, m, { rawLabel: label, brand: m.brand || epGetVal('cfg-brand-auto', 'IEK') }));
    const out = {
        n: found ? name : `⚠️ ${name} [${m.category || 'Материалы'}${m.subcategory ? ' → ' + m.subcategory : ''}] — добавить в БД`,
        q: q,
        p: found ? (Number(found.p) || Number(fallbackPrice) || 0) : (Number(fallbackPrice) || 0),
        u: (found && found.u) || m.unit || 'шт',
        type: 'mat',
        sourceId: found && found.id ? found.id : null,
        needDb: !found,
        dbMeta: Object.assign({}, m, { rawLabel: label, brand: m.brand || epGetVal('cfg-brand-auto', 'IEK'), foundName: found && found.n ? found.n : '' }),
        epRawLabel: label
    };
    if (m.assignment) { out.epAssignment = m.assignment; out.epAssignments = [m.assignment]; out.epMergedDetails = [m.assignment]; }
    return out;
}




/* =========================================================
 * ACCOUNTING FUNCTION: epWork
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
 * ACCOUNTING FUNCTION: epAutoPrice
 * ========================================================= */
function epAutoPrice(brand) { return brand === 'ABB' ? 350 : 155; }



/* =========================================================
 * ACCOUNTING FUNCTION: epDifPrice
 * ========================================================= */
function epDifPrice(brand) { return brand === 'ABB' ? 4500 : 3600; }




/* =========================================================
 * ACCOUNTING FUNCTION: generateCascadePanel
 * ========================================================= */
function generateCascadePanel() {
    const bBox = epGetVal('cfg-brand-box', 'Tekfor');
    const bAuto = epGetVal('cfg-brand-auto', 'IEK');
    const sWall = epGetVal('cfg-shield-wall', 'Бетон');
    const ph = parseInt(epGetVal('cfg-phase', '1')) || 1;
    const curve = epGetVal('cfg-auto-curve', 'C');
    const rcdType = epGetVal('cfg-rcd-type', 'A');
    const protectionType = epGetVal('cfg-protection-type', 'uzo_auto');
    const isMaster = epGetCheck('cfg-master');
    const heavySeparate = epGetCheck('cfg-heavy-separate');

    let m = [], w = [], lines = [], protectionDevices = [], warnings = [];
    function addLine(name, nominal, group, opts) {
        const o = opts || {};
        lines.push({ name, nominal, group, curve: o.curve || curve, nonSwitchable: !!o.nonSwitchable, wet: group === 'wet' || !!o.wet });
    }
    function addRoom(label, count, wetPower) {
        for (let i = 1; i <= count; i++) {
            const n = count > 1 ? `${label} ${i}` : label;
            addLine(`${n} розетки`, 'C16', wetPower ? 'wet' : 'power', { wet: wetPower });
            addLine(`${n} свет`, 'C10', 'light');
        }
    }
    addRoom('Кухня', cfg.kits || 0, false);
    addRoom('Ванная', cfg.baths || 0, true);
    addRoom('Туалет', cfg.toilets || 0, true);
    addRoom('Комната', cfg.rms || 0, false);
    addRoom('Балкон', cfg.bals || 0, false);
    if (epGetCheck('c-apron')) addLine('Фартук кухни', 'C16', 'power');
    if (epGetCheck('c-dish')) addLine('Посудомойка', 'C10', 'power');
    if (epGetCheck('c-washer')) addLine('Стиралка/сушилка', 'C10', 'wet', { wet: true });
    if (epGetCheck('c-towel')) addLine('Полотенцесушитель', 'C10', 'wet', { wet: true });
    for (let i = 1; i <= (cfg.acs || 0); i++) addLine(`Кондиционер ${i}`, 'C10', 'climate');
    for (let i = 1; i <= (cfg.fls || 0); i++) addLine(`Тёплый пол ${i}`, 'C10', 'climate');
    if (epGetCheck('c-fridge')) addLine('Холодильник, неотключаемая группа', 'C10', 'alwaysOn', { nonSwitchable: true });
    if (epGetCheck('c-neptun')) addLine('Нептун, неотключаемая группа', 'C10', 'alwaysOn', { nonSwitchable: true });
    if (epGetCheck('c-router')) addLine('Роутер, неотключаемая группа', 'C6', 'alwaysOn', { nonSwitchable: true });
    const hobPower = epGetVal('c-hob-power', 'none');
    if (hobPower === '6') addLine('Плита до 6 кВт', 'C25', heavySeparate ? 'heavy' : 'power');
    if (hobPower === '10') addLine('Плита до 10 кВт', 'C32', heavySeparate ? 'heavy' : 'power');
    const boilerPower = epGetVal('c-boiler-power', 'none');
    if (boilerPower === '6') addLine('Бойлер до 6 кВт', 'C25', 'wet', { wet: true });
    if (boilerPower === '10') addLine('Бойлер до 10 кВт', 'C32', 'wet', { wet: true });

    const groupNames = { power: 'Силовые линии', climate: 'Климат', wet: 'Влажные зоны', light: 'Освещение', heavy: 'Большая техника', alwaysOn: 'Неотключаемые группы' };
    const presentGroups = Array.from(new Set(lines.map(l => l.group))).filter(Boolean);
    function groupAssignment(group, leakage) {
        const ls = lines.filter(l => l.group === group).map(l => l.name);
        const head = group === 'wet' ? 'Влажные зоны / защита 10 мА' : (groupNames[group] || group);
        return ls.length ? `${head}: ${ls.join(', ')}` : head;
    }
    function addProtection(group, mode) {
        const leakage = group === 'wet' ? 10 : 30;
        const kind = mode || (protectionType === 'dif_auto' ? 'ДИФ' : 'УЗО');
        protectionDevices.push({ group, kind, leakage, rcdType, modules: 2, assignment: groupAssignment(group, leakage) });
        if (group === 'wet' && leakage !== 10) warnings.push('Влажные зоны должны быть 10 мА');
    }
    if (protectionType === 'main_dif_auto') protectionDevices.push({ group: 'main', kind: 'Главный ДИФ', leakage: 30, rcdType, modules: 2, assignment: 'Вводная групповая защита всего щита' });
    else if (protectionType === 'mixed') presentGroups.forEach(g => addProtection(g, g === 'wet' ? 'ДИФ' : 'УЗО'));
    else presentGroups.forEach(g => addProtection(g, protectionType === 'dif_auto' ? 'ДИФ' : 'УЗО'));

    function mat(label, q, price, words, meta, assignment) {
        meta = Object.assign({}, meta || {}, { brand: bAuto });
        if (assignment) meta.assignment = assignment;
        const it = epMat(label, q, price, words, meta);
        if (assignment) { it.epAssignment = assignment; it.epAssignments = [assignment]; it.epMergedDetails = [assignment]; }
        return it;
    }
    function work(label, q, price, words, meta, assignment) {
        meta = Object.assign({}, meta || {});
        if (assignment) meta.assignment = assignment;
        const it = epWork(label, q, price, words, meta);
        if (assignment) { it.epAssignment = assignment; it.epAssignments = [assignment]; it.epMergedDetails = [assignment]; }
        return it;
    }

    m.push(mat(`Вводной автомат ${ph}ф ${bAuto}`, 1, bAuto === 'ABB' ? 3500 : 1800, ['автомат', 'вводной', bAuto, ph + 'ф'], { category: 'Автоматика', subcategory: 'Автоматы', kind: 'input_breaker', unit: 'шт', poles: ph === 3 ? '4P' : '2P' }, 'Вводной аппарат щита'));
    protectionDevices.forEach(pd => {
        const label = pd.kind === 'Главный ДИФ' ? `Главный ДИФ ${bAuto} ${pd.leakage}мА тип ${pd.rcdType}` : `${pd.kind} ${groupNames[pd.group] || pd.group} ${pd.leakage}мА тип ${pd.rcdType} ${bAuto}`;
        m.push(mat(label, 1, epDifPrice(bAuto), [pd.kind, bAuto, pd.leakage + 'мА', pd.rcdType, groupNames[pd.group] || pd.group], { category: 'Автоматика', subcategory: pd.kind === 'ДИФ' || pd.kind === 'Главный ДИФ' ? 'ДИФы' : 'УЗО', kind: pd.kind === 'ДИФ' || pd.kind === 'Главный ДИФ' ? 'dif' : 'uzo', leakage: pd.leakage, rcdType: pd.rcdType, amp: 40, poles: pd.kind === 'ДИФ' ? '1P+N' : '2P', modules: 2 }, pd.assignment));
    });
    lines.forEach(line => {
        const label = `Автомат ${line.nominal} тип ${line.curve} ${bAuto} — ${line.name}`;
        m.push(mat(label, 1, epAutoPrice(bAuto), ['автомат', bAuto, line.nominal, line.curve], { category: 'Автоматика', subcategory: 'Автоматы', kind: 'automatic', nominal: line.nominal, curve: line.curve, modules: 1, poles: '1P' }, line.name));
    });
    if (epGetCheck('cfg-uzm')) {
        const q = ph === 3 ? 3 : 1;
        m.push(mat(`Реле напряжения ${bAuto}`, q, 4500, ['реле напряжения', 'узм', bAuto], { category: 'Автоматика', subcategory: 'УЗМ / реле напряжения', kind: 'voltage_relay', modules: ph === 3 ? 6 : 2 }, 'Защита от перенапряжения'));
    }
    if (isMaster) {
        const lightLines = lines.filter(l => l.group === 'light').map(l => l.name).join(', ') || 'световые группы';
        m.push(mat(`Контактор C40 ${bAuto} — мастер-кнопка света`, 1, 2200, ['контактор', 'C40', bAuto], { category: 'Автоматика', subcategory: 'Контакторы', kind: 'contactor', modules: 2 }, 'Мастер-кнопка только на свет: ' + lightLines));
        m.push(mat(`Автомат C40 тип ${curve} ${bAuto} — байпас мастер-кнопки`, 1, bAuto === 'ABB' ? 600 : 380, ['автомат', 'C40', bAuto, curve], { category: 'Автоматика', subcategory: 'Автоматы', kind: 'automatic', nominal: 'C40', curve: curve, modules: 1, poles: '1P' }, 'Байпас мастер-кнопки света'));
    }
    currentShieldExtras.forEach(ex => m.push({ n: ex.n, q: ex.q, p: ex.p, u: ex.u || 'шт', type: 'mat', epAssignment: 'Дополнительный аппарат защиты', epAssignments: ['Дополнительный аппарат защиты'], epMergedDetails: ['Дополнительный аппарат защиты'] }));

    const onePoleCount = lines.length + (isMaster ? 1 : 0);
    const twoPoleProtectionCount = protectionDevices.length;
    const relayModules = epGetCheck('cfg-uzm') ? (ph === 3 ? 6 : 2) : 0;
    const masterModules = isMaster ? 3 : 0;
    const extraModules = currentShieldExtras.reduce((s, ex) => s + (Number(ex.modules || 1) * Number(ex.q || 1)), 0);
    const totalModules = Math.ceil(onePoleCount + twoPoleProtectionCount * 2 + relayModules + masterModules + extraModules + (ph === 3 ? 3 : 2));
    const boxSize = [6,12,24,36,48,60,72].find(s => s >= totalModules) || 72;
    if (totalModules > 72) warnings.push('Нужно больше 72 модулей — требуется второй щит или пересборка схемы');

    m.unshift(mat(`Щит ${sWall === 'Накладной' ? 'накладной' : 'встраиваемый'} ${bBox} ${boxSize}М`, 1, bBox === 'ABB' ? 6510 : 2660, ['щит', bBox, String(boxSize), sWall === 'Накладной' ? 'накладной' : 'встраиваемый'], { brand: bBox, category: 'Щитовое', subcategory: 'Корпуса', kind: 'shield_box', modules: boxSize, mountType: sWall === 'Накладной' ? 'surface' : 'built_in' }, 'Корпус щита'));
    const comb1P = Math.ceil(onePoleCount / 12), comb2P = Math.ceil(twoPoleProtectionCount / 6), rows = Math.ceil(boxSize / 12);
    const pugvSize = Number(appLogic.shieldPugvSize || 6), pugvMeters = Math.max(4, Math.ceil(totalModules * 0.4)), nshviPacks = Math.max(1, Math.ceil(boxSize / 48));
    if (comb1P > 0) m.push(mat('Гребёнка 1P 25см', comb1P, 250, ['гребенка', '1P', '25'], { category: 'Щитовое', subcategory: 'Гребёнки', kind: 'comb_bus_1p' }, 'Питание однополюсных автоматов'));
    if (comb2P > 0) m.push(mat('Гребёнка 2P 25см', comb2P, 450, ['гребенка', '2P', '25'], { category: 'Щитовое', subcategory: 'Гребёнки', kind: 'comb_bus_2p' }, 'Питание УЗО/ДИФ'));
    if (twoPoleProtectionCount > 0) m.push(mat('Нулевая шинка N на группу УЗО/ДИФ', twoPoleProtectionCount, 285, ['шина', 'N', 'ноль', 'DIN'], { category: 'Щитовое', subcategory: 'Шины N/PE', kind: 'neutral_bus' }, 'N-шинки по группам защиты'));
    m.push(mat(`PE-шина на ${appLogic.shieldPeBusContacts || 26} контактов`, 1, 770, ['PE', 'шина', '26'], { category: 'Щитовое', subcategory: 'Шины N/PE', kind: 'pe_bus' }, 'Защитное заземление PE'));
    m.push(mat('DIN-рейка / комплект DIN для щита', rows, 180, ['DIN', 'рейка'], { category: 'Щитовое', subcategory: 'DIN', kind: 'din_rail' }, 'Крепление аппаратов на DIN-рейке'));
    m.push(mat('Ограничитель на DIN-рейку', rows * 2, 35, ['ограничитель', 'DIN'], { category: 'Щитовое', subcategory: 'DIN', kind: 'din_stopper' }, 'Фиксация аппаратов на DIN-рейке'));
    m.push(mat(`Провод ПуГВ 1×${pugvSize}`, pugvMeters, 85, ['ПуГВ', '1x' + pugvSize, '1×' + pugvSize], { category: 'Щитовое', subcategory: 'Провода', kind: 'pugv', unit: 'м.п.' }, 'Внутренняя разводка щита'));
    m.push(mat(`НШВИ 1×${pugvSize}, упак. 100 шт`, nshviPacks, 225, ['НШВИ', '1x' + pugvSize, '1×' + pugvSize], { category: 'Щитовое', subcategory: 'Наконечники', kind: 'lug_pack' }, 'Опрессовка проводов щита'));
    m.push(mat('Маркировка линий / бирки', lines.length, 15, ['маркировка', 'бирки'], { category: 'Щитовое', subcategory: 'Маркировка', kind: 'marking_tag' }, 'Маркировка линий'));
    if (epGetCheck('cfg-cable-glands')) m.push(mat('Кабельные вводы / сальники', 1, 250, ['кабельный ввод', 'сальник'], { category: 'Щитовое', subcategory: 'Кабельные вводы', kind: 'cable_gland' }, 'Ввод кабелей в щит'));

    if (sWall !== 'Накладной') w.push(work(`Ниша щита ${boxSize}М (${sWall})`, boxSize, appLogic.shieldNichePerModule || 400, ['ниша', 'щит', sWall, String(boxSize)], { unit: 'мод.', category: 'Штробление и резка', subcategory: 'Ниши щита' }, 'Ниша под корпус щита'));
    if (sWall !== 'Накладной') w.push(work(`Штроба 100×50, под трассу кабелей (${sWall})`, 2, appLogic.shieldInputGroovePrice || 1500, ['штроба', '100x50', sWall, 'трасса', 'кабелей'], { unit: 'м.п.', category: 'Штробление и резка', subcategory: 'Штроба 100×50 под трассу кабелей' }, 'Штроба под ввод/трассу кабелей'));
    w.push(work('Сборка щита', totalModules, appLogic.priceShield || 500, ['сборка', 'щит'], { unit: 'мод.', category: 'Щитовое', subcategory: 'Сборка щита' }, 'Сборка модульного щита'));
    w.push(work('Установка щита', 1, appLogic.shieldInstallPrice || 2500, ['установка', 'щит'], { unit: 'шт', category: 'Щитовое', subcategory: 'Монтаж щита' }, 'Монтаж корпуса щита'));
    w.push(work('Подключение вводного кабеля', 1, appLogic.shieldInputConnectPrice || 1500, ['подключение', 'вводного', 'кабеля'], { unit: 'шт', category: 'Щитовое', subcategory: 'Монтаж щита' }, 'Подключение ввода'));
    w.push(work('Прозвонка / проверка линий', lines.length, appLogic.shieldTestLinePrice || 150, ['прозвонка', 'проверка', 'линий'], { unit: 'линия', category: 'Щитовое', subcategory: 'Проверка линий' }, 'Проверка каждой линии'));
    w.push(work('Маркировка линий', lines.length, appLogic.shieldMarkLinePrice || 100, ['маркировка', 'линий'], { unit: 'линия', category: 'Щитовое', subcategory: 'Маркировка линий' }, 'Маркировка каждой линии'));
    if (epGetCheck('cfg-scheme')) w.push(work('Составление однолинейной схемы щита', 1, appLogic.shieldSchemePrice || 4000, ['однолинейная', 'схема', 'щит'], { unit: 'шт', category: 'Щитовое', subcategory: 'Документация' }, 'Однолинейная схема'));
    const info = [
        { n: `ℹ️ Щит: занято ${totalModules} мод.; корпус ${boxSize}М; свободно ${Math.max(0, boxSize - totalModules)} мод.`, q: 1, p: 0, type: 'work', tag: 'shield_info' },
        { n: `ℹ️ Защита: ${protectionType}; автоматы тип ${curve}; УЗО/ДИФ тип ${rcdType}; влажные зоны 10мА`, q: 1, p: 0, type: 'work', tag: 'shield_info' },
        { n: `ℹ️ Гребёнки: 1P ${comb1P}×25см; 2P ${comb2P}×25см; N-шинок ${twoPoleProtectionCount}; PE-шина ${appLogic.shieldPeBusContacts || 26} контактов`, q: 1, p: 0, type: 'work', tag: 'shield_info' }
    ];
    warnings.forEach(x => info.push({ n: `⚠️ ${x}`, q: 1, p: 0, type: 'work', tag: 'shield_info' }));
    addAuto(m.concat(w).concat(info), 'shield');
    currentShieldExtras = [];
    closeModal('configModal');
    showToast('✅ Щит сгенерирован V15');
}





/* =========================================================
 * ACCOUNTING FUNCTION: mat
 * ========================================================= */
function mat(label, q, price, words, meta, assignment) {
        meta = Object.assign({}, meta || {}, { brand: bAuto });
        if (assignment) meta.assignment = assignment;
        const it = epMat(label, q, price, words, meta);
        if (assignment) { it.epAssignment = assignment; it.epAssignments = [assignment]; it.epMergedDetails = [assignment]; }
        return it;
    }
    


/* =========================================================
 * ACCOUNTING FUNCTION: work
 * ========================================================= */
function work(label, q, price, words, meta, assignment) {
        meta = Object.assign({}, meta || {});
        if (assignment) meta.assignment = assignment;
        const it = epWork(label, q, price, words, meta);
        if (assignment) { it.epAssignment = assignment; it.epAssignments = [assignment]; it.epMergedDetails = [assignment]; }
        return it;
    }

    


/* =========================================================
 * ACCOUNTING FUNCTION: runAiCheck
 * ========================================================= */
async function runAiCheck() { 
    if(!GEMINI_API_KEY) return showToast("❌ Нужен ключ ИИ в настройках");
    showLoader("ИИ анализирует...", "🤖");
    try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`;
        const estNames = currentEstimate.map(i => i.n).join(", ");
        const promptText = `Я электрик. Смета: ${estNames}. Найди логические ошибки (забыл крепеж, рамки, УЗО). Верни ТОЛЬКО JSON массив: [{"reason": "Объяснение", "suggestedName": "Название из стандартных материалов"}]. Если всё идеально, верни пустой массив [].`;
        const payload = { contents: [{ parts: [{text: promptText }] }] };
        const response = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
        const data = await response.json(); hideLoader();
        if(data.error) throw new Error(data.error.message);
        let aiText = data.candidates[0].content.parts[0].text.replace(/```[a-z]*\n?/g, '').replace(/```/g, '').trim();
        const suggestions = JSON.parse(aiText);
        if (suggestions.length === 0) return showToast("✨ Всё идеально! Смета полная.");
        document.getElementById('ai-modal-title').innerText = "✨ ИИ-Аналитика";
        document.getElementById('ai-suggestions').innerHTML = suggestions.map(s => `<div style="background:var(--bg); padding: 12px; border-radius: 10px; margin-bottom:10px; border-left:4px solid var(--ai);"><div style="font-size: 12px; font-weight:bold; margin-bottom:8px;">${s.reason}</div><div style="display:flex; justify-content:space-between; align-items:center;"><span style="font-size:13px; color:var(--primary); font-weight:bold;">${s.suggestedName}</span><button onclick="addAuto([{n:'${s.suggestedName}', q:1, p:0, type:'mat'}], 'ai_add'); closeModal('aiModal');" style="background:var(--ai); padding:6px 12px; font-size:11px; color:white; border:none; border-radius:6px; width:auto; margin:0;">+ Добавить</button></div></div>`).join("");
        openModal('aiModal');
    } catch(e) { hideLoader(); showToast("❌ Сбой ИИ: Проверьте ключ"); }
}




/* =========================================================
 * ACCOUNTING FUNCTION: aiSupply
 * ========================================================= */
async function aiSupply() {
    if(!GEMINI_API_KEY) return showToast("❌ Нужен ключ ИИ");
    showLoader("ИИ формирует закупку...", "🤖");
    try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`;
        const mats = currentEstimate.filter(i=>i.type==='mat').map(i=>`${i.n} - ${i.q}`).join(", ");
        const promptText = `Смета материалов: ${mats}. Раздели их на логичные категории для удобной закупки в магазине (Кабели, Автоматика, Черновые и т.д.). Выведи в чистом HTML формате (используй <h3>, <ul>, <li>, <b>).`;
        const payload = { contents: [{ parts: [{text: promptText }] }] };
        const response = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
        const data = await response.json(); hideLoader();
        let aiText = data.candidates[0].content.parts[0].text.replace(/```[a-z]*\n?/g, '').replace(/```/g, '').trim();
        document.getElementById('ai-modal-title').innerText = "📦 ИИ-Снабженец";
        document.getElementById('ai-suggestions').innerHTML = `<div style="font-size:13px; line-height:1.5;">${aiText}</div>`;
        openModal('aiModal');
    } catch(e) { hideLoader(); showToast("❌ Сбой ИИ"); }
}




/* =========================================================
 * ACCOUNTING FUNCTION: aiPueHelper
 * ========================================================= */
async function aiPueHelper() { 
    if(!GEMINI_API_KEY) return showToast("❌ Нужен ключ ИИ");
    showLoader("ИИ думает...", "🤖");
    try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`;
        const promptText = `Смета: ${currentEstimate.map(i=>i.n).join(", ")}. Какие нормы ПУЭ нужны? Напиши кратко в HTML (без markdown, используй теги <p>, <ul>, <b>).`;
        const payload = { contents: [{ parts: [{text: promptText }] }] };
        const response = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
        const data = await response.json(); hideLoader();
        let aiText = data.candidates[0].content.parts[0].text.replace(/```[a-z]*\n?/g, '').replace(/```/g, '').trim();
        document.getElementById('ai-modal-title').innerText = "📚 ПУЭ Справка";
        document.getElementById('ai-suggestions').innerHTML = `<div style="font-size:13px; line-height:1.5;">${aiText}</div>`;
        openModal('aiModal');
    } catch(e) { hideLoader(); showToast("❌ Сбой ИИ"); }
}




/* =========================================================
 * ACCOUNTING FUNCTION: compareShopsAI
 * ========================================================= */
async function compareShopsAI() {
    if(!GEMINI_API_KEY) return showToast("❌ Нужен ключ ИИ");
    showLoader("Сравнение цен...", "🤖");
    try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`;
        let shops = document.getElementById('ai-shops').value || "Лемана ПРО, Петрович";
        const promptText = `Материалы: ${currentEstimate.filter(i=>i.type==='mat').map(i=>i.n).join(", ")}. Создай HTML таблицу (class="pdf-table") с МАКСИМАЛЬНЫМИ (самыми высокими) розничными ценами ГОСТ в магазинах: ${shops}. Верни только HTML.`;
        const payload = { contents: [{ parts: [{text: promptText }] }] };
        const response = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
        const data = await response.json(); hideLoader();
        let aiText = data.candidates[0].content.parts[0].text.replace(/```[a-z]*\n?/g, '').replace(/```/g, '').trim();
        document.getElementById('ai-modal-title').innerText = "🛒 Макс. Цены ГОСТ";
        document.getElementById('ai-suggestions').innerHTML = `<div style="overflow-x:auto;">${aiText}</div>`;
        openModal('aiModal');
    } catch(e) { hideLoader(); showToast("❌ Сбой ИИ"); }
}




/* =========================================================
 * ACCOUNTING FUNCTION: showPreview
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
 * ACCOUNTING FUNCTION: togglePay
 * ========================================================= */
function togglePay(field) {
    let obj = hDB.find(x => x.id === currentCardId);
    if(obj) {
        if(!obj.payments) obj.payments = {};
        obj.payments[field] = document.getElementById('pay-' + field).checked;
        safeSet('h_v31', JSON.stringify(hDB));
        if(db) db.collection('history').doc(String(obj.id)).update({ payments: obj.payments }).catch(()=>{});
    }
}



/* =========================================================
 * ACCOUNTING FUNCTION: updatePayPrepay
 * ========================================================= */
function updatePayPrepay(val) {
    let obj = hDB.find(x => x.id === currentCardId);
    if(obj) {
        if(!obj.payments) obj.payments = {};
        obj.payments.prepay = Number(val) || 0;
        safeSet('h_v31', JSON.stringify(hDB));
        if(db) db.collection('history').doc(String(obj.id)).update({ payments: obj.payments }).catch(()=>{});
    }
}




/* =========================================================
 * ACCOUNTING FUNCTION: saveLogic
 * ========================================================= */
function saveLogic() { 
    appLogic.priceSoc = Number(document.getElementById('logic-price-soc').value) || 500;
    appLogic.priceShield = Number(document.getElementById('logic-price-shield').value) || 500;
    appLogic.priceDrill = Number(document.getElementById('logic-price-drill').value) || 600;
    appLogic.priceShtroba = Number(document.getElementById('logic-price-shtroba').value) || 550;
    appLogic.priceCabCeil = Number(document.getElementById('logic-price-cab-ceil').value) || 120;

    appLogic.shieldInstallPrice = Number(document.getElementById('logic-shield-install').value) || 2500;
    appLogic.shieldInputConnectPrice = Number(document.getElementById('logic-shield-input-connect').value) || 1500;
    appLogic.shieldTestLinePrice = Number(document.getElementById('logic-shield-test-line').value) || 150;
    appLogic.shieldMarkLinePrice = Number(document.getElementById('logic-shield-mark-line').value) || 100;
    appLogic.shieldSchemePrice = Number(document.getElementById('logic-shield-scheme').value) || 4000;
    appLogic.shieldNichePerModule = Number(document.getElementById('logic-shield-niche-module').value) || 400;
    appLogic.shieldInputGroovePrice = Number(document.getElementById('logic-shield-input-groove').value) || 1500;
    
    appLogic.socketsPerJb = Number(document.getElementById('logic-soc-jb').value) || 3;
    appLogic.connPerSocJb = Number(document.getElementById('logic-conn-soc').value) || 3;
    appLogic.connPerSwJb = Number(document.getElementById('logic-conn-sw').value) || 3;
    appLogic.connPerPassJb = Number(document.getElementById('logic-conn-pass').value) || 4;

    safeSet('appLogic_v31', JSON.stringify(appLogic));
    showToast('Логика сохранена!'); closeModal('logicModal'); 
}



/* =========================================================
 * ACCOUNTING FUNCTION: renderLogicUI
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
 * ACCOUNTING FUNCTION: doRecalculate
 * ========================================================= */
function doRecalculate() {
    let ceilCab = Number(document.getElementById('r-ceil-input').value) || 0; let floorCab = Math.max(0, globalRecalcCab - ceilCab - globalRecalcSht);
    const rmList = ["Гофра ПВХ", "Лента монтажная", "Площадка под стяжку", "Стяжки нейлоновые", "Стяжка нейлоновая", "Прокладка кабеля", "Клипса в штробу", "Газовый баллон", "Гвозди для прямого", "Смесь штукатурная", "Амортизация: Коронка алмазная"];
    currentEstimate = currentEstimate.filter(it => !rmList.some(rm => it.n.includes(rm))); let m=[], w=[];
    let calcFloorCab = Math.ceil(floorCab * 1.1); let calcCeilCab = Math.ceil(ceilCab * 1.1); let calcGofra = Math.ceil(calcFloorCab * 1.05);
    let boxesCount = 0; currentEstimate.forEach(it => { if(it.n.toLowerCase().includes('подрозетн') && it.type === 'work') boxesCount += Number(it.q); });
    let mixKg = Math.ceil(boxesCount * 0.3); if(mixKg > 0) m.push({ n: "Смесь штукатурная/алебастр (кг)", q: mixKg, p: 40, type: 'mat' });
    let crowns = Math.ceil(boxesCount / 80); if(crowns > 0) m.push({ n: "Амортизация: Коронка алмазная", q: crowns, p: 3500, type: 'mat' });

    if (calcFloorCab > 0) { 
        m.push({ n: "Гофра ПВХ/ПНД с протяжкой", q: calcGofra, p: 25, type: 'mat' }); m.push({ n: "Лента монтажная (перфолента)", q: Math.ceil(calcFloorCab * 0.0033), p: 580, type: 'mat' }); w.push({ n: "Прокладка кабеля в гофре (пол)", q: calcFloorCab, p: appLogic.priceCabCeil || 150, type: 'work' }); 
    }
    if (calcCeilCab > 0) {
        let totalBases = Math.ceil(calcCeilCab * 3); let basePacks = Math.ceil(totalBases / 100);
        if(basePacks > 0) { m.push({ n: `Площадка под стяжку (уп. 100шт)`, q: basePacks, p: 500, type: 'mat' }); m.push({ n: `Стяжка нейлоновая 400х5 (уп. 100шт)`, q: basePacks, p: 350, type: 'mat' }); }
        let nailPacks = Math.floor((totalBases + 700) / 1000); if(totalBases > 0 && nailPacks < 1) nailPacks = 1; m.push({ n: "Гвозди для прямого монтажа 3х19 мм (1000 шт)", q: nailPacks, p: 1905, type: 'mat' });
        let gas = Math.ceil(totalBases / 1100); if(totalBases > 0 && gas < 1) gas = 1; m.push({ n: "Газовый баллон 80 мл 165 мм", q: gas, p: 550, type: 'mat' }); w.push({ n: "Прокладка кабеля (без гофры)", q: calcCeilCab, p: appLogic.priceCabCeil || 120, type: 'work' });
    }
    if (globalRecalcSht > 0) { let clipsPacks = Math.ceil((globalRecalcSht * 3) / 100); if(clipsPacks > 0) m.push({ n: `Клипса в штробу (уп. 100шт)`, q: clipsPacks, p: 250, type: 'mat' }); }
    
    addAuto(m, 'recalc_m'); addAuto(w, 'recalc_w'); closeModal('recalcModal'); showToast("✅ Трассы пересчитаны!");
}




/* =========================================================
 * ACCOUNTING FUNCTION: updateBuhUI
 * ========================================================= */
function updateBuhUI() {
    let sumW = 0, sumM = 0, matBase = 0, workBase = 0;
    currentEstimate.forEach(it => { let price = fPrice(it); if(it.type==='work') { sumW += price * it.q; workBase += (it.p||0) * it.q; } else { sumM += price * it.q; matBase += (it.p||0) * it.q; } });
    let disc = Number(document.getElementById('b-discount').value) || 0, prep = Number(document.getElementById('b-prepay').value) || 0;
    document.getElementById('b-work').innerText = sumW + ' P'; document.getElementById('b-mat').innerText = sumM + ' P'; 
    document.getElementById('p-total').innerText = (workBase + (sumM - matBase)) + ' P'; 
    document.getElementById('b-final').innerText = (sumW + sumM - disc - prep) + ' P';
}




/* =========================================================
 * ACCOUNTING FUNCTION: saveHist
 * ========================================================= */
async function saveHist() {
    const finalTotal = parseInt(document.getElementById('b-final').innerText) || 0;
    let act = { id: Date.now(), name: cust.name, phone: cust.phone, addr: cust.addr, total: finalTotal, date: new Date().toLocaleDateString(), estimate: JSON.parse(JSON.stringify(currentEstimate)), masterName: appUser.name, masterUid: appUser.uid, payments: { mat: false, cut: false, rough: false, fine: false, extra: false, prepay: Number(document.getElementById('b-prepay').value) || 0 } };
    hDB.push(act); safeSet('h_v31', JSON.stringify(hDB)); updateHistList(); renderChart();
    try { if(db) { await db.collection('history').doc(String(act.id)).set(act); await db.collection('drafts').doc(appUser.uid).delete(); currentEstimate = []; renderMainTable(); } } catch(e){}
    showToast("✅ Объект сохранен в Облако!"); closeModal('buhModal');
}




/* =========================================================
 * ACCOUNTING FUNCTION: updateHistList
 * ========================================================= */
function updateHistList() {
    let viewHDB = appUser.role === 'admin' ? hDB : hDB.filter(h => h.masterUid === appUser.uid);
    document.getElementById('h-stat').innerHTML = viewHDB.map((h, i) => `<div style="background:rgba(255,255,255,0.6); padding:10px; border-radius:10px; border:1px solid var(--border); margin-bottom:8px; cursor:pointer;" onclick="openObjCard(${h.id})"><div style="display:flex; justify-content:space-between; margin-bottom:6px;"><b style="color:var(--text); font-size:13px;">${h.name || 'Без имени'}</b><b style="color:var(--primary);">${h.total} P</b></div><div style="font-size:10px; color:var(--gray);">Дата: ${h.date} ${appUser.role === 'admin' ? `<br><span style="color:var(--orange);">Мастер: ${h.masterName}</span>` : ''}</div></div>`).join("");
}




/* =========================================================
 * ACCOUNTING FUNCTION: openObjCard
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
 * ACCOUNTING FUNCTION: addExtraWork
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
 * ACCOUNTING FUNCTION: renderDbEditors
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
 * ACCOUNTING FUNCTION: addDbItem
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
 * ACCOUNTING FUNCTION: requestPriceChange
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
 * ACCOUNTING FUNCTION: openAdminDraftView
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
 * ACCOUNTING FUNCTION: epMoney
 * ========================================================= */
function epMoney(v) {
        const n = Number(String(v || '').replace(',', '.').replace(/[^\d.]/g, ''));
        return Number.isFinite(n) ? n : 0;
    }

    


/* =========================================================
 * ACCOUNTING FUNCTION: epPatchSettingsUI
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
 * ACCOUNTING FUNCTION: epParseLooseTableText
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
 * ACCOUNTING FUNCTION: epInferSubcategory
 * ========================================================= */
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

    


/* =========================================================
 * ACCOUNTING FUNCTION: epNormalizeItems
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
 * ACCOUNTING FUNCTION: epExtractItemsFromSheetRows
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
 * ACCOUNTING FUNCTION: epAiNormalizeImage
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
 * ACCOUNTING FUNCTION: epShowDbReview
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
 * ACCOUNTING FUNCTION: epGetReviewedSelected
 * ========================================================= */
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

    


/* =========================================================
 * ACCOUNTING FUNCTION: epInsertAdminProposalBox
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
 * ACCOUNTING FUNCTION: epRenderGroupedList
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
 * ACCOUNTING FUNCTION: epEnsureProposalBox
 * ========================================================= */
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
    


/* =========================================================
 * ACCOUNTING FUNCTION: epRenderProposalList
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
 * ACCOUNTING FUNCTION: epMatGroupName
 * ========================================================= */
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

  


/* =========================================================
 * ACCOUNTING FUNCTION: epRenderGrouped
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
 * ACCOUNTING FUNCTION: autoPrice
 * ========================================================= */
function autoPrice(){ return bAuto === 'ABB' ? 350 : 155; }
      


/* =========================================================
 * ACCOUNTING FUNCTION: difPrice
 * ========================================================= */
function difPrice(){ return bAuto === 'ABB' ? 4500 : 3600; }
      


/* =========================================================
 * ACCOUNTING FUNCTION: normalizeMaterialDb
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
 * ACCOUNTING FUNCTION: normalizeDbItem
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
 * ACCOUNTING FUNCTION: renderList
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
 * ACCOUNTING FUNCTION: toolbar
 * ========================================================= */
function toolbar(type){
    var title = type === 'mat' ? 'Материалы' : 'Работы';
    return '<div style="border:1px solid var(--border);border-radius:14px;padding:10px;margin:10px 0;background:rgba(239,68,68,.05);">' +
      '<div style="font-weight:900;color:var(--danger);margin-bottom:6px;">🗑 Удаление позиций: '+title+'</div>' +
      '<div style="font-size:11px;color:var(--gray);margin-bottom:8px;">Удаляет/скрывает только у мастера. База сервера не трогается.</div>' +
      '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:8px;">' +
      '<button class="btn-info" style="margin:0;padding:10px;" onclick="epHardSelectDelete(\''+type+'\', true)">✅ Выделить все</button>' +
      '<button class="btn-vendor" style="margin:0;padding:10px;" onclick="epHardSelectDelete(\''+type+'\', false)">⬜ Убрать галочки</button>' +
      '</div>' +
      '<button class="btn-danger" style="width:100%;margin:0;padding:12px;" onclick="epHardDeleteSelected(\''+type+'\')">Удалить выбранные у мастера</button>' +
      '</div>';
  }
  


/* =========================================================
 * ACCOUNTING FUNCTION: renderItems
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
 * ACCOUNTING FUNCTION: deleteToolbar
 * ========================================================= */
function deleteToolbar(type){
    var title = type === 'mat' ? 'Материалы' : 'Работы';
    return '<div style="border:1px solid var(--border);border-radius:14px;padding:10px;margin:10px 0;background:rgba(239,68,68,.05);">' +
      '<div style="font-weight:900;color:var(--danger);margin-bottom:6px;">🗑 Удаление позиций: '+title+'</div>' +
      '<div style="font-size:11px;color:var(--gray);margin-bottom:8px;">Удаляет/скрывает только у мастера. База сервера не трогается.</div>' +
      '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:8px;">' +
      '<button class="btn-info" style="margin:0;padding:10px;" onclick="epUltimateSelectDelete(\''+type+'\', true)">✅ Выделить все</button>' +
      '<button class="btn-vendor" style="margin:0;padding:10px;" onclick="epUltimateSelectDelete(\''+type+'\', false)">⬜ Убрать галочки</button>' +
      '</div>' +
      '<button class="btn-danger" style="width:100%;margin:0;padding:12px;" onclick="epUltimateDeleteSelected(\''+type+'\')">Удалить выбранные у мастера</button>' +
      '</div>';
  }

  


/* =========================================================
 * ACCOUNTING FUNCTION: esc
 * ========================================================= */
function esc(s){ return String(s == null ? '' : s).replace(/[&<>"']/g,function(m){ return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]; }); }
  function cleanText(s){ return String(s || '').toLowerCase().replace(/ё/g,'е').replace(/×/g,'x').replace(/х/g,'x').replace(/[^a-zа-я0-9]+/g,' ').trim(); }
  function clone(x){ var y=Object.assign({}, x || {}); delete y.__src; delete y.__encoded; return y; }
  function arrLS(k){ try{ var a=JSON.parse(localStorage.getItem(k)||'[]'); return Array.isArray(a)?a:[]; }catch(e){ return []; } }
  function objLS(k){ try{ var o=JSON.parse(localStorage.getItem(k)||'{}'); return o && typeof o === 'object' ? o : {}; }catch(e){ return {}; } }
  function setLS(k,a){ try{ if(typeof safeSet==='function') safeSet(k, JSON.stringify(a||[])); else localStorage.setItem(k, JSON.stringify(a||[])); }catch(e){} }
  function setObjLS(k,o){ try{ localStorage.setItem(k, JSON.stringify(o||{})); }catch(e){} }
  function cleanMode(){ return localStorage.getItem(LS_CLEAN) === '1'; }
  function scope(){ return localStorage.getItem(LS_SCOPE) === 'global' ? 'global' : 'my'; }
  function activeLabel(){ return scope()==='global' ? '🌍 База сервера' : '👤 Моя база'; }
  function uid(){ try{ return appUser && appUser.uid ? appUser.uid : ''; }catch(e){ return ''; } }
  function isAdmin(){ try{ return appUser && appUser.role === 'admin'; }catch(e){ return false; } }
  function groupOf(it){ return (it && (it.g || it.sc || it.subcategory || it.group)) || ''; }
  function sig(type,it){ return type + '|' + cleanText([it && it.c, groupOf(it), it && it.n, it && it.u].filter(Boolean).join('|')); }
  function enc(it){ try{ return encodeURIComponent(JSON.stringify(clone(it))); }catch(e){ return ''; } }
  function dec(v){ try{ return JSON.parse(decodeURIComponent(v || '{}')); }catch(e){ return null; } }

  function unique(arr,type){
    var seen={}, out=[];
    (arr||[]).forEach(function(raw){
      var it=clone(raw);
      if(!it.n) return;
      var k=sig(type,it);
      if(seen[k]) return;
      seen[k]=1;
      out.push(it);
    });
    return out;
  }

  function myArr(type){ return type==='work' ? EP_MY_WORK : EP_MY_MAT; }
  function serverArr(type){ return type==='work' ? EP_SERVER_WORK : EP_SERVER_MAT; }
  function activeArr(type){ return scope()==='global' ? serverArr(type) : myArr(type); }

  function syncWindowCaches(){
    try{
      window.EP_MY_MAT = EP_MY_MAT;
      window.EP_MY_WORK = EP_MY_WORK;
      window.EP_GLOBAL_MAT = EP_SERVER_MAT;
      window.EP_GLOBAL_WORK = EP_SERVER_WORK;
      window.EP_FORCE_GLOBAL = {matDB:EP_SERVER_MAT, workDB:EP_SERVER_WORK};
      window.EP_ULTIMATE_DB_CACHE = {matDB:EP_SERVER_MAT, workDB:EP_SERVER_WORK, ts:Date.now()};
      window.EP_GLOBAL_DB_VISIBLE_CACHE = {matDB:EP_SERVER_MAT, workDB:EP_SERVER_WORK, ts:Date.now()};
      window.userMatDB = EP_MY_MAT;
      window.userWorkDB = EP_MY_WORK;
      if(scope()==='global'){ matDB = EP_SERVER_MAT.slice(); workDB = EP_SERVER_WORK.slice(); }
      else { matDB = EP_MY_MAT.slice(); workDB = EP_MY_WORK.slice(); }
    }catch(e){}
  }

  function saveMyLocal(type, arr){
    arr = unique(arr||[], type);
    if(type==='work') EP_MY_WORK = arr; else EP_MY_MAT = arr;
    setLS(LS_MY_MAT, EP_MY_MAT);
    setLS(LS_MY_WORK, EP_MY_WORK);
    try{ localStorage.setItem(LS_MASTER_CREATED,'1'); }catch(e){}
    syncWindowCaches();
    epSaveMyDbToServer();
  }

  function saveServerLocal(type, arr, saveDirect){
    arr = unique(arr||[], type);
    if(type==='work') EP_SERVER_WORK = arr; else EP_SERVER_MAT = arr;
    setObjLS(LS_SERVER_CACHE, {matDB:EP_SERVER_MAT, workDB:EP_SERVER_WORK, cleanMode:cleanMode(), ts:Date.now()});
    syncWindowCaches();
    if(saveDirect) epSaveServerDbToServer();
  }

  function setActiveDb(type, arr){
    if(scope()==='global') saveServerLocal(type, arr, isAdmin());
    else saveMyLocal(type, arr);
  }

  function upsert(arr,type,it){
    it = clone(it);
    if(!it.id) it.id = (type==='work'?'w':'m') + '_local_' + Date.now() + '_' + Math.random().toString(36).slice(2,7);
    var k=sig(type,it);
    var idx=(arr||[]).findIndex(function(x){ return sig(type,x)===k || (it.id && String(x.id||'')===String(it.id)); });
    if(idx>=0) arr[idx]=Object.assign({}, arr[idx], it, {id:arr[idx].id || it.id});
    else arr.push(it);
    return arr;
  }

  async function epSaveMyDbToServer(){
    try{
      if(typeof db !== 'undefined' && db && uid()){
        await db.collection('user_db').doc(uid()).set({
          uid: uid(),
          masterName: (appUser && (appUser.name || appUser.email)) || '',
          matDB: EP_MY_MAT,
          workDB: EP_MY_WORK,
          created: true,
          updatedAt: new Date().toISOString()
        }, {merge:true});
      }
    }catch(e){ console.warn('save my db failed', e); }
  }

  async function epSaveServerDbToServer(){
    try{
      if(typeof db !== 'undefined' && db && isAdmin()){
        await db.collection('settings').doc('global_db').set({
          matDB: EP_SERVER_MAT,
          workDB: EP_SERVER_WORK,
          cleanMode: cleanMode(),
          updatedAt: new Date().toISOString()
        }, {merge:true});
      }
    }catch(e){ console.warn('save server db failed', e); }
  }

  async function epSendServerProposal(type,items,action){
    try{
      if(typeof db !== 'undefined' && db){
        await db.collection('db_proposals').add({
          uid: uid() || '',
          masterName: (appUser && (appUser.name || appUser.email)) || '',
          type: type,
          action: action,
          items: Array.isArray(items) ? items.map(clone) : items,
          target: 'server_db',
          status: 'pending',
          createdAt: new Date().toISOString()
        });
      }
    }catch(e){ console.warn('server proposal failed', e); }
  }

  async function epLoadDbFromServer(){
    EP_MY_MAT = arrLS(LS_MY_MAT);
    EP_MY_WORK = arrLS(LS_MY_WORK);
    var cache = objLS(LS_SERVER_CACHE);
    if(!Array.isArray(cache.matDB) && !Array.isArray(cache.workDB)) cache = objLS(LS_OLD_SERVER_CACHE);
    if(Array.isArray(cache.matDB)) EP_SERVER_MAT = cache.matDB;
    if(Array.isArray(cache.workDB)) EP_SERVER_WORK = cache.workDB;
    if(cache.cleanMode) try{ localStorage.setItem(LS_CLEAN,'1'); }catch(e){}

    try{
      if(typeof db !== 'undefined' && db){
        var gdoc = await db.collection('settings').doc('global_db').get();
        if(gdoc.exists){
          EP_SERVER_DOC_SEEN = true;
          var gd = gdoc.data() || {};
          EP_SERVER_MAT = Array.isArray(gd.matDB) ? gd.matDB : [];
          EP_SERVER_WORK = Array.isArray(gd.workDB) ? gd.workDB : [];
          if(gd.cleanMode || gd.resetAt) try{ localStorage.setItem(LS_CLEAN,'1'); }catch(e){}
          setObjLS(LS_SERVER_CACHE, {matDB:EP_SERVER_MAT, workDB:EP_SERVER_WORK, cleanMode:cleanMode(), ts:Date.now()});
        } else if(isAdmin() && !cleanMode()) {
          EP_SERVER_DOC_SEEN = false;
          await db.collection('settings').doc('global_db').set({matDB:EP_SERVER_MAT, workDB:EP_SERVER_WORK, createdAt:new Date().toISOString()}, {merge:true});
        }

        if(uid()){
          var udoc = await db.collection('user_db').doc(uid()).get();
          if(udoc.exists){
            var ud = udoc.data() || {};
            EP_MY_MAT = Array.isArray(ud.matDB) ? ud.matDB : EP_MY_MAT;
            EP_MY_WORK = Array.isArray(ud.workDB) ? ud.workDB : EP_MY_WORK;
            setLS(LS_MY_MAT, EP_MY_MAT);
            setLS(LS_MY_WORK, EP_MY_WORK);
            try{ localStorage.setItem(LS_MASTER_CREATED,'1'); }catch(e){}
          }
        }
      }
    }catch(e){ console.warn('load db failed', e); }

    var hasCache = Array.isArray(cache.matDB) || Array.isArray(cache.workDB);
    if(!cleanMode() && !EP_SERVER_DOC_SEEN && !hasCache){
      EP_SERVER_MAT = TOP_MAT_DB.slice();
      EP_SERVER_WORK = TOP_WORK_DB.slice();
    }

    EP_MY_MAT = unique(EP_MY_MAT, 'mat');
    EP_MY_WORK = unique(EP_MY_WORK, 'work');
    EP_SERVER_MAT = unique(EP_SERVER_MAT, 'mat');
    EP_SERVER_WORK = unique(EP_SERVER_WORK, 'work');
    syncWindowCaches();
    epRefreshDbScopeUi();
  }

  function sourceSwitcherHtml(type){
    return '<div style="border:1px solid var(--primary);border-radius:14px;padding:10px;margin:0 0 12px;background:rgba(79,70,229,.06);">'+
      '<div style="font-weight:900;color:var(--primary);margin-bottom:6px;">Источник: '+(type==='work'?'Работы':'Материалы')+'</div>'+
      '<div style="font-size:11px;color:var(--gray);margin-bottom:8px;">В смету и каталог попадает только выбранный источник. Вперемешку не считаем.</div>'+
      '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;">'+
        '<button class="'+(scope()==='my'?'btn-success':'btn-info')+'" style="margin:0;padding:10px;" onclick="epSetDbScope(&quot;my&quot;); '+(type==='work'?'openWorkCatalog()':'openMatCatalog()')+'">👤 Моя база</button>'+
        '<button class="'+(scope()==='global'?'btn-success':'btn-info')+'" style="margin:0;padding:10px;" onclick="epSetDbScope(&quot;global&quot;); '+(type==='work'?'openWorkCatalog()':'openMatCatalog()')+'">🌍 База сервера</button>'+
      '</div>'+
    '</div>';
  }

  window.epDbToggle = function(id,e){ if(e) e.stopPropagation(); var el=$(id); if(el) el.classList.toggle('active'); };

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

  function catalogRow(type,it){
    var item=enc(it);
    var sub=(groupOf(it)?groupOf(it)+' • ':'')+(Number(it.p)||0)+' ₽ / '+(it.u||'шт');
    var copyBtn = scope()==='global' ? '<button class="btn-info" style="width:auto;margin:0 0 0 6px;padding:8px;" data-type="'+type+'" data-item="'+esc(item)+'" onclick="epCopyOneServerToMy(this.dataset.type,this.dataset.item)">В мою</button>' : '';
    return '<div class="mat-item"><div style="flex:1;font-size:12px;font-weight:600;"><b>'+esc(it.n||'Позиция')+'</b><br><span style="color:var(--gray);font-size:11px;font-weight:normal;">'+esc(sub)+'</span></div><button class="mat-add-btn" style="'+(type==='work'?'background:var(--orange);':'')+'" data-item="'+esc(item)+'" data-type="'+type+'" onclick="promptAdd(this.dataset.item,this.dataset.type)">+ Добавить</button>'+copyBtn+'</div>';
  }

  window.openMatCatalog = function(){ syncWindowCaches(); var x=$('mat-cat-list'); if(x) x.innerHTML=renderCatalog('mat'); if(typeof openModal==='function') openModal('matCatModal'); };
  window.openWorkCatalog = function(){ syncWindowCaches(); var x=$('work-cat-list'); if(x) x.innerHTML=renderCatalog('work'); if(typeof openModal==='function') openModal('workModal'); };

  window.promptAdd = function(v,type){
    var it=dec(v);
    if(!it || !it.n) it=activeArr(type).find(function(x){return String(x.id||'')===String(v);});
    if(!it) return toast('Позиция не найдена');
    pendingAdd={item:clone(it), type:type};
    var n=$('qty-prompt-name'), q=$('qty-input');
    if(n) n.innerText=it.n||'Позиция';
    if(q) q.value=1;
    if(typeof openModal==='function') openModal('qtyPromptModal');
  };

  function editorTop(type){
    var title=type==='work'?'работ':'материалов';
    var s=scope(), admin=isAdmin(), editable=canEditActive();
    var hint=s==='my'?'Редактируется личная база мастера.':(admin?'Редактируется база сервера.':'Сервер открыт только для просмотра и копирования в мою базу.');
    var html='<div style="border:1px solid var(--primary);border-radius:14px;padding:10px;margin:0 0 12px;background:rgba(79,70,229,.05);">'+
      '<div style="font-weight:900;color:var(--primary);">'+label()+' — '+title+'</div>'+
      '<div style="font-size:11px;color:var(--gray);font-weight:800;margin-top:4px;">'+hint+' Позиций: '+active(type).length+'.</div>'+
      '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:8px;">'+
      '<button class="'+(s==='my'?'btn-success':'btn-info')+'" style="margin:0;padding:10px;" onclick="epSetDbScope(\'my\')">👤 Моя база</button>'+
      '<button class="'+(s==='global'?'btn-success':'btn-info')+'" style="margin:0;padding:10px;" onclick="epSetDbScope(\'global\')">🌍 База сервера</button></div>';
    if(editable){
      html+='<div style="border:1px dashed var(--border);border-radius:12px;padding:8px;margin-top:8px;background:rgba(255,255,255,.35);">'+
        '<div style="font-weight:900;color:var(--primary);font-size:12px;margin-bottom:6px;">Массовые действия: выделить → перенести / удалить</div>'+
        '<input id="ep-v15-move-cat-'+type+'" placeholder="Категория, куда перенести" style="margin-bottom:6px;">'+
        '<input id="ep-v15-move-sub-'+type+'" placeholder="Группа / подкатегория" style="margin-bottom:8px;">'+
        '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;">'+
        '<button class="btn-info" style="margin:0;padding:9px;" onclick="epV15SelectVisible(\''+type+'\',true)">✅ Выделить</button>'+
        '<button class="btn-vendor" style="margin:0;padding:9px;" onclick="epV15SelectVisible(\''+type+'\',false)">⬜ Снять</button>'+
        '<button class="btn-success" style="margin:0;padding:9px;" onclick="epV15MoveSelectedActive(\''+type+'\')">📦 Перенести</button>'+
        '<button class="btn-danger" style="margin:0;padding:9px;" onclick="epDeleteSelectedActiveV7()">🗑 Удалить выбранные</button></div></div>'+
        '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:8px;"><button class="btn-success" style="margin:0;padding:9px;" onclick="epSaveActiveDbV7()">💾 Сохранить</button><button class="btn-info" style="margin:0;padding:9px;" onclick="epReloadActiveDbV7()">🔄 Обновить</button></div>';
    }
    if(s==='global'&&!admin){ html+='<div class="ep-v7-note">Серверные цены и позиции мастер не меняет. Для своей сметы нажми «В мою».</div>'; }
    return html+'</div>';
  }

  


/* =========================================================
 * ACCOUNTING FUNCTION: sourceSwitcherHtml
 * ========================================================= */
function sourceSwitcherHtml(type){
    return '<div style="border:1px solid var(--primary);border-radius:14px;padding:10px;margin:0 0 12px;background:rgba(79,70,229,.06);">'+
      '<div style="font-weight:900;color:var(--primary);margin-bottom:6px;">Источник: '+(type==='work'?'Работы':'Материалы')+'</div>'+
      '<div style="font-size:11px;color:var(--gray);margin-bottom:8px;">В смету и каталог попадает только выбранный источник. Вперемешку не считаем.</div>'+
      '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;">'+
        '<button class="'+(scope()==='my'?'btn-success':'btn-info')+'" style="margin:0;padding:10px;" onclick="epSetDbScope(&quot;my&quot;); '+(type==='work'?'openWorkCatalog()':'openMatCatalog()')+'">👤 Моя база</button>'+
        '<button class="'+(scope()==='global'?'btn-success':'btn-info')+'" style="margin:0;padding:10px;" onclick="epSetDbScope(&quot;global&quot;); '+(type==='work'?'openWorkCatalog()':'openMatCatalog()')+'">🌍 База сервера</button>'+
      '</div>'+
    '</div>';
  }

  


/* =========================================================
 * ACCOUNTING FUNCTION: editorTop
 * ========================================================= */
function editorTop(type){
    var title=type==='work'?'работ':'материалов';
    var s=scope(), admin=isAdmin(), editable=canEditActive();
    var hint=s==='my'?'Редактируется личная база мастера.':(admin?'Редактируется база сервера.':'Сервер открыт только для просмотра и копирования в мою базу.');
    var html='<div style="border:1px solid var(--primary);border-radius:14px;padding:10px;margin:0 0 12px;background:rgba(79,70,229,.05);">'+
      '<div style="font-weight:900;color:var(--primary);">'+label()+' — '+title+'</div>'+
      '<div style="font-size:11px;color:var(--gray);font-weight:800;margin-top:4px;">'+hint+' Позиций: '+active(type).length+'.</div>'+
      '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:8px;">'+
      '<button class="'+(s==='my'?'btn-success':'btn-info')+'" style="margin:0;padding:10px;" onclick="epSetDbScope(\'my\')">👤 Моя база</button>'+
      '<button class="'+(s==='global'?'btn-success':'btn-info')+'" style="margin:0;padding:10px;" onclick="epSetDbScope(\'global\')">🌍 База сервера</button></div>';
    if(editable){
      html+='<div style="border:1px dashed var(--border);border-radius:12px;padding:8px;margin-top:8px;background:rgba(255,255,255,.35);">'+
        '<div style="font-weight:900;color:var(--primary);font-size:12px;margin-bottom:6px;">Массовые действия: выделить → перенести / удалить</div>'+
        '<input id="ep-v15-move-cat-'+type+'" placeholder="Категория, куда перенести" style="margin-bottom:6px;">'+
        '<input id="ep-v15-move-sub-'+type+'" placeholder="Группа / подкатегория" style="margin-bottom:8px;">'+
        '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;">'+
        '<button class="btn-info" style="margin:0;padding:9px;" onclick="epV15SelectVisible(\''+type+'\',true)">✅ Выделить</button>'+
        '<button class="btn-vendor" style="margin:0;padding:9px;" onclick="epV15SelectVisible(\''+type+'\',false)">⬜ Снять</button>'+
        '<button class="btn-success" style="margin:0;padding:9px;" onclick="epV15MoveSelectedActive(\''+type+'\')">📦 Перенести</button>'+
        '<button class="btn-danger" style="margin:0;padding:9px;" onclick="epDeleteSelectedActiveV7()">🗑 Удалить выбранные</button></div></div>'+
        '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:8px;"><button class="btn-success" style="margin:0;padding:9px;" onclick="epSaveActiveDbV7()">💾 Сохранить</button><button class="btn-info" style="margin:0;padding:9px;" onclick="epReloadActiveDbV7()">🔄 Обновить</button></div>';
    }
    if(s==='global'&&!admin){ html+='<div class="ep-v7-note">Серверные цены и позиции мастер не меняет. Для своей сметы нажми «В мою».</div>'; }
    return html+'</div>';
  }

  


/* =========================================================
 * ACCOUNTING FUNCTION: editorRow
 * ========================================================= */
function editorRow(type,it){
    var item=enc(it);
    var sub=(groupOf(it)?groupOf(it)+' • ':'')+(Number(it.p)||0)+' ₽ / '+(it.u||'шт');
    var checked=scope()==='my' ? '<input type="checkbox" class="ep-my-del-check" data-type="'+type+'" data-item="'+esc(item)+'" style="width:20px;height:20px;accent-color:#EF4444;margin:4px 8px 0 0;">' : '';
    var copy=scope()==='global' ? '<button class="btn-info" style="width:auto;margin:0;padding:7px;" data-type="'+type+'" data-item="'+esc(item)+'" onclick="epCopyOneServerToMy(this.dataset.type,this.dataset.item)">В мою</button>' : '';
    return '<div class="emp-row" style="align-items:flex-start;">'+checked+'<div style="flex:1;"><b>'+esc(it.n||'Позиция')+'</b><br><span style="color:var(--gray);font-size:10px;">'+esc(sub)+'</span></div><input type="number" value="'+(Number(it.p)||0)+'" data-id="'+esc(String(it.id||''))+'" data-type="'+type+'" onchange="requestPriceChange(this.dataset.type,this.dataset.id,this.value)" style="width:70px;margin:0;padding:4px;text-align:center;">'+copy+'</div>';
  }

  


/* =========================================================
 * ACCOUNTING FUNCTION: reviewedItems
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
 * ACCOUNTING FUNCTION: autoGroupMaterial
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
 * ACCOUNTING FUNCTION: install
 * ========================================================= */
function install(){
    syncWindowCaches();
    epRefreshDbScopeUi();
    try{
      openMatCatalog=window.openMatCatalog;
      openWorkCatalog=window.openWorkCatalog;
      renderDbEditors=window.renderDbEditors;
      promptAdd=window.promptAdd;
      addDbItem=window.addDbItem;
      requestPriceChange=window.requestPriceChange;
    }catch(e){}
  }

  


/* =========================================================
 * ACCOUNTING FUNCTION: money
 * ========================================================= */
function money(v){ var n = Number(String(v == null ? '' : v).replace(',', '.').replace(/[^\d.\-]/g,'')); return Number.isFinite(n) ? n : 0; }
  


/* =========================================================
 * ACCOUNTING FUNCTION: normItem
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
 * ACCOUNTING FUNCTION: rowsToItems
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
 * ACCOUNTING FUNCTION: renderReviewPage
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
 * ACCOUNTING FUNCTION: ensureProgress
 * ========================================================= */
function ensureProgress(){
    if($('ep-v7-progress')) return;
    var css=document.createElement('style'); css.id='ep-v7-style'; css.textContent='\
#ep-v7-progress{position:fixed;inset:0;z-index:99999;background:rgba(15,23,42,.62);display:none;align-items:center;justify-content:center;padding:18px;}\
#ep-v7-progress .box{width:min(460px,94vw);border-radius:20px;background:var(--card-bg,#fff);box-shadow:0 24px 70px rgba(0,0,0,.35);padding:18px;border:1px solid var(--border,#e5e7eb);}\
#ep-v7-progress .title{font-weight:900;color:var(--primary,#4f46e5);font-size:17px;margin-bottom:8px;}\
#ep-v7-progress .bar{height:16px;background:rgba(148,163,184,.25);border-radius:999px;overflow:hidden;border:1px solid rgba(148,163,184,.35);}\
#ep-v7-progress .fill{height:100%;width:0%;background:linear-gradient(90deg,#2563eb,#10b981);transition:width .18s ease;}\
#ep-v7-progress .txt{font-size:12px;color:var(--gray,#64748b);font-weight:800;margin-top:8px;}\
.ep-v7-panel{border:2px solid var(--primary);border-radius:16px;padding:12px;margin:10px 0 15px;background:rgba(79,70,229,.06)}\
.ep-v7-actions{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:10px}.ep-v7-actions button{margin:0;padding:10px}.ep-v7-note{font-size:11px;color:var(--gray);font-weight:800;margin-top:8px}.ep-v7-locked{opacity:.55}.ep-v7-row{display:flex;gap:8px;align-items:flex-start}.ep-v7-row input[type=number]:disabled{opacity:.55;background:rgba(148,163,184,.15)}'; document.head.appendChild(css);
    var d=document.createElement('div'); d.id='ep-v7-progress'; d.innerHTML='<div class="box"><div class="title" id="ep-v7-progress-title">Выполняю...</div><div class="bar"><div class="fill" id="ep-v7-progress-fill"></div></div><div class="txt" id="ep-v7-progress-txt">0%</div></div>'; document.body.appendChild(d);
  }
  


/* =========================================================
 * ACCOUNTING FUNCTION: makeManualItem
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
 * ACCOUNTING FUNCTION: installAdminSettingsButton
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
 * ACCOUNTING FUNCTION: appPrice
 * ========================================================= */
function appPrice(key, def){ try{ return money((window.appLogic||{})[key]) || def; }catch(e){ return def; } }
  


/* =========================================================
 * ACCOUNTING FUNCTION: fixShieldWorkItem
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
 * ACCOUNTING FUNCTION: epV16GenerateCascadePanel
 * ========================================================= */
function epV16GenerateCascadePanel() {
    const bBox = epGetVal('cfg-brand-box', 'Tekfor');
    const bAuto = epGetVal('cfg-brand-auto', 'IEK');
    const sWall = epGetVal('cfg-shield-wall', 'Бетон');
    const ph = parseInt(epGetVal('cfg-phase', '1')) || 1;
    const curve = epGetVal('cfg-auto-curve', 'C');
    const rcdType = epGetVal('cfg-rcd-type', 'A');
    const protectionType = epGetVal('cfg-protection-type', 'uzo_auto');
    const isMaster = epGetCheck('cfg-master');
    const heavySeparate = epGetCheck('cfg-heavy-separate');

    let m = [], w = [], lines = [], protectionDevices = [], warnings = [];
    function addLine(name, nominal, group, opts) {
        const o = opts || {};
        lines.push({ name, nominal, group, curve: o.curve || curve, nonSwitchable: !!o.nonSwitchable, wet: group === 'wet' || !!o.wet });
    }
    function addRoom(label, count, wetPower) {
        for (let i = 1; i <= count; i++) {
            const n = count > 1 ? `${label} ${i}` : label;
            addLine(`${n} розетки`, 'C16', wetPower ? 'wet' : 'power', { wet: wetPower });
            addLine(`${n} свет`, 'C10', 'light');
        }
    }
    addRoom('Кухня', cfg.kits || 0, false);
    addRoom('Ванная', cfg.baths || 0, true);
    addRoom('Туалет', cfg.toilets || 0, true);
    addRoom('Комната', cfg.rms || 0, false);
    addRoom('Балкон', cfg.bals || 0, false);
    if (epGetCheck('c-apron')) addLine('Фартук кухни', 'C16', 'power');
    if (epGetCheck('c-dish')) addLine('Посудомойка', 'C10', 'power');
    if (epGetCheck('c-washer')) addLine('Стиралка/сушилка', 'C10', 'wet', { wet: true });
    if (epGetCheck('c-towel')) addLine('Полотенцесушитель', 'C10', 'wet', { wet: true });
    for (let i = 1; i <= (cfg.acs || 0); i++) addLine(`Кондиционер ${i}`, 'C10', 'climate');
    for (let i = 1; i <= (cfg.fls || 0); i++) addLine(`Тёплый пол ${i}`, 'C10', 'climate');
    if (epGetCheck('c-fridge')) addLine('Холодильник, неотключаемая группа', 'C10', 'alwaysOn', { nonSwitchable: true });
    if (epGetCheck('c-neptun')) addLine('Нептун, неотключаемая группа', 'C10', 'alwaysOn', { nonSwitchable: true });
    if (epGetCheck('c-router')) addLine('Роутер, неотключаемая группа', 'C6', 'alwaysOn', { nonSwitchable: true });
    const hobPower = epGetVal('c-hob-power', 'none');
    if (hobPower === '6') addLine('Плита до 6 кВт', 'C25', heavySeparate ? 'heavy' : 'power');
    if (hobPower === '10') addLine('Плита до 10 кВт', 'C32', heavySeparate ? 'heavy' : 'power');
    const boilerPower = epGetVal('c-boiler-power', 'none');
    if (boilerPower === '6') addLine('Бойлер до 6 кВт', 'C25', 'wet', { wet: true });
    if (boilerPower === '10') addLine('Бойлер до 10 кВт', 'C32', 'wet', { wet: true });

    const groupNames = { power: 'Силовые линии', climate: 'Климат', wet: 'Влажные зоны', light: 'Освещение', heavy: 'Большая техника', alwaysOn: 'Неотключаемые группы' };
    const presentGroups = Array.from(new Set(lines.map(l => l.group))).filter(Boolean);
    function groupAssignment(group, leakage) {
        const ls = lines.filter(l => l.group === group).map(l => l.name);
        const head = group === 'wet' ? 'Влажные зоны / защита 10 мА' : (groupNames[group] || group);
        return ls.length ? `${head}: ${ls.join(', ')}` : head;
    }
    function addProtection(group, mode) {
        const leakage = group === 'wet' ? 10 : 30;
        const kind = mode || (protectionType === 'dif_auto' ? 'ДИФ' : 'УЗО');
        protectionDevices.push({ group, kind, leakage, rcdType, modules: 2, assignment: groupAssignment(group, leakage) });
        if (group === 'wet' && leakage !== 10) warnings.push('Влажные зоны должны быть 10 мА');
    }
    if (protectionType === 'main_dif_auto') protectionDevices.push({ group: 'main', kind: 'Главный ДИФ', leakage: 30, rcdType, modules: 2, assignment: 'Вводная групповая защита всего щита' });
    else if (protectionType === 'mixed') presentGroups.forEach(g => addProtection(g, g === 'wet' ? 'ДИФ' : 'УЗО'));
    else presentGroups.forEach(g => addProtection(g, protectionType === 'dif_auto' ? 'ДИФ' : 'УЗО'));

    function mat(label, q, price, words, meta, assignment) {
        meta = Object.assign({}, meta || {}, { brand: bAuto });
        if (assignment) meta.assignment = assignment;
        const it = epMat(label, q, price, words, meta);
        if (assignment) { it.epAssignment = assignment; it.epAssignments = [assignment]; it.epMergedDetails = [assignment]; }
        return it;
    }
    function work(label, q, price, words, meta, assignment) {
        meta = Object.assign({}, meta || {});
        if (assignment) meta.assignment = assignment;
        const it = epWork(label, q, price, words, meta);
        if (assignment) { it.epAssignment = assignment; it.epAssignments = [assignment]; it.epMergedDetails = [assignment]; }
        return it;
    }

    m.push(mat(`Вводной автомат ${ph}ф ${bAuto}`, 1, bAuto === 'ABB' ? 3500 : 1800, ['автомат', 'вводной', bAuto, ph + 'ф'], { category: 'Автоматика', subcategory: 'Автоматы', kind: 'input_breaker', unit: 'шт', poles: ph === 3 ? '4P' : '2P' }, 'Вводной аппарат щита'));
    protectionDevices.forEach(pd => {
        const label = pd.kind === 'Главный ДИФ' ? `Главный ДИФ ${bAuto} ${pd.leakage}мА тип ${pd.rcdType}` : `${pd.kind} ${groupNames[pd.group] || pd.group} ${pd.leakage}мА тип ${pd.rcdType} ${bAuto}`;
        m.push(mat(label, 1, epDifPrice(bAuto), [pd.kind, bAuto, pd.leakage + 'мА', pd.rcdType, groupNames[pd.group] || pd.group], { category: 'Автоматика', subcategory: pd.kind === 'ДИФ' || pd.kind === 'Главный ДИФ' ? 'ДИФы' : 'УЗО', kind: pd.kind === 'ДИФ' || pd.kind === 'Главный ДИФ' ? 'dif' : 'uzo', leakage: pd.leakage, rcdType: pd.rcdType, amp: 40, poles: pd.kind === 'ДИФ' ? '1P+N' : '2P', modules: 2 }, pd.assignment));
    });
    lines.forEach(line => {
        const label = `Автомат ${line.nominal} тип ${line.curve} ${bAuto} — ${line.name}`;
        m.push(mat(label, 1, epAutoPrice(bAuto), ['автомат', bAuto, line.nominal, line.curve], { category: 'Автоматика', subcategory: 'Автоматы', kind: 'automatic', nominal: line.nominal, curve: line.curve, modules: 1, poles: '1P' }, line.name));
    });
    if (epGetCheck('cfg-uzm')) {
        const q = ph === 3 ? 3 : 1;
        m.push(mat(`Реле напряжения ${bAuto}`, q, 4500, ['реле напряжения', 'узм', bAuto], { category: 'Автоматика', subcategory: 'УЗМ / реле напряжения', kind: 'voltage_relay', modules: ph === 3 ? 6 : 2 }, 'Защита от перенапряжения'));
    }
    if (isMaster) {
        const lightLines = lines.filter(l => l.group === 'light').map(l => l.name).join(', ') || 'световые группы';
        m.push(mat(`Контактор C40 ${bAuto} — мастер-кнопка света`, 1, 2200, ['контактор', 'C40', bAuto], { category: 'Автоматика', subcategory: 'Контакторы', kind: 'contactor', modules: 2 }, 'Мастер-кнопка только на свет: ' + lightLines));
        m.push(mat(`Автомат C40 тип ${curve} ${bAuto} — байпас мастер-кнопки`, 1, bAuto === 'ABB' ? 600 : 380, ['автомат', 'C40', bAuto, curve], { category: 'Автоматика', subcategory: 'Автоматы', kind: 'automatic', nominal: 'C40', curve: curve, modules: 1, poles: '1P' }, 'Байпас мастер-кнопки света'));
    }
    currentShieldExtras.forEach(ex => m.push({ n: ex.n, q: ex.q, p: ex.p, u: ex.u || 'шт', type: 'mat', epAssignment: 'Дополнительный аппарат защиты', epAssignments: ['Дополнительный аппарат защиты'], epMergedDetails: ['Дополнительный аппарат защиты'] }));

    const onePoleCount = lines.length + (isMaster ? 1 : 0);
    const twoPoleProtectionCount = protectionDevices.length;
    const relayModules = epGetCheck('cfg-uzm') ? (ph === 3 ? 6 : 2) : 0;
    const masterModules = isMaster ? 3 : 0;
    const extraModules = currentShieldExtras.reduce((s, ex) => s + (Number(ex.modules || 1) * Number(ex.q || 1)), 0);
    const totalModules = Math.ceil(onePoleCount + twoPoleProtectionCount * 2 + relayModules + masterModules + extraModules + (ph === 3 ? 3 : 2));
    const boxSize = [6,12,24,36,48,60,72].find(s => s >= totalModules) || 72;
    if (totalModules > 72) warnings.push('Нужно больше 72 модулей — требуется второй щит или пересборка схемы');

    m.unshift(mat(`Щит ${sWall === 'Накладной' ? 'накладной' : 'встраиваемый'} ${bBox} ${boxSize}М`, 1, bBox === 'ABB' ? 6510 : 2660, ['щит', bBox, String(boxSize), sWall === 'Накладной' ? 'накладной' : 'встраиваемый'], { brand: bBox, category: 'Щитовое', subcategory: 'Корпуса', kind: 'shield_box', modules: boxSize, mountType: sWall === 'Накладной' ? 'surface' : 'built_in' }, 'Корпус щита'));
    const comb1P = Math.ceil(onePoleCount / 12), comb2P = Math.ceil(twoPoleProtectionCount / 6), rows = Math.ceil(boxSize / 12);
    const pugvSize = Number(appLogic.shieldPugvSize || 6), pugvMeters = Math.max(4, Math.ceil(totalModules * 0.4)), nshviPacks = Math.max(1, Math.ceil(boxSize / 48));
    if (comb1P > 0) m.push(mat('Гребёнка 1P 25см', comb1P, 250, ['гребенка', '1P', '25'], { category: 'Щитовое', subcategory: 'Гребёнки', kind: 'comb_bus_1p' }, 'Питание однополюсных автоматов'));
    if (comb2P > 0) m.push(mat('Гребёнка 2P 25см', comb2P, 450, ['гребенка', '2P', '25'], { category: 'Щитовое', subcategory: 'Гребёнки', kind: 'comb_bus_2p' }, 'Питание УЗО/ДИФ'));
    if (twoPoleProtectionCount > 0) m.push(mat('Нулевая шинка N на группу УЗО/ДИФ', twoPoleProtectionCount, 285, ['шина', 'N', 'ноль', 'DIN'], { category: 'Щитовое', subcategory: 'Шины N/PE', kind: 'neutral_bus' }, 'N-шинки по группам защиты'));
    m.push(mat(`PE-шина на ${appLogic.shieldPeBusContacts || 26} контактов`, 1, 770, ['PE', 'шина', '26'], { category: 'Щитовое', subcategory: 'Шины N/PE', kind: 'pe_bus' }, 'Защитное заземление PE'));
    m.push(mat('DIN-рейка / комплект DIN для щита', rows, 180, ['DIN', 'рейка'], { category: 'Щитовое', subcategory: 'DIN', kind: 'din_rail' }, 'Крепление аппаратов на DIN-рейке'));
    m.push(mat('Ограничитель на DIN-рейку', rows * 2, 35, ['ограничитель', 'DIN'], { category: 'Щитовое', subcategory: 'DIN', kind: 'din_stopper' }, 'Фиксация аппаратов на DIN-рейке'));
    m.push(mat(`Провод ПуГВ 1×${pugvSize}`, pugvMeters, 85, ['ПуГВ', '1x' + pugvSize, '1×' + pugvSize], { category: 'Щитовое', subcategory: 'Провода', kind: 'pugv', unit: 'м.п.' }, 'Внутренняя разводка щита'));
    m.push(mat(`НШВИ 1×${pugvSize}, упак. 100 шт`, nshviPacks, 225, ['НШВИ', '1x' + pugvSize, '1×' + pugvSize], { category: 'Щитовое', subcategory: 'Наконечники', kind: 'lug_pack' }, 'Опрессовка проводов щита'));
    m.push(mat('Маркировка линий / бирки', lines.length, 15, ['маркировка', 'бирки'], { category: 'Щитовое', subcategory: 'Маркировка', kind: 'marking_tag' }, 'Маркировка линий'));
    if (epGetCheck('cfg-cable-glands')) m.push(mat('Кабельные вводы / сальники', 1, 250, ['кабельный ввод', 'сальник'], { category: 'Щитовое', subcategory: 'Кабельные вводы', kind: 'cable_gland' }, 'Ввод кабелей в щит'));

    if (sWall !== 'Накладной') w.push(work(`Ниша щита ${boxSize}М (${sWall})`, boxSize, appLogic.shieldNichePerModule || 400, ['ниша', 'щит', sWall, String(boxSize)], { unit: 'мод.', category: 'Штробление и резка', subcategory: 'Ниши щита' }, 'Ниша под корпус щита'));
    if (sWall !== 'Накладной') w.push(work(`Штроба 100×50, под трассу кабелей (${sWall})`, 2, appLogic.shieldInputGroovePrice || 1500, ['штроба', '100x50', sWall, 'трасса', 'кабелей'], { unit: 'м.п.', category: 'Штробление и резка', subcategory: 'Штроба 100×50 под трассу кабелей' }, 'Штроба под ввод/трассу кабелей'));
    w.push(work('Сборка щита', totalModules, appLogic.priceShield || 500, ['сборка', 'щит'], { unit: 'мод.', category: 'Щитовое', subcategory: 'Сборка щита' }, 'Сборка модульного щита'));
    w.push(work('Установка щита', 1, appLogic.shieldInstallPrice || 2500, ['установка', 'щит'], { unit: 'шт', category: 'Щитовое', subcategory: 'Монтаж щита' }, 'Монтаж корпуса щита'));
    w.push(work('Подключение вводного кабеля', 1, appLogic.shieldInputConnectPrice || 1500, ['подключение', 'вводного', 'кабеля'], { unit: 'шт', category: 'Щитовое', subcategory: 'Монтаж щита' }, 'Подключение ввода'));
    w.push(work('Прозвонка / проверка линий', lines.length, appLogic.shieldTestLinePrice || 150, ['прозвонка', 'проверка', 'линий'], { unit: 'линия', category: 'Щитовое', subcategory: 'Проверка линий' }, 'Проверка каждой линии'));
    w.push(work('Маркировка линий', lines.length, appLogic.shieldMarkLinePrice || 100, ['маркировка', 'линий'], { unit: 'линия', category: 'Щитовое', subcategory: 'Маркировка линий' }, 'Маркировка каждой линии'));
    if (epGetCheck('cfg-scheme')) w.push(work('Составление однолинейной схемы щита', 1, appLogic.shieldSchemePrice || 4000, ['однолинейная', 'схема', 'щит'], { unit: 'шт', category: 'Щитовое', subcategory: 'Документация' }, 'Однолинейная схема'));
    const info = [
        { n: `ℹ️ Щит: занято ${totalModules} мод.; корпус ${boxSize}М; свободно ${Math.max(0, boxSize - totalModules)} мод.`, q: 1, p: 0, type: 'work', tag: 'shield_info' },
        { n: `ℹ️ Защита: ${protectionType}; автоматы тип ${curve}; УЗО/ДИФ тип ${rcdType}; влажные зоны 10мА`, q: 1, p: 0, type: 'work', tag: 'shield_info' },
        { n: `ℹ️ Гребёнки: 1P ${comb1P}×25см; 2P ${comb2P}×25см; N-шинок ${twoPoleProtectionCount}; PE-шина ${appLogic.shieldPeBusContacts || 26} контактов`, q: 1, p: 0, type: 'work', tag: 'shield_info' }
    ];
    warnings.forEach(x => info.push({ n: `⚠️ ${x}`, q: 1, p: 0, type: 'work', tag: 'shield_info' }));
    addAuto(m.concat(w).concat(info), 'shield');
    currentShieldExtras = [];
    closeModal('configModal');
    showToast('✅ Щит сгенерирован V16');
}
  


/* =========================================================
 * ACCOUNTING FUNCTION: patchDbBulk
 * ========================================================= */
function patchDbBulk(){
    var modal=$('settModal'); if(!modal || $('ep-v17-bulk-box')) return;
    var host=$('editor-mat-list') || $('editor-work-list'); if(!host) return;
    var box=document.createElement('div'); box.id='ep-v17-bulk-box'; box.style.cssText='margin:12px 0;padding:12px;border:2px dashed #8b5cf6;border-radius:16px;background:#faf5ff;';
    box.innerHTML='<b style="color:#5b21b6;display:block;margin-bottom:8px;">Массовое управление V17</b><div style="font-size:12px;color:#64748b;font-weight:800;margin-bottom:8px;">Выделение и перенос работают по галочкам в текущей открытой базе. Если галочек нет — значит открыт старый список, нажми Обновить / перезагрузить.</div><div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;"><input id="ep-v17-move-cat" placeholder="Категория"><input id="ep-v17-move-sub" placeholder="Подкатегория"></div><button onclick="epV17BulkMove()" style="margin-top:8px;background:#8b5cf6;color:white;">📦 Переместить выбранные</button><button onclick="epV17BulkDelete()" style="margin-top:8px;background:#ef4444;color:white;">🗑 Удалить выбранные</button>';
    host.parentNode.insertBefore(box,host);
  }
  


/* =========================================================
 * ACCOUNTING FUNCTION: rcdPrice
 * ========================================================= */
function rcdPrice(leak,brand,kind){ var hit=dbFindRcd(leak,brand,kind); if(hit) return money(hit.p); return leak===10?3600:1195; }
  


/* =========================================================
 * ACCOUNTING FUNCTION: renderMainDirect
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
 * ACCOUNTING FUNCTION: buildBulkPanel
 * ========================================================= */
function buildBulkPanel(){
    var arr=getArr('mat').concat(getArr('work'));
    var cats=arr.map(function(x){return x.c||'Разное';}); var subs=arr.map(function(x){return groupOf(x)||'Без группы';});
    return '<div id="ep-v18-bulk-box" style="margin:12px 0;padding:12px;border:2px dashed #16a34a;border-radius:16px;background:#f0fdf4;">'+
      '<b style="color:#166534;display:block;margin-bottom:7px;">Массовое управление V18</b>'+ 
      '<div style="font-size:12px;color:#64748b;font-weight:800;margin-bottom:8px;">Ставь галочки слева от позиций. Перемещение идёт в выбранную существующую категорию/подкатегорию активной базы.</div>'+ 
      '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:8px;"><select id="ep-v18-move-cat">'+optionsHtml(cats,'Категория')+'</select><select id="ep-v18-move-sub">'+optionsHtml(subs,'Подкатегория')+'</select></div>'+ 
      '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;"><button class="btn-info" style="margin:0;padding:10px;" onclick="epV18SelectVisible(true)">✅ Выделить видимые</button><button class="btn-vendor" style="margin:0;padding:10px;" onclick="epV18SelectVisible(false)">⬜ Снять галочки</button><button class="btn-success" style="margin:0;padding:10px;" onclick="epV18MoveSelected()">📦 Переместить выбранные</button><button class="btn-danger" style="margin:0;padding:10px;" onclick="epV18DeleteSelected()">🗑 Удалить выбранные</button></div>'+ 
    '</div>';
  }
  


/* =========================================================
 * ACCOUNTING FUNCTION: injectChecks
 * ========================================================= */
function injectChecks(){
    ['editor-mat-list','editor-work-list'].forEach(function(id){ var box=$(id); if(!box) return; var type=id.indexOf('work')>=0?'work':'mat'; Array.prototype.forEach.call(box.querySelectorAll('.emp-row,.mat-item'),function(row,idx){ if(row.querySelector('.ep-v18-check')) return; var price=row.querySelector('input[type="number"][data-id]'); var itemBtn=row.querySelector('[data-item]'); var did=price?price.getAttribute('data-id'):''; var dtype=price?price.getAttribute('data-type'):type; if(!did && itemBtn){ try{ var raw=decodeURIComponent(escape(atob(itemBtn.getAttribute('data-item')))); var obj=JSON.parse(raw); did=obj.id||''; dtype=itemBtn.getAttribute('data-type')||type; }catch(e){} } if(!did){ did='v18row_'+type+'_'+idx+'_'+clean(row.textContent).slice(0,40); }
      var ch=document.createElement('input'); ch.type='checkbox'; ch.className='ep-v18-check'; ch.dataset.type=dtype||type; ch.dataset.id=did; ch.style.cssText='width:22px;height:22px;min-width:22px;accent-color:#16a34a;margin:7px 10px 0 0;'; row.insertBefore(ch,row.firstChild); }); });
  }
  


/* =========================================================
 * ACCOUNTING FUNCTION: panelHtml
 * ========================================================= */
function panelHtml(){
    return '<div id="ep-v21-bulk-box" style="margin:12px 0;padding:12px;border:2px dashed #16a34a;border-radius:16px;background:#f0fdf4;">'+
      '<b style="color:#166534;display:block;margin-bottom:7px;">Массовое управление V21</b>'+ 
      '<div style="font-size:12px;color:#64748b;font-weight:800;margin-bottom:8px;">Галочки ставятся слева от позиций. Категория/подкатегория выбираются из существующих и больше не закрываются сами.</div>'+ 
      '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:8px;">'+
        '<select id="ep-v21-move-cat" onchange="epV21UpdateSubs()"><option value="">Категория</option></select>'+ 
        '<select id="ep-v21-move-sub"><option value="">Подкатегория</option></select>'+ 
      '</div>'+ 
      '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;">'+
        '<button class="btn-info" style="margin:0;padding:10px;" onclick="epV21SelectVisible(true)">✅ Выделить видимые</button>'+ 
        '<button class="btn-vendor" style="margin:0;padding:10px;" onclick="epV21SelectVisible(false)">⬜ Снять галочки</button>'+ 
        '<button class="btn-success" style="margin:0;padding:10px;" onclick="epV21MoveSelected()">📦 Переместить выбранные</button>'+ 
        '<button class="btn-danger" style="margin:0;padding:10px;" onclick="epV21DeleteSelected()">🗑 Удалить выбранные</button>'+ 
      '</div>'+ 
    '</div>';
  }
  


/* =========================================================
 * ACCOUNTING FUNCTION: rowId
 * ========================================================= */
function rowId(row,type,idx){
    var price=row.querySelector('input[type="number"][data-id]'); if(price && price.getAttribute('data-id')) return {id:price.getAttribute('data-id'), type:price.getAttribute('data-type')||type};
    var itemBtn=row.querySelector('[data-item]');
    if(itemBtn){ try{ var raw=decodeURIComponent(escape(atob(itemBtn.getAttribute('data-item')))); var obj=JSON.parse(raw); if(obj&&obj.id) return {id:obj.id,type:itemBtn.getAttribute('data-type')||type}; }catch(e){} }
    return {id:'v21row_'+type+'_'+idx+'_'+clean(row.textContent).slice(0,40), type:type};
  }
  

