import AquariumModel from "../model/AquariumModel";

export default class AquariumDto {
    id: string
    name: string
    description: string
    startedDate: Date
    volume: number
    salt: boolean
    imageUrl: string
    image: Blob

    constructor(aquariumModel: AquariumModel) {
        this.id = aquariumModel.id
        this.name = aquariumModel.name
        this.description = aquariumModel.description
        this.startedDate = aquariumModel.startedDate
        this.volume = aquariumModel.volume
        this.salt = aquariumModel.salt
        this.imageUrl = aquariumModel.imageUrl
        this.image = aquariumModel.image
    }
}
