# Module Split Plan

План распределения `public/js/blocks/block-XX.js` по рабочим разделам Electric PRO.

Разделы по решению Виталия:

1. Визуально
2. Конфигуратор щита
3. Пул розеток
4. Материалы / работы / база данных
5. ИИ-функции
6. Однолинейная схема
7. Настройки
8. Админка
9. Бухгалтерия
10. Поставщику / смета / детализация
11. PDF-файлы
12. Автоматическое составление документов

---

## `block-01.js`

- Size: **412 bytes**
- Suggested target: **`public/js/06-single-line-scheme.js`**
- Score: `3`
- Matched words: `line`
- Second possible target: `public/js/12-documents.js` / score `1`

### Main functions / exports
- `onerror`

## `block-02.js`

- Size: **124732 bytes**
- Suggested target: **`public/js/02-shield-configurator.js`**
- Score: `357`
- Matched words: `shield, щит, cfg, automatic, автомат, УЗО, ДИФ, C16, C10, generateCascadePanel, контактор, rcd, dif, breaker`
- Second possible target: `public/js/04-database.js` / score `333`

### Main functions / exports
- `addAuto`
- `addDbItem`
- `addExtraToShieldConfig`
- `addExtraWork`
- `addGrp`
- `addLine`
- `addProtection`
- `addRoom`
- `adminAddUser`
- `aiPueHelper`
- `aiSupply`
- `alert`
- `applyPoolToEstimate`
- `applySwap`
- `approveUser`
- `bad`
- `categorizeEstimateItem`
- `changeTheme`
- `checkLocalPinUser`
- `clearCurrentEstimate`
- `closeModal`
- `closeObjCardAndReturn`
- `compareShopsAI`
- `confirmLogout`
- `confirmQtyAdd`
- `customAlert`
- `customConfirm`
- `dbArr`
- `deleteAct`
- `deleteUser`
- `doRecalculate`
- `drop`
- `epAllDbItems`
- `epAutoPrice`
- `epDifPrice`
- `epFindDbItem`
- `epGetCheck`
- `epGetVal`
- `epMat`
- `epNormText`
- `epV15AmpFromNominal`
- `epV15BrandCode`
- `epV15BrandRu`
- `epV15CleanForName`
- `epV15DetectLeakage`
- `epV15DetectModel`
- `epV15DetectNominal`
- `epV15DetectPoles`
- `epV15DisplayMaterialName`
- `epV15FormatAutoName`
- `epV15FormatRcdName`
- `epV15MergeAssignments`
- `epWork`
- `fPrice`
- `finishLoginSetup`
- `generateCascadePanel`
- `getPDFHeader`
- `groupAssignment`
- `handleGoogleAuth`
- `hideLoader`
- ...ещё 59

## `block-03.js`

- Size: **72380 bytes**
- Suggested target: **`public/js/05-ai-functions.js`**
- Score: `879`
- Matched words: `OpenAI, Gemini, AI, ИИ, gpt, api, ai, model, tokens`
- Second possible target: `public/js/04-database.js` / score `321`

### Main functions / exports
- `EP_AI_CONFIG`
- `EP_DB_REVIEW`
- `addDbItem`
- `aiPueHelper`
- `aiSupply`
- `cells`
- `compareShopsAI`
- `epAddBetaLabels`
- `epAdminResolveDbProposal`
- `epAiNormalizeDbText`
- `epAiNormalizeImage`
- `epApplyReviewedDbItems`
- `epAskAI`
- `epCallGemini`
- `epCallOpenAI`
- `epCleanCell`
- `epCleanText`
- `epClearLocalAiKeys`
- `epCurrentDb`
- `epCurrentKey`
- `epCurrentProvider`
- `epDbTypeLabel`
- `epDeleteDbItem`
- `epDownloadJson`
- `epEscape`
- `epExportGlobalDb`
- `epExportMyDb`
- `epExtractItemsFromSheetRows`
- `epExtractJsonObjectsLoose`
- `epExtractOpenAiText`
- `epGetReviewedSelected`
- `epInferCategory`
- `epInferSubcategory`
- `epInitialApply`
- `epInsertAdminProposalBox`
- `epInsertDbTools`
- `epInsertMainProviderSwitch`
- `epIsEmptyCell`
- `epIsNumberLikeCell`
- `epIsUnitCell`
- `epListenDbProposals`
- `epLoadAiConfigFromServer`
- `epLoadUserDbAfterLogin`
- `epLooksLikeCodeOrNumber`
- `epMakeAiMenuGroup`
- `epMoney`
- `epNormProvider`
- `epNormalizeItems`
- `epNormalizeUnit`
- `epOpenTextImport`
- `epParseJsonArray`
- `epParseLooseTableText`
- `epPatchSettingsUI`
- `epReadDbFile`
- `epReadFileAsArrayBuffer`
- `epReadFileAsDataURL`
- `epReadFileAsText`
- `epRefreshProviderUI`
- `epReviewCheckAll`
- `epRunTextImport`
- ...ещё 19

## `block-04.js`

