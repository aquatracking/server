import { UserDto } from "./dto/user/userDto";

declare global {
    namespace Express {
        export interface Request {
            user?: UserDto;
        }
    }
}
