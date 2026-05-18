# V59 Database Functions Extracted

Полные функции базы перед первым исправлением.


# FILE: public/js/00-core.js

## renderDbEditors / line 1676

```js
window.renderDbEditors = function () {
        let catsM = [...new Set(matDB.map(m=>m.c || 'Разное'))];
        let catsW = [...new Set(workDB.map(w=>w.c || 'Разное'))];

        const catsEl = document.getElementById('db-cats');
        if (catsEl) catsEl.innerHTML = [...new Set([...catsM, ...catsW])].map(c=>`<option value="${epEscape(c)}">`).join('');

        let htmlMat = '';
        let mGroups = {}; matDB.forEach(m => { mGroups[m.c||'Разное'] = mGroups[m.c||'Разное'] || []; mGroups[m.c||'Разное'].push(m); });
        Object.keys(mGroups).forEach((c, idx) => {
            let sid = 'db_m_'+idx;
            htmlMat += `<div class="cat-header" onclick="toggleCat('${sid}')">${epEscape(c)}</div><div class="cat-body" id="${sid}">`;
            mGroups[c].forEach(m => {
                htmlMat += `<div class="emp-row">
                    <div style="flex:1;"><b>${epEscape(m.n)}</b><br><span style="color:var(--gray);font-size:10px;">${epEscape(m.sc || 'Разное')} • ${Number(m.p)||0} ₽ / ${epEscape(m.u || 'шт')}</span></div>
                    <div class="ep-row-actions">
                        <input type="number" value="${Number(m.p)||0}" onchange="requestPriceChange('mat', '${epEscape(m.id)}', this.value)" style="width:70px;margin:0;padding:4px;text-align:center;">
                        <button class="btn-danger" onclick="epDeleteDbItem('mat','${epEscape(m.id)}')" title="Удалить">🗑</button>
                    </div>
                </div>`;
            });
            htmlMat += `</div>`;
        });
        const em = document.getElementById('editor-mat-list');
        if (em) em.innerHTML = htmlMat;

        let htmlWork = '';
        let wGroups = {}; workDB.forEach(w => { wGroups[w.c||'Разное'] = wGroups[w.c||'Разное'] || []; wGroups[w.c||'Разное'].push(w); });
        Object.keys(wGroups).forEach((c, idx) => {
            let sid = 'db_w_'+idx;
            htmlWork += `<div class="cat-header" style="color:var(--orange); border-color:rgba(245,158,11,0.2); background:rgba(245,158,11,0.08);" onclick="toggleCat('${sid}')">${epEscape(c)}</div><div class="cat-body" id="${sid}">`;
            wGroups[c].forEach(w => {
                htmlWork += `<div class="emp-row">
                    <div style="flex:1;"><b>${epEscape(w.n)}</b><br><span style="color:var(--gray);font-size:10px;">${epEscape(w.sc || 'Разное')} • ${Number(w.p)||0} ₽ / ${epEscape(w.u || 'шт')}</span></div>
                    <div class="ep-row-actions">
                        <input type="number" value="${Number(w.p)||0}" onchange="requestPriceChange('work', '${epEscape(w.id)}', this.value)" style="width:70px;margin:0;padding:4px;text-align:center;">
                        <button class="btn-danger" onclick="epDeleteDbItem('work','${epEscape(w.id)}')" title="Удалить">🗑</button>
                    </div>
                </div>`;
            });
            htmlWork += `</div>`;
        });
        const ew = document.getElementById('editor-work-list');
        if (ew) ew.innerHTML = htmlWork;
    };
```

## renderDbEditors / line 2068

```js
window.renderDbEditors = function() {
        epNormalizeAllWorkDb();
        const catsM = [...new Set((matDB || []).map(m => m.c || 'Разное'))];
        const catsW = [...new Set((workDB || []).map(w => w.c || 'Разное'))];
        const catsEl = document.getElementById('db-cats'); if (catsEl) catsEl.innerHTML = [...new Set([...catsM, ...catsW])].map(c => `<option value="${epEsc(c)}">`).join('');
        const em = document.getElementById('editor-mat-list'); const ew = document.getElementById('editor-work-list');
        if (em) em.innerHTML = epRenderGroupedList(matDB || [], 'mat', { prefix:'db_m_full', mode:'editor' });
        if (ew) ew.innerHTML = epRenderGroupedList(workDB || [], 'work', { prefix:'db_w_full', mode:'editor' });
    };
```

