import { type Request, type Response, type NextFunction } from 'express';
import type { QueryFilter } from "mongoose";
import { User, type IUser } from '../Modals/userSchema.js';
import { UserRole } from '../common/constants/roles.js';

export const getAllUsers = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const page = req.query.page ? Number(req.query.page) : 1;
  const limit = req.query.limit ? Number(req.query.limit) : 20;
  const skip = (page - 1) * limit;

  const filter: QueryFilter<IUser> = {};

  if (req.query.role) {
    filter.role = req.query.role as UserRole;
  }

  if (req.query.search) {
    const search = req.query.search as string;
    filter.$or = [
      { username: { $regex: escapeRegex(search), $options: 'i' } },
      { email: { $regex: escapeRegex(search), $options: 'i' } },
    ];
  }

  const [users, total] = await Promise.all([
    User.find(filter).sort('-createdAt').skip(skip).limit(limit),
    User.countDocuments(filter),
  ]);

  res.status(200).json({
    status: 'success',
    results: users.length,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    data: { users },
  });
};

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}