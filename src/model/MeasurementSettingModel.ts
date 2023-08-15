import { CreationOptional, ForeignKey, InferAttributes, InferCreationAttributes, Model, NonAttribute } from "sequelize";
import { MeasurementSettingDto } from "../dto/MeasurementSettingDto";
import AquariumModel from "./AquariumModel";

export default class MeasurementSettingModel extends Model<InferAttributes<MeasurementSettingModel>, InferCreationAttributes<MeasurementSettingModel>> {
    declare id: CreationOptional<string>;
    declare type: string;
    declare visible: CreationOptional<boolean>;
    declare order: CreationOptional<number>;
    declare defaultMode: CreationOptional<number>;
    declare minValue: CreationOptional<number>;
    declare maxValue: CreationOptional<number>;
    declare mailAlert: CreationOptional<boolean>;
    declare notificationAlert: CreationOptional<boolean>;

    declare aquariumId: ForeignKey<AquariumModel["id"]>;
    declare aquarium?: NonAttribute<AquariumModel>;

    static fromDto(dto: MeasurementSettingDto): MeasurementSettingModel {
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
            notificationAlert: dto.notificationAlert,
        });
    }
}
