import ApplicationModel from "../model/ApplicationModel";

export default class ApplicationDto {
    id: string
    name: string
    description: string
    token: string

    constructor(applicationModel: ApplicationModel) {
        this.id = applicationModel.id
        this.name = applicationModel.name
        this.description = applicationModel.description
        this.token = applicationModel.token
    }
}