import { Module } from '@nestjs/common';
import { UserService } from '../service/user.service';

@Module({
  providers: [UserService],
})
export class UserModule {}
