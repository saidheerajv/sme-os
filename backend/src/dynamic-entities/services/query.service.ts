import { Injectable, BadRequestException } from '@nestjs/common';
import { FilterService } from '../filters/filter.service';
import { EntityQueryDto, SortOptions, PaginationOptions, QueryOptions } from '../dto/entity-query.dto';

@Injectable()
export class QueryService {
  constructor(private readonly filterService: FilterService) {}

  /**
   * Parse query parameters into structured options
   */
  parseQuery(query: EntityQueryDto, fieldDefinitions: any[]): QueryOptions {
    const options: QueryOptions = {};

    // Parse filters
    if (query.search) {
      const conditions = this.filterService.parseFilters(query.search);
      this.filterService.validateFilters(conditions, fieldDefinitions);
      options.filters = this.filterService.buildWhereClause(conditions, fieldDefinitions);
    }

    // Parse sorting
    if (query.sort) {
      options.sort = this.parseSort(query.sort, fieldDefinitions);
    }

    // Parse pagination
    if (query.page || query.limit) {
      options.pagination = this.parsePagination(query.page, query.limit);
    }

    // Parse field selection
    if (query.select) {
      options.select = this.parseSelect(query.select, fieldDefinitions);
    }

    return options;
  }

  private parseSort(sortQuery: string, fieldDefinitions: any[]): SortOptions {
    const parts = sortQuery.split(':');
    if (parts.length !== 2) {
      throw new BadRequestException('Invalid sort format. Expected: field:direction (e.g., name:asc)');
    }

    const [field, direction] = parts;
    
    if (!['asc', 'desc'].includes(direction.toLowerCase())) {
      throw new BadRequestException('Invalid sort direction. Use "asc" or "desc"');
    }

    // Validate field exists
    const fieldDef = fieldDefinitions.find(f => f.name === field);
    if (!fieldDef) {
      throw new BadRequestException(`Unknown sort field: ${field}`);
    }

    return {
      field,
      direction: direction.toLowerCase() as 'asc' | 'desc',
    };
  }

  private parsePagination(page?: number, limit?: number): PaginationOptions {
    const pageNum = Math.max(1, page || 1);
    const limitNum = Math.min(Math.max(1, limit || 50), 100); // Max 100 items per page
    const offset = (pageNum - 1) * limitNum;

    return {
      page: pageNum,
      limit: limitNum,
      offset,
    };
  }

  private parseSelect(selectQuery: string, fieldDefinitions: any[]): string[] {
    const fields = selectQuery.split(',').map(f => f.trim());
    
    // Validate all fields exist
    for (const field of fields) {
      const fieldDef = fieldDefinitions.find(f => f.name === field);
      if (!fieldDef) {
        throw new BadRequestException(`Unknown select field: ${field}`);
      }
    }

    return fields;
  }

  /**
   * Build Prisma query from options
   */
  buildPrismaQuery(organizationId: string, entityType: string, options: QueryOptions): any {
    const query: any = {
      where: {
        entityType,
        organizationId,
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
      // Default sort by creation date
      query.orderBy = { createdAt: 'desc' };
    }

    // Add pagination
    if (options.pagination) {
      query.skip = options.pagination.offset;
      query.take = options.pagination.limit;
    }

    return query;
  }

  /**
   * Filter entity data fields based on select options
   */
  filterSelectedFields(entities: any[], selectFields?: string[]): any[] {
    if (!selectFields || selectFields.length === 0) {
      return entities;
    }

    return entities.map(entity => {
      const filteredData: any = {};
      
      for (const field of selectFields) {
        if (entity.data && entity.data.hasOwnProperty(field)) {
          filteredData[field] = entity.data[field];
        }
      }

      return {
        ...entity,
        data: filteredData,
      };
    });
  }

  /**
   * Build pagination metadata
   */
  buildPaginationMeta(
    total: number, 
    pagination?: PaginationOptions
  ): any {
    if (!pagination) {
      return {
        total,
        hasMore: false,
      };
    }

    const totalPages = Math.ceil(total / pagination.limit);
    const hasNextPage = pagination.page < totalPages;
    const hasPrevPage = pagination.page > 1;

    return {
      total,
      page: pagination.page,
      limit: pagination.limit,
      totalPages,
      hasNextPage,
      hasPrevPage,
    };
  }
}