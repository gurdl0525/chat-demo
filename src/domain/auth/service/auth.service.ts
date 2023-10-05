import {
  BadRequestException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  LogInRequest,
  SingUpRequest,
  TokenResponse,
} from '../controller/dto/auth.dto';
import { User } from '../../user/entity/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import * as process from 'process';
import { Redis } from 'ioredis';

const redis: Redis = new Redis({
  host: process.env.REDIS_HOST,
  port: parseInt(process.env.REDIS_PORT),
});

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
  ) {}

  signUp = async (req: SingUpRequest) => {
    if (await this.userRepository.findOneBy({ account_id: req.account_id })) {
      throw new BadRequestException({
        status: HttpStatus.BAD_REQUEST,
        message: '이미 가입한 아이디입니다.',
        error: 'Bad Request',
      });
    }

    const user = new User(
      req.account_id,
      await this.hashPassword(req.password),
    );
    await this.userRepository.save(user);

    return await user.toResponse();
  };

  login = async (req: LogInRequest) => {
    const user = await this.userRepository.findOneBy({
      account_id: req.account_id,
    });
    if (!user) {
      throw new NotFoundException({
        message: '존재하지 않는 유저 입니다.',
        error: 'Bad Request',
        status: HttpStatus.NOT_FOUND,
      });
    }
    if (!(await bcrypt.compare(req.password, user.password))) {
      throw new BadRequestException({
        message: '비밀번호가 올바르지 않습니다.',
        error: 'Bad Request',
        status: HttpStatus.BAD_REQUEST,
      });
    }
    return this.generateTokens(user.account_id);
  };

  private async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, await bcrypt.genSalt(10));
  }

  private async generateTokens(sub: string) {
    return new TokenResponse(
      await this.generateAccessToken(sub),
      await this.generateRefreshToken(),
    );
  }

  private async generateAccessToken(sub: string) {
    if (!(await this.getRefreshToken(sub))) {
      redis.del(sub);
    }

    const token = await this.jwtService.signAsync(
      { sub: sub },
      {
        secret: process.env.SECRET_KEY,
        algorithm: 'HS256',
        expiresIn: '2d',
      },
    );

    await this.saveRefreshToken(sub, token);

    return token;
  }

  private async generateRefreshToken() {
    return await this.jwtService.signAsync(
      {},
      {
        secret: process.env.SECRET_KEY,
        algorithm: 'HS256',
        expiresIn: '7d',
      },
    );
  }

  compareTokenExpiration(exp: number) {
    const time = new Date().getTime() / 1000;
    return exp < time;
  }

  async findOneBySub(account_id: string) {
    const user = await this.userRepository.findOneBy({
      account_id: account_id,
    });
    if (!user) {
      throw new NotFoundException(`User ${account_id} is not exist.`);
    }
    return user;
  }

  private async saveRefreshToken(accountId: string, refreshToken: string) {
    await redis.set(accountId, refreshToken, 'EX', 604800);
  }
  private async getRefreshToken(accountId: string): Promise<string | null> {
    return redis.get(accountId);
  }
}
