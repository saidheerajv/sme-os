import { Injectable } from '@nestjs/common';
import { z, ZodSchema } from 'zod';
import { FieldDefinition, FieldType } from '../types/entity-field.type';

@Injectable()
export class ValidationService {
  private schemaCache = new Map<string, ZodSchema>();

  generateSchema(fields: FieldDefinition[]): ZodSchema {
    const shape: any = {};

    fields.forEach((field) => {
      let fieldSchema: any;

      switch (field.type) {
        case FieldType.STRING:
          fieldSchema = z.string();
          if (field.minLength) fieldSchema = fieldSchema.min(field.minLength);
          if (field.maxLength) fieldSchema = fieldSchema.max(field.maxLength);
          if (field.pattern) fieldSchema = fieldSchema.regex(new RegExp(field.pattern));
          break;

        case FieldType.NUMBER:
          fieldSchema = z.number();
          if (field.min !== undefined) fieldSchema = fieldSchema.min(field.min);
          if (field.max !== undefined) fieldSchema = fieldSchema.max(field.max);
          break;

        case FieldType.BOOLEAN:
          fieldSchema = z.boolean();
          break;

        case FieldType.EMAIL:
          fieldSchema = z.string().email();
          break;

        case FieldType.DATE:
          fieldSchema = z.string().datetime().or(z.date());
          break;

        case FieldType.URL:
          fieldSchema = z.string().url();
          break;

        default:
          fieldSchema = z.any();
      }

      // Handle optional fields
      if (!field.required) {
        fieldSchema = fieldSchema.optional();
      }

      // Add default value
      if (field.defaultValue !== undefined) {
        fieldSchema = fieldSchema.default(field.defaultValue);
      }

      shape[field.name] = fieldSchema;
    });

    return z.object(shape);
  }

  cacheSchema(entityType: string, schema: ZodSchema): void {
    this.schemaCache.set(entityType, schema);
  }

  getSchema(entityType: string): ZodSchema | undefined {
    return this.schemaCache.get(entityType);
  }

  validateData(schema: ZodSchema, data: unknown): any {
    return schema.parse(data);
  }

  validatePartialData(schema: ZodSchema, data: unknown): any {
    // Convert the schema to partial for updates
    if ('partial' in schema && typeof schema.partial === 'function') {
      return schema.partial().parse(data);
    }
    // Fallback for schemas that don't support partial
    return schema.parse(data);
  }

  clearCache(entityType?: string): void {
    if (entityType) {
      this.schemaCache.delete(entityType);
    } else {
      this.schemaCache.clear();
    }
  }
}