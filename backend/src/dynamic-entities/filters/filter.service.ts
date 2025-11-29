import { Injectable, BadRequestException } from '@nestjs/common';
import { FieldType } from '../../types/entity-field.type';

export interface FilterCondition {
  field: string;
  operator: FilterOperator;
  value: any;
}

export enum FilterOperator {
  // String operators
  EQUALS = 'eq',           // name:eqJohn
  NOT_EQUALS = 'ne',       // name:neJohn
  LIKE = 'lk',             // name:lkJohn (contains)
  STARTS_WITH = 'sw',      // name:swJohn
  ENDS_WITH = 'ew',        // name:ewJohn
  
  // Number/Date operators
  LESS_THAN = 'lt',        // price:lt100
  LESS_THAN_EQUAL = 'lte', // price:lte100
  GREATER_THAN = 'gt',     // price:gt100
  GREATER_THAN_EQUAL = 'gte', // price:gte100
  
  // Array operators
  IN = 'in',               // status:in[active,pending]
  NOT_IN = 'nin',          // status:nin[inactive,deleted]
  
  // Boolean operators
  IS_TRUE = 'true',        // active:true
  IS_FALSE = 'false',      // active:false
  
  // Null operators
  IS_NULL = 'null',        // description:null
  IS_NOT_NULL = 'notnull', // description:notnull
}

@Injectable()
export class FilterService {
  /**
   * Parse filter query string into conditions
   * Format: field:operatorValue;field2:operatorValue2
   * Examples:
   * - name:lkTest - name LIKE '%Test%'
   * - price:lt200 - price < 200
   * - status:in[active,pending] - status IN ('active', 'pending')
   */
  parseFilters(filterQuery: string): FilterCondition[] {
    if (!filterQuery) {
      return [];
    }

    const conditions: FilterCondition[] = [];
    const filters = filterQuery.split(';');

    for (const filter of filters) {
      const condition = this.parseFilter(filter.trim());
      if (condition) {
        conditions.push(condition);
      }
    }

    return conditions;
  }

  private parseFilter(filter: string): FilterCondition | null {
    const colonIndex = filter.indexOf(':');
    if (colonIndex === -1) {
      throw new BadRequestException(`Invalid filter format: ${filter}. Expected format: field:operatorValue`);
    }

    const field = filter.substring(0, colonIndex);
    const operatorValue = filter.substring(colonIndex + 1);

    if (!field || !operatorValue) {
      throw new BadRequestException(`Invalid filter format: ${filter}`);
    }

    // Parse operator and value
    const { operator, value } = this.parseOperatorValue(operatorValue);

    return {
      field,
      operator,
      value,
    };
  }

  private parseOperatorValue(operatorValue: string): { operator: FilterOperator; value: any } {
    // Check for boolean operators first
    if (operatorValue === 'true') {
      return { operator: FilterOperator.IS_TRUE, value: true };
    }
    if (operatorValue === 'false') {
      return { operator: FilterOperator.IS_FALSE, value: false };
    }
    if (operatorValue === 'null') {
      return { operator: FilterOperator.IS_NULL, value: null };
    }
    if (operatorValue === 'notnull') {
      return { operator: FilterOperator.IS_NOT_NULL, value: null };
    }

    // Check for array operators (in/nin)
    if (operatorValue.startsWith('in[') && operatorValue.endsWith(']')) {
      const arrayValue = operatorValue.slice(3, -1);
      const values = arrayValue.split(',').map(v => v.trim());
      return { operator: FilterOperator.IN, value: values };
    }
    if (operatorValue.startsWith('nin[') && operatorValue.endsWith(']')) {
      const arrayValue = operatorValue.slice(4, -1);
      const values = arrayValue.split(',').map(v => v.trim());
      return { operator: FilterOperator.NOT_IN, value: values };
    }

    // Check for comparison operators (2-3 char operators first)
    const twoThreeCharOps = ['gte', 'lte', 'sw', 'ew', 'ne', 'lk'];
    for (const op of twoThreeCharOps) {
      if (operatorValue.startsWith(op)) {
        const value = operatorValue.substring(op.length);
        return { operator: op as FilterOperator, value: this.parseValue(value) };
      }
    }

    // Check for single char operators
    const singleCharOps = ['gt', 'lt', 'eq'];
    for (const op of singleCharOps) {
      if (operatorValue.startsWith(op)) {
        const value = operatorValue.substring(op.length);
        return { operator: op as FilterOperator, value: this.parseValue(value) };
      }
    }

    // Default to equals if no operator specified
    return { operator: FilterOperator.EQUALS, value: this.parseValue(operatorValue) };
  }

  private parseValue(value: string): any {
    // Try to parse as number
    if (!isNaN(Number(value)) && value.trim() !== '') {
      return Number(value);
    }

    // Try to parse as boolean
    if (value.toLowerCase() === 'true') return true;
    if (value.toLowerCase() === 'false') return false;

    // Try to parse as date (ISO format)
    if (value.match(/^\d{4}-\d{2}-\d{2}/) && !isNaN(Date.parse(value))) {
      return new Date(value);
    }

    // Return as string
    return value;
  }

  /**
   * Build Prisma where clause from filter conditions
   */
  buildWhereClause(conditions: FilterCondition[], fieldDefinitions: any[]): any {
    if (conditions.length === 0) {
      return {};
    }

    const whereConditions = conditions.map(condition => 
      this.buildConditionClause(condition, fieldDefinitions)
    );

    return {
      AND: whereConditions,
    };
  }

