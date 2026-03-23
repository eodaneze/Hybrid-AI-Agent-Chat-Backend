import { IsEmail, IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({ required: true, example: 'John Deo' })
  @IsNotEmpty()
  @IsEmail()
  name: string;

  @ApiProperty({ required: true, example: 'user@gmail.com' })
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty({ required: true, example: '12345' })
  @IsNotEmpty()
  @IsString()
  password: string;
}
