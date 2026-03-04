export default async function handler(req, res) {
  const origin = req.headers.origin || '';
  let allow = '*';
  if (origin) {
    try {
      new URL(origin);
      allow = origin;
    } catch {}
  }
  res.setHeader('Access-Control-Allow-Origin', allow);
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

  for (let i = 0; i < products.length; i++) {
    const p = products[i];
    if (p == null || typeof p !== 'object') {
      return res.status(400).json({ error: `Product ${i + 1}: invalid object` });
    }
    const name = String(p.name || '').trim();
    if (!name) {
      return res.status(400).json({ error: `Product ${i + 1}: name is required` });
    }
    const price = String(p.price || '').trim();
    if (!price) {
      return res.status(400).json({ error: `Product ${i + 1}: price is required` });
    }
    const priceNum = parseInt(String(price).replace(/\s/g, '').replace('₴', ''), 10);
    if (isNaN(priceNum) || priceNum < 0) {
      return res.status(400).json({ error: `Product ${i + 1}: invalid price format` });
    }
    if (p.image && typeof p.image === 'string' && p.image.startsWith('data:image/')) {
      return res.status(400).json({ error: `Product ${i + 1}: upload images via /admin/upload-image first` });
    }
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
      let msg = 'GitHub API error';
      try {
        const errJson = JSON.parse(err);
        msg = errJson.message || err;
      } catch {
        msg = err.slice(0, 200) || `HTTP ${getRes.status}`;
      }
      return res.status(502).json({ ok: false, error: msg });
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
      let msg = 'GitHub commit failed';
      try {
        const errJson = JSON.parse(err);
        msg = errJson.message || err;
      } catch {
        msg = err.slice(0, 200) || `HTTP ${putRes.status}`;
      }
      return res.status(502).json({ ok: false, error: msg });
    }

    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error('[admin] Error:', err);
    return res.status(502).json({ error: 'Failed to update' });
  }
}
