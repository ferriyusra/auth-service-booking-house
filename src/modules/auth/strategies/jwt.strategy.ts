import { Injectable } from '@nestjs/common';
import { IAuthUserPayload } from '../../../interfaces/auth.interface';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

type JwtPayload = {
  sub: string;
  email: string;
  name: string;
  data?: IAuthUserPayload;
  role?: 'admin | boarder';
};

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'default_secret_key',
    });
  }

  validate(payload: JwtPayload) {
    return {
      uuid: payload.sub,
      email: payload.email,
      name: payload.name,
      role: payload.role,
      phone_number: payload.data?.phone_number,
      photot: payload.data?.photo,
    };
  }
}
