function allowOrigin(origin) {
  if (!origin) return '*';
  try {
    const h = new URL(origin).hostname;
    if (h === 'localhost' || h === '127.0.0.1') return origin;
    if (h.endsWith('github.io') || h.endsWith('vercel.app') || h.endsWith('lumu.com.ua')) return origin;
  } catch {}
  return '*';
}

function htmlResponse(data) {
  const json = JSON.stringify(data).replace(/</g, '\\u003c').replace(/>/g, '\\u003e');
  return `<!DOCTYPE html><html><body><script type="application/json" id="d">${json}</script><script>try{window.parent.postMessage(JSON.parse(document.getElementById("d").textContent),"*")}catch(e){}</script></body></html>`;
}

export default async function handler(req, res) {
  const origin = req.headers.origin || '';
  const formatHtml = req.query?.format === 'html' || (req.url && req.url.includes('format=html'));
  res.setHeader('Access-Control-Allow-Origin', allowOrigin(origin));
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Max-Age', '86400');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') {
    if (formatHtml) return res.status(405).send(htmlResponse({ type: 'lumu-upload', ok: false, error: 'Method not allowed' }));
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const adminToken = process.env.ADMIN_TOKEN;
  const ghToken = process.env.GITHUB_TOKEN;

  const send = (status, data) => {
    if (formatHtml) {
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      return res.status(status).send(htmlResponse({ type: 'lumu-upload', ...data }));
    }
    return res.status(status).json(data);
  };

  if (!adminToken || !ghToken) {
    return send(500, { ok: false, error: 'Not configured' });
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
      return send(400, { ok: false, error: 'Invalid form' });
    }
  } else {
    token = req.headers.authorization?.startsWith('Bearer ') ? req.headers.authorization.slice(7) : null;
    try {
      body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body || {};
    } catch {
      return send(400, { ok: false, error: 'Invalid JSON' });
    }
  }

  if (token !== adminToken) {
    return send(401, { ok: false, error: 'Unauthorized' });
  }

  const { base64, productId, ext = 'jpg' } = body;
  if (!base64 || !productId) {
    return send(400, { ok: false, error: 'Missing base64 or productId' });
  }

  const safeExt = (String(ext).toLowerCase().replace(/[^a-z0-9]/g, '') || 'jpg').slice(0, 4);
  const repo = process.env.GITHUB_REPO || 'katering-VKK/katering-VKK.github.io';
  const filePath = `public/images/products/${productId}.${safeExt}`;

  const rawBase64 = String(base64).replace(/^data:image\/\w+;base64,/, '').replace(/\s/g, '');
  let content;
  try {
    content = Buffer.from(rawBase64, 'base64').toString('base64');
  } catch {
    return send(400, { ok: false, error: 'Invalid base64' });
  }

  if (content.length > 2 * 1024 * 1024) {
    return send(400, { ok: false, error: 'Image too large (max 2MB)' });
  }

  const imgbbKey = process.env.IMGBB_API_KEY;
  if (imgbbKey) {
    try {
      const fd = new URLSearchParams();
      fd.set('key', imgbbKey);
      fd.set('image', rawBase64);
      const ir = await fetch('https://api.imgbb.com/1/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: fd.toString(),
      });
      const idata = await ir.json();
      if (idata?.data?.url) {
        return send(200, { ok: true, url: idata.data.url });
      }
      return send(502, { ok: false, error: idata?.error?.message || 'ImgBB failed' });
    } catch (e) {
      return send(502, { ok: false, error: (e && e.message) || 'ImgBB error' });
    }
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
      return send(502, { ok: false, error: msg });
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
      return send(502, { ok: false, error: msg });
    }

    const branch = process.env.GITHUB_BRANCH || 'main';
    const rawUrl = `https://raw.githubusercontent.com/${repo}/${branch}/${filePath}`;
    return send(200, { ok: true, url: rawUrl });
  } catch (err) {
    return send(502, { ok: false, error: (err && err.message) || 'Failed' });
  }
}
