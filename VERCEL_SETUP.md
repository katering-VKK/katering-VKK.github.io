# Vercel — налаштування API (усунення 404)

Якщо `/api/*` повертає **404 NOT_FOUND**, перевірте:

## 1. Root Directory

**Vercel** → проект **lumu** → **Settings** → **General** → **Root Directory**

Має бути **порожньо** або `.` — щоб корінь репозиторію був коренем проєкту. Якщо вказано підпапку (наприклад `frontend`), папка `api/` не потрапить у деплой.

## 2. Підключення репозиторію

**Settings** → **Git** → переконайтеся, що підключено **katering-VKK/katering-VKK.github.io** (або ваш репозиторій з папкою `api/`).

## 3. Перевірка після деплою

- https://lumu-pearl.vercel.app/api/hello — має повернути `{"ok":true,"msg":"API works"}`
- https://lumu-pearl.vercel.app/api/admin/health — має повернути `{"configured":true}`

Якщо `/api/hello` теж 404 — API взагалі не деплоїться (див. Root Directory).

## 4. Redeploy

Після змін у налаштуваннях: **Deployments** → … → **Redeploy**.
