/*
 * Electric PRO Refactor
 * Module: 02-shield-configurator.js
 * V39 SAFE: Shield Configurator.
 *
 * Важно:
 * - модуль пересобран безопасно;
 * - переносим только полноценные function / async function;
 * - каждый блок проверяется через node --check;
 * - 00-core.js временно остаётся стабильным runtime.
 */

console.log("02-shield-configurator.js V39 SAFE loaded");



/* =========================================================
 * SHIELD CONFIGURATOR FUNCTION: renderMainTable
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
 * SHIELD CONFIGURATOR FUNCTION: confirmQtyAdd
 * ========================================================= */
function confirmQtyAdd() { 
    let q = Number(document.getElementById('qty-input').value); 
    if(q > 0) { addAuto([{...pendingAdd.item, q: q, type: pendingAdd.type}], 'man_'+Date.now()); } 
    closeModal('qtyPromptModal'); showToast("Добавлено!");
}




/* =========================================================
 * SHIELD CONFIGURATOR FUNCTION: addAuto
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
 * SHIELD CONFIGURATOR FUNCTION: upUI
 * ========================================================= */
function upUI() { 
    ['soc', 'sw', 'pass', 'cross', 'tv', 'tpol'].forEach(k => {
        let el = document.getElementById('v-'+k);
        if(el) el.innerText = window['st_'+k];
    });
    
    st_p = st_soc + st_sw + st_pass + st_cross + st_tv + st_tpol;
    let autoEl = document.getElementById('auto-posts');
    if(autoEl) autoEl.innerText = st_p || 1; 
    if(st_p === 0) st_p = 1; 
    
    let qEl = document.getElementById('v-q');
    if(qEl) qEl.innerText = st_q; 
}




/* =========================================================
 * SHIELD CONFIGURATOR FUNCTION: rfPool
 * ========================================================= */
function rfPool() { 
    document.getElementById('pool-disp').innerHTML = pool.map((g,i) => `<div style="display:flex; justify-content:space-between; padding:8px; border-bottom:1px solid var(--border);"><b>${g.p}п на ${g.h}см (x${g.q}) [${g.podr}]</b> <button onclick="pool.splice(${i},1);rfPool();" style="width:auto; margin:0; background:none; color:red; font-size:16px;">✕</button></div>`).join(""); 
}




/* =========================================================
 * SHIELD CONFIGURATOR FUNCTION: modV
 * ========================================================= */
function modV(id, val) { cfg[id] = Math.max(0, (cfg[id] || 0) + val); const el = document.getElementById('v-'+id); if(el) el.innerText = cfg[id]; }




/* =========================================================
 * SHIELD CONFIGURATOR FUNCTION: populateShieldExtras
 * ========================================================= */
function populateShieldExtras() {
    let sel = document.getElementById('cfg-extra-db');
    if(!sel) return;
    let html = '<option value="">-- Выбрать из базы --</option>';
    matDB.forEach(m => {
        if(m.c === 'Автоматика' || m.c === 'Щитовое') {
            html += `<option value="${m.id}">${m.n} (${m.p} ₽)</option>`;
        }
    });
    sel.innerHTML = html;
}




/* =========================================================
 * SHIELD CONFIGURATOR FUNCTION: addExtraToShieldConfig
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
 * SHIELD CONFIGURATOR FUNCTION: renderShieldExtras
 * ========================================================= */
function renderShieldExtras() {
    document.getElementById('shield-extras-list').innerHTML = currentShieldExtras.map((ex, i) =>
        `<div style="display:flex; justify-content:space-between; font-size:11px; border-bottom:1px dashed rgba(0,0,0,0.1); padding:4px;"><span>${ex.n} <b style="color:var(--primary);">(x${ex.q})</b></span><span style="color:red; font-size:16px; font-weight:bold; cursor:pointer;" onclick="currentShieldExtras.splice(${i},1); renderShieldExtras();">✕</span></div>`
    ).join('');
}



/* =========================================================
 * SHIELD CONFIGURATOR FUNCTION: epV15BrandRu
 * ========================================================= */
function epV15BrandRu(v) {
    const s = String(v || '').toUpperCase();
    if (s.includes('IEK') || s.includes('ИЭК')) return 'ИЭК';
    if (s.includes('ABB')) return 'ABB';
    if (s.includes('SCHNEIDER') || s.includes('ШНАЙДЕР')) return 'Schneider';
    if (s.includes('LEGRAND') || s.includes('ЛЕГРАН')) return 'Legrand';
    if (s.includes('EKF')) return 'EKF';
    if (s.includes('DEKRAFT')) return 'DEKraft';
    return String(v || '').trim() || 'ИЭК';
}



/* =========================================================
 * SHIELD CONFIGURATOR FUNCTION: epV15BrandCode
 * ========================================================= */
function epV15BrandCode(v) {
    const s = String(v || '').toUpperCase();
    if (s.includes('ИЭК')) return 'IEK';
    if (s.includes('IEK')) return 'IEK';
    if (s.includes('ABB')) return 'ABB';
    if (s.includes('SCHNEIDER')) return 'Schneider';
    if (s.includes('LEGRAND')) return 'Legrand';
    if (s.includes('EKF')) return 'EKF';
    return String(v || '').trim();
}



/* =========================================================
 * SHIELD CONFIGURATOR FUNCTION: epV15CleanForName
 * ========================================================= */
function epV15CleanForName(s) { return String(s || '').replace(/\s+/g,' ').trim(); }



/* =========================================================
 * SHIELD CONFIGURATOR FUNCTION: epV15DetectModel
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
 * SHIELD CONFIGURATOR FUNCTION: epV15DetectNominal
 * ========================================================= */
