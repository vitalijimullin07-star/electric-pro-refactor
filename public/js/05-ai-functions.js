/*
 * Electric PRO Refactor
 * Module: 05-ai-functions.js
 * V39 SAFE: AI Functions.
 *
 * Важно:
 * - модуль пересобран безопасно;
 * - переносим только полноценные function / async function;
 * - каждый блок проверяется через node --check;
 * - 00-core.js временно остаётся стабильным runtime.
 */

console.log("05-ai-functions.js V39 SAFE loaded");



/* =========================================================
 * AI FUNCTIONS FUNCTION: handleGoogleAuth
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
 * AI FUNCTIONS FUNCTION: loginWithPin
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
 * AI FUNCTIONS FUNCTION: finishLoginSetup
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
 * AI FUNCTIONS FUNCTION: updateCoeffs
 * ========================================================= */
function updateCoeffs() {
    coeffs.mat = Number(document.getElementById('m-coeff').value);
    coeffs.work = Number(document.getElementById('w-coeff').value);
    safeSet('coeffs_v31', JSON.stringify(coeffs));
    renderMainTable();
}




/* =========================================================
 * AI FUNCTIONS FUNCTION: saveApiKey
 * ========================================================= */
async function saveApiKey(val) { 
    GEMINI_API_KEY = val.trim(); safeSet('gemini_key_v31', GEMINI_API_KEY);
    if(db && appUser && appUser.uid) { try { await db.collection('users').doc(appUser.uid).update({geminiKey: GEMINI_API_KEY}); }catch(e){} }
    showToast("🔑 Ключ сохранен!"); 
}



/* =========================================================
 * AI FUNCTIONS FUNCTION: saveQRs
 * ========================================================= */
function saveQRs() { 
    safeSet('qr_tg_v31', document.getElementById('qr-tg').value); 
    safeSet('qr_wa_v31', document.getElementById('qr-wa').value); 
    safeSet('qr_vk_v31', document.getElementById('qr-vk').value);
    safeSet('ai_shops_v31', document.getElementById('ai-shops').value); 
    showToast("📱 Настройки сохранены"); 
}




/* =========================================================
 * AI FUNCTIONS FUNCTION: applySwap
 * ========================================================= */
function applySwap() {
    if(swapTargetIdx < 0) return;
    let selId = document.getElementById('swap-select').value;
    let current = currentEstimate[swapTargetIdx];
    let isMat = current.type === 'mat';
    let dbToUse = isMat ? matDB : workDB;
    let newItem = dbToUse.find(x => x.id === selId);
    
    if(newItem) {
        currentEstimate[swapTargetIdx].n = newItem.n;
        currentEstimate[swapTargetIdx].p = newItem.p;
        renderMainTable();
        closeModal('swapModal');
        showToast("Заменено!");
    }
}




/* =========================================================
 * AI FUNCTIONS FUNCTION: renderMainTable
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
 * AI FUNCTIONS FUNCTION: syncDraft
 * ========================================================= */
async function syncDraft() { try { safeSet('est_v31', JSON.stringify(currentEstimate)); if(db && appUser && appUser.uid) await db.collection('drafts').doc(appUser.uid).set({ estimate: currentEstimate, cust: cust, timestamp: new Date().toISOString() }); } catch(e){} }



/* =========================================================
 * AI FUNCTIONS FUNCTION: clearCurrentEstimate
 * ========================================================= */
async function clearCurrentEstimate() { let c = await window.customConfirm("Очистка", "Очистить смету?"); if(c){ currentEstimate=[]; renderMainTable(); } }




/* =========================================================
 * AI FUNCTIONS FUNCTION: promptAdd
 * ========================================================= */
function promptAdd(id, type) { 
    let dbArr = (type==='mat'?matDB:workDB); let item = dbArr.find(x => String(x.id) === String(id)); 
    if(!item) return; pendingAdd = { item, type }; 
    document.getElementById('qty-prompt-name').innerText = item.n; 
    document.getElementById('qty-input').value = 1; 
    openModal('qtyPromptModal'); 
}



/* =========================================================
 * AI FUNCTIONS FUNCTION: addAuto
 * ========================================================= */
function addAuto(items, tag) {
    currentEstimate = currentEstimate.filter(it => it.tag !== tag);
    const map = {};
    const out = [];
    (items || []).forEach(src => {
        if (!src) return;
        const it = Object.assign({}, src);
        it.tag = tag;
        const key = [it.tag || '', it.type || '', it.n || '', Number(it.p) || 0, it.u || 'шт'].join('|');
        let rec = map[key];
        if (!rec) {
            rec = Object.assign({}, it, { q: 0 });
            map[key] = rec;
            out.push(rec);
        }
        rec.q += Number(it.q) || 0;
        epV15MergeAssignments(rec, it);
    });
    currentEstimate = currentEstimate.concat(out);
    renderMainTable();
}




/* =========================================================
 * AI FUNCTIONS FUNCTION: epV15DetectModel
 * ========================================================= */
function epV15DetectModel(s, kind) {
    s = String(s || '');
    const patterns = [
        /ВА\s*47\s*[-–—]?\s*29/iu,
        /ВД\s*1\s*[-–—]?\s*63/iu,
        /АВДТ\s*32/iu,
        /АД\s*12/iu,
        /Easy\s*9/iu,
        /Acti\s*9/iu,
        /SH\s*20\d/iu,
        /S\s*20\d/iu,
        /DX\s*3/iu,
        /TX\s*3/iu
    ];
    for (const p of patterns) { const m = s.match(p); if (m) return epV15CleanForName(m[0]).replace(/\s*[-–—]\s*/g,'-'); }
    const k = String(kind || '').toLowerCase();
    if (k.includes('dif') || /диф/i.test(s)) return epV15BrandCode(s).toUpperCase()==='IEK' ? 'АВДТ32' : '';
    if (k.includes('uzo') || k.includes('узо') || /узо|диф/i.test(s)) return epV15BrandCode(s).toUpperCase()==='IEK' ? 'ВД1-63' : '';
    if (/автомат|breaker|ВА47|IEK|ИЭК/i.test(s)) return epV15BrandCode(s).toUpperCase()==='IEK' ? 'ВА47-29' : '';
    return '';
}



/* =========================================================
 * AI FUNCTIONS FUNCTION: epV15FormatAutoName
 * ========================================================= */
function epV15FormatAutoName(found, label, meta) {
    meta = meta || {};
    const src = [label, found && found.n, meta.rawLabel].join(' ');
    const brand = epV15BrandRu(meta.brand || epV15BrandCode(src));
    let nominal = epV15DetectNominal(src, meta);
    if (!nominal && /A472|А472/i.test(src)) nominal = 'C40';
    let poles = epV15DetectPoles(src, meta) || '1P';
    const model = epV15DetectModel(src, 'automatic') || (epV15BrandCode(brand).toUpperCase()==='IEK' ? 'ВА47-29' : '');
    if (/вводн/i.test(src) && !nominal) return epV15CleanForName(['Вводной автомат', poles === '1P' ? '2P' : poles, brand, model].filter(Boolean).join(' '));
    return epV15CleanForName([nominal || 'Автомат', poles, brand, model].filter(Boolean).join(' '));
}



/* =========================================================
 * AI FUNCTIONS FUNCTION: epV15FormatRcdName
 * ========================================================= */
function epV15FormatRcdName(found, label, meta) {
    meta = meta || {};
    const src = [label, found && found.n, meta.rawLabel].join(' ');
    const kraw = String(meta.kind || label || '').toLowerCase();
    const kind = kraw.includes('dif') || /диф/i.test(src) ? 'ДИФ' : 'УЗО';
    const brand = epV15BrandRu(meta.brand || epV15BrandCode(src));
    const poles = epV15DetectPoles(src, meta) || (kind === 'ДИФ' ? '1P+N' : '2P');
    const amp = Number(meta.amp || meta.current || 40) || 40;
    const leakage = epV15DetectLeakage(src, meta) || 30;
    const typ = meta.rcdType || (String(src).match(/тип\s*([AАBВCС]+)/iu)||[])[1] || 'A';
    const model = epV15DetectModel(src, kind) || (epV15BrandCode(brand).toUpperCase()==='IEK' ? (kind==='ДИФ'?'АВДТ32':'ВД1-63') : '');
    return epV15CleanForName([kind, poles, amp + 'A', leakage + 'мА', 'тип ' + String(typ).toUpperCase().replace('А','A').replace('В','B').replace('С','C'), brand, model].filter(Boolean).join(' '));
}



