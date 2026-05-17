/*
 * Electric PRO Refactor
 * Module: 03-socket-pool.js
 * V29: функции пула розеток вынесены из 00-core.js.
 *
 * Важно:
 * - пока это безопасный перенос/дублирование;
 * - 00-core.js временно остаётся стабильным runtime;
 * - const/let/var не копируются, чтобы не ломать загрузку дублями.
 */

console.log("03-socket-pool.js V29 loaded");



/* =========================================================

 * SOCKET POOL BLOCK: setPodr

 * ========================================================= */

function setPodr(v, el) { st_podr = v; document.querySelectorAll('#podr-tiles .tile').forEach(t=>t.classList.remove('active')); el.classList.add('active'); }



/* =========================================================

 * SOCKET POOL BLOCK: setH

 * ========================================================= */

function setH(v, el) { st_h = v; if(el){ document.querySelectorAll('#h-tiles .tile').forEach(t=>t.classList.remove('active')); el.classList.add('active'); } }



/* =========================================================

 * SOCKET POOL BLOCK: setP

 * ========================================================= */

function setP(v) { st_p = v; document.querySelectorAll('#p-tiles .tile').forEach((t,i) => { if(i===v-1) t.classList.add('active'); else t.classList.remove('active'); }); }




/* =========================================================

 * SOCKET POOL BLOCK: modM

 * ========================================================= */

function modM(t, v) { 
    let currentP = st_soc + st_sw + st_pass + st_cross + st_tv + st_tpol;
    if (v > 0 && currentP >= 6) return showToast("Максимум 6 постов в одной рамке!");
    if (v < 0 && window['st_'+t] <= 0) return;
    
    window['st_'+t] += v; 
    upUI(); 
}




/* =========================================================

 * SOCKET POOL BLOCK: addGrp

 * ========================================================= */

function addGrp() { 
    let totalMechs = st_soc + st_sw + st_pass + st_cross + st_tv + st_tpol;
    if(totalMechs === 0) return showToast("Сначала добавьте механизмы!");
    
    pool.push({ p:st_p, h:st_h, q:st_q, soc:st_soc, sw:st_sw, pass:st_pass, cross:st_cross, tv:st_tv, tpol:st_tpol, route: document.getElementById('g-routing').value, podr: st_podr }); 
    rfPool(); 
}




/* =========================================================

 * SOCKET POOL BLOCK: popPool

 * ========================================================= */

function popPool() { pool.pop(); rfPool(); }



/* =========================================================

 * SOCKET POOL BLOCK: rfPool

 * ========================================================= */

function rfPool() { 
    document.getElementById('pool-disp').innerHTML = pool.map((g,i) => `<div style="display:flex; justify-content:space-between; padding:8px; border-bottom:1px solid var(--border);"><b>${g.p}п на ${g.h}см (x${g.q}) [${g.podr}]</b> <button onclick="pool.splice(${i},1);rfPool();" style="width:auto; margin:0; background:none; color:red; font-size:16px;">✕</button></div>`).join(""); 
}




/* =========================================================

 * SOCKET POOL BLOCK: applyPoolToEstimate

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

 * SOCKET POOL BLOCK: groupAssignment

 * ========================================================= */

function groupAssignment(group, leakage) {
        const ls = lines.filter(l => l.group === group).map(l => l.name);
        const head = group === 'wet' ? 'Влажные зоны / защита 10 мА' : (groupNames[group] || group);
        return ls.length ? `${head}: ${ls.join(', ')}` : head;
    }
    


/* =========================================================

 * SOCKET POOL BLOCK: switchDbTab

 * ========================================================= */

function switchDbTab(tab) { 
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active')); 
    document.getElementById(tab === 'mat' ? 'btnTabMat' : 'btnTabWork').classList.add('active'); 
    document.getElementById('editor-mat-list').style.display = tab === 'mat' ? 'block' : 'none'; 
    document.getElementById('editor-work-list').style.display = tab === 'work' ? 'block' : 'none'; 
}




/* =========================================================

 * SOCKET POOL BLOCK: groupHtml

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

 * SOCKET POOL BLOCK: groupOf

 * ========================================================= */

function groupOf(it){ return (it && (it.g || it.sc || it.subcategory || it.group)) || ''; }
  


/* =========================================================

 * SOCKET POOL BLOCK: groupAssign

 * ========================================================= */

function groupAssign(g){ var names=lines.filter(function(l){return l.group===g;}).map(function(l){return l.name;}); var head=g==='wet'?'Влажные зоны / защита 10 мА':(groupNames[g]||g); return head+(names.length?': '+names.join(', '):''); }
    


/* =========================================================

 * SOCKET POOL BLOCK: groupLines

 * ========================================================= */

function groupLines(lines){
    var m={};
    lines.forEach(function(l){ var key=curveNom(l.nominal,l.curve); if(!m[key]) m[key]={nominal:key, lines:[], groups:{}}; m[key].lines.push(l.name); m[key].groups[l.group]=true; });
    return Object.keys(m).map(function(k){ return m[k]; });
  }
  


/* =========================================================

 * SOCKET POOL BLOCK: groupNominals

 * ========================================================= */

function groupNominals(lines){ var m={}; lines.forEach(function(l){ var k=l.nominal; if(!m[k]) m[k]={nominal:k,assign:[]}; m[k].assign.push(l.name); }); return Object.keys(m).sort(function(a,b){ var na=Number(a.replace(/\D/g,'')), nb=Number(b.replace(/\D/g,'')); return nb-na; }).map(function(k){return m[k];}); }
  


/* =========================================================

 * SOCKET POOL BLOCK: window.epAutoRegroupActiveDb

 * ========================================================= */

window.epAutoRegroupActiveDb = function(){
    var s=scope();
    if(!confirm('Автоматически разгруппировать выбранную базу: '+activeLabel()+'?')) return;
    var mats=activeArr('mat').map(function(x){return autoGroupMaterial(x);});
    var works=activeArr('work').map(function(x){return autoGroupWork(x);});
    if(s==='global'){ saveServerLocal('mat',mats,isAdmin()); saveServerLocal('work',works,isAdmin()); if(!isAdmin()) epSendServerProposal('server_db', {matDB:mats,workDB:works}, 'regroup_server_db'); }
    else { saveMyLocal('mat',mats); saveMyLocal('work',works); }
    renderDbEditors();
    toast('✅ Разгруппировка выполнена');
  };
