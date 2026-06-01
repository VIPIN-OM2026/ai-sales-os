import { NestFactory, Reflector } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { GlobalExceptionFilter } from './common/exceptions/global-exception.filter';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';
import { RolesGuard } from './common/guards/roles.guard';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['log', 'error', 'warn'],
  });

  // Global prefix
  app.setGlobalPrefix('api/v1');

  // CORS
  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  });

  // Global validation pipe — strips unknown fields, validates all input
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  // Global exception filter — standardizes all error responses
  app.useGlobalFilters(new GlobalExceptionFilter());

  // Global response interceptor — wraps all success responses
  app.useGlobalInterceptors(new ResponseInterceptor());

  // Swagger API docs
  if (process.env.NODE_ENV !== 'production') {
    const config = new DocumentBuilder()
      .setTitle('AI Sales OS API')
      .setDescription('AI Sales & Operations OS for SMEs — OpsMonsters')
      .setVersion('1.0')
      .addBearerAuth()
      .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api/docs', app, document);
  }

  const port = process.env.PORT || 3001;
  await app.listen(port);

  console.log(`
  ╔══════════════════════════════════════════╗
  ║   AI Sales OS — Backend Running          ║
  ║   http://localhost:${port}                  ║
  ║   Docs: http://localhost:${port}/api/docs   ║
  ╚══════════════════════════════════════════╝
  `);
}

bootstrap();