/* =========================================================
 * AI FUNCTIONS FUNCTION: epV15MergeAssignments
 * ========================================================= */
function epV15MergeAssignments(dst, src) {
    const vals = [];
    [src && src.epAssignment, src && src.dbMeta && src.dbMeta.assignment].forEach(v => { if(v) vals.push(v); });
    if (Array.isArray(src && src.epAssignments)) vals.push(...src.epAssignments);
    if (Array.isArray(src && src.epMergedDetails)) vals.push(...src.epMergedDetails);
    if (!dst.epAssignments) dst.epAssignments = [];
    if (!dst.epMergedDetails) dst.epMergedDetails = [];
    vals.map(v => String(v || '').trim()).filter(Boolean).forEach(v => {
        if (v && !/^(позиция щита|назначение не указано)$/i.test(v) && !dst.epAssignments.includes(v)) dst.epAssignments.push(v);
        if (v && !/^(позиция щита|назначение не указано)$/i.test(v) && !dst.epMergedDetails.includes(v)) dst.epMergedDetails.push(v);
    });
}




/* =========================================================
 * AI FUNCTIONS FUNCTION: epMat
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
 * AI FUNCTIONS FUNCTION: epWork
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
 * AI FUNCTIONS FUNCTION: generateCascadePanel
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
 * AI FUNCTIONS FUNCTION: mat
 * ========================================================= */
function mat(label, q, price, words, meta, assignment) {
        meta = Object.assign({}, meta || {}, { brand: bAuto });
        if (assignment) meta.assignment = assignment;
        const it = epMat(label, q, price, words, meta);
        if (assignment) { it.epAssignment = assignment; it.epAssignments = [assignment]; it.epMergedDetails = [assignment]; }
        return it;
    }
    


/* =========================================================
 * AI FUNCTIONS FUNCTION: work
 * ========================================================= */
function work(label, q, price, words, meta, assignment) {
        meta = Object.assign({}, meta || {});
        if (assignment) meta.assignment = assignment;
        const it = epWork(label, q, price, words, meta);
        if (assignment) { it.epAssignment = assignment; it.epAssignments = [assignment]; it.epMergedDetails = [assignment]; }
        return it;
    }

    


/* =========================================================
 * AI FUNCTIONS FUNCTION: runAiCheck
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
 * AI FUNCTIONS FUNCTION: aiSupply
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
 * AI FUNCTIONS FUNCTION: aiPueHelper
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
 * AI FUNCTIONS FUNCTION: compareShopsAI
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
 * AI FUNCTIONS FUNCTION: showPreview
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
 * AI FUNCTIONS FUNCTION: deleteAct
 * ========================================================= */
async function deleteAct() {
    if(!currentCardId) return;
    let conf = await window.customConfirm("Удаление", "Удалить этот акт навсегда?");
    if(conf) {
        hDB = hDB.filter(x => x.id !== currentCardId);
        safeSet('h_v31', JSON.stringify(hDB));
        updateHistList();
        renderChart();
        closeModal('objCardModal');
        showToast("Акт удален");
        if(db) {
            try { await db.collection('history').doc(String(currentCardId)).delete(); } catch(e){}
        }
    }
}




/* =========================================================
 * AI FUNCTIONS FUNCTION: doRecalculate
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
 * AI FUNCTIONS FUNCTION: renderChart
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
 * AI FUNCTIONS FUNCTION: saveHist
 * ========================================================= */
async function saveHist() {
    const finalTotal = parseInt(document.getElementById('b-final').innerText) || 0;
    let act = { id: Date.now(), name: cust.name, phone: cust.phone, addr: cust.addr, total: finalTotal, date: new Date().toLocaleDateString(), estimate: JSON.parse(JSON.stringify(currentEstimate)), masterName: appUser.name, masterUid: appUser.uid, payments: { mat: false, cut: false, rough: false, fine: false, extra: false, prepay: Number(document.getElementById('b-prepay').value) || 0 } };
    hDB.push(act); safeSet('h_v31', JSON.stringify(hDB)); updateHistList(); renderChart();
    try { if(db) { await db.collection('history').doc(String(act.id)).set(act); await db.collection('drafts').doc(appUser.uid).delete(); currentEstimate = []; renderMainTable(); } } catch(e){}
    showToast("✅ Объект сохранен в Облако!"); closeModal('buhModal');
}




/* =========================================================
 * AI FUNCTIONS FUNCTION: openObjCard
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
 * AI FUNCTIONS FUNCTION: addExtraWork
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
 * AI FUNCTIONS FUNCTION: addDbItem
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
 * AI FUNCTIONS FUNCTION: requestPriceChange
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
 * AI FUNCTIONS FUNCTION: listenForApprovals
 * ========================================================= */
function listenForApprovals() {
    if(!db) return;
    try {
        db.collection('users').where('isApproved', '==', false).onSnapshot(snap => {
            const container = document.getElementById('admin-approval-list'); container.innerHTML = '';
            if(snap.empty) { container.innerHTML = "<span style='font-size:11px; color:gray;'>Новых заявок нет</span>"; return; }
            snap.forEach(doc => { 
                const u = doc.data(); 
                container.innerHTML += `<div class="emp-row" style="flex-wrap: wrap; gap: 5px;"><span><b>${u.name}</b><br><span style="font-size:10px;">${u.phone || u.email}</span></span><button class="btn-success" onclick="approveUser('${doc.id}')" style="width:auto; margin:0; padding:6px 10px;">Одобрить</button></div>`; 
            });
        });
    } catch(e) { console.error("Listen approvals error", e); }
}




/* =========================================================
 * AI FUNCTIONS FUNCTION: approveUser
 * ========================================================= */
async function approveUser(uid) { try { await db.collection('users').doc(uid).update({ isApproved: true }); showToast("Одобрено!"); } catch(e){} }




/* =========================================================
 * AI FUNCTIONS FUNCTION: loadMasterDrafts
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
 * AI FUNCTIONS FUNCTION: renderAdminUsers
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
 * AI FUNCTIONS FUNCTION: adminAddUser
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
 * AI FUNCTIONS FUNCTION: deleteUser
 * ========================================================= */
async function deleteUser(uid) {
    let conf = await window.customConfirm("Удаление", "Удалить мастера из базы?");
    if(conf && db) { try { await db.collection('users').doc(uid).delete(); renderAdminUsers(); showToast("Удален"); } catch(e){} }
}





/* =========================================================
 * AI FUNCTIONS FUNCTION: epNormProvider
 * ========================================================= */
function epNormProvider(p) {
        return p === 'openai' ? 'openai' : 'gemini';
    }

    


/* =========================================================
 * AI FUNCTIONS FUNCTION: epCurrentProvider
 * ========================================================= */
function epCurrentProvider() {
        return epNormProvider(window.EP_AI_CONFIG.provider || safeGet('ep_ai_provider_v1', 'gemini'));
    }

    


/* =========================================================
 * AI FUNCTIONS FUNCTION: epCurrentKey
 * ========================================================= */
function epCurrentKey() {
        const p = epCurrentProvider();
        if (p === 'openai') return window.EP_AI_CONFIG.openaiKey || safeGet('ep_openai_key_v1', '');
        return window.EP_AI_CONFIG.geminiKey || (typeof GEMINI_API_KEY !== 'undefined' ? GEMINI_API_KEY : '') || safeGet('gemini_key_v31', '');
    }

    


/* =========================================================
 * AI FUNCTIONS FUNCTION: epSetAiProvider
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
 * AI FUNCTIONS FUNCTION: epRefreshProviderUI
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
 * AI FUNCTIONS FUNCTION: epInsertMainProviderSwitch
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
 * AI FUNCTIONS FUNCTION: epMakeAiMenuGroup
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
 * AI FUNCTIONS FUNCTION: epPatchSettingsUI
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
 * AI FUNCTIONS FUNCTION: epTestProviderKey
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
 * AI FUNCTIONS FUNCTION: epLoadAiConfigFromServer
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
 * AI FUNCTIONS FUNCTION: epCallGemini
 * ========================================================= */
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

    


