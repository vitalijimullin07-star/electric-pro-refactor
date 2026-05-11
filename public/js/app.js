// === БЕЗОПАСНАЯ ОБОЛОЧКА И СИНХРОНИЗАЦИЯ ===


window.addEventListener('offline', () => { showToast("📵 Нет интернета. Работаем локально."); });
window.addEventListener('online', () => { showToast("🌐 Связь восстановлена. Синхронизация..."); syncDraft(); });

let db, auth;
let GEMINI_API_KEY = safeGet('gemini_key_v31', "");
let appUser = null; 
let cust = {name:"", phone:"", addr:"", ceil:270};
try { let c = JSON.parse(safeGet('cust_v31', '{}')); if(c && c.name) cust = c; } catch(e){}

let hDB = []; 
try { hDB = JSON.parse(safeGet('h_v31', '[]')); } catch(e) { hDB = []; }
let currentEstimate = []; 
try { currentEstimate = JSON.parse(safeGet('est_v31', '[]')); } catch(e) { currentEstimate = []; }

let matDB = [], workDB = []; 
let pool = []; 
let coeffs = {mat:0, work:0};
try { let c = JSON.parse(safeGet('coeffs_v31', '{"mat":0,"work":0}')); coeffs = c; } catch(e){}

let appLogic = { 
    cabRes: 1.1, gofraRes: 1.05, basesPerM: 3, clipsPerM: 3, packSize: 100, mixPerBox: 0.3, crownLife: 80,
    priceSoc: 500, priceShield: 500, priceDrill: 600, priceShtroba: 550, priceCabCeil: 120,
    socketsPerJb: 3, connPerSocJb: 3, connPerSwJb: 3, connPerPassJb: 4
};
try { let logic = JSON.parse(safeGet('appLogic_v31', '{}')); appLogic = Object.assign(appLogic, logic); } catch(e){}

let priceOverrides = {};
let cfg = {rms: 1, acs: 0, fls: 0, bals: 0 };
var st_soc = 1, st_sw = 0, st_pass = 0, st_cross = 0, st_tv = 0, st_tpol = 0, st_q = 1, st_h = 30, st_p = 1, st_podr = 'std';
let globalRecalcCab = 0, globalRecalcSht = 0; let pendingAdd = null; let currentCardId = null;
let currentShieldExtras = [];
let currentPreviewMode = '';
let adminDraftsCache = [];
let buhChartInstance = null;

// === БАЗА ДАННЫХ ===
const FULL_MAT_INIT=[{"id":"m1","c":"Кабель","n":"Кабель ВВГнг-LS 3х1.5 (Конкорд) круглый","p":57,"u":"м.п."},{"id":"m2","c":"Кабель","n":"Кабель ВВГнг-LS 3х2.5 (Конкорд) круглый","p":87,"u":"м.п."},{"id":"m3","c":"Кабель","n":"Кабель ВВГнг(п)-LS 3х1.5 (Конкорд) плоский","p":62,"u":"м.п."},{"id":"m4","c":"Кабель","n":"Кабель ВВГнг(п)-LS 3х2.5 (Конкорд) плоский","p":95,"u":"м.п."},{"id":"m14","c":"Расходники","n":"Подрозетник глубокий для бетона 68х64","p":12,"u":"шт"},{"id":"m15","c":"Расходники","n":"Подрозетник стандарт (ГКЛ/Бетон)","p":20,"u":"шт"},{"id":"m16","c":"Расходники","n":"Подрозетник Короѕ 75мм","p":95,"u":"шт"},{"id":"m17","c":"Расходники","n":"Коробка распределительная 100х100х40","p":120,"u":"шт"},{"id":"m27","c":"Расходники","n":"Гильза ГМЛ 4/6","p":15,"u":"шт"},{"id":"m29","c":"Расходники","n":"Термоусадка 12/4 (м)","p":80,"u":"м"},{"id":"w_m1","c":"Чистовая","n":"Розетка 220В (механизм)","p":250,"u":"шт"},{"id":"w_m2","c":"Чистовая","n":"Выключатель (механизм)","p":280,"u":"шт"},{"id":"w_m3","c":"Чистовая","n":"Слаботочная розетка (механизм)","p":350,"u":"шт"}];
const FULL_WORK_INIT=[{"id":"w44","c":"Алмазная резка","n":"Штроба 25х30 (Бетон)","p":550,"u":"м.п."},{"id":"w56","c":"Алмазная резка","n":"Высверливание подрозетников (45мм)","p":600,"u":"шт"},{"id":"w71","c":"Алмазная резка","n":"Высверливание подрозетников (64мм)","p":650,"u":"шт"},{"id":"w60","c":"Черновая электрика","n":"Вклейка подрозетников","p":100,"u":"шт"},{"id":"w67","c":"Монтаж","n":"Сборка распред. коробки (ГМЛ)","p":800,"u":"шт"},{"id":"w68","c":"Чистовая установка","n":"Установка розетки 220В","p":500,"u":"шт"},{"id":"w69","c":"Чистовая установка","n":"Установка выключателя","p":550,"u":"шт"},{"id":"w87","c":"Щитовое","n":"Сборка щита (мод)","p":500,"u":"мод."}];

