import { IsString, IsBoolean, IsOptional, IsNumber, IsEnum, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { FieldType, DropdownOption } from '../../types/entity-field.type';

class DropdownOptionDto implements DropdownOption {
  @IsString()
  label: string;

  @IsString()
  value: string;
}

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

  // Display name for UI
  @IsOptional()
  @IsString()
  displayName?: string;

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

  // Dropdown options
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => DropdownOptionDto)
  options?: DropdownOptionDto[];

  // Default value
  @IsOptional()
  defaultValue?: any;

  // Display configuration
  @IsOptional()
  @IsBoolean()
  showInDataTable?: boolean;

  @IsOptional()
  @IsBoolean()
  showInForm?: boolean;

  @IsOptional()
  @IsBoolean()
  allowUpdate?: boolean;

  @IsOptional()
  @IsBoolean()
  enableSearch?: boolean;

  // Form layout - span 1-4 columns
  @IsOptional()
  @IsNumber()
  span?: number;
}