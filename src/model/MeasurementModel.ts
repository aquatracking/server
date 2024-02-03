import {
    CreationOptional,
    ForeignKey,
    InferAttributes,
    InferCreationAttributes,
    Model,
} from "sequelize";
import { BiotopModel } from "./BiotopModel";
import { MeasurementTypeModel } from "./MeasurementTypeModel";

export class MeasurementModel extends Model<
    InferAttributes<MeasurementModel>,
    InferCreationAttributes<MeasurementModel>
> {
    declare id: CreationOptional<string>;

    declare biotopId: ForeignKey<BiotopModel["id"]>;
    declare measurementTypeCode: ForeignKey<MeasurementTypeModel["code"]>;

    declare value: number;
    declare measuredAt: CreationOptional<Date>;
}
