import cloudinary from "../config/cloudinary.js";

export const generateUploadToken = async (req, res) => {


    try {
    const timestamp = Math.round(new Date().getTime() / 1000);
    
   
    const paramsToSign = {
      timestamp: timestamp,
    };

    const signature = cloudinary.utils.api_sign_request(
      paramsToSign,
      process.env.CLOUDINARY_API_SECRET
    );

    // Return the tokens needed for client-side direct upload payload structures
    return res.status(200).json({
      signature,
      timestamp,
      apiKey: process.env.CLOUDINARY_API_KEY
    });
  } catch (error) {
    console.error('Error creating Cloudinary signature:', error);
    return res.status(500).json({ message: 'Internal Server Error generating upload tokens' });
  }
}