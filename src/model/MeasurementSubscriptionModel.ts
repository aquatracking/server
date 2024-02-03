import {
    CreationOptional,
    ForeignKey,
    InferAttributes,
    InferCreationAttributes,
    Model,
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

    declare min?: CreationOptional<number>;
    declare max?: CreationOptional<number>;
}
