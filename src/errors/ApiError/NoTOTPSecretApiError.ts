import { z } from "zod";
import { ApiError } from "./ApiError";

export class NoTOTPSecretApiError extends ApiError {
    static readonly schema = z.object({
        statusCode: z.literal(400),
        error: z.literal("Bad Request"),
        code: z.literal("NO_TOTP_SECRET"),
    });

    constructor() {
        super(400, "Bad Request", "NO_TOTP_SECRET");
    }
}
