/*
 * Extracted from public/index.html
 * Original script block: 8
 * Original HTML lines: 4873-5226
 */

/* === SURGICAL FIX 2026-05-13: global add/upsert + smart swap filter === */
(function(){
  function qs(id){ return document.getElementById(id); }
  function toast(msg){ if(typeof showToast === 'function') showToast(msg); else alert(msg); }
  function safe(s){
    return String(s == null ? '' : s).replace(/[&<>"]/g, function(m){
      return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[m];
    });
  }
  function norm(s){
    return String(s || '')
      .toLowerCase()
      .replace(/ё/g,'е')
      .replace(/×/g,'x')
      .replace(/с/g,'c')
      .replace(/а/g,'a')
      .replace(/в/g,'b')
      .replace(/[^a-zа-я0-9]+/g,' ')
      .trim();
  }

  function localArr(type){
    try{
      var arr = type === 'work' ? workDB : matDB;
      if(!Array.isArray(arr)) arr = [];
      if(type === 'mat' && !arr.length && typeof FULL_MAT_INIT !== 'undefined') { matDB = (FULL_MAT_INIT || []).slice(); arr = matDB; }
      if(type === 'work' && !arr.length && typeof FULL_WORK_INIT !== 'undefined') { workDB = (FULL_WORK_INIT || []).slice(); arr = workDB; }
      return arr;
    }catch(e){ return []; }
  }
  function setLocalArr(type, arr){
    try{ if(type === 'work') workDB = arr || []; else matDB = arr || []; }catch(e){}
  }

  function getGroup(it){ return (it && (it.g || it.sc || it.subcategory || it.group)) || ''; }
  function itemKey(type, it){
    if(!it) return '';
    if(it.id) return 'id:' + String(it.id);
    return 'sig:' + type + '|' + norm([it.c,getGroup(it),it.n,it.u].filter(Boolean).join('|'));
  }
  function sigKey(type, it){
    return 'sig:' + type + '|' + norm([it && it.c, getGroup(it), it && it.n, it && it.u].filter(Boolean).join('|'));
  }
  function deletedSet(type){
    try{
      var k = type === 'work' ? 'ep_deleted_work_ids_local_v1' : 'ep_deleted_mat_ids_local_v1';
      return new Set(JSON.parse(localStorage.getItem(k) || '[]'));
    }catch(e){ return new Set(); }
  }
  function saveLocalDb(){
    try{
      if(typeof safeSet === 'function'){
        safeSet('user_db_mat_v31', JSON.stringify(localArr('mat')));
        safeSet('user_db_work_v31', JSON.stringify(localArr('work')));
      } else {
        localStorage.setItem('user_db_mat_v31', JSON.stringify(localArr('mat')));
        localStorage.setItem('user_db_work_v31', JSON.stringify(localArr('work')));
      }
    }catch(e){}
    try{
      if(typeof db !== 'undefined' && db && typeof appUser !== 'undefined' && appUser && appUser.uid){
        db.collection('user_db').doc(appUser.uid).set({
          uid: appUser.uid,
          name: appUser.name || appUser.email || '',
          matDB: localArr('mat'),
          workDB: localArr('work'),
          updatedAt: new Date().toISOString()
        }, { merge:true });
      }
    }catch(e){}
  }

  window.EP_GLOBAL_DB_VISIBLE_CACHE = window.EP_GLOBAL_DB_VISIBLE_CACHE || { matDB: [], workDB: [], loadedAt: 0 };
  window.EP_GLOBAL_DB_TAB_FIXED = window.EP_GLOBAL_DB_TAB_FIXED || 'mat';

  async function loadGlobalDb(force){
    if(!force && window.EP_GLOBAL_DB_VISIBLE_CACHE.loadedAt && Date.now() - window.EP_GLOBAL_DB_VISIBLE_CACHE.loadedAt < 12000){
      return window.EP_GLOBAL_DB_VISIBLE_CACHE;
    }
    var cache = { matDB: [], workDB: [], loadedAt: Date.now() };
    try{
      if(typeof db !== 'undefined' && db){
        var doc = await db.collection('settings').doc('global_db').get();
        if(doc.exists){
          var d = doc.data() || {};
          cache.matDB = Array.isArray(d.matDB) ? d.matDB : [];
          cache.workDB = Array.isArray(d.workDB) ? d.workDB : [];
        }
      }
    }catch(e){ console.warn('global_db read error', e); }
    if(!cache.matDB.length) cache.matDB = localArr('mat').slice();
    if(!cache.workDB.length) cache.workDB = localArr('work').slice();
    window.EP_GLOBAL_DB_VISIBLE_CACHE = cache;
    return cache;
  }

  function mergedArr(type){
    var local = localArr(type).map(function(x){ return Object.assign({}, x, {__src:'local'}); });
    var cache = window.EP_GLOBAL_DB_VISIBLE_CACHE || {};
    var global = (type === 'work' ? (cache.workDB || []) : (cache.matDB || [])).map(function(x){ return Object.assign({}, x, {__src:'global'}); });
    var del = deletedSet(type);
    var map = new Map();

    local.forEach(function(it){
      var k1 = itemKey(type,it), k2 = sigKey(type,it);
      if(del.has(k1) || del.has(k2)) return;
      map.set(k2, it);
    });
    global.forEach(function(it){
      var k1 = itemKey(type,it), k2 = sigKey(type,it);
      if(del.has(k1) || del.has(k2)) return;
      if(!map.has(k2)) map.set(k2, it);
    });
    return Array.from(map.values());
  }

  function groupHtml(arr, type, prefix, mode){
    var data = {};
    (arr || []).forEach(function(it){
      var c = it.c || 'Разное';
      var g = getGroup(it) || 'Разное';
      if(!data[c]) data[c] = {};
      if(!data[c][g]) data[c][g] = [];
      data[c][g].push(it);
    });
    var html = '', idx = 0;
    Object.keys(data).sort(function(a,b){return a.localeCompare(b,'ru');}).forEach(function(c){
      var cid = prefix + '_c_' + (idx++);
      var catStyle = type === 'work' ? 'style="color:var(--orange);background:rgba(245,158,11,.08);"' : '';
      html += '<div class="cat-header" '+catStyle+' onclick="toggleCat(\''+cid+'\')">'+safe(c)+'</div><div class="cat-body" id="'+cid+'">';
      Object.keys(data[c]).sort(function(a,b){return a.localeCompare(b,'ru');}).forEach(function(g){
        var gid = prefix + '_g_' + (idx++);
        html += '<div class="ep-db-sub-header" onclick="epToggleSmartSub(\''+gid+'\', event)"><span>'+safe(g)+'</span><small>открыть</small></div><div class="ep-db-sub-body" id="'+gid+'">';
        data[c][g].sort(function(a,b){return String(a.n||'').localeCompare(String(b.n||''),'ru');}).forEach(function(it){
          var k = sigKey(type,it);
          var src = it.__src === 'global' ? '<span style="color:#8B5CF6;font-weight:900;">🌍 серверная</span>' : '<span style="color:#10B981;font-weight:900;">👤 моя</span>';
          var meta = safe(g) + ' • ' + src + ' • ' + (Number(it.p)||0) + ' ₽ / ' + safe(it.u || 'шт');
          if(mode === 'global'){
            html += '<label class="mat-item ep-select-row">' +
              '<input type="checkbox" class="ep-global-check" data-key="'+safe(k)+'" data-type="'+type+'" style="width:22px;height:22px;accent-color:var(--primary);">' +
              '<div style="flex:1;"><div class="ep-db-item-title">'+safe(it.n || 'Позиция')+'</div><div class="ep-db-item-meta">'+meta+'</div></div></label>';
          } else {
            var color = type === 'work' ? 'background:var(--orange);' : '';
            html += '<div class="mat-item"><div style="flex:1;"><div class="ep-db-item-title">'+safe(it.n || 'Позиция')+'</div><div class="ep-db-item-meta">'+meta+'</div></div>' +
              '<button class="mat-add-btn" style="'+color+'width:auto;margin:0;" onclick="promptAdd(\''+safe(k)+'\', \''+type+'\')">+ Добавить</button></div>';
          }
        });
        html += '</div>';
      });
      html += '</div>';
    });
    return html || '<div style="padding:15px;color:var(--gray);font-weight:700;">Позиции не найдены</div>';
  }
  window.epToggleSmartSub = function(id,e){ if(e) e.stopPropagation(); var el = qs(id); if(el) el.classList.toggle('active'); };

  window.epOpenGlobalDbModal = async function(){
    if(typeof showLoader === 'function') showLoader('Загрузка базы сервера...', '🌍');
    await loadGlobalDb(true);
    if(typeof hideLoader === 'function') hideLoader();
    window.EP_GLOBAL_DB_TAB_FIXED = 'mat';
    renderGlobalModalFixed();
    if(typeof openModal === 'function') openModal('globalDbModal');
  };
  window.epSwitchGlobalDbTab = function(type){
    window.EP_GLOBAL_DB_TAB_FIXED = type === 'work' ? 'work' : 'mat';
    renderGlobalModalFixed();
  };
  window.epGlobalSelectAll = function(flag){
    document.querySelectorAll('#ep-global-db-list .ep-global-check').forEach(function(ch){ ch.checked = !!flag; });
  };
  function renderGlobalModalFixed(){
    var type = window.EP_GLOBAL_DB_TAB_FIXED || 'mat';
    var matBtn = qs('ep-global-tab-mat'), workBtn = qs('ep-global-tab-work');
    if(matBtn) matBtn.classList.toggle('active', type === 'mat');
    if(workBtn) workBtn.classList.toggle('active', type === 'work');
    var list = qs('ep-global-db-list');
    if(!list) return;
    var cache = window.EP_GLOBAL_DB_VISIBLE_CACHE || {};
    var arr = (type === 'work' ? (cache.workDB || []) : (cache.matDB || [])).map(function(x){ return Object.assign({}, x, {__src:'global'}); });
    list.innerHTML = groupHtml(arr, type, 'global_fixed_'+type, 'global');
  }

  window.epAddSelectedGlobalToMyDb = async function(){
    var type = window.EP_GLOBAL_DB_TAB_FIXED || 'mat';
    var checks = Array.from(document.querySelectorAll('#ep-global-db-list .ep-global-check:checked'));
    if(!checks.length) return toast('Выберите позиции');

    var cache = await loadGlobalDb(false);
    var src = (type === 'work' ? (cache.workDB || []) : (cache.matDB || []));
    var bySig = new Map(src.map(function(it){ return [sigKey(type,it), it]; }));
    var local = localArr(type).slice();

    var added = 0, updated = 0;
    checks.forEach(function(ch){
      var it = bySig.get(ch.dataset.key);
      if(!it) return;
      var copy = Object.assign({}, it, {__src: undefined});
      var sKey = sigKey(type, copy);
      var idx = local.findIndex(function(x){ return sigKey(type,x) === sKey || (x.id && copy.id && String(x.id) === String(copy.id)); });
      if(idx >= 0){
        local[idx] = Object.assign({}, local[idx], copy, { id: local[idx].id || copy.id });
        updated++;
      } else {
        local.push(copy);
        added++;
      }
    });

    setLocalArr(type, local);
    saveLocalDb();

    await loadGlobalDb(true);
    if(typeof renderDbEditors === 'function') renderDbEditors();
    if(type === 'mat' && qs('mat-cat-list')) qs('mat-cat-list').innerHTML = groupHtml(mergedArr('mat'), 'mat', 'cat_mat_after_global', 'catalog');
    if(type === 'work' && qs('work-cat-list')) qs('work-cat-list').innerHTML = groupHtml(mergedArr('work'), 'work', 'cat_work_after_global', 'catalog');

    toast('✅ В мою базу: добавлено ' + added + ', обновлено ' + updated);
  };

  window.openMatCatalog = async function(){
    var el = qs('mat-cat-list');
    if(el) el.innerHTML = '<div style="padding:15px;color:var(--gray);font-weight:700;">Загружаю мою и базу сервера...</div>';
    if(typeof openModal === 'function') openModal('matCatModal');
    await loadGlobalDb(true);
    if(el) el.innerHTML = groupHtml(mergedArr('mat'), 'mat', 'cat_mat_smart', 'catalog');
  };
  window.openWorkCatalog = async function(){
    var el = qs('work-cat-list');
    if(el) el.innerHTML = '<div style="padding:15px;color:var(--gray);font-weight:700;">Загружаю мою и базу сервера...</div>';
    if(typeof openModal === 'function') openModal('workModal');
    await loadGlobalDb(true);
    if(el) el.innerHTML = groupHtml(mergedArr('work'), 'work', 'cat_work_smart', 'catalog');
  };

  var oldPromptAddSmart = window.promptAdd;
  window.promptAdd = function(keyOrId, type){
    var arr = mergedArr(type);
    var item = arr.find(function(x){ return sigKey(type,x) === keyOrId || itemKey(type,x) === keyOrId || String(x.id||'') === String(keyOrId); });
    if(!item && typeof oldPromptAddSmart === 'function') return oldPromptAddSmart(keyOrId, type);
    if(!item) return toast('Позиция не найдена');
    pendingAdd = { item:item, type:type };
    var name = qs('qty-prompt-name'), qty = qs('qty-input');
    if(name) name.innerText = item.n || 'Позиция';
    if(qty) qty.value = 1;
    if(typeof openModal === 'function') openModal('qtyPromptModal');
  };

  function classify(it){
    var meta = (it && it.dbMeta) || {};
    var n = norm([it && it.n, it && it.c, getGroup(it), meta.kind, meta.category, meta.subcategory].filter(Boolean).join(' '));
    var raw = String((it && it.n) || '');
    if(meta.kind) {
      var k = String(meta.kind).toLowerCase();
      if(k.indexOf('dif') >= 0) return 'dif';
      if(k.indexOf('uzo') >= 0) return 'uzo';
      if(k.indexOf('automatic') >= 0 || k.indexOf('breaker') >= 0) return 'auto';
      if(k.indexOf('voltage') >= 0) return 'voltage_relay';
      if(k.indexOf('contactor') >= 0) return 'contactor';
    }
    if(/диф/i.test(raw) || n.indexOf('диф') >= 0) return 'dif';
    if(/узо/i.test(raw) || n.indexOf('узо') >= 0) return 'uzo';
    if(/уздп|дугов/i.test(raw) || n.indexOf('уздп') >= 0) return 'uzdp';
    if(/узм|реле напряж/i.test(raw) || n.indexOf('реле напряж') >= 0) return 'voltage_relay';
    if(/реле времени/i.test(raw) || n.indexOf('реле времени') >= 0) return 'time_relay';
    if(/контактор/i.test(raw) || n.indexOf('контактор') >= 0) return 'contactor';
    if(/автомат|(^|\s)[abcdсавд]\s?\d{1,3}(\s|$)/i.test(raw) || /\bc\s?\d{1,3}\b/.test(n)) return 'auto';
    if(/кабель|ввг|провод|пугв|utp|ftp|нг/i.test(raw) || n.indexOf('кабель') >= 0 || n.indexOf('ввг') >= 0) return 'cable';
    if(/щит|корпус|бокс/i.test(raw) || n.indexOf('корпус') >= 0) return 'shield_box';
    if(/греб/i.test(raw)) return 'comb';
    if(/ншви|наконеч/i.test(raw)) return 'lug';
    if(/шин|клемм/i.test(raw)) return 'bus';
    if(/din|дин|рейк|огранич/i.test(raw)) return 'din';
    if(/маркир|бирк/i.test(raw)) return 'marking';
    if((it && it.type) === 'work') return 'work:' + norm([(it.c||''), getGroup(it)].join('|'));
    return 'other:' + norm([(it && it.c) || '', getGroup(it)].join('|'));
  }

  function sameSwapClass(current, cand){
    var c1 = classify(current);
    var c2 = classify(cand);
    if(c1 === c2) return true;

    if(c1 === 'cable') return c2 === 'cable';
    if(c1 === 'auto') return c2 === 'auto';
    if(c1 === 'dif') return c2 === 'dif';
    if(c1 === 'uzo') return c2 === 'uzo';
    if(['uzdp','voltage_relay','time_relay','contactor'].indexOf(c1) >= 0) return c2 === c1;

    if(String(c1).indexOf('work:') === 0 && String(c2).indexOf('work:') === 0) {
      return c1 === c2 || c1.split('|')[0] === c2.split('|')[0];
    }
    return false;
  }

  function swapLabel(it){
    var src = it.__src === 'global' ? '🌍' : '👤';
    return src + ' ' + (it.n || 'Позиция') + ' (' + (Number(it.p)||0) + ' ₽)';
  }

  window.EP_SWAP_CANDIDATES_SMART = [];
  window.openSwapModal = async function(idx){
    swapTargetIdx = idx;
    var current = currentEstimate[idx];
    if(!current) return;
    var type = current.type === 'work' ? 'work' : 'mat';

    var sel = qs('swap-select');
    if(sel) sel.innerHTML = '<option>Загрузка вариантов...</option>';
    if(typeof openModal === 'function') openModal('swapModal');

    await loadGlobalDb(true);
    var pool = mergedArr(type);
    var candidates = pool.filter(function(x){ return sameSwapClass(current, x); });

    if(!candidates.length) {
      var cg = norm([current.c || '', (current.dbMeta && current.dbMeta.category) || '', (current.dbMeta && current.dbMeta.subcategory) || ''].join(' '));
      candidates = pool.filter(function(x){ return norm([x.c || '', getGroup(x)].join(' ')).indexOf(cg) >= 0; });
    }

    window.EP_SWAP_CANDIDATES_SMART = candidates;
    if(!sel) return;
    if(!candidates.length) {
      sel.innerHTML = '<option value="">Нет подходящих вариантов</option>';
      return;
    }
    sel.innerHTML = candidates.map(function(x, i){
      return '<option value="'+i+'" '+(x.n === current.n ? 'selected' : '')+'>'+safe(swapLabel(x))+'</option>';
    }).join('');
  };

  window.applySwap = function(){
    if(swapTargetIdx < 0) return;
    var sel = qs('swap-select');
    if(!sel || sel.value === '') return toast('Нет выбранной позиции');
    var item = window.EP_SWAP_CANDIDATES_SMART[Number(sel.value)];
    if(!item) return toast('Позиция не найдена');

    currentEstimate[swapTargetIdx].n = item.n;
    currentEstimate[swapTargetIdx].p = Number(item.p) || 0;
    currentEstimate[swapTargetIdx].u = item.u || currentEstimate[swapTargetIdx].u || 'шт';
    currentEstimate[swapTargetIdx].sourceId = item.id || null;
    currentEstimate[swapTargetIdx].dbMeta = Object.assign({}, currentEstimate[swapTargetIdx].dbMeta || {}, {
      category: item.c || '',
      subcategory: getGroup(item),
      kind: item.kind || ''
    });

    if(typeof renderMainTable === 'function') renderMainTable();
    if(typeof closeModal === 'function') closeModal('swapModal');
    toast('✅ Заменено');
  };
})();
