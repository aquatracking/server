import {
    CreationOptional,
    ForeignKey,
    InferAttributes,
    InferCreationAttributes,
    Model,
    NonAttribute,
} from "sequelize";
import UserModel from "./UserModel";

export default class ApplicationModel extends Model<
    InferAttributes<ApplicationModel>,
    InferCreationAttributes<ApplicationModel>
> {
    declare id: CreationOptional<string>;
    declare name: string;
    declare description: string;
    declare token: string;

    declare userId: ForeignKey<UserModel["id"]>;
    declare user?: NonAttribute<UserModel>;
}
