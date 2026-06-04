import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as dotenv from 'dotenv';

dotenv.config();

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const port = process.env.PORT || 3004; // Fallback to 3000 if PORT is not defined
  await app.listen(port);
  console.log(`Blockchain service running on port ${port}`);
}

bootstrap();