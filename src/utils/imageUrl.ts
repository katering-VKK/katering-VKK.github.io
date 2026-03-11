const PROD_ORIGIN = 'https://malenkyivsesvit.com.ua';

function getOrigin(): string {
  if (typeof window === 'undefined') return PROD_ORIGIN;
  const o = window.location.origin;
  if (o.includes('localhost') || o.includes('127.0.0.1')) return PROD_ORIGIN;
  return o;
}

export function resolveImageUrl(url: string | undefined): string | undefined {
  if (!url) return undefined;
  if (url.startsWith('data:') || url.startsWith('http')) return url;
  if (url.startsWith('/')) return `${getOrigin()}${url}`;
  return url;
}
