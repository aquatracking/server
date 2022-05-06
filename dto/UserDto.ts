import UserModel from "../model/UserModel";

export default class UserDto {
    private readonly id: string;
    private readonly username: string;
    private readonly email: string;

    constructor(user: UserModel) {
        this.id = user.id;
        this.username = user.username;
        this.email = user.email;
    }

    toJSON(): object {
        return {
            id: this.id,
            username: this.username,
            email: this.email
        }
    }
}
