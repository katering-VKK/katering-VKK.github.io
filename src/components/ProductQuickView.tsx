import React, { useEffect } from 'react';
import { X, ShoppingBag, Heart } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useStore } from '../store';
import { getProductGradient } from '../data/products';

export const ProductQuickView = () => {
  const { quickViewProduct, setQuickViewProduct, addToCart, toggleFavorite, isFavorite } = useStore();

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setQuickViewProduct(null);
    };
    if (quickViewProduct) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleEsc);
    }
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleEsc);
    };
  }, [quickViewProduct, setQuickViewProduct]);

  if (!quickViewProduct) return null;

  const product = quickViewProduct;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[75] flex items-center justify-center p-4"
        onClick={() => setQuickViewProduct(null)}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex flex-col sm:flex-row">
            <div
              className="aspect-square sm:w-1/2 flex items-center justify-center shrink-0"
              style={{ background: getProductGradient(product.id, product.category) }}
            >
              <span className="text-white/30 text-8xl font-black select-none">
                {product.name.charAt(0)}
              </span>
            </div>
            <div className="p-6 sm:p-8 flex flex-col flex-1">
              <div className="flex justify-between items-start gap-4 mb-4">
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-1">{product.category}</p>
                  <h3 className="text-xl font-bold leading-tight">{product.name}</h3>
                </div>
                <button
                  onClick={() => setQuickViewProduct(null)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors shrink-0"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              {product.tag && (
                <span className="inline-flex self-start px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-gray-100 text-gray-700 mb-4">
                  {product.tag}
                </span>
              )}
              <p className="text-2xl font-bold text-gray-900 mb-6">{product.price}</p>
              <div className="flex gap-3 mt-auto">
                <button
                  onClick={() => { addToCart(product); setQuickViewProduct(null); }}
                  className="flex-1 flex items-center justify-center gap-2 bg-black text-white py-3.5 rounded-xl font-bold text-sm uppercase tracking-wider hover:bg-gray-800 transition-colors"
                >
                  <ShoppingBag className="w-4 h-4" />
                  В кошик
                </button>
                <button
                  onClick={() => toggleFavorite(product.id)}
                  className={`p-3.5 rounded-xl border-2 transition-all ${
                    isFavorite(product.id)
                      ? 'bg-red-50 border-red-200 text-red-500'
                      : 'border-gray-200 text-gray-400 hover:border-gray-300 hover:text-red-400'
                  }`}
                >
                  <Heart className={`w-5 h-5 ${isFavorite(product.id) ? 'fill-current' : ''}`} />
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
