import { IsString, IsBoolean, IsOptional, IsNumber, IsEnum } from 'class-validator';
import { FieldType } from '../../types/entity-field.type';

export class FieldDefinitionDto {
  @IsString()
  name: string;

  @IsEnum(FieldType)
  type: FieldType;

  @IsBoolean()
  required: boolean;

  @IsOptional()
  @IsBoolean()
  unique?: boolean;

  // String constraints
  @IsOptional()
  @IsNumber()
  minLength?: number;

  @IsOptional()
  @IsNumber()
  maxLength?: number;

  @IsOptional()
  @IsString()
  pattern?: string;

  // Number constraints
  @IsOptional()
  @IsNumber()
  min?: number;

  @IsOptional()
  @IsNumber()
  max?: number;

  // Default value
  @IsOptional()
  defaultValue?: any;

  // Display configuration
  @IsOptional()
  @IsBoolean()
  displayInDataTable?: boolean;

  @IsOptional()
  @IsBoolean()
  enableSearch?: boolean;
}