## renderDbEditors / line 2391

```js
window.renderDbEditors = function(){
      epNormalizeMaterialsDb();
      var catsEl = qs('db-cats');
      if (catsEl) catsEl.innerHTML = uniq([].concat((window.matDB||[]).map(function(x){return x.c;}),(window.workDB||[]).map(function(x){return x.c;}))).map(function(c){return '<option value="'+safeText(c)+'">';}).join('');
      var em=qs('editor-mat-list'); if(em) em.innerHTML = epRenderGrouped(window.matDB || [], 'mat', 'editor', 'db_mat_shield');
      var ew=qs('editor-work-list'); if(ew) ew.innerHTML = epRenderGrouped(window.workDB || [], 'work', 'editor', 'db_work_shield');
    };
```

## renderDbEditors / line 2633

```js
window.renderDbEditors = function(){
    try{
      normalizeMaterialDb();
      const dc = qs('db-cats'); if(dc){ const all = [].concat(dbArr('mat')||[], dbArr('work')||[]); dc.innerHTML = Array.from(new Set(all.map(x => x.c || 'Разное'))).sort().map(c => '<option value="'+safe(c)+'">').join(''); }
      const em=qs('editor-mat-list'); if(em) em.innerHTML = renderGrouped(dbArr('mat'), 'mat', 'edmat');
      const ew=qs('editor-work-list'); if(ew) ew.innerHTML = renderGrouped(dbArr('work'), 'work', 'edwork');
    }catch(e){ console.error(e); if(oldRenderDb) oldRenderDb(); }
  };
```

## renderDbEditors / line 2908

```js
window.renderDbEditors = function(){
    normalizeDbs();
    var cats = qs('db-cats');
    if(cats) {
      var all = arrByType('mat').concat(arrByType('work'));
      cats.innerHTML = Array.from(new Set(all.map(function(x){return x.c || 'Разное';}))).sort(function(a,b){return a.localeCompare(b,'ru');}).map(function(c){return '<option value="'+safeHtml(c)+'">';}).join('');
    }
    var em = qs('editor-mat-list');
    var ew = qs('editor-work-list');
    if(em) em.innerHTML = renderGroupedFixed(arrByType('mat'), 'mat', 'dbmat_fixed');
    if(ew) ew.innerHTML = renderGroupedFixed(arrByType('work'), 'work', 'dbwork_fixed');
  };
```

## renderDbEditors / line 3791

```js
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
```

## renderDbEditors / line 4250

```js
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
```

## renderDbEditors / line 4759

```js
window.renderDbEditors = function(){
    syncWindowCaches();
    epRefreshDbScopeUi();
    var catsEl=$('db-cats');
    if(catsEl){
      var all=activeArr('mat').concat(activeArr('work'));
      catsEl.innerHTML=Array.from(new Set(all.map(function(x){return x.c||'Разное';}))).sort(function(a,b){return a.localeCompare(b,'ru');}).map(function(c){return '<option value="'+esc(c)+'">';}).join('');
    }
    var m=$('editor-mat-list'), w=$('editor-work-list');
    if(m) m.innerHTML=renderDbRows('mat');
    if(w) w.innerHTML=renderDbRows('work');
  };
```

## renderDbEditors / line 6237

```js
window.renderDbEditors=function(){
    syncMain(scope());
    try{ var catsEl=$('db-cats'); if(catsEl){ var all=active('mat').concat(active('work')); catsEl.innerHTML=Array.from(new Set(all.map(function(x){return x.c||'Разное';}))).sort(function(a,b){return a.localeCompare(b,'ru');}).map(function(c){return '<option value="'+esc(c)+'">';}).join(''); } }catch(e){}
    var m=$('editor-mat-list'), w=$('editor-work-list');
    if(m) m.innerHTML=renderRows('mat');
    if(w) w.innerHTML=renderRows('work');
    tuneStaticBlocks();
  };
```

