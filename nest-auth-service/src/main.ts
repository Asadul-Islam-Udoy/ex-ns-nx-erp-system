import { DataSource } from 'typeorm';
import { AppModule } from './app.module';
import { NestFactory } from '@nestjs/core';
import cookieParser from 'cookie-parser';
import { AllExceptionsFilter } from './common/filters/http-exception.filter';
import 'dotenv/config';
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(cookieParser());
  app.enableCors({ origin: 'http://localhost:4200', credentials: true });
  // ✅ Get TypeORM DataSource instance from Nest container
  const dataSource = app.get(DataSource);
  app.useGlobalFilters(new AllExceptionsFilter());
  try {
    // Simple query to confirm connection
    await dataSource.query('SELECT 1');
    console.log('✅ Database connected successfully!');
  } catch (err: unknown) {
    // Handle both Error and non-Error types safely
    const message = err instanceof Error ? err.message : String(err);
    console.error('❌ Database connection failed:', message);
  }

  await app.listen(3000);
  console.log('🚀 Server running on http://localhost:3000');
}

bootstrap();
