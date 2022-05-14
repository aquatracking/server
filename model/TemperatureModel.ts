import {Model} from "sequelize";

export default class TemperatureModel extends Model {
    id: string;
    temperature: number;
}