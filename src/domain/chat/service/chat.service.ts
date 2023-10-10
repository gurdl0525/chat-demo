import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Repository } from 'typeorm/repository/Repository';
import { Chat, Joiner, Room } from '../entity/chat.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../../user/entity/user.entity';
import {
  CreateChatRoomRequest,
  SendChatRequest,
} from '../controller/dto/chat.dto';
import * as fast from 'fast-deep-equal';
import { ChatGateway } from '../gateway/chat.gateway';
import { UserFacade } from '../../../facade/user.facade';

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
    private readonly chatGateway: ChatGateway,
    private userFacade: UserFacade,
  ) {}

  async createRoom(req: CreateChatRoomRequest, token: string) {
    const user = await this.userFacade.verifyUser(token);

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
    const user = await this.userFacade.verifyUser(token);

    const room = await this.roomRepository.findOneBy({
      id: request.room_id,
    });

    if (!room) throw new NotFoundException('찾을 수 없는 채팅방입니다.');

    const joiner: Joiner = await this.joinerRepository.findOneBy({
      room_id: room.id,
      user_id: user.id,
    });

    if (!joiner) throw new BadRequestException('채팅방에 참여하지 않았습니다.');

    const message = await this.chatRepository.save(
      new Chat(request.text, joiner),
    );

    return this.chatGateway.server.to(`${room.id}`).emit('message', {
      message: message.text,
      posted_at: Date(),
      writer: `${user.id}`,
    });
  }

  addUserInRoom = async (roomId: string, token: string, id: string) => {
    if (!roomId) throw new NotFoundException('채팅방을 찾을 수 없습니다.');

    const user = await this.userFacade.verifyUser(token);

    const room = await this.roomRepository.findOneByOrFail({ id: roomId });

    if (
      !(await this.joinerRepository.exist({
        where: { room_id: room.id, user_id: user.id },
      }))
    )
      throw new ForbiddenException('권한이 없습니다.');

    if (
      await this.joinerRepository.exist({
        where: { room_id: room.id, user_id: id },
      })
    )
      throw new ConflictException('이미 채팅방에 들어가 있습니다.');

    const newUser = await this.userRepository.findOneBy({ id: id });
    if (!newUser) throw new NotFoundException('잘못된 유저 입니다.');

    await this.joinerRepository.save(new Joiner(room, newUser));
  };
}
