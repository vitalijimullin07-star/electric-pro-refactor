/*
 * Extracted from public/index.html
 * Original script block: 17
 * Original HTML lines: 8398-8621
 */

/* === EP DB IMPORT SERVER SAVE FIX V9 2026-05-14 ===
   Fix: manual server add saved, but import could be applied to wrong scope or only local cache.
   This final patch explicitly captures import target and writes imported server DB to Firebase settings/global_db.
   Shield logic is not touched.
*/
(function(){
  var LS_SCOPE='ep_db_scope_v2';
  var LS_MY_MAT='user_db_mat_v31';
  var LS_MY_WORK='user_db_work_v31';
  var LS_SERVER_CACHE='ep_global_cache_force_v1';
  var PAGE_SIZE=60;
  var oldTrigger=window.epTriggerDbFileImport;
  var oldOpenText=window.epOpenTextImport;

  function $(id){ return document.getElementById(id); }
  function toast(t){ try{ if(typeof showToast==='function') showToast(t); else alert(t); }catch(e){ console.log(t); } }
  function esc(s){ return String(s==null?'':s).replace(/[&<>"']/g,function(m){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m];}); }
  function clean(v){ return String(v==null?'':v).replace(/\s+/g,' ').trim(); }
  function norm(s){ return clean(s).toLowerCase().replace(/ё/g,'е').replace(/×/g,'x').replace(/х/g,'x').replace(/[^a-zа-я0-9]+/g,' ').trim(); }
  function money(v){ var n=Number(String(v==null?'':v).replace(',','.').replace(/[^\d.\-]/g,'')); return Number.isFinite(n)?n:0; }
  function scope(){ try{return localStorage.getItem(LS_SCOPE)==='global'?'global':'my';}catch(e){return 'my';} }
  function setScope(s){ try{ localStorage.setItem(LS_SCOPE, s==='global'?'global':'my'); }catch(e){} }
  function isAdmin(){ try{ return !!(window.appUser && window.appUser.role==='admin'); }catch(e){ return false; } }
  function uid(){ try{ return (window.appUser && window.appUser.uid) || (firebase.auth && firebase.auth().currentUser && firebase.auth().currentUser.uid) || ''; }catch(e){ return (window.appUser&&window.appUser.uid)||''; } }
  function currentUserLabel(){ try{ var u=(firebase.auth&&firebase.auth().currentUser)||null; return (u&&(u.email||u.uid)) || (window.appUser&&(appUser.email||appUser.phone||appUser.uid)) || ''; }catch(e){ return (window.appUser&&(appUser.email||appUser.phone||appUser.uid)) || ''; } }
  function readArr(k){ try{ var a=JSON.parse(localStorage.getItem(k)||'[]'); return Array.isArray(a)?a:[]; }catch(e){ return []; } }
  function writeArr(k,a){ try{ if(typeof safeSet==='function') safeSet(k,JSON.stringify(a||[])); else localStorage.setItem(k,JSON.stringify(a||[])); }catch(e){ try{ localStorage.setItem(k,JSON.stringify(a||[])); }catch(_e){} } }
  function readObj(k){ try{ var o=JSON.parse(localStorage.getItem(k)||'{}'); return o&&typeof o==='object'?o:{}; }catch(e){ return {}; } }
  function writeObj(k,o){ try{ localStorage.setItem(k,JSON.stringify(o||{})); }catch(e){} }
  function clone(x){ return Object.assign({},x||{}); }
  function groupOf(it){ return (it&&(it.sc||it.g||it.group||it.subcategory))||''; }
  function sig(type,it){ return type+'|'+norm([it&&it.c,groupOf(it),it&&it.n,it&&it.u].filter(Boolean).join('|')); }
  function unique(arr,type){ var seen={},out=[]; (arr||[]).forEach(function(raw){ var it=clone(raw); if(!clean(it.n))return; if(it.sc&&!it.g)it.g=it.sc; if(it.g&&!it.sc)it.sc=it.g; if(!it.c)it.c='Разное'; if(!it.u)it.u='шт'; if(!it.id)it.id=(type==='work'?'w':'m')+'_v9_'+Date.now()+'_'+Math.random().toString(36).slice(2,8); var k=sig(type,it); if(seen[k])return; seen[k]=1; out.push(it); }); return out; }
  function getServer(type){ var a=type==='work'?window.EP_GLOBAL_WORK:window.EP_GLOBAL_MAT; if(Array.isArray(a)) return a.slice(); var c=readObj(LS_SERVER_CACHE); a=type==='work'?c.workDB:c.matDB; return Array.isArray(a)?a.slice():[]; }
  function getMy(type){ var a=type==='work'?window.EP_MY_WORK:window.EP_MY_MAT; return Array.isArray(a)?a.slice():readArr(type==='work'?LS_MY_WORK:LS_MY_MAT); }
  function setServer(type,arr){ arr=unique(arr,type); if(type==='work') window.EP_GLOBAL_WORK=arr; else window.EP_GLOBAL_MAT=arr; var mat=type==='mat'?arr:getServer('mat'); var work=type==='work'?arr:getServer('work'); writeObj(LS_SERVER_CACHE,{matDB:mat,workDB:work,ts:Date.now()}); try{ window.EP_FORCE_GLOBAL={matDB:mat,workDB:work}; window.EP_ULTIMATE_DB_CACHE={matDB:mat,workDB:work,ts:Date.now()}; window.EP_GLOBAL_DB_VISIBLE_CACHE={matDB:mat,workDB:work,ts:Date.now()}; }catch(e){} if(scope()==='global') syncMain('global'); }
  function setMy(type,arr){ arr=unique(arr,type); if(type==='work') window.EP_MY_WORK=arr; else window.EP_MY_MAT=arr; writeArr(type==='work'?LS_MY_WORK:LS_MY_MAT,arr); try{ window.userMatDB=getMy('mat'); window.userWorkDB=getMy('work'); }catch(e){} if(scope()==='my') syncMain('my'); }
  function syncMain(target){ try{ var use=target||scope(); window.matDB=(use==='global'?getServer('mat'):getMy('mat')); window.workDB=(use==='global'?getServer('work'):getMy('work')); try{ matDB=window.matDB; workDB=window.workDB; }catch(e){} }catch(e){} }
  function upsert(arr,type,it,replace){ arr=Array.isArray(arr)?arr.slice():[]; it=clone(it); if(!it.id)it.id=(type==='work'?'w':'m')+'_imp_v9_'+Date.now()+'_'+Math.random().toString(36).slice(2,8); if(it.sc&&!it.g)it.g=it.sc; if(it.g&&!it.sc)it.sc=it.g; if(!it.c)it.c='Разное'; if(!it.u)it.u='шт'; var k=sig(type,it); var idx=arr.findIndex(function(x){ return sig(type,x)===k || (it.id&&String(x.id||'')===String(it.id)); }); if(idx>=0){ arr[idx]=replace?Object.assign({},it,{id:(arr[idx]&&arr[idx].id)||it.id}):Object.assign({},arr[idx],it,{id:(arr[idx]&&arr[idx].id)||it.id}); } else arr.push(it); return arr; }

  function ensureProgress(){
    if($('ep-v9-progress')) return;
    var d=document.createElement('div'); d.id='ep-v9-progress'; d.style.cssText='position:fixed;inset:0;z-index:100000;background:rgba(15,23,42,.62);display:none;align-items:center;justify-content:center;padding:18px;';
    d.innerHTML='<div style="width:min(460px,94vw);border-radius:20px;background:#fff;box-shadow:0 24px 70px rgba(0,0,0,.35);padding:18px;"><div id="ep-v9-title" style="font-weight:900;color:#4f46e5;font-size:17px;margin-bottom:8px;">Выполняю...</div><div style="height:16px;background:#e5e7eb;border-radius:999px;overflow:hidden;"><div id="ep-v9-fill" style="height:100%;width:0%;background:linear-gradient(90deg,#2563eb,#10b981);transition:width .18s ease;"></div></div><div id="ep-v9-txt" style="font-size:12px;color:#64748b;font-weight:800;margin-top:8px;">0%</div></div>';
    document.body.appendChild(d);
  }
  function progress(title,pct,txt){ ensureProgress(); var p=$('ep-v9-progress'),f=$('ep-v9-fill'),t=$('ep-v9-title'),x=$('ep-v9-txt'); if(p)p.style.display='flex'; if(t)t.textContent=title||'Выполняю...'; if(f)f.style.width=Math.max(0,Math.min(100,Math.round(pct||0)))+'%'; if(x)x.textContent=(txt||'')+' '+Math.max(0,Math.min(100,Math.round(pct||0)))+'%'; try{ if(typeof hideLoader==='function') hideLoader(); }catch(e){} }
  function hideProgress(){ var p=$('ep-v9-progress'); if(p)p.style.display='none'; }
  function explain(e){ var msg=(e&&(e.message||e.code))?String(e.message||e.code):String(e||'Ошибка'); if(/permission|insufficient/i.test(msg)) return 'Firebase запретил запись: Missing or insufficient permissions. Проверь вход админа через Google и Firestore Rules.'; return msg; }

  function inferCat(name,type){
    var n=norm(name); if(type==='work'){ if(/штроб|борозд|резк|алмаз/.test(n))return 'Штробление'; if(/сверл|подрозет/.test(n))return 'Высверливание подрозетников'; if(/щит|автомат|узо|диф|реле/.test(n))return 'Щитовое'; if(/розет|выключ|механизм|рамк|светильник/.test(n))return 'Чистовая электрика'; return 'Работы'; }
    if(/ввг|пугв|провод|кабел|cat|utp|ftp|sat/.test(n))return 'Кабель'; if(/автомат|узо|диф|реле|контактор|узм|уздп/.test(n))return 'Автоматика'; if(/щит|бокс|корпус|din|шина|гребен|клемм/.test(n))return 'Щитовое'; if(/гофр|труб|лоток|канал/.test(n))return 'Трубы'; if(/подрозет|wago|гмл|наконечник|стяж|клипс|дюбел|саморез/.test(n))return 'Расходники'; if(/розет|выключ|рамк|диммер|механизм/.test(n))return 'Чистовое'; return 'Разное';
  }
  function inferSub(name,cat,type){ var n=norm(name); if(type==='work'){ if(/подрозет|сверл/.test(n))return 'Подрозетники'; if(/штроб/.test(n))return 'Штробление'; if(/щит/.test(n))return 'Щит'; return 'Работы'; } if(/диф/.test(n))return 'ДИФы'; if(/узо/.test(n))return 'УЗО'; if(/автомат/.test(n))return 'Автоматы'; if(/гребен/.test(n))return 'Гребёнки'; if(/шина|клемм/.test(n))return 'Шинки / клеммники'; if(/подрозет/.test(n))return 'Подрозетники'; if(/ввг/.test(n))return 'ВВГ'; if(/пугв/.test(n))return 'ПуГВ'; return cat||'Разное'; }
  function normItem(raw,type,idx){ raw=raw||{}; var n=clean(raw.n||raw.name||raw.title||raw.item||raw.position||raw['Наименование']||raw['Название']||raw['Имя']||raw['Позиция']); if(!n)return null; var c=clean(raw.c||raw.category||raw.cat||raw.group||raw['Категория'])||inferCat(n,type); var sc=clean(raw.sc||raw.g||raw.subcategory||raw.subcat||raw['Подкатегория']||raw['Группа'])||inferSub(n,c,type); var p=money(raw.p!=null?raw.p:(raw.price!=null?raw.price:(raw.cost!=null?raw.cost:(raw['Цена']||raw['Стоимость'])))); var u=clean(raw.u||raw.unit||raw.measure||raw['Ед']||raw['Ед.']||raw['Единица']||raw['Ед. изм.'])||'шт'; var it={id:raw.id||((type==='work'?'w':'m')+'_imp_v9_'+Date.now()+'_'+idx),n:n,c:c,sc:sc,g:sc,p:p,u:u}; try{ if(typeof window.epAutoGroupItem==='function') it=window.epAutoGroupItem(type,it); }catch(e){} return it; }
  function collectReviewed(){
    var st=window.EP_DB_REVIEW_V6 || window.EP_DB_REVIEW || {}; var type=st.type==='work'?'work':'mat';
    var start=(st.page||0)*PAGE_SIZE, end=Math.min(start+PAGE_SIZE,(st.items||[]).length);
    st.editCache=st.editCache||{}; st.selected=st.selected||{};
    for(var i=start;i<end;i++){
      var base=(st.items||[])[i]||{}; var ch=$('ep-db-check-'+i); if(ch) st.selected[i]=!!ch.checked;
      var n=$('ep-db-name-'+i), c=$('ep-db-cat-'+i), sc=$('ep-db-subcat-'+i), p=$('ep-db-price-'+i), u=$('ep-db-unit-'+i);
      if(n||c||sc||p||u) st.editCache[i]={n:n?n.value:base.n,c:c?c.value:base.c,sc:sc?sc.value:(base.sc||base.g),p:p?p.value:base.p,u:u?u.value:base.u};
    }
    var out=[]; (st.items||[]).forEach(function(base,i){ if(st.selected&&st.selected[i]===false)return; var ed=(st.editCache&&st.editCache[i])||base||{}; var it=normItem({id:base.id,n:ed.n||base.n,c:ed.c||base.c,sc:ed.sc||ed.g||base.sc||base.g,p:ed.p!=null?ed.p:base.p,u:ed.u||base.u},type,i); if(it)out.push(it); });
    return {type:type,items:unique(out,type)};
  }

  async function readGlobalDoc(){
    if(!(typeof db!=='undefined'&&db)) throw new Error('Firebase db не подключён.');
    var snap=await db.collection('settings').doc('global_db').get();
    var data=snap.exists?(snap.data()||{}):{};
    return {matDB:Array.isArray(data.matDB)?data.matDB:[], workDB:Array.isArray(data.workDB)?data.workDB:[], raw:data};
  }
  async function saveGlobalImport(type,items,replace){
    if(!isAdmin()) throw new Error('Импорт в базу сервера может делать только админ.');
    if(!(typeof db!=='undefined'&&db)) throw new Error('Firebase db не подключён.');
    progress('Запись в базу сервера',20,'Читаю текущую базу сервера');
    var current=await readGlobalDoc().catch(function(){ return {matDB:getServer('mat'),workDB:getServer('work'),raw:{}}; });
    var targetArr=(type==='work'?current.workDB:current.matDB).slice();
    items.forEach(function(it,idx){ targetArr=upsert(targetArr,type,it,!!replace); if(idx%25===0) progress('Запись в базу сервера',25+Math.min(40,idx/Math.max(1,items.length)*40),'Добавляю строки'); });
    var finalMat=type==='mat'?unique(targetArr,'mat'):unique(current.matDB,'mat');
    var finalWork=type==='work'?unique(targetArr,'work'):unique(current.workDB,'work');
    setServer('mat',finalMat); setServer('work',finalWork);
    progress('Запись в базу сервера',72,'Отправляю в Firebase settings/global_db');
    await db.collection('settings').doc('global_db').set({matDB:finalMat,workDB:finalWork,cleanMode:true,updatedAt:new Date().toISOString(),updatedBy:currentUserLabel()}, {merge:true});
    progress('Запись в базу сервера',88,'Проверяю запись');
    var verify=await readGlobalDoc();
    setServer('mat',verify.matDB); setServer('work',verify.workDB); syncMain('global');
    var savedCount=(type==='work'?verify.workDB:verify.matDB).length;
    if(savedCount < items.length) throw new Error('Firebase вернул слишком мало позиций после записи. Проверь правила или структуру settings/global_db.');
    return savedCount;
  }
  async function saveMyImport(type,items,replace){
    var arr=getMy(type); items.forEach(function(it,idx){ arr=upsert(arr,type,it,!!replace); if(idx%25===0) progress('Запись в мою базу',20+Math.min(40,idx/Math.max(1,items.length)*40),'Добавляю строки'); });
    setMy(type,arr); progress('Запись в мою базу',68,'Локально сохранено');
    if(typeof db!=='undefined'&&db&&uid()){
      await db.collection('user_db').doc(uid()).set({uid:uid(),masterName:(window.appUser&&(appUser.name||appUser.email||appUser.phone))||'',matDB:getMy('mat'),workDB:getMy('work'),created:true,updatedAt:new Date().toISOString()}, {merge:true});
      progress('Запись в мою базу',90,'Сервер подтвердил');
    }
    return getMy(type).length;
  }
  async function sendServerProposal(type,items){
    if(!(typeof db!=='undefined'&&db)) throw new Error('Firebase db не подключён.');
    progress('Отправляю заявку админу',60,'db_proposals');
    await db.collection('db_proposals').add({type:type,items:items.map(clone),reason:'import_to_server',target:'server_db',uid:uid(),masterName:(window.appUser&&(appUser.name||appUser.email||appUser.phone))||'',userEmail:currentUserLabel(),status:'pending',createdAt:new Date().toISOString()});
    return true;
  }
  function rerender(){ try{ syncMain(scope()); if(typeof renderDbEditors==='function') renderDbEditors(); }catch(e){} try{ if(typeof rf==='function') rf(); }catch(e){} }

  window.epTriggerDbFileImport=function(type){
    type=type==='work'?'work':'mat';
    var target=scope()==='global'?(isAdmin()?'global':'server_proposal'):'my';
    window.EP_V9_IMPORT_TARGET=target;
    window.EP_V7_IMPORT_TARGET=target;
    if(target==='my') setScope('my');
    var input=$('ep-db-file-input');
    if(!input){ if(typeof oldTrigger==='function') return oldTrigger(type); return toast('Поле выбора файла не найдено'); }
    input.value='';
    input.onchange=function(e){
      window.EP_V9_IMPORT_TARGET=target;
      window.EP_V7_IMPORT_TARGET=target;
      if(typeof oldTrigger==='function'){
        // The old handler is not called here because it would reset onchange.
      }
      var file=e.target.files&&e.target.files[0];
      if(!file)return;
      // Use the existing reader if V7/V6 already installed it by calling original read through old public handler is impossible,
      // so reproduce the simple reliable path: delegate to oldTrigger only when no FileReader parser exists is not safe.
      // Instead call the latest visible V7 trigger parser by temporarily restoring target and using old input reader fallback if present.
      if(window.epReadDbFileV9){ return window.epReadDbFileV9(file,type,target); }
      toast('Ошибка: парсер импорта V9 не загрузился');
    };
    input.click();
  };

  function fileText(file){ return new Promise(function(res,rej){ var r=new FileReader(); r.onload=function(){res(String(r.result||''));}; r.onerror=rej; r.readAsText(file); }); }
  function fileBuffer(file){ return new Promise(function(res,rej){ var r=new FileReader(); r.onload=function(){res(r.result);}; r.onerror=rej; r.readAsArrayBuffer(file); }); }
  function csvRows(txt){ return String(txt||'').split(/\r?\n/).map(function(line){ return line.split(';').length>=line.split(',').length?line.split(';'):line.split(','); }); }
  function rowsToItems(rows,type){
    rows=rows||[]; var header=null,currentCat='',currentSub='',out=[];
    function cell(row,i){ return clean((row||[])[i]); }
    rows.forEach(function(row){
      row=(row||[]).map(clean); var non=row.filter(Boolean); if(!non.length)return;
      var joined=norm(non.join(' '));
      if(/наимен|назван|имя|позиция|товар|работ|цена|стоим|ед/.test(joined)&&!header){
        header={}; row.forEach(function(v,i){ var s=norm(v); if(/наимен|назван|имя|позиция|товар|материал|работ/.test(s))header.name=i; if(/категор/.test(s)&&header.cat==null)header.cat=i; if(/подкат|группа|раздел/.test(s))header.sub=i; if(/цена|стоим|прайс/.test(s))header.price=i; if(/ед|изм/.test(s))header.unit=i; }); return;
      }
      var priceIdx=-1,unitIdx=-1;
      row.forEach(function(v,i){ if(priceIdx<0&&money(v)>0&&/^[-\d\s.,]+/.test(v))priceIdx=i; if(unitIdx<0&&/^(шт|м|м\.п\.?|пог\.м|уп|упак|компл|кг|л|рул|бухта)$/i.test(v))unitIdx=i; });
      if(header){ var hn=cell(row,header.name); if(hn)out.push(normItem({n:hn,c:cell(row,header.cat),sc:cell(row,header.sub),p:cell(row,header.price),u:cell(row,header.unit)},type,out.length)); return; }
      if(priceIdx<0&&non.length<=2){ var title=non.join(' '); if(type==='work'||/работ|монтаж|штроб|резк|сверл|демонтаж/i.test(title)){currentCat=title;currentSub='';} else if(!currentCat)currentCat=title; else currentSub=title; return; }
      var candidates=row.map(function(v,i){return {v:v,i:i};}).filter(function(x){return x.v&&x.i!==priceIdx&&x.i!==unitIdx&&!/^[-\d\s.,]+$/.test(x.v);});
      if(!candidates.length)return; candidates.sort(function(a,b){return b.v.length-a.v.length;}); var name=candidates[0].v; if(name.length<3)return;
      out.push(normItem({n:name,c:currentCat||inferCat(name,type),sc:currentSub||inferSub(name,currentCat,type),p:priceIdx>=0?row[priceIdx]:0,u:unitIdx>=0?row[unitIdx]:'шт'},type,out.length));
    });
    return out.filter(Boolean);
  }
  function jsonToItems(raw,type){ if(raw&&raw.matDB&&type==='mat')raw=raw.matDB; else if(raw&&raw.workDB&&type==='work')raw=raw.workDB; else if(raw&&Array.isArray(raw.items))raw=raw.items; else if(raw&&Array.isArray(raw.data))raw=raw.data; else if(raw&&typeof raw==='object'&&!Array.isArray(raw))raw=Object.keys(raw).map(function(k){return raw[k];}); if(!Array.isArray(raw))raw=[]; return raw.map(function(x,i){return normItem(x,type,i);}).filter(Boolean); }
  function showReviewV9(items,type,source,target){
    items=unique((items||[]).filter(Boolean),type); var selected={}; items.forEach(function(_,i){selected[i]=true;});
    window.EP_DB_REVIEW_V6={type:type,items:items,source:source||'',page:0,selected:selected,editCache:{}};
    window.EP_DB_REVIEW={type:type,items:items,source:source||''}; window.EP_V9_IMPORT_TARGET=target; window.EP_V7_IMPORT_TARGET=target;
    var title=$('ep-db-ai-review-title'); if(title) title.innerText='Импорт '+(type==='work'?'работ':'материалов')+': '+(source||'файл')+' → '+(target==='global'?'База сервера':target==='server_proposal'?'Заявка админу':'Моя база');
    if(typeof window.epReviewPageV6==='function') window.epReviewPageV6(0); else {
      var list=$('ep-db-ai-review-list'); if(list) list.innerHTML=items.map(function(it,i){ return '<div class="ep-db-review-row"><input type="checkbox" id="ep-db-check-'+i+'" checked><div class="ep-db-review-fields"><div><label>Имя</label><input id="ep-db-name-'+i+'" value="'+esc(it.n)+'"></div><div class="ep-db-review-2col"><div><label>Категория</label><input id="ep-db-cat-'+i+'" value="'+esc(it.c)+'"></div><div><label>Подкатегория</label><input id="ep-db-subcat-'+i+'" value="'+esc(it.sc||it.g||'Разное')+'"></div></div><div class="ep-db-review-2col"><div><label>Цена</label><input id="ep-db-price-'+i+'" type="number" value="'+(Number(it.p)||0)+'"></div><div><label>Единица</label><input id="ep-db-unit-'+i+'" value="'+esc(it.u||'шт')+'"></div></div></div></div>'; }).join('');
    }
    try{ if(typeof openModal==='function') openModal('ep-db-ai-review-modal'); }catch(e){ var m=$('ep-db-ai-review-modal'); if(m)m.style.display='flex'; }
    setTimeout(hideProgress,200);
  }
  window.epReadDbFileV9=async function(file,type,target){
    progress('Импорт базы',5,'Читаю файл');
    try{
      var name=file.name||'', lower=name.toLowerCase(), items=[];
      if(/\.json$/i.test(lower)){ var txt=await fileText(file); progress('Импорт базы',45,'Разбор JSON'); items=jsonToItems(JSON.parse(txt),type); }
      else if(/\.(xlsx|xls)$/i.test(lower)){ if(!window.XLSX) throw new Error('Библиотека XLSX не загрузилась. Сохраните файл как CSV или JSON.'); var ab=await fileBuffer(file); progress('Импорт базы',45,'Разбор Excel'); var wb=XLSX.read(ab,{type:'array'}), rows=[]; wb.SheetNames.forEach(function(sh){ rows=rows.concat(XLSX.utils.sheet_to_json(wb.Sheets[sh],{header:1,defval:''})); }); progress('Импорт базы',75,'Подготовка строк'); items=rowsToItems(rows,type); }
      else if(/\.csv$/i.test(lower)){ items=rowsToItems(csvRows(await fileText(file)),type); }
      else if(file.type&&file.type.indexOf('image/')===0){ hideProgress(); if(typeof oldTrigger==='function') return oldTrigger(type); throw new Error('Для фото нужен старый ИИ-импорт.'); }
      else { items=rowsToItems(csvRows(await fileText(file)),type); }
      progress('Импорт базы',100,'Открываю проверку'); showReviewV9(items,type,name,target);
    }catch(e){ hideProgress(); toast('❌ '+explain(e)); console.error('EP V9 read import failed',e); }
  };

  window.epOpenTextImport=function(type){
    type=type==='work'?'work':'mat'; var target=scope()==='global'?(isAdmin()?'global':'server_proposal'):'my'; window.EP_V9_IMPORT_TARGET=target; window.EP_V7_IMPORT_TARGET=target;
    if(typeof oldOpenText==='function') return oldOpenText(type);
    var t=$('ep-text-import-title'); if(t)t.innerText='Импорт '+(type==='work'?'работ':'материалов')+' из текста'; var v=$('ep-text-import-value'); if(v)v.value=''; try{openModal('ep-text-import-modal');}catch(e){}
  };

  window.epApplyReviewedDbItems=async function(mode){
    var data=collectReviewed(), type=data.type, items=data.items; if(!items.length) return toast('Нет выбранных позиций');
    var target=window.EP_V9_IMPORT_TARGET || window.EP_V7_IMPORT_TARGET || (scope()==='global'?(isAdmin()?'global':'server_proposal'):'my');
    progress(target==='global'?'Запись в базу сервера':target==='server_proposal'?'Отправка заявки':'Запись в мою базу',10,'Подготовка');
    try{
      var total=0;
      if(target==='global'){
        total=await saveGlobalImport(type,items,mode==='replace');
        setScope('global'); syncMain('global'); rerender();
        try{ if(typeof closeModal==='function') closeModal('ep-db-ai-review-modal'); }catch(e){}
        progress('Запись в базу сервера',100,'Готово'); setTimeout(hideProgress,500);
        toast('✅ Импорт улетел в базу сервера и сохранён: '+items.length+' поз. Сейчас на сервере: '+total+'.');
      } else if(target==='server_proposal'){
        await sendServerProposal(type,items); try{ if(typeof closeModal==='function') closeModal('ep-db-ai-review-modal'); }catch(e){}
        progress('Отправка заявки',100,'Готово'); setTimeout(hideProgress,500); toast('✅ Импорт отправлен админу заявкой: '+items.length+' поз.');
      } else {
        setScope('my'); total=await saveMyImport(type,items,mode==='replace'); syncMain('my'); rerender(); try{ if(typeof closeModal==='function') closeModal('ep-db-ai-review-modal'); }catch(e){}
        progress('Запись в мою базу',100,'Готово'); setTimeout(hideProgress,500); toast('✅ Импорт сохранён в моей базе: '+items.length+' поз. Сейчас в моей базе: '+total+'.');
      }
    }catch(e){ hideProgress(); toast('❌ '+explain(e)); console.error('EP V9 apply import failed',e); }
    finally{ window.EP_V9_IMPORT_TARGET=null; window.EP_V7_IMPORT_TARGET=null; }
  };

  window.epFirebaseDbDebug=function(){
    var info={scope:scope(),target:window.EP_V9_IMPORT_TARGET||window.EP_V7_IMPORT_TARGET||'',isAdmin:isAdmin(),uid:uid(),user:currentUserLabel(),serverMat:getServer('mat').length,serverWork:getServer('work').length,myMat:getMy('mat').length,myWork:getMy('work').length};
    console.log('EP V9 Firebase DB debug',info);
    alert('Проверка базы V9\n\nАктивно: '+(scope()==='global'?'База сервера':'Моя база')+'\nЦель импорта: '+(info.target||'не выбрана')+'\nАдмин: '+(info.isAdmin?'да':'нет')+'\nПользователь: '+(info.user||'нет')+'\nUID: '+(info.uid||'нет')+'\nСервер: '+info.serverMat+' мат / '+info.serverWork+' раб\nМоя база: '+info.myMat+' мат / '+info.myWork+' раб');
    return info;
  };

  try{ syncMain(scope()); }catch(e){}
})();
