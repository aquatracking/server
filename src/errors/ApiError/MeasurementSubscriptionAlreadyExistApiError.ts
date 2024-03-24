import { z } from "zod";
import { ApiError } from "./ApiError";

export class MeasurementSubscriptionAlreadyExistApiError extends ApiError {
    static readonly schema = z.object({
        statusCode: z.literal(409),
        error: z.literal("Conflict"),
        code: z.literal("MEASUREMENT_SUBSCRIPTION_ALREADY_EXIST"),
    });

    constructor() {
        super(409, "Conflict", "MEASUREMENT_SUBSCRIPTION_ALREADY_EXIST");
    }
}
