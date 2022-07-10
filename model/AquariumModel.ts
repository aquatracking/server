import {Model, Op} from "sequelize";
import UserDto from "../dto/UserDto";
import BadRequestError from "../errors/BadRequestError";
import MeasurementModel from "./MeasurementModel";
import MeasurementTypeModel from "./MeasurementTypeModel";
import MeasurementSettingModel from "./MeasurementSettingModel";

export default class AquariumModel extends Model {
    id: string
    name: string
    description: string
    startedDate: Date
    volume: number
    salt: boolean
    imageUrl: string
    image: Blob

    static getAllOfUser(user: UserDto) {
        return AquariumModel.findAll({
            where: {
                userId: user.id
            }
        })
    }

    static createOne({user, name, description = "", startedDate, volume, salt = false, imageUrl = "", image}: { user: UserDto, name: string, description?: string, startedDate: Date, volume: number, salt?: boolean, imageUrl?: string, image: Blob}) {
        return AquariumModel.create({
            userId: user.id,
            name: name,
            description: description,
            startedDate: startedDate,
            volume: volume,
            salt: salt,
            imageUrl: imageUrl,
            image: image
        }).catch((e) => {
            if (e.parent?.code?.includes("WRONG_VALUE")) {
                throw new BadRequestError();
            } else {
                throw e;
            }
        })
    }

    static updateOne(id: string, {name, description, image}: { name: string, description?: string, image: Blob}) {
        return AquariumModel.update({
            name: name,
            description: description,
            image: image
        }, {
            where: {
                id: id
            }
        })
    }

    async addMeasurement(type: MeasurementTypeModel, value: number, measuredAt: Date) {
        await MeasurementModel.create({
            aquariumId: this.id,
            type: type.code,
            value: value,
            measuredAt: measuredAt
        })
    }

    async getMeasurements(type: MeasurementTypeModel, fromDate: Date = new Date((new Date()).getTime() - 24 * 60 * 60 * 1000), toDate: Date = new Date()) : Promise<MeasurementModel[]> {
        return MeasurementModel.findAll({
            where: {
                aquariumId: this.id,
                type: type.code,
                measuredAt: {
                    [Op.between]: [fromDate, toDate]
                },
            },
            order: [
                ['measuredAt', 'ASC']
            ]
        })
    }

    async getLastMeasurement(type: MeasurementTypeModel) : Promise<MeasurementModel> {
        return MeasurementModel.findOne({
            where: {
                aquariumId: this.id,
                type: type.code,
            },
            order: [
                ['measuredAt', 'DESC']
            ]
        })
    }

    async getMeasurementsSettings() : Promise<MeasurementSettingModel[]> {
        let settings = await MeasurementSettingModel.findAll({
            where: {
                aquariumId: this.id
            }
        })

        if(settings.map(setting => setting.type).sort().join('') != MeasurementTypeModel.getAll().map(type => type.code).sort().join('')) {
            let order = 0
            if(settings.length > 0) {
                order = Math.max(...settings.map(setting => setting.order)) + 1
            }
            for(let type of MeasurementTypeModel.getAll()) {
                let setting = await MeasurementSettingModel.findOne({
                    where: {
                        aquariumId: this.id,
                        type: type.code
                    }
                })
                if(!setting) {
                    await MeasurementSettingModel.create({
                        aquariumId: this.id,
                        type: type.code,
                        order: order
                    })
                    order++
                }
            }
            settings = await MeasurementSettingModel.findAll({
                where: {
                    aquariumId: this.id
                }
            })
        }

        let codeList = MeasurementTypeModel.getAll().map(type => type.code)

        return settings.filter(setting => codeList.includes(setting.type))
    }

    async setMeasurementsSettings(settings: MeasurementSettingModel[]) {
        for(let setting of settings) {
            await MeasurementSettingModel.update({
                visible: setting.visible,
                order: setting.order,
                defaultMode: setting.defaultMode,
                minValue: setting.minValue,
                maxValue: setting.maxValue,
                mailAlert: setting.mailAlert,
                notificationAlert: setting.notificationAlert
            }, {
                where: {
                    id: setting.id
                }
            })
        }
    }
}
