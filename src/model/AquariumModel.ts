import {
    CreationOptional,
    ForeignKey,
    HasManyCreateAssociationMixin,
    HasManyGetAssociationsMixin,
    InferAttributes,
    InferCreationAttributes,
    Model,
    NonAttribute,
} from "sequelize";
import MeasurementModel from "./MeasurementModel";
import MeasurementSettingModel from "./MeasurementSettingModel";
import UserModel from "./UserModel";

export default class AquariumModel extends Model<
    InferAttributes<AquariumModel>,
    InferCreationAttributes<AquariumModel>
> {
    declare id: CreationOptional<string>;
    declare name: string;
    declare description: CreationOptional<string>;
    declare startedDate: CreationOptional<Date>;
    declare volume: number;
    declare salt: CreationOptional<boolean>;
    declare image?: CreationOptional<Blob>;
    declare archivedDate?: CreationOptional<Date | null>;

    declare userId: ForeignKey<UserModel["id"]>;

    declare getMeasurementModels: HasManyGetAssociationsMixin<MeasurementModel>;
    declare createMeasurementModel: HasManyCreateAssociationMixin<MeasurementModel>;

    declare getMeasurementSettingModels: HasManyGetAssociationsMixin<MeasurementSettingModel>;
    declare createMeasurementSettingModel: HasManyCreateAssociationMixin<MeasurementSettingModel>;
}