// === FIREBASE INIT ===
try {
    firebase.initializeApp({
        apiKey: "AIzaSyDf_83fOauQddXE0lu0Jsu0toK1BaJ7TY8",
        authDomain: "electric-pro-test.firebaseapp.com",
        projectId: "electric-pro-test",
        storageBucket: "electric-pro-test.firebasestorage.app",
        messagingSenderId: "629482912356",
        appId: "1:629482912356:web:7f386c27ce618fdc2fd71"
    });
    db = firebase.firestore();
    auth = firebase.auth();
    db.settings({ cacheSizeBytes: firebase.firestore.CACHE_SIZE_UNLIMITED });
    db.enablePersistence().catch(err => console.warn("Offline cache failed", err));
} catch(e) { console.error("Firebase error", e); }

// === GOOGLE AUTH ===
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

document.getElementById('btn-google-login').addEventListener('click', handleGoogleAuth);
let regBtn = document.getElementById('btn-google-reg');
if (regBtn) regBtn.addEventListener('click', handleGoogleAuth);

if(auth) {
    auth.onAuthStateChanged(async (user) => {
        if (user) {
            showLoader("Загрузка профиля...", "🔒");
            try {
                const userRef = db.collection('users').doc(user.uid);
                const docSnap = await userRef.get();
                if (!docSnap.exists) {
                    await userRef.set({ name: user.displayName || "Мастер", email: user.email, role: 'master', isApproved: false, geminiKey: '', phone: '', pin: '' });
                    hideLoader(); document.getElementById('authModal').style.display='none'; document.getElementById('waitingModal').style.display='flex';
                } else {
                    appUser = docSnap.data(); appUser.uid = user.uid; hideLoader();
                    if (appUser.isApproved || appUser.role === 'admin') {
                        document.getElementById('authModal').style.display='none'; document.getElementById('waitingModal').style.display='none'; finishLoginSetup();
                    } else { document.getElementById('authModal').style.display='none'; document.getElementById('waitingModal').style.display='flex'; }
                }
            } catch(e) { hideLoader(); alert("Ошибка связи с БД: " + e.message); }
        } else {
            hideLoader(); checkLocalPinUser();
        }
    });
} else {
    hideLoader(); checkLocalPinUser();
}

function checkLocalPinUser() {
    let pinUser = safeGet('authUser_v31_pin', null);
    if (pinUser) { 
        try { appUser = JSON.parse(pinUser); finishLoginSetup(); } catch(e){ document.getElementById('authModal').style.display='flex'; } 
    } else { document.getElementById('authModal').style.display='flex'; }
}




function showLoader(text, icon = '☁️') { document.getElementById('loader-icon').innerText = icon; document.getElementById('loader-text').innerText = text; document.getElementById('global-loader').classList.add('show'); }


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

function confirmLogout() { 
    if(auth) auth.signOut(); 
    safeSet('authUser_v31_pin', ''); 
    window.location.reload(); 
}

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

