import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Lock, Save, Plus, Trash2, Edit2, X, Loader2, LogOut, ChevronDown, ChevronRight, BookOpen, Gamepad2, Palette, Sparkles, Dice5, ExternalLink, Search, CheckCircle, FileText, Download, Upload } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useProducts } from '../context/ProductsContext';
import { useSiteContent } from '../context/SiteContentContext';
import { useStore } from '../store';
import { getProductGradient } from '../data/products';
import type { Product } from '../data/products';
import { categories } from '../data/products';
import { ProductImage } from '../components/ProductImage';
import { resolveImageUrl } from '../utils/imageUrl';

const ADMIN_CATEGORIES = categories.filter(c => c !== 'Всі' && c !== 'Хіт продажу');
const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  'Книги': <BookOpen className="w-5 h-5" />,
  'Іграшки': <Gamepad2 className="w-5 h-5" />,
  'Власне виробництво': <Sparkles className="w-5 h-5" />,
  'Творчість': <Palette className="w-5 h-5" />,
  'Настільні ігри': <Dice5 className="w-5 h-5" />,
  'Інше': <Sparkles className="w-5 h-5" />,
};

const ADMIN_KEY = 'lumu_admin';
const DEFAULT_API = 'https://lumu-pearl.vercel.app/api';
const getApiUrl = () => {
  const admin = (import.meta.env.VITE_ADMIN_API_URL || '').replace(/\/$/, '');
  if (admin) return admin;
  const telegram = (import.meta.env.VITE_TELEGRAM_API_URL || '').replace(/\/telegram\/?$/, '').replace(/\/$/, '');
  if (telegram) return telegram;
  if (typeof window !== 'undefined') {
    const o = window.location.origin;
    return o + '/api';
  }
  return DEFAULT_API;
};
const API_URL = getApiUrl();

