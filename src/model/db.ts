import { DataTypes, Sequelize } from "sequelize";
import { env } from "../env";
import { ApplicationModel } from "./ApplicationModel";
import { AquariumModel } from "./AquariumModel";
import { BiotopModel } from "./BiotopModel";
import { MeasurementModel } from "./MeasurementModel";
import { MeasurementSubscriptionModel } from "./MeasurementSubscriptionModel";
import { MeasurementTypeModel } from "./MeasurementTypeModel";
import { UserModel } from "./UserModel";
import { UserSessionModel } from "./UserSessionModel";

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
            },
        );
        await Db.sequelize.authenticate();
        console.log("Connected to database");

        let sequelize = Db.sequelize;

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
            },
            { sequelize, tableName: "users" },
        );

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

        BiotopModel.init(
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
                userId: {
                    type: DataTypes.UUID,
                    allowNull: false,
                    references: {
                        model: UserModel,
                        key: "id",
                    },
                },
            },
            { sequelize, tableName: "biotops" },
        );
        UserModel.hasMany(BiotopModel, { foreignKey: "userId" });
        BiotopModel.belongsTo(UserModel, { foreignKey: "userId" });

        AquariumModel.init(
            {
                biotopId: {
                    type: DataTypes.UUID,
                    primaryKey: true,
                    references: {
                        model: BiotopModel,
                        key: "id",
                    },
                },
                volume: {
                    type: DataTypes.INTEGER,
                    allowNull: false,
                },
                salt: {
                    type: DataTypes.BOOLEAN,
                    defaultValue: false,
                },
            },
            { sequelize, tableName: "aquarium" },
        );
        BiotopModel.hasOne(AquariumModel, { foreignKey: "biotopId" });
        AquariumModel.belongsTo(BiotopModel, { foreignKey: "biotopId" });

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
                biotopId: {
                    type: DataTypes.UUID,
                    primaryKey: true,
                    references: {
                        model: BiotopModel,
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
        BiotopModel.hasMany(MeasurementSubscriptionModel, {
            foreignKey: "biotopId",
        });
        MeasurementSubscriptionModel.belongsTo(BiotopModel, {
            foreignKey: "biotopId",
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
                biotopId: {
                    type: DataTypes.UUID,
                    references: {
                        model: BiotopModel,
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
        BiotopModel.hasMany(MeasurementModel, { foreignKey: "biotopId" });
        MeasurementModel.belongsTo(BiotopModel, { foreignKey: "biotopId" });
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
