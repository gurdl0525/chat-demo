import { Body, Controller, Get, Res } from '@nestjs/common';
import { SingUpRequest } from './dto/user.dto';
import { UserService } from '../service/user.service';
import { Response } from 'express';

@Controller({ path: '/user' })
export class UserController {
  constructor(private readonly userService: UserService) {}
  @Get()
  async create_user(@Body() req: SingUpRequest, @Res() res: Response) {
    return res
      .status(201)
      .json(await this.userService.signUp(req))
      .send();
  }
}
