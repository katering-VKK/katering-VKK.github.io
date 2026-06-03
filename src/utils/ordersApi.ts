import type { Order, OrderStatus } from '../components/admin/OrdersManager';

// Сесійний токен адмінки зберігається тут (видає Worker /login).
const ADMIN_KEY = 'lumu_admin';
// Локальний кеш замовлень — джерело для дашборда + офлайн-фолбек.
const ORDERS_CACHE_KEY = 'lumu_admin_orders';

/** Базовий URL Worker'а (той самий, що приймає замовлення). Без хвостового слешу. */
export function adminApiBase(): string {
  return String(import.meta.env.VITE_ORDER_API_URL || '').trim().replace(/\/+$/, '');
}

/** Сесійний токен з sessionStorage (порожній рядок, якщо немає). */
export function getAdminToken(): string {
  try {
    const raw = localStorage.getItem(ADMIN_KEY) || sessionStorage.getItem(ADMIN_KEY);
    if (!raw) return '';
    const data = JSON.parse(raw);
    return typeof data?.token === 'string' ? data.token : '';
  } catch {
    return '';
  }
}

export function readOrdersCache(): Order[] {
  try {
    const raw = localStorage.getItem(ORDERS_CACHE_KEY);
    const data = raw ? JSON.parse(raw) : [];
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

export function writeOrdersCache(orders: Order[]) {
  try {
    localStorage.setItem(ORDERS_CACHE_KEY, JSON.stringify(orders));
  } catch {
    // ignore quota / private mode
  }
}

export interface LoginResult {
  ok: boolean;
  token?: string;
  error?: string;
}

/** Серверний логін: звірка пароля на Worker'і, повертає сесійний токен. */
export async function adminLogin(password: string): Promise<LoginResult> {
  const base = adminApiBase();
  if (!base) return { ok: false, error: 'API не налаштовано (VITE_ORDER_API_URL)' };
  try {
    const res = await fetch(`${base}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || data.ok === false || !data.token) {
      return { ok: false, error: data.error || `Сервер відповів ${res.status}` };
    }
    return { ok: true, token: data.token };
  } catch (e) {
    return { ok: false, error: (e as Error).message || 'Сервер не відповів' };
  }
}

export interface FetchOrdersResult {
  ok: boolean;
  orders: Order[];
  source: 'server' | 'cache';
  storage?: 'kv' | 'none';
  error?: string;
  unauthorized?: boolean;
}

/** Тягне замовлення з Worker'а. За будь-якої помилки повертає кеш + прапор. */
export async function fetchOrders(): Promise<FetchOrdersResult> {
  const base = adminApiBase();
  const token = getAdminToken();
  if (!base || !token) {
    return {
      ok: false,
      orders: readOrdersCache(),
      source: 'cache',
      error: !base ? 'API не налаштовано' : 'Немає сесії',
    };
  }
  try {
    const res = await fetch(`${base}/orders`, { headers: { Authorization: `Bearer ${token}` } });
    if (res.status === 401) {
      return { ok: false, orders: readOrdersCache(), source: 'cache', unauthorized: true, error: 'Сесія застаріла' };
    }
    const data = await res.json().catch(() => ({}));
    if (!res.ok || data.ok === false || !Array.isArray(data.orders)) {
      return { ok: false, orders: readOrdersCache(), source: 'cache', error: data.error || `Сервер відповів ${res.status}` };
    }
    writeOrdersCache(data.orders);
    return { ok: true, orders: data.orders, source: 'server', storage: data.storage };
  } catch (e) {
    return { ok: false, orders: readOrdersCache(), source: 'cache', error: (e as Error).message || 'Сервер не відповів' };
  }
}

export interface MutationResult {
  ok: boolean;
  error?: string;
  unauthorized?: boolean;
}

async function postAuthed(path: string, body: unknown): Promise<MutationResult> {
  const base = adminApiBase();
  const token = getAdminToken();
  if (!base) return { ok: false, error: 'API не налаштовано' };
  if (!token) return { ok: false, unauthorized: true, error: 'Немає сесії' };
  try {
    const res = await fetch(`${base}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(body),
    });
    if (res.status === 401) return { ok: false, unauthorized: true, error: 'Сесія застаріла' };
    const data = await res.json().catch(() => ({}));
    if (!res.ok || data.ok === false) return { ok: false, error: data.error || `Сервер відповів ${res.status}` };
    return { ok: true };
  } catch (e) {
    return { ok: false, error: (e as Error).message || 'Сервер не відповів' };
  }
}

export function updateOrderStatus(id: string, status: OrderStatus): Promise<MutationResult> {
  return postAuthed('/orders/status', { id, status });
}

export function deleteOrderApi(id: string): Promise<MutationResult> {
  return postAuthed('/orders/delete', { id });
}
