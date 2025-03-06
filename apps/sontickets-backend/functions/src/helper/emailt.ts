/* eslint-disable */

import SMTPTransport = require('nodemailer/lib/smtp-transport');
import { Transporter } from 'nodemailer';
import * as nodemailer from 'nodemailer';

type sendEmailProps = {
  email: string;
  subject: string;
  template: string;
};

export class EmailHelper {
  emailTransporter?: Transporter<SMTPTransport.SentMessageInfo>;
  constructor() {
    this._initEmail();
  }

  private _initEmail = () => {
    this.emailTransporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: `${process.env.SMTP_USER_EMAIL}`,
        pass: `${process.env.SMTP_USER_PASSWORD}`,
      },
    });
  };

  sendEmail = async ({ email, subject, template }: sendEmailProps): Promise<void> => {
    const mailOptionsClient = {
      from: `${process.env.EMAIL_FROM}`,
      to: email,
      subject,
      html: template,
    };
    if (!this.emailTransporter) throw new Error('Email transporter not initialized');
    await new Promise((resolve, reject) => {
      this.emailTransporter?.sendMail(mailOptionsClient, (err, info) => {
        if (err) {
          reject(err);
          console.error(err);
        }
        if (info) {
          resolve(info);
          console.log(info);
        }
      });
    });
  };
}