- Size: **44797 bytes**
- Suggested target: **`public/js/04-database.js`**
- Score: `224`
- Matched words: `db, материал, работ, matDB, workDB, global_db, user_db`
- Second possible target: `public/js/08-admin.js` / score `79`

### Main functions / exports
- `EP_DB_PROPOSALS_CACHE_V2`
- `arr`
- `cid`
- `epAddSelectedGlobalToMyDb`
- `epArr`
- `epClean`
- `epDisplayWorkName`
- `epEnsureProposalBox`
- `epEsc`
- `epEstimateCopy`
- `epGetGlobalDb`
- `epGlobalSelectAll`
- `epGroupCatalog`
- `epId`
- `epInitFullWorksPatch`
- `epInsertGlobalDbButton`
- `epMaterialFromName`
- `epMergeFullWorksInto`
- `epNormalizeAllWorkDb`
- `epNormalizeWorkItem`
- `epOpFromName`
- `epOpenGlobalDbModal`
- `epOpenProposalDetail`
- `epPromptGroupedAdd`
- `epProposalItemName`
- `epProposalSelectAll`
- `epRenderGlobalDbModal`
- `epRenderGroupedList`
- `epRenderProposalList`
- `epResolveProposalItems`
- `epResolveProposalOne`
- `epSame`
- `epSetArr`
- `epStartProposalV2`
- `epSwitchGlobalDbTab`
- `epToggleSubCat`
- `finishLoginSetup`
- `hasNested`
- `openMatCatalog`
- `openModal`
- `openWorkCatalog`
- `out`
- `pendingAdd`
- `promptAdd`
- `renderDbEditors`
- `sid`

## `block-05.js`

- Size: **26769 bytes**
- Suggested target: **`public/js/02-shield-configurator.js`**
- Score: `200`
- Matched words: `shield, щит, cfg, automatic, автомат, УЗО, ДИФ, C16, C10, generateCascadePanel, контактор, rcd, dif, breaker`
- Second possible target: `public/js/04-database.js` / score `115`

### Main functions / exports
- `addLine`
- `addProtection`
- `addRoom`
- `autoPrice`
- `boot`
- `currentShieldExtras`
- `difPrice`
- `epAllDbItems`
- `epFindItem`
- `epGenerateShieldFixed`
- `epGroupedData`
- `epMat`
- `epMatGroupName`
- `epMoveShieldSettingsIntoDetails`
- `epNormalizeMaterialsDb`
- `epPatchDbRenderers`
- `epPatchGenerateButton`
- `epPromptShieldGroupedAdd`
- `epRenderGrouped`
- `epToggleShieldDbSub`
- `epWork`
- `fixArr`
- `generateCascadePanel`
- `getCfgCount`
- `getCheck`
- `getVal`
- `matDB`
- `norm`
- `openMatCatalog`
- `openWorkCatalog`
- `pendingAdd`
- `qs`
- `renderDbEditors`
- `safeText`
- `toNum`
- `uniq`
- `userMatDB`
- `ws`

## `block-06.js`

- Size: **15668 bytes**
- Suggested target: **`public/js/02-shield-configurator.js`**
- Score: `62`
- Matched words: `shield, щит, automatic, автомат, УЗО, ДИФ, контактор, rcd, dif, breaker`
- Second possible target: `public/js/04-database.js` / score `58`

### Main functions / exports
- `applySwap`
- `boot`
- `canonicalName`
- `dbArr`
- `detectBrand`
- `detectNominal`
- `epDbToggleSub`
- `epMat`
- `getGroup`
- `leak`
- `lookupKey`
- `matDB`
- `mergeEstimate`
- `norm`
- `normalizeMaterialDb`
- `openMatCatalog`
- `openSwapModal`
- `openWorkCatalog`
- `qs`
- `renderDbEditors`
- `renderGrouped`
- `renderItem`
- `renderMainTable`
- `reqName`
- `safe`
- `saveChoice`
- `savedChoices`
- `searchWords`
- `setDbArr`
- `setGroup`
- `smartFindMat`
- `toast`
- `typ`
- `workDB`

## `block-07.js`

- Size: **22740 bytes**
- Suggested target: **`public/js/02-shield-configurator.js`**
- Score: `132`
- Matched words: `shield, щит, automatic, автомат, УЗО, ДИФ, контактор, rcd, dif, breaker`
- Second possible target: `public/js/04-database.js` / score `58`

### Main functions / exports
- `arrByType`
- `categorizeEstimateItem`
- `cleanCanonicalName`
- `detailNote`
- `detectBrand`
- `detectLeakage`
- `detectNominal`
- `detectRcdType`
- `epDbToggleSubFixed`
- `epMat`
- `lineFromRaw`
- `mergeEstimateFixed`
- `meta`
- `norm`
- `normalizeDbItem`
- `normalizeDbs`
- `openMatCatalog`
- `openWorkCatalog`
- `qs`
- `renderDbEditors`
- `renderGroupedFixed`
- `renderMainTable`
- `reqDisplayName`
- `safeHtml`
- `setArrByType`
- `shieldRowsForDetails`
- `showPreview`
- `strictFindMaterial`

