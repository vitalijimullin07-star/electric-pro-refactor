# JS-блоки public/index.html
Автоматическая карта перед разборкой проекта на модули.
Всего script-блоков: **33**

## Script block 1
- HTML lines: 9–16
- Code lines: 8
- Size: 324 bytes
- Attrs: `inline`

### window exports
- `window.onerror`

### Variables/constants
- `loader`

### Preview
```js
window.onerror = function(message, source, lineno, colno, error) {
            console.error("Критическая ошибка:", message, lineno);
            let loader = document.getElementById('global-loader');
            if(loader) loader.classList.remove('show');
            return true; 
        };
```

## Script block 2
- HTML lines: 18–18
- Code lines: 1
- Size: 0 bytes
- Attrs: `src="https://cdn.jsdelivr.net/npm/chart.js"`

## Script block 3
- HTML lines: 19–19
- Code lines: 1
- Size: 0 bytes
- Attrs: `src="https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js"`

## Script block 4
- HTML lines: 21–21
- Code lines: 1
- Size: 0 bytes
- Attrs: `src="https://www.gstatic.com/firebasejs/10.8.1/firebase-app-compat.js"`

## Script block 5
- HTML lines: 22–22
- Code lines: 1
- Size: 0 bytes
- Attrs: `src="https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore-compat.js"`

## Script block 6
- HTML lines: 23–23
- Code lines: 1
- Size: 0 bytes
- Attrs: `src="https://www.gstatic.com/firebasejs/10.8.1/firebase-auth-compat.js"`

## Script block 7
- HTML lines: 558–2063
- Code lines: 1506
- Size: 124628 bytes
- Attrs: `inline`

### Functions
- `safeGet()`
- `safeSet()`
- `handleGoogleAuth()`
- `checkLocalPinUser()`
- `showLoader()`
- `hideLoader()`
- `showToast()`
- `loginWithPin()`
- `confirmLogout()`
- `finishLoginSetup()`
- `openModal()`
- `closeModal()`
- `toggleMenu()`
- `changeTheme()`
- `updateMasterBadge()`
- `updateCoeffs()`
- `saveApiKey()`
- `saveQRs()`
- `fPrice()`
- `openSwapModal()`
- `applySwap()`
- `renderMainTable()`
- `syncDraft()`
- `clearCurrentEstimate()`
- `openMatCatalog()`
- `openWorkCatalog()`
- `toggleCat()`
- `promptAdd()`
- `confirmQtyAdd()`
- `addAuto()`
- `setPodr()`
- `setH()`
- `setP()`
- `modM()`
- `upUI()`
- `addGrp()`
- `popPool()`
- `rfPool()`
- `applyPoolToEstimate()`
- `modV()`
- `populateShieldExtras()`
- `addExtraToShieldConfig()`
- `renderShieldExtras()`
- `epAllDbItems()`
- `epNormText()`
- `epFindDbItem()`
- `epV15BrandRu()`
- `epV15BrandCode()`
- `epV15CleanForName()`
- `epV15DetectModel()`
- `epV15DetectNominal()`
- `epV15DetectPoles()`
- `epV15AmpFromNominal()`
- `epV15FormatAutoName()`
- `epV15DetectLeakage()`
- `epV15FormatRcdName()`
- `epV15DisplayMaterialName()`
- `epV15MergeAssignments()`
- `epMat()`
- `epWork()`
- `epGetCheck()`
- `epGetVal()`
- `epAutoPrice()`
- `epDifPrice()`
- `generateCascadePanel()`
- `addLine()`
- `addRoom()`
- `groupAssignment()`
- `addProtection()`
- `mat()`
- `work()`
- `runAiCheck()`
- `aiSupply()`
- `aiPueHelper()`
- `compareShopsAI()`
- `getPDFHeader()`
- `categorizeEstimateItem()`
- `showPreview()`
- `refreshPreview()`
- `printAct()`
- ...ещё 28

### window exports
- `window.customAlert`
- `window.customConfirm`
- `window.alert`

### Variables/constants
- `GEMINI_API_KEY`
- `appUser`
- `cust`
- `c`
- `hDB`
- `currentEstimate`
- `matDB`
- `pool`
- `coeffs`
- `c`
- `appLogic`
- `logic`
- `priceOverrides`
- `cfg`
- `st_soc`
- `globalRecalcCab`
- `pendingAdd`
- `currentCardId`
- `currentShieldExtras`
- `currentPreviewMode`
- `adminDraftsCache`
- `buhChartInstance`
- `FULL_MAT_INIT`
- `FULL_WORK_INIT`
- `provider`
- `regBtn`
- `userRef`
- `docSnap`
- `pinUser`
- `overlay`
- `overlay`
- `t`
- `phone`
- `pin`
- `snap`
- `savedTheme`
- `dbDoc`
- `logicDoc`
- `histSnap`
- `draftDoc`
- `c`
- `swapTargetIdx`
- `current`
- `sel`
- `isMat`
- `dbToUse`
- `opts`
- `selId`
- `current`
- `isMat`
- ...ещё 305

### Preview
```js
// === БЕЗОПАСНАЯ ОБОЛОЧКА И СИНХРОНИЗАЦИЯ ===
function safeGet(key, def) { try { return localStorage.getItem(key) || def; } catch(e) { return def; } }
function safeSet(key, val) { try { localStorage.setItem(key, val); } catch(e) {} }

window.addEventListener('offline', () => { showToast("📵 Нет интернета. Работаем локально."); });
window.addEventListener('online', () => { showToast("🌐 Связь восстановлена. Синхронизация..."); syncDraft(); });

let db, auth;
let GEMINI_API_KEY = safeGet('gemini_key_v31', "");
let appUser = null; 
let cust = {name:"", phone:"", addr:"", ceil:270};
try { let c = JSON.parse(safeGet('cust_v31', '{}')); if(c && c.name) cust = c; } catch(e){}
```

## Script block 8
- HTML lines: 2095–3541
- Code lines: 1447
- Size: 72275 bytes
- Attrs: `id="EP_SURGICAL_TZ_SCRIPT"`

### Functions
- `epCleanText()`
- `epMoney()`
- `epEscape()`
- `epNormProvider()`
- `epCurrentProvider()`
- `epCurrentKey()`
- `epSetAiProvider()`
- `epRefreshProviderUI()`
- `epInsertMainProviderSwitch()`
- `epMakeAiMenuGroup()`
- `epAddBetaLabels()`
- `epPatchSettingsUI()`
- `epTestProviderKey()`
- `epLoadAiConfigFromServer()`
- `epCallGemini()`
- `epExtractOpenAiText()`
- `epCallOpenAI()`
- `epAskAI()`
- `epStripCode()`
- `epTryJsonParseLoose()`
- `epParseLooseTableText()`
- `epExtractJsonObjectsLoose()`
- `epParseJsonArray()`
- `epDbTypeLabel()`
- `epCurrentDb()`
- `epSetCurrentDb()`
- `epInferCategory()`
- `epInferSubcategory()`
- `epNormalizeItems()`
- `epSaveUserDb()`
- `epSaveGlobalDb()`
- `epLoadUserDbAfterLogin()`
- `epInsertDbTools()`
- `epReadFileAsText()`
- `epReadFileAsDataURL()`
- `epReadFileAsArrayBuffer()`
- `epIsEmptyCell()`
- `epCleanCell()`
- `epIsUnitCell()`
- `epNormalizeUnit()`
- `epIsNumberLikeCell()`
- `epLooksLikeCodeOrNumber()`
- `epTitleCaseRu()`
- `epExtractItemsFromSheetRows()`
- `epReadDbFile()`
- `epAiNormalizeImage()`
- `epAiNormalizeDbText()`
- `epShowDbReview()`
- `epGetReviewedSelected()`
- `epSameItem()`
- `epSendDbProposal()`
- `epDownloadJson()`
- `epInsertAdminProposalBox()`
- `epListenDbProposals()`
- `epInitialApply()`

### window exports
- `window.EP_AI_CONFIG`
- `window.EP_DB_REVIEW`
- `window.epSetAiProvider`
- `window.epRefreshProviderUI`
- `window.epClearLocalAiKeys`
- `window.epSaveAiConfig`
- `window.EP_AI_CONFIG`
- `window.saveApiKey`
- `window.epAskAI`
- `window.runAiCheck`
- `window.aiSupply`
- `window.aiPueHelper`
- `window.compareShopsAI`
- `window.epTriggerDbFileImport`
- `window.epOpenTextImport`
- `window.epRunTextImport`
- `window.epReviewCheckAll`
- `window.EP_DB_REVIEW`
- `window.epApplyReviewedDbItems`
- `window.epExportMyDb`
- `window.epExportGlobalDb`
- `window.renderDbEditors`
- `window.epDeleteDbItem`
- `window.addDbItem`
- `window.requestPriceChange`
- `window.epAdminResolveDbProposal`
- `window.finishLoginSetup`

### Variables/constants
- `n`
- `p`
- `p`
- `input`
- `label`
- `state`
- `masterInfo`
- `header`
- `box`
- `menu`
- `aiButtons`
- `t`
- `wrap`
- `panel`
- `t`
- `oldInput`
- `h4`
- `box`
- `r`
- `data`
- `url`
- `r`
- `data`
- `provider`
- `geminiKey`
- `openaiKey`
- `model`
- `keyToTest`
- `usersSnap`
- `batch`
- `input`
- `data`
- `cfgDoc`
- `oldDoc`
- `userDoc`
- `u`
- `g`
- `o`
- `m`
- `keysBox`
- `masterInfo`
- `key`
- `parts`
- `match`
- `url`
- `r`
- `data`
- `out`
- `key`
- `content`
- ...ещё 155

### Preview
```js
(function () {
    // === STATE ===
    window.EP_AI_CONFIG = {
        provider: safeGet('ep_ai_provider_v1', 'gemini') || 'gemini',
        geminiKey: '',
        openaiKey: '',
        openaiModel: safeGet('ep_openai_model_v1', 'gpt-4o-mini') || 'gpt-4o-mini'
    };

    window.EP_DB_REVIEW = { type: 'mat', items: [], source: '' };

    function epCleanText(v) {
```

## Script block 9
- HTML lines: 3576–3867
- Code lines: 292
- Size: 44692 bytes
- Attrs: `id="EP_FULL_WORKS_PROPOSALS_SCRIPT"`

### Functions
- `epEsc()`
- `epId()`
- `epArr()`
- `epSetArr()`
- `epClean()`
- `epSame()`
- `epMaterialFromName()`
- `epOpFromName()`
- `epNormalizeWorkItem()`
- `epDisplayWorkName()`
- `epEstimateCopy()`
- `epMergeFullWorksInto()`
- `epNormalizeAllWorkDb()`
- `epGroupCatalog()`
- `epRenderGroupedList()`
- `epGetGlobalDb()`
- `epRenderGlobalDbModal()`
- `epInsertGlobalDbButton()`
- `epEnsureProposalBox()`
- `epProposalItemName()`
- `epRenderProposalList()`
- `epStartProposalV2()`
- `epInitFullWorksPatch()`

