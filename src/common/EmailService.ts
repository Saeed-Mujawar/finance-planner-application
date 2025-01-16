import * as nodemailer from 'nodemailer';
import { Injectable, BadRequestException } from '@nestjs/common';

@Injectable()
export class EmailService {
    private transporter: nodemailer.Transporter;

    constructor() {
        this.transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });
    }

    async sendMail(mailOptions: nodemailer.SendMailOptions): Promise<void> {
        try {
            await this.transporter.sendMail(mailOptions);
            console.log(`Email sent to: ${mailOptions.to}`);
        } catch (error) {
            console.error(`Failed to send email to ${mailOptions.to}:`, error);
            throw new BadRequestException('Failed to send email');
        }
    }
}
