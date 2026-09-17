export default function handler(req, res) {
  // Extract location headers from Vercel or Cloudflare
  const country = req.headers['x-vercel-ip-country'] || req.headers['cf-ipcountry'] || 'TH';
  const region = req.headers['x-vercel-ip-country-region'] || req.headers['cf-region-code'] || '';
  const city = req.headers['x-vercel-ip-city'] || req.headers['cf-city'] || '';

  // Decode city if it contains URL encoded Thai characters or special symbols
  let cityName = city;
  try {
    cityName = decodeURIComponent(city);
  } catch (e) {
    console.error('Failed to decode city header:', e);
  }

  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.status(200).json({
    country,
    region,
    city: cityName
  });
}
