import React, { useState, useEffect, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Filter, ShoppingBag, Check, X, Heart, ArrowUpDown } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useProducts } from '../context/ProductsContext';
import { categories, parsePrice } from '../data/products';
import { useStore } from '../store';
import { ProductImage } from './ProductImage';

const ITEMS_PER_PAGE = 12;
type SortOption = 'default' | 'price-asc' | 'price-desc' | 'name';

export const ProductGrid = () => {
  const { products, loading } = useProducts();
  const { activeCategory, setActiveCategory, activeTag, setActiveTag, addToCart, cart, toggleFavorite, isFavorite, setQuickViewProduct } = useStore();
  const [currentPage, setCurrentPage] = useState(1);
  const [addedId, setAddedId] = useState<number | null>(null);
  const [sortBy, setSortBy] = useState<SortOption>('default');

  useEffect(() => {
    setCurrentPage(1);
  }, [activeCategory, activeTag, sortBy]);

  const filteredProducts = useMemo(() => {
    let list = products.filter(product => {
      if (activeCategory === 'Хіт продажу') return product.tag === 'Хіт продажу';
      const catMatch = activeCategory === 'Всі' || product.category === activeCategory;
      const tagMatch = !activeTag || product.tag === activeTag;
      return catMatch && tagMatch;
    });
    if (sortBy === 'price-asc') list = [...list].sort((a, b) => parsePrice(a.price) - parsePrice(b.price));
    else if (sortBy === 'price-desc') list = [...list].sort((a, b) => parsePrice(b.price) - parsePrice(a.price));
    else if (sortBy === 'name') list = [...list].sort((a, b) => a.name.localeCompare(b.name));
    return list;
  }, [products, activeCategory, activeTag, sortBy]);

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

  const handleAddToCart = (product: typeof products[0]) => {
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
    <section id="product-grid" className="py-24 px-4 sm:px-6 max-w-[1920px] mx-auto relative overflow-hidden min-h-screen bg-mesh">
      <div className="absolute top-20 right-0 w-96 h-96 bg-violet-200/30 rounded-full blur-[100px] -z-10"></div>
      <div className="absolute bottom-1/4 left-0 w-72 h-72 bg-amber-100/40 rounded-full blur-[80px] -z-10"></div>

      <div className="flex flex-col md:flex-row justify-between items-end mb-14 gap-8">
        <div>
          <h2 className="text-5xl md:text-6xl font-display font-extrabold tracking-tight text-gray-900">Каталог</h2>
          <p className="text-gray-500 text-base mt-3 font-medium">{filteredProducts.length} товарів</p>
        </div>
        
        <div className="flex flex-wrap gap-2.5">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => handleCategoryChange(category)}
              className={`px-6 py-3 rounded-full text-sm font-semibold transition-all duration-300 ${
                activeCategory === category
                  ? 'bg-gray-900 text-white shadow-lg shadow-gray-900/20 scale-[1.02]'
                  : 'bg-white/80 text-gray-600 hover:bg-gray-100 hover:text-gray-900 border border-gray-100'
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* Sort */}
      <div className="flex flex-wrap items-center gap-4 mb-10">
        <div className="flex items-center gap-2">
          <ArrowUpDown className="w-4 h-4 text-gray-400" />
          <span className="text-sm font-medium text-gray-500">Сортування:</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {[
            { value: 'default' as SortOption, label: 'За замовчуванням' },
            { value: 'price-asc' as SortOption, label: 'Ціна ↑' },
            { value: 'price-desc' as SortOption, label: 'Ціна ↓' },
            { value: 'name' as SortOption, label: 'За назвою' },
          ].map(opt => (
            <button
              key={opt.value}
              onClick={() => setSortBy(opt.value)}
              className={`px-4 py-2.5 rounded-full text-sm font-medium transition-all ${
                sortBy === opt.value ? 'bg-gray-900 text-white shadow-md' : 'bg-white/80 text-gray-600 hover:bg-gray-100 border border-gray-100'
              }`}
            >
              {opt.label}
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

      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-x-5 gap-y-10">
          {[...Array(12)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="aspect-[3/4] mb-4 rounded-2xl bg-gray-100" />
              <div className="h-3 bg-gray-100 rounded w-1/3 mb-2" />
              <div className="h-4 bg-gray-100 rounded w-full mb-2" />
              <div className="h-4 bg-gray-100 rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : (
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
              <div className="relative aspect-[3/4] mb-4 overflow-hidden rounded-[var(--radius-card)] border border-gray-100 group-hover:border-violet-200/60 shadow-card group-hover:shadow-card-hover group-hover:-translate-y-3 transition-all duration-500">
                {product.tag && (
                  <span className={`absolute top-3 left-3 text-[10px] font-bold px-3 py-1.5 uppercase tracking-wider z-10 rounded-full shadow-md ${
                    product.tag === 'Хіт продажу' ? 'bg-amber-400 text-black' :
                    product.tag === 'New' ? 'bg-emerald-400 text-black' :
                    'bg-white/95 backdrop-blur-sm text-gray-800'
                  }`}>
                    {product.tag}
                  </span>
                )}
                <div className="w-full h-full transition-transform duration-700 group-hover:scale-110 flex items-center justify-center relative overflow-hidden">
                  <ProductImage product={product} className="absolute inset-0 w-full h-full" imgClassName="w-full h-full object-cover" />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                
                <button
                  onClick={(e) => { e.stopPropagation(); toggleFavorite(product.id); }}
                  className={`absolute top-3 right-3 p-2.5 rounded-full transition-all duration-300 shadow-lg z-20 ${
                    isFavorite(product.id)
                      ? 'bg-red-500 text-white opacity-100'
                      : 'bg-white/90 backdrop-blur-sm text-gray-400 sm:opacity-0 sm:group-hover:opacity-100 opacity-100 hover:text-red-500'
                  }`}
                >
                  <Heart className={`w-4 h-4 ${isFavorite(product.id) ? 'fill-white' : ''}`} />
                </button>

                <button
                  onClick={(e) => { e.stopPropagation(); handleAddToCart(product); }}
                  className={`absolute bottom-3 right-3 p-3 rounded-full sm:opacity-0 sm:translate-y-4 sm:group-hover:opacity-100 sm:group-hover:translate-y-0 opacity-100 translate-y-0 transition-all duration-300 shadow-lg z-20 ${
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
              <div className="px-1 py-3">
                <p className="text-xs font-semibold text-violet-600 uppercase tracking-wider mb-1.5">{product.category}</p>
                <h3 className="text-base font-bold mb-2 group-hover:text-violet-600 transition-colors leading-snug line-clamp-2">{product.name}</h3>
                <div className="flex items-center justify-between">
                  <p className="text-lg font-bold text-gray-900">{product.price}</p>
                  {isInCart(product.id) && (
                    <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">В кошику</span>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>
      )}

      {!loading && currentProducts.length === 0 && (
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
                      ? 'bg-gray-900 text-white shadow-lg scale-110'
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