## `block-08.js`

- Size: **17006 bytes**
- Suggested target: **`public/js/04-database.js`**
- Score: `150`
- Matched words: `db, matDB, workDB, global_db, user_db, category, subcategory`
- Second possible target: `public/js/01-visual.js` / score `57`

### Main functions / exports
- `EP_GLOBAL_DB_TAB_FIXED`
- `EP_GLOBAL_DB_VISIBLE_CACHE`
- `EP_SWAP_CANDIDATES_SMART`
- `applySwap`
- `arr`
- `classify`
- `deletedSet`
- `epAddSelectedGlobalToMyDb`
- `epGlobalSelectAll`
- `epOpenGlobalDbModal`
- `epSwitchGlobalDbTab`
- `epToggleSmartSub`
- `getGroup`
- `global`
- `groupHtml`
- `itemKey`
- `loadGlobalDb`
- `localArr`
- `mergedArr`
- `meta`
- `norm`
- `openMatCatalog`
- `openSwapModal`
- `openWorkCatalog`
- `promptAdd`
- `qs`
- `renderGlobalModalFixed`
- `safe`
- `sameSwapClass`
- `saveLocalDb`
- `setLocalArr`
- `sigKey`
- `src`
- `swapLabel`
- `toast`

## `block-09.js`

- Size: **22240 bytes**
- Suggested target: **`public/js/04-database.js`**
- Score: `162`
- Matched words: `db, материал, работ, matDB, workDB, global_db, user_db, import, category, subcategory`
- Second possible target: `public/js/01-visual.js` / score `45`

### Main functions / exports
- `EP_GLOBAL_DB_VISIBLE_CACHE`
- `EP_HARD_GLOBAL_CACHE`
- `EP_HARD_GLOBAL_TYPE`
- `EP_HARD_SWAP`
- `applySwap`
- `arr`
- `classify`
- `clean`
- `clearDeletedFor`
- `delStorageKey`
- `deletedSet`
- `epAddSelectedGlobalToMyDb`
- `epApplyReviewedDbItems`
- `epGlobalSelectAll`
- `epHardDeleteLocalPosition`
- `epHardDeleteSelected`
- `epHardRenderGlobalModal`
- `epHardSelectDelete`
- `epHardToggleDbSub`
- `epOpenGlobalDbModal`
- `epSwitchGlobalDbTab`
- `esc`
- `global`
- `groupOf`
- `idKey`
- `loadGlobal`
- `localDb`
- `merged`
- `meta`
- `msg`
- `openMatCatalog`
- `openSwapModal`
- `openWorkCatalog`
- `promptAdd`
- `qs`
- `renderDbEditors`
- `renderList`
- `sameClass`
- `saveDeleted`
- `saveMyDb`
- `setLocalDb`
- `sigKey`
- `toolbar`

## `block-10.js`

- Size: **24549 bytes**
- Suggested target: **`public/js/04-database.js`**
- Score: `181`
- Matched words: `db, материал, работ, matDB, workDB, global_db, user_db, import, category, subcategory`
- Second possible target: `public/js/01-visual.js` / score `52`

### Main functions / exports
- `$`
- `EP_GLOBAL_DB_VISIBLE_CACHE`
- `EP_HARD_GLOBAL_CACHE`
- `EP_ULTIMATE_DB_CACHE`
- `EP_ULTIMATE_GLOBAL_TYPE`
- `EP_ULTIMATE_SWAP`
- `applySwap`
- `arr`
- `classify`
- `decodeItem`
- `delKey`
- `delSet`
- `deleteToolbar`
- `encodeItem`
- `epAddSelectedGlobalToMyDb`
- `epApplyReviewedDbItems`
- `epGlobalSelectAll`
- `epOpenGlobalDbModal`
- `epSwitchGlobalDbTab`
- `epUltimateDeleteOne`
- `epUltimateDeleteSelected`
- `epUltimateEditPrice`
- `epUltimateRenderGlobal`
- `epUltimateSelectDelete`
- `epUltimateToggleSub`
- `esc`
- `global`
- `groupOf`
- `idkey`
- `loadCachedGlobalFromStorage`
- `localDb`
- `makeLocalCopy`
- `merged`
- `meta`
- `norm`
- `openMatCatalog`
- `openSwapModal`
- `openWorkCatalog`
- `promptAdd`
- `readGlobal`
- `renderDbEditors`
- `renderItems`
- `sameClass`
- `saveDel`
- `saveMyDb`
- `setLocalDb`
- `sig`
- `stripRuntime`
- `toast`
- `type`
- `unhide`
- `upsertLocal`

## `block-11.js`

- Size: **70896 bytes**
- Suggested target: **`public/js/04-database.js`**
- Score: `324`
- Matched words: `db, base, материал, работ, matDB, workDB, global_db, user_db, import, export, category, subcategory`
- Second possible target: `public/js/02-shield-configurator.js` / score `125`

