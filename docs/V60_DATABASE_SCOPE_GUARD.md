# V60 Database Scope Guard


## Что сделано


- `public/js/04-database-scope-guard.js`


- `Глобальная база`
- `Моя база`

## Логика

- `window.matDB` и `window.workDB` всегда указывают только на активный источник.
- `window.EP_GLOBAL_MAT / EP_GLOBAL_WORK` — глобальная база.
- `window.EP_MY_MAT / EP_MY_WORK` — моя база.
- `window.userMatDB / userWorkDB` — алиасы моей базы.
- `epSetDbScope('my')` включает мою базу.
- `epSetDbScope('global')` включает глобальную базу.

## Проверка

1. Открыть приложение.
2. Внизу должен появиться маленький бейдж:
   - `База: Глобальная`
   - или `База: Моя`
3. Переключить базу.
4. Материалы и работы должны открываться только из выбранного источника.
