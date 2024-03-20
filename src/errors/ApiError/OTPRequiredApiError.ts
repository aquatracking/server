import { z } from "zod";
import { ApiError } from "./ApiError";

export class OTPRequiredApiError extends ApiError {
    static readonly schema = z.object({
        statusCode: z.literal(403),
        error: z.literal("Forbidden"),
        code: z.literal("OTP_REQUIRED"),
    });

    constructor() {
        super(403, "Forbidden", "OTP_REQUIRED");
    }
}
