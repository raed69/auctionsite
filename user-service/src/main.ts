import { NestFactory }    from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule }      from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors();

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist:        true,   // strip unknown props
      forbidNonWhitelisted: true, // throw on unknown props
      transform:        true,   // auto-transform payloads to DTO classes
    }),
  );

  const port = process.env.PORT ?? 3001;
  await app.listen(port);
  console.log(`✅  User service running on http://localhost:${port}`);
}

bootstrap();