import { Injectable } from '@nestjs/common';
import { SingUpRequest } from '../controller/dto/user.dto';
import { User } from '../entity/user.entity';
import { UserRepository } from '../repository/user.repository';
import { RuntimeException } from '@nestjs/core/errors/exceptions';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: UserRepository,
  ) {}

  async signUp(req: SingUpRequest) {
    const user = new User(req.account_id, req.password);
    if (await this.userRepository.existByAccountId(req.account_id)) {
      throw RuntimeException;
    }
    return await this.userRepository.save(user);
  }
}
