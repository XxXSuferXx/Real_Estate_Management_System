import cloudinary from "../../config/cloudinary.js";

interface UploadResult {
  url: string;
  publicId: string;
}

export const uploadToCloudinary = (
  buffer: Buffer,
  folder: string
): Promise<UploadResult> => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream({ folder }, (error, result) => {
      if (error || !result) {
        return reject(error ?? new Error("Cloudinary upload failed with no result"));
      }
      resolve({ url: result.secure_url, publicId: result.public_id });
    });

    stream.end(buffer);
  });
};

export const deleteImageFromCloudinary = async (publicId: string): Promise<void> => {
  await cloudinary.uploader.destroy(publicId);
};