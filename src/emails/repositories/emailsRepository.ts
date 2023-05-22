import { BadRequestException, HttpException, HttpStatus, Injectable, InternalServerErrorException } from "@nestjs/common";
import { InjectKnex, Knex } from "nestjs-knex";
import { CreateEmailDto} from '../dto/createEmail.dto'
import { UpdateEmailDto} from '../dto/updateEmail.dto'
import { email_inst} from '../../entities/email_inst.entity'
import { hist_email_inst} from '../../entities/hist_email_inst.entity'
import { colaboradores } from '../../entities/colaboradores.entity'
import { anexo_email_inst} from '../../entities/anexo_email_inst.entity'
import { deleteArquivo } from '../dto/deleteArquivo.dto'
import { motivoAlteracao } from "../dto/motivoAlteracao.dto";
import * as moment from "moment-timezone"
import { autorAlteracao } from "../dto/autorAlteracao.dto";

moment.tz.setDefault("America/Sao_Paulo");

@Injectable()
export class EmailsRepository {

    private PEMAIL = () => this.knex<email_inst>('EMAIL_INSTITUCIONAL')
    private PHEMAIL = () => this.knex<hist_email_inst>('EMAIL_INSTITUCIONAL_HISTORICO')
    private PUSERS = () => this.knex<colaboradores>(this.knex.raw('USUARIOS u'))
    private PANEXO = () => this.knex<anexo_email_inst>(this.knex.raw('EMAIL_INSTITUCIONAL_ANEXO'))

    constructor(@InjectKnex() private readonly knex: Knex) {}

    async selectAll(status : number) {
        
    try {
        if (status === 0 || status === 1) {
            const data = await this.PEMAIL()
            .select(this.knex.raw("CD_EMAIL as id, ASSUNTO, BASE, CADASTRADO_POR, TO_CHAR(DATA, 'dd/mm/yyyy') as DATA, STATUS"))
            .whereRaw('STATUS = 0 OR STATUS = 1').orderBy('CD_EMAIL','desc');
            return data;
        }
        if (status === 2) {
            const data = await this.PEMAIL()
            .select(this.knex.raw("CD_EMAIL as id, ASSUNTO, BASE, CADASTRADO_POR, TO_CHAR(DATA, 'dd/mm/yyyy') as DATA, STATUS"))
            .whereRaw('STATUS = 2').orderBy('CD_EMAIL','desc');
            return data;
        }
    }

    catch(error){
        throw new InternalServerErrorException ('Falha ao selecionar emails')
    } 
        
    }

    async existeId(id : number) {
        try {
            const data = await this.PEMAIL().select().where('CD_EMAIL',id.toString());
            if(data.length > 0) {
                return true; 
            }
            else {
                return false;
            }
        }
        catch (error){
            throw new InternalServerErrorException ('Falha ao selecionar email')
        }
    }
    async salvaTamanhoAnexos (tamanho : number, id : number) {
        try{
            await this.PEMAIL().where('CD_EMAIL', id.toString()).update('TAMANHO_ANEXOS', tamanho)
        }
        catch(error){
            throw new InternalServerErrorException ('Falha ao atualizar tamanho dos anexos')
        }
    }

    async selectTamanhoTotalAnexos ( id : number) {
        try{
            let data = await this.PEMAIL().where('CD_EMAIL', id.toString()).select('TAMANHO_ANEXOS')
            return data[0]['TAMANHO_ANEXOS']
        }
        catch(error){
            throw new InternalServerErrorException ('Falha ao selecionar tamanho total dos anexos')
        }
    }

    async updateTamanhoTotalAnexos ( id : number, tamanho : number) {
        try{
            await this.PEMAIL().where('CD_EMAIL', id.toString()).update('TAMANHO_ANEXOS', tamanho)
            return true
        }
        catch(error){
            throw new InternalServerErrorException ('Falha ao atualizar tamanho total dos anexos')
        }
    }

    async selectAnexo ( nome : string) {
        try{
            let data = await this.PANEXO().where('ARQUIVO', nome).select('TAMANHO', 'ANO')
            return data[0]
        }
        catch(error){
            console.log(error)
            throw new InternalServerErrorException ('Falha ao selecionar anexo')
        }
    }

