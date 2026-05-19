import { v2 as cloudinary } from "cloudinary";
import fs from "fs";


const configureCloudinary = () => {
  if (
    !process.env.CLOUDINARY_CLOUD_NAME ||
    !process.env.CLOUDINARY_API_KEY ||
    !process.env.CLOUDINARY_API_SECRET
  ) {
    throw new Error("❌ Cloudinary env variables are missing");
  }
  
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
};

const uploadToCloudinary = async (localFilePath) => {
  configureCloudinary();

  try {
    if (!localFilePath) return null;

    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto",
    });

    fs.unlinkSync(localFilePath);
    return response;
  } catch (error) {
    if (fs.existsSync(localFilePath)) {
      fs.unlinkSync(localFilePath);
    }
    throw error;
  }
};
const deleteFromCloudinary = async (public_id) => {
  if (!public_id) return null;
  configureCloudinary();

  try {
    let res = await cloudinary.uploader.destroy(public_id, { resource_type: "video" });
    if (res.result !== 'ok') {
      res = await cloudinary.uploader.destroy(public_id, { resource_type: "image" });
    }
    return res;
  } catch (error) {
    console.error("Cloudinary delete error:", error);
    return null;
  }
};

export { uploadToCloudinary , deleteFromCloudinary};
