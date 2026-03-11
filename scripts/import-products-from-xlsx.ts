/**
 * Імпорт товарів з export_products_260311.xlsx
 * Конвертує в JSON та заливає на сайт (без фото)
 *
 * Використання:
 *   npx tsx scripts/import-products-from-xlsx.ts [шлях-до-xlsx]
 *   ADMIN_TOKEN=xxx API_URL=https://lumu-pearl.vercel.app/api npx tsx scripts/import-products-from-xlsx.ts --upload
 */

import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const XLSX = require('xlsx');
import * as fs from 'fs';
import * as path from 'path';

const SITE_CATEGORIES = ['Книги', 'Іграшки', 'Власне виробництво', 'Творчість', 'Настільні ігри'] as const;

const CATEGORY_MAP: Record<string, string> = {
  'Книги': 'Книги',
  'Книги Bookopt': 'Книги',
  'Ранок': 'Книги',
  'Іграшки 7': 'Іграшки',
  "Дерев'яні розвиваючі іграшки": 'Іграшки',
  "М'які іграшки": 'Іграшки',
  'Пазли і лего': 'Іграшки',
  'Ігри з липучками': 'Творчість',
  'ЛИПУЧКИ ПІД РЕАЛІЗАЦІЮ': 'Творчість',
  'Брелки': 'Власне виробництво',
  'Подарункові СЕРТИФІКАТИ': 'Настільні ігри',
  'TIGRES': 'Власне виробництво',
  'Ілля 3D': 'Власне виробництво',
  'ВІЛЬНИЙ ВІТЕР Мандрівець': 'Власне виробництво',
  'МАРИНА': 'Власне виробництво',
  'Настя БізіБорд': 'Власне виробництво',
  'Наташа': 'Власне виробництво',
  'Юля': 'Власне виробництво',
  'Яна Рюкзаки': 'Власне виробництво',
  'Ярина': 'Власне виробництво',
  'Китай': 'Іграшки',
};

const SKIP_CATEGORIES = new Set(['Головний екран']);

interface ExcelRow {
  'PosterID product_id (не змінювати!)'?: number;
  'Назва'?: string;
  'Категорія'?: string;
  'Ціна'?: number;
}

interface Product {
  id: number;
  name: string;
  price: string;
  category: string;
  tag: string;
  image?: string;
}

function mapCategory(excelCat: string): string {
  const trimmed = String(excelCat || '').trim();
  if (SKIP_CATEGORIES.has(trimmed)) return '';
  return CATEGORY_MAP[trimmed] || 'Власне виробництво';
}

function normalizeProducts(rows: ExcelRow[]): Product[] {
  const products: Product[] = [];
  let id = 1;
  for (const row of rows) {
    const name = String(row['Назва'] || '').trim();
    if (!name) continue;

    const excelCat = String(row['Категорія'] || '').trim();
    const category = mapCategory(excelCat);
    if (!category) continue;

    const priceNum = typeof row['Ціна'] === 'number' ? row['Ціна'] : parseInt(String(row['Ціна'] || '0').replace(/\s/g, ''), 10);
    if (isNaN(priceNum) || priceNum < 0) continue;

    products.push({
      id: id++,
      name,
      price: `${priceNum.toLocaleString('uk-UA')} ₴`,
      category,
      tag: '',
      // image — без фото поки
    });
  }
  return products;
}

async function uploadToApi(products: Product[]): Promise<void> {
  const token = process.env.ADMIN_TOKEN;
  const apiUrl = (process.env.API_URL || 'https://lumu-pearl.vercel.app/api').replace(/\/$/, '');

  if (!token) {
    console.error('Для завантаження потрібен ADMIN_TOKEN. Додай: ADMIN_TOKEN=твій_пароль');
    process.exit(1);
  }

  console.log(`Відправляю ${products.length} товарів на ${apiUrl}...`);

  const res = await fetch(`${apiUrl}/admin/products`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ products, token }),
  });

  const text = await res.text();
  let data: { ok?: boolean; error?: string } = {};
  try {
    data = JSON.parse(text);
  } catch {
    console.error('Відповідь:', text);
    process.exit(1);
  }

  if (data.ok) {
    console.log('✓ Товари збережені в GitHub. Через 1–2 хв з\'являться на сайті.');
  } else {
    console.error('Помилка:', data.error || text);
    process.exit(1);
  }
}

async function main() {
  const args = process.argv.slice(2);
  const upload = args.includes('--upload');
  const xlsxPath = args.find(a => !a.startsWith('--')) ||
    path.join(process.cwd(), 'export_products_260311.xlsx') ||
    path.join(process.env.HOME || '', 'Downloads', 'export_products_260311.xlsx');

  if (!fs.existsSync(xlsxPath)) {
    console.error('Файл не знайдено:', xlsxPath);
    console.error('Використання: npx tsx scripts/import-products-from-xlsx.ts [шлях/export_products_260311.xlsx] [--upload]');
    process.exit(1);
  }

  const wb = XLSX.readFile(xlsxPath);
  const sheetName = wb.SheetNames[0];
  const rows: ExcelRow[] = XLSX.utils.sheet_to_json(wb.Sheets[sheetName]);

  const products = normalizeProducts(rows);
  console.log(`Прочитано ${rows.length} рядків → ${products.length} товарів`);

  const outPath = path.join(process.cwd(), 'public', 'products.json');
  fs.writeFileSync(outPath, JSON.stringify(products, null, 2), 'utf-8');
  console.log('✓ Збережено в', outPath);

  if (upload) {
    await uploadToApi(products);
  } else {
    console.log('');
    console.log('Щоб залити на сайт, запусти з --upload та ADMIN_TOKEN:');
    console.log('  ADMIN_TOKEN=твій_пароль npx tsx scripts/import-products-from-xlsx.ts --upload');
  }
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
