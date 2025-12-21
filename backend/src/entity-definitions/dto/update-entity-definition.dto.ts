import { IsArray, ValidateNested, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';
import { FieldDefinitionDto } from './field-definition.dto';

export class UpdateEntityDefinitionDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FieldDefinitionDto)
  @IsOptional()
  fields?: FieldDefinitionDto[];
}
