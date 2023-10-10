import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { UserFacade } from '../../../facade/user.facade';
import { User } from '../../user/entity/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Joiner } from '../entity/chat.entity';
import { Repository } from 'typeorm/repository/Repository';

@WebSocketGateway(8080, {
  transports: ['websocket'],
  cors: { origin: ['*'] },
})
export class ChatGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  constructor(
    @InjectRepository(Joiner)
    private readonly joinerRepository: Repository<Joiner>,
    private readonly userFacade: UserFacade,
  ) {}
  @WebSocketServer()
  public server: Server;

  afterInit(): any {
    console.log('WebSocket Server Init');
  }

  public async handleConnection(@ConnectedSocket() client: Socket) {
    console.log(`connected ${client.id}`);

    let token: string;
    let user: User;

    try {
      token = client.handshake.query['authorization'].toString();
      user = await this.userFacade.verifyUser(token);
    } catch (e) {
      client.disconnect();
      console.error('UnAuthorized');
      return;
    }

    const joiners = await this.joinerRepository.findBy({ user_id: user.id });

    for (const { room_id } of joiners) {
      client.join(`${room_id}`);
      console.log(`join to ${room_id}`);
    }
  }

  public async handleDisconnect(@ConnectedSocket() client: Socket) {
    console.log('disconnected', client.id);
  }
}
