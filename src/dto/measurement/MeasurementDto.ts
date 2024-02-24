import { z } from "zod";

export const MeasurementDtoSchema = z.object({
    id: z.string().uuid(),
    measurementTypeCode: z.string(),
    value: z.number(),
    measuredAt: z.date(),
});

export type MeasurementDto = z.infer<typeof MeasurementDtoSchema>;
