import type { Product } from '../data/products';

export const DEFAULT_PRODUCT_UNITS = 1;

const CATEGORY_KEYWORDS: Array<[string, string[]]> = [
  ['Книги', ['книга', 'книж', 'енциклопед', 'буквар', 'прописи', 'віммельбух', 'розмальов']],
  ['Іграшки', ['іграш', 'конструктор', 'ляльк', 'машин', 'пазл', 'lego', 'сортер', 'мʼяк', "м'як"]],
  ['Власне виробництво', ['дерев', 'іменн', 'подушка', 'плед', 'бізіборд', 'ручна', 'власн']],
  ['Творчість', ['фарб', 'ліплен', 'пластилін', 'мозаїк', 'аплікац', 'орігамі', 'слайм', 'творч']],
  ['Настільні ігри', ['настіль', 'гра ', 'шахи', 'шашки', 'лото', 'доміно', 'мафія', 'uno', 'уно']],
];

const TAG_KEYWORDS: Array<[string, string[]]> = [
  ['Хіт продажу', ['хіт', 'hit', 'топ']],
  ['Акція', ['акція', 'sale', 'знижка', 'розпродаж']],
  ['New', ['new', 'новинка', 'нове']],
  ['Сезонні', ['сезон']],
];

type ProductDraft = Partial<Product> & { name?: string };

export function productUnits(product: Pick<Product, 'units'>): number {
  const n = Number(product.units);
  return Number.isFinite(n) && n > 0 ? Math.max(1, Math.round(n)) : DEFAULT_PRODUCT_UNITS;
}

function isLikelyArticle(value: string): boolean {
  const token = value.trim();
  return token.length >= 3 && token.length <= 32 && /\d/.test(token) && /^[A-Za-zА-Яа-яІіЇїЄєҐґ0-9._/-]+$/.test(token);
}

export function productArticle(product: Pick<Product, 'article'> & Partial<Pick<Product, 'name'>>): string {
  const direct = String(product.article ?? '').trim();
  if (direct) return direct;
  if (product.name) return parseProductDetailsFromName(product.name).article;
  return '';
}

export function productDisplayName(product: Pick<Product, 'name'> & Partial<Pick<Product, 'article'>>): string {
  return parseProductDetailsFromName(product.name).name;
}

export function formatProductMeta(product: Pick<Product, 'article' | 'units'> & Partial<Pick<Product, 'name'>>): string {
  const parts: string[] = [];
  const parsed = product.name ? parseProductDetailsFromName(product.name) : { details: [] as string[] };
  const article = productArticle(product);
  if (article) parts.push(`Арт. ${article}`);
  if ('details' in parsed) parts.push(...parsed.details);
  const units = productUnits(product);
  if (units > 1) parts.push(`${units} од.`);
  return Array.from(new Set(parts.filter(Boolean))).join(' · ');
}

function detectCategory(text: string, fallback: string): string {
  const lower = text.toLowerCase();
  for (const [category, words] of CATEGORY_KEYWORDS) {
    if (words.some(word => lower.includes(word))) return category;
  }
  return fallback;
}

function detectTag(text: string): string {
  const lower = text.toLowerCase();
  for (const [tag, words] of TAG_KEYWORDS) {
    if (words.some(word => lower.includes(word))) return tag;
  }
  return '';
}

function normalizePrice(value: unknown): string {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return `${Math.max(0, Math.round(value)).toLocaleString('uk-UA')} ₴`;
  }
  const raw = String(value ?? '').trim();
  const match = raw.match(/(\d{1,3}(?:[\s\u00a0]\d{3})+|\d+)(?:[,.]\d{1,2})?\s*(?:₴|грн\.?|uah)?/i);
  if (!match) return '';
  const n = parseInt(match[1].replace(/[\s\u00a0]/g, ''), 10);
  return Number.isFinite(n) ? `${n.toLocaleString('uk-UA')} ₴` : '';
}

