export const FieldType = {
  STRING: 'string',
  NUMBER: 'number',
  BOOLEAN: 'boolean',
  EMAIL: 'email',
  DATE: 'date',
  URL: 'url',
} as const;

export type FieldType = typeof FieldType[keyof typeof FieldType];

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
  
  // Default value
  defaultValue?: any;
  displayInDataTable?: boolean;
}

export interface EntityDefinition {
  id: string;
  name: string;
  tableName: string;
  userId: string;
  fields: FieldDefinition[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateEntityDefinitionDto {
  name: string;
  fields: FieldDefinition[];
}