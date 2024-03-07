import { InferAttributes, InferCreationAttributes, Model, Op } from "sequelize";

export class EmailValidationOTPModel extends Model<
    InferAttributes<EmailValidationOTPModel>,
    InferCreationAttributes<EmailValidationOTPModel>
> {
    declare email: string;
    declare code: string;
    declare expiresAt: Date;

    static destroyExpiredTokens() {
        return EmailValidationOTPModel.destroy({
            where: {
                expiresAt: {
                    [Op.lt]: new Date(),
                },
            },
        });
    }
}
