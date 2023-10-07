import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import process from 'process';
import { RedisModuleOptions } from '@liaoliaots/nestjs-redis';

export const typeORMConfig: TypeOrmModuleOptions = {
  type: 'mysql',
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  username: process.env.USERNAME,
  password: process.env.PASSWORD,
  database: process.env.DB,
  entities: ['dist/**/*.entity{.ts,.js}'],
  synchronize: true,
  logging: true,
  autoLoadEntities: true,
  timezone: 'Asia/Seoul',
};

export const redisConfig: RedisModuleOptions = {
  readyLog: true,
  config: {
    host: process.env.REDIS_HOST,
    port: Number(process.env.REDIS_PORT),
  },
};
