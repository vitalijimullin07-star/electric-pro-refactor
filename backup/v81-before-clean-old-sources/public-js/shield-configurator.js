// === SHIELD CONFIGURATOR ===


// === modV ===
function modV(id, val) { cfg[id] = Math.max(0, cfg[id] + val); document.getElementById('v-'+id).innerText = cfg[id]; }


// === populateShieldExtras ===
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


// === addExtraToShieldConfig ===
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


// === renderShieldExtras ===
function renderShieldExtras() {
    document.getElementById('shield-extras-list').innerHTML = currentShieldExtras.map((ex, i) =>
        `<div style="display:flex; justify-content:space-between; font-size:11px; border-bottom:1px dashed rgba(0,0,0,0.1); padding:4px;"><span>${ex.n} <b style="color:var(--primary);">(x${ex.q})</b></span><span style="color:red; font-size:16px; font-weight:bold; cursor:pointer;" onclick="currentShieldExtras.splice(${i},1); renderShieldExtras();">✕</span></div>`
    ).join('');
}


// === generateCascadePanel ===
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
