import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  ConnectedSocket,
  SubscribeMessage,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ChatService } from '../service/chat.service';
import { JwtService } from '@nestjs/jwt';
import process from 'process';

@WebSocketGateway(8080, {
  transports: ['websocket'],
  cors: { origin: ['*'] },
})
export class ChatBackEndGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  constructor(
    private readonly chatService: ChatService,
    private jwtService: JwtService,
  ) {}
  @WebSocketServer()
  public server: Server;

  afterInit(): any {
    console.log('WebSocket Server Init');
  }

  public async handleConnection(@ConnectedSocket() client: Socket) {
    console.log(`connected ${client.id}`);

    try {
      const sub = (
        await this.jwtService.verifyAsync(
          client.handshake.query['authorization'].toString(),
          { secret: process.env.SECRET_KEY },
        )
      ).sub;

      try {
        const roomId = client.handshake.query['room'].toString();

        await this.chatService.enterRoom(roomId, sub, client);
      } catch (e) {
        client.disconnect();
        console.error(`${client.id}의 요청이 올바르지 않습니다.`);
      }
    } catch (e) {
      client.disconnect();
      console.error(`${client.id}의 토큰이 올바르지 않습니다.`);
    }
  }

  public async handleDisconnect(@ConnectedSocket() client: Socket) {
    console.log('disconnected', client.id);
  }
}