### window exports
- `window.EP_DB_PROPOSALS_CACHE_V2`
- `window.epToggleSubCat`
- `window.epPromptGroupedAdd`
- `window.pendingAdd`
- `window.promptAdd`
- `window.openWorkCatalog`
- `window.openMatCatalog`
- `window.renderDbEditors`
- `window.epOpenGlobalDbModal`
- `window.epSwitchGlobalDbTab`
- `window.epGlobalSelectAll`
- `window.epAddSelectedGlobalToMyDb`
- `window.openModal`
- `window.epOpenProposalDetail`
- `window.epProposalSelectAll`
- `window.epResolveProposalOne`
- `window.epResolveProposalItems`
- `window.EP_DB_PROPOSALS_CACHE_V2`
- `window.finishLoginSetup`

### Variables/constants
- `EP_FULL_WORKS`
- `epGlobalDbType`
- `epGlobalDbCache`
- `s`
- `m`
- `s`
- `it`
- `originalName`
- `mat`
- `low`
- `g`
- `n`
- `copy`
- `out`
- `nw`
- `cats`
- `it`
- `c`
- `g`
- `cats`
- `html`
- `idx`
- `cid`
- `catStyle`
- `sid`
- `id`
- `itemTitle`
- `el`
- `item`
- `nameEl`
- `qtyEl`
- `oldPromptAddFull`
- `el`
- `oldOpenMatCatalogFull`
- `hasNested`
- `el`
- `catsM`
- `catsW`
- `catsEl`
- `em`
- `ew`
- `doc`
- `d`
- `matBtn`
- `workBtn`
- `list`
- `arr`
- `checks`
- `type`
- `src`
- ...ещё 44

### Preview
```js
(function() {
    const EP_FULL_WORKS=[{"id":"w44","c":"Алмазная резка","g":"Штроба 25х30","n":"Бетон","p":550,"u":"м.п."},{"id":"w45","c":"Алмазная резка","g":"Штроба 25х30","n":"Кирпич","p":400,"u":"м.п."},{"id":"w46","c":"Алмазная резка","g":"Штроба 25х30","n":"Панелька","p":700,"u":"м.п."},{"id":"w47","c":"Алмазная резка","g":"Штроба 25х30","n":"Мягкий мат.","p":400,"u":"м.п."},{"id":"w48","c":"Алмазная резка","g":"Штроба 50х50","n":"Бетон","p":1500,"u":"м.п."},{"id":"w49","c":"Алмазная резка","g":"Штроба 50х50","n":"Кирпич","p":1300,"u":"м.п."},{"id":"w50","c":"Алмазная резка","g":"Штроба 50х50","n":"Панелька","p":1900,"u":"м.п."},{"id":"w51","c":"Алмазная резка","g":"Штроба 50х50","n":"Мягкий мат.","p":900,"u":"м.п."},{"id":"w52","c":"Алмазная резка","g":"Штроба 100х50 ВВОДНАЯ","n":"Бетон","p":2200,"u":"м.п."},{"id":"w53","c":"Алмазная резка","g":"Штроба 100х50 ВВОДНАЯ","n":"Кирпич","p":1550,"u":"м.п."},{"id":"w54","c":"Алмазная резка","g":"Штроба 100х50 ВВОДНАЯ","n":"Панелька","p":2500,"u":"м.п."},{"id":"w55","c":"Алмазная резка","g":"Штроба 100х50 ВВОДНАЯ","n":"Мягкий мат.","p":1400,"u":"м.п."},{"id":"w56","c":"Алмазная резка","g":"Высверливание подр. стандарт","n":"Бетон","p":600,"u":"шт"},{"id":"w57","c":"Алмазная резка","g":"Высверливание подр. стандарт","n":"Кирпич","p":500,"u":"шт"},{"id":"w58","c":"Алмазная резка","g":"Высверливание подр. стандарт","n":"Панелька","p":650,"u":"шт"},{"id":"w59","c":"Алмазная резка","g":"Высверливание подр. стандарт","n":"Мягкий мат.","p":400,"u":"шт"},{"id":"w60","c":"Черновая электрика","g":"Вклейка подрозетников","n":"Все типы","p":100,"u":"шт"},{"id":"w61","c":"Алмазная резка","g":"Вырубка ниши щита","n":"Бетон","p":400,"u":"мод."},{"id":"w62","c":"Алмазная резка","g":"Вырубка ниши щита","n":"Кирпич","p":300,"u":"мод."},{"id":"w63","c":"Алмазная резка","g":"Вырубка ниши щита","n":"Панелька","p":500,"u":"мод."},{"id":"w64","c":"Алмазная резка","g":"Вырубка ниши щита","n":"Мягкий мат.","p":250,"u":"мод."},{"id":"w65","c
```

## Script block 10
- HTML lines: 3871–4181
- Code lines: 311
- Size: 26664 bytes
- Attrs: `id="EP_SHIELD_UI_DB_FIX_SCRIPT"`

### Functions
- `qs()`
- `safeText()`
- `norm()`
- `uniq()`
- `getVal()`
- `getCheck()`
- `toNum()`
- `getCfgCount()`
- `epMoveShieldSettingsIntoDetails()`
- `epMatGroupName()`
- `epNormalizeMaterialsDb()`
- `fixArr()`
- `epGroupedData()`
- `epRenderGrouped()`
- `epPatchDbRenderers()`
- `epAllDbItems()`
- `epFindItem()`
- `epMat()`
- `epWork()`
- `addLine()`
- `addRoom()`
- `addProtection()`
- `autoPrice()`
- `difPrice()`
- `epPatchGenerateButton()`
- `boot()`

### window exports
- `window.matDB`
- `window.userMatDB`
- `window.epToggleShieldDbSub`
- `window.epPromptShieldGroupedAdd`
- `window.pendingAdd`
- `window.openMatCatalog`
- `window.openWorkCatalog`
- `window.renderDbEditors`
- `window.epGenerateShieldFixed`
- `window.currentShieldExtras`
- `window.generateCascadePanel`

### Variables/constants
- `el`
- `el`
- `n`
- `el`
- `modal`
- `content`
- `anchor`
- `details`
- `firstRow`
- `inner`
- `ids`
- `moved`
- `el`
- `row`
- `wall`
- `wrap`
- `label`
- `text`
- `name`
- `c`
- `grp`
- `data`
- `c`
- `g`
- `data`
- `html`
- `cid`
- `catStyle`
- `sid`
- `id`
- `meta`
- `color`
- `el`
- `arr`
- `item`
- `n`
- `q`
- `oldMat`
- `oldWork`
- `oldRender`
- `el`
- `el`
- `catsEl`
- `em`
- `ew`
- `a`
- `b`
- `ws`
- `best`
- `blob`
- ...ещё 43

### Preview
```js
(function(){
  function qs(id){ return document.getElementById(id); }
  function safeText(v){ return String(v || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }
  function norm(v){ return String(v || '').toLowerCase().replace(/ё/g,'е').replace(/[^a-zа-я0-9]+/g,' ').trim(); }
  function uniq(arr){ return Array.from(new Set(arr.filter(Boolean))); }
  function getVal(id, def){ var el=qs(id); return el ? el.value : def; }
  function getCheck(id){ var el=qs(id); return !!(el && el.checked); }
  function toNum(v, def){ var n=Number(v); return Number.isFinite(n) ? n : (def || 0); }

  function getCfgCount(key, id, def){
    try { if (window.cfg && Number.isFinite(Number(window.cfg[key]))) return Number(window.cfg[key]); } catch(e){}
    var el = qs(id || ('v-'+key));
```

## Script block 11
- HTML lines: 4187–4391
- Code lines: 205
- Size: 15563 bytes
- Attrs: `id="EP_DB_RESTORE_AGGREGATE_SCRIPT"`

### Functions
- `qs()`
- `toast()`
- `safe()`
- `norm()`
- `dbArr()`
- `setDbArr()`
- `detectBrand()`
- `detectNominal()`
- `getGroup()`
- `setGroup()`
- `normalizeMaterialDb()`
- `renderGrouped()`
- `renderItem()`
- `savedChoices()`
- `saveChoice()`
- `lookupKey()`
- `reqName()`
- `smartFindMat()`
- `canonicalName()`
- `mergeEstimate()`
- `boot()`

### window exports
- `window.matDB`
- `window.workDB`
- `window.epDbToggleSub`
- `window.openMatCatalog`
- `window.openWorkCatalog`
- `window.renderDbEditors`
- `window.epMat`
- `window.renderMainTable`
- `window.applySwap`
- `window.openSwapModal`

### Variables/constants
- `BRAND_LIST`
- `raw`
- `n`
- `n`
- `m`
- `arr`
- `n`
- `raw`
- `cats`
- `c`
- `g`
- `html`
- `ci`
- `cid`
- `color`
- `cat`
- `gi`
- `gid`
- `id`
- `meta`
- `btnColor`
- `el`
- `oldOpenMat`
- `oldOpenWork`
- `oldRenderDb`
- `el`
- `el`
- `dc`
- `all`
- `em`
- `ew`
- `m`
- `parts`
- `brand`
- `nominal`
- `kind`
- `arr`
- `key`
- `saved`
- `found`
- `brand`
- `nominal`
- `kind`
- `searchWords`
- `best`
- `blob`
- `score`
- `oldEpMat`
- `r`
- `clean`
- ...ещё 21

### Preview
```js
(function(){
  const BRAND_LIST = ['ABB','IEK','ИЭК','EKF','Schneider','Schneider Electric','Legrand','Hager','Dekraft','CHINT','Tekfor','TDM'];

  function qs(id){ return document.getElementById(id); }
  function toast(t){ if(typeof showToast==='function') showToast(t); else console.log(t); }
  function safe(s){ return String(s == null ? '' : s).replace(/[&<>"]/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[m])); }
  function norm(s){ return String(s||'').toLowerCase().replace(/с/g,'c').replace(/а/g,'a').replace(/в/g,'b').replace(/х/g,'x').replace(/ё/g,'е').replace(/[×]/g,'x').replace(/[^a-zа-я0-9]+/g,' ').trim(); }
  function dbArr(type){
    try { return type === 'mat' ? matDB : workDB; } catch(e) { return type === 'mat' ? (window.matDB || []) : (window.workDB || []); }
  }
  function setDbArr(type, arr){
    try { if(type === 'mat') matDB = arr; else workDB = arr; } catch(e) { if(type === 'mat') window.matDB = arr; else window.workDB = arr; }
```

