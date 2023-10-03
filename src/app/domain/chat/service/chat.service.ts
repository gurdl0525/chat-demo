import { Injectable } from '@nestjs/common';
import { chatRoomListDTO } from '../controller/dto/chat.dto';
import { Socket } from 'socket.io';
import { v4 as uuid } from 'uuid';

@Injectable()
export class ChatRoomService {
  private readonly chatRoomList: Record<string, chatRoomListDTO>;
  constructor() {
    this.chatRoomList = {
      'room:lobby': {
        roomId: 'room:lobby',
        roomName: '로비',
        chefId: null,
      },
    };
  }
  createChatRoom(client: Socket, roomName: string): void {
    const roomId = `room:${uuid()}`;
    const nickname: string = client.data.nickname;
    client.emit('getMessage', {
      id: null,
      nickname: '안내',
      message: '"' + nickname + '"님이 "' + roomName + '"방을 생성하였습니다.',
    });
    // return this.chatRoomList[roomId];
    this.chatRoomList[roomId] = {
      roomId,
      chefId: client.id,
      roomName,
    };
    client.data.roomId = roomId;
    client.rooms.clear();
    client.join(roomId);
  }

  enterChatRoom(client: Socket, roomId: string) {
    client.data.roomId = roomId;
    client.rooms.clear();
    client.join(roomId);
    const { nickname } = client.data;
    const { roomName } = this.getChatRoom(roomId);
    client.to(roomId).emit('getMessage', {
      id: null,
      nickname: '안내',
      message: `"${nickname}"님이 "${roomName}"방에 접속하셨습니다.`,
    });
  }

  exitChatRoom(client: Socket, roomId: string) {
    client.data.roomId = `room:lobby`;
    client.rooms.clear();
    client.join(`room:lobby`);
    const { nickname } = client.data;
    client.to(roomId).emit('getMessage', {
      id: null,
      nickname: '안내',
      message: '"' + nickname + '"님이 방에서 나갔습니다.',
    });
  }

  getChatRoom(roomId: string): chatRoomListDTO {
    return this.chatRoomList[roomId];
  }

  getChatRoomList(): Record<string, chatRoomListDTO> {
    return this.chatRoomList;
  }

  deleteChatRoom(roomId: string) {
    delete this.chatRoomList[roomId];
  }
}
