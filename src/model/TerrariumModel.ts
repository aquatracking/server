import {
    CreationOptional,
    ForeignKey,
    InferAttributes,
    InferCreationAttributes,
    Model,
} from "sequelize";
import { BiotopeModel } from "./BiotopeModel";

export class TerrariumModel extends Model<
    InferAttributes<TerrariumModel>,
    InferCreationAttributes<TerrariumModel>
> {
    declare biotopeId: ForeignKey<BiotopeModel["id"]>;
    declare wet: CreationOptional<boolean>;
}