## Script block 12
- HTML lines: 4395–4865
- Code lines: 471
- Size: 22635 bytes
- Attrs: `inline`

### Functions
- `qs()`
- `safeHtml()`
- `norm()`
- `arrByType()`
- `setArrByType()`
- `detectBrand()`
- `detectNominal()`
- `detectLeakage()`
- `detectRcdType()`
- `normalizeDbItem()`
- `normalizeDbs()`
- `renderGroupedFixed()`
- `reqDisplayName()`
- `strictFindMaterial()`
- `cleanCanonicalName()`
- `lineFromRaw()`
- `mergeEstimateFixed()`
- `shieldRowsForDetails()`
- `detailNote()`

### window exports
- `window.epDbToggleSubFixed`
- `window.openMatCatalog`
- `window.openWorkCatalog`
- `window.renderDbEditors`
- `window.epMat`
- `window.renderMainTable`
- `window.categorizeEstimateItem`
- `window.showPreview`

### Variables/constants
- `arr`
- `raw`
- `brands`
- `low`
- `i`
- `n`
- `m`
- `m`
- `raw`
- `m`
- `t`
- `raw`
- `n`
- `g`
- `wr`
- `mats`
- `works`
- `data`
- `c`
- `g`
- `html`
- `cid`
- `catStyle`
- `gid`
- `id`
- `meta`
- `color`
- `el`
- `el`
- `el`
- `cats`
- `all`
- `em`
- `ew`
- `brand`
- `nominal`
- `kind`
- `leakage`
- `rcdType`
- `arr`
- `brand`
- `nominal`
- `kind`
- `leakage`
- `rcdType`
- `isBreaker`
- `isDif`
- `isUzo`
- `best`
- `blob`
- ...ещё 34

### Preview
```js
/* === SURGICAL FIX 2026-05-13: shield details, no generic DIF, DB fallback, niche category === */
(function(){
  function qs(id){ return document.getElementById(id); }
  function safeHtml(s){
    return String(s == null ? '' : s).replace(/[&<>"]/g, function(m){
      return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[m];
    });
  }
  function norm(s){
    return String(s || '')
      .toLowerCase()
      .replace(/ё/g,'е')
```

## Script block 13
- HTML lines: 4873–5226
- Code lines: 354
- Size: 16901 bytes
- Attrs: `inline`

### Functions
- `qs()`
- `toast()`
- `safe()`
- `norm()`
- `localArr()`
- `setLocalArr()`
- `getGroup()`
- `itemKey()`
- `sigKey()`
- `deletedSet()`
- `saveLocalDb()`
- `loadGlobalDb()`
- `mergedArr()`
- `groupHtml()`
- `renderGlobalModalFixed()`
- `classify()`
- `sameSwapClass()`
- `swapLabel()`

### window exports
- `window.EP_GLOBAL_DB_VISIBLE_CACHE`
- `window.EP_GLOBAL_DB_TAB_FIXED`
- `window.EP_GLOBAL_DB_VISIBLE_CACHE`
- `window.epToggleSmartSub`
- `window.epOpenGlobalDbModal`
- `window.EP_GLOBAL_DB_TAB_FIXED`
- `window.epSwitchGlobalDbTab`
- `window.EP_GLOBAL_DB_TAB_FIXED`
- `window.epGlobalSelectAll`
- `window.epAddSelectedGlobalToMyDb`
- `window.openMatCatalog`
- `window.openWorkCatalog`
- `window.promptAdd`
- `window.EP_SWAP_CANDIDATES_SMART`
- `window.openSwapModal`
- `window.EP_SWAP_CANDIDATES_SMART`
- `window.applySwap`

### Variables/constants
- `arr`
- `k`
- `cache`
- `doc`
- `d`
- `local`
- `cache`
- `global`
- `del`
- `map`
- `k1`
- `k1`
- `data`
- `c`
- `g`
- `html`
- `cid`
- `catStyle`
- `gid`
- `k`
- `src`
- `meta`
- `color`
- `el`
- `type`
- `matBtn`
- `list`
- `cache`
- `arr`
- `type`
- `checks`
- `cache`
- `src`
- `bySig`
- `local`
- `added`
- `it`
- `copy`
- `sKey`
- `idx`
- `el`
- `el`
- `oldPromptAddSmart`
- `arr`
- `item`
- `name`
- `meta`
- `n`
- `raw`
- `k`
- ...ещё 11

### Preview
```js
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
```

## Script block 14
- HTML lines: 5229–5656
- Code lines: 428
- Size: 22135 bytes
- Attrs: `inline`

### Functions
- `qs()`
- `msg()`
- `esc()`
- `clean()`
- `groupOf()`
- `localDb()`
- `setLocalDb()`
- `idKey()`
- `sigKey()`
- `delStorageKey()`
- `deletedSet()`
- `saveDeleted()`
- `clearDeletedFor()`
- `saveMyDb()`
- `loadGlobal()`
- `merged()`
- `renderList()`
- `toolbar()`
- `classify()`
- `sameClass()`

### window exports
- `window.EP_HARD_GLOBAL_CACHE`
- `window.EP_HARD_GLOBAL_CACHE`
- `window.EP_GLOBAL_DB_VISIBLE_CACHE`
- `window.epHardToggleDbSub`
- `window.epOpenGlobalDbModal`
- `window.EP_HARD_GLOBAL_TYPE`
- `window.epSwitchGlobalDbTab`
- `window.EP_HARD_GLOBAL_TYPE`
- `window.epGlobalSelectAll`
- `window.epHardRenderGlobalModal`
- `window.epAddSelectedGlobalToMyDb`
- `window.openMatCatalog`
- `window.openWorkCatalog`
- `window.renderDbEditors`
- `window.epHardSelectDelete`
- `window.epHardDeleteLocalPosition`
- `window.epHardDeleteSelected`
- `window.promptAdd`
- `window.epApplyReviewedDbItems`
- `window.EP_HARD_SWAP`
- `window.openSwapModal`
- `window.EP_HARD_SWAP`
- `window.applySwap`

### Variables/constants
- `arr`
- `set`
- `before`
- `out`
- `doc`
- `d`
- `del`
- `local`
- `global`
- `map`
- `k`
- `data`
- `c`
- `g`
- `html`
- `cid`
- `catStyle`
- `gid`
- `sk`
- `src`
- `meta`
- `color`
- `el`
- `type`
- `matBtn`
- `list`
- `cache`
- `arr`
- `type`
- `checks`
- `cache`
- `src`
- `bySig`
- `byId`
- `local`
- `del`
- `added`
- `it`
- `copy`
- `originalId`
- `s`
- `idx`
- `keepId`
- `el`
- `el`
- `title`
- `cats`
- `all`
- `em`
- `ew`
- ...ещё 25

### Preview
```js
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
```

## Script block 15
- HTML lines: 5659–6199
- Code lines: 541
- Size: 24443 bytes
- Attrs: `inline`

### Functions
- `$()`
- `toast()`
- `esc()`
- `norm()`
- `encodeItem()`
- `decodeItem()`
- `groupOf()`
- `sig()`
- `idkey()`
- `delKey()`
- `delSet()`
- `saveDel()`
- `localDb()`
- `setLocalDb()`
- `stripRuntime()`
- `saveMyDb()`
- `loadCachedGlobalFromStorage()`
- `readGlobal()`
- `merged()`
- `renderItems()`
- `makeLocalCopy()`
- `upsertLocal()`
- `unhide()`
- `deleteToolbar()`
- `classify()`
- `sameClass()`

### window exports
- `window.EP_ULTIMATE_DB_CACHE`
- `window.EP_ULTIMATE_DB_CACHE`
- `window.EP_HARD_GLOBAL_CACHE`
- `window.EP_GLOBAL_DB_VISIBLE_CACHE`
- `window.epUltimateToggleSub`
- `window.epOpenGlobalDbModal`
- `window.EP_ULTIMATE_GLOBAL_TYPE`
- `window.epSwitchGlobalDbTab`
- `window.EP_ULTIMATE_GLOBAL_TYPE`
- `window.epGlobalSelectAll`
- `window.epUltimateRenderGlobal`
- `window.epAddSelectedGlobalToMyDb`
- `window.openMatCatalog`
- `window.openWorkCatalog`
- `window.renderDbEditors`
- `window.epUltimateSelectDelete`
- `window.epUltimateDeleteOne`
- `window.epUltimateDeleteSelected`
- `window.epUltimateEditPrice`
- `window.promptAdd`
- `window.epApplyReviewedDbItems`
- `window.EP_ULTIMATE_SWAP`
- `window.openSwapModal`
- `window.EP_ULTIMATE_SWAP`
- `window.applySwap`

### Variables/constants
- `arr`
- `x`
- `raw`
- `d`
- `out`
- `fromStorage`
- `doc`
- `d`
- `local`
- `global`
- `del`
- `map`
- `k`
- `data`
- `c`
- `g`
- `html`
- `cid`
- `catStyle`
- `gid`
- `encoded`
- `sk`
- `src`
- `meta`
- `color`
- `el`
- `copy`
- `originalId`
- `copy`
- `arr`
- `s`
- `original`
- `idx`
- `keepId`
- `del`
- `type`
- `matBtn`
- `list`
- `cache`
- `arr`
- `type`
- `checks`
- `added`
- `it`
- `result`
- `matList`
- `el`
- `el`
- `title`
- `em`
- ...ещё 32

### Preview
```js
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
```

## Script block 16
- HTML lines: 6221–6912
- Code lines: 692
- Size: 70790 bytes
- Attrs: `inline`

### Functions
- `$()`
- `toast()`
- `esc()`
- `cleanText()`
- `clone()`
- `arrLS()`
- `objLS()`
- `setLS()`
- `setObjLS()`
- `cleanMode()`
- `scope()`
- `activeLabel()`
- `uid()`
- `isAdmin()`
- `groupOf()`
- `sig()`
- `enc()`
- `dec()`
- `unique()`
- `myArr()`
- `serverArr()`
- `activeArr()`
- `syncWindowCaches()`
- `saveMyLocal()`
- `saveServerLocal()`
- `setActiveDb()`
- `upsert()`
- `epSaveMyDbToServer()`
- `epSaveServerDbToServer()`
- `epSendServerProposal()`
- `epLoadDbFromServer()`
- `sourceSwitcherHtml()`
- `renderCatalog()`
- `catalogRow()`
- `editorTop()`
- `renderDbRows()`
- `editorRow()`
- `reviewedItems()`
- `downloadJson()`
- `localFullCleanOnly()`
- `commitCollection()`
- `autoGroupMaterial()`
- `autoGroupWork()`
- `serverModalRow()`
- `renderServerModalList()`
- `epRefreshDbScopeUi()`
- `install()`

