import {
    CreationOptional,
    HasManyCreateAssociationMixin,
    HasManyGetAssociationsMixin,
    InferAttributes,
    InferCreationAttributes,
    Model,
} from "sequelize";
import { ApplicationModel } from "./ApplicationModel";
import { BiotopModel } from "./BiotopModel";

export class UserModel extends Model<
    InferAttributes<UserModel>,
    InferCreationAttributes<UserModel>
> {
    declare id: CreationOptional<string>;
    declare username: string;
    declare email: string;
    declare password: string;

    declare getBiotopModels: HasManyGetAssociationsMixin<BiotopModel>;

    declare getApplicationModels: HasManyGetAssociationsMixin<ApplicationModel>;
    declare createApplicationModel: HasManyCreateAssociationMixin<ApplicationModel>;
}
