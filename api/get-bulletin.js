const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

module.exports = async (req, res) => {
  // Allow CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');

  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  try {
    // Specifically search the bulletin folder, OR pull any PDFs / tagged items 
    // that might have been accidentally forced into the updates root by Cloudinary Presets
    const result = await cloudinary.search
      .expression('folder:home/mqlc/bulletin OR tags:bulletin OR (folder:home/mqlc/updates AND (format:pdf OR format:json))')
      .sort_by('created_at', 'desc')
      .max_results(20)
      .execute();

    res.status(200).json({ success: true, resources: result.resources });
  } catch (error) {
    console.error("Cloudinary Bulletin Search Error:", error);
    res.status(500).json({ success: false, error: 'Failed to fetch bulletin data' });
  }
};
