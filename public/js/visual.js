// === VISUAL / UI HELPERS ===

// === window.customAlert ===
window.customAlert = (title, text) => {
    return new Promise(resolve => {
        const overlay = document.getElementById('custom-modal-overlay');
        document.getElementById('cm-title').innerText = title;
        document.getElementById('cm-text').innerText = text;
        document.getElementById('cm-input').style.display = 'none';
        document.getElementById('cm-cancel').style.display = 'none';
        overlay.style.display = 'flex';
        document.getElementById('cm-ok').onclick = () => { overlay.style.display = 'none'; resolve(); };
    });
};

// === window.customConfirm ===
window.customConfirm = (title, text) => {
    return new Promise(resolve => {
        const overlay = document.getElementById('custom-modal-overlay');
        document.getElementById('cm-title').innerText = title;
        document.getElementById('cm-text').innerText = text;
        document.getElementById('cm-input').style.display = 'none';
        document.getElementById('cm-cancel').style.display = 'block';
        overlay.style.display = 'flex';
        document.getElementById('cm-ok').onclick = () => { overlay.style.display = 'none'; resolve(true); };
        document.getElementById('cm-cancel').onclick = () => { overlay.style.display = 'none'; resolve(false); };
    });
};

// === window.alert ===
window.alert = (msg) => { window.customAlert("Уведомление", msg); };

// === hideLoader ===
function hideLoader() { document.getElementById('global-loader').classList.remove('show'); }

// === showToast ===
function showToast(msg) { let t = document.getElementById('toast'); t.innerText = msg; t.classList.add('show'); setTimeout(() => t.classList.remove('show'), 3000); }

// === openModal ===
function openModal(id) { 
    if(id === 'custModal') loadCustHistoryOptions(); 
    if(id === 'logicModal') renderLogicUI(); 
    if(id === 'settModal') renderDbEditors(); 
    if(id === 'configModal') populateShieldExtras();
    if(id === 'buhModal') setTimeout(renderChart, 100);
    document.getElementById(id).style.display='flex'; 
}

// === closeModal ===
function closeModal(id) { document.getElementById(id).style.display='none'; }

// === toggleMenu ===
function toggleMenu() { document.getElementById('burger-menu').classList.toggle('open'); document.getElementById('burger-overlay').classList.toggle('open'); }
