import { Model } from "sequelize";
import bcrypt from "bcryptjs";

import UsernameAlreadyExistError from "../errors/UsernameAlreadyExistError";
import EmailAlreadyExistError from "../errors/EmailAlreadyExistError";
import UserDto from "../dto/UserDto";
import WrongPasswordError from "../errors/WrongPasswordError";
import NotFoundError from "../errors/NotFoundError";

export default class UserModel extends Model {
    id: string;
    username: string;
    email: string;
    password: string;

    static async register(
        username: string,
        email: string,
        password: string,
    ): Promise<UserDto> {
        try {
            return new UserDto(
                await UserModel.create({
                    username: username,
                    email: email,
                    password: bcrypt.hashSync(password, 10),
                }),
            );
        } catch (e) {
            if (e.name === "SequelizeUniqueConstraintError") {
                if (e.errors[0].path === "username") {
                    throw new UsernameAlreadyExistError();
                } else if (e.errors[0].path === "email") {
                    throw new EmailAlreadyExistError();
                }
            }
            throw new Error(e);
        }
    }

    static async login(email: string, password: string): Promise<UserDto> {
        let user;

        try {
            user = await UserModel.findOne({
                where: {
                    email: email,
                },
            });
        } catch (e) {
            throw new NotFoundError();
        }

        if (user) {
            if (bcrypt.compareSync(password, user.password)) {
                return new UserDto(user);
            } else {
                throw new WrongPasswordError();
            }
        } else {
            throw new NotFoundError();
        }
    }
}
