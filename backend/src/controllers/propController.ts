import type { Request, Response } from "express";

export const searchPropertiesController = async (req: Request, res: Response) => {
  return res.status(200).json({
    success: true,
    message: "Search route hit successfully!",
    query: req.query,
  });
};