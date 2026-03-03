import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Filter, ShoppingBag, Check, X, Heart } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { allProducts, categories, getProductGradient } from '../data/products';
import { useStore } from '../store';

const ITEMS_PER_PAGE = 12;

export const ProductGrid = () => {
  const { activeCategory, setActiveCategory, activeTag, setActiveTag, addToCart, cart, toggleFavorite, isFavorite, setQuickViewProduct } = useStore();
  const [currentPage, setCurrentPage] = useState(1);
  const [addedId, setAddedId] = useState<number | null>(null);

  useEffect(() => {
    setCurrentPage(1);
  }, [activeCategory, activeTag]);

  const filteredProducts = allProducts.filter(product => {
    if (activeCategory === 'Хіт продажу') return product.tag === 'Хіт продажу';
    const catMatch = activeCategory === 'Всі' || product.category === activeCategory;
    const tagMatch = !activeTag || product.tag === activeTag;
    return catMatch && tagMatch;
  });

  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const currentProducts = filteredProducts.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const handleCategoryChange = (category: string) => {
    setActiveCategory(category);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    document.getElementById('product-grid')?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleAddToCart = (product: typeof allProducts[0]) => {
    addToCart(product);
    setAddedId(product.id);
    setTimeout(() => setAddedId(null), 1200);
  };

  const isInCart = (id: number) => cart.some(i => i.product.id === id);

  const maxVisiblePages = 7;
  const getVisiblePages = () => {
    if (totalPages <= maxVisiblePages) return Array.from({ length: totalPages }, (_, i) => i + 1);
    const half = Math.floor(maxVisiblePages / 2);
    let start = Math.max(1, currentPage - half);
    const end = Math.min(totalPages, start + maxVisiblePages - 1);
    if (end - start < maxVisiblePages - 1) start = Math.max(1, end - maxVisiblePages + 1);
    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  };

  return (
    <section id="product-grid" className="py-20 px-6 max-w-[1920px] mx-auto relative overflow-hidden min-h-screen">
      <div className="absolute top-20 right-0 w-64 h-64 bg-purple-100 rounded-full blur-3xl -z-10 opacity-50"></div>

      <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
        <div>
          <h2 className="text-4xl md:text-5xl font-display font-bold tracking-tight uppercase text-gray-900">Каталог</h2>
          <p className="text-gray-400 text-sm mt-2">{filteredProducts.length} товарів</p>
        </div>
        
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

      {/* Active tag indicator */}
      {activeTag && (
        <div className="mb-8 flex items-center gap-3">
          <span className="text-sm text-gray-500">Фільтр:</span>
          <button
            onClick={() => setActiveTag(null)}
            className="inline-flex items-center gap-2 bg-purple-100 text-purple-800 px-4 py-2 rounded-full text-sm font-medium hover:bg-purple-200 transition-colors"
          >
            {activeTag}
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      <motion.div 
        layout
        className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-x-5 gap-y-10"
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
              onClick={() => setQuickViewProduct(product)}
            >
              <div className="relative aspect-[3/4] mb-4 overflow-hidden rounded-2xl shadow-sm group-hover:shadow-xl transition-all duration-500">
                {product.tag && (
                  <span className={`absolute top-3 left-3 text-[10px] font-bold px-3 py-1.5 uppercase tracking-wider z-10 rounded-full ${
                    product.tag === 'Хіт продажу' ? 'bg-yellow-400 text-black' :
                    product.tag === 'New' ? 'bg-emerald-400 text-black' :
                    'bg-white/90 backdrop-blur-sm text-black'
                  }`}>
                    {product.tag}
                  </span>
                )}
                <div
                  className="w-full h-full transition-transform duration-700 group-hover:scale-110 flex items-center justify-center"
                  style={{ background: getProductGradient(product.id, product.category) }}
                >
                  <span className="text-white/30 text-6xl font-black select-none">
                    {product.name.charAt(0)}
                  </span>
                </div>
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-300"></div>
                
                <button
                  onClick={(e) => { e.stopPropagation(); toggleFavorite(product.id); }}
                  className={`absolute top-3 right-3 p-2.5 rounded-full transition-all duration-300 shadow-lg z-20 ${
                    isFavorite(product.id)
                      ? 'bg-red-500 text-white opacity-100'
                      : 'bg-white/90 backdrop-blur-sm text-gray-400 opacity-0 group-hover:opacity-100 hover:text-red-500'
                  }`}
                >
                  <Heart className={`w-4 h-4 ${isFavorite(product.id) ? 'fill-white' : ''}`} />
                </button>

                <button
                  onClick={(e) => { e.stopPropagation(); handleAddToCart(product); }}
                  className={`absolute bottom-3 right-3 p-3 rounded-full opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 shadow-lg z-20 ${
                    addedId === product.id
                      ? 'bg-emerald-500 text-white'
                      : isInCart(product.id)
                      ? 'bg-black text-white hover:bg-gray-800'
                      : 'bg-white text-black hover:bg-black hover:text-white'
                  }`}
                >
                  {addedId === product.id ? (
                    <Check className="w-[18px] h-[18px]" />
                  ) : (
                    <ShoppingBag className="w-[18px] h-[18px]" />
                  )}
                </button>
              </div>
              <div className="px-1">
                <p className="text-[11px] font-medium text-gray-400 uppercase tracking-wider mb-1">{product.category}</p>
                <h3 className="text-sm font-bold mb-1 group-hover:text-purple-600 transition-colors leading-tight line-clamp-2">{product.name}</h3>
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-gray-900">{product.price}</p>
                  {isInCart(product.id) && (
                    <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">В кошику</span>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>

      {currentProducts.length === 0 && (
        <div className="text-center py-20 text-gray-500">
          <Filter className="w-12 h-12 mx-auto mb-4 opacity-20" />
          <p>Товарів у цій категорії поки немає.</p>
          {activeTag && (
            <button
              onClick={() => setActiveTag(null)}
              className="mt-4 text-sm text-purple-600 underline hover:text-purple-800"
            >
              Скинути фільтр "{activeTag}"
            </button>
          )}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex flex-col items-center mt-16 gap-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="p-3 rounded-full border border-gray-200 text-gray-600 hover:bg-gray-100 hover:text-black disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-300"
              aria-label="Previous page"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            
            <div className="flex gap-1.5">
              {getVisiblePages().map((page) => (
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
              className="p-3 rounded-full border border-gray-200 text-gray-600 hover:bg-gray-100 hover:text-black disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-300"
              aria-label="Next page"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
          
          <div className="text-xs text-gray-400 font-medium tracking-widest uppercase">
            Сторінка {currentPage} з {totalPages} &middot; {filteredProducts.length} товарів
          </div>
        </div>
      )}
    </section>
  );
};