function epV15DetectNominal(src, meta) {
    const raw = [meta && meta.nominal, meta && meta.rawLabel, src].join(' ');
    let m = String(raw || '').match(/\b([ABCDАВСД])\s*([0-9]{1,3})\b/iu);
    if (m) {
        const c = String(m[1]).toUpperCase().replace('А','A').replace('В','B').replace('С','C').replace('Д','D');
        return c + m[2];
    }
    // Не путать модель ВА47-29 с номиналом A47.
    return '';
}



/* =========================================================
 * SHIELD CONFIGURATOR FUNCTION: epV15DetectPoles
 * ========================================================= */
function epV15DetectPoles(src, meta) {
    if (meta && meta.poles) return meta.poles;
    const s = String(src || '');
    let m = s.match(/\b(1P\+N|1P|2P|3P|4P|1Р\+N|1Р|2Р|3Р|4Р)\b/iu);
    if (m) return String(m[1]).replace(/Р/g,'P').toUpperCase();
    return '';
}



/* =========================================================
 * SHIELD CONFIGURATOR FUNCTION: epV15AmpFromNominal
 * ========================================================= */
function epV15AmpFromNominal(n) { const m=String(n||'').match(/(\d{1,3})/); return m?Number(m[1]):0; }



/* =========================================================
 * SHIELD CONFIGURATOR FUNCTION: epV15FormatAutoName
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
 * SHIELD CONFIGURATOR FUNCTION: epV15DetectLeakage
 * ========================================================= */
function epV15DetectLeakage(src, meta) {
    if (meta && meta.leakage) return Number(meta.leakage);
    const m = String(src || '').match(/(10|30|100|300)\s*м\s*а/iu);
    return m ? Number(m[1]) : 0;
}



/* =========================================================
 * SHIELD CONFIGURATOR FUNCTION: epV15FormatRcdName
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
 * SHIELD CONFIGURATOR FUNCTION: epV15DisplayMaterialName
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
 * SHIELD CONFIGURATOR FUNCTION: epV15MergeAssignments
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
 * SHIELD CONFIGURATOR FUNCTION: epMat
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
 * SHIELD CONFIGURATOR FUNCTION: epWork
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
 * SHIELD CONFIGURATOR FUNCTION: epAutoPrice
 * ========================================================= */
function epAutoPrice(brand) { return brand === 'ABB' ? 350 : 155; }



/* =========================================================
 * SHIELD CONFIGURATOR FUNCTION: epDifPrice
 * ========================================================= */
function epDifPrice(brand) { return brand === 'ABB' ? 4500 : 3600; }




/* =========================================================
 * SHIELD CONFIGURATOR FUNCTION: generateCascadePanel
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
 * SHIELD CONFIGURATOR FUNCTION: groupAssignment
 * ========================================================= */
function groupAssignment(group, leakage) {
        const ls = lines.filter(l => l.group === group).map(l => l.name);
        const head = group === 'wet' ? 'Влажные зоны / защита 10 мА' : (groupNames[group] || group);
        return ls.length ? `${head}: ${ls.join(', ')}` : head;
    }
    


/* =========================================================
 * SHIELD CONFIGURATOR FUNCTION: addProtection
 * ========================================================= */
function addProtection(group, mode) {
        const leakage = group === 'wet' ? 10 : 30;
        const kind = mode || (protectionType === 'dif_auto' ? 'ДИФ' : 'УЗО');
        protectionDevices.push({ group, kind, leakage, rcdType, modules: 2, assignment: groupAssignment(group, leakage) });
        if (group === 'wet' && leakage !== 10) warnings.push('Влажные зоны должны быть 10 мА');
    }
    


/* =========================================================
 * SHIELD CONFIGURATOR FUNCTION: runAiCheck
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
 * SHIELD CONFIGURATOR FUNCTION: showPreview
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
 * SHIELD CONFIGURATOR FUNCTION: saveLogic
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
 * SHIELD CONFIGURATOR FUNCTION: renderLogicUI
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
 * SHIELD CONFIGURATOR FUNCTION: doRecalculate
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
 * SHIELD CONFIGURATOR FUNCTION: listenForApprovals
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
 * SHIELD CONFIGURATOR FUNCTION: renderAdminUsers
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
 * SHIELD CONFIGURATOR FUNCTION: epAddBetaLabels
 * ========================================================= */
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

    


/* =========================================================
 * SHIELD CONFIGURATOR FUNCTION: epPatchSettingsUI
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
 * SHIELD CONFIGURATOR FUNCTION: epLoadAiConfigFromServer
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
 * SHIELD CONFIGURATOR FUNCTION: epInferCategory
 * ========================================================= */
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


    


/* =========================================================
 * SHIELD CONFIGURATOR FUNCTION: epInferSubcategory
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
 * SHIELD CONFIGURATOR FUNCTION: epAiNormalizeImage
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
 * SHIELD CONFIGURATOR FUNCTION: epShowDbReview
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
 * SHIELD CONFIGURATOR FUNCTION: epInsertAdminProposalBox
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
 * SHIELD CONFIGURATOR FUNCTION: epRenderGroupedList
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
 * SHIELD CONFIGURATOR FUNCTION: epEnsureProposalBox
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
 * SHIELD CONFIGURATOR FUNCTION: getCfgCount
 * ========================================================= */
function getCfgCount(key, id, def){
    try { if (window.cfg && Number.isFinite(Number(window.cfg[key]))) return Number(window.cfg[key]); } catch(e){}
    var el = qs(id || ('v-'+key));
    if (el) return toNum(el.textContent || el.value, def || 0);
    return def || 0;
  }

  


/* =========================================================
 * SHIELD CONFIGURATOR FUNCTION: epMoveShieldSettingsIntoDetails
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
 * SHIELD CONFIGURATOR FUNCTION: epMatGroupName
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
 * SHIELD CONFIGURATOR FUNCTION: epNormalizeMaterialsDb
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
 * SHIELD CONFIGURATOR FUNCTION: fixArr
 * ========================================================= */
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
    


