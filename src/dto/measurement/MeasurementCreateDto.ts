import { z } from "zod";

export const MeasurementCreateDtoSchema = z.object({
    value: z.number(),
    measuredAt: z.date().default(() => new Date()),
});

export type MeasurementCreateDto = z.infer<typeof MeasurementCreateDtoSchema>;
