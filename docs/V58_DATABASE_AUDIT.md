# V58 Database Audit

Аудит текущей базы данных перед исправлениями.


# FILE: public/js/00-core.js


## renderDbEditors

Найдено строк: 439, 1231, 1640, 1674, 1675, 1676, 1745, 1771, 1861, 2068, 2109, 2122, 2203, 2217, 2388, 2391, 2630, 2633, 2908, 3403

### around line 439

```js
   427: /* V40 SAFE: moved top-level function closeObjCardAndReturn to 01-visual.js, accounting.js */
   428: 
   429: 
   430: /* V40 SAFE: moved top-level function addExtraWork to 01-visual.js, 04-database.js, 05-ai-functions.js, 08-accounting.js, 10-estimate-views.js, 11-pdf-files.js, 12-documents.js, accounting.js */
   431: 
   432: 
   433: /* V40 SAFE: moved top-level function loadCustHistoryOptions to 07-settings.js, 11-pdf-files.js, 12-documents.js, accounting.js */
   434: 
   435: 
   436: /* V40 SAFE: moved top-level function switchDbTab to 01-visual.js, 03-socket-pool.js, 04-database.js, 11-pdf-files.js, 12-documents.js, database.js */
   437: 
   438: 
>> 439: /* V40 SAFE: moved top-level function renderDbEditors to 01-visual.js, 03-socket-pool.js, 04-database.js, 07-settings.js, 08-accounting.js, 10-estimate-views.js, 11-pdf-files.js, 12-documents.js, database.js */
   440: 
   441: 
   442: /* V40 SAFE: moved top-level function addDbItem to 01-visual.js, 04-database.js, 05-ai-functions.js, 07-settings.js, 08-accounting.js, 10-estimate-views.js, 11-pdf-files.js, 12-documents.js, database.js */
   443: 
   444: 
   445: /* V40 SAFE: moved top-level function requestPriceChange to 01-visual.js, 04-database.js, 05-ai-functions.js, 07-settings.js, 08-accounting.js, 10-estimate-views.js, 11-pdf-files.js, 12-documents.js, database.js */
   446: 
   447: 
   448: /* V40 SAFE: moved top-level function listenForApprovals to 02-shield-configurator.js, 04-database.js, 05-ai-functions.js, 07-settings.js, 11-pdf-files.js, 12-documents.js, admin.js */
   449: 
   450: 
   451: /* V40 SAFE: moved top-level function approveUser to 01-visual.js, 05-ai-functions.js, 07-settings.js, admin.js */
   452: 
   453: 
   454: /* V40 SAFE: moved top-level function loadMasterDrafts to 04-database.js, 05-ai-functions.js, 07-settings.js, 10-estimate-views.js, 11-pdf-files.js, 12-documents.js, admin.js */
   455: 
   456: 
   457: /* V40 SAFE: moved top-level function openAdminDraftView to 01-visual.js, 07-settings.js, 08-accounting.js, 10-estimate-views.js, 11-pdf-files.js, 12-documents.js, admin.js */
   458: 
   459: 
   460: /* V40 SAFE: moved top-level function renderAdminUsers to 01-visual.js, 02-shield-configurator.js, 04-database.js, 05-ai-functions.js, 07-settings.js, 11-pdf-files.js, 12-documents.js, admin.js */
   461: 
```

### around line 1231

```js
   1219:                 }
   1220:             }
   1221: 
   1222:             if (!loaded) {
   1223:                 try {
   1224:                     const lm = JSON.parse(safeGet('user_db_mat_v31', '[]'));
   1225:                     const lw = JSON.parse(safeGet('user_db_work_v31', '[]'));
   1226:                     if (lm.length) matDB = lm;
   1227:                     if (lw.length) workDB = lw;
   1228:                 } catch(e){}
   1229:             }
   1230: 
>> 1231:             renderDbEditors();
   1232:         } catch(e) {
   1233:             console.warn('load user db error', e);
   1234:         }
   1235:     }
   1236: 
   1237:     function epInsertDbTools() {
   1238:         if (document.getElementById('ep-db-ai-tools')) return;
   1239:         const tabs = document.querySelector('#settModal .tabs-container');
   1240:         if (!tabs) return;
   1241: 
   1242:         const box = document.createElement('div');
   1243:         box.id = 'ep-db-ai-tools';
   1244:         box.innerHTML = `
   1245:             <h3>🤖 Импорт / экспорт базы через ИИ</h3>
   1246:             <div class="ep-db-ai-grid">
   1247:                 <button class="btn-info" onclick="epTriggerDbFileImport('mat')">📥 Материалы: Excel / JSON / фото / скрин</button>
   1248:                 <button class="btn-work" onclick="epTriggerDbFileImport('work')">📥 Работы: Excel / JSON / фото / скрин</button>
   1249:                 <button class="btn-vendor" onclick="epOpenTextImport('mat')">📝 Материалы из текста</button>
   1250:                 <button class="btn-vendor" onclick="epOpenTextImport('work')">📝 Работы из текста</button>
   1251:                 <button class="btn-success" onclick="epExportMyDb()">📤 Экспорт моей базы</button>
   1252:                 <button class="btn-shield" onclick="epExportGlobalDb()">🌍 Экспорт базы сервера</button>
   1253:             </div>
```

### around line 1640

```js
   1628:             }
   1629:         });
   1630: 
   1631:         epSetCurrentDb(type, arr);
   1632: 
   1633:         if (appUser && appUser.role === 'admin') {
   1634:             try { await epSaveGlobalDb(); } catch(e) { console.warn(e); }
   1635:         }
   1636: 
   1637:         await epSaveUserDb();
   1638:         await epSendDbProposal(type, items, mode);
   1639: 
>> 1640:         renderDbEditors();
   1641:         closeModal('ep-db-ai-review-modal');
   1642:         showToast('✅ База обновлена' + (appUser && appUser.role !== 'admin' ? ' и отправлена админу' : ''));
   1643:     };
   1644: 
   1645:     function epDownloadJson(filename, data) {
   1646:         const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json;charset=utf-8' });
   1647:         const url = URL.createObjectURL(blob);
   1648:         const a = document.createElement('a');
   1649:         a.href = url; a.download = filename;
   1650:         document.body.appendChild(a); a.click(); a.remove();
   1651:         setTimeout(function(){ URL.revokeObjectURL(url); }, 1000);
   1652:     }
   1653: 
   1654:     window.epExportMyDb = function () {
   1655:         epDownloadJson('electric-pro-my-db.json', {
   1656:             owner: appUser ? { uid: appUser.uid, name: appUser.name || appUser.email || '' } : null,
   1657:             matDB: matDB,
   1658:             workDB: workDB,
   1659:             exportedAt: new Date().toISOString()
   1660:         });
   1661:     };
   1662: 
```

### around line 1674

```js
   1662: 
   1663:     window.epExportGlobalDb = async function () {
   1664:         let data = { matDB: matDB, workDB: workDB };
   1665:         try {
   1666:             if (db) {
   1667:                 const doc = await db.collection('settings').doc('global_db').get();
   1668:                 if (doc.exists) data = doc.data();
   1669:             }
   1670:         } catch(e){}
   1671:         epDownloadJson('electric-pro-global-db.json', Object.assign({}, data, { exportedAt: new Date().toISOString() }));
   1672:     };
   1673: 
>> 1674:     // Override renderDbEditors with delete buttons
   1675:     const epOldRenderDbEditors = window.renderDbEditors;
   1676:     window.renderDbEditors = function () {
   1677:         let catsM = [...new Set(matDB.map(m=>m.c || 'Разное'))];
   1678:         let catsW = [...new Set(workDB.map(w=>w.c || 'Разное'))];
   1679: 
   1680:         const catsEl = document.getElementById('db-cats');
   1681:         if (catsEl) catsEl.innerHTML = [...new Set([...catsM, ...catsW])].map(c=>`<option value="${epEscape(c)}">`).join('');
   1682: 
   1683:         let htmlMat = '';
   1684:         let mGroups = {}; matDB.forEach(m => { mGroups[m.c||'Разное'] = mGroups[m.c||'Разное'] || []; mGroups[m.c||'Разное'].push(m); });
   1685:         Object.keys(mGroups).forEach((c, idx) => {
   1686:             let sid = 'db_m_'+idx;
   1687:             htmlMat += `<div class="cat-header" onclick="toggleCat('${sid}')">${epEscape(c)}</div><div class="cat-body" id="${sid}">`;
   1688:             mGroups[c].forEach(m => {
   1689:                 htmlMat += `<div class="emp-row">
   1690:                     <div style="flex:1;"><b>${epEscape(m.n)}</b><br><span style="color:var(--gray);font-size:10px;">${epEscape(m.sc || 'Разное')} • ${Number(m.p)||0} ₽ / ${epEscape(m.u || 'шт')}</span></div>
   1691:                     <div class="ep-row-actions">
   1692:                         <input type="number" value="${Number(m.p)||0}" onchange="requestPriceChange('mat', '${epEscape(m.id)}', this.value)" style="width:70px;margin:0;padding:4px;text-align:center;">
   1693:                         <button class="btn-danger" onclick="epDeleteDbItem('mat','${epEscape(m.id)}')" title="Удалить">🗑</button>
   1694:                     </div>
   1695:                 </div>`;
   1696:             });
```

### around line 1675

```js
   1663:     window.epExportGlobalDb = async function () {
   1664:         let data = { matDB: matDB, workDB: workDB };
   1665:         try {
   1666:             if (db) {
   1667:                 const doc = await db.collection('settings').doc('global_db').get();
   1668:                 if (doc.exists) data = doc.data();
   1669:             }
   1670:         } catch(e){}
   1671:         epDownloadJson('electric-pro-global-db.json', Object.assign({}, data, { exportedAt: new Date().toISOString() }));
   1672:     };
   1673: 
   1674:     // Override renderDbEditors with delete buttons
>> 1675:     const epOldRenderDbEditors = window.renderDbEditors;
   1676:     window.renderDbEditors = function () {
   1677:         let catsM = [...new Set(matDB.map(m=>m.c || 'Разное'))];
   1678:         let catsW = [...new Set(workDB.map(w=>w.c || 'Разное'))];
   1679: 
   1680:         const catsEl = document.getElementById('db-cats');
   1681:         if (catsEl) catsEl.innerHTML = [...new Set([...catsM, ...catsW])].map(c=>`<option value="${epEscape(c)}">`).join('');
   1682: 
   1683:         let htmlMat = '';
   1684:         let mGroups = {}; matDB.forEach(m => { mGroups[m.c||'Разное'] = mGroups[m.c||'Разное'] || []; mGroups[m.c||'Разное'].push(m); });
   1685:         Object.keys(mGroups).forEach((c, idx) => {
   1686:             let sid = 'db_m_'+idx;
   1687:             htmlMat += `<div class="cat-header" onclick="toggleCat('${sid}')">${epEscape(c)}</div><div class="cat-body" id="${sid}">`;
   1688:             mGroups[c].forEach(m => {
   1689:                 htmlMat += `<div class="emp-row">
   1690:                     <div style="flex:1;"><b>${epEscape(m.n)}</b><br><span style="color:var(--gray);font-size:10px;">${epEscape(m.sc || 'Разное')} • ${Number(m.p)||0} ₽ / ${epEscape(m.u || 'шт')}</span></div>
   1691:                     <div class="ep-row-actions">
   1692:                         <input type="number" value="${Number(m.p)||0}" onchange="requestPriceChange('mat', '${epEscape(m.id)}', this.value)" style="width:70px;margin:0;padding:4px;text-align:center;">
   1693:                         <button class="btn-danger" onclick="epDeleteDbItem('mat','${epEscape(m.id)}')" title="Удалить">🗑</button>
   1694:                     </div>
   1695:                 </div>`;
   1696:             });
   1697:             htmlMat += `</div>`;
```


## openMatCatalog

Найдено строк: 234, 2062, 2063, 2386, 2389, 2628, 2631, 2896, 3410, 3764, 4231, 4651, 4652, 4688, 5114, 5504, 6151, 8378, 8918

### around line 234

```js
   222: /* V40 SAFE: moved top-level function applySwap to 01-visual.js, 04-database.js, 05-ai-functions.js, 10-estimate-views.js, 11-pdf-files.js, 12-documents.js, estimate.js */
   223: 
   224: 
   225: /* V40 SAFE: moved top-level function renderMainTable to 01-visual.js, 02-shield-configurator.js, 05-ai-functions.js, 08-accounting.js, 10-estimate-views.js, 11-pdf-files.js, 12-documents.js, estimate.js */
   226: 
   227: 
   228: /* V40 SAFE: moved top-level function syncDraft to 04-database.js, 05-ai-functions.js, 07-settings.js, 10-estimate-views.js, estimate.js */
   229: 
   230: 
   231: /* V40 SAFE: moved top-level function clearCurrentEstimate to 01-visual.js, 05-ai-functions.js, 10-estimate-views.js, estimate.js */
   232: 
   233: 
>> 234: /* V40 SAFE: moved top-level function openMatCatalog to 01-visual.js, 04-database.js, 11-pdf-files.js, 12-documents.js, database.js */
   235: 
   236: 
   237: /* V40 SAFE: moved top-level function openWorkCatalog to 01-visual.js, 04-database.js, 07-settings.js, 10-estimate-views.js, 11-pdf-files.js, 12-documents.js, database.js */
   238: 
   239: 
   240: /* V40 SAFE: moved top-level function toggleCat to 11-pdf-files.js, 12-documents.js, database.js */
   241: 
   242: 
   243: /* V40 SAFE: moved top-level function promptAdd to 01-visual.js, 04-database.js, 05-ai-functions.js, 10-estimate-views.js, 11-pdf-files.js, 12-documents.js, database.js */
   244: 
   245: 
   246: /* V40 SAFE: moved top-level function confirmQtyAdd to 01-visual.js, 02-shield-configurator.js, 10-estimate-views.js, 11-pdf-files.js, 12-documents.js, database.js */
   247: 
   248: 
   249: /* V40 SAFE: moved top-level function addAuto to 01-visual.js, 02-shield-configurator.js, 05-ai-functions.js, 10-estimate-views.js, estimate.js */
   250: 
   251: 
   252: /* V40 SAFE: moved top-level function setPodr to 03-socket-pool.js, 11-pdf-files.js, 12-documents.js, socket-pool.js */
   253: 
   254: 
   255: /* V40 SAFE: moved top-level function setH to 03-socket-pool.js, 11-pdf-files.js, 12-documents.js, socket-pool.js */
   256: 
```

### around line 2062

```js
   2050:     window.epToggleSubCat = function(id, ev) { if (ev) ev.stopPropagation(); const el = document.getElementById(id); if (el) el.classList.toggle('active'); };
   2051:     window.epPromptGroupedAdd = function(id, type) {
   2052:         const item = epArr(type).map(x => type === 'work' ? epNormalizeWorkItem(x) : x).find(x => String(x.id) === String(id));
   2053:         if (!item) return;
   2054:         window.pendingAdd = { item: epEstimateCopy(item, type), type: type };
   2055:         const nameEl = document.getElementById('qty-prompt-name'); if (nameEl) nameEl.innerText = type === 'work' ? epDisplayWorkName(item) : item.n;
   2056:         const qtyEl = document.getElementById('qty-input'); if (qtyEl) qtyEl.value = 1;
   2057:         openModal('qtyPromptModal');
   2058:     };
   2059:     const oldPromptAddFull = window.promptAdd;
   2060:     window.promptAdd = function(id, type) { if (type === 'work') return window.epPromptGroupedAdd(id, type); if (typeof oldPromptAddFull === 'function') return oldPromptAddFull(id, type); return window.epPromptGroupedAdd(id, type); };
   2061:     window.openWorkCatalog = function() { epNormalizeAllWorkDb(); const el = document.getElementById('work-cat-list'); if (el) el.innerHTML = epRenderGroupedList(workDB || [], 'work', { prefix:'wcat_full', mode:'catalog' }); openModal('workModal'); };
>> 2062:     const oldOpenMatCatalogFull = window.openMatCatalog;
   2063:     window.openMatCatalog = function() {
   2064:         const hasNested = (matDB || []).some(x => x.sc || x.g);
   2065:         if (!hasNested && typeof oldOpenMatCatalogFull === 'function') return oldOpenMatCatalogFull();
   2066:         const el = document.getElementById('mat-cat-list'); if (el) el.innerHTML = epRenderGroupedList(matDB || [], 'mat', { prefix:'mcat_full', mode:'catalog' }); openModal('matCatModal');
   2067:     };
   2068:     window.renderDbEditors = function() {
   2069:         epNormalizeAllWorkDb();
   2070:         const catsM = [...new Set((matDB || []).map(m => m.c || 'Разное'))];
   2071:         const catsW = [...new Set((workDB || []).map(w => w.c || 'Разное'))];
   2072:         const catsEl = document.getElementById('db-cats'); if (catsEl) catsEl.innerHTML = [...new Set([...catsM, ...catsW])].map(c => `<option value="${epEsc(c)}">`).join('');
   2073:         const em = document.getElementById('editor-mat-list'); const ew = document.getElementById('editor-work-list');
   2074:         if (em) em.innerHTML = epRenderGroupedList(matDB || [], 'mat', { prefix:'db_m_full', mode:'editor' });
   2075:         if (ew) ew.innerHTML = epRenderGroupedList(workDB || [], 'work', { prefix:'db_w_full', mode:'editor' });
   2076:     };
   2077: 
   2078:     async function epGetGlobalDb() {
   2079:         try {
   2080:             if (db) {
   2081:                 const doc = await db.collection('settings').doc('global_db').get();
   2082:                 if (doc.exists) {
   2083:                     const d = doc.data() || {};
   2084:                     epGlobalDbCache.matDB = Array.isArray(d.matDB) ? d.matDB : (matDB || []);
```

### around line 2063

```js
   2051:     window.epPromptGroupedAdd = function(id, type) {
   2052:         const item = epArr(type).map(x => type === 'work' ? epNormalizeWorkItem(x) : x).find(x => String(x.id) === String(id));
   2053:         if (!item) return;
   2054:         window.pendingAdd = { item: epEstimateCopy(item, type), type: type };
   2055:         const nameEl = document.getElementById('qty-prompt-name'); if (nameEl) nameEl.innerText = type === 'work' ? epDisplayWorkName(item) : item.n;
   2056:         const qtyEl = document.getElementById('qty-input'); if (qtyEl) qtyEl.value = 1;
   2057:         openModal('qtyPromptModal');
   2058:     };
   2059:     const oldPromptAddFull = window.promptAdd;
   2060:     window.promptAdd = function(id, type) { if (type === 'work') return window.epPromptGroupedAdd(id, type); if (typeof oldPromptAddFull === 'function') return oldPromptAddFull(id, type); return window.epPromptGroupedAdd(id, type); };
   2061:     window.openWorkCatalog = function() { epNormalizeAllWorkDb(); const el = document.getElementById('work-cat-list'); if (el) el.innerHTML = epRenderGroupedList(workDB || [], 'work', { prefix:'wcat_full', mode:'catalog' }); openModal('workModal'); };
   2062:     const oldOpenMatCatalogFull = window.openMatCatalog;
>> 2063:     window.openMatCatalog = function() {
   2064:         const hasNested = (matDB || []).some(x => x.sc || x.g);
   2065:         if (!hasNested && typeof oldOpenMatCatalogFull === 'function') return oldOpenMatCatalogFull();
   2066:         const el = document.getElementById('mat-cat-list'); if (el) el.innerHTML = epRenderGroupedList(matDB || [], 'mat', { prefix:'mcat_full', mode:'catalog' }); openModal('matCatModal');
   2067:     };
   2068:     window.renderDbEditors = function() {
   2069:         epNormalizeAllWorkDb();
   2070:         const catsM = [...new Set((matDB || []).map(m => m.c || 'Разное'))];
   2071:         const catsW = [...new Set((workDB || []).map(w => w.c || 'Разное'))];
   2072:         const catsEl = document.getElementById('db-cats'); if (catsEl) catsEl.innerHTML = [...new Set([...catsM, ...catsW])].map(c => `<option value="${epEsc(c)}">`).join('');
   2073:         const em = document.getElementById('editor-mat-list'); const ew = document.getElementById('editor-work-list');
   2074:         if (em) em.innerHTML = epRenderGroupedList(matDB || [], 'mat', { prefix:'db_m_full', mode:'editor' });
   2075:         if (ew) ew.innerHTML = epRenderGroupedList(workDB || [], 'work', { prefix:'db_w_full', mode:'editor' });
   2076:     };
   2077: 
   2078:     async function epGetGlobalDb() {
   2079:         try {
   2080:             if (db) {
   2081:                 const doc = await db.collection('settings').doc('global_db').get();
   2082:                 if (doc.exists) {
   2083:                     const d = doc.data() || {};
   2084:                     epGlobalDbCache.matDB = Array.isArray(d.matDB) ? d.matDB : (matDB || []);
   2085:                     epGlobalDbCache.workDB = Array.isArray(d.workDB) ? epMergeFullWorksInto(d.workDB) : epMergeFullWorksInto(workDB || []);
```

### around line 2386

```js
   2374:   window.epToggleShieldDbSub = function(id, e){ if(e) e.stopPropagation(); var el=qs(id); if(el) el.classList.toggle('active'); };
   2375:   window.epPromptShieldGroupedAdd = function(id, type){
   2376:     var arr = type === 'work' ? (window.workDB || []) : (window.matDB || []);
   2377:     var item = arr.find(function(x){return String(x.id) === String(id);});
   2378:     if(!item) return;
   2379:     window.pendingAdd = { item:item, type:type };
   2380:     var n = qs('qty-prompt-name'); if(n) n.innerText = item.n || 'Позиция';
   2381:     var q = qs('qty-input'); if(q) q.value = 1;
   2382:     if (typeof openModal === 'function') openModal('qtyPromptModal');
   2383:   };
   2384: 
   2385:   function epPatchDbRenderers(){
>> 2386:     var oldMat = window.openMatCatalog;
   2387:     var oldWork = window.openWorkCatalog;
   2388:     var oldRender = window.renderDbEditors;
   2389:     window.openMatCatalog = function(){ epNormalizeMaterialsDb(); var el=qs('mat-cat-list'); if(el) el.innerHTML = epRenderGrouped(window.matDB || [], 'mat', 'catalog', 'mat_shield'); if(typeof openModal==='function') openModal('matCatModal'); else if(oldMat) oldMat(); };
   2390:     window.openWorkCatalog = function(){ var el=qs('work-cat-list'); if(el) el.innerHTML = epRenderGrouped(window.workDB || [], 'work', 'catalog', 'work_shield'); if(typeof openModal==='function') openModal('workModal'); else if(oldWork) oldWork(); };
   2391:     window.renderDbEditors = function(){
   2392:       epNormalizeMaterialsDb();
   2393:       var catsEl = qs('db-cats');
   2394:       if (catsEl) catsEl.innerHTML = uniq([].concat((window.matDB||[]).map(function(x){return x.c;}),(window.workDB||[]).map(function(x){return x.c;}))).map(function(c){return '<option value="'+safeText(c)+'">';}).join('');
   2395:       var em=qs('editor-mat-list'); if(em) em.innerHTML = epRenderGrouped(window.matDB || [], 'mat', 'editor', 'db_mat_shield');
   2396:       var ew=qs('editor-work-list'); if(ew) ew.innerHTML = epRenderGrouped(window.workDB || [], 'work', 'editor', 'db_work_shield');
   2397:     };
   2398:   }
   2399: 
   2400:   function epAllDbItems(type){
   2401:     var a = type === 'work' ? (window.workDB || []) : (window.matDB || []);
   2402:     var b = type === 'work' ? (window.userWorkDB || []) : (window.userMatDB || []);
   2403:     return [].concat(a || [], b || []).filter(Boolean);
   2404:   }
   2405:   function epFindItem(type, words){
   2406:     var ws = (words || []).map(norm).filter(Boolean);
   2407:     var best = null, bestScore = -1;
   2408:     epAllDbItems(type).forEach(function(it){
```

### around line 2389

```js
   2377:     var item = arr.find(function(x){return String(x.id) === String(id);});
   2378:     if(!item) return;
   2379:     window.pendingAdd = { item:item, type:type };
   2380:     var n = qs('qty-prompt-name'); if(n) n.innerText = item.n || 'Позиция';
   2381:     var q = qs('qty-input'); if(q) q.value = 1;
   2382:     if (typeof openModal === 'function') openModal('qtyPromptModal');
   2383:   };
   2384: 
   2385:   function epPatchDbRenderers(){
   2386:     var oldMat = window.openMatCatalog;
   2387:     var oldWork = window.openWorkCatalog;
   2388:     var oldRender = window.renderDbEditors;
>> 2389:     window.openMatCatalog = function(){ epNormalizeMaterialsDb(); var el=qs('mat-cat-list'); if(el) el.innerHTML = epRenderGrouped(window.matDB || [], 'mat', 'catalog', 'mat_shield'); if(typeof openModal==='function') openModal('matCatModal'); else if(oldMat) oldMat(); };
   2390:     window.openWorkCatalog = function(){ var el=qs('work-cat-list'); if(el) el.innerHTML = epRenderGrouped(window.workDB || [], 'work', 'catalog', 'work_shield'); if(typeof openModal==='function') openModal('workModal'); else if(oldWork) oldWork(); };
   2391:     window.renderDbEditors = function(){
   2392:       epNormalizeMaterialsDb();
   2393:       var catsEl = qs('db-cats');
   2394:       if (catsEl) catsEl.innerHTML = uniq([].concat((window.matDB||[]).map(function(x){return x.c;}),(window.workDB||[]).map(function(x){return x.c;}))).map(function(c){return '<option value="'+safeText(c)+'">';}).join('');
   2395:       var em=qs('editor-mat-list'); if(em) em.innerHTML = epRenderGrouped(window.matDB || [], 'mat', 'editor', 'db_mat_shield');
   2396:       var ew=qs('editor-work-list'); if(ew) ew.innerHTML = epRenderGrouped(window.workDB || [], 'work', 'editor', 'db_work_shield');
   2397:     };
   2398:   }
   2399: 
   2400:   function epAllDbItems(type){
   2401:     var a = type === 'work' ? (window.workDB || []) : (window.matDB || []);
   2402:     var b = type === 'work' ? (window.userWorkDB || []) : (window.userMatDB || []);
   2403:     return [].concat(a || [], b || []).filter(Boolean);
   2404:   }
   2405:   function epFindItem(type, words){
   2406:     var ws = (words || []).map(norm).filter(Boolean);
   2407:     var best = null, bestScore = -1;
   2408:     epAllDbItems(type).forEach(function(it){
   2409:       var blob = norm([it.c,it.g,it.sc,it.n,it.brand,it.kind,it.nominal,it.curve,it.wallType,it.modules,it.mountType].join(' '));
   2410:       var score = 0;
   2411:       ws.forEach(function(w){ if(w && blob.includes(w)) score++; });
```


## openWorkCatalog

Найдено строк: 237, 2061, 2387, 2390, 2629, 2632, 2902, 3417, 3771, 4239, 4651, 4652, 4689, 5115, 5507, 6152, 8379, 8919

### around line 237

```js
   225: /* V40 SAFE: moved top-level function renderMainTable to 01-visual.js, 02-shield-configurator.js, 05-ai-functions.js, 08-accounting.js, 10-estimate-views.js, 11-pdf-files.js, 12-documents.js, estimate.js */
   226: 
   227: 
   228: /* V40 SAFE: moved top-level function syncDraft to 04-database.js, 05-ai-functions.js, 07-settings.js, 10-estimate-views.js, estimate.js */
   229: 
   230: 
   231: /* V40 SAFE: moved top-level function clearCurrentEstimate to 01-visual.js, 05-ai-functions.js, 10-estimate-views.js, estimate.js */
   232: 
   233: 
   234: /* V40 SAFE: moved top-level function openMatCatalog to 01-visual.js, 04-database.js, 11-pdf-files.js, 12-documents.js, database.js */
   235: 
   236: 
>> 237: /* V40 SAFE: moved top-level function openWorkCatalog to 01-visual.js, 04-database.js, 07-settings.js, 10-estimate-views.js, 11-pdf-files.js, 12-documents.js, database.js */
   238: 
   239: 
   240: /* V40 SAFE: moved top-level function toggleCat to 11-pdf-files.js, 12-documents.js, database.js */
   241: 
   242: 
   243: /* V40 SAFE: moved top-level function promptAdd to 01-visual.js, 04-database.js, 05-ai-functions.js, 10-estimate-views.js, 11-pdf-files.js, 12-documents.js, database.js */
   244: 
   245: 
   246: /* V40 SAFE: moved top-level function confirmQtyAdd to 01-visual.js, 02-shield-configurator.js, 10-estimate-views.js, 11-pdf-files.js, 12-documents.js, database.js */
   247: 
   248: 
   249: /* V40 SAFE: moved top-level function addAuto to 01-visual.js, 02-shield-configurator.js, 05-ai-functions.js, 10-estimate-views.js, estimate.js */
   250: 
   251: 
   252: /* V40 SAFE: moved top-level function setPodr to 03-socket-pool.js, 11-pdf-files.js, 12-documents.js, socket-pool.js */
   253: 
   254: 
   255: /* V40 SAFE: moved top-level function setH to 03-socket-pool.js, 11-pdf-files.js, 12-documents.js, socket-pool.js */
   256: 
   257: 
   258: /* V40 SAFE: moved top-level function setP to 03-socket-pool.js, 11-pdf-files.js, 12-documents.js, socket-pool.js */
   259: 
```

### around line 2061

```js
   2049: 
   2050:     window.epToggleSubCat = function(id, ev) { if (ev) ev.stopPropagation(); const el = document.getElementById(id); if (el) el.classList.toggle('active'); };
   2051:     window.epPromptGroupedAdd = function(id, type) {
   2052:         const item = epArr(type).map(x => type === 'work' ? epNormalizeWorkItem(x) : x).find(x => String(x.id) === String(id));
   2053:         if (!item) return;
   2054:         window.pendingAdd = { item: epEstimateCopy(item, type), type: type };
   2055:         const nameEl = document.getElementById('qty-prompt-name'); if (nameEl) nameEl.innerText = type === 'work' ? epDisplayWorkName(item) : item.n;
   2056:         const qtyEl = document.getElementById('qty-input'); if (qtyEl) qtyEl.value = 1;
   2057:         openModal('qtyPromptModal');
   2058:     };
   2059:     const oldPromptAddFull = window.promptAdd;
   2060:     window.promptAdd = function(id, type) { if (type === 'work') return window.epPromptGroupedAdd(id, type); if (typeof oldPromptAddFull === 'function') return oldPromptAddFull(id, type); return window.epPromptGroupedAdd(id, type); };
>> 2061:     window.openWorkCatalog = function() { epNormalizeAllWorkDb(); const el = document.getElementById('work-cat-list'); if (el) el.innerHTML = epRenderGroupedList(workDB || [], 'work', { prefix:'wcat_full', mode:'catalog' }); openModal('workModal'); };
   2062:     const oldOpenMatCatalogFull = window.openMatCatalog;
   2063:     window.openMatCatalog = function() {
   2064:         const hasNested = (matDB || []).some(x => x.sc || x.g);
   2065:         if (!hasNested && typeof oldOpenMatCatalogFull === 'function') return oldOpenMatCatalogFull();
   2066:         const el = document.getElementById('mat-cat-list'); if (el) el.innerHTML = epRenderGroupedList(matDB || [], 'mat', { prefix:'mcat_full', mode:'catalog' }); openModal('matCatModal');
   2067:     };
   2068:     window.renderDbEditors = function() {
   2069:         epNormalizeAllWorkDb();
   2070:         const catsM = [...new Set((matDB || []).map(m => m.c || 'Разное'))];
   2071:         const catsW = [...new Set((workDB || []).map(w => w.c || 'Разное'))];
   2072:         const catsEl = document.getElementById('db-cats'); if (catsEl) catsEl.innerHTML = [...new Set([...catsM, ...catsW])].map(c => `<option value="${epEsc(c)}">`).join('');
   2073:         const em = document.getElementById('editor-mat-list'); const ew = document.getElementById('editor-work-list');
   2074:         if (em) em.innerHTML = epRenderGroupedList(matDB || [], 'mat', { prefix:'db_m_full', mode:'editor' });
   2075:         if (ew) ew.innerHTML = epRenderGroupedList(workDB || [], 'work', { prefix:'db_w_full', mode:'editor' });
   2076:     };
   2077: 
   2078:     async function epGetGlobalDb() {
   2079:         try {
   2080:             if (db) {
   2081:                 const doc = await db.collection('settings').doc('global_db').get();
   2082:                 if (doc.exists) {
   2083:                     const d = doc.data() || {};
```

### around line 2387

```js
   2375:   window.epPromptShieldGroupedAdd = function(id, type){
   2376:     var arr = type === 'work' ? (window.workDB || []) : (window.matDB || []);
   2377:     var item = arr.find(function(x){return String(x.id) === String(id);});
   2378:     if(!item) return;
   2379:     window.pendingAdd = { item:item, type:type };
   2380:     var n = qs('qty-prompt-name'); if(n) n.innerText = item.n || 'Позиция';
   2381:     var q = qs('qty-input'); if(q) q.value = 1;
   2382:     if (typeof openModal === 'function') openModal('qtyPromptModal');
   2383:   };
   2384: 
   2385:   function epPatchDbRenderers(){
   2386:     var oldMat = window.openMatCatalog;
>> 2387:     var oldWork = window.openWorkCatalog;
   2388:     var oldRender = window.renderDbEditors;
   2389:     window.openMatCatalog = function(){ epNormalizeMaterialsDb(); var el=qs('mat-cat-list'); if(el) el.innerHTML = epRenderGrouped(window.matDB || [], 'mat', 'catalog', 'mat_shield'); if(typeof openModal==='function') openModal('matCatModal'); else if(oldMat) oldMat(); };
   2390:     window.openWorkCatalog = function(){ var el=qs('work-cat-list'); if(el) el.innerHTML = epRenderGrouped(window.workDB || [], 'work', 'catalog', 'work_shield'); if(typeof openModal==='function') openModal('workModal'); else if(oldWork) oldWork(); };
   2391:     window.renderDbEditors = function(){
   2392:       epNormalizeMaterialsDb();
   2393:       var catsEl = qs('db-cats');
   2394:       if (catsEl) catsEl.innerHTML = uniq([].concat((window.matDB||[]).map(function(x){return x.c;}),(window.workDB||[]).map(function(x){return x.c;}))).map(function(c){return '<option value="'+safeText(c)+'">';}).join('');
   2395:       var em=qs('editor-mat-list'); if(em) em.innerHTML = epRenderGrouped(window.matDB || [], 'mat', 'editor', 'db_mat_shield');
   2396:       var ew=qs('editor-work-list'); if(ew) ew.innerHTML = epRenderGrouped(window.workDB || [], 'work', 'editor', 'db_work_shield');
   2397:     };
   2398:   }
   2399: 
   2400:   function epAllDbItems(type){
   2401:     var a = type === 'work' ? (window.workDB || []) : (window.matDB || []);
   2402:     var b = type === 'work' ? (window.userWorkDB || []) : (window.userMatDB || []);
   2403:     return [].concat(a || [], b || []).filter(Boolean);
   2404:   }
   2405:   function epFindItem(type, words){
   2406:     var ws = (words || []).map(norm).filter(Boolean);
   2407:     var best = null, bestScore = -1;
   2408:     epAllDbItems(type).forEach(function(it){
   2409:       var blob = norm([it.c,it.g,it.sc,it.n,it.brand,it.kind,it.nominal,it.curve,it.wallType,it.modules,it.mountType].join(' '));
```

### around line 2390

```js
   2378:     if(!item) return;
   2379:     window.pendingAdd = { item:item, type:type };
   2380:     var n = qs('qty-prompt-name'); if(n) n.innerText = item.n || 'Позиция';
   2381:     var q = qs('qty-input'); if(q) q.value = 1;
   2382:     if (typeof openModal === 'function') openModal('qtyPromptModal');
   2383:   };
   2384: 
   2385:   function epPatchDbRenderers(){
   2386:     var oldMat = window.openMatCatalog;
   2387:     var oldWork = window.openWorkCatalog;
   2388:     var oldRender = window.renderDbEditors;
   2389:     window.openMatCatalog = function(){ epNormalizeMaterialsDb(); var el=qs('mat-cat-list'); if(el) el.innerHTML = epRenderGrouped(window.matDB || [], 'mat', 'catalog', 'mat_shield'); if(typeof openModal==='function') openModal('matCatModal'); else if(oldMat) oldMat(); };
>> 2390:     window.openWorkCatalog = function(){ var el=qs('work-cat-list'); if(el) el.innerHTML = epRenderGrouped(window.workDB || [], 'work', 'catalog', 'work_shield'); if(typeof openModal==='function') openModal('workModal'); else if(oldWork) oldWork(); };
   2391:     window.renderDbEditors = function(){
   2392:       epNormalizeMaterialsDb();
   2393:       var catsEl = qs('db-cats');
   2394:       if (catsEl) catsEl.innerHTML = uniq([].concat((window.matDB||[]).map(function(x){return x.c;}),(window.workDB||[]).map(function(x){return x.c;}))).map(function(c){return '<option value="'+safeText(c)+'">';}).join('');
   2395:       var em=qs('editor-mat-list'); if(em) em.innerHTML = epRenderGrouped(window.matDB || [], 'mat', 'editor', 'db_mat_shield');
   2396:       var ew=qs('editor-work-list'); if(ew) ew.innerHTML = epRenderGrouped(window.workDB || [], 'work', 'editor', 'db_work_shield');
   2397:     };
   2398:   }
   2399: 
   2400:   function epAllDbItems(type){
   2401:     var a = type === 'work' ? (window.workDB || []) : (window.matDB || []);
   2402:     var b = type === 'work' ? (window.userWorkDB || []) : (window.userMatDB || []);
   2403:     return [].concat(a || [], b || []).filter(Boolean);
   2404:   }
   2405:   function epFindItem(type, words){
   2406:     var ws = (words || []).map(norm).filter(Boolean);
   2407:     var best = null, bestScore = -1;
   2408:     epAllDbItems(type).forEach(function(it){
   2409:       var blob = norm([it.c,it.g,it.sc,it.n,it.brand,it.kind,it.nominal,it.curve,it.wallType,it.modules,it.mountType].join(' '));
   2410:       var score = 0;
   2411:       ws.forEach(function(w){ if(w && blob.includes(w)) score++; });
   2412:       if(score > bestScore){ bestScore = score; best = it; }
```

### around line 2629

```js
   2617:       });
   2618:       cat.direct.forEach(it => { html += renderItem(it,type); });
   2619:       html += '</div>';
   2620:     });
   2621:     return html || '<div style="padding:15px;color:var(--gray);font-weight:700;">База пустая или ещё загружается</div>';
   2622:   }
   2623:   
   2624: 
   2625: /* V40 SAFE: moved top-level function renderItem to 01-visual.js, 02-shield-configurator.js, 04-database.js, 07-settings.js, 10-estimate-views.js */
   2626: window.epDbToggleSub = function(id,e){ if(e) e.stopPropagation(); const el=qs(id); if(el) el.classList.toggle('active'); };
   2627: 
   2628:   const oldOpenMat = window.openMatCatalog;
>> 2629:   const oldOpenWork = window.openWorkCatalog;
   2630:   const oldRenderDb = window.renderDbEditors;
   2631:   window.openMatCatalog = function(){ try{ normalizeMaterialDb(); const el=qs('mat-cat-list'); if(el){ el.innerHTML = renderGrouped(dbArr('mat'), 'mat', 'mat'); openModal('matCatModal'); return; } }catch(e){ console.error(e); } if(oldOpenMat) oldOpenMat(); };
   2632:   window.openWorkCatalog = function(){ try{ const el=qs('work-cat-list'); if(el){ el.innerHTML = renderGrouped(dbArr('work'), 'work', 'work'); openModal('workModal'); return; } }catch(e){ console.error(e); } if(oldOpenWork) oldOpenWork(); };
   2633:   window.renderDbEditors = function(){
   2634:     try{
   2635:       normalizeMaterialDb();
   2636:       const dc = qs('db-cats'); if(dc){ const all = [].concat(dbArr('mat')||[], dbArr('work')||[]); dc.innerHTML = Array.from(new Set(all.map(x => x.c || 'Разное'))).sort().map(c => '<option value="'+safe(c)+'">').join(''); }
   2637:       const em=qs('editor-mat-list'); if(em) em.innerHTML = renderGrouped(dbArr('mat'), 'mat', 'edmat');
   2638:       const ew=qs('editor-work-list'); if(ew) ew.innerHTML = renderGrouped(dbArr('work'), 'work', 'edwork');
   2639:     }catch(e){ console.error(e); if(oldRenderDb) oldRenderDb(); }
   2640:   };
   2641: 
   2642:   
   2643: 
   2644: /* V42: moved function savedChoices to 10-estimate-views.js */
   2645: 
   2646: 
   2647: /* V42: moved function saveChoice to 10-estimate-views.js */
   2648: /* V40 SAFE: moved top-level function lookupKey to 02-shield-configurator.js */
   2649: 
   2650: 
   2651: /* V40 SAFE: moved top-level function reqName to 02-shield-configurator.js */
```


## epSetDbScope

Найдено строк: 4651, 4652, 4710, 4711, 4772, 5527, 6072, 6215, 6216, 6245, 6248, 7150, 7204, 7212, 8380

### around line 4651

```js
   4639:     EP_MY_WORK = unique(EP_MY_WORK, 'work');
   4640:     EP_SERVER_MAT = unique(EP_SERVER_MAT, 'mat');
   4641:     EP_SERVER_WORK = unique(EP_SERVER_WORK, 'work');
   4642:     syncWindowCaches();
   4643:     epRefreshDbScopeUi();
   4644:   }
   4645: 
   4646:   function sourceSwitcherHtml(type){
   4647:     return '<div style="border:1px solid var(--primary);border-radius:14px;padding:10px;margin:0 0 12px;background:rgba(79,70,229,.06);">'+
   4648:       '<div style="font-weight:900;color:var(--primary);margin-bottom:6px;">Источник: '+(type==='work'?'Работы':'Материалы')+'</div>'+
   4649:       '<div style="font-size:11px;color:var(--gray);margin-bottom:8px;">В смету и каталог попадает только выбранный источник. Вперемешку не считаем.</div>'+
   4650:       '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;">'+
>> 4651:         '<button class="'+(scope()==='my'?'btn-success':'btn-info')+'" style="margin:0;padding:10px;" onclick="epSetDbScope(&quot;my&quot;); '+(type==='work'?'openWorkCatalog()':'openMatCatalog()')+'">👤 Моя база</button>'+
   4652:         '<button class="'+(scope()==='global'?'btn-success':'btn-info')+'" style="margin:0;padding:10px;" onclick="epSetDbScope(&quot;global&quot;); '+(type==='work'?'openWorkCatalog()':'openMatCatalog()')+'">🌍 База сервера</button>'+
   4653:       '</div>'+
   4654:     '</div>';
   4655:   }
   4656: 
   4657:   window.epDbToggle = function(id,e){ if(e) e.stopPropagation(); var el=$(id); if(el) el.classList.toggle('active'); };
   4658: 
   4659:   function renderCatalog(type){
   4660:     var arr = activeArr(type);
   4661:     var html = sourceSwitcherHtml(type);
   4662:     if(!arr.length){
   4663:       return html + '<div style="padding:16px;border:1px dashed var(--border);border-radius:14px;text-align:center;color:var(--gray);font-weight:800;">'+activeLabel()+' пустая.<br><br>'+(scope()==='my'?'Можно добавить вручную, импортом или взять позицию из базы сервера.':'После полного сброса база сервера пустая. Админ может заполнить её вручную или импортом.')+'</div>';
   4664:     }
   4665:     var cats={}, i=0;
   4666:     arr.forEach(function(it){ var c=it.c||'Разное'; var g=groupOf(it)||'Без группы'; if(!cats[c]) cats[c]={}; if(!cats[c][g]) cats[c][g]=[]; cats[c][g].push(it); });
   4667:     Object.keys(cats).sort(function(a,b){return a.localeCompare(b,'ru');}).forEach(function(c){
   4668:       var cid='ep_cat_'+type+'_'+(i++);
   4669:       html += '<div class="cat-header" onclick="epDbToggle(&quot;'+cid+'&quot;, event)">'+esc(c)+'</div><div class="cat-body" id="'+cid+'">';
   4670:       Object.keys(cats[c]).sort(function(a,b){return a.localeCompare(b,'ru');}).forEach(function(g){
   4671:         var gid='ep_sub_'+type+'_'+(i++);
   4672:         html += '<div class="sub-cat-header" onclick="epDbToggle(&quot;'+gid+'&quot;, event)">'+esc(g)+' ▾</div><div class="sub-cat-body" id="'+gid+'">';
   4673:         cats[c][g].sort(function(a,b){return String(a.n||'').localeCompare(String(b.n||''),'ru');}).forEach(function(it){ html += catalogRow(type,it); });
```

### around line 4652

```js
   4640:     EP_SERVER_MAT = unique(EP_SERVER_MAT, 'mat');
   4641:     EP_SERVER_WORK = unique(EP_SERVER_WORK, 'work');
   4642:     syncWindowCaches();
   4643:     epRefreshDbScopeUi();
   4644:   }
   4645: 
   4646:   function sourceSwitcherHtml(type){
   4647:     return '<div style="border:1px solid var(--primary);border-radius:14px;padding:10px;margin:0 0 12px;background:rgba(79,70,229,.06);">'+
   4648:       '<div style="font-weight:900;color:var(--primary);margin-bottom:6px;">Источник: '+(type==='work'?'Работы':'Материалы')+'</div>'+
   4649:       '<div style="font-size:11px;color:var(--gray);margin-bottom:8px;">В смету и каталог попадает только выбранный источник. Вперемешку не считаем.</div>'+
   4650:       '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;">'+
   4651:         '<button class="'+(scope()==='my'?'btn-success':'btn-info')+'" style="margin:0;padding:10px;" onclick="epSetDbScope(&quot;my&quot;); '+(type==='work'?'openWorkCatalog()':'openMatCatalog()')+'">👤 Моя база</button>'+
>> 4652:         '<button class="'+(scope()==='global'?'btn-success':'btn-info')+'" style="margin:0;padding:10px;" onclick="epSetDbScope(&quot;global&quot;); '+(type==='work'?'openWorkCatalog()':'openMatCatalog()')+'">🌍 База сервера</button>'+
   4653:       '</div>'+
   4654:     '</div>';
   4655:   }
   4656: 
   4657:   window.epDbToggle = function(id,e){ if(e) e.stopPropagation(); var el=$(id); if(el) el.classList.toggle('active'); };
   4658: 
   4659:   function renderCatalog(type){
   4660:     var arr = activeArr(type);
   4661:     var html = sourceSwitcherHtml(type);
   4662:     if(!arr.length){
   4663:       return html + '<div style="padding:16px;border:1px dashed var(--border);border-radius:14px;text-align:center;color:var(--gray);font-weight:800;">'+activeLabel()+' пустая.<br><br>'+(scope()==='my'?'Можно добавить вручную, импортом или взять позицию из базы сервера.':'После полного сброса база сервера пустая. Админ может заполнить её вручную или импортом.')+'</div>';
   4664:     }
   4665:     var cats={}, i=0;
   4666:     arr.forEach(function(it){ var c=it.c||'Разное'; var g=groupOf(it)||'Без группы'; if(!cats[c]) cats[c]={}; if(!cats[c][g]) cats[c][g]=[]; cats[c][g].push(it); });
   4667:     Object.keys(cats).sort(function(a,b){return a.localeCompare(b,'ru');}).forEach(function(c){
   4668:       var cid='ep_cat_'+type+'_'+(i++);
   4669:       html += '<div class="cat-header" onclick="epDbToggle(&quot;'+cid+'&quot;, event)">'+esc(c)+'</div><div class="cat-body" id="'+cid+'">';
   4670:       Object.keys(cats[c]).sort(function(a,b){return a.localeCompare(b,'ru');}).forEach(function(g){
   4671:         var gid='ep_sub_'+type+'_'+(i++);
   4672:         html += '<div class="sub-cat-header" onclick="epDbToggle(&quot;'+gid+'&quot;, event)">'+esc(g)+' ▾</div><div class="sub-cat-body" id="'+gid+'">';
   4673:         cats[c][g].sort(function(a,b){return String(a.n||'').localeCompare(String(b.n||''),'ru');}).forEach(function(it){ html += catalogRow(type,it); });
   4674:         html += '</div>';
```

### around line 4710

```js
   4698:     if(q) q.value=1;
   4699:     if(typeof openModal==='function') openModal('qtyPromptModal');
   4700:   };
   4701: 
   4702:   function editorTop(type){
   4703:     var title=type==='work'?'работ':'материалов';
   4704:     var s=scope(), admin=isAdmin(), editable=canEditActive();
   4705:     var hint=s==='my'?'Редактируется личная база мастера.':(admin?'Редактируется база сервера.':'Сервер открыт только для просмотра и копирования в мою базу.');
   4706:     var html='<div style="border:1px solid var(--primary);border-radius:14px;padding:10px;margin:0 0 12px;background:rgba(79,70,229,.05);">'+
   4707:       '<div style="font-weight:900;color:var(--primary);">'+label()+' — '+title+'</div>'+
   4708:       '<div style="font-size:11px;color:var(--gray);font-weight:800;margin-top:4px;">'+hint+' Позиций: '+active(type).length+'.</div>'+
   4709:       '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:8px;">'+
>> 4710:       '<button class="'+(s==='my'?'btn-success':'btn-info')+'" style="margin:0;padding:10px;" onclick="epSetDbScope(\'my\')">👤 Моя база</button>'+
   4711:       '<button class="'+(s==='global'?'btn-success':'btn-info')+'" style="margin:0;padding:10px;" onclick="epSetDbScope(\'global\')">🌍 База сервера</button></div>';
   4712:     if(editable){
   4713:       html+='<div style="border:1px dashed var(--border);border-radius:12px;padding:8px;margin-top:8px;background:rgba(255,255,255,.35);">'+
   4714:         '<div style="font-weight:900;color:var(--primary);font-size:12px;margin-bottom:6px;">Массовые действия: выделить → перенести / удалить</div>'+
   4715:         '<input id="ep-v15-move-cat-'+type+'" placeholder="Категория, куда перенести" style="margin-bottom:6px;">'+
   4716:         '<input id="ep-v15-move-sub-'+type+'" placeholder="Группа / подкатегория" style="margin-bottom:8px;">'+
   4717:         '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;">'+
   4718:         '<button class="btn-info" style="margin:0;padding:9px;" onclick="epV15SelectVisible(\''+type+'\',true)">✅ Выделить</button>'+
   4719:         '<button class="btn-vendor" style="margin:0;padding:9px;" onclick="epV15SelectVisible(\''+type+'\',false)">⬜ Снять</button>'+
   4720:         '<button class="btn-success" style="margin:0;padding:9px;" onclick="epV15MoveSelectedActive(\''+type+'\')">📦 Перенести</button>'+
   4721:         '<button class="btn-danger" style="margin:0;padding:9px;" onclick="epDeleteSelectedActiveV7()">🗑 Удалить выбранные</button></div></div>'+
   4722:         '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:8px;"><button class="btn-success" style="margin:0;padding:9px;" onclick="epSaveActiveDbV7()">💾 Сохранить</button><button class="btn-info" style="margin:0;padding:9px;" onclick="epReloadActiveDbV7()">🔄 Обновить</button></div>';
   4723:     }
   4724:     if(s==='global'&&!admin){ html+='<div class="ep-v7-note">Серверные цены и позиции мастер не меняет. Для своей сметы нажми «В мою».</div>'; }
   4725:     return html+'</div>';
   4726:   }
   4727: 
   4728:   function renderDbRows(type){
   4729:     var arr=activeArr(type);
   4730:     var html=editorTop(type);
   4731:     if(!arr.length){
   4732:       html += '<div style="padding:15px;border:1px dashed var(--border);border-radius:12px;text-align:center;color:var(--gray);font-weight:800;">'+activeLabel()+' пустая.</div>';
```

### around line 4711

```js
   4699:     if(typeof openModal==='function') openModal('qtyPromptModal');
   4700:   };
   4701: 
   4702:   function editorTop(type){
   4703:     var title=type==='work'?'работ':'материалов';
   4704:     var s=scope(), admin=isAdmin(), editable=canEditActive();
   4705:     var hint=s==='my'?'Редактируется личная база мастера.':(admin?'Редактируется база сервера.':'Сервер открыт только для просмотра и копирования в мою базу.');
   4706:     var html='<div style="border:1px solid var(--primary);border-radius:14px;padding:10px;margin:0 0 12px;background:rgba(79,70,229,.05);">'+
   4707:       '<div style="font-weight:900;color:var(--primary);">'+label()+' — '+title+'</div>'+
   4708:       '<div style="font-size:11px;color:var(--gray);font-weight:800;margin-top:4px;">'+hint+' Позиций: '+active(type).length+'.</div>'+
   4709:       '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:8px;">'+
   4710:       '<button class="'+(s==='my'?'btn-success':'btn-info')+'" style="margin:0;padding:10px;" onclick="epSetDbScope(\'my\')">👤 Моя база</button>'+
>> 4711:       '<button class="'+(s==='global'?'btn-success':'btn-info')+'" style="margin:0;padding:10px;" onclick="epSetDbScope(\'global\')">🌍 База сервера</button></div>';
   4712:     if(editable){
   4713:       html+='<div style="border:1px dashed var(--border);border-radius:12px;padding:8px;margin-top:8px;background:rgba(255,255,255,.35);">'+
   4714:         '<div style="font-weight:900;color:var(--primary);font-size:12px;margin-bottom:6px;">Массовые действия: выделить → перенести / удалить</div>'+
   4715:         '<input id="ep-v15-move-cat-'+type+'" placeholder="Категория, куда перенести" style="margin-bottom:6px;">'+
   4716:         '<input id="ep-v15-move-sub-'+type+'" placeholder="Группа / подкатегория" style="margin-bottom:8px;">'+
   4717:         '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;">'+
   4718:         '<button class="btn-info" style="margin:0;padding:9px;" onclick="epV15SelectVisible(\''+type+'\',true)">✅ Выделить</button>'+
   4719:         '<button class="btn-vendor" style="margin:0;padding:9px;" onclick="epV15SelectVisible(\''+type+'\',false)">⬜ Снять</button>'+
   4720:         '<button class="btn-success" style="margin:0;padding:9px;" onclick="epV15MoveSelectedActive(\''+type+'\')">📦 Перенести</button>'+
   4721:         '<button class="btn-danger" style="margin:0;padding:9px;" onclick="epDeleteSelectedActiveV7()">🗑 Удалить выбранные</button></div></div>'+
   4722:         '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:8px;"><button class="btn-success" style="margin:0;padding:9px;" onclick="epSaveActiveDbV7()">💾 Сохранить</button><button class="btn-info" style="margin:0;padding:9px;" onclick="epReloadActiveDbV7()">🔄 Обновить</button></div>';
   4723:     }
   4724:     if(s==='global'&&!admin){ html+='<div class="ep-v7-note">Серверные цены и позиции мастер не меняет. Для своей сметы нажми «В мою».</div>'; }
   4725:     return html+'</div>';
   4726:   }
   4727: 
   4728:   function renderDbRows(type){
   4729:     var arr=activeArr(type);
   4730:     var html=editorTop(type);
   4731:     if(!arr.length){
   4732:       html += '<div style="padding:15px;border:1px dashed var(--border);border-radius:12px;text-align:center;color:var(--gray);font-weight:800;">'+activeLabel()+' пустая.</div>';
   4733:       return html;
```

### around line 4772

```js
   4760:     syncWindowCaches();
   4761:     epRefreshDbScopeUi();
   4762:     var catsEl=$('db-cats');
   4763:     if(catsEl){
   4764:       var all=activeArr('mat').concat(activeArr('work'));
   4765:       catsEl.innerHTML=Array.from(new Set(all.map(function(x){return x.c||'Разное';}))).sort(function(a,b){return a.localeCompare(b,'ru');}).map(function(c){return '<option value="'+esc(c)+'">';}).join('');
   4766:     }
   4767:     var m=$('editor-mat-list'), w=$('editor-work-list');
   4768:     if(m) m.innerHTML=renderDbRows('mat');
   4769:     if(w) w.innerHTML=renderDbRows('work');
   4770:   };
   4771: 
>> 4772:   window.epSetDbScope = function(s){
   4773:     localStorage.setItem(LS_SCOPE, s==='global' ? 'global' : 'my');
   4774:     syncWindowCaches();
   4775:     epRefreshDbScopeUi();
   4776:     if(typeof renderDbEditors==='function') renderDbEditors();
   4777:     toast('Работаем по базе: ' + activeLabel());
   4778:   };
   4779: 
   4780:   window.epCreateMasterDb = async function(){
   4781:     try{ localStorage.setItem(LS_MASTER_CREATED,'1'); localStorage.setItem(LS_SCOPE,'my'); }catch(e){}
   4782:     EP_MY_MAT = arrLS(LS_MY_MAT);
   4783:     EP_MY_WORK = arrLS(LS_MY_WORK);
   4784:     setLS(LS_MY_MAT, EP_MY_MAT);
   4785:     setLS(LS_MY_WORK, EP_MY_WORK);
   4786:     syncWindowCaches();
   4787:     await epSaveMyDbToServer();
   4788:     renderDbEditors();
   4789:     toast('✅ Своя база создана. Добавление и импорт идут в мою базу без админа.');
   4790:   };
   4791: 
   4792:   window.epCopyOneServerToMy = function(type,item){
   4793:     var it=dec(item);
   4794:     if(!it) return toast('Позиция не найдена');
```


## epReloadActiveDbV7

Найдено строк: 4722, 6184, 6268, 6543, 8381

### around line 4722

```js
   4710:       '<button class="'+(s==='my'?'btn-success':'btn-info')+'" style="margin:0;padding:10px;" onclick="epSetDbScope(\'my\')">👤 Моя база</button>'+
   4711:       '<button class="'+(s==='global'?'btn-success':'btn-info')+'" style="margin:0;padding:10px;" onclick="epSetDbScope(\'global\')">🌍 База сервера</button></div>';
   4712:     if(editable){
   4713:       html+='<div style="border:1px dashed var(--border);border-radius:12px;padding:8px;margin-top:8px;background:rgba(255,255,255,.35);">'+
   4714:         '<div style="font-weight:900;color:var(--primary);font-size:12px;margin-bottom:6px;">Массовые действия: выделить → перенести / удалить</div>'+
   4715:         '<input id="ep-v15-move-cat-'+type+'" placeholder="Категория, куда перенести" style="margin-bottom:6px;">'+
   4716:         '<input id="ep-v15-move-sub-'+type+'" placeholder="Группа / подкатегория" style="margin-bottom:8px;">'+
   4717:         '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;">'+
   4718:         '<button class="btn-info" style="margin:0;padding:9px;" onclick="epV15SelectVisible(\''+type+'\',true)">✅ Выделить</button>'+
   4719:         '<button class="btn-vendor" style="margin:0;padding:9px;" onclick="epV15SelectVisible(\''+type+'\',false)">⬜ Снять</button>'+
   4720:         '<button class="btn-success" style="margin:0;padding:9px;" onclick="epV15MoveSelectedActive(\''+type+'\')">📦 Перенести</button>'+
   4721:         '<button class="btn-danger" style="margin:0;padding:9px;" onclick="epDeleteSelectedActiveV7()">🗑 Удалить выбранные</button></div></div>'+
>> 4722:         '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:8px;"><button class="btn-success" style="margin:0;padding:9px;" onclick="epSaveActiveDbV7()">💾 Сохранить</button><button class="btn-info" style="margin:0;padding:9px;" onclick="epReloadActiveDbV7()">🔄 Обновить</button></div>';
   4723:     }
   4724:     if(s==='global'&&!admin){ html+='<div class="ep-v7-note">Серверные цены и позиции мастер не меняет. Для своей сметы нажми «В мою».</div>'; }
   4725:     return html+'</div>';
   4726:   }
   4727: 
   4728:   function renderDbRows(type){
   4729:     var arr=activeArr(type);
   4730:     var html=editorTop(type);
   4731:     if(!arr.length){
   4732:       html += '<div style="padding:15px;border:1px dashed var(--border);border-radius:12px;text-align:center;color:var(--gray);font-weight:800;">'+activeLabel()+' пустая.</div>';
   4733:       return html;
   4734:     }
   4735:     var cats={}, i=0;
   4736:     arr.forEach(function(it){ var c=it.c||'Разное'; var g=groupOf(it)||'Без группы'; if(!cats[c]) cats[c]={}; if(!cats[c][g]) cats[c][g]=[]; cats[c][g].push(it); });
   4737:     Object.keys(cats).sort(function(a,b){return a.localeCompare(b,'ru');}).forEach(function(c){
   4738:       var cid='db_cat_'+type+'_'+(i++);
   4739:       html += '<div class="cat-header" onclick="epDbToggle(&quot;'+cid+'&quot;, event)">'+esc(c)+'</div><div class="cat-body" id="'+cid+'">';
   4740:       Object.keys(cats[c]).sort(function(a,b){return a.localeCompare(b,'ru');}).forEach(function(g){
   4741:         var gid='db_sub_'+type+'_'+(i++);
   4742:         html += '<div class="sub-cat-header" onclick="epDbToggle(&quot;'+gid+'&quot;, event)">'+esc(g)+' ▾</div><div class="sub-cat-body" id="'+gid+'">';
   4743:         cats[c][g].sort(function(a,b){return String(a.n||'').localeCompare(String(b.n||''),'ru');}).forEach(function(it){ html += editorRow(type,it); });
   4744:         html += '</div>';
```

### around line 6184

```js
   6172:     if(my || admin){
   6173:       html+='<button class="btn-info" onclick="epTriggerDbFileImport(\'mat\')">📥 Импорт материалов</button>'+
   6174:             '<button class="btn-work" onclick="epTriggerDbFileImport(\'work\')">📥 Импорт работ</button>'+
   6175:             '<button class="btn-vendor" onclick="epOpenTextImport && epOpenTextImport(\'mat\')">📝 Материалы текстом</button>'+
   6176:             '<button class="btn-vendor" onclick="epOpenTextImport && epOpenTextImport(\'work\')">📝 Работы текстом</button>';
   6177:     } else {
   6178:       html+='<button class="btn-info" onclick="epTriggerServerProposalImportV7(\'mat\')">📨 Материалы заявкой админу</button>'+
   6179:             '<button class="btn-work" onclick="epTriggerServerProposalImportV7(\'work\')">📨 Работы заявкой админу</button>'+
   6180:             '<button class="btn-vendor" onclick="epOpenTextImportServerProposalV7(\'mat\')">📝 Материалы заявкой</button>'+
   6181:             '<button class="btn-vendor" onclick="epOpenTextImportServerProposalV7(\'work\')">📝 Работы заявкой</button>';
   6182:     }
   6183:     html+='<button class="btn-success" onclick="epExportActiveDb()">📤 Экспорт этой базы</button>'+
>> 6184:           '<button class="btn-info" onclick="epReloadActiveDbV7()">🔄 Обновить / перезагрузить</button>';
   6185:     if(canEditActive()) html+='<button class="btn-primary" onclick="epSaveActiveDbV7()">💾 Сохранить базу</button>';
   6186:     if(my) html+='<button class="btn-danger" onclick="epOpenDbFactoryResetModal && epOpenDbFactoryResetModal()">🧹 Очистка / сброс</button>';
   6187:     else if(admin) html+='<button class="btn-danger" onclick="epOpenDbFactoryResetModal && epOpenDbFactoryResetModal()">🧹 Очистка сервера</button>';
   6188:     html+='</div>';
   6189:     if(!my && !admin) html+='<div class="ep-v7-note">Редактирование, сохранение, замена и цены сервера заблокированы для мастера.</div>';
   6190:     p.innerHTML=html;
   6191:   }
   6192:   function tuneStaticBlocks(){
   6193:     renderPanel();
   6194:     var my=$('ep-scope-my-btn'), gl=$('ep-scope-global-btn'), st=$('ep-db-scope-status');
   6195:     if(my){ my.className=scope()==='my'?'btn-success':'btn-info'; my.textContent='👤 Моя база данных'; }
   6196:     if(gl){ gl.className=scope()==='global'?'btn-success':'btn-info'; gl.textContent='🌍 База сервера'; }
   6197:     if(st) st.innerHTML='Главный переключатель: <b>'+label()+'</b>. Отображение и расчёт идут только из выбранного источника.';
   6198:     var old=$('ep-db-ai-tools'); if(old) old.style.display='none';
   6199:     var clean=$('ep-clean-status-line'); if(clean) clean.textContent='Активная база: '+label()+'. Материалы: '+active('mat').length+', работы: '+active('work').length+'.';
   6200:     var addBtn=document.querySelector('#settModal button[onclick="addDbItem()"]');
   6201:     var addBlock=null;
   6202:     if(addBtn){ var x=addBtn.parentElement; while(x&&x.id!=='settModal'){ if((x.querySelector&&x.querySelector('#db-new-cat'))){ addBlock=x; break; } x=x.parentElement; } }
   6203:     if(addBlock){ addBlock.style.display=canEditActive()?'block':'none'; }
   6204:     if(addBtn){ addBtn.textContent=scope()==='global'?' + Добавить в базу сервера':' + Добавить в мою базу'; }
   6205:   }
   6206: 
```

### around line 6268

```js
   6256:     it=Object.assign({},it,{p:money(newPrice)}); arr=upsert(arr,type,it,true);
   6257:     if(scope()==='global') setServer(type,arr); else setMy(type,arr);
   6258:     showProgress('Сохраняю цену',45,'Локально');
   6259:     if(scope()==='global') await saveServerRemote(showProgress); else await saveMyRemote(showProgress);
   6260:     showProgress('Сохраняю цену',100,'Готово'); setTimeout(hideProgress,350); renderDbEditors();
   6261:   };
   6262:   window.epSaveActiveDbV7=async function(){
   6263:     if(!canEditActive()) return toast('Сохранять базу сервера может только админ');
   6264:     showProgress('Сохраняю '+label(),20,'Подготовка');
   6265:     var ok=scope()==='global'?await saveServerRemote(showProgress):await saveMyRemote(showProgress);
   6266:     await reloadActiveDb(); showProgress('Сохраняю '+label(),100,ok?'Готово':'Локально сохранено'); setTimeout(hideProgress,450); toast(ok?'✅ База сохранена и перезагружена':'⚠️ Сервер не подтвердил, локальная база обновлена');
   6267:   };
>> 6268:   window.epReloadActiveDbV7=async function(){ showProgress('Перезагружаю '+label(),20,'Запрос'); await reloadActiveDb(); showProgress('Перезагружаю '+label(),100,'Готово'); setTimeout(hideProgress,350); };
   6269:   window.epDeleteSelectedActiveV7=async function(){
   6270:     if(!canEditActive()) return toast('Удалять на сервере может только админ');
   6271:     var checks=Array.from(document.querySelectorAll('#settModal .ep-v7-select:checked')); if(!checks.length)return toast('Выберите позиции');
   6272:     if(!confirm('Удалить выбранные позиции из '+label()+'?')) return;
   6273:     var rm={mat:new Set(),work:new Set()}; checks.forEach(function(ch){ rm[ch.dataset.type].add(String(ch.dataset.id||'')); });
   6274:     ['mat','work'].forEach(function(type){ if(!rm[type].size)return; var arr=active(type).filter(function(x){return !rm[type].has(String(x.id||''));}); if(scope()==='global') setServer(type,arr); else setMy(type,arr); });
   6275:     showProgress('Удаляю позиции',50,'Запись'); if(scope()==='global') await saveServerRemote(showProgress); else await saveMyRemote(showProgress); await reloadActiveDb(); showProgress('Удаляю позиции',100,'Готово'); setTimeout(hideProgress,350);
   6276:   };
   6277: 
   6278:   function downloadJson(filename,data){
   6279:     showProgress('Экспорт базы',25,'Подготовка файла');
   6280:     var blob=new Blob([JSON.stringify(data,null,2)],{type:'application/json;charset=utf-8'});
   6281:     showProgress('Экспорт базы',70,'Скачивание');
   6282:     var url=URL.createObjectURL(blob), a=document.createElement('a'); a.href=url; a.download=filename; document.body.appendChild(a); a.click(); a.remove();
   6283:     setTimeout(function(){URL.revokeObjectURL(url);},1000);
   6284:     showProgress('Экспорт базы',100,'Готово'); setTimeout(function(){hideProgress(); reloadActiveDb();},500);
   6285:   }
   6286:   window.epExportActiveDb=function(){ var s=scope(); downloadJson(s==='global'?'electric-pro-server-db.json':'electric-pro-my-db.json',{source:s==='global'?'server':'my',matDB:s==='global'?getServer('mat'):getMy('mat'),workDB:s==='global'?getServer('work'):getMy('work'),exportedAt:new Date().toISOString()}); };
   6287:   window.epExportMyDb=function(){ downloadJson('electric-pro-my-db.json',{source:'my',matDB:getMy('mat'),workDB:getMy('work'),exportedAt:new Date().toISOString()}); };
   6288:   window.epExportGlobalDb=function(){ downloadJson('electric-pro-server-db.json',{source:'server',matDB:getServer('mat'),workDB:getServer('work'),exportedAt:new Date().toISOString()}); };
   6289: 
   6290:   function fileTextProgress(file,onp){ return new Promise(function(resolve,reject){ var r=new FileReader(); r.onprogress=function(e){ if(e.lengthComputable&&onp)onp(Math.min(45,10+e.loaded/e.total*35),'Чтение файла');}; r.onload=function(){resolve(String(r.result||''));}; r.onerror=reject; r.readAsText(file); }); }
```

### around line 6543

```js
   6531:       if(scope()==='global'){
   6532:         await saveServerRemote(showProgress);
   6533:         await reloadFromRemoteCurrent();
   6534:         toast('✅ База сервера сохранена и перезагружена');
   6535:       } else {
   6536:         try{ await saveMyRemote(showProgress); await reloadFromRemoteCurrent(); toast('✅ Моя база сохранена и перезагружена'); }
   6537:         catch(e){ toast('⚠️ Моя база сохранена на телефоне, но не на сервере: '+explainErr(e)); }
   6538:       }
   6539:       showProgress('Сохраняю '+label(),100,'Готово'); setTimeout(hideProgress,450); rerender();
   6540:     }catch(e){ hideProgress(); toast('❌ '+explainErr(e)); console.error('EP V8 save active failed',e); rerender(); }
   6541:   };
   6542: 
>> 6543:   window.epReloadActiveDbV7=async function(){
   6544:     showProgress('Перезагружаю '+label(),20,'Запрос');
   6545:     var ok=await reloadFromRemoteCurrent();
   6546:     syncMain(scope()); rerender();
   6547:     showProgress('Перезагружаю '+label(),100,ok?'С сервера':'Локально');
   6548:     setTimeout(hideProgress,350);
   6549:     toast(ok?'✅ База обновлена с сервера':'⚠️ Сервер не отдал базу. Показана локальная копия.');
   6550:   };
   6551: 
   6552:   window.epCopyOneServerToMy=async function(type,itemStr){
   6553:     type=type==='work'?'work':'mat';
   6554:     try{
   6555:       var it=JSON.parse(decodeURIComponent(itemStr||'{}'));
   6556:       if(!it||!it.n) throw new Error('Позиция не найдена');
   6557:       var copy=clone(it); copy.originServerId=copy.originServerId||copy.id||''; copy.id='local_'+type+'_v8_'+Date.now()+'_'+Math.random().toString(36).slice(2,8);
   6558:       var arr=getMy(type); arr=upsert(arr,type,copy,true); setMy(type,arr);
   6559:       showProgress('Добавляю в мою базу',45,'Локально');
   6560:       try{ await saveMyRemote(showProgress); toast('✅ Позиция добавлена и сохранена в моей базе'); }
   6561:       catch(e){ toast('⚠️ Добавлено на телефоне, сервер не подтвердил: '+explainErr(e)); }
   6562:       showProgress('Добавляю в мою базу',100,'Готово'); setTimeout(hideProgress,350); rerender();
   6563:     }catch(e){ hideProgress(); toast('❌ '+explainErr(e)); }
   6564:   };
   6565:   window.epCopyOneGlobalToMy=window.epCopyOneServerToMy;
```

### around line 8381

```js
   8369:   };
   8370:   window.epV18DeleteSelected=async function(){
   8371:     var checks=selectedChecks(); if(!checks.length) return toast('Выбери позиции галочками слева');
   8372:     var ok=true; try{ if(typeof customConfirm==='function') ok=await customConfirm('Удаление','Удалить выбранные позиции: '+checks.length+'?'); else ok=confirm('Удалить выбранные позиции: '+checks.length+'?'); }catch(e){}
   8373:     if(!ok) return; var byType={mat:{},work:{}}; checks.forEach(function(ch){ byType[ch.dataset.type==='work'?'work':'mat'][String(ch.dataset.id||'')]=1; }); var removed=0;
   8374:     for(var type in byType){ var ids=byType[type]; if(!Object.keys(ids).length) continue; var arr=getArr(type).filter(function(it){ if(ids[String(it.id||'')]){ removed++; return false; } return true; }); await saveArr(type,arr); }
   8375:     refreshDbEnhancements(); try{ if(typeof renderDbEditors==='function') renderDbEditors(); }catch(e){} toast('🗑 Удалено: '+removed);
   8376:   };
   8377: 
   8378:   var oldOpenMat=window.openMatCatalog; window.openMatCatalog=function(){ lastOpenedType='mat'; var r=oldOpenMat?oldOpenMat.apply(this,arguments):undefined; setTimeout(refreshDbEnhancements,120); return r; };
   8379:   var oldOpenWork=window.openWorkCatalog; window.openWorkCatalog=function(){ lastOpenedType='work'; var r=oldOpenWork?oldOpenWork.apply(this,arguments):undefined; setTimeout(refreshDbEnhancements,120); return r; };
   8380:   var oldSetScope=window.epSetDbScope; window.epSetDbScope=function(s){ epV18SetStatus('download','загрузка с сервера'); var r=oldSetScope?oldSetScope.apply(this,arguments):undefined; Promise.resolve(r).finally(function(){ setTimeout(function(){ epV18SetStatus('ok','V18 активна'); refreshDbEnhancements(); },350); }); return r; };
>> 8381:   var oldReload=window.epReloadActiveDbV7; window.epReloadActiveDbV7=function(){ epV18SetStatus('download','загрузка с сервера'); var r=oldReload?oldReload.apply(this,arguments):undefined; Promise.resolve(r).finally(function(){ setTimeout(function(){ epV18SetStatus('ok','V18 активна'); refreshDbEnhancements(); },350); }); return r; };
   8382:   var oldSave=window.epSaveActiveDbV7; window.epSaveActiveDbV7=function(){ epV18SetStatus('upload','запись на сервер'); var r=oldSave?oldSave.apply(this,arguments):undefined; Promise.resolve(r).finally(function(){ setTimeout(function(){ epV18SetStatus('ok','V18 активна'); },350); }); return r; };
   8383: 
   8384:   window.addEventListener('click',function(ev){
   8385:     var b=ev.target&&ev.target.closest?ev.target.closest('button'):null; if(!b) return; var t=clean(b.textContent);
   8386:     if(t.indexOf('Сгенерировать щит')>=0){ ev.preventDefault(); ev.stopImmediatePropagation(); window.epV18GenerateShield(); return false; }
   8387:     if(t.indexOf('Детализация')>=0){ ev.preventDefault(); ev.stopImmediatePropagation(); window.epV18ShowDetails(); return false; }
   8388:   },true);
   8389: 
   8390:   function boot(){ ensureBadge(); epV18SetStatus('ok','V18 активна'); syncActiveToMain(scope()); refreshDbEnhancements(); try{ window.currentEstimate=currentEstimate; renderMainDirect(); }catch(e){} toast(BUILD+' загружена'); }
   8391:   if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',function(){ setTimeout(boot,180); }); else setTimeout(boot,180);
   8392:   setInterval(function(){ ensureBadge(); refreshDbEnhancements(); },2500);
   8393: })();
   8394: 
   8395: 
   8396: /* =========================================================
   8397:  * SOURCE: legacy/extracted-js-blocks/block-26.js
   8398:  * ========================================================= */
   8399: 
   8400: /*
   8401:  * Extracted from public/index.html
   8402:  * Original script block: 26
   8403:  * Original HTML lines: 10092-10234
```


## epSaveActiveDbV7

Найдено строк: 4722, 6185, 6217, 6262, 6527, 7265, 7272, 7778, 8122, 8129, 8382

### around line 4722

```js
   4710:       '<button class="'+(s==='my'?'btn-success':'btn-info')+'" style="margin:0;padding:10px;" onclick="epSetDbScope(\'my\')">👤 Моя база</button>'+
   4711:       '<button class="'+(s==='global'?'btn-success':'btn-info')+'" style="margin:0;padding:10px;" onclick="epSetDbScope(\'global\')">🌍 База сервера</button></div>';
   4712:     if(editable){
   4713:       html+='<div style="border:1px dashed var(--border);border-radius:12px;padding:8px;margin-top:8px;background:rgba(255,255,255,.35);">'+
   4714:         '<div style="font-weight:900;color:var(--primary);font-size:12px;margin-bottom:6px;">Массовые действия: выделить → перенести / удалить</div>'+
   4715:         '<input id="ep-v15-move-cat-'+type+'" placeholder="Категория, куда перенести" style="margin-bottom:6px;">'+
   4716:         '<input id="ep-v15-move-sub-'+type+'" placeholder="Группа / подкатегория" style="margin-bottom:8px;">'+
   4717:         '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;">'+
   4718:         '<button class="btn-info" style="margin:0;padding:9px;" onclick="epV15SelectVisible(\''+type+'\',true)">✅ Выделить</button>'+
   4719:         '<button class="btn-vendor" style="margin:0;padding:9px;" onclick="epV15SelectVisible(\''+type+'\',false)">⬜ Снять</button>'+
   4720:         '<button class="btn-success" style="margin:0;padding:9px;" onclick="epV15MoveSelectedActive(\''+type+'\')">📦 Перенести</button>'+
   4721:         '<button class="btn-danger" style="margin:0;padding:9px;" onclick="epDeleteSelectedActiveV7()">🗑 Удалить выбранные</button></div></div>'+
>> 4722:         '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:8px;"><button class="btn-success" style="margin:0;padding:9px;" onclick="epSaveActiveDbV7()">💾 Сохранить</button><button class="btn-info" style="margin:0;padding:9px;" onclick="epReloadActiveDbV7()">🔄 Обновить</button></div>';
   4723:     }
   4724:     if(s==='global'&&!admin){ html+='<div class="ep-v7-note">Серверные цены и позиции мастер не меняет. Для своей сметы нажми «В мою».</div>'; }
   4725:     return html+'</div>';
   4726:   }
   4727: 
   4728:   function renderDbRows(type){
   4729:     var arr=activeArr(type);
   4730:     var html=editorTop(type);
   4731:     if(!arr.length){
   4732:       html += '<div style="padding:15px;border:1px dashed var(--border);border-radius:12px;text-align:center;color:var(--gray);font-weight:800;">'+activeLabel()+' пустая.</div>';
   4733:       return html;
   4734:     }
   4735:     var cats={}, i=0;
   4736:     arr.forEach(function(it){ var c=it.c||'Разное'; var g=groupOf(it)||'Без группы'; if(!cats[c]) cats[c]={}; if(!cats[c][g]) cats[c][g]=[]; cats[c][g].push(it); });
   4737:     Object.keys(cats).sort(function(a,b){return a.localeCompare(b,'ru');}).forEach(function(c){
   4738:       var cid='db_cat_'+type+'_'+(i++);
   4739:       html += '<div class="cat-header" onclick="epDbToggle(&quot;'+cid+'&quot;, event)">'+esc(c)+'</div><div class="cat-body" id="'+cid+'">';
   4740:       Object.keys(cats[c]).sort(function(a,b){return a.localeCompare(b,'ru');}).forEach(function(g){
   4741:         var gid='db_sub_'+type+'_'+(i++);
   4742:         html += '<div class="sub-cat-header" onclick="epDbToggle(&quot;'+gid+'&quot;, event)">'+esc(g)+' ▾</div><div class="sub-cat-body" id="'+gid+'">';
   4743:         cats[c][g].sort(function(a,b){return String(a.n||'').localeCompare(String(b.n||''),'ru');}).forEach(function(it){ html += editorRow(type,it); });
   4744:         html += '</div>';
```

### around line 6185

```js
   6173:       html+='<button class="btn-info" onclick="epTriggerDbFileImport(\'mat\')">📥 Импорт материалов</button>'+
   6174:             '<button class="btn-work" onclick="epTriggerDbFileImport(\'work\')">📥 Импорт работ</button>'+
   6175:             '<button class="btn-vendor" onclick="epOpenTextImport && epOpenTextImport(\'mat\')">📝 Материалы текстом</button>'+
   6176:             '<button class="btn-vendor" onclick="epOpenTextImport && epOpenTextImport(\'work\')">📝 Работы текстом</button>';
   6177:     } else {
   6178:       html+='<button class="btn-info" onclick="epTriggerServerProposalImportV7(\'mat\')">📨 Материалы заявкой админу</button>'+
   6179:             '<button class="btn-work" onclick="epTriggerServerProposalImportV7(\'work\')">📨 Работы заявкой админу</button>'+
   6180:             '<button class="btn-vendor" onclick="epOpenTextImportServerProposalV7(\'mat\')">📝 Материалы заявкой</button>'+
   6181:             '<button class="btn-vendor" onclick="epOpenTextImportServerProposalV7(\'work\')">📝 Работы заявкой</button>';
   6182:     }
   6183:     html+='<button class="btn-success" onclick="epExportActiveDb()">📤 Экспорт этой базы</button>'+
   6184:           '<button class="btn-info" onclick="epReloadActiveDbV7()">🔄 Обновить / перезагрузить</button>';
>> 6185:     if(canEditActive()) html+='<button class="btn-primary" onclick="epSaveActiveDbV7()">💾 Сохранить базу</button>';
   6186:     if(my) html+='<button class="btn-danger" onclick="epOpenDbFactoryResetModal && epOpenDbFactoryResetModal()">🧹 Очистка / сброс</button>';
   6187:     else if(admin) html+='<button class="btn-danger" onclick="epOpenDbFactoryResetModal && epOpenDbFactoryResetModal()">🧹 Очистка сервера</button>';
   6188:     html+='</div>';
   6189:     if(!my && !admin) html+='<div class="ep-v7-note">Редактирование, сохранение, замена и цены сервера заблокированы для мастера.</div>';
   6190:     p.innerHTML=html;
   6191:   }
   6192:   function tuneStaticBlocks(){
   6193:     renderPanel();
   6194:     var my=$('ep-scope-my-btn'), gl=$('ep-scope-global-btn'), st=$('ep-db-scope-status');
   6195:     if(my){ my.className=scope()==='my'?'btn-success':'btn-info'; my.textContent='👤 Моя база данных'; }
   6196:     if(gl){ gl.className=scope()==='global'?'btn-success':'btn-info'; gl.textContent='🌍 База сервера'; }
   6197:     if(st) st.innerHTML='Главный переключатель: <b>'+label()+'</b>. Отображение и расчёт идут только из выбранного источника.';
   6198:     var old=$('ep-db-ai-tools'); if(old) old.style.display='none';
   6199:     var clean=$('ep-clean-status-line'); if(clean) clean.textContent='Активная база: '+label()+'. Материалы: '+active('mat').length+', работы: '+active('work').length+'.';
   6200:     var addBtn=document.querySelector('#settModal button[onclick="addDbItem()"]');
   6201:     var addBlock=null;
   6202:     if(addBtn){ var x=addBtn.parentElement; while(x&&x.id!=='settModal'){ if((x.querySelector&&x.querySelector('#db-new-cat'))){ addBlock=x; break; } x=x.parentElement; } }
   6203:     if(addBlock){ addBlock.style.display=canEditActive()?'block':'none'; }
   6204:     if(addBtn){ addBtn.textContent=scope()==='global'?' + Добавить в базу сервера':' + Добавить в мою базу'; }
   6205:   }
   6206: 
   6207:   function editorTop(type){
```

### around line 6217

```js
   6205:   }
   6206: 
   6207:   function editorTop(type){
   6208:     var title=type==='work'?'работ':'материалов';
   6209:     var s=scope(), admin=isAdmin(), editable=canEditActive();
   6210:     var hint=s==='my'?'Редактируется личная база мастера.':(admin?'Редактируется база сервера.':'Сервер открыт только для просмотра и копирования в мою базу.');
   6211:     var html='<div style="border:1px solid var(--primary);border-radius:14px;padding:10px;margin:0 0 12px;background:rgba(79,70,229,.05);">'+
   6212:       '<div style="font-weight:900;color:var(--primary);">'+label()+' — '+title+'</div>'+
   6213:       '<div style="font-size:11px;color:var(--gray);font-weight:800;margin-top:4px;">'+hint+' Позиций: '+active(type).length+'.</div>'+
   6214:       '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:8px;">'+
   6215:       '<button class="'+(s==='my'?'btn-success':'btn-info')+'" style="margin:0;padding:10px;" onclick="epSetDbScope(\'my\')">👤 Моя база</button>'+
   6216:       '<button class="'+(s==='global'?'btn-success':'btn-info')+'" style="margin:0;padding:10px;" onclick="epSetDbScope(\'global\')">🌍 База сервера</button></div>';
>> 6217:     if(editable){ html+='<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:8px;"><button class="btn-success" style="margin:0;padding:9px;" onclick="epSaveActiveDbV7()">💾 Сохранить</button><button class="btn-danger" style="margin:0;padding:9px;" onclick="epDeleteSelectedActiveV7()">🗑 Удалить выбранные</button></div>'; }
   6218:     if(s==='global'&&!admin){ html+='<div class="ep-v7-note">Серверные цены и позиции мастер не меняет. Для своей сметы нажми «В мою».</div>'; }
   6219:     return html+'</div>';
   6220:   }
   6221:   function editorRow(type,it){
   6222:     var s=scope(), editable=canEditActive(), admin=isAdmin();
   6223:     var item=encodeURIComponent(JSON.stringify(it||{}));
   6224:     var sub=(groupOf(it)?groupOf(it)+' • ':'')+(Number(it.p)||0)+' ₽ / '+(it.u||'шт');
   6225:     var check=editable?'<input type="checkbox" class="ep-v7-select" data-type="'+type+'" data-id="'+esc(String(it.id||''))+'" style="width:20px;height:20px;accent-color:#EF4444;margin:4px 3px 0 0;">':'';
   6226:     var price='<input type="number" '+(editable?'':'disabled')+' value="'+(Number(it.p)||0)+'" data-id="'+esc(String(it.id||''))+'" data-type="'+type+'" onchange="epChangePriceV7(this.dataset.type,this.dataset.id,this.value)" style="width:76px;margin:0;padding:4px;text-align:center;">';
   6227:     var copy=(s==='global'&&!admin)?'<button class="btn-info" style="width:auto;margin:0;padding:7px;" data-type="'+type+'" data-item="'+esc(item)+'" onclick="epCopyOneServerToMy(this.dataset.type,this.dataset.item)">В мою</button>':'';
   6228:     return '<div class="emp-row ep-v7-row '+(!editable?'ep-v7-locked':'')+'">'+check+'<div style="flex:1;"><b>'+esc(it.n||'Позиция')+'</b><br><span style="color:var(--gray);font-size:10px;">'+esc(sub)+'</span></div>'+price+copy+'</div>';
   6229:   }
   6230:   function renderRows(type){
   6231:     var arr=active(type), html=editorTop(type);
   6232:     if(!arr.length) return html+'<div style="padding:15px;border:1px dashed var(--border);border-radius:12px;text-align:center;color:var(--gray);font-weight:800;">'+label()+' пустая.</div>';
   6233:     var cats={},i=0; arr.forEach(function(it){ var c=it.c||'Разное', g=groupOf(it)||'Без группы'; if(!cats[c])cats[c]={}; if(!cats[c][g])cats[c][g]=[]; cats[c][g].push(it); });
   6234:     Object.keys(cats).sort(function(a,b){return a.localeCompare(b,'ru');}).forEach(function(c){ var cid='v7_cat_'+type+'_'+(i++); html+='<div class="cat-header" onclick="epDbToggle && epDbToggle(&quot;'+cid+'&quot;, event)">'+esc(c)+'</div><div class="cat-body" id="'+cid+'">'; Object.keys(cats[c]).sort(function(a,b){return a.localeCompare(b,'ru');}).forEach(function(g){ var gid='v7_sub_'+type+'_'+(i++); html+='<div class="sub-cat-header" onclick="epDbToggle && epDbToggle(&quot;'+gid+'&quot;, event)">'+esc(g)+' ▾</div><div class="sub-cat-body" id="'+gid+'">'; cats[c][g].sort(function(a,b){return String(a.n||'').localeCompare(String(b.n||''),'ru');}).forEach(function(it){ html+=editorRow(type,it); }); html+='</div>'; }); html+='</div>'; });
   6235:     return html;
   6236:   }
   6237:   window.renderDbEditors=function(){
   6238:     syncMain(scope());
   6239:     try{ var catsEl=$('db-cats'); if(catsEl){ var all=active('mat').concat(active('work')); catsEl.innerHTML=Array.from(new Set(all.map(function(x){return x.c||'Разное';}))).sort(function(a,b){return a.localeCompare(b,'ru');}).map(function(c){return '<option value="'+esc(c)+'">';}).join(''); } }catch(e){}
```

### around line 6262

```js
   6250:     syncMain(scope()); renderDbEditors(); showProgress('Обновляю '+label(),100,'Готово'); setTimeout(hideProgress,350);
   6251:   };
   6252: 
   6253:   window.epChangePriceV7=async function(type,id,newPrice){
   6254:     if(!canEditActive()){ renderDbEditors(); return toast('Сервер редактирует только админ'); }
   6255:     var arr=active(type).slice(); var it=arr.find(function(x){return String(x.id||'')===String(id);}); if(!it)return toast('Позиция не найдена');
   6256:     it=Object.assign({},it,{p:money(newPrice)}); arr=upsert(arr,type,it,true);
   6257:     if(scope()==='global') setServer(type,arr); else setMy(type,arr);
   6258:     showProgress('Сохраняю цену',45,'Локально');
   6259:     if(scope()==='global') await saveServerRemote(showProgress); else await saveMyRemote(showProgress);
   6260:     showProgress('Сохраняю цену',100,'Готово'); setTimeout(hideProgress,350); renderDbEditors();
   6261:   };
>> 6262:   window.epSaveActiveDbV7=async function(){
   6263:     if(!canEditActive()) return toast('Сохранять базу сервера может только админ');
   6264:     showProgress('Сохраняю '+label(),20,'Подготовка');
   6265:     var ok=scope()==='global'?await saveServerRemote(showProgress):await saveMyRemote(showProgress);
   6266:     await reloadActiveDb(); showProgress('Сохраняю '+label(),100,ok?'Готово':'Локально сохранено'); setTimeout(hideProgress,450); toast(ok?'✅ База сохранена и перезагружена':'⚠️ Сервер не подтвердил, локальная база обновлена');
   6267:   };
   6268:   window.epReloadActiveDbV7=async function(){ showProgress('Перезагружаю '+label(),20,'Запрос'); await reloadActiveDb(); showProgress('Перезагружаю '+label(),100,'Готово'); setTimeout(hideProgress,350); };
   6269:   window.epDeleteSelectedActiveV7=async function(){
   6270:     if(!canEditActive()) return toast('Удалять на сервере может только админ');
   6271:     var checks=Array.from(document.querySelectorAll('#settModal .ep-v7-select:checked')); if(!checks.length)return toast('Выберите позиции');
   6272:     if(!confirm('Удалить выбранные позиции из '+label()+'?')) return;
   6273:     var rm={mat:new Set(),work:new Set()}; checks.forEach(function(ch){ rm[ch.dataset.type].add(String(ch.dataset.id||'')); });
   6274:     ['mat','work'].forEach(function(type){ if(!rm[type].size)return; var arr=active(type).filter(function(x){return !rm[type].has(String(x.id||''));}); if(scope()==='global') setServer(type,arr); else setMy(type,arr); });
   6275:     showProgress('Удаляю позиции',50,'Запись'); if(scope()==='global') await saveServerRemote(showProgress); else await saveMyRemote(showProgress); await reloadActiveDb(); showProgress('Удаляю позиции',100,'Готово'); setTimeout(hideProgress,350);
   6276:   };
   6277: 
   6278:   function downloadJson(filename,data){
   6279:     showProgress('Экспорт базы',25,'Подготовка файла');
   6280:     var blob=new Blob([JSON.stringify(data,null,2)],{type:'application/json;charset=utf-8'});
   6281:     showProgress('Экспорт базы',70,'Скачивание');
   6282:     var url=URL.createObjectURL(blob), a=document.createElement('a'); a.href=url; a.download=filename; document.body.appendChild(a); a.click(); a.remove();
   6283:     setTimeout(function(){URL.revokeObjectURL(url);},1000);
   6284:     showProgress('Экспорт базы',100,'Готово'); setTimeout(function(){hideProgress(); reloadActiveDb();},500);
```

### around line 6527

```js
   6515:       var arr=active(type).slice(); var it=arr.find(function(x){return String(x.id||'')===String(id);});
   6516:       if(!it) throw new Error('Позиция не найдена');
   6517:       it=Object.assign({},it,{p:money(newPrice)}); arr=upsert(arr,type,it,true);
   6518:       if(scope()==='global'){
   6519:         setServer(type,arr); await saveServerRemote(showProgress); await reloadFromRemoteCurrent(); toast('✅ Цена сохранена в базе сервера');
   6520:       } else {
   6521:         setMy(type,arr); try{ await saveMyRemote(showProgress); toast('✅ Цена сохранена в моей базе'); }catch(e){ toast('⚠️ Цена сохранена на телефоне, сервер не подтвердил: '+explainErr(e)); }
   6522:       }
   6523:       showProgress('Сохраняю цену',100,'Готово'); setTimeout(hideProgress,350); rerender();
   6524:     }catch(e){ hideProgress(); toast('❌ '+explainErr(e)); console.error('EP V8 price failed',e); rerender(); }
   6525:   };
   6526: 
>> 6527:   window.epSaveActiveDbV7=async function(){
   6528:     if(!canEdit()) return toast('Сохранять базу сервера может только админ');
   6529:     showProgress('Сохраняю '+label(),20,'Подготовка');
   6530:     try{
   6531:       if(scope()==='global'){
   6532:         await saveServerRemote(showProgress);
   6533:         await reloadFromRemoteCurrent();
   6534:         toast('✅ База сервера сохранена и перезагружена');
   6535:       } else {
   6536:         try{ await saveMyRemote(showProgress); await reloadFromRemoteCurrent(); toast('✅ Моя база сохранена и перезагружена'); }
   6537:         catch(e){ toast('⚠️ Моя база сохранена на телефоне, но не на сервере: '+explainErr(e)); }
   6538:       }
   6539:       showProgress('Сохраняю '+label(),100,'Готово'); setTimeout(hideProgress,450); rerender();
   6540:     }catch(e){ hideProgress(); toast('❌ '+explainErr(e)); console.error('EP V8 save active failed',e); rerender(); }
   6541:   };
   6542: 
   6543:   window.epReloadActiveDbV7=async function(){
   6544:     showProgress('Перезагружаю '+label(),20,'Запрос');
   6545:     var ok=await reloadFromRemoteCurrent();
   6546:     syncMain(scope()); rerender();
   6547:     showProgress('Перезагружаю '+label(),100,ok?'С сервера':'Локально');
   6548:     setTimeout(hideProgress,350);
   6549:     toast(ok?'✅ База обновлена с сервера':'⚠️ Сервер не отдал базу. Показана локальная копия.');
```


## matDB

Найдено строк: 56, 1084, 1085, 1187, 1193, 1205, 1217, 1226, 1441, 1657, 1664, 1677, 1684, 1937, 1942, 1943, 2064, 2066, 2070, 2074

### around line 56

```js
   44: 
   45: let db, auth;
   46: let GEMINI_API_KEY = safeGet('gemini_key_v31', "");
   47: let appUser = null; 
   48: let cust = {name:"", phone:"", addr:"", ceil:270};
   49: try { let c = JSON.parse(safeGet('cust_v31', '{}')); if(c && c.name) cust = c; } catch(e){}
   50: 
   51: let hDB = []; 
   52: try { hDB = JSON.parse(safeGet('h_v31', '[]')); } catch(e) { hDB = []; }
   53: let currentEstimate = []; 
   54: try { currentEstimate = JSON.parse(safeGet('est_v31', '[]')); } catch(e) { currentEstimate = []; }
   55: 
>> 56: let matDB = [], workDB = []; 
   57: let pool = []; 
   58: let coeffs = {mat:0, work:0};
   59: try { let c = JSON.parse(safeGet('coeffs_v31', '{"mat":0,"work":0}')); coeffs = c; } catch(e){}
   60: 
   61: let appLogic = { 
   62:     cabRes: 1.1, gofraRes: 1.05, basesPerM: 3, clipsPerM: 3, packSize: 100, mixPerBox: 0.3, crownLife: 80,
   63:     priceSoc: 500, priceShield: 500, priceDrill: 600, priceShtroba: 550, priceCabCeil: 120,
   64:     socketsPerJb: 3, connPerSocJb: 3, connPerSwJb: 3, connPerPassJb: 4,
   65:     shieldInstallPrice: 2500,
   66:     shieldInputConnectPrice: 1500,
   67:     shieldTestLinePrice: 150,
   68:     shieldMarkLinePrice: 100,
   69:     shieldSchemePrice: 4000,
   70:     shieldNichePerModule: 400,
   71:     shieldInputGroovePrice: 1500,
   72:     shieldPeBusContacts: 26,
   73:     shieldPugvSize: 6,
   74:     shieldNshviPackSize: 100
   75: };
   76: try { let logic = JSON.parse(safeGet('appLogic_v31', '{}')); appLogic = Object.assign(appLogic, logic); } catch(e){}
   77: 
   78: let priceOverrides = {};
```

### around line 1084

```js
   1072:         try {
   1073:             let shops = document.getElementById('ai-shops')?.value || 'Лемана ПРО, Петрович, ВсеИнструменты';
   1074:             const txt = await epAskAI('Материалы: ' + currentEstimate.filter(i=>i.type==='mat').map(i=>i.n).join(', ') + '. Создай HTML таблицу с максимальными розничными ценами ГОСТ в магазинах: ' + shops + '. Верни только HTML.', { maxTokens: 3000 });
   1075:             hideLoader();
   1076:             document.getElementById('ai-modal-title').innerText = '🛒 Макс. Цены ГОСТ';
   1077:             document.getElementById('ai-suggestions').innerHTML = `<div style="overflow-x:auto;">${epStripCode(txt)}</div>`;
   1078:             openModal('aiModal');
   1079:         } catch(e) { hideLoader(); showToast('❌ ' + (e.message || 'Сбой ИИ')); }
   1080:     };
   1081: 
   1082:     // === DATABASE IMPORT / EXPORT / SERVER ===
   1083:     function epDbTypeLabel(type) { return type === 'work' ? 'работ' : 'материалов'; }
>> 1084:     function epCurrentDb(type) { return type === 'work' ? workDB : matDB; }
   1085:     function epSetCurrentDb(type, arr) { if (type === 'work') workDB = arr; else matDB = arr; }
   1086: 
   1087:     function epInferCategory(name, type) {
   1088:         const n = String(name || '').toLowerCase();
   1089:         if (type === 'work') {
   1090:             if (/штроб|борозд|резк|алмаз/.test(n)) return 'Штробление';
   1091:             if (/подрозет|розет|выключ|механизм|рамк|светильник/.test(n)) return 'Чистовая';
   1092:             if (/кабел|провод|гофр|труб|лоток|короб/.test(n)) return 'Черновая';
   1093:             if (/щит|автомат|узо|диф|реле/.test(n)) return 'Щит';
   1094:             return 'Работы';
   1095:         }
   1096:         if (/ввг|пуг|пвс|провод|кабел|cat|utp|ftp|sat|коаксиал/.test(n)) return 'Кабель';
   1097:         if (/гофр|труб|кабель.?канал|лоток|клипс|стяжк/.test(n)) return 'Трубы';
   1098:         if (/подрозет|короб|распред|клемм|wago|гмл|изол|саморез|дюбел|гвозд|площадк|баллон|наконечник/.test(n)) return 'Расходники';
   1099:         if (/автомат|узо|диф|реле|выключател[ья] автомат|щит|бокс|din|дин|шина|кросс/.test(n)) return 'Автоматика';
   1100:         if (/tv|тв|интернет|rj|utp|ftp|cat|слаботоч/.test(n)) return 'Слаботочка';
   1101:         if (/розет|выключ|рамк|механизм|диммер|терморег/.test(n)) return 'Чистовое';
   1102:         return 'Разное';
   1103:     }
   1104: 
   1105: 
   1106:     function epInferSubcategory(name, category, type) {
```

### around line 1085

```js
   1073:             let shops = document.getElementById('ai-shops')?.value || 'Лемана ПРО, Петрович, ВсеИнструменты';
   1074:             const txt = await epAskAI('Материалы: ' + currentEstimate.filter(i=>i.type==='mat').map(i=>i.n).join(', ') + '. Создай HTML таблицу с максимальными розничными ценами ГОСТ в магазинах: ' + shops + '. Верни только HTML.', { maxTokens: 3000 });
   1075:             hideLoader();
   1076:             document.getElementById('ai-modal-title').innerText = '🛒 Макс. Цены ГОСТ';
   1077:             document.getElementById('ai-suggestions').innerHTML = `<div style="overflow-x:auto;">${epStripCode(txt)}</div>`;
   1078:             openModal('aiModal');
   1079:         } catch(e) { hideLoader(); showToast('❌ ' + (e.message || 'Сбой ИИ')); }
   1080:     };
   1081: 
   1082:     // === DATABASE IMPORT / EXPORT / SERVER ===
   1083:     function epDbTypeLabel(type) { return type === 'work' ? 'работ' : 'материалов'; }
   1084:     function epCurrentDb(type) { return type === 'work' ? workDB : matDB; }
>> 1085:     function epSetCurrentDb(type, arr) { if (type === 'work') workDB = arr; else matDB = arr; }
   1086: 
   1087:     function epInferCategory(name, type) {
   1088:         const n = String(name || '').toLowerCase();
   1089:         if (type === 'work') {
   1090:             if (/штроб|борозд|резк|алмаз/.test(n)) return 'Штробление';
   1091:             if (/подрозет|розет|выключ|механизм|рамк|светильник/.test(n)) return 'Чистовая';
   1092:             if (/кабел|провод|гофр|труб|лоток|короб/.test(n)) return 'Черновая';
   1093:             if (/щит|автомат|узо|диф|реле/.test(n)) return 'Щит';
   1094:             return 'Работы';
   1095:         }
   1096:         if (/ввг|пуг|пвс|провод|кабел|cat|utp|ftp|sat|коаксиал/.test(n)) return 'Кабель';
   1097:         if (/гофр|труб|кабель.?канал|лоток|клипс|стяжк/.test(n)) return 'Трубы';
   1098:         if (/подрозет|короб|распред|клемм|wago|гмл|изол|саморез|дюбел|гвозд|площадк|баллон|наконечник/.test(n)) return 'Расходники';
   1099:         if (/автомат|узо|диф|реле|выключател[ья] автомат|щит|бокс|din|дин|шина|кросс/.test(n)) return 'Автоматика';
   1100:         if (/tv|тв|интернет|rj|utp|ftp|cat|слаботоч/.test(n)) return 'Слаботочка';
   1101:         if (/розет|выключ|рамк|механизм|диммер|терморег/.test(n)) return 'Чистовое';
   1102:         return 'Разное';
   1103:     }
   1104: 
   1105: 
   1106:     function epInferSubcategory(name, category, type) {
   1107:         const n = String(name || '').toLowerCase();
```

### around line 1187

```js
   1175:                 id: x.id || (type === 'work' ? 'w' : 'm') + '_ai_' + Date.now() + '_' + i,
   1176:                 n: name,
   1177:                 c: cat || 'Разное',
   1178:                 sc: subcat || 'Разное',
   1179:                 p: epMoney(priceRaw),
   1180:                 u: unit
   1181:             };
   1182:         }).filter(function (x) { return x.n && x.n.length > 2; });
   1183:     }
   1184: 
   1185:     async function epSaveUserDb() {
   1186:         try {
>> 1187:             safeSet('user_db_mat_v31', JSON.stringify(matDB));
   1188:             safeSet('user_db_work_v31', JSON.stringify(workDB));
   1189:             if (db && appUser && appUser.uid) {
   1190:                 await db.collection('user_db').doc(appUser.uid).set({
   1191:                     uid: appUser.uid,
   1192:                     name: appUser.name || appUser.email || '',
   1193:                     matDB: matDB,
   1194:                     workDB: workDB,
   1195:                     updatedAt: new Date().toISOString()
   1196:                 }, { merge: true });
   1197:             }
   1198:         } catch (e) {
   1199:             console.warn('save user db error', e);
   1200:         }
   1201:     }
   1202: 
   1203:     async function epSaveGlobalDb() {
   1204:         if (!db) return;
   1205:         await db.collection('settings').doc('global_db').set({ matDB: matDB, workDB: workDB, updatedAt: new Date().toISOString() }, { merge: true });
   1206:     }
   1207: 
   1208:     async function epLoadUserDbAfterLogin() {
   1209:         try {
```

### around line 1193

```js
   1181:             };
   1182:         }).filter(function (x) { return x.n && x.n.length > 2; });
   1183:     }
   1184: 
   1185:     async function epSaveUserDb() {
   1186:         try {
   1187:             safeSet('user_db_mat_v31', JSON.stringify(matDB));
   1188:             safeSet('user_db_work_v31', JSON.stringify(workDB));
   1189:             if (db && appUser && appUser.uid) {
   1190:                 await db.collection('user_db').doc(appUser.uid).set({
   1191:                     uid: appUser.uid,
   1192:                     name: appUser.name || appUser.email || '',
>> 1193:                     matDB: matDB,
   1194:                     workDB: workDB,
   1195:                     updatedAt: new Date().toISOString()
   1196:                 }, { merge: true });
   1197:             }
   1198:         } catch (e) {
   1199:             console.warn('save user db error', e);
   1200:         }
   1201:     }
   1202: 
   1203:     async function epSaveGlobalDb() {
   1204:         if (!db) return;
   1205:         await db.collection('settings').doc('global_db').set({ matDB: matDB, workDB: workDB, updatedAt: new Date().toISOString() }, { merge: true });
   1206:     }
   1207: 
   1208:     async function epLoadUserDbAfterLogin() {
   1209:         try {
   1210:             if (!appUser || !appUser.uid) return;
   1211:             let loaded = false;
   1212: 
   1213:             if (db) {
   1214:                 const doc = await db.collection('user_db').doc(appUser.uid).get();
   1215:                 if (doc.exists) {
```


## workDB

Найдено строк: 56, 1084, 1085, 1188, 1194, 1205, 1218, 1227, 1442, 1658, 1664, 1678, 1703, 1937, 1942, 1943, 2004, 2005, 2061, 2071

### around line 56

```js
   44: 
   45: let db, auth;
   46: let GEMINI_API_KEY = safeGet('gemini_key_v31', "");
   47: let appUser = null; 
   48: let cust = {name:"", phone:"", addr:"", ceil:270};
   49: try { let c = JSON.parse(safeGet('cust_v31', '{}')); if(c && c.name) cust = c; } catch(e){}
   50: 
   51: let hDB = []; 
   52: try { hDB = JSON.parse(safeGet('h_v31', '[]')); } catch(e) { hDB = []; }
   53: let currentEstimate = []; 
   54: try { currentEstimate = JSON.parse(safeGet('est_v31', '[]')); } catch(e) { currentEstimate = []; }
   55: 
>> 56: let matDB = [], workDB = []; 
   57: let pool = []; 
   58: let coeffs = {mat:0, work:0};
   59: try { let c = JSON.parse(safeGet('coeffs_v31', '{"mat":0,"work":0}')); coeffs = c; } catch(e){}
   60: 
   61: let appLogic = { 
   62:     cabRes: 1.1, gofraRes: 1.05, basesPerM: 3, clipsPerM: 3, packSize: 100, mixPerBox: 0.3, crownLife: 80,
   63:     priceSoc: 500, priceShield: 500, priceDrill: 600, priceShtroba: 550, priceCabCeil: 120,
   64:     socketsPerJb: 3, connPerSocJb: 3, connPerSwJb: 3, connPerPassJb: 4,
   65:     shieldInstallPrice: 2500,
   66:     shieldInputConnectPrice: 1500,
   67:     shieldTestLinePrice: 150,
   68:     shieldMarkLinePrice: 100,
   69:     shieldSchemePrice: 4000,
   70:     shieldNichePerModule: 400,
   71:     shieldInputGroovePrice: 1500,
   72:     shieldPeBusContacts: 26,
   73:     shieldPugvSize: 6,
   74:     shieldNshviPackSize: 100
   75: };
   76: try { let logic = JSON.parse(safeGet('appLogic_v31', '{}')); appLogic = Object.assign(appLogic, logic); } catch(e){}
   77: 
   78: let priceOverrides = {};
```

### around line 1084

```js
   1072:         try {
   1073:             let shops = document.getElementById('ai-shops')?.value || 'Лемана ПРО, Петрович, ВсеИнструменты';
   1074:             const txt = await epAskAI('Материалы: ' + currentEstimate.filter(i=>i.type==='mat').map(i=>i.n).join(', ') + '. Создай HTML таблицу с максимальными розничными ценами ГОСТ в магазинах: ' + shops + '. Верни только HTML.', { maxTokens: 3000 });
   1075:             hideLoader();
   1076:             document.getElementById('ai-modal-title').innerText = '🛒 Макс. Цены ГОСТ';
   1077:             document.getElementById('ai-suggestions').innerHTML = `<div style="overflow-x:auto;">${epStripCode(txt)}</div>`;
   1078:             openModal('aiModal');
   1079:         } catch(e) { hideLoader(); showToast('❌ ' + (e.message || 'Сбой ИИ')); }
   1080:     };
   1081: 
   1082:     // === DATABASE IMPORT / EXPORT / SERVER ===
   1083:     function epDbTypeLabel(type) { return type === 'work' ? 'работ' : 'материалов'; }
>> 1084:     function epCurrentDb(type) { return type === 'work' ? workDB : matDB; }
   1085:     function epSetCurrentDb(type, arr) { if (type === 'work') workDB = arr; else matDB = arr; }
   1086: 
   1087:     function epInferCategory(name, type) {
   1088:         const n = String(name || '').toLowerCase();
   1089:         if (type === 'work') {
   1090:             if (/штроб|борозд|резк|алмаз/.test(n)) return 'Штробление';
   1091:             if (/подрозет|розет|выключ|механизм|рамк|светильник/.test(n)) return 'Чистовая';
   1092:             if (/кабел|провод|гофр|труб|лоток|короб/.test(n)) return 'Черновая';
   1093:             if (/щит|автомат|узо|диф|реле/.test(n)) return 'Щит';
   1094:             return 'Работы';
   1095:         }
   1096:         if (/ввг|пуг|пвс|провод|кабел|cat|utp|ftp|sat|коаксиал/.test(n)) return 'Кабель';
   1097:         if (/гофр|труб|кабель.?канал|лоток|клипс|стяжк/.test(n)) return 'Трубы';
   1098:         if (/подрозет|короб|распред|клемм|wago|гмл|изол|саморез|дюбел|гвозд|площадк|баллон|наконечник/.test(n)) return 'Расходники';
   1099:         if (/автомат|узо|диф|реле|выключател[ья] автомат|щит|бокс|din|дин|шина|кросс/.test(n)) return 'Автоматика';
   1100:         if (/tv|тв|интернет|rj|utp|ftp|cat|слаботоч/.test(n)) return 'Слаботочка';
   1101:         if (/розет|выключ|рамк|механизм|диммер|терморег/.test(n)) return 'Чистовое';
   1102:         return 'Разное';
   1103:     }
   1104: 
   1105: 
   1106:     function epInferSubcategory(name, category, type) {
```

### around line 1085

```js
   1073:             let shops = document.getElementById('ai-shops')?.value || 'Лемана ПРО, Петрович, ВсеИнструменты';
   1074:             const txt = await epAskAI('Материалы: ' + currentEstimate.filter(i=>i.type==='mat').map(i=>i.n).join(', ') + '. Создай HTML таблицу с максимальными розничными ценами ГОСТ в магазинах: ' + shops + '. Верни только HTML.', { maxTokens: 3000 });
   1075:             hideLoader();
   1076:             document.getElementById('ai-modal-title').innerText = '🛒 Макс. Цены ГОСТ';
   1077:             document.getElementById('ai-suggestions').innerHTML = `<div style="overflow-x:auto;">${epStripCode(txt)}</div>`;
   1078:             openModal('aiModal');
   1079:         } catch(e) { hideLoader(); showToast('❌ ' + (e.message || 'Сбой ИИ')); }
   1080:     };
   1081: 
   1082:     // === DATABASE IMPORT / EXPORT / SERVER ===
   1083:     function epDbTypeLabel(type) { return type === 'work' ? 'работ' : 'материалов'; }
   1084:     function epCurrentDb(type) { return type === 'work' ? workDB : matDB; }
>> 1085:     function epSetCurrentDb(type, arr) { if (type === 'work') workDB = arr; else matDB = arr; }
   1086: 
   1087:     function epInferCategory(name, type) {
   1088:         const n = String(name || '').toLowerCase();
   1089:         if (type === 'work') {
   1090:             if (/штроб|борозд|резк|алмаз/.test(n)) return 'Штробление';
   1091:             if (/подрозет|розет|выключ|механизм|рамк|светильник/.test(n)) return 'Чистовая';
   1092:             if (/кабел|провод|гофр|труб|лоток|короб/.test(n)) return 'Черновая';
   1093:             if (/щит|автомат|узо|диф|реле/.test(n)) return 'Щит';
   1094:             return 'Работы';
   1095:         }
   1096:         if (/ввг|пуг|пвс|провод|кабел|cat|utp|ftp|sat|коаксиал/.test(n)) return 'Кабель';
   1097:         if (/гофр|труб|кабель.?канал|лоток|клипс|стяжк/.test(n)) return 'Трубы';
   1098:         if (/подрозет|короб|распред|клемм|wago|гмл|изол|саморез|дюбел|гвозд|площадк|баллон|наконечник/.test(n)) return 'Расходники';
   1099:         if (/автомат|узо|диф|реле|выключател[ья] автомат|щит|бокс|din|дин|шина|кросс/.test(n)) return 'Автоматика';
   1100:         if (/tv|тв|интернет|rj|utp|ftp|cat|слаботоч/.test(n)) return 'Слаботочка';
   1101:         if (/розет|выключ|рамк|механизм|диммер|терморег/.test(n)) return 'Чистовое';
   1102:         return 'Разное';
   1103:     }
   1104: 
   1105: 
   1106:     function epInferSubcategory(name, category, type) {
   1107:         const n = String(name || '').toLowerCase();
```

### around line 1188

```js
   1176:                 n: name,
   1177:                 c: cat || 'Разное',
   1178:                 sc: subcat || 'Разное',
   1179:                 p: epMoney(priceRaw),
   1180:                 u: unit
   1181:             };
   1182:         }).filter(function (x) { return x.n && x.n.length > 2; });
   1183:     }
   1184: 
   1185:     async function epSaveUserDb() {
   1186:         try {
   1187:             safeSet('user_db_mat_v31', JSON.stringify(matDB));
>> 1188:             safeSet('user_db_work_v31', JSON.stringify(workDB));
   1189:             if (db && appUser && appUser.uid) {
   1190:                 await db.collection('user_db').doc(appUser.uid).set({
   1191:                     uid: appUser.uid,
   1192:                     name: appUser.name || appUser.email || '',
   1193:                     matDB: matDB,
   1194:                     workDB: workDB,
   1195:                     updatedAt: new Date().toISOString()
   1196:                 }, { merge: true });
   1197:             }
   1198:         } catch (e) {
   1199:             console.warn('save user db error', e);
   1200:         }
   1201:     }
   1202: 
   1203:     async function epSaveGlobalDb() {
   1204:         if (!db) return;
   1205:         await db.collection('settings').doc('global_db').set({ matDB: matDB, workDB: workDB, updatedAt: new Date().toISOString() }, { merge: true });
   1206:     }
   1207: 
   1208:     async function epLoadUserDbAfterLogin() {
   1209:         try {
   1210:             if (!appUser || !appUser.uid) return;
```

### around line 1194

```js
   1182:         }).filter(function (x) { return x.n && x.n.length > 2; });
   1183:     }
   1184: 
   1185:     async function epSaveUserDb() {
   1186:         try {
   1187:             safeSet('user_db_mat_v31', JSON.stringify(matDB));
   1188:             safeSet('user_db_work_v31', JSON.stringify(workDB));
   1189:             if (db && appUser && appUser.uid) {
   1190:                 await db.collection('user_db').doc(appUser.uid).set({
   1191:                     uid: appUser.uid,
   1192:                     name: appUser.name || appUser.email || '',
   1193:                     matDB: matDB,
>> 1194:                     workDB: workDB,
   1195:                     updatedAt: new Date().toISOString()
   1196:                 }, { merge: true });
   1197:             }
   1198:         } catch (e) {
   1199:             console.warn('save user db error', e);
   1200:         }
   1201:     }
   1202: 
   1203:     async function epSaveGlobalDb() {
   1204:         if (!db) return;
   1205:         await db.collection('settings').doc('global_db').set({ matDB: matDB, workDB: workDB, updatedAt: new Date().toISOString() }, { merge: true });
   1206:     }
   1207: 
   1208:     async function epLoadUserDbAfterLogin() {
   1209:         try {
   1210:             if (!appUser || !appUser.uid) return;
   1211:             let loaded = false;
   1212: 
   1213:             if (db) {
   1214:                 const doc = await db.collection('user_db').doc(appUser.uid).get();
   1215:                 if (doc.exists) {
   1216:                     const d = doc.data();
```


## EP_GLOBAL_MAT

Найдено строк: 4445, 4504, 5175, 5191, 5429, 5439, 5469, 5493, 5618, 5647, 6095, 6098, 6374, 6376, 6679, 6681, 7557, 8174, 8198, 8585

### around line 4445

```js
   4433: 
   4434: /*
   4435:  * Extracted from public/index.html
   4436:  * Original script block: 11
   4437:  * Original HTML lines: 6221-6912
   4438:  */
   4439: 
   4440: /* === EP DB SAFE SPLIT + FACTORY RESET V3 2026-05-13: SERVER/MY, ZERO RESET, NO MIX === */
   4441: (function(){
   4442:   var TOP_MAT_DB = [{"id":"m1","c":"Кабель","n":"Кабель ВВГнг-LS 3х1.5 (Конкорд) круглый","p":57,"u":"м.п."},{"id":"m2","c":"Кабель","n":"Кабель ВВГнг-LS 3х2.5 (Конкорд) круглый","p":87,"u":"м.п."},{"id":"m3","c":"Кабель","n":"Кабель ВВГнг(п)-LS 3х1.5 (Конкорд) плоский","p":62,"u":"м.п."},{"id":"m4","c":"Кабель","n":"Кабель ВВГнг(п)-LS 3х2.5 (Конкорд) плоский","p":95,"u":"м.п."},{"id":"m5","c":"Кабель","n":"Кабель ВВГ-Пнг(А)-LS 3x4 (Лептон)","p":146,"u":"м.п."},{"id":"m6","c":"Кабель","n":"Кабель ВВГ-Пнг(А)-LS 3х6 (Лептон)","p":217,"u":"м.п."},{"id":"m7","c":"Кабель","n":"Провод ПуГВ (ПВ-3) 1х6 синий (ЦВЕТЛИТ)","p":85,"u":"м.п."},{"id":"m8","c":"Кабель","n":"Провод ПуГВ (ПВ-3) 1х6 белый (ЦВЕТЛИТ)","p":85,"u":"м.п."},{"id":"m9","c":"Слаботочка","n":"Кабель TV SAT-703 (Cavel)","p":75,"u":"м.п."},{"id":"m10","c":"Слаботочка","n":"Витая пара комп. экран. FTP4 CAT5E 24AWG Cu","p":32,"u":"м.п."},{"id":"m11","c":"Трубы","n":"Труба гофрированная ПВХ 20мм серая","p":8,"u":"м.п."},{"id":"m12","c":"Трубы","n":"Труба гофрированная ПНД 20мм черная","p":10,"u":"м.п."},{"id":"m13","c":"Трубы","n":"Гофра ПВХ/ПНД с протяжкой","p":25,"u":"м.п."},{"id":"m14","c":"Расходники","n":"Подрозетник глубокий для бетона 68х64","p":12,"u":"шт"},{"id":"m15","c":"Расходники","n":"Подрозетник стандарт (ГКЛ)","p":20,"u":"шт"},{"id":"m16","c":"Расходники","n":"Подрозетник глубокий (ГКЛ)","p":35,"u":"шт"},{"id":"m17","c":"Расходники","n":"Коробка распределительная 100х100х40","p":120,"u":"шт"},{"id":"m18","c":"Расходники","n":"Площадка под стяжку для прямого монтажа","p":5,"u":"шт"},{"id":"m19","c":"Расходники","n":"Стяжки нейлоновые КСС 3*100 (100шт)","p":40,"u":"упак."},{"id":"m20","c":"Расходники","n":"Стяжки нейлоновые КСС 5*400 (100шт)","p":410,"u":"упак."},{"id":"m21","c":"Расходники","n":"Газовый баллон 80 мл 165 мм","p":550,"u":"шт"},{"id":"m22","c":"Расходники","n":"Гвозди для прямого монтажа 3х19 мм (1000 шт)","p":1905,"u":"упак."},{"id":"m23","c":"Расходники","n":"Лента монтажная (перфолента)","p":580,"u":"шт"},{"id":"m24","c":"Расходники","n":"Лента монтажная текстильная 20 мм (50м)","p":880,"u":"упак."},{"id":"m25","c":"Щитовое","n":"Наконечник НШВИ 6.0-12 (упак)","p":225,"u":"упак."},{"id":"m26","c":"Щитовое","n":"Наконечник НШВИ(2) 6.0-14 (упак)","p":365,"u":"упак."},{"id":"m27","c":"Расходники","n":"Гильза ГМЛ 4","p":12,"u":"шт"},{"id":"m28","c":"Расходники","n":"Гильза ГМЛ 6","p":18,"u":"шт"},{"id":"m29","c":"Расходники","n":"Термоусадка (м)","p":80,"u":"м"},{"id":"m30","c":"Автоматика","n":"Автомат 1P 10A (ABB SH201)","p":265,"u":"шт"},{"id":"m31","c":"Автоматика","n":"Автомат 1P 16A (ABB SH201)","p":265,"u":"шт"},{"id":"m32","c":"Автоматика","n":"Автомат 1P 40A (ABB SH201)","p":410,"u":"шт"},{"id":"m33","c":"Автоматика","n":"ДИФ Автомат DSH201 C32 AC30 (ABB)","p":3100,"u":"шт"},{"id":"m34","c":"Щитовое","n":"Клеммник винтовой N 5x16 (ABB)","p":345,"u":"шт"},{"id":"m35","c":"Щитовое","n":"Клеммник винтовой PE 11x16 (ABB)","p":770,"u":"шт"},{"id":"m36","c":"Щитовое","n":"Шкаф внутрь. на 36М UK636E3 (ABB)","p":6510,"u":"шт"},{"id":"m37","c":"Щитовое","n":"Шкаф мультимедийный UK620MV (ABB)","p":11025,"u":"шт"},{"id":"m38","c":"Автоматика","n":"Автомат 1P 10A (ИЭК ВА47-29)","p":172,"u":"шт"},{"id":"m39","c":"Автоматика","n":"Автомат 1P 16A (ИЭК ВА47-29)","p":150,"u":"шт"},{"id":"m40","c":"Автоматика","n":"Автомат 2P 40A (ИЭК ВА47-29)","p":380,"u":"шт"},{"id":"m41","c":"Автоматика","n":"УЗО 2P 40A 30мА (ИЭК ВД1-63)","p":1195,"u":"шт"},{"id":"m42","c":"Щитовое","n":"Шина N ноль на DIN-изол (ИЭК)","p":285,"u":"шт"},{"id":"m43","c":"Щитовое","n":"Корпус пластиковый ЩРВ-П-24 (TEKFOR)","p":2660,"u":"шт"},{"id":"m44","c":"Автоматика","n":"Реле напряжения УЗМ-50Ц","p":4500,"u":"шт"}];
   4443:   var TOP_WORK_DB = [{"id":"w44","c":"Алмазная резка","g":"Штроба 25х30","n":"Бетон","p":550,"u":"м.п."},{"id":"w45","c":"Алмазная резка","g":"Штроба 25х30","n":"Кирпич","p":400,"u":"м.п."},{"id":"w46","c":"Алмазная резка","g":"Штроба 25х30","n":"Панелька","p":700,"u":"м.п."},{"id":"w47","c":"Алмазная резка","g":"Штроба 25х30","n":"Мягкий мат.","p":400,"u":"м.п."},{"id":"w48","c":"Алмазная резка","g":"Штроба 50х50","n":"Бетон","p":1500,"u":"м.п."},{"id":"w49","c":"Алмазная резка","g":"Штроба 50х50","n":"Кирпич","p":1300,"u":"м.п."},{"id":"w50","c":"Алмазная резка","g":"Штроба 50х50","n":"Панелька","p":1900,"u":"м.п."},{"id":"w51","c":"Алмазная резка","g":"Штроба 50х50","n":"Мягкий мат.","p":900,"u":"м.п."},{"id":"w52","c":"Алмазная резка","g":"Штроба 100х50 ВВОДНАЯ","n":"Бетон","p":2200,"u":"м.п."},{"id":"w53","c":"Алмазная резка","g":"Штроба 100х50 ВВОДНАЯ","n":"Кирпич","p":1550,"u":"м.п."},{"id":"w54","c":"Алмазная резка","g":"Штроба 100х50 ВВОДНАЯ","n":"Панелька","p":2500,"u":"м.п."},{"id":"w55","c":"Алмазная резка","g":"Штроба 100х50 ВВОДНАЯ","n":"Мягкий мат.","p":1400,"u":"м.п."},{"id":"w56","c":"Алмазная резка","g":"Высверливание подр. стандарт","n":"Бетон","p":600,"u":"шт"},{"id":"w57","c":"Алмазная резка","g":"Высверливание подр. стандарт","n":"Кирпич","p":500,"u":"шт"},{"id":"w58","c":"Алмазная резка","g":"Высверливание подр. стандарт","n":"Панелька","p":650,"u":"шт"},{"id":"w59","c":"Алмазная резка","g":"Высверливание подр. стандарт","n":"Мягкий мат.","p":400,"u":"шт"},{"id":"w60","c":"Черновая электрика","g":"Вклейка подрозетников","n":"Все типы","p":100,"u":"шт"},{"id":"w61","c":"Алмазная резка","g":"Вырубка ниши щита","n":"Бетон","p":400,"u":"мод."},{"id":"w62","c":"Алмазная резка","g":"Вырубка ниши щита","n":"Кирпич","p":300,"u":"мод."},{"id":"w63","c":"Алмазная резка","g":"Вырубка ниши щита","n":"Панелька","p":500,"u":"мод."},{"id":"w64","c":"Алмазная резка","g":"Вырубка ниши щита","n":"Мягкий мат.","p":250,"u":"мод."},{"id":"w65","c":"Монтаж","g":"Прокладка кабеля","n":"Без гофры (Потолок)","p":120,"u":"м.п."},{"id":"w66","c":"Монтаж","g":"Прокладка кабеля","n":"В гофре (Пол)","p":150,"u":"м.п."},{"id":"w67","c":"Монтаж","g":"Распаячная коробка","n":"Сборка распред. коробки / коммутация","p":800,"u":"шт"},{"id":"w68","c":"Чистовая установка","g":"Механизмы","n":"Установка розетки 220В","p":500,"u":"шт"},{"id":"w69","c":"Чистовая установка","g":"Механизмы","n":"Установка выключателя","p":550,"u":"шт"},{"id":"w70","c":"Чистовая установка","g":"Механизмы","n":"Установка терморегулятора","p":900,"u":"шт"},{"id":"w71","c":"Алмазная резка","g":"Высверливание подрозетников глубокий","n":"Бетон","p":650,"u":"шт"},{"id":"w72","c":"Алмазная резка","g":"Высверливание подрозетников глубокий","n":"Кирпич","p":550,"u":"шт"},{"id":"w73","c":"Алмазная резка","g":"Высверливание подрозетников глубокий","n":"Панелька","p":750,"u":"шт"},{"id":"w74","c":"Алмазная резка","g":"Высверливание подрозетников глубокий","n":"Мягкий мат.","p":450,"u":"шт"},{"id":"w75","c":"Алмазная резка","g":"Высверливание подрозетников копос 74х75","n":"Бетон","p":800,"u":"шт"},{"id":"w76","c":"Алмазная резка","g":"Высверливание подрозетников копос 74х75","n":"Кирпич","p":700,"u":"шт"},{"id":"w77","c":"Алмазная резка","g":"Высверливание подрозетников копос 74х75","n":"Панелька","p":850,"u":"шт"},{"id":"w78","c":"Алмазная резка","g":"Высверливание подрозетников копос 74х75","n":"Мягкий мат.","p":500,"u":"шт"},{"id":"w79","c":"Алмазная резка","g":"Отверстие 132 ММ L= до 450","n":"Бетон","p":6000,"u":"шт"},{"id":"w80","c":"Алмазная резка","g":"Отверстие 132 ММ L= до 450","n":"Кирпич","p":4500,"u":"шт"},{"id":"w81","c":"Алмазная резка","g":"Отверстие 132 ММ L= до 450","n":"Панелька","p":7000,"u":"шт"},{"id":"w82","c":"Алмазная резка","g":"Отверстие 132 ММ L= до 450","n":"Мягкий мат.","p":4000,"u":"шт"},{"id":"w83","c":"Алмазная резка","g":"Отверстие 52мм L=до 450мм","n":"Бетон","p":2500,"u":"шт"},{"id":"w84","c":"Алмазная резка","g":"Отверстие 52мм L=до 450мм","n":"Кирпич","p":2000,"u":"шт"},{"id":"w85","c":"Алмазная резка","g":"Отверстие 52мм L=до 450мм","n":"Панелька","p":3000,"u":"шт"},{"id":"w86","c":"Алмазная резка","g":"Отверстие 52мм L=до 450мм","n":"Мягкий мат.","p":1900,"u":"шт"},{"id":"w87","c":"Щитовое","g":"Монтаж","n":"Сборка щита","p":500,"u":"мод."},{"id":"w89","c":"Щитовое","g":"Монтаж","n":"Установка БП в щит","p":900,"u":"ед"},{"id":"w91","c":"Монтаж","g":"Спецоборудование","n":"Подключение нагревателя","p":4000,"u":"ед"},{"id":"w92","c":"Монтаж","g":"Спецоборудование","n":"Система КУП","p":5000,"u":"ед"},{"id":"s_r1","c":"Щитовое","g":"Автоматика и Реле","n":"Установка реле времени","p":1250,"u":"шт"},{"id":"s_r2","c":"Щитовое","g":"Автоматика и Реле","n":"Установка реле освещения (в щите)","p":1250,"u":"шт"},{"id":"s_r3","c":"Щитовое","g":"Автоматика и Реле","n":"Установка реле температуры/жидкости","p":1700,"u":"шт"},{"id":"s_r4","c":"Щитовое","g":"Автоматика и Реле","n":"Установка реле контроля фаз","p":1450,"u":"шт"},{"id":"s_r5","c":"Щитовое","g":"Автоматика и Реле","n":"Установка реле напряжения","p":1150,"u":"шт"},{"id":"s_r6","c":"Щитовое","g":"Автоматика и Реле","n":"Установка реле управления нагрузкой","p":2050,"u":"шт"},{"id":"s_m1","c":"Щитовое","g":"Счетчики","n":"Установка электросчетчика 220-240В на DIN","p":1000,"u":"шт"},{"id":"s_m2","c":"Щитовое","g":"Счетчики","n":"Установка электросчетчика 220-240В на монтажную панель","p":1250,"u":"шт"},{"id":"s_m3","c":"Щитовое","g":"Счетчики","n":"Установка электросчетчика 380-400В на DIN","p":1700,"u":"шт"},{"id":"s_m4","c":"Щитовое","g":"Счетчики","n":"Установка электросчетчика 380-400В на монтажную панель","p":2200,"u":"шт"},{"id":"s_m5","c":"Щитовое","g":"Счетчики","n":"Установка электросчетчика под трансформаторы тока","p":2400,"u":"шт"},{"id":"s_m6","c":"Щитовое","g":"Счетчики","n":"Установка трансформатора тока (без подкл)","p":720,"u":"шт"},{"id":"s_p1","c":"Чистовая установка","g":"Розетки накладные","n":"Установка накладной розетки/выкл на бетон","p":680,"u":"шт"},{"id":"s_p2","c":"Чистовая установка","g":"Розетки накладные","n":"Установка накладной розетки/выкл на кирпич","p":600,"u":"шт"},{"id":"s_p3","c":"Чистовая установка","g":"Розетки накладные","n":"Установка накладной розетки/выкл на ГКЛ","p":530,"u":"шт"},{"id":"s_p4","c":"Чистовая установка","g":"Розетки накладные","n":"Установка накладной розетки/выкл на дерево","p":450,"u":"шт"},{"id":"s_p5","c":"Чистовая установка","g":"Механизмы (Спец)","n":"Установка накладной силовой розетки 380В","p":1000,"u":"шт"},{"id":"s_p6","c":"Чистовая установка","g":"Механизмы (Спец)","n":"Установка встраиваемой силовой розетки 380В","p":530,"u":"шт"},{"id":"s_p7","c":"Чистовая установка","g":"Механизмы","n":"Установка встраиваемой розетки/выкл в подрозетник","p":300,"u":"шт"},{"id":"s_p8","c":"Чистовая установка","g":"Механизмы","n":"Установка блока розеток/выкл","p":1200,"u":"шт"},{"id":"s_d1","c":"Черновая электрика","g":"Электроточки","n":"Установка накладного подрозетника","p":300,"u":"шт"},{"id":"s_d2","c":"Черновая электрика","g":"Электроточки","n":"Установка подрозетника","p":180,"u":"шт"},{"id":"s_d3","c":"Черновая электрика","g":"Электроточки","n":"Установка накладной распаечной коробки","p":450,"u":"шт"},{"id":"s_d4","c":"Черновая электрика","g":"Электроточки","n":"Установка встраиваемой распаечной коробки","p":300,"u":"шт"},{"id":"s_d5","c":"Чистовая установка","g":"Механизмы (Спец)","n":"Установка термостата","p":380,"u":"шт"},{"id":"s_d6","c":"Чистовая установка","g":"Механизмы (Спец)","n":"Установка встраиваемого датчика движения","p":330,"u":"шт"},{"id":"s_d7","c":"Чистовая установка","g":"Механизмы (Спец)","n":"Установка звонка","p":680,"u":"шт"},{"id":"s_d8","c":"Чистовая установка","g":"Механизмы (Спец)","n":"Установка кнопки звонка","p":450,"u":"шт"},{"id":"s_d9","c":"Чистовая установка","g":"Механизмы (Спец)","n":"Установка ТВ краба","p":480,"u":"шт"},{"id":"s_sh1","c":"Щитовое","g":"Монтаж накладных","n":"Монтаж электрощитка накладного 2 модуля","p":180,"u":"шт"},{"id":"s_sh2","c":"Щитовое","g":"Монтаж накладных","n":"Монтаж электрощитка накладного 4-8 модулей","p":290,"u":"шт"},{"id":"s_sh3","c":"Щитовое","g":"Монтаж накладных","n":"Монтаж электрощитка накладного 12-24 модуля","p":330,"u":"шт"},{"id":"s_sh4","c":"Щитовое","g":"Монтаж накладных","n":"Монтаж электрощитка накладного 36-60 модулей","p":560,"u":"шт"},{"id":"s_sh5","c":"Щитовое","g":"Монтаж накладных","n":"Монтаж электрощитка накладного 72-96 модулей","p":780,"u":"шт"},{"id":"s_l1","c":"Освещение","g":"LED Лента","n":"Монтаж светодиодной ленты на кухне под шкафами","p":270,"u":"м.п."},{"id":"s_l2","c":"Освещение","g":"LED Лента","n":"Монтаж светодиодной ленты в натяжной потолок","p":390,"u":"м.п."},{"id":"s_l3","c":"Освещение","g":"LED Лента","n":"Монтаж светодиодной ленты на гипсокартон","p":300,"u":"м.п."},{"id":"s_l4","c":"Освещение","g":"LED Лента","n":"Монтаж светодиодной ленты в потолочный плинтус","p":350,"u":"м.п."},{"id":"s_l5","c":"Освещение","g":"LED Лента","n":"Монтаж светодиодной ленты в алюминиевый профиль","p":230,"u":"м.п."},{"id":"s_l6","c":"Освещение","g":"LED Лента","n":"Монтаж светодиодной ленты на карниз","p":350,"u":"м.п."},{"id":"s_l7","c":"Освещение","g":"LED Лента","n":"Установка светодиодной ленты в светильник","p":180,"u":"м.п."},{"id":"s_l8","c":"Освещение","g":"LED Лента","n":"Монтаж светодиодной ленты на улице","p":380,"u":"м.п."},{"id":"s_l9","c":"Освещение","g":"Алюм. профиль","n":"Установка накладного алюм. профиля на скотч","p":110,"u":"м.п."},{"id":"s_l10","c":"Освещение","g":"Алюм. профиль","n":"Установка накладного алюм. профиля со сверлением","p":290,"u":"м.п."},{"id":"s_l11","c":"Освещение","g":"Алюм. профиль","n":"Установка врезного алюм. профиля в готовый паз","p":120,"u":"м.п."},{"id":"s_l12","c":"Освещение","g":"Алюм. профиль","n":"Установка врезного алюм. профиля с подготовкой паза","p":390,"u":"м.п."},{"id":"s_c1","c":"Освещение","g":"Люстры и Светильники","n":"Сборка простой люстры","p":630,"u":"шт"},{"id":"s_c2","c":"Освещение","g":"Люстры и Светильники","n":"Сборка сложной люстры","p":870,"u":"шт"},{"id":"s_c3","c":"Освещение","g":"Люстры и Светильники","n":"Установка крюка под люстру","p":230,"u":"шт"},{"id":"s_c4","c":"Освещение","g":"Люстры и Светильники","n":"Установка люстры на готовый крюк","p":740,"u":"шт"},{"id":"s_c5","c":"Освещение","g":"Люстры и Светильники","n":"Установка люстры с креплением к потолку (простая)","p":1200,"u":"шт"},{"id":"s_c6","c":"Освещение","g":"Люстры и Светильники","n":"Установка люстры с креплением к потолку (сложная/ДУ)","p":2250,"u":"шт"},{"id":"s_c7","c":"Освещение","g":"Люстры и Светильники","n":"Установка тяжелой люстры с креплением на крюк","p":1950,"u":"шт"},{"id":"s_c8","c":"Освещение","g":"Люстры и Светильники","n":"Установка тяжелой люстры с креплением к потолку","p":3600,"u":"шт"},{"id":"s_c9","c":"Освещение","g":"Люстры и Светильники","n":"Установка настенного светильника, бра","p":450,"u":"шт"},{"id":"s_c10","c":"Освещение","g":"Люстры и Светильники","n":"Установка точечного светильника","p":750,"u":"шт"},{"id":"s_c11","c":"Освещение","g":"Люстры и Светильники","n":"Установка светодиодного светильника","p":680,"u":"шт"},{"id":"s_c12","c":"Освещение","g":"Люстры и Светильники","n":"Установка светильника Армстронг","p":380,"u":"шт"},{"id":"s_c13","c":"Освещение","g":"Люстры и Светильники","n":"Установка люминесцентного светильника","p":410,"u":"шт"},{"id":"s_c14","c":"Освещение","g":"Люстры и Светильники","n":"Установка трекового светильника","p":140,"u":"шт"},{"id":"s_c15","c":"Освещение","g":"Люстры и Светильники","n":"Монтаж шинопровода","p":450,"u":"м.п."},{"id":"s_c16","c":"Освещение","g":"Уличное освещение","n":"Установка уличного светильника на фасаде","p":830,"u":"шт"},{"id":"s_c17","c":"Освещение","g":"Уличное освещение","n":"Установка садово-паркового светильника","p":1350,"u":"шт"},{"id":"s_c18","c":"Освещение","g":"Люстры и Светильники","n":"Установка светильника Выход","p":480,"u":"шт"},{"id":"s_c19","c":"Освещение","g":"Уличное освещение","n":"Установка антивандального светильника","p":660,"u":"шт"},{"id":"s_dem1","c":"Демонтаж","g":"Освещение","n":"Демонтаж люстры","p":240,"u":"шт"},{"id":"s_dem2","c":"Демонтаж","g":"Освещение","n":"Демонтаж светильника","p":210,"u":"шт"},{"id":"s_dem3","c":"Демонтаж","g":"Электроточки","n":"Демонтаж розетки","p":200,"u":"шт"},{"id":"s_dem4","c":"Демонтаж","g":"Электроточки","n":"Демонтаж выключателя","p":200,"u":"шт"},{"id":"s_dem5","c":"Демонтаж","g":"Электроточки","n":"Демонтаж распаечной коробки","p":200,"u":"шт"},{"id":"s_dem6","c":"Демонтаж","g":"Электроточки","n":"Демонтаж дверного звонка","p":200,"u":"шт"},{"id":"s_dem7","c":"Демонтаж","g":"Щитовое","n":"Демонтаж реле времени","p":230,"u":"шт"},{"id":"s_dem8","c":"Демонтаж","g":"Щитовое","n":"Демонтаж электрощитка до 8 модулей","p":110,"u":"шт"},{"id":"s_dem9","c":"Демонтаж","g":"Щитовое","n":"Демонтаж электрощитка 12-36 модулей","p":260,"u":"шт"},{"id":"s_dem10","c":"Демонтаж","g":"Щитовое","n":"Демонтаж электрощитка 48-96 модулей","p":470,"u":"шт"},{"id":"s_dem11","c":"Демонтаж","g":"Щитовое","n":"Демонтаж автомата","p":150,"u":"шт"},{"id":"s_dem12","c":"Демонтаж","g":"Щитовое","n":"Демонтаж УЗО","p":150,"u":"шт"},{"id":"s_dem13","c":"Демонтаж","g":"Щитовое","n":"Демонтаж дифавтомата","p":150,"u":"шт"},{"id":"s_dem14","c":"Демонтаж","g":"Щитовое","n":"Демонтаж рубильника","p":150,"u":"шт"},{"id":"s_dem15","c":"Демонтаж","g":"Щитовое","n":"Демонтаж магнитного пускателя","p":140,"u":"шт"}];
   4444: 
>> 4445:   var EP_GLOBAL_MAT = TOP_MAT_DB.slice();
   4446:   var EP_GLOBAL_WORK = TOP_WORK_DB.slice();
   4447:   var EP_MY_MAT = [];
   4448:   var EP_MY_WORK = [];
   4449: 
   4450:   var LS_MY_MAT = 'user_db_mat_v31';
   4451:   var LS_MY_WORK = 'user_db_work_v31';
   4452:   var LS_SERVER_CACHE = 'ep_global_cache_force_v1';
   4453:   var LS_OLD_SERVER_CACHE = 'ep_global_cache_ultimate_v1';
   4454:   var LS_SCOPE = 'ep_db_scope_v2';
   4455:   var LS_CLEAN = 'ep_db_clean_mode_v1';
   4456:   var LS_MASTER_CREATED = 'ep_master_db_created_v1';
   4457: 
   4458:   var EP_MY_MAT = [];
   4459:   var EP_MY_WORK = [];
   4460:   var EP_SERVER_MAT = [];
   4461:   var EP_SERVER_WORK = [];
   4462:   var EP_SERVER_DOC_SEEN = false;
   4463: 
   4464:   function $(id){ return document.getElementById(id); }
   4465:   function toast(t){ if(typeof showToast === 'function') showToast(t); else alert(t); }
   4466:   function esc(s){ return String(s == null ? '' : s).replace(/[&<>"']/g,function(m){ return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]; }); }
   4467:   function cleanText(s){ return String(s || '').toLowerCase().replace(/ё/g,'е').replace(/×/g,'x').replace(/х/g,'x').replace(/[^a-zа-я0-9]+/g,' ').trim(); }
```

### around line 4504

```js
   4492:     });
   4493:     return out;
   4494:   }
   4495: 
   4496:   function myArr(type){ return type==='work' ? EP_MY_WORK : EP_MY_MAT; }
   4497:   function serverArr(type){ return type==='work' ? EP_SERVER_WORK : EP_SERVER_MAT; }
   4498:   function activeArr(type){ return scope()==='global' ? serverArr(type) : myArr(type); }
   4499: 
   4500:   function syncWindowCaches(){
   4501:     try{
   4502:       window.EP_MY_MAT = EP_MY_MAT;
   4503:       window.EP_MY_WORK = EP_MY_WORK;
>> 4504:       window.EP_GLOBAL_MAT = EP_SERVER_MAT;
   4505:       window.EP_GLOBAL_WORK = EP_SERVER_WORK;
   4506:       window.EP_FORCE_GLOBAL = {matDB:EP_SERVER_MAT, workDB:EP_SERVER_WORK};
   4507:       window.EP_ULTIMATE_DB_CACHE = {matDB:EP_SERVER_MAT, workDB:EP_SERVER_WORK, ts:Date.now()};
   4508:       window.EP_GLOBAL_DB_VISIBLE_CACHE = {matDB:EP_SERVER_MAT, workDB:EP_SERVER_WORK, ts:Date.now()};
   4509:       window.userMatDB = EP_MY_MAT;
   4510:       window.userWorkDB = EP_MY_WORK;
   4511:       if(scope()==='global'){ matDB = EP_SERVER_MAT.slice(); workDB = EP_SERVER_WORK.slice(); }
   4512:       else { matDB = EP_MY_MAT.slice(); workDB = EP_MY_WORK.slice(); }
   4513:     }catch(e){}
   4514:   }
   4515: 
   4516:   function saveMyLocal(type, arr){
   4517:     arr = unique(arr||[], type);
   4518:     if(type==='work') EP_MY_WORK = arr; else EP_MY_MAT = arr;
   4519:     setLS(LS_MY_MAT, EP_MY_MAT);
   4520:     setLS(LS_MY_WORK, EP_MY_WORK);
   4521:     try{ localStorage.setItem(LS_MASTER_CREATED,'1'); }catch(e){}
   4522:     syncWindowCaches();
   4523:     epSaveMyDbToServer();
   4524:   }
   4525: 
   4526:   function saveServerLocal(type, arr, saveDirect){
```

### around line 5175

```js
   5163:   function clean(s){ return String(s || '').toLowerCase().replace(/ё/g,'е').replace(/×/g,'x').replace(/х/g,'x').replace(/[^a-zа-я0-9]+/g,' ').trim(); }
   5164:   function groupOf(it){ return (it && (it.g || it.sc || it.subcategory || it.group)) || ''; }
   5165:   function clone(it){ var x = Object.assign({}, it || {}); delete x.__src; delete x.__encoded; return x; }
   5166:   function sig(type,it){ return type + '|' + clean([it && it.c, groupOf(it), it && it.n, it && it.u].filter(Boolean).join('|')); }
   5167:   function activeTarget(){ return (isAdmin() && scope() === 'global') ? 'global' : 'my'; }
   5168: 
   5169:   function getMy(type){
   5170:     var key = type === 'work' ? LS_MY_WORK : LS_MY_MAT;
   5171:     var fromWin = type === 'work' ? window.EP_MY_WORK : window.EP_MY_MAT;
   5172:     return Array.isArray(fromWin) ? fromWin.slice() : readArr(key);
   5173:   }
   5174:   function getServer(type){
>> 5175:     var fromWin = type === 'work' ? window.EP_GLOBAL_WORK : window.EP_GLOBAL_MAT;
   5176:     if(Array.isArray(fromWin)) return fromWin.slice();
   5177:     var c = readObj(LS_SERVER_CACHE);
   5178:     var a = type === 'work' ? c.workDB : c.matDB;
   5179:     return Array.isArray(a) ? a : [];
   5180:   }
   5181:   function setMy(type,arr){
   5182:     arr = unique(arr, type);
   5183:     if(type === 'work') window.EP_MY_WORK = arr; else window.EP_MY_MAT = arr;
   5184:     writeArr(LS_MY_MAT, type === 'mat' ? arr : getMy('mat'));
   5185:     writeArr(LS_MY_WORK, type === 'work' ? arr : getMy('work'));
   5186:     try{ window.userMatDB = getMy('mat'); window.userWorkDB = getMy('work'); }catch(e){}
   5187:     syncMainArrays('my');
   5188:   }
   5189:   function setServer(type,arr){
   5190:     arr = unique(arr, type);
   5191:     if(type === 'work') window.EP_GLOBAL_WORK = arr; else window.EP_GLOBAL_MAT = arr;
   5192:     var mat = type === 'mat' ? arr : getServer('mat');
   5193:     var work = type === 'work' ? arr : getServer('work');
   5194:     try{
   5195:       window.EP_FORCE_GLOBAL = {matDB:mat, workDB:work};
   5196:       window.EP_ULTIMATE_DB_CACHE = {matDB:mat, workDB:work, ts:Date.now()};
   5197:       window.EP_GLOBAL_DB_VISIBLE_CACHE = {matDB:mat, workDB:work, ts:Date.now()};
```

### around line 5191

```js
   5179:     return Array.isArray(a) ? a : [];
   5180:   }
   5181:   function setMy(type,arr){
   5182:     arr = unique(arr, type);
   5183:     if(type === 'work') window.EP_MY_WORK = arr; else window.EP_MY_MAT = arr;
   5184:     writeArr(LS_MY_MAT, type === 'mat' ? arr : getMy('mat'));
   5185:     writeArr(LS_MY_WORK, type === 'work' ? arr : getMy('work'));
   5186:     try{ window.userMatDB = getMy('mat'); window.userWorkDB = getMy('work'); }catch(e){}
   5187:     syncMainArrays('my');
   5188:   }
   5189:   function setServer(type,arr){
   5190:     arr = unique(arr, type);
>> 5191:     if(type === 'work') window.EP_GLOBAL_WORK = arr; else window.EP_GLOBAL_MAT = arr;
   5192:     var mat = type === 'mat' ? arr : getServer('mat');
   5193:     var work = type === 'work' ? arr : getServer('work');
   5194:     try{
   5195:       window.EP_FORCE_GLOBAL = {matDB:mat, workDB:work};
   5196:       window.EP_ULTIMATE_DB_CACHE = {matDB:mat, workDB:work, ts:Date.now()};
   5197:       window.EP_GLOBAL_DB_VISIBLE_CACHE = {matDB:mat, workDB:work, ts:Date.now()};
   5198:     }catch(e){}
   5199:     writeObj(LS_SERVER_CACHE, {matDB:mat, workDB:work, ts:Date.now()});
   5200:     syncMainArrays('global');
   5201:   }
   5202:   function syncMainArrays(target){
   5203:     try{
   5204:       var use = target || activeTarget();
   5205:       if(use === 'global'){
   5206:         window.matDB = getServer('mat');
   5207:         window.workDB = getServer('work');
   5208:         try{ matDB = window.matDB; workDB = window.workDB; }catch(e){}
   5209:       } else {
   5210:         window.matDB = getMy('mat');
   5211:         window.workDB = getMy('work');
   5212:         try{ matDB = window.matDB; workDB = window.workDB; }catch(e){}
   5213:       }
```

### around line 5429

```js
   5417:     mat = unique(mat || [], 'mat');
   5418:     work = unique(work || [], 'work');
   5419:     window.EP_MY_MAT = mat;
   5420:     window.EP_MY_WORK = work;
   5421:     window.userMatDB = mat;
   5422:     window.userWorkDB = work;
   5423:     writeArr(LS_MY_MAT, mat);
   5424:     writeArr(LS_MY_WORK, work);
   5425:   }
   5426:   function setServerArrays(mat,work){
   5427:     mat = unique(mat || [], 'mat');
   5428:     work = unique(work || [], 'work');
>> 5429:     window.EP_GLOBAL_MAT = mat;
   5430:     window.EP_GLOBAL_WORK = work;
   5431:     window.EP_FORCE_GLOBAL = {matDB:mat, workDB:work};
   5432:     window.EP_ULTIMATE_DB_CACHE = {matDB:mat, workDB:work, ts:Date.now()};
   5433:     window.EP_GLOBAL_DB_VISIBLE_CACHE = {matDB:mat, workDB:work, ts:Date.now()};
   5434:     writeObj(LS_SERVER_CACHE, {matDB:mat, workDB:work, ts:Date.now()});
   5435:   }
   5436:   function syncActiveArrays(){
   5437:     try{
   5438:       if(getScope() === 'global'){
   5439:         var sm = Array.isArray(window.EP_GLOBAL_MAT) ? window.EP_GLOBAL_MAT : getServerFromCache('mat');
   5440:         var sw = Array.isArray(window.EP_GLOBAL_WORK) ? window.EP_GLOBAL_WORK : getServerFromCache('work');
   5441:         window.matDB = sm.slice();
   5442:         window.workDB = sw.slice();
   5443:         try{ matDB = window.matDB; workDB = window.workDB; }catch(e){}
   5444:       } else {
   5445:         var mm = Array.isArray(window.EP_MY_MAT) ? window.EP_MY_MAT : readArr(LS_MY_MAT);
   5446:         var mw = Array.isArray(window.EP_MY_WORK) ? window.EP_MY_WORK : readArr(LS_MY_WORK);
   5447:         window.matDB = mm.slice();
   5448:         window.workDB = mw.slice();
   5449:         try{ matDB = window.matDB; workDB = window.workDB; }catch(e){}
   5450:       }
   5451:     }catch(e){ console.warn('EP V5 sync active arrays failed', e); }
```


## EP_GLOBAL_WORK

Найдено строк: 4446, 4505, 5175, 5191, 5430, 5440, 5470, 5494, 5618, 5647, 6095, 6098, 6374, 6376, 6679, 6681, 7548, 8174, 8198, 8765

### around line 4446

```js
   4434: /*
   4435:  * Extracted from public/index.html
   4436:  * Original script block: 11
   4437:  * Original HTML lines: 6221-6912
   4438:  */
   4439: 
   4440: /* === EP DB SAFE SPLIT + FACTORY RESET V3 2026-05-13: SERVER/MY, ZERO RESET, NO MIX === */
   4441: (function(){
   4442:   var TOP_MAT_DB = [{"id":"m1","c":"Кабель","n":"Кабель ВВГнг-LS 3х1.5 (Конкорд) круглый","p":57,"u":"м.п."},{"id":"m2","c":"Кабель","n":"Кабель ВВГнг-LS 3х2.5 (Конкорд) круглый","p":87,"u":"м.п."},{"id":"m3","c":"Кабель","n":"Кабель ВВГнг(п)-LS 3х1.5 (Конкорд) плоский","p":62,"u":"м.п."},{"id":"m4","c":"Кабель","n":"Кабель ВВГнг(п)-LS 3х2.5 (Конкорд) плоский","p":95,"u":"м.п."},{"id":"m5","c":"Кабель","n":"Кабель ВВГ-Пнг(А)-LS 3x4 (Лептон)","p":146,"u":"м.п."},{"id":"m6","c":"Кабель","n":"Кабель ВВГ-Пнг(А)-LS 3х6 (Лептон)","p":217,"u":"м.п."},{"id":"m7","c":"Кабель","n":"Провод ПуГВ (ПВ-3) 1х6 синий (ЦВЕТЛИТ)","p":85,"u":"м.п."},{"id":"m8","c":"Кабель","n":"Провод ПуГВ (ПВ-3) 1х6 белый (ЦВЕТЛИТ)","p":85,"u":"м.п."},{"id":"m9","c":"Слаботочка","n":"Кабель TV SAT-703 (Cavel)","p":75,"u":"м.п."},{"id":"m10","c":"Слаботочка","n":"Витая пара комп. экран. FTP4 CAT5E 24AWG Cu","p":32,"u":"м.п."},{"id":"m11","c":"Трубы","n":"Труба гофрированная ПВХ 20мм серая","p":8,"u":"м.п."},{"id":"m12","c":"Трубы","n":"Труба гофрированная ПНД 20мм черная","p":10,"u":"м.п."},{"id":"m13","c":"Трубы","n":"Гофра ПВХ/ПНД с протяжкой","p":25,"u":"м.п."},{"id":"m14","c":"Расходники","n":"Подрозетник глубокий для бетона 68х64","p":12,"u":"шт"},{"id":"m15","c":"Расходники","n":"Подрозетник стандарт (ГКЛ)","p":20,"u":"шт"},{"id":"m16","c":"Расходники","n":"Подрозетник глубокий (ГКЛ)","p":35,"u":"шт"},{"id":"m17","c":"Расходники","n":"Коробка распределительная 100х100х40","p":120,"u":"шт"},{"id":"m18","c":"Расходники","n":"Площадка под стяжку для прямого монтажа","p":5,"u":"шт"},{"id":"m19","c":"Расходники","n":"Стяжки нейлоновые КСС 3*100 (100шт)","p":40,"u":"упак."},{"id":"m20","c":"Расходники","n":"Стяжки нейлоновые КСС 5*400 (100шт)","p":410,"u":"упак."},{"id":"m21","c":"Расходники","n":"Газовый баллон 80 мл 165 мм","p":550,"u":"шт"},{"id":"m22","c":"Расходники","n":"Гвозди для прямого монтажа 3х19 мм (1000 шт)","p":1905,"u":"упак."},{"id":"m23","c":"Расходники","n":"Лента монтажная (перфолента)","p":580,"u":"шт"},{"id":"m24","c":"Расходники","n":"Лента монтажная текстильная 20 мм (50м)","p":880,"u":"упак."},{"id":"m25","c":"Щитовое","n":"Наконечник НШВИ 6.0-12 (упак)","p":225,"u":"упак."},{"id":"m26","c":"Щитовое","n":"Наконечник НШВИ(2) 6.0-14 (упак)","p":365,"u":"упак."},{"id":"m27","c":"Расходники","n":"Гильза ГМЛ 4","p":12,"u":"шт"},{"id":"m28","c":"Расходники","n":"Гильза ГМЛ 6","p":18,"u":"шт"},{"id":"m29","c":"Расходники","n":"Термоусадка (м)","p":80,"u":"м"},{"id":"m30","c":"Автоматика","n":"Автомат 1P 10A (ABB SH201)","p":265,"u":"шт"},{"id":"m31","c":"Автоматика","n":"Автомат 1P 16A (ABB SH201)","p":265,"u":"шт"},{"id":"m32","c":"Автоматика","n":"Автомат 1P 40A (ABB SH201)","p":410,"u":"шт"},{"id":"m33","c":"Автоматика","n":"ДИФ Автомат DSH201 C32 AC30 (ABB)","p":3100,"u":"шт"},{"id":"m34","c":"Щитовое","n":"Клеммник винтовой N 5x16 (ABB)","p":345,"u":"шт"},{"id":"m35","c":"Щитовое","n":"Клеммник винтовой PE 11x16 (ABB)","p":770,"u":"шт"},{"id":"m36","c":"Щитовое","n":"Шкаф внутрь. на 36М UK636E3 (ABB)","p":6510,"u":"шт"},{"id":"m37","c":"Щитовое","n":"Шкаф мультимедийный UK620MV (ABB)","p":11025,"u":"шт"},{"id":"m38","c":"Автоматика","n":"Автомат 1P 10A (ИЭК ВА47-29)","p":172,"u":"шт"},{"id":"m39","c":"Автоматика","n":"Автомат 1P 16A (ИЭК ВА47-29)","p":150,"u":"шт"},{"id":"m40","c":"Автоматика","n":"Автомат 2P 40A (ИЭК ВА47-29)","p":380,"u":"шт"},{"id":"m41","c":"Автоматика","n":"УЗО 2P 40A 30мА (ИЭК ВД1-63)","p":1195,"u":"шт"},{"id":"m42","c":"Щитовое","n":"Шина N ноль на DIN-изол (ИЭК)","p":285,"u":"шт"},{"id":"m43","c":"Щитовое","n":"Корпус пластиковый ЩРВ-П-24 (TEKFOR)","p":2660,"u":"шт"},{"id":"m44","c":"Автоматика","n":"Реле напряжения УЗМ-50Ц","p":4500,"u":"шт"}];
   4443:   var TOP_WORK_DB = [{"id":"w44","c":"Алмазная резка","g":"Штроба 25х30","n":"Бетон","p":550,"u":"м.п."},{"id":"w45","c":"Алмазная резка","g":"Штроба 25х30","n":"Кирпич","p":400,"u":"м.п."},{"id":"w46","c":"Алмазная резка","g":"Штроба 25х30","n":"Панелька","p":700,"u":"м.п."},{"id":"w47","c":"Алмазная резка","g":"Штроба 25х30","n":"Мягкий мат.","p":400,"u":"м.п."},{"id":"w48","c":"Алмазная резка","g":"Штроба 50х50","n":"Бетон","p":1500,"u":"м.п."},{"id":"w49","c":"Алмазная резка","g":"Штроба 50х50","n":"Кирпич","p":1300,"u":"м.п."},{"id":"w50","c":"Алмазная резка","g":"Штроба 50х50","n":"Панелька","p":1900,"u":"м.п."},{"id":"w51","c":"Алмазная резка","g":"Штроба 50х50","n":"Мягкий мат.","p":900,"u":"м.п."},{"id":"w52","c":"Алмазная резка","g":"Штроба 100х50 ВВОДНАЯ","n":"Бетон","p":2200,"u":"м.п."},{"id":"w53","c":"Алмазная резка","g":"Штроба 100х50 ВВОДНАЯ","n":"Кирпич","p":1550,"u":"м.п."},{"id":"w54","c":"Алмазная резка","g":"Штроба 100х50 ВВОДНАЯ","n":"Панелька","p":2500,"u":"м.п."},{"id":"w55","c":"Алмазная резка","g":"Штроба 100х50 ВВОДНАЯ","n":"Мягкий мат.","p":1400,"u":"м.п."},{"id":"w56","c":"Алмазная резка","g":"Высверливание подр. стандарт","n":"Бетон","p":600,"u":"шт"},{"id":"w57","c":"Алмазная резка","g":"Высверливание подр. стандарт","n":"Кирпич","p":500,"u":"шт"},{"id":"w58","c":"Алмазная резка","g":"Высверливание подр. стандарт","n":"Панелька","p":650,"u":"шт"},{"id":"w59","c":"Алмазная резка","g":"Высверливание подр. стандарт","n":"Мягкий мат.","p":400,"u":"шт"},{"id":"w60","c":"Черновая электрика","g":"Вклейка подрозетников","n":"Все типы","p":100,"u":"шт"},{"id":"w61","c":"Алмазная резка","g":"Вырубка ниши щита","n":"Бетон","p":400,"u":"мод."},{"id":"w62","c":"Алмазная резка","g":"Вырубка ниши щита","n":"Кирпич","p":300,"u":"мод."},{"id":"w63","c":"Алмазная резка","g":"Вырубка ниши щита","n":"Панелька","p":500,"u":"мод."},{"id":"w64","c":"Алмазная резка","g":"Вырубка ниши щита","n":"Мягкий мат.","p":250,"u":"мод."},{"id":"w65","c":"Монтаж","g":"Прокладка кабеля","n":"Без гофры (Потолок)","p":120,"u":"м.п."},{"id":"w66","c":"Монтаж","g":"Прокладка кабеля","n":"В гофре (Пол)","p":150,"u":"м.п."},{"id":"w67","c":"Монтаж","g":"Распаячная коробка","n":"Сборка распред. коробки / коммутация","p":800,"u":"шт"},{"id":"w68","c":"Чистовая установка","g":"Механизмы","n":"Установка розетки 220В","p":500,"u":"шт"},{"id":"w69","c":"Чистовая установка","g":"Механизмы","n":"Установка выключателя","p":550,"u":"шт"},{"id":"w70","c":"Чистовая установка","g":"Механизмы","n":"Установка терморегулятора","p":900,"u":"шт"},{"id":"w71","c":"Алмазная резка","g":"Высверливание подрозетников глубокий","n":"Бетон","p":650,"u":"шт"},{"id":"w72","c":"Алмазная резка","g":"Высверливание подрозетников глубокий","n":"Кирпич","p":550,"u":"шт"},{"id":"w73","c":"Алмазная резка","g":"Высверливание подрозетников глубокий","n":"Панелька","p":750,"u":"шт"},{"id":"w74","c":"Алмазная резка","g":"Высверливание подрозетников глубокий","n":"Мягкий мат.","p":450,"u":"шт"},{"id":"w75","c":"Алмазная резка","g":"Высверливание подрозетников копос 74х75","n":"Бетон","p":800,"u":"шт"},{"id":"w76","c":"Алмазная резка","g":"Высверливание подрозетников копос 74х75","n":"Кирпич","p":700,"u":"шт"},{"id":"w77","c":"Алмазная резка","g":"Высверливание подрозетников копос 74х75","n":"Панелька","p":850,"u":"шт"},{"id":"w78","c":"Алмазная резка","g":"Высверливание подрозетников копос 74х75","n":"Мягкий мат.","p":500,"u":"шт"},{"id":"w79","c":"Алмазная резка","g":"Отверстие 132 ММ L= до 450","n":"Бетон","p":6000,"u":"шт"},{"id":"w80","c":"Алмазная резка","g":"Отверстие 132 ММ L= до 450","n":"Кирпич","p":4500,"u":"шт"},{"id":"w81","c":"Алмазная резка","g":"Отверстие 132 ММ L= до 450","n":"Панелька","p":7000,"u":"шт"},{"id":"w82","c":"Алмазная резка","g":"Отверстие 132 ММ L= до 450","n":"Мягкий мат.","p":4000,"u":"шт"},{"id":"w83","c":"Алмазная резка","g":"Отверстие 52мм L=до 450мм","n":"Бетон","p":2500,"u":"шт"},{"id":"w84","c":"Алмазная резка","g":"Отверстие 52мм L=до 450мм","n":"Кирпич","p":2000,"u":"шт"},{"id":"w85","c":"Алмазная резка","g":"Отверстие 52мм L=до 450мм","n":"Панелька","p":3000,"u":"шт"},{"id":"w86","c":"Алмазная резка","g":"Отверстие 52мм L=до 450мм","n":"Мягкий мат.","p":1900,"u":"шт"},{"id":"w87","c":"Щитовое","g":"Монтаж","n":"Сборка щита","p":500,"u":"мод."},{"id":"w89","c":"Щитовое","g":"Монтаж","n":"Установка БП в щит","p":900,"u":"ед"},{"id":"w91","c":"Монтаж","g":"Спецоборудование","n":"Подключение нагревателя","p":4000,"u":"ед"},{"id":"w92","c":"Монтаж","g":"Спецоборудование","n":"Система КУП","p":5000,"u":"ед"},{"id":"s_r1","c":"Щитовое","g":"Автоматика и Реле","n":"Установка реле времени","p":1250,"u":"шт"},{"id":"s_r2","c":"Щитовое","g":"Автоматика и Реле","n":"Установка реле освещения (в щите)","p":1250,"u":"шт"},{"id":"s_r3","c":"Щитовое","g":"Автоматика и Реле","n":"Установка реле температуры/жидкости","p":1700,"u":"шт"},{"id":"s_r4","c":"Щитовое","g":"Автоматика и Реле","n":"Установка реле контроля фаз","p":1450,"u":"шт"},{"id":"s_r5","c":"Щитовое","g":"Автоматика и Реле","n":"Установка реле напряжения","p":1150,"u":"шт"},{"id":"s_r6","c":"Щитовое","g":"Автоматика и Реле","n":"Установка реле управления нагрузкой","p":2050,"u":"шт"},{"id":"s_m1","c":"Щитовое","g":"Счетчики","n":"Установка электросчетчика 220-240В на DIN","p":1000,"u":"шт"},{"id":"s_m2","c":"Щитовое","g":"Счетчики","n":"Установка электросчетчика 220-240В на монтажную панель","p":1250,"u":"шт"},{"id":"s_m3","c":"Щитовое","g":"Счетчики","n":"Установка электросчетчика 380-400В на DIN","p":1700,"u":"шт"},{"id":"s_m4","c":"Щитовое","g":"Счетчики","n":"Установка электросчетчика 380-400В на монтажную панель","p":2200,"u":"шт"},{"id":"s_m5","c":"Щитовое","g":"Счетчики","n":"Установка электросчетчика под трансформаторы тока","p":2400,"u":"шт"},{"id":"s_m6","c":"Щитовое","g":"Счетчики","n":"Установка трансформатора тока (без подкл)","p":720,"u":"шт"},{"id":"s_p1","c":"Чистовая установка","g":"Розетки накладные","n":"Установка накладной розетки/выкл на бетон","p":680,"u":"шт"},{"id":"s_p2","c":"Чистовая установка","g":"Розетки накладные","n":"Установка накладной розетки/выкл на кирпич","p":600,"u":"шт"},{"id":"s_p3","c":"Чистовая установка","g":"Розетки накладные","n":"Установка накладной розетки/выкл на ГКЛ","p":530,"u":"шт"},{"id":"s_p4","c":"Чистовая установка","g":"Розетки накладные","n":"Установка накладной розетки/выкл на дерево","p":450,"u":"шт"},{"id":"s_p5","c":"Чистовая установка","g":"Механизмы (Спец)","n":"Установка накладной силовой розетки 380В","p":1000,"u":"шт"},{"id":"s_p6","c":"Чистовая установка","g":"Механизмы (Спец)","n":"Установка встраиваемой силовой розетки 380В","p":530,"u":"шт"},{"id":"s_p7","c":"Чистовая установка","g":"Механизмы","n":"Установка встраиваемой розетки/выкл в подрозетник","p":300,"u":"шт"},{"id":"s_p8","c":"Чистовая установка","g":"Механизмы","n":"Установка блока розеток/выкл","p":1200,"u":"шт"},{"id":"s_d1","c":"Черновая электрика","g":"Электроточки","n":"Установка накладного подрозетника","p":300,"u":"шт"},{"id":"s_d2","c":"Черновая электрика","g":"Электроточки","n":"Установка подрозетника","p":180,"u":"шт"},{"id":"s_d3","c":"Черновая электрика","g":"Электроточки","n":"Установка накладной распаечной коробки","p":450,"u":"шт"},{"id":"s_d4","c":"Черновая электрика","g":"Электроточки","n":"Установка встраиваемой распаечной коробки","p":300,"u":"шт"},{"id":"s_d5","c":"Чистовая установка","g":"Механизмы (Спец)","n":"Установка термостата","p":380,"u":"шт"},{"id":"s_d6","c":"Чистовая установка","g":"Механизмы (Спец)","n":"Установка встраиваемого датчика движения","p":330,"u":"шт"},{"id":"s_d7","c":"Чистовая установка","g":"Механизмы (Спец)","n":"Установка звонка","p":680,"u":"шт"},{"id":"s_d8","c":"Чистовая установка","g":"Механизмы (Спец)","n":"Установка кнопки звонка","p":450,"u":"шт"},{"id":"s_d9","c":"Чистовая установка","g":"Механизмы (Спец)","n":"Установка ТВ краба","p":480,"u":"шт"},{"id":"s_sh1","c":"Щитовое","g":"Монтаж накладных","n":"Монтаж электрощитка накладного 2 модуля","p":180,"u":"шт"},{"id":"s_sh2","c":"Щитовое","g":"Монтаж накладных","n":"Монтаж электрощитка накладного 4-8 модулей","p":290,"u":"шт"},{"id":"s_sh3","c":"Щитовое","g":"Монтаж накладных","n":"Монтаж электрощитка накладного 12-24 модуля","p":330,"u":"шт"},{"id":"s_sh4","c":"Щитовое","g":"Монтаж накладных","n":"Монтаж электрощитка накладного 36-60 модулей","p":560,"u":"шт"},{"id":"s_sh5","c":"Щитовое","g":"Монтаж накладных","n":"Монтаж электрощитка накладного 72-96 модулей","p":780,"u":"шт"},{"id":"s_l1","c":"Освещение","g":"LED Лента","n":"Монтаж светодиодной ленты на кухне под шкафами","p":270,"u":"м.п."},{"id":"s_l2","c":"Освещение","g":"LED Лента","n":"Монтаж светодиодной ленты в натяжной потолок","p":390,"u":"м.п."},{"id":"s_l3","c":"Освещение","g":"LED Лента","n":"Монтаж светодиодной ленты на гипсокартон","p":300,"u":"м.п."},{"id":"s_l4","c":"Освещение","g":"LED Лента","n":"Монтаж светодиодной ленты в потолочный плинтус","p":350,"u":"м.п."},{"id":"s_l5","c":"Освещение","g":"LED Лента","n":"Монтаж светодиодной ленты в алюминиевый профиль","p":230,"u":"м.п."},{"id":"s_l6","c":"Освещение","g":"LED Лента","n":"Монтаж светодиодной ленты на карниз","p":350,"u":"м.п."},{"id":"s_l7","c":"Освещение","g":"LED Лента","n":"Установка светодиодной ленты в светильник","p":180,"u":"м.п."},{"id":"s_l8","c":"Освещение","g":"LED Лента","n":"Монтаж светодиодной ленты на улице","p":380,"u":"м.п."},{"id":"s_l9","c":"Освещение","g":"Алюм. профиль","n":"Установка накладного алюм. профиля на скотч","p":110,"u":"м.п."},{"id":"s_l10","c":"Освещение","g":"Алюм. профиль","n":"Установка накладного алюм. профиля со сверлением","p":290,"u":"м.п."},{"id":"s_l11","c":"Освещение","g":"Алюм. профиль","n":"Установка врезного алюм. профиля в готовый паз","p":120,"u":"м.п."},{"id":"s_l12","c":"Освещение","g":"Алюм. профиль","n":"Установка врезного алюм. профиля с подготовкой паза","p":390,"u":"м.п."},{"id":"s_c1","c":"Освещение","g":"Люстры и Светильники","n":"Сборка простой люстры","p":630,"u":"шт"},{"id":"s_c2","c":"Освещение","g":"Люстры и Светильники","n":"Сборка сложной люстры","p":870,"u":"шт"},{"id":"s_c3","c":"Освещение","g":"Люстры и Светильники","n":"Установка крюка под люстру","p":230,"u":"шт"},{"id":"s_c4","c":"Освещение","g":"Люстры и Светильники","n":"Установка люстры на готовый крюк","p":740,"u":"шт"},{"id":"s_c5","c":"Освещение","g":"Люстры и Светильники","n":"Установка люстры с креплением к потолку (простая)","p":1200,"u":"шт"},{"id":"s_c6","c":"Освещение","g":"Люстры и Светильники","n":"Установка люстры с креплением к потолку (сложная/ДУ)","p":2250,"u":"шт"},{"id":"s_c7","c":"Освещение","g":"Люстры и Светильники","n":"Установка тяжелой люстры с креплением на крюк","p":1950,"u":"шт"},{"id":"s_c8","c":"Освещение","g":"Люстры и Светильники","n":"Установка тяжелой люстры с креплением к потолку","p":3600,"u":"шт"},{"id":"s_c9","c":"Освещение","g":"Люстры и Светильники","n":"Установка настенного светильника, бра","p":450,"u":"шт"},{"id":"s_c10","c":"Освещение","g":"Люстры и Светильники","n":"Установка точечного светильника","p":750,"u":"шт"},{"id":"s_c11","c":"Освещение","g":"Люстры и Светильники","n":"Установка светодиодного светильника","p":680,"u":"шт"},{"id":"s_c12","c":"Освещение","g":"Люстры и Светильники","n":"Установка светильника Армстронг","p":380,"u":"шт"},{"id":"s_c13","c":"Освещение","g":"Люстры и Светильники","n":"Установка люминесцентного светильника","p":410,"u":"шт"},{"id":"s_c14","c":"Освещение","g":"Люстры и Светильники","n":"Установка трекового светильника","p":140,"u":"шт"},{"id":"s_c15","c":"Освещение","g":"Люстры и Светильники","n":"Монтаж шинопровода","p":450,"u":"м.п."},{"id":"s_c16","c":"Освещение","g":"Уличное освещение","n":"Установка уличного светильника на фасаде","p":830,"u":"шт"},{"id":"s_c17","c":"Освещение","g":"Уличное освещение","n":"Установка садово-паркового светильника","p":1350,"u":"шт"},{"id":"s_c18","c":"Освещение","g":"Люстры и Светильники","n":"Установка светильника Выход","p":480,"u":"шт"},{"id":"s_c19","c":"Освещение","g":"Уличное освещение","n":"Установка антивандального светильника","p":660,"u":"шт"},{"id":"s_dem1","c":"Демонтаж","g":"Освещение","n":"Демонтаж люстры","p":240,"u":"шт"},{"id":"s_dem2","c":"Демонтаж","g":"Освещение","n":"Демонтаж светильника","p":210,"u":"шт"},{"id":"s_dem3","c":"Демонтаж","g":"Электроточки","n":"Демонтаж розетки","p":200,"u":"шт"},{"id":"s_dem4","c":"Демонтаж","g":"Электроточки","n":"Демонтаж выключателя","p":200,"u":"шт"},{"id":"s_dem5","c":"Демонтаж","g":"Электроточки","n":"Демонтаж распаечной коробки","p":200,"u":"шт"},{"id":"s_dem6","c":"Демонтаж","g":"Электроточки","n":"Демонтаж дверного звонка","p":200,"u":"шт"},{"id":"s_dem7","c":"Демонтаж","g":"Щитовое","n":"Демонтаж реле времени","p":230,"u":"шт"},{"id":"s_dem8","c":"Демонтаж","g":"Щитовое","n":"Демонтаж электрощитка до 8 модулей","p":110,"u":"шт"},{"id":"s_dem9","c":"Демонтаж","g":"Щитовое","n":"Демонтаж электрощитка 12-36 модулей","p":260,"u":"шт"},{"id":"s_dem10","c":"Демонтаж","g":"Щитовое","n":"Демонтаж электрощитка 48-96 модулей","p":470,"u":"шт"},{"id":"s_dem11","c":"Демонтаж","g":"Щитовое","n":"Демонтаж автомата","p":150,"u":"шт"},{"id":"s_dem12","c":"Демонтаж","g":"Щитовое","n":"Демонтаж УЗО","p":150,"u":"шт"},{"id":"s_dem13","c":"Демонтаж","g":"Щитовое","n":"Демонтаж дифавтомата","p":150,"u":"шт"},{"id":"s_dem14","c":"Демонтаж","g":"Щитовое","n":"Демонтаж рубильника","p":150,"u":"шт"},{"id":"s_dem15","c":"Демонтаж","g":"Щитовое","n":"Демонтаж магнитного пускателя","p":140,"u":"шт"}];
   4444: 
   4445:   var EP_GLOBAL_MAT = TOP_MAT_DB.slice();
>> 4446:   var EP_GLOBAL_WORK = TOP_WORK_DB.slice();
   4447:   var EP_MY_MAT = [];
   4448:   var EP_MY_WORK = [];
   4449: 
   4450:   var LS_MY_MAT = 'user_db_mat_v31';
   4451:   var LS_MY_WORK = 'user_db_work_v31';
   4452:   var LS_SERVER_CACHE = 'ep_global_cache_force_v1';
   4453:   var LS_OLD_SERVER_CACHE = 'ep_global_cache_ultimate_v1';
   4454:   var LS_SCOPE = 'ep_db_scope_v2';
   4455:   var LS_CLEAN = 'ep_db_clean_mode_v1';
   4456:   var LS_MASTER_CREATED = 'ep_master_db_created_v1';
   4457: 
   4458:   var EP_MY_MAT = [];
   4459:   var EP_MY_WORK = [];
   4460:   var EP_SERVER_MAT = [];
   4461:   var EP_SERVER_WORK = [];
   4462:   var EP_SERVER_DOC_SEEN = false;
   4463: 
   4464:   function $(id){ return document.getElementById(id); }
   4465:   function toast(t){ if(typeof showToast === 'function') showToast(t); else alert(t); }
   4466:   function esc(s){ return String(s == null ? '' : s).replace(/[&<>"']/g,function(m){ return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]; }); }
   4467:   function cleanText(s){ return String(s || '').toLowerCase().replace(/ё/g,'е').replace(/×/g,'x').replace(/х/g,'x').replace(/[^a-zа-я0-9]+/g,' ').trim(); }
   4468:   function clone(x){ var y=Object.assign({}, x || {}); delete y.__src; delete y.__encoded; return y; }
```

### around line 4505

```js
   4493:     return out;
   4494:   }
   4495: 
   4496:   function myArr(type){ return type==='work' ? EP_MY_WORK : EP_MY_MAT; }
   4497:   function serverArr(type){ return type==='work' ? EP_SERVER_WORK : EP_SERVER_MAT; }
   4498:   function activeArr(type){ return scope()==='global' ? serverArr(type) : myArr(type); }
   4499: 
   4500:   function syncWindowCaches(){
   4501:     try{
   4502:       window.EP_MY_MAT = EP_MY_MAT;
   4503:       window.EP_MY_WORK = EP_MY_WORK;
   4504:       window.EP_GLOBAL_MAT = EP_SERVER_MAT;
>> 4505:       window.EP_GLOBAL_WORK = EP_SERVER_WORK;
   4506:       window.EP_FORCE_GLOBAL = {matDB:EP_SERVER_MAT, workDB:EP_SERVER_WORK};
   4507:       window.EP_ULTIMATE_DB_CACHE = {matDB:EP_SERVER_MAT, workDB:EP_SERVER_WORK, ts:Date.now()};
   4508:       window.EP_GLOBAL_DB_VISIBLE_CACHE = {matDB:EP_SERVER_MAT, workDB:EP_SERVER_WORK, ts:Date.now()};
   4509:       window.userMatDB = EP_MY_MAT;
   4510:       window.userWorkDB = EP_MY_WORK;
   4511:       if(scope()==='global'){ matDB = EP_SERVER_MAT.slice(); workDB = EP_SERVER_WORK.slice(); }
   4512:       else { matDB = EP_MY_MAT.slice(); workDB = EP_MY_WORK.slice(); }
   4513:     }catch(e){}
   4514:   }
   4515: 
   4516:   function saveMyLocal(type, arr){
   4517:     arr = unique(arr||[], type);
   4518:     if(type==='work') EP_MY_WORK = arr; else EP_MY_MAT = arr;
   4519:     setLS(LS_MY_MAT, EP_MY_MAT);
   4520:     setLS(LS_MY_WORK, EP_MY_WORK);
   4521:     try{ localStorage.setItem(LS_MASTER_CREATED,'1'); }catch(e){}
   4522:     syncWindowCaches();
   4523:     epSaveMyDbToServer();
   4524:   }
   4525: 
   4526:   function saveServerLocal(type, arr, saveDirect){
   4527:     arr = unique(arr||[], type);
```

### around line 5175

```js
   5163:   function clean(s){ return String(s || '').toLowerCase().replace(/ё/g,'е').replace(/×/g,'x').replace(/х/g,'x').replace(/[^a-zа-я0-9]+/g,' ').trim(); }
   5164:   function groupOf(it){ return (it && (it.g || it.sc || it.subcategory || it.group)) || ''; }
   5165:   function clone(it){ var x = Object.assign({}, it || {}); delete x.__src; delete x.__encoded; return x; }
   5166:   function sig(type,it){ return type + '|' + clean([it && it.c, groupOf(it), it && it.n, it && it.u].filter(Boolean).join('|')); }
   5167:   function activeTarget(){ return (isAdmin() && scope() === 'global') ? 'global' : 'my'; }
   5168: 
   5169:   function getMy(type){
   5170:     var key = type === 'work' ? LS_MY_WORK : LS_MY_MAT;
   5171:     var fromWin = type === 'work' ? window.EP_MY_WORK : window.EP_MY_MAT;
   5172:     return Array.isArray(fromWin) ? fromWin.slice() : readArr(key);
   5173:   }
   5174:   function getServer(type){
>> 5175:     var fromWin = type === 'work' ? window.EP_GLOBAL_WORK : window.EP_GLOBAL_MAT;
   5176:     if(Array.isArray(fromWin)) return fromWin.slice();
   5177:     var c = readObj(LS_SERVER_CACHE);
   5178:     var a = type === 'work' ? c.workDB : c.matDB;
   5179:     return Array.isArray(a) ? a : [];
   5180:   }
   5181:   function setMy(type,arr){
   5182:     arr = unique(arr, type);
   5183:     if(type === 'work') window.EP_MY_WORK = arr; else window.EP_MY_MAT = arr;
   5184:     writeArr(LS_MY_MAT, type === 'mat' ? arr : getMy('mat'));
   5185:     writeArr(LS_MY_WORK, type === 'work' ? arr : getMy('work'));
   5186:     try{ window.userMatDB = getMy('mat'); window.userWorkDB = getMy('work'); }catch(e){}
   5187:     syncMainArrays('my');
   5188:   }
   5189:   function setServer(type,arr){
   5190:     arr = unique(arr, type);
   5191:     if(type === 'work') window.EP_GLOBAL_WORK = arr; else window.EP_GLOBAL_MAT = arr;
   5192:     var mat = type === 'mat' ? arr : getServer('mat');
   5193:     var work = type === 'work' ? arr : getServer('work');
   5194:     try{
   5195:       window.EP_FORCE_GLOBAL = {matDB:mat, workDB:work};
   5196:       window.EP_ULTIMATE_DB_CACHE = {matDB:mat, workDB:work, ts:Date.now()};
   5197:       window.EP_GLOBAL_DB_VISIBLE_CACHE = {matDB:mat, workDB:work, ts:Date.now()};
```

### around line 5191

```js
   5179:     return Array.isArray(a) ? a : [];
   5180:   }
   5181:   function setMy(type,arr){
   5182:     arr = unique(arr, type);
   5183:     if(type === 'work') window.EP_MY_WORK = arr; else window.EP_MY_MAT = arr;
   5184:     writeArr(LS_MY_MAT, type === 'mat' ? arr : getMy('mat'));
   5185:     writeArr(LS_MY_WORK, type === 'work' ? arr : getMy('work'));
   5186:     try{ window.userMatDB = getMy('mat'); window.userWorkDB = getMy('work'); }catch(e){}
   5187:     syncMainArrays('my');
   5188:   }
   5189:   function setServer(type,arr){
   5190:     arr = unique(arr, type);
>> 5191:     if(type === 'work') window.EP_GLOBAL_WORK = arr; else window.EP_GLOBAL_MAT = arr;
   5192:     var mat = type === 'mat' ? arr : getServer('mat');
   5193:     var work = type === 'work' ? arr : getServer('work');
   5194:     try{
   5195:       window.EP_FORCE_GLOBAL = {matDB:mat, workDB:work};
   5196:       window.EP_ULTIMATE_DB_CACHE = {matDB:mat, workDB:work, ts:Date.now()};
   5197:       window.EP_GLOBAL_DB_VISIBLE_CACHE = {matDB:mat, workDB:work, ts:Date.now()};
   5198:     }catch(e){}
   5199:     writeObj(LS_SERVER_CACHE, {matDB:mat, workDB:work, ts:Date.now()});
   5200:     syncMainArrays('global');
   5201:   }
   5202:   function syncMainArrays(target){
   5203:     try{
   5204:       var use = target || activeTarget();
   5205:       if(use === 'global'){
   5206:         window.matDB = getServer('mat');
   5207:         window.workDB = getServer('work');
   5208:         try{ matDB = window.matDB; workDB = window.workDB; }catch(e){}
   5209:       } else {
   5210:         window.matDB = getMy('mat');
   5211:         window.workDB = getMy('work');
   5212:         try{ matDB = window.matDB; workDB = window.workDB; }catch(e){}
   5213:       }
```

### around line 5430

```js
   5418:     work = unique(work || [], 'work');
   5419:     window.EP_MY_MAT = mat;
   5420:     window.EP_MY_WORK = work;
   5421:     window.userMatDB = mat;
   5422:     window.userWorkDB = work;
   5423:     writeArr(LS_MY_MAT, mat);
   5424:     writeArr(LS_MY_WORK, work);
   5425:   }
   5426:   function setServerArrays(mat,work){
   5427:     mat = unique(mat || [], 'mat');
   5428:     work = unique(work || [], 'work');
   5429:     window.EP_GLOBAL_MAT = mat;
>> 5430:     window.EP_GLOBAL_WORK = work;
   5431:     window.EP_FORCE_GLOBAL = {matDB:mat, workDB:work};
   5432:     window.EP_ULTIMATE_DB_CACHE = {matDB:mat, workDB:work, ts:Date.now()};
   5433:     window.EP_GLOBAL_DB_VISIBLE_CACHE = {matDB:mat, workDB:work, ts:Date.now()};
   5434:     writeObj(LS_SERVER_CACHE, {matDB:mat, workDB:work, ts:Date.now()});
   5435:   }
   5436:   function syncActiveArrays(){
   5437:     try{
   5438:       if(getScope() === 'global'){
   5439:         var sm = Array.isArray(window.EP_GLOBAL_MAT) ? window.EP_GLOBAL_MAT : getServerFromCache('mat');
   5440:         var sw = Array.isArray(window.EP_GLOBAL_WORK) ? window.EP_GLOBAL_WORK : getServerFromCache('work');
   5441:         window.matDB = sm.slice();
   5442:         window.workDB = sw.slice();
   5443:         try{ matDB = window.matDB; workDB = window.workDB; }catch(e){}
   5444:       } else {
   5445:         var mm = Array.isArray(window.EP_MY_MAT) ? window.EP_MY_MAT : readArr(LS_MY_MAT);
   5446:         var mw = Array.isArray(window.EP_MY_WORK) ? window.EP_MY_WORK : readArr(LS_MY_WORK);
   5447:         window.matDB = mm.slice();
   5448:         window.workDB = mw.slice();
   5449:         try{ matDB = window.matDB; workDB = window.workDB; }catch(e){}
   5450:       }
   5451:     }catch(e){ console.warn('EP V5 sync active arrays failed', e); }
   5452:   }
```


## EP_MY_MAT

Найдено строк: 4447, 4458, 4496, 4502, 4509, 4512, 4518, 4519, 4555, 4595, 4622, 4624, 4638, 4782, 4784, 4920, 4925, 4939, 4947, 5123

### around line 4447

```js
   4435:  * Extracted from public/index.html
   4436:  * Original script block: 11
   4437:  * Original HTML lines: 6221-6912
   4438:  */
   4439: 
   4440: /* === EP DB SAFE SPLIT + FACTORY RESET V3 2026-05-13: SERVER/MY, ZERO RESET, NO MIX === */
   4441: (function(){
   4442:   var TOP_MAT_DB = [{"id":"m1","c":"Кабель","n":"Кабель ВВГнг-LS 3х1.5 (Конкорд) круглый","p":57,"u":"м.п."},{"id":"m2","c":"Кабель","n":"Кабель ВВГнг-LS 3х2.5 (Конкорд) круглый","p":87,"u":"м.п."},{"id":"m3","c":"Кабель","n":"Кабель ВВГнг(п)-LS 3х1.5 (Конкорд) плоский","p":62,"u":"м.п."},{"id":"m4","c":"Кабель","n":"Кабель ВВГнг(п)-LS 3х2.5 (Конкорд) плоский","p":95,"u":"м.п."},{"id":"m5","c":"Кабель","n":"Кабель ВВГ-Пнг(А)-LS 3x4 (Лептон)","p":146,"u":"м.п."},{"id":"m6","c":"Кабель","n":"Кабель ВВГ-Пнг(А)-LS 3х6 (Лептон)","p":217,"u":"м.п."},{"id":"m7","c":"Кабель","n":"Провод ПуГВ (ПВ-3) 1х6 синий (ЦВЕТЛИТ)","p":85,"u":"м.п."},{"id":"m8","c":"Кабель","n":"Провод ПуГВ (ПВ-3) 1х6 белый (ЦВЕТЛИТ)","p":85,"u":"м.п."},{"id":"m9","c":"Слаботочка","n":"Кабель TV SAT-703 (Cavel)","p":75,"u":"м.п."},{"id":"m10","c":"Слаботочка","n":"Витая пара комп. экран. FTP4 CAT5E 24AWG Cu","p":32,"u":"м.п."},{"id":"m11","c":"Трубы","n":"Труба гофрированная ПВХ 20мм серая","p":8,"u":"м.п."},{"id":"m12","c":"Трубы","n":"Труба гофрированная ПНД 20мм черная","p":10,"u":"м.п."},{"id":"m13","c":"Трубы","n":"Гофра ПВХ/ПНД с протяжкой","p":25,"u":"м.п."},{"id":"m14","c":"Расходники","n":"Подрозетник глубокий для бетона 68х64","p":12,"u":"шт"},{"id":"m15","c":"Расходники","n":"Подрозетник стандарт (ГКЛ)","p":20,"u":"шт"},{"id":"m16","c":"Расходники","n":"Подрозетник глубокий (ГКЛ)","p":35,"u":"шт"},{"id":"m17","c":"Расходники","n":"Коробка распределительная 100х100х40","p":120,"u":"шт"},{"id":"m18","c":"Расходники","n":"Площадка под стяжку для прямого монтажа","p":5,"u":"шт"},{"id":"m19","c":"Расходники","n":"Стяжки нейлоновые КСС 3*100 (100шт)","p":40,"u":"упак."},{"id":"m20","c":"Расходники","n":"Стяжки нейлоновые КСС 5*400 (100шт)","p":410,"u":"упак."},{"id":"m21","c":"Расходники","n":"Газовый баллон 80 мл 165 мм","p":550,"u":"шт"},{"id":"m22","c":"Расходники","n":"Гвозди для прямого монтажа 3х19 мм (1000 шт)","p":1905,"u":"упак."},{"id":"m23","c":"Расходники","n":"Лента монтажная (перфолента)","p":580,"u":"шт"},{"id":"m24","c":"Расходники","n":"Лента монтажная текстильная 20 мм (50м)","p":880,"u":"упак."},{"id":"m25","c":"Щитовое","n":"Наконечник НШВИ 6.0-12 (упак)","p":225,"u":"упак."},{"id":"m26","c":"Щитовое","n":"Наконечник НШВИ(2) 6.0-14 (упак)","p":365,"u":"упак."},{"id":"m27","c":"Расходники","n":"Гильза ГМЛ 4","p":12,"u":"шт"},{"id":"m28","c":"Расходники","n":"Гильза ГМЛ 6","p":18,"u":"шт"},{"id":"m29","c":"Расходники","n":"Термоусадка (м)","p":80,"u":"м"},{"id":"m30","c":"Автоматика","n":"Автомат 1P 10A (ABB SH201)","p":265,"u":"шт"},{"id":"m31","c":"Автоматика","n":"Автомат 1P 16A (ABB SH201)","p":265,"u":"шт"},{"id":"m32","c":"Автоматика","n":"Автомат 1P 40A (ABB SH201)","p":410,"u":"шт"},{"id":"m33","c":"Автоматика","n":"ДИФ Автомат DSH201 C32 AC30 (ABB)","p":3100,"u":"шт"},{"id":"m34","c":"Щитовое","n":"Клеммник винтовой N 5x16 (ABB)","p":345,"u":"шт"},{"id":"m35","c":"Щитовое","n":"Клеммник винтовой PE 11x16 (ABB)","p":770,"u":"шт"},{"id":"m36","c":"Щитовое","n":"Шкаф внутрь. на 36М UK636E3 (ABB)","p":6510,"u":"шт"},{"id":"m37","c":"Щитовое","n":"Шкаф мультимедийный UK620MV (ABB)","p":11025,"u":"шт"},{"id":"m38","c":"Автоматика","n":"Автомат 1P 10A (ИЭК ВА47-29)","p":172,"u":"шт"},{"id":"m39","c":"Автоматика","n":"Автомат 1P 16A (ИЭК ВА47-29)","p":150,"u":"шт"},{"id":"m40","c":"Автоматика","n":"Автомат 2P 40A (ИЭК ВА47-29)","p":380,"u":"шт"},{"id":"m41","c":"Автоматика","n":"УЗО 2P 40A 30мА (ИЭК ВД1-63)","p":1195,"u":"шт"},{"id":"m42","c":"Щитовое","n":"Шина N ноль на DIN-изол (ИЭК)","p":285,"u":"шт"},{"id":"m43","c":"Щитовое","n":"Корпус пластиковый ЩРВ-П-24 (TEKFOR)","p":2660,"u":"шт"},{"id":"m44","c":"Автоматика","n":"Реле напряжения УЗМ-50Ц","p":4500,"u":"шт"}];
   4443:   var TOP_WORK_DB = [{"id":"w44","c":"Алмазная резка","g":"Штроба 25х30","n":"Бетон","p":550,"u":"м.п."},{"id":"w45","c":"Алмазная резка","g":"Штроба 25х30","n":"Кирпич","p":400,"u":"м.п."},{"id":"w46","c":"Алмазная резка","g":"Штроба 25х30","n":"Панелька","p":700,"u":"м.п."},{"id":"w47","c":"Алмазная резка","g":"Штроба 25х30","n":"Мягкий мат.","p":400,"u":"м.п."},{"id":"w48","c":"Алмазная резка","g":"Штроба 50х50","n":"Бетон","p":1500,"u":"м.п."},{"id":"w49","c":"Алмазная резка","g":"Штроба 50х50","n":"Кирпич","p":1300,"u":"м.п."},{"id":"w50","c":"Алмазная резка","g":"Штроба 50х50","n":"Панелька","p":1900,"u":"м.п."},{"id":"w51","c":"Алмазная резка","g":"Штроба 50х50","n":"Мягкий мат.","p":900,"u":"м.п."},{"id":"w52","c":"Алмазная резка","g":"Штроба 100х50 ВВОДНАЯ","n":"Бетон","p":2200,"u":"м.п."},{"id":"w53","c":"Алмазная резка","g":"Штроба 100х50 ВВОДНАЯ","n":"Кирпич","p":1550,"u":"м.п."},{"id":"w54","c":"Алмазная резка","g":"Штроба 100х50 ВВОДНАЯ","n":"Панелька","p":2500,"u":"м.п."},{"id":"w55","c":"Алмазная резка","g":"Штроба 100х50 ВВОДНАЯ","n":"Мягкий мат.","p":1400,"u":"м.п."},{"id":"w56","c":"Алмазная резка","g":"Высверливание подр. стандарт","n":"Бетон","p":600,"u":"шт"},{"id":"w57","c":"Алмазная резка","g":"Высверливание подр. стандарт","n":"Кирпич","p":500,"u":"шт"},{"id":"w58","c":"Алмазная резка","g":"Высверливание подр. стандарт","n":"Панелька","p":650,"u":"шт"},{"id":"w59","c":"Алмазная резка","g":"Высверливание подр. стандарт","n":"Мягкий мат.","p":400,"u":"шт"},{"id":"w60","c":"Черновая электрика","g":"Вклейка подрозетников","n":"Все типы","p":100,"u":"шт"},{"id":"w61","c":"Алмазная резка","g":"Вырубка ниши щита","n":"Бетон","p":400,"u":"мод."},{"id":"w62","c":"Алмазная резка","g":"Вырубка ниши щита","n":"Кирпич","p":300,"u":"мод."},{"id":"w63","c":"Алмазная резка","g":"Вырубка ниши щита","n":"Панелька","p":500,"u":"мод."},{"id":"w64","c":"Алмазная резка","g":"Вырубка ниши щита","n":"Мягкий мат.","p":250,"u":"мод."},{"id":"w65","c":"Монтаж","g":"Прокладка кабеля","n":"Без гофры (Потолок)","p":120,"u":"м.п."},{"id":"w66","c":"Монтаж","g":"Прокладка кабеля","n":"В гофре (Пол)","p":150,"u":"м.п."},{"id":"w67","c":"Монтаж","g":"Распаячная коробка","n":"Сборка распред. коробки / коммутация","p":800,"u":"шт"},{"id":"w68","c":"Чистовая установка","g":"Механизмы","n":"Установка розетки 220В","p":500,"u":"шт"},{"id":"w69","c":"Чистовая установка","g":"Механизмы","n":"Установка выключателя","p":550,"u":"шт"},{"id":"w70","c":"Чистовая установка","g":"Механизмы","n":"Установка терморегулятора","p":900,"u":"шт"},{"id":"w71","c":"Алмазная резка","g":"Высверливание подрозетников глубокий","n":"Бетон","p":650,"u":"шт"},{"id":"w72","c":"Алмазная резка","g":"Высверливание подрозетников глубокий","n":"Кирпич","p":550,"u":"шт"},{"id":"w73","c":"Алмазная резка","g":"Высверливание подрозетников глубокий","n":"Панелька","p":750,"u":"шт"},{"id":"w74","c":"Алмазная резка","g":"Высверливание подрозетников глубокий","n":"Мягкий мат.","p":450,"u":"шт"},{"id":"w75","c":"Алмазная резка","g":"Высверливание подрозетников копос 74х75","n":"Бетон","p":800,"u":"шт"},{"id":"w76","c":"Алмазная резка","g":"Высверливание подрозетников копос 74х75","n":"Кирпич","p":700,"u":"шт"},{"id":"w77","c":"Алмазная резка","g":"Высверливание подрозетников копос 74х75","n":"Панелька","p":850,"u":"шт"},{"id":"w78","c":"Алмазная резка","g":"Высверливание подрозетников копос 74х75","n":"Мягкий мат.","p":500,"u":"шт"},{"id":"w79","c":"Алмазная резка","g":"Отверстие 132 ММ L= до 450","n":"Бетон","p":6000,"u":"шт"},{"id":"w80","c":"Алмазная резка","g":"Отверстие 132 ММ L= до 450","n":"Кирпич","p":4500,"u":"шт"},{"id":"w81","c":"Алмазная резка","g":"Отверстие 132 ММ L= до 450","n":"Панелька","p":7000,"u":"шт"},{"id":"w82","c":"Алмазная резка","g":"Отверстие 132 ММ L= до 450","n":"Мягкий мат.","p":4000,"u":"шт"},{"id":"w83","c":"Алмазная резка","g":"Отверстие 52мм L=до 450мм","n":"Бетон","p":2500,"u":"шт"},{"id":"w84","c":"Алмазная резка","g":"Отверстие 52мм L=до 450мм","n":"Кирпич","p":2000,"u":"шт"},{"id":"w85","c":"Алмазная резка","g":"Отверстие 52мм L=до 450мм","n":"Панелька","p":3000,"u":"шт"},{"id":"w86","c":"Алмазная резка","g":"Отверстие 52мм L=до 450мм","n":"Мягкий мат.","p":1900,"u":"шт"},{"id":"w87","c":"Щитовое","g":"Монтаж","n":"Сборка щита","p":500,"u":"мод."},{"id":"w89","c":"Щитовое","g":"Монтаж","n":"Установка БП в щит","p":900,"u":"ед"},{"id":"w91","c":"Монтаж","g":"Спецоборудование","n":"Подключение нагревателя","p":4000,"u":"ед"},{"id":"w92","c":"Монтаж","g":"Спецоборудование","n":"Система КУП","p":5000,"u":"ед"},{"id":"s_r1","c":"Щитовое","g":"Автоматика и Реле","n":"Установка реле времени","p":1250,"u":"шт"},{"id":"s_r2","c":"Щитовое","g":"Автоматика и Реле","n":"Установка реле освещения (в щите)","p":1250,"u":"шт"},{"id":"s_r3","c":"Щитовое","g":"Автоматика и Реле","n":"Установка реле температуры/жидкости","p":1700,"u":"шт"},{"id":"s_r4","c":"Щитовое","g":"Автоматика и Реле","n":"Установка реле контроля фаз","p":1450,"u":"шт"},{"id":"s_r5","c":"Щитовое","g":"Автоматика и Реле","n":"Установка реле напряжения","p":1150,"u":"шт"},{"id":"s_r6","c":"Щитовое","g":"Автоматика и Реле","n":"Установка реле управления нагрузкой","p":2050,"u":"шт"},{"id":"s_m1","c":"Щитовое","g":"Счетчики","n":"Установка электросчетчика 220-240В на DIN","p":1000,"u":"шт"},{"id":"s_m2","c":"Щитовое","g":"Счетчики","n":"Установка электросчетчика 220-240В на монтажную панель","p":1250,"u":"шт"},{"id":"s_m3","c":"Щитовое","g":"Счетчики","n":"Установка электросчетчика 380-400В на DIN","p":1700,"u":"шт"},{"id":"s_m4","c":"Щитовое","g":"Счетчики","n":"Установка электросчетчика 380-400В на монтажную панель","p":2200,"u":"шт"},{"id":"s_m5","c":"Щитовое","g":"Счетчики","n":"Установка электросчетчика под трансформаторы тока","p":2400,"u":"шт"},{"id":"s_m6","c":"Щитовое","g":"Счетчики","n":"Установка трансформатора тока (без подкл)","p":720,"u":"шт"},{"id":"s_p1","c":"Чистовая установка","g":"Розетки накладные","n":"Установка накладной розетки/выкл на бетон","p":680,"u":"шт"},{"id":"s_p2","c":"Чистовая установка","g":"Розетки накладные","n":"Установка накладной розетки/выкл на кирпич","p":600,"u":"шт"},{"id":"s_p3","c":"Чистовая установка","g":"Розетки накладные","n":"Установка накладной розетки/выкл на ГКЛ","p":530,"u":"шт"},{"id":"s_p4","c":"Чистовая установка","g":"Розетки накладные","n":"Установка накладной розетки/выкл на дерево","p":450,"u":"шт"},{"id":"s_p5","c":"Чистовая установка","g":"Механизмы (Спец)","n":"Установка накладной силовой розетки 380В","p":1000,"u":"шт"},{"id":"s_p6","c":"Чистовая установка","g":"Механизмы (Спец)","n":"Установка встраиваемой силовой розетки 380В","p":530,"u":"шт"},{"id":"s_p7","c":"Чистовая установка","g":"Механизмы","n":"Установка встраиваемой розетки/выкл в подрозетник","p":300,"u":"шт"},{"id":"s_p8","c":"Чистовая установка","g":"Механизмы","n":"Установка блока розеток/выкл","p":1200,"u":"шт"},{"id":"s_d1","c":"Черновая электрика","g":"Электроточки","n":"Установка накладного подрозетника","p":300,"u":"шт"},{"id":"s_d2","c":"Черновая электрика","g":"Электроточки","n":"Установка подрозетника","p":180,"u":"шт"},{"id":"s_d3","c":"Черновая электрика","g":"Электроточки","n":"Установка накладной распаечной коробки","p":450,"u":"шт"},{"id":"s_d4","c":"Черновая электрика","g":"Электроточки","n":"Установка встраиваемой распаечной коробки","p":300,"u":"шт"},{"id":"s_d5","c":"Чистовая установка","g":"Механизмы (Спец)","n":"Установка термостата","p":380,"u":"шт"},{"id":"s_d6","c":"Чистовая установка","g":"Механизмы (Спец)","n":"Установка встраиваемого датчика движения","p":330,"u":"шт"},{"id":"s_d7","c":"Чистовая установка","g":"Механизмы (Спец)","n":"Установка звонка","p":680,"u":"шт"},{"id":"s_d8","c":"Чистовая установка","g":"Механизмы (Спец)","n":"Установка кнопки звонка","p":450,"u":"шт"},{"id":"s_d9","c":"Чистовая установка","g":"Механизмы (Спец)","n":"Установка ТВ краба","p":480,"u":"шт"},{"id":"s_sh1","c":"Щитовое","g":"Монтаж накладных","n":"Монтаж электрощитка накладного 2 модуля","p":180,"u":"шт"},{"id":"s_sh2","c":"Щитовое","g":"Монтаж накладных","n":"Монтаж электрощитка накладного 4-8 модулей","p":290,"u":"шт"},{"id":"s_sh3","c":"Щитовое","g":"Монтаж накладных","n":"Монтаж электрощитка накладного 12-24 модуля","p":330,"u":"шт"},{"id":"s_sh4","c":"Щитовое","g":"Монтаж накладных","n":"Монтаж электрощитка накладного 36-60 модулей","p":560,"u":"шт"},{"id":"s_sh5","c":"Щитовое","g":"Монтаж накладных","n":"Монтаж электрощитка накладного 72-96 модулей","p":780,"u":"шт"},{"id":"s_l1","c":"Освещение","g":"LED Лента","n":"Монтаж светодиодной ленты на кухне под шкафами","p":270,"u":"м.п."},{"id":"s_l2","c":"Освещение","g":"LED Лента","n":"Монтаж светодиодной ленты в натяжной потолок","p":390,"u":"м.п."},{"id":"s_l3","c":"Освещение","g":"LED Лента","n":"Монтаж светодиодной ленты на гипсокартон","p":300,"u":"м.п."},{"id":"s_l4","c":"Освещение","g":"LED Лента","n":"Монтаж светодиодной ленты в потолочный плинтус","p":350,"u":"м.п."},{"id":"s_l5","c":"Освещение","g":"LED Лента","n":"Монтаж светодиодной ленты в алюминиевый профиль","p":230,"u":"м.п."},{"id":"s_l6","c":"Освещение","g":"LED Лента","n":"Монтаж светодиодной ленты на карниз","p":350,"u":"м.п."},{"id":"s_l7","c":"Освещение","g":"LED Лента","n":"Установка светодиодной ленты в светильник","p":180,"u":"м.п."},{"id":"s_l8","c":"Освещение","g":"LED Лента","n":"Монтаж светодиодной ленты на улице","p":380,"u":"м.п."},{"id":"s_l9","c":"Освещение","g":"Алюм. профиль","n":"Установка накладного алюм. профиля на скотч","p":110,"u":"м.п."},{"id":"s_l10","c":"Освещение","g":"Алюм. профиль","n":"Установка накладного алюм. профиля со сверлением","p":290,"u":"м.п."},{"id":"s_l11","c":"Освещение","g":"Алюм. профиль","n":"Установка врезного алюм. профиля в готовый паз","p":120,"u":"м.п."},{"id":"s_l12","c":"Освещение","g":"Алюм. профиль","n":"Установка врезного алюм. профиля с подготовкой паза","p":390,"u":"м.п."},{"id":"s_c1","c":"Освещение","g":"Люстры и Светильники","n":"Сборка простой люстры","p":630,"u":"шт"},{"id":"s_c2","c":"Освещение","g":"Люстры и Светильники","n":"Сборка сложной люстры","p":870,"u":"шт"},{"id":"s_c3","c":"Освещение","g":"Люстры и Светильники","n":"Установка крюка под люстру","p":230,"u":"шт"},{"id":"s_c4","c":"Освещение","g":"Люстры и Светильники","n":"Установка люстры на готовый крюк","p":740,"u":"шт"},{"id":"s_c5","c":"Освещение","g":"Люстры и Светильники","n":"Установка люстры с креплением к потолку (простая)","p":1200,"u":"шт"},{"id":"s_c6","c":"Освещение","g":"Люстры и Светильники","n":"Установка люстры с креплением к потолку (сложная/ДУ)","p":2250,"u":"шт"},{"id":"s_c7","c":"Освещение","g":"Люстры и Светильники","n":"Установка тяжелой люстры с креплением на крюк","p":1950,"u":"шт"},{"id":"s_c8","c":"Освещение","g":"Люстры и Светильники","n":"Установка тяжелой люстры с креплением к потолку","p":3600,"u":"шт"},{"id":"s_c9","c":"Освещение","g":"Люстры и Светильники","n":"Установка настенного светильника, бра","p":450,"u":"шт"},{"id":"s_c10","c":"Освещение","g":"Люстры и Светильники","n":"Установка точечного светильника","p":750,"u":"шт"},{"id":"s_c11","c":"Освещение","g":"Люстры и Светильники","n":"Установка светодиодного светильника","p":680,"u":"шт"},{"id":"s_c12","c":"Освещение","g":"Люстры и Светильники","n":"Установка светильника Армстронг","p":380,"u":"шт"},{"id":"s_c13","c":"Освещение","g":"Люстры и Светильники","n":"Установка люминесцентного светильника","p":410,"u":"шт"},{"id":"s_c14","c":"Освещение","g":"Люстры и Светильники","n":"Установка трекового светильника","p":140,"u":"шт"},{"id":"s_c15","c":"Освещение","g":"Люстры и Светильники","n":"Монтаж шинопровода","p":450,"u":"м.п."},{"id":"s_c16","c":"Освещение","g":"Уличное освещение","n":"Установка уличного светильника на фасаде","p":830,"u":"шт"},{"id":"s_c17","c":"Освещение","g":"Уличное освещение","n":"Установка садово-паркового светильника","p":1350,"u":"шт"},{"id":"s_c18","c":"Освещение","g":"Люстры и Светильники","n":"Установка светильника Выход","p":480,"u":"шт"},{"id":"s_c19","c":"Освещение","g":"Уличное освещение","n":"Установка антивандального светильника","p":660,"u":"шт"},{"id":"s_dem1","c":"Демонтаж","g":"Освещение","n":"Демонтаж люстры","p":240,"u":"шт"},{"id":"s_dem2","c":"Демонтаж","g":"Освещение","n":"Демонтаж светильника","p":210,"u":"шт"},{"id":"s_dem3","c":"Демонтаж","g":"Электроточки","n":"Демонтаж розетки","p":200,"u":"шт"},{"id":"s_dem4","c":"Демонтаж","g":"Электроточки","n":"Демонтаж выключателя","p":200,"u":"шт"},{"id":"s_dem5","c":"Демонтаж","g":"Электроточки","n":"Демонтаж распаечной коробки","p":200,"u":"шт"},{"id":"s_dem6","c":"Демонтаж","g":"Электроточки","n":"Демонтаж дверного звонка","p":200,"u":"шт"},{"id":"s_dem7","c":"Демонтаж","g":"Щитовое","n":"Демонтаж реле времени","p":230,"u":"шт"},{"id":"s_dem8","c":"Демонтаж","g":"Щитовое","n":"Демонтаж электрощитка до 8 модулей","p":110,"u":"шт"},{"id":"s_dem9","c":"Демонтаж","g":"Щитовое","n":"Демонтаж электрощитка 12-36 модулей","p":260,"u":"шт"},{"id":"s_dem10","c":"Демонтаж","g":"Щитовое","n":"Демонтаж электрощитка 48-96 модулей","p":470,"u":"шт"},{"id":"s_dem11","c":"Демонтаж","g":"Щитовое","n":"Демонтаж автомата","p":150,"u":"шт"},{"id":"s_dem12","c":"Демонтаж","g":"Щитовое","n":"Демонтаж УЗО","p":150,"u":"шт"},{"id":"s_dem13","c":"Демонтаж","g":"Щитовое","n":"Демонтаж дифавтомата","p":150,"u":"шт"},{"id":"s_dem14","c":"Демонтаж","g":"Щитовое","n":"Демонтаж рубильника","p":150,"u":"шт"},{"id":"s_dem15","c":"Демонтаж","g":"Щитовое","n":"Демонтаж магнитного пускателя","p":140,"u":"шт"}];
   4444: 
   4445:   var EP_GLOBAL_MAT = TOP_MAT_DB.slice();
   4446:   var EP_GLOBAL_WORK = TOP_WORK_DB.slice();
>> 4447:   var EP_MY_MAT = [];
   4448:   var EP_MY_WORK = [];
   4449: 
   4450:   var LS_MY_MAT = 'user_db_mat_v31';
   4451:   var LS_MY_WORK = 'user_db_work_v31';
   4452:   var LS_SERVER_CACHE = 'ep_global_cache_force_v1';
   4453:   var LS_OLD_SERVER_CACHE = 'ep_global_cache_ultimate_v1';
   4454:   var LS_SCOPE = 'ep_db_scope_v2';
   4455:   var LS_CLEAN = 'ep_db_clean_mode_v1';
   4456:   var LS_MASTER_CREATED = 'ep_master_db_created_v1';
   4457: 
   4458:   var EP_MY_MAT = [];
   4459:   var EP_MY_WORK = [];
   4460:   var EP_SERVER_MAT = [];
   4461:   var EP_SERVER_WORK = [];
   4462:   var EP_SERVER_DOC_SEEN = false;
   4463: 
   4464:   function $(id){ return document.getElementById(id); }
   4465:   function toast(t){ if(typeof showToast === 'function') showToast(t); else alert(t); }
   4466:   function esc(s){ return String(s == null ? '' : s).replace(/[&<>"']/g,function(m){ return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]; }); }
   4467:   function cleanText(s){ return String(s || '').toLowerCase().replace(/ё/g,'е').replace(/×/g,'x').replace(/х/g,'x').replace(/[^a-zа-я0-9]+/g,' ').trim(); }
   4468:   function clone(x){ var y=Object.assign({}, x || {}); delete y.__src; delete y.__encoded; return y; }
   4469:   function arrLS(k){ try{ var a=JSON.parse(localStorage.getItem(k)||'[]'); return Array.isArray(a)?a:[]; }catch(e){ return []; } }
```

### around line 4458

```js
   4446:   var EP_GLOBAL_WORK = TOP_WORK_DB.slice();
   4447:   var EP_MY_MAT = [];
   4448:   var EP_MY_WORK = [];
   4449: 
   4450:   var LS_MY_MAT = 'user_db_mat_v31';
   4451:   var LS_MY_WORK = 'user_db_work_v31';
   4452:   var LS_SERVER_CACHE = 'ep_global_cache_force_v1';
   4453:   var LS_OLD_SERVER_CACHE = 'ep_global_cache_ultimate_v1';
   4454:   var LS_SCOPE = 'ep_db_scope_v2';
   4455:   var LS_CLEAN = 'ep_db_clean_mode_v1';
   4456:   var LS_MASTER_CREATED = 'ep_master_db_created_v1';
   4457: 
>> 4458:   var EP_MY_MAT = [];
   4459:   var EP_MY_WORK = [];
   4460:   var EP_SERVER_MAT = [];
   4461:   var EP_SERVER_WORK = [];
   4462:   var EP_SERVER_DOC_SEEN = false;
   4463: 
   4464:   function $(id){ return document.getElementById(id); }
   4465:   function toast(t){ if(typeof showToast === 'function') showToast(t); else alert(t); }
   4466:   function esc(s){ return String(s == null ? '' : s).replace(/[&<>"']/g,function(m){ return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]; }); }
   4467:   function cleanText(s){ return String(s || '').toLowerCase().replace(/ё/g,'е').replace(/×/g,'x').replace(/х/g,'x').replace(/[^a-zа-я0-9]+/g,' ').trim(); }
   4468:   function clone(x){ var y=Object.assign({}, x || {}); delete y.__src; delete y.__encoded; return y; }
   4469:   function arrLS(k){ try{ var a=JSON.parse(localStorage.getItem(k)||'[]'); return Array.isArray(a)?a:[]; }catch(e){ return []; } }
   4470:   function objLS(k){ try{ var o=JSON.parse(localStorage.getItem(k)||'{}'); return o && typeof o === 'object' ? o : {}; }catch(e){ return {}; } }
   4471:   function setLS(k,a){ try{ if(typeof safeSet==='function') safeSet(k, JSON.stringify(a||[])); else localStorage.setItem(k, JSON.stringify(a||[])); }catch(e){} }
   4472:   function setObjLS(k,o){ try{ localStorage.setItem(k, JSON.stringify(o||{})); }catch(e){} }
   4473:   function cleanMode(){ return localStorage.getItem(LS_CLEAN) === '1'; }
   4474:   function scope(){ return localStorage.getItem(LS_SCOPE) === 'global' ? 'global' : 'my'; }
   4475:   function activeLabel(){ return scope()==='global' ? '🌍 База сервера' : '👤 Моя база'; }
   4476:   function uid(){ try{ return appUser && appUser.uid ? appUser.uid : ''; }catch(e){ return ''; } }
   4477:   function isAdmin(){ try{ return appUser && appUser.role === 'admin'; }catch(e){ return false; } }
   4478:   function groupOf(it){ return (it && (it.g || it.sc || it.subcategory || it.group)) || ''; }
   4479:   function sig(type,it){ return type + '|' + cleanText([it && it.c, groupOf(it), it && it.n, it && it.u].filter(Boolean).join('|')); }
   4480:   function enc(it){ try{ return encodeURIComponent(JSON.stringify(clone(it))); }catch(e){ return ''; } }
```

### around line 4496

```js
   4484:     var seen={}, out=[];
   4485:     (arr||[]).forEach(function(raw){
   4486:       var it=clone(raw);
   4487:       if(!it.n) return;
   4488:       var k=sig(type,it);
   4489:       if(seen[k]) return;
   4490:       seen[k]=1;
   4491:       out.push(it);
   4492:     });
   4493:     return out;
   4494:   }
   4495: 
>> 4496:   function myArr(type){ return type==='work' ? EP_MY_WORK : EP_MY_MAT; }
   4497:   function serverArr(type){ return type==='work' ? EP_SERVER_WORK : EP_SERVER_MAT; }
   4498:   function activeArr(type){ return scope()==='global' ? serverArr(type) : myArr(type); }
   4499: 
   4500:   function syncWindowCaches(){
   4501:     try{
   4502:       window.EP_MY_MAT = EP_MY_MAT;
   4503:       window.EP_MY_WORK = EP_MY_WORK;
   4504:       window.EP_GLOBAL_MAT = EP_SERVER_MAT;
   4505:       window.EP_GLOBAL_WORK = EP_SERVER_WORK;
   4506:       window.EP_FORCE_GLOBAL = {matDB:EP_SERVER_MAT, workDB:EP_SERVER_WORK};
   4507:       window.EP_ULTIMATE_DB_CACHE = {matDB:EP_SERVER_MAT, workDB:EP_SERVER_WORK, ts:Date.now()};
   4508:       window.EP_GLOBAL_DB_VISIBLE_CACHE = {matDB:EP_SERVER_MAT, workDB:EP_SERVER_WORK, ts:Date.now()};
   4509:       window.userMatDB = EP_MY_MAT;
   4510:       window.userWorkDB = EP_MY_WORK;
   4511:       if(scope()==='global'){ matDB = EP_SERVER_MAT.slice(); workDB = EP_SERVER_WORK.slice(); }
   4512:       else { matDB = EP_MY_MAT.slice(); workDB = EP_MY_WORK.slice(); }
   4513:     }catch(e){}
   4514:   }
   4515: 
   4516:   function saveMyLocal(type, arr){
   4517:     arr = unique(arr||[], type);
   4518:     if(type==='work') EP_MY_WORK = arr; else EP_MY_MAT = arr;
```

### around line 4502

```js
   4490:       seen[k]=1;
   4491:       out.push(it);
   4492:     });
   4493:     return out;
   4494:   }
   4495: 
   4496:   function myArr(type){ return type==='work' ? EP_MY_WORK : EP_MY_MAT; }
   4497:   function serverArr(type){ return type==='work' ? EP_SERVER_WORK : EP_SERVER_MAT; }
   4498:   function activeArr(type){ return scope()==='global' ? serverArr(type) : myArr(type); }
   4499: 
   4500:   function syncWindowCaches(){
   4501:     try{
>> 4502:       window.EP_MY_MAT = EP_MY_MAT;
   4503:       window.EP_MY_WORK = EP_MY_WORK;
   4504:       window.EP_GLOBAL_MAT = EP_SERVER_MAT;
   4505:       window.EP_GLOBAL_WORK = EP_SERVER_WORK;
   4506:       window.EP_FORCE_GLOBAL = {matDB:EP_SERVER_MAT, workDB:EP_SERVER_WORK};
   4507:       window.EP_ULTIMATE_DB_CACHE = {matDB:EP_SERVER_MAT, workDB:EP_SERVER_WORK, ts:Date.now()};
   4508:       window.EP_GLOBAL_DB_VISIBLE_CACHE = {matDB:EP_SERVER_MAT, workDB:EP_SERVER_WORK, ts:Date.now()};
   4509:       window.userMatDB = EP_MY_MAT;
   4510:       window.userWorkDB = EP_MY_WORK;
   4511:       if(scope()==='global'){ matDB = EP_SERVER_MAT.slice(); workDB = EP_SERVER_WORK.slice(); }
   4512:       else { matDB = EP_MY_MAT.slice(); workDB = EP_MY_WORK.slice(); }
   4513:     }catch(e){}
   4514:   }
   4515: 
   4516:   function saveMyLocal(type, arr){
   4517:     arr = unique(arr||[], type);
   4518:     if(type==='work') EP_MY_WORK = arr; else EP_MY_MAT = arr;
   4519:     setLS(LS_MY_MAT, EP_MY_MAT);
   4520:     setLS(LS_MY_WORK, EP_MY_WORK);
   4521:     try{ localStorage.setItem(LS_MASTER_CREATED,'1'); }catch(e){}
   4522:     syncWindowCaches();
   4523:     epSaveMyDbToServer();
   4524:   }
```

### around line 4509

```js
   4497:   function serverArr(type){ return type==='work' ? EP_SERVER_WORK : EP_SERVER_MAT; }
   4498:   function activeArr(type){ return scope()==='global' ? serverArr(type) : myArr(type); }
   4499: 
   4500:   function syncWindowCaches(){
   4501:     try{
   4502:       window.EP_MY_MAT = EP_MY_MAT;
   4503:       window.EP_MY_WORK = EP_MY_WORK;
   4504:       window.EP_GLOBAL_MAT = EP_SERVER_MAT;
   4505:       window.EP_GLOBAL_WORK = EP_SERVER_WORK;
   4506:       window.EP_FORCE_GLOBAL = {matDB:EP_SERVER_MAT, workDB:EP_SERVER_WORK};
   4507:       window.EP_ULTIMATE_DB_CACHE = {matDB:EP_SERVER_MAT, workDB:EP_SERVER_WORK, ts:Date.now()};
   4508:       window.EP_GLOBAL_DB_VISIBLE_CACHE = {matDB:EP_SERVER_MAT, workDB:EP_SERVER_WORK, ts:Date.now()};
>> 4509:       window.userMatDB = EP_MY_MAT;
   4510:       window.userWorkDB = EP_MY_WORK;
   4511:       if(scope()==='global'){ matDB = EP_SERVER_MAT.slice(); workDB = EP_SERVER_WORK.slice(); }
   4512:       else { matDB = EP_MY_MAT.slice(); workDB = EP_MY_WORK.slice(); }
   4513:     }catch(e){}
   4514:   }
   4515: 
   4516:   function saveMyLocal(type, arr){
   4517:     arr = unique(arr||[], type);
   4518:     if(type==='work') EP_MY_WORK = arr; else EP_MY_MAT = arr;
   4519:     setLS(LS_MY_MAT, EP_MY_MAT);
   4520:     setLS(LS_MY_WORK, EP_MY_WORK);
   4521:     try{ localStorage.setItem(LS_MASTER_CREATED,'1'); }catch(e){}
   4522:     syncWindowCaches();
   4523:     epSaveMyDbToServer();
   4524:   }
   4525: 
   4526:   function saveServerLocal(type, arr, saveDirect){
   4527:     arr = unique(arr||[], type);
   4528:     if(type==='work') EP_SERVER_WORK = arr; else EP_SERVER_MAT = arr;
   4529:     setObjLS(LS_SERVER_CACHE, {matDB:EP_SERVER_MAT, workDB:EP_SERVER_WORK, cleanMode:cleanMode(), ts:Date.now()});
   4530:     syncWindowCaches();
   4531:     if(saveDirect) epSaveServerDbToServer();
```


## EP_MY_WORK

Найдено строк: 4448, 4459, 4496, 4503, 4510, 4512, 4518, 4520, 4556, 4596, 4623, 4625, 4639, 4783, 4785, 4921, 4925, 4939, 4947, 5123

### around line 4448

```js
   4436:  * Original script block: 11
   4437:  * Original HTML lines: 6221-6912
   4438:  */
   4439: 
   4440: /* === EP DB SAFE SPLIT + FACTORY RESET V3 2026-05-13: SERVER/MY, ZERO RESET, NO MIX === */
   4441: (function(){
   4442:   var TOP_MAT_DB = [{"id":"m1","c":"Кабель","n":"Кабель ВВГнг-LS 3х1.5 (Конкорд) круглый","p":57,"u":"м.п."},{"id":"m2","c":"Кабель","n":"Кабель ВВГнг-LS 3х2.5 (Конкорд) круглый","p":87,"u":"м.п."},{"id":"m3","c":"Кабель","n":"Кабель ВВГнг(п)-LS 3х1.5 (Конкорд) плоский","p":62,"u":"м.п."},{"id":"m4","c":"Кабель","n":"Кабель ВВГнг(п)-LS 3х2.5 (Конкорд) плоский","p":95,"u":"м.п."},{"id":"m5","c":"Кабель","n":"Кабель ВВГ-Пнг(А)-LS 3x4 (Лептон)","p":146,"u":"м.п."},{"id":"m6","c":"Кабель","n":"Кабель ВВГ-Пнг(А)-LS 3х6 (Лептон)","p":217,"u":"м.п."},{"id":"m7","c":"Кабель","n":"Провод ПуГВ (ПВ-3) 1х6 синий (ЦВЕТЛИТ)","p":85,"u":"м.п."},{"id":"m8","c":"Кабель","n":"Провод ПуГВ (ПВ-3) 1х6 белый (ЦВЕТЛИТ)","p":85,"u":"м.п."},{"id":"m9","c":"Слаботочка","n":"Кабель TV SAT-703 (Cavel)","p":75,"u":"м.п."},{"id":"m10","c":"Слаботочка","n":"Витая пара комп. экран. FTP4 CAT5E 24AWG Cu","p":32,"u":"м.п."},{"id":"m11","c":"Трубы","n":"Труба гофрированная ПВХ 20мм серая","p":8,"u":"м.п."},{"id":"m12","c":"Трубы","n":"Труба гофрированная ПНД 20мм черная","p":10,"u":"м.п."},{"id":"m13","c":"Трубы","n":"Гофра ПВХ/ПНД с протяжкой","p":25,"u":"м.п."},{"id":"m14","c":"Расходники","n":"Подрозетник глубокий для бетона 68х64","p":12,"u":"шт"},{"id":"m15","c":"Расходники","n":"Подрозетник стандарт (ГКЛ)","p":20,"u":"шт"},{"id":"m16","c":"Расходники","n":"Подрозетник глубокий (ГКЛ)","p":35,"u":"шт"},{"id":"m17","c":"Расходники","n":"Коробка распределительная 100х100х40","p":120,"u":"шт"},{"id":"m18","c":"Расходники","n":"Площадка под стяжку для прямого монтажа","p":5,"u":"шт"},{"id":"m19","c":"Расходники","n":"Стяжки нейлоновые КСС 3*100 (100шт)","p":40,"u":"упак."},{"id":"m20","c":"Расходники","n":"Стяжки нейлоновые КСС 5*400 (100шт)","p":410,"u":"упак."},{"id":"m21","c":"Расходники","n":"Газовый баллон 80 мл 165 мм","p":550,"u":"шт"},{"id":"m22","c":"Расходники","n":"Гвозди для прямого монтажа 3х19 мм (1000 шт)","p":1905,"u":"упак."},{"id":"m23","c":"Расходники","n":"Лента монтажная (перфолента)","p":580,"u":"шт"},{"id":"m24","c":"Расходники","n":"Лента монтажная текстильная 20 мм (50м)","p":880,"u":"упак."},{"id":"m25","c":"Щитовое","n":"Наконечник НШВИ 6.0-12 (упак)","p":225,"u":"упак."},{"id":"m26","c":"Щитовое","n":"Наконечник НШВИ(2) 6.0-14 (упак)","p":365,"u":"упак."},{"id":"m27","c":"Расходники","n":"Гильза ГМЛ 4","p":12,"u":"шт"},{"id":"m28","c":"Расходники","n":"Гильза ГМЛ 6","p":18,"u":"шт"},{"id":"m29","c":"Расходники","n":"Термоусадка (м)","p":80,"u":"м"},{"id":"m30","c":"Автоматика","n":"Автомат 1P 10A (ABB SH201)","p":265,"u":"шт"},{"id":"m31","c":"Автоматика","n":"Автомат 1P 16A (ABB SH201)","p":265,"u":"шт"},{"id":"m32","c":"Автоматика","n":"Автомат 1P 40A (ABB SH201)","p":410,"u":"шт"},{"id":"m33","c":"Автоматика","n":"ДИФ Автомат DSH201 C32 AC30 (ABB)","p":3100,"u":"шт"},{"id":"m34","c":"Щитовое","n":"Клеммник винтовой N 5x16 (ABB)","p":345,"u":"шт"},{"id":"m35","c":"Щитовое","n":"Клеммник винтовой PE 11x16 (ABB)","p":770,"u":"шт"},{"id":"m36","c":"Щитовое","n":"Шкаф внутрь. на 36М UK636E3 (ABB)","p":6510,"u":"шт"},{"id":"m37","c":"Щитовое","n":"Шкаф мультимедийный UK620MV (ABB)","p":11025,"u":"шт"},{"id":"m38","c":"Автоматика","n":"Автомат 1P 10A (ИЭК ВА47-29)","p":172,"u":"шт"},{"id":"m39","c":"Автоматика","n":"Автомат 1P 16A (ИЭК ВА47-29)","p":150,"u":"шт"},{"id":"m40","c":"Автоматика","n":"Автомат 2P 40A (ИЭК ВА47-29)","p":380,"u":"шт"},{"id":"m41","c":"Автоматика","n":"УЗО 2P 40A 30мА (ИЭК ВД1-63)","p":1195,"u":"шт"},{"id":"m42","c":"Щитовое","n":"Шина N ноль на DIN-изол (ИЭК)","p":285,"u":"шт"},{"id":"m43","c":"Щитовое","n":"Корпус пластиковый ЩРВ-П-24 (TEKFOR)","p":2660,"u":"шт"},{"id":"m44","c":"Автоматика","n":"Реле напряжения УЗМ-50Ц","p":4500,"u":"шт"}];
   4443:   var TOP_WORK_DB = [{"id":"w44","c":"Алмазная резка","g":"Штроба 25х30","n":"Бетон","p":550,"u":"м.п."},{"id":"w45","c":"Алмазная резка","g":"Штроба 25х30","n":"Кирпич","p":400,"u":"м.п."},{"id":"w46","c":"Алмазная резка","g":"Штроба 25х30","n":"Панелька","p":700,"u":"м.п."},{"id":"w47","c":"Алмазная резка","g":"Штроба 25х30","n":"Мягкий мат.","p":400,"u":"м.п."},{"id":"w48","c":"Алмазная резка","g":"Штроба 50х50","n":"Бетон","p":1500,"u":"м.п."},{"id":"w49","c":"Алмазная резка","g":"Штроба 50х50","n":"Кирпич","p":1300,"u":"м.п."},{"id":"w50","c":"Алмазная резка","g":"Штроба 50х50","n":"Панелька","p":1900,"u":"м.п."},{"id":"w51","c":"Алмазная резка","g":"Штроба 50х50","n":"Мягкий мат.","p":900,"u":"м.п."},{"id":"w52","c":"Алмазная резка","g":"Штроба 100х50 ВВОДНАЯ","n":"Бетон","p":2200,"u":"м.п."},{"id":"w53","c":"Алмазная резка","g":"Штроба 100х50 ВВОДНАЯ","n":"Кирпич","p":1550,"u":"м.п."},{"id":"w54","c":"Алмазная резка","g":"Штроба 100х50 ВВОДНАЯ","n":"Панелька","p":2500,"u":"м.п."},{"id":"w55","c":"Алмазная резка","g":"Штроба 100х50 ВВОДНАЯ","n":"Мягкий мат.","p":1400,"u":"м.п."},{"id":"w56","c":"Алмазная резка","g":"Высверливание подр. стандарт","n":"Бетон","p":600,"u":"шт"},{"id":"w57","c":"Алмазная резка","g":"Высверливание подр. стандарт","n":"Кирпич","p":500,"u":"шт"},{"id":"w58","c":"Алмазная резка","g":"Высверливание подр. стандарт","n":"Панелька","p":650,"u":"шт"},{"id":"w59","c":"Алмазная резка","g":"Высверливание подр. стандарт","n":"Мягкий мат.","p":400,"u":"шт"},{"id":"w60","c":"Черновая электрика","g":"Вклейка подрозетников","n":"Все типы","p":100,"u":"шт"},{"id":"w61","c":"Алмазная резка","g":"Вырубка ниши щита","n":"Бетон","p":400,"u":"мод."},{"id":"w62","c":"Алмазная резка","g":"Вырубка ниши щита","n":"Кирпич","p":300,"u":"мод."},{"id":"w63","c":"Алмазная резка","g":"Вырубка ниши щита","n":"Панелька","p":500,"u":"мод."},{"id":"w64","c":"Алмазная резка","g":"Вырубка ниши щита","n":"Мягкий мат.","p":250,"u":"мод."},{"id":"w65","c":"Монтаж","g":"Прокладка кабеля","n":"Без гофры (Потолок)","p":120,"u":"м.п."},{"id":"w66","c":"Монтаж","g":"Прокладка кабеля","n":"В гофре (Пол)","p":150,"u":"м.п."},{"id":"w67","c":"Монтаж","g":"Распаячная коробка","n":"Сборка распред. коробки / коммутация","p":800,"u":"шт"},{"id":"w68","c":"Чистовая установка","g":"Механизмы","n":"Установка розетки 220В","p":500,"u":"шт"},{"id":"w69","c":"Чистовая установка","g":"Механизмы","n":"Установка выключателя","p":550,"u":"шт"},{"id":"w70","c":"Чистовая установка","g":"Механизмы","n":"Установка терморегулятора","p":900,"u":"шт"},{"id":"w71","c":"Алмазная резка","g":"Высверливание подрозетников глубокий","n":"Бетон","p":650,"u":"шт"},{"id":"w72","c":"Алмазная резка","g":"Высверливание подрозетников глубокий","n":"Кирпич","p":550,"u":"шт"},{"id":"w73","c":"Алмазная резка","g":"Высверливание подрозетников глубокий","n":"Панелька","p":750,"u":"шт"},{"id":"w74","c":"Алмазная резка","g":"Высверливание подрозетников глубокий","n":"Мягкий мат.","p":450,"u":"шт"},{"id":"w75","c":"Алмазная резка","g":"Высверливание подрозетников копос 74х75","n":"Бетон","p":800,"u":"шт"},{"id":"w76","c":"Алмазная резка","g":"Высверливание подрозетников копос 74х75","n":"Кирпич","p":700,"u":"шт"},{"id":"w77","c":"Алмазная резка","g":"Высверливание подрозетников копос 74х75","n":"Панелька","p":850,"u":"шт"},{"id":"w78","c":"Алмазная резка","g":"Высверливание подрозетников копос 74х75","n":"Мягкий мат.","p":500,"u":"шт"},{"id":"w79","c":"Алмазная резка","g":"Отверстие 132 ММ L= до 450","n":"Бетон","p":6000,"u":"шт"},{"id":"w80","c":"Алмазная резка","g":"Отверстие 132 ММ L= до 450","n":"Кирпич","p":4500,"u":"шт"},{"id":"w81","c":"Алмазная резка","g":"Отверстие 132 ММ L= до 450","n":"Панелька","p":7000,"u":"шт"},{"id":"w82","c":"Алмазная резка","g":"Отверстие 132 ММ L= до 450","n":"Мягкий мат.","p":4000,"u":"шт"},{"id":"w83","c":"Алмазная резка","g":"Отверстие 52мм L=до 450мм","n":"Бетон","p":2500,"u":"шт"},{"id":"w84","c":"Алмазная резка","g":"Отверстие 52мм L=до 450мм","n":"Кирпич","p":2000,"u":"шт"},{"id":"w85","c":"Алмазная резка","g":"Отверстие 52мм L=до 450мм","n":"Панелька","p":3000,"u":"шт"},{"id":"w86","c":"Алмазная резка","g":"Отверстие 52мм L=до 450мм","n":"Мягкий мат.","p":1900,"u":"шт"},{"id":"w87","c":"Щитовое","g":"Монтаж","n":"Сборка щита","p":500,"u":"мод."},{"id":"w89","c":"Щитовое","g":"Монтаж","n":"Установка БП в щит","p":900,"u":"ед"},{"id":"w91","c":"Монтаж","g":"Спецоборудование","n":"Подключение нагревателя","p":4000,"u":"ед"},{"id":"w92","c":"Монтаж","g":"Спецоборудование","n":"Система КУП","p":5000,"u":"ед"},{"id":"s_r1","c":"Щитовое","g":"Автоматика и Реле","n":"Установка реле времени","p":1250,"u":"шт"},{"id":"s_r2","c":"Щитовое","g":"Автоматика и Реле","n":"Установка реле освещения (в щите)","p":1250,"u":"шт"},{"id":"s_r3","c":"Щитовое","g":"Автоматика и Реле","n":"Установка реле температуры/жидкости","p":1700,"u":"шт"},{"id":"s_r4","c":"Щитовое","g":"Автоматика и Реле","n":"Установка реле контроля фаз","p":1450,"u":"шт"},{"id":"s_r5","c":"Щитовое","g":"Автоматика и Реле","n":"Установка реле напряжения","p":1150,"u":"шт"},{"id":"s_r6","c":"Щитовое","g":"Автоматика и Реле","n":"Установка реле управления нагрузкой","p":2050,"u":"шт"},{"id":"s_m1","c":"Щитовое","g":"Счетчики","n":"Установка электросчетчика 220-240В на DIN","p":1000,"u":"шт"},{"id":"s_m2","c":"Щитовое","g":"Счетчики","n":"Установка электросчетчика 220-240В на монтажную панель","p":1250,"u":"шт"},{"id":"s_m3","c":"Щитовое","g":"Счетчики","n":"Установка электросчетчика 380-400В на DIN","p":1700,"u":"шт"},{"id":"s_m4","c":"Щитовое","g":"Счетчики","n":"Установка электросчетчика 380-400В на монтажную панель","p":2200,"u":"шт"},{"id":"s_m5","c":"Щитовое","g":"Счетчики","n":"Установка электросчетчика под трансформаторы тока","p":2400,"u":"шт"},{"id":"s_m6","c":"Щитовое","g":"Счетчики","n":"Установка трансформатора тока (без подкл)","p":720,"u":"шт"},{"id":"s_p1","c":"Чистовая установка","g":"Розетки накладные","n":"Установка накладной розетки/выкл на бетон","p":680,"u":"шт"},{"id":"s_p2","c":"Чистовая установка","g":"Розетки накладные","n":"Установка накладной розетки/выкл на кирпич","p":600,"u":"шт"},{"id":"s_p3","c":"Чистовая установка","g":"Розетки накладные","n":"Установка накладной розетки/выкл на ГКЛ","p":530,"u":"шт"},{"id":"s_p4","c":"Чистовая установка","g":"Розетки накладные","n":"Установка накладной розетки/выкл на дерево","p":450,"u":"шт"},{"id":"s_p5","c":"Чистовая установка","g":"Механизмы (Спец)","n":"Установка накладной силовой розетки 380В","p":1000,"u":"шт"},{"id":"s_p6","c":"Чистовая установка","g":"Механизмы (Спец)","n":"Установка встраиваемой силовой розетки 380В","p":530,"u":"шт"},{"id":"s_p7","c":"Чистовая установка","g":"Механизмы","n":"Установка встраиваемой розетки/выкл в подрозетник","p":300,"u":"шт"},{"id":"s_p8","c":"Чистовая установка","g":"Механизмы","n":"Установка блока розеток/выкл","p":1200,"u":"шт"},{"id":"s_d1","c":"Черновая электрика","g":"Электроточки","n":"Установка накладного подрозетника","p":300,"u":"шт"},{"id":"s_d2","c":"Черновая электрика","g":"Электроточки","n":"Установка подрозетника","p":180,"u":"шт"},{"id":"s_d3","c":"Черновая электрика","g":"Электроточки","n":"Установка накладной распаечной коробки","p":450,"u":"шт"},{"id":"s_d4","c":"Черновая электрика","g":"Электроточки","n":"Установка встраиваемой распаечной коробки","p":300,"u":"шт"},{"id":"s_d5","c":"Чистовая установка","g":"Механизмы (Спец)","n":"Установка термостата","p":380,"u":"шт"},{"id":"s_d6","c":"Чистовая установка","g":"Механизмы (Спец)","n":"Установка встраиваемого датчика движения","p":330,"u":"шт"},{"id":"s_d7","c":"Чистовая установка","g":"Механизмы (Спец)","n":"Установка звонка","p":680,"u":"шт"},{"id":"s_d8","c":"Чистовая установка","g":"Механизмы (Спец)","n":"Установка кнопки звонка","p":450,"u":"шт"},{"id":"s_d9","c":"Чистовая установка","g":"Механизмы (Спец)","n":"Установка ТВ краба","p":480,"u":"шт"},{"id":"s_sh1","c":"Щитовое","g":"Монтаж накладных","n":"Монтаж электрощитка накладного 2 модуля","p":180,"u":"шт"},{"id":"s_sh2","c":"Щитовое","g":"Монтаж накладных","n":"Монтаж электрощитка накладного 4-8 модулей","p":290,"u":"шт"},{"id":"s_sh3","c":"Щитовое","g":"Монтаж накладных","n":"Монтаж электрощитка накладного 12-24 модуля","p":330,"u":"шт"},{"id":"s_sh4","c":"Щитовое","g":"Монтаж накладных","n":"Монтаж электрощитка накладного 36-60 модулей","p":560,"u":"шт"},{"id":"s_sh5","c":"Щитовое","g":"Монтаж накладных","n":"Монтаж электрощитка накладного 72-96 модулей","p":780,"u":"шт"},{"id":"s_l1","c":"Освещение","g":"LED Лента","n":"Монтаж светодиодной ленты на кухне под шкафами","p":270,"u":"м.п."},{"id":"s_l2","c":"Освещение","g":"LED Лента","n":"Монтаж светодиодной ленты в натяжной потолок","p":390,"u":"м.п."},{"id":"s_l3","c":"Освещение","g":"LED Лента","n":"Монтаж светодиодной ленты на гипсокартон","p":300,"u":"м.п."},{"id":"s_l4","c":"Освещение","g":"LED Лента","n":"Монтаж светодиодной ленты в потолочный плинтус","p":350,"u":"м.п."},{"id":"s_l5","c":"Освещение","g":"LED Лента","n":"Монтаж светодиодной ленты в алюминиевый профиль","p":230,"u":"м.п."},{"id":"s_l6","c":"Освещение","g":"LED Лента","n":"Монтаж светодиодной ленты на карниз","p":350,"u":"м.п."},{"id":"s_l7","c":"Освещение","g":"LED Лента","n":"Установка светодиодной ленты в светильник","p":180,"u":"м.п."},{"id":"s_l8","c":"Освещение","g":"LED Лента","n":"Монтаж светодиодной ленты на улице","p":380,"u":"м.п."},{"id":"s_l9","c":"Освещение","g":"Алюм. профиль","n":"Установка накладного алюм. профиля на скотч","p":110,"u":"м.п."},{"id":"s_l10","c":"Освещение","g":"Алюм. профиль","n":"Установка накладного алюм. профиля со сверлением","p":290,"u":"м.п."},{"id":"s_l11","c":"Освещение","g":"Алюм. профиль","n":"Установка врезного алюм. профиля в готовый паз","p":120,"u":"м.п."},{"id":"s_l12","c":"Освещение","g":"Алюм. профиль","n":"Установка врезного алюм. профиля с подготовкой паза","p":390,"u":"м.п."},{"id":"s_c1","c":"Освещение","g":"Люстры и Светильники","n":"Сборка простой люстры","p":630,"u":"шт"},{"id":"s_c2","c":"Освещение","g":"Люстры и Светильники","n":"Сборка сложной люстры","p":870,"u":"шт"},{"id":"s_c3","c":"Освещение","g":"Люстры и Светильники","n":"Установка крюка под люстру","p":230,"u":"шт"},{"id":"s_c4","c":"Освещение","g":"Люстры и Светильники","n":"Установка люстры на готовый крюк","p":740,"u":"шт"},{"id":"s_c5","c":"Освещение","g":"Люстры и Светильники","n":"Установка люстры с креплением к потолку (простая)","p":1200,"u":"шт"},{"id":"s_c6","c":"Освещение","g":"Люстры и Светильники","n":"Установка люстры с креплением к потолку (сложная/ДУ)","p":2250,"u":"шт"},{"id":"s_c7","c":"Освещение","g":"Люстры и Светильники","n":"Установка тяжелой люстры с креплением на крюк","p":1950,"u":"шт"},{"id":"s_c8","c":"Освещение","g":"Люстры и Светильники","n":"Установка тяжелой люстры с креплением к потолку","p":3600,"u":"шт"},{"id":"s_c9","c":"Освещение","g":"Люстры и Светильники","n":"Установка настенного светильника, бра","p":450,"u":"шт"},{"id":"s_c10","c":"Освещение","g":"Люстры и Светильники","n":"Установка точечного светильника","p":750,"u":"шт"},{"id":"s_c11","c":"Освещение","g":"Люстры и Светильники","n":"Установка светодиодного светильника","p":680,"u":"шт"},{"id":"s_c12","c":"Освещение","g":"Люстры и Светильники","n":"Установка светильника Армстронг","p":380,"u":"шт"},{"id":"s_c13","c":"Освещение","g":"Люстры и Светильники","n":"Установка люминесцентного светильника","p":410,"u":"шт"},{"id":"s_c14","c":"Освещение","g":"Люстры и Светильники","n":"Установка трекового светильника","p":140,"u":"шт"},{"id":"s_c15","c":"Освещение","g":"Люстры и Светильники","n":"Монтаж шинопровода","p":450,"u":"м.п."},{"id":"s_c16","c":"Освещение","g":"Уличное освещение","n":"Установка уличного светильника на фасаде","p":830,"u":"шт"},{"id":"s_c17","c":"Освещение","g":"Уличное освещение","n":"Установка садово-паркового светильника","p":1350,"u":"шт"},{"id":"s_c18","c":"Освещение","g":"Люстры и Светильники","n":"Установка светильника Выход","p":480,"u":"шт"},{"id":"s_c19","c":"Освещение","g":"Уличное освещение","n":"Установка антивандального светильника","p":660,"u":"шт"},{"id":"s_dem1","c":"Демонтаж","g":"Освещение","n":"Демонтаж люстры","p":240,"u":"шт"},{"id":"s_dem2","c":"Демонтаж","g":"Освещение","n":"Демонтаж светильника","p":210,"u":"шт"},{"id":"s_dem3","c":"Демонтаж","g":"Электроточки","n":"Демонтаж розетки","p":200,"u":"шт"},{"id":"s_dem4","c":"Демонтаж","g":"Электроточки","n":"Демонтаж выключателя","p":200,"u":"шт"},{"id":"s_dem5","c":"Демонтаж","g":"Электроточки","n":"Демонтаж распаечной коробки","p":200,"u":"шт"},{"id":"s_dem6","c":"Демонтаж","g":"Электроточки","n":"Демонтаж дверного звонка","p":200,"u":"шт"},{"id":"s_dem7","c":"Демонтаж","g":"Щитовое","n":"Демонтаж реле времени","p":230,"u":"шт"},{"id":"s_dem8","c":"Демонтаж","g":"Щитовое","n":"Демонтаж электрощитка до 8 модулей","p":110,"u":"шт"},{"id":"s_dem9","c":"Демонтаж","g":"Щитовое","n":"Демонтаж электрощитка 12-36 модулей","p":260,"u":"шт"},{"id":"s_dem10","c":"Демонтаж","g":"Щитовое","n":"Демонтаж электрощитка 48-96 модулей","p":470,"u":"шт"},{"id":"s_dem11","c":"Демонтаж","g":"Щитовое","n":"Демонтаж автомата","p":150,"u":"шт"},{"id":"s_dem12","c":"Демонтаж","g":"Щитовое","n":"Демонтаж УЗО","p":150,"u":"шт"},{"id":"s_dem13","c":"Демонтаж","g":"Щитовое","n":"Демонтаж дифавтомата","p":150,"u":"шт"},{"id":"s_dem14","c":"Демонтаж","g":"Щитовое","n":"Демонтаж рубильника","p":150,"u":"шт"},{"id":"s_dem15","c":"Демонтаж","g":"Щитовое","n":"Демонтаж магнитного пускателя","p":140,"u":"шт"}];
   4444: 
   4445:   var EP_GLOBAL_MAT = TOP_MAT_DB.slice();
   4446:   var EP_GLOBAL_WORK = TOP_WORK_DB.slice();
   4447:   var EP_MY_MAT = [];
>> 4448:   var EP_MY_WORK = [];
   4449: 
   4450:   var LS_MY_MAT = 'user_db_mat_v31';
   4451:   var LS_MY_WORK = 'user_db_work_v31';
   4452:   var LS_SERVER_CACHE = 'ep_global_cache_force_v1';
   4453:   var LS_OLD_SERVER_CACHE = 'ep_global_cache_ultimate_v1';
   4454:   var LS_SCOPE = 'ep_db_scope_v2';
   4455:   var LS_CLEAN = 'ep_db_clean_mode_v1';
   4456:   var LS_MASTER_CREATED = 'ep_master_db_created_v1';
   4457: 
   4458:   var EP_MY_MAT = [];
   4459:   var EP_MY_WORK = [];
   4460:   var EP_SERVER_MAT = [];
   4461:   var EP_SERVER_WORK = [];
   4462:   var EP_SERVER_DOC_SEEN = false;
   4463: 
   4464:   function $(id){ return document.getElementById(id); }
   4465:   function toast(t){ if(typeof showToast === 'function') showToast(t); else alert(t); }
   4466:   function esc(s){ return String(s == null ? '' : s).replace(/[&<>"']/g,function(m){ return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]; }); }
   4467:   function cleanText(s){ return String(s || '').toLowerCase().replace(/ё/g,'е').replace(/×/g,'x').replace(/х/g,'x').replace(/[^a-zа-я0-9]+/g,' ').trim(); }
   4468:   function clone(x){ var y=Object.assign({}, x || {}); delete y.__src; delete y.__encoded; return y; }
   4469:   function arrLS(k){ try{ var a=JSON.parse(localStorage.getItem(k)||'[]'); return Array.isArray(a)?a:[]; }catch(e){ return []; } }
   4470:   function objLS(k){ try{ var o=JSON.parse(localStorage.getItem(k)||'{}'); return o && typeof o === 'object' ? o : {}; }catch(e){ return {}; } }
```

### around line 4459

```js
   4447:   var EP_MY_MAT = [];
   4448:   var EP_MY_WORK = [];
   4449: 
   4450:   var LS_MY_MAT = 'user_db_mat_v31';
   4451:   var LS_MY_WORK = 'user_db_work_v31';
   4452:   var LS_SERVER_CACHE = 'ep_global_cache_force_v1';
   4453:   var LS_OLD_SERVER_CACHE = 'ep_global_cache_ultimate_v1';
   4454:   var LS_SCOPE = 'ep_db_scope_v2';
   4455:   var LS_CLEAN = 'ep_db_clean_mode_v1';
   4456:   var LS_MASTER_CREATED = 'ep_master_db_created_v1';
   4457: 
   4458:   var EP_MY_MAT = [];
>> 4459:   var EP_MY_WORK = [];
   4460:   var EP_SERVER_MAT = [];
   4461:   var EP_SERVER_WORK = [];
   4462:   var EP_SERVER_DOC_SEEN = false;
   4463: 
   4464:   function $(id){ return document.getElementById(id); }
   4465:   function toast(t){ if(typeof showToast === 'function') showToast(t); else alert(t); }
   4466:   function esc(s){ return String(s == null ? '' : s).replace(/[&<>"']/g,function(m){ return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]; }); }
   4467:   function cleanText(s){ return String(s || '').toLowerCase().replace(/ё/g,'е').replace(/×/g,'x').replace(/х/g,'x').replace(/[^a-zа-я0-9]+/g,' ').trim(); }
   4468:   function clone(x){ var y=Object.assign({}, x || {}); delete y.__src; delete y.__encoded; return y; }
   4469:   function arrLS(k){ try{ var a=JSON.parse(localStorage.getItem(k)||'[]'); return Array.isArray(a)?a:[]; }catch(e){ return []; } }
   4470:   function objLS(k){ try{ var o=JSON.parse(localStorage.getItem(k)||'{}'); return o && typeof o === 'object' ? o : {}; }catch(e){ return {}; } }
   4471:   function setLS(k,a){ try{ if(typeof safeSet==='function') safeSet(k, JSON.stringify(a||[])); else localStorage.setItem(k, JSON.stringify(a||[])); }catch(e){} }
   4472:   function setObjLS(k,o){ try{ localStorage.setItem(k, JSON.stringify(o||{})); }catch(e){} }
   4473:   function cleanMode(){ return localStorage.getItem(LS_CLEAN) === '1'; }
   4474:   function scope(){ return localStorage.getItem(LS_SCOPE) === 'global' ? 'global' : 'my'; }
   4475:   function activeLabel(){ return scope()==='global' ? '🌍 База сервера' : '👤 Моя база'; }
   4476:   function uid(){ try{ return appUser && appUser.uid ? appUser.uid : ''; }catch(e){ return ''; } }
   4477:   function isAdmin(){ try{ return appUser && appUser.role === 'admin'; }catch(e){ return false; } }
   4478:   function groupOf(it){ return (it && (it.g || it.sc || it.subcategory || it.group)) || ''; }
   4479:   function sig(type,it){ return type + '|' + cleanText([it && it.c, groupOf(it), it && it.n, it && it.u].filter(Boolean).join('|')); }
   4480:   function enc(it){ try{ return encodeURIComponent(JSON.stringify(clone(it))); }catch(e){ return ''; } }
   4481:   function dec(v){ try{ return JSON.parse(decodeURIComponent(v || '{}')); }catch(e){ return null; } }
```

### around line 4496

```js
   4484:     var seen={}, out=[];
   4485:     (arr||[]).forEach(function(raw){
   4486:       var it=clone(raw);
   4487:       if(!it.n) return;
   4488:       var k=sig(type,it);
   4489:       if(seen[k]) return;
   4490:       seen[k]=1;
   4491:       out.push(it);
   4492:     });
   4493:     return out;
   4494:   }
   4495: 
>> 4496:   function myArr(type){ return type==='work' ? EP_MY_WORK : EP_MY_MAT; }
   4497:   function serverArr(type){ return type==='work' ? EP_SERVER_WORK : EP_SERVER_MAT; }
   4498:   function activeArr(type){ return scope()==='global' ? serverArr(type) : myArr(type); }
   4499: 
   4500:   function syncWindowCaches(){
   4501:     try{
   4502:       window.EP_MY_MAT = EP_MY_MAT;
   4503:       window.EP_MY_WORK = EP_MY_WORK;
   4504:       window.EP_GLOBAL_MAT = EP_SERVER_MAT;
   4505:       window.EP_GLOBAL_WORK = EP_SERVER_WORK;
   4506:       window.EP_FORCE_GLOBAL = {matDB:EP_SERVER_MAT, workDB:EP_SERVER_WORK};
   4507:       window.EP_ULTIMATE_DB_CACHE = {matDB:EP_SERVER_MAT, workDB:EP_SERVER_WORK, ts:Date.now()};
   4508:       window.EP_GLOBAL_DB_VISIBLE_CACHE = {matDB:EP_SERVER_MAT, workDB:EP_SERVER_WORK, ts:Date.now()};
   4509:       window.userMatDB = EP_MY_MAT;
   4510:       window.userWorkDB = EP_MY_WORK;
   4511:       if(scope()==='global'){ matDB = EP_SERVER_MAT.slice(); workDB = EP_SERVER_WORK.slice(); }
   4512:       else { matDB = EP_MY_MAT.slice(); workDB = EP_MY_WORK.slice(); }
   4513:     }catch(e){}
   4514:   }
   4515: 
   4516:   function saveMyLocal(type, arr){
   4517:     arr = unique(arr||[], type);
   4518:     if(type==='work') EP_MY_WORK = arr; else EP_MY_MAT = arr;
```

### around line 4503

```js
   4491:       out.push(it);
   4492:     });
   4493:     return out;
   4494:   }
   4495: 
   4496:   function myArr(type){ return type==='work' ? EP_MY_WORK : EP_MY_MAT; }
   4497:   function serverArr(type){ return type==='work' ? EP_SERVER_WORK : EP_SERVER_MAT; }
   4498:   function activeArr(type){ return scope()==='global' ? serverArr(type) : myArr(type); }
   4499: 
   4500:   function syncWindowCaches(){
   4501:     try{
   4502:       window.EP_MY_MAT = EP_MY_MAT;
>> 4503:       window.EP_MY_WORK = EP_MY_WORK;
   4504:       window.EP_GLOBAL_MAT = EP_SERVER_MAT;
   4505:       window.EP_GLOBAL_WORK = EP_SERVER_WORK;
   4506:       window.EP_FORCE_GLOBAL = {matDB:EP_SERVER_MAT, workDB:EP_SERVER_WORK};
   4507:       window.EP_ULTIMATE_DB_CACHE = {matDB:EP_SERVER_MAT, workDB:EP_SERVER_WORK, ts:Date.now()};
   4508:       window.EP_GLOBAL_DB_VISIBLE_CACHE = {matDB:EP_SERVER_MAT, workDB:EP_SERVER_WORK, ts:Date.now()};
   4509:       window.userMatDB = EP_MY_MAT;
   4510:       window.userWorkDB = EP_MY_WORK;
   4511:       if(scope()==='global'){ matDB = EP_SERVER_MAT.slice(); workDB = EP_SERVER_WORK.slice(); }
   4512:       else { matDB = EP_MY_MAT.slice(); workDB = EP_MY_WORK.slice(); }
   4513:     }catch(e){}
   4514:   }
   4515: 
   4516:   function saveMyLocal(type, arr){
   4517:     arr = unique(arr||[], type);
   4518:     if(type==='work') EP_MY_WORK = arr; else EP_MY_MAT = arr;
   4519:     setLS(LS_MY_MAT, EP_MY_MAT);
   4520:     setLS(LS_MY_WORK, EP_MY_WORK);
   4521:     try{ localStorage.setItem(LS_MASTER_CREATED,'1'); }catch(e){}
   4522:     syncWindowCaches();
   4523:     epSaveMyDbToServer();
   4524:   }
   4525: 
```

### around line 4510

```js
   4498:   function activeArr(type){ return scope()==='global' ? serverArr(type) : myArr(type); }
   4499: 
   4500:   function syncWindowCaches(){
   4501:     try{
   4502:       window.EP_MY_MAT = EP_MY_MAT;
   4503:       window.EP_MY_WORK = EP_MY_WORK;
   4504:       window.EP_GLOBAL_MAT = EP_SERVER_MAT;
   4505:       window.EP_GLOBAL_WORK = EP_SERVER_WORK;
   4506:       window.EP_FORCE_GLOBAL = {matDB:EP_SERVER_MAT, workDB:EP_SERVER_WORK};
   4507:       window.EP_ULTIMATE_DB_CACHE = {matDB:EP_SERVER_MAT, workDB:EP_SERVER_WORK, ts:Date.now()};
   4508:       window.EP_GLOBAL_DB_VISIBLE_CACHE = {matDB:EP_SERVER_MAT, workDB:EP_SERVER_WORK, ts:Date.now()};
   4509:       window.userMatDB = EP_MY_MAT;
>> 4510:       window.userWorkDB = EP_MY_WORK;
   4511:       if(scope()==='global'){ matDB = EP_SERVER_MAT.slice(); workDB = EP_SERVER_WORK.slice(); }
   4512:       else { matDB = EP_MY_MAT.slice(); workDB = EP_MY_WORK.slice(); }
   4513:     }catch(e){}
   4514:   }
   4515: 
   4516:   function saveMyLocal(type, arr){
   4517:     arr = unique(arr||[], type);
   4518:     if(type==='work') EP_MY_WORK = arr; else EP_MY_MAT = arr;
   4519:     setLS(LS_MY_MAT, EP_MY_MAT);
   4520:     setLS(LS_MY_WORK, EP_MY_WORK);
   4521:     try{ localStorage.setItem(LS_MASTER_CREATED,'1'); }catch(e){}
   4522:     syncWindowCaches();
   4523:     epSaveMyDbToServer();
   4524:   }
   4525: 
   4526:   function saveServerLocal(type, arr, saveDirect){
   4527:     arr = unique(arr||[], type);
   4528:     if(type==='work') EP_SERVER_WORK = arr; else EP_SERVER_MAT = arr;
   4529:     setObjLS(LS_SERVER_CACHE, {matDB:EP_SERVER_MAT, workDB:EP_SERVER_WORK, cleanMode:cleanMode(), ts:Date.now()});
   4530:     syncWindowCaches();
   4531:     if(saveDirect) epSaveServerDbToServer();
   4532:   }
```


## userMatDB

Найдено строк: 2330, 2402, 4509, 5186, 5421, 5642, 6097, 6375, 6682, 7556, 8211, 8423, 8434, 8801

### around line 2330

```js
   2318:     function fixArr(arr){
   2319:       if (!Array.isArray(arr)) return [];
   2320:       arr.forEach(function(it){
   2321:         if(!it || typeof it !== 'object') return;
   2322:         if(!it.id) it.id = 'm_' + Math.abs(norm([it.c,it.g,it.n,it.p].join('_')).split('').reduce(function(h,ch){return ((h<<5)-h+ch.charCodeAt(0))|0;},0));
   2323:         var grp = epMatGroupName(it);
   2324:         // Меняем только автоматику/щитовое, остальное не трогаем.
   2325:         if (grp.c === 'Автоматика' || grp.c === 'Щитовое') { it.c = grp.c; it.g = grp.g; it.sc = grp.g; }
   2326:       });
   2327:       return arr;
   2328:     }
   2329:     try { window.matDB = fixArr(window.matDB || []); } catch(e){}
>> 2330:     try { window.userMatDB = fixArr(window.userMatDB || []); } catch(e){}
   2331:   }
   2332: 
   2333:   function epGroupedData(arr, type){
   2334:     var data = {};
   2335:     (arr || []).forEach(function(it){
   2336:       if(!it) return;
   2337:       if(!it.id) it.id = (type === 'work' ? 'w_' : 'm_') + Math.abs(norm([it.c,it.g,it.n,it.p].join('_')).split('').reduce(function(h,ch){return ((h<<5)-h+ch.charCodeAt(0))|0;},0));
   2338:       var c = it.c || 'Разное';
   2339:       var g = type === 'mat' ? (it.g || it.sc || 'Разное') : (it.g || it.sc || 'Разное');
   2340:       if(!data[c]) data[c] = {};
   2341:       if(!data[c][g]) data[c][g] = [];
   2342:       data[c][g].push(it);
   2343:     });
   2344:     return data;
   2345:   }
   2346: 
   2347:   function epRenderGrouped(arr, type, mode, prefix){
   2348:     var data = epGroupedData(arr, type);
   2349:     var html = '', i = 0;
   2350:     Object.keys(data).sort(function(a,b){return a.localeCompare(b,'ru');}).forEach(function(c){
   2351:       var cid = prefix + '_c_' + (i++);
   2352:       var catStyle = type === 'work' ? 'style="color:var(--orange); border-color:rgba(245,158,11,0.2); background:rgba(245,158,11,0.08);"' : '';
```

### around line 2402

```js
   2390:     window.openWorkCatalog = function(){ var el=qs('work-cat-list'); if(el) el.innerHTML = epRenderGrouped(window.workDB || [], 'work', 'catalog', 'work_shield'); if(typeof openModal==='function') openModal('workModal'); else if(oldWork) oldWork(); };
   2391:     window.renderDbEditors = function(){
   2392:       epNormalizeMaterialsDb();
   2393:       var catsEl = qs('db-cats');
   2394:       if (catsEl) catsEl.innerHTML = uniq([].concat((window.matDB||[]).map(function(x){return x.c;}),(window.workDB||[]).map(function(x){return x.c;}))).map(function(c){return '<option value="'+safeText(c)+'">';}).join('');
   2395:       var em=qs('editor-mat-list'); if(em) em.innerHTML = epRenderGrouped(window.matDB || [], 'mat', 'editor', 'db_mat_shield');
   2396:       var ew=qs('editor-work-list'); if(ew) ew.innerHTML = epRenderGrouped(window.workDB || [], 'work', 'editor', 'db_work_shield');
   2397:     };
   2398:   }
   2399: 
   2400:   function epAllDbItems(type){
   2401:     var a = type === 'work' ? (window.workDB || []) : (window.matDB || []);
>> 2402:     var b = type === 'work' ? (window.userWorkDB || []) : (window.userMatDB || []);
   2403:     return [].concat(a || [], b || []).filter(Boolean);
   2404:   }
   2405:   function epFindItem(type, words){
   2406:     var ws = (words || []).map(norm).filter(Boolean);
   2407:     var best = null, bestScore = -1;
   2408:     epAllDbItems(type).forEach(function(it){
   2409:       var blob = norm([it.c,it.g,it.sc,it.n,it.brand,it.kind,it.nominal,it.curve,it.wallType,it.modules,it.mountType].join(' '));
   2410:       var score = 0;
   2411:       ws.forEach(function(w){ if(w && blob.includes(w)) score++; });
   2412:       if(score > bestScore){ bestScore = score; best = it; }
   2413:     });
   2414:     return bestScore >= Math.max(1, Math.ceil(ws.length * 0.55)) ? best : null;
   2415:   }
   2416:   function epMat(label, q, fallbackPrice, words, meta){
   2417:     epNormalizeMaterialsDb();
   2418:     var found = epFindItem('mat', words || [label]);
   2419:     if(found) return { n: found.n, q: q, p: Number(found.p) || 0, u: found.u || 'шт', type: 'mat', sourceId: found.id || null };
   2420:     meta = meta || {};
   2421:     var path = meta.category ? ' [' + meta.category + (meta.subcategory ? ' → ' + meta.subcategory : '') + ']' : '';
   2422:     return { n: '⚠️ ' + label + path + ' — добавить в БД', q: q, p: Number(fallbackPrice) || 0, u: meta.unit || 'шт', type: 'mat', needDb: true, dbMeta: meta };
   2423:   }
   2424:   function epWork(label, q, price, words, meta){
```

### around line 4509

```js
   4497:   function serverArr(type){ return type==='work' ? EP_SERVER_WORK : EP_SERVER_MAT; }
   4498:   function activeArr(type){ return scope()==='global' ? serverArr(type) : myArr(type); }
   4499: 
   4500:   function syncWindowCaches(){
   4501:     try{
   4502:       window.EP_MY_MAT = EP_MY_MAT;
   4503:       window.EP_MY_WORK = EP_MY_WORK;
   4504:       window.EP_GLOBAL_MAT = EP_SERVER_MAT;
   4505:       window.EP_GLOBAL_WORK = EP_SERVER_WORK;
   4506:       window.EP_FORCE_GLOBAL = {matDB:EP_SERVER_MAT, workDB:EP_SERVER_WORK};
   4507:       window.EP_ULTIMATE_DB_CACHE = {matDB:EP_SERVER_MAT, workDB:EP_SERVER_WORK, ts:Date.now()};
   4508:       window.EP_GLOBAL_DB_VISIBLE_CACHE = {matDB:EP_SERVER_MAT, workDB:EP_SERVER_WORK, ts:Date.now()};
>> 4509:       window.userMatDB = EP_MY_MAT;
   4510:       window.userWorkDB = EP_MY_WORK;
   4511:       if(scope()==='global'){ matDB = EP_SERVER_MAT.slice(); workDB = EP_SERVER_WORK.slice(); }
   4512:       else { matDB = EP_MY_MAT.slice(); workDB = EP_MY_WORK.slice(); }
   4513:     }catch(e){}
   4514:   }
   4515: 
   4516:   function saveMyLocal(type, arr){
   4517:     arr = unique(arr||[], type);
   4518:     if(type==='work') EP_MY_WORK = arr; else EP_MY_MAT = arr;
   4519:     setLS(LS_MY_MAT, EP_MY_MAT);
   4520:     setLS(LS_MY_WORK, EP_MY_WORK);
   4521:     try{ localStorage.setItem(LS_MASTER_CREATED,'1'); }catch(e){}
   4522:     syncWindowCaches();
   4523:     epSaveMyDbToServer();
   4524:   }
   4525: 
   4526:   function saveServerLocal(type, arr, saveDirect){
   4527:     arr = unique(arr||[], type);
   4528:     if(type==='work') EP_SERVER_WORK = arr; else EP_SERVER_MAT = arr;
   4529:     setObjLS(LS_SERVER_CACHE, {matDB:EP_SERVER_MAT, workDB:EP_SERVER_WORK, cleanMode:cleanMode(), ts:Date.now()});
   4530:     syncWindowCaches();
   4531:     if(saveDirect) epSaveServerDbToServer();
```

### around line 5186

```js
   5174:   function getServer(type){
   5175:     var fromWin = type === 'work' ? window.EP_GLOBAL_WORK : window.EP_GLOBAL_MAT;
   5176:     if(Array.isArray(fromWin)) return fromWin.slice();
   5177:     var c = readObj(LS_SERVER_CACHE);
   5178:     var a = type === 'work' ? c.workDB : c.matDB;
   5179:     return Array.isArray(a) ? a : [];
   5180:   }
   5181:   function setMy(type,arr){
   5182:     arr = unique(arr, type);
   5183:     if(type === 'work') window.EP_MY_WORK = arr; else window.EP_MY_MAT = arr;
   5184:     writeArr(LS_MY_MAT, type === 'mat' ? arr : getMy('mat'));
   5185:     writeArr(LS_MY_WORK, type === 'work' ? arr : getMy('work'));
>> 5186:     try{ window.userMatDB = getMy('mat'); window.userWorkDB = getMy('work'); }catch(e){}
   5187:     syncMainArrays('my');
   5188:   }
   5189:   function setServer(type,arr){
   5190:     arr = unique(arr, type);
   5191:     if(type === 'work') window.EP_GLOBAL_WORK = arr; else window.EP_GLOBAL_MAT = arr;
   5192:     var mat = type === 'mat' ? arr : getServer('mat');
   5193:     var work = type === 'work' ? arr : getServer('work');
   5194:     try{
   5195:       window.EP_FORCE_GLOBAL = {matDB:mat, workDB:work};
   5196:       window.EP_ULTIMATE_DB_CACHE = {matDB:mat, workDB:work, ts:Date.now()};
   5197:       window.EP_GLOBAL_DB_VISIBLE_CACHE = {matDB:mat, workDB:work, ts:Date.now()};
   5198:     }catch(e){}
   5199:     writeObj(LS_SERVER_CACHE, {matDB:mat, workDB:work, ts:Date.now()});
   5200:     syncMainArrays('global');
   5201:   }
   5202:   function syncMainArrays(target){
   5203:     try{
   5204:       var use = target || activeTarget();
   5205:       if(use === 'global'){
   5206:         window.matDB = getServer('mat');
   5207:         window.workDB = getServer('work');
   5208:         try{ matDB = window.matDB; workDB = window.workDB; }catch(e){}
```

### around line 5421

```js
   5409:     return out;
   5410:   }
   5411:   function getServerFromCache(type){
   5412:     var c = readObj(LS_SERVER_CACHE);
   5413:     var a = type === 'work' ? c.workDB : c.matDB;
   5414:     return Array.isArray(a) ? a : [];
   5415:   }
   5416:   function setMyArrays(mat,work){
   5417:     mat = unique(mat || [], 'mat');
   5418:     work = unique(work || [], 'work');
   5419:     window.EP_MY_MAT = mat;
   5420:     window.EP_MY_WORK = work;
>> 5421:     window.userMatDB = mat;
   5422:     window.userWorkDB = work;
   5423:     writeArr(LS_MY_MAT, mat);
   5424:     writeArr(LS_MY_WORK, work);
   5425:   }
   5426:   function setServerArrays(mat,work){
   5427:     mat = unique(mat || [], 'mat');
   5428:     work = unique(work || [], 'work');
   5429:     window.EP_GLOBAL_MAT = mat;
   5430:     window.EP_GLOBAL_WORK = work;
   5431:     window.EP_FORCE_GLOBAL = {matDB:mat, workDB:work};
   5432:     window.EP_ULTIMATE_DB_CACHE = {matDB:mat, workDB:work, ts:Date.now()};
   5433:     window.EP_GLOBAL_DB_VISIBLE_CACHE = {matDB:mat, workDB:work, ts:Date.now()};
   5434:     writeObj(LS_SERVER_CACHE, {matDB:mat, workDB:work, ts:Date.now()});
   5435:   }
   5436:   function syncActiveArrays(){
   5437:     try{
   5438:       if(getScope() === 'global'){
   5439:         var sm = Array.isArray(window.EP_GLOBAL_MAT) ? window.EP_GLOBAL_MAT : getServerFromCache('mat');
   5440:         var sw = Array.isArray(window.EP_GLOBAL_WORK) ? window.EP_GLOBAL_WORK : getServerFromCache('work');
   5441:         window.matDB = sm.slice();
   5442:         window.workDB = sw.slice();
   5443:         try{ matDB = window.matDB; workDB = window.workDB; }catch(e){}
```


## userWorkDB

Найдено строк: 2402, 4510, 5186, 5422, 5642, 6097, 6375, 6682, 7547, 8211, 8801

### around line 2402

```js
   2390:     window.openWorkCatalog = function(){ var el=qs('work-cat-list'); if(el) el.innerHTML = epRenderGrouped(window.workDB || [], 'work', 'catalog', 'work_shield'); if(typeof openModal==='function') openModal('workModal'); else if(oldWork) oldWork(); };
   2391:     window.renderDbEditors = function(){
   2392:       epNormalizeMaterialsDb();
   2393:       var catsEl = qs('db-cats');
   2394:       if (catsEl) catsEl.innerHTML = uniq([].concat((window.matDB||[]).map(function(x){return x.c;}),(window.workDB||[]).map(function(x){return x.c;}))).map(function(c){return '<option value="'+safeText(c)+'">';}).join('');
   2395:       var em=qs('editor-mat-list'); if(em) em.innerHTML = epRenderGrouped(window.matDB || [], 'mat', 'editor', 'db_mat_shield');
   2396:       var ew=qs('editor-work-list'); if(ew) ew.innerHTML = epRenderGrouped(window.workDB || [], 'work', 'editor', 'db_work_shield');
   2397:     };
   2398:   }
   2399: 
   2400:   function epAllDbItems(type){
   2401:     var a = type === 'work' ? (window.workDB || []) : (window.matDB || []);
>> 2402:     var b = type === 'work' ? (window.userWorkDB || []) : (window.userMatDB || []);
   2403:     return [].concat(a || [], b || []).filter(Boolean);
   2404:   }
   2405:   function epFindItem(type, words){
   2406:     var ws = (words || []).map(norm).filter(Boolean);
   2407:     var best = null, bestScore = -1;
   2408:     epAllDbItems(type).forEach(function(it){
   2409:       var blob = norm([it.c,it.g,it.sc,it.n,it.brand,it.kind,it.nominal,it.curve,it.wallType,it.modules,it.mountType].join(' '));
   2410:       var score = 0;
   2411:       ws.forEach(function(w){ if(w && blob.includes(w)) score++; });
   2412:       if(score > bestScore){ bestScore = score; best = it; }
   2413:     });
   2414:     return bestScore >= Math.max(1, Math.ceil(ws.length * 0.55)) ? best : null;
   2415:   }
   2416:   function epMat(label, q, fallbackPrice, words, meta){
   2417:     epNormalizeMaterialsDb();
   2418:     var found = epFindItem('mat', words || [label]);
   2419:     if(found) return { n: found.n, q: q, p: Number(found.p) || 0, u: found.u || 'шт', type: 'mat', sourceId: found.id || null };
   2420:     meta = meta || {};
   2421:     var path = meta.category ? ' [' + meta.category + (meta.subcategory ? ' → ' + meta.subcategory : '') + ']' : '';
   2422:     return { n: '⚠️ ' + label + path + ' — добавить в БД', q: q, p: Number(fallbackPrice) || 0, u: meta.unit || 'шт', type: 'mat', needDb: true, dbMeta: meta };
   2423:   }
   2424:   function epWork(label, q, price, words, meta){
```

### around line 4510

```js
   4498:   function activeArr(type){ return scope()==='global' ? serverArr(type) : myArr(type); }
   4499: 
   4500:   function syncWindowCaches(){
   4501:     try{
   4502:       window.EP_MY_MAT = EP_MY_MAT;
   4503:       window.EP_MY_WORK = EP_MY_WORK;
   4504:       window.EP_GLOBAL_MAT = EP_SERVER_MAT;
   4505:       window.EP_GLOBAL_WORK = EP_SERVER_WORK;
   4506:       window.EP_FORCE_GLOBAL = {matDB:EP_SERVER_MAT, workDB:EP_SERVER_WORK};
   4507:       window.EP_ULTIMATE_DB_CACHE = {matDB:EP_SERVER_MAT, workDB:EP_SERVER_WORK, ts:Date.now()};
   4508:       window.EP_GLOBAL_DB_VISIBLE_CACHE = {matDB:EP_SERVER_MAT, workDB:EP_SERVER_WORK, ts:Date.now()};
   4509:       window.userMatDB = EP_MY_MAT;
>> 4510:       window.userWorkDB = EP_MY_WORK;
   4511:       if(scope()==='global'){ matDB = EP_SERVER_MAT.slice(); workDB = EP_SERVER_WORK.slice(); }
   4512:       else { matDB = EP_MY_MAT.slice(); workDB = EP_MY_WORK.slice(); }
   4513:     }catch(e){}
   4514:   }
   4515: 
   4516:   function saveMyLocal(type, arr){
   4517:     arr = unique(arr||[], type);
   4518:     if(type==='work') EP_MY_WORK = arr; else EP_MY_MAT = arr;
   4519:     setLS(LS_MY_MAT, EP_MY_MAT);
   4520:     setLS(LS_MY_WORK, EP_MY_WORK);
   4521:     try{ localStorage.setItem(LS_MASTER_CREATED,'1'); }catch(e){}
   4522:     syncWindowCaches();
   4523:     epSaveMyDbToServer();
   4524:   }
   4525: 
   4526:   function saveServerLocal(type, arr, saveDirect){
   4527:     arr = unique(arr||[], type);
   4528:     if(type==='work') EP_SERVER_WORK = arr; else EP_SERVER_MAT = arr;
   4529:     setObjLS(LS_SERVER_CACHE, {matDB:EP_SERVER_MAT, workDB:EP_SERVER_WORK, cleanMode:cleanMode(), ts:Date.now()});
   4530:     syncWindowCaches();
   4531:     if(saveDirect) epSaveServerDbToServer();
   4532:   }
```

### around line 5186

```js
   5174:   function getServer(type){
   5175:     var fromWin = type === 'work' ? window.EP_GLOBAL_WORK : window.EP_GLOBAL_MAT;
   5176:     if(Array.isArray(fromWin)) return fromWin.slice();
   5177:     var c = readObj(LS_SERVER_CACHE);
   5178:     var a = type === 'work' ? c.workDB : c.matDB;
   5179:     return Array.isArray(a) ? a : [];
   5180:   }
   5181:   function setMy(type,arr){
   5182:     arr = unique(arr, type);
   5183:     if(type === 'work') window.EP_MY_WORK = arr; else window.EP_MY_MAT = arr;
   5184:     writeArr(LS_MY_MAT, type === 'mat' ? arr : getMy('mat'));
   5185:     writeArr(LS_MY_WORK, type === 'work' ? arr : getMy('work'));
>> 5186:     try{ window.userMatDB = getMy('mat'); window.userWorkDB = getMy('work'); }catch(e){}
   5187:     syncMainArrays('my');
   5188:   }
   5189:   function setServer(type,arr){
   5190:     arr = unique(arr, type);
   5191:     if(type === 'work') window.EP_GLOBAL_WORK = arr; else window.EP_GLOBAL_MAT = arr;
   5192:     var mat = type === 'mat' ? arr : getServer('mat');
   5193:     var work = type === 'work' ? arr : getServer('work');
   5194:     try{
   5195:       window.EP_FORCE_GLOBAL = {matDB:mat, workDB:work};
   5196:       window.EP_ULTIMATE_DB_CACHE = {matDB:mat, workDB:work, ts:Date.now()};
   5197:       window.EP_GLOBAL_DB_VISIBLE_CACHE = {matDB:mat, workDB:work, ts:Date.now()};
   5198:     }catch(e){}
   5199:     writeObj(LS_SERVER_CACHE, {matDB:mat, workDB:work, ts:Date.now()});
   5200:     syncMainArrays('global');
   5201:   }
   5202:   function syncMainArrays(target){
   5203:     try{
   5204:       var use = target || activeTarget();
   5205:       if(use === 'global'){
   5206:         window.matDB = getServer('mat');
   5207:         window.workDB = getServer('work');
   5208:         try{ matDB = window.matDB; workDB = window.workDB; }catch(e){}
```

### around line 5422

```js
   5410:   }
   5411:   function getServerFromCache(type){
   5412:     var c = readObj(LS_SERVER_CACHE);
   5413:     var a = type === 'work' ? c.workDB : c.matDB;
   5414:     return Array.isArray(a) ? a : [];
   5415:   }
   5416:   function setMyArrays(mat,work){
   5417:     mat = unique(mat || [], 'mat');
   5418:     work = unique(work || [], 'work');
   5419:     window.EP_MY_MAT = mat;
   5420:     window.EP_MY_WORK = work;
   5421:     window.userMatDB = mat;
>> 5422:     window.userWorkDB = work;
   5423:     writeArr(LS_MY_MAT, mat);
   5424:     writeArr(LS_MY_WORK, work);
   5425:   }
   5426:   function setServerArrays(mat,work){
   5427:     mat = unique(mat || [], 'mat');
   5428:     work = unique(work || [], 'work');
   5429:     window.EP_GLOBAL_MAT = mat;
   5430:     window.EP_GLOBAL_WORK = work;
   5431:     window.EP_FORCE_GLOBAL = {matDB:mat, workDB:work};
   5432:     window.EP_ULTIMATE_DB_CACHE = {matDB:mat, workDB:work, ts:Date.now()};
   5433:     window.EP_GLOBAL_DB_VISIBLE_CACHE = {matDB:mat, workDB:work, ts:Date.now()};
   5434:     writeObj(LS_SERVER_CACHE, {matDB:mat, workDB:work, ts:Date.now()});
   5435:   }
   5436:   function syncActiveArrays(){
   5437:     try{
   5438:       if(getScope() === 'global'){
   5439:         var sm = Array.isArray(window.EP_GLOBAL_MAT) ? window.EP_GLOBAL_MAT : getServerFromCache('mat');
   5440:         var sw = Array.isArray(window.EP_GLOBAL_WORK) ? window.EP_GLOBAL_WORK : getServerFromCache('work');
   5441:         window.matDB = sm.slice();
   5442:         window.workDB = sw.slice();
   5443:         try{ matDB = window.matDB; workDB = window.workDB; }catch(e){}
   5444:       } else {
```

### around line 5642

```js
   5630:       } else {
   5631:         window.matDB = getMy('mat');
   5632:         window.workDB = getMy('work');
   5633:       }
   5634:       try{ matDB = window.matDB; workDB = window.workDB; }catch(e){}
   5635:     }catch(e){}
   5636:   }
   5637:   function setMy(type,arr){
   5638:     arr = unique(arr, type);
   5639:     if(type === 'work') window.EP_MY_WORK = arr; else window.EP_MY_MAT = arr;
   5640:     writeArr(LS_MY_MAT, type === 'mat' ? arr : getMy('mat'));
   5641:     writeArr(LS_MY_WORK, type === 'work' ? arr : getMy('work'));
>> 5642:     try{ window.userMatDB = getMy('mat'); window.userWorkDB = getMy('work'); }catch(e){}
   5643:     syncMainArrays('my');
   5644:   }
   5645:   function setServer(type,arr){
   5646:     arr = unique(arr, type);
   5647:     if(type === 'work') window.EP_GLOBAL_WORK = arr; else window.EP_GLOBAL_MAT = arr;
   5648:     var mat = type === 'mat' ? arr : getServer('mat');
   5649:     var work = type === 'work' ? arr : getServer('work');
   5650:     try{
   5651:       window.EP_FORCE_GLOBAL = {matDB:mat, workDB:work};
   5652:       window.EP_ULTIMATE_DB_CACHE = {matDB:mat, workDB:work, ts:Date.now()};
   5653:       window.EP_GLOBAL_DB_VISIBLE_CACHE = {matDB:mat, workDB:work, ts:Date.now()};
   5654:     }catch(e){}
   5655:     writeObj(LS_SERVER_CACHE, {matDB:mat, workDB:work, ts:Date.now()});
   5656:     syncMainArrays('global');
   5657:   }
   5658:   function upsert(arr,type,it,mode){
   5659:     it = clone(it);
   5660:     if(!it.id) it.id = (type === 'work' ? 'w' : 'm') + '_imp_' + Date.now() + '_' + Math.random().toString(36).slice(2,7);
   5661:     if(it.sc && !it.g) it.g = it.sc;
   5662:     if(it.g && !it.sc) it.sc = it.g;
   5663:     var k = sig(type,it);
   5664:     var idx = (arr || []).findIndex(function(x){ return sig(type,x) === k || (it.id && String(x.id || '') === String(it.id)); });
```


# FILE: public/js/04-database.js


## renderDbEditors

Найдено строк: 127, 1069, 1071, 1122, 1549, 2179, 2245, 2248, 3853, 3985, 3986, 3988, 3989, 4129, 4130, 4462

### around line 127

```js
   115:     if(!(cust && cust.name)) { setTimeout(() => { openModal('custModal'); }, 400); }
   116: }
   117: 
   118: 
   119: 
   120: 
   121: /* =========================================================
   122:  * DATABASE FUNCTION: openModal
   123:  * ========================================================= */
   124: function openModal(id) { 
   125:     if(id === 'custModal') loadCustHistoryOptions(); 
   126:     if(id === 'logicModal') renderLogicUI(); 
>> 127:     if(id === 'settModal') renderDbEditors(); 
   128:     if(id === 'configModal') populateShieldExtras();
   129:     if(id === 'buhModal') setTimeout(renderChart, 100);
   130:     document.getElementById(id).style.display='flex'; 
   131: }
   132: 
   133: 
   134: 
   135: /* =========================================================
   136:  * DATABASE FUNCTION: saveApiKey
   137:  * ========================================================= */
   138: async function saveApiKey(val) { 
   139:     GEMINI_API_KEY = val.trim(); safeSet('gemini_key_v31', GEMINI_API_KEY);
   140:     if(db && appUser && appUser.uid) { try { await db.collection('users').doc(appUser.uid).update({geminiKey: GEMINI_API_KEY}); }catch(e){} }
   141:     showToast("🔑 Ключ сохранен!"); 
   142: }
   143: 
   144: 
   145: 
   146: /* =========================================================
   147:  * DATABASE FUNCTION: openSwapModal
   148:  * ========================================================= */
   149: function openSwapModal(idx) {
```

### around line 1069

```js
   1057:  * ========================================================= */
   1058: function switchDbTab(tab) { 
   1059:     document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active')); 
   1060:     document.getElementById(tab === 'mat' ? 'btnTabMat' : 'btnTabWork').classList.add('active'); 
   1061:     document.getElementById('editor-mat-list').style.display = tab === 'mat' ? 'block' : 'none'; 
   1062:     document.getElementById('editor-work-list').style.display = tab === 'work' ? 'block' : 'none'; 
   1063: }
   1064: 
   1065: 
   1066: 
   1067: 
   1068: /* =========================================================
>> 1069:  * DATABASE FUNCTION: renderDbEditors
   1070:  * ========================================================= */
   1071: function renderDbEditors() {
   1072:     let catsM = [...new Set(matDB.map(m=>m.c || 'Разное'))];
   1073:     let catsW = [...new Set(workDB.map(w=>w.c || 'Разное'))];
   1074:     document.getElementById('db-cats').innerHTML = [...new Set([...catsM, ...catsW])].map(c=>`<option value="${c}">`).join('');
   1075: 
   1076:     let htmlMat = '';
   1077:     let mGroups = {}; matDB.forEach(m => { mGroups[m.c||'Разное'] = mGroups[m.c||'Разное'] || []; mGroups[m.c||'Разное'].push(m); });
   1078:     Object.keys(mGroups).forEach((c, idx) => {
   1079:         let sid = 'db_m_'+idx;
   1080:         htmlMat += `<div class="cat-header" onclick="toggleCat('${sid}')">${c}</div><div class="cat-body" id="${sid}">`;
   1081:         mGroups[c].forEach(m => {
   1082:             htmlMat += `<div class="emp-row"><div><b>${m.n}</b><br><span style="color:var(--gray);font-size:10px;">${m.p} ₽ / ${m.u}</span></div> <input type="number" value="${m.p}" onchange="requestPriceChange('mat', '${m.id}', this.value)" style="width:60px;margin:0;padding:4px;text-align:center;"></div>`;
   1083:         });
   1084:         htmlMat += `</div>`;
   1085:     });
   1086:     document.getElementById('editor-mat-list').innerHTML = htmlMat;
   1087: 
   1088:     let htmlWork = '';
   1089:     let wGroups = {}; workDB.forEach(w => { wGroups[w.c||'Разное'] = wGroups[w.c||'Разное'] || []; wGroups[w.c||'Разное'].push(w); });
   1090:     Object.keys(wGroups).forEach((c, idx) => {
   1091:         let sid = 'db_w_'+idx;
```

### around line 1071

```js
   1059:     document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active')); 
   1060:     document.getElementById(tab === 'mat' ? 'btnTabMat' : 'btnTabWork').classList.add('active'); 
   1061:     document.getElementById('editor-mat-list').style.display = tab === 'mat' ? 'block' : 'none'; 
   1062:     document.getElementById('editor-work-list').style.display = tab === 'work' ? 'block' : 'none'; 
   1063: }
   1064: 
   1065: 
   1066: 
   1067: 
   1068: /* =========================================================
   1069:  * DATABASE FUNCTION: renderDbEditors
   1070:  * ========================================================= */
>> 1071: function renderDbEditors() {
   1072:     let catsM = [...new Set(matDB.map(m=>m.c || 'Разное'))];
   1073:     let catsW = [...new Set(workDB.map(w=>w.c || 'Разное'))];
   1074:     document.getElementById('db-cats').innerHTML = [...new Set([...catsM, ...catsW])].map(c=>`<option value="${c}">`).join('');
   1075: 
   1076:     let htmlMat = '';
   1077:     let mGroups = {}; matDB.forEach(m => { mGroups[m.c||'Разное'] = mGroups[m.c||'Разное'] || []; mGroups[m.c||'Разное'].push(m); });
   1078:     Object.keys(mGroups).forEach((c, idx) => {
   1079:         let sid = 'db_m_'+idx;
   1080:         htmlMat += `<div class="cat-header" onclick="toggleCat('${sid}')">${c}</div><div class="cat-body" id="${sid}">`;
   1081:         mGroups[c].forEach(m => {
   1082:             htmlMat += `<div class="emp-row"><div><b>${m.n}</b><br><span style="color:var(--gray);font-size:10px;">${m.p} ₽ / ${m.u}</span></div> <input type="number" value="${m.p}" onchange="requestPriceChange('mat', '${m.id}', this.value)" style="width:60px;margin:0;padding:4px;text-align:center;"></div>`;
   1083:         });
   1084:         htmlMat += `</div>`;
   1085:     });
   1086:     document.getElementById('editor-mat-list').innerHTML = htmlMat;
   1087: 
   1088:     let htmlWork = '';
   1089:     let wGroups = {}; workDB.forEach(w => { wGroups[w.c||'Разное'] = wGroups[w.c||'Разное'] || []; wGroups[w.c||'Разное'].push(w); });
   1090:     Object.keys(wGroups).forEach((c, idx) => {
   1091:         let sid = 'db_w_'+idx;
   1092:         htmlWork += `<div class="cat-header" style="color:var(--orange); border-color:rgba(245,158,11,0.2); background:rgba(245,158,11,0.08);" onclick="toggleCat('${sid}')">${c}</div><div class="cat-body" id="${sid}">`;
   1093:         wGroups[c].forEach(w => {
```

### around line 1122

```js
   1110:     let name = document.getElementById('db-new-name').value.trim();
   1111:     let price = Number(document.getElementById('db-new-price').value) || 0;
   1112:     let unit = document.getElementById('db-new-unit').value.trim() || 'шт';
   1113:     let isMat = document.getElementById('editor-mat-list').style.display !== 'none';
   1114:     
   1115:     if(!name) return showToast("Введите название!");
   1116:     
   1117:     let newItem = { id: (isMat?'m':'w') + Date.now(), c: cat, n: name, p: price, u: unit };
   1118:     if(isMat) matDB.push(newItem); else workDB.push(newItem);
   1119:     
   1120:     try { if(db) await db.collection('settings').doc('global_db').set({matDB: matDB, workDB: workDB}); } catch(e){}
   1121:     
>> 1122:     renderDbEditors();
   1123:     document.getElementById('db-new-name').value = ''; document.getElementById('db-new-price').value = '';
   1124:     showToast("✅ Позиция добавлена");
   1125: }
   1126: 
   1127: 
   1128: 
   1129: 
   1130: /* =========================================================
   1131:  * DATABASE FUNCTION: requestPriceChange
   1132:  * ========================================================= */
   1133: async function requestPriceChange(type, id, newPrice) { 
   1134:     newPrice = Number(newPrice); 
   1135:     if (appUser.role === 'admin') { 
   1136:         let dbArr = type === 'mat' ? matDB : workDB; let item = dbArr.find(x => x.id === id); 
   1137:         if (item) item.p = newPrice; priceOverrides[id] = newPrice; 
   1138:         try { if(db) { await db.collection('settings').doc('price_overrides').set({overrides: priceOverrides}); await db.collection('settings').doc('global_db').set({matDB: matDB, workDB: workDB}); } } catch(e){} 
   1139:         showToast("✅ Цена изменена"); 
   1140:     } else { showToast("Отправлено админу"); } 
   1141: }
   1142: 
   1143: 
   1144: 
```

### around line 1549

```js
   1537:                 }
   1538:             }
   1539: 
   1540:             if (!loaded) {
   1541:                 try {
   1542:                     const lm = JSON.parse(safeGet('user_db_mat_v31', '[]'));
   1543:                     const lw = JSON.parse(safeGet('user_db_work_v31', '[]'));
   1544:                     if (lm.length) matDB = lm;
   1545:                     if (lw.length) workDB = lw;
   1546:                 } catch(e){}
   1547:             }
   1548: 
>> 1549:             renderDbEditors();
   1550:         } catch(e) {
   1551:             console.warn('load user db error', e);
   1552:         }
   1553:     }
   1554: 
   1555:     
   1556: 
   1557: 
   1558: /* =========================================================
   1559:  * DATABASE FUNCTION: epInsertDbTools
   1560:  * ========================================================= */
   1561: function epInsertDbTools() {
   1562:         if (document.getElementById('ep-db-ai-tools')) return;
   1563:         const tabs = document.querySelector('#settModal .tabs-container');
   1564:         if (!tabs) return;
   1565: 
   1566:         const box = document.createElement('div');
   1567:         box.id = 'ep-db-ai-tools';
   1568:         box.innerHTML = `
   1569:             <h3>🤖 Импорт / экспорт базы через ИИ</h3>
   1570:             <div class="ep-db-ai-grid">
   1571:                 <button class="btn-info" onclick="epTriggerDbFileImport('mat')">📥 Материалы: Excel / JSON / фото / скрин</button>
```


## openMatCatalog

Найдено строк: 195, 197, 2243, 2246, 3350, 3351, 3387, 3611, 3612, 3851, 4132, 4463

### around line 195

```js
   183: 
   184: 
   185: 
   186: 
   187: /* =========================================================
   188:  * DATABASE FUNCTION: syncDraft
   189:  * ========================================================= */
   190: async function syncDraft() { try { safeSet('est_v31', JSON.stringify(currentEstimate)); if(db && appUser && appUser.uid) await db.collection('drafts').doc(appUser.uid).set({ estimate: currentEstimate, cust: cust, timestamp: new Date().toISOString() }); } catch(e){} }
   191: 
   192: 
   193: 
   194: /* =========================================================
>> 195:  * DATABASE FUNCTION: openMatCatalog
   196:  * ========================================================= */
   197: function openMatCatalog() { 
   198:     let cats = {}; matDB.forEach(m => { let c = m.c || "ОБЩЕЕ"; if(!cats[c]) cats[c] = []; cats[c].push(m); }); 
   199:     let html = ""; let idx = 0;
   200:     for(let c in cats) { 
   201:         let sid = 'mcat_' + (idx++);
   202:         html += `<div class="cat-header" onclick="toggleCat('${sid}')">${c}</div><div class="cat-body" id="${sid}">`;
   203:         cats[c].forEach(m => { html += `<div class="mat-item"><div style="flex:1; font-size:12px; font-weight:600;">${m.n}<br><span style="color:var(--gray); font-size:11px; font-weight:normal;">${m.p} P / ${m.u}</span></div><button class="mat-add-btn" onclick="promptAdd('${m.id}', 'mat')">+ Добавить</button></div>`; });
   204:         html += `</div>`;
   205:     } document.getElementById('mat-cat-list').innerHTML = html; openModal('matCatModal'); 
   206: }
   207: 
   208: 
   209: 
   210: 
   211: /* =========================================================
   212:  * DATABASE FUNCTION: openWorkCatalog
   213:  * ========================================================= */
   214: function openWorkCatalog() { 
   215:     let cats = {}; workDB.forEach(w => { let c = w.c || "ОБЩЕЕ"; if(!cats[c]) cats[c] = []; cats[c].push(w); });
   216:     let html = ""; let idx = 0;
   217:     for(let c in cats) { 
```

### around line 197

```js
   185: 
   186: 
   187: /* =========================================================
   188:  * DATABASE FUNCTION: syncDraft
   189:  * ========================================================= */
   190: async function syncDraft() { try { safeSet('est_v31', JSON.stringify(currentEstimate)); if(db && appUser && appUser.uid) await db.collection('drafts').doc(appUser.uid).set({ estimate: currentEstimate, cust: cust, timestamp: new Date().toISOString() }); } catch(e){} }
   191: 
   192: 
   193: 
   194: /* =========================================================
   195:  * DATABASE FUNCTION: openMatCatalog
   196:  * ========================================================= */
>> 197: function openMatCatalog() { 
   198:     let cats = {}; matDB.forEach(m => { let c = m.c || "ОБЩЕЕ"; if(!cats[c]) cats[c] = []; cats[c].push(m); }); 
   199:     let html = ""; let idx = 0;
   200:     for(let c in cats) { 
   201:         let sid = 'mcat_' + (idx++);
   202:         html += `<div class="cat-header" onclick="toggleCat('${sid}')">${c}</div><div class="cat-body" id="${sid}">`;
   203:         cats[c].forEach(m => { html += `<div class="mat-item"><div style="flex:1; font-size:12px; font-weight:600;">${m.n}<br><span style="color:var(--gray); font-size:11px; font-weight:normal;">${m.p} P / ${m.u}</span></div><button class="mat-add-btn" onclick="promptAdd('${m.id}', 'mat')">+ Добавить</button></div>`; });
   204:         html += `</div>`;
   205:     } document.getElementById('mat-cat-list').innerHTML = html; openModal('matCatModal'); 
   206: }
   207: 
   208: 
   209: 
   210: 
   211: /* =========================================================
   212:  * DATABASE FUNCTION: openWorkCatalog
   213:  * ========================================================= */
   214: function openWorkCatalog() { 
   215:     let cats = {}; workDB.forEach(w => { let c = w.c || "ОБЩЕЕ"; if(!cats[c]) cats[c] = []; cats[c].push(w); });
   216:     let html = ""; let idx = 0;
   217:     for(let c in cats) { 
   218:         let sid = 'wcat_' + (idx++);
   219:         html += `<div class="cat-header" style="color:var(--orange); border-color:rgba(245,158,11,0.2); background:rgba(245,158,11,0.08);" onclick="toggleCat('${sid}')">${c}</div><div class="cat-body" id="${sid}">`;
```

### around line 2243

```js
   2231:       html += '</div>';
   2232:     });
   2233:     return html || '<div style="color:var(--gray);font-size:12px;padding:10px;">Позиции не найдены</div>';
   2234:   }
   2235: 
   2236:   
   2237: 
   2238: 
   2239: /* =========================================================
   2240:  * DATABASE FUNCTION: epPatchDbRenderers
   2241:  * ========================================================= */
   2242: function epPatchDbRenderers(){
>> 2243:     var oldMat = window.openMatCatalog;
   2244:     var oldWork = window.openWorkCatalog;
   2245:     var oldRender = window.renderDbEditors;
   2246:     window.openMatCatalog = function(){ epNormalizeMaterialsDb(); var el=qs('mat-cat-list'); if(el) el.innerHTML = epRenderGrouped(window.matDB || [], 'mat', 'catalog', 'mat_shield'); if(typeof openModal==='function') openModal('matCatModal'); else if(oldMat) oldMat(); };
   2247:     window.openWorkCatalog = function(){ var el=qs('work-cat-list'); if(el) el.innerHTML = epRenderGrouped(window.workDB || [], 'work', 'catalog', 'work_shield'); if(typeof openModal==='function') openModal('workModal'); else if(oldWork) oldWork(); };
   2248:     window.renderDbEditors = function(){
   2249:       epNormalizeMaterialsDb();
   2250:       var catsEl = qs('db-cats');
   2251:       if (catsEl) catsEl.innerHTML = uniq([].concat((window.matDB||[]).map(function(x){return x.c;}),(window.workDB||[]).map(function(x){return x.c;}))).map(function(c){return '<option value="'+safeText(c)+'">';}).join('');
   2252:       var em=qs('editor-mat-list'); if(em) em.innerHTML = epRenderGrouped(window.matDB || [], 'mat', 'editor', 'db_mat_shield');
   2253:       var ew=qs('editor-work-list'); if(ew) ew.innerHTML = epRenderGrouped(window.workDB || [], 'work', 'editor', 'db_work_shield');
   2254:     };
   2255:   }
   2256: 
   2257:   
   2258: 
   2259: 
   2260: /* =========================================================
   2261:  * DATABASE FUNCTION: boot
   2262:  * ========================================================= */
   2263: function boot(){ epMoveShieldSettingsIntoDetails(); epPatchDbRenderers(); epNormalizeMaterialsDb(); epPatchGenerateButton(); }
   2264:   
   2265: 
```

### around line 2246

```js
   2234:   }
   2235: 
   2236:   
   2237: 
   2238: 
   2239: /* =========================================================
   2240:  * DATABASE FUNCTION: epPatchDbRenderers
   2241:  * ========================================================= */
   2242: function epPatchDbRenderers(){
   2243:     var oldMat = window.openMatCatalog;
   2244:     var oldWork = window.openWorkCatalog;
   2245:     var oldRender = window.renderDbEditors;
>> 2246:     window.openMatCatalog = function(){ epNormalizeMaterialsDb(); var el=qs('mat-cat-list'); if(el) el.innerHTML = epRenderGrouped(window.matDB || [], 'mat', 'catalog', 'mat_shield'); if(typeof openModal==='function') openModal('matCatModal'); else if(oldMat) oldMat(); };
   2247:     window.openWorkCatalog = function(){ var el=qs('work-cat-list'); if(el) el.innerHTML = epRenderGrouped(window.workDB || [], 'work', 'catalog', 'work_shield'); if(typeof openModal==='function') openModal('workModal'); else if(oldWork) oldWork(); };
   2248:     window.renderDbEditors = function(){
   2249:       epNormalizeMaterialsDb();
   2250:       var catsEl = qs('db-cats');
   2251:       if (catsEl) catsEl.innerHTML = uniq([].concat((window.matDB||[]).map(function(x){return x.c;}),(window.workDB||[]).map(function(x){return x.c;}))).map(function(c){return '<option value="'+safeText(c)+'">';}).join('');
   2252:       var em=qs('editor-mat-list'); if(em) em.innerHTML = epRenderGrouped(window.matDB || [], 'mat', 'editor', 'db_mat_shield');
   2253:       var ew=qs('editor-work-list'); if(ew) ew.innerHTML = epRenderGrouped(window.workDB || [], 'work', 'editor', 'db_work_shield');
   2254:     };
   2255:   }
   2256: 
   2257:   
   2258: 
   2259: 
   2260: /* =========================================================
   2261:  * DATABASE FUNCTION: boot
   2262:  * ========================================================= */
   2263: function boot(){ epMoveShieldSettingsIntoDetails(); epPatchDbRenderers(); epNormalizeMaterialsDb(); epPatchGenerateButton(); }
   2264:   
   2265: 
   2266: 
   2267: /* =========================================================
   2268:  * DATABASE FUNCTION: dbArr
```

### around line 3350

```js
   3338:     EP_MY_WORK = unique(EP_MY_WORK, 'work');
   3339:     EP_SERVER_MAT = unique(EP_SERVER_MAT, 'mat');
   3340:     EP_SERVER_WORK = unique(EP_SERVER_WORK, 'work');
   3341:     syncWindowCaches();
   3342:     epRefreshDbScopeUi();
   3343:   }
   3344: 
   3345:   function sourceSwitcherHtml(type){
   3346:     return '<div style="border:1px solid var(--primary);border-radius:14px;padding:10px;margin:0 0 12px;background:rgba(79,70,229,.06);">'+
   3347:       '<div style="font-weight:900;color:var(--primary);margin-bottom:6px;">Источник: '+(type==='work'?'Работы':'Материалы')+'</div>'+
   3348:       '<div style="font-size:11px;color:var(--gray);margin-bottom:8px;">В смету и каталог попадает только выбранный источник. Вперемешку не считаем.</div>'+
   3349:       '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;">'+
>> 3350:         '<button class="'+(scope()==='my'?'btn-success':'btn-info')+'" style="margin:0;padding:10px;" onclick="epSetDbScope(&quot;my&quot;); '+(type==='work'?'openWorkCatalog()':'openMatCatalog()')+'">👤 Моя база</button>'+
   3351:         '<button class="'+(scope()==='global'?'btn-success':'btn-info')+'" style="margin:0;padding:10px;" onclick="epSetDbScope(&quot;global&quot;); '+(type==='work'?'openWorkCatalog()':'openMatCatalog()')+'">🌍 База сервера</button>'+
   3352:       '</div>'+
   3353:     '</div>';
   3354:   }
   3355: 
   3356:   window.epDbToggle = function(id,e){ if(e) e.stopPropagation(); var el=$(id); if(el) el.classList.toggle('active'); };
   3357: 
   3358:   function renderCatalog(type){
   3359:     var arr = activeArr(type);
   3360:     var html = sourceSwitcherHtml(type);
   3361:     if(!arr.length){
   3362:       return html + '<div style="padding:16px;border:1px dashed var(--border);border-radius:14px;text-align:center;color:var(--gray);font-weight:800;">'+activeLabel()+' пустая.<br><br>'+(scope()==='my'?'Можно добавить вручную, импортом или взять позицию из базы сервера.':'После полного сброса база сервера пустая. Админ может заполнить её вручную или импортом.')+'</div>';
   3363:     }
   3364:     var cats={}, i=0;
   3365:     arr.forEach(function(it){ var c=it.c||'Разное'; var g=groupOf(it)||'Без группы'; if(!cats[c]) cats[c]={}; if(!cats[c][g]) cats[c][g]=[]; cats[c][g].push(it); });
   3366:     Object.keys(cats).sort(function(a,b){return a.localeCompare(b,'ru');}).forEach(function(c){
   3367:       var cid='ep_cat_'+type+'_'+(i++);
   3368:       html += '<div class="cat-header" onclick="epDbToggle(&quot;'+cid+'&quot;, event)">'+esc(c)+'</div><div class="cat-body" id="'+cid+'">';
   3369:       Object.keys(cats[c]).sort(function(a,b){return a.localeCompare(b,'ru');}).forEach(function(g){
   3370:         var gid='ep_sub_'+type+'_'+(i++);
   3371:         html += '<div class="sub-cat-header" onclick="epDbToggle(&quot;'+gid+'&quot;, event)">'+esc(g)+' ▾</div><div class="sub-cat-body" id="'+gid+'">';
   3372:         cats[c][g].sort(function(a,b){return String(a.n||'').localeCompare(String(b.n||''),'ru');}).forEach(function(it){ html += catalogRow(type,it); });
```


## openWorkCatalog

Найдено строк: 212, 214, 2244, 2247, 3350, 3351, 3388, 3611, 3612, 3852, 4135, 4464

### around line 212

```js
   200:     for(let c in cats) { 
   201:         let sid = 'mcat_' + (idx++);
   202:         html += `<div class="cat-header" onclick="toggleCat('${sid}')">${c}</div><div class="cat-body" id="${sid}">`;
   203:         cats[c].forEach(m => { html += `<div class="mat-item"><div style="flex:1; font-size:12px; font-weight:600;">${m.n}<br><span style="color:var(--gray); font-size:11px; font-weight:normal;">${m.p} P / ${m.u}</span></div><button class="mat-add-btn" onclick="promptAdd('${m.id}', 'mat')">+ Добавить</button></div>`; });
   204:         html += `</div>`;
   205:     } document.getElementById('mat-cat-list').innerHTML = html; openModal('matCatModal'); 
   206: }
   207: 
   208: 
   209: 
   210: 
   211: /* =========================================================
>> 212:  * DATABASE FUNCTION: openWorkCatalog
   213:  * ========================================================= */
   214: function openWorkCatalog() { 
   215:     let cats = {}; workDB.forEach(w => { let c = w.c || "ОБЩЕЕ"; if(!cats[c]) cats[c] = []; cats[c].push(w); });
   216:     let html = ""; let idx = 0;
   217:     for(let c in cats) { 
   218:         let sid = 'wcat_' + (idx++);
   219:         html += `<div class="cat-header" style="color:var(--orange); border-color:rgba(245,158,11,0.2); background:rgba(245,158,11,0.08);" onclick="toggleCat('${sid}')">${c}</div><div class="cat-body" id="${sid}">`;
   220:         cats[c].forEach(w => { html += `<div class="mat-item"><div style="flex:1; font-size:12px; font-weight:600;">${w.n}<br><span style="color:var(--gray); font-size:11px; font-weight:normal;">${w.p} P / ${w.u}</span></div><button class="mat-add-btn" style="background:var(--orange);" onclick="promptAdd('${w.id}', 'work')">+ Добавить</button></div>`; });
   221:         html += `</div>`;
   222:     } document.getElementById('work-cat-list').innerHTML = html; openModal('workModal'); 
   223: }
   224: 
   225: 
   226: 
   227: 
   228: /* =========================================================
   229:  * DATABASE FUNCTION: promptAdd
   230:  * ========================================================= */
   231: function promptAdd(id, type) { 
   232:     let dbArr = (type==='mat'?matDB:workDB); let item = dbArr.find(x => String(x.id) === String(id)); 
   233:     if(!item) return; pendingAdd = { item, type }; 
   234:     document.getElementById('qty-prompt-name').innerText = item.n; 
```

### around line 214

```js
   202:         html += `<div class="cat-header" onclick="toggleCat('${sid}')">${c}</div><div class="cat-body" id="${sid}">`;
   203:         cats[c].forEach(m => { html += `<div class="mat-item"><div style="flex:1; font-size:12px; font-weight:600;">${m.n}<br><span style="color:var(--gray); font-size:11px; font-weight:normal;">${m.p} P / ${m.u}</span></div><button class="mat-add-btn" onclick="promptAdd('${m.id}', 'mat')">+ Добавить</button></div>`; });
   204:         html += `</div>`;
   205:     } document.getElementById('mat-cat-list').innerHTML = html; openModal('matCatModal'); 
   206: }
   207: 
   208: 
   209: 
   210: 
   211: /* =========================================================
   212:  * DATABASE FUNCTION: openWorkCatalog
   213:  * ========================================================= */
>> 214: function openWorkCatalog() { 
   215:     let cats = {}; workDB.forEach(w => { let c = w.c || "ОБЩЕЕ"; if(!cats[c]) cats[c] = []; cats[c].push(w); });
   216:     let html = ""; let idx = 0;
   217:     for(let c in cats) { 
   218:         let sid = 'wcat_' + (idx++);
   219:         html += `<div class="cat-header" style="color:var(--orange); border-color:rgba(245,158,11,0.2); background:rgba(245,158,11,0.08);" onclick="toggleCat('${sid}')">${c}</div><div class="cat-body" id="${sid}">`;
   220:         cats[c].forEach(w => { html += `<div class="mat-item"><div style="flex:1; font-size:12px; font-weight:600;">${w.n}<br><span style="color:var(--gray); font-size:11px; font-weight:normal;">${w.p} P / ${w.u}</span></div><button class="mat-add-btn" style="background:var(--orange);" onclick="promptAdd('${w.id}', 'work')">+ Добавить</button></div>`; });
   221:         html += `</div>`;
   222:     } document.getElementById('work-cat-list').innerHTML = html; openModal('workModal'); 
   223: }
   224: 
   225: 
   226: 
   227: 
   228: /* =========================================================
   229:  * DATABASE FUNCTION: promptAdd
   230:  * ========================================================= */
   231: function promptAdd(id, type) { 
   232:     let dbArr = (type==='mat'?matDB:workDB); let item = dbArr.find(x => String(x.id) === String(id)); 
   233:     if(!item) return; pendingAdd = { item, type }; 
   234:     document.getElementById('qty-prompt-name').innerText = item.n; 
   235:     document.getElementById('qty-input').value = 1; 
   236:     openModal('qtyPromptModal'); 
```

### around line 2244

```js
   2232:     });
   2233:     return html || '<div style="color:var(--gray);font-size:12px;padding:10px;">Позиции не найдены</div>';
   2234:   }
   2235: 
   2236:   
   2237: 
   2238: 
   2239: /* =========================================================
   2240:  * DATABASE FUNCTION: epPatchDbRenderers
   2241:  * ========================================================= */
   2242: function epPatchDbRenderers(){
   2243:     var oldMat = window.openMatCatalog;
>> 2244:     var oldWork = window.openWorkCatalog;
   2245:     var oldRender = window.renderDbEditors;
   2246:     window.openMatCatalog = function(){ epNormalizeMaterialsDb(); var el=qs('mat-cat-list'); if(el) el.innerHTML = epRenderGrouped(window.matDB || [], 'mat', 'catalog', 'mat_shield'); if(typeof openModal==='function') openModal('matCatModal'); else if(oldMat) oldMat(); };
   2247:     window.openWorkCatalog = function(){ var el=qs('work-cat-list'); if(el) el.innerHTML = epRenderGrouped(window.workDB || [], 'work', 'catalog', 'work_shield'); if(typeof openModal==='function') openModal('workModal'); else if(oldWork) oldWork(); };
   2248:     window.renderDbEditors = function(){
   2249:       epNormalizeMaterialsDb();
   2250:       var catsEl = qs('db-cats');
   2251:       if (catsEl) catsEl.innerHTML = uniq([].concat((window.matDB||[]).map(function(x){return x.c;}),(window.workDB||[]).map(function(x){return x.c;}))).map(function(c){return '<option value="'+safeText(c)+'">';}).join('');
   2252:       var em=qs('editor-mat-list'); if(em) em.innerHTML = epRenderGrouped(window.matDB || [], 'mat', 'editor', 'db_mat_shield');
   2253:       var ew=qs('editor-work-list'); if(ew) ew.innerHTML = epRenderGrouped(window.workDB || [], 'work', 'editor', 'db_work_shield');
   2254:     };
   2255:   }
   2256: 
   2257:   
   2258: 
   2259: 
   2260: /* =========================================================
   2261:  * DATABASE FUNCTION: boot
   2262:  * ========================================================= */
   2263: function boot(){ epMoveShieldSettingsIntoDetails(); epPatchDbRenderers(); epNormalizeMaterialsDb(); epPatchGenerateButton(); }
   2264:   
   2265: 
   2266: 
```

### around line 2247

```js
   2235: 
   2236:   
   2237: 
   2238: 
   2239: /* =========================================================
   2240:  * DATABASE FUNCTION: epPatchDbRenderers
   2241:  * ========================================================= */
   2242: function epPatchDbRenderers(){
   2243:     var oldMat = window.openMatCatalog;
   2244:     var oldWork = window.openWorkCatalog;
   2245:     var oldRender = window.renderDbEditors;
   2246:     window.openMatCatalog = function(){ epNormalizeMaterialsDb(); var el=qs('mat-cat-list'); if(el) el.innerHTML = epRenderGrouped(window.matDB || [], 'mat', 'catalog', 'mat_shield'); if(typeof openModal==='function') openModal('matCatModal'); else if(oldMat) oldMat(); };
>> 2247:     window.openWorkCatalog = function(){ var el=qs('work-cat-list'); if(el) el.innerHTML = epRenderGrouped(window.workDB || [], 'work', 'catalog', 'work_shield'); if(typeof openModal==='function') openModal('workModal'); else if(oldWork) oldWork(); };
   2248:     window.renderDbEditors = function(){
   2249:       epNormalizeMaterialsDb();
   2250:       var catsEl = qs('db-cats');
   2251:       if (catsEl) catsEl.innerHTML = uniq([].concat((window.matDB||[]).map(function(x){return x.c;}),(window.workDB||[]).map(function(x){return x.c;}))).map(function(c){return '<option value="'+safeText(c)+'">';}).join('');
   2252:       var em=qs('editor-mat-list'); if(em) em.innerHTML = epRenderGrouped(window.matDB || [], 'mat', 'editor', 'db_mat_shield');
   2253:       var ew=qs('editor-work-list'); if(ew) ew.innerHTML = epRenderGrouped(window.workDB || [], 'work', 'editor', 'db_work_shield');
   2254:     };
   2255:   }
   2256: 
   2257:   
   2258: 
   2259: 
   2260: /* =========================================================
   2261:  * DATABASE FUNCTION: boot
   2262:  * ========================================================= */
   2263: function boot(){ epMoveShieldSettingsIntoDetails(); epPatchDbRenderers(); epNormalizeMaterialsDb(); epPatchGenerateButton(); }
   2264:   
   2265: 
   2266: 
   2267: /* =========================================================
   2268:  * DATABASE FUNCTION: dbArr
   2269:  * ========================================================= */
```

### around line 3350

```js
   3338:     EP_MY_WORK = unique(EP_MY_WORK, 'work');
   3339:     EP_SERVER_MAT = unique(EP_SERVER_MAT, 'mat');
   3340:     EP_SERVER_WORK = unique(EP_SERVER_WORK, 'work');
   3341:     syncWindowCaches();
   3342:     epRefreshDbScopeUi();
   3343:   }
   3344: 
   3345:   function sourceSwitcherHtml(type){
   3346:     return '<div style="border:1px solid var(--primary);border-radius:14px;padding:10px;margin:0 0 12px;background:rgba(79,70,229,.06);">'+
   3347:       '<div style="font-weight:900;color:var(--primary);margin-bottom:6px;">Источник: '+(type==='work'?'Работы':'Материалы')+'</div>'+
   3348:       '<div style="font-size:11px;color:var(--gray);margin-bottom:8px;">В смету и каталог попадает только выбранный источник. Вперемешку не считаем.</div>'+
   3349:       '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;">'+
>> 3350:         '<button class="'+(scope()==='my'?'btn-success':'btn-info')+'" style="margin:0;padding:10px;" onclick="epSetDbScope(&quot;my&quot;); '+(type==='work'?'openWorkCatalog()':'openMatCatalog()')+'">👤 Моя база</button>'+
   3351:         '<button class="'+(scope()==='global'?'btn-success':'btn-info')+'" style="margin:0;padding:10px;" onclick="epSetDbScope(&quot;global&quot;); '+(type==='work'?'openWorkCatalog()':'openMatCatalog()')+'">🌍 База сервера</button>'+
   3352:       '</div>'+
   3353:     '</div>';
   3354:   }
   3355: 
   3356:   window.epDbToggle = function(id,e){ if(e) e.stopPropagation(); var el=$(id); if(el) el.classList.toggle('active'); };
   3357: 
   3358:   function renderCatalog(type){
   3359:     var arr = activeArr(type);
   3360:     var html = sourceSwitcherHtml(type);
   3361:     if(!arr.length){
   3362:       return html + '<div style="padding:16px;border:1px dashed var(--border);border-radius:14px;text-align:center;color:var(--gray);font-weight:800;">'+activeLabel()+' пустая.<br><br>'+(scope()==='my'?'Можно добавить вручную, импортом или взять позицию из базы сервера.':'После полного сброса база сервера пустая. Админ может заполнить её вручную или импортом.')+'</div>';
   3363:     }
   3364:     var cats={}, i=0;
   3365:     arr.forEach(function(it){ var c=it.c||'Разное'; var g=groupOf(it)||'Без группы'; if(!cats[c]) cats[c]={}; if(!cats[c][g]) cats[c][g]=[]; cats[c][g].push(it); });
   3366:     Object.keys(cats).sort(function(a,b){return a.localeCompare(b,'ru');}).forEach(function(c){
   3367:       var cid='ep_cat_'+type+'_'+(i++);
   3368:       html += '<div class="cat-header" onclick="epDbToggle(&quot;'+cid+'&quot;, event)">'+esc(c)+'</div><div class="cat-body" id="'+cid+'">';
   3369:       Object.keys(cats[c]).sort(function(a,b){return a.localeCompare(b,'ru');}).forEach(function(g){
   3370:         var gid='ep_sub_'+type+'_'+(i++);
   3371:         html += '<div class="sub-cat-header" onclick="epDbToggle(&quot;'+gid+'&quot;, event)">'+esc(g)+' ▾</div><div class="sub-cat-body" id="'+gid+'">';
   3372:         cats[c][g].sort(function(a,b){return String(a.n||'').localeCompare(String(b.n||''),'ru');}).forEach(function(it){ html += catalogRow(type,it); });
```


## epSetDbScope

Найдено строк: 3350, 3351, 3409, 3410, 3611, 3612, 3659, 3660, 4800

### around line 3350

```js
   3338:     EP_MY_WORK = unique(EP_MY_WORK, 'work');
   3339:     EP_SERVER_MAT = unique(EP_SERVER_MAT, 'mat');
   3340:     EP_SERVER_WORK = unique(EP_SERVER_WORK, 'work');
   3341:     syncWindowCaches();
   3342:     epRefreshDbScopeUi();
   3343:   }
   3344: 
   3345:   function sourceSwitcherHtml(type){
   3346:     return '<div style="border:1px solid var(--primary);border-radius:14px;padding:10px;margin:0 0 12px;background:rgba(79,70,229,.06);">'+
   3347:       '<div style="font-weight:900;color:var(--primary);margin-bottom:6px;">Источник: '+(type==='work'?'Работы':'Материалы')+'</div>'+
   3348:       '<div style="font-size:11px;color:var(--gray);margin-bottom:8px;">В смету и каталог попадает только выбранный источник. Вперемешку не считаем.</div>'+
   3349:       '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;">'+
>> 3350:         '<button class="'+(scope()==='my'?'btn-success':'btn-info')+'" style="margin:0;padding:10px;" onclick="epSetDbScope(&quot;my&quot;); '+(type==='work'?'openWorkCatalog()':'openMatCatalog()')+'">👤 Моя база</button>'+
   3351:         '<button class="'+(scope()==='global'?'btn-success':'btn-info')+'" style="margin:0;padding:10px;" onclick="epSetDbScope(&quot;global&quot;); '+(type==='work'?'openWorkCatalog()':'openMatCatalog()')+'">🌍 База сервера</button>'+
   3352:       '</div>'+
   3353:     '</div>';
   3354:   }
   3355: 
   3356:   window.epDbToggle = function(id,e){ if(e) e.stopPropagation(); var el=$(id); if(el) el.classList.toggle('active'); };
   3357: 
   3358:   function renderCatalog(type){
   3359:     var arr = activeArr(type);
   3360:     var html = sourceSwitcherHtml(type);
   3361:     if(!arr.length){
   3362:       return html + '<div style="padding:16px;border:1px dashed var(--border);border-radius:14px;text-align:center;color:var(--gray);font-weight:800;">'+activeLabel()+' пустая.<br><br>'+(scope()==='my'?'Можно добавить вручную, импортом или взять позицию из базы сервера.':'После полного сброса база сервера пустая. Админ может заполнить её вручную или импортом.')+'</div>';
   3363:     }
   3364:     var cats={}, i=0;
   3365:     arr.forEach(function(it){ var c=it.c||'Разное'; var g=groupOf(it)||'Без группы'; if(!cats[c]) cats[c]={}; if(!cats[c][g]) cats[c][g]=[]; cats[c][g].push(it); });
   3366:     Object.keys(cats).sort(function(a,b){return a.localeCompare(b,'ru');}).forEach(function(c){
   3367:       var cid='ep_cat_'+type+'_'+(i++);
   3368:       html += '<div class="cat-header" onclick="epDbToggle(&quot;'+cid+'&quot;, event)">'+esc(c)+'</div><div class="cat-body" id="'+cid+'">';
   3369:       Object.keys(cats[c]).sort(function(a,b){return a.localeCompare(b,'ru');}).forEach(function(g){
   3370:         var gid='ep_sub_'+type+'_'+(i++);
   3371:         html += '<div class="sub-cat-header" onclick="epDbToggle(&quot;'+gid+'&quot;, event)">'+esc(g)+' ▾</div><div class="sub-cat-body" id="'+gid+'">';
   3372:         cats[c][g].sort(function(a,b){return String(a.n||'').localeCompare(String(b.n||''),'ru');}).forEach(function(it){ html += catalogRow(type,it); });
```

### around line 3351

```js
   3339:     EP_SERVER_MAT = unique(EP_SERVER_MAT, 'mat');
   3340:     EP_SERVER_WORK = unique(EP_SERVER_WORK, 'work');
   3341:     syncWindowCaches();
   3342:     epRefreshDbScopeUi();
   3343:   }
   3344: 
   3345:   function sourceSwitcherHtml(type){
   3346:     return '<div style="border:1px solid var(--primary);border-radius:14px;padding:10px;margin:0 0 12px;background:rgba(79,70,229,.06);">'+
   3347:       '<div style="font-weight:900;color:var(--primary);margin-bottom:6px;">Источник: '+(type==='work'?'Работы':'Материалы')+'</div>'+
   3348:       '<div style="font-size:11px;color:var(--gray);margin-bottom:8px;">В смету и каталог попадает только выбранный источник. Вперемешку не считаем.</div>'+
   3349:       '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;">'+
   3350:         '<button class="'+(scope()==='my'?'btn-success':'btn-info')+'" style="margin:0;padding:10px;" onclick="epSetDbScope(&quot;my&quot;); '+(type==='work'?'openWorkCatalog()':'openMatCatalog()')+'">👤 Моя база</button>'+
>> 3351:         '<button class="'+(scope()==='global'?'btn-success':'btn-info')+'" style="margin:0;padding:10px;" onclick="epSetDbScope(&quot;global&quot;); '+(type==='work'?'openWorkCatalog()':'openMatCatalog()')+'">🌍 База сервера</button>'+
   3352:       '</div>'+
   3353:     '</div>';
   3354:   }
   3355: 
   3356:   window.epDbToggle = function(id,e){ if(e) e.stopPropagation(); var el=$(id); if(el) el.classList.toggle('active'); };
   3357: 
   3358:   function renderCatalog(type){
   3359:     var arr = activeArr(type);
   3360:     var html = sourceSwitcherHtml(type);
   3361:     if(!arr.length){
   3362:       return html + '<div style="padding:16px;border:1px dashed var(--border);border-radius:14px;text-align:center;color:var(--gray);font-weight:800;">'+activeLabel()+' пустая.<br><br>'+(scope()==='my'?'Можно добавить вручную, импортом или взять позицию из базы сервера.':'После полного сброса база сервера пустая. Админ может заполнить её вручную или импортом.')+'</div>';
   3363:     }
   3364:     var cats={}, i=0;
   3365:     arr.forEach(function(it){ var c=it.c||'Разное'; var g=groupOf(it)||'Без группы'; if(!cats[c]) cats[c]={}; if(!cats[c][g]) cats[c][g]=[]; cats[c][g].push(it); });
   3366:     Object.keys(cats).sort(function(a,b){return a.localeCompare(b,'ru');}).forEach(function(c){
   3367:       var cid='ep_cat_'+type+'_'+(i++);
   3368:       html += '<div class="cat-header" onclick="epDbToggle(&quot;'+cid+'&quot;, event)">'+esc(c)+'</div><div class="cat-body" id="'+cid+'">';
   3369:       Object.keys(cats[c]).sort(function(a,b){return a.localeCompare(b,'ru');}).forEach(function(g){
   3370:         var gid='ep_sub_'+type+'_'+(i++);
   3371:         html += '<div class="sub-cat-header" onclick="epDbToggle(&quot;'+gid+'&quot;, event)">'+esc(g)+' ▾</div><div class="sub-cat-body" id="'+gid+'">';
   3372:         cats[c][g].sort(function(a,b){return String(a.n||'').localeCompare(String(b.n||''),'ru');}).forEach(function(it){ html += catalogRow(type,it); });
   3373:         html += '</div>';
```

### around line 3409

```js
   3397:     if(q) q.value=1;
   3398:     if(typeof openModal==='function') openModal('qtyPromptModal');
   3399:   };
   3400: 
   3401:   function editorTop(type){
   3402:     var title=type==='work'?'работ':'материалов';
   3403:     var s=scope(), admin=isAdmin(), editable=canEditActive();
   3404:     var hint=s==='my'?'Редактируется личная база мастера.':(admin?'Редактируется база сервера.':'Сервер открыт только для просмотра и копирования в мою базу.');
   3405:     var html='<div style="border:1px solid var(--primary);border-radius:14px;padding:10px;margin:0 0 12px;background:rgba(79,70,229,.05);">'+
   3406:       '<div style="font-weight:900;color:var(--primary);">'+label()+' — '+title+'</div>'+
   3407:       '<div style="font-size:11px;color:var(--gray);font-weight:800;margin-top:4px;">'+hint+' Позиций: '+active(type).length+'.</div>'+
   3408:       '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:8px;">'+
>> 3409:       '<button class="'+(s==='my'?'btn-success':'btn-info')+'" style="margin:0;padding:10px;" onclick="epSetDbScope(\'my\')">👤 Моя база</button>'+
   3410:       '<button class="'+(s==='global'?'btn-success':'btn-info')+'" style="margin:0;padding:10px;" onclick="epSetDbScope(\'global\')">🌍 База сервера</button></div>';
   3411:     if(editable){
   3412:       html+='<div style="border:1px dashed var(--border);border-radius:12px;padding:8px;margin-top:8px;background:rgba(255,255,255,.35);">'+
   3413:         '<div style="font-weight:900;color:var(--primary);font-size:12px;margin-bottom:6px;">Массовые действия: выделить → перенести / удалить</div>'+
   3414:         '<input id="ep-v15-move-cat-'+type+'" placeholder="Категория, куда перенести" style="margin-bottom:6px;">'+
   3415:         '<input id="ep-v15-move-sub-'+type+'" placeholder="Группа / подкатегория" style="margin-bottom:8px;">'+
   3416:         '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;">'+
   3417:         '<button class="btn-info" style="margin:0;padding:9px;" onclick="epV15SelectVisible(\''+type+'\',true)">✅ Выделить</button>'+
   3418:         '<button class="btn-vendor" style="margin:0;padding:9px;" onclick="epV15SelectVisible(\''+type+'\',false)">⬜ Снять</button>'+
   3419:         '<button class="btn-success" style="margin:0;padding:9px;" onclick="epV15MoveSelectedActive(\''+type+'\')">📦 Перенести</button>'+
   3420:         '<button class="btn-danger" style="margin:0;padding:9px;" onclick="epDeleteSelectedActiveV7()">🗑 Удалить выбранные</button></div></div>'+
   3421:         '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:8px;"><button class="btn-success" style="margin:0;padding:9px;" onclick="epSaveActiveDbV7()">💾 Сохранить</button><button class="btn-info" style="margin:0;padding:9px;" onclick="epReloadActiveDbV7()">🔄 Обновить</button></div>';
   3422:     }
   3423:     if(s==='global'&&!admin){ html+='<div class="ep-v7-note">Серверные цены и позиции мастер не меняет. Для своей сметы нажми «В мою».</div>'; }
   3424:     return html+'</div>';
   3425:   }
   3426: 
   3427:   
   3428: 
   3429: 
   3430: /* =========================================================
   3431:  * DATABASE FUNCTION: syncWindowCaches
```

### around line 3410

```js
   3398:     if(typeof openModal==='function') openModal('qtyPromptModal');
   3399:   };
   3400: 
   3401:   function editorTop(type){
   3402:     var title=type==='work'?'работ':'материалов';
   3403:     var s=scope(), admin=isAdmin(), editable=canEditActive();
   3404:     var hint=s==='my'?'Редактируется личная база мастера.':(admin?'Редактируется база сервера.':'Сервер открыт только для просмотра и копирования в мою базу.');
   3405:     var html='<div style="border:1px solid var(--primary);border-radius:14px;padding:10px;margin:0 0 12px;background:rgba(79,70,229,.05);">'+
   3406:       '<div style="font-weight:900;color:var(--primary);">'+label()+' — '+title+'</div>'+
   3407:       '<div style="font-size:11px;color:var(--gray);font-weight:800;margin-top:4px;">'+hint+' Позиций: '+active(type).length+'.</div>'+
   3408:       '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:8px;">'+
   3409:       '<button class="'+(s==='my'?'btn-success':'btn-info')+'" style="margin:0;padding:10px;" onclick="epSetDbScope(\'my\')">👤 Моя база</button>'+
>> 3410:       '<button class="'+(s==='global'?'btn-success':'btn-info')+'" style="margin:0;padding:10px;" onclick="epSetDbScope(\'global\')">🌍 База сервера</button></div>';
   3411:     if(editable){
   3412:       html+='<div style="border:1px dashed var(--border);border-radius:12px;padding:8px;margin-top:8px;background:rgba(255,255,255,.35);">'+
   3413:         '<div style="font-weight:900;color:var(--primary);font-size:12px;margin-bottom:6px;">Массовые действия: выделить → перенести / удалить</div>'+
   3414:         '<input id="ep-v15-move-cat-'+type+'" placeholder="Категория, куда перенести" style="margin-bottom:6px;">'+
   3415:         '<input id="ep-v15-move-sub-'+type+'" placeholder="Группа / подкатегория" style="margin-bottom:8px;">'+
   3416:         '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;">'+
   3417:         '<button class="btn-info" style="margin:0;padding:9px;" onclick="epV15SelectVisible(\''+type+'\',true)">✅ Выделить</button>'+
   3418:         '<button class="btn-vendor" style="margin:0;padding:9px;" onclick="epV15SelectVisible(\''+type+'\',false)">⬜ Снять</button>'+
   3419:         '<button class="btn-success" style="margin:0;padding:9px;" onclick="epV15MoveSelectedActive(\''+type+'\')">📦 Перенести</button>'+
   3420:         '<button class="btn-danger" style="margin:0;padding:9px;" onclick="epDeleteSelectedActiveV7()">🗑 Удалить выбранные</button></div></div>'+
   3421:         '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:8px;"><button class="btn-success" style="margin:0;padding:9px;" onclick="epSaveActiveDbV7()">💾 Сохранить</button><button class="btn-info" style="margin:0;padding:9px;" onclick="epReloadActiveDbV7()">🔄 Обновить</button></div>';
   3422:     }
   3423:     if(s==='global'&&!admin){ html+='<div class="ep-v7-note">Серверные цены и позиции мастер не меняет. Для своей сметы нажми «В мою».</div>'; }
   3424:     return html+'</div>';
   3425:   }
   3426: 
   3427:   
   3428: 
   3429: 
   3430: /* =========================================================
   3431:  * DATABASE FUNCTION: syncWindowCaches
   3432:  * ========================================================= */
```

### around line 3611

```js
   3599: 
   3600:   
   3601: 
   3602: 
   3603: /* =========================================================
   3604:  * DATABASE FUNCTION: sourceSwitcherHtml
   3605:  * ========================================================= */
   3606: function sourceSwitcherHtml(type){
   3607:     return '<div style="border:1px solid var(--primary);border-radius:14px;padding:10px;margin:0 0 12px;background:rgba(79,70,229,.06);">'+
   3608:       '<div style="font-weight:900;color:var(--primary);margin-bottom:6px;">Источник: '+(type==='work'?'Работы':'Материалы')+'</div>'+
   3609:       '<div style="font-size:11px;color:var(--gray);margin-bottom:8px;">В смету и каталог попадает только выбранный источник. Вперемешку не считаем.</div>'+
   3610:       '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;">'+
>> 3611:         '<button class="'+(scope()==='my'?'btn-success':'btn-info')+'" style="margin:0;padding:10px;" onclick="epSetDbScope(&quot;my&quot;); '+(type==='work'?'openWorkCatalog()':'openMatCatalog()')+'">👤 Моя база</button>'+
   3612:         '<button class="'+(scope()==='global'?'btn-success':'btn-info')+'" style="margin:0;padding:10px;" onclick="epSetDbScope(&quot;global&quot;); '+(type==='work'?'openWorkCatalog()':'openMatCatalog()')+'">🌍 База сервера</button>'+
   3613:       '</div>'+
   3614:     '</div>';
   3615:   }
   3616: 
   3617:   
   3618: 
   3619: 
   3620: /* =========================================================
   3621:  * DATABASE FUNCTION: renderCatalog
   3622:  * ========================================================= */
   3623: function renderCatalog(type){
   3624:     var arr = activeArr(type);
   3625:     var html = sourceSwitcherHtml(type);
   3626:     if(!arr.length){
   3627:       return html + '<div style="padding:16px;border:1px dashed var(--border);border-radius:14px;text-align:center;color:var(--gray);font-weight:800;">'+activeLabel()+' пустая.<br><br>'+(scope()==='my'?'Можно добавить вручную, импортом или взять позицию из базы сервера.':'После полного сброса база сервера пустая. Админ может заполнить её вручную или импортом.')+'</div>';
   3628:     }
   3629:     var cats={}, i=0;
   3630:     arr.forEach(function(it){ var c=it.c||'Разное'; var g=groupOf(it)||'Без группы'; if(!cats[c]) cats[c]={}; if(!cats[c][g]) cats[c][g]=[]; cats[c][g].push(it); });
   3631:     Object.keys(cats).sort(function(a,b){return a.localeCompare(b,'ru');}).forEach(function(c){
   3632:       var cid='ep_cat_'+type+'_'+(i++);
   3633:       html += '<div class="cat-header" onclick="epDbToggle(&quot;'+cid+'&quot;, event)">'+esc(c)+'</div><div class="cat-body" id="'+cid+'">';
```


## epReloadActiveDbV7

Найдено строк: 3421, 3671, 4508

### around line 3421

```js
   3409:       '<button class="'+(s==='my'?'btn-success':'btn-info')+'" style="margin:0;padding:10px;" onclick="epSetDbScope(\'my\')">👤 Моя база</button>'+
   3410:       '<button class="'+(s==='global'?'btn-success':'btn-info')+'" style="margin:0;padding:10px;" onclick="epSetDbScope(\'global\')">🌍 База сервера</button></div>';
   3411:     if(editable){
   3412:       html+='<div style="border:1px dashed var(--border);border-radius:12px;padding:8px;margin-top:8px;background:rgba(255,255,255,.35);">'+
   3413:         '<div style="font-weight:900;color:var(--primary);font-size:12px;margin-bottom:6px;">Массовые действия: выделить → перенести / удалить</div>'+
   3414:         '<input id="ep-v15-move-cat-'+type+'" placeholder="Категория, куда перенести" style="margin-bottom:6px;">'+
   3415:         '<input id="ep-v15-move-sub-'+type+'" placeholder="Группа / подкатегория" style="margin-bottom:8px;">'+
   3416:         '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;">'+
   3417:         '<button class="btn-info" style="margin:0;padding:9px;" onclick="epV15SelectVisible(\''+type+'\',true)">✅ Выделить</button>'+
   3418:         '<button class="btn-vendor" style="margin:0;padding:9px;" onclick="epV15SelectVisible(\''+type+'\',false)">⬜ Снять</button>'+
   3419:         '<button class="btn-success" style="margin:0;padding:9px;" onclick="epV15MoveSelectedActive(\''+type+'\')">📦 Перенести</button>'+
   3420:         '<button class="btn-danger" style="margin:0;padding:9px;" onclick="epDeleteSelectedActiveV7()">🗑 Удалить выбранные</button></div></div>'+
>> 3421:         '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:8px;"><button class="btn-success" style="margin:0;padding:9px;" onclick="epSaveActiveDbV7()">💾 Сохранить</button><button class="btn-info" style="margin:0;padding:9px;" onclick="epReloadActiveDbV7()">🔄 Обновить</button></div>';
   3422:     }
   3423:     if(s==='global'&&!admin){ html+='<div class="ep-v7-note">Серверные цены и позиции мастер не меняет. Для своей сметы нажми «В мою».</div>'; }
   3424:     return html+'</div>';
   3425:   }
   3426: 
   3427:   
   3428: 
   3429: 
   3430: /* =========================================================
   3431:  * DATABASE FUNCTION: syncWindowCaches
   3432:  * ========================================================= */
   3433: function syncWindowCaches(){
   3434:     try{
   3435:       window.EP_MY_MAT = EP_MY_MAT;
   3436:       window.EP_MY_WORK = EP_MY_WORK;
   3437:       window.EP_GLOBAL_MAT = EP_SERVER_MAT;
   3438:       window.EP_GLOBAL_WORK = EP_SERVER_WORK;
   3439:       window.EP_FORCE_GLOBAL = {matDB:EP_SERVER_MAT, workDB:EP_SERVER_WORK};
   3440:       window.EP_ULTIMATE_DB_CACHE = {matDB:EP_SERVER_MAT, workDB:EP_SERVER_WORK, ts:Date.now()};
   3441:       window.EP_GLOBAL_DB_VISIBLE_CACHE = {matDB:EP_SERVER_MAT, workDB:EP_SERVER_WORK, ts:Date.now()};
   3442:       window.userMatDB = EP_MY_MAT;
   3443:       window.userWorkDB = EP_MY_WORK;
```

### around line 3671

```js
   3659:       '<button class="'+(s==='my'?'btn-success':'btn-info')+'" style="margin:0;padding:10px;" onclick="epSetDbScope(\'my\')">👤 Моя база</button>'+
   3660:       '<button class="'+(s==='global'?'btn-success':'btn-info')+'" style="margin:0;padding:10px;" onclick="epSetDbScope(\'global\')">🌍 База сервера</button></div>';
   3661:     if(editable){
   3662:       html+='<div style="border:1px dashed var(--border);border-radius:12px;padding:8px;margin-top:8px;background:rgba(255,255,255,.35);">'+
   3663:         '<div style="font-weight:900;color:var(--primary);font-size:12px;margin-bottom:6px;">Массовые действия: выделить → перенести / удалить</div>'+
   3664:         '<input id="ep-v15-move-cat-'+type+'" placeholder="Категория, куда перенести" style="margin-bottom:6px;">'+
   3665:         '<input id="ep-v15-move-sub-'+type+'" placeholder="Группа / подкатегория" style="margin-bottom:8px;">'+
   3666:         '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;">'+
   3667:         '<button class="btn-info" style="margin:0;padding:9px;" onclick="epV15SelectVisible(\''+type+'\',true)">✅ Выделить</button>'+
   3668:         '<button class="btn-vendor" style="margin:0;padding:9px;" onclick="epV15SelectVisible(\''+type+'\',false)">⬜ Снять</button>'+
   3669:         '<button class="btn-success" style="margin:0;padding:9px;" onclick="epV15MoveSelectedActive(\''+type+'\')">📦 Перенести</button>'+
   3670:         '<button class="btn-danger" style="margin:0;padding:9px;" onclick="epDeleteSelectedActiveV7()">🗑 Удалить выбранные</button></div></div>'+
>> 3671:         '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:8px;"><button class="btn-success" style="margin:0;padding:9px;" onclick="epSaveActiveDbV7()">💾 Сохранить</button><button class="btn-info" style="margin:0;padding:9px;" onclick="epReloadActiveDbV7()">🔄 Обновить</button></div>';
   3672:     }
   3673:     if(s==='global'&&!admin){ html+='<div class="ep-v7-note">Серверные цены и позиции мастер не меняет. Для своей сметы нажми «В мою».</div>'; }
   3674:     return html+'</div>';
   3675:   }
   3676: 
   3677:   
   3678: 
   3679: 
   3680: /* =========================================================
   3681:  * DATABASE FUNCTION: renderDbRows
   3682:  * ========================================================= */
   3683: function renderDbRows(type){
   3684:     var arr=activeArr(type);
   3685:     var html=editorTop(type);
   3686:     if(!arr.length){
   3687:       html += '<div style="padding:15px;border:1px dashed var(--border);border-radius:12px;text-align:center;color:var(--gray);font-weight:800;">'+activeLabel()+' пустая.</div>';
   3688:       return html;
   3689:     }
   3690:     var cats={}, i=0;
   3691:     arr.forEach(function(it){ var c=it.c||'Разное'; var g=groupOf(it)||'Без группы'; if(!cats[c]) cats[c]={}; if(!cats[c][g]) cats[c][g]=[]; cats[c][g].push(it); });
   3692:     Object.keys(cats).sort(function(a,b){return a.localeCompare(b,'ru');}).forEach(function(c){
   3693:       var cid='db_cat_'+type+'_'+(i++);
```

### around line 4508

```js
   4496:     if(my || admin){
   4497:       html+='<button class="btn-info" onclick="epTriggerDbFileImport(\'mat\')">📥 Импорт материалов</button>'+
   4498:             '<button class="btn-work" onclick="epTriggerDbFileImport(\'work\')">📥 Импорт работ</button>'+
   4499:             '<button class="btn-vendor" onclick="epOpenTextImport && epOpenTextImport(\'mat\')">📝 Материалы текстом</button>'+
   4500:             '<button class="btn-vendor" onclick="epOpenTextImport && epOpenTextImport(\'work\')">📝 Работы текстом</button>';
   4501:     } else {
   4502:       html+='<button class="btn-info" onclick="epTriggerServerProposalImportV7(\'mat\')">📨 Материалы заявкой админу</button>'+
   4503:             '<button class="btn-work" onclick="epTriggerServerProposalImportV7(\'work\')">📨 Работы заявкой админу</button>'+
   4504:             '<button class="btn-vendor" onclick="epOpenTextImportServerProposalV7(\'mat\')">📝 Материалы заявкой</button>'+
   4505:             '<button class="btn-vendor" onclick="epOpenTextImportServerProposalV7(\'work\')">📝 Работы заявкой</button>';
   4506:     }
   4507:     html+='<button class="btn-success" onclick="epExportActiveDb()">📤 Экспорт этой базы</button>'+
>> 4508:           '<button class="btn-info" onclick="epReloadActiveDbV7()">🔄 Обновить / перезагрузить</button>';
   4509:     if(canEditActive()) html+='<button class="btn-primary" onclick="epSaveActiveDbV7()">💾 Сохранить базу</button>';
   4510:     if(my) html+='<button class="btn-danger" onclick="epOpenDbFactoryResetModal && epOpenDbFactoryResetModal()">🧹 Очистка / сброс</button>';
   4511:     else if(admin) html+='<button class="btn-danger" onclick="epOpenDbFactoryResetModal && epOpenDbFactoryResetModal()">🧹 Очистка сервера</button>';
   4512:     html+='</div>';
   4513:     if(!my && !admin) html+='<div class="ep-v7-note">Редактирование, сохранение, замена и цены сервера заблокированы для мастера.</div>';
   4514:     p.innerHTML=html;
   4515:   }
   4516:   
   4517: 
   4518: 
   4519: /* =========================================================
   4520:  * DATABASE FUNCTION: tuneStaticBlocks
   4521:  * ========================================================= */
   4522: function tuneStaticBlocks(){
   4523:     renderPanel();
   4524:     var my=$('ep-scope-my-btn'), gl=$('ep-scope-global-btn'), st=$('ep-db-scope-status');
   4525:     if(my){ my.className=scope()==='my'?'btn-success':'btn-info'; my.textContent='👤 Моя база данных'; }
   4526:     if(gl){ gl.className=scope()==='global'?'btn-success':'btn-info'; gl.textContent='🌍 База сервера'; }
   4527:     if(st) st.innerHTML='Главный переключатель: <b>'+label()+'</b>. Отображение и расчёт идут только из выбранного источника.';
   4528:     var old=$('ep-db-ai-tools'); if(old) old.style.display='none';
   4529:     var clean=$('ep-clean-status-line'); if(clean) clean.textContent='Активная база: '+label()+'. Материалы: '+active('mat').length+', работы: '+active('work').length+'.';
   4530:     var addBtn=document.querySelector('#settModal button[onclick="addDbItem()"]');
```


## epSaveActiveDbV7

Найдено строк: 3421, 3671, 4509

### around line 3421

```js
   3409:       '<button class="'+(s==='my'?'btn-success':'btn-info')+'" style="margin:0;padding:10px;" onclick="epSetDbScope(\'my\')">👤 Моя база</button>'+
   3410:       '<button class="'+(s==='global'?'btn-success':'btn-info')+'" style="margin:0;padding:10px;" onclick="epSetDbScope(\'global\')">🌍 База сервера</button></div>';
   3411:     if(editable){
   3412:       html+='<div style="border:1px dashed var(--border);border-radius:12px;padding:8px;margin-top:8px;background:rgba(255,255,255,.35);">'+
   3413:         '<div style="font-weight:900;color:var(--primary);font-size:12px;margin-bottom:6px;">Массовые действия: выделить → перенести / удалить</div>'+
   3414:         '<input id="ep-v15-move-cat-'+type+'" placeholder="Категория, куда перенести" style="margin-bottom:6px;">'+
   3415:         '<input id="ep-v15-move-sub-'+type+'" placeholder="Группа / подкатегория" style="margin-bottom:8px;">'+
   3416:         '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;">'+
   3417:         '<button class="btn-info" style="margin:0;padding:9px;" onclick="epV15SelectVisible(\''+type+'\',true)">✅ Выделить</button>'+
   3418:         '<button class="btn-vendor" style="margin:0;padding:9px;" onclick="epV15SelectVisible(\''+type+'\',false)">⬜ Снять</button>'+
   3419:         '<button class="btn-success" style="margin:0;padding:9px;" onclick="epV15MoveSelectedActive(\''+type+'\')">📦 Перенести</button>'+
   3420:         '<button class="btn-danger" style="margin:0;padding:9px;" onclick="epDeleteSelectedActiveV7()">🗑 Удалить выбранные</button></div></div>'+
>> 3421:         '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:8px;"><button class="btn-success" style="margin:0;padding:9px;" onclick="epSaveActiveDbV7()">💾 Сохранить</button><button class="btn-info" style="margin:0;padding:9px;" onclick="epReloadActiveDbV7()">🔄 Обновить</button></div>';
   3422:     }
   3423:     if(s==='global'&&!admin){ html+='<div class="ep-v7-note">Серверные цены и позиции мастер не меняет. Для своей сметы нажми «В мою».</div>'; }
   3424:     return html+'</div>';
   3425:   }
   3426: 
   3427:   
   3428: 
   3429: 
   3430: /* =========================================================
   3431:  * DATABASE FUNCTION: syncWindowCaches
   3432:  * ========================================================= */
   3433: function syncWindowCaches(){
   3434:     try{
   3435:       window.EP_MY_MAT = EP_MY_MAT;
   3436:       window.EP_MY_WORK = EP_MY_WORK;
   3437:       window.EP_GLOBAL_MAT = EP_SERVER_MAT;
   3438:       window.EP_GLOBAL_WORK = EP_SERVER_WORK;
   3439:       window.EP_FORCE_GLOBAL = {matDB:EP_SERVER_MAT, workDB:EP_SERVER_WORK};
   3440:       window.EP_ULTIMATE_DB_CACHE = {matDB:EP_SERVER_MAT, workDB:EP_SERVER_WORK, ts:Date.now()};
   3441:       window.EP_GLOBAL_DB_VISIBLE_CACHE = {matDB:EP_SERVER_MAT, workDB:EP_SERVER_WORK, ts:Date.now()};
   3442:       window.userMatDB = EP_MY_MAT;
   3443:       window.userWorkDB = EP_MY_WORK;
```

### around line 3671

```js
   3659:       '<button class="'+(s==='my'?'btn-success':'btn-info')+'" style="margin:0;padding:10px;" onclick="epSetDbScope(\'my\')">👤 Моя база</button>'+
   3660:       '<button class="'+(s==='global'?'btn-success':'btn-info')+'" style="margin:0;padding:10px;" onclick="epSetDbScope(\'global\')">🌍 База сервера</button></div>';
   3661:     if(editable){
   3662:       html+='<div style="border:1px dashed var(--border);border-radius:12px;padding:8px;margin-top:8px;background:rgba(255,255,255,.35);">'+
   3663:         '<div style="font-weight:900;color:var(--primary);font-size:12px;margin-bottom:6px;">Массовые действия: выделить → перенести / удалить</div>'+
   3664:         '<input id="ep-v15-move-cat-'+type+'" placeholder="Категория, куда перенести" style="margin-bottom:6px;">'+
   3665:         '<input id="ep-v15-move-sub-'+type+'" placeholder="Группа / подкатегория" style="margin-bottom:8px;">'+
   3666:         '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;">'+
   3667:         '<button class="btn-info" style="margin:0;padding:9px;" onclick="epV15SelectVisible(\''+type+'\',true)">✅ Выделить</button>'+
   3668:         '<button class="btn-vendor" style="margin:0;padding:9px;" onclick="epV15SelectVisible(\''+type+'\',false)">⬜ Снять</button>'+
   3669:         '<button class="btn-success" style="margin:0;padding:9px;" onclick="epV15MoveSelectedActive(\''+type+'\')">📦 Перенести</button>'+
   3670:         '<button class="btn-danger" style="margin:0;padding:9px;" onclick="epDeleteSelectedActiveV7()">🗑 Удалить выбранные</button></div></div>'+
>> 3671:         '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:8px;"><button class="btn-success" style="margin:0;padding:9px;" onclick="epSaveActiveDbV7()">💾 Сохранить</button><button class="btn-info" style="margin:0;padding:9px;" onclick="epReloadActiveDbV7()">🔄 Обновить</button></div>';
   3672:     }
   3673:     if(s==='global'&&!admin){ html+='<div class="ep-v7-note">Серверные цены и позиции мастер не меняет. Для своей сметы нажми «В мою».</div>'; }
   3674:     return html+'</div>';
   3675:   }
   3676: 
   3677:   
   3678: 
   3679: 
   3680: /* =========================================================
   3681:  * DATABASE FUNCTION: renderDbRows
   3682:  * ========================================================= */
   3683: function renderDbRows(type){
   3684:     var arr=activeArr(type);
   3685:     var html=editorTop(type);
   3686:     if(!arr.length){
   3687:       html += '<div style="padding:15px;border:1px dashed var(--border);border-radius:12px;text-align:center;color:var(--gray);font-weight:800;">'+activeLabel()+' пустая.</div>';
   3688:       return html;
   3689:     }
   3690:     var cats={}, i=0;
   3691:     arr.forEach(function(it){ var c=it.c||'Разное'; var g=groupOf(it)||'Без группы'; if(!cats[c]) cats[c]={}; if(!cats[c][g]) cats[c][g]=[]; cats[c][g].push(it); });
   3692:     Object.keys(cats).sort(function(a,b){return a.localeCompare(b,'ru');}).forEach(function(c){
   3693:       var cid='db_cat_'+type+'_'+(i++);
```

### around line 4509

```js
   4497:       html+='<button class="btn-info" onclick="epTriggerDbFileImport(\'mat\')">📥 Импорт материалов</button>'+
   4498:             '<button class="btn-work" onclick="epTriggerDbFileImport(\'work\')">📥 Импорт работ</button>'+
   4499:             '<button class="btn-vendor" onclick="epOpenTextImport && epOpenTextImport(\'mat\')">📝 Материалы текстом</button>'+
   4500:             '<button class="btn-vendor" onclick="epOpenTextImport && epOpenTextImport(\'work\')">📝 Работы текстом</button>';
   4501:     } else {
   4502:       html+='<button class="btn-info" onclick="epTriggerServerProposalImportV7(\'mat\')">📨 Материалы заявкой админу</button>'+
   4503:             '<button class="btn-work" onclick="epTriggerServerProposalImportV7(\'work\')">📨 Работы заявкой админу</button>'+
   4504:             '<button class="btn-vendor" onclick="epOpenTextImportServerProposalV7(\'mat\')">📝 Материалы заявкой</button>'+
   4505:             '<button class="btn-vendor" onclick="epOpenTextImportServerProposalV7(\'work\')">📝 Работы заявкой</button>';
   4506:     }
   4507:     html+='<button class="btn-success" onclick="epExportActiveDb()">📤 Экспорт этой базы</button>'+
   4508:           '<button class="btn-info" onclick="epReloadActiveDbV7()">🔄 Обновить / перезагрузить</button>';
>> 4509:     if(canEditActive()) html+='<button class="btn-primary" onclick="epSaveActiveDbV7()">💾 Сохранить базу</button>';
   4510:     if(my) html+='<button class="btn-danger" onclick="epOpenDbFactoryResetModal && epOpenDbFactoryResetModal()">🧹 Очистка / сброс</button>';
   4511:     else if(admin) html+='<button class="btn-danger" onclick="epOpenDbFactoryResetModal && epOpenDbFactoryResetModal()">🧹 Очистка сервера</button>';
   4512:     html+='</div>';
   4513:     if(!my && !admin) html+='<div class="ep-v7-note">Редактирование, сохранение, замена и цены сервера заблокированы для мастера.</div>';
   4514:     p.innerHTML=html;
   4515:   }
   4516:   
   4517: 
   4518: 
   4519: /* =========================================================
   4520:  * DATABASE FUNCTION: tuneStaticBlocks
   4521:  * ========================================================= */
   4522: function tuneStaticBlocks(){
   4523:     renderPanel();
   4524:     var my=$('ep-scope-my-btn'), gl=$('ep-scope-global-btn'), st=$('ep-db-scope-status');
   4525:     if(my){ my.className=scope()==='my'?'btn-success':'btn-info'; my.textContent='👤 Моя база данных'; }
   4526:     if(gl){ gl.className=scope()==='global'?'btn-success':'btn-info'; gl.textContent='🌍 База сервера'; }
   4527:     if(st) st.innerHTML='Главный переключатель: <b>'+label()+'</b>. Отображение и расчёт идут только из выбранного источника.';
   4528:     var old=$('ep-db-ai-tools'); if(old) old.style.display='none';
   4529:     var clean=$('ep-clean-status-line'); if(clean) clean.textContent='Активная база: '+label()+'. Материалы: '+active('mat').length+', работы: '+active('work').length+'.';
   4530:     var addBtn=document.querySelector('#settModal button[onclick="addDbItem()"]');
   4531:     var addBlock=null;
```


## matDB

Найдено строк: 98, 99, 111, 112, 154, 172, 198, 232, 386, 404, 418, 1072, 1077, 1118, 1120, 1136, 1138, 1360, 1367, 1493

### around line 98

```js
   86:     
   87:     let savedTheme = safeGet('theme_v31', 'light'); changeTheme(savedTheme); document.getElementById('theme-select').value = savedTheme;
   88:     document.getElementById('m-coeff').value = coeffs.mat; document.getElementById('w-coeff').value = coeffs.work;
   89:     document.getElementById('qr-tg').value = safeGet('qr_tg_v31', ''); 
   90:     document.getElementById('qr-wa').value = safeGet('qr_wa_v31', '');
   91:     document.getElementById('qr-vk').value = safeGet('qr_vk_v31', '');
   92:     document.getElementById('ai-shops').value = safeGet('ai_shops_v31', 'Лемана ПРО, ВсеИнструменты, Петрович');
   93: 
   94:     showLoader('Синхронизация...', '☁️');
   95:     try {
   96:         if(db) {
   97:             const dbDoc = await db.collection('settings').doc('global_db').get();
>> 98:             if(dbDoc.exists) { matDB = dbDoc.data().matDB || FULL_MAT_INIT; workDB = dbDoc.data().workDB || FULL_WORK_INIT; }
   99:             else { matDB = FULL_MAT_INIT; workDB = FULL_WORK_INIT; }
   100:             const logicDoc = await db.collection('settings').doc('global_logic').get();
   101:             if(logicDoc.exists) appLogic = Object.assign(appLogic, logicDoc.data());
   102:             
   103:             const histSnap = await db.collection('history').get();
   104:             hDB = histSnap.docs.map(doc => doc.data());
   105:             const draftDoc = await db.collection('drafts').doc(appUser.uid).get();
   106:             if(draftDoc.exists && currentEstimate.length === 0) { 
   107:                 currentEstimate = draftDoc.data().estimate || []; 
   108:                 let c = draftDoc.data().cust;
   109:                 if(c) { cust = c; safeSet('cust_v31', JSON.stringify(cust)); }
   110:             }
   111:         } else { matDB = FULL_MAT_INIT; workDB = FULL_WORK_INIT; }
   112:     } catch(e) { matDB = FULL_MAT_INIT; workDB = FULL_WORK_INIT; console.error(e); }
   113:     
   114:     hideLoader(); updateMasterBadge(); renderMainTable(); updateHistList();
   115:     if(!(cust && cust.name)) { setTimeout(() => { openModal('custModal'); }, 400); }
   116: }
   117: 
   118: 
   119: 
   120: 
```

### around line 99

```js
   87:     let savedTheme = safeGet('theme_v31', 'light'); changeTheme(savedTheme); document.getElementById('theme-select').value = savedTheme;
   88:     document.getElementById('m-coeff').value = coeffs.mat; document.getElementById('w-coeff').value = coeffs.work;
   89:     document.getElementById('qr-tg').value = safeGet('qr_tg_v31', ''); 
   90:     document.getElementById('qr-wa').value = safeGet('qr_wa_v31', '');
   91:     document.getElementById('qr-vk').value = safeGet('qr_vk_v31', '');
   92:     document.getElementById('ai-shops').value = safeGet('ai_shops_v31', 'Лемана ПРО, ВсеИнструменты, Петрович');
   93: 
   94:     showLoader('Синхронизация...', '☁️');
   95:     try {
   96:         if(db) {
   97:             const dbDoc = await db.collection('settings').doc('global_db').get();
   98:             if(dbDoc.exists) { matDB = dbDoc.data().matDB || FULL_MAT_INIT; workDB = dbDoc.data().workDB || FULL_WORK_INIT; }
>> 99:             else { matDB = FULL_MAT_INIT; workDB = FULL_WORK_INIT; }
   100:             const logicDoc = await db.collection('settings').doc('global_logic').get();
   101:             if(logicDoc.exists) appLogic = Object.assign(appLogic, logicDoc.data());
   102:             
   103:             const histSnap = await db.collection('history').get();
   104:             hDB = histSnap.docs.map(doc => doc.data());
   105:             const draftDoc = await db.collection('drafts').doc(appUser.uid).get();
   106:             if(draftDoc.exists && currentEstimate.length === 0) { 
   107:                 currentEstimate = draftDoc.data().estimate || []; 
   108:                 let c = draftDoc.data().cust;
   109:                 if(c) { cust = c; safeSet('cust_v31', JSON.stringify(cust)); }
   110:             }
   111:         } else { matDB = FULL_MAT_INIT; workDB = FULL_WORK_INIT; }
   112:     } catch(e) { matDB = FULL_MAT_INIT; workDB = FULL_WORK_INIT; console.error(e); }
   113:     
   114:     hideLoader(); updateMasterBadge(); renderMainTable(); updateHistList();
   115:     if(!(cust && cust.name)) { setTimeout(() => { openModal('custModal'); }, 400); }
   116: }
   117: 
   118: 
   119: 
   120: 
   121: /* =========================================================
```

### around line 111

```js
   99:             else { matDB = FULL_MAT_INIT; workDB = FULL_WORK_INIT; }
   100:             const logicDoc = await db.collection('settings').doc('global_logic').get();
   101:             if(logicDoc.exists) appLogic = Object.assign(appLogic, logicDoc.data());
   102:             
   103:             const histSnap = await db.collection('history').get();
   104:             hDB = histSnap.docs.map(doc => doc.data());
   105:             const draftDoc = await db.collection('drafts').doc(appUser.uid).get();
   106:             if(draftDoc.exists && currentEstimate.length === 0) { 
   107:                 currentEstimate = draftDoc.data().estimate || []; 
   108:                 let c = draftDoc.data().cust;
   109:                 if(c) { cust = c; safeSet('cust_v31', JSON.stringify(cust)); }
   110:             }
>> 111:         } else { matDB = FULL_MAT_INIT; workDB = FULL_WORK_INIT; }
   112:     } catch(e) { matDB = FULL_MAT_INIT; workDB = FULL_WORK_INIT; console.error(e); }
   113:     
   114:     hideLoader(); updateMasterBadge(); renderMainTable(); updateHistList();
   115:     if(!(cust && cust.name)) { setTimeout(() => { openModal('custModal'); }, 400); }
   116: }
   117: 
   118: 
   119: 
   120: 
   121: /* =========================================================
   122:  * DATABASE FUNCTION: openModal
   123:  * ========================================================= */
   124: function openModal(id) { 
   125:     if(id === 'custModal') loadCustHistoryOptions(); 
   126:     if(id === 'logicModal') renderLogicUI(); 
   127:     if(id === 'settModal') renderDbEditors(); 
   128:     if(id === 'configModal') populateShieldExtras();
   129:     if(id === 'buhModal') setTimeout(renderChart, 100);
   130:     document.getElementById(id).style.display='flex'; 
   131: }
   132: 
   133: 
```

### around line 112

```js
   100:             const logicDoc = await db.collection('settings').doc('global_logic').get();
   101:             if(logicDoc.exists) appLogic = Object.assign(appLogic, logicDoc.data());
   102:             
   103:             const histSnap = await db.collection('history').get();
   104:             hDB = histSnap.docs.map(doc => doc.data());
   105:             const draftDoc = await db.collection('drafts').doc(appUser.uid).get();
   106:             if(draftDoc.exists && currentEstimate.length === 0) { 
   107:                 currentEstimate = draftDoc.data().estimate || []; 
   108:                 let c = draftDoc.data().cust;
   109:                 if(c) { cust = c; safeSet('cust_v31', JSON.stringify(cust)); }
   110:             }
   111:         } else { matDB = FULL_MAT_INIT; workDB = FULL_WORK_INIT; }
>> 112:     } catch(e) { matDB = FULL_MAT_INIT; workDB = FULL_WORK_INIT; console.error(e); }
   113:     
   114:     hideLoader(); updateMasterBadge(); renderMainTable(); updateHistList();
   115:     if(!(cust && cust.name)) { setTimeout(() => { openModal('custModal'); }, 400); }
   116: }
   117: 
   118: 
   119: 
   120: 
   121: /* =========================================================
   122:  * DATABASE FUNCTION: openModal
   123:  * ========================================================= */
   124: function openModal(id) { 
   125:     if(id === 'custModal') loadCustHistoryOptions(); 
   126:     if(id === 'logicModal') renderLogicUI(); 
   127:     if(id === 'settModal') renderDbEditors(); 
   128:     if(id === 'configModal') populateShieldExtras();
   129:     if(id === 'buhModal') setTimeout(renderChart, 100);
   130:     document.getElementById(id).style.display='flex'; 
   131: }
   132: 
   133: 
   134: 
```

### around line 154

```js
   142: }
   143: 
   144: 
   145: 
   146: /* =========================================================
   147:  * DATABASE FUNCTION: openSwapModal
   148:  * ========================================================= */
   149: function openSwapModal(idx) {
   150:     swapTargetIdx = idx;
   151:     let current = currentEstimate[idx];
   152:     let sel = document.getElementById('swap-select');
   153:     let isMat = current.type === 'mat';
>> 154:     let dbToUse = isMat ? matDB : workDB;
   155:     
   156:     let opts = dbToUse.map(x => `<option value="${x.id}" ${x.n===current.n ? 'selected' : ''}>${x.n} (${x.p} ₽)</option>`).join('');
   157:     sel.innerHTML = opts;
   158:     openModal('swapModal');
   159: }
   160: 
   161: 
   162: 
   163: 
   164: /* =========================================================
   165:  * DATABASE FUNCTION: applySwap
   166:  * ========================================================= */
   167: function applySwap() {
   168:     if(swapTargetIdx < 0) return;
   169:     let selId = document.getElementById('swap-select').value;
   170:     let current = currentEstimate[swapTargetIdx];
   171:     let isMat = current.type === 'mat';
   172:     let dbToUse = isMat ? matDB : workDB;
   173:     let newItem = dbToUse.find(x => x.id === selId);
   174:     
   175:     if(newItem) {
   176:         currentEstimate[swapTargetIdx].n = newItem.n;
```


## workDB

Найдено строк: 98, 99, 111, 112, 154, 172, 215, 232, 418, 1073, 1089, 1118, 1120, 1136, 1138, 1360, 1367, 1494, 1500, 1517

### around line 98

```js
   86:     
   87:     let savedTheme = safeGet('theme_v31', 'light'); changeTheme(savedTheme); document.getElementById('theme-select').value = savedTheme;
   88:     document.getElementById('m-coeff').value = coeffs.mat; document.getElementById('w-coeff').value = coeffs.work;
   89:     document.getElementById('qr-tg').value = safeGet('qr_tg_v31', ''); 
   90:     document.getElementById('qr-wa').value = safeGet('qr_wa_v31', '');
   91:     document.getElementById('qr-vk').value = safeGet('qr_vk_v31', '');
   92:     document.getElementById('ai-shops').value = safeGet('ai_shops_v31', 'Лемана ПРО, ВсеИнструменты, Петрович');
   93: 
   94:     showLoader('Синхронизация...', '☁️');
   95:     try {
   96:         if(db) {
   97:             const dbDoc = await db.collection('settings').doc('global_db').get();
>> 98:             if(dbDoc.exists) { matDB = dbDoc.data().matDB || FULL_MAT_INIT; workDB = dbDoc.data().workDB || FULL_WORK_INIT; }
   99:             else { matDB = FULL_MAT_INIT; workDB = FULL_WORK_INIT; }
   100:             const logicDoc = await db.collection('settings').doc('global_logic').get();
   101:             if(logicDoc.exists) appLogic = Object.assign(appLogic, logicDoc.data());
   102:             
   103:             const histSnap = await db.collection('history').get();
   104:             hDB = histSnap.docs.map(doc => doc.data());
   105:             const draftDoc = await db.collection('drafts').doc(appUser.uid).get();
   106:             if(draftDoc.exists && currentEstimate.length === 0) { 
   107:                 currentEstimate = draftDoc.data().estimate || []; 
   108:                 let c = draftDoc.data().cust;
   109:                 if(c) { cust = c; safeSet('cust_v31', JSON.stringify(cust)); }
   110:             }
   111:         } else { matDB = FULL_MAT_INIT; workDB = FULL_WORK_INIT; }
   112:     } catch(e) { matDB = FULL_MAT_INIT; workDB = FULL_WORK_INIT; console.error(e); }
   113:     
   114:     hideLoader(); updateMasterBadge(); renderMainTable(); updateHistList();
   115:     if(!(cust && cust.name)) { setTimeout(() => { openModal('custModal'); }, 400); }
   116: }
   117: 
   118: 
   119: 
   120: 
```

### around line 99

```js
   87:     let savedTheme = safeGet('theme_v31', 'light'); changeTheme(savedTheme); document.getElementById('theme-select').value = savedTheme;
   88:     document.getElementById('m-coeff').value = coeffs.mat; document.getElementById('w-coeff').value = coeffs.work;
   89:     document.getElementById('qr-tg').value = safeGet('qr_tg_v31', ''); 
   90:     document.getElementById('qr-wa').value = safeGet('qr_wa_v31', '');
   91:     document.getElementById('qr-vk').value = safeGet('qr_vk_v31', '');
   92:     document.getElementById('ai-shops').value = safeGet('ai_shops_v31', 'Лемана ПРО, ВсеИнструменты, Петрович');
   93: 
   94:     showLoader('Синхронизация...', '☁️');
   95:     try {
   96:         if(db) {
   97:             const dbDoc = await db.collection('settings').doc('global_db').get();
   98:             if(dbDoc.exists) { matDB = dbDoc.data().matDB || FULL_MAT_INIT; workDB = dbDoc.data().workDB || FULL_WORK_INIT; }
>> 99:             else { matDB = FULL_MAT_INIT; workDB = FULL_WORK_INIT; }
   100:             const logicDoc = await db.collection('settings').doc('global_logic').get();
   101:             if(logicDoc.exists) appLogic = Object.assign(appLogic, logicDoc.data());
   102:             
   103:             const histSnap = await db.collection('history').get();
   104:             hDB = histSnap.docs.map(doc => doc.data());
   105:             const draftDoc = await db.collection('drafts').doc(appUser.uid).get();
   106:             if(draftDoc.exists && currentEstimate.length === 0) { 
   107:                 currentEstimate = draftDoc.data().estimate || []; 
   108:                 let c = draftDoc.data().cust;
   109:                 if(c) { cust = c; safeSet('cust_v31', JSON.stringify(cust)); }
   110:             }
   111:         } else { matDB = FULL_MAT_INIT; workDB = FULL_WORK_INIT; }
   112:     } catch(e) { matDB = FULL_MAT_INIT; workDB = FULL_WORK_INIT; console.error(e); }
   113:     
   114:     hideLoader(); updateMasterBadge(); renderMainTable(); updateHistList();
   115:     if(!(cust && cust.name)) { setTimeout(() => { openModal('custModal'); }, 400); }
   116: }
   117: 
   118: 
   119: 
   120: 
   121: /* =========================================================
```

### around line 111

```js
   99:             else { matDB = FULL_MAT_INIT; workDB = FULL_WORK_INIT; }
   100:             const logicDoc = await db.collection('settings').doc('global_logic').get();
   101:             if(logicDoc.exists) appLogic = Object.assign(appLogic, logicDoc.data());
   102:             
   103:             const histSnap = await db.collection('history').get();
   104:             hDB = histSnap.docs.map(doc => doc.data());
   105:             const draftDoc = await db.collection('drafts').doc(appUser.uid).get();
   106:             if(draftDoc.exists && currentEstimate.length === 0) { 
   107:                 currentEstimate = draftDoc.data().estimate || []; 
   108:                 let c = draftDoc.data().cust;
   109:                 if(c) { cust = c; safeSet('cust_v31', JSON.stringify(cust)); }
   110:             }
>> 111:         } else { matDB = FULL_MAT_INIT; workDB = FULL_WORK_INIT; }
   112:     } catch(e) { matDB = FULL_MAT_INIT; workDB = FULL_WORK_INIT; console.error(e); }
   113:     
   114:     hideLoader(); updateMasterBadge(); renderMainTable(); updateHistList();
   115:     if(!(cust && cust.name)) { setTimeout(() => { openModal('custModal'); }, 400); }
   116: }
   117: 
   118: 
   119: 
   120: 
   121: /* =========================================================
   122:  * DATABASE FUNCTION: openModal
   123:  * ========================================================= */
   124: function openModal(id) { 
   125:     if(id === 'custModal') loadCustHistoryOptions(); 
   126:     if(id === 'logicModal') renderLogicUI(); 
   127:     if(id === 'settModal') renderDbEditors(); 
   128:     if(id === 'configModal') populateShieldExtras();
   129:     if(id === 'buhModal') setTimeout(renderChart, 100);
   130:     document.getElementById(id).style.display='flex'; 
   131: }
   132: 
   133: 
```

### around line 112

```js
   100:             const logicDoc = await db.collection('settings').doc('global_logic').get();
   101:             if(logicDoc.exists) appLogic = Object.assign(appLogic, logicDoc.data());
   102:             
   103:             const histSnap = await db.collection('history').get();
   104:             hDB = histSnap.docs.map(doc => doc.data());
   105:             const draftDoc = await db.collection('drafts').doc(appUser.uid).get();
   106:             if(draftDoc.exists && currentEstimate.length === 0) { 
   107:                 currentEstimate = draftDoc.data().estimate || []; 
   108:                 let c = draftDoc.data().cust;
   109:                 if(c) { cust = c; safeSet('cust_v31', JSON.stringify(cust)); }
   110:             }
   111:         } else { matDB = FULL_MAT_INIT; workDB = FULL_WORK_INIT; }
>> 112:     } catch(e) { matDB = FULL_MAT_INIT; workDB = FULL_WORK_INIT; console.error(e); }
   113:     
   114:     hideLoader(); updateMasterBadge(); renderMainTable(); updateHistList();
   115:     if(!(cust && cust.name)) { setTimeout(() => { openModal('custModal'); }, 400); }
   116: }
   117: 
   118: 
   119: 
   120: 
   121: /* =========================================================
   122:  * DATABASE FUNCTION: openModal
   123:  * ========================================================= */
   124: function openModal(id) { 
   125:     if(id === 'custModal') loadCustHistoryOptions(); 
   126:     if(id === 'logicModal') renderLogicUI(); 
   127:     if(id === 'settModal') renderDbEditors(); 
   128:     if(id === 'configModal') populateShieldExtras();
   129:     if(id === 'buhModal') setTimeout(renderChart, 100);
   130:     document.getElementById(id).style.display='flex'; 
   131: }
   132: 
   133: 
   134: 
```

### around line 154

```js
   142: }
   143: 
   144: 
   145: 
   146: /* =========================================================
   147:  * DATABASE FUNCTION: openSwapModal
   148:  * ========================================================= */
   149: function openSwapModal(idx) {
   150:     swapTargetIdx = idx;
   151:     let current = currentEstimate[idx];
   152:     let sel = document.getElementById('swap-select');
   153:     let isMat = current.type === 'mat';
>> 154:     let dbToUse = isMat ? matDB : workDB;
   155:     
   156:     let opts = dbToUse.map(x => `<option value="${x.id}" ${x.n===current.n ? 'selected' : ''}>${x.n} (${x.p} ₽)</option>`).join('');
   157:     sel.innerHTML = opts;
   158:     openModal('swapModal');
   159: }
   160: 
   161: 
   162: 
   163: 
   164: /* =========================================================
   165:  * DATABASE FUNCTION: applySwap
   166:  * ========================================================= */
   167: function applySwap() {
   168:     if(swapTargetIdx < 0) return;
   169:     let selId = document.getElementById('swap-select').value;
   170:     let current = currentEstimate[swapTargetIdx];
   171:     let isMat = current.type === 'mat';
   172:     let dbToUse = isMat ? matDB : workDB;
   173:     let newItem = dbToUse.find(x => x.id === selId);
   174:     
   175:     if(newItem) {
   176:         currentEstimate[swapTargetIdx].n = newItem.n;
```


## EP_GLOBAL_MAT

Найдено строк: 3203, 3437, 3878, 3906, 4028, 4044, 4086, 4115, 4990, 5265, 5298, 5470

### around line 3203

```js
   3191:     });
   3192:     return out;
   3193:   }
   3194: 
   3195:   function myArr(type){ return type==='work' ? EP_MY_WORK : EP_MY_MAT; }
   3196:   function serverArr(type){ return type==='work' ? EP_SERVER_WORK : EP_SERVER_MAT; }
   3197:   function activeArr(type){ return scope()==='global' ? serverArr(type) : myArr(type); }
   3198: 
   3199:   function syncWindowCaches(){
   3200:     try{
   3201:       window.EP_MY_MAT = EP_MY_MAT;
   3202:       window.EP_MY_WORK = EP_MY_WORK;
>> 3203:       window.EP_GLOBAL_MAT = EP_SERVER_MAT;
   3204:       window.EP_GLOBAL_WORK = EP_SERVER_WORK;
   3205:       window.EP_FORCE_GLOBAL = {matDB:EP_SERVER_MAT, workDB:EP_SERVER_WORK};
   3206:       window.EP_ULTIMATE_DB_CACHE = {matDB:EP_SERVER_MAT, workDB:EP_SERVER_WORK, ts:Date.now()};
   3207:       window.EP_GLOBAL_DB_VISIBLE_CACHE = {matDB:EP_SERVER_MAT, workDB:EP_SERVER_WORK, ts:Date.now()};
   3208:       window.userMatDB = EP_MY_MAT;
   3209:       window.userWorkDB = EP_MY_WORK;
   3210:       if(scope()==='global'){ matDB = EP_SERVER_MAT.slice(); workDB = EP_SERVER_WORK.slice(); }
   3211:       else { matDB = EP_MY_MAT.slice(); workDB = EP_MY_WORK.slice(); }
   3212:     }catch(e){}
   3213:   }
   3214: 
   3215:   function saveMyLocal(type, arr){
   3216:     arr = unique(arr||[], type);
   3217:     if(type==='work') EP_MY_WORK = arr; else EP_MY_MAT = arr;
   3218:     setLS(LS_MY_MAT, EP_MY_MAT);
   3219:     setLS(LS_MY_WORK, EP_MY_WORK);
   3220:     try{ localStorage.setItem(LS_MASTER_CREATED,'1'); }catch(e){}
   3221:     syncWindowCaches();
   3222:     epSaveMyDbToServer();
   3223:   }
   3224: 
   3225:   function saveServerLocal(type, arr, saveDirect){
```

### around line 3437

```js
   3425:   }
   3426: 
   3427:   
   3428: 
   3429: 
   3430: /* =========================================================
   3431:  * DATABASE FUNCTION: syncWindowCaches
   3432:  * ========================================================= */
   3433: function syncWindowCaches(){
   3434:     try{
   3435:       window.EP_MY_MAT = EP_MY_MAT;
   3436:       window.EP_MY_WORK = EP_MY_WORK;
>> 3437:       window.EP_GLOBAL_MAT = EP_SERVER_MAT;
   3438:       window.EP_GLOBAL_WORK = EP_SERVER_WORK;
   3439:       window.EP_FORCE_GLOBAL = {matDB:EP_SERVER_MAT, workDB:EP_SERVER_WORK};
   3440:       window.EP_ULTIMATE_DB_CACHE = {matDB:EP_SERVER_MAT, workDB:EP_SERVER_WORK, ts:Date.now()};
   3441:       window.EP_GLOBAL_DB_VISIBLE_CACHE = {matDB:EP_SERVER_MAT, workDB:EP_SERVER_WORK, ts:Date.now()};
   3442:       window.userMatDB = EP_MY_MAT;
   3443:       window.userWorkDB = EP_MY_WORK;
   3444:       if(scope()==='global'){ matDB = EP_SERVER_MAT.slice(); workDB = EP_SERVER_WORK.slice(); }
   3445:       else { matDB = EP_MY_MAT.slice(); workDB = EP_MY_WORK.slice(); }
   3446:     }catch(e){}
   3447:   }
   3448: 
   3449:   
   3450: 
   3451: 
   3452: /* =========================================================
   3453:  * DATABASE FUNCTION: saveMyLocal
   3454:  * ========================================================= */
   3455: function saveMyLocal(type, arr){
   3456:     arr = unique(arr||[], type);
   3457:     if(type==='work') EP_MY_WORK = arr; else EP_MY_MAT = arr;
   3458:     setLS(LS_MY_MAT, EP_MY_MAT);
   3459:     setLS(LS_MY_WORK, EP_MY_WORK);
```

### around line 3878

```js
   3866: function getMy(type){
   3867:     var key = type === 'work' ? LS_MY_WORK : LS_MY_MAT;
   3868:     var fromWin = type === 'work' ? window.EP_MY_WORK : window.EP_MY_MAT;
   3869:     return Array.isArray(fromWin) ? fromWin.slice() : readArr(key);
   3870:   }
   3871:   
   3872: 
   3873: 
   3874: /* =========================================================
   3875:  * DATABASE FUNCTION: getServer
   3876:  * ========================================================= */
   3877: function getServer(type){
>> 3878:     var fromWin = type === 'work' ? window.EP_GLOBAL_WORK : window.EP_GLOBAL_MAT;
   3879:     if(Array.isArray(fromWin)) return fromWin.slice();
   3880:     var c = readObj(LS_SERVER_CACHE);
   3881:     var a = type === 'work' ? c.workDB : c.matDB;
   3882:     return Array.isArray(a) ? a : [];
   3883:   }
   3884:   
   3885: 
   3886: 
   3887: /* =========================================================
   3888:  * DATABASE FUNCTION: setMy
   3889:  * ========================================================= */
   3890: function setMy(type,arr){
   3891:     arr = unique(arr, type);
   3892:     if(type === 'work') window.EP_MY_WORK = arr; else window.EP_MY_MAT = arr;
   3893:     writeArr(LS_MY_MAT, type === 'mat' ? arr : getMy('mat'));
   3894:     writeArr(LS_MY_WORK, type === 'work' ? arr : getMy('work'));
   3895:     try{ window.userMatDB = getMy('mat'); window.userWorkDB = getMy('work'); }catch(e){}
   3896:     syncMainArrays('my');
   3897:   }
   3898:   
   3899: 
   3900: 
```

### around line 3906

```js
   3894:     writeArr(LS_MY_WORK, type === 'work' ? arr : getMy('work'));
   3895:     try{ window.userMatDB = getMy('mat'); window.userWorkDB = getMy('work'); }catch(e){}
   3896:     syncMainArrays('my');
   3897:   }
   3898:   
   3899: 
   3900: 
   3901: /* =========================================================
   3902:  * DATABASE FUNCTION: setServer
   3903:  * ========================================================= */
   3904: function setServer(type,arr){
   3905:     arr = unique(arr, type);
>> 3906:     if(type === 'work') window.EP_GLOBAL_WORK = arr; else window.EP_GLOBAL_MAT = arr;
   3907:     var mat = type === 'mat' ? arr : getServer('mat');
   3908:     var work = type === 'work' ? arr : getServer('work');
   3909:     try{
   3910:       window.EP_FORCE_GLOBAL = {matDB:mat, workDB:work};
   3911:       window.EP_ULTIMATE_DB_CACHE = {matDB:mat, workDB:work, ts:Date.now()};
   3912:       window.EP_GLOBAL_DB_VISIBLE_CACHE = {matDB:mat, workDB:work, ts:Date.now()};
   3913:     }catch(e){}
   3914:     writeObj(LS_SERVER_CACHE, {matDB:mat, workDB:work, ts:Date.now()});
   3915:     syncMainArrays('global');
   3916:   }
   3917:   
   3918: 
   3919: 
   3920: /* =========================================================
   3921:  * DATABASE FUNCTION: syncMainArrays
   3922:  * ========================================================= */
   3923: function syncMainArrays(target){
   3924:     try{
   3925:       var use = target || activeTarget();
   3926:       if(use === 'global'){
   3927:         window.matDB = getServer('mat');
   3928:         window.workDB = getServer('work');
```

### around line 4028

```js
   4016:     writeArr(LS_MY_MAT, mat);
   4017:     writeArr(LS_MY_WORK, work);
   4018:   }
   4019:   
   4020: 
   4021: 
   4022: /* =========================================================
   4023:  * DATABASE FUNCTION: setServerArrays
   4024:  * ========================================================= */
   4025: function setServerArrays(mat,work){
   4026:     mat = unique(mat || [], 'mat');
   4027:     work = unique(work || [], 'work');
>> 4028:     window.EP_GLOBAL_MAT = mat;
   4029:     window.EP_GLOBAL_WORK = work;
   4030:     window.EP_FORCE_GLOBAL = {matDB:mat, workDB:work};
   4031:     window.EP_ULTIMATE_DB_CACHE = {matDB:mat, workDB:work, ts:Date.now()};
   4032:     window.EP_GLOBAL_DB_VISIBLE_CACHE = {matDB:mat, workDB:work, ts:Date.now()};
   4033:     writeObj(LS_SERVER_CACHE, {matDB:mat, workDB:work, ts:Date.now()});
   4034:   }
   4035:   
   4036: 
   4037: 
   4038: /* =========================================================
   4039:  * DATABASE FUNCTION: syncActiveArrays
   4040:  * ========================================================= */
   4041: function syncActiveArrays(){
   4042:     try{
   4043:       if(getScope() === 'global'){
   4044:         var sm = Array.isArray(window.EP_GLOBAL_MAT) ? window.EP_GLOBAL_MAT : getServerFromCache('mat');
   4045:         var sw = Array.isArray(window.EP_GLOBAL_WORK) ? window.EP_GLOBAL_WORK : getServerFromCache('work');
   4046:         window.matDB = sm.slice();
   4047:         window.workDB = sw.slice();
   4048:         try{ matDB = window.matDB; workDB = window.workDB; }catch(e){}
   4049:       } else {
   4050:         var mm = Array.isArray(window.EP_MY_MAT) ? window.EP_MY_MAT : readArr(LS_MY_MAT);
```


## EP_GLOBAL_WORK

Найдено строк: 3204, 3438, 3878, 3906, 4029, 4045, 4087, 4116, 4981, 5265, 5298

### around line 3204

```js
   3192:     return out;
   3193:   }
   3194: 
   3195:   function myArr(type){ return type==='work' ? EP_MY_WORK : EP_MY_MAT; }
   3196:   function serverArr(type){ return type==='work' ? EP_SERVER_WORK : EP_SERVER_MAT; }
   3197:   function activeArr(type){ return scope()==='global' ? serverArr(type) : myArr(type); }
   3198: 
   3199:   function syncWindowCaches(){
   3200:     try{
   3201:       window.EP_MY_MAT = EP_MY_MAT;
   3202:       window.EP_MY_WORK = EP_MY_WORK;
   3203:       window.EP_GLOBAL_MAT = EP_SERVER_MAT;
>> 3204:       window.EP_GLOBAL_WORK = EP_SERVER_WORK;
   3205:       window.EP_FORCE_GLOBAL = {matDB:EP_SERVER_MAT, workDB:EP_SERVER_WORK};
   3206:       window.EP_ULTIMATE_DB_CACHE = {matDB:EP_SERVER_MAT, workDB:EP_SERVER_WORK, ts:Date.now()};
   3207:       window.EP_GLOBAL_DB_VISIBLE_CACHE = {matDB:EP_SERVER_MAT, workDB:EP_SERVER_WORK, ts:Date.now()};
   3208:       window.userMatDB = EP_MY_MAT;
   3209:       window.userWorkDB = EP_MY_WORK;
   3210:       if(scope()==='global'){ matDB = EP_SERVER_MAT.slice(); workDB = EP_SERVER_WORK.slice(); }
   3211:       else { matDB = EP_MY_MAT.slice(); workDB = EP_MY_WORK.slice(); }
   3212:     }catch(e){}
   3213:   }
   3214: 
   3215:   function saveMyLocal(type, arr){
   3216:     arr = unique(arr||[], type);
   3217:     if(type==='work') EP_MY_WORK = arr; else EP_MY_MAT = arr;
   3218:     setLS(LS_MY_MAT, EP_MY_MAT);
   3219:     setLS(LS_MY_WORK, EP_MY_WORK);
   3220:     try{ localStorage.setItem(LS_MASTER_CREATED,'1'); }catch(e){}
   3221:     syncWindowCaches();
   3222:     epSaveMyDbToServer();
   3223:   }
   3224: 
   3225:   function saveServerLocal(type, arr, saveDirect){
   3226:     arr = unique(arr||[], type);
```

### around line 3438

```js
   3426: 
   3427:   
   3428: 
   3429: 
   3430: /* =========================================================
   3431:  * DATABASE FUNCTION: syncWindowCaches
   3432:  * ========================================================= */
   3433: function syncWindowCaches(){
   3434:     try{
   3435:       window.EP_MY_MAT = EP_MY_MAT;
   3436:       window.EP_MY_WORK = EP_MY_WORK;
   3437:       window.EP_GLOBAL_MAT = EP_SERVER_MAT;
>> 3438:       window.EP_GLOBAL_WORK = EP_SERVER_WORK;
   3439:       window.EP_FORCE_GLOBAL = {matDB:EP_SERVER_MAT, workDB:EP_SERVER_WORK};
   3440:       window.EP_ULTIMATE_DB_CACHE = {matDB:EP_SERVER_MAT, workDB:EP_SERVER_WORK, ts:Date.now()};
   3441:       window.EP_GLOBAL_DB_VISIBLE_CACHE = {matDB:EP_SERVER_MAT, workDB:EP_SERVER_WORK, ts:Date.now()};
   3442:       window.userMatDB = EP_MY_MAT;
   3443:       window.userWorkDB = EP_MY_WORK;
   3444:       if(scope()==='global'){ matDB = EP_SERVER_MAT.slice(); workDB = EP_SERVER_WORK.slice(); }
   3445:       else { matDB = EP_MY_MAT.slice(); workDB = EP_MY_WORK.slice(); }
   3446:     }catch(e){}
   3447:   }
   3448: 
   3449:   
   3450: 
   3451: 
   3452: /* =========================================================
   3453:  * DATABASE FUNCTION: saveMyLocal
   3454:  * ========================================================= */
   3455: function saveMyLocal(type, arr){
   3456:     arr = unique(arr||[], type);
   3457:     if(type==='work') EP_MY_WORK = arr; else EP_MY_MAT = arr;
   3458:     setLS(LS_MY_MAT, EP_MY_MAT);
   3459:     setLS(LS_MY_WORK, EP_MY_WORK);
   3460:     try{ localStorage.setItem(LS_MASTER_CREATED,'1'); }catch(e){}
```

### around line 3878

```js
   3866: function getMy(type){
   3867:     var key = type === 'work' ? LS_MY_WORK : LS_MY_MAT;
   3868:     var fromWin = type === 'work' ? window.EP_MY_WORK : window.EP_MY_MAT;
   3869:     return Array.isArray(fromWin) ? fromWin.slice() : readArr(key);
   3870:   }
   3871:   
   3872: 
   3873: 
   3874: /* =========================================================
   3875:  * DATABASE FUNCTION: getServer
   3876:  * ========================================================= */
   3877: function getServer(type){
>> 3878:     var fromWin = type === 'work' ? window.EP_GLOBAL_WORK : window.EP_GLOBAL_MAT;
   3879:     if(Array.isArray(fromWin)) return fromWin.slice();
   3880:     var c = readObj(LS_SERVER_CACHE);
   3881:     var a = type === 'work' ? c.workDB : c.matDB;
   3882:     return Array.isArray(a) ? a : [];
   3883:   }
   3884:   
   3885: 
   3886: 
   3887: /* =========================================================
   3888:  * DATABASE FUNCTION: setMy
   3889:  * ========================================================= */
   3890: function setMy(type,arr){
   3891:     arr = unique(arr, type);
   3892:     if(type === 'work') window.EP_MY_WORK = arr; else window.EP_MY_MAT = arr;
   3893:     writeArr(LS_MY_MAT, type === 'mat' ? arr : getMy('mat'));
   3894:     writeArr(LS_MY_WORK, type === 'work' ? arr : getMy('work'));
   3895:     try{ window.userMatDB = getMy('mat'); window.userWorkDB = getMy('work'); }catch(e){}
   3896:     syncMainArrays('my');
   3897:   }
   3898:   
   3899: 
   3900: 
```

### around line 3906

```js
   3894:     writeArr(LS_MY_WORK, type === 'work' ? arr : getMy('work'));
   3895:     try{ window.userMatDB = getMy('mat'); window.userWorkDB = getMy('work'); }catch(e){}
   3896:     syncMainArrays('my');
   3897:   }
   3898:   
   3899: 
   3900: 
   3901: /* =========================================================
   3902:  * DATABASE FUNCTION: setServer
   3903:  * ========================================================= */
   3904: function setServer(type,arr){
   3905:     arr = unique(arr, type);
>> 3906:     if(type === 'work') window.EP_GLOBAL_WORK = arr; else window.EP_GLOBAL_MAT = arr;
   3907:     var mat = type === 'mat' ? arr : getServer('mat');
   3908:     var work = type === 'work' ? arr : getServer('work');
   3909:     try{
   3910:       window.EP_FORCE_GLOBAL = {matDB:mat, workDB:work};
   3911:       window.EP_ULTIMATE_DB_CACHE = {matDB:mat, workDB:work, ts:Date.now()};
   3912:       window.EP_GLOBAL_DB_VISIBLE_CACHE = {matDB:mat, workDB:work, ts:Date.now()};
   3913:     }catch(e){}
   3914:     writeObj(LS_SERVER_CACHE, {matDB:mat, workDB:work, ts:Date.now()});
   3915:     syncMainArrays('global');
   3916:   }
   3917:   
   3918: 
   3919: 
   3920: /* =========================================================
   3921:  * DATABASE FUNCTION: syncMainArrays
   3922:  * ========================================================= */
   3923: function syncMainArrays(target){
   3924:     try{
   3925:       var use = target || activeTarget();
   3926:       if(use === 'global'){
   3927:         window.matDB = getServer('mat');
   3928:         window.workDB = getServer('work');
```

### around line 4029

```js
   4017:     writeArr(LS_MY_WORK, work);
   4018:   }
   4019:   
   4020: 
   4021: 
   4022: /* =========================================================
   4023:  * DATABASE FUNCTION: setServerArrays
   4024:  * ========================================================= */
   4025: function setServerArrays(mat,work){
   4026:     mat = unique(mat || [], 'mat');
   4027:     work = unique(work || [], 'work');
   4028:     window.EP_GLOBAL_MAT = mat;
>> 4029:     window.EP_GLOBAL_WORK = work;
   4030:     window.EP_FORCE_GLOBAL = {matDB:mat, workDB:work};
   4031:     window.EP_ULTIMATE_DB_CACHE = {matDB:mat, workDB:work, ts:Date.now()};
   4032:     window.EP_GLOBAL_DB_VISIBLE_CACHE = {matDB:mat, workDB:work, ts:Date.now()};
   4033:     writeObj(LS_SERVER_CACHE, {matDB:mat, workDB:work, ts:Date.now()});
   4034:   }
   4035:   
   4036: 
   4037: 
   4038: /* =========================================================
   4039:  * DATABASE FUNCTION: syncActiveArrays
   4040:  * ========================================================= */
   4041: function syncActiveArrays(){
   4042:     try{
   4043:       if(getScope() === 'global'){
   4044:         var sm = Array.isArray(window.EP_GLOBAL_MAT) ? window.EP_GLOBAL_MAT : getServerFromCache('mat');
   4045:         var sw = Array.isArray(window.EP_GLOBAL_WORK) ? window.EP_GLOBAL_WORK : getServerFromCache('work');
   4046:         window.matDB = sm.slice();
   4047:         window.workDB = sw.slice();
   4048:         try{ matDB = window.matDB; workDB = window.workDB; }catch(e){}
   4049:       } else {
   4050:         var mm = Array.isArray(window.EP_MY_MAT) ? window.EP_MY_MAT : readArr(LS_MY_MAT);
   4051:         var mw = Array.isArray(window.EP_MY_WORK) ? window.EP_MY_WORK : readArr(LS_MY_WORK);
```


## EP_MY_MAT

Найдено строк: 3195, 3201, 3208, 3211, 3217, 3218, 3254, 3294, 3321, 3323, 3337, 3435, 3442, 3445, 3457, 3458, 3491, 3549, 3576, 3578

### around line 3195

```js
   3183:     var seen={}, out=[];
   3184:     (arr||[]).forEach(function(raw){
   3185:       var it=clone(raw);
   3186:       if(!it.n) return;
   3187:       var k=sig(type,it);
   3188:       if(seen[k]) return;
   3189:       seen[k]=1;
   3190:       out.push(it);
   3191:     });
   3192:     return out;
   3193:   }
   3194: 
>> 3195:   function myArr(type){ return type==='work' ? EP_MY_WORK : EP_MY_MAT; }
   3196:   function serverArr(type){ return type==='work' ? EP_SERVER_WORK : EP_SERVER_MAT; }
   3197:   function activeArr(type){ return scope()==='global' ? serverArr(type) : myArr(type); }
   3198: 
   3199:   function syncWindowCaches(){
   3200:     try{
   3201:       window.EP_MY_MAT = EP_MY_MAT;
   3202:       window.EP_MY_WORK = EP_MY_WORK;
   3203:       window.EP_GLOBAL_MAT = EP_SERVER_MAT;
   3204:       window.EP_GLOBAL_WORK = EP_SERVER_WORK;
   3205:       window.EP_FORCE_GLOBAL = {matDB:EP_SERVER_MAT, workDB:EP_SERVER_WORK};
   3206:       window.EP_ULTIMATE_DB_CACHE = {matDB:EP_SERVER_MAT, workDB:EP_SERVER_WORK, ts:Date.now()};
   3207:       window.EP_GLOBAL_DB_VISIBLE_CACHE = {matDB:EP_SERVER_MAT, workDB:EP_SERVER_WORK, ts:Date.now()};
   3208:       window.userMatDB = EP_MY_MAT;
   3209:       window.userWorkDB = EP_MY_WORK;
   3210:       if(scope()==='global'){ matDB = EP_SERVER_MAT.slice(); workDB = EP_SERVER_WORK.slice(); }
   3211:       else { matDB = EP_MY_MAT.slice(); workDB = EP_MY_WORK.slice(); }
   3212:     }catch(e){}
   3213:   }
   3214: 
   3215:   function saveMyLocal(type, arr){
   3216:     arr = unique(arr||[], type);
   3217:     if(type==='work') EP_MY_WORK = arr; else EP_MY_MAT = arr;
```

### around line 3201

```js
   3189:       seen[k]=1;
   3190:       out.push(it);
   3191:     });
   3192:     return out;
   3193:   }
   3194: 
   3195:   function myArr(type){ return type==='work' ? EP_MY_WORK : EP_MY_MAT; }
   3196:   function serverArr(type){ return type==='work' ? EP_SERVER_WORK : EP_SERVER_MAT; }
   3197:   function activeArr(type){ return scope()==='global' ? serverArr(type) : myArr(type); }
   3198: 
   3199:   function syncWindowCaches(){
   3200:     try{
>> 3201:       window.EP_MY_MAT = EP_MY_MAT;
   3202:       window.EP_MY_WORK = EP_MY_WORK;
   3203:       window.EP_GLOBAL_MAT = EP_SERVER_MAT;
   3204:       window.EP_GLOBAL_WORK = EP_SERVER_WORK;
   3205:       window.EP_FORCE_GLOBAL = {matDB:EP_SERVER_MAT, workDB:EP_SERVER_WORK};
   3206:       window.EP_ULTIMATE_DB_CACHE = {matDB:EP_SERVER_MAT, workDB:EP_SERVER_WORK, ts:Date.now()};
   3207:       window.EP_GLOBAL_DB_VISIBLE_CACHE = {matDB:EP_SERVER_MAT, workDB:EP_SERVER_WORK, ts:Date.now()};
   3208:       window.userMatDB = EP_MY_MAT;
   3209:       window.userWorkDB = EP_MY_WORK;
   3210:       if(scope()==='global'){ matDB = EP_SERVER_MAT.slice(); workDB = EP_SERVER_WORK.slice(); }
   3211:       else { matDB = EP_MY_MAT.slice(); workDB = EP_MY_WORK.slice(); }
   3212:     }catch(e){}
   3213:   }
   3214: 
   3215:   function saveMyLocal(type, arr){
   3216:     arr = unique(arr||[], type);
   3217:     if(type==='work') EP_MY_WORK = arr; else EP_MY_MAT = arr;
   3218:     setLS(LS_MY_MAT, EP_MY_MAT);
   3219:     setLS(LS_MY_WORK, EP_MY_WORK);
   3220:     try{ localStorage.setItem(LS_MASTER_CREATED,'1'); }catch(e){}
   3221:     syncWindowCaches();
   3222:     epSaveMyDbToServer();
   3223:   }
```

### around line 3208

```js
   3196:   function serverArr(type){ return type==='work' ? EP_SERVER_WORK : EP_SERVER_MAT; }
   3197:   function activeArr(type){ return scope()==='global' ? serverArr(type) : myArr(type); }
   3198: 
   3199:   function syncWindowCaches(){
   3200:     try{
   3201:       window.EP_MY_MAT = EP_MY_MAT;
   3202:       window.EP_MY_WORK = EP_MY_WORK;
   3203:       window.EP_GLOBAL_MAT = EP_SERVER_MAT;
   3204:       window.EP_GLOBAL_WORK = EP_SERVER_WORK;
   3205:       window.EP_FORCE_GLOBAL = {matDB:EP_SERVER_MAT, workDB:EP_SERVER_WORK};
   3206:       window.EP_ULTIMATE_DB_CACHE = {matDB:EP_SERVER_MAT, workDB:EP_SERVER_WORK, ts:Date.now()};
   3207:       window.EP_GLOBAL_DB_VISIBLE_CACHE = {matDB:EP_SERVER_MAT, workDB:EP_SERVER_WORK, ts:Date.now()};
>> 3208:       window.userMatDB = EP_MY_MAT;
   3209:       window.userWorkDB = EP_MY_WORK;
   3210:       if(scope()==='global'){ matDB = EP_SERVER_MAT.slice(); workDB = EP_SERVER_WORK.slice(); }
   3211:       else { matDB = EP_MY_MAT.slice(); workDB = EP_MY_WORK.slice(); }
   3212:     }catch(e){}
   3213:   }
   3214: 
   3215:   function saveMyLocal(type, arr){
   3216:     arr = unique(arr||[], type);
   3217:     if(type==='work') EP_MY_WORK = arr; else EP_MY_MAT = arr;
   3218:     setLS(LS_MY_MAT, EP_MY_MAT);
   3219:     setLS(LS_MY_WORK, EP_MY_WORK);
   3220:     try{ localStorage.setItem(LS_MASTER_CREATED,'1'); }catch(e){}
   3221:     syncWindowCaches();
   3222:     epSaveMyDbToServer();
   3223:   }
   3224: 
   3225:   function saveServerLocal(type, arr, saveDirect){
   3226:     arr = unique(arr||[], type);
   3227:     if(type==='work') EP_SERVER_WORK = arr; else EP_SERVER_MAT = arr;
   3228:     setObjLS(LS_SERVER_CACHE, {matDB:EP_SERVER_MAT, workDB:EP_SERVER_WORK, cleanMode:cleanMode(), ts:Date.now()});
   3229:     syncWindowCaches();
   3230:     if(saveDirect) epSaveServerDbToServer();
```

### around line 3211

```js
   3199:   function syncWindowCaches(){
   3200:     try{
   3201:       window.EP_MY_MAT = EP_MY_MAT;
   3202:       window.EP_MY_WORK = EP_MY_WORK;
   3203:       window.EP_GLOBAL_MAT = EP_SERVER_MAT;
   3204:       window.EP_GLOBAL_WORK = EP_SERVER_WORK;
   3205:       window.EP_FORCE_GLOBAL = {matDB:EP_SERVER_MAT, workDB:EP_SERVER_WORK};
   3206:       window.EP_ULTIMATE_DB_CACHE = {matDB:EP_SERVER_MAT, workDB:EP_SERVER_WORK, ts:Date.now()};
   3207:       window.EP_GLOBAL_DB_VISIBLE_CACHE = {matDB:EP_SERVER_MAT, workDB:EP_SERVER_WORK, ts:Date.now()};
   3208:       window.userMatDB = EP_MY_MAT;
   3209:       window.userWorkDB = EP_MY_WORK;
   3210:       if(scope()==='global'){ matDB = EP_SERVER_MAT.slice(); workDB = EP_SERVER_WORK.slice(); }
>> 3211:       else { matDB = EP_MY_MAT.slice(); workDB = EP_MY_WORK.slice(); }
   3212:     }catch(e){}
   3213:   }
   3214: 
   3215:   function saveMyLocal(type, arr){
   3216:     arr = unique(arr||[], type);
   3217:     if(type==='work') EP_MY_WORK = arr; else EP_MY_MAT = arr;
   3218:     setLS(LS_MY_MAT, EP_MY_MAT);
   3219:     setLS(LS_MY_WORK, EP_MY_WORK);
   3220:     try{ localStorage.setItem(LS_MASTER_CREATED,'1'); }catch(e){}
   3221:     syncWindowCaches();
   3222:     epSaveMyDbToServer();
   3223:   }
   3224: 
   3225:   function saveServerLocal(type, arr, saveDirect){
   3226:     arr = unique(arr||[], type);
   3227:     if(type==='work') EP_SERVER_WORK = arr; else EP_SERVER_MAT = arr;
   3228:     setObjLS(LS_SERVER_CACHE, {matDB:EP_SERVER_MAT, workDB:EP_SERVER_WORK, cleanMode:cleanMode(), ts:Date.now()});
   3229:     syncWindowCaches();
   3230:     if(saveDirect) epSaveServerDbToServer();
   3231:   }
   3232: 
   3233:   function setActiveDb(type, arr){
```

### around line 3217

```js
   3205:       window.EP_FORCE_GLOBAL = {matDB:EP_SERVER_MAT, workDB:EP_SERVER_WORK};
   3206:       window.EP_ULTIMATE_DB_CACHE = {matDB:EP_SERVER_MAT, workDB:EP_SERVER_WORK, ts:Date.now()};
   3207:       window.EP_GLOBAL_DB_VISIBLE_CACHE = {matDB:EP_SERVER_MAT, workDB:EP_SERVER_WORK, ts:Date.now()};
   3208:       window.userMatDB = EP_MY_MAT;
   3209:       window.userWorkDB = EP_MY_WORK;
   3210:       if(scope()==='global'){ matDB = EP_SERVER_MAT.slice(); workDB = EP_SERVER_WORK.slice(); }
   3211:       else { matDB = EP_MY_MAT.slice(); workDB = EP_MY_WORK.slice(); }
   3212:     }catch(e){}
   3213:   }
   3214: 
   3215:   function saveMyLocal(type, arr){
   3216:     arr = unique(arr||[], type);
>> 3217:     if(type==='work') EP_MY_WORK = arr; else EP_MY_MAT = arr;
   3218:     setLS(LS_MY_MAT, EP_MY_MAT);
   3219:     setLS(LS_MY_WORK, EP_MY_WORK);
   3220:     try{ localStorage.setItem(LS_MASTER_CREATED,'1'); }catch(e){}
   3221:     syncWindowCaches();
   3222:     epSaveMyDbToServer();
   3223:   }
   3224: 
   3225:   function saveServerLocal(type, arr, saveDirect){
   3226:     arr = unique(arr||[], type);
   3227:     if(type==='work') EP_SERVER_WORK = arr; else EP_SERVER_MAT = arr;
   3228:     setObjLS(LS_SERVER_CACHE, {matDB:EP_SERVER_MAT, workDB:EP_SERVER_WORK, cleanMode:cleanMode(), ts:Date.now()});
   3229:     syncWindowCaches();
   3230:     if(saveDirect) epSaveServerDbToServer();
   3231:   }
   3232: 
   3233:   function setActiveDb(type, arr){
   3234:     if(scope()==='global') saveServerLocal(type, arr, isAdmin());
   3235:     else saveMyLocal(type, arr);
   3236:   }
   3237: 
   3238:   function upsert(arr,type,it){
   3239:     it = clone(it);
```


## EP_MY_WORK

Найдено строк: 3195, 3202, 3209, 3211, 3217, 3219, 3255, 3295, 3322, 3324, 3338, 3436, 3443, 3445, 3457, 3459, 3492, 3550, 3577, 3579

### around line 3195

```js
   3183:     var seen={}, out=[];
   3184:     (arr||[]).forEach(function(raw){
   3185:       var it=clone(raw);
   3186:       if(!it.n) return;
   3187:       var k=sig(type,it);
   3188:       if(seen[k]) return;
   3189:       seen[k]=1;
   3190:       out.push(it);
   3191:     });
   3192:     return out;
   3193:   }
   3194: 
>> 3195:   function myArr(type){ return type==='work' ? EP_MY_WORK : EP_MY_MAT; }
   3196:   function serverArr(type){ return type==='work' ? EP_SERVER_WORK : EP_SERVER_MAT; }
   3197:   function activeArr(type){ return scope()==='global' ? serverArr(type) : myArr(type); }
   3198: 
   3199:   function syncWindowCaches(){
   3200:     try{
   3201:       window.EP_MY_MAT = EP_MY_MAT;
   3202:       window.EP_MY_WORK = EP_MY_WORK;
   3203:       window.EP_GLOBAL_MAT = EP_SERVER_MAT;
   3204:       window.EP_GLOBAL_WORK = EP_SERVER_WORK;
   3205:       window.EP_FORCE_GLOBAL = {matDB:EP_SERVER_MAT, workDB:EP_SERVER_WORK};
   3206:       window.EP_ULTIMATE_DB_CACHE = {matDB:EP_SERVER_MAT, workDB:EP_SERVER_WORK, ts:Date.now()};
   3207:       window.EP_GLOBAL_DB_VISIBLE_CACHE = {matDB:EP_SERVER_MAT, workDB:EP_SERVER_WORK, ts:Date.now()};
   3208:       window.userMatDB = EP_MY_MAT;
   3209:       window.userWorkDB = EP_MY_WORK;
   3210:       if(scope()==='global'){ matDB = EP_SERVER_MAT.slice(); workDB = EP_SERVER_WORK.slice(); }
   3211:       else { matDB = EP_MY_MAT.slice(); workDB = EP_MY_WORK.slice(); }
   3212:     }catch(e){}
   3213:   }
   3214: 
   3215:   function saveMyLocal(type, arr){
   3216:     arr = unique(arr||[], type);
   3217:     if(type==='work') EP_MY_WORK = arr; else EP_MY_MAT = arr;
```

### around line 3202

```js
   3190:       out.push(it);
   3191:     });
   3192:     return out;
   3193:   }
   3194: 
   3195:   function myArr(type){ return type==='work' ? EP_MY_WORK : EP_MY_MAT; }
   3196:   function serverArr(type){ return type==='work' ? EP_SERVER_WORK : EP_SERVER_MAT; }
   3197:   function activeArr(type){ return scope()==='global' ? serverArr(type) : myArr(type); }
   3198: 
   3199:   function syncWindowCaches(){
   3200:     try{
   3201:       window.EP_MY_MAT = EP_MY_MAT;
>> 3202:       window.EP_MY_WORK = EP_MY_WORK;
   3203:       window.EP_GLOBAL_MAT = EP_SERVER_MAT;
   3204:       window.EP_GLOBAL_WORK = EP_SERVER_WORK;
   3205:       window.EP_FORCE_GLOBAL = {matDB:EP_SERVER_MAT, workDB:EP_SERVER_WORK};
   3206:       window.EP_ULTIMATE_DB_CACHE = {matDB:EP_SERVER_MAT, workDB:EP_SERVER_WORK, ts:Date.now()};
   3207:       window.EP_GLOBAL_DB_VISIBLE_CACHE = {matDB:EP_SERVER_MAT, workDB:EP_SERVER_WORK, ts:Date.now()};
   3208:       window.userMatDB = EP_MY_MAT;
   3209:       window.userWorkDB = EP_MY_WORK;
   3210:       if(scope()==='global'){ matDB = EP_SERVER_MAT.slice(); workDB = EP_SERVER_WORK.slice(); }
   3211:       else { matDB = EP_MY_MAT.slice(); workDB = EP_MY_WORK.slice(); }
   3212:     }catch(e){}
   3213:   }
   3214: 
   3215:   function saveMyLocal(type, arr){
   3216:     arr = unique(arr||[], type);
   3217:     if(type==='work') EP_MY_WORK = arr; else EP_MY_MAT = arr;
   3218:     setLS(LS_MY_MAT, EP_MY_MAT);
   3219:     setLS(LS_MY_WORK, EP_MY_WORK);
   3220:     try{ localStorage.setItem(LS_MASTER_CREATED,'1'); }catch(e){}
   3221:     syncWindowCaches();
   3222:     epSaveMyDbToServer();
   3223:   }
   3224: 
```

### around line 3209

```js
   3197:   function activeArr(type){ return scope()==='global' ? serverArr(type) : myArr(type); }
   3198: 
   3199:   function syncWindowCaches(){
   3200:     try{
   3201:       window.EP_MY_MAT = EP_MY_MAT;
   3202:       window.EP_MY_WORK = EP_MY_WORK;
   3203:       window.EP_GLOBAL_MAT = EP_SERVER_MAT;
   3204:       window.EP_GLOBAL_WORK = EP_SERVER_WORK;
   3205:       window.EP_FORCE_GLOBAL = {matDB:EP_SERVER_MAT, workDB:EP_SERVER_WORK};
   3206:       window.EP_ULTIMATE_DB_CACHE = {matDB:EP_SERVER_MAT, workDB:EP_SERVER_WORK, ts:Date.now()};
   3207:       window.EP_GLOBAL_DB_VISIBLE_CACHE = {matDB:EP_SERVER_MAT, workDB:EP_SERVER_WORK, ts:Date.now()};
   3208:       window.userMatDB = EP_MY_MAT;
>> 3209:       window.userWorkDB = EP_MY_WORK;
   3210:       if(scope()==='global'){ matDB = EP_SERVER_MAT.slice(); workDB = EP_SERVER_WORK.slice(); }
   3211:       else { matDB = EP_MY_MAT.slice(); workDB = EP_MY_WORK.slice(); }
   3212:     }catch(e){}
   3213:   }
   3214: 
   3215:   function saveMyLocal(type, arr){
   3216:     arr = unique(arr||[], type);
   3217:     if(type==='work') EP_MY_WORK = arr; else EP_MY_MAT = arr;
   3218:     setLS(LS_MY_MAT, EP_MY_MAT);
   3219:     setLS(LS_MY_WORK, EP_MY_WORK);
   3220:     try{ localStorage.setItem(LS_MASTER_CREATED,'1'); }catch(e){}
   3221:     syncWindowCaches();
   3222:     epSaveMyDbToServer();
   3223:   }
   3224: 
   3225:   function saveServerLocal(type, arr, saveDirect){
   3226:     arr = unique(arr||[], type);
   3227:     if(type==='work') EP_SERVER_WORK = arr; else EP_SERVER_MAT = arr;
   3228:     setObjLS(LS_SERVER_CACHE, {matDB:EP_SERVER_MAT, workDB:EP_SERVER_WORK, cleanMode:cleanMode(), ts:Date.now()});
   3229:     syncWindowCaches();
   3230:     if(saveDirect) epSaveServerDbToServer();
   3231:   }
```

### around line 3211

```js
   3199:   function syncWindowCaches(){
   3200:     try{
   3201:       window.EP_MY_MAT = EP_MY_MAT;
   3202:       window.EP_MY_WORK = EP_MY_WORK;
   3203:       window.EP_GLOBAL_MAT = EP_SERVER_MAT;
   3204:       window.EP_GLOBAL_WORK = EP_SERVER_WORK;
   3205:       window.EP_FORCE_GLOBAL = {matDB:EP_SERVER_MAT, workDB:EP_SERVER_WORK};
   3206:       window.EP_ULTIMATE_DB_CACHE = {matDB:EP_SERVER_MAT, workDB:EP_SERVER_WORK, ts:Date.now()};
   3207:       window.EP_GLOBAL_DB_VISIBLE_CACHE = {matDB:EP_SERVER_MAT, workDB:EP_SERVER_WORK, ts:Date.now()};
   3208:       window.userMatDB = EP_MY_MAT;
   3209:       window.userWorkDB = EP_MY_WORK;
   3210:       if(scope()==='global'){ matDB = EP_SERVER_MAT.slice(); workDB = EP_SERVER_WORK.slice(); }
>> 3211:       else { matDB = EP_MY_MAT.slice(); workDB = EP_MY_WORK.slice(); }
   3212:     }catch(e){}
   3213:   }
   3214: 
   3215:   function saveMyLocal(type, arr){
   3216:     arr = unique(arr||[], type);
   3217:     if(type==='work') EP_MY_WORK = arr; else EP_MY_MAT = arr;
   3218:     setLS(LS_MY_MAT, EP_MY_MAT);
   3219:     setLS(LS_MY_WORK, EP_MY_WORK);
   3220:     try{ localStorage.setItem(LS_MASTER_CREATED,'1'); }catch(e){}
   3221:     syncWindowCaches();
   3222:     epSaveMyDbToServer();
   3223:   }
   3224: 
   3225:   function saveServerLocal(type, arr, saveDirect){
   3226:     arr = unique(arr||[], type);
   3227:     if(type==='work') EP_SERVER_WORK = arr; else EP_SERVER_MAT = arr;
   3228:     setObjLS(LS_SERVER_CACHE, {matDB:EP_SERVER_MAT, workDB:EP_SERVER_WORK, cleanMode:cleanMode(), ts:Date.now()});
   3229:     syncWindowCaches();
   3230:     if(saveDirect) epSaveServerDbToServer();
   3231:   }
   3232: 
   3233:   function setActiveDb(type, arr){
```

### around line 3217

```js
   3205:       window.EP_FORCE_GLOBAL = {matDB:EP_SERVER_MAT, workDB:EP_SERVER_WORK};
   3206:       window.EP_ULTIMATE_DB_CACHE = {matDB:EP_SERVER_MAT, workDB:EP_SERVER_WORK, ts:Date.now()};
   3207:       window.EP_GLOBAL_DB_VISIBLE_CACHE = {matDB:EP_SERVER_MAT, workDB:EP_SERVER_WORK, ts:Date.now()};
   3208:       window.userMatDB = EP_MY_MAT;
   3209:       window.userWorkDB = EP_MY_WORK;
   3210:       if(scope()==='global'){ matDB = EP_SERVER_MAT.slice(); workDB = EP_SERVER_WORK.slice(); }
   3211:       else { matDB = EP_MY_MAT.slice(); workDB = EP_MY_WORK.slice(); }
   3212:     }catch(e){}
   3213:   }
   3214: 
   3215:   function saveMyLocal(type, arr){
   3216:     arr = unique(arr||[], type);
>> 3217:     if(type==='work') EP_MY_WORK = arr; else EP_MY_MAT = arr;
   3218:     setLS(LS_MY_MAT, EP_MY_MAT);
   3219:     setLS(LS_MY_WORK, EP_MY_WORK);
   3220:     try{ localStorage.setItem(LS_MASTER_CREATED,'1'); }catch(e){}
   3221:     syncWindowCaches();
   3222:     epSaveMyDbToServer();
   3223:   }
   3224: 
   3225:   function saveServerLocal(type, arr, saveDirect){
   3226:     arr = unique(arr||[], type);
   3227:     if(type==='work') EP_SERVER_WORK = arr; else EP_SERVER_MAT = arr;
   3228:     setObjLS(LS_SERVER_CACHE, {matDB:EP_SERVER_MAT, workDB:EP_SERVER_WORK, cleanMode:cleanMode(), ts:Date.now()});
   3229:     syncWindowCaches();
   3230:     if(saveDirect) epSaveServerDbToServer();
   3231:   }
   3232: 
   3233:   function setActiveDb(type, arr){
   3234:     if(scope()==='global') saveServerLocal(type, arr, isAdmin());
   3235:     else saveMyLocal(type, arr);
   3236:   }
   3237: 
   3238:   function upsert(arr,type,it){
   3239:     it = clone(it);
```


## userMatDB

Найдено строк: 419, 2200, 3208, 3442, 3895, 4014, 4989, 5311, 5430, 5446

### around line 419

```js
   407:         renderShieldExtras();
   408:     }
   409: }
   410: 
   411: 
   412: 
   413: 
   414: /* =========================================================
   415:  * DATABASE FUNCTION: epAllDbItems
   416:  * ========================================================= */
   417: function epAllDbItems(type) {
   418:     const local = type === 'work' ? (workDB || []) : (matDB || []);
>> 419:     const user = type === 'work' ? (userWorkDB || []) : (userMatDB || []);
   420:     return local.concat(user).filter(Boolean);
   421: }
   422: 
   423: 
   424: 
   425: 
   426: /* =========================================================
   427:  * DATABASE FUNCTION: epFindDbItem
   428:  * ========================================================= */
   429: function epFindDbItem(type, words) {
   430:     const arr = epAllDbItems(type);
   431:     const searchWords = (words || []).map(epNormText).filter(Boolean);
   432:     if (!searchWords.length) return null;
   433:     let best = null;
   434:     let bestScore = -1;
   435:     arr.forEach(item => {
   436:         const blob = epNormText([item.c, item.g, item.sc, item.n, item.brand, item.kind, item.nominal, item.curve, item.wallType, item.modules].join(' '));
   437:         let score = 0;
   438:         searchWords.forEach(w => { if (blob.includes(w)) score++; });
   439:         if (score > bestScore) { best = item; bestScore = score; }
   440:     });
   441:     return bestScore >= Math.max(1, Math.ceil(searchWords.length * 0.55)) ? best : null;
```

### around line 2200

```js
   2188:     function fixArr(arr){
   2189:       if (!Array.isArray(arr)) return [];
   2190:       arr.forEach(function(it){
   2191:         if(!it || typeof it !== 'object') return;
   2192:         if(!it.id) it.id = 'm_' + Math.abs(norm([it.c,it.g,it.n,it.p].join('_')).split('').reduce(function(h,ch){return ((h<<5)-h+ch.charCodeAt(0))|0;},0));
   2193:         var grp = epMatGroupName(it);
   2194:         // Меняем только автоматику/щитовое, остальное не трогаем.
   2195:         if (grp.c === 'Автоматика' || grp.c === 'Щитовое') { it.c = grp.c; it.g = grp.g; it.sc = grp.g; }
   2196:       });
   2197:       return arr;
   2198:     }
   2199:     try { window.matDB = fixArr(window.matDB || []); } catch(e){}
>> 2200:     try { window.userMatDB = fixArr(window.userMatDB || []); } catch(e){}
   2201:   }
   2202: 
   2203:   
   2204: 
   2205: 
   2206: /* =========================================================
   2207:  * DATABASE FUNCTION: epRenderGrouped
   2208:  * ========================================================= */
   2209: function epRenderGrouped(arr, type, mode, prefix){
   2210:     var data = epGroupedData(arr, type);
   2211:     var html = '', i = 0;
   2212:     Object.keys(data).sort(function(a,b){return a.localeCompare(b,'ru');}).forEach(function(c){
   2213:       var cid = prefix + '_c_' + (i++);
   2214:       var catStyle = type === 'work' ? 'style="color:var(--orange); border-color:rgba(245,158,11,0.2); background:rgba(245,158,11,0.08);"' : '';
   2215:       html += '<div class="cat-header" '+catStyle+' onclick="toggleCat(\''+cid+'\')">'+safeText(c)+' <span>▼</span></div><div class="cat-body" id="'+cid+'">';
   2216:       Object.keys(data[c]).sort(function(a,b){return a.localeCompare(b,'ru');}).forEach(function(g){
   2217:         var sid = prefix + '_s_' + (i++);
   2218:         html += '<div class="ep-db-sub-header" onclick="epToggleShieldDbSub(\''+sid+'\', event)">'+safeText(g)+' <small>открыть</small></div><div class="ep-db-sub-body" id="'+sid+'">';
   2219:         data[c][g].sort(function(a,b){return String(a.n||'').localeCompare(String(b.n||''),'ru');}).forEach(function(it){
   2220:           var id = safeText(it.id);
   2221:           var meta = safeText(g)+' • '+(Number(it.p)||0)+' ₽ / '+safeText(it.u || 'шт');
   2222:           if (mode === 'editor') {
```

### around line 3208

```js
   3196:   function serverArr(type){ return type==='work' ? EP_SERVER_WORK : EP_SERVER_MAT; }
   3197:   function activeArr(type){ return scope()==='global' ? serverArr(type) : myArr(type); }
   3198: 
   3199:   function syncWindowCaches(){
   3200:     try{
   3201:       window.EP_MY_MAT = EP_MY_MAT;
   3202:       window.EP_MY_WORK = EP_MY_WORK;
   3203:       window.EP_GLOBAL_MAT = EP_SERVER_MAT;
   3204:       window.EP_GLOBAL_WORK = EP_SERVER_WORK;
   3205:       window.EP_FORCE_GLOBAL = {matDB:EP_SERVER_MAT, workDB:EP_SERVER_WORK};
   3206:       window.EP_ULTIMATE_DB_CACHE = {matDB:EP_SERVER_MAT, workDB:EP_SERVER_WORK, ts:Date.now()};
   3207:       window.EP_GLOBAL_DB_VISIBLE_CACHE = {matDB:EP_SERVER_MAT, workDB:EP_SERVER_WORK, ts:Date.now()};
>> 3208:       window.userMatDB = EP_MY_MAT;
   3209:       window.userWorkDB = EP_MY_WORK;
   3210:       if(scope()==='global'){ matDB = EP_SERVER_MAT.slice(); workDB = EP_SERVER_WORK.slice(); }
   3211:       else { matDB = EP_MY_MAT.slice(); workDB = EP_MY_WORK.slice(); }
   3212:     }catch(e){}
   3213:   }
   3214: 
   3215:   function saveMyLocal(type, arr){
   3216:     arr = unique(arr||[], type);
   3217:     if(type==='work') EP_MY_WORK = arr; else EP_MY_MAT = arr;
   3218:     setLS(LS_MY_MAT, EP_MY_MAT);
   3219:     setLS(LS_MY_WORK, EP_MY_WORK);
   3220:     try{ localStorage.setItem(LS_MASTER_CREATED,'1'); }catch(e){}
   3221:     syncWindowCaches();
   3222:     epSaveMyDbToServer();
   3223:   }
   3224: 
   3225:   function saveServerLocal(type, arr, saveDirect){
   3226:     arr = unique(arr||[], type);
   3227:     if(type==='work') EP_SERVER_WORK = arr; else EP_SERVER_MAT = arr;
   3228:     setObjLS(LS_SERVER_CACHE, {matDB:EP_SERVER_MAT, workDB:EP_SERVER_WORK, cleanMode:cleanMode(), ts:Date.now()});
   3229:     syncWindowCaches();
   3230:     if(saveDirect) epSaveServerDbToServer();
```

### around line 3442

```js
   3430: /* =========================================================
   3431:  * DATABASE FUNCTION: syncWindowCaches
   3432:  * ========================================================= */
   3433: function syncWindowCaches(){
   3434:     try{
   3435:       window.EP_MY_MAT = EP_MY_MAT;
   3436:       window.EP_MY_WORK = EP_MY_WORK;
   3437:       window.EP_GLOBAL_MAT = EP_SERVER_MAT;
   3438:       window.EP_GLOBAL_WORK = EP_SERVER_WORK;
   3439:       window.EP_FORCE_GLOBAL = {matDB:EP_SERVER_MAT, workDB:EP_SERVER_WORK};
   3440:       window.EP_ULTIMATE_DB_CACHE = {matDB:EP_SERVER_MAT, workDB:EP_SERVER_WORK, ts:Date.now()};
   3441:       window.EP_GLOBAL_DB_VISIBLE_CACHE = {matDB:EP_SERVER_MAT, workDB:EP_SERVER_WORK, ts:Date.now()};
>> 3442:       window.userMatDB = EP_MY_MAT;
   3443:       window.userWorkDB = EP_MY_WORK;
   3444:       if(scope()==='global'){ matDB = EP_SERVER_MAT.slice(); workDB = EP_SERVER_WORK.slice(); }
   3445:       else { matDB = EP_MY_MAT.slice(); workDB = EP_MY_WORK.slice(); }
   3446:     }catch(e){}
   3447:   }
   3448: 
   3449:   
   3450: 
   3451: 
   3452: /* =========================================================
   3453:  * DATABASE FUNCTION: saveMyLocal
   3454:  * ========================================================= */
   3455: function saveMyLocal(type, arr){
   3456:     arr = unique(arr||[], type);
   3457:     if(type==='work') EP_MY_WORK = arr; else EP_MY_MAT = arr;
   3458:     setLS(LS_MY_MAT, EP_MY_MAT);
   3459:     setLS(LS_MY_WORK, EP_MY_WORK);
   3460:     try{ localStorage.setItem(LS_MASTER_CREATED,'1'); }catch(e){}
   3461:     syncWindowCaches();
   3462:     epSaveMyDbToServer();
   3463:   }
   3464: 
```

### around line 3895

```js
   3883:   }
   3884:   
   3885: 
   3886: 
   3887: /* =========================================================
   3888:  * DATABASE FUNCTION: setMy
   3889:  * ========================================================= */
   3890: function setMy(type,arr){
   3891:     arr = unique(arr, type);
   3892:     if(type === 'work') window.EP_MY_WORK = arr; else window.EP_MY_MAT = arr;
   3893:     writeArr(LS_MY_MAT, type === 'mat' ? arr : getMy('mat'));
   3894:     writeArr(LS_MY_WORK, type === 'work' ? arr : getMy('work'));
>> 3895:     try{ window.userMatDB = getMy('mat'); window.userWorkDB = getMy('work'); }catch(e){}
   3896:     syncMainArrays('my');
   3897:   }
   3898:   
   3899: 
   3900: 
   3901: /* =========================================================
   3902:  * DATABASE FUNCTION: setServer
   3903:  * ========================================================= */
   3904: function setServer(type,arr){
   3905:     arr = unique(arr, type);
   3906:     if(type === 'work') window.EP_GLOBAL_WORK = arr; else window.EP_GLOBAL_MAT = arr;
   3907:     var mat = type === 'mat' ? arr : getServer('mat');
   3908:     var work = type === 'work' ? arr : getServer('work');
   3909:     try{
   3910:       window.EP_FORCE_GLOBAL = {matDB:mat, workDB:work};
   3911:       window.EP_ULTIMATE_DB_CACHE = {matDB:mat, workDB:work, ts:Date.now()};
   3912:       window.EP_GLOBAL_DB_VISIBLE_CACHE = {matDB:mat, workDB:work, ts:Date.now()};
   3913:     }catch(e){}
   3914:     writeObj(LS_SERVER_CACHE, {matDB:mat, workDB:work, ts:Date.now()});
   3915:     syncMainArrays('global');
   3916:   }
   3917:   
```


## userWorkDB

Найдено строк: 419, 3209, 3443, 3895, 4015, 4980, 5311

### around line 419

```js
   407:         renderShieldExtras();
   408:     }
   409: }
   410: 
   411: 
   412: 
   413: 
   414: /* =========================================================
   415:  * DATABASE FUNCTION: epAllDbItems
   416:  * ========================================================= */
   417: function epAllDbItems(type) {
   418:     const local = type === 'work' ? (workDB || []) : (matDB || []);
>> 419:     const user = type === 'work' ? (userWorkDB || []) : (userMatDB || []);
   420:     return local.concat(user).filter(Boolean);
   421: }
   422: 
   423: 
   424: 
   425: 
   426: /* =========================================================
   427:  * DATABASE FUNCTION: epFindDbItem
   428:  * ========================================================= */
   429: function epFindDbItem(type, words) {
   430:     const arr = epAllDbItems(type);
   431:     const searchWords = (words || []).map(epNormText).filter(Boolean);
   432:     if (!searchWords.length) return null;
   433:     let best = null;
   434:     let bestScore = -1;
   435:     arr.forEach(item => {
   436:         const blob = epNormText([item.c, item.g, item.sc, item.n, item.brand, item.kind, item.nominal, item.curve, item.wallType, item.modules].join(' '));
   437:         let score = 0;
   438:         searchWords.forEach(w => { if (blob.includes(w)) score++; });
   439:         if (score > bestScore) { best = item; bestScore = score; }
   440:     });
   441:     return bestScore >= Math.max(1, Math.ceil(searchWords.length * 0.55)) ? best : null;
```

### around line 3209

```js
   3197:   function activeArr(type){ return scope()==='global' ? serverArr(type) : myArr(type); }
   3198: 
   3199:   function syncWindowCaches(){
   3200:     try{
   3201:       window.EP_MY_MAT = EP_MY_MAT;
   3202:       window.EP_MY_WORK = EP_MY_WORK;
   3203:       window.EP_GLOBAL_MAT = EP_SERVER_MAT;
   3204:       window.EP_GLOBAL_WORK = EP_SERVER_WORK;
   3205:       window.EP_FORCE_GLOBAL = {matDB:EP_SERVER_MAT, workDB:EP_SERVER_WORK};
   3206:       window.EP_ULTIMATE_DB_CACHE = {matDB:EP_SERVER_MAT, workDB:EP_SERVER_WORK, ts:Date.now()};
   3207:       window.EP_GLOBAL_DB_VISIBLE_CACHE = {matDB:EP_SERVER_MAT, workDB:EP_SERVER_WORK, ts:Date.now()};
   3208:       window.userMatDB = EP_MY_MAT;
>> 3209:       window.userWorkDB = EP_MY_WORK;
   3210:       if(scope()==='global'){ matDB = EP_SERVER_MAT.slice(); workDB = EP_SERVER_WORK.slice(); }
   3211:       else { matDB = EP_MY_MAT.slice(); workDB = EP_MY_WORK.slice(); }
   3212:     }catch(e){}
   3213:   }
   3214: 
   3215:   function saveMyLocal(type, arr){
   3216:     arr = unique(arr||[], type);
   3217:     if(type==='work') EP_MY_WORK = arr; else EP_MY_MAT = arr;
   3218:     setLS(LS_MY_MAT, EP_MY_MAT);
   3219:     setLS(LS_MY_WORK, EP_MY_WORK);
   3220:     try{ localStorage.setItem(LS_MASTER_CREATED,'1'); }catch(e){}
   3221:     syncWindowCaches();
   3222:     epSaveMyDbToServer();
   3223:   }
   3224: 
   3225:   function saveServerLocal(type, arr, saveDirect){
   3226:     arr = unique(arr||[], type);
   3227:     if(type==='work') EP_SERVER_WORK = arr; else EP_SERVER_MAT = arr;
   3228:     setObjLS(LS_SERVER_CACHE, {matDB:EP_SERVER_MAT, workDB:EP_SERVER_WORK, cleanMode:cleanMode(), ts:Date.now()});
   3229:     syncWindowCaches();
   3230:     if(saveDirect) epSaveServerDbToServer();
   3231:   }
```

### around line 3443

```js
   3431:  * DATABASE FUNCTION: syncWindowCaches
   3432:  * ========================================================= */
   3433: function syncWindowCaches(){
   3434:     try{
   3435:       window.EP_MY_MAT = EP_MY_MAT;
   3436:       window.EP_MY_WORK = EP_MY_WORK;
   3437:       window.EP_GLOBAL_MAT = EP_SERVER_MAT;
   3438:       window.EP_GLOBAL_WORK = EP_SERVER_WORK;
   3439:       window.EP_FORCE_GLOBAL = {matDB:EP_SERVER_MAT, workDB:EP_SERVER_WORK};
   3440:       window.EP_ULTIMATE_DB_CACHE = {matDB:EP_SERVER_MAT, workDB:EP_SERVER_WORK, ts:Date.now()};
   3441:       window.EP_GLOBAL_DB_VISIBLE_CACHE = {matDB:EP_SERVER_MAT, workDB:EP_SERVER_WORK, ts:Date.now()};
   3442:       window.userMatDB = EP_MY_MAT;
>> 3443:       window.userWorkDB = EP_MY_WORK;
   3444:       if(scope()==='global'){ matDB = EP_SERVER_MAT.slice(); workDB = EP_SERVER_WORK.slice(); }
   3445:       else { matDB = EP_MY_MAT.slice(); workDB = EP_MY_WORK.slice(); }
   3446:     }catch(e){}
   3447:   }
   3448: 
   3449:   
   3450: 
   3451: 
   3452: /* =========================================================
   3453:  * DATABASE FUNCTION: saveMyLocal
   3454:  * ========================================================= */
   3455: function saveMyLocal(type, arr){
   3456:     arr = unique(arr||[], type);
   3457:     if(type==='work') EP_MY_WORK = arr; else EP_MY_MAT = arr;
   3458:     setLS(LS_MY_MAT, EP_MY_MAT);
   3459:     setLS(LS_MY_WORK, EP_MY_WORK);
   3460:     try{ localStorage.setItem(LS_MASTER_CREATED,'1'); }catch(e){}
   3461:     syncWindowCaches();
   3462:     epSaveMyDbToServer();
   3463:   }
   3464: 
   3465:   
```

### around line 3895

```js
   3883:   }
   3884:   
   3885: 
   3886: 
   3887: /* =========================================================
   3888:  * DATABASE FUNCTION: setMy
   3889:  * ========================================================= */
   3890: function setMy(type,arr){
   3891:     arr = unique(arr, type);
   3892:     if(type === 'work') window.EP_MY_WORK = arr; else window.EP_MY_MAT = arr;
   3893:     writeArr(LS_MY_MAT, type === 'mat' ? arr : getMy('mat'));
   3894:     writeArr(LS_MY_WORK, type === 'work' ? arr : getMy('work'));
>> 3895:     try{ window.userMatDB = getMy('mat'); window.userWorkDB = getMy('work'); }catch(e){}
   3896:     syncMainArrays('my');
   3897:   }
   3898:   
   3899: 
   3900: 
   3901: /* =========================================================
   3902:  * DATABASE FUNCTION: setServer
   3903:  * ========================================================= */
   3904: function setServer(type,arr){
   3905:     arr = unique(arr, type);
   3906:     if(type === 'work') window.EP_GLOBAL_WORK = arr; else window.EP_GLOBAL_MAT = arr;
   3907:     var mat = type === 'mat' ? arr : getServer('mat');
   3908:     var work = type === 'work' ? arr : getServer('work');
   3909:     try{
   3910:       window.EP_FORCE_GLOBAL = {matDB:mat, workDB:work};
   3911:       window.EP_ULTIMATE_DB_CACHE = {matDB:mat, workDB:work, ts:Date.now()};
   3912:       window.EP_GLOBAL_DB_VISIBLE_CACHE = {matDB:mat, workDB:work, ts:Date.now()};
   3913:     }catch(e){}
   3914:     writeObj(LS_SERVER_CACHE, {matDB:mat, workDB:work, ts:Date.now()});
   3915:     syncMainArrays('global');
   3916:   }
   3917:   
```

### around line 4015

```js
   4003:   
   4004: 
   4005: 
   4006: /* =========================================================
   4007:  * DATABASE FUNCTION: setMyArrays
   4008:  * ========================================================= */
   4009: function setMyArrays(mat,work){
   4010:     mat = unique(mat || [], 'mat');
   4011:     work = unique(work || [], 'work');
   4012:     window.EP_MY_MAT = mat;
   4013:     window.EP_MY_WORK = work;
   4014:     window.userMatDB = mat;
>> 4015:     window.userWorkDB = work;
   4016:     writeArr(LS_MY_MAT, mat);
   4017:     writeArr(LS_MY_WORK, work);
   4018:   }
   4019:   
   4020: 
   4021: 
   4022: /* =========================================================
   4023:  * DATABASE FUNCTION: setServerArrays
   4024:  * ========================================================= */
   4025: function setServerArrays(mat,work){
   4026:     mat = unique(mat || [], 'mat');
   4027:     work = unique(work || [], 'work');
   4028:     window.EP_GLOBAL_MAT = mat;
   4029:     window.EP_GLOBAL_WORK = work;
   4030:     window.EP_FORCE_GLOBAL = {matDB:mat, workDB:work};
   4031:     window.EP_ULTIMATE_DB_CACHE = {matDB:mat, workDB:work, ts:Date.now()};
   4032:     window.EP_GLOBAL_DB_VISIBLE_CACHE = {matDB:mat, workDB:work, ts:Date.now()};
   4033:     writeObj(LS_SERVER_CACHE, {matDB:mat, workDB:work, ts:Date.now()});
   4034:   }
   4035:   
   4036: 
   4037: 
```


# FILE: public/js/database.js


## renderDbEditors

Найдено строк: 61, 62, 108

### around line 61

```js
   49: }
   50: 
   51: 
   52: // === switchDbTab ===
   53: function switchDbTab(tab) { 
   54:     document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active')); 
   55:     document.getElementById(tab === 'mat' ? 'btnTabMat' : 'btnTabWork').classList.add('active'); 
   56:     document.getElementById('editor-mat-list').style.display = tab === 'mat' ? 'block' : 'none'; 
   57:     document.getElementById('editor-work-list').style.display = tab === 'work' ? 'block' : 'none'; 
   58: }
   59: 
   60: 
>> 61: // === renderDbEditors ===
   62: function renderDbEditors() {
   63:     let catsM = [...new Set(matDB.map(m=>m.c || 'Разное'))];
   64:     let catsW = [...new Set(workDB.map(w=>w.c || 'Разное'))];
   65:     document.getElementById('db-cats').innerHTML = [...new Set([...catsM, ...catsW])].map(c=>`<option value="${c}">`).join('');
   66: 
   67:     let htmlMat = '';
   68:     let mGroups = {}; matDB.forEach(m => { mGroups[m.c||'Разное'] = mGroups[m.c||'Разное'] || []; mGroups[m.c||'Разное'].push(m); });
   69:     Object.keys(mGroups).forEach((c, idx) => {
   70:         let sid = 'db_m_'+idx;
   71:         htmlMat += `<div class="cat-header" onclick="toggleCat('${sid}')">${c}</div><div class="cat-body" id="${sid}">`;
   72:         mGroups[c].forEach(m => {
   73:             htmlMat += `<div class="emp-row"><div><b>${m.n}</b><br><span style="color:var(--gray);font-size:10px;">${m.p} ₽ / ${m.u}</span></div> <input type="number" value="${m.p}" onchange="requestPriceChange('mat', '${m.id}', this.value)" style="width:60px;margin:0;padding:4px;text-align:center;"></div>`;
   74:         });
   75:         htmlMat += `</div>`;
   76:     });
   77:     document.getElementById('editor-mat-list').innerHTML = htmlMat;
   78: 
   79:     let htmlWork = '';
   80:     let wGroups = {}; workDB.forEach(w => { wGroups[w.c||'Разное'] = wGroups[w.c||'Разное'] || []; wGroups[w.c||'Разное'].push(w); });
   81:     Object.keys(wGroups).forEach((c, idx) => {
   82:         let sid = 'db_w_'+idx;
   83:         htmlWork += `<div class="cat-header" style="color:var(--orange); border-color:rgba(245,158,11,0.2); background:rgba(245,158,11,0.08);" onclick="toggleCat('${sid}')">${c}</div><div class="cat-body" id="${sid}">`;
```

### around line 62

```js
   50: 
   51: 
   52: // === switchDbTab ===
   53: function switchDbTab(tab) { 
   54:     document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active')); 
   55:     document.getElementById(tab === 'mat' ? 'btnTabMat' : 'btnTabWork').classList.add('active'); 
   56:     document.getElementById('editor-mat-list').style.display = tab === 'mat' ? 'block' : 'none'; 
   57:     document.getElementById('editor-work-list').style.display = tab === 'work' ? 'block' : 'none'; 
   58: }
   59: 
   60: 
   61: // === renderDbEditors ===
>> 62: function renderDbEditors() {
   63:     let catsM = [...new Set(matDB.map(m=>m.c || 'Разное'))];
   64:     let catsW = [...new Set(workDB.map(w=>w.c || 'Разное'))];
   65:     document.getElementById('db-cats').innerHTML = [...new Set([...catsM, ...catsW])].map(c=>`<option value="${c}">`).join('');
   66: 
   67:     let htmlMat = '';
   68:     let mGroups = {}; matDB.forEach(m => { mGroups[m.c||'Разное'] = mGroups[m.c||'Разное'] || []; mGroups[m.c||'Разное'].push(m); });
   69:     Object.keys(mGroups).forEach((c, idx) => {
   70:         let sid = 'db_m_'+idx;
   71:         htmlMat += `<div class="cat-header" onclick="toggleCat('${sid}')">${c}</div><div class="cat-body" id="${sid}">`;
   72:         mGroups[c].forEach(m => {
   73:             htmlMat += `<div class="emp-row"><div><b>${m.n}</b><br><span style="color:var(--gray);font-size:10px;">${m.p} ₽ / ${m.u}</span></div> <input type="number" value="${m.p}" onchange="requestPriceChange('mat', '${m.id}', this.value)" style="width:60px;margin:0;padding:4px;text-align:center;"></div>`;
   74:         });
   75:         htmlMat += `</div>`;
   76:     });
   77:     document.getElementById('editor-mat-list').innerHTML = htmlMat;
   78: 
   79:     let htmlWork = '';
   80:     let wGroups = {}; workDB.forEach(w => { wGroups[w.c||'Разное'] = wGroups[w.c||'Разное'] || []; wGroups[w.c||'Разное'].push(w); });
   81:     Object.keys(wGroups).forEach((c, idx) => {
   82:         let sid = 'db_w_'+idx;
   83:         htmlWork += `<div class="cat-header" style="color:var(--orange); border-color:rgba(245,158,11,0.2); background:rgba(245,158,11,0.08);" onclick="toggleCat('${sid}')">${c}</div><div class="cat-body" id="${sid}">`;
   84:         wGroups[c].forEach(w => {
```

### around line 108

```js
   96:     let name = document.getElementById('db-new-name').value.trim();
   97:     let price = Number(document.getElementById('db-new-price').value) || 0;
   98:     let unit = document.getElementById('db-new-unit').value.trim() || 'шт';
   99:     let isMat = document.getElementById('editor-mat-list').style.display !== 'none';
   100:     
   101:     if(!name) return showToast("Введите название!");
   102:     
   103:     let newItem = { id: (isMat?'m':'w') + Date.now(), c: cat, n: name, p: price, u: unit };
   104:     if(isMat) matDB.push(newItem); else workDB.push(newItem);
   105:     
   106:     try { if(db) await db.collection('settings').doc('global_db').set({matDB: matDB, workDB: workDB}); } catch(e){}
   107:     
>> 108:     renderDbEditors();
   109:     document.getElementById('db-new-name').value = ''; document.getElementById('db-new-price').value = '';
   110:     showToast("✅ Позиция добавлена");
   111: }
   112: 
   113: 
   114: // === requestPriceChange ===
   115: async function requestPriceChange(type, id, newPrice) { 
   116:     newPrice = Number(newPrice); 
   117:     if (appUser.role === 'admin') { 
   118:         let dbArr = type === 'mat' ? matDB : workDB; let item = dbArr.find(x => x.id === id); 
   119:         if (item) item.p = newPrice; priceOverrides[id] = newPrice; 
   120:         try { if(db) { await db.collection('settings').doc('price_overrides').set({overrides: priceOverrides}); await db.collection('settings').doc('global_db').set({matDB: matDB, workDB: workDB}); } } catch(e){} 
   121:         showToast("✅ Цена изменена"); 
   122:     } else { showToast("Отправлено админу"); } 
   123: }
```


## openMatCatalog

Найдено строк: 4, 5

### around line 4

```js
   1: // === DATABASE / MATERIALS / WORKS ===
   2: 
   3: 
>> 4: // === openMatCatalog ===
   5: function openMatCatalog() { 
   6:     let cats = {}; matDB.forEach(m => { let c = m.c || "ОБЩЕЕ"; if(!cats[c]) cats[c] = []; cats[c].push(m); }); 
   7:     let html = ""; let idx = 0;
   8:     for(let c in cats) { 
   9:         let sid = 'mcat_' + (idx++);
   10:         html += `<div class="cat-header" onclick="toggleCat('${sid}')">${c}</div><div class="cat-body" id="${sid}">`;
   11:         cats[c].forEach(m => { html += `<div class="mat-item"><div style="flex:1; font-size:12px; font-weight:600;">${m.n}<br><span style="color:var(--gray); font-size:11px; font-weight:normal;">${m.p} P / ${m.u}</span></div><button class="mat-add-btn" onclick="promptAdd('${m.id}', 'mat')">+ Добавить</button></div>`; });
   12:         html += `</div>`;
   13:     } document.getElementById('mat-cat-list').innerHTML = html; openModal('matCatModal'); 
   14: }
   15: 
   16: 
   17: // === openWorkCatalog ===
   18: function openWorkCatalog() { 
   19:     let cats = {}; workDB.forEach(w => { let c = w.c || "ОБЩЕЕ"; if(!cats[c]) cats[c] = []; cats[c].push(w); });
   20:     let html = ""; let idx = 0;
   21:     for(let c in cats) { 
   22:         let sid = 'wcat_' + (idx++);
   23:         html += `<div class="cat-header" style="color:var(--orange); border-color:rgba(245,158,11,0.2); background:rgba(245,158,11,0.08);" onclick="toggleCat('${sid}')">${c}</div><div class="cat-body" id="${sid}">`;
   24:         cats[c].forEach(w => { html += `<div class="mat-item"><div style="flex:1; font-size:12px; font-weight:600;">${w.n}<br><span style="color:var(--gray); font-size:11px; font-weight:normal;">${w.p} P / ${w.u}</span></div><button class="mat-add-btn" style="background:var(--orange);" onclick="promptAdd('${w.id}', 'work')">+ Добавить</button></div>`; });
   25:         html += `</div>`;
   26:     } document.getElementById('work-cat-list').innerHTML = html; openModal('workModal'); 
```

### around line 5

```js
   1: // === DATABASE / MATERIALS / WORKS ===
   2: 
   3: 
   4: // === openMatCatalog ===
>> 5: function openMatCatalog() { 
   6:     let cats = {}; matDB.forEach(m => { let c = m.c || "ОБЩЕЕ"; if(!cats[c]) cats[c] = []; cats[c].push(m); }); 
   7:     let html = ""; let idx = 0;
   8:     for(let c in cats) { 
   9:         let sid = 'mcat_' + (idx++);
   10:         html += `<div class="cat-header" onclick="toggleCat('${sid}')">${c}</div><div class="cat-body" id="${sid}">`;
   11:         cats[c].forEach(m => { html += `<div class="mat-item"><div style="flex:1; font-size:12px; font-weight:600;">${m.n}<br><span style="color:var(--gray); font-size:11px; font-weight:normal;">${m.p} P / ${m.u}</span></div><button class="mat-add-btn" onclick="promptAdd('${m.id}', 'mat')">+ Добавить</button></div>`; });
   12:         html += `</div>`;
   13:     } document.getElementById('mat-cat-list').innerHTML = html; openModal('matCatModal'); 
   14: }
   15: 
   16: 
   17: // === openWorkCatalog ===
   18: function openWorkCatalog() { 
   19:     let cats = {}; workDB.forEach(w => { let c = w.c || "ОБЩЕЕ"; if(!cats[c]) cats[c] = []; cats[c].push(w); });
   20:     let html = ""; let idx = 0;
   21:     for(let c in cats) { 
   22:         let sid = 'wcat_' + (idx++);
   23:         html += `<div class="cat-header" style="color:var(--orange); border-color:rgba(245,158,11,0.2); background:rgba(245,158,11,0.08);" onclick="toggleCat('${sid}')">${c}</div><div class="cat-body" id="${sid}">`;
   24:         cats[c].forEach(w => { html += `<div class="mat-item"><div style="flex:1; font-size:12px; font-weight:600;">${w.n}<br><span style="color:var(--gray); font-size:11px; font-weight:normal;">${w.p} P / ${w.u}</span></div><button class="mat-add-btn" style="background:var(--orange);" onclick="promptAdd('${w.id}', 'work')">+ Добавить</button></div>`; });
   25:         html += `</div>`;
   26:     } document.getElementById('work-cat-list').innerHTML = html; openModal('workModal'); 
   27: }
```


## openWorkCatalog

Найдено строк: 17, 18

### around line 17

```js
   5: function openMatCatalog() { 
   6:     let cats = {}; matDB.forEach(m => { let c = m.c || "ОБЩЕЕ"; if(!cats[c]) cats[c] = []; cats[c].push(m); }); 
   7:     let html = ""; let idx = 0;
   8:     for(let c in cats) { 
   9:         let sid = 'mcat_' + (idx++);
   10:         html += `<div class="cat-header" onclick="toggleCat('${sid}')">${c}</div><div class="cat-body" id="${sid}">`;
   11:         cats[c].forEach(m => { html += `<div class="mat-item"><div style="flex:1; font-size:12px; font-weight:600;">${m.n}<br><span style="color:var(--gray); font-size:11px; font-weight:normal;">${m.p} P / ${m.u}</span></div><button class="mat-add-btn" onclick="promptAdd('${m.id}', 'mat')">+ Добавить</button></div>`; });
   12:         html += `</div>`;
   13:     } document.getElementById('mat-cat-list').innerHTML = html; openModal('matCatModal'); 
   14: }
   15: 
   16: 
>> 17: // === openWorkCatalog ===
   18: function openWorkCatalog() { 
   19:     let cats = {}; workDB.forEach(w => { let c = w.c || "ОБЩЕЕ"; if(!cats[c]) cats[c] = []; cats[c].push(w); });
   20:     let html = ""; let idx = 0;
   21:     for(let c in cats) { 
   22:         let sid = 'wcat_' + (idx++);
   23:         html += `<div class="cat-header" style="color:var(--orange); border-color:rgba(245,158,11,0.2); background:rgba(245,158,11,0.08);" onclick="toggleCat('${sid}')">${c}</div><div class="cat-body" id="${sid}">`;
   24:         cats[c].forEach(w => { html += `<div class="mat-item"><div style="flex:1; font-size:12px; font-weight:600;">${w.n}<br><span style="color:var(--gray); font-size:11px; font-weight:normal;">${w.p} P / ${w.u}</span></div><button class="mat-add-btn" style="background:var(--orange);" onclick="promptAdd('${w.id}', 'work')">+ Добавить</button></div>`; });
   25:         html += `</div>`;
   26:     } document.getElementById('work-cat-list').innerHTML = html; openModal('workModal'); 
   27: }
   28: 
   29: 
   30: // === toggleCat ===
   31: function toggleCat(id) { let el = document.getElementById(id); el.classList.toggle('active'); }
   32: 
   33: 
   34: // === promptAdd ===
   35: function promptAdd(id, type) { 
   36:     let dbArr = (type==='mat'?matDB:workDB); let item = dbArr.find(x => String(x.id) === String(id)); 
   37:     if(!item) return; pendingAdd = { item, type }; 
   38:     document.getElementById('qty-prompt-name').innerText = item.n; 
   39:     document.getElementById('qty-input').value = 1; 
```

### around line 18

```js
   6:     let cats = {}; matDB.forEach(m => { let c = m.c || "ОБЩЕЕ"; if(!cats[c]) cats[c] = []; cats[c].push(m); }); 
   7:     let html = ""; let idx = 0;
   8:     for(let c in cats) { 
   9:         let sid = 'mcat_' + (idx++);
   10:         html += `<div class="cat-header" onclick="toggleCat('${sid}')">${c}</div><div class="cat-body" id="${sid}">`;
   11:         cats[c].forEach(m => { html += `<div class="mat-item"><div style="flex:1; font-size:12px; font-weight:600;">${m.n}<br><span style="color:var(--gray); font-size:11px; font-weight:normal;">${m.p} P / ${m.u}</span></div><button class="mat-add-btn" onclick="promptAdd('${m.id}', 'mat')">+ Добавить</button></div>`; });
   12:         html += `</div>`;
   13:     } document.getElementById('mat-cat-list').innerHTML = html; openModal('matCatModal'); 
   14: }
   15: 
   16: 
   17: // === openWorkCatalog ===
>> 18: function openWorkCatalog() { 
   19:     let cats = {}; workDB.forEach(w => { let c = w.c || "ОБЩЕЕ"; if(!cats[c]) cats[c] = []; cats[c].push(w); });
   20:     let html = ""; let idx = 0;
   21:     for(let c in cats) { 
   22:         let sid = 'wcat_' + (idx++);
   23:         html += `<div class="cat-header" style="color:var(--orange); border-color:rgba(245,158,11,0.2); background:rgba(245,158,11,0.08);" onclick="toggleCat('${sid}')">${c}</div><div class="cat-body" id="${sid}">`;
   24:         cats[c].forEach(w => { html += `<div class="mat-item"><div style="flex:1; font-size:12px; font-weight:600;">${w.n}<br><span style="color:var(--gray); font-size:11px; font-weight:normal;">${w.p} P / ${w.u}</span></div><button class="mat-add-btn" style="background:var(--orange);" onclick="promptAdd('${w.id}', 'work')">+ Добавить</button></div>`; });
   25:         html += `</div>`;
   26:     } document.getElementById('work-cat-list').innerHTML = html; openModal('workModal'); 
   27: }
   28: 
   29: 
   30: // === toggleCat ===
   31: function toggleCat(id) { let el = document.getElementById(id); el.classList.toggle('active'); }
   32: 
   33: 
   34: // === promptAdd ===
   35: function promptAdd(id, type) { 
   36:     let dbArr = (type==='mat'?matDB:workDB); let item = dbArr.find(x => String(x.id) === String(id)); 
   37:     if(!item) return; pendingAdd = { item, type }; 
   38:     document.getElementById('qty-prompt-name').innerText = item.n; 
   39:     document.getElementById('qty-input').value = 1; 
   40:     openModal('qtyPromptModal'); 
```


## matDB

Найдено строк: 6, 36, 63, 68, 104, 106, 118, 120

### around line 6

```js
   1: // === DATABASE / MATERIALS / WORKS ===
   2: 
   3: 
   4: // === openMatCatalog ===
   5: function openMatCatalog() { 
>> 6:     let cats = {}; matDB.forEach(m => { let c = m.c || "ОБЩЕЕ"; if(!cats[c]) cats[c] = []; cats[c].push(m); }); 
   7:     let html = ""; let idx = 0;
   8:     for(let c in cats) { 
   9:         let sid = 'mcat_' + (idx++);
   10:         html += `<div class="cat-header" onclick="toggleCat('${sid}')">${c}</div><div class="cat-body" id="${sid}">`;
   11:         cats[c].forEach(m => { html += `<div class="mat-item"><div style="flex:1; font-size:12px; font-weight:600;">${m.n}<br><span style="color:var(--gray); font-size:11px; font-weight:normal;">${m.p} P / ${m.u}</span></div><button class="mat-add-btn" onclick="promptAdd('${m.id}', 'mat')">+ Добавить</button></div>`; });
   12:         html += `</div>`;
   13:     } document.getElementById('mat-cat-list').innerHTML = html; openModal('matCatModal'); 
   14: }
   15: 
   16: 
   17: // === openWorkCatalog ===
   18: function openWorkCatalog() { 
   19:     let cats = {}; workDB.forEach(w => { let c = w.c || "ОБЩЕЕ"; if(!cats[c]) cats[c] = []; cats[c].push(w); });
   20:     let html = ""; let idx = 0;
   21:     for(let c in cats) { 
   22:         let sid = 'wcat_' + (idx++);
   23:         html += `<div class="cat-header" style="color:var(--orange); border-color:rgba(245,158,11,0.2); background:rgba(245,158,11,0.08);" onclick="toggleCat('${sid}')">${c}</div><div class="cat-body" id="${sid}">`;
   24:         cats[c].forEach(w => { html += `<div class="mat-item"><div style="flex:1; font-size:12px; font-weight:600;">${w.n}<br><span style="color:var(--gray); font-size:11px; font-weight:normal;">${w.p} P / ${w.u}</span></div><button class="mat-add-btn" style="background:var(--orange);" onclick="promptAdd('${w.id}', 'work')">+ Добавить</button></div>`; });
   25:         html += `</div>`;
   26:     } document.getElementById('work-cat-list').innerHTML = html; openModal('workModal'); 
   27: }
   28: 
```

### around line 36

```js
   24:         cats[c].forEach(w => { html += `<div class="mat-item"><div style="flex:1; font-size:12px; font-weight:600;">${w.n}<br><span style="color:var(--gray); font-size:11px; font-weight:normal;">${w.p} P / ${w.u}</span></div><button class="mat-add-btn" style="background:var(--orange);" onclick="promptAdd('${w.id}', 'work')">+ Добавить</button></div>`; });
   25:         html += `</div>`;
   26:     } document.getElementById('work-cat-list').innerHTML = html; openModal('workModal'); 
   27: }
   28: 
   29: 
   30: // === toggleCat ===
   31: function toggleCat(id) { let el = document.getElementById(id); el.classList.toggle('active'); }
   32: 
   33: 
   34: // === promptAdd ===
   35: function promptAdd(id, type) { 
>> 36:     let dbArr = (type==='mat'?matDB:workDB); let item = dbArr.find(x => String(x.id) === String(id)); 
   37:     if(!item) return; pendingAdd = { item, type }; 
   38:     document.getElementById('qty-prompt-name').innerText = item.n; 
   39:     document.getElementById('qty-input').value = 1; 
   40:     openModal('qtyPromptModal'); 
   41: }
   42: 
   43: 
   44: // === confirmQtyAdd ===
   45: function confirmQtyAdd() { 
   46:     let q = Number(document.getElementById('qty-input').value); 
   47:     if(q > 0) { addAuto([{...pendingAdd.item, q: q, type: pendingAdd.type}], 'man_'+Date.now()); } 
   48:     closeModal('qtyPromptModal'); showToast("Добавлено!");
   49: }
   50: 
   51: 
   52: // === switchDbTab ===
   53: function switchDbTab(tab) { 
   54:     document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active')); 
   55:     document.getElementById(tab === 'mat' ? 'btnTabMat' : 'btnTabWork').classList.add('active'); 
   56:     document.getElementById('editor-mat-list').style.display = tab === 'mat' ? 'block' : 'none'; 
   57:     document.getElementById('editor-work-list').style.display = tab === 'work' ? 'block' : 'none'; 
   58: }
```

### around line 63

```js
   51: 
   52: // === switchDbTab ===
   53: function switchDbTab(tab) { 
   54:     document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active')); 
   55:     document.getElementById(tab === 'mat' ? 'btnTabMat' : 'btnTabWork').classList.add('active'); 
   56:     document.getElementById('editor-mat-list').style.display = tab === 'mat' ? 'block' : 'none'; 
   57:     document.getElementById('editor-work-list').style.display = tab === 'work' ? 'block' : 'none'; 
   58: }
   59: 
   60: 
   61: // === renderDbEditors ===
   62: function renderDbEditors() {
>> 63:     let catsM = [...new Set(matDB.map(m=>m.c || 'Разное'))];
   64:     let catsW = [...new Set(workDB.map(w=>w.c || 'Разное'))];
   65:     document.getElementById('db-cats').innerHTML = [...new Set([...catsM, ...catsW])].map(c=>`<option value="${c}">`).join('');
   66: 
   67:     let htmlMat = '';
   68:     let mGroups = {}; matDB.forEach(m => { mGroups[m.c||'Разное'] = mGroups[m.c||'Разное'] || []; mGroups[m.c||'Разное'].push(m); });
   69:     Object.keys(mGroups).forEach((c, idx) => {
   70:         let sid = 'db_m_'+idx;
   71:         htmlMat += `<div class="cat-header" onclick="toggleCat('${sid}')">${c}</div><div class="cat-body" id="${sid}">`;
   72:         mGroups[c].forEach(m => {
   73:             htmlMat += `<div class="emp-row"><div><b>${m.n}</b><br><span style="color:var(--gray);font-size:10px;">${m.p} ₽ / ${m.u}</span></div> <input type="number" value="${m.p}" onchange="requestPriceChange('mat', '${m.id}', this.value)" style="width:60px;margin:0;padding:4px;text-align:center;"></div>`;
   74:         });
   75:         htmlMat += `</div>`;
   76:     });
   77:     document.getElementById('editor-mat-list').innerHTML = htmlMat;
   78: 
   79:     let htmlWork = '';
   80:     let wGroups = {}; workDB.forEach(w => { wGroups[w.c||'Разное'] = wGroups[w.c||'Разное'] || []; wGroups[w.c||'Разное'].push(w); });
   81:     Object.keys(wGroups).forEach((c, idx) => {
   82:         let sid = 'db_w_'+idx;
   83:         htmlWork += `<div class="cat-header" style="color:var(--orange); border-color:rgba(245,158,11,0.2); background:rgba(245,158,11,0.08);" onclick="toggleCat('${sid}')">${c}</div><div class="cat-body" id="${sid}">`;
   84:         wGroups[c].forEach(w => {
   85:             htmlWork += `<div class="emp-row"><div><b>${w.n}</b><br><span style="color:var(--gray);font-size:10px;">${w.p} ₽ / ${w.u}</span></div> <input type="number" value="${w.p}" onchange="requestPriceChange('work', '${w.id}', this.value)" style="width:60px;margin:0;padding:4px;text-align:center;"></div>`;
```

### around line 68

```js
   56:     document.getElementById('editor-mat-list').style.display = tab === 'mat' ? 'block' : 'none'; 
   57:     document.getElementById('editor-work-list').style.display = tab === 'work' ? 'block' : 'none'; 
   58: }
   59: 
   60: 
   61: // === renderDbEditors ===
   62: function renderDbEditors() {
   63:     let catsM = [...new Set(matDB.map(m=>m.c || 'Разное'))];
   64:     let catsW = [...new Set(workDB.map(w=>w.c || 'Разное'))];
   65:     document.getElementById('db-cats').innerHTML = [...new Set([...catsM, ...catsW])].map(c=>`<option value="${c}">`).join('');
   66: 
   67:     let htmlMat = '';
>> 68:     let mGroups = {}; matDB.forEach(m => { mGroups[m.c||'Разное'] = mGroups[m.c||'Разное'] || []; mGroups[m.c||'Разное'].push(m); });
   69:     Object.keys(mGroups).forEach((c, idx) => {
   70:         let sid = 'db_m_'+idx;
   71:         htmlMat += `<div class="cat-header" onclick="toggleCat('${sid}')">${c}</div><div class="cat-body" id="${sid}">`;
   72:         mGroups[c].forEach(m => {
   73:             htmlMat += `<div class="emp-row"><div><b>${m.n}</b><br><span style="color:var(--gray);font-size:10px;">${m.p} ₽ / ${m.u}</span></div> <input type="number" value="${m.p}" onchange="requestPriceChange('mat', '${m.id}', this.value)" style="width:60px;margin:0;padding:4px;text-align:center;"></div>`;
   74:         });
   75:         htmlMat += `</div>`;
   76:     });
   77:     document.getElementById('editor-mat-list').innerHTML = htmlMat;
   78: 
   79:     let htmlWork = '';
   80:     let wGroups = {}; workDB.forEach(w => { wGroups[w.c||'Разное'] = wGroups[w.c||'Разное'] || []; wGroups[w.c||'Разное'].push(w); });
   81:     Object.keys(wGroups).forEach((c, idx) => {
   82:         let sid = 'db_w_'+idx;
   83:         htmlWork += `<div class="cat-header" style="color:var(--orange); border-color:rgba(245,158,11,0.2); background:rgba(245,158,11,0.08);" onclick="toggleCat('${sid}')">${c}</div><div class="cat-body" id="${sid}">`;
   84:         wGroups[c].forEach(w => {
   85:             htmlWork += `<div class="emp-row"><div><b>${w.n}</b><br><span style="color:var(--gray);font-size:10px;">${w.p} ₽ / ${w.u}</span></div> <input type="number" value="${w.p}" onchange="requestPriceChange('work', '${w.id}', this.value)" style="width:60px;margin:0;padding:4px;text-align:center;"></div>`;
   86:         });
   87:         htmlWork += `</div>`;
   88:     });
   89:     document.getElementById('editor-work-list').innerHTML = htmlWork;
   90: }
```

### around line 104

```js
   92: // === addDbItem ===
   93: async function addDbItem() {
   94:     if(appUser.role !== 'admin') return showToast("Только админ может добавлять");
   95:     let cat = document.getElementById('db-new-cat').value.trim() || 'Разное';
   96:     let name = document.getElementById('db-new-name').value.trim();
   97:     let price = Number(document.getElementById('db-new-price').value) || 0;
   98:     let unit = document.getElementById('db-new-unit').value.trim() || 'шт';
   99:     let isMat = document.getElementById('editor-mat-list').style.display !== 'none';
   100:     
   101:     if(!name) return showToast("Введите название!");
   102:     
   103:     let newItem = { id: (isMat?'m':'w') + Date.now(), c: cat, n: name, p: price, u: unit };
>> 104:     if(isMat) matDB.push(newItem); else workDB.push(newItem);
   105:     
   106:     try { if(db) await db.collection('settings').doc('global_db').set({matDB: matDB, workDB: workDB}); } catch(e){}
   107:     
   108:     renderDbEditors();
   109:     document.getElementById('db-new-name').value = ''; document.getElementById('db-new-price').value = '';
   110:     showToast("✅ Позиция добавлена");
   111: }
   112: 
   113: 
   114: // === requestPriceChange ===
   115: async function requestPriceChange(type, id, newPrice) { 
   116:     newPrice = Number(newPrice); 
   117:     if (appUser.role === 'admin') { 
   118:         let dbArr = type === 'mat' ? matDB : workDB; let item = dbArr.find(x => x.id === id); 
   119:         if (item) item.p = newPrice; priceOverrides[id] = newPrice; 
   120:         try { if(db) { await db.collection('settings').doc('price_overrides').set({overrides: priceOverrides}); await db.collection('settings').doc('global_db').set({matDB: matDB, workDB: workDB}); } } catch(e){} 
   121:         showToast("✅ Цена изменена"); 
   122:     } else { showToast("Отправлено админу"); } 
   123: }
```


## workDB

Найдено строк: 19, 36, 64, 80, 104, 106, 118, 120

### around line 19

```js
   7:     let html = ""; let idx = 0;
   8:     for(let c in cats) { 
   9:         let sid = 'mcat_' + (idx++);
   10:         html += `<div class="cat-header" onclick="toggleCat('${sid}')">${c}</div><div class="cat-body" id="${sid}">`;
   11:         cats[c].forEach(m => { html += `<div class="mat-item"><div style="flex:1; font-size:12px; font-weight:600;">${m.n}<br><span style="color:var(--gray); font-size:11px; font-weight:normal;">${m.p} P / ${m.u}</span></div><button class="mat-add-btn" onclick="promptAdd('${m.id}', 'mat')">+ Добавить</button></div>`; });
   12:         html += `</div>`;
   13:     } document.getElementById('mat-cat-list').innerHTML = html; openModal('matCatModal'); 
   14: }
   15: 
   16: 
   17: // === openWorkCatalog ===
   18: function openWorkCatalog() { 
>> 19:     let cats = {}; workDB.forEach(w => { let c = w.c || "ОБЩЕЕ"; if(!cats[c]) cats[c] = []; cats[c].push(w); });
   20:     let html = ""; let idx = 0;
   21:     for(let c in cats) { 
   22:         let sid = 'wcat_' + (idx++);
   23:         html += `<div class="cat-header" style="color:var(--orange); border-color:rgba(245,158,11,0.2); background:rgba(245,158,11,0.08);" onclick="toggleCat('${sid}')">${c}</div><div class="cat-body" id="${sid}">`;
   24:         cats[c].forEach(w => { html += `<div class="mat-item"><div style="flex:1; font-size:12px; font-weight:600;">${w.n}<br><span style="color:var(--gray); font-size:11px; font-weight:normal;">${w.p} P / ${w.u}</span></div><button class="mat-add-btn" style="background:var(--orange);" onclick="promptAdd('${w.id}', 'work')">+ Добавить</button></div>`; });
   25:         html += `</div>`;
   26:     } document.getElementById('work-cat-list').innerHTML = html; openModal('workModal'); 
   27: }
   28: 
   29: 
   30: // === toggleCat ===
   31: function toggleCat(id) { let el = document.getElementById(id); el.classList.toggle('active'); }
   32: 
   33: 
   34: // === promptAdd ===
   35: function promptAdd(id, type) { 
   36:     let dbArr = (type==='mat'?matDB:workDB); let item = dbArr.find(x => String(x.id) === String(id)); 
   37:     if(!item) return; pendingAdd = { item, type }; 
   38:     document.getElementById('qty-prompt-name').innerText = item.n; 
   39:     document.getElementById('qty-input').value = 1; 
   40:     openModal('qtyPromptModal'); 
   41: }
```

### around line 36

```js
   24:         cats[c].forEach(w => { html += `<div class="mat-item"><div style="flex:1; font-size:12px; font-weight:600;">${w.n}<br><span style="color:var(--gray); font-size:11px; font-weight:normal;">${w.p} P / ${w.u}</span></div><button class="mat-add-btn" style="background:var(--orange);" onclick="promptAdd('${w.id}', 'work')">+ Добавить</button></div>`; });
   25:         html += `</div>`;
   26:     } document.getElementById('work-cat-list').innerHTML = html; openModal('workModal'); 
   27: }
   28: 
   29: 
   30: // === toggleCat ===
   31: function toggleCat(id) { let el = document.getElementById(id); el.classList.toggle('active'); }
   32: 
   33: 
   34: // === promptAdd ===
   35: function promptAdd(id, type) { 
>> 36:     let dbArr = (type==='mat'?matDB:workDB); let item = dbArr.find(x => String(x.id) === String(id)); 
   37:     if(!item) return; pendingAdd = { item, type }; 
   38:     document.getElementById('qty-prompt-name').innerText = item.n; 
   39:     document.getElementById('qty-input').value = 1; 
   40:     openModal('qtyPromptModal'); 
   41: }
   42: 
   43: 
   44: // === confirmQtyAdd ===
   45: function confirmQtyAdd() { 
   46:     let q = Number(document.getElementById('qty-input').value); 
   47:     if(q > 0) { addAuto([{...pendingAdd.item, q: q, type: pendingAdd.type}], 'man_'+Date.now()); } 
   48:     closeModal('qtyPromptModal'); showToast("Добавлено!");
   49: }
   50: 
   51: 
   52: // === switchDbTab ===
   53: function switchDbTab(tab) { 
   54:     document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active')); 
   55:     document.getElementById(tab === 'mat' ? 'btnTabMat' : 'btnTabWork').classList.add('active'); 
   56:     document.getElementById('editor-mat-list').style.display = tab === 'mat' ? 'block' : 'none'; 
   57:     document.getElementById('editor-work-list').style.display = tab === 'work' ? 'block' : 'none'; 
   58: }
```

### around line 64

```js
   52: // === switchDbTab ===
   53: function switchDbTab(tab) { 
   54:     document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active')); 
   55:     document.getElementById(tab === 'mat' ? 'btnTabMat' : 'btnTabWork').classList.add('active'); 
   56:     document.getElementById('editor-mat-list').style.display = tab === 'mat' ? 'block' : 'none'; 
   57:     document.getElementById('editor-work-list').style.display = tab === 'work' ? 'block' : 'none'; 
   58: }
   59: 
   60: 
   61: // === renderDbEditors ===
   62: function renderDbEditors() {
   63:     let catsM = [...new Set(matDB.map(m=>m.c || 'Разное'))];
>> 64:     let catsW = [...new Set(workDB.map(w=>w.c || 'Разное'))];
   65:     document.getElementById('db-cats').innerHTML = [...new Set([...catsM, ...catsW])].map(c=>`<option value="${c}">`).join('');
   66: 
   67:     let htmlMat = '';
   68:     let mGroups = {}; matDB.forEach(m => { mGroups[m.c||'Разное'] = mGroups[m.c||'Разное'] || []; mGroups[m.c||'Разное'].push(m); });
   69:     Object.keys(mGroups).forEach((c, idx) => {
   70:         let sid = 'db_m_'+idx;
   71:         htmlMat += `<div class="cat-header" onclick="toggleCat('${sid}')">${c}</div><div class="cat-body" id="${sid}">`;
   72:         mGroups[c].forEach(m => {
   73:             htmlMat += `<div class="emp-row"><div><b>${m.n}</b><br><span style="color:var(--gray);font-size:10px;">${m.p} ₽ / ${m.u}</span></div> <input type="number" value="${m.p}" onchange="requestPriceChange('mat', '${m.id}', this.value)" style="width:60px;margin:0;padding:4px;text-align:center;"></div>`;
   74:         });
   75:         htmlMat += `</div>`;
   76:     });
   77:     document.getElementById('editor-mat-list').innerHTML = htmlMat;
   78: 
   79:     let htmlWork = '';
   80:     let wGroups = {}; workDB.forEach(w => { wGroups[w.c||'Разное'] = wGroups[w.c||'Разное'] || []; wGroups[w.c||'Разное'].push(w); });
   81:     Object.keys(wGroups).forEach((c, idx) => {
   82:         let sid = 'db_w_'+idx;
   83:         htmlWork += `<div class="cat-header" style="color:var(--orange); border-color:rgba(245,158,11,0.2); background:rgba(245,158,11,0.08);" onclick="toggleCat('${sid}')">${c}</div><div class="cat-body" id="${sid}">`;
   84:         wGroups[c].forEach(w => {
   85:             htmlWork += `<div class="emp-row"><div><b>${w.n}</b><br><span style="color:var(--gray);font-size:10px;">${w.p} ₽ / ${w.u}</span></div> <input type="number" value="${w.p}" onchange="requestPriceChange('work', '${w.id}', this.value)" style="width:60px;margin:0;padding:4px;text-align:center;"></div>`;
   86:         });
```

### around line 80

```js
   68:     let mGroups = {}; matDB.forEach(m => { mGroups[m.c||'Разное'] = mGroups[m.c||'Разное'] || []; mGroups[m.c||'Разное'].push(m); });
   69:     Object.keys(mGroups).forEach((c, idx) => {
   70:         let sid = 'db_m_'+idx;
   71:         htmlMat += `<div class="cat-header" onclick="toggleCat('${sid}')">${c}</div><div class="cat-body" id="${sid}">`;
   72:         mGroups[c].forEach(m => {
   73:             htmlMat += `<div class="emp-row"><div><b>${m.n}</b><br><span style="color:var(--gray);font-size:10px;">${m.p} ₽ / ${m.u}</span></div> <input type="number" value="${m.p}" onchange="requestPriceChange('mat', '${m.id}', this.value)" style="width:60px;margin:0;padding:4px;text-align:center;"></div>`;
   74:         });
   75:         htmlMat += `</div>`;
   76:     });
   77:     document.getElementById('editor-mat-list').innerHTML = htmlMat;
   78: 
   79:     let htmlWork = '';
>> 80:     let wGroups = {}; workDB.forEach(w => { wGroups[w.c||'Разное'] = wGroups[w.c||'Разное'] || []; wGroups[w.c||'Разное'].push(w); });
   81:     Object.keys(wGroups).forEach((c, idx) => {
   82:         let sid = 'db_w_'+idx;
   83:         htmlWork += `<div class="cat-header" style="color:var(--orange); border-color:rgba(245,158,11,0.2); background:rgba(245,158,11,0.08);" onclick="toggleCat('${sid}')">${c}</div><div class="cat-body" id="${sid}">`;
   84:         wGroups[c].forEach(w => {
   85:             htmlWork += `<div class="emp-row"><div><b>${w.n}</b><br><span style="color:var(--gray);font-size:10px;">${w.p} ₽ / ${w.u}</span></div> <input type="number" value="${w.p}" onchange="requestPriceChange('work', '${w.id}', this.value)" style="width:60px;margin:0;padding:4px;text-align:center;"></div>`;
   86:         });
   87:         htmlWork += `</div>`;
   88:     });
   89:     document.getElementById('editor-work-list').innerHTML = htmlWork;
   90: }
   91: 
   92: // === addDbItem ===
   93: async function addDbItem() {
   94:     if(appUser.role !== 'admin') return showToast("Только админ может добавлять");
   95:     let cat = document.getElementById('db-new-cat').value.trim() || 'Разное';
   96:     let name = document.getElementById('db-new-name').value.trim();
   97:     let price = Number(document.getElementById('db-new-price').value) || 0;
   98:     let unit = document.getElementById('db-new-unit').value.trim() || 'шт';
   99:     let isMat = document.getElementById('editor-mat-list').style.display !== 'none';
   100:     
   101:     if(!name) return showToast("Введите название!");
   102:     
```

### around line 104

```js
   92: // === addDbItem ===
   93: async function addDbItem() {
   94:     if(appUser.role !== 'admin') return showToast("Только админ может добавлять");
   95:     let cat = document.getElementById('db-new-cat').value.trim() || 'Разное';
   96:     let name = document.getElementById('db-new-name').value.trim();
   97:     let price = Number(document.getElementById('db-new-price').value) || 0;
   98:     let unit = document.getElementById('db-new-unit').value.trim() || 'шт';
   99:     let isMat = document.getElementById('editor-mat-list').style.display !== 'none';
   100:     
   101:     if(!name) return showToast("Введите название!");
   102:     
   103:     let newItem = { id: (isMat?'m':'w') + Date.now(), c: cat, n: name, p: price, u: unit };
>> 104:     if(isMat) matDB.push(newItem); else workDB.push(newItem);
   105:     
   106:     try { if(db) await db.collection('settings').doc('global_db').set({matDB: matDB, workDB: workDB}); } catch(e){}
   107:     
   108:     renderDbEditors();
   109:     document.getElementById('db-new-name').value = ''; document.getElementById('db-new-price').value = '';
   110:     showToast("✅ Позиция добавлена");
   111: }
   112: 
   113: 
   114: // === requestPriceChange ===
   115: async function requestPriceChange(type, id, newPrice) { 
   116:     newPrice = Number(newPrice); 
   117:     if (appUser.role === 'admin') { 
   118:         let dbArr = type === 'mat' ? matDB : workDB; let item = dbArr.find(x => x.id === id); 
   119:         if (item) item.p = newPrice; priceOverrides[id] = newPrice; 
   120:         try { if(db) { await db.collection('settings').doc('price_overrides').set({overrides: priceOverrides}); await db.collection('settings').doc('global_db').set({matDB: matDB, workDB: workDB}); } } catch(e){} 
   121:         showToast("✅ Цена изменена"); 
   122:     } else { showToast("Отправлено админу"); } 
   123: }
```