/* =========================================================
 * SHIELD CONFIGURATOR FUNCTION: epRenderGrouped
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
 * SHIELD CONFIGURATOR FUNCTION: epPatchDbRenderers
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
 * SHIELD CONFIGURATOR FUNCTION: autoPrice
 * ========================================================= */
function autoPrice(){ return bAuto === 'ABB' ? 350 : 155; }
      


/* =========================================================
 * SHIELD CONFIGURATOR FUNCTION: difPrice
 * ========================================================= */
function difPrice(){ return bAuto === 'ABB' ? 4500 : 3600; }
      


/* =========================================================
 * SHIELD CONFIGURATOR FUNCTION: epPatchGenerateButton
 * ========================================================= */
function epPatchGenerateButton(){
    window.generateCascadePanel = window.epGenerateShieldFixed;
    Array.from(document.querySelectorAll('button')).forEach(function(btn){ if((btn.textContent||'').includes('Сгенерировать щит')) btn.onclick = window.epGenerateShieldFixed; });
  }

  


/* =========================================================
 * SHIELD CONFIGURATOR FUNCTION: normalizeMaterialDb
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
 * SHIELD CONFIGURATOR FUNCTION: renderItem
 * ========================================================= */
function renderItem(it,type){
    const id = String(it.id || '');
    const meta = [getGroup(it), it.brand, it.nominal, it.curve, it.rcdType, it.leakage].filter(Boolean).join(' • ');
    const btnColor = type==='work' ? 'background:var(--orange);' : '';
    return '<div class="mat-item"><div style="flex:1;"><div class="ep-db-item-title">'+safe(it.n || 'Позиция')+'</div><div class="ep-db-item-meta">'+safe(meta)+' '+safe(Number(it.p)||0)+' ₽ / '+safe(it.u || 'шт')+'</div></div><button class="mat-add-btn" style="'+btnColor+'width:auto;margin:0;" onclick="promptAdd(\''+safe(id)+'\', \''+type+'\')">+ Добавить</button></div>';
  }
  


/* =========================================================
 * SHIELD CONFIGURATOR FUNCTION: lookupKey
 * ========================================================= */
function lookupKey(type, meta, label){
    meta = meta || {};
    const parts = [type, meta.kind||'', meta.brand||detectBrand(label)||'', meta.nominal||detectNominal(label)||'', meta.curve||'', meta.poles||'', meta.leakage||'', meta.rcdType||'', meta.modules||''];
    return parts.map(x=>String(x||'').trim()).join('|');
  }
  


/* =========================================================
 * SHIELD CONFIGURATOR FUNCTION: reqName
 * ========================================================= */
function reqName(label, meta){
    meta = meta || {};
    const brand = meta.brand || detectBrand(label);
    const nominal = meta.nominal || detectNominal(label);
    const kind = String(meta.kind || '').toLowerCase();
    if(kind.includes('automatic') || kind.includes('breaker') || /^c\d+/i.test(nominal)) return 'Автомат '+(nominal||'')+(brand?' '+brand:'');
    if(kind.includes('dif') || /диф/i.test(label)) return 'ДИФ '+(meta.leakage?meta.leakage+'мА ':'')+(meta.rcdType||'')+(brand?' '+brand:'').trim();
    if(kind.includes('uzo') || /узо/i.test(label)) return 'УЗО '+(meta.leakage?meta.leakage+'мА ':'')+(meta.rcdType||'')+(brand?' '+brand:'').trim();
    return String(label||'Позиция').replace(/\s+—\s+.*$/,'').replace(/\s*\[[^\]]+\]\s*—\s*добавить в БД/i,'').trim();
  }
  


/* =========================================================
 * SHIELD CONFIGURATOR FUNCTION: smartFindMat
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
 * SHIELD CONFIGURATOR FUNCTION: canonicalName
 * ========================================================= */
function canonicalName(it){
    let n = String(it.n || '').replace(/^⚠️\s*/,'').replace(/\s*\[[^\]]+\]\s*—\s*добавить в БД/i,'').trim();
    const brand = detectBrand(n);
    const nominal = detectNominal(n);
    if(/автомат/i.test(n) && nominal) return 'Автомат '+nominal+(brand?' '+brand:'');
    if(/диф/i.test(n)){ const leak=(n.match(/(10|30|100|300)\s*мА/i)||[])[1]; const typ=(n.match(/тип\s*([A-Za-zА-Яа-я]+)/i)||[])[1]; return ('ДИФ '+(leak?leak+'мА ':'')+(typ?typ+' ':'')+(brand||'')).trim(); }
    if(/узо/i.test(n)){ const leak=(n.match(/(10|30|100|300)\s*мА/i)||[])[1]; const typ=(n.match(/тип\s*([A-Za-zА-Яа-я]+)/i)||[])[1]; return ('УЗО '+(leak?leak+'мА ':'')+(typ?typ+' ':'')+(brand||'')).trim(); }
    return n.replace(/\s+—\s+.*$/,'').trim();
  }
  


/* =========================================================
 * SHIELD CONFIGURATOR FUNCTION: detectRcdType
 * ========================================================= */
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

  


/* =========================================================
 * SHIELD CONFIGURATOR FUNCTION: normalizeDbItem
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
 * SHIELD CONFIGURATOR FUNCTION: renderGroupedFixed
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
 * SHIELD CONFIGURATOR FUNCTION: reqDisplayName
 * ========================================================= */
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

  


/* =========================================================
 * SHIELD CONFIGURATOR FUNCTION: strictFindMaterial
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
 * SHIELD CONFIGURATOR FUNCTION: cleanCanonicalName
 * ========================================================= */
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

  


/* =========================================================
 * SHIELD CONFIGURATOR FUNCTION: lineFromRaw
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
 * SHIELD CONFIGURATOR FUNCTION: shieldRowsForDetails
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
 * SHIELD CONFIGURATOR FUNCTION: detailNote
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
 * SHIELD CONFIGURATOR FUNCTION: groupHtml
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
 * SHIELD CONFIGURATOR FUNCTION: classify
 * ========================================================= */
