import { z } from "zod";

export const MeasurementSubscriptionDtoSchema = z.object({
    biotopeId: z.string().uuid(),
    measurementTypeCode: z.string(),

    order: z.number(),
    min: z.number().nullable(),
    max: z.number().nullable(),
});

export type MeasurementSubscriptionDto = z.infer<
    typeof MeasurementSubscriptionDtoSchema
>;
