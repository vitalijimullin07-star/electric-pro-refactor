# V23 Body End Runtime Fix



- `public/index.html` пересобран из рабочей версии `index-before-modules.html`;
- старые `js/blocks/block-XX.js` удалены из подключения;
- модули подключены строго перед `</body>`;
- `00-core.js` содержит стабильный runtime из старых block-XX в исходном порядке;
- остальные модули пока рабочие зоны для ручного переноса.