## renderDbEditors / line 6630

```js
window.renderDbEditors=function(){ try{ if(typeof oldRender==='function') oldRender(); }catch(e){ console.warn('old renderDbEditors failed',e); } try{ injectDebugButton(); }catch(e){} };
```

## renderDbEditors / line 8361

```js
window.renderDbEditors=function(){ var r=oldDbRender?oldDbRender.apply(this,arguments):undefined; setTimeout(refreshDbEnhancements,80); setTimeout(refreshDbEnhancements,450); return r; };
```

## renderDbEditors / line 8916

```js
window.renderDbEditors=function(){ var r=oldRender?oldRender.apply(this,arguments):undefined; setTimeout(ensurePanel,120); setTimeout(ensurePanel,500); return r; };
```

## openMatCatalog / line 2063

```js
window.openMatCatalog = function() {
        const hasNested = (matDB || []).some(x => x.sc || x.g);
        if (!hasNested && typeof oldOpenMatCatalogFull === 'function') return oldOpenMatCatalogFull();
        const el = document.getElementById('mat-cat-list'); if (el) el.innerHTML = epRenderGroupedList(matDB || [], 'mat', { prefix:'mcat_full', mode:'catalog' }); openModal('matCatModal');
    };
```

## openMatCatalog / line 2389

```js
window.openMatCatalog = function(){ epNormalizeMaterialsDb(); var el=qs('mat-cat-list'); if(el) el.innerHTML = epRenderGrouped(window.matDB || [], 'mat', 'catalog', 'mat_shield'); if(typeof openModal==='function') openModal('matCatModal'); else if(oldMat) oldMat(); };
```

## openMatCatalog / line 2631

```js
window.openMatCatalog = function(){ try{ normalizeMaterialDb(); const el=qs('mat-cat-list'); if(el){ el.innerHTML = renderGrouped(dbArr('mat'), 'mat', 'mat'); openModal('matCatModal'); return; } }catch(e){ console.error(e); } if(oldOpenMat) oldOpenMat(); };
```

## openMatCatalog / line 2896

```js
window.openMatCatalog = function(){
    normalizeDbs();
    var el = qs('mat-cat-list');
    if(el) el.innerHTML = renderGroupedFixed(arrByType('mat'), 'mat', 'mat_fixed');
    if(typeof openModal === 'function') openModal('matCatModal');
  };
```

## openMatCatalog / line 3410

```js
window.openMatCatalog = async function(){
    var el = qs('mat-cat-list');
    if(el) el.innerHTML = '<div style="padding:15px;color:var(--gray);font-weight:700;">Загружаю мою и базу сервера...</div>';
    if(typeof openModal === 'function') openModal('matCatModal');
    await loadGlobalDb(true);
    if(el) el.innerHTML = groupHtml(mergedArr('mat'), 'mat', 'cat_mat_smart', 'catalog');
  };
```

## openMatCatalog / line 3764

```js
window.openMatCatalog = async function(){
    var el = qs('mat-cat-list');
    if(el) el.innerHTML = '<div style="padding:15px;color:var(--gray);font-weight:700;">Загружаю мою и базу сервера...</div>';
    if(typeof openModal === 'function') openModal('matCatModal');
    await loadGlobal(true);
    if(el) el.innerHTML = renderList(merged('mat'), 'mat', 'hard_mat_catalog', 'catalog');
  };
```

## openMatCatalog / line 4231

```js
window.openMatCatalog = async function(){
    var el = $('mat-cat-list');
    if(el) el.innerHTML = '<div style="padding:15px;color:var(--gray);font-weight:700;">Загружаю мою и базу сервера...</div>';
    if(typeof openModal === 'function') openModal('matCatModal');
    await readGlobal(true);
    if(el) el.innerHTML = renderItems(merged('mat'), 'mat', 'ultimate_mat_catalog', 'catalog');
  };
```

## openMatCatalog / line 4688

