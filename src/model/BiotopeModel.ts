import {
    CreationOptional,
    ForeignKey,
    HasOneCreateAssociationMixin,
    HasOneGetAssociationMixin,
    InferAttributes,
    InferCreationAttributes,
    Model,
    NonAttribute,
} from "sequelize";
import { AquariumModel } from "./AquariumModel";
import { UserModel } from "./UserModel";

export class BiotopeModel extends Model<
    InferAttributes<BiotopeModel>,
    InferCreationAttributes<BiotopeModel>
> {
    declare id: CreationOptional<string>;
    declare name: string;
    declare description: CreationOptional<string>;
    declare type: string;
    declare image: CreationOptional<Blob | null>;
    declare startedDate: CreationOptional<Date>;
    declare archivedDate: CreationOptional<Date | null>;

    declare userId: ForeignKey<UserModel["id"]>;

    declare getAquariumModel: HasOneGetAssociationMixin<AquariumModel>;
    declare createAquariumModel: HasOneCreateAssociationMixin<AquariumModel>;

    declare AquariumModel?: NonAttribute<AquariumModel>;
}
