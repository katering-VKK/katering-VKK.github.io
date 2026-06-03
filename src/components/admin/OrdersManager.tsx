import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Package, Truck, CheckCircle, Clock, X, ChevronDown, ChevronRight, Search, Trash2, Download, BarChart3, Users, TrendingUp, RefreshCw, Cloud, CloudOff, Loader2, AlertTriangle } from 'lucide-react';
import { fetchOrders, updateOrderStatus, deleteOrderApi, writeOrdersCache, readOrdersCache, adminApiBase } from '../../utils/ordersApi';

export interface Order {
  id: string;
  date: string;
  customer: { name: string; phone: string; email?: string; city?: string; address?: string; comment?: string };
  items: { productId: number; name: string; price: string; qty: number }[];
  total: string;
  status: OrderStatus;
  delivery?: { id: string; label: string };
  source?: string;
  updatedAt?: string;
  tg?: { chatId?: string | number; messageId?: number };
}

export type OrderStatus = 'new' | 'processing' | 'shipped' | 'delivered' | 'cancelled';

const STATUS_CONFIG: Record<OrderStatus, { label: string; color: string; icon: React.ReactNode }> = {
  new: { label: 'Нове', color: 'bg-blue-100 text-blue-800 border-blue-200', icon: <Clock className="w-4 h-4" /> },
  processing: { label: 'В обробці', color: 'bg-amber-100 text-amber-800 border-amber-200', icon: <Package className="w-4 h-4" /> },
  shipped: { label: 'Відправлено', color: 'bg-violet-100 text-violet-800 border-violet-200', icon: <Truck className="w-4 h-4" /> },
  delivered: { label: 'Доставлено', color: 'bg-green-100 text-green-800 border-green-200', icon: <CheckCircle className="w-4 h-4" /> },
  cancelled: { label: 'Скасовано', color: 'bg-red-100 text-red-800 border-red-200', icon: <X className="w-4 h-4" /> },
};

const STATUS_ORDER: OrderStatus[] = ['new', 'processing', 'shipped', 'delivered', 'cancelled'];

function parseOrderMoney(value: string) {
  return parseInt(String(value || '').replace(/\s/g, '').replace('₴', ''), 10) || 0;
}

function formatOrderMoney(value: number) {
  return value.toLocaleString('uk-UA') + ' ₴';
}

function csvCell(value: unknown) {
  return `"${String(value ?? '').replace(/"/g, '""')}"`;
}

function downloadOrdersFile(content: string, filename: string, type: string) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function buildOrdersCsv(orders: Order[]) {
  return [
    ['id', 'date', 'status', 'customer', 'phone', 'email', 'city', 'address', 'items', 'total', 'comment'].map(csvCell).join(','),
    ...orders.map(order => [
      order.id,
      order.date,
      order.status,
      order.customer.name,
      order.customer.phone,
      order.customer.email,
      order.customer.city,
      order.customer.address,
      order.items.map(item => `${item.name} x${item.qty} (${item.price})`).join('; '),
      order.total,
      order.customer.comment,
    ].map(csvCell).join(',')),
  ].join('\n');
}

