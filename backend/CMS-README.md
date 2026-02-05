# Building Dynamic Entity System with NestJS & Prisma

Complete guide to create runtime entities with automatic CRUD APIs, validation, and multi-tenant organization architecture.

## Architecture Overview

This system uses a **multi-tenant organization-based architecture** where:
- Users can create and join multiple organizations
- Each organization has its own entities and data (complete isolation)
- Users have roles within organizations (owner, admin, member)
- Entity definitions and data are scoped to organizations, not individual users

### Key Concepts

**Organization**: A workspace that groups users and their entities together
- Has multiple members with different roles
- Owns entity definitions and all entity data
- Provides data isolation between different organizations

**User**: Individual account that can belong to multiple organizations
- Can have different roles in different organizations
- Access is controlled through organization membership

**Roles**:
- `owner`: Full control, can manage members and organization settings
- `admin`: Can manage entities and data, invite members
- `member`: Can create and manage entity data

**Organization Context**: All entity operations require specifying which organization to operate on via the `x-organization-id` header.

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
  password  String
  name      String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  organizationMembers OrganizationMember[]
}

model Organization {
  id          String   @id @default(uuid())
  name        String
  slug        String   @unique // URL-friendly identifier
  description String?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  members           OrganizationMember[]
  entityDefinitions EntityDefinition[]
  dynamicEntities   DynamicEntity[]
  
  @@index([slug])
}

model OrganizationMember {
  id             String   @id @default(uuid())
  userId         String
  organizationId String
  role           String   // 'owner', 'admin', 'member'
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt
  
  user         User         @relation(fields: [userId], references: [id], onDelete: Cascade)
  organization Organization @relation(fields: [organizationId], references: [id], onDelete: Cascade)
  
  @@unique([userId, organizationId])
  @@index([userId])
  @@index([organizationId])
}

model EntityDefinition {
  id             String   @id @default(uuid())
  name           String   // e.g., "Product", "Customer"
  tableName      String   // e.g., "product", "customer"
  organizationId String
  organization   Organization @relation(fields: [organizationId], references: [id], onDelete: Cascade)
  fields         Json     // Field definitions
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt
  
  @@unique([name, organizationId])
  @@index([organizationId])
}

