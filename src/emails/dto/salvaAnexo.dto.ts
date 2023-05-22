import { Transform } from 'class-transformer';
import { IsString, Length, Contains, MaxLength, IsOptional } from 'class-validator'

export class salvaAnexo {

    @IsString()
    @MaxLength(20, {
      message : 'Tamanho incorreto para o campo TIPO'
  })
    @Transform(({ value }) => value.replace(/[\']/g, "").replace(/\%/g, "").replace(/\\/g, ""))
    TIPO: string;

    @IsString()
    @MaxLength(20, {
      message : 'Tamanho incorreto para o campo AUTOR'
  })
    @Transform(({ value }) => value.replace(/[\']/g, "").replace(/\%/g, "").replace(/\\/g, ""))
    AUTOR: string;

    @IsOptional()
    @IsString()
    @MaxLength(255, {
      message : 'Tamanho incorreto para o campo EXCLUIR'
    })
    @Transform(({ value }) => value.replace(/[\']/g, "").replace(/\%/g, "").replace(/\\/g, ""))
    EXCLUIR?: string
  }