import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional } from 'class-validator';
import { SenderType } from '../schemas/message.schema';

export class CreateMessageDto {
  @ApiProperty({ description: 'ID of the conversation', example: '64f2c123ab...' })
  @IsString()
  @IsNotEmpty()
  conversationId: string;

  @ApiProperty({ description: 'Message content', example: 'Hello there!' })
  @IsString()
  @IsNotEmpty()
  message: string;

  @ApiProperty({
    description: 'Sender type',
    example: SenderType.USER,
    enum: SenderType,
    required: false,
  })
  @IsOptional()
  @IsString()
  senderType?: SenderType; // optional: defaults to USER if not provided
}