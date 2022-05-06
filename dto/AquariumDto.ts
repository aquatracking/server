import AquariumModel from "../model/AquariumModel";

export default class AquariumDto {
    id: string
    name: string
    description: string
    salt: boolean
    imageUrl: string
    size: number

    constructor(aquariumModel: AquariumModel) {
        this.id = aquariumModel.id
        this.name = aquariumModel.name
        this.description = aquariumModel.description
        this.salt = aquariumModel.salt
        this.imageUrl = aquariumModel.imageUrl
        this.size = aquariumModel.size
    }
}
