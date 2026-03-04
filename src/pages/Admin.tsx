import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Lock, Save, Plus, Trash2, Edit2, X, Loader2, LogOut, ChevronDown, ChevronRight, BookOpen, Gamepad2, Palette, Sparkles, Dice5 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useProducts } from '../context/ProductsContext';
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
const DEFAULT_API = 'https://lumu-api.vercel.app/api';
const API_URL = (() => {
  const env = (import.meta.env.VITE_TELEGRAM_API_URL || '').replace(/\/telegram\/?$/, '').replace(/\/$/, '');
  if (env) return env;
  if (typeof window !== 'undefined') {
    const o = window.location.origin;
    if (o.includes('github.io') || o.includes('lumu.com.ua') || o.includes('localhost') || o.includes('127.0.0.1')) return DEFAULT_API;
    return o + '/api';
  }
  return DEFAULT_API;
})();

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
  const [editing, setEditing] = useState<Product | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [localProducts, setLocalProducts] = useState<Product[]>([]);
  const skipSyncRef = useRef(false);

  useEffect(() => {
    if (skipSyncRef.current) {
      skipSyncRef.current = false;
      return;
    }
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

  const handleAddProduct = (category: string) => {
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
      setLocalProducts(prev => prev.filter(p => p.id !== id));
      setEditing(null);
    }
  };

  const handleSaveAll = async () => {
    setSaveError('');
    setSaving(true);
    try {
      let payload = localProducts.map(p => ({
        id: Number(p.id),
        name: String(p.name || '').trim(),
        price: String(p.price || '').trim(),
        category: String(p.category || 'Книги'),
        tag: String(p.tag || '').trim(),
        ...(p.image && { image: String(p.image) }),
      }));
      const failedUploadIds = new Set<number>();
      let strippedCount = 0;
      for (let i = 0; i < payload.length; i++) {
        const img = payload[i].image;
        if (img && img.startsWith('data:image/')) {
          const rawBase64 = img.replace(/^data:image\/\w+;base64,/, '').replace(/\s/g, '');
          if (rawBase64.length > 500_000) {
            payload[i] = { ...payload[i], image: undefined };
            failedUploadIds.add(payload[i].id);
            strippedCount++;
            continue;
          }
          try {
            const upRes = await fetch(`${API_URL}/admin/upload-image`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${auth?.token}`,
              },
              body: JSON.stringify({ base64: rawBase64, productId: payload[i].id, ext: 'jpg' }),
            });
            const upData = await upRes.json().catch(() => ({}));
            if (upData.ok && upData.url) {
              payload[i] = { ...payload[i], image: upData.url };
            } else {
              payload[i] = { ...payload[i], image: undefined };
              failedUploadIds.add(payload[i].id);
              strippedCount++;
            }
          } catch {
            payload[i] = { ...payload[i], image: undefined };
            failedUploadIds.add(payload[i].id);
            strippedCount++;
          }
        }
      }
      const toSend = payload.map(p => {
        const img = p.image;
        if (img && img.startsWith('data:')) return { ...p, image: undefined };
        return p;
      });
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 60000);
      const res = await fetch(`${API_URL}/admin/products`, {
        method: 'PUT',
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${auth?.token}`,
        },
        body: JSON.stringify({ products: toSend }),
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
        setSaveError('');
        await refetch();
        showToast(strippedCount > 0 ? `Збережено. ${strippedCount} фото залишилось у формі — спробуйте ще раз` : 'Збережено в GitHub');
      } else {
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
          <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-xl text-sm flex items-start justify-between gap-3">
            <span>{saveError}</span>
            <button onClick={() => setSaveError('')} className="p-1 hover:bg-red-100 rounded-lg shrink-0" title="Закрити">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {loading ? (
          <div className="py-20 text-center text-gray-400">Завантаження...</div>
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
          apiUrl={API_URL}
          authToken={auth?.token ?? ''}
        />
        )}
      </AnimatePresence>
    </motion.div>
  );
};

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


  const byCategory = useMemo(() => {
    const map: Record<string, Product[]> = {};
    for (const c of ADMIN_CATEGORIES) map[c] = [];
    for (const p of localProducts) {
      if (map[p.category]) map[p.category].push(p);
      else (map['Інше'] = map['Інше'] ?? []).push(p);
    }
    for (const c of Object.keys(map)) {
      map[c] = [...map[c]].sort((a, b) => a.id - b.id);
    }
    return map;
  }, [localProducts]);

  const toggle = (cat: string) => setExpanded(prev => ({ ...prev, [cat]: !prev[cat] }));

  const catsToShow = useMemo(() => {
    const list = [...ADMIN_CATEGORIES];
    if ((byCategory['Інше']?.length ?? 0) > 0) list.push('Інше');
    return list;
  }, [byCategory]);

  return (
    <div className="space-y-4">
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

function ProductEditModal({ product, onSave, onClose, apiUrl, authToken }: {
  product: Product; onSave: (p: Product) => void; onClose: () => void;
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
          }),
        });
        const data = await res.json().catch(() => ({}));
        if (data.ok && data.url) {
          setForm(p => ({ ...p, image: data.url }));
        } else {
          setForm(p => ({ ...p, image: dataUrl }));
          setImgError(data.error || 'Фото збережено — натисніть «Зберегти в GitHub»');
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
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Тег</label>
                <input
                  value={form.tag}
                  onChange={e => setForm(p => ({ ...p, tag: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-violet-500 focus:border-transparent outline-none"
                  placeholder="Хіт продажу, New, Розмальовки..."
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
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex items-center gap-3">
          <button
            onClick={handleSave}
            className="flex-1 bg-violet-600 hover:bg-violet-700 text-white py-3 rounded-xl font-semibold transition-colors"
          >
            Зберегти
          </button>
          <button onClick={onClose} className="px-6 py-3 border border-gray-200 rounded-xl font-medium hover:bg-gray-50 transition-colors">
            Скасувати
          </button>
        </div>
      </motion.div>
    </div>
  );
}
