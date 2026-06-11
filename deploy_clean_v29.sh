#!/data/data/com.termux/files/usr/bin/bash
set -e
echo "=== Electric Pro V29 — установка ЧИСТОЙ версии (полная замена приложения) ==="
SRC_DIR="$(cd "$(dirname "$0")" && pwd)"
APP="$SRC_DIR/app"
RAW_ARG="${1:-}"
is_v29(){ [ -n "$1" ] && [ -f "$1/index.html" ] && [ -f "$1/assets/js/core/router.js" ]; }
is_old(){ [ -f "$1/assets/js/database-v26-surgical-monolith.js" ] || { [ -f "$1/assets/js/router.js" ] && [ ! -d "$1/assets/js/core" ]; }; }
REPO=""
if [ -n "$RAW_ARG" ]; then is_v29 "$RAW_ARG" && ! is_old "$RAW_ARG" && REPO="$RAW_ARG" || echo "Путь не похож на V29: $RAW_ARG"; fi
if [ -z "$REPO" ]; then
  for d in "$PWD" "$HOME/electric-pro-refactor" "$HOME/electric-pro-refactor-main" "$HOME/electric-pro-refactor-clean" "$HOME/ep/electric-pro-refactor" /sdcard/Download/ep/electric-pro-refactor /sdcard/Download/electric-pro-refactor; do
    is_v29 "$d" && ! is_old "$d" && { REPO="$d"; break; }; done
fi
if [ -z "$REPO" ]; then
  for root in "$HOME" /sdcard/Download /storage/emulated/0/Download; do [ -d "$root" ]||continue
    while IFS= read -r rj; do d="$(dirname "$(dirname "$(dirname "$(dirname "$rj")")")")"; is_v29 "$d" && ! is_old "$d" && { REPO="$d"; break 2; }; done < <(find "$root" -maxdepth 6 -path '*/assets/js/core/router.js' 2>/dev/null)
  done
fi
[ -z "$REPO" ] && { echo "Не нашёл репозиторий refactor. Запусти: bash $(basename $0) ~/путь"; exit 1; }
is_old "$REPO" && { echo "СТОП: это старый electric-pro."; exit 1; }
echo "Репозиторий: $REPO"
echo "Будет: ПОЛНАЯ замена приложения (assets/ pages/ index.html version.json) на чистую версию."
echo "Сохранится без изменений: config/ (твой firebase-config), firestore.rules, functions/, .git, firebase.json/.firebaserc."
echo "Перед заменой делается резервная копия ВСЕГО репозитория."
printf "Продолжить и запушить? [Enter=да, n=нет]: "; read ans
[ "$ans" = "n" ]||[ "$ans" = "N" ]&&{ echo "Отменено.";exit 0;}

S="$(date +%Y%m%d-%H%M%S)"
BK="$HOME/ep_backup_$S.tgz"
echo "-- бэкап всего репозитория -> $BK --"
tar czf "$BK" --exclude='node_modules' --exclude='.git' -C "$REPO" . 2>/dev/null && echo "   готово" || echo "   (бэкап частично)"

cd "$REPO"
echo "-- удаляю старое приложение и мусор GPT --"
rm -rf assets pages index.html version.json
for junk in firebase-debug.log firebase-debug.*.log _admin_backups .ep_backups CHANGELOG_ADMIN_V29_32.md CHECKLIST_ADMIN_V29_32.md README_ADMIN_V29_32.txt tools _stage_backups _admin_backups; do
  [ -e "$junk" ] && { rm -rf "$junk"; echo "   убрано: $junk"; }
done
echo "-- копирую ЧИСТОЕ приложение --"
cp -r "$APP/assets" ./
cp -r "$APP/pages" ./
cp -f "$APP/index.html" ./
cp -f "$APP/version.json" ./
echo "   скопировано ($(find assets pages -type f | wc -l) файлов)"

# гарантируем .gitignore для CLI-мусора
grep -q 'firebase-debug.log' .gitignore 2>/dev/null || printf '\nfirebase-debug.log\n*-debug.log\nnode_modules/\n' >> .gitignore

echo "-- коммит и push --"
git add -A
git diff --cached --quiet && echo "Нет изменений" || git commit -m "V29 clean rebuild: working core (burger) + DB module (user_db/server_db shared Firebase); remove all GPT patches/junk"
git push origin main 2>/dev/null || git push origin master 2>/dev/null || { echo; echo "Если push отклонён: git pull --no-rebase -X ours --no-edit origin main && git push origin main"; }
echo ""
echo "=== ГОТОВО. Firebase config/rules/functions не тронуты, deploy НЕ делался. ==="
echo "Бэкап старого: $BK"
echo "Открой сайт с ?fresh=$(date +%s) — бургер и БД должны работать."
