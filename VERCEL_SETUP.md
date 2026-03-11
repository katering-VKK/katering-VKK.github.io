# Vercel — налаштування API (усунення 404)

## Рішення: окремий API-проект (lumu-api)

Створено папку **lumu-api/** — окремий Vercel-проект тільки для API.

### Кроки

1. **Vercel** → **Add New** → **Project**
2. **Import** репозиторій **katering-VKK/katering-VKK.github.io**
3. **Root Directory** → натисніть **Edit** → введіть `lumu-api` → **Continue**
4. **Environment Variables** — додайте:
   - `ADMIN_TOKEN` = lumu-admin-2024
   - `GITHUB_TOKEN` = ваш токен
   - `TELEGRAM_BOT_TOKEN` = токен бота
   - `TELEGRAM_CHAT_ID` = 871897952

Замовлення також надсилаються на ID 1068223508 та 6840676016 (дубль).
5. **Deploy**
6. Скопіюйте URL (наприклад `lumu-api-xxx.vercel.app`)
7. **GitHub** → Settings → Secrets → `VITE_TELEGRAM_API_URL` = `https://ваш-url.vercel.app/api`
8. (Опційно) **Vercel** → проект lumu-api → **Settings** → **Domains** → додайте `lumu-pearl.vercel.app`

### Перевірка

- `https://ваш-url.vercel.app/api/hello` → `{"ok":true,"msg":"API works"}`
- `https://ваш-url.vercel.app/api/admin/health` → `{"configured":true}`
