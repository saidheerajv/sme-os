import { Module } from '@nestjs/common';
import { DynamicEntitiesService } from './dynamic-entities.service';
import { DynamicEntitiesController } from './dynamic-entities.controller';
import { FilterService } from './filters/filter.service';
import { QueryService } from './services/query.service';
import { ValidationModule } from '../validation/validation.module';
import { EntityDefinitionsModule } from '../entity-definitions/entity-definitions.module';

@Module({
  imports: [ValidationModule, EntityDefinitionsModule],
  providers: [DynamicEntitiesService, FilterService, QueryService],
  controllers: [DynamicEntitiesController]
})
export class DynamicEntitiesModule {}
