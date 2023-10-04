import { BadRequestException, Injectable } from '@nestjs/common';
import { SingUpRequest } from '../controller/dto/user.dto';
import { User } from '../entity/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
  ) {}
  signUp = async (req: SingUpRequest) => {
    if (await this.userRepository.findOneBy({ accountId: req.account_id })) {
      throw new BadRequestException();
    }
    return await this.userRepository.save(
      new User(req.account_id, req.password),
    );
  };
}
