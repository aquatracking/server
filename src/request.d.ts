import UserDto from "./dto/UserDto";

declare global {
  namespace Express {
    export interface Request {
      user?: UserDto;
    }
  }
}
