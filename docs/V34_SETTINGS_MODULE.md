# V34 Settings Module Functions Only

Исправлен перенос блока **7. Настройки**.

Теперь в модуль переносятся только полноценные `function` / `async function`.

`window.*` куски временно не переносятся, потому что они могут быть частью `try/catch` и ломать синтаксис.

Файл:

- `public/js/07-settings.js`

Найденные функции:

- `handleGoogleAuth`
- `checkLocalPinUser`
- `loginWithPin`
- `confirmLogout`
- `finishLoginSetup`
- `changeTheme`
- `updateMasterBadge`
- `saveApiKey`
- `saveQRs`
- `addExtraToShieldConfig`
- `loadCustHistoryOptions`
- `approveUser`
- `loadMasterDrafts`
- `openAdminDraftView`
- `renderAdminUsers`
- `adminAddUser`
- `deleteUser`
- `epPatchSettingsUI`
- `epLoadAiConfigFromServer`
- `epSaveUserDb`
- `epLoadUserDbAfterLogin`
- `epInsertAdminProposalBox`
- `epMoveShieldSettingsIntoDetails`
- `isAdmin`
- `fbUser`
- `currentUserLabel`
- `adminServerMode`
- `installAdminSettingsButton`
- `lineConfig`
- `optionsHtml`
- `options`

`00-core.js` пока не очищался, чтобы сохранить рабочую версию.
