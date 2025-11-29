# Building Dynamic Entity System with NestJS & Prisma

Complete guide to create runtime entities with automatic CRUD APIs and validation.

## Phase 1: Project Setup

### Step 1: Create NestJS Project

```bash
# Install NestJS CLI
npm i -g @nestjs/cli

# Create new project
nest new dynamic-entity-system
cd dynamic-entity-system

# Install required dependencies
npm install @prisma/client prisma zod
npm install --save-dev prisma

# Initialize Prisma
npx prisma init
```

### Step 2: Configure Database

Edit `.env`:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/dynamic_entities?schema=public"
```

### Step 3: Create Base Prisma Schema

Edit `prisma/schema.prisma`:

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id        String   @id @default(uuid())
  email     String   @unique
  name      String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  entityDefinitions EntityDefinition[]
  dynamicEntities   DynamicEntity[]
}

model EntityDefinition {
  id          String   @id @default(uuid())
  name        String   @unique // e.g., "Product", "Customer"
  tableName   String   @unique // e.g., "product", "customer"
  userId      String
  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  fields      Json     // Field definitions
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  @@index([userId])
}

model DynamicEntity {
  id         String   @id @default(uuid())
  entityType String   // References EntityDefinition.name
  userId     String
  user       User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  data       Json     // Actual entity data
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt
  
  @@index([entityType, userId])
  @@index([userId])
}
```

### Step 4: Run Initial Migration

```bash
npx prisma migrate dev --name init
npx prisma generate
```

## Phase 2: Core Services Setup

### Step 5: Create Prisma Service

```bash
nest g module prisma
nest g service prisma
```

Edit `src/prisma/prisma.service.ts`:

```typescript
import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
```

Edit `src/prisma/prisma.module.ts`:

```typescript
import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Global()
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}
```

### Step 6: Create DTOs and Types

Create `src/types/entity-field.type.ts`:

```typescript
export enum FieldType {
  STRING = 'string',
  NUMBER = 'number',
  BOOLEAN = 'boolean',
  EMAIL = 'email',
  DATE = 'date',
  URL = 'url',
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
  
  // Default value
  defaultValue?: any;
}

export interface EntityDefinitionData {
  name: string;
  fields: FieldDefinition[];
}
```

Create `src/entity-definitions/dto/create-entity-definition.dto.ts`:

```typescript
import { IsString, IsArray, ValidateNested, IsNotEmpty } from 'class-validator';
import { Type } from 'class-transformer';
import { FieldDefinition } from '../../types/entity-field.type';

export class CreateEntityDefinitionDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => Object)
  fields: FieldDefinition[];
}
```

## Phase 3: Validation Service

### Step 7: Create Validation Service

```bash
nest g module validation
nest g service validation
```

Edit `src/validation/validation.service.ts`:

```typescript
import { Injectable } from '@nestjs/common';
import { z, ZodSchema } from 'zod';
import { FieldDefinition, FieldType } from '../types/entity-field.type';

@Injectable()
export class ValidationService {
  private schemaCache = new Map<string, ZodSchema>();

  generateSchema(fields: FieldDefinition[]): ZodSchema {
    const shape: Record<string, any> = {};

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

  clearCache(entityType?: string): void {
    if (entityType) {
      this.schemaCache.delete(entityType);
    } else {
      this.schemaCache.clear();
    }
  }
}
```

## Phase 4: Entity Definition Module

### Step 8: Create Entity Definition Module

```bash
nest g module entity-definitions
nest g service entity-definitions
nest g controller entity-definitions
```

Edit `src/entity-definitions/entity-definitions.service.ts`:

```typescript
import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ValidationService } from '../validation/validation.service';
import { CreateEntityDefinitionDto } from './dto/create-entity-definition.dto';
import { EntityDefinition } from '@prisma/client';

@Injectable()
export class EntityDefinitionsService {
  constructor(
    private prisma: PrismaService,
    private validationService: ValidationService,
  ) {}

  async create(userId: string, dto: CreateEntityDefinitionDto): Promise<EntityDefinition> {
    // Check if entity name already exists
    const existing = await this.prisma.entityDefinition.findUnique({
      where: { name: dto.name },
    });

    if (existing) {
      throw new ConflictException(`Entity with name "${dto.name}" already exists`);
    }

    // Convert name to table name (lowercase, snake_case)
    const tableName = dto.name.toLowerCase().replace(/\s+/g, '_');

    // Create entity definition
    const entityDefinition = await this.prisma.entityDefinition.create({
      data: {
        name: dto.name,
        tableName,
        userId,
        fields: dto.fields as any,
      },
    });

    // Generate and cache validation schema
    const schema = this.validationService.generateSchema(dto.fields);
    this.validationService.cacheSchema(dto.name, schema);

    return entityDefinition;
  }

  async findAll(userId: string): Promise<EntityDefinition[]> {
    return this.prisma.entityDefinition.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(userId: string, name: string): Promise<EntityDefinition> {
    const entity = await this.prisma.entityDefinition.findFirst({
      where: { name, userId },
    });

    if (!entity) {
      throw new NotFoundException(`Entity "${name}" not found`);
    }

    return entity;
  }

  async delete(userId: string, name: string): Promise<void> {
    const entity = await this.findOne(userId, name);

    // Delete all dynamic entities of this type
    await this.prisma.dynamicEntity.deleteMany({
      where: { entityType: name, userId },
    });

    // Delete entity definition
    await this.prisma.entityDefinition.delete({
      where: { id: entity.id },
    });

    // Clear validation cache
    this.validationService.clearCache(name);
  }

  async loadAllSchemasToCache(): Promise<void> {
    const definitions = await this.prisma.entityDefinition.findMany();
    
    definitions.forEach((def) => {
      const schema = this.validationService.generateSchema(def.fields as any);
      this.validationService.cacheSchema(def.name, schema);
    });
  }
}
```

