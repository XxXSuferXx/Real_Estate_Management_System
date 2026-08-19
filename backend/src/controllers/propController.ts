import type { Request, Response } from "express";
import { AppError } from "../common/errors/appError.js";
import { Property } from "../Modals/propertySchema.js";
import { UserRole } from "../common/constants/roles.js";
import { translationQueue } from "../jobs/translationQueue.js";
import { deleteImageFromCloudinary, uploadToCloudinary } from "../common/utils/uploadImage.js";
import type { DeleteImageInput } from "../validations/propertyValidaion.js";

export const searchPropertiesController = async (req: Request, res: Response) => {
  return res.status(200).json({
    success: true,
    message: "Search route hit successfully!",
    query: req.query,
  });
};

export const addProperty = async (req:Request, res:Response) => {
  if(!req.body) {
    throw new AppError("Unauthorized", 401);
  }

  if (!req.user) {
    throw new AppError('Unauthorized: User context missing', 401);
  }

  const property = await Property.create({
    ...req.body,
    agent: req.user.id
  });

  if(!property.title.en || !property.description.en) {
    await translationQueue.add("translate-property", {propertyId: property.id});
  }

  res.status(201).json({
    success: true,
    message: "Property added successfully",
    data: property
  })
}

export const deleteProperty = async (req: Request, res: Response) => {
  if(!req.user) {
    throw new AppError("Unauthorized", 401);
  }

  const property = await Property.findById(req.params.id);

  if(!property) {
    throw new AppError("Property not found", 404);
  }

  const isOwner = property.agent.equals(req.user.id);
  const isAdmin = req.user.role === UserRole.ADMIN; 

  if (!isOwner && !isAdmin) {
    throw new AppError("You can only delete your own listings", 403);
  }

  await property.deleteOne();

  res.status(200).json({
    success: true,
    message: "Property deleted successfully",
  });
}

export const getPropertyById = async (req: Request, res: Response) => {
  const property = await Property.findById(req.params.id).populate(
    "agent",
    "username email"
  );
 
  if(!property){
    throw new AppError("Property not found", 404);
  }
 
  res.status(200).json({
    success: true,
    data: property,
  });
};

export const updateProperty = async (req: Request, res: Response) => {
  if(!req.user) {
    throw new AppError("Unauthorized", 401);
  }

  const property = await Property.findById(req.params.id);

  if(!property) {
    throw new AppError("Property not found", 404);
  }

  const isOwner = property.agent.equals(req.user.id);
  const isAdmin = req.user.role === UserRole.ADMIN;

  if(!isOwner && !isAdmin) {
    throw new AppError("You can only edit your own listing",403);
  }

  Object.assign(property, req.validated!.body);
  await property.save();

  const touchedJapanese = "title" in req.validated!.body || "description" in req.validated!.body;
  const humanTranslation = property.translationStatus.title === "human" &&
                           property.translationStatus.description === "human";

  if(touchedJapanese && !humanTranslation) {
    await translationQueue.add("translation-property", {propertyId: property.id})
  }
 
  res.status(200).json({
    success: true,
    message: "Property updated successfully",
    data: property,
  });
}

export const uploadPropertyImages = async (req: Request, res: Response) => {
  if(!req.user) {
    throw new AppError("Unauthorized", 401);
  }

  const property = await Property.findById(req.params.id);

  if(!property) {
    throw new AppError("Property Not Found!", 404);
  }

  const isOwner = property.agent.equals(req.user.id);
  const isAdmin = req.user.role === UserRole.ADMIN;

  if(!isOwner && !isAdmin) {
    throw new AppError("You can only upload Images to your own listing",403);
  }

  const files = req.files as Express.Multer.File[] | undefined;

  if (!files || files.length === 0) {
    throw new AppError("No images provided", 400);
  }

  const uploaded: { url: string; publicId: string }[] = [];
  for (const file of files) {
    const result = await uploadToCloudinary(file.buffer, "properties");
    uploaded.push(result);
  }

  property.images.push(...uploaded);
  await property.save();

  res.status(200).json({
    success: true,
    message: "Images uploaded successfully",
    data: property,
  });
}

export const deletePropertyImage = async(req: Request, res: Response) => {
  if(!req.user) {
    throw new AppError("Unauthorized", 401);
  }

  const property = await Property.findById(req.params.id);

  if(!property) {
    throw new AppError("Property not found", 404);
  }

  const isOwner = property.agent.equals(req.user.id);
  const isAdmin = req.user.role === UserRole.ADMIN;

  if(!isAdmin || !isOwner) {
    throw new AppError("You can only delete images from from your own listing", 403);
  }

  const { publicId } = req.validated!.query as DeleteImageInput;

  const imageExists = property.images.some((img) => img.publicId === publicId);
  if (!imageExists) {
    throw new AppError("Image not found on this property", 404);
  }

  await deleteImageFromCloudinary(publicId);
 
  property.images = property.images.filter((img) => img.publicId !== publicId);
  await property.save();
 
  res.status(200).json({
    success: true,
    message: "Image deleted successfully",
    data: property,
  });
}