/*
 * Extracted from public/index.html
 * Original script block: 22
 * Original HTML lines: 9416-9505
 */

/* EP V15 verification and compatibility patch: direct shield details + DB bulk move */
(function(){
  function $(id){ return document.getElementById(id); }
  function norm(s){ return String(s||'').toLowerCase().replace(/ё/g,'е').replace(/×/g,'x').replace(/х/g,'x').trim(); }
  function clean(s){ return String(s||'').replace(/\s+/g,' ').trim(); }
  window.epV15IsShieldDevice = function(it){
    var n=String((it&&it.n)||''); var k=String((it&&it.dbMeta&&it.dbMeta.kind)||'');
    return it && it.type==='mat' && (/\b[ABCDАВСД]\s*\d{1,3}\b|автомат|узо|диф|реле|контактор|вводной/i.test(n) || /automatic|breaker|uzo|dif|relay|contactor/i.test(k));
  };
  window.epV15Purpose = function(it){
    var n=String((it&&it.n)||''); var a=window.epV15GetAssignments?window.epV15GetAssignments(it):[];
    if(/вводн/i.test(n)) return 'вводной аппарат щита';
    if(/10\s*мА/i.test(n)) return 'защита влажных зон 10 мА';
    if(/УЗО|ДИФ/i.test(n)) return 'групповая защита линий';
    if(/Контактор/i.test(n)) return 'мастер-кнопка только на свет';
    if(/Реле напряж|УЗМ/i.test(n)) return 'защита от перенапряжения';
    if(/Автомат|\b[ABCDАВСД]\d/i.test(n)) return 'отдельный автомат линии';
    return a.length ? 'позиция щита' : 'назначение не указано';
  };
  window.epV15GetAssignments = function(it){
    var out=[];
    function add(v){ v=clean(v); if(v && !/^(позиция щита|общая|общая \/ вводная|назначение не указано)$/i.test(v) && out.indexOf(v)<0) out.push(v); }
    if(it){
      if(Array.isArray(it.epAssignments)) it.epAssignments.forEach(add);
      if(Array.isArray(it.epMergedDetails)) it.epMergedDetails.forEach(add);
      add(it.epAssignment);
      if(it.dbMeta) add(it.dbMeta.assignment);
    }
    if(!out.length && window.epV15InferAssignments) out = window.epV15InferAssignments(it);
    return out;
  };
  window.epV15BuildLinesFromConfig = function(){
    var lines=[]; function val(id){ var e=$(id); return e?e.value:''; } function chk(id){ var e=$(id); return !!(e&&e.checked); }
    function add(name,nom,group){ lines.push({name:name,nominal:nom,group:group}); }
    function room(label,count,wet){ count=Number(count)||0; for(var i=1;i<=count;i++){ var n=count>1?label+' '+i:label; add(n+' розетки','C16',wet?'wet':'power'); add(n+' свет','C10','light'); } }
    try{ room('Кухня',window.cfg&&cfg.kits,false); room('Ванная',window.cfg&&cfg.baths,true); room('Туалет',window.cfg&&cfg.toilets,true); room('Комната',window.cfg&&cfg.rms,false); room('Балкон',window.cfg&&cfg.bals,false); }catch(e){}
    if(chk('c-apron')) add('Фартук кухни','C16','power'); if(chk('c-dish')) add('Посудомойка','C10','power'); if(chk('c-washer')) add('Стиралка/сушилка','C10','wet'); if(chk('c-towel')) add('Полотенцесушитель','C10','wet');
    var acs=(window.cfg&&Number(cfg.acs))||0, fls=(window.cfg&&Number(cfg.fls))||0; for(var a=1;a<=acs;a++) add('Кондиционер '+a,'C10','climate'); for(var f=1;f<=fls;f++) add('Тёплый пол '+f,'C10','climate');
    if(chk('c-fridge')) add('Холодильник, неотключаемая группа','C10','alwaysOn'); if(chk('c-neptun')) add('Нептун, неотключаемая группа','C10','alwaysOn'); if(chk('c-router')) add('Роутер, неотключаемая группа','C6','alwaysOn');
    if(val('c-hob-power')==='6') add('Плита до 6 кВт','C25','heavy'); if(val('c-hob-power')==='10') add('Плита до 10 кВт','C32','heavy'); if(val('c-boiler-power')==='6') add('Бойлер до 6 кВт','C25','wet'); if(val('c-boiler-power')==='10') add('Бойлер до 10 кВт','C32','wet');
    return lines;
  };
  window.epV15InferAssignments=function(it){
    var n=String((it&&it.n)||''); var q=Number((it&&it.q)||1)||1; var lines=window.epV15BuildLinesFromConfig?window.epV15BuildLinesFromConfig():[];
    if(/вводн/i.test(n)) return ['Вводной аппарат щита'];
    if(/10\s*мА/i.test(n) && /УЗО|ДИФ/i.test(n)) return ['Влажные зоны / защита 10 мА: '+lines.filter(function(x){return x.group==='wet';}).map(function(x){return x.name;}).join(', ')].filter(function(x){return !/:\s*$/.test(x);});
    if(/30\s*мА/i.test(n) && /УЗО|ДИФ/i.test(n)) return ['Группа защиты: силовые/световые/климатические линии'];
    var m=n.match(/\b([ABCDАВСД])\s*(\d{1,3})\b/i); if(m){ var nom=String(m[1]).toUpperCase().replace('А','A').replace('В','B').replace('С','C').replace('Д','D')+m[2]; return lines.filter(function(x){return x.nominal===nom;}).slice(0,Math.max(q,1)).map(function(x){return x.name;}); }
    return [];
  };
  window.epV15NormalizeCurrentEstimate=function(){
    if(!Array.isArray(window.currentEstimate)) return;
    try{
      var map={}, out=[];
      window.currentEstimate.forEach(function(src){
        if(!src) return; var it=Object.assign({},src); var n=String(it.n||'');
        if(/Автомат\s+A\s*472|Автомат\s+A472/i.test(n)) it.n='C40 1P ИЭК ВА47-29';
        else if(/^Автомат\s+IEK$/i.test(n) || /^Автомат\s+ИЭК$/i.test(n)) it.n='Вводной автомат 2P ИЭК ВА47-29';
        else if(/^Автомат\s+C\s*16\s+IEK/i.test(n) || /^Автомат\s+C16\s+IEK/i.test(n)) it.n='C16 1P ИЭК ВА47-29';
        else if(/^Автомат\s+C\s*10\s+IEK/i.test(n) || /^Автомат\s+C10\s+IEK/i.test(n)) it.n='C10 1P ИЭК ВА47-29';
        else if(/^Автомат\s+C\s*6\s+IEK/i.test(n) || /^Автомат\s+C6\s+IEK/i.test(n)) it.n='C6 1P ИЭК ВА47-29';
        else if(/^УЗО\s+30\s*мА\s+IEK/i.test(n)) it.n='УЗО 2P 40A 30мА тип A ИЭК ВД1-63';
        else if(/^УЗО\s+10\s*мА\s+IEK/i.test(n) || /^УЗО\s+10\s*мА/i.test(n)) it.n='УЗО 2P 40A 10мА тип A ИЭК ВД1-63';
        var key=[it.tag||'',it.type||'',it.n||'',Number(it.p)||0,it.u||'шт'].join('|'); var rec=map[key];
        if(!rec){ rec=Object.assign({},it,{q:0,epAssignments:[],epMergedDetails:[]}); map[key]=rec; out.push(rec); }
        rec.q += Number(it.q)||0;
        if(typeof epV15MergeAssignments==='function') epV15MergeAssignments(rec,it);
      });
      window.currentEstimate=out; try{ currentEstimate=out; }catch(e){}
    }catch(e){ console.warn('V15 normalize failed',e); }
  };
  window.epV15SelectVisible=function(type,on){ var box=type==='work'?$('editor-work-list'):$('editor-mat-list'); if(!box) return; Array.prototype.forEach.call(box.querySelectorAll('.ep-v7-select'),function(ch){ ch.checked=!!on; }); };
  window.epV15MoveSelectedActive=async function(type){
    var cat=$('ep-v15-move-cat-'+type), sub=$('ep-v15-move-sub-'+type); var c=cat?cat.value.trim():'', g=sub?sub.value.trim():''; if(!c&&!g) return showToast('Укажи категорию или подкатегорию');
    var checks=Array.from(document.querySelectorAll('#settModal .ep-v7-select:checked')).filter(function(ch){return ch.dataset.type===type;}); if(!checks.length) return showToast('Выбери позиции галочками');
    var ids=new Set(checks.map(function(ch){return String(ch.dataset.id||'');})); var arr=(typeof active==='function'?active(type):[]).map(function(it){ if(ids.has(String(it.id||''))){ var x=Object.assign({},it); if(c) x.c=c; if(g){ x.g=g; x.sc=g; x.subcategory=g; } return x; } return it; });
    if(typeof scope==='function' && scope()==='global' && typeof setServer==='function') setServer(type,arr); else if(typeof setMy==='function') setMy(type,arr);
    showToast('📦 Перенесено: '+ids.size); if(typeof epSaveActiveDbV7==='function') await epSaveActiveDbV7(); else if(typeof renderDbEditors==='function') renderDbEditors();
  };
  var oldRender=window.renderMainTable;
  window.renderMainTable=function(){ try{ window.epV15NormalizeCurrentEstimate(); }catch(e){} return oldRender ? oldRender.apply(this,arguments) : undefined; };
  try{ renderMainTable=window.renderMainTable; }catch(e){}
  var oldGen=window.generateCascadePanel;
  // generateCascadePanel is already directly replaced in V15; keep a badge so user can verify version.
  function boot(){ try{ window.epV15NormalizeCurrentEstimate(); if(typeof oldRender==='function') oldRender(); }catch(e){} }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',function(){setTimeout(boot,100);}); else setTimeout(boot,100);
  setTimeout(function(){ try{ showToast('V15 загружена'); }catch(e){} },600);
})();
