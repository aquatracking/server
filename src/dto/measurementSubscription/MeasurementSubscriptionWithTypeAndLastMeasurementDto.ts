import { z } from "zod";
import { MeasurementTypeDtoSchema } from "../measurementType/MeasurementTypeDto";
import { MeasurementDtoSchema } from "../measurement/MeasurementDto";

export const MeasurementSubscriptionWithTypeAndLastMeasurementDtoSchema =
    z.object({
        biotopeId: z.string().uuid(),

        order: z.number(),
        min: z.number().nullable(),
        max: z.number().nullable(),

        measurementType: MeasurementTypeDtoSchema,
        lastMeasurement: MeasurementDtoSchema.nullable().optional(),
    });

export type MeasurementSubscriptionWithTypeAndLastMeasurementDto = z.infer<
    typeof MeasurementSubscriptionWithTypeAndLastMeasurementDtoSchema
>;
