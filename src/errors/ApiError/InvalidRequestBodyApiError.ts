import { z } from "zod";
import { ApiError } from "./ApiError";

export class InvalidRequestBodyApiError extends ApiError {
    static readonly schema = z.object({
        statusCode: z.literal(400),
        error: z.literal("Bad Request"),
        code: z.literal("INVALID_REQUEST_BODY"),
        data: z.unknown(),
    });

    constructor() {
        super(400, "Bad Request", "INVALID_REQUEST_BODY");
    }
}
