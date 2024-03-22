import { z } from "zod";

export const MeasurementTypeUpdateDtoSchema = z
    .object({
        name: z.string().min(2).max(50),
        unit: z.string().min(0).max(10),
        description: z.string().max(200),
    })
    .partial();

export type MeasurementTypeUpdateDto = z.infer<
    typeof MeasurementTypeUpdateDtoSchema
>;
