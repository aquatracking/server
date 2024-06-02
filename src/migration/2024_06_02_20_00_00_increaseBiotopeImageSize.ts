import bcrypt from "bcryptjs";
import { DataTypes } from "sequelize";
import { v4 as uuidV4 } from "uuid";
import { Migration } from "../model/db";

export const up: Migration = async ({ context: queryInterface }) => {
    await queryInterface.changeColumn("biotope", "image", {
        type: DataTypes.BLOB("medium"),
        allowNull: true,
        defaultValue: null,
    });
};
