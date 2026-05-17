/*
 * Extracted from public/index.html
 * Original script block: 28
 * Original HTML lines: 10398-10596
 */

/* EP V21: stable bulk management panel. Fixes select dropdown closing because V18 panel was re-rendered every 2.5s. */
(function(){
  'use strict';
  var BUILD='V21 STABLE BULK PANEL 2026-05-15';
  var LS_SCOPE='ep_db_scope_v2';
  var LS_MY_MAT='user_db_mat_v31';
  var LS_MY_WORK='user_db_work_v31';
  var LS_SERVER_CACHE='ep_global_cache_force_v1';
  function $(id){ return document.getElementById(id); }
  function clean(v){ return String(v==null?'':v).replace(/\s+/g,' ').trim(); }
  function esc(v){ return String(v==null?'':v).replace(/[&<>"']/g,function(m){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m];}); }
  function toast(t){ try{ if(typeof showToast==='function') showToast(t); else console.log(t); }catch(e){ console.log(t); } }
  function arrLS(k){ try{ var a=JSON.parse(localStorage.getItem(k)||'[]'); return Array.isArray(a)?a:[]; }catch(e){ return []; } }
  function objLS(k){ try{ var o=JSON.parse(localStorage.getItem(k)||'{}'); return o&&typeof o==='object'?o:{}; }catch(e){ return {}; } }
  function setArrLS(k,a){ try{ if(typeof safeSet==='function') safeSet(k, JSON.stringify(a||[])); else localStorage.setItem(k, JSON.stringify(a||[])); }catch(e){ try{ localStorage.setItem(k, JSON.stringify(a||[])); }catch(_e){} } }
  function setObjLS(k,o){ try{ localStorage.setItem(k, JSON.stringify(o||{})); }catch(e){} }
  function scope(){ try{ return localStorage.getItem(LS_SCOPE)==='global'?'global':'my'; }catch(e){ return 'my'; } }
  function isAdmin(){ try{ return !!(window.appUser && window.appUser.role==='admin'); }catch(e){ return false; } }
  function uid(){ try{ return (window.appUser && window.appUser.uid) || ''; }catch(e){ return ''; } }
  function groupOf(it){ return clean((it&&(it.g||it.sc||it.subcategory||it.group))||''); }
  function clone(x){ return Object.assign({}, x||{}); }
  function norm(v){ return clean(v).toLowerCase().replace(/ё/g,'е').replace(/×/g,'x').replace(/х/g,'x'); }
  function uniq(arr,type){
    var seen={}, out=[];
    (arr||[]).forEach(function(raw,i){
      var it=clone(raw); if(!it.n) return;
      if(!it.id) it.id=(type==='work'?'w':'m')+'_v21_'+Date.now()+'_'+i+'_'+Math.random().toString(36).slice(2,7);
      if(it.sc&&!it.g) it.g=it.sc; if(it.g&&!it.sc) it.sc=it.g;
      var k=type+'|'+norm([it.c,groupOf(it),it.n,it.u].join('|'));
      if(seen[k]) return; seen[k]=1; out.push(it);
    });
    return out;
  }
  function getServerCache(){ var c=objLS(LS_SERVER_CACHE); return {matDB:Array.isArray(c.matDB)?c.matDB:[], workDB:Array.isArray(c.workDB)?c.workDB:[]}; }
  function getArr(type,src){
    type=type==='work'?'work':'mat'; src=src||scope();
    if(src==='global'){
      var w=type==='work'?window.EP_GLOBAL_WORK:window.EP_GLOBAL_MAT;
      if(Array.isArray(w)) return w.slice();
      var c=getServerCache(); return (type==='work'?c.workDB:c.matDB).slice();
    }
    var mw=type==='work'?window.EP_MY_WORK:window.EP_MY_MAT;
    if(Array.isArray(mw)) return mw.slice();
    return arrLS(type==='work'?LS_MY_WORK:LS_MY_MAT);
  }
  function syncMain(src){
    try{ window.matDB=getArr('mat',src); window.workDB=getArr('work',src); try{ matDB=window.matDB; workDB=window.workDB; }catch(e){} }catch(e){}
  }
  function setStatus(state,msg){
    try{ if(typeof window.epV18SetStatus==='function'){ window.epV18SetStatus(state,msg); return; } }catch(e){}
    var b=$('ep-v18-status-badge')||document.createElement('div');
    b.id='ep-v18-status-badge';
    b.style.cssText='position:fixed;left:10px;bottom:12px;z-index:2147483647;border-radius:999px;padding:8px 13px;color:#fff;font-size:12px;font-weight:1000;box-shadow:0 10px 30px rgba(0,0,0,.25);border:2px solid rgba(255,255,255,.55);letter-spacing:.2px;background:'+(state==='upload'?'#dc2626':state==='download'?'#2563eb':state==='error'?'#991b1b':'#16a34a')+';';
    b.textContent=(state==='upload'?'🔴 ':state==='download'?'🔵 ':state==='error'?'⚠️ ':'✅ ')+(msg||'V21 активна');
    if(!b.parentNode) document.body.appendChild(b);
  }
  async function saveArr(type,arr){
    type=type==='work'?'work':'mat'; var src=scope(); arr=uniq(arr,type);
    if(src==='global'){
      if(!isAdmin()){ toast('Серверную базу редактирует только админ'); return false; }
      var c=getServerCache(); if(type==='mat') c.matDB=arr; else c.workDB=arr;
      window.EP_GLOBAL_MAT=c.matDB; window.EP_GLOBAL_WORK=c.workDB;
      window.EP_FORCE_GLOBAL={matDB:c.matDB,workDB:c.workDB};
      window.EP_ULTIMATE_DB_CACHE={matDB:c.matDB,workDB:c.workDB,ts:Date.now()};
      window.EP_GLOBAL_DB_VISIBLE_CACHE={matDB:c.matDB,workDB:c.workDB,ts:Date.now()};
      setObjLS(LS_SERVER_CACHE,{matDB:c.matDB,workDB:c.workDB,ts:Date.now()});
      syncMain('global'); setStatus('upload','запись на сервер');
      try{ if(typeof db!=='undefined' && db){ await db.collection('settings').doc('global_db').set({matDB:c.matDB,workDB:c.workDB,updatedAt:new Date().toISOString()},{merge:true}); } }
      catch(e){ setStatus('error','ошибка сервера'); toast('Ошибка записи сервера: '+(e.message||e)); return false; }
      setStatus('ok','V21 активна'); return true;
    }
    if(type==='mat'){ window.EP_MY_MAT=arr; setArrLS(LS_MY_MAT,arr); }
    else { window.EP_MY_WORK=arr; setArrLS(LS_MY_WORK,arr); }
    try{ window.userMatDB=getArr('mat','my'); window.userWorkDB=getArr('work','my'); localStorage.setItem('ep_master_db_created_v1','1'); }catch(e){}
    syncMain('my'); setStatus('upload','запись на сервер');
    try{ if(typeof db!=='undefined' && db && uid()){ await db.collection('user_db').doc(uid()).set({uid:uid(),masterName:(window.appUser&&(appUser.name||appUser.email))||'',matDB:getArr('mat','my'),workDB:getArr('work','my'),created:true,updatedAt:new Date().toISOString()},{merge:true}); } }
    catch(e){ toast('Локально сохранено, сервер личной базы отказал: '+(e.message||e)); }
    setStatus('ok','V21 активна'); return true;
  }
  function activeType(){
    var m=$('editor-mat-list'), w=$('editor-work-list');
    if(m && m.offsetParent!==null) return 'mat';
    if(w && w.offsetParent!==null) return 'work';
    try{ var activeBtn=Array.prototype.find.call(document.querySelectorAll('#settModal button'),function(b){ return /Материалы/.test(b.textContent||'') && /active|white|#fff/.test(b.className+' '+b.style.background); }); if(activeBtn) return 'mat'; }catch(e){}
    return 'mat';
  }
  function visibleHost(){ return $('editor-mat-list') || $('editor-work-list'); }
  function options(vals,placeholder,current){
    var seen={}, out=[]; (vals||[]).forEach(function(v){ v=clean(v); if(v&&!seen[v]){ seen[v]=1; out.push(v); } });
    out.sort(function(a,b){ return a.localeCompare(b,'ru'); });
    var h='<option value="">'+esc(placeholder)+'</option>';
    out.forEach(function(v){ h+='<option value="'+esc(v)+'"'+(v===current?' selected':'')+'>'+esc(v)+'</option>'; });
    return h;
  }
  function fillSelectors(force){
    var cat=$('ep-v21-move-cat'), sub=$('ep-v21-move-sub'); if(!cat||!sub) return;
    var active=document.activeElement;
    if(!force && (active===cat || active===sub)) return;
    var oldCat=cat.value, oldSub=sub.value;
    var type=activeType(), arr=getArr(type);
    var cats=arr.map(function(x){ return x.c||'Разное'; });
    var subs=arr.filter(function(x){ return !oldCat || clean(x.c||'Разное')===oldCat; }).map(function(x){ return groupOf(x)||'Без группы'; });
    cat.innerHTML=options(cats,'Категория',oldCat);
    sub.innerHTML=options(subs,'Подкатегория',oldSub);
  }
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
  function hideOldBulk(){
    ['ep-v17-bulk-box','ep-v18-bulk-box'].forEach(function(id){ var el=$(id); if(el){ el.style.display='none'; el.setAttribute('aria-hidden','true'); } });
  }
  function rowId(row,type,idx){
    var price=row.querySelector('input[type="number"][data-id]'); if(price && price.getAttribute('data-id')) return {id:price.getAttribute('data-id'), type:price.getAttribute('data-type')||type};
    var itemBtn=row.querySelector('[data-item]');
    if(itemBtn){ try{ var raw=decodeURIComponent(escape(atob(itemBtn.getAttribute('data-item')))); var obj=JSON.parse(raw); if(obj&&obj.id) return {id:obj.id,type:itemBtn.getAttribute('data-type')||type}; }catch(e){} }
    return {id:'v21row_'+type+'_'+idx+'_'+clean(row.textContent).slice(0,40), type:type};
  }
  function ensureChecks(){
    ['editor-mat-list','editor-work-list'].forEach(function(id){
      var box=$(id); if(!box) return; var type=id.indexOf('work')>=0?'work':'mat';
      Array.prototype.forEach.call(box.querySelectorAll('.emp-row,.mat-item'),function(row,idx){
        var old=row.querySelector('.ep-v18-check,.ep-v21-check');
        if(old){ old.classList.add('ep-v21-check'); return; }
        var info=rowId(row,type,idx);
        var ch=document.createElement('input'); ch.type='checkbox'; ch.className='ep-v21-check'; ch.dataset.type=info.type||type; ch.dataset.id=info.id;
        ch.style.cssText='width:22px;height:22px;min-width:22px;accent-color:#16a34a;margin:7px 10px 0 0;';
        row.insertBefore(ch,row.firstChild);
      });
    });
  }
  function ensurePanel(){
    hideOldBulk();
    var host=visibleHost(); if(!host) return;
    var box=$('ep-v21-bulk-box');
    if(!box){ host.insertAdjacentHTML('beforebegin',panelHtml()); fillSelectors(true); }
    else if(!box.parentNode || !document.body.contains(box)){ host.insertAdjacentHTML('beforebegin',panelHtml()); fillSelectors(true); }
    ensureChecks(); hideOldBulk();
  }
  window.epV21UpdateSubs=function(){ fillSelectors(true); };
  function selected(){ return Array.prototype.slice.call(document.querySelectorAll('#settModal .ep-v21-check:checked, #settModal .ep-v18-check:checked')); }
  window.epV21SelectVisible=function(on){
    Array.prototype.forEach.call(document.querySelectorAll('#settModal .ep-v21-check, #settModal .ep-v18-check'),function(ch){ var row=ch.closest('.emp-row,.mat-item'); if(!row || row.offsetParent!==null) ch.checked=!!on; });
  };
  window.epV21MoveSelected=async function(){
    var checks=selected(); if(!checks.length) return toast('Выбери позиции галочками слева');
    var cat=clean($('ep-v21-move-cat')&&$('ep-v21-move-cat').value), sub=clean($('ep-v21-move-sub')&&$('ep-v21-move-sub').value);
    if(!cat&&!sub) return toast('Выбери категорию или подкатегорию');
    var byType={mat:{},work:{}}; checks.forEach(function(ch){ byType[ch.dataset.type==='work'?'work':'mat'][String(ch.dataset.id||'')]=1; });
    var moved=0;
    for(var type in byType){
      var ids=byType[type]; if(!Object.keys(ids).length) continue;
      var arr=getArr(type).map(function(it){ if(ids[String(it.id||'')]){ var x=clone(it); if(cat) x.c=cat; if(sub){ x.g=sub; x.sc=sub; x.subcategory=sub; } moved++; return x; } return it; });
      await saveArr(type,arr);
    }
    try{ if(typeof renderDbEditors==='function') renderDbEditors(); }catch(e){}
    setTimeout(function(){ ensurePanel(); fillSelectors(true); },200);
    toast('📦 Перемещено: '+moved);
  };
  window.epV21DeleteSelected=async function(){
    var checks=selected(); if(!checks.length) return toast('Выбери позиции галочками слева');
    var ok=true; try{ if(typeof customConfirm==='function') ok=await customConfirm('Удаление','Удалить выбранные позиции: '+checks.length+'?'); else ok=confirm('Удалить выбранные позиции: '+checks.length+'?'); }catch(e){}
    if(!ok) return;
    var byType={mat:{},work:{}}; checks.forEach(function(ch){ byType[ch.dataset.type==='work'?'work':'mat'][String(ch.dataset.id||'')]=1; });
    var removed=0;
    for(var type in byType){
      var ids=byType[type]; if(!Object.keys(ids).length) continue;
      var arr=getArr(type).filter(function(it){ if(ids[String(it.id||'')]){ removed++; return false; } return true; });
      await saveArr(type,arr);
    }
    try{ if(typeof renderDbEditors==='function') renderDbEditors(); }catch(e){}
    setTimeout(function(){ ensurePanel(); fillSelectors(true); },200);
    toast('🗑 Удалено: '+removed);
  };

  var oldRender=window.renderDbEditors;
  window.renderDbEditors=function(){ var r=oldRender?oldRender.apply(this,arguments):undefined; setTimeout(ensurePanel,120); setTimeout(ensurePanel,500); return r; };
  try{ renderDbEditors=window.renderDbEditors; }catch(e){}
  var oldOpenMat=window.openMatCatalog; window.openMatCatalog=function(){ var r=oldOpenMat?oldOpenMat.apply(this,arguments):undefined; setTimeout(ensurePanel,150); return r; };
  var oldOpenWork=window.openWorkCatalog; window.openWorkCatalog=function(){ var r=oldOpenWork?oldOpenWork.apply(this,arguments):undefined; setTimeout(ensurePanel,150); return r; };

  function boot(){ setStatus('ok','V21 активна'); ensurePanel(); fillSelectors(true); toast(BUILD+' загружена'); }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',function(){ setTimeout(boot,250); }); else setTimeout(boot,250);
  setInterval(function(){ setStatus('ok','V21 активна'); hideOldBulk(); ensureChecks(); var active=document.activeElement; if(active && (active.id==='ep-v21-move-cat'||active.id==='ep-v21-move-sub')) return; ensurePanel(); },2500);
})();
