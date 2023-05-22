import { PartialType } from "@nestjs/mapped-types";
import { CreateEmailDto } from './createEmail.dto';

export class UpdateEmailDto extends PartialType(CreateEmailDto){}