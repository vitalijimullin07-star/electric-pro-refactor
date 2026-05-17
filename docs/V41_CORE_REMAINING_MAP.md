# V41 Core Remaining Map

Карта остатка `public/js/00-core.js` после V40.

## Размер файла

- строк: `8919`
- байт: `679243`
- оставшихся function/async function: `741`
- window.* присваиваний: `475`
- V40 moved markers: `114`

## Остаток функций по предполагаемым модулям

- `01-visual.js` — `49`
- `02-shield-configurator.js` — `83`
- `03-socket-pool.js` — `53`
- `04-database.js` — `212`
- `05-ai-functions.js` — `59`
- `06-single-line-scheme.js` — `5`
- `07-settings.js` — `30`
- `08-accounting.js` — `19`
- `10-estimate-views.js` — `80`
- `11-pdf-files.js` — `16`
- `12-documents.js` — `38`
- `unknown` — `97`

## Window-привязки по предполагаемым модулям

- `01-visual.js` — `99`
- `02-shield-configurator.js` — `21`
- `03-socket-pool.js` — `1`
- `04-database.js` — `277`
- `05-ai-functions.js` — `16`
- `07-settings.js` — `7`
- `10-estimate-views.js` — `39`
- `11-pdf-files.js` — `10`
- `12-documents.js` — `5`

## Оставшиеся функции

