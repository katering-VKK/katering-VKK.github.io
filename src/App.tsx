import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { StoreProvider } from './store';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { CartDrawer } from './components/CartDrawer';
import { FavoritesDrawer } from './components/FavoritesDrawer';
import { SearchOverlay } from './components/SearchOverlay';
import { ProductQuickView } from './components/ProductQuickView';
import { Toast } from './components/Toast';
import { Home } from './pages/Home';
import { DeliveryPayment } from './pages/DeliveryPayment';
import { About } from './pages/About';
import { Contacts } from './pages/Contacts';
import { NotFound } from './pages/NotFound';
import { ScrollToTop } from './components/ScrollToTop';
import { ScrollToTopButton } from './components/ScrollToTopButton';

export default function App() {
  return (
    <StoreProvider>
      <BrowserRouter>
        <ScrollToTop />
        <div className="font-sans text-[var(--color-bobo-black)] bg-white antialiased">
          <Navbar />
          <main>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/delivery" element={<DeliveryPayment />} />
              <Route path="/about" element={<About />} />
              <Route path="/contacts" element={<Contacts />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
          <Footer />
          <CartDrawer />
          <FavoritesDrawer />
          <SearchOverlay />
          <ProductQuickView />
          <Toast />
          <ScrollToTopButton />
        </div>
      </BrowserRouter>
    </StoreProvider>
  );
}
