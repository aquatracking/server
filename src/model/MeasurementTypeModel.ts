export default class MeasurementTypeModel {
    declare code: string;
    declare name: string;
    declare unit: string;

    static types = [
        new MeasurementTypeModel("TEMPERATURE", "Température", "°C"),
        new MeasurementTypeModel("PH", "pH", ""),
        new MeasurementTypeModel("NH4", "Ammonium (NH4)", "mg/l"),
        new MeasurementTypeModel("NO2", "Nitrite (NO2)", "mg/L"),
        new MeasurementTypeModel("NO3", "Nitrate (NO3)", "mg/L"),
        new MeasurementTypeModel("KH", "Dureté carbonatée (KH)", "°KH"),
        new MeasurementTypeModel("GH", "Dureté totale (GH)", "°GH"),
    ]

    constructor(code: string, name: string, unit: string) {
        this.code = code;
        this.name = name;
        this.unit = unit;
    }

    static getByCode(code: string): MeasurementTypeModel | undefined {
        return MeasurementTypeModel.types.find(t => t.code === code);
    }

    static getAll(): MeasurementTypeModel[] {
        return MeasurementTypeModel.types;
    }
}
