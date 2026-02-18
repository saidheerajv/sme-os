export enum FieldType {
  STRING = 'string',
  NUMBER = 'number',
  BOOLEAN = 'boolean',
  EMAIL = 'email',
  DATE = 'date',
  URL = 'url',
  DROPDOWN = 'dropdown',
}

export interface DropdownOption {
  label: string;
  value: string;
}

export interface FieldDefinition {
  name: string;
  type: FieldType;
  required: boolean;
  unique?: boolean;
  
  // String constraints
  minLength?: number;
  maxLength?: number;
  pattern?: string;
  
  // Number constraints
  min?: number;
  max?: number;
  
  // Dropdown options
  options?: DropdownOption[];
  
  // Default value
  defaultValue?: any;
}

export interface EntityDefinitionData {
  name: string;
  fields: FieldDefinition[];
}