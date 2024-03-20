import { z } from "zod";
import { ApiError } from "./ApiError";

export class UserNotFoundApiError extends ApiError {
    static readonly schema = z.object({
        statusCode: z.literal(404),
        error: z.literal("Not Found"),
        code: z.literal("USER_NOT_FOUND"),
    });

    constructor() {
        super(404, "Not Found", "USER_NOT_FOUND");
    }
}
