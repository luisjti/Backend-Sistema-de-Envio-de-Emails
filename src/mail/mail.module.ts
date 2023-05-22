import { Module } from '@nestjs/common';
import { MailService } from './mail.service';
import { MailerModule } from '@nestjs-modules/mailer';
import { ConfigModule , ConfigService} from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot(),
    MailerModule.forRoot({
      // transport: 'smtps://user@example.com:topsecret@smtp.example.com',
      // or
      transport: {
        host: process.env.MAIL_HOST,
        service: 'gmail',
        sendmail: true,
        newline: 'unix',
        path: '/usr/sbin/sendmail',
        port: 587,
        secure: false,
        auth: {
          user: process.env.MAIL_USER,
          pass: process.env.MAIL_PASSWORD,
        },
      },
      defaults: {
        from: '"No Reply" <example@gmail.com>',
      },
    }),
  ],
  providers: [MailService],
  exports: [MailService], 
})
export class MailModule {}
