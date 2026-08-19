import type { Locale } from "../common/constants/locale.ts";
import { Role } from "../common/constants/roles.ts";

declare global {
    namespace Express {
        interface Request {
            user?: {
                id: string;
                role: UserRole;
            };
            validated?: { body?: unknow; query?: unknown; params?: unknown };
            locale: Locale;
        }
    }
}

export {};