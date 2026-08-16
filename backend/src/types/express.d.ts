import { Role } from "../common/constants/roles.ts";

declare global {
    namespace Express {
        interface Request {
            user?: {
                id: string;
                role: UserRole;
            };
            validated?: { body?: any; query?: any; params?: any };
        }
    }
}

export {};