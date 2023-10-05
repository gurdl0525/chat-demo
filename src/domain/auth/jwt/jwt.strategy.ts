import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import * as process from 'process';
import { AuthService } from '../service/auth.service';
import { Request } from 'express';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.SECRET_KEY,
    });
  }
  async validate(req: Request, payload: Payload) {
    if (!this.authService.compareTokenExpiration(payload.exp)) {
      return this.authService.findOneBySub(payload.sub);
    } else {
      throw new UnauthorizedException('Access token has been expired.');
    }
  }
}
export type Payload = {
  sub: string;
  exp: number;
};
