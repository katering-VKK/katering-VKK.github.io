/**
 * Cloudflare Worker — API замовлень для malenkyivsesvit.com.ua (GitHub Pages).
 *
 * Робить три речі:
 *   1) приймає замовлення з сайту, ЗБЕРІГАЄ їх у Cloudflare KV і шле в Telegram
 *      (з inline-кнопками для зміни статусу прямо з чату);
 *   2) дає захищений API для адмінки — логін, список замовлень, зміна статусу,
 *      видалення (авторизація — HMAC-сесійний токен, пароль ніколи не в коді сайту);
 *   3) приймає Telegram-вебхук (натискання кнопок) і оновлює статус у KV.
 *
 * Секрети (wrangler secret put ...), НІКОЛИ не в коді/гіті:
 *   TELEGRAM_BOT_TOKEN      — токен бота з BotFather
 *   TELEGRAM_CHAT_ID        — numeric chat id, куди слати замовлення
 *   ADMIN_PASSWORD          — пароль адмінки (звіряється на сервері)
 *   TELEGRAM_WEBHOOK_SECRET — довільний рядок для захисту вебхука (опц., рекомендовано)
 *   SESSION_SECRET          — ключ підпису сесій (опц.; якщо нема — береться ADMIN_PASSWORD)
 *
 * KV binding (wrangler.toml): ORDERS_KV
 *
 * Endpoints:
 *   OPTIONS *               — CORS preflight
 *   POST /  | POST /orders  — створити замовлення (публічно, з сайту)
 *   POST /login             — { password } → { ok, token }
 *   GET  /orders            — список замовлень (Bearer-токен)
 *   POST /orders/status     — { id, status } (Bearer-токен)
 *   POST /orders/delete     — { id } (Bearer-токен)
 *   POST /telegram          — Telegram webhook (callback_query)
 */

const TELEGRAM_API = 'https://api.telegram.org';
const ORDERS_KEY = 'orders';
const MAX_ORDERS = 500;
const SESSION_TTL_SECONDS = 7 * 24 * 60 * 60; // 7 днів

// Дозволені origin'и (CSRF/abuse guard). За потреби додай прев'ю-домени.
const ALLOWED_ORIGINS = new Set([
  'https://malenkyivsesvit.com.ua',
  'https://www.malenkyivsesvit.com.ua',
  'https://katering-vkk.github.io',
  'http://localhost:3000',
  'http://localhost:8787',
]);

const STATUS_LABELS = {
  new: 'Нове',
  processing: 'В обробці',
  shipped: 'Відправлено',
  delivered: 'Доставлено',
  cancelled: 'Скасовано',
};
const STATUS_EMOJI = {
  new: '🆕',
  processing: '⏳',
  shipped: '🚚',
  delivered: '✅',
  cancelled: '❌',
};
const VALID_STATUSES = Object.keys(STATUS_LABELS);

// ─────────────────────────────────────────────────────────── helpers

function corsHeaders(origin) {
  const allow = origin && ALLOWED_ORIGINS.has(origin) ? origin : 'https://malenkyivsesvit.com.ua';
  return {
    'Access-Control-Allow-Origin': allow,
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Max-Age': '86400',
    'Vary': 'Origin',
  };
}

function json(body, status, origin) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', ...corsHeaders(origin) },
  });
}

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// ───────────────────────────────────────────── crypto (session tokens)

const encoder = new TextEncoder();
const decoder = new TextDecoder();

