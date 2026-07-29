const crypto = require("crypto");
const { onCall, HttpsError } = require("firebase-functions/v2/https");
const { setGlobalOptions } = require("firebase-functions/v2");
const { defineSecret } = require("firebase-functions/params");
const { logger } = require("firebase-functions");
const admin = require("firebase-admin");

// Клиент (admin.js, auth.js, access-policy.js) вызывает функции в europe-west1.
setGlobalOptions({ region: "europe-west1", maxInstances: 10 });

// Секрет из Secret Manager: `firebase functions:secrets:set ACCESS_SIGNING_SECRET`.
// Подключён к функциям ниже через { secrets: [ACCESS_SIGNING_SECRET] } — без этого
// process.env.ACCESS_SIGNING_SECRET будет пустым, даже если секрет создан в облаке.
const ACCESS_SIGNING_SECRET = defineSecret("ACCESS_SIGNING_SECRET");

admin.initializeApp();
const db = admin.firestore();

const OWNER_EMAILS = new Set(["vits0007@gmail.com"]);

function now() {
  return admin.firestore.Timestamp.now();
}

function assertSignedIn(request) {
  if (!request.auth || !request.auth.uid) {
    throw new HttpsError("unauthenticated", "Требуется вход в аккаунт.");
  }
}

async function getUser(uid) {
  const snap = await db.collection("users").doc(uid).get();
  return snap.exists ? { uid, ...snap.data() } : null;
}

async function isAdmin(request) {
  assertSignedIn(request);
  const email = request.auth.token.email || "";
  if (OWNER_EMAILS.has(email)) return true;
  const user = await getUser(request.auth.uid);
  return Boolean(user && user.role === "admin" && user.accessStatus !== "blocked");
}

async function assertAdmin(request) {
  if (!(await isAdmin(request))) {
    throw new HttpsError("permission-denied", "Доступ только администратору.");
  }
}

function signingSecret() {
  const secret = process.env.ACCESS_SIGNING_SECRET || process.env.EP_ACCESS_SIGNING_SECRET || "";
  if (!secret) {
    logger.warn("ACCESS_SIGNING_SECRET is not configured. Signature is disabled until server secret is set.");
  }
  return secret;
}

// Канонический payload: фиксированный набор и порядок ключей, чтобы подпись
// не зависела от порядка полей, который возвращает Firestore.
function safeAccessPayload(data) {
  const sub = data.subscription || {};
  const ai = data.ai || {};
  return {
    uid: data.uid || "",
    role: data.role || "master",
    accessStatus: data.accessStatus || "pending",
    subscription: {
      plan: sub.plan || "none",
      active: Boolean(sub.active),
      expiresAtMs: sub.expiresAt && typeof sub.expiresAt.toMillis === "function" ? sub.expiresAt.toMillis() : null
    },
    ai: {
      mode: ai.mode || "off",
      enabled: Boolean(ai.enabled),
      balanceRub: Number(ai.balanceRub || 0)
    },
    version: "v29-secure-access"
  };
}

function signAccess(data) {
  const secret = signingSecret();
  if (!secret) return "server-secret-not-configured";
  return crypto
    .createHmac("sha256", secret)
    .update(JSON.stringify(safeAccessPayload(data)))
    .digest("hex");
}

function verifyAccessSignature(uid, data) {
  const secret = signingSecret();
  if (!secret) return true; // подпись выключена, пока секрет не задан
  const expected = signAccess({ ...data, uid });
  const actual = String(data.accessSignature || "");
  if (actual.length !== expected.length) return false;
  return crypto.timingSafeEqual(Buffer.from(actual), Buffer.from(expected));
}

async function logSecurityEvent(type, details) {
  try {
    await db.collection("security_events").add({ type, ...details, createdAt: now() });
  } catch (e) {
    logger.error("security_events write failed", e);
  }
}

function daysFromNow(days) {
  return admin.firestore.Timestamp.fromMillis(Date.now() + Number(days || 0) * 86400000);
}

function planTitle(plan) {
  return ({ none: "Нет подписки", basic: "Базовая", ai: "С ИИ", trial: "Тест 2 дня" })[plan] || "Нет подписки";
}

