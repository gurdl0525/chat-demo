import { NestFactory } from '@nestjs/core';
import { SocketIoAdapter } from './global/adapter/socket.adapter';
import { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app/app.module';
import * as process from 'process';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.useWebSocketAdapter(new SocketIoAdapter(app));
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const port = parseInt(process.env.PORT);
  await app.listen(port);
  console.log(`Application is running on :${port}`);
}
bootstrap();
