import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";
import colors from 'colors';

dotenv.config();

export const cloudinaryConnect = () => {
  try {
    cloudinary.config({
      cloud_name: process.env.CLOUD_NAME,
      api_key: process.env.API_KEY,
      api_secret: process.env.API_SECRET,
    });
    console.log("Cloudinary connected successfully".bgMagenta.bold);
  } catch (err) {
    console.error("Error connecting to Cloudinary:", err);
  }
};