model DynamicEntity {
  id             String   @id @default(uuid())
  entityType     String   // References EntityDefinition.name
  organizationId String
  organization   Organization @relation(fields: [organizationId], references: [id], onDelete: Cascade)
  data           Json     // Actual entity data
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt
  
  @@index([entityType, organizationId])
  @@index([organizationId])
}
```

**Key Changes from User-Based to Organization-Based:**
- Added `Organization` model as the main tenant
- Added `OrganizationMember` as a join table for many-to-many relationship between users and organizations
- `EntityDefinition` now references `organizationId` instead of `userId`
- `DynamicEntity` now references `organizationId` instead of `userId`
- Entity names are unique per organization (not globally)
- All data is scoped to organizations for complete multi-tenancy
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

  validatePartialData(schema: ZodSchema, data: unknown): any {
    return schema.partial().parse(data);
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

## Phase 4: Organization Module

The organization module provides multi-tenant capabilities, allowing users to create and manage organizations where entities are scoped.

### Step 8a: Create Organization Module

```bash
nest g module organizations
nest g service organizations
nest g controller organizations
```

### Step 8b: Create Organization Service

Create `src/organizations/organizations.service.ts` - This service handles:
- Creating organizations (user becomes owner)
- Managing organization members
- Checking user permissions within organizations
- Organization CRUD operations

Key methods:
- `create()`: Create organization with user as owner
- `findAllForUser()`: Get all organizations for a user
- `inviteMember()`: Add users to organization
- `checkUserRole()`: Verify user permissions
- `getUserRole()`: Get user's role in organization

### Step 8c: Create DTOs

**CreateOrganizationDto**: Validates organization creation
```typescript
- name: string (3-100 chars)
- slug: string (unique, URL-friendly, 3-50 chars)
- description?: string (optional, max 500 chars)
```

**InviteMemberDto**: Validates member invitations
```typescript
- email: string (user email)
- role: 'admin' | 'member'
```

### Step 8d: Create Organization Guard

Create `src/organizations/guards/organization.guard.ts`:

The OrganizationGuard:
1. Checks if user is authenticated
2. Extracts `x-organization-id` from request header
3. Verifies user is a member of that organization
4. Attaches organization context to request

Usage: Apply to routes that need organization scope.

### Step 8e: Create Organization Decorator

Create `src/organizations/decorators/current-organization.decorator.ts`:

```typescript
@CurrentOrganization() org: { id: string, role: string }
```

Extracts organization context attached by OrganizationGuard.

## Phase 5: Entity Definition Module

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

## Phase 5: Dynamic Entity CRUD with Query Features

### Step 9: Create Dynamic Entity Module

```bash
nest g module dynamic-entities
nest g service dynamic-entities
nest g controller dynamic-entities
```

### Step 9a: Create DTOs

Create `src/dynamic-entities/dto/entity-query.dto.ts`:

```typescript
import { IsOptional, IsString, IsInt, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

export class EntityQueryDto {
  @IsOptional()
  @IsString()
  search?: string; // Filter string: field:operatorValue;field2:operatorValue2

  @IsOptional()
  @IsString()
  sort?: string; // Sort field and direction: field:asc or field:desc

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1; // Page number for pagination

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 50; // Items per page

  @IsOptional()
  @IsString()
  select?: string; // Comma-separated list of fields to return
}
```

### Step 9b: Create Query Service

Create `src/dynamic-entities/services/query.service.ts`:

```typescript
import { Injectable, BadRequestException } from '@nestjs/common';
import { FilterService } from '../filters/filter.service';
import { EntityQueryDto } from '../dto/entity-query.dto';

@Injectable()
export class QueryService {
  constructor(private readonly filterService: FilterService) {}

  parseQuery(query: EntityQueryDto, fieldDefinitions: any[]) {
    const options: any = {};

    // Parse filters
    if (query.search) {
      const conditions = this.filterService.parseFilters(query.search);
      this.filterService.validateFilters(conditions, fieldDefinitions);
      options.filters = this.filterService.buildWhereClause(conditions, fieldDefinitions);
    }

    // Parse sorting
    if (query.sort) {
      const [field, direction] = query.sort.split(':');
      if (!['asc', 'desc'].includes(direction?.toLowerCase())) {
        throw new BadRequestException('Invalid sort direction. Use "asc" or "desc"');
      }
      options.sort = { field, direction: direction.toLowerCase() };
    }

    // Parse pagination
    if (query.page || query.limit) {
      const page = Math.max(1, query.page || 1);
      const limit = Math.min(Math.max(1, query.limit || 50), 100);
      options.pagination = {
        page,
        limit,
        offset: (page - 1) * limit,
      };
    }

    // Parse field selection
    if (query.select) {
      options.select = query.select.split(',').map(f => f.trim());
    }

    return options;
  }

  buildPrismaQuery(userId: string, entityType: string, options: any) {
    const query: any = {
      where: {
        entityType,
        userId,
        ...options.filters,
      },
    };

    // Add sorting
    if (options.sort) {
      query.orderBy = {
        data: {
          path: [options.sort.field],
          sort: options.sort.direction,
        },
      };
    } else {
      query.orderBy = { createdAt: 'desc' };
    }

    // Add pagination
    if (options.pagination) {
      query.skip = options.pagination.offset;
      query.take = options.pagination.limit;
    }

    return query;
  }

  buildPaginationMeta(total: number, pagination?: any) {
    if (!pagination) {
      return { total, hasMore: false };
    }

    const totalPages = Math.ceil(total / pagination.limit);
    return {
      total,
      page: pagination.page,
      limit: pagination.limit,
      totalPages,
      hasNextPage: pagination.page < totalPages,
      hasPrevPage: pagination.page > 1,
    };
  }

  filterSelectedFields(entities: any[], selectFields?: string[]) {
    if (!selectFields?.length) return entities;

    return entities.map(entity => ({
      ...entity,
      data: selectFields.reduce((acc, field) => {
        if (entity.data?.hasOwnProperty(field)) {
          acc[field] = entity.data[field];
        }
        return acc;
      }, {}),
    }));
  }
}
```

### Step 9c: Create Filter Service

Create `src/dynamic-entities/filters/filter.service.ts` to handle filtering logic. See `FILTER_API_DOCS.md` for complete implementation details.

### Step 9d: Update Service with Query Features

Edit `src/dynamic-entities/dynamic-entities.service.ts`:

```typescript
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ValidationService } from '../validation/validation.service';
import { EntityDefinitionsService } from '../entity-definitions/entity-definitions.service';
import { QueryService } from './services/query.service';
import { EntityQueryDto } from './dto/entity-query.dto';

