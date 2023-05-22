import { Module } from '@nestjs/common';
import { EmailsService } from './emails.service';
import { EmailsController } from './emails.controller';
import { EmailsRepository } from './repositories/emailsRepository';
import { MailModule } from '../mail/mail.module';
import { NestjsFormDataModule } from 'nestjs-form-data';

@Module({
  imports: [MailModule, NestjsFormDataModule],
  providers: [EmailsService, EmailsRepository],
  controllers: [EmailsController],
  exports: [EmailsRepository]
})
export class EmailsModule {}
