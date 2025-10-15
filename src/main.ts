import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';

import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('api');

  app.useGlobalPipes(
    new ValidationPipe({
      // whitelist: true, // Elimina propiedades que no estén en el DTO
      // forbidNonWhitelisted: true, // Lanza error si hay propiedades no permitidas
      transform: true, // Convierte automáticamente los tipos de datos según los tipos definidos en los DTOs
      transformOptions: {
        enableImplicitConversion: true, // Permite la conversión implícita de tipos (ej: string a number)
      },
    })
  );

  app.enableCors();

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
