import {
    CreationOptional,
    ForeignKey,
    InferAttributes,
    InferCreationAttributes,
    Model,
    NonAttribute,
} from "sequelize";
import AquariumModel from "./AquariumModel";

export default class MeasurementModel extends Model<
    InferAttributes<MeasurementModel>,
    InferCreationAttributes<MeasurementModel>
> {
    declare id: CreationOptional<string>;
    declare type: string;
    declare value: number;
    declare measuredAt: Date;

    declare aquariumId: ForeignKey<AquariumModel["id"]>;
    declare aquarium?: NonAttribute<AquariumModel>;
}