```js
window.openMatCatalog = function(){ syncWindowCaches(); var x=$('mat-cat-list'); if(x) x.innerHTML=renderCatalog('mat'); if(typeof openModal==='function') openModal('matCatModal'); };
```

## openMatCatalog / line 8378

```js
window.openMatCatalog=function(){ lastOpenedType='mat'; var r=oldOpenMat?oldOpenMat.apply(this,arguments):undefined; setTimeout(refreshDbEnhancements,120); return r; };
```

## openMatCatalog / line 8918

```js
window.openMatCatalog=function(){ var r=oldOpenMat?oldOpenMat.apply(this,arguments):undefined; setTimeout(ensurePanel,150); return r; };
```

## openWorkCatalog / line 2061

```js
window.openWorkCatalog = function() { epNormalizeAllWorkDb(); const el = document.getElementById('work-cat-list'); if (el) el.innerHTML = epRenderGroupedList(workDB || [], 'work', { prefix:'wcat_full', mode:'catalog' }); openModal('workModal'); };
```

## openWorkCatalog / line 2390

```js
window.openWorkCatalog = function(){ var el=qs('work-cat-list'); if(el) el.innerHTML = epRenderGrouped(window.workDB || [], 'work', 'catalog', 'work_shield'); if(typeof openModal==='function') openModal('workModal'); else if(oldWork) oldWork(); };
```

## openWorkCatalog / line 2632

```js
window.openWorkCatalog = function(){ try{ const el=qs('work-cat-list'); if(el){ el.innerHTML = renderGrouped(dbArr('work'), 'work', 'work'); openModal('workModal'); return; } }catch(e){ console.error(e); } if(oldOpenWork) oldOpenWork(); };
```

## openWorkCatalog / line 2902

```js
window.openWorkCatalog = function(){
    normalizeDbs();
    var el = qs('work-cat-list');
    if(el) el.innerHTML = renderGroupedFixed(arrByType('work'), 'work', 'work_fixed');
    if(typeof openModal === 'function') openModal('workModal');
  };
```

## openWorkCatalog / line 3417

```js
window.openWorkCatalog = async function(){
    var el = qs('work-cat-list');
    if(el) el.innerHTML = '<div style="padding:15px;color:var(--gray);font-weight:700;">Загружаю мою и базу сервера...</div>';
    if(typeof openModal === 'function') openModal('workModal');
    await loadGlobalDb(true);
    if(el) el.innerHTML = groupHtml(mergedArr('work'), 'work', 'cat_work_smart', 'catalog');
  };
```

## openWorkCatalog / line 3771

```js
window.openWorkCatalog = async function(){
    var el = qs('work-cat-list');
    if(el) el.innerHTML = '<div style="padding:15px;color:var(--gray);font-weight:700;">Загружаю мою и базу сервера...</div>';
    if(typeof openModal === 'function') openModal('workModal');
    await loadGlobal(true);
    if(el) el.innerHTML = renderList(merged('work'), 'work', 'hard_work_catalog', 'catalog');
  };
```

## openWorkCatalog / line 4239

```js
window.openWorkCatalog = async function(){
    var el = $('work-cat-list');
    if(el) el.innerHTML = '<div style="padding:15px;color:var(--gray);font-weight:700;">Загружаю мою и базу сервера...</div>';
    if(typeof openModal === 'function') openModal('workModal');
    await readGlobal(true);
    if(el) el.innerHTML = renderItems(merged('work'), 'work', 'ultimate_work_catalog', 'catalog');
  };
```

## openWorkCatalog / line 4689

```js
window.openWorkCatalog = function(){ syncWindowCaches(); var x=$('work-cat-list'); if(x) x.innerHTML=renderCatalog('work'); if(typeof openModal==='function') openModal('workModal'); };
```

## openWorkCatalog / line 8379

```js
window.openWorkCatalog=function(){ lastOpenedType='work'; var r=oldOpenWork?oldOpenWork.apply(this,arguments):undefined; setTimeout(refreshDbEnhancements,120); return r; };
```

## openWorkCatalog / line 8919

```js
window.openWorkCatalog=function(){ var r=oldOpenWork?oldOpenWork.apply(this,arguments):undefined; setTimeout(ensurePanel,150); return r; };
```