export const Admin = () => {
  const { products, loading, refetch } = useProducts();
  const { showToast } = useStore();
  const [auth, setAuth] = useState<{ token: string } | null>(() => {
    try {
      const s = sessionStorage.getItem(ADMIN_KEY);
      return s ? JSON.parse(s) : null;
    } catch {
      return null;
    }
  });
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);
  const [apiStatus, setApiStatus] = useState<'checking' | 'ok' | 'no-token' | 'error'>('checking');
  const [uploadOk, setUploadOk] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [uploadTest, setUploadTest] = useState<{ status: 'idle' | 'testing' | 'ok' | 'fail'; msg?: string }>({ status: 'idle' });
  const [localProducts, setLocalProducts] = useState<Product[]>([]);
  const [adminTab, setAdminTab] = useState<'products' | 'sections'>('products');
  const skipSyncRef = useRef(false);
  const hasLocalChangesRef = useRef(false);
  const importInputRef = useRef<HTMLInputElement>(null);

  const testUpload = async () => {
    if (!auth?.token || !API_URL) return;
    setUploadTest({ status: 'testing' });
    const pixel = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==';
    const token = (auth.token || '').trim();
    try {
      const res = await fetch(`${API_URL}/admin/upload-image`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ base64: pixel, productId: 99999, ext: 'jpg', token }),
      });
      const data = await res.json().catch(() => ({}));
      if (data.ok && data.url) {
        setUploadTest({ status: 'ok', msg: 'Фото працює' });
      } else {
        setUploadTest({ status: 'fail', msg: data.error || `HTTP ${res.status}` });
      }
    } catch (e) {
      setUploadTest({ status: 'fail', msg: (e as Error).message });
    }
  };

  useEffect(() => {
    if (skipSyncRef.current) {
      skipSyncRef.current = false;
      return;
    }
    if (hasLocalChangesRef.current) return;
    const list = Array.isArray(products) ? products : [];
    setLocalProducts(list);
  }, [products]);

  useEffect(() => {
    if (!API_URL) return;
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), 8000);
    fetch(`${API_URL}/admin/health`, { signal: ctrl.signal })
      .then(r => r.json())
      .then(d => {
        setApiStatus(d?.configured ? 'ok' : 'no-token');
        setUploadOk(!!d?.uploadOk);
      })
      .catch(() => setApiStatus('error'))
      .finally(() => clearTimeout(t));
    return () => { ctrl.abort(); clearTimeout(t); };
  }, [API_URL]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim()) {
      setLoginError('Введіть пароль');
      return;
    }
    setLoginError('');
    setLoginLoading(true);
    try {
      const res = await fetch(`${API_URL}/admin/auth`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: password.trim() }),
      });
      const data = await res.json().catch(() => ({}));
      if (data.ok && data.token) {
        sessionStorage.setItem(ADMIN_KEY, JSON.stringify({ token: data.token }));
        setAuth({ token: data.token });
        setPassword('');
      } else {
        setLoginError(data.error || 'Невірний пароль');
      }
    } catch (err) {
      setLoginError('Помилка з\'єднання. Перевірте CORS чи API URL.');
    } finally {
      setLoginLoading(false);
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem(ADMIN_KEY);
    setAuth(null);
    setEditing(null);
    setSaveError('');
  };

  const handleSaveProduct = (updated: Product) => {
    hasLocalChangesRef.current = true;
    setLocalProducts(prev => prev.map(p => p.id === updated.id ? updated : p));
    setEditing(null);
  };

  const handleAddProduct = (category: string) => {
    hasLocalChangesRef.current = true;
    const maxId = localProducts.reduce((m, p) => Math.max(m, p.id), 0);
    const newProduct: Product = {
      id: maxId + 1,
      name: 'Новий товар',
      price: '100 ₴',
      category,
      tag: '',
    };
    setLocalProducts(prev => [...prev, newProduct]);
    setEditing(newProduct);
  };

  const handleDeleteProduct = (id: number, name?: string) => {
    const label = name ? `«${name.length > 40 ? name.slice(0, 40) + '…' : name}»` : 'цей товар';
    if (confirm(`Видалити товар ${label}? Цю дію не можна скасувати.`)) {
      hasLocalChangesRef.current = true;
      setLocalProducts(prev => prev.filter(p => p.id !== id));
      setEditing(null);
    }
  };

  const handleExportProducts = () => {
    const payload = localProducts.map(p => ({
      id: Number(p.id),
      name: String(p.name || '').trim(),
      price: String(p.price || '').trim(),
      category: String(p.category || 'Книги'),
      tag: String(p.tag || '').trim(),
      ...(p.description && { description: String(p.description).trim() }),
      ...(p.image && { image: String(p.image) }),
    }));
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `products-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Експортовано');
  };

  const handleImportProducts = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    const reader = new FileReader();
    reader.onerror = () => setSaveError('Не вдалося прочитати файл');
    reader.onload = () => {
      try {
        const text = String(reader.result ?? '');
        const data = JSON.parse(text);
        if (!Array.isArray(data)) {
          setSaveError('JSON має бути масивом товарів');
          return;
        }
        const valid: Product[] = [];
        const defaultCategory = 'Книги';
        for (let i = 0; i < data.length; i++) {
          const p = data[i];
          if (p == null || typeof p !== 'object') continue;
          const name = String(p.name ?? '').trim();
          if (!name) continue;
          const price = String(p.price ?? '').trim();
          if (!price) continue;
          const priceNum = parseInt(price.replace(/\s/g, '').replace('₴', ''), 10);
          if (isNaN(priceNum) || priceNum < 0) continue;
          valid.push({
            id: Number(p.id) || i + 1,
            name,
            price,
            category: String(p.category ?? defaultCategory).trim() || defaultCategory,
            tag: String(p.tag ?? '').trim(),
            ...(p.description && typeof p.description === 'string' && { description: String(p.description).trim() }),
            ...(p.image && typeof p.image === 'string' && !p.image.startsWith('data:') && { image: p.image }),
          });
        }
        if (valid.length === 0) {
          setSaveError('У файлі немає валідних товарів');
          return;
        }
        const withUniqueIds = valid.map((p, idx) => ({ ...p, id: idx + 1 }));
        hasLocalChangesRef.current = true;
        setLocalProducts(withUniqueIds);
        showToast(`Завантажено ${withUniqueIds.length} товарів. Натисніть «Зберегти в GitHub».`);
      } catch (err) {
        setSaveError('Невірний JSON: ' + ((err as Error).message || 'помилка парсингу'));
      }
    };
    reader.readAsText(file, 'UTF-8');
  };

  const handleSaveAll = async () => {
    if (saving) return;
    setSaveError('');
    setSaving(true);
    try {
      let payload = localProducts.map(p => ({
        id: Number(p.id),
        name: String(p.name || '').trim(),
        price: String(p.price || '').trim(),
        category: String(p.category || 'Книги'),
        tag: String(p.tag || '').trim(),
        ...(p.description && { description: String(p.description).trim() }),
        ...(p.image && { image: String(p.image) }),
      }));
      const failedUploadIds = new Set<number>();
      let strippedCount = 0;
      for (let i = 0; i < payload.length; i++) {
        const img = payload[i].image;
        if (img && img.startsWith('data:image/')) {
          const rawBase64 = img.replace(/^data:image\/\w+;base64,/, '').replace(/\s/g, '');
          if (rawBase64.length > 800_000) {
            payload[i] = { ...payload[i], image: undefined };
            failedUploadIds.add(payload[i].id);
            strippedCount++;
            continue;
          }
          let upRes: Response | null = null;
          let upData: { ok?: boolean; url?: string; error?: string } = {};
          const uploadToken = (auth?.token ?? '').trim();
          const doUpload = async (): Promise<boolean> => {
            const ctrl = new AbortController();
            const t = setTimeout(() => ctrl.abort(), 35000);
            try {
              upRes = await fetch(`${API_URL}/admin/upload-image`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${uploadToken}`,
                },
                body: JSON.stringify({ base64: rawBase64, productId: payload[i].id, ext: 'jpg', token: uploadToken }),
                signal: ctrl.signal,
              });
              clearTimeout(t);
              upData = await upRes.json().catch(() => ({}));
              return upData.ok === true && !!upData.url;
            } catch {
              clearTimeout(t);
              return false;
            }
          };
          try {
            let ok = await doUpload();
            if (!ok && (upRes === null || (upRes?.status ?? 0) >= 500)) {
              await new Promise(r => setTimeout(r, 2000));
              ok = await doUpload();
            }
            if (ok && upData.url) {
              payload[i] = { ...payload[i], image: upData.url };
            } else {
              payload[i] = { ...payload[i], image: undefined };
              failedUploadIds.add(payload[i].id);
              strippedCount++;
              const errMsg = upData.error || (upRes ? `HTTP ${upRes.status}` : 'Мережа недоступна. Перевірте API URL.');
              setSaveError(prev => (prev ? prev + '; ' : '') + `Товар #${payload[i].id}: ${errMsg}`);
            }
          } catch (err) {
            payload[i] = { ...payload[i], image: undefined };
            failedUploadIds.add(payload[i].id);
            strippedCount++;
            setSaveError(prev => (prev ? prev + '; ' : '') + `Товар #${payload[i].id}: ${(err as Error).message || 'Помилка мережі'}`);
          }
        }
      }
      const cacheBust = Date.now();
      const toSend = payload.map(p => {
        let img = p.image;
        if (img && img.startsWith('data:')) return { ...p, image: undefined };
        if (img && typeof img === 'string' && !img.startsWith('data:')) {
          const base = img.split('?')[0];
          img = `${base}?t=${cacheBust}`;
        }
        return { ...p, image: img || undefined };
      });
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 60000);
      const token = (auth?.token ?? '').trim();
      const res = await fetch(`${API_URL}/admin/products`, {
        method: 'PUT',
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ products: toSend, token }),
      });
      clearTimeout(timeout);
      const text = await res.text();
      let data: { ok?: boolean; error?: string } = {};
      try {
        data = JSON.parse(text);
      } catch {
        setSaveError(text || `HTTP ${res.status}`);
        return;
      }
      if (data.ok) {
        const merged = payload.map(p => {
          if (failedUploadIds.has(p.id)) {
            const orig = localProducts.find(op => op.id === p.id);
            return { ...p, image: orig?.image ?? p.image };
          }
          return p;
        });
        setLocalProducts(merged);
        skipSyncRef.current = true;
        hasLocalChangesRef.current = false;
        if (strippedCount === 0) setSaveError('');
        await refetch();
        showToast(strippedCount > 0 ? `Збережено. ${strippedCount} фото не завантажилось — перевірте помилку вище` : 'Збережено в GitHub');
      } else {
        if (res.status === 401) handleLogout();
        setSaveError(data.error || `Помилка ${res.status}`);
      }
    } catch (err) {
      const msg = (err as Error).message || 'Помилка з\'єднання';
      setSaveError(msg + (msg.includes('fetch') ? ` (API: ${API_URL})` : ''));
    } finally {
      setSaving(false);
    }
  };

  if (!API_URL) {
    return (
      <div className="min-h-screen pt-12 px-6 flex flex-col items-center justify-center">
        <p className="text-gray-500">Адмін-панель не налаштована (відсутній API)</p>
        <Link to="/" className="mt-4 text-violet-600 hover:underline">На головну</Link>
      </div>
    );
  }

  if (!auth) {
    return (
      <div className="min-h-screen pt-12 px-6 flex flex-col items-center justify-center bg-gradient-to-b from-gray-50 to-white">
        <div className="w-full max-w-sm">
          <Link to="/" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-black mb-8">
            <ExternalLink className="w-4 h-4" />
            На головну
          </Link>
          <div className="flex items-center gap-3 mb-8">
            <div className="w-14 h-14 rounded-2xl bg-violet-100 flex items-center justify-center shadow-sm">
              <Lock className="w-7 h-7 text-violet-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Адмін-панель</h1>
              <p className="text-sm text-gray-500">Редагування товарів</p>
            </div>
          </div>
          <form onSubmit={handleLogin} className="space-y-4">
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Пароль (ADMIN_TOKEN з Vercel)"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-violet-500"
              autoFocus
            />
            {loginError && <p className="text-sm text-red-500">{loginError}</p>}
            <button
              type="submit"
              disabled={loginLoading}
              className="w-full bg-black text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 disabled:opacity-70"
            >
              {loginLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : null}
              Увійти
            </button>
          </form>
          {apiStatus === 'no-token' && (
            <p className="mt-2 text-sm text-amber-600 bg-amber-50 px-3 py-2 rounded-lg">
              ADMIN_TOKEN не налаштований у Vercel. Додайте → Redeploy.
            </p>
          )}
          {apiStatus === 'error' && (
            <p className="mt-2 text-sm text-amber-600 bg-amber-50 px-3 py-2 rounded-lg">
              API недоступний. Додайте VITE_ADMIN_API_URL або VITE_TELEGRAM_API_URL = https://lumu-pearl.vercel.app/api
            </p>
          )}
          {apiStatus === 'ok' && !uploadOk && (
            <p className="mt-2 text-sm text-amber-600 bg-amber-50 px-3 py-2 rounded-lg">
              Фото не завантажуватимуться: GITHUB_TOKEN у Vercel
            </p>
          )}
          <p className="mt-4 text-xs text-gray-400 text-center">
            Пароль = <code className="bg-gray-100 px-1.5 py-0.5 rounded">ADMIN_TOKEN</code> з Vercel
          </p>
        </div>
      </div>
    );
  }

  const { content: siteContent, refetch: refetchSiteContent } = useSiteContent();
  const productsList = Array.isArray(products) ? products : [];
  const totalProducts = localProducts.length;
  const hasUnsaved = useMemo(() => {
    const orig = JSON.stringify(productsList.map(p => ({ id: p.id, name: p.name, price: p.price, category: p.category, tag: p.tag, description: p.description, image: p.image })));
    const curr = JSON.stringify(localProducts.map(p => ({ id: p.id, name: p.name, price: p.price, category: p.category, tag: p.tag, description: p.description, image: p.image })));
    return orig !== curr;
  }, [productsList, localProducts]);

  return (
    <div className="min-h-screen pt-8 pb-12 px-6">
      <div className="max-w-4xl mx-auto">
        <div className="sticky top-0 z-10 -mx-6 px-6 py-4 mb-8 bg-white/95 backdrop-blur-md border-b border-gray-100">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="flex gap-1 p-1 bg-gray-100 rounded-xl">
                <button onClick={() => setAdminTab('products')} className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${adminTab === 'products' ? 'bg-white text-black shadow-sm' : 'text-gray-600 hover:text-black'}`}>
                  Товари
                </button>
                <button onClick={() => setAdminTab('sections')} className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors flex items-center gap-1.5 ${adminTab === 'sections' ? 'bg-white text-black shadow-sm' : 'text-gray-600 hover:text-black'}`}>
                  <FileText className="w-4 h-4" />
                  Розділи сайту
                </button>
              </div>
              {adminTab === 'products' && <span className="text-sm text-gray-500">{totalProducts} товарів</span>}
              {hasUnsaved && <span className="text-xs px-2 py-0.5 bg-amber-100 text-amber-800 rounded-full font-medium">Є зміни</span>}
              {apiStatus === 'ok' && <span className="flex items-center gap-1 text-xs text-green-600"><CheckCircle className="w-3.5 h-3.5" /> API</span>}
            </div>
            <div className="flex items-center gap-2">
              <Link to="/" target="_blank" className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-black px-3 py-2 rounded-lg hover:bg-gray-100">
                <ExternalLink className="w-4 h-4" />
                На сайт
              </Link>
              <button onClick={handleLogout} className="flex items-center gap-2 text-sm text-gray-500 hover:text-black px-3 py-2 rounded-lg hover:bg-gray-100">
                <LogOut className="w-4 h-4" />
                Вийти
              </button>
              {adminTab === 'products' && (
                <button
                  onClick={handleSaveAll}
                  disabled={saving}
                  className="flex items-center gap-2 bg-black text-white px-5 py-2.5 rounded-xl font-bold text-sm disabled:opacity-50 hover:bg-gray-800 transition-colors"
                >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  Зберегти в GitHub
                </button>
              )}
            </div>
          </div>
        </div>

        {saveError && (
          <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-xl text-sm flex items-start justify-between gap-3">
            <span>{saveError}</span>
            <button onClick={() => setSaveError('')} className="p-1 hover:bg-red-100 rounded-lg shrink-0" title="Закрити">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}
        {uploadTest.status !== 'idle' && (
          <div className={`mb-6 p-4 rounded-xl text-sm flex items-center justify-between ${uploadTest.status === 'ok' ? 'bg-green-50 text-green-700' : uploadTest.status === 'fail' ? 'bg-amber-50 text-amber-800' : 'bg-gray-50 text-gray-600'}`}>
            <span>{uploadTest.status === 'testing' ? 'Тест завантаження...' : uploadTest.status === 'ok' ? uploadTest.msg : <>{uploadTest.msg}. <a href={`${API_URL}/admin/health`} target="_blank" rel="noreferrer" className="underline">API health</a></>}</span>
            {uploadTest.status !== 'testing' && (
              <button onClick={() => setUploadTest({ status: 'idle' })} className="text-xs underline shrink-0">Закрити</button>
            )}
          </div>
        )}
        {adminTab === 'products' && (
          <div className="mb-6 flex flex-wrap items-center gap-3">
            <button onClick={handleExportProducts} className="flex items-center gap-2 text-sm text-gray-600 hover:text-black px-3 py-2 rounded-lg border border-gray-200 hover:bg-gray-50">
              <Download className="w-4 h-4" />
              Вигрузити JSON
            </button>
            <label className="flex items-center gap-2 text-sm text-gray-600 hover:text-black px-3 py-2 rounded-lg border border-gray-200 hover:bg-gray-50 cursor-pointer">
              <Upload className="w-4 h-4" />
              Завантажити JSON
              <input ref={importInputRef} type="file" accept=".json,application/json" className="hidden" onChange={handleImportProducts} />
            </label>
            <button onClick={testUpload} disabled={uploadTest.status === 'testing'} className="text-sm text-gray-500 hover:text-black underline disabled:opacity-50">
              Тест завантаження фото
            </button>
          </div>
        )}

        {adminTab === 'sections' ? (
          <SiteContentEditor
            content={siteContent}
            onSave={refetchSiteContent}
            apiUrl={API_URL}
            authToken={auth?.token ?? ''}
            onUnauthorized={handleLogout}
          />
        ) : loading ? (
          <div className="py-16 space-y-4">
            <div className="h-12 bg-gray-100 rounded-xl animate-pulse" />
            <div className="h-12 bg-gray-100 rounded-xl animate-pulse max-w-[75%]" />
            <div className="h-12 bg-gray-100 rounded-xl animate-pulse max-w-[50%]" />
            <div className="grid gap-3 mt-8">
              {[1, 2, 3, 4, 5].map(i => (
                <div key={i} className="h-20 bg-gray-50 rounded-xl animate-pulse" />
              ))}
            </div>
          </div>
        ) : (
          <AdminSections
            localProducts={localProducts}
            onEdit={setEditing}
            onDelete={handleDeleteProduct}
            onAdd={handleAddProduct}
            getProductGradient={getProductGradient}
          />
        )}
      </div>

      <AnimatePresence>
        {editing && (
        <ProductEditModal
          product={editing}
          onSave={handleSaveProduct}
          onClose={() => setEditing(null)}
          onUnauthorized={handleLogout}
          apiUrl={API_URL}
          authToken={auth?.token ?? ''}
        />
        )}
      </AnimatePresence>
    </div>
  );
};

