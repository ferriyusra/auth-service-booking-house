import { IsEmail, IsNotEmpty, IsString, Matches } from 'class-validator';

export class RegisterDTO {
  @IsString()
  @IsNotEmpty()
  @Matches(/^[a-zA-Z\s]+$/)
  name: string | undefined;

  @IsString()
  @IsNotEmpty()
  @IsEmail()
  email: string | undefined;

  @IsString()
  @IsNotEmpty()
  password: string | undefined;

  @IsString()
  @IsNotEmpty()
  phone_number?: string;
}