  private buildConditionClause(condition: FilterCondition, fieldDefinitions: any[]): any {
    const { field, operator, value } = condition;
    
    // Find field definition to understand the field type
    const fieldDef = fieldDefinitions.find(f => f.name === field);
    const fieldType = fieldDef?.type || FieldType.STRING;

    // Build the JSON path for the field in the data column
    const jsonPath = `$.${field}`;

    switch (operator) {
      case FilterOperator.EQUALS:
        return { data: { path: [field], equals: value } };

      case FilterOperator.NOT_EQUALS:
        return { 
          NOT: { data: { path: [field], equals: value } }
        };

      case FilterOperator.LIKE:
        if (fieldType === FieldType.STRING) {
          return {
            data: {
              path: [field],
              string_contains: value,
              mode: 'insensitive'
            }
          };
        }
        throw new BadRequestException(`LIKE operator not supported for field type: ${fieldType}`);

      case FilterOperator.STARTS_WITH:
        if (fieldType === FieldType.STRING) {
          return {
            data: {
              path: [field],
              string_starts_with: value,
              mode: 'insensitive'
            }
          };
        }
        throw new BadRequestException(`STARTS_WITH operator not supported for field type: ${fieldType}`);

      case FilterOperator.ENDS_WITH:
        if (fieldType === FieldType.STRING) {
          return {
            data: {
              path: [field],
              string_ends_with: value,
              mode: 'insensitive'
            }
          };
        }
        throw new BadRequestException(`ENDS_WITH operator not supported for field type: ${fieldType}`);

      case FilterOperator.GREATER_THAN:
        return { data: { path: [field], gt: value } };

      case FilterOperator.GREATER_THAN_EQUAL:
        return { data: { path: [field], gte: value } };

      case FilterOperator.LESS_THAN:
        return { data: { path: [field], lt: value } };

      case FilterOperator.LESS_THAN_EQUAL:
        return { data: { path: [field], lte: value } };

      case FilterOperator.IN:
        return {
          OR: value.map((v: any) => ({ data: { path: [field], equals: v } }))
        };

      case FilterOperator.NOT_IN:
        return {
          AND: value.map((v: any) => ({ 
            NOT: { data: { path: [field], equals: v } }
          }))
        };

      case FilterOperator.IS_TRUE:
        return { data: { path: [field], equals: true } };

      case FilterOperator.IS_FALSE:
        return { data: { path: [field], equals: false } };

      case FilterOperator.IS_NULL:
        return {
          OR: [
            { data: { path: [field], equals: null } },
            { data: { path: [field], equals: undefined } },
            { 
              NOT: { 
                data: { 
                  path: [field] 
                } 
              } 
            }
          ]
        };

      case FilterOperator.IS_NOT_NULL:
        return {
          AND: [
            { data: { path: [field] } },
            { NOT: { data: { path: [field], equals: null } } },
            { NOT: { data: { path: [field], equals: undefined } } }
          ]
        };

      default:
        throw new BadRequestException(`Unsupported operator: ${operator}`);
    }
  }

  /**
   * Validate filters against field definitions
   */
  validateFilters(conditions: FilterCondition[], fieldDefinitions: any[]): void {
    for (const condition of conditions) {
      const fieldDef = fieldDefinitions.find(f => f.name === condition.field);
      
      if (!fieldDef) {
        throw new BadRequestException(`Unknown field: ${condition.field}`);
      }

      this.validateOperatorForFieldType(condition.operator, fieldDef.type, condition.field);
    }
  }

  private validateOperatorForFieldType(operator: FilterOperator, fieldType: FieldType, fieldName: string): void {
    const stringOps = [
      FilterOperator.EQUALS, FilterOperator.NOT_EQUALS, FilterOperator.LIKE,
      FilterOperator.STARTS_WITH, FilterOperator.ENDS_WITH, FilterOperator.IN,
      FilterOperator.NOT_IN, FilterOperator.IS_NULL, FilterOperator.IS_NOT_NULL
    ];

    const numberOps = [
      FilterOperator.EQUALS, FilterOperator.NOT_EQUALS, FilterOperator.GREATER_THAN,
      FilterOperator.GREATER_THAN_EQUAL, FilterOperator.LESS_THAN, FilterOperator.LESS_THAN_EQUAL,
      FilterOperator.IN, FilterOperator.NOT_IN, FilterOperator.IS_NULL, FilterOperator.IS_NOT_NULL
    ];

    const booleanOps = [
      FilterOperator.EQUALS, FilterOperator.NOT_EQUALS, FilterOperator.IS_TRUE,
      FilterOperator.IS_FALSE, FilterOperator.IS_NULL, FilterOperator.IS_NOT_NULL
    ];

    const dateOps = numberOps; // Same as number operations

    switch (fieldType) {
      case FieldType.STRING:
      case FieldType.EMAIL:
      case FieldType.URL:
        if (!stringOps.includes(operator)) {
          throw new BadRequestException(`Operator ${operator} not supported for string field: ${fieldName}`);
        }
        break;

      case FieldType.NUMBER:
        if (!numberOps.includes(operator)) {
          throw new BadRequestException(`Operator ${operator} not supported for number field: ${fieldName}`);
        }
        break;

      case FieldType.BOOLEAN:
        if (!booleanOps.includes(operator)) {
          throw new BadRequestException(`Operator ${operator} not supported for boolean field: ${fieldName}`);
        }
        break;

      case FieldType.DATE:
        if (!dateOps.includes(operator)) {
          throw new BadRequestException(`Operator ${operator} not supported for date field: ${fieldName}`);
        }
        break;

      default:
        throw new BadRequestException(`Unknown field type: ${fieldType} for field: ${fieldName}`);
    }
  }
}