async function saveApiKey(val) { 
    GEMINI_API_KEY = val.trim(); safeSet('gemini_key_v31', GEMINI_API_KEY);
    if(db && appUser && appUser.uid) { try { await db.collection('users').doc(appUser.uid).update({geminiKey: GEMINI_API_KEY}); }catch(e){} }
    showToast("🔑 Ключ сохранен!"); 
}

function fPrice(it) { return Math.round((it.p || 0) * (1 + (it.type === 'mat'? coeffs.mat: coeffs.work) / 100)); }

// === ЗАМЕНА МАТЕРИАЛА / РАБОТЫ ПО КЛИКУ ===
let swapTargetIdx = -1;
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

async function syncDraft() { try { safeSet('est_v31', JSON.stringify(currentEstimate)); if(db && appUser && appUser.uid) await db.collection('drafts').doc(appUser.uid).set({ estimate: currentEstimate, cust: cust, timestamp: new Date().toISOString() }); } catch(e){} }
async function clearCurrentEstimate() { let c = await window.customConfirm("Очистка", "Очистить смету?"); if(c){ currentEstimate=[]; renderMainTable(); } }

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

function toggleCat(id) { let el = document.getElementById(id); el.classList.toggle('active'); }

function promptAdd(id, type) { 
    let dbArr = (type==='mat'?matDB:workDB); let item = dbArr.find(x => String(x.id) === String(id)); 
    if(!item) return; pendingAdd = { item, type }; 
    document.getElementById('qty-prompt-name').innerText = item.n; 
    document.getElementById('qty-input').value = 1; 
    openModal('qtyPromptModal'); 
}
function confirmQtyAdd() { 
    let q = Number(document.getElementById('qty-input').value); 
    if(q > 0) { addAuto([{...pendingAdd.item, q: q, type: pendingAdd.type}], 'man_'+Date.now()); } 
    closeModal('qtyPromptModal'); showToast("Добавлено!");
}

function addAuto(items, tag) { 
    currentEstimate = currentEstimate.filter(it => it.tag !== tag); 
    items.forEach(it => { it.tag = tag; currentEstimate.push(it); }); 
    renderMainTable(); 
}

function setPodr(v, el) { st_podr = v; document.querySelectorAll('#podr-tiles .tile').forEach(t=>t.classList.remove('active')); el.classList.add('active'); }
function setH(v, el) { st_h = v; if(el){ document.querySelectorAll('#h-tiles .tile').forEach(t=>t.classList.remove('active')); el.classList.add('active'); } }
function setP(v) { st_p = v; document.querySelectorAll('#p-tiles .tile').forEach((t,i) => { if(i===v-1) t.classList.add('active'); else t.classList.remove('active'); }); }

function modM(t, v) { 
    let currentP = st_soc + st_sw + st_pass + st_cross + st_tv + st_tpol;
    if (v > 0 && currentP >= 6) return showToast("Максимум 6 постов в одной рамке!");
    if (v < 0 && window['st_'+t] <= 0) return;
    
    window['st_'+t] += v; 
    upUI(); 
}

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

function addGrp() { 
    let totalMechs = st_soc + st_sw + st_pass + st_cross + st_tv + st_tpol;
    if(totalMechs === 0) return showToast("Сначала добавьте механизмы!");
    
    pool.push({ p:st_p, h:st_h, q:st_q, soc:st_soc, sw:st_sw, pass:st_pass, cross:st_cross, tv:st_tv, tpol:st_tpol, route: document.getElementById('g-routing').value, podr: st_podr }); 
    rfPool(); 
}

function popPool() { pool.pop(); rfPool(); }
function rfPool() { 
    document.getElementById('pool-disp').innerHTML = pool.map((g,i) => `<div style="display:flex; justify-content:space-between; padding:8px; border-bottom:1px solid var(--border);"><b>${g.p}п на ${g.h}см (x${g.q}) [${g.podr}]</b> <button onclick="pool.splice(${i},1);rfPool();" style="width:auto; margin:0; background:none; color:red; font-size:16px;">✕</button></div>`).join(""); 
}

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

