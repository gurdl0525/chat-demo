import {
  BadRequestException,
  HttpStatus,
  Injectable,
  NotFoundException,
  UnauthorizedException,
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
import { InjectRedis } from '@liaoliaots/nestjs-redis';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
    @InjectRedis() private readonly redis: Redis,
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

    const redisEntity = await this.getRedisEntity(user.account_id);
    if (redisEntity) {
      this.redis.del(redisEntity);
      this.redis.del(user.account_id);
    }

    return this.generateTokens(user.account_id);
  };

  private async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, await bcrypt.genSalt(10));
  }

  private async generateTokens(sub: string) {
    return new TokenResponse(
      await this.generateAccessToken(sub),
      await this.generateRefreshToken(sub),
    );
  }

  private async generateAccessToken(sub: string) {
    return await this.jwtService.signAsync(
      { sub: sub },
      {
        secret: process.env.SECRET_KEY,
        algorithm: 'HS256',
        expiresIn: '2h',
      },
    );
  }

  private async generateRefreshToken(sub: string) {
    const token = await this.jwtService.signAsync(
      {},
      {
        secret: process.env.SECRET_KEY,
        algorithm: 'HS256',
        expiresIn: '7d',
      },
    );

    await this.saveRedisEntity(sub, token);
    await this.saveRedisEntity(token, sub);

    return token;
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

  private async saveRedisEntity(key: string, value: string) {
    await this.redis.set(key, value, 'EX', 604800);
  }
  private async getRedisEntity(key: string): Promise<string | null> {
    return this.redis.get(key);
  }

  async reissue(refresh_token: string): Promise<TokenResponse> {
    const redisEntity = await this.getRedisEntity(refresh_token);

    if (!redisEntity) {
      throw new UnauthorizedException('유효하지 않은 refresh 토큰');
    }

    this.redis.del(refresh_token);
    this.redis.del(redisEntity);
    return await this.generateTokens(redisEntity);
  }
}