### Main functions / exports
- `$`
- `EP_FORCE_GLOBAL`
- `EP_GLOBAL_DB_VISIBLE_CACHE`
- `EP_GLOBAL_MAT`
- `EP_GLOBAL_WORK`
- `EP_MY_MAT`
- `EP_MY_WORK`
- `EP_SERVER_MODAL_TYPE`
- `EP_ULTIMATE_DB_CACHE`
- `activeArr`
- `activeLabel`
- `addDbItem`
- `arrLS`
- `autoGroupMaterial`
- `autoGroupWork`
- `catalogRow`
- `cleanMode`
- `cleanText`
- `clone`
- `commitCollection`
- `dec`
- `downloadJson`
- `editorRow`
- `editorTop`
- `enc`
- `epAddSelectedGlobalToMyDb`
- `epApplyReviewedDbItems`
- `epAutoGroupItem`
- `epAutoRegroupActiveDb`
- `epClearMyDbType`
- `epClearServerDbType`
- `epCopyOneGlobalToMy`
- `epCopyOneServerToMy`
- `epCreateMasterDb`
- `epDbToggle`
- `epDeleteMySelected`
- `epExportActiveDb`
- `epExportGlobalDb`
- `epExportMyDb`
- `epFactoryResetAllDb`
- `epFactoryResetMyDb`
- `epGlobalSelectAll`
- `epLoadDbFromServer`
- `epOpenDbFactoryResetModal`
- `epOpenGlobalDbModal`
- `epRefreshDbScopeUi`
- `epRenderServerDbModal`
- `epSaveMyDbToServer`
- `epSaveServerDbToServer`
- `epSendServerProposal`
- `epSetDbScope`
- `epSplitDbDebug`
- `epSwitchGlobalDbTab`
- `esc`
- `groupOf`
- `idx`
- `install`
- `isAdmin`
- `localFullCleanOnly`
- `myArr`
- ...ещё 30

## `block-12.js`

- Size: **10106 bytes**
- Suggested target: **`public/js/04-database.js`**
- Score: `130`
- Matched words: `database, db, base, matDB, workDB, global_db, user_db, import, category, subcategory`
- Second possible target: `public/js/05-ai-functions.js` / score `30`

### Main functions / exports
- `$`
- `EP_FORCE_GLOBAL`
- `EP_GLOBAL_DB_VISIBLE_CACHE`
- `EP_GLOBAL_MAT`
- `EP_GLOBAL_WORK`
- `EP_MY_MAT`
- `EP_MY_WORK`
- `EP_ULTIMATE_DB_CACHE`
- `activeTarget`
- `clean`
- `clone`
- `epApplyReviewedDbItems`
- `epAutoGroupItem`
- `epOpenTextImport`
- `epRefreshDbScopeUi`
- `epTriggerDbFileImport`
- `getMy`
- `getServer`
- `groupOf`
- `idx`
- `isAdmin`
- `matDB`
- `msg`
- `readArr`
- `readObj`
- `rerender`
- `reviewedItems`
- `saveMyRemote`
- `saveServerRemote`
- `scope`
- `setMy`
- `setScope`
- `setServer`
- `sig`
- `syncMainArrays`
- `uid`
- `unique`
- `upsert`
- `userMatDB`
- `userWorkDB`
- `workDB`
- `writeArr`
- `writeObj`

## `block-13.js`

- Size: **9374 bytes**
- Suggested target: **`public/js/04-database.js`**
- Score: `113`
- Matched words: `database, db, base, материал, работ, matDB, workDB, global_db, user_db, category, subcategory`
- Second possible target: `public/js/05-ai-functions.js` / score `23`

### Main functions / exports
- `$`
- `EP_FORCE_GLOBAL`
- `EP_GLOBAL_DB_VISIBLE_CACHE`
- `EP_GLOBAL_MAT`
- `EP_GLOBAL_WORK`
- `EP_MY_MAT`
- `EP_MY_WORK`
- `EP_ULTIMATE_DB_CACHE`
- `clean`
- `clone`
- `epRefreshActiveDbNow`
- `epRenderServerDbModal`
- `epSetDbScope`
- `getScope`
- `getServerFromCache`
- `groupOf`
- `isAdmin`
- `isVisible`
- `label`
- `matDB`
- `readArr`
- `readObj`
- `refreshMyFromServer`
- `refreshServerFromServer`
- `rerenderOpenScreens`
- `setMyArrays`
- `setScope`
- `setServerArrays`
- `sig`
- `syncActiveArrays`
- `toast`
- `uid`
- `unique`
- `updateButtons`
- `userMatDB`
- `userWorkDB`
- `workDB`
- `writeArr`
- `writeObj`

## `block-14.js`

- Size: **27454 bytes**
- Suggested target: **`public/js/04-database.js`**
- Score: `161`
- Matched words: `db, base, материал, работ, matDB, workDB, global_db, user_db, import, category, subcategory`
- Second possible target: `public/js/05-ai-functions.js` / score `85`

