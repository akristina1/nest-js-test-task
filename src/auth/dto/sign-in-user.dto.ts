import { IsEmail, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SignInUserDto {
  @IsNotEmpty({ message: 'Email is required' })
  @IsEmail({}, { message: 'Invalid email format' })
  @ApiProperty({ description: 'The email of the user' })
  email: string;

  @IsNotEmpty({ message: 'Password is required' })
  @ApiProperty({ description: 'The password of the user' })
  password: string;
}