function buildFeatures(data) {
  const statusOk = data.accessStatus === "approved";
  const sub = data.subscription || {};
  const ai = data.ai || {};
  const active = Boolean(statusOk && sub.active && sub.plan !== "none");
  const hasAiPlan = active && (sub.plan === "ai" || sub.plan === "trial");
  const aiAllowed = Boolean(hasAiPlan && ai.enabled && (ai.mode === "client" || Number(ai.balanceRub || 0) > 0));

  return {
    app: active,
    database: active,
    materials: active,
    work: active,
    estimate: active,
    shield: active,
    pool: active,
    scheme: hasAiPlan,
    visualization: hasAiPlan,
    admin: data.role === "admin",
    ai: aiAllowed,
    warehouse: hasAiPlan,
    accounting: hasAiPlan,
    documents: hasAiPlan
  };
}

function normalizeAccessDoc(uid, data) {
  const subscription = data.subscription || {};
  const ai = data.ai || {};
  const expiresAt = subscription.expiresAt || null;
  const daysLeft = expiresAt && expiresAt.toMillis ? Math.max(0, Math.ceil((expiresAt.toMillis() - Date.now()) / 86400000)) : 0;

  const normalized = {
    uid,
    email: data.email || "",
    displayName: data.displayName || "",
    role: data.role || "master",
    accessStatus: data.accessStatus || "pending",
    subscription: {
      plan: subscription.plan || "none",
      title: subscription.title || planTitle(subscription.plan || "none"),
      active: Boolean(subscription.active),
      expiresAt,
      daysLeft
    },
    ai: {
      mode: ai.mode || "off",
      enabled: Boolean(ai.enabled),
      balanceRub: Number(ai.balanceRub || 0)
    }
  };

  normalized.features = buildFeatures(normalized);
  return normalized;
}

exports.ensureUserProfile = onCall({ secrets: [ACCESS_SIGNING_SECRET] }, async (request) => {
  assertSignedIn(request);
  const uid = request.auth.uid;
  const email = request.auth.token.email || "";
  const ref = db.collection("users").doc(uid);
  const existing = await ref.get();
  const base = {
    uid,
    email,
    displayName: request.auth.token.name || email,
    photoURL: request.auth.token.picture || "",
    lastLoginAt: now(),
    updatedAt: now()
  };

  if (!existing.exists) {
    const role = OWNER_EMAILS.has(email) ? "admin" : "master";
    const accessStatus = OWNER_EMAILS.has(email) ? "approved" : "pending";
    const doc = {
      ...base,
      role,
      accessStatus,
      subscription: { plan: "none", title: "Нет подписки", active: false, expiresAt: null },
      ai: { mode: "off", enabled: false, balanceRub: 0 },
      createdAt: now()
    };
    doc.accessSignature = signAccess({ ...doc, uid });
    await ref.set(doc);
  } else {
    await ref.set(base, { merge: true });
  }

  const fresh = await ref.get();
  return normalizeAccessDoc(uid, fresh.data() || {});
});

exports.getAccessPolicy = onCall({ secrets: [ACCESS_SIGNING_SECRET] }, async (request) => {
  assertSignedIn(request);
  const uid = request.auth.uid;
  const email = request.auth.token.email || "";
  const ref = db.collection("users").doc(uid);
  let snap = await ref.get();

  if (!snap.exists) {
    await exports.ensureUserProfile.run(request);
    snap = await ref.get();
  }

  const data = snap.data() || {};

  if (data.accessSignature && !verifyAccessSignature(uid, data)) {
    await logSecurityEvent("access-signature-mismatch", { uid, email });
    logger.warn("Access signature mismatch", { uid });
  }

  if (OWNER_EMAILS.has(email) && data.role !== "admin") {
    const patched = { ...data, role: "admin", accessStatus: "approved" };
    await ref.set({ role: "admin", accessStatus: "approved", accessSignature: signAccess({ ...patched, uid }), updatedAt: now() }, { merge: true });
    const fresh = await ref.get();
    return normalizeAccessDoc(uid, fresh.data() || {});
  }

  return normalizeAccessDoc(uid, data);
});

