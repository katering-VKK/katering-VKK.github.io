export default async function handler(req, res) {
  const origin = req.headers.origin || '';
  const allowed = [
    'https://malenkyivsesvit.com.ua',
    'https://www.malenkyivsesvit.com.ua',
    'https://katering-VKK.github.io',
    'https://katering-vkk.github.io',
    'http://localhost:3000',
  ];
  if (origin.includes('vercel.app') || origin.includes('localhost') || origin.includes('github.io')) {
    if (!allowed.includes(origin)) allowed.push(origin);
  }
  res.setHeader('Access-Control-Allow-Origin', allowed.includes(origin) ? origin : allowed[0]);
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  if (req.method === 'GET') {
    return res.status(200).json({
      configured: !!process.env.ADMIN_TOKEN,
      hint: process.env.ADMIN_TOKEN ? 'Token is set' : 'ADMIN_TOKEN missing',
    });
  }

  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const adminToken = (process.env.ADMIN_TOKEN || '').trim();
  if (!adminToken) return res.status(500).json({ ok: false, error: 'Admin not configured' });

  let body;
  try {
    body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
  } catch {
    return res.status(400).json({ ok: false, error: 'Invalid JSON' });
  }

  const password = (body?.password ?? '').toString().trim();
  if (!password) return res.status(401).json({ ok: false, error: 'Введіть пароль' });
  if (password !== adminToken) return res.status(401).json({ ok: false, error: 'Невірний пароль' });

  return res.status(200).json({ ok: true, token: adminToken });
}
