const RAW_BASE = 'https://raw.githubusercontent.com/katering-VKK/katering-VKK.github.io/main/public';

export function resolveImageUrl(url: string | undefined): string | undefined {
  if (!url) return undefined;
  if (url.startsWith('data:') || url.startsWith('http')) return url;
  if (url.startsWith('/images/products/')) {
    const match = url.match(/\/images\/products\/(.+)$/);
    return match ? `${RAW_BASE}/images/products/${match[1]}` : url;
  }
  return url;
}
