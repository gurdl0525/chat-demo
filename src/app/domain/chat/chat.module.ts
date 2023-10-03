import { Module } from '@nestjs/common';
import { ChatBackEndGateway } from './chat.gateway';
import { ChatRoomService } from './service/chat.service';

@Module({
  providers: [ChatBackEndGateway, ChatRoomService],
})
export class ChatModule {}
