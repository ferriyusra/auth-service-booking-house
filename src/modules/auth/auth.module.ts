import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './strategies/jwt.strategy';
import { PassportModule } from '@nestjs/passport';
import { RepositoryModule } from 'src/repositories/repository.module';
import { UtilModule } from 'src/utils/util.module';
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
export class AuthModule { }
