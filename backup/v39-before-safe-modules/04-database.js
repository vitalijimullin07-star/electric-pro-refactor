/*
 * Electric PRO Refactor
 * Module: 04-database.js
 * V30: материалы / работы / база данных / массовое управление.
 *
 * Важно:
 * - пока это безопасный перенос/дублирование;
 * - 00-core.js временно остаётся стабильным runtime;
 * - const/let/var не копируются, чтобы не ломать загрузку дублями.
 */

console.log("04-database.js V30 loaded");



/* =========================================================

 * DATABASE BLOCK: openMatCatalog

 * ========================================================= */

function openMatCatalog() { 
    let cats = {}; matDB.forEach(m => { let c = m.c || "ОБЩЕЕ"; if(!cats[c]) cats[c] = []; cats[c].push(m); }); 
    let html = ""; let idx = 0;
    for(let c in cats) { 
        let sid = 'mcat_' + (idx++);
        html += `<div class="cat-header" onclick="toggleCat('${sid}')">${c}</div><div class="cat-body" id="${sid}">`;
        cats[c].forEach(m => { html += `<div class="mat-item"><div style="flex:1; font-size:12px; font-weight:600;">${m.n}<br><span style="color:var(--gray); font-size:11px; font-weight:normal;">${m.p} P / ${m.u}</span></div><button class="mat-add-btn" onclick="promptAdd('${m.id}', 'mat')">+ Добавить</button></div>`; });
        html += `</div>`;
    } document.getElementById('mat-cat-list').innerHTML = html; openModal('matCatModal'); 
}




/* =========================================================

 * DATABASE BLOCK: openWorkCatalog

 * ========================================================= */

function openWorkCatalog() { 
    let cats = {}; workDB.forEach(w => { let c = w.c || "ОБЩЕЕ"; if(!cats[c]) cats[c] = []; cats[c].push(w); });
    let html = ""; let idx = 0;
    for(let c in cats) { 
        let sid = 'wcat_' + (idx++);
        html += `<div class="cat-header" style="color:var(--orange); border-color:rgba(245,158,11,0.2); background:rgba(245,158,11,0.08);" onclick="toggleCat('${sid}')">${c}</div><div class="cat-body" id="${sid}">`;
        cats[c].forEach(w => { html += `<div class="mat-item"><div style="flex:1; font-size:12px; font-weight:600;">${w.n}<br><span style="color:var(--gray); font-size:11px; font-weight:normal;">${w.p} P / ${w.u}</span></div><button class="mat-add-btn" style="background:var(--orange);" onclick="promptAdd('${w.id}', 'work')">+ Добавить</button></div>`; });
        html += `</div>`;
    } document.getElementById('work-cat-list').innerHTML = html; openModal('workModal'); 
}




/* =========================================================

 * DATABASE BLOCK: toggleCat

 * ========================================================= */

function toggleCat(id) { let el = document.getElementById(id); el.classList.toggle('active'); }




/* =========================================================

 * DATABASE BLOCK: work

 * ========================================================= */

function work(label, q, price, words, meta, assignment) {
        meta = Object.assign({}, meta || {});
        if (assignment) meta.assignment = assignment;
        const it = epWork(label, q, price, words, meta);
        if (assignment) { it.epAssignment = assignment; it.epAssignments = [assignment]; it.epMergedDetails = [assignment]; }
        return it;
    }

    


/* =========================================================

 * DATABASE BLOCK: categorizeEstimateItem

 * ========================================================= */

function categorizeEstimateItem(it) {
    if (it.type === 'mat') return 1;
    let n = it.n.toLowerCase();
    if (n.includes('штроб') || n.includes('высверл') || n.includes('алмаз') || n.includes('резк') || n.includes('отверст') || n.includes('ниши')) return 2;
    if (n.includes('установк') || n.includes('розетк') || n.includes('выключат') || n.includes('рамк') || n.includes('свет') || n.includes('люстр')) {
        if (!n.includes('подрозетн') && !n.includes('щит')) return 4;
    }
    return 3; 
}




/* =========================================================

 * DATABASE BLOCK: renderDbEditors

 * ========================================================= */

function renderDbEditors() {
    let catsM = [...new Set(matDB.map(m=>m.c || 'Разное'))];
    let catsW = [...new Set(workDB.map(w=>w.c || 'Разное'))];
    document.getElementById('db-cats').innerHTML = [...new Set([...catsM, ...catsW])].map(c=>`<option value="${c}">`).join('');

    let htmlMat = '';
    let mGroups = {}; matDB.forEach(m => { mGroups[m.c||'Разное'] = mGroups[m.c||'Разное'] || []; mGroups[m.c||'Разное'].push(m); });
    Object.keys(mGroups).forEach((c, idx) => {
        let sid = 'db_m_'+idx;
        htmlMat += `<div class="cat-header" onclick="toggleCat('${sid}')">${c}</div><div class="cat-body" id="${sid}">`;
        mGroups[c].forEach(m => {
            htmlMat += `<div class="emp-row"><div><b>${m.n}</b><br><span style="color:var(--gray);font-size:10px;">${m.p} ₽ / ${m.u}</span></div> <input type="number" value="${m.p}" onchange="requestPriceChange('mat', '${m.id}', this.value)" style="width:60px;margin:0;padding:4px;text-align:center;"></div>`;
        });
        htmlMat += `</div>`;
    });
    document.getElementById('editor-mat-list').innerHTML = htmlMat;

    let htmlWork = '';
    let wGroups = {}; workDB.forEach(w => { wGroups[w.c||'Разное'] = wGroups[w.c||'Разное'] || []; wGroups[w.c||'Разное'].push(w); });
    Object.keys(wGroups).forEach((c, idx) => {
        let sid = 'db_w_'+idx;
        htmlWork += `<div class="cat-header" style="color:var(--orange); border-color:rgba(245,158,11,0.2); background:rgba(245,158,11,0.08);" onclick="toggleCat('${sid}')">${c}</div><div class="cat-body" id="${sid}">`;
        wGroups[c].forEach(w => {
            htmlWork += `<div class="emp-row"><div><b>${w.n}</b><br><span style="color:var(--gray);font-size:10px;">${w.p} ₽ / ${w.u}</span></div> <input type="number" value="${w.p}" onchange="requestPriceChange('work', '${w.id}', this.value)" style="width:60px;margin:0;padding:4px;text-align:center;"></div>`;
        });
        htmlWork += `</div>`;
    });
    document.getElementById('editor-work-list').innerHTML = htmlWork;
}




