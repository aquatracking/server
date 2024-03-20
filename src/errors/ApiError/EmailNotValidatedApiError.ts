import { z } from "zod";
import { ApiError } from "./ApiError";

export class EmailNotValidatedApiError extends ApiError {
    static readonly schema = z.object({
        statusCode: z.literal(403),
        error: z.literal("Forbidden"),
        code: z.literal("EMAIL_NOT_VALIDATED"),
    });

    constructor() {
        super(403, "Forbidden", "EMAIL_NOT_VALIDATED");
    }
}
