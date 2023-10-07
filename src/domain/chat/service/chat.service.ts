import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { Repository } from 'typeorm';
import { Chat, Joiner, Room } from '../entity/chat.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../../user/entity/user.entity';
import { Socket } from 'socket.io';
import {
  CreateChatRoomRequest,
  SendChatRequest,
} from '../controller/dto/chat.dto';
import * as fast from 'fast-deep-equal';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class ChatService {
  constructor(
    @InjectRepository(Joiner)
    private readonly joinerRepository: Repository<Joiner>,
    @InjectRepository(Room)
    private readonly roomRepository: Repository<Room>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Chat)
    private readonly chatRepository: Repository<Chat>,
    private jwtService: JwtService,
  ) {}

  async enterRoom(roomId: string, sub: string, client: Socket) {
    try {
      const user = await this.userRepository.findOneBy({ account_id: sub });

      if (!user) throw new UnauthorizedException();

      const room = await this.roomRepository.findOneBy({ id: roomId });

      if (!room) throw new BadRequestException();

      const joiner = this.joinerRepository.findOneBy({
        room_id: roomId,
        user_id: user.id,
      });

      if (!joiner) throw new NotFoundException();
    } catch (e) {
      client.disconnect();
      console.error('채팅방에 들어가 있지 않거나 존재하지 않는 채팅방입니다.');
    }

    client.rooms.add(roomId);
  }

  async createRoom(req: CreateChatRoomRequest, token: string) {
    const user = await this.jwtService.verifyAsync(token);

    const new_user = await this.userRepository.findOneBy({
      account_id: req.account_id,
    });

    if (!new_user) throw new NotFoundException('없는 유저 아이디 입니다.');
    else if (fast.default(user, new_user))
      throw new ConflictException('스스로에게 채팅을 보낼 수 없습니다.');

    const room = await this.roomRepository.save(
      new Room(req.room_name ?? new_user.account_id),
    );

    await this.joinerRepository.save([
      new Joiner(room, new_user),
      new Joiner(room, user),
    ]);

    return { room_id: room.id };
  }

  async sendChat(request: SendChatRequest, token: string) {
    const user = await this.jwtService.verifyAsync(token);
    const room = await this.roomRepository.findOneByOrFail({
      id: request.room_id,
    });

    if (!room) throw new NotFoundException('찾을 수 없는 채팅방입니다.');

    const joiner = await this.joinerRepository.findOneBy({
      room_id: room.id,
      user_id: user.id,
    });

    if (!joiner) throw new BadRequestException('채팅방에 참여하지 않았습니다.');

    await this.chatRepository.save(new Chat(request.text, joiner));
  }
}
