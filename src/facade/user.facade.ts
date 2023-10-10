import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../domain/user/entity/user.entity';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException } from '@nestjs/common';
import process from "process";

export class UserFacade {
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
    private jwtService: JwtService,
  ) {}

  verifyUser = async (token: string) => {
    try {
      if (token.startsWith('Bearer ')) token = token.substring(7);

      const sub: string = (
        await this.jwtService.verifyAsync(token, {
          secret: process.env.SECRET_KEY,
        })
      ).sub;
      return await this.userRepository.findOneByOrFail({
        account_id: sub,
      });
    } catch (e) {
      console.error(e);
      throw new UnauthorizedException('올바르지 않은 토큰');
    }
  };
}
