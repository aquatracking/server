import { z } from "zod";
import { ApiError } from "./ApiError";

export class NotLoggedApiError extends ApiError {
    static readonly schema = z.object({
        statusCode: z.literal(401),
        error: z.literal("Unauthorized"),
        code: z.literal("NOT_LOGGED"),
    });

    constructor() {
        super(401, "Unauthorized", "NOT_LOGGED");
    }
}
