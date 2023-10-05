import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import * as process from 'process';

export const typeORMConfig: TypeOrmModuleOptions = {
  type: 'mysql',
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT),
  username: process.env.USERNAME,
  password: process.env.PASSWORD,
  database: process.env.DB,
  entities: ['dist/**/*.entity{.ts,.js}'],
  synchronize: true,

  cache: {
    type: 'redis',
    options: {
      host: process.env.REDIS_HOST,
      port: parseInt(process.env.REDIS_PORT),
    },
  },
};
