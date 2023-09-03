import MeasurementTypeModel from "../model/MeasurementTypeModel";
import MeasurementSettingModel from "../model/MeasurementSettingModel";

export default class MeasurementSettingDto {
    id: string;
    aquariumId: string;
    type: MeasurementTypeModel;
    visible: boolean;
    order: number;
    defaultMode: number;
    minValue: number;
    maxValue: number;
    mailAlert: boolean;
    notificationAlert: boolean;

    constructor(aquariumMeasurementSettingModel: MeasurementSettingModel) {
        this.id = aquariumMeasurementSettingModel.id;
        this.aquariumId = aquariumMeasurementSettingModel.aquariumId;
        this.type = MeasurementTypeModel.getByCode(
            aquariumMeasurementSettingModel.type,
        );
        this.visible = aquariumMeasurementSettingModel.visible;
        this.order = aquariumMeasurementSettingModel.order;
        this.defaultMode = aquariumMeasurementSettingModel.defaultMode;
        this.minValue = aquariumMeasurementSettingModel.minValue;
        this.maxValue = aquariumMeasurementSettingModel.maxValue;
        this.mailAlert = aquariumMeasurementSettingModel.mailAlert;
        this.notificationAlert =
            aquariumMeasurementSettingModel.notificationAlert;
    }
}
