/*
 * Extracted from public/index.html
 * Original script block: 3
 * Original HTML lines: 2095-3541
 */

(function () {
    // === STATE ===
    window.EP_AI_CONFIG = {
        provider: safeGet('ep_ai_provider_v1', 'gemini') || 'gemini',
        geminiKey: '',
        openaiKey: '',
        openaiModel: safeGet('ep_openai_model_v1', 'gpt-4o-mini') || 'gpt-4o-mini'
    };

    window.EP_DB_REVIEW = { type: 'mat', items: [], source: '' };

    function epCleanText(v) {
        return (v || '').toString().replace(/\s+/g, ' ').trim();
    }

    function epMoney(v) {
        const n = Number(String(v || '').replace(',', '.').replace(/[^\d.]/g, ''));
        return Number.isFinite(n) ? n : 0;
    }

    function epEscape(s) {
        return String(s ?? '').replace(/[&<>"']/g, function (m) {
            return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[m];
        });
    }

    function epNormProvider(p) {
        return p === 'openai' ? 'openai' : 'gemini';
    }

    function epCurrentProvider() {
        return epNormProvider(window.EP_AI_CONFIG.provider || safeGet('ep_ai_provider_v1', 'gemini'));
    }

    function epCurrentKey() {
        const p = epCurrentProvider();
        if (p === 'openai') return window.EP_AI_CONFIG.openaiKey || safeGet('ep_openai_key_v1', '');
        return window.EP_AI_CONFIG.geminiKey || (typeof GEMINI_API_KEY !== 'undefined' ? GEMINI_API_KEY : '') || safeGet('gemini_key_v31', '');
    }

    function epSetAiProvider(provider, saveRemote) {
        provider = epNormProvider(provider);
        window.EP_AI_CONFIG.provider = provider;
        safeSet('ep_ai_provider_v1', provider);
        epRefreshProviderUI();

        if (saveRemote && db && appUser && appUser.role === 'admin') {
            epSaveAiConfig(false);
        } else if (saveRemote && appUser && appUser.role !== 'admin') {
            showToast('ИИ-провайдер: ' + (provider === 'openai' ? 'OpenAI' : 'Gemini'));
        }
    }

    window.epSetAiProvider = epSetAiProvider;

    function epRefreshProviderUI() {
        const p = epCurrentProvider();

        document.querySelectorAll('input[name="ep-ai-provider-main"], input[name="ep-ai-provider-admin"]').forEach(function (r) {
            r.checked = (r.value === p);
        });

        document.querySelectorAll('.ep-ai-choice').forEach(function (el) {
            const input = el.querySelector('input');
            el.classList.toggle('active', input && input.value === p);
        });

        const label = p === 'openai' ? 'OpenAI' : 'Gemini';
        const state = document.getElementById('ep-main-ai-state');
        if (state) state.innerText = 'Активный ИИ: ' + label;

        const masterInfo = document.getElementById('ep-ai-master-info');
        if (masterInfo) masterInfo.innerText = 'ИИ подключён администратором: ' + label;
    }

    window.epRefreshProviderUI = epRefreshProviderUI;

    function epInsertMainProviderSwitch() {
        if (document.getElementById('ep-main-ai-switch')) return;

        const header = document.querySelector('#main-app .header');
        if (!header) return;

        const box = document.createElement('div');
        box.id = 'ep-main-ai-switch';
        box.innerHTML = `
            <label class="ep-ai-choice">
                <input type="radio" name="ep-ai-provider-main" value="gemini" onchange="epSetAiProvider('gemini', true)">
                Gemini
            </label>
            <label class="ep-ai-choice">
                <input type="radio" name="ep-ai-provider-main" value="openai" onchange="epSetAiProvider('openai', true)">
                OpenAI
            </label>
            <div id="ep-main-ai-state">Активный ИИ</div>
        `;

        header.parentNode.insertBefore(box, header.nextSibling);
    }

    function epMakeAiMenuGroup() {
        const menu = document.getElementById('burger-menu');
        if (!menu || document.getElementById('ep-ai-functions-group')) return;

        const aiButtons = Array.from(menu.querySelectorAll('button')).filter(function (b) {
            const t = epCleanText(b.textContent);
            return t.includes('ИИ-Анализ') || t.includes('ИИ-Снабженец') || t.includes('ИИ-Помощник') || t.includes('ИИ-Сравнение');
        });

        if (!aiButtons.length) return;

        const wrap = document.createElement('div');
        wrap.id = 'ep-ai-functions-group';
        wrap.innerHTML = `
            <button id="ep-ai-functions-btn" type="button">✨ ИИ Функции <span class="ep-beta-label">(бета)</span></button>
            <div id="ep-ai-functions-panel"></div>
        `;

        aiButtons[0].parentNode.insertBefore(wrap, aiButtons[0]);
        const panel = wrap.querySelector('#ep-ai-functions-panel');

        aiButtons.forEach(function (b) {
            panel.appendChild(b);
        });

        wrap.querySelector('#ep-ai-functions-btn').addEventListener('click', function (e) {
            e.preventDefault();
            e.stopPropagation();
            wrap.classList.toggle('open');
        });
    }

    function epAddBetaLabels() {
        Array.from(document.querySelectorAll('button')).forEach(function (b) {
            const t = epCleanText(b.textContent);
            if (t.includes('Конфигуратор щита') && !t.includes('бета')) {
                b.innerHTML = b.innerHTML.replace('Конфигуратор щита', 'Конфигуратор щита <span class="ep-beta-label">(бета)</span>');
            }
            if (t.includes('Пул розеток') && !t.includes('бета')) {
                b.innerHTML = b.innerHTML.replace(/Пул розеток и\s*В?\S?M|Пул розеток и BIM|Пул розеток и ВІM/iu, 'Пул розеток и BIM <span class="ep-beta-label">(бета)</span>');
            }
        });
    }

    // === SETTINGS / API SYNC ===
    function epPatchSettingsUI() {
        if (document.getElementById('ep-ai-admin-box')) return;

        const oldInput = document.getElementById('api-key-input');
        if (!oldInput) return;

        const h4 = oldInput.previousElementSibling;
        if (h4) h4.style.display = 'none';
        oldInput.style.display = 'none';

        const box = document.createElement('div');
        box.id = 'ep-ai-admin-box';
        box.style.cssText = 'padding:12px; background:rgba(79,70,229,.06); border:1px solid rgba(79,70,229,.25); border-radius:14px; margin-bottom:14px;';
        box.innerHTML = `
            <h4 style="color:var(--primary); margin:0 0 8px;">🤖 ИИ-провайдер</h4>

            <div style="display:grid; grid-template-columns:1fr 1fr; gap:8px; margin-bottom:10px;">
                <label class="ep-ai-choice"><input type="radio" name="ep-ai-provider-admin" value="gemini" onchange="epSetAiProvider('gemini', false)"> Gemini</label>
                <label class="ep-ai-choice"><input type="radio" name="ep-ai-provider-admin" value="openai" onchange="epSetAiProvider('openai', false)"> OpenAI</label>
            </div>

            <div id="ep-ai-admin-keys">
                <label style="font-size:11px; font-weight:800; color:var(--gray);">Gemini API</label>
                <input type="password" id="ep-gemini-key-input" placeholder="AIza..." style="margin-bottom:8px;">

                <label style="font-size:11px; font-weight:800; color:var(--gray);">OpenAI API</label>
                <input type="password" id="ep-openai-key-input" placeholder="sk-..." style="margin-bottom:8px;">

                <label style="font-size:11px; font-weight:800; color:var(--gray);">OpenAI модель</label>
                <input type="text" id="ep-openai-model-input" value="gpt-4o-mini" style="margin-bottom:8px;">

                <button class="btn-primary" style="width:100%; margin-bottom:8px;" onclick="epSaveAiConfig(true)">✅ Проверить и отправить мастерам</button>
                <button class="btn-danger" style="width:100%; background:var(--gray);" onclick="epClearLocalAiKeys()">🧹 Очистить старые локальные ключи</button>
            </div>

            <div id="ep-ai-master-info" style="display:none; font-size:12px; font-weight:900; padding:10px; border-radius:10px; background:rgba(16,185,129,.1); color:var(--success);">
                ИИ подключён администратором
            </div>
        `;

        oldInput.parentNode.insertBefore(box, oldInput.nextSibling);
    }

    window.epClearLocalAiKeys = function () {
        safeSet('gemini_key_v31', '');
        safeSet('ep_openai_key_v1', '');
        safeSet('ep_gemini_key_v1', '');
        if (typeof GEMINI_API_KEY !== 'undefined') GEMINI_API_KEY = '';
        if (document.getElementById('api-key-input')) document.getElementById('api-key-input').value = '';
        if (document.getElementById('ep-gemini-key-input')) document.getElementById('ep-gemini-key-input').value = '';
        if (document.getElementById('ep-openai-key-input')) document.getElementById('ep-openai-key-input').value = '';
        showToast('Старые локальные ключи очищены');
    };

    async function epTestProviderKey(provider, key, model) {
        provider = epNormProvider(provider);
        if (!key) throw new Error('Введите API-ключ');

        if (provider === 'openai') {
            const r = await fetch('https://api.openai.com/v1/responses', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + key },
                body: JSON.stringify({
                    model: model || 'gpt-4o-mini',
                    input: [{ role: 'user', content: [{ type: 'input_text', text: 'Ответь одним словом: ok' }] }],
                    max_output_tokens: 20
                })
            });
            const data = await r.json();
            if (!r.ok || data.error) throw new Error(data.error ? data.error.message : 'OpenAI API error');
            return true;
        }

        const url = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=' + encodeURIComponent(key);
        const r = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ contents: [{ parts: [{ text: 'Ответь одним словом: ok' }] }] })
        });
        const data = await r.json();
        if (!r.ok || data.error) throw new Error(data.error ? data.error.message : 'Gemini API error');
        return true;
    }

    window.epSaveAiConfig = async function (withTest) {
        if (!appUser || appUser.role !== 'admin') {
            showToast('Только админ меняет API');
            return;
        }

        const provider = epCurrentProvider();
        const geminiKey = epCleanText(document.getElementById('ep-gemini-key-input')?.value || window.EP_AI_CONFIG.geminiKey || '');
        const openaiKey = epCleanText(document.getElementById('ep-openai-key-input')?.value || window.EP_AI_CONFIG.openaiKey || '');
        const model = epCleanText(document.getElementById('ep-openai-model-input')?.value || 'gpt-4o-mini');

        const keyToTest = provider === 'openai' ? openaiKey : geminiKey;

        try {
            if (withTest) {
                showLoader('Проверяю API...', '🤖');
                await epTestProviderKey(provider, keyToTest, model);
            }

            window.EP_AI_CONFIG = { provider: provider, geminiKey: geminiKey, openaiKey: openaiKey, openaiModel: model };
            safeSet('ep_ai_provider_v1', provider);
            safeSet('ep_gemini_key_v1', geminiKey);
            safeSet('ep_openai_key_v1', openaiKey);
            safeSet('ep_openai_model_v1', model);

            if (geminiKey && typeof GEMINI_API_KEY !== 'undefined') GEMINI_API_KEY = geminiKey;

            if (db) {
                await db.collection('settings').doc('ai_config').set({
                    provider: provider,
                    geminiKey: geminiKey,
                    openaiKey: openaiKey,
                    openaiModel: model,
                    updatedAt: new Date().toISOString(),
                    updatedBy: appUser.uid || null
                }, { merge: true });

                await db.collection('settings').doc('global_api').set({
                    provider: provider,
                    geminiKey: geminiKey,
                    openaiKey: openaiKey,
                    openaiModel: model,
                    updatedAt: new Date().toISOString()
                }, { merge: true });

                try {
                    const usersSnap = await db.collection('users').get();
                    const batch = db.batch();
                    usersSnap.forEach(function (doc) {
                        batch.set(doc.ref, {
                            aiProvider: provider,
                            geminiKey: geminiKey,
                            openaiKey: openaiKey,
                            openaiModel: model
                        }, { merge: true });
                    });
                    await batch.commit();
                } catch (e) {
                    console.warn('Не удалось разослать по users:', e);
                }
            }

            hideLoader();
            epRefreshProviderUI();
            showToast('✅ API проверен и отправлен мастерам');
        } catch (e) {
            hideLoader();
            showToast('❌ ' + (e.message || 'Ошибка API'));
        }
    };

    window.saveApiKey = async function (val) {
        if (!appUser || appUser.role !== 'admin') {
            showToast('API вводит только админ');
            return;
        }
        epPatchSettingsUI();
        const input = document.getElementById('ep-gemini-key-input');
        if (input) input.value = val || '';
        window.EP_AI_CONFIG.provider = 'gemini';
        epSetAiProvider('gemini', false);
        await epSaveAiConfig(true);
    };

    async function epLoadAiConfigFromServer() {
        try {
            let data = null;

            if (db) {
                const cfgDoc = await db.collection('settings').doc('ai_config').get();
                if (cfgDoc.exists) data = cfgDoc.data();

                if (!data) {
                    const oldDoc = await db.collection('settings').doc('global_api').get();
                    if (oldDoc.exists) data = oldDoc.data();
                }

                if (appUser && appUser.uid) {
                    const userDoc = await db.collection('users').doc(appUser.uid).get();
                    if (userDoc.exists) {
                        const u = userDoc.data();
                        data = Object.assign({}, data || {}, {
                            provider: u.aiProvider || (data && data.provider),
                            geminiKey: u.geminiKey || (data && data.geminiKey),
                            openaiKey: u.openaiKey || (data && data.openaiKey),
                            openaiModel: u.openaiModel || (data && data.openaiModel)
                        });
                    }
                }
            }

            if (data) {
                window.EP_AI_CONFIG.provider = epNormProvider(data.provider || window.EP_AI_CONFIG.provider);
                window.EP_AI_CONFIG.geminiKey = data.geminiKey || data.key || window.EP_AI_CONFIG.geminiKey || '';
                window.EP_AI_CONFIG.openaiKey = data.openaiKey || window.EP_AI_CONFIG.openaiKey || '';
                window.EP_AI_CONFIG.openaiModel = data.openaiModel || window.EP_AI_CONFIG.openaiModel || 'gpt-4o-mini';
            } else {
                window.EP_AI_CONFIG.geminiKey = safeGet('ep_gemini_key_v1', '') || safeGet('gemini_key_v31', '');
                window.EP_AI_CONFIG.openaiKey = safeGet('ep_openai_key_v1', '');
                window.EP_AI_CONFIG.openaiModel = safeGet('ep_openai_model_v1', 'gpt-4o-mini');
            }

            safeSet('ep_ai_provider_v1', window.EP_AI_CONFIG.provider);
            if (window.EP_AI_CONFIG.geminiKey && typeof GEMINI_API_KEY !== 'undefined') GEMINI_API_KEY = window.EP_AI_CONFIG.geminiKey;

            const g = document.getElementById('ep-gemini-key-input');
            const o = document.getElementById('ep-openai-key-input');
            const m = document.getElementById('ep-openai-model-input');
            if (g) g.value = window.EP_AI_CONFIG.geminiKey || '';
            if (o) o.value = window.EP_AI_CONFIG.openaiKey || '';
            if (m) m.value = window.EP_AI_CONFIG.openaiModel || 'gpt-4o-mini';

            const keysBox = document.getElementById('ep-ai-admin-keys');
            const masterInfo = document.getElementById('ep-ai-master-info');
            if (keysBox && masterInfo && appUser) {
                if (appUser.role === 'admin') {
                    keysBox.style.display = 'block';
                    masterInfo.style.display = 'none';
                } else {
                    keysBox.style.display = 'none';
                    masterInfo.style.display = 'block';
                }
            }

            epRefreshProviderUI();
        } catch (e) {
            console.warn('AI config load error:', e);
        }
    }

    // === AI PROVIDER CALLS ===
    async function epCallGemini(promptText, opts) {
        const key = window.EP_AI_CONFIG.geminiKey || (typeof GEMINI_API_KEY !== 'undefined' ? GEMINI_API_KEY : '') || safeGet('gemini_key_v31', '');
        if (!key) throw new Error('Нужен Gemini API ключ');

        const parts = [{ text: promptText }];
        if (opts && opts.imageDataUrl) {
            const match = opts.imageDataUrl.match(/^data:(.*?);base64,(.*)$/);
            if (match) parts.push({ inline_data: { mime_type: match[1], data: match[2] } });
        }

        const url = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=' + encodeURIComponent(key);
        const r = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ contents: [{ parts: parts }] })
        });
        const data = await r.json();
        if (!r.ok || data.error) throw new Error(data.error ? data.error.message : 'Gemini API error');
        return (((data.candidates || [])[0] || {}).content || {}).parts?.map(p => p.text || '').join('') || '';
    }

    function epExtractOpenAiText(data) {
        if (data.output_text) return data.output_text;
        let out = '';
        (data.output || []).forEach(function (item) {
            (item.content || []).forEach(function (c) {
                if (c.text) out += c.text;
                if (c.type === 'output_text' && c.text) out += c.text;
            });
        });
        return out;
    }

    async function epCallOpenAI(promptText, opts) {
        const key = window.EP_AI_CONFIG.openaiKey || safeGet('ep_openai_key_v1', '');
        if (!key) throw new Error('Нужен OpenAI API ключ');

        const content = [{ type: 'input_text', text: promptText }];
        if (opts && opts.imageDataUrl) {
            content.push({
                type: 'input_image',
                image_url: opts.imageDataUrl,
                detail: (opts && opts.imageDetail) ? opts.imageDetail : 'high'
            });
        }

        const body = {
            model: window.EP_AI_CONFIG.openaiModel || 'gpt-4o-mini',
            input: [{ role: 'user', content: content }],
            max_output_tokens: opts && opts.maxTokens ? opts.maxTokens : 5000
        };

        const r = await fetch('https://api.openai.com/v1/responses', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + key },
            body: JSON.stringify(body)
        });
        const data = await r.json();
        if (!r.ok || data.error) throw new Error(data.error ? data.error.message : 'OpenAI API error');
        return epExtractOpenAiText(data);
    }

    async function epAskAI(promptText, opts) {
        await epLoadAiConfigFromServer();
        const provider = epCurrentProvider();
        if (provider === 'openai') return epCallOpenAI(promptText, opts || {});
        return epCallGemini(promptText, opts || {});
    }

    window.epAskAI = epAskAI;

    function epStripCode(t) {
        return (t || '').replace(/```json/gi, '').replace(/```html/gi, '').replace(/```javascript/gi, '').replace(/```js/gi, '').replace(/```[a-z]*/gi, '').replace(/```/g, '').trim();
    }

    function epTryJsonParseLoose(t) {
        if (!t) return null;
        let s = epStripCode(String(t));
        s = s.replace(/[“”]/g, '"').replace(/[‘’]/g, "'");
        s = s.replace(/,\s*([}\]])/g, '$1');
        try { return JSON.parse(s); } catch(e) {}
        const arr = s.match(/\[[\s\S]*\]/);
        if (arr) {
            try { return JSON.parse(arr[0].replace(/,\s*([}\]])/g, '$1')); } catch(e) {}
        }
        const obj = s.match(/\{[\s\S]*\}/);
        if (obj) {
            try { return JSON.parse(obj[0].replace(/,\s*([}\]])/g, '$1')); } catch(e) {}
        }
        return null;
    }

    function epParseLooseTableText(t, type) {
        const lines = epStripCode(t).split(/\r?\n/).map(x => x.trim()).filter(Boolean);
        const out = [];
        lines.forEach(function(line) {
            if (/^(№|номер|код|артикул|итого|сумма|json|категория)/i.test(line)) return;
            let s = line.replace(/[|;]/g, '\t').replace(/\s{2,}/g, '\t');
            const parts = s.split(/\t+/).map(x => x.trim()).filter(Boolean);
            const unitIdx = parts.findIndex(x => /^(шт|м|м2|м²|м3|м³|упак|уп|компл|кг|л)$/i.test(x));
            if (unitIdx > 0) {
                let nameParts = parts.slice(0, unitIdx).filter(x => !/^\d+$/.test(x) && !/^[A-ZА-Я0-9\-.]{3,15}$/i.test(x));
                let name = nameParts.join(' ').trim();
                let nums = parts.slice(unitIdx + 1).map(epMoney).filter(n => n > 0);
                let p = nums.length ? nums[0] : 0;
                if (name.length > 3) out.push({ c: epInferCategory(name, type), n: name, p: p, u: parts[unitIdx] });
            } else {
                const nums = line.match(/\d+[\d\s]*[,.]?\d*/g) || [];
                if (nums.length && line.length > 8) {
                    let p = epMoney(nums[nums.length - 1]);
                    let name = line.replace(/^[\d\s.№-]+/, '').replace(/\d+[\d\s]*[,.]?\d*\s*$/, '').trim();
                    if (name.length > 4) out.push({ c: epInferCategory(name, type), n: name, p: p, u: 'шт' });
                }
            }
        });
        return out;
    }
    function epExtractJsonObjectsLoose(t) {
        const s = epStripCode(String(t || '')).replace(/[“”]/g, '"').replace(/[‘’]/g, "'");
        const out = [];
        let depth = 0, start = -1, inStr = null, esc = false;

        for (let i = 0; i < s.length; i++) {
            const ch = s[i];
            if (inStr) {
                if (esc) esc = false;
                else if (ch === '\\') esc = true;
                else if (ch === inStr) inStr = null;
                continue;
            }
            if (ch === '"' || ch === "'") { inStr = ch; continue; }
            if (ch === '{') {
                if (depth === 0) start = i;
                depth++;
            } else if (ch === '}') {
                depth--;
                if (depth === 0 && start >= 0) {
                    const piece = s.slice(start, i + 1).replace(/,\s*([}\]])/g, '$1');
                    try { out.push(JSON.parse(piece)); } catch(e) {}
                    start = -1;
                }
            }
        }
        return out;
    }

    function epParseJsonArray(t) {
        const parsed = epTryJsonParseLoose(t);
        if (Array.isArray(parsed)) return parsed;
        if (parsed && typeof parsed === 'object') {
            const keys = ['items', 'positions', 'rows', 'data', 'result', 'materials', 'works', 'материалы', 'работы', 'позиции'];
            for (const k of keys) {
                if (Array.isArray(parsed[k])) return parsed[k];
            }
        }

        // Бывает, ИИ возвращает не массив, а цепочку объектов:
        // {"n":"..."},{"n":"..."},{"n":"..."}
        const objects = epExtractJsonObjectsLoose(t);
        if (objects.length) return objects;

        return epParseLooseTableText(t, 'mat');
    }

    // Override AI functions
    window.runAiCheck = async function () {
        showLoader('ИИ анализирует...', '🤖');
        try {
            const estNames = currentEstimate.map(i => i.n).join(', ');
            const promptText = 'Я электрик. Смета: ' + estNames + '. Найди логические ошибки: крепеж, рамки, УЗО, автоматы, коробки, расходники. Верни ТОЛЬКО JSON массив: [{"reason":"объяснение","suggestedName":"название"}]. Если всё идеально, верни [].';
            const txt = await epAskAI(promptText, { maxTokens: 2500 });
            const suggestions = epParseJsonArray(txt);
            hideLoader();

            if (!suggestions.length) return showToast('✨ Всё идеально! Смета полная.');

            document.getElementById('ai-modal-title').innerText = '✨ ИИ-Аналитика';
            document.getElementById('ai-suggestions').innerHTML = suggestions.map(function (s) {
                return `<div style="background:var(--bg); padding:12px; border-radius:10px; margin-bottom:10px; border-left:4px solid var(--ai);">
                    <div style="font-weight:800;">${epEscape(s.reason || '')}</div>
                    <div style="font-size:12px; color:var(--gray); margin-top:5px;">Совет: ${epEscape(s.suggestedName || '')}</div>
                </div>`;
            }).join('');
            openModal('aiModal');
        } catch (e) {
            hideLoader();
            showToast('❌ ' + (e.message || 'Сбой ИИ'));
        }
    };

    window.aiSupply = async function () {
        showLoader('ИИ формирует закупку...', '🤖');
        try {
            const mats = currentEstimate.filter(i => i.type === 'mat').map(i => `${i.n} - ${i.q} ${i.u || ''}`).join(', ');
            const txt = await epAskAI('Смета материалов: ' + mats + '. Раздели на категории для закупки. Верни чистый HTML: <h3>, <ul>, <li>, <b>.', { maxTokens: 2500 });
            hideLoader();
            document.getElementById('ai-modal-title').innerText = '📦 ИИ-Снабженец';
            document.getElementById('ai-suggestions').innerHTML = `<div style="font-size:13px; line-height:1.5;">${epStripCode(txt)}</div>`;
            openModal('aiModal');
        } catch(e) { hideLoader(); showToast('❌ ' + (e.message || 'Сбой ИИ')); }
    };

    window.aiPueHelper = async function () {
        showLoader('ИИ думает...', '🤖');
        try {
            const txt = await epAskAI('Смета: ' + currentEstimate.map(i => i.n).join(', ') + '. Какие нормы ПУЭ и практические замечания нужны? Кратко в HTML.', { maxTokens: 2500 });
            hideLoader();
            document.getElementById('ai-modal-title').innerText = '📚 ПУЭ Справка';
            document.getElementById('ai-suggestions').innerHTML = `<div style="font-size:13px; line-height:1.5;">${epStripCode(txt)}</div>`;
            openModal('aiModal');
        } catch(e) { hideLoader(); showToast('❌ ' + (e.message || 'Сбой ИИ')); }
    };

    window.compareShopsAI = async function () {
        showLoader('Сравнение цен...', '🤖');
        try {
            let shops = document.getElementById('ai-shops')?.value || 'Лемана ПРО, Петрович, ВсеИнструменты';
            const txt = await epAskAI('Материалы: ' + currentEstimate.filter(i=>i.type==='mat').map(i=>i.n).join(', ') + '. Создай HTML таблицу с максимальными розничными ценами ГОСТ в магазинах: ' + shops + '. Верни только HTML.', { maxTokens: 3000 });
            hideLoader();
            document.getElementById('ai-modal-title').innerText = '🛒 Макс. Цены ГОСТ';
            document.getElementById('ai-suggestions').innerHTML = `<div style="overflow-x:auto;">${epStripCode(txt)}</div>`;
            openModal('aiModal');
        } catch(e) { hideLoader(); showToast('❌ ' + (e.message || 'Сбой ИИ')); }
    };

    // === DATABASE IMPORT / EXPORT / SERVER ===
    function epDbTypeLabel(type) { return type === 'work' ? 'работ' : 'материалов'; }
    function epCurrentDb(type) { return type === 'work' ? workDB : matDB; }
    function epSetCurrentDb(type, arr) { if (type === 'work') workDB = arr; else matDB = arr; }

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

    function epNormalizeItems(raw, type) {
        let arr = [];
        if (Array.isArray(raw)) arr = raw;
        else if (raw && typeof raw === 'object') {
            arr = raw.items || raw.positions || raw.rows || raw.data || raw.result || raw.materials || raw.works || raw['позиции'] || raw['материалы'] || raw['работы'] || [];
        }
        return arr.map(function (x, i) {
            if (Array.isArray(x)) {
                x = { n: x[1] || x[0], c: x[0], sc: x[2], p: x[3], u: x[4] };
            }

            const name = epCleanText(
                x.n || x.name || x.title || x.item || x.position || x.material || x.work || x.itemName ||
                x['Имя'] || x['Название'] || x['Наименование'] || x['Наименование позиции'] || x['Товар'] || x['Материал'] || x['Работа'] ||
                x['номенклатура'] || x['наименование'] || x['позиция'] || ''
            );

            const cat = epCleanText(
                x.c || x.cat || x.category || x.group ||
                x['Категория'] || x['Группа'] || x['категория'] || ''
            ) || epInferCategory(name, type);

            const subcat = epCleanText(
                x.sc || x.subcat || x.subcategory || x.subCategory || x.sub_group || x.section ||
                x['Подкатегория'] || x['Подраздел'] || x['Раздел'] || x['подкатегория'] || x['подраздел'] || ''
            ) || epInferSubcategory(name, cat, type);

            const unit = epCleanText(
                x.u || x.unit || x.measure || x.measurement ||
                x['Ед'] || x['Ед.'] || x['Ед. изм'] || x['Ед.изм.'] || x['Единица'] || x['Единица измерения'] || x['единица'] || x['ед'] || 'шт'
            ) || 'шт';

            const priceRaw = x.p || x.price || x.cost || x.unitPrice || x.unit_price ||
                x['Цена'] || x['Цена ₽'] || x['Цена руб'] || x['Цена за ед.'] || x['Цена за единицу'] || x['Стоимость'] || x['цена'] || 0;

            return {
                id: x.id || (type === 'work' ? 'w' : 'm') + '_ai_' + Date.now() + '_' + i,
                n: name,
                c: cat || 'Разное',
                sc: subcat || 'Разное',
                p: epMoney(priceRaw),
                u: unit
            };
        }).filter(function (x) { return x.n && x.n.length > 2; });
    }

    async function epSaveUserDb() {
        try {
            safeSet('user_db_mat_v31', JSON.stringify(matDB));
            safeSet('user_db_work_v31', JSON.stringify(workDB));
            if (db && appUser && appUser.uid) {
                await db.collection('user_db').doc(appUser.uid).set({
                    uid: appUser.uid,
                    name: appUser.name || appUser.email || '',
                    matDB: matDB,
                    workDB: workDB,
                    updatedAt: new Date().toISOString()
                }, { merge: true });
            }
        } catch (e) {
            console.warn('save user db error', e);
        }
    }

    async function epSaveGlobalDb() {
        if (!db) return;
        await db.collection('settings').doc('global_db').set({ matDB: matDB, workDB: workDB, updatedAt: new Date().toISOString() }, { merge: true });
    }

    async function epLoadUserDbAfterLogin() {
        try {
            if (!appUser || !appUser.uid) return;
            let loaded = false;

            if (db) {
                const doc = await db.collection('user_db').doc(appUser.uid).get();
                if (doc.exists) {
                    const d = doc.data();
                    if (Array.isArray(d.matDB)) { matDB = d.matDB; loaded = true; }
                    if (Array.isArray(d.workDB)) { workDB = d.workDB; loaded = true; }
                }
            }

            if (!loaded) {
                try {
                    const lm = JSON.parse(safeGet('user_db_mat_v31', '[]'));
                    const lw = JSON.parse(safeGet('user_db_work_v31', '[]'));
                    if (lm.length) matDB = lm;
                    if (lw.length) workDB = lw;
                } catch(e){}
            }

            renderDbEditors();
        } catch(e) {
            console.warn('load user db error', e);
        }
    }

    function epInsertDbTools() {
        if (document.getElementById('ep-db-ai-tools')) return;
        const tabs = document.querySelector('#settModal .tabs-container');
        if (!tabs) return;

        const box = document.createElement('div');
        box.id = 'ep-db-ai-tools';
        box.innerHTML = `
            <h3>🤖 Импорт / экспорт базы через ИИ</h3>
            <div class="ep-db-ai-grid">
                <button class="btn-info" onclick="epTriggerDbFileImport('mat')">📥 Материалы: Excel / JSON / фото / скрин</button>
                <button class="btn-work" onclick="epTriggerDbFileImport('work')">📥 Работы: Excel / JSON / фото / скрин</button>
                <button class="btn-vendor" onclick="epOpenTextImport('mat')">📝 Материалы из текста</button>
                <button class="btn-vendor" onclick="epOpenTextImport('work')">📝 Работы из текста</button>
                <button class="btn-success" onclick="epExportMyDb()">📤 Экспорт моей базы</button>
                <button class="btn-shield" onclick="epExportGlobalDb()">🌍 Экспорт базы сервера</button>
            </div>
        `;
        tabs.parentNode.insertBefore(box, tabs);
    }

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

    window.epOpenTextImport = function (type) {
        window.EP_DB_REVIEW.type = type;
        document.getElementById('ep-text-import-title').innerText = 'Импорт ' + epDbTypeLabel(type) + ' из текста';
        document.getElementById('ep-text-import-value').value = '';
        openModal('ep-text-import-modal');
    };

    window.epRunTextImport = async function () {
        const text = document.getElementById('ep-text-import-value').value;
        closeModal('ep-text-import-modal');
        await epAiNormalizeDbText(text, window.EP_DB_REVIEW.type, 'текст');
    };

    function epReadFileAsText(file) {
        return new Promise(function (resolve, reject) {
            const r = new FileReader();
            r.onload = function () { resolve(r.result); };
            r.onerror = reject;
            r.readAsText(file);
        });
    }

    function epReadFileAsDataURL(file) {
        return new Promise(function (resolve, reject) {
            const r = new FileReader();
            r.onload = function () { resolve(r.result); };
            r.onerror = reject;
            r.readAsDataURL(file);
        });
    }

    function epReadFileAsArrayBuffer(file) {
        return new Promise(function (resolve, reject) {
            const r = new FileReader();
            r.onload = function () { resolve(r.result); };
            r.onerror = reject;
            r.readAsArrayBuffer(file);
        });
    }



    function epIsEmptyCell(v) {
        return v === null || v === undefined || String(v).trim() === '';
    }

    function epCleanCell(v) {
        return epCleanText(String(v === null || v === undefined ? '' : v).replace(/\u00a0/g, ' '));
    }

    function epIsUnitCell(v) {
        const s = epCleanCell(v).toLowerCase().replace(/\./g, '');
        return /^(шт|штук|м|мп|м\/п|м2|м²|м3|м³|упак|уп|компл|комплект|час|точка|линия|кг|л)$/i.test(s);
    }

    function epNormalizeUnit(v) {
        const s = epCleanCell(v).toLowerCase().replace(/\./g, '');
        if (!s) return 'шт';
        if (s === 'мп' || s === 'м/п') return 'м';
        if (s === 'штук') return 'шт';
        if (s === 'комплект') return 'компл';
        return s;
    }

    function epIsNumberLikeCell(v) {
        if (typeof v === 'number') return true;
        const s = epCleanCell(v);
        if (!s) return false;
        return /^\d+[\d\s]*([,.]\d+)?$/.test(s);
    }

    function epLooksLikeCodeOrNumber(v) {
        const s = epCleanCell(v);
        if (!s) return true;
        if (/^№$/i.test(s)) return true;
        if (/^\d+[.)]?$/.test(s)) return true;
        if (/^\d+(\.\d+)+$/.test(s)) return true;
        if (/^[A-ZА-Я0-9\-_.\/]{2,18}$/i.test(s) && !/[а-яё]{4,}/i.test(s)) return true;
        return false;
    }

    function epTitleCaseRu(s) {
        s = epCleanCell(s).replace(/:+$/, '').trim();
        if (!s) return '';
        return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
    }

    function epExtractItemsFromSheetRows(rows, type) {
        const out = [];
        let currentCat = type === 'work' ? 'Работы' : 'Разное';
        let currentSubcat = 'Разное';

        (rows || []).forEach(function(row) {
            const cells = (Array.isArray(row) ? row : Object.values(row || {})).map(epCleanCell);
            const nonEmpty = cells.filter(x => x);
            if (!nonEmpty.length) return;

            const rowText = nonEmpty.join(' ');
            if (/^(№|номер|код|артикул)$/i.test(rowText)) return;
            if (/наименование/i.test(rowText) && /(ед|цена|стоимость)/i.test(rowText)) return;

            const unitIdx = cells.findIndex(epIsUnitCell);
            const numIdxs = cells.map((v, i) => epIsNumberLikeCell(v) ? i : -1).filter(i => i >= 0);
            const priceIdxs = numIdxs.filter(i => unitIdx < 0 || i > unitIdx);
            const priceIdx = priceIdxs.length ? priceIdxs[0] : (numIdxs.length ? numIdxs[numIdxs.length - 1] : -1);
            const hasPrice = priceIdx >= 0 && epMoney(cells[priceIdx]) > 0;
            const hasUnit = unitIdx >= 0;

            // Строка-раздел без цены и единицы
            if (!hasPrice && !hasUnit) {
                let title = nonEmpty.find(x => !/^\d+(\.\d+)*\.?$/.test(x)) || rowText;
                title = epTitleCaseRu(title);
                if (!title || title.length < 3) return;

                const first = nonEmpty[0] || '';
                if (/^\d+\.$/.test(first) || /работ/i.test(title) || title === title.toUpperCase()) {
                    currentCat = title;
                    currentSubcat = 'Разное';
                } else if (/^\d+\.\d+/.test(first) || /:$/.test(rowText) || nonEmpty.length <= 2) {
                    currentSubcat = title;
                } else if (type === 'work') {
                    currentSubcat = title;
                } else {
                    currentCat = title;
                }
                return;
            }

            let nameCandidates = cells.map((v, i) => ({ v, i }))
                .filter(x => x.v)
                .filter(x => x.i !== unitIdx && x.i !== priceIdx)
                .filter(x => !epIsNumberLikeCell(x.v))
                .filter(x => !epLooksLikeCodeOrNumber(x.v))
                .filter(x => !/^(ед|ед изм|цена|сумма|стоимость|кол-во|количество)$/i.test(x.v));

            if (!nameCandidates.length) return;
            nameCandidates.sort((a, b) => b.v.length - a.v.length);
            const name = epCleanText(nameCandidates[0].v);
            if (!name || name.length < 4) return;

            const cat = currentCat && currentCat !== 'Разное' ? currentCat : epInferCategory(name, type);
            const subcat = currentSubcat && currentSubcat !== 'Разное' ? currentSubcat : epInferSubcategory(name, cat, type);
            const unit = hasUnit ? epNormalizeUnit(cells[unitIdx]) : 'шт';
            const price = hasPrice ? epMoney(cells[priceIdx]) : 0;

            out.push({
                id: (type === 'work' ? 'w' : 'm') + '_sheet_' + Date.now() + '_' + out.length,
                n: name,
                c: cat || (type === 'work' ? 'Работы' : 'Разное'),
                sc: subcat || 'Разное',
                p: price,
                u: unit
            });
        });

        return out;
    }
    async function epReadDbFile(file, type) {
        showLoader('Читаю файл...', '📥');
        try {
            const name = file.name || '';
            const lower = name.toLowerCase();

            if (file.type.startsWith('image/')) {
                const imageDataUrl = await epReadFileAsDataURL(file);
                await epAiNormalizeImage(imageDataUrl, type, name);
                return;
            }

            if (lower.endsWith('.json')) {
                const txt = await epReadFileAsText(file);
                let raw = JSON.parse(txt);
                if (raw.matDB && type === 'mat') raw = raw.matDB;
                if (raw.workDB && type === 'work') raw = raw.workDB;
                epShowDbReview(epNormalizeItems(raw, type), type, name);
                return;
            }
            if (lower.endsWith('.xlsx') || lower.endsWith('.xls') || lower.endsWith('.csv')) {
                let rows = [];
                if (window.XLSX) {
                    const ab = await epReadFileAsArrayBuffer(file);
                    const wb = XLSX.read(ab, { type: 'array' });
                    const ws = wb.Sheets[wb.SheetNames[0]];
                    rows = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '' });
                } else {
                    const txt = await epReadFileAsText(file);
                    rows = txt.split(/\r?\n/).map(function(line) {
                        return line.split(';').length > line.split(',').length ? line.split(';') : line.split(',');
                    });
                }

                // Сначала разбираем Excel/CSV локально, построчно: каждая строка = отдельная позиция.
                // ИИ нужен только как запасной вариант, если таблица слишком кривая.
                const localItems = epExtractItemsFromSheetRows(rows, type);
                if (localItems.length) {
                    hideLoader();
                    epShowDbReview(localItems, type, name);
                    return;
                }

                await epAiNormalizeDbText(JSON.stringify(rows).slice(0, 90000), type, name);
                return;
            }

            const txt = await epReadFileAsText(file);
            await epAiNormalizeDbText(txt, type, name);
        } catch (e) {
            hideLoader();
            showToast('❌ ' + (e.message || 'Ошибка импорта'));
        }
    }

    async function epAiNormalizeImage(imageDataUrl, type, source) {
        showLoader('ИИ читает таблицу с изображения...', '👁️');
        let rawAnswer = '';
        try {
            const prompt = `Ты профессионально распознаёшь русские сметы, счета и прайсы электромонтажных материалов.
На изображении таблица. Нужно извлечь ВСЕ видимые строки с позициями для базы ${epDbTypeLabel(type)}.

Правила:
1. Читай каждую строку таблицы, даже если качество среднее.
2. Не возвращай пустой массив, если видны строки с товарами/работами.
3. Для имени n бери колонку с наименованием/описанием, НЕ артикул и НЕ номер строки.
4. c — главная категория: Кабель, Трубы, Расходники, Автоматика, Слаботочка, Чистовое, Работы, Щит, Разное.
5. sc — подкатегория. Определи точнее: ВВГ, ПУГВ, SAT/TV, UTP/FTP, Подрозетники, Крепёж, Клеммники, Коробки, Щиты, Автоматы, УЗО, Дифавтоматы, Розетки, Выключатели и т.д.
6. p — цена за единицу. Если есть две суммы, бери меньшую как цену за единицу, большую не бери как цену.
7. u — единица измерения: шт, м, упак, компл, кг, л и т.д.
8. Если цену не видно — p=0. Если единицу не видно — u="шт". Если подкатегорию не понял — sc="Разное".
9. Верни СТРОГО JSON-массив без текста вокруг.

Формат строго такой:
[
  {"n":"ВВГ-Пнг(A)-LS ГОСТ Конкорд 3x1,5","c":"Кабель","sc":"ВВГ","p":58.43,"u":"м"},
  {"n":"Подрозетник бетон 68x60","c":"Расходники","sc":"Подрозетники","p":12,"u":"шт"}
]`;

            rawAnswer = await epAskAI(prompt, { imageDataUrl: imageDataUrl, imageDetail: 'high', maxTokens: 9000 });
            let parsed = epParseJsonArray(rawAnswer);
            let items = epNormalizeItems(parsed, type);

            if (!items.length) {
                const retryPrompt = `Ты ответил без позиций. Посмотри изображение ещё раз. Там таблица со строками, например кабели, подрозетники, клеммники, автоматы, расходники. Извлеки хотя бы 10-30 видимых строк. Верни только JSON массив [{"n":"Имя позиции","c":"Категория","sc":"Подкатегория","p":0,"u":"шт"}]. Не объясняй.`;
                rawAnswer = await epAskAI(retryPrompt, { imageDataUrl: imageDataUrl, imageDetail: 'high', maxTokens: 9000 });
                parsed = epParseJsonArray(rawAnswer);
                items = epNormalizeItems(parsed, type);
            }

            hideLoader();
            epShowDbReview(items, type, source, rawAnswer);
        } catch (e) {
            hideLoader();
            showToast('❌ ' + (e.message || 'ИИ не прочитал изображение'));
        }
    }

    async function epAiNormalizeDbText(rawText, type, source) {
        showLoader('ИИ структурирует базу...', '🤖');
        let rawAnswer = '';
        try {
            const prompt = 'Ты помощник электрика. Приведи данные к базе ' + epDbTypeLabel(type) + '. Верни ТОЛЬКО JSON массив объектов: [{"n":"Имя позиции","c":"Категория","sc":"Подкатегория","p":123,"u":"шт"}]. n — имя/наименование позиции. c — главная категория. sc — подкатегория. p — цена за единицу, не итоговая сумма. u — единица измерения. Если цены нет, p=0. Если категории нет, определи сам: Кабель, Трубы, Расходники, Автоматика, Слаботочка, Чистовое, Работы, Щит, Разное. Если подкатегории нет, определи сам или поставь "Разное". Не возвращай пустой массив, если в данных есть строки с позициями. Данные: ' + String(rawText).slice(0, 90000);
            rawAnswer = await epAskAI(prompt, { maxTokens: 8000 });
            const items = epNormalizeItems(epParseJsonArray(rawAnswer), type);
            hideLoader();
            epShowDbReview(items, type, source, rawAnswer);
        } catch (e) {
            hideLoader();
            showToast('❌ ' + (e.message || 'ИИ не обработал данные'));
        }
    }

    window.epReviewCheckAll = function (checked) {
        document.querySelectorAll('#ep-db-ai-review-list input[type="checkbox"]').forEach(function (cb) {
            cb.checked = !!checked;
        });
    };

    function epShowDbReview(items, type, source, rawAnswer) {
        window.EP_DB_REVIEW = { type: type, items: items, source: source || '' };
        document.getElementById('ep-db-ai-review-title').innerText = 'Импорт ' + epDbTypeLabel(type) + ': ' + (source || '');
        const list = document.getElementById('ep-db-ai-review-list');

        if (!items.length) {
            list.innerHTML = `<div style="padding:12px; color:var(--danger); font-weight:800;">ИИ не нашёл позиции. Попробуйте другой файл, текст или сделайте скрин крупнее.</div><details style="margin-top:10px; font-size:11px; color:var(--gray);"><summary>Показать ответ ИИ</summary><pre style="white-space:pre-wrap; max-height:220px; overflow:auto;">${epEscape(rawAnswer || '')}</pre></details>`;
        } else {
            list.innerHTML = items.map(function (it, idx) {
                return `<div class="ep-db-review-row">
                    <input type="checkbox" id="ep-db-check-${idx}" checked>
                    <div class="ep-db-review-fields">
                        <div><label>Имя</label><input id="ep-db-name-${idx}" value="${epEscape(it.n)}" placeholder="Имя / наименование"></div>
                        <div class="ep-db-review-2col">
                            <div><label>Категория</label><input id="ep-db-cat-${idx}" value="${epEscape(it.c)}" placeholder="Категория"></div>
                            <div><label class="ep-db-subcat-label">Подкатегория</label><input id="ep-db-subcat-${idx}" value="${epEscape(it.sc || 'Разное')}" placeholder="Подкатегория"></div>
                        </div>
                        <div class="ep-db-review-2col">
                            <div><label>Цена за единицу</label><input id="ep-db-price-${idx}" type="number" step="0.01" value="${Number(it.p)||0}" placeholder="Цена"></div>
                            <div><label>Единица</label><input id="ep-db-unit-${idx}" value="${epEscape(it.u || 'шт')}" placeholder="шт / м / упак"></div>
                        </div>
                    </div>
                </div>`;
            }).join('');
        }

        openModal('ep-db-ai-review-modal');
    }

    function epGetReviewedSelected() {
        const items = window.EP_DB_REVIEW.items || [];
        return items.map(function (it, idx) {
            const checked = document.getElementById('ep-db-check-' + idx)?.checked;
            if (!checked) return null;
            return {
                id: it.id || (window.EP_DB_REVIEW.type === 'work' ? 'w' : 'm') + '_ai_' + Date.now() + '_' + idx,
                c: epCleanText(document.getElementById('ep-db-cat-' + idx)?.value) || 'Разное',
                sc: epCleanText(document.getElementById('ep-db-subcat-' + idx)?.value) || 'Разное',
                n: epCleanText(document.getElementById('ep-db-name-' + idx)?.value),
                p: epMoney(document.getElementById('ep-db-price-' + idx)?.value),
                u: epCleanText(document.getElementById('ep-db-unit-' + idx)?.value) || 'шт'
            };
        }).filter(Boolean).filter(function (x) { return x.n; });
    }

    function epSameItem(a, b) {
        return epCleanText(a.n).toLowerCase() === epCleanText(b.n).toLowerCase()
            && epCleanText(a.c).toLowerCase() === epCleanText(b.c).toLowerCase()
            && (!a.sc || !b.sc || epCleanText(a.sc).toLowerCase() === epCleanText(b.sc).toLowerCase());
    }

    async function epSendDbProposal(type, items, action) {
        if (!db || !appUser || appUser.role === 'admin' || !items.length) return;
        try {
            await db.collection('db_proposals').add({
                uid: appUser.uid || '',
                masterName: appUser.name || appUser.email || '',
                type: type,
                action: action,
                items: items,
                status: 'pending',
                createdAt: new Date().toISOString()
            });
        } catch(e) {
            console.warn('proposal error', e);
        }
    }

    window.epApplyReviewedDbItems = async function (mode) {
        const type = window.EP_DB_REVIEW.type;
        const items = epGetReviewedSelected();
        if (!items.length) return showToast('Нет выбранных позиций');

        let arr = epCurrentDb(type).slice();

        items.forEach(function (it) {
            const idx = arr.findIndex(x => epSameItem(x, it));
            if (mode === 'replace' && idx >= 0) {
                arr[idx] = Object.assign({}, arr[idx], it, { id: arr[idx].id || it.id });
            } else if (idx < 0) {
                arr.push(it);
            } else if (mode === 'add') {
                arr.push(Object.assign({}, it, { id: it.id + '_' + Math.random().toString(36).slice(2, 6) }));
            }
        });

        epSetCurrentDb(type, arr);

        if (appUser && appUser.role === 'admin') {
            try { await epSaveGlobalDb(); } catch(e) { console.warn(e); }
        }

        await epSaveUserDb();
        await epSendDbProposal(type, items, mode);

        renderDbEditors();
        closeModal('ep-db-ai-review-modal');
        showToast('✅ База обновлена' + (appUser && appUser.role !== 'admin' ? ' и отправлена админу' : ''));
    };

    function epDownloadJson(filename, data) {
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url; a.download = filename;
        document.body.appendChild(a); a.click(); a.remove();
        setTimeout(function(){ URL.revokeObjectURL(url); }, 1000);
    }

    window.epExportMyDb = function () {
        epDownloadJson('electric-pro-my-db.json', {
            owner: appUser ? { uid: appUser.uid, name: appUser.name || appUser.email || '' } : null,
            matDB: matDB,
            workDB: workDB,
            exportedAt: new Date().toISOString()
        });
    };

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

    // Override renderDbEditors with delete buttons
    const epOldRenderDbEditors = window.renderDbEditors;
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

    window.epDeleteDbItem = async function (type, id) {
        const isAdmin = appUser && appUser.role === 'admin';
        let mode = 'mine';

        if (isAdmin) {
            mode = await new Promise(function (resolve) {
                const all = confirm('Админ: нажмите OK = удалить у всех. Отмена = удалить только у меня.');
                resolve(all ? 'all' : 'mine');
            });
        } else {
            const ok = confirm('Удалить позицию только у себя?');
            if (!ok) return;
        }

        let arr = epCurrentDb(type).filter(x => x.id !== id);
        epSetCurrentDb(type, arr);

        await epSaveUserDb();

        if (isAdmin && mode === 'all') {
            try { await epSaveGlobalDb(); } catch(e) { console.warn(e); }
        }

        renderDbEditors();
        showToast(isAdmin && mode === 'all' ? 'Удалено у всех' : 'Удалено у меня');
    };

    window.addDbItem = async function () {
        let cat = document.getElementById('db-new-cat').value.trim() || 'Разное';
        let name = document.getElementById('db-new-name').value.trim();
        let price = Number(document.getElementById('db-new-price').value) || 0;
        let unit = document.getElementById('db-new-unit').value.trim() || 'шт';
        let isMat = document.getElementById('editor-mat-list').style.display !== 'none';

        if(!name) return showToast('Введите название!');

        const type = isMat ? 'mat' : 'work';
        let newItem = { id: (isMat?'m':'w') + Date.now(), c: cat, n: name, p: price, u: unit };
        let arr = epCurrentDb(type).slice();
        arr.push(newItem);
        epSetCurrentDb(type, arr);

        if (appUser && appUser.role === 'admin') {
            try { await epSaveGlobalDb(); } catch(e) {}
        } else {
            await epSendDbProposal(type, [newItem], 'manual_add');
        }

        await epSaveUserDb();
        renderDbEditors();
        document.getElementById('db-new-name').value = '';
        document.getElementById('db-new-price').value = '';
        showToast(appUser && appUser.role === 'admin' ? '✅ Позиция добавлена в базу сервера' : '✅ Добавлено у вас и отправлено админу');
    };

    window.requestPriceChange = async function (type, id, newPrice) {
        newPrice = Number(newPrice) || 0;
        let arr = epCurrentDb(type);
        let item = arr.find(x => x.id === id);
        if (!item) return;
        item.p = newPrice;

        if (appUser && appUser.role === 'admin') {
            try { await epSaveGlobalDb(); } catch(e){}
            showToast('✅ Цена изменена в базе сервера');
        } else {
            await epSaveUserDb();
            await epSendDbProposal(type, [item], 'price_change');
            showToast('✅ Цена изменена у вас и отправлена админу');
        }
    };

    // Admin proposals
    function epInsertAdminProposalBox() {
        if (document.getElementById('admin-db-proposals')) return;
        const panel = document.getElementById('admin-panel');
        if (!panel) return;
        const box = document.createElement('div');
        box.innerHTML = `
            <h4 style="color:var(--primary); margin: 10px 0 5px;">🌍 Заявки в базу сервера:</h4>
            <div id="admin-db-proposals" style="margin-bottom:10px; border:1px solid var(--primary); background:rgba(79,70,229,.05); border-radius:8px; padding:8px; max-height:240px; overflow-y:auto; font-size:12px;"></div>
        `;
        panel.insertBefore(box, panel.firstChild.nextSibling);
    }

    function epListenDbProposals() {
        if (!db || !appUser || appUser.role !== 'admin') return;
        epInsertAdminProposalBox();
        const cont = document.getElementById('admin-db-proposals');
        if (!cont || cont.dataset.listen === '1') return;
        cont.dataset.listen = '1';

        db.collection('db_proposals').where('status', '==', 'pending').onSnapshot(function (snap) {
            if (snap.empty) {
                cont.innerHTML = `<span style="color:var(--gray);">Новых заявок нет</span>`;
                return;
            }
            cont.innerHTML = '';
            snap.forEach(function (doc) {
                const d = doc.data();
                const items = d.items || [];
                cont.innerHTML += `<div class="ep-db-admin-proposal">
                    <b>${epEscape(d.masterName || d.uid || 'Мастер')}</b>
                    <div style="color:var(--gray); font-size:11px;">${d.type === 'work' ? 'Работы' : 'Материалы'} • ${epEscape(d.action || '')} • ${items.length} поз.</div>
                    <div style="font-size:11px; margin-top:5px;">${items.slice(0,3).map(x => epEscape(x.n) + (x.sc ? ' <span style="color:var(--gray);">[' + epEscape(x.sc) + ']</span>' : '')).join('<br>')}${items.length > 3 ? '<br>...' : ''}</div>
                    <div class="ep-mini-actions">
                        <button class="btn-success" onclick="epAdminResolveDbProposal('${doc.id}','full')">✅ Добавить полностью</button>
                        <button class="btn-primary" onclick="epAdminResolveDbProposal('${doc.id}','names')">🏷 Только название без суммы</button>
                        <button class="btn-danger" onclick="epAdminResolveDbProposal('${doc.id}','reject')">❌ Отклонить</button>
                    </div>
                </div>`;
            });
        }, function (e) {
            cont.innerHTML = `<span style="color:var(--danger);">Ошибка заявок: ${epEscape(e.message)}</span>`;
        });
    }

    window.epAdminResolveDbProposal = async function (id, mode) {
        if (!db || !appUser || appUser.role !== 'admin') return;
        showLoader('Обработка заявки...', '🌍');
        try {
            const ref = db.collection('db_proposals').doc(id);
            const doc = await ref.get();
            if (!doc.exists) throw new Error('Заявка не найдена');
            const d = doc.data();

            if (mode !== 'reject') {
                const type = d.type || 'mat';
                let items = (d.items || []).map(function (x) {
                    return Object.assign({}, x, mode === 'names' ? { p: 0 } : {});
                });
                let arr = epCurrentDb(type).slice();
                items.forEach(function (it) {
                    const idx = arr.findIndex(x => epSameItem(x, it));
                    if (idx >= 0) arr[idx] = Object.assign({}, arr[idx], it, { id: arr[idx].id || it.id });
                    else arr.push(it);
                });
                epSetCurrentDb(type, arr);
                await epSaveGlobalDb();
                renderDbEditors();
            }

            await ref.set({
                status: mode === 'reject' ? 'rejected' : 'approved',
                decision: mode,
                decidedAt: new Date().toISOString(),
                decidedBy: appUser.uid || ''
            }, { merge: true });

            hideLoader();
            showToast(mode === 'reject' ? 'Заявка отклонена' : '✅ Добавлено в базу сервера');
        } catch(e) {
            hideLoader();
            showToast('❌ ' + (e.message || 'Ошибка'));
        }
    };

    // Patch lifecycle
    const epOldFinishLoginSetup = window.finishLoginSetup;
    window.finishLoginSetup = async function () {
        if (typeof epOldFinishLoginSetup === 'function') epOldFinishLoginSetup();
        epPatchSettingsUI();
        epInsertMainProviderSwitch();
        epInsertDbTools();
        epMakeAiMenuGroup();
        epAddBetaLabels();
        await epLoadAiConfigFromServer();
        await epLoadUserDbAfterLogin();
        epListenDbProposals();
    };

    function epInitialApply() {
        epPatchSettingsUI();
        epInsertMainProviderSwitch();
        epInsertDbTools();
        epMakeAiMenuGroup();
        epAddBetaLabels();
        epRefreshProviderUI();
        if (appUser) {
            epLoadAiConfigFromServer();
            epLoadUserDbAfterLogin();
            epListenDbProposals();
        }
    }

    document.addEventListener('DOMContentLoaded', function () {
        epInitialApply();
        setTimeout(epInitialApply, 400);
        setTimeout(epInitialApply, 1200);
    });

    document.addEventListener('click', function () {
        setTimeout(function () {
            epMakeAiMenuGroup();
            epAddBetaLabels();
            epInsertDbTools();
            epRefreshProviderUI();
        }, 120);
    });
})();
