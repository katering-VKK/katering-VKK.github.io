export default async function handler(req, res) {
  const origin = req.headers.origin || '';
  const allowed = [
    'https://lumu.com.ua',
    'https://www.lumu.com.ua',
    'https://katering-VKK.github.io',
    'https://katering-vkk.github.io',
    'http://localhost:3000',
  ];
  if (origin.includes('vercel.app') || origin.includes('github.io')) {
    if (!allowed.includes(origin)) allowed.push(origin);
  }
  res.setHeader('Access-Control-Allow-Origin', allowed.includes(origin) ? origin : allowed[0]);
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const auth = req.headers.authorization;
  const token = auth?.startsWith('Bearer ') ? auth.slice(7) : null;
  const adminToken = process.env.ADMIN_TOKEN;
  const ghToken = process.env.GITHUB_TOKEN;

  if (!adminToken || !ghToken) {
    return res.status(500).json({ ok: false, error: 'Not configured' });
  }
  if (token !== adminToken) {
    return res.status(401).json({ ok: false, error: 'Unauthorized' });
  }

  let body;
  try {
    body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
  } catch {
    return res.status(400).json({ ok: false, error: 'Invalid JSON' });
  }

  const { base64, productId, ext = 'jpg' } = body;
  if (!base64 || !productId) {
    return res.status(400).json({ ok: false, error: 'Missing base64 or productId' });
  }

  const safeExt = (String(ext).toLowerCase().replace(/[^a-z0-9]/g, '') || 'jpg').slice(0, 4);
  const repo = process.env.GITHUB_REPO || 'katering-VKK/katering-VKK.github.io';
  const filePath = `public/images/products/${productId}.${safeExt}`;

  let content;
  try {
    content = Buffer.from(base64.replace(/^data:image\/\w+;base64,/, ''), 'base64').toString('base64');
  } catch {
    return res.status(400).json({ ok: false, error: 'Invalid base64' });
  }

  if (content.length > 2 * 1024 * 1024) {
    return res.status(400).json({ ok: false, error: 'Image too large (max 2MB)' });
  }

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
        msg = err.slice(0, 150);
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
        message: `Admin: фото товару ${productId}`,
        content,
        sha: sha,
      }),
    });

    if (!putRes.ok) {
      const err = await putRes.text();
      let msg = 'Upload failed';
      try {
        const errJson = JSON.parse(err);
        msg = errJson.message || err;
      } catch {
        msg = err.slice(0, 150);
      }
      return res.status(502).json({ ok: false, error: msg });
    }

    const imageUrl = `/images/products/${productId}.${safeExt}`;
    return res.status(200).json({ ok: true, url: imageUrl });
  } catch (err) {
    return res.status(502).json({ ok: false, error: (err && err.message) || 'Failed' });
  }
}