exports.adminListUsers = onCall(async (request) => {
  await assertAdmin(request);
  const snap = await db.collection("users").orderBy("updatedAt", "desc").limit(100).get();
  const users = snap.docs.map((doc) => normalizeAccessDoc(doc.id, doc.data() || {}));
  return { users };
});

const TRIAL_DAYS = 10;

// Единая точка админ-операций над пользователем. Заменяет прямые записи в users
// с клиента (правила их запрещают) и покрывает все действия админки.
exports.adminUpdateUser = onCall({ secrets: [ACCESS_SIGNING_SECRET] }, async (request) => {
  await assertAdmin(request);
  const input = request.data || {};
  const targetUid = String(input.targetUid || "");
  const op = String(input.op || "");
  if (!targetUid) throw new HttpsError("invalid-argument", "Не указан пользователь.");

  const ref = db.collection("users").doc(targetUid);
  const snap = await ref.get();
  if (!snap.exists) throw new HttpsError("not-found", "Пользователь не найден.");
  const cur = snap.data() || {};
  const curSub = cur.subscription || {};
  const curAi = cur.ai || {};

  const patch = { updatedAt: now(), updatedBy: request.auth.uid };
  const logExtra = {};

  switch (op) {
    case "approve": {
      patch.accessStatus = "approved";
      // одобренному мастеру без подписки выдаём тест TRIAL_DAYS дней (один раз)
      const hasSub = curSub.plan && curSub.plan !== "none";
      if (!hasSub && !cur.trialUsed) {
        patch.subscription = {
          plan: "trial",
          title: planTitle("trial"),
          active: true,
          expiresAt: daysFromNow(TRIAL_DAYS),
          updatedAt: now()
        };
        patch.trialUsed = true;
        logExtra.trialDays = TRIAL_DAYS;
      }
      break;
    }
    case "block":
      patch.accessStatus = "blocked";
      break;
    case "unblock":
      patch.accessStatus = "approved";
      break;
    case "setRole": {
      const role = String(input.role || "");
      if (role !== "admin" && role !== "master") throw new HttpsError("invalid-argument", "Недопустимая роль.");
      patch.role = role;
      logExtra.role = role;
      break;
    }
    case "grantSubscription": {
      const plan = ["basic", "ai", "trial"].indexOf(String(input.plan || "")) >= 0 ? String(input.plan) : "basic";
      const days = Math.max(1, Math.min(3650, Number(input.days || 30)));
      // продление: если текущая подписка ещё активна, дни прибавляются к её концу
      const baseMs = curSub.expiresAt && typeof curSub.expiresAt.toMillis === "function" && curSub.expiresAt.toMillis() > Date.now() && input.extend !== false
        ? curSub.expiresAt.toMillis() : Date.now();
      patch.subscription = {
        plan,
        title: planTitle(plan),
        active: true,
        expiresAt: admin.firestore.Timestamp.fromMillis(baseMs + days * 86400000),
        updatedAt: now()
      };
      if (plan === "trial") patch.trialUsed = true;
      patch.accessStatus = cur.accessStatus === "blocked" ? cur.accessStatus : "approved";
      logExtra.plan = plan; logExtra.days = days;
      break;
    }
    case "cancelSubscription":
      patch.subscription = { plan: "none", title: planTitle("none"), active: false, expiresAt: null, updatedAt: now() };
      break;
    case "setAiMode": {
      const mode = ["off", "client", "server"].indexOf(String(input.mode || "")) >= 0 ? String(input.mode) : "off";
      patch.ai = { ...curAi, mode, enabled: mode !== "off", updatedAt: now() };
      logExtra.aiMode = mode;
      break;
    }
    case "setAiBalance": {
      const balanceRub = Math.max(0, Number(input.balanceRub || 0));
      patch.ai = { ...curAi, balanceRub, updatedAt: now() };
      logExtra.aiBalanceRub = balanceRub;
      break;
    }
    case "topUpAiBalance": {
      const amountRub = Number(input.amountRub || 0);
      if (!(amountRub > 0)) throw new HttpsError("invalid-argument", "Сумма пополнения должна быть больше нуля.");
      patch.ai = { ...curAi, balanceRub: Math.max(0, Number(curAi.balanceRub || 0) + amountRub), updatedAt: now() };
      logExtra.amountRub = amountRub;
      break;
    }
    case "setNote":
      patch.adminNote = String(input.note || "");
      break;
    default:
      throw new HttpsError("invalid-argument", "Неизвестная операция: " + op);
  }

  const next = { ...cur, ...patch };
  patch.accessSignature = signAccess({ ...next, uid: targetUid });

  await ref.set(patch, { merge: true });
  await db.collection("admin_logs").add({
    type: "adminUpdateUser",
    op,
    actorUid: request.auth.uid,
    actorEmail: request.auth.token.email || "",
    targetUid,
    uid: targetUid,
    ...logExtra,
    createdAt: now()
  });

  const fresh = await ref.get();
  return { ok: true, user: normalizeAccessDoc(targetUid, fresh.data() || {}) };
});

