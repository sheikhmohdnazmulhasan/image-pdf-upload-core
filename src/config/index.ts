import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.join(process.cwd(), ".env") });

export default {
  cloudinary_cloud_name: process.env.CLOUD_NAME,
  cloudinary_api_key: process.env.API_KEY,
  cloudinary_api_secret: process.env.API_SECRET,
};
