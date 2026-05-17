/*
 * Extracted from public/index.html
 * Original script block: 25
 * Original HTML lines: 9840-10088
 */

/* EP V18: visible checkbox bulk DB, safe active-source move/delete, direct shield generation to main table, colored status badge. */
(function(){
  'use strict';
  var BUILD='V18 BULK + SHIELD DIRECT 2026-05-15';
  var LS_SCOPE='ep_db_scope_v2';
  var LS_MY_MAT='user_db_mat_v31';
  var LS_MY_WORK='user_db_work_v31';
  var LS_SERVER_CACHE='ep_global_cache_force_v1';
  var lastOpenedType='mat';
  function $(id){ return document.getElementById(id); }
  function esc(v){ return String(v==null?'':v).replace(/[&<>"']/g,function(m){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m];}); }
  function clean(v){ return String(v==null?'':v).replace(/\s+/g,' ').trim(); }
  function norm(v){ return clean(v).toLowerCase().replace(/ё/g,'е').replace(/×/g,'x').replace(/х/g,'x'); }
  function toast(t){ try{ if(typeof showToast==='function') showToast(t); else console.log(t); }catch(e){ console.log(t); } }
  function arrLS(k){ try{ var a=JSON.parse(localStorage.getItem(k)||'[]'); return Array.isArray(a)?a:[]; }catch(e){ return []; } }
  function objLS(k){ try{ var o=JSON.parse(localStorage.getItem(k)||'{}'); return o&&typeof o==='object'?o:{}; }catch(e){ return {}; } }
  function setLS(k,v){ try{ if(typeof safeSet==='function') safeSet(k,JSON.stringify(v||[])); else localStorage.setItem(k,JSON.stringify(v||[])); }catch(e){ try{ localStorage.setItem(k,JSON.stringify(v||[])); }catch(_e){} } }
  function setObjLS(k,o){ try{ localStorage.setItem(k,JSON.stringify(o||{})); }catch(e){} }
  function scope(){ try{ return localStorage.getItem(LS_SCOPE)==='global'?'global':'my'; }catch(e){ return 'my'; } }
  function isAdmin(){ try{ return !!(window.appUser && appUser.role==='admin'); }catch(e){ return false; } }
  function uid(){ try{ return (window.appUser && appUser.uid) || ''; }catch(e){ return ''; } }
  function groupOf(it){ return clean((it&&(it.g||it.sc||it.subcategory||it.group))||''); }
  function clone(x){ return Object.assign({}, x||{}); }
  function getServerCache(){ var c=objLS(LS_SERVER_CACHE); return {matDB:Array.isArray(c.matDB)?c.matDB:[], workDB:Array.isArray(c.workDB)?c.workDB:[]}; }
  function getArr(type,src){
    src=src||scope(); type=type==='work'?'work':'mat';
    if(src==='global'){
      var w = type==='work' ? window.EP_GLOBAL_WORK : window.EP_GLOBAL_MAT;
      if(Array.isArray(w)) return w.slice();
      var c=getServerCache(); return (type==='work'?c.workDB:c.matDB).slice();
    }
    var mw = type==='work' ? window.EP_MY_WORK : window.EP_MY_MAT;
    if(Array.isArray(mw)) return mw.slice();
    return arrLS(type==='work'?LS_MY_WORK:LS_MY_MAT);
  }
  function unique(arr,type){
    var seen={},out=[]; (arr||[]).forEach(function(raw,i){ var it=clone(raw); if(!it.n) return; if(!it.id) it.id=(type==='work'?'w':'m')+'_v18_'+Date.now()+'_'+i+'_'+Math.random().toString(36).slice(2,6); if(it.sc&&!it.g) it.g=it.sc; if(it.g&&!it.sc) it.sc=it.g; var k=type+'|'+norm([it.c,groupOf(it),it.n,it.u].join('|')); if(seen[k]) return; seen[k]=1; out.push(it); }); return out;
  }
  function syncActiveToMain(src){
    src=src||scope();
    try{
      window.matDB = getArr('mat',src);
      window.workDB = getArr('work',src);
      try{ matDB = window.matDB; workDB = window.workDB; }catch(e){}
    }catch(e){}
  }
  async function saveArr(type,arr){
    var src=scope(); type=type==='work'?'work':'mat'; arr=unique(arr,type);
    if(src==='global'){
      if(!isAdmin()) { toast('Сервер редактирует только админ'); return false; }
      var c=getServerCache(); if(type==='mat') c.matDB=arr; else c.workDB=arr;
      window.EP_GLOBAL_MAT=c.matDB; window.EP_GLOBAL_WORK=c.workDB;
      window.EP_FORCE_GLOBAL={matDB:c.matDB,workDB:c.workDB};
      window.EP_ULTIMATE_DB_CACHE={matDB:c.matDB,workDB:c.workDB,ts:Date.now()};
      window.EP_GLOBAL_DB_VISIBLE_CACHE={matDB:c.matDB,workDB:c.workDB,ts:Date.now()};
      setObjLS(LS_SERVER_CACHE,{matDB:c.matDB,workDB:c.workDB,ts:Date.now()});
      syncActiveToMain('global');
      epV18SetStatus('upload','запись на сервер');
      try{ if(typeof db!=='undefined' && db){ await db.collection('settings').doc('global_db').set({matDB:c.matDB,workDB:c.workDB,updatedAt:new Date().toISOString()},{merge:true}); } }
      catch(e){ epV18SetStatus('error','ошибка сервера'); toast('Ошибка записи сервера: '+(e.message||e)); return false; }
      epV18SetStatus('ok','V18 активна'); return true;
    } else {
      if(type==='mat'){ window.EP_MY_MAT=arr; setLS(LS_MY_MAT,arr); }
      else { window.EP_MY_WORK=arr; setLS(LS_MY_WORK,arr); }
      try{ window.userMatDB=getArr('mat','my'); window.userWorkDB=getArr('work','my'); localStorage.setItem('ep_master_db_created_v1','1'); }catch(e){}
      syncActiveToMain('my');
      epV18SetStatus('upload','запись на сервер');
      try{ if(typeof db!=='undefined' && db && uid()){ await db.collection('user_db').doc(uid()).set({uid:uid(),masterName:(window.appUser&&(appUser.name||appUser.email))||'',matDB:getArr('mat','my'),workDB:getArr('work','my'),created:true,updatedAt:new Date().toISOString()},{merge:true}); } }
      catch(e){ toast('Локально сохранено, сервер личной базы отказал: '+(e.message||e)); }
      epV18SetStatus('ok','V18 активна'); return true;
    }
  }

  function ensureBadge(){
    var b=$('ep-v18-status-badge');
    if(!b){
      b=document.createElement('div'); b.id='ep-v18-status-badge';
      b.style.cssText='position:fixed;left:10px;bottom:12px;z-index:2147483647;border-radius:999px;padding:8px 13px;color:#fff;font-size:12px;font-weight:1000;box-shadow:0 10px 30px rgba(0,0,0,.25);border:2px solid rgba(255,255,255,.55);letter-spacing:.2px;';
      document.body.appendChild(b);
    }
    return b;
  }
  window.epV18SetStatus=function(state,msg){
    var b=ensureBadge();
    var colors={ok:'#16a34a', upload:'#dc2626', download:'#2563eb', error:'#991b1b'};
    b.style.background=colors[state]||colors.ok;
    b.textContent=(state==='upload'?'🔴 ':state==='download'?'🔵 ':state==='error'?'⚠️ ':'✅ ')+(msg||'V18 активна');
  };

  function money(v){ var n=Number(String(v==null?'':v).replace(',','.').replace(/[^\d.\-]/g,'')); return Number.isFinite(n)?n:0; }
  function dbFindAuto(nominal,brand){
    var amp=String(nominal||'').replace(/[^0-9]/g,''); var br=norm(brand||''); var arr=getArr('mat',scope()).concat(getArr('mat','global'),getArr('mat','my'));
    var hit=arr.find(function(it){ var nn=norm(it.n); return /автомат/.test(nn) && nn.indexOf(amp+'a')>=0 && (!br || nn.indexOf(br)>=0 || (br==='iek'&&nn.indexOf('иэк')>=0) || (br==='иэк'&&nn.indexOf('iek')>=0)); });
    return hit||null;
  }
  function dbFindRcd(leak,brand,kind){
    var br=norm(brand||''), k=kind||'УЗО'; var arr=getArr('mat',scope()).concat(getArr('mat','global'),getArr('mat','my'));
    return arr.find(function(it){ var nn=norm(it.n); return nn.indexOf(norm(k))>=0 && nn.indexOf(String(leak))>=0 && (!br || nn.indexOf(br)>=0 || (br==='iek'&&nn.indexOf('иэк')>=0) || (br==='иэк'&&nn.indexOf('iek')>=0)); })||null;
  }
  function brandRu(b){ b=String(b||'IEK').toUpperCase(); if(b==='IEK') return 'ИЭК'; return b.charAt(0)+b.slice(1).toLowerCase(); }
  function autoName(nominal,brand){
    var hit=dbFindAuto(nominal,brand), br=brandRu(brand); var amp=String(nominal||'C16').replace(/[^0-9]/g,''); var curve=String(nominal||'C16').replace(/[^A-Za-zА-Яа-я]/g,'').toUpperCase().charAt(0)||'C';
    if(hit && /\(([^)]+)\)/.test(hit.n||'')){ var model=(hit.n.match(/\(([^)]+)\)/)||[])[1]; return curve+amp+' 1P '+model.replace(/^IEK/i,'ИЭК'); }
    if(String(brand||'').toUpperCase()==='ABB') return curve+amp+' 1P ABB SH201';
    return curve+amp+' 1P '+br+' ВА47-29';
  }
  function autoPrice(nominal,brand){ var hit=dbFindAuto(nominal,brand); if(hit) return money(hit.p); var amp=Number(String(nominal).replace(/[^0-9]/g,'')); return amp>=40?380:amp<=10?172:150; }
  function rcdName(leak,brand,kind,rcdType){ var hit=dbFindRcd(leak,brand,kind); var br=brandRu(brand); if(hit && /\(([^)]+)\)/.test(hit.n||'')){ var model=(hit.n.match(/\(([^)]+)\)/)||[])[1].replace(/^IEK/i,'ИЭК'); return kind+' 2P 40A '+leak+'мА тип '+(rcdType||'A')+' '+model; } return kind+' 2P 40A '+leak+'мА тип '+(rcdType||'A')+' '+br+(br==='ИЭК'?' ВД1-63':''); }
  function rcdPrice(leak,brand,kind){ var hit=dbFindRcd(leak,brand,kind); if(hit) return money(hit.p); return leak===10?3600:1195; }
  function val(id,def){ var e=$(id); return e ? (e.value || def || '') : (def || ''); }
  function chk(id){ var e=$(id); return !!(e&&e.checked); }
  function cfgNum(k){ try{ return Number(window.cfg && cfg[k])||0; }catch(e){ return 0; } }
  function appPrice(k,def){ try{ return Number(window.appLogic && appLogic[k]) || def; }catch(e){ return def; } }
  function makeItem(n,q,p,type,meta,assign){ var it=Object.assign({n:n,q:Number(q)||1,p:money(p),u:(meta&&meta.unit)||'шт',type:type||'mat',tag:'shield'},meta||{}); if(assign){ it.epAssignment=assign; it.epAssignments=[assign]; it.epMergedDetails=[assign]; if(!it.dbMeta) it.dbMeta={}; it.dbMeta.assignment=assign; } return it; }
  function mergeAssignments(rec,it){ var arr=rec.epAssignments||[]; function add(v){ v=clean(v); if(v && arr.indexOf(v)<0) arr.push(v); } if(Array.isArray(it.epAssignments)) it.epAssignments.forEach(add); if(Array.isArray(it.epMergedDetails)) it.epMergedDetails.forEach(add); add(it.epAssignment); if(it.dbMeta) add(it.dbMeta.assignment); rec.epAssignments=arr; rec.epMergedDetails=arr.slice(); rec.epAssignment=arr[0]||rec.epAssignment||''; if(!rec.dbMeta) rec.dbMeta={}; rec.dbMeta.assignment=rec.epAssignment; }
  function directAddShield(items){
    var map={},out=[];
    (items||[]).forEach(function(src){ if(!src || !src.n) return; var it=clone(src); it.tag='shield'; var key=[it.tag,it.type||'',it.n||'',Number(it.p)||0,it.u||'шт'].join('|'); var rec=map[key]; if(!rec){ rec=Object.assign({},it,{q:0,epAssignments:[],epMergedDetails:[]}); map[key]=rec; out.push(rec); } rec.q += Number(it.q)||0; mergeAssignments(rec,it); });
    try{ currentEstimate=(Array.isArray(currentEstimate)?currentEstimate:[]).filter(function(it){ return it.tag!=='shield' && it.tag!=='shield_info'; }).concat(out); window.currentEstimate=currentEstimate; }catch(e){ window.currentEstimate=out; }
    try{ localStorage.setItem('est_v31',JSON.stringify(currentEstimate)); }catch(e){}
  }
  function renderMainDirect(){
    var tb=document.querySelector('#mainTable tbody'); if(!tb) return;
    var arr=[]; try{ arr=Array.isArray(currentEstimate)?currentEstimate:(Array.isArray(window.currentEstimate)?window.currentEstimate:[]); }catch(e){ arr=Array.isArray(window.currentEstimate)?window.currentEstimate:[]; }
    tb.innerHTML=''; var total=0;
    arr.forEach(function(it,idx){ var q=Number(it.q)||0, sum=(typeof fPrice==='function'?fPrice(it):(Number(it.p)||0))*q; total+=sum; tb.insertAdjacentHTML('beforeend','<tr><td class="col-name editable-name" onclick="openSwapModal('+idx+')" title="Нажмите для замены">'+esc(it.n)+'</td><td class="col-qty"><input type="number" value="'+esc(q)+'" onchange="currentEstimate['+idx+'].q=Number(this.value); window.currentEstimate=currentEstimate; renderMainTable();" style="width:50px;padding:6px;margin:0;text-align:center;"></td><td class="col-sum">'+Math.round(sum)+' P</td><td style="text-align:right;"><button onclick="currentEstimate.splice('+idx+',1); window.currentEstimate=currentEstimate; renderMainTable();" class="btn-danger" style="padding:6px;border-radius:8px;width:auto;margin:0;">✕</button></td></tr>'); });
    var tot=$('tot-all'); if(tot) tot.innerText=total.toLocaleString('ru-RU')+' P';
    try{ if(typeof syncDraft==='function') syncDraft(); }catch(e){}
  }
  window.renderMainTable=function(){ try{ window.currentEstimate=currentEstimate; }catch(e){} renderMainDirect(); };
  try{ renderMainTable=window.renderMainTable; }catch(e){}

  window.epV18GenerateShield=function(){
    var bBox=val('cfg-brand-box','Tekfor'), bAuto=val('cfg-brand-auto','IEK'), sWall=val('cfg-shield-wall','Бетон'), curve=val('cfg-auto-curve','C'), rcdType=val('cfg-rcd-type','A'), protectionType=val('cfg-protection-type','uzo_auto'), isMaster=chk('cfg-master'), heavySeparate=chk('cfg-heavy-separate');
    var lines=[]; function addLine(name,nom,group,opts){ opts=opts||{}; lines.push({name:name,nominal:nom,group:group,wet:group==='wet'||!!opts.wet,nonSwitchable:!!opts.nonSwitchable}); }
    function room(label,count,wet){ count=Number(count)||0; for(var i=1;i<=count;i++){ var n=count>1?label+' '+i:label; addLine(n+' розетки','C16',wet?'wet':'power',{wet:wet}); addLine(n+' свет','C10','light'); } }
    room('Кухня',cfgNum('kits'),false); room('Ванная',cfgNum('baths'),true); room('Туалет',cfgNum('toilets'),true); room('Комната',cfgNum('rms'),false); room('Балкон',cfgNum('bals'),false);
    if(chk('c-apron')) addLine('Фартук кухни','C16','power'); if(chk('c-dish')) addLine('Посудомойка','C10','power'); if(chk('c-washer')) addLine('Стиралка/сушилка','C10','wet',{wet:true}); if(chk('c-towel')) addLine('Полотенцесушитель','C10','wet',{wet:true});
    for(var a=1;a<=cfgNum('acs');a++) addLine('Кондиционер '+a,'C10','climate'); for(var f=1;f<=cfgNum('fls');f++) addLine('Тёплый пол '+f,'C10','climate');
    if(chk('c-fridge')) addLine('Холодильник, неотключаемая группа','C10','alwaysOn',{nonSwitchable:true}); if(chk('c-neptun')) addLine('Нептун, неотключаемая группа','C10','alwaysOn',{nonSwitchable:true}); if(chk('c-router')) addLine('Роутер, неотключаемая группа','C6','alwaysOn',{nonSwitchable:true});
    if(val('c-hob-power','none')==='6') addLine('Плита до 6 кВт','C25',heavySeparate?'heavy':'power'); if(val('c-hob-power','none')==='10') addLine('Плита до 10 кВт','C32',heavySeparate?'heavy':'power'); if(val('c-boiler-power','none')==='6') addLine('Бойлер до 6 кВт','C25','wet',{wet:true}); if(val('c-boiler-power','none')==='10') addLine('Бойлер до 10 кВт','C32','wet',{wet:true});
    if(!lines.length){ toast('Добавь хотя бы одно помещение или линию'); return; }
    var groupNames={power:'Силовые линии',climate:'Климат',wet:'Влажные зоны',light:'Освещение',heavy:'Большая техника',alwaysOn:'Неотключаемые'};
    var groups=Array.from(new Set(lines.map(function(l){return l.group;}))).filter(Boolean); var protect=[];
    function groupAssign(g){ var names=lines.filter(function(l){return l.group===g;}).map(function(l){return l.name;}); var head=g==='wet'?'Влажные зоны / защита 10 мА':(groupNames[g]||g); return head+(names.length?': '+names.join(', '):''); }
    if(protectionType==='main_dif_auto') protect.push({group:'main',kind:'ДИФ',leak:30,assign:'Вводная групповая защита всего щита'}); else groups.forEach(function(g){ protect.push({group:g,kind:(protectionType==='dif_auto'||(protectionType==='mixed'&&g==='wet'))?'ДИФ':'УЗО',leak:g==='wet'?10:30,assign:groupAssign(g)}); });
    var items=[]; var onePole=lines.length + (isMaster?1:0), twoPole=protect.length, ph=Number(val('cfg-phase','1'))||1, relayMods=chk('cfg-uzm')?(ph===3?6:2):0, masterMods=isMaster?3:0, totalModules=Math.ceil(onePole+twoPole*2+relayMods+masterMods+(ph===3?3:2)); var boxSize=[6,12,24,36,48,60,72].find(function(s){return s>=totalModules;})||72;
    items.push(makeItem('Щит '+(sWall==='Накладной'?'накладной':'встраиваемый')+' '+bBox+' '+boxSize+'М',1,bBox==='ABB'?6510:2660,'mat',{c:'Щитовое',g:'Корпуса',sc:sWall==='Накладной'?'Накладной':'Встраиваемый',kind:'shield_box'},'Корпус щита'));
    items.push(makeItem('Вводной автомат '+(ph===3?'4P':'2P')+' '+brandRu(bAuto)+' ВА47-29',1,bAuto==='ABB'?3500:1800,'mat',{c:'Автоматика',g:'Автоматы',sc:'Автоматы',kind:'input_breaker'},'Вводной аппарат щита'));
    protect.forEach(function(pd){ items.push(makeItem(rcdName(pd.leak,bAuto,pd.kind,rcdType),1,rcdPrice(pd.leak,bAuto,pd.kind),'mat',{c:'Автоматика',g:pd.kind==='ДИФ'?'ДИФы':'УЗО',sc:pd.kind==='ДИФ'?'ДИФы':'УЗО',kind:pd.kind==='ДИФ'?'dif':'uzo',leakage:pd.leak},pd.assign)); });
    lines.forEach(function(l){ items.push(makeItem(autoName(l.nominal,bAuto),1,autoPrice(l.nominal,bAuto),'mat',{c:'Автоматика',g:'Автоматы',sc:'Автоматы',kind:'automatic',nominal:l.nominal,curve:curve},l.name)); });
    if(chk('cfg-uzm')) items.push(makeItem('Реле напряжения '+brandRu(bAuto),ph===3?3:1,4500,'mat',{c:'Автоматика',g:'УЗМ / реле напряжения',sc:'УЗМ / реле напряжения'},'Защита от перенапряжения'));
    if(isMaster){ var light=lines.filter(function(l){return l.group==='light';}).map(function(l){return l.name;}).join(', ')||'световые группы'; items.push(makeItem('Контактор C40 '+brandRu(bAuto)+' — мастер-кнопка света',1,2200,'mat',{c:'Автоматика',g:'Контакторы',sc:'Контакторы'},'Мастер-кнопка только на свет: '+light)); items.push(makeItem(autoName('C40',bAuto),1,autoPrice('C40',bAuto),'mat',{c:'Автоматика',g:'Автоматы',sc:'Автоматы'},'Байпас мастер-кнопки света')); }
    try{ (window.currentShieldExtras||[]).forEach(function(ex){ items.push(makeItem(ex.n,ex.q,ex.p,'mat',{c:'Автоматика',g:'Другие аппараты',sc:'Другие аппараты'},'Дополнительный аппарат защиты')); }); window.currentShieldExtras=[]; }catch(e){}
    var comb1P=Math.ceil(onePole/12), comb2P=Math.ceil(twoPole/6), rows=Math.ceil(boxSize/12), pugvSize=appPrice('shieldPugvSize',6), pugvMeters=Math.max(4,Math.ceil(totalModules*.4)), nshviPacks=Math.max(1,Math.ceil(boxSize/48));
    if(comb1P>0) items.push(makeItem('Гребёнка 1P 25см',comb1P,250,'mat',{c:'Щитовое',g:'Гребёнки',sc:'Гребёнки'},'Питание однополюсных автоматов'));
    if(comb2P>0) items.push(makeItem('Гребёнка 2P 25см',comb2P,450,'mat',{c:'Щитовое',g:'Гребёнки',sc:'Гребёнки'},'Питание УЗО/ДИФ'));
    if(twoPole>0) items.push(makeItem('Шина N ноль на DIN-изол (ИЭК)',twoPole,285,'mat',{c:'Щитовое',g:'Шины N/PE',sc:'Шины N/PE'},'N-шинки по группам защиты'));
    items.push(makeItem('PE-шина на '+appPrice('shieldPeBusContacts',26)+' контактов',1,770,'mat',{c:'Щитовое',g:'Шины N/PE',sc:'Шины N/PE'},'Защитное заземление PE'));
    items.push(makeItem('DIN-рейка / комплект DIN для щита',rows,180,'mat',{c:'Щитовое',g:'DIN-рейки / ограничители',sc:'DIN-рейки / ограничители'},'Крепление аппаратов на DIN-рейке'));
    items.push(makeItem('Ограничитель на DIN-рейку',rows*2,35,'mat',{c:'Щитовое',g:'DIN-рейки / ограничители',sc:'DIN-рейки / ограничители'},'Фиксация аппаратов на DIN-рейке'));
    items.push(makeItem('Провод ПуГВ 1×'+pugvSize,pugvMeters,85,'mat',{c:'Щитовое',g:'Провода',sc:'Провода',unit:'м.п.'},'Внутренняя разводка щита'));
    items.push(makeItem('НШВИ 1×'+pugvSize+', упак. 100 шт',nshviPacks,225,'mat',{c:'Щитовое',g:'Наконечники',sc:'Наконечники'},'Опрессовка проводов щита'));
    items.push(makeItem('Маркировка линий / бирки',lines.length,15,'mat',{c:'Щитовое',g:'Маркировка',sc:'Маркировка'},'Маркировка линий'));
    if(sWall!=='Накладной'){ items.push(makeItem('Ниша щита '+boxSize+'М ('+sWall+')',boxSize,appPrice('shieldNichePerModule',400),'work',{c:'Штробление и резка',g:'Ниши щита',sc:'Ниши щита',unit:'мод.'},'Ниша под корпус щита')); items.push(makeItem('Штроба 100×50, под трассу кабелей ('+sWall+')',2,appPrice('shieldInputGroovePrice',1500),'work',{c:'Штробление и резка',g:'Штроба 100×50 под трассу кабелей',sc:'Штроба 100×50 под трассу кабелей',unit:'м.п.'},'Штроба под ввод/трассу кабелей')); }
    items.push(makeItem('Сборка щита',totalModules,appPrice('priceShield',500),'work',{c:'Щитовое',g:'Сборка щита',sc:'Сборка щита',unit:'мод.'},'Сборка модульного щита'));
    items.push(makeItem('Установка щита',1,appPrice('shieldInstallPrice',2500),'work',{c:'Щитовое',g:'Монтаж щита',sc:'Монтаж щита'},'Монтаж корпуса щита'));
    items.push(makeItem('Подключение вводного кабеля',1,appPrice('shieldInputConnectPrice',1500),'work',{c:'Щитовое',g:'Монтаж щита',sc:'Монтаж щита'},'Подключение ввода'));
    items.push(makeItem('Прозвонка / проверка линий',lines.length,appPrice('shieldTestLinePrice',150),'work',{c:'Щитовое',g:'Проверка линий',sc:'Проверка линий',unit:'линия'},'Проверка каждой линии'));
    items.push(makeItem('Маркировка линий',lines.length,appPrice('shieldMarkLinePrice',100),'work',{c:'Щитовое',g:'Маркировка линий',sc:'Маркировка линий',unit:'линия'},'Маркировка каждой линии'));
    if(chk('cfg-scheme')) items.push(makeItem('Составление однолинейной схемы щита',1,appPrice('shieldSchemePrice',4000),'work',{c:'Щитовое',g:'Документация',sc:'Документация'},'Однолинейная схема'));
    items.push(makeItem('ℹ️ Щит: занято '+totalModules+' мод.; корпус '+boxSize+'М; свободно '+Math.max(0,boxSize-totalModules)+' мод.',1,0,'work',{tag:'shield_info'},'Информация по щиту'));
    directAddShield(items); try{ closeModal('configModal'); }catch(e){} renderMainDirect(); epV18SetStatus('ok','V18 активна'); toast('✅ Щит перенесён на главный экран V18');
  };

  function isShieldDevice(it){ var n=String((it&&it.n)||''); return it && it.type==='mat' && (/\b[ABCDАВСД]\s*\d{1,3}\b|автомат|узо|диф|реле|контактор|вводной/i.test(n) || /automatic|breaker|uzo|dif|relay|contactor/.test(String(it.kind||it.dbMeta&&it.dbMeta.kind||''))); }
  function assigns(it){ var out=[]; function add(v){ v=clean(v); if(v && !/позиция щита|назначение не указано/i.test(v) && out.indexOf(v)<0) out.push(v); } if(it){ if(Array.isArray(it.epAssignments)) it.epAssignments.forEach(add); if(Array.isArray(it.epMergedDetails)) it.epMergedDetails.forEach(add); add(it.epAssignment); if(it.dbMeta) add(it.dbMeta.assignment); } return out; }
  window.epV18ShowDetails=function(){
    try{ window.currentEstimate=currentEstimate; }catch(e){}
    var arr=[]; try{ arr=(Array.isArray(currentEstimate)?currentEstimate:[]).filter(isShieldDevice); }catch(e){ arr=(window.currentEstimate||[]).filter(isShieldDevice); }
    var html=(typeof getPDFHeader==='function')?getPDFHeader('ДЕТАЛИЗАЦИЯ ЩИТА'):'<h2>ДЕТАЛИЗАЦИЯ ЩИТА</h2>';
    var f=$('pdf-filters'); if(f) f.style.display='none';
    html+='<div style="margin:8px 0 14px;padding:8px 10px;border-radius:12px;background:#ecfdf5;color:#047857;font-weight:900;font-size:12px;">Проверка: детализация сформирована V18</div>';
    html+='<table class="pdf-table"><tr><th>Что отвечает / линия</th><th>Аппарат</th><th>Назначение</th></tr>';
    if(!arr.length) html+='<tr><td colspan="3" style="text-align:center;color:var(--gray);font-weight:900;">Щит ещё не сгенерирован</td></tr>';
    arr.forEach(function(it){ var a=assigns(it); if(!a.length) a=['Назначение не указано']; var purpose=/узо|диф/i.test(it.n)?(/10мА|10\s*мА/i.test(it.n)?'защита влажных зон 10 мА':'групповая защита 30 мА'):/вводн/i.test(it.n)?'вводной аппарат':'отдельный автомат линии'; html+='<tr><td style="font-weight:bold;color:var(--primary);">'+a.map(esc).join('<br>')+'</td><td>'+esc(it.n)+(Number(it.q)>1?' × '+Number(it.q):'')+'</td><td>'+esc(purpose)+'</td></tr>'; });
    html+='</table>'; var p=$('p-cont'); if(p) p.innerHTML=html; try{ openModal('previewModal'); }catch(e){}
  };
  var prevPreview=window.showPreview; window.showPreview=function(mode){ if(mode==='details') return window.epV18ShowDetails(); return prevPreview?prevPreview.apply(this,arguments):undefined; }; try{ showPreview=window.showPreview; }catch(e){}

  function selectedChecks(type){ return Array.prototype.slice.call(document.querySelectorAll('#settModal .ep-v18-check:checked')).filter(function(ch){ return !type || ch.dataset.type===type; }); }
  function activeTypeFromUi(){ var m=$('editor-mat-list'), w=$('editor-work-list'); if(m && m.offsetParent!==null) return 'mat'; if(w && w.offsetParent!==null) return 'work'; return lastOpenedType||'mat'; }
  function optionsHtml(vals,placeholder){ vals=Array.from(new Set((vals||[]).map(clean).filter(Boolean))).sort(function(a,b){return a.localeCompare(b,'ru');}); return '<option value="">'+esc(placeholder||'Выбрать')+'</option>'+vals.map(function(v){return '<option value="'+esc(v)+'">'+esc(v)+'</option>';}).join(''); }
  function buildBulkPanel(){
    var arr=getArr('mat').concat(getArr('work'));
    var cats=arr.map(function(x){return x.c||'Разное';}); var subs=arr.map(function(x){return groupOf(x)||'Без группы';});
    return '<div id="ep-v18-bulk-box" style="margin:12px 0;padding:12px;border:2px dashed #16a34a;border-radius:16px;background:#f0fdf4;">'+
      '<b style="color:#166534;display:block;margin-bottom:7px;">Массовое управление V18</b>'+ 
      '<div style="font-size:12px;color:#64748b;font-weight:800;margin-bottom:8px;">Ставь галочки слева от позиций. Перемещение идёт в выбранную существующую категорию/подкатегорию активной базы.</div>'+ 
      '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:8px;"><select id="ep-v18-move-cat">'+optionsHtml(cats,'Категория')+'</select><select id="ep-v18-move-sub">'+optionsHtml(subs,'Подкатегория')+'</select></div>'+ 
      '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;"><button class="btn-info" style="margin:0;padding:10px;" onclick="epV18SelectVisible(true)">✅ Выделить видимые</button><button class="btn-vendor" style="margin:0;padding:10px;" onclick="epV18SelectVisible(false)">⬜ Снять галочки</button><button class="btn-success" style="margin:0;padding:10px;" onclick="epV18MoveSelected()">📦 Переместить выбранные</button><button class="btn-danger" style="margin:0;padding:10px;" onclick="epV18DeleteSelected()">🗑 Удалить выбранные</button></div>'+ 
    '</div>';
  }
  function injectBulkPanel(){
    var old=$('ep-v17-bulk-box'); if(old) old.style.display='none';
    var host=$('editor-mat-list') || $('editor-work-list'); if(!host) return;
    var existing=$('ep-v18-bulk-box'); if(existing){ existing.outerHTML=buildBulkPanel(); return; }
    host.insertAdjacentHTML('beforebegin',buildBulkPanel());
  }
  function injectChecks(){
    ['editor-mat-list','editor-work-list'].forEach(function(id){ var box=$(id); if(!box) return; var type=id.indexOf('work')>=0?'work':'mat'; Array.prototype.forEach.call(box.querySelectorAll('.emp-row,.mat-item'),function(row,idx){ if(row.querySelector('.ep-v18-check')) return; var price=row.querySelector('input[type="number"][data-id]'); var itemBtn=row.querySelector('[data-item]'); var did=price?price.getAttribute('data-id'):''; var dtype=price?price.getAttribute('data-type'):type; if(!did && itemBtn){ try{ var raw=decodeURIComponent(escape(atob(itemBtn.getAttribute('data-item')))); var obj=JSON.parse(raw); did=obj.id||''; dtype=itemBtn.getAttribute('data-type')||type; }catch(e){} } if(!did){ did='v18row_'+type+'_'+idx+'_'+clean(row.textContent).slice(0,40); }
      var ch=document.createElement('input'); ch.type='checkbox'; ch.className='ep-v18-check'; ch.dataset.type=dtype||type; ch.dataset.id=did; ch.style.cssText='width:22px;height:22px;min-width:22px;accent-color:#16a34a;margin:7px 10px 0 0;'; row.insertBefore(ch,row.firstChild); }); });
  }
  function refreshDbEnhancements(){ injectBulkPanel(); injectChecks(); }
  var oldDbRender=window.renderDbEditors; window.renderDbEditors=function(){ var r=oldDbRender?oldDbRender.apply(this,arguments):undefined; setTimeout(refreshDbEnhancements,80); setTimeout(refreshDbEnhancements,450); return r; }; try{ renderDbEditors=window.renderDbEditors; }catch(e){}
  window.epV18SelectVisible=function(on){ Array.prototype.forEach.call(document.querySelectorAll('#settModal .ep-v18-check'),function(ch){ var row=ch.closest('.emp-row,.mat-item'); if(!row || row.offsetParent!==null) ch.checked=!!on; }); };
  window.epV18MoveSelected=async function(){
    var checks=selectedChecks(); if(!checks.length) return toast('Выбери позиции галочками слева');
    var cat=clean($('ep-v18-move-cat')&&$('ep-v18-move-cat').value), sub=clean($('ep-v18-move-sub')&&$('ep-v18-move-sub').value); if(!cat&&!sub) return toast('Выбери категорию или подкатегорию');
    var byType={mat:{},work:{}}; checks.forEach(function(ch){ byType[ch.dataset.type==='work'?'work':'mat'][String(ch.dataset.id||'')]=1; }); var moved=0;
    for(var type in byType){ var ids=byType[type]; if(!Object.keys(ids).length) continue; var arr=getArr(type).map(function(it){ if(ids[String(it.id||'')]){ var x=clone(it); if(cat) x.c=cat; if(sub){ x.g=sub; x.sc=sub; x.subcategory=sub; } moved++; return x; } return it; }); await saveArr(type,arr); }
    refreshDbEnhancements(); try{ if(typeof renderDbEditors==='function') renderDbEditors(); }catch(e){} toast('📦 Перемещено: '+moved);
  };
  window.epV18DeleteSelected=async function(){
    var checks=selectedChecks(); if(!checks.length) return toast('Выбери позиции галочками слева');
    var ok=true; try{ if(typeof customConfirm==='function') ok=await customConfirm('Удаление','Удалить выбранные позиции: '+checks.length+'?'); else ok=confirm('Удалить выбранные позиции: '+checks.length+'?'); }catch(e){}
    if(!ok) return; var byType={mat:{},work:{}}; checks.forEach(function(ch){ byType[ch.dataset.type==='work'?'work':'mat'][String(ch.dataset.id||'')]=1; }); var removed=0;
    for(var type in byType){ var ids=byType[type]; if(!Object.keys(ids).length) continue; var arr=getArr(type).filter(function(it){ if(ids[String(it.id||'')]){ removed++; return false; } return true; }); await saveArr(type,arr); }
    refreshDbEnhancements(); try{ if(typeof renderDbEditors==='function') renderDbEditors(); }catch(e){} toast('🗑 Удалено: '+removed);
  };

  var oldOpenMat=window.openMatCatalog; window.openMatCatalog=function(){ lastOpenedType='mat'; var r=oldOpenMat?oldOpenMat.apply(this,arguments):undefined; setTimeout(refreshDbEnhancements,120); return r; };
  var oldOpenWork=window.openWorkCatalog; window.openWorkCatalog=function(){ lastOpenedType='work'; var r=oldOpenWork?oldOpenWork.apply(this,arguments):undefined; setTimeout(refreshDbEnhancements,120); return r; };
  var oldSetScope=window.epSetDbScope; window.epSetDbScope=function(s){ epV18SetStatus('download','загрузка с сервера'); var r=oldSetScope?oldSetScope.apply(this,arguments):undefined; Promise.resolve(r).finally(function(){ setTimeout(function(){ epV18SetStatus('ok','V18 активна'); refreshDbEnhancements(); },350); }); return r; };
  var oldReload=window.epReloadActiveDbV7; window.epReloadActiveDbV7=function(){ epV18SetStatus('download','загрузка с сервера'); var r=oldReload?oldReload.apply(this,arguments):undefined; Promise.resolve(r).finally(function(){ setTimeout(function(){ epV18SetStatus('ok','V18 активна'); refreshDbEnhancements(); },350); }); return r; };
  var oldSave=window.epSaveActiveDbV7; window.epSaveActiveDbV7=function(){ epV18SetStatus('upload','запись на сервер'); var r=oldSave?oldSave.apply(this,arguments):undefined; Promise.resolve(r).finally(function(){ setTimeout(function(){ epV18SetStatus('ok','V18 активна'); },350); }); return r; };

  window.addEventListener('click',function(ev){
    var b=ev.target&&ev.target.closest?ev.target.closest('button'):null; if(!b) return; var t=clean(b.textContent);
    if(t.indexOf('Сгенерировать щит')>=0){ ev.preventDefault(); ev.stopImmediatePropagation(); window.epV18GenerateShield(); return false; }
    if(t.indexOf('Детализация')>=0){ ev.preventDefault(); ev.stopImmediatePropagation(); window.epV18ShowDetails(); return false; }
  },true);

  function boot(){ ensureBadge(); epV18SetStatus('ok','V18 активна'); syncActiveToMain(scope()); refreshDbEnhancements(); try{ window.currentEstimate=currentEstimate; renderMainDirect(); }catch(e){} toast(BUILD+' загружена'); }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',function(){ setTimeout(boot,180); }); else setTimeout(boot,180);
  setInterval(function(){ ensureBadge(); refreshDbEnhancements(); },2500);
})();
