import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './strategies/jwt.strategy';
import { PassportModule } from '@nestjs/passport';
import { RepositoryModule } from '../../repositories/repository.module';
import { UtilModule } from '../../utils/util.module';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    PassportModule,
    RepositoryModule,
    UtilModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'default_secret_key',
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
})
// eslint-disable-next-line prettier/prettier
export class AuthModule { }
