import { existsSync, readFileSync, writeFileSync } from 'fs';
import { allProducts } from '../src/data/products';

const path = 'public/products.json';
if (!existsSync(path)) {
  writeFileSync(path, JSON.stringify(allProducts, null, 2));
  console.log('Created initial products.json with', allProducts.length, 'products');
} else {
  try {
    const current = JSON.parse(readFileSync(path, 'utf-8'));
    if (!Array.isArray(current) || current.length === 0) {
      writeFileSync(path, JSON.stringify(allProducts, null, 2));
      console.log('Initialized empty products.json');
    } else {
      console.log('Keeping existing products.json with', current.length, 'products (admin edits preserved)');
    }
  } catch {
    writeFileSync(path, JSON.stringify(allProducts, null, 2));
    console.log('Reset corrupted products.json');
  }
}
