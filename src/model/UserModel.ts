import bcrypt from "bcryptjs";
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
import { authenticator } from "otplib";
import { WrongPasswordApiError } from "../errors/ApiError/WrongPasswordApiError";
import { OTPRequiredApiError } from "../errors/ApiError/OTPRequiredApiError";
import { WrongOTPApiError } from "../errors/ApiError/WrongOTPApiError";

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
    declare totpSecret: CreationOptional<string | null>;
    declare deleteAt: CreationOptional<Date | null>;
    declare isAdmin: CreationOptional<boolean>;

    declare getBiotopeModels: HasManyGetAssociationsMixin<BiotopeModel>;
    declare createBiotopeModel: HasManyCreateAssociationMixin<BiotopeModel>;

    declare getApplicationModels: HasManyGetAssociationsMixin<ApplicationModel>;
    declare createApplicationModel: HasManyCreateAssociationMixin<ApplicationModel>;

    declare getUserSessionModels: HasManyGetAssociationsMixin<UserSessionModel>;

    async checkPassword(password: string): Promise<void> {
        const isPasswordValid = await bcrypt.compare(password, this.password);
        if (!isPasswordValid) {
            throw new WrongPasswordApiError();
        }
    }

    checkOTP(otp?: string): void {
        if (!this.totpEnabled) {
            return;
        }

        if (!this.totpSecret) {
            throw new Error("TOTP secret not found");
        }

        if (!otp) {
            throw new OTPRequiredApiError();
        }

        if (!authenticator.verify({ token: otp, secret: this.totpSecret })) {
            throw new WrongOTPApiError();
        }
    }

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