/* =========================================================

 * DATABASE BLOCK: epInferCategory

 * ========================================================= */

function epInferCategory(name, type) {
        const n = String(name || '').toLowerCase();
        if (type === 'work') {
            if (/штроб|борозд|резк|алмаз/.test(n)) return 'Штробление';
            if (/подрозет|розет|выключ|механизм|рамк|светильник/.test(n)) return 'Чистовая';
            if (/кабел|провод|гофр|труб|лоток|короб/.test(n)) return 'Черновая';
            if (/щит|автомат|узо|диф|реле/.test(n)) return 'Щит';
            return 'Работы';
        }
        if (/ввг|пуг|пвс|провод|кабел|cat|utp|ftp|sat|коаксиал/.test(n)) return 'Кабель';
        if (/гофр|труб|кабель.?канал|лоток|клипс|стяжк/.test(n)) return 'Трубы';
        if (/подрозет|короб|распред|клемм|wago|гмл|изол|саморез|дюбел|гвозд|площадк|баллон|наконечник/.test(n)) return 'Расходники';
        if (/автомат|узо|диф|реле|выключател[ья] автомат|щит|бокс|din|дин|шина|кросс/.test(n)) return 'Автоматика';
        if (/tv|тв|интернет|rj|utp|ftp|cat|слаботоч/.test(n)) return 'Слаботочка';
        if (/розет|выключ|рамк|механизм|диммер|терморег/.test(n)) return 'Чистовое';
        return 'Разное';
    }


    


/* =========================================================

 * DATABASE BLOCK: epInferSubcategory

 * ========================================================= */

function epInferSubcategory(name, category, type) {
        const n = String(name || '').toLowerCase();
        const c = String(category || '').toLowerCase();
        if (type === 'work') {
            if (/штроб|борозд/.test(n)) return 'Штробление';
            if (/сверл|подрозет/.test(n)) return 'Подрозетники';
            if (/кабел|провод|проклад/.test(n)) return 'Прокладка кабеля';
            if (/щит|автомат|узо|диф/.test(n)) return 'Щит';
            if (/розет|выключ|механизм|рамк/.test(n)) return 'Чистовая установка';
            return 'Работы';
        }
        if (/ввг/.test(n)) return 'ВВГ';
        if (/пугв|пу ?гв|пв-?3/.test(n)) return 'ПУГВ';
        if (/cat|utp|ftp|rj|интернет/.test(n)) return 'UTP/FTP';
        if (/sat|tv|коаксиал|cavel|антенн/.test(n)) return 'TV/SAT';
        if (/подрозет/.test(n)) return 'Подрозетники';
        if (/короб|распред/.test(n)) return 'Коробки';
        if (/клемм|wago|гмл|наконечник|шина/.test(n)) return 'Клеммы/соединители';
        if (/стяжк|клипс|дюбел|саморез|гвозд|площадк|баллон/.test(n)) return 'Крепёж';
        if (/гофр|труб/.test(n)) return 'Трубы/гофра';
        if (/щит|бокс|шкаф|корпус/.test(n)) return 'Щиты/корпуса';
        if (/диф/.test(n)) return 'Дифавтоматы';
        if (/узо/.test(n)) return 'УЗО';
        if (/автомат|выключател[ья] автомат/.test(n)) return 'Автоматы';
        if (/розет/.test(n)) return 'Розетки';
        if (/выключ/.test(n)) return 'Выключатели';
        if (/рамк/.test(n)) return 'Рамки';
        if (/механизм|диммер|терморег/.test(n)) return 'Механизмы';
        if (c.includes('кабель')) return 'Кабель силовой';
        if (c.includes('расход')) return 'Прочие расходники';
        return 'Разное';
    }

    


/* =========================================================

 * DATABASE BLOCK: epGroupCatalog

 * ========================================================= */

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
    


/* =========================================================

 * DATABASE BLOCK: dbArr

 * ========================================================= */

function dbArr(type){
    try { return type === 'mat' ? matDB : workDB; } catch(e) { return type === 'mat' ? (window.matDB || []) : (window.workDB || []); }
  }
  


/* =========================================================

 * DATABASE BLOCK: renderCatalog

 * ========================================================= */

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

  


/* =========================================================

 * DATABASE BLOCK: catalogRow

 * ========================================================= */

