import React, { useState, useMemo } from 'react';
import { ArrowLeft, Send, Loader2 } from 'lucide-react';
import { motion } from 'motion/react';
import { useStore } from '../store';
import { useProducts, parsePrice } from '../context/ProductsContext';
import { isValidEmail, isValidUAPhone, formatPhoneForSubmit } from '../utils/validation';

function formatPrice(n: number) {
  return n.toLocaleString('uk-UA') + ' ₴';
}

const DELIVERY_OPTIONS = [
  { id: 'self', label: 'Самовивіз' },
  { id: 'nova', label: 'Нова пошта' },
  { id: 'ukr', label: 'Укрпошта' },
  { id: 'region', label: 'Доставка по регіону' },
] as const;

interface FormData {
  name: string;
  phone: string;
  email: string;
  delivery: string;
  city: string;
  address: string;
  comment: string;
}

const initialForm: FormData = {
  name: '',
  phone: '',
  email: '',
  delivery: 'self',
  city: '',
  address: '',
  comment: '',
};

const TELEGRAM_API = (import.meta.env.VITE_TELEGRAM_API_URL || 'https://lumu-pearl.vercel.app/api').replace(/\/$/, '');

async function sendToTelegram(text: string): Promise<{ ok: boolean; error?: string }> {
  const endpoint = `${TELEGRAM_API}/telegram`;
  try {
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
    });
    if (res.ok) return { ok: true };
    const err = await res.text();
    return { ok: false, error: err || `HTTP ${res.status}` };
  } catch (e) {
    const msg = (e as Error).message || 'Помилка мережі';
    return { ok: false, error: msg.includes('fetch') || msg.includes('Network') ? 'API недоступний. Перевірте VITE_TELEGRAM_API_URL в GitHub Secrets.' : msg };
  }
}

