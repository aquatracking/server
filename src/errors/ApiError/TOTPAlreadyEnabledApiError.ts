import { z } from "zod";
import { ApiError } from "./ApiError";

export class TOTPAlreadyEnabledApiError extends ApiError {
    static readonly schema = z.object({
        statusCode: z.literal(400),
        error: z.literal("Bad Request"),
        code: z.literal("TOTP_ALREADY_ENABLED"),
    });

    constructor() {
        super(400, "Bad Request", "TOTP_ALREADY_ENABLED");
    }
}