### window exports
- `window.EP_MY_MAT`
- `window.EP_MY_WORK`
- `window.EP_GLOBAL_MAT`
- `window.EP_GLOBAL_WORK`
- `window.EP_FORCE_GLOBAL`
- `window.EP_ULTIMATE_DB_CACHE`
- `window.EP_GLOBAL_DB_VISIBLE_CACHE`
- `window.userMatDB`
- `window.userWorkDB`
- `window.epDbToggle`
- `window.openMatCatalog`
- `window.openWorkCatalog`
- `window.promptAdd`
- `window.renderDbEditors`
- `window.epSetDbScope`
- `window.epCreateMasterDb`
- `window.epCopyOneServerToMy`
- `window.epCopyOneGlobalToMy`
- `window.epClearMyDbType`
- `window.epClearServerDbType`
- `window.epDeleteMySelected`
- `window.addDbItem`
- `window.requestPriceChange`
- `window.epApplyReviewedDbItems`
- `window.epExportActiveDb`
- `window.epExportMyDb`
- `window.epExportGlobalDb`
- `window.epOpenDbFactoryResetModal`
- `window.epFactoryResetMyDb`
- `window.epFactoryResetAllDb`
- `window.epAutoGroupItem`
- `window.epAutoRegroupActiveDb`
- `window.epOpenGlobalDbModal`
- `window.EP_SERVER_MODAL_TYPE`
- `window.epSwitchGlobalDbTab`
- `window.EP_SERVER_MODAL_TYPE`
- `window.epGlobalSelectAll`
- `window.epRenderServerDbModal`
- `window.epAddSelectedGlobalToMyDb`
- `window.epSplitDbDebug`

### Variables/constants
- `TOP_MAT_DB`
- `TOP_WORK_DB`
- `EP_GLOBAL_MAT`
- `EP_GLOBAL_WORK`
- `EP_MY_MAT`
- `EP_MY_WORK`
- `LS_MY_MAT`
- `LS_MY_WORK`
- `LS_SERVER_CACHE`
- `LS_OLD_SERVER_CACHE`
- `LS_SCOPE`
- `LS_CLEAN`
- `LS_MASTER_CREATED`
- `EP_MY_MAT`
- `EP_MY_WORK`
- `EP_SERVER_MAT`
- `EP_SERVER_WORK`
- `EP_SERVER_DOC_SEEN`
- `y`
- `a`
- `o`
- `seen`
- `it`
- `k`
- `k`
- `idx`
- `cache`
- `gdoc`
- `gd`
- `udoc`
- `ud`
- `hasCache`
- `el`
- `arr`
- `html`
- `cats`
- `c`
- `g`
- `cid`
- `gid`
- `item`
- `sub`
- `copyBtn`
- `x`
- `x`
- `it`
- `n`
- `title`
- `s`
- `hint`
- ...ещё 77

### Preview
```js
/* === EP DB SAFE SPLIT + FACTORY RESET V3 2026-05-13: SERVER/MY, ZERO RESET, NO MIX === */
(function(){
  var TOP_MAT_DB = [{"id":"m1","c":"Кабель","n":"Кабель ВВГнг-LS 3х1.5 (Конкорд) круглый","p":57,"u":"м.п."},{"id":"m2","c":"Кабель","n":"Кабель ВВГнг-LS 3х2.5 (Конкорд) круглый","p":87,"u":"м.п."},{"id":"m3","c":"Кабель","n":"Кабель ВВГнг(п)-LS 3х1.5 (Конкорд) плоский","p":62,"u":"м.п."},{"id":"m4","c":"Кабель","n":"Кабель ВВГнг(п)-LS 3х2.5 (Конкорд) плоский","p":95,"u":"м.п."},{"id":"m5","c":"Кабель","n":"Кабель ВВГ-Пнг(А)-LS 3x4 (Лептон)","p":146,"u":"м.п."},{"id":"m6","c":"Кабель","n":"Кабель ВВГ-Пнг(А)-LS 3х6 (Лептон)","p":217,"u":"м.п."},{"id":"m7","c":"Кабель","n":"Провод ПуГВ (ПВ-3) 1х6 синий (ЦВЕТЛИТ)","p":85,"u":"м.п."},{"id":"m8","c":"Кабель","n":"Провод ПуГВ (ПВ-3) 1х6 белый (ЦВЕТЛИТ)","p":85,"u":"м.п."},{"id":"m9","c":"Слаботочка","n":"Кабель TV SAT-703 (Cavel)","p":75,"u":"м.п."},{"id":"m10","c":"Слаботочка","n":"Витая пара комп. экран. FTP4 CAT5E 24AWG Cu","p":32,"u":"м.п."},{"id":"m11","c":"Трубы","n":"Труба гофрированная ПВХ 20мм серая","p":8,"u":"м.п."},{"id":"m12","c":"Трубы","n":"Труба гофрированная ПНД 20мм черная","p":10,"u":"м.п."},{"id":"m13","c":"Трубы","n":"Гофра ПВХ/ПНД с протяжкой","p":25,"u":"м.п."},{"id":"m14","c":"Расходники","n":"Подрозетник глубокий для бетона 68х64","p":12,"u":"шт"},{"id":"m15","c":"Расходники","n":"Подрозетник стандарт (ГКЛ)","p":20,"u":"шт"},{"id":"m16","c":"Расходники","n":"Подрозетник глубокий (ГКЛ)","p":35,"u":"шт"},{"id":"m17","c":"Расходники","n":"Коробка распределительная 100х100х40","p":120,"u":"шт"},{"id":"m18","c":"Расходники","n":"Площадка под стяжку для прямого монтажа","p":5,"u":"шт"},{"id":"m19","c":"Расходники","n":"Стяжки нейлоновые КСС 3*100 (100шт)","p":40,"u":"упак."},{"id":"m20","c":"Расходники","n":"Стяжки нейлоновые КСС 5*400 (100шт)","p":410,"u":"упак."},{"id":"m21","c":"Расходники","n":"Газовый баллон 80 мл 165 мм","p":550,"u":"шт"},{"id":"m22","c":"Расходники","n":"Гвозди для прямого мон
```

## Script block 17
- HTML lines: 6928–7145
- Code lines: 218
- Size: 10000 bytes
- Attrs: `inline`

### Functions
- `$()`
- `msg()`
- `isAdmin()`
- `uid()`
- `scope()`
- `setScope()`
- `readArr()`
- `writeArr()`
- `readObj()`
- `writeObj()`
- `clean()`
- `groupOf()`
- `clone()`
- `sig()`
- `activeTarget()`
- `getMy()`
- `getServer()`
- `setMy()`
- `setServer()`
- `syncMainArrays()`
- `unique()`
- `upsert()`
- `reviewedItems()`
- `saveMyRemote()`
- `saveServerRemote()`
- `rerender()`

### window exports
- `window.EP_MY_WORK`
- `window.EP_MY_MAT`
- `window.userMatDB`
- `window.userWorkDB`
- `window.EP_GLOBAL_WORK`
- `window.EP_GLOBAL_MAT`
- `window.EP_FORCE_GLOBAL`
- `window.EP_ULTIMATE_DB_CACHE`
- `window.EP_GLOBAL_DB_VISIBLE_CACHE`
- `window.matDB`
- `window.workDB`
- `window.matDB`
- `window.workDB`
- `window.epAutoGroupItem`
- `window.epRefreshDbScopeUi`
- `window.epTriggerDbFileImport`
- `window.epOpenTextImport`
- `window.epApplyReviewedDbItems`

### Variables/constants
- `LS_MY_MAT`
- `LS_MY_WORK`
- `LS_SCOPE`
- `LS_SERVER_CACHE`
- `a`
- `o`
- `x`
- `key`
- `fromWin`
- `fromWin`
- `c`
- `a`
- `mat`
- `work`
- `use`
- `seen`
- `it`
- `k`
- `k`
- `idx`
- `review`
- `src`
- `type`
- `out`
- `ch`
- `it`
- `oldTrigger`
- `oldTextImport`
- `data`
- `type`
- `items`
- `target`
- `g`
- `a`
- `saved`

### Preview
```js
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
```

## Script block 18
- HTML lines: 7149–7329
- Code lines: 181
- Size: 9268 bytes
- Attrs: `inline`

### Functions
- `$()`
- `toast()`
- `uid()`
- `isAdmin()`
- `setScope()`
- `getScope()`
- `label()`
- `readArr()`
- `writeArr()`
- `readObj()`
- `writeObj()`
- `clean()`
- `groupOf()`
- `clone()`
- `sig()`
- `unique()`
- `getServerFromCache()`
- `setMyArrays()`
- `setServerArrays()`
- `syncActiveArrays()`
- `refreshMyFromServer()`
- `refreshServerFromServer()`
- `isVisible()`
- `updateButtons()`
- `rerenderOpenScreens()`

### window exports
- `window.EP_MY_MAT`
- `window.EP_MY_WORK`
- `window.userMatDB`
- `window.userWorkDB`
- `window.EP_GLOBAL_MAT`
- `window.EP_GLOBAL_WORK`
- `window.EP_FORCE_GLOBAL`
- `window.EP_ULTIMATE_DB_CACHE`
- `window.EP_GLOBAL_DB_VISIBLE_CACHE`
- `window.matDB`
- `window.workDB`
- `window.matDB`
- `window.workDB`
- `window.epRenderServerDbModal`
- `window.epRefreshActiveDbNow`
- `window.epSetDbScope`

### Variables/constants
- `LS_SCOPE`
- `LS_MY_MAT`
- `LS_MY_WORK`
- `LS_SERVER_CACHE`
- `refreshing`
- `lastToken`
- `a`
- `o`
- `x`
- `seen`
- `it`
- `k`
- `c`
- `a`
- `sm`
- `sw`
- `mm`
- `mw`
- `mat`
- `work`
- `doc`
- `d`
- `mat`
- `work`
- `doc`
- `d`
- `el`
- `my`
- `matCount`
- `workCount`
- `token`

### Preview
```js
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

```

## Script block 19
- HTML lines: 7332–7820
- Code lines: 489
- Size: 27348 bytes
- Attrs: `inline`

### Functions
- `$()`
- `toast()`
- `uid()`
- `isAdmin()`
- `setScope()`
- `getScope()`
- `hardHideLoader()`
- `showReadLoader()`
- `esc()`
- `cleanText()`
- `money()`
- `norm()`
- `readArr()`
- `writeArr()`
- `readObj()`
- `writeObj()`
- `groupOf()`
- `clone()`
- `sig()`
- `unique()`
- `getMy()`
- `getServer()`
- `syncMainArrays()`
- `setMy()`
- `setServer()`
- `upsert()`
- `saveMyRemote()`
- `saveServerRemote()`
- `rerender()`
- `fileText()`
- `fileBuffer()`
- `csvRows()`
- `inferCat()`
- `inferSub()`
- `normItem()`
- `rowsToItems()`
- `cell()`
- `jsonToItems()`
- `selectedCount()`
- `saveVisibleEdits()`
- `renderReviewPage()`
- `showReview()`
- `aiFromImage()`
- `aiFromText()`
- `readDbFileV6()`
- `collectReviewed()`

