import { Body, Controller, Get, Post , Res, Param, UploadedFiles, 
  UseInterceptors, BadRequestException, Req, Headers, UseGuards,  
  ParseIntPipe, ValidationPipe, Query, UploadedFile, ParseFilePipe} from '@nestjs/common';
import { CreateEmailDto} from './dto/createEmail.dto'
import { UpdateEmailDto } from './dto/updateEmail.dto'
import { salvaAnexo } from './dto/salvaAnexo.dto'
import { EmailsService} from './emails.service'
import { Express, Response } from 'express'
import LocalFilesInterceptor from 'src/utils/localFiles.interceptor';
import CheckTotalSize from 'src/utils/checkFileSize'
import * as fs from "fs";
import * as moment from "moment-timezone"
import { AuthGuard } from '@nestjs/passport';
import { motivoAlteracao } from './dto/motivoAlteracao.dto';
import { autorAlteracao } from './dto/autorAlteracao.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { FileSizeValidationPipe } from 'src/utils/validation/FileSizeValidation.pipe';

moment.tz.setDefault("America/Sao_Paulo");
const ANEXO_PATH = '/var/www/html/arquivos/anexos_email_institucional/'
const IMAGEM_PATH = '/var/www/html/arquivos/imagens_email_institucional/'

@Controller('emails')
export class EmailsController {

constructor(private readonly EmailsService: EmailsService) {}

@UseGuards(AuthGuard('jwt'))
@Get('/status/:status')
  async selectAll(@Param('status', ParseIntPipe) status: number ) {
    return this.EmailsService.selectAll(status)
  }

@Get('/imagem/:ano/:nome')
  async getImagem(@Res() res: Response, @Param('nome') nome: string, @Param('ano', ParseIntPipe) ano: number  ) {
    
    if(fs.existsSync(IMAGEM_PATH + ano + '/' + nome)){
      const file = fs.createReadStream(IMAGEM_PATH + ano + '/' + nome);
      file.pipe(res);
    }
    else {
      throw new BadRequestException ("Imagem não encontrada")
    }
  }

@Get('/anexo/:ano/:nome')
  async getAnexo(@Res() res: Response, @Param('nome') nome: string, @Param('ano', ParseIntPipe) ano: number  ) {
    
    if(fs.existsSync(ANEXO_PATH  + ano + '/' + nome)){
      const file = fs.createReadStream( ANEXO_PATH  + ano + '/' + nome);
      file.pipe(res);
    }
    else {
      throw new BadRequestException ("Anexo não encontrado")
    }
  }

@UseGuards(AuthGuard('jwt'))
@Get('/:id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return await this.EmailsService.findOne(id)
  }

@UseGuards(AuthGuard('jwt'))
@Post('/desativar/:id')
  async desativaEmail(@Body(new ValidationPipe({transform : true, whitelist: true})) motivo: motivoAlteracao, @Param('id', ParseIntPipe) id: number) {

    return await this.EmailsService.desativaEmail(motivo, id)
  }

@UseGuards(AuthGuard('jwt')) 
@Post()
  async create(@Body(new ValidationPipe({transform : true, whitelist: true})) CreateEmailDto: CreateEmailDto){

  let nextval = await this.EmailsService.nextId()
  let id = nextval[0]['NEXTVAL']
  CreateEmailDto.CD_EMAIL = id
  let resposta = await this.EmailsService.createEmail(CreateEmailDto)
  
  return resposta
  }

@UseGuards(AuthGuard('jwt'))
@Get('/email/:id')
  async enviarEmail(@Param('id', ParseIntPipe) id: number, @Query(new ValidationPipe({transform : true, transformOptions: {enableImplicitConversion: true}, whitelist: true})) autor : autorAlteracao) {
    return await this.EmailsService.enviarEmail(id, autor)
    }

@UseGuards(AuthGuard('jwt'))  
@Post('/update/:id') 
  async update(@Body(new ValidationPipe({transform : true, whitelist: true})) UpdateEmailDto: UpdateEmailDto, @Param('id', ParseIntPipe) id: number){
    let autor = UpdateEmailDto.CADASTRADO_POR;
    delete UpdateEmailDto.CADASTRADO_POR
    
    let resposta = await this.EmailsService.updateEmail(id,UpdateEmailDto, autor)
    return resposta
  }

@UseGuards(AuthGuard('jwt'))  
@Post('/upload_anexo/:id')
@UseInterceptors(LocalFilesInterceptor({  
  fileFilter: (request, file, cb) => {
    if(!['pdf'].some(el => file.mimetype.includes(el))) {
      return cb (new BadRequestException ('Extensão inválida'), false)
    }
    cb (null, true)
  },
  limits : { 
    fileSize:  10485760
},
}))
  async upload_anexo(@UploadedFiles(new FileSizeValidationPipe()) files : Express.Multer.File[], @Body(new ValidationPipe({transform : true, whitelist: true})) salvaAnexo: salvaAnexo,
    @Param('id', ParseIntPipe) id: number) {
      let tamanho = CheckTotalSize (files) 
      if(salvaAnexo.TIPO == 'adiciona'){
        return await this.EmailsService.salvaAnexosCreate(files, id, salvaAnexo.AUTOR, tamanho)
      }
      else{
        return await this.EmailsService.salvaAnexosUpdate(files, id, salvaAnexo.AUTOR, tamanho, salvaAnexo.EXCLUIR)
      }
    }
  
@UseGuards(AuthGuard('jwt'))
@Post('/upload_imagem')
@UseInterceptors(FileInterceptor('IMAGEM', {
    storage: diskStorage({
  }),
    fileFilter: (request, file, cb) => {
      if(!['jpeg', 'png'].some(el => file.mimetype.includes(el))) {
        return cb (new BadRequestException ('Extensão inválida'), false)
      }
      cb (null, true)
    },
    limits: {
      fileSize: 1024 * 10240
  },
  }))
  async upload_imagem(@UploadedFile() file : Express.Multer.File) {
    return await this.EmailsService.salvaImagem(file)
  }

}

