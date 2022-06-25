import {Model, Op} from "sequelize";

export default class MeasurementModel extends Model {
    id: string;
    type: String;
    value: number;
    measuredAt: Date;

    public static getAll(aquariumId: String, type: String, fromDate: Date = new Date((new Date()).getTime() - 24 * 60 * 60 * 1000), toDate: Date = new Date()): Promise<MeasurementModel[]> {
        return MeasurementModel.findAll({
            where: {
                aquariumId: aquariumId,
                type: type,
                measuredAt: {
                    [Op.between]: [fromDate, toDate]
                }
            },
            order: [
                ['measuredAt', 'ASC']
            ]
        })
    }
}