### window exports
- `window.EP_DB_REVIEW_V6`
- `window.matDB`
- `window.workDB`
- `window.matDB`
- `window.workDB`
- `window.EP_MY_WORK`
- `window.EP_MY_MAT`
- `window.userMatDB`
- `window.userWorkDB`
- `window.EP_GLOBAL_WORK`
- `window.EP_GLOBAL_MAT`
- `window.EP_FORCE_GLOBAL`
- `window.EP_ULTIMATE_DB_CACHE`
- `window.EP_GLOBAL_DB_VISIBLE_CACHE`
- `window.epRefreshDbScopeUi`
- `window.EP_DB_REVIEW`
- `window.epReviewToggleV6`
- `window.epReviewPageV6`
- `window.epReviewCheckAll`
- `window.EP_DB_REVIEW_V6`
- `window.EP_DB_REVIEW`
- `window.epTriggerDbFileImport`
- `window.epRunTextImport`
- `window.epAutoGroupItem`
- `window.epApplyReviewedDbItems`

### Variables/constants
- `LS_SCOPE`
- `LS_MY_MAT`
- `LS_MY_WORK`
- `LS_SERVER_CACHE`
- `PAGE_SIZE`
- `oldTrigger`
- `l`
- `n`
- `a`
- `o`
- `x`
- `seen`
- `it`
- `k`
- `fromWin`
- `fromWin`
- `c`
- `a`
- `use`
- `mat`
- `work`
- `k`
- `idx`
- `r`
- `r`
- `lines`
- `delims`
- `delim`
- `out`
- `i`
- `ch`
- `s`
- `s`
- `n`
- `c`
- `sc`
- `p`
- `u`
- `header`
- `non`
- `joined`
- `s`
- `priceIdx`
- `n`
- `title`
- `candidates`
- `name`
- `st`
- `st`
- `start`
- ...ещё 57

### Preview
```js
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

```

## Script block 20
- HTML lines: 7825–8085
- Code lines: 261
- Size: 38859 bytes
- Attrs: `inline`

### Functions
- `$()`
- `toast()`
- `esc()`
- `norm()`
- `cleanText()`
- `money()`
- `uid()`
- `isAdmin()`
- `scope()`
- `setScope()`
- `label()`
- `canEditActive()`
- `readArr()`
- `writeArr()`
- `readObj()`
- `writeObj()`
- `groupOf()`
- `clone()`
- `sig()`
- `unique()`
- `getMy()`
- `getServer()`
- `active()`
- `setMy()`
- `setServer()`
- `syncMain()`
- `upsert()`
- `ensureProgress()`
- `showProgress()`
- `hideProgress()`
- `saveMyRemote()`
- `saveServerRemote()`
- `sendProposal()`
- `reloadActiveDb()`
- `ensurePanel()`
- `renderPanel()`
- `tuneStaticBlocks()`
- `editorTop()`
- `editorRow()`
- `renderRows()`
- `downloadJson()`
- `fileTextProgress()`
- `fileBufferProgress()`
- `csvRows()`
- `inferCat()`
- `inferSub()`
- `normItem()`
- `rowsToItems()`
- `cell()`
- `jsonToItems()`
- `showReview()`
- `readDbFile()`
- `saveVisibleEdits()`
- `collectReviewed()`
- `install()`

### window exports
- `window.EP_MY_WORK`
- `window.EP_MY_MAT`
- `window.userMatDB`
- `window.userWorkDB`
- `window.EP_GLOBAL_WORK`
- `window.EP_GLOBAL_MAT`
- `window.EP_FORCE_GLOBAL`
- `window.EP_ULTIMATE_DB_CACHE`
- `window.EP_GLOBAL_DB_VISIBLE_CACHE`
- `window.matDB`
- `window.workDB`
- `window.epSendServerProposal`
- `window.epRefreshActiveDbNow`
- `window.renderDbEditors`
- `window.epSetDbScope`
- `window.epRefreshActiveDbNow`
- `window.epChangePriceV7`
- `window.epSaveActiveDbV7`
- `window.epReloadActiveDbV7`
- `window.epDeleteSelectedActiveV7`
- `window.epExportActiveDb`
- `window.epExportMyDb`
- `window.epExportGlobalDb`
- `window.EP_DB_REVIEW_V6`
- `window.EP_DB_REVIEW`
- `window.EP_V7_IMPORT_TARGET`
- `window.epReviewPageV6`
- `window.epAskAI`
- `window.epTriggerDbFileImport`
- `window.epTriggerServerProposalImportV7`
- `window.epOpenTextImportServerProposalV7`
- `window.EP_V7_IMPORT_TARGET`
- `window.epOpenTextImport`
- `window.epRunTextImport`
- `window.epAutoGroupItem`
- `window.epApplyReviewedDbItems`
- `window.EP_V7_IMPORT_TARGET`

### Variables/constants
- `LS_SCOPE`
- `LS_MY_MAT`
- `LS_MY_WORK`
- `LS_SERVER_CACHE`
- `PAGE_SIZE`
- `oldRender`
- `oldSetScope`
- `n`
- `a`
- `o`
- `x`
- `seen`
- `it`
- `k`
- `w`
- `w`
- `c`
- `a`
- `mat`
- `work`
- `use`
- `k`
- `idx`
- `css`
- `d`
- `p`
- `p`
- `toolbar`
- `p`
- `p`
- `s`
- `title`
- `matCount`
- `note`
- `html`
- `my`
- `old`
- `clean`
- `addBtn`
- `addBlock`
- `x`
- `title`
- `s`
- `hint`
- `html`
- `s`
- `item`
- `sub`
- `check`
- `price`
- ...ещё 76

### Preview
```js
/* === EP DB ROLES + PROGRESS V7 2026-05-14 ===
   Surgical DB UI: strict My DB / Server DB, server edits only by admin,
   scope-specific import/export, progress indicator, reload active DB after operations.
   Shield logic is not touched.
*/
(function(){
  var LS_SCOPE='ep_db_scope_v2';
  var LS_MY_MAT='user_db_mat_v31';
  var LS_MY_WORK='user_db_work_v31';
  var LS_SERVER_CACHE='ep_global_cache_force_v1';
  var PAGE_SIZE=60;
  var oldRender=window.renderDbEditors;
```

## Script block 21
- HTML lines: 8090–8394
- Code lines: 305
- Size: 23316 bytes
- Attrs: `inline`

### Functions
- `$()`
- `toast()`
- `esc()`
- `norm()`
- `money()`
- `groupOf()`
- `clean()`
- `sig()`
- `clone()`
- `scope()`
- `setScope()`
- `fbUser()`
- `uid()`
- `currentEmail()`
- `isAdmin()`
- `canEdit()`
- `label()`
- `readArr()`
- `writeArr()`
- `readObj()`
- `writeObj()`
- `unique()`
- `getMy()`
- `getServer()`
- `setMy()`
- `setServer()`
- `syncMain()`
- `active()`
- `upsert()`
- `ensureProgress()`
- `showProgress()`
- `hideProgress()`
- `firebaseHint()`
- `explainErr()`
- `saveMyRemote()`
- `saveServerRemote()`
- `sendProposal()`
- `reloadFromRemoteCurrent()`
- `rerender()`
- `currentEditType()`
- `makeManualItem()`
- `saveVisibleEdits()`
- `normItem()`
- `collectReviewed()`
- `injectDebugButton()`

### window exports
- `window.EP_MY_WORK`
- `window.EP_MY_MAT`
- `window.userMatDB`
- `window.userWorkDB`
- `window.EP_GLOBAL_WORK`
- `window.EP_GLOBAL_MAT`
- `window.EP_FORCE_GLOBAL`
- `window.EP_ULTIMATE_DB_CACHE`
- `window.EP_GLOBAL_DB_VISIBLE_CACHE`
- `window.matDB`
- `window.workDB`
- `window.epAutoGroupItem`
- `window.addDbItem`
- `window.epChangePriceV7`
- `window.epSaveActiveDbV7`
- `window.epReloadActiveDbV7`
- `window.epCopyOneServerToMy`
- `window.epCopyOneGlobalToMy`
- `window.epAutoGroupItem`
- `window.epApplyReviewedDbItems`
- `window.EP_V7_IMPORT_TARGET`
- `window.epFirebaseDbDebug`
- `window.renderDbEditors`

### Variables/constants
- `LS_SCOPE`
- `LS_MY_MAT`
- `LS_MY_WORK`
- `LS_SERVER_CACHE`
- `PAGE_SIZE`
- `ADMIN_EMAILS`
- `ADMIN_PHONES`
- `n`
- `x`
- `em`
- `ph`
- `a`
- `o`
- `seen`
- `it`
- `k`
- `a`
- `a`
- `o`
- `mat`
- `work`
- `use`
- `k`
- `idx`
- `d`
- `p`
- `p`
- `fbu`
- `msg`
- `gd`
- `g`
- `ud`
- `u`
- `wb`
- `cat`
- `name`
- `price`
- `unit`
- `it`
- `oldAdd`
- `type`
- `item`
- `g`
- `a`
- `arr`
- `it`
- `ok`
- `it`
- `copy`
- `arr`
- ...ещё 25

### Preview
```js
/* === EP_DB_SAVE_FIX_V8 2026-05-14 ===
   Surgical fix: do not hide Firebase save errors, do not reload empty DB after failed save,
   make manual add / import / price edit persist strictly to selected DB.
   Shield logic is not touched.
*/
(function(){
  var LS_SCOPE='ep_db_scope_v2';
  var LS_MY_MAT='user_db_mat_v31';
  var LS_MY_WORK='user_db_work_v31';
  var LS_SERVER_CACHE='ep_global_cache_force_v1';
  var PAGE_SIZE=60;
  var ADMIN_EMAILS=['vits0007@gmail.com'];
```

## Script block 22
- HTML lines: 8398–8621
- Code lines: 224
- Size: 26289 bytes
- Attrs: `inline`

### Functions
- `$()`
- `toast()`
- `esc()`
- `clean()`
- `norm()`
- `money()`
- `scope()`
- `setScope()`
- `isAdmin()`
- `uid()`
- `currentUserLabel()`
- `readArr()`
- `writeArr()`
- `readObj()`
- `writeObj()`
- `clone()`
- `groupOf()`
- `sig()`
- `unique()`
- `getServer()`
- `getMy()`
- `setServer()`
- `setMy()`
- `syncMain()`
- `upsert()`
- `ensureProgress()`
- `progress()`
- `hideProgress()`
- `explain()`
- `inferCat()`
- `inferSub()`
- `normItem()`
- `collectReviewed()`
- `readGlobalDoc()`
- `saveGlobalImport()`
- `saveMyImport()`
- `sendServerProposal()`
- `rerender()`
- `fileText()`
- `fileBuffer()`
- `csvRows()`
- `rowsToItems()`
- `cell()`
- `jsonToItems()`
- `showReviewV9()`

