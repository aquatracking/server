import { z } from "zod";

export const MeasurementSubscriptionCreateDtoSchema = z.object({
    order: z.number().optional(),
    min: z.number().nullable().optional(),
    max: z.number().nullable().optional(),
});

export type MeasurementSubscriptionCreateDto = z.infer<
    typeof MeasurementSubscriptionCreateDtoSchema
>;