const TAG_PRESETS = ['Хіт продажу', 'New', 'Розмальовки', 'Наліпки', 'Подарунковий набір', ''];

const fieldClass = 'w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-violet-500 focus:border-violet-400 outline-none text-base leading-relaxed transition-colors';
const labelClass = 'block text-sm font-medium text-gray-700 mb-1.5';

function AdminField({ label, value, onChange, multiline, rows = 6, hint, maxLength }: { label: string; value: string; onChange: (v: string) => void; multiline?: boolean; rows?: number; hint?: string; maxLength?: number }) {
  return (
    <div className="space-y-1">
      <label className={labelClass}>{label}</label>
      {hint && <p className="text-xs text-gray-500 mb-1">{hint}</p>}
      {multiline ? (
        <textarea
          value={value}
          onChange={e => onChange(e.target.value)}
          rows={rows}
          maxLength={maxLength}
          className={`${fieldClass} resize-y min-h-[120px]`}
          placeholder="Введі текст..."
        />
      ) : (
        <input value={value} onChange={e => onChange(e.target.value)} maxLength={maxLength} className={fieldClass} placeholder="Введі текст..." />
      )}
      {maxLength && <p className="text-xs text-gray-400 mt-1">{value.length}/{maxLength}</p>}
    </div>
  );
}