/* =========================================================
 * AI FUNCTIONS FUNCTION: epExtractOpenAiText
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
 * AI FUNCTIONS FUNCTION: epCallOpenAI
 * ========================================================= */
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

    


/* =========================================================
 * AI FUNCTIONS FUNCTION: epAskAI
 * ========================================================= */
async function epAskAI(promptText, opts) {
        await epLoadAiConfigFromServer();
        const provider = epCurrentProvider();
        if (provider === 'openai') return epCallOpenAI(promptText, opts || {});
        return epCallGemini(promptText, opts || {});
    }

    


/* =========================================================
 * AI FUNCTIONS FUNCTION: epParseLooseTableText
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
 * AI FUNCTIONS FUNCTION: epParseJsonArray
 * ========================================================= */
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

    


/* =========================================================
 * AI FUNCTIONS FUNCTION: epNormalizeItems
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
 * AI FUNCTIONS FUNCTION: epSaveUserDb
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
 * AI FUNCTIONS FUNCTION: epSaveGlobalDb
 * ========================================================= */
async function epSaveGlobalDb() {
        if (!db) return;
        await db.collection('settings').doc('global_db').set({ matDB: matDB, workDB: workDB, updatedAt: new Date().toISOString() }, { merge: true });
    }

    


/* =========================================================
 * AI FUNCTIONS FUNCTION: epLoadUserDbAfterLogin
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
 * AI FUNCTIONS FUNCTION: epInsertDbTools
 * ========================================================= */
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

    


/* =========================================================
 * AI FUNCTIONS FUNCTION: epReadDbFile
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
 * AI FUNCTIONS FUNCTION: epAiNormalizeImage
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
 * AI FUNCTIONS FUNCTION: epAiNormalizeDbText
 * ========================================================= */
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

    


/* =========================================================
 * AI FUNCTIONS FUNCTION: epShowDbReview
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
 * AI FUNCTIONS FUNCTION: epGetReviewedSelected
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
 * AI FUNCTIONS FUNCTION: epSendDbProposal
 * ========================================================= */
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

    


/* =========================================================
 * AI FUNCTIONS FUNCTION: epInitialApply
 * ========================================================= */
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

    


/* =========================================================
 * AI FUNCTIONS FUNCTION: epGetGlobalDb
 * ========================================================= */
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
    


/* =========================================================
 * AI FUNCTIONS FUNCTION: epInsertGlobalDbButton
 * ========================================================= */
function epInsertGlobalDbButton() {
        if (document.getElementById('ep-global-db-entry')) return;
        const tools = document.getElementById('ep-db-ai-tools'); const tabs = document.querySelector('#settModal .tabs-container'); const anchor = tools || tabs;
        if (!anchor || !anchor.parentNode) return;
        const box = document.createElement('div'); box.id='ep-global-db-entry'; box.className='ep-global-db-entry'; box.innerHTML = `<button class="btn-shield" onclick="epOpenGlobalDbModal()">🌍 База сервера</button>`;
        anchor.parentNode.insertBefore(box, anchor.nextSibling);
    }
    


/* =========================================================
 * AI FUNCTIONS FUNCTION: epRenderProposalList
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
 * AI FUNCTIONS FUNCTION: epMoveShieldSettingsIntoDetails
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
 * AI FUNCTIONS FUNCTION: epRenderGrouped
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
 * AI FUNCTIONS FUNCTION: boot
 * ========================================================= */
function boot(){ epMoveShieldSettingsIntoDetails(); epPatchDbRenderers(); epNormalizeMaterialsDb(); epPatchGenerateButton(); }
  


/* =========================================================
 * AI FUNCTIONS FUNCTION: smartFindMat
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
 * AI FUNCTIONS FUNCTION: mergeEstimate
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
 * AI FUNCTIONS FUNCTION: mergeEstimateFixed
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
 * AI FUNCTIONS FUNCTION: shieldRowsForDetails
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
 * AI FUNCTIONS FUNCTION: detailNote
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
 * AI FUNCTIONS FUNCTION: saveLocalDb
 * ========================================================= */
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

  


/* =========================================================
 * AI FUNCTIONS FUNCTION: loadGlobalDb
 * ========================================================= */
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

  


/* =========================================================
 * AI FUNCTIONS FUNCTION: groupHtml
 * ========================================================= */
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
    });
    return html || '<div style="padding:15px;color:var(--gray);font-weight:700;">Позиции не найдены</div>';
  }
  


/* =========================================================
 * AI FUNCTIONS FUNCTION: saveMyDb
 * ========================================================= */
async function saveMyDb(){
    try{
      if(typeof safeSet === 'function'){
        safeSet('user_db_mat_v31', JSON.stringify(localDb('mat')));
        safeSet('user_db_work_v31', JSON.stringify(localDb('work')));
      } else {
        localStorage.setItem('user_db_mat_v31', JSON.stringify(localDb('mat')));
        localStorage.setItem('user_db_work_v31', JSON.stringify(localDb('work')));
      }
    }catch(e){}
    try{
      if(typeof db !== 'undefined' && db && typeof appUser !== 'undefined' && appUser && appUser.uid){
        await db.collection('user_db').doc(appUser.uid).set({
          uid: appUser.uid,
          name: appUser.name || appUser.email || '',
          matDB: localDb('mat'),
          workDB: localDb('work'),
          updatedAt: new Date().toISOString()
        }, { merge:true });
      }
    }catch(e){ console.warn('saveMyDb', e); }
  }

  


/* =========================================================
 * AI FUNCTIONS FUNCTION: loadGlobal
 * ========================================================= */
async function loadGlobal(force){
    if(!force && window.EP_HARD_GLOBAL_CACHE.loadedAt && Date.now() - window.EP_HARD_GLOBAL_CACHE.loadedAt < 8000) return window.EP_HARD_GLOBAL_CACHE;
    var out = { matDB: [], workDB: [], loadedAt: Date.now() };
    try{
      if(typeof db !== 'undefined' && db){
        var doc = await db.collection('settings').doc('global_db').get();
        if(doc.exists){
          var d = doc.data() || {};
          out.matDB = Array.isArray(d.matDB) ? d.matDB : [];
          out.workDB = Array.isArray(d.workDB) ? d.workDB : [];
        }
      }
    }catch(e){ console.warn('load global_db', e); }
    if(!out.matDB.length) out.matDB = localDb('mat').slice();
    if(!out.workDB.length) out.workDB = localDb('work').slice();
    window.EP_HARD_GLOBAL_CACHE = out;
    window.EP_GLOBAL_DB_VISIBLE_CACHE = out;
    try { if(typeof epGlobalDbCache !== 'undefined') { epGlobalDbCache.matDB = out.matDB; epGlobalDbCache.workDB = out.workDB; } } catch(e){}
    return out;
  }

  


/* =========================================================
 * AI FUNCTIONS FUNCTION: renderList
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
 * AI FUNCTIONS FUNCTION: readGlobal
 * ========================================================= */
async function readGlobal(force){
    if(!force && window.EP_ULTIMATE_DB_CACHE.ts && Date.now() - window.EP_ULTIMATE_DB_CACHE.ts < 6000) return window.EP_ULTIMATE_DB_CACHE;

    var out = { matDB: [], workDB: [], ts: Date.now() };
    var fromStorage = loadCachedGlobalFromStorage();
    if(fromStorage) out = fromStorage;

    try{
      if(typeof db !== 'undefined' && db){
        var doc = await db.collection('settings').doc('global_db').get();
        if(doc.exists){
          var d = doc.data() || {};
          out = {
            matDB: Array.isArray(d.matDB) ? d.matDB : [],
            workDB: Array.isArray(d.workDB) ? d.workDB : [],
            ts: Date.now()
          };
        }
      }
    }catch(e){ console.warn('read global_db failed', e); }

    if(!out.matDB.length) out.matDB = localDb('mat').slice();
    if(!out.workDB.length) out.workDB = localDb('work').slice();

    window.EP_ULTIMATE_DB_CACHE = out;
    window.EP_HARD_GLOBAL_CACHE = out;
    window.EP_GLOBAL_DB_VISIBLE_CACHE = out;
    try { localStorage.setItem('ep_global_cache_ultimate_v1', JSON.stringify(out)); } catch(e){}
    return out;
  }

  


