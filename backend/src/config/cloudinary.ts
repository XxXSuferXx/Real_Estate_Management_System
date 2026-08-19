import { v2 as cloudinary } from "cloudinary";

const cName = process.env.CLOUDINARY_CLOUD_NAME;
const cKey = process.env.CLOUDINARY_API_KEY;
const cSecret = process.env.CLOUDINARY_API_SECRET; 

if(!cName || !cKey || !cSecret) {
    throw new Error("Missing Cloudinary enviornment variables");
}

cloudinary.config({
  cloud_name: cName,
  api_key: cKey,
  api_secret: cSecret,
  secure: true,
});

export default cloudinary;