import { z } from "zod";
import { ApiError } from "./ApiError";

export class CantDeleteUsedMeasurementTypeApiError extends ApiError {
    static readonly schema = z.object({
        statusCode: z.literal(409),
        error: z.literal("Conflict"),
        code: z.literal("CANT_DELETE_USED_MEASUREMENT_TYPE"),
    });

    constructor() {
        super(409, "Conflict", "CANT_DELETE_USED_MEASUREMENT_TYPE");
    }
}
