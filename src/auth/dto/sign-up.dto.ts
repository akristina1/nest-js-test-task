import { IsEmail, IsNotEmpty, MinLength, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SignUpDto {
  @IsNotEmpty({ message: 'First name is required' })
  @MaxLength(100, { message: 'First name must be less than 100 characters' })
  @ApiProperty({ description: 'The First name of the user' })
  first_name: string;

  @IsNotEmpty({ message: 'Last name is required' })
  @MaxLength(100, { message: 'Last name must be less than 100 characters' })
  @ApiProperty({ description: 'The last name of the user' })
  last_name: string;

  @IsNotEmpty({ message: 'Email is required' })
  @IsEmail({}, { message: 'Invalid email format' })
  @ApiProperty({ description: 'The email of the user' })
  email: string;

  @IsNotEmpty({ message: 'Password is required' })
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  @ApiProperty({ description: 'The password of the user' })
  password: string;
}
