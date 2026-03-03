export default async function handler(req, res) {
  const origin = req.headers.origin || '';
  const allowed = ['https://lumu.com.ua', 'https://www.lumu.com.ua', 'http://localhost:3000'];
  if (origin.includes('vercel.app') || origin.includes('localhost')) allowed.push(origin);
  res.setHeader('Access-Control-Allow-Origin', allowed.includes(origin) ? origin : 'https://lumu.com.ua');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const adminToken = process.env.ADMIN_TOKEN;
  if (!adminToken) return res.status(500).json({ error: 'Admin not configured' });

  let body;
  try {
    body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
  } catch {
    return res.status(400).json({ error: 'Invalid JSON' });
  }

  const password = body?.password;
  if (!password || password !== adminToken) {
    return res.status(401).json({ ok: false, error: 'Невірний пароль' });
  }

  return res.status(200).json({ ok: true, token: adminToken });
}
