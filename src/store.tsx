import React, { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import type { Product } from './data/products';

export interface CartItem {
  product: Product;
  qty: number;
}

interface StoreContextType {
  cart: CartItem[];
  cartCount: number;
  cartTotal: string;
  addToCart: (product: Product) => void;
  removeFromCart: (productId: number) => void;
  updateQty: (productId: number, qty: number) => void;
  clearCart: () => void;
  isCartOpen: boolean;
  setCartOpen: (open: boolean) => void;

  favorites: number[];
  favCount: number;
  toggleFavorite: (id: number) => void;
  isFavorite: (id: number) => boolean;
  isFavOpen: boolean;
  setFavOpen: (open: boolean) => void;

  isSearchOpen: boolean;
  setSearchOpen: (open: boolean) => void;

  quickViewProduct: Product | null;
  setQuickViewProduct: (p: Product | null) => void;
  toast: { message: string; type?: 'success' | 'info' } | null;
  showToast: (message: string, type?: 'success' | 'info') => void;

  activeCategory: string;
  setActiveCategory: (cat: string) => void;
  activeTag: string | null;
  setActiveTag: (tag: string | null) => void;
  scrollToGrid: () => void;
  navigateToCategory: (cat: string) => void;
  navigateToSubcategory: (cat: string, tag: string) => void;
}

const StoreContext = createContext<StoreContextType | null>(null);

const CART_KEY = 'lumu_cart';
const FAV_KEY = 'lumu_fav';

function parsePrice(price: string): number {
  return parseInt(price.replace(/\s/g, '').replace('₴', ''), 10) || 0;
}

function formatPrice(n: number): string {
  return n.toLocaleString('uk-UA') + ' ₴';
}

function loadCart(): CartItem[] {
  try {
    const s = localStorage.getItem(CART_KEY);
    if (s) {
      const data = JSON.parse(s);
      return Array.isArray(data) ? data : [];
    }
  } catch {}
  return [];
}

function loadFavorites(): number[] {
  try {
    const s = localStorage.getItem(FAV_KEY);
    if (s) {
      const data = JSON.parse(s);
      return Array.isArray(data) ? data : [];
    }
  } catch {}
  return [];
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>(loadCart);
  const [isCartOpen, setCartOpen] = useState(false);
  const [favorites, setFavorites] = useState<number[]>(loadFavorites);
  const [isFavOpen, setFavOpen] = useState(false);
  const [isSearchOpen, setSearchOpen] = useState(false);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [toast, setToast] = useState<{ message: string; type?: 'success' | 'info' } | null>(null);
  const [activeCategory, setActiveCategoryRaw] = useState('Всі');
  const [activeTag, setActiveTag] = useState<string | null>(null);

  const showToast = useCallback((message: string, type: 'success' | 'info' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 2500);
  }, []);

  const setActiveCategory = useCallback((cat: string) => {
    setActiveCategoryRaw(cat);
    setActiveTag(null);
  }, []);

  const addToCart = useCallback((product: Product, qty = 1) => {
    setCart(prev => {
      const existing = prev.find(i => i.product.id === product.id);
      const next = existing ? prev.map(i => i.product.id === product.id ? { ...i, qty: i.qty + qty } : i) : [...prev, { product, qty }];
      try { localStorage.setItem(CART_KEY, JSON.stringify(next)); } catch {}
      return next;
    });
    setCartOpen(true);
    showToast(qty > 1 ? `Додано ${qty} шт. в кошик` : 'Додано в кошик');
  }, [showToast]);

  const removeFromCart = useCallback((productId: number) => {
    setCart(prev => {
      const next = prev.filter(i => i.product.id !== productId);
      try { localStorage.setItem(CART_KEY, JSON.stringify(next)); } catch {}
      return next;
    });
  }, []);

  const updateQty = useCallback((productId: number, qty: number) => {
    setCart(prev => {
      const next = qty <= 0 ? prev.filter(i => i.product.id !== productId) : prev.map(i => i.product.id === productId ? { ...i, qty } : i);
      try { localStorage.setItem(CART_KEY, JSON.stringify(next)); } catch {}
      return next;
    });
  }, []);

  const clearCart = useCallback(() => {
    setCart([]);
    try { localStorage.removeItem(CART_KEY); } catch {}
  }, []);

  const toggleFavorite = useCallback((id: number) => {
    setFavorites(prev => {
      const next = prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id];
      try { localStorage.setItem(FAV_KEY, JSON.stringify(next)); } catch {}
      return next;
    });
  }, []);

  const isFavorite = useCallback((id: number) => favorites.includes(id), [favorites]);

  const cartCount = cart.reduce((s, i) => s + i.qty, 0);
  const cartTotal = formatPrice(cart.reduce((s, i) => s + parsePrice(i.product.price) * i.qty, 0));
  const favCount = favorites.length;

  const scrollToGrid = useCallback(() => {
    document.getElementById('product-grid')?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  const navigateToCategory = useCallback((cat: string) => {
    setActiveCategory(cat);
    setTimeout(() => {
      document.getElementById('product-grid')?.scrollIntoView({ behavior: 'smooth' });
    }, 50);
  }, [setActiveCategory]);

  const navigateToSubcategory = useCallback((cat: string, tag: string) => {
    setActiveCategoryRaw(cat);
    setActiveTag(tag);
    setTimeout(() => {
      document.getElementById('product-grid')?.scrollIntoView({ behavior: 'smooth' });
    }, 50);
  }, []);

  return (
    <StoreContext.Provider value={{
      cart, cartCount, cartTotal,
      addToCart, removeFromCart, updateQty, clearCart,
      isCartOpen, setCartOpen,
      favorites, favCount, toggleFavorite, isFavorite,
      isFavOpen, setFavOpen,
      isSearchOpen, setSearchOpen,
      quickViewProduct, setQuickViewProduct,
      toast, showToast,
      activeCategory, setActiveCategory,
      activeTag, setActiveTag,
      scrollToGrid, navigateToCategory, navigateToSubcategory,
    }}>
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore must be inside StoreProvider');
  return ctx;
}