## epSetDbScope / line 4772

```js
window.epSetDbScope = function(s){
    localStorage.setItem(LS_SCOPE, s==='global' ? 'global' : 'my');
    syncWindowCaches();
    epRefreshDbScopeUi();
    if(typeof renderDbEditors==='function') renderDbEditors();
    toast('Работаем по базе: ' + activeLabel());
  };
```

## epSetDbScope / line 5527

```js
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
```

## epSetDbScope / line 6245

```js
window.epSetDbScope=async function(s){
    setScope(s==='global'?'global':'my'); syncMain(scope()); tuneStaticBlocks();
    showProgress('Обновляю '+label(),20,'Переключение');
    try{ if(typeof oldSetScope==='function' && oldSetScope!==window.epSetDbScope){ await oldSetScope(s); } }catch(e){ console.warn('old scope failed',e); }
    try{ if(typeof window.epRefreshActiveDbNow==='function') await window.epRefreshActiveDbNow(true); }catch(e){}
    syncMain(scope()); renderDbEditors(); showProgress('Обновляю '+label(),100,'Готово'); setTimeout(hideProgress,350);
  };
```

## epSetDbScope / line 8380

```js
window.epSetDbScope=function(s){ epV18SetStatus('download','загрузка с сервера'); var r=oldSetScope?oldSetScope.apply(this,arguments):undefined; Promise.resolve(r).finally(function(){ setTimeout(function(){ epV18SetStatus('ok','V18 активна'); refreshDbEnhancements(); },350); }); return r; };
```

## epReloadActiveDbV7 / line 6268

```js
window.epReloadActiveDbV7=async function(){ showProgress('Перезагружаю '+label(),20,'Запрос'); await reloadActiveDb(); showProgress('Перезагружаю '+label(),100,'Готово'); setTimeout(hideProgress,350); };
```

## epReloadActiveDbV7 / line 6543

```js
window.epReloadActiveDbV7=async function(){
    showProgress('Перезагружаю '+label(),20,'Запрос');
    var ok=await reloadFromRemoteCurrent();
    syncMain(scope()); rerender();
    showProgress('Перезагружаю '+label(),100,ok?'С сервера':'Локально');
    setTimeout(hideProgress,350);
    toast(ok?'✅ База обновлена с сервера':'⚠️ Сервер не отдал базу. Показана локальная копия.');
  };
```

## epReloadActiveDbV7 / line 8381

```js
window.epReloadActiveDbV7=function(){ epV18SetStatus('download','загрузка с сервера'); var r=oldReload?oldReload.apply(this,arguments):undefined; Promise.resolve(r).finally(function(){ setTimeout(function(){ epV18SetStatus('ok','V18 активна'); refreshDbEnhancements(); },350); }); return r; };
```

## epSaveActiveDbV7 / line 6262

```js
window.epSaveActiveDbV7=async function(){
    if(!canEditActive()) return toast('Сохранять базу сервера может только админ');
    showProgress('Сохраняю '+label(),20,'Подготовка');
    var ok=scope()==='global'?await saveServerRemote(showProgress):await saveMyRemote(showProgress);
    await reloadActiveDb(); showProgress('Сохраняю '+label(),100,ok?'Готово':'Локально сохранено'); setTimeout(hideProgress,450); toast(ok?'✅ База сохранена и перезагружена':'⚠️ Сервер не подтвердил, локальная база обновлена');
  };
```

## epSaveActiveDbV7 / line 6527

```js
window.epSaveActiveDbV7=async function(){
    if(!canEdit()) return toast('Сохранять базу сервера может только админ');
    showProgress('Сохраняю '+label(),20,'Подготовка');
    try{
      if(scope()==='global'){
        await saveServerRemote(showProgress);
        await reloadFromRemoteCurrent();
        toast('✅ База сервера сохранена и перезагружена');
      } else {
        try{ await saveMyRemote(showProgress); await reloadFromRemoteCurrent(); toast('✅ Моя база сохранена и перезагружена'); }
        catch(e){ toast('⚠️ Моя база сохранена на телефоне, но не на сервере: '+explainErr(e)); }
      }
      showProgress('Сохраняю '+label(),100,'Готово'); setTimeout(hideProgress,450); rerender();
    }catch(e){ hideProgress(); toast('❌ '+explainErr(e)); console.error('EP V8 save active failed',e); rerender(); }
  };
```

