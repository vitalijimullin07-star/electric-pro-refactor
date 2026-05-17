/*
 * Extracted from public/index.html
 * Original script block: 13
 * Original HTML lines: 7149-7329
 */

/* === EP DB AUTO REFRESH ON SCOPE SWITCH V5 2026-05-14 ===
   Refresh selected database every time user switches between My DB and Server DB.
   Keeps sources strict: no mixing. Does not touch shield logic.
*/
(function(){
  var LS_SCOPE = 'ep_db_scope_v2';
  var LS_MY_MAT = 'user_db_mat_v31';
  var LS_MY_WORK = 'user_db_work_v31';
  var LS_SERVER_CACHE = 'ep_global_cache_force_v1';
  var refreshing = false;
  var lastToken = 0;

  function $(id){ return document.getElementById(id); }
  function toast(t){ if(typeof showToast === 'function') showToast(t); else console.log(t); }
  function uid(){ try{ return (window.appUser && appUser.uid) || ''; }catch(e){ return ''; } }
  function isAdmin(){ try{ return !!(window.appUser && appUser.role === 'admin'); }catch(e){ return false; } }
  function setScope(s){ try{ localStorage.setItem(LS_SCOPE, s === 'global' ? 'global' : 'my'); }catch(e){} }
  function getScope(){ try{ return localStorage.getItem(LS_SCOPE) === 'global' ? 'global' : 'my'; }catch(e){ return 'my'; } }
  function label(){ return getScope() === 'global' ? '🌍 База сервера' : '👤 Моя база'; }
  function readArr(k){ try{ var a = JSON.parse(localStorage.getItem(k) || '[]'); return Array.isArray(a) ? a : []; }catch(e){ return []; } }
  function writeArr(k,a){ try{ if(typeof safeSet === 'function') safeSet(k, JSON.stringify(a || [])); else localStorage.setItem(k, JSON.stringify(a || [])); }catch(e){ try{ localStorage.setItem(k, JSON.stringify(a || [])); }catch(_e){} } }
  function readObj(k){ try{ var o = JSON.parse(localStorage.getItem(k) || '{}'); return o && typeof o === 'object' ? o : {}; }catch(e){ return {}; } }
  function writeObj(k,o){ try{ localStorage.setItem(k, JSON.stringify(o || {})); }catch(e){} }
  function clean(s){ return String(s || '').toLowerCase().replace(/ё/g,'е').replace(/×/g,'x').replace(/х/g,'x').replace(/[^a-zа-я0-9]+/g,' ').trim(); }
  function groupOf(it){ return (it && (it.g || it.sc || it.subcategory || it.group)) || ''; }
  function clone(it){ var x = Object.assign({}, it || {}); delete x.__src; delete x.__encoded; return x; }
  function sig(type,it){ return type + '|' + clean([it && it.c, groupOf(it), it && it.n, it && it.u].filter(Boolean).join('|')); }
  function unique(arr,type){
    var seen = {}, out = [];
    (arr || []).forEach(function(raw){
      var it = clone(raw);
      if(!it.n) return;
      if(it.sc && !it.g) it.g = it.sc;
      if(it.g && !it.sc) it.sc = it.g;
      var k = sig(type,it);
      if(seen[k]) return;
      seen[k] = 1;
      out.push(it);
    });
    return out;
  }
  function getServerFromCache(type){
    var c = readObj(LS_SERVER_CACHE);
    var a = type === 'work' ? c.workDB : c.matDB;
    return Array.isArray(a) ? a : [];
  }
  function setMyArrays(mat,work){
    mat = unique(mat || [], 'mat');
    work = unique(work || [], 'work');
    window.EP_MY_MAT = mat;
    window.EP_MY_WORK = work;
    window.userMatDB = mat;
    window.userWorkDB = work;
    writeArr(LS_MY_MAT, mat);
    writeArr(LS_MY_WORK, work);
  }
  function setServerArrays(mat,work){
    mat = unique(mat || [], 'mat');
    work = unique(work || [], 'work');
    window.EP_GLOBAL_MAT = mat;
    window.EP_GLOBAL_WORK = work;
    window.EP_FORCE_GLOBAL = {matDB:mat, workDB:work};
    window.EP_ULTIMATE_DB_CACHE = {matDB:mat, workDB:work, ts:Date.now()};
    window.EP_GLOBAL_DB_VISIBLE_CACHE = {matDB:mat, workDB:work, ts:Date.now()};
    writeObj(LS_SERVER_CACHE, {matDB:mat, workDB:work, ts:Date.now()});
  }
  function syncActiveArrays(){
    try{
      if(getScope() === 'global'){
        var sm = Array.isArray(window.EP_GLOBAL_MAT) ? window.EP_GLOBAL_MAT : getServerFromCache('mat');
        var sw = Array.isArray(window.EP_GLOBAL_WORK) ? window.EP_GLOBAL_WORK : getServerFromCache('work');
        window.matDB = sm.slice();
        window.workDB = sw.slice();
        try{ matDB = window.matDB; workDB = window.workDB; }catch(e){}
      } else {
        var mm = Array.isArray(window.EP_MY_MAT) ? window.EP_MY_MAT : readArr(LS_MY_MAT);
        var mw = Array.isArray(window.EP_MY_WORK) ? window.EP_MY_WORK : readArr(LS_MY_WORK);
        window.matDB = mm.slice();
        window.workDB = mw.slice();
        try{ matDB = window.matDB; workDB = window.workDB; }catch(e){}
      }
    }catch(e){ console.warn('EP V5 sync active arrays failed', e); }
  }
  async function refreshMyFromServer(){
    var mat = Array.isArray(window.EP_MY_MAT) ? window.EP_MY_MAT : readArr(LS_MY_MAT);
    var work = Array.isArray(window.EP_MY_WORK) ? window.EP_MY_WORK : readArr(LS_MY_WORK);
    try{
      if(typeof db !== 'undefined' && db && uid()){
        var doc = await db.collection('user_db').doc(uid()).get();
        if(doc.exists){
          var d = doc.data() || {};
          if(Array.isArray(d.matDB)) mat = d.matDB;
          if(Array.isArray(d.workDB)) work = d.workDB;
        }
      }
    }catch(e){ console.warn('EP V5 load my db failed', e); }
    setMyArrays(mat, work);
  }
  async function refreshServerFromServer(){
    var mat = Array.isArray(window.EP_GLOBAL_MAT) ? window.EP_GLOBAL_MAT : getServerFromCache('mat');
    var work = Array.isArray(window.EP_GLOBAL_WORK) ? window.EP_GLOBAL_WORK : getServerFromCache('work');
    try{
      if(typeof db !== 'undefined' && db){
        var doc = await db.collection('settings').doc('global_db').get();
        if(doc.exists){
          var d = doc.data() || {};
          mat = Array.isArray(d.matDB) ? d.matDB : [];
          work = Array.isArray(d.workDB) ? d.workDB : [];
          if(d.cleanMode || d.resetAt) try{ localStorage.setItem('ep_db_clean_mode_v1','1'); }catch(_e){}
        } else if(isAdmin()){
          await db.collection('settings').doc('global_db').set({matDB:mat || [], workDB:work || [], createdAt:new Date().toISOString()}, {merge:true});
        }
      }
    }catch(e){ console.warn('EP V5 load server db failed', e); }
    setServerArrays(mat, work);
  }
  function isVisible(id){ var el = $(id); return !!(el && el.style && el.style.display && el.style.display !== 'none'); }
  function updateButtons(){
    var my = $('ep-scope-my-btn'), gl = $('ep-scope-global-btn'), st = $('ep-db-scope-status'), clean = $('ep-clean-status-line');
    if(my) my.className = getScope() === 'my' ? 'btn-success' : 'btn-info';
    if(gl) gl.className = getScope() === 'global' ? 'btn-success' : 'btn-info';
    if(my) my.textContent = '👤 Моя база';
    if(gl) gl.textContent = '🌍 База сервера';
    var matCount = getScope() === 'global' ? ((window.EP_GLOBAL_MAT || []).length) : ((window.EP_MY_MAT || []).length);
    var workCount = getScope() === 'global' ? ((window.EP_GLOBAL_WORK || []).length) : ((window.EP_MY_WORK || []).length);
    if(st) st.innerHTML = 'Сейчас выбрано: <b>' + label() + '</b>. Данные автообновлены при переключении.';
    if(clean) clean.textContent = 'Активная база: ' + label() + '. Материалы: ' + matCount + ', работы: ' + workCount + '.';
  }
  function rerenderOpenScreens(){
    syncActiveArrays();
    updateButtons();
    try{ if(typeof renderDbEditors === 'function') renderDbEditors(); }catch(e){}
    try{ if(window.renderDbEditors && window.renderDbEditors !== renderDbEditors) window.renderDbEditors(); }catch(e){}
    if(isVisible('matCatModal')){
      setTimeout(function(){ try{ if(typeof openMatCatalog === 'function') openMatCatalog(); }catch(e){} }, 20);
    }
    if(isVisible('workModal')){
      setTimeout(function(){ try{ if(typeof openWorkCatalog === 'function') openWorkCatalog(); }catch(e){} }, 20);
    }
    if(isVisible('globalDbModal') && typeof window.epRenderServerDbModal === 'function'){
      try{ window.epRenderServerDbModal(); }catch(e){}
    }
  }
  window.epRefreshActiveDbNow = async function(silent){
    var token = ++lastToken;
    if(refreshing) return;
    refreshing = true;
    try{
      if(!silent && typeof showLoader === 'function') showLoader('Обновляю ' + label() + '...', '📚');
      if(getScope() === 'global') await refreshServerFromServer();
      else await refreshMyFromServer();
      if(token === lastToken) rerenderOpenScreens();
    }finally{
      refreshing = false;
      if(!silent && typeof hideLoader === 'function') hideLoader();
    }
  };
  window.epSetDbScope = async function(s){
    setScope(s === 'global' ? 'global' : 'my');
    syncActiveArrays();
    updateButtons();
    if(typeof showLoader === 'function') showLoader('Обновляю ' + label() + '...', '📚');
    try{
      if(getScope() === 'global') await refreshServerFromServer();
      else await refreshMyFromServer();
      rerenderOpenScreens();
      toast('✅ Обновлено: ' + label());
    }catch(e){
      console.warn('EP V5 scope switch refresh failed', e);
      rerenderOpenScreens();
      toast('⚠️ Переключил на ' + label() + ', но сервер не ответил. Показан локальный кэш.');
    }finally{
      if(typeof hideLoader === 'function') hideLoader();
    }
  };
  document.addEventListener('DOMContentLoaded', function(){
    setTimeout(function(){ try{ syncActiveArrays(); updateButtons(); }catch(e){} }, 900);
  });
})();