### window exports
- `window.EP_GLOBAL_WORK`
- `window.EP_GLOBAL_MAT`
- `window.EP_FORCE_GLOBAL`
- `window.EP_ULTIMATE_DB_CACHE`
- `window.EP_GLOBAL_DB_VISIBLE_CACHE`
- `window.EP_MY_WORK`
- `window.EP_MY_MAT`
- `window.userMatDB`
- `window.userWorkDB`
- `window.matDB`
- `window.workDB`
- `window.epAutoGroupItem`
- `window.epTriggerDbFileImport`
- `window.EP_V9_IMPORT_TARGET`
- `window.EP_V7_IMPORT_TARGET`
- `window.EP_V9_IMPORT_TARGET`
- `window.EP_V7_IMPORT_TARGET`
- `window.EP_DB_REVIEW_V6`
- `window.EP_DB_REVIEW`
- `window.EP_V9_IMPORT_TARGET`
- `window.EP_V7_IMPORT_TARGET`
- `window.epReviewPageV6`
- `window.epReadDbFileV9`
- `window.epOpenTextImport`
- `window.EP_V9_IMPORT_TARGET`
- `window.EP_V7_IMPORT_TARGET`
- `window.epApplyReviewedDbItems`
- `window.EP_V9_IMPORT_TARGET`
- `window.EP_V7_IMPORT_TARGET`
- `window.epFirebaseDbDebug`

### Variables/constants
- `LS_SCOPE`
- `LS_MY_MAT`
- `LS_MY_WORK`
- `LS_SERVER_CACHE`
- `PAGE_SIZE`
- `oldTrigger`
- `oldOpenText`
- `n`
- `u`
- `a`
- `o`
- `seen`
- `it`
- `k`
- `a`
- `c`
- `a`
- `mat`
- `work`
- `use`
- `k`
- `idx`
- `d`
- `p`
- `p`
- `msg`
- `n`
- `n`
- `n`
- `c`
- `sc`
- `p`
- `u`
- `it`
- `st`
- `type`
- `start`
- `i`
- `base`
- `ch`
- `n`
- `out`
- `ed`
- `it`
- `snap`
- `data`
- `current`
- `targetArr`
- `finalMat`
- `finalWork`
- ...ещё 32

### Preview
```js
/* === EP DB IMPORT SERVER SAVE FIX V9 2026-05-14 ===
   Fix: manual server add saved, but import could be applied to wrong scope or only local cache.
   This final patch explicitly captures import target and writes imported server DB to Firebase settings/global_db.
   Shield logic is not touched.
*/
(function(){
  var LS_SCOPE='ep_db_scope_v2';
  var LS_MY_MAT='user_db_mat_v31';
  var LS_MY_WORK='user_db_work_v31';
  var LS_SERVER_CACHE='ep_global_cache_force_v1';
  var PAGE_SIZE=60;
  var oldTrigger=window.epTriggerDbFileImport;
```

## Script block 23
- HTML lines: 8625–8829
- Code lines: 205
- Size: 16510 bytes
- Attrs: `id="EP_DB_AI_PHOTO_PDF_FIX_V10"`

### Functions
- `$()`
- `toast()`
- `progress()`
- `hideProgress()`
- `clean()`
- `esc()`
- `money()`
- `provider()`
- `keyForProvider()`
- `openAiModel()`
- `dataMime()`
- `fileToDataURL()`
- `extractTextFromOpenAI()`
- `askOpenAI()`
- `askGemini()`
- `stripCode()`
- `parseJsonLoose()`
- `inferCat()`
- `inferSub()`
- `normItem()`
- `normalize()`
- `unique()`
- `showReview()`
- `importPrompt()`
- `aiFromImageFile()`
- `aiFromPdfFile()`
- `patchLabels()`

### window exports
- `window.epDbProgress`
- `window.epDbHideProgress`
- `window.epAskAI`
- `window.EP_DB_REVIEW_V6`
- `window.EP_DB_REVIEW`
- `window.EP_V9_IMPORT_TARGET`
- `window.EP_V7_IMPORT_TARGET`
- `window.epReviewPageV6`
- `window.epReadDbFileV9`
- `window.epTriggerDbFileImport`

### Variables/constants
- `oldAskAI`
- `n`
- `p`
- `m`
- `r`
- `out`
- `key`
- `content`
- `r`
- `data`
- `key`
- `parts`
- `dataUrl`
- `m`
- `url`
- `r`
- `data`
- `p`
- `pp`
- `s`
- `v`
- `m`
- `n`
- `n`
- `name`
- `cat`
- `sc`
- `unit`
- `price`
- `arr`
- `seen`
- `k`
- `selected`
- `title`
- `list`
- `list2`
- `m`
- `dataUrl`
- `ans`
- `items`
- `maxMb`
- `dataUrl`
- `ans`
- `items`
- `oldReadV9`
- `name`
- `oldTrigger`
- `input`
- `input`
- `t`

### Preview
```js
/* === EP DB AI PHOTO/PDF IMPORT FIX V10 ===
   Fixes V9: photo import was delegated to the old picker and PDF was not handled.
   Does not touch shield logic.
*/
(function(){
  var oldAskAI = window.epAskAI;

  function $(id){ return document.getElementById(id); }
  function toast(t){ try{ if(typeof showToast==='function') showToast(t); else alert(t); }catch(e){ console.log(t); } }
  function progress(title,pct,text){
    try{ if(typeof window.epDbProgress==='function') return window.epDbProgress(title,pct,text); }catch(e){}
    try{ if(typeof showLoader==='function') showLoader((text||title||'Загрузка') + (pct!=null?' '+pct+'%':''),'🤖'); }catch(e){}
```

## Script block 24
- HTML lines: 8832–9134
- Code lines: 303
- Size: 16032 bytes
- Attrs: `id="EP_DB_ADMIN_SETTINGS_AI_STABILITY_V11"`

### Functions
- `$()`
- `txt()`
- `toast()`
- `scope()`
- `isAdmin()`
- `adminServerMode()`
- `explainServerEdit()`
- `ensureProgress()`
- `setScope()`
- `installAdminSettingsButton()`
- `normalDbButtonWasClicked()`
- `patchDbUi()`
- `importTarget()`
- `compressImageDataUrl()`
- `timeoutPromise()`
- `patchAll()`

### window exports
- `window.EP_DB_ADMIN_SETTINGS_AI_STABILITY_V11`
- `window.EP_ADMIN_SERVER_DB_EDIT`
- `window.epDbProgress`
- `window.epDbHideProgress`
- `window.epSetDbScope`
- `window.epOpenAdminServerDbFromSettings`
- `window.EP_ADMIN_SERVER_DB_EDIT`
- `window.EP_OPENING_ADMIN_SERVER_DB`
- `window.EP_OPENING_ADMIN_SERVER_DB`
- `window.EP_ADMIN_SERVER_DB_EDIT`
- `window.openModal`
- `window.EP_ADMIN_SERVER_DB_EDIT`
- `window.epSetDbScope`
- `window.addDbItem`
- `window.epSaveActiveDbV7`
- `window.epTriggerDbFileImport`
- `window.EP_V9_IMPORT_TARGET`
- `window.EP_V7_IMPORT_TARGET`
- `window.EP_V9_IMPORT_TARGET`
- `window.EP_V7_IMPORT_TARGET`
- `window.epReadDbFileV9`
- `window.epOpenTextImport`
- `window.EP_DB_REVIEW`
- `window.EP_V9_IMPORT_TARGET`
- `window.EP_V7_IMPORT_TARGET`
- `window.EP_V9_IMPORT_TARGET`
- `window.EP_V7_IMPORT_TARGET`
- `window.epApplyReviewedDbItems`
- `window.epAskAI`

### Variables/constants
- `u`
- `email`
- `d`
- `p`
- `n`
- `p`
- `m`
- `oldOpenModal`
- `wrappedOpen`
- `r`
- `panel`
- `box`
- `firstH`
- `b`
- `s`
- `oldSetDbScope`
- `wrappedScope`
- `r`
- `isGlobal`
- `serverEdit`
- `panel`
- `oldNote`
- `note`
- `s`
- `addBtn`
- `block`
- `s`
- `oldAddDbItem`
- `wrappedAdd`
- `oldSaveActive`
- `wrappedSave`
- `oldTriggerImport`
- `target`
- `input`
- `file`
- `oldOpenText`
- `target`
- `title`
- `val`
- `m`
- `oldApply`
- `wrappedApply`
- `target`
- `img`
- `maxSide`
- `w`
- `k`
- `canvas`
- `ctx`
- `oldAskAI`
- ...ещё 7

### Preview
```js
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
```

## Script block 25
- HTML lines: 9137–9406
- Code lines: 270
- Size: 15930 bytes
- Attrs: `inline`

### Functions
- `$()`
- `toast()`
- `esc()`
- `norm()`
- `money()`
- `appPrice()`
- `readArr()`
- `readObj()`
- `wallFromName()`
- `groupOf()`
- `clone()`
- `fixShieldWorkItem()`
- `normalizeCurrentEstimate()`
- `patchShieldButton()`
- `tagSrc()`
- `pushArr()`
- `collectDb()`
- `classify()`
- `sameClass()`
- `score()`
- `swapLabel()`
- `boot()`

### window exports
- `window.epWork`
- `window.renderMainTable`
- `window.addAuto`
- `window.epGenerateShieldFixed`
- `window.generateCascadePanel`
- `window.EP_V12_SWAP_LIST`
- `window.openSwapModal`
- `window.swapTargetIdx`
- `window.EP_V12_SWAP_LIST`
- `window.applySwap`

### Variables/constants
- `V`
- `n`
- `a`
- `o`
- `n`
- `x`
- `n`
- `label`
- `nl`
- `wall`
- `oldEpWork`
- `l`
- `wall`
- `r`
- `oldRender`
- `newRender`
- `oldAddAuto`
- `newAddAuto`
- `r`
- `base`
- `wrapped`
- `r`
- `x`
- `out`
- `activeScope`
- `seen`
- `k`
- `n`
- `ca`
- `cn`
- `bn`
- `s`
- `current`
- `type`
- `sel`
- `m`
- `pool`
- `ranked`
- `curCat`
- `list`
- `note`
- `idx`
- `sel`
- `it`
- `cur`
- `m`

