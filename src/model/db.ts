import { DataTypes, Sequelize } from "sequelize";
import { env } from "../env";
import { ApplicationModel } from "./ApplicationModel";
import { AquariumModel } from "./AquariumModel";
import { BiotopeModel } from "./BiotopeModel";
import { MeasurementModel } from "./MeasurementModel";
import { MeasurementSubscriptionModel } from "./MeasurementSubscriptionModel";
import { MeasurementTypeModel } from "./MeasurementTypeModel";
import { UserModel } from "./UserModel";
import { UserSessionModel } from "./UserSessionModel";
import { TerrariumModel } from "./TerrariumModel";
import { EmailValidationOTPModel } from "./EmailValidationOTPModel";

export default class Db {
    private static sequelize: Sequelize;

    static async init(): Promise<void> {
        this.sequelize = new Sequelize(
            env.MARIADB_DATABASE,
            env.MARIADB_USER,
            env.MARIADB_PASSWORD,
            {
                dialect: "mysql",
                host: env.MARIADB_HOST,
                port: env.MARIADB_PORT,
                logging: false,
            },
        );
        await Db.sequelize.authenticate();
        console.log("Connected to database");

        const sequelize = Db.sequelize;

        UserModel.init(
            {
                id: {
                    type: DataTypes.UUID,
                    primaryKey: true,
                    defaultValue: DataTypes.UUIDV4,
                },
                username: {
                    type: DataTypes.STRING,
                    allowNull: false,
                    unique: true,
                },
                email: {
                    type: DataTypes.STRING,
                    allowNull: false,
                    unique: true,
                },
                password: {
                    type: DataTypes.STRING,
                    allowNull: false,
                },
                verified: {
                    type: DataTypes.BOOLEAN,
                    allowNull: false,
                    defaultValue: false,
                },
                totpEnabled: {
                    type: DataTypes.BOOLEAN,
                    allowNull: false,
                    defaultValue: false,
                },
                totpSecret: {
                    type: DataTypes.STRING,
                },
                deleteAt: {
                    type: DataTypes.DATE,
                },
            },
            { sequelize, tableName: "users" },
        );

        EmailValidationOTPModel.init(
            {
                email: {
                    type: DataTypes.STRING,
                    primaryKey: true,
                    allowNull: false,
                    references: {
                        model: UserModel,
                        key: "email",
                    },
                },
                code: {
                    type: DataTypes.STRING,
                    allowNull: false,
                },
                expiresAt: {
                    type: DataTypes.DATE,
                    allowNull: false,
                },
            },
            { sequelize, tableName: "email_validation_otp" },
        );
        UserModel.hasOne(EmailValidationOTPModel, { foreignKey: "email" });
        EmailValidationOTPModel.belongsTo(UserModel, { foreignKey: "email" });

        UserSessionModel.init(
            {
                id: {
                    type: DataTypes.UUID,
                    primaryKey: true,
                    defaultValue: DataTypes.UUIDV4,
                },
                name: {
                    type: DataTypes.STRING,
                    allowNull: false,
                },
                firstConnectionDate: {
                    type: DataTypes.DATE,
                    defaultValue: DataTypes.NOW,
                    allowNull: false,
                },
                lastConnectionDate: {
                    type: DataTypes.DATE,
                    defaultValue: DataTypes.NOW,
                    allowNull: false,
                },
                token: {
                    type: DataTypes.TEXT,
                    allowNull: false,
                },
                userId: {
                    type: DataTypes.UUID,
                    allowNull: false,
                    references: {
                        model: UserModel,
                        key: "id",
                    },
                },
            },
            { sequelize, tableName: "user_sessions" },
        );
        UserModel.hasMany(UserSessionModel, { foreignKey: "userId" });
        UserSessionModel.belongsTo(UserModel, { foreignKey: "userId" });

        ApplicationModel.init(
            {
                id: {
                    type: DataTypes.UUID,
                    primaryKey: true,
                    defaultValue: DataTypes.UUIDV4,
                },
                name: {
                    type: DataTypes.STRING,
                    allowNull: false,
                },
                description: {
                    type: DataTypes.STRING,
                    defaultValue: "",
                },
                token: {
                    type: DataTypes.TEXT,
                    allowNull: false,
                },
                userId: {
                    type: DataTypes.UUID,
                    allowNull: false,
                    references: {
                        model: UserModel,
                        key: "id",
                    },
                },
            },
            { sequelize, tableName: "applications" },
        );
        UserModel.hasMany(ApplicationModel, { foreignKey: "userId" });
        ApplicationModel.belongsTo(UserModel, { foreignKey: "userId" });

        BiotopeModel.init(
            {
                id: {
                    type: DataTypes.UUID,
                    primaryKey: true,
                    defaultValue: DataTypes.UUIDV4,
                },
                name: {
                    type: DataTypes.STRING,
                    allowNull: false,
                },
                description: {
                    type: DataTypes.STRING,
                    allowNull: false,
                    defaultValue: "",
                },
                type: {
                    type: DataTypes.STRING,
                    allowNull: false,
                },
                image: {
                    type: DataTypes.BLOB,
                    allowNull: true,
                },
                startedDate: {
                    type: DataTypes.DATE,
                    allowNull: false,
                    defaultValue: DataTypes.NOW,
                },
                archivedDate: {
                    type: DataTypes.DATE,
                },
                volume: {
                    type: DataTypes.INTEGER,
                },
                userId: {
                    type: DataTypes.UUID,
                    allowNull: false,
                    references: {
                        model: UserModel,
                        key: "id",
                    },
                },
            },
            { sequelize, tableName: "biotopes" },
        );
        UserModel.hasMany(BiotopeModel, { foreignKey: "userId" });
        BiotopeModel.belongsTo(UserModel, { foreignKey: "userId" });

        AquariumModel.init(
            {
                biotopeId: {
                    type: DataTypes.UUID,
                    primaryKey: true,
                    references: {
                        model: BiotopeModel,
                        key: "id",
                    },
                },
                salt: {
                    type: DataTypes.BOOLEAN,
                    defaultValue: false,
                },
            },
            { sequelize, tableName: "aquarium" },
        );
        BiotopeModel.hasOne(AquariumModel, {
            foreignKey: "biotopeId",
        });
        AquariumModel.belongsTo(BiotopeModel, {
            foreignKey: "biotopeId",
        });

        TerrariumModel.init(
            {
                biotopeId: {
                    type: DataTypes.UUID,
                    primaryKey: true,
                    references: {
                        model: BiotopeModel,
                        key: "id",
                    },
                },
                wet: {
                    type: DataTypes.BOOLEAN,
                    defaultValue: false,
                },
            },
            { sequelize, tableName: "terrarium" },
        );
        BiotopeModel.hasOne(TerrariumModel, {
            foreignKey: "biotopeId",
        });
        TerrariumModel.belongsTo(BiotopeModel, {
            foreignKey: "biotopeId",
        });

        MeasurementTypeModel.init(
            {
                code: {
                    type: DataTypes.STRING,
                    primaryKey: true,
                },
                name: {
                    type: DataTypes.STRING,
                    allowNull: false,
                },
                unit: {
                    type: DataTypes.STRING,
                    allowNull: false,
                },
                description: {
                    type: DataTypes.STRING,
                },
            },
            { sequelize, tableName: "measurement_types" },
        );

        MeasurementSubscriptionModel.init(
            {
                biotopeId: {
                    type: DataTypes.UUID,
                    primaryKey: true,
                    references: {
                        model: BiotopeModel,
                        key: "id",
                    },
                },
                measurementTypeCode: {
                    type: DataTypes.STRING,
                    primaryKey: true,
                    references: {
                        model: MeasurementTypeModel,
                        key: "code",
                    },
                },
                min: {
                    type: DataTypes.DOUBLE,
                },
                max: {
                    type: DataTypes.DOUBLE,
                },
            },
            { sequelize, tableName: "measurement_subscriptions" },
        );
        BiotopeModel.hasMany(MeasurementSubscriptionModel, {
            foreignKey: "biotopeId",
        });
        MeasurementSubscriptionModel.belongsTo(BiotopeModel, {
            foreignKey: "biotopeId",
        });
        MeasurementTypeModel.hasMany(MeasurementSubscriptionModel, {
            foreignKey: "measurementTypeCode",
        });
        MeasurementSubscriptionModel.belongsTo(MeasurementTypeModel, {
            foreignKey: "measurementTypeCode",
        });

        MeasurementModel.init(
            {
                id: {
                    type: DataTypes.UUID,
                    primaryKey: true,
                    defaultValue: DataTypes.UUIDV4,
                },
                biotopeId: {
                    type: DataTypes.UUID,
                    references: {
                        model: BiotopeModel,
                        key: "id",
                    },
                },
                measurementTypeCode: {
                    type: DataTypes.STRING,
                    references: {
                        model: MeasurementTypeModel,
                        key: "code",
                    },
                },
                value: {
                    type: DataTypes.DOUBLE,
                    allowNull: false,
                },
                measuredAt: {
                    type: DataTypes.DATE,
                    defaultValue: DataTypes.NOW,
                    allowNull: false,
                },
            },
            { sequelize, tableName: "measurements" },
        );
        BiotopeModel.hasMany(MeasurementModel, { foreignKey: "biotopeId" });
        MeasurementModel.belongsTo(BiotopeModel, { foreignKey: "biotopeId" });
        MeasurementTypeModel.hasMany(MeasurementModel, {
            foreignKey: "measurementTypeCode",
        });
        MeasurementModel.belongsTo(MeasurementTypeModel, {
            foreignKey: "measurementTypeCode",
        });

        await sequelize.sync();

        console.log("Database initialized");
    }
}
