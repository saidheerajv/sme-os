import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ValidationService } from '../validation/validation.service';
import { EntityDefinitionsService } from '../entity-definitions/entity-definitions.service';
import { QueryService } from './services/query.service';
import { EntityQueryDto } from './dto/entity-query.dto';
import { DynamicEntity } from '@prisma/client';

@Injectable()
export class DynamicEntitiesService {
  constructor(
    private prisma: PrismaService,
    private validationService: ValidationService,
    private entityDefinitionsService: EntityDefinitionsService,
    private queryService: QueryService,
  ) {}

  async create(organizationId: string, entityType: string, data: unknown): Promise<any> {
    // Verify entity definition exists
    await this.entityDefinitionsService.findOne(organizationId, entityType);

    // Get validation schema with org context
    const schema = this.validationService.getSchema(`${organizationId}:${entityType}`);
    if (!schema) {
      throw new BadRequestException('Validation schema not found. Please restart the application.');
    }

    // Validate data
    const validatedData = this.validationService.validateData(schema, data);

    // Create entity
    return this.prisma.dynamicEntity.create({
      data: {
        entityType,
        organizationId,
        data: validatedData,
      },
    });
  }

  async findAll(organizationId: string, entityType: string, query?: EntityQueryDto): Promise<any> {
    // Verify entity definition exists and get field definitions
    const entityDefinition = await this.entityDefinitionsService.findOne(organizationId, entityType);
    const fieldDefinitions = entityDefinition.fields as any[];

    // Parse query options
    const options = query ? this.queryService.parseQuery(query, fieldDefinitions) : {};

    // Build Prisma query
    const prismaQuery = this.queryService.buildPrismaQuery(organizationId, entityType, options);

    // Execute query
    const entities = await this.prisma.dynamicEntity.findMany(prismaQuery);

    // Filter selected fields if specified
    const filteredEntities = this.queryService.filterSelectedFields(entities, options.select);

    // If pagination is requested, also get total count
    if (options.pagination) {
      const totalQuery = {
        where: prismaQuery.where,
      };
      const total = await this.prisma.dynamicEntity.count(totalQuery);
      const paginationMeta = this.queryService.buildPaginationMeta(total, options.pagination);

      return {
        data: filteredEntities,
        meta: paginationMeta,
      };
    }

    return {
      data: filteredEntities,
      meta: this.queryService.buildPaginationMeta(filteredEntities.length),
    };
  }

  async findOne(organizationId: string, entityType: string, id: string): Promise<any> {
    const entity = await this.prisma.dynamicEntity.findFirst({
      where: { id, entityType, organizationId },
    });

    if (!entity) {
      throw new NotFoundException(`Entity not found`);
    }

    return entity;
  }

  async update(organizationId: string, entityType: string, id: string, data: unknown): Promise<any> {
    // Verify entity exists
    await this.findOne(organizationId, entityType, id);

    // Get validation schema with org context
    const schema = this.validationService.getSchema(`${organizationId}:${entityType}`);
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

  async delete(organizationId: string, entityType: string, id: string): Promise<any> {
    // Verify entity exists
    await this.findOne(organizationId, entityType, id);

    await this.prisma.dynamicEntity.delete({
      where: { id },
    });
  }
}