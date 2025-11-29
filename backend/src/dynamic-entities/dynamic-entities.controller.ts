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