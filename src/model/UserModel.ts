import {
    CreationOptional,
    HasManyCreateAssociationMixin,
    HasManyGetAssociationsMixin,
    InferAttributes,
    InferCreationAttributes,
    Model,
} from "sequelize";
import { ApplicationModel } from "./ApplicationModel";
import { BiotopeModel } from "./BiotopeModel";

export class UserModel extends Model<
    InferAttributes<UserModel>,
    InferCreationAttributes<UserModel>
> {
    declare id: CreationOptional<string>;
    declare username: string;
    declare email: string;
    declare password: string;
    declare verified: CreationOptional<boolean>;

    declare getBiotopeModels: HasManyGetAssociationsMixin<BiotopeModel>;
    declare createBiotopeModel: HasManyCreateAssociationMixin<BiotopeModel>;

    declare getApplicationModels: HasManyGetAssociationsMixin<ApplicationModel>;
    declare createApplicationModel: HasManyCreateAssociationMixin<ApplicationModel>;
}
