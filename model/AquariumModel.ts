import {Model} from "sequelize";
import UserDto from "../dto/UserDto";
import BadRequestError from "../errors/BadRequestError";

export default class AquariumModel extends Model {
    id: string
    name: string
    description: string
    startedDate: Date
    volume: number
    salt: boolean
    imageUrl: string
    image: Blob
    size: number

    static getAllOfUser(user: UserDto) {
        return AquariumModel.findAll({
            where: {
                userId: user.id
            }
        })
    }

    static createOne({
                         user,
                         name,
                         description = "",
                         startedDate,
                         volume,
                         salt = false,
                         imageUrl = "",
                         image
                     }: { user: UserDto, name: string, description?: string, startedDate: Date, volume: number, salt?: boolean, imageUrl?: string, image: Blob}) {
        return AquariumModel.create({
            userId: user.id,
            name: name,
            description: description,
            creationDate: startedDate,
            volume: volume,
            salt: salt,
            imageUrl: imageUrl,
            image: image
        }).catch((e) => {
            if (e.parent?.code?.includes("WRONG_VALUE")) {
                throw new BadRequestError();
            } else {
                throw e;
            }
        })
    }
}
