import { Model } from "sequelize";

export default class MeasurementModel extends Model {
    id: string;
    type: String;
    value: number;
    measuredAt: Date;
}