/* =========================================================
 * AI FUNCTIONS FUNCTION: renderItems
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
 * AI FUNCTIONS FUNCTION: esc
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
 * AI FUNCTIONS FUNCTION: epSaveMyDbToServer
 * ========================================================= */
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

  


/* =========================================================
 * AI FUNCTIONS FUNCTION: epSaveServerDbToServer
 * ========================================================= */
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

  


/* =========================================================
 * AI FUNCTIONS FUNCTION: epSendServerProposal
 * ========================================================= */
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

  


/* =========================================================
 * AI FUNCTIONS FUNCTION: epLoadDbFromServer
 * ========================================================= */
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

  


/* =========================================================
 * AI FUNCTIONS FUNCTION: commitCollection
 * ========================================================= */
async function commitCollection(collection, mode){
    if(typeof db === 'undefined' || !db) return 0;
    var snap = await db.collection(collection).get();
    var batch = db.batch(), ops = 0, count = 0, promises=[];
    snap.forEach(function(doc){
      if(mode === 'delete') batch.delete(doc.ref);
      else batch.set(doc.ref, {matDB:[], workDB:[], cleanMode:true, resetAt:new Date().toISOString()}, {merge:true});
      ops++; count++;
      if(ops >= 450){ promises.push(batch.commit()); batch=db.batch(); ops=0; }
    });
    if(ops) promises.push(batch.commit());
    if(promises.length) await Promise.all(promises);
    return count;
  }

  


/* =========================================================
 * AI FUNCTIONS FUNCTION: install
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
 * AI FUNCTIONS FUNCTION: setMy
 * ========================================================= */
function setMy(type,arr){
    arr = unique(arr, type);
    if(type === 'work') window.EP_MY_WORK = arr; else window.EP_MY_MAT = arr;
    writeArr(LS_MY_MAT, type === 'mat' ? arr : getMy('mat'));
    writeArr(LS_MY_WORK, type === 'work' ? arr : getMy('work'));
    try{ window.userMatDB = getMy('mat'); window.userWorkDB = getMy('work'); }catch(e){}
    syncMainArrays('my');
  }
  


/* =========================================================
 * AI FUNCTIONS FUNCTION: setServer
 * ========================================================= */
function setServer(type,arr){
    arr = unique(arr, type);
    if(type === 'work') window.EP_GLOBAL_WORK = arr; else window.EP_GLOBAL_MAT = arr;
    var mat = type === 'mat' ? arr : getServer('mat');
    var work = type === 'work' ? arr : getServer('work');
    try{
      window.EP_FORCE_GLOBAL = {matDB:mat, workDB:work};
      window.EP_ULTIMATE_DB_CACHE = {matDB:mat, workDB:work, ts:Date.now()};
      window.EP_GLOBAL_DB_VISIBLE_CACHE = {matDB:mat, workDB:work, ts:Date.now()};
    }catch(e){}
    writeObj(LS_SERVER_CACHE, {matDB:mat, workDB:work, ts:Date.now()});
    syncMainArrays('global');
  }
  


/* =========================================================
 * AI FUNCTIONS FUNCTION: syncMainArrays
 * ========================================================= */
function syncMainArrays(target){
    try{
      var use = target || activeTarget();
      if(use === 'global'){
        window.matDB = getServer('mat');
        window.workDB = getServer('work');
        try{ matDB = window.matDB; workDB = window.workDB; }catch(e){}
      } else {
        window.matDB = getMy('mat');
        window.workDB = getMy('work');
        try{ matDB = window.matDB; workDB = window.workDB; }catch(e){}
      }
    }catch(e){}
  }
  


/* =========================================================
 * AI FUNCTIONS FUNCTION: saveMyRemote
 * ========================================================= */
async function saveMyRemote(){
    try{
      if(typeof db !== 'undefined' && db && uid()){
        await db.collection('user_db').doc(uid()).set({
          uid: uid(),
          masterName: (window.appUser && (appUser.name || appUser.email)) || '',
          matDB: getMy('mat'),
          workDB: getMy('work'),
          created: true,
          updatedAt: new Date().toISOString()
        }, {merge:true});
        return true;
      }
    }catch(e){ console.warn('EP V4 save my import failed', e); }
    return false;
  }
  


/* =========================================================
 * AI FUNCTIONS FUNCTION: saveServerRemote
 * ========================================================= */
async function saveServerRemote(){
    try{
      if(typeof db !== 'undefined' && db && isAdmin()){
        await db.collection('settings').doc('global_db').set({
          matDB: getServer('mat'),
          workDB: getServer('work'),
          updatedAt: new Date().toISOString()
        }, {merge:true});
        return true;
      }
    }catch(e){ console.warn('EP V4 save server import failed', e); }
    return false;
  }
  


/* =========================================================
 * AI FUNCTIONS FUNCTION: syncActiveArrays
 * ========================================================= */
function syncActiveArrays(){
    try{
      if(getScope() === 'global'){
        var sm = Array.isArray(window.EP_GLOBAL_MAT) ? window.EP_GLOBAL_MAT : getServerFromCache('mat');
        var sw = Array.isArray(window.EP_GLOBAL_WORK) ? window.EP_GLOBAL_WORK : getServerFromCache('work');
        window.matDB = sm.slice();
        window.workDB = sw.slice();
        try{ matDB = window.matDB; workDB = window.workDB; }catch(e){}
      } else {
        var mm = Array.isArray(window.EP_MY_MAT) ? window.EP_MY_MAT : readArr(LS_MY_MAT);
        var mw = Array.isArray(window.EP_MY_WORK) ? window.EP_MY_WORK : readArr(LS_MY_WORK);
        window.matDB = mm.slice();
        window.workDB = mw.slice();
        try{ matDB = window.matDB; workDB = window.workDB; }catch(e){}
      }
    }catch(e){ console.warn('EP V5 sync active arrays failed', e); }
  }
  


/* =========================================================
 * AI FUNCTIONS FUNCTION: refreshMyFromServer
 * ========================================================= */
async function refreshMyFromServer(){
    var mat = Array.isArray(window.EP_MY_MAT) ? window.EP_MY_MAT : readArr(LS_MY_MAT);
    var work = Array.isArray(window.EP_MY_WORK) ? window.EP_MY_WORK : readArr(LS_MY_WORK);
    try{
      if(typeof db !== 'undefined' && db && uid()){
        var doc = await db.collection('user_db').doc(uid()).get();
        if(doc.exists){
          var d = doc.data() || {};
          if(Array.isArray(d.matDB)) mat = d.matDB;
          if(Array.isArray(d.workDB)) work = d.workDB;
        }
      }
    }catch(e){ console.warn('EP V5 load my db failed', e); }
    setMyArrays(mat, work);
  }
  


/* =========================================================
 * AI FUNCTIONS FUNCTION: refreshServerFromServer
 * ========================================================= */
async function refreshServerFromServer(){
    var mat = Array.isArray(window.EP_GLOBAL_MAT) ? window.EP_GLOBAL_MAT : getServerFromCache('mat');
    var work = Array.isArray(window.EP_GLOBAL_WORK) ? window.EP_GLOBAL_WORK : getServerFromCache('work');
    try{
      if(typeof db !== 'undefined' && db){
        var doc = await db.collection('settings').doc('global_db').get();
        if(doc.exists){
          var d = doc.data() || {};
          mat = Array.isArray(d.matDB) ? d.matDB : [];
          work = Array.isArray(d.workDB) ? d.workDB : [];
          if(d.cleanMode || d.resetAt) try{ localStorage.setItem('ep_db_clean_mode_v1','1'); }catch(_e){}
        } else if(isAdmin()){
          await db.collection('settings').doc('global_db').set({matDB:mat || [], workDB:work || [], createdAt:new Date().toISOString()}, {merge:true});
        }
      }
    }catch(e){ console.warn('EP V5 load server db failed', e); }
    setServerArrays(mat, work);
  }
  