function modV(id, val) { cfg[id] = Math.max(0, cfg[id] + val); document.getElementById('v-'+id).innerText = cfg[id]; }

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

function renderShieldExtras() {
    document.getElementById('shield-extras-list').innerHTML = currentShieldExtras.map((ex, i) =>
        `<div style="display:flex; justify-content:space-between; font-size:11px; border-bottom:1px dashed rgba(0,0,0,0.1); padding:4px;"><span>${ex.n} <b style="color:var(--primary);">(x${ex.q})</b></span><span style="color:red; font-size:16px; font-weight:bold; cursor:pointer;" onclick="currentShieldExtras.splice(${i},1); renderShieldExtras();">✕</span></div>`
    ).join('');
}

function generateCascadePanel() {
    let prShield = appLogic.priceShield || 500;
    const bBox = document.getElementById('cfg-brand-box').value; const bAuto = document.getElementById('cfg-brand-auto').value; const sWall = document.getElementById('cfg-shield-wall').value; const ph = parseInt(document.getElementById('cfg-phase').value); const isMaster = document.getElementById('cfg-master').checked;
    let m = []; let w = []; let count1P = 0; let countDIF = 0;
    
    m.push({ n: `Вводной автомат ${ph}ф (${bAuto})`, q: 1, p: bAuto==='ABB'?3500:1800, type:'mat' }); let totalMod = (ph === 3 ? 3 : 2);
    countDIF++; m.push({ n: `⚡ ДИФ 40А (Силовые) ${bAuto}`, q: 1, p: bAuto==='ABB'?4500:3800, type:'mat' }); totalMod += 2;
    m.push({ n: `  ↳ Автомат C16 (Кухня) ${bAuto}`, q: 1, p: bAuto==='ABB'?350:155, type:'mat' }); count1P++;
    m.push({ n: `  ↳ Автомат C16 (Коридор) ${bAuto}`, q: 1, p: bAuto==='ABB'?350:155, type:'mat' }); count1P++;
    if(cfg.rms > 0) { m.push({ n: `  ↳ Автомат C16 (Комнаты) ${bAuto}`, q: cfg.rms, p: bAuto==='ABB'?350:155, type:'mat' }); count1P += cfg.rms; }
    if(cfg.bals > 0) { m.push({ n: `  ↳ Автомат C16 (Балконы) ${bAuto}`, q: cfg.bals, p: bAuto==='ABB'?350:155, type:'mat' }); count1P += cfg.bals; }
    
    ['oven', 'fridge', 'apron', 'dish','washer', 'boiler', 'neptun'].forEach(id => {
        if(document.getElementById('c-'+id).checked) { let nm = id==='oven'?'Плита/Духовка':id==='fridge'?'Холодильник':id==='apron'?'Фартук':id==='dish'?'Посудомойка':id==='washer'?'Стиралка':id==='boiler'?'Бойлер':"Нептун"; m.push({n: `  ↳ Автомат C16 (${nm}) ${bAuto}`, q: 1, p: bAuto==='ABB'?350:155, type:'mat' }); count1P++; }
    });
    
    countDIF++; m.push({ n: `💡 ДИФ 25А (Свет) ${bAuto}`, q: 1, p: bAuto==='ABB'?4200:3200, type:'mat' }); totalMod += 2;
    m.push({ n: `  ↳ Автомат C10 (Свет Кухня) ${bAuto}`, q: 1, p: bAuto==='ABB'?350:155, type:'mat' }); count1P++;
    m.push({ n: `  ↳ Автомат C10 (Свет Ванная) ${bAuto}`, q: 1, p: bAuto==='ABB'?350:155, type:'mat' }); count1P++;
    if(cfg.rms > 0) { m.push({ n: `  ↳ Автомат C10 (Свет Комнаты) ${bAuto}`, q: cfg.rms, p: bAuto==='ABB'?350:155, type:'mat' }); count1P += cfg.rms; }
    
    if (cfg.acs > 0) { countDIF++; m.push({ n: `❄️ ДИФ (Кондиц.) ${bAuto}`, q: 1, p: bAuto==='ABB'?4500:3500, type:'mat' }); totalMod += 2; m.push({ n: `  ↳ Автомат C16 (Конд) ${bAuto}`, q: cfg.acs, p: bAuto==='ABB'?350:155, type:'mat' }); count1P += cfg.acs; }
    if (cfg.fls > 0) { countDIF++; m.push({ n: `🔥 ДИФ (Т.Полы) ${bAuto}`, q: 1, p: bAuto==='ABB'?4500:3600, type:'mat' }); totalMod += 2; m.push({ n: `  ↳ Автомат C16 (Т.Пол) ${bAuto}`, q: cfg.fls, p: bAuto==='ABB'?350:155, type:'mat' }); count1P += cfg.fls; }
    if(document.getElementById('cfg-uzm').checked) { m.push({ n: `Реле напряжения УЗМ-50Ц`, q: ph===3?3:1, p: 4500, type:'mat' }); totalMod += (ph===3?6:2); }
    if(isMaster) { m.push({ n: `Контактор 25А`, q: 1, p: 2200, type:'mat' }); m.push({ n: `  ↳ Автомат 40А (Байпас) ${bAuto}`, q: 1, p: bAuto==='ABB'?600:380, type:'mat' }); count1P++; totalMod += 2; }
    
    currentShieldExtras.forEach(ex => { m.push({ n: ex.n, q: ex.q, p: ex.p, type: 'mat' }); totalMod += ex.q; });
    
    m.push({ n: `Провод ПуГВ (ПВ-3) 1х6 синий`, q: 4, p: 85, type:'mat' }); m.push({ n: `Провод ПуГВ (ПВ-3) 1х6 белый`, q: 4, p: 85, type:'mat' }); m.push({ n: `Наконечник НШВИ 6.0-12 (упак)`, q: 1, p: 225, type:'mat' });
    
    if (bBox === 'ABB') { m.push({ n: `Клеммник винтовой N 5x16 (ABB)`, q: countDIF, p: 345, type:'mat' }); m.push({ n: `Клеммник винтовой PE 11x16 (ABB)`, q: 1, p: 770, type:'mat' }); } 
    else { m.push({ n: `Шина N ноль на DIN-изол (ИЭК)`, q: countDIF, p: 285, type:'mat' }); }
    
    let comb1P = Math.ceil(count1P / 12); let comb2P = Math.ceil(countDIF / 6);
    if (comb1P > 0) m.push({ n: `Гребенка 1P (25см)`, q: comb1P, p: 250, type:'mat' });
    if (comb2P > 0) m.push({ n: `Гребенка 2Р (25см)`, q: comb2P, p: 450, type:'mat' });
    
    totalMod += count1P; let boxSize = [12, 24, 36, 48, 54, 72, 96].find(s => s >= (totalMod + 5)) || 96;
    m.unshift({ n: `📦 Щит ${sWall==='Накладной'?'накладной':'встраиваемый'} ${bBox} ${boxSize}М`, q: 1, p: bBox==='ABB'?6510:2660, type:'mat' });
    
    if(sWall !== 'Накладной') w.push({ n: `Вырубка ниши (${sWall})`, q: boxSize, p: 400, type:'work' });
    w.push({ n: `Штроба ВВОДНАЯ 100x50 (${sWall})`, q: 2, p: 1500, type:'work' });
    w.push({ n: `Сборка щита (мод)`, q: totalMod, p: prShield, type:'work' });
    
    addAuto(m.concat(w), 'shield'); currentShieldExtras = []; closeModal('configModal'); showToast("✅ Щит сгенерирован!");
}

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