### Main functions / exports
- `$`
- `EP_DB_REVIEW`
- `EP_DB_REVIEW_V6`
- `EP_FORCE_GLOBAL`
- `EP_GLOBAL_DB_VISIBLE_CACHE`
- `EP_GLOBAL_MAT`
- `EP_GLOBAL_WORK`
- `EP_MY_MAT`
- `EP_MY_WORK`
- `EP_ULTIMATE_DB_CACHE`
- `aiFromImage`
- `aiFromText`
- `cell`
- `cleanText`
- `clone`
- `collectReviewed`
- `csvRows`
- `epApplyReviewedDbItems`
- `epAutoGroupItem`
- `epRefreshDbScopeUi`
- `epReviewCheckAll`
- `epReviewPageV6`
- `epReviewToggleV6`
- `epRunTextImport`
- `epTriggerDbFileImport`
- `esc`
- `fileBuffer`
- `fileText`
- `getMy`
- `getScope`
- `getServer`
- `groupOf`
- `hardHideLoader`
- `idx`
- `inferCat`
- `inferSub`
- `isAdmin`
- `jsonToItems`
- `matDB`
- `money`
- `norm`
- `normItem`
- `readArr`
- `readDbFileV6`
- `readObj`
- `renderReviewPage`
- `rerender`
- `rowsToItems`
- `saveMyRemote`
- `saveServerRemote`
- `saveVisibleEdits`
- `selectedCount`
- `setMy`
- `setScope`
- `setServer`
- `showReadLoader`
- `showReview`
- `sig`
- `start`
- `syncMainArrays`
- ...ещё 11

## `block-15.js`

- Size: **38965 bytes**
- Suggested target: **`public/js/04-database.js`**
- Score: `262`
- Matched words: `db, base, материал, работ, matDB, workDB, global_db, user_db, import, export, category, subcategory`
- Second possible target: `public/js/05-ai-functions.js` / score `100`

### Main functions / exports
- `$`
- `EP_DB_REVIEW`
- `EP_DB_REVIEW_V6`
- `EP_FORCE_GLOBAL`
- `EP_GLOBAL_DB_VISIBLE_CACHE`
- `EP_GLOBAL_MAT`
- `EP_GLOBAL_WORK`
- `EP_MY_MAT`
- `EP_MY_WORK`
- `EP_ULTIMATE_DB_CACHE`
- `EP_V7_IMPORT_TARGET`
- `active`
- `base`
- `canEditActive`
- `cell`
- `cleanText`
- `clone`
- `collectReviewed`
- `copy`
- `csvRows`
- `downloadJson`
- `ed`
- `editorRow`
- `editorTop`
- `ensurePanel`
- `ensureProgress`
- `epApplyReviewedDbItems`
- `epAskAI`
- `epAutoGroupItem`
- `epChangePriceV7`
- `epDeleteSelectedActiveV7`
- `epExportActiveDb`
- `epExportGlobalDb`
- `epExportMyDb`
- `epOpenTextImport`
- `epOpenTextImportServerProposalV7`
- `epRefreshActiveDbNow`
- `epReloadActiveDbV7`
- `epReviewPageV6`
- `epRunTextImport`
- `epSaveActiveDbV7`
- `epSendServerProposal`
- `epSetDbScope`
- `epTriggerDbFileImport`
- `epTriggerServerProposalImportV7`
- `esc`
- `fileBufferProgress`
- `fileTextProgress`
- `getMy`
- `getServer`
- `groupOf`
- `hideProgress`
- `idx`
- `inferCat`
- `inferSub`
- `install`
- `isAdmin`
- `jsonToItems`
- `label`
- `matDB`
- ...ещё 37

## `block-16.js`

- Size: **23422 bytes**
- Suggested target: **`public/js/04-database.js`**
- Score: `193`
- Matched words: `db, base, matDB, workDB, global_db, user_db, import, category, subcategory`
- Second possible target: `public/js/05-ai-functions.js` / score `129`

### Main functions / exports
- `$`
- `EP_FORCE_GLOBAL`
- `EP_GLOBAL_DB_VISIBLE_CACHE`
- `EP_GLOBAL_MAT`
- `EP_GLOBAL_WORK`
- `EP_MY_MAT`
- `EP_MY_WORK`
- `EP_ULTIMATE_DB_CACHE`
- `EP_V7_IMPORT_TARGET`
- `active`
- `addDbItem`
- `base`
- `canEdit`
- `clean`
- `clone`
- `collectReviewed`
- `currentEditType`
- `currentEmail`
- `ed`
- `ensureProgress`
- `epApplyReviewedDbItems`
- `epAutoGroupItem`
- `epChangePriceV7`
- `epCopyOneGlobalToMy`
- `epCopyOneServerToMy`
- `epFirebaseDbDebug`
- `epReloadActiveDbV7`
- `epSaveActiveDbV7`
- `esc`
- `explainErr`
- `fbUser`
- `firebaseHint`
- `getMy`
- `getServer`
- `groupOf`
- `hideProgress`
- `idx`
- `injectDebugButton`
- `isAdmin`
- `label`
- `makeManualItem`
- `matDB`
- `money`
- `msg`
- `norm`
- `normItem`
- `readArr`
- `readObj`
- `reloadFromRemoteCurrent`
- `renderDbEditors`
- `rerender`
- `saveMyRemote`
- `saveServerRemote`
- `saveVisibleEdits`
- `scope`
- `sendProposal`
- `setMy`
- `setScope`
- `setServer`
- `showProgress`
- ...ещё 12

