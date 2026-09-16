import { z } from "zod";
import { UserRole, AdminRole } from "../common/constants/roles.js";

const objectIdSchema = z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid ID format");

// Only buyer/agent/admin are settable here 

const settableRoles = [UserRole.BUYER, UserRole.AGENT, AdminRole.ADMIN] as const;

export const updateUserRoleSchema = z.object({
  params: z.object({ userId: objectIdSchema }),
  body: z.object({ role: z.enum(settableRoles) }),
});

export const deleteUserSchema = z.object({
  params: z.object({ userId: objectIdSchema }),
});

export const getAllPropertiesAdminSchema = z.object({
  query: z.object({
    page: z.coerce.number().int().positive().optional(),
    limit: z.coerce.number().int().positive().max(100).optional(),
    status: z.enum(['available', 'pending', 'sold', 'rented']).optional(),
    type: z.enum(['apartment', 'house', 'villa', 'plot', 'commercial', 'mansion']).optional(),
    listingType: z.enum(['sale', 'rent']).optional(),
    agent: objectIdSchema.optional(),
    archived: z.enum(['true', 'false', 'all']).optional(),
    search: z.string().optional(),
  }),
});