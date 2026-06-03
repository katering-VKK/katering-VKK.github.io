import type { OrderStatus } from '../components/admin/OrdersManager';

export interface CheckoutOrderPayload {
  id: string;
  date: string;
  customer: {
    name: string;
    phone: string;
    email?: string;
    city?: string;
    address?: string;
    comment?: string;
  };
  delivery?: {
    id: string;
    label: string;
  };
  items: {
    productId: number;
    name: string;
    price: string;
    qty: number;
  }[];
  total: string;
  status: OrderStatus;
}

interface SendResult {
  ok: boolean;
  skipped?: boolean;
  error?: string;
}

function trimTrailingSlash(value: string) {
  return value.replace(/\/+$/, '');
}

function orderEndpoint() {
  const exact = String(import.meta.env.VITE_ORDER_API_URL || '').trim();
  if (exact) return exact;

  const apiBase = String(import.meta.env.VITE_TELEGRAM_API_URL || '').trim();
  if (!apiBase) return '';
  return `${trimTrailingSlash(apiBase)}/orders`;
}

export async function sendOrderToApi(order: CheckoutOrderPayload): Promise<SendResult> {
  const endpoint = orderEndpoint();
  if (!endpoint) return { ok: true, skipped: true };

  try {
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        source: 'malenkyivsesvit.com.ua',
        order,
      }),
    });

    const text = await res.text();
    const data = text ? JSON.parse(text) as { ok?: boolean; error?: string; message?: string } : {};

    if (!res.ok || data.ok === false) {
      return {
        ok: false,
        error: data.error || data.message || `API відповів ${res.status}`,
      };
    }

    return { ok: true };
  } catch (e) {
    return {
      ok: false,
      error: (e as Error).message || 'Telegram/API не відповів',
    };
  }
}
