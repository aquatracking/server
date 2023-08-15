import {
    CreationOptional,
    ForeignKey,
    InferAttributes,
    InferCreationAttributes,
    Model,
    NonAttribute,
} from "sequelize";
import BadRequestError from "../errors/BadRequestError";
import UserModel from "./UserModel";
import ApplicationDto from "../dto/ApplicationDto";
import { UserDto } from "../dto/UserDto";

export default class ApplicationModel extends Model<InferAttributes<ApplicationModel>, InferCreationAttributes<ApplicationModel>>  {
    declare id: CreationOptional<string>
    declare name: string
    declare description: string
    declare token: string
    
    declare userId: ForeignKey<UserModel["id"]>;
    declare user?: NonAttribute<UserModel>;

    static addApplication({name, description = "", token}: Pick<ApplicationDto, "name" | "description" | "token">, user: UserDto) {
        return ApplicationModel.create({
            name: name,
            description: description,
            token: token,
            userId: user.id
        }).catch((e) => {
            if (e.parent?.code?.includes("WRONG_VALUE")) {
                throw new BadRequestError();
            } else {
                throw e;
            }
        })
    }
}
