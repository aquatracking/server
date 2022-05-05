import {DataTypes, Sequelize} from "sequelize";
import UserModel from "./UserModel";

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
        await sequelize.sync();

        console.log('Database initialized');
    }
}