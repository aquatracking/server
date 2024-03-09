import { z } from "zod";
import { ApiError } from "./ApiError";

export class UsernameAlreadyExistApiError extends ApiError {
    static readonly schema = z.object({
        statusCode: z.literal(409),
        error: z.literal("Conflict"),
        code: z.literal("USERNAME_ALREADY_EXIST"),
    });

    constructor() {
        super(409, "Conflict", "USERNAME_ALREADY_EXIST");
    }
}
