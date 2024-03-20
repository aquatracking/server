import { z } from "zod";
import { ApiError } from "./ApiError";

export class WrongOTPApiError extends ApiError {
    static readonly schema = z.object({
        statusCode: z.literal(403),
        error: z.literal("Forbidden"),
        code: z.literal("WRONG_OTP"),
    });

    constructor() {
        super(403, "Forbidden", "WRONG_OTP");
    }
}