function getPDFHeader(title) { 
    return `<div class="pdf-header"><h1>${title}</h1><p>Заказчик: <b>${cust.name}</b> | Объект: ${cust.addr}</p></div>`; 
}

function categorizeEstimateItem(it) {
    if (it.type === 'mat') return 1;
    let n = it.n.toLowerCase();
    if (n.includes('штроб') || n.includes('высверл') || n.includes('алмаз') || n.includes('резк') || n.includes('отверст') || n.includes('ниши')) return 2;
    if (n.includes('установк') || n.includes('розетк') || n.includes('выключат') || n.includes('рамк') || n.includes('свет') || n.includes('люстр')) {
        if (!n.includes('подрозетн') && !n.includes('щит')) return 4;
    }
    return 3; 
}

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

function refreshPreview() { showPreview(currentPreviewMode); }

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

function togglePay(field) {
    let obj = hDB.find(x => x.id === currentCardId);
    if(obj) {
        if(!obj.payments) obj.payments = {};
        obj.payments[field] = document.getElementById('pay-' + field).checked;
        safeSet('h_v31', JSON.stringify(hDB));
        if(db) db.collection('history').doc(String(obj.id)).update({ payments: obj.payments }).catch(()=>{});
    }
}
function updatePayPrepay(val) {
    let obj = hDB.find(x => x.id === currentCardId);
    if(obj) {
        if(!obj.payments) obj.payments = {};
        obj.payments.prepay = Number(val) || 0;
        safeSet('h_v31', JSON.stringify(hDB));
        if(db) db.collection('history').doc(String(obj.id)).update({ payments: obj.payments }).catch(()=>{});
    }
}


