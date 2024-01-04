import { z } from "zod";

export const MeasurementSettingDtoSchema = z.object({
    id: z.string().uuid(),
    aquariumId: z.string(),
    type: z.any(), // MeasurementTypeModel
    visible: z.boolean(),
    order: z.number(),
    defaultMode: z.number(),
    minValue: z.number().nullable(),
    maxValue: z.number().nullable(),
    mailAlert: z.boolean(),
    notificationAlert: z.boolean(),
});
export type MeasurementSettingDto = z.infer<typeof MeasurementSettingDtoSchema>;
