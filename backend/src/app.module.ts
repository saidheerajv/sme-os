import { Module, OnModuleInit } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { ValidationModule } from './validation/validation.module';
import { EntityDefinitionsModule } from './entity-definitions/entity-definitions.module';
import { DynamicEntitiesModule } from './dynamic-entities/dynamic-entities.module';
import { AuthModule } from './auth/auth.module';
import { EntityDefinitionsService } from './entity-definitions/entity-definitions.service';
// import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';

@Module({
  imports: [
    PrismaModule,
    ValidationModule,
    EntityDefinitionsModule,
    DynamicEntitiesModule,
    AuthModule,
    // ServeStaticModule.forRoot({
    //   rootPath: join(__dirname, '..', 'blueprints'),
    //   serveRoot: '/blueprints',
    // }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements OnModuleInit {
  constructor(private entityDefinitionsService: EntityDefinitionsService) {}

  async onModuleInit() {
    // Load all entity schemas into cache on startup
    await this.entityDefinitionsService.loadAllSchemasToCache();
    console.log('✅ Entity validation schemas loaded');
  }
}