/*
 * Extracted from public/index.html
 * Original script block: 19
 * Original HTML lines: 8832-9134
 */

/* === EP DB ADMIN SETTINGS + AI STABILITY V11 ===
   Surgical patch:
   1) Normal "База данных" no longer writes/imports into server DB just because user is admin.
   2) Server DB write/import mode is enabled only from Settings -> Admin panel.
   3) AI photo/PDF import gets real progress overlay, image compression and timeout so it cannot hang forever at 35%.
   Does not touch shield logic.
*/
(function(){
  if(window.EP_DB_ADMIN_SETTINGS_AI_STABILITY_V11) return;
  window.EP_DB_ADMIN_SETTINGS_AI_STABILITY_V11 = true;

  function $(id){ return document.getElementById(id); }
  function txt(el){ return String((el && (el.textContent || el.innerText)) || '').replace(/\s+/g,' ').trim(); }
  function toast(t){ try{ if(typeof showToast==='function') showToast(t); else alert(t); }catch(e){ console.log(t); } }
  function scope(){ try{ return localStorage.getItem('ep_db_scope_v2') === 'global' ? 'global' : 'my'; }catch(e){ return 'my'; } }
  function isAdmin(){
    try{
      var u = window.appUser || {};
      var email = String(u.email || u.userEmail || u.mail || '').toLowerCase();
      return !!(u.role === 'admin' || u.isAdmin === true || email === 'vits0007@gmail.com');
    }catch(e){ return false; }
  }
  function adminServerMode(){ return !!(window.EP_ADMIN_SERVER_DB_EDIT === true && isAdmin()); }
  function explainServerEdit(){ return '🌍 Базу сервера меняем только через Настройки → Админ панель → База сервера. Здесь сервер открыт для просмотра/выбора, чтобы случайно не залить личный импорт в глобальную базу.'; }

  function ensureProgress(){
    if($('ep-v11-progress')) return;
    var d = document.createElement('div');
    d.id = 'ep-v11-progress';
    d.style.cssText = 'position:fixed;inset:0;z-index:100000;background:rgba(15,23,42,.64);display:none;align-items:center;justify-content:center;padding:18px;';
    d.innerHTML = '<div style="width:min(460px,94vw);border-radius:22px;background:var(--card-bg,#fff);box-shadow:0 24px 70px rgba(0,0,0,.35);padding:18px;border:1px solid var(--border,#e5e7eb);">'
      + '<div id="ep-v11-progress-title" style="font-weight:900;color:var(--primary,#4f46e5);font-size:17px;margin-bottom:8px;">Выполняю...</div>'
      + '<div style="height:16px;background:rgba(148,163,184,.25);border-radius:999px;overflow:hidden;border:1px solid rgba(148,163,184,.35);"><div id="ep-v11-progress-fill" style="height:100%;width:0%;background:linear-gradient(90deg,#2563eb,#10b981);transition:width .18s ease;"></div></div>'
      + '<div id="ep-v11-progress-txt" style="font-size:12px;color:var(--gray,#64748b);font-weight:800;margin-top:8px;">0%</div>'
      + '<div id="ep-v11-progress-hint" style="font-size:11px;color:var(--gray,#64748b);margin-top:8px;line-height:1.35;">Не закрывай экран до завершения.</div>'
      + '</div>';
    document.body.appendChild(d);
  }
  window.epDbProgress = function(title,pct,text){
    ensureProgress();
    var p=$('ep-v11-progress'), f=$('ep-v11-progress-fill'), t=$('ep-v11-progress-title'), x=$('ep-v11-progress-txt');
    var n = Math.max(0, Math.min(100, Math.round(Number(pct)||0)));
    if(p) p.style.display='flex';
    if(t) t.textContent = title || 'Выполняю...';
    if(f) f.style.width = n + '%';
    if(x) x.textContent = (text || '') + ' ' + n + '%';
    try{ if(typeof hideLoader==='function') hideLoader(); }catch(e){}
  };
  window.epDbHideProgress = function(){
    var p=$('ep-v11-progress'); if(p) p.style.display='none';
    try{ if(typeof hideLoader==='function') hideLoader(); }catch(e){}
  };

  function setScope(s){
    try{ localStorage.setItem('ep_db_scope_v2', s === 'global' ? 'global' : 'my'); }catch(e){}
    try{ if(typeof window.epSetDbScope === 'function') window.epSetDbScope(s === 'global' ? 'global' : 'my'); }catch(e){}
  }
  window.epOpenAdminServerDbFromSettings = function(){
    if(!isAdmin()) return toast('Только админ может редактировать базу сервера');
    window.EP_ADMIN_SERVER_DB_EDIT = true;
    window.EP_OPENING_ADMIN_SERVER_DB = true;
    try{ localStorage.setItem('ep_db_scope_v2','global'); }catch(e){}
    try{ if(typeof openModal === 'function') openModal('settModal'); }catch(e){ var m=$('settModal'); if(m)m.style.display='flex'; }
    setTimeout(function(){
      setScope('global');
      window.EP_OPENING_ADMIN_SERVER_DB = false;
      patchDbUi();
      toast('👑 Включён режим админа: можно менять базу сервера');
    },120);
  };

  var oldOpenModal = window.openModal;
  if(typeof oldOpenModal === 'function' && !oldOpenModal.__ep_v11_wrapped){
    var wrappedOpen = function(id){
      if(id === 'settModal' && !window.EP_OPENING_ADMIN_SERVER_DB){
        window.EP_ADMIN_SERVER_DB_EDIT = false;
      }
      var r = oldOpenModal.apply(this, arguments);
      setTimeout(patchDbUi,120);
      return r;
    };
    wrappedOpen.__ep_v11_wrapped = true;
    window.openModal = wrappedOpen;
  }

  function installAdminSettingsButton(){
    var panel = $('admin-panel');
    if(!panel || $('ep-v11-admin-server-db-btn')) return;
    var box = document.createElement('div');
    box.id = 'ep-v11-admin-server-db-btn';
    box.style.cssText = 'margin:12px 0;padding:10px;border:1px solid var(--primary);border-radius:12px;background:rgba(79,70,229,.07);';
    box.innerHTML = '<div style="font-weight:900;color:var(--primary);margin-bottom:6px;">🌍 База сервера</div>'
      + '<div style="font-size:11px;color:var(--gray);line-height:1.35;margin-bottom:8px;">Импорт, замена, цены и сохранение глобальной базы выполняются только отсюда, чтобы личный импорт админа случайно не улетел на сервер.</div>'
      + '<button type="button" class="btn-primary" style="width:100%;padding:12px;margin:0;" onclick="epOpenAdminServerDbFromSettings()">👑 Открыть редактирование базы сервера</button>';
    var firstH = panel.querySelector('h4');
    if(firstH) panel.insertBefore(box, firstH); else panel.appendChild(box);
  }

  function normalDbButtonWasClicked(e){
    var b = e && e.target && e.target.closest ? e.target.closest('button') : null;
    if(!b) return false;
    var s = txt(b);
    return /База данных/.test(s) && !/База сервера/.test(s) && b.id !== 'ep-v11-admin-server-db-btn';
  }
  document.addEventListener('click', function(e){
    if(normalDbButtonWasClicked(e)) window.EP_ADMIN_SERVER_DB_EDIT = false;
    setTimeout(function(){ installAdminSettingsButton(); patchDbUi(); },80);
  }, true);

  var oldSetDbScope = window.epSetDbScope;
  if(typeof oldSetDbScope === 'function' && !oldSetDbScope.__ep_v11_wrapped){
    var wrappedScope = function(s){
      var r = oldSetDbScope.apply(this, arguments);
      setTimeout(patchDbUi,120);
      return r;
    };
    wrappedScope.__ep_v11_wrapped = true;
    window.epSetDbScope = wrappedScope;
  }

  function patchDbUi(){
    installAdminSettingsButton();
    var isGlobal = scope() === 'global';
    var serverEdit = adminServerMode();
    var panel = $('ep-v7-db-panel');
    if(panel){
      var oldNote = $('ep-v11-server-mode-note'); if(oldNote) oldNote.remove();
      var note = document.createElement('div');
      note.id = 'ep-v11-server-mode-note';
      note.style.cssText = 'font-size:11px;font-weight:900;line-height:1.35;margin:8px 0;padding:9px;border-radius:12px;';
      if(isGlobal && serverEdit){
        note.style.border = '1px solid var(--danger)'; note.style.color = 'var(--danger)'; note.style.background='rgba(239,68,68,.08)';
        note.textContent = '👑 Режим админа: разрешены импорт, замена, цены и сохранение базы сервера.';
        panel.insertBefore(note, panel.firstChild);
      } else if(isGlobal){
        note.style.border = '1px solid var(--border)'; note.style.color = 'var(--gray)'; note.style.background='rgba(100,116,139,.08)';
        note.textContent = explainServerEdit();
        panel.insertBefore(note, panel.firstChild);
      }
      Array.prototype.forEach.call(panel.querySelectorAll('button'), function(btn){
        var s=txt(btn);
        if(isGlobal && !serverEdit && /Импорт|текстом|заявк|Сохранить базу|Очистка сервера|Очистка \/ сброс/.test(s)){
          btn.style.display='none';
        }
      });
    }
    var addBtn = document.querySelector('#settModal button[onclick="addDbItem()"]');
    if(addBtn){
      var block=addBtn.parentElement;
      if(block) block.style.display = (!isGlobal || serverEdit) ? 'block' : 'none';
      addBtn.textContent = isGlobal ? '+ Добавить в базу сервера' : '+ Добавить в мою базу';
    }
    if(isGlobal && !serverEdit){
      Array.prototype.forEach.call(document.querySelectorAll('#editor-mat-list input,#editor-work-list input,#editor-mat-list select,#editor-work-list select,#editor-mat-list textarea,#editor-work-list textarea'), function(el){ el.disabled = true; });
      Array.prototype.forEach.call(document.querySelectorAll('#editor-mat-list button,#editor-work-list button'), function(btn){
        var s=txt(btn);
        if(/Сохранить|Удалить|Замени|✕|🗑/.test(s)) btn.style.display='none';
      });
    }
  }

  var oldAddDbItem = window.addDbItem;
  if(typeof oldAddDbItem === 'function' && !oldAddDbItem.__ep_v11_wrapped){
    var wrappedAdd = function(){
      if(scope()==='global' && !adminServerMode()) return toast(explainServerEdit());
      return oldAddDbItem.apply(this, arguments);
    };
    wrappedAdd.__ep_v11_wrapped = true;
    window.addDbItem = wrappedAdd;
  }
  var oldSaveActive = window.epSaveActiveDbV7;
  if(typeof oldSaveActive === 'function' && !oldSaveActive.__ep_v11_wrapped){
    var wrappedSave = async function(){
      if(scope()==='global' && !adminServerMode()) return toast(explainServerEdit());
      return oldSaveActive.apply(this, arguments);
    };
    wrappedSave.__ep_v11_wrapped = true;
    window.epSaveActiveDbV7 = wrappedSave;
  }

  function importTarget(){
    if(scope() === 'global'){
      if(adminServerMode()) return 'global';
      return 'blocked_server_edit';
    }
    return 'my';
  }
  var oldTriggerImport = window.epTriggerDbFileImport;
  window.epTriggerDbFileImport = function(type){
    type = type === 'work' ? 'work' : 'mat';
    var target = importTarget();
    if(target === 'blocked_server_edit') return toast(explainServerEdit());
    window.EP_V9_IMPORT_TARGET = target;
    window.EP_V7_IMPORT_TARGET = target;
    if(target === 'my') setScope('my');
    var input = $('ep-db-file-input');
    if(!input){ if(typeof oldTriggerImport === 'function') return oldTriggerImport(type); return toast('Поле выбора файла не найдено'); }
    input.setAttribute('accept','.xlsx,.xls,.csv,.json,.txt,.pdf,image/*');
    input.value = '';
    input.onchange = function(e){
      var file = e.target.files && e.target.files[0];
      if(!file) return;
      window.EP_V9_IMPORT_TARGET = target;
      window.EP_V7_IMPORT_TARGET = target;
      if(typeof window.epReadDbFileV9 === 'function') return window.epReadDbFileV9(file,type,target);
      return toast('Парсер импорта не найден');
    };
    input.click();
  };

  var oldOpenText = window.epOpenTextImport;
  window.epOpenTextImport = function(type){
    type = type === 'work' ? 'work' : 'mat';
    var target = importTarget();
    if(target === 'blocked_server_edit') return toast(explainServerEdit());
    window.EP_DB_REVIEW = window.EP_DB_REVIEW || {};
    window.EP_DB_REVIEW.type = type;
    window.EP_V9_IMPORT_TARGET = target;
    window.EP_V7_IMPORT_TARGET = target;
    if(target === 'my') setScope('my');
    var title = $('ep-text-import-title'); if(title) title.textContent = 'Импорт ' + (type==='work'?'работ':'материалов') + ' из текста → ' + (target==='global'?'База сервера':'Моя база');
    var val = $('ep-text-import-value'); if(val) val.value = '';
    try{ if(typeof openModal === 'function') openModal('ep-text-import-modal'); }catch(e){ var m=$('ep-text-import-modal'); if(m)m.style.display='flex'; }
  };

  var oldApply = window.epApplyReviewedDbItems;
  if(typeof oldApply === 'function' && !oldApply.__ep_v11_wrapped){
    var wrappedApply = async function(mode){
      var target = window.EP_V9_IMPORT_TARGET || window.EP_V7_IMPORT_TARGET || (scope()==='global'?'global':'my');
      if(target === 'global' && !adminServerMode()){
        window.EP_V9_IMPORT_TARGET = null; window.EP_V7_IMPORT_TARGET = null;
        return toast(explainServerEdit());
      }
      return oldApply.apply(this, arguments);
    };
    wrappedApply.__ep_v11_wrapped = true;
    window.epApplyReviewedDbItems = wrappedApply;
  }

  async function compressImageDataUrl(dataUrl){
    dataUrl = String(dataUrl || '');
    if(!/^data:image\//i.test(dataUrl)) return dataUrl;
    if(dataUrl.length < 1200000) return dataUrl;
    return new Promise(function(resolve){
      var img = new Image();
      img.onload = function(){
        try{
          var maxSide = 1700;
          var w = img.naturalWidth || img.width || 0, h = img.naturalHeight || img.height || 0;
          if(!w || !h) return resolve(dataUrl);
          var k = Math.min(1, maxSide / Math.max(w,h));
          var canvas = document.createElement('canvas');
          canvas.width = Math.max(1, Math.round(w*k));
          canvas.height = Math.max(1, Math.round(h*k));
          var ctx = canvas.getContext('2d');
          ctx.drawImage(img,0,0,canvas.width,canvas.height);
          resolve(canvas.toDataURL('image/jpeg',0.82));
        }catch(e){ resolve(dataUrl); }
      };
      img.onerror = function(){ resolve(dataUrl); };
      img.src = dataUrl;
    });
  }
  function timeoutPromise(ms, label){
    return new Promise(function(_,reject){
      setTimeout(function(){ reject(new Error(label || 'ИИ долго не отвечает. Попробуй фото крупнее/светлее, меньший PDF или другой ИИ-провайдер.')); }, ms);
    });
  }
  var oldAskAI = window.epAskAI;
  if(typeof oldAskAI === 'function' && !oldAskAI.__ep_v11_wrapped){
    var wrappedAsk = async function(promptText, opts){
      opts = opts || {};
      var isFile = !!(opts.imageDataUrl || opts.fileDataUrl);
      var title = opts.fileDataUrl ? 'ИИ-импорт PDF' : (opts.imageDataUrl ? 'ИИ-импорт фото' : 'ИИ');
      var pct = 36;
      var timer = null;
      try{
        if(opts.imageDataUrl){
          window.epDbProgress(title,28,'Сжимаю фото для телефона');
          opts = Object.assign({}, opts, { imageDataUrl: await compressImageDataUrl(opts.imageDataUrl) });
        }
        if(isFile){
          timer = setInterval(function(){
            pct = Math.min(82, pct + 4);
            window.epDbProgress(title,pct,'ИИ обрабатывает файл, жду ответ');
          }, 4500);
        }
        var ms = opts.fileDataUrl ? 120000 : (opts.imageDataUrl ? 90000 : 70000);
        return await Promise.race([oldAskAI.call(this, promptText, opts), timeoutPromise(ms)]);
      }finally{
        if(timer) clearInterval(timer);
      }
    };
    wrappedAsk.__ep_v11_wrapped = true;
    window.epAskAI = wrappedAsk;
  }

  function patchAll(){ installAdminSettingsButton(); patchDbUi(); }
  document.addEventListener('DOMContentLoaded', function(){ setTimeout(patchAll,300); setTimeout(patchAll,1200); });
  setInterval(function(){ var m=$('settModal'); if(m && (m.style.display==='flex' || m.style.display==='block')) patchDbUi(); installAdminSettingsButton(); },900);
})();
