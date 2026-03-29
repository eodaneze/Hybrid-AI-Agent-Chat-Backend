import { ApiProperty } from '@nestjs/swagger';
import { IsMongoId } from 'class-validator';

export class AddSubAgentDto {
  @ApiProperty({
    example: '65f1c2e9a1234567890abcd1',
    description: 'ID of the agent to add as sub-agent',
  })
  @IsMongoId()
  agentId: string;
}