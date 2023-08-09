import UserDto from "../dto/UserDto";
import jwt from "jsonwebtoken";

export default class UserTokenUtil {
    static generateAccessToken(user: UserDto): string {
        return jwt.sign(user.toJSON(), process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1800s' });
    }

    static generateRefreshToken(user: UserDto): string {
        return jwt.sign(user.toJSON(), process.env.REFRESH_TOKEN_SECRET, { expiresIn: '1y' });
    }
}
