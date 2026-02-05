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
  UseGuards,
} from '@nestjs/common';
import { EntityDefinitionsService } from './entity-definitions.service';
import { CreateEntityDefinitionDto } from './dto/create-entity-definition.dto';
import { UpdateEntityDefinitionDto } from './dto/update-entity-definition.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { OrganizationGuard } from '../organizations/guards/organization.guard';
import { CurrentOrganization } from '../organizations/decorators/current-organization.decorator';

@Controller('entity-definitions')
@UseGuards(JwtAuthGuard, OrganizationGuard)
export class EntityDefinitionsController {
  constructor(private readonly service: EntityDefinitionsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @CurrentOrganization() org: any,
    @Body() dto: CreateEntityDefinitionDto
  ) {
    return this.service.create(org.id, dto);
  }

  @Get()
  async findAll(@CurrentOrganization() org: any) {
    return this.service.findAll(org.id);
  }

  @Get(':name')
  async findOne(
    @CurrentOrganization() org: any,
    @Param('name') name: string
  ) {
    return this.service.findOne(org.id, name);
  }

  @Put(':name')
  async update(
    @CurrentOrganization() org: any,
    @Param('name') name: string,
    @Body() dto: UpdateEntityDefinitionDto
  ) {
    return this.service.update(org.id, name, dto);
  }

  @Delete(':name')
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(
    @CurrentOrganization() org: any,
    @Param('name') name: string
  ) {
    await this.service.delete(org.id, name);
  }
}