function catalogRow(type,it){
    var item=enc(it);
    var sub=(groupOf(it)?groupOf(it)+' • ':'')+(Number(it.p)||0)+' ₽ / '+(it.u||'шт');
    var copyBtn = scope()==='global' ? '<button class="btn-info" style="width:auto;margin:0 0 0 6px;padding:8px;" data-type="'+type+'" data-item="'+esc(item)+'" onclick="epCopyOneServerToMy(this.dataset.type,this.dataset.item)">В мою</button>' : '';
    return '<div class="mat-item"><div style="flex:1;font-size:12px;font-weight:600;"><b>'+esc(it.n||'Позиция')+'</b><br><span style="color:var(--gray);font-size:11px;font-weight:normal;">'+esc(sub)+'</span></div><button class="mat-add-btn" style="'+(type==='work'?'background:var(--orange);':'')+'" data-item="'+esc(item)+'" data-type="'+type+'" onclick="promptAdd(this.dataset.item,this.dataset.type)">+ Добавить</button>'+copyBtn+'</div>';
  }

  


/* =========================================================

 * DATABASE BLOCK: editorTop

 * ========================================================= */

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

  


/* =========================================================

 * DATABASE BLOCK: editorRow

 * ========================================================= */

function editorRow(type,it){
    var item=enc(it);
    var sub=(groupOf(it)?groupOf(it)+' • ':'')+(Number(it.p)||0)+' ₽ / '+(it.u||'шт');
    var checked=scope()==='my' ? '<input type="checkbox" class="ep-my-del-check" data-type="'+type+'" data-item="'+esc(item)+'" style="width:20px;height:20px;accent-color:#EF4444;margin:4px 8px 0 0;">' : '';
    var copy=scope()==='global' ? '<button class="btn-info" style="width:auto;margin:0;padding:7px;" data-type="'+type+'" data-item="'+esc(item)+'" onclick="epCopyOneServerToMy(this.dataset.type,this.dataset.item)">В мою</button>' : '';
    return '<div class="emp-row" style="align-items:flex-start;">'+checked+'<div style="flex:1;"><b>'+esc(it.n||'Позиция')+'</b><br><span style="color:var(--gray);font-size:10px;">'+esc(sub)+'</span></div><input type="number" value="'+(Number(it.p)||0)+'" data-id="'+esc(String(it.id||''))+'" data-type="'+type+'" onchange="requestPriceChange(this.dataset.type,this.dataset.id,this.value)" style="width:70px;margin:0;padding:4px;text-align:center;">'+copy+'</div>';
  }

  


/* =========================================================

 * DATABASE BLOCK: inferCat

 * ========================================================= */

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
  


/* =========================================================

 * DATABASE BLOCK: firebaseHint

 * ========================================================= */

function firebaseHint(){
    var fbu=fbUser();
    if(!fbu) return 'Нет Firebase-входа. Серверная запись может быть запрещена правилами Firebase. Для админа лучше войти через Google-аккаунт администратора.';
    return 'Firebase: '+(fbu.email||fbu.uid)+'.';
  }
  


/* =========================================================

 * DATABASE BLOCK: saveGlobalImport

 * ========================================================= */

