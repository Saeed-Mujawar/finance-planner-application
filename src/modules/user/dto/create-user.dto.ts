import { IsString, IsEmail, IsNotEmpty, MinLength } from 'class-validator';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @IsString()
  @IsNotEmpty()
  lastName: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @MinLength(4) 
  password: string;
}


// {
//   "firstName": "John",
//   "lastName": "Doe",
//   "email": "john.doe@example.com",
//   "password": "pass1234"
// }
