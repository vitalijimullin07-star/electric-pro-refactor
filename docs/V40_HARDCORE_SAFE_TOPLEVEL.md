# V40 Hardcore Safe Top-Level

Исправленная хардкорная чистка `00-core.js`.

## Что важно

Предыдущая попытка могла зацепить кусок внутри объекта/строки. Эта версия удаляет только функции на верхнем уровне JS-файла.

## Удалено из 00-core.js

Всего top-level функций удалено: 114

- `handleGoogleAuth` → 01-visual.js, 04-database.js, 05-ai-functions.js, 07-settings.js, 10-estimate-views.js, auth.js
- `checkLocalPinUser` → 01-visual.js, 07-settings.js, 11-pdf-files.js, 12-documents.js, auth.js
- `showLoader` → 01-visual.js, 11-pdf-files.js, 12-documents.js, visual.js
- `hideLoader` → 01-visual.js, 11-pdf-files.js, 12-documents.js, visual.js
- `showToast` → 01-visual.js, 11-pdf-files.js, 12-documents.js, visual.js
- `loginWithPin` → 01-visual.js, 04-database.js, 05-ai-functions.js, 07-settings.js, 11-pdf-files.js, 12-documents.js, auth.js
- `confirmLogout` → 01-visual.js, 07-settings.js, auth.js
- `finishLoginSetup` → 01-visual.js, 04-database.js, 05-ai-functions.js, 07-settings.js, 10-estimate-views.js, 11-pdf-files.js, 12-documents.js, auth.js
- `openModal` → 01-visual.js, 04-database.js, 07-settings.js, 11-pdf-files.js, 12-documents.js, visual.js
- `closeModal` → 01-visual.js, 11-pdf-files.js, 12-documents.js, visual.js
- `toggleMenu` → 01-visual.js, 11-pdf-files.js, 12-documents.js, visual.js
- `changeTheme` → 01-visual.js, 07-settings.js, 11-pdf-files.js, 12-documents.js, settings.js
- `updateMasterBadge` → 01-visual.js, 07-settings.js, 11-pdf-files.js, 12-documents.js, customer.js
- `updateCoeffs` → 01-visual.js, 05-ai-functions.js, 11-pdf-files.js, 12-documents.js, settings.js
- `saveApiKey` → 01-visual.js, 04-database.js, 05-ai-functions.js, 07-settings.js, settings.js
- `saveQRs` → 01-visual.js, 05-ai-functions.js, 07-settings.js, 11-pdf-files.js, 12-documents.js, settings.js
- `fPrice` → 08-accounting.js, estimate.js
- `openSwapModal` → 01-visual.js, 04-database.js, 07-settings.js, 11-pdf-files.js, 12-documents.js, estimate.js
- `applySwap` → 01-visual.js, 04-database.js, 05-ai-functions.js, 10-estimate-views.js, 11-pdf-files.js, 12-documents.js, estimate.js
- `renderMainTable` → 01-visual.js, 02-shield-configurator.js, 05-ai-functions.js, 08-accounting.js, 10-estimate-views.js, 11-pdf-files.js, 12-documents.js, estimate.js
- `syncDraft` → 04-database.js, 05-ai-functions.js, 07-settings.js, 10-estimate-views.js, estimate.js
- `clearCurrentEstimate` → 01-visual.js, 05-ai-functions.js, 10-estimate-views.js, estimate.js
- `openMatCatalog` → 01-visual.js, 04-database.js, 11-pdf-files.js, 12-documents.js, database.js
- `openWorkCatalog` → 01-visual.js, 04-database.js, 07-settings.js, 10-estimate-views.js, 11-pdf-files.js, 12-documents.js, database.js
- `toggleCat` → 11-pdf-files.js, 12-documents.js, database.js
- `promptAdd` → 01-visual.js, 04-database.js, 05-ai-functions.js, 10-estimate-views.js, 11-pdf-files.js, 12-documents.js, database.js
- `confirmQtyAdd` → 01-visual.js, 02-shield-configurator.js, 10-estimate-views.js, 11-pdf-files.js, 12-documents.js, database.js
- `addAuto` → 01-visual.js, 02-shield-configurator.js, 05-ai-functions.js, 10-estimate-views.js, estimate.js
- `setPodr` → 03-socket-pool.js, 11-pdf-files.js, 12-documents.js, socket-pool.js
- `setH` → 03-socket-pool.js, 11-pdf-files.js, 12-documents.js, socket-pool.js
- `setP` → 03-socket-pool.js, 11-pdf-files.js, 12-documents.js, socket-pool.js
- `modM` → 01-visual.js, 03-socket-pool.js, socket-pool.js
- `upUI` → 02-shield-configurator.js, 11-pdf-files.js, 12-documents.js, socket-pool.js
- `addGrp` → 01-visual.js, 03-socket-pool.js, 10-estimate-views.js, 11-pdf-files.js, 12-documents.js, socket-pool.js
- `popPool` → 03-socket-pool.js, socket-pool.js
- `rfPool` → 02-shield-configurator.js, 03-socket-pool.js, 10-estimate-views.js, 11-pdf-files.js, 12-documents.js, socket-pool.js
- `applyPoolToEstimate` → 01-visual.js, 03-socket-pool.js, 04-database.js, 08-accounting.js, 10-estimate-views.js, 11-pdf-files.js, 12-documents.js, socket-pool.js
- `modV` → 02-shield-configurator.js, 11-pdf-files.js, 12-documents.js, shield-configurator.js
- `populateShieldExtras` → 02-shield-configurator.js, 04-database.js, 07-settings.js, 11-pdf-files.js, 12-documents.js, shield-configurator.js
- `addExtraToShieldConfig` → 01-visual.js, 02-shield-configurator.js, 04-database.js, 07-settings.js, 10-estimate-views.js, 11-pdf-files.js, 12-documents.js, shield-configurator.js
- `renderShieldExtras` → 01-visual.js, 02-shield-configurator.js, 07-settings.js, 11-pdf-files.js, 12-documents.js, shield-configurator.js
- `epAllDbItems` → 04-database.js, 07-settings.js, 10-estimate-views.js
- `epFindDbItem` → 04-database.js, 10-estimate-views.js
- `epV15BrandRu` → 02-shield-configurator.js
- `epV15BrandCode` → 02-shield-configurator.js
- `epV15CleanForName` → 02-shield-configurator.js
- `epV15DetectModel` → 02-shield-configurator.js, 05-ai-functions.js
- `epV15DetectNominal` → 02-shield-configurator.js
- `epV15DetectPoles` → 02-shield-configurator.js
- `epV15AmpFromNominal` → 02-shield-configurator.js
- `epV15FormatAutoName` → 02-shield-configurator.js, 05-ai-functions.js, 12-documents.js
- `epV15DetectLeakage` → 02-shield-configurator.js
- `epV15FormatRcdName` → 02-shield-configurator.js, 05-ai-functions.js, 12-documents.js
- `epV15DisplayMaterialName` → 02-shield-configurator.js, 12-documents.js
- `epV15MergeAssignments` → 02-shield-configurator.js, 04-database.js, 05-ai-functions.js, 10-estimate-views.js
- `epMat` → 02-shield-configurator.js, 04-database.js, 05-ai-functions.js, 08-accounting.js, 10-estimate-views.js
- `epWork` → 02-shield-configurator.js, 04-database.js, 05-ai-functions.js, 08-accounting.js, 10-estimate-views.js
- `epGetCheck` → 11-pdf-files.js, 12-documents.js
- `epGetVal` → 11-pdf-files.js, 12-documents.js
- `epAutoPrice` → 02-shield-configurator.js, 08-accounting.js
- `epDifPrice` → 02-shield-configurator.js, 08-accounting.js
- `generateCascadePanel` → 01-visual.js, 02-shield-configurator.js, 03-socket-pool.js, 04-database.js, 05-ai-functions.js, 07-settings.js, 08-accounting.js, 10-estimate-views.js, 12-documents.js, shield-configurator.js
- `runAiCheck` → 01-visual.js, 02-shield-configurator.js, 05-ai-functions.js, 07-settings.js, 08-accounting.js, 10-estimate-views.js, 11-pdf-files.js, 12-documents.js, ai.js
- `aiSupply` → 01-visual.js, 05-ai-functions.js, 07-settings.js, 08-accounting.js, 10-estimate-views.js, 11-pdf-files.js, 12-documents.js, ai.js
- `aiPueHelper` → 01-visual.js, 05-ai-functions.js, 07-settings.js, 08-accounting.js, 10-estimate-views.js, 11-pdf-files.js, 12-documents.js, ai.js
- `compareShopsAI` → 01-visual.js, 05-ai-functions.js, 07-settings.js, 08-accounting.js, 10-estimate-views.js, 11-pdf-files.js, 12-documents.js, ai.js
- `getPDFHeader` → 11-pdf-files.js, pdf-preview.js
- `categorizeEstimateItem` → 03-socket-pool.js, 10-estimate-views.js, pdf-preview.js
- `showPreview` → 01-visual.js, 02-shield-configurator.js, 03-socket-pool.js, 04-database.js, 05-ai-functions.js, 07-settings.js, 08-accounting.js, 10-estimate-views.js, 11-pdf-files.js, 12-documents.js, pdf-preview.js
- `refreshPreview` → 10-estimate-views.js, 11-pdf-files.js, pdf-preview.js
- `printAct` → 04-database.js, 07-settings.js, 10-estimate-views.js, 11-pdf-files.js, 12-documents.js, accounting.js
- `deleteAct` → 01-visual.js, 04-database.js, 05-ai-functions.js, 12-documents.js, accounting.js
- `togglePay` → 04-database.js, 08-accounting.js, 11-pdf-files.js, 12-documents.js, accounting.js
- `updatePayPrepay` → 04-database.js, 08-accounting.js, accounting.js
- `saveCust` → 01-visual.js, 07-settings.js, 11-pdf-files.js, 12-documents.js, customer.js
- `saveLogic` → 01-visual.js, 02-shield-configurator.js, 08-accounting.js, 11-pdf-files.js, 12-documents.js, settings.js
- `renderLogicUI` → 01-visual.js, 02-shield-configurator.js, 08-accounting.js, 11-pdf-files.js, 12-documents.js, settings.js
- `openRecalcModal` → 01-visual.js, 11-pdf-files.js, 12-documents.js, recalc-routes.js
- `updateRecalcUI` → 11-pdf-files.js, 12-documents.js, recalc-routes.js
- `doRecalculate` → 01-visual.js, 02-shield-configurator.js, 03-socket-pool.js, 04-database.js, 05-ai-functions.js, 08-accounting.js, 10-estimate-views.js, 11-pdf-files.js, 12-documents.js, recalc-routes.js
- `renderChart` → 01-visual.js, 03-socket-pool.js, 04-database.js, 05-ai-functions.js, 07-settings.js, 10-estimate-views.js, 11-pdf-files.js, 12-documents.js, accounting.js
- `updateBuhUI` → 04-database.js, 08-accounting.js, 10-estimate-views.js, 11-pdf-files.js, 12-documents.js, accounting.js
- `saveHist` → 01-visual.js, 04-database.js, 05-ai-functions.js, 07-settings.js, 08-accounting.js, 10-estimate-views.js, 11-pdf-files.js, 12-documents.js, accounting.js
- `updateHistList` → 04-database.js, 07-settings.js, 08-accounting.js, 10-estimate-views.js, 11-pdf-files.js, 12-documents.js, accounting.js
- `openObjCard` → 01-visual.js, 03-socket-pool.js, 04-database.js, 05-ai-functions.js, 07-settings.js, 08-accounting.js, 10-estimate-views.js, 11-pdf-files.js, 12-documents.js, accounting.js
- `closeObjCardAndReturn` → 01-visual.js, accounting.js
- `addExtraWork` → 01-visual.js, 04-database.js, 05-ai-functions.js, 08-accounting.js, 10-estimate-views.js, 11-pdf-files.js, 12-documents.js, accounting.js
- `loadCustHistoryOptions` → 07-settings.js, 11-pdf-files.js, 12-documents.js, accounting.js
- `switchDbTab` → 01-visual.js, 03-socket-pool.js, 04-database.js, 11-pdf-files.js, 12-documents.js, database.js
- `renderDbEditors` → 01-visual.js, 03-socket-pool.js, 04-database.js, 07-settings.js, 08-accounting.js, 10-estimate-views.js, 11-pdf-files.js, 12-documents.js, database.js
- `addDbItem` → 01-visual.js, 04-database.js, 05-ai-functions.js, 07-settings.js, 08-accounting.js, 10-estimate-views.js, 11-pdf-files.js, 12-documents.js, database.js
- `requestPriceChange` → 01-visual.js, 04-database.js, 05-ai-functions.js, 07-settings.js, 08-accounting.js, 10-estimate-views.js, 11-pdf-files.js, 12-documents.js, database.js
- `listenForApprovals` → 02-shield-configurator.js, 04-database.js, 05-ai-functions.js, 07-settings.js, 11-pdf-files.js, 12-documents.js, admin.js
- `approveUser` → 01-visual.js, 05-ai-functions.js, 07-settings.js, admin.js
- `loadMasterDrafts` → 04-database.js, 05-ai-functions.js, 07-settings.js, 10-estimate-views.js, 11-pdf-files.js, 12-documents.js, admin.js
- `openAdminDraftView` → 01-visual.js, 07-settings.js, 08-accounting.js, 10-estimate-views.js, 11-pdf-files.js, 12-documents.js, admin.js
- `renderAdminUsers` → 01-visual.js, 02-shield-configurator.js, 04-database.js, 05-ai-functions.js, 07-settings.js, 11-pdf-files.js, 12-documents.js, admin.js
- `adminAddUser` → 01-visual.js, 05-ai-functions.js, 07-settings.js, 11-pdf-files.js, 12-documents.js, admin.js
- `deleteUser` → 01-visual.js, 04-database.js, 05-ai-functions.js, 07-settings.js, admin.js
- `renderItem` → 01-visual.js, 02-shield-configurator.js, 04-database.js, 07-settings.js, 10-estimate-views.js
- `lookupKey` → 02-shield-configurator.js
- `reqName` → 02-shield-configurator.js
- `smartFindMat` → 02-shield-configurator.js, 04-database.js, 05-ai-functions.js, 10-estimate-views.js
- `canonicalName` → 02-shield-configurator.js
- `mergeEstimate` → 05-ai-functions.js, 10-estimate-views.js
- `boot` → 01-visual.js, 04-database.js, 05-ai-functions.js, 07-settings.js, 10-estimate-views.js, 12-documents.js
- `renderGlobalModalFixed` → 01-visual.js, 04-database.js, 12-documents.js
- `classify` → 02-shield-configurator.js, 03-socket-pool.js, 04-database.js, 07-settings.js, 12-documents.js
- `sameSwapClass` → 02-shield-configurator.js
- `upsertLocal` → 04-database.js
- `unhide` → 01-visual.js
- `deleteToolbar` → 02-shield-configurator.js, 04-database.js, 07-settings.js, 08-accounting.js, 10-estimate-views.js
- `classify` → 02-shield-configurator.js, 03-socket-pool.js, 04-database.js, 07-settings.js, 12-documents.js
- `sameClass` → 02-shield-configurator.js, 04-database.js

## Откат

```bash
git reset --hard v39-before-hardcore-v40
npx -y firebase-tools deploy --only hosting --project electric-pro-test
```
