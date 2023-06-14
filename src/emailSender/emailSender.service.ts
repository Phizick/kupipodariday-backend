import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class EmailSenderService {
  constructor(
    private readonly mailerService: MailerService,
    private readonly configService: ConfigService,
  ) {}

  async sendEmail(email: string[], html: string) {
    try {
      return await this.mailerService.sendMail({
        to: email,
        from: this.configService.get('EMAIL_SENDER_MAIL'),
        html,
      });
    } catch (error) {
      console.error(`ошибка при отправке письма на адрес ${email}: ${error}`);
      throw error;
    }
  }
}
