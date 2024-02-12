import {
    CreationOptional,
    ForeignKey,
    HasManyCreateAssociationMixin,
    HasManyGetAssociationsMixin,
    HasOneCreateAssociationMixin,
    HasOneGetAssociationMixin,
    InferAttributes,
    InferCreationAttributes,
    Model,
    NonAttribute,
} from "sequelize";
import { AquariumModel } from "./AquariumModel";
import { MeasurementModel } from "./MeasurementModel";
import { UserModel } from "./UserModel";

export class BiotopeModel extends Model<
    InferAttributes<BiotopeModel>,
    InferCreationAttributes<BiotopeModel>
> {
    declare id: CreationOptional<string>;
    declare name: string;
    declare description: CreationOptional<string>;
    declare type: string;
    declare image: CreationOptional<Blob | null>;
    declare startedDate: CreationOptional<Date>;
    declare archivedDate: CreationOptional<Date | null>;
    declare volume: CreationOptional<number | null>;

    declare userId: ForeignKey<UserModel["id"]>;

    declare getAquariumModel: HasOneGetAssociationMixin<AquariumModel>;
    declare createAquariumModel: HasOneCreateAssociationMixin<AquariumModel>;

    declare createMeasurementModel: HasManyCreateAssociationMixin<MeasurementModel>;
    declare getMeasurementModels: HasManyGetAssociationsMixin<MeasurementModel>;

    declare AquariumModel?: NonAttribute<AquariumModel>;
}
