# V45 Core Remaining Map After V44

Свежая карта остатка `public/js/00-core.js` после V44.

## Размер файла

- строк: `8924`
- байт: `679035`
- оставшихся function/async function: `737`
- window.* присваиваний: `475`
- moved markers: `118`

## Остаток функций по предполагаемым модулям

- `04-database.js` — `213`
- `unknown` — `100`
- `02-shield-configurator.js` — `82`
- `10-estimate-views.js` — `81`
- `05-ai-functions.js` — `59`
- `03-socket-pool.js` — `55`
- `01-visual.js` — `45`
- `12-documents.js` — `37`
- `07-settings.js` — `24`
- `08-accounting.js` — `20`
- `11-pdf-files.js` — `16`
- `06-single-line-scheme.js` — `5`

## Window-привязки по предполагаемым модулям

- `04-database.js` — `302`
- `10-estimate-views.js` — `45`
- `01-visual.js` — `38`
- `02-shield-configurator.js` — `25`
- `05-ai-functions.js` — `23`
- `12-documents.js` — `17`
- `11-pdf-files.js` — `13`
- `07-settings.js` — `10`
- `03-socket-pool.js` — `2`

## Самые большие оставшиеся функции

| Строка | Функция | Куда похоже | Размер |
|---:|---|---|---:|
| 497 | `epEscape` | `05-ai-functions.js` | 133865 |
| 6895 | `esc` | `05-ai-functions.js` | 53443 |
| 8157 | `esc` | `07-settings.js` | 49732 |
| 6347 | `esc` | `07-settings.js` | 46777 |
| 8016 | `esc` | `02-shield-configurator.js` | 44730 |
| 7419 | `esc` | `02-shield-configurator.js` | 41564 |
| 3956 | `esc` | `04-database.js` | 38477 |
| 7804 | `esc` | `02-shield-configurator.js` | 31431 |
| 3518 | `esc` | `04-database.js` | 30512 |
| 2722 | `safeHtml` | `04-database.js` | 28051 |
| 6662 | `esc` | `07-settings.js` | 27184 |
| 5586 | `esc` | `10-estimate-views.js` | 25041 |
| 1940 | `epEsc` | `04-database.js` | 24117 |
| 3204 | `safe` | `04-database.js` | 22239 |
| 8566 | `esc` | `04-database.js` | 18964 |
| 2562 | `safe` | `04-database.js` | 18068 |
| 8411 | `esc` | `02-shield-configurator.js` | 16355 |
| 4466 | `esc` | `07-settings.js` | 15149 |
| 7805 | `epV16GenerateCascadePanel` | `02-shield-configurator.js` | 13512 |
| 6076 | `esc` | `07-settings.js` | 10546 |
| 2238 | `safeText` | `02-shield-configurator.js` | 8033 |
| 4098 | `renderItems` | `04-database.js` | 3631 |
| 3631 | `renderList` | `04-database.js` | 3621 |
| 2792 | `normalizeDbItem` | `02-shield-configurator.js` | 3553 |
| 1356 | `epExtractItemsFromSheetRows` | `10-estimate-views.js` | 3304 |
| 790 | `epLoadAiConfigFromServer` | `05-ai-functions.js` | 3235 |
| 5846 | `renderReviewPage` | `10-estimate-views.js` | 3102 |
| 2019 | `epRenderGroupedList` | `03-socket-pool.js` | 3049 |
| 2575 | `normalizeMaterialDb` | `02-shield-configurator.js` | 2921 |
| 4702 | `editorTop` | `08-accounting.js` | 2726 |
| 6161 | `renderPanel` | `04-database.js` | 2680 |
| 2941 | `strictFindMaterial` | `02-shield-configurator.js` | 2582 |
| 5000 | `autoGroupMaterial` | `02-shield-configurator.js` | 2557 |
| 3316 | `groupHtml` | `03-socket-pool.js` | 2526 |
| 622 | `epPatchSettingsUI` | `05-ai-functions.js` | 2497 |
| 1481 | `epAiNormalizeImage` | `05-ai-functions.js` | 2477 |
| 5022 | `autoGroupWork` | `03-socket-pool.js` | 2417 |
| 1426 | `epReadDbFile` | `04-database.js` | 2370 |
| 2347 | `epRenderGrouped` | `04-database.js` | 2320 |
| 4594 | `epLoadDbFromServer` | `04-database.js` | 2312 |

## Все оставшиеся функции

