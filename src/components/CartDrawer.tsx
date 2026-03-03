import React, { useState, useMemo } from 'react';
import { X, Minus, Plus, Trash2, ShoppingBag, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useStore } from '../store';
import { useProducts, getProductGradient, parsePrice } from '../context/ProductsContext';
import { CheckoutForm } from './CheckoutForm';

type Step = 'cart' | 'checkout' | 'thanks';

function formatPrice(n: number) {
  return n.toLocaleString('uk-UA') + ' ₴';
}

export const CartDrawer = () => {
  const { cart, cartCount, isCartOpen, setCartOpen, removeFromCart, updateQty, clearCart } = useStore();
  const { products } = useProducts();
  const cartTotal = useMemo(() => {
    const total = cart.reduce((s, i) => {
      const p = products.find(x => x.id === i.product.id) || i.product;
      return s + parsePrice(p.price) * i.qty;
    }, 0);
    return formatPrice(total);
  }, [cart, products]);
  const [step, setStep] = useState<Step>('cart');

  const handleClose = () => {
    setCartOpen(false);
    setTimeout(() => setStep('cart'), 300);
  };

  const handleOrderSuccess = () => {
    setStep('thanks');
    clearCart();
  };

  return (
    <AnimatePresence>
      {isCartOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[70]"
            onClick={handleClose}
          />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed top-0 right-0 h-full w-full max-w-md bg-white z-[80] flex flex-col shadow-2xl"
          >
            {step === 'thanks' ? (
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', damping: 15 }}
                  className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center mb-6"
                >
                  <CheckCircle className="w-10 h-10 text-emerald-600" />
                </motion.div>
                <h3 className="text-2xl font-bold mb-2">Дякуємо за замовлення!</h3>
                <p className="text-gray-500 mb-6">
                  Ми зв'яжемося з вами найближчим часом для підтвердження.
                </p>
                <button
                  onClick={handleClose}
                  className="bg-black text-white px-8 py-3 rounded-full font-bold text-sm uppercase tracking-wider hover:bg-gray-800 transition-colors"
                >
                  Закрити
                </button>
              </div>
            ) : step === 'checkout' ? (
              <CheckoutForm onBack={() => setStep('cart')} onSuccess={handleOrderSuccess} />
            ) : cart.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-gray-400 gap-4 px-6">
                <ShoppingBag className="w-16 h-16 opacity-20" />
                <p className="text-lg font-medium">Кошик порожній</p>
                <p className="text-sm text-center">Додайте товари з каталогу</p>
                <button
                  onClick={handleClose}
                  className="mt-4 bg-black text-white px-8 py-3 rounded-full font-bold text-sm uppercase tracking-wider hover:bg-gray-800 transition-colors"
                >
                  До каталогу
                </button>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between p-6 border-b border-gray-100">
                  <div className="flex items-center gap-3">
                    <ShoppingBag className="w-5 h-5" />
                    <h2 className="text-lg font-bold uppercase tracking-wider">Кошик</h2>
                    <span className="bg-black text-white text-xs font-bold px-2.5 py-0.5 rounded-full">{cartCount}</span>
                  </div>
                  <button
                    onClick={handleClose}
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-4">
                  <AnimatePresence mode="popLayout">
                    {cart.map(({ product, qty }) => {
                      const latest = products.find(p => p.id === product.id) || product;
                      return (
                      <motion.div
                        key={product.id}
                        layout
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20, height: 0, marginBottom: 0 }}
                        className="flex gap-4 bg-gray-50 rounded-2xl p-3"
                      >
                        <div className="w-20 h-20 rounded-xl flex-shrink-0 overflow-hidden">
                          {latest.image ? (
                            <img src={latest.image} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center" style={{ background: getProductGradient(latest.id, latest.category) }}>
                              <span className="text-white/40 text-2xl font-black select-none">{latest.name.charAt(0)}</span>
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0 flex flex-col justify-between">
                          <div>
                            <p className="text-[10px] font-medium text-gray-400 uppercase tracking-wider">{latest.category}</p>
                            <h4 className="text-sm font-bold leading-tight truncate">{latest.name}</h4>
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => updateQty(product.id, qty - 1)}
                                className="w-7 h-7 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-100 transition-colors"
                              >
                                <Minus className="w-3 h-3" />
                              </button>
                              <span className="text-sm font-bold w-5 text-center">{qty}</span>
                              <button
                                onClick={() => updateQty(product.id, qty + 1)}
                                className="w-7 h-7 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-100 transition-colors"
                              >
                                <Plus className="w-3 h-3" />
                              </button>
                            </div>
                            <span className="text-sm font-bold">{latest.price}</span>
                          </div>
                        </div>
                        <button
                          onClick={() => removeFromCart(product.id)}
                          className="self-start p-1.5 text-gray-300 hover:text-red-500 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </motion.div>
                    );})}
                  </AnimatePresence>
                </div>

                <div className="border-t border-gray-100 p-6 flex flex-col gap-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500 uppercase tracking-wider font-medium">Разом</span>
                    <span className="text-xl font-bold">{cartTotal}</span>
                  </div>
                  <button
                    onClick={() => setStep('checkout')}
                    className="w-full bg-black text-white py-4 rounded-full font-bold uppercase tracking-wider hover:bg-gray-800 transition-colors text-sm"
                  >
                    Оформити замовлення
                  </button>
                  <button
                    onClick={handleClose}
                    className="w-full text-center text-sm text-gray-500 hover:text-black transition-colors font-medium"
                  >
                    Продовжити покупки
                  </button>
                </div>
              </>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