function classify(it){
    var meta = (it && it.dbMeta) || {};
    var n = norm([it && it.n, it && it.c, getGroup(it), meta.kind, meta.category, meta.subcategory].filter(Boolean).join(' '));
    var raw = String((it && it.n) || '');
    if(meta.kind) {
      var k = String(meta.kind).toLowerCase();
      if(k.indexOf('dif') >= 0) return 'dif';
      if(k.indexOf('uzo') >= 0) return 'uzo';
      if(k.indexOf('automatic') >= 0 || k.indexOf('breaker') >= 0) return 'auto';
      if(k.indexOf('voltage') >= 0) return 'voltage_relay';
      if(k.indexOf('contactor') >= 0) return 'contactor';
    }
    if(/диф/i.test(raw) || n.indexOf('диф') >= 0) return 'dif';
    if(/узо/i.test(raw) || n.indexOf('узо') >= 0) return 'uzo';
    if(/уздп|дугов/i.test(raw) || n.indexOf('уздп') >= 0) return 'uzdp';
    if(/узм|реле напряж/i.test(raw) || n.indexOf('реле напряж') >= 0) return 'voltage_relay';
    if(/реле времени/i.test(raw) || n.indexOf('реле времени') >= 0) return 'time_relay';
    if(/контактор/i.test(raw) || n.indexOf('контактор') >= 0) return 'contactor';
    if(/автомат|(^|\s)[abcdсавд]\s?\d{1,3}(\s|$)/i.test(raw) || /\bc\s?\d{1,3}\b/.test(n)) return 'auto';
    if(/кабель|ввг|провод|пугв|utp|ftp|нг/i.test(raw) || n.indexOf('кабель') >= 0 || n.indexOf('ввг') >= 0) return 'cable';
    if(/щит|корпус|бокс/i.test(raw) || n.indexOf('корпус') >= 0) return 'shield_box';
    if(/греб/i.test(raw)) return 'comb';
    if(/ншви|наконеч/i.test(raw)) return 'lug';
    if(/шин|клемм/i.test(raw)) return 'bus';
    if(/din|дин|рейк|огранич/i.test(raw)) return 'din';
    if(/маркир|бирк/i.test(raw)) return 'marking';
    if((it && it.type) === 'work') return 'work:' + norm([(it.c||''), getGroup(it)].join('|'));
    return 'other:' + norm([(it && it.c) || '', getGroup(it)].join('|'));
  }

  


/* =========================================================
 * SHIELD CONFIGURATOR FUNCTION: sameSwapClass
 * ========================================================= */
function sameSwapClass(current, cand){
    var c1 = classify(current);
    var c2 = classify(cand);
    if(c1 === c2) return true;

    if(c1 === 'cable') return c2 === 'cable';
    if(c1 === 'auto') return c2 === 'auto';
    if(c1 === 'dif') return c2 === 'dif';
    if(c1 === 'uzo') return c2 === 'uzo';
    if(['uzdp','voltage_relay','time_relay','contactor'].indexOf(c1) >= 0) return c2 === c1;

    if(String(c1).indexOf('work:') === 0 && String(c2).indexOf('work:') === 0) {
      return c1 === c2 || c1.split('|')[0] === c2.split('|')[0];
    }
    return false;
  }

  


/* =========================================================
 * SHIELD CONFIGURATOR FUNCTION: renderList
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
 * SHIELD CONFIGURATOR FUNCTION: toolbar
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
 * SHIELD CONFIGURATOR FUNCTION: sameClass
 * ========================================================= */
function sameClass(a,b){
    var ca = classify(a), cb = classify(b);
    if(ca === cb) return true;
    if(['cable','auto','dif','uzo','uzdp','voltage','time','contactor'].indexOf(ca) >= 0) return ca === cb;
    if(ca.indexOf('work:') === 0 && cb.indexOf('work:') === 0) return ca === cb || ca.split('|')[0] === cb.split('|')[0];
    return false;
  }

  


/* =========================================================
 * SHIELD CONFIGURATOR FUNCTION: renderItems
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
 * SHIELD CONFIGURATOR FUNCTION: deleteToolbar
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
 * SHIELD CONFIGURATOR FUNCTION: esc
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
 * SHIELD CONFIGURATOR FUNCTION: sourceSwitcherHtml
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
 * SHIELD CONFIGURATOR FUNCTION: catalogRow
 * ========================================================= */
function catalogRow(type,it){
    var item=enc(it);
    var sub=(groupOf(it)?groupOf(it)+' • ':'')+(Number(it.p)||0)+' ₽ / '+(it.u||'шт');
    var copyBtn = scope()==='global' ? '<button class="btn-info" style="width:auto;margin:0 0 0 6px;padding:8px;" data-type="'+type+'" data-item="'+esc(item)+'" onclick="epCopyOneServerToMy(this.dataset.type,this.dataset.item)">В мою</button>' : '';
    return '<div class="mat-item"><div style="flex:1;font-size:12px;font-weight:600;"><b>'+esc(it.n||'Позиция')+'</b><br><span style="color:var(--gray);font-size:11px;font-weight:normal;">'+esc(sub)+'</span></div><button class="mat-add-btn" style="'+(type==='work'?'background:var(--orange);':'')+'" data-item="'+esc(item)+'" data-type="'+type+'" onclick="promptAdd(this.dataset.item,this.dataset.type)">+ Добавить</button>'+copyBtn+'</div>';
  }

  


/* =========================================================
 * SHIELD CONFIGURATOR FUNCTION: editorTop
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
 * SHIELD CONFIGURATOR FUNCTION: editorRow
 * ========================================================= */
