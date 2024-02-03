import {
    CreationOptional,
    ForeignKey,
    InferAttributes,
    InferCreationAttributes,
    Model,
} from "sequelize";
import { UserModel } from "./UserModel";

export class BiotopModel extends Model<
    InferAttributes<BiotopModel>,
    InferCreationAttributes<BiotopModel>
> {
    declare id: CreationOptional<string>;
    declare name: string;
    declare description: CreationOptional<string>;
    declare type: string;
    declare image?: CreationOptional<Blob>;
    declare startedDate: CreationOptional<Date>;
    declare archivedDate?: CreationOptional<Date>;

    declare userId: ForeignKey<UserModel["id"]>;
}
