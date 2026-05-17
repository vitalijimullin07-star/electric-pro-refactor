# V37 PDF Files Module Safe

Исправлен перенос блока **10. Все PDF файлы**.

Теперь каждый блок перед добавлением проходит `node --check`.

Файл:

- `public/js/11-pdf-files.js`

Добавленные функции:

- `saveQRs`
- `getPDFHeader`
- `showPreview`
- `refreshPreview`
- `printAct`
- `epReadFileAsText`
- `epReadFileAsDataURL`
- `epReadFileAsArrayBuffer`
- `epReadDbFile`
- `epAiNormalizeImage`
- `epDownloadJson`
- `smartFindMat`
- `strictFindMaterial`
- `downloadJson`
- `fileText`
- `fileBuffer`
- `renderReviewPage`
- `aiFromImage`
- `readDbFileV6`
- `fileTextProgress`
- `fileBufferProgress`
- `readDbFile`
- `readGlobalDoc`
- `fileToDataURL`
- `askOpenAI`
- `askGemini`
- `aiFromImageFile`
- `aiFromPdfFile`
- `patchLabels`
- `compressImageDataUrl`
- `showDetailsV16`
- `esc`

Пропущенные небезопасные блоки:

- `epEscape` — `/tmp/tmpwgnm1hn6.js:1615`
- `safe` — `/tmp/tmp7orppc4o.js:560`
- `safeHtml` — `/tmp/tmp3b3zbu_6.js:864`
- `esc` — `/tmp/tmpajv27ko7.js:936`
- `esc` — `/tmp/tmp0v4j6p5e.js:907`
- `esc` — `/tmp/tmp32glth1t.js:826`
- `esc` — `/tmp/tmpkvvie_2x.js:820`
- `esc` — `/tmp/tmpvs3bjh13.js:1017`
- `esc` — `/tmp/tmpf_5sfi38.js:953`
- `esc` — `/tmp/tmphpcqnhiw.js:901`
- `esc` — `/tmp/tmpsn2mn0v1.js:1019`

`00-core.js` пока не очищался, чтобы сохранить рабочую версию.
