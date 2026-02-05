import { Module } from '@nestjs/common';
import { EntityDefinitionsService } from './entity-definitions.service';
import { EntityDefinitionsController } from './entity-definitions.controller';
import { ValidationModule } from '../validation/validation.module';
import { OrganizationsModule } from '../organizations/organizations.module';

@Module({
  imports: [ValidationModule, OrganizationsModule],
  providers: [EntityDefinitionsService],
  controllers: [EntityDefinitionsController],
  exports: [EntityDefinitionsService]
})
export class EntityDefinitionsModule {}
