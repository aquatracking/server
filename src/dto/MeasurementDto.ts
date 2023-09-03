import MeasurementModel from "../model/MeasurementModel";

export default class MeasurementDto {
    id: string;
    type: String;
    value: number;
    measuredAt: Date;

    constructor(measurementModel: MeasurementModel) {
        this.id = measurementModel.id;
        this.type = measurementModel.type;
        this.value = measurementModel.value;
        this.measuredAt = measurementModel.measuredAt;
    }
}