    async findOne(id : number) {
        try {
            var data = []
            const dataEmail = await this.PEMAIL().select(this.knex.raw("CD_EMAIL as id, ASSUNTO, BASE, CORPO, CADASTRADO_POR, TO_CHAR(DATA, 'dd/mm/yyyy') as DATA, STATUS, TAMANHO_ANEXOS"))
            .where('CD_EMAIL',id.toString())
            var dataAnexo = await this.PANEXO().select('CD_EMAIL_ANEXO', 'NOME_ORIGINAL', 'ANO', 'ARQUIVO', 'TAMANHO').where('CD_EMAIL',id.toString()).andWhere('STATUS', '0' );
            if(dataEmail.length > 0){
                data = [dataEmail[0], dataAnexo]
            }
            return data;
        }
        catch (error){
            throw new InternalServerErrorException ('Falha ao selecionar email')
        }
    }

    async deleteAnexos(anexos_excluir: string[], id: number, autor: string) {
        var data = moment().format('YYYY-MM-DD HH:mm:ss')
        for (var i = 0; i <anexos_excluir.length; i++) {
            try {
                await this.PANEXO().where('CD_EMAIL', id.toString()).andWhere('ARQUIVO', anexos_excluir[i]).update('STATUS', '1');
            }
            catch (error){
                throw new InternalServerErrorException ('Falha ao excluir arquivo')
            }
            try {
                await this.PHEMAIL().insert({
                    CD_EMAIL_HISTORICO : this.knex.raw('SQ_EMAIL_INSTITUCIONAL_HIST.nextval'),
                    CD_EMAIL: id.toString(),
                    AUTOR : autor, 
                    DATA : this.knex.raw("to_date('" + data + "','SYYYY-MM-DD HH24:MI:SS')" ),
                    DESCRICAO : 'Anexo removido'
                });
            }
            catch (error){
                throw new InternalServerErrorException ('Falha ao atualizar histórico')
            } 
        }
        return true
    }

    async countFiles(id: number, tipo: string) {
        try {
            let data = await this.PANEXO().count('ARQUIVO').where('CD_EMAIL',id.toString());
            return data[0]['COUNT("ARQUIVO")']
        }
        catch (error){
            throw new InternalServerErrorException ('Internal server error')
        }
    }

    async selectFiles(id: number) {
        try {
            let data = await this.PANEXO().select('ARQUIVO', 'ANO').where('CD_EMAIL',id.toString()).andWhere('STATUS','0');
            return data
        }
        catch (error){
            throw new InternalServerErrorException ('Internal server error')
        }
    }

    async nextId() {
        try {
            const data = await this.knex.raw('select SQ_EMAIL_INSTITUCIONAL.nextval from dual')
            return data;
        }
        catch (error){
            throw new InternalServerErrorException ('Internal server error')
        }
    }

    async statusEnviadoEmail(id : number, autor : autorAlteracao) {
        var data = moment().format('YYYY-MM-DD HH:mm:ss')
        try {
            await this.PEMAIL().where('CD_EMAIL',id.toString()).update('STATUS' , '1');
        }
        catch (error){
            throw new InternalServerErrorException ('Falha ao atualizar status email')
        }
        try {
            await this.PHEMAIL().insert({
                CD_EMAIL_HISTORICO : this.knex.raw('SQ_EMAIL_INSTITUCIONAL_HIST.nextval'),
                CD_EMAIL: id.toString(),
                AUTOR : autor.AUTOR, 
                DATA : this.knex.raw("to_date('" + data + "','SYYYY-MM-DD HH24:MI:SS')" ),
                DESCRICAO : 'Email enviado com sucesso'
            });
        }
        catch (error){
            throw new InternalServerErrorException ('Falha ao atualizar histórico')
        }
        return true
    }

    async desativaEmail(motivo : motivoAlteracao, id:number) {
        var data = moment().format('YYYY-MM-DD HH:mm:ss')
        try {
            await this.PEMAIL().where('CD_EMAIL',id.toString()).update('STATUS' , '2');
        }
        catch (error){
            throw new InternalServerErrorException ('Falha ao desativar email')
        }

        try {
            await this.PHEMAIL().insert({
                CD_EMAIL_HISTORICO : this.knex.raw('SQ_EMAIL_INSTITUCIONAL_HIST.nextval'),
                CD_EMAIL: id.toString(),
                AUTOR : motivo.AUTOR, 
                DATA : this.knex.raw("to_date('" + data + "','SYYYY-MM-DD HH24:MI:SS')" ),
                DESCRICAO : 'Email desativado: ' + motivo['MOTIVO']
            });
        }
        catch (error){
            throw new InternalServerErrorException ('Falha ao atualiar histórico')
        }
        return true
    }

