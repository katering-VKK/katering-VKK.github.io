import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Search, X, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useStore } from '../store';
import { useProducts } from '../context/ProductsContext';
import { getProductGradient } from '../data/products';

export const SearchOverlay = () => {
  const { products } = useProducts();
  const { isSearchOpen, setSearchOpen, addToCart, navigateToCategory } = useStore();
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isSearchOpen) {
      setQuery('');
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isSearchOpen]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSearchOpen(false);
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [setSearchOpen]);

  const results = useMemo(() => {
    if (query.length < 2) return [];
    const q = query.toLowerCase();
    return products.filter(p =>
      p.name.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q) ||
      p.tag.toLowerCase().includes(q)
    ).slice(0, 12);
  }, [query, products]);

  const quickCategories = ['Книги', 'Іграшки', 'Творчість', 'Настільні ігри', 'Власне виробництво'];

  return (
    <AnimatePresence>
      {isSearchOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[70]"
            onClick={() => setSearchOpen(false)}
          />
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed top-0 left-0 right-0 z-[80] max-h-[85vh] overflow-hidden"
          >
            <div className="bg-white max-w-3xl mx-auto mt-4 sm:mt-16 rounded-2xl shadow-2xl overflow-hidden mx-4 sm:mx-auto">
              <div className="flex items-center gap-4 px-6 py-5 border-b border-gray-100">
                <Search className="w-5 h-5 text-gray-400 shrink-0" />
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Шукати товари..."
                  className="flex-1 text-lg outline-none placeholder:text-gray-300 bg-transparent"
                />
                <div className="flex items-center gap-2">
                  <kbd className="hidden sm:block text-[10px] font-mono text-gray-400 border border-gray-200 rounded px-1.5 py-0.5">ESC</kbd>
                  <button
                    onClick={() => setSearchOpen(false)}
                    className="p-1.5 hover:bg-gray-100 rounded-full transition-colors"
                  >
                    <X className="w-5 h-5 text-gray-400" />
                  </button>
                </div>
              </div>

              <div className="max-h-[60vh] overflow-y-auto">
                {query.length < 2 ? (
                  <div className="p-6">
                    <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4">Категорії</p>
                    <div className="flex flex-wrap gap-2">
                      {quickCategories.map(cat => (
                        <button
                          key={cat}
                          onClick={() => { navigateToCategory(cat); setSearchOpen(false); }}
                          className="px-4 py-2.5 bg-gray-50 hover:bg-gray-100 rounded-full text-sm font-medium text-gray-700 transition-colors flex items-center gap-2 group"
                        >
                          {cat}
                          <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </button>
                      ))}
                    </div>
                    <p className="text-xs text-gray-300 mt-6 text-center">Введіть щонайменше 2 символи для пошуку</p>
                  </div>
                ) : results.length === 0 ? (
                  <div className="p-12 text-center text-gray-400">
                    <Search className="w-10 h-10 mx-auto mb-3 opacity-20" />
                    <p className="font-medium">Нічого не знайдено за запитом "{query}"</p>
                    <p className="text-sm mt-1">Спробуйте інші ключові слова</p>
                  </div>
                ) : (
                  <div className="p-4">
                    <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3 px-2">
                      Знайдено {results.length} {results.length === 12 ? '+' : ''} товарів
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {results.map(product => (
                        <button
                          key={product.id}
                          onClick={() => { addToCart(product); setSearchOpen(false); }}
                          className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors text-left group"
                        >
                          <div className="w-14 h-14 rounded-xl shrink-0 overflow-hidden">
                            {product.image ? (
                              <img src={product.image} alt="" className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center" style={{ background: getProductGradient(product.id, product.category) }}>
                                <span className="text-white/40 text-xl font-black select-none">{product.name.charAt(0)}</span>
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-[10px] font-medium text-gray-400 uppercase tracking-wider">{product.category}</p>
                            <p className="text-sm font-bold truncate group-hover:text-purple-600 transition-colors">{product.name}</p>
                            <p className="text-sm text-gray-500 font-semibold">{product.price}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
