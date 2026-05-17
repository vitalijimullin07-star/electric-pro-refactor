/*
 * Extracted from public/index.html
 * Original script block: 6
 * Original HTML lines: 4187-4391
 */

(function(){
  const BRAND_LIST = ['ABB','IEK','ИЭК','EKF','Schneider','Schneider Electric','Legrand','Hager','Dekraft','CHINT','Tekfor','TDM'];

  function qs(id){ return document.getElementById(id); }
  function toast(t){ if(typeof showToast==='function') showToast(t); else console.log(t); }
  function safe(s){ return String(s == null ? '' : s).replace(/[&<>"]/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[m])); }
  function norm(s){ return String(s||'').toLowerCase().replace(/с/g,'c').replace(/а/g,'a').replace(/в/g,'b').replace(/х/g,'x').replace(/ё/g,'е').replace(/[×]/g,'x').replace(/[^a-zа-я0-9]+/g,' ').trim(); }
  function dbArr(type){
    try { return type === 'mat' ? matDB : workDB; } catch(e) { return type === 'mat' ? (window.matDB || []) : (window.workDB || []); }
  }
  function setDbArr(type, arr){
    try { if(type === 'mat') matDB = arr; else workDB = arr; } catch(e) { if(type === 'mat') window.matDB = arr; else window.workDB = arr; }
  }
  function detectBrand(s){ const raw = String(s||''); const n = norm(raw); for(const b of BRAND_LIST){ if(n.includes(norm(b))) return b === 'ИЭК' ? 'IEK' : b; } return ''; }
  function detectNominal(s){ const n = norm(s).replace(/\s+/g,''); const m = n.match(/([abcd])([0-9]{1,3})/i); return m ? (m[1].toUpperCase()+m[2]) : ''; }
  function getGroup(it){ return it.g || it.sc || it.subcategory || it.group || ''; }
  function setGroup(it,g){ it.g = it.g || g; it.sc = it.sc || g; }

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

  function renderGrouped(arr, type, prefix){
    arr = arr || [];
    const cats = {};
    arr.forEach(it => { const c = it.c || 'Разное'; (cats[c]||(cats[c]={direct:[], groups:{}})); const g=getGroup(it); if(g){ (cats[c].groups[g]||(cats[c].groups[g]=[])).push(it); } else cats[c].direct.push(it); });
    let html = ''; let ci = 0;
    Object.keys(cats).sort().forEach(function(c){
      const cid = prefix+'_cat_'+(ci++);
      const color = type==='work' ? 'color:var(--orange);background:rgba(245,158,11,.08);' : '';
      html += '<div class="cat-header" style="'+color+'" onclick="toggleCat(\''+cid+'\')">'+safe(c)+'</div><div class="cat-body" id="'+cid+'">';
      const cat = cats[c]; let gi = 0;
      Object.keys(cat.groups).sort().forEach(function(g){
        const gid = cid+'_g_'+(gi++);
        html += '<div class="ep-db-sub-header" onclick="epDbToggleSub(\''+gid+'\', event)"><span>'+safe(g)+'</span><small>открыть</small></div><div class="ep-db-sub-body" id="'+gid+'">';
        cat.groups[g].forEach(it => { html += renderItem(it,type); });
        html += '</div>';
      });
      cat.direct.forEach(it => { html += renderItem(it,type); });
      html += '</div>';
    });
    return html || '<div style="padding:15px;color:var(--gray);font-weight:700;">База пустая или ещё загружается</div>';
  }
  function renderItem(it,type){
    const id = String(it.id || '');
    const meta = [getGroup(it), it.brand, it.nominal, it.curve, it.rcdType, it.leakage].filter(Boolean).join(' • ');
    const btnColor = type==='work' ? 'background:var(--orange);' : '';
    return '<div class="mat-item"><div style="flex:1;"><div class="ep-db-item-title">'+safe(it.n || 'Позиция')+'</div><div class="ep-db-item-meta">'+safe(meta)+' '+safe(Number(it.p)||0)+' ₽ / '+safe(it.u || 'шт')+'</div></div><button class="mat-add-btn" style="'+btnColor+'width:auto;margin:0;" onclick="promptAdd(\''+safe(id)+'\', \''+type+'\')">+ Добавить</button></div>';
  }
  window.epDbToggleSub = function(id,e){ if(e) e.stopPropagation(); const el=qs(id); if(el) el.classList.toggle('active'); };

  const oldOpenMat = window.openMatCatalog;
  const oldOpenWork = window.openWorkCatalog;
  const oldRenderDb = window.renderDbEditors;
  window.openMatCatalog = function(){ try{ normalizeMaterialDb(); const el=qs('mat-cat-list'); if(el){ el.innerHTML = renderGrouped(dbArr('mat'), 'mat', 'mat'); openModal('matCatModal'); return; } }catch(e){ console.error(e); } if(oldOpenMat) oldOpenMat(); };
  window.openWorkCatalog = function(){ try{ const el=qs('work-cat-list'); if(el){ el.innerHTML = renderGrouped(dbArr('work'), 'work', 'work'); openModal('workModal'); return; } }catch(e){ console.error(e); } if(oldOpenWork) oldOpenWork(); };
  window.renderDbEditors = function(){
    try{
      normalizeMaterialDb();
      const dc = qs('db-cats'); if(dc){ const all = [].concat(dbArr('mat')||[], dbArr('work')||[]); dc.innerHTML = Array.from(new Set(all.map(x => x.c || 'Разное'))).sort().map(c => '<option value="'+safe(c)+'">').join(''); }
      const em=qs('editor-mat-list'); if(em) em.innerHTML = renderGrouped(dbArr('mat'), 'mat', 'edmat');
      const ew=qs('editor-work-list'); if(ew) ew.innerHTML = renderGrouped(dbArr('work'), 'work', 'edwork');
    }catch(e){ console.error(e); if(oldRenderDb) oldRenderDb(); }
  };

  function savedChoices(){ try{return JSON.parse(localStorage.getItem('ep_db_default_choices_v1')||'{}');}catch(e){return{};} }
  function saveChoice(key,id){ const m=savedChoices(); m[key]=id; localStorage.setItem('ep_db_default_choices_v1', JSON.stringify(m)); }
  function lookupKey(type, meta, label){
    meta = meta || {};
    const parts = [type, meta.kind||'', meta.brand||detectBrand(label)||'', meta.nominal||detectNominal(label)||'', meta.curve||'', meta.poles||'', meta.leakage||'', meta.rcdType||'', meta.modules||''];
    return parts.map(x=>String(x||'').trim()).join('|');
  }
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

  const oldEpMat = window.epMat;
  window.epMat = function(label, q, fallbackPrice, words, meta){
    const r = smartFindMat(label, words, meta || {});
    if(r.item){ return { n: r.item.n, q:q, p:Number(r.item.p)||0, u:r.item.u||'шт', type:'mat', sourceId:r.item.id||null, epLookupKey:r.key }; }
    const clean = reqName(label, meta || {});
    const m = meta || {};
    const extra = m.category ? ' ['+m.category+(m.subcategory?' → '+m.subcategory:'')+']' : '';
    return { n:'⚠️ '+clean+extra+' — добавить в БД', q:q, p:Number(fallbackPrice)||0, u:m.unit||'шт', type:'mat', needDb:true, dbMeta:m, epLookupKey:r.key };
  };
  try { epMat = window.epMat; } catch(e) {}

  function canonicalName(it){
    let n = String(it.n || '').replace(/^⚠️\s*/,'').replace(/\s*\[[^\]]+\]\s*—\s*добавить в БД/i,'').trim();
    const brand = detectBrand(n);
    const nominal = detectNominal(n);
    if(/автомат/i.test(n) && nominal) return 'Автомат '+nominal+(brand?' '+brand:'');
    if(/диф/i.test(n)){ const leak=(n.match(/(10|30|100|300)\s*мА/i)||[])[1]; const typ=(n.match(/тип\s*([A-Za-zА-Яа-я]+)/i)||[])[1]; return ('ДИФ '+(leak?leak+'мА ':'')+(typ?typ+' ':'')+(brand||'')).trim(); }
    if(/узо/i.test(n)){ const leak=(n.match(/(10|30|100|300)\s*мА/i)||[])[1]; const typ=(n.match(/тип\s*([A-Za-zА-Яа-я]+)/i)||[])[1]; return ('УЗО '+(leak?leak+'мА ':'')+(typ?typ+' ':'')+(brand||'')).trim(); }
    return n.replace(/\s+—\s+.*$/,'').trim();
  }
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
  const oldRender = window.renderMainTable;
  window.renderMainTable = function(){ mergeEstimate(); if(oldRender) return oldRender(); };

  const oldApplySwap = window.applySwap;
  window.applySwap = function(){
    try{
      if(typeof swapTargetIdx !== 'undefined' && swapTargetIdx >= 0){
        const sel = qs('swap-select');
        const current = currentEstimate[swapTargetIdx];
        if(sel && current && current.epLookupKey) saveChoice(current.epLookupKey, sel.value);
      }
    }catch(e){ console.error(e); }
    if(oldApplySwap) oldApplySwap();
    mergeEstimate(); if(oldRender) oldRender();
    toast('Заменено и закреплено для следующих сборок');
  };

  const oldOpenSwap = window.openSwapModal;
  window.openSwapModal = function(idx){
    if(oldOpenSwap) oldOpenSwap(idx);
    try{
      const box = qs('swapModal')?.querySelector('.modal-content');
      if(box && !qs('ep-swap-note')){
        const div = document.createElement('div'); div.id='ep-swap-note'; div.className='ep-swap-note'; div.innerHTML='После замены выбор закрепится как вариант по умолчанию для следующих сборок щита.';
        const sel = qs('swap-select'); if(sel && sel.parentNode) sel.parentNode.insertBefore(div, sel.nextSibling);
      }
    }catch(e){}
  };

  function boot(){ try{ normalizeMaterialDb(); }catch(e){} }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded', boot); else boot();
  setTimeout(boot,500); setTimeout(boot,1500);
})();