function saveGlobalImport(type,items,replace){
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
  


/* =========================================================

 * DATABASE BLOCK: saveMyImport

 * ========================================================= */

function saveMyImport(type,items,replace){
    var arr=getMy(type); items.forEach(function(it,idx){ arr=upsert(arr,type,it,!!replace); if(idx%25===0) progress('Запись в мою базу',20+Math.min(40,idx/Math.max(1,items.length)*40),'Добавляю строки'); });
    setMy(type,arr); progress('Запись в мою базу',68,'Локально сохранено');
    if(typeof db!=='undefined'&&db&&uid()){
      await db.collection('user_db').doc(uid()).set({uid:uid(),masterName:(window.appUser&&(appUser.name||appUser.email||appUser.phone))||'',matDB:getMy('mat'),workDB:getMy('work'),created:true,updatedAt:new Date().toISOString()}, {merge:true});
      progress('Запись в мою базу',90,'Сервер подтвердил');
    }
    return getMy(type).length;
  }
  


/* =========================================================

 * DATABASE BLOCK: importPrompt

 * ========================================================= */

function importPrompt(type, kind){
    return 'Ты профессионально распознаёшь русские прайсы, счета, сметы и таблицы электромонтажных '+(type==='work'?'работ':'материалов')+'. '+
      'Источник: '+kind+'. Извлеки ВСЕ строки с позициями. Верни ТОЛЬКО JSON массив объектов без текста вокруг. '+
      'Формат строго: [{"n":"Имя позиции","c":"Категория","sc":"Подкатегория","p":123,"u":"шт"}]. '+
      'n — полное наименование, не артикул и не номер строки. p — цена за единицу, не итоговая сумма; если цены нет p=0. '+
      'u — единица: шт, м, м.п., упак, компл, кг, л. c/sc определи сам по электрике. Не возвращай пустой массив, если видны позиции.';
  }
  


/* =========================================================

 * DATABASE BLOCK: importTarget

 * ========================================================= */

function importTarget(){
    if(scope() === 'global'){
      if(adminServerMode()) return 'global';
      return 'blocked_server_edit';
    }
    return 'my';
  }
  


/* =========================================================

 * DATABASE BLOCK: patchDbBulk

 * ========================================================= */

function patchDbBulk(){
    var modal=$('settModal'); if(!modal || $('ep-v17-bulk-box')) return;
    var host=$('editor-mat-list') || $('editor-work-list'); if(!host) return;
    var box=document.createElement('div'); box.id='ep-v17-bulk-box'; box.style.cssText='margin:12px 0;padding:12px;border:2px dashed #8b5cf6;border-radius:16px;background:#faf5ff;';
    box.innerHTML='<b style="color:#5b21b6;display:block;margin-bottom:8px;">Массовое управление V17</b><div style="font-size:12px;color:#64748b;font-weight:800;margin-bottom:8px;">Выделение и перенос работают по галочкам в текущей открытой базе. Если галочек нет — значит открыт старый список, нажми Обновить / перезагрузить.</div><div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;"><input id="ep-v17-move-cat" placeholder="Категория"><input id="ep-v17-move-sub" placeholder="Подкатегория"></div><button onclick="epV17BulkMove()" style="margin-top:8px;background:#8b5cf6;color:white;">📦 Переместить выбранные</button><button onclick="epV17BulkDelete()" style="margin-top:8px;background:#ef4444;color:white;">🗑 Удалить выбранные</button>';
    host.parentNode.insertBefore(box,host);
  }
  


/* =========================================================

 * DATABASE BLOCK: getArr

 * ========================================================= */

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
  


/* =========================================================

 * DATABASE BLOCK: saveArr

 * ========================================================= */

function saveArr(type,arr){
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

  


/* =========================================================

 * DATABASE BLOCK: dbFindAuto

 * ========================================================= */

function dbFindAuto(nominal,brand){
    var amp=String(nominal||'').replace(/[^0-9]/g,''); var br=norm(brand||''); var arr=getArr('mat',scope()).concat(getArr('mat','global'),getArr('mat','my'));
    var hit=arr.find(function(it){ var nn=norm(it.n); return /автомат/.test(nn) && nn.indexOf(amp+'a')>=0 && (!br || nn.indexOf(br)>=0 || (br==='iek'&&nn.indexOf('иэк')>=0) || (br==='иэк'&&nn.indexOf('iek')>=0)); });
    return hit||null;
  }
  


/* =========================================================

 * DATABASE BLOCK: dbFindRcd

 * ========================================================= */

function dbFindRcd(leak,brand,kind){
    var br=norm(brand||''), k=kind||'УЗО'; var arr=getArr('mat',scope()).concat(getArr('mat','global'),getArr('mat','my'));
    return arr.find(function(it){ var nn=norm(it.n); return nn.indexOf(norm(k))>=0 && nn.indexOf(String(leak))>=0 && (!br || nn.indexOf(br)>=0 || (br==='iek'&&nn.indexOf('иэк')>=0) || (br==='иэк'&&nn.indexOf('iek')>=0)); })||null;
  }
  


/* =========================================================

 * DATABASE BLOCK: buildBulkPanel

 * ========================================================= */

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
  


/* =========================================================

 * DATABASE BLOCK: injectBulkPanel

 * ========================================================= */

function injectBulkPanel(){
    var old=$('ep-v17-bulk-box'); if(old) old.style.display='none';
    var host=$('editor-mat-list') || $('editor-work-list'); if(!host) return;
    var existing=$('ep-v18-bulk-box'); if(existing){ existing.outerHTML=buildBulkPanel(); return; }
    host.insertAdjacentHTML('beforebegin',buildBulkPanel());
  }
  


/* =========================================================

 * DATABASE BLOCK: hideOldBulk

 * ========================================================= */

function hideOldBulk(){
    ['ep-v17-bulk-box','ep-v18-bulk-box'].forEach(function(id){ var el=$(id); if(el){ el.style.display='none'; el.setAttribute('aria-hidden','true'); } });
  }
  


/* =========================================================

 * DATABASE BLOCK: window.EP_DB_REVIEW

 * ========================================================= */

window.EP_DB_REVIEW = { type: 'mat', items: [], source: '' };


/* =========================================================

 * DATABASE BLOCK: window.epTriggerDbFileImport

 * ========================================================= */

window.epTriggerDbFileImport = function (type) {
        window.EP_DB_REVIEW.type = type;
        const input = document.getElementById('ep-db-file-input');
        input.value = '';
        input.onchange = function (e) {
            const file = e.target.files && e.target.files[0];
            if (file) epReadDbFile(file, type);
        };
        input.click();
    };


/* =========================================================

 * DATABASE BLOCK: window.epOpenTextImport

 * ========================================================= */

window.epOpenTextImport = function (type) {
        window.EP_DB_REVIEW.type = type;
        document.getElementById('ep-text-import-title').innerText = 'Импорт ' + epDbTypeLabel(type) + ' из текста';
        document.getElementById('ep-text-import-value').value = '';
        openModal('ep-text-import-modal');
    };


/* =========================================================

 * DATABASE BLOCK: window.epRunTextImport

 * ========================================================= */

window.epRunTextImport = async function () {
        const text = document.getElementById('ep-text-import-value').value;
        closeModal('ep-text-import-modal');
        await epAiNormalizeDbText(text, window.EP_DB_REVIEW.type, 'текст');
    };


/* =========================================================

 * DATABASE BLOCK: window.epExportMyDb

 * ========================================================= */

window.epExportMyDb = function () {
        epDownloadJson('electric-pro-my-db.json', {
            owner: appUser ? { uid: appUser.uid, name: appUser.name || appUser.email || '' } : null,
            matDB: matDB,
            workDB: workDB,
            exportedAt: new Date().toISOString()
        });
    };


/* =========================================================

 * DATABASE BLOCK: window.epExportGlobalDb

 * ========================================================= */

window.epExportGlobalDb = async function () {
        let data = { matDB: matDB, workDB: workDB };
        try {
            if (db) {
                const doc = await db.collection('settings').doc('global_db').get();
                if (doc.exists) data = doc.data();
            }
        } catch(e){}
        epDownloadJson('electric-pro-global-db.json', Object.assign({}, data, { exportedAt: new Date().toISOString() }));
    };


/* =========================================================

 * DATABASE BLOCK: window.renderDbEditors

 * ========================================================= */

window.renderDbEditors = function () {
        let catsM = [...new Set(matDB.map(m=>m.c || 'Разное'))];
        let catsW = [...new Set(workDB.map(w=>w.c || 'Разное'))];

        const catsEl = document.getElementById('db-cats');
        if (catsEl) catsEl.innerHTML = [...new Set([...catsM, ...catsW])].map(c=>`<option value="${epEscape(c)}">`).join('');

        let htmlMat = '';
        let mGroups = {}; matDB.forEach(m => { mGroups[m.c||'Разное'] = mGroups[m.c||'Разное'] || []; mGroups[m.c||'Разное'].push(m); });
        Object.keys(mGroups).forEach((c, idx) => {
            let sid = 'db_m_'+idx;
            htmlMat += `<div class="cat-header" onclick="toggleCat('${sid}')">${epEscape(c)}</div><div class="cat-body" id="${sid}">`;
            mGroups[c].forEach(m => {
                htmlMat += `<div class="emp-row">
                    <div style="flex:1;"><b>${epEscape(m.n)}</b><br><span style="color:var(--gray);font-size:10px;">${epEscape(m.sc || 'Разное')} • ${Number(m.p)||0} ₽ / ${epEscape(m.u || 'шт')}</span></div>
                    <div class="ep-row-actions">
                        <input type="number" value="${Number(m.p)||0}" onchange="requestPriceChange('mat', '${epEscape(m.id)}', this.value)" style="width:70px;margin:0;padding:4px;text-align:center;">
                        <button class="btn-danger" onclick="epDeleteDbItem('mat','${epEscape(m.id)}')" title="Удалить">🗑</button>
                    </div>
                </div>`;
            });
            htmlMat += `</div>`;
        });
        const em = document.getElementById('editor-mat-list');
        if (em) em.innerHTML = htmlMat;

        let htmlWork = '';
        let wGroups = {}; workDB.forEach(w => { wGroups[w.c||'Разное'] = wGroups[w.c||'Разное'] || []; wGroups[w.c||'Разное'].push(w); });
        Object.keys(wGroups).forEach((c, idx) => {
            let sid = 'db_w_'+idx;
            htmlWork += `<div class="cat-header" style="color:var(--orange); border-color:rgba(245,158,11,0.2); background:rgba(245,158,11,0.08);" onclick="toggleCat('${sid}')">${epEscape(c)}</div><div class="cat-body" id="${sid}">`;
            wGroups[c].forEach(w => {
                htmlWork += `<div class="emp-row">
                    <div style="flex:1;"><b>${epEscape(w.n)}</b><br><span style="color:var(--gray);font-size:10px;">${epEscape(w.sc || 'Разное')} • ${Number(w.p)||0} ₽ / ${epEscape(w.u || 'шт')}</span></div>
                    <div class="ep-row-actions">
                        <input type="number" value="${Number(w.p)||0}" onchange="requestPriceChange('work', '${epEscape(w.id)}', this.value)" style="width:70px;margin:0;padding:4px;text-align:center;">
                        <button class="btn-danger" onclick="epDeleteDbItem('work','${epEscape(w.id)}')" title="Удалить">🗑</button>
                    </div>
                </div>`;
            });
            htmlWork += `</div>`;
        });
        const ew = document.getElementById('editor-work-list');
        if (ew) ew.innerHTML = htmlWork;
    };


/* =========================================================

 * DATABASE BLOCK: window.EP_DB_PROPOSALS_CACHE_V2

 * ========================================================= */

window.EP_DB_PROPOSALS_CACHE_V2 = window.EP_DB_PROPOSALS_CACHE_V2 || {};


/* =========================================================

 * DATABASE BLOCK: window.epToggleSubCat

 * ========================================================= */

window.epToggleSubCat = function(id, ev) { if (ev) ev.stopPropagation(); const el = document.getElementById(id); if (el) el.classList.toggle('active'); };


/* =========================================================

 * DATABASE BLOCK: window.openWorkCatalog

 * ========================================================= */

window.openWorkCatalog = function() { epNormalizeAllWorkDb(); const el = document.getElementById('work-cat-list'); if (el) el.innerHTML = epRenderGroupedList(workDB || [], 'work', { prefix:'wcat_full', mode:'catalog' }); openModal('workModal'); };


/* =========================================================

 * DATABASE BLOCK: window.openMatCatalog

 * ========================================================= */

window.openMatCatalog = function() {
        const hasNested = (matDB || []).some(x => x.sc || x.g);
        if (!hasNested && typeof oldOpenMatCatalogFull === 'function') return oldOpenMatCatalogFull();
        const el = document.getElementById('mat-cat-list'); if (el) el.innerHTML = epRenderGroupedList(matDB || [], 'mat', { prefix:'mcat_full', mode:'catalog' }); openModal('matCatModal');
    };


/* =========================================================

 * DATABASE BLOCK: window.matDB

 * ========================================================= */

window.matDB = fixArr(window.matDB || []); } catch(e){}
    


/* =========================================================

 * DATABASE BLOCK: window.userMatDB

 * ========================================================= */

window.userMatDB = fixArr(window.userMatDB || []); } catch(e){}
  


