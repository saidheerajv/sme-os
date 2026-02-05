import { Module, OnModuleInit } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { ValidationModule } from './validation/validation.module';
import { EntityDefinitionsModule } from './entity-definitions/entity-definitions.module';
import { DynamicEntitiesModule } from './dynamic-entities/dynamic-entities.module';
import { AuthModule } from './auth/auth.module';
import { OrganizationsModule } from './organizations/organizations.module';
import { EntityDefinitionsService } from './entity-definitions/entity-definitions.service';


@Module({
  imports: [
    PrismaModule,
    ValidationModule,
    OrganizationsModule,
    EntityDefinitionsModule,
    DynamicEntitiesModule,
    AuthModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements OnModuleInit {

  constructor(private entityDefinitionsService: EntityDefinitionsService) {}

  async onModuleInit() {
    // Load all entity schemas into cache on startup
    await this.entityDefinitionsService.loadAllSchemasToCache();
  }
}