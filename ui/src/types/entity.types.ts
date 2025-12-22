export const FieldType = {
  STRING: 'string',
  NUMBER: 'number',
  BOOLEAN: 'boolean',
  EMAIL: 'email',
  DATE: 'date',
  URL: 'url',
} as const;

export type FieldType = typeof FieldType[keyof typeof FieldType];

export interface DataTableConfig {

}


export interface SearchFieldConfig {

  fieldName:string,
  operator:string

}
export interface FieldDefinition {
  name: string;
  type: FieldType;
  required: boolean;
  unique?: boolean;
  displayName?: string;
  showInDataTable?: boolean;
  showInForm?: boolean;
  allowUpdate?: boolean;
  autoGenerate?: boolean;
  
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
  enableSearch?: boolean;
}

export interface EntityDefinition {
  id: string;
  name: string;
  tableName: string;
  userId: string;
  fields: FieldDefinition[];
  searchFields?: SearchFieldConfig[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateEntityDefinitionDto {
  name: string;
  fields: FieldDefinition[];
}