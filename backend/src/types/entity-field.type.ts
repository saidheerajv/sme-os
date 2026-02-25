export enum FieldType {
  STRING = 'string',
  NUMBER = 'number',
  BOOLEAN = 'boolean',
  EMAIL = 'email',
  DATE = 'date',
  DATETIME = 'datetime',
  TIME = 'time',
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
  
  // Display name for UI
  displayName?: string;
  
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
  
  // Display configuration
  showInDataTable?: boolean;
  showInForm?: boolean;
  allowUpdate?: boolean;
  enableSearch?: boolean;
  
  // Form layout - span 1-4 columns (default: 2)
  span?: 1 | 2 | 3 | 4;
}

export interface EntityDefinitionData {
  name: string;
  fields: FieldDefinition[];
}