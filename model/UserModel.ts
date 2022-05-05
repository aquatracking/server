import {Model} from "sequelize";
import bcrypt from "bcryptjs";

import UsernameAlreadyExistError from "../errors/UsernameAlreadyExistError";
import EmailAlreadyExistError from "../errors/EmailAlreadyExistError";
import UserDto from "../dto/UserDto";

export default class UserModel extends Model {
    id: string;
    username: string;
    email: string;
    password: string;

    static async register(username: string, email: string, password: string): Promise<UserDto> {
        try {
            return new UserDto(await UserModel.create({
                username: username,
                email: email,
                password: bcrypt.hashSync(password, 10)
            }));
        } catch (e) {
            if(e.name === 'SequelizeUniqueConstraintError') {
                if(e.errors[0].path === 'username') {
                    throw new UsernameAlreadyExistError();
                } else if(e.errors[0].path === 'email') {
                    throw new EmailAlreadyExistError();
                }
            }
            throw new Error(e);
        }
    }
}