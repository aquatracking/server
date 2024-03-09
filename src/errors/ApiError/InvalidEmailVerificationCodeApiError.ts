import { z } from "zod";
import { ApiError } from "./ApiError";

export class InvalidEmailVerificationCodeApiError extends ApiError {
    static readonly schema = z.object({
        statusCode: z.literal(403),
        error: z.literal("Forbidden"),
        code: z.literal("INVALID_EMAIL_VERIFICATION_CODE"),
    });

    constructor() {
        super(403, "Forbidden", "INVALID_EMAIL_VERIFICATION_CODE");
    }
}
