import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Lock, Save, Plus, Trash2, Edit2, X, Loader2, LogOut } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useProducts } from '../context/ProductsContext';
import { getProductGradient } from '../data/products';
import type { Product } from '../data/products';
import { categories } from '../data/products';

const ADMIN_KEY = 'lumu_admin';
const API_URL = import.meta.env.VITE_TELEGRAM_API_URL
  ? import.meta.env.VITE_TELEGRAM_API_URL.replace(/\/telegram\/?$/, '').replace(/\/$/, '')
  : '';

export const Admin = () => {
  const { products, loading, refetch } = useProducts();
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
  const [editing, setEditing] = useState<Product | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [localProducts, setLocalProducts] = useState<Product[]>([]);

  useEffect(() => {
    setLocalProducts(products);
  }, [products]);

  useEffect(() => {
    if (!API_URL) return;
    fetch(`${API_URL}/admin/health`)
      .then(r => r.json())
      .then(d => setApiStatus(d.configured ? 'ok' : 'no-token'))
      .catch(() => setApiStatus('error'));
  }, [API_URL]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
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
  };

  const handleSaveProduct = (updated: Product) => {
    setLocalProducts(prev => prev.map(p => p.id === updated.id ? updated : p));
    setEditing(null);
  };

  const handleAddProduct = () => {
    const maxId = localProducts.reduce((m, p) => Math.max(m, p.id), 0);
    const newProduct: Product = {
      id: maxId + 1,
      name: 'Новий товар',
      price: '0 ₴',
      category: 'Книги',
      tag: '',
    };
    setLocalProducts(prev => [...prev, newProduct]);
    setEditing(newProduct);
  };

  const handleDeleteProduct = (id: number) => {
    if (confirm('Видалити цей товар?')) {
      setLocalProducts(prev => prev.filter(p => p.id !== id));
      setEditing(null);
    }
  };

  const handleSaveAll = async () => {
    setSaveError('');
    setSaving(true);
    try {
      const payload = localProducts.map(p => ({
        id: Number(p.id),
        name: String(p.name || '').trim(),
        price: String(p.price || '').trim(),
        category: String(p.category || 'Книги'),
        tag: String(p.tag || '').trim(),
        ...(p.image && { image: String(p.image) }),
      }));
      const res = await fetch(`${API_URL}/admin/products`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${auth?.token}`,
        },
        body: JSON.stringify({ products: payload }),
      });
      const text = await res.text();
      let data: { ok?: boolean; error?: string } = {};
      try {
        data = JSON.parse(text);
      } catch {
        setSaveError(text || `HTTP ${res.status}`);
        return;
      }
      if (data.ok) {
        await refetch();
      } else {
        setSaveError(data.error || `Помилка ${res.status}`);
      }
    } catch (err) {
      setSaveError((err as Error).message || 'Помилка з\'єднання');
    } finally {
      setSaving(false);
    }
  };

  if (!API_URL) {
    return (
      <div className="min-h-screen pt-28 px-6 flex flex-col items-center justify-center">
        <p className="text-gray-500">Адмін-панель не налаштована (відсутній API)</p>
        <Link to="/" className="mt-4 text-violet-600 hover:underline">На головну</Link>
      </div>
    );
  }

  if (!auth) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="min-h-screen pt-28 px-6 flex flex-col items-center justify-center"
      >
        <div className="w-full max-w-sm">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-xl bg-violet-100 flex items-center justify-center">
              <Lock className="w-6 h-6 text-violet-600" />
            </div>
            <h1 className="text-2xl font-bold">Вхід в адмін-панель</h1>
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
              API недоступний. Перевірте VITE_TELEGRAM_API_URL = https://lumu-api.vercel.app/api
            </p>
          )}
          <p className="mt-4 text-xs text-gray-400 text-center">
            Пароль — це <code className="bg-gray-100 px-1 rounded">ADMIN_TOKEN</code> з Vercel → Settings → Environment Variables
          </p>
          <Link to="/" className="block mt-6 text-center text-sm text-gray-500 hover:text-black">
            На головну
          </Link>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen pt-28 pb-20 px-6"
    >
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-12">
          <h1 className="text-2xl font-bold">Редагування товарів</h1>
          <div className="flex items-center gap-3">
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 text-sm text-gray-500 hover:text-black"
            >
              <LogOut className="w-4 h-4" />
              Вийти
            </button>
            <button
              onClick={handleSaveAll}
              disabled={saving}
              className="flex items-center gap-2 bg-black text-white px-6 py-2.5 rounded-xl font-bold text-sm disabled:opacity-70"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Зберегти в GitHub
            </button>
          </div>
        </div>

        {saveError && (
          <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-xl text-sm">{saveError}</div>
        )}

        {loading ? (
          <div className="py-20 text-center text-gray-400">Завантаження...</div>
        ) : (
          <>
            <button
              onClick={handleAddProduct}
              className="mb-6 flex items-center gap-2 text-violet-600 hover:text-violet-700 font-medium"
            >
              <Plus className="w-4 h-4" />
              Додати товар
            </button>

            <div className="grid gap-4">
              {localProducts.map(product => (
                <div
                  key={product.id}
                  className="flex items-center gap-4 p-4 rounded-xl border border-gray-200 hover:border-gray-300"
                >
                  <div className="w-16 h-16 rounded-xl shrink-0 overflow-hidden bg-gray-100">
                    {product.image ? (
                      <img src={product.image} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center" style={{ background: getProductGradient(product.id, product.category) }}>
                        <span className="text-white/40 text-2xl font-black">{product.name.charAt(0)}</span>
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold truncate">{product.name}</p>
                    <p className="text-sm text-gray-500">{product.category} · {product.tag || '—'} · {product.price}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setEditing(product)}
                      className="p-2 hover:bg-gray-100 rounded-lg"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteProduct(product.id)}
                      className="p-2 hover:bg-red-50 text-red-500 rounded-lg"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {editing && (
        <ProductEditModal
          product={editing}
          onSave={handleSaveProduct}
          onClose={() => setEditing(null)}
        />
      )}
    </motion.div>
  );
};

function ProductEditModal({ product, onSave, onClose }: { product: Product; onSave: (p: Product) => void; onClose: () => void }) {
  const [form, setForm] = useState(product);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');

  const API_URL = import.meta.env.VITE_TELEGRAM_API_URL
    ? import.meta.env.VITE_TELEGRAM_API_URL.replace(/\/telegram\/?$/, '').replace(/\/$/, '')
    : '';
  const auth = JSON.parse(sessionStorage.getItem('lumu_admin') || '{}')?.token;

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith('image/')) return;
    setUploadError('');
    setUploading(true);
    try {
      const base64 = await new Promise<string>((resolve, reject) => {
        const r = new FileReader();
        r.onload = () => resolve(String(r.result));
        r.onerror = reject;
        r.readAsDataURL(file);
      });
      const ext = file.name.split('.').pop() || 'jpg';
      const res = await fetch(`${API_URL}/admin/upload-image`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${auth}` },
        body: JSON.stringify({ base64, productId: product.id, ext }),
      });
      const data = await res.json();
      if (data.ok && data.url) {
        setForm(p => ({ ...p, image: data.url }));
      } else {
        setUploadError(data.error || 'Помилка завантаження');
      }
    } catch {
      setUploadError('Помилка з\'єднання');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        onClick={e => e.stopPropagation()}
        className="bg-white rounded-2xl shadow-xl max-w-lg w-full p-6"
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-bold">Редагувати товар #{product.id}</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-500 mb-1">Фото</label>
            <div className="flex items-center gap-4">
              {form.image ? (
                <img src={form.image} alt="" className="w-20 h-20 object-cover rounded-xl border" />
              ) : (
                <div className="w-20 h-20 rounded-xl bg-gray-100 flex items-center justify-center text-gray-400 text-xs">Немає</div>
              )}
              <label className="cursor-pointer">
                <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} disabled={uploading} />
                <span className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-xl text-sm font-medium text-gray-700">
                  {uploading ? 'Завантаження...' : 'Завантажити фото'}
                </span>
              </label>
            </div>
            {uploadError && <p className="text-xs text-red-500 mt-1">{uploadError}</p>}
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 mb-1">Назва</label>
            <input
              value={form.name}
              onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
              className="w-full px-4 py-2 rounded-xl border border-gray-200"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 mb-1">Ціна</label>
            <input
              value={form.price}
              onChange={e => setForm(p => ({ ...p, price: e.target.value }))}
              className="w-full px-4 py-2 rounded-xl border border-gray-200"
              placeholder="450 ₴"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 mb-1">Категорія</label>
            <select
              value={form.category}
              onChange={e => setForm(p => ({ ...p, category: e.target.value }))}
              className="w-full px-4 py-2 rounded-xl border border-gray-200"
            >
              {categories.filter(c => c !== 'Всі' && c !== 'Хіт продажу').map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 mb-1">Тег / підкатегорія</label>
            <input
              value={form.tag}
              onChange={e => setForm(p => ({ ...p, tag: e.target.value }))}
              className="w-full px-4 py-2 rounded-xl border border-gray-200"
              placeholder="Хіт продажу, New, Розмальовки..."
            />
          </div>
        </div>
        <div className="mt-6 flex gap-3">
          <button
            onClick={() => onSave(form)}
            className="flex-1 bg-black text-white py-3 rounded-xl font-bold"
          >
            Зберегти
          </button>
          <button onClick={onClose} className="px-6 py-3 border border-gray-200 rounded-xl font-medium">
            Скасувати
          </button>
        </div>
      </motion.div>
    </div>
  );
}
