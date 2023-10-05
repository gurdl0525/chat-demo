import { typeORMConfig } from '../global/config/typeorm.config';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../domain/auth/module/auth.module';
import { ConfigModule } from '@nestjs/config';
import { UserModule } from '../domain/user/module/user.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
    }),
    TypeOrmModule.forRoot(typeORMConfig),
    AuthModule,
    UserModule,
  ],
})
export class AppModule {}