/* =========================================================
 * AI FUNCTIONS FUNCTION: renderReviewPage
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
 * AI FUNCTIONS FUNCTION: showReview
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
 * AI FUNCTIONS FUNCTION: aiFromImage
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
 * AI FUNCTIONS FUNCTION: aiFromText
 * ========================================================= */
async function aiFromText(txt,type){
    if(typeof window.epAskAI !== 'function') throw new Error('ИИ не подключён');
    showReadLoader('ИИ структурирует базу...', '🤖');
    var prompt = 'Приведи данные к базе электрика. Верни строго JSON массив объектов [{"n":"Имя позиции","c":"Категория","sc":"Подкатегория","p":123,"u":"шт"}]. Данные: ' + String(txt || '').slice(0,90000);
    var ans = await window.epAskAI(prompt, { maxTokens:8000 });
    var arr = [];
    try{ var m = String(ans || '').match(/\[[\s\S]*\]/); arr = JSON.parse(m ? m[0] : ans); }catch(e){ arr = []; }
    return jsonToItems(arr,type);
  }
  


/* =========================================================
 * AI FUNCTIONS FUNCTION: readDbFileV6
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
 * AI FUNCTIONS FUNCTION: syncMain
 * ========================================================= */
function syncMain(target){ try{ var use=target||scope(); window.matDB=(use==='global'?getServer('mat'):getMy('mat')); window.workDB=(use==='global'?getServer('work'):getMy('work')); try{matDB=window.matDB;workDB=window.workDB;}catch(e){} }catch(e){} }
  


/* =========================================================
 * AI FUNCTIONS FUNCTION: sendProposal
 * ========================================================= */
async function sendProposal(type,items,reason,onp){
    try{
      if(onp)onp(72,'Отправка заявки админу');
      if(typeof window.epSendServerProposal==='function'){ await window.epSendServerProposal(type,items,reason||'server_import_request'); return true; }
      if(typeof db!=='undefined'&&db){ await db.collection('db_proposals').add({type:type,items:items,reason:reason||'server_import_request',uid:uid(),userEmail:(window.appUser&&appUser.email)||'',createdAt:new Date().toISOString(),status:'new'}); return true; }
    }catch(e){ console.warn('EP V7 proposal failed',e); }
    return false;
  }
  


/* =========================================================
 * AI FUNCTIONS FUNCTION: reloadActiveDb
 * ========================================================= */
async function reloadActiveDb(){
    try{ syncMain(scope()); if(typeof window.epRefreshActiveDbNow==='function') await window.epRefreshActiveDbNow(true); }catch(e){ console.warn('EP V7 reload active db failed',e); }
    try{ syncMain(scope()); renderDbEditors(); }catch(e){}
    try{ if(typeof openMatCatalog==='function' && $('matCatModal') && $('matCatModal').style.display!=='none') openMatCatalog(); }catch(e){}
    try{ if(typeof openWorkCatalog==='function' && $('workModal') && $('workModal').style.display!=='none') openWorkCatalog(); }catch(e){}
  }

  


/* =========================================================
 * AI FUNCTIONS FUNCTION: tuneStaticBlocks
 * ========================================================= */
function tuneStaticBlocks(){
    renderPanel();
    var my=$('ep-scope-my-btn'), gl=$('ep-scope-global-btn'), st=$('ep-db-scope-status');
    if(my){ my.className=scope()==='my'?'btn-success':'btn-info'; my.textContent='👤 Моя база данных'; }
    if(gl){ gl.className=scope()==='global'?'btn-success':'btn-info'; gl.textContent='🌍 База сервера'; }
    if(st) st.innerHTML='Главный переключатель: <b>'+label()+'</b>. Отображение и расчёт идут только из выбранного источника.';
    var old=$('ep-db-ai-tools'); if(old) old.style.display='none';
    var clean=$('ep-clean-status-line'); if(clean) clean.textContent='Активная база: '+label()+'. Материалы: '+active('mat').length+', работы: '+active('work').length+'.';
    var addBtn=document.querySelector('#settModal button[onclick="addDbItem()"]');
    var addBlock=null;
    if(addBtn){ var x=addBtn.parentElement; while(x&&x.id!=='settModal'){ if((x.querySelector&&x.querySelector('#db-new-cat'))){ addBlock=x; break; } x=x.parentElement; } }
    if(addBlock){ addBlock.style.display=canEditActive()?'block':'none'; }
    if(addBtn){ addBtn.textContent=scope()==='global'?' + Добавить в базу сервера':' + Добавить в мою базу'; }
  }

  


/* =========================================================
 * AI FUNCTIONS FUNCTION: readDbFile
 * ========================================================= */
async function readDbFile(file,type,target){ showProgress('Импорт базы',5,'Старт'); var name=file.name||'', lower=name.toLowerCase(), items=[]; if(file.type&&file.type.indexOf('image/')===0){ hideProgress(); if(typeof window.epAskAI==='function' && typeof oldTrigger==='function'){ return oldTrigger(type); } return toast('Для фото нужен ИИ.'); } if(/\.json$/i.test(lower)){ var txt=await fileTextProgress(file,showProgress); showProgress('Импорт базы',55,'Разбор JSON'); items=jsonToItems(JSON.parse(txt),type); } else if(/\.(xlsx|xls)$/i.test(lower)){ if(!window.XLSX) throw new Error('Библиотека XLSX не загрузилась. Сохраните файл как CSV или JSON.'); var ab=await fileBufferProgress(file,showProgress); showProgress('Импорт базы',55,'Разбор Excel'); var wb=XLSX.read(ab,{type:'array'}), rows=[]; wb.SheetNames.forEach(function(sh){ rows=rows.concat(XLSX.utils.sheet_to_json(wb.Sheets[sh],{header:1,defval:''})); }); showProgress('Импорт базы',78,'Подготовка строк'); items=rowsToItems(rows,type); } else { var raw=await fileTextProgress(file,showProgress); showProgress('Импорт базы',60,'Разбор текста/CSV'); items=rowsToItems(csvRows(raw),type); }
    showProgress('Импорт базы',100,'Открываю проверку'); setTimeout(hideProgress,250); showReview(items,type,name,target); }
  


/* =========================================================
 * AI FUNCTIONS FUNCTION: currentEmail
 * ========================================================= */
function currentEmail(){ try{ return String((window.appUser&&appUser.email) || (fbUser()&&fbUser().email) || '').toLowerCase(); }catch(e){ return ''; } }
  


/* =========================================================
 * AI FUNCTIONS FUNCTION: isAdmin
 * ========================================================= */
function isAdmin(){
    try{
      var em=currentEmail();
      var ph=String((window.appUser&&appUser.phone)||'');
      return !!(window.appUser && appUser.role==='admin') || ADMIN_EMAILS.indexOf(em)>=0 || ADMIN_PHONES.indexOf(ph)>=0;
    }catch(e){ return false; }
  }
  


/* =========================================================
 * AI FUNCTIONS FUNCTION: firebaseHint
 * ========================================================= */
function firebaseHint(){
    var fbu=fbUser();
    if(!fbu) return 'Нет Firebase-входа. Серверная запись может быть запрещена правилами Firebase. Для админа лучше войти через Google-аккаунт администратора.';
    return 'Firebase: '+(fbu.email||fbu.uid)+'.';
  }
  


/* =========================================================
 * AI FUNCTIONS FUNCTION: explainErr
 * ========================================================= */
function explainErr(e){
    var msg=(e&&(e.message||e.code))?String(e.message||e.code):'неизвестная ошибка';
    if(/permission|Missing or insufficient/i.test(msg)) return 'Firebase запретил запись: Missing or insufficient permissions. Нужно настроить Firestore Rules или войти админом через Google.';
    return msg;
  }

  


/* =========================================================
 * AI FUNCTIONS FUNCTION: reloadFromRemoteCurrent
 * ========================================================= */
