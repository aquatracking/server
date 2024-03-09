import { z } from "zod";
import { ApiError } from "./ApiError";

export class TOTPNotEnabledApiError extends ApiError {
    static readonly schema = z.object({
        statusCode: z.literal(400),
        error: z.literal("Bad Request"),
        code: z.literal("TOTP_NOT_ENABLED"),
    });

    constructor() {
        super(400, "Bad Request", "TOTP_NOT_ENABLED");
    }
}
