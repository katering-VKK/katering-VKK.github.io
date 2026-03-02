import React from 'react';
import { StoreProvider } from './store';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { ProductGrid } from './components/ProductGrid';
import { CategorySplit } from './components/CategorySplit';
import { Editorial } from './components/Editorial';
import { Footer } from './components/Footer';
import { CartDrawer } from './components/CartDrawer';

export default function App() {
  return (
    <StoreProvider>
      <div className="font-sans text-[#1A1A1A] bg-white">
        <Navbar />
        <main>
          <Hero />
          <ProductGrid />
          <CategorySplit />
          <Editorial />
        </main>
        <Footer />
        <CartDrawer />
      </div>
    </StoreProvider>
  );
}
