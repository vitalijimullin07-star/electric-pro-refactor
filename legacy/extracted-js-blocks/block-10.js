/*
 * Extracted from public/index.html
 * Original script block: 10
 * Original HTML lines: 5659-6199
 */

/* === ULTIMATE DB VISIBILITY FIX 2026-05-13: global visible everywhere + local master edit === */
(function(){
  function $(id){ return document.getElementById(id); }
  function toast(t){ if(typeof showToast === 'function') showToast(t); else alert(t); }
  function esc(s){
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
  function encodeItem(it){
    try { return encodeURIComponent(JSON.stringify(it || {})); } catch(e){ return ''; }
  }
  function decodeItem(v){
    try { return JSON.parse(decodeURIComponent(v || '{}')); } catch(e){ return null; }
  }
  function groupOf(it){ return (it && (it.g || it.sc || it.subcategory || it.group)) || ''; }
  function sig(type,it){
    return 'sig:' + type + '|' + norm([it && it.c, groupOf(it), it && it.n, it && it.u].filter(Boolean).join('|'));
  }
  function idkey(it){ return it && it.id ? 'id:' + String(it.id) : ''; }
  function delKey(type){ return type === 'work' ? 'ep_deleted_work_ids_local_v1' : 'ep_deleted_mat_ids_local_v1'; }
  function delSet(type){
    try { return new Set(JSON.parse(localStorage.getItem(delKey(type)) || '[]')); } catch(e){ return new Set(); }
  }
  function saveDel(type,set){
    try { localStorage.setItem(delKey(type), JSON.stringify(Array.from(set))); } catch(e){}
  }
  function localDb(type){
    try{
      var arr = type === 'work' ? workDB : matDB;
      if(!Array.isArray(arr)) arr = [];
      if(type === 'mat' && !arr.length && typeof FULL_MAT_INIT !== 'undefined') { matDB = (FULL_MAT_INIT || []).slice(); arr = matDB; }
      if(type === 'work' && !arr.length && typeof FULL_WORK_INIT !== 'undefined') { workDB = (FULL_WORK_INIT || []).slice(); arr = workDB; }
      return arr;
    }catch(e){ return []; }
  }
  function setLocalDb(type, arr){
    try { if(type === 'work') workDB = arr || []; else matDB = arr || []; } catch(e){}
  }
  function stripRuntime(it){
    var x = Object.assign({}, it || {});
    delete x.__src;
    delete x.__encoded;
    return x;
  }

  window.EP_ULTIMATE_DB_CACHE = window.EP_ULTIMATE_DB_CACHE || { matDB: [], workDB: [], ts: 0 };

  async function saveMyDb(){
    try{
      if(typeof safeSet === 'function') {
        safeSet('user_db_mat_v31', JSON.stringify(localDb('mat')));
        safeSet('user_db_work_v31', JSON.stringify(localDb('work')));
      } else {
        localStorage.setItem('user_db_mat_v31', JSON.stringify(localDb('mat')));
        localStorage.setItem('user_db_work_v31', JSON.stringify(localDb('work')));
      }
    }catch(e){}
    try{
      if(typeof db !== 'undefined' && db && typeof appUser !== 'undefined' && appUser && appUser.uid){
        await db.collection('user_db').doc(appUser.uid).set({
          uid: appUser.uid,
          name: appUser.name || appUser.email || '',
          matDB: localDb('mat'),
          workDB: localDb('work'),
          updatedAt: new Date().toISOString()
        }, { merge:true });
      }
    }catch(e){ console.warn('saveMyDb failed', e); }
  }

  function loadCachedGlobalFromStorage(){
    try{
      var raw = localStorage.getItem('ep_global_cache_ultimate_v1');
      if(!raw) return null;
      var d = JSON.parse(raw);
      if(d && (Array.isArray(d.matDB) || Array.isArray(d.workDB))) return {
        matDB: Array.isArray(d.matDB) ? d.matDB : [],
        workDB: Array.isArray(d.workDB) ? d.workDB : [],
        ts: d.ts || Date.now()
      };
    }catch(e){}
    return null;
  }

  async function readGlobal(force){
    if(!force && window.EP_ULTIMATE_DB_CACHE.ts && Date.now() - window.EP_ULTIMATE_DB_CACHE.ts < 6000) return window.EP_ULTIMATE_DB_CACHE;

    var out = { matDB: [], workDB: [], ts: Date.now() };
    var fromStorage = loadCachedGlobalFromStorage();
    if(fromStorage) out = fromStorage;

    try{
      if(typeof db !== 'undefined' && db){
        var doc = await db.collection('settings').doc('global_db').get();
        if(doc.exists){
          var d = doc.data() || {};
          out = {
            matDB: Array.isArray(d.matDB) ? d.matDB : [],
            workDB: Array.isArray(d.workDB) ? d.workDB : [],
            ts: Date.now()
          };
        }
      }
    }catch(e){ console.warn('read global_db failed', e); }

    if(!out.matDB.length) out.matDB = localDb('mat').slice();
    if(!out.workDB.length) out.workDB = localDb('work').slice();

    window.EP_ULTIMATE_DB_CACHE = out;
    window.EP_HARD_GLOBAL_CACHE = out;
    window.EP_GLOBAL_DB_VISIBLE_CACHE = out;
    try { localStorage.setItem('ep_global_cache_ultimate_v1', JSON.stringify(out)); } catch(e){}
    return out;
  }

  function merged(type){
    var local = localDb(type).map(function(x){ return Object.assign({}, x, {__src:'local'}); });
    var global = (type === 'work' ? (window.EP_ULTIMATE_DB_CACHE.workDB || []) : (window.EP_ULTIMATE_DB_CACHE.matDB || []))
      .map(function(x){ return Object.assign({}, x, {__src:'global'}); });
    var del = delSet(type);
    var map = new Map();

    local.forEach(function(it){
      if(del.has(idkey(it)) || del.has(sig(type,it))) return;
      map.set(sig(type,it), it);
    });
    global.forEach(function(it){
      if(del.has(idkey(it)) || del.has(sig(type,it))) return;
      var k = sig(type,it);
      if(!map.has(k)) map.set(k, it);
    });
    return Array.from(map.values());
  }

  function renderItems(arr,type,prefix,mode){
    var data = {};
    (arr || []).forEach(function(it){
      var c = it.c || 'Разное';
      var g = groupOf(it) || 'Разное';
      if(!data[c]) data[c] = {};
      if(!data[c][g]) data[c][g] = [];
      data[c][g].push(it);
    });

    var html = '', n = 0;
    Object.keys(data).sort(function(a,b){return a.localeCompare(b,'ru');}).forEach(function(c){
      var cid = prefix + '_c_' + (n++);
      var catStyle = type === 'work' ? 'style="color:var(--orange);background:rgba(245,158,11,.08);"' : '';
      html += '<div class="cat-header" '+catStyle+' onclick="toggleCat(\''+cid+'\')">'+esc(c)+'</div><div class="cat-body" id="'+cid+'">';
      Object.keys(data[c]).sort(function(a,b){return a.localeCompare(b,'ru');}).forEach(function(g){
        var gid = prefix + '_g_' + (n++);
        html += '<div class="ep-db-sub-header" onclick="epUltimateToggleSub(\''+gid+'\', event)"><span>'+esc(g)+'</span><small>открыть</small></div><div class="ep-db-sub-body" id="'+gid+'">';
        data[c][g].sort(function(a,b){return String(a.n||'').localeCompare(String(b.n||''),'ru');}).forEach(function(it){
          var encoded = encodeItem(it);
          var sk = sig(type,it);
          var src = it.__src === 'global'
            ? '<span style="color:#8B5CF6;font-weight:900;">🌍 серверная</span>'
            : '<span style="color:#10B981;font-weight:900;">👤 моя</span>';
          var meta = esc(g) + ' • ' + src + ' • ' + (Number(it.p)||0) + ' ₽ / ' + esc(it.u || 'шт');

          if(mode === 'global'){
            html += '<label class="mat-item ep-select-row">' +
              '<input type="checkbox" class="ep-global-check" data-type="'+type+'" data-item="'+esc(encoded)+'" data-sig="'+esc(sk)+'" style="width:22px;height:22px;accent-color:var(--primary);">' +
              '<div style="flex:1;"><div class="ep-db-item-title">'+esc(it.n || 'Позиция')+'</div><div class="ep-db-item-meta">'+meta+'</div></div></label>';
          } else if(mode === 'editor'){
            html += '<div class="emp-row" style="align-items:flex-start;">' +
              '<label style="display:flex;gap:8px;align-items:flex-start;flex:1;">' +
              '<input type="checkbox" class="ep-db-delete-check" data-type="'+type+'" data-item="'+esc(encoded)+'" data-sig="'+esc(sk)+'" style="width:22px;height:22px;accent-color:#EF4444;margin-top:4px;">' +
              '<div style="flex:1;"><b>'+esc(it.n || 'Позиция')+'</b><br><span style="color:var(--gray);font-size:10px;">'+meta+'</span></div></label>' +
              '<div class="ep-row-actions">' +
              '<input type="number" value="'+(Number(it.p)||0)+'" onchange="epUltimateEditPrice(\''+type+'\', \''+esc(encoded)+'\', this.value)" style="width:74px;margin:0;padding:4px;text-align:center;">' +
              '<button class="btn-danger" onclick="epUltimateDeleteOne(\''+type+'\', \''+esc(encoded)+'\')" style="white-space:nowrap;">Удалить позицию</button>' +
              '</div></div>';
          } else {
            var color = type === 'work' ? 'background:var(--orange);' : '';
            html += '<div class="mat-item"><div style="flex:1;"><div class="ep-db-item-title">'+esc(it.n || 'Позиция')+'</div><div class="ep-db-item-meta">'+meta+'</div></div>' +
              '<button class="mat-add-btn" style="'+color+'width:auto;margin:0;" onclick="promptAdd(\''+esc(encoded)+'\', \''+type+'\')">+ Добавить</button></div>';
          }
        });
        html += '</div>';
      });
      html += '</div>';
    });

    return html || '<div style="padding:15px;color:var(--gray);font-weight:700;">Позиции не найдены</div>';
  }

  window.epUltimateToggleSub = function(id,e){
    if(e) e.stopPropagation();
    var el = $(id);
    if(el) el.classList.toggle('active');
  };

  function makeLocalCopy(type,it){
    var copy = stripRuntime(it);
    var originalId = copy.id || copy.originGlobalId || '';
    copy.originGlobalId = originalId;
    if(!String(copy.id || '').startsWith('local_')) {
      copy.id = 'local_' + type + '_' + Date.now() + '_' + Math.random().toString(36).slice(2,7);
    }
    return copy;
  }

  function upsertLocal(type,it){
    var copy = makeLocalCopy(type,it);
    var arr = localDb(type).slice();
    var s = sig(type,copy);
    var original = copy.originGlobalId || '';
    var idx = arr.findIndex(function(x){
      return sig(type,x) === s || (original && String(x.originGlobalId || '') === String(original));
    });
    if(idx >= 0) {
      var keepId = arr[idx].id || copy.id;
      arr[idx] = Object.assign({}, arr[idx], copy, { id: keepId });
      setLocalDb(type, arr);
      return 'updated';
    }
    arr.push(copy);
    setLocalDb(type, arr);
    return 'added';
  }

  function unhide(type,it){
    var del = delSet(type);
    del.delete(idkey(it));
    del.delete(sig(type,it));
    if(it && it.originGlobalId) del.delete('id:' + String(it.originGlobalId));
    saveDel(type,del);
  }

  window.epOpenGlobalDbModal = async function(){
    if(typeof showLoader === 'function') showLoader('Загрузка базы сервера...', '🌍');
    await readGlobal(true);
    if(typeof hideLoader === 'function') hideLoader();
    window.EP_ULTIMATE_GLOBAL_TYPE = 'mat';
    window.epUltimateRenderGlobal();
    if(typeof openModal === 'function') openModal('globalDbModal');
  };

  window.epSwitchGlobalDbTab = function(type){
    window.EP_ULTIMATE_GLOBAL_TYPE = type === 'work' ? 'work' : 'mat';
    window.epUltimateRenderGlobal();
  };

  window.epGlobalSelectAll = function(flag){
    document.querySelectorAll('#ep-global-db-list .ep-global-check').forEach(function(ch){ ch.checked = !!flag; });
  };

  window.epUltimateRenderGlobal = function(){
    var type = window.EP_ULTIMATE_GLOBAL_TYPE || 'mat';
    var matBtn = $('ep-global-tab-mat'), workBtn = $('ep-global-tab-work');
    if(matBtn) matBtn.classList.toggle('active', type === 'mat');
    if(workBtn) workBtn.classList.toggle('active', type === 'work');

    var list = $('ep-global-db-list');
    if(!list) return;
    var cache = window.EP_ULTIMATE_DB_CACHE || {matDB:[],workDB:[]};
    var arr = (type === 'work' ? cache.workDB : cache.matDB).map(function(x){ return Object.assign({}, x, {__src:'global'}); });
    list.innerHTML = renderItems(arr, type, 'ultimate_global_' + type, 'global');
  };

  window.epAddSelectedGlobalToMyDb = async function(){
    var type = window.EP_ULTIMATE_GLOBAL_TYPE || 'mat';
    var checks = Array.from(document.querySelectorAll('#ep-global-db-list .ep-global-check:checked'));
    if(!checks.length) return toast('Выберите позиции');

    var added = 0, updated = 0, bad = 0;
    checks.forEach(function(ch){
      var it = decodeItem(ch.dataset.item);
      if(!it || !it.n) { bad++; return; }
      unhide(type,it);
      var result = upsertLocal(type,it);
      if(result === 'added') added++;
      else updated++;
    });

    await saveMyDb();
    await readGlobal(true);

    if(typeof renderDbEditors === 'function') renderDbEditors();

    var matList = $('mat-cat-list'), workList = $('work-cat-list');
    if(matList) matList.innerHTML = renderItems(merged('mat'), 'mat', 'ultimate_mat_after_add', 'catalog');
    if(workList) workList.innerHTML = renderItems(merged('work'), 'work', 'ultimate_work_after_add', 'catalog');

    toast('✅ В мою базу: добавлено ' + added + ', обновлено ' + updated + (bad ? ', ошибок ' + bad : ''));
  };

  window.openMatCatalog = async function(){
    var el = $('mat-cat-list');
    if(el) el.innerHTML = '<div style="padding:15px;color:var(--gray);font-weight:700;">Загружаю мою и базу сервера...</div>';
    if(typeof openModal === 'function') openModal('matCatModal');
    await readGlobal(true);
    if(el) el.innerHTML = renderItems(merged('mat'), 'mat', 'ultimate_mat_catalog', 'catalog');
  };

  window.openWorkCatalog = async function(){
    var el = $('work-cat-list');
    if(el) el.innerHTML = '<div style="padding:15px;color:var(--gray);font-weight:700;">Загружаю мою и базу сервера...</div>';
    if(typeof openModal === 'function') openModal('workModal');
    await readGlobal(true);
    if(el) el.innerHTML = renderItems(merged('work'), 'work', 'ultimate_work_catalog', 'catalog');
  };

  function deleteToolbar(type){
    var title = type === 'mat' ? 'Материалы' : 'Работы';
    return '<div style="border:1px solid var(--border);border-radius:14px;padding:10px;margin:10px 0;background:rgba(239,68,68,.05);">' +
      '<div style="font-weight:900;color:var(--danger);margin-bottom:6px;">🗑 Удаление позиций: '+title+'</div>' +
      '<div style="font-size:11px;color:var(--gray);margin-bottom:8px;">Удаляет/скрывает только у мастера. База сервера не трогается.</div>' +
      '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:8px;">' +
      '<button class="btn-info" style="margin:0;padding:10px;" onclick="epUltimateSelectDelete(\''+type+'\', true)">✅ Выделить все</button>' +
      '<button class="btn-vendor" style="margin:0;padding:10px;" onclick="epUltimateSelectDelete(\''+type+'\', false)">⬜ Убрать галочки</button>' +
      '</div>' +
      '<button class="btn-danger" style="width:100%;margin:0;padding:12px;" onclick="epUltimateDeleteSelected(\''+type+'\')">Удалить выбранные у мастера</button>' +
      '</div>';
  }

  window.renderDbEditors = async function(){
    var em = $('editor-mat-list'), ew = $('editor-work-list');
    if(em) em.innerHTML = '<div style="padding:12px;color:var(--gray);font-weight:700;">Загружаю материалы...</div>';
    if(ew) ew.innerHTML = '<div style="padding:12px;color:var(--gray);font-weight:700;">Загружаю работы...</div>';

    await readGlobal(true);

    var cats = $('db-cats');
    if(cats){
      var all = merged('mat').concat(merged('work'));
      cats.innerHTML = Array.from(new Set(all.map(function(x){ return x.c || 'Разное'; })))
        .sort(function(a,b){return a.localeCompare(b,'ru');})
        .map(function(c){ return '<option value="'+esc(c)+'">'; }).join('');
    }

    if(em) em.innerHTML = deleteToolbar('mat') + renderItems(merged('mat'), 'mat', 'ultimate_editor_mat', 'editor');
    if(ew) ew.innerHTML = deleteToolbar('work') + renderItems(merged('work'), 'work', 'ultimate_editor_work', 'editor');
  };

  window.epUltimateSelectDelete = function(type,flag){
    document.querySelectorAll('.ep-db-delete-check[data-type="'+type+'"]').forEach(function(ch){ ch.checked = !!flag; });
  };

  window.epUltimateDeleteOne = async function(type, encoded){
    var it = decodeItem(encoded);
    if(!it) return;
    var del = delSet(type);
    del.add(idkey(it));
    del.add(sig(type,it));
    if(it.originGlobalId) del.add('id:' + String(it.originGlobalId));
    saveDel(type,del);

    var local = localDb(type).filter(function(x){
      return sig(type,x) !== sig(type,it)
        && idkey(x) !== idkey(it)
        && (!it.originGlobalId || String(x.originGlobalId || '') !== String(it.originGlobalId));
    });
    setLocalDb(type, local);
    await saveMyDb();
    if(typeof renderDbEditors === 'function') renderDbEditors();
    toast('✅ Удалено только у мастера');
  };

  window.epUltimateDeleteSelected = async function(type){
    var checks = Array.from(document.querySelectorAll('.ep-db-delete-check[data-type="'+type+'"]:checked'));
    if(!checks.length) return toast('Выберите позиции галочками');
    var del = delSet(type);
    var removeSig = new Set();
    var removeId = new Set();

    checks.forEach(function(ch){
      var it = decodeItem(ch.dataset.item);
      if(!it) return;
      del.add(idkey(it));
      del.add(sig(type,it));
      if(it.originGlobalId) del.add('id:' + String(it.originGlobalId));
      removeSig.add(sig(type,it));
      removeId.add(idkey(it));
      if(it.originGlobalId) removeId.add('id:' + String(it.originGlobalId));
    });

    saveDel(type,del);
    var local = localDb(type).filter(function(x){
      return !removeSig.has(sig(type,x))
        && !removeId.has(idkey(x))
        && !removeId.has('id:' + String(x.originGlobalId || ''));
    });
    setLocalDb(type, local);
    await saveMyDb();
    if(typeof renderDbEditors === 'function') renderDbEditors();
    toast('✅ Удалено у мастера: ' + checks.length);
  };

  window.epUltimateEditPrice = async function(type, encoded, price){
    var it = decodeItem(encoded);
    if(!it) return;
    it.p = Number(price) || 0;
    unhide(type,it);
    upsertLocal(type,it);
    await saveMyDb();
    toast('✅ Цена изменена только у мастера');
  };

  var oldPrompt = window.promptAdd;
  window.promptAdd = function(value,type){
    var it = decodeItem(value);
    if(!it || !it.n) {
      var arr = merged(type);
      it = arr.find(function(x){ return sig(type,x) === value || idkey(x) === value || String(x.id||'') === String(value); });
    }
    if(!it && typeof oldPrompt === 'function') return oldPrompt(value,type);
    if(!it) return toast('Позиция не найдена');

    pendingAdd = { item: stripRuntime(it), type:type };
    var name = $('qty-prompt-name'), qty = $('qty-input');
    if(name) name.innerText = it.n || 'Позиция';
    if(qty) qty.value = 1;
    if(typeof openModal === 'function') openModal('qtyPromptModal');
  };

  var oldApplyImport = window.epApplyReviewedDbItems;
  window.epApplyReviewedDbItems = async function(mode){
    if(typeof oldApplyImport === 'function') {
      await oldApplyImport(mode);
    }

    var type = (window.EP_DB_REVIEW && window.EP_DB_REVIEW.type) || 'mat';
    try{
      var items = typeof epGetReviewedSelected === 'function' ? epGetReviewedSelected() : [];
      if(Array.isArray(items) && items.length){
        items.forEach(function(it){ upsertLocal(type,it); });
        await saveMyDb();
      }
    }catch(e){ console.warn('ultimate import save', e); }

    await readGlobal(true);
    if(typeof renderDbEditors === 'function') renderDbEditors();
    var matList = $('mat-cat-list'), workList = $('work-cat-list');
    if(matList) matList.innerHTML = renderItems(merged('mat'), 'mat', 'ultimate_mat_after_import', 'catalog');
    if(workList) workList.innerHTML = renderItems(merged('work'), 'work', 'ultimate_work_after_import', 'catalog');
  };

  function classify(it){
    var meta = (it && it.dbMeta) || {};
    var n = clean([it && it.n, it && it.c, groupOf(it), meta.kind, meta.category, meta.subcategory].filter(Boolean).join(' '));
    var raw = String((it && it.n) || '');
    if(meta.kind) {
      var k = String(meta.kind).toLowerCase();
      if(k.indexOf('dif') >= 0) return 'dif';
      if(k.indexOf('uzo') >= 0) return 'uzo';
      if(k.indexOf('automatic') >= 0 || k.indexOf('breaker') >= 0) return 'auto';
      if(k.indexOf('voltage') >= 0) return 'voltage';
      if(k.indexOf('contactor') >= 0) return 'contactor';
    }
    if(/диф/i.test(raw) || n.indexOf('диф') >= 0) return 'dif';
    if(/узо/i.test(raw) || n.indexOf('узо') >= 0) return 'uzo';
    if(/уздп|дугов/i.test(raw) || n.indexOf('уздп') >= 0) return 'uzdp';
    if(/узм|реле напряж/i.test(raw) || n.indexOf('реле напряж') >= 0) return 'voltage';
    if(/реле времени/i.test(raw) || n.indexOf('реле времени') >= 0) return 'time';
    if(/контактор/i.test(raw) || n.indexOf('контактор') >= 0) return 'contactor';
    if(/автомат|(^|\s)[abcdсавд]\s?\d{1,3}(\s|$)/i.test(raw) || /\bc\s?\d{1,3}\b/.test(n)) return 'auto';
    if(/кабель|ввг|провод|utp|ftp|нг/i.test(raw) || n.indexOf('кабель') >= 0 || n.indexOf('ввг') >= 0) return 'cable';
    if(/щит|корпус|бокс/i.test(raw)) return 'shield';
    if(/греб/i.test(raw)) return 'comb';
    if(/ншви|наконеч/i.test(raw)) return 'lug';
    if(/шин|клемм/i.test(raw)) return 'bus';
    if(/din|дин|рейк|огранич/i.test(raw)) return 'din';
    if(/маркир|бирк/i.test(raw)) return 'marking';
    if((it && it.type) === 'work') return 'work:' + clean([(it.c||''), groupOf(it)].join('|'));
    return 'other:' + clean([(it && it.c) || '', groupOf(it)].join('|'));
  }

  function sameClass(a,b){
    var ca = classify(a), cb = classify(b);
    if(ca === cb) return true;
    if(['cable','auto','dif','uzo','uzdp','voltage','time','contactor'].indexOf(ca) >= 0) return ca === cb;
    if(ca.indexOf('work:') === 0 && cb.indexOf('work:') === 0) return ca === cb || ca.split('|')[0] === cb.split('|')[0];
    return false;
  }

  window.EP_ULTIMATE_SWAP = [];
  window.openSwapModal = async function(idx){
    swapTargetIdx = idx;
    var current = currentEstimate[idx];
    if(!current) return;
    var type = current.type === 'work' ? 'work' : 'mat';
    var sel = $('swap-select');
    if(sel) sel.innerHTML = '<option>Загрузка...</option>';
    if(typeof openModal === 'function') openModal('swapModal');

    await readGlobal(true);
    var candidates = merged(type).filter(function(x){ return sameClass(current,x); });
    window.EP_ULTIMATE_SWAP = candidates;

    if(!sel) return;
    if(!candidates.length) {
      sel.innerHTML = '<option value="">Нет подходящих вариантов</option>';
      return;
    }
    sel.innerHTML = candidates.map(function(x,i){
      var src = x.__src === 'global' ? '🌍' : '👤';
      return '<option value="'+i+'">'+src+' '+esc(x.n || 'Позиция')+' ('+(Number(x.p)||0)+' ₽)</option>';
    }).join('');
  };

  window.applySwap = function(){
    if(swapTargetIdx < 0) return;
    var sel = $('swap-select');
    if(!sel || sel.value === '') return toast('Нет выбранной позиции');
    var it = window.EP_ULTIMATE_SWAP[Number(sel.value)];
    if(!it) return toast('Позиция не найдена');

    currentEstimate[swapTargetIdx].n = it.n;
    currentEstimate[swapTargetIdx].p = Number(it.p) || 0;
    currentEstimate[swapTargetIdx].u = it.u || currentEstimate[swapTargetIdx].u || 'шт';
    currentEstimate[swapTargetIdx].sourceId = it.id || null;

    if(typeof renderMainTable === 'function') renderMainTable();
    if(typeof closeModal === 'function') closeModal('swapModal');
    toast('✅ Заменено');
  };

  document.addEventListener('DOMContentLoaded', function(){
    setTimeout(function(){
      readGlobal(true).then(function(){
        if(typeof renderDbEditors === 'function') renderDbEditors();
      });
    }, 800);
  });
})();