/* =========================================================

 * DATABASE BLOCK: window.workDB

 * ========================================================= */

window.workDB = arr; }
  }
  function detectBrand(s){ const raw = String(s||''); const n = norm(raw); for(const b of BRAND_LIST){ if(n.includes(norm(b))) return b === 'ИЭК' ? 'IEK' : b; } return ''; }
  


/* =========================================================

 * DATABASE BLOCK: window.categorizeEstimateItem

 * ========================================================= */

window.categorizeEstimateItem = function(it){
    if(!it) return 3;
    if(it.type === 'mat') return 1;
    var n = String(it.n || '').toLowerCase();
    if(n.indexOf('штроб') >= 0 || n.indexOf('высверл') >= 0 || n.indexOf('алмаз') >= 0 || n.indexOf('резк') >= 0 || n.indexOf('отверст') >= 0 || n.indexOf('ниша') >= 0 || n.indexOf('ниши') >= 0) return 2;
    if(n.indexOf('установк') >= 0 || n.indexOf('розетк') >= 0 || n.indexOf('выключат') >= 0 || n.indexOf('рамк') >= 0 || n.indexOf('свет') >= 0 || n.indexOf('люстр') >= 0) {
      if(n.indexOf('подрозетн') < 0 && n.indexOf('щит') < 0) return 4;
    }
    return 3;
  };