## epSaveActiveDbV7 / line 8382

```js
window.epSaveActiveDbV7=function(){ epV18SetStatus('upload','запись на сервер'); var r=oldSave?oldSave.apply(this,arguments):undefined; Promise.resolve(r).finally(function(){ setTimeout(function(){ epV18SetStatus('ok','V18 активна'); },350); }); return r; };
```


# FILE: public/js/04-database.js

## renderDbEditors / line 1071

```js
function renderDbEditors() {
    let catsM = [...new Set(matDB.map(m=>m.c || 'Разное'))];
    let catsW = [...new Set(workDB.map(w=>w.c || 'Разное'))];
    document.getElementById('db-cats').innerHTML = [...new Set([...catsM, ...catsW])].map(c=>`<option value="${c}">`).join('');

    let htmlMat = '';
    let mGroups = {}; matDB.forEach(m => { mGroups[m.c||'Разное'] = mGroups[m.c||'Разное'] || []; mGroups[m.c||'Разное'].push(m); });
    Object.keys(mGroups).forEach((c, idx) => {
        let sid = 'db_m_'+idx;
        htmlMat += `<div class="cat-header" onclick="toggleCat('${sid}')">${c}</div><div class="cat-body" id="${sid}">`;
        mGroups[c].forEach(m => {
            htmlMat += `<div class="emp-row"><div><b>${m.n}</b><br><span style="color:var(--gray);font-size:10px;">${m.p} ₽ / ${m.u}</span></div> <input type="number" value="${m.p}" onchange="requestPriceChange('mat', '${m.id}', this.value)" style="width:60px;margin:0;padding:4px;text-align:center;"></div>`;
        });
        htmlMat += `</div>`;
    });
    document.getElementById('editor-mat-list').innerHTML = htmlMat;

    let htmlWork = '';
    let wGroups = {}; workDB.forEach(w => { wGroups[w.c||'Разное'] = wGroups[w.c||'Разное'] || []; wGroups[w.c||'Разное'].push(w); });
    Object.keys(wGroups).forEach((c, idx) => {
        let sid = 'db_w_'+idx;
        htmlWork += `<div class="cat-header" style="color:var(--orange); border-color:rgba(245,158,11,0.2); background:rgba(245,158,11,0.08);" onclick="toggleCat('${sid}')">${c}</div><div class="cat-body" id="${sid}">`;
        wGroups[c].forEach(w => {
            htmlWork += `<div class="emp-row"><div><b>${w.n}</b><br><span style="color:var(--gray);font-size:10px;">${w.p} ₽ / ${w.u}</span></div> <input type="number" value="${w.p}" onchange="requestPriceChange('work', '${w.id}', this.value)" style="width:60px;margin:0;padding:4px;text-align:center;"></div>`;
        });
        htmlWork += `</div>`;
    });
    document.getElementById('editor-work-list').innerHTML = htmlWork;
}





```

## renderDbEditors / line 2248

```js
window.renderDbEditors = function(){
      epNormalizeMaterialsDb();
      var catsEl = qs('db-cats');
      if (catsEl) catsEl.innerHTML = uniq([].concat((window.matDB||[]).map(function(x){return x.c;}),(window.workDB||[]).map(function(x){return x.c;}))).map(function(c){return '<option value="'+safeText(c)+'">';}).join('');
      var em=qs('editor-mat-list'); if(em) em.innerHTML = epRenderGrouped(window.matDB || [], 'mat', 'editor', 'db_mat_shield');
      var ew=qs('editor-work-list'); if(ew) ew.innerHTML = epRenderGrouped(window.workDB || [], 'work', 'editor', 'db_work_shield');
    };
```

## openMatCatalog / line 197