    async createEmail(CreateEmailDto: CreateEmailDto) {
        var data = moment().format('YYYY-MM-DD HH:mm:ss')
        try {
         await this.PEMAIL().insert({
            CD_EMAIL: CreateEmailDto.CD_EMAIL,
            BASE : CreateEmailDto.BASE,
            ASSUNTO : CreateEmailDto.ASSUNTO, 
            CORPO : CreateEmailDto.CORPO,
            CADASTRADO_POR : CreateEmailDto.CADASTRADO_POR,
            DATA : this.knex.raw("to_date('" + data + "','SYYYY-MM-DD HH24:MI:SS')" ),
            STATUS : '0'
        });
        }
        catch (error) {
           throw new InternalServerErrorException ('Falha ao cadastrar email')
        }

        try {
            await this.PHEMAIL().insert({
                CD_EMAIL_HISTORICO : this.knex.raw('SQ_EMAIL_INSTITUCIONAL_HIST.nextval'),
                CD_EMAIL: CreateEmailDto.CD_EMAIL,
                AUTOR : CreateEmailDto.CADASTRADO_POR, 
                DATA : this.knex.raw("to_date('" + data + "','SYYYY-MM-DD HH24:MI:SS')" ),
                DESCRICAO : 'Email adicionado com sucesso'
            });
        }
        catch (error) {
            throw new InternalServerErrorException ('Falha ao atualizar histórico')
         }

         return true
    }

    async updateEmail(id: number, UpdateEmailDto: UpdateEmailDto, autor: string) {
        var data = moment().format('YYYY-MM-DD HH:mm:ss')
        try {
            await this.PEMAIL().where('CD_EMAIL',id.toString()).update(UpdateEmailDto);
        }
        catch (error) {       
            throw new InternalServerErrorException('Falha ao atualizar email')
        }

        try{
            await this.PHEMAIL().insert({
                CD_EMAIL_HISTORICO : this.knex.raw('SQ_EMAIL_INSTITUCIONAL_HIST.nextval'),
                CD_EMAIL: id.toString(),
                AUTOR : autor, 
                DATA : this.knex.raw("to_date('" + data + "','SYYYY-MM-DD HH24:MI:SS')" ),
                DESCRICAO : 'Email editado com sucesso'
            });
        }
        catch (error) {
            throw new InternalServerErrorException('Falha ao atualizar histórico')
        }
        return true
    }

    async insertAnexo (dataAnexo: string, cont : number, id: number, extensao : string, ano: string, autor : string, nome_original : string, tamanho : number) {
        var data = moment().format('YYYY-MM-DD HH:mm:ss')
        try {
            await this.PANEXO().insert({
                CD_EMAIL_ANEXO : this.knex.raw('SQ_EMAIL_INSTITUCIONAL_ANEXO.nextval'),
                CD_EMAIL: id.toString(),
                AUTOR : autor, 
                DATA : this.knex.raw("to_date('" + data + "','SYYYY-MM-DD HH24:MI:SS')" ),
                ARQUIVO : 'anexo_email' + '_' + cont + '_' + id +'_' + dataAnexo + '.' + extensao,
                NOME_ORIGINAL: nome_original,
                ANO: ano,
                STATUS : '0',
                TAMANHO: tamanho
            });
        }
        catch (error) {
            throw new InternalServerErrorException("Falha ao inserir anexo");
        }

        try {
            await this.PHEMAIL().insert({
                CD_EMAIL_HISTORICO : this.knex.raw('SQ_EMAIL_INSTITUCIONAL_HIST.nextval'),
                CD_EMAIL: id.toString(),
                AUTOR : autor, 
                DATA : this.knex.raw("to_date('" + data + "','SYYYY-MM-DD HH24:MI:SS')" ),
                DESCRICAO : 'Anexo adicionado'
            });
        }
        catch (error) {
            throw new InternalServerErrorException("Falha ao atualizar histórico");
        }
        return true
    }

    async selectUsuarios() {
        try {
            const data = await this.PUSERS().select()
           return data 
           
        }
        catch (error) {
            throw new InternalServerErrorException ('Falha ao selecionar usuários')
        }
    }

}