export function OrdersManager({ onSessionExpired }: { onSessionExpired?: () => void } = {}) {
  const [orders, setOrders] = useState<Order[]>(() => readOrdersCache());
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<OrderStatus | 'all'>('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [syncing, setSyncing] = useState(false);
  const [source, setSource] = useState<'server' | 'cache' | null>(null);
  const [lastSync, setLastSync] = useState<Date | null>(null);
  const [loadError, setLoadError] = useState('');
  const [actionError, setActionError] = useState('');
  const [pendingId, setPendingId] = useState<string | null>(null);

  const apiConfigured = Boolean(adminApiBase());

  const load = useCallback(async () => {
    setSyncing(true);
    setLoadError('');
    const res = await fetchOrders();
    setOrders(res.orders);
    setSource(res.source);
    if (res.ok) setLastSync(new Date());
    if (res.unauthorized) onSessionExpired?.();
    else if (!res.ok && apiConfigured) setLoadError(res.error || 'Не вдалося завантажити замовлення');
    setSyncing(false);
  }, [apiConfigured, onSessionExpired]);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    if (!apiConfigured) return;
    const onFocus = () => load();
    window.addEventListener('focus', onFocus);
    return () => window.removeEventListener('focus', onFocus);
  }, [apiConfigured, load]);

  const filtered = useMemo(() => {
    let list = orders;
    if (statusFilter !== 'all') list = list.filter(o => o.status === statusFilter);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(o =>
        o.customer.name.toLowerCase().includes(q) ||
        o.customer.phone.includes(q) ||
        o.id.includes(q) ||
        o.items.some(i => i.name.toLowerCase().includes(q))
      );
    }
    return [...list].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [orders, search, statusFilter]);

  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = { all: orders.length };
    STATUS_ORDER.forEach(s => { counts[s] = orders.filter(o => o.status === s).length; });
    return counts;
  }, [orders]);

  const summary = useMemo(() => {
    const validOrders = orders.filter(order => order.status !== 'cancelled');
    const revenue = validOrders.reduce((sum, order) => sum + parseOrderMoney(order.total), 0);
    const active = orders.filter(order => order.status === 'new' || order.status === 'processing').length;
    const avg = validOrders.length ? Math.round(revenue / validOrders.length) : 0;
    const customers = new Set(orders.map(order => order.customer.phone).filter(Boolean)).size;
    return { revenue, active, avg, customers };
  }, [orders]);

  const updateStatus = async (id: string, status: OrderStatus) => {
    const prev = orders;
    const next = orders.map(o => o.id === id ? { ...o, status } : o);
    setOrders(next);
    writeOrdersCache(next);
    setActionError('');
    if (!apiConfigured) return; // локальний режим (бекенд не налаштовано)
    setPendingId(id);
    const res = await updateOrderStatus(id, status);
    setPendingId(null);
    if (!res.ok) {
      setOrders(prev);
      writeOrdersCache(prev);
      if (res.unauthorized) onSessionExpired?.();
      else setActionError(res.error || 'Не вдалося змінити статус');
    }
  };

  const deleteOrder = async (id: string) => {
    if (!confirm('Видалити замовлення?')) return;
    const prev = orders;
    const next = orders.filter(o => o.id !== id);
    setOrders(next);
    writeOrdersCache(next);
    if (expandedId === id) setExpandedId(null);
    setActionError('');
    if (!apiConfigured) return; // локальний режим
    const res = await deleteOrderApi(id);
    if (!res.ok) {
      setOrders(prev);
      writeOrdersCache(prev);
      if (res.unauthorized) onSessionExpired?.();
      else setActionError(res.error || 'Не вдалося видалити замовлення');
    }
  };

  const exportCsv = () => {
    downloadOrdersFile('﻿' + buildOrdersCsv(orders), `lumu-orders-${new Date().toISOString().slice(0, 10)}.csv`, 'text/csv;charset=utf-8');
  };

  const exportJson = () => {
    downloadOrdersFile(JSON.stringify(orders, null, 2), `lumu-orders-${new Date().toISOString().slice(0, 10)}.json`, 'application/json;charset=utf-8');
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <OrderSummaryCard icon={<Package className="w-4 h-4" />} label="Черга" value={summary.active.toLocaleString('uk-UA')} hint="нові та в обробці" />
        <OrderSummaryCard icon={<TrendingUp className="w-4 h-4" />} label="Сума" value={formatOrderMoney(summary.revenue)} hint="без скасованих" />
        <OrderSummaryCard icon={<BarChart3 className="w-4 h-4" />} label="Середній чек" value={formatOrderMoney(summary.avg)} hint="за замовленням" />
        <OrderSummaryCard icon={<Users className="w-4 h-4" />} label="Клієнти" value={summary.customers.toLocaleString('uk-UA')} hint="унікальні телефони" />
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Пошук замовлень..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
          />
        </div>
        <button
          onClick={load}
          disabled={syncing}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-black text-white text-sm font-bold hover:bg-gray-800 disabled:opacity-60"
        >
          {syncing ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
          Оновити
        </button>
        <button
          onClick={exportCsv}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-bold text-gray-600 hover:bg-gray-50 hover:text-black"
        >
          <Download className="w-4 h-4" />
          CSV
        </button>
        <button
          onClick={exportJson}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-bold text-gray-600 hover:bg-gray-50 hover:text-black"
        >
          <Download className="w-4 h-4" />
          JSON
        </button>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap gap-2">
          {(['all', ...STATUS_ORDER] as const).map(s => {
            const cfg = s === 'all' ? { label: 'Всі', color: 'bg-gray-100 text-gray-700' } : STATUS_CONFIG[s];
            const count = statusCounts[s] || 0;
            return (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${statusFilter === s ? 'ring-2 ring-violet-500 ring-offset-1' : ''} ${cfg.color}`}
              >
                {cfg.label} ({count})
              </button>
            );
          })}
        </div>
        <div className="inline-flex items-center gap-1.5 text-xs text-gray-500">
          {source === 'server' ? <Cloud className="w-3.5 h-3.5 text-emerald-500" /> : source === 'cache' ? <CloudOff className="w-3.5 h-3.5 text-amber-500" /> : null}
          <span>
            {source === 'server' ? 'Сервер' : source === 'cache' ? 'Кеш' : ''}
            {lastSync ? ` · ${lastSync.toLocaleTimeString('uk-UA', { hour: '2-digit', minute: '2-digit' })}` : ''}
          </span>
        </div>
      </div>

      {(loadError || actionError) && (
        <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
          <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
          <span>{actionError || loadError}</span>
        </div>
      )}

      {filtered.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <Package className="w-12 h-12 mx-auto mb-3 opacity-50" />
          {!apiConfigured ? (
            <p className="text-sm">API замовлень не налаштовано (VITE_ORDER_API_URL). Зʼявиться після деплою воркера.</p>
          ) : (
            <p className="text-sm">{orders.length === 0 ? 'Замовлень поки немає' : 'Нічого не знайдено'}</p>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(order => {
            const cfg = STATUS_CONFIG[order.status];
            const isOpen = expandedId === order.id;
            const isPending = pendingId === order.id;
            return (
              <div key={order.id} className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
                <button
                  onClick={() => setExpandedId(isOpen ? null : order.id)}
                  className="w-full p-4 flex items-center gap-4 hover:bg-gray-50 transition-colors text-left"
                >
                  <div className="flex items-center gap-2 shrink-0">
                    {isOpen ? <ChevronDown className="w-4 h-4 text-gray-400" /> : <ChevronRight className="w-4 h-4 text-gray-400" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-sm text-gray-900">{order.id}</span>
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold border ${cfg.color}`}>
                        {cfg.icon} {cfg.label}
                      </span>
                      {isPending && <Loader2 className="w-3.5 h-3.5 animate-spin text-gray-400" />}
                    </div>
                    <p className="text-sm text-gray-500 mt-0.5">{order.customer.name} &middot; {order.customer.phone}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-bold text-sm">{order.total}</p>
                    <p className="text-xs text-gray-400">{new Date(order.date).toLocaleDateString('uk-UA')}</p>
                  </div>
                </button>
                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="px-4 pb-4 border-t border-gray-100 pt-4 space-y-4">
                        <div className="grid gap-3 sm:grid-cols-2">
                          <div>
                            <p className="text-xs font-bold text-gray-500 uppercase mb-1">{'Клієнт'}</p>
                            <p className="text-sm">{order.customer.name}</p>
                            <p className="text-sm text-gray-500">{order.customer.phone}</p>
                            {order.customer.email && <p className="text-sm text-gray-500">{order.customer.email}</p>}
                            {order.customer.city && <p className="text-sm text-gray-500">{order.customer.city}</p>}
                            {order.delivery?.label && <p className="text-sm text-gray-500">Доставка: {order.delivery.label}</p>}
                            {order.customer.address && <p className="text-sm text-gray-500">{order.customer.address}</p>}
                            {order.customer.comment && <p className="text-sm text-gray-400 italic mt-1">{order.customer.comment}</p>}
                          </div>
                          <div>
                            <p className="text-xs font-bold text-gray-500 uppercase mb-1">{'Товари'}</p>
                            {order.items.map((item, i) => (
                              <div key={i} className="flex justify-between text-sm py-0.5">
                                <span>{item.name} &times; {item.qty}</span>
                                <span className="text-gray-500">{item.price}</span>
                              </div>
                            ))}
                            <div className="flex justify-between text-sm font-bold border-t border-gray-100 mt-2 pt-2">
                              <span>{'Разом'}</span>
                              <span>{order.total}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-gray-100">
                          <span className="text-xs text-gray-500 mr-2">{'Змінити статус:'}</span>
                          {STATUS_ORDER.map(s => (
                            <button
                              key={s}
                              onClick={() => updateStatus(order.id, s)}
                              disabled={order.status === s || isPending}
                              className={`px-2.5 py-1 rounded-lg text-xs font-bold border transition-all disabled:cursor-not-allowed ${order.status === s ? 'ring-2 ring-violet-500 opacity-100' : 'opacity-60 hover:opacity-100'} ${STATUS_CONFIG[s].color}`}
                            >
                              {STATUS_CONFIG[s].label}
                            </button>
                          ))}
                          <button
                            onClick={() => deleteOrder(order.id)}
                            className="ml-auto p-1.5 rounded-lg text-red-500 hover:bg-red-50"
                            title="Видалити"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function OrderSummaryCard({ icon, label, value, hint }: { icon: React.ReactNode; label: string; value: string; hint: string }) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
      <div className="flex items-center gap-2 text-gray-400">
        {icon}
        <p className="text-xs font-bold uppercase tracking-wider">{label}</p>
      </div>
      <p className="mt-2 text-xl font-black text-gray-950">{value}</p>
      <p className="mt-1 text-xs text-gray-500">{hint}</p>
    </div>
  );
}
