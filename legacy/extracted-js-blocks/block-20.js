/*
 * Extracted from public/index.html
 * Original script block: 20
 * Original HTML lines: 9137-9406
 */

/* === EP V12 SURGICAL FIX: shield work names + instant swap modal ===
   Fixes:
   1) "Установка БП в щит" no longer appears from shield generator.
   2) Bare wall material work name "Бетон/Кирпич/..." becomes "Штроба 100×50, под трассу кабелей (...)".
   3) Replace-position modal uses already loaded DB caches and never waits forever on Firebase.
   Shield math is not changed.
*/
(function(){
  var V='EP_V12_SWAP_SHIELD_FIX';
  function $(id){ return document.getElementById(id); }
  function toast(t){ try{ if(typeof showToast==='function') showToast(t); else console.log(t); }catch(e){ console.log(t); } }
  function esc(s){ return String(s==null?'':s).replace(/[&<>"']/g,function(m){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m];}); }
  function norm(s){ return String(s||'').toLowerCase().replace(/ё/g,'е').replace(/[×х]/g,'x').replace(/[^a-zа-я0-9]+/g,' ').trim(); }
  function money(v){ var n=Number(String(v==null?'':v).replace(',','.').replace(/[^0-9.\-]/g,'')); return Number.isFinite(n)?n:0; }
  function appPrice(key, def){ try{ return money((window.appLogic||{})[key]) || def; }catch(e){ return def; } }
  function readArr(k){ try{ var a=JSON.parse(localStorage.getItem(k)||'[]'); return Array.isArray(a)?a:[]; }catch(e){ return []; } }
  function readObj(k){ try{ var o=JSON.parse(localStorage.getItem(k)||'{}'); return o&&typeof o==='object'?o:{}; }catch(e){ return {}; } }
  function wallFromName(s){ var n=norm(s); if(/кирпич/.test(n)) return 'Кирпич'; if(/панел/.test(n)) return 'Панелька'; if(/мягк|гкл|гипс/.test(n)) return 'Мягкий материал'; return 'Бетон'; }
  function groupOf(it){ return (it && (it.g || it.sc || it.subcategory || it.group)) || ''; }
  function clone(it){ return Object.assign({}, it||{}); }

  function fixShieldWorkItem(it, originalLabel){
    if(!it) return it;
    var x=it;
    var n=String(x.n||'').trim();
    var label=String(originalLabel||n||'');
    var nl=norm(n), ll=norm(label);

    // Wrong fuzzy match: "Установка щита" was matched to "Установка БП в щит".
    if(/установка\s+бп\s+в\s+щит/i.test(n) || /установка\s+щита/.test(ll)){
      x.n='Установка щита';
      x.p=appPrice('shieldInstallPrice', 2500);
      x.u='шт';
      x.type='work';
      x.c='Щитовое';
      x.g='Монтаж щита';
      x.sc='Монтаж щита';
      x.dbMeta=Object.assign({}, x.dbMeta||{}, {category:'Щитовое', subcategory:'Монтаж щита'});
      delete x.sourceId;
      return x;
    }

    // Wrong fuzzy match: DB row name is only "Бетон", but estimate must show the actual work.
    if((/^(бетон|кирпич|панелька|мягкий мат|мягкий материал)$/.test(nl) && x.type==='work') || /штроба.*100.*50/.test(ll)){
      var wall = wallFromName(label+' '+n);
      x.n='Штроба 100×50, под трассу кабелей ('+wall+')';
      x.p=money(x.p) || appPrice('shieldInputGroovePrice',1500);
      x.u='м.п.';
      x.type='work';
      x.c='Штробление и резка';
      x.g='Штроба 100×50 под трассу кабелей';
      x.sc='Штроба 100×50 под трассу кабелей';
      x.dbMeta=Object.assign({}, x.dbMeta||{}, {category:'Штробление и резка', subcategory:'Штроба 100×50 под трассу кабелей', wall:wall});
      if(/^бетон|кирпич|панелька|мягкий/.test(nl)) delete x.sourceId;
      return x;
    }

    if(/^ниша\s+щита/i.test(n)){
      x.c='Штробление и резка';
      x.g='Ниши щита';
      x.sc='Ниши щита';
      x.u=x.u||'мод.';
      x.dbMeta=Object.assign({}, x.dbMeta||{}, {category:'Штробление и резка', subcategory:'Ниши щита'});
    }
    return x;
  }

  // Patch epWork itself so the shield generator receives clean work items immediately.
  var oldEpWork = window.epWork;
  window.epWork = function(label,q,price,words,meta){
    var l=norm(label);
    if(/установка\s+щита/.test(l)){
      return fixShieldWorkItem({n:'Установка щита', q:q, p:price||appPrice('shieldInstallPrice',2500), u:(meta&&meta.unit)||'шт', type:'work', c:'Щитовое', g:'Монтаж щита', sc:'Монтаж щита', logicPrice:true}, label);
    }
    if(/штроба.*100.*50/.test(l)){
      var wall=wallFromName(label);
      return fixShieldWorkItem({n:'Штроба 100×50, под трассу кабелей ('+wall+')', q:q, p:price||appPrice('shieldInputGroovePrice',1500), u:(meta&&meta.unit)||'м.п.', type:'work', c:'Штробление и резка', g:'Штроба 100×50 под трассу кабелей', sc:'Штроба 100×50 под трассу кабелей', logicPrice:true}, label);
    }
    var r = oldEpWork ? oldEpWork.apply(this, arguments) : {n:label,q:q,p:price||0,u:(meta&&meta.unit)||'шт',type:'work'};
    return fixShieldWorkItem(r, label);
  };
  try{ epWork = window.epWork; }catch(e){}

  function normalizeCurrentEstimate(){
    try{
      if(!Array.isArray(currentEstimate)) return;
      currentEstimate.forEach(function(it){
        if(!it || it.type!=='work') return;
        fixShieldWorkItem(it, it.n);
      });
    }catch(e){ console.warn(V, e); }
  }

  var oldRender = window.renderMainTable;
  if(typeof oldRender==='function' && !oldRender.__ep_v12_wrapped){
    var newRender=function(){ normalizeCurrentEstimate(); return oldRender.apply(this, arguments); };
    newRender.__ep_v12_wrapped=true;
    window.renderMainTable=newRender;
    try{ renderMainTable=window.renderMainTable; }catch(e){}
  }

  var oldAddAuto = window.addAuto;
  if(typeof oldAddAuto==='function' && !oldAddAuto.__ep_v12_wrapped){
    var newAddAuto=function(items, tag){
      try{ (items||[]).forEach(function(it){ if(it && it.type==='work') fixShieldWorkItem(it, it.n); }); }catch(e){}
      var r=oldAddAuto.apply(this, arguments);
      setTimeout(function(){ normalizeCurrentEstimate(); try{ if(typeof renderMainTable==='function') renderMainTable(); }catch(e){} },20);
      return r;
    };
    newAddAuto.__ep_v12_wrapped=true;
    window.addAuto=newAddAuto;
    try{ addAuto=window.addAuto; }catch(e){}
  }

  function patchShieldButton(){
    var base = window.epGenerateShieldFixed || window.generateCascadePanel;
    if(typeof base==='function' && !base.__ep_v12_wrapped){
      var wrapped=function(){
        var r=base.apply(this, arguments);
        setTimeout(function(){ normalizeCurrentEstimate(); try{ if(typeof renderMainTable==='function') renderMainTable(); }catch(e){} },60);
        return r;
      };
      wrapped.__ep_v12_wrapped=true;
      window.epGenerateShieldFixed=wrapped;
      window.generateCascadePanel=wrapped;
      try{ generateCascadePanel=wrapped; }catch(e){}
    }
    Array.prototype.forEach.call(document.querySelectorAll('button'), function(btn){
      if((btn.textContent||'').indexOf('Сгенерировать щит')>=0) btn.onclick=window.generateCascadePanel;
    });
  }

  function tagSrc(it,src){ var x=clone(it); x.__src=src; return fixShieldWorkItem(x, x.n); }
  function pushArr(out, arr, src){ if(Array.isArray(arr)) arr.forEach(function(it){ if(it&&it.n) out.push(tagSrc(it,src)); }); }
  function collectDb(type){
    var out=[];
    var activeScope='my'; try{ activeScope=localStorage.getItem('ep_db_scope_v2')==='global'?'global':'my'; }catch(e){}
    if(type==='work'){
      pushArr(out, activeScope==='global'?(window.workDB||[]):(window.workDB||[]), activeScope==='global'?'global':'my');
      pushArr(out, window.EP_MY_WORK, 'my'); pushArr(out, window.userWorkDB, 'my');
      pushArr(out, window.EP_GLOBAL_WORK, 'global');
      pushArr(out, window.EP_FORCE_GLOBAL && window.EP_FORCE_GLOBAL.workDB, 'global');
      pushArr(out, window.EP_ULTIMATE_DB_CACHE && window.EP_ULTIMATE_DB_CACHE.workDB, 'global');
      pushArr(out, window.EP_GLOBAL_DB_VISIBLE_CACHE && window.EP_GLOBAL_DB_VISIBLE_CACHE.workDB, 'global');
      pushArr(out, readArr('user_db_work_v31'), 'my');
      pushArr(out, readObj('ep_global_cache_force_v1').workDB, 'global');
    } else {
      pushArr(out, activeScope==='global'?(window.matDB||[]):(window.matDB||[]), activeScope==='global'?'global':'my');
      pushArr(out, window.EP_MY_MAT, 'my'); pushArr(out, window.userMatDB, 'my');
      pushArr(out, window.EP_GLOBAL_MAT, 'global');
      pushArr(out, window.EP_FORCE_GLOBAL && window.EP_FORCE_GLOBAL.matDB, 'global');
      pushArr(out, window.EP_ULTIMATE_DB_CACHE && window.EP_ULTIMATE_DB_CACHE.matDB, 'global');
      pushArr(out, window.EP_GLOBAL_DB_VISIBLE_CACHE && window.EP_GLOBAL_DB_VISIBLE_CACHE.matDB, 'global');
      pushArr(out, readArr('user_db_mat_v31'), 'my');
      pushArr(out, readObj('ep_global_cache_force_v1').matDB, 'global');
    }
    var seen={},res=[];
    out.forEach(function(it){
      var k=norm([it.__src,it.c,groupOf(it),it.n,it.u,it.p].join('|'));
      if(seen[k]) return; seen[k]=1; res.push(it);
    });
    return res;
  }

  function classify(it){
    var n=norm([it&&it.n,it&&it.c,groupOf(it),it&&it.kind,it&&it.nominal,it&&it.curve].join(' '));
    if((it&&it.type)==='work'){
      if(/штроб|борозд|алмаз|резк|ниша/.test(n)) return 'work:cut';
      if(/сборка\s+щита/.test(n)) return 'work:shield_assembly';
      if(/установка\s+щита|монтаж\s+электрощит/.test(n)) return 'work:shield_install';
      if(/подключение\s+ввод/.test(n)) return 'work:input_connect';
      if(/прозвон|проверка\s+линий/.test(n)) return 'work:test';
      if(/маркиров/.test(n)) return 'work:mark';
      if(/однолин/.test(n)) return 'work:scheme';
      if(/щит|автомат|узо|диф|реле/.test(n)) return 'work:shield';
      return 'work:other';
    }
    if(/диф/.test(n)) return 'dif';
    if(/узо/.test(n)) return 'uzo';
    if(/контактор/.test(n)) return 'contactor';
    if(/реле\s+напряж|узм/.test(n)) return 'voltage';
    if(/автомат|\b[abcdсавд]\s?\d{1,3}\b|\bc\s?\d{1,3}\b/.test(n)) return 'auto';
    if(/щит|корпус|бокс/.test(n)) return 'shield_box';
    if(/греб/.test(n)) return 'comb';
    if(/шина|клемм/.test(n)) return 'bus';
    if(/din|дин|рейк|огранич/.test(n)) return 'din';
    if(/пугв|провод|кабель|ввг/.test(n)) return 'cable';
    if(/ншви|наконеч/.test(n)) return 'lug';
    if(/маркир|бирк/.test(n)) return 'marking';
    return 'other';
  }
  function sameClass(a,b){
    var ca=classify(a), cb=classify(b);
    if(ca===cb) return true;
    if((a&&a.type)==='work' && (b&&b.type)==='work'){
      if(ca==='work:cut' && cb==='work:cut') return true;
      if(ca.indexOf('work:shield')===0 && cb.indexOf('work:shield')===0) return true;
    }
    return false;
  }
  function score(current, cand){
    var cn=norm([current&&current.n,current&&current.c,groupOf(current)].join(' '));
    var bn=norm([cand&&cand.n,cand&&cand.c,groupOf(cand)].join(' '));
    var s=0;
    if(sameClass(current,cand)) s+=100;
    cn.split(' ').forEach(function(w){ if(w.length>2 && bn.indexOf(w)>=0) s+=2; });
    if((current&&current.c) && norm(current.c)===norm(cand&&cand.c)) s+=10;
    if(groupOf(current) && norm(groupOf(current))===norm(groupOf(cand))) s+=8;
    if(cand.__src==='my') s+=1;
    return s;
  }
  function swapLabel(it){ return (it.__src==='global'?'🌍 ':'👤 ') + (it.n||'Позиция') + ' — ' + (money(it.p)||0) + ' ₽ / ' + (it.u||'шт'); }

  window.EP_V12_SWAP_LIST=[];
  window.openSwapModal=function(idx){
    try{ swapTargetIdx=idx; }catch(e){ window.swapTargetIdx=idx; }
    var current=null; try{ current=currentEstimate[idx]; }catch(e){}
    if(!current) return toast('Позиция не найдена');
    var type=current.type==='work'?'work':'mat';
    var sel=$('swap-select');
    if(sel) sel.innerHTML='<option value="">Открываю загруженную базу...</option>';
    try{ if(typeof openModal==='function') openModal('swapModal'); else { var m=$('swapModal'); if(m)m.style.display='flex'; } }catch(e){}
    setTimeout(function(){
      try{
        var pool=collectDb(type);
        var ranked=pool.map(function(it){ return {it:it, s:score(current,it)}; }).filter(function(x){ return x.s>=100 || sameClass(current,x.it); });
        if(!ranked.length){
          var curCat=norm([current.c, groupOf(current), current.dbMeta&&current.dbMeta.category, current.dbMeta&&current.dbMeta.subcategory].join(' '));
          ranked=pool.map(function(it){ return {it:it, s:score(current,it)}; }).filter(function(x){ return curCat && norm([x.it.c,groupOf(x.it)].join(' ')).indexOf(curCat.split(' ')[0])>=0; });
        }
        if(!ranked.length) ranked=pool.map(function(it){ return {it:it, s:score(current,it)}; });
        ranked.sort(function(a,b){ return b.s-a.s; });
        var list=ranked.map(function(x){ return x.it; }).slice(0,300);
        window.EP_V12_SWAP_LIST=list;
        if(!sel) return;
        if(!list.length){ sel.innerHTML='<option value="">В выбранной базе нет позиций</option>'; return; }
        sel.innerHTML=list.map(function(it,i){ return '<option value="'+i+'">'+esc(swapLabel(it))+'</option>'; }).join('');
        var note=$('ep-swap-note') || $('ep-v12-swap-note');
        if(!note){
          note=document.createElement('div'); note.id='ep-v12-swap-note'; note.style.cssText='font-size:11px;color:var(--gray);font-weight:800;line-height:1.35;margin:8px 0 10px;';
          if(sel.parentNode) sel.parentNode.insertBefore(note, sel.nextSibling);
        }
        note.textContent='Показываю варианты из уже загруженной базы. Найдено: '+list.length+'. Firebase сейчас не ждём, поэтому окно не зависает.';
      }catch(err){ console.error(V,err); if(sel) sel.innerHTML='<option value="">Ошибка загрузки вариантов</option>'; toast('Ошибка списка замен: '+(err.message||err)); }
    },10);
  };

  window.applySwap=function(){
    var idx=-1; try{ idx=swapTargetIdx; }catch(e){ idx=window.swapTargetIdx; }
    if(idx<0) return toast('Не выбрана строка для замены');
    var sel=$('swap-select'); if(!sel || sel.value==='') return toast('Выберите позицию');
    var it=window.EP_V12_SWAP_LIST[Number(sel.value)]; if(!it) return toast('Позиция не найдена');
    var cur=null; try{ cur=currentEstimate[idx]; }catch(e){}
    if(!cur) return toast('Строка сметы не найдена');
    cur.n=it.n; cur.p=money(it.p); cur.u=it.u || cur.u || 'шт'; cur.type=cur.type || it.type || 'mat'; cur.sourceId=it.id || null;
    cur.c=it.c || cur.c || ''; cur.g=groupOf(it) || cur.g || ''; cur.sc=cur.g;
    cur.dbMeta=Object.assign({}, cur.dbMeta||{}, {category:cur.c||'', subcategory:cur.g||'', source:it.__src||''});
    if(cur.type==='work') fixShieldWorkItem(cur, cur.n);
    normalizeCurrentEstimate();
    try{ if(typeof renderMainTable==='function') renderMainTable(); }catch(e){}
    try{ if(typeof closeModal==='function') closeModal('swapModal'); else { var m=$('swapModal'); if(m)m.style.display='none'; } }catch(e){}
    toast('✅ Позиция заменена');
  };

  function boot(){ patchShieldButton(); normalizeCurrentEstimate(); try{ if(typeof renderMainTable==='function') renderMainTable(); }catch(e){} }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded', function(){ setTimeout(boot,200); }); else setTimeout(boot,50);
  setTimeout(boot,1200);
})();