```js
function openMatCatalog() { 
    let cats = {}; matDB.forEach(m => { let c = m.c || "ОБЩЕЕ"; if(!cats[c]) cats[c] = []; cats[c].push(m); }); 
    let html = ""; let idx = 0;
    for(let c in cats) { 
        let sid = 'mcat_' + (idx++);
        html += `<div class="cat-header" onclick="toggleCat('${sid}')">${c}</div><div class="cat-body" id="${sid}">`;
        cats[c].forEach(m => { html += `<div class="mat-item"><div style="flex:1; font-size:12px; font-weight:600;">${m.n}<br><span style="color:var(--gray); font-size:11px; font-weight:normal;">${m.p} P / ${m.u}</span></div><button class="mat-add-btn" onclick="promptAdd('${m.id}', 'mat')">+ Добавить</button></div>`; });
        html += `</div>`;
    } document.getElementById('mat-cat-list').innerHTML = html; openModal('matCatModal'); 
}





```

## openMatCatalog / line 2246

```js
window.openMatCatalog = function(){ epNormalizeMaterialsDb(); var el=qs('mat-cat-list'); if(el) el.innerHTML = epRenderGrouped(window.matDB || [], 'mat', 'catalog', 'mat_shield'); if(typeof openModal==='function') openModal('matCatModal'); else if(oldMat) oldMat(); };
```

## openMatCatalog / line 3387

```js
window.openMatCatalog = function(){ syncWindowCaches(); var x=$('mat-cat-list'); if(x) x.innerHTML=renderCatalog('mat'); if(typeof openModal==='function') openModal('matCatModal'); };
```

## openWorkCatalog / line 214

```js
function openWorkCatalog() { 
    let cats = {}; workDB.forEach(w => { let c = w.c || "ОБЩЕЕ"; if(!cats[c]) cats[c] = []; cats[c].push(w); });
    let html = ""; let idx = 0;
    for(let c in cats) { 
        let sid = 'wcat_' + (idx++);
        html += `<div class="cat-header" style="color:var(--orange); border-color:rgba(245,158,11,0.2); background:rgba(245,158,11,0.08);" onclick="toggleCat('${sid}')">${c}</div><div class="cat-body" id="${sid}">`;
        cats[c].forEach(w => { html += `<div class="mat-item"><div style="flex:1; font-size:12px; font-weight:600;">${w.n}<br><span style="color:var(--gray); font-size:11px; font-weight:normal;">${w.p} P / ${w.u}</span></div><button class="mat-add-btn" style="background:var(--orange);" onclick="promptAdd('${w.id}', 'work')">+ Добавить</button></div>`; });
        html += `</div>`;
    } document.getElementById('work-cat-list').innerHTML = html; openModal('workModal'); 
}





```

## openWorkCatalog / line 2247

```js
window.openWorkCatalog = function(){ var el=qs('work-cat-list'); if(el) el.innerHTML = epRenderGrouped(window.workDB || [], 'work', 'catalog', 'work_shield'); if(typeof openModal==='function') openModal('workModal'); else if(oldWork) oldWork(); };
```

## openWorkCatalog / line 3388

```js
window.openWorkCatalog = function(){ syncWindowCaches(); var x=$('work-cat-list'); if(x) x.innerHTML=renderCatalog('work'); if(typeof openModal==='function') openModal('workModal'); };
```

## epSetDbScope / mentions only

Строки: 3350, 3351, 3409, 3410, 3611, 3612, 3659, 3660, 4800

## epReloadActiveDbV7 / mentions only

Строки: 3421, 3671, 4508

## epSaveActiveDbV7 / mentions only

Строки: 3421, 3671, 4509


# FILE: public/js/database.js

## renderDbEditors / line 62

