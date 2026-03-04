# Перенесення lumu.com.ua на Vercel

Сайт вже на Vercel: **https://lumu-pearl.vercel.app**. Щоб він відкривався на **lumu.com.ua**:

## 1. Vercel — додати домен

1. Відкрий https://vercel.com → проект **lumu**
2. **Settings** → **Domains**
3. **Add** → введи `lumu.com.ua` → **Add**
4. (Опційно) додай `www.lumu.com.ua`

Vercel покаже інструкції для DNS.

## 2. DNS — змінити записи

У реєстраторі домену (де купував lumu.com.ua) зміни:

| Тип | Ім'я | Значення |
|-----|------|----------|
| **A** | `@` | `76.76.21.21` |
| **CNAME** | `www` | `cname.vercel-dns.com` |

Або якщо підтримується тільки CNAME для кореня:
| Тип | Ім'я | Значення |
|-----|------|----------|
| **CNAME** | `@` | `cname.vercel-dns.com` |
| **CNAME** | `www` | `cname.vercel-dns.com` |

> Якщо зараз lumu.com.ua вказує на GitHub Pages — ці записи його замінять на Vercel.

## 3. GitHub Pages — вимкнути кастомний домен

1. GitHub → **katering-VKK/katering-VKK.github.io** → **Settings** → **Pages**
2. **Custom domain** — очистити або вимкнути, щоб не було конфлікту

## 4. Перевірка

Після оновлення DNS (5–30 хв):

- https://lumu.com.ua — головна
- https://lumu.com.ua/admin — адмінка (API на тому ж домені, без CORS)