function editorRow(type,it){
    var item=enc(it);
    var sub=(groupOf(it)?groupOf(it)+' • ':'')+(Number(it.p)||0)+' ₽ / '+(it.u||'шт');
    var checked=scope()==='my' ? '<input type="checkbox" class="ep-my-del-check" data-type="'+type+'" data-item="'+esc(item)+'" style="width:20px;height:20px;accent-color:#EF4444;margin:4px 8px 0 0;">' : '';
    var copy=scope()==='global' ? '<button class="btn-info" style="width:auto;margin:0;padding:7px;" data-type="'+type+'" data-item="'+esc(item)+'" onclick="epCopyOneServerToMy(this.dataset.type,this.dataset.item)">В мою</button>' : '';
    return '<div class="emp-row" style="align-items:flex-start;">'+checked+'<div style="flex:1;"><b>'+esc(it.n||'Позиция')+'</b><br><span style="color:var(--gray);font-size:10px;">'+esc(sub)+'</span></div><input type="number" value="'+(Number(it.p)||0)+'" data-id="'+esc(String(it.id||''))+'" data-type="'+type+'" onchange="requestPriceChange(this.dataset.type,this.dataset.id,this.value)" style="width:70px;margin:0;padding:4px;text-align:center;">'+copy+'</div>';
  }

  


/* =========================================================
 * SHIELD CONFIGURATOR FUNCTION: autoGroupMaterial
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
 * SHIELD CONFIGURATOR FUNCTION: autoGroupWork
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
 * SHIELD CONFIGURATOR FUNCTION: reviewedItems
 * ========================================================= */
function reviewedItems(){
    var review = window.EP_DB_REVIEW || {};
    var src = Array.isArray(review.items) ? review.items : [];
    var type = review.type === 'work' ? 'work' : 'mat';
    var out = [];
    src.forEach(function(base, i){
      var ch = $('ep-db-check-' + i);
      if(ch && !ch.checked) return;
      var it = {
        id: base.id || ((type === 'work' ? 'w' : 'm') + '_imp_' + Date.now() + '_' + i),
        n: (($('ep-db-name-' + i) || {}).value || base.n || '').trim(),
        c: (($('ep-db-cat-' + i) || {}).value || base.c || 'Разное').trim(),
        g: (($('ep-db-subcat-' + i) || {}).value || base.g || base.sc || 'Без группы').trim(),
        sc: (($('ep-db-subcat-' + i) || {}).value || base.sc || base.g || 'Без группы').trim(),
        p: Number(String((($('ep-db-price-' + i) || {}).value) || base.p || 0).replace(',','.').replace(/[^\d.]/g,'')) || 0,
        u: (($('ep-db-unit-' + i) || {}).value || base.u || 'шт').trim()
      };
      if(it.n){
        try{ if(typeof window.epAutoGroupItem === 'function') it = window.epAutoGroupItem(type,it); }catch(e){}
        out.push(it);
      }
    });
    return {type:type, items:out};
  }
  


/* =========================================================
 * SHIELD CONFIGURATOR FUNCTION: inferCat
 * ========================================================= */
function inferCat(name,type){
    var s = norm(name);
    if(type === 'work'){
      if(/штроб|резк|алмаз/.test(s)) return 'Алмазная резка';
      if(/подрозет|коронк|сверл|бурен/.test(s)) return 'Высверливание подрозетников';
      if(/щит|автомат|узо|диф|сборк/.test(s)) return 'Щитовое';
      if(/демонтаж/.test(s)) return 'Демонтаж';
      if(/свет|люстр|бра|светильн|лента/.test(s)) return 'Освещение';
      return 'Работы';
    }
    if(/ввг|кабел|провод|пугв|utp|ftp|тв|tv|sat/.test(s)) return 'Кабель';
    if(/гофр|труб|пнд|пвх/.test(s)) return 'Трубы';
    if(/автомат|узо|диф|узм|уздп|реле|контактор|выключатель нагрузки/.test(s)) return 'Автоматика';
    if(/щит|бокс|корпус|din|дин|рейк|шина|гребен|клемм|ншви|маркиров/.test(s)) return 'Щитовое';
    if(/розет|выключател|рамк|механизм|терморег/.test(s)) return 'Чистовое';
    if(/подрозет|короб|клемм|скоб|хомут|дюбел|саморез|смес|алебастр|изолент/.test(s)) return 'Расходники';
    return 'Разное';
  }
  


/* =========================================================
 * SHIELD CONFIGURATOR FUNCTION: inferSub
 * ========================================================= */
function inferSub(name,cat,type){
    var s = norm(name);
    if(type === 'work'){
      if(/бетон/.test(s)) return 'Бетон';
      if(/кирпич/.test(s)) return 'Кирпич';
      if(/монолит|панел/.test(s)) return 'Панель / монолит';
      return cat || 'Работы';
    }
    if(/c\s*\d+|с\s*\d+|автомат/.test(s)) return 'Автоматы';
    if(/диф/.test(s)) return 'ДИФы';
    if(/узо/.test(s)) return 'УЗО';
    if(/узм|реле напряж/.test(s)) return 'УЗМ / реле напряжения';
    if(/контактор/.test(s)) return 'Контакторы';
    if(/ввг/.test(s)) return 'ВВГ';
    if(/пугв/.test(s)) return 'ПуГВ';
    if(/utp|ftp/.test(s)) return 'UTP / FTP';
    if(/подрозет/.test(s)) return 'Подрозетники';
    if(/клемм|wago/.test(s)) return 'Клеммники';
    if(/гребен/.test(s)) return 'Гребёнки';
    if(/шин/.test(s)) return 'Шинки / клеммники';
    if(/din|дин|рейк/.test(s)) return 'DIN-рейки / ограничители';
    if(/щит|бокс|корпус/.test(s)) return 'Корпуса';
    return 'Разное';
  }
  


/* =========================================================
 * SHIELD CONFIGURATOR FUNCTION: collectReviewed
 * ========================================================= */
