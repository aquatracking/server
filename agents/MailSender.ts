import * as nodemailer from 'nodemailer';

export default class MailSender {
    private static transporter: nodemailer.Transporter = nodemailer.createTransport({
        host: process.env.MAIL_HOST,
        port: Number(process.env.MAIL_PORT),
        secure: true,
        auth: {
            user: process.env.MAIL_USER,
            pass: process.env.MAIL_PASS
        }
    });

    static send(to: string, subject: string, text: string) {
        return this.transporter.sendMail({
            from: process.env.MAIL_USER,
            to: to,
            subject: subject,
            text: text
        });
    }
}