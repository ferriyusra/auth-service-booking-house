import { Seeder } from 'typeorm-extension';
import { DataSource } from 'typeorm';
import { Role, User } from '../../entities/user.entity';
import { randomUUID } from 'crypto';
import * as bcrypt from 'bcryptjs';

export default class UserSeed implements Seeder {
  public async run(dataSource: DataSource): Promise<void> {
    const repo = dataSource.getRepository(User);
    const data = {
      uuid: randomUUID(),
      name: 'Administrator',
      email: 'admin@gmail.com',
      password: bcrypt.hashSync('admin123', 10),
      role: Role.ADMIN,
      phone_number: '089134876523',
      photo:
        'https://images.unsplash.com/photo-1770663629791-1fc3d14017dc?q=80&w=774&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    };

    await repo.upsert(data, ['email']);
  }
}