async function reloadFromRemoteCurrent(){
    try{
      if(!(typeof db!=='undefined'&&db)) return false;
      if(scope()==='global'){
        var gd=await db.collection('settings').doc('global_db').get();
        if(gd.exists){ var g=gd.data()||{}; setServer('mat',Array.isArray(g.matDB)?g.matDB:[]); setServer('work',Array.isArray(g.workDB)?g.workDB:[]); return true; }
      } else if(uid()){
        var ud=await db.collection('user_db').doc(uid()).get();
        if(ud.exists){ var u=ud.data()||{}; setMy('mat',Array.isArray(u.matDB)?u.matDB:getMy('mat')); setMy('work',Array.isArray(u.workDB)?u.workDB:getMy('work')); return true; }
      }
    }catch(e){ console.warn('EP V8 reload remote failed',e); }
    return false;
  }
  


/* =========================================================
 * AI FUNCTIONS FUNCTION: rerender
 * ========================================================= */
function rerender(){ try{ syncMain(scope()); if(typeof renderDbEditors==='function') renderDbEditors(); }catch(e){} try{ if(typeof rf==='function') rf(); }catch(e){} }
  


/* =========================================================
 * AI FUNCTIONS FUNCTION: currentUserLabel
 * ========================================================= */
function currentUserLabel(){ try{ var u=(firebase.auth&&firebase.auth().currentUser)||null; return (u&&(u.email||u.uid)) || (window.appUser&&(appUser.email||appUser.phone||appUser.uid)) || ''; }catch(e){ return (window.appUser&&(appUser.email||appUser.phone||appUser.uid)) || ''; } }
  


/* =========================================================
 * AI FUNCTIONS FUNCTION: explain
 * ========================================================= */
function explain(e){ var msg=(e&&(e.message||e.code))?String(e.message||e.code):String(e||'Ошибка'); if(/permission|insufficient/i.test(msg)) return 'Firebase запретил запись: Missing or insufficient permissions. Проверь вход админа через Google и Firestore Rules.'; return msg; }

  


/* =========================================================
 * AI FUNCTIONS FUNCTION: readGlobalDoc
 * ========================================================= */
async function readGlobalDoc(){
    if(!(typeof db!=='undefined'&&db)) throw new Error('Firebase db не подключён.');
    var snap=await db.collection('settings').doc('global_db').get();
    var data=snap.exists?(snap.data()||{}):{};
    return {matDB:Array.isArray(data.matDB)?data.matDB:[], workDB:Array.isArray(data.workDB)?data.workDB:[], raw:data};
  }
  


/* =========================================================
 * AI FUNCTIONS FUNCTION: saveGlobalImport
 * ========================================================= */
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
  


/* =========================================================
 * AI FUNCTIONS FUNCTION: saveMyImport
 * ========================================================= */
async function saveMyImport(type,items,replace){
    var arr=getMy(type); items.forEach(function(it,idx){ arr=upsert(arr,type,it,!!replace); if(idx%25===0) progress('Запись в мою базу',20+Math.min(40,idx/Math.max(1,items.length)*40),'Добавляю строки'); });
    setMy(type,arr); progress('Запись в мою базу',68,'Локально сохранено');
    if(typeof db!=='undefined'&&db&&uid()){
      await db.collection('user_db').doc(uid()).set({uid:uid(),masterName:(window.appUser&&(appUser.name||appUser.email||appUser.phone))||'',matDB:getMy('mat'),workDB:getMy('work'),created:true,updatedAt:new Date().toISOString()}, {merge:true});
      progress('Запись в мою базу',90,'Сервер подтвердил');
    }
    return getMy(type).length;
  }
  


/* =========================================================
 * AI FUNCTIONS FUNCTION: sendServerProposal
 * ========================================================= */
async function sendServerProposal(type,items){
    if(!(typeof db!=='undefined'&&db)) throw new Error('Firebase db не подключён.');
    progress('Отправляю заявку админу',60,'db_proposals');
    await db.collection('db_proposals').add({type:type,items:items.map(clone),reason:'import_to_server',target:'server_db',uid:uid(),masterName:(window.appUser&&(appUser.name||appUser.email||appUser.phone))||'',userEmail:currentUserLabel(),status:'pending',createdAt:new Date().toISOString()});
    return true;
  }
  


/* =========================================================
 * AI FUNCTIONS FUNCTION: showReviewV9
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
 * AI FUNCTIONS FUNCTION: provider
 * ========================================================= */
function provider(){
    try{ var p=(window.EP_AI_CONFIG&&window.EP_AI_CONFIG.provider)||safeGet('ep_ai_provider_v1','gemini'); return p==='openai'?'openai':'gemini'; }catch(e){ return 'gemini'; }
  }
  


/* =========================================================
 * AI FUNCTIONS FUNCTION: keyForProvider
 * ========================================================= */
function keyForProvider(p){
    try{
      if(p==='openai') return (window.EP_AI_CONFIG&&window.EP_AI_CONFIG.openaiKey)||safeGet('ep_openai_key_v1','');
      return (window.EP_AI_CONFIG&&window.EP_AI_CONFIG.geminiKey)||(typeof GEMINI_API_KEY!=='undefined'?GEMINI_API_KEY:'')||safeGet('gemini_key_v31','');
    }catch(e){ return ''; }
  }
  


/* =========================================================
 * AI FUNCTIONS FUNCTION: openAiModel
 * ========================================================= */
function openAiModel(){ try{ return (window.EP_AI_CONFIG&&window.EP_AI_CONFIG.openaiModel)||safeGet('ep_openai_model_v1','gpt-4o-mini')||'gpt-4o-mini'; }catch(e){ return 'gpt-4o-mini'; } }
  


/* =========================================================
 * AI FUNCTIONS FUNCTION: extractTextFromOpenAI
 * ========================================================= */
function extractTextFromOpenAI(data){
    if(data && data.output_text) return data.output_text;
    var out='';
    ((data&&data.output)||[]).forEach(function(item){ ((item&&item.content)||[]).forEach(function(c){ if(c&&c.text) out+=c.text; if(c&&c.type==='output_text'&&c.text) out+=c.text; }); });
    return out;
  }
  


/* =========================================================
 * AI FUNCTIONS FUNCTION: askOpenAI
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
 * AI FUNCTIONS FUNCTION: askGemini
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
 * AI FUNCTIONS FUNCTION: normItem
 * ========================================================= */
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
  


/* =========================================================
 * AI FUNCTIONS FUNCTION: importPrompt
 * ========================================================= */
function importPrompt(type, kind){
    return 'Ты профессионально распознаёшь русские прайсы, счета, сметы и таблицы электромонтажных '+(type==='work'?'работ':'материалов')+'. '+
      'Источник: '+kind+'. Извлеки ВСЕ строки с позициями. Верни ТОЛЬКО JSON массив объектов без текста вокруг. '+
      'Формат строго: [{"n":"Имя позиции","c":"Категория","sc":"Подкатегория","p":123,"u":"шт"}]. '+
      'n — полное наименование, не артикул и не номер строки. p — цена за единицу, не итоговая сумма; если цены нет p=0. '+
      'u — единица: шт, м, м.п., упак, компл, кг, л. c/sc определи сам по электрике. Не возвращай пустой массив, если видны позиции.';
  }
  


/* =========================================================
 * AI FUNCTIONS FUNCTION: aiFromImageFile
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
 * AI FUNCTIONS FUNCTION: aiFromPdfFile
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
 * AI FUNCTIONS FUNCTION: patchLabels
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
 * AI FUNCTIONS FUNCTION: explainServerEdit
 * ========================================================= */
function explainServerEdit(){ return '🌍 Базу сервера меняем только через Настройки → Админ панель → База сервера. Здесь сервер открыт для просмотра/выбора, чтобы случайно не залить личный импорт в глобальную базу.'; }

  


/* =========================================================
 * AI FUNCTIONS FUNCTION: patchDbUi
 * ========================================================= */
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

  


/* =========================================================
 * AI FUNCTIONS FUNCTION: compressImageDataUrl
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
 * AI FUNCTIONS FUNCTION: timeoutPromise
 * ========================================================= */
function timeoutPromise(ms, label){
    return new Promise(function(_,reject){
      setTimeout(function(){ reject(new Error(label || 'ИИ долго не отвечает. Попробуй фото крупнее/светлее, меньший PDF или другой ИИ-провайдер.')); }, ms);
    });
  }
  


/* =========================================================
 * AI FUNCTIONS FUNCTION: patchShieldButton
 * ========================================================= */
