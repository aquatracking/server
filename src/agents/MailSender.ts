import * as nodemailer from 'nodemailer';
import UserModel from "../model/UserModel";
import { env } from '../env';

export default class MailSender {
    static send(to: string, subject: string, text: string) {
        let transporter = nodemailer.createTransport({
            host: env.MAIL_HOST,
            port: env.MAIL_PORT,
            secure: env.MAIL_SSL,
            auth: {
                user: env.MAIL_USER,
                pass: env.MAIL_PASS
            }
        })

        transporter.sendMail({
            from: env.MAIL_USER,
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
