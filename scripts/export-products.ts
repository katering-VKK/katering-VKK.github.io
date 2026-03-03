import { writeFileSync } from 'fs';
import { allProducts } from '../src/data/products';

writeFileSync('public/products.json', JSON.stringify(allProducts, null, 2));
console.log('Exported', allProducts.length, 'products to public/products.json');
