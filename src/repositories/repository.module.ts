import { Module } from '@nestjs/common';
import { UserRepository } from './user.repository';
import { User } from '../entities/user.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  providers: [UserRepository],
  exports: [UserRepository],
})
// eslint-disable-next-line prettier/prettier
export class RepositoryModule { }
