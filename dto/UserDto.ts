import UserModel from "../model/UserModel";

export default class UserDto {
    private id: string;
    private username: string;
    private email: string;

    constructor(user: UserModel) {
        this.id = user.id;
        this.username = user.username;
        this.email = user.email;
    }
}