/* =========================================================

 * DATABASE BLOCK: window.EP_GLOBAL_DB_VISIBLE_CACHE

 * ========================================================= */

window.EP_GLOBAL_DB_VISIBLE_CACHE = window.EP_GLOBAL_DB_VISIBLE_CACHE || { matDB: [], workDB: [], loadedAt: 0 };


/* =========================================================

 * DATABASE BLOCK: window.EP_GLOBAL_DB_TAB_FIXED

 * ========================================================= */

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

  


/* =========================================================

 * DATABASE BLOCK: window.EP_ULTIMATE_DB_CACHE

 * ========================================================= */

window.EP_ULTIMATE_DB_CACHE = window.EP_ULTIMATE_DB_CACHE || { matDB: [], workDB: [], ts: 0 };


/* =========================================================

 * DATABASE BLOCK: window.EP_MY_MAT

 * ========================================================= */

window.EP_MY_MAT = EP_MY_MAT;
      window.EP_MY_WORK = EP_MY_WORK;
      window.EP_GLOBAL_MAT = EP_SERVER_MAT;
      window.EP_GLOBAL_WORK = EP_SERVER_WORK;
      window.EP_FORCE_GLOBAL = {matDB:EP_SERVER_MAT, workDB:EP_SERVER_WORK};


/* =========================================================

 * DATABASE BLOCK: window.EP_MY_WORK

 * ========================================================= */

window.EP_MY_WORK = EP_MY_WORK;
      window.EP_GLOBAL_MAT = EP_SERVER_MAT;
      window.EP_GLOBAL_WORK = EP_SERVER_WORK;
      window.EP_FORCE_GLOBAL = {matDB:EP_SERVER_MAT, workDB:EP_SERVER_WORK};


/* =========================================================

 * DATABASE BLOCK: window.EP_GLOBAL_MAT

 * ========================================================= */

window.EP_GLOBAL_MAT = EP_SERVER_MAT;
      window.EP_GLOBAL_WORK = EP_SERVER_WORK;
      window.EP_FORCE_GLOBAL = {matDB:EP_SERVER_MAT, workDB:EP_SERVER_WORK};


/* =========================================================

 * DATABASE BLOCK: window.EP_GLOBAL_WORK

 * ========================================================= */

window.EP_GLOBAL_WORK = EP_SERVER_WORK;
      window.EP_FORCE_GLOBAL = {matDB:EP_SERVER_MAT, workDB:EP_SERVER_WORK};


/* =========================================================

 * DATABASE BLOCK: window.userWorkDB

 * ========================================================= */

window.userWorkDB = EP_MY_WORK;
      if(scope()==='global'){ matDB = EP_SERVER_MAT.slice(); workDB = EP_SERVER_WORK.slice(); }
      


/* =========================================================

 * DATABASE BLOCK: window.epSetDbScope

 * ========================================================= */

window.epSetDbScope = function(s){
    localStorage.setItem(LS_SCOPE, s==='global' ? 'global' : 'my');
    syncWindowCaches();
    epRefreshDbScopeUi();
    if(typeof renderDbEditors==='function') renderDbEditors();
    toast('Работаем по базе: ' + activeLabel());
  };


/* =========================================================

 * DATABASE BLOCK: window.epExportActiveDb

 * ========================================================= */

