import { Body, Controller, Get, Patch, Post, Req, Res, UseGuards } from "@nestjs/common";
import { LogInRequest, ReIssueRequest, SingUpRequest } from './dto/auth.dto';
import { AuthService } from '../service/auth.service';
import { Request, Response } from 'express';
import { JwtAuthGuard } from '../jwt/jwt.guard';
import { User } from '../../user/entity/user.entity';

@Controller({ path: '/auth' })
export class AuthController {
  constructor(private readonly authService: AuthService) {}
  @Post()
  async create_user(@Body() req: SingUpRequest, @Res() res: Response) {
    return res
      .status(201)
      .json(await this.authService.signUp(req))
      .send();
  }

  @Post('/login')
  async login(@Body() req: LogInRequest, @Res() res: Response) {
    return res
      .status(201)
      .json(await this.authService.login(req))
      .send();
  }

  @Patch('/re-issue')
  async reissue(@Body() req: ReIssueRequest, @Res() res: Response) {
    return res
      .status(201)
      .json(await this.authService.reissue(req.refresh_token))
      .send();
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  getProfile(@Req() req: Request) {
    const user = req.user as User;
    return { id: `${user.id}` };
  }
}
