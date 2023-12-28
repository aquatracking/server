import {
    CreationOptional,
    InferAttributes,
    InferCreationAttributes,
    Model,
} from "sequelize";

export default class UserModel extends Model<
    InferAttributes<UserModel>,
    InferCreationAttributes<UserModel>
> {
    declare id: CreationOptional<string>;
    declare username: string;
    declare email: string;
    declare password: string;
}
