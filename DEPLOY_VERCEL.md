# Розгортання на Vercel — обовʼязково для роботи фото

API використовує **той самий домен** (lumu.com.ua/api) — без CORS. Для цього сайт має бути на **Vercel**, не на GitHub Pages.

## Кроки

1. **Vercel** → Import Project → підключити репо `katering-VKK/katering-VKK.github.io`
2. **Root Directory** — залишити `.` (корінь)
3. **Build** — Vercel підхопить `vercel.json` (npm run build, dist, api)
4. **Domain** — додати `lumu.com.ua` в Settings → Domains
5. **DNS** — вказати A/CNAME на Vercel (інструкція в Vercel)
6. **GitHub Pages** — у Settings репо вимкнути Pages або змінити домен, щоб lumu.com.ua вказував на Vercel

## Env vars у Vercel (проєкт з коренем репо)

- `ADMIN_TOKEN` — пароль для адмінки
- `GITHUB_TOKEN` — для збереження товарів і фото
- `GITHUB_REPO` — `katering-VKK/katering-VKK.github.io` (опційно)
- `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID` — для замовлень

API буде на `lumu.com.ua/api` — той самий домен, без CORS.

## Якщо зараз на GitHub Pages

1. Vercel → New Project → імпортувати репо
2. Root Directory: `.` (корінь)
3. Додати всі env vars
4. Deploy
5. Settings → Domains → додати lumu.com.ua
6. У DNS провайдера — вказати A-запис на 76.76.21.21 (Vercel)
7. У GitHub → Settings → Pages — вимкнути або змінити домен
