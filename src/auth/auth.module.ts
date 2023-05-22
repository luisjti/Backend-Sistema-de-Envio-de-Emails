import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { EmailsModule } from '../emails/emails.module';
import { PassportModule} from '@nestjs/passport';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtStrategy } from './strategies/jwt.strategy';
import { AuthRepository } from './repositories/authRepository';
import { GoogleRecaptchaModule, GoogleRecaptchaNetwork, Recaptcha } from '@nestlab/google-recaptcha';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports :[
    EmailsModule,
    PassportModule,
    ConfigModule.forRoot(),
    JwtModule.register({
      privateKey : process.env.JWT_SECRET_EMAIL_INST,
      signOptions: { expiresIn: '9h'}
    }),   
    HttpModule
  ],
  providers: [AuthService, JwtStrategy, AuthRepository],
  controllers: [AuthController],
  exports: [AuthRepository]
})
export class AuthModule {}
