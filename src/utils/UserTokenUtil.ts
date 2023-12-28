import { UserDto } from "../dto/user/userDto";
import { env } from "../env";
import * as jwt from "../jwt";

export default class UserTokenUtil {
    static generateAccessToken(user: UserDto): Promise<string> {
        return jwt.sign(user, env.ACCESS_TOKEN_SECRET, {
            expirationTime: "1800s",
        });
    }

    static generateRefreshToken(user: UserDto): Promise<string> {
        return jwt.sign(user, env.REFRESH_TOKEN_SECRET, {
            expirationTime: "1y",
        });
    }

    static generateSessionToken(user: UserDto): Promise<string> {
        return jwt.sign(user, env.ACCESS_TOKEN_SECRET, {
            expirationTime: "1y",
        });
    }
}
