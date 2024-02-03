import {
    CreationOptional,
    ForeignKey,
    InferAttributes,
    InferCreationAttributes,
    Model,
} from "sequelize";
import { BiotopeModel } from "./BiotopeModel";

export class AquariumModel extends Model<
    InferAttributes<AquariumModel>,
    InferCreationAttributes<AquariumModel>
> {
    declare biotopeId: ForeignKey<BiotopeModel["id"]>;
    declare volume: number;
    declare salt: CreationOptional<boolean>;
}
