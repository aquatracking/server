import {
    CreationOptional,
    InferAttributes,
    InferCreationAttributes,
    Model,
} from "sequelize";

export class MeasurementTypeModel extends Model<
    InferAttributes<MeasurementTypeModel>,
    InferCreationAttributes<MeasurementTypeModel>
> {
    declare code: string;
    declare name: string;
    declare unit: string;
    declare description: CreationOptional<string>;
}
