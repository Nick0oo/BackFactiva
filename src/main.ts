import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { AllExceptionsFilter } from './common/filters/all-exception.filter';
import * as dotenv from 'dotenv';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  dotenv.config();
  const env = process.env.NODE_ENV || 'development';

  // Lee los orígenes permitidos desde variables de entorno
  const allowedOrigins = (
    env === 'production'
      ? process.env.CORS_ORIGIN_PROD || ''
      : process.env.CORS_ORIGIN_DEV || 'http://localhost:4000'
  )
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean); // Elimina strings vacíos

  app.enableCors({
    origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
      // Permite peticiones sin origen (por ejemplo, Postman, SSR, etc.)
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error(`CORS blocked for origin: ${origin}`));
      }
    },
    credentials: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders: 'Content-Type, Accept, Authorization',
  });

  app.useGlobalPipes(new ValidationPipe({ transform: true }));
  app.useGlobalFilters(new AllExceptionsFilter());

  await app.listen(process.env.PORT || 3000);
}

void bootstrap();
