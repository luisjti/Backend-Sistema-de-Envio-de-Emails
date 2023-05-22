import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { CreateEmailDto} from '../emails/dto/createEmail.dto'
import * as Mustache from "mustache";
import { email_inst} from '../entities/email_inst.entity'
import { attachment } from '../entities/attachment.entity'

const ANEXO_PATH = '/var/www/html/arquivos/anexos_email_institucional/'

@Injectable()
export class MailService {
    constructor(private mailerService: MailerService) {}

  async sendEmail(dados) {
    let attachements: { path?: string, filename: string, contentDisposition?: "attachment" | "inline"}[] = []
    for (var i = 0; i < dados.anexos.length; i++) {
      let anexo : attachment = {
        path : ANEXO_PATH + dados.anexos[i]['ANO'] + '/' + dados.anexos[i]['ARQUIVO'],
        filename: dados.anexos[i]['ARQUIVO'],
        contentDisposition: "attachment"
      }
      attachements.push(anexo)
    }
    
    try {
      await this.mailerService.sendMail({
      to: dados.email,
      from: 'EXAMPLE <example@gmail.com>', // override default from
      subject: dados.assunto,
      //template: './template', 
      html : dados.body,
      /*context: { 
        nome: dados.nome,
        body: dados.body,
      },*/
      attachments: attachements
     
    });
    return true
  }
  catch(error){
    //return false;
    console.log(error)
    throw new InternalServerErrorException("Falha ao enviar email")
  }

  }
}
