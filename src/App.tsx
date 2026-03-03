import React from 'react';
import { StoreProvider } from './store';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { ProductGrid } from './components/ProductGrid';
import { CategorySplit } from './components/CategorySplit';
import { Editorial } from './components/Editorial';
import { Footer } from './components/Footer';
import { CartDrawer } from './components/CartDrawer';
import { FavoritesDrawer } from './components/FavoritesDrawer';
import { SearchOverlay } from './components/SearchOverlay';
import { ProductQuickView } from './components/ProductQuickView';
import { Toast } from './components/Toast';

export default function App() {
  return (
    <StoreProvider>
        <div className="font-sans text-[var(--color-bobo-black)] bg-white antialiased">
        <Navbar />
        <main>
          <Hero />
          <ProductGrid />
          <CategorySplit />
          <Editorial />
        </main>
        <Footer />
        <CartDrawer />
        <FavoritesDrawer />
        <SearchOverlay />
        <ProductQuickView />
        <Toast />
      </div>
    </StoreProvider>
  );
}
