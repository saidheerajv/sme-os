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
import { OrganizationGuard } from '../organizations/guards/organization.guard';
import { CurrentOrganization } from '../organizations/decorators/current-organization.decorator';
import { EntityQueryDto } from './dto/entity-query.dto';

@Controller('entities/:entityType')
@UseGuards(JwtAuthGuard, OrganizationGuard)
export class DynamicEntitiesController {
  
  constructor(private readonly service: DynamicEntitiesService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @CurrentOrganization() org: any,
    @Param('entityType') entityType: string,
    @Body() data: unknown,
  ) {
    return this.service.create(org.id, entityType, data);
  }

  @Get()
  async findAll(
    @CurrentOrganization() org: any,
    @Param('entityType') entityType: string,
    @Query() query: EntityQueryDto,
  ) {
    return this.service.findAll(org.id, entityType, query);
  }

  @Get(':id')
  async findOne(
    @CurrentOrganization() org: any,
    @Param('entityType') entityType: string,
    @Param('id') id: string,
  ) {
    return this.service.findOne(org.id, entityType, id);
  }

  @Put(':id')
  async update(
    @CurrentOrganization() org: any,
    @Param('entityType') entityType: string,
    @Param('id') id: string,
    @Body() data: unknown,
  ) {
    return this.service.update(org.id, entityType, id, data);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(
    @CurrentOrganization() org: any,
    @Param('entityType') entityType: string,
    @Param('id') id: string,
  ) {
    await this.service.delete(org.id, entityType, id);
  }
}