@Injectable()
export class DynamicEntitiesService {
  constructor(
    private prisma: PrismaService,
    private validationService: ValidationService,
    private entityDefinitionsService: EntityDefinitionsService,
    private queryService: QueryService,
  ) {}

  async create(userId: string, entityType: string, data: unknown): Promise<any> {
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

  async findAll(userId: string, entityType: string, query?: EntityQueryDto): Promise<any> {
    // Verify entity definition exists and get field definitions
    const entityDefinition = await this.entityDefinitionsService.findOne(userId, entityType);
    const fieldDefinitions = entityDefinition.fields as any[];

    // Parse query options
    const options = query ? this.queryService.parseQuery(query, fieldDefinitions) : {};

    // Build Prisma query
    const prismaQuery = this.queryService.buildPrismaQuery(userId, entityType, options);

    // Execute query
    const entities = await this.prisma.dynamicEntity.findMany(prismaQuery);

    // Filter selected fields if specified
    const filteredEntities = this.queryService.filterSelectedFields(entities, options.select);

    // If pagination is requested, also get total count
    if (options.pagination) {
      const total = await this.prisma.dynamicEntity.count({
        where: prismaQuery.where,
      });
      return {
        data: filteredEntities,
        meta: this.queryService.buildPaginationMeta(total, options.pagination),
      };
    }

    return {
      data: filteredEntities,
      meta: this.queryService.buildPaginationMeta(filteredEntities.length),
    };
  }

  async findOne(userId: string, entityType: string, id: string): Promise<any> {
    const entity = await this.prisma.dynamicEntity.findFirst({
      where: { id, entityType, userId },
    });

    if (!entity) {
      throw new NotFoundException(`Entity not found`);
    }

    return entity;
  }

  async update(userId: string, entityType: string, id: string, data: unknown): Promise<any> {
    // Verify entity exists
    await this.findOne(userId, entityType, id);

    // Get validation schema
    const schema = this.validationService.getSchema(entityType);
    if (!schema) {
      throw new BadRequestException('Validation schema not found');
    }

    // Validate data (partial update)
    const validatedData = this.validationService.validatePartialData(schema, data);

    // Update entity
    return this.prisma.dynamicEntity.update({
      where: { id },
      data: { data: validatedData },
    });
  }

  async delete(userId: string, entityType: string, id: string): Promise<any> {
    // Verify entity exists
    await this.findOne(userId, entityType, id);

    await this.prisma.dynamicEntity.delete({
      where: { id },
    });
  }
}
```

### Step 9e: Update Controller with Query Parameters

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
  Query,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { DynamicEntitiesService } from './dynamic-entities.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { EntityQueryDto } from './dto/entity-query.dto';

@Controller('entities/:entityType')
@UseGuards(JwtAuthGuard)
export class DynamicEntitiesController {
  constructor(private readonly service: DynamicEntitiesService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @CurrentUser() user: any,
    @Param('entityType') entityType: string,
    @Body() data: unknown,
  ) {
    return this.service.create(user.id, entityType, data);
  }

  @Get()
  async findAll(
    @CurrentUser() user: any,
    @Param('entityType') entityType: string,
    @Query() query: EntityQueryDto,
  ) {
    return this.service.findAll(user.id, entityType, query);
  }

  @Get(':id')
  async findOne(
    @CurrentUser() user: any,
    @Param('entityType') entityType: string,
    @Param('id') id: string,
  ) {
    return this.service.findOne(user.id, entityType, id);
  }

  @Put(':id')
  async update(
    @CurrentUser() user: any,
    @Param('entityType') entityType: string,
    @Param('id') id: string,
    @Body() data: unknown,
  ) {
    return this.service.update(user.id, entityType, id, data);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(
    @CurrentUser() user: any,
    @Param('entityType') entityType: string,
    @Param('id') id: string,
  ) {
    await this.service.delete(user.id, entityType, id);
  }
}
```

### Step 9f: Update Module

Edit `src/dynamic-entities/dynamic-entities.module.ts`:

```typescript
import { Module } from '@nestjs/common';
import { DynamicEntitiesController } from './dynamic-entities.controller';
import { DynamicEntitiesService } from './dynamic-entities.service';
import { EntityDefinitionsModule } from '../entity-definitions/entity-definitions.module';
import { ValidationModule } from '../validation/validation.module';
import { QueryService } from './services/query.service';
import { FilterService } from './filters/filter.service';

@Module({
  imports: [EntityDefinitionsModule, ValidationModule],
  controllers: [DynamicEntitiesController],
  providers: [DynamicEntitiesService, QueryService, FilterService],
})
export class DynamicEntitiesModule {}
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

### Important: Organization Context

**All entity and entity-definition requests require the `x-organization-id` header.**

Format:
```
x-organization-id: <organization-uuid>
```

After signup/login, you'll receive an organization ID. Use it in all subsequent requests to specify which organization's data you want to access.

### Step 12: Test API Endpoints

**1. Register a User:**

When you register, a default organization is automatically created for you.

```bash
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "SecurePass123!",
    "name": "Test User"
  }'
