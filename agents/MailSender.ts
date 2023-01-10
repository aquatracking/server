import * as nodemailer from 'nodemailer';
import UserModel from "../model/UserModel";

export default class MailSender {
    static send(to: string, subject: string, text: string) {
        let transporter = nodemailer.createTransport({
            host: process.env.MAIL_HOST,
            port: Number(process.env.MAIL_PORT),
            secure: true,
            auth: {
                user: process.env.MAIL_USER,
                pass: process.env.MAIL_PASS
            }
        })

        transporter.sendMail({
            from: process.env.MAIL_USER,
            to: to,
            subject: subject,
            text: text
        }).catch(console.error).then(() => console.log("Mail sent to " + to));

        return transporter.close();
    }

    static sendToUser(user: UserModel, subject: string, text: string) {
        return this.send(user.email, subject, text);
    }
}