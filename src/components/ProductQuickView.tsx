import React, { useEffect, useMemo } from 'react';
import { X, ShoppingBag, Heart, Minus, Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useStore } from '../store';
import { useProducts } from '../context/ProductsContext';
import type { Product } from '../data/products';
import { ProductImage } from './ProductImage';

export const ProductQuickView = () => {
  const { products } = useProducts();
  const { quickViewProduct, setQuickViewProduct, addToCart, toggleFavorite, isFavorite } = useStore();
  const [qty, setQty] = React.useState(1);

  const relatedProducts = useMemo(() => {
    if (!quickViewProduct) return [];
    return products
      .filter(p => p.category === quickViewProduct.category && p.id !== quickViewProduct.id)
      .slice(0, 4);
  }, [quickViewProduct, products]);

  useEffect(() => {
    setQty(1);
  }, [quickViewProduct?.id]);

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

  const handleAddToCart = () => {
    addToCart(product, qty);
    setQuickViewProduct(null);
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[75] flex items-center justify-center p-3 sm:p-4 overflow-y-auto overscroll-contain"
        onClick={() => setQuickViewProduct(null)}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl w-[calc(100vw-1.5rem)] max-w-2xl overflow-y-auto overflow-x-hidden my-4 sm:my-8 max-h-[calc(100dvh-2rem)] flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex flex-col sm:flex-row flex-1 min-h-0 overflow-hidden shrink-0">
            <div className="w-full h-[min(40vw,180px)] sm:h-auto sm:w-[45%] sm:aspect-square sm:min-h-0 flex items-center justify-center shrink-0 overflow-hidden rounded-t-2xl sm:rounded-none">
              <ProductImage product={product} className="w-full h-full" imgClassName="w-full h-full object-cover" />
            </div>
            <div className="p-4 sm:p-8 flex flex-col flex-1 min-w-0">
              <div className="flex justify-between items-start gap-3 mb-3">
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-1">{product.category}</p>
                  <h3 className="text-lg sm:text-xl font-bold leading-tight break-words">{product.name}</h3>
                </div>
                <button
                  onClick={() => setQuickViewProduct(null)}
                  className="p-2.5 -m-2.5 hover:bg-gray-100 rounded-full transition-colors shrink-0 touch-manipulation"
                  aria-label="Закрити"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              {product.tag && (
                <span className="inline-flex self-start px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-gray-100 text-gray-700 mb-4">
                  {product.tag}
                </span>
              )}
              <p className="text-2xl font-bold text-gray-900 mb-4">{product.price}</p>

              {/* Quantity */}
              <div className="flex items-center gap-3 mb-6">
                <span className="text-sm font-medium text-gray-500">Кількість:</span>
                <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden">
                  <button
                    onClick={() => setQty(Math.max(1, qty - 1))}
                    className="w-10 h-10 flex items-center justify-center hover:bg-gray-50 transition-colors"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="w-12 h-10 flex items-center justify-center font-bold text-sm border-x border-gray-200">{qty}</span>
                  <button
                    onClick={() => setQty(Math.min(99, qty + 1))}
                    className="w-10 h-10 flex items-center justify-center hover:bg-gray-50 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="flex gap-2 sm:gap-3 mt-auto pt-2">
                <button
                  onClick={handleAddToCart}
                  className="flex-1 min-w-0 flex items-center justify-center gap-2 bg-black text-white py-3 sm:py-3.5 rounded-xl font-bold text-sm uppercase tracking-wider hover:bg-gray-800 transition-colors touch-manipulation"
                >
                  <ShoppingBag className="w-4 h-4 shrink-0" />
                  <span className="truncate">В кошик{qty > 1 ? ` (${qty})` : ''}</span>
                </button>
                <button
                  onClick={() => toggleFavorite(product.id)}
                  className={`p-3 sm:p-3.5 rounded-xl border-2 transition-all shrink-0 touch-manipulation ${
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

          {/* Related products */}
          {relatedProducts.length > 0 && (
            <div className="border-t border-gray-100 p-4 sm:p-6 shrink-0">
              <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">Схожі товари</p>
              <div className="flex gap-3 overflow-x-auto pb-1 -mx-1 sm:mx-0 sm:grid sm:grid-cols-4 sm:overflow-visible scrollbar-hide">
                {relatedProducts.map((p: Product) => (
                  <button
                    key={p.id}
                    onClick={() => setQuickViewProduct(p)}
                    className="flex flex-col items-center gap-2 group text-left shrink-0 w-[140px] sm:w-full sm:min-w-0"
                  >
                    <div className="w-full aspect-square rounded-xl overflow-hidden transition-transform group-hover:scale-105 group-active:scale-95">
                      <ProductImage product={p} className="w-full h-full" imgClassName="w-full h-full object-cover" letterSize="sm" />
                    </div>
                    <p className="text-xs font-bold truncate w-full">{p.name}</p>
                    <p className="text-xs font-semibold text-gray-500">{p.price}</p>
                  </button>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
