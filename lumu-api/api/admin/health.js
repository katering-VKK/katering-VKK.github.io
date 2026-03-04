export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 'no-store');
  const hasAdmin = !!process.env.ADMIN_TOKEN;
  const hasGh = !!process.env.GITHUB_TOKEN;
  const hasImgbb = !!process.env.IMGBB_API_KEY;
  const uploadOk = hasImgbb || hasGh;
  return res.status(200).json({
    configured: hasAdmin,
    hint: hasAdmin ? 'Token is set' : 'ADMIN_TOKEN missing',
    uploadOk,
  });
}
