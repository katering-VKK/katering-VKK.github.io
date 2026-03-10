# GitHub Secrets для адмінки та Telegram

Щоб адмінка і замовлення в Telegram працювали на GitHub Pages, додай у **GitHub → Repo → Settings → Secrets and variables → Actions**:

| Secret | Значення |
|--------|----------|
| `VITE_ADMIN_API_URL` | `https://lumu-api.vercel.app/api` |
| `VITE_TELEGRAM_API_URL` | `https://lumu-api.vercel.app/api` |

Достатньо одного з них. `VITE_ADMIN_API_URL` має пріоритет для адмінки.

**Telegram:** VITE_TELEGRAM_API_URL має вказувати на Vercel-проект, де налаштовані `TELEGRAM_BOT_TOKEN` і `TELEGRAM_CHAT_ID`.

Після додавання — **Redeploy** (Actions → Deploy to GitHub Pages → Re-run).