function collectReviewed(){
    saveVisibleEdits();
    var st = window.EP_DB_REVIEW_V6;
    var type = st.type === 'work' ? 'work' : 'mat';
    var out = [];
    (st.items || []).forEach(function(base,i){
      if(st.selected[i] === false) return;
      var ed = st.editCache[i] || base || {};
      var it = normItem({
        id: base.id,
        n: ed.n || base.n,
        c: ed.c || base.c,
        sc: ed.sc || ed.g || base.sc || base.g,
        p: ed.p != null ? ed.p : base.p,
        u: ed.u || base.u
      }, type, i);
      if(it){ try{ if(typeof window.epAutoGroupItem === 'function') it = window.epAutoGroupItem(type,it); }catch(e){} out.push(it); }
    });
    return {type:type, items:out};
  }
  


/* =========================================================
 * SHIELD CONFIGURATOR FUNCTION: ensureProgress
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
 * SHIELD CONFIGURATOR FUNCTION: makeManualItem
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
 * SHIELD CONFIGURATOR FUNCTION: normItem
 * ========================================================= */
function normItem(raw,type,idx){ raw=raw||{}; var n=clean(raw.n||raw.name||raw.title||raw.item||raw.position||raw['Наименование']||raw['Название']||raw['Имя']||raw['Позиция']); if(!n)return null; var c=clean(raw.c||raw.category||raw.cat||raw.group||raw['Категория'])||inferCat(n,type); var sc=clean(raw.sc||raw.g||raw.subcategory||raw.subcat||raw['Подкатегория']||raw['Группа'])||inferSub(n,c,type); var p=money(raw.p!=null?raw.p:(raw.price!=null?raw.price:(raw.cost!=null?raw.cost:(raw['Цена']||raw['Стоимость'])))); var u=clean(raw.u||raw.unit||raw.measure||raw['Ед']||raw['Ед.']||raw['Единица']||raw['Ед. изм.'])||'шт'; var it={id:raw.id||((type==='work'?'w':'m')+'_imp_v9_'+Date.now()+'_'+idx),n:n,c:c,sc:sc,g:sc,p:p,u:u}; try{ if(typeof window.epAutoGroupItem==='function') it=window.epAutoGroupItem(type,it); }catch(e){} return it; }
  


/* =========================================================
 * SHIELD CONFIGURATOR FUNCTION: showReview
 * ========================================================= */
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
  


/* =========================================================
 * SHIELD CONFIGURATOR FUNCTION: fixShieldWorkItem
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
 * SHIELD CONFIGURATOR FUNCTION: patchShieldButton
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
 * SHIELD CONFIGURATOR FUNCTION: epV16GenerateCascadePanel
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
 * SHIELD CONFIGURATOR FUNCTION: isShieldDeviceV16
 * ========================================================= */
function isShieldDeviceV16(it){
    if(!it || it.type!=='mat') return false;
    var n=String(it.n||''), k=String(it.dbMeta&&it.dbMeta.kind||'');
    return /[ABCDАВСД]\s*\d{1,3}|автомат|узо|диф|реле|контактор|вводной/i.test(n) || /automatic|breaker|uzo|dif|relay|contactor/i.test(k);
  }
  


/* =========================================================
 * SHIELD CONFIGURATOR FUNCTION: getAssignV16
 * ========================================================= */
function getAssignV16(it){
    if(window.epV15GetAssignments) return window.epV15GetAssignments(it);
    var out=[]; function add(v){v=String(v||'').trim(); if(v && !/позиция щита|общая \/ вводная|назначение не указано/i.test(v) && out.indexOf(v)<0) out.push(v);}
    if(it){ if(Array.isArray(it.epAssignments)) it.epAssignments.forEach(add); if(Array.isArray(it.epMergedDetails)) it.epMergedDetails.forEach(add); add(it.epAssignment); if(it.dbMeta) add(it.dbMeta.assignment); }
    return out;
  }
  


/* =========================================================
 * SHIELD CONFIGURATOR FUNCTION: purposeV16
 * ========================================================= */
function purposeV16(it){ return window.epV15Purpose ? window.epV15Purpose(it) : 'аппарат щита'; }
  


/* =========================================================
 * SHIELD CONFIGURATOR FUNCTION: showDetailsV16
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
 * SHIELD CONFIGURATOR FUNCTION: bindButtons
 * ========================================================= */
function bindButtons(){
    try{ Array.prototype.forEach.call(document.querySelectorAll('button'),function(btn){ if((btn.textContent||'').indexOf('Сгенерировать щит')>=0) btn.onclick=epV16GenerateCascadePanel; }); }catch(e){}
  }
  


/* =========================================================
 * SHIELD CONFIGURATOR FUNCTION: lineConfig
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
 * SHIELD CONFIGURATOR FUNCTION: isDevice
 * ========================================================= */
function isDevice(it){
    var n=txt(it&&it.n), k=txt(it&&it.dbMeta&&it.dbMeta.kind), raw=txt(it&&it.epRawLabel);
    return !!(it&&it.type==='mat' && (/автомат|узо|диф|реле|контактор|вводной/i.test(n+' '+raw) || /automatic|breaker|uzo|dif|relay|contactor|input_breaker/i.test(k) || /\b[ABCDАВСД]\s*\d{1,3}\b/i.test(n+' '+raw)));
  }
  


/* =========================================================
 * SHIELD CONFIGURATOR FUNCTION: assignmentsOf
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
 * SHIELD CONFIGURATOR FUNCTION: deviceName
 * ========================================================= */
