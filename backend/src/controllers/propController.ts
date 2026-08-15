import type { Request, Response } from "express";
import { AppError } from "../common/errors/appError.js";
import { Property } from "../Modals/propertySchema.js";
import { UserRole } from "../common/constants/roles.js";

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
