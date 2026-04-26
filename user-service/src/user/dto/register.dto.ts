import { IsEmail, IsNotEmpty, MinLength } from 'class-validator';

export class RegisterDto {
  @IsNotEmpty()
  first_name!: string;

  @IsNotEmpty()
  last_name!: string;

  @IsEmail()
  email!: string;

  @MinLength(6)
  password!: string;
}