export const CheckoutForm = ({ onBack, onSuccess }: { onBack: () => void; onSuccess: () => void }) => {
  const { cart } = useStore();
  const { products } = useProducts();
  const cartTotal = useMemo(() => {
    const total = cart.reduce((s, i) => {
      const p = products.find(x => x.id === i.product.id) || i.product;
      return s + parsePrice(p.price) * i.qty;
    }, 0);
    return formatPrice(total);
  }, [cart, products]);
  const [form, setForm] = useState<FormData>(initialForm);
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});
  const [loading, setLoading] = useState(false);

  const update = (k: keyof FormData, v: string) => {
    setForm(prev => ({ ...prev, [k]: v }));
    if (errors[k]) setErrors(prev => ({ ...prev, [k]: '' }));
  };

  const validate = (): boolean => {
    const e: Partial<Record<keyof FormData, string>> = {};
    if (!form.name.trim()) e.name = 'Введіть ім\'я';
    if (!form.phone.trim()) e.phone = 'Введіть телефон';
    else if (!isValidUAPhone(form.phone)) e.phone = 'Невірний формат (068 364 22 05 або +380 99 123 45 67)';
    if (!form.email.trim()) e.email = 'Введіть email';
    else if (!isValidEmail(form.email)) e.email = 'Невірний email';
    if (!form.city.trim()) e.city = 'Введіть місто';
    const isSelfPickup = form.delivery === 'self';
    if (!isSelfPickup && !form.address.trim()) e.address = 'Введіть адресу доставки';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const escapeHtml = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    if (cart.length === 0) {
      setErrors({ name: 'Кошик порожній. Додайте товари.' });
      return;
    }
    setLoading(true);
    const phone = formatPhoneForSubmit(form.phone);
    const items = cart.map(({ product, qty }, i) => {
      const p = products.find(x => x.id === product.id) || product;
      const priceNum = parsePrice(p.price);
      const subtotal = priceNum * qty;
      const tagPart = p.tag ? ` / ${escapeHtml(p.tag)}` : '';
      return `${i + 1}. ID:${p.id} | ${escapeHtml(p.name)} | ${p.category}${tagPart} | ${qty} шт. × ${p.price} = ${subtotal.toLocaleString('uk-UA')} ₴`;
    });
    const deliveryLabel = DELIVERY_OPTIONS.find(d => d.id === form.delivery)?.label ?? form.delivery;
    const lines = [
      '🛒 <b>Нове замовлення</b>',
      '',
      `👤 ${escapeHtml(form.name.trim())}`,
      `📞 ${phone}`,
      `✉️ ${escapeHtml(form.email.trim())}`,
      `🚚 <b>Доставка:</b> ${escapeHtml(deliveryLabel)}`,
      form.delivery === 'self' ? `📍 ${escapeHtml(form.city.trim())}` : `📍 ${escapeHtml(form.city.trim())}, ${escapeHtml(form.address.trim())}`,
      form.comment.trim() ? `💬 ${escapeHtml(form.comment.trim())}` : '',
      '',
      '📦 <b>Товари:</b>',
      ...items,
      '',
      `💰 <b>Разом: ${cartTotal}</b>`,
    ];
    const text = lines.filter(Boolean).join('\n');
    const result = await sendToTelegram(text);
    setLoading(false);
    if (result.ok) onSuccess();
    else setErrors({ name: result.error || 'Помилка відправки. Спробуйте ще раз або зателефонуйте.' });
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="flex flex-col h-full"
    >
      <div className="p-6 border-b border-gray-100 flex items-center gap-3">
        <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h2 className="text-lg font-bold uppercase tracking-wider">Оформлення</h2>
      </div>

      <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 flex flex-col gap-4">
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">Ім'я *</label>
          <input
            value={form.name}
            onChange={e => update('name', e.target.value)}
            className={`w-full px-4 py-3 rounded-xl border ${errors.name ? 'border-red-300' : 'border-gray-200'} focus:outline-none focus:ring-2 focus:ring-black/20`}
            placeholder="Іван Петренко"
          />
          {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
        </div>
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">Телефон *</label>
          <input
            value={form.phone}
            onChange={e => update('phone', e.target.value)}
            className={`w-full px-4 py-3 rounded-xl border ${errors.phone ? 'border-red-300' : 'border-gray-200'} focus:outline-none focus:ring-2 focus:ring-black/20`}
            placeholder="099 123 45 67"
          />
          {errors.phone && <p className="text-xs text-red-500 mt-1">{errors.phone}</p>}
        </div>
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">Email *</label>
          <input
            type="email"
            value={form.email}
            onChange={e => update('email', e.target.value)}
            className={`w-full px-4 py-3 rounded-xl border ${errors.email ? 'border-red-300' : 'border-gray-200'} focus:outline-none focus:ring-2 focus:ring-black/20`}
            placeholder="email@example.com"
          />
          {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
        </div>
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">Спосіб доставки *</label>
          <div className="grid grid-cols-2 gap-2">
            {DELIVERY_OPTIONS.map(d => (
              <label
                key={d.id}
                className={`flex items-center gap-2 px-4 py-3 rounded-xl border cursor-pointer transition-colors ${
                  form.delivery === d.id ? 'border-black bg-black/5 ring-2 ring-black/20' : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <input
                  type="radio"
                  name="delivery"
                  value={d.id}
                  checked={form.delivery === d.id}
                  onChange={() => update('delivery', d.id)}
                  className="sr-only"
                />
                <span className="text-sm font-medium">{d.label}</span>
              </label>
            ))}
          </div>
        </div>
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">Місто *</label>
          <input
            value={form.city}
            onChange={e => update('city', e.target.value)}
            className={`w-full px-4 py-3 rounded-xl border ${errors.city ? 'border-red-300' : 'border-gray-200'} focus:outline-none focus:ring-2 focus:ring-black/20`}
            placeholder="Ірпінь"
          />
          {errors.city && <p className="text-xs text-red-500 mt-1">{errors.city}</p>}
        </div>
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">
            {form.delivery === 'self' ? 'Адреса / примітка (опційно)' : 'Адреса доставки *'}
          </label>
          <input
            value={form.address}
            onChange={e => update('address', e.target.value)}
            className={`w-full px-4 py-3 rounded-xl border ${errors.address ? 'border-red-300' : 'border-gray-200'} focus:outline-none focus:ring-2 focus:ring-black/20`}
            placeholder={form.delivery === 'self' ? 'Наприклад: зателефонуйте перед приїздом' : 'вул. Григорія Сковороди 11/7'}
          />
          {errors.address && <p className="text-xs text-red-500 mt-1">{errors.address}</p>}
        </div>
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">Коментар</label>
          <textarea
            value={form.comment}
            onChange={e => update('comment', e.target.value)}
            rows={3}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-black/20 resize-none"
            placeholder="Побажання до замовлення..."
          />
        </div>

        <div className="mt-auto pt-4 border-t border-gray-100 space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-500 uppercase tracking-wider font-medium">Разом</span>
            <span className="text-xl font-bold">{cartTotal}</span>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-black text-white py-4 rounded-full font-bold uppercase tracking-wider hover:bg-gray-800 transition-colors text-sm flex items-center justify-center gap-2 disabled:opacity-70"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-4 h-4" />}
            {loading ? 'Відправка...' : 'Підтвердити замовлення'}
          </button>
        </div>
      </form>
    </motion.div>
  );
};
