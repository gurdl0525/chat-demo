import { Controller, Get } from '@nestjs/common';

@Controller()
export class ChatController {
  @Get()
  root() {
    return { message: 'Hello world!' };
  }
}
