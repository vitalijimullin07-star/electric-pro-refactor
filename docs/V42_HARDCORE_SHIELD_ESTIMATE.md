# V42 Hardcore Shield + Estimate

Хардкорный перенос из `00-core.js`.

## Что сделано

- перенесены top-level функции щита в `02-shield-configurator.js`
- перенесены top-level функции сметы/детализации в `10-estimate-views.js`
- из `00-core.js` эти функции заменены маркерами
- создан аварийный tag `v41-before-hardcore-v42`

## Добавлено в щит

- нет новых функций

## Добавлено в смету/детализацию

- `safeGet`
- `safeSet`
- `savedChoices`
- `saveChoice`

## Всего удалено из 00-core.js

- `4` функций

## Откат

```bash
git reset --hard v41-before-hardcore-v42
npx -y firebase-tools deploy --only hosting --project electric-pro-test
```