## `block-17.js`

- Size: **26395 bytes**
- Suggested target: **`public/js/04-database.js`**
- Score: `240`
- Matched words: `db, base, материал, работ, matDB, workDB, global_db, user_db, import, category, subcategory`
- Second possible target: `public/js/05-ai-functions.js` / score `79`

### Main functions / exports
- `$`
- `EP_DB_REVIEW`
- `EP_DB_REVIEW_V6`
- `EP_FORCE_GLOBAL`
- `EP_GLOBAL_DB_VISIBLE_CACHE`
- `EP_GLOBAL_MAT`
- `EP_GLOBAL_WORK`
- `EP_MY_MAT`
- `EP_MY_WORK`
- `EP_ULTIMATE_DB_CACHE`
- `EP_V7_IMPORT_TARGET`
- `EP_V9_IMPORT_TARGET`
- `base`
- `cell`
- `clean`
- `clone`
- `collectReviewed`
- `csvRows`
- `currentUserLabel`
- `ed`
- `ensureProgress`
- `epApplyReviewedDbItems`
- `epAutoGroupItem`
- `epFirebaseDbDebug`
- `epOpenTextImport`
- `epReadDbFileV9`
- `epReviewPageV6`
- `epTriggerDbFileImport`
- `esc`
- `explain`
- `fileBuffer`
- `fileText`
- `getMy`
- `getServer`
- `groupOf`
- `hideProgress`
- `inferCat`
- `inferSub`
- `isAdmin`
- `jsonToItems`
- `matDB`
- `money`
- `msg`
- `norm`
- `normItem`
- `progress`
- `readArr`
- `readGlobalDoc`
- `readObj`
- `rerender`
- `rowsToItems`
- `saveGlobalImport`
- `saveMyImport`
- `savedCount`
- `scope`
- `sendServerProposal`
- `setMy`
- `setScope`
- `setServer`
- `showReviewV9`
- ...ещё 14

## `block-18.js`

- Size: **16616 bytes**
- Suggested target: **`public/js/05-ai-functions.js`**
- Score: `193`
- Matched words: `OpenAI, Gemini, AI, ИИ, gpt, api, ai, model, tokens`
- Second possible target: `public/js/04-database.js` / score `58`

### Main functions / exports
- `$`
- `EP_DB_REVIEW`
- `EP_DB_REVIEW_V6`
- `EP_V7_IMPORT_TARGET`
- `EP_V9_IMPORT_TARGET`
- `aiFromImageFile`
- `aiFromPdfFile`
- `askGemini`
- `askOpenAI`
- `clean`
- `dataMime`
- `dataUrl`
- `epAskAI`
- `epDbHideProgress`
- `epDbProgress`
- `epReadDbFileV9`
- `epReviewPageV6`
- `epTriggerDbFileImport`
- `esc`
- `extractTextFromOpenAI`
- `fileToDataURL`
- `hideProgress`
- `importPrompt`
- `inferCat`
- `inferSub`
- `keyForProvider`
- `money`
- `name`
- `normItem`
- `normalize`
- `openAiModel`
- `p`
- `parseJsonLoose`
- `patchLabels`
- `progress`
- `provider`
- `showReview`
- `stripCode`
- `toast`
- `unique`

## `block-19.js`

- Size: **16138 bytes**
- Suggested target: **`public/js/04-database.js`**
- Score: `94`
- Matched words: `db, материал, работ, import`
- Second possible target: `public/js/05-ai-functions.js` / score `56`

### Main functions / exports
- `$`
- `EP_ADMIN_SERVER_DB_EDIT`
- `EP_DB_ADMIN_SETTINGS_AI_STABILITY_V11`
- `EP_DB_REVIEW`
- `EP_OPENING_ADMIN_SERVER_DB`
- `EP_V7_IMPORT_TARGET`
- `EP_V9_IMPORT_TARGET`
- `addDbItem`
- `adminServerMode`
- `compressImageDataUrl`
- `ensureProgress`
- `epApplyReviewedDbItems`
- `epAskAI`
- `epDbHideProgress`
- `epDbProgress`
- `epOpenAdminServerDbFromSettings`
- `epOpenTextImport`
- `epReadDbFileV9`
- `epSaveActiveDbV7`
- `epSetDbScope`
- `epTriggerDbFileImport`
- `explainServerEdit`
- `importTarget`
- `installAdminSettingsButton`
- `isAdmin`
- `normalDbButtonWasClicked`
- `openModal`
- `patchAll`
- `patchDbUi`
- `scope`
- `setScope`
- `timeoutPromise`
- `toast`
- `txt`