window.epExportActiveDb = function(){
    var s=scope();
    downloadJson(s==='global'?'electric-pro-server-db.json':'electric-pro-my-db.json', {
      source:s==='global'?'server':'my',
      matDB:s==='global'?EP_SERVER_MAT:EP_MY_MAT,
      workDB:s==='global'?EP_SERVER_WORK:EP_MY_WORK,
      exportedAt:new Date().toISOString()
    });
  };


/* =========================================================

 * DATABASE BLOCK: window.EP_DB_REVIEW_V6

 * ========================================================= */

window.EP_DB_REVIEW_V6 = window.EP_DB_REVIEW_V6 || { type:'mat', items:[], source:'', page:0, selected:{}, editCache:{} };


/* =========================================================

 * DATABASE BLOCK: window.epTriggerServerProposalImportV7

 * ========================================================= */

window.epTriggerServerProposalImportV7=function(type){ type=type==='work'?'work':'mat'; var input=$('ep-db-file-input'); if(!input)return toast('Поле выбора файла не найдено'); input.value=''; input.onchange=function(e){ var file=e.target.files&&e.target.files[0]; if(!file)return; readDbFile(file,type,'server_proposal').catch(function(err){ hideProgress(); toast('❌ '+(err.message||'Ошибка импорта')); console.error(err); }); }; input.click(); };


/* =========================================================

 * DATABASE BLOCK: window.epOpenTextImportServerProposalV7

 * ========================================================= */

window.epOpenTextImportServerProposalV7=function(type){ window.EP_V7_IMPORT_TARGET='server_proposal'; try{ if(typeof window.epOpenTextImport==='function') window.epOpenTextImport(type); }catch(e){} };


/* =========================================================

 * DATABASE BLOCK: window.epFirebaseDbDebug

 * ========================================================= */

window.epFirebaseDbDebug=function(){
    var fbu=fbUser();
    var info={scope:scope(),appUser:window.appUser||null,firebaseUser:fbu?{uid:fbu.uid,email:fbu.email}:null,isAdmin:isAdmin(),uid:uid(),myMat:getMy('mat').length,myWork:getMy('work').length,serverMat:getServer('mat').length,serverWork:getServer('work').length,hint:firebaseHint()};
    console.log('EP Firebase DB debug',info);
    alert('Проверка Firebase\n\nАктивно: '+label()+'\nАдмин: '+(isAdmin()?'да':'нет')+'\nUID: '+(uid()||'нет')+'\nFirebase вход: '+(fbu?(fbu.email||fbu.uid):'нет')+'\nМоя база: '+info.myMat+' мат / '+info.myWork+' раб\nСервер: '+info.serverMat+' мат / '+info.serverWork+' раб\n\n'+firebaseHint());
    return info;
  };


/* =========================================================

 * DATABASE BLOCK: window.EP_DB_ADMIN_SETTINGS_AI_STABILITY_V11

 * ========================================================= */

window.EP_DB_ADMIN_SETTINGS_AI_STABILITY_V11 = true;

  function $(id){ return document.getElementById(id); }
  


/* =========================================================

 * DATABASE BLOCK: window.EP_ADMIN_SERVER_DB_EDIT

 * ========================================================= */

window.EP_ADMIN_SERVER_DB_EDIT === true && isAdmin()); }
  function explainServerEdit(){ return '🌍 Базу сервера меняем только через Настройки → Админ панель → База сервера. Здесь сервер открыт для просмотра/выбора, чтобы случайно не залить личный импорт в глобальную базу.'; }

  


/* =========================================================

 * DATABASE BLOCK: window.EP_OPENING_ADMIN_SERVER_DB

 * ========================================================= */

window.EP_OPENING_ADMIN_SERVER_DB = true;
    try{ localStorage.setItem('ep_db_scope_v2','global'); }


/* =========================================================

 * DATABASE BLOCK: window.epV17BulkMove

 * ========================================================= */

window.epV17BulkMove=async function(){
    var checks=Array.prototype.slice.call(document.querySelectorAll('#settModal .ep-v7-select:checked')); if(!checks.length) return toast('Выбери позиции галочками');
    var c=clean($('ep-v17-move-cat')&&$('ep-v17-move-cat').value), g=clean($('ep-v17-move-sub')&&$('ep-v17-move-sub').value); if(!c&&!g) return toast('Укажи категорию или подкатегорию');
    var ids={}; checks.forEach(function(ch){ ids[String(ch.dataset.id||'')]=true; });
    function move(arr){ return (arr||[]).map(function(it){ if(ids[String(it.id||'')]){ var x=Object.assign({},it); if(c)x.c=c; if(g){x.g=g;x.sc=g;x.subcategory=g;} return x;} return it;}); }
    try{ if(typeof active==='function' && typeof scope==='function'){ var type=checks[0].dataset.type||'mat'; var arr=move(active(type)); if(scope()==='global' && typeof setServer==='function') setServer(type,arr); else if(typeof setMy==='function') setMy(type,arr); if(typeof epSaveActiveDbV7==='function') await epSaveActiveDbV7(); if(typeof renderDbEditors==='function') renderDbEditors(); toast('📦 Перенесено: '+checks.length); } }catch(e){ toast('Ошибка перемещения: '+(e.message||e)); }
  };


/* =========================================================

 * DATABASE BLOCK: window.epV17BulkDelete

 * ========================================================= */

