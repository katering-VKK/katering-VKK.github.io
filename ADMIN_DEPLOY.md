# Адмінка без CORS — деплой на Vercel (повний стек)

**Проблема:** Завантаження фото дає "Failed to fetch" через CORS (сайт на github.io, API на lumu-api.vercel.app).

**Рішення:** Деплой повного сайту (frontend + API) на один Vercel-проект. Тоді адмінка і API на одному домені — CORS не потрібен.

---

## Кроки

### 1. Новий Vercel-проект

1. **Vercel** → **Add New** → **Project**
2. **Import** репозиторій **katering-VKK/katering-VKK.github.io**
3. **Root Directory** → залиште **порожнім** (корінь репо, не lumu-api)
4. **Build Command:** `npm run build` (за замовчуванням)
5. **Output Directory:** `dist` (за замовчуванням)

### 2. Environment Variables

Додайте ті самі змінні, що в lumu-api:

| Змінна | Значення |
|--------|----------|
| ADMIN_TOKEN | ваш пароль |
| GITHUB_TOKEN | ghp_xxx (classic, scope repo) |
| TELEGRAM_BOT_TOKEN | токен бота |
| TELEGRAM_CHAT_ID | 871897952 |
| IMGBB_API_KEY | (опційно) для фото через imgbb |

**Не додавайте** `VITE_TELEGRAM_API_URL` — тоді додаток використовує `/api` (той самий домен).

### 3. Deploy

Натисніть **Deploy**. Після деплою скопіюйте URL (наприклад `маленький-всесвіт-xxx.vercel.app`).

### 4. Використання

- **Адмінка:** `https://ваш-url.vercel.app/admin`
- Завантаження фото працює (same-origin, без CORS)

### 5. (Опційно) Домен

Vercel → Settings → Domains → додайте `admin.lumu.com.ua` або інший піддомен.

---

## Два проєкти

- **lumu-api** (Root = lumu-api) — тільки API, для GitHub Pages
- **lumu-admin** або **lumu-full** (Root = пусто) — повний сайт для адмінки

Головний сайт може залишатися на GitHub Pages (lumu.com.ua). Адмінку відкривайте через Vercel URL.
