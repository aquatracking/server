import TemperatureModel from "../model/TemperatureModel";

export default class TemperatureDto {
    id: string;
    temperature: number;
    measuredAt: Date;

    constructor(temperatureModel: TemperatureModel) {
        this.id = temperatureModel.id;
        this.temperature = temperatureModel.temperature;
        this.measuredAt = temperatureModel.measuredAt;
    }
}