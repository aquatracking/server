import WeatherModel from "../model/WeatherModel";

export default class WeatherDto {
    id: string;
    temperature: number;
    city: string;
    measuredAt: Date;

    constructor(weather: WeatherModel) {
        this.id = weather.id;
        this.temperature = weather.temperature;
        this.city = weather.city;
        this.measuredAt = weather.measuredAt;
    }
}
