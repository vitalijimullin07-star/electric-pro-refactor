/*
 * Extracted from public/index.html
 * Original script block: 24
 * Original HTML lines: 9709-9836
 */

/* EP V17 visible force fix. Purpose: prove the new file is loaded and force shield details/names even if older handlers remain. */
(function(){
  var BUILD='V17 FORCE VISIBLE 2026-05-15';
  function $(id){ return document.getElementById(id); }
  function txt(v){ return String(v==null?'':v); }
  function clean(v){ return txt(v).replace(/\s+/g,' ').trim(); }
  function norm(v){ return clean(v).toLowerCase().replace(/ё/g,'е').replace(/[×х]/g,'x'); }
  function esc(s){ return txt(s).replace(/[&<>"']/g,function(m){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m];}); }
  function toast(s){ try{ if(typeof showToast==='function') showToast(s); else console.log(s); }catch(e){ console.log(s); } }
  function addBadge(){
    if($('ep-v17-badge')) return;
    var d=document.createElement('div'); d.id='ep-v17-badge';
    d.style.cssText='position:fixed;left:8px;bottom:8px;z-index:2147483647;background:#111827;color:#fff;border:2px solid #22c55e;border-radius:999px;padding:6px 10px;font:900 11px system-ui;box-shadow:0 8px 24px rgba(0,0,0,.35);opacity:.92;';
    d.textContent='✅ V17 активна';
    document.body.appendChild(d);
  }
  function brandRu(v){ v=txt(v||'IEK').trim(); if(/^iek$/i.test(v)) return 'ИЭК'; return v; }
  function lineConfig(){
    var out=[]; function e(id){ return $(id); } function ch(id){ var x=e(id); return !!(x&&x.checked); }
    function add(n,nom,g){ out.push({name:n,nominal:nom,group:g}); }
    function room(label,count,wet){ count=Number(count)||0; for(var i=1;i<=count;i++){ var p=count>1?label+' '+i:label; add(p+' розетки','C16',wet?'wet':'power'); add(p+' свет','C10','light'); } }
    try{ room('Кухня',window.cfg&&cfg.kits,false); room('Ванная',window.cfg&&cfg.baths,true); room('Туалет',window.cfg&&cfg.toilets,true); room('Комната',window.cfg&&cfg.rms,false); room('Балкон',window.cfg&&cfg.bals,false); }catch(e){}
    if(ch('c-apron')) add('Фартук кухни','C16','power'); if(ch('c-dish')) add('Посудомойка','C10','power'); if(ch('c-washer')) add('Стиралка/сушилка','C10','wet'); if(ch('c-towel')) add('Полотенцесушитель','C10','wet');
    var acs=(window.cfg&&Number(cfg.acs))||0, fls=(window.cfg&&Number(cfg.fls))||0; for(var a=1;a<=acs;a++) add('Кондиционер '+a,'C10','climate'); for(var f=1;f<=fls;f++) add('Тёплый пол '+f,'C10','climate');
    if(ch('c-fridge')) add('Холодильник, неотключаемая группа','C10','alwaysOn'); if(ch('c-neptun')) add('Нептун, неотключаемая группа','C10','alwaysOn'); if(ch('c-router')) add('Роутер, неотключаемая группа','C6','alwaysOn');
    var hp=e('c-hob-power')?e('c-hob-power').value:'none'; if(hp==='6') add('Плита до 6 кВт','C25','heavy'); if(hp==='10') add('Плита до 10 кВт','C32','heavy');
    var bp=e('c-boiler-power')?e('c-boiler-power').value:'none'; if(bp==='6') add('Бойлер до 6 кВт','C25','wet'); if(bp==='10') add('Бойлер до 10 кВт','C32','wet');
    return out;
  }
  function nominalOf(it){
    var m=it&&it.dbMeta||{}; var raw=txt(m.nominal||m.rawLabel||it.epRawLabel||it.n);
    var x=raw.match(/\b([ABCDАВСД])\s*(\d{1,3})\b/i); if(!x) return '';
    var c=x[1].toUpperCase().replace('А','A').replace('В','B').replace('С','C').replace('Д','D'); return c+x[2];
  }
  function isDevice(it){
    var n=txt(it&&it.n), k=txt(it&&it.dbMeta&&it.dbMeta.kind), raw=txt(it&&it.epRawLabel);
    return !!(it&&it.type==='mat' && (/автомат|узо|диф|реле|контактор|вводной/i.test(n+' '+raw) || /automatic|breaker|uzo|dif|relay|contactor|input_breaker/i.test(k) || /\b[ABCDАВСД]\s*\d{1,3}\b/i.test(n+' '+raw)));
  }
  function assignmentsOf(it){
    var out=[]; function add(v){ v=clean(v); if(v && !/^(позиция щита|общая|общая \/ вводная|назначение не указано)/i.test(v) && out.indexOf(v)<0) out.push(v); }
    if(it){ if(Array.isArray(it.epAssignments)) it.epAssignments.forEach(add); if(Array.isArray(it.epMergedDetails)) it.epMergedDetails.forEach(add); add(it.epAssignment); if(it.dbMeta) add(it.dbMeta.assignment); }
    if(out.length) return out;
    var n=txt(it&&it.n), raw=txt(it&&it.epRawLabel), k=txt(it&&it.dbMeta&&it.dbMeta.kind), q=Math.max(1,Number(it&&it.q)||1), lines=lineConfig();
    if(/вводн|input_breaker/i.test(n+' '+raw+' '+k)) return ['Вводной аппарат щита'];
    if(/10\s*мА/i.test(n+' '+raw) && /узо|диф/i.test(n+' '+raw)) return ['Влажные зоны / защита 10 мА: '+lines.filter(function(x){return x.group==='wet';}).map(function(x){return x.name;}).join(', ')].filter(function(x){return !/:\s*$/.test(x);});
    if(/30\s*мА/i.test(n+' '+raw) && /узо|диф/i.test(n+' '+raw)) return ['Группа защиты 30 мА: силовые/освещение/климат/неотключаемые линии'];
    var nom=nominalOf(it); if(nom){ var list=lines.filter(function(x){return x.nominal===nom;}).slice(0,q).map(function(x){return x.name;}); if(list.length) return list; }
    return [];
  }
  function deviceName(it){
    var n=clean(it&&it.n), m=(it&&it.dbMeta)||{}, raw=clean(m.rawLabel||it.epRawLabel||n), b=brandRu(m.brand||(/IEK|ИЭК/i.test(n+' '+raw)?'IEK':''));
    var src=n+' '+raw+' '+txt(m.kind);
    if(/input_breaker|вводн/i.test(src)) return 'Вводной автомат '+(m.poles||'2P')+' '+(b||'ИЭК')+' ВА47-29';
    var nom=nominalOf(it); if(/automatic|автомат|\b[ABCDАВСД]\s*\d/i.test(src) && nom) return nom+' '+(m.poles||'1P')+' '+(b||'ИЭК')+' ВА47-29';
    if(/диф/i.test(src)) return 'ДИФ '+(m.poles||'1P+N')+' '+(m.amp||40)+'A '+(m.leakage||(/10\s*мА/i.test(src)?10:30))+'мА тип '+(m.rcdType||'A')+' '+(b||'ИЭК');
    if(/узо/i.test(src)) return 'УЗО '+(m.poles||'2P')+' '+(m.amp||40)+'A '+(m.leakage||(/10\s*мА/i.test(src)?10:30))+'мА тип '+(m.rcdType||'A')+' '+(b||'ИЭК')+' ВД1-63';
    return n;
  }
  function purposeOf(it){
    var s=txt(it&&it.n)+' '+txt(it&&it.epRawLabel)+' '+txt(it&&it.dbMeta&&it.dbMeta.kind);
    if(/вводн|input_breaker/i.test(s)) return 'вводной аппарат щита';
    if(/10\s*мА/i.test(s)) return 'защита влажных зон 10 мА';
    if(/узо|диф/i.test(s)) return 'групповая защита';
    if(/контактор/i.test(s)) return 'мастер-кнопка только на свет';
    if(/реле|узм/i.test(s)) return 'защитный аппарат';
    return 'отдельный автомат линии';
  }
  window.epV17Normalize=function(){
    try{
      var arr=Array.isArray(window.currentEstimate)?window.currentEstimate:[];
      arr.forEach(function(it){ if(isDevice(it)) it.n=deviceName(it); });
      try{ currentEstimate=arr; }catch(e){}
    }catch(e){ console.warn('V17 normalize error',e); }
  };
  window.epV17ShowDetails=function(){
    window.epV17Normalize();
    try{ currentPreviewMode='details'; }catch(e){}
    var html=(typeof getPDFHeader==='function')?getPDFHeader('ДЕТАЛИЗАЦИЯ ЩИТА'):'<div class="pdf-header"><h1>ДЕТАЛИЗАЦИЯ ЩИТА</h1></div>';
    var pf=$('pdf-filters'); if(pf) pf.style.display='none';
    html+='<div style="margin:8px 0 14px;padding:8px 10px;border-radius:12px;background:#ecfdf5;color:#047857;font-weight:900;font-size:12px;">Проверка: детализация сформирована блоком V17</div>';
    html+='<table class="pdf-table"><tr><th>Что отвечает / линия</th><th>Аппарат</th><th>Назначение</th></tr>';
    var items=(Array.isArray(window.currentEstimate)?window.currentEstimate:[]).filter(isDevice);
    if(!items.length) html+='<tr><td colspan="3" style="text-align:center;color:var(--gray);font-weight:900;">Щит ещё не сгенерирован</td></tr>';
    items.forEach(function(it){ var a=assignmentsOf(it); if(!a.length) a=['назначение не указано']; html+='<tr><td style="font-weight:900;color:var(--primary);">'+a.map(esc).join('<br>')+'</td><td>'+esc(deviceName(it))+(Number(it.q)>1?' × '+Number(it.q):'')+'</td><td>'+esc(purposeOf(it))+'</td></tr>'; });
    html+='</table>';
    var p=$('p-cont'); if(p) p.innerHTML=html;
    try{ if(typeof openModal==='function') openModal('previewModal'); }catch(e){ var m=$('previewModal'); if(m)m.style.display='flex'; }
  };
  var oldShow=window.showPreview;
  window.showPreview=function(mode){ if(mode==='details') return window.epV17ShowDetails(); return oldShow?oldShow.apply(this,arguments):undefined; };
  try{ showPreview=window.showPreview; }catch(e){}
  var oldRender=window.renderMainTable;
  window.renderMainTable=function(){ window.epV17Normalize(); return oldRender?oldRender.apply(this,arguments):undefined; };
  try{ renderMainTable=window.renderMainTable; }catch(e){}
  var oldGen=window.generateCascadePanel;
  window.generateCascadePanel=function(){ var r=oldGen?oldGen.apply(this,arguments):undefined; setTimeout(function(){ window.epV17Normalize(); try{ if(typeof renderMainTable==='function') renderMainTable(); }catch(e){} toast('✅ Щит сгенерирован V17'); },80); return r; };
  try{ generateCascadePanel=window.generateCascadePanel; }catch(e){}
  document.addEventListener('click',function(ev){
    var b=ev.target&&ev.target.closest?ev.target.closest('button'):null; if(!b) return; var t=clean(b.textContent);
    if(t.indexOf('Детализация')>=0){ ev.preventDefault(); ev.stopImmediatePropagation(); window.epV17ShowDetails(); }
  },true);
  function patchDbBulk(){
    var modal=$('settModal'); if(!modal || $('ep-v17-bulk-box')) return;
    var host=$('editor-mat-list') || $('editor-work-list'); if(!host) return;
    var box=document.createElement('div'); box.id='ep-v17-bulk-box'; box.style.cssText='margin:12px 0;padding:12px;border:2px dashed #8b5cf6;border-radius:16px;background:#faf5ff;';
    box.innerHTML='<b style="color:#5b21b6;display:block;margin-bottom:8px;">Массовое управление V17</b><div style="font-size:12px;color:#64748b;font-weight:800;margin-bottom:8px;">Выделение и перенос работают по галочкам в текущей открытой базе. Если галочек нет — значит открыт старый список, нажми Обновить / перезагрузить.</div><div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;"><input id="ep-v17-move-cat" placeholder="Категория"><input id="ep-v17-move-sub" placeholder="Подкатегория"></div><button onclick="epV17BulkMove()" style="margin-top:8px;background:#8b5cf6;color:white;">📦 Переместить выбранные</button><button onclick="epV17BulkDelete()" style="margin-top:8px;background:#ef4444;color:white;">🗑 Удалить выбранные</button>';
    host.parentNode.insertBefore(box,host);
  }
  window.epV17BulkMove=async function(){
    var checks=Array.prototype.slice.call(document.querySelectorAll('#settModal .ep-v7-select:checked')); if(!checks.length) return toast('Выбери позиции галочками');
    var c=clean($('ep-v17-move-cat')&&$('ep-v17-move-cat').value), g=clean($('ep-v17-move-sub')&&$('ep-v17-move-sub').value); if(!c&&!g) return toast('Укажи категорию или подкатегорию');
    var ids={}; checks.forEach(function(ch){ ids[String(ch.dataset.id||'')]=true; });
    function move(arr){ return (arr||[]).map(function(it){ if(ids[String(it.id||'')]){ var x=Object.assign({},it); if(c)x.c=c; if(g){x.g=g;x.sc=g;x.subcategory=g;} return x;} return it;}); }
    try{ if(typeof active==='function' && typeof scope==='function'){ var type=checks[0].dataset.type||'mat'; var arr=move(active(type)); if(scope()==='global' && typeof setServer==='function') setServer(type,arr); else if(typeof setMy==='function') setMy(type,arr); if(typeof epSaveActiveDbV7==='function') await epSaveActiveDbV7(); if(typeof renderDbEditors==='function') renderDbEditors(); toast('📦 Перенесено: '+checks.length); } }catch(e){ toast('Ошибка перемещения: '+(e.message||e)); }
  };
  window.epV17BulkDelete=async function(){
    var checks=Array.prototype.slice.call(document.querySelectorAll('#settModal .ep-v7-select:checked')); if(!checks.length) return toast('Выбери позиции галочками');
    var ok=true; try{ if(typeof customConfirm==='function') ok=await customConfirm('Удаление','Удалить выбранные позиции: '+checks.length+'?'); else ok=confirm('Удалить выбранные позиции: '+checks.length+'?'); }catch(e){}
    if(!ok) return;
    var ids={}; checks.forEach(function(ch){ ids[String(ch.dataset.id||'')]=true; });
    try{ if(typeof active==='function' && typeof scope==='function'){ var type=checks[0].dataset.type||'mat'; var arr=(active(type)||[]).filter(function(it){return !ids[String(it.id||'')];}); if(scope()==='global' && typeof setServer==='function') setServer(type,arr); else if(typeof setMy==='function') setMy(type,arr); if(typeof epSaveActiveDbV7==='function') await epSaveActiveDbV7(); if(typeof renderDbEditors==='function') renderDbEditors(); toast('🗑 Удалено: '+checks.length); } }catch(e){ toast('Ошибка удаления: '+(e.message||e)); }
  };
  function boot(){ addBadge(); window.epV17Normalize(); try{ if(typeof renderMainTable==='function') renderMainTable(); }catch(e){} patchDbBulk(); setTimeout(patchDbBulk,700); toast(BUILD+' загружена'); }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',function(){setTimeout(boot,250);}); else setTimeout(boot,250);
  setInterval(function(){ addBadge(); patchDbBulk(); },2000);
})();
