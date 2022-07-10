import {Model} from "sequelize";
import BadRequestError from "../errors/BadRequestError";

export default class ApplicationModel extends Model {
    id: string
    name: string
    description: string
    token: string

    static addApplication({name, description = "", token, userId}) {
        return ApplicationModel.create({
            name: name,
            description: description,
            token: token,
            userId: userId
        }).catch((e) => {
            if (e.parent?.code?.includes("WRONG_VALUE")) {
                throw new BadRequestError();
            } else {
                throw e;
            }
        })
    }
}