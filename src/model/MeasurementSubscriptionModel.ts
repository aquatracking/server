import {
    CreationOptional,
    ForeignKey,
    InferAttributes,
    InferCreationAttributes,
    Model,
} from "sequelize";
import { BiotopModel } from "./BiotopModel";
import { MeasurementTypeModel } from "./MeasurementTypeModel";

export class MeasurementSubscriptionModel extends Model<
    InferAttributes<MeasurementSubscriptionModel>,
    InferCreationAttributes<MeasurementSubscriptionModel>
> {
    // Composed primary key
    declare biotopId: ForeignKey<BiotopModel["id"]>;
    declare measurementTypeCode: ForeignKey<MeasurementTypeModel["code"]>;

    declare min?: CreationOptional<number>;
    declare max?: CreationOptional<number>;
}
