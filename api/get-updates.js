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
    // Search the exact folder where the Admin will be uploading new media
    // Adjust the `folder:home/mqlc/updates` path to precisely match where they will save it.
    const result = await cloudinary.search
      .expression('folder:home/mqlc/updates')
      .sort_by('created_at', 'desc')
      .max_results(30)
      .execute();

    res.status(200).json({ success: true, resources: result.resources });
  } catch (error) {
    console.error("Cloudinary Search Error:", error);
    res.status(500).json({ success: false, error: 'Failed to fetch updates' });
  }
};