| Строка | Функция | Куда похоже | Score | Размер |
|---:|---|---|---:|---:|
| 292 | `epNormText` | `unknown` | 0 | 125 |
| 488 | `epCleanText` | `unknown` | 0 | 96 |
| 492 | `epMoney` | `08-accounting.js` | 2 | 154 |
| 497 | `epEscape` | `05-ai-functions.js` | 28 | 133865 |
| 503 | `epNormProvider` | `05-ai-functions.js` | 4 | 87 |
| 507 | `epCurrentProvider` | `10-estimate-views.js` | 5 | 139 |
| 511 | `epCurrentKey` | `05-ai-functions.js` | 8 | 315 |
| 517 | `epSetAiProvider` | `10-estimate-views.js` | 12 | 505 |
| 532 | `epRefreshProviderUI` | `05-ai-functions.js` | 13 | 826 |
| 554 | `epInsertMainProviderSwitch` | `05-ai-functions.js` | 24 | 873 |
| 577 | `epMakeAiMenuGroup` | `05-ai-functions.js` | 19 | 1248 |
| 609 | `epAddBetaLabels` | `03-socket-pool.js` | 7 | 658 |
| 622 | `epPatchSettingsUI` | `05-ai-functions.js` | 19 | 2497 |
| 676 | `epTestProviderKey` | `05-ai-functions.js` | 18 | 1415 |
| 790 | `epLoadAiConfigFromServer` | `05-ai-functions.js` | 34 | 3235 |
| 857 | `epCallGemini` | `05-ai-functions.js` | 9 | 1134 |
| 878 | `epExtractOpenAiText` | `05-ai-functions.js` | 4 | 391 |
| 890 | `epCallOpenAI` | `05-ai-functions.js` | 40 | 1192 |
| 919 | `epAskAI` | `05-ai-functions.js` | 13 | 269 |
| 928 | `epStripCode` | `unknown` | 0 | 215 |
| 932 | `epTryJsonParseLoose` | `05-ai-functions.js` | 2 | 192 |
| 949 | `epParseLooseTableText` | `06-single-line-scheme.js` | 8 | 1493 |
| 974 | `epExtractJsonObjectsLoose` | `12-documents.js` | 2 | 1006 |
| 1003 | `epParseJsonArray` | `05-ai-functions.js` | 13 | 699 |
| 1083 | `epDbTypeLabel` | `04-database.js` | 5 | 81 |
| 1084 | `epCurrentDb` | `04-database.js` | 8 | 71 |
| 1085 | `epSetCurrentDb` | `04-database.js` | 8 | 91 |
| 1087 | `epInferCategory` | `03-socket-pool.js` | 10 | 1091 |
| 1106 | `epInferSubcategory` | `03-socket-pool.js` | 14 | 1733 |
| 1139 | `epNormalizeItems` | `04-database.js` | 18 | 2264 |
| 1185 | `epSaveUserDb` | `04-database.js` | 27 | 658 |
| 1203 | `epSaveGlobalDb` | `04-database.js` | 16 | 214 |
| 1208 | `epLoadUserDbAfterLogin` | `04-database.js` | 34 | 985 |
| 1237 | `epInsertDbTools` | `04-database.js` | 22 | 1159 |
| 1282 | `epReadFileAsText` | `11-pdf-files.js` | 5 | 270 |
| 1291 | `epReadFileAsDataURL` | `11-pdf-files.js` | 5 | 276 |
| 1300 | `epReadFileAsArrayBuffer` | `11-pdf-files.js` | 5 | 284 |
| 1311 | `epIsEmptyCell` | `unknown` | 0 | 106 |
| 1315 | `epCleanCell` | `unknown` | 0 | 131 |
| 1319 | `epIsUnitCell` | `unknown` | 0 | 204 |
| 1324 | `epNormalizeUnit` | `unknown` | 0 | 285 |
| 1333 | `epIsNumberLikeCell` | `unknown` | 0 | 199 |
| 1340 | `epLooksLikeCodeOrNumber` | `unknown` | 0 | 355 |
| 1350 | `epTitleCaseRu` | `unknown` | 0 | 183 |
| 1356 | `epExtractItemsFromSheetRows` | `10-estimate-views.js` | 15 | 3304 |
| 1426 | `epReadDbFile` | `04-database.js` | 14 | 2370 |
| 1481 | `epAiNormalizeImage` | `05-ai-functions.js` | 16 | 2477 |
| 1524 | `epAiNormalizeDbText` | `05-ai-functions.js` | 16 | 1176 |
| 1545 | `epShowDbReview` | `04-database.js` | 14 | 2143 |
| 1574 | `epGetReviewedSelected` | `12-documents.js` | 12 | 934 |
| 1590 | `epSameItem` | `10-estimate-views.js` | 2 | 299 |
| 1596 | `epSendDbProposal` | `04-database.js` | 9 | 586 |
| 1645 | `epDownloadJson` | `11-pdf-files.js` | 7 | 422 |
| 1795 | `epInsertAdminProposalBox` | `04-database.js` | 6 | 671 |
| 1807 | `epListenDbProposals` | `04-database.js` | 18 | 1964 |
| 1893 | `epInitialApply` | `07-settings.js` | 6 | 360 |
| 1940 | `epEsc` | `04-database.js` | 17 | 24117 |
| 1941 | `epId` | `unknown` | 0 | 77 |
| 1942 | `epArr` | `04-database.js` | 6 | 65 |
| 1943 | `epSetArr` | `04-database.js` | 6 | 85 |
| 1944 | `epClean` | `unknown` | 0 | 68 |
| 1945 | `epSame` | `unknown` | 0 | 312 |
| 1951 | `epMaterialFromName` | `04-database.js` | 4 | 289 |
| 1956 | `epOpFromName` | `03-socket-pool.js` | 4 | 274 |
| 1961 | `epNormalizeWorkItem` | `03-socket-pool.js` | 7 | 1244 |
| 1984 | `epDisplayWorkName` | `04-database.js` | 2 | 247 |
| 1990 | `epEstimateCopy` | `04-database.js` | 2 | 169 |
| 1995 | `epMergeFullWorksInto` | `04-database.js` | 8 | 301 |
| 2003 | `epNormalizeAllWorkDb` | `04-database.js` | 20 | 207 |
| 2007 | `epGroupCatalog` | `04-database.js` | 3 | 494 |
| 2019 | `epRenderGroupedList` | `03-socket-pool.js` | 3 | 3049 |
| 2078 | `epGetGlobalDb` | `04-database.js` | 74 | 841 |
| 2093 | `epRenderGlobalDbModal` | `04-database.js` | 20 | 625 |
| 2112 | `epInsertGlobalDbButton` | `12-documents.js` | 8 | 604 |
| 2126 | `epEnsureProposalBox` | `04-database.js` | 8 | 753 |
| 2136 | `epProposalItemName` | `04-database.js` | 2 | 114 |
| 2137 | `epRenderProposalList` | `04-database.js` | 14 | 1288 |
| 2206 | `epStartProposalV2` | `04-database.js` | 12 | 688 |
| 2216 | `epInitFullWorksPatch` | `04-database.js` | 13 | 180 |
| 2237 | `qs` | `12-documents.js` | 2 | 54 |
| 2238 | `safeText` | `02-shield-configurator.js` | 11 | 8033 |
| 2239 | `norm` | `unknown` | 0 | 112 |
| 2240 | `uniq` | `unknown` | 0 | 70 |
| 2241 | `getVal` | `unknown` | 0 | 70 |
| 2242 | `getCheck` | `unknown` | 0 | 68 |
| 2243 | `toNum` | `unknown` | 0 | 86 |
| 2245 | `getCfgCount` | `02-shield-configurator.js` | 5 | 274 |
| 2252 | `epMoveShieldSettingsIntoDetails` | `02-shield-configurator.js` | 20 | 1477 |
| 2287 | `epMatGroupName` | `02-shield-configurator.js` | 15 | 2221 |
| 2317 | `epNormalizeMaterialsDb` | `04-database.js` | 14 | 730 |
| 2318 | `fixArr` | `03-socket-pool.js` | 7 | 547 |
| 2333 | `epGroupedData` | `03-socket-pool.js` | 2 | 545 |
| 2347 | `epRenderGrouped` | `04-database.js` | 7 | 2320 |
| 2385 | `epPatchDbRenderers` | `04-database.js` | 46 | 1285 |
| 2400 | `epAllDbItems` | `04-database.js` | 14 | 248 |
| 2405 | `epFindItem` | `10-estimate-views.js` | 3 | 542 |
| 2416 | `epMat` | `04-database.js` | 11 | 570 |
| 2424 | `epWork` | `04-database.js` | 5 | 392 |
| 2447 | `addLine` | `03-socket-pool.js` | 4 | 211 |
| 2448 | `addRoom` | `02-shield-configurator.js` | 2 | 231 |
| 2467 | `addProtection` | `03-socket-pool.js` | 4 | 174 |
| 2472 | `autoPrice` | `02-shield-configurator.js` | 3 | 59 |
| 2473 | `difPrice` | `02-shield-configurator.js` | 3 | 60 |
| 2535 | `epPatchGenerateButton` | `02-shield-configurator.js` | 4 | 280 |
| 2540 | `boot` | `04-database.js` | 4 | 126 |
| 2560 | `qs` | `12-documents.js` | 2 | 54 |
| 2561 | `toast` | `01-visual.js` | 4 | 89 |
| 2562 | `safe` | `04-database.js` | 27 | 18068 |
| 2563 | `norm` | `unknown` | 0 | 202 |
| 2564 | `dbArr` | `04-database.js` | 12 | 160 |
| 2567 | `setDbArr` | `04-database.js` | 12 | 174 |
| 2570 | `detectBrand` | `unknown` | 0 | 171 |
| 2571 | `detectNominal` | `unknown` | 0 | 153 |
| 2572 | `getGroup` | `03-socket-pool.js` | 3 | 82 |
| 2573 | `setGroup` | `03-socket-pool.js` | 2 | 64 |
| 2575 | `normalizeMaterialDb` | `02-shield-configurator.js` | 18 | 2921 |
| 2602 | `renderGrouped` | `03-socket-pool.js` | 8 | 1316 |
| 2721 | `qs` | `12-documents.js` | 2 | 54 |
| 2722 | `safeHtml` | `04-database.js` | 25 | 28051 |
| 2727 | `norm` | `unknown` | 0 | 196 |
| 2737 | `arrByType` | `04-database.js` | 19 | 541 |
| 2754 | `setArrByType` | `04-database.js` | 6 | 138 |
| 2761 | `detectBrand` | `unknown` | 0 | 381 |
| 2770 | `detectNominal` | `unknown` | 0 | 163 |
| 2775 | `detectLeakage` | `unknown` | 0 | 123 |
| 2779 | `detectRcdType` | `02-shield-configurator.js` | 2 | 293 |
| 2792 | `normalizeDbItem` | `02-shield-configurator.js` | 12 | 3553 |
| 2850 | `normalizeDbs` | `04-database.js` | 11 | 267 |
| 2857 | `renderGroupedFixed` | `04-database.js` | 10 | 2109 |
| 2921 | `reqDisplayName` | `02-shield-configurator.js` | 15 | 948 |
| 2941 | `strictFindMaterial` | `02-shield-configurator.js` | 21 | 2582 |
| 3033 | `cleanCanonicalName` | `02-shield-configurator.js` | 8 | 750 |
| 3045 | `lineFromRaw` | `02-shield-configurator.js` | 7 | 686 |
| 3060 | `mergeEstimateFixed` | `10-estimate-views.js` | 9 | 1242 |
| 3108 | `shieldRowsForDetails` | `10-estimate-views.js` | 21 | 1224 |
| 3139 | `detailNote` | `02-shield-configurator.js` | 7 | 441 |
| 3202 | `qs` | `12-documents.js` | 2 | 54 |
| 3203 | `toast` | `01-visual.js` | 5 | 91 |
| 3204 | `safe` | `04-database.js` | 27 | 22239 |
| 3209 | `norm` | `unknown` | 0 | 246 |
| 3221 | `localArr` | `04-database.js` | 19 | 450 |
| 3230 | `setLocalArr` | `04-database.js` | 6 | 121 |
| 3234 | `getGroup` | `03-socket-pool.js` | 3 | 92 |
| 3235 | `itemKey` | `10-estimate-views.js` | 2 | 194 |
| 3240 | `sigKey` | `03-socket-pool.js` | 1 | 147 |
| 3243 | `deletedSet` | `04-database.js` | 2 | 237 |
| 3249 | `saveLocalDb` | `04-database.js` | 25 | 839 |
| 3275 | `loadGlobalDb` | `04-database.js` | 48 | 880 |
| 3296 | `mergedArr` | `04-database.js` | 8 | 771 |
| 3316 | `groupHtml` | `03-socket-pool.js` | 3 | 2526 |
| 3444 | `swapLabel` | `unknown` | 0 | 155 |
| 3516 | `qs` | `12-documents.js` | 2 | 54 |
| 3517 | `msg` | `01-visual.js` | 3 | 83 |
| 3518 | `esc` | `04-database.js` | 31 | 30512 |
| 3523 | `clean` | `unknown` | 0 | 247 |
| 3534 | `groupOf` | `03-socket-pool.js` | 3 | 91 |
| 3535 | `localDb` | `04-database.js` | 21 | 449 |
| 3544 | `setLocalDb` | `04-database.js` | 8 | 120 |
| 3547 | `idKey` | `unknown` | 0 | 70 |
| 3548 | `sigKey` | `03-socket-pool.js` | 1 | 146 |
| 3551 | `delStorageKey` | `04-database.js` | 2 | 120 |
| 3552 | `deletedSet` | `05-ai-functions.js` | 1 | 149 |
| 3555 | `saveDeleted` | `10-estimate-views.js` | 1 | 132 |
| 3558 | `clearDeletedFor` | `unknown` | 0 | 302 |
| 3566 | `saveMyDb` | `04-database.js` | 32 | 872 |
| 3591 | `loadGlobal` | `04-database.js` | 55 | 1001 |
| 3612 | `merged` | `04-database.js` | 7 | 717 |
| 3631 | `renderList` | `04-database.js` | 4 | 3621 |
| 3779 | `toolbar` | `08-accounting.js` | 7 | 1050 |
| 3860 | `classify` | `02-shield-configurator.js` | 26 | 1739 |
| 3889 | `sameClass` | `02-shield-configurator.js` | 4 | 351 |
| 3954 | `$` | `12-documents.js` | 2 | 53 |
| 3955 | `toast` | `01-visual.js` | 5 | 85 |
| 3956 | `esc` | `04-database.js` | 11 | 38477 |
| 3961 | `norm` | `unknown` | 0 | 246 |
| 3972 | `encodeItem` | `10-estimate-views.js` | 2 | 116 |
| 3975 | `decodeItem` | `10-estimate-views.js` | 2 | 114 |
| 3978 | `groupOf` | `03-socket-pool.js` | 3 | 91 |
| 3979 | `sig` | `03-socket-pool.js` | 1 | 142 |
| 3982 | `idkey` | `unknown` | 0 | 70 |
| 3983 | `delKey` | `04-database.js` | 2 | 113 |
| 3984 | `delSet` | `05-ai-functions.js` | 1 | 140 |
| 3987 | `saveDel` | `10-estimate-views.js` | 1 | 123 |
| 3990 | `localDb` | `04-database.js` | 21 | 449 |
| 3999 | `setLocalDb` | `04-database.js` | 8 | 122 |
| 4002 | `stripRuntime` | `unknown` | 0 | 129 |
| 4011 | `saveMyDb` | `04-database.js` | 32 | 880 |
| 4034 | `loadCachedGlobalFromStorage` | `04-database.js` | 20 | 440 |
| 4048 | `readGlobal` | `04-database.js` | 46 | 1132 |
| 4079 | `merged` | `04-database.js` | 9 | 717 |
| 4098 | `renderItems` | `04-database.js` | 3 | 3631 |
| 4157 | `makeLocalCopy` | `unknown` | 0 | 341 |
| 4464 | `$` | `12-documents.js` | 2 | 53 |
| 4465 | `toast` | `01-visual.js` | 5 | 85 |
| 4466 | `esc` | `07-settings.js` | 7 | 15149 |
| 4467 | `cleanText` | `unknown` | 0 | 153 |
| 4468 | `clone` | `unknown` | 0 | 100 |
| 4469 | `arrLS` | `05-ai-functions.js` | 1 | 128 |
| 4470 | `objLS` | `05-ai-functions.js` | 1 | 142 |
| 4471 | `setLS` | `10-estimate-views.js` | 1 | 159 |
| 4472 | `setObjLS` | `10-estimate-views.js` | 1 | 90 |
| 4473 | `cleanMode` | `10-estimate-views.js` | 1 | 70 |
| 4474 | `scope` | `10-estimate-views.js` | 1 | 89 |
| 4475 | `activeLabel` | `12-documents.js` | 2 | 86 |
| 4476 | `uid` | `01-visual.js` | 4 | 96 |
| 4477 | `isAdmin` | `07-settings.js` | 5 | 97 |
| 4478 | `groupOf` | `03-socket-pool.js` | 3 | 91 |
| 4479 | `sig` | `03-socket-pool.js` | 1 | 132 |
| 4480 | `enc` | `unknown` | 0 | 102 |
| 4481 | `dec` | `05-ai-functions.js` | 1 | 99 |
| 4483 | `unique` | `unknown` | 0 | 254 |
| 4496 | `myArr` | `04-database.js` | 2 | 70 |
| 4497 | `serverArr` | `04-database.js` | 2 | 82 |
| 4498 | `activeArr` | `12-documents.js` | 2 | 86 |
| 4500 | `syncWindowCaches` | `04-database.js` | 43 | 739 |
| 4516 | `saveMyLocal` | `04-database.js` | 5 | 315 |
| 4526 | `saveServerLocal` | `04-database.js` | 9 | 339 |
| 4534 | `setActiveDb` | `04-database.js` | 2 | 135 |
| 4539 | `upsert` | `02-shield-configurator.js` | 1 | 439 |
| 4549 | `epSaveMyDbToServer` | `04-database.js` | 14 | 471 |
| 4564 | `epSaveServerDbToServer` | `04-database.js` | 14 | 411 |
| 4577 | `epSendServerProposal` | `04-database.js` | 9 | 563 |
| 4594 | `epLoadDbFromServer` | `04-database.js` | 56 | 2312 |
| 4646 | `sourceSwitcherHtml` | `04-database.js` | 9 | 1033 |
| 4659 | `renderCatalog` | `10-estimate-views.js` | 4 | 1509 |
| 4681 | `catalogRow` | `10-estimate-views.js` | 10 | 835 |
| 4702 | `editorTop` | `08-accounting.js` | 8 | 2726 |
| 4728 | `renderDbRows` | `04-database.js` | 8 | 1318 |
| 4751 | `editorRow` | `10-estimate-views.js` | 10 | 1052 |
| 4874 | `reviewedItems` | `04-database.js` | 11 | 1019 |
| 4910 | `downloadJson` | `11-pdf-files.js` | 7 | 359 |
| 4936 | `localFullCleanOnly` | `04-database.js` | 8 | 466 |
| 4957 | `commitCollection` | `04-database.js` | 10 | 645 |
| 5000 | `autoGroupMaterial` | `02-shield-configurator.js` | 16 | 2557 |
| 5022 | `autoGroupWork` | `03-socket-pool.js` | 13 | 2417 |
| 5049 | `serverModalRow` | `10-estimate-views.js` | 7 | 490 |
| 5054 | `renderServerModalList` | `10-estimate-views.js` | 4 | 1194 |
| 5102 | `epRefreshDbScopeUi` | `04-database.js` | 6 | 683 |
| 5110 | `install` | `04-database.js` | 9 | 354 |
| 5153 | `$` | `12-documents.js` | 2 | 53 |
| 5154 | `msg` | `01-visual.js` | 3 | 83 |
| 5155 | `isAdmin` | `07-settings.js` | 5 | 108 |
| 5156 | `uid` | `01-visual.js` | 3 | 92 |
| 5157 | `scope` | `10-estimate-views.js` | 1 | 120 |
| 5158 | `setScope` | `10-estimate-views.js` | 1 | 106 |
| 5159 | `readArr` | `05-ai-functions.js` | 1 | 138 |
| 5160 | `writeArr` | `10-estimate-views.js` | 2 | 237 |
| 5161 | `readObj` | `05-ai-functions.js` | 1 | 148 |
| 5162 | `writeObj` | `10-estimate-views.js` | 1 | 92 |
| 5163 | `clean` | `unknown` | 0 | 149 |
| 5164 | `groupOf` | `03-socket-pool.js` | 3 | 91 |
| 5165 | `clone` | `unknown` | 0 | 104 |
| 5166 | `sig` | `03-socket-pool.js` | 1 | 128 |
| 5167 | `activeTarget` | `12-documents.js` | 2 | 88 |
| 5169 | `getMy` | `04-database.js` | 4 | 223 |
| 5174 | `getServer` | `04-database.js` | 8 | 292 |
| 5181 | `setMy` | `04-database.js` | 11 | 378 |
| 5189 | `setServer` | `04-database.js` | 32 | 605 |
| 5202 | `syncMainArrays` | `04-database.js` | 32 | 456 |
| 5216 | `unique` | `04-database.js` | 1 | 469 |
| 5231 | `upsert` | `02-shield-configurator.js` | 1 | 653 |
| 5243 | `reviewedItems` | `04-database.js` | 21 | 1173 |
| 5267 | `saveMyRemote` | `04-database.js` | 12 | 527 |
| 5283 | `saveServerRemote` | `04-database.js` | 12 | 426 |
| 5296 | `rerender` | `04-database.js` | 22 | 553 |
| 5382 | `$` | `12-documents.js` | 2 | 53 |
| 5383 | `toast` | `01-visual.js` | 4 | 91 |
| 5384 | `uid` | `01-visual.js` | 3 | 92 |
| 5385 | `isAdmin` | `07-settings.js` | 5 | 108 |
| 5386 | `setScope` | `10-estimate-views.js` | 1 | 106 |
| 5387 | `getScope` | `10-estimate-views.js` | 1 | 123 |
| 5388 | `label` | `unknown` | 0 | 85 |
| 5389 | `readArr` | `05-ai-functions.js` | 1 | 138 |
| 5390 | `writeArr` | `10-estimate-views.js` | 2 | 237 |
| 5391 | `readObj` | `05-ai-functions.js` | 1 | 148 |
| 5392 | `writeObj` | `10-estimate-views.js` | 1 | 92 |
| 5393 | `clean` | `unknown` | 0 | 149 |
| 5394 | `groupOf` | `03-socket-pool.js` | 3 | 91 |
| 5395 | `clone` | `unknown` | 0 | 104 |
| 5396 | `sig` | `03-socket-pool.js` | 1 | 128 |
| 5397 | `unique` | `unknown` | 0 | 344 |
| 5411 | `getServerFromCache` | `04-database.js` | 6 | 164 |
| 5416 | `setMyArrays` | `04-database.js` | 14 | 288 |
| 5426 | `setServerArrays` | `04-database.js` | 33 | 463 |
| 5436 | `syncActiveArrays` | `04-database.js` | 36 | 848 |
| 5453 | `refreshMyFromServer` | `04-database.js` | 22 | 621 |
| 5468 | `refreshServerFromServer` | `04-database.js` | 32 | 955 |
| 5486 | `isVisible` | `unknown` | 0 | 119 |
| 5487 | `updateButtons` | `04-database.js` | 7 | 880 |
| 5498 | `rerenderOpenScreens` | `04-database.js` | 18 | 739 |
| 5575 | `$` | `12-documents.js` | 2 | 53 |
| 5576 | `toast` | `01-visual.js` | 4 | 125 |
| 5577 | `uid` | `01-visual.js` | 3 | 92 |
| 5578 | `isAdmin` | `07-settings.js` | 5 | 108 |
| 5579 | `setScope` | `10-estimate-views.js` | 1 | 106 |
| 5580 | `getScope` | `10-estimate-views.js` | 1 | 123 |
| 5581 | `hardHideLoader` | `01-visual.js` | 5 | 185 |
| 5585 | `showReadLoader` | `01-visual.js` | 4 | 142 |
| 5586 | `esc` | `10-estimate-views.js` | 5 | 25041 |
| 5587 | `cleanText` | `unknown` | 0 | 86 |
| 5588 | `money` | `08-accounting.js` | 2 | 141 |
| 5589 | `norm` | `unknown` | 0 | 148 |
| 5590 | `readArr` | `05-ai-functions.js` | 1 | 138 |
| 5591 | `writeArr` | `10-estimate-views.js` | 2 | 237 |
| 5592 | `readObj` | `05-ai-functions.js` | 1 | 148 |
| 5593 | `writeObj` | `10-estimate-views.js` | 1 | 92 |
| 5594 | `groupOf` | `03-socket-pool.js` | 3 | 91 |
| 5595 | `clone` | `unknown` | 0 | 104 |
| 5596 | `sig` | `03-socket-pool.js` | 1 | 127 |
| 5597 | `unique` | `04-database.js` | 1 | 469 |
| 5612 | `getMy` | `04-database.js` | 4 | 216 |
| 5617 | `getServer` | `04-database.js` | 8 | 292 |
| 5624 | `syncMainArrays` | `04-database.js` | 22 | 379 |
| 5637 | `setMy` | `04-database.js` | 11 | 378 |
| 5645 | `setServer` | `04-database.js` | 32 | 605 |
| 5658 | `upsert` | `02-shield-configurator.js` | 1 | 538 |
| 5669 | `saveMyRemote` | `04-database.js` | 12 | 527 |
| 5685 | `saveServerRemote` | `04-database.js` | 12 | 426 |
| 5698 | `rerender` | `04-database.js` | 22 | 553 |
| 5705 | `fileText` | `11-pdf-files.js` | 5 | 200 |
| 5706 | `fileBuffer` | `11-pdf-files.js` | 5 | 195 |
| 5707 | `csvRows` | `06-single-line-scheme.js` | 7 | 657 |
| 5723 | `inferCat` | `02-shield-configurator.js` | 14 | 970 |
| 5741 | `inferSub` | `02-shield-configurator.js` | 13 | 970 |
| 5765 | `normItem` | `04-database.js` | 4 | 855 |
| 5775 | `rowsToItems` | `10-estimate-views.js` | 22 | 2232 |
| 5778 | `cell` | `10-estimate-views.js` | 2 | 57 |
| 5813 | `jsonToItems` | `04-database.js` | 11 | 542 |
| 5822 | `selectedCount` | `04-database.js` | 1 | 171 |
| 5826 | `saveVisibleEdits` | `10-estimate-views.js` | 9 | 755 |
| 5846 | `renderReviewPage` | `10-estimate-views.js` | 12 | 3102 |
| 5896 | `showReview` | `10-estimate-views.js` | 8 | 614 |
| 5907 | `aiFromImage` | `05-ai-functions.js` | 20 | 829 |
| 5917 | `aiFromText` | `05-ai-functions.js` | 14 | 611 |
| 5926 | `readDbFileV6` | `10-estimate-views.js` | 23 | 1498 |
| 5991 | `collectReviewed` | `04-database.js` | 12 | 710 |
| 6074 | `$` | `12-documents.js` | 2 | 53 |
| 6075 | `toast` | `01-visual.js` | 4 | 123 |
| 6076 | `esc` | `07-settings.js` | 7 | 10546 |
| 6077 | `norm` | `unknown` | 0 | 146 |
| 6078 | `cleanText` | `unknown` | 0 | 80 |
| 6079 | `money` | `08-accounting.js` | 2 | 128 |
| 6080 | `uid` | `01-visual.js` | 3 | 84 |
| 6081 | `isAdmin` | `07-settings.js` | 5 | 102 |
| 6082 | `scope` | `10-estimate-views.js` | 1 | 110 |
| 6083 | `setScope` | `10-estimate-views.js` | 1 | 98 |
| 6084 | `label` | `unknown` | 0 | 76 |
| 6085 | `canEditActive` | `12-documents.js` | 2 | 87 |
| 6086 | `readArr` | `05-ai-functions.js` | 1 | 125 |
| 6087 | `writeArr` | `10-estimate-views.js` | 2 | 224 |
| 6088 | `readObj` | `05-ai-functions.js` | 1 | 131 |
| 6089 | `writeObj` | `10-estimate-views.js` | 1 | 87 |
| 6090 | `groupOf` | `03-socket-pool.js` | 3 | 81 |
| 6091 | `clone` | `unknown` | 0 | 99 |
| 6092 | `sig` | `03-socket-pool.js` | 1 | 114 |
| 6093 | `unique` | `04-database.js` | 1 | 355 |
| 6094 | `getMy` | `04-database.js` | 4 | 158 |
| 6095 | `getServer` | `04-database.js` | 8 | 229 |
| 6096 | `active` | `12-documents.js` | 2 | 79 |
| 6097 | `setMy` | `04-database.js` | 10 | 261 |
| 6098 | `setServer` | `04-database.js` | 32 | 504 |
| 6099 | `syncMain` | `04-database.js` | 17 | 251 |
| 6100 | `upsert` | `02-shield-configurator.js` | 1 | 511 |
| 6102 | `ensureProgress` | `10-estimate-views.js` | 11 | 1807 |
| 6115 | `showProgress` | `01-visual.js` | 2 | 456 |
| 6116 | `hideProgress` | `unknown` | 0 | 82 |
| 6118 | `saveMyRemote` | `04-database.js` | 14 | 521 |
| 6129 | `saveServerRemote` | `04-database.js` | 14 | 474 |
| 6140 | `sendProposal` | `04-database.js` | 12 | 603 |
| 6148 | `reloadActiveDb` | `04-database.js` | 11 | 558 |
| 6155 | `ensurePanel` | `01-visual.js` | 5 | 294 |
| 6161 | `renderPanel` | `04-database.js` | 23 | 2680 |
| 6192 | `tuneStaticBlocks` | `04-database.js` | 16 | 1182 |
| 6207 | `editorTop` | `04-database.js` | 8 | 1588 |
| 6221 | `editorRow` | `10-estimate-views.js` | 12 | 1205 |
| 6230 | `renderRows` | `04-database.js` | 6 | 1212 |
| 6278 | `downloadJson` | `11-pdf-files.js` | 8 | 567 |
| 6290 | `fileTextProgress` | `11-pdf-files.js` | 5 | 314 |
| 6291 | `fileBufferProgress` | `11-pdf-files.js` | 5 | 311 |
| 6292 | `csvRows` | `06-single-line-scheme.js` | 8 | 550 |
| 6293 | `inferCat` | `02-shield-configurator.js` | 14 | 877 |
| 6294 | `inferSub` | `02-shield-configurator.js` | 13 | 849 |
| 6295 | `normItem` | `04-database.js` | 4 | 716 |
| 6296 | `rowsToItems` | `10-estimate-views.js` | 23 | 1815 |
| 6296 | `cell` | `10-estimate-views.js` | 2 | 53 |
| 6297 | `jsonToItems` | `04-database.js` | 11 | 466 |
| 6298 | `showReview` | `10-estimate-views.js` | 8 | 613 |
| 6299 | `readDbFile` | `10-estimate-views.js` | 16 | 1278 |
| 6307 | `saveVisibleEdits` | `04-database.js` | 14 | 544 |
| 6308 | `collectReviewed` | `04-database.js` | 12 | 568 |
| 6315 | `install` | `04-database.js` | 3 | 136 |
| 6345 | `$` | `12-documents.js` | 2 | 53 |
| 6346 | `toast` | `01-visual.js` | 4 | 131 |
| 6347 | `esc` | `07-settings.js` | 15 | 46777 |
| 6348 | `norm` | `unknown` | 0 | 146 |
| 6349 | `money` | `08-accounting.js` | 2 | 128 |
| 6350 | `groupOf` | `03-socket-pool.js` | 3 | 81 |
| 6351 | `clean` | `unknown` | 0 | 69 |
| 6352 | `sig` | `03-socket-pool.js` | 1 | 114 |
| 6353 | `clone` | `unknown` | 0 | 99 |
| 6354 | `scope` | `10-estimate-views.js` | 1 | 110 |
| 6355 | `setScope` | `10-estimate-views.js` | 1 | 97 |
| 6356 | `fbUser` | `07-settings.js` | 7 | 176 |
| 6357 | `uid` | `01-visual.js` | 4 | 118 |
| 6358 | `currentEmail` | `05-ai-functions.js` | 4 | 153 |
| 6359 | `isAdmin` | `07-settings.js` | 11 | 271 |
| 6366 | `canEdit` | `07-settings.js` | 1 | 81 |
| 6367 | `label` | `unknown` | 0 | 76 |
| 6368 | `readArr` | `05-ai-functions.js` | 1 | 130 |
| 6369 | `writeArr` | `10-estimate-views.js` | 2 | 224 |
| 6370 | `readObj` | `05-ai-functions.js` | 1 | 136 |
| 6371 | `writeObj` | `10-estimate-views.js` | 1 | 89 |
| 6372 | `unique` | `04-database.js` | 1 | 405 |
| 6373 | `getMy` | `04-database.js` | 4 | 158 |
| 6374 | `getServer` | `04-database.js` | 8 | 233 |
| 6375 | `setMy` | `04-database.js` | 10 | 264 |
| 6376 | `setServer` | `04-database.js` | 32 | 508 |
| 6377 | `syncMain` | `04-database.js` | 17 | 254 |
| 6378 | `active` | `12-documents.js` | 2 | 79 |
| 6379 | `upsert` | `02-shield-configurator.js` | 1 | 514 |
| 6381 | `ensureProgress` | `12-documents.js` | 4 | 924 |
| 6387 | `showProgress` | `01-visual.js` | 2 | 453 |
| 6388 | `hideProgress` | `unknown` | 0 | 82 |
| 6390 | `firebaseHint` | `04-database.js` | 5 | 261 |
| 6395 | `explainErr` | `05-ai-functions.js` | 4 | 321 |
| 6401 | `saveMyRemote` | `04-database.js` | 18 | 873 |
| 6420 | `saveServerRemote` | `04-database.js` | 22 | 740 |
| 6435 | `sendProposal` | `04-database.js` | 12 | 632 |
| 6451 | `reloadFromRemoteCurrent` | `04-database.js` | 31 | 732 |
| 6464 | `rerender` | `04-database.js` | 4 | 167 |
| 6465 | `currentEditType` | `04-database.js` | 4 | 269 |
| 6471 | `makeManualItem` | `04-database.js` | 9 | 579 |
| 6567 | `saveVisibleEdits` | `04-database.js` | 14 | 607 |
| 6575 | `normItem` | `04-database.js` | 4 | 568 |
| 6583 | `collectReviewed` | `04-database.js` | 12 | 581 |
| 6624 | `injectDebugButton` | `04-database.js` | 4 | 384 |
| 6660 | `$` | `12-documents.js` | 2 | 53 |
| 6661 | `toast` | `01-visual.js` | 5 | 117 |
| 6662 | `esc` | `07-settings.js` | 27 | 27184 |
| 6663 | `clean` | `unknown` | 0 | 76 |
| 6664 | `norm` | `unknown` | 0 | 141 |
| 6665 | `money` | `08-accounting.js` | 2 | 128 |
| 6666 | `scope` | `10-estimate-views.js` | 1 | 110 |
| 6667 | `setScope` | `10-estimate-views.js` | 1 | 100 |
| 6668 | `isAdmin` | `07-settings.js` | 5 | 113 |
| 6669 | `uid` | `07-settings.js` | 9 | 222 |
| 6670 | `currentUserLabel` | `07-settings.js` | 15 | 283 |
| 6671 | `readArr` | `05-ai-functions.js` | 1 | 130 |
| 6672 | `writeArr` | `10-estimate-views.js` | 2 | 226 |
| 6673 | `readObj` | `05-ai-functions.js` | 1 | 136 |
| 6674 | `writeObj` | `10-estimate-views.js` | 1 | 89 |
| 6675 | `clone` | `unknown` | 0 | 52 |
| 6676 | `groupOf` | `03-socket-pool.js` | 3 | 81 |
| 6677 | `sig` | `03-socket-pool.js` | 1 | 114 |
| 6678 | `unique` | `04-database.js` | 1 | 405 |
| 6679 | `getServer` | `04-database.js` | 8 | 234 |
| 6680 | `getMy` | `04-database.js` | 4 | 158 |
| 6681 | `setServer` | `04-database.js` | 32 | 531 |
| 6682 | `setMy` | `04-database.js` | 10 | 283 |
| 6683 | `syncMain` | `04-database.js` | 17 | 254 |
| 6684 | `upsert` | `02-shield-configurator.js` | 1 | 611 |
| 6686 | `ensureProgress` | `12-documents.js` | 4 | 898 |
| 6692 | `progress` | `01-visual.js` | 2 | 422 |
| 6693 | `hideProgress` | `unknown` | 0 | 82 |
| 6694 | `explain` | `05-ai-functions.js` | 4 | 280 |
| 6696 | `inferCat` | `02-shield-configurator.js` | 13 | 790 |
| 6700 | `inferSub` | `02-shield-configurator.js` | 11 | 538 |
| 6701 | `normItem` | `08-accounting.js` | 5 | 839 |
| 6702 | `collectReviewed` | `04-database.js` | 26 | 1071 |
| 6715 | `readGlobalDoc` | `04-database.js` | 22 | 356 |
| 6721 | `saveGlobalImport` | `04-database.js` | 59 | 1635 |
| 6740 | `saveMyImport` | `04-database.js` | 13 | 723 |
| 6749 | `sendServerProposal` | `04-database.js` | 13 | 506 |
| 6755 | `rerender` | `04-database.js` | 4 | 167 |
| 6783 | `fileText` | `11-pdf-files.js` | 5 | 176 |
| 6784 | `fileBuffer` | `11-pdf-files.js` | 5 | 173 |
| 6785 | `csvRows` | `06-single-line-scheme.js` | 5 | 173 |
| 6786 | `rowsToItems` | `10-estimate-views.js` | 23 | 1944 |
| 6788 | `cell` | `10-estimate-views.js` | 2 | 51 |
| 6805 | `jsonToItems` | `04-database.js` | 11 | 456 |
| 6806 | `showReviewV9` | `04-database.js` | 20 | 1712 |
| 6887 | `$` | `12-documents.js` | 2 | 53 |
| 6888 | `toast` | `01-visual.js` | 5 | 117 |
| 6889 | `progress` | `01-visual.js` | 2 | 275 |
| 6893 | `hideProgress` | `01-visual.js` | 2 | 191 |
| 6894 | `clean` | `unknown` | 0 | 76 |
| 6895 | `esc` | `05-ai-functions.js` | 33 | 53443 |
| 6896 | `money` | `08-accounting.js` | 2 | 128 |
| 6897 | `provider` | `05-ai-functions.js` | 7 | 200 |
| 6900 | `keyForProvider` | `05-ai-functions.js` | 10 | 338 |
| 6906 | `openAiModel` | `05-ai-functions.js` | 17 | 188 |
| 6907 | `dataMime` | `04-database.js` | 1 | 106 |
| 6908 | `fileToDataURL` | `11-pdf-files.js` | 5 | 184 |
| 6909 | `extractTextFromOpenAI` | `05-ai-functions.js` | 4 | 319 |
| 6915 | `askOpenAI` | `05-ai-functions.js` | 34 | 1000 |
| 6931 | `askGemini` | `05-ai-functions.js` | 9 | 942 |
| 6957 | `stripCode` | `unknown` | 0 | 0 |
| 6958 | `parseJsonLoose` | `05-ai-functions.js` | 2 | 109 |
| 6964 | `inferCat` | `02-shield-configurator.js` | 12 | 991 |
| 6982 | `inferSub` | `03-socket-pool.js` | 14 | 990 |
| 6999 | `normItem` | `04-database.js` | 10 | 877 |
| 7009 | `normalize` | `04-database.js` | 4 | 259 |
| 7010 | `unique` | `10-estimate-views.js` | 2 | 206 |
| 7011 | `showReview` | `04-database.js` | 17 | 2097 |
| 7024 | `importPrompt` | `04-database.js` | 5 | 657 |
| 7031 | `aiFromImageFile` | `05-ai-functions.js` | 18 | 499 |
| 7040 | `aiFromPdfFile` | `11-pdf-files.js` | 23 | 723 |
| 7071 | `patchLabels` | `11-pdf-files.js` | 6 | 513 |
| 7106 | `$` | `12-documents.js` | 2 | 53 |
| 7107 | `txt` | `unknown` | 0 | 109 |
| 7108 | `toast` | `01-visual.js` | 5 | 117 |
| 7109 | `scope` | `04-database.js` | 1 | 128 |
| 7110 | `isAdmin` | `05-ai-functions.js` | 6 | 272 |
| 7117 | `adminServerMode` | `07-settings.js` | 4 | 94 |
| 7118 | `explainServerEdit` | `05-ai-functions.js` | 2 | 217 |
| 7120 | `ensureProgress` | `10-estimate-views.js` | 6 | 1286 |
| 7148 | `setScope` | `04-database.js` | 3 | 242 |
| 7180 | `installAdminSettingsButton` | `07-settings.js` | 14 | 1010 |
| 7193 | `normalDbButtonWasClicked` | `04-database.js` | 3 | 271 |
| 7215 | `patchDbUi` | `01-visual.js` | 11 | 2225 |
| 7275 | `importTarget` | `04-database.js` | 2 | 162 |
| 7334 | `compressImageDataUrl` | `11-pdf-files.js` | 9 | 1000 |
| 7358 | `timeoutPromise` | `05-ai-functions.js` | 2 | 248 |
| 7392 | `patchAll` | `07-settings.js` | 3 | 65 |
| 7417 | `$` | `12-documents.js` | 2 | 53 |
| 7418 | `toast` | `01-visual.js` | 4 | 123 |
| 7419 | `esc` | `02-shield-configurator.js` | 5 | 41564 |
| 7420 | `norm` | `unknown` | 0 | 131 |
| 7421 | `money` | `08-accounting.js` | 2 | 129 |
| 7422 | `appPrice` | `08-accounting.js` | 3 | 109 |
| 7423 | `readArr` | `05-ai-functions.js` | 1 | 130 |
| 7424 | `readObj` | `05-ai-functions.js` | 1 | 136 |
| 7425 | `wallFromName` | `04-database.js` | 1 | 189 |
| 7426 | `groupOf` | `03-socket-pool.js` | 3 | 91 |
| 7427 | `clone` | `unknown` | 0 | 55 |
| 7429 | `fixShieldWorkItem` | `04-database.js` | 18 | 1732 |
| 7491 | `normalizeCurrentEstimate` | `10-estimate-views.js` | 5 | 271 |
| 7522 | `patchShieldButton` | `02-shield-configurator.js` | 9 | 792 |
| 7540 | `tagSrc` | `02-shield-configurator.js` | 1 | 90 |
| 7541 | `pushArr` | `unknown` | 0 | 126 |
| 7542 | `collectDb` | `04-database.js` | 56 | 1760 |
| 7572 | `classify` | `02-shield-configurator.js` | 26 | 1324 |
| 7599 | `sameClass` | `04-database.js` | 6 | 319 |
| 7608 | `score` | `03-socket-pool.js` | 5 | 527 |
| 7619 | `swapLabel` | `08-accounting.js` | 1 | 137 |
| 7672 | `boot` | `10-estimate-views.js` | 3 | 143 |
| 7703 | `$` | `12-documents.js` | 2 | 53 |
| 7704 | `norm` | `unknown` | 0 | 116 |
| 7705 | `clean` | `unknown` | 0 | 69 |
| 7722 | `add` | `02-shield-configurator.js` | 1 | 146 |
| 7733 | `val` | `unknown` | 0 | 53 |
| 7733 | `chk` | `unknown` | 0 | 57 |
| 7734 | `add` | `03-socket-pool.js` | 3 | 80 |
| 7735 | `room` | `02-shield-configurator.js` | 2 | 192 |
| 7785 | `boot` | `10-estimate-views.js` | 1 | 122 |
| 7803 | `$` | `12-documents.js` | 2 | 51 |
| 7804 | `esc` | `02-shield-configurator.js` | 24 | 31431 |
| 7805 | `epV16GenerateCascadePanel` | `02-shield-configurator.js` | 27 | 13512 |
| 7817 | `addLine` | `03-socket-pool.js` | 3 | 220 |
| 7821 | `addRoom` | `02-shield-configurator.js` | 2 | 301 |
| 7851 | `groupAssignment` | `03-socket-pool.js` | 9 | 286 |
| 7856 | `addProtection` | `03-socket-pool.js` | 6 | 392 |
| 7866 | `mat` | `08-accounting.js` | 2 | 381 |
| 7873 | `work` | `04-database.js` | 3 | 365 |
| 7943 | `isShieldDeviceV16` | `02-shield-configurator.js` | 10 | 290 |
| 7948 | `getAssignV16` | `04-database.js` | 2 | 498 |
| 7950 | `add` | `02-shield-configurator.js` | 1 | 146 |
| 7954 | `purposeV16` | `02-shield-configurator.js` | 1 | 97 |
| 7955 | `normalizeV16` | `10-estimate-views.js` | 2 | 107 |
| 7956 | `showDetailsV16` | `10-estimate-views.js` | 12 | 1142 |
| 7982 | `bindButtons` | `02-shield-configurator.js` | 2 | 229 |
| 7992 | `boot` | `04-database.js` | 1 | 111 |
| 8012 | `$` | `12-documents.js` | 2 | 53 |
| 8013 | `txt` | `unknown` | 0 | 47 |
| 8014 | `clean` | `unknown` | 0 | 62 |
| 8015 | `norm` | `unknown` | 0 | 89 |
| 8016 | `esc` | `02-shield-configurator.js` | 14 | 44730 |
| 8017 | `toast` | `01-visual.js` | 4 | 123 |
| 8018 | `addBadge` | `01-visual.js` | 5 | 433 |
| 8025 | `brandRu` | `unknown` | 0 | 91 |
| 8026 | `lineConfig` | `02-shield-configurator.js` | 25 | 1632 |
| 8027 | `e` | `unknown` | 0 | 31 |
| 8027 | `ch` | `unknown` | 0 | 56 |
| 8028 | `add` | `03-socket-pool.js` | 1 | 64 |
| 8029 | `room` | `02-shield-configurator.js` | 2 | 192 |
| 8038 | `nominalOf` | `04-database.js` | 1 | 298 |
| 8043 | `isDevice` | `02-shield-configurator.js` | 9 | 333 |
| 8047 | `assignmentsOf` | `02-shield-configurator.js` | 9 | 1249 |
| 8048 | `add` | `02-shield-configurator.js` | 1 | 145 |
| 8058 | `deviceName` | `02-shield-configurator.js` | 8 | 820 |
| 8067 | `purposeOf` | `02-shield-configurator.js` | 8 | 465 |
| 8110 | `patchDbBulk` | `04-database.js` | 12 | 1157 |
| 8121 | `move` | `04-database.js` | 2 | 186 |
| 8131 | `boot` | `01-visual.js` | 5 | 202 |
| 8156 | `$` | `12-documents.js` | 2 | 53 |
| 8157 | `esc` | `07-settings.js` | 6 | 49732 |
| 8158 | `clean` | `unknown` | 0 | 76 |
| 8159 | `norm` | `unknown` | 0 | 104 |
| 8160 | `toast` | `01-visual.js` | 4 | 123 |
| 8161 | `arrLS` | `05-ai-functions.js` | 1 | 128 |
| 8162 | `objLS` | `05-ai-functions.js` | 1 | 134 |
| 8163 | `setLS` | `10-estimate-views.js` | 2 | 223 |
| 8164 | `setObjLS` | `10-estimate-views.js` | 1 | 89 |
| 8165 | `scope` | `10-estimate-views.js` | 1 | 114 |
| 8166 | `isAdmin` | `07-settings.js` | 5 | 106 |
| 8167 | `uid` | `01-visual.js` | 3 | 92 |
| 8168 | `groupOf` | `03-socket-pool.js` | 3 | 88 |
| 8169 | `clone` | `unknown` | 0 | 53 |
| 8170 | `getServerCache` | `04-database.js` | 15 | 152 |
| 8171 | `getArr` | `04-database.js` | 16 | 481 |
| 8182 | `unique` | `03-socket-pool.js` | 1 | 415 |
| 8185 | `syncActiveToMain` | `04-database.js` | 18 | 233 |
| 8193 | `saveArr` | `04-database.js` | 84 | 1947 |
| 8220 | `ensureBadge` | `01-visual.js` | 6 | 458 |
| 8236 | `money` | `08-accounting.js` | 2 | 128 |
| 8237 | `dbFindAuto` | `04-database.js` | 5 | 438 |
| 8242 | `dbFindRcd` | `04-database.js` | 5 | 395 |
| 8246 | `brandRu` | `unknown` | 0 | 129 |
| 8247 | `autoName` | `02-shield-configurator.js` | 5 | 517 |
| 8253 | `autoPrice` | `02-shield-configurator.js` | 3 | 191 |
| 8254 | `rcdName` | `02-shield-configurator.js` | 6 | 368 |
| 8255 | `rcdPrice` | `02-shield-configurator.js` | 3 | 130 |
| 8256 | `val` | `unknown` | 0 | 85 |
| 8257 | `chk` | `unknown` | 0 | 57 |
| 8258 | `cfgNum` | `02-shield-configurator.js` | 4 | 89 |
| 8259 | `appPrice` | `08-accounting.js` | 2 | 111 |
| 8260 | `makeItem` | `04-database.js` | 3 | 327 |
| 8261 | `mergeAssignments` | `04-database.js` | 5 | 512 |
| 8261 | `add` | `unknown` | 0 | 69 |
| 8262 | `directAddShield` | `10-estimate-views.js` | 11 | 753 |
| 8268 | `renderMainDirect` | `10-estimate-views.js` | 21 | 1331 |
| 8281 | `addLine` | `03-socket-pool.js` | 4 | 169 |
| 8282 | `room` | `02-shield-configurator.js` | 2 | 210 |
| 8291 | `groupAssign` | `03-socket-pool.js` | 4 | 239 |
| 8322 | `isShieldDevice` | `02-shield-configurator.js` | 10 | 270 |
| 8323 | `assigns` | `04-database.js` | 2 | 378 |
| 8323 | `add` | `02-shield-configurator.js` | 1 | 119 |
| 8337 | `selectedChecks` | `12-documents.js` | 2 | 194 |
| 8338 | `activeTypeFromUi` | `04-database.js` | 4 | 204 |
| 8339 | `optionsHtml` | `07-settings.js` | 6 | 316 |
| 8340 | `buildBulkPanel` | `04-database.js` | 8 | 1461 |
| 8350 | `injectBulkPanel` | `04-database.js` | 11 | 338 |
| 8356 | `injectChecks` | `10-estimate-views.js` | 16 | 1090 |
| 8360 | `refreshDbEnhancements` | `04-database.js` | 3 | 70 |
| 8390 | `boot` | `01-visual.js` | 4 | 225 |
| 8409 | `$` | `12-documents.js` | 2 | 53 |
| 8410 | `toast` | `01-visual.js` | 4 | 131 |
| 8411 | `esc` | `02-shield-configurator.js` | 5 | 16355 |
| 8412 | `money` | `08-accounting.js` | 2 | 57 |
| 8413 | `val` | `unknown` | 0 | 85 |
| 8414 | `chk` | `unknown` | 0 | 59 |
| 8415 | `cfgN` | `02-shield-configurator.js` | 4 | 107 |
| 8416 | `appPrice` | `08-accounting.js` | 2 | 118 |
| 8417 | `brandRu` | `unknown` | 0 | 313 |
| 8418 | `curveNom` | `unknown` | 0 | 200 |
| 8419 | `autoName` | `02-shield-configurator.js` | 2 | 283 |
| 8420 | `autoPrice` | `04-database.js` | 6 | 679 |
| 8431 | `rcdName` | `02-shield-configurator.js` | 9 | 281 |
| 8432 | `rcdPrice` | `02-shield-configurator.js` | 8 | 587 |
| 8441 | `makeItem` | `04-database.js` | 3 | 498 |
| 8447 | `groupLines` | `06-single-line-scheme.js` | 6 | 288 |
| 8452 | `buildLines` | `02-shield-configurator.js` | 20 | 1715 |
| 8454 | `add` | `03-socket-pool.js` | 4 | 177 |
| 8455 | `room` | `02-shield-configurator.js` | 2 | 202 |
| 8470 | `addShieldToEstimate` | `10-estimate-views.js` | 14 | 545 |
| 8481 | `groupAssign` | `03-socket-pool.js` | 4 | 214 |
| 8525 | `getAssigns` | `04-database.js` | 2 | 403 |
| 8525 | `add` | `02-shield-configurator.js` | 1 | 131 |
| 8526 | `isDevice` | `02-shield-configurator.js` | 3 | 164 |
| 8543 | `patchButtons` | `02-shield-configurator.js` | 2 | 293 |
| 8544 | `boot` | `01-visual.js` | 4 | 147 |
| 8563 | `$` | `12-documents.js` | 2 | 53 |
| 8564 | `text` | `unknown` | 0 | 48 |
| 8565 | `clean` | `unknown` | 0 | 63 |
| 8566 | `esc` | `04-database.js` | 6 | 18964 |
| 8567 | `toast` | `01-visual.js` | 4 | 131 |
| 8568 | `money` | `08-accounting.js` | 2 | 109 |
| 8569 | `val` | `unknown` | 0 | 85 |
| 8570 | `chk` | `unknown` | 0 | 59 |
| 8571 | `count` | `02-shield-configurator.js` | 2 | 236 |
| 8578 | `appPrice` | `08-accounting.js` | 2 | 118 |
| 8579 | `brandRu` | `unknown` | 0 | 313 |
| 8580 | `norm` | `unknown` | 0 | 104 |
| 8581 | `activeMatDb` | `04-database.js` | 12 | 479 |
| 8589 | `curveNom` | `unknown` | 0 | 200 |
| 8590 | `dbFindAuto` | `02-shield-configurator.js` | 4 | 637 |
| 8594 | `dbFindRcd` | `02-shield-configurator.js` | 6 | 442 |
| 8598 | `modelFromDbName` | `04-database.js` | 2 | 122 |
| 8599 | `autoName` | `05-ai-functions.js` | 4 | 388 |
| 8600 | `autoPrice` | `02-shield-configurator.js` | 3 | 275 |
| 8601 | `rcdName` | `02-shield-configurator.js` | 10 | 424 |
| 8602 | `rcdPrice` | `02-shield-configurator.js` | 5 | 206 |
| 8603 | `item` | `10-estimate-views.js` | 3 | 496 |
| 8609 | `addUniqueAssign` | `05-ai-functions.js` | 3 | 469 |
| 8614 | `directAdd` | `10-estimate-views.js` | 13 | 1049 |
| 8621 | `buildLines` | `02-shield-configurator.js` | 12 | 1757 |
| 8623 | `add` | `03-socket-pool.js` | 4 | 193 |
| 8624 | `room` | `02-shield-configurator.js` | 2 | 182 |
| 8643 | `groupNominals` | `03-socket-pool.js` | 2 | 313 |
| 8644 | `presentGroups` | `03-socket-pool.js` | 5 | 153 |
| 8650 | `groupAssign` | `03-socket-pool.js` | 4 | 220 |
| 8691 | `getAssigns` | `04-database.js` | 2 | 319 |
| 8691 | `add` | `02-shield-configurator.js` | 1 | 119 |
| 8692 | `isDevice` | `02-shield-configurator.js` | 3 | 156 |
| 8704 | `patchButtons` | `02-shield-configurator.js` | 2 | 299 |
| 8712 | `boot` | `01-visual.js` | 4 | 147 |
| 8736 | `$` | `12-documents.js` | 2 | 53 |
| 8737 | `clean` | `unknown` | 0 | 76 |
| 8738 | `esc` | `unknown` | 0 | 0 |
| 8739 | `toast` | `01-visual.js` | 4 | 123 |
| 8740 | `arrLS` | `05-ai-functions.js` | 1 | 128 |
| 8741 | `objLS` | `05-ai-functions.js` | 1 | 134 |
| 8742 | `setArrLS` | `10-estimate-views.js` | 2 | 229 |
| 8743 | `setObjLS` | `10-estimate-views.js` | 1 | 90 |
| 8744 | `scope` | `10-estimate-views.js` | 1 | 114 |
| 8745 | `isAdmin` | `07-settings.js` | 5 | 113 |
| 8746 | `uid` | `01-visual.js` | 3 | 99 |
| 8747 | `groupOf` | `03-socket-pool.js` | 3 | 88 |
| 8748 | `clone` | `unknown` | 0 | 53 |
| 8749 | `norm` | `unknown` | 0 | 104 |
| 8750 | `uniq` | `03-socket-pool.js` | 1 | 456 |
| 8761 | `getServerCache` | `04-database.js` | 15 | 152 |
| 8762 | `getArr` | `04-database.js` | 16 | 469 |
| 8773 | `syncMain` | `04-database.js` | 18 | 173 |
| 8776 | `setStatus` | `01-visual.js` | 8 | 779 |
| 8784 | `saveArr` | `04-database.js` | 86 | 1878 |
| 8807 | `activeType` | `12-documents.js` | 7 | 461 |
| 8814 | `visibleHost` | `04-database.js` | 3 | 79 |
| 8815 | `options` | `07-settings.js` | 6 | 419 |
| 8822 | `fillSelectors` | `12-documents.js` | 7 | 612 |
| 8833 | `panelHtml` | `08-accounting.js` | 8 | 1417 |
| 8849 | `hideOldBulk` | `04-database.js` | 6 | 183 |
| 8852 | `rowId` | `10-estimate-views.js` | 13 | 588 |
| 8858 | `ensureChecks` | `10-estimate-views.js` | 8 | 763 |
| 8871 | `ensurePanel` | `04-database.js` | 5 | 387 |
| 8880 | `selected` | `01-visual.js` | 2 | 154 |
| 8921 | `boot` | `01-visual.js` | 4 | 112 |

