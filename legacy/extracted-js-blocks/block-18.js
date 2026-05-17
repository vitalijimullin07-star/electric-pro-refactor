/*
 * Extracted from public/index.html
 * Original script block: 18
 * Original HTML lines: 8625-8829
 */

/* === EP DB AI PHOTO/PDF IMPORT FIX V10 ===
   Fixes V9: photo import was delegated to the old picker and PDF was not handled.
   Does not touch shield logic.
*/
(function(){
  var oldAskAI = window.epAskAI;

  function $(id){ return document.getElementById(id); }
  function toast(t){ try{ if(typeof showToast==='function') showToast(t); else alert(t); }catch(e){ console.log(t); } }
  function progress(title,pct,text){
    try{ if(typeof window.epDbProgress==='function') return window.epDbProgress(title,pct,text); }catch(e){}
    try{ if(typeof showLoader==='function') showLoader((text||title||'Загрузка') + (pct!=null?' '+pct+'%':''),'🤖'); }catch(e){}
  }
  function hideProgress(){ try{ if(typeof window.epDbHideProgress==='function') return window.epDbHideProgress(); }catch(e){} try{ if(typeof hideLoader==='function') hideLoader(); }catch(e){} }
  function clean(v){ return String(v==null?'':v).replace(/\s+/g,' ').trim(); }
  function esc(s){ return String(s==null?'':s).replace(/[&<>"']/g,function(m){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m];}); }
  function money(v){ var n=Number(String(v==null?'':v).replace(',','.').replace(/[^\d.\-]/g,'')); return Number.isFinite(n)?n:0; }
  function provider(){
    try{ var p=(window.EP_AI_CONFIG&&window.EP_AI_CONFIG.provider)||safeGet('ep_ai_provider_v1','gemini'); return p==='openai'?'openai':'gemini'; }catch(e){ return 'gemini'; }
  }
  function keyForProvider(p){
    try{
      if(p==='openai') return (window.EP_AI_CONFIG&&window.EP_AI_CONFIG.openaiKey)||safeGet('ep_openai_key_v1','');
      return (window.EP_AI_CONFIG&&window.EP_AI_CONFIG.geminiKey)||(typeof GEMINI_API_KEY!=='undefined'?GEMINI_API_KEY:'')||safeGet('gemini_key_v31','');
    }catch(e){ return ''; }
  }
  function openAiModel(){ try{ return (window.EP_AI_CONFIG&&window.EP_AI_CONFIG.openaiModel)||safeGet('ep_openai_model_v1','gpt-4o-mini')||'gpt-4o-mini'; }catch(e){ return 'gpt-4o-mini'; } }
  function dataMime(dataUrl){ var m=String(dataUrl||'').match(/^data:([^;]+);base64,/i); return m?m[1]:''; }
  function fileToDataURL(file){ return new Promise(function(res,rej){ var r=new FileReader(); r.onload=function(){res(String(r.result||''));}; r.onerror=rej; r.readAsDataURL(file); }); }
  function extractTextFromOpenAI(data){
    if(data && data.output_text) return data.output_text;
    var out='';
    ((data&&data.output)||[]).forEach(function(item){ ((item&&item.content)||[]).forEach(function(c){ if(c&&c.text) out+=c.text; if(c&&c.type==='output_text'&&c.text) out+=c.text; }); });
    return out;
  }
  async function askOpenAI(promptText, opts){
    var key=keyForProvider('openai'); if(!key) throw new Error('Нужен OpenAI API ключ');
    var content=[{type:'input_text', text:promptText}];
    if(opts && opts.fileDataUrl){
      content.push({ type:'input_file', filename: opts.fileName || 'import.pdf', file_data: opts.fileDataUrl });
    } else if(opts && opts.imageDataUrl){
      content.push({ type:'input_image', image_url: opts.imageDataUrl, detail: opts.imageDetail || 'high' });
    }
    var r=await fetch('https://api.openai.com/v1/responses',{
      method:'POST', headers:{'Content-Type':'application/json','Authorization':'Bearer '+key},
      body:JSON.stringify({ model:openAiModel(), input:[{role:'user', content:content}], max_output_tokens:(opts&&opts.maxTokens)||9000 })
    });
    var data=await r.json().catch(function(){return {};});
    if(!r.ok || data.error) throw new Error((data.error&&data.error.message)||'OpenAI API error');
    return extractTextFromOpenAI(data);
  }
  async function askGemini(promptText, opts){
    var key=keyForProvider('gemini'); if(!key) throw new Error('Нужен Gemini API ключ');
    var parts=[{text:promptText}];
    var dataUrl=(opts&&opts.fileDataUrl)||(opts&&opts.imageDataUrl)||'';
    if(dataUrl){
      var m=dataUrl.match(/^data:([^;]+);base64,(.*)$/i);
      if(m) parts.push({ inline_data:{ mime_type:m[1], data:m[2] } });
    }
    var url='https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key='+encodeURIComponent(key);
    var r=await fetch(url,{ method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({contents:[{parts:parts}]}) });
    var data=await r.json().catch(function(){return {};});
    if(!r.ok || data.error) throw new Error((data.error&&data.error.message)||'Gemini API error');
    return ((((data.candidates||[])[0]||{}).content||{}).parts||[]).map(function(p){return p.text||'';}).join('');
  }

  window.epAskAI = async function(promptText, opts){
    opts = opts || {};
    if(opts.fileDataUrl || opts.imageDataUrl){
      var p=provider();
      if(p==='openai') return askOpenAI(promptText, opts);
      return askGemini(promptText, opts);
    }
    if(typeof oldAskAI==='function') return oldAskAI(promptText, opts);
    var pp=provider(); return pp==='openai'?askOpenAI(promptText, opts):askGemini(promptText, opts);
  };

  function stripCode(t){ return String(t||'').replace(/```json/gi,'').replace(/```[a-z]*/gi,'').replace(/```/g,'').trim(); }
  function parseJsonLoose(t){
    var s=stripCode(t).replace(/[“”]/g,'"').replace(/[‘’]/g,"'").replace(/,\s*([}\]])/g,'$1');
    try{ var v=JSON.parse(s); if(Array.isArray(v))return v; if(v&&typeof v==='object')return v.items||v.positions||v.rows||v.data||v.result||v.materials||v.works||v['позиции']||[]; }catch(e){}
    var m=s.match(/\[[\s\S]*\]/); if(m){ try{return JSON.parse(m[0].replace(/,\s*([}\]])/g,'$1'));}catch(e){} }
    return [];
  }
  function inferCat(name,type){
    var n=String(name||'').toLowerCase();
    if(type==='work'){
      if(/штроб|борозд|резк|алмаз/.test(n))return 'Штробление';
      if(/подрозет|сверл/.test(n))return 'Высверливание подрозетников';
      if(/щит|автомат|узо|диф/.test(n))return 'Щитовое';
      if(/розет|выключ|механизм|рамк|светильник/.test(n))return 'Чистовая электрика';
      if(/кабел|провод|гофр|труб|короб/.test(n))return 'Черновая электрика';
      return 'Работы';
    }
    if(/ввг|пугв|пвс|кабел|провод|cat|utp|ftp|sat|коаксиал/.test(n))return 'Кабель';
    if(/гофр|труб|лоток|клипс/.test(n))return 'Трубы';
    if(/автомат|узо|диф|реле|контактор|щит|бокс|din|дин|шина|кросс/.test(n))return 'Автоматика';
    if(/подрозет|короб|клемм|wago|гмл|изол|саморез|дюбел|стяжк|наконечник|ншви/.test(n))return 'Расходники';
    if(/розет|выключ|рамк|механизм|диммер|терморег/.test(n))return 'Чистовое';
    if(/tv|интернет|rj|слаботоч/.test(n))return 'Слаботочка';
    return 'Разное';
  }
  function inferSub(name,cat,type){
    var n=String(name||'').toLowerCase();
    if(type==='work'){
      if(/штроб|борозд/.test(n))return 'Штробление';
      if(/подрозет|сверл/.test(n))return 'Подрозетники';
      if(/щит/.test(n))return 'Щит';
      if(/розет|выключ|механизм/.test(n))return 'Чистовая установка';
      return 'Работы';
    }
    if(/ввг/.test(n))return 'ВВГ'; if(/пугв|пу ?гв|пв-?3/.test(n))return 'ПУГВ';
    if(/utp|ftp|cat|rj/.test(n))return 'UTP/FTP'; if(/sat|tv|коаксиал/.test(n))return 'TV/SAT';
    if(/диф/.test(n))return 'ДИФы'; if(/узо/.test(n))return 'УЗО'; if(/автомат/.test(n))return 'Автоматы';
    if(/щит|бокс|шкаф|корпус/.test(n))return 'Щиты/корпуса'; if(/подрозет/.test(n))return 'Подрозетники';
    if(/клемм|wago|гмл|шина/.test(n))return 'Клеммы/соединители'; if(/ншви|наконеч/.test(n))return 'Наконечники';
    if(/розет/.test(n))return 'Розетки'; if(/выключ/.test(n))return 'Выключатели'; if(/рамк/.test(n))return 'Рамки';
    return 'Разное';
  }
  function normItem(x,type,i){
    x=x||{};
    var name=clean(x.n||x.name||x.title||x.item||x.position||x.material||x.work||x['Имя']||x['Название']||x['Наименование']||x['Товар']||x['Материал']||x['Работа']||x['позиция']||'');
    if(!name || name.length<3)return null;
    var cat=clean(x.c||x.cat||x.category||x.group||x['Категория']||x['Группа']||'')||inferCat(name,type);
    var sc=clean(x.sc||x.subcat||x.subcategory||x.subCategory||x.section||x.g||x['Подкатегория']||x['Раздел']||'')||inferSub(name,cat,type);
    var unit=clean(x.u||x.unit||x.measure||x['Ед']||x['Ед.']||x['Единица']||x['Единица измерения']||'шт')||'шт';
    var price=x.p||x.price||x.cost||x.unitPrice||x['Цена']||x['Цена ₽']||x['Цена за единицу']||x['Стоимость']||0;
    return { id:x.id||((type==='work'?'w':'m')+'_ai_v10_'+Date.now()+'_'+i), n:name, c:cat, sc:sc, g:sc, p:money(price), u:unit };
  }
  function normalize(raw,type){ var arr=Array.isArray(raw)?raw:(raw&&typeof raw==='object'?(raw.items||raw.positions||raw.data||raw.materials||raw.works||raw['позиции']||[]):[]); return (arr||[]).map(function(x,i){return normItem(x,type,i);}).filter(Boolean); }
  function unique(items,type){ var seen={}; return (items||[]).filter(function(it){ var k=[it.n,it.c,it.sc,it.u,Number(it.p)||0].join('|').toLowerCase(); if(seen[k])return false; seen[k]=1; return true; }); }
  function showReview(items,type,source,target,raw){
    items=unique(items,type);
    var selected={}; items.forEach(function(_,i){selected[i]=true;});
    window.EP_DB_REVIEW_V6={type:type,items:items,source:source||'',page:0,selected:selected,editCache:{}};
    window.EP_DB_REVIEW={type:type,items:items,source:source||''};
    window.EP_V9_IMPORT_TARGET=target; window.EP_V7_IMPORT_TARGET=target;
    var title=$('ep-db-ai-review-title'); if(title) title.innerText='Импорт '+(type==='work'?'работ':'материалов')+': '+(source||'файл')+' → '+(target==='global'?'База сервера':target==='server_proposal'?'Заявка админу':'Моя база');
    if(!items.length){ var list=$('ep-db-ai-review-list'); if(list) list.innerHTML='<div style="padding:12px;color:var(--danger);font-weight:900;">ИИ не нашёл позиции. Попробуй фото крупнее/ровнее или PDF с таблицей.</div><details style="font-size:11px;color:var(--gray);"><summary>Ответ ИИ</summary><pre style="white-space:pre-wrap;max-height:240px;overflow:auto;">'+esc(raw||'')+'</pre></details>'; }
    else if(typeof window.epReviewPageV6==='function') window.epReviewPageV6(0);
    else { var list2=$('ep-db-ai-review-list'); if(list2) list2.innerHTML=items.map(function(it,i){return '<div class="ep-db-review-row"><input type="checkbox" id="ep-db-check-'+i+'" checked><div class="ep-db-review-fields"><div><label>Имя</label><input id="ep-db-name-'+i+'" value="'+esc(it.n)+'"></div><div class="ep-db-review-2col"><div><label>Категория</label><input id="ep-db-cat-'+i+'" value="'+esc(it.c)+'"></div><div><label>Подкатегория</label><input id="ep-db-subcat-'+i+'" value="'+esc(it.sc||'Разное')+'"></div></div><div class="ep-db-review-2col"><div><label>Цена</label><input id="ep-db-price-'+i+'" type="number" value="'+(Number(it.p)||0)+'"></div><div><label>Единица</label><input id="ep-db-unit-'+i+'" value="'+esc(it.u||'шт')+'"></div></div></div></div>';}).join(''); }
    try{ if(typeof openModal==='function') openModal('ep-db-ai-review-modal'); }catch(e){ var m=$('ep-db-ai-review-modal'); if(m)m.style.display='flex'; }
    setTimeout(hideProgress,200);
  }
  function importPrompt(type, kind){
    return 'Ты профессионально распознаёшь русские прайсы, счета, сметы и таблицы электромонтажных '+(type==='work'?'работ':'материалов')+'. '+
      'Источник: '+kind+'. Извлеки ВСЕ строки с позициями. Верни ТОЛЬКО JSON массив объектов без текста вокруг. '+
      'Формат строго: [{"n":"Имя позиции","c":"Категория","sc":"Подкатегория","p":123,"u":"шт"}]. '+
      'n — полное наименование, не артикул и не номер строки. p — цена за единицу, не итоговая сумма; если цены нет p=0. '+
      'u — единица: шт, м, м.п., упак, компл, кг, л. c/sc определи сам по электрике. Не возвращай пустой массив, если видны позиции.';
  }
  async function aiFromImageFile(file,type,target){
    progress('ИИ-импорт фото',15,'Читаю изображение');
    var dataUrl=await fileToDataURL(file);
    progress('ИИ-импорт фото',35,'Отправляю в ИИ');
    var ans=await window.epAskAI(importPrompt(type,'фото или скрин таблицы'),{imageDataUrl:dataUrl,imageDetail:'high',maxTokens:9000});
    progress('ИИ-импорт фото',85,'Разбираю ответ');
    var items=normalize(parseJsonLoose(ans),type);
    showReview(items,type,file.name||'фото',target,ans);
  }
  async function aiFromPdfFile(file,type,target){
    var maxMb=18;
    if(file.size && file.size > maxMb*1024*1024) throw new Error('PDF слишком большой. Сделай файл до '+maxMb+' МБ или загрузи несколько страниц отдельно.');
    progress('ИИ-импорт PDF',15,'Читаю PDF');
    var dataUrl=await fileToDataURL(file);
    progress('ИИ-импорт PDF',35,'Отправляю PDF в ИИ');
    var ans=await window.epAskAI(importPrompt(type,'PDF прайс/счёт/смета'),{fileDataUrl:dataUrl,fileName:file.name||'import.pdf',mimeType:dataMime(dataUrl)||'application/pdf',maxTokens:12000});
    progress('ИИ-импорт PDF',85,'Разбираю ответ');
    var items=normalize(parseJsonLoose(ans),type);
    showReview(items,type,file.name||'PDF',target,ans);
  }

  var oldReadV9 = window.epReadDbFileV9;
  window.epReadDbFileV9 = async function(file,type,target){
    type = type==='work'?'work':'mat'; target = target || (function(){ try{return localStorage.getItem('ep_db_scope_v2')==='global'&&window.appUser&&appUser.role==='admin'?'global':'my';}catch(e){return 'my';} })();
    try{
      var name=(file&&file.name)||'', lower=name.toLowerCase();
      if(file && file.type && file.type.indexOf('image/')===0) return aiFromImageFile(file,type,target);
      if(/\.pdf$/i.test(lower) || (file&&file.type==='application/pdf')) return aiFromPdfFile(file,type,target);
      if(typeof oldReadV9==='function') return oldReadV9(file,type,target);
      throw new Error('Парсер импорта не найден');
    }catch(e){ hideProgress(); toast('❌ '+(e.message||'Ошибка ИИ-импорта')); console.error('EP V10 AI import error',e); }
  };

  var oldTrigger=window.epTriggerDbFileImport;
  window.epTriggerDbFileImport=function(type){
    var input=$('ep-db-file-input');
    if(input) input.setAttribute('accept','.xlsx,.xls,.csv,.json,.txt,.pdf,image/*');
    if(typeof oldTrigger==='function') return oldTrigger(type);
  };

  function patchLabels(){
    var input=$('ep-db-file-input'); if(input) input.setAttribute('accept','.xlsx,.xls,.csv,.json,.txt,.pdf,image/*');
    Array.prototype.forEach.call(document.querySelectorAll('button'),function(b){
      var t=clean(b.textContent);
      if(t.indexOf('Excel')>=0 && t.indexOf('PDF')<0 && (t.indexOf('Материалы')>=0 || t.indexOf('Работы')>=0)){
        b.innerHTML=b.innerHTML.replace('фото / скрин','фото / PDF / скрин').replace('Excel / JSON','Excel / JSON / PDF');
      }
    });
  }
  document.addEventListener('DOMContentLoaded',function(){ setTimeout(patchLabels,500); setTimeout(patchLabels,1600); });
  document.addEventListener('click',function(){ setTimeout(patchLabels,120); });
})();
