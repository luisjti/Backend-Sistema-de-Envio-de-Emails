import { Injectable, HttpException, HttpStatus, BadRequestException } from '@nestjs/common';
import { CreateEmailDto} from './dto/createEmail.dto'
import { UpdateEmailDto } from './dto/updateEmail.dto'
import { EmailsRepository } from './repositories/emailsRepository'
import { MailService } from '../mail/mail.service';
import * as Mustache from "mustache";
import { deleteArquivo } from './dto/deleteArquivo.dto'
import { motivoAlteracao } from './dto/motivoAlteracao.dto';
import * as fs from "fs";
import * as mv from 'mv'  
import { autorAlteracao } from './dto/autorAlteracao.dto';
import * as moment from "moment-timezone"
import  deleteTempFiles  from 'src/utils/deletaArquivosTemp'

moment.tz.setDefault("America/Sao_Paulo");
const ANEXO_PATH = '/var/www/html/arquivos/anexos_email_institucional/'
//const ANEXO_PATH = 'arquivos/anexos_email_institucional/'
const IMAGEM_PATH = '/var/www/html/arquivos/imagens_email_institucional/'
const TEMPLATE_EMAIL_PATH = '/var/www/html/templates/template.html'
const TAMANHO_MAX_ANEXOS = 10485760

@Injectable()
export class EmailsService {
    constructor(private readonly EmailsRepository: EmailsRepository, private mailService: MailService) {}

    async createEmail (CreateEmailDto: CreateEmailDto) {
       
        await this.EmailsRepository.createEmail(CreateEmailDto)
        return {
            result : true,
            id: CreateEmailDto.CD_EMAIL,
            message: 'Email adicionado com sucesso'
        } 
        
    }

    async updateEmail (id:number, UpdateEmailDto: UpdateEmailDto, autor: string) {
        let existe = await this.EmailsRepository.existeId(id)
        if(existe) {
            await this.EmailsRepository.updateEmail(id, UpdateEmailDto, autor)
            return {
                result : true,
                message: 'Email atualizado com sucesso'
            } 
        }
        else {
            return{
                result : false,
                message: 'Email não cadastrado'  
            }
        }  
    }

    async selectAll(status : number) {
        if (status === 0 || status === 1 || status === 2) {
        const data = await this.EmailsRepository.selectAll(status);
        if (data.length > 0) {
            return data;
        }
        else{
            throw new HttpException('Nenhum valor encontrado', HttpStatus.NOT_FOUND);
        }
        }
        
        else{
            throw new BadRequestException('Status inválido')
        }
    }

    async findOne (id: number) {
        const data = await this.EmailsRepository.findOne(id);
        if (data.length > 0) {
            return data;
        }
        else{
            throw new HttpException('Nenhum valor encontrado', HttpStatus.NOT_FOUND);
        }
    }

    async desativaEmail (motivo : motivoAlteracao, id: number) {
        let existe = await this.EmailsRepository.existeId(id)
        if(existe) {
            await this.EmailsRepository.desativaEmail(motivo, id);
            return {
                result : true,
                message: 'Email desativado com sucesso'
         
           } 
        }
        else {
            return{
                result : false,
                message: 'Email não cadastrado'  
            }
        }
    }

    async insertAnexo (data: string, cont : number, id: number, extensao : string, ano: string, autor : string, nome_original : string, tamanho: number) {
        const resposta = await this.EmailsRepository.insertAnexo(data, cont, id, extensao, ano, autor, nome_original, tamanho);
        return resposta;
    }

    async deleteAnexos (anexos_excluir: string[], id: number, autor: string) {
        await this.EmailsRepository.deleteAnexos(anexos_excluir, id, autor);
        var tamanhoAtual = await this.EmailsRepository.selectTamanhoTotalAnexos(id)
        var tamanho : number = 0
        for (var i = 0; i <anexos_excluir.length; i++){
            let dadosAnexo = await this.EmailsRepository.selectAnexo(anexos_excluir[i])
            tamanho = +<number>dadosAnexo['TAMANHO'] + +tamanho
            if(fs.existsSync(ANEXO_PATH + dadosAnexo['ANO'] + '/' + anexos_excluir[i])){
                fs.unlink(ANEXO_PATH + dadosAnexo['ANO'] + '/' + anexos_excluir[i], (err) => {
                    if (err) throw err;}) 
                }
        }
        tamanho = <number>tamanhoAtual - tamanho
        if(tamanhoAtual != 0) {
            await this.EmailsRepository.updateTamanhoTotalAnexos(id, tamanho)
        }
    }

    async countFiles (id: number, tipo: string) {
        const data = await this.EmailsRepository.countFiles(id, tipo);
        return data;
    }

    async nextId () {
        const data = await this.EmailsRepository.nextId();
        return data;
    }

