import {
    CreationOptional,
    InferAttributes,
    InferCreationAttributes,
    Model,
    UniqueConstraintError,
} from "sequelize";
import bcrypt from "bcryptjs";

import UsernameAlreadyExistError from "../errors/UsernameAlreadyExistError";
import EmailAlreadyExistError from "../errors/EmailAlreadyExistError";
import { UserDto, extractUserDto } from "../dto/UserDto";
import WrongPasswordError from "../errors/WrongPasswordError";
import NotFoundError from "../errors/NotFoundError";
import { tryPromise } from "../utils/tryPromise";

export default class UserModel extends Model<
    InferAttributes<UserModel>,
    InferCreationAttributes<UserModel>
> {
    declare id: CreationOptional<string>;
    declare username: string;
    declare email: string;
    declare password: string;

    static async register(
        username: string,
        email: string,
        password: string,
    ): Promise<UserDto> {
        const createUserResult = await tryPromise(
            UserModel.create({
                username: username,
                email: email,
                password: bcrypt.hashSync(password, 10),
            }),
        );
        if (!createUserResult.result) {
            const error = createUserResult.error;
            if (error instanceof UniqueConstraintError) {
                if (error.errors[0].path === "username") {
                    throw new UsernameAlreadyExistError();
                } else if (error.errors[0].path === "email") {
                    throw new EmailAlreadyExistError();
                }
            }
            throw error;
        }
        const user = createUserResult.result;
        return extractUserDto(user);
    }

    static async login(email: string, password: string): Promise<UserDto> {
        const findUserResult = await tryPromise(
            UserModel.findOne({
                where: {
                    email: email,
                },
            }),
        );
        if (!findUserResult.success) {
            throw new NotFoundError();
        }

        const user = findUserResult.result;
        if (!user) {
            throw new NotFoundError();
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            throw new WrongPasswordError();
        }

        return extractUserDto(user);
    }
}