### Preview
```js
/* === EP V12 SURGICAL FIX: shield work names + instant swap modal ===
   Fixes:
   1) "Установка БП в щит" no longer appears from shield generator.
   2) Bare wall material work name "Бетон/Кирпич/..." becomes "Штроба 100×50, под трассу кабелей (...)".
   3) Replace-position modal uses already loaded DB caches and never waits forever on Firebase.
   Shield math is not changed.
*/
(function(){
  var V='EP_V12_SWAP_SHIELD_FIX';
  function $(id){ return document.getElementById(id); }
  function toast(t){ try{ if(typeof showToast==='function') showToast(t); else console.log(t); }catch(e){ console.log(t); } }
  function esc(s){ return String(s==null?'':s).replace(/[&<>"']/g,function(m){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m];}); }
```

## Script block 26
- HTML lines: 9411–9413
- Code lines: 3
- Size: 66 bytes
- Attrs: `id="EP_V13_SHIELD_DETAIL_NAMES_BULK_DB"`

### Preview
```js
/* EP V13/V14 removed in V15: direct functions fixed instead. */
```

## Script block 27
- HTML lines: 9416–9505
- Code lines: 90
- Size: 8837 bytes
- Attrs: `inline`

### Functions
- `$()`
- `norm()`
- `clean()`
- `add()`
- `val()`
- `chk()`
- `add()`
- `room()`
- `boot()`

### window exports
- `window.epV15IsShieldDevice`
- `window.epV15Purpose`
- `window.epV15GetAssignments`
- `window.epV15BuildLinesFromConfig`
- `window.epV15InferAssignments`
- `window.epV15NormalizeCurrentEstimate`
- `window.currentEstimate`
- `window.epV15SelectVisible`
- `window.epV15MoveSelectedActive`
- `window.renderMainTable`

### Variables/constants
- `n`
- `k`
- `n`
- `a`
- `out`
- `lines`
- `e`
- `e`
- `i`
- `n`
- `acs`
- `a`
- `f`
- `n`
- `q`
- `lines`
- `m`
- `nom`
- `map`
- `it`
- `n`
- `key`
- `rec`
- `box`
- `cat`
- `c`
- `checks`
- `ids`
- `arr`
- `x`
- `oldRender`
- `oldGen`

### Preview
```js
/* EP V15 verification and compatibility patch: direct shield details + DB bulk move */
(function(){
  function $(id){ return document.getElementById(id); }
  function norm(s){ return String(s||'').toLowerCase().replace(/ё/g,'е').replace(/×/g,'x').replace(/х/g,'x').trim(); }
  function clean(s){ return String(s||'').replace(/\s+/g,' ').trim(); }
  window.epV15IsShieldDevice = function(it){
    var n=String((it&&it.n)||''); var k=String((it&&it.dbMeta&&it.dbMeta.kind)||'');
    return it && it.type==='mat' && (/\b[ABCDАВСД]\s*\d{1,3}\b|автомат|узо|диф|реле|контактор|вводной/i.test(n) || /automatic|breaker|uzo|dif|relay|contactor/i.test(k));
  };
  window.epV15Purpose = function(it){
    var n=String((it&&it.n)||''); var a=window.epV15GetAssignments?window.epV15GetAssignments(it):[];
    if(/вводн/i.test(n)) return 'вводной аппарат щита';
```

## Script block 28
- HTML lines: 9508–9705
- Code lines: 198
- Size: 20418 bytes
- Attrs: `inline`

### Functions
- `$()`
- `esc()`
- `epV16GenerateCascadePanel()`
- `addLine()`
- `addRoom()`
- `groupAssignment()`
- `addProtection()`
- `mat()`
- `work()`
- `isShieldDeviceV16()`
- `getAssignV16()`
- `add()`
- `purposeV16()`
- `normalizeV16()`
- `showDetailsV16()`
- `bindButtons()`
- `boot()`

### window exports
- `window.showPreview`
- `window.epV16GenerateCascadePanel`
- `window.generateCascadePanel`
- `window.epGenerateShieldFixed`
- `window.renderMainTable`

### Variables/constants
- `bBox`
- `bAuto`
- `sWall`
- `ph`
- `curve`
- `rcdType`
- `protectionType`
- `isMaster`
- `heavySeparate`
- `m`
- `o`
- `i`
- `n`
- `i`
- `i`
- `hobPower`
- `boilerPower`
- `groupNames`
- `presentGroups`
- `ls`
- `head`
- `leakage`
- `kind`
- `it`
- `it`
- `label`
- `label`
- `q`
- `lightLines`
- `onePoleCount`
- `twoPoleProtectionCount`
- `relayModules`
- `masterModules`
- `extraModules`
- `totalModules`
- `boxSize`
- `comb1P`
- `pugvSize`
- `info`
- `n`
- `out`
- `html`
- `f`
- `items`
- `lines`
- `p`
- `previousPreview`
- `t`
- `oldRender`

### Preview
```js
/* EP V16 absolute final override: force shield generator + details after all old patches */
(function(){
  function $(id){return document.getElementById(id);}
  function esc(v){return String(v==null?'':v).replace(/[&<>"']/g,function(m){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m];});}
  function epV16GenerateCascadePanel() {
    const bBox = epGetVal('cfg-brand-box', 'Tekfor');
    const bAuto = epGetVal('cfg-brand-auto', 'IEK');
    const sWall = epGetVal('cfg-shield-wall', 'Бетон');
    const ph = parseInt(epGetVal('cfg-phase', '1')) || 1;
    const curve = epGetVal('cfg-auto-curve', 'C');
    const rcdType = epGetVal('cfg-rcd-type', 'A');
    const protectionType = epGetVal('cfg-protection-type', 'uzo_auto');
```

## Script block 29
- HTML lines: 9709–9836
- Code lines: 128
- Size: 13963 bytes
- Attrs: `id="EP_V17_VISIBLE_FORCE_FIX"`

### Functions
- `$()`
- `txt()`
- `clean()`
- `norm()`
- `esc()`
- `toast()`
- `addBadge()`
- `brandRu()`
- `lineConfig()`
- `e()`
- `ch()`
- `add()`
- `room()`
- `nominalOf()`
- `isDevice()`
- `assignmentsOf()`
- `add()`
- `deviceName()`
- `purposeOf()`
- `patchDbBulk()`
- `move()`
- `boot()`

### window exports
- `window.epV17Normalize`
- `window.epV17ShowDetails`
- `window.showPreview`
- `window.renderMainTable`
- `window.generateCascadePanel`
- `window.epV17BulkMove`
- `window.epV17BulkDelete`

### Variables/constants
- `BUILD`
- `d`
- `out`
- `x`
- `i`
- `p`
- `acs`
- `a`
- `f`
- `hp`
- `bp`
- `m`
- `raw`
- `x`
- `c`
- `n`
- `out`
- `n`
- `nom`
- `list`
- `n`
- `src`
- `nom`
- `s`
- `arr`
- `html`
- `pf`
- `items`
- `a`
- `p`
- `m`
- `oldShow`
- `oldRender`
- `oldGen`
- `r`
- `b`
- `t`
- `modal`
- `host`
- `box`
- `checks`
- `c`
- `ids`
- `x`
- `type`
- `arr`
- `checks`
- `ok`
- `ids`
- `type`
- ...ещё 1

### Preview
```js
/* EP V17 visible force fix. Purpose: prove the new file is loaded and force shield details/names even if older handlers remain. */
(function(){
  var BUILD='V17 FORCE VISIBLE 2026-05-15';
  function $(id){ return document.getElementById(id); }
  function txt(v){ return String(v==null?'':v); }
  function clean(v){ return txt(v).replace(/\s+/g,' ').trim(); }
  function norm(v){ return clean(v).toLowerCase().replace(/ё/g,'е').replace(/[×х]/g,'x'); }
  function esc(s){ return txt(s).replace(/[&<>"']/g,function(m){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m];}); }
  function toast(s){ try{ if(typeof showToast==='function') showToast(s); else console.log(s); }catch(e){ console.log(s); } }
  function addBadge(){
    if($('ep-v17-badge')) return;
    var d=document.createElement('div'); d.id='ep-v17-badge';
```

## Script block 30
- HTML lines: 9840–10088
- Code lines: 249
- Size: 34514 bytes
- Attrs: `id="EP_V18_BULK_CHECKBOX_SHIELD_STATUS_FIX"`

### Functions
- `$()`
- `esc()`
- `clean()`
- `norm()`
- `toast()`
- `arrLS()`
- `objLS()`
- `setLS()`
- `setObjLS()`
- `scope()`
- `isAdmin()`
- `uid()`
- `groupOf()`
- `clone()`
- `getServerCache()`
- `getArr()`
- `unique()`
- `syncActiveToMain()`
- `saveArr()`
- `ensureBadge()`
- `money()`
- `dbFindAuto()`
- `dbFindRcd()`
- `brandRu()`
- `autoName()`
- `autoPrice()`
- `rcdName()`
- `rcdPrice()`
- `val()`
- `chk()`
- `cfgNum()`
- `appPrice()`
- `makeItem()`
- `mergeAssignments()`
- `add()`
- `directAddShield()`
- `renderMainDirect()`
- `addLine()`
- `room()`
- `groupAssign()`
- `isShieldDevice()`
- `assigns()`
- `add()`
- `selectedChecks()`
- `activeTypeFromUi()`
- `optionsHtml()`
- `buildBulkPanel()`
- `injectBulkPanel()`
- `injectChecks()`
- `refreshDbEnhancements()`
- `boot()`

### window exports
- `window.matDB`
- `window.workDB`
- `window.EP_GLOBAL_MAT`
- `window.EP_GLOBAL_WORK`
- `window.EP_FORCE_GLOBAL`
- `window.EP_ULTIMATE_DB_CACHE`
- `window.EP_GLOBAL_DB_VISIBLE_CACHE`
- `window.EP_MY_MAT`
- `window.EP_MY_WORK`
- `window.userMatDB`
- `window.userWorkDB`
- `window.epV18SetStatus`
- `window.currentEstimate`
- `window.currentEstimate`
- `window.currentEstimate`
- `window.currentEstimate`
- `window.renderMainTable`
- `window.currentEstimate`
- `window.epV18GenerateShield`
- `window.currentShieldExtras`
- `window.epV18ShowDetails`
- `window.currentEstimate`
- `window.showPreview`
- `window.renderDbEditors`
- `window.epV18SelectVisible`
- `window.epV18MoveSelected`
- `window.epV18DeleteSelected`
- `window.openMatCatalog`
- `window.openWorkCatalog`
- `window.epSetDbScope`
- `window.epReloadActiveDbV7`
- `window.epSaveActiveDbV7`
- `window.currentEstimate`

