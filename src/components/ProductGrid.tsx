import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Filter } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const allProducts = [
  {
    id: 1,
    name: 'Енциклопедія "Космос"',
    price: '450 ₴',
    image: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=800&auto=format&fit=crop',
    category: 'Книги',
    tag: 'Хіт продажу'
  },
  {
    id: 2,
    name: 'Деревʼяна ракета',
    price: '850 ₴',
    image: 'https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?q=80&w=800&auto=format&fit=crop',
    category: 'Власне виробництво',
    tag: 'New'
  },
  {
    id: 3,
    name: 'Плюшевий прибулець',
    price: '620 ₴',
    image: 'https://images.unsplash.com/photo-1559715541-5daf8a0296d0?q=80&w=800&auto=format&fit=crop',
    category: 'Іграшки',
    tag: 'Мʼякі іграшки'
  },
  {
    id: 4,
    name: 'Конструктор "Марсохід"',
    price: '1200 ₴',
    image: 'https://images.unsplash.com/photo-1585366119957-e9730b6d0f60?q=80&w=800&auto=format&fit=crop',
    category: 'Іграшки',
    tag: 'Хіт продажу'
  },
  {
    id: 5,
    name: 'Атлас Всесвіту',
    price: '550 ₴',
    image: 'https://images.unsplash.com/photo-1532012197267-da84d127e765?q=80&w=800&auto=format&fit=crop',
    category: 'Книги',
    tag: 'Топ'
  },
  {
    id: 6,
    name: 'Набір наліпок "Планети"',
    price: '120 ₴',
    image: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?q=80&w=800&auto=format&fit=crop',
    category: 'Книги',
    tag: 'Наліпки'
  },
  {
    id: 7,
    name: 'Пазл "Сонячна система"',
    price: '380 ₴',
    image: 'https://images.unsplash.com/photo-1587654780291-39c940483713?q=80&w=800&auto=format&fit=crop',
    category: 'Іграшки',
    tag: 'Пазли'
  },
  {
    id: 8,
    name: 'Костюм астронавта',
    price: '1500 ₴',
    image: 'https://images.unsplash.com/photo-1614728853913-1e22ba0e982b?q=80&w=800&auto=format&fit=crop',
    category: 'Власне виробництво',
    tag: 'Одяг'
  },
  {
    id: 9,
    name: 'Книга "Перший політ"',
    price: '320 ₴',
    image: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?q=80&w=800&auto=format&fit=crop',
    category: 'Книги',
    tag: 'Для малечі'
  },
  {
    id: 10,
    name: 'Телескоп дитячий',
    price: '2800 ₴',
    image: 'https://images.unsplash.com/photo-1562601787-2c17491b1649?q=80&w=800&auto=format&fit=crop',
    category: 'Іграшки',
    tag: 'Наука'
  },
  {
    id: 11,
    name: 'Розмальовка "Галактика"',
    price: '150 ₴',
    image: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?q=80&w=800&auto=format&fit=crop',
    category: 'Книги',
    tag: 'Розмальовки'
  },
  {
    id: 12,
    name: 'Деревʼяний супутник',
    price: '400 ₴',
    image: 'https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?q=80&w=800&auto=format&fit=crop',
    category: 'Власне виробництво',
    tag: 'Еко'
  }
];

const categories = ['Всі', 'Книги', 'Іграшки', 'Власне виробництво', 'Хіт продажу'];
const ITEMS_PER_PAGE = 8;

export const ProductGrid = () => {
  const [activeCategory, setActiveCategory] = useState('Всі');
  const [currentPage, setCurrentPage] = useState(1);

  // Filter products
  const filteredProducts = allProducts.filter(product => {
    if (activeCategory === 'Всі') return true;
    if (activeCategory === 'Хіт продажу') return product.tag === 'Хіт продажу';
    return product.category === activeCategory;
  });

  // Pagination logic
  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const currentProducts = filteredProducts.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const handleCategoryChange = (category: string) => {
    setActiveCategory(category);
    setCurrentPage(1); // Reset to first page on filter change
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // Scroll to top of grid smoothly
    document.getElementById('product-grid')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section id="product-grid" className="py-20 px-6 max-w-[1920px] mx-auto relative overflow-hidden min-h-screen">
      {/* Decorative background element */}
      <div className="absolute top-20 right-0 w-64 h-64 bg-purple-100 rounded-full blur-3xl -z-10 opacity-50"></div>

      <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
        <h2 className="text-4xl md:text-5xl font-display font-bold tracking-tight uppercase text-gray-900">Каталог</h2>
        
        {/* Filter Buttons */}
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => handleCategoryChange(category)}
              className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-300 ${
                activeCategory === category
                  ? 'bg-black text-white shadow-lg scale-105'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* Products Grid */}
      <motion.div 
        layout
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-12"
      >
        <AnimatePresence mode="popLayout">
          {currentProducts.map((product) => (
            <motion.div
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.3 }}
              key={product.id}
              className="group cursor-pointer"
            >
              <div className="relative aspect-[3/4] bg-[#f5f5f5] mb-5 overflow-hidden rounded-2xl shadow-sm group-hover:shadow-md transition-shadow">
                {product.tag && (
                  <span className={`absolute top-4 left-4 text-[10px] font-bold px-3 py-1.5 uppercase tracking-wider z-10 rounded-full ${
                    product.tag === 'Хіт продажу' ? 'bg-yellow-400 text-black' : 'bg-white text-black'
                  }`}>
                    {product.tag}
                  </span>
                )}
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-300"></div>
                
                <button className="absolute bottom-4 right-4 bg-white p-3.5 rounded-full opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 shadow-lg hover:bg-black hover:text-white z-20">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
                    <line x1="3" y1="6" x2="21" y2="6"></line>
                    <path d="M16 10a4 4 0 0 1-8 0"></path>
                  </svg>
                </button>
              </div>
              <h3 className="text-lg font-display font-bold mb-1.5 group-hover:text-purple-600 transition-colors leading-tight">{product.name}</h3>
              <p className="text-sm font-medium text-gray-500">{product.price}</p>
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>

      {/* Empty State */}
      {currentProducts.length === 0 && (
        <div className="text-center py-20 text-gray-500">
          <Filter className="w-12 h-12 mx-auto mb-4 opacity-20" />
          <p>Товарів у цій категорії поки немає.</p>
        </div>
      )}

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex flex-col items-center mt-16 gap-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="p-3 rounded-full border border-gray-200 text-gray-600 hover:bg-gray-100 hover:text-black disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-gray-600 disabled:cursor-not-allowed transition-all duration-300"
              aria-label="Previous page"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            
            <div className="flex gap-2">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => handlePageChange(page)}
                  className={`w-10 h-10 rounded-full text-sm font-bold transition-all duration-300 flex items-center justify-center ${
                    currentPage === page
                      ? 'bg-yellow-400 text-black shadow-lg scale-110'
                      : 'bg-white border border-gray-200 text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-black'
                  }`}
                >
                  {page}
                </button>
              ))}
            </div>

            <button
              onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="p-3 rounded-full border border-gray-200 text-gray-600 hover:bg-gray-100 hover:text-black disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-gray-600 disabled:cursor-not-allowed transition-all duration-300"
              aria-label="Next page"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
          
          {/* Pagination Info */}
          <div className="text-xs text-gray-400 font-medium tracking-widest uppercase">
            Показано {currentProducts.length} з {filteredProducts.length} товарів
          </div>
        </div>
      )}
    </section>
  );
};
