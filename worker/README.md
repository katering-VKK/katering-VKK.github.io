# Orders Worker (Telegram + KV)

Cloudflare Worker — бекенд замовлень для статичного сайту (GitHub Pages):

- приймає замовлення з сайту, **зберігає їх у Cloudflare KV** і шле в Telegram
  (з inline-кнопками для зміни статусу прямо з чату);
- дає **захищений API для адмінки**: логін, список замовлень, зміна статусу, видалення;
- приймає **Telegram-вебхук** (натискання кнопок) і оновлює статус у KV.

Токени й пароль лишаються на сервері (секрети Worker), у клієнтський JS не потрапляють.

## 1. KV namespace (сховище замовлень)

```bash
cd worker
npx wrangler kv namespace create ORDERS
```

Команда виведе `id` — встав його у `wrangler.toml` замість `REPLACE_WITH_KV_NAMESPACE_ID`.

## 2. Секрети (НЕ комітяться)

```bash
cd worker
npx wrangler secret put TELEGRAM_BOT_TOKEN        # НОВИЙ токен з BotFather (після /revoke)
npx wrangler secret put TELEGRAM_CHAT_ID          # numeric chat id (871897952)
npx wrangler secret put ADMIN_PASSWORD            # пароль адмінки (звіряється на сервері)
npx wrangler secret put TELEGRAM_WEBHOOK_SECRET   # довільний рядок, напр. `openssl rand -hex 16`
```

`SESSION_SECRET` — опційно; якщо не задавати, для підпису сесій береться `ADMIN_PASSWORD`
(зміна пароля автоматично «розлогінює» всі активні сесії).

## 3. Деплой

```bash
cd worker
npx wrangler deploy
```

Після деплою отримаєш URL виду `https://katering-orders.<subdomain>.workers.dev`.

## 4. Telegram-вебхук (кнопки статусів)

Щоб кнопки під замовленням у Telegram міняли статус, один раз зареєструй вебхук
(підстав свій токен, URL воркера та той самий `TELEGRAM_WEBHOOK_SECRET`):

```bash
curl "https://api.telegram.org/bot<ТОКЕН>/setWebhook" \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://katering-orders.<subdomain>.workers.dev/telegram",
    "secret_token": "<TELEGRAM_WEBHOOK_SECRET>",
    "allowed_updates": ["callback_query"]
  }'
```

Перевірити: `curl "https://api.telegram.org/bot<ТОКЕН>/getWebhookInfo"`.

## 5. Підключення фронтенду

GitHub → Settings → Secrets and variables → Actions:

```
VITE_ORDER_API_URL = https://katering-orders.<subdomain>.workers.dev
```

Цей же секрет уже проброшено у крок build у `.github/workflows/deploy-pages.yml`
(Vite підставляє `VITE_*` лише на момент збірки). Адмінка використовує цей URL і для
логіну, і для списку/статусів замовлень.

## API

| Метод і шлях           | Доступ        | Призначення                                  |
|------------------------|---------------|----------------------------------------------|
| `POST /` або `/orders` | публічно      | створити замовлення (сайт): KV + Telegram    |
| `POST /login`          | публічно      | `{ password }` → `{ ok, token }`             |
| `GET  /orders`         | Bearer-токен  | список замовлень                             |
| `POST /orders/status`  | Bearer-токен  | `{ id, status }` — змінити статус            |
| `POST /orders/delete`  | Bearer-токен  | `{ id }` — видалити замовлення               |
| `POST /telegram`       | секрет-хедер  | Telegram webhook (callback_query)            |

Статуси: `new`, `processing`, `shipped`, `delivered`, `cancelled`.

## Як дізнатися TELEGRAM_CHAT_ID

1. Відкрий свого бота в Telegram, натисни **Start**.
2. Відкрий у браузері: `https://api.telegram.org/bot<ТОКЕН>/getUpdates`
3. Знайди `"chat":{"id": ... }` — це і є chat id.

## Локальна перевірка

```bash
cd worker
echo 'ADMIN_PASSWORD = "test"' > .dev.vars   # локальний секрет (gitignored)
npx wrangler dev                             # http://localhost:8787, локальне KV

# логін → токен:
curl -s -X POST http://localhost:8787/login \
  -H "Content-Type: application/json" -d '{"password":"test"}'

# список замовлень із токеном:
curl -s http://localhost:8787/orders -H "Authorization: Bearer <ТОКЕН>"

# без токена → 401:
curl -s -i http://localhost:8787/orders
```
