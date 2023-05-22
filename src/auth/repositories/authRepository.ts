import { BadRequestException, HttpException, HttpStatus, Injectable, InternalServerErrorException } from "@nestjs/common";
import { InjectKnex, Knex } from "nestjs-knex";

@Injectable()
export class AuthRepository {

    constructor(@InjectKnex() private readonly knex: Knex) {}

    async selectSenha(login : string) {
        
    try {
            const senha = await this.knex('USUARIOS')
            .select('SENHA_ATUAL')
            .where('STATUS', 'ATIVO').andWhere('LOGIN', login)
            return senha;
        
    }
    catch(error){
        throw new InternalServerErrorException ('Falha ao selecionar usuário')
    }
     
}
  
}