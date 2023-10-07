import {
  Body,
  Controller,
  Post,
  Headers,
  Res,
  UseGuards,
} from '@nestjs/common/decorators';
import { Request, Response } from 'express';
import { CreateChatRoomRequest, SendChatRequest } from './dto/chat.dto';
import { ChatService } from '../service/chat.service';
import { JwtAuthGuard } from '../../auth/jwt/jwt.guard';
import { User } from '../../user/entity/user.entity';

@Controller('/chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @UseGuards(JwtAuthGuard)
  @Post('/room')
  async createChatRoom(
    @Headers('Authorization') token: string,
    @Body() request: CreateChatRoomRequest,
    @Res() res: Response,
  ) {
    return res
      .status(201)
      .json(await this.chatService.createRoom(request, token))
      .send();
  }

  @Post()
  async sendChat(
    @Headers('Authorization') token: string,
    @Body() request: SendChatRequest,
    @Res() res: Response,
  ) {
    await this.chatService.sendChat(request, token);
    return res.status(201).send();
  }
}
