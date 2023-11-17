import UserModel from "../model/UserModel";

export default class UserDto {
    readonly id: string;
    readonly username: string;
    readonly email: string;

    constructor(user: UserModel) {
        this.id = user.id;
        this.username = user.username;
        this.email = user.email;
    }

    toJSON() {
        return {
            id: this.id,
            username: this.username,
            email: this.email,
        };
    }
}
