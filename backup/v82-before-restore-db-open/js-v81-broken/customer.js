// === CUSTOMER / OBJECT DATA ===

// === updateMasterBadge ===
function updateMasterBadge() { document.getElementById('master-badge').innerHTML = `${appUser?.name || "Мастер"}<br>Объект: ${cust.name || 'Не выбран'}`; }

// === saveCust ===
function saveCust() { 
    cust.name = document.getElementById('c-name').value; 
    cust.addr = document.getElementById('c-addr').value;
    cust.ceil = document.getElementById('c-ceil').value;
    cust.phone = document.getElementById('c-phone').value;
    safeSet('cust_v31', JSON.stringify(cust)); 
    closeModal('custModal'); updateMasterBadge(); 
}
