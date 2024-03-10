import { z } from "zod";
import { ApiError } from "./ApiError";

export class CantDeleteItSelfApiError extends ApiError {
    static readonly schema = z.object({
        statusCode: z.literal(400),
        error: z.literal("Bad Request"),
        code: z.literal("CANT_DELETE_IT_SELF"),
    });

    constructor() {
        super(400, "Bad Request", "CANT_DELETE_IT_SELF");
    }
}
