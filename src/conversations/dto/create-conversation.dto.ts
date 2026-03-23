import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class CreateConversationDto {
  @ApiProperty({
    description: 'Optional initial note for the conversation',
    required: false,
  })
  @IsOptional()
  @IsString()
  initialMessage?: string;
}