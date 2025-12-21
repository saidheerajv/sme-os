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
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('entity-definitions')
@UseGuards(JwtAuthGuard)
export class EntityDefinitionsController {
  constructor(private readonly service: EntityDefinitionsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @CurrentUser() user: any,
    @Body() dto: CreateEntityDefinitionDto
  ) {
    return this.service.create(user.id, dto);
  }

  @Get()
  async findAll(@CurrentUser() user: any) {
    return this.service.findAll(user.id);
  }

  @Get(':name')
  async findOne(
    @CurrentUser() user: any,
    @Param('name') name: string
  ) {
    return this.service.findOne(user.id, name);
  }

  @Put(':name')
  async update(
    @CurrentUser() user: any,
    @Param('name') name: string,
    @Body() dto: UpdateEntityDefinitionDto
  ) {
    return this.service.update(user.id, name, dto);
  }

  @Delete(':name')
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(
    @CurrentUser() user: any,
    @Param('name') name: string
  ) {
    await this.service.delete(user.id, name);
  }
}