```

Response includes:
```json
{
  "user": {...},
  "defaultOrganization": {
    "id": "org-uuid-here",
    "name": "Test User's Organization",
    "slug": "test-org-..."
  },
  "accessToken": "jwt-token-here"
}
```

**Save both the `accessToken` and `defaultOrganization.id` for subsequent requests.**

**2. Login:**

```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "SecurePass123!"
  }'
```

Save the returned `access_token` for subsequent requests.

**3. Get Your Organizations:**

```bash
curl http://localhost:3000/organizations \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

**4. Create Entity Definition:**

**Note: Now requires `x-organization-id` header!**

```bash
curl -X POST http://localhost:3000/entity-definitions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "x-organization-id: YOUR_ORG_ID" \
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
        "name": "category",
        "type": "string",
        "required": true
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

**5. Get All Entity Definitions:**

```bash
curl http://localhost:3000/entity-definitions \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "x-organization-id: YOUR_ORG_ID"
```

**6. Create Dynamic Entities (Products):**

```bash
# Product 1
curl -X POST http://localhost:3000/entities/Product \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "x-organization-id: YOUR_ORG_ID" \
  -d '{
    "title": "MacBook Pro",
    "price": 1299.99,
    "category": "laptops",
    "description": "High-performance laptop",
    "inStock": true
  }'

# Product 2
curl -X POST http://localhost:3000/entities/Product \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "x-organization-id: YOUR_ORG_ID" \
  -d '{
    "title": "Dell Laptop",
    "price": 799.99,
    "category": "laptops",
    "description": "Budget-friendly laptop",
    "inStock": true
  }'

# Product 3
curl -X POST http://localhost:3000/entities/Product \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "x-organization-id: YOUR_ORG_ID" \
  -d '{
    "title": "iPad Pro",
    "price": 899.99,
    "category": "tablets",
    "description": "Professional tablet",
    "inStock": false
  }'
```

**7. Test Validation (Should Fail):**

```bash
curl -X POST http://localhost:3000/entities/Product \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "x-organization-id: YOUR_ORG_ID" \
  -d '{
    "title": "AB",
    "price": -5,
    "inStock": true
  }'
```

**8. Get All Products (Basic):**

```bash
curl http://localhost:3000/entities/Product \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "x-organization-id: YOUR_ORG_ID"
```

**9. Test Filtering:**

```bash
# Products with "laptop" in title
curl "http://localhost:3000/entities/Product?search=title:lklaptop" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "x-organization-id: YOUR_ORG_ID"

# Products under $1000
curl "http://localhost:3000/entities/Product?search=price:lt1000" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "x-organization-id: YOUR_ORG_ID"

# In-stock products only
curl "http://localhost:3000/entities/Product?search=inStock:true" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "x-organization-id: YOUR_ORG_ID"

# Complex: In-stock laptops under $1000
curl "http://localhost:3000/entities/Product?search=title:lklaptop;price:lt1000;inStock:true" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "x-organization-id: YOUR_ORG_ID"
```

**10. Test Pagination:**

```bash
# Get first 10 products
curl "http://localhost:3000/entities/Product?page=1&limit=10" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "x-organization-id: YOUR_ORG_ID"