```js
function renderDbEditors() {
    let catsM = [...new Set(matDB.map(m=>m.c || 'Разное'))];
    let catsW = [...new Set(workDB.map(w=>w.c || 'Разное'))];
    document.getElementById('db-cats').innerHTML = [...new Set([...catsM, ...catsW])].map(c=>`<option value="${c}">`).join('');

    let htmlMat = '';
    let mGroups = {}; matDB.forEach(m => { mGroups[m.c||'Разное'] = mGroups[m.c||'Разное'] || []; mGroups[m.c||'Разное'].push(m); });
    Object.keys(mGroups).forEach((c, idx) => {
        let sid = 'db_m_'+idx;
        htmlMat += `<div class="cat-header" onclick="toggleCat('${sid}')">${c}</div><div class="cat-body" id="${sid}">`;
        mGroups[c].forEach(m => {
            htmlMat += `<div class="emp-row"><div><b>${m.n}</b><br><span style="color:var(--gray);font-size:10px;">${m.p} ₽ / ${m.u}</span></div> <input type="number" value="${m.p}" onchange="requestPriceChange('mat', '${m.id}', this.value)" style="width:60px;margin:0;padding:4px;text-align:center;"></div>`;
        });
        htmlMat += `</div>`;
    });
    document.getElementById('editor-mat-list').innerHTML = htmlMat;

    let htmlWork = '';
    let wGroups = {}; workDB.forEach(w => { wGroups[w.c||'Разное'] = wGroups[w.c||'Разное'] || []; wGroups[w.c||'Разное'].push(w); });
    Object.keys(wGroups).forEach((c, idx) => {
        let sid = 'db_w_'+idx;
        htmlWork += `<div class="cat-header" style="color:var(--orange); border-color:rgba(245,158,11,0.2); background:rgba(245,158,11,0.08);" onclick="toggleCat('${sid}')">${c}</div><div class="cat-body" id="${sid}">`;
        wGroups[c].forEach(w => {
            htmlWork += `<div class="emp-row"><div><b>${w.n}</b><br><span style="color:var(--gray);font-size:10px;">${w.p} ₽ / ${w.u}</span></div> <input type="number" value="${w.p}" onchange="requestPriceChange('work', '${w.id}', this.value)" style="width:60px;margin:0;padding:4px;text-align:center;"></div>`;
        });
        htmlWork += `</div>`;
    });
    document.getElementById('editor-work-list').innerHTML = htmlWork;
}


```

## openMatCatalog / line 5

```js
function openMatCatalog() { 
    let cats = {}; matDB.forEach(m => { let c = m.c || "ОБЩЕЕ"; if(!cats[c]) cats[c] = []; cats[c].push(m); }); 
    let html = ""; let idx = 0;
    for(let c in cats) { 
        let sid = 'mcat_' + (idx++);
        html += `<div class="cat-header" onclick="toggleCat('${sid}')">${c}</div><div class="cat-body" id="${sid}">`;
        cats[c].forEach(m => { html += `<div class="mat-item"><div style="flex:1; font-size:12px; font-weight:600;">${m.n}<br><span style="color:var(--gray); font-size:11px; font-weight:normal;">${m.p} P / ${m.u}</span></div><button class="mat-add-btn" onclick="promptAdd('${m.id}', 'mat')">+ Добавить</button></div>`; });
        html += `</div>`;
    } document.getElementById('mat-cat-list').innerHTML = html; openModal('matCatModal'); 
}



```

## openWorkCatalog / line 18

```js
function openWorkCatalog() { 
    let cats = {}; workDB.forEach(w => { let c = w.c || "ОБЩЕЕ"; if(!cats[c]) cats[c] = []; cats[c].push(w); });
    let html = ""; let idx = 0;
    for(let c in cats) { 
        let sid = 'wcat_' + (idx++);
        html += `<div class="cat-header" style="color:var(--orange); border-color:rgba(245,158,11,0.2); background:rgba(245,158,11,0.08);" onclick="toggleCat('${sid}')">${c}</div><div class="cat-body" id="${sid}">`;
        cats[c].forEach(w => { html += `<div class="mat-item"><div style="flex:1; font-size:12px; font-weight:600;">${w.n}<br><span style="color:var(--gray); font-size:11px; font-weight:normal;">${w.p} P / ${w.u}</span></div><button class="mat-add-btn" style="background:var(--orange);" onclick="promptAdd('${w.id}', 'work')">+ Добавить</button></div>`; });
        html += `</div>`;
    } document.getElementById('work-cat-list').innerHTML = html; openModal('workModal'); 
}



```

