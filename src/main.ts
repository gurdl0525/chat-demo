import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as process from 'process';
import { ValidationPipe } from '@nestjs/common';
import { config } from 'dotenv';
import { IoAdapter } from '@nestjs/platform-socket.io';
import { webSocket } from 'rxjs/webSocket';

config();

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  app.useWebSocketAdapter(new IoAdapter(app));
  const port = Number(process.env.PORT);
  await app.listen(port);
  console.log(`Application is running on :${port}`);
}
bootstrap();
