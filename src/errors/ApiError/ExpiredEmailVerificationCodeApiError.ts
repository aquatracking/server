import { z } from "zod";
import { ApiError } from "./ApiError";

export class ExpiredEmailVerificationCodeApiError extends ApiError {
    static readonly schema = z.object({
        statusCode: z.literal(403),
        error: z.literal("Forbidden"),
        code: z.literal("EXPIRED_EMAIL_VERIFICATION_CODE"),
    });

    constructor() {
        super(403, "Forbidden", "EXPIRED_EMAIL_VERIFICATION_CODE");
    }
}