function patchShieldButton(){
    var base = window.epGenerateShieldFixed || window.generateCascadePanel;
    if(typeof base==='function' && !base.__ep_v12_wrapped){
      var wrapped=function(){
        var r=base.apply(this, arguments);
        setTimeout(function(){ normalizeCurrentEstimate(); try{ if(typeof renderMainTable==='function') renderMainTable(); }catch(e){} },60);
        return r;
      };
      wrapped.__ep_v12_wrapped=true;
      window.epGenerateShieldFixed=wrapped;
      window.generateCascadePanel=wrapped;
      try{ generateCascadePanel=wrapped; }catch(e){}
    }
    Array.prototype.forEach.call(document.querySelectorAll('button'), function(btn){
      if((btn.textContent||'').indexOf('Сгенерировать щит')>=0) btn.onclick=window.generateCascadePanel;
    });
  }

  


/* =========================================================
 * AI FUNCTIONS FUNCTION: epV16GenerateCascadePanel
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
 * AI FUNCTIONS FUNCTION: getAssignV16
 * ========================================================= */
function getAssignV16(it){
    if(window.epV15GetAssignments) return window.epV15GetAssignments(it);
    var out=[]; function add(v){v=String(v||'').trim(); if(v && !/позиция щита|общая \/ вводная|назначение не указано/i.test(v) && out.indexOf(v)<0) out.push(v);}
    if(it){ if(Array.isArray(it.epAssignments)) it.epAssignments.forEach(add); if(Array.isArray(it.epMergedDetails)) it.epMergedDetails.forEach(add); add(it.epAssignment); if(it.dbMeta) add(it.dbMeta.assignment); }
    return out;
  }
  


/* =========================================================
 * AI FUNCTIONS FUNCTION: showDetailsV16
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
 * AI FUNCTIONS FUNCTION: assignmentsOf
 * ========================================================= */
function assignmentsOf(it){
    var out=[]; function add(v){ v=clean(v); if(v && !/^(позиция щита|общая|общая \/ вводная|назначение не указано)/i.test(v) && out.indexOf(v)<0) out.push(v); }
    if(it){ if(Array.isArray(it.epAssignments)) it.epAssignments.forEach(add); if(Array.isArray(it.epMergedDetails)) it.epMergedDetails.forEach(add); add(it.epAssignment); if(it.dbMeta) add(it.dbMeta.assignment); }
    if(out.length) return out;
    var n=txt(it&&it.n), raw=txt(it&&it.epRawLabel), k=txt(it&&it.dbMeta&&it.dbMeta.kind), q=Math.max(1,Number(it&&it.q)||1), lines=lineConfig();
    if(/вводн|input_breaker/i.test(n+' '+raw+' '+k)) return ['Вводной аппарат щита'];
    if(/10\s*мА/i.test(n+' '+raw) && /узо|диф/i.test(n+' '+raw)) return ['Влажные зоны / защита 10 мА: '+lines.filter(function(x){return x.group==='wet';}).map(function(x){return x.name;}).join(', ')].filter(function(x){return !/:\s*$/.test(x);});
    if(/30\s*мА/i.test(n+' '+raw) && /узо|диф/i.test(n+' '+raw)) return ['Группа защиты 30 мА: силовые/освещение/климат/неотключаемые линии'];
    var nom=nominalOf(it); if(nom){ var list=lines.filter(function(x){return x.nominal===nom;}).slice(0,q).map(function(x){return x.name;}); if(list.length) return list; }
    return [];
  }
  


/* =========================================================
 * AI FUNCTIONS FUNCTION: syncActiveToMain
 * ========================================================= */
function syncActiveToMain(src){
    src=src||scope();
    try{
      window.matDB = getArr('mat',src);
      window.workDB = getArr('work',src);
      try{ matDB = window.matDB; workDB = window.workDB; }catch(e){}
    }catch(e){}
  }
  


/* =========================================================
 * AI FUNCTIONS FUNCTION: saveArr
 * ========================================================= */
async function saveArr(type,arr){
    var src=scope(); type=type==='work'?'work':'mat'; arr=unique(arr,type);
    if(src==='global'){
      if(!isAdmin()) { toast('Сервер редактирует только админ'); return false; }
      var c=getServerCache(); if(type==='mat') c.matDB=arr; else c.workDB=arr;
      window.EP_GLOBAL_MAT=c.matDB; window.EP_GLOBAL_WORK=c.workDB;
      window.EP_FORCE_GLOBAL={matDB:c.matDB,workDB:c.workDB};
      window.EP_ULTIMATE_DB_CACHE={matDB:c.matDB,workDB:c.workDB,ts:Date.now()};
      window.EP_GLOBAL_DB_VISIBLE_CACHE={matDB:c.matDB,workDB:c.workDB,ts:Date.now()};
      setObjLS(LS_SERVER_CACHE,{matDB:c.matDB,workDB:c.workDB,ts:Date.now()});
      syncActiveToMain('global');
      epV18SetStatus('upload','запись на сервер');
      try{ if(typeof db!=='undefined' && db){ await db.collection('settings').doc('global_db').set({matDB:c.matDB,workDB:c.workDB,updatedAt:new Date().toISOString()},{merge:true}); } }
      catch(e){ epV18SetStatus('error','ошибка сервера'); toast('Ошибка записи сервера: '+(e.message||e)); return false; }
      epV18SetStatus('ok','V18 активна'); return true;
    } else {
      if(type==='mat'){ window.EP_MY_MAT=arr; setLS(LS_MY_MAT,arr); }
      else { window.EP_MY_WORK=arr; setLS(LS_MY_WORK,arr); }
      try{ window.userMatDB=getArr('mat','my'); window.userWorkDB=getArr('work','my'); localStorage.setItem('ep_master_db_created_v1','1'); }catch(e){}
      syncActiveToMain('my');
      epV18SetStatus('upload','запись на сервер');
      try{ if(typeof db!=='undefined' && db && uid()){ await db.collection('user_db').doc(uid()).set({uid:uid(),masterName:(window.appUser&&(appUser.name||appUser.email))||'',matDB:getArr('mat','my'),workDB:getArr('work','my'),created:true,updatedAt:new Date().toISOString()},{merge:true}); } }
      catch(e){ toast('Локально сохранено, сервер личной базы отказал: '+(e.message||e)); }
      epV18SetStatus('ok','V18 активна'); return true;
    }
  }

  


/* =========================================================
 * AI FUNCTIONS FUNCTION: autoName
 * ========================================================= */
function autoName(nominal,brand){
    var hit=dbFindAuto(nominal,brand), br=brandRu(brand); var amp=String(nominal||'C16').replace(/[^0-9]/g,''); var curve=String(nominal||'C16').replace(/[^A-Za-zА-Яа-я]/g,'').toUpperCase().charAt(0)||'C';
    if(hit && /\(([^)]+)\)/.test(hit.n||'')){ var model=(hit.n.match(/\(([^)]+)\)/)||[])[1]; return curve+amp+' 1P '+model.replace(/^IEK/i,'ИЭК'); }
    if(String(brand||'').toUpperCase()==='ABB') return curve+amp+' 1P ABB SH201';
    return curve+amp+' 1P '+br+' ВА47-29';
  }
  


/* =========================================================
 * AI FUNCTIONS FUNCTION: rcdName
 * ========================================================= */
function rcdName(leak,brand,kind,rcdType){ var hit=dbFindRcd(leak,brand,kind); var br=brandRu(brand); if(hit && /\(([^)]+)\)/.test(hit.n||'')){ var model=(hit.n.match(/\(([^)]+)\)/)||[])[1].replace(/^IEK/i,'ИЭК'); return kind+' 2P 40A '+leak+'мА тип '+(rcdType||'A')+' '+model; } return kind+' 2P 40A '+leak+'мА тип '+(rcdType||'A')+' '+br+(br==='ИЭК'?' ВД1-63':''); }
  


/* =========================================================
 * AI FUNCTIONS FUNCTION: makeItem
 * ========================================================= */
