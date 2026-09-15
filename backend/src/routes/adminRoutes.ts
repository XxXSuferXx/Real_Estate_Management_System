import { Router } from "express";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import { restrictTo } from "../middlewares/rbacMiddleware.js";
import { AdminRole, UserRole } from "../common/constants/roles.js";
import { User } from "../Modals/userSchema.js";
import { validate } from "../middlewares/validate.js";
import { getAllUsersSchema } from "../validations/authValidation.js";
import { getAllUsers } from "../controllers/adminController.js";


const adminRouter = Router();

adminRouter.use(authMiddleware, restrictTo(AdminRole.ADMIN));

adminRouter.get(
    "/admin/users",
    authMiddleware,
    restrictTo(AdminRole.ADMIN),
    validate(getAllUsersSchema),
    getAllUsers
);

/*adminRouter.patch(
    "/admin/users/:userId/role",
    validate(User),
    updateUserRole
);


adminRouter.get(
    '/admin/stats',
    getAdminStats
);

adminRouter.delete(
    "/admin/users/:userId",
    deleteUser
);*/

export default adminRouter;