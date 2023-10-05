import {
  ForbiddenException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Socket } from 'socket.io';
import { Repository } from 'typeorm';
import { Joiner, Room } from '../entity/chat.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../../user/entity/user.entity';

@Injectable()
export class ChatRoomService {
  constructor(
    @InjectRepository(Joiner)
    private readonly joinerRepository: Repository<Joiner>,
    @InjectRepository(Room)
    private readonly roomRepository: Repository<Room>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}
  async createChatRoom(client: Socket, roomName: string) {
    const nickname: string = client.data.nickname;

    const room = await this.roomRepository.save(new Room(roomName));

    const user = await this.userRepository.findOneBy({ account_id: nickname });

    if (!user) {
      throw new ForbiddenException({
        message: '권한이 거부되었습니다.',
        error: 'Forbidden',
        status: HttpStatus.FORBIDDEN,
      });
    }

    await this.joinerRepository.save(new Joiner(room, user));

    client.emit('getMessage', {
      id: null,
      nickname: '안내',
      message: '"' + nickname + '"님이 "' + roomName + '"방을 생성하였습니다.',
    });
    client.data.roomId = room.id;
    client.rooms.clear();
    await client.join(room.id);
  }

  async enterChatRoom(client: Socket, roomId: string) {
    client.data.roomId = roomId;
    client.rooms.clear();
    client.join(roomId);
    const { nickname } = client.data;
    const room = await this.getChatRoom(roomId);
    client.to(roomId).emit('getMessage', {
      id: null,
      nickname: '안내',
      message: `"${nickname}"님이 "${room.name}"방에 접속하셨습니다.`,
    });
  }

  async exitChatRoom(client: Socket, roomId: string) {
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

  async getChatRoom(roomId: string): Promise<Room> {
    try {
      return await this.roomRepository.findOneOrFail({ where: { id: roomId } });
    } catch (e) {
      throw new NotFoundException({
        message: '채팅방을 찾을 수 없습니다.',
        error: 'Not Found',
        status: HttpStatus.NOT_FOUND,
      });
    }
  }

  async getChatRoomList() {
    return await this.roomRepository.find();
  }

  async deleteChatRoom(roomId: string) {
    await this.roomRepository.delete({ id: roomId });
  }
}
