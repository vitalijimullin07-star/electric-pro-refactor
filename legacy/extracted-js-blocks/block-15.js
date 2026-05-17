/*
 * Extracted from public/index.html
 * Original script block: 15
 * Original HTML lines: 7825-8085
 */

/* === EP DB ROLES + PROGRESS V7 2026-05-14 ===
   Surgical DB UI: strict My DB / Server DB, server edits only by admin,
   scope-specific import/export, progress indicator, reload active DB after operations.
   Shield logic is not touched.
*/
(function(){
  var LS_SCOPE='ep_db_scope_v2';
  var LS_MY_MAT='user_db_mat_v31';
  var LS_MY_WORK='user_db_work_v31';
  var LS_SERVER_CACHE='ep_global_cache_force_v1';
  var PAGE_SIZE=60;
  var oldRender=window.renderDbEditors;
  var oldSetScope=window.epSetDbScope;

  function $(id){ return document.getElementById(id); }
  function toast(t){ try{ if(typeof showToast==='function') showToast(t); else console.log(t); }catch(e){ console.log(t); } }
  function esc(s){ return String(s==null?'':s).replace(/[&<>"']/g,function(m){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m];}); }
  function norm(s){ return String(s||'').toLowerCase().replace(/ё/g,'е').replace(/×/g,'x').replace(/х/g,'x').replace(/[^a-zа-я0-9]+/g,' ').trim(); }
  function cleanText(v){ return String(v==null?'':v).replace(/\s+/g,' ').trim(); }
  function money(v){ var n=Number(String(v==null?'':v).replace(',','.').replace(/[^\d.\-]/g,'')); return Number.isFinite(n)?n:0; }
  function uid(){ try{return (window.appUser&&appUser.uid)||'';}catch(e){return '';} }
  function isAdmin(){ try{return !!(window.appUser && appUser.role==='admin');}catch(e){return false;} }
  function scope(){ try{return localStorage.getItem(LS_SCOPE)==='global'?'global':'my';}catch(e){return 'my';} }
  function setScope(s){ try{localStorage.setItem(LS_SCOPE, s==='global'?'global':'my');}catch(e){} }
  function label(){ return scope()==='global'?'🌍 База сервера':'👤 Моя база'; }
  function canEditActive(){ return scope()==='my' || (scope()==='global' && isAdmin()); }
  function readArr(k){ try{var a=JSON.parse(localStorage.getItem(k)||'[]');return Array.isArray(a)?a:[];}catch(e){return [];} }
  function writeArr(k,a){ try{ if(typeof safeSet==='function') safeSet(k,JSON.stringify(a||[])); else localStorage.setItem(k,JSON.stringify(a||[])); }catch(e){ try{localStorage.setItem(k,JSON.stringify(a||[]));}catch(_e){} } }
  function readObj(k){ try{var o=JSON.parse(localStorage.getItem(k)||'{}');return o&&typeof o==='object'?o:{};}catch(e){return {};} }
  function writeObj(k,o){ try{localStorage.setItem(k,JSON.stringify(o||{}));}catch(e){} }
  function groupOf(it){ return (it&&(it.g||it.sc||it.subcategory||it.group))||''; }
  function clone(it){ var x=Object.assign({},it||{}); delete x.__src; delete x.__encoded; return x; }
  function sig(type,it){ return type+'|'+norm([it&&it.c,groupOf(it),it&&it.n,it&&it.u].filter(Boolean).join('|')); }
  function unique(arr,type){ var seen={},out=[]; (arr||[]).forEach(function(raw){ var it=clone(raw); if(!it.n)return; if(!it.id) it.id=(type==='work'?'w':'m')+'_v7_'+Date.now()+'_'+Math.random().toString(36).slice(2,7); if(it.sc&&!it.g)it.g=it.sc; if(it.g&&!it.sc)it.sc=it.g; var k=sig(type,it); if(seen[k])return; seen[k]=1; out.push(it); }); return out; }
  function getMy(type){ var w=type==='work'?window.EP_MY_WORK:window.EP_MY_MAT; return Array.isArray(w)?w.slice():readArr(type==='work'?LS_MY_WORK:LS_MY_MAT); }
  function getServer(type){ var w=type==='work'?window.EP_GLOBAL_WORK:window.EP_GLOBAL_MAT; if(Array.isArray(w))return w.slice(); var c=readObj(LS_SERVER_CACHE); var a=type==='work'?c.workDB:c.matDB; return Array.isArray(a)?a:[]; }
  function active(type){ return scope()==='global'?getServer(type):getMy(type); }
  function setMy(type,arr){ arr=unique(arr,type); if(type==='work') window.EP_MY_WORK=arr; else window.EP_MY_MAT=arr; writeArr(type==='work'?LS_MY_WORK:LS_MY_MAT,arr); try{window.userMatDB=getMy('mat');window.userWorkDB=getMy('work');}catch(e){} syncMain('my'); }
  function setServer(type,arr){ arr=unique(arr,type); if(type==='work') window.EP_GLOBAL_WORK=arr; else window.EP_GLOBAL_MAT=arr; var mat=type==='mat'?arr:getServer('mat'); var work=type==='work'?arr:getServer('work'); try{window.EP_FORCE_GLOBAL={matDB:mat,workDB:work};window.EP_ULTIMATE_DB_CACHE={matDB:mat,workDB:work,ts:Date.now()};window.EP_GLOBAL_DB_VISIBLE_CACHE={matDB:mat,workDB:work,ts:Date.now()};}catch(e){} writeObj(LS_SERVER_CACHE,{matDB:mat,workDB:work,ts:Date.now()}); syncMain('global'); }
  function syncMain(target){ try{ var use=target||scope(); window.matDB=(use==='global'?getServer('mat'):getMy('mat')); window.workDB=(use==='global'?getServer('work'):getMy('work')); try{matDB=window.matDB;workDB=window.workDB;}catch(e){} }catch(e){} }
  function upsert(arr,type,it,replace){ it=clone(it); if(!it.id) it.id=(type==='work'?'w':'m')+'_v7_'+Date.now()+'_'+Math.random().toString(36).slice(2,7); if(it.sc&&!it.g)it.g=it.sc; if(it.g&&!it.sc)it.sc=it.g; var k=sig(type,it); var idx=(arr||[]).findIndex(function(x){return sig(type,x)===k || (it.id&&String(x.id||'')===String(it.id));}); if(idx>=0) arr[idx]=replace?Object.assign({},arr[idx],it,{id:arr[idx].id||it.id}):Object.assign({},arr[idx],it,{id:arr[idx].id||it.id}); else arr.push(it); return arr; }

  function ensureProgress(){
    if($('ep-v7-progress')) return;
    var css=document.createElement('style'); css.id='ep-v7-style'; css.textContent='\
#ep-v7-progress{position:fixed;inset:0;z-index:99999;background:rgba(15,23,42,.62);display:none;align-items:center;justify-content:center;padding:18px;}\
#ep-v7-progress .box{width:min(460px,94vw);border-radius:20px;background:var(--card-bg,#fff);box-shadow:0 24px 70px rgba(0,0,0,.35);padding:18px;border:1px solid var(--border,#e5e7eb);}\
#ep-v7-progress .title{font-weight:900;color:var(--primary,#4f46e5);font-size:17px;margin-bottom:8px;}\
#ep-v7-progress .bar{height:16px;background:rgba(148,163,184,.25);border-radius:999px;overflow:hidden;border:1px solid rgba(148,163,184,.35);}\
#ep-v7-progress .fill{height:100%;width:0%;background:linear-gradient(90deg,#2563eb,#10b981);transition:width .18s ease;}\
#ep-v7-progress .txt{font-size:12px;color:var(--gray,#64748b);font-weight:800;margin-top:8px;}\
.ep-v7-panel{border:2px solid var(--primary);border-radius:16px;padding:12px;margin:10px 0 15px;background:rgba(79,70,229,.06)}\
.ep-v7-actions{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:10px}.ep-v7-actions button{margin:0;padding:10px}.ep-v7-note{font-size:11px;color:var(--gray);font-weight:800;margin-top:8px}.ep-v7-locked{opacity:.55}.ep-v7-row{display:flex;gap:8px;align-items:flex-start}.ep-v7-row input[type=number]:disabled{opacity:.55;background:rgba(148,163,184,.15)}'; document.head.appendChild(css);
    var d=document.createElement('div'); d.id='ep-v7-progress'; d.innerHTML='<div class="box"><div class="title" id="ep-v7-progress-title">Выполняю...</div><div class="bar"><div class="fill" id="ep-v7-progress-fill"></div></div><div class="txt" id="ep-v7-progress-txt">0%</div></div>'; document.body.appendChild(d);
  }
  function showProgress(title,pct,txt){ ensureProgress(); var p=$('ep-v7-progress'), f=$('ep-v7-progress-fill'), t=$('ep-v7-progress-title'), x=$('ep-v7-progress-txt'); if(p)p.style.display='flex'; if(t)t.textContent=title||'Выполняю...'; if(f)f.style.width=Math.max(0,Math.min(100,Math.round(pct||0)))+'%'; if(x)x.textContent=(txt||'')+' '+Math.max(0,Math.min(100,Math.round(pct||0)))+'%'; try{ if(typeof hideLoader==='function') hideLoader(); }catch(e){} }
  function hideProgress(){ var p=$('ep-v7-progress'); if(p)p.style.display='none'; }

  async function saveMyRemote(onp){
    try{
      if(typeof db!=='undefined'&&db&&uid()){
        if(onp)onp(70,'Запись в user_db');
        await db.collection('user_db').doc(uid()).set({uid:uid(),masterName:(window.appUser&&(appUser.name||appUser.email))||'',matDB:getMy('mat'),workDB:getMy('work'),created:true,updatedAt:new Date().toISOString()},{merge:true});
        if(onp)onp(92,'Личная база записана');
        return true;
      }
    }catch(e){ console.warn('EP V7 save my db failed',e); }
    return false;
  }
  async function saveServerRemote(onp){
    try{
      if(typeof db!=='undefined'&&db&&isAdmin()){
        if(onp)onp(70,'Запись в settings/global_db');
        await db.collection('settings').doc('global_db').set({matDB:getServer('mat'),workDB:getServer('work'),updatedAt:new Date().toISOString()},{merge:true});
        if(onp)onp(92,'База сервера записана');
        return true;
      }
    }catch(e){ console.warn('EP V7 save server db failed',e); }
    return false;
  }
  async function sendProposal(type,items,reason,onp){
    try{
      if(onp)onp(72,'Отправка заявки админу');
      if(typeof window.epSendServerProposal==='function'){ await window.epSendServerProposal(type,items,reason||'server_import_request'); return true; }
      if(typeof db!=='undefined'&&db){ await db.collection('db_proposals').add({type:type,items:items,reason:reason||'server_import_request',uid:uid(),userEmail:(window.appUser&&appUser.email)||'',createdAt:new Date().toISOString(),status:'new'}); return true; }
    }catch(e){ console.warn('EP V7 proposal failed',e); }
    return false;
  }
  async function reloadActiveDb(){
    try{ syncMain(scope()); if(typeof window.epRefreshActiveDbNow==='function') await window.epRefreshActiveDbNow(true); }catch(e){ console.warn('EP V7 reload active db failed',e); }
    try{ syncMain(scope()); renderDbEditors(); }catch(e){}
    try{ if(typeof openMatCatalog==='function' && $('matCatModal') && $('matCatModal').style.display!=='none') openMatCatalog(); }catch(e){}
    try{ if(typeof openWorkCatalog==='function' && $('workModal') && $('workModal').style.display!=='none') openWorkCatalog(); }catch(e){}
  }

  function ensurePanel(){
    var toolbar=$('ep-db-scope-toolbar'); if(!toolbar) return null;
    var p=$('ep-v7-db-panel');
    if(!p){ p=document.createElement('div'); p.id='ep-v7-db-panel'; p.className='ep-v7-panel'; toolbar.parentNode.insertBefore(p, toolbar.nextSibling); }
    return p;
  }
  function renderPanel(){
    var p=ensurePanel(); if(!p) return;
    var s=scope(), admin=isAdmin(), my=s==='my';
    var title=my?'👤 Моя база данных':'🌍 База сервера';
    var matCount=active('mat').length, workCount=active('work').length;
    var note=my
      ? 'Это личная база текущего мастера. Импорт, экспорт, цены и замена позиций меняют только эту базу.'
      : (admin?'Вы админ: можно импортировать, заменять, редактировать цены и сохранять базу сервера.':'Просмотр базы сервера. Мастер не меняет сервер напрямую: можно экспортировать, взять позицию себе или отправить импорт заявкой админу.');
    var html='<div style="font-weight:900;color:var(--primary);font-size:15px;">'+title+'</div>'+
      '<div class="ep-v7-note">'+note+'<br>Материалы: <b>'+matCount+'</b>, работы: <b>'+workCount+'</b>. Вперемешку базы не считаются.</div>'+
      '<div class="ep-v7-actions">';
    if(my || admin){
      html+='<button class="btn-info" onclick="epTriggerDbFileImport(\'mat\')">📥 Импорт материалов</button>'+
            '<button class="btn-work" onclick="epTriggerDbFileImport(\'work\')">📥 Импорт работ</button>'+
            '<button class="btn-vendor" onclick="epOpenTextImport && epOpenTextImport(\'mat\')">📝 Материалы текстом</button>'+
            '<button class="btn-vendor" onclick="epOpenTextImport && epOpenTextImport(\'work\')">📝 Работы текстом</button>';
    } else {
      html+='<button class="btn-info" onclick="epTriggerServerProposalImportV7(\'mat\')">📨 Материалы заявкой админу</button>'+
            '<button class="btn-work" onclick="epTriggerServerProposalImportV7(\'work\')">📨 Работы заявкой админу</button>'+
            '<button class="btn-vendor" onclick="epOpenTextImportServerProposalV7(\'mat\')">📝 Материалы заявкой</button>'+
            '<button class="btn-vendor" onclick="epOpenTextImportServerProposalV7(\'work\')">📝 Работы заявкой</button>';
    }
    html+='<button class="btn-success" onclick="epExportActiveDb()">📤 Экспорт этой базы</button>'+
          '<button class="btn-info" onclick="epReloadActiveDbV7()">🔄 Обновить / перезагрузить</button>';
    if(canEditActive()) html+='<button class="btn-primary" onclick="epSaveActiveDbV7()">💾 Сохранить базу</button>';
    if(my) html+='<button class="btn-danger" onclick="epOpenDbFactoryResetModal && epOpenDbFactoryResetModal()">🧹 Очистка / сброс</button>';
    else if(admin) html+='<button class="btn-danger" onclick="epOpenDbFactoryResetModal && epOpenDbFactoryResetModal()">🧹 Очистка сервера</button>';
    html+='</div>';
    if(!my && !admin) html+='<div class="ep-v7-note">Редактирование, сохранение, замена и цены сервера заблокированы для мастера.</div>';
    p.innerHTML=html;
  }
  function tuneStaticBlocks(){
    renderPanel();
    var my=$('ep-scope-my-btn'), gl=$('ep-scope-global-btn'), st=$('ep-db-scope-status');
    if(my){ my.className=scope()==='my'?'btn-success':'btn-info'; my.textContent='👤 Моя база данных'; }
    if(gl){ gl.className=scope()==='global'?'btn-success':'btn-info'; gl.textContent='🌍 База сервера'; }
    if(st) st.innerHTML='Главный переключатель: <b>'+label()+'</b>. Отображение и расчёт идут только из выбранного источника.';
    var old=$('ep-db-ai-tools'); if(old) old.style.display='none';
    var clean=$('ep-clean-status-line'); if(clean) clean.textContent='Активная база: '+label()+'. Материалы: '+active('mat').length+', работы: '+active('work').length+'.';
    var addBtn=document.querySelector('#settModal button[onclick="addDbItem()"]');
    var addBlock=null;
    if(addBtn){ var x=addBtn.parentElement; while(x&&x.id!=='settModal'){ if((x.querySelector&&x.querySelector('#db-new-cat'))){ addBlock=x; break; } x=x.parentElement; } }
    if(addBlock){ addBlock.style.display=canEditActive()?'block':'none'; }
    if(addBtn){ addBtn.textContent=scope()==='global'?' + Добавить в базу сервера':' + Добавить в мою базу'; }
  }

  function editorTop(type){
    var title=type==='work'?'работ':'материалов';
    var s=scope(), admin=isAdmin(), editable=canEditActive();
    var hint=s==='my'?'Редактируется личная база мастера.':(admin?'Редактируется база сервера.':'Сервер открыт только для просмотра и копирования в мою базу.');
    var html='<div style="border:1px solid var(--primary);border-radius:14px;padding:10px;margin:0 0 12px;background:rgba(79,70,229,.05);">'+
      '<div style="font-weight:900;color:var(--primary);">'+label()+' — '+title+'</div>'+
      '<div style="font-size:11px;color:var(--gray);font-weight:800;margin-top:4px;">'+hint+' Позиций: '+active(type).length+'.</div>'+
      '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:8px;">'+
      '<button class="'+(s==='my'?'btn-success':'btn-info')+'" style="margin:0;padding:10px;" onclick="epSetDbScope(\'my\')">👤 Моя база</button>'+
      '<button class="'+(s==='global'?'btn-success':'btn-info')+'" style="margin:0;padding:10px;" onclick="epSetDbScope(\'global\')">🌍 База сервера</button></div>';
    if(editable){ html+='<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:8px;"><button class="btn-success" style="margin:0;padding:9px;" onclick="epSaveActiveDbV7()">💾 Сохранить</button><button class="btn-danger" style="margin:0;padding:9px;" onclick="epDeleteSelectedActiveV7()">🗑 Удалить выбранные</button></div>'; }
    if(s==='global'&&!admin){ html+='<div class="ep-v7-note">Серверные цены и позиции мастер не меняет. Для своей сметы нажми «В мою».</div>'; }
    return html+'</div>';
  }
  function editorRow(type,it){
    var s=scope(), editable=canEditActive(), admin=isAdmin();
    var item=encodeURIComponent(JSON.stringify(it||{}));
    var sub=(groupOf(it)?groupOf(it)+' • ':'')+(Number(it.p)||0)+' ₽ / '+(it.u||'шт');
    var check=editable?'<input type="checkbox" class="ep-v7-select" data-type="'+type+'" data-id="'+esc(String(it.id||''))+'" style="width:20px;height:20px;accent-color:#EF4444;margin:4px 3px 0 0;">':'';
    var price='<input type="number" '+(editable?'':'disabled')+' value="'+(Number(it.p)||0)+'" data-id="'+esc(String(it.id||''))+'" data-type="'+type+'" onchange="epChangePriceV7(this.dataset.type,this.dataset.id,this.value)" style="width:76px;margin:0;padding:4px;text-align:center;">';
    var copy=(s==='global'&&!admin)?'<button class="btn-info" style="width:auto;margin:0;padding:7px;" data-type="'+type+'" data-item="'+esc(item)+'" onclick="epCopyOneServerToMy(this.dataset.type,this.dataset.item)">В мою</button>':'';
    return '<div class="emp-row ep-v7-row '+(!editable?'ep-v7-locked':'')+'">'+check+'<div style="flex:1;"><b>'+esc(it.n||'Позиция')+'</b><br><span style="color:var(--gray);font-size:10px;">'+esc(sub)+'</span></div>'+price+copy+'</div>';
  }
  function renderRows(type){
    var arr=active(type), html=editorTop(type);
    if(!arr.length) return html+'<div style="padding:15px;border:1px dashed var(--border);border-radius:12px;text-align:center;color:var(--gray);font-weight:800;">'+label()+' пустая.</div>';
    var cats={},i=0; arr.forEach(function(it){ var c=it.c||'Разное', g=groupOf(it)||'Без группы'; if(!cats[c])cats[c]={}; if(!cats[c][g])cats[c][g]=[]; cats[c][g].push(it); });
    Object.keys(cats).sort(function(a,b){return a.localeCompare(b,'ru');}).forEach(function(c){ var cid='v7_cat_'+type+'_'+(i++); html+='<div class="cat-header" onclick="epDbToggle && epDbToggle(&quot;'+cid+'&quot;, event)">'+esc(c)+'</div><div class="cat-body" id="'+cid+'">'; Object.keys(cats[c]).sort(function(a,b){return a.localeCompare(b,'ru');}).forEach(function(g){ var gid='v7_sub_'+type+'_'+(i++); html+='<div class="sub-cat-header" onclick="epDbToggle && epDbToggle(&quot;'+gid+'&quot;, event)">'+esc(g)+' ▾</div><div class="sub-cat-body" id="'+gid+'">'; cats[c][g].sort(function(a,b){return String(a.n||'').localeCompare(String(b.n||''),'ru');}).forEach(function(it){ html+=editorRow(type,it); }); html+='</div>'; }); html+='</div>'; });
    return html;
  }
  window.renderDbEditors=function(){
    syncMain(scope());
    try{ var catsEl=$('db-cats'); if(catsEl){ var all=active('mat').concat(active('work')); catsEl.innerHTML=Array.from(new Set(all.map(function(x){return x.c||'Разное';}))).sort(function(a,b){return a.localeCompare(b,'ru');}).map(function(c){return '<option value="'+esc(c)+'">';}).join(''); } }catch(e){}
    var m=$('editor-mat-list'), w=$('editor-work-list');
    if(m) m.innerHTML=renderRows('mat');
    if(w) w.innerHTML=renderRows('work');
    tuneStaticBlocks();
  };
  window.epSetDbScope=async function(s){
    setScope(s==='global'?'global':'my'); syncMain(scope()); tuneStaticBlocks();
    showProgress('Обновляю '+label(),20,'Переключение');
    try{ if(typeof oldSetScope==='function' && oldSetScope!==window.epSetDbScope){ await oldSetScope(s); } }catch(e){ console.warn('old scope failed',e); }
    try{ if(typeof window.epRefreshActiveDbNow==='function') await window.epRefreshActiveDbNow(true); }catch(e){}
    syncMain(scope()); renderDbEditors(); showProgress('Обновляю '+label(),100,'Готово'); setTimeout(hideProgress,350);
  };

  window.epChangePriceV7=async function(type,id,newPrice){
    if(!canEditActive()){ renderDbEditors(); return toast('Сервер редактирует только админ'); }
    var arr=active(type).slice(); var it=arr.find(function(x){return String(x.id||'')===String(id);}); if(!it)return toast('Позиция не найдена');
    it=Object.assign({},it,{p:money(newPrice)}); arr=upsert(arr,type,it,true);
    if(scope()==='global') setServer(type,arr); else setMy(type,arr);
    showProgress('Сохраняю цену',45,'Локально');
    if(scope()==='global') await saveServerRemote(showProgress); else await saveMyRemote(showProgress);
    showProgress('Сохраняю цену',100,'Готово'); setTimeout(hideProgress,350); renderDbEditors();
  };
  window.epSaveActiveDbV7=async function(){
    if(!canEditActive()) return toast('Сохранять базу сервера может только админ');
    showProgress('Сохраняю '+label(),20,'Подготовка');
    var ok=scope()==='global'?await saveServerRemote(showProgress):await saveMyRemote(showProgress);
    await reloadActiveDb(); showProgress('Сохраняю '+label(),100,ok?'Готово':'Локально сохранено'); setTimeout(hideProgress,450); toast(ok?'✅ База сохранена и перезагружена':'⚠️ Сервер не подтвердил, локальная база обновлена');
  };
  window.epReloadActiveDbV7=async function(){ showProgress('Перезагружаю '+label(),20,'Запрос'); await reloadActiveDb(); showProgress('Перезагружаю '+label(),100,'Готово'); setTimeout(hideProgress,350); };
  window.epDeleteSelectedActiveV7=async function(){
    if(!canEditActive()) return toast('Удалять на сервере может только админ');
    var checks=Array.from(document.querySelectorAll('#settModal .ep-v7-select:checked')); if(!checks.length)return toast('Выберите позиции');
    if(!confirm('Удалить выбранные позиции из '+label()+'?')) return;
    var rm={mat:new Set(),work:new Set()}; checks.forEach(function(ch){ rm[ch.dataset.type].add(String(ch.dataset.id||'')); });
    ['mat','work'].forEach(function(type){ if(!rm[type].size)return; var arr=active(type).filter(function(x){return !rm[type].has(String(x.id||''));}); if(scope()==='global') setServer(type,arr); else setMy(type,arr); });
    showProgress('Удаляю позиции',50,'Запись'); if(scope()==='global') await saveServerRemote(showProgress); else await saveMyRemote(showProgress); await reloadActiveDb(); showProgress('Удаляю позиции',100,'Готово'); setTimeout(hideProgress,350);
  };

  function downloadJson(filename,data){
    showProgress('Экспорт базы',25,'Подготовка файла');
    var blob=new Blob([JSON.stringify(data,null,2)],{type:'application/json;charset=utf-8'});
    showProgress('Экспорт базы',70,'Скачивание');
    var url=URL.createObjectURL(blob), a=document.createElement('a'); a.href=url; a.download=filename; document.body.appendChild(a); a.click(); a.remove();
    setTimeout(function(){URL.revokeObjectURL(url);},1000);
    showProgress('Экспорт базы',100,'Готово'); setTimeout(function(){hideProgress(); reloadActiveDb();},500);
  }
  window.epExportActiveDb=function(){ var s=scope(); downloadJson(s==='global'?'electric-pro-server-db.json':'electric-pro-my-db.json',{source:s==='global'?'server':'my',matDB:s==='global'?getServer('mat'):getMy('mat'),workDB:s==='global'?getServer('work'):getMy('work'),exportedAt:new Date().toISOString()}); };
  window.epExportMyDb=function(){ downloadJson('electric-pro-my-db.json',{source:'my',matDB:getMy('mat'),workDB:getMy('work'),exportedAt:new Date().toISOString()}); };
  window.epExportGlobalDb=function(){ downloadJson('electric-pro-server-db.json',{source:'server',matDB:getServer('mat'),workDB:getServer('work'),exportedAt:new Date().toISOString()}); };

  function fileTextProgress(file,onp){ return new Promise(function(resolve,reject){ var r=new FileReader(); r.onprogress=function(e){ if(e.lengthComputable&&onp)onp(Math.min(45,10+e.loaded/e.total*35),'Чтение файла');}; r.onload=function(){resolve(String(r.result||''));}; r.onerror=reject; r.readAsText(file); }); }
  function fileBufferProgress(file,onp){ return new Promise(function(resolve,reject){ var r=new FileReader(); r.onprogress=function(e){ if(e.lengthComputable&&onp)onp(Math.min(45,10+e.loaded/e.total*35),'Чтение файла');}; r.onload=function(){resolve(r.result);}; r.onerror=reject; r.readAsArrayBuffer(file); }); }
  function csvRows(txt){ var lines=String(txt||'').split(/\r?\n/).filter(function(x){return x.trim();}); if(!lines.length)return []; var delims=[';','\t',',']; var delim=delims.map(function(d){return {d:d,n:(lines[0]||'').split(d).length};}).sort(function(a,b){return b.n-a.n;})[0].d; return lines.map(function(line){ var out=[],cur='',q=false; for(var i=0;i<line.length;i++){ var ch=line[i]; if(ch==='"'){ if(q&&line[i+1]==='"'){cur+='"';i++;}else q=!q; } else if(ch===delim&&!q){out.push(cur);cur='';} else cur+=ch; } out.push(cur); return out; }); }
  function inferCat(name,type){ var s=norm(name); if(type==='work'){ if(/штроб|резк|алмаз/.test(s))return 'Алмазная резка'; if(/подрозет|коронк|сверл|бурен/.test(s))return 'Высверливание подрозетников'; if(/щит|автомат|узо|диф|сборк/.test(s))return 'Щитовое'; if(/демонтаж/.test(s))return 'Демонтаж'; if(/свет|люстр|бра|светильн|лента/.test(s))return 'Освещение'; return 'Работы'; } if(/ввг|кабел|провод|пугв|utp|ftp|тв|tv|sat/.test(s))return 'Кабель'; if(/гофр|труб|пнд|пвх/.test(s))return 'Трубы'; if(/автомат|узо|диф|узм|уздп|реле|контактор|выключатель нагрузки/.test(s))return 'Автоматика'; if(/щит|бокс|корпус|din|дин|рейк|шина|гребен|клемм|ншви|маркиров/.test(s))return 'Щитовое'; if(/розет|выключател|рамк|механизм|терморег/.test(s))return 'Чистовое'; if(/подрозет|короб|клемм|скоб|хомут|дюбел|саморез|смес|алебастр|изолент/.test(s))return 'Расходники'; return 'Разное'; }
  function inferSub(name,cat,type){ var s=norm(name); if(type==='work'){ if(/бетон/.test(s))return 'Бетон'; if(/кирпич/.test(s))return 'Кирпич'; if(/монолит|панел/.test(s))return 'Панель / монолит'; return cat||'Работы'; } if(/c\s*\d+|с\s*\d+|автомат/.test(s))return 'Автоматы'; if(/диф/.test(s))return 'ДИФы'; if(/узо/.test(s))return 'УЗО'; if(/узм|реле напряж/.test(s))return 'УЗМ / реле напряжения'; if(/контактор/.test(s))return 'Контакторы'; if(/ввг/.test(s))return 'ВВГ'; if(/пугв/.test(s))return 'ПуГВ'; if(/utp|ftp/.test(s))return 'UTP / FTP'; if(/подрозет/.test(s))return 'Подрозетники'; if(/клемм|wago/.test(s))return 'Клеммники'; if(/гребен/.test(s))return 'Гребёнки'; if(/шин/.test(s))return 'Шинки / клеммники'; if(/din|дин|рейк/.test(s))return 'DIN-рейки / ограничители'; if(/щит|бокс|корпус/.test(s))return 'Корпуса'; return 'Разное'; }
  function normItem(raw,type,idx){ raw=raw||{}; var n=cleanText(raw.n||raw.name||raw.title||raw.имя||raw.наименование||raw['Наименование']||raw['Название']||raw['Имя']); if(!n)return null; var c=cleanText(raw.c||raw.category||raw.cat||raw.категория||raw['Категория'])||inferCat(n,type); var sc=cleanText(raw.sc||raw.g||raw.subcategory||raw.group||raw.подкатегория||raw['Подкатегория']||raw['Группа'])||inferSub(n,c,type); var p=money(raw.p!=null?raw.p:(raw.price!=null?raw.price:(raw.цена!=null?raw.цена:raw['Цена']))); var u=cleanText(raw.u||raw.unit||raw.ед||raw['Ед.']||raw['Единица']||raw['Ед. изм.'])||'шт'; return {id:raw.id||((type==='work'?'w':'m')+'_v7_imp_'+Date.now()+'_'+idx),n:n,c:c,sc:sc,g:sc,p:p,u:u}; }
  function rowsToItems(rows,type){ rows=rows||[]; var header=null,currentCat='',currentSub='',out=[]; function cell(row,i){return cleanText((row||[])[i]);} rows.forEach(function(row){ row=(row||[]).map(cleanText); var non=row.filter(Boolean); if(!non.length)return; var joined=norm(non.join(' ')); if(/наимен|назван|имя|цена|стоим|ед/.test(joined)&&!header){ header={}; row.forEach(function(v,i){ var s=norm(v); if(/наимен|назван|имя|позиция|товар|работ/.test(s))header.name=i; if(/категор/.test(s)&&header.cat==null)header.cat=i; if(/подкат|группа/.test(s))header.sub=i; if(/цена|стоим|прайс/.test(s))header.price=i; if(/ед|изм/.test(s))header.unit=i; }); return; } var priceIdx=-1,unitIdx=-1; row.forEach(function(v,i){ if(priceIdx<0&&money(v)>0&&/^[-\d\s.,]+/.test(v))priceIdx=i; if(unitIdx<0&&/^(шт|м|м\.п\.?|пог\.м|уп|упак|компл|кг|л|рул|бухта)$/i.test(v))unitIdx=i; }); if(header){ var n=cell(row,header.name); if(n)out.push(normItem({n:n,c:cell(row,header.cat),sc:cell(row,header.sub),p:cell(row,header.price),u:cell(row,header.unit)},type,out.length)); return; } if(priceIdx<0&&non.length<=2){ var title=non.join(' '); if(type==='work'||/работ|монтаж|штроб|резк|сверл|демонтаж/i.test(title)){currentCat=title;currentSub='';} else if(!currentCat)currentCat=title; else currentSub=title; return; } var candidates=row.map(function(v,i){return {v:v,i:i};}).filter(function(x){return x.v&&x.i!==priceIdx&&x.i!==unitIdx&&!/^[-\d\s.,]+$/.test(x.v);}); if(!candidates.length)return; candidates.sort(function(a,b){return b.v.length-a.v.length;}); var name=candidates[0].v; if(name.length<3)return; out.push(normItem({n:name,c:currentCat||inferCat(name,type),sc:currentSub||inferSub(name,currentCat,type),p:priceIdx>=0?row[priceIdx]:0,u:unitIdx>=0?row[unitIdx]:'шт'},type,out.length)); }); return out.filter(Boolean); }
  function jsonToItems(raw,type){ if(raw&&raw.matDB&&type==='mat')raw=raw.matDB; else if(raw&&raw.workDB&&type==='work')raw=raw.workDB; else if(raw&&Array.isArray(raw.items))raw=raw.items; else if(raw&&raw.data&&Array.isArray(raw.data))raw=raw.data; else if(raw&&typeof raw==='object'&&!Array.isArray(raw))raw=Object.keys(raw).map(function(k){return raw[k];}); if(!Array.isArray(raw))raw=[]; return raw.map(function(x,i){return normItem(x,type,i);}).filter(Boolean); }
  function showReview(items,type,source,target){ items=unique((items||[]).filter(Boolean),type); var selected={}; items.forEach(function(_,i){selected[i]=true;}); window.EP_DB_REVIEW_V6={type:type,items:items,source:source||'',page:0,selected:selected,editCache:{}}; window.EP_DB_REVIEW={type:type,items:items,source:source||''}; window.EP_V7_IMPORT_TARGET=target||scope(); try{ if(typeof window.epReviewPageV6==='function') window.epReviewPageV6(0); }catch(e){} try{ if(typeof openModal==='function') openModal('ep-db-ai-review-modal'); }catch(e){ var m=$('ep-db-ai-review-modal'); if(m)m.style.display='flex'; } }
  async function readDbFile(file,type,target){ showProgress('Импорт базы',5,'Старт'); var name=file.name||'', lower=name.toLowerCase(), items=[]; if(file.type&&file.type.indexOf('image/')===0){ hideProgress(); if(typeof window.epAskAI==='function' && typeof oldTrigger==='function'){ return oldTrigger(type); } return toast('Для фото нужен ИИ.'); } if(/\.json$/i.test(lower)){ var txt=await fileTextProgress(file,showProgress); showProgress('Импорт базы',55,'Разбор JSON'); items=jsonToItems(JSON.parse(txt),type); } else if(/\.(xlsx|xls)$/i.test(lower)){ if(!window.XLSX) throw new Error('Библиотека XLSX не загрузилась. Сохраните файл как CSV или JSON.'); var ab=await fileBufferProgress(file,showProgress); showProgress('Импорт базы',55,'Разбор Excel'); var wb=XLSX.read(ab,{type:'array'}), rows=[]; wb.SheetNames.forEach(function(sh){ rows=rows.concat(XLSX.utils.sheet_to_json(wb.Sheets[sh],{header:1,defval:''})); }); showProgress('Импорт базы',78,'Подготовка строк'); items=rowsToItems(rows,type); } else { var raw=await fileTextProgress(file,showProgress); showProgress('Импорт базы',60,'Разбор текста/CSV'); items=rowsToItems(csvRows(raw),type); }
    showProgress('Импорт базы',100,'Открываю проверку'); setTimeout(hideProgress,250); showReview(items,type,name,target); }
  var oldTrigger=window.epTriggerDbFileImport;
  window.epTriggerDbFileImport=function(type){ type=type==='work'?'work':'mat'; var target=scope(); if(target==='global'&&!isAdmin()) return window.epTriggerServerProposalImportV7(type); var input=$('ep-db-file-input'); if(!input){ if(typeof oldTrigger==='function') return oldTrigger(type); return; } input.value=''; input.onchange=function(e){ var file=e.target.files&&e.target.files[0]; if(!file)return; readDbFile(file,type,target).catch(function(err){ hideProgress(); toast('❌ '+(err.message||'Ошибка импорта')); console.error(err); }); }; input.click(); };
  window.epTriggerServerProposalImportV7=function(type){ type=type==='work'?'work':'mat'; var input=$('ep-db-file-input'); if(!input)return toast('Поле выбора файла не найдено'); input.value=''; input.onchange=function(e){ var file=e.target.files&&e.target.files[0]; if(!file)return; readDbFile(file,type,'server_proposal').catch(function(err){ hideProgress(); toast('❌ '+(err.message||'Ошибка импорта')); console.error(err); }); }; input.click(); };
  window.epOpenTextImportServerProposalV7=function(type){ window.EP_V7_IMPORT_TARGET='server_proposal'; try{ if(typeof window.epOpenTextImport==='function') window.epOpenTextImport(type); }catch(e){} };
  var oldRunText=window.epRunTextImport;
  window.epRunTextImport=async function(){ var text=(($('ep-text-import-value')||{}).value)||''; var type=((window.EP_DB_REVIEW||{}).type==='work')?'work':'mat'; try{ if(typeof closeModal==='function') closeModal('ep-text-import-modal'); }catch(e){} try{ showProgress('Импорт текста',35,'Разбор'); var items=rowsToItems(csvRows(text),type); showProgress('Импорт текста',100,'Открываю проверку'); setTimeout(hideProgress,250); showReview(items,type,'текст',window.EP_V7_IMPORT_TARGET||scope()); }catch(e){ hideProgress(); if(typeof oldRunText==='function') return oldRunText(); toast('❌ Ошибка текста'); } };
  function saveVisibleEdits(){ var st=window.EP_DB_REVIEW_V6||{}; var start=(st.page||0)*PAGE_SIZE; var end=Math.min(start+PAGE_SIZE,(st.items||[]).length); for(var i=start;i<end;i++){ var base=(st.items||[])[i]||{}; var ch=$('ep-db-check-'+i); if(ch)st.selected[i]=!!ch.checked; var n=$('ep-db-name-'+i),c=$('ep-db-cat-'+i),sc=$('ep-db-subcat-'+i),p=$('ep-db-price-'+i),u=$('ep-db-unit-'+i); if(n||c||sc||p||u){ st.editCache[i]={n:n?n.value:base.n,c:c?c.value:base.c,sc:sc?sc.value:(base.sc||base.g),p:p?p.value:base.p,u:u?u.value:base.u}; } } }
  function collectReviewed(){ saveVisibleEdits(); var st=window.EP_DB_REVIEW_V6||{}; var type=st.type==='work'?'work':'mat', out=[]; (st.items||[]).forEach(function(base,i){ if(st.selected&&st.selected[i]===false)return; var ed=(st.editCache&&st.editCache[i])||base||{}; var it=normItem({id:base.id,n:ed.n||base.n,c:ed.c||base.c,sc:ed.sc||ed.g||base.sc||base.g,p:ed.p!=null?ed.p:base.p,u:ed.u||base.u},type,i); if(it){ try{ if(typeof window.epAutoGroupItem==='function') it=window.epAutoGroupItem(type,it); }catch(e){} out.push(it); } }); return {type:type,items:out}; }
  window.epApplyReviewedDbItems=async function(mode){ var data=collectReviewed(), type=data.type, items=data.items; if(!items.length)return toast('Нет выбранных позиций'); var target=window.EP_V7_IMPORT_TARGET||scope(); showProgress('Запись базы',10,'Подготовка'); try{ if(target==='server_proposal'){ await sendProposal(type,items,'import_to_server_'+(mode||'add'),showProgress); showProgress('Запись базы',100,'Заявка отправлена'); toast('✅ Импорт отправлен админу заявкой: '+items.length+' поз.'); }
      else if(target==='global'){ if(!isAdmin()) throw new Error('Серверную базу меняет только админ'); var g=getServer(type); items.forEach(function(it,idx){ g=upsert(g,type,it,mode==='replace'); if(idx%25===0)showProgress('Запись базы',20+Math.min(35,idx/Math.max(1,items.length)*35),'Запись строк'); }); setServer(type,g); await saveServerRemote(showProgress); showProgress('Запись базы',96,'Перезагрузка базы сервера'); await reloadActiveDb(); toast('✅ Импорт добавлен в базу сервера: '+items.length+' поз.'); }
      else { setScope('my'); var a=getMy(type); items.forEach(function(it,idx){ a=upsert(a,type,it,mode==='replace'); if(idx%25===0)showProgress('Запись базы',20+Math.min(35,idx/Math.max(1,items.length)*35),'Запись строк'); }); setMy(type,a); var ok=await saveMyRemote(showProgress); showProgress('Запись базы',96,'Перезагрузка моей базы'); if(ok) await reloadActiveDb(); else { syncMain('my'); renderDbEditors(); } toast('✅ Импорт сохранён в моей базе: '+items.length+' поз.'+(ok?'':' Сервер не подтвердил, но на телефоне база есть.')); }
      try{ if(typeof closeModal==='function') closeModal('ep-db-ai-review-modal'); }catch(e){} showProgress('Запись базы',100,'Готово'); setTimeout(hideProgress,500); }
    catch(e){ hideProgress(); toast('❌ '+(e.message||'Ошибка сохранения')); console.error('EP V7 apply',e); } finally{ window.EP_V7_IMPORT_TARGET=null; } };

  function install(){ try{ var old=$('ep-db-ai-tools'); if(old)old.style.display='none'; }catch(e){} try{ renderDbEditors(); }catch(e){} }
  document.addEventListener('DOMContentLoaded',function(){ ensureProgress(); setTimeout(install,700); setTimeout(install,1600); });
  setTimeout(install,300);
})();
