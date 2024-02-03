import {
    CreationOptional,
    HasManyCreateAssociationMixin,
    HasManyGetAssociationsMixin,
    InferAttributes,
    InferCreationAttributes,
    Model,
} from "sequelize";
import AquariumModel from "./AquariumModel";
import ApplicationModel from "./ApplicationModel";

export default class UserModel extends Model<
    InferAttributes<UserModel>,
    InferCreationAttributes<UserModel>
> {
    declare id: CreationOptional<string>;
    declare username: string;
    declare email: string;
    declare password: string;

    declare getAquariumModels: HasManyGetAssociationsMixin<AquariumModel>;

    declare getApplicationModels: HasManyGetAssociationsMixin<ApplicationModel>;
    declare createApplicationModel: HasManyCreateAssociationMixin<ApplicationModel>;
}
