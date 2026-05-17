/*
 * Extracted from public/index.html
 * Original script block: 14
 * Original HTML lines: 7332-7820
 */

/* === EP DB IMPORT ANTI-FREEZE V6 2026-05-14 ===
   Fixes stuck loader and frozen review screen for large Excel/JSON imports.
   Strict DB sources remain: My DB / Server DB. Does not touch shield logic.
*/
(function(){
  var LS_SCOPE = 'ep_db_scope_v2';
  var LS_MY_MAT = 'user_db_mat_v31';
  var LS_MY_WORK = 'user_db_work_v31';
  var LS_SERVER_CACHE = 'ep_global_cache_force_v1';
  var PAGE_SIZE = 60;
  var oldTrigger = window.epTriggerDbFileImport;

  window.EP_DB_REVIEW_V6 = window.EP_DB_REVIEW_V6 || { type:'mat', items:[], source:'', page:0, selected:{}, editCache:{} };

  function $(id){ return document.getElementById(id); }
  function toast(t){ try{ if(typeof showToast === 'function') showToast(t); else console.log(t); }catch(e){ console.log(t); } }
  function uid(){ try{ return (window.appUser && appUser.uid) || ''; }catch(e){ return ''; } }
  function isAdmin(){ try{ return !!(window.appUser && appUser.role === 'admin'); }catch(e){ return false; } }
  function setScope(s){ try{ localStorage.setItem(LS_SCOPE, s === 'global' ? 'global' : 'my'); }catch(e){} }
  function getScope(){ try{ return localStorage.getItem(LS_SCOPE) === 'global' ? 'global' : 'my'; }catch(e){ return 'my'; } }
  function hardHideLoader(){
    try{ if(typeof hideLoader === 'function') hideLoader(); }catch(e){}
    try{ var l = $('global-loader'); if(l) l.classList.remove('show'); }catch(e){}
  }
  function showReadLoader(text, icon){ try{ if(typeof showLoader === 'function') showLoader(text || 'Читаю файл...', icon || '📥'); }catch(e){} }
  function esc(s){ return String(s == null ? '' : s).replace(/[&<>"']/g, function(m){ return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[m]; }); }
  function cleanText(v){ return String(v == null ? '' : v).replace(/\s+/g,' ').trim(); }
  function money(v){ var n = Number(String(v == null ? '' : v).replace(',', '.').replace(/[^\d.\-]/g,'')); return Number.isFinite(n) ? n : 0; }
  function norm(s){ return String(s || '').toLowerCase().replace(/ё/g,'е').replace(/×/g,'x').replace(/х/g,'x').replace(/[^a-zа-я0-9]+/g,' ').trim(); }
  function readArr(k){ try{ var a = JSON.parse(localStorage.getItem(k) || '[]'); return Array.isArray(a) ? a : []; }catch(e){ return []; } }
  function writeArr(k,a){ try{ if(typeof safeSet === 'function') safeSet(k, JSON.stringify(a || [])); else localStorage.setItem(k, JSON.stringify(a || [])); }catch(e){ try{ localStorage.setItem(k, JSON.stringify(a || [])); }catch(_e){} } }
  function readObj(k){ try{ var o = JSON.parse(localStorage.getItem(k) || '{}'); return o && typeof o === 'object' ? o : {}; }catch(e){ return {}; } }
  function writeObj(k,o){ try{ localStorage.setItem(k, JSON.stringify(o || {})); }catch(e){} }
  function groupOf(it){ return (it && (it.g || it.sc || it.subcategory || it.group)) || ''; }
  function clone(it){ var x = Object.assign({}, it || {}); delete x.__src; delete x.__encoded; return x; }
  function sig(type,it){ return type + '|' + norm([it && it.c, groupOf(it), it && it.n, it && it.u].filter(Boolean).join('|')); }
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
  function getMy(type){
    var fromWin = type === 'work' ? window.EP_MY_WORK : window.EP_MY_MAT;
    if(Array.isArray(fromWin)) return fromWin.slice();
    return readArr(type === 'work' ? LS_MY_WORK : LS_MY_MAT);
  }
  function getServer(type){
    var fromWin = type === 'work' ? window.EP_GLOBAL_WORK : window.EP_GLOBAL_MAT;
    if(Array.isArray(fromWin)) return fromWin.slice();
    var c = readObj(LS_SERVER_CACHE);
    var a = type === 'work' ? c.workDB : c.matDB;
    return Array.isArray(a) ? a : [];
  }
  function syncMainArrays(target){
    try{
      var use = target || getScope();
      if(use === 'global'){
        window.matDB = getServer('mat');
        window.workDB = getServer('work');
      } else {
        window.matDB = getMy('mat');
        window.workDB = getMy('work');
      }
      try{ matDB = window.matDB; workDB = window.workDB; }catch(e){}
    }catch(e){}
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
  function upsert(arr,type,it,mode){
    it = clone(it);
    if(!it.id) it.id = (type === 'work' ? 'w' : 'm') + '_imp_' + Date.now() + '_' + Math.random().toString(36).slice(2,7);
    if(it.sc && !it.g) it.g = it.sc;
    if(it.g && !it.sc) it.sc = it.g;
    var k = sig(type,it);
    var idx = (arr || []).findIndex(function(x){ return sig(type,x) === k || (it.id && String(x.id || '') === String(it.id)); });
    if(idx >= 0) arr[idx] = Object.assign({}, arr[idx], it, {id:arr[idx].id || it.id});
    else arr.push(it);
    return arr;
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
    }catch(e){ console.warn('EP V6 save my import failed', e); }
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
    }catch(e){ console.warn('EP V6 save server import failed', e); }
    return false;
  }
  function rerender(){
    try{ if(typeof renderDbEditors === 'function') renderDbEditors(); }catch(e){}
    try{ if(window.renderDbEditors && window.renderDbEditors !== renderDbEditors) window.renderDbEditors(); }catch(e){}
    try{ if(typeof window.epRefreshDbScopeUi === 'function') window.epRefreshDbScopeUi(); }catch(e){}
    setTimeout(function(){ try{ if(typeof renderDbEditors === 'function') renderDbEditors(); }catch(e){} },80);
    setTimeout(function(){ try{ if(typeof renderDbEditors === 'function') renderDbEditors(); }catch(e){} },300);
  }
  function fileText(file){ return new Promise(function(resolve,reject){ var r = new FileReader(); r.onload = function(){ resolve(String(r.result || '')); }; r.onerror = reject; r.readAsText(file); }); }
  function fileBuffer(file){ return new Promise(function(resolve,reject){ var r = new FileReader(); r.onload = function(){ resolve(r.result); }; r.onerror = reject; r.readAsArrayBuffer(file); }); }
  function csvRows(txt){
    var lines = String(txt || '').split(/\r?\n/).filter(function(x){ return x.trim(); });
    var delims = [';','\t',','];
    var delim = delims.map(function(d){ return {d:d, n:(lines[0] || '').split(d).length}; }).sort(function(a,b){ return b.n-a.n; })[0].d;
    return lines.map(function(line){
      var out = [], cur = '', q = false;
      for(var i=0;i<line.length;i++){
        var ch = line[i];
        if(ch === '"') { if(q && line[i+1] === '"'){ cur += '"'; i++; } else q = !q; }
        else if(ch === delim && !q){ out.push(cur); cur=''; }
        else cur += ch;
      }
      out.push(cur);
      return out;
    });
  }
  function inferCat(name,type){
    var s = norm(name);
    if(type === 'work'){
      if(/штроб|резк|алмаз/.test(s)) return 'Алмазная резка';
      if(/подрозет|коронк|сверл|бурен/.test(s)) return 'Высверливание подрозетников';
      if(/щит|автомат|узо|диф|сборк/.test(s)) return 'Щитовое';
      if(/демонтаж/.test(s)) return 'Демонтаж';
      if(/свет|люстр|бра|светильн|лента/.test(s)) return 'Освещение';
      return 'Работы';
    }
    if(/ввг|кабел|провод|пугв|utp|ftp|тв|tv|sat/.test(s)) return 'Кабель';
    if(/гофр|труб|пнд|пвх/.test(s)) return 'Трубы';
    if(/автомат|узо|диф|узм|уздп|реле|контактор|выключатель нагрузки/.test(s)) return 'Автоматика';
    if(/щит|бокс|корпус|din|дин|рейк|шина|гребен|клемм|ншви|маркиров/.test(s)) return 'Щитовое';
    if(/розет|выключател|рамк|механизм|терморег/.test(s)) return 'Чистовое';
    if(/подрозет|короб|клемм|скоб|хомут|дюбел|саморез|смес|алебастр|изолент/.test(s)) return 'Расходники';
    return 'Разное';
  }
  function inferSub(name,cat,type){
    var s = norm(name);
    if(type === 'work'){
      if(/бетон/.test(s)) return 'Бетон';
      if(/кирпич/.test(s)) return 'Кирпич';
      if(/монолит|панел/.test(s)) return 'Панель / монолит';
      return cat || 'Работы';
    }
    if(/c\s*\d+|с\s*\d+|автомат/.test(s)) return 'Автоматы';
    if(/диф/.test(s)) return 'ДИФы';
    if(/узо/.test(s)) return 'УЗО';
    if(/узм|реле напряж/.test(s)) return 'УЗМ / реле напряжения';
    if(/контактор/.test(s)) return 'Контакторы';
    if(/ввг/.test(s)) return 'ВВГ';
    if(/пугв/.test(s)) return 'ПуГВ';
    if(/utp|ftp/.test(s)) return 'UTP / FTP';
    if(/подрозет/.test(s)) return 'Подрозетники';
    if(/клемм|wago/.test(s)) return 'Клеммники';
    if(/гребен/.test(s)) return 'Гребёнки';
    if(/шин/.test(s)) return 'Шинки / клеммники';
    if(/din|дин|рейк/.test(s)) return 'DIN-рейки / ограничители';
    if(/щит|бокс|корпус/.test(s)) return 'Корпуса';
    return 'Разное';
  }
  function normItem(raw,type,idx){
    raw = raw || {};
    var n = cleanText(raw.n || raw.name || raw.title || raw.имя || raw.наименование || raw['Наименование'] || raw['Название'] || raw['Имя']);
    if(!n) return null;
    var c = cleanText(raw.c || raw.category || raw.cat || raw.категория || raw['Категория']) || inferCat(n,type);
    var sc = cleanText(raw.sc || raw.g || raw.subcategory || raw.group || raw.подкатегория || raw['Подкатегория'] || raw['Группа']) || inferSub(n,c,type);
    var p = money(raw.p != null ? raw.p : (raw.price != null ? raw.price : (raw.цена != null ? raw.цена : raw['Цена'])));
    var u = cleanText(raw.u || raw.unit || raw.ед || raw['Ед.'] || raw['Единица'] || raw['Ед. изм.']) || 'шт';
    return { id: raw.id || ((type === 'work' ? 'w' : 'm') + '_imp_' + Date.now() + '_' + idx), n:n, c:c, sc:sc, g:sc, p:p, u:u };
  }
  function rowsToItems(rows,type){
    rows = rows || [];
    var header = null, currentCat = '', currentSub = '', out = [];
    function cell(row,i){ return cleanText((row || [])[i]); }
    rows.forEach(function(row,ri){
      row = (row || []).map(function(v){ return cleanText(v); });
      var non = row.filter(Boolean);
      if(!non.length) return;
      var joined = norm(non.join(' '));
      if(/наимен|назван|имя|цена|стоим|ед/.test(joined) && !header){
        header = {};
        row.forEach(function(v,i){ var s = norm(v); if(/наимен|назван|имя|позиция|товар|работ/.test(s)) header.name=i; if(/категор/.test(s) && header.cat == null) header.cat=i; if(/подкат|группа/.test(s)) header.sub=i; if(/цена|стоим|прайс/.test(s)) header.price=i; if(/ед|изм/.test(s)) header.unit=i; });
        return;
      }
      var priceIdx = -1, unitIdx = -1;
      row.forEach(function(v,i){ if(priceIdx < 0 && money(v) > 0 && /^[-\d\s.,]+/.test(v)) priceIdx = i; if(unitIdx < 0 && /^(шт|м|м\.п\.?|пог\.м|уп|упак|компл|кг|л|рул|бухта)$/i.test(v)) unitIdx = i; });
      if(header){
        var n = cell(row, header.name);
        if(n){
          out.push(normItem({n:n, c:cell(row, header.cat), sc:cell(row, header.sub), p:cell(row, header.price), u:cell(row, header.unit)}, type, out.length));
        }
        return;
      }
      if(priceIdx < 0 && non.length <= 2){
        var title = non.join(' ');
        if(type === 'work' || /работ|монтаж|штроб|резк|сверл|демонтаж/i.test(title)) { currentCat = title; currentSub = ''; }
        else if(!currentCat) currentCat = title; else currentSub = title;
        return;
      }
      var candidates = row.map(function(v,i){ return {v:v,i:i}; }).filter(function(x){ return x.v && x.i !== priceIdx && x.i !== unitIdx && !/^[-\d\s.,]+$/.test(x.v); });
      if(!candidates.length) return;
      candidates.sort(function(a,b){ return b.v.length - a.v.length; });
      var name = candidates[0].v;
      if(name.length < 3) return;
      out.push(normItem({n:name, c:currentCat || inferCat(name,type), sc:currentSub || inferSub(name,currentCat,type), p:priceIdx >= 0 ? row[priceIdx] : 0, u:unitIdx >= 0 ? row[unitIdx] : 'шт'}, type, out.length));
    });
    return out.filter(Boolean);
  }
  function jsonToItems(raw,type){
    if(raw && raw.matDB && type === 'mat') raw = raw.matDB;
    else if(raw && raw.workDB && type === 'work') raw = raw.workDB;
    else if(raw && Array.isArray(raw.items)) raw = raw.items;
    else if(raw && raw.data && Array.isArray(raw.data)) raw = raw.data;
    else if(raw && typeof raw === 'object' && !Array.isArray(raw)) raw = Object.keys(raw).map(function(k){ return raw[k]; });
    if(!Array.isArray(raw)) raw = [];
    return raw.map(function(x,i){ return normItem(x,type,i); }).filter(Boolean);
  }
  function selectedCount(){
    var st = window.EP_DB_REVIEW_V6;
    return (st.items || []).reduce(function(n,_,i){ return n + (st.selected[i] !== false ? 1 : 0); },0);
  }
  function saveVisibleEdits(){
    var st = window.EP_DB_REVIEW_V6;
    var start = (st.page || 0) * PAGE_SIZE;
    var end = Math.min(start + PAGE_SIZE, st.items.length);
    for(var i=start;i<end;i++){
      var item = st.items[i] || {};
      var ch = $('ep-db-check-' + i);
      if(ch) st.selected[i] = !!ch.checked;
      var n = $('ep-db-name-' + i), c = $('ep-db-cat-' + i), sc = $('ep-db-subcat-' + i), p = $('ep-db-price-' + i), u = $('ep-db-unit-' + i);
      if(n || c || sc || p || u){
        st.editCache[i] = {
          n: n ? n.value : item.n,
          c: c ? c.value : item.c,
          sc: sc ? sc.value : (item.sc || item.g || 'Разное'),
          p: p ? p.value : item.p,
          u: u ? u.value : item.u
        };
      }
    }
  }
  function renderReviewPage(){
    var st = window.EP_DB_REVIEW_V6;
    window.EP_DB_REVIEW = { type: st.type, items: st.items, source: st.source };
    var title = $('ep-db-ai-review-title');
    if(title) title.innerText = 'Импорт ' + (st.type === 'work' ? 'работ' : 'материалов') + ': ' + (st.source || 'файл');
    var list = $('ep-db-ai-review-list');
    if(!list) return;
    var total = st.items.length;
    if(!total){
      list.innerHTML = '<div style="padding:12px;color:var(--danger);font-weight:800;">Позиции не найдены. Проверьте файл или попробуйте импортировать другой формат.</div>';
      return;
    }
    var pages = Math.max(1, Math.ceil(total / PAGE_SIZE));
    st.page = Math.max(0, Math.min(st.page || 0, pages - 1));
    var start = st.page * PAGE_SIZE;
    var end = Math.min(start + PAGE_SIZE, total);
    var html = '<div style="position:sticky;top:0;z-index:2;background:var(--card-bg,rgba(255,255,255,.95));padding:8px;border-radius:12px;margin-bottom:8px;border:1px solid var(--border);">' +
      '<b>Найдено: ' + total + '</b> • выбрано: <b id="ep-v6-selected-count">' + selectedCount() + '</b><br>' +
      '<span style="font-size:11px;color:var(--gray);">Показаны строки ' + (start+1) + '–' + end + ' из ' + total + '. Большой файл не грузится весь на экран, поэтому телефон не зависает.</span>' +
      '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:8px;">' +
      '<button type="button" class="btn-info" onclick="epReviewPageV6(-1)" ' + (st.page<=0?'disabled':'') + '>← Назад</button>' +
      '<button type="button" class="btn-info" onclick="epReviewPageV6(1)" ' + (st.page>=pages-1?'disabled':'') + '>Вперёд →</button>' +
      '</div></div>';
    for(var i=start;i<end;i++){
      var it = st.items[i] || {};
      var ed = st.editCache[i] || it;
      html += '<div class="ep-db-review-row">' +
        '<input type="checkbox" id="ep-db-check-' + i + '" ' + (st.selected[i] !== false ? 'checked' : '') + ' onchange="epReviewToggleV6(' + i + ', this.checked)">' +
        '<div class="ep-db-review-fields">' +
          '<div><label>Имя</label><input id="ep-db-name-' + i + '" value="' + esc(ed.n || '') + '" placeholder="Имя / наименование"></div>' +
          '<div class="ep-db-review-2col">' +
            '<div><label>Категория</label><input id="ep-db-cat-' + i + '" value="' + esc(ed.c || 'Разное') + '" placeholder="Категория"></div>' +
            '<div><label class="ep-db-subcat-label">Подкатегория</label><input id="ep-db-subcat-' + i + '" value="' + esc(ed.sc || ed.g || 'Разное') + '" placeholder="Подкатегория"></div>' +
          '</div>' +
          '<div class="ep-db-review-2col">' +
            '<div><label>Цена за единицу</label><input id="ep-db-price-' + i + '" type="number" step="0.01" value="' + (Number(ed.p)||0) + '" placeholder="Цена"></div>' +
            '<div><label>Единица</label><input id="ep-db-unit-' + i + '" value="' + esc(ed.u || 'шт') + '" placeholder="шт / м / упак"></div>' +
          '</div>' +
        '</div></div>';
    }
    list.innerHTML = html;
    setTimeout(hardHideLoader, 0);
  }
  window.epReviewToggleV6 = function(i,val){ window.EP_DB_REVIEW_V6.selected[i] = !!val; var el = $('ep-v6-selected-count'); if(el) el.textContent = selectedCount(); };
  window.epReviewPageV6 = function(delta){ saveVisibleEdits(); window.EP_DB_REVIEW_V6.page += delta; renderReviewPage(); };
  window.epReviewCheckAll = function(checked){
    var st = window.EP_DB_REVIEW_V6;
    (st.items || []).forEach(function(_,i){ st.selected[i] = !!checked; });
    renderReviewPage();
  };
  function showReview(items,type,source){
    hardHideLoader();
    items = unique((items || []).filter(Boolean), type);
    var selected = {};
    items.forEach(function(_,i){ selected[i] = true; });
    window.EP_DB_REVIEW_V6 = { type:type, items:items, source:source || '', page:0, selected:selected, editCache:{} };
    window.EP_DB_REVIEW = { type:type, items:items, source:source || '' };
    renderReviewPage();
    try{ if(typeof openModal === 'function') openModal('ep-db-ai-review-modal'); }catch(e){ var m=$('ep-db-ai-review-modal'); if(m) m.style.display='flex'; }
    setTimeout(hardHideLoader, 20);
  }
  async function aiFromImage(file,type){
    if(typeof window.epAskAI !== 'function') throw new Error('ИИ не подключён');
    var dataUrl = await new Promise(function(resolve,reject){ var r = new FileReader(); r.onload=function(){resolve(r.result);}; r.onerror=reject; r.readAsDataURL(file); });
    showReadLoader('ИИ читает изображение...', '👁️');
    var prompt = 'Распознай таблицу для базы электрика. Верни строго JSON массив объектов [{"n":"Имя позиции","c":"Категория","sc":"Подкатегория","p":123,"u":"шт"}]. Если цены нет p=0. Без текста вокруг.';
    var ans = await window.epAskAI(prompt, { imageDataUrl:dataUrl, imageDetail:'high', maxTokens:9000 });
    var arr = [];
    try{ var m = String(ans || '').match(/\[[\s\S]*\]/); arr = JSON.parse(m ? m[0] : ans); }catch(e){ arr = []; }
    return jsonToItems(arr,type);
  }
  async function aiFromText(txt,type){
    if(typeof window.epAskAI !== 'function') throw new Error('ИИ не подключён');
    showReadLoader('ИИ структурирует базу...', '🤖');
    var prompt = 'Приведи данные к базе электрика. Верни строго JSON массив объектов [{"n":"Имя позиции","c":"Категория","sc":"Подкатегория","p":123,"u":"шт"}]. Данные: ' + String(txt || '').slice(0,90000);
    var ans = await window.epAskAI(prompt, { maxTokens:8000 });
    var arr = [];
    try{ var m = String(ans || '').match(/\[[\s\S]*\]/); arr = JSON.parse(m ? m[0] : ans); }catch(e){ arr = []; }
    return jsonToItems(arr,type);
  }
  async function readDbFileV6(file,type){
    var safety = setTimeout(hardHideLoader, 25000);
    showReadLoader('Читаю файл...', '📥');
    try{
      var name = file.name || '';
      var lower = name.toLowerCase();
      var items = [];
      if(file.type && file.type.indexOf('image/') === 0){
        items = await aiFromImage(file,type);
      } else if(/\.json$/i.test(lower)){
        var txt = await fileText(file);
        items = jsonToItems(JSON.parse(txt), type);
      } else if(/\.(xlsx|xls)$/i.test(lower)){
        if(!window.XLSX) throw new Error('Библиотека XLSX не загрузилась. Сохраните файл как CSV или JSON.');
        var ab = await fileBuffer(file);
        var wb = XLSX.read(ab, {type:'array'});
        var rows = [];
        wb.SheetNames.forEach(function(sh){
          var ws = wb.Sheets[sh];
          rows = rows.concat(XLSX.utils.sheet_to_json(ws, {header:1, defval:''}));
        });
        items = rowsToItems(rows,type);
      } else if(/\.csv$/i.test(lower)){
        items = rowsToItems(csvRows(await fileText(file)), type);
      } else {
        var raw = await fileText(file);
        items = rowsToItems(csvRows(raw), type);
        if(!items.length) items = await aiFromText(raw,type);
      }
      clearTimeout(safety);
      hardHideLoader();
      showReview(items,type,name);
    }catch(e){
      clearTimeout(safety);
      hardHideLoader();
      toast('❌ ' + (e.message || 'Ошибка импорта'));
      console.error('EP V6 import error', e);
    }
  }
  window.epTriggerDbFileImport = function(type){
    type = type === 'work' ? 'work' : 'mat';
    if(!isAdmin()){
      setScope('my');
      syncMainArrays('my');
      rerender();
      toast('Импорт мастера будет сохранён в 👤 Моя база');
    }
    var input = $('ep-db-file-input');
    if(!input){ if(typeof oldTrigger === 'function') return oldTrigger(type); return; }
    input.value = '';
    input.onchange = function(e){ var file = e.target.files && e.target.files[0]; if(file) readDbFileV6(file,type); };
    input.click();
  };
  window.epRunTextImport = async function(){
    var text = (($('ep-text-import-value') || {}).value) || '';
    var type = ((window.EP_DB_REVIEW || {}).type === 'work') ? 'work' : 'mat';
    try{ if(typeof closeModal === 'function') closeModal('ep-text-import-modal'); }catch(e){}
    try{
      showReadLoader('Читаю текст...', '📝');
      var items = rowsToItems(csvRows(text), type);
      if(!items.length) items = await aiFromText(text,type);
      hardHideLoader();
      showReview(items,type,'текст');
    }catch(e){ hardHideLoader(); toast('❌ ' + (e.message || 'Ошибка импорта текста')); }
  };
  function collectReviewed(){
    saveVisibleEdits();
    var st = window.EP_DB_REVIEW_V6;
    var type = st.type === 'work' ? 'work' : 'mat';
    var out = [];
    (st.items || []).forEach(function(base,i){
      if(st.selected[i] === false) return;
      var ed = st.editCache[i] || base || {};
      var it = normItem({
        id: base.id,
        n: ed.n || base.n,
        c: ed.c || base.c,
        sc: ed.sc || ed.g || base.sc || base.g,
        p: ed.p != null ? ed.p : base.p,
        u: ed.u || base.u
      }, type, i);
      if(it){ try{ if(typeof window.epAutoGroupItem === 'function') it = window.epAutoGroupItem(type,it); }catch(e){} out.push(it); }
    });
    return {type:type, items:out};
  }
  window.epApplyReviewedDbItems = async function(mode){
    var data = collectReviewed();
    var type = data.type;
    var items = data.items;
    if(!items.length) return toast('Нет выбранных позиций');
    showReadLoader('Сохраняю базу...', '💾');
    try{
      var target = getScope();
      if(!isAdmin()){
        target = 'my';
        setScope('my');
      }
      if(target === 'global'){
        var g = getServer(type);
        items.forEach(function(it){ g = upsert(g,type,it,mode); });
        setServer(type,g);
        await saveServerRemote();
        toast('✅ Импорт добавлен в базу сервера: ' + items.length + ' поз.');
      } else {
        var a = getMy(type);
        items.forEach(function(it){ a = upsert(a,type,it,mode); });
        setMy(type,a);
        var saved = await saveMyRemote();
        syncMainArrays('my');
        toast('✅ Импорт сохранён в моей базе: ' + items.length + ' поз.' + (saved ? '' : ' Сервер не подтвердил сохранение, но на этом телефоне база отображается.'));
      }
      try{ if(typeof closeModal === 'function') closeModal('ep-db-ai-review-modal'); }catch(e){}
      rerender();
    }catch(e){
      toast('❌ ' + (e.message || 'Ошибка сохранения'));
      console.error('EP V6 apply error', e);
    }finally{
      hardHideLoader();
    }
  };
  document.addEventListener('DOMContentLoaded', function(){ setTimeout(hardHideLoader, 1200); });
})();
