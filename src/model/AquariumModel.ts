import {
    CreationOptional,
    ForeignKey,
    InferAttributes,
    InferCreationAttributes,
    Model,
} from "sequelize";
import { BiotopModel } from "./BiotopModel";

export class AquariumModel extends Model<
    InferAttributes<AquariumModel>,
    InferCreationAttributes<AquariumModel>
> {
    declare biotopId: ForeignKey<BiotopModel["id"]>;
    declare volume: number;
    declare salt: CreationOptional<boolean>;
}
