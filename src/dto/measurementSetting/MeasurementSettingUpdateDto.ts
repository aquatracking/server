import { z } from "zod";

export const MeasurementSettingUpdateDtoSchema = z.object({
    id: z.string().uuid(),
    aquariumId: z.string(),
    type: z.any(), // MeasurementTypeModel
    visible: z.boolean(),
    order: z.number(),
    defaultMode: z.number(),
    minValue: z.number().optional(),
    maxValue: z.number().optional(),
    mailAlert: z.boolean(),
    notificationAlert: z.boolean(),
});
export type MeasurementSettingDto = z.infer<
    typeof MeasurementSettingUpdateDtoSchema
>;