| Строка | Функция | Куда похоже | Score | Размер |
|---:|---|---|---:|---:|
| 36 | `safeGet` | `10-estimate-views.js` | 1 | 104 |
| 37 | `safeSet` | `10-estimate-views.js` | 1 | 82 |
| 289 | `epNormText` | `unknown` | 0 | 125 |
| 485 | `epCleanText` | `unknown` | 0 | 96 |
| 489 | `epMoney` | `08-accounting.js` | 2 | 154 |
| 494 | `epEscape` | `05-ai-functions.js` | 19 | 133865 |
| 500 | `epNormProvider` | `05-ai-functions.js` | 4 | 87 |
| 504 | `epCurrentProvider` | `10-estimate-views.js` | 5 | 139 |
| 508 | `epCurrentKey` | `05-ai-functions.js` | 8 | 315 |
| 514 | `epSetAiProvider` | `10-estimate-views.js` | 12 | 505 |
| 529 | `epRefreshProviderUI` | `05-ai-functions.js` | 13 | 826 |
| 551 | `epInsertMainProviderSwitch` | `05-ai-functions.js` | 24 | 873 |
| 574 | `epMakeAiMenuGroup` | `05-ai-functions.js` | 19 | 1248 |
| 606 | `epAddBetaLabels` | `03-socket-pool.js` | 7 | 658 |
| 619 | `epPatchSettingsUI` | `05-ai-functions.js` | 16 | 2497 |
| 673 | `epTestProviderKey` | `05-ai-functions.js` | 16 | 1415 |
| 787 | `epLoadAiConfigFromServer` | `05-ai-functions.js` | 22 | 3235 |
| 854 | `epCallGemini` | `05-ai-functions.js` | 9 | 1134 |
| 875 | `epExtractOpenAiText` | `05-ai-functions.js` | 4 | 391 |
| 887 | `epCallOpenAI` | `05-ai-functions.js` | 40 | 1192 |
| 916 | `epAskAI` | `05-ai-functions.js` | 13 | 269 |
| 925 | `epStripCode` | `unknown` | 0 | 215 |
| 929 | `epTryJsonParseLoose` | `05-ai-functions.js` | 2 | 192 |
| 946 | `epParseLooseTableText` | `06-single-line-scheme.js` | 7 | 1493 |
| 971 | `epExtractJsonObjectsLoose` | `12-documents.js` | 2 | 1006 |
| 1000 | `epParseJsonArray` | `05-ai-functions.js` | 13 | 699 |
| 1080 | `epDbTypeLabel` | `04-database.js` | 5 | 81 |
| 1081 | `epCurrentDb` | `04-database.js` | 8 | 71 |
| 1082 | `epSetCurrentDb` | `04-database.js` | 8 | 91 |
| 1084 | `epInferCategory` | `03-socket-pool.js` | 10 | 1091 |
| 1103 | `epInferSubcategory` | `03-socket-pool.js` | 11 | 1733 |
| 1136 | `epNormalizeItems` | `04-database.js` | 14 | 2264 |
| 1182 | `epSaveUserDb` | `04-database.js` | 27 | 658 |
| 1200 | `epSaveGlobalDb` | `04-database.js` | 16 | 214 |
| 1205 | `epLoadUserDbAfterLogin` | `04-database.js` | 34 | 985 |
| 1234 | `epInsertDbTools` | `04-database.js` | 22 | 1159 |
| 1279 | `epReadFileAsText` | `11-pdf-files.js` | 5 | 270 |
| 1288 | `epReadFileAsDataURL` | `11-pdf-files.js` | 5 | 276 |
| 1297 | `epReadFileAsArrayBuffer` | `11-pdf-files.js` | 5 | 284 |
| 1308 | `epIsEmptyCell` | `unknown` | 0 | 106 |
| 1312 | `epCleanCell` | `unknown` | 0 | 131 |
| 1316 | `epIsUnitCell` | `unknown` | 0 | 204 |
| 1321 | `epNormalizeUnit` | `unknown` | 0 | 285 |
| 1330 | `epIsNumberLikeCell` | `unknown` | 0 | 199 |
| 1337 | `epLooksLikeCodeOrNumber` | `unknown` | 0 | 355 |
| 1347 | `epTitleCaseRu` | `unknown` | 0 | 183 |
| 1353 | `epExtractItemsFromSheetRows` | `10-estimate-views.js` | 14 | 3304 |
| 1423 | `epReadDbFile` | `04-database.js` | 14 | 2370 |
| 1478 | `epAiNormalizeImage` | `05-ai-functions.js` | 8 | 2477 |
| 1521 | `epAiNormalizeDbText` | `05-ai-functions.js` | 16 | 1176 |
| 1542 | `epShowDbReview` | `04-database.js` | 10 | 2143 |
| 1571 | `epGetReviewedSelected` | `12-documents.js` | 12 | 934 |
| 1587 | `epSameItem` | `10-estimate-views.js` | 2 | 299 |
| 1593 | `epSendDbProposal` | `04-database.js` | 9 | 586 |
| 1642 | `epDownloadJson` | `11-pdf-files.js` | 7 | 422 |
| 1792 | `epInsertAdminProposalBox` | `04-database.js` | 6 | 671 |
| 1804 | `epListenDbProposals` | `04-database.js` | 16 | 1964 |
| 1890 | `epInitialApply` | `07-settings.js` | 6 | 360 |
| 1937 | `epEsc` | `04-database.js` | 15 | 24117 |
| 1938 | `epId` | `unknown` | 0 | 77 |
| 1939 | `epArr` | `04-database.js` | 6 | 65 |
| 1940 | `epSetArr` | `04-database.js` | 6 | 85 |
| 1941 | `epClean` | `unknown` | 0 | 68 |
| 1942 | `epSame` | `unknown` | 0 | 312 |
| 1948 | `epMaterialFromName` | `04-database.js` | 4 | 289 |
| 1953 | `epOpFromName` | `03-socket-pool.js` | 4 | 274 |
| 1958 | `epNormalizeWorkItem` | `03-socket-pool.js` | 7 | 1244 |
| 1981 | `epDisplayWorkName` | `04-database.js` | 2 | 247 |
| 1987 | `epEstimateCopy` | `04-database.js` | 2 | 169 |
| 1992 | `epMergeFullWorksInto` | `04-database.js` | 8 | 301 |
| 2000 | `epNormalizeAllWorkDb` | `04-database.js` | 20 | 207 |
| 2004 | `epGroupCatalog` | `04-database.js` | 3 | 494 |
| 2016 | `epRenderGroupedList` | `03-socket-pool.js` | 3 | 3049 |
| 2075 | `epGetGlobalDb` | `04-database.js` | 74 | 841 |
| 2090 | `epRenderGlobalDbModal` | `04-database.js` | 20 | 625 |
| 2109 | `epInsertGlobalDbButton` | `12-documents.js` | 8 | 604 |
| 2123 | `epEnsureProposalBox` | `04-database.js` | 8 | 753 |
| 2133 | `epProposalItemName` | `04-database.js` | 2 | 114 |
| 2134 | `epRenderProposalList` | `04-database.js` | 13 | 1288 |
| 2203 | `epStartProposalV2` | `04-database.js` | 12 | 688 |
| 2213 | `epInitFullWorksPatch` | `04-database.js` | 13 | 180 |
| 2234 | `qs` | `12-documents.js` | 2 | 54 |
| 2235 | `safeText` | `02-shield-configurator.js` | 8 | 8033 |
| 2236 | `norm` | `unknown` | 0 | 112 |
| 2237 | `uniq` | `unknown` | 0 | 70 |
| 2238 | `getVal` | `unknown` | 0 | 70 |
| 2239 | `getCheck` | `unknown` | 0 | 68 |
| 2240 | `toNum` | `unknown` | 0 | 86 |
| 2242 | `getCfgCount` | `02-shield-configurator.js` | 5 | 274 |
| 2249 | `epMoveShieldSettingsIntoDetails` | `02-shield-configurator.js` | 20 | 1477 |
| 2284 | `epMatGroupName` | `02-shield-configurator.js` | 10 | 2221 |
| 2314 | `epNormalizeMaterialsDb` | `04-database.js` | 14 | 730 |
| 2315 | `fixArr` | `02-shield-configurator.js` | 2 | 547 |
| 2330 | `epGroupedData` | `03-socket-pool.js` | 2 | 545 |
| 2344 | `epRenderGrouped` | `04-database.js` | 5 | 2320 |
| 2382 | `epPatchDbRenderers` | `04-database.js` | 39 | 1285 |
| 2397 | `epAllDbItems` | `04-database.js` | 14 | 248 |
| 2402 | `epFindItem` | `10-estimate-views.js` | 3 | 542 |
| 2413 | `epMat` | `04-database.js` | 11 | 570 |
| 2421 | `epWork` | `04-database.js` | 5 | 392 |
| 2444 | `addLine` | `03-socket-pool.js` | 4 | 211 |
| 2445 | `addRoom` | `02-shield-configurator.js` | 2 | 231 |
| 2464 | `addProtection` | `03-socket-pool.js` | 4 | 174 |
| 2469 | `autoPrice` | `02-shield-configurator.js` | 3 | 59 |
| 2470 | `difPrice` | `02-shield-configurator.js` | 3 | 60 |
| 2532 | `epPatchGenerateButton` | `02-shield-configurator.js` | 4 | 280 |
| 2537 | `boot` | `04-database.js` | 4 | 126 |
| 2557 | `qs` | `12-documents.js` | 2 | 54 |
| 2558 | `toast` | `01-visual.js` | 6 | 89 |
| 2559 | `safe` | `04-database.js` | 26 | 18207 |
| 2560 | `norm` | `unknown` | 0 | 202 |
| 2561 | `dbArr` | `04-database.js` | 12 | 160 |
| 2564 | `setDbArr` | `04-database.js` | 12 | 174 |
| 2567 | `detectBrand` | `unknown` | 0 | 171 |
| 2568 | `detectNominal` | `unknown` | 0 | 153 |
| 2569 | `getGroup` | `03-socket-pool.js` | 3 | 82 |
| 2570 | `setGroup` | `03-socket-pool.js` | 2 | 64 |
| 2572 | `normalizeMaterialDb` | `02-shield-configurator.js` | 15 | 2921 |
| 2599 | `renderGrouped` | `03-socket-pool.js` | 8 | 1316 |
| 2639 | `savedChoices` | `04-database.js` | 1 | 125 |
| 2640 | `saveChoice` | `04-database.js` | 1 | 134 |
| 2716 | `qs` | `12-documents.js` | 2 | 54 |
| 2717 | `safeHtml` | `04-database.js` | 25 | 28051 |
| 2722 | `norm` | `unknown` | 0 | 196 |
| 2732 | `arrByType` | `04-database.js` | 19 | 541 |
| 2749 | `setArrByType` | `04-database.js` | 6 | 138 |
| 2756 | `detectBrand` | `unknown` | 0 | 381 |
| 2765 | `detectNominal` | `unknown` | 0 | 163 |
| 2770 | `detectLeakage` | `unknown` | 0 | 123 |
| 2774 | `detectRcdType` | `02-shield-configurator.js` | 2 | 293 |
| 2787 | `normalizeDbItem` | `02-shield-configurator.js` | 9 | 3553 |
| 2845 | `normalizeDbs` | `04-database.js` | 11 | 267 |
| 2852 | `renderGroupedFixed` | `04-database.js` | 9 | 2109 |
| 2916 | `reqDisplayName` | `02-shield-configurator.js` | 15 | 948 |
| 2936 | `strictFindMaterial` | `02-shield-configurator.js` | 16 | 2582 |
| 3028 | `cleanCanonicalName` | `02-shield-configurator.js` | 8 | 750 |
| 3040 | `lineFromRaw` | `02-shield-configurator.js` | 7 | 686 |
| 3055 | `mergeEstimateFixed` | `10-estimate-views.js` | 8 | 1242 |
| 3103 | `shieldRowsForDetails` | `10-estimate-views.js` | 20 | 1224 |
| 3134 | `detailNote` | `02-shield-configurator.js` | 7 | 441 |
| 3197 | `qs` | `12-documents.js` | 2 | 54 |
| 3198 | `toast` | `01-visual.js` | 7 | 91 |
| 3199 | `safe` | `04-database.js` | 27 | 22239 |
| 3204 | `norm` | `unknown` | 0 | 246 |
| 3216 | `localArr` | `04-database.js` | 19 | 450 |
| 3225 | `setLocalArr` | `04-database.js` | 6 | 121 |
| 3229 | `getGroup` | `03-socket-pool.js` | 3 | 92 |
| 3230 | `itemKey` | `10-estimate-views.js` | 2 | 194 |
| 3235 | `sigKey` | `03-socket-pool.js` | 1 | 147 |
| 3238 | `deletedSet` | `04-database.js` | 2 | 237 |
| 3244 | `saveLocalDb` | `04-database.js` | 25 | 839 |
| 3270 | `loadGlobalDb` | `04-database.js` | 48 | 880 |
| 3291 | `mergedArr` | `04-database.js` | 8 | 771 |
| 3311 | `groupHtml` | `03-socket-pool.js` | 3 | 2526 |
| 3439 | `swapLabel` | `unknown` | 0 | 155 |
| 3511 | `qs` | `12-documents.js` | 2 | 54 |
| 3512 | `msg` | `01-visual.js` | 5 | 83 |
| 3513 | `esc` | `04-database.js` | 29 | 30512 |
| 3518 | `clean` | `unknown` | 0 | 247 |
| 3529 | `groupOf` | `03-socket-pool.js` | 3 | 91 |
| 3530 | `localDb` | `04-database.js` | 21 | 449 |
| 3539 | `setLocalDb` | `04-database.js` | 8 | 120 |
| 3542 | `idKey` | `unknown` | 0 | 70 |
| 3543 | `sigKey` | `03-socket-pool.js` | 1 | 146 |
| 3546 | `delStorageKey` | `04-database.js` | 2 | 120 |
| 3547 | `deletedSet` | `05-ai-functions.js` | 1 | 149 |
| 3550 | `saveDeleted` | `10-estimate-views.js` | 1 | 132 |
| 3553 | `clearDeletedFor` | `unknown` | 0 | 302 |
| 3561 | `saveMyDb` | `04-database.js` | 32 | 872 |
| 3586 | `loadGlobal` | `04-database.js` | 55 | 1001 |
| 3607 | `merged` | `04-database.js` | 7 | 717 |
| 3626 | `renderList` | `04-database.js` | 4 | 3621 |
| 3774 | `toolbar` | `08-accounting.js` | 7 | 1050 |
| 3855 | `classify` | `02-shield-configurator.js` | 19 | 1739 |
| 3884 | `sameClass` | `02-shield-configurator.js` | 4 | 351 |
| 3949 | `$` | `12-documents.js` | 2 | 53 |
| 3950 | `toast` | `01-visual.js` | 7 | 85 |
| 3951 | `esc` | `04-database.js` | 4 | 38477 |
| 3956 | `norm` | `unknown` | 0 | 246 |
| 3967 | `encodeItem` | `10-estimate-views.js` | 2 | 116 |
| 3970 | `decodeItem` | `10-estimate-views.js` | 2 | 114 |
| 3973 | `groupOf` | `03-socket-pool.js` | 3 | 91 |
| 3974 | `sig` | `03-socket-pool.js` | 1 | 142 |
| 3977 | `idkey` | `unknown` | 0 | 70 |
| 3978 | `delKey` | `04-database.js` | 2 | 113 |
| 3979 | `delSet` | `05-ai-functions.js` | 1 | 140 |
| 3982 | `saveDel` | `10-estimate-views.js` | 1 | 123 |
| 3985 | `localDb` | `04-database.js` | 21 | 449 |
| 3994 | `setLocalDb` | `04-database.js` | 8 | 122 |
| 3997 | `stripRuntime` | `unknown` | 0 | 129 |
| 4006 | `saveMyDb` | `04-database.js` | 32 | 880 |
| 4029 | `loadCachedGlobalFromStorage` | `04-database.js` | 20 | 440 |
| 4043 | `readGlobal` | `04-database.js` | 46 | 1132 |
| 4074 | `merged` | `04-database.js` | 9 | 717 |
| 4093 | `renderItems` | `04-database.js` | 3 | 3631 |
| 4152 | `makeLocalCopy` | `unknown` | 0 | 341 |
| 4459 | `$` | `12-documents.js` | 2 | 53 |
| 4460 | `toast` | `01-visual.js` | 7 | 85 |
| 4461 | `esc` | `10-estimate-views.js` | 6 | 15149 |
| 4462 | `cleanText` | `unknown` | 0 | 153 |
| 4463 | `clone` | `unknown` | 0 | 100 |
| 4464 | `arrLS` | `05-ai-functions.js` | 1 | 128 |
| 4465 | `objLS` | `05-ai-functions.js` | 1 | 142 |
| 4466 | `setLS` | `10-estimate-views.js` | 1 | 159 |
| 4467 | `setObjLS` | `10-estimate-views.js` | 1 | 90 |
| 4468 | `cleanMode` | `10-estimate-views.js` | 1 | 70 |
| 4469 | `scope` | `10-estimate-views.js` | 1 | 89 |
| 4470 | `activeLabel` | `12-documents.js` | 2 | 86 |
| 4471 | `uid` | `07-settings.js` | 3 | 96 |
| 4472 | `isAdmin` | `07-settings.js` | 5 | 97 |
| 4473 | `groupOf` | `03-socket-pool.js` | 3 | 91 |
| 4474 | `sig` | `03-socket-pool.js` | 1 | 132 |
| 4475 | `enc` | `unknown` | 0 | 102 |
| 4476 | `dec` | `05-ai-functions.js` | 1 | 99 |
| 4478 | `unique` | `unknown` | 0 | 254 |
| 4491 | `myArr` | `04-database.js` | 2 | 70 |
| 4492 | `serverArr` | `04-database.js` | 2 | 82 |
| 4493 | `activeArr` | `12-documents.js` | 2 | 86 |
| 4495 | `syncWindowCaches` | `04-database.js` | 43 | 739 |
| 4511 | `saveMyLocal` | `04-database.js` | 5 | 315 |
| 4521 | `saveServerLocal` | `04-database.js` | 9 | 339 |
| 4529 | `setActiveDb` | `04-database.js` | 2 | 135 |
| 4534 | `upsert` | `02-shield-configurator.js` | 1 | 439 |
| 4544 | `epSaveMyDbToServer` | `04-database.js` | 14 | 471 |
| 4559 | `epSaveServerDbToServer` | `04-database.js` | 14 | 411 |
| 4572 | `epSendServerProposal` | `04-database.js` | 9 | 563 |
| 4589 | `epLoadDbFromServer` | `04-database.js` | 47 | 2312 |
| 4641 | `sourceSwitcherHtml` | `04-database.js` | 9 | 1033 |
| 4654 | `renderCatalog` | `10-estimate-views.js` | 3 | 1509 |
| 4676 | `catalogRow` | `10-estimate-views.js` | 10 | 835 |
| 4697 | `editorTop` | `04-database.js` | 7 | 2726 |
| 4723 | `renderDbRows` | `04-database.js` | 7 | 1318 |
| 4746 | `editorRow` | `10-estimate-views.js` | 10 | 1052 |
| 4869 | `reviewedItems` | `04-database.js` | 11 | 1019 |
| 4905 | `downloadJson` | `11-pdf-files.js` | 7 | 359 |
| 4931 | `localFullCleanOnly` | `04-database.js` | 8 | 466 |
| 4952 | `commitCollection` | `04-database.js` | 10 | 645 |
| 4995 | `autoGroupMaterial` | `02-shield-configurator.js` | 10 | 2557 |
| 5017 | `autoGroupWork` | `02-shield-configurator.js` | 9 | 2417 |
| 5044 | `serverModalRow` | `10-estimate-views.js` | 7 | 490 |
| 5049 | `renderServerModalList` | `01-visual.js` | 5 | 1194 |
| 5097 | `epRefreshDbScopeUi` | `04-database.js` | 6 | 683 |
| 5105 | `install` | `04-database.js` | 9 | 354 |
| 5148 | `$` | `12-documents.js` | 2 | 53 |
| 5149 | `msg` | `01-visual.js` | 5 | 83 |
| 5150 | `isAdmin` | `07-settings.js` | 5 | 108 |
| 5151 | `uid` | `07-settings.js` | 2 | 92 |
| 5152 | `scope` | `10-estimate-views.js` | 1 | 120 |
| 5153 | `setScope` | `10-estimate-views.js` | 1 | 106 |
| 5154 | `readArr` | `05-ai-functions.js` | 1 | 138 |
| 5155 | `writeArr` | `10-estimate-views.js` | 2 | 237 |
| 5156 | `readObj` | `05-ai-functions.js` | 1 | 148 |
| 5157 | `writeObj` | `10-estimate-views.js` | 1 | 92 |
| 5158 | `clean` | `unknown` | 0 | 149 |
| 5159 | `groupOf` | `03-socket-pool.js` | 3 | 91 |
| 5160 | `clone` | `unknown` | 0 | 104 |
| 5161 | `sig` | `03-socket-pool.js` | 1 | 128 |
| 5162 | `activeTarget` | `12-documents.js` | 2 | 88 |
| 5164 | `getMy` | `04-database.js` | 4 | 223 |
| 5169 | `getServer` | `04-database.js` | 8 | 292 |
| 5176 | `setMy` | `04-database.js` | 11 | 378 |
| 5184 | `setServer` | `04-database.js` | 32 | 605 |
| 5197 | `syncMainArrays` | `04-database.js` | 32 | 456 |
| 5211 | `unique` | `04-database.js` | 1 | 469 |
| 5226 | `upsert` | `02-shield-configurator.js` | 1 | 653 |
| 5238 | `reviewedItems` | `04-database.js` | 21 | 1173 |
| 5262 | `saveMyRemote` | `04-database.js` | 12 | 527 |
| 5278 | `saveServerRemote` | `04-database.js` | 12 | 426 |
| 5291 | `rerender` | `04-database.js` | 22 | 553 |
| 5377 | `$` | `12-documents.js` | 2 | 53 |
| 5378 | `toast` | `01-visual.js` | 6 | 91 |
| 5379 | `uid` | `07-settings.js` | 2 | 92 |
| 5380 | `isAdmin` | `07-settings.js` | 5 | 108 |
| 5381 | `setScope` | `10-estimate-views.js` | 1 | 106 |
| 5382 | `getScope` | `10-estimate-views.js` | 1 | 123 |
| 5383 | `label` | `unknown` | 0 | 85 |
| 5384 | `readArr` | `05-ai-functions.js` | 1 | 138 |
| 5385 | `writeArr` | `10-estimate-views.js` | 2 | 237 |
| 5386 | `readObj` | `05-ai-functions.js` | 1 | 148 |
| 5387 | `writeObj` | `10-estimate-views.js` | 1 | 92 |
| 5388 | `clean` | `unknown` | 0 | 149 |
| 5389 | `groupOf` | `03-socket-pool.js` | 3 | 91 |
| 5390 | `clone` | `unknown` | 0 | 104 |
| 5391 | `sig` | `03-socket-pool.js` | 1 | 128 |
| 5392 | `unique` | `unknown` | 0 | 344 |
| 5406 | `getServerFromCache` | `04-database.js` | 6 | 164 |
| 5411 | `setMyArrays` | `04-database.js` | 14 | 288 |
| 5421 | `setServerArrays` | `04-database.js` | 33 | 463 |
| 5431 | `syncActiveArrays` | `04-database.js` | 36 | 848 |
| 5448 | `refreshMyFromServer` | `04-database.js` | 22 | 621 |
| 5463 | `refreshServerFromServer` | `04-database.js` | 32 | 955 |
| 5481 | `isVisible` | `unknown` | 0 | 119 |
| 5482 | `updateButtons` | `04-database.js` | 7 | 880 |
| 5493 | `rerenderOpenScreens` | `01-visual.js` | 23 | 739 |
| 5570 | `$` | `12-documents.js` | 2 | 53 |
| 5571 | `toast` | `01-visual.js` | 6 | 125 |
| 5572 | `uid` | `07-settings.js` | 2 | 92 |
| 5573 | `isAdmin` | `07-settings.js` | 5 | 108 |
| 5574 | `setScope` | `10-estimate-views.js` | 1 | 106 |
| 5575 | `getScope` | `10-estimate-views.js` | 1 | 123 |
| 5576 | `hardHideLoader` | `01-visual.js` | 10 | 185 |
| 5580 | `showReadLoader` | `01-visual.js` | 8 | 142 |
| 5581 | `esc` | `10-estimate-views.js` | 5 | 25041 |
| 5582 | `cleanText` | `unknown` | 0 | 86 |
| 5583 | `money` | `08-accounting.js` | 2 | 141 |
| 5584 | `norm` | `unknown` | 0 | 148 |
| 5585 | `readArr` | `05-ai-functions.js` | 1 | 138 |
| 5586 | `writeArr` | `10-estimate-views.js` | 2 | 237 |
| 5587 | `readObj` | `05-ai-functions.js` | 1 | 148 |
| 5588 | `writeObj` | `10-estimate-views.js` | 1 | 92 |
| 5589 | `groupOf` | `03-socket-pool.js` | 3 | 91 |
| 5590 | `clone` | `unknown` | 0 | 104 |
| 5591 | `sig` | `03-socket-pool.js` | 1 | 127 |
| 5592 | `unique` | `04-database.js` | 1 | 469 |
| 5607 | `getMy` | `04-database.js` | 4 | 216 |
| 5612 | `getServer` | `04-database.js` | 8 | 292 |
| 5619 | `syncMainArrays` | `04-database.js` | 22 | 379 |
| 5632 | `setMy` | `04-database.js` | 11 | 378 |
| 5640 | `setServer` | `04-database.js` | 32 | 605 |
| 5653 | `upsert` | `02-shield-configurator.js` | 1 | 538 |
| 5664 | `saveMyRemote` | `04-database.js` | 12 | 527 |
| 5680 | `saveServerRemote` | `04-database.js` | 12 | 426 |
| 5693 | `rerender` | `04-database.js` | 22 | 553 |
| 5700 | `fileText` | `11-pdf-files.js` | 5 | 200 |
| 5701 | `fileBuffer` | `11-pdf-files.js` | 5 | 195 |
| 5702 | `csvRows` | `06-single-line-scheme.js` | 7 | 657 |
| 5718 | `inferCat` | `02-shield-configurator.js` | 14 | 970 |
| 5736 | `inferSub` | `02-shield-configurator.js` | 13 | 970 |
| 5760 | `normItem` | `04-database.js` | 4 | 855 |
| 5770 | `rowsToItems` | `10-estimate-views.js` | 20 | 2232 |
| 5773 | `cell` | `10-estimate-views.js` | 2 | 57 |
| 5808 | `jsonToItems` | `04-database.js` | 11 | 542 |
| 5817 | `selectedCount` | `04-database.js` | 1 | 171 |
| 5821 | `saveVisibleEdits` | `10-estimate-views.js` | 9 | 755 |
| 5841 | `renderReviewPage` | `10-estimate-views.js` | 11 | 3102 |
| 5891 | `showReview` | `01-visual.js` | 13 | 614 |
| 5902 | `aiFromImage` | `05-ai-functions.js` | 20 | 829 |
| 5912 | `aiFromText` | `05-ai-functions.js` | 14 | 611 |
| 5921 | `readDbFileV6` | `10-estimate-views.js` | 22 | 1498 |
| 5986 | `collectReviewed` | `04-database.js` | 12 | 710 |
| 6069 | `$` | `12-documents.js` | 2 | 53 |
| 6070 | `toast` | `01-visual.js` | 6 | 123 |
| 6071 | `esc` | `07-settings.js` | 7 | 10546 |
| 6072 | `norm` | `unknown` | 0 | 146 |
| 6073 | `cleanText` | `unknown` | 0 | 80 |
| 6074 | `money` | `08-accounting.js` | 2 | 128 |
| 6075 | `uid` | `07-settings.js` | 2 | 84 |
| 6076 | `isAdmin` | `07-settings.js` | 5 | 102 |
| 6077 | `scope` | `10-estimate-views.js` | 1 | 110 |
| 6078 | `setScope` | `10-estimate-views.js` | 1 | 98 |
| 6079 | `label` | `unknown` | 0 | 76 |
| 6080 | `canEditActive` | `12-documents.js` | 2 | 87 |
| 6081 | `readArr` | `05-ai-functions.js` | 1 | 125 |
| 6082 | `writeArr` | `10-estimate-views.js` | 2 | 224 |
| 6083 | `readObj` | `05-ai-functions.js` | 1 | 131 |
| 6084 | `writeObj` | `10-estimate-views.js` | 1 | 87 |
| 6085 | `groupOf` | `03-socket-pool.js` | 3 | 81 |
| 6086 | `clone` | `unknown` | 0 | 99 |
| 6087 | `sig` | `03-socket-pool.js` | 1 | 114 |
| 6088 | `unique` | `04-database.js` | 1 | 355 |
| 6089 | `getMy` | `04-database.js` | 4 | 158 |
| 6090 | `getServer` | `04-database.js` | 8 | 229 |
| 6091 | `active` | `12-documents.js` | 2 | 79 |
| 6092 | `setMy` | `04-database.js` | 10 | 261 |
| 6093 | `setServer` | `04-database.js` | 32 | 504 |
| 6094 | `syncMain` | `04-database.js` | 17 | 251 |
| 6095 | `upsert` | `02-shield-configurator.js` | 1 | 511 |
| 6097 | `ensureProgress` | `10-estimate-views.js` | 8 | 1807 |
| 6110 | `showProgress` | `01-visual.js` | 6 | 456 |
| 6111 | `hideProgress` | `01-visual.js` | 2 | 82 |
| 6113 | `saveMyRemote` | `04-database.js` | 14 | 521 |
| 6124 | `saveServerRemote` | `04-database.js` | 14 | 474 |
| 6135 | `sendProposal` | `04-database.js` | 12 | 603 |
| 6143 | `reloadActiveDb` | `04-database.js` | 11 | 558 |
| 6150 | `ensurePanel` | `04-database.js` | 3 | 294 |
| 6156 | `renderPanel` | `04-database.js` | 14 | 2680 |
| 6187 | `tuneStaticBlocks` | `04-database.js` | 16 | 1182 |
| 6202 | `editorTop` | `04-database.js` | 7 | 1588 |
| 6216 | `editorRow` | `10-estimate-views.js` | 12 | 1205 |
| 6225 | `renderRows` | `04-database.js` | 6 | 1212 |
| 6273 | `downloadJson` | `11-pdf-files.js` | 8 | 567 |
| 6285 | `fileTextProgress` | `11-pdf-files.js` | 5 | 314 |
| 6286 | `fileBufferProgress` | `11-pdf-files.js` | 5 | 311 |
| 6287 | `csvRows` | `06-single-line-scheme.js` | 8 | 550 |
| 6288 | `inferCat` | `02-shield-configurator.js` | 14 | 877 |
| 6289 | `inferSub` | `02-shield-configurator.js` | 13 | 849 |
| 6290 | `normItem` | `04-database.js` | 4 | 716 |
| 6291 | `rowsToItems` | `10-estimate-views.js` | 22 | 1815 |
| 6291 | `cell` | `10-estimate-views.js` | 2 | 53 |
| 6292 | `jsonToItems` | `04-database.js` | 11 | 466 |
| 6293 | `showReview` | `01-visual.js` | 10 | 613 |
| 6294 | `readDbFile` | `10-estimate-views.js` | 15 | 1278 |
| 6302 | `saveVisibleEdits` | `04-database.js` | 14 | 544 |
| 6303 | `collectReviewed` | `04-database.js` | 12 | 568 |
| 6310 | `install` | `04-database.js` | 3 | 136 |
| 6340 | `$` | `12-documents.js` | 2 | 53 |
| 6341 | `toast` | `01-visual.js` | 6 | 131 |
| 6342 | `esc` | `04-database.js` | 6 | 46777 |
| 6343 | `norm` | `unknown` | 0 | 146 |
| 6344 | `money` | `08-accounting.js` | 2 | 128 |
| 6345 | `groupOf` | `03-socket-pool.js` | 3 | 81 |
| 6346 | `clean` | `unknown` | 0 | 69 |
| 6347 | `sig` | `03-socket-pool.js` | 1 | 114 |
| 6348 | `clone` | `unknown` | 0 | 99 |
| 6349 | `scope` | `10-estimate-views.js` | 1 | 110 |
| 6350 | `setScope` | `10-estimate-views.js` | 1 | 97 |
| 6351 | `fbUser` | `07-settings.js` | 7 | 176 |
| 6352 | `uid` | `07-settings.js` | 4 | 118 |
| 6353 | `currentEmail` | `05-ai-functions.js` | 4 | 153 |
| 6354 | `isAdmin` | `07-settings.js` | 11 | 271 |
| 6361 | `canEdit` | `07-settings.js` | 1 | 81 |
| 6362 | `label` | `unknown` | 0 | 76 |
| 6363 | `readArr` | `05-ai-functions.js` | 1 | 130 |
| 6364 | `writeArr` | `10-estimate-views.js` | 2 | 224 |
| 6365 | `readObj` | `05-ai-functions.js` | 1 | 136 |
| 6366 | `writeObj` | `10-estimate-views.js` | 1 | 89 |
| 6367 | `unique` | `04-database.js` | 1 | 405 |
| 6368 | `getMy` | `04-database.js` | 4 | 158 |
| 6369 | `getServer` | `04-database.js` | 8 | 233 |
| 6370 | `setMy` | `04-database.js` | 10 | 264 |
| 6371 | `setServer` | `04-database.js` | 32 | 508 |
| 6372 | `syncMain` | `04-database.js` | 17 | 254 |
| 6373 | `active` | `12-documents.js` | 2 | 79 |
| 6374 | `upsert` | `02-shield-configurator.js` | 1 | 514 |
| 6376 | `ensureProgress` | `12-documents.js` | 4 | 924 |
| 6382 | `showProgress` | `01-visual.js` | 6 | 453 |
| 6383 | `hideProgress` | `01-visual.js` | 2 | 82 |
| 6385 | `firebaseHint` | `04-database.js` | 5 | 261 |
| 6390 | `explainErr` | `05-ai-functions.js` | 4 | 321 |
| 6396 | `saveMyRemote` | `04-database.js` | 18 | 873 |
| 6415 | `saveServerRemote` | `04-database.js` | 22 | 740 |
| 6430 | `sendProposal` | `04-database.js` | 12 | 632 |
| 6446 | `reloadFromRemoteCurrent` | `04-database.js` | 31 | 732 |
| 6459 | `rerender` | `01-visual.js` | 4 | 167 |
| 6460 | `currentEditType` | `04-database.js` | 4 | 269 |
| 6466 | `makeManualItem` | `04-database.js` | 9 | 579 |
| 6562 | `saveVisibleEdits` | `04-database.js` | 14 | 607 |
| 6570 | `normItem` | `04-database.js` | 4 | 568 |
| 6578 | `collectReviewed` | `04-database.js` | 12 | 581 |
| 6619 | `injectDebugButton` | `04-database.js` | 4 | 384 |
| 6655 | `$` | `12-documents.js` | 2 | 53 |
| 6656 | `toast` | `01-visual.js` | 7 | 117 |
| 6657 | `esc` | `07-settings.js` | 17 | 27184 |
| 6658 | `clean` | `unknown` | 0 | 76 |
| 6659 | `norm` | `unknown` | 0 | 141 |
| 6660 | `money` | `08-accounting.js` | 2 | 128 |
| 6661 | `scope` | `10-estimate-views.js` | 1 | 110 |
| 6662 | `setScope` | `10-estimate-views.js` | 1 | 100 |
| 6663 | `isAdmin` | `07-settings.js` | 5 | 113 |
| 6664 | `uid` | `07-settings.js` | 9 | 222 |
| 6665 | `currentUserLabel` | `07-settings.js` | 15 | 283 |
| 6666 | `readArr` | `05-ai-functions.js` | 1 | 130 |
| 6667 | `writeArr` | `10-estimate-views.js` | 2 | 226 |
| 6668 | `readObj` | `05-ai-functions.js` | 1 | 136 |
| 6669 | `writeObj` | `10-estimate-views.js` | 1 | 89 |
| 6670 | `clone` | `unknown` | 0 | 52 |
| 6671 | `groupOf` | `03-socket-pool.js` | 3 | 81 |
| 6672 | `sig` | `03-socket-pool.js` | 1 | 114 |
| 6673 | `unique` | `04-database.js` | 1 | 405 |
| 6674 | `getServer` | `04-database.js` | 8 | 234 |
| 6675 | `getMy` | `04-database.js` | 4 | 158 |
| 6676 | `setServer` | `04-database.js` | 32 | 531 |
| 6677 | `setMy` | `04-database.js` | 10 | 283 |
| 6678 | `syncMain` | `04-database.js` | 17 | 254 |
| 6679 | `upsert` | `02-shield-configurator.js` | 1 | 611 |
| 6681 | `ensureProgress` | `12-documents.js` | 4 | 898 |
| 6687 | `progress` | `01-visual.js` | 4 | 422 |
| 6688 | `hideProgress` | `01-visual.js` | 2 | 82 |
| 6689 | `explain` | `05-ai-functions.js` | 4 | 280 |
| 6691 | `inferCat` | `02-shield-configurator.js` | 13 | 790 |
| 6695 | `inferSub` | `02-shield-configurator.js` | 11 | 538 |
| 6696 | `normItem` | `08-accounting.js` | 5 | 839 |
| 6697 | `collectReviewed` | `04-database.js` | 26 | 1071 |
| 6710 | `readGlobalDoc` | `04-database.js` | 22 | 356 |
| 6716 | `saveGlobalImport` | `04-database.js` | 47 | 1635 |
| 6735 | `saveMyImport` | `04-database.js` | 13 | 723 |
| 6744 | `sendServerProposal` | `04-database.js` | 13 | 506 |
| 6750 | `rerender` | `01-visual.js` | 4 | 167 |
| 6778 | `fileText` | `11-pdf-files.js` | 5 | 176 |
| 6779 | `fileBuffer` | `11-pdf-files.js` | 5 | 173 |
| 6780 | `csvRows` | `06-single-line-scheme.js` | 5 | 173 |
| 6781 | `rowsToItems` | `10-estimate-views.js` | 22 | 1944 |
| 6783 | `cell` | `10-estimate-views.js` | 2 | 51 |
| 6800 | `jsonToItems` | `04-database.js` | 11 | 456 |
| 6801 | `showReviewV9` | `04-database.js` | 17 | 1712 |
| 6882 | `$` | `12-documents.js` | 2 | 53 |
| 6883 | `toast` | `01-visual.js` | 7 | 117 |
| 6884 | `progress` | `01-visual.js` | 4 | 275 |
| 6888 | `hideProgress` | `01-visual.js` | 8 | 191 |
| 6889 | `clean` | `unknown` | 0 | 76 |
| 6890 | `esc` | `05-ai-functions.js` | 31 | 53443 |
| 6891 | `money` | `08-accounting.js` | 2 | 128 |
| 6892 | `provider` | `05-ai-functions.js` | 7 | 200 |
| 6895 | `keyForProvider` | `05-ai-functions.js` | 10 | 338 |
| 6901 | `openAiModel` | `05-ai-functions.js` | 17 | 188 |
| 6902 | `dataMime` | `04-database.js` | 1 | 106 |
| 6903 | `fileToDataURL` | `11-pdf-files.js` | 5 | 184 |
| 6904 | `extractTextFromOpenAI` | `05-ai-functions.js` | 4 | 319 |
| 6910 | `askOpenAI` | `05-ai-functions.js` | 34 | 1000 |
| 6926 | `askGemini` | `05-ai-functions.js` | 9 | 942 |
| 6952 | `stripCode` | `unknown` | 0 | 0 |
| 6953 | `parseJsonLoose` | `05-ai-functions.js` | 2 | 109 |
| 6959 | `inferCat` | `02-shield-configurator.js` | 12 | 991 |
| 6977 | `inferSub` | `03-socket-pool.js` | 14 | 990 |
| 6994 | `normItem` | `04-database.js` | 10 | 877 |
| 7004 | `normalize` | `04-database.js` | 4 | 259 |
| 7005 | `unique` | `10-estimate-views.js` | 2 | 206 |
| 7006 | `showReview` | `10-estimate-views.js` | 14 | 2097 |
| 7019 | `importPrompt` | `04-database.js` | 5 | 657 |
| 7026 | `aiFromImageFile` | `05-ai-functions.js` | 18 | 499 |
| 7035 | `aiFromPdfFile` | `11-pdf-files.js` | 23 | 723 |
| 7066 | `patchLabels` | `11-pdf-files.js` | 6 | 513 |
| 7101 | `$` | `12-documents.js` | 2 | 53 |
| 7102 | `txt` | `unknown` | 0 | 109 |
| 7103 | `toast` | `01-visual.js` | 7 | 117 |
| 7104 | `scope` | `04-database.js` | 1 | 128 |
| 7105 | `isAdmin` | `05-ai-functions.js` | 6 | 272 |
| 7112 | `adminServerMode` | `07-settings.js` | 4 | 94 |
| 7113 | `explainServerEdit` | `05-ai-functions.js` | 2 | 217 |
| 7115 | `ensureProgress` | `10-estimate-views.js` | 6 | 1286 |
| 7143 | `setScope` | `04-database.js` | 3 | 242 |
| 7175 | `installAdminSettingsButton` | `07-settings.js` | 14 | 1010 |
| 7188 | `normalDbButtonWasClicked` | `04-database.js` | 3 | 271 |
| 7210 | `patchDbUi` | `07-settings.js` | 6 | 2225 |
| 7270 | `importTarget` | `04-database.js` | 2 | 162 |
| 7329 | `compressImageDataUrl` | `11-pdf-files.js` | 9 | 1000 |
| 7353 | `timeoutPromise` | `05-ai-functions.js` | 2 | 248 |
| 7387 | `patchAll` | `07-settings.js` | 3 | 65 |
| 7412 | `$` | `12-documents.js` | 2 | 53 |
| 7413 | `toast` | `01-visual.js` | 6 | 123 |
| 7414 | `esc` | `04-database.js` | 4 | 41564 |
| 7415 | `norm` | `unknown` | 0 | 131 |
| 7416 | `money` | `08-accounting.js` | 2 | 129 |
| 7417 | `appPrice` | `08-accounting.js` | 3 | 109 |
| 7418 | `readArr` | `05-ai-functions.js` | 1 | 130 |
| 7419 | `readObj` | `05-ai-functions.js` | 1 | 136 |
| 7420 | `wallFromName` | `04-database.js` | 1 | 189 |
| 7421 | `groupOf` | `03-socket-pool.js` | 3 | 91 |
| 7422 | `clone` | `unknown` | 0 | 55 |
| 7424 | `fixShieldWorkItem` | `02-shield-configurator.js` | 16 | 1732 |
| 7486 | `normalizeCurrentEstimate` | `10-estimate-views.js` | 5 | 271 |
| 7517 | `patchShieldButton` | `02-shield-configurator.js` | 9 | 792 |
| 7535 | `tagSrc` | `02-shield-configurator.js` | 1 | 90 |
| 7536 | `pushArr` | `unknown` | 0 | 126 |
| 7537 | `collectDb` | `04-database.js` | 42 | 1760 |
| 7567 | `classify` | `02-shield-configurator.js` | 25 | 1324 |
| 7594 | `sameClass` | `04-database.js` | 6 | 319 |
| 7603 | `score` | `03-socket-pool.js` | 5 | 527 |
| 7614 | `swapLabel` | `08-accounting.js` | 1 | 137 |
| 7667 | `boot` | `01-visual.js` | 4 | 143 |
| 7698 | `$` | `12-documents.js` | 2 | 53 |
| 7699 | `norm` | `unknown` | 0 | 116 |
| 7700 | `clean` | `unknown` | 0 | 69 |
| 7717 | `add` | `02-shield-configurator.js` | 1 | 146 |
| 7728 | `val` | `unknown` | 0 | 53 |
| 7728 | `chk` | `unknown` | 0 | 57 |
| 7729 | `add` | `03-socket-pool.js` | 3 | 80 |
| 7730 | `room` | `02-shield-configurator.js` | 2 | 192 |
| 7780 | `boot` | `01-visual.js` | 2 | 122 |
| 7798 | `$` | `12-documents.js` | 2 | 51 |
| 7799 | `esc` | `02-shield-configurator.js` | 19 | 31431 |
| 7800 | `epV16GenerateCascadePanel` | `02-shield-configurator.js` | 22 | 13512 |
| 7812 | `addLine` | `03-socket-pool.js` | 3 | 220 |
| 7816 | `addRoom` | `02-shield-configurator.js` | 2 | 301 |
| 7846 | `groupAssignment` | `03-socket-pool.js` | 9 | 286 |
| 7851 | `addProtection` | `03-socket-pool.js` | 6 | 392 |
| 7861 | `mat` | `08-accounting.js` | 2 | 381 |
| 7868 | `work` | `04-database.js` | 3 | 365 |
| 7938 | `isShieldDeviceV16` | `02-shield-configurator.js` | 10 | 290 |
| 7943 | `getAssignV16` | `04-database.js` | 2 | 498 |
| 7945 | `add` | `02-shield-configurator.js` | 1 | 146 |
| 7949 | `purposeV16` | `02-shield-configurator.js` | 1 | 97 |
| 7950 | `normalizeV16` | `10-estimate-views.js` | 2 | 107 |
| 7951 | `showDetailsV16` | `01-visual.js` | 12 | 1142 |
| 7977 | `bindButtons` | `02-shield-configurator.js` | 2 | 229 |
| 7987 | `boot` | `01-visual.js` | 2 | 111 |
| 8007 | `$` | `12-documents.js` | 2 | 53 |
| 8008 | `txt` | `unknown` | 0 | 47 |
| 8009 | `clean` | `unknown` | 0 | 62 |
| 8010 | `norm` | `unknown` | 0 | 89 |
| 8011 | `esc` | `01-visual.js` | 8 | 44730 |
| 8012 | `toast` | `01-visual.js` | 6 | 123 |
| 8013 | `addBadge` | `12-documents.js` | 5 | 433 |
| 8020 | `brandRu` | `unknown` | 0 | 91 |
| 8021 | `lineConfig` | `02-shield-configurator.js` | 24 | 1632 |
| 8022 | `e` | `unknown` | 0 | 31 |
| 8022 | `ch` | `unknown` | 0 | 56 |
| 8023 | `add` | `03-socket-pool.js` | 1 | 64 |
| 8024 | `room` | `02-shield-configurator.js` | 2 | 192 |
| 8033 | `nominalOf` | `04-database.js` | 1 | 298 |
| 8038 | `isDevice` | `02-shield-configurator.js` | 9 | 333 |
| 8042 | `assignmentsOf` | `02-shield-configurator.js` | 9 | 1249 |
| 8043 | `add` | `02-shield-configurator.js` | 1 | 145 |
| 8053 | `deviceName` | `02-shield-configurator.js` | 8 | 820 |
| 8062 | `purposeOf` | `02-shield-configurator.js` | 8 | 465 |
| 8105 | `patchDbBulk` | `04-database.js` | 12 | 1157 |
| 8116 | `move` | `04-database.js` | 2 | 186 |
| 8126 | `boot` | `01-visual.js` | 6 | 202 |
| 8151 | `$` | `12-documents.js` | 2 | 53 |
| 8152 | `esc` | `10-estimate-views.js` | 6 | 49732 |
| 8153 | `clean` | `unknown` | 0 | 76 |
| 8154 | `norm` | `unknown` | 0 | 104 |
| 8155 | `toast` | `01-visual.js` | 6 | 123 |
| 8156 | `arrLS` | `05-ai-functions.js` | 1 | 128 |
| 8157 | `objLS` | `05-ai-functions.js` | 1 | 134 |
| 8158 | `setLS` | `10-estimate-views.js` | 2 | 223 |
| 8159 | `setObjLS` | `10-estimate-views.js` | 1 | 89 |
| 8160 | `scope` | `10-estimate-views.js` | 1 | 114 |
| 8161 | `isAdmin` | `07-settings.js` | 5 | 106 |
| 8162 | `uid` | `07-settings.js` | 2 | 92 |
| 8163 | `groupOf` | `03-socket-pool.js` | 3 | 88 |
| 8164 | `clone` | `unknown` | 0 | 53 |
| 8165 | `getServerCache` | `04-database.js` | 15 | 152 |
| 8166 | `getArr` | `04-database.js` | 16 | 481 |
| 8177 | `unique` | `03-socket-pool.js` | 1 | 415 |
| 8180 | `syncActiveToMain` | `04-database.js` | 18 | 233 |
| 8188 | `saveArr` | `04-database.js` | 73 | 1947 |
| 8215 | `ensureBadge` | `01-visual.js` | 6 | 458 |
| 8231 | `money` | `08-accounting.js` | 2 | 128 |
| 8232 | `dbFindAuto` | `04-database.js` | 5 | 438 |
| 8237 | `dbFindRcd` | `04-database.js` | 5 | 395 |
| 8241 | `brandRu` | `unknown` | 0 | 129 |
| 8242 | `autoName` | `02-shield-configurator.js` | 5 | 517 |
| 8248 | `autoPrice` | `02-shield-configurator.js` | 3 | 191 |
| 8249 | `rcdName` | `02-shield-configurator.js` | 6 | 368 |
| 8250 | `rcdPrice` | `02-shield-configurator.js` | 3 | 130 |
| 8251 | `val` | `unknown` | 0 | 85 |
| 8252 | `chk` | `unknown` | 0 | 57 |
| 8253 | `cfgNum` | `02-shield-configurator.js` | 4 | 89 |
| 8254 | `appPrice` | `08-accounting.js` | 2 | 111 |
| 8255 | `makeItem` | `04-database.js` | 3 | 327 |
| 8256 | `mergeAssignments` | `04-database.js` | 5 | 512 |
| 8256 | `add` | `unknown` | 0 | 69 |
| 8257 | `directAddShield` | `10-estimate-views.js` | 11 | 753 |
| 8263 | `renderMainDirect` | `10-estimate-views.js` | 20 | 1331 |
| 8276 | `addLine` | `03-socket-pool.js` | 4 | 169 |
| 8277 | `room` | `02-shield-configurator.js` | 2 | 210 |
| 8286 | `groupAssign` | `03-socket-pool.js` | 4 | 239 |
| 8317 | `isShieldDevice` | `02-shield-configurator.js` | 10 | 270 |
| 8318 | `assigns` | `04-database.js` | 2 | 378 |
| 8318 | `add` | `02-shield-configurator.js` | 1 | 119 |
| 8332 | `selectedChecks` | `12-documents.js` | 2 | 194 |
| 8333 | `activeTypeFromUi` | `04-database.js` | 4 | 204 |
| 8334 | `optionsHtml` | `07-settings.js` | 6 | 316 |
| 8335 | `buildBulkPanel` | `04-database.js` | 8 | 1461 |
| 8345 | `injectBulkPanel` | `04-database.js` | 11 | 338 |
| 8351 | `injectChecks` | `10-estimate-views.js` | 16 | 1090 |
| 8355 | `refreshDbEnhancements` | `04-database.js` | 3 | 70 |
| 8385 | `boot` | `01-visual.js` | 4 | 225 |
| 8404 | `$` | `12-documents.js` | 2 | 53 |
| 8405 | `toast` | `01-visual.js` | 6 | 131 |
| 8406 | `esc` | `02-shield-configurator.js` | 4 | 16355 |
| 8407 | `money` | `08-accounting.js` | 2 | 57 |
| 8408 | `val` | `unknown` | 0 | 85 |
| 8409 | `chk` | `unknown` | 0 | 59 |
| 8410 | `cfgN` | `02-shield-configurator.js` | 4 | 107 |
| 8411 | `appPrice` | `08-accounting.js` | 2 | 118 |
| 8412 | `brandRu` | `unknown` | 0 | 313 |
| 8413 | `curveNom` | `unknown` | 0 | 200 |
| 8414 | `autoName` | `02-shield-configurator.js` | 2 | 283 |
| 8415 | `autoPrice` | `04-database.js` | 6 | 679 |
| 8426 | `rcdName` | `02-shield-configurator.js` | 9 | 281 |
| 8427 | `rcdPrice` | `02-shield-configurator.js` | 8 | 587 |
| 8436 | `makeItem` | `04-database.js` | 3 | 498 |
| 8442 | `groupLines` | `06-single-line-scheme.js` | 6 | 288 |
| 8447 | `buildLines` | `02-shield-configurator.js` | 17 | 1715 |
| 8449 | `add` | `03-socket-pool.js` | 4 | 177 |
| 8450 | `room` | `02-shield-configurator.js` | 2 | 202 |
| 8465 | `addShieldToEstimate` | `10-estimate-views.js` | 14 | 545 |
| 8476 | `groupAssign` | `03-socket-pool.js` | 4 | 214 |
| 8520 | `getAssigns` | `04-database.js` | 2 | 403 |
| 8520 | `add` | `02-shield-configurator.js` | 1 | 131 |
| 8521 | `isDevice` | `02-shield-configurator.js` | 3 | 164 |
| 8538 | `patchButtons` | `02-shield-configurator.js` | 2 | 293 |
| 8539 | `boot` | `01-visual.js` | 3 | 147 |
| 8558 | `$` | `12-documents.js` | 2 | 53 |
| 8559 | `text` | `unknown` | 0 | 48 |
| 8560 | `clean` | `unknown` | 0 | 63 |
| 8561 | `esc` | `01-visual.js` | 5 | 18964 |
| 8562 | `toast` | `01-visual.js` | 6 | 131 |
| 8563 | `money` | `08-accounting.js` | 2 | 109 |
| 8564 | `val` | `unknown` | 0 | 85 |
| 8565 | `chk` | `unknown` | 0 | 59 |
| 8566 | `count` | `02-shield-configurator.js` | 2 | 236 |
| 8573 | `appPrice` | `08-accounting.js` | 2 | 118 |
| 8574 | `brandRu` | `unknown` | 0 | 313 |
| 8575 | `norm` | `unknown` | 0 | 104 |
| 8576 | `activeMatDb` | `04-database.js` | 12 | 479 |
| 8584 | `curveNom` | `unknown` | 0 | 200 |
| 8585 | `dbFindAuto` | `02-shield-configurator.js` | 4 | 637 |
| 8589 | `dbFindRcd` | `02-shield-configurator.js` | 6 | 442 |
| 8593 | `modelFromDbName` | `04-database.js` | 2 | 122 |
| 8594 | `autoName` | `05-ai-functions.js` | 4 | 388 |
| 8595 | `autoPrice` | `02-shield-configurator.js` | 3 | 275 |
| 8596 | `rcdName` | `02-shield-configurator.js` | 10 | 424 |
| 8597 | `rcdPrice` | `02-shield-configurator.js` | 5 | 206 |
| 8598 | `item` | `10-estimate-views.js` | 3 | 496 |
| 8604 | `addUniqueAssign` | `05-ai-functions.js` | 3 | 469 |
| 8609 | `directAdd` | `10-estimate-views.js` | 13 | 1049 |
| 8616 | `buildLines` | `02-shield-configurator.js` | 9 | 1757 |
| 8618 | `add` | `03-socket-pool.js` | 4 | 193 |
| 8619 | `room` | `02-shield-configurator.js` | 2 | 182 |
| 8638 | `groupNominals` | `03-socket-pool.js` | 2 | 313 |
| 8639 | `presentGroups` | `03-socket-pool.js` | 5 | 153 |
| 8645 | `groupAssign` | `03-socket-pool.js` | 4 | 220 |
| 8686 | `getAssigns` | `04-database.js` | 2 | 319 |
| 8686 | `add` | `02-shield-configurator.js` | 1 | 119 |
| 8687 | `isDevice` | `02-shield-configurator.js` | 3 | 156 |
| 8699 | `patchButtons` | `02-shield-configurator.js` | 2 | 299 |
| 8707 | `boot` | `01-visual.js` | 3 | 147 |
| 8731 | `$` | `12-documents.js` | 2 | 53 |
| 8732 | `clean` | `unknown` | 0 | 76 |
| 8733 | `esc` | `unknown` | 0 | 0 |
| 8734 | `toast` | `01-visual.js` | 6 | 123 |
| 8735 | `arrLS` | `05-ai-functions.js` | 1 | 128 |
| 8736 | `objLS` | `05-ai-functions.js` | 1 | 134 |
| 8737 | `setArrLS` | `10-estimate-views.js` | 2 | 229 |
| 8738 | `setObjLS` | `10-estimate-views.js` | 1 | 90 |
| 8739 | `scope` | `10-estimate-views.js` | 1 | 114 |
| 8740 | `isAdmin` | `07-settings.js` | 5 | 113 |
| 8741 | `uid` | `07-settings.js` | 2 | 99 |
| 8742 | `groupOf` | `03-socket-pool.js` | 3 | 88 |
| 8743 | `clone` | `unknown` | 0 | 53 |
| 8744 | `norm` | `unknown` | 0 | 104 |
| 8745 | `uniq` | `03-socket-pool.js` | 1 | 456 |
| 8756 | `getServerCache` | `04-database.js` | 15 | 152 |
| 8757 | `getArr` | `04-database.js` | 16 | 469 |
| 8768 | `syncMain` | `04-database.js` | 18 | 173 |
| 8771 | `setStatus` | `01-visual.js` | 8 | 779 |
| 8779 | `saveArr` | `04-database.js` | 74 | 1878 |
| 8802 | `activeType` | `12-documents.js` | 7 | 461 |
| 8809 | `visibleHost` | `04-database.js` | 3 | 79 |
| 8810 | `options` | `07-settings.js` | 6 | 419 |
| 8817 | `fillSelectors` | `12-documents.js` | 7 | 612 |
| 8828 | `panelHtml` | `08-accounting.js` | 7 | 1417 |
| 8844 | `hideOldBulk` | `04-database.js` | 6 | 183 |
| 8847 | `rowId` | `10-estimate-views.js` | 13 | 588 |
| 8853 | `ensureChecks` | `10-estimate-views.js` | 8 | 763 |
| 8866 | `ensurePanel` | `04-database.js` | 5 | 387 |
| 8875 | `selected` | `01-visual.js` | 2 | 154 |
| 8916 | `boot` | `01-visual.js` | 2 | 112 |

