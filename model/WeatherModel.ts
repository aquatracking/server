import {Model} from "sequelize";

export default class WeatherModel extends Model {
    id: string;
    temperature: number;
    city: string;
    measuredAt: Date;
}