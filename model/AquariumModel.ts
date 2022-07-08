import {Model, Op} from "sequelize";
import UserDto from "../dto/UserDto";
import BadRequestError from "../errors/BadRequestError";
import MeasurementModel from "./MeasurementModel";
import MeasurementTypeModel from "./MeasurementTypeModel";

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
}
