import { z } from "zod";
import { ApiError } from "./ApiError";

export class UserNotAdminApiError extends ApiError {
    static readonly schema = z.object({
        statusCode: z.literal(403),
        error: z.literal("Forbidden"),
        code: z.literal("USER_NOT_ADMIN"),
    });

    constructor() {
        super(403, "Forbidden", "USER_NOT_ADMIN");
    }
}
