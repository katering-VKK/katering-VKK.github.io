export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 'no-store');
  return res.status(200).json({
    configured: !!process.env.ADMIN_TOKEN,
    uploadOk: !!(process.env.ADMIN_TOKEN && process.env.GITHUB_TOKEN),
    hint: process.env.ADMIN_TOKEN ? 'Token is set' : 'ADMIN_TOKEN missing in Vercel → Redeploy',
  });
}
