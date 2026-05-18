// === ACCOUNTING / HISTORY / ACTS ===


// === printAct ===
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


// === deleteAct ===
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


// === togglePay ===
function togglePay(field) {
    let obj = hDB.find(x => x.id === currentCardId);
    if(obj) {
        if(!obj.payments) obj.payments = {};
        obj.payments[field] = document.getElementById('pay-' + field).checked;
        safeSet('h_v31', JSON.stringify(hDB));
        if(db) db.collection('history').doc(String(obj.id)).update({ payments: obj.payments }).catch(()=>{});
    }
}


// === updatePayPrepay ===
function updatePayPrepay(val) {
    let obj = hDB.find(x => x.id === currentCardId);
    if(obj) {
        if(!obj.payments) obj.payments = {};
        obj.payments.prepay = Number(val) || 0;
        safeSet('h_v31', JSON.stringify(hDB));
        if(db) db.collection('history').doc(String(obj.id)).update({ payments: obj.payments }).catch(()=>{});
    }
}


// === renderChart ===
function renderChart() {
    const canvas = document.getElementById('buhChart');
    if (!canvas) return;

    const box = document.getElementById('buh-chart-box');
    if (box) {
        box.style.height = '240px';
        box.style.minHeight = '240px';
        box.style.maxHeight = '240px';
        box.style.overflow = 'hidden';
    }

    canvas.style.width = '100%';
    canvas.style.height = '240px';
    canvas.style.maxHeight = '240px';
    canvas.height = 240;

    const ctx = canvas.getContext('2d');

    if (buhChartInstance) {
        try { buhChartInstance.destroy(); } catch(e) {}
        buhChartInstance = null;
    }

    let period = document.getElementById('chart-period').value;
    let type = document.getElementById('chart-type').value;

    let viewDB = appUser.role === 'admin'
        ? hDB
        : hDB.filter(h => h.masterUid === appUser.uid);

    let grouped = {};

    viewDB.forEach(h => {
        let parts = h.date.split('.');
        if (parts.length !== 3) return;

        let key = '';

        if (period === 'year') {
            key = `${parts[1]}.${parts[2]}`;
        } else if (period === 'all') {
            key = parts[2];
        } else {
            key = `${parts[0]}.${parts[1]}`;
        }

        if (!grouped[key]) grouped[key] = 0;
        grouped[key] += h.total;
    });

    let sortedKeys = Object.keys(grouped).sort();
    let data = sortedKeys.map(k => grouped[k]);

    buhChartInstance = new Chart(ctx, {
        type: type,
        data: {
            labels: sortedKeys,
            datasets: [{
                label: 'Доход (₽)',
                data: data,
                backgroundColor: '#4F46E5',
                borderColor: '#4F46E5',
                tension: 0.2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            animation: false,
            resizeDelay: 200,
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

// === updateBuhUI ===
function updateBuhUI() {
    let sumW = 0, sumM = 0, matBase = 0, workBase = 0;
    currentEstimate.forEach(it => { let price = fPrice(it); if(it.type==='work') { sumW += price * it.q; workBase += (it.p||0) * it.q; } else { sumM += price * it.q; matBase += (it.p||0) * it.q; } });
    let disc = Number(document.getElementById('b-discount').value) || 0, prep = Number(document.getElementById('b-prepay').value) || 0;
    document.getElementById('b-work').innerText = sumW + ' P'; document.getElementById('b-mat').innerText = sumM + ' P'; 
    document.getElementById('p-total').innerText = (workBase + (sumM - matBase)) + ' P'; 
    document.getElementById('b-final').innerText = (sumW + sumM - disc - prep) + ' P';
}


// === saveHist ===
async function saveHist() {
    const finalTotal = parseInt(document.getElementById('b-final').innerText) || 0;
    let act = { id: Date.now(), name: cust.name, phone: cust.phone, addr: cust.addr, total: finalTotal, date: new Date().toLocaleDateString(), estimate: JSON.parse(JSON.stringify(currentEstimate)), masterName: appUser.name, masterUid: appUser.uid, payments: { mat: false, cut: false, rough: false, fine: false, extra: false, prepay: Number(document.getElementById('b-prepay').value) || 0 } };
    hDB.push(act); safeSet('h_v31', JSON.stringify(hDB)); updateHistList(); renderChart();
    try { if(db) { await db.collection('history').doc(String(act.id)).set(act); await db.collection('drafts').doc(appUser.uid).delete(); currentEstimate = []; renderMainTable(); } } catch(e){}
    showToast("✅ Объект сохранен в Облако!"); closeModal('buhModal');
}


// === updateHistList ===
function updateHistList() {
    let viewHDB = appUser.role === 'admin' ? hDB : hDB.filter(h => h.masterUid === appUser.uid);
    document.getElementById('h-stat').innerHTML = viewHDB.map((h, i) => `<div style="background:rgba(255,255,255,0.6); padding:10px; border-radius:10px; border:1px solid var(--border); margin-bottom:8px; cursor:pointer;" onclick="openObjCard(${h.id})"><div style="display:flex; justify-content:space-between; margin-bottom:6px;"><b style="color:var(--text); font-size:13px;">${h.name || 'Без имени'}</b><b style="color:var(--primary);">${h.total} P</b></div><div style="font-size:10px; color:var(--gray);">Дата: ${h.date} ${appUser.role === 'admin' ? `<br><span style="color:var(--orange);">Мастер: ${h.masterName}</span>` : ''}</div></div>`).join("");
}


// === openObjCard ===
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


// === closeObjCardAndReturn ===
function closeObjCardAndReturn() { closeModal('objCardModal'); openModal('buhModal'); }


// === addExtraWork ===
async function addExtraWork() { 
    const n = document.getElementById('extra-work-name').value.trim(); const p = Number(document.getElementById('extra-work-price').value); 
    if(!n || !p) return showToast("❌ Введите название и стоимость"); const obj = hDB.find(x => x.id === currentCardId); 
    if(obj) { 
        if(!obj.estimate) obj.estimate = []; obj.estimate.push({ n: n, p: p, q: 1, type: 'work', tag: 'extra' }); obj.total += p; 
        safeSet('h_v31', JSON.stringify(hDB)); updateHistList(); renderChart(); openObjCard(currentCardId); document.getElementById('extra-work-name').value = ""; document.getElementById('extra-work-price').value = ""; showToast("✅ Доп. работа добавлена!"); 
        try { if(db) await db.collection('history').doc(String(obj.id)).update({ estimate: obj.estimate, total: obj.total }); } catch(e){} 
    } 
}


// === loadCustHistoryOptions ===
function loadCustHistoryOptions() {
    let sel = document.getElementById('c-history-select'); 
    if(!sel) return;
    let opts = '<option value="">📥 Загрузить (История)</option>'; 
    let uniqueCusts = []; hDB.forEach(h => { if(h.name && !uniqueCusts.find(c => c.name === h.name)) uniqueCusts.push(h); }); 
    uniqueCusts.forEach(h => { opts += `<option value="${h.id}">${h.name} (${h.date})</option>`; }); 
    sel.innerHTML = opts;
}
