import { Exclude, Transform } from 'class-transformer';
import { IsString, IsInt, Length, IsNotEmpty, MaxLength, IsOptional } from 'class-validator'

export class TokenPayload {

    @IsString()
    @IsNotEmpty({
      message: 'O campo LOGIN não pode ser vazio'
    })
    @MaxLength(30, {
      message : 'Tamanho incorreto para o campo LOGIN'
    })
    @Transform(({ value }) => value.replace(/[\']/g, "").replace(/\%/g, "").replace(/\\/g, ""))
    LOGIN : string;

    @IsString()
    @IsNotEmpty({
      message: 'O campo SENHA não pode ser vazio'
    })
    @MaxLength(30, {
      message : 'Tamanho incorreto para o campo SENHA'
    })
    SENHA : string;
  }