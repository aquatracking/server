import { z } from "zod";
import { ApiError } from "./ApiError";

export class NotSessionLoggedUserApiError extends ApiError {
    static readonly schema = z.object({
        statusCode: z.literal(403),
        error: z.literal("Forbidden"),
        code: z.literal("NOT_SESSION_LOGGED_USER"),
    });

    constructor() {
        super(403, "Forbidden", "NOT_SESSION_LOGGED_USER");
    }
}
