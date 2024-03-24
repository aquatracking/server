import {
    CreationOptional,
    ForeignKey,
    InferAttributes,
    InferCreationAttributes,
    Model,
    NonAttribute,
} from "sequelize";
import { BiotopeModel } from "./BiotopeModel";
import { MeasurementTypeModel } from "./MeasurementTypeModel";

export class MeasurementSubscriptionModel extends Model<
    InferAttributes<MeasurementSubscriptionModel>,
    InferCreationAttributes<MeasurementSubscriptionModel>
> {
    // Composed primary key
    declare biotopeId: ForeignKey<BiotopeModel["id"]>;
    declare measurementTypeCode: ForeignKey<MeasurementTypeModel["code"]>;

    declare order: number;
    declare min: CreationOptional<number | null>;
    declare max: CreationOptional<number | null>;

    declare MeasurementTypeModel?: NonAttribute<MeasurementTypeModel>;
}
