/*
 * Extracted from public/index.html
 * Original script block: 7
 * Original HTML lines: 4395-4865
 */

/* === SURGICAL FIX 2026-05-13: shield details, no generic DIF, DB fallback, niche category === */
(function(){
  function qs(id){ return document.getElementById(id); }
  function safeHtml(s){
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
      .replace(/[^a-zа-я0-9]+/g,' ')
      .trim();
  }

  function arrByType(type){
    try{
      var arr = type === 'work' ? workDB : matDB;
      if(type === 'mat' && (!Array.isArray(arr) || !arr.length) && typeof FULL_MAT_INIT !== 'undefined') {
        matDB = (FULL_MAT_INIT || []).slice();
        arr = matDB;
      }
      if(type === 'work' && (!Array.isArray(arr) || !arr.length) && typeof FULL_WORK_INIT !== 'undefined') {
        workDB = (FULL_WORK_INIT || []).slice();
        arr = workDB;
      }
      return Array.isArray(arr) ? arr : [];
    }catch(e){
      return [];
    }
  }

  function setArrByType(type, arr){
    try{
      if(type === 'work') workDB = arr || [];
      else matDB = arr || [];
    }catch(e){}
  }

  function detectBrand(s){
    var raw = String(s || '');
    var brands = ['ABB','АBB','IEK','ИЭК','Schneider','Legrand','EKF','DEKraft','Tekfor','Hager','Lezard','TDM'];
    var low = norm(raw);
    for(var i=0;i<brands.length;i++){
      if(low.indexOf(norm(brands[i])) >= 0) return brands[i] === 'ИЭК' ? 'IEK' : (brands[i] === 'АBB' ? 'ABB' : brands[i]);
    }
    return '';
  }
  function detectNominal(s){
    var n = norm(s).replace(/\s+/g,'');
    var m = n.match(/([abcd])([0-9]{1,3})/i);
    return m ? (m[1].toUpperCase()+m[2]) : '';
  }
  function detectLeakage(s){
    var m = String(s||'').match(/(10|30|100|300)\s*м?а/i);
    return m ? Number(m[1]) : '';
  }
  function detectRcdType(s){
    var raw = String(s || '');
    var m = raw.match(/тип\s*(AC|A|B|АС|А|В)\b/i);
    if(m) {
      var t = m[1].toUpperCase();
      if(t === 'АС') return 'AC';
      if(t === 'А') return 'A';
      if(t === 'В') return 'B';
      return t;
    }
    return '';
  }

  function normalizeDbItem(it, type){
    if(!it) return it;
    if(!it.id) {
      it.id = (type === 'work' ? 'w_' : 'm_') + Date.now() + '_' + Math.random().toString(36).slice(2,8);
    }
    if(type === 'mat') {
      var raw = String([it.c,it.g,it.sc,it.subcategory,it.n].filter(Boolean).join(' '));
      var n = norm(raw);
      if(/диф|дифавтомат|dif/i.test(raw)){
        it.c = 'Автоматика'; it.g = it.g || it.sc || 'ДИФы'; it.sc = it.sc || it.g; it.kind = it.kind || 'dif';
      } else if(/узо/i.test(raw)) {
        it.c = 'Автоматика'; it.g = it.g || it.sc || 'УЗО'; it.sc = it.sc || it.g; it.kind = it.kind || 'uzo';
      } else if(/уздп|дугов/i.test(raw)) {
        it.c = 'Автоматика'; it.g = it.g || it.sc || 'УЗДП'; it.sc = it.sc || it.g; it.kind = it.kind || 'uzdp';
      } else if(/узм|реле напряж/i.test(raw)) {
        it.c = 'Автоматика'; it.g = it.g || it.sc || 'УЗМ / реле напряжения'; it.sc = it.sc || it.g; it.kind = it.kind || 'voltage_relay';
      } else if(/реле времени/i.test(raw)) {
        it.c = 'Автоматика'; it.g = it.g || it.sc || 'Реле времени'; it.sc = it.sc || it.g; it.kind = it.kind || 'time_relay';
      } else if(/контактор/i.test(raw)) {
        it.c = 'Автоматика'; it.g = it.g || it.sc || 'Контакторы'; it.sc = it.sc || it.g; it.kind = it.kind || 'contactor';
      } else if(/автомат|(^|\s)[abcdсавд]\s?\d{1,3}(\s|$)/i.test(raw)) {
        it.c = 'Автоматика'; it.g = it.g || it.sc || 'Автоматы'; it.sc = it.sc || it.g; it.kind = it.kind || 'automatic';
      } else if(/щит|корпус|бокс/i.test(raw)) {
        it.c = 'Щитовое';
        var g = /наклад/i.test(raw) ? 'Корпуса → Накладной' : 'Корпуса → Встраиваемый';
        it.g = it.g || it.sc || g; it.sc = it.sc || it.g; it.kind = it.kind || 'shield_box';
      } else if(/ншви|наконеч/i.test(raw)) {
        it.c = 'Щитовое'; it.g = it.g || it.sc || 'Расходка под сборку → Наконечники'; it.sc = it.sc || it.g; it.kind = it.kind || 'lug_pack';
      } else if(/пугв|провод/i.test(raw)) {
        it.c = it.c || 'Щитовое'; it.g = it.g || it.sc || 'Расходка под сборку → Провода'; it.sc = it.sc || it.g; it.kind = it.kind || 'pugv';
      } else if(/шин|клемм/i.test(raw)) {
        it.c = 'Щитовое'; it.g = it.g || it.sc || 'Расходка под сборку → Шинки / клеммники'; it.sc = it.sc || it.g; it.kind = it.kind || 'busbar';
      } else if(/греб/i.test(raw)) {
        it.c = 'Щитовое'; it.g = it.g || it.sc || 'Расходка под сборку → Гребёнки'; it.sc = it.sc || it.g; it.kind = it.kind || 'comb_bus';
      } else if(/din|дин|рейк|огранич/i.test(raw)) {
        it.c = 'Щитовое'; it.g = it.g || it.sc || 'Расходка под сборку → DIN-рейки / ограничители'; it.sc = it.sc || it.g; it.kind = it.kind || 'din';
      } else if(/маркир|бирк/i.test(raw)) {
        it.c = 'Щитовое'; it.g = it.g || it.sc || 'Расходка под сборку → Маркировка'; it.sc = it.sc || it.g; it.kind = it.kind || 'marking';
      }
      it.brand = it.brand || detectBrand(raw);
      it.nominal = it.nominal || detectNominal(raw);
      it.leakage = it.leakage || detectLeakage(raw);
      it.rcdType = it.rcdType || detectRcdType(raw);
    }
    if(type === 'work') {
      var wr = String([it.c,it.g,it.sc,it.subcategory,it.n].filter(Boolean).join(' '));
      if(/ниша.*щит|щит.*ниша|штроб|резк|алмаз|высверл|отверст/i.test(wr)) {
        it.c = it.c || 'Штробление и резка';
        if(/ниша.*щит|щит.*ниша/i.test(wr)) {
          it.c = 'Штробление и резка';
          it.g = it.g || it.sc || 'Ниши щита';
          it.sc = it.sc || it.g;
        }
      }
    }
    return it;
  }

  function normalizeDbs(){
    var mats = arrByType('mat').map(function(x){ return normalizeDbItem(x,'mat'); });
    var works = arrByType('work').map(function(x){ return normalizeDbItem(x,'work'); });
    setArrByType('mat', mats);
    setArrByType('work', works);
  }

  function renderGroupedFixed(arr, type, prefix){
    normalizeDbs();
    arr = type === 'work' ? arrByType('work') : arrByType('mat');
    var data = {};
    arr.forEach(function(it){
      if(!it) return;
      var c = it.c || 'Разное';
      var g = it.g || it.sc || it.subcategory || 'Разное';
      if(!data[c]) data[c] = {};
      if(!data[c][g]) data[c][g] = [];
      data[c][g].push(it);
    });
    var html = '', i = 0;
    Object.keys(data).sort(function(a,b){return a.localeCompare(b,'ru');}).forEach(function(c){
      var cid = prefix + '_cat_' + (i++);
      var catStyle = type === 'work' ? 'style="color:var(--orange);background:rgba(245,158,11,.08);"' : '';
      html += '<div class="cat-header" '+catStyle+' onclick="toggleCat(\''+cid+'\')">'+safeHtml(c)+'</div><div class="cat-body" id="'+cid+'">';
      Object.keys(data[c]).sort(function(a,b){return a.localeCompare(b,'ru');}).forEach(function(g){
        var gid = prefix + '_grp_' + (i++);
        html += '<div class="ep-db-sub-header" onclick="epDbToggleSubFixed(\''+gid+'\', event)"><span>'+safeHtml(g)+'</span><small>открыть</small></div><div class="ep-db-sub-body" id="'+gid+'">';
        data[c][g].sort(function(a,b){return String(a.n||'').localeCompare(String(b.n||''),'ru');}).forEach(function(it){
          var id = safeHtml(String(it.id||''));
          var meta = [g, it.brand, it.nominal, it.leakage ? it.leakage+'мА' : '', it.rcdType].filter(Boolean).join(' • ');
          var color = type === 'work' ? 'background:var(--orange);' : '';
          html += '<div class="mat-item"><div style="flex:1;"><div class="ep-db-item-title">'+safeHtml(it.n||'Позиция')+'</div><div class="ep-db-item-meta">'+safeHtml(meta)+' '+(Number(it.p)||0)+' ₽ / '+safeHtml(it.u||'шт')+'</div></div><button class="mat-add-btn" style="'+color+' width:auto;margin:0;" onclick="promptAdd(\''+id+'\', \''+type+'\')">+ Добавить</button></div>';
        });
        html += '</div>';
      });
      html += '</div>';
    });
    return html || '<div style="padding:15px;color:var(--gray);font-weight:700;">База пустая или ещё загружается</div>';
  }

  window.epDbToggleSubFixed = function(id,e){
    if(e) e.stopPropagation();
    var el = qs(id);
    if(el) el.classList.toggle('active');
  };

  window.openMatCatalog = function(){
    normalizeDbs();
    var el = qs('mat-cat-list');
    if(el) el.innerHTML = renderGroupedFixed(arrByType('mat'), 'mat', 'mat_fixed');
    if(typeof openModal === 'function') openModal('matCatModal');
  };
  window.openWorkCatalog = function(){
    normalizeDbs();
    var el = qs('work-cat-list');
    if(el) el.innerHTML = renderGroupedFixed(arrByType('work'), 'work', 'work_fixed');
    if(typeof openModal === 'function') openModal('workModal');
  };
  window.renderDbEditors = function(){
    normalizeDbs();
    var cats = qs('db-cats');
    if(cats) {
      var all = arrByType('mat').concat(arrByType('work'));
      cats.innerHTML = Array.from(new Set(all.map(function(x){return x.c || 'Разное';}))).sort(function(a,b){return a.localeCompare(b,'ru');}).map(function(c){return '<option value="'+safeHtml(c)+'">';}).join('');
    }
    var em = qs('editor-mat-list');
    var ew = qs('editor-work-list');
    if(em) em.innerHTML = renderGroupedFixed(arrByType('mat'), 'mat', 'dbmat_fixed');
    if(ew) ew.innerHTML = renderGroupedFixed(arrByType('work'), 'work', 'dbwork_fixed');
  };

  function reqDisplayName(label, meta){
    meta = meta || {};
    var brand = meta.brand || detectBrand(label);
    var nominal = meta.nominal || detectNominal(label);
    var kind = String(meta.kind || '').toLowerCase();
    var leakage = meta.leakage || detectLeakage(label);
    var rcdType = meta.rcdType || detectRcdType(label);

    if(kind.indexOf('automatic') >= 0 || kind.indexOf('breaker') >= 0 || /^C\d+/i.test(nominal)) {
      return ('Автомат ' + (nominal || '') + (brand ? ' ' + brand : '')).trim();
    }
    if(kind.indexOf('dif') >= 0 || /диф/i.test(label)) {
      return ('ДИФ ' + (leakage ? leakage + 'мА ' : '') + (rcdType ? rcdType + ' ' : '') + (brand || '')).trim();
    }
    if(kind.indexOf('uzo') >= 0 || /узо/i.test(label)) {
      return ('УЗО ' + (leakage ? leakage + 'мА ' : '') + (rcdType ? rcdType + ' ' : '') + (brand || '')).trim();
    }
    return String(label || 'Позиция').replace(/\s+—\s+.*$/,'').trim();
  }

  function strictFindMaterial(label, meta){
    normalizeDbs();
    meta = meta || {};
    var arr = arrByType('mat');
    var brand = meta.brand || detectBrand(label) || '';
    var nominal = meta.nominal || detectNominal(label) || '';
    var kind = String(meta.kind || '').toLowerCase();
    var leakage = meta.leakage || detectLeakage(label);
    var rcdType = meta.rcdType || detectRcdType(label);
    var isBreaker = kind.indexOf('automatic') >= 0 || kind.indexOf('breaker') >= 0 || !!nominal;
    var isDif = kind.indexOf('dif') >= 0 || /диф/i.test(label);
    var isUzo = kind.indexOf('uzo') >= 0 || /узо/i.test(label);

    var best = null, bestScore = -999;
    arr.forEach(function(it){
      var blob = norm([it.c,it.g,it.sc,it.subcategory,it.kind,it.brand,it.nominal,it.leakage,it.rcdType,it.n].filter(Boolean).join(' '));
      var raw = String(it.n || '');
      var score = 0;

      if(isBreaker) {
        if(!(blob.indexOf('автомат') >= 0 || String(it.kind||'').toLowerCase().indexOf('automatic') >= 0 || String(it.kind||'').toLowerCase().indexOf('breaker') >= 0)) return;
        if(nominal && blob.replace(/\s+/g,'').indexOf(norm(nominal).replace(/\s+/g,'')) < 0) return;
        score += 20;
      }

      if(isDif) {
        if(blob.indexOf('диф') < 0 && String(it.kind||'').toLowerCase().indexOf('dif') < 0) return;
        if(leakage && blob.indexOf(norm(leakage + 'ма')) < 0 && String(it.leakage||'') !== String(leakage)) return;
        if(rcdType && blob.indexOf(norm(rcdType)) < 0 && String(it.rcdType||'').toUpperCase() !== String(rcdType).toUpperCase()) score -= 3;
        if(norm(raw) === 'диф' || norm(raw) === 'дифы') score -= 100;
        score += 20;
      }

      if(isUzo) {
        if(blob.indexOf('узо') < 0 && String(it.kind||'').toLowerCase().indexOf('uzo') < 0) return;
        if(leakage && blob.indexOf(norm(leakage + 'ма')) < 0 && String(it.leakage||'') !== String(leakage)) return;
        if(rcdType && blob.indexOf(norm(rcdType)) < 0 && String(it.rcdType||'').toUpperCase() !== String(rcdType).toUpperCase()) score -= 3;
        if(norm(raw) === 'узо') score -= 100;
        score += 20;
      }

      if(brand) {
        if(blob.indexOf(norm(brand)) >= 0) score += 15;
        else score -= 30;
      }

      if(!isBreaker && !isDif && !isUzo) {
        var words = norm(label).split(/\s+/).filter(Boolean);
        words.forEach(function(w){ if(blob.indexOf(w) >= 0) score += 1; });
      }

      if(score > bestScore) { bestScore = score; best = it; }
    });

    if(best && bestScore >= 10) return best;
    return null;
  }

  window.epMat = function(label, q, fallbackPrice, words, meta){
    meta = meta || {};
    var found = strictFindMaterial(label, meta);
    var display = reqDisplayName(label, meta);

    if(found) {
      var foundName = String(found.n || '').trim();
      var generic = /^(диф|узо|автомат)$/i.test(foundName);
      return {
        n: generic ? display : display,
        q: q,
        p: Number(found.p) || Number(fallbackPrice) || 0,
        u: found.u || meta.unit || 'шт',
        type: 'mat',
        sourceId: found.id || null,
        dbMeta: meta,
        epRawLabel: label
      };
    }

    var extra = meta.category ? ' [' + meta.category + (meta.subcategory ? ' → ' + meta.subcategory : '') + ']' : '';
    return {
      n: '⚠️ ' + display + extra + ' — добавить в БД',
      q: q,
      p: Number(fallbackPrice) || 0,
      u: meta.unit || 'шт',
      type: 'mat',
      needDb: true,
      dbMeta: meta,
      epRawLabel: label
    };
  };
  try { epMat = window.epMat; } catch(e) {}

  function cleanCanonicalName(it){
    var n = String((it && it.n) || '').replace(/^⚠️\s*/,'').replace(/\s*\[[^\]]+\]\s*—\s*добавить в БД/i,'').trim();
    var meta = (it && it.dbMeta) || {};
    if(meta && (meta.kind || meta.nominal || meta.leakage)) return reqDisplayName(n, meta);
    var brand = detectBrand(n);
    var nominal = detectNominal(n);
    if(/автомат/i.test(n) && nominal) return ('Автомат '+nominal+(brand?' '+brand:'')).trim();
    if(/диф/i.test(n)) return reqDisplayName(n, {kind:'dif', brand:brand, leakage:detectLeakage(n), rcdType:detectRcdType(n)});
    if(/узо/i.test(n)) return reqDisplayName(n, {kind:'uzo', brand:brand, leakage:detectLeakage(n), rcdType:detectRcdType(n)});
    return n.replace(/\s+—\s+.*$/,'').trim();
  }

  function lineFromRaw(raw, fallbackName){
    raw = String(raw || '');
    var after = raw.split('—').slice(1).join('—').trim();
    if(after) return after;
    var n = String(fallbackName || raw || '');
    if(/вводн/i.test(n)) return 'Вводная линия';
    if(/реле напряж/i.test(n)) return 'Защита от перенапряжения';
    if(/контактор/i.test(n)) return 'Мастер-кнопка света';
    if(/байпас/i.test(n)) return 'Байпас мастер-кнопки света';
    if(/греб/i.test(n)) return 'Питание модульной автоматики';
    if(/нулев/i.test(n) || /N на группу/i.test(n)) return 'Нулевые шинки по группам защиты';
    if(/PE-шина/i.test(n)) return 'Защитное заземление PE';
    return 'Позиция щита';
  }

  function mergeEstimateFixed(){
    try{
      if(!Array.isArray(currentEstimate)) return;
      var map = new Map();
      currentEstimate.forEach(function(it){
        if(!it) return;
        var originalName = String(it.n || '');
        if(/^ДИФ$/i.test(originalName.trim()) || /^УЗО$/i.test(originalName.trim())) return; // лишняя обобщённая позиция
        var name = cleanCanonicalName(it);
        var key = [it.type||'', it.sourceId||'', name, Number(it.p)||0, it.u||'шт', it.tag||''].join('|');
        if(!map.has(key)) {
          map.set(key, Object.assign({}, it, {
            n: name,
            q: Number(it.q)||0,
            epMergedDetails: [],
            epRawLabels: []
          }));
        } else {
          map.get(key).q += Number(it.q)||0;
        }
        var rec = map.get(key);
        var raw = it.epRawLabel || originalName;
        if(raw && rec.epRawLabels.indexOf(raw) < 0) rec.epRawLabels.push(raw);
        var line = lineFromRaw(raw, name);
        if(line && rec.epMergedDetails.indexOf(line) < 0) rec.epMergedDetails.push(line);
      });
      currentEstimate = Array.from(map.values()).filter(function(x){ return Number(x.q) !== 0; });
    }catch(e){ console.error('mergeEstimateFixed', e); }
  }

  var oldRenderMainTableFixed = window.renderMainTable;
  window.renderMainTable = function(){
    mergeEstimateFixed();
    if(typeof oldRenderMainTableFixed === 'function') oldRenderMainTableFixed();
  };

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
  try { categorizeEstimateItem = window.categorizeEstimateItem; } catch(e) {}

  function shieldRowsForDetails(){
    var rows = [];
    (currentEstimate || []).forEach(function(it){
      var n = String((it && it.n) || '');
      if(!/(Автомат|ДИФ|УЗО|Реле|Контактор|Вводной)/i.test(n)) return;

      var details = Array.isArray(it.epMergedDetails) && it.epMergedDetails.length ? it.epMergedDetails.slice() : [lineFromRaw(it.epRawLabel || n, n)];

      if(/ДИФ|УЗО/i.test(n)) {
        if(/10\s*мА/i.test(n)) details = ['Влажные зоны / защита 10 мА'];
        else if(/30\s*мА/i.test(n) && /ДИФ|УЗО/i.test(n)) {
          if(/Климат/i.test(n)) details = ['Климат / кондиционеры / тёплые полы'];
          else if(/Освещ/i.test(n)) details = ['Освещение / группы мастер-кнопки'];
          else if(/Неотключ/i.test(n)) details = ['Неотключаемые группы / холодильник / Нептун / роутер'];
          else if(/Больш/i.test(n)) details = ['Большая техника / плита / бойлер'];
          else if(/Силов/i.test(n)) details = ['Силовые линии / розеточные группы'];
          else details = ['Группа защиты'];
        }
      }

      details.forEach(function(line){
        rows.push({
          line: line,
          app: n,
          note: detailNote(n, line)
        });
      });
    });
    return rows;
  }

  function detailNote(app, line){
    var n = String(app || '');
    if(/Вводной/i.test(n)) return 'ввод питания щита';
    if(/ДИФ|УЗО/i.test(n)) return /10\s*мА/i.test(n) ? 'защита влажных зон 10 мА' : 'групповая защита 30 мА';
    if(/Автомат/i.test(n)) return 'отдельный автомат линии';
    if(/Реле напряж/i.test(n)) return 'защита от перенапряжения';
    if(/Контактор/i.test(n)) return 'мастер-кнопка только на свет';
    return '';
  }

  var oldShowPreviewFixed = window.showPreview;
  window.showPreview = function(mode, isActOverride, customTitle){
    if(mode !== 'details') {
      return oldShowPreviewFixed.apply(this, arguments);
    }

    currentPreviewMode = mode;
    var title = customTitle || 'ДЕТАЛИЗАЦИЯ ЩИТА';
    var html = getPDFHeader(title);
    var filters = qs('pdf-filters');
    if(filters) filters.style.display = 'none';

    var rows = shieldRowsForDetails();

    html += '<table class="pdf-table"><tr><th>Что отвечает / линия</th><th>Аппарат</th><th>Назначение</th></tr>';
    if(!rows.length) {
      html += '<tr><td colspan="3" style="text-align:center;color:var(--gray);">Щит ещё не сгенерирован</td></tr>';
    } else {
      rows.forEach(function(r){
        html += '<tr><td style="font-weight:bold;color:var(--primary);">'+safeHtml(r.line)+'</td><td>'+safeHtml(r.app)+'</td><td>'+safeHtml(r.note)+'</td></tr>';
      });
    }
    html += '</table>';

    var p = qs('p-cont');
    if(p) p.innerHTML = html;
    if(typeof openModal === 'function') openModal('previewModal');
  };
  try { showPreview = window.showPreview; } catch(e) {}

  document.addEventListener('DOMContentLoaded', function(){
    try{ normalizeDbs(); }catch(e){}
    try{
      var em = qs('editor-mat-list'), ew = qs('editor-work-list');
      if(em && em.textContent && em.textContent.indexOf('Позиции не найдены') >= 0) em.innerHTML = renderGroupedFixed(arrByType('mat'), 'mat', 'dbmat_fixed_start');
      if(ew && ew.textContent && ew.textContent.indexOf('Позиции не найдены') >= 0) ew.innerHTML = renderGroupedFixed(arrByType('work'), 'work', 'dbwork_fixed_start');
    }catch(e){}
  });
})();
