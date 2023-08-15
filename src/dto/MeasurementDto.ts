import { z } from "zod";

export const MeasurementDtoSchema = z.object({
    id: z.string(),
    type: z.string(),
    value: z.number(),
    measuredAt: z.date(),
});

export type MeasurementDto = z.infer<typeof MeasurementDtoSchema>;

export const extractMeasurementDto = ({
    id,
    type,
    value,
    measuredAt,
}: MeasurementDto) => {
    return { id, type, value, measuredAt };
};