function AdminSection({ id, title, isOpen, onToggle, children }: { id: string; title: string; isOpen: boolean; onToggle: () => void; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-gray-200 bg-white overflow-hidden">
      <button type="button" onClick={onToggle} className="w-full flex items-center justify-between px-6 py-4 text-left hover:bg-gray-50/80 transition-colors">
        <h2 className="text-lg font-bold text-gray-900">{title}</h2>
        <span className="text-gray-400">{isOpen ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}</span>
      </button>
      {isOpen && <div className="px-6 pb-6 pt-0 space-y-4 border-t border-gray-100">{children}</div>}
    </section>
  );
}

function SiteContentEditor({ content, onSave, apiUrl, authToken, onUnauthorized }: {
  content: import('../context/SiteContentContext').SiteContent;
  onSave: () => void;
  apiUrl: string;
  authToken: string;
  onUnauthorized?: () => void;
}) {
  const [form, setForm] = useState(() => JSON.parse(JSON.stringify(content)));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [ok, setOk] = useState(false);
  const prevContentRef = useRef<string>('');

  useEffect(() => {
    const key = JSON.stringify(content);
    if (prevContentRef.current !== key) {
      prevContentRef.current = key;
      setForm(JSON.parse(JSON.stringify(content)));
    }
  }, [content]);

  const handleSave = async () => {
    if (saving) return;
    setError('');
    setSaving(true);
    const token = authToken.trim();
    try {
      const res = await fetch(`${apiUrl}/admin/site-content`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ content: form, token }),
      });
      const data = await res.json().catch(() => ({}));
      if (data.ok) {
        setOk(true);
        onSave();
        setTimeout(() => setOk(false), 3000);
      } else {
        if (res.status === 401) onUnauthorized?.();
        setError(data.error || `HTTP ${res.status}`);
      }
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const [expanded, setExpanded] = useState<Record<string, boolean>>({
    hero: true, about: true, delivery: true, contacts: true, categories: true, editorial: true, reviews: true,
  });
  const toggleSection = (key: string) => setExpanded(p => ({ ...p, [key]: !p[key] }));

  return (
    <div className="space-y-6">
      {error && <div className="p-4 bg-red-50 text-red-700 rounded-xl text-sm">{error}</div>}
      {ok && <div className="p-4 bg-green-50 text-green-700 rounded-xl text-sm">Збережено</div>}

      <AdminSection id="hero" title="Головна (Hero)" isOpen={expanded.hero ?? true} onToggle={() => toggleSection('hero')}>
        <div className="grid gap-4 sm:grid-cols-2">
          <AdminField label="Адреса" value={form.hero?.address ?? ''} onChange={v => setForm((p: typeof form) => ({ ...p, hero: { ...p.hero, address: v } }))} />
          <AdminField label="Години (коротко)" value={form.hero?.workingHours ?? ''} onChange={v => setForm((p: typeof form) => ({ ...p, hero: { ...p.hero, workingHours: v } }))} />
          <AdminField label="Години (повно)" value={form.hero?.workingHoursShort ?? ''} onChange={v => setForm((p: typeof form) => ({ ...p, hero: { ...p.hero, workingHoursShort: v } }))} />
        </div>
      </AdminSection>

      <AdminSection id="about" title="Про нас" isOpen={expanded.about ?? true} onToggle={() => toggleSection('about')}>
        <AdminField label="Заголовок" value={form.about?.title ?? ''} onChange={v => setForm((p: typeof form) => ({ ...p, about: { ...p.about, title: v } }))} />
        <AdminField label="Підзаголовок" value={form.about?.subtitle ?? ''} onChange={v => setForm((p: typeof form) => ({ ...p, about: { ...p.about, subtitle: v } }))} />
        <AdminField label="Вступ" value={form.about?.intro ?? ''} onChange={v => setForm((p: typeof form) => ({ ...p, about: { ...p.about, intro: v } }))} multiline rows={4} hint="Абзаци через Enter" />
        <AdminField label="Другий абзац" value={form.about?.paragraph2 ?? ''} onChange={v => setForm((p: typeof form) => ({ ...p, about: { ...p.about, paragraph2: v } }))} multiline rows={4} hint="Абзаци через Enter" />
        <AdminField label="Футер" value={form.about?.footer ?? ''} onChange={v => setForm((p: typeof form) => ({ ...p, about: { ...p.about, footer: v } }))} />
      </AdminSection>

      <AdminSection id="delivery" title="Доставка та оплата" isOpen={expanded.delivery ?? true} onToggle={() => toggleSection('delivery')}>
        <AdminField label="Заголовок сторінки" value={form.delivery?.title ?? ''} onChange={v => setForm((p: typeof form) => ({ ...p, delivery: { ...p.delivery, title: v } }))} />
        <AdminField label="Заголовок «Доставка»" value={form.delivery?.deliveryTitle ?? ''} onChange={v => setForm((p: typeof form) => ({ ...p, delivery: { ...p.delivery, deliveryTitle: v } }))} />
        <AdminField label="Текст доставки" value={form.delivery?.deliveryText ?? ''} onChange={v => setForm((p: typeof form) => ({ ...p, delivery: { ...p.delivery, deliveryText: v } }))} multiline rows={8} hint="Абзаци через Enter" />
        <AdminField label="Заголовок «Оплата»" value={form.delivery?.paymentTitle ?? ''} onChange={v => setForm((p: typeof form) => ({ ...p, delivery: { ...p.delivery, paymentTitle: v } }))} />
        <AdminField label="Текст оплати" value={form.delivery?.paymentText ?? ''} onChange={v => setForm((p: typeof form) => ({ ...p, delivery: { ...p.delivery, paymentText: v } }))} multiline rows={6} hint="Абзаци через Enter" />
        <AdminField label="Заголовок «Повернення»" value={form.delivery?.returnsTitle ?? ''} onChange={v => setForm((p: typeof form) => ({ ...p, delivery: { ...p.delivery, returnsTitle: v } }))} />
        <AdminField label="Текст повернення" value={form.delivery?.returnsText ?? ''} onChange={v => setForm((p: typeof form) => ({ ...p, delivery: { ...p.delivery, returnsText: v } }))} multiline rows={6} hint="Абзаци через Enter" />
      </AdminSection>

      <AdminSection id="contacts" title="Контакти" isOpen={expanded.contacts ?? true} onToggle={() => toggleSection('contacts')}>
        <div className="grid gap-4 sm:grid-cols-2">
          <AdminField label="Заголовок" value={form.contacts?.title ?? ''} onChange={v => setForm((p: typeof form) => ({ ...p, contacts: { ...p.contacts, title: v } }))} />
          <AdminField label="Адреса" value={form.contacts?.address ?? ''} onChange={v => setForm((p: typeof form) => ({ ...p, contacts: { ...p.contacts, address: v } }))} />
          <AdminField label="Режим роботи" value={form.contacts?.workingHours ?? ''} onChange={v => setForm((p: typeof form) => ({ ...p, contacts: { ...p.contacts, workingHours: v } }))} />
          <AdminField label="Телефон" value={form.contacts?.phone ?? ''} onChange={v => setForm((p: typeof form) => ({ ...p, contacts: { ...p.contacts, phone: v } }))} />
          <AdminField label="Email" value={form.contacts?.email ?? ''} onChange={v => setForm((p: typeof form) => ({ ...p, contacts: { ...p.contacts, email: v } }))} />
        </div>
      </AdminSection>

      <AdminSection id="categories" title="Описи категорій" isOpen={expanded.categories ?? true} onToggle={() => toggleSection('categories')}>
        <AdminField label="Опис «Іграшки»" value={form.categories?.toys ?? ''} onChange={v => setForm((p: typeof form) => ({ ...p, categories: { ...p.categories, toys: v } }))} multiline rows={4} hint="До 300 символів" maxLength={300} />
        <AdminField label="Опис «Власне виробництво»" value={form.categories?.ownProduction ?? ''} onChange={v => setForm((p: typeof form) => ({ ...p, categories: { ...p.categories, ownProduction: v } }))} multiline rows={4} hint="До 300 символів" maxLength={300} />
      </AdminSection>

      <AdminSection id="editorial" title="Журнал (Editorial)" isOpen={expanded.editorial ?? true} onToggle={() => toggleSection('editorial')}>
        <AdminField label="Заголовок" value={form.editorial?.title ?? ''} onChange={v => setForm((p: typeof form) => ({ ...p, editorial: { ...p.editorial, title: v } }))} />
        <AdminField label="Текст посилання" value={form.editorial?.linkText ?? ''} onChange={v => setForm((p: typeof form) => ({ ...p, editorial: { ...p.editorial, linkText: v } }))} />
        <div className="pt-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Статті</h3>
          <div className="space-y-4">
            {(form.editorial?.articles ?? []).map((art, i) => (
              <div key={art.id} className="p-4 rounded-xl bg-gray-50/80 border border-gray-100 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-medium text-gray-500">Стаття {i + 1}</span>
                </div>
                <AdminField label="Назва" value={art.title} onChange={v => setForm((p: typeof form) => ({
                  ...p, editorial: { ...p.editorial, articles: (p.editorial?.articles ?? []).map((a, j) => j === i ? { ...a, title: v } : a) }
                }))} />
                <AdminField label="Категорія" value={art.category} onChange={v => setForm((p: typeof form) => ({
                  ...p, editorial: { ...p.editorial, articles: (p.editorial?.articles ?? []).map((a, j) => j === i ? { ...a, category: v } : a) }
                }))} />
                <AdminField label="Опис" value={art.description} onChange={v => setForm((p: typeof form) => ({
                  ...p, editorial: { ...p.editorial, articles: (p.editorial?.articles ?? []).map((a, j) => j === i ? { ...a, description: v } : a) }
                }))} multiline rows={3} />
              </div>
            ))}
          </div>
        </div>
      </AdminSection>

      <AdminSection id="reviews" title="Відгуки" isOpen={expanded.reviews ?? true} onToggle={() => toggleSection('reviews')}>
        <AdminField label="Заголовок" value={form.reviews?.title ?? ''} onChange={v => setForm((p: typeof form) => ({ ...p, reviews: { ...p.reviews, title: v } }))} />
        <div className="pt-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Огляди</h3>
          <div className="space-y-4">
            {(form.reviews?.items ?? []).map((item, i) => (
              <div key={item.id} className="p-4 rounded-xl bg-gray-50/80 border border-gray-100 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-medium text-gray-500">Відгук {i + 1}</span>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <AdminField label="Імʼя" value={item.name} onChange={v => setForm((p: typeof form) => ({
                    ...p, reviews: { ...p.reviews, items: (p.reviews?.items ?? []).map((it, j) => j === i ? { ...it, name: v } : it) }
                  }))} />
                  <AdminField label="Дата" value={item.date} onChange={v => setForm((p: typeof form) => ({
                    ...p, reviews: { ...p.reviews, items: (p.reviews?.items ?? []).map((it, j) => j === i ? { ...it, date: v } : it) }
                  }))} />
                </div>
                <AdminField label="Текст відгуку" value={item.text} onChange={v => setForm((p: typeof form) => ({
                  ...p, reviews: { ...p.reviews, items: (p.reviews?.items ?? []).map((it, j) => j === i ? { ...it, text: v } : it) }
                }))} multiline rows={4} />
              </div>
            ))}
          </div>
        </div>
      </AdminSection>

      <div className="flex justify-end pt-2">
        <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 bg-black text-white px-6 py-3 rounded-xl font-bold disabled:opacity-50 hover:bg-gray-800 transition-colors">
          {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
          Зберегти розділи
        </button>
      </div>
    </div>
  );
}

