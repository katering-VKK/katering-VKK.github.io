function allowOrigin(origin) {
  if (!origin) return '*';
  try {
    new URL(origin);
    return origin;
  } catch {}
  return '*';
}

export default async function handler(req, res) {
  const origin = req.headers.origin || '';
  res.setHeader('Access-Control-Allow-Origin', allowOrigin(origin));
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Max-Age', '86400');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const adminToken = process.env.ADMIN_TOKEN;
  const ghToken = process.env.GITHUB_TOKEN;

  if (!adminToken || !ghToken) {
    return res.status(500).json({ ok: false, error: 'ADMIN_TOKEN або GITHUB_TOKEN не налаштовані у Vercel' });
  }

  let token = null;
  let body = {};
  const ct = (req.headers['content-type'] || '').toLowerCase();

  if (ct.includes('application/x-www-form-urlencoded')) {
    try {
      const parsed = typeof req.body === 'string'
        ? Object.fromEntries(new URLSearchParams(req.body))
        : (req.body && typeof req.body === 'object' ? req.body : {});
      token = parsed.token || null;
      body = {
        base64: parsed.base64,
        productId: parsed.productId,
        ext: parsed.ext || 'jpg',
      };
    } catch {
      return res.status(400).json({ ok: false, error: 'Invalid form' });
    }
  } else {
    token = req.headers.authorization?.startsWith('Bearer ') ? req.headers.authorization.slice(7) : null;
    try {
      body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body || {};
    } catch {
      return res.status(400).json({ ok: false, error: 'Invalid JSON' });
    }
  }

  const tokenTrim = (token || '').toString().trim();
  const adminTrim = (adminToken || '').toString().trim();
  if (!adminTrim || tokenTrim !== adminTrim) {
    return res.status(401).json({ ok: false, error: 'Unauthorized. Вийдіть і увійдіть знову.' });
  }

  const { base64, productId, ext = 'jpg' } = body;
  if (!base64 || !productId) {
    return res.status(400).json({ ok: false, error: 'Missing base64 or productId' });
  }

  const safeExt = (String(ext).toLowerCase().replace(/[^a-z0-9]/g, '') || 'jpg').slice(0, 4);
  const repo = process.env.GITHUB_REPO || 'katering-VKK/katering-VKK.github.io';
  const filePath = `public/images/products/${productId}.${safeExt}`;

  const rawBase64 = String(base64).replace(/^data:image\/\w+;base64,/, '').replace(/\s/g, '');
  let content;
  try {
    content = Buffer.from(rawBase64, 'base64').toString('base64');
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
