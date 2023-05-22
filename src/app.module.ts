import { Module } from '@nestjs/common';
import { AppService } from './app.service';
import { KnexModule } from 'nestjs-knex';
import { EmailsModule } from './emails/emails.module';
import { MailModule } from './mail/mail.module';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot(),
    KnexModule.forRootAsync({
        useFactory: () => ({
            config: {
                client: "oracledb",
                connection: {
                  user: process.env.ORACLE_USER,
                  password: process.env.ORACLE_PASSWORD,
                  connectString: process.env.ORACLE_CONECTION_STRING_DEV,
                  requestTimeout: 100,
                },
                pool : {
                  min : 0,
                  max : 10
                },
                fetchAsString: ["number", "clob"],
                useNullAsDefault: true,
    },
  }),
}),
    EmailsModule,
    MailModule,
    AuthModule,
  ],
  providers: [AppService],
})
export class AppModule {}
