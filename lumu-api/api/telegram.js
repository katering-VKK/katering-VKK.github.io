export default async function handler(req, res) {
  const origin = req.headers.origin || '';
  const allowed = ['https://malenkyivsesvit.com.ua', 'https://www.malenkyivsesvit.com.ua', 'https://katering-vkk.github.io'];
  if (origin.includes('vercel.app') || origin.includes('github.io')) allowed.push(origin);
  res.setHeader('Access-Control-Allow-Origin', allowed.includes(origin) ? origin : 'https://malenkyivsesvit.com.ua');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!token || !chatId) {
    return res.status(500).json({ error: 'Server not configured' });
  }

  let text;
  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    text = body?.text;
  } catch {
    return res.status(400).json({ error: 'Invalid JSON' });
  }

  if (!text || typeof text !== 'string') {
    return res.status(400).json({ error: 'Missing text' });
  }

  try {
    const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: 'HTML',
      }),
    });
    if (!response.ok) {
      return res.status(502).json({ error: 'Telegram API error' });
    }
    return res.status(200).json({ ok: true });
  } catch (err) {
    return res.status(502).json({ error: 'Failed to send' });
  }
}
