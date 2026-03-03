export default async function handler(req, res) {
  const origin = req.headers.origin || '';
  const allowed = ['https://lumu.com.ua', 'https://www.lumu.com.ua', 'http://localhost:3000'];
  if (origin.includes('vercel.app') || origin.includes('github.io')) allowed.push(origin);
  res.setHeader('Access-Control-Allow-Origin', allowed.includes(origin) ? origin : 'https://lumu.com.ua');
  res.setHeader('Access-Control-Allow-Methods', 'PUT, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'PUT') return res.status(405).json({ error: 'Method not allowed' });

  const auth = req.headers.authorization;
  const token = auth?.startsWith('Bearer ') ? auth.slice(7) : null;
  const adminToken = process.env.ADMIN_TOKEN;
  const ghToken = process.env.GITHUB_TOKEN;

  if (!adminToken || !ghToken) {
    return res.status(500).json({ error: 'Admin or GitHub not configured' });
  }
  if (token !== adminToken) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  let body;
  try {
    body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
  } catch {
    return res.status(400).json({ error: 'Invalid JSON' });
  }

  const products = body?.products;
  if (!Array.isArray(products)) {
    return res.status(400).json({ error: 'Missing products array' });
  }

  const repo = process.env.GITHUB_REPO || 'katering-VKK/katering-VKK.github.io';
  const filePath = 'public/products.json';
  const content = JSON.stringify(products, null, 2);
  const encoded = Buffer.from(content).toString('base64');

  try {
    const getRes = await fetch(`https://api.github.com/repos/${repo}/contents/${filePath}`, {
      headers: {
        Authorization: `Bearer ${ghToken}`,
        Accept: 'application/vnd.github+json',
        'X-GitHub-Api-Version': '2022-11-28',
      },
    });

    let sha = null;
    if (getRes.ok) {
      const file = await getRes.json();
      sha = file.sha;
    } else if (getRes.status !== 404) {
      const err = await getRes.text();
      console.error('[admin] GitHub get error:', getRes.status, err);
      return res.status(502).json({ error: 'GitHub API error' });
    }

    const putRes = await fetch(`https://api.github.com/repos/${repo}/contents/${filePath}`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${ghToken}`,
        Accept: 'application/vnd.github+json',
        'X-GitHub-Api-Version': '2022-11-28',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: 'Admin: оновлення товарів',
        content: encoded,
        sha: sha,
      }),
    });

    if (!putRes.ok) {
      const err = await putRes.text();
      console.error('[admin] GitHub put error:', putRes.status, err);
      return res.status(502).json({ error: 'GitHub commit failed' });
    }

    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error('[admin] Error:', err);
    return res.status(502).json({ error: 'Failed to update' });
  }
}