## Window-привязки

| Строка | Имя | Куда похоже | Score |
|---:|---|---|---:|
| 2 | `window.EP_REFACTOR_RUNTIME_VERSION` | `12-documents.js` | 8 |
| 17 | `window.onerror` | `01-visual.js` | 9 |
| 140 | `window.customAlert` | `12-documents.js` | 22 |
| 152 | `window.customConfirm` | `12-documents.js` | 18 |
| 165 | `window.alert` | `11-pdf-files.js` | 18 |
| 476 | `window.EP_AI_CONFIG` | `05-ai-functions.js` | 19 |
| 483 | `window.EP_DB_REVIEW` | `05-ai-functions.js` | 14 |
| 527 | `window.epSetAiProvider` | `05-ai-functions.js` | 17 |
| 549 | `window.epRefreshProviderUI` | `05-ai-functions.js` | 24 |
| 662 | `window.epClearLocalAiKeys` | `05-ai-functions.js` | 14 |
| 703 | `window.epSaveAiConfig` | `05-ai-functions.js` | 30 |
| 722 | `window.EP_AI_CONFIG` | `05-ai-functions.js` | 32 |
| 774 | `window.saveApiKey` | `07-settings.js` | 16 |
| 923 | `window.epAskAI` | `05-ai-functions.js` | 11 |
| 1019 | `window.runAiCheck` | `05-ai-functions.js` | 14 |
| 1044 | `window.aiSupply` | `05-ai-functions.js` | 19 |
| 1056 | `window.aiPueHelper` | `05-ai-functions.js` | 17 |
| 1067 | `window.compareShopsAI` | `01-visual.js` | 13 |
| 1255 | `window.epTriggerDbFileImport` | `04-database.js` | 18 |
| 1266 | `window.epOpenTextImport` | `04-database.js` | 12 |
| 1273 | `window.epRunTextImport` | `11-pdf-files.js` | 12 |
| 1536 | `window.epReviewCheckAll` | `05-ai-functions.js` | 8 |
| 1543 | `window.EP_DB_REVIEW` | `10-estimate-views.js` | 9 |
| 1610 | `window.epApplyReviewedDbItems` | `04-database.js` | 9 |
| 1651 | `window.epExportMyDb` | `04-database.js` | 44 |
| 1660 | `window.epExportGlobalDb` | `04-database.js` | 36 |
| 1673 | `window.renderDbEditors` | `04-database.js` | 13 |
| 1719 | `window.epDeleteDbItem` | `04-database.js` | 10 |
| 1746 | `window.addDbItem` | `04-database.js` | 15 |
| 1774 | `window.requestPriceChange` | `04-database.js` | 9 |
| 1836 | `window.epAdminResolveDbProposal` | `04-database.js` | 10 |
| 1878 | `window.finishLoginSetup` | `07-settings.js` | 15 |
| 1935 | `window.EP_DB_PROPOSALS_CACHE_V2` | `04-database.js` | 19 |
| 2047 | `window.epToggleSubCat` | `10-estimate-views.js` | 14 |
| 2048 | `window.epPromptGroupedAdd` | `10-estimate-views.js` | 14 |
| 2051 | `window.pendingAdd` | `04-database.js` | 13 |
| 2057 | `window.promptAdd` | `04-database.js` | 17 |
| 2058 | `window.openWorkCatalog` | `04-database.js` | 26 |
| 2060 | `window.openMatCatalog` | `04-database.js` | 20 |
| 2065 | `window.renderDbEditors` | `04-database.js` | 31 |
| 2087 | `window.epOpenGlobalDbModal` | `01-visual.js` | 24 |
| 2088 | `window.epSwitchGlobalDbTab` | `04-database.js` | 25 |
| 2089 | `window.epGlobalSelectAll` | `04-database.js` | 22 |
| 2097 | `window.epAddSelectedGlobalToMyDb` | `04-database.js` | 28 |
| 2117 | `window.openModal` | `04-database.js` | 14 |
| 2146 | `window.epOpenProposalDetail` | `04-database.js` | 13 |
| 2161 | `window.epProposalSelectAll` | `04-database.js` | 13 |
| 2162 | `window.epResolveProposalOne` | `04-database.js` | 14 |
| 2163 | `window.epResolveProposalItems` | `04-database.js` | 12 |
| 2208 | `window.EP_DB_PROPOSALS_CACHE_V2` | `04-database.js` | 24 |
| 2217 | `window.finishLoginSetup` | `04-database.js` | 8 |
| 2326 | `window.matDB` | `04-database.js` | 12 |
| 2327 | `window.userMatDB` | `04-database.js` | 8 |
| 2371 | `window.epToggleShieldDbSub` | `04-database.js` | 18 |
| 2372 | `window.epPromptShieldGroupedAdd` | `01-visual.js` | 18 |
| 2376 | `window.pendingAdd` | `01-visual.js` | 25 |
| 2386 | `window.openMatCatalog` | `04-database.js` | 31 |
| 2387 | `window.openWorkCatalog` | `04-database.js` | 44 |
| 2388 | `window.renderDbEditors` | `04-database.js` | 41 |
| 2427 | `window.epGenerateShieldFixed` | `02-shield-configurator.js` | 22 |
| 2520 | `window.currentShieldExtras` | `01-visual.js` | 13 |
| 2533 | `window.generateCascadePanel` | `12-documents.js` | 10 |
| 2565 | `window.matDB` | `04-database.js` | 12 |
| 2565 | `window.workDB` | `04-database.js` | 11 |
| 2623 | `window.epDbToggleSub` | `04-database.js` | 27 |
| 2628 | `window.openMatCatalog` | `04-database.js` | 26 |
| 2629 | `window.openWorkCatalog` | `04-database.js` | 29 |
| 2630 | `window.renderDbEditors` | `04-database.js` | 22 |
| 2651 | `window.epMat` | `10-estimate-views.js` | 10 |
| 2668 | `window.renderMainTable` | `01-visual.js` | 18 |
| 2671 | `window.applySwap` | `01-visual.js` | 12 |
| 2685 | `window.openSwapModal` | `01-visual.js` | 9 |
| 2885 | `window.epDbToggleSubFixed` | `01-visual.js` | 15 |
| 2891 | `window.openMatCatalog` | `01-visual.js` | 17 |
| 2897 | `window.openWorkCatalog` | `04-database.js` | 21 |
| 2903 | `window.renderDbEditors` | `04-database.js` | 15 |
| 2994 | `window.epMat` | `04-database.js` | 10 |
| 3086 | `window.renderMainTable` | `10-estimate-views.js` | 15 |
| 3091 | `window.categorizeEstimateItem` | `10-estimate-views.js` | 15 |
| 3145 | `window.showPreview` | `01-visual.js` | 12 |
| 3267 | `window.EP_GLOBAL_DB_VISIBLE_CACHE` | `04-database.js` | 60 |
| 3268 | `window.EP_GLOBAL_DB_TAB_FIXED` | `04-database.js` | 53 |
| 3287 | `window.EP_GLOBAL_DB_VISIBLE_CACHE` | `04-database.js` | 12 |
| 3348 | `window.epToggleSmartSub` | `01-visual.js` | 25 |
| 3350 | `window.epOpenGlobalDbModal` | `01-visual.js` | 28 |
| 3354 | `window.EP_GLOBAL_DB_TAB_FIXED` | `04-database.js` | 24 |
| 3358 | `window.epSwitchGlobalDbTab` | `04-database.js` | 20 |
| 3359 | `window.EP_GLOBAL_DB_TAB_FIXED` | `04-database.js` | 20 |
| 3362 | `window.epGlobalSelectAll` | `04-database.js` | 14 |
| 3368 | `window.epAddSelectedGlobalToMyDb` | `04-database.js` | 12 |
| 3405 | `window.openMatCatalog` | `01-visual.js` | 13 |
| 3412 | `window.openWorkCatalog` | `10-estimate-views.js` | 12 |
| 3421 | `window.promptAdd` | `10-estimate-views.js` | 13 |
| 3444 | `window.EP_SWAP_CANDIDATES_SMART` | `04-database.js` | 10 |
| 3445 | `window.openSwapModal` | `04-database.js` | 10 |
| 3464 | `window.EP_SWAP_CANDIDATES_SMART` | `10-estimate-views.js` | 12 |
| 3475 | `window.applySwap` | `10-estimate-views.js` | 18 |
| 3584 | `window.EP_HARD_GLOBAL_CACHE` | `04-database.js` | 48 |
| 3601 | `window.EP_HARD_GLOBAL_CACHE` | `04-database.js` | 22 |
| 3602 | `window.EP_GLOBAL_DB_VISIBLE_CACHE` | `04-database.js` | 24 |
| 3672 | `window.epHardToggleDbSub` | `01-visual.js` | 24 |
| 3674 | `window.epOpenGlobalDbModal` | `01-visual.js` | 26 |
| 3678 | `window.EP_HARD_GLOBAL_TYPE` | `04-database.js` | 17 |
| 3682 | `window.epSwitchGlobalDbTab` | `04-database.js` | 18 |
| 3683 | `window.EP_HARD_GLOBAL_TYPE` | `04-database.js` | 16 |
| 3686 | `window.epGlobalSelectAll` | `04-database.js` | 16 |
| 3689 | `window.epHardRenderGlobalModal` | `04-database.js` | 17 |
| 3701 | `window.epAddSelectedGlobalToMyDb` | `04-database.js` | 12 |
| 3759 | `window.openMatCatalog` | `01-visual.js` | 15 |
| 3766 | `window.openWorkCatalog` | `04-database.js` | 9 |
| 3786 | `window.renderDbEditors` | `04-database.js` | 18 |
| 3799 | `window.epHardSelectDelete` | `04-database.js` | 9 |
| 3802 | `window.epHardDeleteLocalPosition` | `04-database.js` | 8 |
| 3813 | `window.epHardDeleteSelected` | `04-database.js` | 8 |
| 3832 | `window.promptAdd` | `10-estimate-views.js` | 11 |
| 3845 | `window.epApplyReviewedDbItems` | `02-shield-configurator.js` | 13 |
| 3892 | `window.EP_HARD_SWAP` | `01-visual.js` | 7 |
| 3893 | `window.openSwapModal` | `01-visual.js` | 9 |
| 3904 | `window.EP_HARD_SWAP` | `10-estimate-views.js` | 13 |
| 3912 | `window.applySwap` | `10-estimate-views.js` | 13 |
| 4004 | `window.EP_ULTIMATE_DB_CACHE` | `04-database.js` | 39 |
| 4067 | `window.EP_ULTIMATE_DB_CACHE` | `04-database.js` | 13 |
| 4068 | `window.EP_HARD_GLOBAL_CACHE` | `04-database.js` | 11 |
| 4069 | `window.EP_GLOBAL_DB_VISIBLE_CACHE` | `04-database.js` | 13 |
| 4146 | `window.epUltimateToggleSub` | `01-visual.js` | 18 |
| 4168 | `window.epOpenGlobalDbModal` | `01-visual.js` | 23 |
| 4172 | `window.EP_ULTIMATE_GLOBAL_TYPE` | `04-database.js` | 23 |
| 4177 | `window.epSwitchGlobalDbTab` | `04-database.js` | 23 |
| 4178 | `window.EP_ULTIMATE_GLOBAL_TYPE` | `04-database.js` | 22 |
| 4182 | `window.epGlobalSelectAll` | `04-database.js` | 20 |
| 4186 | `window.epUltimateRenderGlobal` | `04-database.js` | 20 |
| 4199 | `window.epAddSelectedGlobalToMyDb` | `04-database.js` | 15 |
| 4226 | `window.openMatCatalog` | `01-visual.js` | 17 |
| 4234 | `window.openWorkCatalog` | `04-database.js` | 17 |
| 4245 | `window.renderDbEditors` | `04-database.js` | 19 |
| 4264 | `window.epUltimateSelectDelete` | `04-database.js` | 9 |
| 4268 | `window.epUltimateDeleteOne` | `04-database.js` | 8 |
| 4288 | `window.epUltimateDeleteSelected` | `04-database.js` | 5 |
| 4318 | `window.epUltimateEditPrice` | `10-estimate-views.js` | 9 |
| 4329 | `window.promptAdd` | `10-estimate-views.js` | 11 |
| 4346 | `window.epApplyReviewedDbItems` | `04-database.js` | 21 |
| 4373 | `window.EP_ULTIMATE_SWAP` | `01-visual.js` | 7 |
| 4374 | `window.openSwapModal` | `01-visual.js` | 9 |
| 4385 | `window.EP_ULTIMATE_SWAP` | `10-estimate-views.js` | 6 |
| 4398 | `window.applySwap` | `01-visual.js` | 14 |
| 4497 | `window.EP_MY_MAT` | `04-database.js` | 48 |
| 4498 | `window.EP_MY_WORK` | `04-database.js` | 49 |
| 4499 | `window.EP_GLOBAL_MAT` | `04-database.js` | 46 |
| 4500 | `window.EP_GLOBAL_WORK` | `04-database.js` | 47 |
| 4501 | `window.EP_FORCE_GLOBAL` | `04-database.js` | 46 |
| 4502 | `window.EP_ULTIMATE_DB_CACHE` | `04-database.js` | 46 |
| 4503 | `window.EP_GLOBAL_DB_VISIBLE_CACHE` | `04-database.js` | 41 |
| 4504 | `window.userMatDB` | `04-database.js` | 35 |
| 4505 | `window.userWorkDB` | `04-database.js` | 34 |
| 4652 | `window.epDbToggle` | `04-database.js` | 3 |
| 4683 | `window.openMatCatalog` | `01-visual.js` | 22 |
| 4684 | `window.openWorkCatalog` | `01-visual.js` | 15 |
| 4686 | `window.promptAdd` | `01-visual.js` | 7 |
| 4754 | `window.renderDbEditors` | `04-database.js` | 21 |
| 4767 | `window.epSetDbScope` | `04-database.js` | 16 |
| 4775 | `window.epCreateMasterDb` | `04-database.js` | 13 |
| 4787 | `window.epCopyOneServerToMy` | `04-database.js` | 14 |
| 4799 | `window.epCopyOneGlobalToMy` | `04-database.js` | 13 |
| 4801 | `window.epClearMyDbType` | `04-database.js` | 14 |
| 4809 | `window.epClearServerDbType` | `04-database.js` | 9 |
| 4822 | `window.epDeleteMySelected` | `04-database.js` | 11 |
| 4833 | `window.addDbItem` | `04-database.js` | 16 |
| 4853 | `window.requestPriceChange` | `04-database.js` | 7 |
| 4890 | `window.epApplyReviewedDbItems` | `01-visual.js` | 10 |
| 4911 | `window.epExportActiveDb` | `04-database.js` | 38 |
| 4920 | `window.epExportMyDb` | `04-database.js` | 29 |
| 4921 | `window.epExportGlobalDb` | `04-database.js` | 22 |
| 4923 | `window.epOpenDbFactoryResetModal` | `04-database.js` | 17 |
| 4940 | `window.epFactoryResetMyDb` | `04-database.js` | 19 |
| 4967 | `window.epFactoryResetAllDb` | `04-database.js` | 24 |
| 5031 | `window.epAutoGroupItem` | `04-database.js` | 27 |
| 5032 | `window.epAutoRegroupActiveDb` | `04-database.js` | 25 |
| 5067 | `window.epOpenGlobalDbModal` | `01-visual.js` | 29 |
| 5071 | `window.EP_SERVER_MODAL_TYPE` | `01-visual.js` | 20 |
| 5075 | `window.epSwitchGlobalDbTab` | `04-database.js` | 15 |
| 5076 | `window.EP_SERVER_MODAL_TYPE` | `01-visual.js` | 14 |
| 5079 | `window.epGlobalSelectAll` | `04-database.js` | 12 |
| 5082 | `window.epRenderServerDbModal` | `01-visual.js` | 15 |
| 5089 | `window.epAddSelectedGlobalToMyDb` | `01-visual.js` | 6 |
| 5118 | `window.epSplitDbDebug` | `04-database.js` | 17 |
| 5178 | `window.EP_MY_WORK` | `04-database.js` | 43 |
| 5178 | `window.EP_MY_MAT` | `04-database.js` | 41 |
| 5181 | `window.userMatDB` | `04-database.js` | 56 |
| 5181 | `window.userWorkDB` | `04-database.js` | 57 |
| 5186 | `window.EP_GLOBAL_WORK` | `04-database.js` | 64 |
| 5186 | `window.EP_GLOBAL_MAT` | `04-database.js` | 62 |
| 5190 | `window.EP_FORCE_GLOBAL` | `04-database.js` | 60 |
| 5191 | `window.EP_ULTIMATE_DB_CACHE` | `04-database.js` | 55 |
| 5192 | `window.EP_GLOBAL_DB_VISIBLE_CACHE` | `04-database.js` | 49 |
| 5201 | `window.matDB` | `04-database.js` | 36 |
| 5202 | `window.workDB` | `04-database.js` | 35 |
| 5205 | `window.matDB` | `04-database.js` | 20 |
| 5206 | `window.workDB` | `04-database.js` | 19 |
| 5256 | `window.epAutoGroupItem` | `04-database.js` | 23 |
| 5294 | `window.epRefreshDbScopeUi` | `04-database.js` | 21 |
| 5300 | `window.epTriggerDbFileImport` | `04-database.js` | 10 |
| 5311 | `window.epOpenTextImport` | `10-estimate-views.js` | 8 |
| 5320 | `window.epApplyReviewedDbItems` | `10-estimate-views.js` | 10 |
| 5414 | `window.EP_MY_MAT` | `04-database.js` | 51 |
| 5415 | `window.EP_MY_WORK` | `04-database.js` | 54 |
| 5416 | `window.userMatDB` | `04-database.js` | 59 |
| 5417 | `window.userWorkDB` | `04-database.js` | 60 |
| 5424 | `window.EP_GLOBAL_MAT` | `04-database.js` | 52 |
| 5425 | `window.EP_GLOBAL_WORK` | `04-database.js` | 54 |
| 5426 | `window.EP_FORCE_GLOBAL` | `04-database.js` | 55 |
| 5427 | `window.EP_ULTIMATE_DB_CACHE` | `04-database.js` | 58 |
| 5428 | `window.EP_GLOBAL_DB_VISIBLE_CACHE` | `04-database.js` | 52 |
| 5436 | `window.matDB` | `04-database.js` | 46 |
| 5437 | `window.workDB` | `04-database.js` | 47 |
| 5442 | `window.matDB` | `04-database.js` | 40 |
| 5443 | `window.workDB` | `04-database.js` | 40 |
| 5504 | `window.epRenderServerDbModal` | `01-visual.js` | 23 |
| 5508 | `window.epRefreshActiveDbNow` | `01-visual.js` | 19 |
| 5522 | `window.epSetDbScope` | `01-visual.js` | 16 |
| 5568 | `window.EP_DB_REVIEW_V6` | `01-visual.js` | 16 |
| 5623 | `window.matDB` | `04-database.js` | 47 |
| 5624 | `window.workDB` | `04-database.js` | 52 |
| 5626 | `window.matDB` | `04-database.js` | 51 |
| 5627 | `window.workDB` | `04-database.js` | 54 |
| 5634 | `window.EP_MY_WORK` | `04-database.js` | 43 |
| 5634 | `window.EP_MY_MAT` | `04-database.js` | 42 |
| 5637 | `window.userMatDB` | `04-database.js` | 41 |
| 5637 | `window.userWorkDB` | `04-database.js` | 40 |
| 5642 | `window.EP_GLOBAL_WORK` | `04-database.js` | 33 |
| 5642 | `window.EP_GLOBAL_MAT` | `04-database.js` | 31 |
| 5646 | `window.EP_FORCE_GLOBAL` | `04-database.js` | 31 |
| 5647 | `window.EP_ULTIMATE_DB_CACHE` | `04-database.js` | 28 |
| 5648 | `window.EP_GLOBAL_DB_VISIBLE_CACHE` | `04-database.js` | 22 |
| 5696 | `window.epRefreshDbScopeUi` | `04-database.js` | 11 |
| 5843 | `window.EP_DB_REVIEW` | `10-estimate-views.js` | 11 |
| 5884 | `window.epReviewToggleV6` | `01-visual.js` | 15 |
| 5885 | `window.epReviewPageV6` | `01-visual.js` | 17 |
| 5886 | `window.epReviewCheckAll` | `01-visual.js` | 15 |
| 5896 | `window.EP_DB_REVIEW_V6` | `05-ai-functions.js` | 13 |
| 5897 | `window.EP_DB_REVIEW` | `05-ai-functions.js` | 19 |
| 5960 | `window.epTriggerDbFileImport` | `04-database.js` | 14 |
| 5974 | `window.epRunTextImport` | `04-database.js` | 15 |
| 6002 | `window.epAutoGroupItem` | `10-estimate-views.js` | 11 |
| 6006 | `window.epApplyReviewedDbItems` | `10-estimate-views.js` | 9 |
| 6092 | `window.EP_MY_WORK` | `04-database.js` | 59 |
| 6092 | `window.EP_MY_MAT` | `04-database.js` | 57 |
| 6092 | `window.userMatDB` | `04-database.js` | 58 |
| 6092 | `window.userWorkDB` | `04-database.js` | 57 |
| 6093 | `window.EP_GLOBAL_WORK` | `04-database.js` | 50 |
| 6093 | `window.EP_GLOBAL_MAT` | `04-database.js` | 48 |
| 6093 | `window.EP_FORCE_GLOBAL` | `04-database.js` | 45 |
| 6093 | `window.EP_ULTIMATE_DB_CACHE` | `04-database.js` | 40 |
| 6093 | `window.EP_GLOBAL_DB_VISIBLE_CACHE` | `04-database.js` | 34 |
| 6094 | `window.matDB` | `04-database.js` | 20 |
| 6094 | `window.workDB` | `04-database.js` | 19 |
| 6138 | `window.epSendServerProposal` | `04-database.js` | 20 |
| 6144 | `window.epRefreshActiveDbNow` | `04-database.js` | 14 |
| 6232 | `window.renderDbEditors` | `04-database.js` | 14 |
| 6240 | `window.epSetDbScope` | `04-database.js` | 9 |
| 6244 | `window.epRefreshActiveDbNow` | `01-visual.js` | 12 |
| 6248 | `window.epChangePriceV7` | `01-visual.js` | 13 |
| 6257 | `window.epSaveActiveDbV7` | `01-visual.js` | 13 |
| 6263 | `window.epReloadActiveDbV7` | `01-visual.js` | 9 |
| 6264 | `window.epDeleteSelectedActiveV7` | `01-visual.js` | 10 |
| 6281 | `window.epExportActiveDb` | `04-database.js` | 34 |
| 6282 | `window.epExportMyDb` | `04-database.js` | 22 |
| 6283 | `window.epExportGlobalDb` | `04-database.js` | 12 |
| 6293 | `window.EP_DB_REVIEW_V6` | `01-visual.js` | 13 |
| 6293 | `window.EP_DB_REVIEW` | `01-visual.js` | 13 |
| 6293 | `window.EP_V7_IMPORT_TARGET` | `01-visual.js` | 15 |
| 6293 | `window.epReviewPageV6` | `01-visual.js` | 16 |
| 6294 | `window.epAskAI` | `10-estimate-views.js` | 14 |
| 6297 | `window.epTriggerDbFileImport` | `04-database.js` | 17 |
| 6298 | `window.epTriggerServerProposalImportV7` | `04-database.js` | 22 |
| 6299 | `window.epOpenTextImportServerProposalV7` | `04-database.js` | 17 |
| 6299 | `window.EP_V7_IMPORT_TARGET` | `04-database.js` | 15 |
| 6299 | `window.epOpenTextImport` | `01-visual.js` | 14 |
| 6301 | `window.epRunTextImport` | `04-database.js` | 16 |
| 6303 | `window.epAutoGroupItem` | `10-estimate-views.js` | 13 |
| 6304 | `window.epApplyReviewedDbItems` | `10-estimate-views.js` | 11 |
| 6308 | `window.EP_V7_IMPORT_TARGET` | `04-database.js` | 17 |
| 6370 | `window.EP_MY_WORK` | `04-database.js` | 59 |
| 6370 | `window.EP_MY_MAT` | `04-database.js` | 57 |
| 6370 | `window.userMatDB` | `04-database.js` | 57 |
| 6370 | `window.userWorkDB` | `04-database.js` | 57 |
| 6371 | `window.EP_GLOBAL_WORK` | `04-database.js` | 50 |
| 6371 | `window.EP_GLOBAL_MAT` | `04-database.js` | 48 |
| 6371 | `window.EP_FORCE_GLOBAL` | `04-database.js` | 39 |
| 6371 | `window.EP_ULTIMATE_DB_CACHE` | `04-database.js` | 34 |
| 6371 | `window.EP_GLOBAL_DB_VISIBLE_CACHE` | `04-database.js` | 28 |
| 6372 | `window.matDB` | `04-database.js` | 20 |
| 6372 | `window.workDB` | `04-database.js` | 19 |
| 6473 | `window.epAutoGroupItem` | `10-estimate-views.js` | 10 |
| 6478 | `window.addDbItem` | `01-visual.js` | 8 |
| 6505 | `window.epChangePriceV7` | `01-visual.js` | 13 |
| 6522 | `window.epSaveActiveDbV7` | `01-visual.js` | 14 |
| 6538 | `window.epReloadActiveDbV7` | `01-visual.js` | 8 |
| 6547 | `window.epCopyOneServerToMy` | `01-visual.js` | 9 |
| 6560 | `window.epCopyOneGlobalToMy` | `04-database.js` | 17 |
| 6580 | `window.epAutoGroupItem` | `10-estimate-views.js` | 13 |
| 6584 | `window.epApplyReviewedDbItems` | `10-estimate-views.js` | 11 |
| 6608 | `window.EP_V7_IMPORT_TARGET` | `04-database.js` | 18 |
| 6611 | `window.epFirebaseDbDebug` | `04-database.js` | 18 |
| 6625 | `window.renderDbEditors` | `04-database.js` | 16 |
| 6676 | `window.EP_GLOBAL_WORK` | `04-database.js` | 59 |
| 6676 | `window.EP_GLOBAL_MAT` | `04-database.js` | 57 |
| 6676 | `window.EP_FORCE_GLOBAL` | `04-database.js` | 49 |
| 6676 | `window.EP_ULTIMATE_DB_CACHE` | `04-database.js` | 44 |
| 6676 | `window.EP_GLOBAL_DB_VISIBLE_CACHE` | `04-database.js` | 38 |
| 6677 | `window.EP_MY_WORK` | `04-database.js` | 28 |
| 6677 | `window.EP_MY_MAT` | `04-database.js` | 26 |
| 6677 | `window.userMatDB` | `04-database.js` | 26 |
| 6677 | `window.userWorkDB` | `04-database.js` | 25 |
| 6678 | `window.matDB` | `04-database.js` | 20 |
| 6678 | `window.workDB` | `04-database.js` | 19 |
| 6696 | `window.epAutoGroupItem` | `04-database.js` | 21 |
| 6752 | `window.epTriggerDbFileImport` | `04-database.js` | 12 |
| 6755 | `window.EP_V9_IMPORT_TARGET` | `04-database.js` | 6 |
| 6756 | `window.EP_V7_IMPORT_TARGET` | `11-pdf-files.js` | 7 |
| 6762 | `window.EP_V9_IMPORT_TARGET` | `11-pdf-files.js` | 11 |
| 6763 | `window.EP_V7_IMPORT_TARGET` | `11-pdf-files.js` | 13 |
| 6803 | `window.EP_DB_REVIEW_V6` | `04-database.js` | 17 |
| 6804 | `window.EP_DB_REVIEW` | `04-database.js` | 18 |
| 6804 | `window.EP_V9_IMPORT_TARGET` | `04-database.js` | 18 |
| 6804 | `window.EP_V7_IMPORT_TARGET` | `04-database.js` | 17 |
| 6806 | `window.epReviewPageV6` | `04-database.js` | 13 |
| 6812 | `window.epReadDbFileV9` | `10-estimate-views.js` | 15 |
| 6825 | `window.epOpenTextImport` | `04-database.js` | 18 |
| 6826 | `window.EP_V9_IMPORT_TARGET` | `04-database.js` | 15 |
| 6826 | `window.EP_V7_IMPORT_TARGET` | `04-database.js` | 14 |
| 6831 | `window.epApplyReviewedDbItems` | `10-estimate-views.js` | 10 |
| 6851 | `window.EP_V9_IMPORT_TARGET` | `04-database.js` | 15 |
| 6851 | `window.EP_V7_IMPORT_TARGET` | `04-database.js` | 14 |
| 6854 | `window.epFirebaseDbDebug` | `04-database.js` | 14 |
| 6885 | `window.epDbProgress` | `01-visual.js` | 13 |
| 6888 | `window.epDbHideProgress` | `05-ai-functions.js` | 17 |
| 6941 | `window.epAskAI` | `05-ai-functions.js` | 31 |
| 7009 | `window.EP_DB_REVIEW_V6` | `04-database.js` | 12 |
| 7010 | `window.EP_DB_REVIEW` | `04-database.js` | 12 |
| 7011 | `window.EP_V9_IMPORT_TARGET` | `04-database.js` | 13 |
| 7011 | `window.EP_V7_IMPORT_TARGET` | `04-database.js` | 12 |
| 7014 | `window.epReviewPageV6` | `04-database.js` | 13 |
| 7048 | `window.epReadDbFileV9` | `11-pdf-files.js` | 21 |
| 7060 | `window.epTriggerDbFileImport` | `11-pdf-files.js` | 12 |
| 7099 | `window.EP_DB_ADMIN_SETTINGS_AI_STABILITY_V11` | `07-settings.js` | 14 |
| 7112 | `window.EP_ADMIN_SERVER_DB_EDIT` | `10-estimate-views.js` | 5 |
| 7128 | `window.epDbProgress` | `01-visual.js` | 10 |
| 7138 | `window.epDbHideProgress` | `01-visual.js` | 17 |
| 7145 | `window.epSetDbScope` | `01-visual.js` | 22 |
| 7147 | `window.epOpenAdminServerDbFromSettings` | `01-visual.js` | 25 |
| 7149 | `window.EP_ADMIN_SERVER_DB_EDIT` | `01-visual.js` | 26 |
| 7150 | `window.EP_OPENING_ADMIN_SERVER_DB` | `01-visual.js` | 27 |
| 7155 | `window.EP_OPENING_ADMIN_SERVER_DB` | `01-visual.js` | 20 |
| 7165 | `window.EP_ADMIN_SERVER_DB_EDIT` | `07-settings.js` | 10 |
| 7172 | `window.openModal` | `07-settings.js` | 11 |
| 7195 | `window.EP_ADMIN_SERVER_DB_EDIT` | `04-database.js` | 12 |
| 7207 | `window.epSetDbScope` | `07-settings.js` | 6 |
| 7258 | `window.addDbItem` | `04-database.js` | 15 |
| 7267 | `window.epSaveActiveDbV7` | `04-database.js` | 16 |
| 7278 | `window.epTriggerDbFileImport` | `04-database.js` | 16 |
| 7282 | `window.EP_V9_IMPORT_TARGET` | `04-database.js` | 15 |
| 7283 | `window.EP_V7_IMPORT_TARGET` | `04-database.js` | 15 |
| 7292 | `window.EP_V9_IMPORT_TARGET` | `04-database.js` | 20 |
| 7293 | `window.EP_V7_IMPORT_TARGET` | `04-database.js` | 20 |
| 7294 | `window.epReadDbFileV9` | `04-database.js` | 20 |
| 7301 | `window.epOpenTextImport` | `04-database.js` | 18 |
| 7305 | `window.EP_DB_REVIEW` | `04-database.js` | 17 |
| 7307 | `window.EP_V9_IMPORT_TARGET` | `04-database.js` | 15 |
| 7308 | `window.EP_V7_IMPORT_TARGET` | `04-database.js` | 14 |
| 7320 | `window.EP_V9_IMPORT_TARGET` | `11-pdf-files.js` | 6 |
| 7320 | `window.EP_V7_IMPORT_TARGET` | `11-pdf-files.js` | 6 |
| 7326 | `window.epApplyReviewedDbItems` | `11-pdf-files.js` | 9 |
| 7384 | `window.epAskAI` | `04-database.js` | 6 |
| 7472 | `window.epWork` | `02-shield-configurator.js` | 12 |
| 7500 | `window.renderMainTable` | `02-shield-configurator.js` | 15 |
| 7513 | `window.addAuto` | `02-shield-configurator.js` | 14 |
| 7526 | `window.epGenerateShieldFixed` | `04-database.js` | 15 |
| 7527 | `window.generateCascadePanel` | `04-database.js` | 15 |
| 7616 | `window.EP_V12_SWAP_LIST` | `04-database.js` | 10 |
| 7617 | `window.openSwapModal` | `01-visual.js` | 11 |
| 7618 | `window.swapTargetIdx` | `04-database.js` | 10 |
| 7636 | `window.EP_V12_SWAP_LIST` | `07-settings.js` | 7 |
| 7650 | `window.applySwap` | `01-visual.js` | 10 |
| 7701 | `window.epV15IsShieldDevice` | `02-shield-configurator.js` | 18 |
| 7705 | `window.epV15Purpose` | `02-shield-configurator.js` | 9 |
| 7715 | `window.epV15GetAssignments` | `03-socket-pool.js` | 4 |
| 7727 | `window.epV15BuildLinesFromConfig` | `02-shield-configurator.js` | 20 |
| 7738 | `window.epV15InferAssignments` | `02-shield-configurator.js` | 7 |
| 7746 | `window.epV15NormalizeCurrentEstimate` | `02-shield-configurator.js` | 11 |
| 7764 | `window.currentEstimate` | `01-visual.js` | 5 |
| 7767 | `window.epV15SelectVisible` | `04-database.js` | 6 |
| 7768 | `window.epV15MoveSelectedActive` | `01-visual.js` | 7 |
| 7776 | `window.renderMainTable` | `01-visual.js` | 15 |
| 7968 | `window.showPreview` | `01-visual.js` | 13 |
| 7973 | `window.epV16GenerateCascadePanel` | `01-visual.js` | 13 |
| 7974 | `window.generateCascadePanel` | `01-visual.js` | 13 |
| 7975 | `window.epGenerateShieldFixed` | `01-visual.js` | 15 |
| 7985 | `window.renderMainTable` | `01-visual.js` | 14 |
| 8071 | `window.epV17Normalize` | `10-estimate-views.js` | 13 |
| 8078 | `window.epV17ShowDetails` | `10-estimate-views.js` | 14 |
| 8093 | `window.showPreview` | `01-visual.js` | 29 |
| 8096 | `window.renderMainTable` | `01-visual.js` | 21 |
| 8099 | `window.generateCascadePanel` | `01-visual.js` | 11 |
| 8112 | `window.epV17BulkMove` | `04-database.js` | 6 |
| 8119 | `window.epV17BulkDelete` | `01-visual.js` | 8 |
| 8183 | `window.matDB` | `04-database.js` | 80 |
| 8184 | `window.workDB` | `04-database.js` | 84 |
| 8193 | `window.EP_GLOBAL_MAT` | `04-database.js` | 69 |
| 8193 | `window.EP_GLOBAL_WORK` | `04-database.js` | 71 |
| 8194 | `window.EP_FORCE_GLOBAL` | `04-database.js` | 68 |
| 8195 | `window.EP_ULTIMATE_DB_CACHE` | `04-database.js` | 60 |
| 8196 | `window.EP_GLOBAL_DB_VISIBLE_CACHE` | `04-database.js` | 50 |
| 8204 | `window.EP_MY_MAT` | `04-database.js` | 24 |
| 8205 | `window.EP_MY_WORK` | `04-database.js` | 25 |
| 8206 | `window.userMatDB` | `04-database.js` | 24 |
| 8206 | `window.userWorkDB` | `04-database.js` | 22 |
| 8224 | `window.epV18SetStatus` | `04-database.js` | 6 |
| 8260 | `window.currentEstimate` | `10-estimate-views.js` | 21 |
| 8260 | `window.currentEstimate` | `10-estimate-views.js` | 19 |
| 8267 | `window.currentEstimate` | `02-shield-configurator.js` | 16 |
| 8267 | `window.currentEstimate` | `02-shield-configurator.js` | 19 |
| 8271 | `window.renderMainTable` | `02-shield-configurator.js` | 21 |
| 8271 | `window.currentEstimate` | `02-shield-configurator.js` | 22 |
| 8274 | `window.epV18GenerateShield` | `02-shield-configurator.js` | 26 |
| 8295 | `window.currentShieldExtras` | `02-shield-configurator.js` | 37 |
| 8319 | `window.epV18ShowDetails` | `10-estimate-views.js` | 13 |
| 8320 | `window.currentEstimate` | `10-estimate-views.js` | 12 |
| 8330 | `window.showPreview` | `01-visual.js` | 13 |
| 8356 | `window.renderDbEditors` | `04-database.js` | 15 |
| 8357 | `window.epV18SelectVisible` | `04-database.js` | 6 |
| 8358 | `window.epV18MoveSelected` | `04-database.js` | 12 |
| 8365 | `window.epV18DeleteSelected` | `01-visual.js` | 11 |
| 8373 | `window.openMatCatalog` | `01-visual.js` | 15 |
| 8374 | `window.openWorkCatalog` | `04-database.js` | 14 |
| 8375 | `window.epSetDbScope` | `04-database.js` | 8 |
| 8376 | `window.epReloadActiveDbV7` | `01-visual.js` | 6 |
| 8377 | `window.epSaveActiveDbV7` | `01-visual.js` | 9 |
| 8385 | `window.currentEstimate` | `01-visual.js` | 9 |
| 8468 | `window.currentEstimate` | `02-shield-configurator.js` | 19 |
| 8470 | `window.epV19GenerateShield` | `02-shield-configurator.js` | 21 |
| 8496 | `window.currentShieldExtras` | `02-shield-configurator.js` | 36 |
| 8522 | `window.epV19ShowDetails` | `10-estimate-views.js` | 14 |
| 8533 | `window.epV18GenerateShield` | `01-visual.js` | 21 |
| 8534 | `window.epV18ShowDetails` | `01-visual.js` | 22 |
| 8536 | `window.showPreview` | `01-visual.js` | 17 |
| 8612 | `window.currentEstimate` | `10-estimate-views.js` | 7 |
| 8612 | `window.currentEstimate` | `01-visual.js` | 6 |
| 8640 | `window.epV20GenerateShield` | `02-shield-configurator.js` | 24 |
| 8661 | `window.currentShieldExtras` | `02-shield-configurator.js` | 37 |
| 8688 | `window.epV20ShowDetails` | `10-estimate-views.js` | 15 |
| 8700 | `window.epV18GenerateShield` | `01-visual.js` | 22 |
| 8701 | `window.epV19GenerateShield` | `01-visual.js` | 22 |
| 8702 | `window.epV18ShowDetails` | `01-visual.js` | 23 |
| 8703 | `window.epV19ShowDetails` | `01-visual.js` | 21 |
| 8705 | `window.showPreview` | `01-visual.js` | 17 |
| 8706 | `window.generateCascadePanel` | `04-database.js` | 9 |
| 8769 | `window.matDB` | `04-database.js` | 23 |
| 8769 | `window.workDB` | `04-database.js` | 21 |
| 8772 | `window.epV18SetStatus` | `01-visual.js` | 8 |
| 8784 | `window.EP_GLOBAL_MAT` | `04-database.js` | 73 |
| 8784 | `window.EP_GLOBAL_WORK` | `04-database.js` | 73 |
| 8785 | `window.EP_FORCE_GLOBAL` | `04-database.js` | 69 |
| 8786 | `window.EP_ULTIMATE_DB_CACHE` | `04-database.js` | 60 |
| 8787 | `window.EP_GLOBAL_DB_VISIBLE_CACHE` | `04-database.js` | 53 |
| 8794 | `window.EP_MY_MAT` | `04-database.js` | 28 |
| 8795 | `window.EP_MY_WORK` | `04-database.js` | 29 |
| 8796 | `window.userMatDB` | `04-database.js` | 29 |
| 8796 | `window.userWorkDB` | `04-database.js` | 27 |
| 8874 | `window.epV21UpdateSubs` | `01-visual.js` | 7 |
| 8876 | `window.epV21SelectVisible` | `01-visual.js` | 5 |
| 8879 | `window.epV21MoveSelected` | `04-database.js` | 11 |
| 8894 | `window.epV21DeleteSelected` | `04-database.js` | 9 |
| 8911 | `window.renderDbEditors` | `01-visual.js` | 20 |
| 8913 | `window.openMatCatalog` | `01-visual.js` | 13 |
| 8914 | `window.openWorkCatalog` | `12-documents.js` | 13 |