exports.adminSetUserAccess = onCall({ secrets: [ACCESS_SIGNING_SECRET] }, async (request) => {
  await assertAdmin(request);
  const input = request.data || {};
  const targetUid = String(input.targetUid || "");
  if (!targetUid) throw new HttpsError("invalid-argument", "Не указан пользователь.");

  const plan = String(input.plan || "none");
  const days = Number(input.days || 0);
  const aiBalanceRub = Number(input.aiBalanceRub || 0);

  const accessDoc = {
    role: String(input.role || "master"),
    accessStatus: String(input.accessStatus || "approved"),
    subscription: {
      plan,
      title: planTitle(plan),
      active: plan !== "none" && days > 0,
      expiresAt: plan !== "none" && days > 0 ? daysFromNow(days) : null,
      updatedAt: now()
    },
    ai: {
      mode: String(input.aiMode || "off"),
      enabled: Boolean(input.aiEnabled),
      balanceRub: Math.max(0, aiBalanceRub),
      updatedAt: now()
    },
    adminNote: String(input.note || ""),
    updatedAt: now(),
    updatedBy: request.auth.uid
  };

  accessDoc.accessSignature = signAccess({ ...accessDoc, uid: targetUid });

  await db.collection("users").doc(targetUid).set(accessDoc, { merge: true });
  await db.collection("admin_logs").add({
    type: "adminSetUserAccess",
    actorUid: request.auth.uid,
    actorEmail: request.auth.token.email || "",
    targetUid,
    plan,
    aiMode: accessDoc.ai.mode,
    aiBalanceRub: accessDoc.ai.balanceRub,
    createdAt: now()
  });

  const fresh = await getUser(targetUid);
  return { ok: true, user: normalizeAccessDoc(targetUid, fresh || {}) };
});

/* ============================================================================
   PUSH-уведомления чата при ПОЛНОСТЬЮ закрытом приложении.

   Клиент (assets/js/modules/ui/feedback.js) кладёт FCM-токен устройства в
   chat_tokens/{token} = {uid, name, mute, ua, at}. Триггер на создание сообщения
   собирает токены получателей и отправляет DATA-ONLY сообщение — показывает его наш
   собственный обработчик push в sw.js (без библиотеки firebase-messaging в SW).

   ПОЧЕМУ v1-триггеры, а не v2: у v2-триггеров Firestore регион функции обязан
   совпадать с регионом базы (для мультирегиона eur3 — europe-west4), и промах по
   региону валит ДЕПЛОЙ. v1-триггеры к этому не привязаны и живут в том же
   europe-west1, где уже успешно деплоятся вызываемые функции выше. Деплой hosting
   при этом всё равно отделён от functions отдельным шагом CI — падение функции не
   должно мешать выкату самого приложения.
   ============================================================================ */
const functionsV1 = require("firebase-functions/v1");
const REGION = "europe-west1";
const PUSH_BATCH = 450;          // sendEachForMulticast принимает максимум 500 токенов

function cut(s, n) {
  const t = String(s == null ? "" : s);
  return t.length > n ? t.slice(0, n - 1) + "…" : t;
}

/* Токены получателей. uids === null означает «общий чат» — все, кроме автора.
   mute (зеркало статуса «не беспокоить») фильтруем В КОДЕ, а не запросом: иначе
   пришлось бы держать составной индекс, а выигрыша нет — токенов немного. */
