export const FieldType = {
  STRING: 'string',
  NUMBER: 'number',
  BOOLEAN: 'boolean',
  EMAIL: 'email',
  DATE: 'date',
  DATETIME: 'datetime',
  TIME: 'time',
  URL: 'url',
  DROPDOWN: 'dropdown',
} as const;

export type FieldType = typeof FieldType[keyof typeof FieldType];

export interface DataTableConfig {

}


export interface SearchFieldConfig {

  fieldName:string,
  operator:string

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
  
  // Dropdown options
  options?: DropdownOption[];
  
  // Default value
  defaultValue?: any;
  enableSearch?: boolean;
  
  // Form layout - span 1-4 columns (default: 2)
  span?: 1 | 2 | 3 | 4;
}

export const UIComponentType = {
  DATATABLE: 'datatable',
  KANBAN: 'kanban',
} as const;

export type UIComponentType = typeof UIComponentType[keyof typeof UIComponentType];

export interface KanbanConfig {
  groupByField: string;
  titleField: string;
  descriptionField?: string;
}

export type UIConfig = KanbanConfig;

export interface EntityDefinition {
  id: string;
  name: string;
  tableName: string;
  organizationId: string;
  fields: FieldDefinition[];
  uiComponent?: UIComponentType;
  uiConfig?: UIConfig;
  searchFields?: SearchFieldConfig[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateEntityDefinitionDto {
  name: string;
  fields: FieldDefinition[];
  uiComponent?: UIComponentType;
  uiConfig?: UIConfig;
}