export function parseProductDetailsFromName(rawName: string) {
  const raw = String(rawName ?? '').trim();
  let name = raw;
  let article = '';
  let units = DEFAULT_PRODUCT_UNITS;
  let price = '';
  const details: string[] = [];

  const semicolonParts = raw.split(';').map(part => part.trim()).filter(Boolean);
  if (semicolonParts.length > 1) {
    const first = semicolonParts[0].replace(/[.;:,|/-]+$/g, '').trim();
    if (isLikelyArticle(first)) {
      article = first;
      name = semicolonParts[1] ?? '';
      details.push(...semicolonParts.slice(2));
    } else {
      name = semicolonParts[0];
      details.push(...semicolonParts.slice(1));
    }
  }

  const leadingPatterns = [
    /^([A-Za-zА-Яа-яІіЇїЄєҐґ0-9._/-]{3,32})\s*(?:[;:|]|\.\.?|[-–—])\s+(.+)$/,
    /^([0-9]{3,}[-/][0-9]+)\s*(?=[A-Za-zА-Яа-яІіЇїЄєҐґ])(.+)$/,
    /^([0-9]{3,}[A-Za-zА-Яа-яІіЇїЄєҐґ]?)\s+(.+)$/,
  ];
  for (const pattern of leadingPatterns) {
    const leadingMatch = name.match(pattern);
    if (leadingMatch && isLikelyArticle(leadingMatch[1])) {
      article = article || leadingMatch[1].replace(/[.;:,|/-]+$/g, '').trim();
      name = leadingMatch[2].trim();
      break;
    }
  }

  const articlePatterns = [
    /\b(?:арт\.?|артикул|sku|код)\s*[:#№-]?\s*([A-Za-zА-Яа-яІіЇїЄєҐґ0-9._/-]{2,})/i,
    /(?:^|[\s[(])(?:№|#)\s*([A-Za-zА-Яа-яІіЇїЄєҐґ0-9._/-]{2,})/i,
  ];
  if (!article) {
    for (const pattern of articlePatterns) {
      const match = name.match(pattern);
      if (match) {
        article = match[1].trim();
        name = name.replace(match[0], ' ');
        break;
      }
    }
  }

  const trailingCodePattern = /(?:^|[\s,;])([0-9]{4,}[A-Za-zА-Яа-яІіЇїЄєҐґ]?)(?:\s*\(([^)]{1,24})\))?$/;
  const trailingCodeMatch = name.match(trailingCodePattern);
  if (trailingCodeMatch) {
    const code = trailingCodeMatch[1].trim();
    if (isLikelyArticle(code) && code !== article) {
      details.push(`Код ${code}${trailingCodeMatch[2] ? ` (${trailingCodeMatch[2].trim()})` : ''}`);
      name = name.slice(0, trailingCodeMatch.index).trim();
    }
  }

  const unitMatch = name.match(/(?:^|[\s,;])(?:x|х|×)\s*(\d{1,3})\s*(?:шт\.?|од\.?|pcs?)?\b/i)
    || name.match(/(?:^|[\s,;])(\d{1,3})\s*(?:шт\.?|од\.?|pcs?)\b/i);
  if (unitMatch) {
    const parsed = parseInt(unitMatch[1], 10);
    if (Number.isFinite(parsed) && parsed > 0) units = parsed;
    name = name.replace(unitMatch[0], ' ');
  }

  const priceMatch = name.match(/(?:^|[\s,;])(\d{1,3}(?:[\s\u00a0]\d{3})+|\d+)(?:[,.]\d{1,2})?\s*(?:₴|грн\.?|uah)\b/i);
  if (priceMatch) {
    price = normalizePrice(priceMatch[0]);
    name = name.replace(priceMatch[0], ' ');
  }

  name = name
    .replace(/\s*[–—|;/]\s*/g, ' ')
    .replace(/\s+-\s+/g, ' ')
    .replace(/([а-яіїєґa-z])\.([А-ЯІЇЄҐA-Z])/g, '$1. $2')
    .replace(/([A-Za-zА-Яа-яІіЇїЄєҐґ])\(/g, '$1 (')
    .replace(/\s+([:,.!?])/g, '$1')
    .replace(/([:,.!?])(?=[^\s)\]])/g, '$1 ')
    .replace(/\s{2,}/g, ' ')
    .trim();

  return {
    name: name || raw.trim(),
    article,
    units,
    price,
    details: details
      .map(detail => String(detail).replace(/[;|]+$/g, '').replace(/\s{2,}/g, ' ').trim())
      .filter(Boolean),
  };
}

export function normalizeProductForStorage(product: Product): Product {
  const parsed = parseProductDetailsFromName(product.name);
  const article = productArticle(product) || parsed.article;
  const price = String(product.price || '').trim() || parsed.price;
  return {
    ...product,
    ...(article && { article }),
    name: parsed.name,
    price,
    units: productUnits({ units: product.units ?? parsed.units }),
  };
}

export function normalizeImportedProduct(raw: ProductDraft, index: number, defaultCategory = 'Книги'): Product | null {
  const parsed = parseProductDetailsFromName(String(raw.name ?? raw.description ?? '').trim());
  const name = String(raw.name ?? parsed.name).trim() ? parsed.name : '';
  if (!name) return null;

  const price = normalizePrice(raw.price) || parsed.price;
  if (!price) return null;

  const category = String(raw.category ?? '').trim() || detectCategory(`${name} ${raw.tag ?? ''}`, defaultCategory);
  const tag = String(raw.tag ?? '').trim() || detectTag(`${name} ${raw.description ?? ''}`);
  const article = String(raw.article ?? parsed.article ?? '').trim();
  const units = productUnits({ units: raw.units ?? parsed.units });

  return {
    id: Number(raw.id) || index + 1,
    ...(article && { article }),
    name,
    price,
    category,
    tag,
    units,
    ...(raw.description && { description: String(raw.description).trim() }),
    ...(raw.image && typeof raw.image === 'string' && !raw.image.startsWith('data:') && { image: raw.image }),
  };
}

export function parseDelimitedProducts(text: string, defaultCategory = 'Книги'): Product[] {
  const lines = text.split(/\r?\n/).map(line => line.trim()).filter(Boolean);
  if (lines.length === 0) return [];

  const headerCells = splitLine(lines[0]).map(h => h.toLowerCase());
  const hasHeader = headerCells.some(h => ['name', 'назва', 'товар', 'price', 'ціна', 'артикул', 'article', 'sku'].includes(h));
  const headers = hasHeader ? headerCells : [];
  const rows = hasHeader ? lines.slice(1) : lines;

  return rows
    .map((line, index) => {
      const cells = splitLine(line);
      const draft: ProductDraft = hasHeader
        ? {
            name: pickByHeader(cells, headers, ['name', 'назва', 'товар']),
            price: pickByHeader(cells, headers, ['price', 'ціна']),
            category: pickByHeader(cells, headers, ['category', 'категорія']),
            tag: pickByHeader(cells, headers, ['tag', 'тег']),
            article: pickByHeader(cells, headers, ['article', 'артикул', 'sku', 'код']),
            units: Number(pickByHeader(cells, headers, ['units', 'юніти', 'кількість', 'qty'])),
            description: pickByHeader(cells, headers, ['description', 'опис']),
            image: pickByHeader(cells, headers, ['image', 'фото']),
          }
        : { name: line };
      return normalizeImportedProduct(draft, index, defaultCategory);
    })
    .filter((p): p is Product => Boolean(p));
}

function splitLine(line: string): string[] {
  const separator = line.includes('\t') ? '\t' : line.includes(';') ? ';' : ',';
  const cells: string[] = [];
  let current = '';
  let quoted = false;
  for (const ch of line) {
    if (ch === '"') {
      quoted = !quoted;
    } else if (ch === separator && !quoted) {
      cells.push(current.trim());
      current = '';
    } else {
      current += ch;
    }
  }
  cells.push(current.trim());
  return cells.map(cell => cell.replace(/^"|"$/g, '').trim());
}

function pickByHeader(cells: string[], headers: string[], names: string[]) {
  const idx = headers.findIndex(h => names.includes(h));
  return idx >= 0 ? cells[idx] : '';
}
