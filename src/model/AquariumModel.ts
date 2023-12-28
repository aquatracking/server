import {
    CreationOptional,
    ForeignKey,
    InferAttributes,
    InferCreationAttributes,
    Model,
    NonAttribute,
    Op,
} from "sequelize";
import { UserDto } from "../dto/user/userDto";
import BadRequestError from "../errors/BadRequestError";
import MeasurementModel from "./MeasurementModel";
import MeasurementTypeModel from "./MeasurementTypeModel";
import MeasurementSettingModel from "./MeasurementSettingModel";
import MailSender from "../agents/MailSender";
import UserModel from "./UserModel";
import NotFoundError from "../errors/NotFoundError";

export default class AquariumModel extends Model<
    InferAttributes<AquariumModel>,
    InferCreationAttributes<AquariumModel>
> {
    declare id: CreationOptional<string>;
    declare name: string;
    declare description: CreationOptional<string>;
    declare startedDate: CreationOptional<Date>;
    declare volume: number;
    declare salt: CreationOptional<boolean>;
    declare image?: CreationOptional<Blob>;
    declare archivedDate?: CreationOptional<Date | null>;

    declare userId: ForeignKey<UserModel["id"]>;
    declare user?: NonAttribute<UserModel>;

    static notificationCooldown = 1000 * 60 * 60 * 24; // 24h
    static notificationCooldownHistory: Array<{
        aquariumId: string;
        typeCode: string;
        expire: Date;
    }> = [];

    async addMeasurement(
        type: MeasurementTypeModel,
        value: number,
        measuredAt: Date,
    ) {
        await MeasurementModel.create({
            aquariumId: this.id,
            type: type.code,
            value: value,
            measuredAt: measuredAt,
        });

        // get settings of measurement
        let setting = await MeasurementSettingModel.findOne({
            where: {
                aquariumId: this.id,
                type: type.code,
            },
        });

        // remove expired cooldowns
        AquariumModel.notificationCooldownHistory =
            AquariumModel.notificationCooldownHistory.filter(
                (cooldown) => cooldown.expire > new Date(),
            );

        // if mail alert is enabled and is needed to send mail
        if (
            setting &&
            setting.mailAlert &&
            ((setting.minValue != null && setting.minValue > value) ||
                (setting.maxValue != null && setting.maxValue < value))
        ) {
            if (
                AquariumModel.notificationCooldownHistory.find(
                    (item) =>
                        item.aquariumId == this.id &&
                        item.typeCode == type.code &&
                        item.expire > new Date(),
                ) == undefined
            ) {
                // get user of this aquarium
                let user = await UserModel.findOne({
                    include: [
                        {
                            model: AquariumModel,
                            where: {
                                id: this.id,
                            },
                        },
                    ],
                });

                let alertMessage = `La valeur ${
                    RegExp("^[aeiouy]").test(type.name) ? "d'" : "de "
                }${type.name} de votre aquarium ${this.name} est ${
                    setting.minValue != null && setting.minValue > value
                        ? "inférieure"
                        : "supérieure"
                } à la valeur ${
                    setting.minValue != null && setting.minValue > value
                        ? "minimale"
                        : "maximale"
                } souhaité.`;
                alertMessage += `\nValeur actuelle : ${value}${
                    type.unit
                }\nValeur ${
                    setting.minValue != null && setting.minValue > value
                        ? "minimale"
                        : "maximale"
                } : ${
                    setting.minValue != null && setting.minValue > value
                        ? setting.minValue
                        : setting.maxValue
                }${type.unit}`;
                alertMessage += `\nVous pouvez modifier les paramètres d'alerte dans l'application.`;

                // send mail
                if (user) {
                    MailSender.sendToUser(
                        user,
                        "Alerte sur votre aquarium " + this.name,
                        alertMessage,
                    );
                }

                // add to cooldown history
                AquariumModel.notificationCooldownHistory.push({
                    aquariumId: this.id,
                    typeCode: type.code,
                    expire: new Date(
                        new Date().getTime() +
                            AquariumModel.notificationCooldown,
                    ),
                });
            }
        } else {
            // remove from cooldown history
            AquariumModel.notificationCooldownHistory =
                AquariumModel.notificationCooldownHistory.filter(
                    (item) =>
                        item.aquariumId != this.id ||
                        item.typeCode != type.code,
                );
        }
    }

    async getMeasurements(
        type: MeasurementTypeModel,
        fromDate: Date = new Date(new Date().getTime() - 24 * 60 * 60 * 1000),
        toDate: Date = new Date(),
    ): Promise<MeasurementModel[]> {
        return MeasurementModel.findAll({
            where: {
                aquariumId: this.id,
                type: type.code,
                measuredAt: {
                    [Op.between]: [fromDate, toDate],
                },
            },
            order: [["measuredAt", "ASC"]],
        });
    }

    async getLastMeasurement(
        type: MeasurementTypeModel,
    ): Promise<MeasurementModel | null> {
        return MeasurementModel.findOne({
            where: {
                aquariumId: this.id,
                type: type.code,
            },
            order: [["measuredAt", "DESC"]],
        });
    }

    async getMeasurementsSettings(): Promise<MeasurementSettingModel[]> {
        let settings = await MeasurementSettingModel.findAll({
            where: {
                aquariumId: this.id,
            },
        });

        if (
            settings
                .map((setting) => setting.type)
                .sort()
                .join("") !=
            MeasurementTypeModel.getAll()
                .map((type) => type.code)
                .sort()
                .join("")
        ) {
            let order = 0;
            if (settings.length > 0) {
                order =
                    Math.max(...settings.map((setting) => setting.order)) + 1;
            }
            for (let type of MeasurementTypeModel.getAll()) {
                let setting = await MeasurementSettingModel.findOne({
                    where: {
                        aquariumId: this.id,
                        type: type.code,
                    },
                });
                if (!setting) {
                    await MeasurementSettingModel.create({
                        aquariumId: this.id,
                        type: type.code,
                        order: order,
                    });
                    order++;
                }
            }
            settings = await MeasurementSettingModel.findAll({
                where: {
                    aquariumId: this.id,
                },
            });
        }

        let codeList = MeasurementTypeModel.getAll().map((type) => type.code);

        return settings.filter((setting) => codeList.includes(setting.type));
    }

    async setMeasurementsSettings(settings: MeasurementSettingModel[]) {
        for (let setting of settings) {
            await MeasurementSettingModel.update(
                {
                    visible: setting.visible,
                    order: setting.order,
                    defaultMode: setting.defaultMode,
                    minValue: setting.minValue,
                    maxValue: setting.maxValue,
                    mailAlert: setting.mailAlert,
                    notificationAlert: setting.notificationAlert,
                },
                {
                    where: {
                        id: setting.id,
                    },
                },
            );
        }
    }
}
