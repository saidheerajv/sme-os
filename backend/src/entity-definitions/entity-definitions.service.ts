import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ValidationService } from '../validation/validation.service';
import { CreateEntityDefinitionDto } from './dto/create-entity-definition.dto';
import { UpdateEntityDefinitionDto } from './dto/update-entity-definition.dto';
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

  async update(userId: string, name: string, dto: UpdateEntityDefinitionDto): Promise<EntityDefinition> {
    // Verify entity exists and user owns it
    const entity = await this.findOne(userId, name);

    // Update entity definition
    const updatedEntity = await this.prisma.entityDefinition.update({
      where: { id: entity.id },
      data: {
        fields: dto.fields as any,
      },
    });

    // Regenerate and cache validation schema
    if (dto.fields) {
      const schema = this.validationService.generateSchema(dto.fields);
      this.validationService.cacheSchema(name, schema);
    }

    return updatedEntity;
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