import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { User } from '../domain/user/entity/user.entity';

export const typeORMConfig: TypeOrmModuleOptions = {
  type: 'mysql',
  host: 'localhost',
  port: 3306,
  username: 'root',
  password: 'kang0525@',
  database: 'chatting',
  entities: [User],
  synchronize: true,
};
