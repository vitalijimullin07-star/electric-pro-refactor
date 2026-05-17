/*
 * Electric PRO Refactor
 * Module: 04-database.js
 * Generated from public/js/blocks/block-XX.js
 * ВНИМАНИЕ: на этом этапе код только разложен по модулям.
 * Подключение в index.html будем делать отдельным шагом после проверки.
 */



/* =========================================================
 * SOURCE: block-04.js
 * AUTO TARGET: 04-database.js
 * SCORE: 233
 * HITS: db, matDB, workDB, материал, работ, global_db, user_db, renderDbEditors
 * ========================================================= */

/*
 * Extracted from public/index.html
 * Original script block: 4
 * Original HTML lines: 3576-3867
 */

(function() {
    const EP_FULL_WORKS=[{"id":"w44","c":"Алмазная резка","g":"Штроба 25х30","n":"Бетон","p":550,"u":"м.п."},{"id":"w45","c":"Алмазная резка","g":"Штроба 25х30","n":"Кирпич","p":400,"u":"м.п."},{"id":"w46","c":"Алмазная резка","g":"Штроба 25х30","n":"Панелька","p":700,"u":"м.п."},{"id":"w47","c":"Алмазная резка","g":"Штроба 25х30","n":"Мягкий мат.","p":400,"u":"м.п."},{"id":"w48","c":"Алмазная резка","g":"Штроба 50х50","n":"Бетон","p":1500,"u":"м.п."},{"id":"w49","c":"Алмазная резка","g":"Штроба 50х50","n":"Кирпич","p":1300,"u":"м.п."},{"id":"w50","c":"Алмазная резка","g":"Штроба 50х50","n":"Панелька","p":1900,"u":"м.п."},{"id":"w51","c":"Алмазная резка","g":"Штроба 50х50","n":"Мягкий мат.","p":900,"u":"м.п."},{"id":"w52","c":"Алмазная резка","g":"Штроба 100х50 ВВОДНАЯ","n":"Бетон","p":2200,"u":"м.п."},{"id":"w53","c":"Алмазная резка","g":"Штроба 100х50 ВВОДНАЯ","n":"Кирпич","p":1550,"u":"м.п."},{"id":"w54","c":"Алмазная резка","g":"Штроба 100х50 ВВОДНАЯ","n":"Панелька","p":2500,"u":"м.п."},{"id":"w55","c":"Алмазная резка","g":"Штроба 100х50 ВВОДНАЯ","n":"Мягкий мат.","p":1400,"u":"м.п."},{"id":"w56","c":"Алмазная резка","g":"Высверливание подр. стандарт","n":"Бетон","p":600,"u":"шт"},{"id":"w57","c":"Алмазная резка","g":"Высверливание подр. стандарт","n":"Кирпич","p":500,"u":"шт"},{"id":"w58","c":"Алмазная резка","g":"Высверливание подр. стандарт","n":"Панелька","p":650,"u":"шт"},{"id":"w59","c":"Алмазная резка","g":"Высверливание подр. стандарт","n":"Мягкий мат.","p":400,"u":"шт"},{"id":"w60","c":"Черновая электрика","g":"Вклейка подрозетников","n":"Все типы","p":100,"u":"шт"},{"id":"w61","c":"Алмазная резка","g":"Вырубка ниши щита","n":"Бетон","p":400,"u":"мод."},{"id":"w62","c":"Алмазная резка","g":"Вырубка ниши щита","n":"Кирпич","p":300,"u":"мод."},{"id":"w63","c":"Алмазная резка","g":"Вырубка ниши щита","n":"Панелька","p":500,"u":"мод."},{"id":"w64","c":"Алмазная резка","g":"Вырубка ниши щита","n":"Мягкий мат.","p":250,"u":"мод."},{"id":"w65","c":"Монтаж","g":"Прокладка кабеля","n":"Без гофры (Потолок)","p":120,"u":"м.п."},{"id":"w66","c":"Монтаж","g":"Прокладка кабеля","n":"В гофре (Пол)","p":150,"u":"м.п."},{"id":"w67","c":"Монтаж","g":"Распаячная коробка","n":"Сборка распред. коробки / коммутация","p":800,"u":"шт"},{"id":"w68","c":"Чистовая установка","g":"Механизмы","n":"Установка розетки 220В","p":500,"u":"шт"},{"id":"w69","c":"Чистовая установка","g":"Механизмы","n":"Установка выключателя","p":550,"u":"шт"},{"id":"w70","c":"Чистовая установка","g":"Механизмы","n":"Установка терморегулятора","p":900,"u":"шт"},{"id":"w71","c":"Алмазная резка","g":"Высверливание подрозетников глубокий","n":"Бетон","p":650,"u":"шт"},{"id":"w72","c":"Алмазная резка","g":"Высверливание подрозетников глубокий","n":"Кирпич","p":550,"u":"шт"},{"id":"w73","c":"Алмазная резка","g":"Высверливание подрозетников глубокий","n":"Панелька","p":750,"u":"шт"},{"id":"w74","c":"Алмазная резка","g":"Высверливание подрозетников глубокий","n":"Мягкий мат.","p":450,"u":"шт"},{"id":"w75","c":"Алмазная резка","g":"Высверливание подрозетников копос 74х75","n":"Бетон","p":800,"u":"шт"},{"id":"w76","c":"Алмазная резка","g":"Высверливание подрозетников копос 74х75","n":"Кирпич","p":700,"u":"шт"},{"id":"w77","c":"Алмазная резка","g":"Высверливание подрозетников копос 74х75","n":"Панелька","p":850,"u":"шт"},{"id":"w78","c":"Алмазная резка","g":"Высверливание подрозетников копос 74х75","n":"Мягкий мат.","p":500,"u":"шт"},{"id":"w79","c":"Алмазная резка","g":"Отверстие 132 ММ L= до 450","n":"Бетон","p":6000,"u":"шт"},{"id":"w80","c":"Алмазная резка","g":"Отверстие 132 ММ L= до 450","n":"Кирпич","p":4500,"u":"шт"},{"id":"w81","c":"Алмазная резка","g":"Отверстие 132 ММ L= до 450","n":"Панелька","p":7000,"u":"шт"},{"id":"w82","c":"Алмазная резка","g":"Отверстие 132 ММ L= до 450","n":"Мягкий мат.","p":4000,"u":"шт"},{"id":"w83","c":"Алмазная резка","g":"Отверстие 52мм L=до 450мм","n":"Бетон","p":2500,"u":"шт"},{"id":"w84","c":"Алмазная резка","g":"Отверстие 52мм L=до 450мм","n":"Кирпич","p":2000,"u":"шт"},{"id":"w85","c":"Алмазная резка","g":"Отверстие 52мм L=до 450мм","n":"Панелька","p":3000,"u":"шт"},{"id":"w86","c":"Алмазная резка","g":"Отверстие 52мм L=до 450мм","n":"Мягкий мат.","p":1900,"u":"шт"},{"id":"w87","c":"Щитовое","g":"Монтаж","n":"Сборка щита","p":500,"u":"мод."},{"id":"w89","c":"Щитовое","g":"Монтаж","n":"Установка БП в щит","p":900,"u":"ед"},{"id":"w91","c":"Монтаж","g":"Спецоборудование","n":"Подключение нагревателя","p":4000,"u":"ед"},{"id":"w92","c":"Монтаж","g":"Спецоборудование","n":"Система КУП","p":5000,"u":"ед"},{"id":"s_r1","c":"Щитовое","g":"Автоматика и Реле","n":"Установка реле времени","p":1250,"u":"шт"},{"id":"s_r2","c":"Щитовое","g":"Автоматика и Реле","n":"Установка реле освещения (в щите)","p":1250,"u":"шт"},{"id":"s_r3","c":"Щитовое","g":"Автоматика и Реле","n":"Установка реле температуры/жидкости","p":1700,"u":"шт"},{"id":"s_r4","c":"Щитовое","g":"Автоматика и Реле","n":"Установка реле контроля фаз","p":1450,"u":"шт"},{"id":"s_r5","c":"Щитовое","g":"Автоматика и Реле","n":"Установка реле напряжения","p":1150,"u":"шт"},{"id":"s_r6","c":"Щитовое","g":"Автоматика и Реле","n":"Установка реле управления нагрузкой","p":2050,"u":"шт"},{"id":"s_m1","c":"Щитовое","g":"Счетчики","n":"Установка электросчетчика 220-240В на DIN","p":1000,"u":"шт"},{"id":"s_m2","c":"Щитовое","g":"Счетчики","n":"Установка электросчетчика 220-240В на монтажную панель","p":1250,"u":"шт"},{"id":"s_m3","c":"Щитовое","g":"Счетчики","n":"Установка электросчетчика 380-400В на DIN","p":1700,"u":"шт"},{"id":"s_m4","c":"Щитовое","g":"Счетчики","n":"Установка электросчетчика 380-400В на монтажную панель","p":2200,"u":"шт"},{"id":"s_m5","c":"Щитовое","g":"Счетчики","n":"Установка электросчетчика под трансформаторы тока","p":2400,"u":"шт"},{"id":"s_m6","c":"Щитовое","g":"Счетчики","n":"Установка трансформатора тока (без подкл)","p":720,"u":"шт"},{"id":"s_p1","c":"Чистовая установка","g":"Розетки накладные","n":"Установка накладной розетки/выкл на бетон","p":680,"u":"шт"},{"id":"s_p2","c":"Чистовая установка","g":"Розетки накладные","n":"Установка накладной розетки/выкл на кирпич","p":600,"u":"шт"},{"id":"s_p3","c":"Чистовая установка","g":"Розетки накладные","n":"Установка накладной розетки/выкл на ГКЛ","p":530,"u":"шт"},{"id":"s_p4","c":"Чистовая установка","g":"Розетки накладные","n":"Установка накладной розетки/выкл на дерево","p":450,"u":"шт"},{"id":"s_p5","c":"Чистовая установка","g":"Механизмы (Спец)","n":"Установка накладной силовой розетки 380В","p":1000,"u":"шт"},{"id":"s_p6","c":"Чистовая установка","g":"Механизмы (Спец)","n":"Установка встраиваемой силовой розетки 380В","p":530,"u":"шт"},{"id":"s_p7","c":"Чистовая установка","g":"Механизмы","n":"Установка встраиваемой розетки/выкл в подрозетник","p":300,"u":"шт"},{"id":"s_p8","c":"Чистовая установка","g":"Механизмы","n":"Установка блока розеток/выкл","p":1200,"u":"шт"},{"id":"s_d1","c":"Черновая электрика","g":"Электроточки","n":"Установка накладного подрозетника","p":300,"u":"шт"},{"id":"s_d2","c":"Черновая электрика","g":"Электроточки","n":"Установка подрозетника","p":180,"u":"шт"},{"id":"s_d3","c":"Черновая электрика","g":"Электроточки","n":"Установка накладной распаечной коробки","p":450,"u":"шт"},{"id":"s_d4","c":"Черновая электрика","g":"Электроточки","n":"Установка встраиваемой распаечной коробки","p":300,"u":"шт"},{"id":"s_d5","c":"Чистовая установка","g":"Механизмы (Спец)","n":"Установка термостата","p":380,"u":"шт"},{"id":"s_d6","c":"Чистовая установка","g":"Механизмы (Спец)","n":"Установка встраиваемого датчика движения","p":330,"u":"шт"},{"id":"s_d7","c":"Чистовая установка","g":"Механизмы (Спец)","n":"Установка звонка","p":680,"u":"шт"},{"id":"s_d8","c":"Чистовая установка","g":"Механизмы (Спец)","n":"Установка кнопки звонка","p":450,"u":"шт"},{"id":"s_d9","c":"Чистовая установка","g":"Механизмы (Спец)","n":"Установка ТВ краба","p":480,"u":"шт"},{"id":"s_sh1","c":"Щитовое","g":"Монтаж накладных","n":"Монтаж электрощитка накладного 2 модуля","p":180,"u":"шт"},{"id":"s_sh2","c":"Щитовое","g":"Монтаж накладных","n":"Монтаж электрощитка накладного 4-8 модулей","p":290,"u":"шт"},{"id":"s_sh3","c":"Щитовое","g":"Монтаж накладных","n":"Монтаж электрощитка накладного 12-24 модуля","p":330,"u":"шт"},{"id":"s_sh4","c":"Щитовое","g":"Монтаж накладных","n":"Монтаж электрощитка накладного 36-60 модулей","p":560,"u":"шт"},{"id":"s_sh5","c":"Щитовое","g":"Монтаж накладных","n":"Монтаж электрощитка накладного 72-96 модулей","p":780,"u":"шт"},{"id":"s_l1","c":"Освещение","g":"LED Лента","n":"Монтаж светодиодной ленты на кухне под шкафами","p":270,"u":"м.п."},{"id":"s_l2","c":"Освещение","g":"LED Лента","n":"Монтаж светодиодной ленты в натяжной потолок","p":390,"u":"м.п."},{"id":"s_l3","c":"Освещение","g":"LED Лента","n":"Монтаж светодиодной ленты на гипсокартон","p":300,"u":"м.п."},{"id":"s_l4","c":"Освещение","g":"LED Лента","n":"Монтаж светодиодной ленты в потолочный плинтус","p":350,"u":"м.п."},{"id":"s_l5","c":"Освещение","g":"LED Лента","n":"Монтаж светодиодной ленты в алюминиевый профиль","p":230,"u":"м.п."},{"id":"s_l6","c":"Освещение","g":"LED Лента","n":"Монтаж светодиодной ленты на карниз","p":350,"u":"м.п."},{"id":"s_l7","c":"Освещение","g":"LED Лента","n":"Установка светодиодной ленты в светильник","p":180,"u":"м.п."},{"id":"s_l8","c":"Освещение","g":"LED Лента","n":"Монтаж светодиодной ленты на улице","p":380,"u":"м.п."},{"id":"s_l9","c":"Освещение","g":"Алюм. профиль","n":"Установка накладного алюм. профиля на скотч","p":110,"u":"м.п."},{"id":"s_l10","c":"Освещение","g":"Алюм. профиль","n":"Установка накладного алюм. профиля со сверлением","p":290,"u":"м.п."},{"id":"s_l11","c":"Освещение","g":"Алюм. профиль","n":"Установка врезного алюм. профиля в готовый паз","p":120,"u":"м.п."},{"id":"s_l12","c":"Освещение","g":"Алюм. профиль","n":"Установка врезного алюм. профиля с подготовкой паза","p":390,"u":"м.п."},{"id":"s_c1","c":"Освещение","g":"Люстры и Светильники","n":"Сборка простой люстры","p":630,"u":"шт"},{"id":"s_c2","c":"Освещение","g":"Люстры и Светильники","n":"Сборка сложной люстры","p":870,"u":"шт"},{"id":"s_c3","c":"Освещение","g":"Люстры и Светильники","n":"Установка крюка под люстру","p":230,"u":"шт"},{"id":"s_c4","c":"Освещение","g":"Люстры и Светильники","n":"Установка люстры на готовый крюк","p":740,"u":"шт"},{"id":"s_c5","c":"Освещение","g":"Люстры и Светильники","n":"Установка люстры с креплением к потолку (простая)","p":1200,"u":"шт"},{"id":"s_c6","c":"Освещение","g":"Люстры и Светильники","n":"Установка люстры с креплением к потолку (сложная/ДУ)","p":2250,"u":"шт"},{"id":"s_c7","c":"Освещение","g":"Люстры и Светильники","n":"Установка тяжелой люстры с креплением на крюк","p":1950,"u":"шт"},{"id":"s_c8","c":"Освещение","g":"Люстры и Светильники","n":"Установка тяжелой люстры с креплением к потолку","p":3600,"u":"шт"},{"id":"s_c9","c":"Освещение","g":"Люстры и Светильники","n":"Установка настенного светильника, бра","p":450,"u":"шт"},{"id":"s_c10","c":"Освещение","g":"Люстры и Светильники","n":"Установка точечного светильника","p":750,"u":"шт"},{"id":"s_c11","c":"Освещение","g":"Люстры и Светильники","n":"Установка светодиодного светильника","p":680,"u":"шт"},{"id":"s_c12","c":"Освещение","g":"Люстры и Светильники","n":"Установка светильника Армстронг","p":380,"u":"шт"},{"id":"s_c13","c":"Освещение","g":"Люстры и Светильники","n":"Установка люминесцентного светильника","p":410,"u":"шт"},{"id":"s_c14","c":"Освещение","g":"Люстры и Светильники","n":"Установка трекового светильника","p":140,"u":"шт"},{"id":"s_c15","c":"Освещение","g":"Люстры и Светильники","n":"Монтаж шинопровода","p":450,"u":"м.п."},{"id":"s_c16","c":"Освещение","g":"Уличное освещение","n":"Установка уличного светильника на фасаде","p":830,"u":"шт"},{"id":"s_c17","c":"Освещение","g":"Уличное освещение","n":"Установка садово-паркового светильника","p":1350,"u":"шт"},{"id":"s_c18","c":"Освещение","g":"Люстры и Светильники","n":"Установка светильника Выход","p":480,"u":"шт"},{"id":"s_c19","c":"Освещение","g":"Уличное освещение","n":"Установка антивандального светильника","p":660,"u":"шт"},{"id":"s_dem1","c":"Демонтаж","g":"Освещение","n":"Демонтаж люстры","p":240,"u":"шт"},{"id":"s_dem2","c":"Демонтаж","g":"Освещение","n":"Демонтаж светильника","p":210,"u":"шт"},{"id":"s_dem3","c":"Демонтаж","g":"Электроточки","n":"Демонтаж розетки","p":200,"u":"шт"},{"id":"s_dem4","c":"Демонтаж","g":"Электроточки","n":"Демонтаж выключателя","p":200,"u":"шт"},{"id":"s_dem5","c":"Демонтаж","g":"Электроточки","n":"Демонтаж распаечной коробки","p":200,"u":"шт"},{"id":"s_dem6","c":"Демонтаж","g":"Электроточки","n":"Демонтаж дверного звонка","p":200,"u":"шт"},{"id":"s_dem7","c":"Демонтаж","g":"Щитовое","n":"Демонтаж реле времени","p":230,"u":"шт"},{"id":"s_dem8","c":"Демонтаж","g":"Щитовое","n":"Демонтаж электрощитка до 8 модулей","p":110,"u":"шт"},{"id":"s_dem9","c":"Демонтаж","g":"Щитовое","n":"Демонтаж электрощитка 12-36 модулей","p":260,"u":"шт"},{"id":"s_dem10","c":"Демонтаж","g":"Щитовое","n":"Демонтаж электрощитка 48-96 модулей","p":470,"u":"шт"},{"id":"s_dem11","c":"Демонтаж","g":"Щитовое","n":"Демонтаж автомата","p":150,"u":"шт"},{"id":"s_dem12","c":"Демонтаж","g":"Щитовое","n":"Демонтаж УЗО","p":150,"u":"шт"},{"id":"s_dem13","c":"Демонтаж","g":"Щитовое","n":"Демонтаж дифавтомата","p":150,"u":"шт"},{"id":"s_dem14","c":"Демонтаж","g":"Щитовое","n":"Демонтаж рубильника","p":150,"u":"шт"},{"id":"s_dem15","c":"Демонтаж","g":"Щитовое","n":"Демонтаж магнитного пускателя","p":140,"u":"шт"}];
    let epGlobalDbType = 'mat';
    let epGlobalDbCache = { matDB: [], workDB: [] };
    window.EP_DB_PROPOSALS_CACHE_V2 = window.EP_DB_PROPOSALS_CACHE_V2 || {};

    function epEsc(v) { return String(v ?? '').replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch])); }
    function epId(v) { return String(v ?? '').replace(/[^a-zA-Z0-9_:-]/g, '_'); }
    function epArr(type) { return type === 'work' ? workDB : matDB; }
    function epSetArr(type, arr) { if (type === 'work') workDB = arr; else matDB = arr; }
    function epClean(v) { return String(v ?? '').trim().toLowerCase(); }
    function epSame(a,b) {
        if (a && b && a.id && b.id && String(a.id) === String(b.id)) return true;
        return epClean(a && a.c) === epClean(b && b.c)
            && epClean((a && (a.g || a.sc)) || '') === epClean((b && (b.g || b.sc)) || '')
            && epClean(a && a.n) === epClean(b && b.n);
    }
    function epMaterialFromName(name) {
        const s = String(name || '');
        const m = s.match(/\((Бетон|Кирпич|Панелька|Мягкий\s*мат\.?|Мягкий материал|ГКЛ|Все типы)\)/i);
        return m ? m[1].replace(/Мягкий\s*материал/i, 'Мягкий мат.').replace(/ГКЛ/i, 'Мягкий мат.') : '';
    }
    function epOpFromName(name) {
        let s = String(name || '').replace(/\s*\((Бетон|Кирпич|Панелька|Мягкий\s*мат\.?|Мягкий материал|ГКЛ|Все типы)\)\s*/ig, '').trim();
        s = s.replace(/подрозетников\s*\((45|64|75)мм\)/i, 'подрозетников $1мм');
        return s;
    }
    function epNormalizeWorkItem(x) {
        const it = Object.assign({}, x || {});
        const originalName = String(it.n || '');
        if (it.sc && !it.g) it.g = it.sc;
        const mat = epMaterialFromName(originalName);
        if (!it.g && mat) it.g = epOpFromName(originalName);
        if (mat && (!it.g || originalName.includes('('))) it.n = mat;
        if (!it.g) {
            const low = originalName.toLowerCase();
            if (/штроб/.test(low)) it.g = epOpFromName(originalName) || 'Штроба';
            else if (/высверл|подрозет/.test(low)) it.g = epOpFromName(originalName) || 'Подрозетники';
            else if (/ниш/.test(low)) it.g = epOpFromName(originalName) || 'Ниши';
            else if (/отверст|алмаз/.test(low)) it.g = epOpFromName(originalName) || 'Алмазные отверстия';
            else if (/демонтаж/.test(low)) it.g = it.g || 'Демонтаж';
            else if (/розет|выключ|механизм|терморег/.test(low)) it.g = it.g || 'Механизмы';
            else if (/кабел|гофр|лоток|труб|короб/.test(low)) it.g = it.g || 'Прокладка кабеля';
            else it.g = it.g || 'Разное';
        }
        if (!it.c) it.c = 'Работы';
        if (!it.u) it.u = 'шт';
        it.p = Number(it.p) || 0;
        return it;
    }
    function epDisplayWorkName(it) {
        const g = it.g || it.sc || '';
        const n = it.n || '';
        if (g && n && !String(n).toLowerCase().includes(String(g).toLowerCase())) return g + ' — ' + n;
        return n || g || 'Позиция';
    }
    function epEstimateCopy(it, type) {
        const copy = Object.assign({}, it);
        if (type === 'work') copy.n = epDisplayWorkName(copy);
        return copy;
    }
    function epMergeFullWorksInto(arr) {
        let out = (arr || []).map(epNormalizeWorkItem);
        EP_FULL_WORKS.forEach(function(w) {
            const nw = epNormalizeWorkItem(w);
            if (!out.some(x => epSame(x, nw))) out.push(Object.assign({}, nw));
        });
        return out;
    }
    function epNormalizeAllWorkDb() {
        workDB = epMergeFullWorksInto(workDB || []);
        try { if (typeof safeSet === 'function') safeSet('user_db_work_v31', JSON.stringify(workDB)); } catch(e){}
    }
    function epGroupCatalog(arr, type) {
        const cats = {};
        (arr || []).forEach(function(raw) {
            const it = type === 'work' ? epNormalizeWorkItem(raw) : Object.assign({}, raw);
            const c = it.c || 'Разное';
            const g = type === 'work' ? (it.g || it.sc || 'Разное') : (it.sc || it.g || 'Разное');
            if (!cats[c]) cats[c] = {};
            if (!cats[c][g]) cats[c][g] = [];
            cats[c][g].push(it);
        });
        return cats;
    }
    function epRenderGroupedList(arr, type, opts) {
        opts = opts || {};
        const cats = epGroupCatalog(arr, type);
        let html = '';
        let idx = 0;
        Object.keys(cats).sort((a,b)=>a.localeCompare(b,'ru')).forEach(function(c) {
            const cid = (opts.prefix || 'ep_cat') + '_' + epId(type + '_' + idx++);
            const catStyle = type === 'work' ? 'style="color:var(--orange); border-color:rgba(245,158,11,.2); background:rgba(245,158,11,.08);"' : '';
            html += `<div class="cat-header" ${catStyle} onclick="toggleCat('${cid}')">${epEsc(c)} <span>▼</span></div><div class="cat-body" id="${cid}">`;
            Object.keys(cats[c]).sort((a,b)=>a.localeCompare(b,'ru')).forEach(function(g) {
                const sid = (opts.prefix || 'ep_sub') + '_' + epId(type + '_' + idx++);
                html += `<div class="ep-subcat-header" onclick="epToggleSubCat('${sid}', event)">${epEsc(g)} <span>открыть</span></div><div class="ep-subcat-body" id="${sid}">`;
                cats[c][g].sort((a,b)=>String(a.n||'').localeCompare(String(b.n||''), 'ru')).forEach(function(it) {
                    if (!it.id) it.id = 'ep_' + type + '_' + Math.abs((String(it.c)+String(it.g)+String(it.n)).split('').reduce((h,ch)=>((h<<5)-h+ch.charCodeAt(0))|0,0));
                    const id = epEsc(it.id);
                    const itemTitle = epEsc(it.n || 'Позиция');
                    if (opts.mode === 'editor') {
                        html += `<div class="emp-row"><div style="flex:1;"><div class="ep-db-item-title">${itemTitle}</div><div class="ep-db-item-meta">${epEsc(g)} • ${Number(it.p)||0} ₽ / ${epEsc(it.u || 'шт')}</div></div><div class="ep-row-actions"><input type="number" value="${Number(it.p)||0}" onchange="requestPriceChange('${type}','${id}',this.value)" style="width:74px;margin:0;padding:5px;text-align:center;"><button class="btn-danger" onclick="epDeleteDbItem('${type}','${id}')" title="Удалить">🗑</button></div></div>`;
                    } else if (opts.mode === 'global') {
                        html += `<label class="mat-item ep-select-row"><input type="checkbox" class="ep-global-check" data-type="${type}" data-id="${id}"><div style="flex:1;"><div class="ep-db-item-title">${itemTitle}</div><div class="ep-db-item-meta">${epEsc(c)} • ${epEsc(g)} • ${Number(it.p)||0} ₽ / ${epEsc(it.u || 'шт')}</div></div></label>`;
                    } else {
                        html += `<div class="mat-item"><div style="flex:1;"><div class="ep-db-item-title">${itemTitle}</div><div class="ep-db-item-meta">${epEsc(g)} • ${Number(it.p)||0} ₽ / ${epEsc(it.u || 'шт')}</div></div><button class="mat-add-btn" style="${type === 'work' ? 'background:var(--orange);' : ''} width:auto; margin:0;" onclick="epPromptGroupedAdd('${id}','${type}')">+ Добавить</button></div>`;
                    }
                });
                html += '</div>';
            });
            html += '</div>';
        });
        return html || '<p style="color:var(--gray);font-size:12px;">Позиций нет</p>';
    }

    window.epToggleSubCat = function(id, ev) { if (ev) ev.stopPropagation(); const el = document.getElementById(id); if (el) el.classList.toggle('active'); };
    window.epPromptGroupedAdd = function(id, type) {
        const item = epArr(type).map(x => type === 'work' ? epNormalizeWorkItem(x) : x).find(x => String(x.id) === String(id));
        if (!item) return;
        window.pendingAdd = { item: epEstimateCopy(item, type), type: type };
        const nameEl = document.getElementById('qty-prompt-name'); if (nameEl) nameEl.innerText = type === 'work' ? epDisplayWorkName(item) : item.n;
        const qtyEl = document.getElementById('qty-input'); if (qtyEl) qtyEl.value = 1;
        openModal('qtyPromptModal');
    };
    const oldPromptAddFull = window.promptAdd;
    window.promptAdd = function(id, type) { if (type === 'work') return window.epPromptGroupedAdd(id, type); if (typeof oldPromptAddFull === 'function') return oldPromptAddFull(id, type); return window.epPromptGroupedAdd(id, type); };
    window.openWorkCatalog = function() { epNormalizeAllWorkDb(); const el = document.getElementById('work-cat-list'); if (el) el.innerHTML = epRenderGroupedList(workDB || [], 'work', { prefix:'wcat_full', mode:'catalog' }); openModal('workModal'); };
    const oldOpenMatCatalogFull = window.openMatCatalog;
    window.openMatCatalog = function() {
        const hasNested = (matDB || []).some(x => x.sc || x.g);
        if (!hasNested && typeof oldOpenMatCatalogFull === 'function') return oldOpenMatCatalogFull();
        const el = document.getElementById('mat-cat-list'); if (el) el.innerHTML = epRenderGroupedList(matDB || [], 'mat', { prefix:'mcat_full', mode:'catalog' }); openModal('matCatModal');
    };
    window.renderDbEditors = function() {
        epNormalizeAllWorkDb();
        const catsM = [...new Set((matDB || []).map(m => m.c || 'Разное'))];
        const catsW = [...new Set((workDB || []).map(w => w.c || 'Разное'))];
        const catsEl = document.getElementById('db-cats'); if (catsEl) catsEl.innerHTML = [...new Set([...catsM, ...catsW])].map(c => `<option value="${epEsc(c)}">`).join('');
        const em = document.getElementById('editor-mat-list'); const ew = document.getElementById('editor-work-list');
        if (em) em.innerHTML = epRenderGroupedList(matDB || [], 'mat', { prefix:'db_m_full', mode:'editor' });
        if (ew) ew.innerHTML = epRenderGroupedList(workDB || [], 'work', { prefix:'db_w_full', mode:'editor' });
    };

    async function epGetGlobalDb() {
        try {
            if (db) {
                const doc = await db.collection('settings').doc('global_db').get();
                if (doc.exists) {
                    const d = doc.data() || {};
                    epGlobalDbCache.matDB = Array.isArray(d.matDB) ? d.matDB : (matDB || []);
                    epGlobalDbCache.workDB = Array.isArray(d.workDB) ? epMergeFullWorksInto(d.workDB) : epMergeFullWorksInto(workDB || []);
                } else { epGlobalDbCache.matDB = matDB || []; epGlobalDbCache.workDB = epMergeFullWorksInto(workDB || []); }
            } else { epGlobalDbCache.matDB = matDB || []; epGlobalDbCache.workDB = epMergeFullWorksInto(workDB || []); }
        } catch(e) { epGlobalDbCache.matDB = matDB || []; epGlobalDbCache.workDB = epMergeFullWorksInto(workDB || []); }
    }
    window.epOpenGlobalDbModal = async function() { if (typeof showLoader === 'function') showLoader('Загрузка базы сервера...', '🌍'); await epGetGlobalDb(); if (typeof hideLoader === 'function') hideLoader(); epGlobalDbType='mat'; epRenderGlobalDbModal(); openModal('globalDbModal'); };
    window.epSwitchGlobalDbTab = function(type) { epGlobalDbType = type; epRenderGlobalDbModal(); };
    window.epGlobalSelectAll = function(flag) { document.querySelectorAll('#ep-global-db-list .ep-global-check').forEach(ch => ch.checked = !!flag); };
    function epRenderGlobalDbModal() {
        const matBtn = document.getElementById('ep-global-tab-mat'); const workBtn = document.getElementById('ep-global-tab-work');
        if (matBtn) matBtn.classList.toggle('active', epGlobalDbType === 'mat'); if (workBtn) workBtn.classList.toggle('active', epGlobalDbType === 'work');
        const list = document.getElementById('ep-global-db-list'); if (!list) return;
        const arr = epGlobalDbType === 'work' ? epGlobalDbCache.workDB : epGlobalDbCache.matDB;
        list.innerHTML = epRenderGroupedList(arr || [], epGlobalDbType, { prefix:'global_full', mode:'global' });
    }
    window.epAddSelectedGlobalToMyDb = async function() {
        const checks = Array.from(document.querySelectorAll('#ep-global-db-list .ep-global-check:checked'));
        if (!checks.length) return showToast('Выберите позиции');
        const type = epGlobalDbType;
        const src = type === 'work' ? epGlobalDbCache.workDB : epGlobalDbCache.matDB;
        let target = epArr(type).slice(); let added=0;
        checks.forEach(function(ch) { const it = src.find(x => String(x.id) === String(ch.dataset.id)); if (it && !target.some(x => epSame(x,it))) { target.push(Object.assign({}, it)); added++; } });
        epSetArr(type, target); if (type === 'work') epNormalizeAllWorkDb();
        try { if (typeof epSaveUserDb === 'function') await epSaveUserDb(); else safeSet(type === 'work' ? 'user_db_work_v31' : 'user_db_mat_v31', JSON.stringify(target)); } catch(e){}
        if (typeof renderDbEditors === 'function') renderDbEditors();
        showToast('✅ Добавлено выбранных: ' + added);
    };
    function epInsertGlobalDbButton() {
        if (document.getElementById('ep-global-db-entry')) return;
        const tools = document.getElementById('ep-db-ai-tools'); const tabs = document.querySelector('#settModal .tabs-container'); const anchor = tools || tabs;
        if (!anchor || !anchor.parentNode) return;
        const box = document.createElement('div'); box.id='ep-global-db-entry'; box.className='ep-global-db-entry'; box.innerHTML = `<button class="btn-shield" onclick="epOpenGlobalDbModal()">🌍 База сервера</button>`;
        anchor.parentNode.insertBefore(box, anchor.nextSibling);
    }
    const oldOpenModalFull = window.openModal;
    window.openModal = function(id) {
        if (typeof oldOpenModalFull === 'function') oldOpenModalFull(id);
        if (id === 'settModal') setTimeout(function() { epInsertGlobalDbButton(); epNormalizeAllWorkDb(); if (typeof renderDbEditors === 'function') renderDbEditors(); epStartProposalV2(); }, 80);
    };

    // Заявки в базу сервера: открыть массив и принимать/отклонять отдельные позиции.
    function epEnsureProposalBox() {
        let cont = document.getElementById('admin-db-proposals');
        if (cont) return cont;
        const panel = document.getElementById('admin-panel');
        if (!panel) return null;
        const box = document.createElement('div');
        box.innerHTML = `<h4 style="color:var(--primary); margin:10px 0 5px;">🌍 Заявки в базу сервера:</h4><div id="admin-db-proposals" style="margin-bottom:10px; border:1px solid var(--primary); background:rgba(79,70,229,.05); border-radius:8px; padding:8px; max-height:260px; overflow-y:auto; font-size:12px;"></div>`;
        panel.insertBefore(box, panel.firstChild ? panel.firstChild.nextSibling : null);
        return document.getElementById('admin-db-proposals');
    }
    function epProposalItemName(x) { return [x.g || x.sc || '', x.n || ''].filter(Boolean).join(' — ') || 'Позиция'; }
    function epRenderProposalList() {
        const cont = epEnsureProposalBox(); if (!cont) return;
        const entries = Object.entries(window.EP_DB_PROPOSALS_CACHE_V2 || {});
        if (!entries.length) { cont.innerHTML = '<span style="color:var(--gray);">Новых заявок нет</span>'; return; }
        cont.innerHTML = entries.map(function([id,d]) {
            const items = Array.isArray(d.items) ? d.items : [];
            const decisions = d.itemDecisions || {};
            const done = Object.keys(decisions).length;
            const preview = items.slice(0,3).map(x => epEsc(epProposalItemName(x))).join('<br>');
            return `<div class="ep-proposal-open-card" onclick="epOpenProposalDetail('${id}')"><b>${epEsc(d.masterName || d.uid || 'Мастер')}</b><span class="ep-proposal-badge">${d.type === 'work' ? 'Работы' : 'Материалы'}</span><div style="font-size:11px;color:var(--gray);margin-top:4px;">${epEsc(d.action || '')} • ${items.length} поз. • обработано ${done}/${items.length}</div><div style="font-size:11px;margin-top:6px;">${preview}${items.length>3?'<br>...':''}</div><button class="btn-info" style="width:100%;margin-top:8px;padding:9px;" onclick="event.stopPropagation(); epOpenProposalDetail('${id}')">Открыть заявку</button></div>`;
        }).join('');
    }
    window.epOpenProposalDetail = function(id) {
        const d = window.EP_DB_PROPOSALS_CACHE_V2[id]; if (!d) return showToast('Заявка не найдена');
        const items = Array.isArray(d.items) ? d.items : [];
        const decisions = d.itemDecisions || {};
        const title = document.getElementById('ep-proposal-title'); if (title) title.innerText = '🌍 Заявка: ' + (d.masterName || d.uid || 'Мастер');
        const body = document.getElementById('ep-proposal-body'); if (!body) return;
        body.innerHTML = `<div style="font-size:12px;color:var(--gray);margin-bottom:8px;">${d.type === 'work' ? 'Работы' : 'Материалы'} • ${items.length} позиций. Можно принять или отклонить каждую отдельно.</div><div class="ep-proposal-top-actions"><button class="btn-info" onclick="epProposalSelectAll(true)">✅ Все</button><button class="btn-vendor" onclick="epProposalSelectAll(false)">⬜ Снять</button><button class="btn-danger" onclick="epResolveProposalItems('${id}','reject')">❌ Отклонить выбранные</button></div><div class="ep-proposal-top-actions"><button class="btn-success" onclick="epResolveProposalItems('${id}','full')">✅ Добавить выбранные</button><button class="btn-primary" onclick="epResolveProposalItems('${id}','names')">🏷 Без суммы</button><button class="btn-vendor" onclick="closeModal('epProposalModal')">Закрыть</button></div>` +
        items.map(function(x,i) {
            const dec = decisions[String(i)];
            const done = !!dec;
            const status = done ? (dec.mode === 'reject' ? 'Отклонено' : (dec.mode === 'names' ? 'Добавлено без суммы' : 'Добавлено полностью')) : 'На рассмотрении';
            return `<div class="ep-proposal-row ${done?'done':''}"><label style="display:flex;gap:8px;align-items:flex-start;"><input type="checkbox" class="ep-proposal-check" data-index="${i}" ${done?'disabled':''} style="width:22px;height:22px;accent-color:var(--primary);"><div style="flex:1;"><div class="ep-db-item-title">${epEsc(epProposalItemName(x))}</div><div class="ep-db-item-meta">${epEsc(x.c || 'Разное')} • ${epEsc(x.g || x.sc || 'Разное')} • ${Number(x.p)||0} ₽ / ${epEsc(x.u || 'шт')} • <b>${status}</b></div></div></label>${done?'':`<div class="ep-proposal-actions"><button class="btn-success" onclick="epResolveProposalOne('${id}',${i},'full')">Добавить</button><button class="btn-primary" onclick="epResolveProposalOne('${id}',${i},'names')">Без суммы</button><button class="btn-danger" onclick="epResolveProposalOne('${id}',${i},'reject')">Отклонить</button></div>`}</div>`;
        }).join('');
        openModal('epProposalModal');
    };
    window.epProposalSelectAll = function(flag) { document.querySelectorAll('#ep-proposal-body .ep-proposal-check:not(:disabled)').forEach(ch => ch.checked = !!flag); };
    window.epResolveProposalOne = function(id, idx, mode) { epResolveProposalItems(id, mode, [idx]); };
    window.epResolveProposalItems = async function(id, mode, forcedIndexes) {
        if (!db || !appUser || appUser.role !== 'admin') return showToast('Только админ');
        const d = window.EP_DB_PROPOSALS_CACHE_V2[id]; if (!d) return showToast('Заявка не найдена');
        const items = Array.isArray(d.items) ? d.items : [];
        let indexes = Array.isArray(forcedIndexes) ? forcedIndexes : Array.from(document.querySelectorAll('#ep-proposal-body .ep-proposal-check:checked')).map(ch => Number(ch.dataset.index));
        indexes = indexes.filter(i => i >= 0 && i < items.length && !(d.itemDecisions || {})[String(i)]);
        if (!indexes.length) return showToast('Выберите необработанные позиции');
        if (typeof showLoader === 'function') showLoader('Обработка позиций...', '🌍');
        try {
            const ref = db.collection('db_proposals').doc(id);
            const fresh = await ref.get(); if (!fresh.exists) throw new Error('Заявка не найдена');
            const fd = fresh.data() || d;
            const decisions = Object.assign({}, fd.itemDecisions || {});
            const type = fd.type || 'mat';
            if (mode !== 'reject') {
                let globalMat = matDB || [], globalWork = workDB || [];
                try { const gdoc = await db.collection('settings').doc('global_db').get(); if (gdoc.exists) { const gd = gdoc.data() || {}; if (Array.isArray(gd.matDB)) globalMat = gd.matDB; if (Array.isArray(gd.workDB)) globalWork = gd.workDB; } } catch(e){}
                let arr = (type === 'work' ? globalWork : globalMat).slice();
                indexes.forEach(function(i) {
                    let it = Object.assign({}, items[i], mode === 'names' ? { p:0 } : {});
                    if (type === 'work') it = epNormalizeWorkItem(it);
                    const pos = arr.findIndex(x => epSame(type === 'work' ? epNormalizeWorkItem(x) : x, it));
                    if (pos >= 0) arr[pos] = Object.assign({}, arr[pos], it, { id: arr[pos].id || it.id });
                    else arr.push(it);
                });
                if (type === 'work') { globalWork = epMergeFullWorksInto(arr); workDB = epMergeFullWorksInto(workDB || []); } else { globalMat = arr; }
                await db.collection('settings').doc('global_db').set({ matDB: globalMat, workDB: globalWork, updatedAt: new Date().toISOString() }, { merge:true });
            }
            indexes.forEach(i => decisions[String(i)] = { mode: mode, decidedAt: new Date().toISOString(), decidedBy: appUser.uid || '' });
            const allDone = items.every((_,i) => !!decisions[String(i)]);
            const status = allDone ? 'processed' : 'pending';
            await ref.set({ itemDecisions: decisions, status: status, updatedAt: new Date().toISOString(), decidedBy: appUser.uid || '' }, { merge:true });
            if (typeof hideLoader === 'function') hideLoader();
            showToast(mode === 'reject' ? 'Позиции отклонены' : '✅ Позиции добавлены');
            const nd = Object.assign({}, fd, { itemDecisions: decisions, status: status });
            if (status === 'pending') window.EP_DB_PROPOSALS_CACHE_V2[id] = nd; else delete window.EP_DB_PROPOSALS_CACHE_V2[id];
            epRenderProposalList(); if (status === 'pending') window.epOpenProposalDetail(id); else closeModal('epProposalModal');
            if (typeof renderDbEditors === 'function') renderDbEditors();
        } catch(e) { if (typeof hideLoader === 'function') hideLoader(); showToast('❌ ' + (e.message || 'Ошибка')); }
    };
    function epStartProposalV2() {
        if (!db || !appUser || appUser.role !== 'admin') return;
        const cont = epEnsureProposalBox(); if (!cont || cont.dataset.v2listen === '1') return;
        cont.dataset.v2listen = '1';
        db.collection('db_proposals').where('status','==','pending').onSnapshot(function(snap) {
            window.EP_DB_PROPOSALS_CACHE_V2 = {};
            snap.forEach(function(doc) { window.EP_DB_PROPOSALS_CACHE_V2[doc.id] = Object.assign({}, doc.data() || {}, { id: doc.id }); });
            epRenderProposalList();
        }, function(e) { cont.innerHTML = '<span style="color:var(--danger);">Ошибка заявок: ' + epEsc(e.message) + '</span>'; });
    }
    function epInitFullWorksPatch() {
        epInsertGlobalDbButton(); epNormalizeAllWorkDb(); if (typeof renderDbEditors === 'function') renderDbEditors(); epStartProposalV2();
    }
    const oldFinishSetupFull = window.finishLoginSetup;
    if (typeof oldFinishSetupFull === 'function') { window.finishLoginSetup = async function() { await oldFinishSetupFull.apply(this, arguments); setTimeout(epInitFullWorksPatch, 250); }; }
    document.addEventListener('DOMContentLoaded', function() { setTimeout(epInitFullWorksPatch, 350); setTimeout(epInitFullWorksPatch, 1300); });
    document.addEventListener('click', function() { setTimeout(function() { epInsertGlobalDbButton(); epStartProposalV2(); }, 120); });
})();


/* =========================================================
 * SOURCE: block-08.js
 * AUTO TARGET: 04-database.js
 * SCORE: 152
 * HITS: db, matDB, workDB, global_db, user_db, category, subcategory, renderDbEditors
 * ========================================================= */

/*
 * Extracted from public/index.html
 * Original script block: 8
 * Original HTML lines: 4873-5226
 */

/* === SURGICAL FIX 2026-05-13: global add/upsert + smart swap filter === */
(function(){
  function qs(id){ return document.getElementById(id); }
  function toast(msg){ if(typeof showToast === 'function') showToast(msg); else alert(msg); }
  function safe(s){
    return String(s == null ? '' : s).replace(/[&<>"]/g, function(m){
      return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[m];
    });
  }
  function norm(s){
    return String(s || '')
      .toLowerCase()
      .replace(/ё/g,'е')
      .replace(/×/g,'x')
      .replace(/с/g,'c')
      .replace(/а/g,'a')
      .replace(/в/g,'b')
      .replace(/[^a-zа-я0-9]+/g,' ')
      .trim();
  }

  function localArr(type){
    try{
      var arr = type === 'work' ? workDB : matDB;
      if(!Array.isArray(arr)) arr = [];
      if(type === 'mat' && !arr.length && typeof FULL_MAT_INIT !== 'undefined') { matDB = (FULL_MAT_INIT || []).slice(); arr = matDB; }
      if(type === 'work' && !arr.length && typeof FULL_WORK_INIT !== 'undefined') { workDB = (FULL_WORK_INIT || []).slice(); arr = workDB; }
      return arr;
    }catch(e){ return []; }
  }
  function setLocalArr(type, arr){
    try{ if(type === 'work') workDB = arr || []; else matDB = arr || []; }catch(e){}
  }

  function getGroup(it){ return (it && (it.g || it.sc || it.subcategory || it.group)) || ''; }
  function itemKey(type, it){
    if(!it) return '';
    if(it.id) return 'id:' + String(it.id);
    return 'sig:' + type + '|' + norm([it.c,getGroup(it),it.n,it.u].filter(Boolean).join('|'));
  }
  function sigKey(type, it){
    return 'sig:' + type + '|' + norm([it && it.c, getGroup(it), it && it.n, it && it.u].filter(Boolean).join('|'));
  }
  function deletedSet(type){
    try{
      var k = type === 'work' ? 'ep_deleted_work_ids_local_v1' : 'ep_deleted_mat_ids_local_v1';
      return new Set(JSON.parse(localStorage.getItem(k) || '[]'));
    }catch(e){ return new Set(); }
  }
  function saveLocalDb(){
    try{
      if(typeof safeSet === 'function'){
        safeSet('user_db_mat_v31', JSON.stringify(localArr('mat')));
        safeSet('user_db_work_v31', JSON.stringify(localArr('work')));
      } else {
        localStorage.setItem('user_db_mat_v31', JSON.stringify(localArr('mat')));
        localStorage.setItem('user_db_work_v31', JSON.stringify(localArr('work')));
      }
    }catch(e){}
    try{
      if(typeof db !== 'undefined' && db && typeof appUser !== 'undefined' && appUser && appUser.uid){
        db.collection('user_db').doc(appUser.uid).set({
          uid: appUser.uid,
          name: appUser.name || appUser.email || '',
          matDB: localArr('mat'),
          workDB: localArr('work'),
          updatedAt: new Date().toISOString()
        }, { merge:true });
      }
    }catch(e){}
  }

  window.EP_GLOBAL_DB_VISIBLE_CACHE = window.EP_GLOBAL_DB_VISIBLE_CACHE || { matDB: [], workDB: [], loadedAt: 0 };
  window.EP_GLOBAL_DB_TAB_FIXED = window.EP_GLOBAL_DB_TAB_FIXED || 'mat';

  async function loadGlobalDb(force){
    if(!force && window.EP_GLOBAL_DB_VISIBLE_CACHE.loadedAt && Date.now() - window.EP_GLOBAL_DB_VISIBLE_CACHE.loadedAt < 12000){
      return window.EP_GLOBAL_DB_VISIBLE_CACHE;
    }
    var cache = { matDB: [], workDB: [], loadedAt: Date.now() };
    try{
      if(typeof db !== 'undefined' && db){
        var doc = await db.collection('settings').doc('global_db').get();
        if(doc.exists){
          var d = doc.data() || {};
          cache.matDB = Array.isArray(d.matDB) ? d.matDB : [];
          cache.workDB = Array.isArray(d.workDB) ? d.workDB : [];
        }
      }
    }catch(e){ console.warn('global_db read error', e); }
    if(!cache.matDB.length) cache.matDB = localArr('mat').slice();
    if(!cache.workDB.length) cache.workDB = localArr('work').slice();
    window.EP_GLOBAL_DB_VISIBLE_CACHE = cache;
    return cache;
  }

  function mergedArr(type){
    var local = localArr(type).map(function(x){ return Object.assign({}, x, {__src:'local'}); });
    var cache = window.EP_GLOBAL_DB_VISIBLE_CACHE || {};
    var global = (type === 'work' ? (cache.workDB || []) : (cache.matDB || [])).map(function(x){ return Object.assign({}, x, {__src:'global'}); });
    var del = deletedSet(type);
    var map = new Map();

    local.forEach(function(it){
      var k1 = itemKey(type,it), k2 = sigKey(type,it);
      if(del.has(k1) || del.has(k2)) return;
      map.set(k2, it);
    });
    global.forEach(function(it){
      var k1 = itemKey(type,it), k2 = sigKey(type,it);
      if(del.has(k1) || del.has(k2)) return;
      if(!map.has(k2)) map.set(k2, it);
    });
    return Array.from(map.values());
  }

  function groupHtml(arr, type, prefix, mode){
    var data = {};
    (arr || []).forEach(function(it){
      var c = it.c || 'Разное';
      var g = getGroup(it) || 'Разное';
      if(!data[c]) data[c] = {};
      if(!data[c][g]) data[c][g] = [];
      data[c][g].push(it);
    });
    var html = '', idx = 0;
    Object.keys(data).sort(function(a,b){return a.localeCompare(b,'ru');}).forEach(function(c){
      var cid = prefix + '_c_' + (idx++);
      var catStyle = type === 'work' ? 'style="color:var(--orange);background:rgba(245,158,11,.08);"' : '';
      html += '<div class="cat-header" '+catStyle+' onclick="toggleCat(\''+cid+'\')">'+safe(c)+'</div><div class="cat-body" id="'+cid+'">';
      Object.keys(data[c]).sort(function(a,b){return a.localeCompare(b,'ru');}).forEach(function(g){
        var gid = prefix + '_g_' + (idx++);
        html += '<div class="ep-db-sub-header" onclick="epToggleSmartSub(\''+gid+'\', event)"><span>'+safe(g)+'</span><small>открыть</small></div><div class="ep-db-sub-body" id="'+gid+'">';
        data[c][g].sort(function(a,b){return String(a.n||'').localeCompare(String(b.n||''),'ru');}).forEach(function(it){
          var k = sigKey(type,it);
          var src = it.__src === 'global' ? '<span style="color:#8B5CF6;font-weight:900;">🌍 серверная</span>' : '<span style="color:#10B981;font-weight:900;">👤 моя</span>';
          var meta = safe(g) + ' • ' + src + ' • ' + (Number(it.p)||0) + ' ₽ / ' + safe(it.u || 'шт');
          if(mode === 'global'){
            html += '<label class="mat-item ep-select-row">' +
              '<input type="checkbox" class="ep-global-check" data-key="'+safe(k)+'" data-type="'+type+'" style="width:22px;height:22px;accent-color:var(--primary);">' +
              '<div style="flex:1;"><div class="ep-db-item-title">'+safe(it.n || 'Позиция')+'</div><div class="ep-db-item-meta">'+meta+'</div></div></label>';
          } else {
            var color = type === 'work' ? 'background:var(--orange);' : '';
            html += '<div class="mat-item"><div style="flex:1;"><div class="ep-db-item-title">'+safe(it.n || 'Позиция')+'</div><div class="ep-db-item-meta">'+meta+'</div></div>' +
              '<button class="mat-add-btn" style="'+color+'width:auto;margin:0;" onclick="promptAdd(\''+safe(k)+'\', \''+type+'\')">+ Добавить</button></div>';
          }
        });
        html += '</div>';
      });
      html += '</div>';
    });
    return html || '<div style="padding:15px;color:var(--gray);font-weight:700;">Позиции не найдены</div>';
  }
  window.epToggleSmartSub = function(id,e){ if(e) e.stopPropagation(); var el = qs(id); if(el) el.classList.toggle('active'); };

  window.epOpenGlobalDbModal = async function(){
    if(typeof showLoader === 'function') showLoader('Загрузка базы сервера...', '🌍');
    await loadGlobalDb(true);
    if(typeof hideLoader === 'function') hideLoader();
    window.EP_GLOBAL_DB_TAB_FIXED = 'mat';
    renderGlobalModalFixed();
    if(typeof openModal === 'function') openModal('globalDbModal');
  };
  window.epSwitchGlobalDbTab = function(type){
    window.EP_GLOBAL_DB_TAB_FIXED = type === 'work' ? 'work' : 'mat';
    renderGlobalModalFixed();
  };
  window.epGlobalSelectAll = function(flag){
    document.querySelectorAll('#ep-global-db-list .ep-global-check').forEach(function(ch){ ch.checked = !!flag; });
  };
  function renderGlobalModalFixed(){
    var type = window.EP_GLOBAL_DB_TAB_FIXED || 'mat';
    var matBtn = qs('ep-global-tab-mat'), workBtn = qs('ep-global-tab-work');
    if(matBtn) matBtn.classList.toggle('active', type === 'mat');
    if(workBtn) workBtn.classList.toggle('active', type === 'work');
    var list = qs('ep-global-db-list');
    if(!list) return;
    var cache = window.EP_GLOBAL_DB_VISIBLE_CACHE || {};
    var arr = (type === 'work' ? (cache.workDB || []) : (cache.matDB || [])).map(function(x){ return Object.assign({}, x, {__src:'global'}); });
    list.innerHTML = groupHtml(arr, type, 'global_fixed_'+type, 'global');
  }

  window.epAddSelectedGlobalToMyDb = async function(){
    var type = window.EP_GLOBAL_DB_TAB_FIXED || 'mat';
    var checks = Array.from(document.querySelectorAll('#ep-global-db-list .ep-global-check:checked'));
    if(!checks.length) return toast('Выберите позиции');

    var cache = await loadGlobalDb(false);
    var src = (type === 'work' ? (cache.workDB || []) : (cache.matDB || []));
    var bySig = new Map(src.map(function(it){ return [sigKey(type,it), it]; }));
    var local = localArr(type).slice();

    var added = 0, updated = 0;
    checks.forEach(function(ch){
      var it = bySig.get(ch.dataset.key);
      if(!it) return;
      var copy = Object.assign({}, it, {__src: undefined});
      var sKey = sigKey(type, copy);
      var idx = local.findIndex(function(x){ return sigKey(type,x) === sKey || (x.id && copy.id && String(x.id) === String(copy.id)); });
      if(idx >= 0){
        local[idx] = Object.assign({}, local[idx], copy, { id: local[idx].id || copy.id });
        updated++;
      } else {
        local.push(copy);
        added++;
      }
    });

    setLocalArr(type, local);
    saveLocalDb();

    await loadGlobalDb(true);
    if(typeof renderDbEditors === 'function') renderDbEditors();
    if(type === 'mat' && qs('mat-cat-list')) qs('mat-cat-list').innerHTML = groupHtml(mergedArr('mat'), 'mat', 'cat_mat_after_global', 'catalog');
    if(type === 'work' && qs('work-cat-list')) qs('work-cat-list').innerHTML = groupHtml(mergedArr('work'), 'work', 'cat_work_after_global', 'catalog');

    toast('✅ В мою базу: добавлено ' + added + ', обновлено ' + updated);
  };

  window.openMatCatalog = async function(){
    var el = qs('mat-cat-list');
    if(el) el.innerHTML = '<div style="padding:15px;color:var(--gray);font-weight:700;">Загружаю мою и базу сервера...</div>';
    if(typeof openModal === 'function') openModal('matCatModal');
    await loadGlobalDb(true);
    if(el) el.innerHTML = groupHtml(mergedArr('mat'), 'mat', 'cat_mat_smart', 'catalog');
  };
  window.openWorkCatalog = async function(){
    var el = qs('work-cat-list');
    if(el) el.innerHTML = '<div style="padding:15px;color:var(--gray);font-weight:700;">Загружаю мою и базу сервера...</div>';
    if(typeof openModal === 'function') openModal('workModal');
    await loadGlobalDb(true);
    if(el) el.innerHTML = groupHtml(mergedArr('work'), 'work', 'cat_work_smart', 'catalog');
  };

  var oldPromptAddSmart = window.promptAdd;
  window.promptAdd = function(keyOrId, type){
    var arr = mergedArr(type);
    var item = arr.find(function(x){ return sigKey(type,x) === keyOrId || itemKey(type,x) === keyOrId || String(x.id||'') === String(keyOrId); });
    if(!item && typeof oldPromptAddSmart === 'function') return oldPromptAddSmart(keyOrId, type);
    if(!item) return toast('Позиция не найдена');
    pendingAdd = { item:item, type:type };
    var name = qs('qty-prompt-name'), qty = qs('qty-input');
    if(name) name.innerText = item.n || 'Позиция';
    if(qty) qty.value = 1;
    if(typeof openModal === 'function') openModal('qtyPromptModal');
  };

  function classify(it){
    var meta = (it && it.dbMeta) || {};
    var n = norm([it && it.n, it && it.c, getGroup(it), meta.kind, meta.category, meta.subcategory].filter(Boolean).join(' '));
    var raw = String((it && it.n) || '');
    if(meta.kind) {
      var k = String(meta.kind).toLowerCase();
      if(k.indexOf('dif') >= 0) return 'dif';
      if(k.indexOf('uzo') >= 0) return 'uzo';
      if(k.indexOf('automatic') >= 0 || k.indexOf('breaker') >= 0) return 'auto';
      if(k.indexOf('voltage') >= 0) return 'voltage_relay';
      if(k.indexOf('contactor') >= 0) return 'contactor';
    }
    if(/диф/i.test(raw) || n.indexOf('диф') >= 0) return 'dif';
    if(/узо/i.test(raw) || n.indexOf('узо') >= 0) return 'uzo';
    if(/уздп|дугов/i.test(raw) || n.indexOf('уздп') >= 0) return 'uzdp';
    if(/узм|реле напряж/i.test(raw) || n.indexOf('реле напряж') >= 0) return 'voltage_relay';
    if(/реле времени/i.test(raw) || n.indexOf('реле времени') >= 0) return 'time_relay';
    if(/контактор/i.test(raw) || n.indexOf('контактор') >= 0) return 'contactor';
    if(/автомат|(^|\s)[abcdсавд]\s?\d{1,3}(\s|$)/i.test(raw) || /\bc\s?\d{1,3}\b/.test(n)) return 'auto';
    if(/кабель|ввг|провод|пугв|utp|ftp|нг/i.test(raw) || n.indexOf('кабель') >= 0 || n.indexOf('ввг') >= 0) return 'cable';
    if(/щит|корпус|бокс/i.test(raw) || n.indexOf('корпус') >= 0) return 'shield_box';
    if(/греб/i.test(raw)) return 'comb';
    if(/ншви|наконеч/i.test(raw)) return 'lug';
    if(/шин|клемм/i.test(raw)) return 'bus';
    if(/din|дин|рейк|огранич/i.test(raw)) return 'din';
    if(/маркир|бирк/i.test(raw)) return 'marking';
    if((it && it.type) === 'work') return 'work:' + norm([(it.c||''), getGroup(it)].join('|'));
    return 'other:' + norm([(it && it.c) || '', getGroup(it)].join('|'));
  }

  function sameSwapClass(current, cand){
    var c1 = classify(current);
    var c2 = classify(cand);
    if(c1 === c2) return true;

    if(c1 === 'cable') return c2 === 'cable';
    if(c1 === 'auto') return c2 === 'auto';
    if(c1 === 'dif') return c2 === 'dif';
    if(c1 === 'uzo') return c2 === 'uzo';
    if(['uzdp','voltage_relay','time_relay','contactor'].indexOf(c1) >= 0) return c2 === c1;

    if(String(c1).indexOf('work:') === 0 && String(c2).indexOf('work:') === 0) {
      return c1 === c2 || c1.split('|')[0] === c2.split('|')[0];
    }
    return false;
  }

  function swapLabel(it){
    var src = it.__src === 'global' ? '🌍' : '👤';
    return src + ' ' + (it.n || 'Позиция') + ' (' + (Number(it.p)||0) + ' ₽)';
  }

  window.EP_SWAP_CANDIDATES_SMART = [];
  window.openSwapModal = async function(idx){
    swapTargetIdx = idx;
    var current = currentEstimate[idx];
    if(!current) return;
    var type = current.type === 'work' ? 'work' : 'mat';

    var sel = qs('swap-select');
    if(sel) sel.innerHTML = '<option>Загрузка вариантов...</option>';
    if(typeof openModal === 'function') openModal('swapModal');

    await loadGlobalDb(true);
    var pool = mergedArr(type);
    var candidates = pool.filter(function(x){ return sameSwapClass(current, x); });

    if(!candidates.length) {
      var cg = norm([current.c || '', (current.dbMeta && current.dbMeta.category) || '', (current.dbMeta && current.dbMeta.subcategory) || ''].join(' '));
      candidates = pool.filter(function(x){ return norm([x.c || '', getGroup(x)].join(' ')).indexOf(cg) >= 0; });
    }

    window.EP_SWAP_CANDIDATES_SMART = candidates;
    if(!sel) return;
    if(!candidates.length) {
      sel.innerHTML = '<option value="">Нет подходящих вариантов</option>';
      return;
    }
    sel.innerHTML = candidates.map(function(x, i){
      return '<option value="'+i+'" '+(x.n === current.n ? 'selected' : '')+'>'+safe(swapLabel(x))+'</option>';
    }).join('');
  };

  window.applySwap = function(){
    if(swapTargetIdx < 0) return;
    var sel = qs('swap-select');
    if(!sel || sel.value === '') return toast('Нет выбранной позиции');
    var item = window.EP_SWAP_CANDIDATES_SMART[Number(sel.value)];
    if(!item) return toast('Позиция не найдена');

    currentEstimate[swapTargetIdx].n = item.n;
    currentEstimate[swapTargetIdx].p = Number(item.p) || 0;
    currentEstimate[swapTargetIdx].u = item.u || currentEstimate[swapTargetIdx].u || 'шт';
    currentEstimate[swapTargetIdx].sourceId = item.id || null;
    currentEstimate[swapTargetIdx].dbMeta = Object.assign({}, currentEstimate[swapTargetIdx].dbMeta || {}, {
      category: item.c || '',
      subcategory: getGroup(item),
      kind: item.kind || ''
    });

    if(typeof renderMainTable === 'function') renderMainTable();
    if(typeof closeModal === 'function') closeModal('swapModal');
    toast('✅ Заменено');
  };
})();


/* =========================================================
 * SOURCE: block-09.js
 * AUTO TARGET: 04-database.js
 * SCORE: 173
 * HITS: db, matDB, workDB, материал, работ, global_db, user_db, import, category, subcategory, renderDbEditors
 * ========================================================= */

/*
 * Extracted from public/index.html
 * Original script block: 9
 * Original HTML lines: 5229-5656
 */

/* === HARD FIX 2026-05-13: global add real local copy + import refresh + smart replacement === */
(function(){
  function qs(id){ return document.getElementById(id); }
  function msg(t){ if(typeof showToast === 'function') showToast(t); else alert(t); }
  function esc(s){
    return String(s == null ? '' : s).replace(/[&<>"]/g, function(m){
      return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[m];
    });
  }
  function clean(s){
    return String(s || '')
      .toLowerCase()
      .replace(/ё/g,'е')
      .replace(/×/g,'x')
      .replace(/с/g,'c')
      .replace(/а/g,'a')
      .replace(/в/g,'b')
      .replace(/[^a-zа-я0-9]+/g,' ')
      .trim();
  }
  function groupOf(it){ return (it && (it.g || it.sc || it.subcategory || it.group)) || ''; }
  function localDb(type){
    try{
      var arr = type === 'work' ? workDB : matDB;
      if(!Array.isArray(arr)) arr = [];
      if(type === 'mat' && !arr.length && typeof FULL_MAT_INIT !== 'undefined') { matDB = (FULL_MAT_INIT || []).slice(); arr = matDB; }
      if(type === 'work' && !arr.length && typeof FULL_WORK_INIT !== 'undefined') { workDB = (FULL_WORK_INIT || []).slice(); arr = workDB; }
      return arr;
    }catch(e){ return []; }
  }
  function setLocalDb(type, arr){
    try{ if(type === 'work') workDB = arr || []; else matDB = arr || []; }catch(e){}
  }
  function idKey(it){ return it && it.id ? 'id:' + String(it.id) : ''; }
  function sigKey(type,it){
    return 'sig:' + type + '|' + clean([it && it.c, groupOf(it), it && it.n, it && it.u].filter(Boolean).join('|'));
  }
  function delStorageKey(type){ return type === 'work' ? 'ep_deleted_work_ids_local_v1' : 'ep_deleted_mat_ids_local_v1'; }
  function deletedSet(type){
    try{ return new Set(JSON.parse(localStorage.getItem(delStorageKey(type)) || '[]')); }catch(e){ return new Set(); }
  }
  function saveDeleted(type,set){
    try{ localStorage.setItem(delStorageKey(type), JSON.stringify(Array.from(set))); }catch(e){}
  }
  function clearDeletedFor(type, it){
    var set = deletedSet(type);
    var before = set.size;
    if(idKey(it)) set.delete(idKey(it));
    set.delete(sigKey(type,it));
    if(it && it.originGlobalId) set.delete('id:' + String(it.originGlobalId));
    if(before !== set.size) saveDeleted(type,set);
  }
  async function saveMyDb(){
    try{
      if(typeof safeSet === 'function'){
        safeSet('user_db_mat_v31', JSON.stringify(localDb('mat')));
        safeSet('user_db_work_v31', JSON.stringify(localDb('work')));
      } else {
        localStorage.setItem('user_db_mat_v31', JSON.stringify(localDb('mat')));
        localStorage.setItem('user_db_work_v31', JSON.stringify(localDb('work')));
      }
    }catch(e){}
    try{
      if(typeof db !== 'undefined' && db && typeof appUser !== 'undefined' && appUser && appUser.uid){
        await db.collection('user_db').doc(appUser.uid).set({
          uid: appUser.uid,
          name: appUser.name || appUser.email || '',
          matDB: localDb('mat'),
          workDB: localDb('work'),
          updatedAt: new Date().toISOString()
        }, { merge:true });
      }
    }catch(e){ console.warn('saveMyDb', e); }
  }

  window.EP_HARD_GLOBAL_CACHE = window.EP_HARD_GLOBAL_CACHE || { matDB: [], workDB: [], loadedAt: 0 };

  async function loadGlobal(force){
    if(!force && window.EP_HARD_GLOBAL_CACHE.loadedAt && Date.now() - window.EP_HARD_GLOBAL_CACHE.loadedAt < 8000) return window.EP_HARD_GLOBAL_CACHE;
    var out = { matDB: [], workDB: [], loadedAt: Date.now() };
    try{
      if(typeof db !== 'undefined' && db){
        var doc = await db.collection('settings').doc('global_db').get();
        if(doc.exists){
          var d = doc.data() || {};
          out.matDB = Array.isArray(d.matDB) ? d.matDB : [];
          out.workDB = Array.isArray(d.workDB) ? d.workDB : [];
        }
      }
    }catch(e){ console.warn('load global_db', e); }
    if(!out.matDB.length) out.matDB = localDb('mat').slice();
    if(!out.workDB.length) out.workDB = localDb('work').slice();
    window.EP_HARD_GLOBAL_CACHE = out;
    window.EP_GLOBAL_DB_VISIBLE_CACHE = out;
    try { if(typeof epGlobalDbCache !== 'undefined') { epGlobalDbCache.matDB = out.matDB; epGlobalDbCache.workDB = out.workDB; } } catch(e){}
    return out;
  }

  function merged(type){
    var del = deletedSet(type);
    var local = localDb(type).map(function(x){ return Object.assign({}, x, {__src:'local'}); });
    var global = (type === 'work' ? window.EP_HARD_GLOBAL_CACHE.workDB : window.EP_HARD_GLOBAL_CACHE.matDB)
      .map(function(x){ return Object.assign({}, x, {__src:'global'}); });
    var map = new Map();

    local.forEach(function(it){
      if(del.has(idKey(it)) || del.has(sigKey(type,it))) return;
      map.set(sigKey(type,it), it);
    });
    global.forEach(function(it){
      if(del.has(idKey(it)) || del.has(sigKey(type,it))) return;
      var k = sigKey(type,it);
      if(!map.has(k)) map.set(k, it);
    });
    return Array.from(map.values());
  }

  function renderList(arr,type,prefix,mode){
    var data = {};
    (arr || []).forEach(function(it){
      var c = it.c || 'Разное';
      var g = groupOf(it) || 'Разное';
      if(!data[c]) data[c] = {};
      if(!data[c][g]) data[c][g] = [];
      data[c][g].push(it);
    });
    var html = '', i = 0;
    Object.keys(data).sort(function(a,b){return a.localeCompare(b,'ru');}).forEach(function(c){
      var cid = prefix + '_c_' + (i++);
      var catStyle = type === 'work' ? 'style="color:var(--orange);background:rgba(245,158,11,.08);"' : '';
      html += '<div class="cat-header" '+catStyle+' onclick="toggleCat(\''+cid+'\')">'+esc(c)+'</div><div class="cat-body" id="'+cid+'">';
      Object.keys(data[c]).sort(function(a,b){return a.localeCompare(b,'ru');}).forEach(function(g){
        var gid = prefix + '_g_' + (i++);
        html += '<div class="ep-db-sub-header" onclick="epHardToggleDbSub(\''+gid+'\', event)"><span>'+esc(g)+'</span><small>открыть</small></div><div class="ep-db-sub-body" id="'+gid+'">';
        data[c][g].sort(function(a,b){return String(a.n||'').localeCompare(String(b.n||''),'ru');}).forEach(function(it,idx){
          var sk = sigKey(type,it);
          var src = it.__src === 'global' ? '<span style="color:#8B5CF6;font-weight:900;">🌍 серверная</span>' : '<span style="color:#10B981;font-weight:900;">👤 моя</span>';
          var meta = esc(g) + ' • ' + src + ' • ' + (Number(it.p)||0) + ' ₽ / ' + esc(it.u || 'шт');
          if(mode === 'global'){
            html += '<label class="mat-item ep-select-row">' +
              '<input type="checkbox" class="ep-global-check" data-type="'+type+'" data-sig="'+esc(sk)+'" data-id="'+esc(String(it.id||''))+'" style="width:22px;height:22px;accent-color:var(--primary);">' +
              '<div style="flex:1;"><div class="ep-db-item-title">'+esc(it.n || 'Позиция')+'</div><div class="ep-db-item-meta">'+meta+'</div></div></label>';
          } else if(mode === 'editor'){
            html += '<div class="emp-row" style="align-items:flex-start;">' +
              '<label style="display:flex;gap:8px;align-items:flex-start;flex:1;">' +
              '<input type="checkbox" class="ep-db-delete-check" data-type="'+type+'" data-sig="'+esc(sk)+'" data-id="'+esc(String(it.id||''))+'" style="width:22px;height:22px;accent-color:#EF4444;margin-top:4px;">' +
              '<div style="flex:1;"><b>'+esc(it.n || 'Позиция')+'</b><br><span style="color:var(--gray);font-size:10px;">'+meta+'</span></div></label>' +
              '<div class="ep-row-actions">' +
              '<input type="number" value="'+(Number(it.p)||0)+'" onchange="requestPriceChange(\''+type+'\', \''+esc(String(it.id||''))+'\', this.value)" style="width:72px;margin:0;padding:4px;text-align:center;">' +
              '<button class="btn-danger" onclick="epHardDeleteLocalPosition(\''+type+'\', \''+esc(sk)+'\', \''+esc(String(it.id||''))+'\')" style="white-space:nowrap;">Удалить позицию</button>' +
              '</div></div>';
          } else {
            var color = type === 'work' ? 'background:var(--orange);' : '';
            html += '<div class="mat-item"><div style="flex:1;"><div class="ep-db-item-title">'+esc(it.n || 'Позиция')+'</div><div class="ep-db-item-meta">'+meta+'</div></div>' +
              '<button class="mat-add-btn" style="'+color+'width:auto;margin:0;" onclick="promptAdd(\''+esc(sk)+'\', \''+type+'\')">+ Добавить</button></div>';
          }
        });
        html += '</div>';
      });
      html += '</div>';
    });
    return html || '<div style="padding:15px;color:var(--gray);font-weight:700;">Позиции не найдены</div>';
  }
  window.epHardToggleDbSub = function(id,e){ if(e) e.stopPropagation(); var el = qs(id); if(el) el.classList.toggle('active'); };

  window.epOpenGlobalDbModal = async function(){
    if(typeof showLoader === 'function') showLoader('Загрузка базы сервера...', '🌍');
    await loadGlobal(true);
    if(typeof hideLoader === 'function') hideLoader();
    window.EP_HARD_GLOBAL_TYPE = 'mat';
    epHardRenderGlobalModal();
    if(typeof openModal === 'function') openModal('globalDbModal');
  };
  window.epSwitchGlobalDbTab = function(type){
    window.EP_HARD_GLOBAL_TYPE = type === 'work' ? 'work' : 'mat';
    epHardRenderGlobalModal();
  };
  window.epGlobalSelectAll = function(flag){
    document.querySelectorAll('#ep-global-db-list .ep-global-check').forEach(function(ch){ ch.checked = !!flag; });
  };
  window.epHardRenderGlobalModal = function(){
    var type = window.EP_HARD_GLOBAL_TYPE || 'mat';
    var matBtn = qs('ep-global-tab-mat'), workBtn = qs('ep-global-tab-work');
    if(matBtn) matBtn.classList.toggle('active', type === 'mat');
    if(workBtn) workBtn.classList.toggle('active', type === 'work');
    var list = qs('ep-global-db-list');
    if(!list) return;
    var cache = window.EP_HARD_GLOBAL_CACHE;
    var arr = (type === 'work' ? cache.workDB : cache.matDB).map(function(x){ return Object.assign({}, x, {__src:'global'}); });
    list.innerHTML = renderList(arr, type, 'hard_global_'+type, 'global');
  };

  window.epAddSelectedGlobalToMyDb = async function(){
    var type = window.EP_HARD_GLOBAL_TYPE || window.EP_GLOBAL_DB_TAB_FIXED || 'mat';
    var checks = Array.from(document.querySelectorAll('#ep-global-db-list .ep-global-check:checked'));
    if(!checks.length) return msg('Выберите позиции');

    var cache = await loadGlobal(false);
    var src = type === 'work' ? cache.workDB : cache.matDB;
    var bySig = new Map(src.map(function(it){ return [sigKey(type,it), it]; }));
    var byId = new Map(src.filter(function(it){return it.id;}).map(function(it){ return [String(it.id), it]; }));
    var local = localDb(type).slice();
    var del = deletedSet(type);

    var added = 0, updated = 0, missed = 0;

    checks.forEach(function(ch, i){
      var it = null;
      if(ch.dataset.sig) it = bySig.get(ch.dataset.sig);
      if(!it && ch.dataset.key) it = bySig.get(ch.dataset.key);
      if(!it && ch.dataset.id) it = byId.get(String(ch.dataset.id));
      if(!it) { missed++; return; }

      var copy = Object.assign({}, it);
      var originalId = copy.id || '';
      copy.originGlobalId = originalId;
      copy.id = 'local_' + type + '_' + Date.now() + '_' + i + '_' + Math.random().toString(36).slice(2,6);
      delete copy.__src;

      del.delete('id:' + String(originalId));
      del.delete(sigKey(type,it));
      del.delete(sigKey(type,copy));

      var s = sigKey(type, copy);
      var idx = local.findIndex(function(x){
        return sigKey(type,x) === s || String(x.originGlobalId || '') === String(originalId);
      });

      if(idx >= 0){
        var keepId = local[idx].id || copy.id;
        local[idx] = Object.assign({}, local[idx], copy, { id: keepId, originGlobalId: originalId });
        updated++;
      } else {
        local.push(copy);
        added++;
      }
    });

    saveDeleted(type, del);
    setLocalDb(type, local);
    await saveMyDb();

    await loadGlobal(true);
    if(typeof renderDbEditors === 'function') renderDbEditors();
    if(qs('mat-cat-list')) qs('mat-cat-list').innerHTML = renderList(merged('mat'), 'mat', 'hard_mat_after_add', 'catalog');
    if(qs('work-cat-list')) qs('work-cat-list').innerHTML = renderList(merged('work'), 'work', 'hard_work_after_add', 'catalog');

    msg('✅ В мою базу: добавлено ' + added + ', обновлено ' + updated + (missed ? ', не найдено ' + missed : ''));
  };

  window.openMatCatalog = async function(){
    var el = qs('mat-cat-list');
    if(el) el.innerHTML = '<div style="padding:15px;color:var(--gray);font-weight:700;">Загружаю мою и базу сервера...</div>';
    if(typeof openModal === 'function') openModal('matCatModal');
    await loadGlobal(true);
    if(el) el.innerHTML = renderList(merged('mat'), 'mat', 'hard_mat_catalog', 'catalog');
  };
  window.openWorkCatalog = async function(){
    var el = qs('work-cat-list');
    if(el) el.innerHTML = '<div style="padding:15px;color:var(--gray);font-weight:700;">Загружаю мою и базу сервера...</div>';
    if(typeof openModal === 'function') openModal('workModal');
    await loadGlobal(true);
    if(el) el.innerHTML = renderList(merged('work'), 'work', 'hard_work_catalog', 'catalog');
  };

  function toolbar(type){
    var title = type === 'mat' ? 'Материалы' : 'Работы';
    return '<div style="border:1px solid var(--border);border-radius:14px;padding:10px;margin:10px 0;background:rgba(239,68,68,.05);">' +
      '<div style="font-weight:900;color:var(--danger);margin-bottom:6px;">🗑 Удаление позиций: '+title+'</div>' +
      '<div style="font-size:11px;color:var(--gray);margin-bottom:8px;">Удаляет/скрывает только у мастера. База сервера не трогается.</div>' +
      '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:8px;">' +
      '<button class="btn-info" style="margin:0;padding:10px;" onclick="epHardSelectDelete(\''+type+'\', true)">✅ Выделить все</button>' +
      '<button class="btn-vendor" style="margin:0;padding:10px;" onclick="epHardSelectDelete(\''+type+'\', false)">⬜ Убрать галочки</button>' +
      '</div>' +
      '<button class="btn-danger" style="width:100%;margin:0;padding:12px;" onclick="epHardDeleteSelected(\''+type+'\')">Удалить выбранные у мастера</button>' +
      '</div>';
  }
  window.renderDbEditors = async function(){
    await loadGlobal(false);
    var cats = qs('db-cats');
    if(cats){
      var all = merged('mat').concat(merged('work'));
      cats.innerHTML = Array.from(new Set(all.map(function(x){ return x.c || 'Разное'; }))).sort(function(a,b){return a.localeCompare(b,'ru');}).map(function(c){ return '<option value="'+esc(c)+'">'; }).join('');
    }
    var em = qs('editor-mat-list');
    var ew = qs('editor-work-list');
    if(em) em.innerHTML = toolbar('mat') + renderList(merged('mat'), 'mat', 'hard_editor_mat', 'editor');
    if(ew) ew.innerHTML = toolbar('work') + renderList(merged('work'), 'work', 'hard_editor_work', 'editor');
  };

  window.epHardSelectDelete = function(type, flag){
    document.querySelectorAll('.ep-db-delete-check[data-type="'+type+'"]').forEach(function(ch){ ch.checked = !!flag; });
  };
  window.epHardDeleteLocalPosition = async function(type, sig, id){
    var del = deletedSet(type);
    if(id) del.add('id:' + String(id));
    if(sig) del.add(sig);
    saveDeleted(type,del);
    var local = localDb(type).filter(function(x){ return sigKey(type,x) !== sig && (!id || String(x.id||'') !== String(id)); });
    setLocalDb(type, local);
    await saveMyDb();
    if(typeof renderDbEditors === 'function') renderDbEditors();
    msg('✅ Удалено только у мастера');
  };
  window.epHardDeleteSelected = async function(type){
    var checks = Array.from(document.querySelectorAll('.ep-db-delete-check[data-type="'+type+'"]:checked'));
    if(!checks.length) return msg('Выберите позиции галочками');
    var del = deletedSet(type);
    var sigs = new Set();
    var ids = new Set();
    checks.forEach(function(ch){
      if(ch.dataset.sig){ del.add(ch.dataset.sig); sigs.add(ch.dataset.sig); }
      if(ch.dataset.id){ del.add('id:' + ch.dataset.id); ids.add(String(ch.dataset.id)); }
    });
    saveDeleted(type, del);
    var local = localDb(type).filter(function(x){ return !sigs.has(sigKey(type,x)) && !ids.has(String(x.id||'')); });
    setLocalDb(type, local);
    await saveMyDb();
    if(typeof renderDbEditors === 'function') renderDbEditors();
    msg('✅ Удалено у мастера: ' + checks.length);
  };

  var oldPromptAddHard = window.promptAdd;
  window.promptAdd = function(keyOrId,type){
    var arr = merged(type);
    var item = arr.find(function(x){ return sigKey(type,x) === keyOrId || idKey(x) === keyOrId || String(x.id||'') === String(keyOrId); });
    if(!item && typeof oldPromptAddHard === 'function') return oldPromptAddHard(keyOrId,type);
    if(!item) return msg('Позиция не найдена');
    pendingAdd = { item:item, type:type };
    var n = qs('qty-prompt-name'), q = qs('qty-input');
    if(n) n.innerText = item.n || 'Позиция';
    if(q) q.value = 1;
    if(typeof openModal === 'function') openModal('qtyPromptModal');
  };

  var oldApplyImportHard = window.epApplyReviewedDbItems;
  window.epApplyReviewedDbItems = async function(mode){
    if(typeof oldApplyImportHard === 'function') {
      await oldApplyImportHard(mode);
    }
    await saveMyDb();
    await loadGlobal(true);
    if(typeof renderDbEditors === 'function') renderDbEditors();
    msg('✅ Импорт сохранён в базе мастера');
  };

  function classify(it){
    var meta = (it && it.dbMeta) || {};
    var n = clean([it && it.n, it && it.c, groupOf(it), meta.kind, meta.category, meta.subcategory].filter(Boolean).join(' '));
    var raw = String((it && it.n) || '');
    if(meta.kind) {
      var k = String(meta.kind).toLowerCase();
      if(k.indexOf('dif') >= 0) return 'dif';
      if(k.indexOf('uzo') >= 0) return 'uzo';
      if(k.indexOf('automatic') >= 0 || k.indexOf('breaker') >= 0) return 'auto';
      if(k.indexOf('voltage') >= 0) return 'voltage';
      if(k.indexOf('contactor') >= 0) return 'contactor';
    }
    if(/диф/i.test(raw) || n.indexOf('диф') >= 0) return 'dif';
    if(/узо/i.test(raw) || n.indexOf('узо') >= 0) return 'uzo';
    if(/уздп|дугов/i.test(raw) || n.indexOf('уздп') >= 0) return 'uzdp';
    if(/узм|реле напряж/i.test(raw) || n.indexOf('реле напряж') >= 0) return 'voltage';
    if(/реле времени/i.test(raw) || n.indexOf('реле времени') >= 0) return 'time';
    if(/контактор/i.test(raw) || n.indexOf('контактор') >= 0) return 'contactor';
    if(/автомат|(^|\s)[abcdсавд]\s?\d{1,3}(\s|$)/i.test(raw) || /\bc\s?\d{1,3}\b/.test(n)) return 'auto';
    if(/кабель|ввг|провод|utp|ftp|нг/i.test(raw) || n.indexOf('кабель') >= 0 || n.indexOf('ввг') >= 0) return 'cable';
    if(/щит|корпус|бокс/i.test(raw)) return 'shield';
    if(/греб/i.test(raw)) return 'comb';
    if(/ншви|наконеч/i.test(raw)) return 'lug';
    if(/шин|клемм/i.test(raw)) return 'bus';
    if(/din|дин|рейк|огранич/i.test(raw)) return 'din';
    if(/маркир|бирк/i.test(raw)) return 'marking';
    if((it && it.type) === 'work') return 'work:' + clean([(it.c||''), groupOf(it)].join('|'));
    return 'other:' + clean([(it && it.c) || '', groupOf(it)].join('|'));
  }
  function sameClass(a,b){
    var ca = classify(a), cb = classify(b);
    if(ca === cb) return true;
    if(['cable','auto','dif','uzo','uzdp','voltage','time','contactor'].indexOf(ca) >= 0) return ca === cb;
    if(ca.indexOf('work:') === 0 && cb.indexOf('work:') === 0) return ca === cb || ca.split('|')[0] === cb.split('|')[0];
    return false;
  }

  window.EP_HARD_SWAP = [];
  window.openSwapModal = async function(idx){
    swapTargetIdx = idx;
    var current = currentEstimate[idx];
    if(!current) return;
    var type = current.type === 'work' ? 'work' : 'mat';
    var sel = qs('swap-select');
    if(sel) sel.innerHTML = '<option>Загрузка...</option>';
    if(typeof openModal === 'function') openModal('swapModal');
    await loadGlobal(true);
    var pool = merged(type);
    var cands = pool.filter(function(x){ return sameClass(current,x); });
    window.EP_HARD_SWAP = cands;
    if(!sel) return;
    if(!cands.length) { sel.innerHTML = '<option value="">Нет подходящих вариантов</option>'; return; }
    sel.innerHTML = cands.map(function(x,i){
      var src = x.__src === 'global' ? '🌍' : '👤';
      return '<option value="'+i+'">'+src+' '+esc(x.n || 'Позиция')+' ('+(Number(x.p)||0)+' ₽)</option>';
    }).join('');
  };
  window.applySwap = function(){
    if(swapTargetIdx < 0) return;
    var sel = qs('swap-select');
    if(!sel || sel.value === '') return msg('Нет выбранной позиции');
    var item = window.EP_HARD_SWAP[Number(sel.value)];
    if(!item) return msg('Позиция не найдена');
    currentEstimate[swapTargetIdx].n = item.n;
    currentEstimate[swapTargetIdx].p = Number(item.p)||0;
    currentEstimate[swapTargetIdx].u = item.u || currentEstimate[swapTargetIdx].u || 'шт';
    currentEstimate[swapTargetIdx].sourceId = item.id || null;
    if(typeof renderMainTable === 'function') renderMainTable();
    if(typeof closeModal === 'function') closeModal('swapModal');
    msg('✅ Заменено');
  };

  document.addEventListener('DOMContentLoaded', function(){
    setTimeout(function(){
      loadGlobal(true).then(function(){
        if(typeof renderDbEditors === 'function') renderDbEditors();
      });
    }, 500);
  });
})();


/* =========================================================
 * SOURCE: block-10.js
 * AUTO TARGET: 04-database.js
 * SCORE: 192
 * HITS: db, matDB, workDB, материал, работ, global_db, user_db, import, category, subcategory, renderDbEditors
 * ========================================================= */

/*
 * Extracted from public/index.html
 * Original script block: 10
 * Original HTML lines: 5659-6199
 */

/* === ULTIMATE DB VISIBILITY FIX 2026-05-13: global visible everywhere + local master edit === */
(function(){
  function $(id){ return document.getElementById(id); }
  function toast(t){ if(typeof showToast === 'function') showToast(t); else alert(t); }
  function esc(s){
    return String(s == null ? '' : s).replace(/[&<>"]/g, function(m){
      return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[m];
    });
  }
  function norm(s){
    return String(s || '')
      .toLowerCase()
      .replace(/ё/g,'е')
      .replace(/×/g,'x')
      .replace(/с/g,'c')
      .replace(/а/g,'a')
      .replace(/в/g,'b')
      .replace(/[^a-zа-я0-9]+/g,' ')
      .trim();
  }
  function encodeItem(it){
    try { return encodeURIComponent(JSON.stringify(it || {})); } catch(e){ return ''; }
  }
  function decodeItem(v){
    try { return JSON.parse(decodeURIComponent(v || '{}')); } catch(e){ return null; }
  }
  function groupOf(it){ return (it && (it.g || it.sc || it.subcategory || it.group)) || ''; }
  function sig(type,it){
    return 'sig:' + type + '|' + norm([it && it.c, groupOf(it), it && it.n, it && it.u].filter(Boolean).join('|'));
  }
  function idkey(it){ return it && it.id ? 'id:' + String(it.id) : ''; }
  function delKey(type){ return type === 'work' ? 'ep_deleted_work_ids_local_v1' : 'ep_deleted_mat_ids_local_v1'; }
  function delSet(type){
    try { return new Set(JSON.parse(localStorage.getItem(delKey(type)) || '[]')); } catch(e){ return new Set(); }
  }
  function saveDel(type,set){
    try { localStorage.setItem(delKey(type), JSON.stringify(Array.from(set))); } catch(e){}
  }
  function localDb(type){
    try{
      var arr = type === 'work' ? workDB : matDB;
      if(!Array.isArray(arr)) arr = [];
      if(type === 'mat' && !arr.length && typeof FULL_MAT_INIT !== 'undefined') { matDB = (FULL_MAT_INIT || []).slice(); arr = matDB; }
      if(type === 'work' && !arr.length && typeof FULL_WORK_INIT !== 'undefined') { workDB = (FULL_WORK_INIT || []).slice(); arr = workDB; }
      return arr;
    }catch(e){ return []; }
  }
  function setLocalDb(type, arr){
    try { if(type === 'work') workDB = arr || []; else matDB = arr || []; } catch(e){}
  }
  function stripRuntime(it){
    var x = Object.assign({}, it || {});
    delete x.__src;
    delete x.__encoded;
    return x;
  }

  window.EP_ULTIMATE_DB_CACHE = window.EP_ULTIMATE_DB_CACHE || { matDB: [], workDB: [], ts: 0 };

  async function saveMyDb(){
    try{
      if(typeof safeSet === 'function') {
        safeSet('user_db_mat_v31', JSON.stringify(localDb('mat')));
        safeSet('user_db_work_v31', JSON.stringify(localDb('work')));
      } else {
        localStorage.setItem('user_db_mat_v31', JSON.stringify(localDb('mat')));
        localStorage.setItem('user_db_work_v31', JSON.stringify(localDb('work')));
      }
    }catch(e){}
    try{
      if(typeof db !== 'undefined' && db && typeof appUser !== 'undefined' && appUser && appUser.uid){
        await db.collection('user_db').doc(appUser.uid).set({
          uid: appUser.uid,
          name: appUser.name || appUser.email || '',
          matDB: localDb('mat'),
          workDB: localDb('work'),
          updatedAt: new Date().toISOString()
        }, { merge:true });
      }
    }catch(e){ console.warn('saveMyDb failed', e); }
  }

  function loadCachedGlobalFromStorage(){
    try{
      var raw = localStorage.getItem('ep_global_cache_ultimate_v1');
      if(!raw) return null;
      var d = JSON.parse(raw);
      if(d && (Array.isArray(d.matDB) || Array.isArray(d.workDB))) return {
        matDB: Array.isArray(d.matDB) ? d.matDB : [],
        workDB: Array.isArray(d.workDB) ? d.workDB : [],
        ts: d.ts || Date.now()
      };
    }catch(e){}
    return null;
  }

  async function readGlobal(force){
    if(!force && window.EP_ULTIMATE_DB_CACHE.ts && Date.now() - window.EP_ULTIMATE_DB_CACHE.ts < 6000) return window.EP_ULTIMATE_DB_CACHE;

    var out = { matDB: [], workDB: [], ts: Date.now() };
    var fromStorage = loadCachedGlobalFromStorage();
    if(fromStorage) out = fromStorage;

    try{
      if(typeof db !== 'undefined' && db){
        var doc = await db.collection('settings').doc('global_db').get();
        if(doc.exists){
          var d = doc.data() || {};
          out = {
            matDB: Array.isArray(d.matDB) ? d.matDB : [],
            workDB: Array.isArray(d.workDB) ? d.workDB : [],
            ts: Date.now()
          };
        }
      }
    }catch(e){ console.warn('read global_db failed', e); }

    if(!out.matDB.length) out.matDB = localDb('mat').slice();
    if(!out.workDB.length) out.workDB = localDb('work').slice();

    window.EP_ULTIMATE_DB_CACHE = out;
    window.EP_HARD_GLOBAL_CACHE = out;
    window.EP_GLOBAL_DB_VISIBLE_CACHE = out;
    try { localStorage.setItem('ep_global_cache_ultimate_v1', JSON.stringify(out)); } catch(e){}
    return out;
  }

  function merged(type){
    var local = localDb(type).map(function(x){ return Object.assign({}, x, {__src:'local'}); });
    var global = (type === 'work' ? (window.EP_ULTIMATE_DB_CACHE.workDB || []) : (window.EP_ULTIMATE_DB_CACHE.matDB || []))
      .map(function(x){ return Object.assign({}, x, {__src:'global'}); });
    var del = delSet(type);
    var map = new Map();

    local.forEach(function(it){
      if(del.has(idkey(it)) || del.has(sig(type,it))) return;
      map.set(sig(type,it), it);
    });
    global.forEach(function(it){
      if(del.has(idkey(it)) || del.has(sig(type,it))) return;
      var k = sig(type,it);
      if(!map.has(k)) map.set(k, it);
    });
    return Array.from(map.values());
  }

  function renderItems(arr,type,prefix,mode){
    var data = {};
    (arr || []).forEach(function(it){
      var c = it.c || 'Разное';
      var g = groupOf(it) || 'Разное';
      if(!data[c]) data[c] = {};
      if(!data[c][g]) data[c][g] = [];
      data[c][g].push(it);
    });

    var html = '', n = 0;
    Object.keys(data).sort(function(a,b){return a.localeCompare(b,'ru');}).forEach(function(c){
      var cid = prefix + '_c_' + (n++);
      var catStyle = type === 'work' ? 'style="color:var(--orange);background:rgba(245,158,11,.08);"' : '';
      html += '<div class="cat-header" '+catStyle+' onclick="toggleCat(\''+cid+'\')">'+esc(c)+'</div><div class="cat-body" id="'+cid+'">';
      Object.keys(data[c]).sort(function(a,b){return a.localeCompare(b,'ru');}).forEach(function(g){
        var gid = prefix + '_g_' + (n++);
        html += '<div class="ep-db-sub-header" onclick="epUltimateToggleSub(\''+gid+'\', event)"><span>'+esc(g)+'</span><small>открыть</small></div><div class="ep-db-sub-body" id="'+gid+'">';
        data[c][g].sort(function(a,b){return String(a.n||'').localeCompare(String(b.n||''),'ru');}).forEach(function(it){
          var encoded = encodeItem(it);
          var sk = sig(type,it);
          var src = it.__src === 'global'
            ? '<span style="color:#8B5CF6;font-weight:900;">🌍 серверная</span>'
            : '<span style="color:#10B981;font-weight:900;">👤 моя</span>';
          var meta = esc(g) + ' • ' + src + ' • ' + (Number(it.p)||0) + ' ₽ / ' + esc(it.u || 'шт');

          if(mode === 'global'){
            html += '<label class="mat-item ep-select-row">' +
              '<input type="checkbox" class="ep-global-check" data-type="'+type+'" data-item="'+esc(encoded)+'" data-sig="'+esc(sk)+'" style="width:22px;height:22px;accent-color:var(--primary);">' +
              '<div style="flex:1;"><div class="ep-db-item-title">'+esc(it.n || 'Позиция')+'</div><div class="ep-db-item-meta">'+meta+'</div></div></label>';
          } else if(mode === 'editor'){
            html += '<div class="emp-row" style="align-items:flex-start;">' +
              '<label style="display:flex;gap:8px;align-items:flex-start;flex:1;">' +
              '<input type="checkbox" class="ep-db-delete-check" data-type="'+type+'" data-item="'+esc(encoded)+'" data-sig="'+esc(sk)+'" style="width:22px;height:22px;accent-color:#EF4444;margin-top:4px;">' +
              '<div style="flex:1;"><b>'+esc(it.n || 'Позиция')+'</b><br><span style="color:var(--gray);font-size:10px;">'+meta+'</span></div></label>' +
              '<div class="ep-row-actions">' +
              '<input type="number" value="'+(Number(it.p)||0)+'" onchange="epUltimateEditPrice(\''+type+'\', \''+esc(encoded)+'\', this.value)" style="width:74px;margin:0;padding:4px;text-align:center;">' +
              '<button class="btn-danger" onclick="epUltimateDeleteOne(\''+type+'\', \''+esc(encoded)+'\')" style="white-space:nowrap;">Удалить позицию</button>' +
              '</div></div>';
          } else {
            var color = type === 'work' ? 'background:var(--orange);' : '';
            html += '<div class="mat-item"><div style="flex:1;"><div class="ep-db-item-title">'+esc(it.n || 'Позиция')+'</div><div class="ep-db-item-meta">'+meta+'</div></div>' +
              '<button class="mat-add-btn" style="'+color+'width:auto;margin:0;" onclick="promptAdd(\''+esc(encoded)+'\', \''+type+'\')">+ Добавить</button></div>';
          }
        });
        html += '</div>';
      });
      html += '</div>';
    });

    return html || '<div style="padding:15px;color:var(--gray);font-weight:700;">Позиции не найдены</div>';
  }

  window.epUltimateToggleSub = function(id,e){
    if(e) e.stopPropagation();
    var el = $(id);
    if(el) el.classList.toggle('active');
  };

  function makeLocalCopy(type,it){
    var copy = stripRuntime(it);
    var originalId = copy.id || copy.originGlobalId || '';
    copy.originGlobalId = originalId;
    if(!String(copy.id || '').startsWith('local_')) {
      copy.id = 'local_' + type + '_' + Date.now() + '_' + Math.random().toString(36).slice(2,7);
    }
    return copy;
  }

  function upsertLocal(type,it){
    var copy = makeLocalCopy(type,it);
    var arr = localDb(type).slice();
    var s = sig(type,copy);
    var original = copy.originGlobalId || '';
    var idx = arr.findIndex(function(x){
      return sig(type,x) === s || (original && String(x.originGlobalId || '') === String(original));
    });
    if(idx >= 0) {
      var keepId = arr[idx].id || copy.id;
      arr[idx] = Object.assign({}, arr[idx], copy, { id: keepId });
      setLocalDb(type, arr);
      return 'updated';
    }
    arr.push(copy);
    setLocalDb(type, arr);
    return 'added';
  }

  function unhide(type,it){
    var del = delSet(type);
    del.delete(idkey(it));
    del.delete(sig(type,it));
    if(it && it.originGlobalId) del.delete('id:' + String(it.originGlobalId));
    saveDel(type,del);
  }

  window.epOpenGlobalDbModal = async function(){
    if(typeof showLoader === 'function') showLoader('Загрузка базы сервера...', '🌍');
    await readGlobal(true);
    if(typeof hideLoader === 'function') hideLoader();
    window.EP_ULTIMATE_GLOBAL_TYPE = 'mat';
    window.epUltimateRenderGlobal();
    if(typeof openModal === 'function') openModal('globalDbModal');
  };

  window.epSwitchGlobalDbTab = function(type){
    window.EP_ULTIMATE_GLOBAL_TYPE = type === 'work' ? 'work' : 'mat';
    window.epUltimateRenderGlobal();
  };

  window.epGlobalSelectAll = function(flag){
    document.querySelectorAll('#ep-global-db-list .ep-global-check').forEach(function(ch){ ch.checked = !!flag; });
  };

  window.epUltimateRenderGlobal = function(){
    var type = window.EP_ULTIMATE_GLOBAL_TYPE || 'mat';
    var matBtn = $('ep-global-tab-mat'), workBtn = $('ep-global-tab-work');
    if(matBtn) matBtn.classList.toggle('active', type === 'mat');
    if(workBtn) workBtn.classList.toggle('active', type === 'work');

    var list = $('ep-global-db-list');
    if(!list) return;
    var cache = window.EP_ULTIMATE_DB_CACHE || {matDB:[],workDB:[]};
    var arr = (type === 'work' ? cache.workDB : cache.matDB).map(function(x){ return Object.assign({}, x, {__src:'global'}); });
    list.innerHTML = renderItems(arr, type, 'ultimate_global_' + type, 'global');
  };

  window.epAddSelectedGlobalToMyDb = async function(){
    var type = window.EP_ULTIMATE_GLOBAL_TYPE || 'mat';
    var checks = Array.from(document.querySelectorAll('#ep-global-db-list .ep-global-check:checked'));
    if(!checks.length) return toast('Выберите позиции');

    var added = 0, updated = 0, bad = 0;
    checks.forEach(function(ch){
      var it = decodeItem(ch.dataset.item);
      if(!it || !it.n) { bad++; return; }
      unhide(type,it);
      var result = upsertLocal(type,it);
      if(result === 'added') added++;
      else updated++;
    });

    await saveMyDb();
    await readGlobal(true);

    if(typeof renderDbEditors === 'function') renderDbEditors();

    var matList = $('mat-cat-list'), workList = $('work-cat-list');
    if(matList) matList.innerHTML = renderItems(merged('mat'), 'mat', 'ultimate_mat_after_add', 'catalog');
    if(workList) workList.innerHTML = renderItems(merged('work'), 'work', 'ultimate_work_after_add', 'catalog');

    toast('✅ В мою базу: добавлено ' + added + ', обновлено ' + updated + (bad ? ', ошибок ' + bad : ''));
  };

  window.openMatCatalog = async function(){
    var el = $('mat-cat-list');
    if(el) el.innerHTML = '<div style="padding:15px;color:var(--gray);font-weight:700;">Загружаю мою и базу сервера...</div>';
    if(typeof openModal === 'function') openModal('matCatModal');
    await readGlobal(true);
    if(el) el.innerHTML = renderItems(merged('mat'), 'mat', 'ultimate_mat_catalog', 'catalog');
  };

  window.openWorkCatalog = async function(){
    var el = $('work-cat-list');
    if(el) el.innerHTML = '<div style="padding:15px;color:var(--gray);font-weight:700;">Загружаю мою и базу сервера...</div>';
    if(typeof openModal === 'function') openModal('workModal');
    await readGlobal(true);
    if(el) el.innerHTML = renderItems(merged('work'), 'work', 'ultimate_work_catalog', 'catalog');
  };

  function deleteToolbar(type){
    var title = type === 'mat' ? 'Материалы' : 'Работы';
    return '<div style="border:1px solid var(--border);border-radius:14px;padding:10px;margin:10px 0;background:rgba(239,68,68,.05);">' +
      '<div style="font-weight:900;color:var(--danger);margin-bottom:6px;">🗑 Удаление позиций: '+title+'</div>' +
      '<div style="font-size:11px;color:var(--gray);margin-bottom:8px;">Удаляет/скрывает только у мастера. База сервера не трогается.</div>' +
      '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:8px;">' +
      '<button class="btn-info" style="margin:0;padding:10px;" onclick="epUltimateSelectDelete(\''+type+'\', true)">✅ Выделить все</button>' +
      '<button class="btn-vendor" style="margin:0;padding:10px;" onclick="epUltimateSelectDelete(\''+type+'\', false)">⬜ Убрать галочки</button>' +
      '</div>' +
      '<button class="btn-danger" style="width:100%;margin:0;padding:12px;" onclick="epUltimateDeleteSelected(\''+type+'\')">Удалить выбранные у мастера</button>' +
      '</div>';
  }

  window.renderDbEditors = async function(){
    var em = $('editor-mat-list'), ew = $('editor-work-list');
    if(em) em.innerHTML = '<div style="padding:12px;color:var(--gray);font-weight:700;">Загружаю материалы...</div>';
    if(ew) ew.innerHTML = '<div style="padding:12px;color:var(--gray);font-weight:700;">Загружаю работы...</div>';

    await readGlobal(true);

    var cats = $('db-cats');
    if(cats){
      var all = merged('mat').concat(merged('work'));
      cats.innerHTML = Array.from(new Set(all.map(function(x){ return x.c || 'Разное'; })))
        .sort(function(a,b){return a.localeCompare(b,'ru');})
        .map(function(c){ return '<option value="'+esc(c)+'">'; }).join('');
    }

    if(em) em.innerHTML = deleteToolbar('mat') + renderItems(merged('mat'), 'mat', 'ultimate_editor_mat', 'editor');
    if(ew) ew.innerHTML = deleteToolbar('work') + renderItems(merged('work'), 'work', 'ultimate_editor_work', 'editor');
  };

  window.epUltimateSelectDelete = function(type,flag){
    document.querySelectorAll('.ep-db-delete-check[data-type="'+type+'"]').forEach(function(ch){ ch.checked = !!flag; });
  };

  window.epUltimateDeleteOne = async function(type, encoded){
    var it = decodeItem(encoded);
    if(!it) return;
    var del = delSet(type);
    del.add(idkey(it));
    del.add(sig(type,it));
    if(it.originGlobalId) del.add('id:' + String(it.originGlobalId));
    saveDel(type,del);

    var local = localDb(type).filter(function(x){
      return sig(type,x) !== sig(type,it)
        && idkey(x) !== idkey(it)
        && (!it.originGlobalId || String(x.originGlobalId || '') !== String(it.originGlobalId));
    });
    setLocalDb(type, local);
    await saveMyDb();
    if(typeof renderDbEditors === 'function') renderDbEditors();
    toast('✅ Удалено только у мастера');
  };

  window.epUltimateDeleteSelected = async function(type){
    var checks = Array.from(document.querySelectorAll('.ep-db-delete-check[data-type="'+type+'"]:checked'));
    if(!checks.length) return toast('Выберите позиции галочками');
    var del = delSet(type);
    var removeSig = new Set();
    var removeId = new Set();

    checks.forEach(function(ch){
      var it = decodeItem(ch.dataset.item);
      if(!it) return;
      del.add(idkey(it));
      del.add(sig(type,it));
      if(it.originGlobalId) del.add('id:' + String(it.originGlobalId));
      removeSig.add(sig(type,it));
      removeId.add(idkey(it));
      if(it.originGlobalId) removeId.add('id:' + String(it.originGlobalId));
    });

    saveDel(type,del);
    var local = localDb(type).filter(function(x){
      return !removeSig.has(sig(type,x))
        && !removeId.has(idkey(x))
        && !removeId.has('id:' + String(x.originGlobalId || ''));
    });
    setLocalDb(type, local);
    await saveMyDb();
    if(typeof renderDbEditors === 'function') renderDbEditors();
    toast('✅ Удалено у мастера: ' + checks.length);
  };

  window.epUltimateEditPrice = async function(type, encoded, price){
    var it = decodeItem(encoded);
    if(!it) return;
    it.p = Number(price) || 0;
    unhide(type,it);
    upsertLocal(type,it);
    await saveMyDb();
    toast('✅ Цена изменена только у мастера');
  };

  var oldPrompt = window.promptAdd;
  window.promptAdd = function(value,type){
    var it = decodeItem(value);
    if(!it || !it.n) {
      var arr = merged(type);
      it = arr.find(function(x){ return sig(type,x) === value || idkey(x) === value || String(x.id||'') === String(value); });
    }
    if(!it && typeof oldPrompt === 'function') return oldPrompt(value,type);
    if(!it) return toast('Позиция не найдена');

    pendingAdd = { item: stripRuntime(it), type:type };
    var name = $('qty-prompt-name'), qty = $('qty-input');
    if(name) name.innerText = it.n || 'Позиция';
    if(qty) qty.value = 1;
    if(typeof openModal === 'function') openModal('qtyPromptModal');
  };

  var oldApplyImport = window.epApplyReviewedDbItems;
  window.epApplyReviewedDbItems = async function(mode){
    if(typeof oldApplyImport === 'function') {
      await oldApplyImport(mode);
    }

    var type = (window.EP_DB_REVIEW && window.EP_DB_REVIEW.type) || 'mat';
    try{
      var items = typeof epGetReviewedSelected === 'function' ? epGetReviewedSelected() : [];
      if(Array.isArray(items) && items.length){
        items.forEach(function(it){ upsertLocal(type,it); });
        await saveMyDb();
      }
    }catch(e){ console.warn('ultimate import save', e); }

    await readGlobal(true);
    if(typeof renderDbEditors === 'function') renderDbEditors();
    var matList = $('mat-cat-list'), workList = $('work-cat-list');
    if(matList) matList.innerHTML = renderItems(merged('mat'), 'mat', 'ultimate_mat_after_import', 'catalog');
    if(workList) workList.innerHTML = renderItems(merged('work'), 'work', 'ultimate_work_after_import', 'catalog');
  };

  function classify(it){
    var meta = (it && it.dbMeta) || {};
    var n = clean([it && it.n, it && it.c, groupOf(it), meta.kind, meta.category, meta.subcategory].filter(Boolean).join(' '));
    var raw = String((it && it.n) || '');
    if(meta.kind) {
      var k = String(meta.kind).toLowerCase();
      if(k.indexOf('dif') >= 0) return 'dif';
      if(k.indexOf('uzo') >= 0) return 'uzo';
      if(k.indexOf('automatic') >= 0 || k.indexOf('breaker') >= 0) return 'auto';
      if(k.indexOf('voltage') >= 0) return 'voltage';
      if(k.indexOf('contactor') >= 0) return 'contactor';
    }
    if(/диф/i.test(raw) || n.indexOf('диф') >= 0) return 'dif';
    if(/узо/i.test(raw) || n.indexOf('узо') >= 0) return 'uzo';
    if(/уздп|дугов/i.test(raw) || n.indexOf('уздп') >= 0) return 'uzdp';
    if(/узм|реле напряж/i.test(raw) || n.indexOf('реле напряж') >= 0) return 'voltage';
    if(/реле времени/i.test(raw) || n.indexOf('реле времени') >= 0) return 'time';
    if(/контактор/i.test(raw) || n.indexOf('контактор') >= 0) return 'contactor';
    if(/автомат|(^|\s)[abcdсавд]\s?\d{1,3}(\s|$)/i.test(raw) || /\bc\s?\d{1,3}\b/.test(n)) return 'auto';
    if(/кабель|ввг|провод|utp|ftp|нг/i.test(raw) || n.indexOf('кабель') >= 0 || n.indexOf('ввг') >= 0) return 'cable';
    if(/щит|корпус|бокс/i.test(raw)) return 'shield';
    if(/греб/i.test(raw)) return 'comb';
    if(/ншви|наконеч/i.test(raw)) return 'lug';
    if(/шин|клемм/i.test(raw)) return 'bus';
    if(/din|дин|рейк|огранич/i.test(raw)) return 'din';
    if(/маркир|бирк/i.test(raw)) return 'marking';
    if((it && it.type) === 'work') return 'work:' + clean([(it.c||''), groupOf(it)].join('|'));
    return 'other:' + clean([(it && it.c) || '', groupOf(it)].join('|'));
  }

  function sameClass(a,b){
    var ca = classify(a), cb = classify(b);
    if(ca === cb) return true;
    if(['cable','auto','dif','uzo','uzdp','voltage','time','contactor'].indexOf(ca) >= 0) return ca === cb;
    if(ca.indexOf('work:') === 0 && cb.indexOf('work:') === 0) return ca === cb || ca.split('|')[0] === cb.split('|')[0];
    return false;
  }

  window.EP_ULTIMATE_SWAP = [];
  window.openSwapModal = async function(idx){
    swapTargetIdx = idx;
    var current = currentEstimate[idx];
    if(!current) return;
    var type = current.type === 'work' ? 'work' : 'mat';
    var sel = $('swap-select');
    if(sel) sel.innerHTML = '<option>Загрузка...</option>';
    if(typeof openModal === 'function') openModal('swapModal');

    await readGlobal(true);
    var candidates = merged(type).filter(function(x){ return sameClass(current,x); });
    window.EP_ULTIMATE_SWAP = candidates;

    if(!sel) return;
    if(!candidates.length) {
      sel.innerHTML = '<option value="">Нет подходящих вариантов</option>';
      return;
    }
    sel.innerHTML = candidates.map(function(x,i){
      var src = x.__src === 'global' ? '🌍' : '👤';
      return '<option value="'+i+'">'+src+' '+esc(x.n || 'Позиция')+' ('+(Number(x.p)||0)+' ₽)</option>';
    }).join('');
  };

  window.applySwap = function(){
    if(swapTargetIdx < 0) return;
    var sel = $('swap-select');
    if(!sel || sel.value === '') return toast('Нет выбранной позиции');
    var it = window.EP_ULTIMATE_SWAP[Number(sel.value)];
    if(!it) return toast('Позиция не найдена');

    currentEstimate[swapTargetIdx].n = it.n;
    currentEstimate[swapTargetIdx].p = Number(it.p) || 0;
    currentEstimate[swapTargetIdx].u = it.u || currentEstimate[swapTargetIdx].u || 'шт';
    currentEstimate[swapTargetIdx].sourceId = it.id || null;

    if(typeof renderMainTable === 'function') renderMainTable();
    if(typeof closeModal === 'function') closeModal('swapModal');
    toast('✅ Заменено');
  };

  document.addEventListener('DOMContentLoaded', function(){
    setTimeout(function(){
      readGlobal(true).then(function(){
        if(typeof renderDbEditors === 'function') renderDbEditors();
      });
    }, 800);
  });
})();


/* =========================================================
 * SOURCE: block-11.js
 * AUTO TARGET: 04-database.js
 * SCORE: 350
 * HITS: db, base, matDB, workDB, материал, работ, global_db, user_db, import, export, category, subcategory, renderDbEditors, epSetDbScope
 * ========================================================= */

/*
 * Extracted from public/index.html
 * Original script block: 11
 * Original HTML lines: 6221-6912
 */

/* === EP DB SAFE SPLIT + FACTORY RESET V3 2026-05-13: SERVER/MY, ZERO RESET, NO MIX === */
(function(){
  var TOP_MAT_DB = [{"id":"m1","c":"Кабель","n":"Кабель ВВГнг-LS 3х1.5 (Конкорд) круглый","p":57,"u":"м.п."},{"id":"m2","c":"Кабель","n":"Кабель ВВГнг-LS 3х2.5 (Конкорд) круглый","p":87,"u":"м.п."},{"id":"m3","c":"Кабель","n":"Кабель ВВГнг(п)-LS 3х1.5 (Конкорд) плоский","p":62,"u":"м.п."},{"id":"m4","c":"Кабель","n":"Кабель ВВГнг(п)-LS 3х2.5 (Конкорд) плоский","p":95,"u":"м.п."},{"id":"m5","c":"Кабель","n":"Кабель ВВГ-Пнг(А)-LS 3x4 (Лептон)","p":146,"u":"м.п."},{"id":"m6","c":"Кабель","n":"Кабель ВВГ-Пнг(А)-LS 3х6 (Лептон)","p":217,"u":"м.п."},{"id":"m7","c":"Кабель","n":"Провод ПуГВ (ПВ-3) 1х6 синий (ЦВЕТЛИТ)","p":85,"u":"м.п."},{"id":"m8","c":"Кабель","n":"Провод ПуГВ (ПВ-3) 1х6 белый (ЦВЕТЛИТ)","p":85,"u":"м.п."},{"id":"m9","c":"Слаботочка","n":"Кабель TV SAT-703 (Cavel)","p":75,"u":"м.п."},{"id":"m10","c":"Слаботочка","n":"Витая пара комп. экран. FTP4 CAT5E 24AWG Cu","p":32,"u":"м.п."},{"id":"m11","c":"Трубы","n":"Труба гофрированная ПВХ 20мм серая","p":8,"u":"м.п."},{"id":"m12","c":"Трубы","n":"Труба гофрированная ПНД 20мм черная","p":10,"u":"м.п."},{"id":"m13","c":"Трубы","n":"Гофра ПВХ/ПНД с протяжкой","p":25,"u":"м.п."},{"id":"m14","c":"Расходники","n":"Подрозетник глубокий для бетона 68х64","p":12,"u":"шт"},{"id":"m15","c":"Расходники","n":"Подрозетник стандарт (ГКЛ)","p":20,"u":"шт"},{"id":"m16","c":"Расходники","n":"Подрозетник глубокий (ГКЛ)","p":35,"u":"шт"},{"id":"m17","c":"Расходники","n":"Коробка распределительная 100х100х40","p":120,"u":"шт"},{"id":"m18","c":"Расходники","n":"Площадка под стяжку для прямого монтажа","p":5,"u":"шт"},{"id":"m19","c":"Расходники","n":"Стяжки нейлоновые КСС 3*100 (100шт)","p":40,"u":"упак."},{"id":"m20","c":"Расходники","n":"Стяжки нейлоновые КСС 5*400 (100шт)","p":410,"u":"упак."},{"id":"m21","c":"Расходники","n":"Газовый баллон 80 мл 165 мм","p":550,"u":"шт"},{"id":"m22","c":"Расходники","n":"Гвозди для прямого монтажа 3х19 мм (1000 шт)","p":1905,"u":"упак."},{"id":"m23","c":"Расходники","n":"Лента монтажная (перфолента)","p":580,"u":"шт"},{"id":"m24","c":"Расходники","n":"Лента монтажная текстильная 20 мм (50м)","p":880,"u":"упак."},{"id":"m25","c":"Щитовое","n":"Наконечник НШВИ 6.0-12 (упак)","p":225,"u":"упак."},{"id":"m26","c":"Щитовое","n":"Наконечник НШВИ(2) 6.0-14 (упак)","p":365,"u":"упак."},{"id":"m27","c":"Расходники","n":"Гильза ГМЛ 4","p":12,"u":"шт"},{"id":"m28","c":"Расходники","n":"Гильза ГМЛ 6","p":18,"u":"шт"},{"id":"m29","c":"Расходники","n":"Термоусадка (м)","p":80,"u":"м"},{"id":"m30","c":"Автоматика","n":"Автомат 1P 10A (ABB SH201)","p":265,"u":"шт"},{"id":"m31","c":"Автоматика","n":"Автомат 1P 16A (ABB SH201)","p":265,"u":"шт"},{"id":"m32","c":"Автоматика","n":"Автомат 1P 40A (ABB SH201)","p":410,"u":"шт"},{"id":"m33","c":"Автоматика","n":"ДИФ Автомат DSH201 C32 AC30 (ABB)","p":3100,"u":"шт"},{"id":"m34","c":"Щитовое","n":"Клеммник винтовой N 5x16 (ABB)","p":345,"u":"шт"},{"id":"m35","c":"Щитовое","n":"Клеммник винтовой PE 11x16 (ABB)","p":770,"u":"шт"},{"id":"m36","c":"Щитовое","n":"Шкаф внутрь. на 36М UK636E3 (ABB)","p":6510,"u":"шт"},{"id":"m37","c":"Щитовое","n":"Шкаф мультимедийный UK620MV (ABB)","p":11025,"u":"шт"},{"id":"m38","c":"Автоматика","n":"Автомат 1P 10A (ИЭК ВА47-29)","p":172,"u":"шт"},{"id":"m39","c":"Автоматика","n":"Автомат 1P 16A (ИЭК ВА47-29)","p":150,"u":"шт"},{"id":"m40","c":"Автоматика","n":"Автомат 2P 40A (ИЭК ВА47-29)","p":380,"u":"шт"},{"id":"m41","c":"Автоматика","n":"УЗО 2P 40A 30мА (ИЭК ВД1-63)","p":1195,"u":"шт"},{"id":"m42","c":"Щитовое","n":"Шина N ноль на DIN-изол (ИЭК)","p":285,"u":"шт"},{"id":"m43","c":"Щитовое","n":"Корпус пластиковый ЩРВ-П-24 (TEKFOR)","p":2660,"u":"шт"},{"id":"m44","c":"Автоматика","n":"Реле напряжения УЗМ-50Ц","p":4500,"u":"шт"}];
  var TOP_WORK_DB = [{"id":"w44","c":"Алмазная резка","g":"Штроба 25х30","n":"Бетон","p":550,"u":"м.п."},{"id":"w45","c":"Алмазная резка","g":"Штроба 25х30","n":"Кирпич","p":400,"u":"м.п."},{"id":"w46","c":"Алмазная резка","g":"Штроба 25х30","n":"Панелька","p":700,"u":"м.п."},{"id":"w47","c":"Алмазная резка","g":"Штроба 25х30","n":"Мягкий мат.","p":400,"u":"м.п."},{"id":"w48","c":"Алмазная резка","g":"Штроба 50х50","n":"Бетон","p":1500,"u":"м.п."},{"id":"w49","c":"Алмазная резка","g":"Штроба 50х50","n":"Кирпич","p":1300,"u":"м.п."},{"id":"w50","c":"Алмазная резка","g":"Штроба 50х50","n":"Панелька","p":1900,"u":"м.п."},{"id":"w51","c":"Алмазная резка","g":"Штроба 50х50","n":"Мягкий мат.","p":900,"u":"м.п."},{"id":"w52","c":"Алмазная резка","g":"Штроба 100х50 ВВОДНАЯ","n":"Бетон","p":2200,"u":"м.п."},{"id":"w53","c":"Алмазная резка","g":"Штроба 100х50 ВВОДНАЯ","n":"Кирпич","p":1550,"u":"м.п."},{"id":"w54","c":"Алмазная резка","g":"Штроба 100х50 ВВОДНАЯ","n":"Панелька","p":2500,"u":"м.п."},{"id":"w55","c":"Алмазная резка","g":"Штроба 100х50 ВВОДНАЯ","n":"Мягкий мат.","p":1400,"u":"м.п."},{"id":"w56","c":"Алмазная резка","g":"Высверливание подр. стандарт","n":"Бетон","p":600,"u":"шт"},{"id":"w57","c":"Алмазная резка","g":"Высверливание подр. стандарт","n":"Кирпич","p":500,"u":"шт"},{"id":"w58","c":"Алмазная резка","g":"Высверливание подр. стандарт","n":"Панелька","p":650,"u":"шт"},{"id":"w59","c":"Алмазная резка","g":"Высверливание подр. стандарт","n":"Мягкий мат.","p":400,"u":"шт"},{"id":"w60","c":"Черновая электрика","g":"Вклейка подрозетников","n":"Все типы","p":100,"u":"шт"},{"id":"w61","c":"Алмазная резка","g":"Вырубка ниши щита","n":"Бетон","p":400,"u":"мод."},{"id":"w62","c":"Алмазная резка","g":"Вырубка ниши щита","n":"Кирпич","p":300,"u":"мод."},{"id":"w63","c":"Алмазная резка","g":"Вырубка ниши щита","n":"Панелька","p":500,"u":"мод."},{"id":"w64","c":"Алмазная резка","g":"Вырубка ниши щита","n":"Мягкий мат.","p":250,"u":"мод."},{"id":"w65","c":"Монтаж","g":"Прокладка кабеля","n":"Без гофры (Потолок)","p":120,"u":"м.п."},{"id":"w66","c":"Монтаж","g":"Прокладка кабеля","n":"В гофре (Пол)","p":150,"u":"м.п."},{"id":"w67","c":"Монтаж","g":"Распаячная коробка","n":"Сборка распред. коробки / коммутация","p":800,"u":"шт"},{"id":"w68","c":"Чистовая установка","g":"Механизмы","n":"Установка розетки 220В","p":500,"u":"шт"},{"id":"w69","c":"Чистовая установка","g":"Механизмы","n":"Установка выключателя","p":550,"u":"шт"},{"id":"w70","c":"Чистовая установка","g":"Механизмы","n":"Установка терморегулятора","p":900,"u":"шт"},{"id":"w71","c":"Алмазная резка","g":"Высверливание подрозетников глубокий","n":"Бетон","p":650,"u":"шт"},{"id":"w72","c":"Алмазная резка","g":"Высверливание подрозетников глубокий","n":"Кирпич","p":550,"u":"шт"},{"id":"w73","c":"Алмазная резка","g":"Высверливание подрозетников глубокий","n":"Панелька","p":750,"u":"шт"},{"id":"w74","c":"Алмазная резка","g":"Высверливание подрозетников глубокий","n":"Мягкий мат.","p":450,"u":"шт"},{"id":"w75","c":"Алмазная резка","g":"Высверливание подрозетников копос 74х75","n":"Бетон","p":800,"u":"шт"},{"id":"w76","c":"Алмазная резка","g":"Высверливание подрозетников копос 74х75","n":"Кирпич","p":700,"u":"шт"},{"id":"w77","c":"Алмазная резка","g":"Высверливание подрозетников копос 74х75","n":"Панелька","p":850,"u":"шт"},{"id":"w78","c":"Алмазная резка","g":"Высверливание подрозетников копос 74х75","n":"Мягкий мат.","p":500,"u":"шт"},{"id":"w79","c":"Алмазная резка","g":"Отверстие 132 ММ L= до 450","n":"Бетон","p":6000,"u":"шт"},{"id":"w80","c":"Алмазная резка","g":"Отверстие 132 ММ L= до 450","n":"Кирпич","p":4500,"u":"шт"},{"id":"w81","c":"Алмазная резка","g":"Отверстие 132 ММ L= до 450","n":"Панелька","p":7000,"u":"шт"},{"id":"w82","c":"Алмазная резка","g":"Отверстие 132 ММ L= до 450","n":"Мягкий мат.","p":4000,"u":"шт"},{"id":"w83","c":"Алмазная резка","g":"Отверстие 52мм L=до 450мм","n":"Бетон","p":2500,"u":"шт"},{"id":"w84","c":"Алмазная резка","g":"Отверстие 52мм L=до 450мм","n":"Кирпич","p":2000,"u":"шт"},{"id":"w85","c":"Алмазная резка","g":"Отверстие 52мм L=до 450мм","n":"Панелька","p":3000,"u":"шт"},{"id":"w86","c":"Алмазная резка","g":"Отверстие 52мм L=до 450мм","n":"Мягкий мат.","p":1900,"u":"шт"},{"id":"w87","c":"Щитовое","g":"Монтаж","n":"Сборка щита","p":500,"u":"мод."},{"id":"w89","c":"Щитовое","g":"Монтаж","n":"Установка БП в щит","p":900,"u":"ед"},{"id":"w91","c":"Монтаж","g":"Спецоборудование","n":"Подключение нагревателя","p":4000,"u":"ед"},{"id":"w92","c":"Монтаж","g":"Спецоборудование","n":"Система КУП","p":5000,"u":"ед"},{"id":"s_r1","c":"Щитовое","g":"Автоматика и Реле","n":"Установка реле времени","p":1250,"u":"шт"},{"id":"s_r2","c":"Щитовое","g":"Автоматика и Реле","n":"Установка реле освещения (в щите)","p":1250,"u":"шт"},{"id":"s_r3","c":"Щитовое","g":"Автоматика и Реле","n":"Установка реле температуры/жидкости","p":1700,"u":"шт"},{"id":"s_r4","c":"Щитовое","g":"Автоматика и Реле","n":"Установка реле контроля фаз","p":1450,"u":"шт"},{"id":"s_r5","c":"Щитовое","g":"Автоматика и Реле","n":"Установка реле напряжения","p":1150,"u":"шт"},{"id":"s_r6","c":"Щитовое","g":"Автоматика и Реле","n":"Установка реле управления нагрузкой","p":2050,"u":"шт"},{"id":"s_m1","c":"Щитовое","g":"Счетчики","n":"Установка электросчетчика 220-240В на DIN","p":1000,"u":"шт"},{"id":"s_m2","c":"Щитовое","g":"Счетчики","n":"Установка электросчетчика 220-240В на монтажную панель","p":1250,"u":"шт"},{"id":"s_m3","c":"Щитовое","g":"Счетчики","n":"Установка электросчетчика 380-400В на DIN","p":1700,"u":"шт"},{"id":"s_m4","c":"Щитовое","g":"Счетчики","n":"Установка электросчетчика 380-400В на монтажную панель","p":2200,"u":"шт"},{"id":"s_m5","c":"Щитовое","g":"Счетчики","n":"Установка электросчетчика под трансформаторы тока","p":2400,"u":"шт"},{"id":"s_m6","c":"Щитовое","g":"Счетчики","n":"Установка трансформатора тока (без подкл)","p":720,"u":"шт"},{"id":"s_p1","c":"Чистовая установка","g":"Розетки накладные","n":"Установка накладной розетки/выкл на бетон","p":680,"u":"шт"},{"id":"s_p2","c":"Чистовая установка","g":"Розетки накладные","n":"Установка накладной розетки/выкл на кирпич","p":600,"u":"шт"},{"id":"s_p3","c":"Чистовая установка","g":"Розетки накладные","n":"Установка накладной розетки/выкл на ГКЛ","p":530,"u":"шт"},{"id":"s_p4","c":"Чистовая установка","g":"Розетки накладные","n":"Установка накладной розетки/выкл на дерево","p":450,"u":"шт"},{"id":"s_p5","c":"Чистовая установка","g":"Механизмы (Спец)","n":"Установка накладной силовой розетки 380В","p":1000,"u":"шт"},{"id":"s_p6","c":"Чистовая установка","g":"Механизмы (Спец)","n":"Установка встраиваемой силовой розетки 380В","p":530,"u":"шт"},{"id":"s_p7","c":"Чистовая установка","g":"Механизмы","n":"Установка встраиваемой розетки/выкл в подрозетник","p":300,"u":"шт"},{"id":"s_p8","c":"Чистовая установка","g":"Механизмы","n":"Установка блока розеток/выкл","p":1200,"u":"шт"},{"id":"s_d1","c":"Черновая электрика","g":"Электроточки","n":"Установка накладного подрозетника","p":300,"u":"шт"},{"id":"s_d2","c":"Черновая электрика","g":"Электроточки","n":"Установка подрозетника","p":180,"u":"шт"},{"id":"s_d3","c":"Черновая электрика","g":"Электроточки","n":"Установка накладной распаечной коробки","p":450,"u":"шт"},{"id":"s_d4","c":"Черновая электрика","g":"Электроточки","n":"Установка встраиваемой распаечной коробки","p":300,"u":"шт"},{"id":"s_d5","c":"Чистовая установка","g":"Механизмы (Спец)","n":"Установка термостата","p":380,"u":"шт"},{"id":"s_d6","c":"Чистовая установка","g":"Механизмы (Спец)","n":"Установка встраиваемого датчика движения","p":330,"u":"шт"},{"id":"s_d7","c":"Чистовая установка","g":"Механизмы (Спец)","n":"Установка звонка","p":680,"u":"шт"},{"id":"s_d8","c":"Чистовая установка","g":"Механизмы (Спец)","n":"Установка кнопки звонка","p":450,"u":"шт"},{"id":"s_d9","c":"Чистовая установка","g":"Механизмы (Спец)","n":"Установка ТВ краба","p":480,"u":"шт"},{"id":"s_sh1","c":"Щитовое","g":"Монтаж накладных","n":"Монтаж электрощитка накладного 2 модуля","p":180,"u":"шт"},{"id":"s_sh2","c":"Щитовое","g":"Монтаж накладных","n":"Монтаж электрощитка накладного 4-8 модулей","p":290,"u":"шт"},{"id":"s_sh3","c":"Щитовое","g":"Монтаж накладных","n":"Монтаж электрощитка накладного 12-24 модуля","p":330,"u":"шт"},{"id":"s_sh4","c":"Щитовое","g":"Монтаж накладных","n":"Монтаж электрощитка накладного 36-60 модулей","p":560,"u":"шт"},{"id":"s_sh5","c":"Щитовое","g":"Монтаж накладных","n":"Монтаж электрощитка накладного 72-96 модулей","p":780,"u":"шт"},{"id":"s_l1","c":"Освещение","g":"LED Лента","n":"Монтаж светодиодной ленты на кухне под шкафами","p":270,"u":"м.п."},{"id":"s_l2","c":"Освещение","g":"LED Лента","n":"Монтаж светодиодной ленты в натяжной потолок","p":390,"u":"м.п."},{"id":"s_l3","c":"Освещение","g":"LED Лента","n":"Монтаж светодиодной ленты на гипсокартон","p":300,"u":"м.п."},{"id":"s_l4","c":"Освещение","g":"LED Лента","n":"Монтаж светодиодной ленты в потолочный плинтус","p":350,"u":"м.п."},{"id":"s_l5","c":"Освещение","g":"LED Лента","n":"Монтаж светодиодной ленты в алюминиевый профиль","p":230,"u":"м.п."},{"id":"s_l6","c":"Освещение","g":"LED Лента","n":"Монтаж светодиодной ленты на карниз","p":350,"u":"м.п."},{"id":"s_l7","c":"Освещение","g":"LED Лента","n":"Установка светодиодной ленты в светильник","p":180,"u":"м.п."},{"id":"s_l8","c":"Освещение","g":"LED Лента","n":"Монтаж светодиодной ленты на улице","p":380,"u":"м.п."},{"id":"s_l9","c":"Освещение","g":"Алюм. профиль","n":"Установка накладного алюм. профиля на скотч","p":110,"u":"м.п."},{"id":"s_l10","c":"Освещение","g":"Алюм. профиль","n":"Установка накладного алюм. профиля со сверлением","p":290,"u":"м.п."},{"id":"s_l11","c":"Освещение","g":"Алюм. профиль","n":"Установка врезного алюм. профиля в готовый паз","p":120,"u":"м.п."},{"id":"s_l12","c":"Освещение","g":"Алюм. профиль","n":"Установка врезного алюм. профиля с подготовкой паза","p":390,"u":"м.п."},{"id":"s_c1","c":"Освещение","g":"Люстры и Светильники","n":"Сборка простой люстры","p":630,"u":"шт"},{"id":"s_c2","c":"Освещение","g":"Люстры и Светильники","n":"Сборка сложной люстры","p":870,"u":"шт"},{"id":"s_c3","c":"Освещение","g":"Люстры и Светильники","n":"Установка крюка под люстру","p":230,"u":"шт"},{"id":"s_c4","c":"Освещение","g":"Люстры и Светильники","n":"Установка люстры на готовый крюк","p":740,"u":"шт"},{"id":"s_c5","c":"Освещение","g":"Люстры и Светильники","n":"Установка люстры с креплением к потолку (простая)","p":1200,"u":"шт"},{"id":"s_c6","c":"Освещение","g":"Люстры и Светильники","n":"Установка люстры с креплением к потолку (сложная/ДУ)","p":2250,"u":"шт"},{"id":"s_c7","c":"Освещение","g":"Люстры и Светильники","n":"Установка тяжелой люстры с креплением на крюк","p":1950,"u":"шт"},{"id":"s_c8","c":"Освещение","g":"Люстры и Светильники","n":"Установка тяжелой люстры с креплением к потолку","p":3600,"u":"шт"},{"id":"s_c9","c":"Освещение","g":"Люстры и Светильники","n":"Установка настенного светильника, бра","p":450,"u":"шт"},{"id":"s_c10","c":"Освещение","g":"Люстры и Светильники","n":"Установка точечного светильника","p":750,"u":"шт"},{"id":"s_c11","c":"Освещение","g":"Люстры и Светильники","n":"Установка светодиодного светильника","p":680,"u":"шт"},{"id":"s_c12","c":"Освещение","g":"Люстры и Светильники","n":"Установка светильника Армстронг","p":380,"u":"шт"},{"id":"s_c13","c":"Освещение","g":"Люстры и Светильники","n":"Установка люминесцентного светильника","p":410,"u":"шт"},{"id":"s_c14","c":"Освещение","g":"Люстры и Светильники","n":"Установка трекового светильника","p":140,"u":"шт"},{"id":"s_c15","c":"Освещение","g":"Люстры и Светильники","n":"Монтаж шинопровода","p":450,"u":"м.п."},{"id":"s_c16","c":"Освещение","g":"Уличное освещение","n":"Установка уличного светильника на фасаде","p":830,"u":"шт"},{"id":"s_c17","c":"Освещение","g":"Уличное освещение","n":"Установка садово-паркового светильника","p":1350,"u":"шт"},{"id":"s_c18","c":"Освещение","g":"Люстры и Светильники","n":"Установка светильника Выход","p":480,"u":"шт"},{"id":"s_c19","c":"Освещение","g":"Уличное освещение","n":"Установка антивандального светильника","p":660,"u":"шт"},{"id":"s_dem1","c":"Демонтаж","g":"Освещение","n":"Демонтаж люстры","p":240,"u":"шт"},{"id":"s_dem2","c":"Демонтаж","g":"Освещение","n":"Демонтаж светильника","p":210,"u":"шт"},{"id":"s_dem3","c":"Демонтаж","g":"Электроточки","n":"Демонтаж розетки","p":200,"u":"шт"},{"id":"s_dem4","c":"Демонтаж","g":"Электроточки","n":"Демонтаж выключателя","p":200,"u":"шт"},{"id":"s_dem5","c":"Демонтаж","g":"Электроточки","n":"Демонтаж распаечной коробки","p":200,"u":"шт"},{"id":"s_dem6","c":"Демонтаж","g":"Электроточки","n":"Демонтаж дверного звонка","p":200,"u":"шт"},{"id":"s_dem7","c":"Демонтаж","g":"Щитовое","n":"Демонтаж реле времени","p":230,"u":"шт"},{"id":"s_dem8","c":"Демонтаж","g":"Щитовое","n":"Демонтаж электрощитка до 8 модулей","p":110,"u":"шт"},{"id":"s_dem9","c":"Демонтаж","g":"Щитовое","n":"Демонтаж электрощитка 12-36 модулей","p":260,"u":"шт"},{"id":"s_dem10","c":"Демонтаж","g":"Щитовое","n":"Демонтаж электрощитка 48-96 модулей","p":470,"u":"шт"},{"id":"s_dem11","c":"Демонтаж","g":"Щитовое","n":"Демонтаж автомата","p":150,"u":"шт"},{"id":"s_dem12","c":"Демонтаж","g":"Щитовое","n":"Демонтаж УЗО","p":150,"u":"шт"},{"id":"s_dem13","c":"Демонтаж","g":"Щитовое","n":"Демонтаж дифавтомата","p":150,"u":"шт"},{"id":"s_dem14","c":"Демонтаж","g":"Щитовое","n":"Демонтаж рубильника","p":150,"u":"шт"},{"id":"s_dem15","c":"Демонтаж","g":"Щитовое","n":"Демонтаж магнитного пускателя","p":140,"u":"шт"}];

  var EP_GLOBAL_MAT = TOP_MAT_DB.slice();
  var EP_GLOBAL_WORK = TOP_WORK_DB.slice();
  var EP_MY_MAT = [];
  var EP_MY_WORK = [];

  var LS_MY_MAT = 'user_db_mat_v31';
  var LS_MY_WORK = 'user_db_work_v31';
  var LS_SERVER_CACHE = 'ep_global_cache_force_v1';
  var LS_OLD_SERVER_CACHE = 'ep_global_cache_ultimate_v1';
  var LS_SCOPE = 'ep_db_scope_v2';
  var LS_CLEAN = 'ep_db_clean_mode_v1';
  var LS_MASTER_CREATED = 'ep_master_db_created_v1';

  var EP_MY_MAT = [];
  var EP_MY_WORK = [];
  var EP_SERVER_MAT = [];
  var EP_SERVER_WORK = [];
  var EP_SERVER_DOC_SEEN = false;

  function $(id){ return document.getElementById(id); }
  function toast(t){ if(typeof showToast === 'function') showToast(t); else alert(t); }
  function esc(s){ return String(s == null ? '' : s).replace(/[&<>"']/g,function(m){ return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]; }); }
  function cleanText(s){ return String(s || '').toLowerCase().replace(/ё/g,'е').replace(/×/g,'x').replace(/х/g,'x').replace(/[^a-zа-я0-9]+/g,' ').trim(); }
  function clone(x){ var y=Object.assign({}, x || {}); delete y.__src; delete y.__encoded; return y; }
  function arrLS(k){ try{ var a=JSON.parse(localStorage.getItem(k)||'[]'); return Array.isArray(a)?a:[]; }catch(e){ return []; } }
  function objLS(k){ try{ var o=JSON.parse(localStorage.getItem(k)||'{}'); return o && typeof o === 'object' ? o : {}; }catch(e){ return {}; } }
  function setLS(k,a){ try{ if(typeof safeSet==='function') safeSet(k, JSON.stringify(a||[])); else localStorage.setItem(k, JSON.stringify(a||[])); }catch(e){} }
  function setObjLS(k,o){ try{ localStorage.setItem(k, JSON.stringify(o||{})); }catch(e){} }
  function cleanMode(){ return localStorage.getItem(LS_CLEAN) === '1'; }
  function scope(){ return localStorage.getItem(LS_SCOPE) === 'global' ? 'global' : 'my'; }
  function activeLabel(){ return scope()==='global' ? '🌍 База сервера' : '👤 Моя база'; }
  function uid(){ try{ return appUser && appUser.uid ? appUser.uid : ''; }catch(e){ return ''; } }
  function isAdmin(){ try{ return appUser && appUser.role === 'admin'; }catch(e){ return false; } }
  function groupOf(it){ return (it && (it.g || it.sc || it.subcategory || it.group)) || ''; }
  function sig(type,it){ return type + '|' + cleanText([it && it.c, groupOf(it), it && it.n, it && it.u].filter(Boolean).join('|')); }
  function enc(it){ try{ return encodeURIComponent(JSON.stringify(clone(it))); }catch(e){ return ''; } }
  function dec(v){ try{ return JSON.parse(decodeURIComponent(v || '{}')); }catch(e){ return null; } }

  function unique(arr,type){
    var seen={}, out=[];
    (arr||[]).forEach(function(raw){
      var it=clone(raw);
      if(!it.n) return;
      var k=sig(type,it);
      if(seen[k]) return;
      seen[k]=1;
      out.push(it);
    });
    return out;
  }

  function myArr(type){ return type==='work' ? EP_MY_WORK : EP_MY_MAT; }
  function serverArr(type){ return type==='work' ? EP_SERVER_WORK : EP_SERVER_MAT; }
  function activeArr(type){ return scope()==='global' ? serverArr(type) : myArr(type); }

  function syncWindowCaches(){
    try{
      window.EP_MY_MAT = EP_MY_MAT;
      window.EP_MY_WORK = EP_MY_WORK;
      window.EP_GLOBAL_MAT = EP_SERVER_MAT;
      window.EP_GLOBAL_WORK = EP_SERVER_WORK;
      window.EP_FORCE_GLOBAL = {matDB:EP_SERVER_MAT, workDB:EP_SERVER_WORK};
      window.EP_ULTIMATE_DB_CACHE = {matDB:EP_SERVER_MAT, workDB:EP_SERVER_WORK, ts:Date.now()};
      window.EP_GLOBAL_DB_VISIBLE_CACHE = {matDB:EP_SERVER_MAT, workDB:EP_SERVER_WORK, ts:Date.now()};
      window.userMatDB = EP_MY_MAT;
      window.userWorkDB = EP_MY_WORK;
      if(scope()==='global'){ matDB = EP_SERVER_MAT.slice(); workDB = EP_SERVER_WORK.slice(); }
      else { matDB = EP_MY_MAT.slice(); workDB = EP_MY_WORK.slice(); }
    }catch(e){}
  }

  function saveMyLocal(type, arr){
    arr = unique(arr||[], type);
    if(type==='work') EP_MY_WORK = arr; else EP_MY_MAT = arr;
    setLS(LS_MY_MAT, EP_MY_MAT);
    setLS(LS_MY_WORK, EP_MY_WORK);
    try{ localStorage.setItem(LS_MASTER_CREATED,'1'); }catch(e){}
    syncWindowCaches();
    epSaveMyDbToServer();
  }

  function saveServerLocal(type, arr, saveDirect){
    arr = unique(arr||[], type);
    if(type==='work') EP_SERVER_WORK = arr; else EP_SERVER_MAT = arr;
    setObjLS(LS_SERVER_CACHE, {matDB:EP_SERVER_MAT, workDB:EP_SERVER_WORK, cleanMode:cleanMode(), ts:Date.now()});
    syncWindowCaches();
    if(saveDirect) epSaveServerDbToServer();
  }

  function setActiveDb(type, arr){
    if(scope()==='global') saveServerLocal(type, arr, isAdmin());
    else saveMyLocal(type, arr);
  }

  function upsert(arr,type,it){
    it = clone(it);
    if(!it.id) it.id = (type==='work'?'w':'m') + '_local_' + Date.now() + '_' + Math.random().toString(36).slice(2,7);
    var k=sig(type,it);
    var idx=(arr||[]).findIndex(function(x){ return sig(type,x)===k || (it.id && String(x.id||'')===String(it.id)); });
    if(idx>=0) arr[idx]=Object.assign({}, arr[idx], it, {id:arr[idx].id || it.id});
    else arr.push(it);
    return arr;
  }

  async function epSaveMyDbToServer(){
    try{
      if(typeof db !== 'undefined' && db && uid()){
        await db.collection('user_db').doc(uid()).set({
          uid: uid(),
          masterName: (appUser && (appUser.name || appUser.email)) || '',
          matDB: EP_MY_MAT,
          workDB: EP_MY_WORK,
          created: true,
          updatedAt: new Date().toISOString()
        }, {merge:true});
      }
    }catch(e){ console.warn('save my db failed', e); }
  }

  async function epSaveServerDbToServer(){
    try{
      if(typeof db !== 'undefined' && db && isAdmin()){
        await db.collection('settings').doc('global_db').set({
          matDB: EP_SERVER_MAT,
          workDB: EP_SERVER_WORK,
          cleanMode: cleanMode(),
          updatedAt: new Date().toISOString()
        }, {merge:true});
      }
    }catch(e){ console.warn('save server db failed', e); }
  }

  async function epSendServerProposal(type,items,action){
    try{
      if(typeof db !== 'undefined' && db){
        await db.collection('db_proposals').add({
          uid: uid() || '',
          masterName: (appUser && (appUser.name || appUser.email)) || '',
          type: type,
          action: action,
          items: Array.isArray(items) ? items.map(clone) : items,
          target: 'server_db',
          status: 'pending',
          createdAt: new Date().toISOString()
        });
      }
    }catch(e){ console.warn('server proposal failed', e); }
  }

  async function epLoadDbFromServer(){
    EP_MY_MAT = arrLS(LS_MY_MAT);
    EP_MY_WORK = arrLS(LS_MY_WORK);
    var cache = objLS(LS_SERVER_CACHE);
    if(!Array.isArray(cache.matDB) && !Array.isArray(cache.workDB)) cache = objLS(LS_OLD_SERVER_CACHE);
    if(Array.isArray(cache.matDB)) EP_SERVER_MAT = cache.matDB;
    if(Array.isArray(cache.workDB)) EP_SERVER_WORK = cache.workDB;
    if(cache.cleanMode) try{ localStorage.setItem(LS_CLEAN,'1'); }catch(e){}

    try{
      if(typeof db !== 'undefined' && db){
        var gdoc = await db.collection('settings').doc('global_db').get();
        if(gdoc.exists){
          EP_SERVER_DOC_SEEN = true;
          var gd = gdoc.data() || {};
          EP_SERVER_MAT = Array.isArray(gd.matDB) ? gd.matDB : [];
          EP_SERVER_WORK = Array.isArray(gd.workDB) ? gd.workDB : [];
          if(gd.cleanMode || gd.resetAt) try{ localStorage.setItem(LS_CLEAN,'1'); }catch(e){}
          setObjLS(LS_SERVER_CACHE, {matDB:EP_SERVER_MAT, workDB:EP_SERVER_WORK, cleanMode:cleanMode(), ts:Date.now()});
        } else if(isAdmin() && !cleanMode()) {
          EP_SERVER_DOC_SEEN = false;
          await db.collection('settings').doc('global_db').set({matDB:EP_SERVER_MAT, workDB:EP_SERVER_WORK, createdAt:new Date().toISOString()}, {merge:true});
        }

        if(uid()){
          var udoc = await db.collection('user_db').doc(uid()).get();
          if(udoc.exists){
            var ud = udoc.data() || {};
            EP_MY_MAT = Array.isArray(ud.matDB) ? ud.matDB : EP_MY_MAT;
            EP_MY_WORK = Array.isArray(ud.workDB) ? ud.workDB : EP_MY_WORK;
            setLS(LS_MY_MAT, EP_MY_MAT);
            setLS(LS_MY_WORK, EP_MY_WORK);
            try{ localStorage.setItem(LS_MASTER_CREATED,'1'); }catch(e){}
          }
        }
      }
    }catch(e){ console.warn('load db failed', e); }

    var hasCache = Array.isArray(cache.matDB) || Array.isArray(cache.workDB);
    if(!cleanMode() && !EP_SERVER_DOC_SEEN && !hasCache){
      EP_SERVER_MAT = TOP_MAT_DB.slice();
      EP_SERVER_WORK = TOP_WORK_DB.slice();
    }

    EP_MY_MAT = unique(EP_MY_MAT, 'mat');
    EP_MY_WORK = unique(EP_MY_WORK, 'work');
    EP_SERVER_MAT = unique(EP_SERVER_MAT, 'mat');
    EP_SERVER_WORK = unique(EP_SERVER_WORK, 'work');
    syncWindowCaches();
    epRefreshDbScopeUi();
  }

  function sourceSwitcherHtml(type){
    return '<div style="border:1px solid var(--primary);border-radius:14px;padding:10px;margin:0 0 12px;background:rgba(79,70,229,.06);">'+
      '<div style="font-weight:900;color:var(--primary);margin-bottom:6px;">Источник: '+(type==='work'?'Работы':'Материалы')+'</div>'+
      '<div style="font-size:11px;color:var(--gray);margin-bottom:8px;">В смету и каталог попадает только выбранный источник. Вперемешку не считаем.</div>'+
      '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;">'+
        '<button class="'+(scope()==='my'?'btn-success':'btn-info')+'" style="margin:0;padding:10px;" onclick="epSetDbScope(&quot;my&quot;); '+(type==='work'?'openWorkCatalog()':'openMatCatalog()')+'">👤 Моя база</button>'+
        '<button class="'+(scope()==='global'?'btn-success':'btn-info')+'" style="margin:0;padding:10px;" onclick="epSetDbScope(&quot;global&quot;); '+(type==='work'?'openWorkCatalog()':'openMatCatalog()')+'">🌍 База сервера</button>'+
      '</div>'+
    '</div>';
  }

  window.epDbToggle = function(id,e){ if(e) e.stopPropagation(); var el=$(id); if(el) el.classList.toggle('active'); };

  function renderCatalog(type){
    var arr = activeArr(type);
    var html = sourceSwitcherHtml(type);
    if(!arr.length){
      return html + '<div style="padding:16px;border:1px dashed var(--border);border-radius:14px;text-align:center;color:var(--gray);font-weight:800;">'+activeLabel()+' пустая.<br><br>'+(scope()==='my'?'Можно добавить вручную, импортом или взять позицию из базы сервера.':'После полного сброса база сервера пустая. Админ может заполнить её вручную или импортом.')+'</div>';
    }
    var cats={}, i=0;
    arr.forEach(function(it){ var c=it.c||'Разное'; var g=groupOf(it)||'Без группы'; if(!cats[c]) cats[c]={}; if(!cats[c][g]) cats[c][g]=[]; cats[c][g].push(it); });
    Object.keys(cats).sort(function(a,b){return a.localeCompare(b,'ru');}).forEach(function(c){
      var cid='ep_cat_'+type+'_'+(i++);
      html += '<div class="cat-header" onclick="epDbToggle(&quot;'+cid+'&quot;, event)">'+esc(c)+'</div><div class="cat-body" id="'+cid+'">';
      Object.keys(cats[c]).sort(function(a,b){return a.localeCompare(b,'ru');}).forEach(function(g){
        var gid='ep_sub_'+type+'_'+(i++);
        html += '<div class="sub-cat-header" onclick="epDbToggle(&quot;'+gid+'&quot;, event)">'+esc(g)+' ▾</div><div class="sub-cat-body" id="'+gid+'">';
        cats[c][g].sort(function(a,b){return String(a.n||'').localeCompare(String(b.n||''),'ru');}).forEach(function(it){ html += catalogRow(type,it); });
        html += '</div>';
      });
      html += '</div>';
    });
    return html;
  }

  function catalogRow(type,it){
    var item=enc(it);
    var sub=(groupOf(it)?groupOf(it)+' • ':'')+(Number(it.p)||0)+' ₽ / '+(it.u||'шт');
    var copyBtn = scope()==='global' ? '<button class="btn-info" style="width:auto;margin:0 0 0 6px;padding:8px;" data-type="'+type+'" data-item="'+esc(item)+'" onclick="epCopyOneServerToMy(this.dataset.type,this.dataset.item)">В мою</button>' : '';
    return '<div class="mat-item"><div style="flex:1;font-size:12px;font-weight:600;"><b>'+esc(it.n||'Позиция')+'</b><br><span style="color:var(--gray);font-size:11px;font-weight:normal;">'+esc(sub)+'</span></div><button class="mat-add-btn" style="'+(type==='work'?'background:var(--orange);':'')+'" data-item="'+esc(item)+'" data-type="'+type+'" onclick="promptAdd(this.dataset.item,this.dataset.type)">+ Добавить</button>'+copyBtn+'</div>';
  }

  window.openMatCatalog = function(){ syncWindowCaches(); var x=$('mat-cat-list'); if(x) x.innerHTML=renderCatalog('mat'); if(typeof openModal==='function') openModal('matCatModal'); };
  window.openWorkCatalog = function(){ syncWindowCaches(); var x=$('work-cat-list'); if(x) x.innerHTML=renderCatalog('work'); if(typeof openModal==='function') openModal('workModal'); };

  window.promptAdd = function(v,type){
    var it=dec(v);
    if(!it || !it.n) it=activeArr(type).find(function(x){return String(x.id||'')===String(v);});
    if(!it) return toast('Позиция не найдена');
    pendingAdd={item:clone(it), type:type};
    var n=$('qty-prompt-name'), q=$('qty-input');
    if(n) n.innerText=it.n||'Позиция';
    if(q) q.value=1;
    if(typeof openModal==='function') openModal('qtyPromptModal');
  };

  function editorTop(type){
    var title=type==='work'?'работ':'материалов';
    var s=scope(), admin=isAdmin(), editable=canEditActive();
    var hint=s==='my'?'Редактируется личная база мастера.':(admin?'Редактируется база сервера.':'Сервер открыт только для просмотра и копирования в мою базу.');
    var html='<div style="border:1px solid var(--primary);border-radius:14px;padding:10px;margin:0 0 12px;background:rgba(79,70,229,.05);">'+
      '<div style="font-weight:900;color:var(--primary);">'+label()+' — '+title+'</div>'+
      '<div style="font-size:11px;color:var(--gray);font-weight:800;margin-top:4px;">'+hint+' Позиций: '+active(type).length+'.</div>'+
      '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:8px;">'+
      '<button class="'+(s==='my'?'btn-success':'btn-info')+'" style="margin:0;padding:10px;" onclick="epSetDbScope(\'my\')">👤 Моя база</button>'+
      '<button class="'+(s==='global'?'btn-success':'btn-info')+'" style="margin:0;padding:10px;" onclick="epSetDbScope(\'global\')">🌍 База сервера</button></div>';
    if(editable){
      html+='<div style="border:1px dashed var(--border);border-radius:12px;padding:8px;margin-top:8px;background:rgba(255,255,255,.35);">'+
        '<div style="font-weight:900;color:var(--primary);font-size:12px;margin-bottom:6px;">Массовые действия: выделить → перенести / удалить</div>'+
        '<input id="ep-v15-move-cat-'+type+'" placeholder="Категория, куда перенести" style="margin-bottom:6px;">'+
        '<input id="ep-v15-move-sub-'+type+'" placeholder="Группа / подкатегория" style="margin-bottom:8px;">'+
        '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;">'+
        '<button class="btn-info" style="margin:0;padding:9px;" onclick="epV15SelectVisible(\''+type+'\',true)">✅ Выделить</button>'+
        '<button class="btn-vendor" style="margin:0;padding:9px;" onclick="epV15SelectVisible(\''+type+'\',false)">⬜ Снять</button>'+
        '<button class="btn-success" style="margin:0;padding:9px;" onclick="epV15MoveSelectedActive(\''+type+'\')">📦 Перенести</button>'+
        '<button class="btn-danger" style="margin:0;padding:9px;" onclick="epDeleteSelectedActiveV7()">🗑 Удалить выбранные</button></div></div>'+
        '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:8px;"><button class="btn-success" style="margin:0;padding:9px;" onclick="epSaveActiveDbV7()">💾 Сохранить</button><button class="btn-info" style="margin:0;padding:9px;" onclick="epReloadActiveDbV7()">🔄 Обновить</button></div>';
    }
    if(s==='global'&&!admin){ html+='<div class="ep-v7-note">Серверные цены и позиции мастер не меняет. Для своей сметы нажми «В мою».</div>'; }
    return html+'</div>';
  }

  function renderDbRows(type){
    var arr=activeArr(type);
    var html=editorTop(type);
    if(!arr.length){
      html += '<div style="padding:15px;border:1px dashed var(--border);border-radius:12px;text-align:center;color:var(--gray);font-weight:800;">'+activeLabel()+' пустая.</div>';
      return html;
    }
    var cats={}, i=0;
    arr.forEach(function(it){ var c=it.c||'Разное'; var g=groupOf(it)||'Без группы'; if(!cats[c]) cats[c]={}; if(!cats[c][g]) cats[c][g]=[]; cats[c][g].push(it); });
    Object.keys(cats).sort(function(a,b){return a.localeCompare(b,'ru');}).forEach(function(c){
      var cid='db_cat_'+type+'_'+(i++);
      html += '<div class="cat-header" onclick="epDbToggle(&quot;'+cid+'&quot;, event)">'+esc(c)+'</div><div class="cat-body" id="'+cid+'">';
      Object.keys(cats[c]).sort(function(a,b){return a.localeCompare(b,'ru');}).forEach(function(g){
        var gid='db_sub_'+type+'_'+(i++);
        html += '<div class="sub-cat-header" onclick="epDbToggle(&quot;'+gid+'&quot;, event)">'+esc(g)+' ▾</div><div class="sub-cat-body" id="'+gid+'">';
        cats[c][g].sort(function(a,b){return String(a.n||'').localeCompare(String(b.n||''),'ru');}).forEach(function(it){ html += editorRow(type,it); });
        html += '</div>';
      });
      html += '</div>';
    });
    return html;
  }

  function editorRow(type,it){
    var item=enc(it);
    var sub=(groupOf(it)?groupOf(it)+' • ':'')+(Number(it.p)||0)+' ₽ / '+(it.u||'шт');
    var checked=scope()==='my' ? '<input type="checkbox" class="ep-my-del-check" data-type="'+type+'" data-item="'+esc(item)+'" style="width:20px;height:20px;accent-color:#EF4444;margin:4px 8px 0 0;">' : '';
    var copy=scope()==='global' ? '<button class="btn-info" style="width:auto;margin:0;padding:7px;" data-type="'+type+'" data-item="'+esc(item)+'" onclick="epCopyOneServerToMy(this.dataset.type,this.dataset.item)">В мою</button>' : '';
    return '<div class="emp-row" style="align-items:flex-start;">'+checked+'<div style="flex:1;"><b>'+esc(it.n||'Позиция')+'</b><br><span style="color:var(--gray);font-size:10px;">'+esc(sub)+'</span></div><input type="number" value="'+(Number(it.p)||0)+'" data-id="'+esc(String(it.id||''))+'" data-type="'+type+'" onchange="requestPriceChange(this.dataset.type,this.dataset.id,this.value)" style="width:70px;margin:0;padding:4px;text-align:center;">'+copy+'</div>';
  }

  window.renderDbEditors = function(){
    syncWindowCaches();
    epRefreshDbScopeUi();
    var catsEl=$('db-cats');
    if(catsEl){
      var all=activeArr('mat').concat(activeArr('work'));
      catsEl.innerHTML=Array.from(new Set(all.map(function(x){return x.c||'Разное';}))).sort(function(a,b){return a.localeCompare(b,'ru');}).map(function(c){return '<option value="'+esc(c)+'">';}).join('');
    }
    var m=$('editor-mat-list'), w=$('editor-work-list');
    if(m) m.innerHTML=renderDbRows('mat');
    if(w) w.innerHTML=renderDbRows('work');
  };

  window.epSetDbScope = function(s){
    localStorage.setItem(LS_SCOPE, s==='global' ? 'global' : 'my');
    syncWindowCaches();
    epRefreshDbScopeUi();
    if(typeof renderDbEditors==='function') renderDbEditors();
    toast('Работаем по базе: ' + activeLabel());
  };

  window.epCreateMasterDb = async function(){
    try{ localStorage.setItem(LS_MASTER_CREATED,'1'); localStorage.setItem(LS_SCOPE,'my'); }catch(e){}
    EP_MY_MAT = arrLS(LS_MY_MAT);
    EP_MY_WORK = arrLS(LS_MY_WORK);
    setLS(LS_MY_MAT, EP_MY_MAT);
    setLS(LS_MY_WORK, EP_MY_WORK);
    syncWindowCaches();
    await epSaveMyDbToServer();
    renderDbEditors();
    toast('✅ Своя база создана. Добавление и импорт идут в мою базу без админа.');
  };

  window.epCopyOneServerToMy = function(type,item){
    var it=dec(item);
    if(!it) return toast('Позиция не найдена');
    var copy=clone(it);
    copy.originServerId = copy.originServerId || copy.id || '';
    copy.id = 'local_' + type + '_' + Date.now() + '_' + Math.random().toString(36).slice(2,7);
    var arr=myArr(type).slice();
    arr=upsert(arr,type,copy);
    saveMyLocal(type,arr);
    toast('✅ Позиция добавлена в мою базу');
    if(typeof renderDbEditors==='function') renderDbEditors();
  };
  window.epCopyOneGlobalToMy = window.epCopyOneServerToMy;

  window.epClearMyDbType = function(type){
    var title=type==='work'?'работ':'материалов';
    if(!confirm('Вы точно желаете очистить свою базу '+title+'?\n\nБаза сервера не изменится.')) return;
    saveMyLocal(type, []);
    renderDbEditors();
    toast('✅ Моя база '+title+' очищена');
  };

  window.epClearServerDbType = async function(type){
    var title=type==='work'?'работ':'материалов';
    if(!confirm('Вы точно желаете очистить базу сервера '+title+'?\n\nСметы и личные базы мастеров не изменятся.')) return;
    if(!isAdmin()){
      await epSendServerProposal(type, [], 'clear_server_'+type);
      return toast('✅ Заявка на очистку базы сервера отправлена админу');
    }
    saveServerLocal(type, [], true);
    try{ localStorage.setItem(LS_CLEAN,'1'); }catch(e){}
    renderDbEditors();
    toast('✅ База сервера '+title+' очищена');
  };

  window.epDeleteMySelected = function(){
    var checks=Array.from(document.querySelectorAll('.ep-my-del-check:checked'));
    if(!checks.length) return toast('Выберите позиции');
    if(!confirm('Вы точно желаете удалить выбранные позиции из своей базы?\n\nБаза сервера не изменится.')) return;
    var rm={mat:new Set(), work:new Set()};
    checks.forEach(function(ch){ var it=dec(ch.dataset.item); if(it) rm[ch.dataset.type].add(sig(ch.dataset.type,it)); });
    ['mat','work'].forEach(function(type){ if(rm[type].size) saveMyLocal(type, myArr(type).filter(function(x){ return !rm[type].has(sig(type,x)); })); });
    renderDbEditors();
    toast('✅ Удалено у мастера: '+checks.length);
  };

  window.addDbItem = async function(){
    var cat=$('db-new-cat') ? $('db-new-cat').value.trim() : '';
    var name=$('db-new-name') ? $('db-new-name').value.trim() : '';
    var price=$('db-new-price') ? Number(String($('db-new-price').value).replace(',','.').replace(/[^\d.]/g,''))||0 : 0;
    var unit=$('db-new-unit') ? $('db-new-unit').value.trim() || 'шт' : 'шт';
    var type = ($('editor-work-list') && $('editor-work-list').style.display !== 'none') ? 'work' : 'mat';
    if(!name) return toast('Введите название позиции');
    var item=epAutoGroupItem(type, {id:(type==='work'?'w':'m')+'_manual_'+Date.now(), c:cat||'Разное', n:name, p:price, u:unit});
    if(scope()==='my'){
      var arr=myArr(type).slice(); arr=upsert(arr,type,item); saveMyLocal(type,arr);
      toast('✅ Добавлено в мою базу');
    } else {
      if(isAdmin()){ var g=serverArr(type).slice(); g=upsert(g,type,item); saveServerLocal(type,g,true); toast('✅ Добавлено в базу сервера'); }
      else { await epSendServerProposal(type,[item],'add_manual_to_server'); toast('✅ Позиция отправлена админу в базу сервера'); }
    }
    if($('db-new-name')) $('db-new-name').value='';
    if($('db-new-price')) $('db-new-price').value='';
    renderDbEditors();
  };

  window.requestPriceChange = async function(type,id,newPrice){
    newPrice=Number(String(newPrice).replace(',','.').replace(/[^\d.]/g,''))||0;
    var arr=activeArr(type).slice();
    var item=arr.find(function(x){return String(x.id||'')===String(id);});
    if(!item) return toast('Позиция не найдена');
    var changed=Object.assign({}, clone(item), {p:newPrice});
    if(scope()==='my'){
      saveMyLocal(type, upsert(myArr(type).slice(), type, changed));
      toast('✅ Цена сохранена в моей базе');
    } else {
      if(isAdmin()){ saveServerLocal(type, upsert(serverArr(type).slice(), type, changed), true); toast('✅ Цена изменена в базе сервера'); }
      else { await epSendServerProposal(type,[changed],'price_change_server'); toast('✅ Изменение цены сервера отправлено админу'); }
    }
    renderDbEditors();
  };

  function reviewedItems(){
    var src=(window.EP_DB_REVIEW && window.EP_DB_REVIEW.items) || [];
    var type=(window.EP_DB_REVIEW && window.EP_DB_REVIEW.type) || 'mat';
    var out=[];
    for(var i=0;i<src.length;i++){
      var ch=$('ep-db-check-'+i); if(ch && !ch.checked) continue;
      var name=$('ep-db-name-'+i), cat=$('ep-db-cat-'+i), sub=$('ep-db-subcat-'+i), price=$('ep-db-price-'+i), unit=$('ep-db-unit-'+i);
      var it={
        id: src[i].id || ((type==='work'?'w':'m')+'_imp_'+Date.now()+'_'+i),
        c: cat ? cat.value.trim() : (src[i].c || 'Разное'),
        g: sub ? sub.value.trim() : (src[i].g || src[i].sc || ''),
        sc: sub ? sub.value.trim() : (src[i].sc || src[i].g || ''),
        n: name ? name.value.trim() : src[i].n,
        p: price ? Number(String(price.value).replace(',','.').replace(/[^\d.]/g,''))||0 : Number(src[i].p)||0,
        u: unit ? unit.value.trim() || 'шт' : (src[i].u || 'шт')
      };
      if(it.n) out.push(epAutoGroupItem(type,it));
    }
    return out;
  }

  window.epApplyReviewedDbItems = async function(mode){
    var type=(window.EP_DB_REVIEW && window.EP_DB_REVIEW.type) || 'mat';
    var items=reviewedItems();
    if(!items.length) return toast('Нет выбранных позиций');
    if(scope()==='my'){
      var arr=myArr(type).slice(); items.forEach(function(it){ arr=upsert(arr,type,it); }); saveMyLocal(type,arr);
      toast('✅ Импорт сохранён в моей базе');
    } else {
      if(isAdmin()){ var g=serverArr(type).slice(); items.forEach(function(it){ g=upsert(g,type,it); }); saveServerLocal(type,g,true); toast('✅ Импорт добавлен в базу сервера'); }
      else { await epSendServerProposal(type,items,'import_to_server_'+mode); toast('✅ Импорт в базу сервера отправлен админу'); }
    }
    renderDbEditors();
    if(typeof closeModal==='function') closeModal('ep-db-ai-review-modal');
  };

  function downloadJson(filename,data){
    var blob=new Blob([JSON.stringify(data,null,2)],{type:'application/json;charset=utf-8'});
    var url=URL.createObjectURL(blob);
    var a=document.createElement('a'); a.href=url; a.download=filename; document.body.appendChild(a); a.click(); a.remove();
    setTimeout(function(){URL.revokeObjectURL(url);},1000);
  }
  window.epExportActiveDb = function(){
    var s=scope();
    downloadJson(s==='global'?'electric-pro-server-db.json':'electric-pro-my-db.json', {
      source:s==='global'?'server':'my',
      matDB:s==='global'?EP_SERVER_MAT:EP_MY_MAT,
      workDB:s==='global'?EP_SERVER_WORK:EP_MY_WORK,
      exportedAt:new Date().toISOString()
    });
  };
  window.epExportMyDb = function(){ downloadJson('electric-pro-my-db.json', {source:'my', matDB:EP_MY_MAT, workDB:EP_MY_WORK, exportedAt:new Date().toISOString()}); };
  window.epExportGlobalDb = function(){ downloadJson('electric-pro-server-db.json', {source:'server', matDB:EP_SERVER_MAT, workDB:EP_SERVER_WORK, exportedAt:new Date().toISOString()}); };

  window.epOpenDbFactoryResetModal = function(){ if(typeof openModal==='function') openModal('dbFactoryResetModal'); };

  var CLEAN_KEYS = [
    LS_MY_MAT, LS_MY_WORK, LS_SERVER_CACHE, LS_OLD_SERVER_CACHE, LS_MASTER_CREATED, LS_SCOPE,
    'ep_catalog_source_mat_v1','ep_catalog_source_work_v1','ep_deleted_work_ids_local_v1','ep_deleted_mat_ids_local_v1',
    'ep_deleted_global_work_v1','ep_deleted_global_mat_v1','ep_db_clean_mode_v1'
  ];

  function localFullCleanOnly(){
    CLEAN_KEYS.forEach(function(k){ try{ localStorage.removeItem(k); }catch(e){} });
    try{ localStorage.setItem(LS_CLEAN,'1'); localStorage.setItem(LS_SCOPE,'my'); }catch(e){}
    EP_MY_MAT=[]; EP_MY_WORK=[]; EP_SERVER_MAT=[]; EP_SERVER_WORK=[]; EP_SERVER_DOC_SEEN=true;
    setLS(LS_MY_MAT, []); setLS(LS_MY_WORK, []);
    setObjLS(LS_SERVER_CACHE, {matDB:[], workDB:[], cleanMode:true, ts:Date.now()});
    syncWindowCaches();
  }

  window.epFactoryResetMyDb = async function(){
    if(!confirm('Вы точно желаете удалить всю ЛИЧНУЮ базу мастера?\n\nБудут удалены все материалы и работы только у мастера. База сервера не изменится.')) return;
    EP_MY_MAT=[]; EP_MY_WORK=[];
    setLS(LS_MY_MAT, []); setLS(LS_MY_WORK, []);
    syncWindowCaches();
    try{ localStorage.setItem(LS_MASTER_CREATED,'1'); }catch(e){}
    await epSaveMyDbToServer();
    renderDbEditors();
    if(typeof closeModal==='function') closeModal('dbFactoryResetModal');
    toast('✅ Личная база мастера очищена в ноль');
  };

  async function commitCollection(collection, mode){
    if(typeof db === 'undefined' || !db) return 0;
    var snap = await db.collection(collection).get();
    var batch = db.batch(), ops = 0, count = 0, promises=[];
    snap.forEach(function(doc){
      if(mode === 'delete') batch.delete(doc.ref);
      else batch.set(doc.ref, {matDB:[], workDB:[], cleanMode:true, resetAt:new Date().toISOString()}, {merge:true});
      ops++; count++;
      if(ops >= 450){ promises.push(batch.commit()); batch=db.batch(); ops=0; }
    });
    if(ops) promises.push(batch.commit());
    if(promises.length) await Promise.all(promises);
    return count;
  }

  window.epFactoryResetAllDb = async function(){
    if(!confirm('ВНИМАНИЕ!\n\nВы точно желаете удалить ВСЮ базу данных приложения?\n\nБудут очищены материалы и работы: моя база, база сервера, базы мастеров, локальные кэши, скрытые позиции и заявки.\n\nСметы, заказчики, настройки, щиты, пулы и логика расчётов не трогаются.')) return;
    var code = prompt('Для подтверждения напишите: УДАЛИТЬ БАЗЫ');
    if(code !== 'УДАЛИТЬ БАЗЫ') return toast('Сброс отменён');
    localFullCleanOnly();
    var serverInfo='';
    try{
      if(typeof db !== 'undefined' && db){
        if(uid()){
          await db.collection('user_db').doc(uid()).set({matDB:[], workDB:[], cleanMode:true, created:true, resetAt:new Date().toISOString()}, {merge:true});
        }
        if(isAdmin()){
          await db.collection('settings').doc('global_db').set({matDB:[], workDB:[], cleanMode:true, resetAt:new Date().toISOString()}, {merge:true});
          try{ var users=await commitCollection('user_db','empty'); serverInfo += ' Базы мастеров очищены: '+users+'.'; }catch(e){ serverInfo += ' Базы мастеров не очищены: нет прав или ошибка.'; console.warn(e); }
          try{ var props=await commitCollection('db_proposals','delete'); serverInfo += ' Заявки очищены: '+props+'.'; }catch(e){ serverInfo += ' Заявки не очищены: нет прав или ошибка.'; console.warn(e); }
          try{ var gcol=await commitCollection('global_db','delete'); if(gcol) serverInfo += ' Коллекция global_db очищена: '+gcol+'.'; }catch(e){ console.warn('global_db collection clear failed', e); }
        } else {
          await epSendServerProposal('system', [], 'request_full_server_db_reset');
          serverInfo += ' Вы не админ: полный серверный сброс отправлен заявкой админу.';
        }
      }
    }catch(e){ console.warn('factory reset failed', e); serverInfo += ' Серверный сброс не выполнен: проверьте права Firebase.'; }
    syncWindowCaches();
    renderDbEditors();
    if(typeof closeModal==='function') closeModal('dbFactoryResetModal');
    toast('✅ Локальные базы очищены в ноль.' + serverInfo);
  };

  function autoGroupMaterial(item){
    var it=clone(item); var n=cleanText([it.n,it.c,it.g,it.sc].join(' '));
    if(/utp|ftp|cat5|cat6|витая|интернет|tv|sat|коаксиал|слаботоч/.test(n)){ it.c='Слаботочка'; it.g=/tv|sat|коаксиал/.test(n)?'ТВ / коаксиальный кабель':'Интернет / витая пара'; }
    else if(/кабель|ввг|провод|пугв|пв 3|нг/.test(n)){ if(/пугв|пв 3/.test(n)){ it.c='Щитовое'; it.g='Расходка под сборку / Провода'; } else { it.c='Кабель'; if(/1\.5|1 5|3x1 5|3 1 5/.test(n)) it.g='Силовой кабель 3×1.5'; else if(/2\.5|2 5|3x2 5|3 2 5/.test(n)) it.g='Силовой кабель 3×2.5'; else if(/3x4|3 4|x4/.test(n)) it.g='Силовой кабель 3×4'; else if(/3x6|3 6|x6/.test(n)) it.g='Силовой кабель 3×6'; else it.g='Силовой кабель'; } }
    else if(/гофр|труб|пнд|пвх/.test(n)){ it.c='Трубы'; it.g=/20/.test(n)?'Гофра / труба 20 мм':'Гофра / трубы'; }
    else if(/диф|дифф/.test(n)){ it.c='Автоматика'; it.g='ДИФы'; }
    else if(/узо|вд1/.test(n)){ it.c='Автоматика'; it.g='УЗО'; }
    else if(/уздп|дугов/.test(n)){ it.c='Автоматика'; it.g='УЗДП'; }
    else if(/узм|реле напряж/.test(n)){ it.c='Автоматика'; it.g='УЗМ / реле напряжения'; }
    else if(/реле времени/.test(n)){ it.c='Автоматика'; it.g='Реле времени'; }
    else if(/контактор|пускател/.test(n)){ it.c='Автоматика'; it.g='Контакторы'; }
    else if(/автомат|ва47|sh201|1p|2p|3p|c10|c16|c25|c32|c40/.test(n)){ it.c='Автоматика'; it.g='Автоматы'; }
    else if(/щит|шкаф|корпус|бокс|щрв|tekfor|uk6/.test(n)){ it.c='Щитовое'; if(/внутр|встра|скрыт/.test(n)) it.g='Корпуса / Встраиваемый'; else if(/наклад/.test(n)) it.g='Корпуса / Накладной'; else it.g='Корпуса'; }
    else if(/ншви|наконеч/.test(n)){ it.c='Щитовое'; it.g='Расходка под сборку / Наконечники'; }
    else if(/шин|клемм|n |pe |ноль|земл/.test(n)){ it.c='Щитовое'; it.g='Расходка под сборку / Шинки и клеммники'; }
    else if(/греб/.test(n)){ it.c='Щитовое'; it.g='Расходка под сборку / Гребёнки'; }
    else if(/din|дин|рейк|огранич/.test(n)){ it.c='Щитовое'; it.g='Расходка под сборку / DIN-рейки и ограничители'; }
    else if(/маркир|бирк/.test(n)){ it.c='Щитовое'; it.g='Расходка под сборку / Маркировка'; }
    else if(/подрозет|коробк|гмл|гильз|термоусад|стяжк|лента|гвозд|баллон|площадк/.test(n)){ it.c='Расходники'; if(/подрозет/.test(n)) it.g='Подрозетники'; else if(/коробк/.test(n)) it.g='Распределительные коробки'; else if(/гмл|гильз|термоусад/.test(n)) it.g='Соединения'; else it.g='Прочая расходка'; }
    else { it.c=it.c&&it.c!=='Разное'?it.c:'Прочее'; it.g=it.g||it.sc||'Без группы'; }
    it.sc=it.g; return it;
  }
  function autoGroupWork(item){
    var it=clone(item); var n=cleanText([it.n,it.c,it.g,it.sc].join(' '));
    if(/демонтаж/.test(n)){ it.c='Демонтаж'; if(/щит|автомат|узо|диф|рубильник|реле/.test(n)) it.g='Щитовое'; else if(/розет|выключ|короб|звон/.test(n)) it.g='Электроточки'; else if(/люстр|свет/.test(n)) it.g='Освещение'; else it.g='Демонтаж'; }
    else if(/ниша|вырубка.*щит|щит.*ниша/.test(n)){ it.c='Ниши щита'; if(/бетон/.test(n)) it.g='Бетон'; else if(/кирпич/.test(n)) it.g='Кирпич'; else if(/панель/.test(n)) it.g='Панелька'; else if(/мягк|гипс|гкл/.test(n)) it.g='Мягкий материал'; else it.g='Материал стены'; }
    else if(/штроб|резк|отверстие|алмаз/.test(n)){ it.c='Штробление и резка'; if(/100x50|100 50|ввод/.test(n)) it.g='Штроба 100×50 вводная'; else if(/50x50|50 50/.test(n)) it.g='Штроба 50×50'; else if(/25x30|25 30/.test(n)) it.g='Штроба 25×30'; else if(/132/.test(n)) it.g='Отверстие 132 мм'; else if(/52/.test(n)) it.g='Отверстие 52 мм'; else it.g='Алмазная резка'; }
    else if(/высверл|подрозет/.test(n) && /бетон|кирпич|панель|мягк|копос|глубок|стандарт/.test(n)){ it.c='Высверливание подрозетников'; if(/копос|75|74/.test(n)) it.g='Копос 74×75'; else if(/глубок|64/.test(n)) it.g='Глубокий'; else it.g='Стандарт'; }
    else if(/вклейк|установка подрозет|распаечн|электроточк/.test(n)){ it.c='Черновая электрика'; if(/подрозет/.test(n)) it.g='Подрозетники'; else if(/короб/.test(n)) it.g='Распределительные коробки'; else it.g='Электроточки'; }
    else if(/проклад|кабел|гофр|трасс/.test(n)){ it.c='Монтаж'; if(/гофр|пол/.test(n)) it.g='Прокладка кабеля в гофре / пол'; else if(/потол|без гоф/.test(n)) it.g='Прокладка кабеля без гофры / потолок'; else it.g='Прокладка кабеля'; }
    else if(/розет|выключ|механизм|терморег|датчик|звонк|краб/.test(n)){ it.c='Чистовая установка'; if(/наклад/.test(n)) it.g='Накладные механизмы'; else it.g='Механизмы'; }
    else if(/свет|люстр|бра|трек|спот|лента|профил/.test(n)){ it.c='Освещение'; if(/лента|профил/.test(n)) it.g='LED / профиль'; else it.g='Светильники'; }
    else if(/щит|автомат|узо|диф|реле|счетчик|сборка щита|однолин/.test(n)){ it.c='Щитовое'; if(/сборка/.test(n)) it.g='Сборка щита'; else if(/счетчик/.test(n)) it.g='Счетчики'; else if(/реле/.test(n)) it.g='Автоматика и реле'; else it.g='Монтаж'; }
    else { it.c=it.c&&it.c!=='Разное'?it.c:'Прочие работы'; it.g=it.g||it.sc||'Без группы'; }
    it.sc=it.g; return it;
  }
  window.epAutoGroupItem = function(type,item){ return type==='work' ? autoGroupWork(item) : autoGroupMaterial(item); };
  window.epAutoRegroupActiveDb = function(){
    var s=scope();
    if(!confirm('Автоматически разгруппировать выбранную базу: '+activeLabel()+'?')) return;
    var mats=activeArr('mat').map(function(x){return autoGroupMaterial(x);});
    var works=activeArr('work').map(function(x){return autoGroupWork(x);});
    if(s==='global'){ saveServerLocal('mat',mats,isAdmin()); saveServerLocal('work',works,isAdmin()); if(!isAdmin()) epSendServerProposal('server_db', {matDB:mats,workDB:works}, 'regroup_server_db'); }
    else { saveMyLocal('mat',mats); saveMyLocal('work',works); }
    renderDbEditors();
    toast('✅ Разгруппировка выполнена');
  };


  function serverModalRow(type,it){
    var item=enc(it);
    var sub=(groupOf(it)?groupOf(it)+' • ':'')+(Number(it.p)||0)+' ₽ / '+(it.u||'шт');
    return '<label class="mat-item ep-select-row"><input type="checkbox" class="ep-global-check" data-type="'+type+'" data-item="'+esc(item)+'" style="width:22px;height:22px;accent-color:var(--primary);"><div style="flex:1;"><b>'+esc(it.n||'Позиция')+'</b><br><span style="color:var(--gray);font-size:11px;">'+esc(sub)+'</span></div></label>';
  }
  function renderServerModalList(type){
    var arr=serverArr(type), html='';
    if(!arr.length) return '<div style="padding:16px;border:1px dashed var(--border);border-radius:14px;text-align:center;color:var(--gray);font-weight:800;">База сервера пустая.</div>';
    var cats={}, i=0;
    arr.forEach(function(it){ var c=it.c||'Разное'; var g=groupOf(it)||'Без группы'; if(!cats[c]) cats[c]={}; if(!cats[c][g]) cats[c][g]=[]; cats[c][g].push(it); });
    Object.keys(cats).sort(function(a,b){return a.localeCompare(b,'ru');}).forEach(function(c){
      var cid='srv_cat_'+type+'_'+(i++);
      html += '<div class="cat-header" onclick="epDbToggle(&quot;'+cid+'&quot;, event)">'+esc(c)+'</div><div class="cat-body" id="'+cid+'">';
      Object.keys(cats[c]).sort(function(a,b){return a.localeCompare(b,'ru');}).forEach(function(g){
        var gid='srv_sub_'+type+'_'+(i++);
        html += '<div class="sub-cat-header" onclick="epDbToggle(&quot;'+gid+'&quot;, event)">'+esc(g)+' ▾</div><div class="sub-cat-body" id="'+gid+'">';
        cats[c][g].forEach(function(it){ html += serverModalRow(type,it); });
        html += '</div>';
      });
      html += '</div>';
    });
    return html;
  }
  window.epOpenGlobalDbModal = async function(){
    if(typeof showLoader === 'function') showLoader('Загрузка базы сервера...', '🌍');
    await epLoadDbFromServer();
    if(typeof hideLoader === 'function') hideLoader();
    window.EP_SERVER_MODAL_TYPE='mat';
    window.epRenderServerDbModal();
    if(typeof openModal==='function') openModal('globalDbModal');
  };
  window.epSwitchGlobalDbTab = function(type){
    window.EP_SERVER_MODAL_TYPE = type === 'work' ? 'work' : 'mat';
    window.epRenderServerDbModal();
  };
  window.epGlobalSelectAll = function(flag){
    document.querySelectorAll('#ep-global-db-list .ep-global-check').forEach(function(ch){ ch.checked=!!flag; });
  };
  window.epRenderServerDbModal = function(){
    var type=window.EP_SERVER_MODAL_TYPE || 'mat';
    var matBtn=$('ep-global-tab-mat'), workBtn=$('ep-global-tab-work'), list=$('ep-global-db-list');
    if(matBtn) matBtn.classList.toggle('active', type==='mat');
    if(workBtn) workBtn.classList.toggle('active', type==='work');
    if(list) list.innerHTML=renderServerModalList(type);
  };
  window.epAddSelectedGlobalToMyDb = function(){
    var checks=Array.from(document.querySelectorAll('#ep-global-db-list .ep-global-check:checked'));
    if(!checks.length) return toast('Выберите позиции');
    checks.forEach(function(ch){ window.epCopyOneServerToMy(ch.dataset.type, ch.dataset.item); });
    window.epRenderServerDbModal();
    toast('✅ Добавлено в мою базу: '+checks.length);
  };

  function epRefreshDbScopeUi(){
    var my=$('ep-scope-my-btn'), gl=$('ep-scope-global-btn'), st=$('ep-db-scope-status'), cleanSt=$('ep-clean-status-line');
    if(my){ my.className=scope()==='my'?'btn-success':'btn-info'; my.textContent='👤 Моя база'; }
    if(gl){ gl.className=scope()==='global'?'btn-success':'btn-info'; gl.textContent='🌍 База сервера'; }
    if(st) st.innerHTML='Сейчас выбрано: <b>'+activeLabel()+'</b>. '+(scope()==='my'?'Считаем и показываем только мою базу.':'Считаем и показываем только базу сервера.');
    if(cleanSt) cleanSt.textContent='Активная база: '+activeLabel()+'. Материалы: '+activeArr('mat').length+', работы: '+activeArr('work').length+'.';
  }

  function install(){
    syncWindowCaches();
    epRefreshDbScopeUi();
    try{
      openMatCatalog=window.openMatCatalog;
      openWorkCatalog=window.openWorkCatalog;
      renderDbEditors=window.renderDbEditors;
      promptAdd=window.promptAdd;
      addDbItem=window.addDbItem;
      requestPriceChange=window.requestPriceChange;
    }catch(e){}
  }

  window.epSplitDbDebug = function(){ return {scope:scope(), cleanMode:cleanMode(), myMat:EP_MY_MAT.length, myWork:EP_MY_WORK.length, serverMat:EP_SERVER_MAT.length, serverWork:EP_SERVER_WORK.length}; };

  epLoadDbFromServer().then(function(){ install(); if(typeof renderDbEditors==='function') renderDbEditors(); });
  install();
  var n=0, timer=setInterval(function(){ install(); n++; if(n>300) clearInterval(timer); },100);
  document.addEventListener('DOMContentLoaded', function(){ setTimeout(function(){ epLoadDbFromServer().then(function(){ install(); if(typeof renderDbEditors==='function') renderDbEditors(); }); },800); });
})();


/* =========================================================
 * SOURCE: block-12.js
 * AUTO TARGET: 04-database.js
 * SCORE: 140
 * HITS: database, db, base, matDB, workDB, global_db, user_db, import, category, subcategory, renderDbEditors
 * ========================================================= */

/*
 * Extracted from public/index.html
 * Original script block: 12
 * Original HTML lines: 6928-7145
 */

/* === EP MASTER EXCEL IMPORT DISPLAY FIX V4 2026-05-14 ===
   Fix: for master accounts Excel/text/JSON imports always save into "My database",
   immediately switch UI to My database, persist locally and to user_db/{uid}, then rerender.
   Admin can still import directly to Server database when Server scope is selected.
*/
(function(){
  var LS_MY_MAT = 'user_db_mat_v31';
  var LS_MY_WORK = 'user_db_work_v31';
  var LS_SCOPE = 'ep_db_scope_v2';
  var LS_SERVER_CACHE = 'ep_global_cache_force_v1';

  function $(id){ return document.getElementById(id); }
  function msg(t){ if(typeof showToast === 'function') showToast(t); else alert(t); }
  function isAdmin(){ try{ return !!(window.appUser && appUser.role === 'admin'); }catch(e){ return false; } }
  function uid(){ try{ return (window.appUser && appUser.uid) || ''; }catch(e){ return ''; } }
  function scope(){ try{ return localStorage.getItem(LS_SCOPE) === 'global' ? 'global' : 'my'; }catch(e){ return 'my'; } }
  function setScope(s){ try{ localStorage.setItem(LS_SCOPE, s === 'global' ? 'global' : 'my'); }catch(e){} }
  function readArr(k){ try{ var a = JSON.parse(localStorage.getItem(k) || '[]'); return Array.isArray(a) ? a : []; }catch(e){ return []; } }
  function writeArr(k,a){ try{ if(typeof safeSet === 'function') safeSet(k, JSON.stringify(a || [])); else localStorage.setItem(k, JSON.stringify(a || [])); }catch(e){ try{ localStorage.setItem(k, JSON.stringify(a || [])); }catch(_e){} } }
  function readObj(k){ try{ var o = JSON.parse(localStorage.getItem(k) || '{}'); return o && typeof o === 'object' ? o : {}; }catch(e){ return {}; } }
  function writeObj(k,o){ try{ localStorage.setItem(k, JSON.stringify(o || {})); }catch(e){} }
  function clean(s){ return String(s || '').toLowerCase().replace(/ё/g,'е').replace(/×/g,'x').replace(/х/g,'x').replace(/[^a-zа-я0-9]+/g,' ').trim(); }
  function groupOf(it){ return (it && (it.g || it.sc || it.subcategory || it.group)) || ''; }
  function clone(it){ var x = Object.assign({}, it || {}); delete x.__src; delete x.__encoded; return x; }
  function sig(type,it){ return type + '|' + clean([it && it.c, groupOf(it), it && it.n, it && it.u].filter(Boolean).join('|')); }
  function activeTarget(){ return (isAdmin() && scope() === 'global') ? 'global' : 'my'; }

  function getMy(type){
    var key = type === 'work' ? LS_MY_WORK : LS_MY_MAT;
    var fromWin = type === 'work' ? window.EP_MY_WORK : window.EP_MY_MAT;
    return Array.isArray(fromWin) ? fromWin.slice() : readArr(key);
  }
  function getServer(type){
    var fromWin = type === 'work' ? window.EP_GLOBAL_WORK : window.EP_GLOBAL_MAT;
    if(Array.isArray(fromWin)) return fromWin.slice();
    var c = readObj(LS_SERVER_CACHE);
    var a = type === 'work' ? c.workDB : c.matDB;
    return Array.isArray(a) ? a : [];
  }
  function setMy(type,arr){
    arr = unique(arr, type);
    if(type === 'work') window.EP_MY_WORK = arr; else window.EP_MY_MAT = arr;
    writeArr(LS_MY_MAT, type === 'mat' ? arr : getMy('mat'));
    writeArr(LS_MY_WORK, type === 'work' ? arr : getMy('work'));
    try{ window.userMatDB = getMy('mat'); window.userWorkDB = getMy('work'); }catch(e){}
    syncMainArrays('my');
  }
  function setServer(type,arr){
    arr = unique(arr, type);
    if(type === 'work') window.EP_GLOBAL_WORK = arr; else window.EP_GLOBAL_MAT = arr;
    var mat = type === 'mat' ? arr : getServer('mat');
    var work = type === 'work' ? arr : getServer('work');
    try{
      window.EP_FORCE_GLOBAL = {matDB:mat, workDB:work};
      window.EP_ULTIMATE_DB_CACHE = {matDB:mat, workDB:work, ts:Date.now()};
      window.EP_GLOBAL_DB_VISIBLE_CACHE = {matDB:mat, workDB:work, ts:Date.now()};
    }catch(e){}
    writeObj(LS_SERVER_CACHE, {matDB:mat, workDB:work, ts:Date.now()});
    syncMainArrays('global');
  }
  function syncMainArrays(target){
    try{
      var use = target || activeTarget();
      if(use === 'global'){
        window.matDB = getServer('mat');
        window.workDB = getServer('work');
        try{ matDB = window.matDB; workDB = window.workDB; }catch(e){}
      } else {
        window.matDB = getMy('mat');
        window.workDB = getMy('work');
        try{ matDB = window.matDB; workDB = window.workDB; }catch(e){}
      }
    }catch(e){}
  }
  function unique(arr,type){
    var seen = {}, out = [];
    (arr || []).forEach(function(raw){
      var it = clone(raw);
      if(!it.n) return;
      if(!it.id) it.id = (type === 'work' ? 'w' : 'm') + '_imp_' + Date.now() + '_' + Math.random().toString(36).slice(2,7);
      if(it.sc && !it.g) it.g = it.sc;
      if(it.g && !it.sc) it.sc = it.g;
      var k = sig(type,it);
      if(seen[k]) return;
      seen[k] = 1;
      out.push(it);
    });
    return out;
  }
  function upsert(arr,type,it,mode){
    it = clone(it);
    if(!it.id) it.id = (type === 'work' ? 'w' : 'm') + '_imp_' + Date.now() + '_' + Math.random().toString(36).slice(2,7);
    if(it.sc && !it.g) it.g = it.sc;
    if(it.g && !it.sc) it.sc = it.g;
    var k = sig(type,it);
    var idx = (arr || []).findIndex(function(x){ return sig(type,x) === k || (it.id && String(x.id || '') === String(it.id)); });
    if(idx >= 0 && mode === 'replace') arr[idx] = Object.assign({}, arr[idx], it, {id:arr[idx].id || it.id});
    else if(idx >= 0) arr[idx] = Object.assign({}, arr[idx], it, {id:arr[idx].id || it.id});
    else arr.push(it);
    return arr;
  }
  function reviewedItems(){
    var review = window.EP_DB_REVIEW || {};
    var src = Array.isArray(review.items) ? review.items : [];
    var type = review.type === 'work' ? 'work' : 'mat';
    var out = [];
    src.forEach(function(base, i){
      var ch = $('ep-db-check-' + i);
      if(ch && !ch.checked) return;
      var it = {
        id: base.id || ((type === 'work' ? 'w' : 'm') + '_imp_' + Date.now() + '_' + i),
        n: (($('ep-db-name-' + i) || {}).value || base.n || '').trim(),
        c: (($('ep-db-cat-' + i) || {}).value || base.c || 'Разное').trim(),
        g: (($('ep-db-subcat-' + i) || {}).value || base.g || base.sc || 'Без группы').trim(),
        sc: (($('ep-db-subcat-' + i) || {}).value || base.sc || base.g || 'Без группы').trim(),
        p: Number(String((($('ep-db-price-' + i) || {}).value) || base.p || 0).replace(',','.').replace(/[^\d.]/g,'')) || 0,
        u: (($('ep-db-unit-' + i) || {}).value || base.u || 'шт').trim()
      };
      if(it.n){
        try{ if(typeof window.epAutoGroupItem === 'function') it = window.epAutoGroupItem(type,it); }catch(e){}
        out.push(it);
      }
    });
    return {type:type, items:out};
  }
  async function saveMyRemote(){
    try{
      if(typeof db !== 'undefined' && db && uid()){
        await db.collection('user_db').doc(uid()).set({
          uid: uid(),
          masterName: (window.appUser && (appUser.name || appUser.email)) || '',
          matDB: getMy('mat'),
          workDB: getMy('work'),
          created: true,
          updatedAt: new Date().toISOString()
        }, {merge:true});
        return true;
      }
    }catch(e){ console.warn('EP V4 save my import failed', e); }
    return false;
  }
  async function saveServerRemote(){
    try{
      if(typeof db !== 'undefined' && db && isAdmin()){
        await db.collection('settings').doc('global_db').set({
          matDB: getServer('mat'),
          workDB: getServer('work'),
          updatedAt: new Date().toISOString()
        }, {merge:true});
        return true;
      }
    }catch(e){ console.warn('EP V4 save server import failed', e); }
    return false;
  }
  function rerender(){
    try{ if(typeof renderDbEditors === 'function') renderDbEditors(); }catch(e){}
    try{ if(window.renderDbEditors && window.renderDbEditors !== renderDbEditors) window.renderDbEditors(); }catch(e){}
    try{ if(typeof window.epRefreshDbScopeUi === 'function') window.epRefreshDbScopeUi(); }catch(e){}
    setTimeout(function(){ try{ if(typeof renderDbEditors === 'function') renderDbEditors(); }catch(e){} },80);
    setTimeout(function(){ try{ if(typeof renderDbEditors === 'function') renderDbEditors(); }catch(e){} },500);
  }

  var oldTrigger = window.epTriggerDbFileImport;
  window.epTriggerDbFileImport = function(type){
    if(!isAdmin()){
      setScope('my');
      syncMainArrays('my');
      rerender();
      msg('Импорт мастера будет сохранён в 👤 Моя база');
    }
    if(typeof oldTrigger === 'function') return oldTrigger(type);
  };

  var oldTextImport = window.epOpenTextImport;
  window.epOpenTextImport = function(type){
    if(!isAdmin()){
      setScope('my');
      syncMainArrays('my');
      rerender();
    }
    if(typeof oldTextImport === 'function') return oldTextImport(type);
  };

  window.epApplyReviewedDbItems = async function(mode){
    var data = reviewedItems();
    var type = data.type;
    var items = data.items;
    if(!items.length) return msg('Нет выбранных позиций');

    var target = activeTarget();
    if(!isAdmin()){
      target = 'my';
      setScope('my');
    }

    if(target === 'global'){
      var g = getServer(type);
      items.forEach(function(it){ g = upsert(g,type,it,mode); });
      setServer(type,g);
      await saveServerRemote();
      msg('✅ Импорт добавлен в базу сервера: ' + items.length + ' поз.');
    } else {
      var a = getMy(type);
      items.forEach(function(it){ a = upsert(a,type,it,mode); });
      setMy(type,a);
      var saved = await saveMyRemote();
      syncMainArrays('my');
      msg('✅ Импорт сохранён в моей базе: ' + items.length + ' поз.' + (saved ? '' : ' Сервер не подтвердил сохранение, но на этом телефоне база отображается.'));
    }

    try{ if(typeof closeModal === 'function') closeModal('ep-db-ai-review-modal'); }catch(e){}
    rerender();
  };

  setTimeout(function(){ if(!isAdmin()) syncMainArrays('my'); rerender(); },1200);
})();


/* =========================================================
 * SOURCE: block-13.js
 * AUTO TARGET: 04-database.js
 * SCORE: 120
 * HITS: database, db, base, matDB, workDB, материал, работ, global_db, user_db, category, subcategory, renderDbEditors, epSetDbScope
 * ========================================================= */

/*
 * Extracted from public/index.html
 * Original script block: 13
 * Original HTML lines: 7149-7329
 */

/* === EP DB AUTO REFRESH ON SCOPE SWITCH V5 2026-05-14 ===
   Refresh selected database every time user switches between My DB and Server DB.
   Keeps sources strict: no mixing. Does not touch shield logic.
*/
(function(){
  var LS_SCOPE = 'ep_db_scope_v2';
  var LS_MY_MAT = 'user_db_mat_v31';
  var LS_MY_WORK = 'user_db_work_v31';
  var LS_SERVER_CACHE = 'ep_global_cache_force_v1';
  var refreshing = false;
  var lastToken = 0;

  function $(id){ return document.getElementById(id); }
  function toast(t){ if(typeof showToast === 'function') showToast(t); else console.log(t); }
  function uid(){ try{ return (window.appUser && appUser.uid) || ''; }catch(e){ return ''; } }
  function isAdmin(){ try{ return !!(window.appUser && appUser.role === 'admin'); }catch(e){ return false; } }
  function setScope(s){ try{ localStorage.setItem(LS_SCOPE, s === 'global' ? 'global' : 'my'); }catch(e){} }
  function getScope(){ try{ return localStorage.getItem(LS_SCOPE) === 'global' ? 'global' : 'my'; }catch(e){ return 'my'; } }
  function label(){ return getScope() === 'global' ? '🌍 База сервера' : '👤 Моя база'; }
  function readArr(k){ try{ var a = JSON.parse(localStorage.getItem(k) || '[]'); return Array.isArray(a) ? a : []; }catch(e){ return []; } }
  function writeArr(k,a){ try{ if(typeof safeSet === 'function') safeSet(k, JSON.stringify(a || [])); else localStorage.setItem(k, JSON.stringify(a || [])); }catch(e){ try{ localStorage.setItem(k, JSON.stringify(a || [])); }catch(_e){} } }
  function readObj(k){ try{ var o = JSON.parse(localStorage.getItem(k) || '{}'); return o && typeof o === 'object' ? o : {}; }catch(e){ return {}; } }
  function writeObj(k,o){ try{ localStorage.setItem(k, JSON.stringify(o || {})); }catch(e){} }
  function clean(s){ return String(s || '').toLowerCase().replace(/ё/g,'е').replace(/×/g,'x').replace(/х/g,'x').replace(/[^a-zа-я0-9]+/g,' ').trim(); }
  function groupOf(it){ return (it && (it.g || it.sc || it.subcategory || it.group)) || ''; }
  function clone(it){ var x = Object.assign({}, it || {}); delete x.__src; delete x.__encoded; return x; }
  function sig(type,it){ return type + '|' + clean([it && it.c, groupOf(it), it && it.n, it && it.u].filter(Boolean).join('|')); }
  function unique(arr,type){
    var seen = {}, out = [];
    (arr || []).forEach(function(raw){
      var it = clone(raw);
      if(!it.n) return;
      if(it.sc && !it.g) it.g = it.sc;
      if(it.g && !it.sc) it.sc = it.g;
      var k = sig(type,it);
      if(seen[k]) return;
      seen[k] = 1;
      out.push(it);
    });
    return out;
  }
  function getServerFromCache(type){
    var c = readObj(LS_SERVER_CACHE);
    var a = type === 'work' ? c.workDB : c.matDB;
    return Array.isArray(a) ? a : [];
  }
  function setMyArrays(mat,work){
    mat = unique(mat || [], 'mat');
    work = unique(work || [], 'work');
    window.EP_MY_MAT = mat;
    window.EP_MY_WORK = work;
    window.userMatDB = mat;
    window.userWorkDB = work;
    writeArr(LS_MY_MAT, mat);
    writeArr(LS_MY_WORK, work);
  }
  function setServerArrays(mat,work){
    mat = unique(mat || [], 'mat');
    work = unique(work || [], 'work');
    window.EP_GLOBAL_MAT = mat;
    window.EP_GLOBAL_WORK = work;
    window.EP_FORCE_GLOBAL = {matDB:mat, workDB:work};
    window.EP_ULTIMATE_DB_CACHE = {matDB:mat, workDB:work, ts:Date.now()};
    window.EP_GLOBAL_DB_VISIBLE_CACHE = {matDB:mat, workDB:work, ts:Date.now()};
    writeObj(LS_SERVER_CACHE, {matDB:mat, workDB:work, ts:Date.now()});
  }
  function syncActiveArrays(){
    try{
      if(getScope() === 'global'){
        var sm = Array.isArray(window.EP_GLOBAL_MAT) ? window.EP_GLOBAL_MAT : getServerFromCache('mat');
        var sw = Array.isArray(window.EP_GLOBAL_WORK) ? window.EP_GLOBAL_WORK : getServerFromCache('work');
        window.matDB = sm.slice();
        window.workDB = sw.slice();
        try{ matDB = window.matDB; workDB = window.workDB; }catch(e){}
      } else {
        var mm = Array.isArray(window.EP_MY_MAT) ? window.EP_MY_MAT : readArr(LS_MY_MAT);
        var mw = Array.isArray(window.EP_MY_WORK) ? window.EP_MY_WORK : readArr(LS_MY_WORK);
        window.matDB = mm.slice();
        window.workDB = mw.slice();
        try{ matDB = window.matDB; workDB = window.workDB; }catch(e){}
      }
    }catch(e){ console.warn('EP V5 sync active arrays failed', e); }
  }
  async function refreshMyFromServer(){
    var mat = Array.isArray(window.EP_MY_MAT) ? window.EP_MY_MAT : readArr(LS_MY_MAT);
    var work = Array.isArray(window.EP_MY_WORK) ? window.EP_MY_WORK : readArr(LS_MY_WORK);
    try{
      if(typeof db !== 'undefined' && db && uid()){
        var doc = await db.collection('user_db').doc(uid()).get();
        if(doc.exists){
          var d = doc.data() || {};
          if(Array.isArray(d.matDB)) mat = d.matDB;
          if(Array.isArray(d.workDB)) work = d.workDB;
        }
      }
    }catch(e){ console.warn('EP V5 load my db failed', e); }
    setMyArrays(mat, work);
  }
  async function refreshServerFromServer(){
    var mat = Array.isArray(window.EP_GLOBAL_MAT) ? window.EP_GLOBAL_MAT : getServerFromCache('mat');
    var work = Array.isArray(window.EP_GLOBAL_WORK) ? window.EP_GLOBAL_WORK : getServerFromCache('work');
    try{
      if(typeof db !== 'undefined' && db){
        var doc = await db.collection('settings').doc('global_db').get();
        if(doc.exists){
          var d = doc.data() || {};
          mat = Array.isArray(d.matDB) ? d.matDB : [];
          work = Array.isArray(d.workDB) ? d.workDB : [];
          if(d.cleanMode || d.resetAt) try{ localStorage.setItem('ep_db_clean_mode_v1','1'); }catch(_e){}
        } else if(isAdmin()){
          await db.collection('settings').doc('global_db').set({matDB:mat || [], workDB:work || [], createdAt:new Date().toISOString()}, {merge:true});
        }
      }
    }catch(e){ console.warn('EP V5 load server db failed', e); }
    setServerArrays(mat, work);
  }
  function isVisible(id){ var el = $(id); return !!(el && el.style && el.style.display && el.style.display !== 'none'); }
  function updateButtons(){
    var my = $('ep-scope-my-btn'), gl = $('ep-scope-global-btn'), st = $('ep-db-scope-status'), clean = $('ep-clean-status-line');
    if(my) my.className = getScope() === 'my' ? 'btn-success' : 'btn-info';
    if(gl) gl.className = getScope() === 'global' ? 'btn-success' : 'btn-info';
    if(my) my.textContent = '👤 Моя база';
    if(gl) gl.textContent = '🌍 База сервера';
    var matCount = getScope() === 'global' ? ((window.EP_GLOBAL_MAT || []).length) : ((window.EP_MY_MAT || []).length);
    var workCount = getScope() === 'global' ? ((window.EP_GLOBAL_WORK || []).length) : ((window.EP_MY_WORK || []).length);
    if(st) st.innerHTML = 'Сейчас выбрано: <b>' + label() + '</b>. Данные автообновлены при переключении.';
    if(clean) clean.textContent = 'Активная база: ' + label() + '. Материалы: ' + matCount + ', работы: ' + workCount + '.';
  }
  function rerenderOpenScreens(){
    syncActiveArrays();
    updateButtons();
    try{ if(typeof renderDbEditors === 'function') renderDbEditors(); }catch(e){}
    try{ if(window.renderDbEditors && window.renderDbEditors !== renderDbEditors) window.renderDbEditors(); }catch(e){}
    if(isVisible('matCatModal')){
      setTimeout(function(){ try{ if(typeof openMatCatalog === 'function') openMatCatalog(); }catch(e){} }, 20);
    }
    if(isVisible('workModal')){
      setTimeout(function(){ try{ if(typeof openWorkCatalog === 'function') openWorkCatalog(); }catch(e){} }, 20);
    }
    if(isVisible('globalDbModal') && typeof window.epRenderServerDbModal === 'function'){
      try{ window.epRenderServerDbModal(); }catch(e){}
    }
  }
  window.epRefreshActiveDbNow = async function(silent){
    var token = ++lastToken;
    if(refreshing) return;
    refreshing = true;
    try{
      if(!silent && typeof showLoader === 'function') showLoader('Обновляю ' + label() + '...', '📚');
      if(getScope() === 'global') await refreshServerFromServer();
      else await refreshMyFromServer();
      if(token === lastToken) rerenderOpenScreens();
    }finally{
      refreshing = false;
      if(!silent && typeof hideLoader === 'function') hideLoader();
    }
  };
  window.epSetDbScope = async function(s){
    setScope(s === 'global' ? 'global' : 'my');
    syncActiveArrays();
    updateButtons();
    if(typeof showLoader === 'function') showLoader('Обновляю ' + label() + '...', '📚');
    try{
      if(getScope() === 'global') await refreshServerFromServer();
      else await refreshMyFromServer();
      rerenderOpenScreens();
      toast('✅ Обновлено: ' + label());
    }catch(e){
      console.warn('EP V5 scope switch refresh failed', e);
      rerenderOpenScreens();
      toast('⚠️ Переключил на ' + label() + ', но сервер не ответил. Показан локальный кэш.');
    }finally{
      if(typeof hideLoader === 'function') hideLoader();
    }
  };
  document.addEventListener('DOMContentLoaded', function(){
    setTimeout(function(){ try{ syncActiveArrays(); updateButtons(); }catch(e){} }, 900);
  });
})();


/* =========================================================
 * SOURCE: block-14.js
 * AUTO TARGET: 04-database.js
 * SCORE: 171
 * HITS: db, base, matDB, workDB, материал, работ, global_db, user_db, import, category, subcategory, renderDbEditors
 * ========================================================= */

/*
 * Extracted from public/index.html
 * Original script block: 14
 * Original HTML lines: 7332-7820
 */

/* === EP DB IMPORT ANTI-FREEZE V6 2026-05-14 ===
   Fixes stuck loader and frozen review screen for large Excel/JSON imports.
   Strict DB sources remain: My DB / Server DB. Does not touch shield logic.
*/
(function(){
  var LS_SCOPE = 'ep_db_scope_v2';
  var LS_MY_MAT = 'user_db_mat_v31';
  var LS_MY_WORK = 'user_db_work_v31';
  var LS_SERVER_CACHE = 'ep_global_cache_force_v1';
  var PAGE_SIZE = 60;
  var oldTrigger = window.epTriggerDbFileImport;

  window.EP_DB_REVIEW_V6 = window.EP_DB_REVIEW_V6 || { type:'mat', items:[], source:'', page:0, selected:{}, editCache:{} };

  function $(id){ return document.getElementById(id); }
  function toast(t){ try{ if(typeof showToast === 'function') showToast(t); else console.log(t); }catch(e){ console.log(t); } }
  function uid(){ try{ return (window.appUser && appUser.uid) || ''; }catch(e){ return ''; } }
  function isAdmin(){ try{ return !!(window.appUser && appUser.role === 'admin'); }catch(e){ return false; } }
  function setScope(s){ try{ localStorage.setItem(LS_SCOPE, s === 'global' ? 'global' : 'my'); }catch(e){} }
  function getScope(){ try{ return localStorage.getItem(LS_SCOPE) === 'global' ? 'global' : 'my'; }catch(e){ return 'my'; } }
  function hardHideLoader(){
    try{ if(typeof hideLoader === 'function') hideLoader(); }catch(e){}
    try{ var l = $('global-loader'); if(l) l.classList.remove('show'); }catch(e){}
  }
  function showReadLoader(text, icon){ try{ if(typeof showLoader === 'function') showLoader(text || 'Читаю файл...', icon || '📥'); }catch(e){} }
  function esc(s){ return String(s == null ? '' : s).replace(/[&<>"']/g, function(m){ return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[m]; }); }
  function cleanText(v){ return String(v == null ? '' : v).replace(/\s+/g,' ').trim(); }
  function money(v){ var n = Number(String(v == null ? '' : v).replace(',', '.').replace(/[^\d.\-]/g,'')); return Number.isFinite(n) ? n : 0; }
  function norm(s){ return String(s || '').toLowerCase().replace(/ё/g,'е').replace(/×/g,'x').replace(/х/g,'x').replace(/[^a-zа-я0-9]+/g,' ').trim(); }
  function readArr(k){ try{ var a = JSON.parse(localStorage.getItem(k) || '[]'); return Array.isArray(a) ? a : []; }catch(e){ return []; } }
  function writeArr(k,a){ try{ if(typeof safeSet === 'function') safeSet(k, JSON.stringify(a || [])); else localStorage.setItem(k, JSON.stringify(a || [])); }catch(e){ try{ localStorage.setItem(k, JSON.stringify(a || [])); }catch(_e){} } }
  function readObj(k){ try{ var o = JSON.parse(localStorage.getItem(k) || '{}'); return o && typeof o === 'object' ? o : {}; }catch(e){ return {}; } }
  function writeObj(k,o){ try{ localStorage.setItem(k, JSON.stringify(o || {})); }catch(e){} }
  function groupOf(it){ return (it && (it.g || it.sc || it.subcategory || it.group)) || ''; }
  function clone(it){ var x = Object.assign({}, it || {}); delete x.__src; delete x.__encoded; return x; }
  function sig(type,it){ return type + '|' + norm([it && it.c, groupOf(it), it && it.n, it && it.u].filter(Boolean).join('|')); }
  function unique(arr,type){
    var seen = {}, out = [];
    (arr || []).forEach(function(raw){
      var it = clone(raw);
      if(!it.n) return;
      if(!it.id) it.id = (type === 'work' ? 'w' : 'm') + '_imp_' + Date.now() + '_' + Math.random().toString(36).slice(2,7);
      if(it.sc && !it.g) it.g = it.sc;
      if(it.g && !it.sc) it.sc = it.g;
      var k = sig(type,it);
      if(seen[k]) return;
      seen[k] = 1;
      out.push(it);
    });
    return out;
  }
  function getMy(type){
    var fromWin = type === 'work' ? window.EP_MY_WORK : window.EP_MY_MAT;
    if(Array.isArray(fromWin)) return fromWin.slice();
    return readArr(type === 'work' ? LS_MY_WORK : LS_MY_MAT);
  }
  function getServer(type){
    var fromWin = type === 'work' ? window.EP_GLOBAL_WORK : window.EP_GLOBAL_MAT;
    if(Array.isArray(fromWin)) return fromWin.slice();
    var c = readObj(LS_SERVER_CACHE);
    var a = type === 'work' ? c.workDB : c.matDB;
    return Array.isArray(a) ? a : [];
  }
  function syncMainArrays(target){
    try{
      var use = target || getScope();
      if(use === 'global'){
        window.matDB = getServer('mat');
        window.workDB = getServer('work');
      } else {
        window.matDB = getMy('mat');
        window.workDB = getMy('work');
      }
      try{ matDB = window.matDB; workDB = window.workDB; }catch(e){}
    }catch(e){}
  }
  function setMy(type,arr){
    arr = unique(arr, type);
    if(type === 'work') window.EP_MY_WORK = arr; else window.EP_MY_MAT = arr;
    writeArr(LS_MY_MAT, type === 'mat' ? arr : getMy('mat'));
    writeArr(LS_MY_WORK, type === 'work' ? arr : getMy('work'));
    try{ window.userMatDB = getMy('mat'); window.userWorkDB = getMy('work'); }catch(e){}
    syncMainArrays('my');
  }
  function setServer(type,arr){
    arr = unique(arr, type);
    if(type === 'work') window.EP_GLOBAL_WORK = arr; else window.EP_GLOBAL_MAT = arr;
    var mat = type === 'mat' ? arr : getServer('mat');
    var work = type === 'work' ? arr : getServer('work');
    try{
      window.EP_FORCE_GLOBAL = {matDB:mat, workDB:work};
      window.EP_ULTIMATE_DB_CACHE = {matDB:mat, workDB:work, ts:Date.now()};
      window.EP_GLOBAL_DB_VISIBLE_CACHE = {matDB:mat, workDB:work, ts:Date.now()};
    }catch(e){}
    writeObj(LS_SERVER_CACHE, {matDB:mat, workDB:work, ts:Date.now()});
    syncMainArrays('global');
  }
  function upsert(arr,type,it,mode){
    it = clone(it);
    if(!it.id) it.id = (type === 'work' ? 'w' : 'm') + '_imp_' + Date.now() + '_' + Math.random().toString(36).slice(2,7);
    if(it.sc && !it.g) it.g = it.sc;
    if(it.g && !it.sc) it.sc = it.g;
    var k = sig(type,it);
    var idx = (arr || []).findIndex(function(x){ return sig(type,x) === k || (it.id && String(x.id || '') === String(it.id)); });
    if(idx >= 0) arr[idx] = Object.assign({}, arr[idx], it, {id:arr[idx].id || it.id});
    else arr.push(it);
    return arr;
  }
  async function saveMyRemote(){
    try{
      if(typeof db !== 'undefined' && db && uid()){
        await db.collection('user_db').doc(uid()).set({
          uid: uid(),
          masterName: (window.appUser && (appUser.name || appUser.email)) || '',
          matDB: getMy('mat'),
          workDB: getMy('work'),
          created: true,
          updatedAt: new Date().toISOString()
        }, {merge:true});
        return true;
      }
    }catch(e){ console.warn('EP V6 save my import failed', e); }
    return false;
  }
  async function saveServerRemote(){
    try{
      if(typeof db !== 'undefined' && db && isAdmin()){
        await db.collection('settings').doc('global_db').set({
          matDB: getServer('mat'),
          workDB: getServer('work'),
          updatedAt: new Date().toISOString()
        }, {merge:true});
        return true;
      }
    }catch(e){ console.warn('EP V6 save server import failed', e); }
    return false;
  }
  function rerender(){
    try{ if(typeof renderDbEditors === 'function') renderDbEditors(); }catch(e){}
    try{ if(window.renderDbEditors && window.renderDbEditors !== renderDbEditors) window.renderDbEditors(); }catch(e){}
    try{ if(typeof window.epRefreshDbScopeUi === 'function') window.epRefreshDbScopeUi(); }catch(e){}
    setTimeout(function(){ try{ if(typeof renderDbEditors === 'function') renderDbEditors(); }catch(e){} },80);
    setTimeout(function(){ try{ if(typeof renderDbEditors === 'function') renderDbEditors(); }catch(e){} },300);
  }
  function fileText(file){ return new Promise(function(resolve,reject){ var r = new FileReader(); r.onload = function(){ resolve(String(r.result || '')); }; r.onerror = reject; r.readAsText(file); }); }
  function fileBuffer(file){ return new Promise(function(resolve,reject){ var r = new FileReader(); r.onload = function(){ resolve(r.result); }; r.onerror = reject; r.readAsArrayBuffer(file); }); }
  function csvRows(txt){
    var lines = String(txt || '').split(/\r?\n/).filter(function(x){ return x.trim(); });
    var delims = [';','\t',','];
    var delim = delims.map(function(d){ return {d:d, n:(lines[0] || '').split(d).length}; }).sort(function(a,b){ return b.n-a.n; })[0].d;
    return lines.map(function(line){
      var out = [], cur = '', q = false;
      for(var i=0;i<line.length;i++){
        var ch = line[i];
        if(ch === '"') { if(q && line[i+1] === '"'){ cur += '"'; i++; } else q = !q; }
        else if(ch === delim && !q){ out.push(cur); cur=''; }
        else cur += ch;
      }
      out.push(cur);
      return out;
    });
  }
  function inferCat(name,type){
    var s = norm(name);
    if(type === 'work'){
      if(/штроб|резк|алмаз/.test(s)) return 'Алмазная резка';
      if(/подрозет|коронк|сверл|бурен/.test(s)) return 'Высверливание подрозетников';
      if(/щит|автомат|узо|диф|сборк/.test(s)) return 'Щитовое';
      if(/демонтаж/.test(s)) return 'Демонтаж';
      if(/свет|люстр|бра|светильн|лента/.test(s)) return 'Освещение';
      return 'Работы';
    }
    if(/ввг|кабел|провод|пугв|utp|ftp|тв|tv|sat/.test(s)) return 'Кабель';
    if(/гофр|труб|пнд|пвх/.test(s)) return 'Трубы';
    if(/автомат|узо|диф|узм|уздп|реле|контактор|выключатель нагрузки/.test(s)) return 'Автоматика';
    if(/щит|бокс|корпус|din|дин|рейк|шина|гребен|клемм|ншви|маркиров/.test(s)) return 'Щитовое';
    if(/розет|выключател|рамк|механизм|терморег/.test(s)) return 'Чистовое';
    if(/подрозет|короб|клемм|скоб|хомут|дюбел|саморез|смес|алебастр|изолент/.test(s)) return 'Расходники';
    return 'Разное';
  }
  function inferSub(name,cat,type){
    var s = norm(name);
    if(type === 'work'){
      if(/бетон/.test(s)) return 'Бетон';
      if(/кирпич/.test(s)) return 'Кирпич';
      if(/монолит|панел/.test(s)) return 'Панель / монолит';
      return cat || 'Работы';
    }
    if(/c\s*\d+|с\s*\d+|автомат/.test(s)) return 'Автоматы';
    if(/диф/.test(s)) return 'ДИФы';
    if(/узо/.test(s)) return 'УЗО';
    if(/узм|реле напряж/.test(s)) return 'УЗМ / реле напряжения';
    if(/контактор/.test(s)) return 'Контакторы';
    if(/ввг/.test(s)) return 'ВВГ';
    if(/пугв/.test(s)) return 'ПуГВ';
    if(/utp|ftp/.test(s)) return 'UTP / FTP';
    if(/подрозет/.test(s)) return 'Подрозетники';
    if(/клемм|wago/.test(s)) return 'Клеммники';
    if(/гребен/.test(s)) return 'Гребёнки';
    if(/шин/.test(s)) return 'Шинки / клеммники';
    if(/din|дин|рейк/.test(s)) return 'DIN-рейки / ограничители';
    if(/щит|бокс|корпус/.test(s)) return 'Корпуса';
    return 'Разное';
  }
  function normItem(raw,type,idx){
    raw = raw || {};
    var n = cleanText(raw.n || raw.name || raw.title || raw.имя || raw.наименование || raw['Наименование'] || raw['Название'] || raw['Имя']);
    if(!n) return null;
    var c = cleanText(raw.c || raw.category || raw.cat || raw.категория || raw['Категория']) || inferCat(n,type);
    var sc = cleanText(raw.sc || raw.g || raw.subcategory || raw.group || raw.подкатегория || raw['Подкатегория'] || raw['Группа']) || inferSub(n,c,type);
    var p = money(raw.p != null ? raw.p : (raw.price != null ? raw.price : (raw.цена != null ? raw.цена : raw['Цена'])));
    var u = cleanText(raw.u || raw.unit || raw.ед || raw['Ед.'] || raw['Единица'] || raw['Ед. изм.']) || 'шт';
    return { id: raw.id || ((type === 'work' ? 'w' : 'm') + '_imp_' + Date.now() + '_' + idx), n:n, c:c, sc:sc, g:sc, p:p, u:u };
  }
  function rowsToItems(rows,type){
    rows = rows || [];
    var header = null, currentCat = '', currentSub = '', out = [];
    function cell(row,i){ return cleanText((row || [])[i]); }
    rows.forEach(function(row,ri){
      row = (row || []).map(function(v){ return cleanText(v); });
      var non = row.filter(Boolean);
      if(!non.length) return;
      var joined = norm(non.join(' '));
      if(/наимен|назван|имя|цена|стоим|ед/.test(joined) && !header){
        header = {};
        row.forEach(function(v,i){ var s = norm(v); if(/наимен|назван|имя|позиция|товар|работ/.test(s)) header.name=i; if(/категор/.test(s) && header.cat == null) header.cat=i; if(/подкат|группа/.test(s)) header.sub=i; if(/цена|стоим|прайс/.test(s)) header.price=i; if(/ед|изм/.test(s)) header.unit=i; });
        return;
      }
      var priceIdx = -1, unitIdx = -1;
      row.forEach(function(v,i){ if(priceIdx < 0 && money(v) > 0 && /^[-\d\s.,]+/.test(v)) priceIdx = i; if(unitIdx < 0 && /^(шт|м|м\.п\.?|пог\.м|уп|упак|компл|кг|л|рул|бухта)$/i.test(v)) unitIdx = i; });
      if(header){
        var n = cell(row, header.name);
        if(n){
          out.push(normItem({n:n, c:cell(row, header.cat), sc:cell(row, header.sub), p:cell(row, header.price), u:cell(row, header.unit)}, type, out.length));
        }
        return;
      }
      if(priceIdx < 0 && non.length <= 2){
        var title = non.join(' ');
        if(type === 'work' || /работ|монтаж|штроб|резк|сверл|демонтаж/i.test(title)) { currentCat = title; currentSub = ''; }
        else if(!currentCat) currentCat = title; else currentSub = title;
        return;
      }
      var candidates = row.map(function(v,i){ return {v:v,i:i}; }).filter(function(x){ return x.v && x.i !== priceIdx && x.i !== unitIdx && !/^[-\d\s.,]+$/.test(x.v); });
      if(!candidates.length) return;
      candidates.sort(function(a,b){ return b.v.length - a.v.length; });
      var name = candidates[0].v;
      if(name.length < 3) return;
      out.push(normItem({n:name, c:currentCat || inferCat(name,type), sc:currentSub || inferSub(name,currentCat,type), p:priceIdx >= 0 ? row[priceIdx] : 0, u:unitIdx >= 0 ? row[unitIdx] : 'шт'}, type, out.length));
    });
    return out.filter(Boolean);
  }
  function jsonToItems(raw,type){
    if(raw && raw.matDB && type === 'mat') raw = raw.matDB;
    else if(raw && raw.workDB && type === 'work') raw = raw.workDB;
    else if(raw && Array.isArray(raw.items)) raw = raw.items;
    else if(raw && raw.data && Array.isArray(raw.data)) raw = raw.data;
    else if(raw && typeof raw === 'object' && !Array.isArray(raw)) raw = Object.keys(raw).map(function(k){ return raw[k]; });
    if(!Array.isArray(raw)) raw = [];
    return raw.map(function(x,i){ return normItem(x,type,i); }).filter(Boolean);
  }
  function selectedCount(){
    var st = window.EP_DB_REVIEW_V6;
    return (st.items || []).reduce(function(n,_,i){ return n + (st.selected[i] !== false ? 1 : 0); },0);
  }
  function saveVisibleEdits(){
    var st = window.EP_DB_REVIEW_V6;
    var start = (st.page || 0) * PAGE_SIZE;
    var end = Math.min(start + PAGE_SIZE, st.items.length);
    for(var i=start;i<end;i++){
      var item = st.items[i] || {};
      var ch = $('ep-db-check-' + i);
      if(ch) st.selected[i] = !!ch.checked;
      var n = $('ep-db-name-' + i), c = $('ep-db-cat-' + i), sc = $('ep-db-subcat-' + i), p = $('ep-db-price-' + i), u = $('ep-db-unit-' + i);
      if(n || c || sc || p || u){
        st.editCache[i] = {
          n: n ? n.value : item.n,
          c: c ? c.value : item.c,
          sc: sc ? sc.value : (item.sc || item.g || 'Разное'),
          p: p ? p.value : item.p,
          u: u ? u.value : item.u
        };
      }
    }
  }
  function renderReviewPage(){
    var st = window.EP_DB_REVIEW_V6;
    window.EP_DB_REVIEW = { type: st.type, items: st.items, source: st.source };
    var title = $('ep-db-ai-review-title');
    if(title) title.innerText = 'Импорт ' + (st.type === 'work' ? 'работ' : 'материалов') + ': ' + (st.source || 'файл');
    var list = $('ep-db-ai-review-list');
    if(!list) return;
    var total = st.items.length;
    if(!total){
      list.innerHTML = '<div style="padding:12px;color:var(--danger);font-weight:800;">Позиции не найдены. Проверьте файл или попробуйте импортировать другой формат.</div>';
      return;
    }
    var pages = Math.max(1, Math.ceil(total / PAGE_SIZE));
    st.page = Math.max(0, Math.min(st.page || 0, pages - 1));
    var start = st.page * PAGE_SIZE;
    var end = Math.min(start + PAGE_SIZE, total);
    var html = '<div style="position:sticky;top:0;z-index:2;background:var(--card-bg,rgba(255,255,255,.95));padding:8px;border-radius:12px;margin-bottom:8px;border:1px solid var(--border);">' +
      '<b>Найдено: ' + total + '</b> • выбрано: <b id="ep-v6-selected-count">' + selectedCount() + '</b><br>' +
      '<span style="font-size:11px;color:var(--gray);">Показаны строки ' + (start+1) + '–' + end + ' из ' + total + '. Большой файл не грузится весь на экран, поэтому телефон не зависает.</span>' +
      '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:8px;">' +
      '<button type="button" class="btn-info" onclick="epReviewPageV6(-1)" ' + (st.page<=0?'disabled':'') + '>← Назад</button>' +
      '<button type="button" class="btn-info" onclick="epReviewPageV6(1)" ' + (st.page>=pages-1?'disabled':'') + '>Вперёд →</button>' +
      '</div></div>';
    for(var i=start;i<end;i++){
      var it = st.items[i] || {};
      var ed = st.editCache[i] || it;
      html += '<div class="ep-db-review-row">' +
        '<input type="checkbox" id="ep-db-check-' + i + '" ' + (st.selected[i] !== false ? 'checked' : '') + ' onchange="epReviewToggleV6(' + i + ', this.checked)">' +
        '<div class="ep-db-review-fields">' +
          '<div><label>Имя</label><input id="ep-db-name-' + i + '" value="' + esc(ed.n || '') + '" placeholder="Имя / наименование"></div>' +
          '<div class="ep-db-review-2col">' +
            '<div><label>Категория</label><input id="ep-db-cat-' + i + '" value="' + esc(ed.c || 'Разное') + '" placeholder="Категория"></div>' +
            '<div><label class="ep-db-subcat-label">Подкатегория</label><input id="ep-db-subcat-' + i + '" value="' + esc(ed.sc || ed.g || 'Разное') + '" placeholder="Подкатегория"></div>' +
          '</div>' +
          '<div class="ep-db-review-2col">' +
            '<div><label>Цена за единицу</label><input id="ep-db-price-' + i + '" type="number" step="0.01" value="' + (Number(ed.p)||0) + '" placeholder="Цена"></div>' +
            '<div><label>Единица</label><input id="ep-db-unit-' + i + '" value="' + esc(ed.u || 'шт') + '" placeholder="шт / м / упак"></div>' +
          '</div>' +
        '</div></div>';
    }
    list.innerHTML = html;
    setTimeout(hardHideLoader, 0);
  }
  window.epReviewToggleV6 = function(i,val){ window.EP_DB_REVIEW_V6.selected[i] = !!val; var el = $('ep-v6-selected-count'); if(el) el.textContent = selectedCount(); };
  window.epReviewPageV6 = function(delta){ saveVisibleEdits(); window.EP_DB_REVIEW_V6.page += delta; renderReviewPage(); };
  window.epReviewCheckAll = function(checked){
    var st = window.EP_DB_REVIEW_V6;
    (st.items || []).forEach(function(_,i){ st.selected[i] = !!checked; });
    renderReviewPage();
  };
  function showReview(items,type,source){
    hardHideLoader();
    items = unique((items || []).filter(Boolean), type);
    var selected = {};
    items.forEach(function(_,i){ selected[i] = true; });
    window.EP_DB_REVIEW_V6 = { type:type, items:items, source:source || '', page:0, selected:selected, editCache:{} };
    window.EP_DB_REVIEW = { type:type, items:items, source:source || '' };
    renderReviewPage();
    try{ if(typeof openModal === 'function') openModal('ep-db-ai-review-modal'); }catch(e){ var m=$('ep-db-ai-review-modal'); if(m) m.style.display='flex'; }
    setTimeout(hardHideLoader, 20);
  }
  async function aiFromImage(file,type){
    if(typeof window.epAskAI !== 'function') throw new Error('ИИ не подключён');
    var dataUrl = await new Promise(function(resolve,reject){ var r = new FileReader(); r.onload=function(){resolve(r.result);}; r.onerror=reject; r.readAsDataURL(file); });
    showReadLoader('ИИ читает изображение...', '👁️');
    var prompt = 'Распознай таблицу для базы электрика. Верни строго JSON массив объектов [{"n":"Имя позиции","c":"Категория","sc":"Подкатегория","p":123,"u":"шт"}]. Если цены нет p=0. Без текста вокруг.';
    var ans = await window.epAskAI(prompt, { imageDataUrl:dataUrl, imageDetail:'high', maxTokens:9000 });
    var arr = [];
    try{ var m = String(ans || '').match(/\[[\s\S]*\]/); arr = JSON.parse(m ? m[0] : ans); }catch(e){ arr = []; }
    return jsonToItems(arr,type);
  }
  async function aiFromText(txt,type){
    if(typeof window.epAskAI !== 'function') throw new Error('ИИ не подключён');
    showReadLoader('ИИ структурирует базу...', '🤖');
    var prompt = 'Приведи данные к базе электрика. Верни строго JSON массив объектов [{"n":"Имя позиции","c":"Категория","sc":"Подкатегория","p":123,"u":"шт"}]. Данные: ' + String(txt || '').slice(0,90000);
    var ans = await window.epAskAI(prompt, { maxTokens:8000 });
    var arr = [];
    try{ var m = String(ans || '').match(/\[[\s\S]*\]/); arr = JSON.parse(m ? m[0] : ans); }catch(e){ arr = []; }
    return jsonToItems(arr,type);
  }
  async function readDbFileV6(file,type){
    var safety = setTimeout(hardHideLoader, 25000);
    showReadLoader('Читаю файл...', '📥');
    try{
      var name = file.name || '';
      var lower = name.toLowerCase();
      var items = [];
      if(file.type && file.type.indexOf('image/') === 0){
        items = await aiFromImage(file,type);
      } else if(/\.json$/i.test(lower)){
        var txt = await fileText(file);
        items = jsonToItems(JSON.parse(txt), type);
      } else if(/\.(xlsx|xls)$/i.test(lower)){
        if(!window.XLSX) throw new Error('Библиотека XLSX не загрузилась. Сохраните файл как CSV или JSON.');
        var ab = await fileBuffer(file);
        var wb = XLSX.read(ab, {type:'array'});
        var rows = [];
        wb.SheetNames.forEach(function(sh){
          var ws = wb.Sheets[sh];
          rows = rows.concat(XLSX.utils.sheet_to_json(ws, {header:1, defval:''}));
        });
        items = rowsToItems(rows,type);
      } else if(/\.csv$/i.test(lower)){
        items = rowsToItems(csvRows(await fileText(file)), type);
      } else {
        var raw = await fileText(file);
        items = rowsToItems(csvRows(raw), type);
        if(!items.length) items = await aiFromText(raw,type);
      }
      clearTimeout(safety);
      hardHideLoader();
      showReview(items,type,name);
    }catch(e){
      clearTimeout(safety);
      hardHideLoader();
      toast('❌ ' + (e.message || 'Ошибка импорта'));
      console.error('EP V6 import error', e);
    }
  }
  window.epTriggerDbFileImport = function(type){
    type = type === 'work' ? 'work' : 'mat';
    if(!isAdmin()){
      setScope('my');
      syncMainArrays('my');
      rerender();
      toast('Импорт мастера будет сохранён в 👤 Моя база');
    }
    var input = $('ep-db-file-input');
    if(!input){ if(typeof oldTrigger === 'function') return oldTrigger(type); return; }
    input.value = '';
    input.onchange = function(e){ var file = e.target.files && e.target.files[0]; if(file) readDbFileV6(file,type); };
    input.click();
  };
  window.epRunTextImport = async function(){
    var text = (($('ep-text-import-value') || {}).value) || '';
    var type = ((window.EP_DB_REVIEW || {}).type === 'work') ? 'work' : 'mat';
    try{ if(typeof closeModal === 'function') closeModal('ep-text-import-modal'); }catch(e){}
    try{
      showReadLoader('Читаю текст...', '📝');
      var items = rowsToItems(csvRows(text), type);
      if(!items.length) items = await aiFromText(text,type);
      hardHideLoader();
      showReview(items,type,'текст');
    }catch(e){ hardHideLoader(); toast('❌ ' + (e.message || 'Ошибка импорта текста')); }
  };
  function collectReviewed(){
    saveVisibleEdits();
    var st = window.EP_DB_REVIEW_V6;
    var type = st.type === 'work' ? 'work' : 'mat';
    var out = [];
    (st.items || []).forEach(function(base,i){
      if(st.selected[i] === false) return;
      var ed = st.editCache[i] || base || {};
      var it = normItem({
        id: base.id,
        n: ed.n || base.n,
        c: ed.c || base.c,
        sc: ed.sc || ed.g || base.sc || base.g,
        p: ed.p != null ? ed.p : base.p,
        u: ed.u || base.u
      }, type, i);
      if(it){ try{ if(typeof window.epAutoGroupItem === 'function') it = window.epAutoGroupItem(type,it); }catch(e){} out.push(it); }
    });
    return {type:type, items:out};
  }
  window.epApplyReviewedDbItems = async function(mode){
    var data = collectReviewed();
    var type = data.type;
    var items = data.items;
    if(!items.length) return toast('Нет выбранных позиций');
    showReadLoader('Сохраняю базу...', '💾');
    try{
      var target = getScope();
      if(!isAdmin()){
        target = 'my';
        setScope('my');
      }
      if(target === 'global'){
        var g = getServer(type);
        items.forEach(function(it){ g = upsert(g,type,it,mode); });
        setServer(type,g);
        await saveServerRemote();
        toast('✅ Импорт добавлен в базу сервера: ' + items.length + ' поз.');
      } else {
        var a = getMy(type);
        items.forEach(function(it){ a = upsert(a,type,it,mode); });
        setMy(type,a);
        var saved = await saveMyRemote();
        syncMainArrays('my');
        toast('✅ Импорт сохранён в моей базе: ' + items.length + ' поз.' + (saved ? '' : ' Сервер не подтвердил сохранение, но на этом телефоне база отображается.'));
      }
      try{ if(typeof closeModal === 'function') closeModal('ep-db-ai-review-modal'); }catch(e){}
      rerender();
    }catch(e){
      toast('❌ ' + (e.message || 'Ошибка сохранения'));
      console.error('EP V6 apply error', e);
    }finally{
      hardHideLoader();
    }
  };
  document.addEventListener('DOMContentLoaded', function(){ setTimeout(hardHideLoader, 1200); });
})();


/* =========================================================
 * SOURCE: block-15.js
 * AUTO TARGET: 04-database.js
 * SCORE: 275
 * HITS: db, base, matDB, workDB, материал, работ, global_db, user_db, import, export, category, subcategory, renderDbEditors, epSetDbScope
 * ========================================================= */

/*
 * Extracted from public/index.html
 * Original script block: 15
 * Original HTML lines: 7825-8085
 */

/* === EP DB ROLES + PROGRESS V7 2026-05-14 ===
   Surgical DB UI: strict My DB / Server DB, server edits only by admin,
   scope-specific import/export, progress indicator, reload active DB after operations.
   Shield logic is not touched.
*/
(function(){
  var LS_SCOPE='ep_db_scope_v2';
  var LS_MY_MAT='user_db_mat_v31';
  var LS_MY_WORK='user_db_work_v31';
  var LS_SERVER_CACHE='ep_global_cache_force_v1';
  var PAGE_SIZE=60;
  var oldRender=window.renderDbEditors;
  var oldSetScope=window.epSetDbScope;

  function $(id){ return document.getElementById(id); }
  function toast(t){ try{ if(typeof showToast==='function') showToast(t); else console.log(t); }catch(e){ console.log(t); } }
  function esc(s){ return String(s==null?'':s).replace(/[&<>"']/g,function(m){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m];}); }
  function norm(s){ return String(s||'').toLowerCase().replace(/ё/g,'е').replace(/×/g,'x').replace(/х/g,'x').replace(/[^a-zа-я0-9]+/g,' ').trim(); }
  function cleanText(v){ return String(v==null?'':v).replace(/\s+/g,' ').trim(); }
  function money(v){ var n=Number(String(v==null?'':v).replace(',','.').replace(/[^\d.\-]/g,'')); return Number.isFinite(n)?n:0; }
  function uid(){ try{return (window.appUser&&appUser.uid)||'';}catch(e){return '';} }
  function isAdmin(){ try{return !!(window.appUser && appUser.role==='admin');}catch(e){return false;} }
  function scope(){ try{return localStorage.getItem(LS_SCOPE)==='global'?'global':'my';}catch(e){return 'my';} }
  function setScope(s){ try{localStorage.setItem(LS_SCOPE, s==='global'?'global':'my');}catch(e){} }
  function label(){ return scope()==='global'?'🌍 База сервера':'👤 Моя база'; }
  function canEditActive(){ return scope()==='my' || (scope()==='global' && isAdmin()); }
  function readArr(k){ try{var a=JSON.parse(localStorage.getItem(k)||'[]');return Array.isArray(a)?a:[];}catch(e){return [];} }
  function writeArr(k,a){ try{ if(typeof safeSet==='function') safeSet(k,JSON.stringify(a||[])); else localStorage.setItem(k,JSON.stringify(a||[])); }catch(e){ try{localStorage.setItem(k,JSON.stringify(a||[]));}catch(_e){} } }
  function readObj(k){ try{var o=JSON.parse(localStorage.getItem(k)||'{}');return o&&typeof o==='object'?o:{};}catch(e){return {};} }
  function writeObj(k,o){ try{localStorage.setItem(k,JSON.stringify(o||{}));}catch(e){} }
  function groupOf(it){ return (it&&(it.g||it.sc||it.subcategory||it.group))||''; }
  function clone(it){ var x=Object.assign({},it||{}); delete x.__src; delete x.__encoded; return x; }
  function sig(type,it){ return type+'|'+norm([it&&it.c,groupOf(it),it&&it.n,it&&it.u].filter(Boolean).join('|')); }
  function unique(arr,type){ var seen={},out=[]; (arr||[]).forEach(function(raw){ var it=clone(raw); if(!it.n)return; if(!it.id) it.id=(type==='work'?'w':'m')+'_v7_'+Date.now()+'_'+Math.random().toString(36).slice(2,7); if(it.sc&&!it.g)it.g=it.sc; if(it.g&&!it.sc)it.sc=it.g; var k=sig(type,it); if(seen[k])return; seen[k]=1; out.push(it); }); return out; }
  function getMy(type){ var w=type==='work'?window.EP_MY_WORK:window.EP_MY_MAT; return Array.isArray(w)?w.slice():readArr(type==='work'?LS_MY_WORK:LS_MY_MAT); }
  function getServer(type){ var w=type==='work'?window.EP_GLOBAL_WORK:window.EP_GLOBAL_MAT; if(Array.isArray(w))return w.slice(); var c=readObj(LS_SERVER_CACHE); var a=type==='work'?c.workDB:c.matDB; return Array.isArray(a)?a:[]; }
  function active(type){ return scope()==='global'?getServer(type):getMy(type); }
  function setMy(type,arr){ arr=unique(arr,type); if(type==='work') window.EP_MY_WORK=arr; else window.EP_MY_MAT=arr; writeArr(type==='work'?LS_MY_WORK:LS_MY_MAT,arr); try{window.userMatDB=getMy('mat');window.userWorkDB=getMy('work');}catch(e){} syncMain('my'); }
  function setServer(type,arr){ arr=unique(arr,type); if(type==='work') window.EP_GLOBAL_WORK=arr; else window.EP_GLOBAL_MAT=arr; var mat=type==='mat'?arr:getServer('mat'); var work=type==='work'?arr:getServer('work'); try{window.EP_FORCE_GLOBAL={matDB:mat,workDB:work};window.EP_ULTIMATE_DB_CACHE={matDB:mat,workDB:work,ts:Date.now()};window.EP_GLOBAL_DB_VISIBLE_CACHE={matDB:mat,workDB:work,ts:Date.now()};}catch(e){} writeObj(LS_SERVER_CACHE,{matDB:mat,workDB:work,ts:Date.now()}); syncMain('global'); }
  function syncMain(target){ try{ var use=target||scope(); window.matDB=(use==='global'?getServer('mat'):getMy('mat')); window.workDB=(use==='global'?getServer('work'):getMy('work')); try{matDB=window.matDB;workDB=window.workDB;}catch(e){} }catch(e){} }
  function upsert(arr,type,it,replace){ it=clone(it); if(!it.id) it.id=(type==='work'?'w':'m')+'_v7_'+Date.now()+'_'+Math.random().toString(36).slice(2,7); if(it.sc&&!it.g)it.g=it.sc; if(it.g&&!it.sc)it.sc=it.g; var k=sig(type,it); var idx=(arr||[]).findIndex(function(x){return sig(type,x)===k || (it.id&&String(x.id||'')===String(it.id));}); if(idx>=0) arr[idx]=replace?Object.assign({},arr[idx],it,{id:arr[idx].id||it.id}):Object.assign({},arr[idx],it,{id:arr[idx].id||it.id}); else arr.push(it); return arr; }

  function ensureProgress(){
    if($('ep-v7-progress')) return;
    var css=document.createElement('style'); css.id='ep-v7-style'; css.textContent='\
#ep-v7-progress{position:fixed;inset:0;z-index:99999;background:rgba(15,23,42,.62);display:none;align-items:center;justify-content:center;padding:18px;}\
#ep-v7-progress .box{width:min(460px,94vw);border-radius:20px;background:var(--card-bg,#fff);box-shadow:0 24px 70px rgba(0,0,0,.35);padding:18px;border:1px solid var(--border,#e5e7eb);}\
#ep-v7-progress .title{font-weight:900;color:var(--primary,#4f46e5);font-size:17px;margin-bottom:8px;}\
#ep-v7-progress .bar{height:16px;background:rgba(148,163,184,.25);border-radius:999px;overflow:hidden;border:1px solid rgba(148,163,184,.35);}\
#ep-v7-progress .fill{height:100%;width:0%;background:linear-gradient(90deg,#2563eb,#10b981);transition:width .18s ease;}\
#ep-v7-progress .txt{font-size:12px;color:var(--gray,#64748b);font-weight:800;margin-top:8px;}\
.ep-v7-panel{border:2px solid var(--primary);border-radius:16px;padding:12px;margin:10px 0 15px;background:rgba(79,70,229,.06)}\
.ep-v7-actions{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:10px}.ep-v7-actions button{margin:0;padding:10px}.ep-v7-note{font-size:11px;color:var(--gray);font-weight:800;margin-top:8px}.ep-v7-locked{opacity:.55}.ep-v7-row{display:flex;gap:8px;align-items:flex-start}.ep-v7-row input[type=number]:disabled{opacity:.55;background:rgba(148,163,184,.15)}'; document.head.appendChild(css);
    var d=document.createElement('div'); d.id='ep-v7-progress'; d.innerHTML='<div class="box"><div class="title" id="ep-v7-progress-title">Выполняю...</div><div class="bar"><div class="fill" id="ep-v7-progress-fill"></div></div><div class="txt" id="ep-v7-progress-txt">0%</div></div>'; document.body.appendChild(d);
  }
  function showProgress(title,pct,txt){ ensureProgress(); var p=$('ep-v7-progress'), f=$('ep-v7-progress-fill'), t=$('ep-v7-progress-title'), x=$('ep-v7-progress-txt'); if(p)p.style.display='flex'; if(t)t.textContent=title||'Выполняю...'; if(f)f.style.width=Math.max(0,Math.min(100,Math.round(pct||0)))+'%'; if(x)x.textContent=(txt||'')+' '+Math.max(0,Math.min(100,Math.round(pct||0)))+'%'; try{ if(typeof hideLoader==='function') hideLoader(); }catch(e){} }
  function hideProgress(){ var p=$('ep-v7-progress'); if(p)p.style.display='none'; }

  async function saveMyRemote(onp){
    try{
      if(typeof db!=='undefined'&&db&&uid()){
        if(onp)onp(70,'Запись в user_db');
        await db.collection('user_db').doc(uid()).set({uid:uid(),masterName:(window.appUser&&(appUser.name||appUser.email))||'',matDB:getMy('mat'),workDB:getMy('work'),created:true,updatedAt:new Date().toISOString()},{merge:true});
        if(onp)onp(92,'Личная база записана');
        return true;
      }
    }catch(e){ console.warn('EP V7 save my db failed',e); }
    return false;
  }
  async function saveServerRemote(onp){
    try{
      if(typeof db!=='undefined'&&db&&isAdmin()){
        if(onp)onp(70,'Запись в settings/global_db');
        await db.collection('settings').doc('global_db').set({matDB:getServer('mat'),workDB:getServer('work'),updatedAt:new Date().toISOString()},{merge:true});
        if(onp)onp(92,'База сервера записана');
        return true;
      }
    }catch(e){ console.warn('EP V7 save server db failed',e); }
    return false;
  }
  async function sendProposal(type,items,reason,onp){
    try{
      if(onp)onp(72,'Отправка заявки админу');
      if(typeof window.epSendServerProposal==='function'){ await window.epSendServerProposal(type,items,reason||'server_import_request'); return true; }
      if(typeof db!=='undefined'&&db){ await db.collection('db_proposals').add({type:type,items:items,reason:reason||'server_import_request',uid:uid(),userEmail:(window.appUser&&appUser.email)||'',createdAt:new Date().toISOString(),status:'new'}); return true; }
    }catch(e){ console.warn('EP V7 proposal failed',e); }
    return false;
  }
  async function reloadActiveDb(){
    try{ syncMain(scope()); if(typeof window.epRefreshActiveDbNow==='function') await window.epRefreshActiveDbNow(true); }catch(e){ console.warn('EP V7 reload active db failed',e); }
    try{ syncMain(scope()); renderDbEditors(); }catch(e){}
    try{ if(typeof openMatCatalog==='function' && $('matCatModal') && $('matCatModal').style.display!=='none') openMatCatalog(); }catch(e){}
    try{ if(typeof openWorkCatalog==='function' && $('workModal') && $('workModal').style.display!=='none') openWorkCatalog(); }catch(e){}
  }

  function ensurePanel(){
    var toolbar=$('ep-db-scope-toolbar'); if(!toolbar) return null;
    var p=$('ep-v7-db-panel');
    if(!p){ p=document.createElement('div'); p.id='ep-v7-db-panel'; p.className='ep-v7-panel'; toolbar.parentNode.insertBefore(p, toolbar.nextSibling); }
    return p;
  }
  function renderPanel(){
    var p=ensurePanel(); if(!p) return;
    var s=scope(), admin=isAdmin(), my=s==='my';
    var title=my?'👤 Моя база данных':'🌍 База сервера';
    var matCount=active('mat').length, workCount=active('work').length;
    var note=my
      ? 'Это личная база текущего мастера. Импорт, экспорт, цены и замена позиций меняют только эту базу.'
      : (admin?'Вы админ: можно импортировать, заменять, редактировать цены и сохранять базу сервера.':'Просмотр базы сервера. Мастер не меняет сервер напрямую: можно экспортировать, взять позицию себе или отправить импорт заявкой админу.');
    var html='<div style="font-weight:900;color:var(--primary);font-size:15px;">'+title+'</div>'+
      '<div class="ep-v7-note">'+note+'<br>Материалы: <b>'+matCount+'</b>, работы: <b>'+workCount+'</b>. Вперемешку базы не считаются.</div>'+
      '<div class="ep-v7-actions">';
    if(my || admin){
      html+='<button class="btn-info" onclick="epTriggerDbFileImport(\'mat\')">📥 Импорт материалов</button>'+
            '<button class="btn-work" onclick="epTriggerDbFileImport(\'work\')">📥 Импорт работ</button>'+
            '<button class="btn-vendor" onclick="epOpenTextImport && epOpenTextImport(\'mat\')">📝 Материалы текстом</button>'+
            '<button class="btn-vendor" onclick="epOpenTextImport && epOpenTextImport(\'work\')">📝 Работы текстом</button>';
    } else {
      html+='<button class="btn-info" onclick="epTriggerServerProposalImportV7(\'mat\')">📨 Материалы заявкой админу</button>'+
            '<button class="btn-work" onclick="epTriggerServerProposalImportV7(\'work\')">📨 Работы заявкой админу</button>'+
            '<button class="btn-vendor" onclick="epOpenTextImportServerProposalV7(\'mat\')">📝 Материалы заявкой</button>'+
            '<button class="btn-vendor" onclick="epOpenTextImportServerProposalV7(\'work\')">📝 Работы заявкой</button>';
    }
    html+='<button class="btn-success" onclick="epExportActiveDb()">📤 Экспорт этой базы</button>'+
          '<button class="btn-info" onclick="epReloadActiveDbV7()">🔄 Обновить / перезагрузить</button>';
    if(canEditActive()) html+='<button class="btn-primary" onclick="epSaveActiveDbV7()">💾 Сохранить базу</button>';
    if(my) html+='<button class="btn-danger" onclick="epOpenDbFactoryResetModal && epOpenDbFactoryResetModal()">🧹 Очистка / сброс</button>';
    else if(admin) html+='<button class="btn-danger" onclick="epOpenDbFactoryResetModal && epOpenDbFactoryResetModal()">🧹 Очистка сервера</button>';
    html+='</div>';
    if(!my && !admin) html+='<div class="ep-v7-note">Редактирование, сохранение, замена и цены сервера заблокированы для мастера.</div>';
    p.innerHTML=html;
  }
  function tuneStaticBlocks(){
    renderPanel();
    var my=$('ep-scope-my-btn'), gl=$('ep-scope-global-btn'), st=$('ep-db-scope-status');
    if(my){ my.className=scope()==='my'?'btn-success':'btn-info'; my.textContent='👤 Моя база данных'; }
    if(gl){ gl.className=scope()==='global'?'btn-success':'btn-info'; gl.textContent='🌍 База сервера'; }
    if(st) st.innerHTML='Главный переключатель: <b>'+label()+'</b>. Отображение и расчёт идут только из выбранного источника.';
    var old=$('ep-db-ai-tools'); if(old) old.style.display='none';
    var clean=$('ep-clean-status-line'); if(clean) clean.textContent='Активная база: '+label()+'. Материалы: '+active('mat').length+', работы: '+active('work').length+'.';
    var addBtn=document.querySelector('#settModal button[onclick="addDbItem()"]');
    var addBlock=null;
    if(addBtn){ var x=addBtn.parentElement; while(x&&x.id!=='settModal'){ if((x.querySelector&&x.querySelector('#db-new-cat'))){ addBlock=x; break; } x=x.parentElement; } }
    if(addBlock){ addBlock.style.display=canEditActive()?'block':'none'; }
    if(addBtn){ addBtn.textContent=scope()==='global'?' + Добавить в базу сервера':' + Добавить в мою базу'; }
  }

  function editorTop(type){
    var title=type==='work'?'работ':'материалов';
    var s=scope(), admin=isAdmin(), editable=canEditActive();
    var hint=s==='my'?'Редактируется личная база мастера.':(admin?'Редактируется база сервера.':'Сервер открыт только для просмотра и копирования в мою базу.');
    var html='<div style="border:1px solid var(--primary);border-radius:14px;padding:10px;margin:0 0 12px;background:rgba(79,70,229,.05);">'+
      '<div style="font-weight:900;color:var(--primary);">'+label()+' — '+title+'</div>'+
      '<div style="font-size:11px;color:var(--gray);font-weight:800;margin-top:4px;">'+hint+' Позиций: '+active(type).length+'.</div>'+
      '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:8px;">'+
      '<button class="'+(s==='my'?'btn-success':'btn-info')+'" style="margin:0;padding:10px;" onclick="epSetDbScope(\'my\')">👤 Моя база</button>'+
      '<button class="'+(s==='global'?'btn-success':'btn-info')+'" style="margin:0;padding:10px;" onclick="epSetDbScope(\'global\')">🌍 База сервера</button></div>';
    if(editable){ html+='<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:8px;"><button class="btn-success" style="margin:0;padding:9px;" onclick="epSaveActiveDbV7()">💾 Сохранить</button><button class="btn-danger" style="margin:0;padding:9px;" onclick="epDeleteSelectedActiveV7()">🗑 Удалить выбранные</button></div>'; }
    if(s==='global'&&!admin){ html+='<div class="ep-v7-note">Серверные цены и позиции мастер не меняет. Для своей сметы нажми «В мою».</div>'; }
    return html+'</div>';
  }
  function editorRow(type,it){
    var s=scope(), editable=canEditActive(), admin=isAdmin();
    var item=encodeURIComponent(JSON.stringify(it||{}));
    var sub=(groupOf(it)?groupOf(it)+' • ':'')+(Number(it.p)||0)+' ₽ / '+(it.u||'шт');
    var check=editable?'<input type="checkbox" class="ep-v7-select" data-type="'+type+'" data-id="'+esc(String(it.id||''))+'" style="width:20px;height:20px;accent-color:#EF4444;margin:4px 3px 0 0;">':'';
    var price='<input type="number" '+(editable?'':'disabled')+' value="'+(Number(it.p)||0)+'" data-id="'+esc(String(it.id||''))+'" data-type="'+type+'" onchange="epChangePriceV7(this.dataset.type,this.dataset.id,this.value)" style="width:76px;margin:0;padding:4px;text-align:center;">';
    var copy=(s==='global'&&!admin)?'<button class="btn-info" style="width:auto;margin:0;padding:7px;" data-type="'+type+'" data-item="'+esc(item)+'" onclick="epCopyOneServerToMy(this.dataset.type,this.dataset.item)">В мою</button>':'';
    return '<div class="emp-row ep-v7-row '+(!editable?'ep-v7-locked':'')+'">'+check+'<div style="flex:1;"><b>'+esc(it.n||'Позиция')+'</b><br><span style="color:var(--gray);font-size:10px;">'+esc(sub)+'</span></div>'+price+copy+'</div>';
  }
  function renderRows(type){
    var arr=active(type), html=editorTop(type);
    if(!arr.length) return html+'<div style="padding:15px;border:1px dashed var(--border);border-radius:12px;text-align:center;color:var(--gray);font-weight:800;">'+label()+' пустая.</div>';
    var cats={},i=0; arr.forEach(function(it){ var c=it.c||'Разное', g=groupOf(it)||'Без группы'; if(!cats[c])cats[c]={}; if(!cats[c][g])cats[c][g]=[]; cats[c][g].push(it); });
    Object.keys(cats).sort(function(a,b){return a.localeCompare(b,'ru');}).forEach(function(c){ var cid='v7_cat_'+type+'_'+(i++); html+='<div class="cat-header" onclick="epDbToggle && epDbToggle(&quot;'+cid+'&quot;, event)">'+esc(c)+'</div><div class="cat-body" id="'+cid+'">'; Object.keys(cats[c]).sort(function(a,b){return a.localeCompare(b,'ru');}).forEach(function(g){ var gid='v7_sub_'+type+'_'+(i++); html+='<div class="sub-cat-header" onclick="epDbToggle && epDbToggle(&quot;'+gid+'&quot;, event)">'+esc(g)+' ▾</div><div class="sub-cat-body" id="'+gid+'">'; cats[c][g].sort(function(a,b){return String(a.n||'').localeCompare(String(b.n||''),'ru');}).forEach(function(it){ html+=editorRow(type,it); }); html+='</div>'; }); html+='</div>'; });
    return html;
  }
  window.renderDbEditors=function(){
    syncMain(scope());
    try{ var catsEl=$('db-cats'); if(catsEl){ var all=active('mat').concat(active('work')); catsEl.innerHTML=Array.from(new Set(all.map(function(x){return x.c||'Разное';}))).sort(function(a,b){return a.localeCompare(b,'ru');}).map(function(c){return '<option value="'+esc(c)+'">';}).join(''); } }catch(e){}
    var m=$('editor-mat-list'), w=$('editor-work-list');
    if(m) m.innerHTML=renderRows('mat');
    if(w) w.innerHTML=renderRows('work');
    tuneStaticBlocks();
  };
  window.epSetDbScope=async function(s){
    setScope(s==='global'?'global':'my'); syncMain(scope()); tuneStaticBlocks();
    showProgress('Обновляю '+label(),20,'Переключение');
    try{ if(typeof oldSetScope==='function' && oldSetScope!==window.epSetDbScope){ await oldSetScope(s); } }catch(e){ console.warn('old scope failed',e); }
    try{ if(typeof window.epRefreshActiveDbNow==='function') await window.epRefreshActiveDbNow(true); }catch(e){}
    syncMain(scope()); renderDbEditors(); showProgress('Обновляю '+label(),100,'Готово'); setTimeout(hideProgress,350);
  };

  window.epChangePriceV7=async function(type,id,newPrice){
    if(!canEditActive()){ renderDbEditors(); return toast('Сервер редактирует только админ'); }
    var arr=active(type).slice(); var it=arr.find(function(x){return String(x.id||'')===String(id);}); if(!it)return toast('Позиция не найдена');
    it=Object.assign({},it,{p:money(newPrice)}); arr=upsert(arr,type,it,true);
    if(scope()==='global') setServer(type,arr); else setMy(type,arr);
    showProgress('Сохраняю цену',45,'Локально');
    if(scope()==='global') await saveServerRemote(showProgress); else await saveMyRemote(showProgress);
    showProgress('Сохраняю цену',100,'Готово'); setTimeout(hideProgress,350); renderDbEditors();
  };
  window.epSaveActiveDbV7=async function(){
    if(!canEditActive()) return toast('Сохранять базу сервера может только админ');
    showProgress('Сохраняю '+label(),20,'Подготовка');
    var ok=scope()==='global'?await saveServerRemote(showProgress):await saveMyRemote(showProgress);
    await reloadActiveDb(); showProgress('Сохраняю '+label(),100,ok?'Готово':'Локально сохранено'); setTimeout(hideProgress,450); toast(ok?'✅ База сохранена и перезагружена':'⚠️ Сервер не подтвердил, локальная база обновлена');
  };
  window.epReloadActiveDbV7=async function(){ showProgress('Перезагружаю '+label(),20,'Запрос'); await reloadActiveDb(); showProgress('Перезагружаю '+label(),100,'Готово'); setTimeout(hideProgress,350); };
  window.epDeleteSelectedActiveV7=async function(){
    if(!canEditActive()) return toast('Удалять на сервере может только админ');
    var checks=Array.from(document.querySelectorAll('#settModal .ep-v7-select:checked')); if(!checks.length)return toast('Выберите позиции');
    if(!confirm('Удалить выбранные позиции из '+label()+'?')) return;
    var rm={mat:new Set(),work:new Set()}; checks.forEach(function(ch){ rm[ch.dataset.type].add(String(ch.dataset.id||'')); });
    ['mat','work'].forEach(function(type){ if(!rm[type].size)return; var arr=active(type).filter(function(x){return !rm[type].has(String(x.id||''));}); if(scope()==='global') setServer(type,arr); else setMy(type,arr); });
    showProgress('Удаляю позиции',50,'Запись'); if(scope()==='global') await saveServerRemote(showProgress); else await saveMyRemote(showProgress); await reloadActiveDb(); showProgress('Удаляю позиции',100,'Готово'); setTimeout(hideProgress,350);
  };

  function downloadJson(filename,data){
    showProgress('Экспорт базы',25,'Подготовка файла');
    var blob=new Blob([JSON.stringify(data,null,2)],{type:'application/json;charset=utf-8'});
    showProgress('Экспорт базы',70,'Скачивание');
    var url=URL.createObjectURL(blob), a=document.createElement('a'); a.href=url; a.download=filename; document.body.appendChild(a); a.click(); a.remove();
    setTimeout(function(){URL.revokeObjectURL(url);},1000);
    showProgress('Экспорт базы',100,'Готово'); setTimeout(function(){hideProgress(); reloadActiveDb();},500);
  }
  window.epExportActiveDb=function(){ var s=scope(); downloadJson(s==='global'?'electric-pro-server-db.json':'electric-pro-my-db.json',{source:s==='global'?'server':'my',matDB:s==='global'?getServer('mat'):getMy('mat'),workDB:s==='global'?getServer('work'):getMy('work'),exportedAt:new Date().toISOString()}); };
  window.epExportMyDb=function(){ downloadJson('electric-pro-my-db.json',{source:'my',matDB:getMy('mat'),workDB:getMy('work'),exportedAt:new Date().toISOString()}); };
  window.epExportGlobalDb=function(){ downloadJson('electric-pro-server-db.json',{source:'server',matDB:getServer('mat'),workDB:getServer('work'),exportedAt:new Date().toISOString()}); };

  function fileTextProgress(file,onp){ return new Promise(function(resolve,reject){ var r=new FileReader(); r.onprogress=function(e){ if(e.lengthComputable&&onp)onp(Math.min(45,10+e.loaded/e.total*35),'Чтение файла');}; r.onload=function(){resolve(String(r.result||''));}; r.onerror=reject; r.readAsText(file); }); }
  function fileBufferProgress(file,onp){ return new Promise(function(resolve,reject){ var r=new FileReader(); r.onprogress=function(e){ if(e.lengthComputable&&onp)onp(Math.min(45,10+e.loaded/e.total*35),'Чтение файла');}; r.onload=function(){resolve(r.result);}; r.onerror=reject; r.readAsArrayBuffer(file); }); }
  function csvRows(txt){ var lines=String(txt||'').split(/\r?\n/).filter(function(x){return x.trim();}); if(!lines.length)return []; var delims=[';','\t',',']; var delim=delims.map(function(d){return {d:d,n:(lines[0]||'').split(d).length};}).sort(function(a,b){return b.n-a.n;})[0].d; return lines.map(function(line){ var out=[],cur='',q=false; for(var i=0;i<line.length;i++){ var ch=line[i]; if(ch==='"'){ if(q&&line[i+1]==='"'){cur+='"';i++;}else q=!q; } else if(ch===delim&&!q){out.push(cur);cur='';} else cur+=ch; } out.push(cur); return out; }); }
  function inferCat(name,type){ var s=norm(name); if(type==='work'){ if(/штроб|резк|алмаз/.test(s))return 'Алмазная резка'; if(/подрозет|коронк|сверл|бурен/.test(s))return 'Высверливание подрозетников'; if(/щит|автомат|узо|диф|сборк/.test(s))return 'Щитовое'; if(/демонтаж/.test(s))return 'Демонтаж'; if(/свет|люстр|бра|светильн|лента/.test(s))return 'Освещение'; return 'Работы'; } if(/ввг|кабел|провод|пугв|utp|ftp|тв|tv|sat/.test(s))return 'Кабель'; if(/гофр|труб|пнд|пвх/.test(s))return 'Трубы'; if(/автомат|узо|диф|узм|уздп|реле|контактор|выключатель нагрузки/.test(s))return 'Автоматика'; if(/щит|бокс|корпус|din|дин|рейк|шина|гребен|клемм|ншви|маркиров/.test(s))return 'Щитовое'; if(/розет|выключател|рамк|механизм|терморег/.test(s))return 'Чистовое'; if(/подрозет|короб|клемм|скоб|хомут|дюбел|саморез|смес|алебастр|изолент/.test(s))return 'Расходники'; return 'Разное'; }
  function inferSub(name,cat,type){ var s=norm(name); if(type==='work'){ if(/бетон/.test(s))return 'Бетон'; if(/кирпич/.test(s))return 'Кирпич'; if(/монолит|панел/.test(s))return 'Панель / монолит'; return cat||'Работы'; } if(/c\s*\d+|с\s*\d+|автомат/.test(s))return 'Автоматы'; if(/диф/.test(s))return 'ДИФы'; if(/узо/.test(s))return 'УЗО'; if(/узм|реле напряж/.test(s))return 'УЗМ / реле напряжения'; if(/контактор/.test(s))return 'Контакторы'; if(/ввг/.test(s))return 'ВВГ'; if(/пугв/.test(s))return 'ПуГВ'; if(/utp|ftp/.test(s))return 'UTP / FTP'; if(/подрозет/.test(s))return 'Подрозетники'; if(/клемм|wago/.test(s))return 'Клеммники'; if(/гребен/.test(s))return 'Гребёнки'; if(/шин/.test(s))return 'Шинки / клеммники'; if(/din|дин|рейк/.test(s))return 'DIN-рейки / ограничители'; if(/щит|бокс|корпус/.test(s))return 'Корпуса'; return 'Разное'; }
  function normItem(raw,type,idx){ raw=raw||{}; var n=cleanText(raw.n||raw.name||raw.title||raw.имя||raw.наименование||raw['Наименование']||raw['Название']||raw['Имя']); if(!n)return null; var c=cleanText(raw.c||raw.category||raw.cat||raw.категория||raw['Категория'])||inferCat(n,type); var sc=cleanText(raw.sc||raw.g||raw.subcategory||raw.group||raw.подкатегория||raw['Подкатегория']||raw['Группа'])||inferSub(n,c,type); var p=money(raw.p!=null?raw.p:(raw.price!=null?raw.price:(raw.цена!=null?raw.цена:raw['Цена']))); var u=cleanText(raw.u||raw.unit||raw.ед||raw['Ед.']||raw['Единица']||raw['Ед. изм.'])||'шт'; return {id:raw.id||((type==='work'?'w':'m')+'_v7_imp_'+Date.now()+'_'+idx),n:n,c:c,sc:sc,g:sc,p:p,u:u}; }
  function rowsToItems(rows,type){ rows=rows||[]; var header=null,currentCat='',currentSub='',out=[]; function cell(row,i){return cleanText((row||[])[i]);} rows.forEach(function(row){ row=(row||[]).map(cleanText); var non=row.filter(Boolean); if(!non.length)return; var joined=norm(non.join(' ')); if(/наимен|назван|имя|цена|стоим|ед/.test(joined)&&!header){ header={}; row.forEach(function(v,i){ var s=norm(v); if(/наимен|назван|имя|позиция|товар|работ/.test(s))header.name=i; if(/категор/.test(s)&&header.cat==null)header.cat=i; if(/подкат|группа/.test(s))header.sub=i; if(/цена|стоим|прайс/.test(s))header.price=i; if(/ед|изм/.test(s))header.unit=i; }); return; } var priceIdx=-1,unitIdx=-1; row.forEach(function(v,i){ if(priceIdx<0&&money(v)>0&&/^[-\d\s.,]+/.test(v))priceIdx=i; if(unitIdx<0&&/^(шт|м|м\.п\.?|пог\.м|уп|упак|компл|кг|л|рул|бухта)$/i.test(v))unitIdx=i; }); if(header){ var n=cell(row,header.name); if(n)out.push(normItem({n:n,c:cell(row,header.cat),sc:cell(row,header.sub),p:cell(row,header.price),u:cell(row,header.unit)},type,out.length)); return; } if(priceIdx<0&&non.length<=2){ var title=non.join(' '); if(type==='work'||/работ|монтаж|штроб|резк|сверл|демонтаж/i.test(title)){currentCat=title;currentSub='';} else if(!currentCat)currentCat=title; else currentSub=title; return; } var candidates=row.map(function(v,i){return {v:v,i:i};}).filter(function(x){return x.v&&x.i!==priceIdx&&x.i!==unitIdx&&!/^[-\d\s.,]+$/.test(x.v);}); if(!candidates.length)return; candidates.sort(function(a,b){return b.v.length-a.v.length;}); var name=candidates[0].v; if(name.length<3)return; out.push(normItem({n:name,c:currentCat||inferCat(name,type),sc:currentSub||inferSub(name,currentCat,type),p:priceIdx>=0?row[priceIdx]:0,u:unitIdx>=0?row[unitIdx]:'шт'},type,out.length)); }); return out.filter(Boolean); }
  function jsonToItems(raw,type){ if(raw&&raw.matDB&&type==='mat')raw=raw.matDB; else if(raw&&raw.workDB&&type==='work')raw=raw.workDB; else if(raw&&Array.isArray(raw.items))raw=raw.items; else if(raw&&raw.data&&Array.isArray(raw.data))raw=raw.data; else if(raw&&typeof raw==='object'&&!Array.isArray(raw))raw=Object.keys(raw).map(function(k){return raw[k];}); if(!Array.isArray(raw))raw=[]; return raw.map(function(x,i){return normItem(x,type,i);}).filter(Boolean); }
  function showReview(items,type,source,target){ items=unique((items||[]).filter(Boolean),type); var selected={}; items.forEach(function(_,i){selected[i]=true;}); window.EP_DB_REVIEW_V6={type:type,items:items,source:source||'',page:0,selected:selected,editCache:{}}; window.EP_DB_REVIEW={type:type,items:items,source:source||''}; window.EP_V7_IMPORT_TARGET=target||scope(); try{ if(typeof window.epReviewPageV6==='function') window.epReviewPageV6(0); }catch(e){} try{ if(typeof openModal==='function') openModal('ep-db-ai-review-modal'); }catch(e){ var m=$('ep-db-ai-review-modal'); if(m)m.style.display='flex'; } }
  async function readDbFile(file,type,target){ showProgress('Импорт базы',5,'Старт'); var name=file.name||'', lower=name.toLowerCase(), items=[]; if(file.type&&file.type.indexOf('image/')===0){ hideProgress(); if(typeof window.epAskAI==='function' && typeof oldTrigger==='function'){ return oldTrigger(type); } return toast('Для фото нужен ИИ.'); } if(/\.json$/i.test(lower)){ var txt=await fileTextProgress(file,showProgress); showProgress('Импорт базы',55,'Разбор JSON'); items=jsonToItems(JSON.parse(txt),type); } else if(/\.(xlsx|xls)$/i.test(lower)){ if(!window.XLSX) throw new Error('Библиотека XLSX не загрузилась. Сохраните файл как CSV или JSON.'); var ab=await fileBufferProgress(file,showProgress); showProgress('Импорт базы',55,'Разбор Excel'); var wb=XLSX.read(ab,{type:'array'}), rows=[]; wb.SheetNames.forEach(function(sh){ rows=rows.concat(XLSX.utils.sheet_to_json(wb.Sheets[sh],{header:1,defval:''})); }); showProgress('Импорт базы',78,'Подготовка строк'); items=rowsToItems(rows,type); } else { var raw=await fileTextProgress(file,showProgress); showProgress('Импорт базы',60,'Разбор текста/CSV'); items=rowsToItems(csvRows(raw),type); }
    showProgress('Импорт базы',100,'Открываю проверку'); setTimeout(hideProgress,250); showReview(items,type,name,target); }
  var oldTrigger=window.epTriggerDbFileImport;
  window.epTriggerDbFileImport=function(type){ type=type==='work'?'work':'mat'; var target=scope(); if(target==='global'&&!isAdmin()) return window.epTriggerServerProposalImportV7(type); var input=$('ep-db-file-input'); if(!input){ if(typeof oldTrigger==='function') return oldTrigger(type); return; } input.value=''; input.onchange=function(e){ var file=e.target.files&&e.target.files[0]; if(!file)return; readDbFile(file,type,target).catch(function(err){ hideProgress(); toast('❌ '+(err.message||'Ошибка импорта')); console.error(err); }); }; input.click(); };
  window.epTriggerServerProposalImportV7=function(type){ type=type==='work'?'work':'mat'; var input=$('ep-db-file-input'); if(!input)return toast('Поле выбора файла не найдено'); input.value=''; input.onchange=function(e){ var file=e.target.files&&e.target.files[0]; if(!file)return; readDbFile(file,type,'server_proposal').catch(function(err){ hideProgress(); toast('❌ '+(err.message||'Ошибка импорта')); console.error(err); }); }; input.click(); };
  window.epOpenTextImportServerProposalV7=function(type){ window.EP_V7_IMPORT_TARGET='server_proposal'; try{ if(typeof window.epOpenTextImport==='function') window.epOpenTextImport(type); }catch(e){} };
  var oldRunText=window.epRunTextImport;
  window.epRunTextImport=async function(){ var text=(($('ep-text-import-value')||{}).value)||''; var type=((window.EP_DB_REVIEW||{}).type==='work')?'work':'mat'; try{ if(typeof closeModal==='function') closeModal('ep-text-import-modal'); }catch(e){} try{ showProgress('Импорт текста',35,'Разбор'); var items=rowsToItems(csvRows(text),type); showProgress('Импорт текста',100,'Открываю проверку'); setTimeout(hideProgress,250); showReview(items,type,'текст',window.EP_V7_IMPORT_TARGET||scope()); }catch(e){ hideProgress(); if(typeof oldRunText==='function') return oldRunText(); toast('❌ Ошибка текста'); } };
  function saveVisibleEdits(){ var st=window.EP_DB_REVIEW_V6||{}; var start=(st.page||0)*PAGE_SIZE; var end=Math.min(start+PAGE_SIZE,(st.items||[]).length); for(var i=start;i<end;i++){ var base=(st.items||[])[i]||{}; var ch=$('ep-db-check-'+i); if(ch)st.selected[i]=!!ch.checked; var n=$('ep-db-name-'+i),c=$('ep-db-cat-'+i),sc=$('ep-db-subcat-'+i),p=$('ep-db-price-'+i),u=$('ep-db-unit-'+i); if(n||c||sc||p||u){ st.editCache[i]={n:n?n.value:base.n,c:c?c.value:base.c,sc:sc?sc.value:(base.sc||base.g),p:p?p.value:base.p,u:u?u.value:base.u}; } } }
  function collectReviewed(){ saveVisibleEdits(); var st=window.EP_DB_REVIEW_V6||{}; var type=st.type==='work'?'work':'mat', out=[]; (st.items||[]).forEach(function(base,i){ if(st.selected&&st.selected[i]===false)return; var ed=(st.editCache&&st.editCache[i])||base||{}; var it=normItem({id:base.id,n:ed.n||base.n,c:ed.c||base.c,sc:ed.sc||ed.g||base.sc||base.g,p:ed.p!=null?ed.p:base.p,u:ed.u||base.u},type,i); if(it){ try{ if(typeof window.epAutoGroupItem==='function') it=window.epAutoGroupItem(type,it); }catch(e){} out.push(it); } }); return {type:type,items:out}; }
  window.epApplyReviewedDbItems=async function(mode){ var data=collectReviewed(), type=data.type, items=data.items; if(!items.length)return toast('Нет выбранных позиций'); var target=window.EP_V7_IMPORT_TARGET||scope(); showProgress('Запись базы',10,'Подготовка'); try{ if(target==='server_proposal'){ await sendProposal(type,items,'import_to_server_'+(mode||'add'),showProgress); showProgress('Запись базы',100,'Заявка отправлена'); toast('✅ Импорт отправлен админу заявкой: '+items.length+' поз.'); }
      else if(target==='global'){ if(!isAdmin()) throw new Error('Серверную базу меняет только админ'); var g=getServer(type); items.forEach(function(it,idx){ g=upsert(g,type,it,mode==='replace'); if(idx%25===0)showProgress('Запись базы',20+Math.min(35,idx/Math.max(1,items.length)*35),'Запись строк'); }); setServer(type,g); await saveServerRemote(showProgress); showProgress('Запись базы',96,'Перезагрузка базы сервера'); await reloadActiveDb(); toast('✅ Импорт добавлен в базу сервера: '+items.length+' поз.'); }
      else { setScope('my'); var a=getMy(type); items.forEach(function(it,idx){ a=upsert(a,type,it,mode==='replace'); if(idx%25===0)showProgress('Запись базы',20+Math.min(35,idx/Math.max(1,items.length)*35),'Запись строк'); }); setMy(type,a); var ok=await saveMyRemote(showProgress); showProgress('Запись базы',96,'Перезагрузка моей базы'); if(ok) await reloadActiveDb(); else { syncMain('my'); renderDbEditors(); } toast('✅ Импорт сохранён в моей базе: '+items.length+' поз.'+(ok?'':' Сервер не подтвердил, но на телефоне база есть.')); }
      try{ if(typeof closeModal==='function') closeModal('ep-db-ai-review-modal'); }catch(e){} showProgress('Запись базы',100,'Готово'); setTimeout(hideProgress,500); }
    catch(e){ hideProgress(); toast('❌ '+(e.message||'Ошибка сохранения')); console.error('EP V7 apply',e); } finally{ window.EP_V7_IMPORT_TARGET=null; } };

  function install(){ try{ var old=$('ep-db-ai-tools'); if(old)old.style.display='none'; }catch(e){} try{ renderDbEditors(); }catch(e){} }
  document.addEventListener('DOMContentLoaded',function(){ ensureProgress(); setTimeout(install,700); setTimeout(install,1600); });
  setTimeout(install,300);
})();


/* =========================================================
 * SOURCE: block-16.js
 * AUTO TARGET: 04-database.js
 * SCORE: 200
 * HITS: db, base, matDB, workDB, global_db, user_db, import, category, subcategory, renderDbEditors
 * ========================================================= */

/*
 * Extracted from public/index.html
 * Original script block: 16
 * Original HTML lines: 8090-8394
 */

/* === EP_DB_SAVE_FIX_V8 2026-05-14 ===
   Surgical fix: do not hide Firebase save errors, do not reload empty DB after failed save,
   make manual add / import / price edit persist strictly to selected DB.
   Shield logic is not touched.
*/
(function(){
  var LS_SCOPE='ep_db_scope_v2';
  var LS_MY_MAT='user_db_mat_v31';
  var LS_MY_WORK='user_db_work_v31';
  var LS_SERVER_CACHE='ep_global_cache_force_v1';
  var PAGE_SIZE=60;
  var ADMIN_EMAILS=['vits0007@gmail.com'];
  var ADMIN_PHONES=['89776230182'];

  function $(id){ return document.getElementById(id); }
  function toast(t){ try{ if(typeof showToast==='function') showToast(String(t)); else console.log(t); }catch(e){ console.log(t); } }
  function esc(s){ return String(s==null?'':s).replace(/[&<>"']/g,function(m){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m];}); }
  function norm(s){ return String(s||'').toLowerCase().replace(/ё/g,'е').replace(/×/g,'x').replace(/х/g,'x').replace(/[^a-zа-я0-9]+/g,' ').trim(); }
  function money(v){ var n=Number(String(v==null?'':v).replace(',','.').replace(/[^\d.\-]/g,'')); return Number.isFinite(n)?n:0; }
  function groupOf(it){ return (it&&(it.g||it.sc||it.subcategory||it.group))||''; }
  function clean(s){ return String(s||'').replace(/\s+/g,' ').trim(); }
  function sig(type,it){ return type+'|'+norm([it&&it.c,groupOf(it),it&&it.n,it&&it.u].filter(Boolean).join('|')); }
  function clone(it){ var x=Object.assign({},it||{}); delete x.__src; delete x.__encoded; return x; }
  function scope(){ try{return localStorage.getItem(LS_SCOPE)==='global'?'global':'my';}catch(e){return 'my';} }
  function setScope(s){ try{localStorage.setItem(LS_SCOPE,s==='global'?'global':'my');}catch(e){} }
  function fbUser(){ try{ return (typeof firebase!=='undefined' && firebase.auth && firebase.auth().currentUser) ? firebase.auth().currentUser : null; }catch(e){ return null; } }
  function uid(){ try{ return (window.appUser&&appUser.uid) || (fbUser()&&fbUser().uid) || ''; }catch(e){ return ''; } }
  function currentEmail(){ try{ return String((window.appUser&&appUser.email) || (fbUser()&&fbUser().email) || '').toLowerCase(); }catch(e){ return ''; } }
  function isAdmin(){
    try{
      var em=currentEmail();
      var ph=String((window.appUser&&appUser.phone)||'');
      return !!(window.appUser && appUser.role==='admin') || ADMIN_EMAILS.indexOf(em)>=0 || ADMIN_PHONES.indexOf(ph)>=0;
    }catch(e){ return false; }
  }
  function canEdit(){ return scope()==='my' || (scope()==='global' && isAdmin()); }
  function label(){ return scope()==='global'?'🌍 База сервера':'👤 Моя база'; }
  function readArr(k){ try{ var a=JSON.parse(localStorage.getItem(k)||'[]'); return Array.isArray(a)?a:[]; }catch(e){ return []; } }
  function writeArr(k,a){ try{ if(typeof safeSet==='function') safeSet(k,JSON.stringify(a||[])); else localStorage.setItem(k,JSON.stringify(a||[])); }catch(e){ try{localStorage.setItem(k,JSON.stringify(a||[]));}catch(_e){} } }
  function readObj(k){ try{ var o=JSON.parse(localStorage.getItem(k)||'{}'); return o&&typeof o==='object'?o:{}; }catch(e){ return {}; } }
  function writeObj(k,o){ try{ localStorage.setItem(k,JSON.stringify(o||{})); }catch(e){} }
  function unique(arr,type){ var seen={},out=[]; (arr||[]).forEach(function(raw){ var it=clone(raw); if(!clean(it.n))return; if(it.sc&&!it.g)it.g=it.sc; if(it.g&&!it.sc)it.sc=it.g; if(!it.c)it.c='Разное'; if(!it.u)it.u='шт'; if(!it.id)it.id=(type==='work'?'w':'m')+'_v8_'+Date.now()+'_'+Math.random().toString(36).slice(2,8); var k=sig(type,it); if(seen[k])return; seen[k]=1; out.push(it); }); return out; }
  function getMy(type){ var a=type==='work'?window.EP_MY_WORK:window.EP_MY_MAT; return Array.isArray(a)?a.slice():readArr(type==='work'?LS_MY_WORK:LS_MY_MAT); }
  function getServer(type){ var a=type==='work'?window.EP_GLOBAL_WORK:window.EP_GLOBAL_MAT; if(Array.isArray(a))return a.slice(); var o=readObj(LS_SERVER_CACHE); a=type==='work'?o.workDB:o.matDB; return Array.isArray(a)?a.slice():[]; }
  function setMy(type,arr){ arr=unique(arr,type); if(type==='work') window.EP_MY_WORK=arr; else window.EP_MY_MAT=arr; writeArr(type==='work'?LS_MY_WORK:LS_MY_MAT,arr); try{ window.userMatDB=getMy('mat'); window.userWorkDB=getMy('work'); }catch(e){} syncMain('my'); }
  function setServer(type,arr){ arr=unique(arr,type); if(type==='work') window.EP_GLOBAL_WORK=arr; else window.EP_GLOBAL_MAT=arr; var mat=type==='mat'?arr:getServer('mat'); var work=type==='work'?arr:getServer('work'); writeObj(LS_SERVER_CACHE,{matDB:mat,workDB:work,ts:Date.now()}); try{ window.EP_FORCE_GLOBAL={matDB:mat,workDB:work}; window.EP_ULTIMATE_DB_CACHE={matDB:mat,workDB:work,ts:Date.now()}; window.EP_GLOBAL_DB_VISIBLE_CACHE={matDB:mat,workDB:work,ts:Date.now()}; }catch(e){} syncMain('global'); }
  function syncMain(target){ try{ var use=target||scope(); window.matDB=(use==='global'?getServer('mat'):getMy('mat')); window.workDB=(use==='global'?getServer('work'):getMy('work')); try{ matDB=window.matDB; workDB=window.workDB; }catch(e){} }catch(e){} }
  function active(type){ return scope()==='global'?getServer(type):getMy(type); }
  function upsert(arr,type,it,replace){ it=clone(it); if(!it.id)it.id=(type==='work'?'w':'m')+'_v8_'+Date.now()+'_'+Math.random().toString(36).slice(2,8); if(it.sc&&!it.g)it.g=it.sc; if(it.g&&!it.sc)it.sc=it.g; if(!it.c)it.c='Разное'; if(!it.u)it.u='шт'; var k=sig(type,it); var idx=(arr||[]).findIndex(function(x){return sig(type,x)===k || (it.id&&String(x.id||'')===String(it.id));}); if(idx>=0)arr[idx]=Object.assign({},replace?{}:arr[idx],it,{id:(arr[idx]&&arr[idx].id)||it.id}); else arr.push(it); return arr; }

  function ensureProgress(){
    if($('ep-v7-progress')) return;
    var d=document.createElement('div'); d.id='ep-v7-progress'; d.style.cssText='position:fixed;inset:0;z-index:99999;background:rgba(15,23,42,.62);display:none;align-items:center;justify-content:center;padding:18px;';
    d.innerHTML='<div style="width:min(460px,94vw);border-radius:20px;background:#fff;box-shadow:0 24px 70px rgba(0,0,0,.35);padding:18px;"><div id="ep-v7-progress-title" style="font-weight:900;color:#4f46e5;font-size:17px;margin-bottom:8px;">Выполняю...</div><div style="height:16px;background:#e5e7eb;border-radius:999px;overflow:hidden;"><div id="ep-v7-progress-fill" style="height:100%;width:0%;background:linear-gradient(90deg,#2563eb,#10b981);transition:width .18s ease;"></div></div><div id="ep-v7-progress-txt" style="font-size:12px;color:#64748b;font-weight:800;margin-top:8px;">0%</div></div>';
    document.body.appendChild(d);
  }
  function showProgress(title,pct,txt){ ensureProgress(); var p=$('ep-v7-progress'),f=$('ep-v7-progress-fill'),t=$('ep-v7-progress-title'),x=$('ep-v7-progress-txt'); if(p)p.style.display='flex'; if(t)t.textContent=title||'Выполняю...'; if(f)f.style.width=Math.max(0,Math.min(100,Math.round(pct||0)))+'%'; if(x)x.textContent=(txt||'')+' '+Math.max(0,Math.min(100,Math.round(pct||0)))+'%'; try{ if(typeof hideLoader==='function') hideLoader(); }catch(e){} }
  function hideProgress(){ var p=$('ep-v7-progress'); if(p)p.style.display='none'; }

  function firebaseHint(){
    var fbu=fbUser();
    if(!fbu) return 'Нет Firebase-входа. Серверная запись может быть запрещена правилами Firebase. Для админа лучше войти через Google-аккаунт администратора.';
    return 'Firebase: '+(fbu.email||fbu.uid)+'.';
  }
  function explainErr(e){
    var msg=(e&&(e.message||e.code))?String(e.message||e.code):'неизвестная ошибка';
    if(/permission|Missing or insufficient/i.test(msg)) return 'Firebase запретил запись: Missing or insufficient permissions. Нужно настроить Firestore Rules или войти админом через Google.';
    return msg;
  }

  async function saveMyRemote(onp){
    writeArr(LS_MY_MAT,getMy('mat'));
    writeArr(LS_MY_WORK,getMy('work'));
    try{ localStorage.setItem('ep_master_db_created_v1','1'); }catch(e){}
    if(onp)onp('Сохраняю мою базу',45,'Локально');
    if(!(typeof db!=='undefined'&&db)) throw new Error('Firebase db не подключён. Локально сохранено, но на сервер не ушло.');
    if(!uid()) throw new Error('Нет uid мастера. Перезайдите в аккаунт.');
    if(onp)onp('Сохраняю мою базу',70,'Запись user_db/'+uid());
    await db.collection('user_db').doc(uid()).set({
      uid:uid(),
      masterName:(window.appUser&&(appUser.name||appUser.email||appUser.phone))||'',
      matDB:getMy('mat'),
      workDB:getMy('work'),
      created:true,
      updatedAt:new Date().toISOString()
    },{merge:true});
    if(onp)onp('Сохраняю мою базу',92,'Сервер подтвердил');
    return true;
  }
  async function saveServerRemote(onp){
    writeObj(LS_SERVER_CACHE,{matDB:getServer('mat'),workDB:getServer('work'),ts:Date.now()});
    if(!isAdmin()) throw new Error('Серверную базу сохраняет только админ.');
    if(!(typeof db!=='undefined'&&db)) throw new Error('Firebase db не подключён.');
    if(onp)onp('Сохраняю базу сервера',65,'Запись settings/global_db');
    await db.collection('settings').doc('global_db').set({
      matDB:getServer('mat'),
      workDB:getServer('work'),
      cleanMode:true,
      updatedAt:new Date().toISOString(),
      updatedBy:(window.appUser&&(appUser.email||appUser.phone||appUser.uid))||''
    },{merge:true});
    if(onp)onp('Сохраняю базу сервера',92,'Сервер подтвердил');
    return true;
  }
  async function sendProposal(type,items,reason,onp){
    if(!(typeof db!=='undefined'&&db)) throw new Error('Firebase db не подключён. Заявку отправить нельзя.');
    if(onp)onp('Отправляю заявку',70,'db_proposals');
    await db.collection('db_proposals').add({
      type:type,
      items:Array.isArray(items)?items.map(clone):items,
      reason:reason||'server_request',
      target:'server_db',
      uid:uid()||'',
      masterName:(window.appUser&&(appUser.name||appUser.email||appUser.phone))||'',
      userEmail:currentEmail(),
      status:'pending',
      createdAt:new Date().toISOString()
    });
    return true;
  }
  async function reloadFromRemoteCurrent(){
    try{
      if(!(typeof db!=='undefined'&&db)) return false;
      if(scope()==='global'){
        var gd=await db.collection('settings').doc('global_db').get();
        if(gd.exists){ var g=gd.data()||{}; setServer('mat',Array.isArray(g.matDB)?g.matDB:[]); setServer('work',Array.isArray(g.workDB)?g.workDB:[]); return true; }
      } else if(uid()){
        var ud=await db.collection('user_db').doc(uid()).get();
        if(ud.exists){ var u=ud.data()||{}; setMy('mat',Array.isArray(u.matDB)?u.matDB:getMy('mat')); setMy('work',Array.isArray(u.workDB)?u.workDB:getMy('work')); return true; }
      }
    }catch(e){ console.warn('EP V8 reload remote failed',e); }
    return false;
  }
  function rerender(){ try{ syncMain(scope()); if(typeof renderDbEditors==='function') renderDbEditors(); }catch(e){} try{ if(typeof rf==='function') rf(); }catch(e){} }
  function currentEditType(){
    var wb=$('editor-work-list'), mb=$('editor-mat-list');
    if(wb && wb.offsetParent!==null && wb.style.display!=='none') return 'work';
    if(mb && mb.offsetParent!==null && mb.style.display!=='none') return 'mat';
    return 'mat';
  }
  function makeManualItem(type){
    var cat=$('db-new-cat')?clean($('db-new-cat').value):'';
    var name=$('db-new-name')?clean($('db-new-name').value):'';
    var price=$('db-new-price')?money($('db-new-price').value):0;
    var unit=$('db-new-unit')?clean($('db-new-unit').value)||'шт':'шт';
    if(!name) throw new Error('Введите название позиции');
    var it={id:(type==='work'?'w':'m')+'_manual_v8_'+Date.now(),c:cat||'Разное',n:name,p:price,u:unit};
    try{ if(typeof window.epAutoGroupItem==='function') it=window.epAutoGroupItem(type,it); }catch(e){}
    return it;
  }

  var oldAdd=window.addDbItem;
  window.addDbItem=async function(){
    var type=currentEditType();
    showProgress('Добавляю позицию',15,'Подготовка');
    try{
      var item=makeManualItem(type);
      if(scope()==='global'){
        if(!isAdmin()){
          await sendProposal(type,[item],'add_manual_to_server',showProgress);
          toast('✅ Позиция отправлена админу заявкой');
        } else {
          var g=getServer(type); g=upsert(g,type,item,true); setServer(type,g);
          await saveServerRemote(showProgress);
          await reloadFromRemoteCurrent();
          toast('✅ Добавлено и сохранено в базу сервера');
        }
      } else {
        var a=getMy(type); a=upsert(a,type,item,true); setMy(type,a);
        try{ await saveMyRemote(showProgress); toast('✅ Добавлено и сохранено в моей базе'); }
        catch(e){ toast('⚠️ Добавлено на телефоне, но сервер не подтвердил: '+explainErr(e)); }
      }
      if($('db-new-name')) $('db-new-name').value='';
      if($('db-new-price')) $('db-new-price').value='';
      showProgress('Добавляю позицию',100,'Готово');
      setTimeout(hideProgress,450); rerender();
    }catch(e){ hideProgress(); toast('❌ '+explainErr(e)); console.error('EP V8 addDbItem failed',e); if(/not defined/i.test(String(e.message||''))&&typeof oldAdd==='function') return oldAdd(); }
  };

  window.epChangePriceV7=async function(type,id,newPrice){
    type=type==='work'?'work':'mat';
    if(!canEdit()){ rerender(); return toast('Сервер редактирует только админ'); }
    showProgress('Сохраняю цену',25,'Локально');
    try{
      var arr=active(type).slice(); var it=arr.find(function(x){return String(x.id||'')===String(id);});
      if(!it) throw new Error('Позиция не найдена');
      it=Object.assign({},it,{p:money(newPrice)}); arr=upsert(arr,type,it,true);
      if(scope()==='global'){
        setServer(type,arr); await saveServerRemote(showProgress); await reloadFromRemoteCurrent(); toast('✅ Цена сохранена в базе сервера');
      } else {
        setMy(type,arr); try{ await saveMyRemote(showProgress); toast('✅ Цена сохранена в моей базе'); }catch(e){ toast('⚠️ Цена сохранена на телефоне, сервер не подтвердил: '+explainErr(e)); }
      }
      showProgress('Сохраняю цену',100,'Готово'); setTimeout(hideProgress,350); rerender();
    }catch(e){ hideProgress(); toast('❌ '+explainErr(e)); console.error('EP V8 price failed',e); rerender(); }
  };

  window.epSaveActiveDbV7=async function(){
    if(!canEdit()) return toast('Сохранять базу сервера может только админ');
    showProgress('Сохраняю '+label(),20,'Подготовка');
    try{
      if(scope()==='global'){
        await saveServerRemote(showProgress);
        await reloadFromRemoteCurrent();
        toast('✅ База сервера сохранена и перезагружена');
      } else {
        try{ await saveMyRemote(showProgress); await reloadFromRemoteCurrent(); toast('✅ Моя база сохранена и перезагружена'); }
        catch(e){ toast('⚠️ Моя база сохранена на телефоне, но не на сервере: '+explainErr(e)); }
      }
      showProgress('Сохраняю '+label(),100,'Готово'); setTimeout(hideProgress,450); rerender();
    }catch(e){ hideProgress(); toast('❌ '+explainErr(e)); console.error('EP V8 save active failed',e); rerender(); }
  };

  window.epReloadActiveDbV7=async function(){
    showProgress('Перезагружаю '+label(),20,'Запрос');
    var ok=await reloadFromRemoteCurrent();
    syncMain(scope()); rerender();
    showProgress('Перезагружаю '+label(),100,ok?'С сервера':'Локально');
    setTimeout(hideProgress,350);
    toast(ok?'✅ База обновлена с сервера':'⚠️ Сервер не отдал базу. Показана локальная копия.');
  };

  window.epCopyOneServerToMy=async function(type,itemStr){
    type=type==='work'?'work':'mat';
    try{
      var it=JSON.parse(decodeURIComponent(itemStr||'{}'));
      if(!it||!it.n) throw new Error('Позиция не найдена');
      var copy=clone(it); copy.originServerId=copy.originServerId||copy.id||''; copy.id='local_'+type+'_v8_'+Date.now()+'_'+Math.random().toString(36).slice(2,8);
      var arr=getMy(type); arr=upsert(arr,type,copy,true); setMy(type,arr);
      showProgress('Добавляю в мою базу',45,'Локально');
      try{ await saveMyRemote(showProgress); toast('✅ Позиция добавлена и сохранена в моей базе'); }
      catch(e){ toast('⚠️ Добавлено на телефоне, сервер не подтвердил: '+explainErr(e)); }
      showProgress('Добавляю в мою базу',100,'Готово'); setTimeout(hideProgress,350); rerender();
    }catch(e){ hideProgress(); toast('❌ '+explainErr(e)); }
  };
  window.epCopyOneGlobalToMy=window.epCopyOneServerToMy;

  function saveVisibleEdits(){
    var st=window.EP_DB_REVIEW_V6||{}; var start=(st.page||0)*PAGE_SIZE; var end=Math.min(start+PAGE_SIZE,(st.items||[]).length);
    for(var i=start;i<end;i++){
      var base=(st.items||[])[i]||{}; var ch=$('ep-db-check-'+i); if(ch)st.selected[i]=!!ch.checked;
      var n=$('ep-db-name-'+i),c=$('ep-db-cat-'+i),sc=$('ep-db-subcat-'+i),p=$('ep-db-price-'+i),u=$('ep-db-unit-'+i);
      if(n||c||sc||p||u){ st.editCache=st.editCache||{}; st.editCache[i]={n:n?n.value:base.n,c:c?c.value:base.c,sc:sc?sc.value:(base.sc||base.g),p:p?p.value:base.p,u:u?u.value:base.u}; }
    }
  }
  function normItem(raw,type,idx){
    raw=raw||{}; var n=clean(raw.n||raw.name||raw['Наименование']||raw['Название']||raw['Имя']); if(!n)return null;
    var c=clean(raw.c||raw.category||raw['Категория'])||'Разное';
    var sc=clean(raw.sc||raw.g||raw.subcategory||raw['Подкатегория']||raw['Группа'])||'Разное';
    var p=money(raw.p!=null?raw.p:(raw.price||raw['Цена']||raw['Стоимость']));
    var u=clean(raw.u||raw.unit||raw['Ед']||raw['Единица'])||'шт';
    return {id:raw.id||((type==='work'?'w':'m')+'_imp_v8_'+Date.now()+'_'+idx),n:n,c:c,sc:sc,g:sc,p:p,u:u};
  }
  function collectReviewed(){
    saveVisibleEdits(); var st=window.EP_DB_REVIEW_V6||{}; var type=st.type==='work'?'work':'mat',out=[];
    (st.items||[]).forEach(function(base,i){ if(st.selected&&st.selected[i]===false)return; var ed=(st.editCache&&st.editCache[i])||base||{}; var it=normItem({id:base.id,n:ed.n||base.n,c:ed.c||base.c,sc:ed.sc||ed.g||base.sc||base.g,p:ed.p!=null?ed.p:base.p,u:ed.u||base.u},type,i); if(it){ try{ if(typeof window.epAutoGroupItem==='function') it=window.epAutoGroupItem(type,it); }catch(e){} out.push(it); } });
    return {type:type,items:out};
  }

  window.epApplyReviewedDbItems=async function(mode){
    var data=collectReviewed(), type=data.type, items=data.items; if(!items.length)return toast('Нет выбранных позиций');
    var target=window.EP_V7_IMPORT_TARGET || scope();
    showProgress('Запись базы',10,'Подготовка');
    try{
      if(target==='server_proposal'){
        await sendProposal(type,items,'import_to_server_'+(mode||'add'),showProgress);
        toast('✅ Импорт отправлен админу заявкой: '+items.length+' поз.');
      } else if(target==='global'){
        if(!isAdmin()) throw new Error('Серверную базу меняет только админ');
        var g=getServer(type); items.forEach(function(it,idx){ g=upsert(g,type,it,mode==='replace'); if(idx%25===0)showProgress('Запись базы',20+Math.min(35,idx/Math.max(1,items.length)*35),'Строки'); });
        setServer(type,g);
        await saveServerRemote(showProgress);
        await reloadFromRemoteCurrent();
        toast('✅ Импорт сохранён в базе сервера: '+items.length+' поз.');
      } else {
        setScope('my'); var a=getMy(type); items.forEach(function(it,idx){ a=upsert(a,type,it,mode==='replace'); if(idx%25===0)showProgress('Запись базы',20+Math.min(35,idx/Math.max(1,items.length)*35),'Строки'); });
        setMy(type,a);
        try{ await saveMyRemote(showProgress); await reloadFromRemoteCurrent(); toast('✅ Импорт сохранён в моей базе: '+items.length+' поз.'); }
        catch(e){ toast('⚠️ Импорт сохранён на телефоне, но сервер не подтвердил: '+explainErr(e)); }
      }
      try{ if(typeof closeModal==='function') closeModal('ep-db-ai-review-modal'); }catch(e){}
      showProgress('Запись базы',100,'Готово'); setTimeout(hideProgress,500); syncMain(scope()); rerender();
    }catch(e){ hideProgress(); toast('❌ '+explainErr(e)); console.error('EP V8 apply failed',e); }
    finally{ window.EP_V7_IMPORT_TARGET=null; }
  };

  window.epFirebaseDbDebug=function(){
    var fbu=fbUser();
    var info={scope:scope(),appUser:window.appUser||null,firebaseUser:fbu?{uid:fbu.uid,email:fbu.email}:null,isAdmin:isAdmin(),uid:uid(),myMat:getMy('mat').length,myWork:getMy('work').length,serverMat:getServer('mat').length,serverWork:getServer('work').length,hint:firebaseHint()};
    console.log('EP Firebase DB debug',info);
    alert('Проверка Firebase\n\nАктивно: '+label()+'\nАдмин: '+(isAdmin()?'да':'нет')+'\nUID: '+(uid()||'нет')+'\nFirebase вход: '+(fbu?(fbu.email||fbu.uid):'нет')+'\nМоя база: '+info.myMat+' мат / '+info.myWork+' раб\nСервер: '+info.serverMat+' мат / '+info.serverWork+' раб\n\n'+firebaseHint());
    return info;
  };

  function injectDebugButton(){
    var p=$('ep-v7-db-panel'); if(!p || $('ep-v8-fb-debug-btn')) return;
    var b=document.createElement('button'); b.id='ep-v8-fb-debug-btn'; b.className='btn-info'; b.style.cssText='width:100%;margin-top:8px;padding:10px;'; b.textContent='🔎 Проверить Firebase-сохранение'; b.onclick=function(){ window.epFirebaseDbDebug(); };
    p.appendChild(b);
  }
  var oldRender=window.renderDbEditors;
  window.renderDbEditors=function(){ try{ if(typeof oldRender==='function') oldRender(); }catch(e){ console.warn('old renderDbEditors failed',e); } try{ injectDebugButton(); }catch(e){} };
  document.addEventListener('DOMContentLoaded',function(){ setTimeout(function(){ try{ window.renderDbEditors(); }catch(e){} },900); setTimeout(function(){ try{ injectDebugButton(); }catch(e){} },1800); });
  setTimeout(function(){ try{ window.renderDbEditors(); }catch(e){} },400);
})();


/* =========================================================
 * SOURCE: block-17.js
 * AUTO TARGET: 04-database.js
 * SCORE: 242
 * HITS: db, base, matDB, workDB, материал, работ, global_db, user_db, import, category, subcategory, renderDbEditors
 * ========================================================= */

/*
 * Extracted from public/index.html
 * Original script block: 17
 * Original HTML lines: 8398-8621
 */

/* === EP DB IMPORT SERVER SAVE FIX V9 2026-05-14 ===
   Fix: manual server add saved, but import could be applied to wrong scope or only local cache.
   This final patch explicitly captures import target and writes imported server DB to Firebase settings/global_db.
   Shield logic is not touched.
*/
(function(){
  var LS_SCOPE='ep_db_scope_v2';
  var LS_MY_MAT='user_db_mat_v31';
  var LS_MY_WORK='user_db_work_v31';
  var LS_SERVER_CACHE='ep_global_cache_force_v1';
  var PAGE_SIZE=60;
  var oldTrigger=window.epTriggerDbFileImport;
  var oldOpenText=window.epOpenTextImport;

  function $(id){ return document.getElementById(id); }
  function toast(t){ try{ if(typeof showToast==='function') showToast(t); else alert(t); }catch(e){ console.log(t); } }
  function esc(s){ return String(s==null?'':s).replace(/[&<>"']/g,function(m){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m];}); }
  function clean(v){ return String(v==null?'':v).replace(/\s+/g,' ').trim(); }
  function norm(s){ return clean(s).toLowerCase().replace(/ё/g,'е').replace(/×/g,'x').replace(/х/g,'x').replace(/[^a-zа-я0-9]+/g,' ').trim(); }
  function money(v){ var n=Number(String(v==null?'':v).replace(',','.').replace(/[^\d.\-]/g,'')); return Number.isFinite(n)?n:0; }
  function scope(){ try{return localStorage.getItem(LS_SCOPE)==='global'?'global':'my';}catch(e){return 'my';} }
  function setScope(s){ try{ localStorage.setItem(LS_SCOPE, s==='global'?'global':'my'); }catch(e){} }
  function isAdmin(){ try{ return !!(window.appUser && window.appUser.role==='admin'); }catch(e){ return false; } }
  function uid(){ try{ return (window.appUser && window.appUser.uid) || (firebase.auth && firebase.auth().currentUser && firebase.auth().currentUser.uid) || ''; }catch(e){ return (window.appUser&&window.appUser.uid)||''; } }
  function currentUserLabel(){ try{ var u=(firebase.auth&&firebase.auth().currentUser)||null; return (u&&(u.email||u.uid)) || (window.appUser&&(appUser.email||appUser.phone||appUser.uid)) || ''; }catch(e){ return (window.appUser&&(appUser.email||appUser.phone||appUser.uid)) || ''; } }
  function readArr(k){ try{ var a=JSON.parse(localStorage.getItem(k)||'[]'); return Array.isArray(a)?a:[]; }catch(e){ return []; } }
  function writeArr(k,a){ try{ if(typeof safeSet==='function') safeSet(k,JSON.stringify(a||[])); else localStorage.setItem(k,JSON.stringify(a||[])); }catch(e){ try{ localStorage.setItem(k,JSON.stringify(a||[])); }catch(_e){} } }
  function readObj(k){ try{ var o=JSON.parse(localStorage.getItem(k)||'{}'); return o&&typeof o==='object'?o:{}; }catch(e){ return {}; } }
  function writeObj(k,o){ try{ localStorage.setItem(k,JSON.stringify(o||{})); }catch(e){} }
  function clone(x){ return Object.assign({},x||{}); }
  function groupOf(it){ return (it&&(it.sc||it.g||it.group||it.subcategory))||''; }
  function sig(type,it){ return type+'|'+norm([it&&it.c,groupOf(it),it&&it.n,it&&it.u].filter(Boolean).join('|')); }
  function unique(arr,type){ var seen={},out=[]; (arr||[]).forEach(function(raw){ var it=clone(raw); if(!clean(it.n))return; if(it.sc&&!it.g)it.g=it.sc; if(it.g&&!it.sc)it.sc=it.g; if(!it.c)it.c='Разное'; if(!it.u)it.u='шт'; if(!it.id)it.id=(type==='work'?'w':'m')+'_v9_'+Date.now()+'_'+Math.random().toString(36).slice(2,8); var k=sig(type,it); if(seen[k])return; seen[k]=1; out.push(it); }); return out; }
  function getServer(type){ var a=type==='work'?window.EP_GLOBAL_WORK:window.EP_GLOBAL_MAT; if(Array.isArray(a)) return a.slice(); var c=readObj(LS_SERVER_CACHE); a=type==='work'?c.workDB:c.matDB; return Array.isArray(a)?a.slice():[]; }
  function getMy(type){ var a=type==='work'?window.EP_MY_WORK:window.EP_MY_MAT; return Array.isArray(a)?a.slice():readArr(type==='work'?LS_MY_WORK:LS_MY_MAT); }
  function setServer(type,arr){ arr=unique(arr,type); if(type==='work') window.EP_GLOBAL_WORK=arr; else window.EP_GLOBAL_MAT=arr; var mat=type==='mat'?arr:getServer('mat'); var work=type==='work'?arr:getServer('work'); writeObj(LS_SERVER_CACHE,{matDB:mat,workDB:work,ts:Date.now()}); try{ window.EP_FORCE_GLOBAL={matDB:mat,workDB:work}; window.EP_ULTIMATE_DB_CACHE={matDB:mat,workDB:work,ts:Date.now()}; window.EP_GLOBAL_DB_VISIBLE_CACHE={matDB:mat,workDB:work,ts:Date.now()}; }catch(e){} if(scope()==='global') syncMain('global'); }
  function setMy(type,arr){ arr=unique(arr,type); if(type==='work') window.EP_MY_WORK=arr; else window.EP_MY_MAT=arr; writeArr(type==='work'?LS_MY_WORK:LS_MY_MAT,arr); try{ window.userMatDB=getMy('mat'); window.userWorkDB=getMy('work'); }catch(e){} if(scope()==='my') syncMain('my'); }
  function syncMain(target){ try{ var use=target||scope(); window.matDB=(use==='global'?getServer('mat'):getMy('mat')); window.workDB=(use==='global'?getServer('work'):getMy('work')); try{ matDB=window.matDB; workDB=window.workDB; }catch(e){} }catch(e){} }
  function upsert(arr,type,it,replace){ arr=Array.isArray(arr)?arr.slice():[]; it=clone(it); if(!it.id)it.id=(type==='work'?'w':'m')+'_imp_v9_'+Date.now()+'_'+Math.random().toString(36).slice(2,8); if(it.sc&&!it.g)it.g=it.sc; if(it.g&&!it.sc)it.sc=it.g; if(!it.c)it.c='Разное'; if(!it.u)it.u='шт'; var k=sig(type,it); var idx=arr.findIndex(function(x){ return sig(type,x)===k || (it.id&&String(x.id||'')===String(it.id)); }); if(idx>=0){ arr[idx]=replace?Object.assign({},it,{id:(arr[idx]&&arr[idx].id)||it.id}):Object.assign({},arr[idx],it,{id:(arr[idx]&&arr[idx].id)||it.id}); } else arr.push(it); return arr; }

  function ensureProgress(){
    if($('ep-v9-progress')) return;
    var d=document.createElement('div'); d.id='ep-v9-progress'; d.style.cssText='position:fixed;inset:0;z-index:100000;background:rgba(15,23,42,.62);display:none;align-items:center;justify-content:center;padding:18px;';
    d.innerHTML='<div style="width:min(460px,94vw);border-radius:20px;background:#fff;box-shadow:0 24px 70px rgba(0,0,0,.35);padding:18px;"><div id="ep-v9-title" style="font-weight:900;color:#4f46e5;font-size:17px;margin-bottom:8px;">Выполняю...</div><div style="height:16px;background:#e5e7eb;border-radius:999px;overflow:hidden;"><div id="ep-v9-fill" style="height:100%;width:0%;background:linear-gradient(90deg,#2563eb,#10b981);transition:width .18s ease;"></div></div><div id="ep-v9-txt" style="font-size:12px;color:#64748b;font-weight:800;margin-top:8px;">0%</div></div>';
    document.body.appendChild(d);
  }
  function progress(title,pct,txt){ ensureProgress(); var p=$('ep-v9-progress'),f=$('ep-v9-fill'),t=$('ep-v9-title'),x=$('ep-v9-txt'); if(p)p.style.display='flex'; if(t)t.textContent=title||'Выполняю...'; if(f)f.style.width=Math.max(0,Math.min(100,Math.round(pct||0)))+'%'; if(x)x.textContent=(txt||'')+' '+Math.max(0,Math.min(100,Math.round(pct||0)))+'%'; try{ if(typeof hideLoader==='function') hideLoader(); }catch(e){} }
  function hideProgress(){ var p=$('ep-v9-progress'); if(p)p.style.display='none'; }
  function explain(e){ var msg=(e&&(e.message||e.code))?String(e.message||e.code):String(e||'Ошибка'); if(/permission|insufficient/i.test(msg)) return 'Firebase запретил запись: Missing or insufficient permissions. Проверь вход админа через Google и Firestore Rules.'; return msg; }

  function inferCat(name,type){
    var n=norm(name); if(type==='work'){ if(/штроб|борозд|резк|алмаз/.test(n))return 'Штробление'; if(/сверл|подрозет/.test(n))return 'Высверливание подрозетников'; if(/щит|автомат|узо|диф|реле/.test(n))return 'Щитовое'; if(/розет|выключ|механизм|рамк|светильник/.test(n))return 'Чистовая электрика'; return 'Работы'; }
    if(/ввг|пугв|провод|кабел|cat|utp|ftp|sat/.test(n))return 'Кабель'; if(/автомат|узо|диф|реле|контактор|узм|уздп/.test(n))return 'Автоматика'; if(/щит|бокс|корпус|din|шина|гребен|клемм/.test(n))return 'Щитовое'; if(/гофр|труб|лоток|канал/.test(n))return 'Трубы'; if(/подрозет|wago|гмл|наконечник|стяж|клипс|дюбел|саморез/.test(n))return 'Расходники'; if(/розет|выключ|рамк|диммер|механизм/.test(n))return 'Чистовое'; return 'Разное';
  }
  function inferSub(name,cat,type){ var n=norm(name); if(type==='work'){ if(/подрозет|сверл/.test(n))return 'Подрозетники'; if(/штроб/.test(n))return 'Штробление'; if(/щит/.test(n))return 'Щит'; return 'Работы'; } if(/диф/.test(n))return 'ДИФы'; if(/узо/.test(n))return 'УЗО'; if(/автомат/.test(n))return 'Автоматы'; if(/гребен/.test(n))return 'Гребёнки'; if(/шина|клемм/.test(n))return 'Шинки / клеммники'; if(/подрозет/.test(n))return 'Подрозетники'; if(/ввг/.test(n))return 'ВВГ'; if(/пугв/.test(n))return 'ПуГВ'; return cat||'Разное'; }
  function normItem(raw,type,idx){ raw=raw||{}; var n=clean(raw.n||raw.name||raw.title||raw.item||raw.position||raw['Наименование']||raw['Название']||raw['Имя']||raw['Позиция']); if(!n)return null; var c=clean(raw.c||raw.category||raw.cat||raw.group||raw['Категория'])||inferCat(n,type); var sc=clean(raw.sc||raw.g||raw.subcategory||raw.subcat||raw['Подкатегория']||raw['Группа'])||inferSub(n,c,type); var p=money(raw.p!=null?raw.p:(raw.price!=null?raw.price:(raw.cost!=null?raw.cost:(raw['Цена']||raw['Стоимость'])))); var u=clean(raw.u||raw.unit||raw.measure||raw['Ед']||raw['Ед.']||raw['Единица']||raw['Ед. изм.'])||'шт'; var it={id:raw.id||((type==='work'?'w':'m')+'_imp_v9_'+Date.now()+'_'+idx),n:n,c:c,sc:sc,g:sc,p:p,u:u}; try{ if(typeof window.epAutoGroupItem==='function') it=window.epAutoGroupItem(type,it); }catch(e){} return it; }
  function collectReviewed(){
    var st=window.EP_DB_REVIEW_V6 || window.EP_DB_REVIEW || {}; var type=st.type==='work'?'work':'mat';
    var start=(st.page||0)*PAGE_SIZE, end=Math.min(start+PAGE_SIZE,(st.items||[]).length);
    st.editCache=st.editCache||{}; st.selected=st.selected||{};
    for(var i=start;i<end;i++){
      var base=(st.items||[])[i]||{}; var ch=$('ep-db-check-'+i); if(ch) st.selected[i]=!!ch.checked;
      var n=$('ep-db-name-'+i), c=$('ep-db-cat-'+i), sc=$('ep-db-subcat-'+i), p=$('ep-db-price-'+i), u=$('ep-db-unit-'+i);
      if(n||c||sc||p||u) st.editCache[i]={n:n?n.value:base.n,c:c?c.value:base.c,sc:sc?sc.value:(base.sc||base.g),p:p?p.value:base.p,u:u?u.value:base.u};
    }
    var out=[]; (st.items||[]).forEach(function(base,i){ if(st.selected&&st.selected[i]===false)return; var ed=(st.editCache&&st.editCache[i])||base||{}; var it=normItem({id:base.id,n:ed.n||base.n,c:ed.c||base.c,sc:ed.sc||ed.g||base.sc||base.g,p:ed.p!=null?ed.p:base.p,u:ed.u||base.u},type,i); if(it)out.push(it); });
    return {type:type,items:unique(out,type)};
  }

  async function readGlobalDoc(){
    if(!(typeof db!=='undefined'&&db)) throw new Error('Firebase db не подключён.');
    var snap=await db.collection('settings').doc('global_db').get();
    var data=snap.exists?(snap.data()||{}):{};
    return {matDB:Array.isArray(data.matDB)?data.matDB:[], workDB:Array.isArray(data.workDB)?data.workDB:[], raw:data};
  }
  async function saveGlobalImport(type,items,replace){
    if(!isAdmin()) throw new Error('Импорт в базу сервера может делать только админ.');
    if(!(typeof db!=='undefined'&&db)) throw new Error('Firebase db не подключён.');
    progress('Запись в базу сервера',20,'Читаю текущую базу сервера');
    var current=await readGlobalDoc().catch(function(){ return {matDB:getServer('mat'),workDB:getServer('work'),raw:{}}; });
    var targetArr=(type==='work'?current.workDB:current.matDB).slice();
    items.forEach(function(it,idx){ targetArr=upsert(targetArr,type,it,!!replace); if(idx%25===0) progress('Запись в базу сервера',25+Math.min(40,idx/Math.max(1,items.length)*40),'Добавляю строки'); });
    var finalMat=type==='mat'?unique(targetArr,'mat'):unique(current.matDB,'mat');
    var finalWork=type==='work'?unique(targetArr,'work'):unique(current.workDB,'work');
    setServer('mat',finalMat); setServer('work',finalWork);
    progress('Запись в базу сервера',72,'Отправляю в Firebase settings/global_db');
    await db.collection('settings').doc('global_db').set({matDB:finalMat,workDB:finalWork,cleanMode:true,updatedAt:new Date().toISOString(),updatedBy:currentUserLabel()}, {merge:true});
    progress('Запись в базу сервера',88,'Проверяю запись');
    var verify=await readGlobalDoc();
    setServer('mat',verify.matDB); setServer('work',verify.workDB); syncMain('global');
    var savedCount=(type==='work'?verify.workDB:verify.matDB).length;
    if(savedCount < items.length) throw new Error('Firebase вернул слишком мало позиций после записи. Проверь правила или структуру settings/global_db.');
    return savedCount;
  }
  async function saveMyImport(type,items,replace){
    var arr=getMy(type); items.forEach(function(it,idx){ arr=upsert(arr,type,it,!!replace); if(idx%25===0) progress('Запись в мою базу',20+Math.min(40,idx/Math.max(1,items.length)*40),'Добавляю строки'); });
    setMy(type,arr); progress('Запись в мою базу',68,'Локально сохранено');
    if(typeof db!=='undefined'&&db&&uid()){
      await db.collection('user_db').doc(uid()).set({uid:uid(),masterName:(window.appUser&&(appUser.name||appUser.email||appUser.phone))||'',matDB:getMy('mat'),workDB:getMy('work'),created:true,updatedAt:new Date().toISOString()}, {merge:true});
      progress('Запись в мою базу',90,'Сервер подтвердил');
    }
    return getMy(type).length;
  }
  async function sendServerProposal(type,items){
    if(!(typeof db!=='undefined'&&db)) throw new Error('Firebase db не подключён.');
    progress('Отправляю заявку админу',60,'db_proposals');
    await db.collection('db_proposals').add({type:type,items:items.map(clone),reason:'import_to_server',target:'server_db',uid:uid(),masterName:(window.appUser&&(appUser.name||appUser.email||appUser.phone))||'',userEmail:currentUserLabel(),status:'pending',createdAt:new Date().toISOString()});
    return true;
  }
  function rerender(){ try{ syncMain(scope()); if(typeof renderDbEditors==='function') renderDbEditors(); }catch(e){} try{ if(typeof rf==='function') rf(); }catch(e){} }

  window.epTriggerDbFileImport=function(type){
    type=type==='work'?'work':'mat';
    var target=scope()==='global'?(isAdmin()?'global':'server_proposal'):'my';
    window.EP_V9_IMPORT_TARGET=target;
    window.EP_V7_IMPORT_TARGET=target;
    if(target==='my') setScope('my');
    var input=$('ep-db-file-input');
    if(!input){ if(typeof oldTrigger==='function') return oldTrigger(type); return toast('Поле выбора файла не найдено'); }
    input.value='';
    input.onchange=function(e){
      window.EP_V9_IMPORT_TARGET=target;
      window.EP_V7_IMPORT_TARGET=target;
      if(typeof oldTrigger==='function'){
        // The old handler is not called here because it would reset onchange.
      }
      var file=e.target.files&&e.target.files[0];
      if(!file)return;
      // Use the existing reader if V7/V6 already installed it by calling original read through old public handler is impossible,
      // so reproduce the simple reliable path: delegate to oldTrigger only when no FileReader parser exists is not safe.
      // Instead call the latest visible V7 trigger parser by temporarily restoring target and using old input reader fallback if present.
      if(window.epReadDbFileV9){ return window.epReadDbFileV9(file,type,target); }
      toast('Ошибка: парсер импорта V9 не загрузился');
    };
    input.click();
  };

  function fileText(file){ return new Promise(function(res,rej){ var r=new FileReader(); r.onload=function(){res(String(r.result||''));}; r.onerror=rej; r.readAsText(file); }); }
  function fileBuffer(file){ return new Promise(function(res,rej){ var r=new FileReader(); r.onload=function(){res(r.result);}; r.onerror=rej; r.readAsArrayBuffer(file); }); }
  function csvRows(txt){ return String(txt||'').split(/\r?\n/).map(function(line){ return line.split(';').length>=line.split(',').length?line.split(';'):line.split(','); }); }
  function rowsToItems(rows,type){
    rows=rows||[]; var header=null,currentCat='',currentSub='',out=[];
    function cell(row,i){ return clean((row||[])[i]); }
    rows.forEach(function(row){
      row=(row||[]).map(clean); var non=row.filter(Boolean); if(!non.length)return;
      var joined=norm(non.join(' '));
      if(/наимен|назван|имя|позиция|товар|работ|цена|стоим|ед/.test(joined)&&!header){
        header={}; row.forEach(function(v,i){ var s=norm(v); if(/наимен|назван|имя|позиция|товар|материал|работ/.test(s))header.name=i; if(/категор/.test(s)&&header.cat==null)header.cat=i; if(/подкат|группа|раздел/.test(s))header.sub=i; if(/цена|стоим|прайс/.test(s))header.price=i; if(/ед|изм/.test(s))header.unit=i; }); return;
      }
      var priceIdx=-1,unitIdx=-1;
      row.forEach(function(v,i){ if(priceIdx<0&&money(v)>0&&/^[-\d\s.,]+/.test(v))priceIdx=i; if(unitIdx<0&&/^(шт|м|м\.п\.?|пог\.м|уп|упак|компл|кг|л|рул|бухта)$/i.test(v))unitIdx=i; });
      if(header){ var hn=cell(row,header.name); if(hn)out.push(normItem({n:hn,c:cell(row,header.cat),sc:cell(row,header.sub),p:cell(row,header.price),u:cell(row,header.unit)},type,out.length)); return; }
      if(priceIdx<0&&non.length<=2){ var title=non.join(' '); if(type==='work'||/работ|монтаж|штроб|резк|сверл|демонтаж/i.test(title)){currentCat=title;currentSub='';} else if(!currentCat)currentCat=title; else currentSub=title; return; }
      var candidates=row.map(function(v,i){return {v:v,i:i};}).filter(function(x){return x.v&&x.i!==priceIdx&&x.i!==unitIdx&&!/^[-\d\s.,]+$/.test(x.v);});
      if(!candidates.length)return; candidates.sort(function(a,b){return b.v.length-a.v.length;}); var name=candidates[0].v; if(name.length<3)return;
      out.push(normItem({n:name,c:currentCat||inferCat(name,type),sc:currentSub||inferSub(name,currentCat,type),p:priceIdx>=0?row[priceIdx]:0,u:unitIdx>=0?row[unitIdx]:'шт'},type,out.length));
    });
    return out.filter(Boolean);
  }
  function jsonToItems(raw,type){ if(raw&&raw.matDB&&type==='mat')raw=raw.matDB; else if(raw&&raw.workDB&&type==='work')raw=raw.workDB; else if(raw&&Array.isArray(raw.items))raw=raw.items; else if(raw&&Array.isArray(raw.data))raw=raw.data; else if(raw&&typeof raw==='object'&&!Array.isArray(raw))raw=Object.keys(raw).map(function(k){return raw[k];}); if(!Array.isArray(raw))raw=[]; return raw.map(function(x,i){return normItem(x,type,i);}).filter(Boolean); }
  function showReviewV9(items,type,source,target){
    items=unique((items||[]).filter(Boolean),type); var selected={}; items.forEach(function(_,i){selected[i]=true;});
    window.EP_DB_REVIEW_V6={type:type,items:items,source:source||'',page:0,selected:selected,editCache:{}};
    window.EP_DB_REVIEW={type:type,items:items,source:source||''}; window.EP_V9_IMPORT_TARGET=target; window.EP_V7_IMPORT_TARGET=target;
    var title=$('ep-db-ai-review-title'); if(title) title.innerText='Импорт '+(type==='work'?'работ':'материалов')+': '+(source||'файл')+' → '+(target==='global'?'База сервера':target==='server_proposal'?'Заявка админу':'Моя база');
    if(typeof window.epReviewPageV6==='function') window.epReviewPageV6(0); else {
      var list=$('ep-db-ai-review-list'); if(list) list.innerHTML=items.map(function(it,i){ return '<div class="ep-db-review-row"><input type="checkbox" id="ep-db-check-'+i+'" checked><div class="ep-db-review-fields"><div><label>Имя</label><input id="ep-db-name-'+i+'" value="'+esc(it.n)+'"></div><div class="ep-db-review-2col"><div><label>Категория</label><input id="ep-db-cat-'+i+'" value="'+esc(it.c)+'"></div><div><label>Подкатегория</label><input id="ep-db-subcat-'+i+'" value="'+esc(it.sc||it.g||'Разное')+'"></div></div><div class="ep-db-review-2col"><div><label>Цена</label><input id="ep-db-price-'+i+'" type="number" value="'+(Number(it.p)||0)+'"></div><div><label>Единица</label><input id="ep-db-unit-'+i+'" value="'+esc(it.u||'шт')+'"></div></div></div></div>'; }).join('');
    }
    try{ if(typeof openModal==='function') openModal('ep-db-ai-review-modal'); }catch(e){ var m=$('ep-db-ai-review-modal'); if(m)m.style.display='flex'; }
    setTimeout(hideProgress,200);
  }
  window.epReadDbFileV9=async function(file,type,target){
    progress('Импорт базы',5,'Читаю файл');
    try{
      var name=file.name||'', lower=name.toLowerCase(), items=[];
      if(/\.json$/i.test(lower)){ var txt=await fileText(file); progress('Импорт базы',45,'Разбор JSON'); items=jsonToItems(JSON.parse(txt),type); }
      else if(/\.(xlsx|xls)$/i.test(lower)){ if(!window.XLSX) throw new Error('Библиотека XLSX не загрузилась. Сохраните файл как CSV или JSON.'); var ab=await fileBuffer(file); progress('Импорт базы',45,'Разбор Excel'); var wb=XLSX.read(ab,{type:'array'}), rows=[]; wb.SheetNames.forEach(function(sh){ rows=rows.concat(XLSX.utils.sheet_to_json(wb.Sheets[sh],{header:1,defval:''})); }); progress('Импорт базы',75,'Подготовка строк'); items=rowsToItems(rows,type); }
      else if(/\.csv$/i.test(lower)){ items=rowsToItems(csvRows(await fileText(file)),type); }
      else if(file.type&&file.type.indexOf('image/')===0){ hideProgress(); if(typeof oldTrigger==='function') return oldTrigger(type); throw new Error('Для фото нужен старый ИИ-импорт.'); }
      else { items=rowsToItems(csvRows(await fileText(file)),type); }
      progress('Импорт базы',100,'Открываю проверку'); showReviewV9(items,type,name,target);
    }catch(e){ hideProgress(); toast('❌ '+explain(e)); console.error('EP V9 read import failed',e); }
  };

  window.epOpenTextImport=function(type){
    type=type==='work'?'work':'mat'; var target=scope()==='global'?(isAdmin()?'global':'server_proposal'):'my'; window.EP_V9_IMPORT_TARGET=target; window.EP_V7_IMPORT_TARGET=target;
    if(typeof oldOpenText==='function') return oldOpenText(type);
    var t=$('ep-text-import-title'); if(t)t.innerText='Импорт '+(type==='work'?'работ':'материалов')+' из текста'; var v=$('ep-text-import-value'); if(v)v.value=''; try{openModal('ep-text-import-modal');}catch(e){}
  };

  window.epApplyReviewedDbItems=async function(mode){
    var data=collectReviewed(), type=data.type, items=data.items; if(!items.length) return toast('Нет выбранных позиций');
    var target=window.EP_V9_IMPORT_TARGET || window.EP_V7_IMPORT_TARGET || (scope()==='global'?(isAdmin()?'global':'server_proposal'):'my');
    progress(target==='global'?'Запись в базу сервера':target==='server_proposal'?'Отправка заявки':'Запись в мою базу',10,'Подготовка');
    try{
      var total=0;
      if(target==='global'){
        total=await saveGlobalImport(type,items,mode==='replace');
        setScope('global'); syncMain('global'); rerender();
        try{ if(typeof closeModal==='function') closeModal('ep-db-ai-review-modal'); }catch(e){}
        progress('Запись в базу сервера',100,'Готово'); setTimeout(hideProgress,500);
        toast('✅ Импорт улетел в базу сервера и сохранён: '+items.length+' поз. Сейчас на сервере: '+total+'.');
      } else if(target==='server_proposal'){
        await sendServerProposal(type,items); try{ if(typeof closeModal==='function') closeModal('ep-db-ai-review-modal'); }catch(e){}
        progress('Отправка заявки',100,'Готово'); setTimeout(hideProgress,500); toast('✅ Импорт отправлен админу заявкой: '+items.length+' поз.');
      } else {
        setScope('my'); total=await saveMyImport(type,items,mode==='replace'); syncMain('my'); rerender(); try{ if(typeof closeModal==='function') closeModal('ep-db-ai-review-modal'); }catch(e){}
        progress('Запись в мою базу',100,'Готово'); setTimeout(hideProgress,500); toast('✅ Импорт сохранён в моей базе: '+items.length+' поз. Сейчас в моей базе: '+total+'.');
      }
    }catch(e){ hideProgress(); toast('❌ '+explain(e)); console.error('EP V9 apply import failed',e); }
    finally{ window.EP_V9_IMPORT_TARGET=null; window.EP_V7_IMPORT_TARGET=null; }
  };

  window.epFirebaseDbDebug=function(){
    var info={scope:scope(),target:window.EP_V9_IMPORT_TARGET||window.EP_V7_IMPORT_TARGET||'',isAdmin:isAdmin(),uid:uid(),user:currentUserLabel(),serverMat:getServer('mat').length,serverWork:getServer('work').length,myMat:getMy('mat').length,myWork:getMy('work').length};
    console.log('EP V9 Firebase DB debug',info);
    alert('Проверка базы V9\n\nАктивно: '+(scope()==='global'?'База сервера':'Моя база')+'\nЦель импорта: '+(info.target||'не выбрана')+'\nАдмин: '+(info.isAdmin?'да':'нет')+'\nПользователь: '+(info.user||'нет')+'\nUID: '+(info.uid||'нет')+'\nСервер: '+info.serverMat+' мат / '+info.serverWork+' раб\nМоя база: '+info.myMat+' мат / '+info.myWork+' раб');
    return info;
  };

  try{ syncMain(scope()); }catch(e){}
})();


/* =========================================================
 * SOURCE: block-19.js
 * AUTO TARGET: 04-database.js
 * SCORE: 98
 * HITS: db, материал, работ, import, epSetDbScope
 * ========================================================= */

/*
 * Extracted from public/index.html
 * Original script block: 19
 * Original HTML lines: 8832-9134
 */

/* === EP DB ADMIN SETTINGS + AI STABILITY V11 ===
   Surgical patch:
   1) Normal "База данных" no longer writes/imports into server DB just because user is admin.
   2) Server DB write/import mode is enabled only from Settings -> Admin panel.
   3) AI photo/PDF import gets real progress overlay, image compression and timeout so it cannot hang forever at 35%.
   Does not touch shield logic.
*/
(function(){
  if(window.EP_DB_ADMIN_SETTINGS_AI_STABILITY_V11) return;
  window.EP_DB_ADMIN_SETTINGS_AI_STABILITY_V11 = true;

  function $(id){ return document.getElementById(id); }
  function txt(el){ return String((el && (el.textContent || el.innerText)) || '').replace(/\s+/g,' ').trim(); }
  function toast(t){ try{ if(typeof showToast==='function') showToast(t); else alert(t); }catch(e){ console.log(t); } }
  function scope(){ try{ return localStorage.getItem('ep_db_scope_v2') === 'global' ? 'global' : 'my'; }catch(e){ return 'my'; } }
  function isAdmin(){
    try{
      var u = window.appUser || {};
      var email = String(u.email || u.userEmail || u.mail || '').toLowerCase();
      return !!(u.role === 'admin' || u.isAdmin === true || email === 'vits0007@gmail.com');
    }catch(e){ return false; }
  }
  function adminServerMode(){ return !!(window.EP_ADMIN_SERVER_DB_EDIT === true && isAdmin()); }
  function explainServerEdit(){ return '🌍 Базу сервера меняем только через Настройки → Админ панель → База сервера. Здесь сервер открыт для просмотра/выбора, чтобы случайно не залить личный импорт в глобальную базу.'; }

  function ensureProgress(){
    if($('ep-v11-progress')) return;
    var d = document.createElement('div');
    d.id = 'ep-v11-progress';
    d.style.cssText = 'position:fixed;inset:0;z-index:100000;background:rgba(15,23,42,.64);display:none;align-items:center;justify-content:center;padding:18px;';
    d.innerHTML = '<div style="width:min(460px,94vw);border-radius:22px;background:var(--card-bg,#fff);box-shadow:0 24px 70px rgba(0,0,0,.35);padding:18px;border:1px solid var(--border,#e5e7eb);">'
      + '<div id="ep-v11-progress-title" style="font-weight:900;color:var(--primary,#4f46e5);font-size:17px;margin-bottom:8px;">Выполняю...</div>'
      + '<div style="height:16px;background:rgba(148,163,184,.25);border-radius:999px;overflow:hidden;border:1px solid rgba(148,163,184,.35);"><div id="ep-v11-progress-fill" style="height:100%;width:0%;background:linear-gradient(90deg,#2563eb,#10b981);transition:width .18s ease;"></div></div>'
      + '<div id="ep-v11-progress-txt" style="font-size:12px;color:var(--gray,#64748b);font-weight:800;margin-top:8px;">0%</div>'
      + '<div id="ep-v11-progress-hint" style="font-size:11px;color:var(--gray,#64748b);margin-top:8px;line-height:1.35;">Не закрывай экран до завершения.</div>'
      + '</div>';
    document.body.appendChild(d);
  }
  window.epDbProgress = function(title,pct,text){
    ensureProgress();
    var p=$('ep-v11-progress'), f=$('ep-v11-progress-fill'), t=$('ep-v11-progress-title'), x=$('ep-v11-progress-txt');
    var n = Math.max(0, Math.min(100, Math.round(Number(pct)||0)));
    if(p) p.style.display='flex';
    if(t) t.textContent = title || 'Выполняю...';
    if(f) f.style.width = n + '%';
    if(x) x.textContent = (text || '') + ' ' + n + '%';
    try{ if(typeof hideLoader==='function') hideLoader(); }catch(e){}
  };
  window.epDbHideProgress = function(){
    var p=$('ep-v11-progress'); if(p) p.style.display='none';
    try{ if(typeof hideLoader==='function') hideLoader(); }catch(e){}
  };

  function setScope(s){
    try{ localStorage.setItem('ep_db_scope_v2', s === 'global' ? 'global' : 'my'); }catch(e){}
    try{ if(typeof window.epSetDbScope === 'function') window.epSetDbScope(s === 'global' ? 'global' : 'my'); }catch(e){}
  }
  window.epOpenAdminServerDbFromSettings = function(){
    if(!isAdmin()) return toast('Только админ может редактировать базу сервера');
    window.EP_ADMIN_SERVER_DB_EDIT = true;
    window.EP_OPENING_ADMIN_SERVER_DB = true;
    try{ localStorage.setItem('ep_db_scope_v2','global'); }catch(e){}
    try{ if(typeof openModal === 'function') openModal('settModal'); }catch(e){ var m=$('settModal'); if(m)m.style.display='flex'; }
    setTimeout(function(){
      setScope('global');
      window.EP_OPENING_ADMIN_SERVER_DB = false;
      patchDbUi();
      toast('👑 Включён режим админа: можно менять базу сервера');
    },120);
  };

  var oldOpenModal = window.openModal;
  if(typeof oldOpenModal === 'function' && !oldOpenModal.__ep_v11_wrapped){
    var wrappedOpen = function(id){
      if(id === 'settModal' && !window.EP_OPENING_ADMIN_SERVER_DB){
        window.EP_ADMIN_SERVER_DB_EDIT = false;
      }
      var r = oldOpenModal.apply(this, arguments);
      setTimeout(patchDbUi,120);
      return r;
    };
    wrappedOpen.__ep_v11_wrapped = true;
    window.openModal = wrappedOpen;
  }

  function installAdminSettingsButton(){
    var panel = $('admin-panel');
    if(!panel || $('ep-v11-admin-server-db-btn')) return;
    var box = document.createElement('div');
    box.id = 'ep-v11-admin-server-db-btn';
    box.style.cssText = 'margin:12px 0;padding:10px;border:1px solid var(--primary);border-radius:12px;background:rgba(79,70,229,.07);';
    box.innerHTML = '<div style="font-weight:900;color:var(--primary);margin-bottom:6px;">🌍 База сервера</div>'
      + '<div style="font-size:11px;color:var(--gray);line-height:1.35;margin-bottom:8px;">Импорт, замена, цены и сохранение глобальной базы выполняются только отсюда, чтобы личный импорт админа случайно не улетел на сервер.</div>'
      + '<button type="button" class="btn-primary" style="width:100%;padding:12px;margin:0;" onclick="epOpenAdminServerDbFromSettings()">👑 Открыть редактирование базы сервера</button>';
    var firstH = panel.querySelector('h4');
    if(firstH) panel.insertBefore(box, firstH); else panel.appendChild(box);
  }

  function normalDbButtonWasClicked(e){
    var b = e && e.target && e.target.closest ? e.target.closest('button') : null;
    if(!b) return false;
    var s = txt(b);
    return /База данных/.test(s) && !/База сервера/.test(s) && b.id !== 'ep-v11-admin-server-db-btn';
  }
  document.addEventListener('click', function(e){
    if(normalDbButtonWasClicked(e)) window.EP_ADMIN_SERVER_DB_EDIT = false;
    setTimeout(function(){ installAdminSettingsButton(); patchDbUi(); },80);
  }, true);

  var oldSetDbScope = window.epSetDbScope;
  if(typeof oldSetDbScope === 'function' && !oldSetDbScope.__ep_v11_wrapped){
    var wrappedScope = function(s){
      var r = oldSetDbScope.apply(this, arguments);
      setTimeout(patchDbUi,120);
      return r;
    };
    wrappedScope.__ep_v11_wrapped = true;
    window.epSetDbScope = wrappedScope;
  }

  function patchDbUi(){
    installAdminSettingsButton();
    var isGlobal = scope() === 'global';
    var serverEdit = adminServerMode();
    var panel = $('ep-v7-db-panel');
    if(panel){
      var oldNote = $('ep-v11-server-mode-note'); if(oldNote) oldNote.remove();
      var note = document.createElement('div');
      note.id = 'ep-v11-server-mode-note';
      note.style.cssText = 'font-size:11px;font-weight:900;line-height:1.35;margin:8px 0;padding:9px;border-radius:12px;';
      if(isGlobal && serverEdit){
        note.style.border = '1px solid var(--danger)'; note.style.color = 'var(--danger)'; note.style.background='rgba(239,68,68,.08)';
        note.textContent = '👑 Режим админа: разрешены импорт, замена, цены и сохранение базы сервера.';
        panel.insertBefore(note, panel.firstChild);
      } else if(isGlobal){
        note.style.border = '1px solid var(--border)'; note.style.color = 'var(--gray)'; note.style.background='rgba(100,116,139,.08)';
        note.textContent = explainServerEdit();
        panel.insertBefore(note, panel.firstChild);
      }
      Array.prototype.forEach.call(panel.querySelectorAll('button'), function(btn){
        var s=txt(btn);
        if(isGlobal && !serverEdit && /Импорт|текстом|заявк|Сохранить базу|Очистка сервера|Очистка \/ сброс/.test(s)){
          btn.style.display='none';
        }
      });
    }
    var addBtn = document.querySelector('#settModal button[onclick="addDbItem()"]');
    if(addBtn){
      var block=addBtn.parentElement;
      if(block) block.style.display = (!isGlobal || serverEdit) ? 'block' : 'none';
      addBtn.textContent = isGlobal ? '+ Добавить в базу сервера' : '+ Добавить в мою базу';
    }
    if(isGlobal && !serverEdit){
      Array.prototype.forEach.call(document.querySelectorAll('#editor-mat-list input,#editor-work-list input,#editor-mat-list select,#editor-work-list select,#editor-mat-list textarea,#editor-work-list textarea'), function(el){ el.disabled = true; });
      Array.prototype.forEach.call(document.querySelectorAll('#editor-mat-list button,#editor-work-list button'), function(btn){
        var s=txt(btn);
        if(/Сохранить|Удалить|Замени|✕|🗑/.test(s)) btn.style.display='none';
      });
    }
  }

  var oldAddDbItem = window.addDbItem;
  if(typeof oldAddDbItem === 'function' && !oldAddDbItem.__ep_v11_wrapped){
    var wrappedAdd = function(){
      if(scope()==='global' && !adminServerMode()) return toast(explainServerEdit());
      return oldAddDbItem.apply(this, arguments);
    };
    wrappedAdd.__ep_v11_wrapped = true;
    window.addDbItem = wrappedAdd;
  }
  var oldSaveActive = window.epSaveActiveDbV7;
  if(typeof oldSaveActive === 'function' && !oldSaveActive.__ep_v11_wrapped){
    var wrappedSave = async function(){
      if(scope()==='global' && !adminServerMode()) return toast(explainServerEdit());
      return oldSaveActive.apply(this, arguments);
    };
    wrappedSave.__ep_v11_wrapped = true;
    window.epSaveActiveDbV7 = wrappedSave;
  }

  function importTarget(){
    if(scope() === 'global'){
      if(adminServerMode()) return 'global';
      return 'blocked_server_edit';
    }
    return 'my';
  }
  var oldTriggerImport = window.epTriggerDbFileImport;
  window.epTriggerDbFileImport = function(type){
    type = type === 'work' ? 'work' : 'mat';
    var target = importTarget();
    if(target === 'blocked_server_edit') return toast(explainServerEdit());
    window.EP_V9_IMPORT_TARGET = target;
    window.EP_V7_IMPORT_TARGET = target;
    if(target === 'my') setScope('my');
    var input = $('ep-db-file-input');
    if(!input){ if(typeof oldTriggerImport === 'function') return oldTriggerImport(type); return toast('Поле выбора файла не найдено'); }
    input.setAttribute('accept','.xlsx,.xls,.csv,.json,.txt,.pdf,image/*');
    input.value = '';
    input.onchange = function(e){
      var file = e.target.files && e.target.files[0];
      if(!file) return;
      window.EP_V9_IMPORT_TARGET = target;
      window.EP_V7_IMPORT_TARGET = target;
      if(typeof window.epReadDbFileV9 === 'function') return window.epReadDbFileV9(file,type,target);
      return toast('Парсер импорта не найден');
    };
    input.click();
  };

  var oldOpenText = window.epOpenTextImport;
  window.epOpenTextImport = function(type){
    type = type === 'work' ? 'work' : 'mat';
    var target = importTarget();
    if(target === 'blocked_server_edit') return toast(explainServerEdit());
    window.EP_DB_REVIEW = window.EP_DB_REVIEW || {};
    window.EP_DB_REVIEW.type = type;
    window.EP_V9_IMPORT_TARGET = target;
    window.EP_V7_IMPORT_TARGET = target;
    if(target === 'my') setScope('my');
    var title = $('ep-text-import-title'); if(title) title.textContent = 'Импорт ' + (type==='work'?'работ':'материалов') + ' из текста → ' + (target==='global'?'База сервера':'Моя база');
    var val = $('ep-text-import-value'); if(val) val.value = '';
    try{ if(typeof openModal === 'function') openModal('ep-text-import-modal'); }catch(e){ var m=$('ep-text-import-modal'); if(m)m.style.display='flex'; }
  };

  var oldApply = window.epApplyReviewedDbItems;
  if(typeof oldApply === 'function' && !oldApply.__ep_v11_wrapped){
    var wrappedApply = async function(mode){
      var target = window.EP_V9_IMPORT_TARGET || window.EP_V7_IMPORT_TARGET || (scope()==='global'?'global':'my');
      if(target === 'global' && !adminServerMode()){
        window.EP_V9_IMPORT_TARGET = null; window.EP_V7_IMPORT_TARGET = null;
        return toast(explainServerEdit());
      }
      return oldApply.apply(this, arguments);
    };
    wrappedApply.__ep_v11_wrapped = true;
    window.epApplyReviewedDbItems = wrappedApply;
  }

  async function compressImageDataUrl(dataUrl){
    dataUrl = String(dataUrl || '');
    if(!/^data:image\//i.test(dataUrl)) return dataUrl;
    if(dataUrl.length < 1200000) return dataUrl;
    return new Promise(function(resolve){
      var img = new Image();
      img.onload = function(){
        try{
          var maxSide = 1700;
          var w = img.naturalWidth || img.width || 0, h = img.naturalHeight || img.height || 0;
          if(!w || !h) return resolve(dataUrl);
          var k = Math.min(1, maxSide / Math.max(w,h));
          var canvas = document.createElement('canvas');
          canvas.width = Math.max(1, Math.round(w*k));
          canvas.height = Math.max(1, Math.round(h*k));
          var ctx = canvas.getContext('2d');
          ctx.drawImage(img,0,0,canvas.width,canvas.height);
          resolve(canvas.toDataURL('image/jpeg',0.82));
        }catch(e){ resolve(dataUrl); }
      };
      img.onerror = function(){ resolve(dataUrl); };
      img.src = dataUrl;
    });
  }
  function timeoutPromise(ms, label){
    return new Promise(function(_,reject){
      setTimeout(function(){ reject(new Error(label || 'ИИ долго не отвечает. Попробуй фото крупнее/светлее, меньший PDF или другой ИИ-провайдер.')); }, ms);
    });
  }
  var oldAskAI = window.epAskAI;
  if(typeof oldAskAI === 'function' && !oldAskAI.__ep_v11_wrapped){
    var wrappedAsk = async function(promptText, opts){
      opts = opts || {};
      var isFile = !!(opts.imageDataUrl || opts.fileDataUrl);
      var title = opts.fileDataUrl ? 'ИИ-импорт PDF' : (opts.imageDataUrl ? 'ИИ-импорт фото' : 'ИИ');
      var pct = 36;
      var timer = null;
      try{
        if(opts.imageDataUrl){
          window.epDbProgress(title,28,'Сжимаю фото для телефона');
          opts = Object.assign({}, opts, { imageDataUrl: await compressImageDataUrl(opts.imageDataUrl) });
        }
        if(isFile){
          timer = setInterval(function(){
            pct = Math.min(82, pct + 4);
            window.epDbProgress(title,pct,'ИИ обрабатывает файл, жду ответ');
          }, 4500);
        }
        var ms = opts.fileDataUrl ? 120000 : (opts.imageDataUrl ? 90000 : 70000);
        return await Promise.race([oldAskAI.call(this, promptText, opts), timeoutPromise(ms)]);
      }finally{
        if(timer) clearInterval(timer);
      }
    };
    wrappedAsk.__ep_v11_wrapped = true;
    window.epAskAI = wrappedAsk;
  }

  function patchAll(){ installAdminSettingsButton(); patchDbUi(); }
  document.addEventListener('DOMContentLoaded', function(){ setTimeout(patchAll,300); setTimeout(patchAll,1200); });
  setInterval(function(){ var m=$('settModal'); if(m && (m.style.display==='flex' || m.style.display==='block')) patchDbUi(); installAdminSettingsButton(); },900);
})();


/* =========================================================
 * SOURCE: block-20.js
 * AUTO TARGET: 04-database.js
 * SCORE: 88
 * HITS: db, base, matDB, workDB, материал, global_db, user_db, category, subcategory
 * ========================================================= */

/*
 * Extracted from public/index.html
 * Original script block: 20
 * Original HTML lines: 9137-9406
 */

/* === EP V12 SURGICAL FIX: shield work names + instant swap modal ===
   Fixes:
   1) "Установка БП в щит" no longer appears from shield generator.
   2) Bare wall material work name "Бетон/Кирпич/..." becomes "Штроба 100×50, под трассу кабелей (...)".
   3) Replace-position modal uses already loaded DB caches and never waits forever on Firebase.
   Shield math is not changed.
*/
(function(){
  var V='EP_V12_SWAP_SHIELD_FIX';
  function $(id){ return document.getElementById(id); }
  function toast(t){ try{ if(typeof showToast==='function') showToast(t); else console.log(t); }catch(e){ console.log(t); } }
  function esc(s){ return String(s==null?'':s).replace(/[&<>"']/g,function(m){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m];}); }
  function norm(s){ return String(s||'').toLowerCase().replace(/ё/g,'е').replace(/[×х]/g,'x').replace(/[^a-zа-я0-9]+/g,' ').trim(); }
  function money(v){ var n=Number(String(v==null?'':v).replace(',','.').replace(/[^0-9.\-]/g,'')); return Number.isFinite(n)?n:0; }
  function appPrice(key, def){ try{ return money((window.appLogic||{})[key]) || def; }catch(e){ return def; } }
  function readArr(k){ try{ var a=JSON.parse(localStorage.getItem(k)||'[]'); return Array.isArray(a)?a:[]; }catch(e){ return []; } }
  function readObj(k){ try{ var o=JSON.parse(localStorage.getItem(k)||'{}'); return o&&typeof o==='object'?o:{}; }catch(e){ return {}; } }
  function wallFromName(s){ var n=norm(s); if(/кирпич/.test(n)) return 'Кирпич'; if(/панел/.test(n)) return 'Панелька'; if(/мягк|гкл|гипс/.test(n)) return 'Мягкий материал'; return 'Бетон'; }
  function groupOf(it){ return (it && (it.g || it.sc || it.subcategory || it.group)) || ''; }
  function clone(it){ return Object.assign({}, it||{}); }

  function fixShieldWorkItem(it, originalLabel){
    if(!it) return it;
    var x=it;
    var n=String(x.n||'').trim();
    var label=String(originalLabel||n||'');
    var nl=norm(n), ll=norm(label);

    // Wrong fuzzy match: "Установка щита" was matched to "Установка БП в щит".
    if(/установка\s+бп\s+в\s+щит/i.test(n) || /установка\s+щита/.test(ll)){
      x.n='Установка щита';
      x.p=appPrice('shieldInstallPrice', 2500);
      x.u='шт';
      x.type='work';
      x.c='Щитовое';
      x.g='Монтаж щита';
      x.sc='Монтаж щита';
      x.dbMeta=Object.assign({}, x.dbMeta||{}, {category:'Щитовое', subcategory:'Монтаж щита'});
      delete x.sourceId;
      return x;
    }

    // Wrong fuzzy match: DB row name is only "Бетон", but estimate must show the actual work.
    if((/^(бетон|кирпич|панелька|мягкий мат|мягкий материал)$/.test(nl) && x.type==='work') || /штроба.*100.*50/.test(ll)){
      var wall = wallFromName(label+' '+n);
      x.n='Штроба 100×50, под трассу кабелей ('+wall+')';
      x.p=money(x.p) || appPrice('shieldInputGroovePrice',1500);
      x.u='м.п.';
      x.type='work';
      x.c='Штробление и резка';
      x.g='Штроба 100×50 под трассу кабелей';
      x.sc='Штроба 100×50 под трассу кабелей';
      x.dbMeta=Object.assign({}, x.dbMeta||{}, {category:'Штробление и резка', subcategory:'Штроба 100×50 под трассу кабелей', wall:wall});
      if(/^бетон|кирпич|панелька|мягкий/.test(nl)) delete x.sourceId;
      return x;
    }

    if(/^ниша\s+щита/i.test(n)){
      x.c='Штробление и резка';
      x.g='Ниши щита';
      x.sc='Ниши щита';
      x.u=x.u||'мод.';
      x.dbMeta=Object.assign({}, x.dbMeta||{}, {category:'Штробление и резка', subcategory:'Ниши щита'});
    }
    return x;
  }

  // Patch epWork itself so the shield generator receives clean work items immediately.
  var oldEpWork = window.epWork;
  window.epWork = function(label,q,price,words,meta){
    var l=norm(label);
    if(/установка\s+щита/.test(l)){
      return fixShieldWorkItem({n:'Установка щита', q:q, p:price||appPrice('shieldInstallPrice',2500), u:(meta&&meta.unit)||'шт', type:'work', c:'Щитовое', g:'Монтаж щита', sc:'Монтаж щита', logicPrice:true}, label);
    }
    if(/штроба.*100.*50/.test(l)){
      var wall=wallFromName(label);
      return fixShieldWorkItem({n:'Штроба 100×50, под трассу кабелей ('+wall+')', q:q, p:price||appPrice('shieldInputGroovePrice',1500), u:(meta&&meta.unit)||'м.п.', type:'work', c:'Штробление и резка', g:'Штроба 100×50 под трассу кабелей', sc:'Штроба 100×50 под трассу кабелей', logicPrice:true}, label);
    }
    var r = oldEpWork ? oldEpWork.apply(this, arguments) : {n:label,q:q,p:price||0,u:(meta&&meta.unit)||'шт',type:'work'};
    return fixShieldWorkItem(r, label);
  };
  try{ epWork = window.epWork; }catch(e){}

  function normalizeCurrentEstimate(){
    try{
      if(!Array.isArray(currentEstimate)) return;
      currentEstimate.forEach(function(it){
        if(!it || it.type!=='work') return;
        fixShieldWorkItem(it, it.n);
      });
    }catch(e){ console.warn(V, e); }
  }

  var oldRender = window.renderMainTable;
  if(typeof oldRender==='function' && !oldRender.__ep_v12_wrapped){
    var newRender=function(){ normalizeCurrentEstimate(); return oldRender.apply(this, arguments); };
    newRender.__ep_v12_wrapped=true;
    window.renderMainTable=newRender;
    try{ renderMainTable=window.renderMainTable; }catch(e){}
  }

  var oldAddAuto = window.addAuto;
  if(typeof oldAddAuto==='function' && !oldAddAuto.__ep_v12_wrapped){
    var newAddAuto=function(items, tag){
      try{ (items||[]).forEach(function(it){ if(it && it.type==='work') fixShieldWorkItem(it, it.n); }); }catch(e){}
      var r=oldAddAuto.apply(this, arguments);
      setTimeout(function(){ normalizeCurrentEstimate(); try{ if(typeof renderMainTable==='function') renderMainTable(); }catch(e){} },20);
      return r;
    };
    newAddAuto.__ep_v12_wrapped=true;
    window.addAuto=newAddAuto;
    try{ addAuto=window.addAuto; }catch(e){}
  }

  function patchShieldButton(){
    var base = window.epGenerateShieldFixed || window.generateCascadePanel;
    if(typeof base==='function' && !base.__ep_v12_wrapped){
      var wrapped=function(){
        var r=base.apply(this, arguments);
        setTimeout(function(){ normalizeCurrentEstimate(); try{ if(typeof renderMainTable==='function') renderMainTable(); }catch(e){} },60);
        return r;
      };
      wrapped.__ep_v12_wrapped=true;
      window.epGenerateShieldFixed=wrapped;
      window.generateCascadePanel=wrapped;
      try{ generateCascadePanel=wrapped; }catch(e){}
    }
    Array.prototype.forEach.call(document.querySelectorAll('button'), function(btn){
      if((btn.textContent||'').indexOf('Сгенерировать щит')>=0) btn.onclick=window.generateCascadePanel;
    });
  }

  function tagSrc(it,src){ var x=clone(it); x.__src=src; return fixShieldWorkItem(x, x.n); }
  function pushArr(out, arr, src){ if(Array.isArray(arr)) arr.forEach(function(it){ if(it&&it.n) out.push(tagSrc(it,src)); }); }
  function collectDb(type){
    var out=[];
    var activeScope='my'; try{ activeScope=localStorage.getItem('ep_db_scope_v2')==='global'?'global':'my'; }catch(e){}
    if(type==='work'){
      pushArr(out, activeScope==='global'?(window.workDB||[]):(window.workDB||[]), activeScope==='global'?'global':'my');
      pushArr(out, window.EP_MY_WORK, 'my'); pushArr(out, window.userWorkDB, 'my');
      pushArr(out, window.EP_GLOBAL_WORK, 'global');
      pushArr(out, window.EP_FORCE_GLOBAL && window.EP_FORCE_GLOBAL.workDB, 'global');
      pushArr(out, window.EP_ULTIMATE_DB_CACHE && window.EP_ULTIMATE_DB_CACHE.workDB, 'global');
      pushArr(out, window.EP_GLOBAL_DB_VISIBLE_CACHE && window.EP_GLOBAL_DB_VISIBLE_CACHE.workDB, 'global');
      pushArr(out, readArr('user_db_work_v31'), 'my');
      pushArr(out, readObj('ep_global_cache_force_v1').workDB, 'global');
    } else {
      pushArr(out, activeScope==='global'?(window.matDB||[]):(window.matDB||[]), activeScope==='global'?'global':'my');
      pushArr(out, window.EP_MY_MAT, 'my'); pushArr(out, window.userMatDB, 'my');
      pushArr(out, window.EP_GLOBAL_MAT, 'global');
      pushArr(out, window.EP_FORCE_GLOBAL && window.EP_FORCE_GLOBAL.matDB, 'global');
      pushArr(out, window.EP_ULTIMATE_DB_CACHE && window.EP_ULTIMATE_DB_CACHE.matDB, 'global');
      pushArr(out, window.EP_GLOBAL_DB_VISIBLE_CACHE && window.EP_GLOBAL_DB_VISIBLE_CACHE.matDB, 'global');
      pushArr(out, readArr('user_db_mat_v31'), 'my');
      pushArr(out, readObj('ep_global_cache_force_v1').matDB, 'global');
    }
    var seen={},res=[];
    out.forEach(function(it){
      var k=norm([it.__src,it.c,groupOf(it),it.n,it.u,it.p].join('|'));
      if(seen[k]) return; seen[k]=1; res.push(it);
    });
    return res;
  }

  function classify(it){
    var n=norm([it&&it.n,it&&it.c,groupOf(it),it&&it.kind,it&&it.nominal,it&&it.curve].join(' '));
    if((it&&it.type)==='work'){
      if(/штроб|борозд|алмаз|резк|ниша/.test(n)) return 'work:cut';
      if(/сборка\s+щита/.test(n)) return 'work:shield_assembly';
      if(/установка\s+щита|монтаж\s+электрощит/.test(n)) return 'work:shield_install';
      if(/подключение\s+ввод/.test(n)) return 'work:input_connect';
      if(/прозвон|проверка\s+линий/.test(n)) return 'work:test';
      if(/маркиров/.test(n)) return 'work:mark';
      if(/однолин/.test(n)) return 'work:scheme';
      if(/щит|автомат|узо|диф|реле/.test(n)) return 'work:shield';
      return 'work:other';
    }
    if(/диф/.test(n)) return 'dif';
    if(/узо/.test(n)) return 'uzo';
    if(/контактор/.test(n)) return 'contactor';
    if(/реле\s+напряж|узм/.test(n)) return 'voltage';
    if(/автомат|\b[abcdсавд]\s?\d{1,3}\b|\bc\s?\d{1,3}\b/.test(n)) return 'auto';
    if(/щит|корпус|бокс/.test(n)) return 'shield_box';
    if(/греб/.test(n)) return 'comb';
    if(/шина|клемм/.test(n)) return 'bus';
    if(/din|дин|рейк|огранич/.test(n)) return 'din';
    if(/пугв|провод|кабель|ввг/.test(n)) return 'cable';
    if(/ншви|наконеч/.test(n)) return 'lug';
    if(/маркир|бирк/.test(n)) return 'marking';
    return 'other';
  }
  function sameClass(a,b){
    var ca=classify(a), cb=classify(b);
    if(ca===cb) return true;
    if((a&&a.type)==='work' && (b&&b.type)==='work'){
      if(ca==='work:cut' && cb==='work:cut') return true;
      if(ca.indexOf('work:shield')===0 && cb.indexOf('work:shield')===0) return true;
    }
    return false;
  }
  function score(current, cand){
    var cn=norm([current&&current.n,current&&current.c,groupOf(current)].join(' '));
    var bn=norm([cand&&cand.n,cand&&cand.c,groupOf(cand)].join(' '));
    var s=0;
    if(sameClass(current,cand)) s+=100;
    cn.split(' ').forEach(function(w){ if(w.length>2 && bn.indexOf(w)>=0) s+=2; });
    if((current&&current.c) && norm(current.c)===norm(cand&&cand.c)) s+=10;
    if(groupOf(current) && norm(groupOf(current))===norm(groupOf(cand))) s+=8;
    if(cand.__src==='my') s+=1;
    return s;
  }
  function swapLabel(it){ return (it.__src==='global'?'🌍 ':'👤 ') + (it.n||'Позиция') + ' — ' + (money(it.p)||0) + ' ₽ / ' + (it.u||'шт'); }

  window.EP_V12_SWAP_LIST=[];
  window.openSwapModal=function(idx){
    try{ swapTargetIdx=idx; }catch(e){ window.swapTargetIdx=idx; }
    var current=null; try{ current=currentEstimate[idx]; }catch(e){}
    if(!current) return toast('Позиция не найдена');
    var type=current.type==='work'?'work':'mat';
    var sel=$('swap-select');
    if(sel) sel.innerHTML='<option value="">Открываю загруженную базу...</option>';
    try{ if(typeof openModal==='function') openModal('swapModal'); else { var m=$('swapModal'); if(m)m.style.display='flex'; } }catch(e){}
    setTimeout(function(){
      try{
        var pool=collectDb(type);
        var ranked=pool.map(function(it){ return {it:it, s:score(current,it)}; }).filter(function(x){ return x.s>=100 || sameClass(current,x.it); });
        if(!ranked.length){
          var curCat=norm([current.c, groupOf(current), current.dbMeta&&current.dbMeta.category, current.dbMeta&&current.dbMeta.subcategory].join(' '));
          ranked=pool.map(function(it){ return {it:it, s:score(current,it)}; }).filter(function(x){ return curCat && norm([x.it.c,groupOf(x.it)].join(' ')).indexOf(curCat.split(' ')[0])>=0; });
        }
        if(!ranked.length) ranked=pool.map(function(it){ return {it:it, s:score(current,it)}; });
        ranked.sort(function(a,b){ return b.s-a.s; });
        var list=ranked.map(function(x){ return x.it; }).slice(0,300);
        window.EP_V12_SWAP_LIST=list;
        if(!sel) return;
        if(!list.length){ sel.innerHTML='<option value="">В выбранной базе нет позиций</option>'; return; }
        sel.innerHTML=list.map(function(it,i){ return '<option value="'+i+'">'+esc(swapLabel(it))+'</option>'; }).join('');
        var note=$('ep-swap-note') || $('ep-v12-swap-note');
        if(!note){
          note=document.createElement('div'); note.id='ep-v12-swap-note'; note.style.cssText='font-size:11px;color:var(--gray);font-weight:800;line-height:1.35;margin:8px 0 10px;';
          if(sel.parentNode) sel.parentNode.insertBefore(note, sel.nextSibling);
        }
        note.textContent='Показываю варианты из уже загруженной базы. Найдено: '+list.length+'. Firebase сейчас не ждём, поэтому окно не зависает.';
      }catch(err){ console.error(V,err); if(sel) sel.innerHTML='<option value="">Ошибка загрузки вариантов</option>'; toast('Ошибка списка замен: '+(err.message||err)); }
    },10);
  };

  window.applySwap=function(){
    var idx=-1; try{ idx=swapTargetIdx; }catch(e){ idx=window.swapTargetIdx; }
    if(idx<0) return toast('Не выбрана строка для замены');
    var sel=$('swap-select'); if(!sel || sel.value==='') return toast('Выберите позицию');
    var it=window.EP_V12_SWAP_LIST[Number(sel.value)]; if(!it) return toast('Позиция не найдена');
    var cur=null; try{ cur=currentEstimate[idx]; }catch(e){}
    if(!cur) return toast('Строка сметы не найдена');
    cur.n=it.n; cur.p=money(it.p); cur.u=it.u || cur.u || 'шт'; cur.type=cur.type || it.type || 'mat'; cur.sourceId=it.id || null;
    cur.c=it.c || cur.c || ''; cur.g=groupOf(it) || cur.g || ''; cur.sc=cur.g;
    cur.dbMeta=Object.assign({}, cur.dbMeta||{}, {category:cur.c||'', subcategory:cur.g||'', source:it.__src||''});
    if(cur.type==='work') fixShieldWorkItem(cur, cur.n);
    normalizeCurrentEstimate();
    try{ if(typeof renderMainTable==='function') renderMainTable(); }catch(e){}
    try{ if(typeof closeModal==='function') closeModal('swapModal'); else { var m=$('swapModal'); if(m)m.style.display='none'; } }catch(e){}
    toast('✅ Позиция заменена');
  };

  function boot(){ patchShieldButton(); normalizeCurrentEstimate(); try{ if(typeof renderMainTable==='function') renderMainTable(); }catch(e){} }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded', function(){ setTimeout(boot,200); }); else setTimeout(boot,50);
  setTimeout(boot,1200);
})();


/* =========================================================
 * SOURCE: block-25.js
 * AUTO TARGET: 04-database.js
 * SCORE: 203
 * HITS: db, matDB, workDB, global_db, user_db, bulk, category, subcategory, renderDbEditors, epV18, epSetDbScope
 * ========================================================= */

/*
 * Extracted from public/index.html
 * Original script block: 25
 * Original HTML lines: 9840-10088
 */

/* EP V18: visible checkbox bulk DB, safe active-source move/delete, direct shield generation to main table, colored status badge. */
(function(){
  'use strict';
  var BUILD='V18 BULK + SHIELD DIRECT 2026-05-15';
  var LS_SCOPE='ep_db_scope_v2';
  var LS_MY_MAT='user_db_mat_v31';
  var LS_MY_WORK='user_db_work_v31';
  var LS_SERVER_CACHE='ep_global_cache_force_v1';
  var lastOpenedType='mat';
  function $(id){ return document.getElementById(id); }
  function esc(v){ return String(v==null?'':v).replace(/[&<>"']/g,function(m){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m];}); }
  function clean(v){ return String(v==null?'':v).replace(/\s+/g,' ').trim(); }
  function norm(v){ return clean(v).toLowerCase().replace(/ё/g,'е').replace(/×/g,'x').replace(/х/g,'x'); }
  function toast(t){ try{ if(typeof showToast==='function') showToast(t); else console.log(t); }catch(e){ console.log(t); } }
  function arrLS(k){ try{ var a=JSON.parse(localStorage.getItem(k)||'[]'); return Array.isArray(a)?a:[]; }catch(e){ return []; } }
  function objLS(k){ try{ var o=JSON.parse(localStorage.getItem(k)||'{}'); return o&&typeof o==='object'?o:{}; }catch(e){ return {}; } }
  function setLS(k,v){ try{ if(typeof safeSet==='function') safeSet(k,JSON.stringify(v||[])); else localStorage.setItem(k,JSON.stringify(v||[])); }catch(e){ try{ localStorage.setItem(k,JSON.stringify(v||[])); }catch(_e){} } }
  function setObjLS(k,o){ try{ localStorage.setItem(k,JSON.stringify(o||{})); }catch(e){} }
  function scope(){ try{ return localStorage.getItem(LS_SCOPE)==='global'?'global':'my'; }catch(e){ return 'my'; } }
  function isAdmin(){ try{ return !!(window.appUser && appUser.role==='admin'); }catch(e){ return false; } }
  function uid(){ try{ return (window.appUser && appUser.uid) || ''; }catch(e){ return ''; } }
  function groupOf(it){ return clean((it&&(it.g||it.sc||it.subcategory||it.group))||''); }
  function clone(x){ return Object.assign({}, x||{}); }
  function getServerCache(){ var c=objLS(LS_SERVER_CACHE); return {matDB:Array.isArray(c.matDB)?c.matDB:[], workDB:Array.isArray(c.workDB)?c.workDB:[]}; }
  function getArr(type,src){
    src=src||scope(); type=type==='work'?'work':'mat';
    if(src==='global'){
      var w = type==='work' ? window.EP_GLOBAL_WORK : window.EP_GLOBAL_MAT;
      if(Array.isArray(w)) return w.slice();
      var c=getServerCache(); return (type==='work'?c.workDB:c.matDB).slice();
    }
    var mw = type==='work' ? window.EP_MY_WORK : window.EP_MY_MAT;
    if(Array.isArray(mw)) return mw.slice();
    return arrLS(type==='work'?LS_MY_WORK:LS_MY_MAT);
  }
  function unique(arr,type){
    var seen={},out=[]; (arr||[]).forEach(function(raw,i){ var it=clone(raw); if(!it.n) return; if(!it.id) it.id=(type==='work'?'w':'m')+'_v18_'+Date.now()+'_'+i+'_'+Math.random().toString(36).slice(2,6); if(it.sc&&!it.g) it.g=it.sc; if(it.g&&!it.sc) it.sc=it.g; var k=type+'|'+norm([it.c,groupOf(it),it.n,it.u].join('|')); if(seen[k]) return; seen[k]=1; out.push(it); }); return out;
  }
  function syncActiveToMain(src){
    src=src||scope();
    try{
      window.matDB = getArr('mat',src);
      window.workDB = getArr('work',src);
      try{ matDB = window.matDB; workDB = window.workDB; }catch(e){}
    }catch(e){}
  }
  async function saveArr(type,arr){
    var src=scope(); type=type==='work'?'work':'mat'; arr=unique(arr,type);
    if(src==='global'){
      if(!isAdmin()) { toast('Сервер редактирует только админ'); return false; }
      var c=getServerCache(); if(type==='mat') c.matDB=arr; else c.workDB=arr;
      window.EP_GLOBAL_MAT=c.matDB; window.EP_GLOBAL_WORK=c.workDB;
      window.EP_FORCE_GLOBAL={matDB:c.matDB,workDB:c.workDB};
      window.EP_ULTIMATE_DB_CACHE={matDB:c.matDB,workDB:c.workDB,ts:Date.now()};
      window.EP_GLOBAL_DB_VISIBLE_CACHE={matDB:c.matDB,workDB:c.workDB,ts:Date.now()};
      setObjLS(LS_SERVER_CACHE,{matDB:c.matDB,workDB:c.workDB,ts:Date.now()});
      syncActiveToMain('global');
      epV18SetStatus('upload','запись на сервер');
      try{ if(typeof db!=='undefined' && db){ await db.collection('settings').doc('global_db').set({matDB:c.matDB,workDB:c.workDB,updatedAt:new Date().toISOString()},{merge:true}); } }
      catch(e){ epV18SetStatus('error','ошибка сервера'); toast('Ошибка записи сервера: '+(e.message||e)); return false; }
      epV18SetStatus('ok','V18 активна'); return true;
    } else {
      if(type==='mat'){ window.EP_MY_MAT=arr; setLS(LS_MY_MAT,arr); }
      else { window.EP_MY_WORK=arr; setLS(LS_MY_WORK,arr); }
      try{ window.userMatDB=getArr('mat','my'); window.userWorkDB=getArr('work','my'); localStorage.setItem('ep_master_db_created_v1','1'); }catch(e){}
      syncActiveToMain('my');
      epV18SetStatus('upload','запись на сервер');
      try{ if(typeof db!=='undefined' && db && uid()){ await db.collection('user_db').doc(uid()).set({uid:uid(),masterName:(window.appUser&&(appUser.name||appUser.email))||'',matDB:getArr('mat','my'),workDB:getArr('work','my'),created:true,updatedAt:new Date().toISOString()},{merge:true}); } }
      catch(e){ toast('Локально сохранено, сервер личной базы отказал: '+(e.message||e)); }
      epV18SetStatus('ok','V18 активна'); return true;
    }
  }

  function ensureBadge(){
    var b=$('ep-v18-status-badge');
    if(!b){
      b=document.createElement('div'); b.id='ep-v18-status-badge';
      b.style.cssText='position:fixed;left:10px;bottom:12px;z-index:2147483647;border-radius:999px;padding:8px 13px;color:#fff;font-size:12px;font-weight:1000;box-shadow:0 10px 30px rgba(0,0,0,.25);border:2px solid rgba(255,255,255,.55);letter-spacing:.2px;';
      document.body.appendChild(b);
    }
    return b;
  }
  window.epV18SetStatus=function(state,msg){
    var b=ensureBadge();
    var colors={ok:'#16a34a', upload:'#dc2626', download:'#2563eb', error:'#991b1b'};
    b.style.background=colors[state]||colors.ok;
    b.textContent=(state==='upload'?'🔴 ':state==='download'?'🔵 ':state==='error'?'⚠️ ':'✅ ')+(msg||'V18 активна');
  };

  function money(v){ var n=Number(String(v==null?'':v).replace(',','.').replace(/[^\d.\-]/g,'')); return Number.isFinite(n)?n:0; }
  function dbFindAuto(nominal,brand){
    var amp=String(nominal||'').replace(/[^0-9]/g,''); var br=norm(brand||''); var arr=getArr('mat',scope()).concat(getArr('mat','global'),getArr('mat','my'));
    var hit=arr.find(function(it){ var nn=norm(it.n); return /автомат/.test(nn) && nn.indexOf(amp+'a')>=0 && (!br || nn.indexOf(br)>=0 || (br==='iek'&&nn.indexOf('иэк')>=0) || (br==='иэк'&&nn.indexOf('iek')>=0)); });
    return hit||null;
  }
  function dbFindRcd(leak,brand,kind){
    var br=norm(brand||''), k=kind||'УЗО'; var arr=getArr('mat',scope()).concat(getArr('mat','global'),getArr('mat','my'));
    return arr.find(function(it){ var nn=norm(it.n); return nn.indexOf(norm(k))>=0 && nn.indexOf(String(leak))>=0 && (!br || nn.indexOf(br)>=0 || (br==='iek'&&nn.indexOf('иэк')>=0) || (br==='иэк'&&nn.indexOf('iek')>=0)); })||null;
  }
  function brandRu(b){ b=String(b||'IEK').toUpperCase(); if(b==='IEK') return 'ИЭК'; return b.charAt(0)+b.slice(1).toLowerCase(); }
  function autoName(nominal,brand){
    var hit=dbFindAuto(nominal,brand), br=brandRu(brand); var amp=String(nominal||'C16').replace(/[^0-9]/g,''); var curve=String(nominal||'C16').replace(/[^A-Za-zА-Яа-я]/g,'').toUpperCase().charAt(0)||'C';
    if(hit && /\(([^)]+)\)/.test(hit.n||'')){ var model=(hit.n.match(/\(([^)]+)\)/)||[])[1]; return curve+amp+' 1P '+model.replace(/^IEK/i,'ИЭК'); }
    if(String(brand||'').toUpperCase()==='ABB') return curve+amp+' 1P ABB SH201';
    return curve+amp+' 1P '+br+' ВА47-29';
  }
  function autoPrice(nominal,brand){ var hit=dbFindAuto(nominal,brand); if(hit) return money(hit.p); var amp=Number(String(nominal).replace(/[^0-9]/g,'')); return amp>=40?380:amp<=10?172:150; }
  function rcdName(leak,brand,kind,rcdType){ var hit=dbFindRcd(leak,brand,kind); var br=brandRu(brand); if(hit && /\(([^)]+)\)/.test(hit.n||'')){ var model=(hit.n.match(/\(([^)]+)\)/)||[])[1].replace(/^IEK/i,'ИЭК'); return kind+' 2P 40A '+leak+'мА тип '+(rcdType||'A')+' '+model; } return kind+' 2P 40A '+leak+'мА тип '+(rcdType||'A')+' '+br+(br==='ИЭК'?' ВД1-63':''); }
  function rcdPrice(leak,brand,kind){ var hit=dbFindRcd(leak,brand,kind); if(hit) return money(hit.p); return leak===10?3600:1195; }
  function val(id,def){ var e=$(id); return e ? (e.value || def || '') : (def || ''); }
  function chk(id){ var e=$(id); return !!(e&&e.checked); }
  function cfgNum(k){ try{ return Number(window.cfg && cfg[k])||0; }catch(e){ return 0; } }
  function appPrice(k,def){ try{ return Number(window.appLogic && appLogic[k]) || def; }catch(e){ return def; } }
  function makeItem(n,q,p,type,meta,assign){ var it=Object.assign({n:n,q:Number(q)||1,p:money(p),u:(meta&&meta.unit)||'шт',type:type||'mat',tag:'shield'},meta||{}); if(assign){ it.epAssignment=assign; it.epAssignments=[assign]; it.epMergedDetails=[assign]; if(!it.dbMeta) it.dbMeta={}; it.dbMeta.assignment=assign; } return it; }
  function mergeAssignments(rec,it){ var arr=rec.epAssignments||[]; function add(v){ v=clean(v); if(v && arr.indexOf(v)<0) arr.push(v); } if(Array.isArray(it.epAssignments)) it.epAssignments.forEach(add); if(Array.isArray(it.epMergedDetails)) it.epMergedDetails.forEach(add); add(it.epAssignment); if(it.dbMeta) add(it.dbMeta.assignment); rec.epAssignments=arr; rec.epMergedDetails=arr.slice(); rec.epAssignment=arr[0]||rec.epAssignment||''; if(!rec.dbMeta) rec.dbMeta={}; rec.dbMeta.assignment=rec.epAssignment; }
  function directAddShield(items){
    var map={},out=[];
    (items||[]).forEach(function(src){ if(!src || !src.n) return; var it=clone(src); it.tag='shield'; var key=[it.tag,it.type||'',it.n||'',Number(it.p)||0,it.u||'шт'].join('|'); var rec=map[key]; if(!rec){ rec=Object.assign({},it,{q:0,epAssignments:[],epMergedDetails:[]}); map[key]=rec; out.push(rec); } rec.q += Number(it.q)||0; mergeAssignments(rec,it); });
    try{ currentEstimate=(Array.isArray(currentEstimate)?currentEstimate:[]).filter(function(it){ return it.tag!=='shield' && it.tag!=='shield_info'; }).concat(out); window.currentEstimate=currentEstimate; }catch(e){ window.currentEstimate=out; }
    try{ localStorage.setItem('est_v31',JSON.stringify(currentEstimate)); }catch(e){}
  }
  function renderMainDirect(){
    var tb=document.querySelector('#mainTable tbody'); if(!tb) return;
    var arr=[]; try{ arr=Array.isArray(currentEstimate)?currentEstimate:(Array.isArray(window.currentEstimate)?window.currentEstimate:[]); }catch(e){ arr=Array.isArray(window.currentEstimate)?window.currentEstimate:[]; }
    tb.innerHTML=''; var total=0;
    arr.forEach(function(it,idx){ var q=Number(it.q)||0, sum=(typeof fPrice==='function'?fPrice(it):(Number(it.p)||0))*q; total+=sum; tb.insertAdjacentHTML('beforeend','<tr><td class="col-name editable-name" onclick="openSwapModal('+idx+')" title="Нажмите для замены">'+esc(it.n)+'</td><td class="col-qty"><input type="number" value="'+esc(q)+'" onchange="currentEstimate['+idx+'].q=Number(this.value); window.currentEstimate=currentEstimate; renderMainTable();" style="width:50px;padding:6px;margin:0;text-align:center;"></td><td class="col-sum">'+Math.round(sum)+' P</td><td style="text-align:right;"><button onclick="currentEstimate.splice('+idx+',1); window.currentEstimate=currentEstimate; renderMainTable();" class="btn-danger" style="padding:6px;border-radius:8px;width:auto;margin:0;">✕</button></td></tr>'); });
    var tot=$('tot-all'); if(tot) tot.innerText=total.toLocaleString('ru-RU')+' P';
    try{ if(typeof syncDraft==='function') syncDraft(); }catch(e){}
  }
  window.renderMainTable=function(){ try{ window.currentEstimate=currentEstimate; }catch(e){} renderMainDirect(); };
  try{ renderMainTable=window.renderMainTable; }catch(e){}

  window.epV18GenerateShield=function(){
    var bBox=val('cfg-brand-box','Tekfor'), bAuto=val('cfg-brand-auto','IEK'), sWall=val('cfg-shield-wall','Бетон'), curve=val('cfg-auto-curve','C'), rcdType=val('cfg-rcd-type','A'), protectionType=val('cfg-protection-type','uzo_auto'), isMaster=chk('cfg-master'), heavySeparate=chk('cfg-heavy-separate');
    var lines=[]; function addLine(name,nom,group,opts){ opts=opts||{}; lines.push({name:name,nominal:nom,group:group,wet:group==='wet'||!!opts.wet,nonSwitchable:!!opts.nonSwitchable}); }
    function room(label,count,wet){ count=Number(count)||0; for(var i=1;i<=count;i++){ var n=count>1?label+' '+i:label; addLine(n+' розетки','C16',wet?'wet':'power',{wet:wet}); addLine(n+' свет','C10','light'); } }
    room('Кухня',cfgNum('kits'),false); room('Ванная',cfgNum('baths'),true); room('Туалет',cfgNum('toilets'),true); room('Комната',cfgNum('rms'),false); room('Балкон',cfgNum('bals'),false);
    if(chk('c-apron')) addLine('Фартук кухни','C16','power'); if(chk('c-dish')) addLine('Посудомойка','C10','power'); if(chk('c-washer')) addLine('Стиралка/сушилка','C10','wet',{wet:true}); if(chk('c-towel')) addLine('Полотенцесушитель','C10','wet',{wet:true});
    for(var a=1;a<=cfgNum('acs');a++) addLine('Кондиционер '+a,'C10','climate'); for(var f=1;f<=cfgNum('fls');f++) addLine('Тёплый пол '+f,'C10','climate');
    if(chk('c-fridge')) addLine('Холодильник, неотключаемая группа','C10','alwaysOn',{nonSwitchable:true}); if(chk('c-neptun')) addLine('Нептун, неотключаемая группа','C10','alwaysOn',{nonSwitchable:true}); if(chk('c-router')) addLine('Роутер, неотключаемая группа','C6','alwaysOn',{nonSwitchable:true});
    if(val('c-hob-power','none')==='6') addLine('Плита до 6 кВт','C25',heavySeparate?'heavy':'power'); if(val('c-hob-power','none')==='10') addLine('Плита до 10 кВт','C32',heavySeparate?'heavy':'power'); if(val('c-boiler-power','none')==='6') addLine('Бойлер до 6 кВт','C25','wet',{wet:true}); if(val('c-boiler-power','none')==='10') addLine('Бойлер до 10 кВт','C32','wet',{wet:true});
    if(!lines.length){ toast('Добавь хотя бы одно помещение или линию'); return; }
    var groupNames={power:'Силовые линии',climate:'Климат',wet:'Влажные зоны',light:'Освещение',heavy:'Большая техника',alwaysOn:'Неотключаемые'};
    var groups=Array.from(new Set(lines.map(function(l){return l.group;}))).filter(Boolean); var protect=[];
    function groupAssign(g){ var names=lines.filter(function(l){return l.group===g;}).map(function(l){return l.name;}); var head=g==='wet'?'Влажные зоны / защита 10 мА':(groupNames[g]||g); return head+(names.length?': '+names.join(', '):''); }
    if(protectionType==='main_dif_auto') protect.push({group:'main',kind:'ДИФ',leak:30,assign:'Вводная групповая защита всего щита'}); else groups.forEach(function(g){ protect.push({group:g,kind:(protectionType==='dif_auto'||(protectionType==='mixed'&&g==='wet'))?'ДИФ':'УЗО',leak:g==='wet'?10:30,assign:groupAssign(g)}); });
    var items=[]; var onePole=lines.length + (isMaster?1:0), twoPole=protect.length, ph=Number(val('cfg-phase','1'))||1, relayMods=chk('cfg-uzm')?(ph===3?6:2):0, masterMods=isMaster?3:0, totalModules=Math.ceil(onePole+twoPole*2+relayMods+masterMods+(ph===3?3:2)); var boxSize=[6,12,24,36,48,60,72].find(function(s){return s>=totalModules;})||72;
    items.push(makeItem('Щит '+(sWall==='Накладной'?'накладной':'встраиваемый')+' '+bBox+' '+boxSize+'М',1,bBox==='ABB'?6510:2660,'mat',{c:'Щитовое',g:'Корпуса',sc:sWall==='Накладной'?'Накладной':'Встраиваемый',kind:'shield_box'},'Корпус щита'));
    items.push(makeItem('Вводной автомат '+(ph===3?'4P':'2P')+' '+brandRu(bAuto)+' ВА47-29',1,bAuto==='ABB'?3500:1800,'mat',{c:'Автоматика',g:'Автоматы',sc:'Автоматы',kind:'input_breaker'},'Вводной аппарат щита'));
    protect.forEach(function(pd){ items.push(makeItem(rcdName(pd.leak,bAuto,pd.kind,rcdType),1,rcdPrice(pd.leak,bAuto,pd.kind),'mat',{c:'Автоматика',g:pd.kind==='ДИФ'?'ДИФы':'УЗО',sc:pd.kind==='ДИФ'?'ДИФы':'УЗО',kind:pd.kind==='ДИФ'?'dif':'uzo',leakage:pd.leak},pd.assign)); });
    lines.forEach(function(l){ items.push(makeItem(autoName(l.nominal,bAuto),1,autoPrice(l.nominal,bAuto),'mat',{c:'Автоматика',g:'Автоматы',sc:'Автоматы',kind:'automatic',nominal:l.nominal,curve:curve},l.name)); });
    if(chk('cfg-uzm')) items.push(makeItem('Реле напряжения '+brandRu(bAuto),ph===3?3:1,4500,'mat',{c:'Автоматика',g:'УЗМ / реле напряжения',sc:'УЗМ / реле напряжения'},'Защита от перенапряжения'));
    if(isMaster){ var light=lines.filter(function(l){return l.group==='light';}).map(function(l){return l.name;}).join(', ')||'световые группы'; items.push(makeItem('Контактор C40 '+brandRu(bAuto)+' — мастер-кнопка света',1,2200,'mat',{c:'Автоматика',g:'Контакторы',sc:'Контакторы'},'Мастер-кнопка только на свет: '+light)); items.push(makeItem(autoName('C40',bAuto),1,autoPrice('C40',bAuto),'mat',{c:'Автоматика',g:'Автоматы',sc:'Автоматы'},'Байпас мастер-кнопки света')); }
    try{ (window.currentShieldExtras||[]).forEach(function(ex){ items.push(makeItem(ex.n,ex.q,ex.p,'mat',{c:'Автоматика',g:'Другие аппараты',sc:'Другие аппараты'},'Дополнительный аппарат защиты')); }); window.currentShieldExtras=[]; }catch(e){}
    var comb1P=Math.ceil(onePole/12), comb2P=Math.ceil(twoPole/6), rows=Math.ceil(boxSize/12), pugvSize=appPrice('shieldPugvSize',6), pugvMeters=Math.max(4,Math.ceil(totalModules*.4)), nshviPacks=Math.max(1,Math.ceil(boxSize/48));
    if(comb1P>0) items.push(makeItem('Гребёнка 1P 25см',comb1P,250,'mat',{c:'Щитовое',g:'Гребёнки',sc:'Гребёнки'},'Питание однополюсных автоматов'));
    if(comb2P>0) items.push(makeItem('Гребёнка 2P 25см',comb2P,450,'mat',{c:'Щитовое',g:'Гребёнки',sc:'Гребёнки'},'Питание УЗО/ДИФ'));
    if(twoPole>0) items.push(makeItem('Шина N ноль на DIN-изол (ИЭК)',twoPole,285,'mat',{c:'Щитовое',g:'Шины N/PE',sc:'Шины N/PE'},'N-шинки по группам защиты'));
    items.push(makeItem('PE-шина на '+appPrice('shieldPeBusContacts',26)+' контактов',1,770,'mat',{c:'Щитовое',g:'Шины N/PE',sc:'Шины N/PE'},'Защитное заземление PE'));
    items.push(makeItem('DIN-рейка / комплект DIN для щита',rows,180,'mat',{c:'Щитовое',g:'DIN-рейки / ограничители',sc:'DIN-рейки / ограничители'},'Крепление аппаратов на DIN-рейке'));
    items.push(makeItem('Ограничитель на DIN-рейку',rows*2,35,'mat',{c:'Щитовое',g:'DIN-рейки / ограничители',sc:'DIN-рейки / ограничители'},'Фиксация аппаратов на DIN-рейке'));
    items.push(makeItem('Провод ПуГВ 1×'+pugvSize,pugvMeters,85,'mat',{c:'Щитовое',g:'Провода',sc:'Провода',unit:'м.п.'},'Внутренняя разводка щита'));
    items.push(makeItem('НШВИ 1×'+pugvSize+', упак. 100 шт',nshviPacks,225,'mat',{c:'Щитовое',g:'Наконечники',sc:'Наконечники'},'Опрессовка проводов щита'));
    items.push(makeItem('Маркировка линий / бирки',lines.length,15,'mat',{c:'Щитовое',g:'Маркировка',sc:'Маркировка'},'Маркировка линий'));
    if(sWall!=='Накладной'){ items.push(makeItem('Ниша щита '+boxSize+'М ('+sWall+')',boxSize,appPrice('shieldNichePerModule',400),'work',{c:'Штробление и резка',g:'Ниши щита',sc:'Ниши щита',unit:'мод.'},'Ниша под корпус щита')); items.push(makeItem('Штроба 100×50, под трассу кабелей ('+sWall+')',2,appPrice('shieldInputGroovePrice',1500),'work',{c:'Штробление и резка',g:'Штроба 100×50 под трассу кабелей',sc:'Штроба 100×50 под трассу кабелей',unit:'м.п.'},'Штроба под ввод/трассу кабелей')); }
    items.push(makeItem('Сборка щита',totalModules,appPrice('priceShield',500),'work',{c:'Щитовое',g:'Сборка щита',sc:'Сборка щита',unit:'мод.'},'Сборка модульного щита'));
    items.push(makeItem('Установка щита',1,appPrice('shieldInstallPrice',2500),'work',{c:'Щитовое',g:'Монтаж щита',sc:'Монтаж щита'},'Монтаж корпуса щита'));
    items.push(makeItem('Подключение вводного кабеля',1,appPrice('shieldInputConnectPrice',1500),'work',{c:'Щитовое',g:'Монтаж щита',sc:'Монтаж щита'},'Подключение ввода'));
    items.push(makeItem('Прозвонка / проверка линий',lines.length,appPrice('shieldTestLinePrice',150),'work',{c:'Щитовое',g:'Проверка линий',sc:'Проверка линий',unit:'линия'},'Проверка каждой линии'));
    items.push(makeItem('Маркировка линий',lines.length,appPrice('shieldMarkLinePrice',100),'work',{c:'Щитовое',g:'Маркировка линий',sc:'Маркировка линий',unit:'линия'},'Маркировка каждой линии'));
    if(chk('cfg-scheme')) items.push(makeItem('Составление однолинейной схемы щита',1,appPrice('shieldSchemePrice',4000),'work',{c:'Щитовое',g:'Документация',sc:'Документация'},'Однолинейная схема'));
    items.push(makeItem('ℹ️ Щит: занято '+totalModules+' мод.; корпус '+boxSize+'М; свободно '+Math.max(0,boxSize-totalModules)+' мод.',1,0,'work',{tag:'shield_info'},'Информация по щиту'));
    directAddShield(items); try{ closeModal('configModal'); }catch(e){} renderMainDirect(); epV18SetStatus('ok','V18 активна'); toast('✅ Щит перенесён на главный экран V18');
  };

  function isShieldDevice(it){ var n=String((it&&it.n)||''); return it && it.type==='mat' && (/\b[ABCDАВСД]\s*\d{1,3}\b|автомат|узо|диф|реле|контактор|вводной/i.test(n) || /automatic|breaker|uzo|dif|relay|contactor/.test(String(it.kind||it.dbMeta&&it.dbMeta.kind||''))); }
  function assigns(it){ var out=[]; function add(v){ v=clean(v); if(v && !/позиция щита|назначение не указано/i.test(v) && out.indexOf(v)<0) out.push(v); } if(it){ if(Array.isArray(it.epAssignments)) it.epAssignments.forEach(add); if(Array.isArray(it.epMergedDetails)) it.epMergedDetails.forEach(add); add(it.epAssignment); if(it.dbMeta) add(it.dbMeta.assignment); } return out; }
  window.epV18ShowDetails=function(){
    try{ window.currentEstimate=currentEstimate; }catch(e){}
    var arr=[]; try{ arr=(Array.isArray(currentEstimate)?currentEstimate:[]).filter(isShieldDevice); }catch(e){ arr=(window.currentEstimate||[]).filter(isShieldDevice); }
    var html=(typeof getPDFHeader==='function')?getPDFHeader('ДЕТАЛИЗАЦИЯ ЩИТА'):'<h2>ДЕТАЛИЗАЦИЯ ЩИТА</h2>';
    var f=$('pdf-filters'); if(f) f.style.display='none';
    html+='<div style="margin:8px 0 14px;padding:8px 10px;border-radius:12px;background:#ecfdf5;color:#047857;font-weight:900;font-size:12px;">Проверка: детализация сформирована V18</div>';
    html+='<table class="pdf-table"><tr><th>Что отвечает / линия</th><th>Аппарат</th><th>Назначение</th></tr>';
    if(!arr.length) html+='<tr><td colspan="3" style="text-align:center;color:var(--gray);font-weight:900;">Щит ещё не сгенерирован</td></tr>';
    arr.forEach(function(it){ var a=assigns(it); if(!a.length) a=['Назначение не указано']; var purpose=/узо|диф/i.test(it.n)?(/10мА|10\s*мА/i.test(it.n)?'защита влажных зон 10 мА':'групповая защита 30 мА'):/вводн/i.test(it.n)?'вводной аппарат':'отдельный автомат линии'; html+='<tr><td style="font-weight:bold;color:var(--primary);">'+a.map(esc).join('<br>')+'</td><td>'+esc(it.n)+(Number(it.q)>1?' × '+Number(it.q):'')+'</td><td>'+esc(purpose)+'</td></tr>'; });
    html+='</table>'; var p=$('p-cont'); if(p) p.innerHTML=html; try{ openModal('previewModal'); }catch(e){}
  };
  var prevPreview=window.showPreview; window.showPreview=function(mode){ if(mode==='details') return window.epV18ShowDetails(); return prevPreview?prevPreview.apply(this,arguments):undefined; }; try{ showPreview=window.showPreview; }catch(e){}

  function selectedChecks(type){ return Array.prototype.slice.call(document.querySelectorAll('#settModal .ep-v18-check:checked')).filter(function(ch){ return !type || ch.dataset.type===type; }); }
  function activeTypeFromUi(){ var m=$('editor-mat-list'), w=$('editor-work-list'); if(m && m.offsetParent!==null) return 'mat'; if(w && w.offsetParent!==null) return 'work'; return lastOpenedType||'mat'; }
  function optionsHtml(vals,placeholder){ vals=Array.from(new Set((vals||[]).map(clean).filter(Boolean))).sort(function(a,b){return a.localeCompare(b,'ru');}); return '<option value="">'+esc(placeholder||'Выбрать')+'</option>'+vals.map(function(v){return '<option value="'+esc(v)+'">'+esc(v)+'</option>';}).join(''); }
  function buildBulkPanel(){
    var arr=getArr('mat').concat(getArr('work'));
    var cats=arr.map(function(x){return x.c||'Разное';}); var subs=arr.map(function(x){return groupOf(x)||'Без группы';});
    return '<div id="ep-v18-bulk-box" style="margin:12px 0;padding:12px;border:2px dashed #16a34a;border-radius:16px;background:#f0fdf4;">'+
      '<b style="color:#166534;display:block;margin-bottom:7px;">Массовое управление V18</b>'+ 
      '<div style="font-size:12px;color:#64748b;font-weight:800;margin-bottom:8px;">Ставь галочки слева от позиций. Перемещение идёт в выбранную существующую категорию/подкатегорию активной базы.</div>'+ 
      '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:8px;"><select id="ep-v18-move-cat">'+optionsHtml(cats,'Категория')+'</select><select id="ep-v18-move-sub">'+optionsHtml(subs,'Подкатегория')+'</select></div>'+ 
      '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;"><button class="btn-info" style="margin:0;padding:10px;" onclick="epV18SelectVisible(true)">✅ Выделить видимые</button><button class="btn-vendor" style="margin:0;padding:10px;" onclick="epV18SelectVisible(false)">⬜ Снять галочки</button><button class="btn-success" style="margin:0;padding:10px;" onclick="epV18MoveSelected()">📦 Переместить выбранные</button><button class="btn-danger" style="margin:0;padding:10px;" onclick="epV18DeleteSelected()">🗑 Удалить выбранные</button></div>'+ 
    '</div>';
  }
  function injectBulkPanel(){
    var old=$('ep-v17-bulk-box'); if(old) old.style.display='none';
    var host=$('editor-mat-list') || $('editor-work-list'); if(!host) return;
    var existing=$('ep-v18-bulk-box'); if(existing){ existing.outerHTML=buildBulkPanel(); return; }
    host.insertAdjacentHTML('beforebegin',buildBulkPanel());
  }
  function injectChecks(){
    ['editor-mat-list','editor-work-list'].forEach(function(id){ var box=$(id); if(!box) return; var type=id.indexOf('work')>=0?'work':'mat'; Array.prototype.forEach.call(box.querySelectorAll('.emp-row,.mat-item'),function(row,idx){ if(row.querySelector('.ep-v18-check')) return; var price=row.querySelector('input[type="number"][data-id]'); var itemBtn=row.querySelector('[data-item]'); var did=price?price.getAttribute('data-id'):''; var dtype=price?price.getAttribute('data-type'):type; if(!did && itemBtn){ try{ var raw=decodeURIComponent(escape(atob(itemBtn.getAttribute('data-item')))); var obj=JSON.parse(raw); did=obj.id||''; dtype=itemBtn.getAttribute('data-type')||type; }catch(e){} } if(!did){ did='v18row_'+type+'_'+idx+'_'+clean(row.textContent).slice(0,40); }
      var ch=document.createElement('input'); ch.type='checkbox'; ch.className='ep-v18-check'; ch.dataset.type=dtype||type; ch.dataset.id=did; ch.style.cssText='width:22px;height:22px;min-width:22px;accent-color:#16a34a;margin:7px 10px 0 0;'; row.insertBefore(ch,row.firstChild); }); });
  }
  function refreshDbEnhancements(){ injectBulkPanel(); injectChecks(); }
  var oldDbRender=window.renderDbEditors; window.renderDbEditors=function(){ var r=oldDbRender?oldDbRender.apply(this,arguments):undefined; setTimeout(refreshDbEnhancements,80); setTimeout(refreshDbEnhancements,450); return r; }; try{ renderDbEditors=window.renderDbEditors; }catch(e){}
  window.epV18SelectVisible=function(on){ Array.prototype.forEach.call(document.querySelectorAll('#settModal .ep-v18-check'),function(ch){ var row=ch.closest('.emp-row,.mat-item'); if(!row || row.offsetParent!==null) ch.checked=!!on; }); };
  window.epV18MoveSelected=async function(){
    var checks=selectedChecks(); if(!checks.length) return toast('Выбери позиции галочками слева');
    var cat=clean($('ep-v18-move-cat')&&$('ep-v18-move-cat').value), sub=clean($('ep-v18-move-sub')&&$('ep-v18-move-sub').value); if(!cat&&!sub) return toast('Выбери категорию или подкатегорию');
    var byType={mat:{},work:{}}; checks.forEach(function(ch){ byType[ch.dataset.type==='work'?'work':'mat'][String(ch.dataset.id||'')]=1; }); var moved=0;
    for(var type in byType){ var ids=byType[type]; if(!Object.keys(ids).length) continue; var arr=getArr(type).map(function(it){ if(ids[String(it.id||'')]){ var x=clone(it); if(cat) x.c=cat; if(sub){ x.g=sub; x.sc=sub; x.subcategory=sub; } moved++; return x; } return it; }); await saveArr(type,arr); }
    refreshDbEnhancements(); try{ if(typeof renderDbEditors==='function') renderDbEditors(); }catch(e){} toast('📦 Перемещено: '+moved);
  };
  window.epV18DeleteSelected=async function(){
    var checks=selectedChecks(); if(!checks.length) return toast('Выбери позиции галочками слева');
    var ok=true; try{ if(typeof customConfirm==='function') ok=await customConfirm('Удаление','Удалить выбранные позиции: '+checks.length+'?'); else ok=confirm('Удалить выбранные позиции: '+checks.length+'?'); }catch(e){}
    if(!ok) return; var byType={mat:{},work:{}}; checks.forEach(function(ch){ byType[ch.dataset.type==='work'?'work':'mat'][String(ch.dataset.id||'')]=1; }); var removed=0;
    for(var type in byType){ var ids=byType[type]; if(!Object.keys(ids).length) continue; var arr=getArr(type).filter(function(it){ if(ids[String(it.id||'')]){ removed++; return false; } return true; }); await saveArr(type,arr); }
    refreshDbEnhancements(); try{ if(typeof renderDbEditors==='function') renderDbEditors(); }catch(e){} toast('🗑 Удалено: '+removed);
  };

  var oldOpenMat=window.openMatCatalog; window.openMatCatalog=function(){ lastOpenedType='mat'; var r=oldOpenMat?oldOpenMat.apply(this,arguments):undefined; setTimeout(refreshDbEnhancements,120); return r; };
  var oldOpenWork=window.openWorkCatalog; window.openWorkCatalog=function(){ lastOpenedType='work'; var r=oldOpenWork?oldOpenWork.apply(this,arguments):undefined; setTimeout(refreshDbEnhancements,120); return r; };
  var oldSetScope=window.epSetDbScope; window.epSetDbScope=function(s){ epV18SetStatus('download','загрузка с сервера'); var r=oldSetScope?oldSetScope.apply(this,arguments):undefined; Promise.resolve(r).finally(function(){ setTimeout(function(){ epV18SetStatus('ok','V18 активна'); refreshDbEnhancements(); },350); }); return r; };
  var oldReload=window.epReloadActiveDbV7; window.epReloadActiveDbV7=function(){ epV18SetStatus('download','загрузка с сервера'); var r=oldReload?oldReload.apply(this,arguments):undefined; Promise.resolve(r).finally(function(){ setTimeout(function(){ epV18SetStatus('ok','V18 активна'); refreshDbEnhancements(); },350); }); return r; };
  var oldSave=window.epSaveActiveDbV7; window.epSaveActiveDbV7=function(){ epV18SetStatus('upload','запись на сервер'); var r=oldSave?oldSave.apply(this,arguments):undefined; Promise.resolve(r).finally(function(){ setTimeout(function(){ epV18SetStatus('ok','V18 активна'); },350); }); return r; };

  window.addEventListener('click',function(ev){
    var b=ev.target&&ev.target.closest?ev.target.closest('button'):null; if(!b) return; var t=clean(b.textContent);
    if(t.indexOf('Сгенерировать щит')>=0){ ev.preventDefault(); ev.stopImmediatePropagation(); window.epV18GenerateShield(); return false; }
    if(t.indexOf('Детализация')>=0){ ev.preventDefault(); ev.stopImmediatePropagation(); window.epV18ShowDetails(); return false; }
  },true);

  function boot(){ ensureBadge(); epV18SetStatus('ok','V18 активна'); syncActiveToMain(scope()); refreshDbEnhancements(); try{ window.currentEstimate=currentEstimate; renderMainDirect(); }catch(e){} toast(BUILD+' загружена'); }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',function(){ setTimeout(boot,180); }); else setTimeout(boot,180);
  setInterval(function(){ ensureBadge(); refreshDbEnhancements(); },2500);
})();


/* =========================================================
 * SOURCE: block-28.js
 * AUTO TARGET: 04-database.js
 * SCORE: 149
 * HITS: db, matDB, workDB, материал, global_db, user_db, bulk, category, subcategory, renderDbEditors, epV21, epV18
 * ========================================================= */

/*
 * Extracted from public/index.html
 * Original script block: 28
 * Original HTML lines: 10398-10596
 */

/* EP V21: stable bulk management panel. Fixes select dropdown closing because V18 panel was re-rendered every 2.5s. */
(function(){
  'use strict';
  var BUILD='V21 STABLE BULK PANEL 2026-05-15';
  var LS_SCOPE='ep_db_scope_v2';
  var LS_MY_MAT='user_db_mat_v31';
  var LS_MY_WORK='user_db_work_v31';
  var LS_SERVER_CACHE='ep_global_cache_force_v1';
  function $(id){ return document.getElementById(id); }
  function clean(v){ return String(v==null?'':v).replace(/\s+/g,' ').trim(); }
  function esc(v){ return String(v==null?'':v).replace(/[&<>"']/g,function(m){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m];}); }
  function toast(t){ try{ if(typeof showToast==='function') showToast(t); else console.log(t); }catch(e){ console.log(t); } }
  function arrLS(k){ try{ var a=JSON.parse(localStorage.getItem(k)||'[]'); return Array.isArray(a)?a:[]; }catch(e){ return []; } }
  function objLS(k){ try{ var o=JSON.parse(localStorage.getItem(k)||'{}'); return o&&typeof o==='object'?o:{}; }catch(e){ return {}; } }
  function setArrLS(k,a){ try{ if(typeof safeSet==='function') safeSet(k, JSON.stringify(a||[])); else localStorage.setItem(k, JSON.stringify(a||[])); }catch(e){ try{ localStorage.setItem(k, JSON.stringify(a||[])); }catch(_e){} } }
  function setObjLS(k,o){ try{ localStorage.setItem(k, JSON.stringify(o||{})); }catch(e){} }
  function scope(){ try{ return localStorage.getItem(LS_SCOPE)==='global'?'global':'my'; }catch(e){ return 'my'; } }
  function isAdmin(){ try{ return !!(window.appUser && window.appUser.role==='admin'); }catch(e){ return false; } }
  function uid(){ try{ return (window.appUser && window.appUser.uid) || ''; }catch(e){ return ''; } }
  function groupOf(it){ return clean((it&&(it.g||it.sc||it.subcategory||it.group))||''); }
  function clone(x){ return Object.assign({}, x||{}); }
  function norm(v){ return clean(v).toLowerCase().replace(/ё/g,'е').replace(/×/g,'x').replace(/х/g,'x'); }
  function uniq(arr,type){
    var seen={}, out=[];
    (arr||[]).forEach(function(raw,i){
      var it=clone(raw); if(!it.n) return;
      if(!it.id) it.id=(type==='work'?'w':'m')+'_v21_'+Date.now()+'_'+i+'_'+Math.random().toString(36).slice(2,7);
      if(it.sc&&!it.g) it.g=it.sc; if(it.g&&!it.sc) it.sc=it.g;
      var k=type+'|'+norm([it.c,groupOf(it),it.n,it.u].join('|'));
      if(seen[k]) return; seen[k]=1; out.push(it);
    });
    return out;
  }
  function getServerCache(){ var c=objLS(LS_SERVER_CACHE); return {matDB:Array.isArray(c.matDB)?c.matDB:[], workDB:Array.isArray(c.workDB)?c.workDB:[]}; }
  function getArr(type,src){
    type=type==='work'?'work':'mat'; src=src||scope();
    if(src==='global'){
      var w=type==='work'?window.EP_GLOBAL_WORK:window.EP_GLOBAL_MAT;
      if(Array.isArray(w)) return w.slice();
      var c=getServerCache(); return (type==='work'?c.workDB:c.matDB).slice();
    }
    var mw=type==='work'?window.EP_MY_WORK:window.EP_MY_MAT;
    if(Array.isArray(mw)) return mw.slice();
    return arrLS(type==='work'?LS_MY_WORK:LS_MY_MAT);
  }
  function syncMain(src){
    try{ window.matDB=getArr('mat',src); window.workDB=getArr('work',src); try{ matDB=window.matDB; workDB=window.workDB; }catch(e){} }catch(e){}
  }
  function setStatus(state,msg){
    try{ if(typeof window.epV18SetStatus==='function'){ window.epV18SetStatus(state,msg); return; } }catch(e){}
    var b=$('ep-v18-status-badge')||document.createElement('div');
    b.id='ep-v18-status-badge';
    b.style.cssText='position:fixed;left:10px;bottom:12px;z-index:2147483647;border-radius:999px;padding:8px 13px;color:#fff;font-size:12px;font-weight:1000;box-shadow:0 10px 30px rgba(0,0,0,.25);border:2px solid rgba(255,255,255,.55);letter-spacing:.2px;background:'+(state==='upload'?'#dc2626':state==='download'?'#2563eb':state==='error'?'#991b1b':'#16a34a')+';';
    b.textContent=(state==='upload'?'🔴 ':state==='download'?'🔵 ':state==='error'?'⚠️ ':'✅ ')+(msg||'V21 активна');
    if(!b.parentNode) document.body.appendChild(b);
  }
  async function saveArr(type,arr){
    type=type==='work'?'work':'mat'; var src=scope(); arr=uniq(arr,type);
    if(src==='global'){
      if(!isAdmin()){ toast('Серверную базу редактирует только админ'); return false; }
      var c=getServerCache(); if(type==='mat') c.matDB=arr; else c.workDB=arr;
      window.EP_GLOBAL_MAT=c.matDB; window.EP_GLOBAL_WORK=c.workDB;
      window.EP_FORCE_GLOBAL={matDB:c.matDB,workDB:c.workDB};
      window.EP_ULTIMATE_DB_CACHE={matDB:c.matDB,workDB:c.workDB,ts:Date.now()};
      window.EP_GLOBAL_DB_VISIBLE_CACHE={matDB:c.matDB,workDB:c.workDB,ts:Date.now()};
      setObjLS(LS_SERVER_CACHE,{matDB:c.matDB,workDB:c.workDB,ts:Date.now()});
      syncMain('global'); setStatus('upload','запись на сервер');
      try{ if(typeof db!=='undefined' && db){ await db.collection('settings').doc('global_db').set({matDB:c.matDB,workDB:c.workDB,updatedAt:new Date().toISOString()},{merge:true}); } }
      catch(e){ setStatus('error','ошибка сервера'); toast('Ошибка записи сервера: '+(e.message||e)); return false; }
      setStatus('ok','V21 активна'); return true;
    }
    if(type==='mat'){ window.EP_MY_MAT=arr; setArrLS(LS_MY_MAT,arr); }
    else { window.EP_MY_WORK=arr; setArrLS(LS_MY_WORK,arr); }
    try{ window.userMatDB=getArr('mat','my'); window.userWorkDB=getArr('work','my'); localStorage.setItem('ep_master_db_created_v1','1'); }catch(e){}
    syncMain('my'); setStatus('upload','запись на сервер');
    try{ if(typeof db!=='undefined' && db && uid()){ await db.collection('user_db').doc(uid()).set({uid:uid(),masterName:(window.appUser&&(appUser.name||appUser.email))||'',matDB:getArr('mat','my'),workDB:getArr('work','my'),created:true,updatedAt:new Date().toISOString()},{merge:true}); } }
    catch(e){ toast('Локально сохранено, сервер личной базы отказал: '+(e.message||e)); }
    setStatus('ok','V21 активна'); return true;
  }
  function activeType(){
    var m=$('editor-mat-list'), w=$('editor-work-list');
    if(m && m.offsetParent!==null) return 'mat';
    if(w && w.offsetParent!==null) return 'work';
    try{ var activeBtn=Array.prototype.find.call(document.querySelectorAll('#settModal button'),function(b){ return /Материалы/.test(b.textContent||'') && /active|white|#fff/.test(b.className+' '+b.style.background); }); if(activeBtn) return 'mat'; }catch(e){}
    return 'mat';
  }
  function visibleHost(){ return $('editor-mat-list') || $('editor-work-list'); }
  function options(vals,placeholder,current){
    var seen={}, out=[]; (vals||[]).forEach(function(v){ v=clean(v); if(v&&!seen[v]){ seen[v]=1; out.push(v); } });
    out.sort(function(a,b){ return a.localeCompare(b,'ru'); });
    var h='<option value="">'+esc(placeholder)+'</option>';
    out.forEach(function(v){ h+='<option value="'+esc(v)+'"'+(v===current?' selected':'')+'>'+esc(v)+'</option>'; });
    return h;
  }
  function fillSelectors(force){
    var cat=$('ep-v21-move-cat'), sub=$('ep-v21-move-sub'); if(!cat||!sub) return;
    var active=document.activeElement;
    if(!force && (active===cat || active===sub)) return;
    var oldCat=cat.value, oldSub=sub.value;
    var type=activeType(), arr=getArr(type);
    var cats=arr.map(function(x){ return x.c||'Разное'; });
    var subs=arr.filter(function(x){ return !oldCat || clean(x.c||'Разное')===oldCat; }).map(function(x){ return groupOf(x)||'Без группы'; });
    cat.innerHTML=options(cats,'Категория',oldCat);
    sub.innerHTML=options(subs,'Подкатегория',oldSub);
  }
  function panelHtml(){
    return '<div id="ep-v21-bulk-box" style="margin:12px 0;padding:12px;border:2px dashed #16a34a;border-radius:16px;background:#f0fdf4;">'+
      '<b style="color:#166534;display:block;margin-bottom:7px;">Массовое управление V21</b>'+ 
      '<div style="font-size:12px;color:#64748b;font-weight:800;margin-bottom:8px;">Галочки ставятся слева от позиций. Категория/подкатегория выбираются из существующих и больше не закрываются сами.</div>'+ 
      '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:8px;">'+
        '<select id="ep-v21-move-cat" onchange="epV21UpdateSubs()"><option value="">Категория</option></select>'+ 
        '<select id="ep-v21-move-sub"><option value="">Подкатегория</option></select>'+ 
      '</div>'+ 
      '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;">'+
        '<button class="btn-info" style="margin:0;padding:10px;" onclick="epV21SelectVisible(true)">✅ Выделить видимые</button>'+ 
        '<button class="btn-vendor" style="margin:0;padding:10px;" onclick="epV21SelectVisible(false)">⬜ Снять галочки</button>'+ 
        '<button class="btn-success" style="margin:0;padding:10px;" onclick="epV21MoveSelected()">📦 Переместить выбранные</button>'+ 
        '<button class="btn-danger" style="margin:0;padding:10px;" onclick="epV21DeleteSelected()">🗑 Удалить выбранные</button>'+ 
      '</div>'+ 
    '</div>';
  }
  function hideOldBulk(){
    ['ep-v17-bulk-box','ep-v18-bulk-box'].forEach(function(id){ var el=$(id); if(el){ el.style.display='none'; el.setAttribute('aria-hidden','true'); } });
  }
  function rowId(row,type,idx){
    var price=row.querySelector('input[type="number"][data-id]'); if(price && price.getAttribute('data-id')) return {id:price.getAttribute('data-id'), type:price.getAttribute('data-type')||type};
    var itemBtn=row.querySelector('[data-item]');
    if(itemBtn){ try{ var raw=decodeURIComponent(escape(atob(itemBtn.getAttribute('data-item')))); var obj=JSON.parse(raw); if(obj&&obj.id) return {id:obj.id,type:itemBtn.getAttribute('data-type')||type}; }catch(e){} }
    return {id:'v21row_'+type+'_'+idx+'_'+clean(row.textContent).slice(0,40), type:type};
  }
  function ensureChecks(){
    ['editor-mat-list','editor-work-list'].forEach(function(id){
      var box=$(id); if(!box) return; var type=id.indexOf('work')>=0?'work':'mat';
      Array.prototype.forEach.call(box.querySelectorAll('.emp-row,.mat-item'),function(row,idx){
        var old=row.querySelector('.ep-v18-check,.ep-v21-check');
        if(old){ old.classList.add('ep-v21-check'); return; }
        var info=rowId(row,type,idx);
        var ch=document.createElement('input'); ch.type='checkbox'; ch.className='ep-v21-check'; ch.dataset.type=info.type||type; ch.dataset.id=info.id;
        ch.style.cssText='width:22px;height:22px;min-width:22px;accent-color:#16a34a;margin:7px 10px 0 0;';
        row.insertBefore(ch,row.firstChild);
      });
    });
  }
  function ensurePanel(){
    hideOldBulk();
    var host=visibleHost(); if(!host) return;
    var box=$('ep-v21-bulk-box');
    if(!box){ host.insertAdjacentHTML('beforebegin',panelHtml()); fillSelectors(true); }
    else if(!box.parentNode || !document.body.contains(box)){ host.insertAdjacentHTML('beforebegin',panelHtml()); fillSelectors(true); }
    ensureChecks(); hideOldBulk();
  }
  window.epV21UpdateSubs=function(){ fillSelectors(true); };
  function selected(){ return Array.prototype.slice.call(document.querySelectorAll('#settModal .ep-v21-check:checked, #settModal .ep-v18-check:checked')); }
  window.epV21SelectVisible=function(on){
    Array.prototype.forEach.call(document.querySelectorAll('#settModal .ep-v21-check, #settModal .ep-v18-check'),function(ch){ var row=ch.closest('.emp-row,.mat-item'); if(!row || row.offsetParent!==null) ch.checked=!!on; });
  };
  window.epV21MoveSelected=async function(){
    var checks=selected(); if(!checks.length) return toast('Выбери позиции галочками слева');
    var cat=clean($('ep-v21-move-cat')&&$('ep-v21-move-cat').value), sub=clean($('ep-v21-move-sub')&&$('ep-v21-move-sub').value);
    if(!cat&&!sub) return toast('Выбери категорию или подкатегорию');
    var byType={mat:{},work:{}}; checks.forEach(function(ch){ byType[ch.dataset.type==='work'?'work':'mat'][String(ch.dataset.id||'')]=1; });
    var moved=0;
    for(var type in byType){
      var ids=byType[type]; if(!Object.keys(ids).length) continue;
      var arr=getArr(type).map(function(it){ if(ids[String(it.id||'')]){ var x=clone(it); if(cat) x.c=cat; if(sub){ x.g=sub; x.sc=sub; x.subcategory=sub; } moved++; return x; } return it; });
      await saveArr(type,arr);
    }
    try{ if(typeof renderDbEditors==='function') renderDbEditors(); }catch(e){}
    setTimeout(function(){ ensurePanel(); fillSelectors(true); },200);
    toast('📦 Перемещено: '+moved);
  };
  window.epV21DeleteSelected=async function(){
    var checks=selected(); if(!checks.length) return toast('Выбери позиции галочками слева');
    var ok=true; try{ if(typeof customConfirm==='function') ok=await customConfirm('Удаление','Удалить выбранные позиции: '+checks.length+'?'); else ok=confirm('Удалить выбранные позиции: '+checks.length+'?'); }catch(e){}
    if(!ok) return;
    var byType={mat:{},work:{}}; checks.forEach(function(ch){ byType[ch.dataset.type==='work'?'work':'mat'][String(ch.dataset.id||'')]=1; });
    var removed=0;
    for(var type in byType){
      var ids=byType[type]; if(!Object.keys(ids).length) continue;
      var arr=getArr(type).filter(function(it){ if(ids[String(it.id||'')]){ removed++; return false; } return true; });
      await saveArr(type,arr);
    }
    try{ if(typeof renderDbEditors==='function') renderDbEditors(); }catch(e){}
    setTimeout(function(){ ensurePanel(); fillSelectors(true); },200);
    toast('🗑 Удалено: '+removed);
  };

  var oldRender=window.renderDbEditors;
  window.renderDbEditors=function(){ var r=oldRender?oldRender.apply(this,arguments):undefined; setTimeout(ensurePanel,120); setTimeout(ensurePanel,500); return r; };
  try{ renderDbEditors=window.renderDbEditors; }catch(e){}
  var oldOpenMat=window.openMatCatalog; window.openMatCatalog=function(){ var r=oldOpenMat?oldOpenMat.apply(this,arguments):undefined; setTimeout(ensurePanel,150); return r; };
  var oldOpenWork=window.openWorkCatalog; window.openWorkCatalog=function(){ var r=oldOpenWork?oldOpenWork.apply(this,arguments):undefined; setTimeout(ensurePanel,150); return r; };

  function boot(){ setStatus('ok','V21 активна'); ensurePanel(); fillSelectors(true); toast(BUILD+' загружена'); }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',function(){ setTimeout(boot,250); }); else setTimeout(boot,250);
  setInterval(function(){ setStatus('ok','V21 активна'); hideOldBulk(); ensureChecks(); var active=document.activeElement; if(active && (active.id==='ep-v21-move-cat'||active.id==='ep-v21-move-sub')) return; ensurePanel(); },2500);
})();
