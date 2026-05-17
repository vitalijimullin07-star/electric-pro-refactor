# Function Index

Индекс функций и экспортов после технического выноса JS-блоков.

| Имя | Тип | Файл | Строка | Фрагмент |
|---|---|---|---:|---|
| `$` | function | `public/js/blocks/block-10.js` | 9 | `function $(id){ return document.getElementById(id); }` |
| `$` | function | `public/js/blocks/block-11.js` | 31 | `function $(id){ return document.getElementById(id); }` |
| `$` | function | `public/js/blocks/block-12.js` | 18 | `function $(id){ return document.getElementById(id); }` |
| `$` | function | `public/js/blocks/block-13.js` | 19 | `function $(id){ return document.getElementById(id); }` |
| `$` | function | `public/js/blocks/block-14.js` | 21 | `function $(id){ return document.getElementById(id); }` |
| `$` | function | `public/js/blocks/block-15.js` | 21 | `function $(id){ return document.getElementById(id); }` |
| `$` | function | `public/js/blocks/block-16.js` | 21 | `function $(id){ return document.getElementById(id); }` |
| `$` | function | `public/js/blocks/block-17.js` | 21 | `function $(id){ return document.getElementById(id); }` |
| `$` | function | `public/js/blocks/block-18.js` | 14 | `function $(id){ return document.getElementById(id); }` |
| `$` | function | `public/js/blocks/block-19.js` | 18 | `function $(id){ return document.getElementById(id); }` |
| `$` | function | `public/js/blocks/block-20.js` | 16 | `function $(id){ return document.getElementById(id); }` |
| `$` | function | `public/js/blocks/block-22.js` | 9 | `function $(id){ return document.getElementById(id); }` |
| `$` | function | `public/js/blocks/block-23.js` | 9 | `function $(id){return document.getElementById(id);}` |
| `$` | function | `public/js/blocks/block-24.js` | 10 | `function $(id){ return document.getElementById(id); }` |
| `$` | function | `public/js/blocks/block-25.js` | 16 | `function $(id){ return document.getElementById(id); }` |
| `$` | function | `public/js/blocks/block-26.js` | 10 | `function $(id){ return document.getElementById(id); }` |
| `$` | function | `public/js/blocks/block-27.js` | 11 | `function $(id){ return document.getElementById(id); }` |
| `$` | function | `public/js/blocks/block-28.js` | 15 | `function $(id){ return document.getElementById(id); }` |
| `acs` | arrow/function | `public/js/blocks/block-22.js` | 44 | `var acs=(window.cfg&&Number(cfg.acs))\|\|0, fls=(window.cfg&&Number(cfg.fls))\|\|0; for(var a=1;a<=acs;a++) add('Кондиционер '+a,'C10','climate'); for(var f=1;f` |
| `acs` | arrow/function | `public/js/blocks/block-24.js` | 30 | `var acs=(window.cfg&&Number(cfg.acs))\|\|0, fls=(window.cfg&&Number(cfg.fls))\|\|0; for(var a=1;a<=acs;a++) add('Кондиционер '+a,'C10','climate'); for(var f=1;f` |
| `active` | function | `public/js/blocks/block-15.js` | 43 | `function active(type){ return scope()==='global'?getServer(type):getMy(type); }` |
| `active` | function | `public/js/blocks/block-16.js` | 54 | `function active(type){ return scope()==='global'?getServer(type):getMy(type); }` |
| `activeArr` | function | `public/js/blocks/block-11.js` | 65 | `function activeArr(type){ return scope()==='global' ? serverArr(type) : myArr(type); }` |
| `activeLabel` | function | `public/js/blocks/block-11.js` | 42 | `function activeLabel(){ return scope()==='global' ? '🌍 База сервера' : '👤 Моя база'; }` |
| `activeMatDb` | function | `public/js/blocks/block-27.js` | 29 | `function activeMatDb(){` |
| `activeTarget` | function | `public/js/blocks/block-12.js` | 32 | `function activeTarget(){ return (isAdmin() && scope() === 'global') ? 'global' : 'my'; }` |
| `activeType` | function | `public/js/blocks/block-28.js` | 86 | `function activeType(){` |
| `activeTypeFromUi` | function | `public/js/blocks/block-25.js` | 198 | `function activeTypeFromUi(){ var m=$('editor-mat-list'), w=$('editor-work-list'); if(m && m.offsetParent!==null) return 'mat'; if(w && w.offsetParent!==null) re` |
| `add` | function | `public/js/blocks/block-22.js` | 28 | `function add(v){ v=clean(v); if(v && !/^(позиция щита\|общая\|общая \/ вводная\|назначение не указано)$/i.test(v) && out.indexOf(v)<0) out.push(v); }` |
| `add` | function | `public/js/blocks/block-22.js` | 40 | `function add(name,nom,group){ lines.push({name:name,nominal:nom,group:group}); }` |
| `add` | function | `public/js/blocks/block-23.js` | 156 | `var out=[]; function add(v){v=String(v\|\|'').trim(); if(v && !/позиция щита\|общая \/ вводная\|назначение не указано/i.test(v) && out.indexOf(v)<0) out.push(v)` |
| `add` | function | `public/js/blocks/block-24.js` | 26 | `function add(n,nom,g){ out.push({name:n,nominal:nom,group:g}); }` |
| `add` | function | `public/js/blocks/block-24.js` | 46 | `var out=[]; function add(v){ v=clean(v); if(v && !/^(позиция щита\|общая\|общая \/ вводная\|назначение не указано)/i.test(v) && out.indexOf(v)<0) out.push(v); }` |
| `add` | function | `public/js/blocks/block-25.js` | 121 | `function mergeAssignments(rec,it){ var arr=rec.epAssignments\|\|[]; function add(v){ v=clean(v); if(v && arr.indexOf(v)<0) arr.push(v); } if(Array.isArray(it.ep` |
| `add` | function | `public/js/blocks/block-25.js` | 183 | `function assigns(it){ var out=[]; function add(v){ v=clean(v); if(v && !/позиция щита\|назначение не указано/i.test(v) && out.indexOf(v)<0) out.push(v); } if(it` |
| `add` | function | `public/js/blocks/block-26.js` | 55 | `function add(name,nom,group,opts){ opts=opts\|\|{}; lines.push({name:name,nominal:nom,curve:curve,group:group,wet:group==='wet'\|\|!!opts.wet,nonSwitchable:!!op` |
| `add` | function | `public/js/blocks/block-26.js` | 126 | `function getAssigns(it){ var out=[]; function add(v){ v=String(v\|\|'').trim(); if(v && !/позиция щита\|назначение не указано/i.test(v) && out.indexOf(v)<0) out` |
| `add` | function | `public/js/blocks/block-27.js` | 71 | `function add(name,nom,group,opts){ opts=opts\|\|{}; lines.push({name:name,nominal:curveNom(nom,curve),curve:curve,group:group,wet:group==='wet'\|\|!!opts.wet,no` |
| `add` | function | `public/js/blocks/block-27.js` | 139 | `function getAssigns(it){ var out=[]; function add(v){ v=clean(v); if(v && !/позиция щита\|назначение не указано/i.test(v) && out.indexOf(v)<0) out.push(v); } if` |
| `addAuto` | function | `public/js/blocks/block-02.js` | 356 | `function addAuto(items, tag) {` |
| `addAuto` | window | `public/js/blocks/block-20.js` | 117 | `window.addAuto=newAddAuto;` |
| `addBadge` | function | `public/js/blocks/block-24.js` | 16 | `function addBadge(){` |
| `addDbItem` | function | `public/js/blocks/block-02.js` | 1403 | `async function addDbItem() {` |
| `addDbItem` | window | `public/js/blocks/block-03.js` | 1279 | `window.addDbItem = async function () {` |
| `addDbItem` | window | `public/js/blocks/block-11.js` | 405 | `window.addDbItem = async function(){` |
| `addDbItem` | window | `public/js/blocks/block-16.js` | 159 | `window.addDbItem=async function(){` |
| `addDbItem` | window | `public/js/blocks/block-19.js` | 175 | `window.addDbItem = wrappedAdd;` |
| `addExtraToShieldConfig` | function | `public/js/blocks/block-02.js` | 565 | `function addExtraToShieldConfig() {` |
| `addExtraWork` | function | `public/js/blocks/block-02.js` | 1347 | `async function addExtraWork() {` |
| `addGrp` | function | `public/js/blocks/block-02.js` | 406 | `function addGrp() {` |
| `addLine` | function | `public/js/blocks/block-02.js` | 781 | `function addLine(name, nominal, group, opts) {` |
| `addLine` | function | `public/js/blocks/block-05.js` | 218 | `function addLine(name, nominal, group, opts){ opts=opts\|\|{}; lines.push({name:name, nominal:nominal, group:group, curve:opts.curve \|\| curve, nonSwitchable:!` |
| `addLine` | function | `public/js/blocks/block-23.js` | 23 | `function addLine(name, nominal, group, opts) {` |
| `addLine` | function | `public/js/blocks/block-25.js` | 141 | `var lines=[]; function addLine(name,nom,group,opts){ opts=opts\|\|{}; lines.push({name:name,nominal:nom,group:group,wet:group==='wet'\|\|!!opts.wet,nonSwitchabl` |
| `addProtection` | function | `public/js/blocks/block-02.js` | 820 | `function addProtection(group, mode) {` |
| `addProtection` | function | `public/js/blocks/block-05.js` | 238 | `function addProtection(group, kind){ var leakage = group === 'wet' ? 10 : 30; protectionDevices.push({group:group, kind:kind, leakage:leakage, rcdType:rcdType, ` |
| `addProtection` | function | `public/js/blocks/block-23.js` | 62 | `function addProtection(group, mode) {` |
| `addRoom` | function | `public/js/blocks/block-02.js` | 785 | `function addRoom(label, count, wetPower) {` |
| `addRoom` | function | `public/js/blocks/block-05.js` | 219 | `function addRoom(label, count, wetPower){ for(var i=1;i<=count;i++){ var n = count > 1 ? label + ' ' + i : label; addLine(n + ' розетки', 'C16', wetPower ? 'wet` |
| `addRoom` | function | `public/js/blocks/block-23.js` | 27 | `function addRoom(label, count, wetPower) {` |
| `addShieldToEstimate` | function | `public/js/blocks/block-26.js` | 71 | `function addShieldToEstimate(items){` |
| `addUniqueAssign` | function | `public/js/blocks/block-27.js` | 57 | `function addUniqueAssign(rec,arr){` |
| `adminAddUser` | function | `public/js/blocks/block-02.js` | 1496 | `async function adminAddUser() {` |
| `adminServerMode` | function | `public/js/blocks/block-19.js` | 29 | `function adminServerMode(){ return !!(window.EP_ADMIN_SERVER_DB_EDIT === true && isAdmin()); }` |
| `aiFromImage` | function | `public/js/blocks/block-14.js` | 353 | `async function aiFromImage(file,type){` |
| `aiFromImageFile` | function | `public/js/blocks/block-18.js` | 158 | `async function aiFromImageFile(file,type,target){` |
| `aiFromPdfFile` | function | `public/js/blocks/block-18.js` | 167 | `async function aiFromPdfFile(file,type,target){` |
| `aiFromText` | function | `public/js/blocks/block-14.js` | 363 | `async function aiFromText(txt,type){` |
| `aiPueHelper` | function | `public/js/blocks/block-02.js` | 946 | `async function aiPueHelper() {` |
| `aiPueHelper` | window | `public/js/blocks/block-03.js` | 589 | `window.aiPueHelper = async function () {` |
| `aiSupply` | function | `public/js/blocks/block-02.js` | 929 | `async function aiSupply() {` |
| `aiSupply` | window | `public/js/blocks/block-03.js` | 577 | `window.aiSupply = async function () {` |
| `alert` | window | `public/js/blocks/block-02.js` | 151 | `window.alert = (msg) => { window.customAlert("Уведомление", msg); };` |
| `applyPoolToEstimate` | function | `public/js/blocks/block-02.js` | 419 | `function applyPoolToEstimate() {` |
| `applySwap` | function | `public/js/blocks/block-02.js` | 285 | `function applySwap() {` |
| `applySwap` | window | `public/js/blocks/block-06.js` | 181 | `window.applySwap = function(){` |
| `applySwap` | window | `public/js/blocks/block-08.js` | 337 | `window.applySwap = function(){` |
| `applySwap` | window | `public/js/blocks/block-09.js` | 410 | `window.applySwap = function(){` |
| `applySwap` | window | `public/js/blocks/block-10.js` | 521 | `window.applySwap = function(){` |
| `applySwap` | window | `public/js/blocks/block-20.js` | 254 | `window.applySwap=function(){` |
| `appPrice` | function | `public/js/blocks/block-20.js` | 21 | `function appPrice(key, def){ try{ return money((window.appLogic\|\|{})[key]) \|\| def; }catch(e){ return def; } }` |
| `appPrice` | function | `public/js/blocks/block-25.js` | 119 | `function appPrice(k,def){ try{ return Number(window.appLogic && appLogic[k]) \|\| def; }catch(e){ return def; } }` |
| `appPrice` | function | `public/js/blocks/block-26.js` | 17 | `function appPrice(k,def){ try{ return Number(window.appLogic && window.appLogic[k]) \|\| def; }catch(e){ return def; } }` |
| `appPrice` | function | `public/js/blocks/block-27.js` | 26 | `function appPrice(k,def){ try{ var n=Number(window.appLogic && appLogic[k]); return n\|\|def; }catch(e){ return def; } }` |
| `approveUser` | function | `public/js/blocks/block-02.js` | 1447 | `async function approveUser(uid) { try { await db.collection('users').doc(uid).update({ isApproved: true }); showToast("Одобрено!"); } catch(e){} }` |
| `arr` | arrow/function | `public/js/blocks/block-04.js` | 256 | `let arr = (type === 'work' ? globalWork : globalMat).slice();` |
| `arr` | arrow/function | `public/js/blocks/block-08.js` | 185 | `var arr = (type === 'work' ? (cache.workDB \|\| []) : (cache.matDB \|\| [])).map(function(x){ return Object.assign({}, x, {__src:'global'}); });` |
| `arr` | arrow/function | `public/js/blocks/block-09.js` | 195 | `var arr = (type === 'work' ? cache.workDB : cache.matDB).map(function(x){ return Object.assign({}, x, {__src:'global'}); });` |
| `arr` | arrow/function | `public/js/blocks/block-10.js` | 276 | `var arr = (type === 'work' ? cache.workDB : cache.matDB).map(function(x){ return Object.assign({}, x, {__src:'global'}); });` |
| `arr` | arrow/function | `public/js/blocks/block-22.js` | 82 | `var ids=new Set(checks.map(function(ch){return String(ch.dataset.id\|\|'');})); var arr=(typeof active==='function'?active(type):[]).map(function(it){ if(ids.ha` |
| `arr` | arrow/function | `public/js/blocks/block-24.js` | 127 | `try{ if(typeof active==='function' && typeof scope==='function'){ var type=checks[0].dataset.type\|\|'mat'; var arr=(active(type)\|\|[]).filter(function(it){ret` |
| `arrByType` | function | `public/js/blocks/block-07.js` | 25 | `function arrByType(type){` |
| `arrLS` | function | `public/js/blocks/block-11.js` | 36 | `function arrLS(k){ try{ var a=JSON.parse(localStorage.getItem(k)\|\|'[]'); return Array.isArray(a)?a:[]; }catch(e){ return []; } }` |
| `arrLS` | function | `public/js/blocks/block-25.js` | 21 | `function arrLS(k){ try{ var a=JSON.parse(localStorage.getItem(k)\|\|'[]'); return Array.isArray(a)?a:[]; }catch(e){ return []; } }` |
| `arrLS` | function | `public/js/blocks/block-28.js` | 19 | `function arrLS(k){ try{ var a=JSON.parse(localStorage.getItem(k)\|\|'[]'); return Array.isArray(a)?a:[]; }catch(e){ return []; } }` |
| `askGemini` | function | `public/js/blocks/block-18.js` | 58 | `async function askGemini(promptText, opts){` |
| `askOpenAI` | function | `public/js/blocks/block-18.js` | 42 | `async function askOpenAI(promptText, opts){` |
| `assignmentsOf` | function | `public/js/blocks/block-24.js` | 45 | `function assignmentsOf(it){` |
| `assigns` | function | `public/js/blocks/block-25.js` | 183 | `function assigns(it){ var out=[]; function add(v){ v=clean(v); if(v && !/позиция щита\|назначение не указано/i.test(v) && out.indexOf(v)<0) out.push(v); } if(it` |
| `autoGroupMaterial` | function | `public/js/blocks/block-11.js` | 567 | `function autoGroupMaterial(item){` |
| `autoGroupWork` | function | `public/js/blocks/block-11.js` | 589 | `function autoGroupWork(item){` |
| `autoName` | function | `public/js/blocks/block-25.js` | 107 | `function autoName(nominal,brand){` |
| `autoName` | function | `public/js/blocks/block-26.js` | 20 | `function autoName(nom,brand,curve){ var cn=curveNom(nom,curve), br=brandRu(brand); if(br==='ABB') return cn+' 1P ABB SH201'; if(br==='Schneider') return cn+' 1P` |
| `autoName` | function | `public/js/blocks/block-27.js` | 47 | `function autoName(nom,brand,curve){ var cn=curveNom(nom,curve), br=brandRu(brand); var hit=dbFindAuto(cn,brand); var model=hit?modelFromDbName(hit.n):''; if(mod` |
| `autoPrice` | function | `public/js/blocks/block-05.js` | 243 | `function autoPrice(){ return bAuto === 'ABB' ? 350 : 155; }` |
| `autoPrice` | function | `public/js/blocks/block-25.js` | 113 | `function autoPrice(nominal,brand){ var hit=dbFindAuto(nominal,brand); if(hit) return money(hit.p); var amp=Number(String(nominal).replace(/[^0-9]/g,'')); return` |
| `autoPrice` | function | `public/js/blocks/block-26.js` | 21 | `function autoPrice(nom,brand){` |
| `autoPrice` | function | `public/js/blocks/block-27.js` | 48 | `function autoPrice(nom,brand){ var hit=dbFindAuto(nom,brand); if(hit && Number(hit.p)>0) return Number(hit.p); var amp=Number(text(nom).replace(/[^0-9]/g,''))\|` |
| `bad` | arrow/function | `public/js/blocks/block-02.js` | 742 | `const bad = (/установка\s+бп\s+в\s+щит/i.test(found.n) && /установка\s+щит/i.test(label)) \|\|` |
| `base` | arrow/function | `public/js/blocks/block-15.js` | 254 | `function saveVisibleEdits(){ var st=window.EP_DB_REVIEW_V6\|\|{}; var start=(st.page\|\|0)*PAGE_SIZE; var end=Math.min(start+PAGE_SIZE,(st.items\|\|[]).length);` |
| `base` | arrow/function | `public/js/blocks/block-16.js` | 246 | `var base=(st.items\|\|[])[i]\|\|{}; var ch=$('ep-db-check-'+i); if(ch)st.selected[i]=!!ch.checked;` |
| `base` | arrow/function | `public/js/blocks/block-17.js` | 68 | `var base=(st.items\|\|[])[i]\|\|{}; var ch=$('ep-db-check-'+i); if(ch) st.selected[i]=!!ch.checked;` |
| `bindButtons` | function | `public/js/blocks/block-23.js` | 188 | `function bindButtons(){` |
| `boot` | function | `public/js/blocks/block-05.js` | 311 | `function boot(){ epMoveShieldSettingsIntoDetails(); epPatchDbRenderers(); epNormalizeMaterialsDb(); epPatchGenerateButton(); }` |
| `boot` | function | `public/js/blocks/block-06.js` | 206 | `function boot(){ try{ normalizeMaterialDb(); }catch(e){} }` |
| `boot` | function | `public/js/blocks/block-20.js` | 271 | `function boot(){ patchShieldButton(); normalizeCurrentEstimate(); try{ if(typeof renderMainTable==='function') renderMainTable(); }catch(e){} }` |
| `boot` | function | `public/js/blocks/block-22.js` | 91 | `function boot(){ try{ window.epV15NormalizeCurrentEstimate(); if(typeof oldRender==='function') oldRender(); }catch(e){} }` |
| `boot` | function | `public/js/blocks/block-23.js` | 198 | `function boot(){ bindButtons(); try{normalizeV16(); if(typeof oldRender==='function') oldRender();}catch(e){} }` |
| `boot` | function | `public/js/blocks/block-24.js` | 129 | `function boot(){ addBadge(); window.epV17Normalize(); try{ if(typeof renderMainTable==='function') renderMainTable(); }catch(e){} patchDbBulk(); setTimeout(patc` |
| `boot` | function | `public/js/blocks/block-25.js` | 250 | `function boot(){ ensureBadge(); epV18SetStatus('ok','V18 активна'); syncActiveToMain(scope()); refreshDbEnhancements(); try{ window.currentEstimate=currentEstim` |
| `boot` | function | `public/js/blocks/block-26.js` | 145 | `function boot(){ patchButtons(); try{ if(window.epV18SetStatus) window.epV18SetStatus('ok','V19 активна'); }catch(e){} toast(BUILD+' загружена'); }` |
| `boot` | function | `public/js/blocks/block-27.js` | 160 | `function boot(){ patchButtons(); try{ if(window.epV18SetStatus) window.epV18SetStatus('ok','V20 активна'); }catch(e){} toast(BUILD+' загружена'); }` |
| `boot` | function | `public/js/blocks/block-28.js` | 200 | `function boot(){ setStatus('ok','V21 активна'); ensurePanel(); fillSelectors(true); toast(BUILD+' загружена'); }` |
| `brandRu` | function | `public/js/blocks/block-24.js` | 23 | `function brandRu(v){ v=txt(v\|\|'IEK').trim(); if(/^iek$/i.test(v)) return 'ИЭК'; return v; }` |
| `brandRu` | function | `public/js/blocks/block-25.js` | 106 | `function brandRu(b){ b=String(b\|\|'IEK').toUpperCase(); if(b==='IEK') return 'ИЭК'; return b.charAt(0)+b.slice(1).toLowerCase(); }` |
| `brandRu` | function | `public/js/blocks/block-26.js` | 18 | `function brandRu(v){ var s=String(v\|\|'').toUpperCase(); if(s.indexOf('IEK')>=0\|\|s.indexOf('ИЭК')>=0) return 'ИЭК'; if(s.indexOf('ABB')>=0) return 'ABB'; if(` |
| `brandRu` | function | `public/js/blocks/block-27.js` | 27 | `function brandRu(b){ var s=text(b\|\|'IEK').toUpperCase(); if(s.indexOf('IEK')>=0\|\|s.indexOf('ИЭК')>=0) return 'ИЭК'; if(s.indexOf('ABB')>=0) return 'ABB'; if` |
| `buildBulkPanel` | function | `public/js/blocks/block-25.js` | 200 | `function buildBulkPanel(){` |
| `buildLines` | function | `public/js/blocks/block-26.js` | 53 | `function buildLines(curve){` |
| `buildLines` | function | `public/js/blocks/block-27.js` | 69 | `function buildLines(curve){` |
| `canEdit` | function | `public/js/blocks/block-16.js` | 42 | `function canEdit(){ return scope()==='my' \|\| (scope()==='global' && isAdmin()); }` |
| `canEditActive` | function | `public/js/blocks/block-15.js` | 32 | `function canEditActive(){ return scope()==='my' \|\| (scope()==='global' && isAdmin()); }` |
| `canonicalName` | function | `public/js/blocks/block-06.js` | 153 | `function canonicalName(it){` |
| `catalogRow` | function | `public/js/blocks/block-11.js` | 248 | `function catalogRow(type,it){` |
| `categorizeEstimateItem` | function | `public/js/blocks/block-02.js` | 983 | `function categorizeEstimateItem(it) {` |
| `categorizeEstimateItem` | window | `public/js/blocks/block-07.js` | 384 | `window.categorizeEstimateItem = function(it){` |
| `cell` | function | `public/js/blocks/block-14.js` | 224 | `function cell(row,i){ return cleanText((row \|\| [])[i]); }` |
| `cell` | function | `public/js/blocks/block-15.js` | 243 | `function rowsToItems(rows,type){ rows=rows\|\|[]; var header=null,currentCat='',currentSub='',out=[]; function cell(row,i){return cleanText((row\|\|[])[i]);} ro` |
| `cell` | function | `public/js/blocks/block-17.js` | 149 | `function cell(row,i){ return clean((row\|\|[])[i]); }` |
| `cells` | arrow/function | `public/js/blocks/block-03.js` | 892 | `const cells = (Array.isArray(row) ? row : Object.values(row \|\| {})).map(epCleanCell);` |
| `cfgN` | function | `public/js/blocks/block-26.js` | 16 | `function cfgN(k){ try{ return Math.max(0, Number((window.cfg&&window.cfg[k])\|\|0)); }catch(e){ return 0; } }` |
| `cfgNum` | function | `public/js/blocks/block-25.js` | 118 | `function cfgNum(k){ try{ return Number(window.cfg && cfg[k])\|\|0; }catch(e){ return 0; } }` |
| `ch` | function | `public/js/blocks/block-24.js` | 25 | `var out=[]; function e(id){ return $(id); } function ch(id){ var x=e(id); return !!(x&&x.checked); }` |
| `changeTheme` | function | `public/js/blocks/block-02.js` | 246 | `function changeTheme(theme) { document.documentElement.setAttribute('data-theme', theme); safeSet('theme_v31', theme); }` |
| `checkLocalPinUser` | function | `public/js/blocks/block-02.js` | 119 | `function checkLocalPinUser() {` |
| `chk` | function | `public/js/blocks/block-22.js` | 39 | `var lines=[]; function val(id){ var e=$(id); return e?e.value:''; } function chk(id){ var e=$(id); return !!(e&&e.checked); }` |
| `chk` | function | `public/js/blocks/block-25.js` | 117 | `function chk(id){ var e=$(id); return !!(e&&e.checked); }` |
| `chk` | function | `public/js/blocks/block-26.js` | 15 | `function chk(id){ var e=$(id); return !!(e && e.checked); }` |
| `chk` | function | `public/js/blocks/block-27.js` | 18 | `function chk(id){ var e=$(id); return !!(e && e.checked); }` |
| `cid` | arrow/function | `public/js/blocks/block-04.js` | 98 | `const cid = (opts.prefix \|\| 'ep_cat') + '_' + epId(type + '_' + idx++);` |
| `classify` | function | `public/js/blocks/block-08.js` | 254 | `function classify(it){` |
| `classify` | function | `public/js/blocks/block-09.js` | 353 | `function classify(it){` |
| `classify` | function | `public/js/blocks/block-10.js` | 458 | `function classify(it){` |
| `classify` | function | `public/js/blocks/block-20.js` | 171 | `function classify(it){` |
| `clean` | function | `public/js/blocks/block-09.js` | 16 | `function clean(s){` |
| `clean` | function | `public/js/blocks/block-12.js` | 28 | `function clean(s){ return String(s \|\| '').toLowerCase().replace(/ё/g,'е').replace(/×/g,'x').replace(/х/g,'x').replace(/[^a-zа-я0-9]+/g,' ').trim(); }` |
| `clean` | function | `public/js/blocks/block-13.js` | 30 | `function clean(s){ return String(s \|\| '').toLowerCase().replace(/ё/g,'е').replace(/×/g,'x').replace(/х/g,'x').replace(/[^a-zа-я0-9]+/g,' ').trim(); }` |
| `clean` | function | `public/js/blocks/block-16.js` | 27 | `function clean(s){ return String(s\|\|'').replace(/\s+/g,' ').trim(); }` |
| `clean` | function | `public/js/blocks/block-17.js` | 24 | `function clean(v){ return String(v==null?'':v).replace(/\s+/g,' ').trim(); }` |
| `clean` | function | `public/js/blocks/block-18.js` | 21 | `function clean(v){ return String(v==null?'':v).replace(/\s+/g,' ').trim(); }` |
| `clean` | function | `public/js/blocks/block-22.js` | 11 | `function clean(s){ return String(s\|\|'').replace(/\s+/g,' ').trim(); }` |
| `clean` | function | `public/js/blocks/block-24.js` | 12 | `function clean(v){ return txt(v).replace(/\s+/g,' ').trim(); }` |
| `clean` | function | `public/js/blocks/block-25.js` | 18 | `function clean(v){ return String(v==null?'':v).replace(/\s+/g,' ').trim(); }` |
| `clean` | function | `public/js/blocks/block-27.js` | 13 | `function clean(v){ return text(v).replace(/\s+/g,' ').trim(); }` |
| `clean` | function | `public/js/blocks/block-28.js` | 16 | `function clean(v){ return String(v==null?'':v).replace(/\s+/g,' ').trim(); }` |
| `cleanCanonicalName` | function | `public/js/blocks/block-07.js` | 321 | `function cleanCanonicalName(it){` |
| `cleanMode` | function | `public/js/blocks/block-11.js` | 40 | `function cleanMode(){ return localStorage.getItem(LS_CLEAN) === '1'; }` |
| `cleanText` | function | `public/js/blocks/block-11.js` | 34 | `function cleanText(s){ return String(s \|\| '').toLowerCase().replace(/ё/g,'е').replace(/×/g,'x').replace(/х/g,'x').replace(/[^a-zа-я0-9]+/g,' ').trim(); }` |
| `cleanText` | function | `public/js/blocks/block-14.js` | 33 | `function cleanText(v){ return String(v == null ? '' : v).replace(/\s+/g,' ').trim(); }` |
| `cleanText` | function | `public/js/blocks/block-15.js` | 25 | `function cleanText(v){ return String(v==null?'':v).replace(/\s+/g,' ').trim(); }` |
| `clearCurrentEstimate` | function | `public/js/blocks/block-02.js` | 317 | `async function clearCurrentEstimate() { let c = await window.customConfirm("Очистка", "Очистить смету?"); if(c){ currentEstimate=[]; renderMainTable(); } }` |
| `clearDeletedFor` | function | `public/js/blocks/block-09.js` | 51 | `function clearDeletedFor(type, it){` |
| `clone` | function | `public/js/blocks/block-11.js` | 35 | `function clone(x){ var y=Object.assign({}, x \|\| {}); delete y.__src; delete y.__encoded; return y; }` |
| `clone` | function | `public/js/blocks/block-12.js` | 30 | `function clone(it){ var x = Object.assign({}, it \|\| {}); delete x.__src; delete x.__encoded; return x; }` |
| `clone` | function | `public/js/blocks/block-13.js` | 32 | `function clone(it){ var x = Object.assign({}, it \|\| {}); delete x.__src; delete x.__encoded; return x; }` |
| `clone` | function | `public/js/blocks/block-14.js` | 41 | `function clone(it){ var x = Object.assign({}, it \|\| {}); delete x.__src; delete x.__encoded; return x; }` |
| `clone` | function | `public/js/blocks/block-15.js` | 38 | `function clone(it){ var x=Object.assign({},it\|\|{}); delete x.__src; delete x.__encoded; return x; }` |
| `clone` | function | `public/js/blocks/block-16.js` | 29 | `function clone(it){ var x=Object.assign({},it\|\|{}); delete x.__src; delete x.__encoded; return x; }` |
| `clone` | function | `public/js/blocks/block-17.js` | 36 | `function clone(x){ return Object.assign({},x\|\|{}); }` |
| `clone` | function | `public/js/blocks/block-20.js` | 26 | `function clone(it){ return Object.assign({}, it\|\|{}); }` |
| `clone` | function | `public/js/blocks/block-25.js` | 29 | `function clone(x){ return Object.assign({}, x\|\|{}); }` |
| `clone` | function | `public/js/blocks/block-28.js` | 27 | `function clone(x){ return Object.assign({}, x\|\|{}); }` |
| `closeModal` | function | `public/js/blocks/block-02.js` | 244 | `function closeModal(id) { document.getElementById(id).style.display='none'; }` |
| `closeObjCardAndReturn` | function | `public/js/blocks/block-02.js` | 1345 | `function closeObjCardAndReturn() { closeModal('objCardModal'); openModal('buhModal'); }` |
| `collectDb` | function | `public/js/blocks/block-20.js` | 141 | `function collectDb(type){` |
| `collectReviewed` | function | `public/js/blocks/block-14.js` | 437 | `function collectReviewed(){` |
| `collectReviewed` | function | `public/js/blocks/block-15.js` | 255 | `function collectReviewed(){ saveVisibleEdits(); var st=window.EP_DB_REVIEW_V6\|\|{}; var type=st.type==='work'?'work':'mat', out=[]; (st.items\|\|[]).forEach(fu` |
| `collectReviewed` | function | `public/js/blocks/block-16.js` | 259 | `function collectReviewed(){` |
| `collectReviewed` | function | `public/js/blocks/block-17.js` | 63 | `function collectReviewed(){` |
| `commitCollection` | function | `public/js/blocks/block-11.js` | 524 | `async function commitCollection(collection, mode){` |
| `compareShopsAI` | function | `public/js/blocks/block-02.js` | 962 | `async function compareShopsAI() {` |
| `compareShopsAI` | window | `public/js/blocks/block-03.js` | 600 | `window.compareShopsAI = async function () {` |
| `compressImageDataUrl` | function | `public/js/blocks/block-19.js` | 246 | `async function compressImageDataUrl(dataUrl){` |
| `confirmLogout` | function | `public/js/blocks/block-02.js` | 185 | `function confirmLogout() {` |
| `confirmQtyAdd` | function | `public/js/blocks/block-02.js` | 350 | `function confirmQtyAdd() {` |
| `copy` | arrow/function | `public/js/blocks/block-15.js` | 174 | `var copy=(s==='global'&&!admin)?'<button class="btn-info" style="width:auto;margin:0;padding:7px;" data-type="'+type+'" data-item="'+esc(item)+'" onclick="epCop` |
| `count` | function | `public/js/blocks/block-27.js` | 19 | `function count(k,def){` |
| `csvRows` | function | `public/js/blocks/block-14.js` | 153 | `function csvRows(txt){` |
| `csvRows` | function | `public/js/blocks/block-15.js` | 239 | `function csvRows(txt){ var lines=String(txt\|\|'').split(/\r?\n/).filter(function(x){return x.trim();}); if(!lines.length)return []; var delims=[';','\t',',']; ` |
| `csvRows` | function | `public/js/blocks/block-17.js` | 146 | `function csvRows(txt){ return String(txt\|\|'').split(/\r?\n/).map(function(line){ return line.split(';').length>=line.split(',').length?line.split(';'):line.sp` |
| `currentEditType` | function | `public/js/blocks/block-16.js` | 141 | `function currentEditType(){` |
| `currentEmail` | function | `public/js/blocks/block-16.js` | 34 | `function currentEmail(){ try{ return String((window.appUser&&appUser.email) \|\| (fbUser()&&fbUser().email) \|\| '').toLowerCase(); }catch(e){ return ''; } }` |
| `currentEstimate` | window | `public/js/blocks/block-22.js` | 75 | `window.currentEstimate=out; try{ currentEstimate=out; }catch(e){}` |
| `currentEstimate` | window | `public/js/blocks/block-25.js` | 125 | `try{ currentEstimate=(Array.isArray(currentEstimate)?currentEstimate:[]).filter(function(it){ return it.tag!=='shield' && it.tag!=='shield_info'; }).concat(out)` |
| `currentEstimate` | window | `public/js/blocks/block-25.js` | 125 | `try{ currentEstimate=(Array.isArray(currentEstimate)?currentEstimate:[]).filter(function(it){ return it.tag!=='shield' && it.tag!=='shield_info'; }).concat(out)` |
| `currentEstimate` | window | `public/js/blocks/block-25.js` | 132 | `arr.forEach(function(it,idx){ var q=Number(it.q)\|\|0, sum=(typeof fPrice==='function'?fPrice(it):(Number(it.p)\|\|0))*q; total+=sum; tb.insertAdjacentHTML('bef` |
| `currentEstimate` | window | `public/js/blocks/block-25.js` | 132 | `arr.forEach(function(it,idx){ var q=Number(it.q)\|\|0, sum=(typeof fPrice==='function'?fPrice(it):(Number(it.p)\|\|0))*q; total+=sum; tb.insertAdjacentHTML('bef` |
| `currentEstimate` | window | `public/js/blocks/block-25.js` | 136 | `window.renderMainTable=function(){ try{ window.currentEstimate=currentEstimate; }catch(e){} renderMainDirect(); };` |
| `currentEstimate` | window | `public/js/blocks/block-25.js` | 185 | `try{ window.currentEstimate=currentEstimate; }catch(e){}` |
| `currentEstimate` | window | `public/js/blocks/block-25.js` | 250 | `function boot(){ ensureBadge(); epV18SetStatus('ok','V18 активна'); syncActiveToMain(scope()); refreshDbEnhancements(); try{ window.currentEstimate=currentEstim` |
| `currentEstimate` | window | `public/js/blocks/block-26.js` | 74 | `try{ window.currentEstimate=(Array.isArray(window.currentEstimate)?window.currentEstimate:[]).filter(function(it){return it.tag!=='shield'&&it.tag!=='shield_inf` |
| `currentEstimate` | window | `public/js/blocks/block-27.js` | 65 | `try{ currentEstimate=(Array.isArray(currentEstimate)?currentEstimate:[]).filter(function(x){ return x && x.tag!=='shield' && x.tag!=='shield_info'; }).concat(ou` |
| `currentEstimate` | window | `public/js/blocks/block-27.js` | 65 | `try{ currentEstimate=(Array.isArray(currentEstimate)?currentEstimate:[]).filter(function(x){ return x && x.tag!=='shield' && x.tag!=='shield_info'; }).concat(ou` |
| `currentShieldExtras` | window | `public/js/blocks/block-05.js` | 294 | `try { window.currentShieldExtras = []; } catch(e){}` |
| `currentShieldExtras` | window | `public/js/blocks/block-25.js` | 160 | `try{ (window.currentShieldExtras\|\|[]).forEach(function(ex){ items.push(makeItem(ex.n,ex.q,ex.p,'mat',{c:'Автоматика',g:'Другие аппараты',sc:'Другие аппараты'}` |
| `currentShieldExtras` | window | `public/js/blocks/block-26.js` | 102 | `try{ (window.currentShieldExtras\|\|[]).forEach(function(ex){ items.push(makeItem(ex.n,ex.q\|\|1,ex.p\|\|0,'mat',{c:'Автоматика',g:'Другие аппараты',sc:'Другие ` |
| `currentShieldExtras` | window | `public/js/blocks/block-27.js` | 114 | `try{ (window.currentShieldExtras\|\|[]).forEach(function(ex){ items.push(item(ex.n,ex.q\|\|1,ex.p\|\|0,'mat',{c:'Автоматика',g:'Другие аппараты',sc:'Другие аппа` |
| `currentUserLabel` | function | `public/js/blocks/block-17.js` | 31 | `function currentUserLabel(){ try{ var u=(firebase.auth&&firebase.auth().currentUser)\|\|null; return (u&&(u.email\|\|u.uid)) \|\| (window.appUser&&(appUser.emai` |
| `curveNom` | function | `public/js/blocks/block-26.js` | 19 | `function curveNom(nom, curve){ var amp=String(nom\|\|'').replace(/[^0-9]/g,'')\|\|'16'; var c=String(curve\|\|String(nom\|\|'C').charAt(0)\|\|'C').toUpperCase()` |
| `curveNom` | function | `public/js/blocks/block-27.js` | 37 | `function curveNom(nom,curve){ var amp=text(nom).replace(/[^0-9]/g,'') \|\| '16'; var c=text(curve \|\| text(nom).charAt(0) \|\| 'C').toUpperCase().charAt(0); if` |
| `customAlert` | window | `public/js/blocks/block-02.js` | 126 | `window.customAlert = (title, text) => {` |
| `customConfirm` | window | `public/js/blocks/block-02.js` | 138 | `window.customConfirm = (title, text) => {` |
| `dataMime` | function | `public/js/blocks/block-18.js` | 34 | `function dataMime(dataUrl){ var m=String(dataUrl\|\|'').match(/^data:([^;]+);base64,/i); return m?m[1]:''; }` |
| `dataUrl` | arrow/function | `public/js/blocks/block-18.js` | 61 | `var dataUrl=(opts&&opts.fileDataUrl)\|\|(opts&&opts.imageDataUrl)\|\|'';` |
| `db` | arrow/function | `public/js/blocks/block-26.js` | 24 | `var db=(window.matDB\|\|[]).concat(window.userMatDB\|\|[]);` |
| `db` | arrow/function | `public/js/blocks/block-26.js` | 35 | `var db=(window.matDB\|\|[]).concat(window.userMatDB\|\|[]); var k=(kind==='ДИФ'\|\|kind==='Главный ДИФ')?'диф':'узо'; var br=brandRu(brand).toLowerCase();` |
| `dbArr` | arrow/function | `public/js/blocks/block-02.js` | 344 | `let dbArr = (type==='mat'?matDB:workDB); let item = dbArr.find(x => String(x.id) === String(id));` |
| `dbArr` | function | `public/js/blocks/block-06.js` | 14 | `function dbArr(type){` |
| `dbFindAuto` | function | `public/js/blocks/block-25.js` | 97 | `function dbFindAuto(nominal,brand){` |
| `dbFindAuto` | function | `public/js/blocks/block-27.js` | 38 | `function dbFindAuto(nom,brand){` |
| `dbFindRcd` | function | `public/js/blocks/block-25.js` | 102 | `function dbFindRcd(leak,brand,kind){` |
| `dbFindRcd` | function | `public/js/blocks/block-27.js` | 42 | `function dbFindRcd(kind,leak,brand){` |
| `dec` | function | `public/js/blocks/block-11.js` | 48 | `function dec(v){ try{ return JSON.parse(decodeURIComponent(v \|\| '{}')); }catch(e){ return null; } }` |
| `decodeItem` | function | `public/js/blocks/block-10.js` | 30 | `function decodeItem(v){` |
| `deleteAct` | function | `public/js/blocks/block-02.js` | 1122 | `async function deleteAct() {` |
| `deletedSet` | function | `public/js/blocks/block-08.js` | 50 | `function deletedSet(type){` |
| `deletedSet` | function | `public/js/blocks/block-09.js` | 45 | `function deletedSet(type){` |
| `deleteToolbar` | function | `public/js/blocks/block-10.js` | 323 | `function deleteToolbar(type){` |
| `deleteUser` | function | `public/js/blocks/block-02.js` | 1507 | `async function deleteUser(uid) {` |
| `delKey` | function | `public/js/blocks/block-10.js` | 38 | `function delKey(type){ return type === 'work' ? 'ep_deleted_work_ids_local_v1' : 'ep_deleted_mat_ids_local_v1'; }` |
| `delSet` | function | `public/js/blocks/block-10.js` | 39 | `function delSet(type){` |
| `delStorageKey` | function | `public/js/blocks/block-09.js` | 44 | `function delStorageKey(type){ return type === 'work' ? 'ep_deleted_work_ids_local_v1' : 'ep_deleted_mat_ids_local_v1'; }` |
| `detailNote` | function | `public/js/blocks/block-07.js` | 427 | `function detailNote(app, line){` |
| `detectBrand` | function | `public/js/blocks/block-06.js` | 20 | `function detectBrand(s){ const raw = String(s\|\|''); const n = norm(raw); for(const b of BRAND_LIST){ if(n.includes(norm(b))) return b === 'ИЭК' ? 'IEK' : b; }` |
| `detectBrand` | function | `public/js/blocks/block-07.js` | 49 | `function detectBrand(s){` |
| `detectLeakage` | function | `public/js/blocks/block-07.js` | 63 | `function detectLeakage(s){` |
| `detectNominal` | function | `public/js/blocks/block-06.js` | 21 | `function detectNominal(s){ const n = norm(s).replace(/\s+/g,''); const m = n.match(/([abcd])([0-9]{1,3})/i); return m ? (m[1].toUpperCase()+m[2]) : ''; }` |
| `detectNominal` | function | `public/js/blocks/block-07.js` | 58 | `function detectNominal(s){` |
| `detectRcdType` | function | `public/js/blocks/block-07.js` | 67 | `function detectRcdType(s){` |
| `deviceName` | function | `public/js/blocks/block-24.js` | 56 | `function deviceName(it){` |
| `difPrice` | function | `public/js/blocks/block-05.js` | 244 | `function difPrice(){ return bAuto === 'ABB' ? 4500 : 3600; }` |
| `directAdd` | function | `public/js/blocks/block-27.js` | 62 | `function directAdd(items){` |
| `directAddShield` | function | `public/js/blocks/block-25.js` | 122 | `function directAddShield(items){` |
| `doRecalculate` | function | `public/js/blocks/block-02.js` | 1219 | `function doRecalculate() {` |
| `downloadJson` | function | `public/js/blocks/block-11.js` | 477 | `function downloadJson(filename,data){` |
| `downloadJson` | function | `public/js/blocks/block-15.js` | 225 | `function downloadJson(filename,data){` |
| `drop` | arrow/function | `public/js/blocks/block-02.js` | 437 | `let drop = (isSw \|\| isPass) ? (ceilH - g.h)/100 : (g.route === 'ceiling' ? (ceilH - g.h)/100 : g.h/100);` |
| `e` | function | `public/js/blocks/block-24.js` | 25 | `var out=[]; function e(id){ return $(id); } function ch(id){ var x=e(id); return !!(x&&x.checked); }` |
| `ed` | arrow/function | `public/js/blocks/block-15.js` | 255 | `function collectReviewed(){ saveVisibleEdits(); var st=window.EP_DB_REVIEW_V6\|\|{}; var type=st.type==='work'?'work':'mat', out=[]; (st.items\|\|[]).forEach(fu` |
| `ed` | arrow/function | `public/js/blocks/block-16.js` | 261 | `(st.items\|\|[]).forEach(function(base,i){ if(st.selected&&st.selected[i]===false)return; var ed=(st.editCache&&st.editCache[i])\|\|base\|\|{}; var it=normItem(` |
| `ed` | arrow/function | `public/js/blocks/block-17.js` | 72 | `var out=[]; (st.items\|\|[]).forEach(function(base,i){ if(st.selected&&st.selected[i]===false)return; var ed=(st.editCache&&st.editCache[i])\|\|base\|\|{}; var ` |
| `editorRow` | function | `public/js/blocks/block-11.js` | 318 | `function editorRow(type,it){` |
| `editorRow` | function | `public/js/blocks/block-15.js` | 168 | `function editorRow(type,it){` |
| `editorTop` | function | `public/js/blocks/block-11.js` | 269 | `function editorTop(type){` |
| `editorTop` | function | `public/js/blocks/block-15.js` | 154 | `function editorTop(type){` |
| `enc` | function | `public/js/blocks/block-11.js` | 47 | `function enc(it){ try{ return encodeURIComponent(JSON.stringify(clone(it))); }catch(e){ return ''; } }` |
| `encodeItem` | function | `public/js/blocks/block-10.js` | 27 | `function encodeItem(it){` |
| `ensureBadge` | function | `public/js/blocks/block-25.js` | 80 | `function ensureBadge(){` |
| `ensureChecks` | function | `public/js/blocks/block-28.js` | 137 | `function ensureChecks(){` |
| `ensurePanel` | function | `public/js/blocks/block-15.js` | 102 | `function ensurePanel(){` |
| `ensurePanel` | function | `public/js/blocks/block-28.js` | 150 | `function ensurePanel(){` |
| `ensureProgress` | function | `public/js/blocks/block-15.js` | 49 | `function ensureProgress(){` |
| `ensureProgress` | function | `public/js/blocks/block-16.js` | 57 | `function ensureProgress(){` |
| `ensureProgress` | function | `public/js/blocks/block-17.js` | 47 | `function ensureProgress(){` |
| `ensureProgress` | function | `public/js/blocks/block-19.js` | 32 | `function ensureProgress(){` |
| `EP_ADMIN_SERVER_DB_EDIT` | window | `public/js/blocks/block-19.js` | 29 | `function adminServerMode(){ return !!(window.EP_ADMIN_SERVER_DB_EDIT === true && isAdmin()); }` |
| `EP_ADMIN_SERVER_DB_EDIT` | window | `public/js/blocks/block-19.js` | 66 | `window.EP_ADMIN_SERVER_DB_EDIT = true;` |
| `EP_ADMIN_SERVER_DB_EDIT` | window | `public/js/blocks/block-19.js` | 82 | `window.EP_ADMIN_SERVER_DB_EDIT = false;` |
| `EP_ADMIN_SERVER_DB_EDIT` | window | `public/js/blocks/block-19.js` | 112 | `if(normalDbButtonWasClicked(e)) window.EP_ADMIN_SERVER_DB_EDIT = false;` |
| `EP_AI_CONFIG` | window | `public/js/blocks/block-03.js` | 9 | `window.EP_AI_CONFIG = {` |
| `EP_AI_CONFIG` | window | `public/js/blocks/block-03.js` | 255 | `window.EP_AI_CONFIG = { provider: provider, geminiKey: geminiKey, openaiKey: openaiKey, openaiModel: model };` |
| `EP_DB_ADMIN_SETTINGS_AI_STABILITY_V11` | window | `public/js/blocks/block-19.js` | 16 | `window.EP_DB_ADMIN_SETTINGS_AI_STABILITY_V11 = true;` |
| `EP_DB_PROPOSALS_CACHE_V2` | window | `public/js/blocks/block-04.js` | 11 | `window.EP_DB_PROPOSALS_CACHE_V2 = window.EP_DB_PROPOSALS_CACHE_V2 \|\| {};` |
| `EP_DB_PROPOSALS_CACHE_V2` | window | `public/js/blocks/block-04.js` | 284 | `window.EP_DB_PROPOSALS_CACHE_V2 = {};` |
| `EP_DB_REVIEW` | window | `public/js/blocks/block-03.js` | 16 | `window.EP_DB_REVIEW = { type: 'mat', items: [], source: '' };` |
| `EP_DB_REVIEW` | window | `public/js/blocks/block-03.js` | 1076 | `window.EP_DB_REVIEW = { type: type, items: items, source: source \|\| '' };` |
| `EP_DB_REVIEW` | window | `public/js/blocks/block-14.js` | 294 | `window.EP_DB_REVIEW = { type: st.type, items: st.items, source: st.source };` |
| `EP_DB_REVIEW` | window | `public/js/blocks/block-14.js` | 348 | `window.EP_DB_REVIEW = { type:type, items:items, source:source \|\| '' };` |
| `EP_DB_REVIEW` | window | `public/js/blocks/block-15.js` | 245 | `function showReview(items,type,source,target){ items=unique((items\|\|[]).filter(Boolean),type); var selected={}; items.forEach(function(_,i){selected[i]=true;}` |
| `EP_DB_REVIEW` | window | `public/js/blocks/block-17.js` | 170 | `window.EP_DB_REVIEW={type:type,items:items,source:source\|\|''}; window.EP_V9_IMPORT_TARGET=target; window.EP_V7_IMPORT_TARGET=target;` |
| `EP_DB_REVIEW` | window | `public/js/blocks/block-18.js` | 142 | `window.EP_DB_REVIEW={type:type,items:items,source:source\|\|''};` |
| `EP_DB_REVIEW` | window | `public/js/blocks/block-19.js` | 222 | `window.EP_DB_REVIEW = window.EP_DB_REVIEW \|\| {};` |
| `EP_DB_REVIEW_V6` | window | `public/js/blocks/block-14.js` | 19 | `window.EP_DB_REVIEW_V6 = window.EP_DB_REVIEW_V6 \|\| { type:'mat', items:[], source:'', page:0, selected:{}, editCache:{} };` |
| `EP_DB_REVIEW_V6` | window | `public/js/blocks/block-14.js` | 347 | `window.EP_DB_REVIEW_V6 = { type:type, items:items, source:source \|\| '', page:0, selected:selected, editCache:{} };` |
| `EP_DB_REVIEW_V6` | window | `public/js/blocks/block-15.js` | 245 | `function showReview(items,type,source,target){ items=unique((items\|\|[]).filter(Boolean),type); var selected={}; items.forEach(function(_,i){selected[i]=true;}` |
| `EP_DB_REVIEW_V6` | window | `public/js/blocks/block-17.js` | 169 | `window.EP_DB_REVIEW_V6={type:type,items:items,source:source\|\|'',page:0,selected:selected,editCache:{}};` |
| `EP_DB_REVIEW_V6` | window | `public/js/blocks/block-18.js` | 141 | `window.EP_DB_REVIEW_V6={type:type,items:items,source:source\|\|'',page:0,selected:selected,editCache:{}};` |
| `EP_FORCE_GLOBAL` | window | `public/js/blocks/block-11.js` | 73 | `window.EP_FORCE_GLOBAL = {matDB:EP_SERVER_MAT, workDB:EP_SERVER_WORK};` |
| `EP_FORCE_GLOBAL` | window | `public/js/blocks/block-12.js` | 60 | `window.EP_FORCE_GLOBAL = {matDB:mat, workDB:work};` |
| `EP_FORCE_GLOBAL` | window | `public/js/blocks/block-13.js` | 68 | `window.EP_FORCE_GLOBAL = {matDB:mat, workDB:work};` |
| `EP_FORCE_GLOBAL` | window | `public/js/blocks/block-14.js` | 97 | `window.EP_FORCE_GLOBAL = {matDB:mat, workDB:work};` |
| `EP_FORCE_GLOBAL` | window | `public/js/blocks/block-15.js` | 45 | `function setServer(type,arr){ arr=unique(arr,type); if(type==='work') window.EP_GLOBAL_WORK=arr; else window.EP_GLOBAL_MAT=arr; var mat=type==='mat'?arr:getServ` |
| `EP_FORCE_GLOBAL` | window | `public/js/blocks/block-16.js` | 52 | `function setServer(type,arr){ arr=unique(arr,type); if(type==='work') window.EP_GLOBAL_WORK=arr; else window.EP_GLOBAL_MAT=arr; var mat=type==='mat'?arr:getServ` |
| `EP_FORCE_GLOBAL` | window | `public/js/blocks/block-17.js` | 42 | `function setServer(type,arr){ arr=unique(arr,type); if(type==='work') window.EP_GLOBAL_WORK=arr; else window.EP_GLOBAL_MAT=arr; var mat=type==='mat'?arr:getServ` |
| `EP_FORCE_GLOBAL` | window | `public/js/blocks/block-25.js` | 59 | `window.EP_FORCE_GLOBAL={matDB:c.matDB,workDB:c.workDB};` |
| `EP_FORCE_GLOBAL` | window | `public/js/blocks/block-28.js` | 69 | `window.EP_FORCE_GLOBAL={matDB:c.matDB,workDB:c.workDB};` |
| `EP_GLOBAL_DB_TAB_FIXED` | window | `public/js/blocks/block-08.js` | 80 | `window.EP_GLOBAL_DB_TAB_FIXED = window.EP_GLOBAL_DB_TAB_FIXED \|\| 'mat';` |
| `EP_GLOBAL_DB_TAB_FIXED` | window | `public/js/blocks/block-08.js` | 166 | `window.EP_GLOBAL_DB_TAB_FIXED = 'mat';` |
| `EP_GLOBAL_DB_TAB_FIXED` | window | `public/js/blocks/block-08.js` | 171 | `window.EP_GLOBAL_DB_TAB_FIXED = type === 'work' ? 'work' : 'mat';` |
| `EP_GLOBAL_DB_VISIBLE_CACHE` | window | `public/js/blocks/block-08.js` | 79 | `window.EP_GLOBAL_DB_VISIBLE_CACHE = window.EP_GLOBAL_DB_VISIBLE_CACHE \|\| { matDB: [], workDB: [], loadedAt: 0 };` |
| `EP_GLOBAL_DB_VISIBLE_CACHE` | window | `public/js/blocks/block-08.js` | 99 | `window.EP_GLOBAL_DB_VISIBLE_CACHE = cache;` |
| `EP_GLOBAL_DB_VISIBLE_CACHE` | window | `public/js/blocks/block-09.js` | 100 | `window.EP_GLOBAL_DB_VISIBLE_CACHE = out;` |
| `EP_GLOBAL_DB_VISIBLE_CACHE` | window | `public/js/blocks/block-10.js` | 129 | `window.EP_GLOBAL_DB_VISIBLE_CACHE = out;` |
| `EP_GLOBAL_DB_VISIBLE_CACHE` | window | `public/js/blocks/block-11.js` | 75 | `window.EP_GLOBAL_DB_VISIBLE_CACHE = {matDB:EP_SERVER_MAT, workDB:EP_SERVER_WORK, ts:Date.now()};` |
| `EP_GLOBAL_DB_VISIBLE_CACHE` | window | `public/js/blocks/block-12.js` | 62 | `window.EP_GLOBAL_DB_VISIBLE_CACHE = {matDB:mat, workDB:work, ts:Date.now()};` |
| `EP_GLOBAL_DB_VISIBLE_CACHE` | window | `public/js/blocks/block-13.js` | 70 | `window.EP_GLOBAL_DB_VISIBLE_CACHE = {matDB:mat, workDB:work, ts:Date.now()};` |
| `EP_GLOBAL_DB_VISIBLE_CACHE` | window | `public/js/blocks/block-14.js` | 99 | `window.EP_GLOBAL_DB_VISIBLE_CACHE = {matDB:mat, workDB:work, ts:Date.now()};` |
| `EP_GLOBAL_DB_VISIBLE_CACHE` | window | `public/js/blocks/block-15.js` | 45 | `function setServer(type,arr){ arr=unique(arr,type); if(type==='work') window.EP_GLOBAL_WORK=arr; else window.EP_GLOBAL_MAT=arr; var mat=type==='mat'?arr:getServ` |
| `EP_GLOBAL_DB_VISIBLE_CACHE` | window | `public/js/blocks/block-16.js` | 52 | `function setServer(type,arr){ arr=unique(arr,type); if(type==='work') window.EP_GLOBAL_WORK=arr; else window.EP_GLOBAL_MAT=arr; var mat=type==='mat'?arr:getServ` |
| `EP_GLOBAL_DB_VISIBLE_CACHE` | window | `public/js/blocks/block-17.js` | 42 | `function setServer(type,arr){ arr=unique(arr,type); if(type==='work') window.EP_GLOBAL_WORK=arr; else window.EP_GLOBAL_MAT=arr; var mat=type==='mat'?arr:getServ` |
| `EP_GLOBAL_DB_VISIBLE_CACHE` | window | `public/js/blocks/block-25.js` | 61 | `window.EP_GLOBAL_DB_VISIBLE_CACHE={matDB:c.matDB,workDB:c.workDB,ts:Date.now()};` |
| `EP_GLOBAL_DB_VISIBLE_CACHE` | window | `public/js/blocks/block-28.js` | 71 | `window.EP_GLOBAL_DB_VISIBLE_CACHE={matDB:c.matDB,workDB:c.workDB,ts:Date.now()};` |
| `EP_GLOBAL_MAT` | window | `public/js/blocks/block-11.js` | 71 | `window.EP_GLOBAL_MAT = EP_SERVER_MAT;` |
| `EP_GLOBAL_MAT` | window | `public/js/blocks/block-12.js` | 56 | `if(type === 'work') window.EP_GLOBAL_WORK = arr; else window.EP_GLOBAL_MAT = arr;` |
| `EP_GLOBAL_MAT` | window | `public/js/blocks/block-13.js` | 66 | `window.EP_GLOBAL_MAT = mat;` |
| `EP_GLOBAL_MAT` | window | `public/js/blocks/block-14.js` | 93 | `if(type === 'work') window.EP_GLOBAL_WORK = arr; else window.EP_GLOBAL_MAT = arr;` |
| `EP_GLOBAL_MAT` | window | `public/js/blocks/block-15.js` | 45 | `function setServer(type,arr){ arr=unique(arr,type); if(type==='work') window.EP_GLOBAL_WORK=arr; else window.EP_GLOBAL_MAT=arr; var mat=type==='mat'?arr:getServ` |
| `EP_GLOBAL_MAT` | window | `public/js/blocks/block-16.js` | 52 | `function setServer(type,arr){ arr=unique(arr,type); if(type==='work') window.EP_GLOBAL_WORK=arr; else window.EP_GLOBAL_MAT=arr; var mat=type==='mat'?arr:getServ` |
| `EP_GLOBAL_MAT` | window | `public/js/blocks/block-17.js` | 42 | `function setServer(type,arr){ arr=unique(arr,type); if(type==='work') window.EP_GLOBAL_WORK=arr; else window.EP_GLOBAL_MAT=arr; var mat=type==='mat'?arr:getServ` |
| `EP_GLOBAL_MAT` | window | `public/js/blocks/block-25.js` | 58 | `window.EP_GLOBAL_MAT=c.matDB; window.EP_GLOBAL_WORK=c.workDB;` |
| `EP_GLOBAL_MAT` | window | `public/js/blocks/block-28.js` | 68 | `window.EP_GLOBAL_MAT=c.matDB; window.EP_GLOBAL_WORK=c.workDB;` |
| `EP_GLOBAL_WORK` | window | `public/js/blocks/block-11.js` | 72 | `window.EP_GLOBAL_WORK = EP_SERVER_WORK;` |
| `EP_GLOBAL_WORK` | window | `public/js/blocks/block-12.js` | 56 | `if(type === 'work') window.EP_GLOBAL_WORK = arr; else window.EP_GLOBAL_MAT = arr;` |
| `EP_GLOBAL_WORK` | window | `public/js/blocks/block-13.js` | 67 | `window.EP_GLOBAL_WORK = work;` |
| `EP_GLOBAL_WORK` | window | `public/js/blocks/block-14.js` | 93 | `if(type === 'work') window.EP_GLOBAL_WORK = arr; else window.EP_GLOBAL_MAT = arr;` |
| `EP_GLOBAL_WORK` | window | `public/js/blocks/block-15.js` | 45 | `function setServer(type,arr){ arr=unique(arr,type); if(type==='work') window.EP_GLOBAL_WORK=arr; else window.EP_GLOBAL_MAT=arr; var mat=type==='mat'?arr:getServ` |
| `EP_GLOBAL_WORK` | window | `public/js/blocks/block-16.js` | 52 | `function setServer(type,arr){ arr=unique(arr,type); if(type==='work') window.EP_GLOBAL_WORK=arr; else window.EP_GLOBAL_MAT=arr; var mat=type==='mat'?arr:getServ` |
| `EP_GLOBAL_WORK` | window | `public/js/blocks/block-17.js` | 42 | `function setServer(type,arr){ arr=unique(arr,type); if(type==='work') window.EP_GLOBAL_WORK=arr; else window.EP_GLOBAL_MAT=arr; var mat=type==='mat'?arr:getServ` |
| `EP_GLOBAL_WORK` | window | `public/js/blocks/block-25.js` | 58 | `window.EP_GLOBAL_MAT=c.matDB; window.EP_GLOBAL_WORK=c.workDB;` |
| `EP_GLOBAL_WORK` | window | `public/js/blocks/block-28.js` | 68 | `window.EP_GLOBAL_MAT=c.matDB; window.EP_GLOBAL_WORK=c.workDB;` |
| `EP_HARD_GLOBAL_CACHE` | window | `public/js/blocks/block-09.js` | 82 | `window.EP_HARD_GLOBAL_CACHE = window.EP_HARD_GLOBAL_CACHE \|\| { matDB: [], workDB: [], loadedAt: 0 };` |
| `EP_HARD_GLOBAL_CACHE` | window | `public/js/blocks/block-09.js` | 99 | `window.EP_HARD_GLOBAL_CACHE = out;` |
| `EP_HARD_GLOBAL_CACHE` | window | `public/js/blocks/block-10.js` | 128 | `window.EP_HARD_GLOBAL_CACHE = out;` |
| `EP_HARD_GLOBAL_TYPE` | window | `public/js/blocks/block-09.js` | 176 | `window.EP_HARD_GLOBAL_TYPE = 'mat';` |
| `EP_HARD_GLOBAL_TYPE` | window | `public/js/blocks/block-09.js` | 181 | `window.EP_HARD_GLOBAL_TYPE = type === 'work' ? 'work' : 'mat';` |
| `EP_HARD_SWAP` | window | `public/js/blocks/block-09.js` | 390 | `window.EP_HARD_SWAP = [];` |
| `EP_HARD_SWAP` | window | `public/js/blocks/block-09.js` | 402 | `window.EP_HARD_SWAP = cands;` |
| `EP_MY_MAT` | window | `public/js/blocks/block-11.js` | 69 | `window.EP_MY_MAT = EP_MY_MAT;` |
| `EP_MY_MAT` | window | `public/js/blocks/block-12.js` | 48 | `if(type === 'work') window.EP_MY_WORK = arr; else window.EP_MY_MAT = arr;` |
| `EP_MY_MAT` | window | `public/js/blocks/block-13.js` | 56 | `window.EP_MY_MAT = mat;` |
| `EP_MY_MAT` | window | `public/js/blocks/block-14.js` | 85 | `if(type === 'work') window.EP_MY_WORK = arr; else window.EP_MY_MAT = arr;` |
| `EP_MY_MAT` | window | `public/js/blocks/block-15.js` | 44 | `function setMy(type,arr){ arr=unique(arr,type); if(type==='work') window.EP_MY_WORK=arr; else window.EP_MY_MAT=arr; writeArr(type==='work'?LS_MY_WORK:LS_MY_MAT,` |
| `EP_MY_MAT` | window | `public/js/blocks/block-16.js` | 51 | `function setMy(type,arr){ arr=unique(arr,type); if(type==='work') window.EP_MY_WORK=arr; else window.EP_MY_MAT=arr; writeArr(type==='work'?LS_MY_WORK:LS_MY_MAT,` |
| `EP_MY_MAT` | window | `public/js/blocks/block-17.js` | 43 | `function setMy(type,arr){ arr=unique(arr,type); if(type==='work') window.EP_MY_WORK=arr; else window.EP_MY_MAT=arr; writeArr(type==='work'?LS_MY_WORK:LS_MY_MAT,` |
| `EP_MY_MAT` | window | `public/js/blocks/block-25.js` | 69 | `if(type==='mat'){ window.EP_MY_MAT=arr; setLS(LS_MY_MAT,arr); }` |
| `EP_MY_MAT` | window | `public/js/blocks/block-28.js` | 78 | `if(type==='mat'){ window.EP_MY_MAT=arr; setArrLS(LS_MY_MAT,arr); }` |
| `EP_MY_WORK` | window | `public/js/blocks/block-11.js` | 70 | `window.EP_MY_WORK = EP_MY_WORK;` |
| `EP_MY_WORK` | window | `public/js/blocks/block-12.js` | 48 | `if(type === 'work') window.EP_MY_WORK = arr; else window.EP_MY_MAT = arr;` |
| `EP_MY_WORK` | window | `public/js/blocks/block-13.js` | 57 | `window.EP_MY_WORK = work;` |
| `EP_MY_WORK` | window | `public/js/blocks/block-14.js` | 85 | `if(type === 'work') window.EP_MY_WORK = arr; else window.EP_MY_MAT = arr;` |
| `EP_MY_WORK` | window | `public/js/blocks/block-15.js` | 44 | `function setMy(type,arr){ arr=unique(arr,type); if(type==='work') window.EP_MY_WORK=arr; else window.EP_MY_MAT=arr; writeArr(type==='work'?LS_MY_WORK:LS_MY_MAT,` |
| `EP_MY_WORK` | window | `public/js/blocks/block-16.js` | 51 | `function setMy(type,arr){ arr=unique(arr,type); if(type==='work') window.EP_MY_WORK=arr; else window.EP_MY_MAT=arr; writeArr(type==='work'?LS_MY_WORK:LS_MY_MAT,` |
| `EP_MY_WORK` | window | `public/js/blocks/block-17.js` | 43 | `function setMy(type,arr){ arr=unique(arr,type); if(type==='work') window.EP_MY_WORK=arr; else window.EP_MY_MAT=arr; writeArr(type==='work'?LS_MY_WORK:LS_MY_MAT,` |
| `EP_MY_WORK` | window | `public/js/blocks/block-25.js` | 70 | `else { window.EP_MY_WORK=arr; setLS(LS_MY_WORK,arr); }` |
| `EP_MY_WORK` | window | `public/js/blocks/block-28.js` | 79 | `else { window.EP_MY_WORK=arr; setArrLS(LS_MY_WORK,arr); }` |
| `EP_OPENING_ADMIN_SERVER_DB` | window | `public/js/blocks/block-19.js` | 67 | `window.EP_OPENING_ADMIN_SERVER_DB = true;` |
| `EP_OPENING_ADMIN_SERVER_DB` | window | `public/js/blocks/block-19.js` | 72 | `window.EP_OPENING_ADMIN_SERVER_DB = false;` |
| `EP_SERVER_MODAL_TYPE` | window | `public/js/blocks/block-11.js` | 643 | `window.EP_SERVER_MODAL_TYPE='mat';` |
| `EP_SERVER_MODAL_TYPE` | window | `public/js/blocks/block-11.js` | 648 | `window.EP_SERVER_MODAL_TYPE = type === 'work' ? 'work' : 'mat';` |
| `EP_SWAP_CANDIDATES_SMART` | window | `public/js/blocks/block-08.js` | 306 | `window.EP_SWAP_CANDIDATES_SMART = [];` |
| `EP_SWAP_CANDIDATES_SMART` | window | `public/js/blocks/block-08.js` | 326 | `window.EP_SWAP_CANDIDATES_SMART = candidates;` |
| `EP_ULTIMATE_DB_CACHE` | window | `public/js/blocks/block-10.js` | 64 | `window.EP_ULTIMATE_DB_CACHE = window.EP_ULTIMATE_DB_CACHE \|\| { matDB: [], workDB: [], ts: 0 };` |
| `EP_ULTIMATE_DB_CACHE` | window | `public/js/blocks/block-10.js` | 127 | `window.EP_ULTIMATE_DB_CACHE = out;` |
| `EP_ULTIMATE_DB_CACHE` | window | `public/js/blocks/block-11.js` | 74 | `window.EP_ULTIMATE_DB_CACHE = {matDB:EP_SERVER_MAT, workDB:EP_SERVER_WORK, ts:Date.now()};` |
| `EP_ULTIMATE_DB_CACHE` | window | `public/js/blocks/block-12.js` | 61 | `window.EP_ULTIMATE_DB_CACHE = {matDB:mat, workDB:work, ts:Date.now()};` |
| `EP_ULTIMATE_DB_CACHE` | window | `public/js/blocks/block-13.js` | 69 | `window.EP_ULTIMATE_DB_CACHE = {matDB:mat, workDB:work, ts:Date.now()};` |
| `EP_ULTIMATE_DB_CACHE` | window | `public/js/blocks/block-14.js` | 98 | `window.EP_ULTIMATE_DB_CACHE = {matDB:mat, workDB:work, ts:Date.now()};` |
| `EP_ULTIMATE_DB_CACHE` | window | `public/js/blocks/block-15.js` | 45 | `function setServer(type,arr){ arr=unique(arr,type); if(type==='work') window.EP_GLOBAL_WORK=arr; else window.EP_GLOBAL_MAT=arr; var mat=type==='mat'?arr:getServ` |
| `EP_ULTIMATE_DB_CACHE` | window | `public/js/blocks/block-16.js` | 52 | `function setServer(type,arr){ arr=unique(arr,type); if(type==='work') window.EP_GLOBAL_WORK=arr; else window.EP_GLOBAL_MAT=arr; var mat=type==='mat'?arr:getServ` |
| `EP_ULTIMATE_DB_CACHE` | window | `public/js/blocks/block-17.js` | 42 | `function setServer(type,arr){ arr=unique(arr,type); if(type==='work') window.EP_GLOBAL_WORK=arr; else window.EP_GLOBAL_MAT=arr; var mat=type==='mat'?arr:getServ` |
| `EP_ULTIMATE_DB_CACHE` | window | `public/js/blocks/block-25.js` | 60 | `window.EP_ULTIMATE_DB_CACHE={matDB:c.matDB,workDB:c.workDB,ts:Date.now()};` |
| `EP_ULTIMATE_DB_CACHE` | window | `public/js/blocks/block-28.js` | 70 | `window.EP_ULTIMATE_DB_CACHE={matDB:c.matDB,workDB:c.workDB,ts:Date.now()};` |
| `EP_ULTIMATE_GLOBAL_TYPE` | window | `public/js/blocks/block-10.js` | 253 | `window.EP_ULTIMATE_GLOBAL_TYPE = 'mat';` |
| `EP_ULTIMATE_GLOBAL_TYPE` | window | `public/js/blocks/block-10.js` | 259 | `window.EP_ULTIMATE_GLOBAL_TYPE = type === 'work' ? 'work' : 'mat';` |
| `EP_ULTIMATE_SWAP` | window | `public/js/blocks/block-10.js` | 496 | `window.EP_ULTIMATE_SWAP = [];` |
| `EP_ULTIMATE_SWAP` | window | `public/js/blocks/block-10.js` | 508 | `window.EP_ULTIMATE_SWAP = candidates;` |
| `EP_V12_SWAP_LIST` | window | `public/js/blocks/block-20.js` | 220 | `window.EP_V12_SWAP_LIST=[];` |
| `EP_V12_SWAP_LIST` | window | `public/js/blocks/block-20.js` | 240 | `window.EP_V12_SWAP_LIST=list;` |
| `EP_V7_IMPORT_TARGET` | window | `public/js/blocks/block-15.js` | 245 | `function showReview(items,type,source,target){ items=unique((items\|\|[]).filter(Boolean),type); var selected={}; items.forEach(function(_,i){selected[i]=true;}` |
| `EP_V7_IMPORT_TARGET` | window | `public/js/blocks/block-15.js` | 251 | `window.epOpenTextImportServerProposalV7=function(type){ window.EP_V7_IMPORT_TARGET='server_proposal'; try{ if(typeof window.epOpenTextImport==='function') windo` |
| `EP_V7_IMPORT_TARGET` | window | `public/js/blocks/block-15.js` | 260 | `catch(e){ hideProgress(); toast('❌ '+(e.message\|\|'Ошибка сохранения')); console.error('EP V7 apply',e); } finally{ window.EP_V7_IMPORT_TARGET=null; } };` |
| `EP_V7_IMPORT_TARGET` | window | `public/js/blocks/block-16.js` | 289 | `finally{ window.EP_V7_IMPORT_TARGET=null; }` |
| `EP_V7_IMPORT_TARGET` | window | `public/js/blocks/block-17.js` | 122 | `window.EP_V7_IMPORT_TARGET=target;` |
| `EP_V7_IMPORT_TARGET` | window | `public/js/blocks/block-17.js` | 129 | `window.EP_V7_IMPORT_TARGET=target;` |
| `EP_V7_IMPORT_TARGET` | window | `public/js/blocks/block-17.js` | 170 | `window.EP_DB_REVIEW={type:type,items:items,source:source\|\|''}; window.EP_V9_IMPORT_TARGET=target; window.EP_V7_IMPORT_TARGET=target;` |
| `EP_V7_IMPORT_TARGET` | window | `public/js/blocks/block-17.js` | 192 | `type=type==='work'?'work':'mat'; var target=scope()==='global'?(isAdmin()?'global':'server_proposal'):'my'; window.EP_V9_IMPORT_TARGET=target; window.EP_V7_IMPO` |
| `EP_V7_IMPORT_TARGET` | window | `public/js/blocks/block-17.js` | 217 | `finally{ window.EP_V9_IMPORT_TARGET=null; window.EP_V7_IMPORT_TARGET=null; }` |
| `EP_V7_IMPORT_TARGET` | window | `public/js/blocks/block-18.js` | 143 | `window.EP_V9_IMPORT_TARGET=target; window.EP_V7_IMPORT_TARGET=target;` |
| `EP_V7_IMPORT_TARGET` | window | `public/js/blocks/block-19.js` | 200 | `window.EP_V7_IMPORT_TARGET = target;` |
| `EP_V7_IMPORT_TARGET` | window | `public/js/blocks/block-19.js` | 210 | `window.EP_V7_IMPORT_TARGET = target;` |
| `EP_V7_IMPORT_TARGET` | window | `public/js/blocks/block-19.js` | 225 | `window.EP_V7_IMPORT_TARGET = target;` |
| `EP_V7_IMPORT_TARGET` | window | `public/js/blocks/block-19.js` | 237 | `window.EP_V9_IMPORT_TARGET = null; window.EP_V7_IMPORT_TARGET = null;` |
| `EP_V9_IMPORT_TARGET` | window | `public/js/blocks/block-17.js` | 121 | `window.EP_V9_IMPORT_TARGET=target;` |
| `EP_V9_IMPORT_TARGET` | window | `public/js/blocks/block-17.js` | 128 | `window.EP_V9_IMPORT_TARGET=target;` |
| `EP_V9_IMPORT_TARGET` | window | `public/js/blocks/block-17.js` | 170 | `window.EP_DB_REVIEW={type:type,items:items,source:source\|\|''}; window.EP_V9_IMPORT_TARGET=target; window.EP_V7_IMPORT_TARGET=target;` |
| `EP_V9_IMPORT_TARGET` | window | `public/js/blocks/block-17.js` | 192 | `type=type==='work'?'work':'mat'; var target=scope()==='global'?(isAdmin()?'global':'server_proposal'):'my'; window.EP_V9_IMPORT_TARGET=target; window.EP_V7_IMPO` |
| `EP_V9_IMPORT_TARGET` | window | `public/js/blocks/block-17.js` | 217 | `finally{ window.EP_V9_IMPORT_TARGET=null; window.EP_V7_IMPORT_TARGET=null; }` |
| `EP_V9_IMPORT_TARGET` | window | `public/js/blocks/block-18.js` | 143 | `window.EP_V9_IMPORT_TARGET=target; window.EP_V7_IMPORT_TARGET=target;` |
| `EP_V9_IMPORT_TARGET` | window | `public/js/blocks/block-19.js` | 199 | `window.EP_V9_IMPORT_TARGET = target;` |
| `EP_V9_IMPORT_TARGET` | window | `public/js/blocks/block-19.js` | 209 | `window.EP_V9_IMPORT_TARGET = target;` |
| `EP_V9_IMPORT_TARGET` | window | `public/js/blocks/block-19.js` | 224 | `window.EP_V9_IMPORT_TARGET = target;` |
| `EP_V9_IMPORT_TARGET` | window | `public/js/blocks/block-19.js` | 237 | `window.EP_V9_IMPORT_TARGET = null; window.EP_V7_IMPORT_TARGET = null;` |
| `epAddBetaLabels` | function | `public/js/blocks/block-03.js` | 139 | `function epAddBetaLabels() {` |
| `epAddSelectedGlobalToMyDb` | window | `public/js/blocks/block-04.js` | 173 | `window.epAddSelectedGlobalToMyDb = async function() {` |
| `epAddSelectedGlobalToMyDb` | window | `public/js/blocks/block-08.js` | 189 | `window.epAddSelectedGlobalToMyDb = async function(){` |
| `epAddSelectedGlobalToMyDb` | window | `public/js/blocks/block-09.js` | 199 | `window.epAddSelectedGlobalToMyDb = async function(){` |
| `epAddSelectedGlobalToMyDb` | window | `public/js/blocks/block-10.js` | 280 | `window.epAddSelectedGlobalToMyDb = async function(){` |
| `epAddSelectedGlobalToMyDb` | window | `public/js/blocks/block-11.js` | 661 | `window.epAddSelectedGlobalToMyDb = function(){` |
| `epAdminResolveDbProposal` | window | `public/js/blocks/block-03.js` | 1369 | `window.epAdminResolveDbProposal = async function (id, mode) {` |
| `epAiNormalizeDbText` | function | `public/js/blocks/block-03.js` | 1054 | `async function epAiNormalizeDbText(rawText, type, source) {` |
| `epAiNormalizeImage` | function | `public/js/blocks/block-03.js` | 1011 | `async function epAiNormalizeImage(imageDataUrl, type, source) {` |
| `epAllDbItems` | function | `public/js/blocks/block-02.js` | 581 | `function epAllDbItems(type) {` |
| `epAllDbItems` | function | `public/js/blocks/block-05.js` | 171 | `function epAllDbItems(type){` |
| `epApplyReviewedDbItems` | window | `public/js/blocks/block-03.js` | 1143 | `window.epApplyReviewedDbItems = async function (mode) {` |
| `epApplyReviewedDbItems` | window | `public/js/blocks/block-09.js` | 343 | `window.epApplyReviewedDbItems = async function(mode){` |
| `epApplyReviewedDbItems` | window | `public/js/blocks/block-10.js` | 437 | `window.epApplyReviewedDbItems = async function(mode){` |
| `epApplyReviewedDbItems` | window | `public/js/blocks/block-11.js` | 462 | `window.epApplyReviewedDbItems = async function(mode){` |
| `epApplyReviewedDbItems` | window | `public/js/blocks/block-12.js` | 190 | `window.epApplyReviewedDbItems = async function(mode){` |
| `epApplyReviewedDbItems` | window | `public/js/blocks/block-14.js` | 457 | `window.epApplyReviewedDbItems = async function(mode){` |
| `epApplyReviewedDbItems` | window | `public/js/blocks/block-15.js` | 256 | `window.epApplyReviewedDbItems=async function(mode){ var data=collectReviewed(), type=data.type, items=data.items; if(!items.length)return toast('Нет выбранных п` |
| `epApplyReviewedDbItems` | window | `public/js/blocks/block-16.js` | 265 | `window.epApplyReviewedDbItems=async function(mode){` |
| `epApplyReviewedDbItems` | window | `public/js/blocks/block-17.js` | 197 | `window.epApplyReviewedDbItems=async function(mode){` |
| `epApplyReviewedDbItems` | window | `public/js/blocks/block-19.js` | 243 | `window.epApplyReviewedDbItems = wrappedApply;` |
| `epArr` | function | `public/js/blocks/block-04.js` | 15 | `function epArr(type) { return type === 'work' ? workDB : matDB; }` |
| `epAskAI` | function | `public/js/blocks/block-03.js` | 449 | `async function epAskAI(promptText, opts) {` |
| `epAskAI` | window | `public/js/blocks/block-03.js` | 456 | `window.epAskAI = epAskAI;` |
| `epAskAI` | window | `public/js/blocks/block-15.js` | 246 | `async function readDbFile(file,type,target){ showProgress('Импорт базы',5,'Старт'); var name=file.name\|\|'', lower=name.toLowerCase(), items=[]; if(file.type&&` |
| `epAskAI` | window | `public/js/blocks/block-18.js` | 73 | `window.epAskAI = async function(promptText, opts){` |
| `epAskAI` | window | `public/js/blocks/block-19.js` | 301 | `window.epAskAI = wrappedAsk;` |
| `epAutoGroupItem` | window | `public/js/blocks/block-11.js` | 603 | `window.epAutoGroupItem = function(type,item){ return type==='work' ? autoGroupWork(item) : autoGroupMaterial(item); };` |
| `epAutoGroupItem` | window | `public/js/blocks/block-12.js` | 126 | `try{ if(typeof window.epAutoGroupItem === 'function') it = window.epAutoGroupItem(type,it); }catch(e){}` |
| `epAutoGroupItem` | window | `public/js/blocks/block-14.js` | 453 | `if(it){ try{ if(typeof window.epAutoGroupItem === 'function') it = window.epAutoGroupItem(type,it); }catch(e){} out.push(it); }` |
| `epAutoGroupItem` | window | `public/js/blocks/block-15.js` | 255 | `function collectReviewed(){ saveVisibleEdits(); var st=window.EP_DB_REVIEW_V6\|\|{}; var type=st.type==='work'?'work':'mat', out=[]; (st.items\|\|[]).forEach(fu` |
| `epAutoGroupItem` | window | `public/js/blocks/block-16.js` | 154 | `try{ if(typeof window.epAutoGroupItem==='function') it=window.epAutoGroupItem(type,it); }catch(e){}` |
| `epAutoGroupItem` | window | `public/js/blocks/block-16.js` | 261 | `(st.items\|\|[]).forEach(function(base,i){ if(st.selected&&st.selected[i]===false)return; var ed=(st.editCache&&st.editCache[i])\|\|base\|\|{}; var it=normItem(` |
| `epAutoGroupItem` | window | `public/js/blocks/block-17.js` | 62 | `function normItem(raw,type,idx){ raw=raw\|\|{}; var n=clean(raw.n\|\|raw.name\|\|raw.title\|\|raw.item\|\|raw.position\|\|raw['Наименование']\|\|raw['Название']` |
| `epAutoPrice` | function | `public/js/blocks/block-02.js` | 766 | `function epAutoPrice(brand) { return brand === 'ABB' ? 350 : 155; }` |
| `epAutoRegroupActiveDb` | window | `public/js/blocks/block-11.js` | 604 | `window.epAutoRegroupActiveDb = function(){` |
| `epCallGemini` | function | `public/js/blocks/block-03.js` | 387 | `async function epCallGemini(promptText, opts) {` |
| `epCallOpenAI` | function | `public/js/blocks/block-03.js` | 420 | `async function epCallOpenAI(promptText, opts) {` |
| `epChangePriceV7` | window | `public/js/blocks/block-15.js` | 200 | `window.epChangePriceV7=async function(type,id,newPrice){` |
| `epChangePriceV7` | window | `public/js/blocks/block-16.js` | 186 | `window.epChangePriceV7=async function(type,id,newPrice){` |
| `epClean` | function | `public/js/blocks/block-04.js` | 17 | `function epClean(v) { return String(v ?? '').trim().toLowerCase(); }` |
| `epCleanCell` | function | `public/js/blocks/block-03.js` | 845 | `function epCleanCell(v) {` |
| `epCleanText` | function | `public/js/blocks/block-03.js` | 18 | `function epCleanText(v) {` |
| `epClearLocalAiKeys` | window | `public/js/blocks/block-03.js` | 195 | `window.epClearLocalAiKeys = function () {` |
| `epClearMyDbType` | window | `public/js/blocks/block-11.js` | 373 | `window.epClearMyDbType = function(type){` |
| `epClearServerDbType` | window | `public/js/blocks/block-11.js` | 381 | `window.epClearServerDbType = async function(type){` |
| `epCopyOneGlobalToMy` | window | `public/js/blocks/block-11.js` | 371 | `window.epCopyOneGlobalToMy = window.epCopyOneServerToMy;` |
| `epCopyOneGlobalToMy` | window | `public/js/blocks/block-16.js` | 241 | `window.epCopyOneGlobalToMy=window.epCopyOneServerToMy;` |
| `epCopyOneServerToMy` | window | `public/js/blocks/block-11.js` | 359 | `window.epCopyOneServerToMy = function(type,item){` |
| `epCopyOneServerToMy` | window | `public/js/blocks/block-16.js` | 228 | `window.epCopyOneServerToMy=async function(type,itemStr){` |
| `epCreateMasterDb` | window | `public/js/blocks/block-11.js` | 347 | `window.epCreateMasterDb = async function(){` |
| `epCurrentDb` | function | `public/js/blocks/block-03.js` | 614 | `function epCurrentDb(type) { return type === 'work' ? workDB : matDB; }` |
| `epCurrentKey` | function | `public/js/blocks/block-03.js` | 41 | `function epCurrentKey() {` |
| `epCurrentProvider` | function | `public/js/blocks/block-03.js` | 37 | `function epCurrentProvider() {` |
| `epDbHideProgress` | window | `public/js/blocks/block-18.js` | 20 | `function hideProgress(){ try{ if(typeof window.epDbHideProgress==='function') return window.epDbHideProgress(); }catch(e){} try{ if(typeof hideLoader==='functio` |
| `epDbHideProgress` | window | `public/js/blocks/block-19.js` | 55 | `window.epDbHideProgress = function(){` |
| `epDbProgress` | window | `public/js/blocks/block-18.js` | 17 | `try{ if(typeof window.epDbProgress==='function') return window.epDbProgress(title,pct,text); }catch(e){}` |
| `epDbProgress` | window | `public/js/blocks/block-19.js` | 45 | `window.epDbProgress = function(title,pct,text){` |
| `epDbToggle` | window | `public/js/blocks/block-11.js` | 224 | `window.epDbToggle = function(id,e){ if(e) e.stopPropagation(); var el=$(id); if(el) el.classList.toggle('active'); };` |
| `epDbToggleSub` | window | `public/js/blocks/block-06.js` | 79 | `window.epDbToggleSub = function(id,e){ if(e) e.stopPropagation(); const el=qs(id); if(el) el.classList.toggle('active'); };` |
| `epDbToggleSubFixed` | window | `public/js/blocks/block-07.js` | 178 | `window.epDbToggleSubFixed = function(id,e){` |
| `epDbTypeLabel` | function | `public/js/blocks/block-03.js` | 613 | `function epDbTypeLabel(type) { return type === 'work' ? 'работ' : 'материалов'; }` |
| `epDeleteDbItem` | window | `public/js/blocks/block-03.js` | 1252 | `window.epDeleteDbItem = async function (type, id) {` |
| `epDeleteMySelected` | window | `public/js/blocks/block-11.js` | 394 | `window.epDeleteMySelected = function(){` |
| `epDeleteSelectedActiveV7` | window | `public/js/blocks/block-15.js` | 216 | `window.epDeleteSelectedActiveV7=async function(){` |
| `epDifPrice` | function | `public/js/blocks/block-02.js` | 767 | `function epDifPrice(brand) { return brand === 'ABB' ? 4500 : 3600; }` |
| `epDisplayWorkName` | function | `public/js/blocks/block-04.js` | 57 | `function epDisplayWorkName(it) {` |
| `epDownloadJson` | function | `public/js/blocks/block-03.js` | 1175 | `function epDownloadJson(filename, data) {` |
| `epEnsureProposalBox` | function | `public/js/blocks/block-04.js` | 199 | `function epEnsureProposalBox() {` |
| `epEsc` | function | `public/js/blocks/block-04.js` | 13 | `function epEsc(v) { return String(v ?? '').replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch])); }` |
| `epEscape` | function | `public/js/blocks/block-03.js` | 27 | `function epEscape(s) {` |
| `epEstimateCopy` | function | `public/js/blocks/block-04.js` | 63 | `function epEstimateCopy(it, type) {` |
| `epExportActiveDb` | window | `public/js/blocks/block-11.js` | 483 | `window.epExportActiveDb = function(){` |
| `epExportActiveDb` | window | `public/js/blocks/block-15.js` | 233 | `window.epExportActiveDb=function(){ var s=scope(); downloadJson(s==='global'?'electric-pro-server-db.json':'electric-pro-my-db.json',{source:s==='global'?'serve` |
| `epExportGlobalDb` | window | `public/js/blocks/block-03.js` | 1193 | `window.epExportGlobalDb = async function () {` |
| `epExportGlobalDb` | window | `public/js/blocks/block-11.js` | 493 | `window.epExportGlobalDb = function(){ downloadJson('electric-pro-server-db.json', {source:'server', matDB:EP_SERVER_MAT, workDB:EP_SERVER_WORK, exportedAt:new D` |
| `epExportGlobalDb` | window | `public/js/blocks/block-15.js` | 235 | `window.epExportGlobalDb=function(){ downloadJson('electric-pro-server-db.json',{source:'server',matDB:getServer('mat'),workDB:getServer('work'),exportedAt:new D` |
| `epExportMyDb` | window | `public/js/blocks/block-03.js` | 1184 | `window.epExportMyDb = function () {` |
| `epExportMyDb` | window | `public/js/blocks/block-11.js` | 492 | `window.epExportMyDb = function(){ downloadJson('electric-pro-my-db.json', {source:'my', matDB:EP_MY_MAT, workDB:EP_MY_WORK, exportedAt:new Date().toISOString()}` |
| `epExportMyDb` | window | `public/js/blocks/block-15.js` | 234 | `window.epExportMyDb=function(){ downloadJson('electric-pro-my-db.json',{source:'my',matDB:getMy('mat'),workDB:getMy('work'),exportedAt:new Date().toISOString()}` |
| `epExtractItemsFromSheetRows` | function | `public/js/blocks/block-03.js` | 886 | `function epExtractItemsFromSheetRows(rows, type) {` |
| `epExtractJsonObjectsLoose` | function | `public/js/blocks/block-03.js` | 504 | `function epExtractJsonObjectsLoose(t) {` |
| `epExtractOpenAiText` | function | `public/js/blocks/block-03.js` | 408 | `function epExtractOpenAiText(data) {` |
| `epFactoryResetAllDb` | window | `public/js/blocks/block-11.js` | 539 | `window.epFactoryResetAllDb = async function(){` |
| `epFactoryResetMyDb` | window | `public/js/blocks/block-11.js` | 512 | `window.epFactoryResetMyDb = async function(){` |
| `epFindDbItem` | function | `public/js/blocks/block-02.js` | 591 | `function epFindDbItem(type, words) {` |
| `epFindItem` | function | `public/js/blocks/block-05.js` | 176 | `function epFindItem(type, words){` |
| `epFirebaseDbDebug` | window | `public/js/blocks/block-16.js` | 292 | `window.epFirebaseDbDebug=function(){` |
| `epFirebaseDbDebug` | window | `public/js/blocks/block-17.js` | 220 | `window.epFirebaseDbDebug=function(){` |
| `epGenerateShieldFixed` | window | `public/js/blocks/block-05.js` | 201 | `window.epGenerateShieldFixed = function(){` |
| `epGenerateShieldFixed` | window | `public/js/blocks/block-20.js` | 130 | `window.epGenerateShieldFixed=wrapped;` |
| `epGenerateShieldFixed` | window | `public/js/blocks/block-23.js` | 186 | `window.epGenerateShieldFixed = epV16GenerateCascadePanel;` |
| `epGetCheck` | function | `public/js/blocks/block-02.js` | 764 | `function epGetCheck(id) { const el = document.getElementById(id); return !!(el && el.checked); }` |
| `epGetGlobalDb` | function | `public/js/blocks/block-04.js` | 151 | `async function epGetGlobalDb() {` |
| `epGetReviewedSelected` | function | `public/js/blocks/block-03.js` | 1104 | `function epGetReviewedSelected() {` |
| `epGetVal` | function | `public/js/blocks/block-02.js` | 765 | `function epGetVal(id, def) { const el = document.getElementById(id); return el ? el.value : def; }` |
| `epGlobalSelectAll` | window | `public/js/blocks/block-04.js` | 165 | `window.epGlobalSelectAll = function(flag) { document.querySelectorAll('#ep-global-db-list .ep-global-check').forEach(ch => ch.checked = !!flag); };` |
| `epGlobalSelectAll` | window | `public/js/blocks/block-08.js` | 174 | `window.epGlobalSelectAll = function(flag){` |
| `epGlobalSelectAll` | window | `public/js/blocks/block-09.js` | 184 | `window.epGlobalSelectAll = function(flag){` |
| `epGlobalSelectAll` | window | `public/js/blocks/block-10.js` | 263 | `window.epGlobalSelectAll = function(flag){` |
| `epGlobalSelectAll` | window | `public/js/blocks/block-11.js` | 651 | `window.epGlobalSelectAll = function(flag){` |
| `epGroupCatalog` | function | `public/js/blocks/block-04.js` | 80 | `function epGroupCatalog(arr, type) {` |
| `epGroupedData` | function | `public/js/blocks/block-05.js` | 104 | `function epGroupedData(arr, type){` |
| `epHardDeleteLocalPosition` | window | `public/js/blocks/block-09.js` | 300 | `window.epHardDeleteLocalPosition = async function(type, sig, id){` |
| `epHardDeleteSelected` | window | `public/js/blocks/block-09.js` | 311 | `window.epHardDeleteSelected = async function(type){` |
| `epHardRenderGlobalModal` | window | `public/js/blocks/block-09.js` | 187 | `window.epHardRenderGlobalModal = function(){` |
| `epHardSelectDelete` | window | `public/js/blocks/block-09.js` | 297 | `window.epHardSelectDelete = function(type, flag){` |
| `epHardToggleDbSub` | window | `public/js/blocks/block-09.js` | 170 | `window.epHardToggleDbSub = function(id,e){ if(e) e.stopPropagation(); var el = qs(id); if(el) el.classList.toggle('active'); };` |
| `epId` | function | `public/js/blocks/block-04.js` | 14 | `function epId(v) { return String(v ?? '').replace(/[^a-zA-Z0-9_:-]/g, '_'); }` |
| `epInferCategory` | function | `public/js/blocks/block-03.js` | 617 | `function epInferCategory(name, type) {` |
| `epInferSubcategory` | function | `public/js/blocks/block-03.js` | 636 | `function epInferSubcategory(name, category, type) {` |
| `epInitFullWorksPatch` | function | `public/js/blocks/block-04.js` | 289 | `function epInitFullWorksPatch() {` |
| `epInitialApply` | function | `public/js/blocks/block-03.js` | 1423 | `function epInitialApply() {` |
| `epInsertAdminProposalBox` | function | `public/js/blocks/block-03.js` | 1325 | `function epInsertAdminProposalBox() {` |
| `epInsertDbTools` | function | `public/js/blocks/block-03.js` | 767 | `function epInsertDbTools() {` |
| `epInsertGlobalDbButton` | function | `public/js/blocks/block-04.js` | 185 | `function epInsertGlobalDbButton() {` |
| `epInsertMainProviderSwitch` | function | `public/js/blocks/block-03.js` | 84 | `function epInsertMainProviderSwitch() {` |
| `epIsEmptyCell` | function | `public/js/blocks/block-03.js` | 841 | `function epIsEmptyCell(v) {` |
| `epIsNumberLikeCell` | function | `public/js/blocks/block-03.js` | 863 | `function epIsNumberLikeCell(v) {` |
| `epIsUnitCell` | function | `public/js/blocks/block-03.js` | 849 | `function epIsUnitCell(v) {` |
| `epListenDbProposals` | function | `public/js/blocks/block-03.js` | 1337 | `function epListenDbProposals() {` |
| `epLoadAiConfigFromServer` | function | `public/js/blocks/block-03.js` | 320 | `async function epLoadAiConfigFromServer() {` |
| `epLoadDbFromServer` | function | `public/js/blocks/block-11.js` | 161 | `async function epLoadDbFromServer(){` |
| `epLoadUserDbAfterLogin` | function | `public/js/blocks/block-03.js` | 738 | `async function epLoadUserDbAfterLogin() {` |
| `epLooksLikeCodeOrNumber` | function | `public/js/blocks/block-03.js` | 870 | `function epLooksLikeCodeOrNumber(v) {` |
| `epMakeAiMenuGroup` | function | `public/js/blocks/block-03.js` | 107 | `function epMakeAiMenuGroup() {` |
| `epMat` | function | `public/js/blocks/block-02.js` | 718 | `function epMat(label, q, fallbackPrice, words, meta) {` |
| `epMat` | function | `public/js/blocks/block-05.js` | 187 | `function epMat(label, q, fallbackPrice, words, meta){` |
| `epMat` | window | `public/js/blocks/block-06.js` | 143 | `window.epMat = function(label, q, fallbackPrice, words, meta){` |
| `epMat` | window | `public/js/blocks/block-07.js` | 287 | `window.epMat = function(label, q, fallbackPrice, words, meta){` |
| `epMaterialFromName` | function | `public/js/blocks/block-04.js` | 24 | `function epMaterialFromName(name) {` |
| `epMatGroupName` | function | `public/js/blocks/block-05.js` | 58 | `function epMatGroupName(item){` |
| `epMergeFullWorksInto` | function | `public/js/blocks/block-04.js` | 68 | `function epMergeFullWorksInto(arr) {` |
| `epMoney` | function | `public/js/blocks/block-03.js` | 22 | `function epMoney(v) {` |
| `epMoveShieldSettingsIntoDetails` | function | `public/js/blocks/block-05.js` | 23 | `function epMoveShieldSettingsIntoDetails(){` |
| `epNormalizeAllWorkDb` | function | `public/js/blocks/block-04.js` | 76 | `function epNormalizeAllWorkDb() {` |
| `epNormalizeItems` | function | `public/js/blocks/block-03.js` | 669 | `function epNormalizeItems(raw, type) {` |
| `epNormalizeMaterialsDb` | function | `public/js/blocks/block-05.js` | 88 | `function epNormalizeMaterialsDb(){` |
| `epNormalizeUnit` | function | `public/js/blocks/block-03.js` | 854 | `function epNormalizeUnit(v) {` |
| `epNormalizeWorkItem` | function | `public/js/blocks/block-04.js` | 34 | `function epNormalizeWorkItem(x) {` |
| `epNormProvider` | function | `public/js/blocks/block-03.js` | 33 | `function epNormProvider(p) {` |
| `epNormText` | function | `public/js/blocks/block-02.js` | 587 | `function epNormText(v) {` |
| `epOpenAdminServerDbFromSettings` | window | `public/js/blocks/block-19.js` | 64 | `window.epOpenAdminServerDbFromSettings = function(){` |
| `epOpenDbFactoryResetModal` | window | `public/js/blocks/block-11.js` | 495 | `window.epOpenDbFactoryResetModal = function(){ if(typeof openModal==='function') openModal('dbFactoryResetModal'); };` |
| `epOpenGlobalDbModal` | window | `public/js/blocks/block-04.js` | 163 | `window.epOpenGlobalDbModal = async function() { if (typeof showLoader === 'function') showLoader('Загрузка базы сервера...', '🌍'); await epGetGlobalDb(); if (ty` |
| `epOpenGlobalDbModal` | window | `public/js/blocks/block-08.js` | 162 | `window.epOpenGlobalDbModal = async function(){` |
| `epOpenGlobalDbModal` | window | `public/js/blocks/block-09.js` | 172 | `window.epOpenGlobalDbModal = async function(){` |
| `epOpenGlobalDbModal` | window | `public/js/blocks/block-10.js` | 249 | `window.epOpenGlobalDbModal = async function(){` |
| `epOpenGlobalDbModal` | window | `public/js/blocks/block-11.js` | 639 | `window.epOpenGlobalDbModal = async function(){` |
| `epOpenProposalDetail` | window | `public/js/blocks/block-04.js` | 222 | `window.epOpenProposalDetail = function(id) {` |
| `epOpenTextImport` | window | `public/js/blocks/block-03.js` | 799 | `window.epOpenTextImport = function (type) {` |
| `epOpenTextImport` | window | `public/js/blocks/block-12.js` | 181 | `window.epOpenTextImport = function(type){` |
| `epOpenTextImport` | window | `public/js/blocks/block-15.js` | 251 | `window.epOpenTextImportServerProposalV7=function(type){ window.EP_V7_IMPORT_TARGET='server_proposal'; try{ if(typeof window.epOpenTextImport==='function') windo` |
| `epOpenTextImport` | window | `public/js/blocks/block-17.js` | 191 | `window.epOpenTextImport=function(type){` |
| `epOpenTextImport` | window | `public/js/blocks/block-19.js` | 218 | `window.epOpenTextImport = function(type){` |
| `epOpenTextImportServerProposalV7` | window | `public/js/blocks/block-15.js` | 251 | `window.epOpenTextImportServerProposalV7=function(type){ window.EP_V7_IMPORT_TARGET='server_proposal'; try{ if(typeof window.epOpenTextImport==='function') windo` |
| `epOpFromName` | function | `public/js/blocks/block-04.js` | 29 | `function epOpFromName(name) {` |
| `epParseJsonArray` | function | `public/js/blocks/block-03.js` | 533 | `function epParseJsonArray(t) {` |
| `epParseLooseTableText` | function | `public/js/blocks/block-03.js` | 479 | `function epParseLooseTableText(t, type) {` |
| `epPatchDbRenderers` | function | `public/js/blocks/block-05.js` | 156 | `function epPatchDbRenderers(){` |
| `epPatchGenerateButton` | function | `public/js/blocks/block-05.js` | 306 | `function epPatchGenerateButton(){` |
| `epPatchSettingsUI` | function | `public/js/blocks/block-03.js` | 152 | `function epPatchSettingsUI() {` |
| `epPromptGroupedAdd` | window | `public/js/blocks/block-04.js` | 124 | `window.epPromptGroupedAdd = function(id, type) {` |
| `epPromptShieldGroupedAdd` | window | `public/js/blocks/block-05.js` | 146 | `window.epPromptShieldGroupedAdd = function(id, type){` |
| `epProposalItemName` | function | `public/js/blocks/block-04.js` | 209 | `function epProposalItemName(x) { return [x.g \|\| x.sc \|\| '', x.n \|\| ''].filter(Boolean).join(' — ') \|\| 'Позиция'; }` |
| `epProposalSelectAll` | window | `public/js/blocks/block-04.js` | 237 | `window.epProposalSelectAll = function(flag) { document.querySelectorAll('#ep-proposal-body .ep-proposal-check:not(:disabled)').forEach(ch => ch.checked = !!flag` |
| `epReadDbFile` | function | `public/js/blocks/block-03.js` | 956 | `async function epReadDbFile(file, type) {` |
| `epReadDbFileV9` | window | `public/js/blocks/block-17.js` | 178 | `window.epReadDbFileV9=async function(file,type,target){` |
| `epReadDbFileV9` | window | `public/js/blocks/block-18.js` | 180 | `window.epReadDbFileV9 = async function(file,type,target){` |
| `epReadDbFileV9` | window | `public/js/blocks/block-19.js` | 211 | `if(typeof window.epReadDbFileV9 === 'function') return window.epReadDbFileV9(file,type,target);` |
| `epReadFileAsArrayBuffer` | function | `public/js/blocks/block-03.js` | 830 | `function epReadFileAsArrayBuffer(file) {` |
| `epReadFileAsDataURL` | function | `public/js/blocks/block-03.js` | 821 | `function epReadFileAsDataURL(file) {` |
| `epReadFileAsText` | function | `public/js/blocks/block-03.js` | 812 | `function epReadFileAsText(file) {` |
| `epRefreshActiveDbNow` | window | `public/js/blocks/block-13.js` | 150 | `window.epRefreshActiveDbNow = async function(silent){` |
| `epRefreshActiveDbNow` | window | `public/js/blocks/block-15.js` | 96 | `try{ syncMain(scope()); if(typeof window.epRefreshActiveDbNow==='function') await window.epRefreshActiveDbNow(true); }catch(e){ console.warn('EP V7 reload activ` |
| `epRefreshActiveDbNow` | window | `public/js/blocks/block-15.js` | 196 | `try{ if(typeof window.epRefreshActiveDbNow==='function') await window.epRefreshActiveDbNow(true); }catch(e){}` |
| `epRefreshDbScopeUi` | function | `public/js/blocks/block-11.js` | 669 | `function epRefreshDbScopeUi(){` |
| `epRefreshDbScopeUi` | window | `public/js/blocks/block-12.js` | 164 | `try{ if(typeof window.epRefreshDbScopeUi === 'function') window.epRefreshDbScopeUi(); }catch(e){}` |
| `epRefreshDbScopeUi` | window | `public/js/blocks/block-14.js` | 147 | `try{ if(typeof window.epRefreshDbScopeUi === 'function') window.epRefreshDbScopeUi(); }catch(e){}` |
| `epRefreshProviderUI` | function | `public/js/blocks/block-03.js` | 62 | `function epRefreshProviderUI() {` |
| `epRefreshProviderUI` | window | `public/js/blocks/block-03.js` | 82 | `window.epRefreshProviderUI = epRefreshProviderUI;` |
| `epReloadActiveDbV7` | window | `public/js/blocks/block-15.js` | 215 | `window.epReloadActiveDbV7=async function(){ showProgress('Перезагружаю '+label(),20,'Запрос'); await reloadActiveDb(); showProgress('Перезагружаю '+label(),100,` |
| `epReloadActiveDbV7` | window | `public/js/blocks/block-16.js` | 219 | `window.epReloadActiveDbV7=async function(){` |
| `epReloadActiveDbV7` | window | `public/js/blocks/block-25.js` | 241 | `var oldReload=window.epReloadActiveDbV7; window.epReloadActiveDbV7=function(){ epV18SetStatus('download','загрузка с сервера'); var r=oldReload?oldReload.apply(` |
| `epRenderGlobalDbModal` | function | `public/js/blocks/block-04.js` | 166 | `function epRenderGlobalDbModal() {` |
| `epRenderGrouped` | function | `public/js/blocks/block-05.js` | 118 | `function epRenderGrouped(arr, type, mode, prefix){` |
| `epRenderGroupedList` | function | `public/js/blocks/block-04.js` | 92 | `function epRenderGroupedList(arr, type, opts) {` |
| `epRenderProposalList` | function | `public/js/blocks/block-04.js` | 210 | `function epRenderProposalList() {` |
| `epRenderServerDbModal` | window | `public/js/blocks/block-11.js` | 654 | `window.epRenderServerDbModal = function(){` |
| `epRenderServerDbModal` | window | `public/js/blocks/block-13.js` | 146 | `if(isVisible('globalDbModal') && typeof window.epRenderServerDbModal === 'function'){` |
| `epResolveProposalItems` | window | `public/js/blocks/block-04.js` | 239 | `window.epResolveProposalItems = async function(id, mode, forcedIndexes) {` |
| `epResolveProposalOne` | window | `public/js/blocks/block-04.js` | 238 | `window.epResolveProposalOne = function(id, idx, mode) { epResolveProposalItems(id, mode, [idx]); };` |
| `epReviewCheckAll` | window | `public/js/blocks/block-03.js` | 1069 | `window.epReviewCheckAll = function (checked) {` |
| `epReviewCheckAll` | window | `public/js/blocks/block-14.js` | 337 | `window.epReviewCheckAll = function(checked){` |
| `epReviewPageV6` | window | `public/js/blocks/block-14.js` | 336 | `window.epReviewPageV6 = function(delta){ saveVisibleEdits(); window.EP_DB_REVIEW_V6.page += delta; renderReviewPage(); };` |
| `epReviewPageV6` | window | `public/js/blocks/block-15.js` | 245 | `function showReview(items,type,source,target){ items=unique((items\|\|[]).filter(Boolean),type); var selected={}; items.forEach(function(_,i){selected[i]=true;}` |
| `epReviewPageV6` | window | `public/js/blocks/block-17.js` | 172 | `if(typeof window.epReviewPageV6==='function') window.epReviewPageV6(0); else {` |
| `epReviewPageV6` | window | `public/js/blocks/block-18.js` | 146 | `else if(typeof window.epReviewPageV6==='function') window.epReviewPageV6(0);` |
| `epReviewToggleV6` | window | `public/js/blocks/block-14.js` | 335 | `window.epReviewToggleV6 = function(i,val){ window.EP_DB_REVIEW_V6.selected[i] = !!val; var el = $('ep-v6-selected-count'); if(el) el.textContent = selectedCount` |
| `epRunTextImport` | window | `public/js/blocks/block-03.js` | 806 | `window.epRunTextImport = async function () {` |
| `epRunTextImport` | window | `public/js/blocks/block-14.js` | 425 | `window.epRunTextImport = async function(){` |
| `epRunTextImport` | window | `public/js/blocks/block-15.js` | 253 | `window.epRunTextImport=async function(){ var text=(($('ep-text-import-value')\|\|{}).value)\|\|''; var type=((window.EP_DB_REVIEW\|\|{}).type==='work')?'work':'` |
| `epSame` | function | `public/js/blocks/block-04.js` | 18 | `function epSame(a,b) {` |
| `epSameItem` | function | `public/js/blocks/block-03.js` | 1120 | `function epSameItem(a, b) {` |
| `epSaveActiveDbV7` | window | `public/js/blocks/block-15.js` | 209 | `window.epSaveActiveDbV7=async function(){` |
| `epSaveActiveDbV7` | window | `public/js/blocks/block-16.js` | 203 | `window.epSaveActiveDbV7=async function(){` |
| `epSaveActiveDbV7` | window | `public/js/blocks/block-19.js` | 184 | `window.epSaveActiveDbV7 = wrappedSave;` |
| `epSaveActiveDbV7` | window | `public/js/blocks/block-25.js` | 242 | `var oldSave=window.epSaveActiveDbV7; window.epSaveActiveDbV7=function(){ epV18SetStatus('upload','запись на сервер'); var r=oldSave?oldSave.apply(this,arguments` |
| `epSaveAiConfig` | window | `public/js/blocks/block-03.js` | 236 | `window.epSaveAiConfig = async function (withTest) {` |
| `epSaveGlobalDb` | function | `public/js/blocks/block-03.js` | 733 | `async function epSaveGlobalDb() {` |
| `epSaveMyDbToServer` | function | `public/js/blocks/block-11.js` | 116 | `async function epSaveMyDbToServer(){` |
| `epSaveServerDbToServer` | function | `public/js/blocks/block-11.js` | 131 | `async function epSaveServerDbToServer(){` |
| `epSaveUserDb` | function | `public/js/blocks/block-03.js` | 715 | `async function epSaveUserDb() {` |
| `epSendDbProposal` | function | `public/js/blocks/block-03.js` | 1126 | `async function epSendDbProposal(type, items, action) {` |
| `epSendServerProposal` | function | `public/js/blocks/block-11.js` | 144 | `async function epSendServerProposal(type,items,action){` |
| `epSendServerProposal` | window | `public/js/blocks/block-15.js` | 90 | `if(typeof window.epSendServerProposal==='function'){ await window.epSendServerProposal(type,items,reason\|\|'server_import_request'); return true; }` |
| `epSetAiProvider` | function | `public/js/blocks/block-03.js` | 47 | `function epSetAiProvider(provider, saveRemote) {` |
| `epSetAiProvider` | window | `public/js/blocks/block-03.js` | 60 | `window.epSetAiProvider = epSetAiProvider;` |
| `epSetArr` | function | `public/js/blocks/block-04.js` | 16 | `function epSetArr(type, arr) { if (type === 'work') workDB = arr; else matDB = arr; }` |
| `epSetCurrentDb` | function | `public/js/blocks/block-03.js` | 615 | `function epSetCurrentDb(type, arr) { if (type === 'work') workDB = arr; else matDB = arr; }` |
| `epSetDbScope` | window | `public/js/blocks/block-11.js` | 339 | `window.epSetDbScope = function(s){` |
| `epSetDbScope` | window | `public/js/blocks/block-13.js` | 164 | `window.epSetDbScope = async function(s){` |
| `epSetDbScope` | window | `public/js/blocks/block-15.js` | 192 | `window.epSetDbScope=async function(s){` |
| `epSetDbScope` | window | `public/js/blocks/block-19.js` | 62 | `try{ if(typeof window.epSetDbScope === 'function') window.epSetDbScope(s === 'global' ? 'global' : 'my'); }catch(e){}` |
| `epSetDbScope` | window | `public/js/blocks/block-19.js` | 124 | `window.epSetDbScope = wrappedScope;` |
| `epSetDbScope` | window | `public/js/blocks/block-25.js` | 240 | `var oldSetScope=window.epSetDbScope; window.epSetDbScope=function(s){ epV18SetStatus('download','загрузка с сервера'); var r=oldSetScope?oldSetScope.apply(this,` |
| `epShowDbReview` | function | `public/js/blocks/block-03.js` | 1075 | `function epShowDbReview(items, type, source, rawAnswer) {` |
| `epSplitDbDebug` | window | `public/js/blocks/block-11.js` | 690 | `window.epSplitDbDebug = function(){ return {scope:scope(), cleanMode:cleanMode(), myMat:EP_MY_MAT.length, myWork:EP_MY_WORK.length, serverMat:EP_SERVER_MAT.leng` |
| `epStartProposalV2` | function | `public/js/blocks/block-04.js` | 279 | `function epStartProposalV2() {` |
| `epStripCode` | function | `public/js/blocks/block-03.js` | 458 | `function epStripCode(t) {` |
| `epSwitchGlobalDbTab` | window | `public/js/blocks/block-04.js` | 164 | `window.epSwitchGlobalDbTab = function(type) { epGlobalDbType = type; epRenderGlobalDbModal(); };` |
| `epSwitchGlobalDbTab` | window | `public/js/blocks/block-08.js` | 170 | `window.epSwitchGlobalDbTab = function(type){` |
| `epSwitchGlobalDbTab` | window | `public/js/blocks/block-09.js` | 180 | `window.epSwitchGlobalDbTab = function(type){` |
| `epSwitchGlobalDbTab` | window | `public/js/blocks/block-10.js` | 258 | `window.epSwitchGlobalDbTab = function(type){` |
| `epSwitchGlobalDbTab` | window | `public/js/blocks/block-11.js` | 647 | `window.epSwitchGlobalDbTab = function(type){` |
| `epTestProviderKey` | function | `public/js/blocks/block-03.js` | 206 | `async function epTestProviderKey(provider, key, model) {` |
| `epTitleCaseRu` | function | `public/js/blocks/block-03.js` | 880 | `function epTitleCaseRu(s) {` |
| `epToggleShieldDbSub` | window | `public/js/blocks/block-05.js` | 145 | `window.epToggleShieldDbSub = function(id, e){ if(e) e.stopPropagation(); var el=qs(id); if(el) el.classList.toggle('active'); };` |
| `epToggleSmartSub` | window | `public/js/blocks/block-08.js` | 160 | `window.epToggleSmartSub = function(id,e){ if(e) e.stopPropagation(); var el = qs(id); if(el) el.classList.toggle('active'); };` |
| `epToggleSubCat` | window | `public/js/blocks/block-04.js` | 123 | `window.epToggleSubCat = function(id, ev) { if (ev) ev.stopPropagation(); const el = document.getElementById(id); if (el) el.classList.toggle('active'); };` |
| `epTriggerDbFileImport` | window | `public/js/blocks/block-03.js` | 788 | `window.epTriggerDbFileImport = function (type) {` |
| `epTriggerDbFileImport` | window | `public/js/blocks/block-12.js` | 170 | `window.epTriggerDbFileImport = function(type){` |
| `epTriggerDbFileImport` | window | `public/js/blocks/block-14.js` | 411 | `window.epTriggerDbFileImport = function(type){` |
| `epTriggerDbFileImport` | window | `public/js/blocks/block-15.js` | 249 | `window.epTriggerDbFileImport=function(type){ type=type==='work'?'work':'mat'; var target=scope(); if(target==='global'&&!isAdmin()) return window.epTriggerServe` |
| `epTriggerDbFileImport` | window | `public/js/blocks/block-17.js` | 118 | `window.epTriggerDbFileImport=function(type){` |
| `epTriggerDbFileImport` | window | `public/js/blocks/block-18.js` | 192 | `window.epTriggerDbFileImport=function(type){` |
| `epTriggerDbFileImport` | window | `public/js/blocks/block-19.js` | 195 | `window.epTriggerDbFileImport = function(type){` |
| `epTriggerServerProposalImportV7` | window | `public/js/blocks/block-15.js` | 250 | `window.epTriggerServerProposalImportV7=function(type){ type=type==='work'?'work':'mat'; var input=$('ep-db-file-input'); if(!input)return toast('Поле выбора фай` |
| `epTryJsonParseLoose` | function | `public/js/blocks/block-03.js` | 462 | `function epTryJsonParseLoose(t) {` |
| `epUltimateDeleteOne` | window | `public/js/blocks/block-10.js` | 359 | `window.epUltimateDeleteOne = async function(type, encoded){` |
| `epUltimateDeleteSelected` | window | `public/js/blocks/block-10.js` | 379 | `window.epUltimateDeleteSelected = async function(type){` |
| `epUltimateEditPrice` | window | `public/js/blocks/block-10.js` | 409 | `window.epUltimateEditPrice = async function(type, encoded, price){` |
| `epUltimateRenderGlobal` | window | `public/js/blocks/block-10.js` | 267 | `window.epUltimateRenderGlobal = function(){` |
| `epUltimateSelectDelete` | window | `public/js/blocks/block-10.js` | 355 | `window.epUltimateSelectDelete = function(type,flag){` |
| `epUltimateToggleSub` | window | `public/js/blocks/block-10.js` | 206 | `window.epUltimateToggleSub = function(id,e){` |
| `epV15AmpFromNominal` | function | `public/js/blocks/block-02.js` | 666 | `function epV15AmpFromNominal(n) { const m=String(n\|\|'').match(/(\d{1,3})/); return m?Number(m[1]):0; }` |
| `epV15BrandCode` | function | `public/js/blocks/block-02.js` | 617 | `function epV15BrandCode(v) {` |
| `epV15BrandRu` | function | `public/js/blocks/block-02.js` | 607 | `function epV15BrandRu(v) {` |
| `epV15BuildLinesFromConfig` | window | `public/js/blocks/block-22.js` | 38 | `window.epV15BuildLinesFromConfig = function(){` |
| `epV15CleanForName` | function | `public/js/blocks/block-02.js` | 627 | `function epV15CleanForName(s) { return String(s \|\| '').replace(/\s+/g,' ').trim(); }` |
| `epV15DetectLeakage` | function | `public/js/blocks/block-02.js` | 678 | `function epV15DetectLeakage(src, meta) {` |
| `epV15DetectModel` | function | `public/js/blocks/block-02.js` | 628 | `function epV15DetectModel(s, kind) {` |
| `epV15DetectNominal` | function | `public/js/blocks/block-02.js` | 649 | `function epV15DetectNominal(src, meta) {` |
| `epV15DetectPoles` | function | `public/js/blocks/block-02.js` | 659 | `function epV15DetectPoles(src, meta) {` |
| `epV15DisplayMaterialName` | function | `public/js/blocks/block-02.js` | 696 | `function epV15DisplayMaterialName(found, label, meta) {` |
| `epV15FormatAutoName` | function | `public/js/blocks/block-02.js` | 667 | `function epV15FormatAutoName(found, label, meta) {` |
| `epV15FormatRcdName` | function | `public/js/blocks/block-02.js` | 683 | `function epV15FormatRcdName(found, label, meta) {` |
| `epV15GetAssignments` | window | `public/js/blocks/block-22.js` | 26 | `window.epV15GetAssignments = function(it){` |
| `epV15InferAssignments` | window | `public/js/blocks/block-22.js` | 49 | `window.epV15InferAssignments=function(it){` |
| `epV15IsShieldDevice` | window | `public/js/blocks/block-22.js` | 12 | `window.epV15IsShieldDevice = function(it){` |
| `epV15MergeAssignments` | function | `public/js/blocks/block-02.js` | 705 | `function epV15MergeAssignments(dst, src) {` |
| `epV15MoveSelectedActive` | window | `public/js/blocks/block-22.js` | 79 | `window.epV15MoveSelectedActive=async function(type){` |
| `epV15NormalizeCurrentEstimate` | window | `public/js/blocks/block-22.js` | 57 | `window.epV15NormalizeCurrentEstimate=function(){` |
| `epV15Purpose` | window | `public/js/blocks/block-22.js` | 16 | `window.epV15Purpose = function(it){` |
| `epV15SelectVisible` | window | `public/js/blocks/block-22.js` | 78 | `window.epV15SelectVisible=function(type,on){ var box=type==='work'?$('editor-work-list'):$('editor-mat-list'); if(!box) return; Array.prototype.forEach.call(box` |
| `epV16GenerateCascadePanel` | function | `public/js/blocks/block-23.js` | 11 | `function epV16GenerateCascadePanel() {` |
| `epV16GenerateCascadePanel` | window | `public/js/blocks/block-23.js` | 184 | `window.epV16GenerateCascadePanel = epV16GenerateCascadePanel;` |
| `epV17BulkDelete` | window | `public/js/blocks/block-24.js` | 122 | `window.epV17BulkDelete=async function(){` |
| `epV17BulkMove` | window | `public/js/blocks/block-24.js` | 115 | `window.epV17BulkMove=async function(){` |
| `epV17Normalize` | window | `public/js/blocks/block-24.js` | 74 | `window.epV17Normalize=function(){` |
| `epV17ShowDetails` | window | `public/js/blocks/block-24.js` | 81 | `window.epV17ShowDetails=function(){` |
| `epV18DeleteSelected` | window | `public/js/blocks/block-25.js` | 230 | `window.epV18DeleteSelected=async function(){` |
| `epV18GenerateShield` | window | `public/js/blocks/block-25.js` | 139 | `window.epV18GenerateShield=function(){` |
| `epV18GenerateShield` | window | `public/js/blocks/block-26.js` | 139 | `window.epV18GenerateShield=window.epV19GenerateShield;` |
| `epV18GenerateShield` | window | `public/js/blocks/block-27.js` | 153 | `window.epV18GenerateShield=window.epV20GenerateShield;` |
| `epV18MoveSelected` | window | `public/js/blocks/block-25.js` | 223 | `window.epV18MoveSelected=async function(){` |
| `epV18SelectVisible` | window | `public/js/blocks/block-25.js` | 222 | `window.epV18SelectVisible=function(on){ Array.prototype.forEach.call(document.querySelectorAll('#settModal .ep-v18-check'),function(ch){ var row=ch.closest('.em` |
| `epV18SetStatus` | window | `public/js/blocks/block-25.js` | 89 | `window.epV18SetStatus=function(state,msg){` |
| `epV18SetStatus` | window | `public/js/blocks/block-28.js` | 56 | `try{ if(typeof window.epV18SetStatus==='function'){ window.epV18SetStatus(state,msg); return; } }catch(e){}` |
| `epV18ShowDetails` | window | `public/js/blocks/block-25.js` | 184 | `window.epV18ShowDetails=function(){` |
| `epV18ShowDetails` | window | `public/js/blocks/block-26.js` | 140 | `window.epV18ShowDetails=window.epV19ShowDetails;` |
| `epV18ShowDetails` | window | `public/js/blocks/block-27.js` | 155 | `window.epV18ShowDetails=window.epV20ShowDetails;` |
| `epV19GenerateShield` | window | `public/js/blocks/block-26.js` | 76 | `window.epV19GenerateShield=function(){` |
| `epV19GenerateShield` | window | `public/js/blocks/block-27.js` | 154 | `window.epV19GenerateShield=window.epV20GenerateShield;` |
| `epV19ShowDetails` | window | `public/js/blocks/block-26.js` | 128 | `window.epV19ShowDetails=function(){` |
| `epV19ShowDetails` | window | `public/js/blocks/block-27.js` | 156 | `window.epV19ShowDetails=window.epV20ShowDetails;` |
| `epV20GenerateShield` | window | `public/js/blocks/block-27.js` | 93 | `window.epV20GenerateShield=function(){` |
| `epV20ShowDetails` | window | `public/js/blocks/block-27.js` | 141 | `window.epV20ShowDetails=function(){` |
| `epV21DeleteSelected` | window | `public/js/blocks/block-28.js` | 178 | `window.epV21DeleteSelected=async function(){` |
| `epV21MoveSelected` | window | `public/js/blocks/block-28.js` | 163 | `window.epV21MoveSelected=async function(){` |
| `epV21SelectVisible` | window | `public/js/blocks/block-28.js` | 160 | `window.epV21SelectVisible=function(on){` |
| `epV21UpdateSubs` | window | `public/js/blocks/block-28.js` | 158 | `window.epV21UpdateSubs=function(){ fillSelectors(true); };` |
| `epWork` | function | `public/js/blocks/block-02.js` | 737 | `function epWork(label, q, price, words, meta) {` |
| `epWork` | function | `public/js/blocks/block-05.js` | 195 | `function epWork(label, q, price, words, meta){` |
| `epWork` | window | `public/js/blocks/block-20.js` | 76 | `window.epWork = function(label,q,price,words,meta){` |
| `esc` | function | `public/js/blocks/block-09.js` | 11 | `function esc(s){` |
| `esc` | function | `public/js/blocks/block-10.js` | 11 | `function esc(s){` |
| `esc` | function | `public/js/blocks/block-11.js` | 33 | `function esc(s){ return String(s == null ? '' : s).replace(/[&<>"']/g,function(m){ return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]; }); }` |
| `esc` | function | `public/js/blocks/block-14.js` | 32 | `function esc(s){ return String(s == null ? '' : s).replace(/[&<>"']/g, function(m){ return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[m]; })` |
| `esc` | function | `public/js/blocks/block-15.js` | 23 | `function esc(s){ return String(s==null?'':s).replace(/[&<>"']/g,function(m){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m];}); }` |
| `esc` | function | `public/js/blocks/block-16.js` | 23 | `function esc(s){ return String(s==null?'':s).replace(/[&<>"']/g,function(m){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m];}); }` |
| `esc` | function | `public/js/blocks/block-17.js` | 23 | `function esc(s){ return String(s==null?'':s).replace(/[&<>"']/g,function(m){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m];}); }` |
| `esc` | function | `public/js/blocks/block-18.js` | 22 | `function esc(s){ return String(s==null?'':s).replace(/[&<>"']/g,function(m){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m];}); }` |
| `esc` | function | `public/js/blocks/block-20.js` | 18 | `function esc(s){ return String(s==null?'':s).replace(/[&<>"']/g,function(m){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m];}); }` |
| `esc` | function | `public/js/blocks/block-23.js` | 10 | `function esc(v){return String(v==null?'':v).replace(/[&<>"']/g,function(m){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m];});}` |
| `esc` | function | `public/js/blocks/block-24.js` | 14 | `function esc(s){ return txt(s).replace(/[&<>"']/g,function(m){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m];}); }` |
| `esc` | function | `public/js/blocks/block-25.js` | 17 | `function esc(v){ return String(v==null?'':v).replace(/[&<>"']/g,function(m){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m];}); }` |
| `esc` | function | `public/js/blocks/block-26.js` | 12 | `function esc(s){ return String(s==null?'':s).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];}); }` |
| `esc` | function | `public/js/blocks/block-27.js` | 14 | `function esc(v){ return text(v).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];}); }` |
| `esc` | function | `public/js/blocks/block-28.js` | 17 | `function esc(v){ return String(v==null?'':v).replace(/[&<>"']/g,function(m){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m];}); }` |
| `explain` | function | `public/js/blocks/block-17.js` | 55 | `function explain(e){ var msg=(e&&(e.message\|\|e.code))?String(e.message\|\|e.code):String(e\|\|'Ошибка'); if(/permission\|insufficient/i.test(msg)) return 'Fir` |
| `explainErr` | function | `public/js/blocks/block-16.js` | 71 | `function explainErr(e){` |
| `explainServerEdit` | function | `public/js/blocks/block-19.js` | 30 | `function explainServerEdit(){ return '🌍 Базу сервера меняем только через Настройки → Админ панель → База сервера. Здесь сервер открыт для просмотра/выбора, чтоб` |
| `extractTextFromOpenAI` | function | `public/js/blocks/block-18.js` | 36 | `function extractTextFromOpenAI(data){` |
| `fbUser` | function | `public/js/blocks/block-16.js` | 32 | `function fbUser(){ try{ return (typeof firebase!=='undefined' && firebase.auth && firebase.auth().currentUser) ? firebase.auth().currentUser : null; }catch(e){ ` |
| `fileBuffer` | function | `public/js/blocks/block-14.js` | 152 | `function fileBuffer(file){ return new Promise(function(resolve,reject){ var r = new FileReader(); r.onload = function(){ resolve(r.result); }; r.onerror = rejec` |
| `fileBuffer` | function | `public/js/blocks/block-17.js` | 145 | `function fileBuffer(file){ return new Promise(function(res,rej){ var r=new FileReader(); r.onload=function(){res(r.result);}; r.onerror=rej; r.readAsArrayBuffer` |
| `fileBufferProgress` | function | `public/js/blocks/block-15.js` | 238 | `function fileBufferProgress(file,onp){ return new Promise(function(resolve,reject){ var r=new FileReader(); r.onprogress=function(e){ if(e.lengthComputable&&onp` |
| `fileText` | function | `public/js/blocks/block-14.js` | 151 | `function fileText(file){ return new Promise(function(resolve,reject){ var r = new FileReader(); r.onload = function(){ resolve(String(r.result \|\| '')); }; r.o` |
| `fileText` | function | `public/js/blocks/block-17.js` | 144 | `function fileText(file){ return new Promise(function(res,rej){ var r=new FileReader(); r.onload=function(){res(String(r.result\|\|''));}; r.onerror=rej; r.readA` |
| `fileTextProgress` | function | `public/js/blocks/block-15.js` | 237 | `function fileTextProgress(file,onp){ return new Promise(function(resolve,reject){ var r=new FileReader(); r.onprogress=function(e){ if(e.lengthComputable&&onp)o` |
| `fileToDataURL` | function | `public/js/blocks/block-18.js` | 35 | `function fileToDataURL(file){ return new Promise(function(res,rej){ var r=new FileReader(); r.onload=function(){res(String(r.result\|\|''));}; r.onerror=rej; r.` |
| `fillSelectors` | function | `public/js/blocks/block-28.js` | 101 | `function fillSelectors(force){` |
| `finishLoginSetup` | function | `public/js/blocks/block-02.js` | 191 | `async function finishLoginSetup() {` |
| `finishLoginSetup` | window | `public/js/blocks/block-03.js` | 1411 | `window.finishLoginSetup = async function () {` |
| `finishLoginSetup` | window | `public/js/blocks/block-04.js` | 293 | `if (typeof oldFinishSetupFull === 'function') { window.finishLoginSetup = async function() { await oldFinishSetupFull.apply(this, arguments); setTimeout(epInitF` |
| `firebaseHint` | function | `public/js/blocks/block-16.js` | 66 | `function firebaseHint(){` |
| `fixArr` | function | `public/js/blocks/block-05.js` | 89 | `function fixArr(arr){` |
| `fixShieldWorkItem` | function | `public/js/blocks/block-20.js` | 28 | `function fixShieldWorkItem(it, originalLabel){` |
| `fPrice` | function | `public/js/blocks/block-02.js` | 269 | `function fPrice(it) { return Math.round((it.p \|\| 0) * (1 + (it.type === 'mat'? coeffs.mat: coeffs.work) / 100)); }` |
| `generateCascadePanel` | function | `public/js/blocks/block-02.js` | 769 | `function generateCascadePanel() {` |
| `generateCascadePanel` | window | `public/js/blocks/block-05.js` | 307 | `window.generateCascadePanel = window.epGenerateShieldFixed;` |
| `generateCascadePanel` | window | `public/js/blocks/block-20.js` | 131 | `window.generateCascadePanel=wrapped;` |
| `generateCascadePanel` | window | `public/js/blocks/block-23.js` | 185 | `window.generateCascadePanel = epV16GenerateCascadePanel;` |
| `generateCascadePanel` | window | `public/js/blocks/block-24.js` | 102 | `window.generateCascadePanel=function(){ var r=oldGen?oldGen.apply(this,arguments):undefined; setTimeout(function(){ window.epV17Normalize(); try{ if(typeof rend` |
| `generateCascadePanel` | window | `public/js/blocks/block-27.js` | 159 | `try{ showPreview=window.showPreview; generateCascadePanel=window.epV20GenerateShield; window.generateCascadePanel=window.epV20GenerateShield; }catch(e){}` |
| `getArr` | function | `public/js/blocks/block-25.js` | 31 | `function getArr(type,src){` |
| `getArr` | function | `public/js/blocks/block-28.js` | 41 | `function getArr(type,src){` |
| `getAssigns` | function | `public/js/blocks/block-26.js` | 126 | `function getAssigns(it){ var out=[]; function add(v){ v=String(v\|\|'').trim(); if(v && !/позиция щита\|назначение не указано/i.test(v) && out.indexOf(v)<0) out` |
| `getAssigns` | function | `public/js/blocks/block-27.js` | 139 | `function getAssigns(it){ var out=[]; function add(v){ v=clean(v); if(v && !/позиция щита\|назначение не указано/i.test(v) && out.indexOf(v)<0) out.push(v); } if` |
| `getAssignV16` | function | `public/js/blocks/block-23.js` | 154 | `function getAssignV16(it){` |
| `getCfgCount` | function | `public/js/blocks/block-05.js` | 16 | `function getCfgCount(key, id, def){` |
| `getCheck` | function | `public/js/blocks/block-05.js` | 13 | `function getCheck(id){ var el=qs(id); return !!(el && el.checked); }` |
| `getGroup` | function | `public/js/blocks/block-06.js` | 22 | `function getGroup(it){ return it.g \|\| it.sc \|\| it.subcategory \|\| it.group \|\| ''; }` |
| `getGroup` | function | `public/js/blocks/block-08.js` | 41 | `function getGroup(it){ return (it && (it.g \|\| it.sc \|\| it.subcategory \|\| it.group)) \|\| ''; }` |
| `getMy` | function | `public/js/blocks/block-12.js` | 34 | `function getMy(type){` |
| `getMy` | function | `public/js/blocks/block-14.js` | 58 | `function getMy(type){` |
| `getMy` | function | `public/js/blocks/block-15.js` | 41 | `function getMy(type){ var w=type==='work'?window.EP_MY_WORK:window.EP_MY_MAT; return Array.isArray(w)?w.slice():readArr(type==='work'?LS_MY_WORK:LS_MY_MAT); }` |
| `getMy` | function | `public/js/blocks/block-16.js` | 49 | `function getMy(type){ var a=type==='work'?window.EP_MY_WORK:window.EP_MY_MAT; return Array.isArray(a)?a.slice():readArr(type==='work'?LS_MY_WORK:LS_MY_MAT); }` |
| `getMy` | function | `public/js/blocks/block-17.js` | 41 | `function getMy(type){ var a=type==='work'?window.EP_MY_WORK:window.EP_MY_MAT; return Array.isArray(a)?a.slice():readArr(type==='work'?LS_MY_WORK:LS_MY_MAT); }` |
| `getPDFHeader` | function | `public/js/blocks/block-02.js` | 979 | `function getPDFHeader(title) {` |
| `getScope` | function | `public/js/blocks/block-13.js` | 24 | `function getScope(){ try{ return localStorage.getItem(LS_SCOPE) === 'global' ? 'global' : 'my'; }catch(e){ return 'my'; } }` |
| `getScope` | function | `public/js/blocks/block-14.js` | 26 | `function getScope(){ try{ return localStorage.getItem(LS_SCOPE) === 'global' ? 'global' : 'my'; }catch(e){ return 'my'; } }` |
| `getServer` | function | `public/js/blocks/block-12.js` | 39 | `function getServer(type){` |
| `getServer` | function | `public/js/blocks/block-14.js` | 63 | `function getServer(type){` |
| `getServer` | function | `public/js/blocks/block-15.js` | 42 | `function getServer(type){ var w=type==='work'?window.EP_GLOBAL_WORK:window.EP_GLOBAL_MAT; if(Array.isArray(w))return w.slice(); var c=readObj(LS_SERVER_CACHE); ` |
| `getServer` | function | `public/js/blocks/block-16.js` | 50 | `function getServer(type){ var a=type==='work'?window.EP_GLOBAL_WORK:window.EP_GLOBAL_MAT; if(Array.isArray(a))return a.slice(); var o=readObj(LS_SERVER_CACHE); ` |
| `getServer` | function | `public/js/blocks/block-17.js` | 40 | `function getServer(type){ var a=type==='work'?window.EP_GLOBAL_WORK:window.EP_GLOBAL_MAT; if(Array.isArray(a)) return a.slice(); var c=readObj(LS_SERVER_CACHE);` |
| `getServerCache` | function | `public/js/blocks/block-25.js` | 30 | `function getServerCache(){ var c=objLS(LS_SERVER_CACHE); return {matDB:Array.isArray(c.matDB)?c.matDB:[], workDB:Array.isArray(c.workDB)?c.workDB:[]}; }` |
| `getServerCache` | function | `public/js/blocks/block-28.js` | 40 | `function getServerCache(){ var c=objLS(LS_SERVER_CACHE); return {matDB:Array.isArray(c.matDB)?c.matDB:[], workDB:Array.isArray(c.workDB)?c.workDB:[]}; }` |
| `getServerFromCache` | function | `public/js/blocks/block-13.js` | 48 | `function getServerFromCache(type){` |
| `getVal` | function | `public/js/blocks/block-05.js` | 12 | `function getVal(id, def){ var el=qs(id); return el ? el.value : def; }` |
| `global` | arrow/function | `public/js/blocks/block-08.js` | 106 | `var global = (type === 'work' ? (cache.workDB \|\| []) : (cache.matDB \|\| [])).map(function(x){ return Object.assign({}, x, {__src:'global'}); });` |
| `global` | arrow/function | `public/js/blocks/block-09.js` | 108 | `var global = (type === 'work' ? window.EP_HARD_GLOBAL_CACHE.workDB : window.EP_HARD_GLOBAL_CACHE.matDB)` |
| `global` | arrow/function | `public/js/blocks/block-10.js` | 136 | `var global = (type === 'work' ? (window.EP_ULTIMATE_DB_CACHE.workDB \|\| []) : (window.EP_ULTIMATE_DB_CACHE.matDB \|\| []))` |
| `groupAssign` | function | `public/js/blocks/block-25.js` | 151 | `function groupAssign(g){ var names=lines.filter(function(l){return l.group===g;}).map(function(l){return l.name;}); var head=g==='wet'?'Влажные зоны / защита 10` |
| `groupAssign` | function | `public/js/blocks/block-26.js` | 82 | `function groupAssign(g){ var a=lines.filter(function(l){return l.group===g;}).map(function(l){return l.name;}); return (g==='wet'?'Влажные зоны / защита 10 мА':` |
| `groupAssign` | function | `public/js/blocks/block-27.js` | 98 | `function groupAssign(g){ var arr=lines.filter(function(l){return l.group===g;}).map(function(l){return l.name;}); return (g==='wet'?'Влажные зоны / защита 10 мА` |
| `groupAssignment` | function | `public/js/blocks/block-02.js` | 815 | `function groupAssignment(group, leakage) {` |
| `groupAssignment` | function | `public/js/blocks/block-23.js` | 57 | `function groupAssignment(group, leakage) {` |
| `groupHtml` | function | `public/js/blocks/block-08.js` | 123 | `function groupHtml(arr, type, prefix, mode){` |
| `groupLines` | function | `public/js/blocks/block-26.js` | 48 | `function groupLines(lines){` |
| `groupNominals` | function | `public/js/blocks/block-27.js` | 91 | `function groupNominals(lines){ var m={}; lines.forEach(function(l){ var k=l.nominal; if(!m[k]) m[k]={nominal:k,assign:[]}; m[k].assign.push(l.name); }); return ` |
| `groupOf` | function | `public/js/blocks/block-09.js` | 27 | `function groupOf(it){ return (it && (it.g \|\| it.sc \|\| it.subcategory \|\| it.group)) \|\| ''; }` |
| `groupOf` | function | `public/js/blocks/block-10.js` | 33 | `function groupOf(it){ return (it && (it.g \|\| it.sc \|\| it.subcategory \|\| it.group)) \|\| ''; }` |
| `groupOf` | function | `public/js/blocks/block-11.js` | 45 | `function groupOf(it){ return (it && (it.g \|\| it.sc \|\| it.subcategory \|\| it.group)) \|\| ''; }` |
| `groupOf` | function | `public/js/blocks/block-12.js` | 29 | `function groupOf(it){ return (it && (it.g \|\| it.sc \|\| it.subcategory \|\| it.group)) \|\| ''; }` |
| `groupOf` | function | `public/js/blocks/block-13.js` | 31 | `function groupOf(it){ return (it && (it.g \|\| it.sc \|\| it.subcategory \|\| it.group)) \|\| ''; }` |
| `groupOf` | function | `public/js/blocks/block-14.js` | 40 | `function groupOf(it){ return (it && (it.g \|\| it.sc \|\| it.subcategory \|\| it.group)) \|\| ''; }` |
| `groupOf` | function | `public/js/blocks/block-15.js` | 37 | `function groupOf(it){ return (it&&(it.g\|\|it.sc\|\|it.subcategory\|\|it.group))\|\|''; }` |
| `groupOf` | function | `public/js/blocks/block-16.js` | 26 | `function groupOf(it){ return (it&&(it.g\|\|it.sc\|\|it.subcategory\|\|it.group))\|\|''; }` |
| `groupOf` | function | `public/js/blocks/block-17.js` | 37 | `function groupOf(it){ return (it&&(it.sc\|\|it.g\|\|it.group\|\|it.subcategory))\|\|''; }` |
| `groupOf` | function | `public/js/blocks/block-20.js` | 25 | `function groupOf(it){ return (it && (it.g \|\| it.sc \|\| it.subcategory \|\| it.group)) \|\| ''; }` |
| `groupOf` | function | `public/js/blocks/block-25.js` | 28 | `function groupOf(it){ return clean((it&&(it.g\|\|it.sc\|\|it.subcategory\|\|it.group))\|\|''); }` |
| `groupOf` | function | `public/js/blocks/block-28.js` | 26 | `function groupOf(it){ return clean((it&&(it.g\|\|it.sc\|\|it.subcategory\|\|it.group))\|\|''); }` |
| `handleGoogleAuth` | function | `public/js/blocks/block-02.js` | 77 | `async function handleGoogleAuth() {` |
| `hardHideLoader` | function | `public/js/blocks/block-14.js` | 27 | `function hardHideLoader(){` |
| `hasNested` | arrow/function | `public/js/blocks/block-04.js` | 137 | `const hasNested = (matDB \|\| []).some(x => x.sc \|\| x.g);` |
| `hideLoader` | function | `public/js/blocks/block-02.js` | 154 | `function hideLoader() { document.getElementById('global-loader').classList.remove('show'); }` |
| `hideOldBulk` | function | `public/js/blocks/block-28.js` | 128 | `function hideOldBulk(){` |
| `hideProgress` | function | `public/js/blocks/block-15.js` | 63 | `function hideProgress(){ var p=$('ep-v7-progress'); if(p)p.style.display='none'; }` |
| `hideProgress` | function | `public/js/blocks/block-16.js` | 64 | `function hideProgress(){ var p=$('ep-v7-progress'); if(p)p.style.display='none'; }` |
| `hideProgress` | function | `public/js/blocks/block-17.js` | 54 | `function hideProgress(){ var p=$('ep-v9-progress'); if(p)p.style.display='none'; }` |
| `hideProgress` | function | `public/js/blocks/block-18.js` | 20 | `function hideProgress(){ try{ if(typeof window.epDbHideProgress==='function') return window.epDbHideProgress(); }catch(e){} try{ if(typeof hideLoader==='functio` |
| `html` | arrow/function | `public/js/blocks/block-23.js` | 165 | `var html = (typeof getPDFHeader==='function') ? getPDFHeader(customTitle \|\| 'ДЕТАЛИЗАЦИЯ ЩИТА') : '<h2>ДЕТАЛИЗАЦИЯ ЩИТА</h2>';` |
| `html` | arrow/function | `public/js/blocks/block-24.js` | 84 | `var html=(typeof getPDFHeader==='function')?getPDFHeader('ДЕТАЛИЗАЦИЯ ЩИТА'):'<div class="pdf-header"><h1>ДЕТАЛИЗАЦИЯ ЩИТА</h1></div>';` |
| `html` | arrow/function | `public/js/blocks/block-25.js` | 187 | `var html=(typeof getPDFHeader==='function')?getPDFHeader('ДЕТАЛИЗАЦИЯ ЩИТА'):'<h2>ДЕТАЛИЗАЦИЯ ЩИТА</h2>';` |
| `idKey` | function | `public/js/blocks/block-09.js` | 40 | `function idKey(it){ return it && it.id ? 'id:' + String(it.id) : ''; }` |
| `idkey` | function | `public/js/blocks/block-10.js` | 37 | `function idkey(it){ return it && it.id ? 'id:' + String(it.id) : ''; }` |
| `idx` | arrow/function | `public/js/blocks/block-11.js` | 110 | `var idx=(arr\|\|[]).findIndex(function(x){ return sig(type,x)===k \|\| (it.id && String(x.id\|\|'')===String(it.id)); });` |
| `idx` | arrow/function | `public/js/blocks/block-12.js` | 102 | `var idx = (arr \|\| []).findIndex(function(x){ return sig(type,x) === k \|\| (it.id && String(x.id \|\| '') === String(it.id)); });` |
| `idx` | arrow/function | `public/js/blocks/block-14.js` | 110 | `var idx = (arr \|\| []).findIndex(function(x){ return sig(type,x) === k \|\| (it.id && String(x.id \|\| '') === String(it.id)); });` |
| `idx` | arrow/function | `public/js/blocks/block-15.js` | 47 | `function upsert(arr,type,it,replace){ it=clone(it); if(!it.id) it.id=(type==='work'?'w':'m')+'_v7_'+Date.now()+'_'+Math.random().toString(36).slice(2,7); if(it.` |
| `idx` | arrow/function | `public/js/blocks/block-16.js` | 55 | `function upsert(arr,type,it,replace){ it=clone(it); if(!it.id)it.id=(type==='work'?'w':'m')+'_v8_'+Date.now()+'_'+Math.random().toString(36).slice(2,8); if(it.s` |
| `importPrompt` | function | `public/js/blocks/block-18.js` | 151 | `function importPrompt(type, kind){` |
| `importTarget` | function | `public/js/blocks/block-19.js` | 187 | `function importTarget(){` |
| `inferCat` | function | `public/js/blocks/block-14.js` | 169 | `function inferCat(name,type){` |
| `inferCat` | function | `public/js/blocks/block-15.js` | 240 | `function inferCat(name,type){ var s=norm(name); if(type==='work'){ if(/штроб\|резк\|алмаз/.test(s))return 'Алмазная резка'; if(/подрозет\|коронк\|сверл\|бурен/.` |
| `inferCat` | function | `public/js/blocks/block-17.js` | 57 | `function inferCat(name,type){` |
| `inferCat` | function | `public/js/blocks/block-18.js` | 91 | `function inferCat(name,type){` |
| `inferSub` | function | `public/js/blocks/block-14.js` | 187 | `function inferSub(name,cat,type){` |
| `inferSub` | function | `public/js/blocks/block-15.js` | 241 | `function inferSub(name,cat,type){ var s=norm(name); if(type==='work'){ if(/бетон/.test(s))return 'Бетон'; if(/кирпич/.test(s))return 'Кирпич'; if(/монолит\|пане` |
| `inferSub` | function | `public/js/blocks/block-17.js` | 61 | `function inferSub(name,cat,type){ var n=norm(name); if(type==='work'){ if(/подрозет\|сверл/.test(n))return 'Подрозетники'; if(/штроб/.test(n))return 'Штробление` |
| `inferSub` | function | `public/js/blocks/block-18.js` | 109 | `function inferSub(name,cat,type){` |
| `injectBulkPanel` | function | `public/js/blocks/block-25.js` | 210 | `function injectBulkPanel(){` |
| `injectChecks` | function | `public/js/blocks/block-25.js` | 216 | `function injectChecks(){` |
| `injectDebugButton` | function | `public/js/blocks/block-16.js` | 300 | `function injectDebugButton(){` |
| `install` | function | `public/js/blocks/block-11.js` | 677 | `function install(){` |
| `install` | function | `public/js/blocks/block-15.js` | 262 | `function install(){ try{ var old=$('ep-db-ai-tools'); if(old)old.style.display='none'; }catch(e){} try{ renderDbEditors(); }catch(e){} }` |
| `installAdminSettingsButton` | function | `public/js/blocks/block-19.js` | 92 | `function installAdminSettingsButton(){` |
| `isAdmin` | function | `public/js/blocks/block-11.js` | 44 | `function isAdmin(){ try{ return appUser && appUser.role === 'admin'; }catch(e){ return false; } }` |
| `isAdmin` | function | `public/js/blocks/block-12.js` | 20 | `function isAdmin(){ try{ return !!(window.appUser && appUser.role === 'admin'); }catch(e){ return false; } }` |
| `isAdmin` | function | `public/js/blocks/block-13.js` | 22 | `function isAdmin(){ try{ return !!(window.appUser && appUser.role === 'admin'); }catch(e){ return false; } }` |
| `isAdmin` | function | `public/js/blocks/block-14.js` | 24 | `function isAdmin(){ try{ return !!(window.appUser && appUser.role === 'admin'); }catch(e){ return false; } }` |
| `isAdmin` | function | `public/js/blocks/block-15.js` | 28 | `function isAdmin(){ try{return !!(window.appUser && appUser.role==='admin');}catch(e){return false;} }` |
| `isAdmin` | function | `public/js/blocks/block-16.js` | 35 | `function isAdmin(){` |
| `isAdmin` | function | `public/js/blocks/block-17.js` | 29 | `function isAdmin(){ try{ return !!(window.appUser && window.appUser.role==='admin'); }catch(e){ return false; } }` |
| `isAdmin` | function | `public/js/blocks/block-19.js` | 22 | `function isAdmin(){` |
| `isAdmin` | function | `public/js/blocks/block-25.js` | 26 | `function isAdmin(){ try{ return !!(window.appUser && appUser.role==='admin'); }catch(e){ return false; } }` |
| `isAdmin` | function | `public/js/blocks/block-28.js` | 24 | `function isAdmin(){ try{ return !!(window.appUser && window.appUser.role==='admin'); }catch(e){ return false; } }` |
| `isDevice` | function | `public/js/blocks/block-24.js` | 41 | `function isDevice(it){` |
| `isDevice` | function | `public/js/blocks/block-26.js` | 127 | `function isDevice(it){ var n=String((it&&it.n)\|\|''); return it && it.type==='mat' && /C\d{1,3}\|[ABCDАВСД]\d{1,3}\|автомат\|узо\|диф\|реле\|контактор\|вводной` |
| `isDevice` | function | `public/js/blocks/block-27.js` | 140 | `function isDevice(it){ var n=text(it&&it.n); return it && it.type==='mat' && /C\d{1,3}\|[ABCDАВСД]\d{1,3}\|автомат\|узо\|диф\|реле\|контактор\|вводной/i.test(n)` |
| `isPass` | arrow/function | `public/js/blocks/block-02.js` | 434 | `let isPass = (g.pass > 0);` |
| `isShieldDevice` | function | `public/js/blocks/block-25.js` | 182 | `function isShieldDevice(it){ var n=String((it&&it.n)\|\|''); return it && it.type==='mat' && (/\b[ABCDАВСД]\s*\d{1,3}\b\|автомат\|узо\|диф\|реле\|контактор\|вво` |
| `isShieldDeviceV16` | function | `public/js/blocks/block-23.js` | 149 | `function isShieldDeviceV16(it){` |
| `isSoc` | arrow/function | `public/js/blocks/block-02.js` | 435 | `let isSoc = (g.soc > 0 \|\| g.tv > 0);` |
| `isSw` | arrow/function | `public/js/blocks/block-02.js` | 433 | `let isSw = (g.sw > 0 \|\| g.cross > 0);` |
| `isVisible` | function | `public/js/blocks/block-13.js` | 123 | `function isVisible(id){ var el = $(id); return !!(el && el.style && el.style.display && el.style.display !== 'none'); }` |
| `item` | function | `public/js/blocks/block-27.js` | 51 | `function item(n,q,p,type,meta,assigns){` |
| `itemKey` | function | `public/js/blocks/block-08.js` | 42 | `function itemKey(type, it){` |
| `items` | arrow/function | `public/js/blocks/block-03.js` | 1380 | `let items = (d.items \|\| []).map(function (x) {` |
| `items` | arrow/function | `public/js/blocks/block-23.js` | 167 | `var items=(window.currentEstimate\|\|[]).filter(isShieldDeviceV16);` |
| `items` | arrow/function | `public/js/blocks/block-24.js` | 88 | `var items=(Array.isArray(window.currentEstimate)?window.currentEstimate:[]).filter(isDevice);` |
| `jsonToItems` | function | `public/js/blocks/block-14.js` | 259 | `function jsonToItems(raw,type){` |
| `jsonToItems` | function | `public/js/blocks/block-15.js` | 244 | `function jsonToItems(raw,type){ if(raw&&raw.matDB&&type==='mat')raw=raw.matDB; else if(raw&&raw.workDB&&type==='work')raw=raw.workDB; else if(raw&&Array.isArray` |
| `jsonToItems` | function | `public/js/blocks/block-17.js` | 166 | `function jsonToItems(raw,type){ if(raw&&raw.matDB&&type==='mat')raw=raw.matDB; else if(raw&&raw.workDB&&type==='work')raw=raw.workDB; else if(raw&&Array.isArray` |
| `k` | arrow/function | `public/js/blocks/block-26.js` | 35 | `var db=(window.matDB\|\|[]).concat(window.userMatDB\|\|[]); var k=(kind==='ДИФ'\|\|kind==='Главный ДИФ')?'диф':'узо'; var br=brandRu(brand).toLowerCase();` |
| `k` | arrow/function | `public/js/blocks/block-27.js` | 49 | `function rcdName(kind,leak,brand,rcdType){ var k=(kind==='ДИФ'\|\|kind==='Главный ДИФ')?kind:'УЗО'; var hit=dbFindRcd(k,leak,brand); var br=brandRu(brand); var ` |
| `keyForProvider` | function | `public/js/blocks/block-18.js` | 27 | `function keyForProvider(p){` |
| `label` | function | `public/js/blocks/block-13.js` | 25 | `function label(){ return getScope() === 'global' ? '🌍 База сервера' : '👤 Моя база'; }` |
| `label` | function | `public/js/blocks/block-15.js` | 31 | `function label(){ return scope()==='global'?'🌍 База сервера':'👤 Моя база'; }` |
| `label` | function | `public/js/blocks/block-16.js` | 43 | `function label(){ return scope()==='global'?'🌍 База сервера':'👤 Моя база'; }` |
| `leak` | arrow/function | `public/js/blocks/block-06.js` | 158 | `if(/диф/i.test(n)){ const leak=(n.match(/(10\|30\|100\|300)\s*мА/i)\|\|[])[1]; const typ=(n.match(/тип\s*([A-Za-zА-Яа-я]+)/i)\|\|[])[1]; return ('ДИФ '+(leak?le` |
| `leak` | arrow/function | `public/js/blocks/block-06.js` | 159 | `if(/узо/i.test(n)){ const leak=(n.match(/(10\|30\|100\|300)\s*мА/i)\|\|[])[1]; const typ=(n.match(/тип\s*([A-Za-zА-Яа-я]+)/i)\|\|[])[1]; return ('УЗО '+(leak?le` |
| `lineConfig` | function | `public/js/blocks/block-24.js` | 24 | `function lineConfig(){` |
| `lineFromRaw` | function | `public/js/blocks/block-07.js` | 333 | `function lineFromRaw(raw, fallbackName){` |
| `listenForApprovals` | function | `public/js/blocks/block-02.js` | 1433 | `function listenForApprovals() {` |
| `loadCachedGlobalFromStorage` | function | `public/js/blocks/block-10.js` | 89 | `function loadCachedGlobalFromStorage(){` |
| `loadCustHistoryOptions` | function | `public/js/blocks/block-02.js` | 1357 | `function loadCustHistoryOptions() {` |
| `loadGlobal` | function | `public/js/blocks/block-09.js` | 84 | `async function loadGlobal(force){` |
| `loadGlobalDb` | function | `public/js/blocks/block-08.js` | 82 | `async function loadGlobalDb(force){` |
| `loadMasterDrafts` | function | `public/js/blocks/block-02.js` | 1449 | `async function loadMasterDrafts() {` |
| `localArr` | function | `public/js/blocks/block-08.js` | 28 | `function localArr(type){` |
| `localDb` | function | `public/js/blocks/block-09.js` | 28 | `function localDb(type){` |
| `localDb` | function | `public/js/blocks/block-10.js` | 45 | `function localDb(type){` |
| `localFullCleanOnly` | function | `public/js/blocks/block-11.js` | 503 | `function localFullCleanOnly(){` |
| `loginWithPin` | function | `public/js/blocks/block-02.js` | 157 | `async function loginWithPin() {` |
| `lookupKey` | function | `public/js/blocks/block-06.js` | 97 | `function lookupKey(type, meta, label){` |
| `makeItem` | function | `public/js/blocks/block-25.js` | 120 | `function makeItem(n,q,p,type,meta,assign){ var it=Object.assign({n:n,q:Number(q)\|\|1,p:money(p),u:(meta&&meta.unit)\|\|'шт',type:type\|\|'mat',tag:'shield'},me` |
| `makeItem` | function | `public/js/blocks/block-26.js` | 42 | `function makeItem(n,q,p,type,meta,assignments){` |
| `makeLocalCopy` | function | `public/js/blocks/block-10.js` | 212 | `function makeLocalCopy(type,it){` |
| `makeManualItem` | function | `public/js/blocks/block-16.js` | 147 | `function makeManualItem(type){` |
| `mat` | function | `public/js/blocks/block-02.js` | 830 | `function mat(label, q, price, words, meta, assignment) {` |
| `mat` | function | `public/js/blocks/block-23.js` | 72 | `function mat(label, q, price, words, meta, assignment) {` |
| `matDB` | window | `public/js/blocks/block-05.js` | 100 | `try { window.matDB = fixArr(window.matDB \|\| []); } catch(e){}` |
| `matDB` | window | `public/js/blocks/block-06.js` | 18 | `try { if(type === 'mat') matDB = arr; else workDB = arr; } catch(e) { if(type === 'mat') window.matDB = arr; else window.workDB = arr; }` |
| `matDB` | window | `public/js/blocks/block-12.js` | 71 | `window.matDB = getServer('mat');` |
| `matDB` | window | `public/js/blocks/block-12.js` | 75 | `window.matDB = getMy('mat');` |
| `matDB` | window | `public/js/blocks/block-13.js` | 78 | `window.matDB = sm.slice();` |
| `matDB` | window | `public/js/blocks/block-13.js` | 84 | `window.matDB = mm.slice();` |
| `matDB` | window | `public/js/blocks/block-14.js` | 74 | `window.matDB = getServer('mat');` |
| `matDB` | window | `public/js/blocks/block-14.js` | 77 | `window.matDB = getMy('mat');` |
| `matDB` | window | `public/js/blocks/block-15.js` | 46 | `function syncMain(target){ try{ var use=target\|\|scope(); window.matDB=(use==='global'?getServer('mat'):getMy('mat')); window.workDB=(use==='global'?getServer(` |
| `matDB` | window | `public/js/blocks/block-16.js` | 53 | `function syncMain(target){ try{ var use=target\|\|scope(); window.matDB=(use==='global'?getServer('mat'):getMy('mat')); window.workDB=(use==='global'?getServer(` |
| `matDB` | window | `public/js/blocks/block-17.js` | 44 | `function syncMain(target){ try{ var use=target\|\|scope(); window.matDB=(use==='global'?getServer('mat'):getMy('mat')); window.workDB=(use==='global'?getServer(` |
| `matDB` | window | `public/js/blocks/block-25.js` | 48 | `window.matDB = getArr('mat',src);` |
| `matDB` | window | `public/js/blocks/block-28.js` | 53 | `try{ window.matDB=getArr('mat',src); window.workDB=getArr('work',src); try{ matDB=window.matDB; workDB=window.workDB; }catch(e){} }catch(e){}` |
| `mergeAssignments` | function | `public/js/blocks/block-25.js` | 121 | `function mergeAssignments(rec,it){ var arr=rec.epAssignments\|\|[]; function add(v){ v=clean(v); if(v && arr.indexOf(v)<0) arr.push(v); } if(Array.isArray(it.ep` |
| `merged` | function | `public/js/blocks/block-09.js` | 105 | `function merged(type){` |
| `merged` | function | `public/js/blocks/block-10.js` | 134 | `function merged(type){` |
| `mergedArr` | function | `public/js/blocks/block-08.js` | 103 | `function mergedArr(type){` |
| `mergeEstimate` | function | `public/js/blocks/block-06.js` | 162 | `function mergeEstimate(){` |
| `mergeEstimateFixed` | function | `public/js/blocks/block-07.js` | 348 | `function mergeEstimateFixed(){` |
| `meta` | arrow/function | `public/js/blocks/block-07.js` | 323 | `var meta = (it && it.dbMeta) \|\| {};` |
| `meta` | arrow/function | `public/js/blocks/block-08.js` | 255 | `var meta = (it && it.dbMeta) \|\| {};` |
| `meta` | arrow/function | `public/js/blocks/block-09.js` | 354 | `var meta = (it && it.dbMeta) \|\| {};` |
| `meta` | arrow/function | `public/js/blocks/block-10.js` | 459 | `var meta = (it && it.dbMeta) \|\| {};` |
| `model` | arrow/function | `public/js/blocks/block-25.js` | 109 | `if(hit && /\(([^)]+)\)/.test(hit.n\|\|'')){ var model=(hit.n.match(/\(([^)]+)\)/)\|\|[])[1]; return curve+amp+' 1P '+model.replace(/^IEK/i,'ИЭК'); }` |
| `model` | arrow/function | `public/js/blocks/block-25.js` | 114 | `function rcdName(leak,brand,kind,rcdType){ var hit=dbFindRcd(leak,brand,kind); var br=brandRu(brand); if(hit && /\(([^)]+)\)/.test(hit.n\|\|'')){ var model=(hit` |
| `modelFromDbName` | function | `public/js/blocks/block-27.js` | 46 | `function modelFromDbName(n){ var m=text(n).match(/\(([^)]+)\)/); return m ? clean(m[1]).replace(/^IEK\s*/i,'ИЭК ') : ''; }` |
| `modM` | function | `public/js/blocks/block-02.js` | 382 | `function modM(t, v) {` |
| `modV` | function | `public/js/blocks/block-02.js` | 551 | `function modV(id, val) { cfg[id] = Math.max(0, (cfg[id] \|\| 0) + val); const el = document.getElementById('v-'+id); if(el) el.innerText = cfg[id]; }` |
| `money` | function | `public/js/blocks/block-14.js` | 34 | `function money(v){ var n = Number(String(v == null ? '' : v).replace(',', '.').replace(/[^\d.\-]/g,'')); return Number.isFinite(n) ? n : 0; }` |
| `money` | function | `public/js/blocks/block-15.js` | 26 | `function money(v){ var n=Number(String(v==null?'':v).replace(',','.').replace(/[^\d.\-]/g,'')); return Number.isFinite(n)?n:0; }` |
| `money` | function | `public/js/blocks/block-16.js` | 25 | `function money(v){ var n=Number(String(v==null?'':v).replace(',','.').replace(/[^\d.\-]/g,'')); return Number.isFinite(n)?n:0; }` |
| `money` | function | `public/js/blocks/block-17.js` | 26 | `function money(v){ var n=Number(String(v==null?'':v).replace(',','.').replace(/[^\d.\-]/g,'')); return Number.isFinite(n)?n:0; }` |
| `money` | function | `public/js/blocks/block-18.js` | 23 | `function money(v){ var n=Number(String(v==null?'':v).replace(',','.').replace(/[^\d.\-]/g,'')); return Number.isFinite(n)?n:0; }` |
| `money` | function | `public/js/blocks/block-20.js` | 20 | `function money(v){ var n=Number(String(v==null?'':v).replace(',','.').replace(/[^0-9.\-]/g,'')); return Number.isFinite(n)?n:0; }` |
| `money` | function | `public/js/blocks/block-25.js` | 96 | `function money(v){ var n=Number(String(v==null?'':v).replace(',','.').replace(/[^\d.\-]/g,'')); return Number.isFinite(n)?n:0; }` |
| `money` | function | `public/js/blocks/block-26.js` | 13 | `function money(v){ v=Number(v); return isFinite(v)?v:0; }` |
| `money` | function | `public/js/blocks/block-27.js` | 16 | `function money(v){ var n=Number(text(v).replace(',','.').replace(/[^0-9.\-]/g,'')); return isFinite(n)?n:0; }` |
| `move` | function | `public/js/blocks/block-24.js` | 119 | `function move(arr){ return (arr\|\|[]).map(function(it){ if(ids[String(it.id\|\|'')]){ var x=Object.assign({},it); if(c)x.c=c; if(g){x.g=g;x.sc=g;x.subcategory=` |
| `msg` | arrow/function | `public/js/blocks/block-16.js` | 72 | `var msg=(e&&(e.message\|\|e.code))?String(e.message\|\|e.code):'неизвестная ошибка';` |
| `msg` | arrow/function | `public/js/blocks/block-17.js` | 55 | `function explain(e){ var msg=(e&&(e.message\|\|e.code))?String(e.message\|\|e.code):String(e\|\|'Ошибка'); if(/permission\|insufficient/i.test(msg)) return 'Fir` |
| `msg` | function | `public/js/blocks/block-09.js` | 10 | `function msg(t){ if(typeof showToast === 'function') showToast(t); else alert(t); }` |
| `msg` | function | `public/js/blocks/block-12.js` | 19 | `function msg(t){ if(typeof showToast === 'function') showToast(t); else alert(t); }` |
| `myArr` | function | `public/js/blocks/block-11.js` | 63 | `function myArr(type){ return type==='work' ? EP_MY_WORK : EP_MY_MAT; }` |
| `name` | arrow/function | `public/js/blocks/block-18.js` | 183 | `var name=(file&&file.name)\|\|'', lower=name.toLowerCase();` |
| `nominalOf` | function | `public/js/blocks/block-24.js` | 36 | `function nominalOf(it){` |
| `norm` | function | `public/js/blocks/block-05.js` | 10 | `function norm(v){ return String(v \|\| '').toLowerCase().replace(/ё/g,'е').replace(/[^a-zа-я0-9]+/g,' ').trim(); }` |
| `norm` | function | `public/js/blocks/block-06.js` | 13 | `function norm(s){ return String(s\|\|'').toLowerCase().replace(/с/g,'c').replace(/а/g,'a').replace(/в/g,'b').replace(/х/g,'x').replace(/ё/g,'е').replace(/[×]/g,` |
| `norm` | function | `public/js/blocks/block-07.js` | 15 | `function norm(s){` |
| `norm` | function | `public/js/blocks/block-08.js` | 16 | `function norm(s){` |
| `norm` | function | `public/js/blocks/block-10.js` | 16 | `function norm(s){` |
| `norm` | function | `public/js/blocks/block-14.js` | 35 | `function norm(s){ return String(s \|\| '').toLowerCase().replace(/ё/g,'е').replace(/×/g,'x').replace(/х/g,'x').replace(/[^a-zа-я0-9]+/g,' ').trim(); }` |
| `norm` | function | `public/js/blocks/block-15.js` | 24 | `function norm(s){ return String(s\|\|'').toLowerCase().replace(/ё/g,'е').replace(/×/g,'x').replace(/х/g,'x').replace(/[^a-zа-я0-9]+/g,' ').trim(); }` |
| `norm` | function | `public/js/blocks/block-16.js` | 24 | `function norm(s){ return String(s\|\|'').toLowerCase().replace(/ё/g,'е').replace(/×/g,'x').replace(/х/g,'x').replace(/[^a-zа-я0-9]+/g,' ').trim(); }` |
| `norm` | function | `public/js/blocks/block-17.js` | 25 | `function norm(s){ return clean(s).toLowerCase().replace(/ё/g,'е').replace(/×/g,'x').replace(/х/g,'x').replace(/[^a-zа-я0-9]+/g,' ').trim(); }` |
| `norm` | function | `public/js/blocks/block-20.js` | 19 | `function norm(s){ return String(s\|\|'').toLowerCase().replace(/ё/g,'е').replace(/[×х]/g,'x').replace(/[^a-zа-я0-9]+/g,' ').trim(); }` |
| `norm` | function | `public/js/blocks/block-22.js` | 10 | `function norm(s){ return String(s\|\|'').toLowerCase().replace(/ё/g,'е').replace(/×/g,'x').replace(/х/g,'x').trim(); }` |
| `norm` | function | `public/js/blocks/block-24.js` | 13 | `function norm(v){ return clean(v).toLowerCase().replace(/ё/g,'е').replace(/[×х]/g,'x'); }` |
| `norm` | function | `public/js/blocks/block-25.js` | 19 | `function norm(v){ return clean(v).toLowerCase().replace(/ё/g,'е').replace(/×/g,'x').replace(/х/g,'x'); }` |
| `norm` | function | `public/js/blocks/block-27.js` | 28 | `function norm(v){ return clean(v).toLowerCase().replace(/ё/g,'е').replace(/×/g,'x').replace(/х/g,'x'); }` |
| `norm` | function | `public/js/blocks/block-28.js` | 28 | `function norm(v){ return clean(v).toLowerCase().replace(/ё/g,'е').replace(/×/g,'x').replace(/х/g,'x'); }` |
| `normalDbButtonWasClicked` | function | `public/js/blocks/block-19.js` | 105 | `function normalDbButtonWasClicked(e){` |
| `normalize` | function | `public/js/blocks/block-18.js` | 136 | `function normalize(raw,type){ var arr=Array.isArray(raw)?raw:(raw&&typeof raw==='object'?(raw.items\|\|raw.positions\|\|raw.data\|\|raw.materials\|\|raw.works\|` |
| `normalizeCurrentEstimate` | function | `public/js/blocks/block-20.js` | 90 | `function normalizeCurrentEstimate(){` |
| `normalizeDbItem` | function | `public/js/blocks/block-07.js` | 80 | `function normalizeDbItem(it, type){` |
| `normalizeDbs` | function | `public/js/blocks/block-07.js` | 138 | `function normalizeDbs(){` |
| `normalizeMaterialDb` | function | `public/js/blocks/block-06.js` | 25 | `function normalizeMaterialDb(){` |
| `normalizeV16` | function | `public/js/blocks/block-23.js` | 161 | `function normalizeV16(){ if(window.epV15NormalizeCurrentEstimate) window.epV15NormalizeCurrentEstimate(); }` |
| `normItem` | function | `public/js/blocks/block-14.js` | 211 | `function normItem(raw,type,idx){` |
| `normItem` | function | `public/js/blocks/block-15.js` | 242 | `function normItem(raw,type,idx){ raw=raw\|\|{}; var n=cleanText(raw.n\|\|raw.name\|\|raw.title\|\|raw.имя\|\|raw.наименование\|\|raw['Наименование']\|\|raw['Наз` |
| `normItem` | function | `public/js/blocks/block-16.js` | 251 | `function normItem(raw,type,idx){` |
| `normItem` | function | `public/js/blocks/block-17.js` | 62 | `function normItem(raw,type,idx){ raw=raw\|\|{}; var n=clean(raw.n\|\|raw.name\|\|raw.title\|\|raw.item\|\|raw.position\|\|raw['Наименование']\|\|raw['Название']` |
| `normItem` | function | `public/js/blocks/block-18.js` | 126 | `function normItem(x,type,i){` |
| `objLS` | function | `public/js/blocks/block-11.js` | 37 | `function objLS(k){ try{ var o=JSON.parse(localStorage.getItem(k)\|\|'{}'); return o && typeof o === 'object' ? o : {}; }catch(e){ return {}; } }` |
| `objLS` | function | `public/js/blocks/block-25.js` | 22 | `function objLS(k){ try{ var o=JSON.parse(localStorage.getItem(k)\|\|'{}'); return o&&typeof o==='object'?o:{}; }catch(e){ return {}; } }` |
| `objLS` | function | `public/js/blocks/block-28.js` | 20 | `function objLS(k){ try{ var o=JSON.parse(localStorage.getItem(k)\|\|'{}'); return o&&typeof o==='object'?o:{}; }catch(e){ return {}; } }` |
| `onerror` | window | `public/js/blocks/block-01.js` | 7 | `window.onerror = function(message, source, lineno, colno, error) {` |
| `openAdminDraftView` | function | `public/js/blocks/block-02.js` | 1468 | `function openAdminDraftView(uid) {` |
| `openAiModel` | function | `public/js/blocks/block-18.js` | 33 | `function openAiModel(){ try{ return (window.EP_AI_CONFIG&&window.EP_AI_CONFIG.openaiModel)\|\|safeGet('ep_openai_model_v1','gpt-4o-mini')\|\|'gpt-4o-mini'; }cat` |
| `openMatCatalog` | function | `public/js/blocks/block-02.js` | 319 | `function openMatCatalog() {` |
| `openMatCatalog` | window | `public/js/blocks/block-04.js` | 136 | `window.openMatCatalog = function() {` |
| `openMatCatalog` | window | `public/js/blocks/block-05.js` | 160 | `window.openMatCatalog = function(){ epNormalizeMaterialsDb(); var el=qs('mat-cat-list'); if(el) el.innerHTML = epRenderGrouped(window.matDB \|\| [], 'mat', 'cat` |
| `openMatCatalog` | window | `public/js/blocks/block-06.js` | 84 | `window.openMatCatalog = function(){ try{ normalizeMaterialDb(); const el=qs('mat-cat-list'); if(el){ el.innerHTML = renderGrouped(dbArr('mat'), 'mat', 'mat'); o` |
| `openMatCatalog` | window | `public/js/blocks/block-07.js` | 184 | `window.openMatCatalog = function(){` |
| `openMatCatalog` | window | `public/js/blocks/block-08.js` | 226 | `window.openMatCatalog = async function(){` |
| `openMatCatalog` | window | `public/js/blocks/block-09.js` | 257 | `window.openMatCatalog = async function(){` |
| `openMatCatalog` | window | `public/js/blocks/block-10.js` | 307 | `window.openMatCatalog = async function(){` |
| `openMatCatalog` | window | `public/js/blocks/block-11.js` | 255 | `window.openMatCatalog = function(){ syncWindowCaches(); var x=$('mat-cat-list'); if(x) x.innerHTML=renderCatalog('mat'); if(typeof openModal==='function') openM` |
| `openMatCatalog` | window | `public/js/blocks/block-25.js` | 238 | `var oldOpenMat=window.openMatCatalog; window.openMatCatalog=function(){ lastOpenedType='mat'; var r=oldOpenMat?oldOpenMat.apply(this,arguments):undefined; setTi` |
| `openMatCatalog` | window | `public/js/blocks/block-28.js` | 197 | `var oldOpenMat=window.openMatCatalog; window.openMatCatalog=function(){ var r=oldOpenMat?oldOpenMat.apply(this,arguments):undefined; setTimeout(ensurePanel,150)` |
| `openModal` | function | `public/js/blocks/block-02.js` | 236 | `function openModal(id) {` |
| `openModal` | window | `public/js/blocks/block-04.js` | 193 | `window.openModal = function(id) {` |
| `openModal` | window | `public/js/blocks/block-19.js` | 89 | `window.openModal = wrappedOpen;` |
| `openObjCard` | function | `public/js/blocks/block-02.js` | 1301 | `function openObjCard(id) {` |
| `openRecalcModal` | function | `public/js/blocks/block-02.js` | 1210 | `function openRecalcModal() {` |
| `openSwapModal` | function | `public/js/blocks/block-02.js` | 273 | `function openSwapModal(idx) {` |
| `openSwapModal` | window | `public/js/blocks/block-06.js` | 195 | `window.openSwapModal = function(idx){` |
| `openSwapModal` | window | `public/js/blocks/block-08.js` | 307 | `window.openSwapModal = async function(idx){` |
| `openSwapModal` | window | `public/js/blocks/block-09.js` | 391 | `window.openSwapModal = async function(idx){` |
| `openSwapModal` | window | `public/js/blocks/block-10.js` | 497 | `window.openSwapModal = async function(idx){` |
| `openSwapModal` | window | `public/js/blocks/block-20.js` | 221 | `window.openSwapModal=function(idx){` |
| `openWorkCatalog` | function | `public/js/blocks/block-02.js` | 330 | `function openWorkCatalog() {` |
| `openWorkCatalog` | window | `public/js/blocks/block-04.js` | 134 | `window.openWorkCatalog = function() { epNormalizeAllWorkDb(); const el = document.getElementById('work-cat-list'); if (el) el.innerHTML = epRenderGroupedList(wo` |
| `openWorkCatalog` | window | `public/js/blocks/block-05.js` | 161 | `window.openWorkCatalog = function(){ var el=qs('work-cat-list'); if(el) el.innerHTML = epRenderGrouped(window.workDB \|\| [], 'work', 'catalog', 'work_shield');` |
| `openWorkCatalog` | window | `public/js/blocks/block-06.js` | 85 | `window.openWorkCatalog = function(){ try{ const el=qs('work-cat-list'); if(el){ el.innerHTML = renderGrouped(dbArr('work'), 'work', 'work'); openModal('workModa` |
| `openWorkCatalog` | window | `public/js/blocks/block-07.js` | 190 | `window.openWorkCatalog = function(){` |
| `openWorkCatalog` | window | `public/js/blocks/block-08.js` | 233 | `window.openWorkCatalog = async function(){` |
| `openWorkCatalog` | window | `public/js/blocks/block-09.js` | 264 | `window.openWorkCatalog = async function(){` |
| `openWorkCatalog` | window | `public/js/blocks/block-10.js` | 315 | `window.openWorkCatalog = async function(){` |
| `openWorkCatalog` | window | `public/js/blocks/block-11.js` | 256 | `window.openWorkCatalog = function(){ syncWindowCaches(); var x=$('work-cat-list'); if(x) x.innerHTML=renderCatalog('work'); if(typeof openModal==='function') op` |
| `openWorkCatalog` | window | `public/js/blocks/block-25.js` | 239 | `var oldOpenWork=window.openWorkCatalog; window.openWorkCatalog=function(){ lastOpenedType='work'; var r=oldOpenWork?oldOpenWork.apply(this,arguments):undefined;` |
| `openWorkCatalog` | window | `public/js/blocks/block-28.js` | 198 | `var oldOpenWork=window.openWorkCatalog; window.openWorkCatalog=function(){ var r=oldOpenWork?oldOpenWork.apply(this,arguments):undefined; setTimeout(ensurePanel` |
| `options` | function | `public/js/blocks/block-28.js` | 94 | `function options(vals,placeholder,current){` |
| `optionsHtml` | function | `public/js/blocks/block-25.js` | 199 | `function optionsHtml(vals,placeholder){ vals=Array.from(new Set((vals\|\|[]).map(clean).filter(Boolean))).sort(function(a,b){return a.localeCompare(b,'ru');}); ` |
| `out` | arrow/function | `public/js/blocks/block-04.js` | 69 | `let out = (arr \|\| []).map(epNormalizeWorkItem);` |
| `p` | arrow/function | `public/js/blocks/block-18.js` | 25 | `try{ var p=(window.EP_AI_CONFIG&&window.EP_AI_CONFIG.provider)\|\|safeGet('ep_ai_provider_v1','gemini'); return p==='openai'?'openai':'gemini'; }catch(e){ retur` |
| `panelHtml` | function | `public/js/blocks/block-28.js` | 112 | `function panelHtml(){` |
| `parseJsonLoose` | function | `public/js/blocks/block-18.js` | 85 | `function parseJsonLoose(t){` |
| `patchAll` | function | `public/js/blocks/block-19.js` | 304 | `function patchAll(){ installAdminSettingsButton(); patchDbUi(); }` |
| `patchButtons` | function | `public/js/blocks/block-26.js` | 144 | `function patchButtons(){ try{ Array.prototype.forEach.call(document.querySelectorAll('button'),function(b){ var t=b.textContent\|\|''; if(t.indexOf('Сгенерирова` |
| `patchButtons` | function | `public/js/blocks/block-27.js` | 152 | `function patchButtons(){ try{ Array.prototype.forEach.call(document.querySelectorAll('button'),function(b){ var t=b.textContent\|\|''; if(t.indexOf('Сгенерирова` |
| `patchDbBulk` | function | `public/js/blocks/block-24.js` | 108 | `function patchDbBulk(){` |
| `patchDbUi` | function | `public/js/blocks/block-19.js` | 127 | `function patchDbUi(){` |
| `patchLabels` | function | `public/js/blocks/block-18.js` | 198 | `function patchLabels(){` |
| `patchShieldButton` | function | `public/js/blocks/block-20.js` | 121 | `function patchShieldButton(){` |
| `pendingAdd` | window | `public/js/blocks/block-04.js` | 127 | `window.pendingAdd = { item: epEstimateCopy(item, type), type: type };` |
| `pendingAdd` | window | `public/js/blocks/block-05.js` | 150 | `window.pendingAdd = { item:item, type:type };` |
| `popPool` | function | `public/js/blocks/block-02.js` | 414 | `function popPool() { pool.pop(); rfPool(); }` |
| `populateShieldExtras` | function | `public/js/blocks/block-02.js` | 553 | `function populateShieldExtras() {` |
| `presentGroups` | function | `public/js/blocks/block-27.js` | 92 | `function presentGroups(lines){ var seen={},out=[]; lines.forEach(function(l){ if(!seen[l.group]){ seen[l.group]=1; out.push(l.group); } }); return out; }` |
| `printAct` | function | `public/js/blocks/block-02.js` | 1105 | `function printAct() {` |
| `progress` | function | `public/js/blocks/block-17.js` | 53 | `function progress(title,pct,txt){ ensureProgress(); var p=$('ep-v9-progress'),f=$('ep-v9-fill'),t=$('ep-v9-title'),x=$('ep-v9-txt'); if(p)p.style.display='flex'` |
| `progress` | function | `public/js/blocks/block-18.js` | 16 | `function progress(title,pct,text){` |
| `promptAdd` | function | `public/js/blocks/block-02.js` | 343 | `function promptAdd(id, type) {` |
| `promptAdd` | window | `public/js/blocks/block-04.js` | 133 | `window.promptAdd = function(id, type) { if (type === 'work') return window.epPromptGroupedAdd(id, type); if (typeof oldPromptAddFull === 'function') return oldP` |
| `promptAdd` | window | `public/js/blocks/block-08.js` | 242 | `window.promptAdd = function(keyOrId, type){` |
| `promptAdd` | window | `public/js/blocks/block-09.js` | 330 | `window.promptAdd = function(keyOrId,type){` |
| `promptAdd` | window | `public/js/blocks/block-10.js` | 420 | `window.promptAdd = function(value,type){` |
| `promptAdd` | window | `public/js/blocks/block-11.js` | 258 | `window.promptAdd = function(v,type){` |
| `provider` | function | `public/js/blocks/block-18.js` | 24 | `function provider(){` |
| `purposeOf` | function | `public/js/blocks/block-24.js` | 65 | `function purposeOf(it){` |
| `purposeV16` | function | `public/js/blocks/block-23.js` | 160 | `function purposeV16(it){ return window.epV15Purpose ? window.epV15Purpose(it) : 'аппарат щита'; }` |
| `pushArr` | function | `public/js/blocks/block-20.js` | 140 | `function pushArr(out, arr, src){ if(Array.isArray(arr)) arr.forEach(function(it){ if(it&&it.n) out.push(tagSrc(it,src)); }); }` |
| `qs` | function | `public/js/blocks/block-05.js` | 8 | `function qs(id){ return document.getElementById(id); }` |
| `qs` | function | `public/js/blocks/block-06.js` | 10 | `function qs(id){ return document.getElementById(id); }` |
| `qs` | function | `public/js/blocks/block-07.js` | 9 | `function qs(id){ return document.getElementById(id); }` |
| `qs` | function | `public/js/blocks/block-08.js` | 9 | `function qs(id){ return document.getElementById(id); }` |
| `qs` | function | `public/js/blocks/block-09.js` | 9 | `function qs(id){ return document.getElementById(id); }` |
| `rcdName` | function | `public/js/blocks/block-25.js` | 114 | `function rcdName(leak,brand,kind,rcdType){ var hit=dbFindRcd(leak,brand,kind); var br=brandRu(brand); if(hit && /\(([^)]+)\)/.test(hit.n\|\|'')){ var model=(hit` |
| `rcdName` | function | `public/js/blocks/block-26.js` | 32 | `function rcdName(kind, leak, brand, rcdType){ var br=brandRu(brand); var k=kind==='ДИФ'\|\|kind==='Главный ДИФ'?'ДИФ':'УЗО'; if(br==='ABB') return k+' 2P 40A '+` |
| `rcdName` | function | `public/js/blocks/block-27.js` | 49 | `function rcdName(kind,leak,brand,rcdType){ var k=(kind==='ДИФ'\|\|kind==='Главный ДИФ')?kind:'УЗО'; var hit=dbFindRcd(k,leak,brand); var br=brandRu(brand); var ` |
| `rcdPrice` | function | `public/js/blocks/block-25.js` | 115 | `function rcdPrice(leak,brand,kind){ var hit=dbFindRcd(leak,brand,kind); if(hit) return money(hit.p); return leak===10?3600:1195; }` |
| `rcdPrice` | function | `public/js/blocks/block-26.js` | 33 | `function rcdPrice(kind, leak, brand){` |
| `rcdPrice` | function | `public/js/blocks/block-27.js` | 50 | `function rcdPrice(kind,leak,brand){ var hit=dbFindRcd(kind,leak,brand); if(hit && Number(hit.p)>0) return Number(hit.p); return (kind==='ДИФ'\|\|kind==='Главный` |
| `readArr` | function | `public/js/blocks/block-12.js` | 24 | `function readArr(k){ try{ var a = JSON.parse(localStorage.getItem(k) \|\| '[]'); return Array.isArray(a) ? a : []; }catch(e){ return []; } }` |
| `readArr` | function | `public/js/blocks/block-13.js` | 26 | `function readArr(k){ try{ var a = JSON.parse(localStorage.getItem(k) \|\| '[]'); return Array.isArray(a) ? a : []; }catch(e){ return []; } }` |
| `readArr` | function | `public/js/blocks/block-14.js` | 36 | `function readArr(k){ try{ var a = JSON.parse(localStorage.getItem(k) \|\| '[]'); return Array.isArray(a) ? a : []; }catch(e){ return []; } }` |
| `readArr` | function | `public/js/blocks/block-15.js` | 33 | `function readArr(k){ try{var a=JSON.parse(localStorage.getItem(k)\|\|'[]');return Array.isArray(a)?a:[];}catch(e){return [];} }` |
| `readArr` | function | `public/js/blocks/block-16.js` | 44 | `function readArr(k){ try{ var a=JSON.parse(localStorage.getItem(k)\|\|'[]'); return Array.isArray(a)?a:[]; }catch(e){ return []; } }` |
| `readArr` | function | `public/js/blocks/block-17.js` | 32 | `function readArr(k){ try{ var a=JSON.parse(localStorage.getItem(k)\|\|'[]'); return Array.isArray(a)?a:[]; }catch(e){ return []; } }` |
| `readArr` | function | `public/js/blocks/block-20.js` | 22 | `function readArr(k){ try{ var a=JSON.parse(localStorage.getItem(k)\|\|'[]'); return Array.isArray(a)?a:[]; }catch(e){ return []; } }` |
| `readDbFile` | function | `public/js/blocks/block-15.js` | 246 | `async function readDbFile(file,type,target){ showProgress('Импорт базы',5,'Старт'); var name=file.name\|\|'', lower=name.toLowerCase(), items=[]; if(file.type&&` |
| `readDbFileV6` | function | `public/js/blocks/block-14.js` | 372 | `async function readDbFileV6(file,type){` |
| `readGlobal` | function | `public/js/blocks/block-10.js` | 103 | `async function readGlobal(force){` |
| `readGlobalDoc` | function | `public/js/blocks/block-17.js` | 76 | `async function readGlobalDoc(){` |
| `readObj` | function | `public/js/blocks/block-12.js` | 26 | `function readObj(k){ try{ var o = JSON.parse(localStorage.getItem(k) \|\| '{}'); return o && typeof o === 'object' ? o : {}; }catch(e){ return {}; } }` |
| `readObj` | function | `public/js/blocks/block-13.js` | 28 | `function readObj(k){ try{ var o = JSON.parse(localStorage.getItem(k) \|\| '{}'); return o && typeof o === 'object' ? o : {}; }catch(e){ return {}; } }` |
| `readObj` | function | `public/js/blocks/block-14.js` | 38 | `function readObj(k){ try{ var o = JSON.parse(localStorage.getItem(k) \|\| '{}'); return o && typeof o === 'object' ? o : {}; }catch(e){ return {}; } }` |
| `readObj` | function | `public/js/blocks/block-15.js` | 35 | `function readObj(k){ try{var o=JSON.parse(localStorage.getItem(k)\|\|'{}');return o&&typeof o==='object'?o:{};}catch(e){return {};} }` |
| `readObj` | function | `public/js/blocks/block-16.js` | 46 | `function readObj(k){ try{ var o=JSON.parse(localStorage.getItem(k)\|\|'{}'); return o&&typeof o==='object'?o:{}; }catch(e){ return {}; } }` |
| `readObj` | function | `public/js/blocks/block-17.js` | 34 | `function readObj(k){ try{ var o=JSON.parse(localStorage.getItem(k)\|\|'{}'); return o&&typeof o==='object'?o:{}; }catch(e){ return {}; } }` |
| `readObj` | function | `public/js/blocks/block-20.js` | 23 | `function readObj(k){ try{ var o=JSON.parse(localStorage.getItem(k)\|\|'{}'); return o&&typeof o==='object'?o:{}; }catch(e){ return {}; } }` |
| `refreshDbEnhancements` | function | `public/js/blocks/block-25.js` | 220 | `function refreshDbEnhancements(){ injectBulkPanel(); injectChecks(); }` |
| `refreshMyFromServer` | function | `public/js/blocks/block-13.js` | 90 | `async function refreshMyFromServer(){` |
| `refreshPreview` | function | `public/js/blocks/block-02.js` | 1103 | `function refreshPreview() { showPreview(currentPreviewMode); }` |
| `refreshServerFromServer` | function | `public/js/blocks/block-13.js` | 105 | `async function refreshServerFromServer(){` |
| `reloadActiveDb` | function | `public/js/blocks/block-15.js` | 95 | `async function reloadActiveDb(){` |
| `reloadFromRemoteCurrent` | function | `public/js/blocks/block-16.js` | 127 | `async function reloadFromRemoteCurrent(){` |
| `renderAdminUsers` | function | `public/js/blocks/block-02.js` | 1482 | `async function renderAdminUsers() {` |
| `renderCatalog` | function | `public/js/blocks/block-11.js` | 226 | `function renderCatalog(type){` |
| `renderChart` | function | `public/js/blocks/block-02.js` | 1242 | `function renderChart() {` |
| `renderDbEditors` | function | `public/js/blocks/block-02.js` | 1373 | `function renderDbEditors() {` |
| `renderDbEditors` | window | `public/js/blocks/block-03.js` | 1206 | `window.renderDbEditors = function () {` |
| `renderDbEditors` | window | `public/js/blocks/block-04.js` | 141 | `window.renderDbEditors = function() {` |
| `renderDbEditors` | window | `public/js/blocks/block-05.js` | 162 | `window.renderDbEditors = function(){` |
| `renderDbEditors` | window | `public/js/blocks/block-06.js` | 86 | `window.renderDbEditors = function(){` |
| `renderDbEditors` | window | `public/js/blocks/block-07.js` | 196 | `window.renderDbEditors = function(){` |
| `renderDbEditors` | window | `public/js/blocks/block-09.js` | 284 | `window.renderDbEditors = async function(){` |
| `renderDbEditors` | window | `public/js/blocks/block-10.js` | 336 | `window.renderDbEditors = async function(){` |
| `renderDbEditors` | window | `public/js/blocks/block-11.js` | 326 | `window.renderDbEditors = function(){` |
| `renderDbEditors` | window | `public/js/blocks/block-15.js` | 184 | `window.renderDbEditors=function(){` |
| `renderDbEditors` | window | `public/js/blocks/block-16.js` | 306 | `window.renderDbEditors=function(){ try{ if(typeof oldRender==='function') oldRender(); }catch(e){ console.warn('old renderDbEditors failed',e); } try{ injectDeb` |
| `renderDbEditors` | window | `public/js/blocks/block-25.js` | 221 | `var oldDbRender=window.renderDbEditors; window.renderDbEditors=function(){ var r=oldDbRender?oldDbRender.apply(this,arguments):undefined; setTimeout(refreshDbEn` |
| `renderDbEditors` | window | `public/js/blocks/block-28.js` | 195 | `window.renderDbEditors=function(){ var r=oldRender?oldRender.apply(this,arguments):undefined; setTimeout(ensurePanel,120); setTimeout(ensurePanel,500); return r` |
| `renderDbRows` | function | `public/js/blocks/block-11.js` | 295 | `function renderDbRows(type){` |
| `renderGlobalModalFixed` | function | `public/js/blocks/block-08.js` | 177 | `function renderGlobalModalFixed(){` |
| `renderGrouped` | function | `public/js/blocks/block-06.js` | 52 | `function renderGrouped(arr, type, prefix){` |
| `renderGroupedFixed` | function | `public/js/blocks/block-07.js` | 145 | `function renderGroupedFixed(arr, type, prefix){` |
| `renderItem` | function | `public/js/blocks/block-06.js` | 73 | `function renderItem(it,type){` |
| `renderItems` | function | `public/js/blocks/block-10.js` | 153 | `function renderItems(arr,type,prefix,mode){` |
| `renderList` | function | `public/js/blocks/block-09.js` | 124 | `function renderList(arr,type,prefix,mode){` |
| `renderLogicUI` | function | `public/js/blocks/block-02.js` | 1188 | `function renderLogicUI() {` |
| `renderMainDirect` | function | `public/js/blocks/block-25.js` | 128 | `function renderMainDirect(){` |
| `renderMainTable` | function | `public/js/blocks/block-02.js` | 302 | `function renderMainTable() {` |
| `renderMainTable` | window | `public/js/blocks/block-06.js` | 178 | `window.renderMainTable = function(){ mergeEstimate(); if(oldRender) return oldRender(); };` |
| `renderMainTable` | window | `public/js/blocks/block-07.js` | 379 | `window.renderMainTable = function(){` |
| `renderMainTable` | window | `public/js/blocks/block-20.js` | 104 | `window.renderMainTable=newRender;` |
| `renderMainTable` | window | `public/js/blocks/block-22.js` | 87 | `window.renderMainTable=function(){ try{ window.epV15NormalizeCurrentEstimate(); }catch(e){} return oldRender ? oldRender.apply(this,arguments) : undefined; };` |
| `renderMainTable` | window | `public/js/blocks/block-23.js` | 196 | `window.renderMainTable=function(){ try{normalizeV16();}catch(e){} return oldRender?oldRender.apply(this,arguments):undefined; };` |
| `renderMainTable` | window | `public/js/blocks/block-24.js` | 99 | `window.renderMainTable=function(){ window.epV17Normalize(); return oldRender?oldRender.apply(this,arguments):undefined; };` |
| `renderMainTable` | window | `public/js/blocks/block-25.js` | 136 | `window.renderMainTable=function(){ try{ window.currentEstimate=currentEstimate; }catch(e){} renderMainDirect(); };` |
| `renderPanel` | function | `public/js/blocks/block-15.js` | 108 | `function renderPanel(){` |
| `renderReviewPage` | function | `public/js/blocks/block-14.js` | 292 | `function renderReviewPage(){` |
| `renderRows` | function | `public/js/blocks/block-15.js` | 177 | `function renderRows(type){` |
| `renderServerModalList` | function | `public/js/blocks/block-11.js` | 621 | `function renderServerModalList(type){` |
| `renderShieldExtras` | function | `public/js/blocks/block-02.js` | 576 | `function renderShieldExtras() {` |
| `reqDisplayName` | function | `public/js/blocks/block-07.js` | 209 | `function reqDisplayName(label, meta){` |
| `reqName` | function | `public/js/blocks/block-06.js` | 102 | `function reqName(label, meta){` |
| `requestPriceChange` | function | `public/js/blocks/block-02.js` | 1423 | `async function requestPriceChange(type, id, newPrice) {` |
| `requestPriceChange` | window | `public/js/blocks/block-03.js` | 1307 | `window.requestPriceChange = async function (type, id, newPrice) {` |
| `requestPriceChange` | window | `public/js/blocks/block-11.js` | 425 | `window.requestPriceChange = async function(type,id,newPrice){` |
| `rerender` | function | `public/js/blocks/block-12.js` | 161 | `function rerender(){` |
| `rerender` | function | `public/js/blocks/block-14.js` | 144 | `function rerender(){` |
| `rerender` | function | `public/js/blocks/block-16.js` | 140 | `function rerender(){ try{ syncMain(scope()); if(typeof renderDbEditors==='function') renderDbEditors(); }catch(e){} try{ if(typeof rf==='function') rf(); }catch` |
| `rerender` | function | `public/js/blocks/block-17.js` | 116 | `function rerender(){ try{ syncMain(scope()); if(typeof renderDbEditors==='function') renderDbEditors(); }catch(e){} try{ if(typeof rf==='function') rf(); }catch` |
| `rerenderOpenScreens` | function | `public/js/blocks/block-13.js` | 135 | `function rerenderOpenScreens(){` |
| `reviewedItems` | function | `public/js/blocks/block-11.js` | 441 | `function reviewedItems(){` |
| `reviewedItems` | function | `public/js/blocks/block-12.js` | 108 | `function reviewedItems(){` |
| `rfPool` | function | `public/js/blocks/block-02.js` | 415 | `function rfPool() {` |
| `room` | function | `public/js/blocks/block-22.js` | 41 | `function room(label,count,wet){ count=Number(count)\|\|0; for(var i=1;i<=count;i++){ var n=count>1?label+' '+i:label; add(n+' розетки','C16',wet?'wet':'power');` |
| `room` | function | `public/js/blocks/block-24.js` | 27 | `function room(label,count,wet){ count=Number(count)\|\|0; for(var i=1;i<=count;i++){ var p=count>1?label+' '+i:label; add(p+' розетки','C16',wet?'wet':'power');` |
| `room` | function | `public/js/blocks/block-25.js` | 142 | `function room(label,count,wet){ count=Number(count)\|\|0; for(var i=1;i<=count;i++){ var n=count>1?label+' '+i:label; addLine(n+' розетки','C16',wet?'wet':'powe` |
| `room` | function | `public/js/blocks/block-26.js` | 56 | `function room(label,count,wet){ count=Number(count)\|\|0; for(var i=1;i<=count;i++){ var n=count>1?label+' '+i:label; add(n+' розетки','C16',wet?'wet':'power',{` |
| `room` | function | `public/js/blocks/block-27.js` | 72 | `function room(label,c,wet){ c=Number(c)\|\|0; for(var i=1;i<=c;i++){ var n=c>1?label+' '+i:label; add(n+' розетки','C16',wet?'wet':'power',{wet:wet}); add(n+' с` |
| `rowId` | function | `public/js/blocks/block-28.js` | 131 | `function rowId(row,type,idx){` |
| `rowsToItems` | function | `public/js/blocks/block-14.js` | 221 | `function rowsToItems(rows,type){` |
| `rowsToItems` | function | `public/js/blocks/block-15.js` | 243 | `function rowsToItems(rows,type){ rows=rows\|\|[]; var header=null,currentCat='',currentSub='',out=[]; function cell(row,i){return cleanText((row\|\|[])[i]);} ro` |
| `rowsToItems` | function | `public/js/blocks/block-17.js` | 147 | `function rowsToItems(rows,type){` |
| `runAiCheck` | function | `public/js/blocks/block-02.js` | 909 | `async function runAiCheck() {` |
| `runAiCheck` | window | `public/js/blocks/block-03.js` | 552 | `window.runAiCheck = async function () {` |
| `safe` | function | `public/js/blocks/block-06.js` | 12 | `function safe(s){ return String(s == null ? '' : s).replace(/[&<>"]/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[m])); }` |
| `safe` | function | `public/js/blocks/block-08.js` | 11 | `function safe(s){` |
| `safeGet` | function | `public/js/blocks/block-02.js` | 8 | `function safeGet(key, def) { try { return localStorage.getItem(key) \|\| def; } catch(e) { return def; } }` |
| `safeHtml` | function | `public/js/blocks/block-07.js` | 10 | `function safeHtml(s){` |
| `safeSet` | function | `public/js/blocks/block-02.js` | 9 | `function safeSet(key, val) { try { localStorage.setItem(key, val); } catch(e) {} }` |
| `safeText` | function | `public/js/blocks/block-05.js` | 9 | `function safeText(v){ return String(v \|\| '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }` |
| `sameClass` | function | `public/js/blocks/block-09.js` | 382 | `function sameClass(a,b){` |
| `sameClass` | function | `public/js/blocks/block-10.js` | 488 | `function sameClass(a,b){` |
| `sameClass` | function | `public/js/blocks/block-20.js` | 198 | `function sameClass(a,b){` |
| `sameSwapClass` | function | `public/js/blocks/block-08.js` | 284 | `function sameSwapClass(current, cand){` |
| `saveApiKey` | function | `public/js/blocks/block-02.js` | 256 | `async function saveApiKey(val) {` |
| `saveApiKey` | window | `public/js/blocks/block-03.js` | 307 | `window.saveApiKey = async function (val) {` |
| `saveArr` | function | `public/js/blocks/block-25.js` | 53 | `async function saveArr(type,arr){` |
| `saveArr` | function | `public/js/blocks/block-28.js` | 63 | `async function saveArr(type,arr){` |
| `saveChoice` | function | `public/js/blocks/block-06.js` | 96 | `function saveChoice(key,id){ const m=savedChoices(); m[key]=id; localStorage.setItem('ep_db_default_choices_v1', JSON.stringify(m)); }` |
| `saveCust` | function | `public/js/blocks/block-02.js` | 1157 | `function saveCust() {` |
| `savedChoices` | function | `public/js/blocks/block-06.js` | 95 | `function savedChoices(){ try{return JSON.parse(localStorage.getItem('ep_db_default_choices_v1')\|\|'{}');}catch(e){return{};} }` |
| `savedCount` | arrow/function | `public/js/blocks/block-17.js` | 97 | `var savedCount=(type==='work'?verify.workDB:verify.matDB).length;` |
| `saveDel` | function | `public/js/blocks/block-10.js` | 42 | `function saveDel(type,set){` |
| `saveDeleted` | function | `public/js/blocks/block-09.js` | 48 | `function saveDeleted(type,set){` |
| `saveGlobalImport` | function | `public/js/blocks/block-17.js` | 82 | `async function saveGlobalImport(type,items,replace){` |
| `saveHist` | function | `public/js/blocks/block-02.js` | 1288 | `async function saveHist() {` |
| `saveLocalDb` | function | `public/js/blocks/block-08.js` | 56 | `function saveLocalDb(){` |
| `saveLogic` | function | `public/js/blocks/block-02.js` | 1165 | `function saveLogic() {` |
| `saveMyDb` | function | `public/js/blocks/block-09.js` | 59 | `async function saveMyDb(){` |
| `saveMyDb` | function | `public/js/blocks/block-10.js` | 66 | `async function saveMyDb(){` |
| `saveMyImport` | function | `public/js/blocks/block-17.js` | 101 | `async function saveMyImport(type,items,replace){` |
| `saveMyLocal` | function | `public/js/blocks/block-11.js` | 83 | `function saveMyLocal(type, arr){` |
| `saveMyRemote` | function | `public/js/blocks/block-12.js` | 132 | `async function saveMyRemote(){` |
| `saveMyRemote` | function | `public/js/blocks/block-14.js` | 115 | `async function saveMyRemote(){` |
| `saveMyRemote` | function | `public/js/blocks/block-15.js` | 65 | `async function saveMyRemote(onp){` |
| `saveMyRemote` | function | `public/js/blocks/block-16.js` | 77 | `async function saveMyRemote(onp){` |
| `saveQRs` | function | `public/js/blocks/block-02.js` | 261 | `function saveQRs() {` |
| `saveServerLocal` | function | `public/js/blocks/block-11.js` | 93 | `function saveServerLocal(type, arr, saveDirect){` |
| `saveServerRemote` | function | `public/js/blocks/block-12.js` | 148 | `async function saveServerRemote(){` |
| `saveServerRemote` | function | `public/js/blocks/block-14.js` | 131 | `async function saveServerRemote(){` |
| `saveServerRemote` | function | `public/js/blocks/block-15.js` | 76 | `async function saveServerRemote(onp){` |
| `saveServerRemote` | function | `public/js/blocks/block-16.js` | 96 | `async function saveServerRemote(onp){` |
| `saveVisibleEdits` | function | `public/js/blocks/block-14.js` | 272 | `function saveVisibleEdits(){` |
| `saveVisibleEdits` | function | `public/js/blocks/block-15.js` | 254 | `function saveVisibleEdits(){ var st=window.EP_DB_REVIEW_V6\|\|{}; var start=(st.page\|\|0)*PAGE_SIZE; var end=Math.min(start+PAGE_SIZE,(st.items\|\|[]).length);` |
| `saveVisibleEdits` | function | `public/js/blocks/block-16.js` | 243 | `function saveVisibleEdits(){` |
| `scope` | function | `public/js/blocks/block-11.js` | 41 | `function scope(){ return localStorage.getItem(LS_SCOPE) === 'global' ? 'global' : 'my'; }` |
| `scope` | function | `public/js/blocks/block-12.js` | 22 | `function scope(){ try{ return localStorage.getItem(LS_SCOPE) === 'global' ? 'global' : 'my'; }catch(e){ return 'my'; } }` |
| `scope` | function | `public/js/blocks/block-15.js` | 29 | `function scope(){ try{return localStorage.getItem(LS_SCOPE)==='global'?'global':'my';}catch(e){return 'my';} }` |
| `scope` | function | `public/js/blocks/block-16.js` | 30 | `function scope(){ try{return localStorage.getItem(LS_SCOPE)==='global'?'global':'my';}catch(e){return 'my';} }` |
| `scope` | function | `public/js/blocks/block-17.js` | 27 | `function scope(){ try{return localStorage.getItem(LS_SCOPE)==='global'?'global':'my';}catch(e){return 'my';} }` |
| `scope` | function | `public/js/blocks/block-19.js` | 21 | `function scope(){ try{ return localStorage.getItem('ep_db_scope_v2') === 'global' ? 'global' : 'my'; }catch(e){ return 'my'; } }` |
| `scope` | function | `public/js/blocks/block-25.js` | 25 | `function scope(){ try{ return localStorage.getItem(LS_SCOPE)==='global'?'global':'my'; }catch(e){ return 'my'; } }` |
| `scope` | function | `public/js/blocks/block-28.js` | 23 | `function scope(){ try{ return localStorage.getItem(LS_SCOPE)==='global'?'global':'my'; }catch(e){ return 'my'; } }` |
| `score` | function | `public/js/blocks/block-20.js` | 207 | `function score(current, cand){` |
| `searchWords` | arrow/function | `public/js/blocks/block-02.js` | 593 | `const searchWords = (words \|\| []).map(epNormText).filter(Boolean);` |
| `searchWords` | arrow/function | `public/js/blocks/block-06.js` | 122 | `const searchWords = (words \|\| []).concat([label, brand, nominal, kind]).filter(Boolean).map(norm).filter(Boolean);` |
| `selected` | function | `public/js/blocks/block-28.js` | 159 | `function selected(){ return Array.prototype.slice.call(document.querySelectorAll('#settModal .ep-v21-check:checked, #settModal .ep-v18-check:checked')); }` |
| `selectedChecks` | function | `public/js/blocks/block-25.js` | 197 | `function selectedChecks(type){ return Array.prototype.slice.call(document.querySelectorAll('#settModal .ep-v18-check:checked')).filter(function(ch){ return !typ` |
| `selectedCount` | function | `public/js/blocks/block-14.js` | 268 | `function selectedCount(){` |
| `sendProposal` | function | `public/js/blocks/block-15.js` | 87 | `async function sendProposal(type,items,reason,onp){` |
| `sendProposal` | function | `public/js/blocks/block-16.js` | 111 | `async function sendProposal(type,items,reason,onp){` |
| `sendServerProposal` | function | `public/js/blocks/block-17.js` | 110 | `async function sendServerProposal(type,items){` |
| `serverArr` | function | `public/js/blocks/block-11.js` | 64 | `function serverArr(type){ return type==='work' ? EP_SERVER_WORK : EP_SERVER_MAT; }` |
| `serverModalRow` | function | `public/js/blocks/block-11.js` | 616 | `function serverModalRow(type,it){` |
| `setActiveDb` | function | `public/js/blocks/block-11.js` | 101 | `function setActiveDb(type, arr){` |
| `setArrByType` | function | `public/js/blocks/block-07.js` | 42 | `function setArrByType(type, arr){` |
| `setArrLS` | function | `public/js/blocks/block-28.js` | 21 | `function setArrLS(k,a){ try{ if(typeof safeSet==='function') safeSet(k, JSON.stringify(a\|\|[])); else localStorage.setItem(k, JSON.stringify(a\|\|[])); }catch(` |
| `setDbArr` | function | `public/js/blocks/block-06.js` | 17 | `function setDbArr(type, arr){` |
| `setGroup` | function | `public/js/blocks/block-06.js` | 23 | `function setGroup(it,g){ it.g = it.g \|\| g; it.sc = it.sc \|\| g; }` |
| `setH` | function | `public/js/blocks/block-02.js` | 379 | `function setH(v, el) { st_h = v; if(el){ document.querySelectorAll('#h-tiles .tile').forEach(t=>t.classList.remove('active')); el.classList.add('active'); } }` |
| `setLocalArr` | function | `public/js/blocks/block-08.js` | 37 | `function setLocalArr(type, arr){` |
| `setLocalDb` | function | `public/js/blocks/block-09.js` | 37 | `function setLocalDb(type, arr){` |
| `setLocalDb` | function | `public/js/blocks/block-10.js` | 54 | `function setLocalDb(type, arr){` |
| `setLS` | function | `public/js/blocks/block-11.js` | 38 | `function setLS(k,a){ try{ if(typeof safeSet==='function') safeSet(k, JSON.stringify(a\|\|[])); else localStorage.setItem(k, JSON.stringify(a\|\|[])); }catch(e){` |
| `setLS` | function | `public/js/blocks/block-25.js` | 23 | `function setLS(k,v){ try{ if(typeof safeSet==='function') safeSet(k,JSON.stringify(v\|\|[])); else localStorage.setItem(k,JSON.stringify(v\|\|[])); }catch(e){ t` |
| `setMy` | function | `public/js/blocks/block-12.js` | 46 | `function setMy(type,arr){` |
| `setMy` | function | `public/js/blocks/block-14.js` | 83 | `function setMy(type,arr){` |
| `setMy` | function | `public/js/blocks/block-15.js` | 44 | `function setMy(type,arr){ arr=unique(arr,type); if(type==='work') window.EP_MY_WORK=arr; else window.EP_MY_MAT=arr; writeArr(type==='work'?LS_MY_WORK:LS_MY_MAT,` |
| `setMy` | function | `public/js/blocks/block-16.js` | 51 | `function setMy(type,arr){ arr=unique(arr,type); if(type==='work') window.EP_MY_WORK=arr; else window.EP_MY_MAT=arr; writeArr(type==='work'?LS_MY_WORK:LS_MY_MAT,` |
| `setMy` | function | `public/js/blocks/block-17.js` | 43 | `function setMy(type,arr){ arr=unique(arr,type); if(type==='work') window.EP_MY_WORK=arr; else window.EP_MY_MAT=arr; writeArr(type==='work'?LS_MY_WORK:LS_MY_MAT,` |
| `setMyArrays` | function | `public/js/blocks/block-13.js` | 53 | `function setMyArrays(mat,work){` |
| `setObjLS` | function | `public/js/blocks/block-11.js` | 39 | `function setObjLS(k,o){ try{ localStorage.setItem(k, JSON.stringify(o\|\|{})); }catch(e){} }` |
| `setObjLS` | function | `public/js/blocks/block-25.js` | 24 | `function setObjLS(k,o){ try{ localStorage.setItem(k,JSON.stringify(o\|\|{})); }catch(e){} }` |
| `setObjLS` | function | `public/js/blocks/block-28.js` | 22 | `function setObjLS(k,o){ try{ localStorage.setItem(k, JSON.stringify(o\|\|{})); }catch(e){} }` |
| `setP` | function | `public/js/blocks/block-02.js` | 380 | `function setP(v) { st_p = v; document.querySelectorAll('#p-tiles .tile').forEach((t,i) => { if(i===v-1) t.classList.add('active'); else t.classList.remove('acti` |
| `setPodr` | function | `public/js/blocks/block-02.js` | 378 | `function setPodr(v, el) { st_podr = v; document.querySelectorAll('#podr-tiles .tile').forEach(t=>t.classList.remove('active')); el.classList.add('active'); }` |
| `setScope` | function | `public/js/blocks/block-12.js` | 23 | `function setScope(s){ try{ localStorage.setItem(LS_SCOPE, s === 'global' ? 'global' : 'my'); }catch(e){} }` |
| `setScope` | function | `public/js/blocks/block-13.js` | 23 | `function setScope(s){ try{ localStorage.setItem(LS_SCOPE, s === 'global' ? 'global' : 'my'); }catch(e){} }` |
| `setScope` | function | `public/js/blocks/block-14.js` | 25 | `function setScope(s){ try{ localStorage.setItem(LS_SCOPE, s === 'global' ? 'global' : 'my'); }catch(e){} }` |
| `setScope` | function | `public/js/blocks/block-15.js` | 30 | `function setScope(s){ try{localStorage.setItem(LS_SCOPE, s==='global'?'global':'my');}catch(e){} }` |
| `setScope` | function | `public/js/blocks/block-16.js` | 31 | `function setScope(s){ try{localStorage.setItem(LS_SCOPE,s==='global'?'global':'my');}catch(e){} }` |
| `setScope` | function | `public/js/blocks/block-17.js` | 28 | `function setScope(s){ try{ localStorage.setItem(LS_SCOPE, s==='global'?'global':'my'); }catch(e){} }` |
| `setScope` | function | `public/js/blocks/block-19.js` | 60 | `function setScope(s){` |
| `setServer` | function | `public/js/blocks/block-12.js` | 54 | `function setServer(type,arr){` |
| `setServer` | function | `public/js/blocks/block-14.js` | 91 | `function setServer(type,arr){` |
| `setServer` | function | `public/js/blocks/block-15.js` | 45 | `function setServer(type,arr){ arr=unique(arr,type); if(type==='work') window.EP_GLOBAL_WORK=arr; else window.EP_GLOBAL_MAT=arr; var mat=type==='mat'?arr:getServ` |
| `setServer` | function | `public/js/blocks/block-16.js` | 52 | `function setServer(type,arr){ arr=unique(arr,type); if(type==='work') window.EP_GLOBAL_WORK=arr; else window.EP_GLOBAL_MAT=arr; var mat=type==='mat'?arr:getServ` |
| `setServer` | function | `public/js/blocks/block-17.js` | 42 | `function setServer(type,arr){ arr=unique(arr,type); if(type==='work') window.EP_GLOBAL_WORK=arr; else window.EP_GLOBAL_MAT=arr; var mat=type==='mat'?arr:getServ` |
| `setServerArrays` | function | `public/js/blocks/block-13.js` | 63 | `function setServerArrays(mat,work){` |
| `setStatus` | function | `public/js/blocks/block-28.js` | 55 | `function setStatus(state,msg){` |
| `shieldRowsForDetails` | function | `public/js/blocks/block-07.js` | 396 | `function shieldRowsForDetails(){` |
| `showDetailsV16` | function | `public/js/blocks/block-23.js` | 162 | `function showDetailsV16(customTitle){` |
| `showLoader` | function | `public/js/blocks/block-02.js` | 153 | `function showLoader(text, icon = '☁️') { document.getElementById('loader-icon').innerText = icon; document.getElementById('loader-text').innerText = text; docum` |
| `showPreview` | function | `public/js/blocks/block-02.js` | 993 | `function showPreview(mode, isActOverride = false, customTitle = null) {` |
| `showPreview` | window | `public/js/blocks/block-07.js` | 438 | `window.showPreview = function(mode, isActOverride, customTitle){` |
| `showPreview` | window | `public/js/blocks/block-23.js` | 179 | `window.showPreview=function(mode,isActOverride,customTitle){` |
| `showPreview` | window | `public/js/blocks/block-24.js` | 96 | `window.showPreview=function(mode){ if(mode==='details') return window.epV17ShowDetails(); return oldShow?oldShow.apply(this,arguments):undefined; };` |
| `showPreview` | window | `public/js/blocks/block-25.js` | 195 | `var prevPreview=window.showPreview; window.showPreview=function(mode){ if(mode==='details') return window.epV18ShowDetails(); return prevPreview?prevPreview.app` |
| `showPreview` | window | `public/js/blocks/block-26.js` | 142 | `window.showPreview=function(mode){ if(mode==='details') return window.epV19ShowDetails(); return oldShowPreview?oldShowPreview.apply(this,arguments):undefined; ` |
| `showPreview` | window | `public/js/blocks/block-27.js` | 158 | `window.showPreview=function(mode){ if(mode==='details') return window.epV20ShowDetails(); return oldShowPreview?oldShowPreview.apply(this,arguments):undefined; ` |
| `showProgress` | function | `public/js/blocks/block-15.js` | 62 | `function showProgress(title,pct,txt){ ensureProgress(); var p=$('ep-v7-progress'), f=$('ep-v7-progress-fill'), t=$('ep-v7-progress-title'), x=$('ep-v7-progress-` |
| `showProgress` | function | `public/js/blocks/block-16.js` | 63 | `function showProgress(title,pct,txt){ ensureProgress(); var p=$('ep-v7-progress'),f=$('ep-v7-progress-fill'),t=$('ep-v7-progress-title'),x=$('ep-v7-progress-txt` |
| `showReadLoader` | function | `public/js/blocks/block-14.js` | 31 | `function showReadLoader(text, icon){ try{ if(typeof showLoader === 'function') showLoader(text \|\| 'Читаю файл...', icon \|\| '📥'); }catch(e){} }` |
| `showReview` | function | `public/js/blocks/block-14.js` | 342 | `function showReview(items,type,source){` |
| `showReview` | function | `public/js/blocks/block-15.js` | 245 | `function showReview(items,type,source,target){ items=unique((items\|\|[]).filter(Boolean),type); var selected={}; items.forEach(function(_,i){selected[i]=true;}` |
| `showReview` | function | `public/js/blocks/block-18.js` | 138 | `function showReview(items,type,source,target,raw){` |
| `showReviewV9` | function | `public/js/blocks/block-17.js` | 167 | `function showReviewV9(items,type,source,target){` |
| `showToast` | function | `public/js/blocks/block-02.js` | 155 | `function showToast(msg) { let t = document.getElementById('toast'); t.innerText = msg; t.classList.add('show'); setTimeout(() => t.classList.remove('show'), 300` |
| `sid` | arrow/function | `public/js/blocks/block-04.js` | 102 | `const sid = (opts.prefix \|\| 'ep_sub') + '_' + epId(type + '_' + idx++);` |
| `sig` | function | `public/js/blocks/block-10.js` | 34 | `function sig(type,it){` |
| `sig` | function | `public/js/blocks/block-11.js` | 46 | `function sig(type,it){ return type + '\|' + cleanText([it && it.c, groupOf(it), it && it.n, it && it.u].filter(Boolean).join('\|')); }` |
| `sig` | function | `public/js/blocks/block-12.js` | 31 | `function sig(type,it){ return type + '\|' + clean([it && it.c, groupOf(it), it && it.n, it && it.u].filter(Boolean).join('\|')); }` |
| `sig` | function | `public/js/blocks/block-13.js` | 33 | `function sig(type,it){ return type + '\|' + clean([it && it.c, groupOf(it), it && it.n, it && it.u].filter(Boolean).join('\|')); }` |
| `sig` | function | `public/js/blocks/block-14.js` | 42 | `function sig(type,it){ return type + '\|' + norm([it && it.c, groupOf(it), it && it.n, it && it.u].filter(Boolean).join('\|')); }` |
| `sig` | function | `public/js/blocks/block-15.js` | 39 | `function sig(type,it){ return type+'\|'+norm([it&&it.c,groupOf(it),it&&it.n,it&&it.u].filter(Boolean).join('\|')); }` |
| `sig` | function | `public/js/blocks/block-16.js` | 28 | `function sig(type,it){ return type+'\|'+norm([it&&it.c,groupOf(it),it&&it.n,it&&it.u].filter(Boolean).join('\|')); }` |
| `sig` | function | `public/js/blocks/block-17.js` | 38 | `function sig(type,it){ return type+'\|'+norm([it&&it.c,groupOf(it),it&&it.n,it&&it.u].filter(Boolean).join('\|')); }` |
| `sigKey` | function | `public/js/blocks/block-08.js` | 47 | `function sigKey(type, it){` |
| `sigKey` | function | `public/js/blocks/block-09.js` | 41 | `function sigKey(type,it){` |
| `smartFindMat` | function | `public/js/blocks/block-06.js` | 112 | `function smartFindMat(label, words, meta){` |
| `sourceSwitcherHtml` | function | `public/js/blocks/block-11.js` | 213 | `function sourceSwitcherHtml(type){` |
| `src` | arrow/function | `public/js/blocks/block-08.js` | 195 | `var src = (type === 'work' ? (cache.workDB \|\| []) : (cache.matDB \|\| []));` |
| `src` | arrow/function | `public/js/blocks/block-11.js` | 442 | `var src=(window.EP_DB_REVIEW && window.EP_DB_REVIEW.items) \|\| [];` |
| `start` | arrow/function | `public/js/blocks/block-14.js` | 274 | `var start = (st.page \|\| 0) * PAGE_SIZE;` |
| `start` | arrow/function | `public/js/blocks/block-15.js` | 254 | `function saveVisibleEdits(){ var st=window.EP_DB_REVIEW_V6\|\|{}; var start=(st.page\|\|0)*PAGE_SIZE; var end=Math.min(start+PAGE_SIZE,(st.items\|\|[]).length);` |
| `start` | arrow/function | `public/js/blocks/block-16.js` | 244 | `var st=window.EP_DB_REVIEW_V6\|\|{}; var start=(st.page\|\|0)*PAGE_SIZE; var end=Math.min(start+PAGE_SIZE,(st.items\|\|[]).length);` |
| `start` | arrow/function | `public/js/blocks/block-17.js` | 65 | `var start=(st.page\|\|0)*PAGE_SIZE, end=Math.min(start+PAGE_SIZE,(st.items\|\|[]).length);` |
| `strictFindMaterial` | function | `public/js/blocks/block-07.js` | 229 | `function strictFindMaterial(label, meta){` |
| `stripCode` | function | `public/js/blocks/block-18.js` | 84 | `function stripCode(t){ return String(t\|\|'').replace(/```json/gi,'').replace(/```[a-z]*/gi,'').replace(/```/g,'').trim(); }` |
| `stripRuntime` | function | `public/js/blocks/block-10.js` | 57 | `function stripRuntime(it){` |
| `sub` | arrow/function | `public/js/blocks/block-11.js` | 250 | `var sub=(groupOf(it)?groupOf(it)+' • ':'')+(Number(it.p)\|\|0)+' ₽ / '+(it.u\|\|'шт');` |
| `sub` | arrow/function | `public/js/blocks/block-11.js` | 320 | `var sub=(groupOf(it)?groupOf(it)+' • ':'')+(Number(it.p)\|\|0)+' ₽ / '+(it.u\|\|'шт');` |
| `sub` | arrow/function | `public/js/blocks/block-11.js` | 618 | `var sub=(groupOf(it)?groupOf(it)+' • ':'')+(Number(it.p)\|\|0)+' ₽ / '+(it.u\|\|'шт');` |
| `sub` | arrow/function | `public/js/blocks/block-15.js` | 171 | `var sub=(groupOf(it)?groupOf(it)+' • ':'')+(Number(it.p)\|\|0)+' ₽ / '+(it.u\|\|'шт');` |
| `swapLabel` | function | `public/js/blocks/block-08.js` | 301 | `function swapLabel(it){` |
| `swapLabel` | function | `public/js/blocks/block-20.js` | 218 | `function swapLabel(it){ return (it.__src==='global'?'🌍 ':'👤 ') + (it.n\|\|'Позиция') + ' — ' + (money(it.p)\|\|0) + ' ₽ / ' + (it.u\|\|'шт'); }` |
| `swapTargetIdx` | window | `public/js/blocks/block-20.js` | 222 | `try{ swapTargetIdx=idx; }catch(e){ window.swapTargetIdx=idx; }` |
| `switchDbTab` | function | `public/js/blocks/block-02.js` | 1366 | `function switchDbTab(tab) {` |
| `syncActiveArrays` | function | `public/js/blocks/block-13.js` | 73 | `function syncActiveArrays(){` |
| `syncActiveToMain` | function | `public/js/blocks/block-25.js` | 45 | `function syncActiveToMain(src){` |
| `syncDraft` | function | `public/js/blocks/block-02.js` | 316 | `async function syncDraft() { try { safeSet('est_v31', JSON.stringify(currentEstimate)); if(db && appUser && appUser.uid) await db.collection('drafts').doc(appUs` |
| `syncMain` | function | `public/js/blocks/block-15.js` | 46 | `function syncMain(target){ try{ var use=target\|\|scope(); window.matDB=(use==='global'?getServer('mat'):getMy('mat')); window.workDB=(use==='global'?getServer(` |
| `syncMain` | function | `public/js/blocks/block-16.js` | 53 | `function syncMain(target){ try{ var use=target\|\|scope(); window.matDB=(use==='global'?getServer('mat'):getMy('mat')); window.workDB=(use==='global'?getServer(` |
| `syncMain` | function | `public/js/blocks/block-17.js` | 44 | `function syncMain(target){ try{ var use=target\|\|scope(); window.matDB=(use==='global'?getServer('mat'):getMy('mat')); window.workDB=(use==='global'?getServer(` |
| `syncMain` | function | `public/js/blocks/block-28.js` | 52 | `function syncMain(src){` |
| `syncMainArrays` | function | `public/js/blocks/block-12.js` | 67 | `function syncMainArrays(target){` |
| `syncMainArrays` | function | `public/js/blocks/block-14.js` | 70 | `function syncMainArrays(target){` |
| `syncWindowCaches` | function | `public/js/blocks/block-11.js` | 67 | `function syncWindowCaches(){` |
| `tagSrc` | function | `public/js/blocks/block-20.js` | 139 | `function tagSrc(it,src){ var x=clone(it); x.__src=src; return fixShieldWorkItem(x, x.n); }` |
| `targetArr` | arrow/function | `public/js/blocks/block-17.js` | 87 | `var targetArr=(type==='work'?current.workDB:current.matDB).slice();` |
| `text` | arrow/function | `public/js/blocks/block-14.js` | 426 | `var text = (($('ep-text-import-value') \|\| {}).value) \|\| '';` |
| `text` | arrow/function | `public/js/blocks/block-15.js` | 253 | `window.epRunTextImport=async function(){ var text=(($('ep-text-import-value')\|\|{}).value)\|\|''; var type=((window.EP_DB_REVIEW\|\|{}).type==='work')?'work':'` |
| `text` | function | `public/js/blocks/block-27.js` | 12 | `function text(v){ return String(v==null?'':v); }` |
| `timeoutPromise` | function | `public/js/blocks/block-19.js` | 270 | `function timeoutPromise(ms, label){` |
| `toast` | function | `public/js/blocks/block-06.js` | 11 | `function toast(t){ if(typeof showToast==='function') showToast(t); else console.log(t); }` |
| `toast` | function | `public/js/blocks/block-08.js` | 10 | `function toast(msg){ if(typeof showToast === 'function') showToast(msg); else alert(msg); }` |
| `toast` | function | `public/js/blocks/block-10.js` | 10 | `function toast(t){ if(typeof showToast === 'function') showToast(t); else alert(t); }` |
| `toast` | function | `public/js/blocks/block-11.js` | 32 | `function toast(t){ if(typeof showToast === 'function') showToast(t); else alert(t); }` |
| `toast` | function | `public/js/blocks/block-13.js` | 20 | `function toast(t){ if(typeof showToast === 'function') showToast(t); else console.log(t); }` |
| `toast` | function | `public/js/blocks/block-14.js` | 22 | `function toast(t){ try{ if(typeof showToast === 'function') showToast(t); else console.log(t); }catch(e){ console.log(t); } }` |
| `toast` | function | `public/js/blocks/block-15.js` | 22 | `function toast(t){ try{ if(typeof showToast==='function') showToast(t); else console.log(t); }catch(e){ console.log(t); } }` |
| `toast` | function | `public/js/blocks/block-16.js` | 22 | `function toast(t){ try{ if(typeof showToast==='function') showToast(String(t)); else console.log(t); }catch(e){ console.log(t); } }` |
| `toast` | function | `public/js/blocks/block-17.js` | 22 | `function toast(t){ try{ if(typeof showToast==='function') showToast(t); else alert(t); }catch(e){ console.log(t); } }` |
| `toast` | function | `public/js/blocks/block-18.js` | 15 | `function toast(t){ try{ if(typeof showToast==='function') showToast(t); else alert(t); }catch(e){ console.log(t); } }` |
| `toast` | function | `public/js/blocks/block-19.js` | 20 | `function toast(t){ try{ if(typeof showToast==='function') showToast(t); else alert(t); }catch(e){ console.log(t); } }` |
| `toast` | function | `public/js/blocks/block-20.js` | 17 | `function toast(t){ try{ if(typeof showToast==='function') showToast(t); else console.log(t); }catch(e){ console.log(t); } }` |
| `toast` | function | `public/js/blocks/block-24.js` | 15 | `function toast(s){ try{ if(typeof showToast==='function') showToast(s); else console.log(s); }catch(e){ console.log(s); } }` |
| `toast` | function | `public/js/blocks/block-25.js` | 20 | `function toast(t){ try{ if(typeof showToast==='function') showToast(t); else console.log(t); }catch(e){ console.log(t); } }` |
| `toast` | function | `public/js/blocks/block-26.js` | 11 | `function toast(msg){ try{ if(typeof showToast==='function') showToast(msg); else console.log(msg); }catch(e){ console.log(msg); } }` |
| `toast` | function | `public/js/blocks/block-27.js` | 15 | `function toast(msg){ try{ if(typeof showToast==='function') showToast(msg); else console.log(msg); }catch(e){ console.log(msg); } }` |
| `toast` | function | `public/js/blocks/block-28.js` | 18 | `function toast(t){ try{ if(typeof showToast==='function') showToast(t); else console.log(t); }catch(e){ console.log(t); } }` |
| `toggleCat` | function | `public/js/blocks/block-02.js` | 341 | `function toggleCat(id) { let el = document.getElementById(id); el.classList.toggle('active'); }` |
| `toggleMenu` | function | `public/js/blocks/block-02.js` | 245 | `function toggleMenu() { document.getElementById('burger-menu').classList.toggle('open'); document.getElementById('burger-overlay').classList.toggle('open'); }` |
| `togglePay` | function | `public/js/blocks/block-02.js` | 1138 | `function togglePay(field) {` |
| `toNum` | function | `public/js/blocks/block-05.js` | 14 | `function toNum(v, def){ var n=Number(v); return Number.isFinite(n) ? n : (def \|\| 0); }` |
| `toolbar` | function | `public/js/blocks/block-09.js` | 272 | `function toolbar(type){` |
| `totalConn` | arrow/function | `public/js/blocks/block-02.js` | 484 | `let totalConn = (socJbs * mConnSoc) + (swJbs * mConnSw) + (passJbs * mConnPass);` |
| `tuneStaticBlocks` | function | `public/js/blocks/block-15.js` | 139 | `function tuneStaticBlocks(){` |
| `txt` | function | `public/js/blocks/block-19.js` | 19 | `function txt(el){ return String((el && (el.textContent \|\| el.innerText)) \|\| '').replace(/\s+/g,' ').trim(); }` |
| `txt` | function | `public/js/blocks/block-24.js` | 11 | `function txt(v){ return String(v==null?'':v); }` |
| `typ` | arrow/function | `public/js/blocks/block-06.js` | 158 | `if(/диф/i.test(n)){ const leak=(n.match(/(10\|30\|100\|300)\s*мА/i)\|\|[])[1]; const typ=(n.match(/тип\s*([A-Za-zА-Яа-я]+)/i)\|\|[])[1]; return ('ДИФ '+(leak?le` |
| `typ` | arrow/function | `public/js/blocks/block-06.js` | 159 | `if(/узо/i.test(n)){ const leak=(n.match(/(10\|30\|100\|300)\s*мА/i)\|\|[])[1]; const typ=(n.match(/тип\s*([A-Za-zА-Яа-я]+)/i)\|\|[])[1]; return ('УЗО '+(leak?le` |
| `type` | arrow/function | `public/js/blocks/block-10.js` | 442 | `var type = (window.EP_DB_REVIEW && window.EP_DB_REVIEW.type) \|\| 'mat';` |
| `type` | arrow/function | `public/js/blocks/block-11.js` | 410 | `var type = ($('editor-work-list') && $('editor-work-list').style.display !== 'none') ? 'work' : 'mat';` |
| `type` | arrow/function | `public/js/blocks/block-11.js` | 443 | `var type=(window.EP_DB_REVIEW && window.EP_DB_REVIEW.type) \|\| 'mat';` |
| `type` | arrow/function | `public/js/blocks/block-11.js` | 463 | `var type=(window.EP_DB_REVIEW && window.EP_DB_REVIEW.type) \|\| 'mat';` |
| `type` | arrow/function | `public/js/blocks/block-14.js` | 427 | `var type = ((window.EP_DB_REVIEW \|\| {}).type === 'work') ? 'work' : 'mat';` |
| `type` | arrow/function | `public/js/blocks/block-15.js` | 253 | `window.epRunTextImport=async function(){ var text=(($('ep-text-import-value')\|\|{}).value)\|\|''; var type=((window.EP_DB_REVIEW\|\|{}).type==='work')?'work':'` |
| `u` | arrow/function | `public/js/blocks/block-17.js` | 31 | `function currentUserLabel(){ try{ var u=(firebase.auth&&firebase.auth().currentUser)\|\|null; return (u&&(u.email\|\|u.uid)) \|\| (window.appUser&&(appUser.emai` |
| `uid` | function | `public/js/blocks/block-11.js` | 43 | `function uid(){ try{ return appUser && appUser.uid ? appUser.uid : ''; }catch(e){ return ''; } }` |
| `uid` | function | `public/js/blocks/block-12.js` | 21 | `function uid(){ try{ return (window.appUser && appUser.uid) \|\| ''; }catch(e){ return ''; } }` |
| `uid` | function | `public/js/blocks/block-13.js` | 21 | `function uid(){ try{ return (window.appUser && appUser.uid) \|\| ''; }catch(e){ return ''; } }` |
| `uid` | function | `public/js/blocks/block-14.js` | 23 | `function uid(){ try{ return (window.appUser && appUser.uid) \|\| ''; }catch(e){ return ''; } }` |
| `uid` | function | `public/js/blocks/block-15.js` | 27 | `function uid(){ try{return (window.appUser&&appUser.uid)\|\|'';}catch(e){return '';} }` |
| `uid` | function | `public/js/blocks/block-16.js` | 33 | `function uid(){ try{ return (window.appUser&&appUser.uid) \|\| (fbUser()&&fbUser().uid) \|\| ''; }catch(e){ return ''; } }` |
| `uid` | function | `public/js/blocks/block-17.js` | 30 | `function uid(){ try{ return (window.appUser && window.appUser.uid) \|\| (firebase.auth && firebase.auth().currentUser && firebase.auth().currentUser.uid) \|\| '` |
| `uid` | function | `public/js/blocks/block-25.js` | 27 | `function uid(){ try{ return (window.appUser && appUser.uid) \|\| ''; }catch(e){ return ''; } }` |
| `uid` | function | `public/js/blocks/block-28.js` | 25 | `function uid(){ try{ return (window.appUser && window.appUser.uid) \|\| ''; }catch(e){ return ''; } }` |
| `unhide` | function | `public/js/blocks/block-10.js` | 241 | `function unhide(type,it){` |
| `uniq` | function | `public/js/blocks/block-05.js` | 11 | `function uniq(arr){ return Array.from(new Set(arr.filter(Boolean))); }` |
| `uniq` | function | `public/js/blocks/block-28.js` | 29 | `function uniq(arr,type){` |
| `unique` | function | `public/js/blocks/block-11.js` | 50 | `function unique(arr,type){` |
| `unique` | function | `public/js/blocks/block-12.js` | 81 | `function unique(arr,type){` |
| `unique` | function | `public/js/blocks/block-13.js` | 34 | `function unique(arr,type){` |
| `unique` | function | `public/js/blocks/block-14.js` | 43 | `function unique(arr,type){` |
| `unique` | function | `public/js/blocks/block-15.js` | 40 | `function unique(arr,type){ var seen={},out=[]; (arr\|\|[]).forEach(function(raw){ var it=clone(raw); if(!it.n)return; if(!it.id) it.id=(type==='work'?'w':'m')+'` |
| `unique` | function | `public/js/blocks/block-16.js` | 48 | `function unique(arr,type){ var seen={},out=[]; (arr\|\|[]).forEach(function(raw){ var it=clone(raw); if(!clean(it.n))return; if(it.sc&&!it.g)it.g=it.sc; if(it.g` |
| `unique` | function | `public/js/blocks/block-17.js` | 39 | `function unique(arr,type){ var seen={},out=[]; (arr\|\|[]).forEach(function(raw){ var it=clone(raw); if(!clean(it.n))return; if(it.sc&&!it.g)it.g=it.sc; if(it.g` |
| `unique` | function | `public/js/blocks/block-18.js` | 137 | `function unique(items,type){ var seen={}; return (items\|\|[]).filter(function(it){ var k=[it.n,it.c,it.sc,it.u,Number(it.p)\|\|0].join('\|').toLowerCase(); if(` |
| `unique` | function | `public/js/blocks/block-25.js` | 42 | `function unique(arr,type){` |
| `updateBuhUI` | function | `public/js/blocks/block-02.js` | 1279 | `function updateBuhUI() {` |
| `updateButtons` | function | `public/js/blocks/block-13.js` | 124 | `function updateButtons(){` |
| `updateCoeffs` | function | `public/js/blocks/block-02.js` | 249 | `function updateCoeffs() {` |
| `updateHistList` | function | `public/js/blocks/block-02.js` | 1296 | `function updateHistList() {` |
| `updateMasterBadge` | function | `public/js/blocks/block-02.js` | 247 | `function updateMasterBadge() { document.getElementById('master-badge').innerHTML = `${appUser?.name \|\| "Мастер"}<br>Объект: ${cust.name \|\| 'Не выбран'}`; }` |
| `updatePayPrepay` | function | `public/js/blocks/block-02.js` | 1147 | `function updatePayPrepay(val) {` |
| `updateRecalcUI` | function | `public/js/blocks/block-02.js` | 1215 | `function updateRecalcUI() {` |
| `upsert` | function | `public/js/blocks/block-11.js` | 106 | `function upsert(arr,type,it){` |
| `upsert` | function | `public/js/blocks/block-12.js` | 96 | `function upsert(arr,type,it,mode){` |
| `upsert` | function | `public/js/blocks/block-14.js` | 104 | `function upsert(arr,type,it,mode){` |
| `upsert` | function | `public/js/blocks/block-15.js` | 47 | `function upsert(arr,type,it,replace){ it=clone(it); if(!it.id) it.id=(type==='work'?'w':'m')+'_v7_'+Date.now()+'_'+Math.random().toString(36).slice(2,7); if(it.` |
| `upsert` | function | `public/js/blocks/block-16.js` | 55 | `function upsert(arr,type,it,replace){ it=clone(it); if(!it.id)it.id=(type==='work'?'w':'m')+'_v8_'+Date.now()+'_'+Math.random().toString(36).slice(2,8); if(it.s` |
| `upsert` | function | `public/js/blocks/block-17.js` | 45 | `function upsert(arr,type,it,replace){ arr=Array.isArray(arr)?arr.slice():[]; it=clone(it); if(!it.id)it.id=(type==='work'?'w':'m')+'_imp_v9_'+Date.now()+'_'+Mat` |
| `upsertLocal` | function | `public/js/blocks/block-10.js` | 222 | `function upsertLocal(type,it){` |
| `upUI` | function | `public/js/blocks/block-02.js` | 391 | `function upUI() {` |
| `userMatDB` | window | `public/js/blocks/block-05.js` | 101 | `try { window.userMatDB = fixArr(window.userMatDB \|\| []); } catch(e){}` |
| `userMatDB` | window | `public/js/blocks/block-11.js` | 76 | `window.userMatDB = EP_MY_MAT;` |
| `userMatDB` | window | `public/js/blocks/block-12.js` | 51 | `try{ window.userMatDB = getMy('mat'); window.userWorkDB = getMy('work'); }catch(e){}` |
| `userMatDB` | window | `public/js/blocks/block-13.js` | 58 | `window.userMatDB = mat;` |
| `userMatDB` | window | `public/js/blocks/block-14.js` | 88 | `try{ window.userMatDB = getMy('mat'); window.userWorkDB = getMy('work'); }catch(e){}` |
| `userMatDB` | window | `public/js/blocks/block-15.js` | 44 | `function setMy(type,arr){ arr=unique(arr,type); if(type==='work') window.EP_MY_WORK=arr; else window.EP_MY_MAT=arr; writeArr(type==='work'?LS_MY_WORK:LS_MY_MAT,` |
| `userMatDB` | window | `public/js/blocks/block-16.js` | 51 | `function setMy(type,arr){ arr=unique(arr,type); if(type==='work') window.EP_MY_WORK=arr; else window.EP_MY_MAT=arr; writeArr(type==='work'?LS_MY_WORK:LS_MY_MAT,` |
| `userMatDB` | window | `public/js/blocks/block-17.js` | 43 | `function setMy(type,arr){ arr=unique(arr,type); if(type==='work') window.EP_MY_WORK=arr; else window.EP_MY_MAT=arr; writeArr(type==='work'?LS_MY_WORK:LS_MY_MAT,` |
| `userMatDB` | window | `public/js/blocks/block-25.js` | 71 | `try{ window.userMatDB=getArr('mat','my'); window.userWorkDB=getArr('work','my'); localStorage.setItem('ep_master_db_created_v1','1'); }catch(e){}` |
| `userMatDB` | window | `public/js/blocks/block-28.js` | 80 | `try{ window.userMatDB=getArr('mat','my'); window.userWorkDB=getArr('work','my'); localStorage.setItem('ep_master_db_created_v1','1'); }catch(e){}` |
| `userWorkDB` | window | `public/js/blocks/block-11.js` | 77 | `window.userWorkDB = EP_MY_WORK;` |
| `userWorkDB` | window | `public/js/blocks/block-12.js` | 51 | `try{ window.userMatDB = getMy('mat'); window.userWorkDB = getMy('work'); }catch(e){}` |
| `userWorkDB` | window | `public/js/blocks/block-13.js` | 59 | `window.userWorkDB = work;` |
| `userWorkDB` | window | `public/js/blocks/block-14.js` | 88 | `try{ window.userMatDB = getMy('mat'); window.userWorkDB = getMy('work'); }catch(e){}` |
| `userWorkDB` | window | `public/js/blocks/block-15.js` | 44 | `function setMy(type,arr){ arr=unique(arr,type); if(type==='work') window.EP_MY_WORK=arr; else window.EP_MY_MAT=arr; writeArr(type==='work'?LS_MY_WORK:LS_MY_MAT,` |
| `userWorkDB` | window | `public/js/blocks/block-16.js` | 51 | `function setMy(type,arr){ arr=unique(arr,type); if(type==='work') window.EP_MY_WORK=arr; else window.EP_MY_MAT=arr; writeArr(type==='work'?LS_MY_WORK:LS_MY_MAT,` |
| `userWorkDB` | window | `public/js/blocks/block-17.js` | 43 | `function setMy(type,arr){ arr=unique(arr,type); if(type==='work') window.EP_MY_WORK=arr; else window.EP_MY_MAT=arr; writeArr(type==='work'?LS_MY_WORK:LS_MY_MAT,` |
| `userWorkDB` | window | `public/js/blocks/block-25.js` | 71 | `try{ window.userMatDB=getArr('mat','my'); window.userWorkDB=getArr('work','my'); localStorage.setItem('ep_master_db_created_v1','1'); }catch(e){}` |
| `userWorkDB` | window | `public/js/blocks/block-28.js` | 80 | `try{ window.userMatDB=getArr('mat','my'); window.userWorkDB=getArr('work','my'); localStorage.setItem('ep_master_db_created_v1','1'); }catch(e){}` |
| `val` | function | `public/js/blocks/block-22.js` | 39 | `var lines=[]; function val(id){ var e=$(id); return e?e.value:''; } function chk(id){ var e=$(id); return !!(e&&e.checked); }` |
| `val` | function | `public/js/blocks/block-25.js` | 116 | `function val(id,def){ var e=$(id); return e ? (e.value \|\| def \|\| '') : (def \|\| ''); }` |
| `val` | function | `public/js/blocks/block-26.js` | 14 | `function val(id,def){ var e=$(id); return e ? (e.value \|\| def \|\| '') : (def \|\| ''); }` |
| `val` | function | `public/js/blocks/block-27.js` | 17 | `function val(id,def){ var e=$(id); return e ? (e.value \|\| def \|\| '') : (def \|\| ''); }` |
| `visibleHost` | function | `public/js/blocks/block-28.js` | 93 | `function visibleHost(){ return $('editor-mat-list') \|\| $('editor-work-list'); }` |
| `wallFromName` | function | `public/js/blocks/block-20.js` | 24 | `function wallFromName(s){ var n=norm(s); if(/кирпич/.test(n)) return 'Кирпич'; if(/панел/.test(n)) return 'Панелька'; if(/мягк\|гкл\|гипс/.test(n)) return 'Мягк` |
| `work` | function | `public/js/blocks/block-02.js` | 837 | `function work(label, q, price, words, meta, assignment) {` |
| `work` | function | `public/js/blocks/block-23.js` | 79 | `function work(label, q, price, words, meta, assignment) {` |
| `workDB` | window | `public/js/blocks/block-06.js` | 18 | `try { if(type === 'mat') matDB = arr; else workDB = arr; } catch(e) { if(type === 'mat') window.matDB = arr; else window.workDB = arr; }` |
| `workDB` | window | `public/js/blocks/block-12.js` | 72 | `window.workDB = getServer('work');` |
| `workDB` | window | `public/js/blocks/block-12.js` | 76 | `window.workDB = getMy('work');` |
| `workDB` | window | `public/js/blocks/block-13.js` | 79 | `window.workDB = sw.slice();` |
| `workDB` | window | `public/js/blocks/block-13.js` | 85 | `window.workDB = mw.slice();` |
| `workDB` | window | `public/js/blocks/block-14.js` | 75 | `window.workDB = getServer('work');` |
| `workDB` | window | `public/js/blocks/block-14.js` | 78 | `window.workDB = getMy('work');` |
| `workDB` | window | `public/js/blocks/block-15.js` | 46 | `function syncMain(target){ try{ var use=target\|\|scope(); window.matDB=(use==='global'?getServer('mat'):getMy('mat')); window.workDB=(use==='global'?getServer(` |
| `workDB` | window | `public/js/blocks/block-16.js` | 53 | `function syncMain(target){ try{ var use=target\|\|scope(); window.matDB=(use==='global'?getServer('mat'):getMy('mat')); window.workDB=(use==='global'?getServer(` |
| `workDB` | window | `public/js/blocks/block-17.js` | 44 | `function syncMain(target){ try{ var use=target\|\|scope(); window.matDB=(use==='global'?getServer('mat'):getMy('mat')); window.workDB=(use==='global'?getServer(` |
| `workDB` | window | `public/js/blocks/block-25.js` | 49 | `window.workDB = getArr('work',src);` |
| `workDB` | window | `public/js/blocks/block-28.js` | 53 | `try{ window.matDB=getArr('mat',src); window.workDB=getArr('work',src); try{ matDB=window.matDB; workDB=window.workDB; }catch(e){} }catch(e){}` |
| `wrappedApply` | async function | `public/js/blocks/block-19.js` | 234 | `var wrappedApply = async function(mode){` |
| `wrappedAsk` | async function | `public/js/blocks/block-19.js` | 277 | `var wrappedAsk = async function(promptText, opts){` |
| `wrappedSave` | async function | `public/js/blocks/block-19.js` | 179 | `var wrappedSave = async function(){` |
| `writeArr` | function | `public/js/blocks/block-12.js` | 25 | `function writeArr(k,a){ try{ if(typeof safeSet === 'function') safeSet(k, JSON.stringify(a \|\| [])); else localStorage.setItem(k, JSON.stringify(a \|\| [])); }` |
| `writeArr` | function | `public/js/blocks/block-13.js` | 27 | `function writeArr(k,a){ try{ if(typeof safeSet === 'function') safeSet(k, JSON.stringify(a \|\| [])); else localStorage.setItem(k, JSON.stringify(a \|\| [])); }` |
| `writeArr` | function | `public/js/blocks/block-14.js` | 37 | `function writeArr(k,a){ try{ if(typeof safeSet === 'function') safeSet(k, JSON.stringify(a \|\| [])); else localStorage.setItem(k, JSON.stringify(a \|\| [])); }` |
| `writeArr` | function | `public/js/blocks/block-15.js` | 34 | `function writeArr(k,a){ try{ if(typeof safeSet==='function') safeSet(k,JSON.stringify(a\|\|[])); else localStorage.setItem(k,JSON.stringify(a\|\|[])); }catch(e)` |
| `writeArr` | function | `public/js/blocks/block-16.js` | 45 | `function writeArr(k,a){ try{ if(typeof safeSet==='function') safeSet(k,JSON.stringify(a\|\|[])); else localStorage.setItem(k,JSON.stringify(a\|\|[])); }catch(e)` |
| `writeArr` | function | `public/js/blocks/block-17.js` | 33 | `function writeArr(k,a){ try{ if(typeof safeSet==='function') safeSet(k,JSON.stringify(a\|\|[])); else localStorage.setItem(k,JSON.stringify(a\|\|[])); }catch(e)` |
| `writeObj` | function | `public/js/blocks/block-12.js` | 27 | `function writeObj(k,o){ try{ localStorage.setItem(k, JSON.stringify(o \|\| {})); }catch(e){} }` |
| `writeObj` | function | `public/js/blocks/block-13.js` | 29 | `function writeObj(k,o){ try{ localStorage.setItem(k, JSON.stringify(o \|\| {})); }catch(e){} }` |
| `writeObj` | function | `public/js/blocks/block-14.js` | 39 | `function writeObj(k,o){ try{ localStorage.setItem(k, JSON.stringify(o \|\| {})); }catch(e){} }` |
| `writeObj` | function | `public/js/blocks/block-15.js` | 36 | `function writeObj(k,o){ try{localStorage.setItem(k,JSON.stringify(o\|\|{}));}catch(e){} }` |
| `writeObj` | function | `public/js/blocks/block-16.js` | 47 | `function writeObj(k,o){ try{ localStorage.setItem(k,JSON.stringify(o\|\|{})); }catch(e){} }` |
| `writeObj` | function | `public/js/blocks/block-17.js` | 35 | `function writeObj(k,o){ try{ localStorage.setItem(k,JSON.stringify(o\|\|{})); }catch(e){} }` |
| `ws` | arrow/function | `public/js/blocks/block-05.js` | 177 | `var ws = (words \|\| []).map(norm).filter(Boolean);` |