function openRecalcModal() { 
    globalRecalcCab = 0; globalRecalcSht = 0;
    currentEstimate.forEach(it => { let nameLower = it.n.toLowerCase(); if (nameLower.includes('ввг') || nameLower.includes('bbг') || nameLower.includes('провод') || nameLower.includes('кабель')) globalRecalcCab += Number(it.q); if (nameLower.includes('штроб') && !nameLower.includes('вводная')) globalRecalcSht += Number(it.q); }); 
    document.getElementById('r-cab').innerText = globalRecalcCab + ' м'; document.getElementById('r-sht').innerText = globalRecalcSht + ' м'; document.getElementById('r-ceil-input').value = 0; updateRecalcUI(); openModal('recalcModal'); 
}
function updateRecalcUI() { 
    let ceilCab = Number(document.getElementById('r-ceil-input').value) || 0; let floorCab = Math.max(0, globalRecalcCab - ceilCab - globalRecalcSht);
    document.getElementById('r-res-sht').innerText = globalRecalcSht + ' м'; document.getElementById('r-res-ceil').innerText = ceilCab + ' м'; document.getElementById('r-res-floor').innerText = floorCab + ' м'; 
}
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

function updateBuhUI() {
    let sumW = 0, sumM = 0, matBase = 0, workBase = 0;
    currentEstimate.forEach(it => { let price = fPrice(it); if(it.type==='work') { sumW += price * it.q; workBase += (it.p||0) * it.q; } else { sumM += price * it.q; matBase += (it.p||0) * it.q; } });
    let disc = Number(document.getElementById('b-discount').value) || 0, prep = Number(document.getElementById('b-prepay').value) || 0;
    document.getElementById('b-work').innerText = sumW + ' P'; document.getElementById('b-mat').innerText = sumM + ' P'; 
    document.getElementById('p-total').innerText = (workBase + (sumM - matBase)) + ' P'; 
    document.getElementById('b-final').innerText = (sumW + sumM - disc - prep) + ' P';
}

async function saveHist() {
    const finalTotal = parseInt(document.getElementById('b-final').innerText) || 0;
    let act = { id: Date.now(), name: cust.name, phone: cust.phone, addr: cust.addr, total: finalTotal, date: new Date().toLocaleDateString(), estimate: JSON.parse(JSON.stringify(currentEstimate)), masterName: appUser.name, masterUid: appUser.uid, payments: { mat: false, cut: false, rough: false, fine: false, extra: false, prepay: Number(document.getElementById('b-prepay').value) || 0 } };
    hDB.push(act); safeSet('h_v31', JSON.stringify(hDB)); updateHistList(); renderChart();
    try { if(db) { await db.collection('history').doc(String(act.id)).set(act); await db.collection('drafts').doc(appUser.uid).delete(); currentEstimate = []; renderMainTable(); } } catch(e){}
    showToast("✅ Объект сохранен в Облако!"); closeModal('buhModal');
}

