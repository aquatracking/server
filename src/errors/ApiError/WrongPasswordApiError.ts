import { z } from "zod";
import { ApiError } from "./ApiError";

export class WrongPasswordApiError extends ApiError {
    static readonly schema = z.object({
        statusCode: z.literal(403),
        error: z.literal("Forbidden"),
        code: z.literal("WRONG_PASSWORD"),
    });

    constructor() {
        super(403, "Forbidden", "WRONG_PASSWORD");
    }
}
