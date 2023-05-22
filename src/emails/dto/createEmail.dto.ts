import { Transform } from 'class-transformer';
import { IsString, IsNotEmpty, MaxLength, IsOptional, IsArray} from 'class-validator'

export class CreateEmailDto {
    
    CD_EMAIL: string;

    @IsString()
    @IsNotEmpty({
        message: 'O campo BASE não pode ser vazio'
    })
    @MaxLength(20, {
        message : 'Tamanho incorreto para o campo BASE'
    })
    BASE: string;

    @IsString()
    @IsNotEmpty({
        message: 'O campo ASSUNTO não pode ser vazio'
    })
    @MaxLength(255, {
        message : 'Tamanho incorreto para o campo ASSUNTO'
    })
    @Transform(({ value }) => value.replace(/[\']/g, "").replace(/\%/g, "").replace(/\\/g, ""))
    ASSUNTO : string;

    @IsString()
    @IsNotEmpty({
        message: 'O campo CORPO não pode ser vazio'
    })
    @MaxLength(4000, {
        message : 'Tamanho incorreto para o campo CORPO'
    } )
    @Transform(({ value }) => value.replace(/[\']/g, "").replace(/\%/g, "").replace(/\\/g, ""))
    CORPO : string;

    @IsString()
    @IsNotEmpty({
        message: 'O campo CADASTRADO_POR não pode ser vazio'
    })
    @MaxLength(255, {
        message : 'Tamanho incorreto para o campo CADASTRADO_POR'
    })
    @Transform(({ value }) => value.replace(/[\']/g, "").replace(/\%/g, "").replace(/\\/g, ""))
    CADASTRADO_POR : string;
    
    /*@IsOptional()
    @IsNotEmpty()
    @IsArray()
    @Transform(({ value }) => value.map((nome) =>
      nome.replace(/[\']/g, "").replace(/\%/g, "").replace(/\\/g, "")
    ))
    EXCLUIR : string[];*/


}