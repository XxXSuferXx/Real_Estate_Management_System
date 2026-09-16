import { type Request, type Response, type NextFunction } from 'express';
import type { QueryFilter } from "mongoose";
import { User, type IUser } from '../Modals/userSchema.js';
import { AdminRole, UserRole } from '../common/constants/roles.js';
import { AppError } from '../common/errors/appError.js';
import { Property } from '../Modals/propertySchema.js';
import { RefreshToken } from '../Modals/refreshTokenSchema.js';

export const getAllUsers = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const page = req.query.page ? Number(req.query.page) : 1;
  const limit = req.query.limit ? Number(req.query.limit) : 20;
  const skip = (page - 1) * limit;

  const filter: QueryFilter<IUser> = { isDeleted: { $ne: true }};

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

export const updateUserRole = async (req: Request, res: Response) => {
  const { userId } = req.validated!.params as { userId: string };
  const { role } = req.validated!.body as { role: UserRole | AdminRole };

  if (req.user!.id === userId) {
    throw new AppError("You cannot change your own role", 400);
  }

  const user = await User.findById(userId);
  if (!user) throw new AppError("User not found", 404);

  user.role = role;
  await user.save();

  res.status(200).json({
    success: true,
    message: "User role updated successfully",
    data: { id: user.id, username: user.username, email: user.email, role: user.role },
  });
};

export const deleteUser = async (req: Request, res: Response) => {
  const { userId } = req.validated!.params as { userId: string };

  if (req.user!.id === userId) {
    throw new AppError("You cannot delete your own account", 400);
  }

  const user = await User.findById(userId);
  if (!user) throw new AppError("User not found", 404);
  if (user.isDeleted) throw new AppError("User is already deleted", 400);

  // Soft-delete: keeps the document so populate('agent') on their old listings
  // still resolves a name. Login must reject isDeleted users (pending: authController/authMiddleware).
  user.isDeleted = true;
  user.deletedAt = new Date();
  await user.save();

  await RefreshToken.deleteMany({ user: user._id });

  const result = await Property.updateMany(
    { agent: user._id },
    { $set: { archived: true } }
  );

  res.status(200).json({
    success: true,
    message: "User deleted and their listings archived",
    data: { userId: user.id, archivedPropertiesCount: result.modifiedCount },
  });
};

export const getAllPropertiesAdmin = async (req: Request, res: Response) => {
  const q = req.validated!.query as {
    page?: number; limit?: number; status?: string; type?: string;
    listingType?: string; agent?: string; archived?: 'true' | 'false' | 'all'; search?: string;
  };

  const page = q.page ?? 1;
  const limit = q.limit ?? 20;
  const skip = (page - 1) * limit;

  const filter: Record<string, unknown> = {};
  if (q.status) filter.status = q.status;
  if (q.type) filter.type = q.type;
  if (q.listingType) filter.listingType = q.listingType;
  if (q.agent) filter.agent = q.agent;
  // Default: no filter on `archived` at all → admin sees everything, including
  // deleted agents' archived listings, unless they explicitly narrow it.
  if (q.archived === 'true') filter.archived = true;
  else if (q.archived === 'false') filter.archived = false;

  if (q.search) {
    const escaped = q.search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    filter.$or = [
      { 'title.ja': { $regex: escaped, $options: 'i' } },
      { 'title.en': { $regex: escaped, $options: 'i' } },
    ];
  }

  const [properties, total] = await Promise.all([
    Property.find(filter)
      .populate('agent', 'username email isDeleted')
      .sort('-createdAt')
      .skip(skip)
      .limit(limit),
    Property.countDocuments(filter),
  ]);

  res.status(200).json({
    success: true,
    results: properties.length,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    data: { properties },
  });
};

export const getAdminStats = async (_req: Request, res: Response) => {
  const [totalUsers, usersByRole, totalProperties, propertiesByStatus, archivedCount] =
    await Promise.all([
      User.countDocuments({ isDeleted: false }),
      User.aggregate([
        { $match: { isDeleted: false } },
        { $group: { _id: '$role', count: { $sum: 1 } } },
      ]),
      Property.countDocuments({ archived: false }),
      Property.aggregate([
        { $match: { archived: false } },
        { $group: { _id: '$status', count: { $sum: 1 } } },
      ]),
      Property.countDocuments({ archived: true }),
    ]);

  res.status(200).json({
    success: true,
    data: {
      totalUsers,
      usersByRole: Object.fromEntries(usersByRole.map((r) => [r._id, r.count])),
      totalProperties,
      propertiesByStatus: Object.fromEntries(propertiesByStatus.map((r) => [r._id, r.count])),
      archivedProperties: archivedCount,
    },
  });
};