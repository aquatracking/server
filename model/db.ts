import {DataTypes, Sequelize} from "sequelize";
import UserModel from "./UserModel";
import AquariumModel from "./AquariumModel";
import TemperatureModel from "./TemperatureModel";

export default class Db {
    private static sequelize = null;

    static async init(): Promise<void> {
        this.sequelize = new Sequelize(
            process.env.MARIADB_DATABASE,
            process.env.MARIADB_USER,
            process.env.MARIADB_PASSWORD,
            {
                dialect: 'mysql',
                host: process.env.MARIADB_HOST,
                port: Number(process.env.MARIADB_PORT),
            }
        );
        await Db.sequelize.authenticate();
        console.log('Connected to database');

        let sequelize = Db.sequelize;

        UserModel.init({
            id: {
                type: DataTypes.UUID,
                primaryKey: true,
                defaultValue: DataTypes.UUIDV4
            },
            username: {
                type: DataTypes.STRING,
                allowNull: false,
                unique: true
            },
            email: {
                type: DataTypes.STRING,
                allowNull: false,
                unique: true
            },
            password: {
                type: DataTypes.STRING,
                allowNull: false,
            }
        }, {sequelize, tableName: 'users'});

        AquariumModel.init({
            id: {
                type: DataTypes.UUID,
                primaryKey: true,
                defaultValue: DataTypes.UUIDV4
            },
            name: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            description: {
                type: DataTypes.STRING,
                defaultValue: '',
            },
            startedDate: {
                type: DataTypes.DATE,
                defaultValue: DataTypes.NOW,
                allowNull: false,
            },
            volume: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },
            salt: {
                type: DataTypes.BOOLEAN,
                allowNull: false,
                defaultValue: false
            },
            imageUrl: {
                type: DataTypes.STRING,
                defaultValue: '',
            },
            image: {
                type: DataTypes.BLOB('long'),
                allowNull: true,
            },
            userId: {
                type: DataTypes.UUID,
                allowNull: false,
                references: {
                    model: UserModel,
                    key: 'id'
                }
            }
        }, {sequelize, tableName: 'aquariums'});

        TemperatureModel.init({
            id: {
                type: DataTypes.UUID,
                primaryKey: true,
                defaultValue: DataTypes.UUIDV4
            },
            temperature: {
                type: DataTypes.DOUBLE,
                allowNull: false,
            },
            aquariumId: {
                type: DataTypes.UUID,
                allowNull: false,
                references: {
                    model: AquariumModel,
                    key: 'id'
                }
            }
        }, {sequelize, tableName: 'temperatures'});

        await sequelize.sync();

        console.log('Database initialized');
    }
}
