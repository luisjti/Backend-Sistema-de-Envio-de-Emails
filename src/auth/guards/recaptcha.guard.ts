import {
    Injectable,
    CanActivate,
    ExecutionContext,
    ForbiddenException,
  } from "@nestjs/common";

import { HttpService } from "@nestjs/axios";
import { lastValueFrom, map } from "rxjs";
  
  @Injectable()
  export class RecaptchaGuard implements CanActivate {
    constructor(private readonly httpService: HttpService) {}
  
    async canActivate(context: ExecutionContext): Promise<boolean> {
      const { body } = context.switchToHttp().getRequest();
      
      const form = new URLSearchParams();
        form.append('secret', process.env.CLOUDFARE_RECAPTCHA_SECRET_KEY) ;
        form.append('response', body.RECAPTCHA);
       
        const data = await lastValueFrom(
        this.httpService.post('https://challenges.cloudflare.com/turnstile/v0/siteverify', form).pipe(
          map((resp) => {
            return resp.data;
          }),
        ),
      ); 
      
      if (!data.success) {
        throw new ForbiddenException();
      }
  
      return true;
    }
  }