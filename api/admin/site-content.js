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
  res.setHeader('Access-Control-Allow-Methods', 'GET, PUT, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') return res.status(200).end();

  const repo = process.env.GITHUB_REPO || 'katering-VKK/katering-VKK.github.io';
  const filePath = 'public/site-content.json';

  if (req.method === 'GET') {
    try {
      const getRes = await fetch(`https://api.github.com/repos/${repo}/contents/${filePath}`, {
        headers: {
          Accept: 'application/vnd.github.raw',
          'X-GitHub-Api-Version': '2022-11-28',
        },
      });
      if (!getRes.ok) {
        return res.status(404).json({ error: 'Not found' });
      }
      const text = await getRes.text();
      const data = JSON.parse(text);
      return res.status(200).json(data);
    } catch (err) {
      return res.status(500).json({ error: 'Failed to fetch' });
    }
  }

  if (req.method !== 'PUT') return res.status(405).json({ error: 'Method not allowed' });

  let body;
  try {
    body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
  } catch {
    return res.status(400).json({ error: 'Invalid JSON' });
  }

  let token = req.headers.authorization?.startsWith('Bearer ') ? req.headers.authorization.slice(7) : null;
  if (!token && body && body.token) token = body.token;
  const tokenTrim = (token || '').toString().trim();
  const adminTrim = (process.env.ADMIN_TOKEN || '').toString().trim();
  const ghToken = process.env.GITHUB_TOKEN;

  if (!adminTrim || !ghToken) {
    return res.status(500).json({ error: 'Admin or GitHub not configured' });
  }
  if (tokenTrim !== adminTrim) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const content = body?.content;
  if (!content || typeof content !== 'object') {
    return res.status(400).json({ error: 'Missing content object' });
  }

  const contentStr = JSON.stringify(content, null, 2);
  const encoded = Buffer.from(contentStr).toString('base64');

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
      return res.status(502).json({ ok: false, error: err.slice(0, 200) });
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
        message: 'Admin: оновлення розділів сайту',
        content: encoded,
        sha,
      }),
    });

    if (!putRes.ok) {
      const err = await putRes.text();
      return res.status(502).json({ ok: false, error: err.slice(0, 200) });
    }
    return res.status(200).json({ ok: true });
  } catch (err) {
    return res.status(502).json({ ok: false, error: (err && err.message) || 'Failed' });
  }
}
