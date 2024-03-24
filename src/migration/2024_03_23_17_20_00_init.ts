import bcrypt from "bcryptjs";
import { DataTypes } from "sequelize";
import { v4 as uuidV4 } from "uuid";
import { Migration } from "../model/db";

export const up: Migration = async ({ context: queryInterface }) => {
    if (
        !process.env.AQUATRACKING_ROOT_USERNAME ||
        !process.env.AQUATRACKING_ROOT_EMAIL ||
        !process.env.AQUATRACKING_ROOT_PASSWORD
    ) {
        throw new Error("Missing ROOT user environment variables");
    }

    await queryInterface.createTable("user", {
        id: {
            type: DataTypes.UUID,
            primaryKey: true,
            defaultValue: DataTypes.UUIDV4,
        },
        username: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        email: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        password: {
            type: DataTypes.TEXT("long"),
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
        isAdmin: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false,
        },
        createdAt: {
            type: DataTypes.DATE,
            allowNull: false,
        },
        updatedAt: {
            type: DataTypes.DATE,
            allowNull: false,
        },
    });
    await queryInterface.addIndex("user", ["username"], {
        unique: true,
        name: "unique_user_username",
    });
    await queryInterface.addIndex("user", ["email"], {
        unique: true,
        name: "unique_user_email",
    });

    await queryInterface.createTable("email_validation_otp", {
        email: {
            type: DataTypes.STRING,
            primaryKey: true,
        },
        code: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        expiresAt: {
            type: DataTypes.DATE,
            allowNull: false,
        },
        createdAt: {
            type: DataTypes.DATE,
            allowNull: false,
        },
        updatedAt: {
            type: DataTypes.DATE,
            allowNull: false,
        },
    });
    await queryInterface.addConstraint("email_validation_otp", {
        fields: ["email"],
        type: "foreign key",
        name: "fk_email_validation_otp_email",
        references: {
            table: "user",
            field: "email",
        },
        onDelete: "cascade",
        onUpdate: "cascade",
    });

    await queryInterface.createTable("user_session", {
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
            allowNull: false,
            defaultValue: DataTypes.NOW,
        },
        lastConnectionDate: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW,
        },
        token: {
            type: DataTypes.TEXT("long"),
            allowNull: false,
        },
        userId: {
            type: DataTypes.UUID,
            allowNull: false,
        },
        createdAt: {
            type: DataTypes.DATE,
            allowNull: false,
        },
        updatedAt: {
            type: DataTypes.DATE,
            allowNull: false,
        },
    });
    await queryInterface.addIndex("user_session", ["token"], {
        unique: true,
        name: "unique_user_session_token",
    });
    await queryInterface.addConstraint("user_session", {
        fields: ["userId"],
        type: "foreign key",
        name: "fk_user_session_userId",
        references: {
            table: "user",
            field: "id",
        },
        onDelete: "cascade",
        onUpdate: "cascade",
    });

    await queryInterface.createTable("application", {
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
        token: {
            type: DataTypes.TEXT("long"),
            allowNull: false,
        },
        userId: {
            type: DataTypes.UUID,
            allowNull: false,
        },
        createdAt: {
            type: DataTypes.DATE,
            allowNull: false,
        },
        updatedAt: {
            type: DataTypes.DATE,
            allowNull: false,
        },
    });
    await queryInterface.addIndex("application", ["token"], {
        unique: true,
        name: "unique_application_token",
    });
    await queryInterface.addConstraint("application", {
        fields: ["userId"],
        type: "foreign key",
        name: "fk_application_userId",
        references: {
            table: "user",
            field: "id",
        },
        onDelete: "cascade",
        onUpdate: "cascade",
    });

    await queryInterface.createTable("biotope", {
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
        },
        createdAt: {
            type: DataTypes.DATE,
            allowNull: false,
        },
        updatedAt: {
            type: DataTypes.DATE,
            allowNull: false,
        },
    });
    await queryInterface.addConstraint("biotope", {
        fields: ["userId"],
        type: "foreign key",
        name: "fk_biotope_userId",
        references: {
            table: "user",
            field: "id",
        },
        onDelete: "cascade",
        onUpdate: "cascade",
    });

    await queryInterface.createTable("aquarium", {
        biotopeId: {
            type: DataTypes.UUID,
            primaryKey: true,
        },
        salt: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false,
        },
        createdAt: {
            type: DataTypes.DATE,
            allowNull: false,
        },
        updatedAt: {
            type: DataTypes.DATE,
            allowNull: false,
        },
    });
    await queryInterface.addConstraint("aquarium", {
        fields: ["biotopeId"],
        type: "foreign key",
        name: "fk_aquarium_biotopeId",
        references: {
            table: "biotope",
            field: "id",
        },
        onDelete: "cascade",
        onUpdate: "cascade",
    });

    await queryInterface.createTable("terrarium", {
        biotopeId: {
            type: DataTypes.UUID,
            primaryKey: true,
        },
        wet: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false,
        },
        createdAt: {
            type: DataTypes.DATE,
            allowNull: false,
        },
        updatedAt: {
            type: DataTypes.DATE,
            allowNull: false,
        },
    });
    await queryInterface.addConstraint("terrarium", {
        fields: ["biotopeId"],
        type: "foreign key",
        name: "fk_terrarium_biotopeId",
        references: {
            table: "biotope",
            field: "id",
        },
        onDelete: "cascade",
        onUpdate: "cascade",
    });

    await queryInterface.createTable("measurement_type", {
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
            allowNull: false,
            defaultValue: "",
        },
        createdAt: {
            type: DataTypes.DATE,
            allowNull: false,
        },
        updatedAt: {
            type: DataTypes.DATE,
            allowNull: false,
        },
    });

    await queryInterface.createTable("measurement_subscription", {
        biotopeId: {
            type: DataTypes.UUID,
            primaryKey: true,
        },
        measurementTypeCode: {
            type: DataTypes.STRING,
            primaryKey: true,
        },
        order: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        min: {
            type: DataTypes.DOUBLE,
        },
        max: {
            type: DataTypes.DOUBLE,
        },
        createdAt: {
            type: DataTypes.DATE,
            allowNull: false,
        },
        updatedAt: {
            type: DataTypes.DATE,
            allowNull: false,
        },
    });
    await queryInterface.addConstraint("measurement_subscription", {
        fields: ["biotopeId"],
        type: "foreign key",
        name: "fk_measurement_subscription_biotopeId",
        references: {
            table: "biotope",
            field: "id",
        },
        onDelete: "cascade",
        onUpdate: "cascade",
    });
    await queryInterface.addConstraint("measurement_subscription", {
        fields: ["measurementTypeCode"],
        type: "foreign key",
        name: "fk_measurement_subscription_measurementTypeCode",
        references: {
            table: "measurement_type",
            field: "code",
        },
        onDelete: "RESTRICT",
        onUpdate: "RESTRICT",
    });

    await queryInterface.createTable("measurement", {
        id: {
            type: DataTypes.UUID,
            primaryKey: true,
            defaultValue: DataTypes.UUIDV4,
        },
        biotopeId: {
            type: DataTypes.UUID,
            allowNull: false,
        },
        measurementTypeCode: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        value: {
            type: DataTypes.DOUBLE,
            allowNull: false,
        },
        measuredAt: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW,
        },
        createdAt: {
            type: DataTypes.DATE,
            allowNull: false,
        },
        updatedAt: {
            type: DataTypes.DATE,
            allowNull: false,
        },
    });
    await queryInterface.addConstraint("measurement", {
        fields: ["biotopeId"],
        type: "foreign key",
        name: "fk_measurement_biotopeId",
        references: {
            table: "biotope",
            field: "id",
        },
        onDelete: "cascade",
        onUpdate: "cascade",
    });
    await queryInterface.addConstraint("measurement", {
        fields: ["measurementTypeCode"],
        type: "foreign key",
        name: "fk_measurement_measurementTypeCode",
        references: {
            table: "measurement_type",
            field: "code",
        },
        onDelete: "RESTRICT",
        onUpdate: "RESTRICT",
    });

    // Create the default user
    await queryInterface.insert(null, "user", {
        id: uuidV4(),
        username: process.env.AQUATRACKING_ROOT_USERNAME,
        email: process.env.AQUATRACKING_ROOT_EMAIL,
        password: await bcrypt.hash(process.env.AQUATRACKING_ROOT_PASSWORD, 10),
        verified: true,
        isAdmin: true,
        createdAt: new Date(),
        updatedAt: new Date(),
    });
};