function makeItem(n,q,p,type,meta,assign){ var it=Object.assign({n:n,q:Number(q)||1,p:money(p),u:(meta&&meta.unit)||'шт',type:type||'mat',tag:'shield'},meta||{}); if(assign){ it.epAssignment=assign; it.epAssignments=[assign]; it.epMergedDetails=[assign]; if(!it.dbMeta) it.dbMeta={}; it.dbMeta.assignment=assign; } return it; }
  


/* =========================================================
 * AI FUNCTIONS FUNCTION: mergeAssignments
 * ========================================================= */
function mergeAssignments(rec,it){ var arr=rec.epAssignments||[]; function add(v){ v=clean(v); if(v && arr.indexOf(v)<0) arr.push(v); } if(Array.isArray(it.epAssignments)) it.epAssignments.forEach(add); if(Array.isArray(it.epMergedDetails)) it.epMergedDetails.forEach(add); add(it.epAssignment); if(it.dbMeta) add(it.dbMeta.assignment); rec.epAssignments=arr; rec.epMergedDetails=arr.slice(); rec.epAssignment=arr[0]||rec.epAssignment||''; if(!rec.dbMeta) rec.dbMeta={}; rec.dbMeta.assignment=rec.epAssignment; }
  


/* =========================================================
 * AI FUNCTIONS FUNCTION: directAddShield
 * ========================================================= */
function directAddShield(items){
    var map={},out=[];
    (items||[]).forEach(function(src){ if(!src || !src.n) return; var it=clone(src); it.tag='shield'; var key=[it.tag,it.type||'',it.n||'',Number(it.p)||0,it.u||'шт'].join('|'); var rec=map[key]; if(!rec){ rec=Object.assign({},it,{q:0,epAssignments:[],epMergedDetails:[]}); map[key]=rec; out.push(rec); } rec.q += Number(it.q)||0; mergeAssignments(rec,it); });
    try{ currentEstimate=(Array.isArray(currentEstimate)?currentEstimate:[]).filter(function(it){ return it.tag!=='shield' && it.tag!=='shield_info'; }).concat(out); window.currentEstimate=currentEstimate; }catch(e){ window.currentEstimate=out; }
    try{ localStorage.setItem('est_v31',JSON.stringify(currentEstimate)); }catch(e){}
  }
  


/* =========================================================
 * AI FUNCTIONS FUNCTION: renderMainDirect
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
 * AI FUNCTIONS FUNCTION: assigns
 * ========================================================= */
function assigns(it){ var out=[]; function add(v){ v=clean(v); if(v && !/позиция щита|назначение не указано/i.test(v) && out.indexOf(v)<0) out.push(v); } if(it){ if(Array.isArray(it.epAssignments)) it.epAssignments.forEach(add); if(Array.isArray(it.epMergedDetails)) it.epMergedDetails.forEach(add); add(it.epAssignment); if(it.dbMeta) add(it.dbMeta.assignment); } return out; }
  


/* =========================================================
 * AI FUNCTIONS FUNCTION: addShieldToEstimate
 * ========================================================= */
function addShieldToEstimate(items){
    // Use original addAuto if possible, because it also syncs totals and storage. Items are already aggregated by V19.
    try{ if(typeof addAuto==='function'){ addAuto(items,'shield'); return; } }catch(e){}
    try{ window.currentEstimate=(Array.isArray(window.currentEstimate)?window.currentEstimate:[]).filter(function(it){return it.tag!=='shield'&&it.tag!=='shield_info';}).concat(items); currentEstimate=window.currentEstimate; if(typeof renderMainTable==='function') renderMainTable(); }catch(e){}
  }
  


/* =========================================================
 * AI FUNCTIONS FUNCTION: getAssigns
 * ========================================================= */
function getAssigns(it){ var out=[]; function add(v){ v=String(v||'').trim(); if(v && !/позиция щита|назначение не указано/i.test(v) && out.indexOf(v)<0) out.push(v); } if(!it) return out; if(Array.isArray(it.epAssignments)) it.epAssignments.forEach(add); if(Array.isArray(it.epMergedDetails)) it.epMergedDetails.forEach(add); add(it.epAssignment); if(it.dbMeta) add(it.dbMeta.assignment); return out; }
  


/* =========================================================
 * AI FUNCTIONS FUNCTION: patchButtons
 * ========================================================= */
function patchButtons(){ try{ Array.prototype.forEach.call(document.querySelectorAll('button'),function(b){ var t=b.textContent||''; if(t.indexOf('Сгенерировать щит')>=0) b.onclick=window.epV19GenerateShield; if(t.indexOf('Детализация')>=0) b.onclick=window.epV19ShowDetails; }); }catch(e){} }
  


/* =========================================================
 * AI FUNCTIONS FUNCTION: modelFromDbName
 * ========================================================= */
function modelFromDbName(n){ var m=text(n).match(/\(([^)]+)\)/); return m ? clean(m[1]).replace(/^IEK\s*/i,'ИЭК ') : ''; }
  


/* =========================================================
 * AI FUNCTIONS FUNCTION: item
 * ========================================================= */
function item(n,q,p,type,meta,assigns){
    var a=[]; if(Array.isArray(assigns)) a=assigns.map(clean).filter(Boolean); else if(assigns) a=[clean(assigns)].filter(Boolean);
    var it=Object.assign({n:n,q:Number(q)||1,p:money(p),u:(meta&&meta.unit)||'шт',type:type||'mat',tag:'shield'},meta||{});
    if(a.length){ it.epAssignment=a[0]; it.epAssignments=a.slice(); it.epMergedDetails=a.slice(); it.assignment=a[0]; it.dbMeta=Object.assign({},it.dbMeta||{}, {assignment:a[0]}); }
    return it;
  }
  


/* =========================================================
 * AI FUNCTIONS FUNCTION: addUniqueAssign
 * ========================================================= */
function addUniqueAssign(rec,arr){
    rec.epAssignments=rec.epAssignments||[]; rec.epMergedDetails=rec.epMergedDetails||[];
    (arr||[]).forEach(function(v){ v=clean(v); if(v && !/позиция щита|назначение не указано/i.test(v) && rec.epAssignments.indexOf(v)<0){ rec.epAssignments.push(v); rec.epMergedDetails.push(v); } });
    rec.epAssignment=rec.epAssignments[0]||rec.epAssignment||''; rec.dbMeta=Object.assign({},rec.dbMeta||{}, {assignment:rec.epAssignment});
  }
  


/* =========================================================
 * AI FUNCTIONS FUNCTION: directAdd
 * ========================================================= */
function directAdd(items){
    var map={}, out=[];
    (items||[]).forEach(function(src){ if(!src||!src.n) return; var it=Object.assign({},src,{tag:src.tag||'shield'}); var k=[it.tag,it.type,it.n,it.p,it.u].join('|'); var rec=map[k]; if(!rec){ rec=Object.assign({},it,{q:0,epAssignments:[],epMergedDetails:[]}); map[k]=rec; out.push(rec); } rec.q += Number(it.q)||1; addUniqueAssign(rec,[].concat(it.epAssignments||[],it.epMergedDetails||[],it.epAssignment||[])); });
    try{ currentEstimate=(Array.isArray(currentEstimate)?currentEstimate:[]).filter(function(x){ return x && x.tag!=='shield' && x.tag!=='shield_info'; }).concat(out); window.currentEstimate=currentEstimate; }catch(e){ window.currentEstimate=(window.currentEstimate||[]).filter(function(x){ return x && x.tag!=='shield' && x.tag!=='shield_info'; }).concat(out); }
    try{ if(typeof renderMainTable==='function') renderMainTable(); else if(typeof renderMainDirect==='function') renderMainDirect(); }catch(e){}
    try{ if(typeof syncDraft==='function') syncDraft(); }catch(e){}
  }
  


/* =========================================================
 * AI FUNCTIONS FUNCTION: ensurePanel
 * ========================================================= */
function ensurePanel(){
    hideOldBulk();
    var host=visibleHost(); if(!host) return;
    var box=$('ep-v21-bulk-box');
    if(!box){ host.insertAdjacentHTML('beforebegin',panelHtml()); fillSelectors(true); }
    else if(!box.parentNode || !document.body.contains(box)){ host.insertAdjacentHTML('beforebegin',panelHtml()); fillSelectors(true); }
    ensureChecks(); hideOldBulk();
  }
  