    async salvaAnexosCreate (files: Express.Multer.File[], id: number, autor : string, tamanho: number) {
        let existe = await this.EmailsRepository.existeId(id)
        if(existe) {
            await this.EmailsRepository.salvaTamanhoAnexos(tamanho, id)
            let data = moment().format('YYYYMMDDhhmmss')
            let year = moment().format('YYYY')

            var dir = ANEXO_PATH + year;
            if (!fs.existsSync(dir)){
                fs.mkdirSync(dir, { recursive: true });
            }

            if(files[0]) {
                for(var j = 0; j < (<any>files).length; j++) {
                    let extensao = files[j]['mimetype'].split('/')
                    let num = +j + +1;
                    this.insertAnexo(data, num, id, extensao[1], year, autor, files[j]['originalname'], files[j]['size'])
                    mv(files[j]['path'], ANEXO_PATH + year +'/anexo_email_'+ num + '_' + id + '_' + data +'.'+ extensao[1] , function(err) {
                });
                }
            }
            return {
                result : true,
                message: 'Anexos adicionados com sucesso'
            } 
        }

        else {
            deleteTempFiles(files)
            return{
                result : false,
                message: 'Email não cadastrado'  
            }
        }
    }

    async salvaAnexosUpdate (files: Express.Multer.File[], id: number, autor : string, tamanho: number, anexos_excluir : string) {

        let existe = await this.EmailsRepository.existeId(id)
        var msg = ''
       
        if(existe) {
        
            if(anexos_excluir){
                let anexos = anexos_excluir.split(",")
                await this.deleteAnexos(anexos, id, autor)
                msg = 'e excluídos'
            }
            if(files[0]) {
                let tamanhoAtual = await this.EmailsRepository.selectTamanhoTotalAnexos(id)
                if (+tamanho + +<number>tamanhoAtual <= TAMANHO_MAX_ANEXOS){
                    let data = moment().format('YYYYMMDDhhmmss')
                    let year = moment().format('YYYY')

                    var dir = ANEXO_PATH + '/' + year;
                    if (!fs.existsSync(dir)){
                        fs.mkdirSync(dir, { recursive: true });
                    }

                    let countAne = await this.countFiles(id, 'anexo_email')
                    for(var j = 0; j <(<any>files).length; j++) {
                        let num  = +<number>countAne + +j + +1;
                        let extensao = files[j]['mimetype'].split('/')
                        this.insertAnexo(data, num, id, extensao[1], year, autor, files[j]['originalname'], files[j]['size'])
                        mv(files[j]['path'], ANEXO_PATH  + year + '/anexo_email_'+ num + '_' + id + '_' + data +'.' + extensao[1], function(err) {
                        });
                    }
                    await this.EmailsRepository.salvaTamanhoAnexos(+tamanho + +<number>tamanhoAtual, id)
                    return {
                        result : true,
                        message: 'Anexos adicionados' + msg + ' com sucesso'
                    }
                }
                else {
                    deleteTempFiles(files)
                    throw new BadRequestException('O tamanho dos anexos excedeu o limite de 10 MB');
                }
            }
            else {
                return {
                    result : true,
                    message: 'Anexos excluídos com sucesso'
                } 
            }
        }
        else {
            deleteTempFiles(files)
            return{
                result : false,
                message: 'Email não cadastrado'  
            }
        }
    }

    async salvaImagem (file : Express.Multer.File) {

        let data = moment().format('YYYYMMDDhhmmss')
        let year = moment().format('YYYY')
        let extensao = file['mimetype'].split('/')

        var dirI = IMAGEM_PATH + '/' + year;
            if (!fs.existsSync(dirI)){
                fs.mkdirSync(dirI, { recursive: true });
            }

        //let imagem = fs.readFileSync(file['path'], 'utf8').toString()
       // fs.writeFileSync(IMAGEM_PATH + year + '/imagem_' + data +'.' + extensao[1], imagem)
       mv(file['path'], IMAGEM_PATH + year + '/imagem_' + data +'.' + extensao[1], function(err) {
    });

        return '/arquivos/imagens_email_institucional/' + year + '/imagem_' + data +'.' + extensao[1]
    }

    async enviarEmail(id: number, autor : autorAlteracao) {
        let email = await this.EmailsRepository.findOne(id)
        const base = email[0]['BASE']
        const assunto = email[0]['ASSUNTO']
        let corpo = email[0]['CORPO']
        const template = fs.readFileSync(TEMPLATE_EMAIL_PATH, 'utf8')

        if(base === '1' || base === '2' || base === '3' || base === '4' ) {
            var dadosBase = await this.EmailsRepository.selectUsuarios()
            
          
            if(dadosBase.length > 0) {
                var status = true
                for(var i=0 ; i<dadosBase.length ; i++) {
                    let anexos = await this.EmailsRepository.selectFiles(id)
                    let templateFinal = template
                    let body = corpo
                    body = Mustache.render(body,{NOME: dadosBase[i]['NOME'],EMAIL: dadosBase[i]['EMAIL'], DEPARTAMENTO:dadosBase[i]['DEPARTAMENTO'] })
                    templateFinal = Mustache.render(templateFinal.toString(), {body: body})
                    
                    var dadosEmail = { 
                        nome: dadosBase[i]['NOME'],
                        email: dadosBase[i]['EMAIL'],
                        assunto : assunto,
                        body: templateFinal,
                        anexos : anexos
                    }
                let resposta = await this.mailService.sendEmail(dadosEmail);
                if(resposta == false){
                    status = false;
                }
                }

                await this.EmailsRepository.statusEnviadoEmail(id, autor)
                
                return {
                    result : status     
                } 
                
            }
        }
        else {
            throw new HttpException('Base não encontrada', HttpStatus.BAD_REQUEST)
        }
      }


    }

