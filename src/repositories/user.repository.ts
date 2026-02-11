import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Role, User } from 'src/entities/user.entity';
import { DeepPartial, Not, Repository, UpdateResult } from 'typeorm';

@Injectable()
export class UserRepository {
  constructor(
    @InjectRepository(User)
    private readonly repository: Repository<User>,
  ) { }



  public async findByEmail(email: string): Promise<User | null> {
    return this.repository.findOne({ where: { email } });
  }

  public async findByPhoneNumber(phoneNumber: string): Promise<User | null> {
    return this.repository.findOne({ where: { phone_number: phoneNumber } });
  }

  public async findByUuid(uuid: string): Promise<User | null> {
    return this.repository.findOne({ where: { uuid } });
  }

  public async findByRefreshToken(token: string): Promise<User | null> {
    return this.repository.findOne({ where: { refresh_token: token } });
  }

  public findAdmin(): Promise<User | null> {
    return this.repository.findOne({ where: { role: Role.ADMIN } });
  }

  public async existEmailForOtherUser(
    email: string,
    uuid: string,
  ): Promise<boolean> {
    const count = await this.repository.count({
      where: { email: email, uuid: Not(uuid) },
    });
    return count > 0;
  }

  public async existPhoneNumberForOtherUser(
    phoneNumber: string,
    uuid: string,
  ): Promise<boolean> {
    const count = await this.repository.count({
      where: { phone_number: phoneNumber, uuid: Not(uuid) },
    });
    return count > 0;
  }

  public async create(data: DeepPartial<User>): Promise<User> {
    const user = this.repository.create(data);
    return this.repository.save(user);
  }

  public async update(
    uuid: string,
    data: DeepPartial<User>,
  ): Promise<UpdateResult> {
    return await this.repository.update({ uuid }, data);
  }
}
