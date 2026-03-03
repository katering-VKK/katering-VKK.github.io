# Налаштування адмін-панелі

Адмін-панель: **https://lumu.com.ua/admin**

---

## Пароль для входу (ADMIN_TOKEN)

**Пароль зберігається в Vercel, не в GitHub.**

1. Відкрийте **https://vercel.com** → проект **lumu**
2. **Settings** → **Environment Variables**
3. Знайдіть `ADMIN_TOKEN` — це ваш пароль для входу
4. Якщо немає — додайте: Name: `ADMIN_TOKEN`, Value: придумайте пароль (наприклад `lumu-secret-2025`)
5. Redeploy проект після зміни

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

---

## Використання

1. Відкрийте https://lumu.com.ua/admin
2. Введіть пароль (ADMIN_TOKEN з Vercel)
3. Редагуйте товари, додавайте, видаляйте
4. Натисніть **«Зберегти в GitHub»**
5. Через 1–2 хв зміни з’являться на сайті