async function tokensFor(uids, exceptUid) {
  const docs = [];
  if (uids === null) {
    const snap = await db.collection("chat_tokens").get();
    snap.forEach((d) => docs.push({ id: d.id, ...d.data() }));
  } else {
    const list = Array.from(new Set(uids.filter((u) => u && u !== exceptUid)));
    if (!list.length) return [];
    // whereIn принимает до 30 значений за запрос — режем на куски
    for (let i = 0; i < list.length; i += 30) {
      const part = list.slice(i, i + 30);
      const snap = await db.collection("chat_tokens").where("uid", "in", part).get();
      snap.forEach((d) => docs.push({ id: d.id, ...d.data() }));
    }
  }
  return docs.filter((t) => t.uid && t.uid !== exceptUid && t.mute !== true).map((t) => t.id);
}

/* Мёртвые токены (переустановили приложение, отозвали разрешение) удаляем — иначе
   они копятся навсегда и каждая отправка тратит квоту на заведомый отказ. */
async function dropDeadTokens(tokens, responses) {
  const dead = [];
  responses.forEach((r, i) => {
    const code = r && r.error && r.error.code ? String(r.error.code) : "";
    if (/registration-token-not-registered|invalid-argument|invalid-registration-token/.test(code)) dead.push(tokens[i]);
  });
  if (!dead.length) return;
  await Promise.all(dead.map((t) => db.collection("chat_tokens").doc(t).delete().catch(() => null)));
  logger.info("chatPush: удалено мёртвых токенов", { count: dead.length });
}

async function sendChatPush(uids, exceptUid, title, body, tag) {
  const tokens = await tokensFor(uids, exceptUid);
  if (!tokens.length) return 0;
  let sent = 0;
  for (let i = 0; i < tokens.length; i += PUSH_BATCH) {
    const part = tokens.slice(i, i + PUSH_BATCH);
    // ТОЛЬКО data: поле notification заставило бы FCM показать уведомление своими
    // силами в обход нашего обработчика в sw.js (и мы потеряли бы проверку «окно
    // открыто — не дублировать»)
    const res = await admin.messaging().sendEachForMulticast({
      tokens: part,
      data: { title: cut(title, 80), body: cut(body, 160), tag: String(tag || "ep-chat") },
      android: { priority: "high" },
      webpush: { headers: { Urgency: "high", TTL: "86400" } }
    });
    sent += res.successCount;
    await dropDeadTokens(part, res.responses);
  }
  logger.info("chatPush", { tokens: tokens.length, sent: sent, tag: tag });
  return sent;
}

exports.chatPushPublic = functionsV1.region(REGION)
  .firestore.document("chat_messages/{msgId}")
  .onCreate(async (snap) => {
    const m = snap.data() || {};
    if (!m.text) return null;
    return sendChatPush(null, m.uid, m.name || "Мастер", m.text, "ep-chat-pub").catch((e) => {
      logger.error("chatPushPublic", e); return null;
    });
  });

exports.chatPushDm = functionsV1.region(REGION)
  .firestore.document("chat_dm/{msgId}")
  .onCreate(async (snap) => {
    const m = snap.data() || {};
    if (!m.text || !m.to) return null;
    return sendChatPush([m.to], m.from, (m.name || "Мастер") + " · лично", m.text, "ep-chat-dm-" + m.from).catch((e) => {
      logger.error("chatPushDm", e); return null;
    });
  });

exports.chatPushGroup = functionsV1.region(REGION)
  .firestore.document("chat_group/{msgId}")
  .onCreate(async (snap) => {
    const m = snap.data() || {};
    if (!m.text || !Array.isArray(m.uids)) return null;
    let room = "Группа";
    try {
      const r = await db.collection("chat_rooms").doc(String(m.roomId || "")).get();
      if (r.exists && r.data().name) room = r.data().name;
    } catch (_) {}
    return sendChatPush(m.uids, m.from, (m.name || "Мастер") + " · " + room, m.text, "ep-chat-room-" + (m.roomId || "")).catch((e) => {
      logger.error("chatPushGroup", e); return null;
    });
  });
