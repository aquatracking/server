import { z } from "zod";

export const MeasurementSubscriptionUpdateDtoSchema = z
    .object({
        order: z.number(),
        min: z.number().nullable(),
        max: z.number().nullable(),
    })
    .partial();

export type MeasurementSubscriptionUpdateDto = z.infer<
    typeof MeasurementSubscriptionUpdateDtoSchema
>;