## Unknown / нужно смотреть вручную

- строка 289: `epNormText`
- строка 485: `epCleanText`
- строка 925: `epStripCode`
- строка 1308: `epIsEmptyCell`
- строка 1312: `epCleanCell`
- строка 1316: `epIsUnitCell`
- строка 1321: `epNormalizeUnit`
- строка 1330: `epIsNumberLikeCell`
- строка 1337: `epLooksLikeCodeOrNumber`
- строка 1347: `epTitleCaseRu`
- строка 1938: `epId`
- строка 1941: `epClean`
- строка 1942: `epSame`
- строка 2236: `norm`
- строка 2237: `uniq`
- строка 2238: `getVal`
- строка 2239: `getCheck`
- строка 2240: `toNum`
- строка 2560: `norm`
- строка 2567: `detectBrand`
- строка 2568: `detectNominal`
- строка 2722: `norm`
- строка 2756: `detectBrand`
- строка 2765: `detectNominal`
- строка 2770: `detectLeakage`
- строка 3204: `norm`
- строка 3439: `swapLabel`
- строка 3518: `clean`
- строка 3542: `idKey`
- строка 3553: `clearDeletedFor`
- строка 3956: `norm`
- строка 3977: `idkey`
- строка 3997: `stripRuntime`
- строка 4152: `makeLocalCopy`
- строка 4462: `cleanText`
- строка 4463: `clone`
- строка 4475: `enc`
- строка 4478: `unique`
- строка 5158: `clean`
- строка 5160: `clone`
- строка 5383: `label`
- строка 5388: `clean`
- строка 5390: `clone`
- строка 5392: `unique`
- строка 5481: `isVisible`
- строка 5582: `cleanText`
- строка 5584: `norm`
- строка 5590: `clone`
- строка 6072: `norm`
- строка 6073: `cleanText`
- строка 6079: `label`
- строка 6086: `clone`
- строка 6343: `norm`
- строка 6346: `clean`
- строка 6348: `clone`
- строка 6362: `label`
- строка 6658: `clean`
- строка 6659: `norm`
- строка 6670: `clone`
- строка 6889: `clean`
- строка 6952: `stripCode`
- строка 7102: `txt`
- строка 7415: `norm`
- строка 7422: `clone`
- строка 7536: `pushArr`
- строка 7699: `norm`
- строка 7700: `clean`
- строка 7728: `val`
- строка 7728: `chk`
- строка 8008: `txt`
- строка 8009: `clean`
- строка 8010: `norm`
- строка 8020: `brandRu`
- строка 8022: `e`
- строка 8022: `ch`
- строка 8153: `clean`
- строка 8154: `norm`
- строка 8164: `clone`
- строка 8241: `brandRu`
- строка 8251: `val`
- строка 8252: `chk`
- строка 8256: `add`
- строка 8408: `val`
- строка 8409: `chk`
- строка 8412: `brandRu`
- строка 8413: `curveNom`
- строка 8559: `text`
- строка 8560: `clean`
- строка 8564: `val`
- строка 8565: `chk`
- строка 8574: `brandRu`
- строка 8575: `norm`
- строка 8584: `curveNom`
- строка 8732: `clean`
- строка 8733: `esc`
- строка 8743: `clone`
- строка 8744: `norm`

## Рекомендация для V42

Следующий безопасный шаг: выбрать один модуль с большим количеством остатка и переносить его хирургически.

Приоритет:

1. `04-database.js` — база, материалы, работы.
2. `02-shield-configurator.js` — конфигуратор щита.
3. `10-estimate-views.js` и `11-pdf-files.js` — смета, детализация, PDF.
4. `07-settings.js` — настройки и админка.

