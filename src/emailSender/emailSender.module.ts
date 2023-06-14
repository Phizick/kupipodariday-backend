import { Module } from '@nestjs/common';
import { MailerModule } from '@nestjs-modules/mailer';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { EmailSenderService } from './emailSender.service';

@Module({
  imports: [
    MailerModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        transport: {
          host: configService.get('EMAIL_SENDER_HOST'),
          port: configService.get('EMAIL_SENDER_PORT'),
          secure: true,
          auth: {
            user: configService.get('EMAIL_SENDER_USER'),
            pass: configService.get('EMAIL_SENDER_PASS'),
          },
          tls: {
            rejectUnauthorized: false,
          },
        },
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [EmailSenderService],
  exports: [EmailSenderService],
})
export class EmailSenderModule {}
