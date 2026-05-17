/*
 * Extracted from public/index.html
 * Original script block: 9
 * Original HTML lines: 5229-5656
 */

/* === HARD FIX 2026-05-13: global add real local copy + import refresh + smart replacement === */
(function(){
  function qs(id){ return document.getElementById(id); }
  function msg(t){ if(typeof showToast === 'function') showToast(t); else alert(t); }
  function esc(s){
    return String(s == null ? '' : s).replace(/[&<>"]/g, function(m){
      return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[m];
    });
  }
  function clean(s){
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
  function groupOf(it){ return (it && (it.g || it.sc || it.subcategory || it.group)) || ''; }
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
    try{ if(type === 'work') workDB = arr || []; else matDB = arr || []; }catch(e){}
  }
  function idKey(it){ return it && it.id ? 'id:' + String(it.id) : ''; }
  function sigKey(type,it){
    return 'sig:' + type + '|' + clean([it && it.c, groupOf(it), it && it.n, it && it.u].filter(Boolean).join('|'));
  }
  function delStorageKey(type){ return type === 'work' ? 'ep_deleted_work_ids_local_v1' : 'ep_deleted_mat_ids_local_v1'; }
  function deletedSet(type){
    try{ return new Set(JSON.parse(localStorage.getItem(delStorageKey(type)) || '[]')); }catch(e){ return new Set(); }
  }
  function saveDeleted(type,set){
    try{ localStorage.setItem(delStorageKey(type), JSON.stringify(Array.from(set))); }catch(e){}
  }
  function clearDeletedFor(type, it){
    var set = deletedSet(type);
    var before = set.size;
    if(idKey(it)) set.delete(idKey(it));
    set.delete(sigKey(type,it));
    if(it && it.originGlobalId) set.delete('id:' + String(it.originGlobalId));
    if(before !== set.size) saveDeleted(type,set);
  }
  async function saveMyDb(){
    try{
      if(typeof safeSet === 'function'){
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
    }catch(e){ console.warn('saveMyDb', e); }
  }

  window.EP_HARD_GLOBAL_CACHE = window.EP_HARD_GLOBAL_CACHE || { matDB: [], workDB: [], loadedAt: 0 };

  async function loadGlobal(force){
    if(!force && window.EP_HARD_GLOBAL_CACHE.loadedAt && Date.now() - window.EP_HARD_GLOBAL_CACHE.loadedAt < 8000) return window.EP_HARD_GLOBAL_CACHE;
    var out = { matDB: [], workDB: [], loadedAt: Date.now() };
    try{
      if(typeof db !== 'undefined' && db){
        var doc = await db.collection('settings').doc('global_db').get();
        if(doc.exists){
          var d = doc.data() || {};
          out.matDB = Array.isArray(d.matDB) ? d.matDB : [];
          out.workDB = Array.isArray(d.workDB) ? d.workDB : [];
        }
      }
    }catch(e){ console.warn('load global_db', e); }
    if(!out.matDB.length) out.matDB = localDb('mat').slice();
    if(!out.workDB.length) out.workDB = localDb('work').slice();
    window.EP_HARD_GLOBAL_CACHE = out;
    window.EP_GLOBAL_DB_VISIBLE_CACHE = out;
    try { if(typeof epGlobalDbCache !== 'undefined') { epGlobalDbCache.matDB = out.matDB; epGlobalDbCache.workDB = out.workDB; } } catch(e){}
    return out;
  }

  function merged(type){
    var del = deletedSet(type);
    var local = localDb(type).map(function(x){ return Object.assign({}, x, {__src:'local'}); });
    var global = (type === 'work' ? window.EP_HARD_GLOBAL_CACHE.workDB : window.EP_HARD_GLOBAL_CACHE.matDB)
      .map(function(x){ return Object.assign({}, x, {__src:'global'}); });
    var map = new Map();

    local.forEach(function(it){
      if(del.has(idKey(it)) || del.has(sigKey(type,it))) return;
      map.set(sigKey(type,it), it);
    });
    global.forEach(function(it){
      if(del.has(idKey(it)) || del.has(sigKey(type,it))) return;
      var k = sigKey(type,it);
      if(!map.has(k)) map.set(k, it);
    });
    return Array.from(map.values());
  }

  function renderList(arr,type,prefix,mode){
    var data = {};
    (arr || []).forEach(function(it){
      var c = it.c || 'Разное';
      var g = groupOf(it) || 'Разное';
      if(!data[c]) data[c] = {};
      if(!data[c][g]) data[c][g] = [];
      data[c][g].push(it);
    });
    var html = '', i = 0;
    Object.keys(data).sort(function(a,b){return a.localeCompare(b,'ru');}).forEach(function(c){
      var cid = prefix + '_c_' + (i++);
      var catStyle = type === 'work' ? 'style="color:var(--orange);background:rgba(245,158,11,.08);"' : '';
      html += '<div class="cat-header" '+catStyle+' onclick="toggleCat(\''+cid+'\')">'+esc(c)+'</div><div class="cat-body" id="'+cid+'">';
      Object.keys(data[c]).sort(function(a,b){return a.localeCompare(b,'ru');}).forEach(function(g){
        var gid = prefix + '_g_' + (i++);
        html += '<div class="ep-db-sub-header" onclick="epHardToggleDbSub(\''+gid+'\', event)"><span>'+esc(g)+'</span><small>открыть</small></div><div class="ep-db-sub-body" id="'+gid+'">';
        data[c][g].sort(function(a,b){return String(a.n||'').localeCompare(String(b.n||''),'ru');}).forEach(function(it,idx){
          var sk = sigKey(type,it);
          var src = it.__src === 'global' ? '<span style="color:#8B5CF6;font-weight:900;">🌍 серверная</span>' : '<span style="color:#10B981;font-weight:900;">👤 моя</span>';
          var meta = esc(g) + ' • ' + src + ' • ' + (Number(it.p)||0) + ' ₽ / ' + esc(it.u || 'шт');
          if(mode === 'global'){
            html += '<label class="mat-item ep-select-row">' +
              '<input type="checkbox" class="ep-global-check" data-type="'+type+'" data-sig="'+esc(sk)+'" data-id="'+esc(String(it.id||''))+'" style="width:22px;height:22px;accent-color:var(--primary);">' +
              '<div style="flex:1;"><div class="ep-db-item-title">'+esc(it.n || 'Позиция')+'</div><div class="ep-db-item-meta">'+meta+'</div></div></label>';
          } else if(mode === 'editor'){
            html += '<div class="emp-row" style="align-items:flex-start;">' +
              '<label style="display:flex;gap:8px;align-items:flex-start;flex:1;">' +
              '<input type="checkbox" class="ep-db-delete-check" data-type="'+type+'" data-sig="'+esc(sk)+'" data-id="'+esc(String(it.id||''))+'" style="width:22px;height:22px;accent-color:#EF4444;margin-top:4px;">' +
              '<div style="flex:1;"><b>'+esc(it.n || 'Позиция')+'</b><br><span style="color:var(--gray);font-size:10px;">'+meta+'</span></div></label>' +
              '<div class="ep-row-actions">' +
              '<input type="number" value="'+(Number(it.p)||0)+'" onchange="requestPriceChange(\''+type+'\', \''+esc(String(it.id||''))+'\', this.value)" style="width:72px;margin:0;padding:4px;text-align:center;">' +
              '<button class="btn-danger" onclick="epHardDeleteLocalPosition(\''+type+'\', \''+esc(sk)+'\', \''+esc(String(it.id||''))+'\')" style="white-space:nowrap;">Удалить позицию</button>' +
              '</div></div>';
          } else {
            var color = type === 'work' ? 'background:var(--orange);' : '';
            html += '<div class="mat-item"><div style="flex:1;"><div class="ep-db-item-title">'+esc(it.n || 'Позиция')+'</div><div class="ep-db-item-meta">'+meta+'</div></div>' +
              '<button class="mat-add-btn" style="'+color+'width:auto;margin:0;" onclick="promptAdd(\''+esc(sk)+'\', \''+type+'\')">+ Добавить</button></div>';
          }
        });
        html += '</div>';
      });
      html += '</div>';
    });
    return html || '<div style="padding:15px;color:var(--gray);font-weight:700;">Позиции не найдены</div>';
  }
  window.epHardToggleDbSub = function(id,e){ if(e) e.stopPropagation(); var el = qs(id); if(el) el.classList.toggle('active'); };

  window.epOpenGlobalDbModal = async function(){
    if(typeof showLoader === 'function') showLoader('Загрузка базы сервера...', '🌍');
    await loadGlobal(true);
    if(typeof hideLoader === 'function') hideLoader();
    window.EP_HARD_GLOBAL_TYPE = 'mat';
    epHardRenderGlobalModal();
    if(typeof openModal === 'function') openModal('globalDbModal');
  };
  window.epSwitchGlobalDbTab = function(type){
    window.EP_HARD_GLOBAL_TYPE = type === 'work' ? 'work' : 'mat';
    epHardRenderGlobalModal();
  };
  window.epGlobalSelectAll = function(flag){
    document.querySelectorAll('#ep-global-db-list .ep-global-check').forEach(function(ch){ ch.checked = !!flag; });
  };
  window.epHardRenderGlobalModal = function(){
    var type = window.EP_HARD_GLOBAL_TYPE || 'mat';
    var matBtn = qs('ep-global-tab-mat'), workBtn = qs('ep-global-tab-work');
    if(matBtn) matBtn.classList.toggle('active', type === 'mat');
    if(workBtn) workBtn.classList.toggle('active', type === 'work');
    var list = qs('ep-global-db-list');
    if(!list) return;
    var cache = window.EP_HARD_GLOBAL_CACHE;
    var arr = (type === 'work' ? cache.workDB : cache.matDB).map(function(x){ return Object.assign({}, x, {__src:'global'}); });
    list.innerHTML = renderList(arr, type, 'hard_global_'+type, 'global');
  };

  window.epAddSelectedGlobalToMyDb = async function(){
    var type = window.EP_HARD_GLOBAL_TYPE || window.EP_GLOBAL_DB_TAB_FIXED || 'mat';
    var checks = Array.from(document.querySelectorAll('#ep-global-db-list .ep-global-check:checked'));
    if(!checks.length) return msg('Выберите позиции');

    var cache = await loadGlobal(false);
    var src = type === 'work' ? cache.workDB : cache.matDB;
    var bySig = new Map(src.map(function(it){ return [sigKey(type,it), it]; }));
    var byId = new Map(src.filter(function(it){return it.id;}).map(function(it){ return [String(it.id), it]; }));
    var local = localDb(type).slice();
    var del = deletedSet(type);

    var added = 0, updated = 0, missed = 0;

    checks.forEach(function(ch, i){
      var it = null;
      if(ch.dataset.sig) it = bySig.get(ch.dataset.sig);
      if(!it && ch.dataset.key) it = bySig.get(ch.dataset.key);
      if(!it && ch.dataset.id) it = byId.get(String(ch.dataset.id));
      if(!it) { missed++; return; }

      var copy = Object.assign({}, it);
      var originalId = copy.id || '';
      copy.originGlobalId = originalId;
      copy.id = 'local_' + type + '_' + Date.now() + '_' + i + '_' + Math.random().toString(36).slice(2,6);
      delete copy.__src;

      del.delete('id:' + String(originalId));
      del.delete(sigKey(type,it));
      del.delete(sigKey(type,copy));

      var s = sigKey(type, copy);
      var idx = local.findIndex(function(x){
        return sigKey(type,x) === s || String(x.originGlobalId || '') === String(originalId);
      });

      if(idx >= 0){
        var keepId = local[idx].id || copy.id;
        local[idx] = Object.assign({}, local[idx], copy, { id: keepId, originGlobalId: originalId });
        updated++;
      } else {
        local.push(copy);
        added++;
      }
    });

    saveDeleted(type, del);
    setLocalDb(type, local);
    await saveMyDb();

    await loadGlobal(true);
    if(typeof renderDbEditors === 'function') renderDbEditors();
    if(qs('mat-cat-list')) qs('mat-cat-list').innerHTML = renderList(merged('mat'), 'mat', 'hard_mat_after_add', 'catalog');
    if(qs('work-cat-list')) qs('work-cat-list').innerHTML = renderList(merged('work'), 'work', 'hard_work_after_add', 'catalog');

    msg('✅ В мою базу: добавлено ' + added + ', обновлено ' + updated + (missed ? ', не найдено ' + missed : ''));
  };

  window.openMatCatalog = async function(){
    var el = qs('mat-cat-list');
    if(el) el.innerHTML = '<div style="padding:15px;color:var(--gray);font-weight:700;">Загружаю мою и базу сервера...</div>';
    if(typeof openModal === 'function') openModal('matCatModal');
    await loadGlobal(true);
    if(el) el.innerHTML = renderList(merged('mat'), 'mat', 'hard_mat_catalog', 'catalog');
  };
  window.openWorkCatalog = async function(){
    var el = qs('work-cat-list');
    if(el) el.innerHTML = '<div style="padding:15px;color:var(--gray);font-weight:700;">Загружаю мою и базу сервера...</div>';
    if(typeof openModal === 'function') openModal('workModal');
    await loadGlobal(true);
    if(el) el.innerHTML = renderList(merged('work'), 'work', 'hard_work_catalog', 'catalog');
  };

  function toolbar(type){
    var title = type === 'mat' ? 'Материалы' : 'Работы';
    return '<div style="border:1px solid var(--border);border-radius:14px;padding:10px;margin:10px 0;background:rgba(239,68,68,.05);">' +
      '<div style="font-weight:900;color:var(--danger);margin-bottom:6px;">🗑 Удаление позиций: '+title+'</div>' +
      '<div style="font-size:11px;color:var(--gray);margin-bottom:8px;">Удаляет/скрывает только у мастера. База сервера не трогается.</div>' +
      '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:8px;">' +
      '<button class="btn-info" style="margin:0;padding:10px;" onclick="epHardSelectDelete(\''+type+'\', true)">✅ Выделить все</button>' +
      '<button class="btn-vendor" style="margin:0;padding:10px;" onclick="epHardSelectDelete(\''+type+'\', false)">⬜ Убрать галочки</button>' +
      '</div>' +
      '<button class="btn-danger" style="width:100%;margin:0;padding:12px;" onclick="epHardDeleteSelected(\''+type+'\')">Удалить выбранные у мастера</button>' +
      '</div>';
  }
  window.renderDbEditors = async function(){
    await loadGlobal(false);
    var cats = qs('db-cats');
    if(cats){
      var all = merged('mat').concat(merged('work'));
      cats.innerHTML = Array.from(new Set(all.map(function(x){ return x.c || 'Разное'; }))).sort(function(a,b){return a.localeCompare(b,'ru');}).map(function(c){ return '<option value="'+esc(c)+'">'; }).join('');
    }
    var em = qs('editor-mat-list');
    var ew = qs('editor-work-list');
    if(em) em.innerHTML = toolbar('mat') + renderList(merged('mat'), 'mat', 'hard_editor_mat', 'editor');
    if(ew) ew.innerHTML = toolbar('work') + renderList(merged('work'), 'work', 'hard_editor_work', 'editor');
  };

  window.epHardSelectDelete = function(type, flag){
    document.querySelectorAll('.ep-db-delete-check[data-type="'+type+'"]').forEach(function(ch){ ch.checked = !!flag; });
  };
  window.epHardDeleteLocalPosition = async function(type, sig, id){
    var del = deletedSet(type);
    if(id) del.add('id:' + String(id));
    if(sig) del.add(sig);
    saveDeleted(type,del);
    var local = localDb(type).filter(function(x){ return sigKey(type,x) !== sig && (!id || String(x.id||'') !== String(id)); });
    setLocalDb(type, local);
    await saveMyDb();
    if(typeof renderDbEditors === 'function') renderDbEditors();
    msg('✅ Удалено только у мастера');
  };
  window.epHardDeleteSelected = async function(type){
    var checks = Array.from(document.querySelectorAll('.ep-db-delete-check[data-type="'+type+'"]:checked'));
    if(!checks.length) return msg('Выберите позиции галочками');
    var del = deletedSet(type);
    var sigs = new Set();
    var ids = new Set();
    checks.forEach(function(ch){
      if(ch.dataset.sig){ del.add(ch.dataset.sig); sigs.add(ch.dataset.sig); }
      if(ch.dataset.id){ del.add('id:' + ch.dataset.id); ids.add(String(ch.dataset.id)); }
    });
    saveDeleted(type, del);
    var local = localDb(type).filter(function(x){ return !sigs.has(sigKey(type,x)) && !ids.has(String(x.id||'')); });
    setLocalDb(type, local);
    await saveMyDb();
    if(typeof renderDbEditors === 'function') renderDbEditors();
    msg('✅ Удалено у мастера: ' + checks.length);
  };

  var oldPromptAddHard = window.promptAdd;
  window.promptAdd = function(keyOrId,type){
    var arr = merged(type);
    var item = arr.find(function(x){ return sigKey(type,x) === keyOrId || idKey(x) === keyOrId || String(x.id||'') === String(keyOrId); });
    if(!item && typeof oldPromptAddHard === 'function') return oldPromptAddHard(keyOrId,type);
    if(!item) return msg('Позиция не найдена');
    pendingAdd = { item:item, type:type };
    var n = qs('qty-prompt-name'), q = qs('qty-input');
    if(n) n.innerText = item.n || 'Позиция';
    if(q) q.value = 1;
    if(typeof openModal === 'function') openModal('qtyPromptModal');
  };

  var oldApplyImportHard = window.epApplyReviewedDbItems;
  window.epApplyReviewedDbItems = async function(mode){
    if(typeof oldApplyImportHard === 'function') {
      await oldApplyImportHard(mode);
    }
    await saveMyDb();
    await loadGlobal(true);
    if(typeof renderDbEditors === 'function') renderDbEditors();
    msg('✅ Импорт сохранён в базе мастера');
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

  window.EP_HARD_SWAP = [];
  window.openSwapModal = async function(idx){
    swapTargetIdx = idx;
    var current = currentEstimate[idx];
    if(!current) return;
    var type = current.type === 'work' ? 'work' : 'mat';
    var sel = qs('swap-select');
    if(sel) sel.innerHTML = '<option>Загрузка...</option>';
    if(typeof openModal === 'function') openModal('swapModal');
    await loadGlobal(true);
    var pool = merged(type);
    var cands = pool.filter(function(x){ return sameClass(current,x); });
    window.EP_HARD_SWAP = cands;
    if(!sel) return;
    if(!cands.length) { sel.innerHTML = '<option value="">Нет подходящих вариантов</option>'; return; }
    sel.innerHTML = cands.map(function(x,i){
      var src = x.__src === 'global' ? '🌍' : '👤';
      return '<option value="'+i+'">'+src+' '+esc(x.n || 'Позиция')+' ('+(Number(x.p)||0)+' ₽)</option>';
    }).join('');
  };
  window.applySwap = function(){
    if(swapTargetIdx < 0) return;
    var sel = qs('swap-select');
    if(!sel || sel.value === '') return msg('Нет выбранной позиции');
    var item = window.EP_HARD_SWAP[Number(sel.value)];
    if(!item) return msg('Позиция не найдена');
    currentEstimate[swapTargetIdx].n = item.n;
    currentEstimate[swapTargetIdx].p = Number(item.p)||0;
    currentEstimate[swapTargetIdx].u = item.u || currentEstimate[swapTargetIdx].u || 'шт';
    currentEstimate[swapTargetIdx].sourceId = item.id || null;
    if(typeof renderMainTable === 'function') renderMainTable();
    if(typeof closeModal === 'function') closeModal('swapModal');
    msg('✅ Заменено');
  };

  document.addEventListener('DOMContentLoaded', function(){
    setTimeout(function(){
      loadGlobal(true).then(function(){
        if(typeof renderDbEditors === 'function') renderDbEditors();
      });
    }, 500);
  });
})();
