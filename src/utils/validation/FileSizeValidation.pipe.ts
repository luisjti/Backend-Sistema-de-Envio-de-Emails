import { PipeTransform, Injectable, ArgumentMetadata, BadRequestException } from '@nestjs/common';

@Injectable()
export class FileSizeValidationPipe implements PipeTransform {
  transform(value: Express.Multer.File[] , metadata: ArgumentMetadata) {
    // "value" is an object containing the file's attributes and metadata
    const tenMb = 10485760;
    var totalSize : number = 0
    for(var j = 0; j < (<any>value).length; j++) {
        let size = value[j]['size']
        totalSize += size
    }
    if (totalSize > tenMb){
        throw new BadRequestException('O tamanho dos anexos excedeu o limite de 10 MB');
    }
    else {
        return value
    }
  }
}