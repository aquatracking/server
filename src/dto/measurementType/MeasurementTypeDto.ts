import { z } from "zod";

export const MeasurementTypeDtoSchema = z.object({
    code: z.string(),
    name: z.string(),
    unit: z.string(),
    description: z.string().optional(),
});

export type MeasurementTypeDto = z.infer<typeof MeasurementTypeDtoSchema>;
