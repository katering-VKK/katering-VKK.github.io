# Telegram замовлення — чекліст

Якщо замовлення не приходять у Telegram:

## 1. GitHub Secrets

**GitHub** → репозиторій → **Settings** → **Secrets and variables** → **Actions**

| Secret | Значення |
|--------|----------|
| `VITE_TELEGRAM_API_URL` | `https://lumu-pearl.vercel.app/api` |

⚠️ Без слеша в кінці. Після зміни — **Actions** → **Deploy to GitHub Pages** → **Re-run all jobs**.

## 2. Vercel Environment Variables

**Vercel** → проект **lumu-api** (або той, що вказує VITE_TELEGRAM_API_URL) → **Settings** → **Environment Variables**

| Змінна | Значення |
|--------|----------|
| `TELEGRAM_BOT_TOKEN` | Токен від @BotFather |
| `TELEGRAM_CHAT_ID` | ID чату (наприклад 871897952) |

Замовлення автоматично дублюються на ID 1068223508 та 6840676016. Щоб отримувати повідомлення, ці користувачі мають спочатку написати боту /start.

Після зміни — **Deployments** → **Redeploy** останнього деплою.

## 3. Перевірка API

```bash
# Чи налаштовано API (GET)
curl https://lumu-pearl.vercel.app/api/telegram
# {"configured":true,"hint":"OK"} — все ок
# {"configured":false,"hint":"Add TELEGRAM_BOT_TOKEN..."} — додай змінні в Vercel

# Тест відправки (POST)
curl -X POST https://lumu-pearl.vercel.app/api/telegram \
  -H "Content-Type: application/json" \
  -d '{"text":"test"}'
```

- `{"ok":true}` — працює
- `500 Server not configured` — немає TELEGRAM_BOT_TOKEN або TELEGRAM_CHAT_ID у Vercel
- `502 Telegram API error` — невірний токен або chat_id

## 4. CORS

Якщо в консолі браузера (F12) помилка CORS — перевір, що `malenkyivsesvit.com.ua` і `www.malenkyivsesvit.com.ua` додані в allowed origins у `lumu-api/api/telegram.js` (вже додано).
