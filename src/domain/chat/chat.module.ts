import { Module } from '@nestjs/common';
import { ChatBackEndGateway } from './chat.gateway';
import { ChatRoomService } from './service/chat.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Chat, Joiner, Room } from './entity/chat.entity';

@Module({
  providers: [ChatBackEndGateway, ChatRoomService],
  imports: [TypeOrmModule.forFeature([Joiner, Room, Chat])],
})
export class ChatModule {}
