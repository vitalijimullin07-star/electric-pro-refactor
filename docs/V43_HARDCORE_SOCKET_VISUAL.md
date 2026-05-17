# V43 Hardcore Socket Pool + Visual

Хардкорный перенос из `00-core.js`.

## Что сделано

- перенесены top-level функции пула розеток в `03-socket-pool.js`
- перенесены top-level функции визуала в `01-visual.js`
- из `00-core.js` эти функции заменены маркерами
- создан аварийный tag `v42-before-hardcore-v43`

## Добавлено в пул розеток

- нет новых функций

## Добавлено в визуал

- нет новых функций

## Всего удалено из 00-core.js

- `0` функций

## Откат

```bash
git reset --hard v42-before-hardcore-v43
npx -y firebase-tools deploy --only hosting --project electric-pro-test
```
