import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { ZodExceptionFilter } from './filters/zod-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    transform: true,
  }));
  
  app.useGlobalFilters(new ZodExceptionFilter());
  
  await app.listen(3000);
  console.log('🚀 Backend Server running on http://localhost:3000');
}
bootstrap();