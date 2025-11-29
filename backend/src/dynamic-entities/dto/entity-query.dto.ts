import { IsOptional, IsString, IsInt, Min, Max } from 'class-validator';
import { Transform, Type } from 'class-transformer';

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

export class SortOptions {
  field: string;
  direction: 'asc' | 'desc';
}

export class PaginationOptions {
  page: number;
  limit: number;
  offset: number;
}

export class QueryOptions {
  filters?: any;
  sort?: SortOptions;
  pagination?: PaginationOptions;
  select?: string[];
}