function deviceName(it){
    var n=clean(it&&it.n), m=(it&&it.dbMeta)||{}, raw=clean(m.rawLabel||it.epRawLabel||n), b=brandRu(m.brand||(/IEK|ИЭК/i.test(n+' '+raw)?'IEK':''));
    var src=n+' '+raw+' '+txt(m.kind);
    if(/input_breaker|вводн/i.test(src)) return 'Вводной автомат '+(m.poles||'2P')+' '+(b||'ИЭК')+' ВА47-29';
    var nom=nominalOf(it); if(/automatic|автомат|\b[ABCDАВСД]\s*\d/i.test(src) && nom) return nom+' '+(m.poles||'1P')+' '+(b||'ИЭК')+' ВА47-29';
    if(/диф/i.test(src)) return 'ДИФ '+(m.poles||'1P+N')+' '+(m.amp||40)+'A '+(m.leakage||(/10\s*мА/i.test(src)?10:30))+'мА тип '+(m.rcdType||'A')+' '+(b||'ИЭК');
    if(/узо/i.test(src)) return 'УЗО '+(m.poles||'2P')+' '+(m.amp||40)+'A '+(m.leakage||(/10\s*мА/i.test(src)?10:30))+'мА тип '+(m.rcdType||'A')+' '+(b||'ИЭК')+' ВД1-63';
    return n;
  }
  


/* =========================================================
 * SHIELD CONFIGURATOR FUNCTION: purposeOf
 * ========================================================= */
function purposeOf(it){
    var s=txt(it&&it.n)+' '+txt(it&&it.epRawLabel)+' '+txt(it&&it.dbMeta&&it.dbMeta.kind);
    if(/вводн|input_breaker/i.test(s)) return 'вводной аппарат щита';
    if(/10\s*мА/i.test(s)) return 'защита влажных зон 10 мА';
    if(/узо|диф/i.test(s)) return 'групповая защита';
    if(/контактор/i.test(s)) return 'мастер-кнопка только на свет';
    if(/реле|узм/i.test(s)) return 'защитный аппарат';
    return 'отдельный автомат линии';
  }
  


/* =========================================================
 * SHIELD CONFIGURATOR FUNCTION: patchDbBulk
 * ========================================================= */
function patchDbBulk(){
    var modal=$('settModal'); if(!modal || $('ep-v17-bulk-box')) return;
    var host=$('editor-mat-list') || $('editor-work-list'); if(!host) return;
    var box=document.createElement('div'); box.id='ep-v17-bulk-box'; box.style.cssText='margin:12px 0;padding:12px;border:2px dashed #8b5cf6;border-radius:16px;background:#faf5ff;';
    box.innerHTML='<b style="color:#5b21b6;display:block;margin-bottom:8px;">Массовое управление V17</b><div style="font-size:12px;color:#64748b;font-weight:800;margin-bottom:8px;">Выделение и перенос работают по галочкам в текущей открытой базе. Если галочек нет — значит открыт старый список, нажми Обновить / перезагрузить.</div><div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;"><input id="ep-v17-move-cat" placeholder="Категория"><input id="ep-v17-move-sub" placeholder="Подкатегория"></div><button onclick="epV17BulkMove()" style="margin-top:8px;background:#8b5cf6;color:white;">📦 Переместить выбранные</button><button onclick="epV17BulkDelete()" style="margin-top:8px;background:#ef4444;color:white;">🗑 Удалить выбранные</button>';
    host.parentNode.insertBefore(box,host);
  }
  


/* =========================================================
 * SHIELD CONFIGURATOR FUNCTION: saveArr
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
 * SHIELD CONFIGURATOR FUNCTION: dbFindAuto
 * ========================================================= */
function dbFindAuto(nominal,brand){
    var amp=String(nominal||'').replace(/[^0-9]/g,''); var br=norm(brand||''); var arr=getArr('mat',scope()).concat(getArr('mat','global'),getArr('mat','my'));
    var hit=arr.find(function(it){ var nn=norm(it.n); return /автомат/.test(nn) && nn.indexOf(amp+'a')>=0 && (!br || nn.indexOf(br)>=0 || (br==='iek'&&nn.indexOf('иэк')>=0) || (br==='иэк'&&nn.indexOf('iek')>=0)); });
    return hit||null;
  }
  


/* =========================================================
 * SHIELD CONFIGURATOR FUNCTION: dbFindRcd
 * ========================================================= */
function dbFindRcd(leak,brand,kind){
    var br=norm(brand||''), k=kind||'УЗО'; var arr=getArr('mat',scope()).concat(getArr('mat','global'),getArr('mat','my'));
    return arr.find(function(it){ var nn=norm(it.n); return nn.indexOf(norm(k))>=0 && nn.indexOf(String(leak))>=0 && (!br || nn.indexOf(br)>=0 || (br==='iek'&&nn.indexOf('иэк')>=0) || (br==='иэк'&&nn.indexOf('iek')>=0)); })||null;
  }
  


/* =========================================================
 * SHIELD CONFIGURATOR FUNCTION: autoName
 * ========================================================= */
function autoName(nominal,brand){
    var hit=dbFindAuto(nominal,brand), br=brandRu(brand); var amp=String(nominal||'C16').replace(/[^0-9]/g,''); var curve=String(nominal||'C16').replace(/[^A-Za-zА-Яа-я]/g,'').toUpperCase().charAt(0)||'C';
    if(hit && /\(([^)]+)\)/.test(hit.n||'')){ var model=(hit.n.match(/\(([^)]+)\)/)||[])[1]; return curve+amp+' 1P '+model.replace(/^IEK/i,'ИЭК'); }
    if(String(brand||'').toUpperCase()==='ABB') return curve+amp+' 1P ABB SH201';
    return curve+amp+' 1P '+br+' ВА47-29';
  }
  


/* =========================================================
 * SHIELD CONFIGURATOR FUNCTION: rcdName
 * ========================================================= */
function rcdName(leak,brand,kind,rcdType){ var hit=dbFindRcd(leak,brand,kind); var br=brandRu(brand); if(hit && /\(([^)]+)\)/.test(hit.n||'')){ var model=(hit.n.match(/\(([^)]+)\)/)||[])[1].replace(/^IEK/i,'ИЭК'); return kind+' 2P 40A '+leak+'мА тип '+(rcdType||'A')+' '+model; } return kind+' 2P 40A '+leak+'мА тип '+(rcdType||'A')+' '+br+(br==='ИЭК'?' ВД1-63':''); }
  


