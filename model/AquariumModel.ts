import {Model} from "sequelize";
import UserDto from "../dto/UserDto";
import BadRequestError from "../errors/BadRequestError";

export default class AquariumModel extends Model {
    id: string
    name: string
    description: string
    salt: boolean
    imageUrl: string
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
                         salt = false,
                         imageUrl = "",
                         size
                     }: { user: UserDto, name: string, description?: string, salt?: boolean, imageUrl?: string, size: number })
    {
        return AquariumModel.create({
            userId: user.id,
            name: name,
            description: description,
            salt: salt,
            imageUrl: imageUrl,
            size: size
        }).catch((e) => {
            if (e.parent.code.includes("WRONG_VALUE")) {
                throw new BadRequestError();
            } else {
                throw e;
            }
        })
    }
}
