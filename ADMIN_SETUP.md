# Налаштування адмін-панелі

Адмін-панель доступна за адресою **https://lumu.com.ua/admin**

## Що потрібно

1. **ADMIN_TOKEN** — пароль для входу (придумайте складний, додайте в Vercel)
2. **GITHUB_TOKEN** — вже додано (з gh auth). Якщо не працює — створіть новий токен з правами `repo`

## Як створити GitHub Token

1. GitHub → Settings → Developer settings → Personal access tokens
2. Generate new token (classic)
3. Виберіть scope **repo** (повний доступ до репозиторіїв)
4. Скопіюйте токен (формат `ghp_...`)

## Додати змінні в Vercel

1. Vercel → проект lumu → Settings → Environment Variables
2. Додайте або перевірте:
   - `ADMIN_TOKEN` — ваш пароль для входу в адмінку (придумайте і збережіть!)
   - `GITHUB_TOKEN` — Personal Access Token з правами `repo`
   - `GITHUB_REPO` — (опційно) `katering-VKK/katering-VKK.github.io`

3. Redeploy проект після додавання змінних

## Використання

1. Відкрийте https://lumu.com.ua/admin
2. Введіть пароль (за замовчуванням: `lumu-admin-2024` — змініть у Vercel для безпеки!)
3. Редагуйте товари, додавайте нові, видаляйте
4. Натисніть «Зберегти в GitHub» — зміни закомітяться в `public/products.json`
5. Після деплою (1–2 хв) зміни з’являться на сайті
