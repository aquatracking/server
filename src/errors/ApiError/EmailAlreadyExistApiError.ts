import { z } from "zod";
import { ApiError } from "./ApiError";

export class EmailAlreadyExistApiError extends ApiError {
    static readonly schema = z.object({
        statusCode: z.literal(409),
        error: z.literal("Conflict"),
        code: z.literal("EMAIL_ALREADY_EXIST"),
    });

    constructor() {
        super(409, "Conflict", "EMAIL_ALREADY_EXIST");
    }
}