window.epV17BulkDelete=async function(){
    var checks=Array.prototype.slice.call(document.querySelectorAll('#settModal .ep-v7-select:checked')); if(!checks.length) return toast('Выбери позиции галочками');
    var ok=true; try{ if(typeof customConfirm==='function') ok=await customConfirm('Удаление','Удалить выбранные позиции: '+checks.length+'?'); else ok=confirm('Удалить выбранные позиции: '+checks.length+'?'); }catch(e){}
    if(!ok) return;
    var ids={}; checks.forEach(function(ch){ ids[String(ch.dataset.id||'')]=true; });
    try{ if(typeof active==='function' && typeof scope==='function'){ var type=checks[0].dataset.type||'mat'; var arr=(active(type)||[]).filter(function(it){return !ids[String(it.id||'')];}); if(scope()==='global' && typeof setServer==='function') setServer(type,arr); else if(typeof setMy==='function') setMy(type,arr); if(typeof epSaveActiveDbV7==='function') await epSaveActiveDbV7(); if(typeof renderDbEditors==='function') renderDbEditors(); toast('🗑 Удалено: '+checks.length); } }catch(e){ toast('Ошибка удаления: '+(e.message||e)); }
  };


/* =========================================================

 * DATABASE BLOCK: window.epV18SetStatus

 * ========================================================= */

window.epV18SetStatus=function(state,msg){
    var b=ensureBadge();
    var colors={ok:'#16a34a', upload:'#dc2626', download:'#2563eb', error:'#991b1b'};
    b.style.background=colors[state]||colors.ok;
    b.textContent=(state==='upload'?'🔴 ':state==='download'?'🔵 ':state==='error'?'⚠️ ':'✅ ')+(msg||'V18 активна');
  };


/* =========================================================

 * DATABASE BLOCK: window.epV18GenerateShield

 * ========================================================= */

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


/* =========================================================

 * DATABASE BLOCK: window.epV18ShowDetails

 * ========================================================= */

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


/* =========================================================

 * DATABASE BLOCK: window.epV18SelectVisible

 * ========================================================= */

window.epV18SelectVisible=function(on){ Array.prototype.forEach.call(document.querySelectorAll('#settModal .ep-v18-check'),function(ch){ var row=ch.closest('.emp-row,.mat-item'); if(!row || row.offsetParent!==null) ch.checked=!!on; }); };


/* =========================================================

 * DATABASE BLOCK: window.epV18MoveSelected

 * ========================================================= */

window.epV18MoveSelected=async function(){
    var checks=selectedChecks(); if(!checks.length) return toast('Выбери позиции галочками слева');
    var cat=clean($('ep-v18-move-cat')&&$('ep-v18-move-cat').value), sub=clean($('ep-v18-move-sub')&&$('ep-v18-move-sub').value); if(!cat&&!sub) return toast('Выбери категорию или подкатегорию');
    var byType={mat:{},work:{}}; checks.forEach(function(ch){ byType[ch.dataset.type==='work'?'work':'mat'][String(ch.dataset.id||'')]=1; }); var moved=0;
    for(var type in byType){ var ids=byType[type]; if(!Object.keys(ids).length) continue; var arr=getArr(type).map(function(it){ if(ids[String(it.id||'')]){ var x=clone(it); if(cat) x.c=cat; if(sub){ x.g=sub; x.sc=sub; x.subcategory=sub; } moved++; return x; } return it; }); await saveArr(type,arr); }
    refreshDbEnhancements(); try{ if(typeof renderDbEditors==='function') renderDbEditors(); }catch(e){} toast('📦 Перемещено: '+moved);
  };


/* =========================================================

 * DATABASE BLOCK: window.epV18DeleteSelected

 * ========================================================= */

window.epV18DeleteSelected=async function(){
    var checks=selectedChecks(); if(!checks.length) return toast('Выбери позиции галочками слева');
    var ok=true; try{ if(typeof customConfirm==='function') ok=await customConfirm('Удаление','Удалить выбранные позиции: '+checks.length+'?'); else ok=confirm('Удалить выбранные позиции: '+checks.length+'?'); }catch(e){}
    if(!ok) return; var byType={mat:{},work:{}}; checks.forEach(function(ch){ byType[ch.dataset.type==='work'?'work':'mat'][String(ch.dataset.id||'')]=1; }); var removed=0;
    for(var type in byType){ var ids=byType[type]; if(!Object.keys(ids).length) continue; var arr=getArr(type).filter(function(it){ if(ids[String(it.id||'')]){ removed++; return false; } return true; }); await saveArr(type,arr); }
    refreshDbEnhancements(); try{ if(typeof renderDbEditors==='function') renderDbEditors(); }catch(e){} toast('🗑 Удалено: '+removed);
  };


/* =========================================================

 * DATABASE BLOCK: window.epV21UpdateSubs

 * ========================================================= */

window.epV21UpdateSubs=function(){ fillSelectors(true); };


/* =========================================================

 * DATABASE BLOCK: window.epV21SelectVisible

 * ========================================================= */

window.epV21SelectVisible=function(on){
    Array.prototype.forEach.call(document.querySelectorAll('#settModal .ep-v21-check, #settModal .ep-v18-check'),function(ch){ var row=ch.closest('.emp-row,.mat-item'); if(!row || row.offsetParent!==null) ch.checked=!!on; });
  };


/* =========================================================

 * DATABASE BLOCK: window.epV21MoveSelected

 * ========================================================= */

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


/* =========================================================

 * DATABASE BLOCK: window.epV21DeleteSelected

 * ========================================================= */

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
