/*
 * Extracted from public/index.html
 * Original script block: 12
 * Original HTML lines: 6928-7145
 */

/* === EP MASTER EXCEL IMPORT DISPLAY FIX V4 2026-05-14 ===
   Fix: for master accounts Excel/text/JSON imports always save into "My database",
   immediately switch UI to My database, persist locally and to user_db/{uid}, then rerender.
   Admin can still import directly to Server database when Server scope is selected.
*/
(function(){
  var LS_MY_MAT = 'user_db_mat_v31';
  var LS_MY_WORK = 'user_db_work_v31';
  var LS_SCOPE = 'ep_db_scope_v2';
  var LS_SERVER_CACHE = 'ep_global_cache_force_v1';

  function $(id){ return document.getElementById(id); }
  function msg(t){ if(typeof showToast === 'function') showToast(t); else alert(t); }
  function isAdmin(){ try{ return !!(window.appUser && appUser.role === 'admin'); }catch(e){ return false; } }
  function uid(){ try{ return (window.appUser && appUser.uid) || ''; }catch(e){ return ''; } }
  function scope(){ try{ return localStorage.getItem(LS_SCOPE) === 'global' ? 'global' : 'my'; }catch(e){ return 'my'; } }
  function setScope(s){ try{ localStorage.setItem(LS_SCOPE, s === 'global' ? 'global' : 'my'); }catch(e){} }
  function readArr(k){ try{ var a = JSON.parse(localStorage.getItem(k) || '[]'); return Array.isArray(a) ? a : []; }catch(e){ return []; } }
  function writeArr(k,a){ try{ if(typeof safeSet === 'function') safeSet(k, JSON.stringify(a || [])); else localStorage.setItem(k, JSON.stringify(a || [])); }catch(e){ try{ localStorage.setItem(k, JSON.stringify(a || [])); }catch(_e){} } }
  function readObj(k){ try{ var o = JSON.parse(localStorage.getItem(k) || '{}'); return o && typeof o === 'object' ? o : {}; }catch(e){ return {}; } }
  function writeObj(k,o){ try{ localStorage.setItem(k, JSON.stringify(o || {})); }catch(e){} }
  function clean(s){ return String(s || '').toLowerCase().replace(/ё/g,'е').replace(/×/g,'x').replace(/х/g,'x').replace(/[^a-zа-я0-9]+/g,' ').trim(); }
  function groupOf(it){ return (it && (it.g || it.sc || it.subcategory || it.group)) || ''; }
  function clone(it){ var x = Object.assign({}, it || {}); delete x.__src; delete x.__encoded; return x; }
  function sig(type,it){ return type + '|' + clean([it && it.c, groupOf(it), it && it.n, it && it.u].filter(Boolean).join('|')); }
  function activeTarget(){ return (isAdmin() && scope() === 'global') ? 'global' : 'my'; }

  function getMy(type){
    var key = type === 'work' ? LS_MY_WORK : LS_MY_MAT;
    var fromWin = type === 'work' ? window.EP_MY_WORK : window.EP_MY_MAT;
    return Array.isArray(fromWin) ? fromWin.slice() : readArr(key);
  }
  function getServer(type){
    var fromWin = type === 'work' ? window.EP_GLOBAL_WORK : window.EP_GLOBAL_MAT;
    if(Array.isArray(fromWin)) return fromWin.slice();
    var c = readObj(LS_SERVER_CACHE);
    var a = type === 'work' ? c.workDB : c.matDB;
    return Array.isArray(a) ? a : [];
  }
  function setMy(type,arr){
    arr = unique(arr, type);
    if(type === 'work') window.EP_MY_WORK = arr; else window.EP_MY_MAT = arr;
    writeArr(LS_MY_MAT, type === 'mat' ? arr : getMy('mat'));
    writeArr(LS_MY_WORK, type === 'work' ? arr : getMy('work'));
    try{ window.userMatDB = getMy('mat'); window.userWorkDB = getMy('work'); }catch(e){}
    syncMainArrays('my');
  }
  function setServer(type,arr){
    arr = unique(arr, type);
    if(type === 'work') window.EP_GLOBAL_WORK = arr; else window.EP_GLOBAL_MAT = arr;
    var mat = type === 'mat' ? arr : getServer('mat');
    var work = type === 'work' ? arr : getServer('work');
    try{
      window.EP_FORCE_GLOBAL = {matDB:mat, workDB:work};
      window.EP_ULTIMATE_DB_CACHE = {matDB:mat, workDB:work, ts:Date.now()};
      window.EP_GLOBAL_DB_VISIBLE_CACHE = {matDB:mat, workDB:work, ts:Date.now()};
    }catch(e){}
    writeObj(LS_SERVER_CACHE, {matDB:mat, workDB:work, ts:Date.now()});
    syncMainArrays('global');
  }
  function syncMainArrays(target){
    try{
      var use = target || activeTarget();
      if(use === 'global'){
        window.matDB = getServer('mat');
        window.workDB = getServer('work');
        try{ matDB = window.matDB; workDB = window.workDB; }catch(e){}
      } else {
        window.matDB = getMy('mat');
        window.workDB = getMy('work');
        try{ matDB = window.matDB; workDB = window.workDB; }catch(e){}
      }
    }catch(e){}
  }
  function unique(arr,type){
    var seen = {}, out = [];
    (arr || []).forEach(function(raw){
      var it = clone(raw);
      if(!it.n) return;
      if(!it.id) it.id = (type === 'work' ? 'w' : 'm') + '_imp_' + Date.now() + '_' + Math.random().toString(36).slice(2,7);
      if(it.sc && !it.g) it.g = it.sc;
      if(it.g && !it.sc) it.sc = it.g;
      var k = sig(type,it);
      if(seen[k]) return;
      seen[k] = 1;
      out.push(it);
    });
    return out;
  }
  function upsert(arr,type,it,mode){
    it = clone(it);
    if(!it.id) it.id = (type === 'work' ? 'w' : 'm') + '_imp_' + Date.now() + '_' + Math.random().toString(36).slice(2,7);
    if(it.sc && !it.g) it.g = it.sc;
    if(it.g && !it.sc) it.sc = it.g;
    var k = sig(type,it);
    var idx = (arr || []).findIndex(function(x){ return sig(type,x) === k || (it.id && String(x.id || '') === String(it.id)); });
    if(idx >= 0 && mode === 'replace') arr[idx] = Object.assign({}, arr[idx], it, {id:arr[idx].id || it.id});
    else if(idx >= 0) arr[idx] = Object.assign({}, arr[idx], it, {id:arr[idx].id || it.id});
    else arr.push(it);
    return arr;
  }
  function reviewedItems(){
    var review = window.EP_DB_REVIEW || {};
    var src = Array.isArray(review.items) ? review.items : [];
    var type = review.type === 'work' ? 'work' : 'mat';
    var out = [];
    src.forEach(function(base, i){
      var ch = $('ep-db-check-' + i);
      if(ch && !ch.checked) return;
      var it = {
        id: base.id || ((type === 'work' ? 'w' : 'm') + '_imp_' + Date.now() + '_' + i),
        n: (($('ep-db-name-' + i) || {}).value || base.n || '').trim(),
        c: (($('ep-db-cat-' + i) || {}).value || base.c || 'Разное').trim(),
        g: (($('ep-db-subcat-' + i) || {}).value || base.g || base.sc || 'Без группы').trim(),
        sc: (($('ep-db-subcat-' + i) || {}).value || base.sc || base.g || 'Без группы').trim(),
        p: Number(String((($('ep-db-price-' + i) || {}).value) || base.p || 0).replace(',','.').replace(/[^\d.]/g,'')) || 0,
        u: (($('ep-db-unit-' + i) || {}).value || base.u || 'шт').trim()
      };
      if(it.n){
        try{ if(typeof window.epAutoGroupItem === 'function') it = window.epAutoGroupItem(type,it); }catch(e){}
        out.push(it);
      }
    });
    return {type:type, items:out};
  }
  async function saveMyRemote(){
    try{
      if(typeof db !== 'undefined' && db && uid()){
        await db.collection('user_db').doc(uid()).set({
          uid: uid(),
          masterName: (window.appUser && (appUser.name || appUser.email)) || '',
          matDB: getMy('mat'),
          workDB: getMy('work'),
          created: true,
          updatedAt: new Date().toISOString()
        }, {merge:true});
        return true;
      }
    }catch(e){ console.warn('EP V4 save my import failed', e); }
    return false;
  }
  async function saveServerRemote(){
    try{
      if(typeof db !== 'undefined' && db && isAdmin()){
        await db.collection('settings').doc('global_db').set({
          matDB: getServer('mat'),
          workDB: getServer('work'),
          updatedAt: new Date().toISOString()
        }, {merge:true});
        return true;
      }
    }catch(e){ console.warn('EP V4 save server import failed', e); }
    return false;
  }
  function rerender(){
    try{ if(typeof renderDbEditors === 'function') renderDbEditors(); }catch(e){}
    try{ if(window.renderDbEditors && window.renderDbEditors !== renderDbEditors) window.renderDbEditors(); }catch(e){}
    try{ if(typeof window.epRefreshDbScopeUi === 'function') window.epRefreshDbScopeUi(); }catch(e){}
    setTimeout(function(){ try{ if(typeof renderDbEditors === 'function') renderDbEditors(); }catch(e){} },80);
    setTimeout(function(){ try{ if(typeof renderDbEditors === 'function') renderDbEditors(); }catch(e){} },500);
  }

  var oldTrigger = window.epTriggerDbFileImport;
  window.epTriggerDbFileImport = function(type){
    if(!isAdmin()){
      setScope('my');
      syncMainArrays('my');
      rerender();
      msg('Импорт мастера будет сохранён в 👤 Моя база');
    }
    if(typeof oldTrigger === 'function') return oldTrigger(type);
  };

  var oldTextImport = window.epOpenTextImport;
  window.epOpenTextImport = function(type){
    if(!isAdmin()){
      setScope('my');
      syncMainArrays('my');
      rerender();
    }
    if(typeof oldTextImport === 'function') return oldTextImport(type);
  };

  window.epApplyReviewedDbItems = async function(mode){
    var data = reviewedItems();
    var type = data.type;
    var items = data.items;
    if(!items.length) return msg('Нет выбранных позиций');

    var target = activeTarget();
    if(!isAdmin()){
      target = 'my';
      setScope('my');
    }

    if(target === 'global'){
      var g = getServer(type);
      items.forEach(function(it){ g = upsert(g,type,it,mode); });
      setServer(type,g);
      await saveServerRemote();
      msg('✅ Импорт добавлен в базу сервера: ' + items.length + ' поз.');
    } else {
      var a = getMy(type);
      items.forEach(function(it){ a = upsert(a,type,it,mode); });
      setMy(type,a);
      var saved = await saveMyRemote();
      syncMainArrays('my');
      msg('✅ Импорт сохранён в моей базе: ' + items.length + ' поз.' + (saved ? '' : ' Сервер не подтвердил сохранение, но на этом телефоне база отображается.'));
    }

    try{ if(typeof closeModal === 'function') closeModal('ep-db-ai-review-modal'); }catch(e){}
    rerender();
  };

  setTimeout(function(){ if(!isAdmin()) syncMainArrays('my'); rerender(); },1200);
})();
