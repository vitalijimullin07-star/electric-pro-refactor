// === CORE HELPERS ===

// === safeGet ===
function safeGet(key, def) { try { return localStorage.getItem(key) || def; } catch(e) { return def; } }

// === safeSet ===
function safeSet(key, val) { try { localStorage.setItem(key, val); } catch(e) {} }