function updateHistList() {
    let viewHDB = appUser.role === 'admin' ? hDB : hDB.filter(h => h.masterUid === appUser.uid);
    document.getElementById('h-stat').innerHTML = viewHDB.map((h, i) => `<div style="background:rgba(255,255,255,0.6); padding:10px; border-radius:10px; border:1px solid var(--border); margin-bottom:8px; cursor:pointer;" onclick="openObjCard(${h.id})"><div style="display:flex; justify-content:space-between; margin-bottom:6px;"><b style="color:var(--text); font-size:13px;">${h.name || 'Без имени'}</b><b style="color:var(--primary);">${h.total} P</b></div><div style="font-size:10px; color:var(--gray);">Дата: ${h.date} ${appUser.role === 'admin' ? `<br><span style="color:var(--orange);">Мастер: ${h.masterName}</span>` : ''}</div></div>`).join("");
}

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

function closeObjCardAndReturn() { closeModal('objCardModal'); openModal('buhModal'); }

async function addExtraWork() { 
    const n = document.getElementById('extra-work-name').value.trim(); const p = Number(document.getElementById('extra-work-price').value); 
    if(!n || !p) return showToast("❌ Введите название и стоимость"); const obj = hDB.find(x => x.id === currentCardId); 
    if(obj) { 
        if(!obj.estimate) obj.estimate = []; obj.estimate.push({ n: n, p: p, q: 1, type: 'work', tag: 'extra' }); obj.total += p; 
        safeSet('h_v31', JSON.stringify(hDB)); updateHistList(); renderChart(); openObjCard(currentCardId); document.getElementById('extra-work-name').value = ""; document.getElementById('extra-work-price').value = ""; showToast("✅ Доп. работа добавлена!"); 
        try { if(db) await db.collection('history').doc(String(obj.id)).update({ estimate: obj.estimate, total: obj.total }); } catch(e){} 
    } 
}

function loadCustHistoryOptions() {
    let sel = document.getElementById('c-history-select'); 
    if(!sel) return;
    let opts = '<option value="">📥 Загрузить (История)</option>'; 
    let uniqueCusts = []; hDB.forEach(h => { if(h.name && !uniqueCusts.find(c => c.name === h.name)) uniqueCusts.push(h); }); 
    uniqueCusts.forEach(h => { opts += `<option value="${h.id}">${h.name} (${h.date})</option>`; }); 
    sel.innerHTML = opts;
}

function switchDbTab(tab) { 
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active')); 
    document.getElementById(tab === 'mat' ? 'btnTabMat' : 'btnTabWork').classList.add('active'); 
    document.getElementById('editor-mat-list').style.display = tab === 'mat' ? 'block' : 'none'; 
    document.getElementById('editor-work-list').style.display = tab === 'work' ? 'block' : 'none'; 
}

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

async function requestPriceChange(type, id, newPrice) { 
    newPrice = Number(newPrice); 
    if (appUser.role === 'admin') { 
        let dbArr = type === 'mat' ? matDB : workDB; let item = dbArr.find(x => x.id === id); 
        if (item) item.p = newPrice; priceOverrides[id] = newPrice; 
        try { if(db) { await db.collection('settings').doc('price_overrides').set({overrides: priceOverrides}); await db.collection('settings').doc('global_db').set({matDB: matDB, workDB: workDB}); } } catch(e){} 
        showToast("✅ Цена изменена"); 
    } else { showToast("Отправлено админу"); } 
}

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

async function approveUser(uid) { try { await db.collection('users').doc(uid).update({ isApproved: true }); showToast("Одобрено!"); } catch(e){} }

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

async function deleteUser(uid) {
    let conf = await window.customConfirm("Удаление", "Удалить мастера из базы?");
    if(conf && db) { try { await db.collection('users').doc(uid).delete(); renderAdminUsers(); showToast("Удален"); } catch(e){} }
}
