/*
 * Extracted from public/index.html
 * Original script block: 5
 * Original HTML lines: 3871-4181
 */

(function(){
  function qs(id){ return document.getElementById(id); }
  function safeText(v){ return String(v || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }
  function norm(v){ return String(v || '').toLowerCase().replace(/ё/g,'е').replace(/[^a-zа-я0-9]+/g,' ').trim(); }
  function uniq(arr){ return Array.from(new Set(arr.filter(Boolean))); }
  function getVal(id, def){ var el=qs(id); return el ? el.value : def; }
  function getCheck(id){ var el=qs(id); return !!(el && el.checked); }
  function toNum(v, def){ var n=Number(v); return Number.isFinite(n) ? n : (def || 0); }

  function getCfgCount(key, id, def){
    try { if (window.cfg && Number.isFinite(Number(window.cfg[key]))) return Number(window.cfg[key]); } catch(e){}
    var el = qs(id || ('v-'+key));
    if (el) return toNum(el.textContent || el.value, def || 0);
    return def || 0;
  }

  function epMoveShieldSettingsIntoDetails(){
    var modal = qs('configModal');
    if (!modal || qs('ep-shield-settings-box')) return;
    var content = modal.querySelector('.modal-content');
    if (!content) return;
    var anchor = qs('cfg-brand-box');
    if (!anchor) return;

    var details = document.createElement('details');
    details.id = 'ep-shield-settings-box';
    details.className = 'ep-shield-settings-box';
    details.innerHTML = '<summary>⚙️ Настройки автоматики и щита</summary><div id="ep-shield-settings-inner"></div>';
    var firstRow = anchor.closest('div[style*="grid-template-columns"]') || anchor.parentElement;
    content.insertBefore(details, firstRow);
    var inner = qs('ep-shield-settings-inner');

    var ids = ['cfg-brand-box','cfg-brand-auto','cfg-phase','cfg-auto-curve','cfg-rcd-type','cfg-protection-type'];
    var moved = [];
    ids.forEach(function(id){
      var el = qs(id); if(!el) return;
      var row = el.closest('div[style*="grid-template-columns"]') || el.parentElement;
      if(row && moved.indexOf(row) === -1){ moved.push(row); inner.appendChild(row); }
    });

    var wall = qs('cfg-shield-wall');
    if (wall) {
      var wrap = document.createElement('div');
      wrap.style.marginBottom = '8px';
      var label = wall.previousElementSibling;
      if (label && String(label.tagName).toLowerCase() === 'label') wrap.appendChild(label);
      wrap.appendChild(wall);
      inner.appendChild(wrap);
    }
  }

  function epMatGroupName(item){
    var text = norm([item.c,item.g,item.sc,item.n,item.kind,item.brand,item.nominal].join(' '));
    var name = norm(item.n);
    var c = norm(item.c);

    if (text.includes('уздп') || text.includes('дугов')) return {c:'Автоматика', g:'УЗДП'};
    if (text.includes('узм') || text.includes('реле напряж')) return {c:'Автоматика', g:'УЗМ / реле напряжения'};
    if (text.includes('диф') || text.includes('дифф')) return {c:'Автоматика', g:'ДИФы'};
    if (text.includes('узо')) return {c:'Автоматика', g:'УЗО'};
    if (text.includes('автомат') || text.match(/\bc\s*(6|10|16|25|32|40)\b/)) return {c:'Автоматика', g:'Автоматы'};
    if (text.includes('реле времени')) return {c:'Автоматика', g:'Реле времени'};
    if (text.includes('контактор') || text.includes('пускател')) return {c:'Автоматика', g:'Контакторы'};
    if (text.includes('реле')) return {c:'Автоматика', g:'Прочие реле'};

    if (text.includes('щит') || text.includes('шкаф') || text.includes('корпус')) {
      if (text.includes('наклад')) return {c:'Щитовое', g:'Корпуса → Накладной'};
      if (text.includes('встра') || text.includes('внутр')) return {c:'Щитовое', g:'Корпуса → Встраиваемый'};
      return {c:'Щитовое', g:'Корпуса'};
    }
    if (text.includes('ншви') || text.includes('наконеч')) return {c:'Щитовое', g:'Расходка под сборку → Наконечники'};
    if (text.includes('пугв') || (text.includes('провод') && c !== 'кабель')) return {c:'Щитовое', g:'Расходка под сборку → Провода'};
    if (text.includes('шин') || text.includes('клемм')) return {c:'Щитовое', g:'Расходка под сборку → Шинки / клеммники'};
    if (text.includes('греб') || text.includes('comb')) return {c:'Щитовое', g:'Расходка под сборку → Гребёнки'};
    if (text.includes('din') || text.includes('рейк') || text.includes('огранич')) return {c:'Щитовое', g:'Расходка под сборку → DIN-рейки / ограничители'};
    if (text.includes('маркиров') || text.includes('бирк')) return {c:'Щитовое', g:'Расходка под сборку → Маркировка'};
    if (text.includes('сальник') || text.includes('кабельный ввод')) return {c:'Щитовое', g:'Расходка под сборку → Кабельные вводы'};

    return {c:item.c || 'Разное', g:item.g || item.sc || 'Разное'};
  }

  function epNormalizeMaterialsDb(){
    function fixArr(arr){
      if (!Array.isArray(arr)) return [];
      arr.forEach(function(it){
        if(!it || typeof it !== 'object') return;
        if(!it.id) it.id = 'm_' + Math.abs(norm([it.c,it.g,it.n,it.p].join('_')).split('').reduce(function(h,ch){return ((h<<5)-h+ch.charCodeAt(0))|0;},0));
        var grp = epMatGroupName(it);
        // Меняем только автоматику/щитовое, остальное не трогаем.
        if (grp.c === 'Автоматика' || grp.c === 'Щитовое') { it.c = grp.c; it.g = grp.g; it.sc = grp.g; }
      });
      return arr;
    }
    try { window.matDB = fixArr(window.matDB || []); } catch(e){}
    try { window.userMatDB = fixArr(window.userMatDB || []); } catch(e){}
  }

  function epGroupedData(arr, type){
    var data = {};
    (arr || []).forEach(function(it){
      if(!it) return;
      if(!it.id) it.id = (type === 'work' ? 'w_' : 'm_') + Math.abs(norm([it.c,it.g,it.n,it.p].join('_')).split('').reduce(function(h,ch){return ((h<<5)-h+ch.charCodeAt(0))|0;},0));
      var c = it.c || 'Разное';
      var g = type === 'mat' ? (it.g || it.sc || 'Разное') : (it.g || it.sc || 'Разное');
      if(!data[c]) data[c] = {};
      if(!data[c][g]) data[c][g] = [];
      data[c][g].push(it);
    });
    return data;
  }

  function epRenderGrouped(arr, type, mode, prefix){
    var data = epGroupedData(arr, type);
    var html = '', i = 0;
    Object.keys(data).sort(function(a,b){return a.localeCompare(b,'ru');}).forEach(function(c){
      var cid = prefix + '_c_' + (i++);
      var catStyle = type === 'work' ? 'style="color:var(--orange); border-color:rgba(245,158,11,0.2); background:rgba(245,158,11,0.08);"' : '';
      html += '<div class="cat-header" '+catStyle+' onclick="toggleCat(\''+cid+'\')">'+safeText(c)+' <span>▼</span></div><div class="cat-body" id="'+cid+'">';
      Object.keys(data[c]).sort(function(a,b){return a.localeCompare(b,'ru');}).forEach(function(g){
        var sid = prefix + '_s_' + (i++);
        html += '<div class="ep-db-sub-header" onclick="epToggleShieldDbSub(\''+sid+'\', event)">'+safeText(g)+' <small>открыть</small></div><div class="ep-db-sub-body" id="'+sid+'">';
        data[c][g].sort(function(a,b){return String(a.n||'').localeCompare(String(b.n||''),'ru');}).forEach(function(it){
          var id = safeText(it.id);
          var meta = safeText(g)+' • '+(Number(it.p)||0)+' ₽ / '+safeText(it.u || 'шт');
          if (mode === 'editor') {
            html += '<div class="emp-row"><div style="flex:1;"><div class="ep-db-item-title">'+safeText(it.n || 'Позиция')+'</div><div class="ep-db-item-meta">'+meta+'</div></div><div class="ep-row-actions"><input type="number" value="'+(Number(it.p)||0)+'" onchange="requestPriceChange(\''+type+'\',\''+id+'\',this.value)" style="width:74px;margin:0;padding:5px;text-align:center;"><button class="btn-danger" onclick="epDeleteDbItem && epDeleteDbItem(\''+type+'\',\''+id+'\')" title="Удалить">🗑</button></div></div>';
          } else {
            var color = type === 'work' ? 'background:var(--orange);' : '';
            html += '<div class="mat-item"><div style="flex:1;"><div class="ep-db-item-title">'+safeText(it.n || 'Позиция')+'</div><div class="ep-db-item-meta">'+meta+'</div></div><button class="mat-add-btn" style="'+color+' width:auto; margin:0;" onclick="epPromptShieldGroupedAdd(\''+id+'\',\''+type+'\')">+ Добавить</button></div>';
          }
        });
        html += '</div>';
      });
      html += '</div>';
    });
    return html || '<div style="color:var(--gray);font-size:12px;padding:10px;">Позиции не найдены</div>';
  }

  window.epToggleShieldDbSub = function(id, e){ if(e) e.stopPropagation(); var el=qs(id); if(el) el.classList.toggle('active'); };
  window.epPromptShieldGroupedAdd = function(id, type){
    var arr = type === 'work' ? (window.workDB || []) : (window.matDB || []);
    var item = arr.find(function(x){return String(x.id) === String(id);});
    if(!item) return;
    window.pendingAdd = { item:item, type:type };
    var n = qs('qty-prompt-name'); if(n) n.innerText = item.n || 'Позиция';
    var q = qs('qty-input'); if(q) q.value = 1;
    if (typeof openModal === 'function') openModal('qtyPromptModal');
  };

  function epPatchDbRenderers(){
    var oldMat = window.openMatCatalog;
    var oldWork = window.openWorkCatalog;
    var oldRender = window.renderDbEditors;
    window.openMatCatalog = function(){ epNormalizeMaterialsDb(); var el=qs('mat-cat-list'); if(el) el.innerHTML = epRenderGrouped(window.matDB || [], 'mat', 'catalog', 'mat_shield'); if(typeof openModal==='function') openModal('matCatModal'); else if(oldMat) oldMat(); };
    window.openWorkCatalog = function(){ var el=qs('work-cat-list'); if(el) el.innerHTML = epRenderGrouped(window.workDB || [], 'work', 'catalog', 'work_shield'); if(typeof openModal==='function') openModal('workModal'); else if(oldWork) oldWork(); };
    window.renderDbEditors = function(){
      epNormalizeMaterialsDb();
      var catsEl = qs('db-cats');
      if (catsEl) catsEl.innerHTML = uniq([].concat((window.matDB||[]).map(function(x){return x.c;}),(window.workDB||[]).map(function(x){return x.c;}))).map(function(c){return '<option value="'+safeText(c)+'">';}).join('');
      var em=qs('editor-mat-list'); if(em) em.innerHTML = epRenderGrouped(window.matDB || [], 'mat', 'editor', 'db_mat_shield');
      var ew=qs('editor-work-list'); if(ew) ew.innerHTML = epRenderGrouped(window.workDB || [], 'work', 'editor', 'db_work_shield');
    };
  }

  function epAllDbItems(type){
    var a = type === 'work' ? (window.workDB || []) : (window.matDB || []);
    var b = type === 'work' ? (window.userWorkDB || []) : (window.userMatDB || []);
    return [].concat(a || [], b || []).filter(Boolean);
  }
  function epFindItem(type, words){
    var ws = (words || []).map(norm).filter(Boolean);
    var best = null, bestScore = -1;
    epAllDbItems(type).forEach(function(it){
      var blob = norm([it.c,it.g,it.sc,it.n,it.brand,it.kind,it.nominal,it.curve,it.wallType,it.modules,it.mountType].join(' '));
      var score = 0;
      ws.forEach(function(w){ if(w && blob.includes(w)) score++; });
      if(score > bestScore){ bestScore = score; best = it; }
    });
    return bestScore >= Math.max(1, Math.ceil(ws.length * 0.55)) ? best : null;
  }
  function epMat(label, q, fallbackPrice, words, meta){
    epNormalizeMaterialsDb();
    var found = epFindItem('mat', words || [label]);
    if(found) return { n: found.n, q: q, p: Number(found.p) || 0, u: found.u || 'шт', type: 'mat', sourceId: found.id || null };
    meta = meta || {};
    var path = meta.category ? ' [' + meta.category + (meta.subcategory ? ' → ' + meta.subcategory : '') + ']' : '';
    return { n: '⚠️ ' + label + path + ' — добавить в БД', q: q, p: Number(fallbackPrice) || 0, u: meta.unit || 'шт', type: 'mat', needDb: true, dbMeta: meta };
  }
  function epWork(label, q, price, words, meta){
    var found = epFindItem('work', words || [label]);
    if(found) return { n: found.n, q: q, p: Number(found.p) || Number(price) || 0, u: found.u || (meta && meta.unit) || 'шт', type: 'work', sourceId: found.id || null };
    return { n: label, q: q, p: Number(price) || 0, u: (meta && meta.unit) || 'шт', type: 'work', logicPrice: true };
  }

  window.epGenerateShieldFixed = function(){
    try {
      if (typeof window.addAuto !== 'function') throw new Error('addAuto не найден');
      var bBox = getVal('cfg-brand-box','Tekfor');
      var bAuto = getVal('cfg-brand-auto','IEK');
      var sWall = getVal('cfg-shield-wall','Бетон');
      var ph = parseInt(getVal('cfg-phase','1'),10) || 1;
      var curve = getVal('cfg-auto-curve','C');
      var rcdType = getVal('cfg-rcd-type','A');
      var protectionType = getVal('cfg-protection-type','uzo_auto');
      var isMaster = getCheck('cfg-master');
      var heavySeparate = getCheck('cfg-heavy-separate');
      var appLogic = window.appLogic || {};

      var m = [], w = [], lines = [], protectionDevices = [], warnings = [];
      var groupNames = { power:'Силовые линии', climate:'Климат', wet:'Влажные зоны', light:'Освещение', heavy:'Большая техника', alwaysOn:'Неотключаемые группы', main:'Главная защита' };

      function addLine(name, nominal, group, opts){ opts=opts||{}; lines.push({name:name, nominal:nominal, group:group, curve:opts.curve || curve, nonSwitchable:!!opts.nonSwitchable, wet:group==='wet'||!!opts.wet}); }
      function addRoom(label, count, wetPower){ for(var i=1;i<=count;i++){ var n = count > 1 ? label + ' ' + i : label; addLine(n + ' розетки', 'C16', wetPower ? 'wet' : 'power', {wet:wetPower}); addLine(n + ' свет', 'C10', 'light'); } }
      addRoom('Кухня', getCfgCount('kits','v-kits',1), false);
      addRoom('Ванная', getCfgCount('baths','v-baths',1), true);
      addRoom('Туалет', getCfgCount('toilets','v-toilets',1), true);
      addRoom('Комната', getCfgCount('rms','v-rms',1), false);
      addRoom('Балкон', getCfgCount('bals','v-bals',0), false);
      if(getCheck('c-apron')) addLine('Фартук кухни','C16','power');
      if(getCheck('c-dish')) addLine('Посудомойка','C10','power');
      if(getCheck('c-washer')) addLine('Стиралка/сушилка','C10','wet',{wet:true});
      if(getCheck('c-towel')) addLine('Полотенцесушитель','C10','wet',{wet:true});
      for(var ac=1; ac<=getCfgCount('acs','v-acs',0); ac++) addLine('Кондиционер '+ac,'C10','climate');
      for(var fl=1; fl<=getCfgCount('fls','v-fls',0); fl++) addLine('Тёплый пол '+fl,'C10','climate');
      if(getCheck('c-fridge')) addLine('Холодильник, неотключаемая группа','C10','alwaysOn',{nonSwitchable:true});
      if(getCheck('c-neptun')) addLine('Нептун, неотключаемая группа','C10','alwaysOn',{nonSwitchable:true});
      if(getCheck('c-router')) addLine('Роутер, неотключаемая группа','C6','alwaysOn',{nonSwitchable:true});
      var hob = getVal('c-hob-power','none'); if(hob==='6') addLine('Плита до 6 кВт','C25',heavySeparate?'heavy':'power'); if(hob==='10') addLine('Плита до 10 кВт','C32',heavySeparate?'heavy':'power');
      var boiler = getVal('c-boiler-power','none'); if(boiler==='6') addLine('Бойлер до 6 кВт','C25','wet',{wet:true}); if(boiler==='10') addLine('Бойлер до 10 кВт','C32','wet',{wet:true});

      var presentGroups = uniq(lines.map(function(l){return l.group;}));
      function addProtection(group, kind){ var leakage = group === 'wet' ? 10 : 30; protectionDevices.push({group:group, kind:kind, leakage:leakage, rcdType:rcdType, modules:2}); }
      if(protectionType === 'main_dif_auto') protectionDevices.push({group:'main', kind:'Главный ДИФ', leakage:30, rcdType:rcdType, modules:2});
      else if(protectionType === 'mixed') presentGroups.forEach(function(g){ addProtection(g, g === 'wet' ? 'ДИФ' : 'УЗО'); });
      else presentGroups.forEach(function(g){ addProtection(g, protectionType === 'dif_auto' ? 'ДИФ' : 'УЗО'); });

      function autoPrice(){ return bAuto === 'ABB' ? 350 : 155; }
      function difPrice(){ return bAuto === 'ABB' ? 4500 : 3600; }
      m.push(epMat('Вводной автомат '+ph+'ф '+bAuto, 1, bAuto === 'ABB' ? 3500 : 1800, ['автомат','вводной',bAuto,ph+'ф'], {category:'Автоматика', subcategory:'Автоматы', kind:'input_breaker'}));
      protectionDevices.forEach(function(pd){ var label = pd.kind === 'Главный ДИФ' ? 'Главный ДИФ '+bAuto+' '+pd.leakage+'мА тип '+pd.rcdType : pd.kind+' '+(groupNames[pd.group]||pd.group)+' '+pd.leakage+'мА тип '+pd.rcdType+' '+bAuto; m.push(epMat(label,1,difPrice(),[pd.kind,bAuto,pd.leakage+'мА',pd.rcdType,groupNames[pd.group]||pd.group],{category:'Автоматика', subcategory: pd.kind === 'УЗО' ? 'УЗО' : 'ДИФы', kind:pd.kind, leakage:pd.leakage, rcdType:pd.rcdType, modules:2})); });
      lines.forEach(function(line){ var label = 'Автомат '+line.nominal+' тип '+line.curve+' '+bAuto+' — '+line.name; m.push(epMat(label,1,autoPrice(),['автомат',bAuto,line.nominal,line.curve],{category:'Автоматика', subcategory:'Автоматы', kind:'automatic', nominal:line.nominal, curve:line.curve, modules:1})); });
      var relayModules = 0;
      if(getCheck('cfg-uzm')) { var rq = ph === 3 ? 3 : 1; relayModules = ph === 3 ? 6 : 2; m.push(epMat('Реле напряжения '+bAuto, rq, 4500, ['реле напряжения','узм',bAuto], {category:'Автоматика', subcategory:'УЗМ / реле напряжения', kind:'voltage_relay', modules:relayModules})); }
      if(isMaster){ m.push(epMat('Контактор C40 '+bAuto+' — мастер-кнопка света',1,2200,['контактор','C40',bAuto],{category:'Автоматика', subcategory:'Контакторы', kind:'contactor', modules:2})); m.push(epMat('Автомат C40 тип '+curve+' '+bAuto+' — байпас мастер-кнопки',1,autoPrice(),['автомат','C40',bAuto,curve],{category:'Автоматика', subcategory:'Автоматы', kind:'bypass_breaker', modules:1})); }
      try { (window.currentShieldExtras||[]).forEach(function(ex){ m.push({n:ex.n, q:Number(ex.q)||1, p:Number(ex.p)||0, u:ex.u||'шт', type:'mat'}); }); } catch(e){}

      var onePoleCount = lines.length + (isMaster ? 1 : 0);
      var twoPoleCount = protectionDevices.length;
      var masterModules = isMaster ? 3 : 0;
      var extraModules = 0; try { extraModules = (window.currentShieldExtras||[]).reduce(function(s,ex){return s + (Number(ex.modules||1)*Number(ex.q||1));},0); } catch(e){}
      var totalModules = Math.ceil(onePoleCount + twoPoleCount*2 + relayModules + masterModules + extraModules + (ph===3 ? 3 : 2));
      var boxSize = [6,12,24,36,48,60,72].find(function(s){return s >= totalModules;}) || 72;
      if(totalModules > 72) warnings.push('Нужно больше 72 модулей — требуется второй щит или пересборка схемы');
      m.unshift(epMat('Щит '+(sWall==='Накладной'?'накладной':'встраиваемый')+' '+bBox+' '+boxSize+'М',1,bBox==='ABB'?6510:2660,['щит',bBox,String(boxSize),sWall==='Накладной'?'накладной':'встраиваемый'],{category:'Щитовое', subcategory: sWall==='Накладной'?'Корпуса → Накладной':'Корпуса → Встраиваемый', kind:'shield_box', modules:boxSize}));

      var comb1P = Math.ceil(onePoleCount/12);
      var comb2P = Math.ceil(twoPoleCount/6);
      var rows = Math.ceil(boxSize/12);
      var pugvSize = Number(appLogic.shieldPugvSize || 6);
      var pugvMeters = Math.max(4, Math.ceil(totalModules * 0.4));
      var nshviPacks = Math.max(1, Math.ceil(boxSize/48));
      if(comb1P>0) m.push(epMat('Гребёнка 1P 25см',comb1P,250,['гребенка','1P','25'],{category:'Щитовое', subcategory:'Расходка под сборку → Гребёнки'}));
      if(comb2P>0) m.push(epMat('Гребёнка 2P 25см',comb2P,450,['гребенка','2P','25'],{category:'Щитовое', subcategory:'Расходка под сборку → Гребёнки'}));
      if(twoPoleCount>0) m.push(epMat('Нулевая шинка N на группу УЗО/ДИФ',twoPoleCount,285,['шина','N','ноль','DIN'],{category:'Щитовое', subcategory:'Расходка под сборку → Шинки / клеммники'}));
      m.push(epMat('PE-шина на '+(appLogic.shieldPeBusContacts || 26)+' контактов',1,770,['PE','шина','26'],{category:'Щитовое', subcategory:'Расходка под сборку → Шинки / клеммники'}));
      m.push(epMat('DIN-рейка / комплект DIN для щита',rows,180,['DIN','рейка'],{category:'Щитовое', subcategory:'Расходка под сборку → DIN-рейки / ограничители'}));
      m.push(epMat('Ограничитель на DIN-рейку',rows*2,35,['ограничитель','DIN'],{category:'Щитовое', subcategory:'Расходка под сборку → DIN-рейки / ограничители'}));
      m.push(epMat('Провод ПуГВ 1×'+pugvSize,pugvMeters,85,['ПуГВ','1x'+pugvSize,'1×'+pugvSize],{category:'Щитовое', subcategory:'Расходка под сборку → Провода', unit:'м.п.'}));
      m.push(epMat('НШВИ 1×'+pugvSize+', упак. 100 шт',nshviPacks,225,['НШВИ','1x'+pugvSize,'1×'+pugvSize],{category:'Щитовое', subcategory:'Расходка под сборку → Наконечники'}));
      m.push(epMat('Маркировка линий / бирки',lines.length,15,['маркировка','бирки'],{category:'Щитовое', subcategory:'Расходка под сборку → Маркировка'}));
      if(getCheck('cfg-cable-glands')) m.push(epMat('Кабельные вводы / сальники',1,250,['кабельный ввод','сальник'],{category:'Щитовое', subcategory:'Расходка под сборку → Кабельные вводы'}));

      if(sWall !== 'Накладной') w.push(epWork('Ниша щита '+boxSize+'М ('+sWall+')', boxSize, appLogic.shieldNichePerModule || 400, ['ниша','щит',sWall,String(boxSize)], {unit:'мод.'}));
      if(sWall !== 'Накладной') w.push(epWork('Штроба ВВОДНАЯ 100×50 ('+sWall+')',2,appLogic.shieldInputGroovePrice || 1500,['штроба','вводная','100x50',sWall],{unit:'м.п.'}));
      w.push(epWork('Сборка щита',totalModules,appLogic.priceShield || 500,['сборка','щит'],{unit:'мод.'}));
      w.push(epWork('Установка щита',1,appLogic.shieldInstallPrice || 2500,['установка','щит'],{unit:'шт'}));
      w.push(epWork('Подключение вводного кабеля',1,appLogic.shieldInputConnectPrice || 1500,['подключение','вводного','кабеля'],{unit:'шт'}));
      w.push(epWork('Прозвонка / проверка линий',lines.length,appLogic.shieldTestLinePrice || 150,['прозвонка','проверка','линий'],{unit:'линия'}));
      w.push(epWork('Маркировка линий',lines.length,appLogic.shieldMarkLinePrice || 100,['маркировка','линий'],{unit:'линия'}));
      if(getCheck('cfg-scheme')) w.push(epWork('Составление однолинейной схемы щита',1,appLogic.shieldSchemePrice || 4000,['однолинейная','схема','щит'],{unit:'шт'}));
      var info = [
        {n:'ℹ️ Щит: занято '+totalModules+' мод.; корпус '+boxSize+'М; свободно '+Math.max(0, boxSize-totalModules)+' мод.', q:1, p:0, type:'work'},
        {n:'ℹ️ Защита: '+protectionType+'; автоматы тип '+curve+'; УЗО/ДИФ тип '+rcdType+'; влажные зоны 10мА', q:1, p:0, type:'work'},
        {n:'ℹ️ Гребёнки: 1P '+comb1P+'×25см; 2P '+comb2P+'×25см; N-шинок '+twoPoleCount+'; PE-шина '+(appLogic.shieldPeBusContacts || 26)+' контактов', q:1, p:0, type:'work'}
      ];
      warnings.forEach(function(x){ info.push({n:'⚠️ '+x,q:1,p:0,type:'work'}); });
      window.addAuto(m.concat(w).concat(info),'shield');
      try { window.currentShieldExtras = []; } catch(e){}
      if(typeof closeModal === 'function') closeModal('configModal');
      if(typeof showToast === 'function') showToast('✅ Щит сгенерирован');
    } catch(err) {
      console.error('Shield generate error', err);
      var box = qs('ep-shield-generate-error');
      if(!box){ box = document.createElement('div'); box.id = 'ep-shield-generate-error'; box.className='ep-shield-generate-error'; var btn = Array.from(document.querySelectorAll('button')).find(function(b){return (b.textContent||'').includes('Сгенерировать щит');}); if(btn && btn.parentElement) btn.parentElement.insertBefore(box, btn); }
      if(box) box.textContent = 'Ошибка генерации щита: ' + (err && err.message ? err.message : err);
      if(typeof showToast === 'function') showToast('❌ Ошибка генерации щита');
    }
  };

  function epPatchGenerateButton(){
    window.generateCascadePanel = window.epGenerateShieldFixed;
    Array.from(document.querySelectorAll('button')).forEach(function(btn){ if((btn.textContent||'').includes('Сгенерировать щит')) btn.onclick = window.epGenerateShieldFixed; });
  }

  function boot(){ epMoveShieldSettingsIntoDetails(); epPatchDbRenderers(); epNormalizeMaterialsDb(); epPatchGenerateButton(); }
  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();
  setTimeout(boot, 500);
  setTimeout(boot, 1500);
})();
