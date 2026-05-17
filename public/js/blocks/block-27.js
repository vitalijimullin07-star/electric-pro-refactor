/*
 * Extracted from public/index.html
 * Original script block: 27
 * Original HTML lines: 10237-10395
 */

/* EP V20: restore Vitaliy shield logic. Reads counters from DOM, not window.cfg. */
(function(){
  'use strict';
  var BUILD='V20 SHIELD LOGIC REAL COUNTERS 2026-05-15';
  function $(id){ return document.getElementById(id); }
  function text(v){ return String(v==null?'':v); }
  function clean(v){ return text(v).replace(/\s+/g,' ').trim(); }
  function esc(v){ return text(v).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];}); }
  function toast(msg){ try{ if(typeof showToast==='function') showToast(msg); else console.log(msg); }catch(e){ console.log(msg); } }
  function money(v){ var n=Number(text(v).replace(',','.').replace(/[^0-9.\-]/g,'')); return isFinite(n)?n:0; }
  function val(id,def){ var e=$(id); return e ? (e.value || def || '') : (def || ''); }
  function chk(id){ var e=$(id); return !!(e && e.checked); }
  function count(k,def){
    var e=$('v-'+k); var n=NaN;
    if(e) n=Number(clean(e.textContent));
    if(!isFinite(n)) { try{ n=Number(cfg && cfg[k]); }catch(_e){} }
    if(!isFinite(n)) n=Number(def)||0;
    return Math.max(0,n||0);
  }
  function appPrice(k,def){ try{ var n=Number(window.appLogic && appLogic[k]); return n||def; }catch(e){ return def; } }
  function brandRu(b){ var s=text(b||'IEK').toUpperCase(); if(s.indexOf('IEK')>=0||s.indexOf('ИЭК')>=0) return 'ИЭК'; if(s.indexOf('ABB')>=0) return 'ABB'; if(s.indexOf('SCHNEIDER')>=0) return 'Schneider'; if(s.indexOf('LEGRAND')>=0) return 'Legrand'; if(s.indexOf('EKF')>=0) return 'EKF'; return clean(b)||'ИЭК'; }
  function norm(v){ return clean(v).toLowerCase().replace(/ё/g,'е').replace(/×/g,'x').replace(/х/g,'x'); }
  function activeMatDb(){
    var out=[];
    try{ if(Array.isArray(window.matDB)) out=out.concat(window.matDB); }catch(e){}
    try{ if(Array.isArray(window.EP_MY_MAT)) out=out.concat(window.EP_MY_MAT); }catch(e){}
    try{ if(Array.isArray(window.EP_GLOBAL_MAT)) out=out.concat(window.EP_GLOBAL_MAT); }catch(e){}
    try{ var c=JSON.parse(localStorage.getItem('ep_global_cache_force_v1')||'{}'); if(Array.isArray(c.matDB)) out=out.concat(c.matDB); }catch(e){}
    return out;
  }
  function curveNom(nom,curve){ var amp=text(nom).replace(/[^0-9]/g,'') || '16'; var c=text(curve || text(nom).charAt(0) || 'C').toUpperCase().charAt(0); if(!/[ABCDАВСД]/.test(c)) c='C'; return c+amp; }
  function dbFindAuto(nom,brand){
    var amp=text(nom).replace(/[^0-9]/g,''); var br=norm(brand||''); var cn=norm(curveNom(nom));
    return activeMatDb().find(function(it){ var n=norm(it && it.n); if(!n) return false; var isAuto=/автомат|выключатель автоматический|ва47|sh201|a9f|a472|а472/.test(n); var hasAmp=n.indexOf(amp)>=0 || n.indexOf(amp+'a')>=0 || n.indexOf(amp+' a')>=0; var hasCurve=n.indexOf(cn)>=0 || new RegExp('\\b'+amp+'\\s*a?\\b').test(n); var hasBrand=!br || n.indexOf(br)>=0 || (br==='iek' && n.indexOf('иэк')>=0) || (br==='иэк' && n.indexOf('iek')>=0); return isAuto && hasAmp && hasCurve && hasBrand; }) || null;
  }
  function dbFindRcd(kind,leak,brand){
    var k=norm(kind==='ДИФ'||kind==='Главный ДИФ'?'диф':'узо'), br=norm(brand||''), l=text(leak);
    return activeMatDb().find(function(it){ var n=norm(it && it.n); if(!n) return false; var okKind=n.indexOf(k)>=0; var okLeak=n.indexOf(l)>=0; var okBrand=!br || n.indexOf(br)>=0 || (br==='iek'&&n.indexOf('иэк')>=0) || (br==='иэк'&&n.indexOf('iek')>=0); return okKind && okLeak && okBrand; }) || null;
  }
  function modelFromDbName(n){ var m=text(n).match(/\(([^)]+)\)/); return m ? clean(m[1]).replace(/^IEK\s*/i,'ИЭК ') : ''; }
  function autoName(nom,brand,curve){ var cn=curveNom(nom,curve), br=brandRu(brand); var hit=dbFindAuto(cn,brand); var model=hit?modelFromDbName(hit.n):''; if(model) return cn+' 1P '+model; if(br==='ABB') return cn+' 1P ABB SH201'; if(br==='Schneider') return cn+' 1P Schneider'; if(br==='Legrand') return cn+' 1P Legrand'; if(br==='EKF') return cn+' 1P EKF'; return cn+' 1P ИЭК ВА47-29'; }
  function autoPrice(nom,brand){ var hit=dbFindAuto(nom,brand); if(hit && Number(hit.p)>0) return Number(hit.p); var amp=Number(text(nom).replace(/[^0-9]/g,''))||16; if(text(brand).toUpperCase().indexOf('ABB')>=0) return amp>=25?600:265; return amp>=40?380:(amp<=10?172:150); }
  function rcdName(kind,leak,brand,rcdType){ var k=(kind==='ДИФ'||kind==='Главный ДИФ')?kind:'УЗО'; var hit=dbFindRcd(k,leak,brand); var br=brandRu(brand); var model=hit?modelFromDbName(hit.n):''; if(model) return k+' 2P 40A '+leak+'мА тип '+(rcdType||'A')+' '+model; if(br==='ABB') return k+' 2P 40A '+leak+'мА тип '+(rcdType||'A')+' ABB'; return k+' 2P 40A '+leak+'мА тип '+(rcdType||'A')+' '+br+(br==='ИЭК'?' ВД1-63':''); }
  function rcdPrice(kind,leak,brand){ var hit=dbFindRcd(kind,leak,brand); if(hit && Number(hit.p)>0) return Number(hit.p); return (kind==='ДИФ'||kind==='Главный ДИФ') ? 3600 : (Number(leak)===10?3600:1195); }
  function item(n,q,p,type,meta,assigns){
    var a=[]; if(Array.isArray(assigns)) a=assigns.map(clean).filter(Boolean); else if(assigns) a=[clean(assigns)].filter(Boolean);
    var it=Object.assign({n:n,q:Number(q)||1,p:money(p),u:(meta&&meta.unit)||'шт',type:type||'mat',tag:'shield'},meta||{});
    if(a.length){ it.epAssignment=a[0]; it.epAssignments=a.slice(); it.epMergedDetails=a.slice(); it.assignment=a[0]; it.dbMeta=Object.assign({},it.dbMeta||{}, {assignment:a[0]}); }
    return it;
  }
  function addUniqueAssign(rec,arr){
    rec.epAssignments=rec.epAssignments||[]; rec.epMergedDetails=rec.epMergedDetails||[];
    (arr||[]).forEach(function(v){ v=clean(v); if(v && !/позиция щита|назначение не указано/i.test(v) && rec.epAssignments.indexOf(v)<0){ rec.epAssignments.push(v); rec.epMergedDetails.push(v); } });
    rec.epAssignment=rec.epAssignments[0]||rec.epAssignment||''; rec.dbMeta=Object.assign({},rec.dbMeta||{}, {assignment:rec.epAssignment});
  }
  function directAdd(items){
    var map={}, out=[];
    (items||[]).forEach(function(src){ if(!src||!src.n) return; var it=Object.assign({},src,{tag:src.tag||'shield'}); var k=[it.tag,it.type,it.n,it.p,it.u].join('|'); var rec=map[k]; if(!rec){ rec=Object.assign({},it,{q:0,epAssignments:[],epMergedDetails:[]}); map[k]=rec; out.push(rec); } rec.q += Number(it.q)||1; addUniqueAssign(rec,[].concat(it.epAssignments||[],it.epMergedDetails||[],it.epAssignment||[])); });
    try{ currentEstimate=(Array.isArray(currentEstimate)?currentEstimate:[]).filter(function(x){ return x && x.tag!=='shield' && x.tag!=='shield_info'; }).concat(out); window.currentEstimate=currentEstimate; }catch(e){ window.currentEstimate=(window.currentEstimate||[]).filter(function(x){ return x && x.tag!=='shield' && x.tag!=='shield_info'; }).concat(out); }
    try{ if(typeof renderMainTable==='function') renderMainTable(); else if(typeof renderMainDirect==='function') renderMainDirect(); }catch(e){}
    try{ if(typeof syncDraft==='function') syncDraft(); }catch(e){}
  }
  function buildLines(curve){
    var lines=[];
    function add(name,nom,group,opts){ opts=opts||{}; lines.push({name:name,nominal:curveNom(nom,curve),curve:curve,group:group,wet:group==='wet'||!!opts.wet,nonSwitchable:!!opts.nonSwitchable}); }
    function room(label,c,wet){ c=Number(c)||0; for(var i=1;i<=c;i++){ var n=c>1?label+' '+i:label; add(n+' розетки','C16',wet?'wet':'power',{wet:wet}); add(n+' свет','C10','light'); } }
    room('Кухня',count('kits',1),false);
    room('Ванная',count('baths',1),true);
    room('Туалет',count('toilets',1),true);
    room('Комната',count('rms',1),false);
    room('Балкон',count('bals',0),false);
    if(chk('c-apron')) add('Фартук кухни','C16','power');
    if(chk('c-dish')) add('Посудомойка','C10','power');
    if(chk('c-washer')) add('Стиралка/сушилка','C10','wet',{wet:true});
    if(chk('c-towel')) add('Полотенцесушитель','C10','wet',{wet:true});
    for(var a=1;a<=count('acs',0);a++) add('Кондиционер '+a,'C10','climate');
    for(var f=1;f<=count('fls',0);f++) add('Тёплый пол '+f,'C10','climate');
    if(chk('c-fridge')) add('Холодильник, неотключаемая группа','C10','alwaysOn',{nonSwitchable:true});
    if(chk('c-neptun')) add('Нептун, неотключаемая группа','C10','alwaysOn',{nonSwitchable:true});
    if(chk('c-router')) add('Роутер, неотключаемая группа','C6','alwaysOn',{nonSwitchable:true});
    var hob=val('c-hob-power','none'); if(hob==='6') add('Плита до 6 кВт','C25',chk('cfg-heavy-separate')?'heavy':'power'); if(hob==='10') add('Плита до 10 кВт','C32',chk('cfg-heavy-separate')?'heavy':'power');
    var boil=val('c-boiler-power','none'); if(boil==='6') add('Бойлер до 6 кВт','C25','wet',{wet:true}); if(boil==='10') add('Бойлер до 10 кВт','C32','wet',{wet:true});
    return lines;
  }
  function groupNominals(lines){ var m={}; lines.forEach(function(l){ var k=l.nominal; if(!m[k]) m[k]={nominal:k,assign:[]}; m[k].assign.push(l.name); }); return Object.keys(m).sort(function(a,b){ var na=Number(a.replace(/\D/g,'')), nb=Number(b.replace(/\D/g,'')); return nb-na; }).map(function(k){return m[k];}); }
  function presentGroups(lines){ var seen={},out=[]; lines.forEach(function(l){ if(!seen[l.group]){ seen[l.group]=1; out.push(l.group); } }); return out; }
  window.epV20GenerateShield=function(){
    var bBox=val('cfg-brand-box','Tekfor'), bAuto=val('cfg-brand-auto','IEK'), sWall=val('cfg-shield-wall','Бетон'), ph=Number(val('cfg-phase','1'))||1, curve=val('cfg-auto-curve','C'), rcdType=val('cfg-rcd-type','A'), protectionType=val('cfg-protection-type','uzo_auto'), isMaster=chk('cfg-master');
    var lines=buildLines(curve);
    if(!lines.length){ toast('Добавь хотя бы одно помещение или линию'); return; }
    var groupNames={power:'Силовые линии',climate:'Климат',wet:'Влажные зоны',light:'Освещение',heavy:'Большая техника',alwaysOn:'Неотключаемые'};
    function groupAssign(g){ var arr=lines.filter(function(l){return l.group===g;}).map(function(l){return l.name;}); return (g==='wet'?'Влажные зоны / защита 10 мА':(groupNames[g]||g))+(arr.length?': '+arr.join(', '):''); }
    var prot=[];
    if(protectionType==='main_dif_auto') prot.push({group:'main',kind:'Главный ДИФ',leak:30,assign:['Вводная групповая защита всего щита']});
    else presentGroups(lines).forEach(function(g){ prot.push({group:g,kind:(protectionType==='dif_auto'||(protectionType==='mixed'&&g==='wet'))?'ДИФ':'УЗО',leak:g==='wet'?10:30,assign:[groupAssign(g)]}); });
    var items=[];
    var onePole=lines.length+(isMaster?1:0), twoPole=prot.length, relayMods=chk('cfg-uzm')?(ph===3?6:2):0, masterMods=isMaster?3:0;
    var extraMods=0; try{ (window.currentShieldExtras||[]).forEach(function(ex){ extraMods += (Number(ex.modules||1)*Number(ex.q||1)); }); }catch(e){}
    var totalModules=Math.ceil(onePole+twoPole*2+relayMods+masterMods+extraMods+(ph===3?4:2));
    var boxSize=[6,12,24,36,48,60,72].find(function(s){return s>=totalModules;})||72;
    items.push(item('Щит '+(sWall==='Накладной'?'накладной':'встраиваемый')+' '+bBox+' '+boxSize+'М',1,bBox==='ABB'?6510:2660,'mat',{c:'Щитовое',g:'Корпуса',sc:sWall==='Накладной'?'Накладной':'Встраиваемый',kind:'shield_box',modules:boxSize},'Корпус щита'));
    items.push(item('Вводной автомат '+(ph===3?'4P':'2P')+' '+brandRu(bAuto)+' ВА47-29',1,bAuto==='ABB'?3500:1800,'mat',{c:'Автоматика',g:'Автоматы',sc:'Автоматы',kind:'input_breaker'},'Вводной аппарат щита'));
    var pMap={}; prot.forEach(function(p){ var nm=rcdName(p.kind,p.leak,bAuto,rcdType); var price=rcdPrice(p.kind,p.leak,bAuto); var key=nm+'|'+price; if(!pMap[key]) pMap[key]={n:nm,q:0,p:price,kind:p.kind,leak:p.leak,assign:[]}; pMap[key].q++; pMap[key].assign=pMap[key].assign.concat(p.assign||[]); });
    Object.keys(pMap).forEach(function(k){ var p=pMap[k]; items.push(item(p.n,p.q,p.p,'mat',{c:'Автоматика',g:p.kind==='УЗО'?'УЗО':'ДИФы',sc:p.kind==='УЗО'?'УЗО':'ДИФы',kind:p.kind==='УЗО'?'uzo':'dif',leakage:p.leak},p.assign)); });
    groupNominals(lines).forEach(function(g){ items.push(item(autoName(g.nominal,bAuto,curve),g.assign.length,autoPrice(g.nominal,bAuto),'mat',{c:'Автоматика',g:'Автоматы',sc:'Автоматы',kind:'automatic',nominal:g.nominal,curve:curve},g.assign)); });
    if(chk('cfg-uzm')) items.push(item('Реле напряжения '+brandRu(bAuto),ph===3?3:1,4500,'mat',{c:'Автоматика',g:'УЗМ / реле напряжения',sc:'УЗМ / реле напряжения'},'Защита от перенапряжения'));
    if(isMaster){ var light=lines.filter(function(l){return l.group==='light';}).map(function(l){return l.name;}); items.push(item('Контактор C40 '+brandRu(bAuto)+' — мастер-кнопка света',1,2200,'mat',{c:'Автоматика',g:'Контакторы',sc:'Контакторы'},'Мастер-кнопка только на свет: '+(light.join(', ')||'световые группы'))); items.push(item(autoName('C40',bAuto,curve),1,autoPrice('C40',bAuto),'mat',{c:'Автоматика',g:'Автоматы',sc:'Автоматы',kind:'automatic',nominal:'C40',curve:curve},'Байпас мастер-кнопки света')); }
    try{ (window.currentShieldExtras||[]).forEach(function(ex){ items.push(item(ex.n,ex.q||1,ex.p||0,'mat',{c:'Автоматика',g:'Другие аппараты',sc:'Другие аппараты'},'Дополнительный аппарат защиты')); }); window.currentShieldExtras=[]; }catch(e){}
    var comb1P=Math.ceil(onePole/12), comb2P=Math.ceil(twoPole/6), rows=Math.ceil(boxSize/12), pugvSize=appPrice('shieldPugvSize',6), pugvMeters=Math.max(4,Math.ceil(totalModules*0.4)), nshviPacks=Math.max(1,Math.ceil(boxSize/48));
    if(comb1P>0) items.push(item('Гребёнка 1P 25см',comb1P,250,'mat',{c:'Щитовое',g:'Гребёнки',sc:'Гребёнки'},'Питание однополюсных автоматов: '+onePole+' шт.'));
    if(comb2P>0) items.push(item('Гребёнка 2P 25см',comb2P,450,'mat',{c:'Щитовое',g:'Гребёнки',sc:'Гребёнки'},'Питание УЗО/ДИФ: '+twoPole+' шт.'));
    if(twoPole>0) items.push(item('Шина N ноль на DIN-изол (ИЭК)',twoPole,285,'mat',{c:'Щитовое',g:'Шины N/PE',sc:'Шины N/PE'},'N-шинки по количеству УЗО/ДИФ'));
    items.push(item('PE-шина на '+appPrice('shieldPeBusContacts',26)+' контактов',1,770,'mat',{c:'Щитовое',g:'Шины N/PE',sc:'Шины N/PE'},'Защитное заземление PE'));
    items.push(item('DIN-рейка / комплект DIN для щита',rows,180,'mat',{c:'Щитовое',g:'DIN-рейки / ограничители',sc:'DIN-рейки / ограничители'},'Крепление аппаратов на DIN-рейке'));
    items.push(item('Ограничитель на DIN-рейку',rows*2,35,'mat',{c:'Щитовое',g:'DIN-рейки / ограничители',sc:'DIN-рейки / ограничители'},'Фиксация аппаратов на DIN-рейке'));
    items.push(item('Провод ПуГВ 1×'+pugvSize,pugvMeters,85,'mat',{c:'Щитовое',g:'Провода',sc:'Провода',unit:'м.п.'},'Внутренняя разводка щита'));
    items.push(item('НШВИ 1×'+pugvSize+', упак. 100 шт',nshviPacks,225,'mat',{c:'Щитовое',g:'Наконечники',sc:'Наконечники'},'Опрессовка проводов щита'));
    items.push(item('Маркировка линий / бирки',lines.length,15,'mat',{c:'Щитовое',g:'Маркировка',sc:'Маркировка'},'Маркировка линий: '+lines.map(function(l){return l.name;}).join(', ')));
    if(chk('cfg-cable-glands')) items.push(item('Кабельные вводы / сальники',1,250,'mat',{c:'Щитовое',g:'Кабельные вводы',sc:'Кабельные вводы'},'Ввод кабелей в щит'));
    if(sWall!=='Накладной'){ items.push(item('Ниша щита '+boxSize+'М ('+sWall+')',boxSize,appPrice('shieldNichePerModule',400),'work',{c:'Штробление и резка',g:'Ниши щита',sc:'Ниши щита',unit:'мод.'},'Ниша под корпус щита')); items.push(item('Штроба 100×50, под трассу кабелей ('+sWall+')',2,appPrice('shieldInputGroovePrice',1500),'work',{c:'Штробление и резка',g:'Штроба 100×50 под трассу кабелей',sc:'Штроба 100×50 под трассу кабелей',unit:'м.п.'},'Штроба под ввод/трассу кабелей')); }
    items.push(item('Сборка щита',totalModules,appPrice('priceShield',500),'work',{c:'Щитовое',g:'Сборка щита',sc:'Сборка щита',unit:'мод.'},'Сборка модульного щита'));
    items.push(item('Установка щита',1,appPrice('shieldInstallPrice',2500),'work',{c:'Щитовое',g:'Монтаж щита',sc:'Монтаж щита'},'Монтаж корпуса щита'));
    items.push(item('Подключение вводного кабеля',1,appPrice('shieldInputConnectPrice',1500),'work',{c:'Щитовое',g:'Монтаж щита',sc:'Монтаж щита'},'Подключение ввода'));
    items.push(item('Прозвонка / проверка линий',lines.length,appPrice('shieldTestLinePrice',150),'work',{c:'Щитовое',g:'Проверка линий',sc:'Проверка линий',unit:'линия'},'Проверка каждой линии'));
    items.push(item('Маркировка линий',lines.length,appPrice('shieldMarkLinePrice',100),'work',{c:'Щитовое',g:'Маркировка линий',sc:'Маркировка линий',unit:'линия'},'Маркировка каждой линии'));
    if(chk('cfg-scheme')) items.push(item('Составление однолинейной схемы щита',1,appPrice('shieldSchemePrice',4000),'work',{c:'Щитовое',g:'Документация',sc:'Документация'},'Однолинейная схема'));
    items.push(item('ℹ️ Щит: линий '+lines.length+'; занято '+totalModules+' мод.; корпус '+boxSize+'М; свободно '+Math.max(0,boxSize-totalModules)+' мод.',1,0,'work',{tag:'shield_info'},'Информация по щиту'));
    directAdd(items);
    try{ if(typeof closeModal==='function') closeModal('configModal'); }catch(e){}
    try{ if(window.epV18SetStatus) window.epV18SetStatus('ok','V20 активна'); }catch(e){}
    toast('✅ Щит сгенерирован V20 по твоей логике: C16/C10 считаются от помещений и отдельных линий');
  };
  function getAssigns(it){ var out=[]; function add(v){ v=clean(v); if(v && !/позиция щита|назначение не указано/i.test(v) && out.indexOf(v)<0) out.push(v); } if(it){ (it.epAssignments||[]).forEach(add); (it.epMergedDetails||[]).forEach(add); add(it.epAssignment); if(it.dbMeta) add(it.dbMeta.assignment); } return out; }
  function isDevice(it){ var n=text(it&&it.n); return it && it.type==='mat' && /C\d{1,3}|[ABCDАВСД]\d{1,3}|автомат|узо|диф|реле|контактор|вводной/i.test(n); }
  window.epV20ShowDetails=function(){
    var arr=[]; try{ arr=Array.isArray(currentEstimate)?currentEstimate:(window.currentEstimate||[]); }catch(e){ arr=window.currentEstimate||[]; }
    var rows=arr.filter(function(it){ return (it.tag==='shield'||it.tag==='shield_info') && isDevice(it); });
    var html='<div class="pdf-header"><h1>ДЕТАЛИЗАЦИЯ ЩИТА</h1><p>Заказчик: <b>'+esc((window.cust&&cust.name)||'')+'</b> | Объект: '+esc((window.cust&&cust.addr)||'')+'</p></div>'+
      '<div style="margin:8px 0 14px;padding:8px 10px;border-radius:12px;background:#ecfdf5;color:#047857;font-weight:900;font-size:12px;">Проверка: детализация сформирована V20. Помещения читаются с экрана, не из window.cfg.</div>'+
      '<table class="pdf-table"><thead><tr><th>Что отвечает / линия</th><th>Аппарат</th><th>Назначение</th></tr></thead><tbody>';
    if(!rows.length) html+='<tr><td colspan="3" style="text-align:center;color:#64748b;font-weight:900;">Щит ещё не сгенерирован</td></tr>';
    rows.forEach(function(it){ var as=getAssigns(it); var q=Number(it.q)||1; var purp='аппарат щита'; if(/узо|диф/i.test(it.n)) purp='групповая защита'+(q>1?' × '+q:''); else if(/контактор/i.test(it.n)) purp='мастер-кнопка света'; else if(/вводн/i.test(it.n)) purp='вводной аппарат'; else if(/автомат|C\d|[ABCDАВСД]\d/i.test(it.n)) purp=q>1?'отдельные автоматы линий: '+q+' шт.':'отдельный автомат линии'; html+='<tr><td style="font-weight:800;color:#5b54b7;">'+(as.length?as.map(esc).join('<br>'):'Позиция щита')+'</td><td>'+esc(it.n)+(q>1?' <b>× '+q+'</b>':'')+'</td><td>'+esc(purp)+'</td></tr>'; });
    html+='</tbody></table><button class="btn-vendor" style="margin-top:20px;" onclick="closeModal(\'previewModal\')">Закрыть</button>';
    var body=$('preview-body')||$('p-cont'); if(body) body.innerHTML=html; try{ openModal('previewModal'); }catch(e){}
  };
  function patchButtons(){ try{ Array.prototype.forEach.call(document.querySelectorAll('button'),function(b){ var t=b.textContent||''; if(t.indexOf('Сгенерировать щит')>=0){ b.onclick=window.epV20GenerateShield; } if(t.indexOf('Детализация')>=0){ b.onclick=window.epV20ShowDetails; } }); }catch(e){} }
  window.epV18GenerateShield=window.epV20GenerateShield;
  window.epV19GenerateShield=window.epV20GenerateShield;
  window.epV18ShowDetails=window.epV20ShowDetails;
  window.epV19ShowDetails=window.epV20ShowDetails;
  var oldShowPreview=window.showPreview;
  window.showPreview=function(mode){ if(mode==='details') return window.epV20ShowDetails(); return oldShowPreview?oldShowPreview.apply(this,arguments):undefined; };
  try{ showPreview=window.showPreview; generateCascadePanel=window.epV20GenerateShield; window.generateCascadePanel=window.epV20GenerateShield; }catch(e){}
  function boot(){ patchButtons(); try{ if(window.epV18SetStatus) window.epV18SetStatus('ok','V20 активна'); }catch(e){} toast(BUILD+' загружена'); }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',function(){ setTimeout(boot,120); }); else setTimeout(boot,120);
  setInterval(patchButtons,2500);
})();
