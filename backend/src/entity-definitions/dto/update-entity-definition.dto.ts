import { IsArray, ValidateNested, IsOptional, IsEnum, IsObject } from 'class-validator';
import { Type } from 'class-transformer';
import { FieldDefinitionDto } from './field-definition.dto';
import { UIComponentType } from '../../types/entity-field.type';

export class UpdateEntityDefinitionDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FieldDefinitionDto)
  @IsOptional()
  fields?: FieldDefinitionDto[];

  @IsOptional()
  @IsEnum(UIComponentType)
  uiComponent?: UIComponentType;

  @IsOptional()
  @IsObject()
  uiConfig?: Record<string, any>;
}