function b64urlEncode(bytes) {
  let bin = '';
  for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function b64urlToBytes(str) {
  const pad = str.length % 4 ? '='.repeat(4 - (str.length % 4)) : '';
  const b64 = str.replace(/-/g, '+').replace(/_/g, '/') + pad;
  const bin = atob(b64);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

async function hmacKey(secret) {
  return crypto.subtle.importKey('raw', encoder.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign', 'verify']);
}

async function signToken(secret, ttlSeconds) {
  const exp = Math.floor(Date.now() / 1000) + ttlSeconds;
  const payload = b64urlEncode(encoder.encode(JSON.stringify({ exp })));
  const key = await hmacKey(secret);
  const sig = await crypto.subtle.sign('HMAC', key, encoder.encode(payload));
  return `${payload}.${b64urlEncode(new Uint8Array(sig))}`;
}

async function verifyToken(secret, token) {
  if (!token || typeof token !== 'string' || !token.includes('.')) return false;
  const [payload, sig] = token.split('.');
  if (!payload || !sig) return false;
  try {
    const key = await hmacKey(secret);
    const ok = await crypto.subtle.verify('HMAC', key, b64urlToBytes(sig), encoder.encode(payload));
    if (!ok) return false;
    const data = JSON.parse(decoder.decode(b64urlToBytes(payload)));
    return typeof data.exp === 'number' && data.exp > Math.floor(Date.now() / 1000);
  } catch {
    return false;
  }
}

function timingSafeEqual(a, b) {
  const ab = encoder.encode(String(a));
  const bb = encoder.encode(String(b));
  if (ab.length !== bb.length) return false;
  let diff = 0;
  for (let i = 0; i < ab.length; i++) diff |= ab[i] ^ bb[i];
  return diff === 0;
}

function bearerToken(request) {
  const h = request.headers.get('Authorization') || '';
  const m = h.match(/^Bearer\s+(.+)$/i);
  return m ? m[1].trim() : '';
}

async function requireAuth(request, env) {
  const secret = env.SESSION_SECRET || env.ADMIN_PASSWORD;
  if (!secret) return { error: json({ ok: false, error: 'Auth not configured' }, 500, request.headers.get('Origin')) };
  const ok = await verifyToken(secret, bearerToken(request));
  if (!ok) return { error: json({ ok: false, error: 'Unauthorized' }, 401, request.headers.get('Origin')) };
  return { ok: true };
}

// ──────────────────────────────────────────────────────────── KV store

async function readOrders(env) {
  if (!env.ORDERS_KV) return [];
  try {
    const raw = await env.ORDERS_KV.get(ORDERS_KEY);
    const data = raw ? JSON.parse(raw) : [];
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

async function writeOrders(env, orders) {
  if (!env.ORDERS_KV) return;
  await env.ORDERS_KV.put(ORDERS_KEY, JSON.stringify(orders.slice(0, MAX_ORDERS)));
}

function sanitizeOrder(order) {
  const customer = order.customer || {};
  return {
    id: String(order.id || Date.now().toString(36)),
    date: order.date || new Date().toISOString(),
    customer: {
      name: String(customer.name || ''),
      phone: String(customer.phone || ''),
      email: customer.email ? String(customer.email) : undefined,
      city: customer.city ? String(customer.city) : undefined,
      address: customer.address ? String(customer.address) : undefined,
      comment: customer.comment ? String(customer.comment) : undefined,
    },
    delivery: order.delivery && order.delivery.label
      ? { id: String(order.delivery.id || ''), label: String(order.delivery.label) }
      : undefined,
    items: Array.isArray(order.items)
      ? order.items.map(i => ({ productId: Number(i.productId) || 0, name: String(i.name || ''), price: String(i.price || ''), qty: Number(i.qty) || 1 }))
      : [],
    total: String(order.total || ''),
    status: VALID_STATUSES.includes(order.status) ? order.status : 'new',
  };
}

// ──────────────────────────────────────────────────────────── Telegram

function orderMessage(order) {
  const items = Array.isArray(order.items) ? order.items : [];
  const itemLines = items
    .map((item, index) => `${index + 1}. ${escapeHtml(item.name)} x${escapeHtml(item.qty)} — ${escapeHtml(item.price)}`)
    .join('\n');

  const customer = order.customer || {};
  const delivery = order.delivery || {};
  const status = VALID_STATUSES.includes(order.status) ? order.status : 'new';

  return [
    '<b>🛒 Нове замовлення з сайту</b>',
    `<b>ID:</b> ${escapeHtml(order.id)}`,
    `<b>Статус:</b> ${STATUS_EMOJI[status]} ${STATUS_LABELS[status]}`,
    `<b>Сума:</b> ${escapeHtml(order.total)}`,
    '',
    `<b>Клієнт:</b> ${escapeHtml(customer.name)}`,
    `<b>Телефон:</b> ${escapeHtml(customer.phone)}`,
    customer.email ? `<b>Email:</b> ${escapeHtml(customer.email)}` : '',
    customer.city ? `<b>Місто:</b> ${escapeHtml(customer.city)}` : '',
    delivery.label ? `<b>Доставка:</b> ${escapeHtml(delivery.label)}` : '',
    customer.address ? `<b>Адреса:</b> ${escapeHtml(customer.address)}` : '',
    customer.comment ? `<b>Коментар:</b> ${escapeHtml(customer.comment)}` : '',
    '',
    '<b>Товари:</b>',
    itemLines || 'Без товарів',
  ]
    .filter(Boolean)
    .join('\n');
}

function statusKeyboard(orderId) {
  return {
    inline_keyboard: [
      [
        { text: '⏳ В обробці', callback_data: `st:${orderId}:processing` },
        { text: '🚚 Відправлено', callback_data: `st:${orderId}:shipped` },
      ],
      [
        { text: '✅ Доставлено', callback_data: `st:${orderId}:delivered` },
        { text: '❌ Скасувати', callback_data: `st:${orderId}:cancelled` },
      ],
    ],
  };
}

async function tgApi(env, method, body) {
  const res = await fetch(`${TELEGRAM_API}/bot${env.TELEGRAM_BOT_TOKEN}/${method}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const text = await res.text();
  let data = {};
  try { data = text ? JSON.parse(text) : {}; } catch { data = { description: text }; }
  return { ok: res.ok && data.ok !== false, status: res.status, data };
}

// ─────────────────────────────────────────────────────────── handlers

async function handleCreateOrder(request, env, origin) {
  if (!env.TELEGRAM_BOT_TOKEN || !env.TELEGRAM_CHAT_ID) {
    return json({ ok: false, error: 'Telegram env is not configured' }, 500, origin);
  }

  let payload;
  try {
    payload = await request.json();
  } catch {
    return json({ ok: false, error: 'Invalid JSON' }, 400, origin);
  }

  const raw = payload?.order;
  if (!raw || !raw.customer || !Array.isArray(raw.items)) {
    return json({ ok: false, error: 'Invalid order payload' }, 400, origin);
  }

  const order = sanitizeOrder(raw);

  // Telegram — критичний шлях: якщо не вийшло, повертаємо помилку.
  let tg;
  try {
    tg = await tgApi(env, 'sendMessage', {
      chat_id: env.TELEGRAM_CHAT_ID,
      parse_mode: 'HTML',
      disable_web_page_preview: true,
      text: orderMessage(order),
      reply_markup: statusKeyboard(order.id),
    });
  } catch (e) {
    return json({ ok: false, error: `Telegram unreachable: ${e.message}` }, 502, origin);
  }
  if (!tg.ok) {
    return json({ ok: false, error: tg.data.description || `Telegram API ${tg.status}` }, 502, origin);
  }

  // Зберігаємо в KV (best-effort — не валимо замовлення, якщо KV недоступне).
  order.source = String(payload.source || '');
  order.tg = { chatId: env.TELEGRAM_CHAT_ID, messageId: tg.data?.result?.message_id };
  try {
    const orders = await readOrders(env);
    if (!orders.some(o => String(o.id) === String(order.id))) {
      orders.unshift(order);
      await writeOrders(env, orders);
    }
  } catch {
    // ignore storage failure — Telegram вже отримав замовлення
  }

  return json({ ok: true, id: order.id, stored: Boolean(env.ORDERS_KV) }, 200, origin);
}

async function handleLogin(request, env, origin) {
  const expected = env.ADMIN_PASSWORD;
  if (!expected) {
    return json({ ok: false, error: 'ADMIN_PASSWORD secret not set' }, 500, origin);
  }
  let body;
  try {
    body = await request.json();
  } catch {
    return json({ ok: false, error: 'Invalid JSON' }, 400, origin);
  }
  const password = String(body?.password || '');
  // Невелика затримка проти брутфорсу.
  await new Promise(r => setTimeout(r, 250));
  if (!password || !timingSafeEqual(password, expected)) {
    return json({ ok: false, error: 'Невірний пароль' }, 401, origin);
  }
  const secret = env.SESSION_SECRET || env.ADMIN_PASSWORD;
  const token = await signToken(secret, SESSION_TTL_SECONDS);
  return json({ ok: true, token, expiresIn: SESSION_TTL_SECONDS }, 200, origin);
}

async function handleListOrders(request, env, origin) {
  const auth = await requireAuth(request, env);
  if (auth.error) return auth.error;
  const orders = await readOrders(env);
  return json({ ok: true, orders, storage: env.ORDERS_KV ? 'kv' : 'none' }, 200, origin);
}

async function handleUpdateStatus(request, env, origin) {
  const auth = await requireAuth(request, env);
  if (auth.error) return auth.error;

  let body;
  try {
    body = await request.json();
  } catch {
    return json({ ok: false, error: 'Invalid JSON' }, 400, origin);
  }
  const id = String(body?.id || '');
  const status = String(body?.status || '');
  if (!id) return json({ ok: false, error: 'Missing order id' }, 400, origin);
  if (!VALID_STATUSES.includes(status)) return json({ ok: false, error: 'Invalid status' }, 400, origin);

  const orders = await readOrders(env);
  const idx = orders.findIndex(o => String(o.id) === id);
  if (idx < 0) return json({ ok: false, error: 'Order not found' }, 404, origin);

  orders[idx].status = status;
  orders[idx].updatedAt = new Date().toISOString();
  await writeOrders(env, orders);

  // Підправляємо повідомлення в Telegram (best-effort).
  const tg = orders[idx].tg;
  if (tg && tg.messageId && env.TELEGRAM_BOT_TOKEN) {
    await tgApi(env, 'editMessageText', {
      chat_id: tg.chatId,
      message_id: tg.messageId,
      parse_mode: 'HTML',
      disable_web_page_preview: true,
      text: orderMessage(orders[idx]),
      reply_markup: statusKeyboard(id),
    }).catch(() => {});
  }

  return json({ ok: true, status }, 200, origin);
}

async function handleDeleteOrder(request, env, origin) {
  const auth = await requireAuth(request, env);
  if (auth.error) return auth.error;

  let body;
  try {
    body = await request.json();
  } catch {
    return json({ ok: false, error: 'Invalid JSON' }, 400, origin);
  }
  const id = String(body?.id || '');
  if (!id) return json({ ok: false, error: 'Missing order id' }, 400, origin);

  const orders = await readOrders(env);
  const next = orders.filter(o => String(o.id) !== id);
  if (next.length === orders.length) return json({ ok: false, error: 'Order not found' }, 404, origin);
  await writeOrders(env, next);
  return json({ ok: true }, 200, origin);
}

async function handleTelegramWebhook(request, env) {
  // Захист вебхука секретним заголовком (Telegram надсилає його, якщо заданий у setWebhook).
  if (env.TELEGRAM_WEBHOOK_SECRET) {
    const got = request.headers.get('X-Telegram-Bot-Api-Secret-Token');
    if (got !== env.TELEGRAM_WEBHOOK_SECRET) return new Response('forbidden', { status: 403 });
  }

  let update;
  try {
    update = await request.json();
  } catch {
    return new Response('bad request', { status: 400 });
  }

  const cb = update.callback_query;
  if (!cb) return new Response('ok'); // інші типи апдейтів ігноруємо

  const data = String(cb.data || '');
  const m = data.match(/^st:(.+):(new|processing|shipped|delivered|cancelled)$/);

  if (!m) {
    await tgApi(env, 'answerCallbackQuery', { callback_query_id: cb.id }).catch(() => {});
    return new Response('ok');
  }

  const id = m[1];
  const status = m[2];
  const orders = await readOrders(env);
  const idx = orders.findIndex(o => String(o.id) === id);

  if (idx >= 0) {
    orders[idx].status = status;
    orders[idx].updatedAt = new Date().toISOString();
    if (!orders[idx].tg && cb.message) {
      orders[idx].tg = { chatId: cb.message.chat?.id, messageId: cb.message.message_id };
    }
    await writeOrders(env, orders);

    if (cb.message) {
      await tgApi(env, 'editMessageText', {
        chat_id: cb.message.chat.id,
        message_id: cb.message.message_id,
        parse_mode: 'HTML',
        disable_web_page_preview: true,
        text: orderMessage(orders[idx]),
        reply_markup: statusKeyboard(id),
      }).catch(() => {});
    }
  }

  await tgApi(env, 'answerCallbackQuery', {
    callback_query_id: cb.id,
    text: `Статус: ${STATUS_EMOJI[status]} ${STATUS_LABELS[status]}`,
  }).catch(() => {});

  return new Response('ok');
}

// ───────────────────────────────────────────────────────────── router

export default {
  async fetch(request, env) {
    const origin = request.headers.get('Origin');
    const url = new URL(request.url);
    const path = url.pathname.replace(/\/+$/, '') || '/';
    const method = request.method;

    if (method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: corsHeaders(origin) });
    }

    // Telegram webhook (сервер-до-сервера, без CORS).
    if (path === '/telegram' && method === 'POST') {
      return handleTelegramWebhook(request, env);
    }

    if (path === '/login' && method === 'POST') {
      return handleLogin(request, env, origin);
    }

    if (path === '/orders' && method === 'GET') {
      return handleListOrders(request, env, origin);
    }

    if (path === '/orders/status' && method === 'POST') {
      return handleUpdateStatus(request, env, origin);
    }

    if (path === '/orders/delete' && method === 'POST') {
      return handleDeleteOrder(request, env, origin);
    }

    // Створення замовлення з сайту: і корінь, і /orders (для сумісності).
    if ((path === '/' || path === '/orders') && method === 'POST') {
      return handleCreateOrder(request, env, origin);
    }

    return json({ ok: false, error: 'Not found' }, 404, origin);
  },
};
