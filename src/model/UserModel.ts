import {
    CreationOptional,
    HasManyCreateAssociationMixin,
    HasManyGetAssociationsMixin,
    InferAttributes,
    InferCreationAttributes,
    Model,
    Op,
} from "sequelize";
import { ApplicationModel } from "./ApplicationModel";
import { BiotopeModel } from "./BiotopeModel";
import { UserSessionModel } from "./UserSessionModel";

export class UserModel extends Model<
    InferAttributes<UserModel>,
    InferCreationAttributes<UserModel>
> {
    declare id: CreationOptional<string>;
    declare username: string;
    declare email: string;
    declare password: string;
    declare verified: CreationOptional<boolean>;
    declare totpEnabled: CreationOptional<boolean>;
    declare totpSecret?: CreationOptional<string | null>;
    declare deleteAt?: CreationOptional<Date | null>;

    declare getBiotopeModels: HasManyGetAssociationsMixin<BiotopeModel>;
    declare createBiotopeModel: HasManyCreateAssociationMixin<BiotopeModel>;

    declare getApplicationModels: HasManyGetAssociationsMixin<ApplicationModel>;
    declare createApplicationModel: HasManyCreateAssociationMixin<ApplicationModel>;

    destroyAllSessions() {
        return UserSessionModel.destroy({
            where: {
                userId: this.id,
            },
        });
    }

    static destroyExpiredDeletedUsers() {
        return UserModel.destroy({
            where: {
                deleteAt: {
                    [Op.lt]: new Date(),
                },
            },
        });
    }
}
