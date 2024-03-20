import { z } from "zod";
import { ApiError } from "./ApiError";

export class NoEmailVerificationCodeApiError extends ApiError {
    static readonly schema = z.object({
        statusCode: z.literal(403),
        error: z.literal("Forbidden"),
        code: z.literal("NO_EMAIL_VERIFICATION_CODE"),
    });

    constructor() {
        super(403, "Forbidden", "NO_EMAIL_VERIFICATION_CODE");
    }
}
