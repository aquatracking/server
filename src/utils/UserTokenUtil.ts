import UserDto from "../dto/UserDto";
import * as jwt from "../jwt";
import { env } from "../env";

export default class UserTokenUtil {
    static generateAccessToken(user: UserDto): Promise<string> {
        return jwt.sign(user.toJSON(), env.ACCESS_TOKEN_SECRET, {
            expirationTime: "1800s",
        });
    }

    static generateRefreshToken(user: UserDto): Promise<string> {
        return jwt.sign(user.toJSON(), env.REFRESH_TOKEN_SECRET, {
            expirationTime: "1y",
        });
    }
}