Edit `src/entity-definitions/entity-definitions.controller.ts`:

```typescript
import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { EntityDefinitionsService } from './entity-definitions.service';
import { CreateEntityDefinitionDto } from './dto/create-entity-definition.dto';

@Controller('entity-definitions')
export class EntityDefinitionsController {
  constructor(private readonly service: EntityDefinitionsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() dto: CreateEntityDefinitionDto) {
    // TODO: Get userId from JWT token/session
    const userId = 'test-user-id'; // Hardcoded for now
    
    return this.service.create(userId, dto);
  }

  @Get()
  async findAll() {
    const userId = 'test-user-id';
    return this.service.findAll(userId);
  }

  @Get(':name')
  async findOne(@Param('name') name: string) {
    const userId = 'test-user-id';
    return this.service.findOne(userId, name);
  }

  @Delete(':name')
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(@Param('name') name: string) {
    const userId = 'test-user-id';
    await this.service.delete(userId, name);
  }
}
```

## Phase 5: Dynamic Entity CRUD

### Step 9: Create Dynamic Entity Module

```bash
nest g module dynamic-entities
nest g service dynamic-entities
nest g controller dynamic-entities
```

Edit `src/dynamic-entities/dynamic-entities.service.ts`:

```typescript
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ValidationService } from '../validation/validation.service';
import { EntityDefinitionsService } from '../entity-definitions/entity-definitions.service';
import { DynamicEntity } from '@prisma/client';

@Injectable()
export class DynamicEntitiesService {
  constructor(
    private prisma: PrismaService,
    private validationService: ValidationService,
    private entityDefinitionsService: EntityDefinitionsService,
  ) {}

  async create(userId: string, entityType: string, data: unknown): Promise<DynamicEntity> {
    // Verify entity definition exists
    await this.entityDefinitionsService.findOne(userId, entityType);

    // Get validation schema
    const schema = this.validationService.getSchema(entityType);
    if (!schema) {
      throw new BadRequestException('Validation schema not found. Please restart the application.');
    }

    // Validate data
    const validatedData = this.validationService.validateData(schema, data);

    // Create entity
    return this.prisma.dynamicEntity.create({
      data: {
        entityType,
        userId,
        data: validatedData,
      },
    });
  }

  async findAll(userId: string, entityType: string): Promise<DynamicEntity[]> {
    // Verify entity definition exists
    await this.entityDefinitionsService.findOne(userId, entityType);

    return this.prisma.dynamicEntity.findMany({
      where: { entityType, userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(userId: string, entityType: string, id: string): Promise<DynamicEntity> {
    const entity = await this.prisma.dynamicEntity.findFirst({
      where: { id, entityType, userId },
    });

    if (!entity) {
      throw new NotFoundException(`Entity not found`);
    }

    return entity;
  }

  async update(userId: string, entityType: string, id: string, data: unknown): Promise<DynamicEntity> {
    // Verify entity exists
    await this.findOne(userId, entityType, id);

    // Get validation schema
    const schema = this.validationService.getSchema(entityType);
    if (!schema) {
      throw new BadRequestException('Validation schema not found');
    }

    // Validate data (partial update)
    const validatedData = this.validationService.validateData(schema.partial(), data);

    // Update entity
    return this.prisma.dynamicEntity.update({
      where: { id },
      data: { data: validatedData },
    });
  }

  async delete(userId: string, entityType: string, id: string): Promise<void> {
    // Verify entity exists
    await this.findOne(userId, entityType, id);

    await this.prisma.dynamicEntity.delete({
      where: { id },
    });
  }
}
```

Edit `src/dynamic-entities/dynamic-entities.controller.ts`:

```typescript
import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { DynamicEntitiesService } from './dynamic-entities.service';

@Controller('entities/:entityType')
export class DynamicEntitiesController {
  constructor(private readonly service: DynamicEntitiesService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Param('entityType') entityType: string,
    @Body() data: unknown,
  ) {
    const userId = 'test-user-id';
    return this.service.create(userId, entityType, data);
  }

  @Get()
  async findAll(@Param('entityType') entityType: string) {
    const userId = 'test-user-id';
    return this.service.findAll(userId, entityType);
  }

  @Get(':id')
  async findOne(
    @Param('entityType') entityType: string,
    @Param('id') id: string,
  ) {
    const userId = 'test-user-id';
    return this.service.findOne(userId, entityType, id);
  }

  @Put(':id')
  async update(
    @Param('entityType') entityType: string,
    @Param('id') id: string,
    @Body() data: unknown,
  ) {
    const userId = 'test-user-id';
    return this.service.update(userId, entityType, id, data);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(
    @Param('entityType') entityType: string,
    @Param('id') id: string,
  ) {
    const userId = 'test-user-id';
    await this.service.delete(userId, entityType, id);
  }
}
```

