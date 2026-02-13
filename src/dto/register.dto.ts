import { IsEmail, IsNotEmpty, IsString, Matches } from 'class-validator';

export class RegisterDTO {
  @IsString()
  @IsNotEmpty()
  @Matches(/^[a-zA-Z\s]+$/)
  name: string;

  @IsString()
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsString()
  @IsNotEmpty()
  password: string;

  @IsString()
  @IsNotEmpty()
  phone_number?: string;
}
