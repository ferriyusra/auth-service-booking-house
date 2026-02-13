import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum Role {
  ADMIN = 'admin',
  BOARDER = 'boarder',
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'varchar',
    unique: true,
    length: 36,
  })
  uuid: string;

  @Column({
    type: 'varchar',
    length: 100,
  })
  name: string;

  @Column({
    type: 'varchar',
    unique: true,
    length: 100,
  })
  email: string;

  @Column()
  password: string;

  @Column({
    type: 'varchar',
    unique: true,
    length: 15,
  })
  phone_number: string;

  @Column({
    type: 'enum',
    enum: Role,
    default: Role.BOARDER,
  })
  role: Role;

  @Column()
  photo: string;

  @Column({
    type: 'text',
    nullable: true,
  })
  refresh_token: string;

  @Column({
    nullable: true,
  })
  refresh_token_expired_at: Date;

  @CreateDateColumn({
    name: 'created_at',
  })
  created_at: Date;

  @UpdateDateColumn({
    name: 'updated_at',
  })
  updated_at: Date;
}
