import { z } from "zod";

export const MeasurementTypeCreateDtoSchema = z.object({
    code: z.string().min(2).max(10),
    name: z.string().min(2).max(50),
    unit: z.string().min(0).max(10),
    description: z.string().max(200).optional(),
});

export type MeasurementTypeCreateDto = z.infer<
    typeof MeasurementTypeCreateDtoSchema
>;
