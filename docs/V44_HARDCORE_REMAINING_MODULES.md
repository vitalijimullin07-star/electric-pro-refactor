# V44 Hardcore Remaining Modules

Перенос оставшихся явных top-level функций из `00-core.js`.

## Целевые модули

- `04-database.js`
- `07-settings.js`
- `08-accounting.js`
- `11-pdf-files.js`
- `12-documents.js`

## Добавлено по модулям

### 04-database.js

- нет новых функций

### 07-settings.js

- нет новых функций

### 08-accounting.js

- нет новых функций

### 11-pdf-files.js

- нет новых функций

### 12-documents.js

- нет новых функций

## Удалено из 00-core.js

- всего: `0` функций

## Спорные функции оставлены в 00-core.js

- нет

## Откат

```bash
git reset --hard v43-before-hardcore-v44
npx -y firebase-tools deploy --only hosting --project electric-pro-test
```
