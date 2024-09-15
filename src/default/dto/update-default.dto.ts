import { PartialType } from '@nestjs/mapped-types';
import { CreateDefaultDto } from './create-default.dto';

export class UpdateDefaultDto extends PartialType(CreateDefaultDto) {}
