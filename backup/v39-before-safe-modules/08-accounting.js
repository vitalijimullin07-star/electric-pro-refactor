/*
 * Electric PRO Refactor
 * Module: 08-accounting.js
 * V35: бухгалтерия / деньги / расходы / прибыль.
 *
 * Важно:
 * - переносим только полноценные function / async function;
 * - window.* куски пока не переносим;
 * - 00-core.js временно остаётся стабильным runtime;
 * - окончательная чистка будет позже.
 */

console.log("08-accounting.js V35 loaded");



/* =========================================================
 * ACCOUNTING FUNCTION: fPrice
 * ========================================================= */
function fPrice(it) { return Math.round((it.p || 0) * (1 + (it.type === 'mat'? coeffs.mat: coeffs.work) / 100)); }



/* =========================================================
 * ACCOUNTING FUNCTION: epAutoPrice
 * ========================================================= */
function epAutoPrice(brand) { return brand === 'ABB' ? 350 : 155; }


/* =========================================================
 * ACCOUNTING FUNCTION: epDifPrice
 * ========================================================= */
function epDifPrice(brand) { return brand === 'ABB' ? 4500 : 3600; }



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
 * ACCOUNTING FUNCTION: epMoney
 * ========================================================= */
function epMoney(v) {
        const n = Number(String(v || '').replace(',', '.').replace(/[^\d.]/g, ''));
        return Number.isFinite(n) ? n : 0;
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
 * ACCOUNTING FUNCTION: money
 * ========================================================= */
function money(v){ var n = Number(String(v == null ? '' : v).replace(',', '.').replace(/[^\d.\-]/g,'')); return Number.isFinite(n) ? n : 0; }
  

/* =========================================================
 * ACCOUNTING FUNCTION: appPrice
 * ========================================================= */
function appPrice(key, def){ try{ return money((window.appLogic||{})[key]) || def; }catch(e){ return def; } }
  

/* =========================================================
 * ACCOUNTING FUNCTION: rcdPrice
 * ========================================================= */
function rcdPrice(leak,brand,kind){ var hit=dbFindRcd(leak,brand,kind); if(hit) return money(hit.p); return leak===10?3600:1195; }
  
