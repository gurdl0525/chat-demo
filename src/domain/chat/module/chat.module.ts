import { Module } from '@nestjs/common';
import { ChatGateway } from '../gateway/chat.gateway';
import { ChatService } from '../service/chat.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Chat, Joiner, Room } from '../entity/chat.entity';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { User } from '../../user/entity/user.entity';
import process from 'process';
import { ChatController } from '../controller/chat.controller';
import { UserFacade } from '../../../facade/user.facade';

@Module({
  providers: [ChatGateway, ChatService, UserFacade],
  imports: [
    TypeOrmModule.forFeature([Joiner, Room, Chat, User]),
    PassportModule.register({ defaultStrategy: 'jwt', session: false }),
    JwtModule.register({
      secret: process.env.SECRET_KEY,
    }),
  ],
  controllers: [ChatController],
})
export class ChatModule {}
