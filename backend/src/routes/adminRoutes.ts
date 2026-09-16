import { Router } from "express";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import { restrictTo } from "../middlewares/rbacMiddleware.js";
import { AdminRole, UserRole } from "../common/constants/roles.js";
import { validate } from "../middlewares/validate.js";
import { getAllUsersSchema } from "../validations/authValidation.js";
import { deleteUser, getAdminStats, getAllPropertiesAdmin, getAllUsers, updateUserRole } from "../controllers/adminController.js";
import { deleteUserSchema, getAllPropertiesAdminSchema, updateUserRoleSchema } from "../validations/adminValidation.js";


const adminRouter = Router();

adminRouter.use(authMiddleware, restrictTo(AdminRole.ADMIN));

adminRouter.get(
    "/admin/users",
    authMiddleware,
    restrictTo(AdminRole.ADMIN),
    validate(getAllUsersSchema),
    getAllUsers
);

adminRouter.patch(
    "/admin/users/:userId/role",
     validate(updateUserRoleSchema), 
     updateUserRole
);


adminRouter.delete(
    "/admin/users/:userId",
     validate(deleteUserSchema),
    deleteUser
);

adminRouter.get(
    "/admin/properties",
     validate(getAllPropertiesAdminSchema),
    getAllPropertiesAdmin
);

adminRouter.get(
    "/admin/stats",
     getAdminStats
);

export default adminRouter;