import {
    CreationOptional,
    ForeignKey,
    InferAttributes,
    InferCreationAttributes,
    Model,
} from "sequelize";
import { BiotopeModel } from "./BiotopeModel";
import { MeasurementTypeModel } from "./MeasurementTypeModel";

export class MeasurementModel extends Model<
    InferAttributes<MeasurementModel>,
    InferCreationAttributes<MeasurementModel>
> {
    declare id: CreationOptional<string>;

    declare biotopeId: ForeignKey<BiotopeModel["id"]>;
    declare measurementTypeCode: ForeignKey<MeasurementTypeModel["code"]>;

    declare value: number;
    declare measuredAt: CreationOptional<Date>;
}
