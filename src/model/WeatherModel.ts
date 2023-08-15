import { CreationOptional, InferAttributes, InferCreationAttributes, Model } from "sequelize";

export default class WeatherModel extends Model<InferAttributes<WeatherModel>, InferCreationAttributes<WeatherModel>> {
    declare id: CreationOptional<string>;
    declare temperature: number;
    declare city: string;
    declare measuredAt: Date;
}
