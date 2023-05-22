import { Transform } from 'class-transformer';
import { IsString, Length, Contains, MaxLength } from 'class-validator'

export class deleteArquivo {

    @IsString()
    @MaxLength(255, {
      message : 'Tamanho incorreto para o campo NOME ARQUIVO'
  })
    @Contains('anexo_email', {
      message : 'Nome de arquivo inválido'
  })
    @Transform(({ value }) => value.replace(/[\']/g, "").replace(/\%/g, "").replace(/\\/g, ""))
    ARQUIVO: string;
  }