import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AuthRepository } from './repositories/authRepository'
import { EmailsService } from '../emails/emails.service';
import { TokenPayload } from '../emails/dto/payload_JWT.dto'
import {Md5} from 'ts-md5'

@Injectable()
export class AuthService {
    constructor(
        private authRepository: AuthRepository,
        private readonly jwtService: JwtService,) {}

    async getToken(payload : TokenPayload) {
        const senha = Md5.hashStr(payload.SENHA)
        let resposta = await this.authRepository.selectSenha(payload.LOGIN)
        let existe = await this.authRepository.existePermissao(payload.LOGIN)
        if(resposta.length > 0) {
            if(existe != '0'){
                if(senha === resposta[0]['SENHA_ATUAL']){
                    const token = this.jwtService.sign({LOGIN : payload.LOGIN});
                    return token;
                }
                else {
                    throw new BadRequestException('Falha de autenticação: senha incorreta')
                }
            }
            else {
                throw new UnauthorizedException('Usuário não possui permissão para acessar este conteúdo')
            }
        }
        else {
            throw new BadRequestException('Falha de autenticação: usuário inexistente') 
        }
        
        //return `Authentication=${token}; HttpOnly; Path=/; Max-Age=${'320s'}`;
        
    }


}
