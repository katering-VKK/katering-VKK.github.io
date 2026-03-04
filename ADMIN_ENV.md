# GitHub Secrets для адмінки (lumu.com.ua)

Щоб адмінка працювала на GitHub Pages, додай у **GitHub → Repo → Settings → Secrets and variables → Actions**:

| Secret | Значення |
|--------|----------|
| `VITE_ADMIN_API_URL` | `https://lumu-pearl.vercel.app/api` |
| `VITE_TELEGRAM_API_URL` | `https://lumu-pearl.vercel.app/api` |

Достатньо одного з них. `VITE_ADMIN_API_URL` має пріоритет для адмінки.

Після додавання — **Redeploy** (Actions → Deploy to GitHub Pages → Re-run).
