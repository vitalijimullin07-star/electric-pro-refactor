// === SETTINGS ===


// === changeTheme ===
function changeTheme(theme) { document.documentElement.setAttribute('data-theme', theme); safeSet('theme_v31', theme); }


// === updateCoeffs ===
function updateCoeffs() {
    coeffs.mat = Number(document.getElementById('m-coeff').value);
    coeffs.work = Number(document.getElementById('w-coeff').value);
    safeSet('coeffs_v31', JSON.stringify(coeffs));
    renderMainTable();
}


// === saveQRs ===
function saveQRs() { 
    safeSet('qr_tg_v31', document.getElementById('qr-tg').value); 
    safeSet('qr_wa_v31', document.getElementById('qr-wa').value); 
    safeSet('qr_vk_v31', document.getElementById('qr-vk').value);
    safeSet('ai_shops_v31', document.getElementById('ai-shops').value); 
    showToast("📱 Настройки сохранены"); 
}


// === saveLogic ===
function saveLogic() { 
    appLogic.priceSoc = Number(document.getElementById('logic-price-soc').value);
    appLogic.priceShield = Number(document.getElementById('logic-price-shield').value);
    appLogic.priceDrill = Number(document.getElementById('logic-price-drill').value);
    appLogic.priceShtroba = Number(document.getElementById('logic-price-shtroba').value);
    appLogic.priceCabCeil = Number(document.getElementById('logic-price-cab-ceil').value);
    
    appLogic.socketsPerJb = Number(document.getElementById('logic-soc-jb').value) || 3;
    appLogic.connPerSocJb = Number(document.getElementById('logic-conn-soc').value) || 3;
    appLogic.connPerSwJb = Number(document.getElementById('logic-conn-sw').value) || 3;
    appLogic.connPerPassJb = Number(document.getElementById('logic-conn-pass').value) || 4;

    safeSet('appLogic_v31', JSON.stringify(appLogic));
    showToast("Логика сохранена!"); closeModal('logicModal'); 
}


// === renderLogicUI ===
function renderLogicUI() { 
    document.getElementById('logic-price-soc').value = appLogic.priceSoc; 
    document.getElementById('logic-price-shield').value = appLogic.priceShield; 
    document.getElementById('logic-price-drill').value = appLogic.priceDrill; 
    document.getElementById('logic-price-shtroba').value = appLogic.priceShtroba; 
    document.getElementById('logic-price-cab-ceil').value = appLogic.priceCabCeil; 

    document.getElementById('logic-soc-jb').value = appLogic.socketsPerJb; 
    document.getElementById('logic-conn-soc').value = appLogic.connPerSocJb; 
    document.getElementById('logic-conn-sw').value = appLogic.connPerSwJb; 
    document.getElementById('logic-conn-pass').value = appLogic.connPerPassJb; 
}