## `block-20.js`

- Size: **16036 bytes**
- Suggested target: **`public/js/04-database.js`**
- Score: `88`
- Matched words: `db, base, материал, matDB, workDB, global_db, user_db, category, subcategory`
- Second possible target: `public/js/02-shield-configurator.js` / score `65`

### Main functions / exports
- `$`
- `EP_V12_SWAP_LIST`
- `addAuto`
- `appPrice`
- `applySwap`
- `boot`
- `classify`
- `clone`
- `collectDb`
- `epGenerateShieldFixed`
- `epWork`
- `esc`
- `fixShieldWorkItem`
- `generateCascadePanel`
- `groupOf`
- `money`
- `norm`
- `normalizeCurrentEstimate`
- `openSwapModal`
- `patchShieldButton`
- `pushArr`
- `readArr`
- `readObj`
- `renderMainTable`
- `sameClass`
- `score`
- `swapLabel`
- `swapTargetIdx`
- `tagSrc`
- `toast`
- `wallFromName`

## `block-21.js`

- Size: **172 bytes**
- Suggested target: **`public/js/06-single-line-scheme.js`**
- Score: `1`
- Matched words: `line`

## `block-22.js`

- Size: **8943 bytes**
- Suggested target: **`public/js/02-shield-configurator.js`**
- Score: `73`
- Matched words: `shield, щит, cfg, automatic, автомат, УЗО, ДИФ, C16, C10, generateCascadePanel, контактор, dif, breaker`
- Second possible target: `public/js/05-ai-functions.js` / score `23`

### Main functions / exports
- `$`
- `acs`
- `add`
- `arr`
- `boot`
- `chk`
- `clean`
- `currentEstimate`
- `epV15BuildLinesFromConfig`
- `epV15GetAssignments`
- `epV15InferAssignments`
- `epV15IsShieldDevice`
- `epV15MoveSelectedActive`
- `epV15NormalizeCurrentEstimate`
- `epV15Purpose`
- `epV15SelectVisible`
- `norm`
- `renderMainTable`
- `room`
- `val`

## `block-23.js`

- Size: **20524 bytes**
- Suggested target: **`public/js/02-shield-configurator.js`**
- Score: `193`
- Matched words: `shield, щит, cfg, automatic, автомат, УЗО, ДИФ, C16, C10, generateCascadePanel, контактор, rcd, dif, breaker`
- Second possible target: `public/js/04-database.js` / score `82`

### Main functions / exports
- `$`
- `add`
- `addLine`
- `addProtection`
- `addRoom`
- `bindButtons`
- `boot`
- `epGenerateShieldFixed`
- `epV16GenerateCascadePanel`
- `esc`
- `generateCascadePanel`
- `getAssignV16`
- `groupAssignment`
- `html`
- `isShieldDeviceV16`
- `items`
- `mat`
- `normalizeV16`
- `purposeV16`
- `renderMainTable`
- `showDetailsV16`
- `showPreview`
- `work`

## `block-24.js`

- Size: **14069 bytes**
- Suggested target: **`public/js/02-shield-configurator.js`**
- Score: `69`
- Matched words: `shield, щит, cfg, automatic, автомат, УЗО, ДИФ, C16, C10, generateCascadePanel, контактор, rcd, dif, breaker`
- Second possible target: `public/js/05-ai-functions.js` / score `46`

### Main functions / exports
- `$`
- `acs`
- `add`
- `addBadge`
- `arr`
- `assignmentsOf`
- `boot`
- `brandRu`
- `ch`
- `clean`
- `deviceName`
- `e`
- `epV17BulkDelete`
- `epV17BulkMove`
- `epV17Normalize`
- `epV17ShowDetails`
- `esc`
- `generateCascadePanel`
- `html`
- `isDevice`
- `items`
- `lineConfig`
- `move`
- `nominalOf`
- `norm`
- `patchDbBulk`
- `purposeOf`
- `renderMainTable`
- `room`
- `showPreview`
- `toast`
- `txt`

## `block-25.js`

- Size: **34621 bytes**
- Suggested target: **`public/js/02-shield-configurator.js`**
- Score: `176`
- Matched words: `shield, щит, cfg, automatic, автомат, УЗО, ДИФ, C16, C10, контактор, rcd, dif, breaker`
- Second possible target: `public/js/04-database.js` / score `167`

