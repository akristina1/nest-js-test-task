import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateArticleDto {
  @ApiProperty({
    description: 'The title of the article',
    example: 'Introduction to NestJS',
  })
  @IsString()
  @IsNotEmpty({ message: 'Title is required' })
  title: string;

  @ApiProperty({
    description: 'The description of the article',
    example: 'A detailed guide on how to get started with NestJS.',
  })
  @IsString()
  @IsNotEmpty({ message: 'Description is required' })
  description: string;
}
