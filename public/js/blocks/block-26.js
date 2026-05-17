/*
 * Extracted from public/index.html
 * Original script block: 26
 * Original HTML lines: 10092-10234
 */

/* EP V19: restore fixed shield math. Keeps V18 DB/bulk/status. Aggregates automatics by nominal and keeps per-line assignments. */
(function(){
  var BUILD='V19 SHIELD MATH RESTORE 2026-05-15';
  function $(id){ return document.getElementById(id); }
  function toast(msg){ try{ if(typeof showToast==='function') showToast(msg); else console.log(msg); }catch(e){ console.log(msg); } }
  function esc(s){ return String(s==null?'':s).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];}); }
  function money(v){ v=Number(v); return isFinite(v)?v:0; }
  function val(id,def){ var e=$(id); return e ? (e.value || def || '') : (def || ''); }
  function chk(id){ var e=$(id); return !!(e && e.checked); }
  function cfgN(k){ try{ return Math.max(0, Number((window.cfg&&window.cfg[k])||0)); }catch(e){ return 0; } }
  function appPrice(k,def){ try{ return Number(window.appLogic && window.appLogic[k]) || def; }catch(e){ return def; } }
  function brandRu(v){ var s=String(v||'').toUpperCase(); if(s.indexOf('IEK')>=0||s.indexOf('ИЭК')>=0) return 'ИЭК'; if(s.indexOf('ABB')>=0) return 'ABB'; if(s.indexOf('SCHNEIDER')>=0) return 'Schneider'; if(s.indexOf('LEGRAND')>=0) return 'Legrand'; if(s.indexOf('EKF')>=0) return 'EKF'; return String(v||'ИЭК'); }
  function curveNom(nom, curve){ var amp=String(nom||'').replace(/[^0-9]/g,'')||'16'; var c=String(curve||String(nom||'C').charAt(0)||'C').toUpperCase(); if(!/[ABCDАВСД]/.test(c)) c='C'; return c+amp; }
  function autoName(nom,brand,curve){ var cn=curveNom(nom,curve), br=brandRu(brand); if(br==='ABB') return cn+' 1P ABB SH201'; if(br==='Schneider') return cn+' 1P Schneider'; if(br==='Legrand') return cn+' 1P Legrand'; if(br==='EKF') return cn+' 1P EKF'; return cn+' 1P ИЭК ВА47-29'; }
  function autoPrice(nom,brand){
    var amp=Number(String(nom||'').replace(/[^0-9]/g,''))||16;
    try{
      var db=(window.matDB||[]).concat(window.userMatDB||[]);
      var br=brandRu(brand).toLowerCase(); var cn=curveNom(nom).toLowerCase();
      var hit=db.find(function(x){ var n=String((x&&x.n)||'').toLowerCase().replace(/ё/g,'е'); return /автомат|выключатель автоматический|ва47|sh201/.test(n) && n.indexOf(String(amp))>=0 && (br==='иэк' ? /иэк|iek/.test(n) : n.indexOf(br)>=0); });
      if(hit && Number(hit.p)>0) return Number(hit.p);
    }catch(e){}
    if(String(brand||'').toUpperCase()==='ABB') return amp>=25?600:265;
    return amp>=40?380:(amp<=10?172:150);
  }
  function rcdName(kind, leak, brand, rcdType){ var br=brandRu(brand); var k=kind==='ДИФ'||kind==='Главный ДИФ'?'ДИФ':'УЗО'; if(br==='ABB') return k+' 2P 40A '+leak+'мА тип '+(rcdType||'A')+' ABB'; return k+' 2P 40A '+leak+'мА тип '+(rcdType||'A')+' '+br+(br==='ИЭК'?' ВД1-63':''); }
  function rcdPrice(kind, leak, brand){
    try{
      var db=(window.matDB||[]).concat(window.userMatDB||[]); var k=(kind==='ДИФ'||kind==='Главный ДИФ')?'диф':'узо'; var br=brandRu(brand).toLowerCase();
      var hit=db.find(function(x){ var n=String((x&&x.n)||'').toLowerCase().replace(/ё/g,'е'); return n.indexOf(k)>=0 && n.indexOf(String(leak))>=0 && (br==='иэк' ? /иэк|iek/.test(n) : n.indexOf(br)>=0); });
      if(hit && Number(hit.p)>0) return Number(hit.p);
    }catch(e){}
    if(kind==='ДИФ'||kind==='Главный ДИФ') return leak===10?3600:3600;
    return leak===10?3600:1195;
  }
  function makeItem(n,q,p,type,meta,assignments){
    var arr=[]; if(Array.isArray(assignments)) arr=assignments.filter(Boolean); else if(assignments) arr=[assignments];
    var it=Object.assign({n:n,q:Number(q)||1,p:money(p),u:(meta&&meta.unit)||'шт',type:type||'mat',tag:'shield'},meta||{});
    if(arr.length){ it.epAssignment=arr[0]; it.epAssignments=arr.slice(); it.epMergedDetails=arr.slice(); it.assignment=arr[0]; if(!it.dbMeta) it.dbMeta={}; it.dbMeta.assignment=arr[0]; }
    return it;
  }
  function groupLines(lines){
    var m={};
    lines.forEach(function(l){ var key=curveNom(l.nominal,l.curve); if(!m[key]) m[key]={nominal:key, lines:[], groups:{}}; m[key].lines.push(l.name); m[key].groups[l.group]=true; });
    return Object.keys(m).map(function(k){ return m[k]; });
  }
  function buildLines(curve){
    var lines=[];
    function add(name,nom,group,opts){ opts=opts||{}; lines.push({name:name,nominal:nom,curve:curve,group:group,wet:group==='wet'||!!opts.wet,nonSwitchable:!!opts.nonSwitchable}); }
    function room(label,count,wet){ count=Number(count)||0; for(var i=1;i<=count;i++){ var n=count>1?label+' '+i:label; add(n+' розетки','C16',wet?'wet':'power',{wet:wet}); add(n+' свет','C10','light'); } }
    room('Кухня',cfgN('kits'),false); room('Ванная',cfgN('baths'),true); room('Туалет',cfgN('toilets'),true); room('Комната',cfgN('rms'),false); room('Балкон',cfgN('bals'),false);
    if(chk('c-apron')) add('Фартук кухни','C16','power');
    if(chk('c-dish')) add('Посудомойка','C10','power');
    if(chk('c-washer')) add('Стиралка/сушилка','C10','wet',{wet:true});
    if(chk('c-towel')) add('Полотенцесушитель','C10','wet',{wet:true});
    for(var a=1;a<=cfgN('acs');a++) add('Кондиционер '+a,'C10','climate');
    for(var f=1;f<=cfgN('fls');f++) add('Тёплый пол '+f,'C10','climate');
    if(chk('c-fridge')) add('Холодильник, неотключаемая группа','C10','alwaysOn',{nonSwitchable:true});
    if(chk('c-neptun')) add('Нептун, неотключаемая группа','C10','alwaysOn',{nonSwitchable:true});
    if(chk('c-router')) add('Роутер, неотключаемая группа','C6','alwaysOn',{nonSwitchable:true});
    var hp=val('c-hob-power','none'); if(hp==='6') add('Плита до 6 кВт','C25',chk('cfg-heavy-separate')?'heavy':'power'); if(hp==='10') add('Плита до 10 кВт','C32',chk('cfg-heavy-separate')?'heavy':'power');
    var bp=val('c-boiler-power','none'); if(bp==='6') add('Бойлер до 6 кВт','C25','wet',{wet:true}); if(bp==='10') add('Бойлер до 10 кВт','C32','wet',{wet:true});
    return lines;
  }
  function addShieldToEstimate(items){
    // Use original addAuto if possible, because it also syncs totals and storage. Items are already aggregated by V19.
    try{ if(typeof addAuto==='function'){ addAuto(items,'shield'); return; } }catch(e){}
    try{ window.currentEstimate=(Array.isArray(window.currentEstimate)?window.currentEstimate:[]).filter(function(it){return it.tag!=='shield'&&it.tag!=='shield_info';}).concat(items); currentEstimate=window.currentEstimate; if(typeof renderMainTable==='function') renderMainTable(); }catch(e){}
  }
  window.epV19GenerateShield=function(){
    var bBox=val('cfg-brand-box','Tekfor'), bAuto=val('cfg-brand-auto','IEK'), sWall=val('cfg-shield-wall','Бетон'), ph=Number(val('cfg-phase','1'))||1, curve=val('cfg-auto-curve','C'), rcdType=val('cfg-rcd-type','A'), protectionType=val('cfg-protection-type','uzo_auto'), isMaster=chk('cfg-master');
    var lines=buildLines(curve);
    if(!lines.length){ toast('Добавь хотя бы одно помещение или линию'); return; }
    var groupNames={power:'Силовые линии',climate:'Климат',wet:'Влажные зоны',light:'Освещение',heavy:'Большая техника',alwaysOn:'Неотключаемые'};
    var groups=Array.from(new Set(lines.map(function(l){return l.group;}))).filter(Boolean);
    function groupAssign(g){ var a=lines.filter(function(l){return l.group===g;}).map(function(l){return l.name;}); return (g==='wet'?'Влажные зоны / защита 10 мА':(groupNames[g]||g))+(a.length?': '+a.join(', '):''); }
    var protect=[];
    if(protectionType==='main_dif_auto') protect.push({group:'main',kind:'Главный ДИФ',leak:30,assign:['Вводная групповая защита всего щита']});
    else groups.forEach(function(g){ protect.push({group:g,kind:(protectionType==='dif_auto'||(protectionType==='mixed'&&g==='wet'))?'ДИФ':'УЗО',leak:g==='wet'?10:30,assign:[groupAssign(g)]}); });

    var onePole=lines.length+(isMaster?1:0), twoPole=protect.length, relayMods=chk('cfg-uzm')?(ph===3?6:2):0, masterMods=isMaster?3:0;
    var extraModules=0; try{ (window.currentShieldExtras||[]).forEach(function(ex){ extraModules += (Number(ex.modules||1)*Number(ex.q||1)); }); }catch(e){}
    var totalModules=Math.ceil(onePole+twoPole*2+relayMods+masterMods+extraModules+(ph===3?3:2));
    var boxSize=[6,12,24,36,48,60,72].find(function(s){return s>=totalModules;})||72;
    var items=[];
    items.push(makeItem('Щит '+(sWall==='Накладной'?'накладной':'встраиваемый')+' '+bBox+' '+boxSize+'М',1,bBox==='ABB'?6510:2660,'mat',{c:'Щитовое',g:'Корпуса',sc:sWall==='Накладной'?'Накладной':'Встраиваемый',kind:'shield_box',modules:boxSize},'Корпус щита'));
    items.push(makeItem('Вводной автомат '+(ph===3?'4P':'2P')+' '+brandRu(bAuto)+' ВА47-29',1,bAuto==='ABB'?3500:1800,'mat',{c:'Автоматика',g:'Автоматы',sc:'Автоматы',kind:'input_breaker'},'Вводной аппарат щита'));
    // Protection devices: aggregate equal UZO/DIF by name, but keep each group assignment.
    var pMap={};
    protect.forEach(function(pd){ var nm=rcdName(pd.kind,pd.leak,bAuto,rcdType); var key=nm+'|'+rcdPrice(pd.kind,pd.leak,bAuto); if(!pMap[key]) pMap[key]={n:nm,q:0,p:rcdPrice(pd.kind,pd.leak,bAuto),kind:pd.kind,leak:pd.leak,assign:[]}; pMap[key].q++; pMap[key].assign=pMap[key].assign.concat(pd.assign||[]); });
    Object.keys(pMap).forEach(function(k){ var p=pMap[k]; items.push(makeItem(p.n,p.q,p.p,'mat',{c:'Автоматика',g:(p.kind==='УЗО'?'УЗО':'ДИФы'),sc:(p.kind==='УЗО'?'УЗО':'ДИФы'),kind:(p.kind==='УЗО'?'uzo':'dif'),leakage:p.leak},p.assign)); });
    // Automatics: the important fixed logic. One row per nominal, quantity = number of real lines.
    groupLines(lines).forEach(function(g){ items.push(makeItem(autoName(g.nominal,bAuto,curve),g.lines.length,autoPrice(g.nominal,bAuto),'mat',{c:'Автоматика',g:'Автоматы',sc:'Автоматы',kind:'automatic',nominal:g.nominal,curve:curve},g.lines)); });
    if(chk('cfg-uzm')) items.push(makeItem('Реле напряжения '+brandRu(bAuto),ph===3?3:1,4500,'mat',{c:'Автоматика',g:'УЗМ / реле напряжения',sc:'УЗМ / реле напряжения'},'Защита от перенапряжения'));
    if(isMaster){ var light=lines.filter(function(l){return l.group==='light';}).map(function(l){return l.name;}); items.push(makeItem('Контактор C40 '+brandRu(bAuto)+' — мастер-кнопка света',1,2200,'mat',{c:'Автоматика',g:'Контакторы',sc:'Контакторы'},'Мастер-кнопка только на свет: '+(light.join(', ')||'световые группы'))); items.push(makeItem(autoName('C40',bAuto,curve),1,autoPrice('C40',bAuto),'mat',{c:'Автоматика',g:'Автоматы',sc:'Автоматы',kind:'automatic',nominal:'C40',curve:curve},'Байпас мастер-кнопки света')); }
    try{ (window.currentShieldExtras||[]).forEach(function(ex){ items.push(makeItem(ex.n,ex.q||1,ex.p||0,'mat',{c:'Автоматика',g:'Другие аппараты',sc:'Другие аппараты'},'Дополнительный аппарат защиты')); }); window.currentShieldExtras=[]; }catch(e){}
    var comb1P=Math.ceil(onePole/12), comb2P=Math.ceil(twoPole/6), rows=Math.ceil(boxSize/12), pugvSize=appPrice('shieldPugvSize',6), pugvMeters=Math.max(4,Math.ceil(totalModules*.4)), nshviPacks=Math.max(1,Math.ceil(boxSize/48));
    if(comb1P>0) items.push(makeItem('Гребёнка 1P 25см',comb1P,250,'mat',{c:'Щитовое',g:'Гребёнки',sc:'Гребёнки'},'Питание однополюсных автоматов: '+onePole+' шт.'));
    if(comb2P>0) items.push(makeItem('Гребёнка 2P 25см',comb2P,450,'mat',{c:'Щитовое',g:'Гребёнки',sc:'Гребёнки'},'Питание УЗО/ДИФ: '+twoPole+' шт.'));
    if(twoPole>0) items.push(makeItem('Шина N ноль на DIN-изол (ИЭК)',twoPole,285,'mat',{c:'Щитовое',g:'Шины N/PE',sc:'Шины N/PE'},'N-шинки по количеству УЗО/ДИФ'));
    items.push(makeItem('PE-шина на '+appPrice('shieldPeBusContacts',26)+' контактов',1,770,'mat',{c:'Щитовое',g:'Шины N/PE',sc:'Шины N/PE'},'Защитное заземление PE'));
    items.push(makeItem('DIN-рейка / комплект DIN для щита',rows,180,'mat',{c:'Щитовое',g:'DIN-рейки / ограничители',sc:'DIN-рейки / ограничители'},'Крепление аппаратов на DIN-рейке'));
    items.push(makeItem('Ограничитель на DIN-рейку',rows*2,35,'mat',{c:'Щитовое',g:'DIN-рейки / ограничители',sc:'DIN-рейки / ограничители'},'Фиксация аппаратов на DIN-рейке'));
    items.push(makeItem('Провод ПуГВ 1×'+pugvSize,pugvMeters,85,'mat',{c:'Щитовое',g:'Провода',sc:'Провода',unit:'м.п.'},'Внутренняя разводка щита'));
    items.push(makeItem('НШВИ 1×'+pugvSize+', упак. 100 шт',nshviPacks,225,'mat',{c:'Щитовое',g:'Наконечники',sc:'Наконечники'},'Опрессовка проводов щита'));
    items.push(makeItem('Маркировка линий / бирки',lines.length,15,'mat',{c:'Щитовое',g:'Маркировка',sc:'Маркировка'},'Маркировка линий: '+lines.map(function(l){return l.name;}).join(', ')));
    if(sWall!=='Накладной'){ items.push(makeItem('Ниша щита '+boxSize+'М ('+sWall+')',boxSize,appPrice('shieldNichePerModule',400),'work',{c:'Штробление и резка',g:'Ниши щита',sc:'Ниши щита',unit:'мод.'},'Ниша под корпус щита')); items.push(makeItem('Штроба 100×50, под трассу кабелей ('+sWall+')',2,appPrice('shieldInputGroovePrice',1500),'work',{c:'Штробление и резка',g:'Штроба 100×50 под трассу кабелей',sc:'Штроба 100×50 под трассу кабелей',unit:'м.п.'},'Штроба под ввод/трассу кабелей')); }
    items.push(makeItem('Сборка щита',totalModules,appPrice('priceShield',500),'work',{c:'Щитовое',g:'Сборка щита',sc:'Сборка щита',unit:'мод.'},'Сборка модульного щита'));
    items.push(makeItem('Установка щита',1,appPrice('shieldInstallPrice',2500),'work',{c:'Щитовое',g:'Монтаж щита',sc:'Монтаж щита'},'Монтаж корпуса щита'));
    items.push(makeItem('Подключение вводного кабеля',1,appPrice('shieldInputConnectPrice',1500),'work',{c:'Щитовое',g:'Монтаж щита',sc:'Монтаж щита'},'Подключение ввода'));
    items.push(makeItem('Прозвонка / проверка линий',lines.length,appPrice('shieldTestLinePrice',150),'work',{c:'Щитовое',g:'Проверка линий',sc:'Проверка линий',unit:'линия'},'Проверка каждой линии'));
    items.push(makeItem('Маркировка линий',lines.length,appPrice('shieldMarkLinePrice',100),'work',{c:'Щитовое',g:'Маркировка линий',sc:'Маркировка линий',unit:'линия'},'Маркировка каждой линии'));
    if(chk('cfg-scheme')) items.push(makeItem('Составление однолинейной схемы щита',1,appPrice('shieldSchemePrice',4000),'work',{c:'Щитовое',g:'Документация',sc:'Документация'},'Однолинейная схема'));
    items.push(makeItem('ℹ️ Щит: линий '+lines.length+'; занято '+totalModules+' мод.; корпус '+boxSize+'М; свободно '+Math.max(0,boxSize-totalModules)+' мод.',1,0,'work',{tag:'shield_info'},'Информация по щиту'));
    addShieldToEstimate(items);
    try{ if(typeof closeModal==='function') closeModal('configModal'); }catch(e){}
    try{ if(window.epV18SetStatus) window.epV18SetStatus('ok','V19 активна'); }catch(e){}
    toast('✅ Щит сгенерирован V19: автоматы сгруппированы по номиналу');
  };
  function getAssigns(it){ var out=[]; function add(v){ v=String(v||'').trim(); if(v && !/позиция щита|назначение не указано/i.test(v) && out.indexOf(v)<0) out.push(v); } if(!it) return out; if(Array.isArray(it.epAssignments)) it.epAssignments.forEach(add); if(Array.isArray(it.epMergedDetails)) it.epMergedDetails.forEach(add); add(it.epAssignment); if(it.dbMeta) add(it.dbMeta.assignment); return out; }
  function isDevice(it){ var n=String((it&&it.n)||''); return it && it.type==='mat' && /C\d{1,3}|[ABCDАВСД]\d{1,3}|автомат|узо|диф|реле|контактор|вводной/i.test(n); }
  window.epV19ShowDetails=function(){
    var arr=[]; try{ arr=Array.isArray(currentEstimate)?currentEstimate:(window.currentEstimate||[]); }catch(e){ arr=window.currentEstimate||[]; }
    var rows=arr.filter(function(it){ return (it.tag==='shield'||it.tag==='shield_info') && isDevice(it); });
    var html='<div class="pdf-header"><h1>ДЕТАЛИЗАЦИЯ ЩИТА</h1><p>Заказчик: <b>'+esc((window.cust&&cust.name)||'')+'</b> | Объект: '+esc((window.cust&&cust.addr)||'')+'</p></div>'+
      '<div style="margin:8px 0 14px;padding:8px 10px;border-radius:12px;background:#ecfdf5;color:#047857;font-weight:900;font-size:12px;">Проверка: детализация сформирована V19, автоматы сгруппированы по количеству линий</div>'+
      '<table class="pdf-table"><thead><tr><th>Что отвечает / линия</th><th>Аппарат</th><th>Назначение</th></tr></thead><tbody>';
    rows.forEach(function(it){ var as=getAssigns(it); var name=esc(it.n); var q=Number(it.q)||1; var left=as.length?as.map(esc).join('<br>'):'Позиция щита'; var purp=''; if(/узо|диф/i.test(it.n)) purp='групповая защита'+(q>1?' × '+q:''); else if(/контактор/i.test(it.n)) purp='мастер-кнопка света'; else if(/автомат|C\d|[ABCDАВСД]\d/i.test(it.n)) purp=(q>1?'отдельные автоматы линий: '+q+' шт.':'отдельный автомат линии'); else purp='аппарат щита'; html+='<tr><td style="font-weight:800;color:#5b54b7;">'+left+'</td><td>'+name+(q>1?' <b>× '+q+'</b>':'')+'</td><td>'+esc(purp)+'</td></tr>'; });
    html+='</tbody></table><button class="btn-vendor" style="margin-top:20px;" onclick="closeModal(\'previewModal\')">Закрыть</button>';
    var body=$('preview-body'); if(body) body.innerHTML=html; try{ openModal('previewModal'); }catch(e){}
  };
  // V18 click listener calls these names. Replace them in place so old capture listener starts using V19.
  window.epV18GenerateShield=window.epV19GenerateShield;
  window.epV18ShowDetails=window.epV19ShowDetails;
  var oldShowPreview=window.showPreview;
  window.showPreview=function(mode){ if(mode==='details') return window.epV19ShowDetails(); return oldShowPreview?oldShowPreview.apply(this,arguments):undefined; };
  try{ showPreview=window.showPreview; }catch(e){}
  function patchButtons(){ try{ Array.prototype.forEach.call(document.querySelectorAll('button'),function(b){ var t=b.textContent||''; if(t.indexOf('Сгенерировать щит')>=0) b.onclick=window.epV19GenerateShield; if(t.indexOf('Детализация')>=0) b.onclick=window.epV19ShowDetails; }); }catch(e){} }
  function boot(){ patchButtons(); try{ if(window.epV18SetStatus) window.epV18SetStatus('ok','V19 активна'); }catch(e){} toast(BUILD+' загружена'); }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',boot); else setTimeout(boot,80);
})();
