import { z } from "zod";

export const MeasurementSettingDtoSchema = z.object({
    id: z.string().uuid(),
    aquariumId: z.string(),
    type: z.any(), // MeasurementTypeModel
    visible: z.boolean(),
    order: z.number(),
    defaultMode: z.number(),
    minValue: z.number(),
    maxValue: z.number(),
    mailAlert: z.boolean(),
    notificationAlert: z.boolean(),
});
export type MeasurementSettingDto = z.infer<typeof MeasurementSettingDtoSchema>;

export const extractMeasurementSettingsDto = ({
    id,
    aquariumId,
    type,
    visible,
    order,
    defaultMode,
    minValue,
    maxValue,
    mailAlert,
    notificationAlert,
}: MeasurementSettingDto): MeasurementSettingDto => {
    return {
        id,
        aquariumId,
        type,
        visible,
        order,
        defaultMode,
        minValue,
        maxValue,
        mailAlert,
        notificationAlert,
    };
};