/* =========================================================
 * SHIELD CONFIGURATOR FUNCTION: rcdPrice
 * ========================================================= */
function rcdPrice(leak,brand,kind){ var hit=dbFindRcd(leak,brand,kind); if(hit) return money(hit.p); return leak===10?3600:1195; }
  


/* =========================================================
 * SHIELD CONFIGURATOR FUNCTION: cfgNum
 * ========================================================= */
function cfgNum(k){ try{ return Number(window.cfg && cfg[k])||0; }catch(e){ return 0; } }
  


/* =========================================================
 * SHIELD CONFIGURATOR FUNCTION: directAddShield
 * ========================================================= */
function directAddShield(items){
    var map={},out=[];
    (items||[]).forEach(function(src){ if(!src || !src.n) return; var it=clone(src); it.tag='shield'; var key=[it.tag,it.type||'',it.n||'',Number(it.p)||0,it.u||'шт'].join('|'); var rec=map[key]; if(!rec){ rec=Object.assign({},it,{q:0,epAssignments:[],epMergedDetails:[]}); map[key]=rec; out.push(rec); } rec.q += Number(it.q)||0; mergeAssignments(rec,it); });
    try{ currentEstimate=(Array.isArray(currentEstimate)?currentEstimate:[]).filter(function(it){ return it.tag!=='shield' && it.tag!=='shield_info'; }).concat(out); window.currentEstimate=currentEstimate; }catch(e){ window.currentEstimate=out; }
    try{ localStorage.setItem('est_v31',JSON.stringify(currentEstimate)); }catch(e){}
  }
  


/* =========================================================
 * SHIELD CONFIGURATOR FUNCTION: renderMainDirect
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
 * SHIELD CONFIGURATOR FUNCTION: isShieldDevice
 * ========================================================= */
function isShieldDevice(it){ var n=String((it&&it.n)||''); return it && it.type==='mat' && (/\b[ABCDАВСД]\s*\d{1,3}\b|автомат|узо|диф|реле|контактор|вводной/i.test(n) || /automatic|breaker|uzo|dif|relay|contactor/.test(String(it.kind||it.dbMeta&&it.dbMeta.kind||''))); }
  


/* =========================================================
 * SHIELD CONFIGURATOR FUNCTION: buildBulkPanel
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
 * SHIELD CONFIGURATOR FUNCTION: cfgN
 * ========================================================= */
function cfgN(k){ try{ return Math.max(0, Number((window.cfg&&window.cfg[k])||0)); }catch(e){ return 0; } }
  


/* =========================================================
 * SHIELD CONFIGURATOR FUNCTION: buildLines
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
 * SHIELD CONFIGURATOR FUNCTION: addShieldToEstimate
 * ========================================================= */
function addShieldToEstimate(items){
    // Use original addAuto if possible, because it also syncs totals and storage. Items are already aggregated by V19.
    try{ if(typeof addAuto==='function'){ addAuto(items,'shield'); return; } }catch(e){}
    try{ window.currentEstimate=(Array.isArray(window.currentEstimate)?window.currentEstimate:[]).filter(function(it){return it.tag!=='shield'&&it.tag!=='shield_info';}).concat(items); currentEstimate=window.currentEstimate; if(typeof renderMainTable==='function') renderMainTable(); }catch(e){}
  }
  


/* =========================================================
 * SHIELD CONFIGURATOR FUNCTION: patchButtons
 * ========================================================= */
function patchButtons(){ try{ Array.prototype.forEach.call(document.querySelectorAll('button'),function(b){ var t=b.textContent||''; if(t.indexOf('Сгенерировать щит')>=0) b.onclick=window.epV19GenerateShield; if(t.indexOf('Детализация')>=0) b.onclick=window.epV19ShowDetails; }); }catch(e){} }
  


/* =========================================================
 * SHIELD CONFIGURATOR FUNCTION: count
 * ========================================================= */
function count(k,def){
    var e=$('v-'+k); var n=NaN;
    if(e) n=Number(clean(e.textContent));
    if(!isFinite(n)) { try{ n=Number(cfg && cfg[k]); }catch(_e){} }
    if(!isFinite(n)) n=Number(def)||0;
    return Math.max(0,n||0);
  }
  


/* =========================================================
 * SHIELD CONFIGURATOR FUNCTION: directAdd
 * ========================================================= */
function directAdd(items){
    var map={}, out=[];
    (items||[]).forEach(function(src){ if(!src||!src.n) return; var it=Object.assign({},src,{tag:src.tag||'shield'}); var k=[it.tag,it.type,it.n,it.p,it.u].join('|'); var rec=map[k]; if(!rec){ rec=Object.assign({},it,{q:0,epAssignments:[],epMergedDetails:[]}); map[k]=rec; out.push(rec); } rec.q += Number(it.q)||1; addUniqueAssign(rec,[].concat(it.epAssignments||[],it.epMergedDetails||[],it.epAssignment||[])); });
    try{ currentEstimate=(Array.isArray(currentEstimate)?currentEstimate:[]).filter(function(x){ return x && x.tag!=='shield' && x.tag!=='shield_info'; }).concat(out); window.currentEstimate=currentEstimate; }catch(e){ window.currentEstimate=(window.currentEstimate||[]).filter(function(x){ return x && x.tag!=='shield' && x.tag!=='shield_info'; }).concat(out); }
    try{ if(typeof renderMainTable==='function') renderMainTable(); else if(typeof renderMainDirect==='function') renderMainDirect(); }catch(e){}
    try{ if(typeof syncDraft==='function') syncDraft(); }catch(e){}
  }
  


/* =========================================================
 * SHIELD CONFIGURATOR FUNCTION: setStatus
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
 * SHIELD CONFIGURATOR FUNCTION: panelHtml
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
  

