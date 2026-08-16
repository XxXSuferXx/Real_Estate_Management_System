import type { Request, Response } from "express";
import { AppError } from "../common/errors/appError.js";
import { Property } from "../Modals/propertySchema.js";
import { UserRole } from "../common/constants/roles.js";
import { translationQueue } from "../jobs/translationQueue.js";

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
    data: Property
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