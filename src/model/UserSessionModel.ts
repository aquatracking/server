import { CreationOptional, HasOneGetAssociationMixin, Model } from "sequelize";
import UserModel from "./UserModel";

export class UserSessionModel extends Model {
    declare id: CreationOptional<string>;
    declare name: string;
    declare token: string;
    declare firstConnectionDate: Date;
    declare lastConnectionDate: Date;

    declare userId: string;

    declare getUserModel: HasOneGetAssociationMixin<UserModel>;
}