# Get second page
curl "http://localhost:3000/entities/Product?page=2&limit=10" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "x-organization-id: YOUR_ORG_ID"
```

**11. Test Sorting:**

```bash
# Sort by price ascending
curl "http://localhost:3000/entities/Product?sort=price:asc" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "x-organization-id: YOUR_ORG_ID"

# Sort by title descending
curl "http://localhost:3000/entities/Product?sort=title:desc" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "x-organization-id: YOUR_ORG_ID"
```

**12. Test Field Selection:**

```bash
# Return only title and price
curl "http://localhost:3000/entities/Product?select=title,price" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "x-organization-id: YOUR_ORG_ID"
```

**13. Test Combined Query:**

```bash
# Complex query: In-stock laptops, under $1500, sorted by price, showing only title and price, first 10 results
curl "http://localhost:3000/entities/Product?search=title:lklaptop;inStock:true;price:lt1500&sort=price:asc&select=title,price&page=1&limit=10" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "x-organization-id: YOUR_ORG_ID"
```

**14. Update Product:**

```bash
curl -X PUT http://localhost:3000/entities/Product/{id} \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "x-organization-id: YOUR_ORG_ID" \
  -d '{
    "price": 1199.99,
    "inStock": false
  }'
```

**15. Delete Product:**

```bash
curl -X DELETE http://localhost:3000/entities/Product/{id} \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "x-organization-id: YOUR_ORG_ID"
```

### Organization Management Examples

**Create a new organization:**

```bash
curl -X POST http://localhost:3000/organizations \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{
    "name": "My Company",
    "slug": "my-company",
    "description": "Company workspace"
  }'
```

**Invite a member to organization:**

```bash
curl -X POST http://localhost:3000/organizations/{ORG_ID}/members \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{
    "email": "colleague@example.com",
    "role": "admin"
  }'
```

**List organization members:**

```bash
curl http://localhost:3000/organizations/{ORG_ID}/members \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

## Summary

You now have a fully functional dynamic entity system with:

✅ Runtime entity creation
✅ Automatic validation based on field definitions
✅ Complete CRUD APIs for dynamic entities
✅ Proper error handling
✅ Type-safe validation with Zod
✅ PostgreSQL with Prisma ORM

## Phase 8: Advanced Query Features

### Filtering System

The system includes a comprehensive filtering system that supports multiple operators for different field types.

#### Supported Features:
- **String Operations**: `eq`, `ne`, `lk` (like/contains), `sw` (starts with), `ew` (ends with)
- **Number/Date Operations**: `lt`, `lte`, `gt`, `gte`
- **Array Operations**: `in`, `nin` (not in)
- **Boolean Operations**: `true`, `false`
- **Null Checks**: `null`, `notnull`

#### Filter Syntax

Filters are specified using the `search` query parameter with the format:
```
field:operatorValue;field2:operatorValue2
```

#### Examples:

**Simple filtering:**
```bash
# Products with name containing "laptop"
GET /entities/Product?search=name:lklaptop

# Products with price less than 1000
GET /entities/Product?search=price:lt1000

# Active products
GET /entities/Product?search=inStock:true
```

**Complex filtering (multiple conditions):**
```bash
# Active laptops under $1500
GET /entities/Product?search=title:lklaptop;price:lt1500;inStock:true

# Products in specific price range
GET /entities/Product?search=price:gte100;price:lte500
```

📖 **See [FILTER_API_DOCS.md](./FILTER_API_DOCS.md) for complete filtering documentation.**

### Pagination

The API supports pagination with metadata to help build user interfaces.

#### Query Parameters:
- `page`: Page number (default: 1, min: 1)
- `limit`: Items per page (default: 50, min: 1, max: 100)

#### Example:
```bash
# Get first 10 products
GET /entities/Product?page=1&limit=10

# Get second page
GET /entities/Product?page=2&limit=10
```

#### Response Format:
```json
{
  "data": [
    {
      "id": "uuid",
      "entityType": "Product",
      "userId": "user-id",
      "data": {
        "title": "Laptop",
        "price": 999.99,
        "description": "High-performance laptop",
        "inStock": true
      },
      "createdAt": "2024-01-01T00:00:00Z",
      "updatedAt": "2024-01-01T00:00:00Z"
    }
  ],
  "meta": {
    "total": 150,
    "page": 1,
    "limit": 10,
    "totalPages": 15,
    "hasNextPage": true,
    "hasPrevPage": false
  }
}
```

