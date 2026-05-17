/*
 * Extracted from public/index.html
 * Original script block: 16
 * Original HTML lines: 8090-8394
 */

/* === EP_DB_SAVE_FIX_V8 2026-05-14 ===
   Surgical fix: do not hide Firebase save errors, do not reload empty DB after failed save,
   make manual add / import / price edit persist strictly to selected DB.
   Shield logic is not touched.
*/
(function(){
  var LS_SCOPE='ep_db_scope_v2';
  var LS_MY_MAT='user_db_mat_v31';
  var LS_MY_WORK='user_db_work_v31';
  var LS_SERVER_CACHE='ep_global_cache_force_v1';
  var PAGE_SIZE=60;
  var ADMIN_EMAILS=['vits0007@gmail.com'];
  var ADMIN_PHONES=['89776230182'];

  function $(id){ return document.getElementById(id); }
  function toast(t){ try{ if(typeof showToast==='function') showToast(String(t)); else console.log(t); }catch(e){ console.log(t); } }
  function esc(s){ return String(s==null?'':s).replace(/[&<>"']/g,function(m){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m];}); }
  function norm(s){ return String(s||'').toLowerCase().replace(/ё/g,'е').replace(/×/g,'x').replace(/х/g,'x').replace(/[^a-zа-я0-9]+/g,' ').trim(); }
  function money(v){ var n=Number(String(v==null?'':v).replace(',','.').replace(/[^\d.\-]/g,'')); return Number.isFinite(n)?n:0; }
  function groupOf(it){ return (it&&(it.g||it.sc||it.subcategory||it.group))||''; }
  function clean(s){ return String(s||'').replace(/\s+/g,' ').trim(); }
  function sig(type,it){ return type+'|'+norm([it&&it.c,groupOf(it),it&&it.n,it&&it.u].filter(Boolean).join('|')); }
  function clone(it){ var x=Object.assign({},it||{}); delete x.__src; delete x.__encoded; return x; }
  function scope(){ try{return localStorage.getItem(LS_SCOPE)==='global'?'global':'my';}catch(e){return 'my';} }
  function setScope(s){ try{localStorage.setItem(LS_SCOPE,s==='global'?'global':'my');}catch(e){} }
  function fbUser(){ try{ return (typeof firebase!=='undefined' && firebase.auth && firebase.auth().currentUser) ? firebase.auth().currentUser : null; }catch(e){ return null; } }
  function uid(){ try{ return (window.appUser&&appUser.uid) || (fbUser()&&fbUser().uid) || ''; }catch(e){ return ''; } }
  function currentEmail(){ try{ return String((window.appUser&&appUser.email) || (fbUser()&&fbUser().email) || '').toLowerCase(); }catch(e){ return ''; } }
  function isAdmin(){
    try{
      var em=currentEmail();
      var ph=String((window.appUser&&appUser.phone)||'');
      return !!(window.appUser && appUser.role==='admin') || ADMIN_EMAILS.indexOf(em)>=0 || ADMIN_PHONES.indexOf(ph)>=0;
    }catch(e){ return false; }
  }
  function canEdit(){ return scope()==='my' || (scope()==='global' && isAdmin()); }
  function label(){ return scope()==='global'?'🌍 База сервера':'👤 Моя база'; }
  function readArr(k){ try{ var a=JSON.parse(localStorage.getItem(k)||'[]'); return Array.isArray(a)?a:[]; }catch(e){ return []; } }
  function writeArr(k,a){ try{ if(typeof safeSet==='function') safeSet(k,JSON.stringify(a||[])); else localStorage.setItem(k,JSON.stringify(a||[])); }catch(e){ try{localStorage.setItem(k,JSON.stringify(a||[]));}catch(_e){} } }
  function readObj(k){ try{ var o=JSON.parse(localStorage.getItem(k)||'{}'); return o&&typeof o==='object'?o:{}; }catch(e){ return {}; } }
  function writeObj(k,o){ try{ localStorage.setItem(k,JSON.stringify(o||{})); }catch(e){} }
  function unique(arr,type){ var seen={},out=[]; (arr||[]).forEach(function(raw){ var it=clone(raw); if(!clean(it.n))return; if(it.sc&&!it.g)it.g=it.sc; if(it.g&&!it.sc)it.sc=it.g; if(!it.c)it.c='Разное'; if(!it.u)it.u='шт'; if(!it.id)it.id=(type==='work'?'w':'m')+'_v8_'+Date.now()+'_'+Math.random().toString(36).slice(2,8); var k=sig(type,it); if(seen[k])return; seen[k]=1; out.push(it); }); return out; }
  function getMy(type){ var a=type==='work'?window.EP_MY_WORK:window.EP_MY_MAT; return Array.isArray(a)?a.slice():readArr(type==='work'?LS_MY_WORK:LS_MY_MAT); }
  function getServer(type){ var a=type==='work'?window.EP_GLOBAL_WORK:window.EP_GLOBAL_MAT; if(Array.isArray(a))return a.slice(); var o=readObj(LS_SERVER_CACHE); a=type==='work'?o.workDB:o.matDB; return Array.isArray(a)?a.slice():[]; }
  function setMy(type,arr){ arr=unique(arr,type); if(type==='work') window.EP_MY_WORK=arr; else window.EP_MY_MAT=arr; writeArr(type==='work'?LS_MY_WORK:LS_MY_MAT,arr); try{ window.userMatDB=getMy('mat'); window.userWorkDB=getMy('work'); }catch(e){} syncMain('my'); }
  function setServer(type,arr){ arr=unique(arr,type); if(type==='work') window.EP_GLOBAL_WORK=arr; else window.EP_GLOBAL_MAT=arr; var mat=type==='mat'?arr:getServer('mat'); var work=type==='work'?arr:getServer('work'); writeObj(LS_SERVER_CACHE,{matDB:mat,workDB:work,ts:Date.now()}); try{ window.EP_FORCE_GLOBAL={matDB:mat,workDB:work}; window.EP_ULTIMATE_DB_CACHE={matDB:mat,workDB:work,ts:Date.now()}; window.EP_GLOBAL_DB_VISIBLE_CACHE={matDB:mat,workDB:work,ts:Date.now()}; }catch(e){} syncMain('global'); }
  function syncMain(target){ try{ var use=target||scope(); window.matDB=(use==='global'?getServer('mat'):getMy('mat')); window.workDB=(use==='global'?getServer('work'):getMy('work')); try{ matDB=window.matDB; workDB=window.workDB; }catch(e){} }catch(e){} }
  function active(type){ return scope()==='global'?getServer(type):getMy(type); }
  function upsert(arr,type,it,replace){ it=clone(it); if(!it.id)it.id=(type==='work'?'w':'m')+'_v8_'+Date.now()+'_'+Math.random().toString(36).slice(2,8); if(it.sc&&!it.g)it.g=it.sc; if(it.g&&!it.sc)it.sc=it.g; if(!it.c)it.c='Разное'; if(!it.u)it.u='шт'; var k=sig(type,it); var idx=(arr||[]).findIndex(function(x){return sig(type,x)===k || (it.id&&String(x.id||'')===String(it.id));}); if(idx>=0)arr[idx]=Object.assign({},replace?{}:arr[idx],it,{id:(arr[idx]&&arr[idx].id)||it.id}); else arr.push(it); return arr; }

  function ensureProgress(){
    if($('ep-v7-progress')) return;
    var d=document.createElement('div'); d.id='ep-v7-progress'; d.style.cssText='position:fixed;inset:0;z-index:99999;background:rgba(15,23,42,.62);display:none;align-items:center;justify-content:center;padding:18px;';
    d.innerHTML='<div style="width:min(460px,94vw);border-radius:20px;background:#fff;box-shadow:0 24px 70px rgba(0,0,0,.35);padding:18px;"><div id="ep-v7-progress-title" style="font-weight:900;color:#4f46e5;font-size:17px;margin-bottom:8px;">Выполняю...</div><div style="height:16px;background:#e5e7eb;border-radius:999px;overflow:hidden;"><div id="ep-v7-progress-fill" style="height:100%;width:0%;background:linear-gradient(90deg,#2563eb,#10b981);transition:width .18s ease;"></div></div><div id="ep-v7-progress-txt" style="font-size:12px;color:#64748b;font-weight:800;margin-top:8px;">0%</div></div>';
    document.body.appendChild(d);
  }
  function showProgress(title,pct,txt){ ensureProgress(); var p=$('ep-v7-progress'),f=$('ep-v7-progress-fill'),t=$('ep-v7-progress-title'),x=$('ep-v7-progress-txt'); if(p)p.style.display='flex'; if(t)t.textContent=title||'Выполняю...'; if(f)f.style.width=Math.max(0,Math.min(100,Math.round(pct||0)))+'%'; if(x)x.textContent=(txt||'')+' '+Math.max(0,Math.min(100,Math.round(pct||0)))+'%'; try{ if(typeof hideLoader==='function') hideLoader(); }catch(e){} }
  function hideProgress(){ var p=$('ep-v7-progress'); if(p)p.style.display='none'; }

  function firebaseHint(){
    var fbu=fbUser();
    if(!fbu) return 'Нет Firebase-входа. Серверная запись может быть запрещена правилами Firebase. Для админа лучше войти через Google-аккаунт администратора.';
    return 'Firebase: '+(fbu.email||fbu.uid)+'.';
  }
  function explainErr(e){
    var msg=(e&&(e.message||e.code))?String(e.message||e.code):'неизвестная ошибка';
    if(/permission|Missing or insufficient/i.test(msg)) return 'Firebase запретил запись: Missing or insufficient permissions. Нужно настроить Firestore Rules или войти админом через Google.';
    return msg;
  }

  async function saveMyRemote(onp){
    writeArr(LS_MY_MAT,getMy('mat'));
    writeArr(LS_MY_WORK,getMy('work'));
    try{ localStorage.setItem('ep_master_db_created_v1','1'); }catch(e){}
    if(onp)onp('Сохраняю мою базу',45,'Локально');
    if(!(typeof db!=='undefined'&&db)) throw new Error('Firebase db не подключён. Локально сохранено, но на сервер не ушло.');
    if(!uid()) throw new Error('Нет uid мастера. Перезайдите в аккаунт.');
    if(onp)onp('Сохраняю мою базу',70,'Запись user_db/'+uid());
    await db.collection('user_db').doc(uid()).set({
      uid:uid(),
      masterName:(window.appUser&&(appUser.name||appUser.email||appUser.phone))||'',
      matDB:getMy('mat'),
      workDB:getMy('work'),
      created:true,
      updatedAt:new Date().toISOString()
    },{merge:true});
    if(onp)onp('Сохраняю мою базу',92,'Сервер подтвердил');
    return true;
  }
  async function saveServerRemote(onp){
    writeObj(LS_SERVER_CACHE,{matDB:getServer('mat'),workDB:getServer('work'),ts:Date.now()});
    if(!isAdmin()) throw new Error('Серверную базу сохраняет только админ.');
    if(!(typeof db!=='undefined'&&db)) throw new Error('Firebase db не подключён.');
    if(onp)onp('Сохраняю базу сервера',65,'Запись settings/global_db');
    await db.collection('settings').doc('global_db').set({
      matDB:getServer('mat'),
      workDB:getServer('work'),
      cleanMode:true,
      updatedAt:new Date().toISOString(),
      updatedBy:(window.appUser&&(appUser.email||appUser.phone||appUser.uid))||''
    },{merge:true});
    if(onp)onp('Сохраняю базу сервера',92,'Сервер подтвердил');
    return true;
  }
  async function sendProposal(type,items,reason,onp){
    if(!(typeof db!=='undefined'&&db)) throw new Error('Firebase db не подключён. Заявку отправить нельзя.');
    if(onp)onp('Отправляю заявку',70,'db_proposals');
    await db.collection('db_proposals').add({
      type:type,
      items:Array.isArray(items)?items.map(clone):items,
      reason:reason||'server_request',
      target:'server_db',
      uid:uid()||'',
      masterName:(window.appUser&&(appUser.name||appUser.email||appUser.phone))||'',
      userEmail:currentEmail(),
      status:'pending',
      createdAt:new Date().toISOString()
    });
    return true;
  }
  async function reloadFromRemoteCurrent(){
    try{
      if(!(typeof db!=='undefined'&&db)) return false;
      if(scope()==='global'){
        var gd=await db.collection('settings').doc('global_db').get();
        if(gd.exists){ var g=gd.data()||{}; setServer('mat',Array.isArray(g.matDB)?g.matDB:[]); setServer('work',Array.isArray(g.workDB)?g.workDB:[]); return true; }
      } else if(uid()){
        var ud=await db.collection('user_db').doc(uid()).get();
        if(ud.exists){ var u=ud.data()||{}; setMy('mat',Array.isArray(u.matDB)?u.matDB:getMy('mat')); setMy('work',Array.isArray(u.workDB)?u.workDB:getMy('work')); return true; }
      }
    }catch(e){ console.warn('EP V8 reload remote failed',e); }
    return false;
  }
  function rerender(){ try{ syncMain(scope()); if(typeof renderDbEditors==='function') renderDbEditors(); }catch(e){} try{ if(typeof rf==='function') rf(); }catch(e){} }
  function currentEditType(){
    var wb=$('editor-work-list'), mb=$('editor-mat-list');
    if(wb && wb.offsetParent!==null && wb.style.display!=='none') return 'work';
    if(mb && mb.offsetParent!==null && mb.style.display!=='none') return 'mat';
    return 'mat';
  }
  function makeManualItem(type){
    var cat=$('db-new-cat')?clean($('db-new-cat').value):'';
    var name=$('db-new-name')?clean($('db-new-name').value):'';
    var price=$('db-new-price')?money($('db-new-price').value):0;
    var unit=$('db-new-unit')?clean($('db-new-unit').value)||'шт':'шт';
    if(!name) throw new Error('Введите название позиции');
    var it={id:(type==='work'?'w':'m')+'_manual_v8_'+Date.now(),c:cat||'Разное',n:name,p:price,u:unit};
    try{ if(typeof window.epAutoGroupItem==='function') it=window.epAutoGroupItem(type,it); }catch(e){}
    return it;
  }

  var oldAdd=window.addDbItem;
  window.addDbItem=async function(){
    var type=currentEditType();
    showProgress('Добавляю позицию',15,'Подготовка');
    try{
      var item=makeManualItem(type);
      if(scope()==='global'){
        if(!isAdmin()){
          await sendProposal(type,[item],'add_manual_to_server',showProgress);
          toast('✅ Позиция отправлена админу заявкой');
        } else {
          var g=getServer(type); g=upsert(g,type,item,true); setServer(type,g);
          await saveServerRemote(showProgress);
          await reloadFromRemoteCurrent();
          toast('✅ Добавлено и сохранено в базу сервера');
        }
      } else {
        var a=getMy(type); a=upsert(a,type,item,true); setMy(type,a);
        try{ await saveMyRemote(showProgress); toast('✅ Добавлено и сохранено в моей базе'); }
        catch(e){ toast('⚠️ Добавлено на телефоне, но сервер не подтвердил: '+explainErr(e)); }
      }
      if($('db-new-name')) $('db-new-name').value='';
      if($('db-new-price')) $('db-new-price').value='';
      showProgress('Добавляю позицию',100,'Готово');
      setTimeout(hideProgress,450); rerender();
    }catch(e){ hideProgress(); toast('❌ '+explainErr(e)); console.error('EP V8 addDbItem failed',e); if(/not defined/i.test(String(e.message||''))&&typeof oldAdd==='function') return oldAdd(); }
  };

  window.epChangePriceV7=async function(type,id,newPrice){
    type=type==='work'?'work':'mat';
    if(!canEdit()){ rerender(); return toast('Сервер редактирует только админ'); }
    showProgress('Сохраняю цену',25,'Локально');
    try{
      var arr=active(type).slice(); var it=arr.find(function(x){return String(x.id||'')===String(id);});
      if(!it) throw new Error('Позиция не найдена');
      it=Object.assign({},it,{p:money(newPrice)}); arr=upsert(arr,type,it,true);
      if(scope()==='global'){
        setServer(type,arr); await saveServerRemote(showProgress); await reloadFromRemoteCurrent(); toast('✅ Цена сохранена в базе сервера');
      } else {
        setMy(type,arr); try{ await saveMyRemote(showProgress); toast('✅ Цена сохранена в моей базе'); }catch(e){ toast('⚠️ Цена сохранена на телефоне, сервер не подтвердил: '+explainErr(e)); }
      }
      showProgress('Сохраняю цену',100,'Готово'); setTimeout(hideProgress,350); rerender();
    }catch(e){ hideProgress(); toast('❌ '+explainErr(e)); console.error('EP V8 price failed',e); rerender(); }
  };

  window.epSaveActiveDbV7=async function(){
    if(!canEdit()) return toast('Сохранять базу сервера может только админ');
    showProgress('Сохраняю '+label(),20,'Подготовка');
    try{
      if(scope()==='global'){
        await saveServerRemote(showProgress);
        await reloadFromRemoteCurrent();
        toast('✅ База сервера сохранена и перезагружена');
      } else {
        try{ await saveMyRemote(showProgress); await reloadFromRemoteCurrent(); toast('✅ Моя база сохранена и перезагружена'); }
        catch(e){ toast('⚠️ Моя база сохранена на телефоне, но не на сервере: '+explainErr(e)); }
      }
      showProgress('Сохраняю '+label(),100,'Готово'); setTimeout(hideProgress,450); rerender();
    }catch(e){ hideProgress(); toast('❌ '+explainErr(e)); console.error('EP V8 save active failed',e); rerender(); }
  };

  window.epReloadActiveDbV7=async function(){
    showProgress('Перезагружаю '+label(),20,'Запрос');
    var ok=await reloadFromRemoteCurrent();
    syncMain(scope()); rerender();
    showProgress('Перезагружаю '+label(),100,ok?'С сервера':'Локально');
    setTimeout(hideProgress,350);
    toast(ok?'✅ База обновлена с сервера':'⚠️ Сервер не отдал базу. Показана локальная копия.');
  };

  window.epCopyOneServerToMy=async function(type,itemStr){
    type=type==='work'?'work':'mat';
    try{
      var it=JSON.parse(decodeURIComponent(itemStr||'{}'));
      if(!it||!it.n) throw new Error('Позиция не найдена');
      var copy=clone(it); copy.originServerId=copy.originServerId||copy.id||''; copy.id='local_'+type+'_v8_'+Date.now()+'_'+Math.random().toString(36).slice(2,8);
      var arr=getMy(type); arr=upsert(arr,type,copy,true); setMy(type,arr);
      showProgress('Добавляю в мою базу',45,'Локально');
      try{ await saveMyRemote(showProgress); toast('✅ Позиция добавлена и сохранена в моей базе'); }
      catch(e){ toast('⚠️ Добавлено на телефоне, сервер не подтвердил: '+explainErr(e)); }
      showProgress('Добавляю в мою базу',100,'Готово'); setTimeout(hideProgress,350); rerender();
    }catch(e){ hideProgress(); toast('❌ '+explainErr(e)); }
  };
  window.epCopyOneGlobalToMy=window.epCopyOneServerToMy;

  function saveVisibleEdits(){
    var st=window.EP_DB_REVIEW_V6||{}; var start=(st.page||0)*PAGE_SIZE; var end=Math.min(start+PAGE_SIZE,(st.items||[]).length);
    for(var i=start;i<end;i++){
      var base=(st.items||[])[i]||{}; var ch=$('ep-db-check-'+i); if(ch)st.selected[i]=!!ch.checked;
      var n=$('ep-db-name-'+i),c=$('ep-db-cat-'+i),sc=$('ep-db-subcat-'+i),p=$('ep-db-price-'+i),u=$('ep-db-unit-'+i);
      if(n||c||sc||p||u){ st.editCache=st.editCache||{}; st.editCache[i]={n:n?n.value:base.n,c:c?c.value:base.c,sc:sc?sc.value:(base.sc||base.g),p:p?p.value:base.p,u:u?u.value:base.u}; }
    }
  }
  function normItem(raw,type,idx){
    raw=raw||{}; var n=clean(raw.n||raw.name||raw['Наименование']||raw['Название']||raw['Имя']); if(!n)return null;
    var c=clean(raw.c||raw.category||raw['Категория'])||'Разное';
    var sc=clean(raw.sc||raw.g||raw.subcategory||raw['Подкатегория']||raw['Группа'])||'Разное';
    var p=money(raw.p!=null?raw.p:(raw.price||raw['Цена']||raw['Стоимость']));
    var u=clean(raw.u||raw.unit||raw['Ед']||raw['Единица'])||'шт';
    return {id:raw.id||((type==='work'?'w':'m')+'_imp_v8_'+Date.now()+'_'+idx),n:n,c:c,sc:sc,g:sc,p:p,u:u};
  }
  function collectReviewed(){
    saveVisibleEdits(); var st=window.EP_DB_REVIEW_V6||{}; var type=st.type==='work'?'work':'mat',out=[];
    (st.items||[]).forEach(function(base,i){ if(st.selected&&st.selected[i]===false)return; var ed=(st.editCache&&st.editCache[i])||base||{}; var it=normItem({id:base.id,n:ed.n||base.n,c:ed.c||base.c,sc:ed.sc||ed.g||base.sc||base.g,p:ed.p!=null?ed.p:base.p,u:ed.u||base.u},type,i); if(it){ try{ if(typeof window.epAutoGroupItem==='function') it=window.epAutoGroupItem(type,it); }catch(e){} out.push(it); } });
    return {type:type,items:out};
  }

  window.epApplyReviewedDbItems=async function(mode){
    var data=collectReviewed(), type=data.type, items=data.items; if(!items.length)return toast('Нет выбранных позиций');
    var target=window.EP_V7_IMPORT_TARGET || scope();
    showProgress('Запись базы',10,'Подготовка');
    try{
      if(target==='server_proposal'){
        await sendProposal(type,items,'import_to_server_'+(mode||'add'),showProgress);
        toast('✅ Импорт отправлен админу заявкой: '+items.length+' поз.');
      } else if(target==='global'){
        if(!isAdmin()) throw new Error('Серверную базу меняет только админ');
        var g=getServer(type); items.forEach(function(it,idx){ g=upsert(g,type,it,mode==='replace'); if(idx%25===0)showProgress('Запись базы',20+Math.min(35,idx/Math.max(1,items.length)*35),'Строки'); });
        setServer(type,g);
        await saveServerRemote(showProgress);
        await reloadFromRemoteCurrent();
        toast('✅ Импорт сохранён в базе сервера: '+items.length+' поз.');
      } else {
        setScope('my'); var a=getMy(type); items.forEach(function(it,idx){ a=upsert(a,type,it,mode==='replace'); if(idx%25===0)showProgress('Запись базы',20+Math.min(35,idx/Math.max(1,items.length)*35),'Строки'); });
        setMy(type,a);
        try{ await saveMyRemote(showProgress); await reloadFromRemoteCurrent(); toast('✅ Импорт сохранён в моей базе: '+items.length+' поз.'); }
        catch(e){ toast('⚠️ Импорт сохранён на телефоне, но сервер не подтвердил: '+explainErr(e)); }
      }
      try{ if(typeof closeModal==='function') closeModal('ep-db-ai-review-modal'); }catch(e){}
      showProgress('Запись базы',100,'Готово'); setTimeout(hideProgress,500); syncMain(scope()); rerender();
    }catch(e){ hideProgress(); toast('❌ '+explainErr(e)); console.error('EP V8 apply failed',e); }
    finally{ window.EP_V7_IMPORT_TARGET=null; }
  };

  window.epFirebaseDbDebug=function(){
    var fbu=fbUser();
    var info={scope:scope(),appUser:window.appUser||null,firebaseUser:fbu?{uid:fbu.uid,email:fbu.email}:null,isAdmin:isAdmin(),uid:uid(),myMat:getMy('mat').length,myWork:getMy('work').length,serverMat:getServer('mat').length,serverWork:getServer('work').length,hint:firebaseHint()};
    console.log('EP Firebase DB debug',info);
    alert('Проверка Firebase\n\nАктивно: '+label()+'\nАдмин: '+(isAdmin()?'да':'нет')+'\nUID: '+(uid()||'нет')+'\nFirebase вход: '+(fbu?(fbu.email||fbu.uid):'нет')+'\nМоя база: '+info.myMat+' мат / '+info.myWork+' раб\nСервер: '+info.serverMat+' мат / '+info.serverWork+' раб\n\n'+firebaseHint());
    return info;
  };

  function injectDebugButton(){
    var p=$('ep-v7-db-panel'); if(!p || $('ep-v8-fb-debug-btn')) return;
    var b=document.createElement('button'); b.id='ep-v8-fb-debug-btn'; b.className='btn-info'; b.style.cssText='width:100%;margin-top:8px;padding:10px;'; b.textContent='🔎 Проверить Firebase-сохранение'; b.onclick=function(){ window.epFirebaseDbDebug(); };
    p.appendChild(b);
  }
  var oldRender=window.renderDbEditors;
  window.renderDbEditors=function(){ try{ if(typeof oldRender==='function') oldRender(); }catch(e){ console.warn('old renderDbEditors failed',e); } try{ injectDebugButton(); }catch(e){} };
  document.addEventListener('DOMContentLoaded',function(){ setTimeout(function(){ try{ window.renderDbEditors(); }catch(e){} },900); setTimeout(function(){ try{ injectDebugButton(); }catch(e){} },1800); });
  setTimeout(function(){ try{ window.renderDbEditors(); }catch(e){} },400);
})();
