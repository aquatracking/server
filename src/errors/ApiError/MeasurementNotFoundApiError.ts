import { z } from "zod";
import { ApiError } from "./ApiError";

export class MeasurementNotFoundApiError extends ApiError {
    static readonly schema = z.object({
        statusCode: z.literal(404),
        error: z.literal("Not Found"),
        code: z.literal("MEASUREMENT_NOT_FOUND"),
    });

    constructor() {
        super(404, "Not Found", "MEASUREMENT_NOT_FOUND");
    }
}
