import React from 'react';
import { X, Heart, ShoppingBag, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useStore } from '../store';
import { useProducts } from '../context/ProductsContext';
import { ProductImage } from './ProductImage';

export const FavoritesDrawer = () => {
  const { favorites, isFavOpen, setFavOpen, toggleFavorite, addToCart } = useStore();

  const { products } = useProducts();
  const favProducts = products.filter(p => favorites.includes(p.id));

  return (
    <AnimatePresence>
      {isFavOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[70]"
            onClick={() => setFavOpen(false)}
          />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed top-0 right-0 h-full w-full max-w-md bg-white z-[80] flex flex-col shadow-2xl"
          >
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <Heart className="w-5 h-5 text-red-500 fill-red-500" />
                <h2 className="text-lg font-bold uppercase tracking-wider">Обране</h2>
                <span className="bg-red-100 text-red-600 text-xs font-bold px-2.5 py-0.5 rounded-full">{favProducts.length}</span>
              </div>
              <button
                onClick={() => setFavOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {favProducts.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-gray-400 gap-4 px-6">
                <Heart className="w-16 h-16 opacity-20" />
                <p className="text-lg font-medium">Список обраного порожній</p>
                <p className="text-sm text-center">Натисніть серце на картці товару</p>
                <button
                  onClick={() => setFavOpen(false)}
                  className="mt-4 bg-black text-white px-8 py-3 rounded-full font-bold text-sm uppercase tracking-wider hover:bg-gray-800 transition-colors"
                >
                  До каталогу
                </button>
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-3">
                <AnimatePresence mode="popLayout">
                  {favProducts.map(product => (
                    <motion.div
                      key={product.id}
                      layout
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20, height: 0 }}
                      className="flex gap-4 bg-gray-50 rounded-2xl p-3"
                    >
                      <div className="w-20 h-20 rounded-xl shrink-0 overflow-hidden">
                        <ProductImage product={product} className="w-full h-full" imgClassName="w-full h-full object-cover" letterSize="sm" />
                      </div>
                      <div className="flex-1 min-w-0 flex flex-col justify-between">
                        <div>
                          <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">{product.category}</p>
                          <h4 className="text-sm font-bold leading-tight truncate">{product.name}</h4>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-bold">{product.price}</span>
                          <button
                            onClick={() => { addToCart(product); setFavOpen(false); }}
                            className="flex items-center gap-1.5 bg-black text-white px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider hover:bg-gray-800 transition-colors"
                          >
                            <ShoppingBag className="w-3 h-3" />
                            В кошик
                          </button>
                        </div>
                      </div>
                      <button
                        onClick={() => toggleFavorite(product.id)}
                        className="self-start p-1.5 text-red-400 hover:text-red-600 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
