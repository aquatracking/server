import { z } from "zod";
import { ApiError } from "./ApiError";

export class EmailAlreadyVerifiedApiError extends ApiError {
    static readonly schema = z.object({
        statusCode: z.literal(400),
        error: z.literal("Bad Request"),
        code: z.literal("EMAIL_ALREADY_VERIFIED"),
    });

    constructor() {
        super(400, "Bad Request", "EMAIL_ALREADY_VERIFIED");
    }
}
