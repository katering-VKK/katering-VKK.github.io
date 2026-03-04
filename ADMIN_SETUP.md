# Налаштування адмін-панелі

Адмін-панель: **https://lumu.com.ua/admin**

---

## GitHub Secret: VITE_TELEGRAM_API_URL (для деплою на GitHub Pages)

Щоб адмінка та замовлення працювали на GitHub Pages, додайте секрет:

1. **GitHub** → репозиторій → **Settings** → **Secrets and variables** → **Actions**
2. **New repository secret**
3. Name: `VITE_TELEGRAM_API_URL`
4. Value: `https://lumu-api.vercel.app/api` (без слеша в кінці)
5. Збережіть. Після наступного push деплой підхопить змінну.

---

## Пароль для входу (ADMIN_TOKEN)

**Пароль зберігається в Vercel, не в GitHub.**

⚠️ **Важливо:** `ADMIN_TOKEN` має бути в Vercel-проекті **lumu-api** (https://lumu-api.vercel.app).

1. Відкрийте **https://vercel.com** → проект **lumu-api**
2. **Settings** → **Environment Variables**
3. Знайдіть `ADMIN_TOKEN` — це ваш пароль для входу
4. Якщо немає — додайте: Name: `ADMIN_TOKEN`, Value: придумайте пароль (наприклад `lumu-admin-2024`)
5. **Обовʼязково Redeploy** після додавання/зміни змінної (Deployments → … → Redeploy)

---

## GitHub Token (GITHUB_TOKEN) — для збереження товарів

Потрібен, щоб адмінка могла комітити зміни в репозиторій.

### Де взяти:

1. **GitHub** → профіль (аватар) → **Settings**
2. Ліва колонка → **Developer settings**
3. **Personal access tokens** → **Tokens (classic)**
4. **Generate new token (classic)**
5. Note: `lumu-admin`
6. Expiration: 90 days або No expiration
7. Виберіть scope **repo** (повний доступ)
8. **Generate token**
9. **Скопіюйте токен** (формат `ghp_xxxxxxxx`) — він показується один раз!

### Додати в Vercel:

1. Vercel → lumu → Settings → Environment Variables
2. Додайте: Name: `GITHUB_TOKEN`, Value: вставте скопійований токен
3. Redeploy

**Пряме посилання:** https://github.com/settings/tokens/new?scopes=repo

---

## Підсумок змінних у Vercel

| Змінна        | Де взяти                    | Призначення              |
|---------------|-----------------------------|--------------------------|
| ADMIN_TOKEN   | Придумайте самі             | Пароль для входу в адмінку |
| GITHUB_TOKEN  | GitHub → Settings → Tokens  | Коміт змін у репозиторій |
| GITHUB_REPO   | (опційно)                   | `katering-VKK/katering-VKK.github.io` |
| IMGBB_API_KEY | api.imgbb.com (безкоштовно) | Альтернатива для завантаження фото     |

---

## Завантаження фото

Потрібен **GITHUB_TOKEN** або **IMGBB_API_KEY** (хоча б один).

### 1. GitHub (GITHUB_TOKEN)
Фото зберігаються в `public/images/products/{id}.jpg` через GitHub API.

- Токен має бути **classic** (`ghp_`), scope **repo**
- Папка `public/images/products/` має існувати (додано `.gitkeep`)

### 2. ImgBB (рекомендовано, якщо GitHub не працює)
Безкоштовно, стабільніше для фото.

1. Зареєструйтесь на https://api.imgbb.com/
2. Отримайте API key
3. Vercel → lumu-api → Environment Variables → **IMGBB_API_KEY**
4. Redeploy

Якщо IMGBB_API_KEY задано, фото зберігаються на imgbb замість GitHub.

**Якщо при вході показує попередження про фото** — додайте GITHUB_TOKEN або IMGBB_API_KEY у Vercel і зробіть Redeploy.

---

## Використання

1. Відкрийте https://lumu.com.ua/admin
2. Введіть пароль (ADMIN_TOKEN з Vercel)
3. Редагуйте товари, додавайте, видаляйте
4. Натисніть **«Зберегти в GitHub»**
5. Через 1–2 хв зміни з’являться на сайті