### Main functions / exports
- `$`
- `EP_FORCE_GLOBAL`
- `EP_GLOBAL_DB_VISIBLE_CACHE`
- `EP_GLOBAL_MAT`
- `EP_GLOBAL_WORK`
- `EP_MY_MAT`
- `EP_MY_WORK`
- `EP_ULTIMATE_DB_CACHE`
- `activeTypeFromUi`
- `add`
- `addLine`
- `appPrice`
- `arrLS`
- `assigns`
- `autoName`
- `autoPrice`
- `boot`
- `brandRu`
- `buildBulkPanel`
- `cfgNum`
- `chk`
- `clean`
- `clone`
- `currentEstimate`
- `currentShieldExtras`
- `dbFindAuto`
- `dbFindRcd`
- `directAddShield`
- `ensureBadge`
- `epReloadActiveDbV7`
- `epSaveActiveDbV7`
- `epSetDbScope`
- `epV18DeleteSelected`
- `epV18GenerateShield`
- `epV18MoveSelected`
- `epV18SelectVisible`
- `epV18SetStatus`
- `epV18ShowDetails`
- `esc`
- `getArr`
- `getServerCache`
- `groupAssign`
- `groupOf`
- `html`
- `injectBulkPanel`
- `injectChecks`
- `isAdmin`
- `isShieldDevice`
- `makeItem`
- `matDB`
- `mergeAssignments`
- `model`
- `money`
- `norm`
- `objLS`
- `openMatCatalog`
- `openWorkCatalog`
- `optionsHtml`
- `rcdName`
- `rcdPrice`
- ...ещё 19

## `block-26.js`

- Size: **20586 bytes**
- Suggested target: **`public/js/02-shield-configurator.js`**
- Score: `194`
- Matched words: `shield, щит, cfg, automatic, автомат, УЗО, ДИФ, C16, C10, epV19GenerateShield, контактор, rcd, dif, breaker`
- Second possible target: `public/js/06-single-line-scheme.js` / score `35`

### Main functions / exports
- `$`
- `add`
- `addShieldToEstimate`
- `appPrice`
- `autoName`
- `autoPrice`
- `boot`
- `brandRu`
- `buildLines`
- `cfgN`
- `chk`
- `currentEstimate`
- `currentShieldExtras`
- `curveNom`
- `db`
- `epV18GenerateShield`
- `epV18ShowDetails`
- `epV19GenerateShield`
- `epV19ShowDetails`
- `esc`
- `getAssigns`
- `groupAssign`
- `groupLines`
- `isDevice`
- `k`
- `makeItem`
- `money`
- `patchButtons`
- `rcdName`
- `rcdPrice`
- `room`
- `showPreview`
- `toast`
- `val`

## `block-27.js`

- Size: **23486 bytes**
- Suggested target: **`public/js/02-shield-configurator.js`**
- Score: `202`
- Matched words: `shield, щит, cfg, automatic, автомат, УЗО, ДИФ, C16, C10, generateCascadePanel, epV20GenerateShield, epV19GenerateShield, контактор, rcd, dif, breaker`
- Second possible target: `public/js/05-ai-functions.js` / score `55`

### Main functions / exports
- `$`
- `activeMatDb`
- `add`
- `addUniqueAssign`
- `appPrice`
- `autoName`
- `autoPrice`
- `boot`
- `brandRu`
- `buildLines`
- `chk`
- `clean`
- `count`
- `currentEstimate`
- `currentShieldExtras`
- `curveNom`
- `dbFindAuto`
- `dbFindRcd`
- `directAdd`
- `epV18GenerateShield`
- `epV18ShowDetails`
- `epV19GenerateShield`
- `epV19ShowDetails`
- `epV20GenerateShield`
- `epV20ShowDetails`
- `esc`
- `generateCascadePanel`
- `getAssigns`
- `groupAssign`
- `groupNominals`
- `isDevice`
- `item`
- `k`
- `modelFromDbName`
- `money`
- `norm`
- `patchButtons`
- `presentGroups`
- `rcdName`
- `rcdPrice`
- `room`
- `showPreview`
- `text`
- `toast`
- `val`

## `block-28.js`

- Size: **15157 bytes**
- Suggested target: **`public/js/04-database.js`**
- Score: `130`
- Matched words: `db, материал, matDB, workDB, global_db, user_db, bulk, category, subcategory`
- Second possible target: `public/js/05-ai-functions.js` / score `24`

### Main functions / exports
- `$`
- `EP_FORCE_GLOBAL`
- `EP_GLOBAL_DB_VISIBLE_CACHE`
- `EP_GLOBAL_MAT`
- `EP_GLOBAL_WORK`
- `EP_MY_MAT`
- `EP_MY_WORK`
- `EP_ULTIMATE_DB_CACHE`
- `activeType`
- `arrLS`
- `boot`
- `clean`
- `clone`
- `ensureChecks`
- `ensurePanel`
- `epV18SetStatus`
- `epV21DeleteSelected`
- `epV21MoveSelected`
- `epV21SelectVisible`
- `epV21UpdateSubs`
- `esc`
- `fillSelectors`
- `getArr`
- `getServerCache`
- `groupOf`
- `hideOldBulk`
- `isAdmin`
- `matDB`
- `norm`
- `objLS`
- `openMatCatalog`
- `openWorkCatalog`
- `options`
- `panelHtml`
- `renderDbEditors`
- `rowId`
- `saveArr`
- `scope`
- `selected`
- `setArrLS`
- `setObjLS`
- `setStatus`
- `syncMain`
- `toast`
- `uid`
- `uniq`
- `userMatDB`
- `userWorkDB`
- `visibleHost`
- `workDB`

