const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

module.exports = async (req, res) => {
  // Allow CORS if necessary
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');

  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  try {
    // Pull standard updates from Cloudinary strictly to Javascript memory
    // Bypassing native Search Engine filters to avoid Lucene query crashing on missing metadata
    const result = await cloudinary.search
      .expression('folder:home/mqlc/updates')
      .with_field('tags')
      .sort_by('created_at', 'desc')
      .max_results(50)
      .execute();

    // Safely execute aggressive fallback sorting entirely via Javascript map 
    // to isolate any PDF docs or hidden bulletin tagged items that cloud presets maliciously forced
    const safeUpdates = result.resources.filter(item => {
      const isPdf = item.format === 'pdf';
      const isBulletin = item.tags && item.tags.includes('bulletin');
      return !isPdf && !isBulletin;
    });

    res.status(200).json({ success: true, resources: safeUpdates });
  } catch (error) {
    console.error("Cloudinary Search Error:", error);
    res.status(500).json({ success: false, error: 'Failed to fetch updates' });
  }
};