function AdminSections({
  localProducts,
  onEdit,
  onDelete,
  onAdd,
  getProductGradient,
}: {
  localProducts: Product[];
  onEdit: (p: Product) => void;
  onDelete: (id: number, name?: string) => void;
  onAdd: (category: string) => void;
  getProductGradient: (id: number, category: string) => string;
}) {
  const [expanded, setExpanded] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(ADMIN_CATEGORIES.map(c => [c, true]))
  );
  const [search, setSearch] = useState('');

  const byCategory = useMemo(() => {
    const map: Record<string, Product[]> = {};
    const q = search.trim().toLowerCase();
    for (const c of ADMIN_CATEGORIES) map[c] = [];
    for (const p of localProducts) {
      if (q && !(p.name || '').toLowerCase().includes(q) && !(p.tag || '').toLowerCase().includes(q)) continue;
      const cat = String(p.category || '').trim() || 'Інше';
      if (map[cat]) map[cat].push(p);
      else (map['Інше'] = map['Інше'] ?? []).push(p);
    }
    for (const c of Object.keys(map)) {
      map[c] = [...map[c]].sort((a, b) => a.id - b.id);
    }
    return map;
  }, [localProducts, search]);

  const toggle = (cat: string) => setExpanded(prev => ({ ...prev, [cat]: !prev[cat] }));

  const catsToShow = useMemo(() => {
    const list = [...ADMIN_CATEGORIES];
    if ((byCategory['Інше']?.length ?? 0) > 0) list.push('Інше');
    return list;
  }, [byCategory]);

  const totalFiltered = useMemo(() => catsToShow.reduce((s, c) => s + (byCategory[c]?.length ?? 0), 0), [catsToShow, byCategory]);

  return (
    <div className="space-y-4">
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Пошук за назвою або тегом..."
          className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-violet-500 focus:border-transparent outline-none bg-gray-50/50"
        />
        {search && (
          <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
            <X className="w-4 h-4" />
          </button>
        )}
        {search && totalFiltered === 0 && (
          <p className="absolute left-0 right-0 top-full mt-2 text-sm text-gray-500">Нічого не знайдено</p>
        )}
      </div>
      {catsToShow.map(cat => {
        const items = byCategory[cat] ?? [];
        const isOpen = expanded[cat] ?? true;
        const icon = CATEGORY_ICONS[cat];
        return (
          <motion.section
            key={cat}
            initial={false}
            className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden"
          >
            <button
              onClick={() => toggle(cat)}
              className="w-full flex items-center gap-4 px-6 py-4 text-left hover:bg-gray-50/80 transition-colors"
            >
              <div className="w-10 h-10 rounded-xl bg-violet-100 text-violet-600 flex items-center justify-center shrink-0">
                {icon}
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-lg font-bold text-gray-900">{cat}</h2>
                <p className="text-sm text-gray-500">{items.length} товарів</p>
              </div>
              <button
                onClick={e => { e.stopPropagation(); onAdd(cat); }}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-violet-600 text-white text-sm font-medium hover:bg-violet-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Додати
              </button>
              <span className="text-gray-400">
                {isOpen ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
              </span>
            </button>

            <AnimatePresence>
              {isOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div className="px-6 pb-6 pt-2 border-t border-gray-100">
                    {items.length === 0 ? (
                      <div className="py-12 text-center text-gray-400 rounded-xl border-2 border-dashed border-gray-200">
                        <p className="mb-2">Немає товарів у цьому розділі</p>
                        <button
                          onClick={() => onAdd(cat)}
                          className="inline-flex items-center gap-2 text-violet-600 hover:text-violet-700 font-medium"
                        >
                          <Plus className="w-4 h-4" />
                          Додати перший товар
                        </button>
                      </div>
                    ) : (
                      <div className="grid gap-3">
                        {items.map(product => (
                          <div
                            key={product.id}
                            className="flex items-center gap-4 p-4 rounded-xl bg-gray-50/80 hover:bg-gray-100/80 border border-gray-100 transition-colors"
                          >
                            <div className="w-14 h-14 rounded-xl shrink-0 overflow-hidden bg-white shadow-sm">
                              <ProductImage product={product} className="w-full h-full" imgClassName="w-full h-full object-cover" letterSize="xs" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-semibold text-gray-900 truncate">{product.name}</p>
                              <p className="text-sm text-gray-500">{product.tag || '—'} · {product.price}</p>
                            </div>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => onEdit(product)}
                                className="p-2.5 hover:bg-violet-100 text-violet-600 rounded-xl transition-colors"
                                title="Редагувати"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => onDelete(product.id, product.name)}
                                className="p-2.5 hover:bg-red-50 text-red-500 rounded-xl transition-colors"
                                title="Видалити"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.section>
        );
      })}
    </div>
  );
}

function ProductEditModal({ product, onSave, onClose, onUnauthorized, apiUrl, authToken }: {
  product: Product; onSave: (p: Product) => void; onClose: () => void; onUnauthorized?: () => void;
  apiUrl: string; authToken: string;
}) {
  const [form, setForm] = useState(product);
  const [loading, setLoading] = useState(false);
  const [imgError, setImgError] = useState('');
  const [validationError, setValidationError] = useState('');
  const nameInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setForm(product);
    setImgError('');
    setValidationError('');
  }, [product.id]);

  useEffect(() => {
    const t = setTimeout(() => nameInputRef.current?.focus(), 50);
    return () => clearTimeout(t);
  }, [product.id]);

  useEffect(() => {
    const onEsc = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onEsc);
    return () => window.removeEventListener('keydown', onEsc);
  }, [onClose]);

  const resizeAndEncode = (file: File, maxW = 400, maxH = 400, quality = 0.65): Promise<string> => {
    return new Promise((resolve, reject) => {
      const url = URL.createObjectURL(file);
      const img = new Image();
      img.onload = () => {
        URL.revokeObjectURL(url);
        let { width, height } = img;
        if (width > maxW || height > maxH) {
          const r = Math.min(maxW / width, maxH / height);
          width = Math.round(width * r);
          height = Math.round(height * r);
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) { reject(new Error('Canvas')); return; }
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      img.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new Error('Невірне зображення'));
      };
      img.src = url;
    });
  };

  const handleImagePick = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith('image/')) return;
    e.target.value = '';
    setImgError('');
    setLoading(true);
    let dataUrl: string;
    try {
      dataUrl = await resizeAndEncode(file);
      const rawBase64 = dataUrl.replace(/^data:image\/\w+;base64,/, '');
      if (apiUrl && authToken) {
        const res = await fetch(`${apiUrl}/admin/upload-image`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authToken}`,
          },
          body: JSON.stringify({
            base64: rawBase64,
            productId: product.id,
            ext: 'jpg',
            token: authToken,
          }),
        });
        const data = await res.json().catch(() => ({}));
        if (data.ok && data.url) {
          setForm(p => ({ ...p, image: data.url }));
        } else {
          setForm(p => ({ ...p, image: dataUrl }));
          if (res.status === 401) onUnauthorized?.();
          const errMsg = data.error || `HTTP ${res.status}`;
          setImgError(`Завантаження не вдалося: ${errMsg}. Фото збережено локально — натисніть «Зберегти в GitHub» для повторної спроби.`);
        }
      } else {
        setForm(p => ({ ...p, image: dataUrl }));
      }
    } catch (err) {
      try {
        dataUrl = await resizeAndEncode(file);
        setForm(p => ({ ...p, image: dataUrl }));
        setImgError('Фото збережено — натисніть «Зберегти в GitHub»');
      } catch {
        setImgError((err as Error).message || 'Помилка');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSave = () => {
    setValidationError('');
    const name = String(form.name || '').trim();
    if (!name) {
      setValidationError('Введіть назву товару');
      return;
    }
    let price = String(form.price || '').trim();
    if (!price) {
      setValidationError('Введіть ціну');
      return;
    }
    const priceNum = parseInt(price.replace(/\s/g, '').replace('₴', ''), 10);
    if (isNaN(priceNum) || priceNum < 0) {
      setValidationError('Невірний формат ціни (наприклад: 450 ₴)');
      return;
    }
    if (!price.includes('₴')) price = priceNum + ' ₴';
    onSave({ ...form, name, price });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96 }}
        onClick={e => e.stopPropagation()}
        onKeyDown={e => { if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) { e.preventDefault(); handleSave(); } }}
        className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden"
      >
        <div className="bg-gradient-to-br from-violet-50 to-white px-6 py-5 border-b border-gray-100">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-bold text-gray-900">Редагувати товар</h2>
            <button onClick={onClose} className="p-2 hover:bg-white/80 rounded-xl transition-colors">
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
          <p className="text-sm text-gray-500 mt-0.5">#{product.id} · {form.category}</p>
        </div>
        <div className="p-6 space-y-5 max-h-[60vh] overflow-y-auto">
          <div className="flex gap-4 items-start">
            <div className="shrink-0">
              {form.image ? (
                <div className="relative group">
                  <img src={form.image ? (resolveImageUrl(form.image) || form.image) : ''} alt="" className="w-24 h-24 object-cover rounded-xl border-2 border-gray-100 shadow-sm" onError={(e) => { (e.target as HTMLImageElement).style.background = '#f3f4f6'; (e.target as HTMLImageElement).alt = '…'; }} />
                  <button
                    type="button"
                    onClick={() => setForm(p => ({ ...p, image: undefined }))}
                    className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Видалити фото"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ) : (
                <div className="w-24 h-24 rounded-xl bg-gray-100 flex items-center justify-center text-gray-400 text-xs border-2 border-dashed border-gray-200">Фото</div>
              )}
              <label className="mt-2 block">
                <input type="file" accept="image/*" className="hidden" onChange={handleImagePick} disabled={loading} />
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-violet-100 text-violet-700 hover:bg-violet-200 rounded-lg text-xs font-medium cursor-pointer transition-colors disabled:opacity-70">
                  {loading ? <><Loader2 className="w-3 h-3 animate-spin" /> Завантаження…</> : 'Обрати фото'}
                </span>
              </label>
              <p className="mt-1 text-[10px] text-gray-400">Фото зберігається разом з товаром</p>
            </div>
            <div className="flex-1 min-w-0 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Назва</label>
                <input
                  ref={nameInputRef}
                  value={form.name}
                  onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-violet-500 focus:border-transparent outline-none"
                  placeholder="Назва товару"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Ціна</label>
                  <input
                    value={form.price}
                    onChange={e => setForm(p => ({ ...p, price: e.target.value }))}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-violet-500 focus:border-transparent outline-none"
                    placeholder="450 ₴"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Категорія</label>
                  <select
                    value={form.category}
                    onChange={e => setForm(p => ({ ...p, category: e.target.value }))}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-violet-500 focus:border-transparent outline-none bg-white"
                  >
                    {[...ADMIN_CATEGORIES, 'Інше'].map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Опис</label>
                <textarea
                  value={form.description ?? ''}
                  onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                  rows={3}
                  maxLength={300}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-violet-500 focus:border-transparent outline-none resize-y min-h-[80px]"
                  placeholder="Короткий опис товару (до 300 символів)"
                />
                <p className="text-[10px] text-gray-400 mt-0.5">{(form.description ?? '').length}/300</p>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Тег</label>
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {TAG_PRESETS.filter(Boolean).map(t => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setForm(p => ({ ...p, tag: p.tag === t ? '' : t }))}
                      className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${form.tag === t ? 'bg-violet-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
                <input
                  value={form.tag}
                  onChange={e => setForm(p => ({ ...p, tag: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-violet-500 focus:border-transparent outline-none"
                  placeholder="Або введі свій тег..."
                />
              </div>
            </div>
          </div>
          {imgError && (
            <p className={`text-xs px-3 py-2 rounded-lg ${imgError.includes('Збережено') ? 'text-amber-700 bg-amber-50' : 'text-red-500 bg-red-50'}`}>
              {imgError}
            </p>
          )}
          {validationError && <p className="text-xs text-red-500 bg-red-50 px-3 py-2 rounded-lg">{validationError}</p>}
        </div>
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between gap-3">
          <span className="text-xs text-gray-400 hidden sm:inline">Ctrl+Enter — зберегти</span>
          <div className="flex gap-3 ml-auto">
            <button onClick={onClose} className="px-6 py-3 border border-gray-200 rounded-xl font-medium hover:bg-gray-50 transition-colors">
              Скасувати
            </button>
            <button
              onClick={handleSave}
              className="flex-1 min-w-[120px] bg-violet-600 hover:bg-violet-700 text-white py-3 rounded-xl font-semibold transition-colors"
            >
              Зберегти
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
