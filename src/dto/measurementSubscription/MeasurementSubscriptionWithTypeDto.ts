import { z } from "zod";
import { MeasurementTypeDtoSchema } from "../measurementType/MeasurementTypeDto";

export const MeasurementSubscriptionWithTypeDtoSchema = z.object({
    biotopeId: z.string().uuid(),

    order: z.number(),
    min: z.number().nullable(),
    max: z.number().nullable(),

    measurementType: MeasurementTypeDtoSchema,
});

export type MeasurementSubscriptionWithTypeDto = z.infer<
    typeof MeasurementSubscriptionWithTypeDtoSchema
>;
