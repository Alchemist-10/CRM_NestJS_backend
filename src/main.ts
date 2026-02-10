// src/main.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable Validation
  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));

  // Swagger Config
  const config = new DocumentBuilder()
    .setTitle('Secureit CRM API')
    .setDescription('The Secureit CRM API description')
    .setVersion('1.0')
    .addBearerAuth() // Adds the "Authorize" button to Swagger
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  await app.listen(3000);
}
bootstrap();
