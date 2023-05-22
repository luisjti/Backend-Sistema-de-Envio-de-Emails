import { Controller,Get, Post , Res, Req, ValidationPipe, Body, UseGuards} from '@nestjs/common';
import { AuthService } from './auth.service';
import { Express, Request, Response } from 'express'
import { TokenPayload } from 'src/emails/dto/payload_JWT.dto';
import { Recaptcha } from '@nestlab/google-recaptcha';
import { RecaptchaGuard } from './guards/recaptcha.guard';

@Controller('auth')
export class AuthController {

constructor(private readonly AuthService: AuthService) {} 

@Post()
@UseGuards(RecaptchaGuard)
    async getAuth (@Body(new ValidationPipe({transform : true})) TokenPayload: TokenPayload) {
        return this.AuthService.getToken(TokenPayload)
       
    }
}


