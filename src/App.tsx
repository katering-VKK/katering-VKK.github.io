import React from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { StoreProvider } from './store';
import { ProductsProvider } from './context/ProductsContext';
import { SiteContentProvider } from './context/SiteContentContext';
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
import { Admin } from './pages/Admin';
import { AdminErrorBoundary } from './components/AdminErrorBoundary';
import { ScrollToTop } from './components/ScrollToTop';
import { ScrollToTopButton } from './components/ScrollToTopButton';

function AppContent() {
  const loc = useLocation();
  const isAdmin = loc.pathname === '/admin';

  return (
    <div className="font-sans text-[var(--color-bobo-black)] bg-white antialiased overflow-x-hidden min-w-0">
      {!isAdmin && <Navbar />}
      <main className={isAdmin ? '' : ''}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/delivery" element={<DeliveryPayment />} />
          <Route path="/about" element={<About />} />
          <Route path="/contacts" element={<Contacts />} />
          <Route path="/admin" element={<AdminErrorBoundary><Admin /></AdminErrorBoundary>} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      {!isAdmin && <Footer />}
          <CartDrawer />
          <FavoritesDrawer />
          <SearchOverlay />
          <ProductQuickView />
          <Toast />
          <ScrollToTopButton />
    </div>
  );
}

export default function App() {
  return (
    <StoreProvider>
      <ProductsProvider>
      <SiteContentProvider>
      <BrowserRouter>
        <ScrollToTop />
        <AppContent />
      </BrowserRouter>
      </SiteContentProvider>
      </ProductsProvider>
    </StoreProvider>
  );
}