## Unknown / смотреть вручную

- строка 292: `epNormText` размер `125`
- строка 488: `epCleanText` размер `96`
- строка 928: `epStripCode` размер `215`
- строка 1311: `epIsEmptyCell` размер `106`
- строка 1315: `epCleanCell` размер `131`
- строка 1319: `epIsUnitCell` размер `204`
- строка 1324: `epNormalizeUnit` размер `285`
- строка 1333: `epIsNumberLikeCell` размер `199`
- строка 1340: `epLooksLikeCodeOrNumber` размер `355`
- строка 1350: `epTitleCaseRu` размер `183`
- строка 1941: `epId` размер `77`
- строка 1944: `epClean` размер `68`
- строка 1945: `epSame` размер `312`
- строка 2239: `norm` размер `112`
- строка 2240: `uniq` размер `70`
- строка 2241: `getVal` размер `70`
- строка 2242: `getCheck` размер `68`
- строка 2243: `toNum` размер `86`
- строка 2563: `norm` размер `202`
- строка 2570: `detectBrand` размер `171`
- строка 2571: `detectNominal` размер `153`
- строка 2727: `norm` размер `196`
- строка 2761: `detectBrand` размер `381`
- строка 2770: `detectNominal` размер `163`
- строка 2775: `detectLeakage` размер `123`
- строка 3209: `norm` размер `246`
- строка 3444: `swapLabel` размер `155`
- строка 3523: `clean` размер `247`
- строка 3547: `idKey` размер `70`
- строка 3558: `clearDeletedFor` размер `302`
- строка 3961: `norm` размер `246`
- строка 3982: `idkey` размер `70`
- строка 4002: `stripRuntime` размер `129`
- строка 4157: `makeLocalCopy` размер `341`
- строка 4467: `cleanText` размер `153`
- строка 4468: `clone` размер `100`
- строка 4480: `enc` размер `102`
- строка 4483: `unique` размер `254`
- строка 5163: `clean` размер `149`
- строка 5165: `clone` размер `104`
- строка 5388: `label` размер `85`
- строка 5393: `clean` размер `149`
- строка 5395: `clone` размер `104`
- строка 5397: `unique` размер `344`
- строка 5486: `isVisible` размер `119`
- строка 5587: `cleanText` размер `86`
- строка 5589: `norm` размер `148`
- строка 5595: `clone` размер `104`
- строка 6077: `norm` размер `146`
- строка 6078: `cleanText` размер `80`
- строка 6084: `label` размер `76`
- строка 6091: `clone` размер `99`
- строка 6116: `hideProgress` размер `82`
- строка 6348: `norm` размер `146`
- строка 6351: `clean` размер `69`
- строка 6353: `clone` размер `99`
- строка 6367: `label` размер `76`
- строка 6388: `hideProgress` размер `82`
- строка 6663: `clean` размер `76`
- строка 6664: `norm` размер `141`
- строка 6675: `clone` размер `52`
- строка 6693: `hideProgress` размер `82`
- строка 6894: `clean` размер `76`
- строка 6957: `stripCode` размер `0`
- строка 7107: `txt` размер `109`
- строка 7420: `norm` размер `131`
- строка 7427: `clone` размер `55`
- строка 7541: `pushArr` размер `126`
- строка 7704: `norm` размер `116`
- строка 7705: `clean` размер `69`
- строка 7733: `val` размер `53`
- строка 7733: `chk` размер `57`
- строка 8013: `txt` размер `47`
- строка 8014: `clean` размер `62`
- строка 8015: `norm` размер `89`
- строка 8025: `brandRu` размер `91`
- строка 8027: `e` размер `31`
- строка 8027: `ch` размер `56`
- строка 8158: `clean` размер `76`
- строка 8159: `norm` размер `104`
- строка 8169: `clone` размер `53`
- строка 8246: `brandRu` размер `129`
- строка 8256: `val` размер `85`
- строка 8257: `chk` размер `57`
- строка 8261: `add` размер `69`
- строка 8413: `val` размер `85`
- строка 8414: `chk` размер `59`
- строка 8417: `brandRu` размер `313`
- строка 8418: `curveNom` размер `200`
- строка 8564: `text` размер `48`
- строка 8565: `clean` размер `63`
- строка 8569: `val` размер `85`
- строка 8570: `chk` размер `59`
- строка 8579: `brandRu` размер `313`
- строка 8580: `norm` размер `104`
- строка 8589: `curveNom` размер `200`
- строка 8737: `clean` размер `76`
- строка 8738: `esc` размер `0`
- строка 8748: `clone` размер `53`
- строка 8749: `norm` размер `104`

## Рекомендация для V46

После V44 лучше не резать всё подряд. Следующий шаг — выбрать один из вариантов:

1. Добить `unknown` вручную по самым большим функциям.
2. Перенести `window.*` привязки в правильные модули.
3. Сделать отдельный модуль `00-state.js` или `00-legacy-state.js` для глобальных переменных и связей.
4. Оставить `00-core.js` как минимальный legacy-runtime и перейти к исправлению логики щита/базы/PDF.

