import type { Locale } from "../common/constants/locale.js";
import type { Role } from "../common/constants/roles.js";

declare global {
    namespace Express {
        interface Request {
            user?: {
                id: string;
                role: Role;
            };
            validated?: { body?: unknown; query?: unknown; params?: unknown };
            locale: Locale;
        }
    }
}

export {};