### Variables/constants
- `BUILD`
- `LS_SCOPE`
- `LS_MY_MAT`
- `LS_MY_WORK`
- `LS_SERVER_CACHE`
- `lastOpenedType`
- `a`
- `o`
- `c`
- `w`
- `c`
- `mw`
- `seen`
- `it`
- `k`
- `src`
- `c`
- `b`
- `b`
- `colors`
- `n`
- `amp`
- `br`
- `arr`
- `hit`
- `nn`
- `br`
- `arr`
- `nn`
- `hit`
- `amp`
- `curve`
- `model`
- `hit`
- `amp`
- `hit`
- `br`
- `model`
- `hit`
- `e`
- `e`
- `it`
- `arr`
- `map`
- `it`
- `key`
- `rec`
- `tb`
- `arr`
- `total`
- ...ещё 71

### Preview
```js
/* EP V18: visible checkbox bulk DB, safe active-source move/delete, direct shield generation to main table, colored status badge. */
(function(){
  'use strict';
  var BUILD='V18 BULK + SHIELD DIRECT 2026-05-15';
  var LS_SCOPE='ep_db_scope_v2';
  var LS_MY_MAT='user_db_mat_v31';
  var LS_MY_WORK='user_db_work_v31';
  var LS_SERVER_CACHE='ep_global_cache_force_v1';
  var lastOpenedType='mat';
  function $(id){ return document.getElementById(id); }
  function esc(v){ return String(v==null?'':v).replace(/[&<>"']/g,function(m){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m];}); }
  function clean(v){ return String(v==null?'':v).replace(/\s+/g,' ').trim(); }
```

## Script block 31
- HTML lines: 10092–10234
- Code lines: 143
- Size: 20478 bytes
- Attrs: `id="EP_V19_SHIELD_MATH_RESTORE"`

### Functions
- `$()`
- `toast()`
- `esc()`
- `money()`
- `val()`
- `chk()`
- `cfgN()`
- `appPrice()`
- `brandRu()`
- `curveNom()`
- `autoName()`
- `autoPrice()`
- `rcdName()`
- `rcdPrice()`
- `makeItem()`
- `groupLines()`
- `buildLines()`
- `add()`
- `room()`
- `addShieldToEstimate()`
- `groupAssign()`
- `getAssigns()`
- `add()`
- `isDevice()`
- `patchButtons()`
- `boot()`

### window exports
- `window.currentEstimate`
- `window.epV19GenerateShield`
- `window.currentShieldExtras`
- `window.epV19ShowDetails`
- `window.epV18GenerateShield`
- `window.epV18ShowDetails`
- `window.showPreview`

### Variables/constants
- `BUILD`
- `e`
- `e`
- `s`
- `amp`
- `c`
- `cn`
- `amp`
- `db`
- `br`
- `cn`
- `hit`
- `n`
- `br`
- `k`
- `db`
- `k`
- `br`
- `hit`
- `n`
- `arr`
- `it`
- `m`
- `key`
- `lines`
- `i`
- `n`
- `a`
- `f`
- `hp`
- `bp`
- `bBox`
- `lines`
- `groupNames`
- `groups`
- `a`
- `protect`
- `onePole`
- `extraModules`
- `totalModules`
- `boxSize`
- `items`
- `pMap`
- `nm`
- `key`
- `p`
- `light`
- `comb1P`
- `out`
- `n`
- ...ещё 11

### Preview
```js
/* EP V19: restore fixed shield math. Keeps V18 DB/bulk/status. Aggregates automatics by nominal and keeps per-line assignments. */
(function(){
  var BUILD='V19 SHIELD MATH RESTORE 2026-05-15';
  function $(id){ return document.getElementById(id); }
  function toast(msg){ try{ if(typeof showToast==='function') showToast(msg); else console.log(msg); }catch(e){ console.log(msg); } }
  function esc(s){ return String(s==null?'':s).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];}); }
  function money(v){ v=Number(v); return isFinite(v)?v:0; }
  function val(id,def){ var e=$(id); return e ? (e.value || def || '') : (def || ''); }
  function chk(id){ var e=$(id); return !!(e && e.checked); }
  function cfgN(k){ try{ return Math.max(0, Number((window.cfg&&window.cfg[k])||0)); }catch(e){ return 0; } }
  function appPrice(k,def){ try{ return Number(window.appLogic && window.appLogic[k]) || def; }catch(e){ return def; } }
  function brandRu(v){ var s=String(v||'').toUpperCase(); if(s.indexOf('IEK')>=0||s.indexOf('ИЭК')>=0) return 'ИЭК'; if(s.indexOf('ABB')>=0) return 'ABB'; if(s.indexOf('SCHNEIDER')>=0) return 'Schneider'; if(s.indexOf('LEGRAND')>=0) return 'Legrand'; if(s.indexOf('EKF')>=0) return 'EKF'; return String(v||'ИЭК'); }
```

## Script block 32
- HTML lines: 10237–10395
- Code lines: 159
- Size: 23378 bytes
- Attrs: `id="EP_V20_SHIELD_LOGIC_REAL_COUNTERS"`

### Functions
- `$()`
- `text()`
- `clean()`
- `esc()`
- `toast()`
- `money()`
- `val()`
- `chk()`
- `count()`
- `appPrice()`
- `brandRu()`
- `norm()`
- `activeMatDb()`
- `curveNom()`
- `dbFindAuto()`
- `dbFindRcd()`
- `modelFromDbName()`
- `autoName()`
- `autoPrice()`
- `rcdName()`
- `rcdPrice()`
- `item()`
- `addUniqueAssign()`
- `directAdd()`
- `buildLines()`
- `add()`
- `room()`
- `groupNominals()`
- `presentGroups()`
- `groupAssign()`
- `getAssigns()`
- `add()`
- `isDevice()`
- `patchButtons()`
- `boot()`

### window exports
- `window.currentEstimate`
- `window.currentEstimate`
- `window.epV20GenerateShield`
- `window.currentShieldExtras`
- `window.epV20ShowDetails`
- `window.epV18GenerateShield`
- `window.epV19GenerateShield`
- `window.epV18ShowDetails`
- `window.epV19ShowDetails`
- `window.showPreview`
- `window.generateCascadePanel`

### Variables/constants
- `BUILD`
- `n`
- `e`
- `e`
- `e`
- `n`
- `n`
- `s`
- `out`
- `c`
- `amp`
- `c`
- `amp`
- `br`
- `cn`
- `n`
- `isAuto`
- `hasAmp`
- `hasCurve`
- `hasBrand`
- `k`
- `n`
- `okKind`
- `okLeak`
- `okBrand`
- `m`
- `cn`
- `hit`
- `model`
- `hit`
- `amp`
- `k`
- `hit`
- `br`
- `model`
- `hit`
- `a`
- `it`
- `map`
- `it`
- `k`
- `rec`
- `lines`
- `i`
- `n`
- `a`
- `f`
- `hob`
- `boil`
- `m`
- ...ещё 31

### Preview
```js
/* EP V20: restore Vitaliy shield logic. Reads counters from DOM, not window.cfg. */
(function(){
  'use strict';
  var BUILD='V20 SHIELD LOGIC REAL COUNTERS 2026-05-15';
  function $(id){ return document.getElementById(id); }
  function text(v){ return String(v==null?'':v); }
  function clean(v){ return text(v).replace(/\s+/g,' ').trim(); }
  function esc(v){ return text(v).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];}); }
  function toast(msg){ try{ if(typeof showToast==='function') showToast(msg); else console.log(msg); }catch(e){ console.log(msg); } }
  function money(v){ var n=Number(text(v).replace(',','.').replace(/[^0-9.\-]/g,'')); return isFinite(n)?n:0; }
  function val(id,def){ var e=$(id); return e ? (e.value || def || '') : (def || ''); }
  function chk(id){ var e=$(id); return !!(e && e.checked); }
```

## Script block 33
- HTML lines: 10398–10596
- Code lines: 199
- Size: 15049 bytes
- Attrs: `id="EP_V21_STABLE_BULK_PANEL_FIX"`

### Functions
- `$()`
- `clean()`
- `esc()`
- `toast()`
- `arrLS()`
- `objLS()`
- `setArrLS()`
- `setObjLS()`
- `scope()`
- `isAdmin()`
- `uid()`
- `groupOf()`
- `clone()`
- `norm()`
- `uniq()`
- `getServerCache()`
- `getArr()`
- `syncMain()`
- `setStatus()`
- `saveArr()`
- `activeType()`
- `visibleHost()`
- `options()`
- `fillSelectors()`
- `panelHtml()`
- `hideOldBulk()`
- `rowId()`
- `ensureChecks()`
- `ensurePanel()`
- `selected()`
- `boot()`

### window exports
- `window.matDB`
- `window.workDB`
- `window.epV18SetStatus`
- `window.EP_GLOBAL_MAT`
- `window.EP_GLOBAL_WORK`
- `window.EP_FORCE_GLOBAL`
- `window.EP_ULTIMATE_DB_CACHE`
- `window.EP_GLOBAL_DB_VISIBLE_CACHE`
- `window.EP_MY_MAT`
- `window.EP_MY_WORK`
- `window.userMatDB`
- `window.userWorkDB`
- `window.epV21UpdateSubs`
- `window.epV21SelectVisible`
- `window.epV21MoveSelected`
- `window.epV21DeleteSelected`
- `window.renderDbEditors`
- `window.openMatCatalog`
- `window.openWorkCatalog`

### Variables/constants
- `BUILD`
- `LS_SCOPE`
- `LS_MY_MAT`
- `LS_MY_WORK`
- `LS_SERVER_CACHE`
- `a`
- `o`
- `seen`
- `it`
- `k`
- `c`
- `w`
- `c`
- `mw`
- `b`
- `src`
- `c`
- `m`
- `activeBtn`
- `seen`
- `h`
- `cat`
- `active`
- `oldCat`
- `type`
- `cats`
- `subs`
- `el`
- `price`
- `itemBtn`
- `raw`
- `obj`
- `box`
- `type`
- `old`
- `info`
- `ch`
- `host`
- `box`
- `row`
- `checks`
- `cat`
- `byType`
- `moved`
- `ids`
- `arr`
- `x`
- `checks`
- `ok`
- `byType`
- ...ещё 10

### Preview
```js
/* EP V21: stable bulk management panel. Fixes select dropdown closing because V18 panel was re-rendered every 2.5s. */
(function(){
  'use strict';
  var BUILD='V21 STABLE BULK PANEL 2026-05-15';
  var LS_SCOPE='ep_db_scope_v2';
  var LS_MY_MAT='user_db_mat_v31';
  var LS_MY_WORK='user_db_work_v31';
  var LS_SERVER_CACHE='ep_global_cache_force_v1';
  function $(id){ return document.getElementById(id); }
  function clean(v){ return String(v==null?'':v).replace(/\s+/g,' ').trim(); }
  function esc(v){ return String(v==null?'':v).replace(/[&<>"']/g,function(m){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m];}); }
  function toast(t){ try{ if(typeof showToast==='function') showToast(t); else console.log(t); }catch(e){ console.log(t); } }
```