### Sorting

Sort results by any field in ascending or descending order.

#### Syntax:
```
sort=field:direction
```

#### Examples:
```bash
# Sort by price ascending
GET /entities/Product?sort=price:asc

# Sort by title descending
GET /entities/Product?sort=title:desc

# Combine with filters
GET /entities/Product?search=inStock:true&sort=price:asc
```

### Field Selection

Return only specific fields to reduce payload size and improve performance.

#### Syntax:
```
select=field1,field2,field3
```

#### Example:
```bash
# Return only title and price
GET /entities/Product?select=title,price

# Combine with filters and sorting
GET /entities/Product?search=inStock:true&sort=price:asc&select=title,price
```

### Complete Query Example

Combine all query features for powerful data retrieval:

```bash
# Get active products with "laptop" in title,
# priced between $500-$2000,
# sorted by price ascending,
# return only title and price,
# get first 20 results
GET /entities/Product?search=title:lklaptop;inStock:true;price:gte500;price:lte2000&sort=price:asc&select=title,price&page=1&limit=20
```

## Phase 9: API Reference

### Entity Definitions API

#### Create Entity Definition
```http
POST /entity-definitions
Content-Type: application/json

{
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
    }
  ]
}
```

#### Get All Entity Definitions
```http
GET /entity-definitions
```

#### Get One Entity Definition
```http
GET /entity-definitions/:name
```

#### Delete Entity Definition
```http
DELETE /entity-definitions/:name
```

### Dynamic Entities API

#### Create Entity
```http
POST /entities/:entityType
Content-Type: application/json

{
  "title": "Laptop",
  "price": 999.99
}
```

#### Get All Entities (with filters, pagination, sorting)
```http
GET /entities/:entityType?search=...&sort=...&page=1&limit=10&select=...
```

#### Get One Entity
```http
GET /entities/:entityType/:id
```

#### Update Entity (Partial)
```http
PUT /entities/:entityType/:id
Content-Type: application/json

{
  "price": 899.99
}
```

#### Delete Entity
```http
DELETE /entities/:entityType/:id
```

## Summary

You now have a fully functional **multi-tenant** dynamic entity system with:

✅ **Multi-Tenant Architecture**
  - Organization-based data isolation
  - Users can belong to multiple organizations
  - Role-based access control (owner, admin, member)
  - Automatic organization creation on signup

✅ **Core Features**
  - Runtime entity creation
  - Automatic validation based on field definitions
  - Complete CRUD APIs for dynamic entities
  - Type-safe validation with Zod
  - PostgreSQL with Prisma ORM

✅ **Advanced Query Features**
  - Advanced filtering with multiple operators (eq, ne, lk, sw, ew, lt, gt, in, nin, etc.)
  - Pagination with metadata (page, limit, totalPages, hasNextPage, hasPrevPage)
  - Sorting by any field (asc/desc)
  - Field selection for optimized responses
  - Complex combined queries

✅ **Security & Authentication**
  - JWT Authentication
  - Organization-scoped access control
  - Request-level organization context via headers
  - User-role validation

✅ **Data Management**
  - Organization-scoped entity definitions
  - Organization-scoped entity data
  - Complete data isolation between organizations
  - Member management (invite, remove, update roles)

**Architecture Highlights:**
- Each organization operates independently
- Entity names are unique per organization (not globally)
- All entity operations require organization context (`x-organization-id` header)
- Validation schemas are cached per organization
- Users can switch between organizations seamlessly

**Implemented Features:**
- ✅ Multi-tenant organizations
- ✅ Organization member management
- ✅ Role-based permissions
- ✅ JWT Authentication
- ✅ Pagination with metadata
- ✅ Advanced filtering system
- ✅ Sorting and field selection
- ✅ Complete data isolation

**Future Enhancements:**
1. Email invitations for organization members
2. Organization-level settings and customization
3. Field relationships (foreign keys between entities)
4. Indexing for performance optimization
5. Webhooks for entity events
6. File upload support
7. Bulk operations
8. Export/Import functionality
9. Activity logs and audit trails
10. Organization transfer and deletion workflows