## Phase 6: Application Bootstrap

### Step 10: Update App Module

Edit `src/app.module.ts`:

```typescript
import { Module, OnModuleInit } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { ValidationModule } from './validation/validation.module';
import { EntityDefinitionsModule } from './entity-definitions/entity-definitions.module';
import { DynamicEntitiesModule } from './dynamic-entities/dynamic-entities.module';
import { EntityDefinitionsService } from './entity-definitions/entity-definitions.service';

@Module({
  imports: [
    PrismaModule,
    ValidationModule,
    EntityDefinitionsModule,
    DynamicEntitiesModule,
  ],
})
export class AppModule implements OnModuleInit {
  constructor(private entityDefinitionsService: EntityDefinitionsService) {}

  async onModuleInit() {
    // Load all entity schemas into cache on startup
    await this.entityDefinitionsService.loadAllSchemasToCache();
    console.log('✅ Entity validation schemas loaded');
  }
}
```

### Step 11: Add Global Exception Filter

Create `src/filters/zod-exception.filter.ts`:

```typescript
import { ExceptionFilter, Catch, ArgumentsHost, BadRequestException } from '@nestjs/common';
import { Response } from 'express';
import { ZodError } from 'zod';

@Catch(ZodError)
export class ZodExceptionFilter implements ExceptionFilter {
  catch(exception: ZodError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    const errors = exception.errors.map((err) => ({
      field: err.path.join('.'),
      message: err.message,
    }));

    response.status(400).json({
      statusCode: 400,
      message: 'Validation failed',
      errors,
    });
  }
}
```

Edit `src/main.ts`:

```typescript
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { ZodExceptionFilter } from './filters/zod-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    transform: true,
  }));
  
  app.useGlobalFilters(new ZodExceptionFilter());
  
  await app.listen(3000);
  console.log('🚀 Server running on http://localhost:3000');
}
bootstrap();
```

## Phase 7: Testing

### Step 12: Create Test User

First, create a test user manually:

```bash
npx prisma studio
```

Add a user with:
- id: `test-user-id`
- email: `test@example.com`
- name: `Test User`

### Step 13: Test API Endpoints

**1. Create Entity Definition:**

```bash
curl -X POST http://localhost:3000/entity-definitions \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Product",
    "fields": [
      {
        "name": "title",
        "type": "string",
        "required": true,
        "minLength": 3,
        "maxLength": 100
      },
      {
        "name": "price",
        "type": "number",
        "required": true,
        "min": 0
      },
      {
        "name": "description",
        "type": "string",
        "required": false
      },
      {
        "name": "inStock",
        "type": "boolean",
        "required": true
      }
    ]
  }'
```

**2. Get All Entity Definitions:**

```bash
curl http://localhost:3000/entity-definitions
```

**3. Create Dynamic Entity (Product):**

```bash
curl -X POST http://localhost:3000/entities/Product \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Laptop",
    "price": 999.99,
    "description": "High-performance laptop",
    "inStock": true
  }'
```

**4. Test Validation (Should Fail):**

```bash
curl -X POST http://localhost:3000/entities/Product \
  -H "Content-Type: application/json" \
  -d '{
    "title": "AB",
    "price": -5,
    "inStock": true
  }'
```

**5. Get All Products:**

```bash
curl http://localhost:3000/entities/Product
```

**6. Update Product:**

```bash
curl -X PUT http://localhost:3000/entities/Product/{id} \
  -H "Content-Type: application/json" \
  -d '{
    "price": 899.99
  }'
```

**7. Delete Product:**

```bash
curl -X DELETE http://localhost:3000/entities/Product/{id}
```

## Phase 8: Add Authentication (Optional)

### Step 14: Install Passport & JWT

```bash
npm install @nestjs/passport @nestjs/jwt passport passport-jwt bcrypt
npm install --save-dev @types/passport-jwt @types/bcrypt
```

Create authentication module and implement JWT strategy. Replace hardcoded `test-user-id` with actual user from JWT token.

## Summary

You now have a fully functional dynamic entity system with:

✅ Runtime entity creation
✅ Automatic validation based on field definitions
✅ Complete CRUD APIs for dynamic entities
✅ Proper error handling
✅ Type-safe validation with Zod
✅ PostgreSQL with Prisma ORM

**Next Steps:**
1. Add authentication (JWT)
2. Add pagination & filtering
3. Add field relationships (foreign keys)
4. Add indexing for performance
5. Add webhooks for entity events
6. Create admin UI for entity management