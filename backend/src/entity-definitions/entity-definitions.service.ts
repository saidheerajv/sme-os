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

  async create(organizationId: string, dto: CreateEntityDefinitionDto): Promise<EntityDefinition> {
    // Check if entity name already exists in this organization
    const existing = await this.prisma.entityDefinition.findFirst({
      where: { 
        name: dto.name,
        organizationId,
      },
    });

    if (existing) {
      throw new ConflictException(`Entity with name "${dto.name}" already exists in this organization`);
    }

    // Convert name to table name (lowercase, snake_case)
    const tableName = dto.name.toLowerCase().replace(/\s+/g, '_');

    // Create entity definition
    const entityDefinition = await this.prisma.entityDefinition.create({
      data: {
        name: dto.name,
        tableName,
        organizationId,
        fields: dto.fields as any,
      },
    });

    // Generate and cache validation schema with org context
    const schema = this.validationService.generateSchema(dto.fields);
    this.validationService.cacheSchema(`${organizationId}:${dto.name}`, schema);

    return entityDefinition;
  }

  async findAll(organizationId: string): Promise<EntityDefinition[]> {
    return this.prisma.entityDefinition.findMany({
      where: { organizationId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(organizationId: string, name: string): Promise<EntityDefinition> {
    const entity = await this.prisma.entityDefinition.findFirst({
      where: { name, organizationId },
    });

    if (!entity) {
      throw new NotFoundException(`Entity "${name}" not found`);
    }

    return entity;
  }

  async update(organizationId: string, name: string, dto: UpdateEntityDefinitionDto): Promise<EntityDefinition> {
    // Verify entity exists and belongs to organization
    const entity = await this.findOne(organizationId, name);

    // Update entity definition
    const updatedEntity = await this.prisma.entityDefinition.update({
      where: { id: entity.id },
      data: {
        fields: dto.fields as any,
      },
    });

    // Regenerate and cache validation schema with org context
    if (dto.fields) {
      const schema = this.validationService.generateSchema(dto.fields);
      this.validationService.cacheSchema(`${organizationId}:${name}`, schema);
    }

    return updatedEntity;
  }

  async delete(organizationId: string, name: string): Promise<void> {
    const entity = await this.findOne(organizationId, name);

    // Delete all dynamic entities of this type in this organization
    await this.prisma.dynamicEntity.deleteMany({
      where: { entityType: name, organizationId },
    });

    // Delete entity definition
    await this.prisma.entityDefinition.delete({
      where: { id: entity.id },
    });

    // Clear validation cache with org context
    this.validationService.clearCache(`${organizationId}:${name}`);
  }

  async loadAllSchemasToCache(): Promise<void> {
    const definitions = await this.prisma.entityDefinition.findMany();
    
    definitions.forEach((def) => {
      const schema = this.validationService.generateSchema(def.fields as any);
      // Cache with organization context
      this.validationService.cacheSchema(`${def.organizationId}:${def.name}`, schema);
    });
  }
}