import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './domain/auth/module/auth.module';
import { UserModule } from './domain/user/module/user.module';
import { ChatModule } from './domain/chat/module/chat.module';
import { RedisModule } from '@liaoliaots/nestjs-redis';
import { redisConfig, typeORMConfig } from './config/typeorm.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: '../.env',
      isGlobal: true,
      cache: true,
    }),
    TypeOrmModule.forRoot(typeORMConfig),
    RedisModule.forRoot(redisConfig),
    AuthModule,
    UserModule,
    ChatModule,
  ],
})
export class AppModule {}
