import { z } from "zod";

export const MeasurementCreateDtoSchema = z.object({
    measurementTypeCode: z.string().min(1).max(255),
    value: z.number(),
    measuredAt: z.date().default(() => new Date()),
});

export type MeasurementCreateDto = z.infer<typeof MeasurementCreateDtoSchema>;
