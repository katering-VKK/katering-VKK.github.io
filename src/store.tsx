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

  activeCategory: string;
  setActiveCategory: (cat: string) => void;
  activeTag: string | null;
  setActiveTag: (tag: string | null) => void;
  scrollToGrid: () => void;
  navigateToCategory: (cat: string) => void;
  navigateToSubcategory: (cat: string, tag: string) => void;
}

const StoreContext = createContext<StoreContextType | null>(null);

function parsePrice(price: string): number {
  return parseInt(price.replace(/\s/g, '').replace('₴', ''), 10) || 0;
}

function formatPrice(n: number): string {
  return n.toLocaleString('uk-UA') + ' ₴';
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setCartOpen] = useState(false);
  const [favorites, setFavorites] = useState<number[]>([]);
  const [isFavOpen, setFavOpen] = useState(false);
  const [isSearchOpen, setSearchOpen] = useState(false);
  const [activeCategory, setActiveCategoryRaw] = useState('Всі');
  const [activeTag, setActiveTag] = useState<string | null>(null);

  const setActiveCategory = useCallback((cat: string) => {
    setActiveCategoryRaw(cat);
    setActiveTag(null);
  }, []);

  const addToCart = useCallback((product: Product) => {
    setCart(prev => {
      const existing = prev.find(i => i.product.id === product.id);
      if (existing) return prev.map(i => i.product.id === product.id ? { ...i, qty: i.qty + 1 } : i);
      return [...prev, { product, qty: 1 }];
    });
    setCartOpen(true);
  }, []);

  const removeFromCart = useCallback((productId: number) => {
    setCart(prev => prev.filter(i => i.product.id !== productId));
  }, []);

  const updateQty = useCallback((productId: number, qty: number) => {
    if (qty <= 0) {
      setCart(prev => prev.filter(i => i.product.id !== productId));
      return;
    }
    setCart(prev => prev.map(i => i.product.id === productId ? { ...i, qty } : i));
  }, []);

  const clearCart = useCallback(() => setCart([]), []);

  const toggleFavorite = useCallback((id: number) => {
    setFavorites(prev => prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id]);
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
