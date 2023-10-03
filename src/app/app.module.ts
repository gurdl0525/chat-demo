import { typeORMConfig } from './config/typeorm.config';
import { Module } from '@nestjs/common';
import { ChatModule } from './domain/chat/chat.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChatController } from './domain/chat/controller/chat.controller';
import { UserController } from './domain/user/controller/user.controller';
import { UserRepository } from './domain/user/repository/user.repository';
import { UserModule } from './domain/user/module/user.module';

@Module({
  imports: [
    TypeOrmModule.forRoot(typeORMConfig),
    ChatModule,
    TypeOrmModule.forFeature([UserRepository]),
    UserModule,
  ],
  controllers: [ChatController, UserController],
})
export class AppModule {}
