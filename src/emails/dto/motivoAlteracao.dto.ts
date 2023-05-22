import { Transform } from 'class-transformer';
import { IsString, Length, Contains, MaxLength } from 'class-validator'

export class motivoAlteracao {

    @IsString()
    @MaxLength(255, {
      message : 'Tamanho incorreto para o campo MOTIVO'
  })
    @Transform(({ value }) => value.replace(/[\']/g, "").replace(/\%/g, "").replace(/\\/g, ""))
    MOTIVO: string;

    @IsString()
    @MaxLength(20, {
      message : 'Tamanho incorreto para o campo AUTOR'
  })
    @Transform(({ value }) => value.replace(/[\']/g, "").replace(/\%/g, "").replace(/\\/g, ""))
    AUTOR: string;
  }