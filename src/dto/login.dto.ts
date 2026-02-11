import { IsEmail, IsNotEmpty, IsString, Matches } from 'class-validator';

export class LoginDTO {
  @IsString()
  @IsNotEmpty()
  @IsEmail()
  email: string | undefined;

  @IsString()
  @IsNotEmpty()
  password: string | undefined;
}
