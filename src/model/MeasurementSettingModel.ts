import {Model} from "sequelize";
import MeasurementSettingDto from "../dto/MeasurementSettingDto";

export default class MeasurementSettingModel extends Model{
    id: string
    aquariumId: string
    type: string
    visible: boolean
    order: number
    defaultMode: number
    minValue: number
    maxValue: number
    mailAlert: boolean
    notificationAlert: boolean

    static fromDto(dto: MeasurementSettingDto) : MeasurementSettingModel {
        return new MeasurementSettingModel({
            id: dto.id,
            aquariumId: dto.aquariumId,
            type: dto.type.code,
            visible: dto.visible,
            order: dto.order,
            defaultMode: dto.defaultMode,
            minValue: dto.minValue,
            maxValue: dto.maxValue,
            mailAlert: dto.mailAlert,
            notificationAlert: dto.notificationAlert
        })
    }
}