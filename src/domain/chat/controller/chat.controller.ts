import {
  Body,
  Controller,
  Post,
  Headers,
  Res,
  UseGuards,
  Query,
} from '@nestjs/common/decorators';
import { Response } from 'express';
import {
  AddUsrInRoomRequest,
  CreateChatRoomRequest,
  SendChatRequest,
} from './dto/chat.dto';
import { ChatService } from '../service/chat.service';
import { JwtAuthGuard } from '../../auth/jwt/jwt.guard';
import { Patch } from '@nestjs/common';

@Controller()
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

  @Post('/chat')
  async sendChat(
    @Headers('Authorization') token: string,
    @Body() request: SendChatRequest,
    @Res() res: Response,
  ) {
    return res
      .status(201)
      .json(await this.chatService.sendChat(request, token))
      .send();
  }

  @Patch('/room/add')
  async addUser(
    @Headers('Authorization') token: string,
    @Body() req: AddUsrInRoomRequest,
    @Query('room_id') room_id: string,
    @Res() res: Response,
  ) {
    await this.chatService.addUserInRoom(room_id, token, req.user_id);
    return res.status(200).send();
  }
}
